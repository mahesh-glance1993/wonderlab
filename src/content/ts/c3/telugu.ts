// Telangana SCERT Class 3 — Telugu (First Language). Original teaching aligned to the official chapter list
// (src/content/ts/books.ts, syllabus.json). We teach ABOUT each lesson in our own simple words; textbook songs,
// verses and stories are never reproduced. Rhymes are our own or public-domain traditional ones (marked).
// Class 3 is a young level: every learner-facing string is bilingual — Telugu (`te`, primary) plus a short
// English gloss (`en`) for English-medium learners and parents. Authoring shorthand:
//   t('తెలుగు // English')  → { te: 'తెలుగు', en: 'English' }   (throws if the gloss is missing)
//   w('వాన=rain')           → { te: 'వాన', en: 'వాన (rain)' }    (answer labels; no '=' → same in both)
import { tp, ex, p, tip, keys, photo, choose, pictures, matching, ordering, tapAll, L, type USpec, type OSpec, type ExSpec, type TSpec } from '../../lib/kit';
import type { Block, Localized } from '../../../shared/content';
import { tsSrc } from '../books';

// ---------- bilingual helpers ----------
const SEP = ' // ';
const t = (s: string): Localized => {
  const i = s.indexOf(SEP);
  if (i < 0) throw new Error(`ts3 telugu: missing English gloss in "${s}"`);
  return L(s.slice(i + SEP.length).trim(), s.slice(0, i).trim());
};
const w = (s: string): Localized => {
  const i = s.indexOf('=');
  return i < 0 ? L(s, s) : L(`${s.slice(0, i).trim()} (${s.slice(i + 1).trim()})`, s.slice(0, i).trim());
};
const P = (s: string): Block => { const x = t(s); return p(x.en, x.te); };
const TIP = (s: string): Block => { const x = t(s); return tip(x.en, x.te); };
const KEYS = (...s: string[]): Block => keys(...s.map(t));
const PH = (e: string, s: string): Block => photo(e, t(s));
/** A short poem/rhyme: Telugu lines (with an English meaning line at the end). */
const POEM = (lines: string[], meaning: string): Block => p(`${lines.join('\n')}\n(${meaning})`, lines.join('\n'));
const EX = (q: string, steps: string[], a: string): ExSpec => ex(t(q), steps.map(t), t(a));

// ---------- practice factories ----------
/** [question, correct label, wrong labels, hint, why] — question/hint/why use 'te // en', labels use 'te=gloss' */
type MQ = [string, string, string[], string, string];
/** [question, [emoji, label] correct, [emoji, label][] wrong, hint, why] */
type PQ = [string, [string, string], [string, string][], string, string];
interface Spec {
  id: string; title: string; intro: Block[]; ex: ExSpec[];
  /** first gentle hint shared by this objective's practice ('te // en') */
  hint: string;
  mcq?: MQ[]; pic?: PQ[];
  match?: [prompt: string, pool: [string, string][]];
  order?: [prompt: string, seqs: string[][]];
  tap?: [prompt: string, pool: [string, boolean][], why: string];
}
const LAST = t('ప్రతి జవాబును నెమ్మదిగా చదివి, సరిపోనివి ఒక్కొక్కటిగా తీసివేయి. // Read each option slowly and cross out the ones that do not fit.');
const PICH = t('ప్రతి బొమ్మను చూసి దాని పేరు గట్టిగా చెప్పు. // Look at each picture and say its name aloud.');
const oops = (why: Localized): Localized => L(`Not quite — that is okay, try again! ${why.en}`, `కొంచెం తేడా ఉంది, పర్వాలేదు! మళ్ళీ ప్రయత్నించు. ${why.te}`);
const answer = (a: Localized): Localized => L(`Answer: ${a.en}. Well done for trying!`, `సరైన జవాబు: ${a.te}. బాగా ప్రయత్నించావు!`);
const joinL = (xs: Localized[], j: string): Localized => L(xs.map((x) => x.en).join(j), xs.map((x) => x.te ?? x.en).join(j));

function obj(s: Spec): OSpec {
  // eager check: every bilingual string must carry its gloss (fails at load, not inside a generator)
  const glossed = [s.title, s.hint, ...(s.mcq ?? []).flatMap(([q, , , h, y]) => [q, h, y]), ...(s.pic ?? []).flatMap(([q, , , h, y]) => [q, h, y]),
    ...(s.match ? [s.match[0]] : []), ...(s.order ? [s.order[0]] : []), ...(s.tap ? [s.tap[0], s.tap[2]] : [])];
  const missing = glossed.filter((x) => !x.includes(SEP));
  if (missing.length) throw new Error(`${s.id}: missing English gloss in ${missing.map((x) => `"${x}"`).join(', ')}`);
  const practice: TSpec[] = [];
  const H0 = t(s.hint);
  if (s.mcq) {
    if (s.mcq.length < 5) throw new Error(`${s.id}: mcq bank needs >= 5`);
    const bank = s.mcq;
    practice.push(tp('mcq', (r) => {
      const [q, a, wr, h1, why] = r.pick(bank);
      const A = w(a), W = t(why);
      return {
        type: 'mcq', prompt: t(q), ...choose(r, A, wr.map(w)), hints: [H0, t(h1), LAST],
        mistakes: [{ when: 'wrong', explain: oops(W) }], solution: [answer(A), W],
      };
    }));
  }
  if (s.pic) {
    if (s.pic.length < 5) throw new Error(`${s.id}: pic bank needs >= 5`);
    const bank = s.pic;
    practice.push(tp('pic', (r) => {
      const [q, [ce, cl], wr, h1, why] = r.pick(bank);
      const A = w(cl), W = t(why);
      return {
        type: 'mcq', prompt: t(q),
        ...pictures(r, { label: A, visual: { kind: 'emoji', text: ce } }, wr.map(([e, l]) => ({ label: w(l), visual: { kind: 'emoji' as const, text: e } })), 3),
        hints: [H0, t(h1), PICH], mistakes: [{ when: 'wrong', explain: oops(W) }], solution: [answer(A), W],
      };
    }));
  }
  if (s.match) {
    const [pr, pool] = s.match;
    if (pool.length < 5) throw new Error(`${s.id}: match pool needs >= 5`);
    const PR = t(pr);
    practice.push(tp('match', (r) => {
      const pairs = r.shuffle(pool).slice(0, 4).map(([a, b]) => [w(a), w(b)] as [Localized, Localized]);
      const m = matching(r, pairs);
      const lefts = joinL(pairs.map((x) => x[0]), ' · ');
      return {
        type: 'match', prompt: L(`${PR.en}: ${lefts.en}`, `${PR.te}: ${lefts.te}`), left: m.left, right: m.right, answer: m.answer,
        hints: [H0, t('నీకు బాగా తెలిసిన జతను ముందు కలుపు — మిగిలినవి తేలిక అవుతాయి. // Join the pair you are surest of first; the rest get easier.')],
        mistakes: [{ when: 'wrong', explain: oops(t('ఒక జత తప్పుగా ఉంది — ఒక్కొక్క జతను మళ్ళీ చూడు. // One pair is mixed up — check each pair again.')) }],
        solution: pairs.map(([a, b]) => L(`${a.en} → ${b.en}`, `${a.te} → ${b.te}`)),
      };
    }, 2));
  }
  if (s.order) {
    const [pr, seqs] = s.order;
    seqs.forEach((q) => { if (new Set(q).size !== q.length) throw new Error(`${s.id}: repeated item in ${q.join(' ')}`); });
    const PR = t(pr);
    practice.push(tp('order', (r) => {
      const seq = r.pick(seqs).map(w);
      const first = seq[0], last = seq[seq.length - 1];
      return {
        type: 'order', prompt: PR, ...ordering(r, seq),
        hints: [H0, L(`It begins with "${first.en}".`, `మొదట వచ్చేది: "${first.te}".`), L(`It ends with "${last.en}".`, `చివర వచ్చేది: "${last.te}".`)],
        mistakes: [{ when: 'wrong', explain: oops(t('వరుస ఇంకా సరిగా లేదు. మొదటిదాన్ని పెట్టి, తర్వాత ఏది వస్తుందో ఆలోచించు. // The order is not right yet. Place the first one, then think what comes next.')) }],
        solution: [joinL(seq, ' → ')],
      };
    }, 2));
  }
  if (s.tap) {
    const [pr, pool, why] = s.tap;
    if (pool.length < 6) throw new Error(`${s.id}: tap pool needs >= 6`);
    const PR = t(pr), W = t(why);
    const yes = pool.find((x) => x[1])!, no = pool.find((x) => !x[1])!;
    practice.push(tp('tap', (r) => {
      const pick = r.shuffle(pool).slice(0, 5);
      if (!pick.some((x) => x[1])) pick[0] = yes;
      if (!pick.some((x) => !x[1])) pick[4] = no;
      const k = pick.filter((x) => x[1]).length;
      return {
        type: 'tap', prompt: PR, ...tapAll(r, pick.map(([label, ok]) => ({ label: w(label), ok }))),
        hints: [H0, L(`There ${k === 1 ? 'is 1 correct answer' : `are ${k} correct answers`}.`, `సరైనవి ${k} ఉన్నాయి.`)],
        mistakes: [{ when: 'wrong', explain: oops(W) }],
        solution: [answer(joinL(pick.filter((x) => x[1]).map((x) => w(x[0])), ', ')), W],
      };
    }, 2));
  }
  return { id: s.id, title: t(s.title), prereqs: [], intro: s.intro, examples: s.ex, practice };
}

const unit = (n: number | string, id: string, title: string, objectives: OSpec[], note = REVIEW): USpec => ({
  id: `ts3.te.${id}`, subject: 'telugu', title: t(title), source: tsSrc(3, 'telugu', n), objectives, note,
});
const REVIEW = 'Taught from the lesson theme only; the textbook song/story is not reproduced — teacher should connect it to the book text.';

// ============================================================ 0. సంసిద్ధత పాఠాలు (Readiness)
const ch0 = unit(0, 'ch0', 'సంసిద్ధత పాఠాలు // Readiness lessons', [
  obj({
    id: 'ts3.te.ready.pictures', title: 'బొమ్మలు — పదాలు // Pictures and words', hint: 'బొమ్మ పేరు గట్టిగా చెప్పు. // Say the picture name aloud.',
    intro: [
      P('మూడో తరగతికి స్వాగతం! ముందుగా ఒకటి, రెండు తరగతుల్లో నేర్చుకున్న అక్షరాలు, పదాలను మళ్ళీ గుర్తు చేసుకుందాం. // Welcome to Class 3! First, let us revise the letters and words we learnt in Classes 1 and 2.'),
      PH('🐘', 'ఏనుగు — "ఏ" అనే అక్షరంతో మొదలవుతుంది. // Elephant (ఏనుగు) starts with the letter ఏ.'),
      P('బొమ్మ పేరును నెమ్మదిగా పలుకు. మొదట వినిపించే ధ్వనే ఆ పదం మొదటి అక్షరం. // Say the picture name slowly. The first sound you hear is the first letter of the word.'),
      TIP('ఒక్కో అక్షరానికి ఒక చప్పట్లు కొడుతూ పదం చెప్పు: చే-ప (2), ఏ-ను-గు (3). // Clap once for each letter-sound: చే-ప (2), ఏ-ను-గు (3).'),
      KEYS('చేప = fish 🐟 // చేప = fish', 'ఆవు = cow 🐄 // ఆవు = cow', 'కోతి = monkey 🐒 // కోతి = monkey'),
    ],
    ex: [
      EX('"పిల్లి" మొదటి అక్షరం ఏది? // What is the first letter of పిల్లి (cat)?', ['పి-ల్లి అని విడదీసి పలుకు. // Say it in parts: పి-ల్లి.', 'మొదటి అక్షరం "పి". // The first letter is పి.'], 'పి // పి'),
      EX('"మామిడి" లో ఎన్ని అక్షరాలు? // How many letters in మామిడి (mango)?', ['మా-మి-డి అని చప్పట్లు కొట్టు. // Clap: మా-మి-డి.', 'మూడు చప్పట్లు. // Three claps.'], '3 // 3'),
    ],
    pic: [
      ['"చేప" బొమ్మ ఏది? // Which picture is చేప (fish)?', ['🐟', 'చేప=fish'], [['🐱', 'పిల్లి=cat'], ['🐄', 'ఆవు=cow']], 'చేప నీటిలో ఈదుతుంది. // A fish swims in water.', 'చేప 🐟 నీటిలో ఉంటుంది. // The fish lives in water.'],
      ['"ఆవు" బొమ్మ ఏది? // Which picture is ఆవు (cow)?', ['🐄', 'ఆవు=cow'], [['🐒', 'కోతి=monkey'], ['🐘', 'ఏనుగు=elephant']], 'ఆవు మనకు పాలు ఇస్తుంది. // A cow gives us milk.', 'ఆవు 🐄 పాలు ఇస్తుంది. // The cow gives milk.'],
      ['"కోతి" బొమ్మ ఏది? // Which picture is కోతి (monkey)?', ['🐒', 'కోతి=monkey'], [['🐟', 'చేప=fish'], ['🦚', 'నెమలి=peacock']], 'కోతి చెట్ల మీద దూకుతుంది. // A monkey jumps on trees.', 'కోతి 🐒 కొమ్మల మీద ఆడుతుంది. // The monkey plays on branches.'],
      ['"నెమలి" బొమ్మ ఏది? // Which picture is నెమలి (peacock)?', ['🦚', 'నెమలి=peacock'], [['🦆', 'బాతు=duck'], ['🐓', 'కోడి=hen']], 'నెమలికి రంగుల ఈకలు ఉంటాయి. // A peacock has colourful feathers.', 'నెమలి 🦚 పురి విప్పి ఆడుతుంది. // The peacock dances with its feathers open.'],
      ['"గాలిపటం" బొమ్మ ఏది? // Which picture is గాలిపటం (kite)?', ['🪁', 'గాలిపటం=kite'], [['🎈', 'బుడగ=balloon'], ['⚽', 'బంతి=ball']], 'దారంతో ఆకాశంలో ఎగురుతుంది. // It flies in the sky on a string.', 'గాలిపటం 🪁 గాలిలో ఎగురుతుంది. // The kite flies in the wind.'],
      ['"అరటి పండు" బొమ్మ ఏది? // Which picture is అరటి పండు (banana)?', ['🍌', 'అరటి పండు=banana'], [['🥭', 'మామిడి పండు=mango'], ['🍎', 'ఆపిల్=apple']], 'పొడవుగా, పసుపు రంగులో ఉంటుంది. // It is long and yellow.', 'అరటి పండు 🍌 పొడవుగా ఉంటుంది. // The banana is long.'],
      ['"గొడుగు" బొమ్మ ఏది? // Which picture is గొడుగు (umbrella)?', ['☂️', 'గొడుగు=umbrella'], [['🎒', 'సంచి=bag'], ['🪑', 'కుర్చీ=chair']], 'వానలో తడవకుండా కాపాడుతుంది. // It keeps us dry in the rain.', 'గొడుగు ☂️ వాన నుండి కాపాడుతుంది. // The umbrella protects us from rain.'],
    ],
    match: ['పదాన్ని దాని మొదటి అక్షరంతో కలుపు // Match each word to its first letter', [
      ['అమ్మ=mother', 'అ'], ['ఇల్లు=house', 'ఇ'], ['ఉడుత=squirrel', 'ఉ'], ['ఏనుగు=elephant', 'ఏ'], ['ఒంటె=camel', 'ఒ'], ['ఆవు=cow', 'ఆ'], ['ఈక=feather', 'ఈ'],
    ]],
  }),
  obj({
    id: 'ts3.te.ready.letters', title: 'అచ్చులు, హల్లులు // Vowels and consonants', hint: 'అచ్చులు "అ" నుండి "ఔ" వరకు ఉంటాయి. // Vowels run from అ to ఔ.',
    intro: [
      P('తెలుగు అక్షరాలు రెండు రకాలు. అచ్చులు: అ ఆ ఇ ఈ ఉ ఊ ఋ ఎ ఏ ఐ ఒ ఓ ఔ. హల్లులు: క ఖ గ ఘ చ ఛ జ ట డ త ద న ప బ మ య ర ల వ స హ … // Telugu letters are of two kinds: vowels (అచ్చులు) and consonants (హల్లులు).'),
      PH('🔤', 'అచ్చులు సొంతంగా పలుకుతాయి; హల్లులు అచ్చు సాయంతో పలుకుతాయి. // Vowels sound on their own; consonants need a vowel to sound.'),
      POEM(['అ ఆ ఇ ఈ — ఆడుకుందాం రా రా!', 'ఉ ఊ ఎ ఏ — ఊయల ఊగుదాం రా రా!', 'ఐ ఒ ఓ ఔ — అక్షరాలే మన తోడు!'], 'A little vowel chant: a, aa, i, ee — let us play; u, oo, e, ae — let us swing; letters are our friends! (our own rhyme)'),
      TIP('పై పాటను చప్పట్లు కొడుతూ పాడు — అచ్చుల వరుస గుర్తుంటుంది. // Sing the chant above with claps to remember the vowel order.'),
      KEYS('అచ్చులు = vowels (అ, ఆ, ఇ …) // vowels: అ, ఆ, ఇ …', 'హల్లులు = consonants (క, గ, చ …) // consonants: క, గ, చ …'),
    ],
    ex: [
      EX('"ఇ" అచ్చా, హల్లా? // Is ఇ a vowel or a consonant?', ['అచ్చుల వరుస: అ ఆ ఇ … // Vowel order: అ ఆ ఇ …', '"ఇ" ఆ వరుసలో ఉంది. // ఇ is in that list.'], 'అచ్చు // vowel'),
      EX('"ఆ" తర్వాత వచ్చే అచ్చు ఏది? // Which vowel comes after ఆ?', ['అ, ఆ, … అని పలుకు. // Say అ, ఆ, …', 'తర్వాత "ఇ". // Next is ఇ.'], 'ఇ // ఇ'),
    ],
    mcq: [
      ['వీటిలో అచ్చు ఏది? // Which of these is a vowel?', 'ఉ', ['క', 'మ', 'ర'], 'అచ్చుల పాట గుర్తు చేసుకో. // Remember the vowel chant.', '"ఉ" అచ్చు; క, మ, ర హల్లులు. // ఉ is a vowel; క, మ, ర are consonants.'],
      ['వీటిలో హల్లు ఏది? // Which of these is a consonant?', 'ప', ['అ', 'ఈ', 'ఓ'], 'అచ్చు కానిది హల్లు. // A letter that is not a vowel is a consonant.', '"ప" హల్లు. // ప is a consonant.'],
      ['"ఎ" తర్వాత వచ్చే అచ్చు? // Which vowel comes after ఎ?', 'ఏ', ['ఐ', 'ఒ', 'ఇ'], 'పొట్టి ఎ, తర్వాత పొడవు … // Short ఎ, then long …', 'ఎ → ఏ → ఐ. // ఎ → ఏ → ఐ.'],
      ['"క" తర్వాత వచ్చే హల్లు? // Which consonant comes after క?', 'ఖ', ['గ', 'చ', 'మ'], 'క ఖ గ ఘ … // క ఖ గ ఘ …', 'క → ఖ → గ → ఘ. // క → ఖ → గ → ఘ.'],
      ['అచ్చులలో మొదటి అక్షరం? // What is the first vowel?', 'అ', ['ఆ', 'క', 'ఇ'], '"అమ్మ" పదం మొదటి అక్షరం. // The first letter of అమ్మ.', 'తెలుగు అక్షరమాల "అ"తో మొదలవుతుంది. // The Telugu alphabet starts with అ.'],
      ['"త" తర్వాత వచ్చే హల్లు? // Which consonant comes after త?', 'థ', ['ద', 'న', 'ప'], 'త థ ద ధ న … // త థ ద ధ న …', 'త → థ → ద → ధ → న. // త → థ → ద → ధ → న.'],
    ],
    tap: ['అచ్చులను మాత్రమే ఎంచుకో // Tap only the vowels', [
      ['అ', true], ['ఇ', true], ['ఉ', true], ['ఏ', true], ['ఓ', true], ['ఐ', true], ['క', false], ['మ', false], ['ర', false], ['త', false], ['స', false],
    ], 'అ, ఆ, ఇ, ఈ, ఉ, ఊ, ఎ, ఏ, ఐ, ఒ, ఓ, ఔ — అచ్చులు. క, మ, ర, త, స — హల్లులు. // అ … ఔ are vowels; క, మ, ర, త, స are consonants.'],
  }),
  obj({
    id: 'ts3.te.ready.gunintham', title: 'గుణింతాలతో పదాలు // Building words with vowel signs', hint: 'హల్లు + అచ్చు గుర్తు = కొత్త అక్షరం. // Consonant + vowel sign = a new letter.',
    intro: [
      P('హల్లుకు అచ్చు గుర్తు (గుణింతం) చేరితే కొత్త అక్షరం వస్తుంది: క + ఆ = కా, క + ఇ = కి, క + ఉ = కు, క + ఏ = కే, క + ఓ = కో. // A consonant plus a vowel sign makes a new letter: క + ఆ = కా, క + ఇ = కి, and so on.'),
      PH('🥭', 'మా-మి-డి: మ + ఆ = మా, మ + ఇ = మి, డ + ఇ = డి. // మామిడి (mango) is built from three letters with vowel signs.'),
      TIP('అక్షరాలను సరైన వరుసలో పెడితేనే పదం వస్తుంది. // Letters make a word only in the right order.'),
      KEYS('క + ఆ = కా // ka + aa = kaa', 'మ + ఇ = మి // ma + i = mi', 'ప + ఉ = పు // pa + u = pu'),
    ],
    ex: [
      EX('"ప" కు "ఆ" గుర్తు చేర్చితే? // ప + ఆ = ?', ['దీర్ఘం (ా) గుర్తు చేరుతుంది. // The long-a sign (ా) is added.'], 'పా // పా'),
      EX('అ, ర, టి — ఈ అక్షరాలతో పదం కూర్చు. // Make a word from అ, ర, టి.', ['మొదట "అ", తర్వాత "ర", చివర "టి". // First అ, then ర, last టి.', 'అరటి = banana. // అరటి means banana.'], 'అరటి // అరటి (banana)'),
    ],
    mcq: [
      ['మ + ఆ = ? // ma + aa = ?', 'మా', ['మి', 'ము', 'మె'], 'ఆ గుర్తు (ా) చేర్చు. // Add the ఆ sign (ా).', 'మ + ఆ = మా. // మ + ఆ = మా.'],
      ['క + ఇ = ? // ka + i = ?', 'కి', ['కా', 'కు', 'కో'], 'ఇ గుర్తు (ి) చేర్చు. // Add the ఇ sign (ి).', 'క + ఇ = కి. // క + ఇ = కి.'],
      ['ప + ఉ = ? // pa + u = ?', 'పు', ['పి', 'పా', 'పే'], 'ఉ గుర్తు (ు) చేర్చు. // Add the ఉ sign (ు).', 'ప + ఉ = పు. // ప + ఉ = పు.'],
      ['చ + ఏ = ? // ca + ae = ?', 'చే', ['చి', 'చా', 'చు'], 'ఏ గుర్తు (ే) చేర్చు. // Add the ఏ sign (ే).', 'చ + ఏ = చే — "చేప" లో మొదటి అక్షరం. // చే, as in చేప (fish).'],
      ['గ + ఓ = ? // ga + o = ?', 'గో', ['గి', 'గా', 'గు'], 'ఓ గుర్తు (ో) చేర్చు. // Add the ఓ sign (ో).', 'గ + ఓ = గో. // గ + ఓ = గో.'],
      ['"కోతి" లో మొదటి అక్షరం ఎలా వచ్చింది? // How is the first letter of కోతి made?', 'క + ఓ', ['క + ఆ', 'క + ఇ', 'త + ఓ'], 'కో అని పలుకు. // Say కో.', 'క + ఓ = కో. // క + ఓ = కో.'],
    ],
    order: ['అక్షరాలను సరైన వరుసలో పెట్టి పదం చెయ్యి // Put the letters in order to make the word', [
      ['మా', 'మి', 'డి'], ['అ', 'ర', 'టి'], ['ఏ', 'ను', 'గు'], ['గా', 'లి', 'ప', 'టం'], ['బ', 'ల్ల'], ['పు', 'స్త', 'కం'], ['కో', 'తి'],
    ]],
  }),
], 'Readiness revision (letters, words, vowel signs) taught with original examples.');

// ============================================================ 1. వానదేవుడా! (song — environment)
const ch1 = unit(1, 'ch1', 'వానదేవుడా! // O Rain God!', [
  obj({
    id: 'ts3.te.vana.song', title: 'వాన పాట — భావం // The rain song and its idea', hint: 'వాన వస్తే ఎవరెవరు సంతోషిస్తారో ఆలోచించు. // Think who is happy when rain comes.',
    intro: [
      P('"వానదేవుడా!" ఒక గేయం (పాట). వాన రావాలని పిల్లలు, రైతులు కోరుకుంటారు. వాన వస్తే చెరువులు నిండుతాయి, పొలాలు పచ్చగా అవుతాయి, అందరికీ తాగడానికి నీళ్ళు దొరుకుతాయి. // "O Rain God!" is a song. Children and farmers wish for rain: it fills ponds, makes fields green and gives everyone water.'),
      PH('🌧️', 'వాన — భూమికి నీళ్ళు ఇస్తుంది. // Rain gives water to the earth.'),
      P('మన సొంత వాన పాట పాడదాం: // Let us sing our own rain rhyme:'),
      POEM(['నల్లని మబ్బులు వచ్చాయి,', 'చల్లని గాలులు వీచాయి,', 'చిటపట చినుకులు రాలాయి,', 'పచ్చని మొక్కలు నవ్వాయి!'], 'Dark clouds came, cool winds blew, raindrops fell pitter-patter, green plants smiled! (our own rhyme)'),
      TIP('ప్రతి వరుస చివర "-ాయి" వస్తుంది — అదే పాటకు అందం (ప్రాస). // Every line ends in "-aayi" — that rhyme makes the song sweet.'),
    ],
    ex: [
      EX('వాన పడితే రైతు ఎందుకు సంతోషిస్తాడు? // Why is the farmer happy when it rains?', ['పొలానికి నీళ్ళు కావాలి. // Fields need water.', 'నీళ్ళు ఉంటేనే పంట పండుతుంది. // Crops grow only with water.'], 'పంట బాగా పండుతుంది // the crop grows well'),
      EX('మన పాటలో మొదట ఏమి వచ్చాయి? // In our rhyme, what came first?', ['మొదటి వరుస: "నల్లని మబ్బులు వచ్చాయి". // Line 1: dark clouds came.'], 'నల్లని మబ్బులు // dark clouds'),
    ],
    order: ['మన వాన పాట వరుసలను సరైన క్రమంలో పెట్టు // Put the lines of our rain rhyme in order', [
      ['నల్లని మబ్బులు వచ్చాయి=dark clouds came', 'చల్లని గాలులు వీచాయి=cool winds blew', 'చిటపట చినుకులు రాలాయి=drops fell', 'పచ్చని మొక్కలు నవ్వాయి=plants smiled'],
      ['మబ్బులు కమ్మాయి=clouds gathered', 'ఉరుములు ఉరిమాయి=thunder roared', 'వాన కురిసింది=rain poured', 'చెరువు నిండింది=pond filled'],
    ]],
    mcq: [
      ['వాన ఎక్కడి నుండి వస్తుంది? // Where does rain come from?', 'మబ్బుల నుండి=from clouds', ['చెట్ల నుండి=from trees', 'కొండల నుండి=from hills', 'ఇంటి నుండి=from the house'], 'ఆకాశంలో నల్లగా ఉండేవి. // The dark things in the sky.', 'నల్లని మబ్బులు వాన కురిపిస్తాయి. // Dark clouds bring rain.'],
      ['వాన వస్తే చెరువు ఏమవుతుంది? // What happens to the pond when it rains?', 'నిండుతుంది=it fills up', ['ఎండిపోతుంది=it dries up', 'మాయమవుతుంది=it vanishes', 'కాలిపోతుంది=it burns'], 'నీళ్ళు చేరుతాయి. // Water collects.', 'వాన నీటితో చెరువు నిండుతుంది. // Rainwater fills the pond.'],
      ['వాన కోసం ఎక్కువగా ఎదురుచూసేది ఎవరు? // Who waits most eagerly for rain?', 'రైతు=farmer', ['దర్జీ=tailor', 'డ్రైవర్=driver', 'కుమ్మరి=potter'], 'పొలంలో పని చేసేవారు. // The one who works in fields.', 'రైతుకు పంట కోసం వాన కావాలి. // The farmer needs rain for crops.'],
      ['వానలో మనం దేనిని పట్టుకుంటాం? // What do we hold in the rain?', 'గొడుగు=umbrella', ['గాలిపటం=kite', 'బంతి=ball', 'దీపం=lamp'], 'తల మీద పట్టుకుంటాం. // We hold it over our head.', 'గొడుగు వాన నుండి కాపాడుతుంది. // An umbrella protects us from rain.'],
      ['వాన తర్వాత ఆకాశంలో కనిపించే రంగుల విల్లు? // The colourful bow seen in the sky after rain?', 'ఇంద్రధనుస్సు=rainbow', ['చందమామ=moon', 'నక్షత్రం=star', 'మెరుపు=lightning'], 'ఏడు రంగులు ఉంటాయి. // It has seven colours.', 'వాన తర్వాత ఎండ పడితే ఇంద్రధనుస్సు 🌈 వస్తుంది. // A rainbow appears when sun shines after rain.'],
      ['వాన పాటలో నెమలి ఏం చేస్తుంది? // In rain songs, what does the peacock do?', 'నాట్యం చేస్తుంది=it dances', ['నిద్రపోతుంది=it sleeps', 'ఏడుస్తుంది=it cries', 'పారిపోతుంది=it runs away'], 'మబ్బులు చూస్తే నెమలికి సంతోషం. // Peacocks love the clouds.', 'మబ్బులు కమ్మగానే నెమలి పురి విప్పి ఆడుతుంది. // The peacock dances when clouds gather.'],
    ],
  }),
  obj({
    id: 'ts3.te.vana.sounds', title: 'వాన మాటలు, ధ్వని పదాలు // Rain words and sound words', hint: 'ఆ శబ్దం చెవికి ఎలా వినిపిస్తుందో అనుకో. // Imagine how the sound feels in your ears.',
    intro: [
      P('వానకు సంబంధించిన పదాలు: మబ్బు (cloud), చినుకు (raindrop), ఉరుము (thunder), మెరుపు (lightning), వరద (flood), ఇంద్రధనుస్సు (rainbow). // Rain words: cloud, raindrop, thunder, lightning, flood, rainbow.'),
      PH('⛈️', 'ఉరుము గర్జిస్తుంది, మెరుపు తళతళ మెరుస్తుంది. // Thunder roars, lightning flashes.'),
      P('కొన్ని పదాలు శబ్దాన్ని అనుకరిస్తాయి (ధ్వని పదాలు): చిటపట (చినుకులు), గలగల (పారే నీరు), తళతళ (మెరుపు), జలజల (వాన ధార). // Some words copy sounds: చిటపట (drops), గలగల (flowing water), తళతళ (flash), జలజల (pouring rain).'),
      TIP('పదాన్ని గట్టిగా పలికి చూడు — శబ్దంలాగే వినిపిస్తుంది! // Say the word aloud — it sounds just like the thing!'),
      KEYS('వాన = వర్షం // rain (two words, same meaning)', 'మబ్బు = మేఘం // cloud', 'నీరు = జలం // water'),
    ],
    ex: [
      EX('చినుకులు పడే శబ్దం ఏది? // Which word is the sound of falling drops?', ['చిన్న చిన్న చుక్కలు నేల మీద టప టప పడతాయి. // Small drops tap the ground.'], 'చిటపట // pitter-patter'),
      EX('"వాన" కు మరో పదం? // Another word for వాన?', ['ఒకే అర్థం ఇచ్చే పదాలు పర్యాయ పదాలు. // Words with the same meaning are synonyms.'], 'వర్షం // rain'),
    ],
    match: ['ధ్వని పదాన్ని దానికి సరిపోయే దానితో కలుపు // Match each sound word to what makes it', [
      ['చిటపట', 'చినుకులు=raindrops'], ['గలగల', 'పారే నది=flowing river'], ['తళతళ', 'మెరుపు=lightning'], ['గడగడ', 'ఉరుము=thunder'], ['బుయ్ బుయ్', 'గాలి=wind'], ['కుహూ కుహూ', 'కోయిల=cuckoo'],
    ]],
    mcq: [
      ['"మబ్బు" కు మరో పదం? // Another word for మబ్బు (cloud)?', 'మేఘం', ['మెరుపు', 'చినుకు', 'చెరువు'], 'ఆకాశంలో తేలుతుంది. // It floats in the sky.', 'మబ్బు = మేఘం. // మబ్బు and మేఘం both mean cloud.'],
      ['"నీరు" కు మరో పదం? // Another word for నీరు (water)?', 'జలం', ['గాలి', 'నేల', 'నిప్పు'], '"జలపాతం" లో ఉంది. // It is in జలపాతం (waterfall).', 'నీరు = జలం. // నీరు and జలం both mean water.'],
      ['ఆకాశంలో తళతళ మెరిసేది? // What flashes bright in the sky?', 'మెరుపు=lightning', ['ఉరుము=thunder', 'వరద=flood', 'చినుకు=drop'], 'కళ్ళతో చూస్తాం. // We see it with our eyes.', 'మెరుపు తళతళ మెరుస్తుంది. // Lightning flashes.'],
      ['ఉరుము ఎలా ఉంటుంది? // What is thunder like?', 'పెద్ద శబ్దం=a loud sound', ['తీపి రుచి=a sweet taste', 'మంచి వాసన=a nice smell', 'చల్లని నీరు=cold water'], 'చెవులతో వింటాం. // We hear it with our ears.', 'ఉరుము గడగడ అని పెద్ద శబ్దం చేస్తుంది. // Thunder makes a loud rumble.'],
      ['ఎక్కువ వాన వల్ల నీరు ఊళ్ళలోకి వస్తే దాన్ని ఏమంటారు? // Too much rainwater flooding a village is called?', 'వరద=flood', ['కరువు=drought', 'ఎండ=sunshine', 'మంచు=snow'], 'నదులు పొంగుతాయి. // Rivers overflow.', 'ఎక్కువ నీరు పొంగితే వరద. // Overflowing water is a flood.'],
      ['నది నీరు పారే శబ్దం? // The sound of a flowing river?', 'గలగల', ['చిటపట', 'తళతళ', 'భౌభౌ'], 'నది పాడుతున్నట్టు. // As if the river sings.', 'నది గలగల పారుతుంది. // A river flows galagala.'],
    ],
  }),
  obj({
    id: 'ts3.te.vana.save', title: 'నీటిని కాపాడుదాం // Let us save water', hint: 'నీరు వృథా అవుతుందా, దాచుకుంటున్నామా? // Is water wasted or saved?',
    intro: [
      P('వాన నీరు చాలా విలువైనది. మనం నీటిని వృథా చేయకూడదు. పళ్ళు తోముకునేటప్పుడు కుళాయి కట్టేయాలి, వాన నీటిని గుంతలలో, ట్యాంకులలో నిల్వ చేయాలి, చెట్లు నాటాలి. // Rainwater is precious. Do not waste it: turn off the tap while brushing, store rainwater, plant trees.'),
      PH('💧', 'ప్రతి నీటి చుక్క విలువైనదే. // Every drop counts.'),
      TIP('చెట్లు ఎక్కువగా ఉంటే వానలు బాగా పడతాయి. // More trees help bring good rain.'),
      KEYS('వృథా = waste // waste', 'నిల్వ = store // store', 'కుళాయి = tap // tap'),
    ],
    ex: [
      EX('పళ్ళు తోముకునేటప్పుడు కుళాయి ఏం చేయాలి? // What should we do with the tap while brushing?', ['నీరు ఊరికే పోకూడదు. // Water should not run for nothing.'], 'కట్టేయాలి // turn it off'),
      EX('వాన నీటిని ఎలా దాచుకోవచ్చు? // How can we save rainwater?', ['ఇంటి పైకప్పు నుండి నీటిని ట్యాంకులోకి పంపవచ్చు. // Lead roof water into a tank.'], 'ట్యాంకులో / గుంతలో నిల్వ చేసి // by storing it in a tank or pit'),
    ],
    tap: ['నీటిని కాపాడే మంచి పనులను ఎంచుకో // Tap the good habits that save water', [
      ['కుళాయి కట్టేయడం=turning off the tap', true], ['వాన నీరు నిల్వ చేయడం=storing rainwater', true], ['చెట్లు నాటడం=planting trees', true], ['బకెట్‌తో స్నానం=bathing with a bucket', true],
      ['కుళాయి తెరిచి వదిలేయడం=leaving the tap open', false], ['ఆటకోసం నీళ్ళు పారబోయడం=splashing water away for fun', false], ['చెరువులో చెత్త వేయడం=throwing rubbish in ponds', false],
    ], 'నీరు వృథా కాకుండా చేసే పనులే మంచివి. // Good habits are the ones that stop water being wasted.'],
    mcq: [
      ['నీటిని వృథా చేయడం మంచిదా? // Is wasting water good?', 'కాదు=no', ['అవును=yes', 'కొన్నిసార్లు=sometimes', 'తెలియదు=do not know'], 'నీరు అందరికీ కావాలి. // Everyone needs water.', 'నీరు విలువైనది — వృథా చేయకూడదు. // Water is precious — never waste it.'],
      ['వానలు బాగా పడాలంటే ఏం చేయాలి? // What helps bring good rain?', 'చెట్లు నాటాలి=plant trees', ['చెట్లు కొట్టాలి=cut trees', 'చెత్త కాల్చాలి=burn rubbish', 'నీళ్ళు పారబోయాలి=pour water away'], 'చెట్లు మబ్బులకు స్నేహితులు. // Trees are friends of clouds.', 'చెట్లు ఉంటే వానలు బాగా పడతాయి. // Trees help rainfall.'],
      ['"వృథా" అంటే? // What does వృథా mean?', 'ఊరికే పోవడం=wasted', ['దాచుకోవడం=saved', 'తాగడం=drinking', 'పంచుకోవడం=sharing'], 'ఉపయోగం లేకుండా పోతే … // Lost without use …', 'వృథా = waste. // వృథా means wasted.'],
      ['చెరువులో ఏం వేయకూడదు? // What must we not throw in a pond?', 'చెత్త=rubbish', ['ఏమీ కాదు, అన్నీ వేయవచ్చు=anything is fine', 'పువ్వులు మాత్రమే వేయాలి=only flowers', 'రాళ్ళు మాత్రమే వేయాలి=only stones'], 'చెరువు నీరు శుభ్రంగా ఉండాలి. // Pond water must stay clean.', 'చెత్త వేస్తే నీరు పాడవుతుంది. // Rubbish spoils the water.'],
      ['ఇంటి పైకప్పు మీద పడిన వాన నీటిని ఏం చేయవచ్చు? // What can we do with rain falling on the roof?', 'ట్యాంకులో నిల్వ చేయవచ్చు=store it in a tank', ['వదిలేయాలి=let it go', 'కాల్చాలి=burn it', 'అమ్మాలి=sell it'], 'తర్వాత వాడుకోవచ్చు. // We can use it later.', 'వాన నీటిని నిల్వ చేస్తే తర్వాత వాడుకోవచ్చు. // Stored rainwater is used later.'],
    ],
  }),
]);

// ============================================================ 2. బాల భీముడు (story — mythology)
const ch2 = unit(2, 'ch2', 'బాల భీముడు // Young Bhima', [
  obj({
    id: 'ts3.te.bheema.story', title: 'భీముడి కథ // The story of young Bhima', hint: 'కథలో ఏం జరిగిందో వరుసగా గుర్తు చేసుకో. // Recall what happened, in order.',
    intro: [
      P('మహాభారతంలో పాండవులు ఐదుగురు అన్నదమ్ములు: ధర్మరాజు, భీముడు, అర్జునుడు, నకులుడు, సహదేవుడు. వాళ్ళ అమ్మ కుంతి. రెండోవాడు భీముడు — చిన్నప్పటి నుండే చాలా బలవంతుడు. // In the Mahabharata the Pandavas are five brothers; their mother is Kunti. The second, Bhima, was very strong even as a child.'),
      PH('💪', 'భీముడు — బలానికి గుర్తు. // Bhima — a symbol of strength.'),
      P('మా మాటల్లో కథ: చిన్న భీముడు ఆటల్లో అందరినీ గెలిచేవాడు. దుర్యోధనుడికి అసూయ కలిగింది. భీముడికి హాని చేయాలని మోసం చేశాడు. కానీ భీముడు ధైర్యంగా బయటపడి ఇంకా బలవంతుడయ్యాడు. చివరికి మంచితనమే గెలిచింది. // In our words: little Bhima won every game; jealous Duryodhana tricked him, but brave Bhima escaped and grew even stronger. Goodness won.'),
      TIP('కథ చెప్పేటప్పుడు "మొదట… తర్వాత… చివరికి…" అని చెప్పు. // Tell a story with "first … then … finally …".'),
      KEYS('బలం = strength // strength', 'అసూయ = jealousy // jealousy', 'ధైర్యం = courage // courage'),
    ],
    ex: [
      EX('పాండవులు ఎంతమంది? // How many Pandavas were there?', ['ధర్మరాజు, భీముడు, అర్జునుడు, నకులుడు, సహదేవుడు — లెక్కపెట్టు. // Count the names.'], 'ఐదుగురు // five'),
      EX('దుర్యోధనుడు భీముడికి ఎందుకు హాని చేయాలనుకున్నాడు? // Why did Duryodhana want to harm Bhima?', ['భీముడు ఆటల్లో అందరినీ గెలిచేవాడు. // Bhima beat everyone.', 'దుర్యోధనుడు ఓర్చుకోలేకపోయాడు. // Duryodhana could not bear it.'], 'అసూయ వల్ల // because of jealousy'),
    ],
    order: ['భీముడి కథను వరుసలో పెట్టు // Put the story of Bhima in order', [
      ['భీముడు ఆటల్లో గెలిచాడు=Bhima won games', 'దుర్యోధనుడికి అసూయ కలిగింది=Duryodhana grew jealous', 'దుర్యోధనుడు మోసం చేశాడు=Duryodhana tricked him', 'భీముడు ధైర్యంగా బయటపడ్డాడు=Bhima bravely escaped'],
      ['దుర్యోధనుడికి అసూయ కలిగింది=Duryodhana grew jealous', 'దుర్యోధనుడు మోసం చేశాడు=Duryodhana tricked him', 'భీముడు ధైర్యంగా బయటపడ్డాడు=Bhima bravely escaped', 'భీముడు ఇంకా బలవంతుడయ్యాడు=Bhima grew stronger'],
    ]],
    mcq: [
      ['భీముడి అమ్మ పేరు? // What was Bhima\'s mother\'s name?', 'కుంతి=Kunti', ['సీత=Sita', 'యశోద=Yashoda', 'శకుంతల=Shakuntala'], 'పాండవుల తల్లి. // Mother of the Pandavas.', 'పాండవుల తల్లి కుంతి. // Kunti was the Pandavas\' mother.'],
      ['భీముడు దేనికి పేరుపొందాడు? // What was Bhima famous for?', 'బలం=strength', ['భయం=fear', 'సోమరితనం=laziness', 'పాటలు=songs'], 'అందరినీ గెలిచేవాడు. // He beat everyone.', 'భీముడు బలానికి పేరుపొందాడు. // Bhima was famous for his strength.'],
      ['పాండవులలో పెద్దవాడు? // Who was the eldest Pandava?', 'ధర్మరాజు=Dharmaraju', ['భీముడు=Bhima', 'అర్జునుడు=Arjuna', 'సహదేవుడు=Sahadeva'], 'ఆయన పేరులో "ధర్మం" ఉంది. // His name has "dharma" in it.', 'ధర్మరాజు పెద్దవాడు, భీముడు రెండోవాడు. // Dharmaraju was eldest; Bhima was second.'],
      ['భీముడికి హాని చేయాలనుకున్నది ఎవరు? // Who wanted to harm Bhima?', 'దుర్యోధనుడు=Duryodhana', ['అర్జునుడు=Arjuna', 'కుంతి=Kunti', 'నకులుడు=Nakula'], 'అసూయపడినవాడు. // The jealous one.', 'దుర్యోధనుడు అసూయతో మోసం చేశాడు. // Jealous Duryodhana played a trick.'],
      ['ఈ కథ ఏ పెద్ద గ్రంథం నుండి వచ్చింది? // Which great epic does this story come from?', 'మహాభారతం=Mahabharata', ['పంచతంత్రం=Panchatantra', 'వేమన శతకం=Vemana Shatakam', 'బాలమిత్ర=Balamitra'], 'పాండవులు, కౌరవుల కథ. // The story of Pandavas and Kauravas.', 'పాండవుల కథ మహాభారతంలో ఉంది. // The Pandavas\' story is in the Mahabharata.'],
      ['కథ నుండి మనం నేర్చుకునేది? // What do we learn from the story?', 'అసూయ మంచిది కాదు=jealousy is bad', ['మోసం మంచిది=tricks are good', 'బలం వద్దు=strength is bad', 'ఆటలు ఆడకూడదు=never play'], 'దుర్యోధనుడి పని మంచిదా? // Was Duryodhana right?', 'అసూయ చెడ్డది; ధైర్యం, మంచితనం గెలుస్తాయి. // Jealousy is bad; courage and goodness win.'],
    ],
  }),
  obj({
    id: 'ts3.te.bheema.opposites', title: 'వ్యతిరేక పదాలు // Opposite words', hint: 'పూర్తిగా వేరైన అర్థం ఉన్న పదాన్ని వెతుకు. // Find the word that means the very opposite.',
    intro: [
      P('ఒక పదానికి పూర్తిగా వ్యతిరేకమైన అర్థం ఇచ్చే పదాన్ని వ్యతిరేక పదం అంటారు. ఉదా: బలం × బలహీనత, ధైర్యం × భయం, పెద్ద × చిన్న, గెలుపు × ఓటమి. // A word with the opposite meaning is an opposite: strength × weakness, courage × fear, big × small, win × loss.'),
      PH('🏆', 'గెలుపు × ఓటమి // win × loss'),
      TIP('పదాన్ని ఒక చిన్న వాక్యంలో పెట్టి చూడు: "భీముడు బలవంతుడు; ఎలుక బలహీనమైనది." // Try the word in a little sentence.'),
      KEYS('పెద్ద × చిన్న // big × small', 'మంచి × చెడు // good × bad', 'పగలు × రాత్రి // day × night'),
    ],
    ex: [
      EX('"ధైర్యం" వ్యతిరేక పదం? // Opposite of ధైర్యం (courage)?', ['ధైర్యం లేకపోతే మనకు ఏం కలుగుతుంది? // Without courage we feel …'], 'భయం // fear'),
      EX('"గెలుపు" వ్యతిరేక పదం? // Opposite of గెలుపు (win)?', ['ఆటలో ఒకరు గెలిస్తే, మరొకరు … // If one wins, the other …'], 'ఓటమి // loss'),
    ],
    match: ['వ్యతిరేక పదాలను జత చేయి // Match the opposites', [
      ['పెద్ద=big', 'చిన్న=small'], ['మంచి=good', 'చెడు=bad'], ['ధైర్యం=courage', 'భయం=fear'], ['గెలుపు=win', 'ఓటమి=loss'], ['పగలు=day', 'రాత్రి=night'], ['వేడి=hot', 'చల్లని=cold'], ['ముందు=front', 'వెనుక=back'],
    ]],
    mcq: [
      ['"పెద్ద" వ్యతిరేక పదం? // Opposite of పెద్ద (big)?', 'చిన్న=small', ['పొడవు=long', 'లావు=fat', 'ఎత్తు=tall'], 'ఏనుగు పెద్దది, చీమ …? // An elephant is big, an ant is …?', 'పెద్ద × చిన్న. // big × small.'],
      ['"పగలు" వ్యతిరేక పదం? // Opposite of పగలు (day)?', 'రాత్రి=night', ['ఉదయం=morning', 'ఎండ=sun', 'వెలుగు=light'], 'చందమామ వచ్చే సమయం. // The time the moon comes out.', 'పగలు × రాత్రి. // day × night.'],
      ['"బలం" వ్యతిరేక పదం? // Opposite of బలం (strength)?', 'బలహీనత=weakness', ['ధైర్యం=courage', 'శక్తి=power', 'గెలుపు=win'], '"హీన" అంటే తక్కువ. // "heena" means less.', 'బలం × బలహీనత. // strength × weakness.'],
      ['"ముందు" వ్యతిరేక పదం? // Opposite of ముందు (front)?', 'వెనుక=behind', ['పైన=above', 'లోపల=inside', 'దగ్గర=near'], 'వరుసలో నీ ముందు ఒకరు, నీ … ఒకరు. // One in front of you in line, one …', 'ముందు × వెనుక. // front × behind.'],
      ['"నవ్వు" వ్యతిరేక పదం? // Opposite of నవ్వు (laugh)?', 'ఏడుపు=cry', ['ఆట=play', 'పాట=song', 'మాట=word'], 'బాధ కలిగితే ఏం చేస్తాం? // What do we do when hurt?', 'నవ్వు × ఏడుపు. // laugh × cry.'],
      ['"వేడి" వ్యతిరేక పదం? // Opposite of వేడి (hot)?', 'చల్లని=cold', ['ఎర్రని=red', 'తీపి=sweet', 'పెద్ద=big'], 'ఐస్ ఎలా ఉంటుంది? // How does ice feel?', 'వేడి × చల్లని. // hot × cold.'],
    ],
  }),
  obj({
    id: 'ts3.te.bheema.plural', title: 'ఒకటి — చాలా (ఏకవచనం, బహువచనం) // One and many', hint: 'చాలా ఉన్నప్పుడు పదం చివర "-లు" చేరుతుంది. // For many, "-lu" usually joins the end.',
    intro: [
      P('ఒక్కటే ఉంటే ఏకవచనం: అన్న, చెట్టు, ఆట. చాలా ఉంటే బహువచనం: అన్నలు, చెట్లు, ఆటలు. చాలా పదాలకు చివర "లు" చేరుతుంది. // One thing = singular; many = plural. Most words add "-lu": అన్న → అన్నలు.'),
      PH('🌳', 'ఒక చెట్టు → చాలా చెట్లు. // one tree → many trees.'),
      P('కొన్ని మారతాయి: పుస్తకం → పుస్తకాలు, పండు → పండ్లు, కన్ను → కళ్ళు, ఇల్లు → ఇళ్ళు. // Some change shape: పుస్తకం → పుస్తకాలు, పండు → పండ్లు, కన్ను → కళ్ళు.'),
      TIP('"పాండవులు" — ఐదుగురు కాబట్టి బహువచనం! // పాండవులు is plural — there are five of them!'),
      KEYS('ఆట → ఆటలు // game → games', 'పుస్తకం → పుస్తకాలు // book → books', 'చెట్టు → చెట్లు // tree → trees'),
    ],
    ex: [
      EX('"అన్న" బహువచనం? // Plural of అన్న (elder brother)?', ['చివర "లు" చేర్చు. // Add "lu".'], 'అన్నలు // elder brothers'),
      EX('"పుస్తకం" బహువచనం? // Plural of పుస్తకం (book)?', ['"-ం" తో ముగిసే పదాలకు "-ాలు" వస్తుంది. // Words ending in "-am" take "-aalu".'], 'పుస్తకాలు // books'),
    ],
    match: ['ఏకవచనాన్ని బహువచనంతో కలుపు // Match one to many', [
      ['ఆట=game', 'ఆటలు=games'], ['చెట్టు=tree', 'చెట్లు=trees'], ['పుస్తకం=book', 'పుస్తకాలు=books'], ['పండు=fruit', 'పండ్లు=fruits'], ['కన్ను=eye', 'కళ్ళు=eyes'], ['ఇల్లు=house', 'ఇళ్ళు=houses'], ['పువ్వు=flower', 'పువ్వులు=flowers'],
    ]],
    mcq: [
      ['"పువ్వు" బహువచనం? // Plural of పువ్వు (flower)?', 'పువ్వులు', ['పువ్వ', 'పువ్వం', 'పువ్వాలు'], '"లు" చేర్చు. // Add "lu".', 'పువ్వు → పువ్వులు. // flower → flowers.'],
      ['"కన్ను" బహువచనం? // Plural of కన్ను (eye)?', 'కళ్ళు', ['కన్నులు', 'కన్నాలు', 'కన్నం'], 'మనకు రెండు … ఉన్నాయి. // We have two …', 'కన్ను → కళ్ళు. // eye → eyes.'],
      ['ఏది బహువచనం? // Which word is plural?', 'పాండవులు', ['భీముడు', 'కుంతి', 'అర్జునుడు'], 'ఎక్కువ మందిని సూచించే పదం. // The word that means many people.', 'పాండవులు = ఐదుగురు, కాబట్టి బహువచనం. // పాండవులు means five people — plural.'],
      ['"గుర్రం" బహువచనం? // Plural of గుర్రం (horse)?', 'గుర్రాలు', ['గుర్రలు', 'గుర్రం', 'గుర్రి'], '"పుస్తకం → పుస్తకాలు" లాగా. // Like పుస్తకం → పుస్తకాలు.', 'గుర్రం → గుర్రాలు. // horse → horses.'],
      ['"చెట్లు" ఏకవచనం? // Singular of చెట్లు (trees)?', 'చెట్టు', ['చెట్ట', 'చెట్లం', 'చెట్టాలు'], 'ఒక్కటి అయితే … // If only one …', 'చెట్లు → చెట్టు. // trees → tree.'],
      ['"అక్క" బహువచనం? // Plural of అక్క (elder sister)?', 'అక్కలు', ['అక్కాలు', 'అక్కం', 'అక్కళ్ళు'], '"అన్న → అన్నలు" లాగా. // Like అన్న → అన్నలు.', 'అక్క → అక్కలు. // elder sister → elder sisters.'],
    ],
  }),
]);

// ============================================================ 3. అమ్మ (song — values)
const ch3 = unit(3, 'ch3', 'అమ్మ // Mother', [
  obj({
    id: 'ts3.te.amma.song', title: 'అమ్మ ప్రేమ — పాట భావం // A mother\'s love', hint: 'అమ్మ మన కోసం రోజూ ఏమేమి చేస్తుందో ఆలోచించు. // Think what mother does for us every day.',
    intro: [
      P('"అమ్మ" గేయం అమ్మ ప్రేమ గురించి. అమ్మ మనకు అన్నం పెడుతుంది, జోల పాడుతుంది, జబ్బు చేస్తే చూసుకుంటుంది, మంచి మాటలు నేర్పుతుంది. // The song "Amma" is about a mother\'s love: she feeds us, sings lullabies, cares for us when ill and teaches good words.'),
      PH('👩', 'అమ్మ — మన మొదటి గురువు. // Mother — our first teacher.'),
      POEM(['అమ్మ అంటే కమ్మని మాట,', 'అమ్మ ఒడిలో చల్లని పాట,', 'అమ్మ నవ్వితే వెన్నెల తోట,', 'అమ్మకు ప్రేమే మనసంతా!'], 'Mother is a sweet word, a cool song in her lap, a moonlit garden when she smiles; her heart is full of love. (our own rhyme)'),
      TIP('అమ్మకు సాయం చేయడం — ఇంటి పనిలో చిన్న పని అయినా — ఆమెకు సంతోషం. // Helping mother, even with a small job, makes her happy.'),
      P('జోల పాట (పాతకాలపు జానపద గేయం, అందరిదీ): "చందమామ రావే, జాబిల్లి రావే, కొండెక్కి రావే, గోగుపూలు తేవే." // A traditional public-domain lullaby: "Come, moon; come, dear moon; climb the hill and bring flowers."'),
    ],
    ex: [
      EX('అమ్మ మనకు రాత్రి ఏం పాడుతుంది? // What does mother sing at night?', ['నిద్రపుచ్చే పాట. // A song that puts us to sleep.'], 'జోల పాట // a lullaby'),
      EX('అమ్మకు మనం ఎలా సాయం చేయవచ్చు? // How can we help mother?', ['మన బట్టలు, పుస్తకాలు సర్దుకోవచ్చు. // Tidy our clothes and books.', 'అన్నం తిన్న పళ్ళెం తీసి పెట్టవచ్చు. // Clear our plate.'], 'చిన్న పనుల్లో సాయం చేసి // by helping with small jobs'),
    ],
    order: ['మన "అమ్మ" పాట వరుసలను క్రమంలో పెట్టు // Put the lines of our Amma rhyme in order', [
      ['అమ్మ అంటే కమ్మని మాట=a sweet word', 'అమ్మ ఒడిలో చల్లని పాట=a cool song in her lap', 'అమ్మ నవ్వితే వెన్నెల తోట=a moonlit garden', 'అమ్మకు ప్రేమే మనసంతా=her heart is full of love'],
      ['చందమామ రావే=come, moon', 'జాబిల్లి రావే=come, dear moon', 'కొండెక్కి రావే=climb the hill and come', 'గోగుపూలు తేవే=bring flowers'],
    ]],
    mcq: [
      ['అమ్మను "మొదటి గురువు" అని ఎందుకు అంటారు? // Why is mother called our first teacher?', 'మొదట మాటలు నేర్పుతుంది=she teaches us our first words', ['బడికి వెళ్తుంది=she goes to school', 'పరీక్ష పెడుతుంది=she gives exams', 'పుస్తకం రాస్తుంది=she writes books'], 'చిన్నప్పుడు మనకు "అమ్మ" అనే మాట ఎవరు నేర్పారు? // Who taught us our first word?', 'అమ్మ మనకు మొదట మాటలు, మంచి పనులు నేర్పుతుంది. // Mother first teaches us words and good ways.'],
      ['మనకు జబ్బు చేస్తే అమ్మ ఏం చేస్తుంది? // What does mother do when we are ill?', 'జాగ్రత్తగా చూసుకుంటుంది=takes care of us', ['కోపగిస్తుంది=gets angry', 'వెళ్ళిపోతుంది=goes away', 'ఆడుకుంటుంది=plays'], 'అమ్మ ప్రేమ గుర్తు చేసుకో. // Remember mother\'s love.', 'అమ్మ ప్రేమతో మనల్ని చూసుకుంటుంది. // Mother lovingly looks after us.'],
      ['జోల పాట ఎప్పుడు పాడతారు? // When is a lullaby sung?', 'పిల్లలను నిద్రపుచ్చేటప్పుడు=to put a child to sleep', ['పరుగు పందెంలో=at a race', 'పండుగ వంటలో=while cooking', 'బడి గంటకు=at the school bell'], 'జో జో అని … // "Jo jo" …', 'జోల పాటతో పిల్లలను నిద్రపుచ్చుతారు. // Lullabies put children to sleep.'],
      ['"అమ్మ" కు మరో పదం? // Another word for అమ్మ?', 'తల్లి', ['తండ్రి', 'అక్క', 'తాత'], '"తోటతల్లి" పాఠం పేరులో ఉంది. // It is in the lesson name తోటతల్లి.', 'అమ్మ = తల్లి = మాత. // అమ్మ = తల్లి = మాత (mother).'],
      ['అమ్మకు సంతోషం కలిగించే పని? // What makes mother happy?', 'మాట వినడం, సాయం చేయడం=listening and helping', ['అల్లరి చేయడం=being naughty', 'అబద్ధం చెప్పడం=lying', 'అన్నం పారబోయడం=wasting food'], 'మంచి పిల్లలు ఏం చేస్తారు? // What do good children do?', 'మాట విని సాయం చేస్తే అమ్మ సంతోషిస్తుంది. // Listening and helping makes mother happy.'],
    ],
  }),
  obj({
    id: 'ts3.te.amma.family', title: 'కుటుంబ బంధువులు // Family words', hint: 'నీ కుటుంబంలో ఎవరిని ఏమని పిలుస్తావో గుర్తు చేసుకో. // Think what you call each family member.',
    intro: [
      P('మన కుటుంబంలో ఎంతో మంది ఉంటారు: అమ్మ, నాన్న, అక్క, అన్న, చెల్లి, తమ్ముడు, తాత, అవ్వ / నానమ్మ / అమ్మమ్మ. // Family words: mother, father, elder sister, elder brother, younger sister, younger brother, grandfather, grandmother.'),
      PH('👵', 'అమ్మమ్మ = అమ్మకు అమ్మ; నానమ్మ = నాన్నకు అమ్మ. // అమ్మమ్మ is mother\'s mother; నానమ్మ is father\'s mother.'),
      TIP('పెద్దవాళ్ళను "మీరు", "గారు" అని గౌరవంగా పిలుద్దాం. // Address elders respectfully with "మీరు" and "గారు".'),
      KEYS('అక్క = elder sister // elder sister', 'చెల్లి = younger sister // younger sister', 'తమ్ముడు = younger brother // younger brother'),
    ],
    ex: [
      EX('నాన్నకు అమ్మను ఏమని పిలుస్తాం? // What do we call father\'s mother?', ['నాన్న + అమ్మ. // father + mother.'], 'నానమ్మ // paternal grandmother'),
      EX('నీకంటే చిన్నదైన అమ్మాయి (నీ తోబుట్టువు)? // Your younger sister is called?', ['పెద్దదైతే అక్క; చిన్నదైతే … // Elder is అక్క; younger is …'], 'చెల్లి // younger sister'),
    ],
    match: ['బంధువును దాని అర్థంతో కలుపు // Match each family word to its meaning', [
      ['అమ్మ', 'mother'], ['నాన్న', 'father'], ['అక్క', 'elder sister'], ['తమ్ముడు', 'younger brother'], ['తాత', 'grandfather'], ['చెల్లి', 'younger sister'], ['అన్న', 'elder brother'],
    ]],
    mcq: [
      ['అమ్మకు అమ్మను ఏమంటాం? // Mother\'s mother is called?', 'అమ్మమ్మ', ['నానమ్మ', 'అత్త', 'పిన్ని'], 'అమ్మ + అమ్మ. // mother + mother.', 'అమ్మ అమ్మ = అమ్మమ్మ. // అమ్మమ్మ is mother\'s mother.'],
      ['నీకంటే పెద్ద అబ్బాయి (తోబుట్టువు)? // Your elder brother is?', 'అన్న', ['తమ్ముడు', 'తాత', 'మామ'], 'పెద్దవాడు. // He is older.', 'పెద్ద సోదరుడు = అన్న. // అన్న is elder brother.'],
      ['తాత అంటే? // What does తాత mean?', 'grandfather', ['uncle', 'brother', 'friend'], 'అమ్మమ్మ / నానమ్మ భర్త. // Grandmother\'s husband.', 'తాత = grandfather. // తాత means grandfather.'],
      ['పెద్దలను ఎలా పిలవాలి? // How should we address elders?', 'గౌరవంగా=respectfully', ['గట్టిగా అరిచి=by shouting', 'పేరు పెట్టి వెక్కిరిస్తూ=by teasing', 'పిలవకుండా=never'], '"మీరు", "గారు" వాడు. // Use "మీరు", "గారు".', 'పెద్దలను గౌరవంగా పిలవాలి. // Speak to elders respectfully.'],
      ['నీకంటే చిన్న అబ్బాయి (తోబుట్టువు)? // Your younger brother is?', 'తమ్ముడు', ['అన్న', 'అక్క', 'నాన్న'], 'చిన్నవాడు. // He is younger.', 'చిన్న సోదరుడు = తమ్ముడు. // తమ్ముడు is younger brother.'],
    ],
  }),
  obj({
    id: 'ts3.te.amma.rhyme', title: 'ప్రాస పదాలు // Rhyming words', hint: 'పదాల చివరి భాగం ఒకేలా వినిపిస్తుందా? // Do the word endings sound the same?',
    intro: [
      P('పదాల చివర ఒకేలా వినిపిస్తే అవి ప్రాస పదాలు: అమ్మ — కమ్మ — బొమ్మ — రెమ్మ; పాట — మాట — తోట — ఆట. పాటలకు ప్రాస అందం తెస్తుంది. // Words that end alike rhyme: అమ్మ – కమ్మ – బొమ్మ; పాట – మాట – తోట. Rhymes make songs sweet.'),
      PH('🎵', 'ప్రాస ఉంటే పాట పాడటం సులువు. // Rhymes make songs easy to sing.'),
      POEM(['బొమ్మ బొమ్మ రంగుల బొమ్మ,', 'కొమ్మ కొమ్మ పచ్చని కొమ్మ,', 'అమ్మ అమ్మ ముద్దుల అమ్మ!'], 'Doll, colourful doll; branch, green branch; mother, dear mother! (our own rhyme)'),
      TIP('పదం చివరి రెండు అక్షరాలు చూడు: అ-మ్మ, బొ-మ్మ — "మ్మ" ఒకటే! // Look at the last part: అ-మ్మ, బొ-మ్మ — both end in మ్మ!'),
    ],
    ex: [
      EX('"పాట" కు ప్రాస పదం ఏది: మాట / పువ్వు? // Which rhymes with పాట: మాట or పువ్వు?', ['పా-ట, మా-ట: చివర "ట". // Both end in ట.'], 'మాట // మాట (word)'),
      EX('"అమ్మ" తో ప్రాస కలిసే రెండు పదాలు చెప్పు. // Say two words that rhyme with అమ్మ.', ['చివర "మ్మ" వచ్చే పదాలు వెతుకు. // Find words ending in మ్మ.'], 'బొమ్మ, కొమ్మ // బొమ్మ (doll), కొమ్మ (branch)'),
    ],
    tap: ['"అమ్మ" తో ప్రాస కలిసే పదాలను ఎంచుకో // Tap the words that rhyme with అమ్మ', [
      ['బొమ్మ=doll', true], ['కొమ్మ=branch', true], ['రెమ్మ=twig', true], ['కమ్మ=tasty', true], ['చెమ్మ=dampness', true],
      ['పాట=song', false], ['చెట్టు=tree', false], ['పువ్వు=flower', false], ['నీరు=water', false],
    ], '"మ్మ" తో ముగిసే పదాలు అమ్మకు ప్రాస. // Words ending in మ్మ rhyme with అమ్మ.'],
    mcq: [
      ['"తోట" కు ప్రాస పదం? // Which rhymes with తోట (garden)?', 'ఆట=game', ['పువ్వు=flower', 'చెట్టు=tree', 'నీరు=water'], 'చివర "ట". // Ends in ట.', 'తో-ట, ఆ-ట: ప్రాస కలిసింది. // తోట and ఆట rhyme.'],
      ['"వాన" కు ప్రాస పదం? // Which rhymes with వాన (rain)?', 'కోన=valley', ['మబ్బు=cloud', 'గాలి=wind', 'ఎండ=sun'], 'చివర "న". // Ends in న.', 'వా-న, కో-న. // వాన and కోన rhyme.'],
      ['"పిల్లి" కి ప్రాస పదం? // Which rhymes with పిల్లి (cat)?', 'మల్లి=jasmine', ['కుక్క=dog', 'ఆవు=cow', 'కోడి=hen'], 'చివర "ల్లి". // Ends in ల్లి.', 'పి-ల్లి, మ-ల్లి. // పిల్లి and మల్లి rhyme.'],
      ['"చేప" కు ప్రాస పదం? // Which rhymes with చేప (fish)?', 'రేపు=tomorrow', ['నీరు=water', 'పడవ=boat', 'వల=net'], 'చివర "ప" లాంటి ధ్వని. // Ends with a "pa/pu" sound.', 'చే-ప, రే-పు — చివర ధ్వని దగ్గరగా ఉంది. // చేప and రేపు sound alike at the end.'],
      ['"కొమ్మ" కు ప్రాస పదం? // Which rhymes with కొమ్మ (branch)?', 'బొమ్మ=doll', ['కాయ=raw fruit', 'ఆకు=leaf', 'వేరు=root'], 'చివర "మ్మ". // Ends in మ్మ.', 'కొమ్మ, బొమ్మ — ప్రాస. // కొమ్మ and బొమ్మ rhyme.'],
      ['"మాట" కు ప్రాస పదం? // Which rhymes with మాట (word)?', 'బాట=path', ['మనిషి=person', 'మబ్బు=cloud', 'మేక=goat'], 'మొదటి అక్షరం కాదు, చివరిది చూడు. // Look at the end, not the start.', 'మా-ట, బా-ట. // మాట and బాట rhyme.'],
    ],
  }),
]);

// ============================================================ 3*. దయ (story — kindness)
const ch3s = unit('3*', 'ch3s', 'దయ // Kindness', [
  obj({
    id: 'ts3.te.daya.story', title: 'దయ కథ // A story of kindness', hint: 'కథలో ఎవరు ఎవరికి సాయం చేశారో చూడు. // See who helped whom in the story.',
    intro: [
      P('దయ అంటే ఇతరుల బాధను అర్థం చేసుకొని సాయం చేయడం — మనుషులకే కాదు, పశువులకు, పక్షులకు కూడా. // Kindness means understanding others\' pain and helping — people, animals and birds alike.'),
      PH('🐦', 'దాహంతో ఉన్న పక్షికి నీళ్ళు పెడదాం. // Let us give water to a thirsty bird.'),
      P('మా కథ: ఎండాకాలంలో సీత బడి నుండి వస్తుంటే, ఒక పిచ్చుక దాహంతో అల్లాడుతూ కనిపించింది. సీత ఇంటికి వెళ్ళి ఒక మట్టి గిన్నెలో నీళ్ళు, కొన్ని గింజలు పెట్టింది. మరుసటి రోజు ఆ పిచ్చుక తన స్నేహితులతో వచ్చి కిచకిచలాడింది. సీత మనసు ఆనందంతో నిండిపోయింది. // Our story: on a hot day Sita saw a thirsty sparrow, put out water and grains in a clay bowl; next day the sparrow came back with friends chirping happily, and Sita was filled with joy.'),
      TIP('చిన్న సాయమైనా పెద్ద సంతోషం ఇస్తుంది. // Even a small help brings big joy.'),
    ],
    ex: [
      EX('సీత పిచ్చుకకు ఏమి పెట్టింది? // What did Sita give the sparrow?', ['పిచ్చుకకు దాహం వేసింది. // The sparrow was thirsty.', 'గిన్నెలో నీళ్ళు, గింజలు పెట్టింది. // She put water and grains in a bowl.'], 'నీళ్ళు, గింజలు // water and grains'),
      EX('పిచ్చుక మరుసటి రోజు ఎవరితో వచ్చింది? // Whom did the sparrow come with the next day?', ['కథ చివరి భాగం గుర్తు చేసుకో. // Recall the end of the story.'], 'స్నేహితులతో // with its friends'),
    ],
    order: ['సీత కథను వరుసలో పెట్టు // Put Sita\'s story in order', [
      ['సీతకు దాహంతో ఉన్న పిచ్చుక కనిపించింది=Sita saw a thirsty sparrow', 'సీత గిన్నెలో నీళ్ళు పెట్టింది=Sita put out water', 'పిచ్చుక నీళ్ళు తాగింది=the sparrow drank', 'పిచ్చుక స్నేహితులతో వచ్చింది=the sparrow came with friends'],
      ['ఎండాకాలం వచ్చింది=summer came', 'పిచ్చుకకు దాహం వేసింది=the sparrow got thirsty', 'సీత సాయం చేసింది=Sita helped', 'సీత సంతోషించింది=Sita was happy'],
    ]],
    mcq: [
      ['కథ ఏ కాలంలో జరిగింది? // In which season did the story happen?', 'ఎండాకాలం=summer', ['చలికాలం=winter', 'వానాకాలం=rainy season', 'వసంతకాలం=spring'], 'పిచ్చుకకు దాహం వేసింది. // The bird was thirsty.', 'ఎండాకాలంలో పక్షులకు దాహం ఎక్కువ. // Birds are thirsty in summer.'],
      ['దయ అంటే ఏమిటి? // What is kindness?', 'ఇతరులకు సాయం చేయడం=helping others', ['కోపగించడం=getting angry', 'కొట్టడం=hitting', 'వెక్కిరించడం=teasing'], 'సీత ఏం చేసింది? // What did Sita do?', 'బాధలో ఉన్నవారికి సాయం చేయడమే దయ. // Helping those in need is kindness.'],
      ['సీత నీళ్ళు ఏ గిన్నెలో పెట్టింది? // What kind of bowl did Sita use?', 'మట్టి గిన్నె=clay bowl', ['బంగారు గిన్నె=gold bowl', 'గాజు గ్లాసు=glass', 'ఆకు=leaf'], 'కుమ్మరి చేసేది. // Made by a potter.', 'మట్టి గిన్నెలో నీళ్ళు చల్లగా ఉంటాయి. // Water stays cool in a clay bowl.'],
      ['పిచ్చుక సంతోషంగా ఏం చేసింది? // What did the happy sparrow do?', 'కిచకిచలాడింది=chirped', ['మొరిగింది=barked', 'గర్జించింది=roared', 'ఏడ్చింది=cried'], 'పక్షి శబ్దం. // A bird sound.', 'పిచ్చుక కిచకిచ అంటుంది. // A sparrow chirps.'],
      ['ఈ కథ నేర్పే నీతి? // What does this story teach?', 'అన్ని ప్రాణుల మీద దయ చూపాలి=be kind to all living beings', ['పక్షులను పట్టుకోవాలి=catch birds', 'నీళ్ళు దాచుకోవాలి, ఎవరికీ ఇవ్వకూడదు=keep water to yourself', 'ఎండలో ఆడాలి=play in the sun'], 'సీత లాగా ఉండాలి. // Be like Sita.', 'అన్ని జీవుల మీద దయ చూపాలి. // Show kindness to every living being.'],
    ],
  }),
  obj({
    id: 'ts3.te.daya.acts', title: 'దయగల పనులు // Kind deeds', hint: 'ఆ పని వల్ల ఎవరికైనా సంతోషం కలుగుతుందా? // Does the act make someone happy?',
    intro: [
      P('రోజూ మనం చేయగల దయగల పనులు: ఆకలితో ఉన్న కుక్కకు అన్నం పెట్టడం, పడిపోయిన స్నేహితుడిని లేపడం, పెద్దవాళ్ళకు రోడ్డు దాటడంలో సాయం, మొక్కలకు నీళ్ళు పోయడం. // Kind deeds: feed a hungry dog, help up a fallen friend, help elders cross the road, water plants.'),
      PH('🐶', 'ఆకలితో ఉన్న కుక్కకు అన్నం పెడదాం. // Feed a hungry dog.'),
      TIP('ఎవరినీ కొట్టకూడదు, వెక్కిరించకూడదు — పశువులను, పక్షులను కూడా. // Never hit or tease anyone — not even animals or birds.'),
      KEYS('దయ = kindness // kindness', 'జాలి = pity, feeling for others // pity', 'సాయం = help // help'),
    ],
    ex: [
      EX('స్నేహితుడు ఆటలో పడిపోయాడు. నువ్వేం చేస్తావు? // A friend fell while playing. What will you do?', ['నవ్వకూడదు. // Do not laugh.', 'చేయి అందించి లేపాలి. // Give a hand and help up.'], 'లేపి సాయం చేస్తాను // help him up'),
      EX('పిల్లిని రాయితో కొట్టడం సరైనదా? // Is it right to hit a cat with a stone?', ['పిల్లికి నొప్పి కలుగుతుంది. // The cat gets hurt.'], 'కాదు // no'),
    ],
    tap: ['దయగల పనులను ఎంచుకో // Tap the kind deeds', [
      ['కుక్కకు అన్నం పెట్టడం=feeding a dog', true], ['మొక్కలకు నీళ్ళు పోయడం=watering plants', true], ['తాతకు రోడ్డు దాటడంలో సాయం=helping grandpa cross', true], ['స్నేహితుడితో టిఫిన్ పంచుకోవడం=sharing tiffin', true],
      ['పిల్లిని కొట్టడం=hitting a cat', false], ['పక్షి గూడు పాడుచేయడం=breaking a nest', false], ['స్నేహితుడిని వెక్కిరించడం=teasing a friend', false], ['చీమలను నలపడం=crushing ants', false],
    ], 'సాయం, పంచుకోవడం దయ; కొట్టడం, వెక్కిరించడం దయ కాదు. // Helping and sharing are kind; hitting and teasing are not.'],
    mcq: [
      ['స్నేహితుడు టిఫిన్ మరచిపోయాడు. ఏం చేయాలి? // A friend forgot his tiffin. What should you do?', 'నా టిఫిన్ పంచుకోవాలి=share mine', ['నవ్వాలి=laugh', 'పట్టించుకోకూడదు=ignore', 'టీచర్‌కు ఫిర్యాదు చేయాలి=complain'], 'నువ్వైతే ఎలా అనిపిస్తుంది? // How would you feel?', 'పంచుకోవడం దయ. // Sharing is kindness.'],
      ['"జాలి" అంటే? // What is జాలి?', 'ఇతరుల బాధకు మనసు కరగడం=feeling for others\' pain', ['కోపం=anger', 'ఆట=game', 'భయం=fear'], 'దయకు దగ్గరి పదం. // A word close to kindness.', 'జాలి అంటే ఇతరుల బాధకు మనసు కరగడం. // జాలి means pity, feeling for others.'],
      ['వీధి కుక్క గాయపడింది. ఏం చేయాలి? // A street dog is hurt. What should we do?', 'పెద్దలకు చెప్పి సాయం చేయాలి=tell an elder and help', ['రాళ్ళు వేయాలి=throw stones', 'దూరంగా తరమాలి=chase it', 'నవ్వాలి=laugh'], 'జాగ్రత్తగా, పెద్దల సాయంతో. // Safely, with an adult.', 'పెద్దల సాయంతో గాయపడిన జంతువుకు సాయం చేయాలి. // Help a hurt animal with an adult\'s help.'],
      ['"దయ" వ్యతిరేక భావం? // Which is the opposite of kindness?', 'క్రూరత్వం=cruelty', ['సాయం=help', 'ప్రేమ=love', 'జాలి=pity'], 'ఇతరులను బాధపెట్టడం. // Hurting others.', 'దయ × క్రూరత్వం. // kindness × cruelty.'],
      ['ఎండాకాలంలో పక్షుల కోసం ఏం పెట్టవచ్చు? // What can we keep out for birds in summer?', 'నీటి గిన్నె=a bowl of water', ['వల=a net', 'పంజరం=a cage', 'రాళ్ళు=stones'], 'పక్షులకు దాహం వేస్తుంది. // Birds get thirsty.', 'నీటి గిన్నె పెడితే పక్షులు దాహం తీర్చుకుంటాయి. // A water bowl helps thirsty birds.'],
    ],
  }),
  obj({
    id: 'ts3.te.daya.questions', title: 'ప్రశ్న పదాలు // Question words', hint: 'జవాబు ఒక మనిషా, స్థలమా, సమయమా, కారణమా? // Is the answer a person, a place, a time or a reason?',
    intro: [
      P('ప్రశ్న అడగడానికి ఈ పదాలు వాడతాం: ఎవరు (who), ఏమి (what), ఎక్కడ (where), ఎప్పుడు (when), ఎందుకు (why), ఎలా (how). ప్రశ్న చివర "?" గుర్తు పెడతాం. // Question words: who, what, where, when, why, how. A question ends with "?".'),
      PH('❓', 'ప్రశ్నార్థకం "?" — ప్రశ్న చివర వస్తుంది. // The question mark comes at the end of a question.'),
      P('ఉదా: పిచ్చుకకు ఎవరు సాయం చేశారు? — సీత. పిచ్చుక ఎందుకు అల్లాడింది? — దాహం వల్ల. // e.g. Who helped the sparrow? — Sita. Why was it struggling? — Thirst.'),
      TIP('జవాబు మనిషి అయితే "ఎవరు", స్థలం అయితే "ఎక్కడ", సమయం అయితే "ఎప్పుడు". // Person → ఎవరు, place → ఎక్కడ, time → ఎప్పుడు.'),
    ],
    ex: [
      EX('"___ బడికి వెళ్ళావు?" — జవాబు: ఉదయం. ఏ ప్రశ్న పదం? // Answer is "in the morning". Which question word?', ['జవాబు ఒక సమయం. // The answer is a time.'], 'ఎప్పుడు // when'),
      EX('"నువ్వు ___ ఉంటావు?" — జవాబు: హైదరాబాదులో. // Answer is "in Hyderabad". Which word?', ['జవాబు ఒక స్థలం. // The answer is a place.'], 'ఎక్కడ // where'),
    ],
    match: ['ప్రశ్న పదాన్ని దాని ఇంగ్లీష్ అర్థంతో కలుపు // Match each question word to its meaning', [
      ['ఎవరు', 'who'], ['ఏమి', 'what'], ['ఎక్కడ', 'where'], ['ఎప్పుడు', 'when'], ['ఎందుకు', 'why'], ['ఎలా', 'how'],
    ]],
    mcq: [
      ['"పిచ్చుకకు ___ నీళ్ళు పెట్టారు?" — జవాబు: సీత // Answer: Sita. Which word fits?', 'ఎవరు', ['ఎక్కడ', 'ఎప్పుడు', 'ఎలా'], 'జవాబు ఒక మనిషి. // The answer is a person.', 'మనిషి గురించి అడగడానికి "ఎవరు". // "Who" asks about a person.'],
      ['"పిచ్చుక ___ అల్లాడింది?" — జవాబు: దాహం వల్ల // Answer: because of thirst', 'ఎందుకు', ['ఎవరు', 'ఎక్కడ', 'ఏమి'], 'జవాబు ఒక కారణం. // The answer is a reason.', 'కారణం అడగడానికి "ఎందుకు". // "Why" asks for a reason.'],
      ['"నువ్వు ___ తిన్నావు?" — జవాబు: ఇడ్లీ // Answer: idli', 'ఏమి', ['ఎవరు', 'ఎప్పుడు', 'ఎక్కడ'], 'జవాబు ఒక వస్తువు. // The answer is a thing.', 'వస్తువు గురించి "ఏమి". // "What" asks about a thing.'],
      ['"పక్షి గూడు ___ ఉంది?" — జవాబు: చెట్టు మీద // Answer: on the tree', 'ఎక్కడ', ['ఎందుకు', 'ఎవరు', 'ఎప్పుడు'], 'జవాబు ఒక స్థలం. // The answer is a place.', 'స్థలం అడగడానికి "ఎక్కడ". // "Where" asks for a place.'],
      ['"నువ్వు బడికి ___ వెళ్తావు?" — జవాబు: సైకిల్ మీద // Answer: by cycle', 'ఎలా', ['ఎవరు', 'ఏమి', 'ఎందుకు'], 'జవాబు ఒక పద్ధతి. // The answer is a way.', 'పద్ధతి అడగడానికి "ఎలా". // "How" asks for the way.'],
      ['ప్రశ్న చివర ఏ గుర్తు పెడతాం? // Which mark ends a question?', '?', ['.', '!', ','], 'ప్రశ్నార్థకం. // The question mark.', 'ప్రశ్న చివర "?" వస్తుంది. // A question ends with "?".'],
    ],
  }),
]);

// ============================================================ 4. మన పండుగలు (dialogue — culture)
const ch4 = unit(4, 'ch4', 'మన పండుగలు // Our festivals', [
  obj({
    id: 'ts3.te.pandaga.festivals', title: 'పండుగలు — గుర్తులు // Festivals and their signs', hint: 'ఆ పండుగలో ఏం చేస్తారో గుర్తు చేసుకో. // Recall what people do in that festival.',
    intro: [
      P('మన దేశంలో, మన తెలంగాణలో ఎన్నో పండుగలు జరుపుకుంటాం. ఉగాది (కొత్త సంవత్సరం, ఉగాది పచ్చడి), సంక్రాంతి (గాలిపటాలు, ముగ్గులు), బతుకమ్మ (పూల పండుగ), బోనాలు, దసరా, దీపావళి (దీపాలు), రంజాన్, క్రిస్మస్. // We celebrate many festivals: Ugadi, Sankranti (kites, rangoli), Bathukamma (flowers), Bonalu, Dasara, Deepavali (lamps), Ramzan, Christmas.'),
      PH('🌸', 'బతుకమ్మ — తెలంగాణ పూల పండుగ. // Bathukamma — Telangana\'s flower festival.'),
      P('పండుగ అంటే అందరూ కలిసి సంతోషంగా ఉండటం. అన్ని మతాల పండుగలను గౌరవిద్దాం, స్నేహితులతో కలిసి జరుపుకుందాం. // Festivals bring everyone together. Respect and enjoy all festivals with friends.'),
      TIP('పండుగ రోజు "పండుగ శుభాకాంక్షలు!" అని చెప్పు. // Say "Festival greetings!" on festival day.'),
      KEYS('పండుగ = festival // festival', 'ముగ్గు = rangoli // rangoli', 'దీపం = lamp // lamp'),
    ],
    ex: [
      EX('గాలిపటాలు ఎగరేసే పండుగ? // Which festival has kite flying?', ['జనవరిలో వస్తుంది. // It comes in January.', 'ముగ్గులు, గాలిపటాలు. // Rangoli and kites.'], 'సంక్రాంతి // Sankranti'),
      EX('దీపాల పండుగ? // The festival of lamps?', ['"దీప + ఆవళి" = దీపాల వరుస. // Deepa + avali = a row of lamps.'], 'దీపావళి // Deepavali'),
    ],
    pic: [
      ['గాలిపటాల పండుగకు గుర్తు ఏది? // Which is the sign of the kite festival (Sankranti)?', ['🪁', 'గాలిపటం=kite'], [['🪔', 'దీపం=lamp'], ['🌸', 'పూలు=flowers']], 'సంక్రాంతి ఆకాశం రంగులమయం. // The Sankranti sky is full of colour.', 'సంక్రాంతికి గాలిపటాలు 🪁. // Kites for Sankranti.'],
      ['దీపావళికి గుర్తు ఏది? // Which is the sign of Deepavali?', ['🪔', 'దీపం=lamp'], [['🪁', 'గాలిపటం=kite'], ['🌙', 'చంద్రవంక=crescent moon']], 'వరుసగా వెలిగిస్తారు. // Lit in rows.', 'దీపావళికి దీపాలు 🪔. // Lamps for Deepavali.'],
      ['బతుకమ్మకు గుర్తు ఏది? // Which is the sign of Bathukamma?', ['🌸', 'పూలు=flowers'], [['🪔', 'దీపం=lamp'], ['⭐', 'నక్షత్రం=star']], 'తంగేడు, గునుగు పూలు పేరుస్తారు. // Flowers are stacked in layers.', 'బతుకమ్మ పూల పండుగ 🌸. // Bathukamma is a flower festival.'],
      ['రంజాన్‌కు గుర్తు ఏది? // Which is a sign of Ramzan?', ['🌙', 'చంద్రవంక=crescent moon'], [['🪁', 'గాలిపటం=kite'], ['🌸', 'పూలు=flowers']], 'నెలవంక చూసి పండుగ చేస్తారు. // Celebrated on seeing the new moon.', 'రంజాన్‌కు నెలవంక 🌙 గుర్తు. // The crescent moon marks Ramzan.'],
      ['క్రిస్మస్‌కు గుర్తు ఏది? // Which is a sign of Christmas?', ['⭐', 'నక్షత్రం=star'], [['🪔', 'దీపం=lamp'], ['🪁', 'గాలిపటం=kite']], 'ఇంటి ముందు వేలాడదీస్తారు. // Hung in front of homes.', 'క్రిస్మస్‌కు నక్షత్రం ⭐ పెడతారు. // A star is hung for Christmas.'],
      ['దసరాకు బహుమతిగా ఇచ్చే ఆకులు ఏ చెట్టువి? // Whose leaves are shared at Dasara?', ['🌳', 'జమ్మి చెట్టు=Jammi tree'], [['🌴', 'కొబ్బరి చెట్టు=coconut tree'], ['🌱', 'మొలక=sprout']], 'తెలంగాణ రాష్ట్ర వృక్షం. // Telangana\'s state tree.', 'దసరాకు జమ్మి ఆకులు పంచుకుంటారు. // Jammi leaves are shared at Dasara.'],
    ],
    match: ['పండుగను దాని ప్రత్యేకతతో కలుపు // Match each festival to what is special about it', [
      ['సంక్రాంతి=Sankranti', 'గాలిపటాలు=kites'], ['దీపావళి=Deepavali', 'దీపాలు=lamps'], ['బతుకమ్మ=Bathukamma', 'పూలు=flowers'], ['ఉగాది=Ugadi', 'పచ్చడి=Ugadi chutney'], ['రంజాన్=Ramzan', 'సేమియా=sheer khurma'], ['క్రిస్మస్=Christmas', 'నక్షత్రం=star'],
    ]],
  }),
  obj({
    id: 'ts3.te.pandaga.dialogue', title: 'సంభాషణ — మాట్లాడుకుందాం // Dialogue: talking together', hint: 'ఎవరు మాట్లాడుతున్నారో, తర్వాత ఏం జవాబు వస్తుందో ఆలోచించు. // Think who is speaking and what reply comes next.',
    intro: [
      P('"మన పండుగలు" ఒక సంభాషణ — ఇద్దరు, ముగ్గురు ఒకరితో ఒకరు మాట్లాడుకోవడం. ఒకరు అడుగుతారు, మరొకరు జవాబిస్తారు. // "Our festivals" is a dialogue — people taking turns: one asks, another answers.'),
      PH('🗣️', 'సంభాషణలో వంతులవారీగా మాట్లాడతాం. // In a dialogue we take turns to speak.'),
      P('మా చిన్న సంభాషణ:\nరవి: "సనా, రంజాన్‌కు మీ ఇంట్లో ఏం చేస్తారు?"\nసనా: "సేమియా చేస్తాం! నువ్వు మా ఇంటికి రా."\nరవి: "తప్పకుండా! దీపావళికి నువ్వు మా ఇంటికి రావాలి." // Our dialogue: Ravi asks Sana about Ramzan; Sana invites him for sheer khurma; Ravi invites her for Deepavali.'),
      TIP('మాట్లాడేటప్పుడు ఎదుటివాళ్ళు చెప్పేది పూర్తిగా విని, తర్వాత మాట్లాడు. // Listen fully before you reply.'),
    ],
    ex: [
      EX('మా సంభాషణలో సనా రవిని ఎక్కడికి పిలిచింది? // Where did Sana invite Ravi?', ['సనా: "నువ్వు మా ఇంటికి రా." // Sana: "Come to our home."'], 'తమ ఇంటికి, రంజాన్‌కు // to her home for Ramzan'),
      EX('ఎవరైనా "పండుగ శుభాకాంక్షలు!" అంటే మనం ఏమంటాం? // If someone says "Happy festival!", what do we reply?', ['మర్యాదగా తిరిగి చెప్పాలి. // Reply politely.'], 'ధన్యవాదాలు, మీకు కూడా! // Thank you, same to you!'),
    ],
    order: ['సంభాషణను సరైన వరుసలో పెట్టు // Put the dialogue in order', [
      ['రవి: సనా, రంజాన్‌కు ఏం చేస్తారు?=Ravi asks', 'సనా: సేమియా చేస్తాం, రా!=Sana invites', 'రవి: తప్పకుండా వస్తాను!=Ravi agrees'],
      ['మీనా: నమస్తే అత్తయ్యా!=Meena greets', 'అత్తయ్య: నమస్తే, రా రా!=Aunt welcomes', 'మీనా: బతుకమ్మ పూలు తెచ్చాను.=Meena brings flowers', 'అత్తయ్య: ఎంత అందంగా ఉన్నాయి!=Aunt admires them'],
      ['టీచర్: నీకు ఇష్టమైన పండుగ ఏది?=Teacher asks', 'కిరణ్: సంక్రాంతి, టీచర్.=Kiran answers', 'టీచర్: ఎందుకు?=Teacher asks why', 'కిరణ్: గాలిపటాలు ఎగరేయవచ్చు!=Kiran explains'],
    ]],
    mcq: [
      ['ఎవరైనా మనల్ని పండుగకు పిలిస్తే ఏమనాలి? // If someone invites us to a festival, we say?', 'ధన్యవాదాలు, తప్పకుండా వస్తాను=thank you, I will come', ['రాను, పో=go away', 'ఏమీ అనకూడదు=say nothing', 'నవ్వి వెళ్ళిపోవాలి=laugh and leave'], 'మర్యాద మాట. // A polite reply.', 'పిలిచినవారికి ధన్యవాదాలు చెప్పాలి. // Thank the person who invites you.'],
      ['సంభాషణలో ఇద్దరూ ఒకేసారి మాట్లాడితే? // If both speak at once in a dialogue?', 'ఏమీ అర్థం కాదు=nothing is understood', ['బాగా అర్థమవుతుంది=it is clearer', 'పాట అవుతుంది=it becomes a song', 'త్వరగా అయిపోతుంది=it ends fast'], 'వంతులవారీగా మాట్లాడాలి. // Take turns.', 'ఒకరి తర్వాత ఒకరు మాట్లాడితేనే అర్థమవుతుంది. // Taking turns makes it clear.'],
      ['పెద్దలను కలిసినప్పుడు మొదట ఏమంటాం? // What do we say first when we meet elders?', 'నమస్తే=namaste', ['వెళ్ళు=go', 'ఆగు=stop', 'ఊరుకో=be quiet'], 'చేతులు జోడించి. // With folded hands.', 'పెద్దలకు నమస్తే చెప్పాలి. // Greet elders with namaste.'],
      ['"శుభాకాంక్షలు" అంటే? // What does శుభాకాంక్షలు mean?', 'మంచి కోరికలు=good wishes', ['ఆటలు=games', 'వంటలు=dishes', 'బహుమతులు=gifts'], 'పుట్టినరోజుకు, పండుగకు చెబుతాం. // Said on birthdays and festivals.', 'శుభాకాంక్షలు = good wishes. // శుభాకాంక్షలు means good wishes.'],
      ['మంచి సంభాషణలో మనం ఏం చేయాలి? // What should we do in a good conversation?', 'విని, తర్వాత మాట్లాడాలి=listen, then speak', ['మధ్యలో అరవాలి=shout in between', 'వేరే వైపు చూడాలి=look away', 'ఎప్పుడూ మనమే మాట్లాడాలి=always talk ourselves'], 'ఎదుటివారిని గౌరవించు. // Respect the other person.', 'విని మాట్లాడటం మంచి అలవాటు. // Listening before speaking is a good habit.'],
    ],
  }),
  obj({
    id: 'ts3.te.pandaga.food', title: 'పండుగ వంటలు, పనులు // Festival foods and customs', hint: 'ఇంట్లో ఆ పండుగకు ఏం చేస్తారో గుర్తు చేసుకో. // Recall what your family makes or does.',
    intro: [
      P('ప్రతి పండుగకు ప్రత్యేక వంటలు, పనులు ఉంటాయి: ఉగాదికి ఆరు రుచుల పచ్చడి, సంక్రాంతికి అరిసెలు, ముగ్గులు; బోనాలకు అమ్మవారికి బోనం; దీపావళికి దీపాలు; రంజాన్‌కు సేమియా; క్రిస్మస్‌కు కేకు. // Festival foods and customs: Ugadi chutney of six tastes, Sankranti ariselu and rangoli, Bonalu offering, Deepavali lamps, Ramzan sheer khurma, Christmas cake.'),
      PH('🪔', 'దీపం — చీకటిని పోగొట్టే వెలుగు. // A lamp — light that removes darkness.'),
      TIP('ఉగాది పచ్చడిలో ఆరు రుచులు: తీపి, పులుపు, చేదు, ఉప్పు, కారం, వగరు — జీవితంలో అన్నీ ఉంటాయని గుర్తు. // Ugadi chutney has six tastes — life has all kinds of moments.'),
      KEYS('తీపి = sweet // sweet', 'పులుపు = sour // sour', 'చేదు = bitter // bitter'),
    ],
    ex: [
      EX('ఉగాది పచ్చడిలో ఎన్ని రుచులు? // How many tastes in Ugadi chutney?', ['తీపి, పులుపు, చేదు, ఉప్పు, కారం, వగరు. // Count them.'], 'ఆరు // six'),
      EX('ఇంటి ముందు రంగుల ముగ్గులు ఏ పండుగకు ఎక్కువగా వేస్తారు? // Colourful rangoli is drawn most for which festival?', ['జనవరిలో, గొబ్బెమ్మలతో. // In January, with gobbemmalu.'], 'సంక్రాంతి // Sankranti'),
    ],
    mcq: [
      ['బెల్లం రుచి? // How does jaggery taste?', 'తీపి=sweet', ['చేదు=bitter', 'పులుపు=sour', 'కారం=spicy'], 'పిల్లలకు ఇష్టం. // Children love it.', 'బెల్లం తీపి. // Jaggery is sweet.'],
      ['వేప పువ్వు రుచి? // How does neem flower taste?', 'చేదు=bitter', ['తీపి=sweet', 'ఉప్పు=salty', 'పులుపు=sour'], 'ముఖం ముడుచుకుంటాం! // We make a face!', 'వేప పువ్వు చేదు. // Neem flower is bitter.'],
      ['చింతపండు రుచి? // How does tamarind taste?', 'పులుపు=sour', ['తీపి=sweet', 'చేదు=bitter', 'వగరు=astringent'], 'నోరు ఊరుతుంది. // It makes your mouth water.', 'చింతపండు పులుపు. // Tamarind is sour.'],
      ['క్రిస్మస్‌కు ఎక్కువగా చేసే తీపి? // A sweet popular at Christmas?', 'కేకు=cake', ['అరిసెలు=ariselu', 'పచ్చడి=chutney', 'బోనం=bonam'], 'కొవ్వొత్తులతో కోస్తారు. // Cut with candles around.', 'క్రిస్మస్‌కు కేకు. // Cake at Christmas.'],
      ['బోనాల పండుగ ఏ రాష్ట్రంలో ప్రత్యేకం? // Bonalu is special to which state?', 'తెలంగాణ=Telangana', ['కేరళ=Kerala', 'పంజాబ్=Punjab', 'గుజరాత్=Gujarat'], 'మన రాష్ట్రం. // Our state.', 'బోనాలు తెలంగాణ పండుగ. // Bonalu is a Telangana festival.'],
      ['మిరపకాయ రుచి? // How does chilli taste?', 'కారం=spicy', ['తీపి=sweet', 'పులుపు=sour', 'చేదు=bitter'], 'నాలుక మండుతుంది! // Your tongue burns!', 'మిరపకాయ కారం. // Chilli is spicy.'],
    ],
  }),
]);

// ============================================================ 5. కాకుల లెక్క (story — humour)
const ch5 = unit(5, 'ch5', 'కాకుల లెక్క // The crows\' count', [
  obj({
    id: 'ts3.te.kaki.story', title: 'తెలివైన జవాబు — కథ // A clever answer', hint: 'మంత్రి జవాబులో ఉన్న తెలివి ఏమిటో ఆలోచించు. // Think about what made the minister\'s answer clever.',
    intro: [
      P('"కాకుల లెక్క" ఒక హాస్య కథ. ఇలాంటి కథ మన జానపద కథల్లో ఎంతో కాలంగా చెప్పుకుంటున్నారు. // "The crows\' count" is a funny story; tales like it have been told in our folk tradition for a long time.'),
      PH('🐦‍⬛', 'కాకి — మన ఊళ్ళలో ఎక్కువగా కనిపించే పక్షి. // The crow — a bird we see everywhere.'),
      P('మా మాటల్లో: ఒక రాజు సరదాగా "మన ఊళ్ళో ఎన్ని కాకులు ఉన్నాయి?" అని అడిగాడు. తెలివైన మంత్రి "ఒక పెద్ద సంఖ్య" చెప్పి, "లెక్క వేయించండి. తక్కువ ఉంటే కొన్ని కాకులు చుట్టాల ఊరికి వెళ్ళాయి; ఎక్కువ ఉంటే చుట్టాల కాకులు వచ్చాయి!" అన్నాడు. రాజు పకపకా నవ్వాడు. // In our words: a king playfully asked how many crows lived in town. The clever minister named a big number and said: "If there are fewer, some went to visit relatives; if more, relatives came visiting!" The king laughed.'),
      TIP('కష్టమైన ప్రశ్నకు కూడా ప్రశాంతంగా ఆలోచిస్తే తెలివైన జవాబు దొరుకుతుంది. // Stay calm and think — even a hard question has a clever answer.'),
    ],
    ex: [
      EX('రాజు మంత్రిని ఏమి అడిగాడు? // What did the king ask the minister?', ['కథ మొదట్లో ప్రశ్న ఉంది. // The question is at the start.'], 'ఊళ్ళో ఎన్ని కాకులు ఉన్నాయి? // How many crows are in town?'),
      EX('లెక్కలో కాకులు తక్కువ ఉంటే మంత్రి ఏమన్నాడు? // If there were fewer crows, what did the minister say?', ['కాకులు ఎక్కడికో వెళ్ళాయి అన్నాడు. // He said they had gone somewhere.'], 'చుట్టాల ఊరికి వెళ్ళాయి // they went to visit relatives'),
    ],
    order: ['కథను వరుసలో పెట్టు // Put the story in order', [
      ['రాజు ప్రశ్న అడిగాడు=the king asked', 'మంత్రి ఒక సంఖ్య చెప్పాడు=the minister named a number', 'మంత్రి తెలివైన కారణం చెప్పాడు=the minister gave a clever reason', 'రాజు నవ్వాడు=the king laughed'],
      ['రాజుకు సరదా ఆలోచన వచ్చింది=the king had a funny idea', 'రాజు కాకుల లెక్క అడిగాడు=the king asked for a crow count', 'మంత్రి జవాబిచ్చాడు=the minister answered', 'అందరూ నవ్వారు=everyone laughed'],
    ]],
    mcq: [
      ['ఈ కథ ఏ రకం? // What kind of story is this?', 'హాస్య కథ=funny story', ['భయపెట్టే కథ=scary story', 'పాట=song', 'పద్యం=verse'], 'చివరికి రాజు నవ్వాడు. // The king laughed at the end.', 'ఇది హాస్య కథ — నవ్వు పుట్టిస్తుంది. // It is a funny story.'],
      ['కాకులు ఎక్కువ ఉంటే మంత్రి ఏం కారణం చెప్పాడు? // If there were more crows, what reason did the minister give?', 'చుట్టాల కాకులు వచ్చాయి=relative crows came visiting', ['కాకులు పుట్టాయి=new crows hatched', 'లెక్క తప్పు=the count was wrong', 'రాజు తప్పు=the king was wrong'], 'చుట్టాలు ఇంటికి వస్తే మనిషులు ఎక్కువ అవుతారు! // Visitors make a crowd!', 'ఎక్కువ ఉంటే చుట్టాల కాకులు వచ్చాయి అన్నాడు. // He said visiting relatives had come.'],
      ['మంత్రి ఎలాంటివాడు? // What kind of person was the minister?', 'తెలివైనవాడు=clever', ['సోమరి=lazy', 'పిరికివాడు=cowardly', 'కోపిష్టి=angry'], 'అతని జవాబు గుర్తు చేసుకో. // Remember his answer.', 'మంత్రి తెలివిగా జవాబిచ్చాడు. // The minister answered cleverly.'],
      ['రాజు ప్రశ్న ఎందుకు కష్టం? // Why was the king\'s question hard?', 'కాకులు ఎగురుతూ ఉంటాయి, లెక్కపెట్టలేం=crows keep flying, we cannot count them', ['కాకులు లేవు=there are no crows', 'కాకులు మాట్లాడతాయి=crows talk', 'కాకులు దాక్కుంటాయి నీళ్ళలో=crows hide in water'], 'కాకులు ఒకే చోట ఉంటాయా? // Do crows stay in one place?', 'ఎగిరే పక్షులను సరిగా లెక్కపెట్టడం కష్టం. // Flying birds are hard to count.'],
      ['కథ వినగానే మనకు ఏం వస్తుంది? // What does the story make us do?', 'నవ్వు=laugh', ['ఏడుపు=cry', 'భయం=fear', 'నిద్ర=sleep'], 'హాస్య కథ. // A funny story.', 'హాస్య కథ నవ్విస్తుంది. // A funny story makes us laugh.'],
    ],
  }),
  obj({
    id: 'ts3.te.kaki.numbers', title: 'సంఖ్యా పదాలు // Number words', hint: 'వేళ్ళ మీద లెక్కపెట్టు: ఒకటి, రెండు, మూడు … // Count on your fingers.',
    intro: [
      P('తెలుగు సంఖ్యా పదాలు: 1 ఒకటి, 2 రెండు, 3 మూడు, 4 నాలుగు, 5 ఐదు, 6 ఆరు, 7 ఏడు, 8 ఎనిమిది, 9 తొమ్మిది, 10 పది. ఇంకా 20 ఇరవై, 50 యాభై, 100 వంద, 1000 వెయ్యి. // Telugu number words from one to ten, and twenty, fifty, hundred, thousand.'),
      PH('🔢', 'ఒకటి, రెండు, మూడు … పది! // One, two, three … ten!'),
      POEM(['ఒకటి రెండు — ఒప్పుల కుప్ప,', 'మూడు నాలుగు — ముద్దుల పాప,', 'ఐదు ఆరు — ఆటల తోట,', 'ఏడు ఎనిమిది — ఎగిరే కాకి,', 'తొమ్మిది పది — తోటంతా సందడి!'], 'A counting chant from one to ten (our own rhyme; ఒప్పుల కుప్ప is a traditional children\'s game).'),
      TIP('ముందు పాటను చప్పట్లతో పాడు, తర్వాత సంఖ్యలు చెప్పు. // Sing the chant with claps, then say the numbers.'),
    ],
    ex: [
      EX('"ఏడు" అంటే ఏ సంఖ్య? // Which number is ఏడు?', ['ఒకటి నుండి లెక్కపెట్టు: … ఐదు, ఆరు, ఏడు. // Count up: … five, six, seven.'], '7 // 7 (seven)'),
      EX('మూడు కాకులు, ఇంకా రెండు కాకులు వచ్చాయి. మొత్తం ఎన్ని? // Three crows and two more. How many?', ['3 + 2 = 5. // 3 + 2 = 5.'], 'ఐదు // five'),
    ],
    match: ['అంకెను దాని తెలుగు పదంతో కలుపు // Match the number to its Telugu word', [
      ['1', 'ఒకటి=one'], ['3', 'మూడు=three'], ['5', 'ఐదు=five'], ['7', 'ఏడు=seven'], ['9', 'తొమ్మిది=nine'], ['10', 'పది=ten'], ['100', 'వంద=hundred'], ['4', 'నాలుగు=four'],
    ]],
    mcq: [
      ['"ఎనిమిది" అంటే? // ఎనిమిది is which number?', '8', ['6', '9', '3'], 'ఏడు తర్వాత. // After seven.', 'ఎనిమిది = 8. // ఎనిమిది = 8.'],
      ['రెండు + రెండు = ? // Two + two = ?', 'నాలుగు=four', ['మూడు=three', 'ఐదు=five', 'ఆరు=six'], 'వేళ్ళతో లెక్కించు. // Count on fingers.', '2 + 2 = 4, అంటే నాలుగు. // 2 + 2 = 4 (నాలుగు).'],
      ['ఐదు కాకుల్లో రెండు ఎగిరిపోయాయి. ఎన్ని మిగిలాయి? // Five crows, two flew away. How many left?', 'మూడు=three', ['రెండు=two', 'నాలుగు=four', 'ఏడు=seven'], '5 − 2. // 5 − 2.', '5 − 2 = 3, అంటే మూడు. // 5 − 2 = 3 (మూడు).'],
      ['"వంద" అంటే? // వంద is which number?', '100', ['10', '1000', '50'], 'పది పదులు. // Ten tens.', 'వంద = 100. // వంద = 100.'],
      ['ఆరు తర్వాత వచ్చే సంఖ్య? // Which number comes after six?', 'ఏడు=seven', ['ఐదు=five', 'ఎనిమిది=eight', 'తొమ్మిది=nine'], 'ఆరు, …? // Six, …?', 'ఆరు, ఏడు, ఎనిమిది. // six, seven, eight.'],
      ['"వెయ్యి" అంటే? // వెయ్యి is which number?', '1000', ['100', '10', '500'], 'పది వందలు. // Ten hundreds.', 'వెయ్యి = 1000. // వెయ్యి = 1000.'],
    ],
  }),
  obj({
    id: 'ts3.te.kaki.compare', title: 'ఎక్కువ — తక్కువ — సమానం // More, fewer, equal', hint: 'రెండు గుంపులను ఒక్కొక్కటిగా జత కట్టి చూడు. // Pair the two groups one by one.',
    intro: [
      P('రెండు గుంపులను పోల్చేటప్పుడు ఎక్కువ (more), తక్కువ (fewer / less), సమానం (equal) అనే పదాలు వాడతాం. // To compare two groups we say ఎక్కువ (more), తక్కువ (fewer) and సమానం (equal).'),
      PH('🐦', 'చెట్టు మీద 6 పక్షులు, తీగ మీద 4 — చెట్టు మీద ఎక్కువ. // 6 birds on the tree, 4 on the wire — more on the tree.'),
      TIP('కథలో మంత్రి కూడా "ఎక్కువ", "తక్కువ" అనే పదాలతోనే తెలివిగా ఆడాడు! // The minister played cleverly with "more" and "fewer" too!'),
      KEYS('ఎక్కువ = more // more', 'తక్కువ = fewer / less // fewer', 'సమానం = equal // equal'),
    ],
    ex: [
      EX('🐦🐦🐦 మరియు 🐦🐦 — ఏ గుంపులో ఎక్కువ? // Which group has more: 3 birds or 2 birds?', ['3 > 2. // 3 is bigger than 2.'], 'మూడు పక్షుల గుంపు // the group of three'),
      EX('4 మామిడి పండ్లు, 4 అరటి పండ్లు — ఏమంటాం? // 4 mangoes and 4 bananas — how do they compare?', ['రెండూ నాలుగే. // Both are four.'], 'సమానం // equal'),
    ],
    mcq: [
      ['7 కాకులు, 5 పావురాలు — ఏవి ఎక్కువ? // 7 crows, 5 pigeons — which are more?', 'కాకులు=crows', ['పావురాలు=pigeons', 'సమానం=equal', 'తెలియదు=cannot say'], '7 పెద్దదా, 5 పెద్దదా? // Is 7 or 5 bigger?', '7 > 5, కాకులు ఎక్కువ. // 7 > 5, so more crows.'],
      ['3 గాలిపటాలు, 8 బుడగలు — ఏవి తక్కువ? // 3 kites, 8 balloons — which are fewer?', 'గాలిపటాలు=kites', ['బుడగలు=balloons', 'సమానం=equal', 'రెండూ ఎక్కువ=both more'], 'చిన్న సంఖ్య ఏది? // Which number is smaller?', '3 < 8, గాలిపటాలు తక్కువ. // 3 < 8, so fewer kites.'],
      ['6 పువ్వులు, 6 ఆకులు — ఏమంటాం? // 6 flowers, 6 leaves — they are?', 'సమానం=equal', ['పువ్వులు ఎక్కువ=more flowers', 'ఆకులు ఎక్కువ=more leaves', 'ఆకులు తక్కువ=fewer leaves'], 'రెండు సంఖ్యలు ఒకటేనా? // Are the numbers the same?', '6 = 6, సమానం. // 6 = 6, equal.'],
      ['"ఎక్కువ" వ్యతిరేక పదం? // Opposite of ఎక్కువ (more)?', 'తక్కువ=less', ['సమానం=equal', 'పెద్ద=big', 'పొడవు=long'], 'మంత్రి జవాబులో రెండు పదాలు ఉన్నాయి. // The minister used both words.', 'ఎక్కువ × తక్కువ. // more × less.'],
      ['10 లడ్డూలు, 9 జిలేబీలు — ఏవి ఎక్కువ? // 10 laddoos, 9 jalebis — which are more?', 'లడ్డూలు=laddoos', ['జిలేబీలు=jalebis', 'సమానం=equal', 'ఏవీ కాదు=neither'], 'పది, తొమ్మిది — ఏది పెద్దది? // Ten or nine — which is bigger?', '10 > 9, లడ్డూలు ఎక్కువ. // 10 > 9, more laddoos.'],
    ],
  }),
]);

// ============================================================ 6. లేగదూడ (song — kindness to animals)
const ch6 = unit(6, 'ch6', 'లేగదూడ // The calf', [
  obj({
    id: 'ts3.te.dooda.song', title: 'లేగదూడ పాట — భావం // The calf song', hint: 'దూడకు ఏం కావాలో ఆలోచించు — అమ్మ, పాలు, ఆట. // Think what a calf needs: its mother, milk, play.',
    intro: [
      P('"లేగదూడ" గేయం ఒక చిన్న దూడ గురించి. లేగదూడ అంటే అప్పుడే పుట్టిన చిన్న దూడ. అది గంతులు వేస్తుంది, అమ్మ ఆవు దగ్గర పాలు తాగుతుంది. మనం మూగజీవులను ప్రేమగా చూసుకోవాలి. // The song "Legaduda" is about a newborn calf that frisks about and drinks its mother\'s milk. We must lovingly care for animals.'),
      PH('🐄', 'ఆవు, దాని దూడ — ప్రేమకు గుర్తు. // A cow and its calf — a picture of love.'),
      POEM(['గంతులు వేసే లేగదూడ,', 'అమ్మ వెంటే తిరిగే దూడ,', '"అంబా" అంటూ పిలిచే దూడ,', 'మా ఇంటి ముద్దుల దూడ!'], 'The frisky calf, following its mother, calling "amba", our darling calf! (our own rhyme)'),
      TIP('పశువులకు నీళ్ళు, మేత, నీడ ఇద్దాం; వాటిని కొట్టకూడదు. // Give animals water, fodder and shade; never hit them.'),
    ],
    ex: [
      EX('లేగదూడ అంటే? // What is a లేగదూడ?', ['"లేగ" అంటే లేత, చిన్న. // లేగ means young, tender.'], 'అప్పుడే పుట్టిన చిన్న దూడ // a newborn calf'),
      EX('దూడ ఏమని అరుస్తుంది? // What sound does a calf make?', ['మన పాటలో ఉంది. // It is in our rhyme.'], 'అంబా // amba (moo)'),
    ],
    order: ['మన దూడ పాట వరుసలను క్రమంలో పెట్టు // Put the lines of our calf rhyme in order', [
      ['గంతులు వేసే లేగదూడ=the frisky calf', 'అమ్మ వెంటే తిరిగే దూడ=following its mother', '"అంబా" అంటూ పిలిచే దూడ=calling amba', 'మా ఇంటి ముద్దుల దూడ=our darling calf'],
    ]],
    mcq: [
      ['దూడ ఎవరి పాలు తాగుతుంది? // Whose milk does the calf drink?', 'అమ్మ ఆవు=its mother cow', ['మేక=goat', 'కుక్క=dog', 'పిల్లి=cat'], 'దూడ అమ్మ ఎవరు? // Who is the calf\'s mother?', 'దూడ తన అమ్మ ఆవు పాలు తాగుతుంది. // The calf drinks its mother\'s milk.'],
      ['దూడ సంతోషంగా ఉంటే ఏం చేస్తుంది? // What does a happy calf do?', 'గంతులు వేస్తుంది=frisks and jumps', ['ఏడుస్తుంది=cries', 'ఈదుతుంది=swims', 'ఎగురుతుంది=flies'], 'పాటలో మొదటి వరుస. // The first line of the rhyme.', 'లేగదూడ గంతులు వేస్తుంది. // The calf frisks about.'],
      ['ఆవు, దూడ ఉండే చోటు? // Where do the cow and calf live?', 'కొట్టం / పాక=cowshed', ['గూడు=nest', 'పుట్ట=anthill', 'చెరువు=pond'], 'రైతు ఇంటి పక్కన ఉంటుంది. // Next to a farmer\'s house.', 'ఆవులు కొట్టంలో ఉంటాయి. // Cows live in a cowshed.'],
      ['పశువులను ఎలా చూసుకోవాలి? // How should we treat animals?', 'ప్రేమగా=lovingly', ['కొట్టి=by hitting', 'ఆకలితో ఉంచి=keeping them hungry', 'భయపెట్టి=by scaring'], 'పాట చెప్పే మాట. // The song\'s message.', 'మూగజీవులను ప్రేమగా చూసుకోవాలి. // Care for animals with love.'],
      ['ఆవు మనకు ఏమిస్తుంది? // What does the cow give us?', 'పాలు=milk', ['గుడ్లు=eggs', 'ఉన్ని=wool', 'తేనె=honey'], 'ఉదయం టీలో కలుపుతాం. // We add it to morning tea.', 'ఆవు పాలు ఇస్తుంది. // The cow gives milk.'],
    ],
  }),
  obj({
    id: 'ts3.te.dooda.young', title: 'జంతువులు — వాటి పిల్లలు // Animals and their young', hint: 'ఆ జంతువు పిల్లను ఇంట్లో ఏమని పిలుస్తారో గుర్తు చేసుకో. // Recall what the baby is called.',
    intro: [
      P('ప్రతి జంతువు పిల్లకు ఒక పేరు ఉంటుంది: ఆవు — దూడ, గేదె — దూడ (పెయ్య), మేక — మేకపిల్ల, కోడి — కోడిపిల్ల, కుక్క — కుక్కపిల్ల, పిల్లి — పిల్లికూన, గుర్రం — గుర్రపుపిల్ల. // Each animal\'s young has a name: cow – calf, goat – kid, hen – chick, dog – puppy, cat – kitten.'),
      PH('🐔', 'కోడి, దాని కోడిపిల్లలు. // A hen and her chicks.'),
      TIP('చాలా పిల్లల పేర్లలో "పిల్ల" అనే మాట వస్తుంది: మేకపిల్ల, కుక్కపిల్ల. // Many young-animal names add "pilla": మేకపిల్ల, కుక్కపిల్ల.'),
      KEYS('ఆవు → దూడ // cow → calf', 'కోడి → కోడిపిల్ల // hen → chick', 'కుక్క → కుక్కపిల్ల // dog → puppy'),
    ],
    ex: [
      EX('మేక పిల్లను ఏమంటారు? // What is a goat\'s young called?', ['మేక + పిల్ల. // goat + young.'], 'మేకపిల్ల // kid'),
      EX('దూడ ఏ జంతువు పిల్ల? // A calf is whose young?', ['అంబా అని అరుస్తుంది. // It calls amba.'], 'ఆవు // cow'),
    ],
    match: ['జంతువును దాని పిల్లతో కలుపు // Match each animal to its young', [
      ['ఆవు=cow', 'దూడ=calf'], ['మేక=goat', 'మేకపిల్ల=kid'], ['కోడి=hen', 'కోడిపిల్ల=chick'], ['కుక్క=dog', 'కుక్కపిల్ల=puppy'], ['పిల్లి=cat', 'పిల్లికూన=kitten'], ['గుర్రం=horse', 'గుర్రపుపిల్ల=foal'],
    ]],
    pic: [
      ['దూడ అమ్మ ఎవరు? // Who is the calf\'s mother?', ['🐄', 'ఆవు=cow'], [['🐐', 'మేక=goat'], ['🐕', 'కుక్క=dog']], 'పాలు ఇచ్చే పెద్ద జంతువు. // The big animal that gives milk.', 'దూడ ఆవు పిల్ల. // The calf is the cow\'s young.'],
      ['కోడిపిల్ల అమ్మ ఎవరు? // Who is the chick\'s mother?', ['🐔', 'కోడి=hen'], [['🦆', 'బాతు=duck'], ['🦚', 'నెమలి=peacock']], 'కొక్కొరొకో అనే పక్షి కుటుంబం. // The rooster\'s family.', 'కోడిపిల్ల కోడి పిల్ల. // The chick is the hen\'s young.'],
      ['మేకపిల్ల అమ్మ ఎవరు? // Who is the kid\'s mother?', ['🐐', 'మేక=goat'], [['🐑', 'గొర్రె=sheep'], ['🐄', 'ఆవు=cow']], 'మే మే అంటుంది. // It says "me me".', 'మేకపిల్ల మేక పిల్ల. // The kid is the goat\'s young.'],
      ['కుక్కపిల్ల అమ్మ ఎవరు? // Who is the puppy\'s mother?', ['🐕', 'కుక్క=dog'], [['🐈', 'పిల్లి=cat'], ['🐒', 'కోతి=monkey']], 'భౌ భౌ అంటుంది. // It says "bow bow".', 'కుక్కపిల్ల కుక్క పిల్ల. // The puppy is the dog\'s young.'],
      ['పిల్లికూన అమ్మ ఎవరు? // Who is the kitten\'s mother?', ['🐈', 'పిల్లి=cat'], [['🐕', 'కుక్క=dog'], ['🐭', 'ఎలుక=mouse']], 'మ్యావ్ అంటుంది. // It says "meow".', 'పిల్లికూన పిల్లి పిల్ల. // The kitten is the cat\'s young.'],
    ],
  }),
  obj({
    id: 'ts3.te.dooda.sounds', title: 'జంతువుల అరుపులు, ఇళ్ళు // Animal sounds and homes', hint: 'ఆ జంతువు శబ్దాన్ని నువ్వే అనుకరించి చూడు. // Try making the animal\'s sound yourself.',
    intro: [
      P('జంతువుల అరుపులు: ఆవు — అంబా, మేక — మే మే, కుక్క — భౌ భౌ, పిల్లి — మ్యావ్, కోడి — కొక్కొరొకో, కాకి — కావ్ కావ్. // Animal sounds: cow – amba, goat – me me, dog – bow bow, cat – meow, rooster – kokkoroko, crow – kaav kaav.'),
      P('జంతువుల ఇళ్ళు: పక్షి — గూడు, ఆవు — కొట్టం, గుర్రం — గుర్రపుశాల, కుక్క — గూడు/కెన్నెల్, ఎలుక — కలుగు, చీమ — పుట్ట, సింహం — గుహ. // Animal homes: bird – nest, cow – cowshed, horse – stable, rat – burrow, ant – anthill, lion – den.'),
      PH('🪺', 'పక్షి గూడు. // A bird\'s nest.'),
      TIP('పాట పాడేటప్పుడు ఈ అరుపులు కలిపితే పాట ఇంకా సరదాగా ఉంటుంది! // Add the sounds while singing — it is more fun!'),
    ],
    ex: [
      EX('కోడి ఎలా అరుస్తుంది? // What sound does a rooster make?', ['ఉదయమే అందరినీ లేపుతుంది. // It wakes everyone at dawn.'], 'కొక్కొరొకో // kokkoroko (cock-a-doodle-doo)'),
      EX('చీమలు ఎక్కడ ఉంటాయి? // Where do ants live?', ['మట్టితో కట్టిన చిన్న గుట్ట. // A small mound of soil.'], 'పుట్ట // anthill'),
    ],
    match: ['జంతువును దాని అరుపుతో కలుపు // Match each animal to its sound', [
      ['ఆవు=cow', 'అంబా'], ['మేక=goat', 'మే మే'], ['కుక్క=dog', 'భౌ భౌ'], ['పిల్లి=cat', 'మ్యావ్'], ['కోడి=rooster', 'కొక్కొరొకో'], ['కాకి=crow', 'కావ్ కావ్'],
    ]],
    mcq: [
      ['పక్షి ఇల్లు? // A bird\'s home?', 'గూడు=nest', ['పుట్ట=anthill', 'కొట్టం=cowshed', 'గుహ=den'], 'కొమ్మల మీద పుల్లలతో కడుతుంది. // Built of twigs on branches.', 'పక్షి గూడులో ఉంటుంది. // A bird lives in a nest.'],
      ['సింహం ఉండేది? // Where does a lion live?', 'గుహ=den', ['గూడు=nest', 'కలుగు=burrow', 'పుట్ట=anthill'], 'అడవిలో రాళ్ళ మధ్య. // Among rocks in the forest.', 'సింహం గుహలో ఉంటుంది. // A lion lives in a den.'],
      ['ఎలుక ఉండేది? // Where does a rat live?', 'కలుగు=burrow', ['గుహ=den', 'గూడు=nest', 'కొట్టం=cowshed'], 'నేలలో రంధ్రం. // A hole in the ground.', 'ఎలుక కలుగులో ఉంటుంది. // A rat lives in a burrow.'],
      ['"మే మే" అని అరిచేది? // Which animal says "me me"?', 'మేక=goat', ['ఆవు=cow', 'కుక్క=dog', 'కాకి=crow'], 'గడ్డి, ఆకులు తింటుంది. // It eats grass and leaves.', 'మేక మే మే అంటుంది. // A goat says me me.'],
      ['"కావ్ కావ్" అని అరిచేది? // Which bird says "kaav kaav"?', 'కాకి=crow', ['చిలుక=parrot', 'కోడి=hen', 'నెమలి=peacock'], 'నల్లని పక్షి. // A black bird.', 'కాకి కావ్ కావ్ అంటుంది. // A crow says kaav kaav.'],
      ['గుర్రం ఉండే చోటు? // Where does a horse stay?', 'గుర్రపుశాల=stable', ['గూడు=nest', 'పుట్ట=anthill', 'చెరువు=pond'], 'గుర్రం + శాల (ఇల్లు). // horse + shed.', 'గుర్రం గుర్రపుశాలలో ఉంటుంది. // A horse stays in a stable.'],
    ],
  }),
]);

// ============================================================ 7. నీటి అందాలు (essay — places of interest)
const ch7 = unit(7, 'ch7', 'నీటి అందాలు // Beauty of waters', [
  obj({
    id: 'ts3.te.neeru.places', title: 'తెలంగాణలో నీటి అందాలు // Beautiful water places of Telangana', hint: 'ఎత్తు నుండి పడే నీరా, నిలిచిన నీరా, ఆనకట్టా? // Falling water, still water, or a dam?',
    intro: [
      P('"నీటి అందాలు" ఒక వ్యాసం — చూడదగిన ప్రదేశాల గురించి. మన తెలంగాణలో అందమైన జలపాతాలు, చెరువులు, నదులు ఉన్నాయి. // "Beauty of waters" is an essay about places worth visiting: Telangana has lovely waterfalls, lakes and rivers.'),
      PH('🏞️', 'జలపాతం — కొండ మీద నుండి నీరు దూకుతుంది. // A waterfall — water leaps from a height.'),
      P('కొన్ని ప్రదేశాలు: కుంటాల జలపాతం (ఆదిలాబాద్ జిల్లా), బొగత జలపాతం (ములుగు జిల్లా), హుస్సేన్ సాగర్ (హైదరాబాదు — మధ్యలో బుద్ధుడి విగ్రహం), నాగార్జున సాగర్ (కృష్ణా నది మీద ఆనకట్ట). గోదావరి, కృష్ణా మన పెద్ద నదులు. // Places: Kuntala and Bogatha waterfalls, Hussain Sagar lake in Hyderabad with the Buddha statue, Nagarjuna Sagar dam on the Krishna. Godavari and Krishna are our big rivers.'),
      TIP('విహారయాత్రలో నీటి దగ్గర పెద్దల పక్కనే ఉండాలి, నీటిని శుభ్రంగా ఉంచాలి. // On trips, stay beside adults near water and keep it clean.'),
    ],
    ex: [
      EX('హుస్సేన్ సాగర్ ఏ నగరంలో ఉంది? // Which city has Hussain Sagar?', ['మన రాష్ట్ర రాజధాని. // Our state capital.'], 'హైదరాబాదు // Hyderabad'),
      EX('నాగార్జున సాగర్ ఏ నది మీద ఉంది? // Nagarjuna Sagar is on which river?', ['తెలంగాణలో రెండు పెద్ద నదులు: గోదావరి, కృష్ణా. // Two big rivers: Godavari and Krishna.'], 'కృష్ణా నది // the Krishna river'),
    ],
    mcq: [
      ['కుంటాల జలపాతం ఏ జిల్లాలో ఉంది? // Kuntala waterfall is in which district?', 'ఆదిలాబాద్=Adilabad', ['హైదరాబాదు=Hyderabad', 'ఖమ్మం=Khammam', 'మెదక్=Medak'], 'తెలంగాణ ఉత్తర భాగం. // North Telangana.', 'కుంటాల జలపాతం ఆదిలాబాద్ జిల్లాలో ఉంది. // Kuntala is in Adilabad district.'],
      ['హుస్సేన్ సాగర్ మధ్యలో ఏ విగ్రహం ఉంది? // Which statue stands in Hussain Sagar?', 'బుద్ధుడు=Buddha', ['గాంధీ=Gandhi', 'ఏనుగు=elephant', 'సింహం=lion'], 'శాంతికి గుర్తు. // A symbol of peace.', 'హుస్సేన్ సాగర్‌లో బుద్ధుడి విగ్రహం ఉంది. // The Buddha statue stands in Hussain Sagar.'],
      ['కొండ మీద నుండి నీరు దూకే చోటు? // Water falling from a hill is a?', 'జలపాతం=waterfall', ['బావి=well', 'కాలువ=canal', 'చెరువు=lake'], '"జల" = నీరు, "పాతం" = పడటం. // jala = water, paatam = falling.', 'జలపాతం = waterfall. // జలపాతం means waterfall.'],
      ['బొగత జలపాతం ఏ జిల్లాలో ఉంది? // Bogatha waterfall is in which district?', 'ములుగు=Mulugu', ['ఆదిలాబాద్=Adilabad', 'హైదరాబాదు=Hyderabad', 'నిజామాబాద్=Nizamabad'], 'అడవుల మధ్య, తూర్పు తెలంగాణ. // In the forests of east Telangana.', 'బొగత జలపాతం ములుగు జిల్లాలో ఉంది. // Bogatha is in Mulugu district.'],
      ['తెలంగాణలో ప్రవహించే పెద్ద నది? // A big river flowing through Telangana?', 'గోదావరి=Godavari', ['గంగ=Ganga', 'యమున=Yamuna', 'బ్రహ్మపుత్ర=Brahmaputra'], 'భద్రాచలం దగ్గర పారుతుంది. // It flows past Bhadrachalam.', 'గోదావరి, కృష్ణా తెలంగాణ నదులు. // Godavari and Krishna flow through Telangana.'],
      ['నీటి దగ్గర విహారానికి వెళ్తే ఏం చేయాలి? // What should we do on a trip to a water place?', 'పెద్దల పక్కనే ఉండాలి=stay with adults', ['ఒంటరిగా లోతుకు వెళ్ళాలి=go deep alone', 'చెత్త వేయాలి=throw rubbish', 'రాళ్ళు విసరాలి=throw stones'], 'జాగ్రత్త ముఖ్యం. // Safety first.', 'నీటి దగ్గర పెద్దల పక్కనే ఉండాలి. // Stay beside adults near water.'],
    ],
  }),
  obj({
    id: 'ts3.te.neeru.bodies', title: 'నీటి వనరులు // Kinds of water bodies', hint: 'అది సహజంగా ఏర్పడిందా, మనుషులు తవ్వారా? // Is it natural or dug by people?',
    intro: [
      P('నీరు ఉండే చోట్లు: సముద్రం (sea — ఉప్పు నీరు), నది (river — పారే నీరు), చెరువు (lake/tank — నిలిచిన నీరు), బావి (well — తవ్విన గుంత), కాలువ (canal — పొలాలకు నీరు), జలపాతం (waterfall). // Water bodies: sea, river, lake/tank, well, canal, waterfall.'),
      PH('⛵', 'పడవ నదిలో, సముద్రంలో తిరుగుతుంది. // Boats sail on rivers and the sea.'),
      TIP('సముద్రం నీరు ఉప్పగా ఉంటుంది — తాగలేం! నది, చెరువు, బావి నీరు మంచి నీరు. // Sea water is salty; river, lake and well water is fresh.'),
      KEYS('నది = river // river', 'చెరువు = lake / tank // lake', 'బావి = well // well'),
    ],
    ex: [
      EX('ఉప్పు నీరు ఉండేది? // Which has salty water?', ['చాలా పెద్దది, అలలు ఉంటాయి. // Very big, with waves.'], 'సముద్రం // the sea'),
      EX('పొలాలకు నీరు తీసుకెళ్ళే దారి? // A channel that carries water to fields?', ['మనుషులు తవ్వుతారు. // People dig it.'], 'కాలువ // canal'),
    ],
    match: ['నీటి వనరును దాని అర్థంతో కలుపు // Match each water body to its meaning', [
      ['సముద్రం', 'sea'], ['నది', 'river'], ['చెరువు', 'lake'], ['బావి', 'well'], ['కాలువ', 'canal'], ['జలపాతం', 'waterfall'],
    ]],
    mcq: [
      ['నిలిచిన నీరు ఉండే చోటు, ఊరి పక్కన? // Still water near a village?', 'చెరువు=lake/tank', ['నది=river', 'జలపాతం=waterfall', 'సముద్రం=sea'], 'తెలంగాణలో "మిషన్ కాకతీయ" వీటిని బాగు చేసింది. // Telangana villages have many of these.', 'చెరువులో నీరు నిలిచి ఉంటుంది. // A lake holds still water.'],
      ['బకెట్, తాడుతో నీరు తోడే చోటు? // Where do we draw water with a rope and bucket?', 'బావి=well', ['నది=river', 'సముద్రం=sea', 'కాలువ=canal'], 'లోతైన గుంత. // A deep pit.', 'బావిలో నుండి నీరు తోడతాం. // We draw water from a well.'],
      ['ఎప్పుడూ పారుతూ ఉండే నీరు? // Water that keeps flowing?', 'నది=river', ['చెరువు=lake', 'బావి=well', 'కుండ=pot'], 'గలగల శబ్దం. // A galagala sound.', 'నది నీరు పారుతుంది. // River water flows.'],
      ['అతి పెద్ద నీటి వనరు, అలలతో? // The biggest water body, with waves?', 'సముద్రం=sea', ['చెరువు=lake', 'బావి=well', 'కాలువ=canal'], 'ఉప్పు నీరు. // Salty water.', 'సముద్రం అన్నిటికంటే పెద్దది. // The sea is the biggest.'],
      ['"జలం" అంటే? // What does జలం mean?', 'నీరు=water', ['గాలి=air', 'నిప్పు=fire', 'మట్టి=soil'], '"జలపాతం" లో ఉంది. // It is in జలపాతం.', 'జలం = నీరు. // జలం means water.'],
    ],
  }),
  obj({
    id: 'ts3.te.neeru.describe', title: 'వర్ణించే పదాలు (విశేషణాలు) // Describing words', hint: 'ఆ వస్తువు ఎలా ఉంటుందో చెప్పే పదం వెతుకు. // Find the word that tells what the thing is like.',
    intro: [
      P('వస్తువు ఎలా ఉందో చెప్పే పదాలు వర్ణించే పదాలు (విశేషణాలు): చల్లని నీరు, పెద్ద చెరువు, తెల్లని నురుగు, ఎత్తైన కొండ, పచ్చని చెట్లు. // Describing words tell what something is like: cool water, big lake, white foam, tall hill, green trees.'),
      PH('🏞️', 'ఎత్తైన కొండ, తెల్లని జలపాతం, పచ్చని చెట్లు. // A tall hill, a white waterfall, green trees.'),
      TIP('వర్ణించే పదం సాధారణంగా వస్తువు ముందు వస్తుంది: "చల్లని" నీరు. // The describing word usually comes before the thing.'),
      KEYS('చల్లని = cool // cool', 'పెద్ద = big // big', 'అందమైన = beautiful // beautiful'),
    ],
    ex: [
      EX('"చల్లని నీరు" — వర్ణించే పదం ఏది? // In "cool water", which is the describing word?', ['నీరు ఎలా ఉంది? చల్లగా. // How is the water? Cool.'], 'చల్లని // cool'),
      EX('జలపాతాన్ని రెండు వర్ణించే పదాలతో చెప్పు. // Describe a waterfall with two describing words.', ['అది ఎత్తు నుండి పడుతుంది, తెల్లగా మెరుస్తుంది. // It falls from a height and shines white.'], 'ఎత్తైన, తెల్లని జలపాతం // a tall, white waterfall'),
    ],
    tap: ['వర్ణించే పదాలను మాత్రమే ఎంచుకో // Tap only the describing words', [
      ['చల్లని=cool', true], ['పెద్ద=big', true], ['అందమైన=beautiful', true], ['పచ్చని=green', true], ['ఎత్తైన=tall', true],
      ['నది=river', false], ['చెరువు=lake', false], ['పడవ=boat', false], ['కొండ=hill', false],
    ], 'చల్లని, పెద్ద, అందమైన, పచ్చని, ఎత్తైన — ఎలా ఉందో చెబుతాయి. నది, చెరువు, పడవ, కొండ — వస్తువుల పేర్లు. // Describing words tell "what kind"; the others are names of things.'],
    mcq: [
      ['"పెద్ద చెరువు" — వర్ణించే పదం? // In "big lake", the describing word?', 'పెద్ద=big', ['చెరువు=lake', 'రెండూ=both', 'ఏదీ కాదు=neither'], 'చెరువు ఎలా ఉంది? // How is the lake?', '"పెద్ద" చెరువును వర్ణిస్తుంది. // పెద్ద describes the lake.'],
      ['నీరు వేసవిలో కుండలో ఎలా ఉంటుంది? // How is water in a clay pot in summer?', 'చల్లని=cool', ['వేడి=hot', 'ఉప్పని=salty', 'చేదు=bitter'], 'మట్టి కుండ మాయ! // The clay pot\'s magic!', 'కుండలో నీరు చల్లగా ఉంటుంది. // Pot water stays cool.'],
      ['"___ కొండ" — సరిపోయే పదం? // Which word fits "___ hill"?', 'ఎత్తైన=tall', ['తియ్యని=sweet', 'ఉప్పని=salty', 'మెత్తని=soft'], 'కొండ ఆకాశం వైపు ఉంటుంది. // A hill reaches up.', 'ఎత్తైన కొండ. // a tall hill.'],
      ['"___ ఆకులు" — సరిపోయే రంగు పదం? // Which colour word fits "___ leaves"?', 'పచ్చని=green', ['నల్లని=black', 'నీలి=blue', 'ఊదా=purple'], 'చెట్టు ఆకుల రంగు. // The colour of leaves.', 'పచ్చని ఆకులు. // green leaves.'],
      ['"అందమైన జలపాతం" — ఏది వస్తువు పేరు? // In "beautiful waterfall", which is the thing?', 'జలపాతం=waterfall', ['అందమైన=beautiful', 'రెండూ=both', 'ఏదీ కాదు=neither'], 'దేని గురించి చెబుతున్నాం? // What are we talking about?', '"జలపాతం" వస్తువు; "అందమైన" వర్ణన. // జలపాతం is the thing; అందమైన describes it.'],
    ],
  }),
]);

// ============================================================ 8. మతిమరుపు ఈగ (story — humour)
const ch8 = unit(8, 'ch8', 'మతిమరుపు ఈగ // The forgetful fly', [
  obj({
    id: 'ts3.te.eega.story', title: 'పేరు మరచిన ఈగ — కథ // The fly that forgot its name', hint: 'ఈగ ఎవరెవరిని అడిగిందో వరుసగా గుర్తు చేసుకో. // Recall, in order, whom the fly asked.',
    intro: [
      P('"మతిమరుపు ఈగ" మన తెలుగు పిల్లలకు ఎంతో ఇష్టమైన జానపద హాస్య కథ. ఒక ఈగ తన పేరే మరచిపోతుంది! // "The forgetful fly" is a much-loved Telugu folk tale: a fly forgets its own name!'),
      PH('🤔', 'నా పేరు ఏమిటబ్బా? // Hmm, what is my name?'),
      P('మా మాటల్లో: ఒక ఈగ ఇల్లు అలుకుతూ తన పేరు మరచిపోయింది. "నా పేరేమిటి?" అని చెట్టును, ఆవును, దూడను అడిగింది — ఎవరూ చెప్పలేదు. చివరికి ఒక గుర్రం "ఈ…హీ…హీ…" అని సకిలించింది. ఆ "ఈ" వినగానే ఈగకు గుర్తొచ్చింది: "నేను ఈ…గ! ఈగ!" ఈగ సంతోషంగా ఎగిరిపోయింది. // In our words: a fly forgot its name and asked a tree, a cow and a calf — no one could tell. At last a horse neighed "ee-hee-hee", and hearing "ee" the fly remembered: "I am ee-ga — a fly!"'),
      TIP('కథలో "నా పేరేమిటి?" అనే ప్రశ్న మళ్ళీ మళ్ళీ వస్తుంది — మనమూ కలిసి అడుగుదాం! // The question "What is my name?" repeats — say it along!'),
    ],
    ex: [
      EX('ఈగ ఏమి మరచిపోయింది? // What did the fly forget?', ['కథ పేరులోనే "మతిమరుపు" ఉంది. // The title says "forgetful".'], 'తన పేరు // its own name'),
      EX('ఈగకు పేరు ఎవరి వల్ల గుర్తొచ్చింది? // Who helped the fly remember?', ['"ఈ…హీ…హీ" అని సకిలించింది. // It neighed "ee-hee-hee".'], 'గుర్రం // the horse'),
    ],
    order: ['ఈగ కథను వరుసలో పెట్టు // Put the fly\'s story in order', [
      ['ఈగ పేరు మరచిపోయింది=the fly forgot its name', 'ఈగ చెట్టును అడిగింది=it asked the tree', 'గుర్రం "ఈ…హీ…హీ" అంది=the horse neighed', 'ఈగకు పేరు గుర్తొచ్చింది=the fly remembered'],
      ['ఈగ ఆవును అడిగింది=it asked the cow', 'ఈగ దూడను అడిగింది=it asked the calf', 'గుర్రం సకిలించింది=the horse neighed', 'ఈగ సంతోషంగా ఎగిరింది=the fly flew off happily'],
    ]],
    mcq: [
      ['"మతిమరుపు" అంటే? // What does మతిమరుపు mean?', 'మరచిపోవడం=forgetfulness', ['గుర్తుంచుకోవడం=remembering', 'నిద్ర=sleep', 'ఆకలి=hunger'], 'ఈగ ఏం చేసింది? // What did the fly do?', 'మతిమరుపు అంటే మరచిపోయే గుణం. // మతిమరుపు means forgetfulness.'],
      ['గుర్రం అరుపును ఏమంటారు? // What is a horse\'s call called?', 'సకిలింపు=neigh', ['అంబా=moo', 'మొరుగు=bark', 'కూత=hoot'], 'ఈ…హీ…హీ… // ee-hee-hee', 'గుర్రం సకిలిస్తుంది. // A horse neighs.'],
      ['గుర్రం అరుపులో ఏ ధ్వని ఈగకు సాయపడింది? // Which sound in the neigh helped the fly?', 'ఈ', ['అ', 'ఉ', 'ఓ'], 'ఈగ పేరు మొదటి అక్షరం. // The first letter of ఈగ.', '"ఈ" విని "ఈగ" గుర్తొచ్చింది. // Hearing ఈ, it remembered ఈగ.'],
      ['ఈ కథ ఏ రకం? // What kind of story is this?', 'హాస్య జానపద కథ=funny folk tale', ['చరిత్ర=history', 'వార్త=news', 'పద్యం=verse'], 'చదివితే నవ్వు వస్తుంది. // It makes you laugh.', 'ఇది నవ్వించే జానపద కథ. // It is a funny folk tale.'],
      ['పేరు గుర్తొచ్చాక ఈగ ఎలా ఉంది? // How did the fly feel after remembering?', 'సంతోషంగా=happy', ['బాధగా=sad', 'కోపంగా=angry', 'భయంగా=scared'], 'కథ చివర. // The end of the story.', 'ఈగ సంతోషంగా ఎగిరిపోయింది. // The fly flew off happily.'],
    ],
  }),
  obj({
    id: 'ts3.te.eega.punct', title: 'విరామ చిహ్నాలు: . ? ! // Full stop, question mark, exclamation', hint: 'వాక్యం చెబుతోందా, అడుగుతోందా, ఆశ్చర్యపోతోందా? // Is the sentence telling, asking or exclaiming?',
    intro: [
      P('వాక్యం చివర గుర్తులు: చెప్పే వాక్యానికి పూర్ణ బిందువు "." — "ఈగ ఎగిరింది." అడిగే వాక్యానికి ప్రశ్నార్థకం "?" — "నా పేరేమిటి?" ఆశ్చర్యం, సంతోషానికి ఆశ్చర్యార్థకం "!" — "ఆహా, నేను ఈగ!" // End marks: "." for telling, "?" for asking, "!" for surprise or joy.'),
      PH('📝', 'సరైన గుర్తు వాక్యం భావాన్ని చెబుతుంది. // The right mark shows the sentence\'s feeling.'),
      TIP('"ఆహా", "అయ్యో", "భలే" వంటి మాటలు ఉంటే చివర సాధారణంగా "!" వస్తుంది. // Words like ఆహా, అయ్యో, భలే usually take "!".'),
    ],
    ex: [
      EX('"నా పేరేమిటి" చివర ఏ గుర్తు? // Which mark ends "What is my name"?', ['ఈగ అడుగుతోంది. // The fly is asking.'], '? // question mark'),
      EX('"భలే, నాకు గుర్తొచ్చింది" చివర ఏ గుర్తు? // Which mark ends "Hurray, I remember"?', ['సంతోషం, ఆశ్చర్యం. // Joy and surprise.'], '! // exclamation mark'),
    ],
    mcq: [
      ['"ఈగ చెట్టు దగ్గరకు వెళ్ళింది ___" // "The fly went to the tree ___"', '.', ['?', '!', ','], 'ఇది ఒక సమాచారం చెబుతోంది. // It tells a fact.', 'చెప్పే వాక్యం చివర "." వస్తుంది. // A telling sentence ends with ".".'],
      ['"నువ్వు నా పేరు చెప్పగలవా ___" // "Can you tell my name ___"', '?', ['.', '!', ','], 'ఇది అడుగుతోంది. // It asks.', 'ప్రశ్న చివర "?" వస్తుంది. // A question ends with "?".'],
      ['"అయ్యో, నా పేరు మరచిపోయాను ___" // "Oh no, I forgot my name ___"', '!', ['?', '.', ','], '"అయ్యో" — బాధతో కూడిన ఆశ్చర్యం. // "Oh no" shows strong feeling.', 'బలమైన భావానికి "!" వస్తుంది. // Strong feeling takes "!".'],
      ['"గుర్రం ఎక్కడ ఉంది ___" // "Where is the horse ___"', '?', ['.', '!', ','], '"ఎక్కడ" ప్రశ్న పదం. // ఎక్కడ is a question word.', 'ప్రశ్న పదం ఉంటే "?" వస్తుంది. // A question word means "?".'],
      ['"ఆహా, ఎంత అందమైన పువ్వు ___" // "Wow, what a lovely flower ___"', '!', ['.', '?', ','], '"ఆహా" — ఆశ్చర్యం. // ఆహా shows wonder.', 'ఆశ్చర్యానికి "!". // Wonder takes "!".'],
      ['"ఆవు గడ్డి మేస్తోంది ___" // "The cow is grazing ___"', '.', ['?', '!', ','], 'ఒక విషయం చెబుతోంది. // It tells something.', 'చెప్పే వాక్యం చివర "." // A telling sentence ends with ".".'],
    ],
  }),
  obj({
    id: 'ts3.te.eega.deergham', title: 'హ్రస్వం — దీర్ఘం // Short and long vowel sounds', hint: 'పదాన్ని పలికేటప్పుడు ధ్వనిని కొంచెం సాగదీస్తున్నావా? // Do you stretch the sound when you say it?',
    intro: [
      P('కొన్ని అచ్చులు పొట్టిగా (హ్రస్వం) పలుకుతాయి: అ, ఇ, ఉ, ఎ, ఒ. కొన్ని సాగదీసి (దీర్ఘం): ఆ, ఈ, ఊ, ఏ, ఓ. "ఈగ" లో "ఈ" దీర్ఘం! // Some vowels are short: అ ఇ ఉ ఎ ఒ; some are long: ఆ ఈ ఊ ఏ ఓ. The ఈ in ఈగ is long!'),
      PH('🪶', 'ఈక — "ఈ" దీర్ఘం. // ఈక (feather) — long ఈ.'),
      P('పొట్టి, పొడవు మారితే అర్థం మారవచ్చు: పలు (many) — పాలు (milk); కలం (pen) — కాలం (time). // Changing short to long can change meaning: పలు/పాలు, కలం/కాలం.'),
      TIP('చేతిని చిన్నగా ఊపితే హ్రస్వం, పొడవుగా ఊపితే దీర్ఘం — పలుకుతూ చేసి చూడు. // Small hand-wave for short, long wave for long.'),
    ],
    ex: [
      EX('"ఈగ" లో మొదటి అచ్చు హ్రస్వమా, దీర్ఘమా? // Is the first vowel in ఈగ short or long?', ['ఈ…గ అని సాగుతుంది. // It stretches: ee-ga.'], 'దీర్ఘం // long'),
      EX('"కలం" లో "క" ను "కా" చేస్తే ఏ పదం? // Change క to కా in కలం — what word?', ['కా + లం = కాలం. // kaa + lam.', 'కాలం అంటే సమయం. // కాలం means time.'], 'కాలం // కాలం (time)'),
    ],
    tap: ['దీర్ఘ అచ్చుతో మొదలయ్యే పదాలను ఎంచుకో // Tap the words that start with a long vowel', [
      ['ఈగ=fly', true], ['ఆవు=cow', true], ['ఊయల=swing', true], ['ఏనుగు=elephant', true], ['ఓడ=ship', true],
      ['ఇల్లు=house', false], ['ఉడుత=squirrel', false], ['అమ్మ=mother', false], ['ఎలుక=rat', false],
    ], 'ఆ, ఈ, ఊ, ఏ, ఓ దీర్ఘాలు; అ, ఇ, ఉ, ఎ, ఒ హ్రస్వాలు. // ఆ ఈ ఊ ఏ ఓ are long; అ ఇ ఉ ఎ ఒ are short.'],
    mcq: [
      ['"ఇ" దీర్ఘ రూపం? // The long form of ఇ?', 'ఈ', ['ఉ', 'ఎ', 'ఐ'], 'ఇ → ? // ఇ → ?', 'ఇ → ఈ. // ఇ → ఈ.'],
      ['"ఉ" దీర్ఘ రూపం? // The long form of ఉ?', 'ఊ', ['ఒ', 'ఈ', 'ఔ'], 'ఉయ్యాల కాదు, ఊ…యల! // Stretch it: oo-yala.', 'ఉ → ఊ. // ఉ → ఊ.'],
      ['"పలు" లో "ప" ను "పా" చేస్తే? // Change ప to పా in పలు?', 'పాలు=milk', ['పులు', 'పెలు', 'పోలు'], 'ఆవు ఇచ్చేది. // What a cow gives.', 'పా + లు = పాలు. // పాలు means milk.'],
      ['వీటిలో హ్రస్వ అచ్చుతో మొదలయ్యే పదం? // Which word starts with a short vowel?', 'ఇల్లు=house', ['ఈక=feather', 'ఆట=game', 'ఓడ=ship'], 'పొట్టిగా పలికే అచ్చు. // A short vowel.', '"ఇ" హ్రస్వం. // ఇ is short.'],
      ['"ఎ" దీర్ఘ రూపం? // The long form of ఎ?', 'ఏ', ['ఐ', 'ఒ', 'ఆ'], 'ఎలుక — ఏనుగు. // ఎలుక vs ఏనుగు.', 'ఎ → ఏ. // ఎ → ఏ.'],
      ['"ఒ" దీర్ఘ రూపం? // The long form of ఒ?', 'ఓ', ['ఔ', 'ఊ', 'ఏ'], 'ఒంటె — ఓడ. // ఒంటె vs ఓడ.', 'ఒ → ఓ. // ఒ → ఓ.'],
    ],
  }),
]);

// ============================================================ 9. ఏమేమి చూడాలి? (song — observing nature)
const ch9 = unit(9, 'ch9', 'ఏమేమి చూడాలి? // What all to see?', [
  obj({
    id: 'ts3.te.choodali.nature', title: 'ప్రకృతిని గమనిద్దాం // Let us observe nature', hint: 'ఆ దృశ్యం రోజులో ఏ సమయంలో, ఎక్కడ కనిపిస్తుంది? // When and where do we see it?',
    intro: [
      P('"ఏమేమి చూడాలి?" గేయం మన చుట్టూ ఉన్న ప్రకృతిని కళ్ళు తెరిచి గమనించమని చెబుతుంది: ఉదయించే సూర్యుడు, రంగుల ఇంద్రధనుస్సు, పురి విప్పిన నెమలి, పూసిన పువ్వులు, రాత్రి చందమామ, నక్షత్రాలు. // The song asks us to look carefully at nature: the rising sun, a rainbow, a dancing peacock, blooming flowers, the moon and stars.'),
      PH('🌅', 'సూర్యోదయం — ఆకాశం ఎర్రగా, బంగారు రంగులో. // Sunrise — the sky glows red and gold.'),
      POEM(['తెల్లవారితే సూర్యుణ్ణి చూడు,', 'తోటలోకి వెళ్ళి పూలను చూడు,', 'చెట్టు కొమ్మన పిట్టను చూడు,', 'రాతిరి వేళ చుక్కలను చూడు!'], 'At dawn see the sun, in the garden see flowers, on the branch see a bird, at night see the stars! (our own rhyme)'),
      TIP('రోజూ ఒక కొత్త విషయం గమనించి ఇంట్లో చెప్పు. // Notice one new thing each day and tell your family.'),
    ],
    ex: [
      EX('సూర్యుడు ఎప్పుడు ఉదయిస్తాడు? // When does the sun rise?', ['రోజు మొదలయ్యే సమయం. // When the day begins.'], 'తెల్లవారుజామున // at dawn'),
      EX('చుక్కలు (నక్షత్రాలు) ఎప్పుడు కనిపిస్తాయి? // When do we see stars?', ['పాటలో చివరి వరుస. // The last line of our rhyme.'], 'రాత్రి // at night'),
    ],
    order: ['మన పాట వరుసలను క్రమంలో పెట్టు // Put the lines of our rhyme in order', [
      ['తెల్లవారితే సూర్యుణ్ణి చూడు=at dawn see the sun', 'తోటలోకి వెళ్ళి పూలను చూడు=see flowers in the garden', 'చెట్టు కొమ్మన పిట్టను చూడు=see a bird on the branch', 'రాతిరి వేళ చుక్కలను చూడు=see stars at night'],
      ['ఉదయం=morning', 'మధ్యాహ్నం=afternoon', 'సాయంత్రం=evening', 'రాత్రి=night'],
    ]],
    pic: [
      ['రాత్రి ఆకాశంలో వెలిగేది? // What shines in the night sky?', ['🌙', 'చందమామ=moon'], [['☀️', 'సూర్యుడు=sun'], ['🌈', 'ఇంద్రధనుస్సు=rainbow']], 'చల్లని వెలుగు. // A cool light.', 'రాత్రి చందమామ 🌙 వెలుగుతుంది. // The moon shines at night.'],
      ['వాన తర్వాత ఆకాశంలో కనిపించేది? // What appears in the sky after rain?', ['🌈', 'ఇంద్రధనుస్సు=rainbow'], [['⭐', 'నక్షత్రం=star'], ['🌙', 'చందమామ=moon']], 'ఏడు రంగులు. // Seven colours.', 'వాన తర్వాత ఇంద్రధనుస్సు 🌈. // A rainbow after rain.'],
      ['పురి విప్పి నాట్యం చేసే పక్షి? // Which bird dances with its feathers spread?', ['🦚', 'నెమలి=peacock'], [['🐦‍⬛', 'కాకి=crow'], ['🦆', 'బాతు=duck']], 'మన జాతీయ పక్షి. // Our national bird.', 'నెమలి 🦚 నాట్యం చేస్తుంది. // The peacock dances.'],
      ['పగలు వెలుగు, వేడి ఇచ్చేది? // What gives light and heat by day?', ['☀️', 'సూర్యుడు=sun'], [['🌙', 'చందమామ=moon'], ['⭐', 'నక్షత్రం=star']], 'ఉదయం తూర్పున వస్తాడు. // Rises in the east.', 'సూర్యుడు ☀️ వెలుగు, వేడి ఇస్తాడు. // The sun gives light and heat.'],
      ['తోటలో రంగురంగుల రెక్కలతో ఎగిరేది? // What flutters in the garden with colourful wings?', ['🦋', 'సీతాకోకచిలుక=butterfly'], [['🐜', 'చీమ=ant'], ['🐞', 'అక్షింతల పురుగు=ladybird']], 'పూల మీద వాలుతుంది. // It sits on flowers.', 'సీతాకోకచిలుక 🦋 పూల మీద ఎగురుతుంది. // The butterfly flits over flowers.'],
    ],
  }),
  obj({
    id: 'ts3.te.choodali.senses', title: 'ఐదు జ్ఞానేంద్రియాలు // Our five senses', hint: 'దాన్ని చూస్తామా, వింటామా, వాసన చూస్తామా, రుచి చూస్తామా, తాకుతామా? // Do we see, hear, smell, taste or touch it?',
    intro: [
      P('ప్రకృతిని మనం ఐదు అవయవాలతో తెలుసుకుంటాం: కళ్ళు (చూడటం), చెవులు (వినడం), ముక్కు (వాసన), నాలుక (రుచి), చర్మం (తాకడం). వీటిని జ్ఞానేంద్రియాలు అంటారు. // We know the world through five senses: eyes see, ears hear, nose smells, tongue tastes, skin feels.'),
      PH('👁️', 'కళ్ళతో రంగులు, ఆకారాలు చూస్తాం. // Eyes see colours and shapes.'),
      TIP('కళ్ళు మూసుకొని ఒక నిమిషం విను — ఎన్ని శబ్దాలు వినిపిస్తాయి? // Close your eyes for a minute and listen — how many sounds?'),
      KEYS('కళ్ళు → చూడటం // eyes → see', 'చెవులు → వినడం // ears → hear', 'ముక్కు → వాసన // nose → smell'),
    ],
    ex: [
      EX('మల్లెపూల సువాసన ఏ అవయవంతో తెలుస్తుంది? // Which sense tells us the smell of jasmine?', ['వాసన చూసేది … // What smells?'], 'ముక్కు // nose'),
      EX('కోయిల పాట ఏ అవయవంతో వింటాం? // With what do we hear the cuckoo?', ['వినడానికి … // For hearing …'], 'చెవులు // ears'),
    ],
    match: ['అవయవాన్ని దాని పనితో కలుపు // Match each sense organ to its job', [
      ['కళ్ళు=eyes', 'చూడటం=seeing'], ['చెవులు=ears', 'వినడం=hearing'], ['ముక్కు=nose', 'వాసన=smelling'], ['నాలుక=tongue', 'రుచి=tasting'], ['చర్మం=skin', 'తాకడం=touching'],
    ]],
    pic: [
      ['పాట వినడానికి ఏ అవయవం? // Which organ hears a song?', ['👂', 'చెవి=ear'], [['👃', 'ముక్కు=nose'], ['👄', 'నోరు=mouth']], 'తలకు రెండు వైపులా. // On both sides of the head.', 'చెవితో వింటాం 👂. // We hear with ears.'],
      ['పువ్వు వాసనకు ఏ అవయవం? // Which organ smells a flower?', ['👃', 'ముక్కు=nose'], [['👂', 'చెవి=ear'], ['👁️', 'కన్ను=eye']], 'ముఖం మధ్యలో. // In the middle of the face.', 'ముక్కుతో వాసన చూస్తాం 👃. // We smell with the nose.'],
      ['ఇంద్రధనుస్సు చూడటానికి ఏ అవయవం? // Which organ sees a rainbow?', ['👁️', 'కన్ను=eye'], [['👂', 'చెవి=ear'], ['👃', 'ముక్కు=nose']], 'రంగులు తెలిసేది. // It knows colours.', 'కళ్ళతో చూస్తాం 👁️. // We see with eyes.'],
      ['మామిడి రుచి తెలిసేది? // Which tells the taste of a mango?', ['👄', 'నోరు / నాలుక=mouth / tongue'], [['👂', 'చెవి=ear'], ['🦶', 'పాదం=foot']], 'తింటేనే తెలుస్తుంది. // We know it by eating.', 'నాలుకతో రుచి తెలుస్తుంది 👄. // The tongue tastes.'],
      ['నేలపై నడిచేది? // What do we walk with?', ['🦶', 'పాదం=foot'], [['👁️', 'కన్ను=eye'], ['👂', 'చెవి=ear']], 'చెప్పులు దీనికే వేసుకుంటాం. // We wear sandals on it.', 'పాదాలతో నడుస్తాం 🦶 — వాటి చర్మం నేలను తాకి తెలుసుకుంటుంది. // We walk on our feet; their skin feels the ground.'],
    ],
  }),
  obj({
    id: 'ts3.te.choodali.colours', title: 'రంగులు // Colours', hint: 'ఆ వస్తువును మనసులో ఊహించుకో — దాని రంగు ఏమిటి? // Picture the thing in your mind — what colour is it?',
    intro: [
      P('ప్రకృతి రంగుల మయం: ఎరుపు (red), పచ్చ / ఆకుపచ్చ (green), పసుపు (yellow), నీలం (blue), తెలుపు (white), నలుపు (black), నారింజ (orange), ఊదా (purple). // Nature is full of colours: red, green, yellow, blue, white, black, orange, purple.'),
      PH('🌈', 'ఇంద్రధనుస్సులో ఏడు రంగులు. // A rainbow has seven colours.'),
      TIP('రంగుల ఆట: గదిలో "ఎరుపు" వస్తువులు ఎన్ని ఉన్నాయో లెక్కపెట్టు. // Colour game: count the red things in your room.'),
      KEYS('ఎరుపు = red // red', 'పచ్చ = green // green', 'పసుపు = yellow // yellow'),
    ],
    ex: [
      EX('చిలుక రంగు? // What colour is a parrot?', ['ఆకులాంటి రంగు. // Like a leaf.'], 'పచ్చ // green'),
      EX('ఆకాశం పగలు ఏ రంగు? // What colour is the sky by day?', ['మబ్బులు లేనప్పుడు చూడు. // Look on a clear day.'], 'నీలం // blue'),
    ],
    match: ['వస్తువును దాని రంగుతో కలుపు // Match each thing to its colour', [
      ['ఆకు=leaf', 'పచ్చ=green'], ['పాలు=milk', 'తెలుపు=white'], ['కాకి=crow', 'నలుపు=black'], ['అరటి పండు=banana', 'పసుపు=yellow'], ['ఆకాశం=sky', 'నీలం=blue'], ['టమాటా=tomato', 'ఎరుపు=red'],
    ]],
    mcq: [
      ['కాకి రంగు? // What colour is a crow?', 'నలుపు=black', ['తెలుపు=white', 'పచ్చ=green', 'ఎరుపు=red'], 'రాత్రి చీకటి లాంటిది. // Like the dark night.', 'కాకి నల్లగా ఉంటుంది. // A crow is black.'],
      ['పండిన టమాటా రంగు? // What colour is a ripe tomato?', 'ఎరుపు=red', ['నీలం=blue', 'నలుపు=black', 'తెలుపు=white'], 'నిప్పు లాంటి రంగు. // Like fire.', 'పండిన టమాటా ఎర్రగా ఉంటుంది. // A ripe tomato is red.'],
      ['పాల రంగు? // What colour is milk?', 'తెలుపు=white', ['పసుపు=yellow', 'నలుపు=black', 'పచ్చ=green'], 'మల్లెపువ్వు రంగు. // The colour of jasmine.', 'పాలు తెల్లగా ఉంటాయి. // Milk is white.'],
      ['పసుపు రంగు ఉండేది? // Which is yellow?', 'అరటి పండు=banana', ['కాకి=crow', 'ఆకాశం=sky', 'ఆకు=leaf'], 'పండినప్పుడు. // When ripe.', 'పండిన అరటి పండు పసుపు. // A ripe banana is yellow.'],
      ['ఎరుపు, పసుపు కలిపితే? // Red and yellow make?', 'నారింజ=orange', ['నీలం=blue', 'నలుపు=black', 'తెలుపు=white'], 'ఒక పండు పేరు కూడా. // Also a fruit\'s name.', 'ఎరుపు + పసుపు = నారింజ. // Red + yellow = orange.'],
    ],
  }),
]);

// ============================================================ 10. వేమన శతకం (verses — values)
const VEMANA = 'Vemana\'s verses are public domain (c. 17th century); the two shown are well-known traditional verses and may overlap the textbook selection — teacher to confirm.';
const ch10 = unit(10, 'ch10', 'వేమన శతకం // Vemana\'s verses', [
  obj({
    id: 'ts3.te.vemana.poet', title: 'వేమన — పద్యం అంటే ఏమిటి? // Who was Vemana? What is a padyam?', hint: 'ప్రతి వేమన పద్యం చివర వచ్చే మాట గుర్తు చేసుకో. // Remember the line that ends every Vemana verse.',
    intro: [
      P('వేమన చాలా ఏళ్ళ కిందట జీవించిన ప్రజా కవి. సులువైన తెలుగులో మంచి మాటలు పద్యాలుగా చెప్పాడు. ఆయన పద్యాల సంపుటిని "వేమన శతకం" అంటారు. // Vemana was a people\'s poet who lived long ago and gave good advice in simple Telugu verses, collected as "Vemana Shatakam".'),
      PH('📜', 'పాత కాలంలో పద్యాలను తాటాకుల మీద రాసేవారు. // Long ago verses were written on palm leaves.'),
      P('పద్యం అంటే ఒక నియమం ప్రకారం, లయగా రాసిన చిన్న కవిత. శతకం అంటే దాదాపు వంద పద్యాల పుస్తకం (శతం = వంద). ప్రతి పద్యం చివర ఒకే మాట వస్తుంది — దాన్ని మకుటం అంటారు. వేమన మకుటం: "విశ్వదాభిరామ వినురవేమ". // A padyam is a short poem with fixed rhythm; a shatakam is a book of about a hundred verses (shatam = 100). The repeating last line is the makutam: "Vishwadabhirama vinura Vema".'),
      TIP('పద్యాన్ని రాగంతో, నెమ్మదిగా చదువు — సులువుగా గుర్తుంటుంది. // Recite verses slowly in a tune — they are easy to remember.'),
    ],
    ex: [
      EX('"శతం" అంటే? // What does శతం mean?', ['శతకం = వంద పద్యాలు. // A shatakam has about a hundred verses.'], 'వంద // hundred'),
      EX('వేమన పద్యాల మకుటం ఏమిటి? // What is the makutam of Vemana\'s verses?', ['ప్రతి పద్యం చివర వచ్చే వరుస. // The line ending every verse.'], 'విశ్వదాభిరామ వినురవేమ // Vishwadabhirama vinura Vema'),
    ],
    mcq: [
      ['వేమన ఎవరు? // Who was Vemana?', 'ప్రజా కవి=a people\'s poet', ['రాజు=a king', 'ఆటగాడు=a player', 'వ్యాపారి=a trader'], 'పద్యాలు రాశాడు. // He wrote verses.', 'వేమన సులువైన తెలుగులో పద్యాలు రాసిన కవి. // Vemana was a poet who wrote simple Telugu verses.'],
      ['"శతకం" లో దాదాపు ఎన్ని పద్యాలు? // About how many verses in a shatakam?', 'వంద=hundred', ['పది=ten', 'ఐదు=five', 'వెయ్యి=thousand'], 'శతం = ? // shatam = ?', 'శతకం = దాదాపు వంద పద్యాలు. // A shatakam has about 100 verses.'],
      ['ప్రతి పద్యం చివర వచ్చే ఒకే వరుసను ఏమంటారు? // The line that repeats at the end of every verse is called?', 'మకుటం=makutam', ['శీర్షిక=title', 'కథ=story', 'పాట=song'], '"కిరీటం" లాంటిది. // Like a crown.', 'మకుటం = పద్యం చివరి ఒకే వరుస. // The makutam is the repeating last line.'],
      ['వేమన పద్యాలు ఏం నేర్పుతాయి? // What do Vemana\'s verses teach?', 'మంచి నడవడి=good conduct', ['ఆటలు=games', 'వంటలు=cooking', 'లెక్కలు=sums'], 'నీతి. // Morals.', 'వేమన పద్యాలు నీతి, మంచి నడవడి నేర్పుతాయి. // They teach good values.'],
      ['వేమన పద్యాలు ఏ భాషలో ఉన్నాయి? // In which language are Vemana\'s verses?', 'తెలుగు=Telugu', ['హిందీ=Hindi', 'ఇంగ్లీష్=English', 'తమిళం=Tamil'], 'మనం నేర్చుకుంటున్న భాష. // The language we are learning.', 'వేమన తెలుగు కవి. // Vemana was a Telugu poet.'],
    ],
  }),
  obj({
    id: 'ts3.te.vemana.verse', title: 'పద్యం — భావం // A verse and its meaning', hint: 'పద్యం చెప్పే పోలికను ఆలోచించు: ఏది ఒకేలా కనిపిస్తుంది, ఏది వేరు? // Think about the comparison: what looks alike, what differs?',
    intro: [
      P('వేమన ప్రసిద్ధ పద్యం (జానపద సంపద, అందరిదీ): // A famous Vemana verse (public domain):'),
      POEM(['ఉప్పు కప్పురంబు నొక్క పోలికనుండు', 'చూడ చూడ రుచుల జాడ వేరు', 'పురుషులందు పుణ్య పురుషులు వేరయా', 'విశ్వదాభిరామ వినురవేమ'], 'Salt and camphor look alike, but taste them and they differ; so too, among people, good people are different. — Vemana'),
      PH('🥄', 'ఉప్పు, కర్పూరం రెండూ తెల్లగా ఒకేలా కనిపిస్తాయి. // Salt and camphor both look white.'),
      P('భావం: ఉప్పు, కర్పూరం చూడటానికి ఒకేలా ఉంటాయి కానీ రుచి వేరు. అలాగే మనుషులందరూ ఒకేలా కనిపించినా, మంచి గుణాలున్నవారు ప్రత్యేకం. // Meaning: salt and camphor look the same but taste different; people may look alike, but those with good qualities stand apart.'),
      TIP('ఇంకో పద్యం: "అనగ అనగ రాగ మతిశయిల్లుచునుండు, తినగ తినగ వేము తియ్యనుండు" — సాధన చేస్తే ఏ పనైనా వస్తుంది. // Another verse: practice makes any task easy.'),
    ],
    ex: [
      EX('ఉప్పు, కర్పూరం దేనిలో ఒకటే? // In what are salt and camphor alike?', ['రెండూ తెల్లగా, పొడిగా ఉంటాయి. // Both are white.'], 'చూడటానికి // in looks'),
      EX('"తినగ తినగ వేము తియ్యనుండు" — భావం? // Meaning of "eat neem again and again and it turns sweet"?', ['మొదట చేదు, అలవాటయితే … // Bitter at first, then …', 'సాధన చేస్తే కష్టమూ సులువు. // Practice makes hard things easy.'], 'సాధనతో కష్టం సులువవుతుంది // practice makes hard things easy'),
    ],
    order: ['వేమన పద్యం వరుసలను క్రమంలో పెట్టు // Put the lines of the Vemana verse in order', [
      ['ఉప్పు కప్పురంబు నొక్క పోలికనుండు=salt and camphor look alike', 'చూడ చూడ రుచుల జాడ వేరు=their tastes differ', 'పురుషులందు పుణ్య పురుషులు వేరయా=good people are different', 'విశ్వదాభిరామ వినురవేమ=listen, Vema'],
      ['అనగ అనగ రాగ మతిశయిల్లుచునుండు=singing again improves the tune', 'తినగ తినగ వేము తియ్యనుండు=eating neem again, it turns sweet', 'సాధనమున పనులు సమకూరు ధరలోన=by practice, tasks are achieved', 'విశ్వదాభిరామ వినురవేమ=listen, Vema'],
    ]],
    mcq: [
      ['ఉప్పు, కర్పూరం దేనిలో వేరు? // How are salt and camphor different?', 'రుచిలో=in taste', ['రంగులో=in colour', 'ఆకారంలో=in shape', 'ఏదీ కాదు=not at all'], '"రుచుల జాడ వేరు". // "Their tastes differ".', 'రెండూ తెల్లగా ఉన్నా రుచి వేరు. // Both are white, but taste different.'],
      ['ఈ పద్యం ప్రకారం గొప్పవారు ఎవరు? // By this verse, who is truly great?', 'మంచి గుణాలున్నవారు=people with good qualities', ['అందంగా ఉన్నవారు=good-looking people', 'పొడుగ్గా ఉన్నవారు=tall people', 'డబ్బున్నవారు=rich people'], '"పుణ్య పురుషులు". // "Good people".', 'మంచి గుణాలే మనిషిని గొప్పవాణ్ణి చేస్తాయి. // Good qualities make a person great.'],
      ['"సాధన" అంటే? // What is సాధన?', 'మళ్ళీ మళ్ళీ చేయడం=practice', ['నిద్ర=sleep', 'ఆట మానేయడం=giving up', 'కోపం=anger'], 'రోజూ బొమ్మ గీస్తే బాగా వస్తుంది. // Draw daily and you improve.', 'సాధన అంటే అభ్యాసం. // సాధన means practice.'],
      ['వేప రుచి సాధారణంగా? // Neem usually tastes?', 'చేదు=bitter', ['తీపి=sweet', 'ఉప్పు=salty', 'పులుపు=sour'], 'ఉగాది పచ్చడిలో కూడా ఉంటుంది. // It is in Ugadi chutney too.', 'వేప చేదు — కానీ అలవాటైతే తియ్యగా అనిపిస్తుందని వేమన చెప్పాడు. // Neem is bitter; Vemana says habit makes it feel sweet.'],
      ['ఈ పద్యాల్లో "వేమ" ఎవరు? // Who is "Vema" in these verses?', 'కవి వేమన=the poet Vemana', ['ఒక రాజు=a king', 'ఒక పక్షి=a bird', 'ఒక నది=a river'], 'మకుటంలో కవి పేరు. // The poet\'s name in the makutam.', '"వినురవేమ" — కవి తన పేరే చెప్పుకున్నాడు. // The poet names himself.'],
    ],
  }),
  obj({
    id: 'ts3.te.vemana.words', title: 'పద్యంలోని కొత్త పదాలు // New words from the verses', hint: 'పదాన్ని ఈ కాలం మాటలో చెప్పి చూడు. // Say the word as we say it today.',
    intro: [
      P('పాత పద్యాల్లో పదాలు కొంచెం వేరుగా ఉంటాయి: కప్పురంబు = కర్పూరం (camphor), పోలిక = ఒకేలా ఉండటం (likeness), రుచి = taste, జాడ = గుర్తు / విధం (trace), వేము = వేప (neem), తియ్యన = తీపి (sweet), ధర = భూమి (earth). // Old verse words: కప్పురంబు = camphor, పోలిక = likeness, వేము = neem, ధర = earth.'),
      PH('🌿', 'వేము = వేప చెట్టు. // వేము is the neem tree.'),
      TIP('పద్యంలో పదం చివర "-ంబు" ఉంటే, ఇప్పటి మాటలో "-ం" అవుతుంది: కప్పురంబు → కప్పురం. // Verse endings "-mbu" become "-m" today.'),
    ],
    ex: [
      EX('"వేము" అంటే? // What is వేము?', ['చేదుగా ఉండే చెట్టు ఆకులు. // A tree with bitter leaves.'], 'వేప // neem'),
      EX('"ధర" అంటే? // What is ధర?', ['"ధరలోన" = భూమి మీద. // ధరలోన = on earth.'], 'భూమి // earth'),
    ],
    match: ['పద్య పదాన్ని ఇప్పటి మాటతో కలుపు // Match the verse word to today\'s word', [
      ['కప్పురంబు', 'కర్పూరం=camphor'], ['వేము', 'వేప=neem'], ['తియ్యన', 'తీపి=sweet'], ['ధర', 'భూమి=earth'], ['పోలిక', 'ఒకేలా ఉండటం=likeness'], ['సాధన', 'అభ్యాసం=practice'],
    ]],
    mcq: [
      ['"కప్పురంబు" అంటే? // What is కప్పురంబు?', 'కర్పూరం=camphor', ['ఉప్పు=salt', 'చక్కెర=sugar', 'బియ్యం=rice'], 'దేవుడికి హారతి ఇస్తాం. // Used for aarti.', 'కప్పురంబు = కర్పూరం. // కప్పురంబు means camphor.'],
      ['"తియ్యన" అంటే? // What is తియ్యన?', 'తీపి=sweet', ['చేదు=bitter', 'కారం=spicy', 'పులుపు=sour'], 'బెల్లం లాగా. // Like jaggery.', 'తియ్యన = తీపి. // తియ్యన means sweet.'],
      ['"పోలిక" అంటే? // What is పోలిక?', 'ఒకేలా ఉండటం=likeness', ['తేడా=difference', 'కోపం=anger', 'పాట=song'], 'కవలలు ఒకరికొకరు … // Twins look …', 'పోలిక అంటే ఒకేలా ఉండటం. // పోలిక means likeness.'],
      ['"రుచి" ఏ అవయవంతో తెలుస్తుంది? // Which organ tells taste (రుచి)?', 'నాలుక=tongue', ['చెవి=ear', 'కన్ను=eye', 'ముక్కు=nose'], 'నోటిలో ఉంటుంది. // It is in the mouth.', 'రుచి నాలుకతో తెలుస్తుంది. // We taste with the tongue.'],
      ['"ధరలోన" అంటే? // What is ధరలోన?', 'భూమి మీద=on earth', ['నీటిలో=in water', 'ఆకాశంలో=in the sky', 'ఇంట్లో=at home'], 'ధర = భూమి. // ధర = earth.', 'ధరలోన = భూమి మీద. // ధరలోన means on earth.'],
    ],
  }),
], `${REVIEW} ${VEMANA}`);

// ============================================================ 11. తెలంగాణ రాష్ట్ర చిహ్నాలు (essay — culture)
const ch11 = unit(11, 'ch11', 'తెలంగాణ రాష్ట్ర చిహ్నాలు // Telangana state symbols', [
  obj({
    id: 'ts3.te.chihna.symbols', title: 'మన రాష్ట్ర చిహ్నాలు // Our state symbols', hint: 'పక్షా, జంతువా, చెట్టా, పువ్వా? // Is it a bird, an animal, a tree or a flower?',
    intro: [
      P('మన తెలంగాణ రాష్ట్రం 2014 జూన్ 2 న ఏర్పడింది. రాజధాని హైదరాబాదు. ప్రతి రాష్ట్రానికి కొన్ని గుర్తులు (చిహ్నాలు) ఉంటాయి. // Telangana was formed on 2 June 2014; its capital is Hyderabad. Every state has symbols.'),
      PH('🦌', 'రాష్ట్ర జంతువు — జింక (మచ్చల జింక). // State animal — the spotted deer.'),
      KEYS('రాష్ట్ర పక్షి: పాలపిట్ట // state bird: Indian roller', 'రాష్ట్ర జంతువు: జింక // state animal: spotted deer', 'రాష్ట్ర వృక్షం: జమ్మి చెట్టు // state tree: Jammi', 'రాష్ట్ర పుష్పం: తంగేడు పువ్వు // state flower: Tangedu'),
      TIP('దసరా రోజు పాలపిట్టను చూడటం, జమ్మి ఆకులు పంచుకోవడం, బతుకమ్మలో తంగేడు పూలు పేర్చడం — మన పండుగలతో చిహ్నాలకు బంధం ఉంది! // Our symbols are tied to our festivals: seeing the Palapitta and sharing Jammi leaves at Dasara, Tangedu flowers in Bathukamma.'),
    ],
    ex: [
      EX('తెలంగాణ రాష్ట్ర పక్షి ఏది? // What is Telangana\'s state bird?', ['నీలి రంగు రెక్కల పక్షి, దసరా రోజు చూస్తారు. // A blue-winged bird seen at Dasara.'], 'పాలపిట్ట // Indian roller'),
      EX('తెలంగాణ ఎప్పుడు ఏర్పడింది? // When was Telangana formed?', ['ఆ రోజు "తెలంగాణ ఆవిర్భావ దినోత్సవం". // That day is Telangana Formation Day.'], '2014 జూన్ 2 // 2 June 2014'),
    ],
    match: ['చిహ్నాన్ని దాని రకంతో కలుపు // Match each symbol to its type', [
      ['పాలపిట్ట=Indian roller', 'రాష్ట్ర పక్షి=state bird'], ['జింక=spotted deer', 'రాష్ట్ర జంతువు=state animal'], ['జమ్మి=Jammi', 'రాష్ట్ర వృక్షం=state tree'], ['తంగేడు=Tangedu', 'రాష్ట్ర పుష్పం=state flower'], ['హైదరాబాదు=Hyderabad', 'రాజధాని=capital'],
    ]],
    pic: [
      ['తెలంగాణ రాష్ట్ర జంతువు? // Telangana\'s state animal?', ['🦌', 'జింక=deer'], [['🐅', 'పులి=tiger'], ['🐘', 'ఏనుగు=elephant']], 'ఒంటి మీద తెల్లని మచ్చలు. // White spots on its body.', 'మచ్చల జింక 🦌 మన రాష్ట్ర జంతువు. // The spotted deer is our state animal.'],
      ['తెలంగాణ రాష్ట్ర పక్షి? // Telangana\'s state bird?', ['🐦', 'పాలపిట్ట=Indian roller'], [['🦚', 'నెమలి=peacock'], ['🦜', 'చిలుక=parrot']], 'దసరాకు చూస్తే శుభమని నమ్మకం. // Seeing it at Dasara is thought lucky.', 'పాలపిట్ట 🐦 మన రాష్ట్ర పక్షి. // The Indian roller is our state bird.'],
      ['తెలంగాణ రాష్ట్ర వృక్షం? // Telangana\'s state tree?', ['🌳', 'జమ్మి చెట్టు=Jammi tree'], [['🌴', 'కొబ్బరి చెట్టు=coconut tree'], ['🌱', 'మొలక=sprout']], 'దసరాకు దీని ఆకులు పంచుకుంటారు. // Its leaves are shared at Dasara.', 'జమ్మి చెట్టు 🌳 మన రాష్ట్ర వృక్షం. // Jammi is our state tree.'],
      ['తెలంగాణ రాష్ట్ర పుష్పం? // Telangana\'s state flower?', ['🌼', 'తంగేడు పువ్వు=Tangedu flower'], [['🌸', 'గులాబీ=rose'], ['🌾', 'వరి=paddy']], 'పసుపు రంగు, బతుకమ్మలో పేరుస్తారు. // Yellow, used in Bathukamma.', 'తంగేడు 🌼 మన రాష్ట్ర పుష్పం. // Tangedu is our state flower.'],
      ['తెలంగాణ రాజధాని? // Telangana\'s capital?', ['🏢', 'హైదరాబాదు=Hyderabad'], [['🏘️', 'వరంగల్=Warangal'], ['🏞️', 'ఆదిలాబాద్=Adilabad']], 'చార్మినార్ ఉన్న నగరం. // The city of the Charminar.', 'హైదరాబాదు 🏢 మన రాజధాని. // Hyderabad is our capital.'],
    ],
  }),
  obj({
    id: 'ts3.te.chihna.why', title: 'చిహ్నాలు ఎందుకు ప్రత్యేకం? // Why the symbols are special', hint: 'ఆ చిహ్నం ఏ పండుగలో కనిపిస్తుందో ఆలోచించు. // Think which festival it appears in.',
    intro: [
      P('పాలపిట్ట: నీలి రంగు రెక్కలతో అందమైన పక్షి; దసరా రోజు చూస్తే మంచిదని నమ్ముతారు. జమ్మి: దసరా రోజు జమ్మి ఆకులు "బంగారం" అని పెద్దలకు ఇచ్చి ఆశీర్వాదం తీసుకుంటారు. తంగేడు: పసుపు పూలు, బతుకమ్మలో ముఖ్యం. జింక: మన అడవుల్లో తిరిగే అందమైన జంతువు. // Why they matter: Palapitta at Dasara, Jammi leaves given as "gold" at Dasara, yellow Tangedu flowers in Bathukamma, and the graceful deer of our forests.'),
      PH('🌼', 'తంగేడు పూలు — బతుకమ్మకు అందం. // Tangedu flowers make Bathukamma beautiful.'),
      TIP('చిహ్నాలను కాపాడటం మన బాధ్యత: పక్షులను పట్టకూడదు, జింకలను వేటాడకూడదు, చెట్లు నరకకూడదు. // Protect our symbols: do not trap birds, hunt deer or cut trees.'),
    ],
    ex: [
      EX('దసరా రోజు ఏ ఆకులను "బంగారం" అని పంచుకుంటారు? // Which leaves are shared as "gold" at Dasara?', ['రాష్ట్ర వృక్షం ఆకులు. // Leaves of the state tree.'], 'జమ్మి ఆకులు // Jammi leaves'),
      EX('బతుకమ్మలో ముఖ్యమైన పసుపు పూలు? // The important yellow flowers in Bathukamma?', ['రాష్ట్ర పుష్పం. // The state flower.'], 'తంగేడు పూలు // Tangedu flowers'),
    ],
    mcq: [
      ['దసరా రోజు ఏ పక్షిని చూడటం శుభమని నమ్ముతారు? // Which bird is lucky to see at Dasara?', 'పాలపిట్ట=Indian roller', ['కాకి=crow', 'గుడ్లగూబ=owl', 'కోడి=hen'], 'నీలి రెక్కల పక్షి. // The blue-winged bird.', 'దసరా రోజు పాలపిట్టను చూస్తారు. // People look for the Palapitta at Dasara.'],
      ['తంగేడు పూల రంగు? // What colour are Tangedu flowers?', 'పసుపు=yellow', ['నీలం=blue', 'నలుపు=black', 'ఊదా=purple'], 'బంగారు రంగులా. // Like gold.', 'తంగేడు పూలు పసుపు రంగు. // Tangedu flowers are yellow.'],
      ['జింకను కాపాడటానికి ఏం చేయాలి? // How do we protect deer?', 'వేటాడకూడదు, అడవులు కాపాడాలి=no hunting, save forests', ['పట్టి ఇంట్లో పెట్టాలి=keep them at home', 'తరమాలి=chase them', 'రాళ్ళు వేయాలి=throw stones'], 'జింక అడవి జంతువు. // The deer is a wild animal.', 'వేట ఆపి, అడవులు కాపాడితే జింకలు బతుకుతాయి. // Stop hunting and save forests.'],
      ['"చిహ్నం" అంటే? // What is చిహ్నం?', 'గుర్తు=symbol', ['పాట=song', 'ఆట=game', 'కథ=story'], 'రాష్ట్రాన్ని గుర్తుచేసేది. // Something that stands for the state.', 'చిహ్నం = గుర్తు (symbol). // చిహ్నం means symbol.'],
      ['జమ్మి ఆకులు ఇచ్చి పెద్దల నుండి ఏం తీసుకుంటారు? // Giving Jammi leaves, what do we receive from elders?', 'ఆశీర్వాదం=blessings', ['డబ్బు=money', 'బొమ్మలు=toys', 'పుస్తకాలు=books'], 'పెద్దలు తల మీద చేయి పెడతారు. // Elders place a hand on our head.', 'జమ్మి ఆకులు ఇచ్చి ఆశీర్వాదం తీసుకుంటారు. // We take blessings.'],
    ],
  }),
  obj({
    id: 'ts3.te.chihna.nouns', title: 'పేరు పదాలు (నామవాచకాలు) // Naming words', hint: 'అది ఒక మనిషి, స్థలం, జంతువు లేదా వస్తువు పేరా? // Is it the name of a person, place, animal or thing?',
    intro: [
      P('మనిషి, స్థలం, జంతువు, వస్తువుల పేర్లను నామవాచకాలు (పేరు పదాలు) అంటారు: సీత (మనిషి), హైదరాబాదు (స్థలం), జింక (జంతువు), పుస్తకం (వస్తువు). // Naming words (nouns) name people, places, animals and things: Sita, Hyderabad, deer, book.'),
      PH('🗺️', 'హైదరాబాదు, వరంగల్, ఆదిలాబాద్ — స్థలాల పేర్లు. // Hyderabad, Warangal, Adilabad — names of places.'),
      TIP('"ఎవరు?" లేదా "ఏమిటి?" అని అడిగితే వచ్చే జవాబు సాధారణంగా పేరు పదం. // The answer to "who?" or "what?" is usually a naming word.'),
      KEYS('మనిషి: సీత, రవి // person', 'స్థలం: హైదరాబాదు // place', 'వస్తువు: పుస్తకం // thing'),
    ],
    ex: [
      EX('"పాలపిట్ట చెట్టు మీద కూర్చుంది" — పేరు పదాలు ఏవి? // Find the naming words.', ['ఏ పక్షి? పాలపిట్ట. ఎక్కడ? చెట్టు. // Which bird? Where?'], 'పాలపిట్ట, చెట్టు // Palapitta, tree'),
      EX('"వరంగల్" ఏ రకం పేరు? // What kind of name is Warangal?', ['అది ఒక ఊరు/నగరం. // It is a city.'], 'స్థలం పేరు // name of a place'),
    ],
    tap: ['పేరు పదాలను (నామవాచకాలను) ఎంచుకో // Tap the naming words', [
      ['జింక=deer', true], ['హైదరాబాదు=Hyderabad', true], ['పుస్తకం=book', true], ['సీత=Sita', true], ['చెట్టు=tree', true],
      ['పరుగెత్తు=run', false], ['అందమైన=beautiful', false], ['తిను=eat', false], ['పెద్ద=big', false],
    ], 'జింక, హైదరాబాదు, పుస్తకం, సీత, చెట్టు — పేర్లు. పరుగెత్తు, తిను — పనులు; అందమైన, పెద్ద — వర్ణనలు. // Names are nouns; run/eat are actions; beautiful/big describe.'],
    mcq: [
      ['వీటిలో స్థలం పేరు ఏది? // Which is the name of a place?', 'వరంగల్=Warangal', ['రవి=Ravi', 'జింక=deer', 'బంతి=ball'], 'మనం అక్కడికి వెళ్ళవచ్చు. // We can travel there.', 'వరంగల్ ఒక నగరం. // Warangal is a city.'],
      ['వీటిలో మనిషి పేరు ఏది? // Which is the name of a person?', 'కావ్య=Kavya', ['ఖమ్మం=Khammam', 'కుర్చీ=chair', 'కోతి=monkey'], 'ఒక అమ్మాయి పేరు. // A girl\'s name.', 'కావ్య ఒక మనిషి పేరు. // Kavya is a person\'s name.'],
      ['వీటిలో వస్తువు పేరు ఏది? // Which is the name of a thing?', 'సంచి=bag', ['తేజ=Teja', 'గోదావరి=Godavari', 'జింక=deer'], 'బడికి తీసుకెళ్తాం. // We carry it to school.', 'సంచి ఒక వస్తువు. // A bag is a thing.'],
      ['"రవి బంతి ఆడాడు" — పేరు పదాలు? // Naming words in "Ravi played ball"?', 'రవి, బంతి=Ravi, ball', ['ఆడాడు=played', 'రవి, ఆడాడు=Ravi, played', 'బంతి, ఆడాడు=ball, played'], '"ఆడాడు" ఒక పని. // "played" is an action.', 'రవి (మనిషి), బంతి (వస్తువు) — పేరు పదాలు. // Ravi and ball are nouns.'],
      ['వీటిలో జంతువు పేరు ఏది? // Which is the name of an animal?', 'జింక=deer', ['జమ్మి=Jammi', 'తంగేడు=Tangedu', 'హైదరాబాదు=Hyderabad'], 'అడవిలో పరుగెత్తుతుంది. // It runs in the forest.', 'జింక ఒక జంతువు. // The deer is an animal.'],
    ],
  }),
]);

// ============================================================ 12. తోటతల్లి (song — environment)
const ch12 = unit(12, 'ch12', 'తోటతల్లి // Mother garden', [
  obj({
    id: 'ts3.te.thota.song', title: 'తోట — అమ్మ లాంటిది // A garden is like a mother', hint: 'అమ్మ లాగే తోట మనకు ఏమేమి ఇస్తుందో ఆలోచించు. // Think what a garden gives us, just like a mother.',
    intro: [
      P('"తోటతల్లి" గేయం తోటను తల్లితో పోలుస్తుంది. అమ్మ మనకు ఆహారం, ప్రేమ ఇచ్చినట్లే తోట కూడా పండ్లు, కూరగాయలు, పూలు, నీడ, చల్లని గాలి ఇస్తుంది. మనం తోటను ప్రేమగా చూసుకోవాలి. // The song compares a garden to a mother: it gives fruit, vegetables, flowers, shade and cool air. We must care for it lovingly.'),
      PH('🌳', 'చెట్టు నీడ — అమ్మ ఒడి లాంటిది. // A tree\'s shade is like mother\'s lap.'),
      POEM(['పువ్వులిచ్చే తోటమ్మ,', 'పండ్లు ఇచ్చే తోటమ్మ,', 'నీడనిచ్చే తోటమ్మ,', 'నీకు నీళ్ళు పోస్తాం రమ్మ!'], 'Garden mother who gives flowers, fruit and shade — we will water you, come! (our own rhyme)'),
      TIP('ఇంట్లో ఒక చిన్న కుండీలో మొక్క పెంచి రోజూ నీళ్ళు పోయి. // Grow a plant in a small pot and water it daily.'),
    ],
    ex: [
      EX('తోటను తల్లితో ఎందుకు పోల్చారు? // Why is the garden compared to a mother?', ['అమ్మ ఆహారం, ప్రేమ ఇస్తుంది. // Mother gives food and love.', 'తోట పండ్లు, నీడ ఇస్తుంది. // The garden gives fruit and shade.'], 'రెండూ మనకు ఇస్తాయి, కాపాడుతాయి // both give to us and protect us'),
      EX('తోటకు మనం ఏం ఇవ్వాలి? // What must we give the garden?', ['మన పాట చివరి వరుస. // The last line of our rhyme.'], 'నీళ్ళు, ప్రేమ, జాగ్రత్త // water, love and care'),
    ],
    order: ['మొక్క పెరిగే క్రమం పెట్టు // Put the stages of a growing plant in order', [
      ['విత్తనం=seed', 'మొలక=sprout', 'మొక్క=plant', 'పువ్వు=flower', 'పండు=fruit'],
      ['గుంత తవ్వు=dig a hole', 'విత్తనం నాటు=sow the seed', 'నీళ్ళు పోయి=water it', 'మొలక వస్తుంది=a sprout comes'],
      ['పువ్వులిచ్చే తోటమ్మ=gives flowers', 'పండ్లు ఇచ్చే తోటమ్మ=gives fruit', 'నీడనిచ్చే తోటమ్మ=gives shade', 'నీకు నీళ్ళు పోస్తాం రమ్మ=we will water you'],
    ]],
    mcq: [
      ['తోట మనకు ఏమిస్తుంది? // What does a garden give us?', 'పండ్లు, పూలు=fruit and flowers', ['ప్లాస్టిక్=plastic', 'పొగ=smoke', 'చెత్త=rubbish'], 'పాట గుర్తు చేసుకో. // Remember the rhyme.', 'తోట పండ్లు, పూలు, నీడ ఇస్తుంది. // A garden gives fruit, flowers and shade.'],
      ['ఎండలో చెట్టు ఏమిస్తుంది? // What does a tree give in the hot sun?', 'నీడ=shade', ['వేడి=heat', 'వాన=rain', 'మంచు=snow'], 'చెట్టు కింద కూర్చుంటే … // Sitting under a tree …', 'చెట్టు చల్లని నీడ ఇస్తుంది. // A tree gives cool shade.'],
      ['తోటను చూసుకునే వ్యక్తి? // The person who looks after a garden?', 'తోటమాలి=gardener', ['దర్జీ=tailor', 'వంటవాడు=cook', 'డ్రైవర్=driver'], 'తోట + మాలి. // garden + keeper.', 'తోటమాలి తోటను చూసుకుంటాడు. // A gardener tends the garden.'],
      ['మొక్కకు రోజూ ఏం కావాలి? // What does a plant need every day?', 'నీళ్ళు, ఎండ=water and sunlight', ['చీకటి=darkness', 'ప్లాస్టిక్=plastic', 'ఉప్పు=salt'], 'మనకు ఆహారం కావాలి, మొక్కకు … // We need food; a plant needs …', 'మొక్కకు నీళ్ళు, ఎండ, గాలి కావాలి. // A plant needs water, sun and air.'],
      ['"తోటతల్లి" అంటే? // What does తోటతల్లి mean?', 'అమ్మ లాంటి తోట=a garden like a mother', ['తోటలో ఉన్న అమ్మ=a mother in a garden', 'తల్లి కోసిన తోట=a garden cut by mother', 'తోట అమ్మకం=selling a garden'], 'పోలిక. // A comparison.', 'తోటతల్లి = తల్లి లాగా మనల్ని పోషించే తోట. // A garden that nourishes us like a mother.'],
    ],
  }),
  obj({
    id: 'ts3.te.thota.parts', title: 'మొక్క భాగాలు // Parts of a plant', hint: 'ఆ భాగం నేల కిందా, పైనా? // Is the part under the soil or above it?',
    intro: [
      P('మొక్క భాగాలు: వేరు (root — నేల కింద, నీళ్ళు పీలుస్తుంది), కాండం (stem — మొక్కను నిలబెడుతుంది), ఆకు (leaf — ఆహారం తయారు చేస్తుంది), పువ్వు (flower), కాయ / పండు (fruit), విత్తనం (seed). // Plant parts: root, stem, leaf, flower, fruit, seed.'),
      PH('🌱', 'మొలకలో వేరు, కాండం, ఆకులు — అన్నీ చిన్నగా! // A sprout has a tiny root, stem and leaves.'),
      TIP('మనం తినే భాగాలు: క్యారెట్ — వేరు, ఆకుకూర — ఆకు, మామిడి — పండు. // We eat roots (carrot), leaves (greens) and fruits (mango).'),
      KEYS('వేరు = root // root', 'కాండం = stem // stem', 'ఆకు = leaf // leaf'),
    ],
    ex: [
      EX('నేల నుండి నీళ్ళు పీల్చే భాగం? // Which part drinks water from the soil?', ['ఇది నేల కింద ఉంటుంది. // It is under the soil.'], 'వేరు // root'),
      EX('క్యారెట్ మొక్కలో ఏ భాగం? // A carrot is which part of the plant?', ['నేల కింద నుండి తీస్తాం. // We pull it from the soil.'], 'వేరు // root'),
    ],
    match: ['మొక్క భాగాన్ని దాని పనితో కలుపు // Match each plant part to its job', [
      ['వేరు=root', 'నీళ్ళు పీలుస్తుంది=drinks water'], ['కాండం=stem', 'నిలబెడుతుంది=holds the plant up'], ['ఆకు=leaf', 'ఆహారం తయారీ=makes food'], ['పువ్వు=flower', 'కాయగా మారుతుంది=becomes fruit'], ['విత్తనం=seed', 'కొత్త మొక్క=new plant'],
    ]],
    mcq: [
      ['మొక్కను నిటారుగా నిలబెట్టే భాగం? // Which part holds the plant upright?', 'కాండం=stem', ['ఆకు=leaf', 'పువ్వు=flower', 'విత్తనం=seed'], 'చెట్టుకు ఇది మొద్దు. // In a tree it is the trunk.', 'కాండం మొక్కను నిలబెడుతుంది. // The stem holds the plant up.'],
      ['ఆకుకూర మొక్కలో ఏ భాగం? // Leafy greens are which part?', 'ఆకు=leaf', ['వేరు=root', 'కాండం=stem', 'విత్తనం=seed'], 'పేరులోనే ఉంది. // It is in the name.', 'ఆకుకూరలో ఆకులు తింటాం. // We eat the leaves.'],
      ['కొత్త మొక్క దేని నుండి వస్తుంది? // A new plant grows from?', 'విత్తనం=seed', ['ఆకు=leaf', 'పువ్వు=flower', 'కొమ్మ=branch'], 'మట్టిలో నాటుతాం. // We sow it in soil.', 'విత్తనం నుండి కొత్త మొక్క వస్తుంది. // A seed grows into a new plant.'],
      ['మామిడి మొక్కలో ఏ భాగం? // A mango is which part?', 'పండు=fruit', ['వేరు=root', 'ఆకు=leaf', 'కాండం=stem'], 'తీయగా ఉంటుంది. // It is sweet.', 'మామిడి ఒక పండు. // A mango is a fruit.'],
      ['నేల కింద ఉండే భాగం? // Which part is under the ground?', 'వేరు=root', ['పువ్వు=flower', 'ఆకు=leaf', 'పండు=fruit'], 'మనం చూడలేం. // We cannot see it.', 'వేరు నేల కింద ఉంటుంది. // The root is underground.'],
    ],
  }),
  obj({
    id: 'ts3.te.thota.verbs', title: 'పని పదాలు (క్రియలు) // Action words', hint: 'ఆ పదం ఏదైనా పని చేయడాన్ని చెబుతోందా? // Does the word tell about doing something?',
    intro: [
      P('ఒక పని చేయడాన్ని చెప్పే పదాలను క్రియలు (పని పదాలు) అంటారు: నాటు (plant), పోయు (pour), తవ్వు (dig), కోయు (pick/cut), తిను (eat), ఆడు (play), పాడు (sing). // Words for doing things are verbs: plant, pour, dig, pick, eat, play, sing.'),
      PH('🪣', 'బకెట్‌తో నీళ్ళు పోస్తాం — "పోయడం" ఒక పని. // We pour water with a bucket — pouring is an action.'),
      P('ఉదా: రైతు విత్తనం నాటాడు. సీత మొక్కకు నీళ్ళు పోసింది. మేము పండ్లు కోశాము. // e.g. The farmer planted a seed. Sita watered the plant. We picked fruit.'),
      TIP('"ఏం చేశాడు? / ఏం చేసింది?" అని అడుగు — జవాబే క్రియ. // Ask "what did they do?" — the answer is the verb.'),
    ],
    ex: [
      EX('"సీత మొక్కకు నీళ్ళు పోసింది" — పని పదం? // The action word in "Sita poured water for the plant"?', ['సీత ఏం చేసింది? // What did Sita do?'], 'పోసింది // poured'),
      EX('గుంత చేయడానికి మట్టిని ఏం చేస్తాం? // What do we do to soil to make a hole?', ['పార తో … // With a spade …'], 'తవ్వుతాం // dig'),
    ],
    tap: ['పని పదాలను (క్రియలను) ఎంచుకో // Tap the action words', [
      ['నాటు=plant', true], ['తవ్వు=dig', true], ['పోయు=pour', true], ['కోయు=pick', true], ['పాడు=sing', true],
      ['తోట=garden', false], ['పువ్వు=flower', false], ['పచ్చని=green', false], ['విత్తనం=seed', false],
    ], 'నాటు, తవ్వు, పోయు, కోయు, పాడు — పనులు. తోట, పువ్వు, విత్తనం — పేర్లు; పచ్చని — వర్ణన. // Actions are verbs; the others name or describe.'],
    mcq: [
      ['"రైతు విత్తనం నాటాడు" — పని పదం? // The action word in "The farmer planted a seed"?', 'నాటాడు=planted', ['రైతు=farmer', 'విత్తనం=seed', 'ఏదీ కాదు=none'], 'రైతు ఏం చేశాడు? // What did the farmer do?', '"నాటాడు" పని పదం. // నాటాడు is the verb.'],
      ['పండిన మామిడి పండ్లను చెట్టు నుండి ఏం చేస్తాం? // What do we do to ripe mangoes on a tree?', 'కోస్తాం=pick', ['నాటుతాం=plant', 'తవ్వుతాం=dig', 'పాడుతాం=sing'], 'చేతితో తెంపుతాం. // We pluck them.', 'పండ్లను కోస్తాం. // We pick fruit.'],
      ['వీటిలో పని పదం ఏది? // Which is an action word?', 'పరుగెత్తు=run', ['చెట్టు=tree', 'పచ్చని=green', 'పువ్వు=flower'], 'మనం చేయగలిగేది. // Something we can do.', 'పరుగెత్తు ఒక పని. // Run is an action.'],
      ['"పక్షి పాట పాడింది" — పని పదం? // The action word in "The bird sang a song"?', 'పాడింది=sang', ['పక్షి=bird', 'పాట=song', 'ఏదీ కాదు=none'], 'పక్షి ఏం చేసింది? // What did the bird do?', '"పాడింది" పని పదం. // పాడింది is the verb.'],
      ['మొక్కకు నీళ్ళు ___ . // Water ___ to the plant.', 'పోయాలి=must pour', ['తినాలి=must eat', 'కోయాలి=must cut', 'తవ్వాలి=must dig'], 'బకెట్‌తో … // With a bucket …', 'మొక్కకు నీళ్ళు పోయాలి. // We must pour water for the plant.'],
    ],
  }),
]);

// ============================================================ 12*. పక్షులు (song — environment)
const ch12s = unit('12*', 'ch12s', 'పక్షులు // Birds', [
  obj({
    id: 'ts3.te.pakshi.names', title: 'మన చుట్టూ పక్షులు // Birds around us', hint: 'ఆ పక్షి రంగు, అరుపు గుర్తు చేసుకో. // Recall the bird\'s colour and call.',
    intro: [
      P('"పక్షులు" గేయం మన చుట్టూ ఉన్న పక్షుల అందాన్ని చెబుతుంది: చిలుక (parrot), కాకి (crow), పిచ్చుక (sparrow), నెమలి (peacock), పావురం (pigeon), కోయిల (cuckoo), గుడ్లగూబ (owl), బాతు (duck), కోడి (hen). // The song "Birds" celebrates the birds around us.'),
      PH('🦜', 'చిలుక — పచ్చని రెక్కలు, ఎర్రని ముక్కు. // Parrot — green wings, red beak.'),
      POEM(['చిలుకమ్మ పలుకు చిలిపి పలుకు,', 'కోయిలమ్మ పాట కమ్మని పాట,', 'నెమలమ్మ ఆట నాట్యపు ఆట,', 'పిచ్చుకమ్మ గూడు పుల్లల గూడు!'], 'The parrot\'s playful talk, the cuckoo\'s sweet song, the peacock\'s dance, the sparrow\'s twig nest! (our own rhyme)'),
      P('జానపద పాట (అందరిదీ): "చిట్టి చిలకమ్మా, అమ్మ కొట్టిందా? తోట కెళ్ళావా, పండు తెచ్చావా?" // A traditional public-domain rhyme: "Little parrot, did mother scold you? Did you go to the garden and bring a fruit?"'),
    ],
    ex: [
      EX('తీయని పాట పాడే పక్షి? // Which bird sings a sweet song?', ['వసంతకాలంలో "కుహూ కుహూ". // "Kuhoo" in spring.'], 'కోయిల // cuckoo'),
      EX('రాత్రి మేల్కొని ఉండే పక్షి? // Which bird stays awake at night?', ['పెద్ద గుండ్రని కళ్ళు. // Big round eyes.'], 'గుడ్లగూబ // owl'),
    ],
    pic: [
      ['"చిలుక" ఏది? // Which is the parrot?', ['🦜', 'చిలుక=parrot'], [['🐦‍⬛', 'కాకి=crow'], ['🦉', 'గుడ్లగూబ=owl']], 'పచ్చని రంగు. // Green in colour.', 'చిలుక 🦜 పచ్చగా ఉంటుంది. // The parrot is green.'],
      ['"గుడ్లగూబ" ఏది? // Which is the owl?', ['🦉', 'గుడ్లగూబ=owl'], [['🦆', 'బాతు=duck'], ['🕊️', 'పావురం=dove']], 'పెద్ద కళ్ళు, రాత్రి పక్షి. // Big eyes, a night bird.', 'గుడ్లగూబ 🦉 రాత్రి చూస్తుంది. // The owl sees at night.'],
      ['"బాతు" ఏది? // Which is the duck?', ['🦆', 'బాతు=duck'], [['🐓', 'కోడి=rooster'], ['🦚', 'నెమలి=peacock']], 'నీటిలో ఈదుతుంది. // It swims.', 'బాతు 🦆 చెరువులో ఈదుతుంది. // The duck swims in the pond.'],
      ['"పావురం" ఏది? // Which is the dove/pigeon?', ['🕊️', 'పావురం=dove'], [['🦜', 'చిలుక=parrot'], ['🐦‍⬛', 'కాకి=crow']], 'శాంతికి గుర్తు, తెల్లని పక్షి. // White bird of peace.', 'పావురం 🕊️ శాంతికి గుర్తు. // The dove is a sign of peace.'],
      ['"కాకి" ఏది? // Which is the crow?', ['🐦‍⬛', 'కాకి=crow'], [['🦢', 'హంస=swan'], ['🦜', 'చిలుక=parrot']], 'నల్లని పక్షి. // A black bird.', 'కాకి 🐦‍⬛ నల్లగా ఉంటుంది. // The crow is black.'],
      ['"హంస" ఏది? // Which is the swan?', ['🦢', 'హంస=swan'], [['🐦‍⬛', 'కాకి=crow'], ['🦉', 'గుడ్లగూబ=owl']], 'తెల్లని, పొడవు మెడ. // White with a long neck.', 'హంస 🦢 తెల్లగా ఉంటుంది. // The swan is white.'],
    ],
    mcq: [
      ['మనుషుల మాటలను అనుకరించే పక్షి? // Which bird copies human words?', 'చిలుక=parrot', ['కాకి=crow', 'గుడ్లగూబ=owl', 'బాతు=duck'], '"చిలుక పలుకులు". // "Parrot talk".', 'చిలుక మాటలు అనుకరిస్తుంది. // The parrot copies words.'],
      ['మన జాతీయ పక్షి? // Our national bird?', 'నెమలి=peacock', ['కాకి=crow', 'పిచ్చుక=sparrow', 'కోడి=hen'], 'పురి విప్పి ఆడుతుంది. // It dances with feathers open.', 'నెమలి భారత జాతీయ పక్షి. // The peacock is India\'s national bird.'],
      ['పక్షులు గుడ్లు పెట్టి ఎక్కడ పొదుగుతాయి? // Where do birds lay and hatch eggs?', 'గూడు=nest', ['పుట్ట=anthill', 'గుహ=den', 'కలుగు=burrow'], 'పుల్లలతో కడతాయి. // Built of twigs.', 'పక్షులు గూడులో గుడ్లు పెడతాయి. // Birds lay eggs in nests.'],
      ['చిన్న, గోధుమ రంగు, ఇంటి దగ్గర కిచకిచలాడే పక్షి? // A small brown bird chirping near homes?', 'పిచ్చుక=sparrow', ['నెమలి=peacock', 'హంస=swan', 'గుడ్లగూబ=owl'], 'దయ పాఠంలో సీత దీనికి నీళ్ళు పెట్టింది. // Sita gave it water in the kindness lesson.', 'పిచ్చుక చిన్న పక్షి. // The sparrow is a small bird.'],
      ['పక్షులకు ఎగరడానికి ఏం సాయపడతాయి? // What help birds fly?', 'రెక్కలు=wings', ['కాళ్ళు=legs', 'ముక్కు=beak', 'కళ్ళు=eyes'], 'ఈకలతో ఉంటాయి. // They have feathers.', 'రెక్కలతో పక్షులు ఎగురుతాయి. // Birds fly with wings.'],
    ],
  }),
  obj({
    id: 'ts3.te.pakshi.features', title: 'పక్షుల ప్రత్యేకతలు // What makes each bird special', hint: 'ఆ పక్షి గురించి నీకు గుర్తున్న ఒక ప్రత్యేక విషయం ఆలోచించు. // Think of one special thing about that bird.',
    intro: [
      P('ప్రతి పక్షికి ఒక ప్రత్యేకత: కోయిల — తీయని పాట; నెమలి — నాట్యం; చిలుక — మాటలు; గుడ్లగూబ — రాత్రి చూపు; బాతు — ఈత; కాకి — తెలివి, శుభ్రం చేయడం; పిచ్చుక — చిన్న గూడు; పావురం — శాంతి. // Each bird is special: cuckoo – song, peacock – dance, parrot – talk, owl – night sight, duck – swimming, crow – cleverness, sparrow – tiny nest, dove – peace.'),
      PH('🪶', 'పక్షుల ఈకలు రకరకాల రంగుల్లో. // Bird feathers come in many colours.'),
      TIP('పక్షులను పంజరంలో బంధించకూడదు — అవి ఆకాశంలో స్వేచ్ఛగా ఎగరాలి. // Do not cage birds — they should fly free.'),
    ],
    ex: [
      EX('కాకిని "ప్రకృతి శుభ్రం చేసే పక్షి" అని ఎందుకు అంటారు? // Why is the crow called nature\'s cleaner?', ['కాకి మిగిలిపోయిన ఆహారం తిని పరిసరాలు శుభ్రం చేస్తుంది. // It eats leftover scraps.'], 'మిగిలిన ఆహారం తింటుంది // it eats leftover food'),
      EX('పక్షులను పంజరంలో పెట్టవచ్చా? // Should we keep birds in cages?', ['పక్షులకు స్వేచ్ఛ ఇష్టం. // Birds love freedom.'], 'పెట్టకూడదు // no'),
    ],
    match: ['పక్షిని దాని ప్రత్యేకతతో కలుపు // Match each bird to what it is known for', [
      ['కోయిల=cuckoo', 'తీయని పాట=sweet song'], ['నెమలి=peacock', 'నాట్యం=dance'], ['చిలుక=parrot', 'మాటలు=talking'], ['గుడ్లగూబ=owl', 'రాత్రి చూపు=night sight'], ['బాతు=duck', 'ఈత=swimming'], ['పావురం=dove', 'శాంతి=peace'],
    ]],
    mcq: [
      ['నీటిలో ఈదే పక్షి? // Which bird swims?', 'బాతు=duck', ['కాకి=crow', 'చిలుక=parrot', 'పిచ్చుక=sparrow'], 'కాళ్ళకు చర్మం తెడ్లలా. // Webbed feet.', 'బాతు బాగా ఈదుతుంది. // The duck swims well.'],
      ['పక్షులను ఎలా చూసుకోవాలి? // How should we treat birds?', 'స్వేచ్ఛగా ఎగరనివ్వాలి=let them fly free', ['పంజరంలో పెట్టాలి=cage them', 'రాళ్ళు వేయాలి=throw stones', 'గూళ్ళు తీయాలి=take nests'], 'పక్షి సంతోషం ఎక్కడ? // Where is a bird happy?', 'పక్షులను స్వేచ్ఛగా ఎగరనివ్వాలి. // Let birds fly free.'],
      ['వసంతకాలంలో "కుహూ" అని పాడేది? // Who sings "kuhoo" in spring?', 'కోయిల=cuckoo', ['కాకి=crow', 'బాతు=duck', 'కోడి=hen'], 'నల్లని, తీయని గొంతు. // Black, with a sweet voice.', 'కోయిల కుహూ కుహూ అని పాడుతుంది. // The cuckoo sings kuhoo.'],
      ['ఉదయమే "కొక్కొరొకో" అని లేపేది? // Who wakes us with "kokkoroko"?', 'కోడిపుంజు=rooster', ['గుడ్లగూబ=owl', 'హంస=swan', 'పావురం=dove'], 'పొలం దగ్గర ఇళ్ళలో. // In village homes.', 'కోడిపుంజు ఉదయమే అరుస్తుంది. // The rooster crows at dawn.'],
      ['పక్షి నోటిలో గట్టి భాగం? // The hard part of a bird\'s mouth?', 'ముక్కు=beak', ['రెక్క=wing', 'ఈక=feather', 'తోక=tail'], 'గింజలు పొడుస్తుంది. // It pecks grains.', 'పక్షి ముక్కుతో తింటుంది. // A bird eats with its beak.'],
    ],
  }),
  obj({
    id: 'ts3.te.pakshi.ottulu', title: 'ఒత్తులు // Joined letters (ottulu)', hint: 'పదాన్ని నెమ్మదిగా పలుకు — ఏ హల్లు రెండుసార్లు గట్టిగా వినిపిస్తుంది? // Say it slowly — which consonant sounds doubled?',
    intro: [
      P('ఒక హల్లు కింద ఇంకో హల్లు చిన్న రూపంలో చేరితే అది ఒత్తు. పిచ్చుక (చ్చ), అమ్మ (మ్మ), పిల్లి (ల్లి), చెట్టు (ట్టు), పక్షి (క్ష). // When a small consonant sits under another, it is an ottu: పిచ్చుక, అమ్మ, పిల్లి, చెట్టు, పక్షి.'),
      PH('🐦', 'పి-చ్చు-క: "చ్చ" లో చ రెండుసార్లు. // In పిచ్చుక, చ is doubled.'),
      P('ఒకే హల్లు రెండుసార్లు వస్తే ద్విత్వాక్షరం (అమ్మ, అక్క); వేరు హల్లులు కలిస్తే సంయుక్తాక్షరం (పక్షి = క + ష, స్నేహం = స + న). // Same consonant doubled = dvitva (అమ్మ, అక్క); two different = samyukta (పక్షి, స్నేహం).'),
      TIP('ఒత్తు ఉన్న చోట ధ్వనిని కొంచెం ఆపి, గట్టిగా పలుకు: అ-మ్మ, అ-క్క. // Pause and press at the ottu: am-ma, ak-ka.'),
    ],
    ex: [
      EX('"అక్క" లో ఒత్తు ఏ హల్లుది? // In అక్క, which consonant is doubled?', ['అ-క్క: క రెండుసార్లు. // క twice.'], 'క // క'),
      EX('"పక్షి" లో కలిసిన హల్లులు? // Which consonants join in పక్షి?', ['క్ష = క + ష. // క్ష is క + ష.'], 'క, ష // క and ష'),
    ],
    tap: ['ఒత్తు ఉన్న పదాలను ఎంచుకో // Tap the words that have an ottu', [
      ['పిచ్చుక=sparrow', true], ['అమ్మ=mother', true], ['పిల్లి=cat', true], ['చెట్టు=tree', true], ['పక్షి=bird', true], ['అక్క=elder sister', true],
      ['కాకి=crow', false], ['చిలుక=parrot', false], ['నెమలి=peacock', false], ['బాతు=duck', false],
    ], 'పిచ్చుక, అమ్మ, పిల్లి, చెట్టు, పక్షి, అక్క — ఒత్తులు ఉన్నాయి. కాకి, చిలుక, నెమలి, బాతు — ఒత్తులు లేవు. // The first group has joined letters; the second does not.'],
    mcq: [
      ['"పిల్లి" లో ఒత్తు? // The ottu in పిల్లి?', 'ల్లి', ['పి', 'లి', 'పిల'], 'ల రెండుసార్లు. // ల twice.', 'పి-ల్లి: "ల్లి" లో ఒత్తు. // ల్లి has the ottu.'],
      ['వీటిలో ఒత్తు ఉన్న పదం? // Which word has an ottu?', 'చెట్టు=tree', ['కాకి=crow', 'బాతు=duck', 'ఆకు=leaf'], 'నెమ్మదిగా పలికి చూడు. // Say each slowly.', 'చె-ట్టు: "ట్టు" లో ఒత్తు. // చెట్టు has ట్టు.'],
      ['"అమ్మ" లో ఏ హల్లు రెండుసార్లు? // In అమ్మ, which consonant is doubled?', 'మ', ['అ', 'న', 'ప'], 'అ-మ్మ. // am-ma.', '"మ్మ" లో మ రెండుసార్లు. // మ is doubled.'],
      ['"పక్షి" లో "క్ష" ఎలా వచ్చింది? // How is క్ష formed in పక్షి?', 'క + ష', ['క + క', 'ప + ష', 'స + క'], 'రెండు వేరు హల్లులు. // Two different consonants.', 'క్ష = క + ష. // క్ష = క + ష.'],
      ['"ఒత్తు" లేని పదం ఏది? // Which word has NO ottu?', 'చిలుక=parrot', ['పిచ్చుక=sparrow', 'అక్క=elder sister', 'బొమ్మ=doll'], 'ప్రతి అక్షరం ఒంటరిగా ఉందా చూడు. // Check that each letter is single.', 'చి-లు-క — ఒత్తు లేదు. // చిలుక has no joined letter.'],
    ],
  }),
]);

// ============================================================ 13. మహాత్ముడు (essay — inspiration)
const ch13 = unit(13, 'ch13', 'మహాత్ముడు // The Mahatma', [
  obj({
    id: 'ts3.te.gandhi.life', title: 'గాంధీజీ జీవితం // The life of Gandhiji', hint: 'గాంధీజీని ఇంకా ఏ పేర్లతో పిలుస్తారో, ఏం చేశారో గుర్తు చేసుకో. // Recall Gandhiji\'s other names and what he did.',
    intro: [
      P('మహాత్మా గాంధీ పూర్తి పేరు మోహన్‌దాస్ కరంచంద్ గాంధీ. ఆయన 1869 అక్టోబర్ 2 న గుజరాత్‌లోని పోర్‌బందర్‌లో పుట్టారు. మన దేశానికి స్వాతంత్ర్యం తేవడానికి సత్యం, అహింస అనే మార్గంలో పోరాడారు. // Mahatma Gandhi (Mohandas Karamchand Gandhi) was born on 2 October 1869 in Porbandar, Gujarat. He led India\'s freedom struggle through truth and non-violence.'),
      PH('👴', 'గాంధీజీని ప్రేమగా "బాపూ" అని పిలుస్తాం. // We lovingly call Gandhiji "Bapu".'),
      P('మనం ఆయనను "జాతిపిత" (Father of the Nation) అంటాం. అక్టోబర్ 2 న గాంధీ జయంతి జరుపుకుంటాం. ఆయన రాట్నం (చరఖా) మీద నూలు వడికి, సొంత బట్టలు నేసుకోమని చెప్పారు. // He is called Father of the Nation; 2 October is Gandhi Jayanti. He spun yarn on the charkha and encouraged homemade cloth.'),
      TIP('"మహాత్ముడు" = గొప్ప ఆత్మ ఉన్నవాడు. // "Mahatma" means great soul.'),
    ],
    ex: [
      EX('గాంధీ జయంతి ఎప్పుడు? // When is Gandhi Jayanti?', ['గాంధీజీ పుట్టినరోజు. // Gandhiji\'s birthday.'], 'అక్టోబర్ 2 // 2 October'),
      EX('గాంధీజీని ప్రేమగా ఏమని పిలుస్తాం? // What do we lovingly call Gandhiji?', ['"నాన్న" అనే అర్థం వచ్చే మాట. // A word meaning "father".'], 'బాపూ // Bapu'),
    ],
    mcq: [
      ['గాంధీజీ ఎక్కడ పుట్టారు? // Where was Gandhiji born?', 'పోర్‌బందర్=Porbandar', ['హైదరాబాదు=Hyderabad', 'ఢిల్లీ=Delhi', 'చెన్నై=Chennai'], 'గుజరాత్‌లోని సముద్ర తీర పట్టణం. // A coastal town in Gujarat.', 'గాంధీజీ పోర్‌బందర్‌లో పుట్టారు. // Gandhiji was born in Porbandar.'],
      ['గాంధీజీని "జాతిపిత" అని ఎందుకు అంటారు? // Why is Gandhiji called Father of the Nation?', 'స్వాతంత్ర్య పోరాటానికి నాయకత్వం వహించారు=he led the freedom struggle', ['రాజు కాబట్టి=he was a king', 'పాటలు రాశారు=he wrote songs', 'ఆటగాడు=he was a sportsman'], 'దేశానికి స్వేచ్ఛ. // Freedom for India.', 'దేశ స్వాతంత్ర్యం కోసం నడిపించారు. // He led India to freedom.'],
      ['గాంధీజీ నూలు వడికిన యంత్రం? // The wheel Gandhiji spun yarn on?', 'రాట్నం=charkha', ['సైకిల్=cycle', 'బండి=cart', 'కుండ=pot'], 'చేతితో తిప్పే చక్రం. // A hand-turned wheel.', 'రాట్నం (చరఖా) మీద నూలు వడికారు. // He spun on the charkha.'],
      ['గాంధీజీ నమ్మిన రెండు దారులు? // Gandhiji\'s two great paths?', 'సత్యం, అహింస=truth and non-violence', ['కోపం, గొడవ=anger and fights', 'డబ్బు, అధికారం=money and power', 'ఆట, పాట=play and song'], 'అబద్ధం చెప్పకూడదు, ఎవరినీ హింసించకూడదు. // No lies, no hurting.', 'సత్యం, అహింస — గాంధీజీ మార్గం. // Truth and non-violence were his way.'],
      ['"మహాత్మ" అంటే? // What does "Mahatma" mean?', 'గొప్ప ఆత్మ=great soul', ['పెద్ద ఇల్లు=big house', 'బలమైన రాజు=strong king', 'చిన్న పిల్లవాడు=small child'], 'మహా = గొప్ప. // maha = great.', 'మహాత్మ = గొప్ప ఆత్మ. // Mahatma = great soul.'],
    ],
    order: ['గాంధీజీ గురించి క్రమంలో పెట్టు // Put these about Gandhiji in order', [
      ['పోర్‌బందర్‌లో పుట్టారు=born in Porbandar', 'చదువుకున్నారు=studied', 'స్వాతంత్ర్యం కోసం పోరాడారు=fought for freedom', 'దేశానికి స్వాతంత్ర్యం వచ్చింది=India became free'],
    ]],
  }),
  obj({
    id: 'ts3.te.gandhi.values', title: 'గాంధీజీ నేర్పిన మంచి అలవాట్లు // Good habits Gandhiji taught', hint: 'గాంధీజీ ఈ పని మెచ్చుకుంటారా? // Would Gandhiji approve of this?',
    intro: [
      P('గాంధీజీ నేర్పినవి: సత్యం (నిజం చెప్పడం), అహింస (ఎవరినీ బాధపెట్టకపోవడం), శుభ్రత (మన చుట్టూ శుభ్రంగా ఉంచడం), సొంత పని సొంతంగా చేసుకోవడం, అందరినీ సమానంగా చూడటం. // Gandhiji taught truth, non-violence, cleanliness, doing our own work, and treating everyone as equal.'),
      PH('🙈', 'మూడు కోతుల బొమ్మ: చెడు చూడకు, చెడు వినకు, చెడు మాట్లాడకు. // The three monkeys: see no evil, hear no evil, speak no evil.'),
      TIP('ఈ రోజే ఒక మంచి పని: బడిలో చెత్త చెత్తబుట్టలో వేయి. // A good deed today: put litter in the bin.'),
      KEYS('సత్యం = truth // truth', 'అహింస = non-violence // non-violence', 'శుభ్రత = cleanliness // cleanliness'),
    ],
    ex: [
      EX('పొరపాటున గాజు గ్లాసు పగలగొట్టావు. గాంధీజీ బాటలో ఏం చేయాలి? // You broke a glass by mistake. What would Gandhiji want?', ['దాచకూడదు. // Do not hide it.', 'నిజం చెప్పి క్షమాపణ అడగాలి. // Tell the truth and say sorry.'], 'నిజం చెప్పాలి // tell the truth'),
      EX('మూడు కోతులు ఏం నేర్పుతాయి? // What do the three monkeys teach?', ['ఒకటి కళ్ళు, ఒకటి చెవులు, ఒకటి నోరు మూసుకుంటాయి. // Eyes, ears, mouth covered.'], 'చెడు చూడకు, వినకు, మాట్లాడకు // see, hear, speak no evil'),
    ],
    tap: ['గాంధీజీ మెచ్చుకునే పనులను ఎంచుకో // Tap what Gandhiji would like', [
      ['నిజం చెప్పడం=telling the truth', true], ['చెత్త బుట్టలో వేయడం=using the bin', true], ['స్నేహితుడితో శాంతిగా మాట్లాడడం=talking calmly', true], ['నా పనులు నేనే చేసుకోవడం=doing my own work', true], ['అందరితో కలిసి ఆడటం=playing with everyone', true],
      ['అబద్ధం చెప్పడం=lying', false], ['కొట్టుకోవడం=fighting', false], ['రోడ్డు మీద చెత్త వేయడం=littering', false],
    ], 'సత్యం, శుభ్రత, శాంతి, సొంత పని, సమానత్వం — గాంధీజీ బాట. // Truth, cleanliness, peace, self-help and equality are his way.'],
    mcq: [
      ['"అహింస" అంటే? // What is అహింస?', 'ఎవరినీ బాధపెట్టకపోవడం=not hurting anyone', ['గొడవ పడటం=fighting', 'అబద్ధం=lying', 'సోమరితనం=laziness'], '"హింస" కానిది. // Not violence.', 'అహింస = non-violence.  // అహింస means not hurting anyone.'],
      ['స్నేహితుడితో గొడవ వస్తే? // If you quarrel with a friend?', 'శాంతిగా మాట్లాడుకోవాలి=talk it out calmly', ['కొట్టాలి=hit', 'తిట్టాలి=shout insults', 'మాట్లాడకూడదు ఎప్పటికీ=never talk again'], 'అహింస గుర్తుందా? // Remember non-violence.', 'శాంతిగా మాట్లాడి సమస్య తీర్చుకోవాలి. // Settle it by calm talk.'],
      ['బడిని శుభ్రంగా ఉంచడానికి? // To keep school clean?', 'చెత్త బుట్టలో వేయాలి=put litter in the bin', ['నేల మీద వేయాలి=drop it on the floor', 'కిటికీ బయట విసరాలి=throw it out of the window', 'బెంచి కింద దాచాలి=hide it under the bench'], 'శుభ్రత గాంధీజీకి ఇష్టం. // Gandhiji loved cleanliness.', 'చెత్త బుట్టలోనే వేయాలి. // Litter goes in the bin.'],
      ['"సత్యం" అంటే? // What is సత్యం?', 'నిజం=truth', ['అబద్ధం=lie', 'కోపం=anger', 'భయం=fear'], 'అబద్ధానికి వ్యతిరేకం. // Opposite of a lie.', 'సత్యం = నిజం. // సత్యం means truth.'],
      ['మూడు కోతుల్లో నోరు మూసుకున్న కోతి ఏం చెబుతుంది? // The monkey covering its mouth says?', 'చెడు మాట్లాడకు=speak no evil', ['చెడు చూడకు=see no evil', 'చెడు వినకు=hear no evil', 'ఎక్కువ తిను=eat more'], 'నోరు = మాట. // mouth = speech.', 'నోరు మూసిన కోతి — చెడు మాట్లాడకు. // Mouth covered: speak no evil.'],
    ],
  }),
  obj({
    id: 'ts3.te.gandhi.pronouns', title: 'పేరుకు బదులు వాడే పదాలు (సర్వనామాలు) // Words used instead of names', hint: 'ఆ పేరు అబ్బాయిదా, అమ్మాయిదా, జంతువు/వస్తువుదా, ఎక్కువ మందిదా? // Is the name a man\'s, a woman\'s, a thing\'s, or many people\'s?',
    intro: [
      P('పేరును మళ్ళీ మళ్ళీ చెప్పకుండా వాడే పదాలు సర్వనామాలు: అతడు / ఆయన (he), ఆమె / ఆవిడ (she), అది (it), వారు / వాళ్ళు (they), నేను (I), మేము / మనం (we), నువ్వు / మీరు (you). // Pronouns replace names: he, she, it, they, I, we, you.'),
      PH('🧑‍🏫', '"గాంధీజీ గొప్పవారు. ఆయన సత్యం చెప్పారు." — "ఆయన" = గాంధీజీ. // "Ayana" stands for Gandhiji.'),
      TIP('పెద్దలకు గౌరవంగా "ఆయన", "ఆవిడ", "మీరు" వాడతాం. // For elders we use the respectful ఆయన, ఆవిడ, మీరు.'),
    ],
    ex: [
      EX('"సీత పాట పాడింది. ___ బాగా పాడింది." // Sita sang. ___ sang well.', ['సీత అమ్మాయి. // Sita is a girl.'], 'ఆమె // she'),
      EX('"పిల్లి పాలు తాగింది. ___ నిద్రపోయింది." // The cat drank milk. ___ slept.', ['పిల్లి జంతువు. // A cat is an animal.'], 'అది // it'),
    ],
    mcq: [
      ['"రవి బడికి వెళ్ళాడు. ___ బాగా చదువుతాడు." // Ravi went to school. ___ studies well.', 'అతడు=he', ['ఆమె=she', 'అది=it', 'వారు=they'], 'రవి అబ్బాయి. // Ravi is a boy.', 'అబ్బాయికి "అతడు". // అతడు for a boy.'],
      ['"పిల్లలు ఆడుతున్నారు. ___ సంతోషంగా ఉన్నారు." // The children are playing. ___ are happy.', 'వారు=they', ['అతడు=he', 'ఆమె=she', 'అది=it'], 'ఎక్కువ మంది. // Many people.', 'ఎక్కువ మందికి "వారు". // వారు for many.'],
      ['"బంతి ఎరుపు. ___ గుండ్రంగా ఉంది." // The ball is red. ___ is round.', 'అది=it', ['ఆమె=she', 'అతడు=he', 'మేము=we'], 'బంతి ఒక వస్తువు. // A ball is a thing.', 'వస్తువుకు "అది". // అది for a thing.'],
      ['"మీనా నా స్నేహితురాలు. ___ బొమ్మలు గీస్తుంది." // Meena is my friend. ___ draws pictures.', 'ఆమె=she', ['అతడు=he', 'అది=it', 'వారు=they'], 'మీనా అమ్మాయి. // Meena is a girl.', 'అమ్మాయికి "ఆమె". // ఆమె for a girl.'],
      ['"గాంధీజీ మహాత్ముడు. ___ సత్యం చెప్పారు." (గౌరవంగా) // Gandhiji was great. ___ spoke the truth. (respectfully)', 'ఆయన=he (respectful)', ['అది=it', 'వాడు=he (casual)', 'ఆమె=she'], 'పెద్దవారికి గౌరవ పదం. // A respectful word for elders.', 'పెద్దవారికి "ఆయన". // ఆయన for a respected man.'],
      ['నా గురించి నేను చెప్పేటప్పుడు? // When I talk about myself, I say?', 'నేను=I', ['నువ్వు=you', 'అతడు=he', 'వారు=they'], 'నా పేరుకు బదులు. // Instead of my name.', 'నా గురించి "నేను". // నేను means I.'],
    ],
    match: ['సర్వనామాన్ని దాని అర్థంతో కలుపు // Match each pronoun to its meaning', [
      ['నేను', 'I'], ['నువ్వు', 'you'], ['అతడు', 'he'], ['ఆమె', 'she'], ['అది', 'it'], ['వారు', 'they'], ['మేము', 'we'],
    ]],
  }),
]);

// ============================================================ 13*. ఆట బతుకు (song — children's interests)
const ch13s = unit('13*', 'ch13s', 'ఆట బతుకు // A life of play', [
  obj({
    id: 'ts3.te.aata.games', title: 'మన ఆటలు // Our games', hint: 'ఆ ఆటను ఎలా ఆడతారో ఊహించుకో. // Picture how the game is played.',
    intro: [
      P('"ఆట బతుకు" గేయం ఆటల సంతోషం గురించి. మన ఊళ్ళలో ఎన్నో ఆటలు ఆడతాం: కబడ్డీ, ఖో-ఖో, తొక్కుడుబిళ్ళ (కుంటాట), దాగుడుమూతలు, గోలీలు, బొంగరం, గాలిపటం, తాడాట (స్కిప్పింగ్), చెడుగుడు. // The song is about the joy of play: kabaddi, kho-kho, hopscotch, hide-and-seek, marbles, spinning top, kites, skipping.'),
      PH('⚽', 'ఆటలు శరీరానికి బలం, మనసుకు సంతోషం. // Games make the body strong and the mind happy.'),
      POEM(['ఆడుకుందాం రారండోయ్,', 'పాడుకుందాం రారండోయ్,', 'గెలిచినా ఓడినా నవ్వుదాం,', 'కలిసిమెలిసి ఉందాం రారండోయ్!'], 'Come, let us play; come, let us sing; win or lose, let us laugh; let us stay together! (our own rhyme)'),
      TIP('ఆటలో గెలుపు, ఓటమి రెండూ సహజం — ఆట నియమాలు పాటించి స్నేహంగా ఆడు. // Winning and losing are both normal — follow the rules and play as friends.'),
    ],
    ex: [
      EX('ఒకరు కళ్ళు మూసుకొని లెక్కపెడితే, మిగిలినవారు దాక్కునే ఆట? // One counts with eyes shut while others hide — which game?', ['దాగు + మూత (కళ్ళు మూయడం). // hide + closing eyes.'], 'దాగుడుమూతలు // hide-and-seek'),
      EX('గడులు గీసి ఒంటి కాలితో దూకే ఆట? // Hopping on one leg through drawn squares?', ['బిళ్ళను గడిలో వేసి కుంటుతూ దూకుతారు. // Toss a tile, hop on one leg.'], 'తొక్కుడుబిళ్ళ // hopscotch'),
    ],
    match: ['ఆటను దాని వివరణతో కలుపు // Match each game to its description', [
      ['దాగుడుమూతలు=hide-and-seek', 'దాక్కోవడం, వెతకడం=hide and find'], ['బొంగరం=top', 'తాడుతో తిప్పడం=spin with a string'], ['గోలీలు=marbles', 'గాజు గుండ్లు కొట్టడం=flick glass balls'], ['గాలిపటం=kite', 'దారంతో ఎగరేయడం=fly on a string'], ['తొక్కుడుబిళ్ళ=hopscotch', 'ఒంటి కాలితో దూకడం=hop on one leg'], ['కబడ్డీ=kabaddi', 'ఊపిరి బిగబట్టి తాకడం=tag while holding breath'],
    ]],
    mcq: [
      ['"కబడ్డీ కబడ్డీ" అంటూ ఆడే ఆట? // The game where you chant "kabaddi kabaddi"?', 'కబడ్డీ=kabaddi', ['గోలీలు=marbles', 'బొంగరం=top', 'చదరంగం=chess'], 'ఊపిరి వదలకుండా అంటారు. // Said in one breath.', 'కబడ్డీలో ఊపిరి బిగబట్టి "కబడ్డీ" అంటారు. // In kabaddi you chant in one breath.'],
      ['ఆటలు ఆడితే ఏం వస్తుంది? // What do games give us?', 'బలం, సంతోషం=strength and joy', ['జబ్బు=illness', 'కోపం=anger', 'బద్ధకం=laziness'], 'శరీరానికి వ్యాయామం. // Exercise for the body.', 'ఆటలు బలం, సంతోషం, స్నేహం ఇస్తాయి. // Games give strength, joy and friends.'],
      ['ఆటలో ఓడిపోతే ఏం చేయాలి? // What should you do if you lose a game?', 'నవ్వుతూ మళ్ళీ ప్రయత్నించాలి=smile and try again', ['ఏడవాలి=cry', 'గొడవ పడాలి=fight', 'ఆట మానేయాలి ఎప్పటికీ=quit forever'], 'మన పాట మూడో వరుస. // Line 3 of our rhyme.', 'గెలిచినా ఓడినా నవ్వుదాం! // Win or lose, let us smile!'],
      ['ఇద్దరు జట్లుగా, ఒకరి వెనుక ఒకరు కూర్చొని ఆడే పరుగు ఆట? // A running game with teams sitting in a row?', 'ఖో-ఖో=kho-kho', ['గోలీలు=marbles', 'బొంగరం=top', 'గాలిపటం=kite'], '"ఖో" అని వీపు తట్టి లేపుతారు. // Tap the back and say "kho".', 'ఖో-ఖోలో "ఖో" అంటూ పరుగెత్తుతారు. // In kho-kho you tap and say "kho".'],
      ['ఆటలో నియమాలు ఎందుకు? // Why do games have rules?', 'అందరికీ న్యాయంగా ఉండటానికి=to be fair to all', ['గెలవడానికి మోసం చేయడానికి=to cheat', 'ఆట ఆపడానికి=to stop play', 'అల్లరి చేయడానికి=to make mischief'], 'అందరూ సమానంగా ఆడాలి. // Everyone plays equally.', 'నియమాలు ఆటను న్యాయంగా చేస్తాయి. // Rules make games fair.'],
    ],
  }),
  obj({
    id: 'ts3.te.aata.team', title: 'కలిసి ఆడదాం — జట్టు స్ఫూర్తి // Playing together', hint: 'ఆ పని వల్ల జట్టులో అందరికీ సంతోషమా? // Does it make the whole team happy?',
    intro: [
      P('జట్టుగా ఆడటం అంటే అందరూ కలిసి ఒకే లక్ష్యం కోసం ఆడటం. మంచి ఆటగాడు: వంతు కోసం ఎదురుచూస్తాడు, నియమాలు పాటిస్తాడు, ఓడినవారిని ఓదారుస్తాడు, గెలిచినవారిని అభినందిస్తాడు, అందరినీ కలుపుకుంటాడు. // Team play means working together: wait your turn, follow rules, comfort losers, congratulate winners, include everyone.'),
      PH('🏅', 'పతకం కంటే స్నేహం గొప్పది. // Friendship is greater than a medal.'),
      TIP('కొత్తగా వచ్చిన పిల్లలను "మాతో ఆడతావా?" అని అడుగు. // Ask a new child, "Will you play with us?"'),
      KEYS('జట్టు = team // team', 'వంతు = turn // turn', 'అభినందన = congratulation // congratulation'),
    ],
    ex: [
      EX('ఎదుటి జట్టు గెలిస్తే ఏమనాలి? // When the other team wins, what do we say?', ['మంచి మనసుతో మెచ్చుకోవాలి. // Praise them sincerely.'], 'అభినందనలు! బాగా ఆడారు! // Congratulations! Well played!'),
      EX('నీ వంతు ఇంకా రాలేదు. ఏం చేయాలి? // Your turn has not come yet. What do you do?', ['ముందుకు తోసుకోకూడదు. // Do not push ahead.'], 'ఓపికగా ఎదురుచూడాలి // wait patiently'),
    ],
    tap: ['మంచి ఆటగాడి లక్షణాలను ఎంచుకో // Tap what a good player does', [
      ['వంతు కోసం ఎదురుచూడటం=waiting for a turn', true], ['నియమాలు పాటించడం=following rules', true], ['ఓడినవారిని ఓదార్చడం=comforting the loser', true], ['అందరినీ కలుపుకోవడం=including everyone', true], ['గెలిచినవారిని మెచ్చుకోవడం=praising the winner', true],
      ['మోసం చేయడం=cheating', false], ['తోసుకోవడం=pushing', false], ['ఓడినవారిని వెక్కిరించడం=mocking the loser', false],
    ], 'ఓపిక, న్యాయం, దయ, స్నేహం — మంచి ఆటగాడి గుణాలు. // Patience, fairness, kindness and friendship make a good player.'],
    mcq: [
      ['"జట్టు" అంటే? // What is జట్టు?', 'కలిసి ఆడే గుంపు=a team', ['ఒంటరి=alone', 'బంతి=ball', 'మైదానం=ground'], 'కబడ్డీలో ఏడుగురు. // Seven in kabaddi.', 'జట్టు = team.  // జట్టు means team.'],
      ['ఆటలో ఎవరైనా పడిపోతే? // If someone falls during play?', 'ఆట ఆపి సాయం చేయాలి=stop and help', ['నవ్వాలి=laugh', 'ఆట కొనసాగించాలి=just keep playing', 'అరవాలి=shout'], 'ఆట కంటే స్నేహితుడు ముఖ్యం. // A friend matters more than a game.', 'పడిపోయినవారికి ముందు సాయం. // Help the fallen one first.'],
      ['కొత్త పిల్లవాడు ఒంటరిగా ఉన్నాడు. ఏం చేయాలి? // A new child is alone. What should you do?', 'ఆటకు పిలవాలి=invite him to play', ['పట్టించుకోకూడదు=ignore him', 'వెళ్ళిపొమ్మనాలి=tell him to go', 'నవ్వాలి=laugh at him'], 'అందరినీ కలుపుకో. // Include everyone.', 'కొత్తవారిని ఆటలో చేర్చుకోవాలి. // Include newcomers.'],
      ['ఆటలో మోసం చేయడం? // Cheating in a game is?', 'తప్పు=wrong', ['సరైనది=right', 'తెలివి=clever', 'సరదా=fun'], 'నియమాలు అందరికీ ఒకటే. // Rules are the same for all.', 'మోసం తప్పు — న్యాయంగా ఆడాలి. // Cheating is wrong; play fair.'],
      ['"అభినందనలు" ఎప్పుడు చెబుతాం? // When do we say అభినందనలు?', 'ఎవరైనా గెలిచినప్పుడు=when someone wins', ['ఎవరైనా పడినప్పుడు=when someone falls', 'కోపం వచ్చినప్పుడు=when angry', 'నిద్రపోయేటప్పుడు=at bedtime'], 'మెచ్చుకోలు మాట. // A word of praise.', 'గెలిచినవారికి "అభినందనలు". // Congratulate the winner.'],
    ],
  }),
  obj({
    id: 'ts3.te.aata.riddles', title: 'పొడుపు కథలు — ఆలోచించే ఆట // Riddles: a thinking game', hint: 'ప్రతి ఆధారాన్ని ఒక్కొక్కటిగా చదివి, సరిపోయేదాన్ని ఊహించు. // Read each clue one at a time and guess what fits.',
    intro: [
      P('పొడుపు కథ అంటే ఆధారాలు ఇచ్చి "నేనెవరు?" అని అడిగే ఆలోచన ఆట. తెలుగులో పొడుపు కథలు చాలా ప్రసిద్ధం. విప్పితే (జవాబు చెబితే) గెలుపు! // A riddle gives clues and asks "Who am I?". Telugu riddles are famous; solving one is a win!'),
      PH('🧩', 'ఆధారాలు కలిపితే జవాబు దొరుకుతుంది. // Put the clues together to find the answer.'),
      P('ఉదా (మా పొడుపు): "ఆకాశంలో ఎగురుతాను, తోక ఉంటుంది, దారం నా ప్రాణం — నేనెవరు?" — గాలిపటం! // e.g. (our riddle) "I fly in the sky, I have a tail, a string is my life — who am I?" — a kite!'),
      TIP('ఇంట్లో అందరితో పొడుపు కథల ఆట ఆడు — నువ్వు కూడా ఒకటి తయారు చెయ్యి! // Play riddles at home — make up one of your own!'),
    ],
    ex: [
      EX('"గుండ్రంగా ఉంటాను, కాలితో తన్నితే ఎగురుతాను — నేనెవరు?" // "I am round; kick me and I fly" — who am I?', ['గుండ్రం + తన్నడం = ఆట వస్తువు. // round + kick = a toy.'], 'బంతి // ball'),
      EX('"తాడుతో తిప్పితే గిర్రున తిరుగుతాను — నేనెవరు?" // "Spin me with a string and I whirl" — who am I?', ['ఆట బొమ్మ, చెక్కతో చేస్తారు. // A wooden toy.'], 'బొంగరం // spinning top'),
    ],
    mcq: [
      ['"పగలు నిద్ర, రాత్రి మెలకువ, పెద్ద కళ్ళు — నేనెవరు?" // "Asleep by day, awake at night, big eyes" — who?', 'గుడ్లగూబ=owl', ['కోడి=hen', 'పిచ్చుక=sparrow', 'చిలుక=parrot'], 'రాత్రి పక్షి. // A night bird.', 'గుడ్లగూబ రాత్రి మేల్కొంటుంది. // The owl wakes at night.'],
      ['"నాకు కాళ్ళు లేవు, అయినా పారుతాను; గలగల పాడుతాను — నేనెవరు?" // "No legs, yet I run; I sing galagala" — who?', 'నది=river', ['గుర్రం=horse', 'గాలి=wind', 'బండి=cart'], 'నీటికి సంబంధించినది. // Something with water.', 'నది గలగల పారుతుంది. // A river flows galagala.'],
      ['"నాకు ఆకులు ఉన్నాయి కానీ నేను చెట్టు కాదు; నన్ను చదువుతారు — నేనెవరు?" // "I have leaves but am not a tree; you read me" — who?', 'పుస్తకం=book', ['తోట=garden', 'గాలిపటం=kite', 'బంతి=ball'], '"ఆకులు" = పేజీలు! // "Leaves" = pages!', 'పుస్తకానికి పేజీలు (ఆకులు) ఉంటాయి. // A book has pages, called leaves.'],
      ['"పగలు వెలుగు ఇస్తాను, రాత్రి కనిపించను — నేనెవరు?" // "I give light by day and vanish at night" — who?', 'సూర్యుడు=sun', ['చందమామ=moon', 'దీపం=lamp', 'నక్షత్రం=star'], 'తూర్పున ఉదయిస్తాడు. // Rises in the east.', 'సూర్యుడు పగలు వెలుగు ఇస్తాడు. // The sun lights the day.'],
      ['"తెల్లగా ఉంటాను, ఆవు ఇస్తుంది, పిల్లలు తాగుతారు — నేనెవరు?" // "I am white; a cow gives me; children drink me" — who?', 'పాలు=milk', ['నీళ్ళు=water', 'పెరుగు=curd', 'టీ=tea'], 'దూడ కూడా తాగుతుంది. // The calf drinks it too.', 'ఆవు పాలు ఇస్తుంది. // A cow gives milk.'],
      ['"తల మీద పట్టుకుంటారు, వానలో తెరుస్తారు — నేనెవరు?" // "Held over the head, opened in rain" — who?', 'గొడుగు=umbrella', ['టోపీ=cap', 'సంచి=bag', 'చెప్పు=sandal'], 'వాన పాఠం గుర్తుందా? // Remember the rain lesson.', 'గొడుగు వాన నుండి కాపాడుతుంది. // An umbrella keeps rain off.'],
    ],
  }),
]);

// ============================================================ 14. చెట్టు కోరిక (story — imagination)
const ch14 = unit(14, 'ch14', 'చెట్టు కోరిక // The tree\'s wish', [
  obj({
    id: 'ts3.te.chettu.story', title: 'చెట్టు కోరిక — ఊహా కథ // An imaginative story', hint: 'చెట్టు ఒంటరిగా ఎందుకు ఉంది, ఏం కోరుకుంది? // Why was the tree lonely, and what did it wish for?',
    intro: [
      P('"చెట్టు కోరిక" ఒక కాల్పనిక (ఊహా) కథ — చెట్టు మాట్లాడితే ఎలా ఉంటుంది అని ఊహించడం. // "The tree\'s wish" is an imaginative story: what if a tree could talk?'),
      PH('🌳', 'ముసలి వేప చెట్టు — ఎన్నో ఏళ్ళుగా నీడ ఇస్తోంది. // An old neem tree, giving shade for years.'),
      P('మా కథ: ఊరి చివర ఒక ముసలి వేప చెట్టు ఒంటరిగా ఉండేది. ఒక రోజు పిల్లలు దాని నీడలో ఆడుకుంటుంటే చెట్టు మెల్లగా అంది: "పిల్లలూ, నా చుట్టూ నా లాంటి స్నేహితులు ఉంటే ఎంత బాగుంటుంది!" పిల్లలు మొక్కలు తెచ్చి నాటారు, రోజూ నీళ్ళు పోశారు. కొన్నేళ్ళకు అక్కడ పచ్చని తోపు పెరిగింది. చెట్టు కోరిక తీరింది! // Our story: a lonely old neem tree wished for friends; children planted saplings and watered them; years later a green grove grew. The tree\'s wish came true!'),
      TIP('కథలో చెట్టు మాట్లాడటం నిజం కాదు, ఊహ — కానీ చెట్లకు మన సాయం కావాలన్నది నిజం! // A talking tree is imagination — but trees needing our help is real!'),
    ],
    ex: [
      EX('చెట్టు ఏమి కోరుకుంది? // What did the tree wish for?', ['ఒంటరిగా ఉంది. // It was lonely.'], 'తన చుట్టూ చెట్ల స్నేహితులు // tree friends around it'),
      EX('పిల్లలు ఏం చేశారు? // What did the children do?', ['మొక్కలు నాటారు, నీళ్ళు పోశారు. // Planted saplings and watered them.'], 'మొక్కలు నాటి పెంచారు // planted and cared for saplings'),
    ],
    order: ['కథను వరుసలో పెట్టు // Put the story in order', [
      ['చెట్టు ఒంటరిగా ఉంది=the tree was lonely', 'చెట్టు పిల్లలతో కోరిక చెప్పింది=it told the children its wish', 'పిల్లలు మొక్కలు నాటారు=children planted saplings', 'పచ్చని తోపు పెరిగింది=a green grove grew'],
      ['పిల్లలు నీడలో ఆడారు=children played in the shade', 'చెట్టు మాట్లాడింది=the tree spoke', 'పిల్లలు రోజూ నీళ్ళు పోశారు=children watered daily', 'చెట్టు కోరిక తీరింది=the wish came true'],
    ]],
    mcq: [
      ['కథలో చెట్టు ఏ చెట్టు? // Which tree is in our story?', 'వేప=neem', ['కొబ్బరి=coconut', 'మామిడి=mango', 'తాటి=palm'], 'చేదు ఆకుల చెట్టు. // The bitter-leaved tree.', 'కథలో ముసలి వేప చెట్టు. // An old neem tree.'],
      ['"కాల్పనిక కథ" అంటే? // What is a కాల్పనిక story?', 'ఊహించి చెప్పిన కథ=an imagined story', ['నిజమైన వార్త=true news', 'పాట=song', 'లెక్క=sum'], 'చెట్టు మాట్లాడదు కదా! // Trees cannot really talk!', 'కాల్పనిక = ఊహ. // కాల్పనిక means imaginative.'],
      ['చెట్టు ఎందుకు బాధపడింది? // Why was the tree sad?', 'ఒంటరిగా ఉంది=it was lonely', ['ఆకలి=it was hungry', 'జలుబు=it had a cold', 'నిద్ర=it was sleepy'], 'చుట్టూ ఎవరూ లేరు. // No one around.', 'చెట్టు ఒంటరితనంతో బాధపడింది. // The tree felt lonely.'],
      ['కథ చివరికి ఏమైంది? // How did the story end?', 'పచ్చని తోపు పెరిగింది=a green grove grew', ['చెట్టు కూలిపోయింది=the tree fell', 'పిల్లలు వెళ్ళిపోయారు=children left', 'వరద వచ్చింది=a flood came'], 'కోరిక తీరింది. // The wish came true.', 'పిల్లల శ్రమతో తోపు పెరిగింది. // The children\'s effort grew a grove.'],
      ['కథ నేర్పే నీతి? // The lesson of the story?', 'చెట్లు నాటి కాపాడాలి=plant and protect trees', ['చెట్లు నరకాలి=cut trees', 'చెట్లతో మాట్లాడకూడదు=never talk to trees', 'నీడలో ఆడకూడదు=never play in shade'], 'పిల్లలు ఏం చేశారు? // What did the children do?', 'చెట్లు నాటి పెంచాలి. // Plant and grow trees.'],
    ],
  }),
  obj({
    id: 'ts3.te.chettu.uses', title: 'చెట్లు మనకు ఏమిస్తాయి? // What trees give us', hint: 'చెట్టు ఏ భాగం నుండి ఆ వస్తువు వస్తుందో ఆలోచించు. // Think which part of the tree gives it.',
    intro: [
      P('చెట్లు మనకు: నీడ, పండ్లు, శుభ్రమైన గాలి (ప్రాణవాయువు), కలప, మందులు (వేప), పక్షులకు గూడు ఇస్తాయి. వానలు పడటానికి సాయపడతాయి, మట్టి కొట్టుకుపోకుండా పట్టుకుంటాయి. // Trees give shade, fruit, clean air, wood, medicine, homes for birds; they help rain and hold the soil.'),
      PH('🪵', 'కలపతో తలుపులు, కుర్చీలు చేస్తారు. // Wood makes doors and chairs.'),
      TIP('ఒక చెట్టు నరికితే, రెండు మొక్కలు నాటాలి. // If a tree is cut, plant two.'),
      KEYS('నీడ = shade // shade', 'కలప = wood // wood', 'ప్రాణవాయువు = oxygen // oxygen'),
    ],
    ex: [
      EX('కుర్చీ దేనితో చేస్తారు? // What is a chair made from?', ['చెట్టు కాండం నుండి వస్తుంది. // It comes from the trunk.'], 'కలప // wood'),
      EX('మనం పీల్చే మంచి గాలిని ఎవరు ఇస్తారు? // Who gives us clean air to breathe?', ['ఆకులు గాలిని శుభ్రం చేస్తాయి. // Leaves clean the air.'], 'చెట్లు // trees'),
    ],
    tap: ['చెట్లు మనకు ఇచ్చేవి ఎంచుకో // Tap the things trees give us', [
      ['నీడ=shade', true], ['పండ్లు=fruit', true], ['కలప=wood', true], ['శుభ్రమైన గాలి=clean air', true], ['పక్షులకు గూడు=homes for birds', true],
      ['ప్లాస్టిక్=plastic', false], ['పొగ=smoke', false], ['ఇనుము=iron', false],
    ], 'నీడ, పండ్లు, కలప, గాలి, గూడు — చెట్ల కానుకలు. ప్లాస్టిక్, పొగ, ఇనుము చెట్ల నుండి రావు. // Trees give the first group; not plastic, smoke or iron.'],
    mcq: [
      ['పక్షులు గూడు ఎక్కడ కడతాయి? // Where do birds build nests?', 'చెట్ల కొమ్మల మీద=on tree branches', ['నీటిలో=in water', 'మట్టి కింద=under the soil', 'రోడ్డు మీద=on the road'], 'చెట్టు పక్షులకు ఇల్లు. // A tree is a bird\'s home.', 'పక్షులు చెట్ల మీద గూళ్ళు కడతాయి. // Birds nest in trees.'],
      ['చెట్లు ఎక్కువగా ఉంటే? // If there are many trees?', 'వానలు బాగా పడతాయి=good rains come', ['ఎండ ఎక్కువ=more heat', 'గాలి పాడవుతుంది=the air gets dirty', 'నీళ్ళు ఎండిపోతాయి=water dries up'], 'వాన పాఠం గుర్తు చేసుకో. // Remember the rain lesson.', 'చెట్లు వానలకు సాయపడతాయి. // Trees help bring rain.'],
      ['వేప ఆకులు దేనికి ఉపయోగం? // What are neem leaves useful for?', 'మందుకు=medicine', ['ఆటకు=toys', 'బట్టలకు=clothes', 'ఇంటి పైకప్పుకు=roofs'], 'పెద్దలు గాయాలకు వాడేవారు. // Elders used them on wounds.', 'వేప మందుగా పనిచేస్తుంది. // Neem works as medicine.'],
      ['ఒక చెట్టు నరికితే ఏం చేయాలి? // If one tree is cut, what should we do?', 'రెండు మొక్కలు నాటాలి=plant two', ['ఏమీ చేయకూడదు=nothing', 'ఇంకా నరకాలి=cut more', 'కాల్చాలి=burn it'], 'పోయిన దాని కంటే ఎక్కువ. // More than we lost.', 'నరికిన దానికి బదులుగా ఎక్కువ నాటాలి. // Replace with more.'],
      ['మట్టి వానకు కొట్టుకుపోకుండా పట్టుకునేది? // What holds soil so rain does not wash it away?', 'చెట్ల వేర్లు=tree roots', ['ఆకులు=leaves', 'పువ్వులు=flowers', 'పండ్లు=fruit'], 'నేల కింద ఉంటాయి. // They are underground.', 'వేర్లు మట్టిని గట్టిగా పట్టుకుంటాయి. // Roots hold the soil.'],
    ],
  }),
  obj({
    id: 'ts3.te.chettu.sentence', title: 'వాక్యం కూర్చడం // Building a sentence', hint: 'తెలుగులో ముందు "ఎవరు", తర్వాత "ఏమిటి", చివర "పని" వస్తుంది. // In Telugu: who first, then what, then the action last.',
    intro: [
      P('పదాలను సరైన వరుసలో పెడితేనే వాక్యం అవుతుంది. తెలుగులో సాధారణంగా: ఎవరు (కర్త) → ఏమిటి / ఎక్కడ → పని (క్రియ). ఉదా: పిల్లలు + మొక్కలు + నాటారు. // Words make a sentence only in order. Telugu usually goes: who → what/where → action. e.g. Children + saplings + planted.'),
      PH('📝', 'పని పదం (క్రియ) సాధారణంగా వాక్యం చివర వస్తుంది. // The action word usually comes last.'),
      P('ఊహ వాక్యాలు: "నేను చెట్టునైతే పక్షులకు గూడు ఇస్తాను." "నేను పక్షినైతే ఆకాశంలో ఎగురుతాను." // Imagination sentences: "If I were a tree, I would give birds a home."'),
      TIP('వాక్యం చివర "." పెట్టడం మరచిపోకు! // Do not forget the full stop!'),
    ],
    ex: [
      EX('"నాటారు / పిల్లలు / మొక్కలు" — వాక్యం చెయ్యి. // Make a sentence: planted / children / saplings.', ['ఎవరు? పిల్లలు. // Who? Children.', 'ఏమిటి? మొక్కలు. పని? నాటారు. // What? Saplings. Action? Planted.'], 'పిల్లలు మొక్కలు నాటారు. // Children planted saplings.'),
      EX('"నేను చెట్టునైతే ___ ఇస్తాను." ఊహించి పూరించు. // "If I were a tree, I would give ___."', ['చెట్టు ఏమి ఇస్తుందో ఆలోచించు. // Think what a tree gives.'], 'చల్లని నీడ // cool shade'),
    ],
    order: ['పదాలను సరైన వాక్యంగా పెట్టు // Arrange the words into a sentence', [
      ['పిల్లలు=children', 'మొక్కలు=saplings', 'నాటారు=planted'],
      ['చెట్టు=the tree', 'చల్లని=cool', 'నీడ=shade', 'ఇచ్చింది=gave'],
      ['పక్షి=the bird', 'గూడు=a nest', 'కట్టింది=built'],
      ['సీత=Sita', 'మొక్కకు=to the plant', 'నీళ్ళు=water', 'పోసింది=poured'],
      ['నేను=I', 'బడికి=to school', 'వెళ్తాను=go'],
      ['ఆవు=the cow', 'గడ్డి=grass', 'మేసింది=grazed'],
    ]],
    mcq: [
      ['సరైన వాక్యం ఏది? // Which sentence is correct?', 'రవి బంతి ఆడాడు.=Ravi played ball.', ['ఆడాడు బంతి రవి.', 'బంతి ఆడాడు రవి.', 'రవి ఆడాడు బంతి.'], 'పని పదం చివర. // The action goes last.', 'ఎవరు (రవి) → ఏమిటి (బంతి) → పని (ఆడాడు). // who → what → action.'],
      ['"నేను పక్షినైతే ___." సరిపోయేది? // "If I were a bird, ___."', 'ఆకాశంలో ఎగురుతాను=I would fly in the sky', ['నీటిలో ఈదుతాను చేపలా=I would swim like a fish', 'బడికి బస్సులో వెళ్తాను=I would go by bus', 'గడ్డి మేస్తాను=I would graze grass'], 'పక్షి ఏం చేస్తుంది? // What does a bird do?', 'పక్షి ఆకాశంలో ఎగురుతుంది. // A bird flies in the sky.'],
      ['"మేసింది / ఆవు / గడ్డి" — మొదటి పదం ఏది? // Which word goes first: grazed / cow / grass?', 'ఆవు=cow', ['గడ్డి=grass', 'మేసింది=grazed', 'ఏదైనా=any'], 'ఎవరు పని చేశారు? // Who did it?', 'ఆవు గడ్డి మేసింది. // The cow grazed grass.'],
      ['"పక్షి గూడు కట్టింది" — చివరి పదం ఏ రకం? // In "the bird built a nest", the last word is a?', 'పని పదం=action word', ['పేరు పదం=naming word', 'వర్ణించే పదం=describing word', 'ప్రశ్న పదం=question word'], 'పక్షి ఏం చేసింది? // What did the bird do?', '"కట్టింది" పని పదం, వాక్యం చివర. // కట్టింది is the verb, at the end.'],
      ['"నేను చెట్టునైతే ___." సరిపోయేది? // "If I were a tree, ___."', 'పక్షులకు గూడు ఇస్తాను=I would give birds a home', ['పరుగెత్తి బడికి వెళ్తాను=I would run to school', 'అన్నం వండుతాను=I would cook rice', 'గాలిపటం ఎగరేస్తాను=I would fly a kite'], 'చెట్టు ఏం చేయగలదు? // What can a tree do?', 'చెట్టు పక్షులకు ఇల్లు ఇస్తుంది. // A tree gives birds a home.'],
    ],
  }),
]);

// ============================================================ 14*. కొబ్బరి బొండం (picture story — humour)
const ch14s = unit('14*', 'ch14s', 'కొబ్బరి బొండం // Tender coconut', [
  obj({
    id: 'ts3.te.bondam.story', title: 'బొమ్మల కథ — కొబ్బరి బొండం // A picture story', hint: 'ప్రతి బొమ్మలో ఏం జరుగుతోందో చూసి, తర్వాత ఏం జరుగుతుందో ఊహించు. // See what happens in each picture and guess what comes next.',
    intro: [
      P('చిత్రకథ (బొమ్మల కథ) అంటే మాటలు తక్కువ, బొమ్మలు ఎక్కువ ఉండే కథ. బొమ్మలను వరుసగా చూసి కథ మనమే చెప్పుకోవాలి. // A picture story has few words and many pictures; we tell the story ourselves by looking at them in order.'),
      PH('🥥', 'కొబ్బరి బొండం — లోపల తీయని నీళ్ళు! // A tender coconut — sweet water inside!'),
      P('మా బొమ్మల కథ: 1) ఎండలో తేజకు బాగా దాహం వేసింది. 2) కొబ్బరి బొండాల బండి కనిపించింది. 3) అన్న బొండాన్ని కొట్టి స్ట్రా పెట్టి ఇచ్చాడు. 4) తేజ గట్టిగా ఊదాడు — నీళ్ళు ఎగిరి అతని ముక్కు మీద పడ్డాయి! 5) అందరూ పకపకా నవ్వారు; తేజ నెమ్మదిగా పీల్చి తాగాడు. // Our picture story: thirsty Teja finds a coconut cart; the seller opens one with a straw; Teja blows instead of sucking and splashes his own nose; everyone laughs, and he drinks slowly.'),
      TIP('స్ట్రాతో తాగాలంటే పీల్చాలి, ఊదకూడదు! // With a straw you suck, not blow!'),
    ],
    ex: [
      EX('తేజ ముక్కు మీద నీళ్ళు ఎందుకు పడ్డాయి? // Why did water splash on Teja\'s nose?', ['స్ట్రాలో ఊదాడు. // He blew into the straw.', 'పీల్చాల్సింది ఊదాడు. // He blew instead of sucking.'], 'స్ట్రాలో ఊదడం వల్ల // because he blew into the straw'),
      EX('కథలో అందరూ ఎందుకు నవ్వారు? // Why did everyone laugh?', ['తేజ ముక్కు తడిసిపోయింది — తమాషా! // Teja\'s wet nose was funny!'], 'తేజ ముక్కు మీద నీళ్ళు పడినందుకు // because water splashed on Teja\'s nose'),
    ],
    order: ['బొమ్మల కథను వరుసలో పెట్టు // Put the picture story in order', [
      ['తేజకు దాహం వేసింది=Teja was thirsty', 'బొండాల బండి కనిపించింది=he saw a coconut cart', 'అన్న బొండం కొట్టి ఇచ్చాడు=the seller opened one', 'తేజ స్ట్రాలో ఊదాడు=Teja blew into the straw', 'అందరూ నవ్వారు=everyone laughed'],
      ['బొండాల బండి కనిపించింది=he saw a coconut cart', 'తేజ స్ట్రాలో ఊదాడు=Teja blew into the straw', 'నీళ్ళు ముక్కు మీద పడ్డాయి=water splashed his nose', 'తేజ నెమ్మదిగా తాగాడు=Teja drank slowly'],
    ]],
    mcq: [
      ['"చిత్రకథ" అంటే? // What is a చిత్రకథ?', 'బొమ్మల కథ=picture story', ['పాట=song', 'పద్యం=verse', 'లెక్క=sum'], 'చిత్రం = బొమ్మ. // chitram = picture.', 'చిత్రకథ = బొమ్మల కథ. // A picture story.'],
      ['కొబ్బరి బొండం లోపల ఏముంటుంది? // What is inside a tender coconut?', 'తీయని నీళ్ళు=sweet water', ['పాలు=milk', 'ఉప్పు నీరు=salt water', 'ఇసుక=sand'], 'ఎండలో దాహం తీరుస్తుంది. // It quenches thirst.', 'బొండంలో తీయని కొబ్బరి నీళ్ళు. // Sweet coconut water.'],
      ['స్ట్రాతో సరిగా ఎలా తాగాలి? // How do we drink properly with a straw?', 'పీల్చాలి=suck', ['ఊదాలి=blow', 'కొరకాలి=bite', 'ఊపాలి=shake'], 'తేజ చేసిన తప్పు చేయకు. // Do not repeat Teja\'s mistake.', 'స్ట్రాతో పీల్చి తాగాలి. // Suck through a straw.'],
      ['ఈ కథ ఏ రకం? // What kind of story is this?', 'హాస్య కథ=funny story', ['భయపెట్టే కథ=scary story', 'చరిత్ర=history', 'వార్త=news'], 'చివరికి అందరూ నవ్వారు. // Everyone laughed.', 'ఇది నవ్వించే బొమ్మల కథ. // A funny picture story.'],
      ['తేజకు ఎందుకు దాహం వేసింది? // Why was Teja thirsty?', 'ఎండ వల్ల=because of the heat', ['వాన వల్ల=because of rain', 'చలి వల్ల=because of cold', 'నిద్ర వల్ల=because of sleep'], 'కథ మొదటి బొమ్మ. // The first picture.', 'ఎండలో దాహం ఎక్కువ. // Heat makes us thirsty.'],
    ],
  }),
  obj({
    id: 'ts3.te.bondam.coconut', title: 'కొబ్బరి చెట్టు — కల్పవృక్షం // The coconut tree: the giving tree', hint: 'కొబ్బరి చెట్టు ఏ భాగం నుండి ఆ వస్తువు చేస్తారో ఆలోచించు. // Think which part of the coconut tree it comes from.',
    intro: [
      P('కొబ్బరి చెట్టును "కల్పవృక్షం" అంటారు — కోరినవన్నీ ఇచ్చే చెట్టు అని. బొండం నీళ్ళు తాగుతాం; కొబ్బరితో పచ్చడి, తీపి చేస్తాం; కొబ్బరి నూనె తలకు రాసుకుంటాం; పీచుతో తాళ్ళు, ఈనెలతో చీపుర్లు; ఆకులతో పందిళ్ళు, బుట్టలు. // The coconut tree is called "kalpavriksham", the wish-giving tree: water, coconut for chutney, oil, coir rope, brooms, leaf mats and baskets.'),
      PH('🌴', 'పొడవైన కొబ్బరి చెట్టు. // A tall coconut tree.'),
      TIP('కొబ్బరి బొండం తాగిన తర్వాత బొండాన్ని చెత్త బుట్టలో వేయి. // Put the empty coconut in the bin after drinking.'),
      KEYS('పీచు → తాడు // coir → rope', 'ఈనెలు → చీపురు // leaf ribs → broom', 'కొబ్బరి → నూనె // coconut → oil'),
    ],
    ex: [
      EX('కొబ్బరి పీచుతో ఏం చేస్తారు? // What is coconut coir used for?', ['పీచు గట్టిగా, పొడవుగా ఉంటుంది. // Coir is strong and long.'], 'తాళ్ళు // ropes'),
      EX('"కల్పవృక్షం" అంటే? // What does కల్పవృక్షం mean?', ['అన్నీ ఇచ్చే చెట్టు. // A tree that gives everything.'], 'కోరినవన్నీ ఇచ్చే చెట్టు // the wish-giving tree'),
    ],
    match: ['కొబ్బరి భాగాన్ని దాని ఉపయోగంతో కలుపు // Match each coconut part to its use', [
      ['బొండం నీళ్ళు=tender coconut water', 'దాహం తీర్చడం=quench thirst'], ['పీచు=coir', 'తాడు=rope'], ['ఈనెలు=leaf ribs', 'చీపురు=broom'], ['కొబ్బరి=coconut kernel', 'నూనె=oil'], ['ఆకులు=leaves', 'బుట్టలు, పందిళ్ళు=baskets, shelters'],
    ]],
    mcq: [
      ['కొబ్బరి నూనె దేని నుండి వస్తుంది? // Coconut oil comes from?', 'ఎండు కొబ్బరి=dried coconut', ['ఆకులు=leaves', 'పీచు=coir', 'వేర్లు=roots'], 'తెల్లని గుజ్జు ఎండబెడతారు. // The white kernel is dried.', 'ఎండు కొబ్బరి నుండి నూనె తీస్తారు. // Oil comes from dried coconut.'],
      ['కొబ్బరి ఈనెలతో ఏం చేస్తారు? // What is made from coconut leaf ribs?', 'చీపురు=broom', ['తాడు=rope', 'నూనె=oil', 'పచ్చడి=chutney'], 'ఇల్లు ఊడ్చడానికి. // For sweeping.', 'ఈనెలతో చీపుర్లు చేస్తారు. // Leaf ribs make brooms.'],
      ['కొబ్బరి చెట్లు ఎక్కువగా ఎక్కడ పెరుగుతాయి? // Where do coconut trees grow most?', 'సముద్ర తీరాల్లో=near the seashore', ['మంచు కొండల్లో=on snowy mountains', 'ఎడారిలో మాత్రమే=only in deserts', 'ఇంట్లో గదిలో=inside rooms'], 'ఉప్పు గాలి వీటికి ఇష్టం. // They like sea breeze.', 'కొబ్బరి చెట్లు తీర ప్రాంతాల్లో ఎక్కువ. // They grow most near coasts.'],
      ['కొబ్బరితో చేసే తెలుగు వంటకం? // A Telugu dish made with coconut?', 'కొబ్బరి పచ్చడి=coconut chutney', ['పులిహోర=tamarind rice', 'టమాటా సూప్=tomato soup', 'ఆమ్లెట్=omelette'], 'ఇడ్లీ, దోసెతో తింటాం. // Eaten with idli and dosa.', 'కొబ్బరి పచ్చడి ఇడ్లీకి తోడు. // Coconut chutney goes with idli.'],
      ['కొబ్బరి చెట్టును ఏమంటారు? // The coconut tree is called?', 'కల్పవృక్షం=wish-giving tree', ['ముళ్ళ చెట్టు=thorn tree', 'చిన్న మొక్క=small plant', 'పూల చెట్టు=flower tree'], 'అన్నీ ఇస్తుంది. // It gives everything.', 'కొబ్బరి చెట్టు = కల్పవృక్షం. // The coconut tree is the kalpavriksham.'],
    ],
  }),
  obj({
    id: 'ts3.te.bondam.sequence', title: 'మొదట, తర్వాత, చివరికి — కథ చెప్పడం // Telling a story in order', hint: 'ఏది ముందు జరగాలి, ఏది తర్వాత జరగాలి? // What must happen first, and what after?',
    intro: [
      P('కథ చెప్పేటప్పుడు వరుస పదాలు వాడతాం: మొదట (first), తర్వాత (then / next), ఆ తర్వాత (after that), చివరికి (finally). ఇవి వింటున్నవారికి కథ సులువుగా అర్థమయ్యేలా చేస్తాయి. // Sequence words — first, then, after that, finally — make stories easy to follow.'),
      PH('➡️', 'మొదట → తర్వాత → చివరికి. // First → then → finally.'),
      P('ఉదా: మొదట అన్న బొండం కొట్టాడు. తర్వాత స్ట్రా పెట్టాడు. చివరికి తేజ నీళ్ళు తాగాడు. // e.g. First the seller cut the coconut. Then he put in a straw. Finally Teja drank.'),
      TIP('రోజూ నువ్వు చేసే పనులను ఈ పదాలతో చెప్పి చూడు: మొదట లేస్తాను, తర్వాత పళ్ళు తోముకుంటాను … // Describe your morning with these words.'),
    ],
    ex: [
      EX('"___ పళ్ళు తోముకున్నాను, తర్వాత స్నానం చేశాను." // "___ I brushed my teeth, then I bathed."', ['మొదటి పని ముందు వస్తుంది. // The first job comes first.'], 'మొదట // first'),
      EX('కథ ముగింపు చెప్పేటప్పుడు వాడే పదం? // Which word tells the ending?', ['అన్నీ అయిపోయాక. // When everything is over.'], 'చివరికి // finally'),
    ],
    order: ['పనులను సరైన వరుసలో పెట్టు // Put the steps in the right order', [
      ['నిద్ర లేచాను=I woke up', 'పళ్ళు తోముకున్నాను=I brushed', 'స్నానం చేశాను=I bathed', 'బడికి వెళ్ళాను=I went to school'],
      ['మొదట=first', 'తర్వాత=then', 'ఆ తర్వాత=after that', 'చివరికి=finally'],
      ['గుంత తవ్వాను=I dug a hole', 'మొక్క పెట్టాను=I placed the plant', 'మట్టి కప్పాను=I covered it with soil', 'నీళ్ళు పోశాను=I watered it'],
      ['బొండం కొట్టాడు=he cut the coconut', 'స్ట్రా పెట్టాడు=he put a straw', 'తేజ నీళ్ళు తాగాడు=Teja drank'],
      ['చేతులు కడుక్కున్నాను=I washed my hands', 'అన్నం తిన్నాను=I ate', 'పళ్ళెం సర్దాను=I cleared my plate'],
    ]],
    mcq: [
      ['"___ తేజ నెమ్మదిగా తాగి సంతోషించాడు." (కథ ముగింపు) // "___ Teja drank slowly and was happy." (the end)', 'చివరికి=finally', ['మొదట=first', 'తర్వాత=then', 'ముందు=before'], 'కథ ముగింపు. // The ending.', 'ముగింపుకు "చివరికి". // Use చివరికి for the end.'],
      ['"మొదట" వ్యతిరేక పదం? // Opposite of మొదట (first)?', 'చివర=last', ['తర్వాత=then', 'ముందు=before', 'మధ్య=middle'], 'వరుసలో ముందు × … // front of line × …', 'మొదట × చివర. // first × last.'],
      ['అన్నం తినే ముందు ఏం చేయాలి? // What do we do before eating?', 'చేతులు కడుక్కోవాలి=wash hands', ['పళ్ళెం సర్దాలి=clear the plate', 'నిద్రపోవాలి=sleep', 'బడికి వెళ్ళాలి=go to school'], 'శుభ్రత ముఖ్యం. // Cleanliness first.', 'మొదట చేతులు కడుక్కొని, తర్వాత తింటాం. // First wash, then eat.'],
      ['"మొదట గుంత తవ్వాను, ___ మొక్క పెట్టాను." // "First I dug a hole, ___ I placed the plant."', 'తర్వాత=then', ['మొదట=first', 'చివరికి=finally', 'నిన్న=yesterday'], 'రెండో పని. // The second step.', 'రెండో పనికి "తర్వాత". // Use తర్వాత for the next step.'],
      ['కథ వరుస పదాలు ఎందుకు? // Why use sequence words in a story?', 'కథ సులువుగా అర్థం కావడానికి=so the story is easy to follow', ['కథ పొడవు చేయడానికి=to make it longer', 'పాట కోసం=for singing', 'లెక్కల కోసం=for sums'], 'వినేవారికి సాయం. // They help the listener.', 'వరుస పదాలతో కథ స్పష్టంగా ఉంటుంది. // They make the story clear.'],
    ],
  }),
]);

export const units: USpec[] = [ch0, ch1, ch2, ch3, ch3s, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch12s, ch13, ch13s, ch14, ch14s];
