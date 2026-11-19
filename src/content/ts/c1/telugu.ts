// Telangana SCERT Class 1 — Telugu (First Language). Original teaching aligned to the official chapter list
// (src/content/ts/books.ts, syllabus.json). Class 1 Telugu is a letter book: each lesson is built around one
// word and teaches its new letters (అక్షరాలు) or vowel signs (గుణింతం గుర్తులు). We teach the letters in our own
// way; textbook pages, songs and stories are never reproduced. Rhymes are original, apart from a few traditional
// public-domain children's lines (వానా వానా వల్లప్పా, చందమామ రావే).
// Every learner-facing string is bilingual: `te` is the main text for the child, `en` a short gloss for parents.
// Needs native-speaker / teacher review (see the unit notes).
import { tp, ex, p, tip, h, keys, photo, remember, L, choose, chooseNum, pictures, matching, ordering, tapAll, type USpec, type OSpec, type ExSpec, type TSpec } from '../../lib/kit';
import type { Block, Localized, VisualSpec } from '../../../shared/content';
import { tsSrc } from '../books';

// ------------------------------------------------------------------ small data helpers
/** A picture word: Telugu word, English meaning, optional emoji (must exist in the picture index). */
interface Wd { w: string; en: string; e?: string }
const W = (s: string): Wd => { const [w, en, e] = s.split('|'); return e ? { w, en, e } : { w, en }; };
const ws = (...s: string[]) => s.map(W);
/** A word to read: its aksharalu (letter blocks) in order. Encoded 'త-ల|head|<emoji>'. */
interface Rd { w: string; parts: string[]; en: string; e?: string }
const R = (s: string): Rd => { const [ps, en, e] = s.split('|'); const parts = ps.split('-'); return { w: parts.join(''), parts, en, ...(e ? { e } : {}) }; };
const emo = (e: string): VisualSpec => ({ kind: 'emoji', text: e });

/** One new letter or vowel sign. */
interface Item {
  s: string;
  /** a vowel sign (gunintham mark) that joins a consonant */
  sign?: boolean;
  /** sound in simple Roman letters for parents, e.g. "ta" */
  sound: string;
  /** name of a sign: [English, Telugu] */
  name?: [string, string];
  /** words mostly have this letter in the middle (not at the start) */
  inside?: boolean;
  words: Wd[];
  /** how to write it: [English, Telugu] */
  shape?: [string, string];
}
interface Lesson {
  n: number | string; id: string; te: string; en: string;
  hero: Wd;
  /** what the lesson word is about: [English, Telugu] */
  about: [string, string];
  items: Item[];
  /** original 4-line rhyme: [Telugu, English] */
  rhyme: [string, string][];
  read: Rd[];
  note?: string;
  extra?: OSpec[];
}

const disp = (i: Item) => (i.sign ? `◌${i.s}` : i.s);
const VOWELS = ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ'];
const CONS = ['క', 'ఖ', 'గ', 'ఘ', 'చ', 'ఛ', 'జ', 'ఝ', 'ట', 'ఠ', 'డ', 'ఢ', 'ణ', 'త', 'థ', 'ద', 'ధ', 'న', 'ప', 'ఫ', 'బ', 'భ', 'మ', 'య', 'ర', 'ల', 'వ', 'శ', 'ష', 'స', 'హ', 'ళ'];
const ALL_LETTERS = [...VOWELS, ...CONS];
const ALL_SIGNS = ['ా', 'ి', 'ీ', 'ు', 'ూ', 'ె', 'ే', 'ొ', 'ో', 'ై', 'ౌ', 'ం', 'ృ'];
const ALL_MARKS = [...ALL_LETTERS, ...ALL_SIGNS.map((s) => `◌${s}`)];

// Letters and signs learnt so far (filled lesson by lesson, in book order).
const KNOWN_L: string[] = [];
const KNOWN_S: string[] = [];
// Every picture word (for "not this letter" distractors), filled as lessons are declared.
const BANK: Wd[] = [];

const OK = L('Well done! ', 'భలే! ');
const ALMOST = L('Almost there — try once more! ', 'దాదాపు వచ్చేశావు — ఇంకోసారి ప్రయత్నించు! ');
const fb = (en: string, te: string): Localized => L(ALMOST.en + en, ALMOST.te + te);
const SAY = L('Say it aloud slowly and listen to each sound.', 'గట్టిగా, నెమ్మదిగా పలికి ప్రతి ధ్వని విను.');

// ------------------------------------------------------------------ objective builders
function lettersObj(ls: Lesson, knownL: string[], knownS: string[]): OSpec {
  const its = ls.items;
  const letters = its.filter((i) => !i.sign), signs = its.filter((i) => i.sign);
  const list = its.map(disp).join(', ');
  const cons = knownL.filter((c) => CONS.includes(c));
  const intro: Block[] = [p(ls.about[0], ls.about[1])];
  const heroPic = ls.hero.e ?? its.flatMap((i) => i.words).find((w) => w.e)?.e;
  if (heroPic) intro.push(photo(heroPic, L(`${ls.hero.w} — ${ls.hero.en}`, ls.hero.w)));
  for (const i of its) {
    const w0 = i.words[0];
    if (i.sign) {
      const c = cons[0] ?? 'క';
      intro.push(p(`${disp(i)} is the "${i.name![0]}" sign. Joined to a letter it adds the sound "${i.sound}": ${c} + ${disp(i)} = ${c}${i.s}. You can hear it in ${w0.w} (${w0.en}).`,
        `${disp(i)} గుర్తును "${i.name![1]}" అంటారు. ఇది అక్షరానికి చేరితే కొత్త ధ్వని వస్తుంది: ${c} + ${disp(i)} = ${c}${i.s}. "${w0.w}" లో విను.`));
    } else {
      intro.push(p(`${i.s} says "${i.sound}". ${i.inside ? 'You can find it inside' : 'It is the first sound of'} ${w0.w} (${w0.en}).`,
        `${i.s} — ${i.inside ? `"${w0.w}" లో ఈ అక్షరం ఉంది` : `"${w0.w}" లో మొదటి అక్షరం`}. ${i.s}, ${i.s}, ${i.s} — మూడుసార్లు పలుకు!`));
    }
    if (i.shape) intro.push(tip(i.shape[0], i.shape[1]));
  }
  intro.push(h('Sing along! (clap on every word)', 'పాడుకుందాం! (ప్రతి మాటకు చప్పట్లు)'));
  intro.push(keys(...ls.rhyme.map(([te, en]) => L(en, te))));
  intro.push(tip('Trace each new letter in the air with your finger, then on your palm, then on paper.', 'కొత్త అక్షరాన్ని ముందు గాలిలో వేలితో, తర్వాత అరచేతిలో, తర్వాత కాగితంపై రాయి.'));

  const examples: ExSpec[] = [];
  for (const i of its.slice(0, 2)) examples.push(itemEx(i, i.words[0], cons));
  if (examples.length < 2) examples.push(itemEx(its[0], its[0].words[1] ?? its[0].words[0], cons, true));

  const practice: TSpec[] = [];
  const cands = letters.flatMap((i) => i.words.filter((w) => w.w.startsWith(i.s)).map((w) => ({ i, w })));
  if (cands.length) {
    practice.push(tp('first', (r) => {
      const { i, w } = r.pick(cands);
      const pool = [...r.shuffle(letters.map((x) => x.s)), ...r.shuffle(knownL), ...r.shuffle(ALL_LETTERS)].filter((x) => x !== i.s && !w.w.startsWith(x));
      return {
        type: 'mcq', prompt: L(`Say "${w.w}" (${w.en}) slowly. Which letter does it start with?`, `"${w.w}" అని నెమ్మదిగా పలుకు. ఇది ఏ అక్షరంతో మొదలవుతుంది?`),
        ...(w.e ? { visual: emo(w.e) } : {}), ...choose(r, i.s, pool, 3),
        hints: [SAY, L(`It is one of this lesson's letters: ${letters.map((x) => x.s).join(', ')}.`, `ఇది ఈ పాఠంలోని అక్షరాల్లో ఒకటి: ${letters.map((x) => x.s).join(', ')}.`)],
        mistakes: [{ when: 'wrong', explain: fb(`Listen to the very first sound of "${w.w}".`, `"${w.w}" లో మొదటి ధ్వని విను.`) }],
        solution: [L(`${OK.en}"${w.w}" starts with ${i.s} ("${i.sound}").`, `${OK.te}"${w.w}" ${i.s} తో మొదలవుతుంది.`)],
      };
    }));
  }
  if (signs.length) {
    practice.push(tp('join', (r) => {
      const sg = r.pick(signs), c = r.pick(cons);
      const ans = c + sg.s;
      const others = r.shuffle(knownS.filter((x) => x !== sg.s)).map((x) => c + x);
      const wrong = [...others.slice(0, 1), c, r.pick(cons.filter((x) => x !== c)) + sg.s, ...others.slice(1)];
      return {
        type: 'mcq', prompt: L(`Join them and read: ${c} + ${disp(sg)} (${sg.name![0]}) = ?`, `కలిపి చదువు: ${c} + ${disp(sg)} (${sg.name![1]}) = ?`),
        ...choose(r, ans, wrong, 3),
        hints: [L(`Start with ${c}, then add the sign ${disp(sg)}.`, `${c} తో మొదలుపెట్టి, దానికి ${disp(sg)} గుర్తు చేర్చు.`), L(`The sign ${disp(sg)} adds the sound "${sg.sound}".`, `${disp(sg)} గుర్తు చేరితే ధ్వని మారుతుంది — ${sg.words[0].w} లో లాగా.`)],
        mistakes: [{ when: 'wrong', explain: fb(`Look for ${c} wearing the ${disp(sg)} sign.`, `${disp(sg)} గుర్తు ఉన్న ${c} కోసం చూడు.`) }],
        solution: [L(`${c} + ${disp(sg)} = ${ans}`, `${c} + ${disp(sg)} = ${ans}`), L(`${OK.en}Read it: ${ans}.`, `${OK.te}చదువు: ${ans}.`)],
      };
    }));
  }
  practice.push(tp('spot', (r) => {
    const mine = its.map(disp);
    const ok = r.shuffle(mine).slice(0, 3);
    const others = r.shuffle(ALL_MARKS.filter((x) => !mine.includes(x))).slice(0, 5 - ok.length);
    return {
      type: 'tap', prompt: L(`Tap only the new ${signs.length && !letters.length ? 'signs' : 'letters'} from this lesson ("${ls.hero.w}").`, `ఈ పాఠం ("${ls.hero.w}") లో నేర్చుకున్న కొత్త ${signs.length && !letters.length ? 'గుర్తులను' : 'అక్షరాలను'} మాత్రమే నొక్కు.`),
      ...tapAll(r, [...ok.map((x) => ({ label: L(x, x), ok: true })), ...others.map((x) => ({ label: L(x, x), ok: false }))]),
      hints: [L(`This lesson's new ones: ${list}.`, `ఈ పాఠంలో కొత్తవి: ${list}.`), L(`There ${ok.length === 1 ? 'is 1 to tap' : `are ${ok.length} to tap`}.`, `నొక్కాల్సినవి ${ok.length}.`)],
      mistakes: [{ when: 'wrong', explain: fb('Look at each shape carefully — some letters look alike.', 'ప్రతి ఆకారాన్ని జాగ్రత్తగా చూడు — కొన్ని అక్షరాలు ఒకేలా కనిపిస్తాయి.') }],
      solution: [L(`${OK.en}The new ones here are ${ok.join(', ')}.`, `${OK.te}ఇక్కడ కొత్తవి: ${ok.join(', ')}.`)],
    };
  }));
  practice.push(rhymeT(ls.rhyme, ls.items.flatMap((i) => i.words.map((w) => w.w))));
  const title = !signs.length ? L(`Meet the letters ${list}`, `${list} — అక్షరాలు నేర్చుకుందాం`)
    : !letters.length ? L(`Meet the vowel signs ${list}`, `గుణింతం గుర్తులు: ${list}`) : L(`New letter and sign: ${list}`, `కొత్త అక్షరం, గుర్తు: ${list}`);
  return { id: `ts1.te.${ls.id}.letters`, title, prereqs: [], intro, examples, practice };
}

function itemEx(i: Item, w: Wd, cons: string[], second = false): ExSpec {
  const vis = w.e ? emo(w.e) : undefined;
  if (i.sign) {
    const c = cons[second ? 1 : 0] ?? 'క';
    return ex(L(`${c} + ${disp(i)} = ?`, `${c} + ${disp(i)} = ?`),
      [L(`Start with ${c}.`, `${c} తో మొదలుపెట్టు.`), L(`Add the ${i.name![0]} sign ${disp(i)} — the sound becomes "${i.sound}".`, `${i.name![1]} గుర్తు ${disp(i)} చేర్చు.`), L(`Read it as one: ${c}${i.s}. Like in ${w.w} (${w.en}).`, `కలిపి చదువు: ${c}${i.s}. "${w.w}" లో లాగా.`)],
      L(`${c}${i.s}`, `${c}${i.s}`), vis);
  }
  if (i.inside && !w.w.startsWith(i.s)) {
    return ex(L(`Can you find ${i.s} in "${w.w}" (${w.en})?`, `"${w.w}" లో ${i.s} ఎక్కడ ఉంది?`),
      [L(`Say the word slowly: ${w.w}.`, `నెమ్మదిగా పలుకు: ${w.w}.`), L(`Look at each letter block. One of them has ${i.s} ("${i.sound}").`, `ప్రతి అక్షరాన్ని చూడు — ఒకదానిలో ${i.s} ఉంది.`)],
      L(`Yes — "${w.w}" has ${i.s}.`, `అవును — "${w.w}" లో ${i.s} ఉంది.`), vis);
  }
  return ex(L(`Which letter does "${w.w}" (${w.en}) start with?`, `"${w.w}" ఏ అక్షరంతో మొదలవుతుంది?`),
    [L(`Say it slowly: ${w.w}.`, `నెమ్మదిగా పలుకు: ${w.w}.`), L(`The first sound is "${i.sound}" — that is ${i.s}.`, `మొదటి ధ్వని "${i.s}".`)],
    L(i.s, i.s), vis);
}

function rhymeT(lines: [string, string][], extra: string[], key = 'rhyme'): TSpec {
  const lasts = lines.map(([te]) => te.split(' ').pop()!);
  return tp(key, (r) => {
    const k = r.int(0, lines.length - 1);
    const [te, en] = lines[k];
    const head = te.split(' ').slice(0, -1).join(' ');
    return {
      type: 'mcq', prompt: L(`Sing the rhyme and fill the gap: "${head} ___" (${en})`, `పాట పాడి ఖాళీ నింపు: "${head} ___"`),
      ...choose(r, lasts[k], [...r.shuffle(lasts.filter((x) => x !== lasts[k])), ...r.shuffle(extra)], 3),
      hints: [L('Sing the whole rhyme from the start, clapping.', 'పాటను మొదటి నుంచి చప్పట్లు కొడుతూ పాడు.'), L(`This line is line ${k + 1} of the rhyme.`, `ఇది పాటలో ${k + 1}వ వరుస.`)],
      mistakes: [{ when: 'wrong', explain: fb('Sing the line again — which word sounds right at the end?', 'ఆ వరుసను మళ్ళీ పాడు — చివర ఏ మాట సరిపోతుంది?') }],
      solution: [L(`${OK.en}"${te}" — ${en}.`, `${OK.te}"${te}"`)],
    };
  }, 2);
}

function wordsObj(ls: Lesson): OSpec {
  const its = ls.items;
  const list = its.map(disp).join(', ');
  const has = (w: Wd, i: Item) => (i.inside || i.sign ? w.w.includes(i.s) : w.w.startsWith(i.s));
  const askEn = (i: Item) => (i.sign ? `has the sign ${disp(i)} (${i.name![0]})` : i.inside ? `has ${i.s} in it` : `starts with ${i.s}`);
  const askTe = (i: Item) => (i.sign ? `${disp(i)} (${i.name![1]}) గుర్తు ఉన్న` : i.inside ? `${i.s} ఉన్న` : `${i.s} తో మొదలయ్యే`);
  const picWords = its.flatMap((i) => i.words.filter((w) => w.e && has(w, i)).map((w) => ({ i, w })));
  const pics = [...new Map(its.flatMap((i) => i.words).filter((w) => w.e).map((w) => [w.e!, w])).values()];
  const intro: Block[] = [
    p('Say each picture name aloud and listen for the new sound. The picture helps you remember the letter.', 'ప్రతి బొమ్మ పేరు గట్టిగా చెప్పు, కొత్త ధ్వని కోసం విను. బొమ్మ అక్షరాన్ని గుర్తుంచుకోవడానికి సహాయం చేస్తుంది.'),
    ...pics.slice(0, 3).map((w) => photo(w.e!, L(`${w.w} — ${w.en}`, w.w))),
    p(`Words for ${list}: ${its.flatMap((i) => i.words.slice(0, 3).map((w) => `${w.w} (${w.en})`)).join(', ')}.`, `${list} పదాలు: ${its.flatMap((i) => i.words.slice(0, 3).map((w) => w.w)).join(', ')}.`),
    tip('Play "I spy": look around your home for things whose names have these sounds!', 'ఆట ఆడు: ఇంట్లో ఈ ధ్వనులతో పేర్లు ఉన్న వస్తువులను వెతుకు!'),
  ];
  const i0 = its[0], w1 = i0.words[0];
  const no = BANK.find((b) => !b.w.includes(i0.s) && b.e !== w1.e)!;
  const examples: ExSpec[] = [
    ex(L(`Does "${w1.w}" (${w1.en}) ${askEn(i0).replace(/^has/, 'have').replace(/^starts/, 'start')}?`, `"${w1.w}" ${askTe(i0)} పదమేనా?`),
      [L(`Say it slowly: ${w1.w}.`, `నెమ్మదిగా పలుకు: ${w1.w}.`), L(`Yes, we hear ${disp(i0)} ("${i0.sound}").`, `అవును, ${disp(i0)} వినిపిస్తోంది.`)], L('Yes', 'అవును'), w1.e ? emo(w1.e) : undefined),
    ex(L(`Does "${no.w}" (${no.en}) ${askEn(i0).replace(/^has/, 'have').replace(/^starts/, 'start')}?`, `"${no.w}" ${askTe(i0)} పదమేనా?`),
      [L(`Say it slowly: ${no.w}.`, `నెమ్మదిగా పలుకు: ${no.w}.`), L(`We do not hear ${disp(i0)} where we need it.`, `ఇందులో ${disp(i0)} లేదు.`)], L('No', 'కాదు'), no.e ? emo(no.e) : undefined),
  ];
  const practice: TSpec[] = [];
  if (picWords.length) {
    practice.push(tp('pic', (r) => {
      const { i, w } = r.pick(picWords);
      const wrong = r.shuffle(BANK.filter((b) => b.e && b.e !== w.e && !b.w.includes(i.s))).slice(0, 2);
      return {
        type: 'mcq', prompt: L(`Which picture's name ${askEn(i)}?`, `${askTe(i)} బొమ్మ ఏది?`),
        ...pictures(r, { label: L(`${w.w} (${w.en})`, w.w), visual: emo(w.e!) }, wrong.map((b) => ({ label: L(`${b.w} (${b.en})`, b.w), visual: emo(b.e!) }))),
        hints: [L('Say each picture name aloud.', 'ప్రతి బొమ్మ పేరు గట్టిగా చెప్పు.'), L(`Listen for "${i.sound}".`, `${disp(i)} ధ్వని కోసం విను.`)],
        mistakes: [{ when: 'wrong', explain: fb(`Say that name again — do you hear ${disp(i)}?`, `ఆ పేరు మళ్ళీ చెప్పు — ${disp(i)} వినిపిస్తోందా?`) }],
        solution: [L(`${OK.en}${w.w} (${w.en}) ${askEn(i)}.`, `${OK.te}"${w.w}" — ${askTe(i)} పదం.`)],
      };
    }));
  }
  const yes = its.flatMap((i) => i.words.filter((w) => has(w, i)).map((w) => ({ i, w })));
  practice.push(tp('yesno', (r) => {
    const i = r.pick(its);
    const pos = yes.filter((x) => x.i === i);
    const isYes = r.next() < 0.5 && pos.length > 0;
    const w = isYes ? r.pick(pos).w : r.pick(BANK.filter((b) => !b.w.includes(i.s)));
    const q = askEn(i).replace(/^has/, 'have').replace(/^starts/, 'start');
    return {
      type: 'mcq', prompt: L(`Does "${w.w}" (${w.en}) ${q}?`, `"${w.w}" ${askTe(i)} పదమేనా?`), ...(w.e ? { visual: emo(w.e) } : {}),
      ...choose(r, isYes ? L('Yes', 'అవును') : L('No', 'కాదు'), [isYes ? L('No', 'కాదు') : L('Yes', 'అవును')], 2),
      hints: [L(`Say "${w.w}" slowly, one part at a time.`, `"${w.w}" ను ముక్కలుగా నెమ్మదిగా పలుకు.`), L(`Listen for ${disp(i)} ("${i.sound}").`, `${disp(i)} కోసం విను.`)],
      mistakes: [{ when: 'wrong', explain: fb(`Say "${w.w}" once more and listen carefully.`, `"${w.w}" ను మళ్ళీ పలికి జాగ్రత్తగా విను.`) }],
      solution: [isYes ? L(`${OK.en}Yes — "${w.w}" ${askEn(i)}.`, `${OK.te}అవును — "${w.w}" ${askTe(i)} పదం.`) : L(`${OK.en}No — "${w.w}" does not.`, `${OK.te}కాదు — "${w.w}" లో ${disp(i)} ఉండాల్సిన చోట లేదు.`)],
    };
  }));
  if (pics.length >= 3) {
    practice.push(tp('match', (r) => {
      const set = r.shuffle(pics).slice(0, 3);
      const m = matching(r, set.map((w) => [L(w.w, w.w), L(w.e!, w.e!)]));
      return {
        type: 'match', prompt: L(`Read each word and join it to its picture: ${set.map((w) => w.w).join(', ')}.`, `ప్రతి పదాన్ని చదివి దాని బొమ్మతో కలుపు: ${set.map((w) => w.w).join(', ')}.`), ...m,
        hints: [L('Read the first letter of each word.', 'ప్రతి పదంలో మొదటి అక్షరం చదువు.'), L('Start with the word you know best.', 'బాగా తెలిసిన పదంతో మొదలుపెట్టు.')],
        mistakes: [{ when: 'wrong', explain: fb('One pair is mixed up — read each word again.', 'ఒక జత మారింది — ప్రతి పదాన్ని మళ్ళీ చదువు.') }],
        solution: set.map((w) => L(`${w.w} → ${w.e} (${w.en})`, `${w.w} → ${w.e}`)),
      };
    }, 2));
  }
  return { id: `ts1.te.${ls.id}.words`, title: L(`Picture words with ${list}`, `${list} — బొమ్మల పదాలు`), prereqs: [`ts1.te.${ls.id}.letters`], intro, examples, practice };
}

function readObj(id: string, rd: Rd[], prereqs: string[]): OSpec {
  const buildable = rd.filter((x) => x.parts.length >= 2 && new Set(x.parts).size === x.parts.length);
  const pic = rd.find((x) => x.e) ?? rd[0];
  const intro: Block[] = [
    p('Letters join to make words. Say each letter, then say them together quickly — that is reading!', 'అక్షరాలు కలిస్తే పదాలు అవుతాయి. ఒక్కొక్క అక్షరం పలికి, తర్వాత కలిపి వేగంగా చదువు — అదే చదవడం!'),
    ...(pic.e ? [photo(pic.e, L(`${pic.parts.join(' + ')} = ${pic.w} (${pic.en})`, `${pic.parts.join(' + ')} = ${pic.w}`))] : []),
    p(`Words to read: ${rd.map((x) => `${x.w} (${x.en})`).join(', ')}.`, `చదువుదాం: ${rd.map((x) => x.w).join(', ')}.`),
    remember('Read from left to right ➡️ and point to each letter as you read.', 'ఎడమ నుండి కుడికి ➡️ చదువు; చదివేటప్పుడు ప్రతి అక్షరాన్ని వేలితో చూపించు.'),
  ];
  const examples: ExSpec[] = rd.slice(0, 2).map((x) => ex(L(`Read: ${x.parts.join(' + ')}`, `చదువు: ${x.parts.join(' + ')}`),
    [L(`Say each one: ${x.parts.join(', ')}.`, `ఒక్కొక్కటి పలుకు: ${x.parts.join(', ')}.`), L(`Now say them together quickly: ${x.w}!`, `ఇప్పుడు కలిపి వేగంగా: ${x.w}!`)],
    L(`${x.w} (${x.en})`, x.w), x.e ? emo(x.e) : undefined));
  const practice: TSpec[] = [];
  if (buildable.length) {
    practice.push(tp('build', (r) => {
      const x = r.pick(buildable);
      return {
        type: 'order', prompt: L(`Put the letters in order to make "${x.w}" (${x.en}).`, `అక్షరాలను వరుసగా పెట్టి "${x.w}" పదం చేయి.`), ...(x.e ? { visual: emo(x.e) } : {}),
        ...ordering(r, x.parts.map((s) => L(s, s))),
        hints: [L(`Say "${x.w}" slowly — which part comes first?`, `"${x.w}" నెమ్మదిగా పలుకు — మొదట ఏ ముక్క వస్తుంది?`), L(`It begins with ${x.parts[0]}.`, `మొదటిది ${x.parts[0]}.`)],
        mistakes: [{ when: 'wrong', explain: fb('Read your word from left to right. Does it sound right?', 'నువ్వు చేసిన పదాన్ని ఎడమ నుండి కుడికి చదువు. సరిగా వినిపిస్తోందా?') }],
        solution: [L(`${x.parts.join(' → ')} = ${x.w}`, `${x.parts.join(' → ')} = ${x.w}`), L(`${OK.en}${x.w} means ${x.en}.`, `${OK.te}${x.w}!`)],
      };
    }, 2));
  }
  practice.push(tp('blend', (r) => {
    const x = r.pick(rd);
    const rev = [...x.parts].reverse().join('');
    const wrong = [rev, ...r.shuffle(rd.filter((y) => y !== x).map((y) => y.w))].filter((y) => y !== x.w);
    return {
      type: 'mcq', prompt: L(`Blend the letters and read: ${x.parts.join(' + ')} = ?`, `అక్షరాలు కలిపి చదువు: ${x.parts.join(' + ')} = ?`),
      ...choose(r, x.w, wrong.length ? wrong : [x.parts[0]], 3),
      hints: [L(`Say ${x.parts.join(', ')} — faster and faster.`, `${x.parts.join(', ')} — వేగంగా వేగంగా పలుకు.`), L(`The word starts with ${x.parts[0]}.`, `పదం ${x.parts[0]} తో మొదలవుతుంది.`)],
      mistakes: [{ when: 'wrong', explain: fb('Check the order: the first letter must come first.', 'వరుస చూడు: మొదటి అక్షరం మొదటే రావాలి.') }],
      solution: [L(`${x.parts.join(' + ')} = ${x.w} (${x.en}).`, `${x.parts.join(' + ')} = ${x.w}.`)],
    };
  }));
  practice.push(tp('count', (r) => {
    const x = r.pick(rd);
    const n = x.parts.length;
    return {
      type: 'mcq', prompt: L(`Clap and count: how many letter blocks (aksharalu) are in "${x.w}" (${x.en})?`, `చప్పట్లు కొడుతూ లెక్కపెట్టు: "${x.w}" లో ఎన్ని అక్షరాలు?`), ...(x.e ? { visual: emo(x.e) } : {}),
      ...chooseNum(r, n, n > 1 ? [n + 1, n - 1] : [2, 3], String, 3),
      hints: [L('Clap once for each part as you say the word.', 'పదం పలుకుతూ ప్రతి ముక్కకు ఒక చప్పట్లు కొట్టు.'), L(`It begins with ${x.parts[0]}.`, `మొదటి ముక్క ${x.parts[0]}.`)],
      mistakes: [{ when: 'wrong', explain: fb('Clap slowly and count the claps.', 'నెమ్మదిగా చప్పట్లు కొట్టి లెక్కపెట్టు.') }],
      solution: [L(`${x.parts.join(' - ')} → ${n} claps.`, `${x.parts.join(' - ')} → ${n} చప్పట్లు.`)],
    };
  }));
  return { id: `ts1.te.${id}.read`, title: L('Read and make little words', 'చిన్న పదాలు చదువుదాం, కూర్చుదాం'), prereqs, intro, examples, practice };
}

const NOTE = 'Original WonderLab teaching built from the lesson word and letter list; the textbook page is not reproduced. Telugu wording and rhymes need native-speaker / teacher review.';

function lesson(ls: Lesson): USpec {
  for (const i of ls.items) (i.sign ? KNOWN_S : KNOWN_L).includes(i.s) || (i.sign ? KNOWN_S : KNOWN_L).push(i.s);
  for (const w of ls.items.flatMap((i) => i.words)) if (!BANK.some((b) => b.w === w.w)) BANK.push(w);
  const knownL = [...KNOWN_L], knownS = [...KNOWN_S];
  // wordsObj reads BANK lazily inside templates, so later lessons' words also serve as distractors.
  const objectives = [lettersObj(ls, knownL, knownS), wordsObj(ls), readObj(ls.id, ls.read, [`ts1.te.${ls.id}.words`]), ...(ls.extra ?? [])];
  return {
    id: `ts1.te.${ls.id}`, subject: 'telugu', title: L(`Lesson ${ls.n}: ${ls.en}`, `పాఠం ${ls.n}: ${ls.te}`),
    source: tsSrc(1, 'telugu', ls.n), objectives, note: ls.note ? `${NOTE} ${ls.note}` : NOTE,
  };
}

// ------------------------------------------------------------------ simple question banks (readiness, stories, riddles)
interface FQ { q: Localized; a: Localized; w: Localized[]; h: Localized; e?: string }
const fq = (qEn: string, qTe: string, a: [string, string], w: [string, string][], h: [string, string], e?: string): FQ =>
  ({ q: L(qEn, qTe), a: L(a[0], a[1]), w: w.map(([x, y]) => L(x, y)), h: L(h[0], h[1]), ...(e ? { e } : {}) });
const bankT = (key: string, bank: FQ[], hint: Localized) => tp(key, (r) => {
  const f = r.pick(bank);
  return {
    type: 'mcq', prompt: f.q, ...(f.e ? { visual: emo(f.e) } : {}), ...choose(r, f.a, f.w, 3),
    hints: [hint, f.h], mistakes: [{ when: 'wrong', explain: fb(f.h.en, f.h.te!) }],
    solution: [L(`${OK.en}Answer: ${f.a.en}.`, `${OK.te}జవాబు: ${f.a.te}.`)],
  };
});
const orderT = (key: string, prompt: Localized, seq: [string, string][]) => tp(key, (r) => ({
  type: 'order', prompt, ...ordering(r, seq.map(([te, en]) => L(en, te))),
  hints: [L(`It begins: "${seq[0][1]}"`, `మొదలు: "${seq[0][0]}"`), L(`It ends: "${seq[seq.length - 1][1]}"`, `చివర: "${seq[seq.length - 1][0]}"`)],
  mistakes: [{ when: 'wrong', explain: fb('Say it from the start and check what comes next.', 'మొదటి నుంచి చెప్పి, తర్వాత ఏది వస్తుందో చూడు.') }],
  solution: seq.map(([te, en], k) => L(`${k + 1}. ${en}`, `${k + 1}. ${te}`)),
}), 2);

// ================================================================== lessons
const ch1 = lesson({
  n: 1, id: 'ch1', te: 'తబల', en: 'Tabala (the tabla drum)', hero: W('తబల|tabla drums|🥁'),
  about: ['Our first word is తబల — the tabla, a pair of drums that go "ta-ka-dhi-mi". It has three letters: త, బ, ల.', 'మన మొదటి పదం తబల. తబల మోగిస్తే "తకధిమి" అని వినిపిస్తుంది. ఇందులో మూడు అక్షరాలు: త, బ, ల.'],
  items: [
    { s: 'త', sound: 'ta', words: ws('తబల|tabla drums|🥁', 'తాబేలు|tortoise|🐢', 'తలుపు|door|🚪', 'తాడు|rope|🪢', 'తాళం|lock|🔒'), shape: ['త: a small hook on top and a round belly below.', 'త: పైన చిన్న తలకట్టు, కింద గుండ్రని పొట్ట.'] },
    { s: 'బ', sound: 'ba', words: ws('బంతి|ball|⚽', 'బాతు|duck|🦆', 'బస్సు|bus|🚌', 'బుట్ట|basket|🧺', 'బూర|trumpet|🎺'), shape: ['బ: a round shape with a tick on top.', 'బ: గుండ్రని ఆకారం, పైన తలకట్టు.'] },
    { s: 'ల', sound: 'la', words: ws('లేడి|deer|🦌', 'లడ్డు|laddoo|🟠', 'లత|creeper plant|🌿'), shape: ['ల: two little humps side by side, with a tick on top.', 'ల: పక్కపక్కన రెండు చిన్న వంపులు, పైన తలకట్టు.'] },
  ],
  rhyme: [['తబల తబల తకధిమి', 'Tabla, tabla, ta-ka-dhi-mi'], ['తల ఊపుతూ ఆడుదాం', 'Nodding our heads, let us dance'], ['బంతి బంతి ఎగిరింది', 'The ball, the ball flew up high'], ['లడ్డు తిని నవ్వుదాం', 'Eat a laddoo and let us laugh']],
  read: [R('త-బ-ల|tabla|🥁'), R('త-ల|head'), R('ల-త|creeper|🌿')],
});

const ch2 = lesson({
  n: 2, id: 'ch2', te: 'కంజర', en: 'Kanjara (a small hand drum)', hero: W('కంజర|kanjara, a hand drum with jingles'),
  about: ['కంజర is a small round hand drum with jingles. In it we meet క, జ, ర and the little circle ం (sunna), which adds an "m" sound.', 'కంజర — గజ్జెలు ఉన్న చిన్న చేతి డప్పు. ఇందులో క, జ, ర అక్షరాలు, ం (సున్నా) గుర్తు నేర్చుకుంటాం.'],
  items: [
    { s: 'క', sound: 'ka', words: ws('కప్ప|frog|🐸', 'కాకి|crow|🐦‍⬛', 'కోతి|monkey|🐒', 'కుక్క|dog|🐶', 'కలం|pen|🖊️', 'కుర్చీ|chair|🪑'), shape: ['క: a line down the middle with arms on both sides.', 'క: మధ్యలో నిలువు గీత, రెండు వైపులా చేతులు.'] },
    { s: 'జ', sound: 'ja', words: ws('జింక|deer|🦌', 'జెండా|flag|🚩', 'జిరాఫీ|giraffe|🦒', 'జీబ్రా|zebra|🦓'), shape: ['జ: a round body with a long tail curling below.', 'జ: గుండ్రని ఆకారం, కింద పొడవైన తోక.'] },
    { s: 'ర', sound: 'ra', words: ws('రైలు|train|🚆', 'రాయి|stone|🪨', 'రంపం|saw|🪚', 'రంగులు|colours|🎨'), shape: ['ర: like a little wave with a tick on top.', 'ర: చిన్న అల లాగా, పైన తలకట్టు.'] },
    { s: 'ం', sign: true, sound: 'm (closing hum)', name: ['sunna', 'సున్నా'], inside: true, words: ws('కలం|pen|🖊️', 'బలం|strength|💪', 'శంఖం|conch shell|🐚', 'మంచం|cot|🛏️', 'పటం|map|🗺️') },
  ],
  rhyme: [['కప్ప ఎగిరె బెకబెక', 'The frog hops, croak croak'], ['జింక పరుగు చెంగుచెంగు', 'The deer runs, leap leap'], ['రైలు వచ్చెను కూకూ', 'The train comes, choo choo'], ['కంజర మోగెను ఝణఝణ', 'The kanjara rings, jingle jingle']],
  read: [R('క-లం|pen|🖊️'), R('బ-లం|strength|💪'), R('జ-లం|water|💧'), R('క-రం|hand'), R('కం-జ-ర|kanjara drum')],
});

const ch3 = lesson({
  n: 3, id: 'ch3', te: 'ఆట', en: 'Aata (play)', hero: W('ఆట|play, a game|⚽'),
  about: ['ఆట means play! Children love games — running, ball, hide and seek. ఆట has the long vowel ఆ ("aa") and the letter ట.', 'ఆట అంటే ఆడుకోవడం! పరుగు, బంతి, దాగుడుమూతలు — ఆటలంటే మనకు ఇష్టం. ఆట లో ఆ, ట నేర్చుకుందాం.'],
  items: [
    { s: 'ఆ', sound: 'aa (long a)', words: ws('ఆవు|cow|🐄', 'ఆకు|leaf|🍃', 'ఆపిల్|apple|🍎', 'ఆటో|auto rickshaw|🛺'), shape: ['ఆ: like అ with an extra tail — the tail makes the sound long.', 'ఆ: అ కు ఒక తోక చేరినట్టు — తోక వల్ల ధ్వని పొడవు.'] },
    { s: 'ట', sound: 'ṭa (tongue up)', words: ws('టమాట|tomato|🍅', 'టోపీ|cap|🎩', 'టీ|tea|☕', 'టెంకాయ|coconut|🥥'), shape: ['ట: a round shape open on one side, with a tick on top.', 'ట: ఒక వైపు తెరిచిన గుండ్రం, పైన తలకట్టు.'] },
  ],
  rhyme: [['ఆట ఆడుదాం రండి', 'Come, let us play'], ['ఆవు అరిచె అంబా', 'The cow calls, ambaa'], ['టమాట ఎరుపు చూడండి', 'See how red the tomato is'], ['టోపీ పెట్టుకొని గెంతండి', 'Put on a cap and jump']],
  read: [R('ఆ-ట|play|⚽'), R('క-లం|pen|🖊️'), R('త-బ-ల|tabla|🥁'), R('బ-లం|strength|💪')],
  note: 'Few words can be read with only the letters learnt so far; earlier words are revised.',
});

const ch4 = lesson({
  n: 4, id: 'ch4', te: 'ఉంగరం', en: 'Ungaram (ring)', hero: W('ఉంగరం|ring'),
  about: ['ఉంగరం is a ring we wear on a finger. It starts with the vowel ఉ ("u") and has the letter గ.', 'ఉంగరం వేలికి పెట్టుకుంటాం. ఇది ఉ తో మొదలవుతుంది; ఇందులో గ కూడా ఉంది.'],
  items: [
    { s: 'ఉ', sound: 'u (short)', words: ws('ఉడుత|squirrel|🐿️', 'ఉల్లిపాయ|onion|🧅', 'ఉంగరం|ring', 'ఉప్పు|salt'), shape: ['ఉ: a curl like a small snail shell.', 'ఉ: చిన్న నత్త గుల్ల లాంటి చుట్టు.'] },
    { s: 'గ', sound: 'ga', words: ws('గుర్రం|horse|🐎', 'గంట|bell|🔔', 'గొడుగు|umbrella|☂️', 'గుడ్డు|egg|🥚', 'గుడి|temple|🛕', 'గొర్రె|sheep|🐑'), shape: ['గ: like a hook with a tick on top.', 'గ: కొక్కెం లాగా, పైన తలకట్టు.'] },
  ],
  rhyme: [['ఉడుత ఉడుత ఎక్కడికి', 'Squirrel, squirrel, where to?'], ['చెట్టు కొమ్మ చివరికి', 'To the very tip of the branch'], ['గంట మోగె గణగణ', 'The bell rings, gana gana'], ['గుర్రం పరుగు టకటక', 'The horse runs, taka taka']],
  read: [R('ఉం-గ-రం|ring'), R('గం-ట|bell|🔔'), R('గ-జం|yard (measure)'), R('ఆ-ట|play|⚽')],
});

const ch5 = lesson({
  n: 5, id: 'ch5', te: 'శనగ', en: 'Shanaga (chickpea)', hero: W('శనగ|chickpea'),
  about: ['శనగలు are chickpeas — we boil or roast them for a tasty snack. శనగ has శ and న.', 'శనగలు ఉడకబెట్టి లేదా వేయించి తింటాం. శనగ లో శ, న అక్షరాలు నేర్చుకుందాం.'],
  items: [
    { s: 'శ', sound: 'sha', words: ws('శంఖం|conch shell|🐚', 'శనగలు|chickpeas', 'శరీరం|body'), shape: ['శ: a round loop with a line hanging down.', 'శ: గుండ్రని చుట్టు, కిందికి వేలాడే గీత.'] },
    { s: 'న', sound: 'na', words: ws('నక్క|fox|🦊', 'నెమలి|peacock|🦚', 'నారింజ|orange|🍊', 'నక్షత్రం|star|⭐', 'నాణెం|coin|🪙'), shape: ['న: like a wave with a tick on top.', 'న: అల లాగా, పైన తలకట్టు.'] },
  ],
  rhyme: [['శనగలు వేయిస్తే ఘుమఘుమ', 'Roasted chickpeas smell so good'], ['శంఖం ఊదితే భోంభోం', 'Blow the conch, bhom bhom'], ['నెమలి ఆడెను నాట్యం', 'The peacock does a dance'], ['నక్క పారెను అడవికి', 'The fox ran off to the forest']],
  read: [R('శ-న-గ|chickpea'), R('న-గ|jewel'), R('జ-నం|people'), R('గం-ట|bell|🔔')],
});

const ch6 = lesson({
  n: 6, id: 'ch6', te: 'అనప', en: 'Anapa (field bean)', hero: W('అనప|field bean'),
  about: ['అనప is the field bean that grows on a creeper. It begins with the first vowel అ ("a") and has ప.', 'అనపకాయలు తీగకు కాస్తాయి. అనప మొదటి అచ్చు అ తో మొదలవుతుంది; ఇందులో ప కూడా ఉంది.'],
  items: [
    { s: 'అ', sound: 'a (short)', words: ws('అరటి|banana|🍌', 'అమ్మ|mother|👩', 'అనాస|pineapple|🍍', 'అవ్వ|grandmother|👵'), shape: ['అ: a round head, a curl, and a tail going down.', 'అ: గుండ్రని తల, ఒక చుట్టు, కిందికి తోక.'] },
    { s: 'ప', sound: 'pa', words: ws('పిల్లి|cat|🐱', 'పులి|tiger|🐅', 'పువ్వు|flower|🌼', 'పడవ|boat|⛵', 'పాలు|milk|🥛', 'పుచ్చకాయ|watermelon|🍉'), shape: ['ప: like a cup open at the top, with a tick.', 'ప: పైకి తెరిచిన గిన్నె లాగా, తలకట్టుతో.'] },
  ],
  rhyme: [['అనపకాయల తీగ', 'The field-bean creeper'], ['అల్లుకుంది పందిరి పైన', 'climbed up over the trellis'], ['పిల్లి పిల్లి మియావ్', 'Kitty, kitty, miaow'], ['పాలు తాగి పడుకో', 'Drink your milk and go to sleep']],
  read: [R('అ-న-ప|field bean'), R('ప-టం|picture, map|🗺️'), R('ప-ల-క|slate'), R('అ-ర-క|plough')],
});

const ch7 = lesson({
  n: 7, id: 'ch7', te: 'సవరం', en: 'Savaram (hair braid extension)', hero: W('సవరం|savaram, a braid of hair'),
  about: ['సవరం is a long braid that is added to the hair for festivals and dances. It has స and వ.', 'సవరం — పండుగలకు, నాట్యానికి జడకు కలిపే పొడవైన జుట్టు. ఇందులో స, వ నేర్చుకుందాం.'],
  items: [
    { s: 'స', sound: 'sa', words: ws('సింహం|lion|🦁', 'సైకిల్|bicycle|🚲', 'సూర్యుడు|sun|☀️', 'సీతాకోకచిలుక|butterfly|🦋', 'సంచి|bag|🎒'), shape: ['స: a round shape with a little hook inside.', 'స: గుండ్రని ఆకారం, లోపల చిన్న కొక్కెం.'] },
    { s: 'వ', sound: 'va', words: ws('వంకాయ|brinjal|🍆', 'వాన|rain|🌧️', 'వరి|paddy|🌾', 'విమానం|aeroplane|✈️', 'వేరుశనగ|groundnut|🥜'), shape: ['వ: a round loop with a tick on top.', 'వ: గుండ్రని చుట్టు, పైన తలకట్టు.'] },
  ],
  rhyme: [['వానా వానా వల్లప్పా', 'Rain, rain, Vallappa (traditional)'], ['వాకిలి తిరుగు చెల్లప్పా', 'Twirl round the yard, little one (traditional)'], ['సవరం వేసి జడ అల్లి', 'Add the savaram, braid the hair'], ['సంపెంగ పూలు పెట్టి', 'and tuck in champak flowers']],
  read: [R('స-వ-రం|hair braid'), R('ప-న-స|jackfruit'), R('వ-ల|net'), R('వ-నం|forest'), R('క-వ-ల|twins')],
});

const ch8 = lesson({
  n: 8, id: 'ch8', te: 'ఊడ', en: 'Ooda (banyan root)', hero: W('ఊడ|hanging root of the banyan tree|🌳'),
  about: ['A banyan tree drops long ropes from its branches — these are ఊడలు. Children swing on them! ఊడ has the long vowel ఊ ("oo") and డ.', 'మర్రిచెట్టు కొమ్మల నుంచి కిందికి వేలాడే తాళ్ళే ఊడలు. పిల్లలు వాటిని పట్టుకొని ఊగుతారు! ఊడ లో ఊ, డ నేర్చుకుందాం.'],
  items: [
    { s: 'ఊ', sound: 'oo (long u)', words: ws('ఊరు|village|🏘️', 'ఊడ|banyan root|🌳', 'ఊయల|cradle swing'), shape: ['ఊ: like ఉ with an extra tail — the tail makes it long.', 'ఊ: ఉ కు ఒక తోక చేరినట్టు — ధ్వని పొడవు.'] },
    { s: 'డ', sound: 'ḍa (tongue up)', words: ws('డబ్బా|tin box|🥫', 'డాక్టర్|doctor|🧑‍⚕️', 'డబ్బులు|money|🪙'), shape: ['డ: like a round belly with a little curl, and a tick on top.', 'డ: గుండ్రని పొట్ట, చిన్న వంపు, పైన తలకట్టు.'] },
  ],
  rhyme: [['ఊరు చివర మర్రిచెట్టు', 'At the village edge, a banyan tree'], ['ఊడలు పట్టి ఊగుదాం', 'Hold the hanging roots and swing'], ['డబ్బా కొట్టి డండం', 'Beat the tin box, dum dum'], ['పడవ ఎక్కి పోదాం', 'Climb into the boat and go']],
  read: [R('ఊ-డ|banyan root|🌳'), R('ప-డ-వ|boat|⛵'), R('జ-డ|plait of hair'), R('గ-డ-ప|doorstep'), R('క-డ-వ|water pot')],
});

const ch9 = lesson({
  n: 9, id: 'ch9', te: 'దండ', en: 'Danda (garland)', hero: W('దండ|flower garland|🌸'),
  about: ['A దండ is a garland of flowers. We make దండలు for festivals and for welcoming guests. The new letter is ద.', 'పూలను దారంతో గుచ్చితే దండ అవుతుంది. పండుగలకు, అతిథులకు దండలు వేస్తాం. కొత్త అక్షరం: ద.'],
  items: [
    { s: 'ద', sound: 'da (soft d)', words: ws('దండ|garland|🌸', 'దీపం|oil lamp|🪔', 'దోసకాయ|cucumber|🥒', 'దారం|thread'), shape: ['ద: like డ but with a flat bottom — look carefully!', 'ద: డ లాగే ఉంటుంది కానీ కింద చదునుగా — జాగ్రత్తగా చూడు!'] },
  ],
  rhyme: [['దండ దండ పూలదండ', 'Garland, garland, flower garland'], ['గుడికి తీసుకెళ్దాం', 'Let us take it to the temple'], ['దీపం వెలిగె దేదీప్యం', 'The lamp glows bright'], ['దోసకాయ తిని చల్లగ', 'Eat cucumber and keep cool']],
  read: [R('దం-డ|garland|🌸'), R('ప-దం|word'), R('వ-ర-ద|flood'), R('ప-డ-వ|boat|⛵')],
});

const ch10 = lesson({
  n: 10, id: 'ch10', te: 'ఈత', en: 'Eetha (swimming)', hero: W('ఈత|swimming'),
  about: ['ఈత means swimming. Fish swim, ducks swim, and children learn to swim with an adult nearby. The new letter is the long vowel ఈ ("ee").', 'ఈత అంటే నీటిలో ఈదడం. చేపలు, బాతులు ఈదుతాయి; పిల్లలు పెద్దవాళ్ళ తోడుతో ఈత నేర్చుకుంటారు. కొత్త అక్షరం: ఈ.'],
  items: [
    { s: 'ఈ', sound: 'ee (long i)', words: ws('ఈక|feather|🪶', 'ఈత|swimming', 'ఈగ|housefly', 'ఈల|whistle'), shape: ['ఈ: like ఇ with an extra curl on top — that curl makes it long.', 'ఈ: ఇ పైన అదనపు వంపు — అది ధ్వనిని పొడవు చేస్తుంది.'] },
  ],
  rhyme: [['ఈత ఈత చెరువులో ఈత', 'Swim, swim, swim in the pond'], ['చేపల తోటి పోటీ', 'A race with the fishes'], ['ఈక ఈక నెమలి ఈక', 'Feather, feather, peacock feather'], ['ఈల వేస్తే ఊఊ', 'Blow the whistle, ooo ooo']],
  read: [R('ఈ-త|swimming'), R('ఈ-ల|whistle'), R('ఈ-గ|housefly'), R('దం-డ|garland|🌸'), R('ప-డ-వ|boat|⛵')],
});

const ch11 = lesson({
  n: 11, id: 'ch11', te: 'మంచం', en: 'Mancham (cot)', hero: W('మంచం|cot, bed|🛏️'),
  about: ['A మంచం is a cot we sleep on. Grandparents often sit on a మంచం outside the house. New letters: మ and చ.', 'మంచం మీద పడుకుంటాం. తాతయ్య, అవ్వ ఇంటి ముందు మంచం మీద కూర్చుంటారు. కొత్త అక్షరాలు: మ, చ.'],
  items: [
    { s: 'మ', sound: 'ma', words: ws('మామిడి|mango|🥭', 'మంచం|cot|🛏️', 'మేక|goat|🐐', 'మొక్కజొన్న|maize|🌽', 'మిరపకాయ|chilli|🌶️', 'మేఘం|cloud|☁️'), shape: ['మ: like వ with a small loop joined at the side.', 'మ: వ పక్కన చిన్న చుట్టు చేరినట్టు.'] },
    { s: 'చ', sound: 'cha', words: ws('చేప|fish|🐟', 'చెట్టు|tree|🌳', 'చీమ|ant|🐜', 'చిలుక|parrot|🦜', 'చేయి|hand|✋', 'చక్రం|wheel|🛞', 'చందమామ|moon|🌙'), shape: ['చ: like a round shape with a hook and a tick on top.', 'చ: గుండ్రని ఆకారం, కొక్కెం, పైన తలకట్టు.'] },
  ],
  rhyme: [['చందమామ రావే', 'Come, dear moon (traditional)'], ['జాబిల్లి రావే', 'Come, moonlight (traditional)'], ['మంచం మీద పడుకో', 'Lie down on the cot'], ['మామిడి పండు తినిపిస్తా', 'I will feed you a mango']],
  read: [R('మం-చం|cot|🛏️'), R('క-మ-ల|lotus'), R('చ-మ-ట|sweat'), R('ప-డ-మ-ర|west'), R('చ-ద-రం|square')],
});

const ch12 = lesson({
  n: 12, id: 'ch12', te: 'ఓడ', en: 'Oda (ship)', hero: W('ఓడ|ship|🚢'),
  about: ['An ఓడ is a big ship that sails on the sea. New vowels: ఒ ("o"), ఓ (long "oo") and ఔ ("au").', 'ఓడ సముద్రంలో ప్రయాణించే పెద్ద పడవ. కొత్త అచ్చులు: ఒ, ఓ, ఔ.'],
  items: [
    { s: 'ఒ', sound: 'o (short)', words: ws('ఒంటె|camel|🐪', 'ఒకటి|one', 'ఒడి|lap'), shape: ['ఒ: a round shape with a small tail on the right.', 'ఒ: గుండ్రని ఆకారం, కుడివైపు చిన్న తోక.'] },
    { s: 'ఓ', sound: 'oo as in "go" (long o)', words: ws('ఓడ|ship|🚢', 'ఓర్పు|patience'), shape: ['ఓ: like ఒ with one more curl — the long sound.', 'ఓ: ఒ కు ఇంకో వంపు — పొడవు ధ్వని.'] },
    { s: 'ఔ', sound: 'au', words: ws('ఔషధం|medicine|💊', 'ఔను|yes'), shape: ['ఔ: like ఒ with a hook on top.', 'ఔ: ఒ పైన కొక్కెం.'] },
  ],
  rhyme: [['ఓడ ఓడ సముద్రంలో ఓడ', 'Ship, ship, a ship on the sea'], ['ఒంటె నడిచె ఎడారిలో', 'The camel walks in the desert'], ['ఒకటి రెండు లెక్కపెడదాం', 'One, two — let us count'], ['ఔను ఔను అందాం', 'Yes, yes — let us say yes']],
  read: [R('ఓ-డ|ship|🚢'), R('ఒ-క|one'), R('మం-చం|cot|🛏️'), R('క-మ-ల|lotus')],
  note: 'Syllabus lists ఒ, ఓ, ఔ for this lesson.',
});

const ch13 = lesson({
  n: 13, id: 'ch13', te: 'కాకరకాయ', en: 'Kakarakaya (bitter gourd)', hero: W('కాకరకాయ|bitter gourd'),
  about: ['కాకరకాయ is the bitter gourd — bitter but good for us! We learn the letter య and our first vowel sign: దీర్ఘం ◌ా, which makes a letter long: క → కా.', 'కాకరకాయ చేదుగా ఉన్నా ఆరోగ్యానికి మంచిది! కొత్త అక్షరం య; మొదటి గుణింతం గుర్తు దీర్ఘం (◌ా): క → కా.'],
  items: [
    { s: 'య', sound: 'ya', inside: true, words: ws('రాయి|stone|🪨', 'చేయి|hand|✋', 'వంకాయ|brinjal|🍆', 'పుచ్చకాయ|watermelon|🍉', 'కాకరకాయ|bitter gourd'), shape: ['య: a round shape with a stick down the right side.', 'య: గుండ్రని ఆకారం, కుడివైపు కిందికి గీత.'] },
    { s: 'ా', sign: true, sound: 'aa (long)', name: ['deergham', 'దీర్ఘం'], words: ws('కాకి|crow|🐦‍⬛', 'మామిడి|mango|🥭', 'పాలు|milk|🥛', 'తాత|grandfather|👴', 'పాప|baby|👶', 'వాన|rain|🌧️') },
  ],
  rhyme: [['కాకి కాకి కావుకావు', 'Crow, crow, caw caw'], ['కాకరకాయ చేదుచేదు', 'Bitter gourd is bitter, bitter'], ['తాత తెచ్చెను మామిడికాయ', 'Grandpa brought a mango'], ['పాప తాగెను పాలు', 'The baby drank milk']],
  read: [R('కా-య|vegetable'), R('పా-ప|baby|👶'), R('తా-త|grandfather|👴'), R('వా-న|rain|🌧️'), R('చా-ప|mat'), R('గా-యం|wound')],
});

const ch14 = lesson({
  n: 14, id: 'ch14', te: 'గీతల అంగి', en: 'Geethala Angi (striped shirt)', hero: W('గీతల అంగి|striped shirt'),
  about: ['అంగి means shirt, and గీతల అంగి is a shirt with stripes. We learn two vowel signs: గుడి ◌ి ("i") and గుడి దీర్ఘం ◌ీ ("ee").', 'అంగి అంటే చొక్కా. గీతల అంగి — గీతలు ఉన్న చొక్కా. రెండు గుర్తులు: గుడి (◌ి), గుడి దీర్ఘం (◌ీ).'],
  items: [
    { s: 'ి', sign: true, sound: 'i (short)', name: ['gudi', 'గుడి'], words: ws('పిల్లి|cat|🐱', 'చిలుక|parrot|🦜', 'కిటికీ|window|🪟', 'గుడి|temple|🛕', 'పులి|tiger|🐅') },
    { s: 'ీ', sign: true, sound: 'ee (long)', name: ['gudi deergham', 'గుడి దీర్ఘం'], words: ws('చీమ|ant|🐜', 'టీ|tea|☕', 'కుర్చీ|chair|🪑', 'జీబ్రా|zebra|🦓', 'కిరీటం|crown|👑') },
  ],
  rhyme: [['గీతల అంగి వేసుకొని', 'Wearing a striped shirt'], ['చిలుక పలికె కీకీ', 'The parrot says kee kee'], ['చీమ నడిచె వరుసగా', 'The ants walk in a line'], ['కిటికీ తెరిచి చూడు', 'Open the window and look']],
  read: [R('చీ-మ|ant|🐜'), R('కి-టి-కీ|window|🪟'), R('గీ-త|line'), R('అం-గి|shirt'), R('మీ-సం|moustache')],
});

const ch15 = lesson({
  n: 15, id: 'ch15', te: 'మూకుడు', en: 'Mookudu (lid)', hero: W('మూకుడు|lid of a pot'),
  about: ['A మూకుడు is the lid that covers a cooking pot. We learn the signs కొమ్ము ◌ు ("u") and కొమ్ము దీర్ఘం ◌ూ ("oo").', 'మూకుడు — వంట కుండ మీద పెట్టే మూత. రెండు గుర్తులు: కొమ్ము (◌ు), కొమ్ము దీర్ఘం (◌ూ).'],
  items: [
    { s: 'ు', sign: true, sound: 'u (short)', name: ['kommu', 'కొమ్ము'], words: ws('పులి|tiger|🐅', 'కుక్క|dog|🐶', 'ఉడుత|squirrel|🐿️', 'గుడ్డు|egg|🥚', 'బుట్ట|basket|🧺') },
    { s: 'ూ', sign: true, sound: 'oo (long)', name: ['kommu deergham', 'కొమ్ము దీర్ఘం'], words: ws('పూలు|flowers|🌸', 'బూర|trumpet|🎺', 'సూర్యుడు|sun|☀️', 'భూమి|earth|🌍', 'మూకుడు|lid') },
  ],
  rhyme: [['మూకుడు మూసెను కుండను', 'The lid closed the pot'], ['పులి పులి గుర్గుర్', 'Tiger, tiger, grr grr'], ['బూర ఊదితే పూపూ', 'Blow the trumpet, poo poo'], ['పూలు కోసి మాల కడదాం', 'Let us pick flowers and make a garland']],
  read: [R('మూ-కు-డు|lid'), R('పు-లి|tiger|🐅'), R('పూ-లు|flowers|🌸'), R('బూ-ర|trumpet|🎺'), R('గు-డి|temple|🛕'), R('కుం-డ|pot')],
});

const ch16 = lesson({
  n: 16, id: 'ch16', te: 'ఇటుక', en: 'Ituka (brick)', hero: W('ఇటుక|brick|🧱'),
  about: ['An ఇటుక is a brick. Brick on brick, we build a house! The new letter is the short vowel ఇ ("i").', 'ఇటుక మీద ఇటుక పేర్చి ఇల్లు కడతాం! కొత్త అక్షరం: ఇ.'],
  items: [
    { s: 'ఇ', sound: 'i (short)', words: ws('ఇటుక|brick|🧱', 'ఇల్లు|house|🏠', 'ఇసుక|sand', 'ఇనుము|iron'), shape: ['ఇ: a curl with a hook — compare it with ఈ, which has an extra curl.', 'ఇ: వంపు, కొక్కెం — ఈ కి అదనపు వంపు ఉంటుంది, పోల్చి చూడు.'] },
  ],
  rhyme: [['ఇటుక ఇటుక పేర్చి', 'Stack brick on brick'], ['ఇల్లు కట్టెను తాత', 'Grandpa built a house'], ['ఇసుకలో గూడు కట్టి', 'Build a little house in the sand'], ['ఇంటికి వచ్చెను చిట్టి', 'Little Chitti came home']],
  read: [R('ఇ-టు-క|brick|🧱'), R('ఇ-ల్లు|house|🏠'), R('ఇ-సు-క|sand'), R('ఇ-ను-ము|iron')],
});

const ch17 = lesson({
  n: 17, id: 'ch17', te: 'ఎలుక - ఏనుగు', en: 'Eluka - Enugu (mouse and elephant)', hero: W('ఏనుగు|elephant|🐘'),
  about: ['A tiny ఎలుక (mouse) and a huge ఏనుగు (elephant) — small and big! New vowels: ఎ ("e"), ఏ (long "ee" as in "say") and ఐ ("ai").', 'చిన్న ఎలుక, పెద్ద ఏనుగు! కొత్త అచ్చులు: ఎ, ఏ, ఐ.'],
  items: [
    { s: 'ఎ', sound: 'e (short)', words: ws('ఎలుక|mouse|🐭', 'ఎలుగుబంటి|bear|🐻', 'ఎండ|sunshine|🌤️', 'ఎరుపు|red|🔴'), shape: ['ఎ: a round shape with a small tail at the bottom.', 'ఎ: గుండ్రని ఆకారం, కింద చిన్న తోక.'] },
    { s: 'ఏ', sound: 'ee as in "say" (long e)', words: ws('ఏనుగు|elephant|🐘', 'ఏడుపు|crying|😢', 'ఏరు|stream|🏞️'), shape: ['ఏ: like ఎ with an extra curl — the long sound.', 'ఏ: ఎ కు అదనపు వంపు — పొడవు ధ్వని.'] },
    { s: 'ఐ', sound: 'ai', words: ws('ఐదు|five|🖐️', 'ఐకమత్యం|unity'), shape: ['ఐ: like ఎ with a hook on top.', 'ఐ: ఎ పైన కొక్కెం.'] },
  ],
  rhyme: [['ఎలుక ఎలుక ఎక్కడ', 'Mouse, mouse, where are you?'], ['కలుగులో దాక్కుంది', 'Hiding in its hole'], ['ఏనుగు వచ్చె ఊగుతూ', 'Here comes the elephant, swaying'], ['ఐదు అరటిపళ్ళు తిన్నది', 'It ate five bananas']],
  read: [R('ఎ-లు-క|mouse|🐭'), R('ఏ-ను-గు|elephant|🐘'), R('ఐ-దు|five|🖐️'), R('ఎ-రు-పు|red|🔴'), R('ఏ-డు|seven')],
});

const ch18 = lesson({
  n: 18, id: 'ch18', te: 'తేనెటీగ', en: 'Thenetiga (honey bee)', hero: W('తేనె|honey|🍯'),
  about: ['A తేనెటీగ (honey bee) visits flowers and makes sweet తేనె (honey). We learn the signs ఎత్వం ◌ె ("e") and ఏత్వం ◌ే ("ee" as in "say").', 'తేనెటీగ పూల మీద వాలి తీయని తేనె తయారుచేస్తుంది. రెండు గుర్తులు: ఎత్వం (◌ె), ఏత్వం (◌ే).'],
  items: [
    { s: 'ె', sign: true, sound: 'e (short)', name: ['ethvam', 'ఎత్వం'], words: ws('పెట్టె|box|📦', 'నెమలి|peacock|🦚', 'చెట్టు|tree|🌳', 'చెవి|ear|👂', 'జెండా|flag|🚩') },
    { s: 'ే', sign: true, sound: 'ee as in "say" (long e)', name: ['ethvam (long)', 'ఏత్వం'], words: ws('మేక|goat|🐐', 'చేప|fish|🐟', 'మేఘం|cloud|☁️', 'తేనె|honey|🍯', 'వేరుశనగ|groundnut|🥜') },
  ],
  rhyme: [['తేనెటీగ ఝుమ్ఝుమ్', 'Honey bee, buzz buzz'], ['పూల మీద వాలింది', 'It sat down on the flowers'], ['తీయని తేనె తెచ్చింది', 'It brought sweet honey'], ['మేక మేక మేమే', 'Goat, goat, meh meh']],
  read: [R('తే-నె|honey|🍯'), R('మే-క|goat|🐐'), R('పె-రు-గు|curd'), R('చే-ప|fish|🐟'), R('వే-లు|finger'), R('తే-నె-టీ-గ|honey bee')],
});

const ch19 = lesson({
  n: 19, id: 'ch19', te: 'కొంగసోపతి', en: 'Konga Sopathi (the crane\'s friend)', hero: W('కొంగ|crane (white water bird)'),
  about: ['A కొంగ is a tall white bird that stands on one leg near water. సోపతి is a Telangana word for friend! We learn the signs ఒత్వం ◌ొ ("o") and ఓత్వం ◌ో ("oo" as in "go").', 'కొంగ నీటి దగ్గర ఒంటి కాలి మీద నిలబడే తెల్లని పక్షి. సోపతి అంటే స్నేహితుడు. రెండు గుర్తులు: ఒత్వం (◌ొ), ఓత్వం (◌ో).'],
  items: [
    { s: 'ొ', sign: true, sound: 'o (short)', name: ['othvam', 'ఒత్వం'], words: ws('గొడుగు|umbrella|☂️', 'మొక్క|plant|🌱', 'గొర్రె|sheep|🐑', 'కొబ్బరి|coconut|🥥', 'కొంగ|crane') },
    { s: 'ో', sign: true, sound: 'oo as in "go" (long o)', name: ['othvam (long)', 'ఓత్వం'], words: ws('కోడి|hen|🐓', 'కోతి|monkey|🐒', 'టోపీ|cap|🎩', 'దోసకాయ|cucumber|🥒', 'సోపతి|friend') },
  ],
  rhyme: [['కొంగ కొంగ తెల్లకొంగ', 'Crane, crane, white crane'], ['చెరువు గట్టున నిలబడె', 'It stands on the pond bank'], ['కోడి కూసెను కొక్కొరొకో', 'The rooster crows, cock-a-doodle-doo'], ['సోపతితో ఆడుకో', 'Play with your friend']],
  read: [R('కొం-గ|crane'), R('కో-డి|hen|🐓'), R('కో-తి|monkey|🐒'), R('గొ-డు-గు|umbrella|☂️'), R('సో-ప-తి|friend')],
});

const ch20 = lesson({
  n: 20, id: 'ch20', te: 'మైదాకు', en: 'Maidaku (henna leaves)', hero: W('మైదాకు|henna leaves|🌿'),
  about: ['మైదాకు are henna leaves. We grind them and put the paste on our hands — it turns them red! We learn the signs ఐత్వం ◌ై ("ai") and ఔత్వం ◌ౌ ("au").', 'మైదాకు రుబ్బి చేతులకు పెట్టుకుంటే ఎర్రగా పండుతుంది! రెండు గుర్తులు: ఐత్వం (◌ై), ఔత్వం (◌ౌ).'],
  items: [
    { s: 'ై', sign: true, sound: 'ai', name: ['aithvam', 'ఐత్వం'], words: ws('సైకిల్|bicycle|🚲', 'మైదాకు|henna leaves|🌿', 'తైలం|oil', 'పైన|on top') },
    { s: 'ౌ', sign: true, sound: 'au', name: ['authvam', 'ఔత్వం'], words: ws('నౌక|ship|🚢', 'మౌనం|silence|🤫', 'గౌను|frock') },
  ],
  rhyme: [['మైదాకు రుబ్బి రుబ్బి', 'Grind, grind the henna leaves'], ['చేతులకు పెట్టి', 'Put it on our hands'], ['ఎర్రగ పండెను చూడు', 'Look, it turned so red'], ['మౌనంగా మురిసెను పాప', 'The little girl smiled quietly']],
  read: [R('మై-దా-కు|henna leaves|🌿'), R('సై-గ|gesture'), R('నౌ-క|ship|🚢'), R('మౌ-నం|silence|🤫'), R('పై-న|on top'), R('తై-లం|oil')],
});

const ch21 = lesson({
  n: 21, id: 'ch21', te: 'సింహం - జింక', en: 'Simham - Jinka (lion and deer)', hero: W('సింహం|lion|🦁'),
  about: ['The సింహం (lion) is the king of the forest, and the జింక (deer) runs very fast. We learn the letters హ, ళ and ణ.', 'సింహం అడవికి రాజు; జింక వేగంగా పరుగెడుతుంది. కొత్త అక్షరాలు: హ, ళ, ణ.'],
  items: [
    { s: 'హ', sound: 'ha', inside: true, words: ws('సింహం|lion|🦁', 'హంస|swan|🦢', 'హారం|necklace'), shape: ['హ: a round loop with a long tail curling down.', 'హ: గుండ్రని చుట్టు, కిందికి వంగిన పొడవైన తోక.'] },
    { s: 'ళ', sound: 'ḷa (tongue curled back)', inside: true, words: ws('తాళం|lock|🔒', 'నీళ్ళు|water|💧', 'పళ్ళు|teeth|🦷', 'కళ్ళు|eyes|👁️'), shape: ['ళ: like ల with a little line inside the right hump.', 'ళ: ల లాగే, కుడి వంపులో చిన్న గీత.'] },
    { s: 'ణ', sound: 'ṇa (tongue curled back)', inside: true, words: ws('బాణం|arrow|🏹', 'నాణెం|coin|🪙', 'వీణ|veena'), shape: ['ణ: three little humps in a row.', 'ణ: వరుసగా మూడు చిన్న వంపులు.'] },
  ],
  rhyme: [['సింహం గర్జించె హుంహుం', 'The lion roars, hum hum'], ['జింక పారెను దూరం', 'The deer runs far away'], ['హంస ఈదెను నీళ్ళలో', 'The swan swims in the water'], ['బాణం దూసుకుపోయెను', 'The arrow shoots away']],
  read: [R('సిం-హం|lion|🦁'), R('జిం-క|deer|🦌'), R('హం-స|swan|🦢'), R('తా-ళం|lock|🔒'), R('బా-ణం|arrow|🏹'), R('హా-రం|necklace')],
  note: 'Syllabus scan shows three letters including ళ and హ; the first glyph is unclear — ణ is assumed here. Teacher to verify against the textbook.',
});

const ch22 = lesson({
  n: 22, id: 'ch22', te: 'పాఠశాల', en: 'Pathashala (school)', hero: W('పాఠశాల|school|🏫'),
  about: ['పాఠశాల is our school, where we read, play and make friends. We learn four "breathy" letters that are said with a puff of air: ఖ, ఛ, ఠ, ఢ.', 'పాఠశాల — చదువుకునే, ఆడుకునే, స్నేహితులను చేసుకునే చోటు. గాలి ఎక్కువగా వచ్చే నాలుగు అక్షరాలు: ఖ, ఛ, ఠ, ఢ (మహాప్రాణాలు).'],
  items: [
    { s: 'ఖ', sound: 'kha (k with a puff)', inside: true, words: ws('ఖడ్గం|sword|🗡️', 'ముఖం|face', 'శంఖం|conch shell|🐚'), shape: ['ఖ: two round loops side by side.', 'ఖ: పక్కపక్కన రెండు గుండ్రని చుట్టలు.'] },
    { s: 'ఛ', sound: 'chha (ch with a puff)', words: ws('ఛత్రి|umbrella|☂️', 'ఛాయ|shade'), shape: ['ఛ: like చ with a small mark below — the mark adds the puff of air.', 'ఛ: చ కింద చిన్న గుర్తు — అది గాలిని చేరుస్తుంది.'] },
    { s: 'ఠ', sound: 'ṭha (ṭ with a puff)', inside: true, words: ws('పాఠశాల|school|🏫', 'మఠం|monastery', 'కంఠం|neck'), shape: ['ఠ: a circle with a dot inside and a tick on top.', 'ఠ: లోపల చుక్క ఉన్న వృత్తం, పైన తలకట్టు.'] },
    { s: 'ఢ', sound: 'ḍha (ḍ with a puff)', words: ws('ఢంకా|big drum|🥁', 'ఢమరుకం|small hand drum'), shape: ['ఢ: like డ with a small mark below.', 'ఢ: డ కింద చిన్న గుర్తు.'] },
  ],
  rhyme: [['పాఠశాలకు పోదాం', 'Let us go to school'], ['పాఠాలు చదువుదాం', 'Let us read our lessons'], ['ఛత్రి పట్టి నడుద్దాం', 'Holding an umbrella, let us walk'], ['ఢంకా మోగెను ఢండం', 'The big drum booms, dham dham']],
  read: [R('పా-ఠ-శా-ల|school|🏫'), R('ము-ఖం|face'), R('ఛ-త్రి|umbrella|☂️'), R('మ-ఠం|monastery'), R('ఢం-కా|big drum|🥁'), R('ఖ-డ్గం|sword|🗡️')],
  note: 'Syllabus lists 4 aspirated / less frequent letters without verified glyphs; ఖ, ఛ, ఠ, ఢ are assumed (the ones not taught elsewhere). Teacher to verify.',
});

const ch23 = lesson({
  n: 23, id: 'ch23', te: 'ఘ, ఝ, ఋ, ష', en: 'Letters ఘ, ఝ, ఋ, ష and the sign ◌ృ', hero: W('ఋషి|sage|🧘'),
  about: ['A ఋషి is a wise sage who sits quietly under a tree. We learn the letters ఘ, ఝ, ఋ, ష and the sign వట్రసుడి ◌ృ ("ru").', 'ఋషి చెట్టు కింద ప్రశాంతంగా కూర్చునే జ్ఞాని. కొత్త అక్షరాలు: ఘ, ఝ, ఋ, ష; గుర్తు: వట్రసుడి (◌ృ).'],
  items: [
    { s: 'ఘ', sound: 'gha (g with a puff)', inside: true, words: ws('మేఘం|cloud|☁️', 'ఘటం|pot'), shape: ['ఘ: like a wide W shape with a tick on top.', 'ఘ: వెడల్పాటి మూడు వంపులు, పైన తలకట్టు.'] },
    { s: 'ఝ', sound: 'jha (j with a puff)', words: ws('ఝరి|stream|🏞️', 'ఝంకారం|buzzing sound'), shape: ['ఝ: a long letter with a hook at the end — take your time!', 'ఝ: పొడవైన అక్షరం, చివర కొక్కెం — నెమ్మదిగా రాయి!'] },
    { s: 'ఋ', sound: 'ru', words: ws('ఋషి|sage|🧘', 'ఋతువు|season'), shape: ['ఋ: like ఉ with an extra hook.', 'ఋ: ఉ కు అదనపు కొక్కెం.'] },
    { s: 'ష', sound: 'sha (tongue curled)', inside: true, words: ws('వర్షం|rain|🌧️', 'ఔషధం|medicine|💊', 'షర్టు|shirt'), shape: ['ష: like a round shape with a line across it.', 'ష: గుండ్రని ఆకారం మధ్యలో అడ్డగీత.'] },
    { s: 'ృ', sign: true, sound: 'ru', name: ['vattrasudi', 'వట్రసుడి'], words: ws('గృహం|house|🏠', 'వృక్షం|tree|🌳', 'కృషి|hard work', 'మృగం|wild animal') },
  ],
  rhyme: [['మేఘం మేఘం నల్లమేఘం', 'Cloud, cloud, dark cloud'], ['వర్షం కురిసె జల్లుజల్లు', 'The rain falls, splash splash'], ['ఋషి కూర్చుని ధ్యానం', 'The sage sits in meditation'], ['వృక్షం కింద చల్లని నీడ', 'Cool shade under the tree']],
  read: [R('ఋ-షి|sage|🧘'), R('మే-ఘం|cloud|☁️'), R('వ-ర్షం|rain|🌧️'), R('ఘ-టం|pot'), R('కృ-షి|hard work'), R('గృ-హం|house|🏠'), R('ఝ-రి|stream')],
  note: 'Lesson title is unclear in the syllabus scan, so the unit is named by its letters (ఘ, ఝ, ఋ, ష, ◌ృ as read from the scan). Teacher to verify title and letters.',
});

const ch24 = lesson({
  n: 24, id: 'ch24', te: 'రథం', en: 'Ratham (chariot)', hero: W('రథం|chariot'),
  about: ['A రథం is a big decorated chariot pulled in festival processions. We learn four more "breathy" letters: థ, ధ, ఫ, భ.', 'రథం — జాతరలో, ఉత్సవాల్లో లాగే అలంకరించిన పెద్ద బండి. కొత్త అక్షరాలు: థ, ధ, ఫ, భ.'],
  items: [
    { s: 'థ', sound: 'tha (t with a puff)', inside: true, words: ws('కథ|story|📖', 'రథం|chariot'), shape: ['థ: like త with a dot inside the belly.', 'థ: త పొట్టలో చుక్క.'] },
    { s: 'ధ', sound: 'dha (d with a puff)', words: ws('ధాన్యం|grain|🌾', 'ధనుస్సు|bow|🏹'), shape: ['ధ: like ద with a small mark inside.', 'ధ: ద లోపల చిన్న గుర్తు.'] },
    { s: 'ఫ', sound: 'pha (p with a puff)', words: ws('ఫలం|fruit|🍎', 'ఫలాలు|fruits|🍇'), shape: ['ఫ: like ప with a small mark below.', 'ఫ: ప కింద చిన్న గుర్తు.'] },
    { s: 'భ', sound: 'bha (b with a puff)', words: ws('భూమి|earth|🌍', 'భవనం|building|🏢', 'భయం|fear'), shape: ['భ: like బ with a small mark below.', 'భ: బ కింద చిన్న గుర్తు.'] },
  ],
  rhyme: [['రథం వచ్చెను ఊరికి', 'The chariot came to the village'], ['కథ చెప్పెను అవ్వ', 'Grandma told a story'], ['ఫలాలు తెచ్చెను తాత', 'Grandpa brought fruits'], ['భూమి మీద ఆడుదాం', 'Let us play on the earth']],
  read: [R('ర-థం|chariot'), R('క-థ|story|📖'), R('ఫ-లం|fruit|🍎'), R('భ-వ-నం|building|🏢'), R('భూ-మి|earth|🌍'), R('ధా-న్యం|grain|🌾')],
  note: 'Letters థ, ధ, ఫ, భ as read from the syllabus scan; teacher to verify.',
});

const RIDDLES: FQ[] = [
  fq('I have a long trunk and ears like big fans. Who am I?', 'నాకు పొడవైన తొండం, చేటంత చెవులు. నేనెవరు?', ['elephant', 'ఏనుగు'], [['mouse', 'ఎలుక'], ['monkey', 'కోతి']], ['Think of the biggest animal you know.', 'నీకు తెలిసిన అతి పెద్ద జంతువు గురించి ఆలోచించు.']),
  fq('I shine in the night sky. Some days I am round, some days thin. Who am I?', 'రాత్రి ఆకాశంలో వెలుగుతాను. ఒకసారి గుండ్రంగా, ఒకసారి సన్నగా ఉంటాను. నేనెవరు?', ['moon', 'చందమామ'], [['sun', 'సూర్యుడు'], ['lamp', 'దీపం']], ['It is not the sun — the sun comes in the day.', 'సూర్యుడు కాదు — సూర్యుడు పగలు వస్తాడు.']),
  fq('When it rains, I open up over your head. What am I?', 'వాన పడితే నీ తల మీద విచ్చుకుంటాను. నేనేమిటి?', ['umbrella', 'గొడుగు'], [['cap', 'టోపీ'], ['bag', 'సంచి']], ['It keeps you dry.', 'ఇది నిన్ను తడవకుండా కాపాడుతుంది.']),
  fq('Green outside, red inside, with black seeds. What am I?', 'పైన పచ్చగా, లోపల ఎర్రగా, నల్లని గింజలు. నేనేమిటి?', ['watermelon', 'పుచ్చకాయ'], [['mango', 'మామిడి'], ['banana', 'అరటి']], ['A big juicy summer fruit.', 'వేసవిలో తినే పెద్ద రసం పండు.']),
  fq('I walk very slowly and carry my house on my back. Who am I?', 'చాలా నెమ్మదిగా నడుస్తాను, నా ఇల్లు నా వీపు మీదే. నేనెవరు?', ['tortoise', 'తాబేలు'], [['rabbit', 'కుందేలు'], ['cat', 'పిల్లి']], ['Its shell is its home.', 'దాని డిప్పే దాని ఇల్లు.']),
  fq('I am black, I have wings, and I call "kaa kaa". Who am I?', 'నేను నల్లగా ఉంటాను, రెక్కలు ఉన్నాయి, "కావు కావు" అంటాను. నేనెవరు?', ['crow', 'కాకి'], [['parrot', 'చిలుక'], ['hen', 'కోడి']], ['Listen to the sound: kaa kaa.', '"కావు కావు" ధ్వని విను.']),
  fq('I have teeth but I never eat. I make your hair neat. What am I?', 'నాకు పళ్ళు ఉన్నాయి కానీ తినను. నీ జుట్టును చక్కగా చేస్తాను. నేనేమిటి?', ['comb', 'దువ్వెన'], [['spoon', 'చెంచా'], ['pencil', 'పెన్సిల్']], ['You use it after your bath, on your hair.', 'స్నానం తర్వాత జుట్టుకు వాడతావు.']),
];
const ch25 = lesson({
  n: 25, id: 'ch25', te: 'పొడుపు కథలు', en: 'Podupu Kathalu (riddles)', hero: W('పొడుపు కథలు|riddles|🤔'),
  about: ['పొడుపు కథలు are riddles — little puzzles with a hidden answer. We also learn our last new letter: క్ష ("ksha"), made by joining క and ష.', 'పొడుపు కథ అంటే జవాబు దాచిన చిన్న ప్రశ్న. చివరి కొత్త అక్షరం: క్ష — క, ష కలిస్తే క్ష.'],
  items: [
    { s: 'క్ష', sound: 'ksha', inside: true, words: ws('పక్షి|bird|🐦', 'నక్షత్రం|star|⭐', 'వృక్షం|tree|🌳', 'క్షీరం|milk|🥛', 'రక్ష|protection'), shape: ['క్ష: write క, then add the ష shape joined below it.', 'క్ష: ముందు క రాసి, దాని కింద ష వత్తు కలుపు.'] },
  ],
  rhyme: [['పక్షి పక్షి ఎగురు', 'Bird, bird, fly'], ['నక్షత్రం దాకా ఎగురు', 'Fly up to the stars'], ['వృక్షం మీద గూడు', 'A nest upon the tree'], ['అమ్మ ఒడి మనకు రక్ష', 'Mother\'s lap keeps us safe']],
  read: [R('ప-క్షి|bird|🐦'), R('న-క్ష-త్రం|star|⭐'), R('ర-క్ష|protection'), R('వృ-క్షం|tree|🌳'), R('క్షీ-రం|milk|🥛')],
  extra: [{
    id: 'ts1.te.ch25.riddles', title: L('Riddle time! Guess who I am', 'పొడుపు కథలు — నేనెవరో చెప్పుకో!'), prereqs: [],
    intro: [
      p('A riddle gives clues. Listen to every clue, picture it in your mind, then guess!', 'పొడుపు కథలో ఆధారాలు ఉంటాయి. ప్రతి ఆధారం విని, మనసులో బొమ్మ ఊహించుకొని, జవాబు చెప్పు!'),
      photo('🐘', L('"Long trunk, ears like fans" — the elephant!', '"పొడవైన తొండం, చేటంత చెవులు" — ఏనుగు!')),
      tip('Make up your own riddle about an animal and ask your family!', 'ఒక జంతువు గురించి నీ సొంత పొడుపు కథ తయారుచేసి ఇంట్లో అడుగు!'),
    ],
    examples: [
      ex(L('"I give you milk and say ambaa." Who am I?', '"నేను పాలు ఇస్తాను, అంబా అంటాను." నేనెవరు?'), [L('Clue 1: gives milk.', 'ఆధారం 1: పాలు ఇస్తుంది.'), L('Clue 2: says "ambaa".', 'ఆధారం 2: "అంబా" అంటుంది.')], L('ఆవు (cow)', 'ఆవు'), emo('🐄')),
      ex(L('"I am tall, green and give shade. Birds live in me." What am I?', '"నేను ఎత్తుగా, పచ్చగా ఉంటాను, నీడ ఇస్తాను. పక్షులు నాలో ఉంటాయి." నేనేమిటి?'), [L('Shade and birds\' nests…', 'నీడ, పక్షుల గూళ్ళు…'), L('It must be a tree.', 'అది చెట్టు.')], L('చెట్టు (tree)', 'చెట్టు'), emo('🌳')),
    ],
    practice: [bankT('guess', RIDDLES, L('Listen to every clue again.', 'ప్రతి ఆధారాన్ని మళ్ళీ విను.'))],
  }],
});

// ================================================================== starred read-and-enjoy lessons
const WANT: [string, string][] = [['నాకు కావాలి బంతి', 'I want a ball'], ['నీకు కావాలి గాలిపటం', 'You want a kite'], ['అందరికీ కావాలి ఆట', 'Everyone wants to play'], ['కలిసి ఆడితే భలే సరదా', 'Playing together is great fun']];
const ch21s: USpec = {
  id: 'ts1.te.ch21s', subject: 'telugu', title: L('Read and enjoy: Kavali - Kavali (I want, I want)', 'చదువు - ఆనందించు: కావాలి - కావాలి'), source: tsSrc(1, 'telugu', '21*'),
  note: 'Starred read-for-pleasure page. Original WonderLab song on the theme of "wanting" and sharing; the textbook text is not reproduced.',
  objectives: [
    {
      id: 'ts1.te.ch21s.song', title: L('Sing: I want, I want!', 'పాడుకుందాం: కావాలి, కావాలి!'), prereqs: [],
      intro: [
        p('కావాలి means "I want". Sing our "కావాలి" song and act it out — throw a ball, fly a kite!', 'కావాలి అంటే "ఇష్టంగా అడగడం". ఈ పాట పాడుతూ నటించు — బంతి విసురు, గాలిపటం ఎగరేయ్!'),
        photo('🪁', L('గాలిపటం — kite', 'గాలిపటం')),
        h('Our song', 'మన పాట'), keys(...WANT.map(([te, en]) => L(en, te))),
        tip('Sing it again and change the toy: "నాకు కావాలి బొమ్మ"!', 'బొమ్మ మార్చి మళ్ళీ పాడు: "నాకు కావాలి బొమ్మ"!'),
      ],
      examples: [
        ex(L('In the song, what do "I" want?', 'పాటలో "నాకు" ఏమి కావాలి?'), [L('First line: నాకు కావాలి బంతి.', 'మొదటి వరుస: నాకు కావాలి బంతి.')], L('బంతి (a ball)', 'బంతి'), emo('⚽')),
        ex(L('What does everyone want?', 'అందరికీ ఏమి కావాలి?'), [L('Third line: అందరికీ కావాలి ఆట.', 'మూడో వరుస: అందరికీ కావాలి ఆట.')], L('ఆట (to play)', 'ఆట')),
      ],
      practice: [rhymeT(WANT, ['బొమ్మ', 'పుస్తకం', 'పాలు'], 'fill'), orderT('order', L('Put the song lines in order.', 'పాట వరుసలను క్రమంలో పెట్టు.'), WANT)],
    },
    {
      id: 'ts1.te.ch21s.ask', title: L('Say what you want, nicely', 'కావలసినది మర్యాదగా అడుగు'), prereqs: ['ts1.te.ch21s.song'],
      intro: [
        p('We say "నాకు ___ కావాలి" (I want ___). Adding దయచేసి (please) makes it kind.', '"నాకు ___ కావాలి" అని అడుగుతాం. "దయచేసి" చేర్చితే మర్యాదగా ఉంటుంది.'),
        photo('💧', L('"దయచేసి నాకు నీళ్ళు కావాలి" — Water, please.', '"దయచేసి నాకు నీళ్ళు కావాలి."')),
        tip('Sharing is caring: if your friend wants your toy too, take turns!', 'పంచుకోవడం మంచి గుణం: స్నేహితుడికీ అదే బొమ్మ కావాలంటే వంతులవారీగా ఆడండి!'),
      ],
      examples: [
        ex(L('You are hungry. What do you say?', 'నీకు ఆకలిగా ఉంది. ఏమంటావు?'), [L('Say what you need: food.', 'కావలసినది చెప్పు: అన్నం.')], L('"అమ్మా, నాకు అన్నం కావాలి."', '"అమ్మా, నాకు అన్నం కావాలి."')),
        ex(L('You want to draw. What do you ask for?', 'బొమ్మ గీయాలి. ఏమి అడుగుతావు?'), [L('To draw we need colours.', 'బొమ్మకు రంగులు కావాలి.')], L('"నాకు రంగులు కావాలి."', '"నాకు రంగులు కావాలి."'), emo('🎨')),
      ],
      practice: [bankT('want', [
        fq('You are thirsty. What do you want?', 'నీకు దాహంగా ఉంది. నీకు ఏమి కావాలి?', ['నీళ్ళు (water)', 'నీళ్ళు'], [['గొడుగు (umbrella)', 'గొడుగు'], ['బంతి (ball)', 'బంతి']], ['Thirst goes away when we drink.', 'తాగితే దాహం తీరుతుంది.'], '💧'),
        fq('It is raining and you must go out. What do you want?', 'వాన పడుతోంది, బయటకు వెళ్ళాలి. నీకు ఏమి కావాలి?', ['గొడుగు (umbrella)', 'గొడుగు'], [['టీ (tea)', 'టీ'], ['గాలిపటం (kite)', 'గాలిపటం']], ['Something to keep you dry.', 'తడవకుండా కాపాడేది.'], '🌧️'),
        fq('You want to write. What do you want?', 'నువ్వు రాయాలి. నీకు ఏమి కావాలి?', ['పెన్సిల్ (pencil)', 'పెన్సిల్'], [['చెంచా (spoon)', 'చెంచా'], ['ఆకు (leaf)', 'ఆకు']], ['We write with it.', 'దానితో రాస్తాం.'], '📝'),
        fq('It is dark at night. What do you want?', 'రాత్రి చీకటిగా ఉంది. నీకు ఏమి కావాలి?', ['దీపం (lamp)', 'దీపం'], [['బంతి (ball)', 'బంతి'], ['టోపీ (cap)', 'టోపీ']], ['Something that gives light.', 'వెలుగు ఇచ్చేది.'], '🌙'),
        fq('The wind is blowing hard on Sankranti. What do you want to fly?', 'సంక్రాంతికి గాలి బాగా వీస్తోంది. ఏమి ఎగరేయాలి?', ['గాలిపటం (kite)', 'గాలిపటం'], [['పుస్తకం (book)', 'పుస్తకం'], ['గుడ్డు (egg)', 'గుడ్డు']], ['It flies on a string.', 'దారంతో ఎగురుతుంది.'], '🌬️'),
        fq('How do you ask for a turn on the swing nicely?', 'ఊయల ఊగాలని మర్యాదగా ఎలా అడుగుతావు?', ['దయచేసి నాకూ ఒక వంతు కావాలి (May I have a turn, please?)', 'దయచేసి నాకూ ఒక వంతు కావాలి'], [['తప్పుకో! (move!)', 'తప్పుకో!'], ['నాదే! (it\'s mine!)', 'నాదే!']], ['Kind words: please and taking turns.', 'మంచి మాట: దయచేసి, వంతులు.'], '🛝'),
      ], L('Think: what helps in this situation?', 'ఆలోచించు: ఈ సందర్భంలో ఏది సహాయపడుతుంది?'))],
    },
  ],
};

const STORY: [string, string][] = [
  ['ఒక చీమ నీళ్ళు తాగడానికి చెరువుకు వెళ్ళింది.', 'An ant went to the pond to drink water.'],
  ['చీమ జారి నీటిలో పడిపోయింది.', 'The ant slipped and fell into the water.'],
  ['చెట్టు మీది పావురం ఒక ఆకును నీటిలో వేసింది.', 'A dove in the tree dropped a leaf into the water.'],
  ['చీమ ఆకు పడవ ఎక్కి ఒడ్డుకు చేరింది.', 'The ant climbed onto the leaf-boat and reached the bank.'],
  ['చీమ పావురానికి ధన్యవాదాలు చెప్పింది.', 'The ant said thank you to the dove.'],
];
const ch24s: USpec = {
  id: 'ts1.te.ch24s', subject: 'telugu', title: L('Read and enjoy: Cheema - Padava (the ant and the boat)', 'చదువు - ఆనందించు: చీమ - పడవ'), source: tsSrc(1, 'telugu', '24*'),
  note: 'Starred read-for-pleasure page. We retell the public-domain fable "The Ant and the Dove" (leaf boat); the textbook text is not reproduced — teacher should connect it to the book page.',
  objectives: [
    {
      id: 'ts1.te.ch24s.story', title: L('Story: the ant and the leaf boat', 'కథ: చీమ - ఆకు పడవ'), prereqs: [],
      intro: [
        p('Listen to the story. Who helps whom?', 'కథ విను. ఎవరు ఎవరికి సహాయం చేశారు?'),
        photo('🐜', L('చీమ — ant', 'చీమ')),
        ...STORY.map(([te, en]) => p(en, te)),
        photo('🍃', L('A leaf becomes a little boat (పడవ)!', 'ఆకే చిన్న పడవ అయింది!')),
        remember('Help others — friends help us too.', 'ఇతరులకు సహాయం చెయ్యి — స్నేహితులూ మనకు సహాయం చేస్తారు.'),
      ],
      examples: [
        ex(L('Why did the ant go to the pond?', 'చీమ చెరువుకు ఎందుకు వెళ్ళింది?'), [L('The first sentence tells us.', 'మొదటి వాక్యం చెబుతుంది.')], L('To drink water', 'నీళ్ళు తాగడానికి'), emo('💧')),
        ex(L('How did the dove help?', 'పావురం ఎలా సహాయం చేసింది?'), [L('It dropped a leaf into the water.', 'ఆకును నీటిలో వేసింది.'), L('The leaf became a boat for the ant.', 'ఆకు చీమకు పడవ అయింది.')], L('It dropped a leaf', 'ఆకు వేసింది'), emo('🕊️')),
      ],
      practice: [
        bankT('ask', [
          fq('Where did the ant fall?', 'చీమ ఎక్కడ పడిపోయింది?', ['in the water', 'నీటిలో'], [['in the sand', 'ఇసుకలో'], ['in a box', 'పెట్టెలో']], ['It went to the pond.', 'అది చెరువుకు వెళ్ళింది.'], '🐜'),
          fq('Who helped the ant?', 'చీమకు ఎవరు సహాయం చేశారు?', ['the dove', 'పావురం'], [['the cat', 'పిల్లి'], ['the fox', 'నక్క']], ['It lived in the tree.', 'అది చెట్టు మీద ఉంది.'], '🕊️'),
          fq('What became the ant\'s boat?', 'చీమకు పడవ ఏది అయింది?', ['a leaf', 'ఆకు'], [['a stone', 'రాయి'], ['a flower', 'పువ్వు']], ['It fell from the tree.', 'అది చెట్టు నుంచి పడింది.'], '🍃'),
          fq('What did the ant say at the end?', 'చివరికి చీమ ఏమి చెప్పింది?', ['thank you', 'ధన్యవాదాలు'], [['go away', 'వెళ్ళిపో'], ['nothing', 'ఏమీ చెప్పలేదు']], ['When someone helps us, we say…', 'ఎవరైనా సహాయం చేస్తే మనం అనేది…'], '🙏'),
          fq('How should the ant feel after reaching the bank?', 'ఒడ్డు చేరాక చీమకు ఎలా అనిపించి ఉంటుంది?', ['happy and safe', 'సంతోషంగా, క్షేమంగా'], [['angry', 'కోపంగా'], ['sleepy', 'నిద్రగా']], ['It was saved!', 'అది బతికి బయటపడింది!'], '🐜'),
        ], L('Think back to the story.', 'కథను మళ్ళీ గుర్తు చేసుకో.')),
        orderT('order', L('Put the story in order.', 'కథను వరుసగా పెట్టు.'), STORY.slice(0, 4)),
      ],
    },
    readObj('ch24s', [R('చీ-మ|ant|🐜'), R('ప-డ-వ|boat|⛵'), R('ఆ-కు|leaf|🍃'), R('పా-వు-రం|dove|🕊️'), R('చె-రు-వు|pond'), R('ఒ-డ్డు|bank of a pond')], ['ts1.te.ch24s.story']),
  ],
};

// ================================================================== 0. readiness (oral)
const PICS0 = ws('ఆవు|cow|🐄', 'పిల్లి|cat|🐱', 'కుక్క|dog|🐶', 'చేప|fish|🐟', 'ఏనుగు|elephant|🐘', 'మామిడి|mango|🥭', 'అరటి|banana|🍌', 'బంతి|ball|⚽', 'గాలిపటం|kite|🪁', 'పువ్వు|flower|🌼', 'చెట్టు|tree|🌳', 'ఇల్లు|house|🏠', 'బస్సు|bus|🚌', 'చిలుక|parrot|🦜');
const ch0: USpec = {
  id: 'ts1.te.ch0', subject: 'telugu', title: L('Lesson 0: Getting ready (listening and speaking)', 'పాఠం 0: సంసిద్ధత పాఠాలు'), source: tsSrc(1, 'telugu', 0),
  note: 'Readiness lessons are oral (listening, speaking, picture talk). Original WonderLab activities; teacher should add classroom picture-talk from the book.',
  objectives: [
    {
      id: 'ts1.te.ch0.listen', title: L('Listen and find the picture', 'విని బొమ్మను గుర్తించు'), prereqs: [],
      intro: [
        p('Before letters, we learn to listen carefully and talk about pictures. Look at a picture, say its name, and tell one thing about it.', 'అక్షరాలకు ముందు బాగా వినడం, బొమ్మల గురించి మాట్లాడటం నేర్చుకుందాం. బొమ్మను చూసి పేరు చెప్పు, దాని గురించి ఒక మాట చెప్పు.'),
        photo('🐄', L('ఆవు — cow. "The cow gives us milk."', 'ఆవు — "ఆవు మనకు పాలు ఇస్తుంది."')),
        photo('🦜', L('చిలుక — parrot. "The parrot is green."', 'చిలుక — "చిలుక పచ్చగా ఉంటుంది."')),
        tip('Talk with family: name five things in your kitchen in Telugu!', 'ఇంట్లో వాళ్ళతో మాట్లాడు: వంటింట్లోని ఐదు వస్తువుల పేర్లు తెలుగులో చెప్పు!'),
      ],
      examples: [
        ex(L('Which picture is "చేప"?', '"చేప" బొమ్మ ఏది?'), [L('A fish lives in water and swims.', 'చేప నీటిలో ఉంటుంది, ఈదుతుంది.')], L('🐟 చేప (fish)', '🐟 చేప'), emo('🐟')),
        ex(L('Tell one thing about the elephant.', 'ఏనుగు గురించి ఒక మాట చెప్పు.'), [L('Look: it is very big.', 'చూడు: అది చాలా పెద్దది.'), L('It has a long trunk.', 'దానికి పొడవైన తొండం ఉంది.')], L('"The elephant is big and has a long trunk."', '"ఏనుగు పెద్దది, దానికి పొడవైన తొండం ఉంది."'), emo('🐘')),
      ],
      practice: [tp('pic', (r) => {
        const [w, ...wrong] = r.shuffle(PICS0).slice(0, 3);
        return {
          type: 'mcq', prompt: L(`Listen and tap the picture: "${w.w}" (${w.en})`, `విని బొమ్మను నొక్కు: "${w.w}"`),
          ...pictures(r, { label: L(w.en, w.w), visual: emo(w.e!) }, wrong.map((b) => ({ label: L(b.en, b.w), visual: emo(b.e!) }))),
          hints: [L('Say the name of each picture.', 'ప్రతి బొమ్మ పేరు చెప్పు.'), L(`Think: what does a ${w.en} look like?`, `"${w.w}" ఎలా ఉంటుందో ఆలోచించు.`)],
          mistakes: [{ when: 'wrong', explain: fb(`That is not "${w.w}". Look again.`, `అది "${w.w}" కాదు. మళ్ళీ చూడు.`) }],
          solution: [L(`${OK.en}${w.e} is ${w.w} (${w.en}).`, `${OK.te}${w.e} — ${w.w}.`)],
        };
      })],
    },
    {
      id: 'ts1.te.ch0.talk', title: L('Speak kindly: greetings and polite words', 'మర్యాదగా మాట్లాడుదాం'), prereqs: [],
      intro: [
        p('Kind words make everyone happy. We say నమస్కారం (hello), ధన్యవాదాలు (thank you) and క్షమించండి (sorry).', 'మంచి మాటలు అందరినీ సంతోషపెడతాయి. నమస్కారం, ధన్యవాదాలు, క్షమించండి అని చెబుతాం.'),
        photo('🙏', L('నమస్కారం — we greet elders with folded hands.', 'నమస్కారం — పెద్దవాళ్ళకు చేతులు జోడించి నమస్కరిస్తాం.')),
        tip('Speak clearly and look at the person you are talking to.', 'స్పష్టంగా మాట్లాడు; ఎవరితో మాట్లాడుతున్నావో వాళ్ళ వైపు చూడు.'),
      ],
      examples: [
        ex(L('Your teacher comes into class. What do you say?', 'టీచర్ తరగతికి వచ్చారు. ఏమంటావు?'), [L('We greet elders when we meet them.', 'పెద్దవాళ్ళను కలిసినప్పుడు నమస్కరిస్తాం.')], L('నమస్కారం (Namaskaram)', 'నమస్కారం'), emo('🧑‍🏫')),
        ex(L('A friend gives you a pencil. What do you say?', 'స్నేహితుడు పెన్సిల్ ఇచ్చాడు. ఏమంటావు?'), [L('When someone helps us, we thank them.', 'ఎవరైనా సహాయం చేస్తే ధన్యవాదాలు చెబుతాం.')], L('ధన్యవాదాలు (thank you)', 'ధన్యవాదాలు'), emo('✏️')),
      ],
      practice: [bankT('say', [
        fq('You meet your grandfather in the morning. What do you say?', 'పొద్దున తాతయ్యను కలిశావు. ఏమంటావు?', ['నమస్కారం (hello)', 'నమస్కారం'], [['ధన్యవాదాలు (thank you)', 'ధన్యవాదాలు'], ['క్షమించండి (sorry)', 'క్షమించండి']], ['We greet elders when we meet them.', 'పెద్దవాళ్ళను కలిసినప్పుడు నమస్కరిస్తాం.'], '👴'),
        fq('Amma gives you a laddoo. What do you say?', 'అమ్మ లడ్డు ఇచ్చింది. ఏమంటావు?', ['ధన్యవాదాలు (thank you)', 'ధన్యవాదాలు'], [['క్షమించండి (sorry)', 'క్షమించండి'], ['వెళ్ళొస్తాను (bye)', 'వెళ్ళొస్తాను']], ['When we get something, we say thank you.', 'ఏదైనా తీసుకున్నప్పుడు ధన్యవాదాలు చెబుతాం.'], '👩'),
        fq('You bumped into a friend by mistake. What do you say?', 'పొరపాటున స్నేహితుడిని తోశావు. ఏమంటావు?', ['క్షమించు (sorry)', 'క్షమించు'], [['నమస్కారం (hello)', 'నమస్కారం'], ['ధన్యవాదాలు (thank you)', 'ధన్యవాదాలు']], ['When we hurt someone by mistake, we say sorry.', 'పొరపాటు చేస్తే క్షమించమని అడుగుతాం.'], '👦'),
        fq('School is over. What do you say to your teacher?', 'బడి అయిపోయింది. టీచర్‌కు ఏమి చెబుతావు?', ['వెళ్ళొస్తాను (I will go and come back)', 'వెళ్ళొస్తాను'], [['క్షమించండి (sorry)', 'క్షమించండి'], ['ఆకలిగా ఉంది (I am hungry)', 'ఆకలిగా ఉంది']], ['When we leave, we say we will come again.', 'బయలుదేరేటప్పుడు మళ్ళీ వస్తానని చెబుతాం.'], '🏫'),
        fq('You want water. How do you ask nicely?', 'నీళ్ళు కావాలి. మర్యాదగా ఎలా అడుగుతావు?', ['దయచేసి నీళ్ళు ఇవ్వండి (water, please)', 'దయచేసి నీళ్ళు ఇవ్వండి'], [['నీళ్ళు ఇవ్వు! (give water!)', 'నీళ్ళు ఇవ్వు!'], ['నాకు వద్దు (I don\'t want)', 'నాకు వద్దు']], ['"Please" (దయచేసి) makes a request kind.', '"దయచేసి" అంటే మర్యాదగా అడగడం.'], '💧'),
        fq('A new child joins your class. What do you say?', 'తరగతికి కొత్త పిల్లవాడు వచ్చాడు. ఏమంటావు?', ['నా పేరు ... నీ పేరేమిటి? (My name is ..., what is yours?)', 'నా పేరు ... నీ పేరేమిటి?'], [['వెళ్ళిపో (go away)', 'వెళ్ళిపో'], ['క్షమించు (sorry)', 'క్షమించు']], ['Make a new friend: tell your name and ask theirs.', 'కొత్త స్నేహం: నీ పేరు చెప్పి, వాళ్ళ పేరు అడుగు.'], '🧒'),
      ], L('Think: how would you feel if someone said this to you?', 'ఆలోచించు: ఎవరైనా నీతో ఇలా అంటే నీకు ఎలా అనిపిస్తుంది?'))],
    },
    {
      id: 'ts1.te.ch0.claps', title: L('Clap the word parts', 'పదాలకు చప్పట్లు'), prereqs: [],
      intro: [
        p('Every word is made of parts. Say a word slowly and clap once for each part: అ-ర-టి has 3 claps!', 'ప్రతి పదంలో ముక్కలు ఉంటాయి. పదాన్ని నెమ్మదిగా పలుకుతూ ప్రతి ముక్కకు ఒక చప్పట్లు కొట్టు: అ-ర-టి — 3 చప్పట్లు!'),
        photo('🍌', L('అ-ర-టి (banana): clap, clap, clap!', 'అ-ర-టి: చప్పట్లు, చప్పట్లు, చప్పట్లు!')),
        tip('Clap your name too! How many claps is your name?', 'నీ పేరుకు కూడా చప్పట్లు కొట్టు! ఎన్ని చప్పట్లు?'),
      ],
      examples: [
        ex(L('How many claps in ఆవు (cow)?', 'ఆవు లో ఎన్ని చప్పట్లు?'), [L('Say: ఆ — వు.', 'పలుకు: ఆ — వు.'), L('Two claps.', 'రెండు చప్పట్లు.')], L('2', '2'), emo('🐄')),
        ex(L('How many claps in గాలిపటం (kite)?', 'గాలిపటం లో ఎన్ని చప్పట్లు?'), [L('Say: గా — లి — ప — టం.', 'పలుకు: గా — లి — ప — టం.'), L('Four claps.', 'నాలుగు చప్పట్లు.')], L('4', '4'), emo('🪁')),
      ],
      practice: [tp('claps', (r) => {
        const x = r.pick([R('ఆ-వు|cow|🐄'), R('అ-ర-టి|banana|🍌'), R('గా-లి-ప-టం|kite|🪁'), R('చే-ప|fish|🐟'), R('ఏ-ను-గు|elephant|🐘'), R('మా-మి-డి|mango|🥭'), R('పు-వ్వు|flower|🌼'), R('సీ-తా-కో-క-చి-లు-క|butterfly|🦋'), R('టీ|tea|☕')]);
        const n = x.parts.length;
        return {
          type: 'mcq', prompt: L(`Say "${x.w}" (${x.en}) and clap. How many claps?`, `"${x.w}" అని పలుకుతూ చప్పట్లు కొట్టు. ఎన్ని చప్పట్లు?`), visual: emo(x.e!),
          ...chooseNum(r, n, n > 1 ? [n + 1, n - 1] : [2, 3], String, 3),
          hints: [L('One clap for each part of the word.', 'పదంలో ప్రతి ముక్కకు ఒక చప్పట్లు.'), L(`It starts: ${x.parts[0]}…`, `మొదలు: ${x.parts[0]}…`)],
          mistakes: [{ when: 'wrong', explain: fb('Say it slowly and clap again.', 'నెమ్మదిగా పలికి మళ్ళీ చప్పట్లు కొట్టు.') }],
          solution: [L(`${x.parts.join(' - ')} → ${n}`, `${x.parts.join(' - ')} → ${n}`)],
        };
      })],
    },
  ],
};

export const units: USpec[] = [ch0, ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16, ch17, ch18, ch19, ch20, ch21, ch21s, ch22, ch23, ch24, ch24s, ch25];
