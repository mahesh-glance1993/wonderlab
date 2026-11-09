// తెలుగు course — Nursery to Class 10. Original wording, Telangana/AP SCERT-style progression.
// ALL Telugu content here needs native-speaker / Telugu-teacher review before release
// (see docs/LANGUAGE_COURSES.md for the list of grammar mappings to verify).
import type { Course, Item, LetterCard, Objective, Unit } from '../types';
import { build, classify, listen, mcq, order, others, typed } from '../build';
import {
  CONSONANT_CARDS, CONSONANTS, DAYS, DAYS_EN, GUNINTHAM_VOWELS, MONTHS, MONTHS_EN, NUMBER_WORDS, NUMBER_WORDS_EN, SIGN_NAMES,
  TELUGU_DIGITS, VOWEL_CARDS, VOWEL_SIGNS, VOWELS, compose, conjunct, letterOccurs,
} from './script';

// ---------------- letter item generators ----------------

/** Distractor letters that cannot also be a correct answer for this picture word. */
function safeOthers(cards: LetterCard[], i: number, n: number): string[] {
  const c = cards[i];
  const pool = cards.map((x) => x.letter);
  const starts = c.word.startsWith(c.letter);
  const ok = (d: string) => (starts ? !c.word.startsWith(d) : !letterOccurs(d, c.word));
  return others(pool, i, n + 6).filter(ok).slice(0, n);
}

function letterListenItems(prefix: string, cards: LetterCard[]): Item[] {
  const pool = cards.map((c) => c.letter);
  return cards.map((c, i) => listen(`${prefix}-${i + 1}`, 'విను. నువ్వు విన్న అక్షరాన్ని నొక్కు.', c.letter, [c.letter, ...others(pool, i, 3)], c.letter, {
    en: 'Listen. Tap the letter you heard.',
    hints: [`ఇది ${c.word} ${c.pic} లో ఉన్న అక్షరం.`], hintsEn: [`It is the letter in ${c.word} (${c.en}).`],
    explain: `${c.letter} – ${c.word}`, explainEn: `${c.letter} as in ${c.word} (${c.en})`,
  }));
}

function letterPictureItems(prefix: string, cards: LetterCard[]): Item[] {
  return cards.map((c, i) => {
    const starts = c.word.startsWith(c.letter);
    return mcq(`${prefix}-${i + 1}`, starts ? 'ఈ బొమ్మ పేరు ఏ అక్షరంతో మొదలవుతుంది?' : 'ఈ బొమ్మ పేరులో ఏ అక్షరం ఉంది?', [c.letter, ...safeOthers(cards, i, 3)], c.letter, {
      en: starts ? `Which letter does the name of this picture (${c.en}) start with?` : `Which letter is in the name of this picture (${c.en})?`,
      pic: c.pic, picLabel: c.en, say: c.word,
      hints: [`బొమ్మ పేరు: ${c.word}`], hintsEn: [`The picture's name is ${c.word}.`],
      explain: `${c.word} – ${c.letter}`, explainEn: `${c.word} (${c.en}) has ${c.letter}.`,
    });
  });
}

/** Reverse match: letter → picture. */
function pictureForLetterItems(prefix: string, cards: LetterCard[]): Item[] {
  const starters = cards.filter((c) => c.word.startsWith(c.letter));
  return starters.map((c, i) => {
    const wrong = others(starters, i, 6).filter((o) => !o.word.startsWith(c.letter)).slice(0, 2);
    const opts = [c, ...wrong];
    return mcq(`${prefix}-${i + 1}`, `${c.letter} తో మొదలయ్యే బొమ్మ ఏది?`, opts.map((o) => o.word), c.word, {
      en: `Which picture starts with ${c.letter}?`, picChoices: true, pics: Object.fromEntries(opts.map((o) => [o.word, o.pic])),
      gloss: Object.fromEntries(opts.map((o) => [o.word, o.en])), say: c.letter,
      explain: `${c.word} – ${c.letter} తో మొదలవుతుంది.`, explainEn: `${c.word} (${c.en}) starts with ${c.letter}.`,
    });
  });
}

const VOWEL_SET = new Set<string>(VOWELS);
function vowelOrConsonantItems(): Item[] {
  const picks = ['అ', 'క', 'ఈ', 'మ', 'ఓ', 'ర', 'ఉ', 'స'];
  return picks.map((l, i) => mcq(`vc-${i + 1}`, `${l} – అచ్చా? హల్లా?`, ['అచ్చు', 'హల్లు'], VOWEL_SET.has(l) ? 'అచ్చు' : 'హల్లు', {
    en: `Is ${l} a vowel (అచ్చు) or a consonant (హల్లు)?`, gloss: { 'అచ్చు': 'vowel', 'హల్లు': 'consonant' },
    explain: VOWEL_SET.has(l) ? `${l} అచ్చు.` : `${l} హల్లు.`, explainEn: VOWEL_SET.has(l) ? `${l} is a vowel.` : `${l} is a consonant.`,
  }));
}

const signTile = (v: string) => VOWEL_SIGNS[v];

// ---------------- గుణింతం ----------------
const G_CONS = ['క', 'గ', 'మ', 'ప', 'న', 'ర', 'ల', 'త', 'చ', 'బ', 'వ', 'స'];
const G_VOW = GUNINTHAM_VOWELS.filter((v) => v !== 'అ');

function guninthamBuildItems(): Item[] {
  return G_CONS.map((c, i) => {
    const v = G_VOW[(i * 5 + 1) % G_VOW.length];
    const d = others(G_VOW, G_VOW.indexOf(v), 2).map(signTile);
    const target = compose(c, v);
    return build(`gb-${i + 1}`, `“${target}” ను తయారు చేయి: హల్లు, తర్వాత గుర్తు నొక్కు.`, [c, signTile(v)], d, {
      en: `Build “${target}”: tap the consonant, then the vowel sign.`, say: target,
      hints: [`${target} = ${c} + ${v} (${SIGN_NAMES[v]})`], hintsEn: [`${target} = ${c} + the sign of ${v}`],
      explain: `${c} + ${v} = ${target}`, explainEn: `${c} with the ${v} sign makes ${target}.`,
    });
  });
}
function guninthamChoiceItems(): Item[] {
  return G_CONS.slice(0, 10).map((c, i) => {
    const v = G_VOW[(i * 3 + 4) % G_VOW.length];
    const target = compose(c, v);
    const wrong = others(G_VOW, G_VOW.indexOf(v), 3).map((w) => compose(c, w));
    return mcq(`gc-${i + 1}`, `${c} + ${v} = ?`, [target, ...wrong], target, {
      en: `${c} + ${v} makes which syllable?`, say: target,
      hints: [`${v} గుర్తు పేరు: ${SIGN_NAMES[v]}`], hintsEn: [`Look for the sign of ${v}.`],
      explain: `${c} + ${v} = ${target}`, explainEn: `${c} + ${v} = ${target}`,
    });
  });
}
function guninthamListenItems(): Item[] {
  return G_CONS.slice(0, 10).map((c, i) => {
    const v = G_VOW[(i * 7 + 2) % G_VOW.length];
    const target = compose(c, v);
    const wrong = others(G_VOW, G_VOW.indexOf(v), 3, [1, 2, 3, 4]).map((w) => compose(c, w));
    return listen(`gl-${i + 1}`, 'విను. నువ్వు విన్న అక్షరాన్ని నొక్కు.', target, [target, ...wrong], target, {
      en: 'Listen. Tap the syllable you heard.', explain: `${c} + ${v} = ${target}`, explainEn: `${target} is ${c} with the ${v} sign.`,
    });
  });
}
function signNameItems(): Item[] {
  const rows: [string, string][] = [['ఇ', 'కి'], ['ఉ', 'కు'], ['ఆ', 'కా'], ['ఈ', 'కీ'], ['ఎ', 'కె'], ['ఒ', 'కొ'], ['అం', 'కం']];
  return rows.map(([v, ans], i) => {
    const wrong = others(rows.map((r) => r[1]), i, 3);
    return mcq(`gs-${i + 1}`, `“${SIGN_NAMES[v]}” గుర్తు ఉన్న అక్షరం ఏది?`, [ans, ...wrong], ans, {
      en: `Which syllable has the sign called “${SIGN_NAMES[v]}” (the ${v} sign)?`, explain: `${ans} = క + ${v}`, explainEn: `${ans} is క with the ${v} sign.`,
    });
  });
}

// ---------------- words ----------------
const WORDS: { w: string; pic: string; en: string; parts: string[]; wrong: string[] }[] = [
  { w: 'అమ్మ', pic: '👩', en: 'mother', parts: ['అ', 'మ్మ'], wrong: ['ఆ', 'మ'] },
  { w: 'నాన్న', pic: '👨', en: 'father', parts: ['నా', 'న్న'], wrong: ['న', 'ను'] },
  { w: 'పాలు', pic: '🥛', en: 'milk', parts: ['పా', 'లు'], wrong: ['ప', 'లి'] },
  { w: 'బడి', pic: '🏫', en: 'school', parts: ['బ', 'డి'], wrong: ['బా', 'డు'] },
  { w: 'కోతి', pic: '🐒', en: 'monkey', parts: ['కో', 'తి'], wrong: ['కు', 'త'] },
  { w: 'చేప', pic: '🐟', en: 'fish', parts: ['చే', 'ప'], wrong: ['చ', 'పా'] },
  { w: 'పులి', pic: '🐅', en: 'tiger', parts: ['పు', 'లి'], wrong: ['పి', 'లు'] },
  { w: 'ఆవు', pic: '🐄', en: 'cow', parts: ['ఆ', 'వు'], wrong: ['అ', 'వ'] },
  { w: 'గుడి', pic: '🛕', en: 'temple', parts: ['గు', 'డి'], wrong: ['గ', 'డు'] },
  { w: 'కుక్క', pic: '🐕', en: 'dog', parts: ['కు', 'క్క'], wrong: ['క', 'కా'] },
];
const wordPictureItems = (): Item[] => WORDS.map((x, i) => mcq(`wp-${i + 1}`, 'ఈ బొమ్మకు సరైన పదం ఏది?', [x.w, ...others(WORDS.map((y) => y.w), i, 3)], x.w, {
  en: `Which word names this picture (${x.en})?`, pic: x.pic, picLabel: x.en, gloss: Object.fromEntries(WORDS.map((y) => [y.w, y.en])),
  explain: `${x.pic} = ${x.w}`, explainEn: `${x.w} means ${x.en}.`,
}));
const wordBuildItems = (): Item[] => WORDS.map((x, i) => build(`wb-${i + 1}`, `“${x.w}” పదాన్ని కూర్చు.`, x.parts, x.wrong, {
  en: `Build the word “${x.w}” (${x.en}).`, pic: x.pic, picLabel: x.en, say: x.w,
  hints: [`మొదటి అక్షరం ${x.parts[0]}`], hintsEn: [`It begins with ${x.parts[0]}.`], explain: x.parts.join(' + ') + ` = ${x.w}`,
}));

// ---------------- numbers, days, months ----------------
const numberWordItems = (): Item[] => NUMBER_WORDS.map((w, i) => mcq(`nw-${i + 1}`, `${i + 1} (${TELUGU_DIGITS[i]}) ను తెలుగు పదంలో ఏమంటారు?`, [w, ...others(NUMBER_WORDS, i, 3)], w, {
  en: `How do we write ${i + 1} as a Telugu word?`, gloss: Object.fromEntries(NUMBER_WORDS.map((x, j) => [x, NUMBER_WORDS_EN[j]])), say: w,
  explain: `${i + 1} = ${w}`, explainEn: `${i + 1} is ${w} (${NUMBER_WORDS_EN[i]}).`,
}));
const numberListenItems = (): Item[] => NUMBER_WORDS.map((w, i) => listen(`nl-${i + 1}`, 'విను. ఆ సంఖ్యను నొక్కు.', w, [String(i + 1), ...others(NUMBER_WORDS.map((_, j) => String(j + 1)), i, 3)], String(i + 1), {
  en: 'Listen. Tap that number.', explain: `${w} = ${i + 1}`, explainEn: `${w} means ${NUMBER_WORDS_EN[i]}.`,
}));
const dayItems = (): Item[] => DAYS.map((d, i) => {
  const next = DAYS[(i + 1) % 7];
  return mcq(`dy-${i + 1}`, `${d} తర్వాత వచ్చే వారం ఏది?`, [next, ...others(DAYS, (i + 1) % 7, 3)], next, {
    en: `Which day comes after ${d} (${DAYS_EN[i]})?`, gloss: Object.fromEntries(DAYS.map((x, j) => [x, DAYS_EN[j]])),
    explain: `${d} → ${next}`, explainEn: `${DAYS_EN[i]} → ${DAYS_EN[(i + 1) % 7]}`,
  });
});
const monthItems = (): Item[] => MONTHS.map((m, i) => {
  const next = MONTHS[(i + 1) % 12];
  return mcq(`mn-${i + 1}`, `${m} తర్వాత వచ్చే తెలుగు నెల ఏది?`, [next, ...others(MONTHS, (i + 1) % 12, 3)], next, {
    en: `Which Telugu month comes after ${m} (${MONTHS_EN[i]})?`, gloss: Object.fromEntries(MONTHS.map((x, j) => [x, MONTHS_EN[j]])),
    explain: `${m} → ${next}`, explainEn: `${MONTHS_EN[i]} → ${MONTHS_EN[(i + 1) % 12]}`,
  });
});

// ---------------- word pairs (opposites, synonyms, plurals…) ----------------
type Pair = [string, string, string]; // word, answer, English gloss
function pairItems(prefix: string, pairs: Pair[], prompt: (w: string) => string, promptEn: (w: string, en: string) => string, what: string): Item[] {
  const answers = pairs.map((p) => p[1]);
  return pairs.map(([w, a, en], i) => mcq(`${prefix}-${i + 1}`, prompt(w), [a, ...others(answers, i, 3).filter((x) => x !== w)].slice(0, 4), a, {
    en: promptEn(w, en), explain: `${w} – ${a}`, explainEn: `${what}: ${w} → ${a} (${en})`,
  }));
}
const OPPOSITES: Pair[] = [
  ['పెద్ద', 'చిన్న', 'big – small'], ['పొడవు', 'పొట్టి', 'tall – short'], ['పగలు', 'రాత్రి', 'day – night'], ['లోపల', 'బయట', 'inside – outside'],
  ['ముందు', 'వెనుక', 'front – back'], ['తెలుపు', 'నలుపు', 'white – black'], ['పైన', 'కింద', 'above – below'], ['కొత్త', 'పాత', 'new – old'],
  ['దగ్గర', 'దూరం', 'near – far'], ['లావు', 'సన్నం', 'fat – thin'],
];
const ANTONYMS: Pair[] = [
  ['సుఖం', 'దుఃఖం', 'happiness – sorrow'], ['జయం', 'అపజయం', 'victory – defeat'], ['న్యాయం', 'అన్యాయం', 'justice – injustice'],
  ['ఆరోగ్యం', 'అనారోగ్యం', 'health – illness'], ['గౌరవం', 'అగౌరవం', 'respect – disrespect'], ['ఆశ', 'నిరాశ', 'hope – despair'],
  ['ధనవంతుడు', 'పేదవాడు', 'rich – poor'], ['ప్రశ్న', 'జవాబు', 'question – answer'],
];
const SYNONYMS: Pair[] = [
  ['సూర్యుడు', 'రవి', 'sun'], ['నీరు', 'జలం', 'water'], ['ఇల్లు', 'గృహం', 'house'], ['పువ్వు', 'పుష్పం', 'flower'],
  ['తల్లి', 'మాత', 'mother'], ['అడవి', 'వనం', 'forest'], ['ఆకాశం', 'గగనం', 'sky'], ['కన్ను', 'నేత్రం', 'eye'],
];
const PLURALS: Pair[] = [
  ['పుస్తకం', 'పుస్తకాలు', 'book → books'], ['చెట్టు', 'చెట్లు', 'tree → trees'], ['పువ్వు', 'పువ్వులు', 'flower → flowers'], ['ఆవు', 'ఆవులు', 'cow → cows'],
  ['కాయ', 'కాయలు', 'unripe fruit → fruits'], ['పిల్లి', 'పిల్లులు', 'cat → cats'], ['ఇల్లు', 'ఇళ్ళు', 'house → houses'],
];
const PRAKRUTI: Pair[] = [
  ['రాత్రి', 'రేయి', 'night'], ['విద్య', 'విద్దె', 'learning'], ['భాష', 'బాస', 'language'], ['కార్యం', 'కర్జం', 'task'],
  ['ఆశ్చర్యం', 'అచ్చెరువు', 'wonder'], ['శ్రీ', 'సిరి', 'wealth'],
];

const O = (o: Objective) => o;
const ex = (text: string, en: string, note?: string, noteEn?: string, pic?: string) => ({ text, en, note, noteEn, pic });

// ---------------- units ----------------

const units: Unit[] = [
  // ===== Nursery =====
  {
    id: 'te-n-vowels', level: 0, title: 'అచ్చులు: అ నుండి ఊ వరకు', titleEn: 'Vowels: అ to ఊ', trace: ['te-vowels-1'], read: ['te-rhyme-1'],
    objectives: [
      O({ id: 'listen', title: 'విను – నొక్కు', titleEn: 'Listen and tap', intro: 'అ, ఆ, ఇ, ఈ, ఉ, ఊ – ఈ ఆరు అచ్చులను విందాం, చూద్దాం.', introEn: 'Let us hear and see six vowels: అ, ఆ, ఇ, ఈ, ఉ, ఊ.',
        examples: [ex('అ – అమ్మ', 'అ as in అమ్మ (mother)', undefined, undefined, '👩'), ex('ఆ – ఆవు', 'ఆ as in ఆవు (cow)', 'ఆ అ కంటే పొడవుగా పలుకుతాం.', 'ఆ is a longer sound than అ.', '🐄')],
        cards: VOWEL_CARDS.slice(0, 6), items: letterListenItems('nv-l', VOWEL_CARDS.slice(0, 6)) }),
      O({ id: 'picture', title: 'బొమ్మ – అక్షరం', titleEn: 'Picture and letter', intro: 'బొమ్మ పేరు ఏ అక్షరంతో మొదలవుతుందో చూద్దాం.', introEn: 'Find the letter that a picture’s name begins with.',
        examples: [ex('ఇ – ఇల్లు', 'ఇ as in ఇల్లు (house)', undefined, undefined, '🏠'), ex('ఉ – ఉడుత', 'ఉ as in ఉడుత (squirrel)', undefined, undefined, '🐿️')],
        cards: VOWEL_CARDS.slice(0, 6), items: letterPictureItems('nv-p', VOWEL_CARDS.slice(0, 6)) }),
    ],
  },
  // ===== LKG =====
  {
    id: 'te-l-vowels', level: 1, title: 'అచ్చులు – మొత్తం పదహారు', titleEn: 'All 16 vowels', trace: ['te-vowels'], read: ['te-rhyme-2'],
    badge: { id: 'lang:te-vowels', title: 'అచ్చులు నేర్చుకున్నాను! (All Telugu vowels learned)' },
    objectives: [
      O({ id: 'listen', title: 'అచ్చులు – విను, నొక్కు', titleEn: 'Vowels – listen and tap', intro: 'తెలుగులో పదహారు అచ్చులు ఉన్నాయి. ఒక్కొక్కటి విని నేర్చుకుందాం.', introEn: 'Telugu has 16 vowels (అచ్చులు). Let us hear each one.',
        examples: [ex('ఎ – ఎలుక, ఏ – ఏనుగు', 'ఎ (short) as in ఎలుక (mouse); ఏ (long) as in ఏనుగు (elephant)', undefined, undefined, '🐘'), ex('అం – అంగడి', 'అం as in అంగడి (shop)', 'అం లో సున్నా (ం) ఉంటుంది.', 'అం has the circle sign ం.', '🏪')],
        cards: VOWEL_CARDS, items: letterListenItems('lv-l', VOWEL_CARDS) }),
      O({ id: 'picture', title: 'అచ్చులు – బొమ్మలు', titleEn: 'Vowels with pictures', intro: 'ప్రతి అచ్చుకు ఒక బొమ్మ పదం.', introEn: 'Each vowel has a picture word.',
        examples: [ex('ఒ – ఒంటె', 'ఒ as in ఒంటె (camel)', undefined, undefined, '🐫'), ex('ఓ – ఓడ', 'ఓ as in ఓడ (ship)', undefined, undefined, '🚢')],
        cards: VOWEL_CARDS, items: letterPictureItems('lv-p', VOWEL_CARDS) }),
    ],
  },
  {
    id: 'te-l-cons1', level: 1, title: 'హల్లులు: క నుండి ఞ వరకు', titleEn: 'Consonants: క to ఞ', trace: ['te-cons-1'],
    objectives: [
      O({ id: 'listen', title: 'విను – నొక్కు', titleEn: 'Listen and tap', intro: 'క, ఖ, గ, ఘ, ఙ – చ, ఛ, జ, ఝ, ఞ. ఈ పది హల్లులు నేర్చుకుందాం.', introEn: 'Let us learn ten consonants (హల్లులు): క ఖ గ ఘ ఙ, చ ఛ జ ఝ ఞ.',
        examples: [ex('క – కలం', 'క as in కలం (pen)', undefined, undefined, '🖊️'), ex('చ – చేప', 'చ as in చేప (fish)', undefined, undefined, '🐟')],
        cards: CONSONANT_CARDS.slice(0, 10), items: letterListenItems('lc1-l', CONSONANT_CARDS.slice(0, 10)) }),
      O({ id: 'picture', title: 'బొమ్మ – అక్షరం', titleEn: 'Picture and letter', intro: 'బొమ్మ పేరులోని అక్షరాన్ని కనుక్కో.', introEn: 'Find the letter in the picture’s name.',
        examples: [ex('గ – గడియారం', 'గ as in గడియారం (clock)', undefined, undefined, '🕰️'), ex('జ – జెండా', 'జ as in జెండా (flag)', undefined, undefined, '🚩')],
        cards: CONSONANT_CARDS.slice(0, 10), items: letterPictureItems('lc1-p', CONSONANT_CARDS.slice(0, 10)) }),
    ],
  },
  // ===== UKG =====
  {
    id: 'te-u-cons2', level: 2, title: 'హల్లులు: ట నుండి న వరకు', titleEn: 'Consonants: ట to న', trace: ['te-cons-1'],
    objectives: [
      O({ id: 'listen', title: 'విను – నొక్కు', titleEn: 'Listen and tap', intro: 'ట, ఠ, డ, ఢ, ణ – త, థ, ద, ధ, న.', introEn: 'Ten more consonants: ట ఠ డ ఢ ణ, త థ ద ధ న.',
        examples: [ex('ట – టమాట', 'ట as in టమాట (tomato)', undefined, undefined, '🍅'), ex('త – తాబేలు', 'త as in తాబేలు (tortoise)', 'ట నాలుక పైకి మడిచి, త పళ్ళ దగ్గర పలుకుతాం.', 'ట is said with the tongue curled back; త with the tongue near the teeth.', '🐢')],
        cards: CONSONANT_CARDS.slice(10, 20), items: letterListenItems('uc2-l', CONSONANT_CARDS.slice(10, 20)) }),
      O({ id: 'picture', title: 'బొమ్మ – అక్షరం', titleEn: 'Picture and letter', intro: 'బొమ్మ పేరులోని అక్షరాన్ని కనుక్కో.', introEn: 'Find the letter in the picture’s name.',
        examples: [ex('ద – దీపం', 'ద as in దీపం (lamp)', undefined, undefined, '🪔'), ex('న – నక్క', 'న as in నక్క (fox)', undefined, undefined, '🦊')],
        cards: CONSONANT_CARDS.slice(10, 20), items: letterPictureItems('uc2-p', CONSONANT_CARDS.slice(10, 20)) }),
    ],
  },
  {
    id: 'te-u-cons3', level: 2, title: 'హల్లులు: ప నుండి ఱ వరకు', titleEn: 'Consonants: ప to ఱ', trace: ['te-cons-2'], read: ['te-rhyme-3'],
    objectives: [
      O({ id: 'listen', title: 'విను – నొక్కు', titleEn: 'Listen and tap', intro: 'ప, ఫ, బ, భ, మ, య, ర, ల, వ, శ, ష, స, హ, ళ, క్ష, ఱ.', introEn: 'The last sixteen consonants, from ప to ఱ.',
        examples: [ex('ప – పడవ', 'ప as in పడవ (boat)', undefined, undefined, '⛵'), ex('హ – హంస', 'హ as in హంస (swan)', undefined, undefined, '🦢')],
        cards: CONSONANT_CARDS.slice(20), items: letterListenItems('uc3-l', CONSONANT_CARDS.slice(20)) }),
      O({ id: 'picture', title: 'బొమ్మ – అక్షరం', titleEn: 'Picture and letter', intro: 'బొమ్మ పేరులోని అక్షరాన్ని కనుక్కో.', introEn: 'Find the letter in the picture’s name.',
        examples: [ex('మ – మామిడి', 'మ as in మామిడి (mango)', undefined, undefined, '🥭'), ex('స – సింహం', 'స as in సింహం (lion)', undefined, undefined, '🦁')],
        cards: CONSONANT_CARDS.slice(20), items: letterPictureItems('uc3-p', CONSONANT_CARDS.slice(20)) }),
    ],
  },
  {
    id: 'te-u-hallulu', level: 2, title: 'హల్లులు – అన్నీ కలిపి', titleEn: 'All consonants together',
    badge: { id: 'lang:te-consonants', title: 'హల్లులు నేర్చుకున్నాను! (All Telugu consonants learned)' },
    objectives: [
      O({ id: 'match', title: 'అక్షరం – బొమ్మ జత', titleEn: 'Match letter to picture', intro: 'అక్షరం చూసి, ఆ అక్షరంతో మొదలయ్యే బొమ్మను ఎంచుకో.', introEn: 'Look at the letter and choose the picture that starts with it.',
        examples: [ex('బ – బంతి', 'బ as in బంతి (ball)', undefined, undefined, '⚽'), ex('ర – రైలు', 'ర as in రైలు (train)', undefined, undefined, '🚆')],
        cards: CONSONANT_CARDS, items: pictureForLetterItems('uh-m', CONSONANT_CARDS) }),
      O({ id: 'sort', title: 'అచ్చా? హల్లా?', titleEn: 'Vowel or consonant?', intro: 'అచ్చులు సొంతంగా పలుకుతాయి. హల్లులు అచ్చు సాయంతో పలుకుతాయి.', introEn: 'Vowels sound on their own; consonants are sounded with the help of a vowel.',
        examples: [ex('అ, ఆ, ఇ … – అచ్చులు', 'అ, ఆ, ఇ … are vowels'), ex('క, గ, చ … – హల్లులు', 'క, గ, చ … are consonants')],
        items: vowelOrConsonantItems() }),
    ],
  },
  // ===== Class 1 =====
  {
    id: 'te-1-gunintham', level: 3, title: 'గుణింతాలు', titleEn: 'Vowel signs on consonants (గుణింతం)',
    badge: { id: 'lang:te-gunintham', title: 'గుణింతం నేర్చుకున్నాను! (Telugu vowel signs learned)' },
    objectives: [
      O({ id: 'build', title: 'గుణింతం కూర్పు', titleEn: 'Build a syllable', builder: 'gunintham',
        intro: 'హల్లుకు అచ్చు గుర్తు చేరిస్తే కొత్త అక్షరం వస్తుంది. క + ఆ = కా.', introEn: 'Add a vowel sign to a consonant to make a new syllable: క + ఆ = కా.',
        examples: [ex('క కా కి కీ కు కూ కృ కె కే కై కొ కో కౌ కం కః', 'The full గుణింతం of క'), ex('మ + ఇ = మి', 'మ with the ఇ sign (గుడి) makes మి', 'ఇ గుర్తును “గుడి” అంటారు.', 'The ఇ sign is called “గుడి”.'), ex('ప + ఉ = పు', 'ప with the ఉ sign (కొమ్ము) makes పు')],
        items: guninthamBuildItems() }),
      O({ id: 'choose', title: 'సరైన అక్షరం', titleEn: 'Choose the syllable', builder: 'gunintham', intro: 'హల్లు + అచ్చు కలిపితే ఏ అక్షరం వస్తుందో ఎంచుకో.', introEn: 'Choose the syllable made by a consonant plus a vowel.',
        examples: [ex('గ + ఏ = గే', 'గ + ఏ = గే'), ex('న + ఓ = నో', 'న + ఓ = నో')], items: guninthamChoiceItems() }),
      O({ id: 'listen', title: 'విని గుర్తించు', titleEn: 'Listen and find', intro: 'అక్షరాన్ని విని, సరైన గుణింతం నొక్కు.', introEn: 'Listen to the syllable and tap it.',
        examples: [ex('కి – కీ', 'కి is short; కీ is long'), ex('కొ – కో', 'కొ is short; కో is long')], items: guninthamListenItems() }),
      O({ id: 'signs', title: 'గుర్తుల పేర్లు', titleEn: 'Names of the signs', intro: 'గుర్తులకు పేర్లు ఉన్నాయి: ా దీర్ఘం, ి గుడి, ు కొమ్ము, ం సున్నా.', introEn: 'The signs have names: ా దీర్ఘం, ి గుడి, ు కొమ్ము, ం సున్నా.',
        examples: [ex('కి – గుడి', 'కి has the గుడి sign'), ex('కు – కొమ్ము', 'కు has the కొమ్ము sign')], items: signNameItems() }),
    ],
  },
  {
    id: 'te-1-words', level: 3, title: 'చిన్న పదాలు చదువుదాం', titleEn: 'Reading short words', read: ['te-story-1'],
    objectives: [
      O({ id: 'read', title: 'బొమ్మ – పదం', titleEn: 'Picture and word', intro: 'రెండు మూడు అక్షరాల పదాలు చదువుదాం.', introEn: 'Let us read words with two or three letters.',
        examples: [ex('అ + మ్మ = అమ్మ', 'అమ్మ (mother)', undefined, undefined, '👩'), ex('పా + లు = పాలు', 'పాలు (milk)', undefined, undefined, '🥛'), ex('బ + డి = బడి', 'బడి (school)', undefined, undefined, '🏫')],
        items: wordPictureItems() }),
      O({ id: 'build', title: 'పదం కూర్చు', titleEn: 'Build the word', intro: 'అక్షరాలను వరుసగా నొక్కి పదం తయారు చేయి.', introEn: 'Tap the letters in order to build the word.',
        examples: [ex('కో + తి = కోతి', 'కోతి (monkey)', undefined, undefined, '🐒'), ex('పు + లి = పులి', 'పులి (tiger)', undefined, undefined, '🐅')], items: wordBuildItems() }),
    ],
  },
  {
    id: 'te-1-numbers', level: 3, title: 'సంఖ్యా పదాలు: ఒకటి నుండి పది', titleEn: 'Number words 1–10',
    objectives: [
      O({ id: 'words', title: 'సంఖ్య – పదం', titleEn: 'Number to word', intro: 'ఒకటి, రెండు, మూడు … పది. తెలుగు అంకెలు ౧, ౨, ౩ కూడా చూద్దాం.', introEn: 'Number words one to ten, with Telugu digits ౧, ౨, ౩ …',
        examples: [ex('1 – ౧ – ఒకటి', 'one'), ex('5 – ౫ – ఐదు', 'five'), ex('10 – ౧౦ – పది', 'ten')], items: numberWordItems() }),
      O({ id: 'listen', title: 'విను – సంఖ్య నొక్కు', titleEn: 'Listen and tap the number', intro: 'సంఖ్యా పదం విని, ఆ సంఖ్యను నొక్కు.', introEn: 'Hear a number word and tap the number.',
        examples: [ex('మూడు = 3', 'three'), ex('ఎనిమిది = 8', 'eight')], items: numberListenItems() }),
    ],
  },
  // ===== Class 2 =====
  {
    id: 'te-2-ottulu', level: 4, title: 'ఒత్తులు – పరిచయం', titleEn: 'Introducing ఒత్తులు (conjuncts)',
    objectives: [
      O({ id: 'make', title: 'ఒత్తు చేర్చు', titleEn: 'Add an ఒత్తు', builder: 'ottu',
        intro: 'ఒక హల్లు కింద మరో హల్లు చిన్నగా వ్రాస్తే అది ఒత్తు. క కింద క ఒత్తు = క్క.', introEn: 'An ఒత్తు is a second consonant written small under the first: క with a క ఒత్తు = క్క.',
        examples: [ex('క + క = క్క (అక్క)', 'అక్క (elder sister)'), ex('మ + మ = మ్మ (అమ్మ)', 'అమ్మ (mother)'), ex('ప + ర = ప్ర (ప్రేమ)', 'ప్రేమ (love)')],
        items: ([['క', 'క'], ['మ', 'మ'], ['న', 'న'], ['ల', 'ల'], ['ట', 'ట'], ['ప', 'ర'], ['స', 'త'], ['త', 'ర']] as const).map(([a, b], i) => {
          const t = conjunct(a, b);
          return mcq(`ot-${i + 1}`, `${a} కు ${b} ఒత్తు చేర్చితే ఏ అక్షరం వస్తుంది?`, [t, a + b, conjunct(b, a) === t ? conjunct(a, 'వ') : conjunct(b, a), conjunct(a, 'య')], t, {
            en: `What do we get when ${a} takes a ${b} ఒత్తు?`, explain: `${a} + ${b} ఒత్తు = ${t}`, explainEn: `${a} with a ${b} conjunct = ${t}`,
          });
        }) }),
      O({ id: 'words', title: 'ఒత్తు పదాలు', titleEn: 'Words with ఒత్తులు', intro: 'ఖాళీలో సరైన ఒత్తు అక్షరం నింపు.', introEn: 'Fill the gap with the right conjunct letter.',
        examples: [ex('పి + ల్లి = పిల్లి', 'పిల్లి (cat)', undefined, undefined, '🐈'), ex('చె + ట్టు = చెట్టు', 'చెట్టు (tree)', undefined, undefined, '🌳')],
        items: ([['అ', 'క్క', 'అక్క', 'elder sister', '👧', ['క', 'కా']], ['అ', 'న్న', 'అన్న', 'elder brother', '👦', ['న', 'నా']], ['పి', 'ల్లి', 'పిల్లి', 'cat', '🐈', ['లి', 'ల్లు']],
          ['చె', 'ట్టు', 'చెట్టు', 'tree', '🌳', ['టు', 'ట్ట']], ['కు', 'క్క', 'కుక్క', 'dog', '🐕', ['క', 'క్కి']], ['బు', 'ట్ట', 'బుట్ట', 'basket', '🧺', ['ట', 'ట్టు']], ['గు', 'ర్రం', 'గుర్రం', 'horse', '🐎', ['రం', 'ర్రు']]] as const)
          .map(([s, gap, w, en, pic, wr], i) => mcq(`ow-${i + 1}`, `${s} __ – ఖాళీ నింపు.`, [gap, ...wr], gap, { en: `Fill the gap to make ${w} (${en}).`, pic, picLabel: en, say: w, explain: `${s} + ${gap} = ${w}`, explainEn: `${w} means ${en}.` })) }),
    ],
  },
  {
    id: 'te-2-sentences', level: 4, title: 'చిన్న వాక్యాలు', titleEn: 'Short sentences', read: ['te-story-2'],
    objectives: [
      O({ id: 'order', title: 'వాక్యం కూర్చు', titleEn: 'Put words in order', intro: 'తెలుగు వాక్యంలో సాధారణంగా క్రియ చివర వస్తుంది: నేను బడికి వెళ్తాను.', introEn: 'In a Telugu sentence the verb usually comes last: నేను బడికి వెళ్తాను (I go to school).',
        examples: [ex('ఆవు పాలు ఇస్తుంది.', 'The cow gives milk.'), ex('అమ్మ అన్నం వండింది.', 'Mother cooked rice.')],
        items: [
          order('so-1', 'పదాలను సరైన క్రమంలో అమర్చు.', ['నేను', 'బడికి', 'వెళ్తాను.'], { en: 'I go to school.', alts: [['బడికి', 'నేను', 'వెళ్తాను.']] }),
          order('so-2', 'పదాలను సరైన క్రమంలో అమర్చు.', ['ఆవు', 'పాలు', 'ఇస్తుంది.'], { en: 'The cow gives milk.' }),
          order('so-3', 'పదాలను సరైన క్రమంలో అమర్చు.', ['అమ్మ', 'అన్నం', 'వండింది.'], { en: 'Mother cooked rice.', alts: [['అన్నం', 'అమ్మ', 'వండింది.']] }),
          order('so-4', 'పదాలను సరైన క్రమంలో అమర్చు.', ['పిల్లలు', 'ఆట', 'ఆడుతున్నారు.'], { en: 'The children are playing a game.' }),
          order('so-5', 'పదాలను సరైన క్రమంలో అమర్చు.', ['చిలుక', 'పచ్చగా', 'ఉంది.'], { en: 'The parrot is green.' }),
          order('so-6', 'పదాలను సరైన క్రమంలో అమర్చు.', ['మా', 'ఇంట్లో', 'పిల్లి', 'ఉంది.'], { en: 'There is a cat in our house.' }),
        ] }),
      O({ id: 'blank', title: 'ఖాళీ నింపు', titleEn: 'Fill the blank', intro: 'వాక్యానికి సరిపోయే పదం ఎంచుకో.', introEn: 'Choose the word that fits the sentence.',
        examples: [ex('కోడి గుడ్లు పెడుతుంది.', 'The hen lays eggs.'), ex('మనం చెవులతో వింటాం.', 'We hear with our ears.')],
        items: [
          mcq('sb-1', 'కోడి ____ పెడుతుంది.', ['గుడ్లు', 'పాలు', 'పండ్లు'], 'గుడ్లు', { en: 'The hen lays ____.', gloss: { 'గుడ్లు': 'eggs', 'పాలు': 'milk', 'పండ్లు': 'fruits' } }),
          mcq('sb-2', 'మనం ____ తో చూస్తాం.', ['కళ్ళ', 'చెవుల', 'కాళ్ళ'], 'కళ్ళ', { en: 'We see with our ____.', gloss: { 'కళ్ళ': 'eyes', 'చెవుల': 'ears', 'కాళ్ళ': 'legs' } }),
          mcq('sb-3', 'చేప ____ లో ఈదుతుంది.', ['నీటి', 'చెట్టు', 'గాలి'], 'నీటి', { en: 'A fish swims in ____.', gloss: { 'నీటి': 'water', 'చెట్టు': 'tree', 'గాలి': 'air' } }),
          mcq('sb-4', 'సూర్యుడు ____ ఉదయిస్తాడు.', ['తూర్పున', 'పడమర', 'కింద'], 'తూర్పున', { en: 'The sun rises in the ____.', gloss: { 'తూర్పున': 'east', 'పడమర': 'west', 'కింద': 'below' } }),
          mcq('sb-5', 'మనం ____ తో వింటాం.', ['చెవుల', 'ముక్కు', 'చేతుల'], 'చెవుల', { en: 'We hear with our ____.', gloss: { 'చెవుల': 'ears', 'ముక్కు': 'nose', 'చేతుల': 'hands' } }),
          mcq('sb-6', 'రాత్రి ఆకాశంలో ____ కనిపిస్తాడు.', ['చంద్రుడు', 'సూర్యుడు', 'రైతు'], 'చంద్రుడు', { en: 'At night we see the ____ in the sky.', gloss: { 'చంద్రుడు': 'moon', 'సూర్యుడు': 'sun', 'రైతు': 'farmer' } }),
        ] }),
    ],
  },
  {
    id: 'te-2-words', level: 4, title: 'వ్యతిరేక పదాలు, వారాలు, నెలలు', titleEn: 'Opposites, days and months',
    objectives: [
      O({ id: 'opposites', title: 'వ్యతిరేక పదాలు', titleEn: 'Opposite words', intro: 'పెద్ద × చిన్న. అర్థం తిరగబడే పదాలను వ్యతిరేక పదాలు అంటారు.', introEn: 'Big × small. Words with opposite meanings are called వ్యతిరేక పదాలు.',
        examples: [ex('పగలు × రాత్రి', 'day × night'), ex('లోపల × బయట', 'inside × outside')],
        items: pairItems('op', OPPOSITES, (w) => `${w} – దీనికి వ్యతిరేక పదం ఏది?`, (w, en) => `What is the opposite of ${w}? (${en})`, 'Opposite') }),
      O({ id: 'days', title: 'వారాలు', titleEn: 'Days of the week', intro: 'వారానికి ఏడు రోజులు: ఆదివారం నుండి శనివారం వరకు.', introEn: 'A week has seven days, from ఆదివారం (Sunday) to శనివారం (Saturday).',
        examples: [ex('ఆదివారం, సోమవారం, మంగళవారం', 'Sunday, Monday, Tuesday'), ex('బుధవారం, గురువారం, శుక్రవారం, శనివారం', 'Wednesday, Thursday, Friday, Saturday')], items: dayItems() }),
      O({ id: 'months', title: 'తెలుగు నెలలు', titleEn: 'Telugu months', intro: 'తెలుగు సంవత్సరం చైత్రంతో మొదలవుతుంది (ఉగాది). పన్నెండు నెలలు ఉన్నాయి.', introEn: 'The Telugu year begins with చైత్రం (Ugadi) and has twelve months.',
        examples: [ex('చైత్రం, వైశాఖం, జ్యేష్ఠం, ఆషాఢం', 'The first four months'), ex('… మాఘం, ఫాల్గుణం', 'The last two months')], items: monthItems() }),
    ],
  },
  // ===== Class 3 =====
  {
    id: 'te-3-ottulu', level: 5, title: 'ద్విత్వాక్షరాలు, సంయుక్తాక్షరాలు', titleEn: 'Double and mixed conjuncts', read: ['te-story-3'],
    objectives: [
      O({ id: 'kind', title: 'ద్విత్వమా? సంయుక్తమా?', titleEn: 'Double or mixed?', intro: 'ఒక హల్లుకు అదే హల్లు ఒత్తుగా వస్తే ద్విత్వాక్షరం (క్క). వేరే హల్లు ఒత్తుగా వస్తే సంయుక్తాక్షరం (క్ర).', introEn: 'Same consonant doubled = ద్విత్వాక్షరం (క్క). A different consonant underneath = సంయుక్తాక్షరం (క్ర).',
        examples: [ex('అక్క – క్క – ద్విత్వాక్షరం', 'అక్క: క under క, a double conjunct'), ex('పత్రం – త్ర – సంయుక్తాక్షరం', 'పత్రం: ర under త, a mixed conjunct')],
        items: classify('dk', [['అక్క (క్క)', 'ద్విత్వాక్షరం'], ['విద్య (ద్య)', 'సంయుక్తాక్షరం'], ['కుక్క (క్క)', 'ద్విత్వాక్షరం'], ['స్నేహం (స్నే)', 'సంయుక్తాక్షరం'], ['పత్రం (త్ర)', 'సంయుక్తాక్షరం'], ['అమ్మ (మ్మ)', 'ద్విత్వాక్షరం'], ['చెట్టు (ట్టు)', 'ద్విత్వాక్షరం'], ['ప్రేమ (ప్రే)', 'సంయుక్తాక్షరం']],
          ['ద్విత్వాక్షరం', 'సంయుక్తాక్షరం'], (t) => `${t} – ఇది ద్విత్వాక్షరమా, సంయుక్తాక్షరమా?`,
          (r) => ({ en: `${r[0]}: is this a double conjunct (ద్విత్వం) or a mixed conjunct (సంయుక్తం)?`, gloss: { 'ద్విత్వాక్షరం': 'double (same letter)', 'సంయుక్తాక్షరం': 'mixed (different letters)' } })) }),
      O({ id: 'spell', title: 'విని సరైన వర్ణక్రమం ఎంచుకో', titleEn: 'Listen and choose the spelling', intro: 'పదాన్ని జాగ్రత్తగా విని, సరిగ్గా వ్రాసిన పదాన్ని ఎంచుకో.', introEn: 'Listen carefully, then choose the correctly spelled word (dictation).',
        examples: [ex('పుస్తకం – స్త ఒత్తు', 'పుస్తకం (book) has the conjunct స్త'), ex('పాఠశాల – ఠ, శ', 'పాఠశాల (school) uses ఠ and శ')],
        items: ([['పుస్తకం', 'book', ['పుసతకం', 'పూస్తకం']], ['విద్యార్థి', 'student', ['విధ్యార్థి', 'విద్యార్తి']], ['స్నేహితుడు', 'friend', ['స్నెహితుడు', 'స్నేహితుదు']], ['ప్రపంచం', 'world', ['పరపంచం', 'ప్రపంఛం']], ['పాఠశాల', 'school', ['పాటశాల', 'పాఠషాల']], ['కృష్ణుడు', 'Krishna', ['క్రిష్ణుడు', 'కృష్నుడు']]] as const)
          .map(([w, en, wr], i) => listen(`sp-${i + 1}`, 'విను. సరిగ్గా వ్రాసిన పదం ఏది?', w, [w, ...wr], w, { en: `Listen. Which spelling is correct? (${en})`, explain: `సరైన వర్ణక్రమం: ${w}`, explainEn: `The correct spelling is ${w} (${en}).` })) }),
    ],
  },
  {
    id: 'te-3-grammar', level: 5, title: 'నామవాచకం, సర్వనామం', titleEn: 'Nouns and pronouns',
    objectives: [
      O({ id: 'noun', title: 'నామవాచకం', titleEn: 'Nouns', intro: 'వ్యక్తులు, స్థలాలు, వస్తువులు, జంతువుల పేర్లను నామవాచకాలు అంటారు.', introEn: 'Names of people, places, things and animals are nouns (నామవాచకాలు).',
        examples: [ex('రాము, హైదరాబాదు, పుస్తకం, ఆవు', 'Ramu, Hyderabad, book, cow – all nouns'), ex('గోదావరి ఒక నది.', 'Godavari is a river – గోదావరి and నది are nouns.')],
        items: ([['రాము', 'పరుగెత్తాడు', 'అందమైన', 'త్వరగా'], ['పుస్తకం', 'రాశాడు', 'ఎర్రని', 'మెల్లగా'], ['హైదరాబాదు', 'తిన్నాడు', 'చల్లని', 'వేగంగా'], ['ఆవు', 'ఆడింది', 'పొడవైన', 'నెమ్మదిగా'], ['చెట్టు', 'నవ్వింది', 'తియ్యని', 'ఇప్పుడు'], ['గోదావరి', 'పాడాడు', 'తెల్లని', 'అక్కడ']])
          .map((c, i) => mcq(`nn-${i + 1}`, 'కింది వాటిలో నామవాచకం ఏది?', c, c[0], { en: 'Which of these is a noun (నామవాచకం)?', explain: `${c[0]} ఒక పేరు – నామవాచకం.`, explainEn: `${c[0]} is a name, so it is a noun.` })) }),
      O({ id: 'pronoun', title: 'సర్వనామం', titleEn: 'Pronouns', intro: 'నామవాచకానికి బదులుగా వాడే పదం సర్వనామం: నేను, నువ్వు, అతను, ఆమె, అది, వారు, మేము.', introEn: 'A word used instead of a noun is a pronoun (సర్వనామం): నేను I, నువ్వు you, అతను he, ఆమె she, అది it, వారు they, మేము we.',
        examples: [ex('రాము బడికి వెళ్ళాడు. అతను బాగా చదువుతాడు.', 'Ramu went to school. He studies well.'), ex('మా కుక్క పేరు టామీ. అది తెలివైనది.', 'Our dog is Tommy. It is clever.')],
        items: ([['రాము బడికి వెళ్ళాడు. ___ బాగా చదువుతాడు.', 'అతను', ['ఆమె', 'అది', 'మేము'], 'Ramu went to school. ___ studies well.'], ['సీత పాట పాడింది. ___ బాగా పాడుతుంది.', 'ఆమె', ['అతను', 'అది', 'మేము'], 'Sita sang a song. ___ sings well.'], ['మా కుక్క పేరు టామీ. ___ చాలా తెలివైనది.', 'అది', ['అతను', 'ఆమె', 'మీరు'], 'Our dog is Tommy. ___ is very clever.'], ['రవి, గీత బజారుకు వెళ్ళారు. ___ పండ్లు కొన్నారు.', 'వారు', ['అది', 'ఆమె', 'నేను'], 'Ravi and Gita went to the market. ___ bought fruit.'], ['నా పేరు అను. ___ మూడో తరగతి చదువుతున్నాను.', 'నేను', ['నువ్వు', 'అతను', 'వారు'], 'My name is Anu. ___ am in Class 3.'], ['మేము ఆడుకుంటున్నాం. ___ కూడా రా!', 'నువ్వు', ['నేను', 'అది', 'వారు'], 'We are playing. ___ come too!']] as const)
          .map(([p, a, w, en], i) => mcq(`pn-${i + 1}`, p, [a, ...w], a, { en: `${en} – choose the pronoun.`, gloss: { 'అతను': 'he', 'ఆమె': 'she', 'అది': 'it', 'వారు': 'they', 'నేను': 'I', 'నువ్వు': 'you', 'మేము': 'we', 'మీరు': 'you (plural/respect)' } })) }),
    ],
  },
  // ===== Class 4 =====
  {
    id: 'te-4-grammar', level: 6, title: 'క్రియ, విశేషణం', titleEn: 'Verbs and adjectives', read: ['te-story-4'],
    objectives: [
      O({ id: 'verb', title: 'క్రియ', titleEn: 'Verbs', intro: 'పనిని తెలిపే పదం క్రియ: ఆడాడు, చదివింది, తిన్నారు.', introEn: 'A word that tells an action is a verb (క్రియ): played, read, ate.',
        examples: [ex('పిల్లలు మైదానంలో ఆడారు.', 'The children played in the ground – ఆడారు is the verb.'), ex('కోకిల పాడుతుంది.', 'The cuckoo sings – పాడుతుంది is the verb.')],
        items: ([['ఆడాడు', 'బంతి', 'పెద్ద', 'మైదానం'], ['రాసింది', 'కలం', 'నీలి', 'కాగితం'], ['పరుగెత్తింది', 'కుందేలు', 'తెల్లని', 'అడవి'], ['తిన్నారు', 'అన్నం', 'వేడి', 'పిల్లలు'], ['పాడుతుంది', 'కోకిల', 'తియ్యని', 'తోట'], ['నిద్రపోయాడు', 'తాత', 'మంచం', 'ముసలి']])
          .map((c, i) => mcq(`vb-${i + 1}`, 'కింది వాటిలో క్రియా పదం ఏది?', c, c[0], { en: 'Which of these is a verb (క్రియ)?', explain: `${c[0]} పనిని తెలుపుతుంది.`, explainEn: `${c[0]} tells an action.` })) }),
      O({ id: 'adjective', title: 'విశేషణం', titleEn: 'Adjectives', intro: 'నామవాచకం గుణాన్ని తెలిపే పదం విశేషణం: ఎర్రని గులాబీ, పొడవైన చెట్టు.', introEn: 'A word that describes a noun is an adjective (విశేషణం): red rose, tall tree.',
        examples: [ex('తియ్యని మామిడి పండు', 'a sweet mango – తియ్యని is the adjective'), ex('చల్లని గాలి', 'a cool breeze – చల్లని is the adjective')],
        items: ([['ఎర్రని గులాబీ పూసింది.', 'ఎర్రని', ['గులాబీ', 'పూసింది']], ['పొడవైన చెట్టు మీద కాకి ఉంది.', 'పొడవైన', ['చెట్టు', 'కాకి', 'ఉంది']], ['తియ్యని పండు తిన్నాను.', 'తియ్యని', ['పండు', 'తిన్నాను']], ['చిన్న పాప నవ్వింది.', 'చిన్న', ['పాప', 'నవ్వింది']], ['చల్లని గాలి వీస్తోంది.', 'చల్లని', ['గాలి', 'వీస్తోంది']], ['తెలివైన విద్యార్థి బహుమతి గెలిచాడు.', 'తెలివైన', ['విద్యార్థి', 'బహుమతి', 'గెలిచాడు']]] as const)
          .map(([s, a, w], i) => mcq(`aj-${i + 1}`, `“${s}” – ఈ వాక్యంలో విశేషణం ఏది?`, [a, ...w], a, { en: 'Which word in this sentence is the adjective (describing word)?', explain: `${a} గుణాన్ని తెలుపుతుంది.`, explainEn: `${a} describes the noun.` })) }),
    ],
  },
  {
    id: 'te-4-vocab', level: 6, title: 'లింగాలు, పర్యాయపదాలు', titleEn: 'Gender and synonyms',
    objectives: [
      O({ id: 'gender', title: 'లింగాలు', titleEn: 'Gender', intro: 'పురుషులను తెలిపేది పుంలింగం, స్త్రీలను తెలిపేది స్త్రీలింగం, మిగిలినవి (వస్తువులు మొదలైనవి) నపుంసకలింగం.', introEn: 'Words for males are పుంలింగం (masculine), for females స్త్రీలింగం (feminine), and for things నపుంసకలింగం (neuter).',
        examples: [ex('రాజు – పుంలింగం, రాణి – స్త్రీలింగం', 'king – masculine; queen – feminine'), ex('పుస్తకం – నపుంసకలింగం', 'book – neuter')],
        items: classify('lg', [['అన్న', 'పుంలింగం', 'elder brother'], ['అక్క', 'స్త్రీలింగం', 'elder sister'], ['చెట్టు', 'నపుంసకలింగం', 'tree'], ['రాజు', 'పుంలింగం', 'king'], ['రాణి', 'స్త్రీలింగం', 'queen'], ['పుస్తకం', 'నపుంసకలింగం', 'book'], ['తాత', 'పుంలింగం', 'grandfather'], ['అవ్వ', 'స్త్రీలింగం', 'grandmother']],
          ['పుంలింగం', 'స్త్రీలింగం', 'నపుంసకలింగం'], (t) => `${t} – ఇది ఏ లింగం?`, (r) => ({ en: `${r[0]} (${r[2]}) – which gender?`, gloss: { 'పుంలింగం': 'masculine', 'స్త్రీలింగం': 'feminine', 'నపుంసకలింగం': 'neuter' } })) }),
      O({ id: 'synonyms', title: 'పర్యాయపదాలు', titleEn: 'Synonyms', intro: 'ఒకే అర్థం వచ్చే వేరు వేరు పదాలు పర్యాయపదాలు: సూర్యుడు – రవి – భానుడు.', introEn: 'Different words with the same meaning are synonyms (పర్యాయపదాలు): సూర్యుడు – రవి – భానుడు (sun).',
        examples: [ex('నీరు – జలం', 'water'), ex('పువ్వు – పుష్పం', 'flower')],
        items: pairItems('sy', SYNONYMS, (w) => `${w} – దీనికి పర్యాయపదం ఏది?`, (w, en) => `Which word means the same as ${w} (${en})?`, 'Synonym') }),
    ],
  },
  // ===== Class 5 =====
  {
    id: 'te-5-grammar', level: 7, title: 'వచనాలు, కాలాలు', titleEn: 'Number and tense', read: ['te-story-5'],
    objectives: [
      O({ id: 'plural', title: 'బహువచనం', titleEn: 'Plurals', intro: 'ఒకటిని తెలిపేది ఏకవచనం (పుస్తకం). ఒకటి కంటే ఎక్కువను తెలిపేది బహువచనం (పుస్తకాలు).', introEn: 'One thing = ఏకవచనం (singular). More than one = బహువచనం (plural).',
        examples: [ex('పువ్వు → పువ్వులు', 'flower → flowers (add -లు)'), ex('చెట్టు → చెట్లు', 'tree → trees'), ex('ఇల్లు → ఇళ్ళు', 'house → houses (the sound changes)')],
        items: PLURALS.map(([w, a, en], i) => mcq(`pl-${i + 1}`, `${w} – బహువచనం ఏది?`, [a, w, ({ 'పుస్తకం': 'పుస్తకంలు', 'చెట్టు': 'చెట్టులు', 'పువ్వు': 'పూవ్వులు', 'ఆవు': 'ఆవ్వులు', 'కాయ': 'కాయాలు', 'పిల్లి': 'పిల్లిలు', 'ఇల్లు': 'ఇల్లులు' } as Record<string, string>)[w]], a, { en: `What is the plural of ${w}? (${en})`, explain: `${w} → ${a}` })) }),
      O({ id: 'number', title: 'ఏకవచనమా? బహువచనమా?', titleEn: 'Singular or plural?', intro: 'పదం ఒకదాన్ని తెలుపుతుందా, ఎక్కువను తెలుపుతుందా చూడు.', introEn: 'Does the word mean one, or more than one?',
        examples: [ex('కలం – ఏకవచనం', 'pen – singular'), ex('ఆటలు – బహువచనం', 'games – plural')],
        items: classify('nm', [['పిల్లలు', 'బహువచనం', 'children'], ['కలం', 'ఏకవచనం', 'pen'], ['ఆటలు', 'బహువచనం', 'games'], ['నది', 'ఏకవచనం', 'river'], ['పక్షులు', 'బహువచనం', 'birds'], ['గడియారం', 'ఏకవచనం', 'clock']],
          ['ఏకవచనం', 'బహువచనం'], (t) => `${t} – ఏకవచనమా? బహువచనమా?`, (r) => ({ en: `${r[0]} (${r[2]}) – singular or plural?`, gloss: { 'ఏకవచనం': 'singular', 'బహువచనం': 'plural' } })) }),
      O({ id: 'tense', title: 'కాలాలు', titleEn: 'Tenses', intro: 'జరిగిపోయిన పని – భూతకాలం. జరుగుతున్న పని – వర్తమానకాలం. జరగబోయే పని – భవిష్యత్కాలం.', introEn: 'Past = భూతకాలం, present = వర్తమానకాలం, future = భవిష్యత్కాలం.',
        examples: [ex('నేను నిన్న సినిమా చూశాను. – భూతకాలం', 'I watched a film yesterday – past'), ex('అమ్మ ఇప్పుడు వంట చేస్తోంది. – వర్తమానకాలం', 'Mother is cooking now – present'), ex('రేపు మేము ఊరికి వెళ్తాము. – భవిష్యత్కాలం', 'Tomorrow we will go to our village – future')],
        items: classify('tn', [['నేను నిన్న సినిమా చూశాను.', 'భూతకాలం', 'I watched a film yesterday.'], ['అమ్మ ఇప్పుడు వంట చేస్తోంది.', 'వర్తమానకాలం', 'Mother is cooking now.'], ['రేపు మేము ఊరికి వెళ్తాము.', 'భవిష్యత్కాలం', 'Tomorrow we will go to our village.'], ['పిల్లలు మైదానంలో ఆడుతున్నారు.', 'వర్తమానకాలం', 'The children are playing in the ground.'], ['పోయిన సంవత్సరం వర్షాలు బాగా కురిశాయి.', 'భూతకాలం', 'Last year it rained well.'], ['వచ్చే వారం పరీక్షలు జరుగుతాయి.', 'భవిష్యత్కాలం', 'The exams will be held next week.'], ['తాత పొద్దున్నే పేపరు చదివాడు.', 'భూతకాలం', 'Grandfather read the paper early in the morning.']],
          ['భూతకాలం', 'వర్తమానకాలం', 'భవిష్యత్కాలం'], (t) => `“${t}” – ఇది ఏ కాలం?`, (r) => ({ en: `“${r[2]}” – which tense?`, gloss: { 'భూతకాలం': 'past', 'వర్తమానకాలం': 'present', 'భవిష్యత్కాలం': 'future' } })) }),
    ],
  },
  {
    id: 'te-5-vocab', level: 7, title: 'వ్యతిరేకపదాలు, వాక్య నిర్మాణం', titleEn: 'Antonyms and sentence building',
    objectives: [
      O({ id: 'antonyms', title: 'వ్యతిరేకపదాలు', titleEn: 'Antonyms', intro: 'కొన్ని పదాలకు ముందు “అ”, “అన”, “నిర”, “అప” చేర్చితే వ్యతిరేకార్థం వస్తుంది: న్యాయం – అన్యాయం.', introEn: 'Adding అ-, అన-, నిర-, అప- often gives the opposite meaning: న్యాయం (justice) – అన్యాయం (injustice).',
        examples: [ex('జయం × అపజయం', 'victory × defeat'), ex('ఆశ × నిరాశ', 'hope × despair'), ex('సుఖం × దుఃఖం', 'happiness × sorrow')],
        items: pairItems('an', ANTONYMS, (w) => `${w} – వ్యతిరేకపదం ఏది?`, (w, en) => `What is the antonym of ${w}? (${en})`, 'Antonym') }),
      O({ id: 'build', title: 'వాక్య నిర్మాణం', titleEn: 'Building sentences', intro: 'కర్త (ఎవరు), కర్మ (ఏమిటి), క్రియ (ఏం చేశారు) – ఈ క్రమంలో వాక్యం కూర్చుదాం.', introEn: 'Build sentences in the order subject – object – verb.',
        examples: [ex('రైతు పొలంలో విత్తనాలు చల్లాడు.', 'The farmer sowed seeds in the field.'), ex('అమ్మమ్మ మాకు కథ చెప్పింది.', 'Grandmother told us a story.')],
        items: [
          order('sn-1', 'పదాలను సరైన క్రమంలో అమర్చి వాక్యం తయారు చేయి.', ['మా', 'బడిలో', 'పెద్ద', 'గ్రంథాలయం', 'ఉంది.'], { en: 'There is a big library in our school.' }),
          order('sn-2', 'పదాలను సరైన క్రమంలో అమర్చి వాక్యం తయారు చేయి.', ['రైతు', 'పొలంలో', 'విత్తనాలు', 'చల్లాడు.'], { en: 'The farmer sowed seeds in the field.', alts: [['పొలంలో', 'రైతు', 'విత్తనాలు', 'చల్లాడు.']] }),
          order('sn-3', 'పదాలను సరైన క్రమంలో అమర్చి వాక్యం తయారు చేయి.', ['వర్షం', 'పడటంతో', 'చెరువు', 'నిండింది.'], { en: 'The pond filled up because it rained.' }),
          order('sn-4', 'పదాలను సరైన క్రమంలో అమర్చి వాక్యం తయారు చేయి.', ['మేము', 'ఆదివారం', 'జంతుప్రదర్శనశాలకు', 'వెళ్ళాము.'], { en: 'We went to the zoo on Sunday.', alts: [['ఆదివారం', 'మేము', 'జంతుప్రదర్శనశాలకు', 'వెళ్ళాము.']] }),
          order('sn-5', 'పదాలను సరైన క్రమంలో అమర్చి వాక్యం తయారు చేయి.', ['అమ్మమ్మ', 'మాకు', 'కథ', 'చెప్పింది.'], { en: 'Grandmother told us a story.' }),
          order('sn-6', 'పదాలను సరైన క్రమంలో అమర్చి వాక్యం తయారు చేయి.', ['పక్షులు', 'ఆకాశంలో', 'ఎగురుతున్నాయి.'], { en: 'Birds are flying in the sky.', alts: [['ఆకాశంలో', 'పక్షులు', 'ఎగురుతున్నాయి.']] }),
        ] }),
    ],
  },
  // ===== Class 6 =====
  {
    id: 'te-6-sandhi', level: 8, title: 'సంధులు – 1 (సంస్కృత సంధులు)', titleEn: 'Sandhi 1 (Sanskrit sandhis)', read: ['te-passage-6'],
    objectives: sandhiObjectives([
      { id: 'savarna', name: 'సవర్ణదీర్ఘ సంధి', nameEn: 'Savarnadeergha sandhi',
        rule: 'అ, ఇ, ఉ, ఋ లకు అదే (సవర్ణమైన) అచ్చు పరమైతే వాటి దీర్ఘం ఒక్కటే వస్తుంది: అ + అ = ఆ, ఇ + ఇ = ఈ, ఉ + ఉ = ఊ.',
        ruleEn: 'When a vowel meets the same kind of vowel, they merge into its long form: అ + అ = ఆ, ఇ + ఇ = ఈ, ఉ + ఉ = ఊ.',
        joins: [['విద్యా', 'అర్థి', 'విద్యార్థి', ['విద్యర్థి', 'విద్యేర్థి']], ['దేవ', 'ఆలయం', 'దేవాలయం', ['దేవలయం', 'దేవైలయం']], ['రవి', 'ఇంద్రుడు', 'రవీంద్రుడు', ['రవేంద్రుడు', 'రవ్యింద్రుడు']], ['గురు', 'ఉపదేశం', 'గురూపదేశం', ['గురోపదేశం', 'గుర్వుపదేశం']], ['కవి', 'ఈశ్వరుడు', 'కవీశ్వరుడు', ['కవేశ్వరుడు', 'కవ్యీశ్వరుడు']]],
        identify: [['హిమాలయం', 'హిమ + ఆలయం']] },
      { id: 'guna', name: 'గుణ సంధి', nameEn: 'Guna sandhi',
        rule: 'అకారానికి ఇ, ఉ, ఋ లు పరమైతే వరుసగా ఏ, ఓ, అర్ వస్తాయి: అ + ఇ = ఏ, అ + ఉ = ఓ, అ + ఋ = అర్.',
        ruleEn: 'అ followed by ఇ, ఉ, ఋ becomes ఏ, ఓ, అర్ respectively.',
        joins: [['దేవ', 'ఇంద్రుడు', 'దేవేంద్రుడు', ['దేవింద్రుడు', 'దేవైంద్రుడు']], ['సూర్య', 'ఉదయం', 'సూర్యోదయం', ['సూర్యుదయం', 'సూర్యౌదయం']], ['రాజ', 'ఋషి', 'రాజర్షి', ['రాజృషి', 'రాజేర్షి']], ['గణ', 'ఈశుడు', 'గణేశుడు', ['గణీశుడు', 'గణైశుడు']], ['మహా', 'ఉత్సవం', 'మహోత్సవం', ['మహూత్సవం', 'మహౌత్సవం']]],
        identify: [['నరేంద్రుడు', 'నర + ఇంద్రుడు']] },
      { id: 'vruddhi', name: 'వృద్ధి సంధి', nameEn: 'Vruddhi sandhi',
        rule: 'అకారానికి ఏ, ఐ లు పరమైతే ఐ; ఓ, ఔ లు పరమైతే ఔ వస్తాయి.',
        ruleEn: 'అ followed by ఏ/ఐ becomes ఐ; followed by ఓ/ఔ becomes ఔ.',
        joins: [['ఏక', 'ఏక', 'ఏకైక', ['ఏకేక', 'ఏకాక']], ['వన', 'ఓషధి', 'వనౌషధి', ['వనోషధి', 'వనాషధి']], ['సదా', 'ఏవ', 'సదైవ', ['సదేవ', 'సదావ']], ['దివ్య', 'ఔషధం', 'దివ్యౌషధం', ['దివ్యోషధం', 'దివ్యాషధం']], ['మహా', 'ఐశ్వర్యం', 'మహైశ్వర్యం', ['మహేశ్వర్యం', 'మహాశ్వర్యం']]],
        identify: [['ఏకైక', 'ఏక + ఏక']] },
    ], ['సవర్ణదీర్ఘ సంధి', 'గుణ సంధి', 'వృద్ధి సంధి', 'యణాదేశ సంధి']),
  },
  // ===== Class 7 =====
  {
    id: 'te-7-sandhi', level: 9, title: 'సంధులు – 2', titleEn: 'Sandhi 2', read: ['te-passage-7'],
    objectives: sandhiObjectives([
      { id: 'yanadesha', name: 'యణాదేశ సంధి', nameEn: 'Yanadesha sandhi',
        rule: 'ఇ, ఉ, ఋ లకు వేరే (అసవర్ణ) అచ్చు పరమైతే వరుసగా య, వ, ర లు వస్తాయి.',
        ruleEn: 'ఇ, ఉ, ఋ followed by a different vowel change to య, వ, ర respectively.',
        joins: [['అతి', 'అంతం', 'అత్యంతం', ['అతంతం', 'అతీంతం']], ['ప్రతి', 'ఏకం', 'ప్రత్యేకం', ['ప్రతేకం', 'ప్రతైకం']], ['సు', 'ఆగతం', 'స్వాగతం', ['సూగతం', 'సాగతం']], ['అను', 'అయం', 'అన్వయం', ['అనూయం', 'అనయం']], ['పితృ', 'ఆర్జితం', 'పిత్రార్జితం', ['పితార్జితం', 'పితృర్జితం']]],
        identify: [['ఇత్యాది', 'ఇతి + ఆది']] },
      { id: 'atva', name: 'అత్వ సంధి', nameEn: 'Atva sandhi', also: 'ఇత్వ సంధి',
        rule: 'అత్వ సంధి: పదం చివరి “అ” కు అచ్చు పరమైతే సంధి తరచుగా (బహుళంగా) జరుగుతుంది – రామ + అయ్య = రామయ్య. ఇత్వ సంధి: ఏమి మొదలైన పదాల చివరి “ఇ” కు అచ్చు పరమైతే సంధి వికల్పంగా జరుగుతుంది – ఏమి + అంటివి = ఏమంటివి (ఏమియంటివి).',
        ruleEn: 'Atva: a final అ followed by a vowel usually merges (రామ + అయ్య = రామయ్య). Itva: the final ఇ of words like ఏమి optionally merges (ఏమి + అంటివి = ఏమంటివి or ఏమియంటివి).',
        joins: [['రామ', 'అయ్య', 'రామయ్య', ['రామాయ్య', 'రామేయ్య']], ['మేన', 'అల్లుడు', 'మేనల్లుడు', ['మేనాల్లుడు', 'మేనెల్లుడు']], ['సీత', 'అమ్మ', 'సీతమ్మ', ['సీతామ్మ', 'సీతెమ్మ']], ['వచ్చిన', 'అప్పుడు', 'వచ్చినప్పుడు', ['వచ్చినాప్పుడు', 'వచ్చినెప్పుడు']], ['ఏమి', 'అంటివి', 'ఏమంటివి', ['ఏమాంటివి', 'ఏమెంటివి']], ['మరి', 'ఏమి', 'మరేమి', ['మరైమి', 'మరామి']]],
        identify: [['అదేమి', 'అది + ఏమి', 'ఇత్వ సంధి']] },
      { id: 'utva', name: 'ఉత్వ సంధి', nameEn: 'Utva sandhi',
        rule: 'పదం చివరి “ఉ” కు అచ్చు పరమైతే సంధి తప్పక (నిత్యంగా) జరుగుతుంది: రాముడు + అతడు = రాముడతడు.',
        ruleEn: 'A final ఉ followed by a vowel always merges: రాముడు + అతడు = రాముడతడు.',
        joins: [['రాముడు', 'అతడు', 'రాముడతడు', ['రాముడాతడు', 'రాముడుతడు']], ['వాడు', 'ఎవడు', 'వాడెవడు', ['వాడువడు', 'వాడేవడు']], ['లేదు', 'అని', 'లేదని', ['లేదుని', 'లేదాని']], ['కాదు', 'అని', 'కాదని', ['కాదుని', 'కాదేని']], ['మనము', 'ఉంటిమి', 'మనముంటిమి', ['మనమూంటిమి', 'మనమొంటిమి']]],
        identify: [['పుస్తకమిది', 'పుస్తకము + ఇది']] },
    ], ['అత్వ సంధి', 'ఇత్వ సంధి', 'ఉత్వ సంధి', 'యణాదేశ సంధి']),
  },
  {
    id: 'te-7-samasa', level: 9, title: 'సమాసాలు – 1', titleEn: 'Compounds 1 (సమాసాలు)',
    objectives: [
      O({ id: 'dvandva-dvigu', title: 'ద్వంద్వ, ద్విగు సమాసాలు', titleEn: 'Dvandva and dvigu compounds',
        intro: 'రెండు పదాలు కలిసి ఒకే పదంగా మారితే సమాసం. ద్వంద్వం: రెండు పదాలకూ సమాన ప్రాధాన్యం (తల్లిదండ్రులు). ద్విగు: మొదటి పదం సంఖ్య (ముల్లోకాలు).',
        introEn: 'Two words joined into one form a compound (సమాసం). Dvandva: both parts equally important (తల్లిదండ్రులు, parents). Dvigu: the first part is a number (ముల్లోకాలు, the three worlds).',
        examples: [ex('తల్లిదండ్రులు = తల్లియును, తండ్రియును – ద్వంద్వ సమాసం', 'mother and father – dvandva'), ex('ముల్లోకాలు = మూడైన లోకాలు – ద్విగు సమాసం', 'the three worlds – dvigu'), ex('ఏడుకొండలు = ఏడు సంఖ్య గల కొండలు – ద్విగు సమాసం', 'the seven hills – dvigu')],
        items: [
          ...classify('dv', [['తల్లిదండ్రులు', 'ద్వంద్వ సమాసం', 'parents'], ['అన్నదమ్ములు', 'ద్వంద్వ సమాసం', 'brothers'], ['సీతారాములు', 'ద్వంద్వ సమాసం', 'Sita and Rama'], ['ముల్లోకాలు', 'ద్విగు సమాసం', 'the three worlds'], ['నవరసాలు', 'ద్విగు సమాసం', 'the nine rasas'], ['ఏడుకొండలు', 'ద్విగు సమాసం', 'the seven hills']],
            ['ద్వంద్వ సమాసం', 'ద్విగు సమాసం', 'తత్పురుష సమాసం'], (t) => `${t} – ఇది ఏ సమాసం?`, (r) => ({ en: `${r[0]} (${r[2]}) – which compound?` })),
          mcq('dv-7', 'తల్లిదండ్రులు – సరైన విగ్రహవాక్యం ఏది?', ['తల్లియును, తండ్రియును', 'తల్లి యొక్క తండ్రి', 'తల్లి వంటి తండ్రి'], 'తల్లియును, తండ్రియును', { en: 'Choose the correct expansion (విగ్రహవాక్యం) of తల్లిదండ్రులు.' }),
          mcq('dv-8', 'నవరసాలు – సరైన విగ్రహవాక్యం ఏది?', ['తొమ్మిది సంఖ్య గల రసాలు', 'కొత్తవైన రసాలు', 'రసాల యొక్క కొత్తదనం'], 'తొమ్మిది సంఖ్య గల రసాలు', { en: 'Choose the expansion of నవరసాలు. (Here నవ means nine, not new.)' }),
        ] }),
    ],
  },
  // ===== Class 8 =====
  {
    id: 'te-8-samasa', level: 10, title: 'సమాసాలు – 2', titleEn: 'Compounds 2', read: ['te-passage-8'],
    objectives: [
      O({ id: 'identify', title: 'సమాసం గుర్తించు', titleEn: 'Identify the compound',
        intro: 'తత్పురుష: విభక్తి ప్రత్యయం లోపించింది (రాజభటుడు = రాజు యొక్క భటుడు). కర్మధారయ: విశేషణం + విశేష్యం (నల్లకలువ). బహువ్రీహి: రెండు పదాలు కాక మరో అర్థం ప్రధానం (చక్రపాణి = విష్ణువు).',
        introEn: 'Tatpurusha: a case ending is dropped (king’s soldier). Karmadharaya: adjective + noun (blue lily). Bahuvrihi: the compound points to someone else (చక్రపాణి = the one with a discus in hand, Vishnu).',
        examples: [ex('రాజభటుడు = రాజు యొక్క భటుడు – షష్ఠీ తత్పురుష', 'the king’s soldier – tatpurusha'), ex('నల్లకలువ = నల్లనైన కలువ – విశేషణ పూర్వపద కర్మధారయ', 'a dark lily – karmadharaya'), ex('పీతాంబరుడు = పీతమైన అంబరం గలవాడు (విష్ణువు) – బహువ్రీహి', 'the one in yellow clothes (Vishnu) – bahuvrihi')],
        items: classify('sm', [['రాజభటుడు', 'తత్పురుష సమాసం', 'king’s soldier'], ['దొంగభయం', 'తత్పురుష సమాసం', 'fear of thieves'], ['ధనహీనుడు', 'తత్పురుష సమాసం', 'one without wealth'], ['నల్లకలువ', 'కర్మధారయ సమాసం', 'dark lily'], ['మంచిమాట', 'కర్మధారయ సమాసం', 'good word'], ['కలువకన్నులు', 'కర్మధారయ సమాసం', 'lily-like eyes'], ['చక్రపాణి', 'బహువ్రీహి సమాసం', 'Vishnu'], ['పీతాంబరుడు', 'బహువ్రీహి సమాసం', 'Vishnu']],
          ['తత్పురుష సమాసం', 'కర్మధారయ సమాసం', 'బహువ్రీహి సమాసం', 'ద్వంద్వ సమాసం'], (t) => `${t} – ఇది ఏ సమాసం?`, (r) => ({ en: `${r[0]} (${r[2]}) – which compound?` })) }),
      O({ id: 'vigraha', title: 'విగ్రహవాక్యం', titleEn: 'Expanding compounds',
        intro: 'సమాస పదాన్ని విడదీసి అర్థం చెప్పే వాక్యం విగ్రహవాక్యం.', introEn: 'The phrase that splits a compound and gives its meaning is its విగ్రహవాక్యం.',
        examples: [ex('దొంగభయం = దొంగ వలన భయం', 'fear caused by a thief (పంచమీ తత్పురుష)'), ex('కలువకన్నులు = కలువల వంటి కన్నులు', 'eyes like lilies (ఉపమాన పూర్వపద కర్మధారయ)')],
        items: ([['రాజభటుడు', 'రాజు యొక్క భటుడు', ['రాజు వంటి భటుడు', 'రాజును, భటుడును']], ['దొంగభయం', 'దొంగ వలన భయం', ['దొంగ యొక్క భయం లేనివాడు', 'దొంగయును, భయమును']], ['నల్లకలువ', 'నల్లనైన కలువ', ['నల్ల యొక్క కలువ', 'నలుపును, కలువయును']], ['కలువకన్నులు', 'కలువల వంటి కన్నులు', ['కలువల యొక్క కన్నులు', 'కలువలును, కన్నులును']], ['చక్రపాణి', 'చక్రం పాణియందు గలవాడు (విష్ణువు)', ['చక్రం యొక్క పాణి', 'చక్రమును, పాణియును']], ['ధనహీనుడు', 'ధనము చేత హీనుడు', ['ధనము వంటి హీనుడు', 'ధనమును, హీనుడును']]] as const)
          .map(([w, a, wr], i) => mcq(`vg-${i + 1}`, `${w} – సరైన విగ్రహవాక్యం ఏది?`, [a, ...wr], a, { en: `Choose the correct expansion of ${w}.` })) }),
    ],
  },
  {
    id: 'te-8-alankara', level: 10, title: 'అలంకారాలు – 1', titleEn: 'Figures of speech 1',
    objectives: [
      O({ id: 'upama-rupaka', title: 'ఉపమ, రూపక', titleEn: 'Simile and metaphor',
        intro: 'ఉపమ: రెండింటి మధ్య పోలిక చెప్పడం (వలె, లా, వంటి). రూపకం: రెండింటికీ భేదం లేనట్లు చెప్పడం.', introEn: 'Upama (simile): comparing with “like” (వలె, లా, వంటి). Rupaka (metaphor): saying one thing IS the other.',
        examples: [ex('ఆమె ముఖం చంద్రుని వలె అందంగా ఉంది. – ఉపమ', 'Her face is beautiful like the moon – simile', 'ఉపమేయం: ముఖం, ఉపమానం: చంద్రుడు, సమానధర్మం: అందం, ఉపమావాచకం: వలె', 'Subject: face; compared to: moon; common quality: beauty; comparing word: వలె'), ex('విద్య అనే ధనాన్ని ఎవరూ దొంగిలించలేరు. – రూపకం', 'No one can steal the wealth called learning – metaphor')],
        items: [
          ...classify('ur', [['ఆ పిల్లవాడు సింహంలా ధైర్యంగా నిలబడ్డాడు.', 'ఉపమాలంకారం', 'The boy stood bravely like a lion.'], ['అమ్మ మాటలు తేనె వలె తియ్యగా ఉంటాయి.', 'ఉపమాలంకారం', 'Mother’s words are sweet like honey.'], ['ఆమె ముఖమే ఒక చంద్రబింబం.', 'రూపకాలంకారం', 'Her face is a full moon.'], ['విద్య అనే ధనాన్ని ఎవరూ దొంగిలించలేరు.', 'రూపకాలంకారం', 'No one can steal the wealth of learning.'], ['ఆ రాజు యుద్ధభూమిలో సింహమే.', 'రూపకాలంకారం', 'That king is a lion on the battlefield.'], ['మంచు ముత్యాల వలె మెరుస్తోంది.', 'ఉపమాలంకారం', 'The dew shines like pearls.']],
            ['ఉపమాలంకారం', 'రూపకాలంకారం'], (t) => `“${t}” – ఇది ఏ అలంకారం?`, (r) => ({ en: `“${r[2]}” – which figure of speech?`, gloss: { 'ఉపమాలంకారం': 'simile', 'రూపకాలంకారం': 'metaphor' } })),
          mcq('ur-7', '“ఆమె ముఖం చంద్రుని వలె అందంగా ఉంది.” – ఉపమానం ఏది?', ['చంద్రుడు', 'ముఖం', 'అందం', 'వలె'], 'చంద్రుడు', { en: '“Her face is beautiful like the moon.” – what is the thing compared TO (ఉపమానం)?' }),
          mcq('ur-8', '“ఆమె ముఖం చంద్రుని వలె అందంగా ఉంది.” – ఉపమావాచకం ఏది?', ['వలె', 'చంద్రుడు', 'ముఖం', 'అందం'], 'వలె', { en: '“Her face is beautiful like the moon.” – which is the comparing word (ఉపమావాచకం)?' }),
        ] }),
    ],
  },
  // ===== Class 9 =====
  {
    id: 'te-9-alankara', level: 11, title: 'అలంకారాలు – 2', titleEn: 'Figures of speech 2', read: ['te-passage-9'],
    objectives: [
      O({ id: 'more', title: 'ఉత్ప్రేక్ష, అతిశయోక్తి, వృత్త్యనుప్రాస', titleEn: 'Utpreksha, atishayokti, vruttyanuprasa',
        intro: 'ఉత్ప్రేక్ష: ఒకదాన్ని మరొకటిగా ఊహించడం (… అన్నట్లుంది). అతిశయోక్తి: ఉన్నదానికంటే ఎక్కువగా చెప్పడం. వృత్త్యనుప్రాస: ఒకే హల్లు మళ్ళీ మళ్ళీ రావడం (శబ్దాలంకారం).',
        introEn: 'Utpreksha: imagining one thing as another (“as if”). Atishayokti: exaggeration. Vruttyanuprasa: the same consonant repeated (a sound device).',
        examples: [ex('ఆ ఏనుగు నడిచే కొండయో అన్నట్లుంది. – ఉత్ప్రేక్ష', 'That elephant looks as if it were a walking hill – utpreksha'), ex('మా ఊరి భవనాలు ఆకాశాన్ని తాకుతున్నాయి. – అతిశయోక్తి', 'Our town’s buildings touch the sky – exaggeration'), ex('చిటపట చినుకులు చిందులు వేశాయి. – వృత్త్యనుప్రాస', 'Raindrops danced pitter-patter – repeated చ sound')],
        items: classify('al', [['ఎర్రని సూర్యుడు ఆకాశంలో వెలిగే దీపమో అన్నట్లున్నాడు.', 'ఉత్ప్రేక్షాలంకారం', 'The red sun looks as if it were a lamp in the sky.'], ['ఆ ఏనుగు నడిచే కొండయో అన్నట్లుంది.', 'ఉత్ప్రేక్షాలంకారం', 'That elephant looks as if it were a walking hill.'], ['మా ఊరి భవనాలు ఆకాశాన్ని తాకుతున్నాయి.', 'అతిశయోక్తి', 'Our town’s buildings touch the sky.'], ['వాడు ఎంత బలవంతుడంటే కొండనే ఎత్తగలడు.', 'అతిశయోక్తి', 'He is so strong he can lift a hill.'], ['చిటపట చినుకులు చిందులు వేశాయి.', 'వృత్త్యనుప్రాస', 'Raindrops danced pitter-patter.'], ['గలగల గోదావరి గట్టున గంతులు.', 'వృత్త్యనుప్రాస', 'Leaping along the gurgling Godavari’s bank.'], ['పాల వంటి తెల్లని మనసు.', 'ఉపమాలంకారం', 'A heart white like milk.']],
          ['ఉపమాలంకారం', 'ఉత్ప్రేక్షాలంకారం', 'అతిశయోక్తి', 'వృత్త్యనుప్రాస'], (t) => `“${t}” – ఇది ఏ అలంకారం?`, (r) => ({ en: `“${r[2]}” – which figure of speech?`, gloss: { 'ఉపమాలంకారం': 'simile', 'ఉత్ప్రేక్షాలంకారం': 'imaginative “as if”', 'అతిశయోక్తి': 'exaggeration', 'వృత్త్యనుప్రాస': 'repeated consonant' } })) }),
    ],
  },
  {
    id: 'te-9-chandas', level: 11, title: 'ఛందస్సు – ప్రాథమికాలు', titleEn: 'Prosody basics (ఛందస్సు)',
    objectives: [
      O({ id: 'guru-laghu', title: 'గురువు, లఘువు', titleEn: 'Heavy and light syllables',
        intro: 'దీర్ఘాక్షరాలు, సున్నా/విసర్గ ఉన్న అక్షరాలు, ఐ ఔ లు, ఒత్తుకు ముందున్న అక్షరం – గురువులు (U). మిగిలిన హ్రస్వాక్షరాలు లఘువులు (I).',
        introEn: 'Heavy (గురువు, U): long vowels, syllables with ం or ః, ఐ/ఔ, and a syllable just before a conjunct. Light (లఘువు, I): other short syllables.',
        examples: [ex('రా-ము-డు = U I I', 'రా is long (U); ము, డు are short (I)'), ex('క-మ-లం = I I U', 'లం has ం, so it is heavy'), ex('సీ-త-మ్మ = U U I', 'త comes before the conjunct మ్మ, so త is heavy')],
        items: ([['రాముడు', 'U I I'], ['కమలం', 'I I U'], ['సీతమ్మ', 'U U I'], ['నమస్తే', 'I U U'], ['కలువ', 'I I I'], ['భారతి', 'U I I'], ['పుస్తకం', 'U I U']] as const)
          .map(([w, a], i) => mcq(`gu-${i + 1}`, `${w} – గురులఘువులు గుర్తించు.`, [a, ...['U I I', 'I I U', 'U U I', 'I U U', 'I I I', 'U I U'].filter((x) => x !== a).slice(i % 3, i % 3 + 3)], a, { en: `Mark the heavy (U) and light (I) syllables of ${w}.`, explain: `${w} = ${a}` })) }),
      O({ id: 'gana', title: 'గణాలు', titleEn: 'Three-syllable groups (గణాలు)',
        intro: 'మూడు అక్షరాల గణాలు ఎనిమిది: య (I U U), మ (U U U), త (U U I), ర (U I U), జ (I U I), భ (U I I), న (I I I), స (I I U).',
        introEn: 'There are eight three-syllable groups: య IUU, మ UUU, త UUI, ర UIU, జ IUI, భ UII, న III, స IIU.',
        examples: [ex('కమలం = I I U = స గణం', 'kamalam is a స group'), ex('భారతి = U I I = భ గణం', 'bharati is a భ group')],
        items: ([['U I I', 'భ గణం'], ['I U U', 'య గణం'], ['U U U', 'మ గణం'], ['I I I', 'న గణం'], ['I I U', 'స గణం'], ['U I U', 'ర గణం'], ['I U I', 'జ గణం'], ['U U I', 'త గణం']] as const)
          .map(([p, a], i, all) => mcq(`gn-${i + 1}`, `${p} – ఇది ఏ గణం?`, [a, ...others(all.map((x) => x[1]), i, 3)], a, { en: `${p} – which గణం is this?`, explain: `${p} = ${a}` })) }),
    ],
  },
  {
    id: 'te-9-vakya', level: 11, title: 'వాక్యాలు – రకాలు', titleEn: 'Kinds of sentences',
    objectives: [
      O({ id: 'meaning', title: 'అర్థాన్ని బట్టి వాక్యాలు', titleEn: 'Sentences by meaning',
        intro: 'ప్రశ్న అడిగితే ప్రశ్నార్థకం, ఆశ్చర్యం తెలిపితే ఆశ్చర్యార్థకం, ఆజ్ఞ – విధ్యర్థకం, వద్దనడం – నిషేధార్థకం, అనుమతి – అనుమత్యర్థకం, చేయగలగడం – సామర్థ్యార్థకం.',
        introEn: 'Question, exclamation, command (విధ్యర్థకం), prohibition (నిషేధార్థకం), permission (అనుమత్యర్థకం), ability (సామర్థ్యార్థకం).',
        examples: [ex('ఇక్కడ చెత్త వేయవద్దు. – నిషేధార్థకం', 'Do not litter here – prohibition'), ex('ఆమె ఈత కొట్టగలదు. – సామర్థ్యార్థకం', 'She can swim – ability')],
        items: (() => {
          const cats = ['ప్రశ్నార్థకం', 'ఆశ్చర్యార్థకం', 'విధ్యర్థకం', 'నిషేధార్థకం', 'అనుమత్యర్థకం', 'సామర్థ్యార్థకం'];
          const rows: [string, string, string][] = [['నీ పేరు ఏమిటి?', 'ప్రశ్నార్థకం', 'What is your name?'], ['ఆహా! ఎంత అందమైన దృశ్యం!', 'ఆశ్చర్యార్థకం', 'Wow! What a lovely sight!'], ['నువ్వు ఈ పని వెంటనే చెయ్యి.', 'విధ్యర్థకం', 'Do this work at once.'], ['ఇక్కడ చెత్త వేయవద్దు.', 'నిషేధార్థకం', 'Do not throw rubbish here.'], ['మీరు లోపలికి రావచ్చు.', 'అనుమత్యర్థకం', 'You may come in.'], ['ఆమె ఈత కొట్టగలదు.', 'సామర్థ్యార్థకం', 'She can swim.'], ['రేపు బడి ఉందా?', 'ప్రశ్నార్థకం', 'Is there school tomorrow?']];
          return rows.map(([s, a, en], i) => mcq(`vm-${i + 1}`, `“${s}” – ఇది ఏ రకమైన వాక్యం?`, [a, ...others(cats, cats.indexOf(a), 3)], a, { en: `“${en}” – what kind of sentence?`, gloss: { 'ప్రశ్నార్థకం': 'question', 'ఆశ్చర్యార్థకం': 'exclamation', 'విధ్యర్థకం': 'command', 'నిషేధార్థకం': 'prohibition', 'అనుమత్యర్థకం': 'permission', 'సామర్థ్యార్థకం': 'ability' } }));
        })() }),
      O({ id: 'structure', title: 'నిర్మాణాన్ని బట్టి వాక్యాలు', titleEn: 'Sentences by structure',
        intro: 'ఒకే సమాపక క్రియ – సామాన్య వాక్యం. రెండు సామాన్య వాక్యాలు కలిస్తే – సంయుక్త వాక్యం. అసమాపక క్రియ (తిని, వచ్చి) తో కలిస్తే – సంశ్లిష్ట వాక్యం.',
        introEn: 'Simple sentence: one finite verb. Compound (సంయుక్త): two simple sentences joined. Complex (సంశ్లిష్ట): joined using a non-finite verb such as తిని (having eaten).',
        examples: [ex('సీత అన్నం తిని బడికి వెళ్ళింది. – సంశ్లిష్ట వాక్యం', 'Sita ate and went to school – complex'), ex('వర్షం వచ్చింది కానీ పంట పండలేదు. – సంయుక్త వాక్యం', 'It rained but the crop failed – compound')],
        items: classify('vs', [['రవి పాట పాడాడు.', 'సామాన్య వాక్యం', 'Ravi sang a song.'], ['రవి పాట పాడాడు, గీత నాట్యం చేసింది.', 'సంయుక్త వాక్యం', 'Ravi sang and Gita danced.'], ['సీత అన్నం తిని బడికి వెళ్ళింది.', 'సంశ్లిష్ట వాక్యం', 'Having eaten, Sita went to school.'], ['వర్షం వచ్చింది కానీ పంట పండలేదు.', 'సంయుక్త వాక్యం', 'It rained but the crop did not grow.'], ['రాము ఇంటికి వచ్చి చదువుకున్నాడు.', 'సంశ్లిష్ట వాక్యం', 'Ramu came home and studied.'], ['పక్షులు ఎగురుతున్నాయి.', 'సామాన్య వాక్యం', 'The birds are flying.']],
          ['సామాన్య వాక్యం', 'సంయుక్త వాక్యం', 'సంశ్లిష్ట వాక్యం'], (t) => `“${t}” – ఇది ఏ వాక్యం?`, (r) => ({ en: `“${r[2]}” – simple, compound or complex?`, gloss: { 'సామాన్య వాక్యం': 'simple', 'సంయుక్త వాక్యం': 'compound', 'సంశ్లిష్ట వాక్యం': 'complex' } })) }),
    ],
  },
  // ===== Class 10 =====
  {
    id: 'te-10-kathanam', level: 12, title: 'ప్రత్యక్ష, పరోక్ష కథనాలు', titleEn: 'Direct and indirect speech', read: ['te-passage-10'],
    objectives: [
      O({ id: 'indirect', title: 'పరోక్ష కథనంలోకి మార్చు', titleEn: 'Change to indirect speech', keyboard: true,
        intro: 'ఒకరి మాటలను ఉన్నది ఉన్నట్లు ఉద్ధరణ చిహ్నాలలో చెప్పడం ప్రత్యక్ష కథనం. మన మాటలలో చెప్పడం పరోక్ష కథనం. నేను → తాను, మేము → తాము; “అని” పదంతో కలుపుతాం.',
        introEn: 'Direct speech quotes the exact words. Indirect speech reports them: నేను → తాను, మేము → తాము, and the clause is joined with -అని.',
        examples: [ex('రాము “నేను వస్తాను” అని చెప్పాడు. → రాము తాను వస్తానని చెప్పాడు.', 'Ramu said, “I will come.” → Ramu said that he would come.'), ex('అమ్మ “నువ్వు బాగా చదువు” అని చెప్పింది. → అమ్మ నన్ను బాగా చదవమని చెప్పింది.', 'Mother said, “Study well.” → Mother told me to study well.')],
        items: [
          mcq('kt-1', 'రాము “నేను వస్తాను” అని చెప్పాడు. – పరోక్ష కథనం ఏది?', ['రాము తాను వస్తానని చెప్పాడు.', 'రాము నేను వస్తానని చెప్పాడు.', 'రాము “తాను వస్తాను” అని చెప్పాడు.'], 'రాము తాను వస్తానని చెప్పాడు.', { en: 'Ramu said, “I will come.” – choose the indirect speech.' }),
          mcq('kt-2', 'సీత “నాకు పుస్తకం కావాలి” అని అడిగింది. – పరోక్ష కథనం ఏది?', ['సీత తనకు పుస్తకం కావాలని అడిగింది.', 'సీత నాకు పుస్తకం కావాలని అడిగింది.', 'సీత తనకు పుస్తకం కావాలి అడిగింది.'], 'సీత తనకు పుస్తకం కావాలని అడిగింది.', { en: 'Sita asked, “I want a book.” – choose the indirect speech.' }),
          mcq('kt-3', 'పిల్లలు “మేము ఆడుకుంటాం” అన్నారు. – పరోక్ష కథనం ఏది?', ['పిల్లలు తాము ఆడుకుంటామని అన్నారు.', 'పిల్లలు మేము ఆడుకుంటామని అన్నారు.', 'పిల్లలు వారు ఆడుకున్నారు అన్నారు.'], 'పిల్లలు తాము ఆడుకుంటామని అన్నారు.', { en: 'The children said, “We will play.” – choose the indirect speech.' }),
          mcq('kt-4', 'అమ్మ “నువ్వు బాగా చదువు” అని నాతో చెప్పింది. – పరోక్ష కథనం ఏది?', ['అమ్మ నన్ను బాగా చదవమని చెప్పింది.', 'అమ్మ నువ్వు బాగా చదువని చెప్పింది.', 'అమ్మ తాను బాగా చదివిందని చెప్పింది.'], 'అమ్మ నన్ను బాగా చదవమని చెప్పింది.', { en: 'Mother said to me, “Study well.” – choose the indirect speech.' }),
          mcq('kt-5', 'గురువుగారు “మీరు నిశ్శబ్దంగా ఉండండి” అని పిల్లలతో అన్నారు. – పరోక్ష కథనం ఏది?', ['గురువుగారు పిల్లలను నిశ్శబ్దంగా ఉండమని అన్నారు.', 'గురువుగారు మీరు నిశ్శబ్దంగా ఉండండని అన్నారు.', 'గురువుగారు తాము నిశ్శబ్దంగా ఉన్నామని అన్నారు.'], 'గురువుగారు పిల్లలను నిశ్శబ్దంగా ఉండమని అన్నారు.', { en: 'The teacher said to the children, “Be quiet.” – choose the indirect speech.' }),
          mcq('kt-6', '“రవి తాను అలసిపోయానని చెప్పాడు.” – ఇది ఏ కథనం?', ['పరోక్ష కథనం', 'ప్రత్యక్ష కథనం'], 'పరోక్ష కథనం', { en: '“Ravi said that he was tired.” – direct or indirect speech?' }),
          typed('kt-7', 'ఖాళీ నింపు (టైప్ చేయి): రాము “నేను వస్తాను” అన్నాడు → రాము ____ వస్తానని అన్నాడు.', ['తాను'], ['నేను', 'అతను'], { en: 'Type the missing pronoun: Ramu said, “I will come” → Ramu said that ____ would come.' }),
        ] }),
    ],
  },
  {
    id: 'te-10-writing', level: 12, title: 'లేఖా రచన, వ్యాస రచన', titleEn: 'Letter and essay writing',
    objectives: [
      O({ id: 'letter', title: 'లేఖా రచన', titleEn: 'Letter writing',
        intro: 'లేఖలో భాగాలు: ప్రదేశం, తేదీ → సంబోధన → విషయం → ముగింపు (ఇట్లు, పేరు) → చిరునామా. పెద్దలకు, అధికారులకు వ్రాసే లేఖలు అధికారిక లేఖలు.',
        introEn: 'Parts of a letter: place and date → greeting → body → closing (ఇట్లు, name) → address. Letters to officials and the headmaster are formal letters.',
        examples: [ex('నమూనా లేఖ (సెలవు కోసం):\nహైదరాబాదు, 10-11-2026.\nగౌరవనీయులైన ప్రధానోపాధ్యాయుల గారికి,\nవిషయం: రెండు రోజుల సెలవు కోసం.\nఅయ్యా, నాకు జ్వరంగా ఉన్నందున ఈ రోజు, రేపు బడికి రాలేను. దయచేసి రెండు రోజులు సెలవు మంజూరు చేయగలరు.\nఇట్లు,\nతమ విధేయ విద్యార్థి,\nఅ. బ., 10వ తరగతి.',
          'Model formal letter asking the headmaster for two days’ leave because of fever.'),
          ex('నమూనా లేఖ (మిత్రునికి):\nప్రియమైన మిత్రుడు రవికి,\nనేను ఇక్కడ క్షేమం. నువ్వు ఎలా ఉన్నావు? మా బడిలో సైన్స్ ప్రదర్శన జరిగింది …\nఇట్లు,\nనీ ప్రియ మిత్రుడు.', 'Model informal letter to a friend.')],
        items: [
          order('lt-1', 'లేఖలోని భాగాలను సరైన క్రమంలో అమర్చు.', ['ప్రదేశం, తేదీ', 'సంబోధన', 'విషయం', 'ఇట్లు, పేరు', 'చిరునామా'], { en: 'Put the parts of a letter in order: place & date, greeting, body, closing, address.' }),
          mcq('lt-2', 'ప్రధానోపాధ్యాయునికి లేఖలో సరైన సంబోధన ఏది?', ['గౌరవనీయులైన ప్రధానోపాధ్యాయుల గారికి,', 'ప్రియమైన మిత్రమా,', 'ఓయ్ సార్,'], 'గౌరవనీయులైన ప్రధానోపాధ్యాయుల గారికి,', { en: 'Which greeting suits a letter to the headmaster?' }),
          mcq('lt-3', 'అధికారిక లేఖ ముగింపు ఏది?', ['ఇట్లు, తమ విధేయుడు', 'ఇట్లు, నీ ప్రియ మిత్రుడు', 'సరే, ఉంటాను'], 'ఇట్లు, తమ విధేయుడు', { en: 'Which closing suits a formal letter?' }),
          mcq('lt-4', 'కింది వాటిలో అధికారిక లేఖ ఏది?', ['సెలవు కోసం ప్రధానోపాధ్యాయునికి లేఖ', 'పుట్టినరోజు శుభాకాంక్షలతో మిత్రునికి లేఖ', 'అమ్మమ్మకు కుశలం అడుగుతూ లేఖ'], 'సెలవు కోసం ప్రధానోపాధ్యాయునికి లేఖ', { en: 'Which of these is a formal letter?' }),
          mcq('lt-5', 'మిత్రునికి వ్రాసే లేఖ ముగింపు ఏది?', ['ఇట్లు, నీ ప్రియ మిత్రుడు', 'ఇట్లు, తమ విధేయుడు', 'ఇట్లు, అధికారి'], 'ఇట్లు, నీ ప్రియ మిత్రుడు', { en: 'Which closing suits a letter to a friend?' }),
          mcq('lt-6', 'అధికారిక లేఖలో “విషయం:” ఎందుకు వ్రాస్తాం?', ['లేఖ దేని గురించో ముందే తెలియడానికి', 'లేఖ పొడవు పెంచడానికి', 'చిరునామా చెప్పడానికి'], 'లేఖ దేని గురించో ముందే తెలియడానికి', { en: 'Why do we write a “Subject:” line in a formal letter?' }),
        ] }),
      O({ id: 'essay', title: 'వ్యాస రచన', titleEn: 'Essay writing',
        intro: 'వ్యాసంలో మూడు భాగాలు: ఉపోద్ఘాతం (పరిచయం), విషయ విస్తరణ (ముఖ్యాంశాలు – ఒక్కో పేరాలో ఒకటి), ముగింపు (సారాంశం, సందేశం).',
        introEn: 'An essay has three parts: introduction, body (one main point per paragraph), and conclusion (summary and message).',
        examples: [ex('నమూనా వ్యాసం – “చెట్ల ప్రాముఖ్యత”:\nఉపోద్ఘాతం: చెట్లు మనకు ప్రాణవాయువు ఇచ్చే స్నేహితులు.\nవిషయ విస్తరణ: చెట్లు నీడ, పండ్లు, కలప ఇస్తాయి. వర్షాలు కురవడానికి సహాయపడతాయి. నేల కోతను ఆపుతాయి. పక్షులకు ఇల్లు.\nముగింపు: ప్రతి ఒక్కరూ కనీసం ఒక మొక్క నాటి పెంచాలి.', 'Model essay “The importance of trees”: introduction, body points (shade, fruit, rain, soil, birds), conclusion with a message.'),
          ex('మంచి వ్యాసం: సరళమైన వాక్యాలు, ఉదాహరణలు, ఒక్కో పేరాకు ఒక అంశం.', 'A good essay: clear sentences, examples, one idea per paragraph.')],
        items: [
          order('es-1', 'వ్యాసంలోని భాగాలను క్రమంలో అమర్చు.', ['ఉపోద్ఘాతం', 'విషయ విస్తరణ', 'ముగింపు'], { en: 'Put the parts of an essay in order.' }),
          mcq('es-2', 'అంశాన్ని పాఠకునికి పరిచయం చేసే భాగం ఏది?', ['ఉపోద్ఘాతం', 'విషయ విస్తరణ', 'ముగింపు'], 'ఉపోద్ఘాతం', { en: 'Which part introduces the topic to the reader?' }),
          mcq('es-3', 'ముఖ్యాంశాలను ఉదాహరణలతో వివరించే భాగం ఏది?', ['విషయ విస్తరణ', 'ఉపోద్ఘాతం', 'ముగింపు'], 'విషయ విస్తరణ', { en: 'Which part explains the main points with examples?' }),
          mcq('es-4', 'మంచి ముగింపులో ఏం ఉండాలి?', ['సారాంశం, ఒక సందేశం', 'కొత్త అంశం మొదలుపెట్టడం', 'ఉపోద్ఘాతాన్ని మళ్ళీ అలాగే వ్రాయడం'], 'సారాంశం, ఒక సందేశం', { en: 'What should a good conclusion contain?' }),
          mcq('es-5', 'ఒక్కో పేరాలో ఎన్ని ముఖ్యాంశాలు ఉండటం మంచిది?', ['ఒకటి', 'ఐదు', 'అసలు ఉండకూడదు'], 'ఒకటి', { en: 'How many main ideas should one paragraph have?' }),
        ] }),
    ],
  },
  {
    id: 'te-10-vocab', level: 12, title: 'పదజాలం: నానార్థాలు, ప్రకృతి–వికృతులు', titleEn: 'Vocabulary: multiple meanings, Sanskrit–Telugu forms',
    objectives: [
      O({ id: 'nanartha', title: 'నానార్థాలు', titleEn: 'Words with many meanings',
        intro: 'ఒకే పదానికి ఉండే వేరు వేరు అర్థాలను నానార్థాలు అంటారు: అంబరం = ఆకాశం, వస్త్రం.', introEn: 'One word with several meanings: అంబరం = sky, cloth.',
        examples: [ex('వర్ణం = రంగు, అక్షరం', 'colour; letter'), ex('పత్రం = ఆకు, లేఖ', 'leaf; letter/document')],
        items: (() => {
          const rows: [string, string, string][] = [['అంబరం', 'ఆకాశం, వస్త్రం', 'sky; cloth'], ['కరం', 'చేయి, కిరణం', 'hand; ray'], ['వర్ణం', 'రంగు, అక్షరం', 'colour; letter'], ['పత్రం', 'ఆకు, లేఖ', 'leaf; letter'], ['హరి', 'విష్ణువు, సింహం', 'Vishnu; lion'], ['గుణం', 'స్వభావం, దారం', 'nature; string']];
          return rows.map(([w, a, en], i) => mcq(`nn2-${i + 1}`, `${w} – నానార్థాలు ఏవి?`, [a, ...others(rows.map((r) => r[1]), i, 2)], a, { en: `Which pair gives meanings of ${w}? (${en})` }));
        })() }),
      O({ id: 'prakruti', title: 'ప్రకృతి – వికృతి', titleEn: 'Sanskrit form and Telugu form',
        intro: 'సంస్కృత పదం ప్రకృతి; అది తెలుగులో మారిన రూపం వికృతి: రాత్రి – రేయి.', introEn: 'A Sanskrit word (ప్రకృతి) and its changed Telugu form (వికృతి): రాత్రి – రేయి (night).',
        examples: [ex('శ్రీ – సిరి', 'wealth'), ex('భాష – బాస', 'language')],
        items: pairItems('pk', PRAKRUTI, (w) => `${w} – వికృతి పదం ఏది?`, (w, en) => `What is the Telugu (వికృతి) form of ${w}? (${en})`, 'Prakruti → vikruti') }),
    ],
  },
];

interface SandhiDef { id: string; name: string; nameEn: string; also?: string; rule: string; ruleEn: string; joins: [string, string, string, string[]][]; identify: ([string, string] | [string, string, string])[] }

function sandhiObjectives(defs: SandhiDef[], cats: string[]): Objective[] {
  return defs.map((d) => {
    const joinItems = d.joins.map(([a, b, r, wrong], i) => mcq(`${d.id}-j${i + 1}`, `${a} + ${b} = ?`, [r, ...wrong], r, {
      en: `Join ${a} + ${b} (${d.nameEn}).`, explain: `${a} + ${b} = ${r}`, hints: [d.rule], hintsEn: [d.ruleEn],
    }));
    const idItems = d.identify.map(([w, split, which], i) => {
      const ans = which || d.name;
      return mcq(`${d.id}-i${i + 1}`, `${w} = ${split}. ఇది ఏ సంధి?`, cats.includes(ans) ? cats : [ans, ...cats.slice(0, 3)], ans, { en: `${w} = ${split}. Which sandhi is this?`, explain: `${w} – ${ans}` });
    });
    const intro = d.rule;
    return {
      id: d.id, title: d.also ? `${d.name}, ${d.also}` : d.name, titleEn: d.nameEn, intro, introEn: d.ruleEn,
      examples: d.joins.slice(0, 3).map(([a, b, r]) => ex(`${a} + ${b} = ${r}`, `${a} + ${b} → ${r}`)),
      items: [...joinItems, ...idItems],
    };
  });
}

export const TELUGU: Course = { id: 'telugu', script: 'te', title: 'తెలుగు', titleEn: 'Telugu', units };
export { CONSONANTS, VOWELS };
