// Telangana SCERT Class 5 — English (My English World, Class V). Original teaching aligned to the official chapter list
// (src/content/ts/books.ts, syllabus.json). We never reproduce the textbook's readings or poems: each unit is taught
// ABOUT — its theme in our own words, new words with our own example sentences, and the unit's grammar point.
import {
  tp, ex, p, h, tip, keys, remember, photo, def, L, choose, pictures, matching, ordering, tapAll,
  type USpec, type TSpec, type OSpec,
} from '../../lib/kit';
import type { VisualSpec } from '../../../shared/content';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(5, 'english', n);

// ---------- compact practice factories ----------
const H3 = 'Read every option slowly, and try each one in the sentence.';
const NOT = 'Not quite.';
const emo = (e: string): VisualSpec => ({ kind: 'emoji', text: e });

/** [question, correct, wrong answers, hint, why] */
type MQ = [string, string, string[], string, string];
/** [question, [emoji, label] correct, wrong [emoji, label][], hint, why] */
type PQ = [string, [string, string], [string, string][], string, string];

const mcq = (key: string, hint0: string, bank: MQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, a, w, h1, why] = r.pick(bank);
  return {
    type: 'mcq', prompt: q, ...choose(r, a, w), hints: [hint0, h1, H3],
    mistakes: [{ when: 'wrong', explain: `${NOT} ${why}` }],
    solution: [`Answer: ${a}`, why],
  };
}, d);

const picq = (key: string, hint0: string, bank: PQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, [ae, al], w, h1, why] = r.pick(bank);
  return {
    type: 'mcq', prompt: q,
    ...pictures(r, { label: al, visual: emo(ae) }, w.map(([e, l]) => ({ label: l, visual: emo(e) })), 4),
    hints: [hint0, h1, H3],
    mistakes: [{ when: 'wrong', explain: `${NOT} ${why}` }],
    solution: [`Answer: ${ae} ${al}`, why],
  };
}, d);

const matchT = (key: string, prompt: string, pool: [string, string][], hints: string[], n = 4, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pairs = r.shuffle(pool).slice(0, n);
  const m = matching(r, pairs);
  return {
    type: 'match', prompt: `${prompt} — ${pairs.map((x) => x[0]).join(' · ')}`, left: m.left, right: m.right, answer: m.answer, hints: [...hints, H3],
    mistakes: [{ when: 'wrong', explain: `${NOT} At least one pair is mixed up — check them one at a time.` }],
    solution: pairs.map(([a, b]) => `${a} → ${b}`),
  };
}, d);

/** bank of [words in correct order, why] — words inside one sentence must all be different. */
const orderT = (key: string, prompt: string, bank: [string[], string][], hints: string[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [words, why] = r.pick(bank);
  return {
    type: 'order', prompt, ...ordering(r, words), hints: [...hints, H3],
    mistakes: [{ when: 'wrong', explain: `${NOT} ${why}` }],
    solution: [words.join(' '), why],
  };
}, d);

const tapT = (key: string, prompt: string, pool: [string, boolean][], hints: string[], why: string, n = 5, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pick = r.shuffle(pool).slice(0, n);
  if (!pick.some((x) => x[1])) pick[0] = pool.find((x) => x[1])!;
  if (!pick.some((x) => !x[1])) pick[n - 1] = pool.find((x) => !x[1])!;
  return {
    type: 'tap', prompt, ...tapAll(r, pick.map(([label, ok]) => ({ label, ok }))), hints: [...hints, H3],
    mistakes: [{ when: 'wrong', explain: `${NOT} Check each option on its own. ${why}` }],
    solution: [`Answer: ${pick.filter((x) => x[1]).map((x) => x[0]).join(', ')}`, why],
  };
}, d);

const unit = (n: number, title: string, te: string, objectives: OSpec[], note?: string): USpec => ({
  id: `ts5.en.u${n}`, subject: 'english', title: L(title, te), source: src(n), objectives, ...(note ? { note } : {}),
});
const THEME_NOTE = 'Reading objectives teach the unit theme and vocabulary in our own words; teacher to connect them to the printed readings.';

// =====================================================================================
// 0 — Bridging Gap Activity Pictures
// =====================================================================================
const u0 = unit(0, 'Bridging Gap — Picture Talk', 'బొమ్మలతో మాటలు', [
  {
    id: 'ts5.en.picture.words', title: 'Naming words from pictures', prereqs: [],
    intro: [
      h('Look, point and say'),
      photo('🏫', 'A school: we can see a gate, a bell, a garden, children and a teacher.'),
      p('Every thing we see has a name. "Cat", "tree", "bus", "teacher" and "school" are naming words. In a picture, point to each thing and say its name aloud in English.'),
      def('Naming word (noun)', 'A word that names a person, animal, place or thing: girl, dog, village, pencil.'),
      keys('Person: boy, girl, farmer, doctor', 'Animal: cow, dog, parrot', 'Place: school, market, park', 'Thing: bag, pen, ball'),
      tip('Play "I spy": I spy something green… (a leaf!).'),
    ],
    examples: [
      ex('Name the picture: 🐄', ['It is an animal.', 'It gives us milk.'], 'cow', emo('🐄')),
      ex('Is "market" a person, a place or a thing?', ['We go to a market to buy vegetables.', 'It is somewhere we go.'], 'a place'),
    ],
    practice: [
      picq('name', 'Look at each picture and say its name aloud.', [
        ['Which picture shows a parrot?', ['🦜', 'parrot'], [['🐦', 'sparrow'], ['🦆', 'duck'], ['🐓', 'hen']], 'A green bird with a red, curved beak.', 'The parrot is 🦜.'],
        ['Which picture shows a bus?', ['🚌', 'bus'], [['🚗', 'car'], ['🚲', 'bicycle'], ['🚆', 'train']], 'Many people ride in it on the road.', 'The bus is 🚌.'],
        ['Which picture shows a teacher?', ['🧑‍🏫', 'teacher'], [['🧑‍🌾', 'farmer'], ['🧑‍⚕️', 'doctor'], ['👶', 'baby']], 'This person teaches in a school.', 'The teacher is 🧑‍🏫.'],
        ['Which picture shows an umbrella?', ['☂️', 'umbrella'], [['🎒', 'bag'], ['🪁', 'kite'], ['🎈', 'balloon']], 'We open it when it rains.', 'The umbrella is ☂️.'],
        ['Which picture shows a farmer?', ['🧑‍🌾', 'farmer'], [['🧑‍🏫', 'teacher'], ['🧑‍⚕️', 'doctor'], ['👶', 'baby']], 'This person grows rice and vegetables.', 'The farmer is 🧑‍🌾.'],
        ['Which picture shows a temple?', ['🛕', 'temple'], [['🏫', 'school'], ['🏠', 'house'], ['🏪', 'shop']], 'People go there to pray.', 'The temple is 🛕.'],
      ]),
      tapT('animals', 'Tap all the animals.', [['cow', true], ['dog', true], ['monkey', true], ['tiger', true], ['rabbit', true], ['pencil', false], ['school', false], ['bus', false], ['teacher', false]],
        ['An animal is a living creature that is not a person.', 'Pencils and buses are things.'], 'Cow, dog, monkey, tiger and rabbit are animals.'),
      matchT('pic', 'Match each word to its picture', [
        ['kite', '🪁'], ['ball', '⚽'], ['book', '📖'], ['tree', '🌳'], ['fish', '🐟'], ['star', '⭐'], ['bell', '🔔'],
      ], ['Say each word aloud and imagine it.', 'A kite flies on a string; a bell rings.']),
    ],
  },
  {
    id: 'ts5.en.picture.sentences', title: 'Talking about a picture in sentences', prereqs: ['ts5.en.picture.words'],
    intro: [
      h('From words to sentences'),
      photo('🏞️', 'In this park, a boy is flying a kite and two girls are playing.'),
      p('We can talk about a picture with short sentences: "This is a park." "I can see a tree." "The boy is flying a kite." A sentence starts with a capital letter and ends with a full stop (.).'),
      keys('This is a …', 'I can see …', 'The … is …ing.', 'Capital letter at the start, full stop at the end.'),
      tip('Say who, then what they are doing: "The girl (who) is reading (doing)."'),
    ],
    examples: [
      ex('Make a sentence: see / I / a / can / cow.', ['Start with the person: I', 'Then "can see"', 'Then "a cow."'], 'I can see a cow.'),
      ex('Make a sentence: is / The / boy / running.', ['Who? The boy', 'Doing what? is running'], 'The boy is running.'),
    ],
    practice: [
      orderT('make', 'Put the words in order to make a sentence.', [
        [['I', 'can', 'see', 'a', 'cow.'], 'Who (I) → can see → what (a cow).'],
        [['This', 'is', 'our', 'school.'], '"This is" begins the sentence.'],
        [['The', 'boy', 'is', 'flying', 'kites.'], 'Who (The boy) → is flying → what.'],
        [['Two', 'girls', 'are', 'playing.'], 'Who (Two girls) → are playing.'],
        [['The', 'farmer', 'has', 'a', 'cart.'], 'Who (The farmer) → has → what.'],
        [['My', 'mother', 'is', 'cooking', 'rice.'], 'Who → is cooking → what.'],
      ], ['The first word has a capital letter.', 'The word with the full stop comes last.']),
      mcq('caps', 'A sentence starts with a capital letter and ends with a full stop.', [
        ['Which sentence is written correctly?', 'The cat is sleeping.', ['the cat is sleeping.', 'The cat is sleeping', 'the cat is sleeping'], 'Look at the first letter and the last mark.', 'Capital T at the start and a full stop at the end.'],
        ['Which sentence is written correctly?', 'I can see a bus.', ['i can see a bus.', 'I can see a bus', 'i can see a bus'], '"I" is always a capital letter.', 'Capital I and a full stop.'],
        ['Which sentence is written correctly?', 'Ravi is reading a book.', ['ravi is reading a book.', 'Ravi is reading a book', 'ravi is reading a book'], 'Names always start with a capital letter.', 'Capital R for the name Ravi, and a full stop.'],
        ['Which sentence is written correctly?', 'This is our garden.', ['this is our garden.', 'This is our garden', 'this is our garden'], 'First letter capital; end with a full stop.', 'Capital T and a full stop.'],
        ['Which sentence is written correctly?', 'We live in Hyderabad.', ['we live in hyderabad.', 'We live in hyderabad.', 'We live in Hyderabad'], 'Place names also start with a capital letter.', 'Capital W, capital H for the place, and a full stop.'],
      ]),
      picq('doing', 'Look at what the picture shows.', [
        ['"The girl is reading." Which picture fits?', ['📖', 'reading a book'], [['⚽', 'playing football'], ['🛏️', 'sleeping'], ['🚲', 'cycling']], 'What do we read?', 'Reading goes with a book 📖.'],
        ['"The boy is cycling." Which picture fits?', ['🚲', 'a bicycle'], [['📖', 'a book'], ['🪁', 'a kite'], ['☕', 'a cup']], 'Cycling needs two wheels.', 'Cycling goes with a bicycle 🚲.'],
        ['"Grandma is drinking tea." Which picture fits?', ['☕', 'a cup of tea'], [['🍎', 'an apple'], ['🎒', 'a bag'], ['⚽', 'a ball']], 'Tea is in a cup.', 'Drinking tea goes with ☕.'],
        ['"The children are flying kites." Which picture fits?', ['🪁', 'kites'], [['🎈', 'balloons'], ['🚌', 'a bus'], ['📚', 'books']], 'It flies on a long string.', 'Flying kites goes with 🪁.'],
        ['"The baby is sleeping." Which picture fits?', ['🛏️', 'a bed'], [['⚽', 'a ball'], ['🚲', 'a bicycle'], ['☂️', 'an umbrella']], 'Where do we sleep?', 'Sleeping goes with a bed 🛏️.'],
      ]),
    ],
  },
]);

// =====================================================================================
// 1 — Let's be Friends; The Best of Friends — articles
// =====================================================================================
const u1 = unit(1, "Unit 1 — Let's be Friends", 'యూనిట్ 1 — స్నేహం', [
  {
    id: 'ts5.en.friends.reading', title: 'Friendship: theme and new words', prereqs: [],
    intro: [
      h('What makes a good friend?'),
      photo('👧', 'Friends play together, share, help and say sorry when they make a mistake.'),
      p('Unit 1 is about friendship. Its two readings show how friends care for each other: they share, listen, help when someone is in trouble, and forgive small fights. A good friend is kind, honest and loyal.'),
      keys('share — give part of what you have', 'help — make a job easier for someone', 'loyal — stays with you in good and bad times', 'forgive — stop being angry after a mistake'),
      tip('Tell a partner: "My best friend is … because …"'),
    ],
    examples: [
      ex('Meena forgot her lunch. Kiran gave her half of his. Which word describes Kiran?', ['He gave part of what he had.', 'That is sharing.'], 'Kiran is sharing (kind).'),
      ex('Use "loyal" in a sentence.', ['loyal = stays with you always', 'Our dog stays beside us every day.'], 'Our dog is loyal to us.'),
    ],
    practice: [
      mcq('words', 'Think of what friends do for each other.', [
        ['Ravi gives half of his mango to Sana. Ravi is …', 'sharing', ['shouting', 'hiding', 'sleeping'], 'He gives part of what he has.', 'Giving part of what you have is sharing.'],
        ['A friend who stays with you in good and bad times is …', 'loyal', ['lazy', 'rude', 'angry'], 'Like a faithful dog.', 'Loyal means faithful.'],
        ['Diya said sorry. Priya smiled and said, "It is okay." Priya …', 'forgave her', ['scolded her', 'left her', 'hit her'], 'She stopped being angry.', 'To forgive is to stop being angry.'],
        ['Which is a good way to make a new friend?', 'Say hello and smile', ['Laugh at them', 'Ignore them', 'Take their pencil'], 'What would make you feel welcome?', 'A smile and "hello" start a friendship.'],
        ['Your friend fell down in the playground. You should …', 'help her get up', ['laugh at her', 'run away', 'tell everyone'], 'A friend in need…', 'Good friends help.'],
      ]),
      tapT('good', 'Tap everything a good friend does.', [['shares toys', true], ['listens', true], ['tells the truth', true], ['helps with homework', true], ['says sorry', true], ['bullies others', false], ['tells lies', false], ['breaks promises', false]],
        ['Would this make your friend happy?', 'Lies and bullying hurt.'], 'Good friends are kind, honest and helpful.'),
      matchT('mean', 'Match each word to its meaning', [
        ['share', 'give part of what you have'], ['loyal', 'faithful'], ['forgive', 'stop being angry'], ['honest', 'always tells the truth'], ['kind', 'caring and gentle'], ['quarrel', 'an angry argument'],
      ], ['Think of a sentence for each word.', 'A quarrel is a small fight with words.']),
    ],
  },
  {
    id: 'ts5.en.friends.articles', title: 'Articles: a, an, the', prereqs: [],
    intro: [
      h('Little words, big job'),
      photo('🍎', 'an apple, a banana, the sun'),
      p('"A" and "an" mean "one" (any one). Use "an" before a vowel SOUND (a, e, i, o, u): an apple, an egg, an umbrella, an hour. Use "a" before a consonant sound: a dog, a book, a uniform (it sounds "you-niform").'),
      p('"The" points to a particular thing, or a thing there is only one of: the sun, the moon, the book on my table.'),
      keys('a + consonant sound: a cat, a kite', 'an + vowel sound: an owl, an ink-pot', 'the + a particular / only one: the sky, the Charminar'),
      remember('It is the SOUND that matters: an hour (h is silent), a university (sounds "yoo").'),
      tip('Say it aloud — "an apple" flows smoothly; "a apple" sounds bumpy.'),
    ],
    examples: [
      ex('Fill in: I saw ___ elephant.', ['"elephant" begins with the vowel sound e.', 'Use "an".'], 'an elephant'),
      ex('Fill in: ___ sun rises in the east.', ['There is only one sun.', 'Use "the".'], 'The sun'),
    ],
    practice: [
      mcq('fill', 'Say the next word aloud: does it start with a vowel sound?', [
        ['I have ___ umbrella.', 'an', ['a', 'the'], '"umbrella" starts with the sound "u".', 'Vowel sound → an umbrella.'],
        ['She has ___ kitten.', 'a', ['an', 'the'], '"kitten" starts with the sound "k".', 'Consonant sound → a kitten.'],
        ['___ moon is bright tonight.', 'The', ['A', 'An'], 'There is only one moon.', 'Only one of it → the moon.'],
        ['We waited for ___ hour.', 'an', ['a', 'the'], 'The h in "hour" is silent.', 'Sounds like "our" → an hour.'],
        ['He is ___ honest boy.', 'an', ['a', 'the'], 'The h in "honest" is silent.', 'Sounds like "onest" → an honest boy.'],
        ['I saw ___ owl on the tree.', 'an', ['a', 'the'], '"owl" starts with o.', 'Vowel sound → an owl.'],
        ['My father wears ___ uniform.', 'a', ['an', 'the'], '"uniform" sounds like "you-niform".', 'It starts with a "y" sound → a uniform.'],
      ]),
      tapT('an', 'Tap every word that takes "an".', [['apple', true], ['egg', true], ['orange', true], ['ink-pot', true], ['hour', true], ['ball', false], ['dog', false], ['kite', false], ['uniform', false]],
        ['Say each word aloud: vowel sound or not?', 'Hour has a silent h; uniform sounds like "you".'], '"An" goes before a vowel sound.'),
      orderT('make', 'Put the words in order to make a sentence.', [
        [['I', 'ate', 'an', 'apple.'], 'Who → did what → an apple.'],
        [['The', 'sun', 'is', 'hot.'], '"The" for the only sun.'],
        [['She', 'has', 'a', 'red', 'bag.'], 'a + red (consonant sound).'],
        [['We', 'saw', 'an', 'elephant.'], 'an + elephant (vowel sound).'],
        [['He', 'is', 'my', 'best', 'friend.'], 'Who → is → my best friend.'],
      ], ['The capitalised word comes first.', 'The word with a full stop comes last.']),
    ],
  },
], THEME_NOTE);

// =====================================================================================
// 2 — Karate Kitten; Our Kittens — action words (grammar topic not printed: we teach verbs)
// =====================================================================================
const u2 = unit(2, 'Unit 2 — Karate Kitten', 'యూనిట్ 2 — పిల్లి పిల్ల', [
  {
    id: 'ts5.en.kitten.reading', title: 'Kittens: theme and new words', prereqs: [],
    intro: [
      h('Playful kittens'),
      photo('🐱', 'A kitten is a baby cat. It loves to jump, pounce and play.'),
      p('Unit 2 is about kittens — playful baby cats. One reading is a fun story about a kitten that tries karate-like moves; the other is about kittens and how we look after pets. Kittens are curious: they chase, pounce, leap and purr. Pets need food, water, a clean place and gentle love.'),
      keys('kitten — a baby cat', 'pounce — jump suddenly on something', 'purr — the soft sound a happy cat makes', 'curious — wants to know and explore', 'karate — a sport of kicks and blocks'),
      tip('Act it out: pounce like a kitten, then curl up and purr!'),
    ],
    examples: [
      ex('What is a baby cat called?', ['Baby dog = puppy.', 'Baby cat = kitten.'], 'a kitten'),
      ex('The kitten jumped suddenly on the ball. Which word means this?', ['A sudden jump onto something…'], 'pounce'),
    ],
    practice: [
      matchT('babies', 'Match each animal to its baby', [
        ['cat', 'kitten'], ['dog', 'puppy'], ['cow', 'calf'], ['hen', 'chick'], ['goat', 'kid'], ['duck', 'duckling'],
      ], ['Kitten, puppy, calf, chick…', 'A baby goat is called a kid!'], 4),
      mcq('words', 'Picture a little kitten playing.', [
        ['A happy cat makes a soft sound. It …', 'purrs', ['barks', 'moos', 'roars'], 'Dogs bark; cows moo.', 'Cats purr when happy.'],
        ['The kitten jumped suddenly on the wool. It …', 'pounced', ['slept', 'cried', 'swam'], 'A quick sudden jump.', 'To pounce is to jump suddenly on something.'],
        ['A kitten that wants to explore everything is …', 'curious', ['lazy', 'sad', 'sleepy'], 'It wants to know things.', 'Curious means eager to explore.'],
        ['What does a pet kitten need every day?', 'food, water and care', ['a car', 'a phone', 'homework'], 'What do living things need?', 'Pets need food, water and care.'],
        ['Karate is a kind of …', 'sport', ['food', 'song', 'tree'], 'It has kicks and blocks.', 'Karate is a sport.'],
      ]),
      tapT('care', 'Tap the kind ways to look after a kitten.', [['give it clean water', true], ['stroke it gently', true], ['give it a warm place to sleep', true], ['take it to the vet when sick', true], ['pull its tail', false], ['shout at it', false], ['leave it out in the rain', false]],
        ['Would the kitten feel safe and happy?', 'Pulling and shouting hurt and frighten animals.'], 'Pets need gentle care, food, water and shelter.'),
    ],
  },
  {
    id: 'ts5.en.kitten.verbs', title: 'Action words (verbs) — now and yesterday', prereqs: [],
    intro: [
      h('Doing words'),
      photo('🐈', 'The kitten jumps. The kitten runs. Yesterday it climbed a tree!'),
      p('A verb is a doing word: jump, run, eat, kick, sleep. To talk about yesterday we usually add -ed: jump → jumped, kick → kicked, play → played. Some verbs change completely: run → ran, eat → ate, go → went, see → saw.'),
      def('Verb', 'A word that tells what someone or something does: The kitten jumps.'),
      keys('jump → jumped', 'play → played', 'run → ran', 'eat → ate', 'go → went', 'sit → sat'),
      tip('Add "Yesterday…" at the start: "Yesterday the kitten ___." — the verb must be in the past.'),
    ],
    examples: [
      ex('Find the verb: The kitten kicks the ball.', ['What does the kitten DO?', 'It kicks.'], 'kicks'),
      ex('Past of "run"?', ['"runned" is not a word.', 'run changes to ran.'], 'ran'),
    ],
    practice: [
      mcq('find', 'Ask: what does someone DO in this sentence?', [
        ['Which word is the verb? "The kitten jumps high."', 'jumps', ['kitten', 'high', 'The'], 'It is the doing word.', 'Jumps tells what the kitten does.'],
        ['Which word is the verb? "Sana drinks milk."', 'drinks', ['Sana', 'milk'], 'What does Sana do?', 'Drinks is the action.'],
        ['Which word is the verb? "The cat sleeps on the mat."', 'sleeps', ['cat', 'mat', 'on'], 'What does the cat do?', 'Sleeps is the action.'],
        ['Which word is the verb? "Arjun kicks the ball."', 'kicks', ['Arjun', 'ball', 'the'], 'Look for the action.', 'Kicks is the action.'],
        ['Which word is the verb? "Birds sing in the morning."', 'sing', ['Birds', 'morning', 'in'], 'What do birds do?', 'Sing is the action.'],
      ]),
      mcq('past', 'The word "Yesterday" tells us to use the past form.', [
        ['Yesterday the kitten ___ a mouse. (chase)', 'chased', ['chase', 'chases', 'chasing'], 'Add -d.', 'chase → chased.'],
        ['Yesterday we ___ to the park. (go)', 'went', ['goed', 'go', 'goes'], '"go" changes completely.', 'go → went.'],
        ['Yesterday Ravi ___ an apple. (eat)', 'ate', ['eated', 'eats', 'eat'], '"eat" changes completely.', 'eat → ate.'],
        ['Yesterday the kitten ___ fast. (run)', 'ran', ['runned', 'runs', 'run'], '"run" changes its vowel.', 'run → ran.'],
        ['Yesterday they ___ cricket. (play)', 'played', ['plaied', 'plays', 'play'], 'Add -ed.', 'play → played.'],
        ['Yesterday I ___ a rainbow. (see)', 'saw', ['seed', 'sees', 'see'], '"see" changes completely.', 'see → saw.'],
      ], 2),
      matchT('pairs', 'Match each verb to its past form', [
        ['jump', 'jumped'], ['run', 'ran'], ['eat', 'ate'], ['go', 'went'], ['sit', 'sat'], ['sing', 'sang'], ['play', 'played'],
      ], ['Some just add -ed; some change completely.', 'sit → sat, sing → sang.']),
    ],
  },
], `${THEME_NOTE} The official contents give no grammar heading for this unit; we teach action verbs and simple past — teacher to align with the unit's exercise page.`);

// =====================================================================================
// 3 — Together We Live; The Three Little Rabbits — adjectives
// =====================================================================================
const u3 = unit(3, 'Unit 3 — Together We Live', 'యూనిట్ 3 — కలిసి జీవిద్దాం', [
  {
    id: 'ts5.en.together.reading', title: 'Living together: theme and new words', prereqs: [],
    intro: [
      h('Everyone needs everyone'),
      photo('🐰', 'Rabbits live together in burrows and look out for each other.'),
      p('Unit 3 is about living together. People, animals and plants all need one another: bees need flowers and flowers need bees; neighbours help each other. The rabbit reading shows little rabbits learning that working together and being careful keeps them safe.'),
      keys('together — with each other', 'neighbour — a person who lives near you', 'burrow — a hole where rabbits live', 'depend — need someone or something', 'cooperate — work together'),
      tip('Find one way your family members depend on each other.'),
    ],
    examples: [
      ex('Where does a rabbit live?', ['It digs a hole in the ground.', 'That hole is called a burrow.'], 'in a burrow'),
      ex('"The children cooperated to clean the class." What did they do?', ['cooperate = work together'], 'They worked together.'),
    ],
    practice: [
      matchT('homes', 'Match each animal to its home', [
        ['rabbit', 'burrow'], ['bird', 'nest'], ['bee', 'hive'], ['cow', 'shed'], ['dog', 'kennel'], ['spider', 'web'],
      ], ['Where does each animal sleep?', 'Bees live in a hive; spiders in a web.']),
      mcq('words', 'Think about helping and sharing.', [
        ['A person who lives next to your house is your …', 'neighbour', ['enemy', 'teacher', 'stranger'], 'They live near you.', 'Neighbour = someone who lives nearby.'],
        ['When we work together we …', 'cooperate', ['quarrel', 'sleep', 'hide'], 'Co- means together.', 'Cooperate = work together.'],
        ['Bees need flowers for nectar. Bees ___ on flowers.', 'depend', ['sleep', 'quarrel', 'cry'], 'They need them.', 'To depend on = to need.'],
        ['The rabbits hid in their ___ when the fox came.', 'burrow', ['nest', 'hive', 'web'], 'A rabbit home under the ground.', 'Rabbits live in burrows.'],
        ['The theme of this unit is …', 'living together and helping each other', ['being alone', 'fighting', 'wasting food'], 'Look at the unit title.', 'The unit is about living together.'],
      ]),
      tapT('help', 'Tap the ways neighbours can help each other.', [['share vegetables from the garden', true], ['help an old person carry bags', true], ['keep the street clean', true], ['feed a pet when the owner is away', true], ['play loud music at night', false], ['throw rubbish next door', false]],
        ['Would this make life easier for others?', 'Noise and rubbish trouble neighbours.'], 'Good neighbours help and respect each other.'),
    ],
  },
  {
    id: 'ts5.en.together.adjectives', title: 'Adjectives: describing words', prereqs: [],
    intro: [
      h('Words that describe'),
      photo('🐇', 'a small, white, fluffy rabbit'),
      p('An adjective tells us more about a noun: its size (big, small), colour (white, green), shape (round), feeling (happy) or number (three). In "three little rabbits", both "three" and "little" are adjectives describing "rabbits".'),
      def('Adjective', 'A describing word: a tall tree, a red ball, a kind girl.'),
      keys('size: big, tiny, tall', 'colour: brown, white, green', 'feeling: happy, brave, scared', 'number: one, three, many'),
      tip('Ask "What kind?" or "How many?" — the answer is the adjective.'),
    ],
    examples: [
      ex('Find the adjective: "The brown rabbit ran."', ['What kind of rabbit?', 'brown.'], 'brown'),
      ex('Find the adjectives: "three little rabbits"', ['How many? three', 'What kind? little'], 'three, little'),
    ],
    practice: [
      mcq('find', 'Ask "What kind?" or "How many?" about the noun.', [
        ['Which word is an adjective? "The tall tree gives shade."', 'tall', ['tree', 'gives', 'shade'], 'What kind of tree?', 'Tall describes the tree.'],
        ['Which word is an adjective? "Meena has a red bag."', 'red', ['Meena', 'has', 'bag'], 'What colour is the bag?', 'Red describes the bag.'],
        ['Which word is an adjective? "The brave girl helped."', 'brave', ['girl', 'helped', 'The'], 'What kind of girl?', 'Brave describes the girl.'],
        ['Which word is an adjective? "We saw five ducks."', 'five', ['saw', 'ducks', 'We'], 'How many ducks?', 'Five describes how many ducks.'],
        ['Which word is an adjective? "The rabbit has soft fur."', 'soft', ['rabbit', 'fur', 'has'], 'What kind of fur?', 'Soft describes the fur.'],
        ['Which word is an adjective? "It was a happy day."', 'happy', ['day', 'was', 'It'], 'What kind of day?', 'Happy describes the day.'],
      ]),
      tapT('tap', 'Tap all the adjectives (describing words).', [['big', true], ['green', true], ['tiny', true], ['kind', true], ['round', true], ['run', false], ['rabbit', false], ['eat', false], ['school', false]],
        ['Can it go before a noun to describe it? "a ___ ball"', 'Run and eat are actions; rabbit and school are names.'], 'Adjectives describe nouns.'),
      picq('pic', 'Match the describing word to the picture.', [
        ['Which picture fits "a tall animal"?', ['🦒', 'giraffe'], [['🐭', 'mouse'], ['🐜', 'ant'], ['🐢', 'tortoise']], 'Its neck reaches the treetops.', 'A giraffe 🦒 is tall.'],
        ['Which picture fits "a tiny animal"?', ['🐜', 'ant'], [['🐘', 'elephant'], ['🦒', 'giraffe'], ['🐃', 'buffalo']], 'You can hardly see it.', 'An ant 🐜 is tiny.'],
        ['Which picture fits "a slow animal"?', ['🐢', 'tortoise'], [['🐇', 'rabbit'], ['🐎', 'horse'], ['🐅', 'tiger']], 'It carries its house on its back.', 'A tortoise 🐢 is slow.'],
        ['Which picture fits "something cold"?', ['🧊', 'ice'], [['🔥', 'fire'], ['☀️', 'sun'], ['☕', 'tea']], 'It melts in your hand.', 'Ice 🧊 is cold.'],
        ['Which picture fits "something round"?', ['⚽', 'ball'], [['📏', 'ruler'], ['📖', 'book'], ['✏️', 'pencil']], 'It rolls.', 'A ball ⚽ is round.'],
      ]),
    ],
  },
], THEME_NOTE);

// =====================================================================================
// 4 — A Big Surprise; Five Friendly Farmers — helping verbs
// =====================================================================================
const u4 = unit(4, 'Unit 4 — A Big Surprise', 'యూనిట్ 4 — పెద్ద ఆశ్చర్యం', [
  {
    id: 'ts5.en.farmers.reading', title: 'Surprises and farmers: theme and new words', prereqs: [],
    intro: [
      h('Surprises and the farm'),
      photo('🧑‍🌾', 'Farmers plough, sow seeds, water the fields and harvest the crop.'),
      p('Unit 4 has a reading about a big surprise — something nice that happens when you do not expect it — and a reading about friendly farmers who work hard and help each other. Farmers grow the food we eat, so we should value their work and never waste food.'),
      keys('surprise — something you did not expect', 'plough — break up the soil', 'sow — put seeds in the soil', 'harvest — cut and collect the crop', 'crop — plants grown for food, like rice'),
      tip('Order of farm work: plough → sow → water → harvest.'),
    ],
    examples: [
      ex('Order these: harvest, sow, plough.', ['First break the soil: plough', 'Then put seeds: sow', 'Last collect the crop: harvest'], 'plough → sow → harvest'),
      ex('Use "surprise" in a sentence.', ['Something unexpected and happy'], 'My friends gave me a surprise party.'),
    ],
    practice: [
      orderT('farm', 'Put the farm work in the right order.', [
        [['plough', 'sow', 'water', 'harvest'], 'Soil first, seeds next, water, then cut the crop.'],
        [['plough the field', 'sow the seeds', 'remove the weeds', 'harvest the rice'], 'Weeds are removed while plants grow.'],
        [['seed', 'sprout', 'plant', 'crop'], 'A seed sprouts, grows into a plant and gives a crop.'],
        [['sow', 'water', 'harvest', 'sell'], 'Crops are sold after the harvest.'],
        [['harvest', 'thresh', 'store'], 'After cutting, grain is separated (threshed) and stored.'],
      ], ['What must happen first on a farm?', 'Harvesting is near the end.']),
      mcq('words', 'Think about the farm and about surprises.', [
        ['Putting seeds in the soil is called …', 'sowing', ['harvesting', 'ploughing', 'selling'], 'Seeds go in first.', 'To sow = put seeds in.'],
        ['Cutting and collecting the ripe crop is called …', 'harvesting', ['sowing', 'ploughing', 'watering'], 'It happens at the end.', 'Harvest = cut and collect the crop.'],
        ['Something nice you did not expect is a …', 'surprise', ['harvest', 'habit', 'homework'], 'A birthday party you did not know about!', 'That is a surprise.'],
        ['Who grows the rice we eat?', 'farmers', ['drivers', 'tailors', 'pilots'], 'They work in fields.', 'Farmers grow our food.'],
        ['Rice, wheat and maize are …', 'crops', ['tools', 'animals', 'machines'], 'Grown in fields for food.', 'They are crops.'],
      ]),
      matchT('tools', 'Match each word to its picture', [
        ['farmer', '🧑‍🌾'], ['tractor', '🚜'], ['rice crop', '🌾'], ['buffalo', '🐃'], ['seedling', '🌱'], ['gift', '🎁'],
      ], ['Say each word and imagine it on a farm.', 'A seedling is a baby plant.']),
    ],
  },
  {
    id: 'ts5.en.farmers.helping', title: 'Helping verbs: am, is, are, was, were, has, have', prereqs: [],
    intro: [
      h('Verbs that help'),
      photo('🚜', 'The farmer is driving the tractor. The farmers are working.'),
      p('Helping verbs (auxiliary verbs) help the main verb. Now: I am, he/she/it is, we/you/they are. Past: I/he/she/it was, we/you/they were. Have: I/we/you/they have, he/she/it has.'),
      keys('I am happy. She is singing. They are farmers.', 'I was tired. They were in the field.', 'He has a cow. We have a tractor.'),
      remember('One person or thing → is / was / has. Many → are / were / have. With "I" → am / was / have.'),
      tip('Count the doers: one? many? or "I"?'),
    ],
    examples: [
      ex('Fill in: The farmers ___ ploughing.', ['"farmers" = many.', 'Now → are.'], 'are'),
      ex('Fill in: Ravi ___ a new bicycle.', ['Ravi = one person.', 'have/has → has.'], 'has'),
    ],
    practice: [
      mcq('fill', 'Who is the doer — I, one, or many? Now or past?', [
        ['I ___ a student.', 'am', ['is', 'are', 'were'], 'With "I" now, use…', 'I am.'],
        ['The farmer ___ in the field now.', 'is', ['are', 'am', 'were'], 'One person, now.', 'One + now → is.'],
        ['The children ___ playing now.', 'are', ['is', 'am', 'was'], 'Many, now.', 'Many + now → are.'],
        ['Yesterday we ___ at the farm.', 'were', ['was', 'is', 'am'], 'Many (we), past.', 'We + past → were.'],
        ['Yesterday the cow ___ in the shed.', 'was', ['were', 'are', 'am'], 'One, past.', 'One + past → was.'],
        ['She ___ two goats.', 'has', ['have', 'are', 'am'], 'One person owning.', 'She has.'],
        ['They ___ a big field.', 'have', ['has', 'is', 'was'], 'Many people owning.', 'They have.'],
      ]),
      tapT('many', 'Tap the helping verbs used with MANY people (we, they).', [['are', true], ['were', true], ['have', true], ['is', false], ['was', false], ['has', false], ['am', false]],
        ['Try each with "They ___".', '"They is" sounds wrong.'], 'With many: are, were, have.'),
      orderT('make', 'Put the words in order to make a sentence.', [
        [['The', 'farmers', 'are', 'happy.'], 'Many farmers → are.'],
        [['She', 'is', 'feeding', 'hens.'], 'One person → is.'],
        [['We', 'were', 'very', 'surprised.'], 'We + past → were.'],
        [['He', 'has', 'two', 'bullocks.'], 'He → has.'],
        [['I', 'am', 'watering', 'plants.'], 'I → am.'],
      ], ['Start with the doer (capital letter).', 'The helping verb comes right after the doer.']),
    ],
  },
], THEME_NOTE);

// =====================================================================================
// 5 — The Food We Eat; Junk Food… — connectors
// =====================================================================================
const u5 = unit(5, 'Unit 5 — The Food We Eat', 'యూనిట్ 5 — మనం తినే ఆహారం', [
  {
    id: 'ts5.en.food.reading', title: 'Healthy food and junk food', prereqs: [],
    intro: [
      h('Eat well, stay well'),
      photo('🥕', 'Fruits, vegetables, grains, pulses and milk keep us strong.'),
      p('Unit 5 is about the food we eat. Healthy food — fruits, vegetables, rice, roti, dal, eggs, milk — gives us energy and helps us grow. Junk food — chips, cold drinks, too many sweets and fried snacks — has lots of oil, sugar or salt but little goodness. The poem in this unit cheerfully tells junk food to go away!'),
      keys('healthy — good for the body', 'junk food — food with little goodness', 'balanced diet — a little of every food group', 'energy — power to work and play'),
      tip('Make your plate colourful: green, orange, red, white!'),
    ],
    examples: [
      ex('Is a banana healthy food or junk food?', ['It is a fruit.', 'Fruits give vitamins.'], 'healthy food'),
      ex('Why should we eat less junk food?', ['It has too much oil, sugar or salt.', 'It has little goodness.'], 'It is not good for our body.'),
    ],
    practice: [
      tapT('healthy', 'Tap all the healthy foods.', [['banana', true], ['carrot', true], ['dal and rice', true], ['milk', true], ['guava', true], ['chips', false], ['cold drink', false], ['candy floss', false], ['fried snacks every day', false]],
        ['Is it fresh and natural?', 'Packets and bottles with lots of sugar or oil are junk.'], 'Fresh fruit, vegetables, grains, pulses and milk are healthy.'),
      picq('pic', 'Choose the healthy picture.', [
        ['Which is a healthy snack?', ['🍎', 'apple'], [['🍕', 'pizza'], ['🍾', 'fizzy drink'], ['🥫', 'tinned snack']], 'It grows on a tree.', 'An apple 🍎 is healthy.'],
        ['Which drink is best for growing bones?', ['🥛', 'milk'], [['🍾', 'fizzy drink'], ['☕', 'strong coffee'], ['🧴', 'shampoo']], 'It is white and comes from a cow.', 'Milk 🥛 has calcium for bones.'],
        ['Which vegetable is good for our eyes?', ['🥕', 'carrot'], [['🍕', 'pizza'], ['🍾', 'fizzy drink'], ['🥫', 'tinned snack']], 'It is orange and crunchy.', 'Carrots 🥕 are good for eyes.'],
        ['Which is a fresh fruit?', ['🍌', 'banana'], [['🍕', 'pizza'], ['🍾', 'fizzy drink'], ['🥫', 'tinned snack']], 'It is yellow and you peel it.', 'A banana 🍌 is a fresh fruit.'],
        ['Which is the best drink when you are thirsty?', ['💧', 'water'], [['🍾', 'fizzy drink'], ['☕', 'coffee'], ['🍯', 'syrup']], 'It has no sugar at all.', 'Water 💧 is the best drink.'],
      ]),
      mcq('words', 'Think about what the body needs.', [
        ['Food that is good for the body is …', 'healthy', ['junk', 'stale', 'rotten'], 'It helps us grow.', 'Healthy food helps us grow.'],
        ['Chips and cold drinks are …', 'junk food', ['vegetables', 'pulses', 'fruits'], 'Lots of salt or sugar, little goodness.', 'They are junk food.'],
        ['A meal with a little of every kind of food is a …', 'balanced diet', ['fast', 'feast of sweets', 'junk meal'], 'Balanced = equal parts.', 'That is a balanced diet.'],
        ['Food gives us ___ to work and play.', 'energy', ['sleep', 'homework', 'noise'], 'Like fuel for a vehicle.', 'Food gives energy.'],
        ['Before eating we should …', 'wash our hands', ['watch TV', 'run around', 'skip water'], 'Germs on hands…', 'Washing hands keeps germs away.'],
      ]),
    ],
  },
  {
    id: 'ts5.en.food.connectors', title: 'Joining sentences: and, but, so, because', prereqs: [],
    intro: [
      h('Joining words'),
      photo('🧩', 'Connectors join two small sentences into one longer sentence.'),
      p('We join two sentences with joining words (connectors). "and" adds: I ate rice and dal. "but" shows a difference: I like sweets, but I eat them only sometimes. "so" gives a result: I was hungry, so I ate a banana. "because" gives a reason: I eat fruit because it is healthy.'),
      keys('and → adds', 'but → different / opposite', 'so → result', 'because → reason (why?)'),
      tip('Ask "Why?" — if the second part answers it, use "because".'),
    ],
    examples: [
      ex('Join: I drink milk. Milk makes my bones strong.', ['The second part tells WHY.', 'Use "because".'], 'I drink milk because it makes my bones strong.'),
      ex('Join: It was raining. We stayed inside.', ['The second part is the RESULT.', 'Use "so".'], 'It was raining, so we stayed inside.'),
    ],
    practice: [
      mcq('fill', 'Adds, different, result or reason?', [
        ['I eat vegetables ___ they are healthy.', 'because', ['but', 'so', 'and'], 'The second part tells why.', 'Reason → because.'],
        ['I was thirsty, ___ I drank water.', 'so', ['because', 'but', 'and'], 'Drinking water is the result.', 'Result → so.'],
        ['Chips are tasty, ___ they are not healthy.', 'but', ['so', 'because', 'and'], 'Tasty vs not healthy — opposite ideas.', 'Difference → but.'],
        ['We bought apples ___ bananas.', 'and', ['but', 'because', 'so'], 'Just adding one more thing.', 'Adding → and.'],
        ['Sana stayed home ___ she had a fever.', 'because', ['so', 'and', 'but'], 'Why did she stay home?', 'Reason → because.'],
        ['The milk was hot, ___ I waited.', 'so', ['because', 'and', 'but'], 'Waiting was the result.', 'Result → so.'],
      ]),
      matchT('halves', 'Match each beginning to its ending', [
        ['I eat fruit', 'because it is healthy.'], ['It was very hot,', 'so we drank buttermilk.'], ['I like chips,', 'but I eat them rarely.'], ['We washed our hands', 'and sat down to eat.'], ['Ravi was hungry', 'because he missed breakfast.'],
      ], ['Read both halves together — does it make sense?', 'Check the joining word in each ending.']),
      orderT('make', 'Put the words in order to make one joined sentence.', [
        [['I', 'eat', 'carrots', 'because', 'they', 'are', 'good.'], 'Main idea, then "because" + reason.'],
        [['She', 'was', 'tired,', 'so', 'she', 'slept.'], 'Cause, then "so" + result.'],
        [['We', 'like', 'mangoes', 'and', 'guavas.'], '"and" joins two fruits.'],
        [['It', 'rained,', 'but', 'we', 'played.'], '"but" shows a surprise.'],
        [['I', 'drink', 'water', 'because', 'it', 'is', 'healthy.'], 'Reason after "because".'],
      ], ['Find the joining word first.', 'Put the first idea before it, the second after it.'], 2),
    ],
  },
], THEME_NOTE);

// =====================================================================================
// 6 — The Witty Nasruddin; The Clever Jackal — degrees of comparison
// =====================================================================================
const u6 = unit(6, 'Unit 6 — The Witty Nasruddin', 'యూనిట్ 6 — చమత్కారి నస్రుద్దీన్', [
  {
    id: 'ts5.en.witty.reading', title: 'Wit and cleverness: theme and new words', prereqs: [],
    intro: [
      h('Using your head'),
      photo('🤔', 'A witty person gives quick, clever and funny answers.'),
      p('Unit 6 has two clever-thinking readings. Mulla Nasruddin is a famous folk character known for funny, witty answers that also make people think. In the other story, a jackal uses its cleverness to get out of trouble. Folk tales like these teach that quick thinking can solve problems — and that we should use cleverness kindly, not to cheat.'),
      keys('witty — clever and funny with words', 'clever — quick to think and understand', 'folk tale — an old story passed on by people', 'trick — a clever plan to fool someone', 'wise — makes good choices'),
      tip('Tenali Rama and Birbal are also famous for their wit — tell a story you know!'),
    ],
    examples: [
      ex('A person who gives a quick, funny, clever reply is …', ['Clever + funny with words'], 'witty'),
      ex('What is a folk tale?', ['Not from one book author.', 'People told it for many years.'], 'An old story passed on by people.'),
    ],
    practice: [
      mcq('words', 'Think about clever characters in stories.', [
        ['Quick, clever and funny with words means …', 'witty', ['lazy', 'rude', 'shy'], 'Nasruddin is famous for this.', 'Witty = clever and funny.'],
        ['An old story told by people for many years is a …', 'folk tale', ['newspaper', 'letter', 'diary'], 'Grandparents tell these.', 'That is a folk tale.'],
        ['A clever plan to fool someone is a …', 'trick', ['gift', 'meal', 'song'], 'The jackal plays one.', 'That is a trick.'],
        ['A person who makes good choices is …', 'wise', ['foolish', 'careless', 'greedy'], 'Like an old owl in stories.', 'Wise = makes good choices.'],
        ['What should we use our cleverness for?', 'to solve problems kindly', ['to cheat others', 'to hurt friends', 'to tell lies'], 'Cleverness can help or harm.', 'Use cleverness to help, not to cheat.'],
      ]),
      matchT('opp', 'Match each word to its opposite', [
        ['clever', 'foolish'], ['wise', 'silly'], ['quick', 'slow'], ['brave', 'cowardly'], ['honest', 'dishonest'], ['funny', 'serious'],
      ], ['Think of the opposite meaning.', 'Dis- makes some opposites: dishonest.']),
      picq('animals', 'Remember how animals are shown in folk tales.', [
        ['In many folk tales, which animal is clever and cunning?', ['🦊', 'fox / jackal'], [['🐄', 'cow'], ['🐑', 'sheep'], ['🐢', 'tortoise']], 'It has a bushy tail and sharp eyes.', 'Foxes and jackals 🦊 are shown as cunning.'],
        ['Which animal is the "king of the jungle" in stories?', ['🦁', 'lion'], [['🐭', 'mouse'], ['🐰', 'rabbit'], ['🐸', 'frog']], 'It has a mane and a big roar.', 'The lion 🦁.'],
        ['Which bird is shown as wise in stories?', ['🦉', 'owl'], [['🦆', 'duck'], ['🐓', 'hen'], ['🦚', 'peacock']], 'It stays awake at night.', 'The owl 🦉 is shown as wise.'],
        ['Which slow animal won a race by never giving up?', ['🐢', 'tortoise'], [['🐇', 'hare'], ['🐎', 'horse'], ['🐅', 'tiger']], 'It carries its shell.', 'The tortoise 🐢 won.'],
        ['Which animal is famous for a long memory?', ['🐘', 'elephant'], [['🐟', 'fish'], ['🐜', 'ant'], ['🐔', 'chicken']], 'It has a trunk.', 'The elephant 🐘.'],
      ]),
    ],
  },
  {
    id: 'ts5.en.witty.compare', title: 'Degrees of comparison: tall, taller, tallest', prereqs: ['ts5.en.together.adjectives'],
    intro: [
      h('Comparing things'),
      photo('🦒', 'A dog is tall. A horse is taller. A giraffe is the tallest.'),
      p('Adjectives change when we compare. Positive (one thing): tall. Comparative (two things): taller … than. Superlative (three or more): the tallest. Short words add -er / -est: clever → cleverer → cleverest (or more clever). Long words use more / most: beautiful → more beautiful → most beautiful.'),
      keys('small → smaller → smallest', 'big → bigger → biggest (double g)', 'happy → happier → happiest (y → i)', 'good → better → best', 'bad → worse → worst'),
      remember('Use "than" with the comparative and "the" with the superlative.'),
      tip('Two things → -er; three or more → -est.'),
    ],
    examples: [
      ex('Fill in: An elephant is ___ than a dog. (big)', ['Comparing two → comparative.', 'big → bigger (double g).'], 'bigger'),
      ex('Fill in: Ravi is the ___ boy in the class. (good)', ['Many boys → superlative.', 'good → better → best.'], 'best'),
    ],
    practice: [
      mcq('fill', 'Two things → -er + than; three or more → the -est.', [
        ['A horse is ___ than a goat. (fast)', 'faster', ['fast', 'fastest', 'more fast'], 'Comparing two animals.', 'Two → faster.'],
        ['The cheetah is the ___ animal. (fast)', 'fastest', ['faster', 'fast', 'most fast'], '"the" — compared with all.', 'All → fastest.'],
        ['An elephant is ___ than a mouse. (big)', 'bigger', ['biger', 'biggest', 'more big'], 'Double the g.', 'big → bigger.'],
        ['This is the ___ day of my life. (happy)', 'happiest', ['happyest', 'happier', 'most happy'], 'Change y to i.', 'happy → happiest.'],
        ['Your drawing is ___ than mine. (good)', 'better', ['gooder', 'best', 'more good'], '"good" changes completely.', 'good → better.'],
        ['The rose is the most ___ flower in the garden. (beautiful)', 'beautiful', ['beautifuler', 'beautifullest', 'more beautiful'], 'Long word: "most" is already there.', 'most beautiful.'],
      ], 2),
      matchT('forms', 'Match each adjective to its "-est" form', [
        ['tall', 'tallest'], ['big', 'biggest'], ['happy', 'happiest'], ['good', 'best'], ['bad', 'worst'], ['clever', 'cleverest'],
      ], ['Some words change completely.', 'good → best, bad → worst.']),
      orderT('make', 'Put the words in order to make a sentence.', [
        [['The', 'giraffe', 'is', 'taller', 'than', 'a', 'horse.'], 'Comparative + than.'],
        [['The', 'jackal', 'was', 'cleverer', 'than', 'the', 'lion.'], 'Comparative + than.'],
        [['Nasruddin', 'gave', 'the', 'funniest', 'answer.'], '"the" + superlative.'],
        [['Gold', 'is', 'costlier', 'than', 'silver.'], 'Comparing two metals.'],
        [['Hyderabad', 'is', 'bigger', 'than', 'Warangal.'], 'Comparing two cities.'],
      ], ['Find "than" or "the …est".', 'The thing being described comes first.'], 2),
    ],
  },
], THEME_NOTE);

// =====================================================================================
// 7 — I Was Bad at Cricket; Our Legacy — modals
// =====================================================================================
const u7 = unit(7, 'Unit 7 — I Was Bad at Cricket', 'యూనిట్ 7 — ప్రయత్నం, వారసత్వం', [
  {
    id: 'ts5.en.legacy.reading', title: 'Practice and our heritage: theme and new words', prereqs: [],
    intro: [
      h('Keep trying — and treasure the past'),
      photo('🏅', 'Practice turns "I can\'t" into "I can".'),
      p('Unit 7 has a reading in which a child who is not good at cricket learns that practice and not giving up make us better. The other reading, "Our Legacy", is about the heritage our elders leave us — monuments, art, songs, festivals and values — which we must protect and pass on.'),
      keys('practice — doing something again and again to get better', 'legacy / heritage — what we receive from people before us', 'monument — an old, important building like the Charminar', 'confident — sure of yourself', 'protect — keep safe'),
      tip('Pick one skill and practise it for ten minutes every day for a week!'),
    ],
    examples: [
      ex('How can someone who is bad at cricket get better?', ['Not by giving up.', 'By practising again and again.'], 'By practising regularly.'),
      ex('Name a monument that is part of Telangana\'s heritage.', ['An old, famous building in Hyderabad with four minarets.'], 'Charminar'),
    ],
    practice: [
      mcq('words', 'Think about practising and about our heritage.', [
        ['Doing something again and again to improve is …', 'practice', ['laziness', 'holiday', 'luck'], 'Players do this every day.', 'That is practice.'],
        ['What we receive from people who lived before us is our …', 'legacy', ['homework', 'pocket money', 'timetable'], 'Old buildings, songs, festivals.', 'That is our legacy/heritage.'],
        ['The Charminar and Golconda Fort are …', 'monuments', ['vegetables', 'animals', 'rivers'], 'Old, important buildings.', 'They are monuments.'],
        ['After much practice, Kiran felt sure of himself. He felt …', 'confident', ['nervous', 'sleepy', 'angry'], 'Sure of yourself.', 'Confident = sure of yourself.'],
        ['What should we do with our monuments?', 'protect them', ['scribble on them', 'break them', 'litter near them'], 'Keep them safe for the future.', 'We must protect our heritage.'],
      ]),
      tapT('protect', 'Tap the ways to protect our heritage.', [['keep monuments clean', true], ['learn folk songs from elders', true], ['celebrate festivals together', true], ['visit museums', true], ['write names on old walls', false], ['throw plastic at monuments', false]],
        ['Does it keep the past safe?', 'Writing on walls damages monuments.'], 'We protect heritage by caring for it and learning about it.'),
      matchT('meaning', 'Match each word to its meaning', [
        ['practice', 'doing again and again'], ['heritage', 'what we receive from the past'], ['monument', 'an old important building'], ['confident', 'sure of yourself'], ['protect', 'keep safe'], ['improve', 'get better'],
      ], ['Use each word in a sentence in your head.', 'Improve = get better.']),
    ],
  },
  {
    id: 'ts5.en.legacy.modals', title: 'Modal verbs: can, could, must, should, might', prereqs: [],
    intro: [
      h('Little helpers with big meanings'),
      photo('⚠️', 'You must stop at a red light.'),
      p('Modal verbs come before a main verb and add meaning. can — ability now (I can swim). could — ability in the past or a polite request (I could run fast. Could you help me?). must — strong need or rule (We must wear helmets). should — advice (You should practise daily). might — maybe (It might rain).'),
      keys('can = able to', 'could = was able to / polite request', 'must = it is necessary', 'should = it is a good idea', 'might = perhaps'),
      remember('After a modal, use the plain verb: She can swim (NOT can swims / can to swim).'),
      tip('Rule → must; advice → should; maybe → might.'),
    ],
    examples: [
      ex('Choose: You ___ brush your teeth twice a day. (advice)', ['It is a good idea, a piece of advice.'], 'should'),
      ex('Choose: Look at the clouds! It ___ rain.', ['We are not sure — maybe.'], 'might'),
    ],
    practice: [
      mcq('fill', 'Ability, rule, advice, polite request or maybe?', [
        ['We ___ follow traffic rules. (rule)', 'must', ['might', 'could', 'can'], 'It is necessary.', 'Rule → must.'],
        ['You ___ practise every day to improve. (advice)', 'should', ['might', 'could', 'can'], 'A good idea.', 'Advice → should.'],
        ['The sky is grey. It ___ rain. (maybe)', 'might', ['must', 'should', 'can'], 'We are not sure.', 'Maybe → might.'],
        ['Birds ___ fly. (ability)', 'can', ['must', 'should', 'might'], 'They are able to.', 'Ability → can.'],
        ['When I was four, I ___ ride a tricycle. (past ability)', 'could', ['can', 'must', 'should'], 'Past ability.', 'Past ability → could.'],
        ['___ you please pass the salt? (polite)', 'Could', ['Must', 'Might', 'Should'], 'A polite request.', 'Polite request → Could.'],
      ]),
      mcq('form', 'After a modal comes the plain verb.', [
        ['Which is correct?', 'She can swim.', ['She can swims.', 'She can to swim.', 'She cans swim.'], 'No -s, no "to" after can.', 'can + plain verb.'],
        ['Which is correct?', 'You should rest.', ['You should rests.', 'You should to rest.', 'You shoulds rest.'], 'Plain verb after should.', 'should + rest.'],
        ['Which is correct?', 'We must go now.', ['We must going now.', 'We must to go now.', 'We musts go now.'], 'Plain verb after must.', 'must + go.'],
        ['Which is correct?', 'It might rain.', ['It might rains.', 'It might to rain.', 'It mights rain.'], 'Plain verb after might.', 'might + rain.'],
        ['Which is correct?', 'He could run fast.', ['He could runs fast.', 'He could to run fast.', 'He coulds run fast.'], 'Plain verb after could.', 'could + run.'],
      ]),
      matchT('use', 'Match each modal to its use', [
        ['can', 'ability now'], ['could', 'past ability / polite request'], ['must', 'rule, necessary'], ['should', 'advice'], ['might', 'maybe'],
      ], ['Think of an example for each.', 'Must = rule; should = advice.']),
    ],
  },
], THEME_NOTE);

// =====================================================================================
// 8 — Will Power; We Shall Overcome — gender of nouns
// =====================================================================================
const u8 = unit(8, 'Unit 8 — Will Power', 'యూనిట్ 8 — సంకల్ప బలం', [
  {
    id: 'ts5.en.willpower.reading', title: 'Will power and hope: theme and new words', prereqs: [],
    intro: [
      h('Never give up'),
      photo('💪', 'Will power is the inner strength that keeps you going when things are hard.'),
      p('Unit 8 is about will power and hope. One reading shows how a determined person keeps working towards a goal even when it is difficult. The other is a famous song of hope sung around the world, saying that together people will overcome their troubles one day.'),
      keys('will power — strong wish and inner strength to do something', 'determined — not giving up', 'overcome — win over a difficulty', 'goal — something you want to achieve', 'hope — believing good things will happen'),
      tip('Write your goal for this year and one step you will take this week.'),
    ],
    examples: [
      ex('What does "overcome" mean?', ['over + come: get over a problem.'], 'to win over a difficulty'),
      ex('Sita failed her cycling test but practised and passed. What did she show?', ['She did not give up.'], 'will power (determination)'),
    ],
    practice: [
      mcq('words', 'Think about not giving up.', [
        ['The inner strength to keep trying is …', 'will power', ['laziness', 'fear', 'anger'], 'It comes from inside you.', 'That is will power.'],
        ['To win over a difficulty is to …', 'overcome', ['overeat', 'overlook', 'oversleep'], 'over + come.', 'Overcome = defeat a difficulty.'],
        ['Someone who never gives up is …', 'determined', ['careless', 'lazy', 'bored'], 'Firm in the mind.', 'Determined = not giving up.'],
        ['Something you want to achieve is a …', 'goal', ['hole', 'bowl', 'coal'], 'Like scoring in football!', 'That is a goal.'],
        ['Believing good things will happen is …', 'hope', ['fear', 'doubt', 'worry'], 'It keeps us going.', 'That is hope.'],
      ]),
      tapT('show', 'Tap the actions that show will power.', [['practising after failing', true], ['finishing homework before playing', true], ['trying again and again', true], ['asking for help and continuing', true], ['giving up at the first try', false], ['blaming others', false], ['crying and stopping', false]],
        ['Does the person keep going?', 'Stopping or blaming is not will power.'], 'Will power means you keep trying.'),
      matchT('opp', 'Match each word to its opposite', [
        ['hope', 'despair'], ['strong', 'weak'], ['win', 'lose'], ['begin', 'end'], ['brave', 'afraid'], ['success', 'failure'],
      ], ['Think of the opposite meaning.', 'Despair = no hope at all.']),
    ],
  },
  {
    id: 'ts5.en.willpower.gender', title: 'Gender of nouns: masculine and feminine', prereqs: [],
    intro: [
      h('He or she?'),
      photo('👑', 'king → queen, prince → princess'),
      p('Nouns for males are masculine (boy, king, uncle). Nouns for females are feminine (girl, queen, aunt). Some nouns are for either — common gender (child, teacher, friend, doctor). Things without life are neuter (book, table).'),
      keys('boy → girl', 'man → woman', 'father → mother', 'king → queen', 'uncle → aunt', 'lion → lioness', 'prince → princess', 'actor → actress'),
      tip('Some feminine nouns just add -ess: lion → lioness, host → hostess.'),
    ],
    examples: [
      ex('Feminine of "king"?', ['A female ruler of a kingdom.'], 'queen'),
      ex('Is "teacher" masculine, feminine or common?', ['A teacher can be a man or a woman.'], 'common gender'),
    ],
    practice: [
      mcq('fem', 'Think of the female (or male) partner word.', [
        ['Feminine of "king"?', 'queen', ['princess', 'kingess', 'lady'], 'She rules the kingdom.', 'king → queen.'],
        ['Feminine of "lion"?', 'lioness', ['lionet', 'tigress', 'lady lion'], 'Add -ess.', 'lion → lioness.'],
        ['Feminine of "uncle"?', 'aunt', ['niece', 'mother', 'sister'], 'Your father\'s sister.', 'uncle → aunt.'],
        ['Masculine of "girl"?', 'boy', ['man', 'son', 'brother'], 'A young male.', 'girl → boy.'],
        ['Feminine of "prince"?', 'princess', ['queen', 'princes', 'lady'], 'Add -ess (and double s).', 'prince → princess.'],
        ['Masculine of "mother"?', 'father', ['brother', 'uncle', 'son'], 'The male parent.', 'mother → father.'],
      ]),
      matchT('pairs', 'Match each masculine noun to its feminine', [
        ['boy', 'girl'], ['man', 'woman'], ['brother', 'sister'], ['son', 'daughter'], ['actor', 'actress'], ['grandfather', 'grandmother'], ['husband', 'wife'],
      ], ['Think of family pairs.', 'actor → actress (add -ess).']),
      tapT('common', 'Tap the nouns of COMMON gender (can be male or female).', [['child', true], ['teacher', true], ['friend', true], ['doctor', true], ['student', true], ['king', false], ['queen', false], ['uncle', false], ['aunt', false]],
        ['Can it be a man OR a woman?', 'King is only male; queen is only female.'], 'Common gender nouns can be male or female.'),
    ],
  },
], THEME_NOTE);

export const units: USpec[] = [u0, u1, u2, u3, u4, u5, u6, u7, u8];
