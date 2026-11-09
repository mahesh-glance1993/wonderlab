// Telugu script data: అచ్చులు, హల్లులు, గుణింతం signs, ఒత్తులు, picture words, number words, days, months.
// TELUGU EDUCATOR REVIEW NEEDED for picture-word choices (see docs/LANGUAGE_COURSES.md).
import type { LetterCard } from '../types';

export const VIRAMA = '్'; // ్  (పొల్లు / హల్లు గుర్తు used to make ఒత్తులు)

/** The 16 అచ్చులు taught in school (ఌ, ౡ are omitted as in current textbooks). */
export const VOWELS = ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ౠ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'అం', 'అః'] as const;

/** Vowel → dependent sign (గుణింతం గుర్తు). అ has no sign (inherent vowel). */
export const VOWEL_SIGNS: Record<string, string> = {
  'అ': '', 'ఆ': 'ా', 'ఇ': 'ి', 'ఈ': 'ీ', 'ఉ': 'ు', 'ఊ': 'ూ', 'ఋ': 'ృ', 'ౠ': 'ౄ',
  'ఎ': 'ె', 'ఏ': 'ే', 'ఐ': 'ై', 'ఒ': 'ొ', 'ఓ': 'ో', 'ఔ': 'ౌ', 'అం': 'ం', 'అః': 'ః',
};
/** Traditional Telugu names of the signs (for Learn mode). */
export const SIGN_NAMES: Record<string, string> = {
  'ఆ': 'దీర్ఘం', 'ఇ': 'గుడి', 'ఈ': 'గుడి దీర్ఘం', 'ఉ': 'కొమ్ము', 'ఊ': 'కొమ్ము దీర్ఘం', 'ఋ': 'వట్రసుడి', 'ౠ': 'వట్రసుడి దీర్ఘం',
  'ఎ': 'ఎత్వం', 'ఏ': 'ఏత్వం', 'ఐ': 'ఐత్వం', 'ఒ': 'ఒత్వం', 'ఓ': 'ఓత్వం', 'ఔ': 'ఔత్వం', 'అం': 'సున్నా (పూర్ణానుస్వారం)', 'అః': 'విసర్గ',
};

/** 36 హల్లులు: 25 వర్గ + య…ళ + క్ష + ఱ. */
export const CONSONANTS = [
  'క', 'ఖ', 'గ', 'ఘ', 'ఙ',
  'చ', 'ఛ', 'జ', 'ఝ', 'ఞ',
  'ట', 'ఠ', 'డ', 'ఢ', 'ణ',
  'త', 'థ', 'ద', 'ధ', 'న',
  'ప', 'ఫ', 'బ', 'భ', 'మ',
  'య', 'ర', 'ల', 'వ', 'శ', 'ష', 'స', 'హ', 'ళ', 'క్ష', 'ఱ',
] as const;

/** The vowel signs offered in the గుణింతం builder (క కా కి కీ కు కూ కృ కె కే కై కొ కో కౌ కం కః). */
export const GUNINTHAM_VOWELS = ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'అం', 'అః'] as const;

/** Consonant + vowel → syllable (గుణింతం). */
export function compose(consonant: string, vowel: string): string {
  const sign = VOWEL_SIGNS[vowel];
  if (sign === undefined) throw new Error(`unknown vowel ${vowel}`);
  return (consonant + sign).normalize('NFC');
}
/** Full గుణింతం row for a consonant. */
export const guninthamRow = (c: string) => GUNINTHAM_VOWELS.map((v) => compose(c, v));

/** Consonant + ఒత్తు (second consonant written below) → conjunct. క + క = క్క, ప + ర = ప్ర. */
export const conjunct = (first: string, second: string) => first + VIRAMA + second;

/** Is `letter` present in `word` either as a letter or (for vowels) as its dependent sign? */
export function letterOccurs(letter: string, word: string): boolean {
  if (word.includes(letter)) return true;
  const sign = VOWEL_SIGNS[letter];
  if (sign) {
    // అం / అః signs are ం / ః
    return word.includes(sign);
  }
  return false;
}

// Picture words. Original selection; common words where possible. Letters that never start a
// word in everyday Telugu (ఙ, ఞ, ఠ, ణ, థ, ష, ళ, ౠ, అః) use a word that CONTAINS the letter.
const card = (letter: string, word: string, pic: string, en: string): LetterCard => ({ letter, word, pic, en });

export const VOWEL_CARDS: LetterCard[] = [
  card('అ', 'అమ్మ', '👩', 'mother'),
  card('ఆ', 'ఆవు', '🐄', 'cow'),
  card('ఇ', 'ఇల్లు', '🏠', 'house'),
  card('ఈ', 'ఈక', '🪶', 'feather'),
  card('ఉ', 'ఉడుత', '🐿️', 'squirrel'),
  card('ఊ', 'ఊరు', '🏘️', 'village'),
  card('ఋ', 'ఋషి', '🧘', 'sage'),
  card('ౠ', 'పితౄణం', '🙏', 'debt to one\'s elders (the sign ౄ is rare)'),
  card('ఎ', 'ఎలుక', '🐭', 'mouse'),
  card('ఏ', 'ఏనుగు', '🐘', 'elephant'),
  card('ఐ', 'ఐదు', '🖐️', 'five'),
  card('ఒ', 'ఒంటె', '🐫', 'camel'),
  card('ఓ', 'ఓడ', '🚢', 'ship'),
  card('ఔ', 'ఔషధం', '💊', 'medicine'),
  card('అం', 'అంగడి', '🏪', 'shop'),
  card('అః', 'దుఃఖం', '😢', 'sorrow (the sign ః)'),
];

export const CONSONANT_CARDS: LetterCard[] = [
  card('క', 'కలం', '🖊️', 'pen'),
  card('ఖ', 'ఖడ్గం', '🗡️', 'sword'),
  card('గ', 'గడియారం', '🕰️', 'clock'),
  card('ఘ', 'ఘంట', '🔔', 'bell'),
  card('ఙ', 'వాఙ్మయం', '📚', 'literature (ఙ is found inside words)'),
  card('చ', 'చేప', '🐟', 'fish'),
  card('ఛ', 'ఛత్రం', '☂️', 'umbrella'),
  card('జ', 'జెండా', '🚩', 'flag'),
  card('ఝ', 'ఝరి', '🏞️', 'stream / waterfall'),
  card('ఞ', 'జ్ఞానం', '💡', 'knowledge (ఞ is found inside జ్ఞ)'),
  card('ట', 'టమాట', '🍅', 'tomato'),
  card('ఠ', 'పీఠం', '🪑', 'seat / stool'),
  card('డ', 'డబ్బా', '📦', 'box / tin'),
  card('ఢ', 'ఢంకా', '🥁', 'big drum'),
  card('ణ', 'బాణం', '🏹', 'arrow'),
  card('త', 'తాబేలు', '🐢', 'tortoise'),
  card('థ', 'రథం', '🛞', 'chariot'),
  card('ద', 'దీపం', '🪔', 'lamp'),
  card('ధ', 'ధాన్యం', '🌾', 'grain'),
  card('న', 'నక్క', '🦊', 'fox'),
  card('ప', 'పడవ', '⛵', 'boat'),
  card('ఫ', 'ఫలం', '🍎', 'fruit'),
  card('బ', 'బంతి', '⚽', 'ball'),
  card('భ', 'భవనం', '🏢', 'building'),
  card('మ', 'మామిడి', '🥭', 'mango'),
  card('య', 'యంత్రం', '⚙️', 'machine'),
  card('ర', 'రైలు', '🚆', 'train'),
  card('ల', 'లేడి', '🦌', 'deer'),
  card('వ', 'వంకాయ', '🍆', 'brinjal'),
  card('శ', 'శంఖం', '🐚', 'conch'),
  card('ష', 'పుష్పం', '🌸', 'flower'),
  card('స', 'సింహం', '🦁', 'lion'),
  card('హ', 'హంస', '🦢', 'swan'),
  card('ళ', 'తాళం', '🔒', 'lock'),
  card('క్ష', 'పక్షి', '🐦', 'bird'),
  card('ఱ', 'ఱంపం', '🪚', 'saw (today usually written రంపం)'),
];

export const LETTER_CARDS: Record<string, LetterCard> = Object.fromEntries([...VOWEL_CARDS, ...CONSONANT_CARDS].map((c) => [c.letter, c]));

export const NUMBER_WORDS = ['ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది', 'పది'] as const;
export const NUMBER_WORDS_EN = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
/** Telugu digits ౧…౧౦ shown alongside 1…10. */
export const TELUGU_DIGITS = ['౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯', '౧౦'];

export const DAYS = ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం'] as const;
export const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = ['చైత్రం', 'వైశాఖం', 'జ్యేష్ఠం', 'ఆషాఢం', 'శ్రావణం', 'భాద్రపదం', 'ఆశ్వయుజం', 'కార్తీకం', 'మార్గశిరం', 'పుష్యం', 'మాఘం', 'ఫాల్గుణం'] as const;
export const MONTHS_EN = ['Chaitram', 'Vaishakham', 'Jyeshtham', 'Ashadham', 'Shravanam', 'Bhadrapadam', 'Ashvayujam', 'Karthikam', 'Margashiram', 'Pushyam', 'Magham', 'Phalgunam'];

/** On-screen Telugu keyboard rows. */
export const KEYBOARD_ROWS: string[][] = [
  [...VOWELS],
  ['క', 'ఖ', 'గ', 'ఘ', 'ఙ', 'చ', 'ఛ', 'జ', 'ఝ', 'ఞ', 'ట', 'ఠ', 'డ', 'ఢ', 'ణ', 'త', 'థ', 'ద'],
  ['ధ', 'న', 'ప', 'ఫ', 'బ', 'భ', 'మ', 'య', 'ర', 'ల', 'వ', 'శ', 'ష', 'స', 'హ', 'ళ', 'ఱ'],
  ['ా', 'ి', 'ీ', 'ు', 'ూ', 'ృ', 'ె', 'ే', 'ై', 'ొ', 'ో', 'ౌ', 'ం', 'ః', VIRAMA],
];
/** Dependent signs are shown on a dotted circle so they are visible on their own key. */
export const showSign = (k: string) => (/^[ా-్ంః]$/.test(k) ? '◌' + k : k);
