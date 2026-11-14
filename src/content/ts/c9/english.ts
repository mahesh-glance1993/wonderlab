// Telangana SCERT Class 9 — English ("Our World Through English", 8 thematic units). Original teaching aligned to
// the official chapter list (src/content/ts/books.ts, syllabus.json). COPYRIGHT: no textbook passage, poem or play
// text is reproduced. Readings are taught ABOUT (author, context, our own summary, themes, devices); every grammar
// example and exercise sentence is original.
import {
  tp, ex, p, h, tip, def, keys, remember, stepsB, choose, matching, ordering,
  type USpec, type TSpec,
} from '../../lib/kit';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(9, 'english', n);
const ELIM = 'Rule out the options that clearly do not fit, then compare the last two carefully.';

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
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair is mismatched. Check each left item on its own, then use elimination for the rest.' }],
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
    type: 'order', prompt: 'Put the word groups in order to make a correct sentence.', ...ordering(r, parts), hints,
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
    type: 'mcq', prompt: `Spot the error. Which part of this sentence has a mistake? "${parts.join(' ')}"`, choices,
    answer: { kind: 'choice', correct: choices[bad].id }, hints,
    mistakes: [{ when: 'wrong', explain: `That part is correct. ${why}` }],
    solution: [`The error is in part (${'ABCDEFGH'[bad]}): "${parts[bad]}".`, `Correct sentence: ${fixed}`, why],
  };
}, d);

// =====================================================================================
// Unit 1 — Humour
// =====================================================================================
const u1: USpec = {
  id: 'ts9.en.u1', subject: 'english', title: 'Humour', source: src(1),
  note: 'Reading C (Little Bobby) is named but not summarised here; teacher to introduce it in class and apply the humour-spotting skills from this unit.',
  objectives: [
    {
      id: 'ts9.en.snake.read', title: 'Reading: The Snake and the Mirror', prereqs: [],
      intro: [
        h('About the story'),
        p('The Snake and the Mirror is a humorous true-to-life story by Vaikom Muhammad Basheer (1908–1994), one of the best-loved writers of Malayalam. It was translated into English. Basheer is famous for telling serious moments in a light, self-mocking way.'),
        def('Narrator', 'A young, poor homeopathic doctor who lives alone in a small rented room. He tells the story himself (first person), so we see his fear and his silly thoughts from the inside.'),
        h('What happens (our summary)'),
        stepsB(
          'On a hot night the doctor comes home, lights a lamp and looks at himself in the mirror. He admires his face and makes grand plans: to shave neatly, grow a fine moustache and marry a rich, well-earning wife.',
          'Suddenly a snake drops from the rafters onto his shoulder and wraps itself around his arm.',
          'Terrified, he sits absolutely still, "like a stone statue", and prays silently. His breath almost stops.',
          'The snake slides down and moves towards the mirror. It seems to admire its own reflection.',
          'The doctor quietly escapes from the room. The next morning, neighbours help to clear the room, and he finds that the snake has gone — but so have some of his things.',
        ),
        h('Where is the humour?'),
        keys(
          'Self-mockery: the narrator laughs at his own vanity — a poor man dreaming of a rich wife while admiring his face.',
          'Irony: the man who was busy admiring himself in the mirror is replaced at the mirror by a snake doing the same.',
          'Exaggeration: he describes his fear in comic, larger-than-life terms.',
          'Contrast: deadly danger is told in a calm, chatty voice.',
        ),
        remember('Themes: vanity and its foolishness, fear in the face of danger, and laughing at oneself. Exam answers should link each theme to an event in the story.'),
        tip('When asked "Why is the story humorous?", give one device (irony, self-mockery, exaggeration) and one example from the plot.'),
      ],
      examples: [
        ex('Why does the snake going to the mirror make the story funny?', ['Remember what the doctor was doing just before the snake fell: admiring his own face.', 'Now the snake seems to admire itself in the same mirror.', 'This reversal is irony — the vain man is "replaced" by a vain snake.'], 'It is ironic: the snake copies the doctor’s own vanity, making his self-admiration look silly.'),
        ex('Pick the best word for the narrator’s state when the snake coils around his arm: (a) relaxed (b) paralysed with fear (c) angry.', ['He sat still and hardly breathed.', 'He was not calm by choice — he was too frightened to move.'], '(b) paralysed with fear'),
      ],
      practice: [
        mcq('comp', 'Think about the order of events in the story.', [
          ['What was the narrator’s profession?', 'A homeopathic doctor', ['A school teacher', 'A snake charmer', 'A shopkeeper'], 'He treated patients with homeopathy.', 'The narrator is a young homeopath with a small income.'],
          ['What was the narrator doing just before the snake fell on him?', 'Looking at himself in the mirror', ['Cooking his dinner', 'Reading a medical book aloud', 'Locking the front door'], 'The title links the snake and the mirror.', 'He was admiring his face in the mirror and dreaming about his future.'],
          ['How did the narrator react when the snake coiled around his arm?', 'He sat perfectly still and prayed', ['He shouted for the neighbours', 'He struck the snake with a stick', 'He ran out at once'], 'He compares himself to a statue.', 'He froze completely, too afraid to move, and prayed silently.'],
          ['Where did the snake go after leaving the narrator’s arm?', 'Towards the mirror', ['Into a cooking pot', 'Out of the window', 'Under the bed'], 'Remember the irony in the story.', 'The snake moved to the mirror, as if admiring its own reflection.'],
          ['What kind of wife did the narrator dream of marrying?', 'A rich woman who earned well', ['A famous singer', 'A woman from his own village', 'A snake charmer’s daughter'], 'His dreams show his vanity and his poverty.', 'He imagined marrying a wealthy, well-earning woman — a comic dream for a poor man.'],
          ['Which theme best fits the story?', 'The foolishness of vanity', ['The value of hard work in farming', 'The joy of travel', 'Loyalty between friends'], 'What is the narrator mocking about himself?', 'The narrator laughs at his own self-admiration — vanity is the central target of the humour.'],
        ]),
        orderT('events', ['Start with what the doctor was doing at home.', 'The snake falls before he freezes.'], [
          ['The doctor admired himself in the mirror. | Then a snake fell onto his shoulder. | He sat as still as a statue. | Finally, he slipped out of the room.', 'Mirror → snake falls → he freezes → he escapes.'],
          ['After lighting the lamp, | the doctor looked into the mirror | and dreamt of a rich wife.', 'A time phrase opens the sentence, then the main action, then what he dreamt.'],
          ['The frightened narrator | did not move | while the snake | coiled around his arm.', 'Subject → verb → while-clause with its own subject and verb.'],
        ]),
        matchT('devices', 'humour device with its example from the story', [
          ['Irony', 'The snake, not the man, ends up admiring itself in the mirror.'],
          ['Self-mockery', 'The narrator laughs at his own dreams of a rich wife.'],
          ['Exaggeration', 'He says he sat like a statue made of stone.'],
          ['Contrast', 'A deadly moment is told in a calm, chatty voice.'],
        ], ['Irony = the opposite of what you expect happens.', 'Self-mockery = the speaker jokes about himself.']),
      ],
    },
    {
      id: 'ts9.en.humour.poem', title: 'Poem: The Duck and the Kangaroo (nonsense verse)', prereqs: [],
      intro: [
        h('About the poet and the poem'),
        p('Edward Lear (1812–1888) was an English artist and poet, famous for "nonsense verse" and limericks — playful poems full of impossible situations, funny rhymes and invented words.'),
        h('What the poem is about (our summary)'),
        p('A duck living in a pond is bored and envies the kangaroo, who can hop far and wide. The duck asks the kangaroo to carry it on its back to see the world. The kangaroo worries that the duck’s wet, cold feet will give it a chill or rheumatism. The duck solves the problem in a comic way — by buying woollen socks and wrapping itself in a cloak. Satisfied, the kangaroo agrees, and the two friends happily hop around the world together.'),
        keys('Form: rhyming stanzas with a bouncy rhythm that sounds like hopping.', 'Humour: talking animals, an absurd problem (wet feet!) and an even more absurd solution (socks for a duck).', 'Theme: friendship, adventure, and solving a problem by thinking of the other person’s comfort.'),
        def('Nonsense verse', 'Light poetry that is deliberately silly or impossible, written for fun and sound rather than realism.'),
        h('Reading C: Little Bobby'),
        p('The unit’s third reading is another light, humorous piece. As you read it in class, use the same questions: Who is speaking? What is unexpected? Which lines are exaggerated?'),
        remember('Poetic devices to spot: rhyme (pond/beyond type endings), personification (animals that talk and reason), repetition, and humour from the absurd.'),
      ],
      examples: [
        ex('Why does the kangaroo hesitate at first?', ['The duck’s feet are wet and cold from the pond.', 'The kangaroo fears they will make it ill.'], 'He fears the duck’s wet, cold feet will give him a chill or rheumatism.'),
        ex('Name the device: animals in the poem talk, plan and worry like people.', ['Giving human qualities to non-human things is personification.'], 'Personification'),
      ],
      practice: [
        mcq('comp', 'Recall the problem and the solution in the poem.', [
          ['Why did the duck want to go with the kangaroo?', 'It was bored with its pond and wanted to see the world', ['It was afraid of a hunter', 'It wanted to learn to swim', 'It had lost its family'], 'The duck envies the kangaroo’s freedom.', 'The duck was tired of its dull pond life and longed to travel.'],
          ['What worried the kangaroo?', 'The duck’s wet, cold feet', ['The duck’s loud quacking', 'The long distance', 'Its own tired legs'], 'Think about what a duck’s feet are like after a pond.', 'He feared catching a chill from the duck’s wet feet.'],
          ['How did the duck solve the problem?', 'It bought woollen socks and wore a cloak', ['It dried its feet in the sun', 'It promised to fly instead', 'It asked a frog to carry it'], 'The solution is deliberately silly.', 'The duck covered its feet with socks and wrapped up in a cloak — an absurd, funny solution.'],
          ['Edward Lear is best known for…', 'nonsense verse and limericks', ['tragic plays', 'war poetry', 'travel diaries'], 'The poem itself is an example.', 'Lear is the master of playful nonsense poetry.'],
          ['Which word best describes the tone of the poem?', 'Playful', ['Mournful', 'Angry', 'Bitter'], 'How does the poem make you feel?', 'The light rhythm and silly situation give it a playful tone.'],
          ['Which device appears when the duck speaks politely to the kangaroo?', 'Personification', ['Alliteration', 'Simile', 'Onomatopoeia'], 'Animals behaving like people.', 'Giving animals human speech and manners is personification.'],
        ]),
        matchT('terms', 'poetry term with its meaning', [
          ['Rhyme', 'Words ending with the same sound at the ends of lines'],
          ['Personification', 'Giving human qualities to animals or things'],
          ['Stanza', 'A group of lines forming a unit in a poem'],
          ['Nonsense verse', 'Silly, impossible poetry written for fun'],
          ['Tone', 'The feeling or attitude a poem expresses'],
        ], ['Think about what each word describes: sound, meaning, shape or feeling.', 'A stanza is to a poem what a paragraph is to prose.']),
        orderT('summary', ['Begin with the duck’s wish.', 'The solution comes after the problem.'], [
          ['The duck wanted to travel. | The kangaroo feared its wet feet. | The duck bought socks and a cloak. | They hopped around the world together.', 'Wish → problem → solution → happy ending.'],
          ['Tired of its pond, | the duck asked the kangaroo | for a ride on its back.', 'Reason phrase → subject and verb → what it asked for.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.humour.vocab', title: 'Vocabulary: meaning in context and word formation', prereqs: [],
      intro: [
        h('Guessing meaning from context'),
        p('You do not need a dictionary for every new word. Look at the words around it: the situation, the tone and any clues such as "but", "because" or examples often tell you the meaning.'),
        stepsB('Read the whole sentence, not just the word.', 'Ask: is the word positive or negative here?', 'Look for a clue: a synonym, an opposite, an example or a cause.', 'Replace the word with your guess — does the sentence still make sense?'),
        h('Word formation'),
        p('Many English words are built by adding a prefix (before) or suffix (after) to a root.'),
        keys('un-, in-, im-, dis- make opposites: happy → unhappy, possible → impossible, honest → dishonest.', '-ful means "full of": hope → hopeful; -less means "without": fear → fearless.', '-ness and -ment make nouns: kind → kindness, enjoy → enjoyment.', '-ly makes adverbs: quick → quickly; -ous / -y make adjectives: humour → humorous, luck → lucky.'),
        def('Vanity', 'Too much pride in one’s own looks or abilities.'),
        def('Paralysed (with fear)', 'Unable to move because of great fear.'),
        remember('humour → humorous (the "u" before r is dropped). Do not write "humourous".'),
      ],
      examples: [
        ex('Guess the meaning: "Kiran was so terrified that he stood rooted to the spot, unable to take a single step."', ['"terrified" and "unable to take a step" are clues.', '"Rooted to the spot" = could not move, like a tree with roots.'], 'Rooted to the spot = unable to move (because of fear or shock).'),
        ex('Form an adjective from "care" meaning "without care".', ['"without" → suffix -less', 'care + less'], 'careless'),
      ],
      practice: [
        mcq('context', 'Use the clues in the sentence.', [
          ['"Meena chuckled at the cartoon in the Sunday paper." Chuckled means…', 'laughed quietly', ['cried loudly', 'shouted angrily', 'sighed sadly'], 'A cartoon is funny.', 'To chuckle is to laugh softly.'],
          ['"The bus was so crowded that we were squeezed like sardines." The expression means…', 'packed very tightly', ['eating fish', 'travelling cheaply', 'sitting comfortably'], 'Sardines are packed tightly in tins.', 'The comparison shows people were pressed close together.'],
          ['"Ravi’s vanity made him check his hair in every shop window." Vanity means…', 'too much pride in one’s looks', ['fear of strangers', 'love of shopping', 'poor eyesight'], 'Why would someone keep checking his hair?', 'Vanity is excessive pride in one’s appearance.'],
          ['"The old man was frail, so he walked slowly with a stick." Frail means…', 'weak and delicate', ['strong and fit', 'rich and proud', 'young and lively'], 'He needs a stick.', 'Frail means physically weak.'],
          ['"Despite the heavy rain, the match went ahead as planned." Despite means…', 'in spite of', ['because of', 'before', 'instead of'], 'The match happened even though it rained.', 'Despite shows contrast: something happened although something else might have stopped it.'],
        ]),
        mcq('formation', 'Decide which prefix or suffix gives the needed meaning.', [
          ['Choose the opposite of "possible".', 'impossible', ['unpossible', 'dispossible', 'inpossible'], 'Before p, the prefix in- becomes im-.', 'im- is used before b, m and p: impossible.'],
          ['Choose the noun form of "kind".', 'kindness', ['kindly', 'kindful', 'kindment'], 'Which suffix makes an abstract noun?', '-ness turns adjectives into nouns: kindness.'],
          ['Choose the adjective form of "humour".', 'humorous', ['humourous', 'humourful', 'humoury'], 'One letter is dropped.', 'The correct spelling is humorous.'],
          ['Choose the word meaning "without fear".', 'fearless', ['fearful', 'unfear', 'fearness'], '-less means without.', 'fear + less = fearless.'],
          ['Choose the opposite of "honest".', 'dishonest', ['unhonest', 'inhonest', 'nonhonest'], 'This word takes dis-.', 'The accepted opposite is dishonest.'],
          ['Choose the noun form of "enjoy".', 'enjoyment', ['enjoyness', 'enjoyful', 'enjoyly'], 'Verbs often take -ment.', 'enjoy + ment = enjoyment.'],
        ]),
        matchT('affix', 'word with the meaning of its affix', [
          ['hopeful', 'full of hope'], ['careless', 'without care'], ['unhappy', 'not happy'], ['rewrite', 'write again'], ['quickly', 'in a quick way'], ['misread', 'read wrongly'],
        ], ['-ful = full of; -less = without.', 're- = again; mis- = wrongly; un- = not.']),
      ],
    },
    {
      id: 'ts9.en.pastperf.use', title: 'Grammar: past perfect with simple past', prereqs: [],
      intro: [
        h('Two past actions — which came first?'),
        p('When we talk about two actions in the past, the past perfect (had + past participle) shows the EARLIER action. The simple past shows the LATER one.'),
        def('Past perfect', 'had + past participle (V3): had gone, had eaten, had finished.'),
        p('Example: When we reached the station, the train had left. (First the train left; then we reached.)'),
        p('Compare: When we reached the station, the train left. (We reached, and then the train left — we may have seen it go.)'),
        stepsB('Find the two past actions.', 'Decide which happened first.', 'Put the earlier action in past perfect: had + V3.', 'Keep the later action in simple past (V2).', 'Use linkers: before, after, when, by the time, as soon as, already.'),
        remember('Common errors: (1) "had went" ✗ → "had gone" ✓ — use V3, not V2. (2) Do not use past perfect for both actions. (3) With "before" and "after", the order is already clear, so simple past for both is also acceptable, but the past perfect is never used for the later action.'),
        tip('Time-line trick: draw a line, mark the two events, label the earlier one "had + V3".'),
      ],
      examples: [
        ex('Combine using past perfect: "Lakshmi finished her homework. Then she watched TV." (use: after)', ['Earlier action: finished homework → had finished', 'Later action: watched TV → simple past'], 'After Lakshmi had finished her homework, she watched TV.'),
        ex('Correct the sentence: "By the time the doctor came, the patient already recovered."', ['Recovery happened first, before the doctor came.', 'Earlier action → had + V3: had already recovered'], 'By the time the doctor came, the patient had already recovered.'),
        ex('Combine: "The rain stopped. We went out to play." (use: when)', ['The rain stopped first → had stopped', 'We went out later → went'], 'When the rain had stopped, we went out to play.'),
      ],
      practice: [
        mcq('fill', 'Which action happened first?', [
          ['When I reached the cinema, the film ____ already started.', 'had', ['has', 'was', 'have'], 'The film started before I reached.', 'Earlier action → had + V3: had already started.'],
          ['Arjun ____ his lunch before his friends arrived.', 'had eaten', ['has eaten', 'had ate', 'eats'], 'Lunch came first; use V3 of eat.', 'had + eaten (V3) shows the earlier action.'],
          ['The farmers ____ the crop by the time the rains came.', 'had harvested', ['harvest', 'have harvested', 'were harvest'], 'The harvest was finished earlier.', 'By the time + simple past; earlier action → had harvested.'],
          ['After Sana had locked the door, she ____ to school.', 'went', ['had gone', 'has gone', 'goes'], 'This is the LATER action.', 'The later action stays in simple past: went.'],
          ['Imran was sad because he ____ his new pen.', 'had lost', ['has lost', 'had loose', 'loses'], 'He lost it first, then felt sad.', 'Losing came before feeling sad → had lost.'],
          ['The guests had left before we ____ the hall.', 'reached', ['had reached', 'reach', 'have reached'], 'Which action is later?', 'Reaching the hall was later, so simple past: reached.'],
        ]),
        orderT('build', ['Find "had" — that verb group is the earlier action.', 'A time word like "When" or "By the time" can begin the sentence.'], [
          ['When Teja reached the bus stop, | the bus | had already left.', 'Time clause first, then the main clause with the earlier action in past perfect.'],
          ['By the time the doctor arrived, | the patient | had fallen asleep.', '"By the time" clause, then subject, then past perfect verb.'],
          ['Priya | had finished her project | before | the bell rang.', 'Earlier action (had finished) → before → later action (rang).'],
          ['After the guests had eaten, | Grandmother | served | sweet payasam.', 'After-clause (earlier) → subject → simple past verb → object.'],
        ]),
        errT('spot', ['Check every verb form after "had".', 'Ask which action happened first.'], [
          ['When we | reached Warangal, | the fort tour | had already began.', 3, 'When we reached Warangal, the fort tour had already begun.', 'After "had" use the past participle: begun, not began.'],
          ['After Kavya | had wrote | the letter, | she posted it.', 1, 'After Kavya had written the letter, she posted it.', 'The V3 of write is written.'],
          ['The shop | had closed | before we | had reached there.', 3, 'The shop had closed before we reached there.', 'Only the earlier action takes past perfect; reaching was later → reached.'],
          ['Anil | had never saw | snow before | he visited Shimla.', 1, 'Anil had never seen snow before he visited Shimla.', 'had + seen (V3), not saw.'],
          ['By the time | the firemen came, | the fire | has spread.', 3, 'By the time the firemen came, the fire had spread.', 'In a past story, the earlier action takes had, not has.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.phrasal.verbs', title: 'Grammar and vocabulary: phrasal verbs', prereqs: [],
      intro: [
        h('Verb + particle = new meaning'),
        def('Phrasal verb', 'A verb followed by an adverb or preposition (a particle) that together have a special meaning, often different from the verb alone.'),
        p('"Look" means to see, but "look after" means to take care of, "look up" means to search for information, and "look forward to" means to wait eagerly.'),
        keys('give up = stop trying / stop a habit', 'put off = postpone', 'carry on = continue', 'run out of = have none left', 'turn down = refuse', 'set off = start a journey', 'make up = invent (a story or excuse)', 'break down = stop working (machine)', 'get over = recover from', 'call off = cancel'),
        stepsB('Read the whole sentence.', 'Treat the verb and particle as one unit.', 'Replace it with a one-word meaning (postpone, cancel, continue…).', 'Check the sentence still makes sense.'),
        remember('Changing the particle changes the meaning: put off (postpone) ≠ put on (wear) ≠ put up with (tolerate). "Look forward to" is followed by -ing: I look forward to meeting you (not "to meet").'),
      ],
      examples: [
        ex('Replace with a phrasal verb: "The school cancelled the sports day because of rain."', ['cancel = call off', 'Use past tense: called off'], 'The school called off the sports day because of rain.'),
        ex('What does "ran out of" mean in "We ran out of milk, so I went to the shop"?', ['We had no milk left.'], 'ran out of = used up completely; had none left'),
      ],
      practice: [
        mcq('meaning', 'Replace the phrasal verb with one word.', [
          ['The meeting was put off till Monday. "Put off" means…', 'postponed', ['cancelled', 'started', 'attended'], 'It will still happen, just later.', 'Put off = postpone (move to a later time).'],
          ['Diya looked after her baby brother. "Looked after" means…', 'took care of', ['searched for', 'admired', 'followed'], 'Babies need care.', 'Look after = take care of.'],
          ['Our car broke down near Siddipet. "Broke down" means…', 'stopped working', ['was sold', 'went faster', 'was painted'], 'A car on a highway problem.', 'Break down (of a machine) = stop working.'],
          ['It took Joseph a week to get over his fever. "Get over" means…', 'recover from', ['catch', 'hide', 'talk about'], 'A week of rest.', 'Get over = recover from an illness or shock.'],
          ['The players carried on despite the drizzle. "Carried on" means…', 'continued', ['stopped', 'complained', 'shouted'], 'Despite = even though.', 'Carry on = continue.'],
          ['Harpreet turned down the offer politely. "Turned down" means…', 'refused', ['accepted', 'printed', 'lowered'], 'Politely saying no.', 'Turn down (an offer) = refuse it.'],
        ]),
        matchT('pairs', 'phrasal verb with its meaning', [
          ['give up', 'stop trying'], ['set off', 'start a journey'], ['call off', 'cancel'], ['make up', 'invent a story'], ['run out of', 'have none left'], ['look up', 'search for information'],
        ], ['Say each phrasal verb in a sentence first.', 'Call off = cancel; set off = begin a journey.']),
        mcq('choose', 'Pick the particle that gives the right meaning.', [
          ['We set ____ for Bhadrachalam at dawn.', 'off', ['up', 'down', 'over'], 'Starting a journey.', 'Set off = start a journey.'],
          ['Please don’t give ____; you are close to the answer.', 'up', ['in to', 'off', 'out'], 'Stop trying.', 'Give up = stop trying.'],
          ['I look forward ____ meeting you at the fair.', 'to', ['for', 'at', 'on'], 'This phrasal verb has three words.', 'Look forward to + -ing.'],
          ['The pen ran ____ of ink during the exam.', 'out', ['off', 'down', 'over'], 'Ink was finished.', 'Run out of = have none left.'],
          ['Kiran made ____ a funny excuse for being late.', 'up', ['off', 'out', 'on'], 'Invented.', 'Make up = invent.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Unit 2 — Games and Sports
// =====================================================================================
const u2: USpec = {
  id: 'ts9.en.u2', subject: 'english', title: 'Games and Sports', source: src(2),
  note: 'Reading A summary follows the widely reported life of mountaineer Arunima Sinha; teacher to confirm against the textbook text. Poem B (What Is a Player?) is taught at theme level only.',
  objectives: [
    {
      id: 'ts9.en.trueheight.read', title: 'Reading: True Height', prereqs: [],
      intro: [
        h('About the reading'),
        p('True Height is a real-life story of courage. It follows Arunima Sinha, a national-level volleyball player from Uttar Pradesh. In 2011 she was pushed off a moving train by robbers when she resisted them, and doctors had to amputate one of her legs.'),
        h('Our summary'),
        stepsB(
          'Lying in hospital, Arunima refused to see herself as a victim. She decided to aim for the highest peak on earth.',
          'With an artificial (prosthetic) leg, she trained hard under the guidance of Bachendri Pal, the first Indian woman to climb Mount Everest.',
          'She faced pain, doubt and the danger of the mountain, but kept going step by step.',
          'In May 2013 she reached the summit of Everest, becoming the first woman amputee to do so. She later climbed high peaks on other continents too.',
        ),
        keys('Theme: "true height" is not the height of a mountain but the height of a person’s determination and spirit.', 'Character traits: determined, brave, resilient, self-confident.', 'Message: disability or misfortune need not limit ambition.'),
        def('Amputate', 'To cut off a limb (arm or leg) by surgery, usually to save a life.'),
        def('Prosthetic', 'An artificial body part, such as a leg made of metal and plastic.'),
        remember('In theme questions, explain the title: the story measures height by courage, not metres.'),
        tip('Speak respectfully about disability: say "a person with a disability" or "an amputee athlete", focusing on ability.'),
      ],
      examples: [
        ex('Explain the title "True Height".', ['A mountain has height in metres.', 'Arunima’s greatness is in her will power.', 'So "true height" = the height of human spirit.'], 'The title means a person’s real height is the height of their courage and determination.'),
        ex('Give two traits of Arunima with evidence.', ['She did not give up after losing a leg → determined.', 'She climbed Everest with a prosthetic leg → brave.'], 'Determined and brave.'),
      ],
      practice: [
        mcq('comp', 'Recall the main events of her life.', [
          ['Which sport did Arunima play before her accident?', 'Volleyball', ['Cricket', 'Kabaddi', 'Hockey'], 'She was a national-level player.', 'She was a national-level volleyball player.'],
          ['How did she lose her leg?', 'She was pushed off a moving train by robbers', ['She fell from a mountain', 'She was hurt in a match', 'A car hit her at a crossing'], 'It happened on a journey.', 'Robbers pushed her off a train when she resisted them.'],
          ['Who guided her training for Everest?', 'Bachendri Pal', ['P. V. Sindhu', 'Mary Kom', 'Saina Nehwal'], 'The first Indian woman to climb Everest.', 'Bachendri Pal mentored her.'],
          ['What record did Arunima set in 2013?', 'First woman amputee to climb Everest', ['Fastest runner in Asia', 'Youngest volleyball captain', 'First woman pilot of India'], 'Think of the summit.', 'She became the first woman amputee to reach the top of Everest.'],
          ['Which word best describes Arunima?', 'Resilient', ['Careless', 'Timid', 'Boastful'], 'She bounced back from disaster.', 'Resilient = able to recover from difficulty and keep going.'],
          ['What is the main message of the story?', 'Determination can overcome misfortune', ['Train travel is unsafe', 'Mountains are dangerous', 'Sport is only for the able-bodied'], 'Think about the title.', 'The story celebrates will power that rises above misfortune.'],
        ]),
        orderT('events', ['Begin with her life as a player.', 'The summit is the last event.'], [
          ['Arunima played volleyball. | Robbers pushed her off a train. | She trained with a prosthetic leg. | She reached the top of Everest.', 'Player → accident → training → summit.'],
          ['Although she had lost a leg, | Arunima | climbed | Mount Everest.', 'Although-clause → subject → verb → object.'],
        ]),
        matchT('words', 'word with its meaning', [
          ['amputate', 'cut off a limb by surgery'], ['prosthetic', 'artificial body part'], ['summit', 'the top of a mountain'], ['resilient', 'able to recover quickly'], ['mentor', 'an experienced guide'],
        ], ['Use the story for clues.', 'Summit = top; mentor = guide.']),
      ],
    },
    {
      id: 'ts9.en.laxman.read', title: 'Reading: V.V.S. Laxman, Very Very Special — and What Is a Player?', prereqs: [],
      intro: [
        h('Reading C: a Hyderabad cricketer'),
        p('V. V. S. Laxman is a cricketer from Hyderabad. He was a talented student who had a seat in medicine but chose to play cricket. He became known for his graceful wristy strokes and his calmness under pressure.'),
        p('His most famous innings was 281 against Australia at Eden Gardens, Kolkata, in 2001. India had been asked to follow on and seemed sure to lose, but Laxman and Rahul Dravid batted for almost a whole day. India went on to win — one of the greatest comebacks in Test history. Fans played on his initials and called him "Very Very Special".'),
        keys('Qualities: patience, concentration, humility, team spirit.', 'Theme: a sportsperson’s greatness shows most when the team is in trouble.'),
        h('Poem B: What Is a Player?'),
        p('The poem describes the qualities of a true player — not only skill, but fair play, discipline, respect for opponents and the grace to accept both victory and defeat.'),
        def('Sportsmanship', 'Fair, generous and polite behaviour in sport, whether you win or lose.'),
        remember('Follow-on: in Test cricket, a side that is far behind after the first innings may be asked to bat again straight away. Coming back to win after a follow-on is very rare.'),
      ],
      examples: [
        ex('Why is Laxman’s 281 called a match-winning innings?', ['India was following on and close to defeat.', 'His long partnership with Dravid built a huge lead.', 'India then bowled Australia out.'], 'It turned certain defeat into victory.'),
        ex('Name two qualities of a true player from the poem’s theme.', ['Think beyond skill.'], 'Fair play and respect for opponents (also discipline, grace in defeat).'),
      ],
      practice: [
        mcq('comp', 'Think about Laxman’s career and the poem’s idea of a player.', [
          ['Which city is V.V.S. Laxman from?', 'Hyderabad', ['Kolkata', 'Mumbai', 'Chennai'], 'He is from Telangana’s capital.', 'Laxman is from Hyderabad.'],
          ['Against which team did Laxman score 281 in 2001?', 'Australia', ['England', 'Pakistan', 'South Africa'], 'The match at Eden Gardens.', 'He scored 281 against Australia at Kolkata.'],
          ['Which batsman shared the famous partnership with Laxman?', 'Rahul Dravid', ['Sachin Tendulkar', 'Sourav Ganguly', 'Virender Sehwag'], 'Known as "The Wall".', 'Rahul Dravid batted with him through a whole day.'],
          ['What career did Laxman give up to play cricket?', 'Medicine', ['Law', 'Engineering', 'Teaching'], 'He had a seat in a medical college.', 'He chose cricket over studying medicine.'],
          ['According to the poem’s theme, a true player…', 'accepts both victory and defeat gracefully', ['wins at any cost', 'argues with the umpire', 'plays only for money'], 'Sportsmanship.', 'A true player shows grace in winning and losing.'],
          ['"Very Very Special" is a play on Laxman’s…', 'initials', ['batting average', 'home town', 'jersey number'], 'V.V.S.', 'The nickname uses his initials V.V.S.'],
        ]),
        matchT('qualities', 'quality with the behaviour that shows it', [
          ['Patience', 'Batting calmly for a whole day'], ['Humility', 'Staying modest after a big score'], ['Team spirit', 'Playing for the side, not personal glory'], ['Fair play', 'Following the rules honestly'], ['Discipline', 'Practising regularly and on time'],
        ], ['Read each behaviour and ask which quality it proves.', 'Humility = not boasting.']),
        orderT('summary', ['Start with the situation India was in.', 'The win comes last.'], [
          ['India was asked to follow on. | Laxman and Dravid batted all day. | India set a big target. | Australia lost the match.', 'Trouble → partnership → target → victory.'],
          ['Though he had a seat in medicine, | Laxman | chose | a career in cricket.', 'Though-clause → subject → verb → object.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.sports.vocab', title: 'Vocabulary: synonyms and collocations', prereqs: [],
      intro: [
        h('Synonyms'),
        def('Synonym', 'A word with the same or nearly the same meaning: brave – courageous, win – triumph, tired – exhausted.'),
        p('Synonyms are rarely perfect swaps. "Thin" and "slim" both mean not fat, but "slim" sounds positive. Always check the context.'),
        h('Collocations'),
        def('Collocation', 'Words that naturally go together in English, e.g. "take a catch", "score a goal", "heavy rain", "strong tea", "make a mistake", "do homework".'),
        keys('make: a mistake, a decision, progress, a noise, friends', 'do: homework, your best, exercise, a favour', 'take: a catch, a break, part, a photo', 'win a match / a prize; beat an opponent (not "win an opponent")'),
        stepsB('Find the noun.', 'Ask which verb or adjective an English speaker would naturally use with it.', 'Say both options aloud — the collocation usually sounds familiar.'),
        remember('Common Indian-English errors: "do a mistake" ✗ → "make a mistake" ✓; "win the opponent" ✗ → "beat the opponent" ✓; "strong rain" ✗ → "heavy rain" ✓.'),
      ],
      examples: [
        ex('Choose: "Our team (won / beat) Karimnagar by five wickets."', ['You win a match; you beat a team.'], 'beat'),
        ex('Give a synonym of "exhausted" for this sentence: "After the marathon, the runners were exhausted."', ['Meaning: extremely tired.'], 'worn out / very tired'),
      ],
      practice: [
        mcq('syn', 'Find the word closest in meaning.', [
          ['Synonym of "courageous"', 'brave', ['cowardly', 'clever', 'careful'], 'Think of a hero.', 'Courageous = brave.'],
          ['Synonym of "victory"', 'triumph', ['defeat', 'draw', 'trial'], 'Winning.', 'Victory = triumph.'],
          ['Synonym of "determined"', 'resolute', ['confused', 'lazy', 'nervous'], 'Firm in purpose.', 'Determined = resolute.'],
          ['Synonym of "opponent"', 'rival', ['partner', 'coach', 'umpire'], 'The person you play against.', 'Opponent = rival.'],
          ['Synonym of "renowned"', 'famous', ['unknown', 'rich', 'young'], 'Well known.', 'Renowned = famous.'],
          ['Synonym of "exhausted"', 'worn out', ['excited', 'rested', 'hungry'], 'After a marathon.', 'Exhausted = worn out.'],
        ]),
        mcq('colloc', 'Which word naturally goes with the noun?', [
          ['The keeper ____ a brilliant catch.', 'took', ['did', 'made up', 'gave'], 'In cricket we ___ a catch.', 'The collocation is "take a catch".'],
          ['Everyone can ____ a mistake.', 'make', ['do', 'take', 'have'], 'Mistake collocates with one verb.', 'We make mistakes, not do them.'],
          ['There was ____ rain during the match.', 'heavy', ['strong', 'big', 'thick'], 'Rain is described by weight.', 'The collocation is "heavy rain".'],
          ['Please ____ your homework before playing.', 'do', ['make', 'take', 'play'], 'Homework collocates with do.', 'We do homework.'],
          ['India ____ the final by 20 runs.', 'won', ['beat', 'gained', 'earned'], 'You ___ a match or a final.', 'You win a match; you beat a team.'],
          ['Sindhu ____ her best in every match.', 'does', ['makes', 'takes', 'puts'], 'A fixed phrase.', 'The collocation is "do your best".'],
        ]),
        matchT('colloc-match', 'verb with the noun it collocates with', [
          ['score', 'a goal'], ['break', 'a record'], ['pay', 'attention'], ['keep', 'a promise'], ['catch', 'a cold'], ['take', 'a break'],
        ], ['Say each pair aloud.', 'You break a record and keep a promise.']),
      ],
    },
    {
      id: 'ts9.en.clauses.adverbial', title: 'Grammar: main and subordinate (adverbial) clauses', prereqs: [],
      intro: [
        h('What is a clause?'),
        def('Clause', 'A group of words with its own subject and verb.'),
        def('Main (independent) clause', 'A clause that makes complete sense on its own: "We stayed indoors".'),
        def('Subordinate (dependent) clause', 'A clause that cannot stand alone; it begins with a subordinating word: "because it was raining".'),
        p('An adverbial clause works like an adverb: it tells us when, why, where, how, on what condition, or in spite of what the main action happens.'),
        keys('Time: when, while, before, after, as soon as, until, since', 'Reason: because, since, as', 'Condition: if, unless', 'Contrast: although, though, even though', 'Purpose: so that, in order that', 'Place: where, wherever'),
        stepsB('Find each verb in the sentence.', 'Group each verb with its subject — each group is a clause.', 'The clause that begins with a subordinator (because, when, although…) is subordinate.', 'The clause that makes sense alone is the main clause.', 'Name the adverbial clause by its question: when? why? on what condition? despite what?'),
        remember('Common errors: (1) Using "although…but" together ✗ — use only one. (2) Writing a subordinate clause alone as a sentence ("Because I was late." ✗). (3) When the subordinate clause comes first, put a comma after it.'),
      ],
      examples: [
        ex('Identify the clauses: "Although Teja was injured, he finished the race."', ['Verbs: was injured, finished.', '"Although Teja was injured" begins with a subordinator → subordinate clause (contrast).', '"he finished the race" → main clause.'], 'Main: he finished the race. Subordinate (adverbial of contrast): Although Teja was injured.'),
        ex('Join with a suitable subordinator: "The match was stopped. It began to rain heavily."', ['Rain is the reason the match stopped.', 'Use "because".'], 'The match was stopped because it began to rain heavily.'),
        ex('Join: "Sana practised daily. She wanted to make the state team." (purpose)', ['Purpose → so that + could/might.'], 'Sana practised daily so that she could make the state team.'),
      ],
      practice: [
        mcq('kind', 'Ask which question the subordinate clause answers.', [
          ['"We will play outside if the rain stops." The clause "if the rain stops" shows…', 'condition', ['time', 'place', 'contrast'], 'If…', 'If-clauses express condition.'],
          ['"Ravi was tired because he had run ten kilometres." The clause "because he had run ten kilometres" shows…', 'reason', ['purpose', 'time', 'place'], 'Why was he tired?', 'Because-clauses give reason.'],
          ['"Though the pitch was wet, the match went on." The clause "Though the pitch was wet" shows…', 'contrast', ['reason', 'condition', 'time'], 'Something unexpected happens.', 'Though/although clauses show contrast.'],
          ['"Wait here until the coach returns." The clause "until the coach returns" shows…', 'time', ['reason', 'purpose', 'manner'], 'Up to what moment?', 'Until introduces a time clause.'],
          ['"She saved money so that she could buy a cricket kit." The clause "so that she could buy a cricket kit" shows…', 'purpose', ['contrast', 'time', 'condition'], 'For what aim?', 'So that introduces purpose.'],
          ['Which is the main clause in "When the whistle blew, the players ran onto the field"?', 'the players ran onto the field', ['When the whistle blew', 'When the whistle', 'the whistle blew onto the field'], 'Which part makes sense alone?', 'The main clause can stand alone: the players ran onto the field.'],
        ]),
        orderT('join', ['Find the subordinator — it starts the dependent clause.', 'If the dependent clause comes first, a comma follows it.'], [
          ['Although it was very hot, | the athletes | completed | the race.', 'Contrast clause + comma → main clause.'],
          ['The match | was postponed | because | the ground was flooded.', 'Main clause → because → reason clause.'],
          ['As soon as the bell rang, | the students | rushed | to the playground.', 'Time clause + comma → main clause.'],
          ['You will not improve | unless | you | practise regularly.', 'Main clause → unless → condition clause.'],
        ]),
        errT('spot', ['Check for doubled linkers (although…but).', 'Check tenses in time and if clauses.'], [
          ['Although | Kiran was ill, | but | he came to school.', 2, 'Although Kiran was ill, he came to school.', 'Use either "although" or "but", never both.'],
          ['If it | will rain tomorrow, | the match | will be cancelled.', 1, 'If it rains tomorrow, the match will be cancelled.', 'In a first-conditional if-clause, use simple present (rains), not will.'],
          ['Because | she missed the bus. | Diya | walked to school.', 1, 'Because she missed the bus, Diya walked to school.', 'A subordinate clause cannot stand alone; join it to the main clause with a comma.'],
          ['We waited | till | the rain | will stop.', 3, 'We waited till the rain stopped.', 'The time clause must follow the past tense of the main clause: stopped.'],
          ['Even though | he trained hard, | so | he lost the final.', 2, 'Even though he trained hard, he lost the final.', '"Even though" already links the clauses; "so" is wrong and illogical.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.editing.basics', title: 'Grammar: editing a passage', prereqs: [],
      intro: [
        h('What is editing?'),
        p('Editing means reading a piece of writing carefully and correcting errors of grammar, spelling, punctuation and word choice, without changing the meaning. Exam editing tasks usually have one error per underlined part or line.'),
        stepsB(
          'Read the whole passage once for meaning.',
          'Check verbs: tense consistency and subject–verb agreement.',
          'Check articles (a, an, the) and prepositions (in, on, at, to).',
          'Check spelling, capital letters and punctuation.',
          'Rewrite only the wrong word or phrase; do not rewrite the whole sentence.',
        ),
        keys('Subject–verb agreement: One of the players IS injured (not "are").', 'Tense: a past story stays in the past.', 'Articles: an hour, a university, the Godavari.', 'Prepositions: good AT, interested IN, angry WITH a person, ON Monday, IN June, AT 5 pm.'),
        remember('Common traps: "each/every/one of" take a singular verb; "news" and "mathematics" are singular; "people" and "police" are plural.'),
      ],
      examples: [
        ex('Edit: "Every students in our class have a library card."', ['every + singular noun: student', 'every … has (singular verb)'], 'Every student in our class has a library card.'),
        ex('Edit: "Laxman is good in batting and he play for India."', ['good AT something', 'he → plays (third person singular)'], 'Laxman is good at batting and he plays for India.'),
      ],
      practice: [
        errT('spot', ['Check subject–verb agreement first.', 'Then look at articles and prepositions.'], [
          ['One of my friends | are | a good | kabaddi player.', 1, 'One of my friends is a good kabaddi player.', '"One of" takes a singular verb: is.'],
          ['Meena | reached the stadium | in | 6 o’clock.', 2, 'Meena reached the stadium at 6 o’clock.', 'Use "at" with clock times.'],
          ['He waited | for a | hour | at the gate.', 1, 'He waited for an hour at the gate.', '"hour" begins with a vowel sound, so use "an".'],
          ['The news | are | very good | today.', 1, 'The news is very good today.', '"News" is uncountable and singular.'],
          ['Yesterday | the team | practise | for three hours.', 2, 'Yesterday the team practised for three hours.', '"Yesterday" needs the past tense.'],
          ['She is | very much | interested on | athletics.', 2, 'She is very much interested in athletics.', 'Interested IN, not on.'],
        ]),
        mcq('fix', 'Choose the correct form for the blank.', [
          ['The police ____ arrived at the ground.', 'have', ['has', 'is', 'was'], 'Police is a plural noun.', '"Police" takes a plural verb: have.'],
          ['Mathematics ____ my favourite subject.', 'is', ['are', 'were', 'have'], 'A subject name ending in -s.', 'Mathematics is singular.'],
          ['Each of the boys ____ a medal.', 'gets', ['get', 'are getting', 'have got'], 'Each = one by one.', 'Each of takes a singular verb.'],
          ['We play cricket ____ Sundays.', 'on', ['in', 'at', 'by'], 'Days take this preposition.', 'Use "on" with days.'],
          ['She is ____ honest girl.', 'an', ['a', 'the', 'no article'], 'Honest begins with a silent h.', 'Vowel sound → an.'],
        ]),
        matchT('rules', 'error with its correction rule', [
          ['"He go to practice daily."', 'Add -s for he/she/it in simple present'], ['"a umbrella"', 'Use "an" before a vowel sound'], ['"at Monday"', 'Use "on" with days'], ['"Yesterday I play."', 'Use past tense with past time words'], ['"The players is ready."', 'Plural subject takes a plural verb'],
        ], ['Name what is wrong in each example.', 'Days → on; vowel sound → an.']),
      ],
    },
  ],
};

// =====================================================================================
// Unit 3 — School Life
// =====================================================================================
const u3: USpec = {
  id: 'ts9.en.u3', subject: 'english', title: 'School Life', source: src(3),
  note: 'Reading A summary is kept at outline level (teacher to confirm event details against the textbook extract). Poem B (Not Just a Teacher, but a Friend) and Reading C (Homework) are referenced by theme only; the unit’s writing objective (formal letter) is a WonderLab addition.',
  objectives: [
    {
      id: 'ts9.en.swami.read', title: 'Reading: Swami is Expelled from School', prereqs: [],
      intro: [
        h('About the author and the book'),
        p('R. K. Narayan (1906–2001) is one of India’s most famous writers in English. Most of his stories are set in Malgudi, an imaginary small South Indian town. This reading is an episode from his first novel, Swami and Friends (1935), about a ten-year-old schoolboy, Swaminathan (Swami).'),
        h('Our outline of the episode'),
        stepsB(
          'The story is set during India’s freedom struggle. Swami hears speakers at a public meeting urging people to boycott British goods and institutions.',
          'Carried away by the excitement, Swami joins a crowd of protesters. The mob turns unruly and window panes at his school are smashed — Swami joins in without really understanding the cause.',
          'The next day the headmaster calls the boys who were involved and punishes them. Swami feels humiliated and angry.',
          'Swami defies the headmaster and leaves the school, and he is expelled. He then has to face his strict father at home.',
        ),
        keys('Swami: impulsive, emotional, easily influenced by a crowd, but innocent and likeable.', 'The headmaster: a figure of school discipline.', 'Swami’s father: strict, worried about his son’s future.', 'Themes: childhood innocence; how excitement can lead people to act without thinking; the freedom movement seen through a child’s eyes.'),
        h('The unit’s other readings'),
        p('Poem B celebrates a teacher who is also a friend and guide. Reading C looks at homework from a student’s point of view. Read them in class and compare how each shows school life.'),
        remember('Narayan’s humour is gentle: he laughs WITH Swami, not at him. In answers, mention both the comedy and the serious historical background.'),
      ],
      examples: [
        ex('Why did Swami take part in the protest?', ['He did not fully understand politics.', 'He was carried away by the speeches and the crowd.'], 'He was swept along by the excitement of the crowd rather than by real understanding.'),
        ex('Give one theme with evidence.', ['Swami breaks window panes just because everyone else does.'], 'Mob behaviour / acting without thinking: Swami copies the crowd and ends up in trouble.'),
      ],
      practice: [
        mcq('comp', 'Think about Swami’s character and the setting.', [
          ['Who wrote Swami and Friends?', 'R. K. Narayan', ['Ruskin Bond', 'Mulk Raj Anand', 'Vikram Seth'], 'He created Malgudi.', 'R. K. Narayan wrote Swami and Friends (1935).'],
          ['Malgudi is…', 'an imaginary South Indian town', ['a real city in Telangana', 'a school in Chennai', 'a river in Karnataka'], 'Narayan invented it.', 'Malgudi is a fictional town created by Narayan.'],
          ['What is the historical background of the episode?', 'The Indian freedom struggle', ['The Second World War', 'The Green Revolution', 'The Mughal period'], 'Speeches about boycotting British goods.', 'The protests belong to the freedom movement.'],
          ['Which word best describes Swami in this episode?', 'Impulsive', ['Cautious', 'Cruel', 'Lazy'], 'He acts on sudden feelings.', 'Swami acts quickly on excitement without thinking — he is impulsive.'],
          ['What is the result of Swami’s defiance at school?', 'He is expelled', ['He becomes class leader', 'He wins a prize', 'He is made a monitor'], 'Look at the title.', 'The title says it: Swami is expelled.'],
          ['How does Narayan present Swami?', 'With gentle, sympathetic humour', ['As a villain', 'With bitter anger', 'As a hero of war'], 'Do we dislike Swami?', 'Narayan laughs with Swami and makes us understand him.'],
        ]),
        orderT('events', ['Start with the public meeting.', 'The expulsion comes last.'], [
          ['Swami heard the speeches. | He joined the excited crowd. | The headmaster punished the boys. | Swami was expelled from school.', 'Speeches → crowd → punishment → expulsion.'],
          ['Carried away by the crowd, | Swami | broke | a window pane.', 'Participle phrase → subject → verb → object.'],
        ]),
        matchT('chars', 'character with a description', [
          ['Swami', 'an emotional ten-year-old schoolboy'], ['The headmaster', 'stands for school discipline'], ['Swami’s father', 'strict and worried about his son'], ['R. K. Narayan', 'the author who created Malgudi'],
        ], ['Think about each person’s role in the story.', 'The author is outside the story.']),
      ],
    },
    {
      id: 'ts9.en.school.letter', title: 'Writing: a formal letter to the headmaster', prereqs: [],
      intro: [
        h('When do we write a formal letter?'),
        p('We write formal letters to people in official positions — a headmaster, a municipal officer, an editor — to request, complain, apologise or inform. The tone is polite and the format is fixed.'),
        stepsB(
          'Sender’s address (top left) and date.',
          'Receiver’s designation and address: "The Headmaster, ZPHS, …".',
          'Subject line: one short phrase saying what the letter is about.',
          'Salutation: "Respected Sir / Madam,"',
          'Body: paragraph 1 — purpose; paragraph 2 — details/reasons; paragraph 3 — request or promise.',
          'Closing: "Yours faithfully," (or "Yours obediently," to your headmaster), then signature, name, class and section.',
        ),
        h('Model letter (our own)'),
        p('Kavya, Class IX-B, ZPHS Narsampet, 12 July 2026. To The Headmaster, ZPHS Narsampet. Subject: Apology for damaging a classroom window. Respected Sir, I am writing to apologise for breaking a window pane in our classroom yesterday while playing during the break. I did not mean to cause damage, but I know I was careless. I am ready to pay for the repair from my savings and I promise to play only on the ground in future. Kindly accept my apology. Yours obediently, Kavya, IX-B.'),
        keys('Checklist: correct format parts in order; clear subject line; polite tone; short paragraphs; no slang or SMS language; correct closing.'),
        remember('Common errors: "Yours Faithfully" with a capital F ✗ → "Yours faithfully," ✓; informal phrases like "Hi Sir" ✗; forgetting the subject line.'),
      ],
      examples: [
        ex('Write a subject line for a letter asking for two days’ leave for your sister’s wedding.', ['Short, clear, noun phrase.'], 'Subject: Request for leave for two days'),
        ex('Which closing suits a letter to your headmaster: "Your loving student" or "Yours obediently"?', ['A formal letter needs a formal closing.'], 'Yours obediently'),
      ],
      practice: [
        orderT('format', ['Addresses come before the salutation.', 'The closing comes at the end.'], [
          ['Sender’s address and date | Receiver’s address | Subject line | Respected Sir, | Body of the letter | Yours obediently, and name', 'Formal letters follow a fixed order.'],
          ['Respected Madam, | I request you to grant me leave | for two days | as I have fever.', 'Salutation → request → duration → reason.'],
          ['I am ready | to pay for the repair | and | I promise to be careful in future.', 'Offer to make good → then a promise.'],
        ]),
        mcq('tone', 'Formal letters are polite and precise.', [
          ['Which is the best opening sentence for a leave letter?', 'I request you to grant me leave for two days.', ['Gimme two days off pls.', 'I am not coming tomorrow, ok?', 'Hey Sir, need leave.'], 'Avoid slang.', 'Formal letters use complete, polite sentences.'],
          ['Which salutation is right for a letter to the headmaster?', 'Respected Sir,', ['Dear buddy,', 'Hi Sir!', 'Yo Sir,'], 'Formal greeting.', '"Respected Sir," is the accepted formal salutation.'],
          ['Where does the subject line go?', 'After the receiver’s address, before the salutation', ['At the very end', 'Inside the body', 'Before the sender’s address'], 'It introduces the topic.', 'The subject comes just before "Respected Sir,".'],
          ['Which closing goes with a letter to an editor?', 'Yours faithfully,', ['With love,', 'Your dear friend,', 'Cheers,'], 'You do not know the editor personally.', 'Formal letters to officials close with "Yours faithfully,".'],
          ['Which detail does NOT belong in a formal letter of apology?', 'A joke about the teacher', ['What went wrong', 'An offer to make amends', 'A promise for the future'], 'Keep it respectful.', 'Jokes about the reader are inappropriate in a formal letter.'],
        ]),
        matchT('parts', 'letter part with its example', [
          ['Salutation', 'Respected Sir,'], ['Subject', 'Request for transfer certificate'], ['Closing', 'Yours obediently,'], ['Receiver', 'The Headmaster, ZPHS Jangaon'], ['Body', 'I request you to issue my certificate…'],
        ], ['The salutation greets; the closing says goodbye.', 'The subject is a short phrase.']),
      ],
    },
    {
      id: 'ts9.en.school.vocab', title: 'Vocabulary: synonyms and phrasal verbs (school life)', prereqs: [],
      intro: [
        h('Words of school life'),
        keys('expel – dismiss permanently from school', 'defy – openly refuse to obey', 'punish – penalise', 'humiliate – make someone feel ashamed in public', 'diligent – hard-working', 'punctual – on time'),
        p('A synonym can replace a word in a sentence without changing the meaning much. Test it by putting your synonym into the sentence.'),
        h('School phrasal verbs'),
        keys('hand in – submit (homework)', 'go through – read carefully / revise', 'catch up with – reach the same level as', 'fall behind – fail to keep up', 'drop out – leave school before finishing', 'pick up – learn quickly / informally', 'stand up for – defend or support', 'look into – investigate'),
        stepsB('Find the word or phrasal verb.', 'Think of the situation (homework, exam, punishment…).', 'Choose the meaning that fits the situation.', 'Substitute to check.'),
        remember('Do not confuse: hand in (submit) vs hand out (distribute); go through (revise) vs go off (alarm rings / food spoils).'),
      ],
      examples: [
        ex('Replace with a phrasal verb: "Please submit your project on Friday."', ['submit = hand in'], 'Please hand in your project on Friday.'),
        ex('Give a synonym of "diligent" in: "Imran is a diligent student."', ['He works carefully and hard.'], 'hard-working / industrious'),
      ],
      practice: [
        mcq('syn', 'Find the closest meaning.', [
          ['Synonym of "expel"', 'dismiss', ['welcome', 'admit', 'praise'], 'What happens to Swami?', 'To expel is to dismiss someone permanently.'],
          ['Synonym of "defy"', 'disobey', ['follow', 'respect', 'copy'], 'Refuse openly.', 'Defy = openly disobey.'],
          ['Synonym of "diligent"', 'industrious', ['idle', 'rude', 'forgetful'], 'Hard-working.', 'Diligent = industrious.'],
          ['Synonym of "punctual"', 'on time', ['late', 'lazy', 'noisy'], 'Arrives when expected.', 'Punctual = on time.'],
          ['Synonym of "humiliate"', 'embarrass', ['encourage', 'reward', 'protect'], 'Make someone feel ashamed.', 'Humiliate = embarrass publicly.'],
        ]),
        mcq('phrasal', 'Treat the verb and particle as one unit.', [
          ['Please ____ your answer sheets before you leave.', 'hand in', ['hand out', 'hand down', 'hand over to'], 'Submit.', 'Hand in = submit.'],
          ['After a month of illness, Sita worked hard to ____ her classmates.', 'catch up with', ['fall behind', 'drop out', 'look into'], 'Reach the same level.', 'Catch up with = reach the same level as.'],
          ['The principal promised to ____ the complaint about the broken fan.', 'look into', ['look up to', 'look like', 'look out'], 'Investigate.', 'Look into = investigate.'],
          ['Good friends ____ each other when someone is bullied.', 'stand up for', ['stand by for', 'stand out', 'stand down'], 'Defend.', 'Stand up for = defend.'],
          ['Let us ____ the chapter once more before the test.', 'go through', ['go off', 'go out', 'go away'], 'Revise.', 'Go through = read carefully / revise.'],
          ['Children pick ____ new languages quickly.', 'up', ['out', 'off', 'on'], 'Learn informally.', 'Pick up = learn without formal study.'],
        ]),
        matchT('pv', 'phrasal verb with its meaning', [
          ['hand out', 'distribute'], ['fall behind', 'fail to keep up'], ['drop out', 'leave school early'], ['go through', 'revise carefully'], ['look into', 'investigate'], ['hand in', 'submit'],
        ], ['Hand out and hand in go in opposite directions.', 'Drop out = leave before finishing.']),
      ],
    },
    {
      id: 'ts9.en.speech.reported', title: 'Grammar: direct and indirect (reported) speech', prereqs: [],
      intro: [
        h('Reporting what someone said'),
        def('Direct speech', 'The speaker’s exact words inside quotation marks: Ravi said, "I am tired."'),
        def('Indirect speech', 'The words reported in our own sentence, without quotation marks: Ravi said that he was tired.'),
        stepsB(
          'Change the reporting verb if needed: said to → told; questions → asked; orders → ordered/told; requests → requested.',
          'Remove the quotation marks; add a linker: that (statements), if/whether (yes–no questions), the wh-word (wh-questions), to + verb (commands).',
          'Change pronouns to match the reporter (I → he/she, we → they, you → me/him…).',
          'If the reporting verb is past, move tenses one step back: am/is → was, are → were, do → did, did → had done, will → would, can → could.',
          'Change words of time and place: now → then, today → that day, tomorrow → the next day, yesterday → the previous day, here → there, this → that.',
        ),
        remember('Common errors: (1) keeping question order in reported questions — "He asked where was I going" ✗ → "He asked where I was going" ✓. (2) "said me" ✗ → "told me" ✓. (3) A universal truth keeps its present tense: The teacher said that the earth goes round the sun.'),
      ],
      examples: [
        ex('Report: The teacher said to Swami, "Why are you late today?"', ['Question → asked', 'Wh-word "why" is the linker; statement order: subject + verb.', 'you → he; are → was; today → that day.'], 'The teacher asked Swami why he was late that day.'),
        ex('Report: Father said to me, "I will buy you a new bag tomorrow."', ['said to → told', 'I → he; you → me; will → would; tomorrow → the next day.'], 'Father told me that he would buy me a new bag the next day.'),
        ex('Report a command: The headmaster said to the boys, "Stand in a line."', ['Command → ordered/told + object + to + verb.'], 'The headmaster ordered the boys to stand in a line.'),
      ],
      practice: [
        mcq('convert', 'Follow the steps: verb, linker, pronoun, tense, time words.', [
          ['Meena said, "I am happy."', 'Meena said that she was happy.', ['Meena said that I am happy.', 'Meena told that she is happy.', 'Meena said she is being happy.'], 'am → was; I → she.', 'Statement: said that + she + was.'],
          ['Ravi said to me, "Are you coming?"', 'Ravi asked me if I was coming.', ['Ravi asked me are you coming.', 'Ravi told me if I am coming.', 'Ravi asked me that was I coming.'], 'Yes–no question → if/whether.', 'asked + if + statement order + past tense.'],
          ['The teacher said to us, "Open your books."', 'The teacher told us to open our books.', ['The teacher said that open your books.', 'The teacher told us that we open books.', 'The teacher asked if we open our books.'], 'Command → told + to + verb.', 'Commands become told/ordered + object + to-infinitive.'],
          ['Arjun said, "I bought a bat yesterday."', 'Arjun said that he had bought a bat the previous day.', ['Arjun said that he buys a bat yesterday.', 'Arjun said that I had bought a bat yesterday.', 'Arjun told that he bought a bat today.'], 'Past → past perfect; yesterday → the previous day.', 'bought → had bought; yesterday → the previous day.'],
          ['Sana asked, "Where is the library?"', 'Sana asked where the library was.', ['Sana asked where was the library.', 'Sana asked that where is the library.', 'Sana said where the library is.'], 'No question order in reported questions.', 'Wh-word + subject + verb: where the library was.'],
          ['The teacher said, "The sun rises in the east."', 'The teacher said that the sun rises in the east.', ['The teacher said that the sun had risen in the east.', 'The teacher told that the sun rising in the east.', 'The teacher said that rises the sun in the east.'], 'A universal truth.', 'Universal truths keep the present tense.'],
        ], 2),
        orderT('build', ['The reporting verb comes after the subject.', 'In reported questions, the subject comes before the verb.'], [
          ['Kavya asked me | where | I | was going.', 'Reported question: wh-word + subject + verb.'],
          ['The coach told the players | to reach the ground | by six o’clock.', 'told + object + to-infinitive.'],
          ['Grandfather said | that he | would visit us | the next day.', 'said that + pronoun + would + time phrase.'],
          ['Imran asked | whether | the shop | was open.', 'asked whether + subject + verb.'],
        ]),
        errT('spot', ['Check the reporting verb (said/told/asked).', 'Check word order in reported questions.'], [
          ['Priya | said me | that she | was busy.', 1, 'Priya told me that she was busy.', 'Say "told me", not "said me".'],
          ['He asked | where was | the | bus stand.', 1, 'He asked where the bus stand was.', 'Reported questions use statement order: subject + verb.'],
          ['Mother told | that she | would cook | biryani.', 0, 'Mother said that she would cook biryani.', '"Told" needs an object (told me/us); without one, use "said".'],
          ['The guard ordered | the boys | that | leave the gate.', 2, 'The guard ordered the boys to leave the gate.', 'Commands are reported with to + verb, not "that".'],
          ['Teja said | that he | will come | the next day.', 2, 'Teja said that he would come the next day.', 'After a past reporting verb, will → would.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.clauses.noun', title: 'Grammar: noun clauses', prereqs: ['ts9.en.clauses.adverbial'],
      intro: [
        h('A clause doing the job of a noun'),
        def('Noun clause', 'A dependent clause that works as a noun — as the subject, object or complement of a verb, or after a preposition.'),
        keys('Linkers: that, whether / if, what, who, where, when, why, how, whatever.', 'Object: I know THAT he is honest.', 'Subject: WHAT she said surprised us.', 'Complement: The problem is THAT we have no water.', 'After a preposition: Listen to WHAT the teacher says.'),
        stepsB('Find the main verb of the sentence.', 'Ask "what?" before or after it: what surprised us? what do I know?', 'If the answer is a whole clause (with subject + verb), that is the noun clause.', 'Name its job: subject, object, complement or object of a preposition.'),
        remember('Common errors: (1) question order inside a noun clause — "I don’t know where does he live" ✗ → "I don’t know where he lives" ✓. (2) A noun clause used as subject takes a singular verb: What we need IS more time.'),
        tip('Test: replace the clause with "it" or "something". If the sentence still works, it is a noun clause.'),
      ],
      examples: [
        ex('Find the noun clause and its job: "Everyone believes that Laxman is a gentleman."', ['Main verb: believes. Believes what?', 'Answer: that Laxman is a gentleman → object.'], 'Noun clause "that Laxman is a gentleman" — object of "believes".'),
        ex('Join using a noun clause: "Where did Swami go? Nobody knew."', ['Turn the question into a clause: where Swami went (statement order, past).'], 'Nobody knew where Swami went.'),
      ],
      practice: [
        mcq('job', 'Ask "what?" before or after the main verb.', [
          ['In "What he said made everyone laugh", the noun clause is the…', 'subject', ['object', 'complement', 'adverb'], 'What made everyone laugh?', 'The clause does the action of "made" → subject.'],
          ['In "I wonder whether it will rain", the noun clause is the…', 'object', ['subject', 'complement', 'adjective'], 'I wonder what?', 'It answers "wonder what?" → object.'],
          ['In "My hope is that I will pass", the noun clause is the…', 'complement', ['subject', 'object of a preposition', 'adverb'], 'It follows "is".', 'After a linking verb the clause is a complement.'],
          ['In "Pay attention to what the doctor says", the noun clause is the…', 'object of a preposition', ['subject', 'complement', 'main clause'], 'It follows "to".', 'The clause comes after the preposition "to".'],
          ['Which sentence contains a noun clause?', 'I know that you are honest.', ['I met a boy who sings well.', 'We left when it rained.', 'She is taller than me.'], 'Find a clause answering "what?".', '"that you are honest" is the object of "know".'],
        ]),
        mcq('join', 'Turn the question into a clause with statement word order.', [
          ['Join: "Where does Kiran live? I don’t know."', 'I don’t know where Kiran lives.', ['I don’t know where does Kiran live.', 'I don’t know where Kiran does live?', 'I don’t know that where Kiran lives.'], 'No question order.', 'Wh-word + subject + verb.'],
          ['Join: "Will the bus come? We are not sure."', 'We are not sure whether the bus will come.', ['We are not sure will the bus come.', 'We are not sure that will the bus come.', 'We are not sure the bus whether will come.'], 'Yes–no question → whether/if.', 'whether + subject + verb.'],
          ['Join: "He is innocent. This is clear."', 'It is clear that he is innocent.', ['It is clear he is innocent that.', 'That is clear he is innocent.', 'Clear is that he innocent.'], 'Use "It is clear that…".', 'A that-clause after "It is clear".'],
          ['Join: "What did she buy? Tell me."', 'Tell me what she bought.', ['Tell me what did she buy.', 'Tell me what she did buy?', 'Tell me that what she bought.'], 'did buy → bought.', 'Statement order: what she bought.'],
          ['Join: "Why was the match cancelled? Nobody explained."', 'Nobody explained why the match was cancelled.', ['Nobody explained why was the match cancelled.', 'Nobody explained that why the match cancelled.', 'Why nobody explained the match was cancelled.'], 'Subject before verb.', 'why + the match + was cancelled.'],
        ], 2),
        orderT('build', ['Find the wh-word or "that" — it starts the noun clause.', 'Inside the clause, the subject comes before the verb.'], [
          ['Nobody knows | why | the lights | went off.', 'Main clause → wh-word → subject → verb.'],
          ['What the coach said | inspired | the whole team.', 'Noun clause as subject → verb → object.'],
          ['The truth is | that | we | forgot the date.', 'Complement noun clause after "is".'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Unit 4 — Environment
// =====================================================================================
const u4: USpec = {
  id: 'ts9.en.u4', subject: 'english', title: 'Environment', source: src(4),
  note: 'Reading A is taught from the well-known 1850s address attributed to Chief Seattle (the textbook adaptation may differ in detail). Poem B (The River) and Reading C (Can’t Climb Trees Anymore) are referenced by theme only; the speech-writing objective is a WonderLab addition.',
  objectives: [
    {
      id: 'ts9.en.seattle.read', title: 'Reading: What is Man Without the Beasts?', prereqs: [],
      intro: [
        h('Context'),
        p('This reading comes from a famous speech or letter attributed to Chief Seattle, a leader of the Suquamish and Duwamish Native American peoples in the north-west of the USA, in the 1850s. The US government wanted to buy his people’s land. His reply has become one of the best-known statements about humans and nature — though historians note that the popular versions were rewritten by others later.'),
        h('Main ideas (our summary)'),
        keys(
          'The land cannot really be bought or sold: how can anyone own the sky, the freshness of the air or the sparkle of water?',
          'Every part of the earth is sacred to his people — the forests, the insects, the shining rivers.',
          'The earth is like a mother; the animals and plants are brothers and sisters; humans are a strand in the web of life, not its owners.',
          'He fears that the newcomers treat the earth like something to buy, use up and leave as a desert.',
          'Without animals, he warns, people would die of a great loneliness of spirit — whatever happens to the beasts soon happens to people.',
        ),
        def('Web of life', 'The idea that all living things are connected, so harming one part harms the whole.'),
        remember('Tone: dignified, sad and prophetic. Devices: rhetorical questions (asked for effect, not for an answer) and personification of the earth as a mother.'),
        tip('Link to today: deforestation, loss of sparrows and vultures, polluted lakes in our own cities.'),
      ],
      examples: [
        ex('Explain the title in one sentence.', ['"Beasts" = animals.', 'He says humans cannot live a full life without them.'], 'Humans depend on animals; without them people would suffer a deep loneliness and lose part of themselves.'),
        ex('Identify the device: "How can you buy the sky?"', ['It is asked for effect; no answer is expected.'], 'Rhetorical question'),
      ],
      practice: [
        mcq('comp', 'Recall the main ideas of the speech.', [
          ['Who is the speaker of this famous address?', 'Chief Seattle', ['Mahatma Gandhi', 'Abraham Lincoln', 'Rabindranath Tagore'], 'A Native American leader.', 'It is attributed to Chief Seattle.'],
          ['Why was the speech made?', 'The government wanted to buy his people’s land', ['He was elected president', 'A river had flooded', 'He was opening a school'], 'Think about land.', 'It was a reply to an offer to buy tribal land.'],
          ['According to the speech, the earth is like…', 'a mother', ['a market', 'a machine', 'a prison'], 'Personification.', 'The earth is presented as a mother to all.'],
          ['What would happen to people if all animals were gone?', 'They would suffer a great loneliness of spirit', ['They would become richer', 'They would live longer', 'Nothing would change'], 'Look at the title.', 'He says people would die of a great loneliness of spirit.'],
          ['"Humans are a strand in the web of life" means…', 'humans are one connected part of nature', ['humans are the owners of nature', 'humans make spider webs', 'humans should stay apart from nature'], 'A strand is one thread.', 'People are one thread connected to all others.'],
          ['The tone of the speech is best described as…', 'dignified and sad', ['playful and silly', 'angry and violent', 'boastful'], 'He speaks with calm sorrow.', 'The tone is dignified, sad and warning.'],
        ]),
        matchT('ideas', 'idea with its meaning', [
          ['Sacred earth', 'Every part of nature deserves respect'], ['Web of life', 'All living things are connected'], ['Rhetorical question', 'A question asked for effect'], ['Earth as mother', 'Nature gives life to all'], ['Loneliness of spirit', 'Emptiness humans feel without animals'],
        ], ['Think about how the speech uses each idea.', 'Rhetorical questions do not expect answers.']),
        orderT('sent', ['Start with the linker.', 'Then subject → verb → object.'], [
          ['If we destroy the forests, | the animals | will lose | their homes.', 'If-clause → subject → verb → object.'],
          ['Chief Seattle believed | that | the earth | belonged to no one.', 'Main clause → that → noun clause.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.env.speech', title: 'Writing: a speech on saving the environment', prereqs: [],
      intro: [
        h('Speech writing'),
        p('A speech is written to be heard. It must catch attention, make a few clear points and end with a call to action. This unit’s readings — an address about land, a poem about a river, and a story about the trees of childhood — give you ideas.'),
        stepsB(
          'Greeting: "Respected Headmaster, teachers and dear friends,"',
          'Introduce yourself and your topic in one or two lines.',
          'Hook: a question, a startling fact or a short story.',
          'Body: two or three points, each with an example (local if possible).',
          'Solutions: what we can do — at home, at school, in our village or colony.',
          'Conclusion: a memorable line and "Thank you."',
        ),
        h('Model speech (our own, short)'),
        p('Respected Headmaster, teachers and dear friends, I am Teja of Class IX, and I want to talk about our trees. Ten years ago our street in Khammam had twenty neem trees; today it has six. Without them, summers are hotter and the sparrows have gone. Trees give us shade, clean air and homes for birds. What can we do? Each of us can plant one sapling and water it, our school can start a green club, and we can say no to plastic. Let us make our school the greenest in the district. Thank you.'),
        keys('Checklist: greeting; self-introduction; hook; 2–3 points; solutions; strong ending; "Thank you"; use "we" and "us" to involve listeners.'),
        remember('Common errors: writing the speech like a letter (no "Yours faithfully" in a speech); forgetting the greeting; giving only problems and no solutions.'),
      ],
      examples: [
        ex('Write a hook for a speech on water saving.', ['Use a startling fact or question.'], 'Did you know that a dripping tap can waste thousands of litres of water in a year?'),
        ex('Write a call to action for a speech on plastic.', ['Make it specific and inclusive (we/us).'], 'From tomorrow, let us all carry cloth bags to the market.'),
      ],
      practice: [
        orderT('parts', ['Greeting first.', '"Thank you" is last.'], [
          ['Respected Headmaster, teachers and friends, | I am Diya of Class IX. | Did you know our lake has shrunk by half? | Plastic and sewage are choking it. | Let us start a clean-lake drive this Sunday. | Thank you.', 'Greeting → introduction → hook → problem → call to action → thanks.'],
          ['Trees give us shade, | clean air | and | homes for birds.', 'A list of three with "and" before the last item.'],
        ]),
        mcq('choose', 'A speech is spoken to a live audience.', [
          ['Which is the best opening for a speech?', 'Respected Headmaster, teachers and dear friends,', ['Dear Sir, I am writing to you…', 'Yours faithfully,', 'Subject: Trees'], 'You are speaking, not writing a letter.', 'Speeches open with a greeting to the audience.'],
          ['Which is the best hook?', 'Imagine a summer with no shade anywhere in our town.', ['My name is Ravi.', 'That is all.', 'Trees are trees.'], 'A hook grabs attention.', 'An "imagine" opening makes listeners picture the problem.'],
          ['Which is the best call to action?', 'Let us each plant one sapling this monsoon.', ['Trees are being cut.', 'I like trees.', 'Someone should do something someday.'], 'Specific and inclusive.', 'A call to action tells the audience exactly what to do.'],
          ['Which sentence suits the conclusion?', 'Together, we can make our town green again. Thank you.', ['Respected Headmaster…', 'First, let me tell you my name.', 'Yours obediently,'], 'Endings sum up and thank.', 'A strong conclusion inspires and thanks listeners.'],
          ['Why do speakers use "we" and "us"?', 'To involve the listeners', ['To sound angry', 'To avoid giving facts', 'To make the speech longer'], 'Think of the audience.', 'Inclusive pronouns make listeners feel part of the action.'],
        ]),
        matchT('elements', 'speech part with its example', [
          ['Greeting', 'Respected teachers and dear friends,'], ['Hook', 'Did you know half our sparrows have vanished?'], ['Point', 'Plastic blocks our drains and causes floods.'], ['Call to action', 'Let us carry cloth bags from today.'], ['Closing', 'Thank you for listening.'],
        ], ['A hook makes people curious.', 'A call to action starts with "Let us…".']),
      ],
    },
    {
      id: 'ts9.en.env.vocab', title: 'Vocabulary: word combinations and words denoting movement', prereqs: [],
      intro: [
        h('Words that show how things move'),
        p('English has many precise verbs for movement. Choosing the exact verb makes writing vivid.'),
        keys('Water: flow, trickle (slowly in drops), gush (suddenly and strongly), meander (wind slowly in curves), cascade (fall like a waterfall), ripple (small waves).', 'People/animals: stroll (walk slowly for pleasure), stagger (walk unsteadily), crawl, dart (move suddenly and quickly), leap, tiptoe, march, wander.', 'Birds/air: soar (fly high), glide (move smoothly), flutter (flap quickly and lightly), hover (stay in one place in the air).'),
        h('Word combinations'),
        p('Some words combine with others in fixed ways: "natural resources", "global warming", "climate change", "endangered species", "carbon footprint", "food chain", "rain forest".'),
        stepsB('Picture the movement or thing.', 'Ask: fast or slow? smooth or unsteady? high or low?', 'Pick the verb whose meaning matches the picture.'),
        remember('Do not mix: a river meanders (not "staggers"); an eagle soars (not "crawls"); water trickles from a leaking tap but gushes from a burst pipe.'),
      ],
      examples: [
        ex('Choose: "The Godavari ____ through the plains in wide curves." (gushes / meanders / darts)', ['Wide curves, slowly → meander.'], 'meanders'),
        ex('Complete the combination: "The tiger is an ____ species."', ['Species at risk of disappearing.'], 'endangered'),
      ],
      practice: [
        mcq('movement', 'Picture how the thing is moving.', [
          ['Water ____ from the burst pipe and flooded the road.', 'gushed', ['trickled', 'strolled', 'hovered'], 'A burst pipe — sudden and strong.', 'Gush = flow out suddenly and strongly.'],
          ['A tear ____ down Kavya’s cheek.', 'trickled', ['gushed', 'soared', 'marched'], 'Slowly, a little.', 'Trickle = flow slowly in a thin stream.'],
          ['The eagle ____ high above the hills.', 'soared', ['crawled', 'staggered', 'trickled'], 'High in the sky.', 'Soar = fly high.'],
          ['The injured man ____ to the bench.', 'staggered', ['soared', 'darted', 'glided'], 'Unsteady walking.', 'Stagger = walk unsteadily.'],
          ['A lizard ____ across the wall and vanished.', 'darted', ['meandered', 'strolled', 'cascaded'], 'Very quick and sudden.', 'Dart = move suddenly and quickly.'],
          ['A hummingbird ____ in front of the flower.', 'hovered', ['staggered', 'gushed', 'marched'], 'Staying in one place in the air.', 'Hover = stay in one place in the air.'],
          ['In the evening, my grandparents ____ in the park.', 'stroll', ['gush', 'dart', 'soar'], 'Slow, relaxed walk.', 'Stroll = walk slowly for pleasure.'],
        ]),
        matchT('verbs', 'movement verb with its meaning', [
          ['meander', 'wind slowly in curves'], ['flutter', 'flap lightly and quickly'], ['tiptoe', 'walk quietly on the toes'], ['cascade', 'fall like a waterfall'], ['glide', 'move smoothly and easily'], ['crawl', 'move on hands and knees'],
        ], ['Act out each verb in your mind.', 'A waterfall cascades.']),
        mcq('combo', 'Which word naturally combines?', [
          ['Rising temperatures across the planet are called global ____.', 'warming', ['heating up', 'burning', 'fire'], 'A fixed term.', 'The term is "global warming".'],
          ['Animals at risk of dying out are ____ species.', 'endangered', ['dangerous', 'endless', 'angry'], 'In danger.', 'The combination is "endangered species".'],
          ['Forests, water and minerals are natural ____.', 'resources', ['sources', 'courses', 'forces'], 'Things we use from nature.', 'The phrase is "natural resources".'],
          ['Grass → deer → tiger is an example of a food ____.', 'chain', ['line', 'rope', 'list'], 'Links one after another.', 'The phrase is "food chain".'],
          ['The amount of carbon your lifestyle adds to the air is your carbon ____.', 'footprint', ['handprint', 'footstep', 'fingerprint'], 'A mark you leave behind.', 'The phrase is "carbon footprint".'],
        ]),
      ],
    },
    {
      id: 'ts9.en.verb.phrase', title: 'Grammar: the verb phrase — auxiliaries and main verb', prereqs: [],
      intro: [
        h('Inside a verb phrase'),
        p('A verb phrase is the main verb plus any helping verbs (auxiliaries) before it: "has been planting", "will be cut", "should have watered".'),
        def('Primary auxiliaries', 'be (am, is, are, was, were, been, being), have (has, had), do (does, did) — used to form tenses, passives, questions and negatives.'),
        def('Modal auxiliaries', 'can, could, may, might, shall, should, will, would, must, ought to — show ability, permission, possibility, obligation, etc. A modal is followed by the base form of the verb.'),
        def('Main (lexical) verb', 'The verb that carries the meaning: plant, flow, protect.'),
        stepsB('Find the last verb in the group — that is the main verb.', 'Every verb before it is an auxiliary.', 'Order is fixed: modal → have → be (progressive) → be (passive) → main verb.', 'After a modal use the base form; after have use V3; after progressive be use -ing; after passive be use V3.'),
        remember('Common errors: "can plays" ✗ → "can play" ✓; "must to go" ✗ → "must go" ✓ (but "ought to go" ✓); "did not went" ✗ → "did not go" ✓; "has went" ✗ → "has gone" ✓.'),
      ],
      examples: [
        ex('Split the verb phrase: "The trees should have been protected."', ['Main verb (last): protected.', 'Auxiliaries: should (modal), have (perfect), been (passive).'], 'Auxiliaries: should, have, been; main verb: protected.'),
        ex('Correct: "We did not planted any saplings last year."', ['After do/did use the base form.'], 'We did not plant any saplings last year.'),
      ],
      practice: [
        mcq('main', 'The main verb is the last verb in the group.', [
          ['Find the main verb in "The river has been flowing for centuries."', 'flowing', ['has', 'been', 'centuries'], 'Look at the last verb.', 'flowing carries the meaning; has and been are auxiliaries.'],
          ['Find the modal in "Children must protect the birds."', 'must', ['protect', 'children', 'birds'], 'Modals show obligation, ability, etc.', 'must is a modal auxiliary.'],
          ['Find the main verb in "Many forests are being cleared."', 'cleared', ['are', 'being', 'forests'], 'The last verb.', 'cleared is the main verb in this passive phrase.'],
          ['How many auxiliaries are in "She might have forgotten the date"?', 'Two (might, have)', ['One (might)', 'Three (might, have, forgotten)', 'None'], 'The main verb is not an auxiliary.', 'might + have are auxiliaries; forgotten is the main verb.'],
          ['Which word is a primary auxiliary in "Does the river flood every year?"', 'Does', ['river', 'flood', 'every'], 'It helps form the question.', 'Does is a form of "do", a primary auxiliary.'],
        ]),
        mcq('form', 'Check what follows each auxiliary.', [
          ['We can ____ water by fixing leaking taps.', 'save', ['saves', 'saved', 'saving'], 'Modal + base form.', 'After can, use the base form: save.'],
          ['The pond has ____ cleaned by volunteers.', 'been', ['be', 'being', 'was'], 'have + V3 of be.', 'has been + V3 (passive perfect).'],
          ['They are ____ trees along the highway.', 'planting', ['plant', 'planted', 'plants'], 'Progressive be + -ing.', 'are + planting (present continuous).'],
          ['Did you ____ the birds today?', 'feed', ['fed', 'feeding', 'feeds'], 'did + base form.', 'After did, use the base form.'],
          ['You ought ____ switch off the fan when you leave.', 'to', ['for', 'must', 'be'], 'This modal includes a word.', '"Ought to" + base form.'],
          ['The lake should have ____ protected years ago.', 'been', ['be', 'being', 'is'], 'modal + have + been + V3.', 'should have been protected.'],
        ]),
        errT('spot', ['Check the form after each auxiliary.', 'Modals take the base form.'], [
          ['Farmers | can grows | two crops | a year here.', 1, 'Farmers can grow two crops a year here.', 'After a modal, use the base form: grow.'],
          ['We | must to save | the sparrows | before it is too late.', 1, 'We must save the sparrows before it is too late.', '"Must" is followed directly by the base form.'],
          ['Last year | the villagers did not cut | the old tree | because they has respect for it.', 3, 'Last year the villagers did not cut the old tree because they had respect for it.', 'Plural "they" with past time → had.'],
          ['The canal | has went | dry | this summer.', 1, 'The canal has gone dry this summer.', 'After has, use V3: gone.'],
          ['The saplings | are water | every morning | by the students.', 1, 'The saplings are watered every morning by the students.', 'Passive be + V3: watered.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.transform', title: 'Grammar: sentence transformation', prereqs: ['ts9.en.clauses.adverbial'],
      intro: [
        h('Same meaning, different structure'),
        p('Transformation means rewriting a sentence in another grammatical form without changing its meaning. It shows control over grammar and makes writing varied.'),
        keys('too…to ↔ so…that…not: The tea is too hot to drink. ↔ The tea is so hot that we cannot drink it.', 'Simple ↔ complex ↔ compound: Being ill, he stayed home. ↔ As he was ill, he stayed home. ↔ He was ill, so he stayed home.', 'Affirmative ↔ negative: Only Sita passed. ↔ None but Sita passed.', 'Degrees of comparison: Hyderabad is the biggest city in Telangana. ↔ Hyderabad is bigger than any other city in Telangana. ↔ No other city in Telangana is as big as Hyderabad.', 'Exclamatory ↔ assertive: What a beautiful lake it is! ↔ It is a very beautiful lake.'),
        stepsB('Identify the pattern the question asks for.', 'Keep the tense and the meaning exactly the same.', 'Change only what the pattern needs (linkers, negatives, comparative words).', 'Read both sentences — do they mean exactly the same?'),
        remember('Common errors: "too…to" already contains a negative idea — do not add "not". In "so…that", the negative comes in the that-clause. In comparisons, write "than any other city", not "than any city" (that would include Hyderabad itself).'),
      ],
      examples: [
        ex('Rewrite using "so…that": "The water is too dirty to drink."', ['too X to Y → so X that … cannot Y', 'Add a subject and "it" for the object.'], 'The water is so dirty that we cannot drink it.'),
        ex('Rewrite as a compound sentence: "As it was raining, the farmers were happy."', ['Reason clause → main clause + "so".'], 'It was raining, so the farmers were happy.'),
        ex('Rewrite in the comparative degree: "The Godavari is the longest river in Telangana."', ['Superlative → comparative + than any other.'], 'The Godavari is longer than any other river in Telangana.'),
      ],
      practice: [
        mcq('choose', 'Keep the meaning exactly the same.', [
          ['"The box is too heavy to lift." means the same as…', 'The box is so heavy that I cannot lift it.', ['The box is so heavy that I can lift it.', 'The box is too heavy not to lift.', 'The box is heavy enough to lift.'], 'too…to has a negative meaning.', 'so…that + cannot keeps the meaning.'],
          ['"Being tired, Ravi went to bed early." means the same as…', 'As Ravi was tired, he went to bed early.', ['Ravi was tired but he went to bed early.', 'Though Ravi was tired, he went to bed early.', 'If Ravi is tired, he goes to bed early.'], 'Being tired = because he was tired.', 'The participle shows reason → "As…".'],
          ['"Only the brave can climb this peak." means the same as…', 'None but the brave can climb this peak.', ['All the brave cannot climb this peak.', 'The brave only cannot climb this peak.', 'Nobody can climb this peak.'], 'Only ↔ none but.', '"None but" is the negative form of "only".'],
          ['"What a lovely garden it is!" means the same as…', 'It is a very lovely garden.', ['It is not a lovely garden.', 'Is it a lovely garden?', 'What is a lovely garden?'], 'Exclamatory → assertive.', 'Replace "What a…!" with "very" in a statement.'],
          ['"No other bird is as colourful as the peacock." means the same as…', 'The peacock is the most colourful bird.', ['The peacock is a colourful bird.', 'The peacock is more colourful than all birds including itself.', 'Some birds are more colourful than the peacock.'], 'Positive → superlative.', '"No other…as…as" = the superlative.'],
          ['Join with "although": "He worked hard. He failed."', 'Although he worked hard, he failed.', ['Although he worked hard, but he failed.', 'He worked hard although he failed.', 'Although he failed, so he worked hard.'], 'Do not use "but" with although.', 'Although + clause, main clause.'],
        ], 2),
        orderT('build', ['Find the linker (so…that, too…to, than any other).', 'Keep the subject first.'], [
          ['The river | is so polluted | that | fish cannot live in it.', 'so + adjective + that + negative clause.'],
          ['Mount Everest | is higher | than any other | mountain in the world.', 'comparative + than any other + singular noun.'],
          ['The boy | is too young | to | vote.', 'too + adjective + to + verb.'],
          ['Though he was poor, | the farmer | was | always honest.', 'Though-clause + comma → main clause.'],
        ]),
        errT('spot', ['Check for doubled negatives or linkers.', 'Check "than any other" + singular noun.'], [
          ['The tea | was too hot | not to | drink.', 2, 'The tea was too hot to drink.', '"too…to" already has a negative meaning; remove "not".'],
          ['Hyderabad is | bigger than | any city | in Telangana.', 2, 'Hyderabad is bigger than any other city in Telangana.', 'Use "any other" — Hyderabad cannot be bigger than itself.'],
          ['He was | so weak | that he | can not walk.', 3, 'He was so weak that he could not walk.', 'Keep tense consistent: past → could not.'],
          ['Although | the road was bad, | yet | we reached on time.', 2, 'Although the road was bad, we reached on time.', 'Do not combine "although" with "yet" in exam English.'],
          ['Ravi is | more taller | than | his brother.', 1, 'Ravi is taller than his brother.', '"Taller" is already comparative; do not add "more".'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Unit 5 — Disasters
// =====================================================================================
const u5: USpec = {
  id: 'ts9.en.u5', subject: 'english', title: 'Disasters', source: src(5),
  note: 'Reading C (The Ham Radio) is taught from general facts about amateur radio in disaster relief; Reading A (A Havoc of Flood) and Poem B (Grabbing Everything on the Land) are referenced by theme only — teacher to add text-specific details. The report-writing objective is a WonderLab addition.',
  objectives: [
    {
      id: 'ts9.en.hamradio.read', title: 'Reading: disasters and The Ham Radio', prereqs: [],
      intro: [
        h('The unit’s readings'),
        p('This unit looks at natural disasters from three angles: an account of the destruction a flood causes (Reading A), a poem imagining the waters seizing everything on land (Poem B), and a piece about how ham radio helps when ordinary communication fails (Reading C). Treat the human suffering in these texts with respect: they are about real loss.'),
        h('What is ham radio?'),
        def('Ham radio (amateur radio)', 'Two-way radio communication by licensed, non-commercial operators ("hams") using their own transmitters and receivers. It needs no mobile tower, internet or telephone exchange.'),
        keys(
          'Each licensed operator has a unique call sign; Indian call signs usually begin with VU. Licences are issued by the central government after an examination.',
          'When cyclones, floods, earthquakes or tsunamis knock out power lines and mobile towers, hams can still talk over long distances using battery-powered sets.',
          'Ham operators have helped in Indian disasters such as the 1999 Odisha super cyclone, the 2004 tsunami (especially the Andaman and Nicobar Islands) and the 2013 Uttarakhand floods — passing messages about missing people and urgent needs.',
          'Hams are volunteers: they serve the community without payment.',
        ),
        remember('Themes: the destructive power of nature, the importance of preparedness, and how technology and volunteers save lives when systems collapse.'),
      ],
      examples: [
        ex('Why is ham radio useful when a cyclone strikes?', ['Cyclones often bring down power lines and mobile towers.', 'Ham radios run on batteries and talk directly, set to set.'], 'It keeps working when phones and internet fail, so it can carry rescue and relief messages.'),
        ex('Pick the word for a ham operator’s unique identity: (a) PIN (b) call sign (c) password.', ['Every radio station identifies itself on air.'], '(b) call sign'),
      ],
      practice: [
        mcq('comp', 'Recall what ham radio is and how it helps.', [
          ['Ham radio is another name for…', 'amateur radio', ['satellite TV', 'mobile telephone', 'FM music radio'], 'Operated by non-professionals.', 'Ham radio = amateur radio.'],
          ['Why does ham radio work when mobiles fail?', 'It does not depend on towers or the internet', ['It uses stronger SIM cards', 'It works only in cities', 'It needs a fast Wi-Fi network'], 'Think about what a disaster destroys.', 'Radio sets talk directly, so towers and internet are not needed.'],
          ['Who operates ham radios?', 'Licensed volunteers', ['Only army officers', 'Anyone without a licence', 'Only TV reporters'], 'They pass an exam.', 'Hams are licensed amateurs who usually serve voluntarily.'],
          ['Indian ham call signs usually begin with…', 'VU', ['IN', 'TS', 'HM'], 'Two letters.', 'India’s amateur call signs mostly use the VU prefix.'],
          ['In which disaster did hams famously help the Andaman and Nicobar Islands?', 'The 2004 tsunami', ['The 1999 Kargil conflict', 'The 2020 lockdown', 'The 1947 Partition'], 'A giant sea wave.', 'Hams relayed messages from the islands after the 2004 tsunami.'],
          ['Which is the main theme of the unit?', 'Preparedness and help during disasters', ['Sports training', 'School discipline', 'Travel and tourism'], 'Look at the unit title.', 'The unit deals with disasters and how people respond.'],
        ]),
        matchT('words', 'disaster word with its meaning', [
          ['havoc', 'great destruction and confusion'], ['relief', 'help such as food and shelter for victims'], ['evacuate', 'move people away from danger'], ['tsunami', 'a huge sea wave caused by an undersea earthquake'], ['casualty', 'a person killed or injured'], ['volunteer', 'someone who works without pay to help'],
        ], ['Use the unit’s theme for clues.', 'Evacuate = move out of danger.']),
        orderT('sent', ['Begin with the time clause or the subject.', 'Keep the cause before the result.'], [
          ['When the cyclone cut the phone lines, | ham operators | sent | messages for help.', 'Time clause → subject → verb → object.'],
          ['The flood | washed away | roads, bridges | and crops.', 'Subject → verb → list with "and" before the last item.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.disaster.report', title: 'Writing: a news report', prereqs: [],
      intro: [
        h('Report writing'),
        p('A news report tells readers what happened, clearly and objectively. It answers the 5 W’s and H: What, When, Where, Who, Why and How.'),
        stepsB(
          'Headline: short, present tense, no full sentence needed (e.g. "Heavy Rain Floods Low-lying Areas of Warangal").',
          'Byline / dateline: "By a Staff Reporter, Warangal, 22 July".',
          'Opening paragraph: the most important facts — what, where, when.',
          'Body: details — causes, damage, people affected, rescue and relief.',
          'Closing: present situation, official statements, advice or what is planned next.',
        ),
        h('Model report (our own)'),
        p('HEAVY RAIN FLOODS LOW-LYING COLONIES IN WARANGAL. By a Staff Reporter, Warangal, 22 July. Continuous rain for two days flooded several low-lying colonies in Warangal on Tuesday. Water entered nearly 300 houses, and residents were shifted to relief camps in nearby schools. Disaster response teams used boats to rescue elderly people and children. No loss of life was reported. Officials have asked people to stay away from overflowing tanks and to boil drinking water. Relief work is continuing.'),
        keys('Checklist: headline; dateline; 5 W’s + H in the first paragraph; past tense for events; facts not opinions; third person; a closing line on the present situation.'),
        remember('Common errors: writing "I saw…" (a report is impersonal); adding personal feelings; forgetting the place and date; writing the headline as a long sentence.'),
      ],
      examples: [
        ex('Write a headline for a report about a fire in a cotton market in Adilabad.', ['Short, key nouns, present tense.'], 'Fire Breaks Out in Adilabad Cotton Market'),
        ex('Turn this into report style: "I was so scared when the river came into our street!"', ['Remove "I" and feelings; state the fact.'], 'The river overflowed and water entered the street.'),
      ],
      practice: [
        orderT('format', ['The headline is first.', 'The present situation comes last.'], [
          ['Headline | Byline and dateline | Main facts: what, where, when | Details of damage and rescue | Present situation and advice', 'A report moves from the most important facts to details and then the current situation.'],
          ['Relief camps | were set up | in three schools | on Tuesday.', 'Subject → passive verb → place → time.'],
        ]),
        mcq('style', 'Reports are factual and impersonal.', [
          ['Which is the best headline?', 'Floods Cut Off Ten Villages Near Bhadrachalam', ['I want to tell you about the floods', 'Floods!!! Very bad!!!', 'Once upon a time there was a flood'], 'Short and informative.', 'A headline states the key fact briefly.'],
          ['Which sentence suits a news report?', 'Over 200 families were moved to relief camps.', ['I felt really sad for the families.', 'Oh, what a terrible day it was!', 'You should have seen the water!'], 'Facts, not feelings.', 'A report states facts objectively.'],
          ['Which question does the opening paragraph NOT need to answer?', 'What did the reporter eat that day?', ['What happened?', 'Where did it happen?', 'When did it happen?'], 'The 5 W’s.', 'The reporter’s personal life is irrelevant.'],
          ['Which tense is used for the events in a report?', 'Past tense', ['Future tense', 'Only present continuous', 'Imperative'], 'The events have already happened.', 'Events are reported in the past tense.'],
          ['Which is a correct dateline?', 'By a Staff Reporter, Nalgonda, 4 August', ['Dear Sir,', 'Yours faithfully,', 'Thank you for reading'], 'It gives the reporter and place.', 'A dateline names the reporter, place and date.'],
        ]),
        matchT('5w', 'question with the detail it asks for', [
          ['What?', 'A cloudburst caused floods'], ['Where?', 'In three villages of Mulugu district'], ['When?', 'On Sunday night'], ['Who?', 'About 500 residents were affected'], ['How?', 'Rescuers used boats and ropes'],
        ], ['Each question looks for a different kind of fact.', 'How = the method or manner.']),
      ],
    },
    {
      id: 'ts9.en.disaster.vocab', title: 'Vocabulary: shades of meaning and concept maps', prereqs: [],
      intro: [
        h('Shades of meaning'),
        p('Words with similar meanings often differ in strength or situation. "Bright" light can be gleaming, shining, dazzling or brilliant — "dazzling" is so bright it hurts the eyes, "glowing" is soft and steady.'),
        keys('Light: glimmer (faint) → glow (soft, steady) → shine → gleam → dazzle (too bright)', 'Wet: damp (slightly) → moist → wet → soaked → drenched (completely)', 'Water rising: rise → swell → overflow → flood → submerge (cover completely)', 'Wind: breeze (gentle) → wind → gale → storm → cyclone', 'Fear: uneasy → worried → afraid → terrified → panic-stricken'),
        h('Concept map'),
        p('A concept map puts a key word in the centre and links related words around it. For "flood": causes (heavy rain, dam burst, cloudburst), effects (damage, disease, homelessness), response (evacuation, rescue, relief camps), prevention (drains, embankments, warnings).'),
        stepsB('Read the sentence for how strong the meaning is.', 'Place the options on a scale from weakest to strongest.', 'Pick the one that matches the strength of the situation.'),
        remember('Do not choose the "biggest" word every time: a light drizzle makes you damp, not drenched.'),
      ],
      examples: [
        ex('Choose: "After standing in the downpour for an hour, we were (damp / drenched)."', ['An hour in a downpour = completely wet.'], 'drenched'),
        ex('Arrange from weakest to strongest: gale, breeze, cyclone.', ['breeze is gentle; gale is strong; cyclone is extreme.'], 'breeze → gale → cyclone'),
      ],
      practice: [
        mcq('shade', 'Match the strength of the word to the situation.', [
          ['A ____ light from a distant hut showed us the way.', 'faint', ['dazzling', 'blinding', 'brilliant'], 'Distant and small.', 'A distant light is faint.'],
          ['The welder’s flame was so ____ that we had to look away.', 'dazzling', ['dim', 'faint', 'gloomy'], 'Too bright to look at.', 'Dazzling = so bright it hurts the eyes.'],
          ['The light drizzle left our clothes slightly ____.', 'damp', ['drenched', 'soaked', 'submerged'], 'Slightly wet.', 'Damp = slightly wet.'],
          ['A gentle ____ cooled the evening air.', 'breeze', ['cyclone', 'gale', 'storm'], 'Gentle wind.', 'A breeze is a light, gentle wind.'],
          ['When the dam burst, whole villages were ____.', 'submerged', ['damp', 'moist', 'sprinkled'], 'Completely under water.', 'Submerged = covered completely by water.'],
          ['When the building shook, people were ____ and ran in all directions.', 'panic-stricken', ['slightly uneasy', 'calm', 'bored'], 'Extreme fear causing wild action.', 'Panic-stricken = overcome by sudden extreme fear.'],
        ]),
        orderT('scale', ['Start with the weakest.', 'End with the strongest.'], [
          ['breeze | wind | gale | cyclone', 'Wind strength increases from breeze to cyclone.'],
          ['damp | wet | soaked | drenched', 'Wetness increases from damp to drenched.'],
          ['glimmer | glow | shine | dazzle', 'Brightness increases from glimmer to dazzle.'],
          ['uneasy | worried | afraid | terrified', 'Fear grows from uneasy to terrified.'],
        ]),
        matchT('map', 'flood word with its branch on the concept map', [
          ['cloudburst', 'cause'], ['homelessness', 'effect'], ['evacuation', 'response'], ['embankment', 'prevention'],
        ], ['Ask: does it start the flood, result from it, deal with it, or stop it?', 'An embankment is built to keep water out.']),
      ],
    },
    {
      id: 'ts9.en.nosooner', title: 'Grammar: no sooner…than, scarcely/hardly…when', prereqs: ['ts9.en.pastperf.use'],
      intro: [
        h('One thing happened immediately after another'),
        p('These patterns show that a second action followed the first almost at once. They are formal and common in sentence-transformation questions.'),
        keys('No sooner had + subject + V3 … than + simple past: No sooner had the siren sounded than people ran to safety.', 'Hardly / Scarcely had + subject + V3 … when + simple past: Hardly had we reached home when it began to pour.', 'Plain version: As soon as the siren sounded, people ran to safety.'),
        stepsB(
          'Find the first action (it becomes past perfect: had + V3).',
          'Put "No sooner" / "Hardly" / "Scarcely" at the start.',
          'Invert: had + subject + V3 (question order).',
          'Join the second action with "than" (after no sooner) or "when" (after hardly/scarcely), in simple past.',
        ),
        remember('Common errors: "No sooner … when" ✗ → "No sooner … than" ✓; "Hardly … than" ✗ → "Hardly … when" ✓; forgetting inversion — "No sooner the bell had rung" ✗ → "No sooner had the bell rung" ✓.'),
      ],
      examples: [
        ex('Rewrite with "No sooner": "As soon as the warning was given, the fishermen returned to the shore."', ['First action: the warning was given → had the warning been given.', 'Second: the fishermen returned (simple past) with "than".'], 'No sooner had the warning been given than the fishermen returned to the shore.'),
        ex('Rewrite with "Hardly": "As soon as we left the house, the roof collapsed."', ['Hardly + had we left', '+ when + the roof collapsed'], 'Hardly had we left the house when the roof collapsed.'),
        ex('Rewrite with "As soon as": "Scarcely had the rain stopped when the children ran outside."', ['Remove inversion: the rain stopped.', 'As soon as + first action, second action.'], 'As soon as the rain stopped, the children ran outside.'),
      ],
      practice: [
        mcq('link', 'No sooner pairs with "than"; hardly/scarcely pair with "when".', [
          ['No sooner had the bell rung ____ the students rushed out.', 'than', ['when', 'then', 'that'], 'Comparative-like word.', 'No sooner … than.'],
          ['Hardly had the boat left ____ the storm began.', 'when', ['than', 'then', 'so'], 'Hardly pairs with this.', 'Hardly … when.'],
          ['Scarcely had the doctor arrived ____ the patient opened his eyes.', 'when', ['than', 'but', 'and'], 'Like hardly.', 'Scarcely … when.'],
          ['No sooner ____ the dam gates opened than the water rushed out.', 'had', ['did', 'were', 'have'], 'Past perfect, inverted.', 'No sooner had + subject + V3.'],
          ['Hardly had we ____ our tents when the wind blew them away.', 'pitched', ['pitch', 'pitching', 'pitches'], 'had + V3.', 'had pitched (past participle).'],
        ]),
        mcq('transform', 'Invert: had + subject + V3.', [
          ['"As soon as the lights went off, the baby started crying." (No sooner)', 'No sooner had the lights gone off than the baby started crying.', ['No sooner the lights had gone off than the baby started crying.', 'No sooner had the lights gone off when the baby started crying.', 'No sooner did the lights went off than the baby started crying.'], 'Inversion + than.', 'No sooner had + subject + V3 … than …'],
          ['"As soon as the rescue team arrived, the villagers cheered." (Hardly)', 'Hardly had the rescue team arrived when the villagers cheered.', ['Hardly the rescue team had arrived when the villagers cheered.', 'Hardly had the rescue team arrived than the villagers cheered.', 'Hardly had the rescue team arrive when the villagers cheered.'], 'Inversion + when.', 'Hardly had + subject + V3 … when …'],
          ['"No sooner had the earth shaken than the walls cracked." (As soon as)', 'As soon as the earth shook, the walls cracked.', ['As soon as had the earth shaken, the walls cracked.', 'As soon as the earth shook than the walls cracked.', 'As soon as the earth shaken, the walls cracked.'], 'Remove inversion and "than".', 'As soon as + simple past, simple past.'],
          ['"As soon as she saw the snake, she screamed." (Scarcely)', 'Scarcely had she seen the snake when she screamed.', ['Scarcely she had seen the snake when she screamed.', 'Scarcely had she saw the snake when she screamed.', 'Scarcely had she seen the snake than she screamed.'], 'V3 of see = seen.', 'Scarcely had she seen … when …'],
          ['"As soon as the match began, it started to rain." (No sooner)', 'No sooner had the match begun than it started to rain.', ['No sooner had the match began than it started to rain.', 'No sooner the match had begun than it started to rain.', 'No sooner had the match begun when it started to rain.'], 'V3 of begin = begun.', 'No sooner had the match begun than …'],
        ], 2),
        errT('spot', ['Check the linker (than / when).', 'Check inversion and V3.'], [
          ['No sooner | had the siren sounded | when | people left the building.', 2, 'No sooner had the siren sounded than people left the building.', 'No sooner pairs with "than".'],
          ['Hardly | the guests had arrived | when | the lights went out.', 1, 'Hardly had the guests arrived when the lights went out.', 'Invert: had + subject + V3.'],
          ['Scarcely | had he | reach the shore | when the wave hit.', 2, 'Scarcely had he reached the shore when the wave hit.', 'After had, use V3: reached.'],
          ['Hardly | had we sat down | than | the train moved.', 2, 'Hardly had we sat down when the train moved.', 'Hardly pairs with "when".'],
          ['No sooner | did the gates open | than | the crowd rushed in.', 1, 'No sooner had the gates opened than the crowd rushed in.', 'Use the past perfect after No sooner: had + subject + V3.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.infinitive.future', title: 'Grammar: to-infinitive for future time (be to, be about to)', prereqs: [],
      intro: [
        h('Talking about planned or arranged future'),
        p('Besides "will" and "going to", English uses be + to-infinitive for official plans, arrangements and instructions — very common in news reports.'),
        keys('be to + verb = an official plan or arrangement: The Chief Minister is to visit the flood-hit areas tomorrow.', 'be to + verb = an instruction or rule: All students are to assemble in the hall at 9 a.m.', 'be about to + verb = very near future: Hurry, the bus is about to leave.', 'was/were to + verb = a past plan (often one that did not happen): The ship was to sail on Monday, but the cyclone delayed it.'),
        stepsB('Decide the meaning: official plan, instruction, or "very soon".', 'Choose the correct form of be (am/is/are/was/were) to agree with the subject.', 'Add "to" (or "about to") + base form of the verb.'),
        remember('Common errors: "is to visited" ✗ → "is to visit" ✓ (base form after to); "about to leaving" ✗ → "about to leave" ✓; do not use a time word like "tomorrow" with "about to" — it already means "right now".'),
      ],
      examples: [
        ex('Rewrite as an official plan: "The Governor will open the new bridge on Friday."', ['Official arrangement → is to + base form.'], 'The Governor is to open the new bridge on Friday.'),
        ex('Use "about to": "The train will leave in a moment."', ['Very near future → is about to leave.'], 'The train is about to leave.'),
      ],
      practice: [
        mcq('form', 'be + to + base form.', [
          ['The Prime Minister ____ visit Hyderabad next week.', 'is to', ['are to', 'is to be', 'to'], 'Singular subject, official plan.', 'is to + visit.'],
          ['All candidates ____ bring their hall tickets.', 'are to', ['is to', 'were be to', 'be to'], 'Plural subject, instruction.', 'are to + bring.'],
          ['Quick! The film is about to ____.', 'start', ['started', 'starting', 'starts'], 'Base form after to.', 'about to + base form.'],
          ['The relief ship ____ sail on Monday, but the storm delayed it.', 'was to', ['is to', 'will to', 'has to be'], 'A past plan that did not happen.', 'was to + base form.'],
          ['The new dam is to ____ next year.', 'be completed', ['completed', 'completing', 'be complete it'], 'Passive with be to.', 'is to be completed (passive).'],
        ]),
        mcq('meaning', 'Decide which meaning the sentence has.', [
          ['"You are to report at the gate by 7 a.m." This expresses…', 'an instruction', ['a past habit', 'an ability', 'a wish'], 'Someone is telling you what to do.', 'be to can give instructions.'],
          ['"The ferry is about to leave." This means the ferry will leave…', 'very soon', ['next year', 'never', 'yesterday'], 'About to = on the point of.', 'about to = in the very near future.'],
          ['"The President is to address the nation tonight." This expresses…', 'an official arrangement', ['a doubt', 'a past event', 'a complaint'], 'News style.', 'be to = official plan.'],
          ['"We were to meet at the station, but the trains were cancelled." The meeting…', 'was planned but did not happen', ['happened as planned', 'is happening now', 'will happen tomorrow'], 'was/were to + "but".', 'was/were to often shows a plan that failed.'],
          ['Which sentence shows the very near future?', 'The guests are about to arrive.', ['The guests were to arrive yesterday.', 'The guests arrive every Sunday.', 'The guests had arrived.'], 'Look for "about".', 'about to = on the point of happening.'],
        ]),
        errT('spot', ['After "to", use the base form.', 'Make "be" agree with the subject.'], [
          ['The minister | is to | inaugurated | the hospital tomorrow.', 2, 'The minister is to inaugurate the hospital tomorrow.', 'After "to", use the base form: inaugurate.'],
          ['The students | is to | wear uniforms | on Monday.', 1, 'The students are to wear uniforms on Monday.', 'Plural subject → are to.'],
          ['Hurry up, | the bus is | about to leaving | the stop.', 2, 'Hurry up, the bus is about to leave the stop.', 'about to + base form: leave.'],
          ['The players | are to | plays | in Chennai next week.', 2, 'The players are to play in Chennai next week.', 'Base form after to: play.'],
          ['The ferry | was about | leave | when the storm warning came.', 2, 'The ferry was about to leave when the storm warning came.', '"About" must be followed by "to" + base form: about to leave.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Unit 6 — Freedom
// =====================================================================================
const u6: USpec = {
  id: 'ts9.en.u6', subject: 'english', title: 'Freedom', source: src(6),
  objectives: [
    {
      id: 'ts9.en.mandela.read', title: 'Reading: A Long Walk to Freedom', prereqs: [],
      intro: [
        h('About the reading'),
        p('This reading is from Long Walk to Freedom, the autobiography of Nelson Mandela (1918–2013). Mandela fought against apartheid — the system of racial segregation and discrimination in South Africa. He spent 27 years in prison, and in 1994 became the country’s first Black president after its first democratic election.'),
        h('Our summary'),
        keys(
          'The extract centres on his inauguration as President on 10 May 1994 in Pretoria, attended by leaders from many nations.',
          'Mandela reflects on how a system that had denied people their dignity was replaced by one that recognised the rights of all, whatever the colour of their skin.',
          'He honours the thousands who suffered and sacrificed for freedom, and says that courage is not the absence of fear but the triumph over it.',
          'He explains that he had two obligations — to his family and to his people — and that in an unjust society he could not fulfil both.',
          'He realises that the oppressor, too, is not free: a person who takes away another’s freedom is a prisoner of hatred and prejudice.',
        ),
        def('Apartheid', 'A policy of racial segregation and discrimination enforced in South Africa from 1948 to the early 1990s.'),
        def('Inauguration', 'A formal ceremony marking the beginning of a leader’s term in office.'),
        remember('Key ideas for answers: freedom must be for everyone, including the oppressor; true courage = conquering fear; personal sacrifice for a nation’s freedom.'),
      ],
      examples: [
        ex('What did Mandela mean by "the oppressor is not free"?', ['Someone who denies others freedom is trapped by hatred and narrow thinking.'], 'An oppressor is a prisoner of his own hatred and prejudice; both oppressed and oppressor must be set free.'),
        ex('Define courage according to Mandela.', ['Not the absence of fear.'], 'Courage is not the absence of fear but the triumph over it.'),
      ],
      practice: [
        mcq('comp', 'Recall the facts and ideas in the extract.', [
          ['When did Mandela become President of South Africa?', '1994', ['1948', '1964', '2004'], 'After the first democratic election.', 'He was inaugurated on 10 May 1994.'],
          ['What was apartheid?', 'A system of racial segregation and discrimination', ['A type of dance', 'A political party', 'A prison in Cape Town'], 'It divided people by race.', 'Apartheid separated and discriminated against people by race.'],
          ['How many years did Mandela spend in prison?', '27', ['7', '17', '37'], 'Nearly three decades.', 'He was imprisoned for 27 years.'],
          ['According to Mandela, courage is…', 'the triumph over fear', ['the absence of fear', 'the love of danger', 'winning every fight'], 'Brave people still feel fear.', 'He says courage is conquering fear, not lacking it.'],
          ['What were Mandela’s two obligations?', 'To his family and to his people', ['To his school and his church', 'To his king and his army', 'To his job and his bank'], 'Personal and national.', 'He felt duties to his family and to his nation.'],
          ['Why does he say the oppressor is also not free?', 'He is a prisoner of hatred and prejudice', ['He lives in a prison cell', 'He cannot travel abroad', 'He has no money'], 'Freedom of the mind.', 'Hatred and prejudice imprison the oppressor’s mind.'],
        ]),
        matchT('words', 'word with its meaning', [
          ['apartheid', 'racial segregation and discrimination'], ['inauguration', 'ceremony starting a term of office'], ['oppressor', 'one who treats people cruelly and unjustly'], ['obligation', 'a duty'], ['prejudice', 'an unfair opinion formed without reason'], ['democracy', 'government elected by the people'],
        ], ['Use the extract’s context.', 'Obligation = duty.']),
        orderT('events', ['Start with the earliest event.', 'The inauguration is last.'], [
          ['Mandela fought against apartheid. | He spent 27 years in prison. | South Africa held its first democratic election. | Mandela was sworn in as President.', 'Struggle → prison → election → inauguration.'],
          ['Courage | is the triumph | over | fear.', 'Subject → verb + complement → preposition → object.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.freedom.poem', title: 'Where the Mind is Without Fear; An Icon of Civil Rights', prereqs: [],
      intro: [
        h('Poem B: Where the Mind is Without Fear'),
        p('Rabindranath Tagore (1861–1941) wrote this poem in Bengali and translated it himself for Gitanjali, the collection for which he won the Nobel Prize in Literature in 1913 — the first Asian to do so. He also wrote India’s national anthem.'),
        p('The poem is a prayer. The poet asks God, addressed as Father, to awaken his country into a true freedom where people are fearless and hold their heads high, knowledge is open to all, society is not broken up by narrow divisions, words come from truth, people work tirelessly towards perfection, clear reasoning is not lost in lifeless old customs, and minds are led forward to ever-widening thought and action.'),
        keys('Form: a single long sentence of prayer; free verse.', 'Devices: metaphor (reason pictured as a clear stream that can be lost in the desert of dead habit; walls standing for the divisions of caste, religion and region), personification (striving that reaches out its arms), repetition of "Where…".', 'Theme: true freedom is freedom of the mind, not only political independence.'),
        h('Reading C: An Icon of Civil Rights'),
        p('Rosa Parks (1913–2005) was an African American woman in Montgomery, Alabama, USA. On 1 December 1955 she refused to give up her bus seat to a white passenger, as the segregation law demanded. She was arrested. Her quiet courage sparked the Montgomery Bus Boycott, led by Martin Luther King Jr., which lasted over a year and ended with bus segregation being declared unconstitutional. She is called "the mother of the civil rights movement".'),
        remember('Link the three readings: Mandela (freedom from apartheid), Tagore (freedom of the mind) and Rosa Parks (freedom from racial segregation) all show that freedom means dignity and equality for every person.'),
      ],
      examples: [
        ex('What do the "walls" that divide the world stand for in Tagore’s poem?', ['Walls separate one home from another.', 'In society: caste, religion, language, region.'], 'Divisions in society — of caste, creed, language and region — that break people apart.'),
        ex('Why is Rosa Parks called an icon of civil rights?', ['Her simple act of refusal inspired a mass movement.'], 'Her refusal to give up her seat led to the Montgomery Bus Boycott and helped end bus segregation.'),
      ],
      practice: [
        mcq('comp', 'Recall the poem’s ideas and Rosa Parks’ story.', [
          ['In which collection does "Where the Mind is Without Fear" appear?', 'Gitanjali', ['Malgudi Days', 'Long Walk to Freedom', 'Heaven Lake'], 'Tagore won the Nobel Prize for it.', 'The poem is from Gitanjali.'],
          ['The poem is written in the form of…', 'a prayer', ['a letter', 'a dialogue', 'a news report'], 'The poet addresses the Father.', 'It is a prayer for the nation’s awakening.'],
          ['"Dead habit" in the poem refers to…', 'old customs followed without thinking', ['a dead animal', 'a broken clock', 'a lost book'], 'It blocks clear reason.', 'Dead habit = blind, outdated customs.'],
          ['What did Rosa Parks refuse to do?', 'Give up her bus seat to a white passenger', ['Pay her bus fare', 'Go to school', 'Join the protest'], 'It happened on a bus.', 'She refused to give up her seat as segregation laws demanded.'],
          ['Which movement followed Rosa Parks’ arrest?', 'The Montgomery Bus Boycott', ['The Salt March', 'The Quit India Movement', 'The Green Revolution'], 'People stopped using buses.', 'Her arrest sparked the Montgomery Bus Boycott.'],
          ['Who led the bus boycott?', 'Martin Luther King Jr.', ['Nelson Mandela', 'Abraham Lincoln', 'Rabindranath Tagore'], 'A famous American civil rights leader.', 'Martin Luther King Jr. led the boycott.'],
        ]),
        matchT('devices', 'image from the poem with what it stands for', [
          ['walls dividing the world', 'divisions of caste, religion and region'], ['a clear stream', 'logical, fresh thinking'], ['a dry desert', 'lifeless, blind customs'], ['a heaven of freedom', 'an ideal free nation'],
        ], ['Each is a metaphor.', 'Reason flows like water; dead habit is like desert sand.']),
        mcq('who', 'Think of the person behind each fact.', [
          ['Won the Nobel Prize in Literature in 1913:', 'Rabindranath Tagore', ['Rosa Parks', 'Nelson Mandela', 'Martin Luther King Jr.'], 'First Asian Nobel laureate.', 'Tagore won it for Gitanjali.'],
          ['Called "the mother of the civil rights movement":', 'Rosa Parks', ['Rabindranath Tagore', 'Bachendri Pal', 'Arunima Sinha'], 'The bus incident.', 'Rosa Parks earned this title.'],
          ['Wrote India’s national anthem:', 'Rabindranath Tagore', ['Nelson Mandela', 'R. K. Narayan', 'Vikram Seth'], 'Jana Gana Mana.', 'Tagore wrote Jana Gana Mana.'],
          ['Became South Africa’s first Black president:', 'Nelson Mandela', ['Rosa Parks', 'Martin Luther King Jr.', 'Rabindranath Tagore'], '1994.', 'Mandela became President in 1994.'],
          ['Was arrested in Montgomery, Alabama in 1955:', 'Rosa Parks', ['Nelson Mandela', 'Rabindranath Tagore', 'Chief Seattle'], 'A bus seat.', 'Rosa Parks was arrested for not giving up her seat.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.freedom.vocab', title: 'Vocabulary: appropriate meanings and figurative expressions', prereqs: [],
      intro: [
        h('One word, many meanings'),
        p('Many English words have several meanings. The right meaning depends on the context. "Bright" can mean full of light (a bright room), intelligent (a bright student) or hopeful (a bright future).'),
        keys('run: move fast / manage (run a shop) / flow (the tap is running)', 'light: not heavy / brightness / not serious (light reading)', 'fair: just / light in colour / a market or exhibition', 'struggle: try hard against difficulty / a fight (the freedom struggle)'),
        h('Figurative expressions'),
        p('Figurative language says one thing to mean another, for effect. "A long walk to freedom" is not a real walk — it means a long, hard journey towards freedom.'),
        keys('Metaphor: Freedom is a flame that never dies.', 'Simile (uses like/as): Her voice was as steady as a rock.', 'Personification: Hope knocked at the prisoner’s door.', 'Hyperbole (exaggeration): I have told you a thousand times.'),
        stepsB('Read the whole sentence.', 'List the possible meanings of the word.', 'Test each meaning in the sentence; keep the one that fits.', 'For figurative language, ask: what is being compared, and why?'),
        remember('A simile uses "like" or "as"; a metaphor does not. Do not explain a figurative expression word for word — explain the idea.'),
      ],
      examples: [
        ex('What does "fair" mean in "The judge gave a fair decision"?', ['Possible: just / light-coloured / an exhibition.', 'A decision can be just.'], 'just, unbiased'),
        ex('Identify the figure: "The prison walls whispered stories of pain."', ['Walls cannot whisper; human action given to a thing.'], 'Personification'),
      ],
      practice: [
        mcq('meaning', 'Test each meaning in the sentence.', [
          ['"My uncle runs a small hotel in Siddipet." Runs means…', 'manages', ['moves quickly', 'flows', 'escapes'], 'You cannot sprint a hotel.', 'Here "run" means manage.'],
          ['"We went to the science fair at school." Fair means…', 'an exhibition', ['just', 'light-coloured', 'beautiful'], 'An event.', 'A science fair is an exhibition.'],
          ['"Take only light luggage on the trek." Light means…', 'not heavy', ['bright', 'pale', 'not serious'], 'Luggage has weight.', 'Light luggage = not heavy.'],
          ['"She is a bright student." Bright means…', 'intelligent', ['shining', 'colourful', 'sunny'], 'Describes a mind.', 'Bright here = clever.'],
          ['"The freedom struggle lasted many decades." Struggle means…', 'a long, hard fight', ['a quick game', 'a short holiday', 'a quarrel at home'], 'Freedom movement.', 'Struggle = a long effort against difficulty.'],
        ]),
        mcq('figure', 'Look for like/as, human actions, or exaggeration.', [
          ['"The leader’s words were a torch in the darkness." This is a…', 'metaphor', ['simile', 'hyperbole', 'rhyme'], 'No like/as.', 'A direct comparison without like/as is a metaphor.'],
          ['"He stood as firm as a mountain." This is a…', 'simile', ['metaphor', 'personification', 'alliteration'], 'Look for as…as.', 'Comparison with "as" is a simile.'],
          ['"The wind howled angrily all night." This is…', 'personification', ['simile', 'hyperbole', 'metaphor'], 'Wind feeling anger.', 'Giving human emotion to wind is personification.'],
          ['"I waited for ages at the bus stop." This is…', 'hyperbole', ['simile', 'personification', 'onomatopoeia'], 'Not literally ages.', 'Deliberate exaggeration is hyperbole.'],
          ['"A long walk to freedom" suggests…', 'a long, difficult struggle for freedom', ['a morning walk', 'a trip abroad', 'a walking competition'], 'It is figurative.', 'The "walk" is the long struggle against apartheid.'],
        ]),
        matchT('fig', 'figure of speech with its example', [
          ['Simile', 'Brave as a lion'], ['Metaphor', 'Freedom is a flame'], ['Personification', 'Hope knocked at the door'], ['Hyperbole', 'I have told you a million times'],
        ], ['Simile uses like/as.', 'Hyperbole exaggerates.']),
      ],
    },
    {
      id: 'ts9.en.relative.defining', title: 'Grammar: defining relative clauses', prereqs: [],
      intro: [
        h('Clauses that tell us WHICH one'),
        def('Defining relative clause', 'A clause that identifies which person or thing we mean. Without it the sentence loses its meaning. It is not separated by commas.'),
        keys('who – for people (subject): The woman who refused to give up her seat became famous.', 'whom – for people (object, formal): The leader whom we admire spent years in prison.', 'which – for things/animals: The poem which Tagore wrote is a prayer.', 'that – for people or things in defining clauses: The book that I borrowed is about Mandela.', 'whose – possession: The girl whose essay won is from Jangaon.', 'where / when – places / times: the town where I was born; the day when we won.'),
        stepsB('Find the noun you want to identify.', 'Choose the relative pronoun: person → who/that; thing → which/that; possession → whose; place → where.', 'Put the clause right after the noun.', 'Remove the repeated pronoun from the joined sentence (him, it, there…).'),
        remember('Common errors: (1) repeating the pronoun — "the boy who I met him" ✗ → "the boy who I met" ✓. (2) "which" for people ✗. (3) commas around a defining clause ✗ — commas make it non-defining (extra information).'),
      ],
      examples: [
        ex('Join with a relative pronoun: "I met a girl. She plays the veena."', ['Person, subject → who.', 'Remove "She".'], 'I met a girl who plays the veena.'),
        ex('Join: "This is the house. Tagore lived there."', ['Place → where; remove "there".'], 'This is the house where Tagore lived.'),
        ex('Join: "That is the farmer. His crops were destroyed by the flood."', ['Possession → whose; remove "His".'], 'That is the farmer whose crops were destroyed by the flood.'),
      ],
      practice: [
        mcq('fill', 'Person, thing, possession or place?', [
          ['The man ____ fixed our fan is an electrician.', 'who', ['which', 'whose', 'where'], 'A person doing an action.', 'who for people (subject).'],
          ['The bus ____ goes to Karimnagar leaves at noon.', 'which', ['who', 'whom', 'whose'], 'A thing.', 'which (or that) for things.'],
          ['The boy ____ bicycle was stolen went to the police.', 'whose', ['who', 'which', 'whom'], 'Possession.', 'whose shows possession.'],
          ['This is the village ____ my grandmother was born.', 'where', ['which', 'who', 'whose'], 'A place.', 'where for places.'],
          ['The teacher ____ we respect most is retiring.', 'whom', ['which', 'whose', 'where'], 'Person, object of "respect".', 'whom for people as object (formal).'],
          ['I still remember the day ____ India won the World Cup.', 'when', ['where', 'which', 'whose'], 'A time.', 'when for times.'],
        ]),
        orderT('build', ['The relative clause comes right after the noun it describes.', 'The main verb follows the relative clause.'], [
          ['The girl | who won the quiz | is | my cousin.', 'Noun → relative clause → main verb → complement.'],
          ['The poem | that we studied | was written | by Tagore.', 'Noun → relative clause → passive verb → agent.'],
          ['This is the school | where | my father | studied.', 'Main clause → where → subject → verb.'],
          ['The farmer | whose field was flooded | received | compensation.', 'Noun → whose-clause → verb → object.'],
        ]),
        errT('spot', ['Check for a repeated pronoun.', 'Who is for people, which is for things.'], [
          ['The boy | who I met him | at the fair | is from Medak.', 1, 'The boy who I met at the fair is from Medak.', 'Do not repeat the pronoun ("him") inside the relative clause.'],
          ['The doctor | which treated me | was very | kind.', 1, 'The doctor who treated me was very kind.', 'Use who (or that) for people.'],
          ['This is | the pen | who | I lost yesterday.', 2, 'This is the pen which I lost yesterday.', 'Use which (or that) for things.'],
          ['The lady | who’s son | is a pilot | lives next door.', 1, 'The lady whose son is a pilot lives next door.', 'Possession → whose, not who’s (who is).'],
          ['The town | which I grew up | is near | the Godavari.', 1, 'The town where I grew up is near the Godavari.', 'For a place with "grew up", use where (or "in which").'],
        ]),
      ],
    },
    {
      id: 'ts9.en.noun.phrase', title: 'Grammar: noun phrases', prereqs: [],
      intro: [
        h('Building a noun phrase'),
        def('Noun phrase', 'A group of words built around a head noun: determiner + adjectives + noun + post-modifier. Example: "the brave young leader from South Africa".'),
        keys('Determiner: a, an, the, this, my, some, every, two', 'Pre-modifiers: adjectives and noun modifiers — a long, hard walk; a school bus', 'Head noun: the main noun', 'Post-modifiers: prepositional phrase (of freedom), relative clause (who fought for justice), to-infinitive (a promise to keep)'),
        h('Order of adjectives'),
        p('When several adjectives come before a noun, English usually follows this order: opinion → size → age → shape → colour → origin → material → purpose. Example: a beautiful old Pochampally silk sari.'),
        stepsB('Find the head noun.', 'Put the determiner first.', 'Arrange adjectives in the usual order (opinion, size, age, shape, colour, origin, material, purpose).', 'Add post-modifiers after the noun.'),
        remember('Common errors: "a silk red sari" ✗ → "a red silk sari" ✓; a noun used inside a compound adjective stays singular: "a ten-year-old boy" (not "ten-years-old").'),
      ],
      examples: [
        ex('Find the head noun: "the first democratic election in South Africa".', ['Strip away the determiner, adjectives and the prepositional phrase.'], 'election'),
        ex('Arrange: (wooden / old / a / beautiful / chair)', ['opinion (beautiful) → age (old) → material (wooden).'], 'a beautiful old wooden chair'),
      ],
      practice: [
        mcq('head', 'Remove determiners, adjectives and post-modifiers.', [
          ['Head noun in "a long walk to freedom":', 'walk', ['long', 'freedom', 'a'], 'What is long?', 'walk is the head; "to freedom" post-modifies it.'],
          ['Head noun in "the old man with a walking stick":', 'man', ['stick', 'old', 'walking'], 'Who has the stick?', 'man is the head noun.'],
          ['Head noun in "my brother’s new cricket bat":', 'bat', ['cricket', 'brother’s', 'new'], 'Cricket describes the kind of bat.', 'bat is the head noun.'],
          ['Head noun in "the girl who won the race":', 'girl', ['race', 'who', 'won'], 'Who won?', 'girl is the head; the relative clause modifies it.'],
          ['Head noun in "a beautiful Kondapalli wooden toy":', 'toy', ['wooden', 'Kondapalli', 'beautiful'], 'What is wooden?', 'toy is the head noun.'],
        ]),
        orderT('adj', ['Opinion before size and age.', 'Material comes just before the noun.'], [
          ['a | lovely | small | wooden | box', 'determiner → opinion → size → material → noun.'],
          ['an | old | red | cotton | shirt', 'determiner → age → colour → material → noun.'],
          ['a | beautiful | old | Pochampally | sari', 'determiner → opinion → age → origin → noun.'],
          ['two | large | round | steel | plates', 'number → size → shape → material → noun.'],
        ]),
        errT('spot', ['Check the adjective order.', 'Check singular nouns used inside compound adjectives.'], [
          ['She wore | a silk red | sari | to the wedding.', 1, 'She wore a red silk sari to the wedding.', 'Colour comes before material.'],
          ['A | ten-years-old | boy | won the medal.', 1, 'A ten-year-old boy won the medal.', 'In a compound adjective, the noun stays singular: ten-year-old.'],
          ['He bought | a wooden big | table | for the hall.', 1, 'He bought a big wooden table for the hall.', 'Size comes before material.'],
          ['They live in | a brick small | house | near the lake.', 1, 'They live in a small brick house near the lake.', 'Size comes before material.'],
          ['Grandmother gave me | a cotton blue | kurta | for Bathukamma.', 1, 'Grandmother gave me a blue cotton kurta for Bathukamma.', 'Colour comes before material.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Unit 7 — Theatre
// =====================================================================================
const u7: USpec = {
  id: 'ts9.en.u7', subject: 'english', title: 'Theatre', source: src(7),
  note: 'Reading A (The Trial) is taught as the trial scene from Shakespeare’s The Merchant of Venice; teacher to confirm against the textbook adaptation. The script-writing objective is a WonderLab addition.',
  objectives: [
    {
      id: 'ts9.en.trial.read', title: 'Reading: The Trial (a courtroom play)', prereqs: [],
      intro: [
        h('About the play'),
        p('The Trial presents the famous courtroom scene from William Shakespeare’s comedy The Merchant of Venice (written in the 1590s), set in Venice, Italy.'),
        h('Background and our summary'),
        stepsB(
          'Antonio, a kind merchant, borrows 3,000 ducats from the moneylender Shylock to help his friend Bassanio. Shylock, who has been insulted by Antonio in the past, makes a strange bond: if the loan is not repaid on time, he may cut a pound of Antonio’s flesh.',
          'Antonio’s ships are reported lost at sea and he cannot repay. Shylock goes to court demanding his bond and refuses even double the money.',
          'Portia, Bassanio’s wife, comes to court disguised as a young lawyer. She first appeals to Shylock to show mercy, describing mercy as a quality that blesses both the giver and the receiver.',
          'When Shylock refuses, she turns the law against him: the bond allows flesh but not a single drop of blood, and exactly one pound — no more, no less. Shylock cannot take his bond.',
          'Shylock is found guilty of seeking a citizen’s life and is severely punished; Antonio is saved.',
        ),
        keys('Characters: Antonio (generous, loyal friend), Shylock (bitter, revengeful, yet himself a victim of prejudice), Portia (intelligent, quick-witted), Bassanio (devoted friend), the Duke (judge).', 'Themes: justice versus mercy; revenge; friendship; prejudice.', 'Dramatic devices: suspense, dramatic irony (the audience knows the lawyer is Portia), courtroom dialogue.'),
        remember('Discuss Shylock with balance: the play shows his cruelty but also the prejudice he has suffered. Avoid stereotypes about any community.'),
      ],
      examples: [
        ex('How does Portia save Antonio?', ['She agrees Shylock may take a pound of flesh.', 'But the bond does not mention blood; shedding blood would break the law.'], 'She points out that the bond allows flesh but no blood, so Shylock cannot carry it out.'),
        ex('What is dramatic irony in this scene?', ['The audience knows something the characters do not.'], 'The audience knows the young lawyer is Portia in disguise, but Shylock and the court do not.'),
      ],
      practice: [
        mcq('comp', 'Recall the plot of the trial scene.', [
          ['Who wrote The Merchant of Venice?', 'William Shakespeare', ['R. K. Narayan', 'Edward Lear', 'Bill Bryson'], 'An English playwright of the 1500s.', 'Shakespeare wrote the play.'],
          ['What did Shylock demand under the bond?', 'A pound of Antonio’s flesh', ['Antonio’s ships', 'Double the money', 'Antonio’s house'], 'A cruel condition.', 'The bond allowed him a pound of flesh.'],
          ['Why could Antonio not repay the loan?', 'His ships were reported lost at sea', ['He spent it on a party', 'Bassanio stole it', 'The court took it'], 'He was a merchant.', 'His trading ships were reported lost.'],
          ['Who disguised herself as a lawyer?', 'Portia', ['Nerissa’s mother', 'The Duke', 'Shylock’s servant'], 'Bassanio’s wife.', 'Portia came disguised as a young lawyer.'],
          ['What legal point saves Antonio?', 'The bond allows flesh but no blood', ['Shylock signed the wrong date', 'Antonio had already paid', 'The Duke cancelled all loans'], 'Read the bond exactly.', 'Shedding blood was not allowed by the bond.'],
          ['Which theme is central to Portia’s first appeal?', 'Mercy', ['Travel', 'Humour', 'Sports'], 'She asks Shylock to forgive.', 'She appeals for mercy before using the law.'],
        ]),
        matchT('chars', 'character with a description', [
          ['Antonio', 'generous merchant who borrows for a friend'], ['Shylock', 'moneylender who demands his bond'], ['Portia', 'quick-witted woman disguised as a lawyer'], ['Bassanio', 'Antonio’s devoted friend'], ['The Duke', 'the judge in the court'],
        ], ['Think about each one’s role in the trial.', 'The Duke is the judge.']),
        orderT('plot', ['The loan comes first.', 'The judgement comes last.'], [
          ['Antonio borrowed money from Shylock. | His ships were lost at sea. | Portia appealed for mercy. | She showed that the bond allowed no blood.', 'Loan → loss → appeal → legal twist.'],
          ['Disguised as a lawyer, | Portia | defended | Antonio in court.', 'Participle phrase → subject → verb → object.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.antony.gandhi', title: 'Antony’s Speech; Mahatma Gandhi Pushed out of Train', prereqs: [],
      intro: [
        h('Poem B: Antony’s Speech'),
        p('This is the funeral speech of Mark Antony from Shakespeare’s play Julius Caesar (Act 3, Scene 2). Caesar has been killed by Brutus and other conspirators, who claim he was too ambitious. Brutus speaks to the Roman crowd first and wins them over. Antony is allowed to speak on condition that he does not blame the conspirators.'),
        keys(
          'Antony begins by saying he has come to bury Caesar, not to praise him — and then praises him all the same.',
          'He repeatedly calls Brutus "an honourable man", but with each repetition the phrase sounds more ironic, until the crowd hears it as an accusation.',
          'He reminds the people of Caesar’s good deeds — refusing the crown three times, filling Rome’s treasury, weeping for the poor — to show Caesar was not ambitious.',
          'He shows Caesar’s wounds and mentions his will, stirring the crowd to fury against the conspirators.',
        ),
        p('Devices: verbal irony, repetition, rhetorical questions, emotional appeal (pathos). It is a model of persuasive speech.'),
        h('Reading C: Mahatma Gandhi Pushed out of Train'),
        p('In 1893 young M. K. Gandhi, a lawyer working in South Africa, travelled by train from Durban to Pretoria with a first-class ticket. At Pietermaritzburg station a white passenger objected to an Indian in his compartment. Gandhi refused to move to the van compartment, so a constable pushed him off the train. He spent a bitterly cold night in the waiting room, thinking. He decided not to run back to India but to stay and fight colour prejudice — a turning point that led to his method of non-violent resistance.'),
        remember('Connect both readings: both are turning points created by words and actions — Antony’s words turn a crowd; one night’s humiliation turns Gandhi into a fighter for justice.'),
      ],
      examples: [
        ex('Why is "Brutus is an honourable man" ironic?', ['Antony says it while proving Caesar was not ambitious.', 'So Brutus’s reason for killing Caesar was false.'], 'Antony says the opposite of what he means; by the end the phrase suggests Brutus is dishonourable.'),
        ex('What decision did Gandhi take that night at Pietermaritzburg?', ['Leave or stay?'], 'To stay in South Africa and fight against colour prejudice.'),
      ],
      practice: [
        mcq('comp', 'Recall the speech and the train incident.', [
          ['Antony’s speech is from which play?', 'Julius Caesar', ['The Merchant of Venice', 'Hamlet', 'Macbeth'], 'Caesar’s funeral.', 'It is from Shakespeare’s Julius Caesar.'],
          ['Who spoke to the crowd before Antony?', 'Brutus', ['Caesar', 'Portia', 'Cassius’ servant'], 'The leader of the conspirators.', 'Brutus addressed the crowd first.'],
          ['What device is "Brutus is an honourable man", repeated?', 'Verbal irony', ['Simile', 'Onomatopoeia', 'Alliteration'], 'He means the opposite.', 'Repeated with growing irony, it turns into an accusation.'],
          ['What is the effect of Antony’s speech on the crowd?', 'They turn against the conspirators', ['They praise Brutus more', 'They go home quietly', 'They crown Antony king'], 'Persuasion.', 'He stirs the crowd to anger against the conspirators.'],
          ['Where was Gandhi pushed off the train?', 'Pietermaritzburg', ['Durban', 'Johannesburg', 'Cape Town'], 'A station on the way to Pretoria.', 'It happened at Pietermaritzburg station.'],
          ['Why was Gandhi asked to leave the first-class compartment?', 'A white passenger objected to an Indian in it', ['He had no ticket', 'He was too noisy', 'The train was full of luggage'], 'Racial prejudice.', 'He had a valid ticket; he was removed because of colour prejudice.'],
        ]),
        matchT('terms', 'term with its example from these readings', [
          ['Verbal irony', 'Calling Brutus honourable while showing he was not'], ['Rhetorical question', 'Antony asking, "Was this ambition?"'], ['Pathos', 'Showing Caesar’s wounds to move the crowd'], ['Turning point', 'Gandhi’s decision to stay and fight prejudice'],
        ], ['Irony = saying the opposite of what you mean.', 'Pathos = appeal to emotion.']),
        orderT('events', ['Start with the journey.', 'The decision is last.'], [
          ['Gandhi boarded the train at Durban. | A passenger objected to him. | A constable pushed him off. | He decided to fight colour prejudice.', 'Journey → objection → removal → decision.'],
          ['Brutus spoke first. | Antony was allowed to speak. | He showed Caesar’s wounds. | The crowd turned against the conspirators.', 'Brutus → Antony → emotional appeal → crowd’s anger.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.idioms', title: 'Vocabulary: idioms', prereqs: [],
      intro: [
        h('What is an idiom?'),
        def('Idiom', 'A fixed expression whose meaning cannot be guessed from the meanings of its individual words. "Break the ice" has nothing to do with ice — it means to start a conversation in an awkward situation.'),
        keys('a piece of cake – very easy', 'break the ice – start a conversation', 'once in a blue moon – very rarely', 'hit the nail on the head – say exactly the right thing', 'cry over spilt milk – regret what cannot be changed', 'burn the midnight oil – work late into the night', 'steal the show – get the most attention or praise', 'behind the scenes – out of public view', 'face the music – accept the consequences', 'bring the house down – make an audience laugh or cheer loudly'),
        stepsB('Read the whole sentence and its situation.', 'Do not translate word by word.', 'Ask: what does the speaker really mean here?', 'Replace the idiom with a plain phrase and check the meaning.'),
        remember('Idioms are fixed: say "a piece of cake", not "a slice of cake"; "once in a blue moon", not "in a blue moon once". Avoid using too many idioms in formal letters.'),
      ],
      examples: [
        ex('Meaning of the idiom: "Teja’s mime act brought the house down at the annual day."', ['"House" here = the audience in a theatre.'], 'The audience laughed and applauded very loudly.'),
        ex('Use an idiom: "Kavya studied late into the night before the exam."', ['Late-night study → burn the midnight oil.'], 'Kavya burnt the midnight oil before the exam.'),
      ],
      practice: [
        mcq('meaning', 'Do not translate word by word.', [
          ['"The maths test was a piece of cake." It was…', 'very easy', ['very tasty', 'very short', 'very hard'], 'Nothing to do with food.', 'A piece of cake = very easy.'],
          ['"My uncle visits us once in a blue moon." He visits…', 'very rarely', ['every full moon', 'every night', 'very often'], 'Blue moons are rare.', 'Once in a blue moon = very rarely.'],
          ['"Sana stole the show in the school play." She…', 'got the most praise', ['took the tickets', 'stopped the play', 'forgot her lines'], 'In a performance.', 'Steal the show = attract the most attention and praise.'],
          ['"You broke the window; now face the music." It means…', 'accept the consequences', ['listen to a song', 'play an instrument', 'run away'], 'After doing something wrong.', 'Face the music = accept punishment.'],
          ['"There is no use crying over spilt milk." It means…', 'do not regret what cannot be changed', ['clean the floor quickly', 'buy more milk', 'never drink milk'], 'About regret.', 'It advises not to grieve over past mistakes.'],
          ['"You hit the nail on the head." You…', 'said exactly the right thing', ['hurt your hand', 'built a box', 'made a mistake'], 'About an answer.', 'Hit the nail on the head = be exactly right.'],
        ]),
        matchT('idioms', 'idiom with its meaning', [
          ['break the ice', 'start a conversation'], ['burn the midnight oil', 'work late into the night'], ['behind the scenes', 'out of public view'], ['bring the house down', 'make the audience cheer loudly'], ['a piece of cake', 'very easy'], ['once in a blue moon', 'very rarely'],
        ], ['Think about the picture each idiom creates.', 'House = audience; ice = awkward silence.']),
        mcq('use', 'Which idiom fits the situation?', [
          ['At the new school, nobody spoke at first, so Arjun told a joke to ____.', 'break the ice', ['face the music', 'steal the show', 'cry over spilt milk'], 'Awkward silence.', 'Break the ice = start a conversation.'],
          ['The stage crew worked ____ to make the play a success.', 'behind the scenes', ['once in a blue moon', 'a piece of cake', 'at the eleventh hour'], 'Out of view.', 'Behind the scenes = out of public view.'],
          ['Imran ____ every night before the board exams.', 'burnt the midnight oil', ['broke the ice', 'brought the house down', 'faced the music'], 'Studying late.', 'Burn the midnight oil = work late.'],
          ['The comedian’s act ____.', 'brought the house down', ['broke the ice', 'faced the music', 'cried over spilt milk'], 'The audience roared.', 'Bring the house down = huge laughter and applause.'],
          ['Ravi lied to his parents; when they found out, he had to ____.', 'face the music', ['steal the show', 'break the ice', 'burn the midnight oil'], 'Consequences.', 'Face the music = accept the consequences.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.conditionals', title: 'Grammar: if-clauses (types of conditionals)', prereqs: ['ts9.en.clauses.adverbial'],
      intro: [
        h('Three main conditionals'),
        keys(
          'Type 0 (general truth): If + present, present — If you heat ice, it melts.',
          'Type 1 (real / likely future): If + present, will + base — If it rains, the match will be cancelled.',
          'Type 2 (unreal / imaginary present or future): If + past, would + base — If I were the Chief Minister, I would build more libraries.',
          'Type 3 (unreal past — it did not happen): If + had + V3, would have + V3 — If Antonio had repaid the loan, Shylock would not have gone to court.',
        ),
        stepsB('Decide: is it always true, likely, imaginary, or about a past that did not happen?', 'Choose the type (0, 1, 2 or 3).', 'Put the correct tense in the if-clause.', 'Put the matching form in the main clause.', 'If the if-clause comes first, add a comma.'),
        remember('Common errors: (1) "If it will rain" ✗ → "If it rains" ✓ — never "will" in the if-clause of Type 1. (2) Type 2 with be: "If I were…" (were for all persons in formal English). (3) Type 3: "If I would have known" ✗ → "If I had known" ✓. "Unless" = "if … not".'),
      ],
      examples: [
        ex('Complete (Type 1): "If you (practise) daily, you (improve)."', ['Real future → present + will.'], 'If you practise daily, you will improve.'),
        ex('Complete (Type 2): "If I (have) wings, I (fly) to Kathmandu."', ['Imaginary → past + would.'], 'If I had wings, I would fly to Kathmandu.'),
        ex('Complete (Type 3): "If Gandhi (leave) South Africa, history (be) different."', ['Unreal past → had + V3, would have + V3.'], 'If Gandhi had left South Africa, history would have been different.'),
      ],
      practice: [
        mcq('fill', 'Decide the type first, then the tense.', [
          ['If it ____ tomorrow, we will stay at home.', 'rains', ['will rain', 'rained', 'had rained'], 'Type 1: present in the if-clause.', 'No "will" in the if-clause: rains.'],
          ['If I were a bird, I ____ over the Himalayas.', 'would fly', ['will fly', 'fly', 'had flown'], 'Type 2: imaginary.', 'If + past → would + base.'],
          ['If she had studied, she ____ the exam.', 'would have passed', ['will pass', 'would pass', 'passes'], 'Type 3: unreal past.', 'If + had + V3 → would have + V3.'],
          ['If you heat water to 100 °C, it ____.', 'boils', ['would boil', 'boiled', 'will have boiled'], 'Type 0: a scientific fact.', 'General truths use present + present.'],
          ['If I ____ you, I would apologise.', 'were', ['am', 'will be', 'have been'], 'Advice with Type 2.', '"If I were you" is the standard form.'],
          ['____ you hurry, you will miss the bus.', 'Unless', ['If', 'When', 'Because'], 'If you do NOT hurry…', 'Unless = if … not.'],
        ]),
        mcq('type', 'Is it a fact, likely, imaginary or past-unreal?', [
          ['"If you mix red and yellow, you get orange." Type?', 'Type 0', ['Type 1', 'Type 2', 'Type 3'], 'Always true.', 'A general truth → Type 0.'],
          ['"If we leave now, we will catch the train." Type?', 'Type 1', ['Type 0', 'Type 2', 'Type 3'], 'Likely future.', 'present + will → Type 1.'],
          ['"If I won a lottery, I would build a school." Type?', 'Type 2', ['Type 0', 'Type 1', 'Type 3'], 'Imaginary.', 'past + would → Type 2.'],
          ['"If the ships had returned, Antonio would have paid." Type?', 'Type 3', ['Type 0', 'Type 1', 'Type 2'], 'It did not happen.', 'had + V3, would have + V3 → Type 3.'],
          ['"If you press this button, the light comes on." Type?', 'Type 0', ['Type 1', 'Type 2', 'Type 3'], 'A fixed result.', 'Present + present → Type 0.'],
        ]),
        errT('spot', ['No "will" or "would" in the if-clause.', 'Match the main clause to the type.'], [
          ['If it | will rain, | we will | stay indoors.', 1, 'If it rains, we will stay indoors.', 'Type 1 if-clause uses simple present.'],
          ['If I | would have known, | I would have | helped you.', 1, 'If I had known, I would have helped you.', 'Type 3 if-clause: had + V3.'],
          ['If I | was you, | I would | apologise.', 1, 'If I were you, I would apologise.', 'Use "were" in "If I were you".'],
          ['If you | study well, | you would | pass.', 2, 'If you study well, you will pass.', 'Type 1: present in the if-clause → will in the main clause.'],
          ['Unless you | do not hurry, | you will | be late.', 0, 'Unless you hurry, you will be late.', '"Unless" already means "if not"; remove "do not".'],
        ]),
      ],
    },
    {
      id: 'ts9.en.script', title: 'Writing: converting a story into a play script', prereqs: [],
      intro: [
        h('Script format'),
        p('A play is told almost entirely through dialogue and stage directions. Converting a story into a script is a common writing task.'),
        stepsB(
          'Title of the play.',
          'Characters list (with a few words about each).',
          'Setting: time and place, in italics or brackets.',
          'Dialogue: character’s name in capitals, a colon, then the words — no quotation marks.',
          'Stage directions in brackets, in present tense: (enters slowly), (angrily).',
          'End with a clear final line or "(Curtain falls)".',
        ),
        h('Model scene (our own)'),
        p('THE LOST KITE. Characters: RAVI, a 12-year-old boy; MEENA, his sister. Setting: a rooftop in Karimnagar on Sankranti morning. RAVI: (pointing at the sky) Look! My kite is flying higher than everyone’s! MEENA: Careful, the string is rubbing against the water tank. RAVI: Don’t worry, I know what I’m doing. (The string snaps.) Oh no! MEENA: (laughing gently) Never mind. Let’s make a new one together. (They go downstairs. Curtain falls.)'),
        keys('Checklist: title; characters; setting; names in capitals with colons; no quotation marks; stage directions in brackets and present tense; dialogue that shows feelings.'),
        remember('Common errors: using "said" and quotation marks inside a script ✗; writing stage directions in past tense ✗; long narration instead of dialogue ✗.'),
      ],
      examples: [
        ex('Convert to script: Meena angrily asked Ravi why he had broken her pencil.', ['Name + colon; feeling as a stage direction; direct words.'], 'MEENA: (angrily) Ravi, why did you break my pencil?'),
        ex('Convert to a stage direction: The teacher walked into the classroom slowly.', ['Present tense, in brackets.'], '(The teacher enters slowly.)'),
      ],
      practice: [
        orderT('format', ['Title first.', 'Dialogue comes after the setting.'], [
          ['Title | Characters | Setting | Dialogue with stage directions | (Curtain falls)', 'A script introduces the play before the action begins.'],
          ['RAVI: | (excitedly) | We won | the match!', 'Name and colon → stage direction → spoken words.'],
        ]),
        mcq('correct', 'Scripts use names, colons and brackets — not quotation marks.', [
          ['Which line is in correct script format?', 'SITA: (softly) Please close the door.', ['Sita said softly, "Please close the door."', '"Please close the door," said Sita.', 'Sita softly told to close the door.'], 'No "said", no quotation marks.', 'Script lines: NAME: (direction) words.'],
          ['Which is a correct stage direction?', '(He opens the window.)', ['He opened the window.', '"He opens the window."', 'HE: opens the window'], 'Present tense, brackets.', 'Stage directions are in brackets and present tense.'],
          ['Where are the characters introduced?', 'At the beginning, after the title', ['At the end', 'Inside every stage direction', 'Nowhere'], 'Readers need to know who is who.', 'A list of characters follows the title.'],
          ['Which detail belongs in the setting?', 'A village courtyard, evening', ['RAVI: Hello!', 'Yours faithfully,', 'The End of Chapter 2'], 'Time and place.', 'Setting = time and place.'],
          ['How is a character’s feeling usually shown in a script?', 'In a stage direction in brackets', ['With a long paragraph of narration', 'With quotation marks', 'In the title'], 'Actors need instructions.', 'Feelings are shown through dialogue and brackets like (angrily).'],
        ]),
        matchT('parts', 'script part with its example', [
          ['Title', 'THE LOST KITE'], ['Setting', 'A rooftop on Sankranti morning'], ['Dialogue', 'MEENA: Never mind.'], ['Stage direction', '(The string snaps.)'], ['Ending', '(Curtain falls.)'],
        ], ['Brackets hold stage directions.', 'Name + colon = dialogue.']),
      ],
    },
  ],
};

// =====================================================================================
// Unit 8 — Travel and Tourism
// =====================================================================================
const u8: USpec = {
  id: 'ts9.en.u8', subject: 'english', title: 'Travel and Tourism', source: src(8),
  note: 'The travelogue-writing objective is a WonderLab addition.',
  objectives: [
    {
      id: 'ts9.en.bryson.read', title: 'Reading: The Accidental Tourist', prereqs: [],
      intro: [
        h('About the author'),
        p('Bill Bryson (born 1951) is an American-British writer famous for funny travel books such as Notes from a Small Island and for A Short History of Nearly Everything.'),
        h('What the essay is about (our summary)'),
        p('In this humorous essay Bryson describes himself as hopelessly clumsy and absent-minded, especially when travelling. He tells of comic disasters: losing tickets and passports, struggling with seat belts and food packets on planes, spilling food and drinks on himself and on other passengers, and getting into embarrassing situations at airports. He admits he travels a great deal yet never seems to learn how to travel neatly, and he envies calm, organised passengers.'),
        keys('Humour: self-mockery and exaggeration — he makes himself the target of the joke.', 'Tone: light, chatty, conversational.', 'Message: everyone makes silly mistakes; laughing at ourselves is healthy.', 'Title: "accidental" — his travels are full of accidents.'),
        def('Frequent flyer', 'Someone who travels by air very often; airlines reward such passengers with points.'),
        remember('Compare with Unit 1: like Basheer, Bryson laughs at himself. In answers, give an example of self-mockery and say why it is funny.'),
      ],
      examples: [
        ex('Why is the essay called "The Accidental Tourist"?', ['He is a tourist/traveller.', 'His trips are full of accidents and mishaps.'], 'Because his travels are a series of comic accidents caused by his clumsiness.'),
        ex('Name the main type of humour in the essay.', ['Who is the joke on?'], 'Self-mockery (the writer laughs at himself), helped by exaggeration.'),
      ],
      practice: [
        mcq('comp', 'Think about Bryson and his mishaps.', [
          ['Who wrote "The Accidental Tourist" essay in this unit?', 'Bill Bryson', ['Vikram Seth', 'Dilip Chitre', 'Ruskin Bond'], 'An American-British humorist.', 'Bill Bryson wrote it.'],
          ['What kind of person does Bryson say he is?', 'Clumsy and absent-minded', ['Neat and organised', 'Rude and angry', 'Shy and silent'], 'He keeps having accidents.', 'He presents himself as clumsy and forgetful.'],
          ['Where do many of his mishaps happen?', 'On planes and at airports', ['In a cricket stadium', 'In a classroom', 'On a farm'], 'He travels a lot by air.', 'Most incidents take place during air travel.'],
          ['What is the tone of the essay?', 'Light and humorous', ['Tragic', 'Angry', 'Scientific'], 'Does it make you smile?', 'The essay is light, chatty and funny.'],
          ['What humour technique does Bryson mainly use?', 'Self-mockery', ['Satire of politicians', 'Puns on names', 'Nonsense words'], 'Who is the joke on?', 'He makes fun of himself.'],
          ['What does he feel about calm, organised travellers?', 'He envies them', ['He hates them', 'He ignores them', 'He teaches them'], 'He wishes he were like them.', 'He envies their neatness and calm.'],
        ]),
        matchT('words', 'word with its meaning', [
          ['clumsy', 'awkward and careless in movement'], ['absent-minded', 'forgetful'], ['mishap', 'a small accident'], ['frequent flyer', 'someone who often travels by air'], ['envy', 'wish to have what another has'],
        ], ['Mishap = small accident.', 'Absent-minded = forgetful.']),
        orderT('sent', ['Start with the time clause.', 'Subject → verb → object.'], [
          ['As soon as the meal was served, | Bryson | spilled | his drink.', 'Time clause → subject → verb → object.'],
          ['Although he travels often, | he | never learns | to travel neatly.', 'Contrast clause → subject → verb → object.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.travel.poem', title: 'Father Returning Home; Kathmandu', prereqs: [],
      intro: [
        h('Poem B: Father Returning Home'),
        p('Dilip Chitre (1938–2009) was a Marathi and English poet, painter and filmmaker from Mumbai. In this poem the speaker describes his ageing father travelling home on a late-evening suburban train, standing among silent passengers, tired and wet in the rain. At home he eats a stale meal, feels ignored by his grown-up children, and withdraws into his own thoughts and dreams.'),
        keys('Themes: loneliness and alienation in city life; the generation gap; old age and neglect.', 'Imagery: grey, damp and tired pictures (soaked clothes, crowded train, muddy walk) build a mood of gloom.', 'Tone: sad, sympathetic and reflective.'),
        h('Reading C: Kathmandu'),
        p('This extract from Vikram Seth’s travel book Heaven Lake (1983) describes his visit to Kathmandu, Nepal, at the end of a long journey from China through Tibet.'),
        keys('Pashupatinath: a famous Hindu temple — crowded, noisy and full of activity, with priests, hawkers, devotees and monkeys; on the banks of the Bagmati river.', 'Baudhnath: a great Buddhist stupa — calm, quiet and peaceful, surrounded by Tibetan shops.', 'The streets: busy and colourful, with vendors of all kinds; he is fascinated by a flute seller and the music of the flute.', 'He decides to travel home to Delhi overland by bus and train rather than fly.'),
        remember('Contrast is the key device in Kathmandu: the chaos of Pashupatinath versus the stillness of Baudhnath.'),
      ],
      examples: [
        ex('How does the poet show the father’s loneliness?', ['Silent co-passengers; children who do not share with him; he withdraws into dreams.'], 'Through images of a tired man ignored on the train and at home, alone with his thoughts.'),
        ex('Contrast Pashupatinath and Baudhnath in one sentence.', ['One is crowded and noisy; the other is calm.'], 'Pashupatinath is crowded and chaotic, while Baudhnath is calm and peaceful.'),
      ],
      practice: [
        mcq('comp', 'Recall details of the poem and the travelogue.', [
          ['Who wrote "Father Returning Home"?', 'Dilip Chitre', ['Vikram Seth', 'Edward Lear', 'Rabindranath Tagore'], 'A poet from Mumbai.', 'Dilip Chitre wrote the poem.'],
          ['How does the father travel home?', 'By a late-evening suburban train', ['By car', 'On a bicycle', 'By aeroplane'], 'A city commute.', 'He takes the local train home.'],
          ['Which theme fits the poem best?', 'Loneliness and alienation', ['Victory in sport', 'Humour', 'Adventure at sea'], 'He feels unwanted.', 'The poem shows a lonely, alienated old man.'],
          ['Kathmandu is taken from which book?', 'Heaven Lake', ['Gitanjali', 'Swami and Friends', 'Long Walk to Freedom'], 'Vikram Seth’s travel book.', 'It is from Heaven Lake.'],
          ['How does Seth describe Baudhnath?', 'Calm and peaceful', ['Noisy and crowded', 'Dirty and ruined', 'Closed to all visitors'], 'Contrast with Pashupatinath.', 'Baudhnath stupa is a place of quiet calm.'],
          ['What fascinates Seth in the streets of Kathmandu?', 'A flute seller and his music', ['A cricket match', 'A car race', 'A cinema hall'], 'A musical instrument.', 'He is absorbed by the flute seller’s music.'],
        ]),
        matchT('places', 'place or person with its description', [
          ['Pashupatinath', 'crowded Hindu temple by the Bagmati'], ['Baudhnath', 'calm Buddhist stupa'], ['Vikram Seth', 'author of Heaven Lake'], ['Dilip Chitre', 'poet of Father Returning Home'], ['Bagmati', 'river in Kathmandu'],
        ], ['Stupa = Buddhist monument.', 'Separate the people from the places.']),
        mcq('device', 'Think about the effect of each device.', [
          ['Images of soaked clothes and a crowded train create a mood of…', 'gloom and weariness', ['joy and celebration', 'fear and horror', 'excitement'], 'Wet, tired, crowded.', 'The images build a gloomy, weary mood.'],
          ['Seth places noisy Pashupatinath beside calm Baudhnath. This device is…', 'contrast', ['rhyme', 'hyperbole', 'onomatopoeia'], 'Opposites side by side.', 'Placing opposites together is contrast.'],
          ['The father’s children do not share their thoughts with him. This shows…', 'the generation gap', ['his wealth', 'his sense of humour', 'his good health'], 'Young versus old.', 'The distance between generations is the generation gap.'],
          ['The tone of "Father Returning Home" is…', 'sad and sympathetic', ['comic', 'boastful', 'angry'], 'How does the speaker feel about his father?', 'The poem is sad and sympathetic.'],
          ['A travelogue is…', 'a written account of travel experiences', ['a train timetable', 'a play script', 'a news headline'], 'Heaven Lake is one.', 'A travelogue records a writer’s journeys.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.travel.vocab', title: 'Vocabulary: compound words, homonyms and sound words', prereqs: [],
      intro: [
        h('Compound words'),
        p('A compound word joins two words to make a new one: railway, suitcase, sightseeing, passport, airport, guidebook, homesick, self-service, check-in.'),
        h('Homonyms'),
        def('Homonyms', 'Words that sound or are spelled the same but have different meanings. Homophones sound the same but are spelled differently (sail/sale, fair/fare, piece/peace); homographs are spelled the same (a bat for cricket / a bat that flies).'),
        h('Words related to sounds'),
        keys('Animals: lions roar, dogs bark, cats mew, crows caw, cuckoos coo, bees buzz, horses neigh, snakes hiss, elephants trumpet, frogs croak.', 'Things: bells ring/toll, coins jingle, leaves rustle, doors creak, thunder rumbles, brakes screech, a train whistles, water gurgles.'),
        stepsB('For compounds: check that both parts are real words and the meaning combines them.', 'For homophones: read the sentence and pick the spelling that matches the meaning.', 'For sound words: picture the source and the kind of sound it makes.'),
        remember('Common confusions: fare (ticket price) vs fair (just / an exhibition); sight (seeing) vs site (place); there (place) vs their (belonging to them).'),
      ],
      examples: [
        ex('Choose: "The bus (fair / fare) to Warangal is ₹150."', ['Ticket price → fare.'], 'fare'),
        ex('Make a compound word for a book that guides tourists.', ['guide + book'], 'guidebook'),
      ],
      practice: [
        mcq('homophone', 'Match the spelling to the meaning.', [
          ['The train ____ to Tirupati has gone up.', 'fare', ['fair', 'fear', 'fire'], 'Ticket price.', 'Fare = price of a journey.'],
          ['We visited the ____ of the old fort.', 'site', ['sight', 'cite', 'sigh'], 'A place.', 'Site = place or location.'],
          ['The tourists left ____ bags at the hotel.', 'their', ['there', 'they’re', 'thier'], 'Belonging to them.', 'Their = belonging to them.'],
          ['There was a big ____ on saris at the market.', 'sale', ['sail', 'sell', 'seal'], 'Lower prices.', 'Sale = selling at reduced prices.'],
          ['The pilgrims walked in ____ and silence.', 'peace', ['piece', 'peas', 'pace'], 'Calm.', 'Peace = calm, quiet.'],
        ]),
        matchT('sounds', 'source with the sound it makes', [
          ['lion', 'roar'], ['snake', 'hiss'], ['bee', 'buzz'], ['horse', 'neigh'], ['crow', 'caw'], ['frog', 'croak'], ['coins', 'jingle'], ['dry leaves', 'rustle'],
        ], ['Say each sound aloud — many imitate the noise.', 'Snakes hiss; bees buzz.']),
        mcq('compound', 'Both parts must be real words that combine in meaning.', [
          ['Which is a compound word?', 'suitcase', ['suitable', 'casement', 'sudden'], 'Two words joined.', 'suit + case = suitcase.'],
          ['A place where planes land and take off is an ____.', 'airport', ['airline', 'seaport', 'airbag'], 'air + port.', 'airport.'],
          ['Feeling sad because you are away from home:', 'homesick', ['homework', 'homemade', 'hometown'], 'Missing home.', 'homesick = missing home.'],
          ['Visiting interesting places as a tourist:', 'sightseeing', ['sightless', 'seashore', 'eyesight'], 'Seeing the sights.', 'sightseeing.'],
          ['The ____ was blocked by a fallen tree, so the train stopped.', 'railway', ['raincoat', 'rainbow', 'runway'], 'Track for trains.', 'rail + way = railway.'],
          ['Which sound word suits an old door?', 'creak', ['buzz', 'neigh', 'roar'], 'A slow, squeaky sound.', 'Old doors creak.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.passive', title: 'Grammar: passive voice', prereqs: ['ts9.en.verb.phrase'],
      intro: [
        h('Active and passive'),
        p('In the active voice the subject does the action: "Tourists visit the Charminar." In the passive voice the receiver of the action becomes the subject: "The Charminar is visited by tourists." We use the passive when the doer is unknown, unimportant or obvious, or when we want to focus on the thing affected — common in notices, news and science.'),
        stepsB(
          'Find the object of the active sentence — it becomes the new subject.',
          'Keep the tense of the active verb, and use the same tense of "be".',
          'Add the past participle (V3) of the main verb.',
          'Add "by + doer" only if it is important.',
          'Make "be" agree with the new subject (is/are, was/were).',
        ),
        keys('Simple present: am/is/are + V3 — Tickets are sold here.', 'Simple past: was/were + V3 — The fort was built in the 16th century.', 'Present continuous: is/are being + V3 — The road is being repaired.', 'Present perfect: has/have been + V3 — The hotel has been booked.', 'Future / modals: will be / can be / must be + V3 — Your bags will be checked.'),
        remember('Common errors: (1) wrong V3 — "was builded" ✗ → "was built" ✓. (2) forgetting "being" in continuous passives. (3) Intransitive verbs (sleep, arrive, happen) have no object and cannot be made passive.'),
      ],
      examples: [
        ex('Change to passive: "Muhammad Quli Qutb Shah built the Charminar."', ['Object: the Charminar → subject.', 'Simple past → was + V3 (built).', 'Doer important → by Muhammad Quli Qutb Shah.'], 'The Charminar was built by Muhammad Quli Qutb Shah.'),
        ex('Change to passive: "They are repairing the bridge."', ['Present continuous → is being + V3.'], 'The bridge is being repaired.'),
        ex('Change to passive: "You must show your ticket at the gate."', ['modal + be + V3; doer obvious.'], 'Your ticket must be shown at the gate.'),
      ],
      practice: [
        mcq('convert', 'Keep the tense; use be + V3.', [
          ['"The guide showed us the museum."', 'We were shown the museum by the guide.', ['We showed the museum by the guide.', 'We are shown the museum by the guide.', 'We were show the museum by the guide.'], 'Simple past → were + V3.', 'were + shown.'],
          ['"Workers are cleaning the lake."', 'The lake is being cleaned by workers.', ['The lake is cleaned by workers.', 'The lake was being clean by workers.', 'The lake has cleaned by workers.'], 'Continuous → being.', 'is being + cleaned.'],
          ['"The hotel has cancelled our booking."', 'Our booking has been cancelled by the hotel.', ['Our booking was cancel by the hotel.', 'Our booking has cancelled by the hotel.', 'Our booking is being cancelled by the hotel.'], 'Present perfect → has been + V3.', 'has been cancelled.'],
          ['"They will open the new airport next month."', 'The new airport will be opened next month.', ['The new airport will opened next month.', 'The new airport will be open next month by.', 'The new airport is opened next month.'], 'Future → will be + V3.', 'will be opened.'],
          ['"People speak Nepali in Kathmandu."', 'Nepali is spoken in Kathmandu.', ['Nepali is speaking in Kathmandu.', 'Nepali was spoke in Kathmandu.', 'Nepali are spoken in Kathmandu.'], 'Simple present; doer is general.', 'is + spoken; "by people" is left out.'],
          ['"Someone stole my passport."', 'My passport was stolen.', ['My passport was stealed.', 'My passport is stolen by someone yesterday.', 'My passport stolen.'], 'Unknown doer — omit it.', 'was + stolen.'],
        ], 2),
        orderT('build', ['The thing affected comes first.', 'be + V3 forms the verb.'], [
          ['The Thousand Pillar Temple | was built | by | the Kakatiya rulers.', 'Subject → was + V3 → by → doer.'],
          ['Your luggage | will be checked | at | the airport.', 'Subject → will be + V3 → place.'],
          ['The old temple | is being | repaired | by the villagers.', 'Subject → is being → V3 → by-phrase.'],
          ['Photography | is not allowed | inside | the museum.', 'Subject → negative passive → place.'],
        ]),
        errT('spot', ['Check the V3 form.', 'Check that "be" agrees with the subject and tense.'], [
          ['The Charminar | was builded | in | 1591.', 1, 'The Charminar was built in 1591.', 'The V3 of build is built.'],
          ['These temples | was visited | by thousands | last year.', 1, 'These temples were visited by thousands last year.', 'Plural subject → were.'],
          ['The road | is repaired | right now | by the workers.', 1, 'The road is being repaired right now by the workers.', '"Right now" needs the continuous passive: is being repaired.'],
          ['Our tickets | have been | book | already.', 2, 'Our tickets have been booked already.', 'After "been", use V3: booked.'],
          ['English | is speak | in many | countries.', 1, 'English is spoken in many countries.', 'Passive = be + V3: spoken.'],
        ]),
      ],
    },
    {
      id: 'ts9.en.travelogue', title: 'Writing: a travelogue', prereqs: [],
      intro: [
        h('What is a travelogue?'),
        p('A travelogue is a personal account of a journey — what you saw, did, heard and felt. Unlike a report, it is written in the first person and includes impressions and feelings. Heaven Lake is a famous example.'),
        stepsB(
          'Title that names the place or the experience.',
          'Introduction: where you went, when, with whom and why.',
          'The journey: how you travelled and anything interesting on the way.',
          'The places: vivid description using the senses (sights, sounds, smells, tastes).',
          'People and incidents: one or two memorable moments.',
          'Conclusion: your feelings and what the trip meant to you.',
        ),
        h('Model travelogue (our own, short)'),
        p('A Morning at Bhongir Fort. Last December, my cousins and I took an early bus from Hyderabad to Bhongir to climb the fort that sits on a giant egg-shaped rock. The climb was steep, and the steps were cut into bare granite. Halfway up, monkeys chattered at us and a cool wind whistled through the old gateways. At the top, the whole town lay below like a map, and we could hear temple bells ringing far away. We shared hot idlis from a tiffin box and watched kites circling. Tired but happy, we promised to return in the monsoon when the hills turn green.'),
        keys('Checklist: title; first-person voice; past tense; clear sequence (journey → places → incidents → feelings); sensory details; at least one memorable moment; a personal conclusion.'),
        remember('Common errors: writing a list of places with no feelings; mixing present and past tense; copying facts from a guidebook instead of your own experience.'),
      ],
      examples: [
        ex('Add a sensory detail: "We reached the beach."', ['Add sight, sound or smell.'], 'We reached the beach, where the waves crashed and the air smelt of salt.'),
        ex('Write a conclusion for a trip to Ramappa Temple.', ['Feelings + meaning of the trip.'], 'I came home amazed that craftsmen eight centuries ago could carve stone so delicately — I will never forget it.'),
      ],
      practice: [
        orderT('structure', ['Introduce the trip first.', 'Feelings come last.'], [
          ['We set off for Ramoji Film City on a Sunday. | The bus ride took an hour. | We watched a stunt show and toured film sets. | I came home tired but thrilled.', 'Introduction → journey → places/incidents → feelings.'],
          ['At the top of the hill, | we | could see | the whole town below.', 'Place phrase → subject → verb → object.'],
        ]),
        mcq('style', 'A travelogue is personal and descriptive.', [
          ['Which sentence suits a travelogue best?', 'As the boat drifted, the cool spray on my face made me laugh.', ['The boat is 12 metres long.', 'Boats must be registered with the authorities.', 'Click here to book boats.'], 'Look for personal feeling and senses.', 'Travelogues use first-person, sensory description.'],
          ['Which point of view does a travelogue usually use?', 'First person (I, we)', ['Second person only (you)', 'Third person only', 'No pronouns at all'], 'It is your experience.', 'A travelogue is told in the first person.'],
          ['Which detail appeals to the sense of hearing?', 'Temple bells rang in the distance.', ['The walls were yellow.', 'The idlis were soft.', 'The rock felt rough.'], 'Hearing = sound.', 'Bells ringing is a sound detail.'],
          ['Which is the best title for a travelogue?', 'Sunrise at Laknavaram Lake', ['Chapter 4 Questions', 'Yours faithfully', 'Notice'], 'Name the place or experience.', 'A good title names the place or experience.'],
          ['Which tense is normally used to narrate the trip?', 'Past tense', ['Future tense', 'Imperative', 'Only present perfect continuous'], 'The trip is over.', 'Travelogues narrate past events in the past tense.'],
        ]),
        matchT('senses', 'detail with the sense it appeals to', [
          ['The sea glittered in the sun', 'sight'], ['Monkeys chattered in the trees', 'hearing'], ['Hot mirchi bajji burnt my tongue', 'taste'], ['The air smelt of jasmine', 'smell'], ['The granite steps felt rough', 'touch'],
        ], ['Ask which body part notices each detail.', 'Smell — nose; touch — skin.']),
      ],
    },
  ],
};

export const units: USpec[] = [u1, u2, u3, u4, u5, u6, u7, u8];
