// Telangana SCERT Class 1 — English ("My English World - Class I"). Original teaching aligned to the official
// chapter list (src/content/ts/books.ts, syllabus.json). We teach the THEMES of each unit in our own words; textbook
// stories, songs and pictures are never reproduced. Rhymes are either original WonderLab rhymes or traditional
// public-domain nursery rhymes. Telugu (te) is a helping translation for Telugu-speaking children — needs
// native-speaker review.
import { tp, ex, p, tip, keys, photo, L, choose, pictures, matching, ordering, tapAll, range, type USpec, type OSpec, type ExSpec, type TSpec } from '../../lib/kit';
import type { Block, Localized, VisualSpec } from '../../../shared/content';
import type { Rng } from '../../../shared/grading';
import { tsSrc } from '../books';

type Lz = Localized;
/** A picture word: [emoji ('' = no picture), English word, Telugu meaning]. */
type W = [emoji: string, en: string, te: string];
/** A letter: capital, the Telugu sound that is closest, and words that begin with it. */
interface Let { c: string; te: string; w: W[] }

const emo = (e: string): VisualSpec => ({ kind: 'emoji', text: e });
const an = (w: string) => (/^[aeiou]/i.test(w) ? `an ${w}` : `a ${w}`);
const pair = (c: string) => `${c} ${c.toLowerCase()}`;
/** Picks n distinct items, skipping `not`. */
const others = <X>(r: Rng, pool: readonly X[], not: X, n: number) => r.shuffle(pool.filter((x) => x !== not)).slice(0, n);

const TRY = L('Good try! Let us look again together.', 'మంచి ప్రయత్నం! మళ్ళీ కలిసి చూద్దాం.');
const SAY = L('Say each word aloud slowly.', 'ప్రతి పదాన్ని మెల్లగా గట్టిగా చెప్పు.');

// ---------------- practice factories (every text has en + te) ----------------

/** Picture shown; tap its English name. */
function whatIs(key: string, words: W[], hint: Lz, d: 1 | 2 | 3 = 1): TSpec {
  const pool = words.filter((w) => w[0]);
  return tp(key, (r) => {
    const a = r.pick(pool);
    const wrong = others(r, words, a, 2);
    return {
      type: 'mcq', prompt: L('What is this? Tap its English name.', 'ఇది ఏమిటి? దాని ఇంగ్లీషు పేరును నొక్కు.'), visual: emo(a[0]),
      ...choose(r, a[1], wrong.map((w) => w[1]), 3),
      hints: [hint, L(`In Telugu it is "${a[2]}". Its English name starts with "${a[1][0].toUpperCase()}".`, `తెలుగులో ఇది "${a[2]}". దీని ఇంగ్లీషు పేరు "${a[1][0].toUpperCase()}" తో మొదలవుతుంది.`)],
      mistakes: [{ when: 'wrong', explain: L(`Good try! This is ${an(a[1])} — say it with me: "${a[1]}".`, `మంచి ప్రయత్నం! ఇది ${a[2]} — నాతో కలిసి చెప్పు: "${a[1]}".`) }],
      solution: [L(`This is ${an(a[1])}. ${a[0]} = ${a[1]}`, `ఇది ${a[2]}. ఇంగ్లీషులో "${a[1]}".`)],
    };
  }, d);
}

/** Listen to a word and tap its picture. */
function listenTap(key: string, words: W[], hint: Lz, d: 1 | 2 | 3 = 1): TSpec {
  const pool = words.filter((w) => w[0]);
  return tp(key, (r) => {
    const a = r.pick(pool);
    const wrong = others(r, pool, a, 2);
    return {
      type: 'spoken', prompt: L(`Listen and tap the picture: "${a[1]}"`, `విని బొమ్మను నొక్కు: "${a[1]}" (${a[2]})`), say: L(a[1]),
      ...pictures(r, { label: a[1], visual: emo(a[0]) }, wrong.map((w) => ({ label: w[1], visual: emo(w[0]) }))),
      hints: [hint, L(`"${a[1]}" means "${a[2]}" in Telugu.`, `"${a[1]}" అంటే తెలుగులో "${a[2]}".`)],
      mistakes: [{ when: 'wrong', explain: L(`Nice try! "${a[1]}" is this one: ${a[0]}`, `మంచి ప్రయత్నం! "${a[1]}" అంటే ఇది: ${a[0]}`) }],
      solution: [L(`${a[0]} is ${an(a[1])}.`, `${a[0]} — ${a[2]} — "${a[1]}".`)],
    };
  }, d);
}

/** Match pictures (left) to English words (right). */
function matchWords(key: string, words: W[], hint: Lz, d: 1 | 2 | 3 = 2): TSpec {
  const pool = words.filter((w) => w[0]);
  return tp(key, (r) => {
    const set = r.shuffle(pool).slice(0, 4);
    const m = matching(r, set.map((w) => [w[0], w[1]] as [string, string]));
    return {
      type: 'match', prompt: L(`Match each picture to its word: ${set.map((w) => w[0]).join(' ')}`, `ప్రతి బొమ్మను దాని పదంతో జత చేయి: ${set.map((w) => w[0]).join(' ')}`), ...m,
      hints: [hint, L('Start with the picture you know best.', 'నీకు బాగా తెలిసిన బొమ్మతో మొదలుపెట్టు.')],
      mistakes: [{ when: 'wrong', explain: L('One pair is mixed up. Say each picture name and find its word.', 'ఒక జత తప్పుగా ఉంది. ప్రతి బొమ్మ పేరు చెప్పి దాని పదం వెతుకు.') }],
      solution: set.map((w) => L(`${w[0]} → ${w[1]}`, `${w[0]} → ${w[1]} (${w[2]})`)),
    };
  }, d);
}

/** [question, correct, wrong options, hint, why] — all questions/hints/why bilingual; options are English. */
type MQ = [q: Lz, a: string | Lz, w: (string | Lz)[], hint: Lz, why: Lz];
function mcq(key: string, bank: MQ[], hint: Lz, d: 1 | 2 | 3 = 1, type: 'mcq' | 'spoken' = 'mcq'): TSpec {
  if (bank.length < 5) throw new Error(`${key}: needs >= 5 questions`);
  return tp(key, (r) => {
    const [q, a, w, h1, why] = r.pick(bank);
    const al = typeof a === 'string' ? L(a) : a;
    return {
      type, prompt: q, ...choose(r, a, w, 3), hints: [hint, h1],
      mistakes: [{ when: 'wrong', explain: L(`${TRY.en} ${why.en}`, `${TRY.te} ${why.te}`) }],
      solution: [L(`Answer: ${al.en}`, `జవాబు: ${al.te ?? al.en}`), why],
    };
  }, d);
}

/** Put English words in order to make a sentence. [words, Telugu meaning]. */
function sentence(key: string, bank: [string[], string][], hint: Lz, d: 1 | 2 | 3 = 2): TSpec {
  if (bank.length < 5) throw new Error(`${key}: needs >= 5 sentences`);
  bank.forEach(([s]) => { if (new Set(s).size !== s.length) throw new Error(`${key}: repeated word in ${s.join(' ')}`); });
  return tp(key, (r) => {
    const [seq, te] = r.pick(bank);
    const said = seq.join(' ');
    return {
      type: 'order', prompt: L(`Put the words in order to make a sentence. (It means: ${te})`, `పదాలను సరైన క్రమంలో పెట్టి వాక్యం చేయి. (అర్థం: ${te})`), ...ordering(r, seq),
      hints: [hint, L(`The sentence begins with "${seq[0]}" — a capital letter starts a sentence.`, `వాక్యం "${seq[0]}" తో మొదలవుతుంది — వాక్యం పెద్ద అక్షరంతో మొదలవుతుంది.`), L(`It ends with "${seq[seq.length - 1]}".`, `చివరి పదం "${seq[seq.length - 1]}".`)],
      mistakes: [{ when: 'wrong', explain: L('Almost! Read your sentence aloud. Does it sound right? Start with the word that has a capital letter.', 'దాదాపు సరైంది! నీ వాక్యాన్ని గట్టిగా చదువు. సరిగ్గా వినిపిస్తోందా? పెద్ద అక్షరం ఉన్న పదంతో మొదలుపెట్టు.') }],
      solution: [L(said, `${said} — ${te}`)],
    };
  }, d);
}

/** Tap all that fit. pool: [English label, ok]. */
function tapSome(key: string, prompt: Lz, pool: [string, boolean][], why: Lz, hint: Lz, d: 1 | 2 | 3 = 2): TSpec {
  const yes = pool.find((x) => x[1])!, no = pool.find((x) => !x[1])!;
  return tp(key, (r) => {
    const pick = r.shuffle(pool).slice(0, 5);
    if (!pick.some((x) => x[1])) pick[0] = yes;
    if (!pick.some((x) => !x[1])) pick[4] = no;
    const k = pick.filter((x) => x[1]).length;
    const right = pick.filter((x) => x[1]).map((x) => x[0]).join(', ');
    return {
      type: 'tap', prompt, ...tapAll(r, pick.map(([label, ok]) => ({ label, ok }))),
      hints: [hint, L(`There ${k === 1 ? 'is 1 right answer' : `are ${k} right answers`}.`, `ఇందులో ${k} సరైన జవాబులు ఉన్నాయి.`)],
      mistakes: [{ when: 'wrong', explain: L(`Check each one by itself. ${why.en}`, `ఒక్కొక్కటి విడిగా చూడు. ${why.te}`) }],
      solution: [L(`Right: ${right}.`, `సరైనవి: ${right}.`), why],
    };
  }, d);
}

// ---------------- phonics factories ----------------

/** Two different letters whose nearest Telugu sound is the same (C/K, V/W, J/Z, A/U) are never offered together. */
const sameSound = (a: Let, b: Let) => a !== b && a.te[0] === b.te[0];

/** Which word begins with this letter? */
function begins(key: string, letters: Let[], extra: Let[] = []): TSpec {
  const all = [...letters, ...extra];
  return tp(key, (r) => {
    const t = r.pick(letters);
    const a = r.pick(t.w);
    const wrong = others(r, all.filter((l) => !sameSound(l, t)), t, 2).map((l) => r.pick(l.w));
    const vis = { correct: a[0] ? emo(a[0]) : undefined, wrong: wrong.map((w) => (w[0] ? emo(w[0]) : undefined)) };
    return {
      type: 'mcq', prompt: L(`Which word begins with ${pair(t.c)}?`, `${pair(t.c)} (${t.te}) శబ్దంతో మొదలయ్యే పదం ఏది?`),
      ...choose(r, a[1], wrong.map((w) => w[1]), 3, vis),
      hints: [SAY, L(`${t.c} says "${t.te}" — listen for that sound at the very start.`, `${t.c} "${t.te}" అని పలుకుతుంది — మొదటి శబ్దాన్ని జాగ్రత్తగా విను.`)],
      mistakes: [{ when: 'wrong', explain: L(`Good try! Look at the first letter of each word. "${a[1]}" starts with ${t.c.toLowerCase()}.`, `మంచి ప్రయత్నం! ప్రతి పదం మొదటి అక్షరం చూడు. "${a[1]}" ${t.c.toLowerCase()} తో మొదలవుతుంది.`) }],
      solution: [L(`${t.c} for ${a[1]}! ${a[0]}`, `${t.c} అంటే ${a[1]} (${a[2]})! ${a[0]}`)],
    };
  });
}

/** Picture shown: which letter does its name begin with? */
function firstLetter(key: string, letters: Let[]): TSpec {
  const pool = letters.flatMap((l) => l.w.filter((w) => w[0]).map((w) => [l, w] as const));
  return tp(key, (r) => {
    const [t, a] = r.pick(pool);
    const wrong = others(r, letters.filter((l) => !sameSound(l, t)), t, 2);
    return {
      type: 'mcq', prompt: L('Say the name of the picture. Which letter does it begin with?', 'బొమ్మ పేరు చెప్పు. అది ఏ అక్షరంతో మొదలవుతుంది?'), visual: emo(a[0]),
      ...choose(r, pair(t.c), wrong.map((l) => pair(l.c)), 3),
      hints: [L(`This is ${an(a[1])} (${a[2]}).`, `ఇది ${a[2]} — ఇంగ్లీషులో "${a[1]}".`), L(`Say "${a[1]}" slowly. What is the first sound?`, `"${a[1]}" ని మెల్లగా చెప్పు. మొదటి శబ్దం ఏమిటి?`)],
      mistakes: [{ when: 'wrong', explain: L(`Nice try! "${a[1]}" starts with the "${t.te}" sound — that is ${t.c}.`, `మంచి ప్రయత్నం! "${a[1]}" "${t.te}" శబ్దంతో మొదలవుతుంది — అదే ${t.c}.`) }],
      solution: [L(`${a[1]} begins with ${pair(t.c)}.`, `${a[1]} (${a[2]}) ${pair(t.c)} తో మొదలవుతుంది.`)],
    };
  });
}

/** Match capital letters to small letters. */
function capSmall(key: string, letters: Let[]): TSpec {
  return tp(key, (r) => {
    const set = r.shuffle(letters).slice(0, 3);
    const m = matching(r, set.map((l) => [l.c, l.c.toLowerCase()] as [string, string]));
    return {
      type: 'match', prompt: L(`Match the big letter to its small letter: ${set.map((l) => l.c).join(' ')}`, `పెద్ద అక్షరాన్ని దాని చిన్న అక్షరంతో జత చేయి: ${set.map((l) => l.c).join(' ')}`), ...m,
      hints: [L('Every letter has a big (capital) shape and a small shape.', 'ప్రతి అక్షరానికి పెద్ద రూపం, చిన్న రూపం ఉంటాయి.'), L('Trace the shape in the air with your finger.', 'వేలితో గాలిలో అక్షరం రాసి చూడు.')],
      mistakes: [{ when: 'wrong', explain: L('One pair is mixed up. Say the letter name, then find its small friend.', 'ఒక జత తప్పు. అక్షరం పేరు చెప్పి దాని చిన్న స్నేహితుడిని వెతుకు.') }],
      solution: set.map((l) => L(`${l.c} → ${l.c.toLowerCase()}`, `${l.c} → ${l.c.toLowerCase()}`)),
    };
  }, 2);
}

/** Intro blocks for a group of letters. */
const letterIntro = (letters: Let[], show: string): Block[] => [
  p('Every letter has a name and a sound. When we say a word slowly, the first sound tells us its first letter.', 'ప్రతి అక్షరానికి ఒక పేరు, ఒక శబ్దం ఉంటాయి. పదాన్ని మెల్లగా చెబితే, మొదటి శబ్దం మొదటి అక్షరాన్ని చెబుతుంది.'),
  photo(show, L(`${letters.map((l) => l.c).join(', ')} — let us meet these letters!`, `${letters.map((l) => l.c).join(', ')} — ఈ అక్షరాలను కలుద్దాం!`)),
  ...letters.map((l) => {
    const w = l.w.filter((x) => x[0]).slice(0, 3);
    const ws = (w.length ? w : l.w.slice(0, 3));
    return p(`${pair(l.c)} — "${l.te}" sound: ${ws.map((x) => `${x[1]} ${x[0]}`.trim()).join(', ')}.`, `${pair(l.c)} — "${l.te}" శబ్దం: ${ws.map((x) => `${x[1]} (${x[2]})`).join(', ')}.`);
  }),
  tip('Say it, then trace it: draw the big letter and the small letter in the air with your finger.', 'చెప్పు, తర్వాత రాయి: పెద్ద అక్షరం, చిన్న అక్షరం వేలితో గాలిలో రాయి.'),
];

const unit = (n: number, title: Lz, objectives: OSpec[]): USpec => ({
  id: `ts1.en.ch${n}`, subject: 'english', title, source: tsSrc(1, 'english', n), objectives,
});
const o = (id: string, title: Lz, intro: Block[], examples: ExSpec[], practice: TSpec[]): OSpec => ({ id, title, prereqs: [], intro, examples, practice });

// ---------------- the alphabet (spread over the units) ----------------
const A: Let = { c: 'A', te: 'అ / యా', w: [['🍎', 'apple', 'ఆపిల్'], ['🐜', 'ant', 'చీమ'], ['', 'axe', 'గొడ్డలి']] };
const B: Let = { c: 'B', te: 'బ', w: [['⚽', 'ball', 'బంతి'], ['🍌', 'banana', 'అరటి పండు'], ['🚌', 'bus', 'బస్సు'], ['👶', 'baby', 'పాపాయి'], ['🔔', 'bell', 'గంట']] };
const C: Let = { c: 'C', te: 'క', w: [['🐱', 'cat', 'పిల్లి'], ['🐄', 'cow', 'ఆవు'], ['☕', 'cup', 'కప్పు'], ['🚗', 'car', 'కారు'], ['🥕', 'carrot', 'క్యారెట్']] };
const D: Let = { c: 'D', te: 'డ', w: [['🐶', 'dog', 'కుక్క'], ['🦆', 'duck', 'బాతు'], ['🥁', 'drum', 'డప్పు'], ['🚪', 'door', 'తలుపు'], ['🦌', 'deer', 'జింక']] };
const E: Let = { c: 'E', te: 'ఎ', w: [['🥚', 'egg', 'గుడ్డు'], ['🐘', 'elephant', 'ఏనుగు'], ['', 'engine', 'ఇంజను']] };
const F: Let = { c: 'F', te: 'ఫ', w: [['🐟', 'fish', 'చేప'], ['🦊', 'fox', 'నక్క'], ['🌼', 'flower', 'పువ్వు'], ['🪶', 'feather', 'ఈక'], ['🔥', 'fire', 'మంట']] };
const G: Let = { c: 'G', te: 'గ', w: [['🐐', 'goat', 'మేక'], ['🍇', 'grapes', 'ద్రాక్ష'], ['🎁', 'gift', 'బహుమతి'], ['👧', 'girl', 'అమ్మాయి']] };
const H: Let = { c: 'H', te: 'హ', w: [['🐔', 'hen', 'కోడి'], ['🐎', 'horse', 'గుర్రం'], ['🏠', 'house', 'ఇల్లు'], ['🎩', 'hat', 'టోపీ'], ['🍯', 'honey', 'తేనె']] };
const I: Let = { c: 'I', te: 'ఇ', w: [['🐞', 'insect', 'పురుగు'], ['🖋️', 'ink', 'సిరా'], ['', 'igloo', 'మంచు ఇల్లు']] };
const J: Let = { c: 'J', te: 'జ', w: [['', 'jug', 'కూజా'], ['', 'jam', 'జామ్'], ['', 'jeep', 'జీపు'], ['', 'jump', 'దూకు']] };
const K: Let = { c: 'K', te: 'క', w: [['🪁', 'kite', 'గాలిపటం'], ['🔑', 'key', 'తాళం చెవి'], ['👑', 'king', 'రాజు']] };
const Lt: Let = { c: 'L', te: 'ల', w: [['🦁', 'lion', 'సింహం'], ['🍃', 'leaf', 'ఆకు'], ['🪔', 'lamp', 'దీపం'], ['🔒', 'lock', 'తాళం']] };
const M: Let = { c: 'M', te: 'మ', w: [['🥭', 'mango', 'మామిడి పండు'], ['🐒', 'monkey', 'కోతి'], ['🌙', 'moon', 'చందమామ'], ['🐭', 'mouse', 'ఎలుక'], ['🥛', 'milk', 'పాలు']] };
const N: Let = { c: 'N', te: 'న', w: [['🪺', 'nest', 'గూడు'], ['🥜', 'nut', 'గింజ'], ['👃', 'nose', 'ముక్కు']] };
const O: Let = { c: 'O', te: 'ఆ', w: [['🐙', 'octopus', 'ఆక్టోపస్'], ['🍊', 'orange', 'నారింజ'], ['🐃', 'ox', 'ఎద్దు']] };
const P: Let = { c: 'P', te: 'ప', w: [['🦜', 'parrot', 'చిలుక'], ['🖊️', 'pen', 'పెన్ను'], ['🦚', 'peacock', 'నెమలి'], ['🐖', 'pig', 'పంది'], ['🍍', 'pineapple', 'అనాస పండు']] };
const Q: Let = { c: 'Q', te: 'క్వ', w: [['❓', 'question', 'ప్రశ్న'], ['🤫', 'quiet', 'నిశ్శబ్దం'], ['', 'queen', 'రాణి']] };
const R: Let = { c: 'R', te: 'ర', w: [['🐇', 'rabbit', 'కుందేలు'], ['🐀', 'rat', 'ఎలుక'], ['🌧️', 'rain', 'వాన'], ['🌈', 'rainbow', 'ఇంద్రధనుస్సు']] };
const S: Let = { c: 'S', te: 'స', w: [['☀️', 'sun', 'సూర్యుడు'], ['⭐', 'star', 'నక్షత్రం'], ['🚢', 'ship', 'ఓడ'], ['🧦', 'sock', 'మేజోడు']] };
const T: Let = { c: 'T', te: 'ట', w: [['🐅', 'tiger', 'పులి'], ['🌳', 'tree', 'చెట్టు'], ['🍅', 'tomato', 'టమాటా'], ['🚆', 'train', 'రైలు'], ['🐢', 'tortoise', 'తాబేలు']] };
const U: Let = { c: 'U', te: 'అ', w: [['☂️', 'umbrella', 'గొడుగు'], ['🔼', 'up', 'పైకి'], ['', 'under', 'కింద']] };
const V: Let = { c: 'V', te: 'వ', w: [['🚐', 'van', 'వ్యాను'], ['', 'vase', 'పూల కుండీ'], ['', 'vest', 'బనియన్']] };
const Wl: Let = { c: 'W', te: 'వ', w: [['⌚', 'watch', 'గడియారం'], ['💧', 'water', 'నీళ్ళు'], ['🪟', 'window', 'కిటికీ'], ['🍉', 'watermelon', 'పుచ్చకాయ']] };
const Y: Let = { c: 'Y', te: 'య', w: [['🟡', 'yellow', 'పసుపు రంగు'], ['✅', 'yes', 'అవును'], ['', 'yak', 'యాక్']] };
const Z: Let = { c: 'Z', te: 'జ', w: [['🦓', 'zebra', 'జీబ్రా'], ['🤐', 'zip', 'జిప్పు'], ['', 'zero', 'సున్నా']] };
/** X is special: we hear it at the END of words (box, fox, six), so it never appears in the "begins with" games. */
const ALPHA: Let[] = [A, B, C, D, E, F, G, H, I, J, K, Lt, M, N, O, P, Q, R, S, T, U, V, Wl, Y, Z];

/** Standard phonics objective for a group of letters. */
function phonics(id: string, letters: Let[], show: string, examples: ExSpec[], extra: TSpec[] = [], note: Block[] = []): OSpec {
  const names = letters.map((l) => l.c).join(', ');
  const starts = letters.filter((l) => l.c !== 'X');
  const intro = letterIntro(starts, show);
  intro.splice(intro.length - 1, 0, ...note);
  return o(id, L(`Letters and sounds: ${names}`, `అక్షరాలు, శబ్దాలు: ${names}`), intro, examples, [
    begins('begins', starts, ALPHA.filter((l) => !letters.includes(l))),
    firstLetter('first', starts.filter((l) => l.w.some((w) => w[0]))),
    capSmall('case', letters),
    ...extra,
  ]);
}

// ============================================================ Unit 1 — Ammu and her family
const FAMILY: W[] = [
  ['👩', 'mother', 'అమ్మ'], ['👨', 'father', 'నాన్న'], ['👵', 'grandmother', 'అమ్మమ్మ / నానమ్మ'], ['👴', 'grandfather', 'తాతయ్య'],
  ['👧', 'sister', 'అక్క / చెల్లి'], ['👦', 'brother', 'అన్న / తమ్ముడు'], ['👶', 'baby', 'పాపాయి'],
];
const NUMW: [string, string][] = [['one', 'ఒకటి'], ['two', 'రెండు'], ['three', 'మూడు'], ['four', 'నాలుగు'], ['five', 'ఐదు'], ['six', 'ఆరు'], ['seven', 'ఏడు'], ['eight', 'ఎనిమిది'], ['nine', 'తొమ్మిది'], ['ten', 'పది']];
const COUNTABLE: W[] = [['🐿️', 'squirrels', 'ఉడుతలు'], ['🍎', 'apples', 'ఆపిల్ పండ్లు'], ['⭐', 'stars', 'నక్షత్రాలు'], ['🌼', 'flowers', 'పువ్వులు'], ['🎈', 'balloons', 'బెలూన్లు'], ['🐟', 'fish', 'చేపలు'], ['🥭', 'mangoes', 'మామిడి పండ్లు']];

const u1 = unit(1, L('Ammu and Her Family', 'అమ్ము, ఆమె కుటుంబం'), [
  o('ts1.en.family.words', L('My family: mother, father and more', 'నా కుటుంబం: అమ్మ, నాన్న ఇంకా'), [
    p('Meet Ammu! Ammu lives with her family. Let us learn the English names for the people in our family.', 'అమ్మును కలుద్దాం! అమ్ము తన కుటుంబంతో ఉంటుంది. మన కుటుంబంలోని వారిని ఇంగ్లీషులో ఏమంటారో నేర్చుకుందాం.'),
    photo('👩', L('This is my mother.', 'ఈమె మా అమ్మ — "This is my mother."')),
    p('mother 👩 · father 👨 · grandmother 👵 · grandfather 👴 · sister 👧 · brother 👦 · baby 👶', 'అమ్మ = mother · నాన్న = father · అమ్మమ్మ/నానమ్మ = grandmother · తాతయ్య = grandfather · అక్క/చెల్లి = sister · అన్న/తమ్ముడు = brother · పాపాయి = baby'),
    p('Sing and clap! (a WonderLab rhyme)\nMother, father, sister, me,\nWe are a happy family!\nGrandpa, grandma, baby too,\nHugs for all and kisses too!', 'పాడుతూ చప్పట్లు కొట్టు! (వండర్‌ల్యాబ్ పాట) — అమ్మ, నాన్న, అక్క, నేను — మేము సంతోషమైన కుటుంబం! తాత, అమ్మమ్మ, పాపాయి కూడా — అందరికీ కౌగిలింతలు!'),
    tip('Point to each person at home and say: "This is my mother." "This is my father."', 'ఇంట్లో ఒక్కొక్కరిని చూపిస్తూ చెప్పు: "This is my mother." "This is my father."'),
    keys(L('This is my ___. (ఈమె/ఇతను నా ___.)', 'This is my ___ = ఈమె/ఇతను నా ___'), L('One day Ammu saw a squirrel 🐿️ in the garden. She said, "Hello, little squirrel!"', 'ఒక రోజు అమ్ము తోటలో ఉడుతను చూసింది. "Hello, little squirrel!" అంది.')),
  ], [
    ex(L('👵 Who is this? Say it in English.', '👵 ఈమె ఎవరు? ఇంగ్లీషులో చెప్పు.'), [L('She is the mother of my mother or father.', 'ఆమె అమ్మకు లేదా నాన్నకు అమ్మ.'), L('In English we say "grandmother".', 'ఇంగ్లీషులో "grandmother" అంటాం.')], L('This is my grandmother.', 'This is my grandmother. (ఈమె మా అమ్మమ్మ.)'), emo('👵')),
    ex(L('How do we say "నాన్న" in English?', '"నాన్న" ను ఇంగ్లీషులో ఎలా అంటాం?'), [L('నాన్న is the man who takes care of us at home.', 'నాన్న ఇంట్లో మనల్ని చూసుకునే వ్యక్తి.'), L('The English word is "father".', 'ఇంగ్లీషు పదం "father".')], L('father — "This is my father."', 'father — "This is my father."'), emo('👨')),
  ], [
    whatIs('name', FAMILY, L('Who is in the picture? Think of your own family.', 'బొమ్మలో ఎవరు ఉన్నారు? నీ కుటుంబాన్ని గుర్తు చేసుకో.')),
    listenTap('listen', FAMILY, L('Listen to the word and look at each picture.', 'పదాన్ని విని ప్రతి బొమ్మను చూడు.')),
    matchWords('match', FAMILY, L('Say the Telugu name first, then find the English word.', 'ముందు తెలుగు పేరు చెప్పి, తర్వాత ఇంగ్లీషు పదం వెతుకు.')),
    sentence('say', [
      [['This', 'is', 'my', 'mother.'], 'ఈమె మా అమ్మ.'], [['This', 'is', 'my', 'father.'], 'ఇతను మా నాన్న.'],
      [['I', 'love', 'my', 'family.'], 'నేను నా కుటుంబాన్ని ప్రేమిస్తాను.'], [['My', 'name', 'is', 'Ammu.'], 'నా పేరు అమ్ము.'],
      [['She', 'is', 'my', 'sister.'], 'ఆమె నా అక్క/చెల్లి.'], [['He', 'is', 'my', 'brother.'], 'అతను నా అన్న/తమ్ముడు.'],
    ], L('Read the words aloud and listen for a sentence that makes sense.', 'పదాలను గట్టిగా చదివి అర్థమయ్యే వాక్యం వెతుకు.')),
  ]),
  o('ts1.en.family.numbers', L('Numbers in words: one to ten', 'పదాలలో అంకెలు: one నుండి ten వరకు'), [
    p('We can write numbers with digits (1, 2, 3) and with words (one, two, three). Let us count in English!', 'అంకెలను అంకెలుగా (1, 2, 3), పదాలుగా (one, two, three) రాయవచ్చు. ఇంగ్లీషులో లెక్కపెడదాం!'),
    photo('🐿️', L('One squirrel in Ammu’s garden. How many can you see?', 'అమ్ము తోటలో ఒక ఉడుత. నీకు ఎన్ని కనిపిస్తున్నాయి?')),
    p('1 one · 2 two · 3 three · 4 four · 5 five · 6 six · 7 seven · 8 eight · 9 nine · 10 ten', '1 ఒకటి · 2 రెండు · 3 మూడు · 4 నాలుగు · 5 ఐదు · 6 ఆరు · 7 ఏడు · 8 ఎనిమిది · 9 తొమ్మిది · 10 పది'),
    p('Say it with actions! (traditional rhyme)\nOne, two, buckle my shoe;\nThree, four, knock at the door;\nFive, six, pick up sticks;\nSeven, eight, lay them straight;\nNine, ten, a big fat hen!', 'చేతలతో పాడు! (పాత ఇంగ్లీషు పాట) — షూ బకిల్ పెట్టు, తలుపు తట్టు, పుల్లలు ఏరు, వరుసగా పెట్టు, పెద్ద కోడి!'),
    tip('Show the number on your fingers while you say the word.', 'పదం చెబుతూ వేళ్ళతో అంకెను చూపించు.'),
  ], [
    ex(L('How many apples? 🍎🍎🍎 Say the number word.', 'ఎన్ని ఆపిల్ పండ్లు? 🍎🍎🍎 అంకె పదాన్ని చెప్పు.'), [L('Count: 1, 2, 3.', 'లెక్క: 1, 2, 3.'), L('3 in words is "three".', '3 ని పదంలో "three" అంటాం.')], L('three apples', 'three apples (మూడు ఆపిల్ పండ్లు)'), { kind: 'objects', emoji: '🍎', count: 3 }),
    ex(L('Finish the rhyme: "Three, four, knock at the ___"', 'పాట పూర్తి చేయి: "Three, four, knock at the ___"'), [L('"four" and the missing word sound the same at the end.', '"four", ఖాళీ పదం చివర ఒకేలా వినిపిస్తాయి.'), L('We knock at the door.', 'మనం తలుపు (door) తడతాం.')], L('door', 'door (తలుపు)')),
  ], [
    tp('count', (r) => {
      const n = r.int(1, 10), t = r.pick(COUNTABLE);
      const [w, te] = NUMW[n - 1];
      const wrong = others(r, NUMW, NUMW[n - 1], 2).map((x) => x[0]);
      return {
        type: 'mcq', prompt: L(`How many ${t[1]}? Tap the number word.`, `ఎన్ని ${t[2]}? అంకె పదాన్ని నొక్కు.`), visual: { kind: 'objects', emoji: t[0], count: n },
        ...choose(r, w, wrong, 3),
        hints: [L('Touch each one as you count.', 'లెక్కపెడుతూ ఒక్కొక్కటి తాకు.'), L(`There are ${n}. Which word means ${n}?`, `మొత్తం ${n}. ${n} కి ఇంగ్లీషు పదం ఏది?`)],
        mistakes: [{ when: 'wrong', explain: L(`Good try! Count again: ${range(1, n).join(', ')}. ${n} is "${w}".`, `మంచి ప్రయత్నం! మళ్ళీ లెక్కపెట్టు: ${range(1, n).join(', ')}. ${n} అంటే "${w}".`) }],
        solution: [L(`${range(1, n).join(', ')} — ${n} = ${w}.`, `${range(1, n).join(', ')} — ${n} = ${w} (${te}).`)],
      };
    }),
    tp('word', (r) => {
      const n = r.int(1, 10);
      const [w, te] = NUMW[n - 1];
      const wrong = others(r, range(1, 10), n, 2);
      return {
        type: 'mcq', prompt: L(`Which number is "${w}"?`, `"${w}" అంటే ఏ అంకె?`), ...choose(r, String(n), wrong.map(String), 3),
        hints: [L('Count on your fingers: one, two, three…', 'వేళ్ళ మీద లెక్కపెట్టు: one, two, three…'), L(`"${w}" means ${te}.`, `"${w}" అంటే ${te}.`)],
        mistakes: [{ when: 'wrong', explain: L(`Nice try! Say the words in order until you reach "${w}".`, `మంచి ప్రయత్నం! "${w}" వచ్చే వరకు పదాలను వరుసగా చెప్పు.`) }],
        solution: [L(`"${w}" is ${n}.`, `"${w}" = ${n} (${te}).`)],
      };
    }),
    mcq('rhyme', [
      [L('Finish the rhyme: "One, two, buckle my ___"', 'పాట పూర్తి చేయి: "One, two, buckle my ___"'), 'shoe', ['hat', 'bag'], L('It rhymes with "two".', '"two" తో ప్రాస కలుస్తుంది.'), L('"two" and "shoe" rhyme.', '"two", "shoe" ప్రాస పదాలు.')],
      [L('Finish the rhyme: "Three, four, knock at the ___"', 'పాట పూర్తి చేయి: "Three, four, knock at the ___"'), 'door', ['tree', 'box'], L('It rhymes with "four".', '"four" తో ప్రాస కలుస్తుంది.'), L('"four" and "door" rhyme.', '"four", "door" ప్రాస పదాలు.')],
      [L('Finish the rhyme: "Five, six, pick up ___"', 'పాట పూర్తి చేయి: "Five, six, pick up ___"'), 'sticks', ['stones', 'cups'], L('It rhymes with "six".', '"six" తో ప్రాస కలుస్తుంది.'), L('"six" and "sticks" rhyme.', '"six", "sticks" ప్రాస పదాలు.')],
      [L('Finish the rhyme: "Seven, eight, lay them ___"', 'పాట పూర్తి చేయి: "Seven, eight, lay them ___"'), 'straight', ['down', 'here'], L('It rhymes with "eight".', '"eight" తో ప్రాస కలుస్తుంది.'), L('"eight" and "straight" rhyme.', '"eight", "straight" ప్రాస పదాలు.')],
      [L('Finish the rhyme: "Nine, ten, a big fat ___"', 'పాట పూర్తి చేయి: "Nine, ten, a big fat ___"'), 'hen', ['cat', 'dog'], L('It rhymes with "ten".', '"ten" తో ప్రాస కలుస్తుంది.'), L('"ten" and "hen" rhyme.', '"ten", "hen" ప్రాస పదాలు.')],
      [L('What comes after "four"?', '"four" తర్వాత ఏది వస్తుంది?'), 'five', ['three', 'seven'], L('Count: one, two, three, four, …', 'లెక్కపెట్టు: one, two, three, four, …'), L('After four comes five.', 'four తర్వాత five.')],
      [L('What comes before "ten"?', '"ten" ముందు ఏది వస్తుంది?'), 'nine', ['eight', 'six'], L('Count back from ten.', 'ten నుండి వెనక్కి లెక్కపెట్టు.'), L('Nine comes just before ten.', 'ten కి ముందు nine.')],
    ], L('Say the rhyme aloud and clap.', 'పాటను గట్టిగా పాడుతూ చప్పట్లు కొట్టు.')),
  ]),
  phonics('ts1.en.abc.ad', [A, B, C, D], '🍎', [
    ex(L('🍎 apple — which letter does it begin with?', '🍎 apple — ఇది ఏ అక్షరంతో మొదలవుతుంది?'), [L('Say "a-a-apple" slowly.', '"a-a-apple" అని మెల్లగా చెప్పు.'), L('The first sound is the A sound.', 'మొదటి శబ్దం A శబ్దం.')], L('A a — A for apple!', 'A a — A అంటే apple!'), emo('🍎')),
    ex(L('Which word begins with D: dog or cat?', 'D తో మొదలయ్యేది ఏది: dog లేదా cat?'), [L('D says "డ".', 'D "డ" అని పలుకుతుంది.'), L('"d-d-dog" starts with "డ"; "cat" starts with "క".', '"d-d-dog" "డ" తో, "cat" "క" తో మొదలవుతాయి.')], L('dog — D for dog!', 'dog — D అంటే dog!'), emo('🐶')),
  ]),
]);

// ============================================================ Unit 2 — Going to school
const VEHICLES: W[] = [
  ['🚌', 'bus', 'బస్సు'], ['🛺', 'auto', 'ఆటో'], ['🚲', 'bicycle', 'సైకిల్'], ['🚗', 'car', 'కారు'], ['🚆', 'train', 'రైలు'],
  ['⛵', 'boat', 'పడవ'], ['✈️', 'aeroplane', 'విమానం'], ['🚜', 'tractor', 'ట్రాక్టర్'], ['🚢', 'ship', 'ఓడ'], ['🚐', 'van', 'వ్యాను'],
];
const u2 = unit(2, L('Going to School', 'బడికి వెళ్దాం'), [
  o('ts1.en.go.vehicles', L('Vehicles: bus, auto, bicycle and more', 'వాహనాలు: బస్సు, ఆటో, సైకిల్ ఇంకా'), [
    p('Ammu goes to school every morning. Some children walk, some ride a bicycle, some go by bus or auto. Things that carry us from place to place are called vehicles.', 'అమ్ము రోజూ ఉదయం బడికి వెళ్తుంది. కొందరు నడిచి, కొందరు సైకిల్ మీద, కొందరు బస్సులో లేదా ఆటోలో వెళ్తారు. మనల్ని ఒక చోటు నుండి మరో చోటుకు తీసుకెళ్ళేవి వాహనాలు.'),
    photo('🚌', L('A school bus — "I go to school by bus."', 'బడి బస్సు — "I go to school by bus."')),
    p('On the road: bus 🚌 · auto 🛺 · car 🚗 · bicycle 🚲 · van 🚐\nOn rails: train 🚆\nOn water: boat ⛵ · ship 🚢\nIn the sky: aeroplane ✈️', 'రోడ్డు మీద: బస్సు, ఆటో, కారు, సైకిల్, వ్యాను · పట్టాల మీద: రైలు · నీటి మీద: పడవ, ఓడ · ఆకాశంలో: విమానం'),
    p('Sing with actions! (a WonderLab rhyme)\nBeep, beep, goes the bus,\nRing, ring, goes the bike,\nChoo, choo, goes the train —\nWhich one do you like?', 'చేతలతో పాడు! (వండర్‌ల్యాబ్ పాట) — బస్సు బీప్ బీప్, సైకిల్ రింగ్ రింగ్, రైలు చుక్ చుక్ — నీకు ఏది ఇష్టం?'),
    p('And a traditional rhyme — pretend to row!\nRow, row, row your boat,\nGently down the stream;\nMerrily, merrily, merrily, merrily,\nLife is but a dream.', 'పాత ఇంగ్లీషు పాట — పడవ నడుపుతున్నట్టు చేతులు ఆడించు! "Row, row, row your boat" — నీ పడవను మెల్లగా నడుపు.'),
    tip('Make the sound of each vehicle and let a friend guess it!', 'ఒక్కో వాహనం శబ్దం చేసి, నీ స్నేహితుడిని ఊహించమను!'),
  ], [
    ex(L('🛺 What is this? Say it in English.', '🛺 ఇది ఏమిటి? ఇంగ్లీషులో చెప్పు.'), [L('It has three wheels and takes people around town.', 'దీనికి మూడు చక్రాలు, ఊరంతా ప్రజలను తీసుకెళ్తుంది.'), L('We call it an auto (auto-rickshaw).', 'దీన్ని ఆటో (ఆటో-రిక్షా) అంటాం.')], L('This is an auto.', 'This is an auto. (ఇది ఆటో.)'), emo('🛺')),
    ex(L('Which vehicle goes on water: a boat or a car?', 'నీటి మీద వెళ్ళే వాహనం ఏది: పడవా, కారా?'), [L('A car needs a road.', 'కారుకు రోడ్డు కావాలి.'), L('A boat floats on water.', 'పడవ నీటి మీద తేలుతుంది.')], L('a boat ⛵', 'a boat — పడవ ⛵'), emo('⛵')),
  ], [
    whatIs('name', VEHICLES, L('How does it move — on the road, on water or in the sky?', 'అది ఎలా వెళ్తుంది — రోడ్డు మీద, నీటి మీద, ఆకాశంలో?')),
    listenTap('listen', VEHICLES, L('Listen to the word. Look at every picture before you tap.', 'పదాన్ని విను. నొక్కే ముందు ప్రతి బొమ్మనూ చూడు.')),
    tapSome('road', L('Tap the vehicles that go on the road.', 'రోడ్డు మీద వెళ్ళే వాహనాలను నొక్కు.'), [
      ['bus', true], ['car', true], ['auto', true], ['bicycle', true], ['van', true], ['tractor', true], ['boat', false], ['ship', false], ['aeroplane', false],
    ], L('Boats and ships go on water; an aeroplane flies in the sky.', 'పడవ, ఓడ నీటి మీద; విమానం ఆకాశంలో వెళ్తాయి.'), L('Picture each one. Does it have wheels on a road?', 'ప్రతిదాన్ని ఊహించు. దానికి రోడ్డు మీద తిరిగే చక్రాలు ఉన్నాయా?')),
    mcq('rhyme', [
      [L('Which one goes "choo, choo"?', '"చుక్ చుక్" అని వెళ్ళేది ఏది?'), 'train', ['bus', 'boat'], L('It runs on rails.', 'అది పట్టాల మీద నడుస్తుంది.'), L('A train goes "choo, choo" on the rails.', 'రైలు పట్టాల మీద "చుక్ చుక్" అంటుంది.')],
      [L('Which one goes "beep, beep"?', '"బీప్ బీప్" అనేది ఏది?'), 'bus', ['boat', 'kite'], L('Think of the rhyme: "Beep, beep, goes the ___".', 'పాట గుర్తు చేసుకో: "Beep, beep, goes the ___".'), L('The bus goes "beep, beep".', 'బస్సు "బీప్ బీప్" అంటుంది.')],
      [L('Which one goes "ring, ring"?', '"రింగ్ రింగ్" అనేది ఏది?'), 'bicycle', ['ship', 'train'], L('It has a little bell on the handle.', 'దాని హ్యాండిల్ మీద చిన్న గంట ఉంటుంది.'), L('A bicycle bell goes "ring, ring".', 'సైకిల్ గంట "రింగ్ రింగ్" అంటుంది.')],
      [L('Finish the rhyme: "Ring, ring, goes the bike, Choo, choo, goes the train — Which one do you ___?"', 'పాట పూర్తి చేయి: "… Which one do you ___?"'), 'like', ['eat', 'see'], L('It rhymes with "bike".', '"bike" తో ప్రాస కలుస్తుంది.'), L('"bike" and "like" rhyme.', '"bike", "like" ప్రాస పదాలు.')],
      [L('Finish the rhyme: "Row, row, row your ___"', 'పాట పూర్తి చేయి: "Row, row, row your ___"'), 'boat', ['bus', 'car'], L('We row it on water.', 'దాన్ని నీటిలో నడుపుతాం.'), L('We row a boat.', 'మనం పడవను నడుపుతాం (row a boat).')],
      [L('Which one flies in the sky?', 'ఆకాశంలో ఎగిరేది ఏది?'), 'aeroplane', ['auto', 'tractor'], L('Look up at the sky!', 'ఆకాశం వైపు చూడు!'), L('An aeroplane flies in the sky.', 'విమానం ఆకాశంలో ఎగురుతుంది.')],
    ], L('Make the sound and picture the vehicle.', 'ఆ శబ్దం చేసి వాహనాన్ని ఊహించు.')),
  ]),
  o('ts1.en.go.qa', L('Simple questions and answers', 'చిన్న ప్రశ్నలు, జవాబులు'), [
    p('When someone asks us a question, we answer in a short, clear sentence. Listen to the question word: What? How? Where?', 'ఎవరైనా ప్రశ్న అడిగితే చిన్న, స్పష్టమైన వాక్యంలో జవాబిస్తాం. ప్రశ్న పదం విను: What? (ఏమిటి?) How? (ఎలా?) Where? (ఎక్కడ?)'),
    photo('🙋', L('"What is your name?" — "My name is Ammu."', '"నీ పేరు ఏమిటి?" — "My name is Ammu."')),
    p('What is your name? — My name is Ammu.\nHow are you? — I am fine, thank you.\nHow do you go to school? — I go to school by bus.\nWhere are you going? — I am going to school.', 'నీ పేరు ఏమిటి? — నా పేరు అమ్ము. · ఎలా ఉన్నావు? — బాగున్నాను, ధన్యవాదాలు. · బడికి ఎలా వెళ్తావు? — బస్సులో వెళ్తాను. · ఎక్కడికి వెళ్తున్నావు? — బడికి వెళ్తున్నాను.'),
    tip('Play "ask and answer" with a friend: one asks, the other answers, then swap!', 'స్నేహితుడితో "అడుగు-చెప్పు" ఆట ఆడు: ఒకరు అడగాలి, మరొకరు చెప్పాలి, తర్వాత మారాలి!'),
  ], [
    ex(L('Ravi is asked: "What is your name?" What does he say?', 'రవిని "What is your name?" అని అడిగారు. అతను ఏం చెబుతాడు?'), [L('The question asks for his name.', 'ప్రశ్న అతని పేరు అడుగుతోంది.'), L('Answer with "My name is …".', '"My name is …" తో జవాబు చెప్పాలి.')], L('My name is Ravi.', 'My name is Ravi. (నా పేరు రవి.)')),
    ex(L('Meena walks to school. "How do you go to school?"', 'మీనా నడిచి బడికి వెళ్తుంది. "How do you go to school?"'), [L('"How" asks the way she goes.', '"How" ఆమె ఎలా వెళ్తుందో అడుగుతుంది.'), L('She walks, so she says "on foot".', 'ఆమె నడుస్తుంది కాబట్టి "on foot" అంటుంది.')], L('I go to school on foot.', 'I go to school on foot. (నేను నడిచి బడికి వెళ్తాను.)')),
  ], [
    mcq('answer', [
      [L('"What is your name?" — choose the best answer.', '"What is your name?" — సరైన జవాబు ఎంచుకో.'), 'My name is Ammu.', ['I am six.', 'I go by bus.'], L('The question asks for a name.', 'ప్రశ్న పేరు అడుగుతోంది.'), L('"My name is …" tells your name.', '"My name is …" నీ పేరు చెబుతుంది.')],
      [L('"How are you?" — choose the best answer.', '"How are you?" — సరైన జవాబు ఎంచుకో.'), 'I am fine, thank you.', ['My name is Ravi.', 'It is a bus.'], L('The question asks how you feel.', 'నువ్వు ఎలా ఉన్నావో అడుగుతోంది.'), L('We say "I am fine, thank you."', '"I am fine, thank you." అంటాం.')],
      [L('"How do you go to school?" — choose the best answer.', '"How do you go to school?" — సరైన జవాబు ఎంచుకో.'), 'I go to school by bus.', ['I am fine.', 'This is my bag.'], L('The question asks HOW you travel.', 'ఎలా వెళ్తావో అడుగుతోంది.'), L('"By bus", "by auto", "on foot" tell how we go.', '"by bus", "by auto", "on foot" ఎలా వెళ్తామో చెబుతాయి.')],
      [L('"Where are you going?" — choose the best answer.', '"Where are you going?" — సరైన జవాబు ఎంచుకో.'), 'I am going to school.', ['I am fine.', 'My name is Teja.'], L('"Where" asks about a place.', '"Where" ఒక చోటు గురించి అడుగుతుంది.'), L('School is a place.', 'బడి ఒక చోటు.')],
      [L('"How old are you?" — choose the best answer.', '"How old are you?" — సరైన జవాబు ఎంచుకో.'), 'I am six years old.', ['I go by car.', 'I am going home.'], L('"How old" asks your age.', '"How old" నీ వయసు అడుగుతుంది.'), L('We answer with our age: "I am six years old."', 'వయసుతో జవాబిస్తాం: "I am six years old."')],
      [L('"What is this? 🚲" — choose the best answer.', '"What is this? 🚲" — సరైన జవాబు ఎంచుకో.'), 'It is a bicycle.', ['It is a bus.', 'I am fine.'], L('Look at the picture.', 'బొమ్మను చూడు.'), L('🚲 is a bicycle.', '🚲 సైకిల్.')],
    ], L('Listen for the question word: What, How or Where.', 'ప్రశ్న పదం విను: What, How లేదా Where.'), 1, 'spoken'),
    sentence('say', [
      [['My', 'name', 'is', 'Ravi.'], 'నా పేరు రవి.'], [['I', 'am', 'fine.'], 'నేను బాగున్నాను.'],
      [['I', 'go', 'to', 'school', 'by', 'bus.'], 'నేను బస్సులో బడికి వెళ్తాను.'], [['I', 'am', 'going', 'to', 'school.'], 'నేను బడికి వెళ్తున్నాను.'],
      [['What', 'is', 'your', 'name?'], 'నీ పేరు ఏమిటి?'], [['How', 'are', 'you?'], 'నువ్వు ఎలా ఉన్నావు?'],
    ], L('A question ends with "?" and an answer ends with ".".', 'ప్రశ్న "?" తో, జవాబు "." తో ముగుస్తాయి.')),
    mcq('qword', [
      [L('Which question asks for a name?', 'పేరు అడిగే ప్రశ్న ఏది?'), 'What is your name?', ['How are you?', 'Where are you going?'], L('Look for the word "name".', '"name" పదం వెతుకు.'), L('"What is your name?" asks for a name.', '"What is your name?" పేరు అడుగుతుంది.')],
      [L('Which question asks about a place?', 'ఒక చోటు గురించి అడిగే ప్రశ్న ఏది?'), 'Where are you going?', ['How are you?', 'What is your name?'], L('"Where" is about places.', '"Where" చోట్ల గురించి.'), L('"Where" asks about a place.', '"Where" చోటు అడుగుతుంది.')],
      [L('Which question asks how you feel?', 'నువ్వు ఎలా ఉన్నావో అడిగే ప్రశ్న ఏది?'), 'How are you?', ['What is this?', 'Where is the bus?'], L('We answer it with "I am fine."', 'దీనికి "I am fine." అని జవాబిస్తాం.'), L('"How are you?" asks how you feel.', '"How are you?" నువ్వు ఎలా ఉన్నావో అడుగుతుంది.')],
      [L('Which question asks your age?', 'నీ వయసు అడిగే ప్రశ్న ఏది?'), 'How old are you?', ['How are you?', 'What is your name?'], L('Look for the word "old".', '"old" పదం వెతుకు.'), L('"How old are you?" asks your age.', '"How old are you?" వయసు అడుగుతుంది.')],
      [L('Which question asks about a thing?', 'ఒక వస్తువు గురించి అడిగే ప్రశ్న ఏది?'), 'What is this?', ['How are you?', 'Where are you going?'], L('"What" asks about things.', '"What" వస్తువుల గురించి అడుగుతుంది.'), L('"What is this?" asks about a thing.', '"What is this?" వస్తువు గురించి అడుగుతుంది.')],
    ], L('Find the question word first.', 'ముందు ప్రశ్న పదాన్ని వెతుకు.'), 2),
  ]),
  phonics('ts1.en.abc.eh', [E, F, G, H], '🐘', [
    ex(L('🐟 fish — which letter does it begin with?', '🐟 fish — ఇది ఏ అక్షరంతో మొదలవుతుంది?'), [L('Say "f-f-fish". Your top teeth touch your lip!', '"f-f-fish" అని చెప్పు. పై పళ్ళు కింది పెదవిని తాకుతాయి!'), L('That is the F sound, "ఫ".', 'అదే F శబ్దం, "ఫ".')], L('F f — F for fish!', 'F f — F అంటే fish!'), emo('🐟')),
    ex(L('Which word begins with H: hen or egg?', 'H తో మొదలయ్యేది ఏది: hen లేదా egg?'), [L('H says "హ" — like a little puff of air.', 'H "హ" అని పలుకుతుంది — చిన్న గాలి ఊదినట్టు.'), L('"h-h-hen" starts with "హ"; "egg" starts with "ఎ".', '"h-h-hen" "హ" తో, "egg" "ఎ" తో మొదలవుతాయి.')], L('hen — H for hen!', 'hen — H అంటే hen!'), emo('🐔')),
  ]),
]);

// ============================================================ Unit 3 — Ammu's school
const CLASSROOM: W[] = [
  ['📕', 'book', 'పుస్తకం'], ['✏️', 'pencil', 'పెన్సిల్'], ['🎒', 'bag', 'బ్యాగు'], ['🪑', 'chair', 'కుర్చీ'], ['🔔', 'bell', 'గంట'],
  ['🖍️', 'crayon', 'క్రేయాన్'], ['📏', 'scale', 'స్కేలు'], ['🖊️', 'pen', 'పెన్ను'], ['🧑‍🏫', 'teacher', 'టీచర్'], ['🏫', 'school', 'బడి'],
];
const u3 = unit(3, L('Ammu’s School', 'అమ్ము బడి'), [
  o('ts1.en.school.greet', L('Greetings: Hi, Hello, Good morning', 'పలకరింపులు: Hi, Hello, Good morning'), [
    p('When Ammu reaches school, she smiles and greets everyone. Greeting words are kind words we say when we meet or leave someone.', 'అమ్ము బడికి చేరగానే నవ్వుతూ అందరినీ పలకరిస్తుంది. ఎవరినైనా కలిసినప్పుడు, విడిపోయినప్పుడు చెప్పే మంచి మాటలే పలకరింపులు.'),
    photo('🧑‍🏫', L('"Good morning, teacher!"', '"Good morning, teacher!" — శుభోదయం, టీచర్!')),
    p('Hi! / Hello! — when we meet a friend\nGood morning — before lunch\nGood afternoon — after lunch\nGood night — before going to bed\nBye! / Goodbye! — when we leave\nThank you — when someone helps us', 'Hi / Hello = హలో (స్నేహితుడిని కలిసినప్పుడు) · Good morning = శుభోదయం · Good afternoon = మధ్యాహ్నం పలకరింపు · Good night = శుభరాత్రి · Bye = వెళ్ళొస్తాను · Thank you = ధన్యవాదాలు'),
    p('Wave and sing! (a WonderLab rhyme)\nHello, hello, how are you?\nI am fine, and how are you?\nGood morning, teacher, good morning, friend,\nLet us learn and play till the day’s end!', 'చేయి ఊపుతూ పాడు! (వండర్‌ల్యాబ్ పాట) — హలో, హలో, ఎలా ఉన్నావు? నేను బాగున్నాను, నువ్వు? శుభోదయం టీచర్, శుభోదయం స్నేహితుడా — రోజంతా నేర్చుకుందాం, ఆడుకుందాం!'),
    tip('Greet with a smile and look at the person’s face.', 'నవ్వుతూ, ఆ వ్యక్తి ముఖం చూస్తూ పలకరించు.'),
  ], [
    ex(L('It is 9 o’clock in the morning. Ammu meets her teacher. What does she say?', 'ఉదయం 9 గంటలు. అమ్ము టీచర్‌ను కలిసింది. ఏం అంటుంది?'), [L('It is morning.', 'ఇది ఉదయం.'), L('We greet a teacher politely.', 'టీచర్‌ను మర్యాదగా పలకరిస్తాం.')], L('Good morning, teacher!', 'Good morning, teacher! (శుభోదయం, టీచర్!)'), emo('🧑‍🏫')),
    ex(L('School is over. Ammu leaves her friend. What does she say?', 'బడి అయిపోయింది. అమ్ము స్నేహితురాలి నుండి వెళ్తోంది. ఏం అంటుంది?'), [L('She is leaving.', 'ఆమె వెళ్తోంది.'), L('When we leave, we say bye.', 'వెళ్ళేటప్పుడు bye అంటాం.')], L('Bye! See you tomorrow!', 'Bye! See you tomorrow! (వెళ్ళొస్తాను! రేపు కలుద్దాం!)')),
  ], [
    mcq('when', [
      [L('You meet your friend at the gate. You say:', 'బడి గేటు దగ్గర స్నేహితుడిని కలిశావు. నువ్వు అనేది:'), 'Hello!', ['Good night!', 'Sorry!'], L('You are meeting someone.', 'నువ్వు ఒకరిని కలుస్తున్నావు.'), L('"Hello" or "Hi" is for meeting a friend.', 'స్నేహితుడిని కలిసినప్పుడు "Hello" లేదా "Hi".')],
      [L('It is morning. Your teacher comes into class. You say:', 'ఉదయం. టీచర్ తరగతిలోకి వచ్చారు. నువ్వు అనేది:'), 'Good morning, teacher!', ['Good night, teacher!', 'Bye, teacher!'], L('What time of day is it?', 'ఇప్పుడు ఏ సమయం?'), L('In the morning we say "Good morning".', 'ఉదయం "Good morning" అంటాం.')],
      [L('You are going to bed. You say to your mother:', 'నువ్వు పడుకోబోతున్నావు. అమ్మతో నువ్వు అనేది:'), 'Good night!', ['Good morning!', 'Hello!'], L('It is night time.', 'ఇది రాత్రి.'), L('Before sleeping we say "Good night".', 'పడుకునే ముందు "Good night" అంటాం.')],
      [L('Your friend gives you a crayon. You say:', 'స్నేహితుడు నీకు క్రేయాన్ ఇచ్చాడు. నువ్వు అనేది:'), 'Thank you!', ['Bye!', 'Good night!'], L('Someone was kind to you.', 'ఎవరో నీ పట్ల దయ చూపారు.'), L('We say "Thank you" when someone helps or gives.', 'ఎవరైనా సాయం చేస్తే లేదా ఇస్తే "Thank you" అంటాం.')],
      [L('School is over. You leave your friends. You say:', 'బడి అయిపోయింది. స్నేహితులను వదిలి వెళ్తున్నావు. నువ్వు అనేది:'), 'Bye! See you tomorrow!', ['Good morning!', 'Hello!'], L('You are leaving.', 'నువ్వు వెళ్తున్నావు.'), L('When we leave we say "Bye".', 'వెళ్ళేటప్పుడు "Bye" అంటాం.')],
      [L('After lunch you meet the headmaster. You say:', 'మధ్యాహ్న భోజనం తర్వాత ప్రధానోపాధ్యాయుడిని కలిశావు. నువ్వు అనేది:'), 'Good afternoon, sir!', ['Good night, sir!', 'Bye, sir!'], L('After lunch is the afternoon.', 'భోజనం తర్వాత మధ్యాహ్నం.'), L('In the afternoon we say "Good afternoon".', 'మధ్యాహ్నం "Good afternoon" అంటాం.')],
    ], L('Think: are you meeting, leaving, or saying thanks? What time is it?', 'ఆలోచించు: కలుస్తున్నావా, వెళ్తున్నావా, ధన్యవాదాలు చెబుతున్నావా? ఏ సమయం?'), 1, 'spoken'),
    tapSome('pick', L('Tap all the greeting words.', 'పలకరింపు మాటలన్నీ నొక్కు.'), [
      ['Hello', true], ['Hi', true], ['Good morning', true], ['Good night', true], ['Bye', true], ['pencil', false], ['bus', false], ['mango', false], ['chair', false],
    ], L('Hello, Hi, Good morning, Good night and Bye are greetings. The others are names of things.', 'Hello, Hi, Good morning, Good night, Bye పలకరింపులు. మిగిలినవి వస్తువుల పేర్లు.'), L('A greeting is something we SAY to a person.', 'పలకరింపు అంటే ఒక వ్యక్తితో మనం చెప్పే మాట.')),
    sentence('say', [
      [['Good', 'morning,', 'teacher!'], 'శుభోదయం, టీచర్!'], [['Hello,', 'how', 'are', 'you?'], 'హలో, ఎలా ఉన్నావు?'],
      [['I', 'am', 'fine,', 'thank', 'you.'], 'నేను బాగున్నాను, ధన్యవాదాలు.'], [['Bye,', 'see', 'you', 'tomorrow!'], 'వెళ్ళొస్తాను, రేపు కలుద్దాం!'],
      [['Good', 'night,', 'Amma!'], 'శుభరాత్రి, అమ్మా!'], [['Thank', 'you', 'very', 'much!'], 'చాలా ధన్యవాదాలు!'],
    ], L('Say it like you are greeting a real person.', 'నిజంగా ఎవరినో పలకరిస్తున్నట్టు చెప్పు.')),
  ]),
  o('ts1.en.school.things', L('Things in my classroom', 'నా తరగతి గదిలోని వస్తువులు'), [
    p('Look around Ammu’s classroom! There are books, pencils, bags, chairs and a bell. Let us learn their English names.', 'అమ్ము తరగతి గదిని చూడు! పుస్తకాలు, పెన్సిళ్ళు, బ్యాగులు, కుర్చీలు, గంట ఉన్నాయి. వాటి ఇంగ్లీషు పేర్లు నేర్చుకుందాం.'),
    photo('🎒', L('My school bag — "This is my bag."', 'నా బడి బ్యాగు — "This is my bag."')),
    p('book 📕 · pencil ✏️ · bag 🎒 · chair 🪑 · bell 🔔 · crayon 🖍️ · scale 📏 · pen 🖊️', 'పుస్తకం = book · పెన్సిల్ = pencil · బ్యాగు = bag · కుర్చీ = chair · గంట = bell · క్రేయాన్ = crayon · స్కేలు = scale · పెన్ను = pen'),
    p('We say "a" before most words: a book, a bag, a pencil. Before a, e, i, o, u sounds we say "an": an apple, an egg.', 'చాలా పదాల ముందు "a" అంటాం: a book, a bag. a, e, i, o, u శబ్దాల ముందు "an": an apple, an egg.'),
    tip('Play "I spy": "I spy something red… it is a crayon!"', '"I spy" ఆట ఆడు: "I spy something red… it is a crayon!"'),
  ], [
    ex(L('✏️ Say a sentence about this.', '✏️ దీని గురించి ఒక వాక్యం చెప్పు.'), [L('Name it: pencil.', 'పేరు: pencil.'), L('Use "This is a …".', '"This is a …" వాడు.')], L('This is a pencil.', 'This is a pencil. (ఇది పెన్సిల్.)'), emo('✏️')),
    ex(L('The bell rings 🔔. What does it tell us?', 'గంట మోగింది 🔔. అది ఏం చెబుతుంది?'), [L('The school bell rings at fixed times.', 'బడి గంట నిర్ణీత సమయాల్లో మోగుతుంది.'), L('It tells us class starts, or it is time to play or go home.', 'తరగతి మొదలు, ఆట సమయం, లేదా ఇంటికి వెళ్ళే సమయం అని చెబుతుంది.')], L('It is time! — "The bell is ringing."', '"The bell is ringing." — సమయం అయింది!'), emo('🔔')),
  ], [
    whatIs('name', CLASSROOM, L('Where do you see this at school?', 'బడిలో దీన్ని ఎక్కడ చూస్తావు?')),
    listenTap('listen', CLASSROOM, L('Listen carefully, then find the picture.', 'జాగ్రత్తగా విని, బొమ్మను వెతుకు.')),
    matchWords('match', CLASSROOM, L('Say each picture’s name aloud.', 'ప్రతి బొమ్మ పేరు గట్టిగా చెప్పు.')),
    mcq('aan', [
      [L('Fill in: "This is ___ book."', 'ఖాళీ నింపు: "This is ___ book."'), 'a', ['an'], L('Does "book" start with a, e, i, o or u?', '"book" a, e, i, o, u తో మొదలవుతుందా?'), L('"book" starts with b, so we say "a book".', '"book" b తో మొదలవుతుంది, కాబట్టి "a book".')],
      [L('Fill in: "This is ___ apple."', 'ఖాళీ నింపు: "This is ___ apple."'), 'an', ['a'], L('Does "apple" start with a, e, i, o or u?', '"apple" a, e, i, o, u తో మొదలవుతుందా?'), L('"apple" starts with a, so we say "an apple".', '"apple" a తో మొదలవుతుంది, కాబట్టి "an apple".')],
      [L('Fill in: "This is ___ pencil."', 'ఖాళీ నింపు: "This is ___ pencil."'), 'a', ['an'], L('Look at the first letter: p.', 'మొదటి అక్షరం చూడు: p.'), L('"pencil" starts with p, so "a pencil".', '"pencil" p తో, కాబట్టి "a pencil".')],
      [L('Fill in: "This is ___ egg."', 'ఖాళీ నింపు: "This is ___ egg."'), 'an', ['a'], L('Look at the first letter: e.', 'మొదటి అక్షరం చూడు: e.'), L('"egg" starts with e, so "an egg".', '"egg" e తో, కాబట్టి "an egg".')],
      [L('Fill in: "This is ___ bag."', 'ఖాళీ నింపు: "This is ___ bag."'), 'a', ['an'], L('Look at the first letter: b.', 'మొదటి అక్షరం చూడు: b.'), L('"bag" starts with b, so "a bag".', '"bag" b తో, కాబట్టి "a bag".')],
      [L('Fill in: "This is ___ umbrella."', 'ఖాళీ నింపు: "This is ___ umbrella."'), 'an', ['a'], L('Look at the first letter: u.', 'మొదటి అక్షరం చూడు: u.'), L('"umbrella" starts with u, so "an umbrella".', '"umbrella" u తో, కాబట్టి "an umbrella".')],
      [L('Fill in: "This is ___ chair."', 'ఖాళీ నింపు: "This is ___ chair."'), 'a', ['an'], L('Look at the first letter: c.', 'మొదటి అక్షరం చూడు: c.'), L('"chair" starts with c, so "a chair".', '"chair" c తో, కాబట్టి "a chair".')],
    ], L('a, e, i, o, u at the start → "an". Other letters → "a".', 'మొదట a, e, i, o, u → "an". మిగతా అక్షరాలు → "a".'), 2),
  ]),
  phonics('ts1.en.abc.il', [I, J, K, Lt], '🪁', [
    ex(L('🪁 kite — which letter does it begin with?', '🪁 kite — ఇది ఏ అక్షరంతో మొదలవుతుంది?'), [L('Say "k-k-kite".', '"k-k-kite" అని చెప్పు.'), L('The first sound is "క" — that is K.', 'మొదటి శబ్దం "క" — అదే K.')], L('K k — K for kite!', 'K k — K అంటే kite!'), emo('🪁')),
    ex(L('Which word begins with J: jug or lamp?', 'J తో మొదలయ్యేది ఏది: jug లేదా lamp?'), [L('J says "జ".', 'J "జ" అని పలుకుతుంది.'), L('"j-j-jug" starts with "జ"; "lamp" starts with "ల".', '"j-j-jug" "జ" తో, "lamp" "ల" తో మొదలవుతాయి.')], L('jug — J for jug!', 'jug — J అంటే jug (కూజా)!')),
  ]),
]);

// ============================================================ Unit 4 — Ammu and her friends at school
const u4 = unit(4, L('Ammu and Her Friends at Her School', 'బడిలో అమ్ము, ఆమె స్నేహితులు'), [
  o('ts1.en.friends.doing', L('Things we do at school: read, write, sing, play', 'బడిలో మనం చేసేవి: చదవడం, రాయడం, పాడడం, ఆడడం'), [
    p('At school Ammu and her friends do many things. Words that tell what we DO are action words: read, write, draw, sing, play, count.', 'బడిలో అమ్ము, ఆమె స్నేహితులు చాలా పనులు చేస్తారు. మనం ఏం చేస్తామో చెప్పే పదాలు క్రియా పదాలు: read, write, draw, sing, play, count.'),
    photo('📖', L('We read books. — "I can read."', 'మనం పుస్తకాలు చదువుతాం — "I can read."')),
    p('read 📖 · write 📝 · draw 🎨 · sing 🎵 · play ⚽ · count 🔢', 'read = చదవడం · write = రాయడం · draw = బొమ్మ గీయడం · sing = పాడడం · play = ఆడడం · count = లెక్కపెట్టడం'),
    p('Do the actions as you say it! (a WonderLab rhyme)\nI can read and I can write,\nI can draw a kite so bright,\nI can sing and I can play,\nSchool is fun every day!', 'చేతలతో చెప్పు! (వండర్‌ల్యాబ్ పాట) — నేను చదవగలను, రాయగలను, గాలిపటం బొమ్మ గీయగలను, పాడగలను, ఆడగలను — బడి రోజూ సరదా!'),
    tip('Play "Simon says": "Simon says… sing!" Do the action only when you hear "Simon says".', '"Simon says" ఆట: "Simon says… sing!" అని విన్నప్పుడే ఆ పని చెయ్యి.'),
  ], [
    ex(L('📝 What do we do with a pencil and a notebook?', '📝 పెన్సిల్, నోట్‌బుక్‌తో మనం ఏం చేస్తాం?'), [L('We make letters on paper.', 'కాగితం మీద అక్షరాలు రాస్తాం.'), L('That action is "write".', 'ఆ పని "write".')], L('We write. — "I can write."', 'We write. — "I can write." (నేను రాయగలను.)'), emo('📝')),
    ex(L('Finish the rhyme: "I can sing and I can play, School is fun every ___"', 'పాట పూర్తి చేయి: "… School is fun every ___"'), [L('Find a word that rhymes with "play".', '"play" తో ప్రాస కలిసే పదం వెతుకు.'), L('play — day!', 'play — day!')], L('day', 'day (రోజు)')),
  ], [
    mcq('action', [
      [L('📖 What do we do with a book?', '📖 పుస్తకంతో మనం ఏం చేస్తాం?'), 'read', ['eat', 'sleep'], L('We look at the words and say them.', 'పదాలను చూసి చెబుతాం.'), L('We read a book.', 'మనం పుస్తకం చదువుతాం (read).')],
      [L('🎵 What do we do with a song?', '🎵 పాటతో మనం ఏం చేస్తాం?'), 'sing', ['write', 'cut'], L('We use our voice.', 'మన గొంతును వాడతాం.'), L('We sing a song.', 'మనం పాట పాడతాం (sing).')],
      [L('⚽ What do we do with a ball?', '⚽ బంతితో మనం ఏం చేస్తాం?'), 'play', ['read', 'sing'], L('We kick it or throw it.', 'దాన్ని తన్నుతాం లేదా విసురుతాం.'), L('We play with a ball.', 'మనం బంతితో ఆడతాం (play).')],
      [L('🎨 What do we do with colours?', '🎨 రంగులతో మనం ఏం చేస్తాం?'), 'draw', ['eat', 'count'], L('We make pictures.', 'బొమ్మలు వేస్తాం.'), L('We draw and colour pictures.', 'మనం బొమ్మలు గీస్తాం (draw).')],
      [L('🔢 What do we do with numbers?', '🔢 అంకెలతో మనం ఏం చేస్తాం?'), 'count', ['sing', 'sleep'], L('One, two, three…', 'ఒకటి, రెండు, మూడు…'), L('We count numbers.', 'మనం లెక్కపెడతాం (count).')],
      [L('📝 What do we do with a pencil?', '📝 పెన్సిల్‌తో మనం ఏం చేస్తాం?'), 'write', ['sing', 'play'], L('We make letters on paper.', 'కాగితం మీద అక్షరాలు వేస్తాం.'), L('We write with a pencil.', 'మనం పెన్సిల్‌తో రాస్తాం (write).')],
    ], L('Think: what do your hands, eyes or voice do?', 'ఆలోచించు: నీ చేతులు, కళ్ళు, గొంతు ఏం చేస్తాయి?')),
    mcq('rhyme', [
      [L('Finish the rhyme: "I can read and I can ___"', 'పాట పూర్తి చేయి: "I can read and I can ___"'), 'write', ['sleep', 'eat'], L('We do it with a pencil.', 'పెన్సిల్‌తో చేస్తాం.'), L('"I can read and I can write."', '"I can read and I can write."')],
      [L('Finish the rhyme: "I can draw a kite so ___"', 'పాట పూర్తి చేయి: "I can draw a kite so ___"'), 'bright', ['big', 'red'], L('It rhymes with "write" and "kite".', '"write", "kite" తో ప్రాస.'), L('"kite" and "bright" rhyme.', '"kite", "bright" ప్రాస పదాలు.')],
      [L('Finish the rhyme: "I can sing and I can ___"', 'పాట పూర్తి చేయి: "I can sing and I can ___"'), 'play', ['read', 'run'], L('It rhymes with "day".', '"day" తో ప్రాస కలుస్తుంది.'), L('"play" and "day" rhyme.', '"play", "day" ప్రాస పదాలు.')],
      [L('Which word rhymes with "play"?', '"play" తో ప్రాస కలిసే పదం ఏది?'), 'day', ['sing', 'book'], L('Listen to the end: pl-AY.', 'చివర విను: pl-AY.'), L('play — day both end in "ay".', 'play — day రెండూ "ay" తో ముగుస్తాయి.')],
      [L('Which word rhymes with "kite"?', '"kite" తో ప్రాస కలిసే పదం ఏది?'), 'write', ['read', 'ball'], L('Listen to the end: k-ITE.', 'చివర విను: k-ITE.'), L('kite — write sound the same at the end.', 'kite — write చివర ఒకేలా వినిపిస్తాయి.')],
      [L('Which word rhymes with "sing"?', '"sing" తో ప్రాస కలిసే పదం ఏది?'), 'ring', ['song', 'sun'], L('Listen to the end: s-ING.', 'చివర విను: s-ING.'), L('sing — ring both end in "ing".', 'sing — ring రెండూ "ing" తో ముగుస్తాయి.')],
    ], L('Rhyming words sound the same at the end.', 'ప్రాస పదాలు చివర ఒకేలా వినిపిస్తాయి.'), 2),
    sentence('say', [
      [['I', 'can', 'read.'], 'నేను చదవగలను.'], [['I', 'can', 'sing', 'a', 'song.'], 'నేను పాట పాడగలను.'],
      [['We', 'play', 'with', 'a', 'ball.'], 'మేము బంతితో ఆడతాం.'], [['I', 'can', 'draw', 'a', 'kite.'], 'నేను గాలిపటం బొమ్మ గీయగలను.'],
      [['School', 'is', 'fun!'], 'బడి సరదా!'], [['We', 'count', 'to', 'ten.'], 'మేము పది వరకు లెక్కపెడతాం.'],
    ], L('Start with the person: I or We.', 'వ్యక్తితో మొదలుపెట్టు: I లేదా We.')),
  ]),
  o('ts1.en.friends.class', L('My teacher and my classmates', 'నా టీచర్, నా తోటి విద్యార్థులు'), [
    p('Ammu’s teacher helps the children learn. Her classmates are her friends. Good friends share, help, take turns and say kind words.', 'అమ్ము టీచర్ పిల్లలు నేర్చుకోవడానికి సాయం చేస్తారు. తోటి విద్యార్థులు ఆమె స్నేహితులు. మంచి స్నేహితులు పంచుకుంటారు, సాయం చేస్తారు, వంతు కోసం ఆగుతారు, మంచి మాటలు చెబుతారు.'),
    photo('👧', L('"She is my friend. Her name is Diya."', '"ఆమె నా స్నేహితురాలు. ఆమె పేరు దియా."')),
    p('He = a boy or a man: "He is my friend."\nShe = a girl or a woman: "She is my teacher."\nWe use "he" and "she" so we do not repeat names.', 'He = అబ్బాయి లేదా పురుషుడు: "He is my friend." · She = అమ్మాయి లేదా స్త్రీ: "She is my teacher." · పేర్లు మళ్ళీ మళ్ళీ చెప్పకుండా he, she వాడతాం.'),
    tip('Introduce your friend: "This is Teja. He is my friend."', 'నీ స్నేహితుడిని పరిచయం చెయ్యి: "This is Teja. He is my friend."'),
  ], [
    ex(L('👦 Ravi is a boy. Fill in: "___ is my friend."', '👦 రవి అబ్బాయి. ఖాళీ నింపు: "___ is my friend."'), [L('Ravi is a boy.', 'రవి అబ్బాయి.'), L('For a boy we use "He".', 'అబ్బాయికి "He" వాడతాం.')], L('He is my friend.', 'He is my friend. (అతను నా స్నేహితుడు.)'), emo('👦')),
    ex(L('Your friend has no crayon. What can you say?', 'నీ స్నేహితుడి దగ్గర క్రేయాన్ లేదు. నువ్వు ఏం చెప్పవచ్చు?'), [L('A good friend shares.', 'మంచి స్నేహితుడు పంచుకుంటాడు.'), L('Offer kindly.', 'దయగా ఇవ్వు.')], L('"You can use my crayon."', '"You can use my crayon." (నా క్రేయాన్ వాడుకో.)'), emo('🖍️')),
  ], [
    mcq('heshe', [
      [L('👧 Meena is a girl. "___ is my friend."', '👧 మీనా అమ్మాయి. "___ is my friend."'), 'She', ['He'], L('Meena is a girl.', 'మీనా అమ్మాయి.'), L('For a girl we say "She".', 'అమ్మాయికి "She".')],
      [L('👦 Arjun is a boy. "___ is my friend."', '👦 అర్జున్ అబ్బాయి. "___ is my friend."'), 'He', ['She'], L('Arjun is a boy.', 'అర్జున్ అబ్బాయి.'), L('For a boy we say "He".', 'అబ్బాయికి "He".')],
      [L('👩 Our teacher is a woman. "___ is my teacher."', '👩 మా టీచర్ స్త్రీ. "___ is my teacher."'), 'She', ['He'], L('A woman → She.', 'స్త్రీ → She.'), L('For a woman we say "She".', 'స్త్రీకి "She".')],
      [L('👨 Ammu’s father is a man. "___ is my father."', '👨 అమ్ము నాన్న పురుషుడు. "___ is my father."'), 'He', ['She'], L('A man → He.', 'పురుషుడు → He.'), L('For a man we say "He".', 'పురుషుడికి "He".')],
      [L('👵 Grandmother is a woman. "___ tells me stories."', '👵 అమ్మమ్మ స్త్రీ. "___ tells me stories."'), 'She', ['He'], L('Grandmother → a woman.', 'అమ్మమ్మ → స్త్రీ.'), L('Grandmother is "she".', 'అమ్మమ్మకు "she".')],
      [L('👴 Grandfather is a man. "___ takes me to school."', '👴 తాతయ్య పురుషుడు. "___ takes me to school."'), 'He', ['She'], L('Grandfather → a man.', 'తాతయ్య → పురుషుడు.'), L('Grandfather is "he".', 'తాతయ్యకు "he".')],
    ], L('Boy or man → He. Girl or woman → She.', 'అబ్బాయి/పురుషుడు → He. అమ్మాయి/స్త్రీ → She.'), 1, 'spoken'),
    tapSome('kind', L('Tap the things a good friend does.', 'మంచి స్నేహితుడు చేసే పనులు నొక్కు.'), [
      ['shares crayons', true], ['helps a friend', true], ['waits for a turn', true], ['says sorry', true], ['plays together', true],
      ['pushes others', false], ['grabs toys', false], ['shouts at friends', false],
    ], L('Good friends share, help, take turns, say sorry and play together.', 'మంచి స్నేహితులు పంచుకుంటారు, సాయం చేస్తారు, వంతు కోసం ఆగుతారు, sorry చెబుతారు, కలిసి ఆడతారు.'), L('Would this make your friend happy?', 'ఇది నీ స్నేహితుడిని సంతోషపెడుతుందా?')),
    sentence('say', [
      [['She', 'is', 'my', 'teacher.'], 'ఆమె మా టీచర్.'], [['He', 'is', 'my', 'friend.'], 'అతను నా స్నేహితుడు.'],
      [['We', 'are', 'good', 'friends.'], 'మేము మంచి స్నేహితులం.'], [['Let', 'us', 'play', 'together.'], 'కలిసి ఆడుకుందాం.'],
      [['You', 'can', 'use', 'my', 'crayon.'], 'నా క్రేయాన్ వాడుకో.'], [['My', 'teacher', 'is', 'kind.'], 'మా టీచర్ దయగలవారు.'],
    ], L('Read each word and think what the sentence says.', 'ప్రతి పదం చదివి వాక్యం ఏం చెబుతుందో ఆలోచించు.')),
  ]),
  phonics('ts1.en.abc.mp', [M, N, O, P], '🦜', [
    ex(L('🥭 mango — which letter does it begin with?', '🥭 mango — ఇది ఏ అక్షరంతో మొదలవుతుంది?'), [L('Say "m-m-mango" — your lips close: "మ".', '"m-m-mango" అని చెప్పు — పెదవులు మూసుకుంటాయి: "మ".'), L('That is the M sound.', 'అదే M శబ్దం.')], L('M m — M for mango!', 'M m — M అంటే mango!'), emo('🥭')),
    ex(L('Which word begins with P: parrot or nest?', 'P తో మొదలయ్యేది ఏది: parrot లేదా nest?'), [L('P says "ప" — a little pop of air.', 'P "ప" అని పలుకుతుంది — చిన్న గాలి పొంగు.'), L('"p-p-parrot" starts with "ప"; "nest" starts with "న".', '"p-p-parrot" "ప" తో, "nest" "న" తో మొదలవుతాయి.')], L('parrot — P for parrot!', 'parrot — P అంటే parrot!'), emo('🦜')),
  ]),
]);

// ============================================================ Unit 5 — Things I do
type Step = [en: string, te: string];
const DAYS: Step[][] = [
  [['wake up', 'నిద్ర లేవడం'], ['brush my teeth', 'పళ్ళు తోముకోవడం'], ['take a bath', 'స్నానం చేయడం'], ['go to school', 'బడికి వెళ్ళడం']],
  [['wake up', 'నిద్ర లేవడం'], ['eat breakfast', 'అల్పాహారం తినడం'], ['go to school', 'బడికి వెళ్ళడం']],
  [['go to school', 'బడికి వెళ్ళడం'], ['come home', 'ఇంటికి రావడం'], ['play', 'ఆడుకోవడం'], ['sleep', 'నిద్రపోవడం']],
  [['take a bath', 'స్నానం చేయడం'], ['eat breakfast', 'అల్పాహారం తినడం'], ['go to school', 'బడికి వెళ్ళడం'], ['come home', 'ఇంటికి రావడం']],
  [['play', 'ఆడుకోవడం'], ['wash my hands', 'చేతులు కడుక్కోవడం'], ['eat dinner', 'రాత్రి భోజనం చేయడం'], ['sleep', 'నిద్రపోవడం']],
  [['brush my teeth', 'పళ్ళు తోముకోవడం'], ['take a bath', 'స్నానం చేయడం'], ['wear my uniform', 'యూనిఫాం వేసుకోవడం'], ['go to school', 'బడికి వెళ్ళడం']],
];
const u5 = unit(5, L('Things I Do', 'నేను చేసే పనులు'), [
  o('ts1.en.do.routine', L('My day: from waking up to sleeping', 'నా రోజు: నిద్ర లేచినప్పటి నుండి పడుకునే వరకు'), [
    p('Every day Ammu does things in an order. First she wakes up, then she brushes her teeth, then she takes a bath… Let us learn to say what we do.', 'అమ్ము రోజూ పనులను ఒక క్రమంలో చేస్తుంది. ముందు నిద్ర లేస్తుంది, తర్వాత పళ్ళు తోముకుంటుంది, తర్వాత స్నానం చేస్తుంది… మనం ఏం చేస్తామో చెప్పడం నేర్చుకుందాం.'),
    photo('⏰', L('"I wake up at six o’clock."', '"నేను ఆరు గంటలకు నిద్ర లేస్తాను." — "I wake up at six o’clock."')),
    p('Morning: wake up ⏰ → brush my teeth 🦷 → take a bath 💧 → eat breakfast 🥛 → go to school 🎒\nEvening: come home 🏠 → play ⚽ → wash my hands 👐 → eat dinner → sleep 🛏️', 'ఉదయం: నిద్ర లేవడం → పళ్ళు తోముకోవడం → స్నానం → అల్పాహారం → బడికి వెళ్ళడం · సాయంత్రం: ఇంటికి రావడం → ఆట → చేతులు కడుక్కోవడం → భోజనం → నిద్ర'),
    p('Act it out! (traditional rhyme, "Here we go round the mulberry bush")\nThis is the way we brush our teeth,\nBrush our teeth, brush our teeth,\nThis is the way we brush our teeth,\nSo early in the morning!', 'చేసి చూపించు! (పాత ఇంగ్లీషు పాట) — ఇలా మనం పళ్ళు తోముకుంటాం, పొద్దున్నే! తర్వాత "wash our hands", "comb our hair" అని మార్చి పాడు.'),
    tip('Sing the rhyme again with new actions: "This is the way we wash our hands… comb our hair… eat our food."', 'కొత్త పనులతో మళ్ళీ పాడు: "This is the way we wash our hands… comb our hair… eat our food."'),
  ], [
    ex(L('What do you do first: go to school or wake up?', 'ముందు ఏం చేస్తావు: బడికి వెళ్ళడమా, నిద్ర లేవడమా?'), [L('You cannot go anywhere while sleeping!', 'నిద్రపోతూ ఎక్కడికీ వెళ్ళలేవు!'), L('So first you wake up.', 'కాబట్టి ముందు నిద్ర లేస్తావు.')], L('First I wake up, then I go to school.', 'First I wake up, then I go to school. (ముందు నిద్ర లేస్తాను, తర్వాత బడికి వెళ్తాను.)'), emo('⏰')),
    ex(L('Finish the rhyme: "This is the way we brush our ___"', 'పాట పూర్తి చేయి: "This is the way we brush our ___"'), [L('What do we brush every morning?', 'రోజూ పొద్దున ఏం తోముకుంటాం?'), L('We brush our teeth 🦷.', 'పళ్ళు తోముకుంటాం 🦷.')], L('teeth', 'teeth (పళ్ళు)'), emo('🦷')),
  ], [
    tp('day', (r) => {
      const seq = r.pick(DAYS);
      return {
        type: 'order', prompt: L('Put Ammu’s day in order. What does she do first?', 'అమ్ము రోజును క్రమంలో పెట్టు. ఆమె ముందు ఏం చేస్తుంది?'),
        ...ordering(r, seq.map(([en, te]) => L(en, te))),
        hints: [L('Think of your own day. What do you do first?', 'నీ రోజు గుర్తు చేసుకో. ముందు ఏం చేస్తావు?'), L(`First: "${seq[0][0]}".`, `ముందు: "${seq[0][0]}" (${seq[0][1]}).`)],
        mistakes: [{ when: 'wrong', explain: L('Almost! Ask yourself after each one: "And then what?"', 'దాదాపు సరైంది! ప్రతి దాని తర్వాత అడుగు: "తర్వాత ఏమిటి?"') }],
        solution: [L(seq.map((s) => s[0]).join(' → '), seq.map((s) => s[1]).join(' → '))],
      };
    }, 2),
    mcq('when', [
      [L('When do you brush your teeth?', 'పళ్ళు ఎప్పుడు తోముకుంటావు?'), 'in the morning', ['at lunch time', 'never'], L('Think of the rhyme: "So early in the …"', 'పాట గుర్తు చేసుకో: "So early in the …"'), L('We brush our teeth in the morning (and at night too!).', 'పొద్దున పళ్ళు తోముకుంటాం (రాత్రి కూడా!).')],
      [L('When do you sleep?', 'ఎప్పుడు నిద్రపోతావు?'), 'at night', ['in the morning', 'at school'], L('The moon 🌙 comes out.', 'చందమామ 🌙 వస్తుంది.'), L('We sleep at night.', 'మనం రాత్రి నిద్రపోతాం.')],
      [L('What do you do before you eat?', 'తినే ముందు ఏం చేస్తావు?'), 'wash my hands', ['go to sleep', 'ride a bus'], L('Keep germs away!', 'క్రిములను దూరం చెయ్యి!'), L('We wash our hands before we eat.', 'తినే ముందు చేతులు కడుక్కుంటాం.')],
      [L('What do you do after you wake up?', 'నిద్ర లేచిన తర్వాత ఏం చేస్తావు?'), 'brush my teeth', ['eat dinner', 'go to bed'], L('It is morning now.', 'ఇప్పుడు ఉదయం.'), L('After waking up we brush our teeth.', 'నిద్ర లేచాక పళ్ళు తోముకుంటాం.')],
      [L('Finish the rhyme: "This is the way we brush our teeth, so early in the ___"', 'పాట పూర్తి చేయి: "… so early in the ___"'), 'morning', ['night', 'school'], L('The sun comes up early.', 'సూర్యుడు పొద్దున్నే వస్తాడు.'), L('"So early in the morning!"', '"So early in the morning!"')],
      [L('What do you wear to school?', 'బడికి ఏం వేసుకుంటావు?'), 'my uniform', ['my blanket', 'my pillow'], L('All children in class wear the same clothes.', 'తరగతిలో పిల్లలందరూ ఒకేలాంటి బట్టలు వేసుకుంటారు.'), L('We wear our uniform to school.', 'బడికి యూనిఫాం వేసుకుంటాం.')],
    ], L('Think about your own day, from morning to night.', 'ఉదయం నుండి రాత్రి వరకు నీ రోజు గురించి ఆలోచించు.')),
    sentence('say', [
      [['I', 'wake', 'up', 'early.'], 'నేను పొద్దున్నే లేస్తాను.'], [['I', 'brush', 'my', 'teeth.'], 'నేను పళ్ళు తోముకుంటాను.'],
      [['I', 'take', 'a', 'bath.'], 'నేను స్నానం చేస్తాను.'], [['I', 'go', 'to', 'school.'], 'నేను బడికి వెళ్తాను.'],
      [['I', 'wash', 'my', 'hands.'], 'నేను చేతులు కడుక్కుంటాను.'], [['I', 'sleep', 'at', 'night.'], 'నేను రాత్రి నిద్రపోతాను.'],
    ], L('Every sentence starts with "I".', 'ప్రతి వాక్యం "I" తో మొదలవుతుంది.')),
  ]),
  o('ts1.en.do.help', L('Asking for help: please, thank you, sorry', 'సాయం అడగడం: please, thank you, sorry'), [
    p('Sometimes we need help — to open a tiffin box, to find a pencil, or to reach a high shelf. We ask politely with "please", and we say "thank you" after.', 'కొన్నిసార్లు సాయం కావాలి — టిఫిన్ డబ్బా తెరవడానికి, పెన్సిల్ వెతకడానికి, ఎత్తైన అలమారు అందుకోడానికి. "please" తో మర్యాదగా అడుగుతాం, తర్వాత "thank you" అంటాం.'),
    photo('🙋', L('"Can you help me, please?"', '"నాకు సాయం చేస్తారా, దయచేసి?" — "Can you help me, please?"')),
    p('Can you help me, please? — asking for help\nMay I…? — asking to do something ("May I drink water?")\nThank you! — after someone helps\nSorry! — when we make a mistake\nExcuse me — to get attention politely', 'Can you help me, please? = సాయం అడగడం · May I…? = అనుమతి అడగడం · Thank you = ధన్యవాదాలు · Sorry = క్షమించండి · Excuse me = మర్యాదగా పిలవడం'),
    tip('Magic words: please, thank you, sorry. Use them every day!', 'మ్యాజిక్ మాటలు: please, thank you, sorry. రోజూ వాడు!'),
  ], [
    ex(L('Ammu cannot open her tiffin box. What can she say to her teacher?', 'అమ్ము టిఫిన్ డబ్బా తెరవలేకపోతోంది. టీచర్‌తో ఏం అంటుంది?'), [L('She needs help.', 'ఆమెకు సాయం కావాలి.'), L('She asks politely with "please".', '"please" తో మర్యాదగా అడుగుతుంది.')], L('"Can you help me, please?"', '"Can you help me, please?" (దయచేసి సాయం చేస్తారా?)'), emo('🙋')),
    ex(L('Ravi steps on Teja’s foot by mistake. What should he say?', 'రవి పొరపాటున తేజ కాలు తొక్కాడు. అతను ఏం చెప్పాలి?'), [L('It was a mistake.', 'అది పొరపాటు.'), L('For a mistake we say sorry.', 'పొరపాటుకు sorry చెబుతాం.')], L('"Sorry, Teja!"', '"Sorry, Teja!" (క్షమించు, తేజ!)')),
  ], [
    mcq('say', [
      [L('You want to drink water in class. You ask the teacher:', 'తరగతిలో నీళ్ళు తాగాలి. టీచర్‌ను అడుగు:'), 'May I drink water, please?', ['Give me water!', 'Water now!'], L('Ask, do not order. Use "May I" and "please".', 'ఆజ్ఞాపించకు, అడుగు. "May I", "please" వాడు.'), L('"May I …, please?" is the polite way to ask.', '"May I …, please?" మర్యాదగా అడిగే పద్ధతి.')],
      [L('Your friend helps you pick up your books. You say:', 'స్నేహితుడు నీ పుస్తకాలు ఏరడంలో సాయం చేశాడు. నువ్వు అనేది:'), 'Thank you!', ['Sorry!', 'Good night!'], L('Someone helped you.', 'ఎవరో నీకు సాయం చేశారు.'), L('After help we say "Thank you".', 'సాయం తర్వాత "Thank you".')],
      [L('You spill water on your friend’s book. You say:', 'స్నేహితుడి పుస్తకం మీద నీళ్ళు ఒలికించావు. నువ్వు అనేది:'), 'Sorry!', ['Thank you!', 'Hello!'], L('It was your mistake.', 'అది నీ పొరపాటు.'), L('For a mistake we say "Sorry".', 'పొరపాటుకు "Sorry".')],
      [L('You cannot reach your bag on a high shelf. You say:', 'ఎత్తైన అలమారులోని బ్యాగు అందడం లేదు. నువ్వు అనేది:'), 'Can you help me, please?', ['Bye!', 'Good morning!'], L('You need help.', 'నీకు సాయం కావాలి.'), L('"Can you help me, please?" asks for help.', '"Can you help me, please?" సాయం అడుగుతుంది.')],
      [L('The teacher is talking to someone and you need her. You first say:', 'టీచర్ ఎవరితోనో మాట్లాడుతున్నారు, నీకు వారు కావాలి. ముందు నువ్వు అనేది:'), 'Excuse me, teacher.', ['Hey!', 'Sorry, teacher.'], L('Get attention politely.', 'మర్యాదగా పిలువు.'), L('"Excuse me" gets attention politely.', '"Excuse me" మర్యాదగా పిలుస్తుంది.')],
      [L('You want to borrow a pencil. You ask:', 'నీకు పెన్సిల్ అరువు కావాలి. నువ్వు అడిగేది:'), 'May I use your pencil, please?', ['Give pencil.', 'Pencil, now!'], L('Use the magic word.', 'మ్యాజిక్ మాట వాడు.'), L('Polite asking uses "May I" and "please".', 'మర్యాదగా అడగడానికి "May I", "please".')],
    ], L('Is it asking, thanking, or saying sorry?', 'ఇది అడగడమా, ధన్యవాదమా, క్షమాపణా?'), 1, 'spoken'),
    tapSome('magic', L('Tap the polite (magic) words.', 'మర్యాద (మ్యాజిక్) మాటలు నొక్కు.'), [
      ['please', true], ['thank you', true], ['sorry', true], ['excuse me', true], ['may I', true], ['go away', false], ['give me!', false], ['shut up', false],
    ], L('Please, thank you, sorry, excuse me and may I are polite words.', 'please, thank you, sorry, excuse me, may I మర్యాద మాటలు.'), L('Would these words make someone feel happy and respected?', 'ఈ మాటలు ఎవరినైనా సంతోషపెడతాయా, గౌరవంగా అనిపిస్తాయా?')),
    sentence('ask', [
      [['Can', 'you', 'help', 'me,', 'please?'], 'దయచేసి నాకు సాయం చేస్తారా?'], [['May', 'I', 'come', 'in?'], 'నేను లోపలికి రావచ్చా?'],
      [['Thank', 'you', 'for', 'helping', 'me.'], 'నాకు సాయం చేసినందుకు ధన్యవాదాలు.'], [['I', 'am', 'sorry.'], 'నన్ను క్షమించండి.'],
      [['May', 'I', 'drink', 'water?'], 'నేను నీళ్ళు తాగవచ్చా?'], [['Please', 'open', 'my', 'box.'], 'దయచేసి నా డబ్బా తెరవండి.'],
    ], L('A question starts with "Can" or "May".', 'ప్రశ్న "Can" లేదా "May" తో మొదలవుతుంది.')),
  ]),
  phonics('ts1.en.abc.qt', [Q, R, S, T], '☀️', [
    ex(L('☀️ sun — which letter does it begin with?', '☀️ sun — ఇది ఏ అక్షరంతో మొదలవుతుంది?'), [L('Say "sss-sun" — like a snake hissing!', '"sss-sun" అని చెప్పు — పాము బుస కొట్టినట్టు!'), L('That is the S sound, "స".', 'అదే S శబ్దం, "స".')], L('S s — S for sun!', 'S s — S అంటే sun!'), emo('☀️')),
    ex(L('Q is a special letter. Which word begins with Q: queen or tree?', 'Q ప్రత్యేక అక్షరం. Q తో మొదలయ్యేది ఏది: queen లేదా tree?'), [L('Q says "క్వ" (kw). It is almost always followed by u: qu.', 'Q "క్వ" అని పలుకుతుంది. దాని తర్వాత దాదాపు ఎప్పుడూ u వస్తుంది: qu.'), L('"qu-queen" starts with "క్వ".', '"qu-queen" "క్వ" తో మొదలవుతుంది.')], L('queen — Q for queen!', 'queen — Q అంటే queen (రాణి)!')),
  ]),
]);

// ============================================================ Unit 6 — At the zoo
const ZOO: W[] = [
  ['🦁', 'lion', 'సింహం'], ['🐅', 'tiger', 'పులి'], ['🐘', 'elephant', 'ఏనుగు'], ['🦒', 'giraffe', 'జిరాఫీ'], ['🦓', 'zebra', 'జీబ్రా'], ['🐒', 'monkey', 'కోతి'],
  ['🐻', 'bear', 'ఎలుగుబంటి'], ['🦌', 'deer', 'జింక'], ['🦚', 'peacock', 'నెమలి'], ['🐪', 'camel', 'ఒంటె'], ['🐼', 'panda', 'పాండా'], ['🐢', 'tortoise', 'తాబేలు'],
];
const X: Let = { c: 'X', te: 'క్స', w: [['📦', 'box', 'పెట్టె'], ['🦊', 'fox', 'నక్క'], ['', 'six', 'ఆరు']] };
const u6 = unit(6, L('At the Zoo', 'జంతు ప్రదర్శనశాలలో'), [
  o('ts1.en.zoo.animals', L('Zoo animals', 'జూలోని జంతువులు'), [
    p('Ammu goes to the zoo with her family. A zoo is a big park where we can see many animals. Let us learn their English names!', 'అమ్ము తన కుటుంబంతో జూకి వెళ్తుంది. జూ అంటే చాలా జంతువులను చూడగలిగే పెద్ద పార్కు. వాటి ఇంగ్లీషు పేర్లు నేర్చుకుందాం!'),
    photo('🦁', L('A lion — the lion roars!', 'సింహం — సింహం గర్జిస్తుంది!')),
    p('lion 🦁 · tiger 🐅 · elephant 🐘 · giraffe 🦒 · zebra 🦓 · monkey 🐒 · bear 🐻 · deer 🦌 · peacock 🦚 · camel 🐪', 'సింహం = lion · పులి = tiger · ఏనుగు = elephant · జిరాఫీ = giraffe · జీబ్రా = zebra · కోతి = monkey · ఎలుగుబంటి = bear · జింక = deer · నెమలి = peacock · ఒంటె = camel'),
    tip('At the zoo, never feed or tease the animals. Look, learn and enjoy!', 'జూలో జంతువులకు ఆహారం పెట్టకూడదు, ఆటపట్టించకూడదు. చూడు, నేర్చుకో, ఆనందించు!'),
  ], [
    ex(L('🦓 What is this animal?', '🦓 ఈ జంతువు ఏది?'), [L('It looks like a horse with black and white stripes.', 'నలుపు-తెలుపు చారలతో గుర్రంలా ఉంటుంది.'), L('It is a zebra — Z for zebra!', 'ఇది zebra — Z అంటే zebra!')], L('This is a zebra.', 'This is a zebra. (ఇది జీబ్రా.)'), emo('🦓')),
    ex(L('🦚 Which bird is our national bird?', '🦚 మన జాతీయ పక్షి ఏది?'), [L('It has a long, colourful tail and dances in the rain.', 'దానికి పొడవైన రంగురంగుల తోక ఉంటుంది, వానలో నాట్యం చేస్తుంది.'), L('It is the peacock.', 'అది నెమలి (peacock).')], L('the peacock', 'the peacock (నెమలి)'), emo('🦚')),
  ], [
    whatIs('name', ZOO, L('Look at its body: trunk, stripes, long neck, mane?', 'దాని శరీరం చూడు: తొండం, చారలు, పొడవైన మెడ, జూలు?')),
    listenTap('listen', ZOO, L('Listen to the animal name and find it.', 'జంతువు పేరు విని వెతుకు.')),
    matchWords('match', ZOO, L('Name the animals you are sure about first.', 'ముందు నీకు ఖచ్చితంగా తెలిసిన జంతువుల పేర్లు చెప్పు.')),
  ]),
  o('ts1.en.zoo.describe', L('Describing animals: big, tall, long neck', 'జంతువులను వర్ణించడం: పెద్ద, ఎత్తైన, పొడవైన మెడ'), [
    p('We can describe animals with words: big or small, tall or short, a long neck, a long trunk, stripes, a long tail.', 'జంతువులను పదాలతో వర్ణించవచ్చు: big (పెద్ద) లేదా small (చిన్న), tall (ఎత్తు) లేదా short (పొట్టి), long neck (పొడవైన మెడ), long trunk (పొడవైన తొండం), stripes (చారలు), long tail (పొడవైన తోక).'),
    photo('🦒', L('"The giraffe is tall. It has a long neck."', '"జిరాఫీ ఎత్తుగా ఉంటుంది. దానికి పొడవైన మెడ ఉంటుంది."')),
    p('The elephant is big. It has a long trunk.\nThe giraffe is tall. It has a long neck.\nThe tiger has stripes.\nThe mouse is small.', 'ఏనుగు పెద్దది, దానికి పొడవైన తొండం. · జిరాఫీ ఎత్తైనది, దానికి పొడవైన మెడ. · పులికి చారలు. · ఎలుక చిన్నది.'),
    p('Sing and act! (a WonderLab rhyme)\nThe elephant is big and grey,\nThe monkey likes to jump and play,\nThe giraffe has a neck so long,\nThe lion sings a roaring song!', 'పాడుతూ చేసి చూపించు! (వండర్‌ల్యాబ్ పాట) — ఏనుగు పెద్దది, బూడిద రంగు; కోతి దూకి ఆడుతుంది; జిరాఫీ మెడ పొడవు; సింహం గర్జన పాట పాడుతుంది!'),
    tip('Big and small are opposites. Tall and short are opposites too!', 'big, small వ్యతిరేక పదాలు. tall, short కూడా వ్యతిరేక పదాలు!'),
  ], [
    ex(L('Which animal has a long trunk?', 'పొడవైన తొండం ఉన్న జంతువు ఏది?'), [L('A trunk is a long nose that can pick things up.', 'తొండం అంటే వస్తువులను ఎత్తగలిగే పొడవైన ముక్కు.'), L('The elephant has a trunk 🐘.', 'ఏనుగుకు తొండం ఉంటుంది 🐘.')], L('The elephant has a long trunk.', 'The elephant has a long trunk. (ఏనుగుకు పొడవైన తొండం ఉంది.)'), emo('🐘')),
    ex(L('Is a mouse big or small?', 'ఎలుక పెద్దదా, చిన్నదా?'), [L('A mouse can hide in a tiny hole.', 'ఎలుక చిన్న కన్నంలో దాక్కోగలదు.'), L('So it is small.', 'కాబట్టి అది చిన్నది.')], L('The mouse is small.', 'The mouse is small. (ఎలుక చిన్నది.)'), emo('🐭')),
  ], [
    mcq('which', [
      [L('Which animal has a long neck?', 'పొడవైన మెడ ఉన్న జంతువు ఏది?'), 'giraffe 🦒', ['lion 🦁', 'bear 🐻'], L('It can eat leaves from the top of a tree.', 'చెట్టు పైభాగంలోని ఆకులు తినగలదు.'), L('The giraffe has a long neck.', 'జిరాఫీకి పొడవైన మెడ ఉంటుంది.')],
      [L('Which animal has a long trunk?', 'పొడవైన తొండం ఉన్న జంతువు ఏది?'), 'elephant 🐘', ['zebra 🦓', 'monkey 🐒'], L('It is big and grey.', 'అది పెద్దది, బూడిద రంగు.'), L('The elephant has a long trunk.', 'ఏనుగుకు పొడవైన తొండం ఉంటుంది.')],
      [L('Which animal has black and white stripes?', 'నలుపు-తెలుపు చారలు ఉన్న జంతువు ఏది?'), 'zebra 🦓', ['camel 🐪', 'deer 🦌'], L('It looks like a horse.', 'అది గుర్రంలా ఉంటుంది.'), L('The zebra has black and white stripes.', 'జీబ్రాకు నలుపు-తెలుపు చారలు ఉంటాయి.')],
      [L('Which animal has a hump on its back?', 'వీపు మీద మూపురం ఉన్న జంతువు ఏది?'), 'camel 🐪', ['tiger 🐅', 'panda 🐼'], L('It walks in the desert.', 'అది ఎడారిలో నడుస్తుంది.'), L('The camel has a hump.', 'ఒంటెకు మూపురం ఉంటుంది.')],
      [L('Which animal roars and has a mane?', 'గర్జించే, జూలు ఉన్న జంతువు ఏది?'), 'lion 🦁', ['deer 🦌', 'peacock 🦚'], L('It is called the king of the jungle.', 'దాన్ని అడవికి రాజు అంటారు.'), L('The lion roars and has a mane.', 'సింహం గర్జిస్తుంది, దానికి జూలు ఉంటుంది.')],
      [L('Which animal likes to jump from tree to tree?', 'చెట్టు నుండి చెట్టుకు దూకడం ఇష్టపడే జంతువు ఏది?'), 'monkey 🐒', ['elephant 🐘', 'tortoise 🐢'], L('Think of the rhyme: "likes to jump and play".', 'పాట గుర్తు చేసుకో: "likes to jump and play".'), L('The monkey likes to jump and play.', 'కోతి దూకి ఆడడం ఇష్టపడుతుంది.')],
      [L('Which animal is very slow and carries a shell?', 'చాలా నెమ్మదిగా నడిచే, డిప్ప మోసే జంతువు ఏది?'), 'tortoise 🐢', ['deer 🦌', 'tiger 🐅'], L('It can hide inside its shell.', 'అది తన డిప్పలో దాక్కోగలదు.'), L('The tortoise is slow and has a shell.', 'తాబేలు నెమ్మదిగా నడుస్తుంది, దానికి డిప్ప ఉంటుంది.')],
    ], L('Picture the animal in your mind.', 'జంతువును మనసులో ఊహించుకో.'), 1, 'spoken'),
    mcq('opposite', [
      [L('The elephant is big. The mouse is ___.', 'ఏనుగు పెద్దది. ఎలుక ___.'), 'small', ['tall', 'long'], L('The opposite of big.', 'big కి వ్యతిరేకం.'), L('Big ↔ small.', 'big ↔ small.')],
      [L('The giraffe is tall. The tortoise is ___.', 'జిరాఫీ ఎత్తైనది. తాబేలు ___.'), 'short', ['big', 'long'], L('The opposite of tall.', 'tall కి వ్యతిరేకం.'), L('Tall ↔ short.', 'tall ↔ short.')],
      [L('Finish the rhyme: "The elephant is big and ___"', 'పాట పూర్తి చేయి: "The elephant is big and ___"'), 'grey', ['small', 'red'], L('It rhymes with "play".', '"play" తో ప్రాస.'), L('"grey" and "play" rhyme.', '"grey", "play" ప్రాస పదాలు.')],
      [L('Finish the rhyme: "The giraffe has a neck so ___"', 'పాట పూర్తి చేయి: "The giraffe has a neck so ___"'), 'long', ['short', 'small'], L('It rhymes with "song".', '"song" తో ప్రాస.'), L('"long" and "song" rhyme — and a giraffe’s neck IS long!', '"long", "song" ప్రాస — జిరాఫీ మెడ నిజంగా పొడవు!')],
      [L('Finish the rhyme: "The lion sings a roaring ___"', 'పాట పూర్తి చేయి: "The lion sings a roaring ___"'), 'song', ['dance', 'book'], L('It rhymes with "long".', '"long" తో ప్రాస.'), L('"long" and "song" rhyme.', '"long", "song" ప్రాస పదాలు.')],
      [L('An ant is small. A whale is ___.', 'చీమ చిన్నది. తిమింగలం ___.'), 'big', ['short', 'slow'], L('A whale is the largest animal in the sea.', 'తిమింగలం సముద్రంలో అతి పెద్ద జంతువు.'), L('Small ↔ big.', 'small ↔ big.')],
    ], L('Opposites are words that mean the other way.', 'వ్యతిరేక పదాలు అంటే వ్యతిరేక అర్థం ఇచ్చేవి.'), 2),
    sentence('say', [
      [['The', 'giraffe', 'is', 'tall.'], 'జిరాఫీ ఎత్తైనది.'], [['The', 'elephant', 'is', 'big.'], 'ఏనుగు పెద్దది.'],
      [['The', 'tiger', 'has', 'stripes.'], 'పులికి చారలు ఉన్నాయి.'], [['The', 'mouse', 'is', 'small.'], 'ఎలుక చిన్నది.'],
      [['The', 'monkey', 'can', 'jump.'], 'కోతి దూకగలదు.'], [['A', 'giraffe', 'has', 'a', 'long', 'neck.'], 'జిరాఫీకి పొడవైన మెడ ఉంది.'],
    ], L('Start with "The" or "A", then the animal.', '"The" లేదా "A" తో మొదలుపెట్టి, తర్వాత జంతువు పేరు.')),
  ]),
  phonics('ts1.en.abc.uz', [U, V, Wl, X, Y, Z], '🦓', [
    ex(L('🦓 zebra — which letter does it begin with?', '🦓 zebra — ఇది ఏ అక్షరంతో మొదలవుతుంది?'), [L('Say "zzz-zebra" — like a buzzing bee!', '"zzz-zebra" అని చెప్పు — తేనెటీగ ఝుంకారంలా!'), L('That is the Z sound.', 'అదే Z శబ్దం.')], L('Z z — Z for zebra!', 'Z z — Z అంటే zebra!'), emo('🦓')),
    ex(L('Where do we hear X in "box"?', '"box" లో X ఎక్కడ వినిపిస్తుంది?'), [L('Say "b-o-x" slowly.', '"b-o-x" మెల్లగా చెప్పు.'), L('The "క్స" sound comes at the END.', '"క్స" శబ్దం చివర వస్తుంది.')], L('At the end: box, fox, six.', 'చివర: box, fox, six.'), emo('📦')),
  ], [
    mcq('x', [
      [L('Which word ENDS with x?', 'x తో ముగిసే పదం ఏది?'), 'box', ['bag', 'bus'], L('Say each word and listen to the last sound: "క్స".', 'ప్రతి పదం చెప్పి చివరి శబ్దం విను: "క్స".'), L('b-o-x ends with x.', 'b-o-x, x తో ముగుస్తుంది.')],
      [L('Which word ENDS with x?', 'x తో ముగిసే పదం ఏది?'), 'fox', ['fish', 'fan'], L('Listen to the last sound.', 'చివరి శబ్దం విను.'), L('f-o-x ends with x.', 'f-o-x, x తో ముగుస్తుంది.')],
      [L('Which word ENDS with x?', 'x తో ముగిసే పదం ఏది?'), 'six', ['sun', 'sit'], L('It is a number word.', 'అది అంకె పదం.'), L('s-i-x ends with x.', 's-i-x, x తో ముగుస్తుంది.')],
      [L('Which word ENDS with x?', 'x తో ముగిసే పదం ఏది?'), 'ox', ['owl', 'egg'], L('It is an animal that pulls a cart.', 'బండి లాగే జంతువు.'), L('o-x ends with x.', 'o-x, x తో ముగుస్తుంది.')],
      [L('Which word ENDS with x?', 'x తో ముగిసే పదం ఏది?'), 'mix', ['milk', 'map'], L('Listen to the last sound.', 'చివరి శబ్దం విను.'), L('m-i-x ends with x.', 'm-i-x, x తో ముగుస్తుంది.')],
      [L('Which word ENDS with x?', 'x తో ముగిసే పదం ఏది?'), 'wax', ['web', 'wet'], L('Candles are made of it.', 'కొవ్వొత్తులు దీనితో చేస్తారు.'), L('w-a-x ends with x.', 'w-a-x, x తో ముగుస్తుంది.')],
    ], L('X likes to hide at the END of words.', 'X పదాల చివర దాక్కోవడం ఇష్టపడుతుంది.')),
  ], [
    p('X is a special letter! We usually hear its sound "క్స" at the END of a word: box 📦, fox 🦊, six.', 'X ప్రత్యేక అక్షరం! దాని శబ్దం "క్స" సాధారణంగా పదం చివర వినిపిస్తుంది: box, fox, six.'),
  ]),
]);

// ============================================================ Unit 7 — Fruits and vegetables
const FRUITS: W[] = [
  ['🥭', 'mango', 'మామిడి పండు'], ['🍌', 'banana', 'అరటి పండు'], ['🍎', 'apple', 'ఆపిల్'], ['🍇', 'grapes', 'ద్రాక్ష'],
  ['🍊', 'orange', 'నారింజ'], ['🍉', 'watermelon', 'పుచ్చకాయ'], ['🍍', 'pineapple', 'అనాస పండు'], ['🥥', 'coconut', 'కొబ్బరి కాయ'],
];
const VEG: W[] = [
  ['🍅', 'tomato', 'టమాటా'], ['🥕', 'carrot', 'క్యారెట్'], ['🍆', 'brinjal', 'వంకాయ'], ['🥔', 'potato', 'బంగాళదుంప'],
  ['🧅', 'onion', 'ఉల్లిపాయ'], ['🥒', 'cucumber', 'దోసకాయ'], ['🌶️', 'chilli', 'మిరపకాయ'], ['🌽', 'corn', 'మొక్కజొన్న'],
];
const ALPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
/** Fruit and vegetable words grouped by first letter (for the review picture game). */
const FV_LETTERS: Let[] = [
  { c: 'A', te: A.te, w: [FRUITS[2]] }, { c: 'B', te: B.te, w: [FRUITS[1], VEG[2]] }, { c: 'C', te: C.te, w: [VEG[1], VEG[5], VEG[7], FRUITS[7]] },
  { c: 'G', te: G.te, w: [FRUITS[3]] }, { c: 'M', te: M.te, w: [FRUITS[0]] }, { c: 'O', te: O.te, w: [FRUITS[4]] },
  { c: 'P', te: P.te, w: [FRUITS[6], VEG[3]] }, { c: 'T', te: T.te, w: [VEG[0]] }, { c: 'W', te: Wl.te, w: [FRUITS[5]] },
];
const u7 = unit(7, L('Fruits and Vegetables', 'పండ్లు, కూరగాయలు'), [
  o('ts1.en.market.names', L('Names of fruits and vegetables', 'పండ్లు, కూరగాయల పేర్లు'), [
    p('Ammu goes to the market with her mother. There are heaps of colourful fruits and vegetables! Fruits are sweet and we often eat them raw. Vegetables are usually cooked to make curry.', 'అమ్ము అమ్మతో కలిసి సంతకు వెళ్తుంది. రంగురంగుల పండ్లు, కూరగాయల కుప్పలు! పండ్లు తియ్యగా ఉంటాయి, తరచూ పచ్చిగానే తింటాం. కూరగాయలను సాధారణంగా వండి కూర చేస్తాం.'),
    photo('🥭', L('A mango — the king of fruits!', 'మామిడి పండు — పండ్లకు రాజు!')),
    p('Fruits: mango 🥭 · banana 🍌 · apple 🍎 · grapes 🍇 · orange 🍊 · watermelon 🍉 · pineapple 🍍\nVegetables: tomato 🍅 · carrot 🥕 · brinjal 🍆 · potato 🥔 · onion 🧅 · cucumber 🥒 · chilli 🌶️', 'పండ్లు: మామిడి, అరటి, ఆపిల్, ద్రాక్ష, నారింజ, పుచ్చకాయ, అనాస · కూరగాయలు: టమాటా, క్యారెట్, వంకాయ, బంగాళదుంప, ఉల్లిపాయ, దోసకాయ, మిరపకాయ'),
    p('Clap and sing! (a WonderLab rhyme)\nMango yellow, apple red,\n"Eat your fruits," my mother said.\nRed tomato, orange carrot,\nGreen chilli for the parrot!', 'చప్పట్లు కొడుతూ పాడు! (వండర్‌ల్యాబ్ పాట) — పసుపు మామిడి, ఎర్ర ఆపిల్, "పండ్లు తిను" అని అమ్మ చెప్పింది. ఎర్ర టమాటా, నారింజ క్యారెట్, చిలుకకు పచ్చి మిరపకాయ!'),
    tip('At home, ask: "What vegetable is in today’s curry?" Say its English name.', 'ఇంట్లో అడుగు: "ఈ రోజు కూరలో ఏ కూరగాయ ఉంది?" దాని ఇంగ్లీషు పేరు చెప్పు.'),
  ], [
    ex(L('🍆 What is this? Fruit or vegetable?', '🍆 ఇది ఏమిటి? పండా, కూరగాయా?'), [L('In Telugu it is వంకాయ.', 'తెలుగులో వంకాయ.'), L('In English it is "brinjal". We cook it in curry.', 'ఇంగ్లీషులో "brinjal". దాన్ని కూరలో వండుతాం.')], L('a brinjal — a vegetable', 'a brinjal — కూరగాయ'), emo('🍆')),
    ex(L('🍇 What are these?', '🍇 ఇవి ఏమిటి?'), [L('Small, round and sweet; they grow in bunches.', 'చిన్నవి, గుండ్రటివి, తియ్యనివి; గుత్తులుగా కాస్తాయి.'), L('They are grapes — a fruit.', 'అవి grapes — పండ్లు.')], L('These are grapes.', 'These are grapes. (ఇవి ద్రాక్ష పండ్లు.)'), emo('🍇')),
  ], [
    whatIs('name', [...FRUITS, ...VEG], L('Is it a fruit or a vegetable? What colour is it?', 'ఇది పండా, కూరగాయా? ఏ రంగు?')),
    listenTap('listen', [...FRUITS, ...VEG], L('Listen to the word and look at each picture.', 'పదాన్ని విని ప్రతి బొమ్మనూ చూడు.')),
    tapSome('fruit', L('Tap all the FRUITS.', 'పండ్లన్నీ నొక్కు.'), [
      ...FRUITS.map((f) => [f[1], true] as [string, boolean]), ...VEG.filter((v) => v[1] !== 'tomato').map((v) => [v[1], false] as [string, boolean]),
    ], L('Mango, banana, apple, grapes, orange, watermelon, pineapple and coconut are fruits; carrot, brinjal, potato, onion, cucumber, chilli and corn are vegetables.', 'మామిడి, అరటి, ఆపిల్, ద్రాక్ష, నారింజ, పుచ్చకాయ, అనాస, కొబ్బరి పండ్లు; క్యారెట్, వంకాయ, బంగాళదుంప, ఉల్లి, దోసకాయ, మిరప, మొక్కజొన్న కూరగాయలు.'), L('Fruits are sweet and we eat them raw.', 'పండ్లు తియ్యగా ఉంటాయి, పచ్చిగా తింటాం.')),
  ]),
  o('ts1.en.market.like', L('At the market: I like… I do not like…', 'సంతలో: నాకు ఇష్టం… నాకు ఇష్టం లేదు…'), [
    p('We all like some foods and do not like others. In English we say: "I like mangoes." "I do not like chillies." To ask a friend: "Do you like bananas?" — "Yes, I do." or "No, I do not."', 'మనందరికీ కొన్ని ఇష్టం, కొన్ని ఇష్టం ఉండవు. ఇంగ్లీషులో: "I like mangoes." (నాకు మామిడి పండ్లు ఇష్టం) "I do not like chillies." (నాకు మిరపకాయలు ఇష్టం లేదు). స్నేహితుడిని అడగడానికి: "Do you like bananas?" — "Yes, I do." లేదా "No, I do not."'),
    photo('🛒', L('At the market: "Two bananas, please."', 'సంతలో: "Two bananas, please." (రెండు అరటి పండ్లు ఇవ్వండి.)')),
    p('At the market we say:\n"I want two mangoes, please."\n"How much is this?"\n"Thank you!"', 'సంతలో ఇలా అంటాం: "దయచేసి రెండు మామిడి పండ్లు కావాలి." · "ఇది ఎంత?" · "ధన్యవాదాలు!"'),
    tip('Make two lists with a friend: "I like…" and "I do not like…". Are your lists the same?', 'స్నేహితుడితో రెండు జాబితాలు చెయ్యి: "I like…", "I do not like…". మీ జాబితాలు ఒకేలా ఉన్నాయా?'),
  ], [
    ex(L('Ammu loves mangoes 🥭. What does she say?', 'అమ్ముకు మామిడి పండ్లు చాలా ఇష్టం 🥭. ఆమె ఏం అంటుంది?'), [L('She likes them.', 'ఆమెకు ఇష్టం.'), L('Use "I like …".', '"I like …" వాడు.')], L('I like mangoes.', 'I like mangoes. (నాకు మామిడి పండ్లు ఇష్టం.)'), emo('🥭')),
    ex(L('Ravi does not like chillies 🌶️ — they are too hot! What does he say?', 'రవికి మిరపకాయలు 🌶️ ఇష్టం లేదు — చాలా కారం! అతను ఏం అంటాడు?'), [L('He does NOT like them.', 'అతనికి ఇష్టం లేదు.'), L('Use "I do not like …".', '"I do not like …" వాడు.')], L('I do not like chillies.', 'I do not like chillies. (నాకు మిరపకాయలు ఇష్టం లేదు.)'), emo('🌶️')),
  ], [
    mcq('like', [
      [L('Meena loves bananas. She says:', 'మీనాకు అరటి పండ్లు చాలా ఇష్టం. ఆమె అనేది:'), 'I like bananas.', ['I do not like bananas.', 'I am a banana.'], L('She LOVES them.', 'ఆమెకు చాలా ఇష్టం.'), L('When we enjoy something we say "I like …".', 'ఏదైనా నచ్చితే "I like …" అంటాం.')],
      [L('Teja does not enjoy bitter gourd. He says:', 'తేజకు కాకరకాయ నచ్చదు. అతను అనేది:'), 'I do not like bitter gourd.', ['I like bitter gourd.', 'Bitter gourd likes me.'], L('He does NOT enjoy it.', 'అతనికి నచ్చదు.'), L('When we do not enjoy something we say "I do not like …".', 'నచ్చకపోతే "I do not like …" అంటాం.')],
      [L('"Do you like grapes?" You like grapes. You say:', '"Do you like grapes?" నీకు ద్రాక్ష ఇష్టం. నువ్వు అనేది:'), 'Yes, I do.', ['No, I do not.', 'I am fine.'], L('You like them, so the answer is "yes".', 'నీకు ఇష్టం, కాబట్టి "yes".'), L('"Yes, I do." means you like them.', '"Yes, I do." అంటే నీకు ఇష్టం.')],
      [L('"Do you like onions?" You do not like onions. You say:', '"Do you like onions?" నీకు ఉల్లిపాయలు ఇష్టం లేదు. నువ్వు అనేది:'), 'No, I do not.', ['Yes, I do.', 'Thank you.'], L('You do not like them, so the answer is "no".', 'నీకు ఇష్టం లేదు, కాబట్టి "no".'), L('"No, I do not." means you do not like them.', '"No, I do not." అంటే నీకు ఇష్టం లేదు.')],
      [L('At the market you want two mangoes. You say:', 'సంతలో నీకు రెండు మామిడి పండ్లు కావాలి. నువ్వు అనేది:'), 'Two mangoes, please.', ['Mangoes, go!', 'Bye, mangoes.'], L('Ask politely with "please".', '"please" తో మర్యాదగా అడుగు.'), L('"Two mangoes, please." is polite.', '"Two mangoes, please." మర్యాదగా ఉంటుంది.')],
      [L('You want to know the price. You ask:', 'ధర తెలుసుకోవాలి. నువ్వు అడిగేది:'), 'How much is this?', ['How are you?', 'What is your name?'], L('Price means money.', 'ధర అంటే డబ్బు.'), L('"How much is this?" asks the price.', '"How much is this?" ధర అడుగుతుంది.')],
    ], L('Like → "I like". Not like → "I do not like".', 'ఇష్టం → "I like". ఇష్టం లేదు → "I do not like".'), 1, 'spoken'),
    mcq('rhyme', [
      [L('Finish the rhyme: "Mango yellow, apple ___"', 'పాట పూర్తి చేయి: "Mango yellow, apple ___"'), 'red', ['blue', 'big'], L('What colour is an apple 🍎?', 'ఆపిల్ 🍎 ఏ రంగు?'), L('An apple is red — and "red" rhymes with "said".', 'ఆపిల్ ఎర్రగా ఉంటుంది — "red", "said" ప్రాస.')],
      [L('Finish the rhyme: "\'Eat your fruits,\' my mother ___"', 'పాట పూర్తి చేయి: "\'Eat your fruits,\' my mother ___"'), 'said', ['sang', 'ran'], L('It rhymes with "red".', '"red" తో ప్రాస.'), L('"red" and "said" rhyme.', '"red", "said" ప్రాస పదాలు.')],
      [L('Finish the rhyme: "Red tomato, orange ___"', 'పాట పూర్తి చేయి: "Red tomato, orange ___"'), 'carrot', ['potato', 'onion'], L('It is orange and long 🥕.', 'అది నారింజ రంగులో, పొడవుగా ఉంటుంది 🥕.'), L('"carrot" rhymes with "parrot".', '"carrot", "parrot" ప్రాస పదాలు.')],
      [L('Finish the rhyme: "Green chilli for the ___"', 'పాట పూర్తి చేయి: "Green chilli for the ___"'), 'parrot', ['cat', 'dog'], L('It is a green bird 🦜 that rhymes with "carrot".', '"carrot" తో ప్రాస కలిసే పచ్చ పక్షి 🦜.'), L('Parrots love chillies! "carrot" — "parrot".', 'చిలుకలకు మిరపకాయలు ఇష్టం! "carrot" — "parrot".')],
      [L('What colour is a banana 🍌?', 'అరటి పండు 🍌 ఏ రంగు?'), 'yellow', ['blue', 'black'], L('Think of a ripe banana.', 'పండిన అరటి పండు గుర్తు చేసుకో.'), L('A ripe banana is yellow.', 'పండిన అరటి పండు పసుపు రంగు.')],
      [L('What colour is a ripe tomato 🍅?', 'పండిన టమాటా 🍅 ఏ రంగు?'), 'red', ['purple', 'white'], L('Think of the rhyme: "___ tomato".', 'పాట గుర్తు చేసుకో: "___ tomato".'), L('A ripe tomato is red.', 'పండిన టమాటా ఎరుపు.')],
    ], L('Say the rhyme aloud and listen to the line endings.', 'పాటను గట్టిగా చెప్పి, పంక్తుల చివర విను.'), 2),
    sentence('say', [
      [['I', 'like', 'mangoes.'], 'నాకు మామిడి పండ్లు ఇష్టం.'], [['I', 'do', 'not', 'like', 'chillies.'], 'నాకు మిరపకాయలు ఇష్టం లేదు.'],
      [['Do', 'you', 'like', 'bananas?'], 'నీకు అరటి పండ్లు ఇష్టమా?'], [['Yes,', 'I', 'do.'], 'అవును, ఇష్టం.'],
      [['Two', 'apples,', 'please.'], 'దయచేసి రెండు ఆపిల్ పండ్లు.'], [['How', 'much', 'is', 'this?'], 'ఇది ఎంత?'],
    ], L('Look for the word with a capital letter to start.', 'పెద్ద అక్షరం ఉన్న పదంతో మొదలుపెట్టు.')),
  ]),
  o('ts1.en.abc.review', L('The alphabet A to Z: review', 'A నుండి Z వరకు అక్షరమాల: పునశ్చరణ'), [
    p('We have met all 26 letters! Now let us sing them in order and find the first letter of our favourite fruits and vegetables.', 'మనం 26 అక్షరాలనూ కలిశాం! ఇప్పుడు వాటిని క్రమంలో పాడి, మనకు ఇష్టమైన పండ్లు, కూరగాయల మొదటి అక్షరం వెతుకుదాం.'),
    photo('🔤', L('A B C D E F G … X Y Z', 'A B C D E F G … X Y Z — ఇంగ్లీషు అక్షరమాల')),
    p('A B C D E F G\nH I J K L M N O P\nQ R S T U V\nW X Y Z\nNow I know my A B C!', 'అక్షరమాల పాట పాడు: A నుండి Z వరకు — "ఇప్పుడు నాకు A B C వచ్చు!"'),
    tip('Sing the ABC song slowly and point to each letter as you sing.', 'ABC పాట మెల్లగా పాడుతూ ప్రతి అక్షరాన్ని వేలితో చూపించు.'),
  ], [
    ex(L('What letter comes after C?', 'C తర్వాత ఏ అక్షరం వస్తుంది?'), [L('Sing: A, B, C, …', 'పాడు: A, B, C, …'), L('The next letter is D.', 'తర్వాతి అక్షరం D.')], L('D', 'D')),
    ex(L('🍉 watermelon — first letter?', '🍉 watermelon — మొదటి అక్షరం?'), [L('Say "w-w-watermelon".', '"w-w-watermelon" అని చెప్పు.'), L('The first sound is "వ" — that is W.', 'మొదటి శబ్దం "వ" — అదే W.')], L('W w', 'W w'), emo('🍉')),
  ], [
    tp('next', (r) => {
      const i = r.int(0, 24);
      const a = ALPH[i + 1];
      const wrong = others(r, ALPH, a, 2).filter((x) => x !== ALPH[i]);
      if (wrong.length < 2) wrong.push(ALPH[(i + 3) % 26]);
      return {
        type: 'mcq', prompt: L(`Which letter comes after ${ALPH[i]}?`, `${ALPH[i]} తర్వాత ఏ అక్షరం వస్తుంది?`), ...choose(r, a, wrong.slice(0, 2), 3),
        hints: [L('Sing the ABC song up to this letter.', 'ఈ అక్షరం వరకు ABC పాట పాడు.'), L(`${ALPH[Math.max(0, i - 1)]}, ${ALPH[i]}, … what next?`, `${ALPH[Math.max(0, i - 1)]}, ${ALPH[i]}, … తర్వాత?`)],
        mistakes: [{ when: 'wrong', explain: L(`Good try! Sing it again: …${ALPH[i]}, ${a}…`, `మంచి ప్రయత్నం! మళ్ళీ పాడు: …${ALPH[i]}, ${a}…`) }],
        solution: [L(`${ALPH[i]} → ${a}`, `${ALPH[i]} తర్వాత ${a}`)],
      };
    }),
    tp('abc', (r) => {
      const i = r.int(0, 22);
      const seq = ALPH.slice(i, i + 4);
      return {
        type: 'order', prompt: L('Put the letters in ABC order.', 'అక్షరాలను ABC క్రమంలో పెట్టు.'), ...ordering(r, seq),
        hints: [L('Sing the ABC song and listen for these letters.', 'ABC పాట పాడి ఈ అక్షరాలు ఎప్పుడు వస్తాయో విను.'), L(`The first one is ${seq[0]}.`, `మొదటిది ${seq[0]}.`)],
        mistakes: [{ when: 'wrong', explain: L('Almost! Which of these letters comes first in the ABC song?', 'దాదాపు సరైంది! ABC పాటలో వీటిలో ఏది ముందు వస్తుంది?') }],
        solution: [L(seq.join(' '), seq.join(' '))],
      };
    }, 2),
    firstLetter('first', FV_LETTERS),
  ]),
]);

export const units: USpec[] = [u1, u2, u3, u4, u5, u6, u7];
