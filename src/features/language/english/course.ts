// English course — Nursery to Class 10. Original wording, CBSE-style progression.
import type { Course, Item, LetterCard, Objective, Unit } from '../types';
import { build, classify, listen, mcq, order, others, typed } from '../build';

export const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const LOWER = UPPER.map((c) => c.toLowerCase());

const card = (letter: string, word: string, pic: string): LetterCard => ({ letter, word, pic, en: word });
export const ALPHABET_CARDS: LetterCard[] = [
  card('A', 'apple', '🍎'), card('B', 'ball', '⚽'), card('C', 'cat', '🐈'), card('D', 'dog', '🐕'), card('E', 'egg', '🥚'), card('F', 'fish', '🐟'),
  card('G', 'goat', '🐐'), card('H', 'hat', '🎩'), card('I', 'insect', '🐞'), card('J', 'jet', '✈️'), card('K', 'kite', '🪁'), card('L', 'lion', '🦁'),
  card('M', 'moon', '🌙'), card('N', 'nest', '🪺'), card('O', 'orange', '🍊'), card('P', 'pen', '🖊️'), card('Q', 'queen', '👑'), card('R', 'rabbit', '🐇'),
  card('S', 'sun', '☀️'), card('T', 'tree', '🌳'), card('U', 'umbrella', '☂️'), card('V', 'van', '🚐'), card('W', 'watch', '⌚'), card('X', 'box', '📦'),
  card('Y', 'yak', '🐃'), card('Z', 'zebra', '🦓'),
];

const ex = (text: string, note?: string, pic?: string) => ({ text, note, pic });
const O = (o: Objective) => o;

function letterListen(prefix: string, cards: LetterCard[]): Item[] {
  const pool = cards.map((c) => c.letter);
  return cards.map((c, i) => listen(`${prefix}-${i + 1}`, 'Listen. Tap the letter you hear.', c.letter, [c.letter, ...others(pool, i, 3)], c.letter, {
    hints: [`It is the letter in “${c.word}”.`], explain: `${c.letter} as in ${c.word}`,
  }));
}
function letterPicture(prefix: string, cards: LetterCard[]): Item[] {
  return cards.map((c, i) => {
    const starts = c.word.toUpperCase().startsWith(c.letter);
    const wrong = others(cards, i, 6).map((o) => o.letter).filter((l) => !c.word.toUpperCase().includes(l)).slice(0, 3);
    return mcq(`${prefix}-${i + 1}`, starts ? 'Which letter does this picture start with?' : 'Which letter is in this picture’s name?', [c.letter, ...wrong], c.letter, {
      pic: c.pic, picLabel: c.word, say: c.word, hints: [`The picture is a ${c.word}.`], explain: `${c.word} – ${c.letter}`,
    });
  });
}
const caseItems = (): Item[] => UPPER.map((u, i) => mcq(`cs-${i + 1}`, `Find the small letter for ${u}.`, [LOWER[i], ...others(LOWER, i, 3, [1, 2, 25, 24, 3])], LOWER[i], {
  say: u, explain: `${u} and ${LOWER[i]} are the same letter.`,
}));

const PHONICS: [string, string, string][] = [
  ['bus', 'b', '🚌'], ['cup', 'c', '☕'], ['duck', 'd', '🦆'], ['gift', 'g', '🎁'], ['hen', 'h', '🐔'], ['jam', 'j', '🍯'], ['leaf', 'l', '🍃'],
  ['nut', 'n', '🥜'], ['pig', 'p', '🐖'], ['rat', 'r', '🐀'], ['sock', 's', '🧦'], ['van', 'v', '🚐'], ['web', 'w', '🕸️'], ['zip', 'z', '🤐'],
];
const phonicsItems = (): Item[] => PHONICS.map(([w, l, pic], i) => listen(`ph-${i + 1}`, 'Listen to the word. Which letter makes its first sound?', w, [l, ...others(PHONICS.map((p) => p[1]), i, 3)], l, {
  pic, picLabel: w, hints: [`Say “${w}” slowly. What do your lips and tongue do first?`], explain: `${w} begins with the /${l}/ sound.`,
}));
const beginningPicItems = (): Item[] => PHONICS.slice(0, 10).map(([w, l], i) => {
  const opts = [PHONICS[i], ...others(PHONICS, i, 2, [3, 7, 5])];
  return mcq(`bp-${i + 1}`, `Which picture begins with the sound of “${l}”?`, opts.map((o) => o[0]), w, {
    picChoices: true, pics: Object.fromEntries(opts.map((o) => [o[0], o[2]])), say: `${l}… ${l}…`, explain: `${w} begins with ${l}.`,
  });
});

const SIGHT = ['the', 'a', 'I', 'is', 'it', 'in', 'to', 'and', 'we', 'my', 'see', 'go', 'can', 'you', 'he', 'me'];
const sightItems = (): Item[] => SIGHT.slice(0, 12).map((w, i) => listen(`sw-${i + 1}`, 'Listen. Tap the word you hear.', w, [w, ...others(SIGHT, i, 3)], w, { explain: `The word is “${w}”.` }));

const CVC: [string, string, string[]][] = [
  ['cat', '🐈', ['o', 'p']], ['dog', '🐕', ['a', 'b']], ['sun', '☀️', ['a', 'm']], ['pig', '🐖', ['e', 't']], ['hat', '🎩', ['u', 'p']],
  ['bus', '🚌', ['a', 't']], ['cup', '☕', ['o', 'b']], ['hen', '🐔', ['a', 't']], ['bed', '🛏️', ['a', 'g']], ['box', '📦', ['e', 'g']],
];
const cvcBuild = (): Item[] => CVC.map(([w, pic, d], i) => build(`cv-${i + 1}`, `Build the word for this picture: tap the sounds in order.`, w.split(''), d, {
  pic, picLabel: w, say: w, hints: [`Say it slowly: ${w.split('').join(' – ')}`], explain: `${w.split('').join(' + ')} = ${w}`,
}));

const pair = (prefix: string, rows: [string, string][], prompt: (w: string) => string, what: string): Item[] => {
  const answers = rows.map((r) => r[1]);
  return rows.map(([w, a], i) => mcq(`${prefix}-${i + 1}`, prompt(w), [a, ...others(answers, i, 3).filter((x) => x !== w)], a, { explain: `${what}: ${w} → ${a}` }));
};

const units: Unit[] = [
  // ===== Nursery =====
  {
    id: 'en-n-letters', level: 0, title: 'Letters A to M', trace: ['en-upper-1'], read: ['en-rhyme-1'],
    objectives: [
      O({ id: 'listen', title: 'Listen and tap', intro: 'Let us hear and see the letters A to M.', examples: [ex('A is for apple', undefined, '🍎'), ex('B is for ball', undefined, '⚽')], cards: ALPHABET_CARDS.slice(0, 13), items: letterListen('nl', ALPHABET_CARDS.slice(0, 13)) }),
      O({ id: 'picture', title: 'Picture and letter', intro: 'Every picture name starts with a letter.', examples: [ex('C is for cat', undefined, '🐈'), ex('M is for moon', undefined, '🌙')], cards: ALPHABET_CARDS.slice(0, 13), items: letterPicture('np', ALPHABET_CARDS.slice(0, 13)) }),
    ],
  },
  // ===== LKG =====
  {
    id: 'en-l-letters', level: 1, title: 'Letters N to Z', trace: ['en-upper-2'], read: ['en-rhyme-2'],
    objectives: [
      O({ id: 'listen', title: 'Listen and tap', intro: 'Now the letters N to Z.', examples: [ex('N is for nest', undefined, '🪺'), ex('Z is for zebra', undefined, '🦓')], cards: ALPHABET_CARDS.slice(13), items: letterListen('ll', ALPHABET_CARDS.slice(13)) }),
      O({ id: 'picture', title: 'Picture and letter', intro: 'Find the letter in the picture’s name.', examples: [ex('S is for sun', undefined, '☀️'), ex('X is in box', 'X often comes at the end of a word.', '📦')], cards: ALPHABET_CARDS.slice(13), items: letterPicture('lp', ALPHABET_CARDS.slice(13)) }),
    ],
  },
  {
    id: 'en-l-case', level: 1, title: 'Big and small letters', trace: ['en-lower'],
    badge: { id: 'lang:en-alphabet', title: 'I know my ABC!' },
    objectives: [
      O({ id: 'match', title: 'Capital and small letters', intro: 'Every letter has a capital (big) form and a small form: A a, B b, C c.', examples: [ex('A a – apple', undefined, '🍎'), ex('G g – goat', 'Some small letters look very different from the capital.', '🐐')], items: caseItems() }),
    ],
  },
  // ===== UKG =====
  {
    id: 'en-u-phonics', level: 2, title: 'Letter sounds (phonics)', read: ['en-rhyme-3'],
    objectives: [
      O({ id: 'sounds', title: 'First sounds', intro: 'Letters make sounds. “b” says /b/ as in bus.', examples: [ex('b – /b/ – bus', undefined, '🚌'), ex('s – /s/ – sock', 'Say it like a snake: sss.', '🧦')], items: phonicsItems() }),
      O({ id: 'pictures', title: 'Beginning sounds with pictures', intro: 'Listen to a sound and find the picture that begins with it.', examples: [ex('h – hen', undefined, '🐔'), ex('p – pig', undefined, '🐖')], items: beginningPicItems() }),
    ],
  },
  {
    id: 'en-u-sight', level: 2, title: 'Sight words',
    objectives: [
      O({ id: 'sight', title: 'Words we see often', intro: 'Some short words appear in almost every story. We learn them by sight.', examples: [ex('I can see.'), ex('We go to school.')], items: sightItems() }),
    ],
  },
  // ===== Class 1 =====
  {
    id: 'en-1-cvc', level: 3, title: 'CVC words and blending', read: ['en-story-1'],
    objectives: [
      O({ id: 'blend', title: 'Blend the sounds', builder: 'cvc', intro: 'Consonant + vowel + consonant: c-a-t → cat. Say each sound, then blend them.', examples: [ex('c + a + t = cat', undefined, '🐈'), ex('s + u + n = sun', undefined, '☀️'), ex('h + e + n = hen', undefined, '🐔')], items: cvcBuild() }),
      O({ id: 'family', title: 'Word families', intro: 'Words that end the same way rhyme: cat, hat, mat, bat.', examples: [ex('-at: cat, hat, mat'), ex('-og: dog, log, fog')],
        items: [
          mcq('wf-1', 'Which word rhymes with “cat”?', ['hat', 'cup', 'dog'], 'hat'),
          mcq('wf-2', 'Which word rhymes with “dog”?', ['log', 'pen', 'sun'], 'log'),
          mcq('wf-3', 'Which word rhymes with “sun”?', ['run', 'sit', 'cap'], 'run'),
          mcq('wf-4', 'Which word rhymes with “pen”?', ['ten', 'pin', 'pan'], 'ten'),
          mcq('wf-5', 'c _ t (a small animal that says meow). Which letter is missing?', ['a', 'o', 'u'], 'a', { pic: '🐈', picLabel: 'cat' }),
          mcq('wf-6', 'p _ g (a pink farm animal). Which letter is missing?', ['i', 'e', 'a'], 'i', { pic: '🐖', picLabel: 'pig' }),
          mcq('wf-7', 'b _ s (it takes children to school). Which letter is missing?', ['u', 'a', 'o'], 'u', { pic: '🚌', picLabel: 'bus' }),
          mcq('wf-8', 'Which word does NOT rhyme with the others: bat, mat, sit, hat?', ['sit', 'bat', 'mat', 'hat'], 'sit'),
        ] }),
    ],
  },
  {
    id: 'en-1-sentences', level: 3, title: 'Capital letters and full stops',
    objectives: [
      O({ id: 'capitals', title: 'Writing a sentence correctly', intro: 'A sentence starts with a capital letter and ends with a full stop. Names and “I” always take capitals.', examples: [ex('My name is Ravi.'), ex('I live in Warangal.')],
        items: [
          mcq('cp-1', 'Which sentence is written correctly?', ['My name is Ravi.', 'my name is ravi.', 'My name is Ravi'], 'My name is Ravi.'),
          mcq('cp-2', 'Which sentence is written correctly?', ['I like mangoes.', 'i like mangoes.', 'I like mangoes'], 'I like mangoes.'),
          mcq('cp-3', 'Which sentence is written correctly?', ['The dog is big.', 'the dog is big.', 'The dog is big'], 'The dog is big.'),
          mcq('cp-4', 'Which sentence is written correctly?', ['Sita has a red bag.', 'sita has a red bag.', 'Sita has a red bag'], 'Sita has a red bag.'),
          mcq('cp-5', 'Which word needs a capital letter?', ['hyderabad', 'city', 'big'], 'hyderabad', { explain: 'Hyderabad is the name of a place.' }),
          mcq('cp-6', 'What comes at the end of a telling sentence?', ['a full stop (.)', 'a capital letter', 'nothing'], 'a full stop (.)'),
        ] }),
      O({ id: 'order', title: 'Make a sentence', intro: 'Put the words in order to make a sentence.', examples: [ex('The cat is on the mat.'), ex('I can run fast.')],
        items: [
          order('eo-1', 'Put the words in order.', ['The', 'cat', 'is', 'on', 'the', 'mat.']),
          order('eo-2', 'Put the words in order.', ['I', 'can', 'run', 'fast.']),
          order('eo-3', 'Put the words in order.', ['We', 'go', 'to', 'school.']),
          order('eo-4', 'Put the words in order.', ['The', 'sun', 'is', 'hot.']),
          order('eo-5', 'Put the words in order.', ['My', 'mother', 'is', 'kind.']),
          order('eo-6', 'Put the words in order.', ['Birds', 'can', 'fly.']),
        ] }),
    ],
  },
  // ===== Class 2 =====
  {
    id: 'en-2-words', level: 4, title: 'Naming words and doing words', read: ['en-story-2'],
    objectives: [
      O({ id: 'naming', title: 'Naming words', intro: 'Naming words name a person, animal, place or thing: Anu, cow, park, book.', examples: [ex('The girl reads a book. → girl, book'), ex('Ravi went to the park. → Ravi, park')],
        items: ([['book', 'run', 'happy', 'slowly'], ['Anu', 'jump', 'tall', 'quickly'], ['park', 'sing', 'red', 'very'], ['cow', 'eat', 'soft', 'here'], ['teacher', 'write', 'kind', 'today'], ['river', 'swim', 'blue', 'there']])
          .map((c, i) => mcq(`nm-${i + 1}`, 'Which is a naming word?', c, c[0], { explain: `“${c[0]}” names a person, animal, place or thing.` })) }),
      O({ id: 'doing', title: 'Doing words', intro: 'Doing words tell us what someone does: run, eat, sing, sleep.', examples: [ex('The baby sleeps. → sleeps'), ex('Birds sing. → sing')],
        items: ([['jump', 'ball', 'green', 'school'], ['eat', 'apple', 'sweet', 'table'], ['sing', 'song', 'loud', 'girl'], ['swim', 'pond', 'cold', 'fish'], ['read', 'book', 'new', 'desk'], ['dance', 'stage', 'pretty', 'dress']])
          .map((c, i) => mcq(`dw-${i + 1}`, 'Which is a doing word?', c, c[0], { explain: `“${c[0]}” is an action.` })) }),
    ],
  },
  {
    id: 'en-2-sentences', level: 4, title: 'Using is / are, has / have',
    objectives: [
      O({ id: 'blank', title: 'Fill the blank', intro: 'Use “is” for one and “are” for many. Use “has” for one person or thing, and “have” with I, you, we, they.', examples: [ex('The bird is small. The birds are small.'), ex('Ravi has a kite. We have two kites.')],
        items: [
          mcq('fb-1', 'The cat ___ sleeping.', ['is', 'are'], 'is'),
          mcq('fb-2', 'The children ___ playing.', ['are', 'is'], 'are'),
          mcq('fb-3', 'Sita ___ a new bag.', ['has', 'have'], 'has'),
          mcq('fb-4', 'We ___ a big garden.', ['have', 'has'], 'have'),
          mcq('fb-5', 'The mangoes ___ sweet.', ['are', 'is'], 'are'),
          mcq('fb-6', 'I ___ a pet dog.', ['have', 'has'], 'have'),
        ] }),
    ],
  },
  // ===== Class 3 =====
  {
    id: 'en-3-nouns', level: 5, title: 'Nouns and pronouns', read: ['en-story-3'],
    objectives: [
      O({ id: 'nouns', title: 'Common and proper nouns', intro: 'A common noun is a general name (city, boy). A proper noun is a special name and starts with a capital letter (Chennai, Arjun).', examples: [ex('city → Chennai'), ex('river → Krishna')],
        items: classify('cn', [['Delhi', 'proper noun'], ['girl', 'common noun'], ['Monday', 'proper noun'], ['school', 'common noun'], ['Ganga', 'proper noun'], ['mountain', 'common noun']], ['common noun', 'proper noun'], (t) => `“${t}” is a…`) }),
      O({ id: 'pronouns', title: 'Pronouns', intro: 'Pronouns take the place of nouns: he, she, it, we, they, I, you.', examples: [ex('Arjun is tall. He plays basketball.'), ex('The kite is red. It flies high.')],
        items: [
          mcq('pr-1', 'Meena is my friend. ___ sings well.', ['She', 'He', 'It', 'They'], 'She'),
          mcq('pr-2', 'Rahul is late. ___ missed the bus.', ['He', 'She', 'We', 'It'], 'He'),
          mcq('pr-3', 'The puppy is hungry. ___ wants milk.', ['It', 'He', 'They', 'We'], 'It'),
          mcq('pr-4', 'Asha and Ravi are twins. ___ are seven.', ['They', 'She', 'It', 'I'], 'They'),
          mcq('pr-5', 'My friends and I made a card. ___ gave it to our teacher.', ['We', 'They', 'He', 'You'], 'We'),
          mcq('pr-6', 'Which word is a pronoun?', ['they', 'table', 'quickly', 'green'], 'they'),
        ] }),
    ],
  },
  {
    id: 'en-3-articles', level: 5, title: 'Articles; singular and plural',
    objectives: [
      O({ id: 'articles', title: 'a, an, the', intro: 'Use “an” before a vowel sound (an egg, an hour), “a” before other sounds (a cup, a uniform), and “the” for something particular.', examples: [ex('a banana, an apple'), ex('an hour (h is silent), a uniform (sounds like “you”)')],
        items: [
          mcq('ar-1', 'I saw ___ elephant.', ['an', 'a', 'the'], 'an'),
          mcq('ar-2', 'She ate ___ banana.', ['a', 'an'], 'a'),
          mcq('ar-3', 'We waited for ___ hour.', ['an', 'a'], 'an', { explain: 'Hour begins with a vowel sound (the h is silent).' }),
          mcq('ar-4', 'He wears ___ uniform.', ['a', 'an'], 'a', { explain: 'Uniform begins with a “you” sound.' }),
          mcq('ar-5', '___ sun rises in the east.', ['The', 'A', 'An'], 'The', { explain: 'There is only one sun.' }),
          mcq('ar-6', 'I have ___ umbrella.', ['an', 'a'], 'an'),
          mcq('ar-7', 'Please close ___ door of this room.', ['the', 'an'], 'the'),
        ] }),
      O({ id: 'plurals', title: 'One and many', intro: 'Most plurals add -s (cat → cats). Words ending in s, sh, ch, x add -es (box → boxes). Some change: child → children.', examples: [ex('dog → dogs, bus → buses'), ex('baby → babies, man → men')],
        items: ([['box', 'boxes', ['boxs', 'boxies']], ['baby', 'babies', ['babys', 'babyes']], ['child', 'children', ['childs', 'childes']], ['bench', 'benches', ['benchs', 'benchies']], ['leaf', 'leaves', ['leafs', 'leafes']], ['tooth', 'teeth', ['tooths', 'toothes']], ['bus', 'buses', ['buss', 'busies']]] as const)
          .map(([w, a, wr], i) => typed(`pl-${i + 1}`, `Write the plural of “${w}”.`, [a], [...wr], { explain: `${w} → ${a}` })) }),
    ],
  },
  // ===== Class 4 =====
  {
    id: 'en-4-grammar', level: 6, title: 'Verbs, adjectives and simple tenses', read: ['en-story-4'],
    objectives: [
      O({ id: 'adjectives', title: 'Adjectives', intro: 'Adjectives describe nouns: a tall tree, three birds, a soft pillow.', examples: [ex('The red kite flew high. → red'), ex('She has two cats. → two')],
        items: ([['The tall boy won.', 'tall', ['boy', 'won']], ['I ate a sweet mango.', 'sweet', ['ate', 'mango']], ['The old man smiled.', 'old', ['man', 'smiled']], ['She wore a blue dress.', 'blue', ['wore', 'dress']], ['We saw five ducks.', 'five', ['saw', 'ducks']], ['It was a noisy class.', 'noisy', ['was', 'class']]] as const)
          .map(([s, a, w], i) => mcq(`aj-${i + 1}`, `“${s}” – which word is the adjective?`, [a, ...w], a)) }),
      O({ id: 'tenses', title: 'Past, present, future', intro: 'Past: it happened (played). Present: it happens now or always (plays). Future: it will happen (will play).', examples: [ex('Yesterday I played cricket. – past'), ex('Tomorrow I will play cricket. – future')],
        items: [
          ...classify('ts', [['She walked to school.', 'past'], ['He eats an apple every day.', 'present'], ['We will visit Grandma.', 'future'], ['They sang a song.', 'past'], ['The sun rises in the east.', 'present']], ['past', 'present', 'future'], (t) => `“${t}” – which tense?`),
          mcq('ts-6', 'Yesterday I ___ a letter.', ['wrote', 'write', 'will write'], 'wrote'),
          mcq('ts-7', 'Next week we ___ to the zoo.', ['will go', 'went', 'go'], 'will go'),
        ] }),
    ],
  },
  {
    id: 'en-4-vocab', level: 6, title: 'Synonyms and antonyms',
    objectives: [
      O({ id: 'synonyms', title: 'Synonyms', intro: 'Synonyms are words with nearly the same meaning: big – large.', examples: [ex('happy – glad'), ex('fast – quick')],
        items: pair('sy', [['big', 'large'], ['happy', 'glad'], ['fast', 'quick'], ['begin', 'start'], ['small', 'tiny'], ['shout', 'yell'], ['clever', 'smart']], (w) => `Which word means almost the same as “${w}”?`, 'Synonym') }),
      O({ id: 'antonyms', title: 'Antonyms', intro: 'Antonyms are words with opposite meanings: hot – cold.', examples: [ex('early – late'), ex('strong – weak')],
        items: pair('an', [['hot', 'cold'], ['early', 'late'], ['strong', 'weak'], ['empty', 'full'], ['remember', 'forget'], ['arrive', 'leave'], ['ancient', 'modern']], (w) => `What is the opposite of “${w}”?`, 'Antonym') }),
    ],
  },
  // ===== Class 5 =====
  {
    id: 'en-5-punct', level: 7, title: 'Punctuation', read: ['en-story-5'],
    objectives: [
      O({ id: 'marks', title: 'Punctuation marks', intro: 'Full stop (.) ends a statement, question mark (?) ends a question, exclamation mark (!) shows strong feeling, comma (,) separates items in a list, apostrophe (’) shows ownership or a short form.', examples: [ex('Where is my pencil?'), ex('We bought apples, bananas and grapes.')],
        items: [
          mcq('pu-1', 'Which mark ends this sentence: “Where do you live_”', ['?', '.', '!'], '?'),
          mcq('pu-2', 'Which mark ends this sentence: “What a beautiful rainbow_”', ['!', '?', ','], '!'),
          mcq('pu-3', 'Which sentence uses commas correctly?', ['I need pens, pencils and paper.', 'I need, pens pencils, and paper.', 'I, need pens pencils and paper.'], 'I need pens, pencils and paper.'),
          mcq('pu-4', 'Which is correct?', ['This is Rani’s bag.', 'This is Ranis bag.', 'This is Ranis’ bag.'], 'This is Rani’s bag.', { explain: 'One owner: add ’s.' }),
          mcq('pu-5', '“do not” can be shortened to…', ['don’t', 'dont', 'do’nt'], 'don’t'),
          mcq('pu-6', 'Which is written correctly?', ['Mother said, “Wash your hands.”', 'Mother said “wash your hands”.', 'Mother said, wash your hands.'], 'Mother said, “Wash your hands.”'),
          mcq('pu-7', 'Which needs a capital letter?', ['diwali', 'festival', 'lamp'], 'diwali', { explain: 'Festival names are proper nouns.' }),
        ] }),
    ],
  },
  {
    id: 'en-5-build', level: 7, title: 'Building sentences',
    objectives: [
      O({ id: 'order', title: 'Order the words', intro: 'In English the usual order is subject – verb – object: The farmer (subject) grows (verb) rice (object).', examples: [ex('The farmer grows rice.'), ex('My sister painted a lovely picture.')],
        items: [
          order('bs-1', 'Put the words in order.', ['The', 'farmer', 'grows', 'rice', 'in', 'his', 'field.']),
          order('bs-2', 'Put the words in order.', ['My', 'sister', 'painted', 'a', 'lovely', 'picture.']),
          order('bs-3', 'Put the words in order.', ['We', 'planted', 'ten', 'trees', 'near', 'our', 'school.']),
          order('bs-4', 'Put the words in order.', ['Did', 'you', 'finish', 'your', 'homework?']),
          order('bs-5', 'Put the words in order.', ['The', 'train', 'left', 'the', 'station', 'on', 'time.']),
          order('bs-6', 'Put the words in order.', ['Please', 'switch', 'off', 'the', 'fan.']),
        ] }),
      O({ id: 'joining', title: 'Joining words: and, but, because, so', intro: '“and” adds, “but” contrasts, “because” gives a reason, “so” gives a result.', examples: [ex('I was tired, so I slept early.'), ex('She was ill, but she came to school.')],
        items: [
          mcq('jn-1', 'I like tea ___ my brother likes coffee.', ['but', 'because', 'so'], 'but'),
          mcq('jn-2', 'He stayed home ___ he had a fever.', ['because', 'but', 'and'], 'because'),
          mcq('jn-3', 'It was raining, ___ we took umbrellas.', ['so', 'because', 'but'], 'so'),
          mcq('jn-4', 'Anu sings ___ dances well.', ['and', 'but', 'because'], 'and'),
          mcq('jn-5', 'The shop was open, ___ it had no bread.', ['but', 'so', 'and'], 'but'),
          mcq('jn-6', 'We cheered loudly ___ our team won.', ['because', 'but', 'so'], 'because'),
        ] }),
    ],
  },
  // ===== Class 6 =====
  {
    id: 'en-6-pos', level: 8, title: 'Parts of speech in depth', read: ['en-passage-6'],
    objectives: [
      O({ id: 'identify', title: 'Name the part of speech', intro: 'Eight parts of speech: noun, pronoun, verb, adjective, adverb, preposition, conjunction, interjection. A word’s job in the sentence decides its part of speech.', examples: [ex('She ran QUICKLY. → adverb (tells how)'), ex('The book is ON the table. → preposition (shows position)'), ex('WOW! That is tall. → interjection')],
        items: ([['She sang SWEETLY.', 'adverb'], ['The cat hid UNDER the bed.', 'preposition'], ['OOPS! I dropped it.', 'interjection'], ['I wanted tea, BUT there was no milk.', 'conjunction'], ['THEY reached early.', 'pronoun'], ['The HONEST boy returned the purse.', 'adjective'], ['Courage is a great VIRTUE.', 'noun'], ['Birds BUILD nests.', 'verb']] as const)
          .map(([s, a], i) => mcq(`ps-${i + 1}`, `“${s}” – what part of speech is the word in capitals?`, [a, ...others(['noun', 'pronoun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection'], ['noun', 'pronoun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection'].indexOf(a), 3)], a)) }),
      O({ id: 'same-word', title: 'One word, different jobs', intro: 'The same word can be a different part of speech in different sentences.', examples: [ex('I watch TV. (verb) / My watch is new. (noun)'), ex('He runs fast. (adverb) / Fast food is unhealthy. (adjective)')],
        items: [
          mcq('sw2-1', '“Light the lamp.” – “Light” is a…', ['verb', 'noun', 'adjective'], 'verb'),
          mcq('sw2-2', '“The light is bright.” – “light” is a…', ['noun', 'verb', 'adverb'], 'noun'),
          mcq('sw2-3', '“This bag is light.” – “light” is an…', ['adjective', 'verb', 'noun'], 'adjective'),
          mcq('sw2-4', '“She works hard.” – “hard” is an…', ['adverb', 'adjective', 'noun'], 'adverb'),
          mcq('sw2-5', '“It was a hard test.” – “hard” is an…', ['adjective', 'adverb', 'verb'], 'adjective'),
          mcq('sw2-6', '“They stood near the gate.” – “near” is a…', ['preposition', 'conjunction', 'noun'], 'preposition'),
        ] }),
    ],
  },
  {
    id: 'en-6-tenses', level: 8, title: 'Tenses: continuous and perfect',
    objectives: [
      O({ id: 'forms', title: 'Choose the tense form', intro: 'Continuous = be + -ing (is playing, was playing). Perfect = have/has/had + past participle (has eaten, had left). Perfect continuous = have been + -ing.', examples: [ex('She is reading now. (present continuous)'), ex('They had left before we arrived. (past perfect)')],
        items: [
          mcq('tf-1', 'Look! The baby ___.', ['is sleeping', 'sleeps', 'slept'], 'is sleeping'),
          mcq('tf-2', 'I ___ my homework already.', ['have finished', 'finish', 'am finishing'], 'have finished'),
          mcq('tf-3', 'When I called, she ___ dinner.', ['was cooking', 'cooks', 'has cooked'], 'was cooking'),
          mcq('tf-4', 'The train ___ before we reached the station.', ['had left', 'leaves', 'is leaving'], 'had left'),
          mcq('tf-5', 'They ___ here since 2020.', ['have lived', 'lived', 'are living'], 'have lived'),
          mcq('tf-6', 'By next June, I ___ this course.', ['will have completed', 'complete', 'was completing'], 'will have completed'),
          typed('tf-7', 'Type the correct form: She ___ (write) a letter now.', ['is writing'], ['writes', 'wrote']),
          typed('tf-8', 'Type the correct form: We ___ (see) that film last week.', ['saw'], ['have seen', 'see']),
        ] }),
    ],
  },
  // ===== Class 7 =====
  {
    id: 'en-7-voice', level: 9, title: 'Active and passive voice', read: ['en-passage-7'],
    objectives: [
      O({ id: 'passive', title: 'Change the voice', intro: 'Active: the subject does the action (Ravi wrote a poem). Passive: the action is done to the subject (A poem was written by Ravi). Passive = be + past participle.', examples: [ex('The cat chased the rat. → The rat was chased by the cat.'), ex('People speak Telugu here. → Telugu is spoken here.')],
        items: [
          mcq('pv-1', 'Passive of: “Meena painted the wall.”', ['The wall was painted by Meena.', 'The wall is painted by Meena.', 'Meena was painted by the wall.'], 'The wall was painted by Meena.'),
          mcq('pv-2', 'Passive of: “The gardener waters the plants.”', ['The plants are watered by the gardener.', 'The plants were watered by the gardener.', 'The gardener is watered by the plants.'], 'The plants are watered by the gardener.'),
          mcq('pv-3', 'Passive of: “They will build a bridge.”', ['A bridge will be built by them.', 'A bridge was built by them.', 'A bridge is built by them.'], 'A bridge will be built by them.'),
          mcq('pv-4', 'Active of: “The match was won by our team.”', ['Our team won the match.', 'Our team wins the match.', 'The match won our team.'], 'Our team won the match.'),
          mcq('pv-5', 'Which sentence is in the passive voice?', ['The letter was posted yesterday.', 'I posted the letter yesterday.', 'She is posting a letter.'], 'The letter was posted yesterday.'),
          mcq('pv-6', 'Passive of: “Someone has stolen my bicycle.”', ['My bicycle has been stolen.', 'My bicycle was stealing.', 'My bicycle has stolen.'], 'My bicycle has been stolen.'),
          mcq('pv-7', 'Passive of: “Is she singing a song?”', ['Is a song being sung by her?', 'Is a song sung by her?', 'Was a song sung by her?'], 'Is a song being sung by her?'),
        ] }),
    ],
  },
  {
    id: 'en-7-agreement', level: 9, title: 'Subject–verb agreement',
    objectives: [
      O({ id: 'sva', title: 'Make the verb agree', intro: 'A singular subject takes a singular verb; a plural subject takes a plural verb. Watch out for words between the subject and the verb.', examples: [ex('The box of pencils IS on the desk. (subject: box)'), ex('Each of the students HAS a book. (each = singular)')],
        items: [
          mcq('sv-1', 'The list of names ___ on the board.', ['is', 'are'], 'is'),
          mcq('sv-2', 'Neither the teacher nor the students ___ late.', ['were', 'was'], 'were', { explain: 'With neither…nor, the verb agrees with the nearer subject (students).' }),
          mcq('sv-3', 'Each of the boys ___ a medal.', ['has', 'have'], 'has'),
          mcq('sv-4', 'Bread and butter ___ my favourite breakfast.', ['is', 'are'], 'is', { explain: 'Taken as one dish, it is singular.' }),
          mcq('sv-5', 'The children in the park ___ happy.', ['look', 'looks'], 'look'),
          mcq('sv-6', 'Mathematics ___ my best subject.', ['is', 'are'], 'is'),
          mcq('sv-7', 'Either Ravi or his sisters ___ coming.', ['are', 'is'], 'are'),
        ] }),
    ],
  },
  // ===== Class 8 =====
  {
    id: 'en-8-speech', level: 10, title: 'Direct and indirect speech', read: ['en-passage-8'],
    objectives: [
      O({ id: 'reported', title: 'Report the speech', intro: 'In indirect (reported) speech we remove quotation marks, change pronouns, and usually move tenses back one step after a past reporting verb (is → was, will → would).', examples: [ex('She said, “I am tired.” → She said that she was tired.'), ex('He asked, “Where do you live?” → He asked where I lived.')],
        items: [
          mcq('rs-1', 'Ravi said, “I am hungry.”', ['Ravi said that he was hungry.', 'Ravi said that I am hungry.', 'Ravi said that he is being hungry.'], 'Ravi said that he was hungry.'),
          mcq('rs-2', 'Mother said, “I will bake a cake.”', ['Mother said that she would bake a cake.', 'Mother said that she will baked a cake.', 'Mother said that I would bake a cake.'], 'Mother said that she would bake a cake.'),
          mcq('rs-3', 'The teacher said to us, “Open your books.”', ['The teacher told us to open our books.', 'The teacher told us that open your books.', 'The teacher said us to opened our books.'], 'The teacher told us to open our books.'),
          mcq('rs-4', 'Anu asked me, “Do you like music?”', ['Anu asked me if I liked music.', 'Anu asked me do I like music.', 'Anu asked me that you liked music.'], 'Anu asked me if I liked music.'),
          mcq('rs-5', 'He asked, “Where is the station?”', ['He asked where the station was.', 'He asked where was the station.', 'He asked that where is the station.'], 'He asked where the station was.'),
          mcq('rs-6', 'She said, “The earth goes round the sun.”', ['She said that the earth goes round the sun.', 'She said that the earth went round the sun.', 'She said the earth had gone round the sun.'], 'She said that the earth goes round the sun.', { explain: 'A universal truth keeps the present tense.' }),
          mcq('rs-7', 'Sam said, “I have lost my key.”', ['Sam said that he had lost his key.', 'Sam said that he has lost my key.', 'Sam said that I had lost his key.'], 'Sam said that he had lost his key.'),
        ] }),
    ],
  },
  {
    id: 'en-8-clauses', level: 10, title: 'Clauses',
    objectives: [
      O({ id: 'clauses', title: 'Main and subordinate clauses', intro: 'A clause has a subject and a verb. A main clause makes sense alone; a subordinate clause depends on it. Subordinate clauses act as nouns, adjectives or adverbs.', examples: [ex('I know [that you are honest]. → noun clause'), ex('The boy [who won] is my cousin. → adjective clause'), ex('We stayed inside [because it rained]. → adverb clause')],
        items: [
          ...classify('cl', [['I believe that she will win.', 'noun clause'], ['This is the house where I was born.', 'adjective clause'], ['Call me when you reach home.', 'adverb clause'], ['What he said surprised everyone.', 'noun clause'], ['The pen which you gave me writes well.', 'adjective clause'], ['Although it was late, we kept working.', 'adverb clause']],
            ['noun clause', 'adjective clause', 'adverb clause'], (t) => `“${t}” – what kind of subordinate clause does it have?`),
          mcq('cl-7', '“We went out after the rain stopped.” – which is the main clause?', ['We went out', 'after the rain stopped', 'the rain stopped'], 'We went out'),
        ] }),
    ],
  },
  // ===== Class 9 =====
  {
    id: 'en-9-figures', level: 11, title: 'Figures of speech', read: ['en-passage-9'],
    objectives: [
      O({ id: 'figures', title: 'Identify the figure of speech', intro: 'Simile compares using “like/as”. Metaphor says one thing is another. Personification gives human qualities to things. Alliteration repeats a starting sound. Hyperbole exaggerates. Onomatopoeia imitates a sound. Oxymoron joins opposites.', examples: [ex('Her smile was as bright as the sun. → simile'), ex('The wind whispered through the trees. → personification')],
        items: classify('fg', [['He is as brave as a lion.', 'simile'], ['Time is a thief.', 'metaphor'], ['The stars danced in the sky.', 'personification'], ['Seven silly sparrows sang.', 'alliteration'], ['I have told you a million times!', 'hyperbole'], ['The bees buzzed in the garden.', 'onomatopoeia'], ['There was a deafening silence.', 'oxymoron'], ['The classroom was a zoo.', 'metaphor']],
          ['simile', 'metaphor', 'personification', 'alliteration', 'hyperbole', 'onomatopoeia', 'oxymoron'], (t) => `“${t}”`)
          .map((it) => ({ ...it, choices: [it.answer[0], ...others(it.choices, it.choices.indexOf(it.answer[0]), 3)] })) }),
    ],
  },
  {
    id: 'en-9-vocab', level: 11, title: 'Vocabulary in context',
    objectives: [
      O({ id: 'context', title: 'Meaning from context', intro: 'Use the words around an unfamiliar word to guess its meaning.', examples: [ex('The path was so narrow that only one person could pass. → narrow = not wide'), ex('After the long walk, the hikers were famished and ate quickly. → famished = very hungry')],
        items: [
          mcq('vc-1', '“The old bridge was fragile, so trucks were not allowed.” Fragile means…', ['easily broken', 'very long', 'newly painted'], 'easily broken'),
          mcq('vc-2', '“She was elated when she topped the class.” Elated means…', ['very happy', 'very tired', 'confused'], 'very happy'),
          mcq('vc-3', '“The instructions were ambiguous; nobody knew what to do.” Ambiguous means…', ['unclear', 'short', 'helpful'], 'unclear'),
          mcq('vc-4', '“Water is scarce in the desert.” Scarce means…', ['hard to find', 'very cold', 'plentiful'], 'hard to find'),
          mcq('vc-5', '“He was reluctant to jump into the cold river.” Reluctant means…', ['unwilling', 'eager', 'able'], 'unwilling'),
          mcq('vc-6', '“The festival lights made the street look vibrant.” Vibrant means…', ['full of life and colour', 'dark and quiet', 'dirty'], 'full of life and colour'),
        ] }),
    ],
  },
  // ===== Class 10 =====
  {
    id: 'en-10-writing', level: 12, title: 'Formal letter, notice and essay', read: ['en-passage-10'],
    objectives: [
      O({ id: 'letter', title: 'Formal letter', intro: 'Format: sender’s address → date → receiver’s address → subject → salutation (Sir/Madam) → body (purpose, details, request) → complimentary close (Yours faithfully) → name.', examples: [
        ex('Model letter to the Municipal Commissioner:\n12, Lake View Colony, Vijayawada\n9 November 2026\nThe Municipal Commissioner, Vijayawada\nSubject: Broken streetlights in Lake View Colony\nSir,\nI wish to draw your attention to the streetlights on our main road, which have not worked for three weeks. The road is unsafe for walkers after dark. I request you to have them repaired at the earliest.\nYours faithfully,\nA. B. (Resident)'),
        ex('Formal letters are brief and polite. Use “Yours faithfully” with “Sir/Madam”, and “Yours sincerely” when you address the person by name.')],
        items: [
          order('fl-1', 'Put the parts of a formal letter in order.', ['Sender’s address', 'Date', 'Receiver’s address', 'Subject', 'Salutation', 'Body', 'Complimentary close']),
          mcq('fl-2', 'Which salutation suits a letter to an unknown official?', ['Sir/Madam,', 'Dear buddy,', 'Hi there,'], 'Sir/Madam,'),
          mcq('fl-3', 'Which closing goes with “Sir/Madam”?', ['Yours faithfully,', 'Your loving friend,', 'Cheers,'], 'Yours faithfully,'),
          mcq('fl-4', 'What should the subject line do?', ['State the purpose of the letter in a few words', 'Repeat the full address', 'Greet the reader'], 'State the purpose of the letter in a few words'),
          mcq('fl-5', 'Which sentence has the right tone for a formal letter?', ['I request you to look into this matter at the earliest.', 'Fix this right now!', 'Hey, can u sort this out?'], 'I request you to look into this matter at the earliest.'),
          mcq('fl-6', 'Which of these is a formal letter?', ['A complaint to a company about a faulty product', 'A birthday letter to a cousin', 'A thank-you note to a friend'], 'A complaint to a company about a faulty product'),
        ] }),
      O({ id: 'notice', title: 'Notice', intro: 'A notice is short and placed in a box: name of the institution → NOTICE → date → heading → body (what, when, where, who to contact) → name and designation of the writer. About 50 words.', examples: [ex('Model notice:\nGREENFIELD HIGH SCHOOL\nNOTICE\n9 November 2026\nINTER-HOUSE QUIZ\nAll students of Classes 8–10 are informed that an inter-house quiz will be held on 20 November in the school hall at 10 a.m. Interested students may give their names to the undersigned by 15 November.\nK. Lakshmi\nSecretary, Literary Club'), ex('Answer the 5 Ws: What? When? Where? Who can take part? Whom to contact?')],
        items: [
          mcq('nt-1', 'What is written at the very top of a school notice?', ['The name of the institution', 'The writer’s signature', 'The deadline'], 'The name of the institution'),
          mcq('nt-2', 'About how long should a school notice be?', ['About 50 words', 'About 500 words', 'One word'], 'About 50 words'),
          mcq('nt-3', 'Which detail is essential in a notice about an event?', ['Date, time and venue', 'The writer’s hobbies', 'A long story about the event’s history'], 'Date, time and venue'),
          mcq('nt-4', 'Who signs a notice?', ['The person issuing it, with designation', 'Every student', 'Nobody'], 'The person issuing it, with designation'),
          order('nt-5', 'Put the parts of a notice in order.', ['Institution name', 'NOTICE', 'Date', 'Heading', 'Body', 'Name and designation']),
        ] }),
      O({ id: 'essay', title: 'Essay structure', intro: 'An essay has an introduction (hook + main idea), body paragraphs (one point each, with examples), and a conclusion (summary + a final thought). Use linking words: firstly, moreover, however, finally.', examples: [ex('Model outline – “Saving water”:\nIntroduction: Water is precious; many towns face shortages.\nBody 1: Causes of waste at home.\nBody 2: Simple ways to save – fix leaks, harvest rainwater, reuse water.\nBody 3: Role of schools and communities.\nConclusion: Every drop counts; small habits make a big difference.'), ex('A topic sentence begins each body paragraph and states its main point.')],
        items: [
          order('ey-1', 'Put the parts of an essay in order.', ['Introduction', 'Body paragraphs', 'Conclusion']),
          mcq('ey-2', 'What does a topic sentence do?', ['States the main point of a paragraph', 'Ends the essay', 'Lists references'], 'States the main point of a paragraph'),
          mcq('ey-3', 'Which is a good linking word to add a point?', ['Moreover', 'Yesterday', 'Suddenly'], 'Moreover'),
          mcq('ey-4', 'What belongs in a conclusion?', ['A summary and a final thought', 'A completely new argument', 'The essay title again only'], 'A summary and a final thought'),
          mcq('ey-5', 'How many main ideas should one body paragraph usually develop?', ['One', 'Five', 'None'], 'One'),
        ] }),
    ],
  },
];

export const ENGLISH: Course = { id: 'english', script: 'en', title: 'English', titleEn: 'English', units };
