// Telangana SCERT Class 7 — English (Reader, 8 units). Original teaching aligned to the official chapter list
// (src/content/ts/books.ts, syllabus.json). COPYRIGHT: no textbook passage or poem is reproduced. Readings are taught
// ABOUT (author, context, our own short summary, themes); every grammar example and exercise sentence is original.
// Unit 7 follows the book's contents page (A. The Wonderful World of Chess), not the older self-assessment page.
import {
  tp, ex, p, h, tip, def, keys, remember, stepsB, choose, matching, ordering,
  type USpec, type TSpec,
} from '../../lib/kit';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(7, 'english', n);
const ELIM = 'Cross out the options that clearly do not fit, then compare the last two carefully.';

// ---------- compact practice factories ----------
/** [question, correct answer, wrong answers, hint, why the answer is right] */
type MQ = [string, string, string[], string, string];
const mcq = (key: string, hint0: string, bank: MQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, a, w, h1, why] = r.pick(bank);
  return {
    type: 'mcq', prompt: q, ...choose(r, a, w), hints: [hint0, h1, ELIM],
    mistakes: [{ when: 'wrong', explain: `Not quite. ${why}` }],
    solution: [`Correct answer: ${a}.`, why],
  };
}, d);

const matchT = (key: string, what: string, pool: [string, string][], hints: string[], n = 4, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pairs = r.shuffle(pool).slice(0, n);
  const m = matching(r, pairs);
  return {
    type: 'match', prompt: `Match each ${what}: ${pairs.map((x) => x[0]).join(' · ')}`, left: m.left, right: m.right, answer: m.answer,
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair does not fit. Check each left item on its own, then match the rest by elimination.' }],
    solution: pairs.map(([a, b]) => `${a} → ${b}`),
  };
}, d);

/** Bank of sentences split into chunks with "|" (in the correct order) + why. */
type OQ = [string, string];
const orderT = (key: string, hints: string[], bank: OQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [s, why] = r.pick(bank);
  const parts = s.split('|').map((x) => x.trim());
  if (!/[.?!]$/.test(parts[parts.length - 1])) parts[parts.length - 1] += '.';
  return {
    type: 'order', prompt: 'Put the parts in the right order.', ...ordering(r, parts), hints,
    mistakes: [{ when: 'wrong', explain: `The order is not right yet. ${why}` }],
    solution: [parts.join(' '), why],
  };
}, d);

/** Error spotting: sentence split with "|", index of the wrong part, corrected sentence, why. */
type EQ = [string, number, string, string];
const errT = (key: string, hints: string[], bank: EQ[], d: 1 | 2 | 3 = 2): TSpec => tp(key, (r) => {
  const [s, bad, fixed, why] = r.pick(bank);
  const parts = s.split('|').map((x) => x.trim());
  const choices = parts.map((x, i) => ({ id: 'abcdefgh'[i], label: { en: `(${'ABCDEFGH'[i]}) ${x}` } }));
  return {
    type: 'mcq', prompt: `Find the mistake. Which part of this sentence is wrong? "${parts.join(' ')}"`, choices,
    answer: { kind: 'choice', correct: choices[bad].id }, hints,
    mistakes: [{ when: 'wrong', explain: `That part is fine. ${why}` }],
    solution: [`The mistake is in part (${'ABCDEFGH'[bad]}): "${parts[bad]}".`, `Correct sentence: ${fixed}`, why],
  };
}, d);

// =====================================================================================
// Unit 1 — Town and country (The Town Mouse and the Country Mouse)
// =====================================================================================
const u1: USpec = {
  id: 'ts7.en.u1', subject: 'english', title: 'Unit 1: Town and Country', source: src(1),
  note: 'Reading A is the well-known fable; poem B and reading C (The New Blue Dress, pleasure reading) are taught at theme level only — teacher to read them with the class.',
  objectives: [
    {
      id: 'ts7.en.mouse.read', title: 'Reading: The Town Mouse and the Country Mouse', prereqs: [],
      intro: [
        h('About the story'),
        p('This is a very old fable — a short story with a lesson, often told about animals. Fables like this one are linked to Aesop, a storyteller of ancient Greece. It has been retold in many languages.'),
        h('What happens (our summary)'),
        stepsB(
          'A mouse living in the countryside invites her cousin from the town to visit. She offers simple food: grain, roots and seeds.',
          'The town mouse is not impressed. She says country life is dull and invites her cousin to the town.',
          'In the big town house there is rich food — cakes, cheese and sweets — and the two mice begin to feast.',
          'Suddenly people come in and dogs bark (or a cat appears). The mice run and hide, shaking with fear. This happens again and again.',
          'The country mouse decides to go home. She says she prefers plain food eaten in peace to a feast eaten in fear.',
        ),
        keys('Moral: a simple life in peace is better than a rich life full of fear.', 'Contrast: the town is rich but dangerous; the country is plain but safe.', 'Characters: the town mouse is proud and fond of luxury; the country mouse is simple and content.'),
        h('Poem B: The Town Child & The Country Child'),
        p('The poem also compares two lives. One child grows up among streets, shops and traffic lights; the other among fields, animals and open sky. Each child enjoys different things — the poem shows that both lives have their own joys.'),
        def('Fable', 'A short story, usually with animals as characters, that teaches a lesson (a moral).'),
        def('Content (adjective)', 'Happy and satisfied with what you have.'),
        remember('When you write the moral, use one sentence that fits the WHOLE story, not just one event.'),
      ],
      examples: [
        ex('Why did the country mouse go back home?', ['Find what kept happening in the town: danger, fear, running to hide.', 'She valued peace more than rich food.'], 'Because she could not enjoy rich food while living in fear; she preferred simple food in peace.'),
        ex('Give one word for each mouse: proud / content.', ['The town mouse laughs at simple food → proud.', 'The country mouse is happy with little → content.'], 'Town mouse: proud. Country mouse: content.'),
      ],
      practice: [
        mcq('comp', 'Think about the order of events in the fable.', [
          ['What food did the country mouse first offer her cousin?', 'Simple grain and seeds', ['Cakes and cheese', 'Rice and curry', 'Nothing at all'], 'The country mouse lived simply.', 'She shared plain country food like grain, roots and seeds.'],
          ['What did the town mouse think of country life?', 'It was dull and plain', ['It was exciting', 'It was dangerous', 'It was too noisy'], 'She wanted to show off the town.', 'She found the country boring and invited her cousin to the town.'],
          ['What spoilt the feast in the town?', 'People and dogs that frightened the mice', ['Heavy rain', 'Bad food', 'A long journey'], 'Why did they keep running to hide?', 'Each time they began to eat, danger came and they had to hide.'],
          ['What is the moral of the fable?', 'A simple life in peace is better than a rich life in fear', ['Town food is always tastier', 'Never visit your cousins', 'Mice should live in houses'], 'Look at the country mouse’s last words.', 'The fable teaches that peace of mind matters more than luxury.'],
          ['Which word best describes the country mouse?', 'Content', ['Greedy', 'Proud', 'Lazy'], 'She is happy with little.', 'Content = satisfied with what one has.'],
          ['A story with animal characters that teaches a lesson is called a…', 'fable', ['biography', 'diary', 'report'], 'Aesop is famous for these.', 'A fable is a short story with a moral.'],
        ]),
        orderT('events', ['The visit to the country comes first.', 'The country mouse’s decision comes last.'], [
          ['The country mouse invited her cousin. | The town mouse laughed at the plain food. | They went together to the town. | Dogs frightened them during the feast. | The country mouse went home.', 'Invitation → visit → trip to town → danger → return.'],
          ['The town mouse | invited | her cousin | to the big house.', 'Subject → verb → object → place.'],
          ['Although the food was rich, | the country mouse | felt | afraid.', 'Although-clause → subject → verb → describing word.'],
          ['After the dogs left, | the two mice | came out | of their hole.', 'Time clause → subject → verb → place.'],
          ['I prefer plain food | eaten in peace | to a feast | eaten in fear.', 'prefer A to B: the thing liked more comes first.'],
        ]),
        matchT('contrast', 'place with what the story shows about it', [
          ['The town', 'rich food but constant danger'], ['The country', 'plain food but peace and safety'], ['The town mouse', 'proud and fond of luxury'], ['The country mouse', 'simple and content'], ['The moral', 'peace is worth more than riches'],
        ], ['Think about what each place or character stands for.', 'The moral is the lesson of the whole story.']),
      ],
    },
    {
      id: 'ts7.en.compound.vocab', title: 'Vocabulary: compound words and phrases', prereqs: [],
      intro: [
        h('Two words → one new word'),
        def('Compound word', 'A word made by joining two words: farm + house = farmhouse, sun + flower = sunflower.'),
        p('Compound words can be written as one word (classroom), with a hyphen (well-known) or as two words (bus stop). The meaning usually comes from both parts.'),
        stepsB('Split the compound into its two parts.', 'Find the meaning of each part.', 'Join the meanings: a farmhouse is a house on a farm.'),
        h('Phrases'),
        def('Phrase', 'A group of words that works together but has no subject-and-verb of its own: in the field, a bag of rice, very quickly.'),
        keys('Noun phrase: a big brown dog', 'Place phrase: under the table, in the town', 'Time phrase: at sunrise, after lunch'),
        remember('A phrase is NOT a full sentence. "In the morning" is a phrase; "We play in the morning" is a sentence.'),
      ],
      examples: [
        ex('Make a compound word: rain + ____ = something you wear to stay dry in the rain.', ['Which word goes with rain to name a piece of clothing?', 'rain + coat = raincoat.'], 'raincoat'),
        ex('Is "near the village pond" a phrase or a sentence?', ['Look for a subject and a verb.', 'There is no verb.'], 'A phrase (it tells place).'),
      ],
      practice: [
        mcq('make', 'Join two words to make one new word.', [
          ['farm + ____ = a house on a farm', 'house', ['tree', 'road', 'work'], 'Where does a farmer live?', 'farm + house = farmhouse.'],
          ['____ + flower = a big yellow flower that turns to the sun', 'sun', ['moon', 'star', 'sky'], 'It faces the sun.', 'sun + flower = sunflower.'],
          ['class + ____ = the room where lessons happen', 'room', ['mate', 'book', 'work'], 'A place for a class.', 'class + room = classroom.'],
          ['foot + ____ = a game played by kicking a ball', 'ball', ['path', 'step', 'print'], 'A game with a ball.', 'foot + ball = football.'],
          ['____ + fly = an insect with colourful wings', 'butter', ['fire', 'dragon', 'house'], 'It flutters over flowers and has bright wings.', 'butter + fly = butterfly.'],
          ['tooth + ____ = what you use to clean your teeth', 'brush', ['ache', 'pick', 'less'], 'You hold it every morning.', 'tooth + brush = toothbrush.'],
        ]),
        matchT('parts', 'compound word with its meaning', [
          ['farmhouse', 'a house on a farm'], ['bookshelf', 'a shelf for books'], ['sunrise', 'the time when the sun comes up'], ['shopkeeper', 'a person who runs a shop'], ['footpath', 'a path for people walking'], ['waterfall', 'water falling from a height'],
        ], ['Split each word into two parts.', 'A shopkeeper "keeps" a shop.']),
        mcq('phrase', 'A phrase has no subject + verb of its own.', [
          ['Which of these is a phrase, not a sentence?', 'under the old banyan tree', ['The children sat under the tree.', 'Ravi runs fast.', 'It is raining.'], 'Look for a group without a verb.', '"under the old banyan tree" tells place but has no subject or verb.'],
          ['Which of these is a sentence?', 'The mouse ran into its hole.', ['into its hole', 'a small grey mouse', 'very quickly'], 'Find the subject and verb.', 'It has a subject (the mouse) and a verb (ran).'],
          ['"After the school bell" is a…', 'time phrase', ['place phrase', 'full sentence', 'compound word'], 'It answers "when?"', 'It tells when, and has no verb.'],
          ['"In the busy market" is a…', 'place phrase', ['time phrase', 'full sentence', 'compound word'], 'It answers "where?"', 'It tells where, and has no verb.'],
          ['"A basket of ripe mangoes" is a…', 'noun phrase', ['place phrase', 'full sentence', 'time phrase'], 'It names a thing.', 'It is a group of words built around the noun "basket".'],
        ]),
      ],
    },
    {
      id: 'ts7.en.degrees.use', title: 'Grammar: degrees of comparison; using "may"', prereqs: [],
      intro: [
        h('Comparing things'),
        def('Positive degree', 'Describes one thing: The town is big.'),
        def('Comparative degree', 'Compares TWO things, often with "than": The town is bigger than the village.'),
        def('Superlative degree', 'Compares THREE or more, with "the": Hyderabad is the biggest city in Telangana.'),
        h('The rules'),
        stepsB(
          'Short words (one syllable): add -er / -est → tall, taller, tallest.',
          'Words ending in -e: add -r / -st → wide, wider, widest.',
          'Short words ending consonant–vowel–consonant: double the last letter → big, bigger, biggest; hot, hotter, hottest.',
          'Words ending in consonant + y: change y to i → busy, busier, busiest; happy, happier, happiest.',
          'Long words (most two-syllable and all longer words): use more / most → beautiful, more beautiful, most beautiful.',
          'Irregular: good–better–best; bad–worse–worst; many/much–more–most; little–less–least.',
        ),
        remember('Never use both: "more bigger" ✗ → "bigger" ✓. Use "than" after a comparative and "the" before a superlative.'),
        h('Using "may"'),
        keys('Permission: May I come in, sir?', 'Possibility: It may rain this evening.', 'After "may", use the base verb: may go, may be (not "may goes").'),
      ],
      examples: [
        ex('Fill in: An elephant is ____ (heavy) than a horse.', ['Two things → comparative.', 'heavy ends in consonant + y → heavier.'], 'An elephant is heavier than a horse.'),
        ex('Fill in: This is the ____ (good) dosa I have ever eaten.', ['"the" + many dosas → superlative.', 'good is irregular: good, better, best.'], 'This is the best dosa I have ever eaten.'),
        ex('Is "may" showing permission or possibility? "The train may be late today."', ['Nobody is asking to be allowed to do anything.', 'It is something that could happen.'], 'Possibility'),
      ],
      practice: [
        mcq('fill', 'Count how many things are being compared.', [
          ['The country mouse’s home was ____ than the town house.', 'quieter', ['quietest', 'more quieter', 'quiet'], 'Two homes → comparative with "than".', 'Two things compared → quieter.'],
          ['Godavari is one of the ____ rivers in India.', 'longest', ['longer', 'most long', 'long'], '"one of the" + many rivers.', 'Many rivers → superlative: longest.'],
          ['Today is ____ than yesterday.', 'hotter', ['hoter', 'more hot', 'hottest'], 'hot ends consonant–vowel–consonant.', 'Double the t: hotter.'],
          ['Diya is the ____ girl in our class.', 'happiest', ['happyest', 'most happy', 'happier'], 'Change y to i.', 'happy → happiest (y → i, then -est).'],
          ['This poem is ____ than the last one.', 'more beautiful', ['beautifuller', 'most beautiful', 'beautiful'], 'beautiful is a long word.', 'Long words take "more" in the comparative.'],
          ['My cold is ____ today than it was yesterday.', 'worse', ['badder', 'worst', 'more bad'], 'bad is irregular.', 'bad → worse → worst.'],
        ]),
        errT('spot', ['Check: two things → -er/more; three or more → -est/most.', 'Never use more + -er together.'], [
          ['The town mouse | was more prouder | than | her cousin.', 1, 'The town mouse was prouder than her cousin.', 'Use either -er or more, never both.'],
          ['Ravi is | the taller boy | in our | whole school.', 1, 'Ravi is the tallest boy in our whole school.', 'Comparing with the whole school (many) needs the superlative.'],
          ['This road | is wider | then | the old road.', 2, 'This road is wider than the old road.', 'After a comparative we use "than", not "then".'],
          ['Meena | sings | gooder | than her sister.', 2, 'Meena sings better than her sister.', 'good/well → better (irregular).'],
          ['It may | rains | in the evening, | so take an umbrella.', 1, 'It may rain in the evening, so take an umbrella.', 'After "may", use the base verb: rain.'],
          ['May I | to borrow | your pencil, | please?', 1, 'May I borrow your pencil, please?', 'After "may", use the base verb without "to".'],
        ]),
        mcq('may', 'Is someone asking to be allowed, or saying something could happen?', [
          ['"May I go to the library, madam?" — "may" shows…', 'permission', ['possibility', 'ability', 'order'], 'The speaker is asking to be allowed.', 'Asking to be allowed = permission.'],
          ['"The guests may arrive late." — "may" shows…', 'possibility', ['permission', 'order', 'habit'], 'Nobody is asking to be allowed.', 'It might happen = possibility.'],
          ['Choose the correct sentence.', 'It may snow in the hills tonight.', ['It may snows in the hills tonight.', 'It may to snow in the hills tonight.', 'It may snowing in the hills tonight.'], 'Use the base verb after may.', 'may + base verb: may snow.'],
          ['Which is a polite way to ask permission?', 'May I open the window?', ['I open the window.', 'Open the window now.', 'Window open?'], 'Begin with "May I…"', '"May I…?" is a polite request for permission.'],
          ['"Kiran may be at the playground." — "may" shows…', 'possibility', ['permission', 'order', 'promise'], 'The speaker is not sure where Kiran is.', 'It is a guess about what is possible.'],
        ]),
      ],
    },
    {
      id: 'ts7.en.letter.write', title: 'Writing: an informal letter describing a place', prereqs: [],
      intro: [
        h('What is an informal letter?'),
        p('An informal (personal) letter is written to someone you know well — a friend, cousin or grandparent. The tone is friendly, but the letter still has a clear format.'),
        h('Format'),
        stepsB(
          'Sender’s address (top left or top right) — keep it short, e.g. village, district.',
          'Date below the address.',
          'Greeting (salutation): Dear Kavya, / Dear Grandpa,',
          'Opening paragraph: ask about the person, say why you are writing.',
          'Body: describe the place — what you see, hear, smell, and how you feel.',
          'Closing paragraph: invite them, send regards, ask them to reply.',
          'Closing: Yours lovingly, / Your friend, — then your name below.',
        ),
        keys('Describing words help: green fields, crowded streets, cool breeze, noisy traffic.', 'Use the senses: sight, sound, smell, taste, touch.'),
        h('Model body paragraph (our own)'),
        p('Our village is very peaceful. Every morning I wake up to the sound of birds and the smell of fresh rice being cooked. There are green paddy fields all around, and a small pond where buffaloes cool themselves in the afternoon. In the evening we play kabaddi near the temple.'),
        remember('Common mistakes: "Yours faithfully" is for formal letters, not friends; do not forget the date; do not write the whole letter as one paragraph.'),
      ],
      examples: [
        ex('Write the greeting and closing for a letter to your friend Imran.', ['Greeting: Dear + name + comma.', 'Closing for a friend: Your friend, / Yours lovingly,'], 'Dear Imran, … Your friend, (your name)'),
        ex('Improve this sentence for a description: "The town is good."', ['"good" tells us nothing.', 'Add sight and sound details.'], 'The town is lively, with bright shops, honking buses and crowds everywhere.'),
      ],
      practice: [
        orderT('format', ['Address and date come first.', 'Your name comes at the very end.'], [
          ['Sender’s address | Date | Dear Kavya, | Body of the letter | Yours lovingly, | Meena', 'Address → date → greeting → body → closing → name.'],
          ['Dear Grandpa, | I hope you are well. | Let me tell you about our new town. | Please write back soon. | Your loving grandson,', 'Greeting → opening → body → request to reply → closing.'],
          ['Every morning | I wake up | to the sound | of birds.', 'Time → subject + verb → what is heard.'],
          ['Ask about their health | Say why you are writing | Describe the place | Invite them to visit | Sign off', 'Opening first, description in the middle, invitation near the end.'],
          ['I hope | this letter finds you | well and happy.', 'A common, friendly opening line.'],
        ]),
        mcq('parts', 'Remember: informal = friendly, but with a clear format.', [
          ['Which closing suits a letter to your best friend?', 'Your friend,', ['Yours faithfully,', 'Sir,', 'To the Principal,'], 'Friends get a warm closing.', 'Informal letters end with warm closings like "Your friend,".'],
          ['Which greeting suits a letter to your aunt?', 'Dear Aunty,', ['Respected Sir,', 'To whom it may concern,', 'Hi sir,'], 'You know her well.', 'Use "Dear" + name/relation in informal letters.'],
          ['What comes right after the sender’s address?', 'The date', ['The closing', 'The signature', 'The P.S.'], 'When was it written?', 'The date is written below the address.'],
          ['Which sentence best describes a village using the senses?', 'The air smells of wet earth and the fields are bright green.', ['The village is nice.', 'I like it.', 'It is a place.'], 'Look for smell and sight words.', 'It uses smell and sight details.'],
          ['Where do you usually invite your friend to visit?', 'In the closing paragraph', ['In the address', 'In the date', 'In the greeting'], 'Invitations come near the end.', 'The last paragraph invites and sends regards.'],
        ]),
        matchT('senses', 'detail with the sense it uses', [
          ['Buses honk all day', 'hearing'], ['The fields are bright green', 'sight'], ['Jasmine flowers smell sweet', 'smell'], ['The mango was juicy and sweet', 'taste'], ['The river water felt cold', 'touch'],
        ], ['Which part of your body notices it?', 'Ears hear, eyes see, nose smells.']),
      ],
    },
  ],
};

// =====================================================================================
// Unit 2 — Science and scientists (C.V. Raman)
// =====================================================================================
const u2: USpec = {
  id: 'ts7.en.u2', subject: 'english', title: 'Unit 2: Great Indian Scientists', source: src(2),
  note: 'Reading A facts are from the widely known life of C.V. Raman; teacher to check against the textbook. Poem B (It’s Change…) is taught at theme level only. Reading C (Susruta) is pleasure reading.',
  objectives: [
    {
      id: 'ts7.en.raman.read', title: 'Reading: C.V. Raman, the Pride of India', prereqs: [],
      intro: [
        h('Who was C.V. Raman?'),
        p('Chandrasekhara Venkata Raman (1888–1970) was born in Tiruchirappalli, Tamil Nadu. He was a brilliant student who loved physics, especially light and sound.'),
        h('His life (our summary)'),
        stepsB(
          'As a young man he took a government job in the finance department in Kolkata, but spent his evenings doing experiments in a science laboratory.',
          'On a sea voyage to Europe in 1921, he wondered why the sea looks so deep blue. He did not accept the usual answer and began to investigate.',
          'He studied how light scatters (spreads out) when it passes through liquids and other materials.',
          'On 28 February 1928 he discovered what we now call the Raman Effect. India celebrates National Science Day on 28 February.',
          'In 1930 he won the Nobel Prize in Physics — the first Asian to win a Nobel Prize in science. He later received the Bharat Ratna and set up the Raman Research Institute in Bengaluru.',
        ),
        keys('Qualities: curiosity, hard work, patience, love for India.', 'Message: great science starts with simple questions about everyday things.'),
        h('Poem B and Reading C'),
        p('The poem "It’s Change…" talks about how everything around us keeps changing — seasons, people, places — and that change is a natural part of life. Reading C is about Susruta, an ancient Indian surgeon remembered for early operations to repair the nose and for a famous book on surgery.'),
        def('Scatter (of light)', 'To spread out in different directions.'),
        remember('Key dates: born 1888; Raman Effect 28 Feb 1928; Nobel Prize 1930.'),
      ],
      examples: [
        ex('Why do we celebrate National Science Day on 28 February?', ['Recall the date of Raman’s discovery.'], 'Because C.V. Raman discovered the Raman Effect on 28 February 1928.'),
        ex('Which question on a ship led Raman to his research?', ['He looked at the sea during his voyage.'], 'Why is the sea blue?'),
      ],
      practice: [
        mcq('comp', 'Recall the main facts of Raman’s life.', [
          ['In which subject did Raman win the Nobel Prize?', 'Physics', ['Chemistry', 'Medicine', 'Literature'], 'He studied light.', 'He won the 1930 Nobel Prize in Physics.'],
          ['What made Raman curious during his sea voyage?', 'The blue colour of the sea', ['The size of the ship', 'The taste of sea water', 'The sound of the engine'], 'He looked out at the water.', 'He wanted to know why the sea looks blue.'],
          ['What is celebrated in India on 28 February?', 'National Science Day', ['Teachers’ Day', 'Children’s Day', 'Republic Day'], 'It marks his discovery.', 'The Raman Effect was discovered on 28 February 1928.'],
          ['Raman’s discovery was about…', 'how light scatters', ['how plants grow', 'how volcanoes erupt', 'how birds fly'], 'Think of the sea and light.', 'The Raman Effect is about the scattering of light.'],
          ['Which honour did Raman receive from India?', 'Bharat Ratna', ['Arjuna Award', 'Param Vir Chakra', 'Dronacharya Award'], 'India’s highest civilian award.', 'He was given the Bharat Ratna.'],
          ['What does Raman’s life mainly teach us?', 'Curiosity and hard work lead to discovery', ['Science is only for the rich', 'Questions are a waste of time', 'Travel is better than study'], 'He asked a simple question and worked hard.', 'His story shows the power of curiosity and effort.'],
        ]),
        orderT('life', ['Start with his birth.', 'The Nobel Prize came after the discovery.'], [
          ['Raman was born in 1888. | He worked in Kolkata. | He sailed to Europe in 1921. | He discovered the Raman Effect in 1928. | He won the Nobel Prize in 1930.', 'Follow the years in order.'],
          ['On a voyage to Europe, | Raman | wondered | why the sea is blue.', 'Time/place phrase → subject → verb → what he wondered.'],
          ['After his discovery, | the whole world | praised | the Indian scientist.', 'Time phrase → subject → verb → object.'],
          ['Every year, | India celebrates | National Science Day | on 28 February.', 'Time → subject + verb → what → when.'],
          ['Raman | was the first Asian | to win a Nobel Prize | in science.', 'Subject → was + who he was → to + verb → which field.'],
        ]),
        matchT('facts', 'item with the fact about it', [
          ['1888', 'Raman was born'], ['28 February 1928', 'Raman Effect discovered'], ['1930', 'Nobel Prize in Physics'], ['Bengaluru', 'Raman Research Institute'], ['Susruta', 'ancient Indian surgeon'], ['It’s Change…', 'poem about how everything keeps changing'],
        ], ['Dates go with events.', 'Susruta is from Reading C.']),
      ],
    },
    {
      id: 'ts7.en.nounform.vocab', title: 'Vocabulary: verbs and their noun forms; abbreviations', prereqs: [],
      intro: [
        h('From verb to noun'),
        p('Many verbs have a matching noun. Knowing both helps you write better sentences.'),
        keys('-tion / -sion: invent → invention, discover → discovery (not -tion!), decide → decision, explain → explanation', '-ment: achieve → achievement, move → movement', '-ance / -ence: perform → performance, depend → dependence', '-al: arrive → arrival, refuse → refusal', 'Some change more: choose → choice, die → death, succeed → success'),
        stepsB('Decide whether the gap needs a verb (an action) or a noun (a thing/idea).', 'Look at the word before the gap: "a/an/the/his" is usually followed by a noun.', 'Pick the correct ending and check the spelling.'),
        h('Abbreviations'),
        def('Abbreviation', 'A shortened form of a word or group of words: Dr. (Doctor), km (kilometre), ISRO (Indian Space Research Organisation).'),
        keys('Dr. = Doctor', 'Prof. = Professor', 'etc. = and so on', 'e.g. = for example', 'kg = kilogram', 'ISRO = Indian Space Research Organisation', 'UN = United Nations'),
        remember('Watch the spelling: discover → discovery; invent → invention; explain → explanation (no "i" after "pla").'),
      ],
      examples: [
        ex('Fill in with the noun form of "discover": Raman’s ____ made India proud.', ['"Raman’s" is followed by a noun.', 'discover → discovery'], 'Raman’s discovery made India proud.'),
        ex('Write the full form: "Dr. Raman visited ISRO."', ['Dr. → Doctor', 'ISRO → Indian Space Research Organisation'], 'Doctor Raman visited the Indian Space Research Organisation.'),
      ],
      practice: [
        mcq('noun', 'A noun usually follows "a", "the" or a possessive like "his".', [
          ['The ____ of the telephone changed the world. (invent)', 'invention', ['inventment', 'inventing', 'inventance'], 'invent takes -ion.', 'invent → invention.'],
          ['Winning the prize was a great ____. (achieve)', 'achievement', ['achievation', 'achievance', 'achieval'], 'This verb takes -ment.', 'achieve → achievement.'],
          ['We waited for the ____ of the train. (arrive)', 'arrival', ['arrivement', 'arrivation', 'arrivance'], 'This verb takes -al.', 'arrive → arrival.'],
          ['The teacher gave a clear ____. (explain)', 'explanation', ['explaination', 'explainment', 'explainance'], 'Watch the spelling.', 'explain → explanation (no i after pla).'],
          ['It was a difficult ____ to make. (decide)', 'decision', ['decidement', 'decition', 'decidal'], 'd changes to s.', 'decide → decision.'],
          ['The children gave a fine ____ on stage. (perform)', 'performance', ['performation', 'performment', 'performal'], 'This verb takes -ance.', 'perform → performance.'],
        ]),
        matchT('pairs', 'verb with its noun form', [
          ['discover', 'discovery'], ['choose', 'choice'], ['succeed', 'success'], ['move', 'movement'], ['refuse', 'refusal'], ['depend', 'dependence'],
        ], ['Say "the ____" with each noun to check it sounds right.', 'Some nouns change more than just the ending: choose → choice.']),
        matchT('abbr', 'abbreviation with its full form', [
          ['Dr.', 'Doctor'], ['Prof.', 'Professor'], ['e.g.', 'for example'], ['etc.', 'and so on'], ['km', 'kilometre'], ['ISRO', 'Indian Space Research Organisation'],
        ], ['Think where you have seen each one.', 'e.g. introduces an example; etc. ends a list.']),
      ],
    },
    {
      id: 'ts7.en.prep.art', title: 'Grammar: prepositions and articles', prereqs: [],
      intro: [
        h('Articles: a, an, the'),
        stepsB(
          'Use "a" before a consonant SOUND: a book, a university (sounds "yoo").',
          'Use "an" before a vowel SOUND: an apple, an hour (h is silent), an honest man.',
          'Use "the" for something already known or the only one: the sun, the Nobel Prize, the book I lent you.',
          'Use "the" before rivers, seas, oceans and superlatives: the Godavari, the Indian Ocean, the tallest tree.',
          'No article before most names of people, cities and languages: Raman, Hyderabad, Telugu.',
        ),
        h('Prepositions of time and place'),
        keys('at — a point: at 6 o’clock, at the gate', 'on — days, dates, surfaces: on Monday, on 28 February, on the table', 'in — months, years, inside spaces: in May, in 1930, in the box, in Kolkata', 'Other useful ones: under, between, beside, into, across, since (a starting point), for (a length of time)'),
        remember('It is the SOUND, not the letter, that decides a/an: an hour, a uniform, an MLA, a one-rupee coin.'),
        tip('Time trick: AT a clock time, ON a day or date, IN a month, year or season.'),
      ],
      examples: [
        ex('Fill in: Raman won ____ Nobel Prize ____ 1930.', ['The Nobel Prize is a particular, known prize → the.', 'A year takes "in".'], 'Raman won the Nobel Prize in 1930.'),
        ex('Fill in a/an: ____ honest boy returned ____ umbrella.', ['honest starts with a vowel sound (h is silent) → an.', 'umbrella starts with a vowel sound → an.'], 'An honest boy returned an umbrella.'),
      ],
      practice: [
        mcq('article', 'Listen to the first SOUND of the next word.', [
          ['Raman was ____ great scientist.', 'a', ['an', 'the', 'no article'], '"great" starts with a consonant sound.', 'a + consonant sound.'],
          ['We waited for ____ hour and then left.', 'an', ['a', 'the', 'no article'], 'The h in hour is silent.', 'hour begins with a vowel sound → an.'],
          ['____ sun rises in the east.', 'The', ['A', 'An', 'No article'], 'There is only one sun.', 'Unique things take "the".'],
          ['Raman had ____ unusual idea, and later ____ useful one. Choose the pair.', 'an, a', ['a, an', 'a, a', 'an, an'], 'Say both words aloud: "un-" and "yoo-".', 'unusual starts with a vowel sound → an; useful starts with a "yoo" (consonant) sound → a.'],
          ['____ Godavari flows through Telangana.', 'The', ['A', 'An', 'No article'], 'Rivers take an article.', 'Names of rivers take "the".'],
          ['Please give me ____ orange; any one will do.', 'an', ['a', 'the', 'no article'], 'orange starts with a vowel sound.', 'an + vowel sound.'],
        ]),
        mcq('prep', 'at = point, on = day/date/surface, in = month/year/inside.', [
          ['The school opens ____ 9 o’clock.', 'at', ['on', 'in', 'since'], 'A clock time.', 'Clock times take "at".'],
          ['National Science Day is ____ 28 February.', 'on', ['in', 'at', 'for'], 'A date.', 'Days and dates take "on".'],
          ['Raman was born ____ 1888.', 'in', ['on', 'at', 'for'], 'A year.', 'Years take "in".'],
          ['The cat is hiding ____ the bed.', 'under', ['at', 'since', 'during'], 'Below something.', 'under = below.'],
          ['I have lived here ____ 2020.', 'since', ['for', 'from', 'at'], 'A starting point in time.', '"since" + starting point; "for" + length of time.'],
          ['The mouse ran ____ its hole.', 'into', ['at', 'on', 'since'], 'Movement from outside to inside.', '"into" shows movement inside.'],
        ]),
        errT('spot', ['Check every a/an/the.', 'Check at/on/in with times.'], [
          ['Hyderabad | is | a capital | of Telangana.', 2, 'Hyderabad is the capital of Telangana.', 'A state has only one capital, so use "the".'],
          ['My sister | is an | doctor | in Warangal.', 1, 'My sister is a doctor in Warangal.', 'doctor starts with a consonant sound → a.'],
          ['We will meet | in Sunday | at the | bus stop.', 1, 'We will meet on Sunday at the bus stop.', 'Days take "on".'],
          ['The train | leaves | on 7 o’clock | every morning.', 2, 'The train leaves at 7 o’clock every morning.', 'Clock times take "at".'],
          ['I saw | a elephant | at the zoo | in Hyderabad.', 1, 'I saw an elephant at the zoo in Hyderabad.', 'elephant starts with a vowel sound → an.'],
        ]),
      ],
    },
    {
      id: 'ts7.en.bio.write', title: 'Writing: a short biography (bio-sketch)', prereqs: [],
      intro: [
        h('What is a bio-sketch?'),
        p('A bio-sketch is a short piece about a real person’s life. It is written in the third person (he, she) and mostly in the past tense.'),
        stepsB(
          'Introduction: name, who the person is, why they are famous.',
          'Early life: date and place of birth, family, school.',
          'Work and achievements: what they did, discoveries, awards.',
          'Qualities: two or three words with examples (curious, hard-working, kind).',
          'Conclusion: how they are remembered and what we can learn.',
        ),
        h('Model (our own, short)'),
        p('Srinivasa Ramanujan (1887–1920) was a self-taught Indian mathematician. He was born in Erode, Tamil Nadu, and loved numbers from a young age. With little formal training, he discovered thousands of results. He worked with Professor G.H. Hardy at Cambridge University and was elected a Fellow of the Royal Society. His birthday, 22 December, is celebrated as National Mathematics Day. His life shows that passion and hard work can overcome poverty.'),
        remember('Use facts in time order. Do not write "I" — a bio-sketch is about someone else.'),
      ],
      examples: [
        ex('Turn notes into a sentence: "C.V. Raman — born 1888 — Tiruchirappalli".', ['Use the past tense and the third person.'], 'C.V. Raman was born in 1888 in Tiruchirappalli.'),
        ex('Write a conclusion for a bio-sketch of Raman.', ['Say how he is remembered + a lesson.'], 'Raman is remembered every National Science Day; his life teaches us to keep asking questions.'),
      ],
      practice: [
        orderT('parts', ['Introduction first, conclusion last.', 'Birth comes before achievements.'], [
          ['Introduce the person | Early life and education | Work and achievements | Qualities | How they are remembered', 'A bio-sketch follows the person’s life in time order.'],
          ['Ramanujan was a great mathematician. | He was born in Erode in 1887. | He worked at Cambridge University. | We remember him on National Mathematics Day.', 'Who → birth → work → remembered.'],
          ['Kalpana Chawla | was born | in Karnal | in 1962.', 'Name → verb → place → year.'],
          ['After finishing school, | she | studied | engineering.', 'Time phrase → subject → verb → object.'],
          ['Her courage | still inspires | young people | across India.', 'Subject → verb → object → place.'],
        ]),
        mcq('style', 'A bio-sketch is factual, in the past tense and third person.', [
          ['Which sentence suits a bio-sketch?', 'She was born in a small village in 1915.', ['I was born in a village.', 'Click here to read more.', 'Dear friend, how are you?'], 'Third person + past tense.', 'Bio-sketches use he/she and the past tense.'],
          ['Which part usually comes first?', 'Name and why the person is famous', ['Their awards list', 'Your opinion of them', 'The date you wrote it'], 'Introduce the person.', 'Begin by saying who they are.'],
          ['Which tense is mostly used in a bio-sketch?', 'Simple past', ['Simple future', 'Imperative', 'Present continuous'], 'The events already happened.', 'A life story is told in the past tense.'],
          ['Which detail belongs under "early life"?', 'Place and date of birth', ['Major award', 'How the nation remembers them', 'Their last speech'], 'Early life = childhood.', 'Birth details belong in early life.'],
          ['Which is the best quality-sentence?', 'He was curious; even on holiday he kept asking questions about the sea.', ['He was good.', 'He was a person.', 'Science is nice.'], 'A quality + an example.', 'Give a quality and support it with an example.'],
        ]),
        matchT('section', 'detail with the section of the bio-sketch it belongs to', [
          ['Born in Erode in 1887', 'early life'], ['Won the Nobel Prize', 'achievements'], ['Always asked questions', 'qualities'], ['Remembered on National Science Day', 'conclusion'], ['A famous Indian scientist', 'introduction'],
        ], ['Think about which part of the life story each detail fits.', 'Awards are achievements; habits show qualities.']),
      ],
    },
  ],
};

// =====================================================================================
// Unit 3 — Courage (Puru, the Brave)
// =====================================================================================
const u3: USpec = {
  id: 'ts7.en.u3', subject: 'english', title: 'Unit 3: Courage and Pride', source: src(3),
  note: 'Reading A follows the well-known historical account of King Puru (Porus) and Alexander; teacher to check details against the textbook. Poem B (Tennyson) is summarised in our own words; Reading C (The Magic of Silk) is pleasure reading.',
  objectives: [
    {
      id: 'ts7.en.puru.read', title: 'Reading: Puru, the Brave', prereqs: [],
      intro: [
        h('The story behind the reading'),
        p('More than 2,300 years ago (326 BCE), Alexander of Macedonia, a young Greek king, marched into north-west India after winning many lands. King Puru (called Porus by the Greeks) ruled the land near the river Jhelum, in today’s Punjab.'),
        h('What happens (our summary)'),
        stepsB(
          'Some local kings gave in to Alexander without a fight, but Puru refused to bow down.',
          'Alexander’s army crossed the swollen river secretly at night, during heavy rain.',
          'Puru fought bravely with his soldiers and war elephants, but the muddy ground and Alexander’s skilled horsemen helped the Greeks win.',
          'Puru, tall and wounded, was brought before Alexander. Alexander asked him how he wished to be treated.',
          'Puru replied proudly that he wished to be treated as a king treats a king. Alexander admired his courage, gave him back his kingdom and made him a friend.',
        ),
        keys('Qualities of Puru: brave, proud, self-respecting, honest.', 'Quality of Alexander: he respected courage even in an enemy.', 'Message: true courage and self-respect win respect, even in defeat.'),
        h('Poem B: Home They Brought Her Warrior Dead'),
        p('This short poem by Alfred, Lord Tennyson (an English poet of the 1800s) is about a woman whose husband, a warrior, is brought home dead. She is so shocked that she cannot cry. The women around her fear for her life and try many ways to make her weep. At last an old nurse places the warrior’s little child on her lap, and her tears finally flow. The poem shows that grief that is held inside is dangerous, and that love for a child can open the heart.'),
        remember('Reading C, The Magic of Silk, is for enjoyment: it tells how silk comes from the cocoons of silkworms.'),
      ],
      examples: [
        ex('Why did Alexander return Puru’s kingdom?', ['Look at Puru’s proud reply.', 'Alexander admired courage.'], 'He was impressed by Puru’s courage and self-respect, shown in his reply that he should be treated as a king.'),
        ex('In the poem, what finally makes the woman weep?', ['Many things were tried first.', 'The old nurse brings something special.'], 'The old nurse places the warrior’s child on her lap.'),
      ],
      practice: [
        mcq('comp', 'Recall the events and the characters.', [
          ['Near which river did Puru rule?', 'The Jhelum', ['The Godavari', 'The Ganga', 'The Krishna'], 'It is in Punjab.', 'Puru’s kingdom lay near the river Jhelum.'],
          ['What did Puru say when asked how he wished to be treated?', 'As a king treats a king', ['As a prisoner', 'As a servant', 'He said nothing'], 'He kept his pride.', 'He asked to be treated as a king, showing self-respect.'],
          ['What helped Alexander win the battle?', 'The muddy ground and his skilled horsemen', ['Puru’s soldiers ran away', 'A peace treaty', 'A sudden fire'], 'Remember the heavy rain.', 'Rain and mud slowed Puru’s chariots and elephants.'],
          ['How did Alexander treat Puru in the end?', 'He gave back his kingdom and became his friend', ['He put him in prison', 'He sent him away from India', 'He made him a soldier'], 'Alexander respected courage.', 'He returned the kingdom out of respect.'],
          ['Which word best describes Puru?', 'Self-respecting', ['Cowardly', 'Greedy', 'Dishonest'], 'He would not bow down even after defeat.', 'Puru kept his dignity even as a prisoner.'],
          ['In Tennyson’s poem, why are the women worried?', 'The widow cannot cry, and they fear for her life', ['The warrior is lost', 'The child is ill', 'The house is on fire'], 'Grief held inside.', 'They believe she must weep or she will die of grief.'],
        ]),
        orderT('events', ['The march comes first.', 'The friendship comes last.'], [
          ['Alexander marched into India. | Puru refused to surrender. | The armies fought near the Jhelum. | Puru was brought before Alexander. | Alexander returned his kingdom.', 'March → refusal → battle → meeting → kingdom returned.'],
          ['Although he was wounded, | Puru | stood | tall and proud.', 'Although-clause → subject → verb → description.'],
          ['Alexander | admired | the courage | of the Indian king.', 'Subject → verb → object → of-phrase.'],
          ['Many kings surrendered, | but Puru | chose | to fight.', 'First clause → but → subject → verb → to + verb.'],
          ['The old nurse | placed | the child | on the widow’s lap.', 'Subject → verb → object → place.'],
        ]),
        matchT('who', 'character with the right description', [
          ['Puru', 'brave king who refused to surrender'], ['Alexander', 'young Greek king who respected courage'], ['Tennyson', 'English poet of "Home They Brought Her Warrior Dead"'], ['The old nurse', 'brings the child to the widow'], ['The warrior’s wife', 'too shocked to cry at first'],
        ], ['Two people are from the history story; three from the poem.', 'The poet is the writer, not a character.']),
      ],
    },
    {
      id: 'ts7.en.courage.vocab', title: 'Vocabulary: synonyms and antonyms of character words', prereqs: [],
      intro: [
        h('Words that describe character'),
        p('Stories like Puru’s are full of words that describe people. Learning their synonyms (same meaning) and antonyms (opposite meaning) helps you write better answers.'),
        def('Synonym', 'A word with the same or nearly the same meaning: brave – courageous.'),
        def('Antonym', 'A word with the opposite meaning: brave – cowardly.'),
        keys('brave = courageous, fearless ↔ cowardly, timid', 'proud (in a good way) = dignified ↔ humble/ashamed', 'honest = truthful ↔ dishonest', 'kind = generous ↔ cruel', 'wise = clever, sensible ↔ foolish', 'victory = win ↔ defeat'),
        stepsB('Read the word in its sentence.', 'Decide: is the question asking for SAME or OPPOSITE?', 'Test your choice by putting it in the sentence.'),
        remember('Some antonyms are made with prefixes: honest → dishonest, kind → unkind, possible → impossible.'),
      ],
      examples: [
        ex('Give a synonym of "fearless" from the list: timid, courageous, cruel.', ['fearless = without fear.', 'courageous = full of courage.'], 'courageous'),
        ex('Give the antonym of "victory".', ['Victory = winning a battle.', 'The opposite is losing.'], 'defeat'),
      ],
      practice: [
        mcq('syn', 'Synonym = SAME meaning.', [
          ['Choose the synonym of "brave".', 'courageous', ['cowardly', 'lazy', 'weak'], 'Puru was this.', 'brave = courageous.'],
          ['Choose the synonym of "honest".', 'truthful', ['clever', 'rude', 'tired'], 'Telling the truth.', 'honest = truthful.'],
          ['Choose the synonym of "huge".', 'enormous', ['tiny', 'narrow', 'pale'], 'Think of a war elephant.', 'huge = enormous.'],
          ['Choose the synonym of "wise".', 'sensible', ['foolish', 'noisy', 'fast'], 'A wise king makes good decisions.', 'wise = sensible.'],
          ['Choose the synonym of "begin".', 'start', ['finish', 'stop', 'delay'], 'The battle began at dawn.', 'begin = start.'],
          ['Choose the synonym of "angry".', 'furious', ['calm', 'cheerful', 'sleepy'], 'Very cross.', 'angry = furious.'],
        ]),
        mcq('ant', 'Antonym = OPPOSITE meaning.', [
          ['Choose the antonym of "brave".', 'cowardly', ['bold', 'strong', 'fearless'], 'Opposite of having courage.', 'brave ↔ cowardly.'],
          ['Choose the antonym of "victory".', 'defeat', ['success', 'prize', 'battle'], 'Losing.', 'victory ↔ defeat.'],
          ['Choose the antonym of "kind".', 'cruel', ['gentle', 'generous', 'friendly'], 'Opposite of caring.', 'kind ↔ cruel.'],
          ['Choose the antonym of "ancient".', 'modern', ['old', 'historic', 'dusty'], 'Ancient = very old.', 'ancient ↔ modern.'],
          ['Choose the antonym of "honest".', 'dishonest', ['unhonest', 'truthful', 'fair'], 'Add the right prefix.', 'honest ↔ dishonest.'],
          ['Choose the antonym of "enemy".', 'friend', ['rival', 'soldier', 'stranger'], 'Alexander and Puru became this.', 'enemy ↔ friend.'],
        ]),
        matchT('pairs', 'word with its antonym', [
          ['brave', 'cowardly'], ['victory', 'defeat'], ['wise', 'foolish'], ['proud', 'ashamed'], ['ancient', 'modern'], ['strong', 'weak'],
        ], ['Antonyms are opposites.', 'Say each pair aloud: "brave, not cowardly".']),
      ],
    },
    {
      id: 'ts7.en.should.must', title: 'Grammar: "should" and "must"', prereqs: [],
      intro: [
        h('Advice or a strong rule?'),
        def('should', 'Gives ADVICE or says what is the right thing to do: You should drink more water.'),
        def('must', 'Shows a STRONG NEED, a rule or a duty: Students must wear their ID cards. You must stop at a red light.'),
        h('The rules'),
        stepsB(
          'After should / must, use the base form of the verb: should go, must be (not "must goes", "should to go").',
          'They do not change with the subject: I must, she must, they must.',
          'Negative: should not (shouldn’t) = it is a bad idea; must not (mustn’t) = it is not allowed.',
          'Questions: Should I take an umbrella? (asking for advice).',
        ),
        keys('Advice → should: You should revise your notes before the test.', 'Rule / law → must: Drivers must wear seat belts.', 'Strong personal duty → must: I must finish my homework tonight.'),
        remember('"mustn’t" means "not allowed", NOT "not necessary". You mustn’t cross here (forbidden).'),
      ],
      examples: [
        ex('Choose should or must: "Passengers ____ show their tickets." (a railway rule)', ['It is a rule, not advice.'], 'Passengers must show their tickets.'),
        ex('Choose should or must: "You look tired. You ____ rest for a while."', ['This is friendly advice.'], 'You should rest for a while.'),
        ex('Correct: "She must to finish her project."', ['After must, use the base verb without "to".'], 'She must finish her project.'),
      ],
      practice: [
        mcq('choose', 'Is it advice (should) or a rule / strong need (must)?', [
          ['You ____ wear a helmet while riding a bike. It is the law.', 'must', ['should', 'may', 'might'], 'It is the law.', 'Laws and rules take must.'],
          ['You have a cough. You ____ drink warm water.', 'should', ['must not', 'mustn’t', 'may not'], 'This is advice from a friend.', 'Friendly advice takes should.'],
          ['Visitors ____ not touch the paintings in the museum.', 'must', ['should to', 'musts', 'shall to'], 'It is a museum rule.', 'must not = forbidden by a rule.'],
          ['The film is good. You ____ watch it.', 'should', ['must not', 'mustn’t', 'shouldn’t'], 'A suggestion.', 'Recommendations use should.'],
          ['All students ____ wear the school uniform on Monday.', 'must', ['should not', 'mustn’t', 'shouldn’t'], 'A school rule.', 'Rules use must.'],
          ['You ____ eat so many sweets; they are bad for your teeth.', 'shouldn’t', ['must', 'should', 'ought'], 'Advice not to do something.', 'shouldn’t = it is not a good idea.'],
        ]),
        errT('spot', ['After should/must, use the base verb.', 'should/must never take -s.'], [
          ['You | should to | revise | your lessons daily.', 1, 'You should revise your lessons daily.', 'No "to" after should.'],
          ['She | musts | finish | her work before dinner.', 1, 'She must finish her work before dinner.', 'must never takes -s.'],
          ['We | must | goes | to school on time.', 2, 'We must go to school on time.', 'After must, use the base verb: go.'],
          ['Ravi | should | eating | more vegetables.', 2, 'Ravi should eat more vegetables.', 'After should, use the base verb: eat.'],
          ['Drivers | must | stopping | at a red light.', 2, 'Drivers must stop at a red light.', 'must + base verb: stop.'],
        ]),
        mcq('meaning', 'Think about what each sentence really means.', [
          ['"You mustn’t swim in this lake." This means…', 'Swimming here is not allowed.', ['Swimming here is a good idea.', 'You can swim if you like.', 'You need to swim.'], 'mustn’t = forbidden.', 'must not shows something is not allowed.'],
          ['"You should visit Ramappa Temple." This is…', 'a piece of advice', ['a strict law', 'a question', 'a warning of danger'], 'Should gives advice.', 'should = advice / recommendation.'],
          ['Which sentence shows a rule?', 'Players must not touch the ball with their hands.', ['You should try the new dosa shop.', 'Maybe we should leave early.', 'You should sleep early.'], 'Look for must.', 'must not = a rule of the game.'],
          ['Which sentence asks for advice?', 'Should I take an umbrella today?', ['I must take an umbrella.', 'Take your umbrella.', 'He has an umbrella.'], 'A question with should.', '"Should I…?" asks for advice.'],
          ['"I must finish my homework tonight." The speaker feels…', 'a strong need to do it', ['no need to do it', 'that it is forbidden', 'unsure about it'], 'must = strong need.', 'must shows a strong personal duty.'],
        ]),
      ],
    },
    {
      id: 'ts7.en.story.write', title: 'Writing: a story from an outline', prereqs: [],
      intro: [
        h('How a story is built'),
        stepsB(
          'Title: short and interesting.',
          'Beginning: introduce the characters and the place (who, where, when).',
          'Problem: something goes wrong or a challenge appears.',
          'Middle: what the characters do; build up the action.',
          'Climax and ending: how the problem is solved.',
          'Moral (if asked): one sentence with the lesson.',
        ),
        keys('Write in the past tense: lived, decided, ran.', 'Use linkers: once upon a time, one day, suddenly, then, at last, finally.', 'Add a little dialogue: "Help!" cried the deer.'),
        h('Model (our own, from an outline)'),
        p('Outline: a crow — thirsty — pot with little water — drops pebbles — water rises — drinks. Story: The Clever Crow. One hot summer afternoon, a crow was very thirsty. It flew everywhere looking for water. At last it found a pot, but the water was at the very bottom. The crow thought hard. Then it picked up pebbles one by one and dropped them into the pot. Slowly the water rose to the top, and the crow drank happily. Moral: Where there is a will, there is a way.'),
        remember('Common mistakes: switching between past and present tense; no clear ending; adding a moral that does not match the story.'),
      ],
      examples: [
        ex('Write a beginning line for: "a lion — sleeping — a mouse — runs over him".', ['Introduce who, where, when.', 'Use the past tense.'], 'Once upon a time, a mighty lion was sleeping under a tree in the forest.'),
        ex('Give a moral for a story where a small mouse later saves the lion.', ['The small one helps the big one.'], 'No act of kindness is ever wasted / Even the small can help the great.'),
      ],
      practice: [
        orderT('plot', ['The beginning introduces the character.', 'The moral comes last.'], [
          ['A crow was very thirsty. | It found a pot with little water. | It dropped pebbles into the pot. | The water rose and it drank. | Where there is a will, there is a way.', 'Character → problem → action → solution → moral.'],
          ['Once upon a time, | a lion | was sleeping | under a tree.', 'Opening phrase → subject → verb → place.'],
          ['Suddenly, | a hunter’s net | fell | on the lion.', 'Linker → subject → verb → place.'],
          ['The little mouse | cut the net | and | the lion was free.', 'Action → and → result.'],
          ['Title | Beginning | Problem | Solution | Moral', 'Stories follow this shape.'],
        ]),
        mcq('craft', 'A good story has a clear beginning, problem and ending.', [
          ['Which is the best opening for a story?', 'One rainy evening, Teja heard a strange noise in the garden.', ['The end.', 'Rain is water.', 'Teja is my name.'], 'Who, when and a hint of action.', 'It introduces a character, a time and a mystery.'],
          ['Which linker best shows something unexpected?', 'Suddenly', ['Firstly', 'Therefore', 'Also'], 'An unexpected moment.', '"Suddenly" introduces a surprise.'],
          ['Which tense is usually used to tell a story?', 'Simple past', ['Simple future', 'Imperative', 'Present perfect continuous'], 'The story already happened.', 'Stories are mostly told in the past tense.'],
          ['Which moral fits a story about a hare who loses a race because he slept?', 'Slow and steady wins the race.', ['Never trust a friend.', 'Greed is bad.', 'Look before you leap.'], 'Who won and why?', 'The steady tortoise wins; the moral praises steady effort.'],
          ['Which sentence adds dialogue?', '"Please help me!" cried the little deer.', ['The deer was little.', 'The deer lived in a forest.', 'Deer eat grass.'], 'Look for speech marks.', 'Dialogue is shown with speech marks.'],
        ]),
        matchT('linkers', 'story moment with the best linker', [
          ['starting the story', 'Once upon a time'], ['a surprise', 'Suddenly'], ['the next event', 'Then'], ['the final event', 'At last'], ['a later day', 'The next morning'],
        ], ['Think about when each linker is used.', '"At last" suggests a long wait is over.']),
      ],
    },
  ],
};

// =====================================================================================
// Unit 4 — Wit and humour (Tenali Paints a Horse)
// =====================================================================================
const u4: USpec = {
  id: 'ts7.en.u4', subject: 'english', title: 'Unit 4: Wit and Humour', source: src(4),
  note: 'Reading A is taught through Tenali Raman’s background and the general shape of the tale; the exact plot details are not summarised — teacher to read the story with the class and confirm. Poem B (Dear Mum) is taught at theme level. Reading C (The Emperor’s New Clothes) is the well-known Andersen tale.',
  objectives: [
    {
      id: 'ts7.en.tenali.read', title: 'Reading: Tenali Paints a Horse; The Emperor’s New Clothes', prereqs: [],
      intro: [
        h('Who was Tenali Raman?'),
        p('Tenali Ramakrishna (often called Tenali Raman or Tenali Rama) was a Telugu poet in the court of King Krishnadevaraya of the Vijayanagara Empire in the 1500s. He was one of the king’s eight great poets, the Ashtadiggajas. Hundreds of folk tales are told about his quick wit — how he used clever thinking and humour to solve problems and to teach proud or greedy people a lesson.'),
        h('Reading A: Tenali Paints a Horse'),
        p('In this tale, Tenali is set a painting challenge about a horse. Instead of doing what everyone expects, he finds a clever, funny answer that shows the challenge itself was unfair. Read the story with your teacher and look for: (1) the challenge, (2) Tenali’s trick, (3) how the people at court react.'),
        h('Poem B: Dear Mum'),
        p('This light, funny poem is written as a note from a child to their mother. While Mum was out, lots of things went wrong at home, and the child gives silly, imaginative excuses that blame everyone and everything except themselves. The humour is in how obvious the real story is.'),
        h('Reading C: The Emperor’s New Clothes'),
        p('In this famous tale by the Danish writer Hans Christian Andersen, two cheats tell a vain emperor they can weave magic cloth that is invisible to foolish people. Nobody — not even the emperor — wants to look foolish, so all pretend to see the cloth. The emperor walks through the town wearing nothing, until a small child calls out the truth. Everyone then laughs.'),
        keys('Wit = quick, clever humour.', 'Both Tenali and the child in Andersen’s tale show that honest, clear thinking defeats pride and pretence.'),
        def('Vain', 'Too proud of one’s looks or importance.'),
      ],
      examples: [
        ex('Why did nobody tell the emperor the truth?', ['The cheats said only fools could not see the cloth.', 'Nobody wanted to look foolish.'], 'Everyone was afraid of being called foolish, so they pretended to see the cloth.'),
        ex('Who was Tenali Raman?', ['Think of his job and his king.'], 'A witty Telugu poet in the court of King Krishnadevaraya of Vijayanagara.'),
      ],
      practice: [
        mcq('comp', 'Recall the stories and the poem.', [
          ['In whose court did Tenali Raman serve?', 'King Krishnadevaraya', ['Emperor Akbar', 'King Puru', 'Emperor Ashoka'], 'Vijayanagara Empire.', 'Tenali Raman was a poet in Krishnadevaraya’s court.'],
          ['Tenali Raman is best known for his…', 'quick wit', ['great strength', 'skill in war', 'singing voice'], 'He solved problems cleverly.', 'Folk tales praise his clever humour.'],
          ['What did the cheats claim about their cloth?', 'Foolish people could not see it', ['It was made of gold', 'It could fly', 'It never got dirty'], 'Why did everyone pretend?', 'They said it was invisible to fools.'],
          ['Who told the truth about the emperor’s clothes?', 'A small child', ['The prime minister', 'The cheats', 'The emperor himself'], 'Someone with nothing to fear.', 'A child, with no reason to pretend, spoke the truth.'],
          ['Who wrote "The Emperor’s New Clothes"?', 'Hans Christian Andersen', ['Aesop', 'Tennyson', 'Tenali Raman'], 'A Danish writer of fairy tales.', 'Andersen wrote this famous tale.'],
          ['In "Dear Mum", what is funny about the child’s note?', 'The child gives silly excuses for everything that went wrong', ['The child confesses honestly', 'The mother writes back angrily', 'The note is about a holiday'], 'Who does the child blame?', 'The silly excuses make the poem humorous.'],
        ]),
        matchT('who', 'person with the right description', [
          ['Tenali Raman', 'witty poet of Vijayanagara'], ['Krishnadevaraya', 'king of Vijayanagara'], ['Andersen', 'Danish writer of fairy tales'], ['The child in Andersen’s tale', 'said the emperor had nothing on'], ['The emperor', 'too vain to admit he saw nothing'], ['The weavers', 'cheats who sold invisible cloth'],
        ], ['Two are from Tenali’s world; the rest from Andersen’s tale.', 'Vain = too proud.']),
        orderT('events', ['The cheats arrive first.', 'The laughter comes at the end.'], [
          ['Two cheats came to the palace. | They pretended to weave magic cloth. | Everyone pretended to see it. | The emperor walked through the town. | A child shouted the truth.', 'Arrival → trick → pretending → parade → truth.'],
          ['Nobody | wanted | to look foolish | in front of others.', 'Subject → verb → to + verb → phrase.'],
          ['When the child spoke, | the whole crowd | began | to laugh.', 'Time clause → subject → verb → to + verb.'],
          ['Tenali Raman | used | his quick wit | to solve problems.', 'Subject → verb → object → purpose.'],
          ['While Mum was out, | many things | went wrong | at home.', 'Time clause → subject → verb → place.'],
        ]),
      ],
    },
    {
      id: 'ts7.en.phrasal.vocab', title: 'Vocabulary: phrasal verbs', prereqs: [],
      intro: [
        h('Verb + small word = new meaning'),
        def('Phrasal verb', 'A verb + a small word (up, down, off, out, on, after…) that together have a new meaning.'),
        keys('look after = take care of', 'look for = search for', 'give up = stop trying', 'put on = wear', 'take off = remove (clothes) / leave the ground (plane)', 'turn on / turn off = switch on / switch off', 'find out = discover information', 'get up = rise from bed', 'run away = escape', 'carry on = continue'),
        stepsB('Read the whole sentence.', 'Treat the verb + small word as ONE meaning.', 'Replace it with a simple word to check (search, wear, continue).'),
        remember('Changing the small word changes the meaning: put on (wear) ≠ put off (postpone); look after (care) ≠ look for (search).'),
      ],
      examples: [
        ex('What does "put on" mean in: "The emperor put on his new robe"?', ['Clothes are involved.'], 'put on = wear'),
        ex('Replace with a phrasal verb: "Please continue your work."', ['continue = carry on'], 'Please carry on with your work.'),
      ],
      practice: [
        mcq('meaning', 'Replace the phrasal verb with a simple word.', [
          ['Grandma looks after our cow. "Looks after" means…', 'takes care of', ['searches for', 'sells', 'follows'], 'Caring for an animal.', 'look after = take care of.'],
          ['I am looking for my lost pen. "Looking for" means…', 'searching for', ['caring for', 'writing with', 'buying'], 'The pen is lost.', 'look for = search for.'],
          ['Don’t give up; try once more. "Give up" means…', 'stop trying', ['start again', 'shout', 'win'], 'Try once more.', 'give up = stop trying.'],
          ['Please turn off the fan. "Turn off" means…', 'switch off', ['switch on', 'clean', 'repair'], 'Stop the fan.', 'turn off = switch off.'],
          ['The thief ran away from the police. "Ran away" means…', 'escaped', ['returned', 'waited', 'surrendered'], 'Getting away.', 'run away = escape.'],
          ['Let us find out who broke the vase. "Find out" means…', 'discover', ['hide', 'repair', 'buy'], 'Learning the truth.', 'find out = discover information.'],
        ]),
        mcq('particle', 'Pick the small word that gives the right meaning.', [
          ['It is cold. Put ____ your sweater.', 'on', ['off', 'up', 'away'], 'You want to wear it.', 'put on = wear.'],
          ['I get ____ at six every morning.', 'up', ['on', 'off', 'away'], 'Rising from bed.', 'get up = rise from bed.'],
          ['The plane will take ____ at noon.', 'off', ['on', 'up', 'after'], 'The plane leaves the ground.', 'take off = leave the ground.'],
          ['Please carry ____ reading; I will be back soon.', 'on', ['off', 'up', 'away'], 'Continue.', 'carry on = continue.'],
          ['Turn ____ the light; it is dark here.', 'on', ['off', 'away', 'after'], 'You need light.', 'turn on = switch on.'],
        ]),
        matchT('pairs', 'phrasal verb with its meaning', [
          ['look after', 'take care of'], ['look for', 'search for'], ['give up', 'stop trying'], ['put on', 'wear'], ['run away', 'escape'], ['find out', 'discover'],
        ], ['Say each one in a sentence first.', 'look after ≠ look for.']),
      ],
    },
    {
      id: 'ts7.en.adverb.manner', title: 'Grammar: adverbs of manner', prereqs: [],
      intro: [
        h('How is something done?'),
        def('Adverb of manner', 'A word that tells HOW an action is done: Tenali answered cleverly. The child spoke loudly.'),
        h('Forming adverbs of manner'),
        stepsB(
          'Most adjectives: add -ly → quick → quickly, sad → sadly.',
          'Adjective ends in -y: change y to i, then add -ly → happy → happily, easy → easily.',
          'Adjective ends in -le: drop e, add -y → gentle → gently, simple → simply.',
          'Adjective ends in -ic: add -ally → basic → basically.',
          'Irregular: good → well; fast → fast; hard → hard (NOT "hardly", which means "almost not").',
        ),
        keys('Adjective describes a noun: a careful painter.', 'Adverb describes a verb: The painter worked carefully.', 'Position: usually after the verb, or after the object: She painted the horse carefully.'),
        remember('"He did good" ✗ → "He did well" ✓. "good" is an adjective; "well" is the adverb.'),
      ],
      examples: [
        ex('Make an adverb from "happy" and use it: The children played ____.', ['happy ends in y → happily.'], 'The children played happily.'),
        ex('Adjective or adverb? "Meena is a fast runner." / "Meena runs fast."', ['First: describes "runner" (noun) → adjective.', 'Second: describes "runs" (verb) → adverb (fast does not change).'], 'First: adjective; second: adverb.'),
      ],
      practice: [
        mcq('form', 'Follow the spelling rule for -ly.', [
          ['The adverb of "happy" is…', 'happily', ['happyly', 'happly', 'happy'], 'y → i + ly.', 'happy → happily.'],
          ['The adverb of "gentle" is…', 'gently', ['gentlely', 'gentily', 'gentle'], 'Drop e, add y.', 'gentle → gently.'],
          ['The adverb of "good" is…', 'well', ['goodly', 'better', 'good'], 'It is irregular.', 'good → well.'],
          ['The adverb of "careful" is…', 'carefully', ['carefuly', 'carefulley', 'carefull'], 'Just add -ly.', 'careful + ly = carefully (double l).'],
          ['The adverb of "easy" is…', 'easily', ['easyly', 'easly', 'easely'], 'y → i + ly.', 'easy → easily.'],
          ['The adverb of "fast" is…', 'fast', ['fastly', 'faster', 'fastily'], 'Some adverbs do not change.', 'fast stays fast.'],
        ]),
        mcq('fill', 'Does the gap describe a noun (adjective) or an action (adverb)?', [
          ['Tenali answered the king ____.', 'cleverly', ['clever', 'cleverness', 'more clever'], 'How did he answer?', 'Describes the verb "answered" → adverb.'],
          ['The old man walked ____ with his stick.', 'slowly', ['slow', 'slowness', 'slower than'], 'How did he walk?', 'Describes "walked" → slowly.'],
          ['Kavya sang ____ at the annual day.', 'beautifully', ['beautiful', 'beauty', 'beautify'], 'How did she sing?', 'Describes "sang" → beautifully.'],
          ['The emperor walked ____ through the streets.', 'proudly', ['proud', 'pride', 'prouder'], 'How did he walk?', 'Describes "walked" → proudly.'],
          ['Arjun did ____ in the exam.', 'well', ['good', 'goodly', 'best'], 'Use the adverb of good.', 'did well (not "did good").'],
          ['Please close the door ____; the baby is asleep.', 'quietly', ['quiet', 'quietness', 'quieter'], 'How should you close it?', 'Describes "close" → quietly.'],
        ]),
        errT('spot', ['Find the word that should describe the action.', 'Check the -ly spelling.'], [
          ['The children | played | happy | in the park.', 2, 'The children played happily in the park.', 'An action needs an adverb: happily.'],
          ['Sana | speaks English | very good | these days.', 2, 'Sana speaks English very well these days.', 'good → well when describing an action.'],
          ['The nurse | lifted the baby | gentlely | from the cot.', 2, 'The nurse lifted the baby gently from the cot.', 'gentle → gently (drop e, add y).'],
          ['The emperor | walked | proud | through the town.', 2, 'The emperor walked proudly through the town.', 'Describing how he walked needs proudly.'],
          ['Ravi | ran | quick | to catch the bus.', 2, 'Ravi ran quickly to catch the bus.', 'Describing how he ran needs quickly.'],
        ]),
      ],
    },
    {
      id: 'ts7.en.note.write', title: 'Writing: a short note, with short forms (contractions)', prereqs: [],
      intro: [
        h('Short forms (contractions)'),
        p('In friendly writing — notes, messages, dialogue — we often join two words and use an apostrophe (’) for the missing letters.'),
        keys('I am → I’m · you are → you’re · he is → he’s · it is → it’s', 'do not → don’t · does not → doesn’t · did not → didn’t', 'can not / cannot → can’t · will not → won’t (special!) · shall not → shan’t', 'I have → I’ve · they will → they’ll · we would → we’d · let us → let’s'),
        stepsB('Find the two words.', 'Drop the missing letter(s).', 'Put the apostrophe exactly where the letters were dropped.'),
        remember('it’s = it is; its = belonging to it (no apostrophe). The dog wagged its tail. It’s raining.'),
        h('Writing a short note'),
        stepsB('Date / time (top).', 'Greeting: Dear Mum, / Hi Ravi,', 'Message: what happened or what you want — 3–5 short sentences.', 'Closing: Love, / See you soon,', 'Your name.'),
        p('Model (our own): 14 Nov, 4 pm. Dear Mum, I’ve gone to Kiran’s house to finish our science project. Don’t worry — I’ll be back by six. I’ve fed the cat and locked the back door. Love, Teja.'),
      ],
      examples: [
        ex('Write the short form of "will not".', ['This one is irregular.'], 'won’t'),
        ex('Expand the short forms: "I’ve finished and I’m going out."', ['I’ve = I have; I’m = I am.'], 'I have finished and I am going out.'),
      ],
      practice: [
        mcq('short', 'Put the apostrophe where letters are missing.', [
          ['The short form of "do not" is…', 'don’t', ['do’nt', 'dont’', 'don’t’'], 'The missing letter is o of not.', 'do + n’t = don’t.'],
          ['The short form of "will not" is…', 'won’t', ['willn’t', 'wo’nt', 'will’t'], 'This one is special.', 'will not → won’t.'],
          ['The short form of "I am" is…', 'I’m', ['Im’', 'I’am', 'Ia’m'], 'The a is missing.', 'I am → I’m.'],
          ['The short form of "they will" is…', 'they’ll', ['the’yll', 'theyl’l', 'they’ill'], 'wi is missing.', 'they will → they’ll.'],
          ['The short form of "let us" is…', 'let’s', ['lets’', 'le’ts', 'let’us'], 'u is missing.', 'let us → let’s.'],
          ['The short form of "cannot" is…', 'can’t', ['ca’nt', 'cann’t', 'cant’'], 'no is missing.', 'cannot → can’t.'],
        ]),
        matchT('expand', 'short form with its full form', [
          ['I’ve', 'I have'], ['she’s', 'she is'], ['didn’t', 'did not'], ['we’d', 'we would'], ['won’t', 'will not'], ['shan’t', 'shall not'],
        ], ['The apostrophe shows where letters were dropped.', 'won’t is irregular.']),
        mcq('note', 'A note is short, friendly and clear.', [
          ['Choose the correct sentence.', 'It’s raining, so the cat is licking its paws indoors.', ['Its raining, so the cat is licking it’s paws indoors.', 'It’s raining, so the cat is licking it’s paws indoors.', 'Its raining, so the cat is licking its paws indoors.'], 'it’s = it is; its = belonging to it.', 'Use it’s for "it is" and its for possession.'],
          ['Which is the best closing for a note to your mother?', 'Love, Teja', ['Yours faithfully, Teja', 'Sir, Teja', 'The End'], 'Warm and short.', 'Notes to family end warmly.'],
          ['Which sentence is most suitable for a note?', 'I’ve gone to the market. I’ll be back by five.', ['Respected Madam, I humbly beg to state…', 'Chapter 1: My Trip', 'Once upon a time there lived a king.'], 'Short and clear.', 'Notes give short, useful information.'],
          ['What should a note to Mum usually say first?', 'Where you have gone or what has happened', ['Your full postal address', 'A poem', 'A list of your marks'], 'What does Mum need to know?', 'Put the main message first.'],
          ['Choose the correct sentence.', 'Don’t worry; I won’t be late.', ['Dont worry; I wont be late.', 'Do’nt worry; I wo’nt be late.', 'Don’t worry; I willn’t be late.'], 'Check every apostrophe.', 'don’t and won’t are the correct short forms.'],
        ]),
      ],
    },
  ],
};

export const units: USpec[] = [u1, u2, u3, u4];
