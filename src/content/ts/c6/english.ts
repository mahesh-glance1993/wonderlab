// Telangana SCERT Class 6 — English Reader (8 units). Original teaching ABOUT each lesson — summaries, themes,
// characters and vocabulary written in our own words for an 11-year-old. The textbook's passages and poems are
// copyrighted and are never reproduced here. All grammar examples and exercises are original sentences.
// Grammar topics follow the syllabus where it names them; where the syllabus is silent (see notes on each unit)
// we chose a standard Class 6 topic.
import {
  tp, ex, p, h, tip, def, keys, remember, photo, stepsB, choose, matching, ordering, tapAll, text,
  type USpec, type TSpec,
} from '../../lib/kit';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(6, 'english', n);

// ---------- compact practice factories (same shapes as the Class 8 file) ----------
/** [question, correct answer, wrong answers, second hint, why the answer is right, optional traps [wrong label, explanation]] */
type MQ = [string, string, string[], string, string, ([string, string][])?];
const mcq = (key: string, hint0: string, bank: MQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, a, w, h1, why, traps] = r.pick(bank);
  return {
    type: 'mcq', prompt: q, ...choose(r, a, w), hints: [hint0, h1],
    mistakes: [...(traps ?? []).map(([when, e]) => ({ when, explain: e })), { when: 'wrong', explain: `Not quite. ${why}` }],
    solution: [`Correct answer: ${a}`, why],
  };
}, d);

/** [prompt, accepted answers (first is the model answer), second hint, why, optional traps [wrong answer, explanation]] */
type TQ = [string, string[], string, string, ([string, string][])?];
const typed = (key: string, hint0: string, bank: TQ[], d: 1 | 2 | 3 = 2): TSpec => tp(key, (r) => {
  const [q, acc, h1, why, traps] = r.pick(bank);
  return {
    type: 'typed', prompt: q, answer: text(...acc), hints: [hint0, h1],
    mistakes: [...(traps ?? []).map(([when, e]) => ({ when, explain: e })), { when: 'wrong', explain: `Check again. ${why}` }],
    solution: [`Answer: ${acc[0]}${acc.length > 1 ? ` (also accepted: ${acc.slice(1).join(', ')})` : ''}`, why],
  };
}, d);

const matchT = (key: string, what: string, pool: [string, string][], hints: string[], n = 4, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pairs = r.shuffle(pool).slice(0, n);
  const m = matching(r, pairs);
  return {
    type: 'match', prompt: `Match each ${what}: ${pairs.map((x) => x[0]).join(' · ')}`, left: m.left, right: m.right, answer: m.answer,
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair is mixed up. Take the left items one at a time and test each one against every option on the right.' }],
    solution: pairs.map(([a, b]) => `${a} → ${b}`),
  };
}, d);

/** [prompt, items in the correct order, why] */
type OQ = [string, string[], string];
const orderT = (key: string, hints: string[], bank: OQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [prompt, items, why] = r.pick(bank);
  return {
    type: 'order', prompt, ...ordering(r, items), hints,
    mistakes: [{ when: 'wrong', explain: `The order is not right yet. ${why}` }],
    solution: [items.join(' → '), why],
  };
}, d);

const tapT = (key: string, prompt: string, pool: [string, boolean][], hints: string[], why: string, n = 5, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pick = r.shuffle(pool).slice(0, n);
  const yes = pool.find((x) => x[1])!, no = pool.find((x) => !x[1])!;
  if (!pick.some((x) => x[1])) pick[0] = yes;
  if (!pick.some((x) => !x[1])) pick[n - 1] = no;
  return {
    type: 'tap', prompt, ...tapAll(r, pick.map(([label, ok]) => ({ label, ok }))), hints,
    mistakes: [{ when: 'wrong', explain: `Check each option on its own. ${why}` }],
    solution: [`Correct: ${pick.filter((x) => x[1]).map((x) => x[0]).join(' | ')}`, why],
  };
}, d);

// =====================================================================================
// Unit 1 — Peace and Harmony
// =====================================================================================
const u1: USpec = {
  id: 'ts6.en.u1', subject: 'english', title: 'Unit 1 — Peace and Harmony', source: src(1),
  note: 'Readings A and B are taught at theme level (our own summary); teachers should add story and poem details from the textbook. Reading C is for pleasure reading and is not assessed. Writing focus (a peace message and slogan) chosen by WonderLab.',
  objectives: [
    {
      id: 'ts6.en.peace.read', title: 'Reading: Peace and Harmony and I Want Peace', prereqs: [],
      intro: [
        h('What this unit is about'),
        photo('🕊️', 'A white dove is a symbol of peace all over the world.'),
        p('Unit 1 is about living together without fighting. A. Peace and Harmony is a reading about why peace matters — at home, at school and between nations — and how sharing, listening and forgiving keep it. B. I Want Peace is a poem in which the speaker wishes for a world without war and quarrels. C. Grand Contest in the Forest is a fun story for pleasure reading.'),
        def('Peace', 'A calm time with no fighting, war or quarrels.'),
        def('Harmony', 'Living or working together in a friendly way, like singers whose voices fit together.'),
        h('How to read for the main idea'),
        stepsB(
          'Read the title. Ask: what will this be about?',
          'Read once quickly for the big picture.',
          'Read again slowly. Underline words that repeat — peace, together, share, love.',
          'Say the main idea in one sentence of your own.',
        ),
        keys(
          'Theme: we are happier when we live in peace and harmony.',
          'Fighting hurts everyone; sharing and forgiving help everyone.',
          'A poem\'s speaker is the "I" who talks in the poem.',
        ),
        remember('The main idea is the big message of the whole text, not one small detail.'),
        tip('Talk about it: think of a time you made up with a friend after a quarrel. How did you feel afterwards?'),
      ],
      examples: [
        ex('What is the main idea of the unit Peace and Harmony?', ['Look at the title and repeated words: peace, together, share.', 'Both the reading and the poem praise living without fighting.'], 'People are happier when they live together in peace and harmony.'),
        ex('Who is the "I" in the poem I Want Peace?', ['The poem says "I want peace".', 'The person speaking in a poem is called the speaker.'], 'The speaker of the poem — a person who wishes for a world without war.'),
      ],
      practice: [
        mcq('theme', 'Think about the big message of the whole unit.', [
          ['What is the main message of Unit 1?', 'Living together peacefully makes everyone happier', ['Winning every fight is important', 'Forests are dangerous places', 'Money brings harmony'], 'Look at the unit title.', 'The unit is about peace and harmony — living without fighting.'],
          ['"Harmony" means…', 'living together in a friendly way', ['a loud noise', 'a kind of war', 'being alone'], 'Think of voices that fit together in a song.', 'Harmony is friendly agreement between people.'],
          ['In the poem I Want Peace, what does the speaker wish for?', 'A world without war and quarrels', ['A new bicycle', 'More homework', 'A bigger army'], 'The title tells you.', 'The speaker wants peace — no war, no fighting.'],
          ['Which action helps to keep peace?', 'Forgiving a friend after a quarrel', ['Shouting at a classmate', 'Breaking a friend\'s pencil', 'Refusing to share'], 'Which one ends a fight?', 'Forgiving ends quarrels and brings people together.'],
          ['Which bird is a symbol of peace?', 'The white dove', ['The crow', 'The vulture', 'The owl'], 'It is often shown with an olive branch.', 'The white dove stands for peace around the world.'],
          ['The person who says "I" in a poem is called the…', 'speaker', ['reader', 'printer', 'listener'], 'It is the voice of the poem.', 'The voice of a poem is called the speaker.'],
        ]),
        tapT('peace-acts', 'Tap all the actions that help peace and harmony.', [
          ['Sharing your lunch with a friend', true], ['Listening when others speak', true], ['Saying sorry when you are wrong', true], ['Helping a new student', true],
          ['Teasing a younger child', false], ['Pushing in a queue', false], ['Spreading rumours', false], ['Grabbing a toy from someone', false],
        ], ['Ask: does this make people closer or angrier?', 'Peaceful actions are kind and fair.'], 'Kind, fair actions build harmony; hurtful ones start quarrels.'),
        matchT('words', 'word with its meaning', [
          ['peace', 'a calm time without fighting'], ['harmony', 'living together in a friendly way'], ['quarrel', 'an angry argument'], ['forgive', 'stop being angry with someone'], ['share', 'give part of what you have to others'], ['war', 'fighting between countries'],
        ], ['Say each word in a sentence.', 'Two words are about fighting; the rest are about getting along.']),
      ],
    },
    {
      id: 'ts6.en.peace.vocab', title: 'Word power: opposites and peace words', prereqs: [],
      intro: [
        h('Words that are opposites'),
        p('An antonym is a word with the opposite meaning. Learning words in pairs helps you remember both: war – peace, love – hate, friend – enemy.'),
        def('Antonym', 'A word with the opposite meaning. happy ↔ sad.'),
        def('Synonym', 'A word with the same or nearly the same meaning. happy = glad.'),
        h('Making opposites with prefixes'),
        stepsB(
          'Find the root word: kind, fair, friendly, agree.',
          'Add un-, dis- or in- in front: unkind, unfair, unfriendly, disagree.',
          'Read the new word in a sentence to check it sounds right.',
        ),
        keys('un- : unkind, unhappy, unfair', 'dis- : disagree, dislike, disobey', 'Some opposites are new words: war – peace, love – hate.'),
        remember('A prefix goes at the START of a word and changes its meaning.'),
      ],
      examples: [
        ex('Give the opposite of "friendly" with a prefix.', ['Root word: friendly.', 'un- means "not".'], 'unfriendly'),
        ex('Give a synonym of "calm".', ['Find a word that means the same: quiet, still.'], 'peaceful (also: quiet)'),
      ],
      practice: [
        typed('prefix', 'Add un- or dis- to the word.', [
          ['Write the opposite of "kind".', ['unkind'], 'un- means not.', 'un + kind = unkind.'],
          ['Write the opposite of "agree".', ['disagree'], 'Use dis-.', 'dis + agree = disagree.', [['unagree', 'The prefix for agree is dis-: disagree.']]],
          ['Write the opposite of "happy".', ['unhappy', 'sad'], 'un- means not.', 'un + happy = unhappy.'],
          ['Write the opposite of "obey".', ['disobey'], 'Use dis-.', 'dis + obey = disobey.'],
          ['Write the opposite of "fair".', ['unfair'], 'un- means not.', 'un + fair = unfair.'],
          ['Write the opposite of "like" (verb).', ['dislike'], 'Use dis-.', 'dis + like = dislike.'],
        ]),
        mcq('antonym', 'Find the word with the opposite meaning.', [
          ['The opposite of "peace" is…', 'war', ['calm', 'quiet', 'rest'], 'Peace means no fighting.', 'War is fighting — the opposite of peace.'],
          ['The opposite of "friend" is…', 'enemy', ['buddy', 'pal', 'mate'], 'Someone who is against you.', 'An enemy is the opposite of a friend.'],
          ['The opposite of "love" is…', 'hate', ['care', 'like', 'adore'], 'A very strong bad feeling.', 'Hate is the opposite of love.'],
          ['A synonym of "glad" is…', 'happy', ['sad', 'angry', 'tired'], 'Synonym = same meaning.', 'Glad and happy mean the same.', [['sad', 'Sad is the opposite (antonym), not a synonym.']]],
          ['The opposite of "together" is…', 'apart', ['with', 'along', 'joined'], 'Not together.', 'Apart means separated.'],
          ['A synonym of "quarrel" is…', 'argument', ['agreement', 'friendship', 'song'], 'An angry talk.', 'A quarrel is an angry argument.'],
        ]),
      ],
    },
    {
      id: 'ts6.en.compare.adj', title: 'Grammar: degrees of comparison', prereqs: [],
      intro: [
        h('Comparing with adjectives'),
        p('Adjectives can compare things. There are three degrees: positive (one thing), comparative (two things) and superlative (three or more things).'),
        keys(
          'Positive: Ravi is tall.',
          'Comparative (two): Ravi is taller than Meena.',
          'Superlative (three or more): Ravi is the tallest boy in the class.',
        ),
        h('Simple rules'),
        stepsB(
          'Short words: add -er / -est. tall → taller → tallest.',
          'Words ending in -e: add -r / -st. wise → wiser → wisest.',
          'Short word ending consonant–vowel–consonant: double the last letter. big → bigger → biggest.',
          'Words ending in consonant + y: change y to i. happy → happier → happiest.',
          'Long words (most with 2–3 syllables): use more / most. beautiful → more beautiful → most beautiful.',
          'Irregular: good → better → best; bad → worse → worst; many → more → most; little → less → least.',
        ),
        remember('Use "than" with the comparative and "the" with the superlative. Never say "more taller" or "most tallest".'),
      ],
      examples: [
        ex('Fill in: "An elephant is ___ (heavy) than a horse."', ['Two things are compared → comparative.', 'heavy ends in consonant + y → change y to i, add -er.'], 'heavier'),
        ex('Fill in: "This is the ___ (good) mango in the basket."', ['Many mangoes → superlative.', 'good is irregular: good, better, best.'], 'best'),
      ],
      practice: [
        typed('form', 'Two things → -er / more. Three or more → -est / most.', [
          ['Fill in: "A tortoise is ___ (slow) than a rabbit."', ['slower'], 'Two animals are compared.', 'slow + er = slower.'],
          ['Fill in: "Kavya is the ___ (tall) girl in our class."', ['tallest'], '"the" and "in our class" → superlative.', 'tall + est = tallest.', [['taller', '"the … in our class" compares many, so use tallest.']]],
          ['Fill in: "Today is ___ (hot) than yesterday."', ['hotter'], 'Double the t.', 'hot → hotter (double t).', [['hoter', 'hot ends consonant–vowel–consonant, so double the t: hotter.']]],
          ['Fill in: "This is the ___ (happy) day of my life."', ['happiest'], 'Change y to i.', 'happy → happiest.'],
          ['Fill in: "My handwriting is ___ (bad) than my brother\'s."', ['worse'], 'bad is irregular.', 'bad → worse → worst.', [['badder', 'bad is irregular: worse.']]],
          ['Fill in: "The rose is ___ (beautiful) than the marigold."', ['more beautiful'], 'Long word → more.', 'beautiful is long, so "more beautiful".', [['beautifuller', 'Long words use more: more beautiful.']]],
          ['Fill in: "Imran is the ___ (good) singer in the school."', ['best'], 'good is irregular.', 'good → better → best.'],
        ]),
        mcq('choose', 'Count how many things are compared.', [
          ['Choose the correct sentence.', 'Hyderabad is bigger than my town.', ['Hyderabad is more bigger than my town.', 'Hyderabad is biggest than my town.', 'Hyderabad is big than my town.'], 'Two places → comparative + than.', '"bigger than" is correct; never "more bigger".'],
          ['Choose the correct sentence.', 'Mount Everest is the highest mountain in the world.', ['Mount Everest is the higher mountain in the world.', 'Mount Everest is the most highest mountain in the world.', 'Mount Everest is high than all mountains.'], 'All the mountains → superlative.', '"the highest" — not "most highest".'],
          ['Which is the comparative of "wise"?', 'wiser', ['wisest', 'more wise', 'wiseer'], 'Ends in -e: add -r.', 'wise + r = wiser.'],
          ['Which is the superlative of "many"?', 'most', ['more', 'manyest', 'mostest'], 'many is irregular.', 'many → more → most.'],
          ['"This is ___ book in the library." (interesting)', 'the most interesting', ['the interestingest', 'more interesting', 'most interestinger'], 'Long word, many books.', 'Long adjective + superlative = the most interesting.'],
          ['"My glass has ___ milk than yours." (little)', 'less', ['littler', 'least', 'more little'], 'little is irregular.', 'little → less → least. Two glasses are compared, so: less.', [['least', 'Only two glasses are compared, so use the comparative: less.']]],
        ], 2),
        matchT('table', 'positive degree with its superlative', [
          ['good', 'best'], ['bad', 'worst'], ['big', 'biggest'], ['happy', 'happiest'], ['little', 'least'], ['wise', 'wisest'], ['strong', 'strongest'],
        ], ['Watch for irregular words.', 'good and bad change completely.']),
      ],
    },
    {
      id: 'ts6.en.peace.write', title: 'Writing: a peace message and slogan', prereqs: [],
      intro: [
        h('A short message for everyone'),
        p('A message for a notice board or a school assembly is short and clear. A slogan is a catchy line of a few words that people remember easily.'),
        h('Steps to write a peace message'),
        stepsB(
          'Begin with a heading: "A Message of Peace".',
          'Say who it is for: "Dear friends,".',
          'Write 3–4 short sentences: why peace matters and what we can do.',
          'End with a slogan and your name.',
        ),
        h('Model message (written for WonderLab)'),
        p('A Message of Peace. Dear friends, Let us make our school a place of peace. When we listen to each other, quarrels end quickly. Let us share, help and forgive. "Hands that help are hands of peace!" — Class 6 Peace Club.'),
        keys('Short sentences.', 'Use "Let us…" to invite everyone.', 'A slogan is short, catchy and positive.'),
        remember('A slogan is not a long sentence. Five to eight words is enough.'),
      ],
      examples: [
        ex('Make a slogan about peace using the words "hearts" and "hands".', ['Keep it short.', 'Use both words in a pattern.'], 'Open hearts, helping hands — peace in every land!'),
        ex('Which sentence invites everyone to act? (a) Peace is good. (b) Let us stop quarrelling and start sharing.', ['An invitation uses "Let us".'], '(b) Let us stop quarrelling and start sharing.'),
      ],
      practice: [
        mcq('slogan', 'A slogan is short, catchy and positive.', [
          ['Which is the best slogan for peace?', 'Say no to fights, say yes to friends!', ['Peace is a word with five letters.', 'Yesterday I went to the market with my uncle.', 'Fighting is sometimes fun to watch.'], 'Which one is short and catchy?', 'It is short, rhymes and gives a positive message.'],
          ['Which is the best slogan for harmony?', 'Different colours, one rainbow!', ['Rainbows appear after rain.', 'I like the colour blue the most.', 'Colours are made of light waves.'], 'Which one carries a message about living together?', 'It compares different people to colours of one rainbow.'],
          ['Which line is best to begin a message to classmates?', 'Dear friends,', ['Yours faithfully,', 'The End', 'Once upon a time,'], 'How do you greet readers?', 'A message begins by greeting the readers.'],
          ['Which sentence invites everyone to act?', 'Let us forgive and forget.', ['Peace was there long ago.', 'My friend is tall.', 'The dove is white.'], 'Look for "Let us".', '"Let us…" invites all readers to act.'],
          ['Where does the writer\'s name go in a message?', 'At the end', ['In the heading', 'In the first line', 'In the middle'], 'Think of a letter.', 'The name of the writer or group comes at the end.'],
        ]),
        orderT('message', ['Heading first, name last.', 'Greeting comes before the main sentences.'], [
          ['Put the parts of a peace message in order.', ['A Message of Peace', 'Dear friends,', 'Quarrels hurt everyone in the school.', 'Let us listen, share and forgive.', 'Peace begins with me! — Class 6'], 'Heading → greeting → problem → action → slogan and name.'],
          ['Put the parts of a peace message in order.', ['Peace Week Message', 'Dear students,', 'This week we celebrate peace.', 'Let us help one new friend every day.', 'Kind hands, happy lands! — School Leader'], 'Heading → greeting → reason → action → slogan and name.'],
          ['Arrange the steps to write a message.', ['Write a heading', 'Greet the readers', 'Write 3–4 short sentences', 'End with a slogan and your name'], 'This is the order a reader meets them.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Unit 2 — Telangana, The Pride of the People
// =====================================================================================
const u2: USpec = {
  id: 'ts6.en.u2', subject: 'english', title: 'Unit 2 — Telangana, The Pride of the People', source: src(2),
  note: 'Reading A is taught at theme level; teachers should add its specific details from the textbook. The poem In the Bazaars of Hyderabad (Sarojini Naidu) is described, not quoted. The syllabus lists opinion adjectives only, so the grammar topic (simple past tense) and the writing focus (describing a festival) were chosen by WonderLab.',
  objectives: [
    {
      id: 'ts6.en.telangana.read', title: 'Reading: Telangana and In the Bazaars of Hyderabad', prereqs: [],
      intro: [
        h('Our state, our pride'),
        photo('🌼', 'Bathukamma — towers of colourful flowers arranged by women and girls during the festival.'),
        p('Unit 2 celebrates Telangana. A. Telangana, The Pride of the People tells about our state\'s culture — its festivals, crafts, food and famous places. B. In the Bazaars of Hyderabad is a poem by Sarojini Naidu about the busy old markets of Hyderabad. C. Bammera Pothana is about the great poet who wrote the Bhagavatam in Telugu.'),
        h('Telangana in brief (facts for you)'),
        keys(
          'Telangana became India\'s 29th state on 2 June 2014. Hyderabad is its capital.',
          'Festivals: Bathukamma (flowers, songs and dancing in a circle) and Bonalu (offerings to the goddess).',
          'Crafts: Pochampally ikat sarees, Karimnagar silver filigree, Nirmal paintings and toys, Cheriyal scroll paintings.',
          'Famous places: Charminar, Golconda Fort, Ramappa Temple (a UNESCO World Heritage Site).',
        ),
        h('The poem in brief'),
        p('In Sarojini Naidu\'s poem, the poet walks through the bazaar and asks the sellers what they are selling — merchants, vendors, goldsmiths, fruit-sellers, musicians and flower-girls. Each answers with a rich list of colourful goods. The question-and-answer pattern makes the market come alive with colours, sounds and smells.'),
        def('Bazaar', 'A market with many small shops and stalls.'),
        def('Vendor', 'A person who sells things, often from a stall or cart.'),
        remember('Pothana was a farmer-poet who lived simply and refused to offer his poetry to kings for money.'),
      ],
      examples: [
        ex('How is the poem In the Bazaars of Hyderabad written?', ['The poet asks the sellers questions.', 'The sellers answer with lists of their goods.'], 'As questions and answers between the poet and the sellers.'),
        ex('Name one handicraft of Telangana and where it is from.', ['Recall the crafts list.', 'Pochampally is famous for a weaving style called ikat.'], 'Pochampally ikat sarees (also: Nirmal toys, Karimnagar filigree, Cheriyal scrolls).'),
      ],
      practice: [
        mcq('facts', 'Use the facts in the lesson.', [
          ['When did Telangana become a state?', '2 June 2014', ['15 August 1947', '26 January 1950', '1 November 1956'], 'It is celebrated as Telangana Formation Day.', 'Telangana was formed on 2 June 2014.'],
          ['Which festival uses towers of colourful flowers?', 'Bathukamma', ['Bonalu', 'Diwali', 'Holi'], 'Women and girls dance around it.', 'Bathukamma is the flower festival of Telangana.'],
          ['Who wrote the poem In the Bazaars of Hyderabad?', 'Sarojini Naidu', ['Rabindranath Tagore', 'Bammera Pothana', 'R.L. Stevenson'], 'She was called the Nightingale of India.', 'Sarojini Naidu, who grew up in Hyderabad, wrote the poem.'],
          ['What is a bazaar?', 'A market with many shops and stalls', ['A royal palace', 'A kind of flower', 'A school'], 'Think of where you buy bangles and fruit.', 'A bazaar is a busy market.'],
          ['Pochampally is famous for…', 'ikat sarees', ['silver filigree', 'wooden toys', 'scroll paintings'], 'It is a weaving village.', 'Pochampally weavers make ikat sarees.', [['silver filigree', 'Silver filigree comes from Karimnagar.']]],
          ['Bammera Pothana is famous for…', 'writing the Bhagavatam in Telugu', ['building Charminar', 'starting Bathukamma', 'weaving sarees'], 'He was a poet.', 'Pothana wrote the Andhra Maha Bhagavatam in Telugu.'],
        ]),
        matchT('crafts', 'Telangana place with what it is known for', [
          ['Pochampally', 'ikat sarees'], ['Karimnagar', 'silver filigree work'], ['Nirmal', 'painted wooden toys'], ['Cheriyal', 'scroll paintings'], ['Warangal (Palampet)', 'Ramappa Temple'], ['Hyderabad', 'Charminar'],
        ], ['Remember the crafts list.', 'Two places are known for buildings, not crafts.']),
      ],
    },
    {
      id: 'ts6.en.opinion.adj', title: 'Word power: opinion adjectives', prereqs: [],
      intro: [
        h('Facts and opinions'),
        p('Some adjectives tell facts that everyone can check: a red saree, a round box, a wooden toy. Other adjectives tell what someone thinks or feels: a beautiful saree, a lovely box, a wonderful toy. These are opinion adjectives.'),
        def('Fact adjective', 'Describes something everyone can see or measure: size, colour, shape, material. "a tall tower".'),
        def('Opinion adjective', 'Shows what a person thinks: beautiful, lovely, delicious, wonderful, boring, ugly.'),
        h('How to tell them apart'),
        stepsB(
          'Find the adjective.',
          'Ask: can everyone check it and agree? (colour, size, number, material) → fact.',
          'Ask: could two people disagree about it? → opinion.',
        ),
        keys('Opinion: delicious biryani, lovely bangles, a wonderful fair.', 'Fact: hot biryani, glass bangles, a big fair.', 'Opinion adjectives come BEFORE fact adjectives: a lovely red saree.'),
        remember('In a description, use a few opinion adjectives to show your feelings, but support them with facts.'),
      ],
      examples: [
        ex('In "a delicious hot biryani", which is the opinion adjective?', ['hot can be checked (temperature) → fact.', 'delicious depends on taste → opinion.'], 'delicious'),
        ex('Is "wooden" a fact or an opinion adjective?', ['It tells the material.', 'Everyone can check it.'], 'A fact adjective.'),
      ],
      practice: [
        mcq('spot', 'Could two people disagree about it? Then it is an opinion.', [
          ['Find the opinion adjective: "a beautiful silk saree"', 'beautiful', ['silk', 'saree', 'a'], 'Silk is a material.', 'Beautiful is what someone thinks.'],
          ['Find the opinion adjective: "a wonderful old fort"', 'wonderful', ['old', 'fort', 'a'], 'Age can be checked.', 'Wonderful is a feeling about the fort.'],
          ['Find the opinion adjective: "two tasty green mangoes"', 'tasty', ['two', 'green', 'mangoes'], 'Number and colour are facts.', 'Tasty is a personal opinion.'],
          ['Find the opinion adjective: "a boring long film"', 'boring', ['long', 'film', 'a'], 'Length can be measured.', 'Boring is what one viewer feels.'],
          ['Find the opinion adjective: "a lovely small painting"', 'lovely', ['small', 'painting', 'a'], 'Size is a fact.', 'Lovely is an opinion.'],
          ['Which of these is a FACT adjective?', 'round', ['amazing', 'ugly', 'pleasant'], 'Shape can be checked.', 'Round is a shape — everyone can see it.'],
        ]),
        tapT('opinions', 'Tap all the OPINION adjectives.', [
          ['beautiful', true], ['delicious', true], ['wonderful', true], ['lovely', true], ['boring', true], ['ugly', true],
          ['wooden', false], ['red', false], ['square', false], ['ten', false], ['silver', false], ['tall', false],
        ], ['Colour, number, shape and material are facts.', 'Feelings and judgements are opinions.'], 'Opinion adjectives show what someone thinks; fact adjectives can be checked.', 6),
      ],
    },
    {
      id: 'ts6.en.past.simple', title: 'Grammar: the simple past tense', prereqs: [],
      intro: [
        h('Talking about finished actions'),
        p('We use the simple past tense for actions that started and finished in the past: "We visited Golconda Fort last Sunday."'),
        h('Simple rules'),
        stepsB(
          'Regular verbs: add -ed. walk → walked, visit → visited.',
          'Verb ends in -e: add -d. dance → danced.',
          'Consonant + y: change y to i, add -ed. carry → carried.',
          'Short verb consonant–vowel–consonant: double the last letter. stop → stopped.',
          'Irregular verbs change: go → went, see → saw, buy → bought, eat → ate.',
          'Questions and negatives use did + base verb: Did you go? I did not go.',
        ),
        keys('Time words: yesterday, last week, ago, in 2014.', 'After "did" always use the base form: did see, not did saw.'),
        remember('"I didn\'t went" is wrong. Say "I didn\'t go".'),
      ],
      examples: [
        ex('Change to the past: "We celebrate Bathukamma." (last year)', ['celebrate ends in -e → add -d.'], 'We celebrated Bathukamma last year.'),
        ex('Make a question: "She bought bangles."', ['Use Did + subject + base verb.', 'bought → buy.'], 'Did she buy bangles?'),
      ],
      practice: [
        typed('past', 'Is the verb regular or irregular?', [
          ['Past tense of "go":', ['went'], 'Irregular verb.', 'go → went.', [['goed', 'go is irregular: went.']]],
          ['Past tense of "carry":', ['carried'], 'Consonant + y.', 'carry → carried.', [['carryed', 'Change y to i: carried.']]],
          ['Past tense of "stop":', ['stopped'], 'Double the p.', 'stop → stopped.', [['stoped', 'Double the last consonant: stopped.']]],
          ['Past tense of "buy":', ['bought'], 'Irregular verb.', 'buy → bought.', [['buyed', 'buy is irregular: bought.']]],
          ['Past tense of "dance":', ['danced'], 'Ends in -e.', 'dance + d = danced.'],
          ['Past tense of "see":', ['saw'], 'Irregular verb.', 'see → saw.', [['seed', 'see is irregular: saw.']]],
          ['Past tense of "visit":', ['visited'], 'Regular verb.', 'visit + ed = visited.'],
        ]),
        mcq('correct', 'After "did", use the base form.', [
          ['Choose the correct sentence.', 'We went to Charminar yesterday.', ['We go to Charminar yesterday.', 'We goed to Charminar yesterday.', 'We gone to Charminar yesterday.'], '"yesterday" → past.', 'went is the past of go.'],
          ['Choose the correct sentence.', 'Did you eat the sweets?', ['Did you ate the sweets?', 'Did you eaten the sweets?', 'Do you ate the sweets?'], 'did + base verb.', 'After did, use eat.', [['Did you ate the sweets?', 'After "did", the verb goes back to its base form: eat.']]],
          ['Choose the correct sentence.', 'Teja did not see the parade.', ['Teja did not saw the parade.', 'Teja not saw the parade.', 'Teja did not seen the parade.'], 'did not + base verb.', 'did not see is correct.'],
          ['"Grandmother ___ a lovely story last night." (tell)', 'told', ['telled', 'tells', 'tell'], 'Irregular verb.', 'tell → told.'],
          ['"The girls ___ the flowers into a tall Bathukamma." (arrange)', 'arranged', ['arrange', 'arrangeed', 'arranging'], 'Ends in -e.', 'arrange + d = arranged.'],
        ], 2),
      ],
    },
    {
      id: 'ts6.en.festival.write', title: 'Writing: describing a festival', prereqs: [],
      intro: [
        h('Paint a picture with words'),
        p('A description helps the reader see, hear, smell and taste what you experienced. When you describe a festival, use your senses and some opinion adjectives.'),
        h('Steps to write a description'),
        stepsB(
          'Begin: name the festival and when it is celebrated.',
          'Describe what you SEE (colours, decorations, clothes).',
          'Describe what you HEAR, SMELL and TASTE (songs, flowers, sweets).',
          'Tell what people DO.',
          'End with how you feel about it.',
        ),
        h('Model description (written for WonderLab)'),
        p('Bathukamma is a colourful flower festival celebrated in Telangana in autumn. Women and girls arrange bright marigolds and other flowers into tall, beautiful towers. In the evening, they place the towers in the middle and dance around them in circles, clapping and singing. The air smells of fresh flowers and sweet dishes. I love Bathukamma because the whole street comes together.'),
        keys('Use sense words: bright, loud, sweet, fragrant.', 'Use the simple present for festivals that happen every year.', 'End with your feeling.'),
        remember('Do not just list things. Join ideas with and, then, because.'),
      ],
      examples: [
        ex('Write a sentence about a sound at a festival.', ['Think of drums, songs or crackers.', 'Use a sense word.'], 'Drums beat loudly as the Bonalu procession moves down the street.'),
        ex('Write a good closing sentence for a description of Bonalu.', ['Share your feeling.', 'Give a reason.'], 'I enjoy Bonalu because it fills our town with music and colour.'),
      ],
      practice: [
        mcq('senses', 'Which sense does the sentence use?', [
          ['"The sweets smelled of ghee and cardamom." This sentence uses the sense of…', 'smell', ['sight', 'hearing', 'touch'], 'Look at the verb.', '"smelled" tells us about smell.'],
          ['"Drums boomed and bells rang." This sentence uses the sense of…', 'hearing', ['taste', 'smell', 'sight'], 'Boomed and rang are sounds.', 'Sounds are heard.'],
          ['"Bright yellow marigolds covered the tower." This uses the sense of…', 'sight', ['hearing', 'taste', 'smell'], 'Colours are seen.', 'Bright yellow is something we see.'],
          ['"The payasam was sweet and creamy." This uses the sense of…', 'taste', ['hearing', 'sight', 'smell'], 'Payasam is eaten.', 'Sweet and creamy describe taste.'],
          ['Which sentence is the best ending for a festival description?', 'I wait for this festival all year because it brings everyone together.', ['Bathukamma has flowers.', 'Then we went home.', 'There are many festivals.'], 'An ending shares a feeling.', 'It gives a feeling and a reason.'],
        ]),
        orderT('describe', ['Introduce the festival first.', 'Your feeling comes last.'], [
          ['Put the sentences of the description in order.', ['Bonalu is a festival of Telangana held in the month of Ashada.', 'Women carry decorated pots on their heads.', 'Drums beat and dancers move through the streets.', 'Families share a special meal.', 'I love Bonalu because it is full of joy and music.'], 'Introduction → sight → sound → activity → feeling.'],
          ['Put the sentences of the description in order.', ['Sankranti is our harvest festival in January.', 'Colourful rangoli patterns decorate every doorstep.', 'The sky is full of kites.', 'We eat sweets made of sesame and jaggery.', 'It is my favourite festival because of the kites.'], 'Introduction → sight → activity → taste → feeling.'],
          ['Arrange the steps to write a description.', ['Name the festival and when it happens', 'Describe what you see', 'Describe sounds, smells and tastes', 'Tell what people do', 'End with your feeling'], 'Start with the topic; end with your feeling.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Unit 3 — What Can a Dollar and Eleven Cents Do?
// =====================================================================================
const u3: USpec = {
  id: 'ts6.en.u3', subject: 'english', title: 'Unit 3 — What Can a Dollar and Eleven Cents Do?', source: src(3),
  note: 'Reading A is retold from the widely shared story of a girl who tries to buy a "miracle"; teachers should check names and details against the textbook. The poem A Nation\'s Strength (R.W. Emerson) is described, not quoted. Writing focus (a diary entry) chosen by WonderLab.',
  objectives: [
    {
      id: 'ts6.en.dollar.read', title: 'Reading: a dollar and eleven cents, A Nation\'s Strength', prereqs: [],
      intro: [
        h('Small hands, big hearts'),
        photo('🪙', 'A handful of coins — a little money, but given with great love.'),
        p('Unit 3 is about the strength that comes from love, courage and goodness. A. What Can a Dollar and Eleven Cents Do? is a story about a little girl and her sick brother. B. A Nation\'s Strength is a poem by Ralph Waldo Emerson. C. Wilma Rudolph is about an athlete who beat illness to win Olympic gold.'),
        h('Reading A in brief (our summary)'),
        p('A young girl hears her parents say that only a miracle can save her little brother, who is very ill, and that they have no money for the operation. She empties her piggy bank — just one dollar and eleven cents — and goes to the chemist\'s shop to "buy a miracle". The chemist is puzzled, but a visitor in the shop, who is a surgeon, kindly asks her about her brother. He goes home with her, operates on the boy and refuses any payment beyond her coins. The boy is saved.'),
        h('Reading B in brief'),
        p('Emerson asks what makes a nation truly great. His answer: not gold, buildings or weapons, but brave and honest people who stand up for truth and work hard for their country.'),
        h('Reading C in brief'),
        p('Wilma Rudolph (USA) had polio as a child and was told she might never walk properly. With exercise and determination she became a runner and won three gold medals at the 1960 Rome Olympics.'),
        keys('Theme: love, courage and goodness are stronger than money.', 'The girl\'s faith and the surgeon\'s kindness work the "miracle".'),
      ],
      examples: [
        ex('Why did the girl go to the chemist\'s shop?', ['She heard that only a miracle could save her brother.', 'She thought a miracle was something you could buy.'], 'To buy a "miracle" for her sick brother with her savings.'),
        ex('According to Emerson, what makes a nation strong?', ['Not gold or weapons.', 'Brave, honest, hard-working people.'], 'Its brave and honest people who stand for truth.'),
      ],
      practice: [
        mcq('story', 'Go back to the summaries.', [
          ['How much money did the girl have?', 'One dollar and eleven cents', ['Eleven dollars', 'One hundred dollars', 'Nothing at all'], 'Look at the title.', 'The title tells us: a dollar and eleven cents.'],
          ['What did the girl want to buy?', 'A miracle', ['A toy', 'A sweet', 'A book'], 'She had heard her parents talk.', 'Her parents said only a miracle could save her brother.'],
          ['Who helped the boy?', 'A surgeon who was visiting the shop', ['The girl\'s teacher', 'A police officer', 'A shopkeeper from another town'], 'He knew how to operate.', 'The surgeon heard the girl and operated on her brother.'],
          ['What does A Nation\'s Strength say makes a country great?', 'Brave and honest people', ['Gold and jewels', 'Tall buildings', 'Many weapons'], 'Emerson rejects riches.', 'Its people, not its wealth, are a nation\'s strength.'],
          ['What illness did Wilma Rudolph have as a child?', 'Polio', ['Malaria', 'A broken arm', 'A cold'], 'It affected her legs.', 'She had polio but overcame it.'],
          ['Which word best describes the girl in the story?', 'loving', ['greedy', 'lazy', 'rude'], 'She gave all her savings.', 'She gave everything she had out of love for her brother.'],
        ]),
        orderT('plot', ['The girl hears the bad news first.', 'The boy is saved at the end.'], [
          ['Put the events of the story in order.', ['The girl hears that only a miracle can save her brother', 'She empties her piggy bank', 'She asks the chemist for a miracle', 'A surgeon in the shop offers to help', 'The boy is operated on and saved'], 'News → savings → shop → help → happy ending.'],
          ['Put Wilma Rudolph\'s life in order.', ['She has polio as a child', 'She exercises hard to walk again', 'She starts running races', 'She wins three Olympic golds in 1960'], 'Illness → effort → sport → success.'],
        ]),
      ],
    },
    {
      id: 'ts6.en.dollar.vocab', title: 'Word power: money and feeling words', prereqs: [],
      intro: [
        h('Words from the unit'),
        def('Miracle', 'A wonderful event that seems impossible.'),
        def('Savings', 'Money kept aside over time.'),
        def('Chemist / pharmacist', 'A person who sells medicines.'),
        def('Surgeon', 'A doctor who does operations.'),
        def('Determined', 'Not giving up even when it is hard.'),
        h('Learning new words'),
        stepsB(
          'Read the sentence around the new word.',
          'Look for clues: an example, an opposite, or a reason.',
          'Guess the meaning, then check with a dictionary.',
          'Use the word in your own sentence.',
        ),
        keys('Money words: coin, note, dollar, cent, rupee, paisa, piggy bank.', '100 cents = 1 dollar (USA); 100 paise = 1 rupee (India).'),
        remember('Context clues are the words around a new word that help you guess its meaning.'),
      ],
      examples: [
        ex('Guess the meaning: "Wilma was determined; she practised every day even when her legs hurt."', ['Clue: practised every day even when it hurt.'], 'determined = not giving up'),
        ex('Who would you go to for an operation: a chemist or a surgeon?', ['A chemist sells medicine.', 'A surgeon operates.'], 'A surgeon'),
      ],
      practice: [
        matchT('meanings', 'word with its meaning', [
          ['miracle', 'a wonderful event that seems impossible'], ['savings', 'money kept aside over time'], ['chemist', 'a person who sells medicines'], ['surgeon', 'a doctor who does operations'], ['determined', 'not giving up'], ['grateful', 'thankful'], ['piggy bank', 'a small box for saving coins'],
        ], ['Say each word in a sentence.', 'Two words are about people\'s jobs.']),
        mcq('context', 'Use the clue words in the sentence.', [
          ['"Kiran was grateful and thanked his teacher many times." Grateful means…', 'thankful', ['angry', 'sleepy', 'afraid'], 'He thanked her.', 'Grateful means thankful.'],
          ['"The boy\'s recovery was a miracle; no one expected him to live." Miracle means…', 'a wonderful, unexpected event', ['a medicine', 'a small coin', 'a sad ending'], 'No one expected it.', 'A miracle is something wonderful that seemed impossible.'],
          ['How many cents make one dollar?', '100', ['10', '11', '1000'], 'Like paise in a rupee.', '100 cents = 1 dollar.'],
          ['How many paise make one rupee?', '100', ['10', '50', '1000'], 'Same as cents in a dollar.', '100 paise = 1 rupee.'],
          ['"Meena put her savings in the bank." Savings means…', 'money kept aside', ['old clothes', 'school books', 'her lunch'], 'She put it in a bank.', 'Savings is money saved up.'],
        ]),
      ],
    },
    {
      id: 'ts6.en.punct.qe', title: 'Grammar: question marks and exclamation marks', prereqs: [],
      intro: [
        h('Ending a sentence'),
        p('Every sentence ends with a punctuation mark. The mark tells the reader how to read the sentence.'),
        keys(
          'Full stop (.) — a statement or a polite request: I like mangoes.',
          'Question mark (?) — a direct question: Do you like mangoes?',
          'Exclamation mark (!) — strong feeling: surprise, joy, fear, anger: What a sweet mango!',
        ),
        h('Simple rules'),
        stepsB(
          'Does the sentence ask something and need an answer? → ?',
          'Does it begin with Who, What, Where, When, Why, How, or a helping verb (Is, Do, Can, Did)? It is probably a question → ?',
          'Does it show a strong feeling, or start with "What a…" / "How…" as a cry of surprise? → !',
          'Short cries (interjections) like Oh! Hurray! Ouch! take !',
          'Otherwise, use a full stop.',
        ),
        remember('"I wonder where she is." is NOT a direct question — it ends with a full stop. Use only ONE ! in good writing.'),
      ],
      examples: [
        ex('Punctuate: "Can a dollar buy a miracle"', ['It begins with "Can" and asks something.'], 'Can a dollar buy a miracle?'),
        ex('Punctuate: "What a brave girl she is"', ['"What a…" shows surprise and admiration, not a question.'], 'What a brave girl she is!'),
      ],
      practice: [
        typed('mark', 'Type only the mark: ? or ! or .', [
          ['Which mark ends this sentence? "Where is my piggy bank"', ['?'], 'It begins with Where.', 'A direct question needs ?'],
          ['Which mark ends this sentence? "Hurray, we won the match"', ['!'], 'Hurray shows joy.', 'Strong joy → !'],
          ['Which mark ends this sentence? "My brother is in hospital"', ['.'], 'It just tells something.', 'A statement ends with a full stop.'],
          ['Which mark ends this sentence? "How kind the doctor is"', ['!'], 'It is a cry of admiration, not a question.', '"How kind…!" is an exclamation.', [['?', 'It does not ask for an answer; it shows strong feeling.']]],
          ['Which mark ends this sentence? "Did you see the race"', ['?'], 'It begins with Did.', 'A helping verb at the start → question.'],
          ['Which mark ends this sentence? "Ouch, that hurts"', ['!'], 'Ouch shows pain.', 'Strong feeling → !'],
          ['Which mark ends this sentence? "I wonder why she is crying"', ['.'], 'It is a statement about wondering.', 'An indirect question ends with a full stop.', [['?', 'It does not ask the reader directly — it is a statement.']]],
        ]),
        mcq('correct', 'Ask: question, strong feeling or statement?', [
          ['Which sentence is punctuated correctly?', 'What is your name?', ['What is your name!', 'What is your name.', 'What is your name,'], 'It asks for information.', 'A direct question ends with ?'],
          ['Which sentence is punctuated correctly?', 'What a lovely gift!', ['What a lovely gift?', 'What a lovely gift.', 'What a lovely gift,'], 'It shows delight.', '"What a…" exclamation ends with !'],
          ['Which sentence is punctuated correctly?', 'Please close the door.', ['Please close the door?', 'Please close the door!!', 'Please close the door,'], 'A polite request.', 'A polite request takes a full stop.'],
          ['Which sentence is punctuated correctly?', 'Is the shop open?', ['Is the shop open.', 'Is the shop open!', 'Is the shop open,'], 'It begins with Is.', 'A question ends with ?'],
          ['Which sentence is punctuated correctly?', 'She asked me where I lived.', ['She asked me where I lived?', 'She asked me, where I lived!', 'She asked me where did I live?'], 'It reports a question.', 'A reported question is a statement and ends with a full stop.'],
        ], 2),
      ],
    },
    {
      id: 'ts6.en.diary.write', title: 'Writing: a diary entry', prereqs: [],
      intro: [
        h('Writing to yourself'),
        p('A diary is a private notebook where you write about your day — what happened and how you felt. A diary entry is personal and honest.'),
        h('Format of a diary entry'),
        stepsB(
          'Write the date (and day, time if you like) at the top.',
          'Begin with "Dear Diary," (optional).',
          'Tell what happened, in the past tense, in order.',
          'Share your feelings and thoughts.',
          'End with your name or initial.',
        ),
        h('Model entry (written for WonderLab)'),
        p('Monday, 12 August. Dear Diary, Today was a special day. Our class collected money for a classmate whose mother is ill. I gave the forty rupees I had saved for a new pen. At first I felt a little sad, but when I saw my friend smile, I felt very happy. I learnt that a small gift given with love can do a lot. — Priya'),
        keys('Use "I" — it is about you.', 'Past tense for events; present tense for feelings now.', 'Informal, honest language.'),
        remember('A diary entry needs a date. Without it, it is just a story.'),
      ],
      examples: [
        ex('What is the first thing you write in a diary entry?', ['A diary keeps a record of days.'], 'The date (and day).'),
        ex('Write a feeling sentence for a diary about helping someone.', ['Use "I felt…" and give a reason.'], 'I felt proud because my small help made my friend smile.'),
      ],
      practice: [
        orderT('format', ['The date always comes first.', 'Your name comes last.'], [
          ['Put the parts of a diary entry in order.', ['Friday, 5 July', 'Dear Diary,', 'Today I helped my grandmother in the garden.', 'I felt happy and tired.', '— Arjun'], 'Date → greeting → event → feeling → name.'],
          ['Put the parts of a diary entry in order.', ['Sunday, 3 March', 'Dear Diary,', 'I ran in the school race this morning.', 'I came second, but I am proud I did not give up.', '— Diya'], 'Date → greeting → event → feeling → name.'],
          ['Put the parts of a diary entry in order.', ['Tuesday, 10 June', 'Dear Diary,', 'My little brother came home from hospital today.', 'I thanked the doctors with a card I made.', 'I am so relieved! — Sita'], 'Date → greeting → event → action → feeling and name.'],
        ]),
        mcq('features', 'Think about what makes a diary special.', [
          ['A diary entry is written mainly in the…', 'first person ("I")', ['third person ("he/she")', 'second person ("you")', 'future tense only'], 'It is about you.', 'You write about your own day using "I".'],
          ['Which tense is used to tell what happened today?', 'simple past', ['simple future', 'past perfect', 'present continuous only'], 'The events are finished.', 'Finished events → simple past.'],
          ['Which is a good diary sentence?', 'I felt nervous before my speech, but it went well.', ['Students must wear uniform on Monday.', 'Dear Sir, I request you to grant me leave.', 'For sale: an old bicycle.'], 'A diary shares personal feelings.', 'It tells a personal experience and feeling.'],
          ['What must a diary entry have at the top?', 'The date', ['A slogan', 'The address of the school', 'A price'], 'A diary records days.', 'The date shows when it was written.'],
          ['The language of a diary is…', 'personal and informal', ['formal like an office letter', 'full of headlines', 'written only in questions'], 'You write to yourself.', 'You write freely, as you speak to yourself.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Unit 4 — An Adventure
// =====================================================================================
const u4: USpec = {
  id: 'ts6.en.u4', subject: 'english', title: 'Unit 4 — An Adventure', source: src(4),
  note: 'Reading A (An Adventure) is taught at theme level; teachers should add plot details from the textbook. The Naughty Boy (John Keats) is described, not quoted. Grammar (verb to noun word forms) follows the syllabus; adventure vocabulary and the writing focus (a short story) were chosen by WonderLab because the syllabus lists this unit only partly.',
  objectives: [
    {
      id: 'ts6.en.adventure.read', title: 'Reading: An Adventure, The Naughty Boy and Tanaji', prereqs: [],
      intro: [
        h('Into the unknown'),
        photo('🧭', 'A compass — the friend of every explorer.'),
        p('Unit 4 is about adventure — doing something exciting, new and a little risky. A. An Adventure tells of young people who go exploring and face an unexpected danger, which they overcome with courage and quick thinking. B. The Naughty Boy is a fun poem by John Keats about a restless boy who runs away to see the world, only to find that the faraway places are much like home. C. Tanaji Malusare tells of a brave Maratha general.'),
        h('The poem in brief'),
        p('Keats describes a boy who cannot stay at home. He packs a few things and runs off to Scotland, where he finds that the ground is just as hard, a yard is just as long, and a penny is still a penny. He stands in his shoes and wonders. The humour lies in this surprise: travelling far does not change everyday things.'),
        h('Tanaji in brief'),
        p('Tanaji Malusare was a commander and close friend of Shivaji. In 1670 he led a night attack to capture the Kondhana fort near Pune by climbing a steep cliff. He won the fort but lost his life in the battle. In his honour the fort was renamed Sinhagad — the Lion\'s Fort.'),
        keys('An adventure has excitement, danger and courage.', 'Stories of adventure usually have a problem (danger) and a solution.', 'The poem gently laughs at the idea that faraway places are always different.'),
      ],
      examples: [
        ex('What surprise does the naughty boy find when he travels far away?', ['He expects things to be different.', 'He finds the ground, a yard and a penny are the same.'], 'That faraway places are much the same as home.'),
        ex('Why was Kondhana fort renamed Sinhagad?', ['Tanaji won the fort but died.', 'Sinha = lion.'], 'To honour the lion-hearted Tanaji, who died capturing it.'),
      ],
      practice: [
        mcq('understand', 'Use the summaries.', [
          ['Who wrote The Naughty Boy?', 'John Keats', ['Sarojini Naidu', 'R.L. Stevenson', 'Ruskin Bond'], 'An English poet of the 1800s.', 'John Keats wrote the poem.'],
          ['Where does the naughty boy run off to?', 'Scotland', ['India', 'America', 'The moon'], 'A country north of England.', 'He runs away to Scotland.'],
          ['What does the boy discover?', 'Faraway places are much like home', ['Scotland has no ground', 'Pennies are bigger in Scotland', 'He can fly'], 'Things were the same.', 'He finds that everyday things are the same everywhere.'],
          ['Tanaji Malusare was a commander of…', 'Shivaji', ['Akbar', 'Ashoka', 'Tipu Sultan'], 'A Maratha king.', 'Tanaji served Shivaji.'],
          ['What does "Sinhagad" mean?', 'Lion\'s Fort', ['Tiger\'s Cave', 'King\'s Palace', 'River Fort'], 'Sinha means lion.', 'Sinhagad means the fort of the lion.'],
          ['Which word best describes an adventure?', 'exciting', ['boring', 'ordinary', 'sleepy'], 'Adventures are thrilling.', 'An adventure is exciting and a little risky.'],
        ]),
        orderT('story', ['A story moves from start to danger to solution.', 'The ending comes last.'], [
          ['Put the parts of an adventure story in order.', ['The friends set out to explore', 'They meet an unexpected danger', 'They think quickly and act bravely', 'They return home safely, wiser than before'], 'Start → problem → solution → ending.'],
          ['Put Tanaji\'s story in order.', ['Shivaji wants Kondhana fort back', 'Tanaji leads his men at night', 'They climb the steep cliff', 'They win the fort, but Tanaji dies', 'The fort is renamed Sinhagad'], 'Goal → plan → climb → battle → honour.'],
          ['Put the naughty boy\'s journey in order.', ['The boy cannot stay at home', 'He packs and runs away', 'He reaches Scotland', 'He finds things are just the same', 'He stands and wonders'], 'Restless → leaves → arrives → discovers → wonders.'],
        ]),
      ],
    },
    {
      id: 'ts6.en.adventure.vocab', title: 'Word power: adventure words', prereqs: [],
      intro: [
        h('Words for exciting stories'),
        def('Explore', 'To travel through a place to find out about it. Noun: exploration; person: explorer.'),
        def('Brave / courageous', 'Not afraid to face danger.'),
        def('Cliff', 'A high, steep rock face, often by the sea.'),
        def('Thrilling', 'Very exciting.'),
        def('Rescue', 'To save someone from danger.'),
        h('Using strong words'),
        stepsB(
          'Find a plain word in your sentence: "big", "went", "scared".',
          'Replace it with a stronger one: huge, rushed, terrified.',
          'Read the sentence aloud — does it sound more exciting?',
        ),
        keys('said → shouted, whispered', 'went → rushed, crept, climbed', 'scared → terrified, nervous'),
        remember('Strong verbs make an adventure story come alive.'),
      ],
      examples: [
        ex('Make it stronger: "The boy went up the hill."', ['"went" is plain.', 'Choose a verb that shows effort.'], 'The boy climbed up the hill.'),
        ex('What do you call a person who explores?', ['explore + -er'], 'an explorer'),
      ],
      practice: [
        matchT('meaning', 'word with its meaning', [
          ['explore', 'travel to find out about a place'], ['brave', 'not afraid of danger'], ['cliff', 'a high, steep rock'], ['thrilling', 'very exciting'], ['rescue', 'save from danger'], ['journey', 'a trip from one place to another'], ['map', 'a drawing that shows places and roads'],
        ], ['Picture each word.', 'Two are things you can see; the rest are actions or qualities.']),
        mcq('strong', 'Pick the word that gives the clearest picture.', [
          ['Choose the strongest word: "The cat ___ quietly towards the bird."', 'crept', ['went', 'got', 'did'], 'Quietly and slowly.', '"crept" means moved slowly and silently.'],
          ['Choose the strongest word: "The children were ___ when they heard the roar."', 'terrified', ['okay', 'fine', 'nice'], 'A roar is frightening.', 'Terrified means very scared.'],
          ['Choose the strongest word: "We ___ to the station to catch the train."', 'rushed', ['were', 'sat', 'stayed'], 'They were in a hurry.', 'Rushed shows speed.'],
          ['Choose the opposite of "brave".', 'cowardly', ['courageous', 'bold', 'fearless'], 'Not brave.', 'A cowardly person runs from danger.'],
          ['"She ___ for help as the boat began to sink." Choose the best word.', 'screamed', ['said', 'told', 'talked'], 'She was in danger.', 'Screamed shows fear and loudness.'],
        ]),
      ],
    },
    {
      id: 'ts6.en.wordform.noun', title: 'Grammar: word forms — verb to noun', prereqs: [],
      intro: [
        h('One idea, different forms'),
        p('Many verbs have a noun form. "Tanaji decided to attack" → "Tanaji\'s decision was to attack." Changing the word form lets us write a sentence in a new way.'),
        h('Common noun endings'),
        stepsB(
          '-tion / -sion: decide → decision, invite → invitation, explore → exploration.',
          '-ment: enjoy → enjoyment, move → movement, agree → agreement.',
          '-ance / -ence: appear → appearance, differ → difference.',
          '-ure: fail → failure, please → pleasure.',
          'Some change more: choose → choice, die → death, succeed → success, laugh → laughter, see → sight.',
        ),
        keys('After a/an/the/his/her, use a noun: "his arrival".', 'Check the spelling: decide → decision (not decidetion).'),
        remember('A noun names a thing or idea; a verb tells an action.'),
      ],
      examples: [
        ex('Rewrite with a noun: "The boys arrived late."', ['arrive → arrival.', 'Use "The boys\' arrival…"'], 'The boys\' arrival was late.'),
        ex('What is the noun form of "succeed"?', ['It changes more than just an ending.'], 'success'),
      ],
      practice: [
        typed('noun', 'Think of -tion, -ment, -ance or a special form.', [
          ['Noun form of "decide":', ['decision'], 'Ends in -sion.', 'decide → decision.', [['decidetion', 'The correct spelling is decision.']]],
          ['Noun form of "enjoy":', ['enjoyment'], 'Ends in -ment.', 'enjoy + ment = enjoyment.'],
          ['Noun form of "explore":', ['exploration'], 'Ends in -ation.', 'explore → exploration.'],
          ['Noun form of "arrive":', ['arrival'], 'Ends in -al.', 'arrive → arrival.'],
          ['Noun form of "choose":', ['choice'], 'A special form.', 'choose → choice.'],
          ['Noun form of "appear":', ['appearance'], 'Ends in -ance.', 'appear + ance = appearance.'],
          ['Noun form of "fail":', ['failure'], 'Ends in -ure.', 'fail + ure = failure.'],
          ['Noun form of "move":', ['movement'], 'Ends in -ment.', 'move + ment = movement.'],
        ]),
        mcq('rewrite', 'After a, the, his or her, you need a noun.', [
          ['"The team succeeded." → "The team\'s ___ made everyone happy."', 'success', ['succeed', 'succeeded', 'successful'], 'A noun after "team\'s".', 'succeed → success (noun).'],
          ['"They invited us." → "We got their ___."', 'invitation', ['invite', 'invited', 'inviting'], 'A noun after "their".', 'invite → invitation.'],
          ['"Tanaji died bravely." → "Tanaji\'s ___ was brave."', 'death', ['die', 'died', 'dead'], 'A noun after "Tanaji\'s".', 'die → death.', [['dead', '"dead" is an adjective; the noun is death.']]],
          ['"The children laughed loudly." → "The children\'s ___ was loud."', 'laughter', ['laugh', 'laughed', 'laughing'], 'A noun ending in -ter.', 'laugh → laughter.'],
          ['"We agreed." → "We came to an ___."', 'agreement', ['agree', 'agreed', 'agreeable'], 'A noun after "an".', 'agree + ment = agreement.'],
        ], 2),
      ],
    },
    {
      id: 'ts6.en.story.write', title: 'Writing: a short adventure story', prereqs: [],
      intro: [
        h('Beginning, middle and end'),
        p('A good story has a beginning (who, where, when), a middle (a problem or danger) and an end (how the problem is solved).'),
        h('Steps to write a story'),
        stepsB(
          'Plan: choose characters, a place and a problem.',
          'Beginning: introduce the characters and the setting.',
          'Middle: something goes wrong — build excitement with strong verbs.',
          'End: the characters solve the problem.',
          'Give the story a title and, if you like, a lesson (moral).',
          'Read it again and correct spelling and past tenses.',
        ),
        h('Model story (written for WonderLab)'),
        p('The Lost Path. One Saturday, Ravi and Sana went trekking in the hills near their village. They were so busy watching monkeys that they lost the path. The sun began to set and the forest grew dark. Sana remembered that streams flow downhill towards villages, so they followed the sound of water. At last they saw the lights of their village. They hugged their worried parents and promised to carry a map next time.'),
        keys('Write in the past tense.', 'Use linkers: one day, suddenly, then, at last.', 'Show feelings: nervous, relieved.'),
        remember('Every story needs a problem — without one, nothing exciting happens.'),
      ],
      examples: [
        ex('Which linker shows that something unexpected happened?', ['It signals surprise.'], 'Suddenly'),
        ex('Write a beginning sentence for a story set at a lake.', ['Tell who, where and when.'], 'Last summer, Kiran and his cousin Diya went fishing at Hussain Sagar lake.'),
      ],
      practice: [
        orderT('plot', ['Who and where come first.', 'The happy ending comes last.'], [
          ['Put the story in order.', ['One evening, Teja went to the field to fly his kite.', 'Suddenly the kite got stuck in a tall tree.', 'He asked his father to bring a long bamboo pole.', 'Together they freed the kite.', 'Teja learnt to fly kites away from trees.'], 'Beginning → problem → idea → solution → lesson.'],
          ['Put the story in order.', ['Meena and Arjun went to the beach at Kakinada.', 'A big wave pulled Arjun\'s slipper into the sea.', 'Meena saw the slipper float back and grabbed it.', 'They laughed and moved away from the water.', 'Both agreed the sea must be respected.'], 'Beginning → problem → solution → ending → lesson.'],
          ['Arrange the steps to write a story.', ['Plan characters, place and problem', 'Write the beginning', 'Write the problem in the middle', 'Write how it is solved', 'Check spelling and tenses'], 'Plan → beginning → middle → end → check.'],
        ]),
        mcq('parts', 'Think: beginning, middle or end?', [
          ['"Once upon a time, a little goat lived near a forest." This is the…', 'beginning', ['middle', 'end', 'moral'], 'It introduces the character.', 'It tells who and where — the beginning.'],
          ['"Suddenly, a hungry wolf jumped out of the bushes." This is the…', 'middle (the problem)', ['beginning', 'end', 'title'], 'A danger appears.', 'The danger is the problem in the middle.'],
          ['"At last, the goat reached home safely." This is the…', 'end', ['beginning', 'middle', 'title'], 'The problem is over.', 'The story is finished — it is the end.'],
          ['Which tense is usually used to tell a story?', 'simple past', ['simple future', 'present perfect', 'future continuous'], 'Stories tell what happened.', 'Stories are told in the past tense.'],
          ['Which is a good title for a story about a trip that went wrong?', 'The Day We Got Lost', ['Story', 'My Notebook Has Pages', 'Rules of the School'], 'A title hints at the story.', 'It is short and tells what the story is about.'],
        ]),
      ],
    },
  ],
};


// =====================================================================================
// Unit 5 — Plant a Tree
// =====================================================================================
const u5: USpec = {
  id: 'ts6.en.u5', subject: 'english', title: 'Unit 5 — Plant a Tree', source: src(5),
  note: 'Readings A and B and the pleasure reading C are taught at theme level; teachers should add specific details from the textbook. Grammar (if-clauses) follows the syllabus; vocabulary and the writing focus (a poster) were chosen by WonderLab.',
  objectives: [
    {
      id: 'ts6.en.tree.read', title: 'Reading: Plant a Tree and If a Tree Could Talk', prereqs: [],
      intro: [
        h('Trees are our friends'),
        photo('🌳', 'One big tree gives shade, fruit, a home for birds and clean air.'),
        p('Unit 5 is about trees and the environment. A. Plant a Tree explains why trees matter and encourages everyone to plant and protect them. B. If a Tree Could Talk is a poem in which a tree speaks — it tells us what it gives and asks us not to harm it. C. Children, Speak Up! encourages children to raise their voices for a cleaner, greener world.'),
        h('What trees give us'),
        keys(
          'Oxygen to breathe and cleaner air.',
          'Shade, fruit, wood, medicines and paper.',
          'Homes for birds, insects and animals.',
          'Roots that hold soil and help rain soak into the ground.',
        ),
        def('Personification', 'Giving human qualities to a non-human thing. When a tree "speaks" in a poem, the poet is using personification.'),
        def('Deforestation', 'Cutting down large numbers of trees.'),
        tip('Telangana Ku Haritha Haram (started in 2015) is the state\'s big tree-planting programme. Has your school planted saplings?'),
        remember('In the poem the tree cannot really talk. The poet imagines its voice so that we feel for it.'),
      ],
      examples: [
        ex('In If a Tree Could Talk, what device does the poet use?', ['A tree is given a human voice.', 'Giving human qualities to things is personification.'], 'Personification'),
        ex('Give two ways trees help the soil.', ['Think of roots and rain.'], 'Roots hold the soil so it is not washed away, and they help rain water soak into the ground.'),
      ],
      practice: [
        mcq('ideas', 'Think about what the unit teaches.', [
          ['What is the main message of Unit 5?', 'We should plant and protect trees', ['Trees should be cut for firewood', 'Cities do not need trees', 'Only birds need trees'], 'Look at the title.', 'The unit urges us to plant and care for trees.'],
          ['Which gas do trees give out that we breathe?', 'Oxygen', ['Smoke', 'Carbon monoxide', 'Steam'], 'We need it to live.', 'Trees release oxygen.'],
          ['A tree that "speaks" in a poem is an example of…', 'personification', ['a rhyme', 'a question', 'a slogan'], 'Human qualities given to a thing.', 'Giving a tree a voice is personification.'],
          ['"Deforestation" means…', 'cutting down many trees', ['planting many trees', 'watering plants', 'a forest festival'], 'de- means remove.', 'Deforestation is removing forests.'],
          ['What is Telangana Ku Haritha Haram?', 'A tree-planting programme', ['A dance', 'A temple', 'A river'], 'Haritha means green.', 'It is Telangana\'s programme to plant crores of saplings.'],
          ['What does Children, Speak Up! encourage children to do?', 'Speak up for a greener world', ['Stay silent', 'Cut trees', 'Play all day'], 'Look at the title.', 'It asks children to raise their voices for the environment.'],
        ]),
        tapT('gifts', 'Tap all the things trees give us.', [
          ['oxygen', true], ['shade', true], ['fruit', true], ['homes for birds', true], ['wood', true], ['medicines', true],
          ['plastic', false], ['petrol', false], ['noise', false], ['smoke', false],
        ], ['Think of a neem or mango tree.', 'Plastic and petrol are not from living trees.'], 'Trees give oxygen, shade, fruit, wood, medicines and homes for birds.'),
      ],
    },
    {
      id: 'ts6.en.tree.vocab', title: 'Word power: environment words', prereqs: [],
      intro: [
        h('Words for a green world'),
        def('Sapling', 'A young tree.'),
        def('Environment', 'The air, water, land, plants and animals around us.'),
        def('Pollution', 'Making air, water or land dirty and harmful.'),
        def('Conserve', 'To protect something and use it carefully. Noun: conservation.'),
        def('Recycle', 'To use waste again to make something new.'),
        h('Compound words'),
        stepsB(
          'Some words are made of two smaller words.',
          'rain + water → rainwater; sun + light → sunlight; tree + house → treehouse.',
          'Split the word to understand its meaning.',
        ),
        keys('The 3 Rs: Reduce, Reuse, Recycle.', 'A sapling grows into a tree.'),
        remember('Pollute is the verb; pollution is the noun; polluted is the adjective.'),
      ],
      examples: [
        ex('What is a "sapling"?', ['It is related to planting.', 'It is young.'], 'A young tree'),
        ex('Make one word: rain + coat', ['Join the two words.'], 'raincoat'),
      ],
      practice: [
        matchT('meanings', 'word with its meaning', [
          ['sapling', 'a young tree'], ['environment', 'everything around us in nature'], ['pollution', 'making air, water or land dirty'], ['conserve', 'protect and use carefully'], ['recycle', 'use waste to make something new'], ['shade', 'a cool place out of the sun'], ['forest', 'a large area full of trees'],
        ], ['Say each word in a sentence.', 'Two words are about waste and dirt.']),
        typed('compound', 'Join the two words into one.', [
          ['Make one word: sun + light', ['sunlight'], 'Write them together.', 'sun + light = sunlight.'],
          ['Make one word: rain + water', ['rainwater'], 'Write them together.', 'rain + water = rainwater.'],
          ['Make one word: tree + top', ['treetop'], 'Write them together.', 'tree + top = treetop.'],
          ['Make one word: fire + wood', ['firewood'], 'Write them together.', 'fire + wood = firewood.'],
          ['Make one word: green + house', ['greenhouse'], 'Write them together.', 'green + house = greenhouse.'],
          ['Make one word: water + fall', ['waterfall'], 'Write them together.', 'water + fall = waterfall.'],
        ], 1),
      ],
    },
    {
      id: 'ts6.en.if.clause', title: 'Grammar: if-clauses (conditional sentences)', prereqs: [],
      intro: [
        h('If … then …'),
        p('A conditional sentence has two parts: the if-clause (the condition) and the main clause (the result). "If we plant trees, the air will be cleaner."'),
        keys(
          'Type 0 — always true: If you heat ice, it melts. (present + present)',
          'Type 1 — likely future: If it rains, we will stay inside. (present + will + verb)',
          'Imagining (Type 2): If a tree could talk, it would thank us. (past + would + verb)',
        ),
        h('Simple rules for Type 1'),
        stepsB(
          'Put the simple present in the if-clause: If you water the plant…',
          'Put will + base verb in the main clause: …it will grow.',
          'Never put "will" in the if-clause: "If it will rain" is wrong.',
          'If the if-clause comes first, put a comma after it. If it comes second, no comma: The plant will grow if you water it.',
        ),
        remember('Present in the if-part, will in the result part.'),
      ],
      examples: [
        ex('Complete: "If you cut all the trees, the birds ___ (lose) their homes."', ['Type 1: if + present, will + verb.'], 'will lose'),
        ex('Correct the mistake: "If it will rain, we will plant saplings."', ['No "will" in the if-clause.', 'Use the simple present: rains.'], 'If it rains, we will plant saplings.'),
      ],
      practice: [
        typed('complete', 'Present in the if-part; will + verb in the result.', [
          ['Complete: "If you water the sapling, it ___ (grow)."', ['will grow'], 'Result part → will.', 'will + grow.', [['grows', 'For a future result, use will grow.']]],
          ['Complete: "If we ___ (plant) more trees, the air will be cleaner."', ['plant'], 'if-part → simple present.', 'If we plant…', [['will plant', 'Never use will in the if-clause.']]],
          ['Complete: "If it ___ (rain) tomorrow, we will stay indoors."', ['rains'], 'He/she/it → add -s.', 'If it rains…', [['will rain', 'No will in the if-clause: rains.']]],
          ['Complete: "If you heat water to 100 °C, it ___ (boil)."', ['boils'], 'A fact that is always true.', 'Type 0: present + present → boils.'],
          ['Complete: "If Kavya studies hard, she ___ (pass) the test."', ['will pass'], 'Future result.', 'will + pass.'],
          ['Complete: "If you ___ (throw) plastic in the lake, the fish will suffer."', ['throw'], 'if-part → simple present.', 'If you throw…'],
        ]),
        mcq('choose', 'Look for "will" in the wrong place.', [
          ['Choose the correct sentence.', 'If we save water, we will have enough in summer.', ['If we will save water, we have enough in summer.', 'If we saved water, we will have enough in summer.', 'If we save water, we having enough in summer.'], 'Present + will.', 'if + present, will + verb.'],
          ['Choose the correct sentence.', 'If you mix blue and yellow, you get green.', ['If you will mix blue and yellow, you get green.', 'If you mix blue and yellow, you got green.', 'If you mixing blue and yellow, you get green.'], 'A fact that is always true.', 'Type 0: present + present.'],
          ['Choose the correct sentence.', 'The plant will die if you forget to water it.', ['The plant will die if you will forget to water it.', 'The plant dies if you will forget water it.', 'The plant will dying if you forget to water it.'], 'No will after if.', 'Result first, then if + present.'],
          ['Choose the correct sentence.', 'If a tree could talk, it would ask for water.', ['If a tree can talk, it would ask for water.', 'If a tree could talk, it will asked for water.', 'If a tree could talk, it asking for water.'], 'Imagining: could … would.', 'For something imaginary, use could/past + would.'],
          ['Where does the comma go? "If the sun shines we will go to the park"', 'after "shines"', ['after "If"', 'after "we"', 'after "park"'], 'Comma after the if-clause.', 'When the if-clause comes first, put a comma after it.'],
        ], 2),
        matchT('halves', 'if-clause with its result', [
          ['If you heat ice,', 'it melts.'], ['If it rains,', 'the roads will be wet.'], ['If we cut the forests,', 'animals will lose their homes.'], ['If you plant a seed,', 'it will grow into a plant.'], ['If you don\'t hurry,', 'you will miss the bus.'], ['If you drop a glass,', 'it may break.'],
        ], ['Which result makes sense?', 'Read each pair aloud.']),
      ],
    },
    {
      id: 'ts6.en.poster.write', title: 'Writing: a poster to save trees', prereqs: [],
      intro: [
        h('A message people see at a glance'),
        p('A poster is put up on a wall to tell or persuade many people. It uses few words, big headings, a picture and a slogan.'),
        h('Steps to make a poster'),
        stepsB(
          'Write a bold heading: SAVE TREES, SAVE LIFE.',
          'Add a picture or drawing.',
          'Give 3–4 short points: why and how.',
          'Add details if it is an event: date, time, place.',
          'Add a slogan and who issued it (club / school name).',
        ),
        h('Model poster text (written for WonderLab)'),
        p('PLANT A TREE TODAY! • Trees give us oxygen and shade. • One tree is home to many birds. • Join our tree-planting drive: Saturday, 5 July, 8 a.m., school ground. "A tree a day keeps pollution away!" — Eco Club, ZPHS Narsapur.'),
        keys('Big heading, few words.', 'Use commands: Plant, Save, Join.', 'Who, when and where for events.'),
        remember('A poster is not an essay. Short points, not long paragraphs.'),
      ],
      examples: [
        ex('Write a heading for a poster on saving water.', ['Short, bold, a command.'], 'SAVE WATER, SAVE LIFE!'),
        ex('What details must a poster for a tree-planting event include?', ['People need to know when and where.'], 'The date, time and place (and who is organising it).'),
      ],
      practice: [
        mcq('features', 'Think about what makes a good poster.', [
          ['Which is the best heading for a poster?', 'GO GREEN — PLANT A TREE!', ['Trees are plants that have trunks, branches and leaves and grow tall.', 'Once upon a time there was a tree.', 'Dear Sir'], 'Short and bold.', 'A heading should be short, bold and catchy.'],
          ['A poster should have…', 'few words and a picture', ['long paragraphs', 'no heading', 'only numbers'], 'People read it quickly.', 'Posters use few words and visuals.'],
          ['Which is a good slogan for a poster?', 'Trees today, life tomorrow!', ['The tree is near my house.', 'Trees are green and brown in colour.', 'I like trees and also my cat.'], 'Catchy and short.', 'A slogan is short and memorable.'],
          ['Which detail is needed in a poster for an event?', 'Date, time and place', ['Your favourite colour', 'Your height', 'Your best friend\'s name'], 'People need to attend.', 'An event poster must say when and where.'],
          ['Which verb form suits poster points?', 'Commands like "Plant", "Save", "Join"', ['Past tense like "planted"', 'Questions only', 'Long passive sentences'], 'Posters tell people what to do.', 'Commands are direct and short.'],
        ]),
        orderT('poster', ['The heading is on top.', 'The organiser\'s name is at the bottom.'], [
          ['Arrange the parts of a poster from top to bottom.', ['Heading: SAVE TREES!', 'Picture of a tree', 'Points: why trees matter', 'Event: date, time, place', 'Slogan and organiser'], 'Heading → picture → points → details → slogan and name.'],
          ['Arrange the parts of a poster from top to bottom.', ['Heading: STOP PLASTIC!', 'Picture of a cloth bag', 'Points: carry cloth bags, say no to plastic', 'Slogan: Bag it green!', 'Issued by: Eco Club'], 'Heading → picture → points → slogan → organiser.'],
          ['Arrange the steps to make a poster.', ['Write a bold heading', 'Add a picture', 'Write 3–4 short points', 'Add event details', 'Add a slogan and your club\'s name'], 'This is the order on the page.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Unit 6 — Rip Van Winkle
// =====================================================================================
const u6: USpec = {
  id: 'ts6.en.u6', subject: 'english', title: 'Unit 6 — Rip Van Winkle', source: src(6),
  note: 'Summaries of Rip Van Winkle (Washington Irving), My Shadow (R.L. Stevenson) and Gulliver\'s Travels (Jonathan Swift) are our own retellings of the original works; the textbook version may be adapted. Grammar (active and passive voice) follows the syllabus, limited here to the simple present and simple past. Vocabulary and writing focus (an informal letter) chosen by WonderLab.',
  objectives: [
    {
      id: 'ts6.en.rip.read', title: 'Reading: Rip Van Winkle and My Shadow', prereqs: [],
      intro: [
        h('Twenty years in a wink'),
        photo('💤', 'A sleep so long that the world changed while Rip snored.'),
        p('A. Rip Van Winkle is a famous story by the American writer Washington Irving. B. My Shadow is a playful poem by Robert Louis Stevenson. C. Gulliver\'s Travels (by Jonathan Swift) is for pleasure reading.'),
        h('Rip Van Winkle in brief (our summary)'),
        p('Rip is a kind, lazy man who lives in a village at the foot of the Catskill Mountains in America. Children and neighbours love him, but he avoids work at home, and his wife scolds him all the time. One day he escapes to the mountains with his dog, Wolf, and his gun. There he meets some strange, old-fashioned men playing ninepins. He drinks from their flask and falls into a deep sleep. When he wakes, his beard is long and white, his gun is rusty and Wolf is gone. In the village nobody knows him; even the king\'s picture at the inn has changed to that of George Washington. He has slept for twenty years! At last his grown-up daughter recognises him and takes him home.'),
        h('My Shadow in brief'),
        p('A child talks about his shadow, which goes everywhere with him and jumps into bed before him. The shadow grows tall very fast and sometimes becomes tiny — not like real children, who grow slowly. One morning, very early, the child goes out and finds that his "lazy" shadow has stayed at home in bed. (Of course, there is no shadow before sunrise!)'),
        keys('Rip\'s long sleep shows how the world changes while we are not looking.', 'My Shadow sees an ordinary thing through a child\'s curious eyes.', 'Gulliver is shipwrecked in Lilliput, a land of people only a few centimetres tall.'),
      ],
      examples: [
        ex('How did Rip know that a long time had passed?', ['His beard was long and white.', 'His gun was rusty and Wolf was gone.', 'The villagers and the inn sign had changed.'], 'His long white beard, rusty gun, missing dog and the changed village showed many years had passed.'),
        ex('Why didn\'t the shadow go out with the child early in the morning?', ['Shadows need light.', 'It was before sunrise.'], 'There was no sunlight yet, so there was no shadow — the child playfully says it stayed in bed.'),
      ],
      practice: [
        mcq('rip', 'Use the summary.', [
          ['Who wrote Rip Van Winkle?', 'Washington Irving', ['R.L. Stevenson', 'Jonathan Swift', 'John Keats'], 'An American writer.', 'Washington Irving wrote the story.'],
          ['What was the name of Rip\'s dog?', 'Wolf', ['Tiger', 'Moti', 'Lion'], 'It sounds like a wild animal.', 'His dog was called Wolf.'],
          ['How long did Rip sleep?', 'Twenty years', ['Twenty days', 'Two years', 'One night'], 'His daughter had grown up.', 'He slept for twenty years.'],
          ['What were the strange men in the mountains doing?', 'Playing ninepins', ['Cutting trees', 'Fishing', 'Building a house'], 'A game with balls and pins.', 'They were playing ninepins, a kind of bowling.'],
          ['Who took care of Rip at the end?', 'His daughter', ['His wife', 'The innkeeper', 'The strange men'], 'She was grown up.', 'His grown-up daughter recognised him and took him home.'],
          ['Which words best describe Rip?', 'kind but lazy', ['cruel and hard-working', 'rich and proud', 'angry and rude'], 'He helped neighbours but not at home.', 'Rip was kind to all but avoided his own work.'],
        ]),
        mcq('shadow', 'Think about how real shadows behave.', [
          ['Who wrote My Shadow?', 'Robert Louis Stevenson', ['Washington Irving', 'Sarojini Naidu', 'Emerson'], 'He also wrote Treasure Island.', 'R.L. Stevenson wrote My Shadow.'],
          ['Why does the shadow grow tall very fast and then become tiny?', 'Because the position of the light changes', ['Because it eats too much', 'Because it is ill', 'Because the child is magic'], 'Think of evening shadows.', 'Shadows change size as the sun or lamp moves.'],
          ['Why was there no shadow early in the morning?', 'The sun had not risen yet', ['The shadow was really sleeping', 'It was raining', 'The child was invisible'], 'Shadows need light.', 'Without sunlight there is no shadow.'],
          ['The speaker of My Shadow is…', 'a small child', ['an old man', 'a teacher', 'a dog'], 'He goes to bed early and plays.', 'The speaker is a curious young child.'],
          ['Gulliver found himself in Lilliput, a land of…', 'very tiny people', ['giants', 'talking trees', 'robots'], 'Lilliputians were tiny.', 'The Lilliputians were only a few centimetres tall.'],
        ]),
        orderT('plot', ['Rip goes up the mountain before he sleeps.', 'He goes home with his daughter at the end.'], [
          ['Put the events of Rip Van Winkle in order.', ['Rip escapes to the mountains with Wolf', 'He meets strange men playing ninepins', 'He drinks from their flask and falls asleep', 'He wakes with a long white beard', 'His daughter takes him home'], 'Escape → meeting → sleep → waking → home.'],
        ]),
      ],
    },
    {
      id: 'ts6.en.rip.vocab', title: 'Word power: words from the story', prereqs: [],
      intro: [
        h('Story words'),
        def('Idle', 'Lazy; not working.'),
        def('Scold', 'To speak angrily to someone who has done wrong.'),
        def('Rusty', 'Covered with rust, the reddish-brown coat that forms on old iron.'),
        def('Recognise', 'To know someone or something you have seen before.'),
        def('Inn', 'A small hotel where travellers eat and stay.'),
        h('Finding meaning from the word itself'),
        stepsB(
          'Look for a word you know inside the new word: rust → rusty.',
          'Notice the ending: -y often makes an adjective (rust → rusty, sleep → sleepy).',
          'Read the sentence again with your guess.',
        ),
        keys('noun + y = adjective: rain → rainy, dust → dusty, sleep → sleepy.', 'Opposites: idle ↔ busy, young ↔ old.'),
        remember('Recognise = re + cognise (know again).'),
      ],
      examples: [
        ex('Make an adjective from "sleep".', ['noun + y.'], 'sleepy'),
        ex('"The villagers did not recognise Rip." What does recognise mean?', ['They had seen him before but did not know him now.'], 'to know someone you have seen before'),
      ],
      practice: [
        matchT('meanings', 'word with its meaning', [
          ['idle', 'lazy, not working'], ['scold', 'speak angrily to someone'], ['rusty', 'covered with reddish-brown rust'], ['recognise', 'know someone seen before'], ['inn', 'a small hotel for travellers'], ['beard', 'hair growing on a man\'s chin'], ['flask', 'a bottle for carrying drinks'],
        ], ['Think of Rip\'s story.', 'Two words are things you can hold.']),
        typed('y-adj', 'Add -y to make an adjective (watch the spelling).', [
          ['Make an adjective from "rust".', ['rusty'], 'rust + y.', 'rust → rusty.'],
          ['Make an adjective from "rain".', ['rainy'], 'rain + y.', 'rain → rainy.'],
          ['Make an adjective from "dust".', ['dusty'], 'dust + y.', 'dust → dusty.'],
          ['Make an adjective from "sleep".', ['sleepy'], 'sleep + y.', 'sleep → sleepy.'],
          ['Make an adjective from "sun".', ['sunny'], 'Double the n.', 'sun → sunny.', [['suny', 'Double the n: sunny.']]],
          ['Make an adjective from "fog".', ['foggy'], 'Double the g.', 'fog → foggy.', [['fogy', 'Double the g: foggy.']]],
        ], 1),
      ],
    },
    {
      id: 'ts6.en.voice.passive', title: 'Grammar: active and passive voice', prereqs: [],
      intro: [
        h('Who does the action?'),
        p('In the active voice the subject DOES the action: "Rip climbed the mountain." In the passive voice the subject RECEIVES the action: "The mountain was climbed by Rip."'),
        h('Simple rules (simple present and simple past)'),
        stepsB(
          'Find the object of the active sentence. It becomes the new subject.',
          'Use the correct form of "be": is/are (present) or was/were (past), agreeing with the new subject.',
          'Add the past participle (V3) of the verb: write → written, plant → planted.',
          'Add "by" + the old subject (you can leave it out if it is not important).',
          'Change pronouns: I → me, he → him, she → her, we → us, they → them.',
        ),
        keys('Active present: She cleans the room. → Passive: The room is cleaned by her.', 'Active past: They planted trees. → Passive: Trees were planted by them.'),
        remember('Passive = be + past participle. "The letter was wrote" is wrong; say "was written".'),
      ],
      examples: [
        ex('Change to passive: "Meena waters the plants."', ['Object "the plants" → subject (plural).', 'Present plural → are.', 'water → watered.'], 'The plants are watered by Meena.'),
        ex('Change to passive: "The dog chased the cat."', ['Object "the cat" → subject (singular).', 'Past singular → was.', 'chase → chased.'], 'The cat was chased by the dog.'),
      ],
      practice: [
        mcq('change', 'Object → subject; is/are/was/were + V3; by + doer.', [
          ['Passive of "Ravi writes a letter."', 'A letter is written by Ravi.', ['A letter was written by Ravi.', 'A letter is wrote by Ravi.', 'Ravi is written by a letter.'], 'Present tense → is.', 'Present singular: is + written.', [['A letter was written by Ravi.', 'The active sentence is present tense, so use "is", not "was".']]],
          ['Passive of "The children planted saplings."', 'Saplings were planted by the children.', ['Saplings was planted by the children.', 'Saplings are planted by the children.', 'The children were planted by saplings.'], 'Past plural → were.', 'Past + plural subject → were planted.'],
          ['Passive of "Grandmother tells stories."', 'Stories are told by Grandmother.', ['Stories is told by Grandmother.', 'Stories were tell by Grandmother.', 'Stories are telled by Grandmother.'], 'Plural, present → are.', 'are + told (V3 of tell).'],
          ['Passive of "She cooked the rice."', 'The rice was cooked by her.', ['The rice was cooked by she.', 'The rice is cooked by her.', 'The rice were cooked by her.'], 'Change the pronoun.', 'she → her after "by"; past singular → was.', [['The rice was cooked by she.', 'After "by", use the object pronoun: her.']]],
          ['Passive of "They clean the classroom."', 'The classroom is cleaned by them.', ['The classroom is cleaned by they.', 'The classroom are cleaned by them.', 'The classroom was cleaned by them.'], 'they → them.', 'Present singular → is cleaned by them.'],
          ['Which sentence is in the PASSIVE voice?', 'The fort was built by the king.', ['The king built the fort.', 'The king is building a fort.', 'The king will build a fort.'], 'Look for be + V3 + by.', '"was built by" is passive.'],
        ], 2),
        typed('v3', 'Type the past participle (V3).', [
          ['Past participle of "write":', ['written'], 'write – wrote – written.', 'Passive uses written.', [['wrote', 'wrote is the simple past; the past participle is written.']]],
          ['Past participle of "eat":', ['eaten'], 'eat – ate – eaten.', 'eaten.', [['ate', 'ate is the simple past; use eaten.']]],
          ['Past participle of "make":', ['made'], 'make – made – made.', 'made.'],
          ['Past participle of "sing":', ['sung'], 'sing – sang – sung.', 'sung.', [['sang', 'sang is the simple past; use sung.']]],
          ['Past participle of "break":', ['broken'], 'break – broke – broken.', 'broken.'],
          ['Past participle of "see":', ['seen'], 'see – saw – seen.', 'seen.', [['saw', 'saw is the simple past; use seen.']]],
          ['Past participle of "plant":', ['planted'], 'Regular verb.', 'planted.'],
        ]),
      ],
    },
    {
      id: 'ts6.en.letter.write', title: 'Writing: an informal letter', prereqs: [],
      intro: [
        h('Writing to a friend or relative'),
        p('An informal letter is written to people we know well — friends, cousins, grandparents. The language is friendly, but the letter still has a clear layout.'),
        h('Layout of an informal letter'),
        stepsB(
          'Your address and the date (top left or right).',
          'Greeting: Dear Kiran, / Dear Grandpa,',
          'Opening: ask how they are.',
          'Body: your news — one paragraph for each idea.',
          'Closing: send wishes, ask them to write back.',
          'Sign-off: Yours lovingly, / With love, / Your friend, — then your name.',
        ),
        h('Model letter (written for WonderLab)'),
        p('12-4, Gandhi Nagar, Warangal. 3 March. Dear Sana, How are you? I hope you are well. Last week our class read a funny story about a man who slept for twenty years! It made me think how much our town would change in twenty years. Please write and tell me what you are reading. Convey my regards to your parents. Your friend, Lakshmi'),
        keys('Friendly tone; short forms like I\'m are fine.', 'No subject line in an informal letter.', 'End with "Yours lovingly" or "Your friend", not "Yours faithfully".'),
        remember('"Yours faithfully" and "Yours sincerely" are for formal letters.'),
      ],
      examples: [
        ex('Write a greeting for a letter to your grandmother.', ['Informal: Dear + name or relation.'], 'Dear Grandma,'),
        ex('Choose a sign-off for a letter to a cousin.', ['Friendly and warm.'], 'Yours lovingly, (or With love,) followed by your name.'),
      ],
      practice: [
        orderT('layout', ['Address and date first.', 'Your name is last.'], [
          ['Put the parts of an informal letter in order.', ['Address and date', 'Dear Arjun,', 'How are you? I hope you are fine.', 'I visited Golconda Fort last Sunday. It was amazing!', 'Do write back soon.', 'Your friend, Teja'], 'Address → greeting → opening → news → closing → sign-off.'],
          ['Put the parts of an informal letter in order.', ['Address and date', 'Dear Grandpa,', 'I hope you and Grandma are well.', 'I won the drawing competition at school.', 'I will visit you in the holidays.', 'Yours lovingly, Diya'], 'Address → greeting → opening → news → closing → sign-off.'],
        ]),
        mcq('features', 'Informal letters are friendly but still have a layout.', [
          ['Which is the correct greeting for a friend?', 'Dear Priya,', ['Respected Sir,', 'To the Manager,', 'Dear Madam,'], 'It is a friend.', 'Use Dear + name for friends.'],
          ['Which sign-off suits a letter to your aunt?', 'Yours lovingly,', ['Yours faithfully,', 'Yours obediently,', 'Thanking you,'], 'A family member.', '"Yours lovingly" is warm and informal.', [['Yours faithfully,', 'That is for formal letters to people we don\'t know.']]],
          ['What comes first in an informal letter?', 'The writer\'s address and date', ['The sign-off', 'The news', 'The postscript'], 'Top of the page.', 'Address and date come first.'],
          ['Which sentence suits an informal letter?', 'I\'m so excited to tell you about my trip!', ['I wish to bring to your kind notice the following matter.', 'Kindly grant me leave for two days.', 'Subject: Request for a refund.'], 'Friendly tone.', 'Informal letters sound friendly and personal.'],
          ['Which is NOT part of an informal letter?', 'A subject line', ['A greeting', 'A date', 'A sign-off'], 'Formal letters have it.', 'Only formal letters have a subject line.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Unit 7 — P.T. Usha, the Golden Girl
// =====================================================================================
const u7: USpec = {
  id: 'ts6.en.u7', subject: 'english', title: 'Unit 7 — P.T. Usha, the Golden Girl', source: src(7),
  note: 'Facts about P.T. Usha are from public records; teachers should match them to the textbook. The poem Indian Cricket Team and the pleasure reading Ranji\'s Wonderful Bat (Ruskin Bond) are taught at theme level. Sports vocabulary and order of adjectives follow the syllabus; the writing focus (a short biography) was chosen by WonderLab.',
  objectives: [
    {
      id: 'ts6.en.usha.read', title: 'Reading: P.T. Usha, the Golden Girl', prereqs: [],
      intro: [
        h('The Payyoli Express'),
        photo('🏃‍♀️', 'A sprinter bursts off the starting line.'),
        p('Unit 7 is about sports and champions. A. P.T. Usha, the Golden Girl is about India\'s great woman athlete. B. Indian Cricket Team is a poem that cheers our team and the spirit of the game. C. Ranji\'s Wonderful Bat, by Ruskin Bond, is a story about a boy, his love for cricket and a special bat.'),
        h('P.T. Usha in brief (facts for you)'),
        keys(
          'Pilavullakandi Thekkeparambil Usha was born in 1964 in Kerala and grew up near Payyoli — so she is called the "Payyoli Express".',
          'Her coach O.M. Nambiar trained her from a young age.',
          'At the 1984 Los Angeles Olympics she came fourth in the 400 m hurdles, missing a bronze medal by just one-hundredth of a second.',
          'At the 1986 Seoul Asian Games she won four gold medals and a silver.',
          'She later started the Usha School of Athletics to train young girls.',
        ),
        def('Hurdles', 'A race in which runners jump over a row of frames (hurdles).'),
        remember('Usha\'s story teaches hard work, discipline and never giving up — even a tiny loss did not stop her.'),
      ],
      examples: [
        ex('Why is P.T. Usha called the "Payyoli Express"?', ['She comes from Payyoli.', 'An express train is very fast.'], 'Because she is from Payyoli and ran as fast as an express train.'),
        ex('How narrowly did she miss an Olympic medal in 1984?', ['She was fourth.', 'The gap was tiny.'], 'By one-hundredth of a second.'),
      ],
      practice: [
        mcq('facts', 'Use the facts in the lesson.', [
          ['P.T. Usha comes from which state?', 'Kerala', ['Telangana', 'Punjab', 'Gujarat'], 'Payyoli is in this state.', 'She is from Kerala.'],
          ['Why is she called the "Payyoli Express"?', 'She is from Payyoli and runs very fast', ['She drove a train', 'She was born on a train', 'She liked trains'], 'Express = fast.', 'Her home town plus her speed gave her the name.'],
          ['In the 1984 Olympics, Usha finished…', 'fourth in the 400 m hurdles', ['first in the marathon', 'second in swimming', 'third in the long jump'], 'She just missed a medal.', 'She came fourth by 1/100th of a second.'],
          ['Who was her coach?', 'O.M. Nambiar', ['Milkha Singh', 'Sachin Tendulkar', 'Ruskin Bond'], 'He trained her from a young age.', 'O.M. Nambiar was her coach.'],
          ['How many golds did she win at the 1986 Asian Games?', 'Four', ['One', 'Ten', 'None'], 'More than three.', 'She won four golds and a silver.'],
          ['What did she start to help young athletes?', 'The Usha School of Athletics', ['A cricket club', 'A shoe factory', 'A newspaper'], 'It trains girls.', 'She founded the Usha School of Athletics.'],
        ]),
        tapT('qualities', 'Tap all the qualities that helped P.T. Usha become a champion.', [
          ['hard work', true], ['discipline', true], ['determination', true], ['regular practice', true], ['good coaching', true],
          ['laziness', false], ['giving up easily', false], ['skipping training', false], ['jealousy', false],
        ], ['What makes any athlete succeed?', 'Ignore bad habits.'], 'Champions are built by hard work, discipline, practice and good coaching.'),
      ],
    },
    {
      id: 'ts6.en.sports.vocab', title: 'Word power: sports vocabulary', prereqs: [],
      intro: [
        h('Talking about sports'),
        def('Athlete', 'A person who is good at sports such as running or jumping.'),
        def('Track', 'The oval path on which races are run.'),
        def('Medal', 'A metal disc given as a prize: gold (1st), silver (2nd), bronze (3rd).'),
        def('Coach', 'A person who trains players.'),
        def('Spectators', 'People who watch a match or race.'),
        h('Sports and their places'),
        stepsB(
          'Cricket is played on a field; the strip in the middle is the pitch.',
          'Tennis and badminton are played on a court.',
          'Boxing happens in a ring; swimming in a pool.',
          'Races are run on a track.',
        ),
        keys('Cricket words: batter, bowler, wicket, run, over, umpire.', 'Olympic medals: gold, silver, bronze.'),
        remember('The umpire (cricket) or referee (football) makes sure players follow the rules.'),
      ],
      examples: [
        ex('Where is badminton played?', ['Racket games use a court.'], 'On a court'),
        ex('What medal does a runner who comes second win?', ['1st gold, 2nd silver, 3rd bronze.'], 'Silver'),
      ],
      practice: [
        matchT('places', 'sport with the place where it is played', [
          ['cricket', 'field / pitch'], ['tennis', 'court'], ['boxing', 'ring'], ['swimming', 'pool'], ['running race', 'track'], ['skating', 'rink'], ['golf', 'course'],
        ], ['Picture each sport.', 'Racket games use a court.']),
        mcq('words', 'Think of a match you have watched.', [
          ['The person who trains players is the…', 'coach', ['spectator', 'umpire', 'captain'], 'Usha had Nambiar.', 'A coach trains players.'],
          ['People who watch a match are…', 'spectators', ['athletes', 'coaches', 'referees'], 'They sit in the stands.', 'Spectators watch.'],
          ['The third-place medal is…', 'bronze', ['gold', 'silver', 'copper'], '1st gold, 2nd silver…', 'Third place wins bronze.'],
          ['In cricket, the player who delivers the ball to the batter is the…', 'bowler', ['umpire', 'scorer', 'spectator'], 'He bowls.', 'The bowler delivers the ball.'],
          ['Who decides if a batter is out in cricket?', 'The umpire', ['The spectator', 'The coach', 'The scorer'], 'He raises a finger.', 'The umpire gives decisions.'],
          ['A person who takes part in running and jumping events is an…', 'athlete', ['actor', 'author', 'architect'], 'Like P.T. Usha.', 'An athlete competes in sports.'],
        ]),
      ],
    },
    {
      id: 'ts6.en.adj.order', title: 'Grammar: the order of adjectives', prereqs: ['ts6.en.opinion.adj'],
      intro: [
        h('Lining up adjectives'),
        p('When we use two or more adjectives before a noun, they follow a fixed order. "a shiny new gold medal" sounds right; "a gold new shiny medal" sounds wrong.'),
        h('The usual order'),
        stepsB(
          'Opinion: lovely, brave, smart',
          'Size: big, small, tall',
          'Age: old, new, young',
          'Shape: round, square, flat',
          'Colour: red, white, golden',
          'Origin: Indian, Kerala, Chinese',
          'Material: wooden, cotton, gold',
          'Purpose (just before the noun): running shoes, cricket bat',
        ),
        keys('Number words (one, two) and determiners (a, the, my) come before all of these.', 'Most phrases use only two or three adjectives.', 'Memory trick: OSASCOMP — Opinion, Size, Age, Shape, Colour, Origin, Material, Purpose.'),
        remember('Opinion comes first, material comes last before the noun: a beautiful old wooden bat.'),
      ],
      examples: [
        ex('Arrange: (new / a pair of / white / running / shoes)', ['Determiner: a pair of.', 'Age new → colour white → purpose running.'], 'a pair of new white running shoes'),
        ex('Which is correct: "a wooden old bat" or "an old wooden bat"?', ['Age comes before material.'], 'an old wooden bat'),
      ],
      practice: [
        mcq('pick', 'Opinion → size → age → shape → colour → origin → material → purpose.', [
          ['Choose the correct phrase.', 'a brave young Indian athlete', ['a young brave Indian athlete', 'an Indian young brave athlete', 'a brave Indian young athlete'], 'Opinion → age → origin.', 'brave (opinion) young (age) Indian (origin).'],
          ['Choose the correct phrase.', 'a shiny round gold medal', ['a gold round shiny medal', 'a round shiny gold medal', 'a shiny gold round medal'], 'Opinion → shape → material.', 'shiny (opinion) round (shape) gold (material).'],
          ['Choose the correct phrase.', 'a big old red bus', ['a red old big bus', 'an old big red bus', 'a big red old bus'], 'Size → age → colour.', 'big (size) old (age) red (colour).'],
          ['Choose the correct phrase.', 'a lovely small cotton cap', ['a cotton small lovely cap', 'a small lovely cotton cap', 'a lovely cotton small cap'], 'Opinion → size → material.', 'lovely, small, cotton.'],
          ['Choose the correct phrase.', 'two tall young players', ['two young tall players', 'young two tall players', 'tall two young players'], 'Number → size → age.', 'two (number), tall (size), young (age).'],
          ['Choose the correct phrase.', 'a new leather cricket ball', ['a leather new cricket ball', 'a cricket new leather ball', 'a new cricket leather ball'], 'Age → material → purpose.', 'new (age) leather (material) cricket (purpose).'],
        ], 2),
        orderT('arrange', ['Determiner or number first, noun last.', 'Opinion before size; material just before the noun or purpose word.'], [
          ['Arrange the words into a correct phrase.', ['a', 'beautiful', 'long', 'silk', 'saree'], 'Determiner → opinion → size → material → noun.'],
          ['Arrange the words into a correct phrase.', ['my', 'old', 'brown', 'leather', 'bag'], 'Determiner → age → colour → material → noun.'],
          ['Arrange the words into a correct phrase.', ['the', 'tall', 'young', 'Kerala', 'runner'], 'Determiner → size → age → origin → noun.'],
          ['Arrange the words into a correct phrase.', ['a', 'wonderful', 'new', 'wooden', 'cricket', 'bat'], 'Determiner → opinion → age → material → purpose → noun.'],
          ['Arrange the words into a correct phrase.', ['three', 'small', 'round', 'green', 'balls'], 'Number → size → shape → colour → noun.'],
        ], 2),
      ],
    },
    {
      id: 'ts6.en.bio.write', title: 'Writing: a short biography', prereqs: [],
      intro: [
        h('The story of a real life'),
        p('A biography tells the life story of a real person. A short biography (a profile) gives the most important facts in order.'),
        h('Steps to write a short biography'),
        stepsB(
          'Collect facts: name, birth date and place, family, education.',
          'Note main achievements in order of time.',
          'Note qualities: what made the person special?',
          'Write: introduction → early life → achievements → qualities and message.',
          'Use the third person (he/she) and the past tense for past events.',
        ),
        h('Model biography (written for WonderLab)'),
        p('P.T. Usha is one of India\'s greatest athletes. She was born in 1964 in Kerala. As a schoolgirl she showed great speed, and coach O.M. Nambiar began to train her. In 1984 she reached the Olympic final of the 400 m hurdles. Two years later she won four gold medals at the Asian Games. Today she trains young girls at her own school. Her life teaches us that hard work brings success.'),
        keys('Third person: she, he, they.', 'Time linkers: in 1984, later, two years later, today.', 'End with a lesson or message.'),
        remember('A biography is written by someone else. An autobiography is written by the person about himself or herself.'),
      ],
      examples: [
        ex('Is "I was born in Kerala" from a biography or an autobiography?', ['It uses "I".'], 'An autobiography'),
        ex('Write the opening sentence of a biography of a sportsperson you admire.', ['Name + why they are famous.'], 'Mithali Raj is one of the greatest captains of Indian women\'s cricket.'),
      ],
      practice: [
        orderT('bio', ['Introduction first.', 'The message comes last.'], [
          ['Put the biography sentences in order.', ['Saina Nehwal is a famous Indian badminton player.', 'She grew up in Hyderabad.', 'She trained hard from a young age.', 'In 2012 she won an Olympic bronze medal.', 'She inspires many young players.'], 'Intro → early life → training → achievement → message.'],
          ['Put the biography sentences in order.', ['P.T. Usha is called the Payyoli Express.', 'She was born in Kerala in 1964.', 'Coach O.M. Nambiar trained her.', 'She won four golds at the 1986 Asian Games.', 'Today she trains young athletes.'], 'Intro → birth → training → achievement → present.'],
          ['Arrange the steps to write a biography.', ['Collect facts', 'List achievements in time order', 'Note the person\'s qualities', 'Write introduction, life, achievements', 'End with a message'], 'Research → order → qualities → write → conclude.'],
        ]),
        mcq('features', 'Think about how a biography is written.', [
          ['A biography is written in the…', 'third person (he/she)', ['first person (I)', 'second person (you)', 'future tense only'], 'Someone else writes it.', 'A biography uses he/she.'],
          ['A life story written by the person himself is an…', 'autobiography', ['biography', 'poem', 'advertisement'], 'auto = self.', 'An autobiography is about oneself, by oneself.'],
          ['Which is the best order for a biography?', 'Early life → achievements → message', ['Message → early life → birth', 'Achievements → birth → nothing', 'Only a list of medals'], 'Follow time order.', 'A biography follows the order of time.'],
          ['Which linker shows time order?', 'Two years later', ['However', 'Because', 'For example'], 'It moves the story forward in time.', '"Two years later" shows the passage of time.'],
          ['Which sentence is a good ending for a biography?', 'Her life shows that hard work leads to success.', ['She was born in 1964.', 'Her coach was O.M. Nambiar.', 'She ran in 1984.'], 'An ending gives a message.', 'It sums up what we learn from her life.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Unit 8 — Half the Price
// =====================================================================================
const u8: USpec = {
  id: 'ts6.en.u8', subject: 'english', title: 'Unit 8 — Half the Price', source: src(8),
  note: 'Readings A (Half the Price) and B (The Sheik\'s White Donkey) are taught through folk-tale reading skills (characters, problem, clever solution, moral) without plot details; teachers should add story details from the textbook. Grammar (must; simple present; -ing spellings) follows the syllabus; writing focus (dialogue) chosen by WonderLab.',
  objectives: [
    {
      id: 'ts6.en.folk.read', title: 'Reading: folk tales — Half the Price and The Sheik\'s White Donkey', prereqs: [],
      intro: [
        h('Clever tales from long ago'),
        photo('🫏', 'Folk tales often feature ordinary people, animals and a clever twist.'),
        p('Unit 8 has two folk tales. A. Half the Price and B. The Sheik\'s White Donkey are tales of bargains, promises and cleverness. Folk tales were told aloud for hundreds of years before they were written down, so they are short, lively and usually end with a lesson.'),
        h('How to read a folk tale'),
        stepsB(
          'Find the characters: who is clever, who is greedy or foolish?',
          'Find the problem: a bargain, a promise, a trick?',
          'Find the twist: how does someone use their wits to solve it?',
          'Find the moral: what lesson does the tale teach?',
        ),
        def('Folk tale', 'A traditional story passed down by word of mouth.'),
        def('Moral', 'The lesson a story teaches.'),
        def('Bargain', 'An agreement about a price; also, something bought cheaply.'),
        keys('Folk tales have simple characters, a problem and a clever solution.', 'Greed and dishonesty are usually punished; wit and honesty are rewarded.'),
        remember('The moral is a general lesson, like "Greed does not pay" — not just a fact from the story.'),
      ],
      examples: [
        ex('A greedy merchant tries to cheat a farmer, but the farmer tricks him into paying fairly. What is the moral?', ['Greed is defeated by cleverness.'], 'Greed does not pay; honesty and wit win.'),
        ex('What is a folk tale?', ['Think about how it was passed on.'], 'A traditional story passed down by word of mouth.'),
      ],
      practice: [
        mcq('skills', 'Think about how folk tales work.', [
          ['A folk tale was first passed on by…', 'word of mouth', ['television', 'email', 'newspapers'], 'Long before printing.', 'People told folk tales aloud.'],
          ['The lesson of a story is called the…', 'moral', ['title', 'setting', 'character'], 'Fables end with it.', 'The moral is the lesson.'],
          ['In folk tales, greedy characters usually…', 'lose in the end', ['always win', 'become kings', 'are never mentioned'], 'What do tales teach?', 'Folk tales show that greed does not pay.'],
          ['"Bargain" can mean…', 'an agreement about a price', ['a kind of donkey', 'a song', 'a castle'], 'Think of a market.', 'A bargain is a deal about price.'],
          ['Which is a moral, not just a fact?', 'Honesty is the best policy.', ['The donkey was white.', 'The man went to the market.', 'It was a hot day.'], 'A moral is a general lesson.', '"Honesty is the best policy" is a general lesson.'],
          ['What usually solves the problem in a folk tale?', 'A clever idea', ['Magic money from the sky', 'A long sleep', 'A new law'], 'Folk tales praise wit.', 'Folk tale heroes use their wits.'],
        ]),
        matchT('morals', 'situation with its moral', [
          ['A greedy man loses everything trying to get more', 'Greed does not pay.'], ['A boy keeps lying and no one believes him when it matters', 'Liars are not believed even when they speak the truth.'], ['A slow, steady tortoise wins a race', 'Slow and steady wins the race.'], ['Ants store food while the grasshopper plays', 'Work today for tomorrow.'], ['A small mouse frees a trapped lion', 'Even the small can help the great.'], ['A crow drops pebbles into a pot to reach water', 'Where there is a will, there is a way.'],
        ], ['Think of the lesson of each story.', 'These are famous fables you may know.']),
      ],
    },
    {
      id: 'ts6.en.ing.spell', title: 'Spelling: -ing forms and the simple present', prereqs: [],
      intro: [
        h('Adding -s and -ing correctly'),
        p('In the simple present, verbs take -s or -es with he, she and it: "He sells donkeys." For the continuous tense we add -ing: "He is selling a donkey." The spelling sometimes changes.'),
        h('Rules for -ing'),
        stepsB(
          'Most verbs: just add -ing. sell → selling, play → playing.',
          'Verb ends in silent -e: drop the e. make → making, ride → riding.',
          'Short verb, consonant–vowel–consonant: double the last letter. run → running, sit → sitting, shop → shopping.',
          'Verb ends in -ie: change ie to y. lie → lying, die → dying, tie → tying.',
          'Do NOT double w, x or y: snow → snowing, fix → fixing, play → playing.',
        ),
        h('Rules for -s in the simple present'),
        keys('Most verbs: + s (sells, walks).', 'After s, sh, ch, x, o: + es (passes, washes, watches, fixes, goes).', 'Consonant + y: y → ies (carry → carries); vowel + y: + s (play → plays).'),
        remember('"see" keeps both e\'s: seeing. Only a silent final -e is dropped.'),
      ],
      examples: [
        ex('Add -ing: "swim"', ['swim ends consonant–vowel–consonant.', 'Double the m.'], 'swimming'),
        ex('Simple present with he: "He ___ (watch) the market."', ['watch ends in -ch → add -es.'], 'watches'),
      ],
      practice: [
        typed('ing', 'Drop the e? Double the letter? ie → y?', [
          ['Add -ing to "make":', ['making'], 'Drop the silent e.', 'make → making.', [['makeing', 'Drop the silent e: making.']]],
          ['Add -ing to "run":', ['running'], 'Double the n.', 'run → running.', [['runing', 'Double the n: running.']]],
          ['Add -ing to "lie":', ['lying'], 'ie → y.', 'lie → lying.', [['lieing', 'Change ie to y: lying.']]],
          ['Add -ing to "sit":', ['sitting'], 'Double the t.', 'sit → sitting.', [['siting', 'Double the t: sitting.']]],
          ['Add -ing to "ride":', ['riding'], 'Drop the e.', 'ride → riding.'],
          ['Add -ing to "play":', ['playing'], 'Just add -ing.', 'play → playing (never double y).'],
          ['Add -ing to "fix":', ['fixing'], 'Never double x.', 'fix → fixing.', [['fixxing', 'x is never doubled: fixing.']]],
          ['Add -ing to "see":', ['seeing'], 'Keep both e\'s.', 'see → seeing.'],
        ]),
        mcq('present', 'he/she/it → -s or -es.', [
          ['"The merchant ___ his cart every morning." (wash)', 'washes', ['washs', 'washies', 'wash'], 'Ends in -sh.', 'wash + es = washes.'],
          ['"The donkey ___ heavy bags." (carry)', 'carries', ['carrys', 'carryes', 'carry'], 'Consonant + y.', 'carry → carries.'],
          ['"She ___ to the bazaar on Sundays." (go)', 'goes', ['gos', 'go', 'goies'], 'Ends in -o.', 'go + es = goes.'],
          ['"My brother ___ cricket every evening." (play)', 'plays', ['plaies', 'playes', 'play'], 'Vowel + y.', 'play + s = plays.', [['plaies', 'a + y is vowel + y, so just add s: plays.']]],
          ['"The shopkeeper ___ the price." (fix)', 'fixes', ['fixs', 'fix', 'fixies'], 'Ends in -x.', 'fix + es = fixes.'],
          ['Choose the correct sentence.', 'He sells fruit at the market.', ['He sell fruit at the market.', 'He selling fruit at the market.', 'He do sells fruit at the market.'], 'He → verb + s.', 'Simple present with he: sells.'],
        ]),
      ],
    },
    {
      id: 'ts6.en.must.modal', title: 'Grammar: "must" for rules and duties', prereqs: [],
      intro: [
        h('Things we have to do'),
        p('We use "must" to talk about rules, duties and things that are very necessary: "You must wear a helmet." We use "must not" (mustn\'t) for things that are not allowed: "You must not cheat."'),
        h('Simple rules'),
        stepsB(
          'must + base verb: She must go. (NOT must goes, must to go, must going)',
          'must is the same for all subjects: I/you/he/they must.',
          'Negative: must not / mustn\'t + base verb = not allowed.',
          'Question: Must I go?',
          '"don\'t have to" means not necessary — it is different from "must not".',
        ),
        keys('School rules: Students must be on time. You must not run in the corridor.', 'must not = forbidden; don\'t have to = not necessary.'),
        remember('Never add "to" after must: "You must to go" is wrong.'),
      ],
      examples: [
        ex('Make a rule for the library using "must not".', ['must not + base verb.'], 'You must not talk loudly in the library.'),
        ex('Correct the sentence: "He must goes home now."', ['After must, use the base verb.'], 'He must go home now.'),
      ],
      practice: [
        mcq('form', 'must + base verb, with no "to" and no -s.', [
          ['Choose the correct sentence.', 'You must finish your homework.', ['You must to finish your homework.', 'You must finishes your homework.', 'You must finishing your homework.'], 'must + base verb.', 'After must, use the base verb: finish.'],
          ['Choose the correct sentence.', 'She must wear a uniform.', ['She musts wear a uniform.', 'She must wears a uniform.', 'She must to wear a uniform.'], 'must never changes.', 'must + wear.'],
          ['Which sentence means "it is not allowed"?', 'You must not litter the park.', ['You don\'t have to litter the park.', 'You must litter the park.', 'You can litter the park.'], 'Forbidden.', 'must not = not allowed.'],
          ['"You ___ cross the road when the light is red." Choose the best word.', 'must not', ['must', 'have to', 'should always'], 'Is it safe?', 'Crossing at a red light is forbidden: must not.'],
          ['"Tomorrow is a holiday, so you ___ come to school."', 'don\'t have to', ['must not', 'must', 'mustn\'t'], 'It is not necessary, but not forbidden.', 'don\'t have to = not necessary.', [['must not', '"must not" means forbidden; here it is just not necessary.']]],
        ], 2),
        typed('rules', 'Type must or must not.', [
          ['Complete the hospital rule: "Visitors ___ make noise."', ['must not', 'mustn\'t'], 'Noise is not allowed.', 'Forbidden → must not.'],
          ['Complete the road rule: "Riders ___ wear helmets."', ['must'], 'It is a duty.', 'Duty → must.'],
          ['Complete the exam rule: "Students ___ copy from others."', ['must not', 'mustn\'t'], 'Copying is forbidden.', 'Forbidden → must not.'],
          ['Complete the school rule: "Students ___ be on time."', ['must'], 'It is a duty.', 'Duty → must.'],
          ['Complete the park rule: "You ___ pluck the flowers."', ['must not', 'mustn\'t'], 'Plucking is not allowed.', 'Forbidden → must not.'],
          ['Complete the kitchen rule: "You ___ wash your hands before cooking."', ['must'], 'Necessary for hygiene.', 'Necessary → must.'],
        ]),
      ],
    },
    {
      id: 'ts6.en.dialogue.write', title: 'Writing: a dialogue', prereqs: [],
      intro: [
        h('People talking on paper'),
        p('A dialogue is a conversation between two or more people, written so that we can read it aloud. Many folk tales, like the ones in this unit, come alive through dialogue — a buyer and a seller bargaining, for example.'),
        h('How to write a dialogue'),
        stepsB(
          'Decide who is talking and about what.',
          'Write each speaker\'s name, then a colon: Seller:',
          'Start a new line each time the speaker changes.',
          'Keep each turn short and natural.',
          'Make the talk move forward — a greeting, the problem, the end.',
          'Use ? and ! where needed.',
        ),
        h('Model dialogue (written for WonderLab)'),
        p('Customer: How much is this basket? / Seller: Two hundred rupees, madam. / Customer: That is too much! Will you give it for one hundred? / Seller: It is hand-woven. I can give it for one hundred and fifty. / Customer: All right, I will take it. / Seller: Thank you! Please come again.'),
        keys('Name + colon, no quotation marks.', 'New line for each speaker.', 'Polite words: please, thank you, sorry.'),
        remember('A dialogue is not a story. Do not write "he said" — just the name and the words.'),
      ],
      examples: [
        ex('Write the first line of a dialogue between a student and a librarian.', ['Name + colon + words.'], 'Student: Good morning, madam. May I borrow this book?'),
        ex('How do you show that a new person is speaking?', ['Look at the layout.'], 'Start a new line with that person\'s name and a colon.'),
      ],
      practice: [
        orderT('talk', ['A greeting or question opens the dialogue.', 'Thanks or goodbye closes it.'], [
          ['Put the dialogue in order.', ['Customer: How much are these mangoes?', 'Seller: Eighty rupees a kilo.', 'Customer: Can you give them for seventy?', 'Seller: All right, seventy for you.', 'Customer: Thank you! Please give me two kilos.'], 'Question → price → bargain → agreement → thanks.'],
          ['Put the dialogue in order.', ['Ravi: Hello Imran! Where are you going?', 'Imran: To the playground. Will you come?', 'Ravi: Sorry, I must finish my homework first.', 'Imran: Okay, come after that.', 'Ravi: Sure. See you soon!'], 'Greeting → invitation → reason → reply → goodbye.'],
          ['Put the dialogue in order.', ['Student: May I come in, madam?', 'Teacher: Yes. Why are you late?', 'Student: The bus broke down on the way.', 'Teacher: All right. Please sit down.', 'Student: Thank you, madam.'], 'Permission → question → reason → instruction → thanks.'],
        ]),
        mcq('features', 'Think about how dialogues are laid out.', [
          ['In a dialogue, what follows the speaker\'s name?', 'A colon (:)', ['A question mark', 'A full stop', 'Nothing'], 'Look at the model.', 'Name + colon, then the words.'],
          ['When do you start a new line in a dialogue?', 'Each time the speaker changes', ['After every word', 'Only at the end', 'Never'], 'One turn per line.', 'Every new speaker begins a new line.'],
          ['Which is the correct dialogue line?', 'Seller: This shawl costs five hundred rupees.', ['The seller said that the shawl was five hundred rupees.', 'Seller this shawl costs five hundred rupees', 'Seller - this shawl - costs'], 'Name + colon + words.', 'It follows the dialogue layout.'],
          ['Which line best ends a dialogue between a buyer and a seller?', 'Buyer: Thank you. Have a nice day!', ['Buyer: How much is it?', 'Seller: Hello!', 'Buyer: Show me another one.'], 'An ending closes the talk.', 'Thanks and goodbye end the conversation.'],
          ['Which polite word fits? "Customer: ___, can you show me that red bag?"', 'Please', ['Never', 'Go away', 'Because'], 'Asking politely.', '"Please" makes a request polite.'],
        ]),
      ],
    },
  ],
};

export const units: USpec[] = [u1, u2, u3, u4, u5, u6, u7, u8];
