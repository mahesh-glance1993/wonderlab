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

export const units: USpec[] = [u1, u2];
