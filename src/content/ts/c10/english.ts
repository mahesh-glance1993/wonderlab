// Telangana SCERT Class 10 — English (8 thematic units). Original teaching ABOUT each lesson — summaries, themes,
// characters, devices and vocabulary written in our own words. The textbook's passages, poems and plays are
// copyrighted and are never reproduced here. All grammar examples and exercises are original sentences.
import {
  tp, ex, p, h, tip, def, keys, remember, photo, stepsB, choose, matching, ordering, tapAll, text,
  type USpec, type TSpec,
} from '../../lib/kit';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(10, 'english', n);

// ---------- compact practice factories ----------
/** [question, correct answer, wrong answers, second hint, why the answer is right, optional targeted traps [wrong label, explanation]] */
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
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair is mismatched. Take the left items one at a time and test each against every option on the right.' }],
    solution: pairs.map(([a, b]) => `${a} → ${b}`),
  };
}, d);

/** [prompt, items in the correct order, why] — for sequencing events, letter parts, or words into a sentence. */
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
// Unit 1 — Personality Development
// =====================================================================================
const u1: USpec = {
  id: 'ts10.en.u1', subject: 'english', title: 'Unit 1 — Personality Development', source: src(1),
  note: 'Reading C (I Will Do It) is treated at theme level only; teachers should add details of its subject from the textbook.',
  objectives: [
    {
      id: 'ts10.en.attitude.read', title: 'Attitude is Altitude: turning failure into strength', prereqs: [],
      intro: [
        h('What this unit is about'),
        photo('💪', 'Strength is not only in arms and legs. This unit is about the strength of the mind — attitude.'),
        p('Unit 1 asks a big question: why do some people rise after a fall while others give up? The three readings answer it through real lives. A. Attitude is Altitude tells the life of Nick Vujicic. B. Every Success Story is Also a Story of Great Failures shows that famous achievers failed many times before they succeeded. C. I Will Do It is another short life-story about firm determination.'),
        h('Reading A in brief (our summary)'),
        p('Nick Vujicic was born in Melbourne, Australia, in 1982 without arms and legs, because of a rare condition called tetra-amelia. He had only a small foot with two toes. As a child he was teased at school and often felt lonely and hopeless; he wondered why he had been born like this.'),
        p('Slowly his outlook changed. His parents encouraged him, and he was moved by the story of another person who lived bravely with a severe disability. Nick learned to write and type with his toes, to swim and even to surf. He finished a university degree in commerce and began speaking to young people about hope. He started an organisation called Life Without Limbs and has spoken in dozens of countries. His message: you may not be able to change your situation, but you can choose your attitude to it.'),
        h('Reading B in brief'),
        p('This essay argues that failure is not the opposite of success but a part of it. Achievers whom we admire — scientists, leaders, sportspersons — usually failed again and again. What made them different is that they learnt from each failure and kept trying. (Well-known examples include Thomas Edison\'s many unsuccessful experiments before a working electric bulb, and Abraham Lincoln\'s several election defeats before he became President of the USA.)'),
        def('Theme', 'The central idea of a text. Here: a positive attitude and perseverance can lift a person above disability and failure — "attitude decides altitude" (how high you rise).'),
        def('Biographical sketch', 'A short account of a real person\'s life — birth, struggles, turning points and achievements — written to show what made that person remarkable.'),
        keys(
          'Nick\'s challenge was physical, but his real battle was with hopelessness.',
          'Turning point: he stopped asking "Why me?" and started asking "What can I do?"',
          'Values: courage, perseverance, gratitude, compassion for others who suffer.',
          'Reading B: every failure teaches something; giving up is the only real defeat.',
        ),
        remember('In exam answers, do not say Nick "had no problems after he became positive". The texts show that he still faced difficulties — what changed was how he responded to them.'),
        tip('Discuss: Think of someone in your village or colony who overcame a difficulty. What attitude helped them?'),
      ],
      examples: [
        ex('Why is the lesson titled "Attitude is Altitude"?', ['"Altitude" means height.', 'Nick\'s body did not change, but his attitude did — and that took him to great heights of success.', 'So the title says: how high you rise depends on your attitude.'], 'Because a positive attitude, not physical ability, decided how high Nick could rise in life.'),
        ex('Infer one quality of Nick\'s parents from the summary.', ['The summary says his parents encouraged him even though his condition was rare and difficult.', 'Encouraging a child through such a hard situation needs patience and love.'], 'They were loving and supportive (patient, encouraging).'),
      ],
      practice: [
        mcq('main-idea', 'Look for the idea that runs through all three readings, not one small detail.', [
          ['What is the main message of Unit 1\'s readings?', 'A positive attitude and perseverance help people rise above difficulties.', ['Disabled people cannot succeed in sports.', 'Success comes only to people born rich.', 'Failure should be hidden from others.'], 'All three readings show people who did not give up.', 'Each reading shows that determination and the right attitude matter more than circumstances.'],
          ['What was the turning point in Nick Vujicic\'s life?', 'He chose to focus on what he could do instead of what he lacked.', ['He was given artificial arms that solved all his problems.', 'He moved to a school with no other students.', 'He decided never to speak about his disability.'], 'Think about the change in his thinking.', 'His body stayed the same; his outlook changed — that was the turning point.'],
          ['Reading B says that failure is…', 'a stepping stone to success when we learn from it', ['the opposite of success', 'proof that a person has no talent', 'something only weak people face'], 'Read the title of Reading B again.', 'The essay\'s title itself says every success story is also a story of failures.'],
          ['Which word best describes Nick\'s attitude in adult life?', 'Optimistic', ['Bitter', 'Careless', 'Proud'], 'He speaks to others about hope.', 'Someone who spreads hope and sees possibilities is optimistic.', [['Bitter', 'Bitterness is how he felt as a lonely child, not his adult attitude.']]],
          ['Why did Nick start speaking to young people?', 'To give them hope and show that challenges can be faced', ['To earn fame as a film actor', 'To ask for money for his own treatment', 'Because his school forced him to'], 'Think of the name of his organisation and his message.', 'He wanted others, especially young people in despair, to find the hope he had found.'],
          ['"Attitude decides altitude." What does "altitude" mean here?', 'How high a person rises in life', ['The height of a mountain only', 'A person\'s body height', 'The speed of an aeroplane'], 'The word is used figuratively.', 'Literally altitude is height above the ground; figuratively it is the level of success a person reaches.'],
        ]),
        orderT('sequence', ['Start with his birth.', 'Sadness comes before the change of outlook; achievements come last.'], [
          ['Put these events of Nick Vujicic\'s life (from our summary) in order.', ['Born without arms and legs in Melbourne', 'Felt lonely and hopeless as a teased schoolboy', 'Was inspired by the story of another person with a disability', 'Learned to write, swim and surf', 'Began speaking to young people about hope'], 'A life story moves from birth, through struggle and a turning point, to achievement.'],
          ['Arrange the stages of a typical "success through failure" story.', ['A person sets a goal', 'The first attempts fail', 'The person studies what went wrong', 'They try again with a better plan', 'They finally succeed'], 'Learning from failure comes between failing and trying again.'],
        ]),
        matchT('traits', 'person or idea with the best description', [
          ['Nick Vujicic', 'Speaker who spreads hope despite having no limbs'],
          ['Nick\'s parents', 'Encouraged their son through a hard childhood'],
          ['A person who learns from failure', 'Treats each setback as a lesson'],
          ['Life Without Limbs', 'Organisation Nick started to reach people'],
          ['Tetra-amelia', 'Rare condition: being born without arms and legs'],
          ['Perseverance', 'Continuing to try in spite of difficulty'],
        ], ['Read each right-hand description carefully.', 'Names of people go with actions; terms go with definitions.']),
      ],
    },
    {
      id: 'ts10.en.u1vocab.words', title: 'Word power: success, failure and courage', prereqs: [],
      intro: [
        h('Words that describe a fighting spirit'),
        p('The readings in this unit use words about struggle and success. Learning them as families — a word, its opposite and its other forms — makes them easier to remember and use.'),
        def('Perseverance (noun)', 'Continuing to try even when it is hard. Verb: persevere. "Sravani persevered with her chess practice for two years and finally won the district title."'),
        def('Determination (noun)', 'A firm decision to do something. Adjective: determined.'),
        def('Setback (noun)', 'Something that stops progress for a time. "Losing the first match was a setback, not the end."'),
        def('Adversity (noun)', 'A situation of great difficulty or bad luck.'),
        def('Despair (noun / verb)', 'Complete loss of hope. Opposite: hope.'),
        def('Inspire (verb)', 'To fill someone with the wish to do something good. Noun: inspiration. Adjective: inspiring.'),
        h('Building words with prefixes and suffixes'),
        stepsB(
          'Find the root word: able, hope, courage, success.',
          'Add a prefix to change the meaning: dis + able → disable; un + successful → unsuccessful.',
          'Add a suffix to change the word class: hope + ful → hopeful (adjective); courage + ous → courageous (adjective); able → ability (noun).',
          'Check spelling: able → ability (the ending changes), but courage keeps its e in courageous to keep the soft g sound.',
        ),
        keys('-ful = full of (hopeful); -less = without (hopeless).', 'dis-, un-, in-, im- make opposites: disability, unsuccessful, inactive, impossible.', 'Phrasal verbs of courage: give up (stop trying), bounce back (recover quickly), carry on (continue), look up to (admire).'),
        remember('Do not confuse "disabled" (adjective: having a disability) with "disability" (noun: the condition). Say "a person with a disability".'),
      ],
      examples: [
        ex('Give the opposite of "hopeful" using a suffix.', ['Root: hope', '-ful means "full of"; -less means "without".', 'Replace -ful with -less.'], 'hopeless'),
        ex('Complete: "After the accident she did not ___ ; she trained harder." (phrasal verb meaning "stop trying")', ['We need a phrasal verb for quitting.', 'give up = stop trying', 'Put it in the sentence after "did not" (base form).'], 'give up'),
      ],
      practice: [
        mcq('meaning', 'Use the clue words in the sentence.', [
          ['Choose the meaning of "perseverance".', 'Continuing to try in spite of difficulty', ['Giving up quickly', 'Being lucky', 'Feeling jealous'], 'Think of someone who keeps going.', 'Perseverance is steady effort that does not stop at difficulties.'],
          ['"The flood was a setback for the farmers." A setback is…', 'something that delays or stops progress', ['a reward for hard work', 'a type of crop', 'a happy surprise'], 'The flood harmed the farmers\' plans.', 'A setback is a difficulty that pushes progress back for a while.'],
          ['Which word means "complete loss of hope"?', 'Despair', ['Delight', 'Desire', 'Display'], 'It is the opposite of hope.', 'Despair = total hopelessness.'],
          ['"Her speech inspired the students." Inspired means…', 'filled them with the wish to do something good', ['made them sleepy', 'confused them', 'frightened them'], 'Good speakers do this.', 'To inspire is to motivate and encourage.'],
          ['Choose the antonym (opposite) of "optimistic".', 'Pessimistic', ['Hopeful', 'Cheerful', 'Confident'], 'Opposite of seeing the bright side.', 'An optimist expects good things; a pessimist expects bad things.'],
          ['Choose the synonym (similar meaning) of "courageous".', 'Brave', ['Timid', 'Lazy', 'Rude'], 'A word for someone who faces fear.', 'Courageous and brave both mean showing courage.', [['Timid', 'Timid is the opposite — easily frightened.']]],
          ['"Adversity" is closest in meaning to…', 'hardship', ['wealth', 'advice', 'adventure'], 'It sounds a bit like "adventure" but is not.', 'Adversity means difficult or unlucky conditions — hardship.', [['adventure', 'Similar sound, different meaning: adventure is an exciting experience.']]],
        ]),
        typed('affix', 'Look at the root word and the clue.', [
          ['Add a suffix to "hope" to mean "without hope".', ['hopeless'], '-less means without.', 'hope + less = hopeless.', [['hopeful', 'Hopeful means full of hope — the opposite of what is asked.']]],
          ['Add a prefix to "successful" to make its opposite.', ['unsuccessful'], 'Which prefix means "not"? un-, dis- or in-?', 'The opposite of successful is unsuccessful.', [['dissuccessful', '"dis-" does not combine with "successful"; use "un-".']]],
          ['Write the noun form of "determined".', ['determination'], 'It ends in -ation.', 'determine → determination.'],
          ['Write the adjective form of "courage" (ends in -ous).', ['courageous'], 'Keep the e before -ous.', 'courage + ous = courageous (the e stays to keep the soft g sound).', [['couragous', 'Keep the e: courageous.']]],
          ['Write the noun form of "able" that means "the power to do something".', ['ability'], 'It ends in -ity.', 'able → ability.'],
          ['Write the verb form of "inspiration".', ['inspire'], 'Remove -ation and add -e.', 'inspiration → inspire.'],
        ]),
        matchT('phrasal', 'phrasal verb with its meaning', [
          ['give up', 'stop trying'], ['bounce back', 'recover quickly after a difficulty'], ['carry on', 'continue'], ['look up to', 'admire and respect'], ['cheer up', 'become happier'], ['stand by', 'support someone in difficulty'],
        ], ['Say each phrasal verb in a sentence of your own.', 'The small word (up, on, by) changes the meaning.']),
      ],
    },
    {
      id: 'ts10.en.relative.clauses', title: 'Defining and non-defining relative clauses', prereqs: [],
      intro: [
        h('Joining ideas with who, which, whose, where'),
        p('A relative clause gives more information about a noun. It begins with a relative pronoun (who, whom, whose, which, that) or a relative adverb (where, when). Relative clauses let you join two short sentences smoothly — very useful in biographical sketches.'),
        def('Defining relative clause', 'Tells us WHICH person or thing we mean. Without it, the sentence is unclear. No commas. "The boy who won the race is my cousin." (Which boy? The one who won.)'),
        def('Non-defining relative clause', 'Adds EXTRA information about a person or thing that is already clear. It is placed between commas. "Nick Vujicic, who was born in Australia, travels the world." (We already know who Nick is.)'),
        h('Choosing the relative word'),
        keys('who — people (subject): the girl who sings', 'whom — people (object), formal: the teacher whom we met', 'which — things and animals', 'that — people or things, ONLY in defining clauses', 'whose — possession: the man whose car broke down', 'where — places: the village where I was born'),
        h('Method: combining two sentences'),
        stepsB(
          'Find the noun that is common to both sentences (or a pronoun that refers back to it).',
          'Choose the relative word: person → who/whom, thing → which/that, possession → whose, place → where.',
          'Ask: does the clause identify the noun, or just add extra information? Identify → defining (no commas). Extra → non-defining (commas).',
          'Remove the repeated noun/pronoun from the second sentence, and place the clause right after the noun it describes.',
        ),
        remember('Never use "that" in a non-defining clause. ✗ "My mother, that is a nurse, works nights." ✓ "My mother, who is a nurse, works nights."'),
        remember('Don\'t repeat the pronoun. ✗ "The book which I bought it is useful." ✓ "The book which I bought is useful."'),
        tip('Names of people and places (proper nouns) are already clear, so a clause after them is usually non-defining and needs commas.'),
      ],
      examples: [
        ex('Combine: "Nick Vujicic was born without limbs. He became a famous speaker."', ['Common noun: Nick Vujicic / he.', 'Person, subject → who.', 'Nick is already identified by name → non-defining → commas.', 'Remove "He" and place the clause after "Nick Vujicic".'], 'Nick Vujicic, who was born without limbs, became a famous speaker.'),
        ex('Combine: "The girl won the essay prize. She sits next to me."', ['Common noun: the girl / she.', 'Person → who.', 'Which girl? The clause tells us → defining → no commas.', 'Remove "She"; put the clause after "The girl".'], 'The girl who sits next to me won the essay prize.'),
        ex('Combine: "This is the village. My grandparents live here."', ['Common idea: the village / here.', 'Place → where.', 'The clause identifies which village → defining, no commas.'], 'This is the village where my grandparents live.'),
      ],
      practice: [
        mcq('choose', 'Decide: person, thing, place or possession? Defining or extra information?', [
          ['My brother, ___ lives in Warangal, is a doctor.', 'who', ['that', 'which', 'whose'], 'There are commas, so this is non-defining.', 'For a person in a non-defining clause use "who" — "that" is not allowed with commas.', [['that', '"That" cannot be used in a non-defining clause (one between commas).']]],
          ['This is the bus ___ goes to Karimnagar.', 'which', ['who', 'whose', 'where'], 'A bus is a thing.', 'For things, use "which" (or "that").', [['where', '"Where" is for places; here the clause tells us what the bus does.']]],
          ['The boy ___ bicycle was stolen complained to the police.', 'whose', ['who', 'which', 'whom'], 'The bicycle belongs to the boy.', '"Whose" shows possession: the boy\'s bicycle.'],
          ['Hyderabad, ___ the Charminar stands, is a busy city.', 'where', ['which', 'who', 'whose'], 'The clause tells us about a place in which something is.', 'Use "where" for a place: the Charminar stands IN Hyderabad.', [['which', '"which" would need a preposition: "in which the Charminar stands".']]],
          ['The coach ___ we met at the stadium trained P. V. Sindhu.', 'whom', ['which', 'whose', 'where'], '"We met the coach" — the coach is the object.', '"Whom" is the formal object form for people (informally "who" or "that" are also heard).'],
          ['The day ___ we went to Ramappa Temple was very hot.', 'when', ['where', 'whose', 'who'], 'The noun is a time word: day.', 'For times (day, year, moment) use "when".'],
        ]),
        typed('fill', 'Type one relative word that fits.', [
          ['Fill in one word: I know a farmer ___ grows organic turmeric.', ['who', 'that'], 'A farmer is a person; there are no commas.', 'Defining clause about a person: who (or that).', [['which', '"which" is for things, not people.']]],
          ['Fill in one word: The pen ___ I bought yesterday has stopped working.', ['which', 'that'], 'A pen is a thing.', 'Defining clause about a thing: which (or that).', [['who', '"who" is only for people.']]],
          ['Fill in one word: Our principal, ___ joined last year, is very strict.', ['who'], 'Notice the commas.', 'Non-defining clause about a person → who ("that" is not allowed).', [['that', 'With commas (non-defining), "that" is not allowed.']]],
          ['Fill in one word: The girl ___ painting won first prize is my cousin.', ['whose'], 'The painting belongs to the girl.', 'Possession → whose.'],
          ['Fill in one word: This is the hospital ___ I was born.', ['where'], 'A hospital is a place.', 'Place → where.', [['which', 'You would need "in which". One word: where.']]],
          ['Fill in one word: Telangana, ___ was formed in 2014, is India\'s youngest state.', ['which'], 'Telangana is a place, but the clause says what IT did (it was formed).', 'The clause has its own subject slot ("it was formed"), so use "which", not "where".', [['where', '"where" would need a new subject: "where something happened". Here Telangana itself was formed → which.']]],
        ]),
        mcq('punctuate', 'Proper nouns are already clear → extra information → commas.', [
          ['Which sentence is punctuated correctly?', 'The Godavari, which flows through Telangana, is a long river.', ['The Godavari which flows through Telangana is a long river.', 'The Godavari, which flows through Telangana is a long river.', 'The Godavari which, flows through Telangana, is a long river.'], 'There is only one Godavari.', 'The clause adds extra information about a named river, so it needs a comma before AND after it.'],
          ['Which sentence uses the relative pronoun wrongly?', 'My mother, that is a nurse, works at night.', ['My mother, who is a nurse, works at night.', 'The nurse who treated me was kind.', 'The medicine that the nurse gave me worked.'], 'Look for "that" between commas.', '"That" cannot introduce a non-defining clause; use "who".'],
          ['Which sentence is correct?', 'The book which I borrowed is interesting.', ['The book which I borrowed it is interesting.', 'The book who I borrowed is interesting.', 'The book whose I borrowed is interesting.'], 'Do not repeat the object, and use the right word for a thing.', 'The relative pronoun already stands for "the book", so "it" must be removed.'],
          ['"Students who finish early may leave." The relative clause here is…', 'defining — it tells us which students may leave', ['non-defining — it adds extra information', 'not a relative clause at all', 'wrongly punctuated'], 'Would the sentence mean the same without the clause?', 'Without it, ALL students could leave — the clause identifies which ones, so it is defining.'],
          ['"My father, who works in Siddipet, visits on Sundays." The clause is…', 'non-defining — it adds extra information', ['defining — it tells us which father', 'a noun clause', 'an adverb clause'], 'You have only one father.', 'Your father is already identified; the clause just adds information, so it is non-defining (with commas).'],
        ], 2),
        orderT('build', ['Find the main subject first.', 'The relative clause sits right after the noun it describes.'], [
          ['Put the parts in order to make a correct sentence.', ['The athlete', 'who lost a leg in an accident', 'climbed', 'Mount Everest.'], 'Subject + relative clause + verb + object.'],
          ['Put the parts in order to make a correct sentence.', ['Abdul Kalam,', 'who grew up in Rameswaram,', 'became', 'the President of India.'], 'Proper noun + non-defining clause (commas) + verb + rest.'],
          ['Put the parts in order to make a correct sentence.', ['This is', 'the school', 'where my mother', 'once taught.'], '"where my mother once taught" describes "the school".'],
          ['Put the parts in order to make a correct sentence.', ['The woman', 'whose shop was flooded', 'received help', 'from her neighbours.'], 'The whose-clause follows "The woman".'],
        ], 2),
      ],
    },
    {
      id: 'ts10.en.biosketch.write', title: 'Writing a biographical sketch', prereqs: [],
      intro: [
        h('A short life-story with a purpose'),
        p('A biographical sketch is a short piece about a real person\'s life. It is not just a list of dates: it shows what made the person special. In the exam you are usually given notes (points) and asked to expand them into a sketch.'),
        def('Biographical sketch', 'A short, factual account of a person\'s life, written in the third person (he/she) and mostly in the past tense.'),
        h('Steps to write one'),
        stepsB(
          'Title: the person\'s name (and a phrase that captures them).',
          'Opening: who the person is and why they are remembered.',
          'Early life: birth (year, place), family, childhood.',
          'Education and struggles: the challenges they faced.',
          'Turning point and achievements: what they did, awards, honours.',
          'Conclusion: their qualities and the message their life gives us.',
        ),
        h('Model sketch (written for WonderLab)'),
        p('Arunima Sinha — Climbing Beyond Limits. Arunima Sinha is the first woman amputee to climb Mount Everest. She was born in 1988 in Uttar Pradesh and was a national-level volleyball player. In 2011, robbers pushed her out of a moving train when she resisted them, and she lost one of her legs. Lying in hospital, she decided that she would not let the accident define her. With an artificial leg, she trained in mountaineering for nearly two years. In May 2013 she reached the summit of Everest. She was later honoured with the Padma Shri. Her life teaches us that courage and perseverance can turn a tragedy into a triumph.'),
        keys('Third person, past tense for past events, present tense for facts that are still true.', 'Use linkers of time: in 2011, later, after that, finally.', 'Combine facts with relative clauses: "…Arunima, who had lost a leg, …"', 'End with qualities and a message.'),
        remember('Do not write a list of disconnected notes. Turn every note into a full sentence and connect the sentences.'),
        tip('Checklist: title ✓ opening ✓ early life ✓ struggle ✓ achievements ✓ qualities/message ✓ third person ✓ past tense ✓.'),
      ],
      examples: [
        ex('Expand the notes into one sentence: "Kalam — b. 1931 — Rameswaram — father boat owner".', ['Use the third person and past tense.', 'Join the notes with a relative clause.'], 'A. P. J. Abdul Kalam was born in 1931 in Rameswaram, where his father owned boats.'),
        ex('Which order should these come in: achievements, early life, message, struggles?', ['A sketch follows the life from start to finish, then reflects.', 'Early life → struggles → achievements → message.'], 'Early life, struggles, achievements, message.'),
      ],
      practice: [
        orderT('parts', ['A life story begins at the beginning.', 'The message comes last.'], [
          ['Arrange the parts of a biographical sketch in the right order.', ['Title with the person\'s name', 'Who the person is and why they are famous', 'Birth, family and childhood', 'Struggles and turning point', 'Achievements and honours', 'Qualities and message'], 'Introduce, then follow the life in time order, then reflect.'],
          ['Arrange these sentences from a sketch of P. V. Sindhu.', ['P. V. Sindhu is one of India\'s finest badminton players.', 'She was born in Hyderabad in 1995.', 'She trained for long hours under coach Pullela Gopichand.', 'She won an Olympic silver medal in 2016 and a bronze in 2021.', 'Her journey teaches us the value of discipline.'], 'Introduction → birth → training → achievements → message.'],
        ]),
        mcq('features', 'Think of how a biography is narrated.', [
          ['A biographical sketch is usually written in…', 'the third person (he/she)', ['the first person (I/we)', 'the second person (you)', 'the future tense'], 'It is about someone else\'s life.', 'A biography tells another person\'s story, so it uses he/she/they.', [['the first person (I/we)', 'First person is used in an autobiography or diary — not a biographical sketch.']]],
          ['Which tense is mostly used for events in a person\'s life?', 'Simple past', ['Simple future', 'Present continuous', 'Future perfect'], 'The events have already happened.', 'Completed life events are told in the simple past: was born, studied, won.'],
          ['Which sentence is the best conclusion for a biographical sketch?', 'Her life shows that courage can turn a tragedy into a triumph.', ['She was born in 1988.', 'Then she went to school.', 'She has two brothers.'], 'A conclusion reflects on the life.', 'A conclusion sums up qualities and a message; the others are details for the middle.'],
          ['Which detail belongs in the "early life" part?', 'She grew up in a small town near the river.', ['She received the Padma Shri.', 'Her life teaches us never to give up.', 'She founded a sports academy.'], 'Early life = childhood.', 'Growing up belongs to early life; awards and founding belong later.'],
          ['What is the best way to use given notes?', 'Expand them into connected full sentences', ['Copy them as a list', 'Use only the dates', 'Add made-up facts to make it longer'], 'Notes are short; a sketch is a paragraph.', 'Turn notes into full, linked sentences without inventing facts.'],
        ]),
        matchT('discourse', 'text type with its main purpose', [
          ['Biographical sketch', 'Tells the important events of another person\'s life'],
          ['Autobiography', 'A person writes the story of his or her own life'],
          ['Diary entry', 'Records one\'s own personal experiences and feelings of a day'],
          ['Notice', 'Gives brief public information about an event'],
          ['News report', 'Tells the facts of a recent event for readers'],
          ['Formal letter', 'Communicates officially with an organisation or officer'],
        ], ['Think about who writes it and for whom.', 'Auto- means self.']),
      ],
    },
  ],
};

// =====================================================================================
// Unit 2 — Wit and Humour
// =====================================================================================
const u2: USpec = {
  id: 'ts10.en.u2', subject: 'english', title: 'Unit 2 — Wit and Humour', source: src(2),
  objectives: [
    {
      id: 'ts10.en.dear-departed.read', title: 'The Dear Departed: comedy that laughs at greed', prereqs: [],
      intro: [
        h('A play that makes us laugh — and think'),
        photo('🎩', 'A comic play from early 20th-century England, about a family that is in a hurry to divide an old man\'s belongings.'),
        p('The Dear Departed is a one-act comedy by the English playwright Stanley Houghton (1881–1913). It was first staged in 1908. In the textbook it is given in two parts (A and B). The play is a satire: it uses humour to criticise selfishness and greed in families.'),
        def('Satire', 'Writing that uses humour, irony and exaggeration to expose foolish or bad behaviour.'),
        def('One-act play', 'A short play that takes place in one act, usually in one setting, with few characters.'),
        h('Characters'),
        keys(
          'Abel Merryweather — the old grandfather, believed to be dead; actually clever and humorous.',
          'Mrs Amelia Slater — his daughter; bossy, quick-thinking and greedy.',
          'Henry Slater — her husband; meek and obedient to his wife.',
          'Victoria Slater — their ten-year-old daughter; innocent and honest.',
          'Mrs Elizabeth Jordan — Abel\'s other daughter; jealous and money-minded.',
          'Ben Jordan — her husband; pompous and self-important.',
        ),
        h('Story in brief (our summary)'),
        p('The Slaters believe Grandfather Abel has died in his sleep upstairs. Before Amelia\'s sister and her husband, the Jordans, arrive, Amelia hurries to move his good things — a bureau (a writing desk) and a clock — down into her own rooms, and she makes Henry wear the old man\'s new slippers. When the Jordans come, the two sisters pretend to mourn but soon start quarrelling over his belongings and over who looked after him better.'),
        p('Then, to everyone\'s shock, Abel walks downstairs — he was only in a deep sleep. He soon understands what his daughters were doing. Calmly and with sharp humour, he tells them he will change his will, that he is going to marry a widow, Mrs John Shorrocks, who treats him kindly, and that he will leave both daughters. The greedy plans of both families fall apart.'),
        def('Irony', 'When the result is the opposite of what is expected. The "dead" man ends up deciding everyone\'s future.'),
        keys('Theme: greed and lack of love for the aged; hypocrisy of mourning.', 'Humour from situation (the dead man returns) and character (Henry in the slippers).', 'Message: elders deserve love and respect, not to be seen as property.'),
        remember('Abel is not cruel; he is hurt and wise. His decision is a fitting answer to his daughters\' selfishness.'),
      ],
      examples: [
        ex('Why is the play called "The Dear Departed"?', ['"The departed" is a polite phrase for a dead person; "dear" suggests he was loved.', 'But the daughters only care about his things — he was not truly dear to them.', 'Also, he has not departed (died) at all! The title is ironic.'], 'The title is ironic: the "dear departed" was neither dear to his daughters nor actually dead.'),
        ex('Which character is the most honest? Give a reason.', ['Victoria is a child who notices and speaks plainly.', 'She is uncomfortable with her mother\'s plan.'], 'Victoria — as an innocent child she sees and speaks the truth more plainly than the adults.'),
      ],
      practice: [
        mcq('understand', 'Go back to the summary and the character list.', [
          ['What is the main target of the satire in The Dear Departed?', 'Greed and selfishness in families', ['Poor medical care', 'Bad weather in England', 'The education system'], 'Who is laughed at — and why?', 'The play mocks children who care more for an old man\'s property than for him.'],
          ['Why does Amelia move the bureau before the Jordans arrive?', 'She wants to keep it for herself before it is shared', ['She wants to repair it', 'Abel had asked her to sell it', 'It was blocking the door'], 'Think of her character.', 'Greedy and quick-thinking, she grabs the valuable bureau before her sister can claim it.'],
          ['What is the biggest surprise in the play?', 'Abel, believed dead, comes downstairs alive', ['The Jordans refuse to come', 'Victoria runs away from home', 'Henry becomes the boss of the house'], 'It is the turning point of the plot.', 'The "dead" grandfather walking in changes everything — the comic climax.'],
          ['What does Abel decide to do at the end?', 'Change his will, marry Mrs Shorrocks and leave both daughters', ['Divide his things equally between the daughters', 'Live with the Jordans', 'Give the bureau to Victoria only'], 'He punishes both families\' greed.', 'He plans a new life with someone who treats him kindly and changes his will.'],
          ['Which word best describes Henry Slater?', 'Meek', ['Bossy', 'Cunning', 'Violent'], 'Who gives orders in the Slater house?', 'Henry quietly obeys Amelia — he is meek (henpecked).', [['Bossy', 'Bossy describes Amelia, not Henry.']]],
          ['The play is mainly a…', 'satirical comedy', ['tragedy', 'detective thriller', 'historical epic'], 'It is funny but has a serious point.', 'It uses humour to criticise behaviour — a satirical comedy.'],
        ]),
        matchT('chars', 'character with the trait that fits best', [
          ['Amelia Slater', 'Bossy and scheming'], ['Henry Slater', 'Meek and obedient'], ['Victoria', 'Innocent and honest'], ['Elizabeth Jordan', 'Jealous and money-minded'], ['Ben Jordan', 'Pompous and self-important'], ['Abel Merryweather', 'Witty and wise'],
        ], ['Recall what each person does in the play.', 'The child and the grandfather are the most sympathetic.']),
        orderT('plot', ['The Slaters act before the Jordans arrive.', 'Abel\'s announcement is the end.'], [
          ['Put the events of The Dear Departed in order.', ['The Slaters think Grandfather has died', 'Amelia brings the bureau down to her room', 'The Jordans arrive and the sisters quarrel', 'Abel comes downstairs alive', 'Abel announces his marriage and new will'], 'Belief in death → greedy action → quarrel → surprise → decision.'],
        ]),
      ],
    },
    {
      id: 'ts10.en.brave-potter.read', title: 'The Brave Potter: a folk tale of accidental heroism', prereqs: [],
      intro: [
        h('A hero by accident'),
        photo('🐯', 'In this folk tale, a timid potter mistakes a tiger for his donkey — with surprising results.'),
        p('The Brave Potter is an Indian folk tale retold in the textbook. Folk tales were passed on by word of mouth for generations; they are simple, funny and often teach a lesson.'),
        h('Story in brief (our summary)'),
        p('A poor potter is terribly afraid of a tiger that has been troubling the village. One stormy night his donkey goes missing. Searching in the dark rain, he finds an animal sheltering near his house, thinks it is his donkey, scolds and beats it, ties it up and goes to bed. In the morning the villagers see that the "donkey" is a tiger!'),
        p('News spreads that the potter caught a tiger with his bare hands. The king rewards him and makes him a commander in the army. When an enemy army attacks, the potter must lead. He cannot ride, so he is tied onto a big horse. The horse bolts towards the enemy; the potter grabs a tree to stop himself and pulls it out of the ground. Seeing a warrior charging with a whole tree as a weapon, the enemy soldiers panic and flee. The "brave potter" is celebrated again.'),
        def('Folk tale', 'A traditional story passed down orally among ordinary people, often with simple characters and humour.'),
        def('Situational humour', 'Comedy that comes from funny situations and mistakes rather than from jokes.'),
        keys('Humour: fear and luck are mistaken for bravery.', 'Satire: people (and kings) judge by reputation, not by facts.', 'Possible lessons: luck plays a role in life; appearances can deceive; rumours grow as they spread.'),
        remember('The potter is not actually brave — every "brave" act is an accident. That gap between reality and reputation is the joke.'),
      ],
      examples: [
        ex('Why is the title "The Brave Potter" humorous?', ['The potter is actually very timid.', 'He becomes famous for bravery only through mistakes and luck.', 'So calling him "brave" is ironic.'], 'It is ironic: the potter is a coward whose "brave" deeds are accidents.'),
        ex('How did the potter catch the tiger?', ['It was a dark, rainy night.', 'He was looking for his donkey.', 'He mistook the tiger for the donkey, beat it and tied it up.'], 'By mistake — he thought the tiger in the dark was his lost donkey.'),
      ],
      practice: [
        mcq('understand', 'Recall the summary step by step.', [
          ['Why was the potter out on the stormy night?', 'He was looking for his missing donkey', ['He was hunting the tiger', 'He was going to the king', 'He was selling pots'], 'Something of his was missing.', 'His donkey had gone missing, so he went searching.'],
          ['What made the enemy army run away?', 'They saw the potter charging with an uprooted tree', ['The king paid them to leave', 'It started raining heavily', 'The potter\'s pots fell on them'], 'Think about what happened on the runaway horse.', 'A rider charging with a whole tree looked like a mighty warrior, so they fled.'],
          ['What does the story suggest about reputation?', 'It can be built on luck and rumour rather than real ability', ['It always matches a person\'s true qualities', 'It can only be earned through war', 'It is never important'], 'Was the potter really brave?', 'The potter\'s fame grew from accidents, showing how reputation can mislead.'],
          ['Which feeling best describes the potter at the start?', 'Fear', ['Pride', 'Anger at the king', 'Boredom'], 'What was the village worried about?', 'He was terribly afraid of the tiger.'],
          ['The Brave Potter is best described as a…', 'humorous folk tale', ['scientific article', 'biographical sketch', 'formal letter'], 'Passed on by word of mouth; funny.', 'It is a traditional, comic story — a humorous folk tale.'],
        ]),
        orderT('plot', ['Night comes first; the battle comes last.'], [
          ['Put the events of The Brave Potter in order.', ['The potter\'s donkey goes missing on a stormy night', 'He ties up a tiger, thinking it is his donkey', 'The villagers discover the tiger in the morning', 'The king makes him a commander', 'He uproots a tree on a runaway horse and the enemy flees'], 'Each event leads to the next: mistake → fame → reward → new "brave" act.'],
          ['Arrange these story elements of a folk tale in a sensible order.', ['Introduce the ordinary hero and his problem', 'A funny mistake happens', 'People misunderstand the mistake', 'The hero is rewarded and tested again', 'Luck saves him a second time'], 'Problem → mistake → misunderstanding → test → happy ending.'],
        ]),
        tapT('lessons', 'Tap ALL the lessons or ideas that the story supports.', [
          ['Appearances and reputations can be misleading', true], ['Luck sometimes plays a big role in success', true], ['Rumours grow as they spread', true], ['Tigers are friendly animals', false], ['Only kings can be brave', false], ['Pottery is the best job', false],
        ], ['Test each statement against the story.', 'Ideas that the potter\'s adventures illustrate are correct.'], 'The story shows misleading reputation, the role of luck, and how stories grow — not facts about tigers or jobs.'),
      ],
    },
    {
      id: 'ts10.en.compound-adj.idioms', title: 'Word power: compound adjectives and idioms', prereqs: [],
      intro: [
        h('Two words working as one'),
        p('A compound adjective is made of two (or more) words, usually joined by a hyphen, that together describe a noun: a ten-year-old girl, a kind-hearted man, a well-known play.'),
        def('Compound adjective', 'An adjective made of two or more words, hyphenated when it comes before a noun.'),
        keys(
          'number + noun: a two-hour play, a five-rupee coin (noun stays SINGULAR)',
          'adjective + noun-ed: kind-hearted, short-tempered, broad-minded',
          'noun + past participle: hand-made, sun-dried, home-made',
          'adverb/adjective + -ing: good-looking, long-lasting, fast-moving',
          'well/ill + past participle: well-known, ill-treated',
        ),
        stepsB('Find the phrase that describes the noun: "a play that lasts two hours".', 'Take the key words: two + hour.', 'Make the noun singular and join with a hyphen: two-hour.', 'Put it before the noun: "a two-hour play".'),
        remember('✗ "a ten-years-old boy" ✓ "a ten-year-old boy" — but "The boy is ten years old." (no hyphens after the noun).'),
        h('Idioms'),
        def('Idiom', 'A group of words whose meaning is different from the meanings of the separate words. "Kick the bucket" means "to die", not to kick anything!'),
        p('Comic plays like The Dear Departed are full of idiomatic, everyday speech. Learn idioms as whole units.'),
        keys('a bolt from the blue — a complete surprise', 'let the cat out of the bag — reveal a secret by mistake', 'at loggerheads — quarrelling strongly', 'add fuel to the fire — make a bad situation worse', 'a blessing in disguise — something that seems bad but turns out good', 'turn a deaf ear — refuse to listen'),
      ],
      examples: [
        ex('Rewrite with a compound adjective: "a journey that takes three days".', ['Key words: three + day.', 'Singular noun, hyphenated.', 'Place before the noun.'], 'a three-day journey'),
        ex('Use an idiom: "Abel walking downstairs alive was a complete surprise to the family."', ['A sudden, total surprise = a bolt from the blue.'], 'Abel walking downstairs alive was a bolt from the blue for the family.'),
      ],
      practice: [
        mcq('compound', 'Number compounds take a singular noun; hyphens join the words.', [
          ['Choose the correct form: Victoria is a ___ girl.', 'ten-year-old', ['ten-years-old', 'ten year olds', 'ten-years old'], 'Number + singular noun + old, all hyphenated.', 'Before a noun, the compound is singular and hyphenated: a ten-year-old girl.', [['ten-years-old', 'In a compound adjective, the noun stays singular: year, not years.']]],
          ['Choose the correct form: We watched a ___ play.', 'one-act', ['one-acts', 'one acted', 'one-acting'], 'number + noun', 'one + act, hyphenated: a one-act play.'],
          ['"A man with a kind heart" is a ___ man.', 'kind-hearted', ['kind-heart', 'heart-kind', 'kindly-heart'], 'adjective + noun + -ed', 'kind + heart + ed → kind-hearted.'],
          ['"Pickles made at home" are ___ pickles.', 'home-made', ['made-home', 'home-making', 'homes-made'], 'noun + past participle', 'home + made → home-made pickles.'],
          ['"A note worth five hundred rupees" is a ___ note.', 'five-hundred-rupee', ['five-hundred-rupees', 'five hundred rupees', 'rupee-five-hundred'], 'Singular noun in a number compound.', 'All words hyphenated, and "rupee" stays singular.'],
          ['"A writer whom many people know" is a ___ writer.', 'well-known', ['known-well', 'well-knowing', 'good-known'], 'well + past participle', 'well + known → well-known.'],
        ]),
        matchT('idioms', 'idiom with its meaning', [
          ['a bolt from the blue', 'a complete surprise'], ['let the cat out of the bag', 'reveal a secret by mistake'], ['at loggerheads', 'quarrelling strongly'], ['add fuel to the fire', 'make a bad situation worse'], ['a blessing in disguise', 'something that seems bad but turns out good'], ['turn a deaf ear', 'refuse to listen'], ['kick the bucket', 'die (informal)'],
        ], ['Idioms do not mean what the words literally say.', 'Picture the situation each idiom describes.']),
        mcq('idiom-use', 'Choose the idiom whose meaning fits the situation.', [
          ['The sisters ___ over the bureau. (were quarrelling)', 'were at loggerheads', ['let the cat out of the bag', 'were a blessing in disguise', 'kicked the bucket'], 'Quarrelling strongly.', '"At loggerheads" means in strong disagreement.'],
          ['Little Anu ___ when she told Grandma about the surprise party. (revealed the secret)', 'let the cat out of the bag', ['turned a deaf ear', 'added fuel to the fire', 'was at loggerheads'], 'Revealing a secret by mistake.', '"Let the cat out of the bag" = give away a secret.'],
          ['Missing the bus was ___ — I met my old teacher at the stop.', 'a blessing in disguise', ['a bolt from the blue', 'at loggerheads', 'adding fuel to the fire'], 'Bad at first, good in the end.', 'Something unlucky that turns out well is a blessing in disguise.'],
          ['When the neighbour shouted back angrily, it only ___ .', 'added fuel to the fire', ['let the cat out of the bag', 'was a blessing in disguise', 'turned a deaf ear'], 'It made the quarrel worse.', 'To add fuel to the fire is to make a bad situation worse.'],
          ['The news of the transfer came as ___ — nobody expected it.', 'a bolt from the blue', ['a blessing in disguise', 'at loggerheads', 'a deaf ear'], 'Nobody expected it.', 'A sudden surprise is a bolt from the blue.'],
        ], 2),
      ],
    },
    {
      id: 'ts10.en.enough.preps', title: 'Using "enough", "too…to" and phrasal prepositions', prereqs: [],
      intro: [
        h('Is it enough?'),
        p('"Enough" means "as much as needed". Its position depends on the word it goes with.'),
        keys(
          'adjective / adverb + enough: old enough, tall enough, fast enough',
          'enough + noun: enough money, enough chairs, enough time',
          '… enough + to-infinitive: "She is old enough to vote."',
          '… enough + for + someone: "The hall is big enough for all of us."',
        ),
        def('too … to', 'Means "more than is acceptable, so something cannot happen": "He is too weak to walk." It has a negative meaning.'),
        stepsB(
          'Transform "too … to" into "not … enough to".',
          'Take the adjective after "too" and find its opposite: weak → strong.',
          'Write: subject + is/are + not + opposite + enough + to-infinitive.',
          '"He is too weak to walk." → "He is not strong enough to walk."',
        ),
        remember('✗ "enough old" ✓ "old enough". ✗ "money enough" (old-fashioned) ✓ "enough money".'),
        h('Phrasal prepositions'),
        def('Phrasal preposition', 'A group of words that works like a single preposition: in spite of, because of, instead of, according to, in front of, on account of, by means of, in addition to.'),
        keys('in spite of / despite — showing contrast: "In spite of the rain, the match went on."', 'because of / on account of — showing reason: "The school was closed on account of the festival."', 'instead of — in place of: "Henry wore the new slippers instead of his old ones."', 'according to — as stated by: "According to the forecast, it will rain."'),
        remember('"In spite of" is three words and is followed by a noun or -ing form: ✗ "in spite of it was raining" ✓ "in spite of the rain" / "in spite of its raining" — or use "although it was raining".'),
      ],
      examples: [
        ex('Rewrite using "enough": "The box is too heavy for me to lift."', ['too heavy → not light enough', 'Keep the rest: for me to lift.'], 'The box is not light enough for me to lift.'),
        ex('Join with a phrasal preposition: "It was raining. The Bathukamma celebrations continued."', ['The idea is contrast.', 'Use "in spite of" + noun.'], 'In spite of the rain, the Bathukamma celebrations continued.'),
      ],
      practice: [
        mcq('enough', '"Enough" goes AFTER adjectives/adverbs and BEFORE nouns.', [
          ['Choose the correct sentence.', 'She is old enough to get a driving licence.', ['She is enough old to get a driving licence.', 'She is old to enough get a driving licence.', 'She enough is old to get a driving licence.'], 'Adjective + enough.', '"Enough" follows the adjective: old enough.'],
          ['Choose the correct sentence.', 'We do not have enough chairs for the guests.', ['We do not have chairs enough for the guests.', 'We do not enough have chairs for the guests.', 'We do not have chairs for enough the guests.'], 'Enough + noun.', 'Before a noun: enough chairs.'],
          ['"He ran fast. He caught the bus." Combine using "enough".', 'He ran fast enough to catch the bus.', ['He ran enough fast to catch the bus.', 'He ran too fast to catch the bus.', 'He ran fast enough catching the bus.'], 'adverb + enough + to-infinitive', 'fast enough + to catch.', [['He ran too fast to catch the bus.', '"too … to" gives the opposite meaning — that he could NOT catch it.']]],
          ['Choose the sentence that means the same as "The tea is too hot to drink."', 'The tea is not cool enough to drink.', ['The tea is hot enough to drink.', 'The tea is too cool to drink.', 'The tea is enough hot to drink.'], 'too hot → not cool enough', 'The opposite adjective with "not … enough" keeps the meaning.'],
          ['The water is ___ for swimming.', 'warm enough', ['enough warm', 'too warm enough', 'warmly enough'], 'Adjective first.', 'warm + enough.'],
        ]),
        typed('too-enough', 'Use the opposite adjective with "not … enough".', [
          ['Fill the blank with ONE adjective: "He is too short to reach the shelf." = "He is not ___ enough to reach the shelf."', ['tall'], 'Opposite of short (for height).', 'too short → not tall enough.'],
          ['Fill the blank with ONE adjective: "The bag is too heavy to carry." = "The bag is not ___ enough to carry."', ['light'], 'Opposite of heavy.', 'too heavy → not light enough.'],
          ['Fill the blank with ONE adjective: "Ravi is too young to vote." = "Ravi is not ___ enough to vote."', ['old'], 'Opposite of young.', 'too young → not old enough.'],
          ['Fill the blank with ONE adjective: "The road is too narrow for buses." = "The road is not ___ enough for buses."', ['wide', 'broad'], 'Opposite of narrow.', 'too narrow → not wide (broad) enough.'],
          ['Fill the blank with ONE adjective: "The room is too dark to read in." = "The room is not ___ enough to read in."', ['bright', 'light'], 'Opposite of dark.', 'too dark → not bright enough.'],
        ]),
        mcq('phrasal-prep', 'Decide the relationship: contrast, reason, replacement or source?', [
          ['___ the good rains, the farmers expect a rich harvest.', 'Because of', ['Instead of', 'In front of', 'In spite of'], 'Good rains lead to a good harvest — reason, not contrast.', 'The rain is the REASON for the rich harvest → because of.', [['In spite of', '"In spite of" shows contrast; but good rain is a reason for a rich harvest.']]],
          ['___ the heavy traffic, we reached the station on time.', 'In spite of', ['Because of', 'According to', 'Instead of'], 'Traffic normally makes you late.', 'Reaching on time despite traffic is a contrast → in spite of.'],
          ['He drank buttermilk ___ a cold drink.', 'instead of', ['in spite of', 'because of', 'according to'], 'One thing replaces another.', '"Instead of" = in place of.'],
          ['___ the weather report, it will rain tomorrow.', 'According to', ['Instead of', 'In spite of', 'In front of'], 'Who says so?', '"According to" gives the source of information.'],
          ['The match was cancelled ___ bad light.', 'on account of', ['instead of', 'in spite of', 'in front of'], 'Reason.', '"On account of" = because of.'],
          ['The children stood ___ the school gate for the photo.', 'in front of', ['on account of', 'instead of', 'according to'], 'Position.', '"In front of" shows place.'],
        ]),
      ],
    },
    {
      id: 'ts10.en.tense.past-perfect-present', title: 'Simple past vs present perfect', prereqs: [],
      intro: [
        h('Finished time or connected to now?'),
        p('Both tenses talk about the past, but they look at it differently. The simple past places an action at a FINISHED time. The present perfect connects a past action with NOW.'),
        def('Simple past (V2)', 'Completed action at a definite past time: "Abel woke up yesterday." Signal words: yesterday, ago, last week, in 2010, when I was young.'),
        def('Present perfect (has/have + V3)', 'Past action with a result or link to the present, or an experience, with no definite time: "Abel has changed his will." Signal words: just, already, yet, ever, never, so far, since, for, recently.'),
        stepsB(
          'Look for a time expression.',
          'A finished time (yesterday, ago, in 2015, last year) → simple past.',
          'No time, or an unfinished period (today, this week, since 2020, for two years, ever, yet) → present perfect.',
          'Check the verb form: simple past = V2 (went); present perfect = has/have + V3 (has gone).',
        ),
        remember('✗ "I have seen him yesterday." ✓ "I saw him yesterday." Never use the present perfect with a finished-time word like yesterday or ago.'),
        remember('"since" + point of time (since 2019, since Monday); "for" + length of time (for three years, for two hours).'),
        tip('Ask: "Is the time over?" Yes → past. Not mentioned or still going → present perfect.'),
      ],
      examples: [
        ex('Correct the sentence: "Meena has visited Bhadrachalam last year."', ['Time word: last year → finished time.', 'Finished time needs the simple past.', 'has visited → visited'], 'Meena visited Bhadrachalam last year.'),
        ex('Choose: "I (lived / have lived) in Khammam since 2018."', ['"since 2018" → the period started in the past and continues now.', 'Continuing up to now → present perfect.'], 'I have lived in Khammam since 2018.'),
      ],
      practice: [
        mcq('choose', 'Find the time expression first.', [
          ['We ___ the Golconda Fort two years ago.', 'visited', ['have visited', 'has visited', 'have been visiting'], '"ago" means a finished time.', '"…ago" always takes the simple past.', [['have visited', 'The present perfect cannot be used with "ago".']]],
          ['Kavya ___ her homework already.', 'has finished', ['finish', 'have finished', 'finishing'], '"already" is a present perfect word; Kavya is singular.', 'already → present perfect; singular subject → has.'],
          ['I ___ a tiger in the wild.', 'have never seen', ['had never see', 'have never saw', 'never seen'], 'Life experience, no time mentioned.', 'Experience → have + never + V3 (seen).', [['have never saw', 'After "have", use the past participle (seen), not the past form (saw).']]],
          ['The Slaters ___ the bureau down last night.', 'brought', ['have brought', 'has brought', 'bring'], '"last night" is finished time.', 'Finished time → simple past.'],
          ['Arjun ___ in this school for five years.', 'has studied', ['studies', 'is study', 'have studied'], 'Period continuing up to now; Arjun = he.', '"for five years" up to now → present perfect: has studied.'],
          ['When ___ you ___ the news?', 'did … hear', ['have … heard', 'has … heard', 'do … heard'], '"When" asks for a definite time.', 'Questions with "when" take the simple past.', [['have … heard', '"When" asks about a specific time, so use the simple past.']]],
        ]),
        typed('since-for', 'since + point in time; for + length of time.', [
          ['Fill in "since" or "for": She has lived here ___ 2015.', ['since'], '2015 is a point in time.', 'Point in time → since.'],
          ['Fill in "since" or "for": We have waited ___ two hours.', ['for'], 'two hours is a length of time.', 'Length of time → for.'],
          ['Fill in "since" or "for": He has not eaten ___ morning.', ['since'], 'Morning is a starting point.', 'Starting point → since.'],
          ['Fill in "since" or "for": They have known each other ___ ten years.', ['for'], 'Ten years is a duration.', 'Duration → for.'],
          ['Fill in "since" or "for": It has rained ___ Monday.', ['since'], 'Monday is a point in time.', 'Point in time → since.'],
        ], 1),
        mcq('spot', 'Check each verb against its time word.', [
          ['Which sentence is correct?', 'I saw that film last Sunday.', ['I have seen that film last Sunday.', 'I have saw that film last Sunday.', 'I seen that film last Sunday.'], '"last Sunday" is finished.', 'Finished time → simple past "saw".'],
          ['Which sentence is correct?', 'Have you ever been to Hampi?', ['Did you ever been to Hampi?', 'Have you ever went to Hampi?', 'Has you ever been to Hampi?'], 'Experience question with "ever".', 'Have + you + ever + V3 (been).'],
          ['Which sentence is correct?', 'The guests have just arrived.', ['The guests have just arrive.', 'The guests just have arrived yesterday.', 'The guests has just arrived.'], '"just" → present perfect; plural subject.', 'Plural "guests" → have + V3 arrived.'],
          ['Which sentence is correct?', 'My uncle bought a tractor in 2020.', ['My uncle has bought a tractor in 2020.', 'My uncle have bought a tractor in 2020.', 'My uncle buyed a tractor in 2020.'], '"in 2020" is a finished time.', 'Definite past year → simple past "bought".'],
        ], 2),
      ],
    },
    {
      id: 'ts10.en.u2edit.errors', title: 'Editing: find and fix the error', prereqs: [],
      intro: [
        h('Be your own proof-reader'),
        p('In the exam, "editing" asks you to find mistakes in a short passage and correct them. Most errors fall into a few families. Check each sentence for them one by one.'),
        keys(
          'Subject–verb agreement: "The children plays" → "The children play".',
          'Tense: "Yesterday he goes" → "Yesterday he went".',
          'Articles: "a honest man" → "an honest man"; "the Sun", "a university".',
          'Prepositions: "discuss about" → "discuss"; "married with" → "married to".',
          'Word form: "He is very success" → "He is very successful".',
          'Spelling and capital letters: "hyderabad" → "Hyderabad".',
        ),
        stepsB(
          'Read the whole sentence once for meaning.',
          'Find the subject and verb; check they agree and the tense matches any time word.',
          'Check articles and prepositions.',
          'Check word forms (noun / adjective / adverb) and spelling.',
          'Rewrite the corrected word or phrase.',
        ),
        def('Article "an"', 'Used before a vowel SOUND, not just a vowel letter: an hour (h is silent), a university (sounds like "you"), an MLA (sounds like "em").'),
        remember('Some verbs take no preposition: discuss (not discuss about), enter (not enter into a room), reach (not reach to), resemble (not resemble to).'),
      ],
      examples: [
        ex('Correct: "Abel have two daughters who quarrels a lot."', ['Abel = he → has.', '"who" refers to daughters (plural) → quarrel.'], 'Abel has two daughters who quarrel a lot.'),
        ex('Correct: "We discussed about the play in a hour."', ['discuss takes no preposition → discussed the play.', '"hour" starts with a vowel sound → an hour.'], 'We discussed the play in an hour.'),
      ],
      practice: [
        mcq('fix', 'Check agreement, tense, article, preposition and word form.', [
          ['Choose the correct version: "She don\'t like comedies."', 'She doesn\'t like comedies.', ['She don\'t likes comedies.', 'She doesn\'t likes comedies.', 'She not like comedies.'], 'He/she/it takes "does".', 'Singular third person → doesn\'t + base verb (like).'],
          ['Choose the correct version: "He is a honest man."', 'He is an honest man.', ['He is the honest man always.', 'He is honest a man.', 'He is a honestly man.'], 'Listen to the first sound of "honest".', 'The h is silent, so "honest" begins with a vowel sound → an.'],
          ['Choose the correct version: "They reached to the village at noon."', 'They reached the village at noon.', ['They reached at the village at noon.', 'They reach to the village at noon.', 'They reaching the village at noon.'], 'Does "reach" need a preposition?', '"Reach" is followed directly by its object.'],
          ['Choose the correct version: "Yesterday my father buys a new bureau."', 'Yesterday my father bought a new bureau.', ['Yesterday my father buyed a new bureau.', 'Yesterday my father has bought a new bureau.', 'Yesterday my father buy a new bureau.'], '"Yesterday" = finished time.', 'Simple past of buy = bought.'],
          ['Choose the correct version: "The play was very success."', 'The play was very successful.', ['The play was very succeed.', 'The play was very successfully.', 'The play was very succession.'], 'After "very" we need an adjective.', 'success (noun) → successful (adjective).'],
          ['Choose the correct version: "Each of the boys have a bicycle."', 'Each of the boys has a bicycle.', ['Each of the boys having a bicycle.', 'Each of the boy have a bicycle.', 'Each of the boys are having a bicycle.'], 'The subject is "each", not "boys".', '"Each" is singular → has.'],
        ]),
        typed('word', 'Type only the corrected word.', [
          ['Type the correct word for the underlined error: "The children PLAYS in the park every evening."', ['play'], 'The subject is plural.', 'Plural "children" → play.'],
          ['Type the word that should replace AN: "She is AN university student."', ['a'], 'Listen to the first sound of "university".', '"University" begins with a "you" (consonant) sound, so it takes "a".', [['an', '"University" starts with a consonant "y" sound, so it takes "a".']]],
          ['Type the correct word: "He is MARRIED WITH my cousin." (replace "with")', ['to'], 'Which preposition follows "married"?', 'married to someone.'],
          ['Type the correct word: "I HAVE MET him yesterday." (one word replaces "have met")', ['met'], 'yesterday = finished time.', 'Finished time → simple past "met".'],
          ['Type the correct word: "She sings very SWEET."', ['sweetly'], 'Which word describes a verb?', 'An adverb describes how she sings → sweetly.'],
        ]),
        orderT('sentence', ['Find the subject first.', 'Adjectives come before nouns.'], [
          ['Put the words in order to make a correct sentence.', ['The old man', 'surprised', 'his greedy daughters', 'by walking downstairs.'], 'Subject + verb + object + how.'],
          ['Put the words in order to make a correct sentence.', ['The potter', 'tied', 'the tiger', 'to a post', 'by mistake.'], 'Subject + verb + object + place + manner.'],
          ['Put the words in order to make a correct sentence.', ['Have you', 'ever read', 'a one-act play', 'in English?'], 'Question: Have + subject + V3 + object + rest.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Unit 3 — Human Relations
// =====================================================================================
const u3: USpec = {
  id: 'ts10.en.u3', subject: 'english', title: 'Unit 3 — Human Relations', source: src(3),
  note: 'Reading A (The Journey) is treated at theme level only; teachers should add plot details from the textbook. The summary of Reading B (Another Woman) is deliberately general.',
  objectives: [
    {
      id: 'ts10.en.never-nest.read', title: 'The Never-Never Nest: living on instalments', prereqs: [],
      intro: [
        h('Buy now, pay… never?'),
        photo('🏠', 'A young couple\'s beautiful home — but how much of it really belongs to them?'),
        p('The Never-Never Nest is a one-act comic play by Cedric Mount. "On the never-never" is old British slang for buying on hire purchase — taking something home now and paying for it in small monthly instalments, often for years.'),
        def('Instalment', 'One of many small regular payments made to pay for something over time.'),
        def('Hire purchase', 'A system of buying where you use the item while paying instalments; it is not fully yours until the last payment.'),
        h('Characters'),
        keys('Jack and Jill — a young married couple who love comfort and buy everything on instalments.', 'Aunt Jane — Jack\'s practical, old-fashioned aunt who visits them.', 'Nurse — looks after the couple\'s new baby.'),
        h('Story in brief (our summary)'),
        p('Aunt Jane visits Jack and Jill and admires their smart house, furniture and car. Bit by bit she discovers that hardly anything is paid for: they have paid only a few instalments on almost everything, and new bills keep arriving. Jack and Jill think this is perfectly normal; Aunt Jane is shocked that they live so far beyond their income. Kindly, she gives them a cheque to clear one of their debts. The comic twist comes at the end, when Jill decides to use the money to pay the last instalment of the doctor\'s bill for their baby — so that the baby will, as she jokes, really be "theirs".'),
        keys('Theme: the dangers of consumerism and living on credit.', 'Contrast: Aunt Jane\'s thrift vs the couple\'s extravagance.', 'Humour: the absurd idea that even a baby is "on instalments".', 'Message: live within your means; debt is not ownership.'),
        remember('The play is a satire, not a lecture. Its humour comes from Jack and Jill\'s cheerful blindness to their problem.'),
        tip('Connect to today: EMIs, "buy now, pay later" apps and credit cards. When is borrowing sensible, and when is it dangerous?'),
      ],
      examples: [
        ex('Explain the title "The Never-Never Nest".', ['"Nest" = a home, especially a young couple\'s home.', '"Never-never" = buying on instalments.', 'Also: the couple will "never" truly own the home.'], 'It is the couple\'s home bought on the "never-never" (instalments) — a home they may never really own.'),
        ex('How is Aunt Jane different from Jack and Jill?', ['Aunt Jane values paying in full and saving.', 'Jack and Jill buy whatever they want on credit.'], 'Aunt Jane is thrifty and practical; Jack and Jill are extravagant and live beyond their means.'),
      ],
      practice: [
        mcq('understand', 'Use the summary and the meaning of "never-never".', [
          ['What does "buying on the never-never" mean?', 'Buying on instalments (hire purchase)', ['Buying with cash only', 'Never buying anything', 'Stealing goods'], 'It is British slang.', 'It means paying in small instalments over a long time.'],
          ['What shocks Aunt Jane most?', 'That almost nothing in the house is fully paid for', ['That the house is too small', 'That Jack has lost his job', 'That the baby is unwell'], 'What does she discover bit by bit?', 'She finds that they own almost nothing outright.'],
          ['What does Jill do with Aunt Jane\'s cheque?', 'Uses it to pay the last instalment of the doctor\'s bill for the baby', ['Saves it in a bank', 'Buys a new car', 'Returns it to Aunt Jane'], 'This is the comic twist.', 'She pays off the doctor so the baby is "really theirs" — the final joke.'],
          ['Which word best describes Jack and Jill\'s spending?', 'Extravagant', ['Thrifty', 'Careful', 'Miserly'], 'They buy far more than they can afford.', 'Spending beyond one\'s means is extravagant.', [['Thrifty', 'Thrifty describes Aunt Jane, not the couple.']]],
          ['What is the main message of the play?', 'Live within your means and avoid needless debt', ['Never visit relatives', 'Babies are expensive', 'Radios are useless'], 'Think about what is being laughed at.', 'The satire targets living on credit beyond one\'s income.'],
        ]),
        matchT('words', 'word from the play\'s world with its meaning', [
          ['instalment', 'one of many regular part-payments'], ['extravagant', 'spending too much money'], ['thrifty', 'careful with money'], ['debt', 'money that is owed'], ['cheque', 'written order to a bank to pay money'], ['consumerism', 'the habit of buying more and more goods'],
        ], ['These words are all about money.', 'Thrifty and extravagant are opposites.']),
        tapT('values', 'Tap ALL the habits that Aunt Jane would approve of.', [
          ['Saving part of one\'s income every month', true], ['Buying only what one can afford', true], ['Paying debts on time', true], ['Buying a car on credit just to impress friends', false], ['Taking a new loan to pay an old one', false], ['Ignoring bills until they pile up', false],
        ], ['Aunt Jane is thrifty and practical.', 'Ask: does this habit keep a family out of debt?'], 'Saving, buying within one\'s means and paying on time keep a family secure.'),
      ],
    },
    {
      id: 'ts10.en.poem.devices', title: 'Reading a poem: Another Woman and poetic devices', prereqs: [],
      intro: [
        h('How poems make meaning'),
        p('Reading B, Another Woman, is a poem by Imtiaz Dharker, a poet and artist born in Pakistan, brought up in Scotland, who has lived for many years in Mumbai. Her poems often speak about women\'s lives, identity and freedom.'),
        p('Our summary: the poem shows an ordinary woman going through her daily routine — shopping, cooking, trying to please the family she has married into — while living with fear and without any real say in her own life. The poem moves towards a tragic, violent end, and so becomes a strong protest against cruelty to women in the home, such as dowry-related violence. The title suggests that she is "another" woman — one of many whose suffering goes unnoticed.'),
        remember('This is a serious poem. Discuss it respectfully. Our Constitution guarantees equality and dignity to every woman; dowry is a crime under Indian law (Dowry Prohibition Act, 1961).'),
        h('Tools poets use'),
        def('Imagery', 'Words that create pictures (and sounds, smells, feelings) in the reader\'s mind: "the smell of wet earth after the first rain".'),
        def('Simile', 'A comparison using "like" or "as": "Her smile was like sunshine."'),
        def('Metaphor', 'A direct comparison without "like/as": "Her smile was sunshine."'),
        def('Personification', 'Giving human qualities to non-human things: "The wind whispered through the palm trees."'),
        def('Alliteration', 'Repeating the same first consonant sound: "silent, slow steps".'),
        def('Irony', 'A contrast between what is expected and what actually happens or is meant.'),
        def('Repetition / refrain', 'Repeating words or lines for emphasis.'),
        stepsB('Read the poem aloud once for the overall feeling.', 'Ask: who is speaking, about whom, and in what situation?', 'Underline images, comparisons and repeated words.', 'Name each device and explain what effect it creates.', 'Sum up the theme in one sentence.'),
        tip('In an answer, never just name a device. Say what it does: "The simile ___ makes us feel ___."'),
      ],
      examples: [
        ex('Identify the device: "The old banyan tree stretched its tired arms over the village."', ['A tree is given "tired arms" and stretches them — human qualities.'], 'Personification.'),
        ex('Turn this simile into a metaphor: "The classroom was like a beehive."', ['A metaphor drops "like/as" and says one thing IS another.'], 'The classroom was a beehive.'),
      ],
      practice: [
        mcq('device', 'Like/as → simile. Is → metaphor. Human action for a thing → personification.', [
          ['Name the device: "The stars danced in the night sky."', 'Personification', ['Simile', 'Alliteration', 'Metaphor'], 'Can stars really dance?', 'Stars are given a human action (dancing).'],
          ['Name the device: "He was as brave as a lion."', 'Simile', ['Metaphor', 'Personification', 'Irony'], 'Look for "as … as".', 'A comparison with "as" is a simile.'],
          ['Name the device: "Time is a thief."', 'Metaphor', ['Simile', 'Alliteration', 'Refrain'], 'No "like" or "as".', 'Time is directly called a thief — a metaphor.', [['Simile', 'A simile needs "like" or "as". This comparison is direct.']]],
          ['Name the device: "Peter\'s puppy played in the park."', 'Alliteration', ['Simile', 'Metaphor', 'Personification'], 'Listen to the first sounds.', 'The repeated p sound is alliteration.'],
          ['Name the device: A fire-station burns down.', 'Irony', ['Simile', 'Alliteration', 'Metaphor'], 'Expected vs what happened.', 'The place meant to fight fires being destroyed by fire is ironic.'],
          ['Name the device: "The smell of jasmine and hot jilebis filled the street."', 'Imagery', ['Irony', 'Alliteration', 'Simile'], 'Which senses are appealed to?', 'Words that create sense-pictures (smell, sight) are imagery.'],
        ]),
        mcq('poem', 'Think about the poem\'s purpose.', [
          ['Who wrote the poem Another Woman?', 'Imtiaz Dharker', ['Stanley Houghton', 'Cedric Mount', 'Gabriel Okara'], 'A poet who has lived in Mumbai.', 'Another Woman is by Imtiaz Dharker.'],
          ['What is the poem mainly protesting against?', 'Cruelty and injustice towards women at home', ['Rising vegetable prices', 'Pollution in cities', 'Cricket matches'], 'Think of the woman\'s situation.', 'It protests against violence and the lack of freedom women face at home.'],
          ['What does the title "Another Woman" suggest?', 'She is one of many women whose suffering goes unnoticed', ['She is a second wife', 'She is a famous queen', 'She is a woman from another planet'], '"Another" = one more of many.', 'The title suggests her story is repeated in many homes.'],
          ['Which value does the poem most support?', 'Equality and dignity for women', ['Obedience at any cost', 'Silence about injustice', 'Wealth above people'], 'What does a protest poem want?', 'By showing injustice, it calls for women\'s dignity and equality.'],
          ['What is the best way to write about a device in an exam answer?', 'Name it and explain the effect it creates', ['Only name it', 'Copy the whole poem', 'Count the number of lines'], 'Examiners want understanding.', 'Naming plus explaining the effect shows real understanding.'],
        ]),
        matchT('devices', 'device with its example (our own lines)', [
          ['Simile', 'Her voice was soft like a feather.'], ['Metaphor', 'The city is a jungle.'], ['Personification', 'The angry river swallowed the bridge.'], ['Alliteration', 'Busy bees buzz by the bush.'], ['Imagery', 'Golden fields swayed under a red evening sky.'], ['Repetition', 'Wait, wait, wait — the long day never ends.'],
        ], ['Look for like/as first.', 'Then look for human actions and repeated sounds.']),
      ],
    },
    {
      id: 'ts10.en.compound-words.form', title: 'Compound and hyphenated words', prereqs: [],
      intro: [
        h('Words built from words'),
        p('English often joins two words to make a new one: class + room → classroom. Some compounds are written as one word, some as two, and some with a hyphen. The title "The Never-Never Nest" itself has a hyphenated compound.'),
        keys('Closed compounds (one word): classroom, notebook, sunflower, housewife, railway', 'Open compounds (two words): bus stop, ice cream, post office, living room', 'Hyphenated compounds: mother-in-law, passer-by, well-being, self-respect, twenty-five, ex-captain'),
        def('Compound noun', 'A noun made of two or more words: toothpaste, school bag, brother-in-law.'),
        h('Rules for hyphens'),
        stepsB(
          'Numbers from 21 to 99 written in words take a hyphen: twenty-one, ninety-nine.',
          'Words with self-, ex-, all- usually take a hyphen: self-confidence, ex-soldier, all-round.',
          'Compound adjectives before a noun take a hyphen: a well-dressed man (but "The man is well dressed").',
          'Family compounds with in-law take hyphens: sister-in-law.',
        ),
        h('Plurals of compound nouns'),
        p('Make the MAIN word plural, not the last word: mother-in-law → mothers-in-law; passer-by → passers-by; commander-in-chief → commanders-in-chief. In closed compounds, add -s at the end: classrooms, toothbrushes.'),
        remember('✗ mother-in-laws ✓ mothers-in-law. ✗ passer-bys ✓ passers-by.'),
      ],
      examples: [
        ex('Make the plural of "brother-in-law".', ['Main word: brother (the person).', 'Make that word plural.'], 'brothers-in-law'),
        ex('Write 47 in words.', ['Numbers 21–99 take a hyphen between tens and units.'], 'forty-seven'),
      ],
      practice: [
        typed('plural', 'Make the main (most important) word plural.', [
          ['Write the plural of "mother-in-law".', ['mothers-in-law'], 'Which word names the person?', 'The main word "mother" becomes "mothers".', [['mother-in-laws', 'Pluralise the main word: mothers-in-law.']]],
          ['Write the plural of "passer-by".', ['passers-by'], 'Who is the person here?', 'A passer is the person; plural: passers-by.', [['passer-bys', 'The main word is "passer": passers-by.']]],
          ['Write the plural of "classroom".', ['classrooms'], 'It is one closed word.', 'Closed compound → add -s at the end.'],
          ['Write the plural of "son-in-law".', ['sons-in-law'], 'Main word: son.', 'sons-in-law.'],
          ['Write the plural of "toothbrush".', ['toothbrushes'], 'Words ending in -sh add -es.', 'toothbrush → toothbrushes.'],
          ['Write the plural of "commander-in-chief".', ['commanders-in-chief'], 'Main word: commander.', 'commanders-in-chief.'],
        ]),
        mcq('hyphen', 'Numbers 21–99, self-/ex-, in-law, and adjectives before nouns take hyphens.', [
          ['Which is written correctly?', 'twenty-five', ['twenty five-', 'twentyfive', 'twenty-fives'], 'Numbers 21–99.', 'Tens and units are joined by a hyphen.'],
          ['Which is written correctly?', 'self-confidence', ['selfconfidence', 'self confidence-', 'self-confident-ness'], 'self- words.', 'Words beginning with self- take a hyphen.'],
          ['Which is written correctly?', 'She is a well-known singer.', ['She is a wellknown singer.', 'She is a well known-singer.', 'She is well-a known singer.'], 'Compound adjective before a noun.', 'Before a noun: well-known, hyphenated.'],
          ['Which is a closed compound (one word)?', 'notebook', ['bus stop', 'mother-in-law', 'ice cream'], 'One word, no space or hyphen.', 'note + book → notebook.'],
          ['Which is an open compound (two separate words)?', 'post office', ['sunflower', 'passer-by', 'railway'], 'A space between the words.', '"Post office" is written as two words.'],
        ]),
        matchT('form', 'first part with the part that completes the compound', [
          ['sun', 'flower'], ['foot', 'ball'], ['tooth', 'paste'], ['house', 'wife'], ['rain', 'bow'], ['grand', 'mother'], ['note', 'book'],
        ], ['Say the two parts together.', 'Each makes one everyday word.']),
      ],
    },
    {
      id: 'ts10.en.tense.sequence', title: 'Sequence of tenses and the past perfect', prereqs: [],
      intro: [
        h('Keeping tenses in step'),
        p('When a sentence has a main clause and a subordinate clause, their tenses must fit together logically. This is called the sequence of tenses.'),
        def('Past perfect (had + V3)', 'Shows an action that was completed BEFORE another past action: "When Aunt Jane arrived, Jill had already gone to the shop."'),
        keys(
          'Main verb in the PRESENT/FUTURE → any tense in the subordinate clause that suits the meaning: "She says that she is / was / will be busy."',
          'Main verb in the PAST → subordinate clause usually in a PAST form: "She said that she was busy."',
          'Earlier of two past actions → past perfect: "I realised that I had left my bag on the bus."',
          'Exception — universal truths and habits stay in the present: "Our teacher said that water boils at 100 °C."',
        ),
        stepsB(
          'Find the two actions.',
          'Decide which happened first.',
          'Put the earlier action in the past perfect (had + V3).',
          'Put the later action in the simple past (V2).',
          'If the subordinate idea is a universal truth, keep it in the present.',
        ),
        remember('"After" and "before" already show order, so the simple past is often fine, but the past perfect makes the order extra clear: "After he had finished, he left."'),
        remember('✗ "He told me that he is ill." (when reporting a past situation) ✓ "He told me that he was ill."'),
        tip('Picture a timeline: ●had done ────── ●did ────── now.'),
      ],
      examples: [
        ex('Join with the correct tenses: "The train left. Then we reached the station."', ['First action: the train left.', 'Second action: we reached.', 'Earlier → past perfect: had left. Later → simple past: reached.'], 'When we reached the station, the train had left.'),
        ex('Correct: "The teacher said that the earth moved round the sun."', ['Main verb is past, but the clause is a universal truth.', 'Universal truths stay in the present.'], 'The teacher said that the earth moves round the sun.'),
      ],
      practice: [
        mcq('choose', 'Which action came first? That one takes "had + V3".', [
          ['By the time the doctor came, the patient ___ .', 'had recovered', ['recovers', 'has recovered', 'will recover'], 'Recovery happened before the doctor came.', 'Earlier past action → past perfect.'],
          ['She told me that she ___ tired.', 'was', ['is being', 'will', 'has'], 'Main verb "told" is past.', 'After a past main verb, use a past form: was.'],
          ['He said that honesty ___ the best policy.', 'is', ['was being', 'had been', 'will been'], 'Is this a universal truth?', 'Proverbs and universal truths stay in the present.', [['had been', 'Universal truths are not shifted back; keep "is".']]],
          ['I ___ the film before, so I knew the ending.', 'had seen', ['have seen', 'see', 'was seeing'], 'Seeing came before knowing (past).', 'Earlier action → had seen.'],
          ['Aunt Jane discovered that Jack ___ the car on instalments.', 'had bought', ['buys', 'has bought', 'will buy'], 'The buying happened before the discovery.', 'Earlier past action → past perfect.'],
          ['When we arrived, the play ___ already ___ .', 'had … started', ['has … started', 'is … starting', 'will … start'], 'It started before we arrived.', 'already + earlier past action → had started.'],
        ]),
        typed('form', 'Type the verb form in brackets correctly (two words).', [
          ['Fill in the past perfect of "go": When I called, she ___ to bed.', ['had gone'], 'had + V3 of go.', 'go → gone; past perfect: had gone.', [['had went', 'After "had", use the past participle: gone.']]],
          ['Fill in the past perfect of "finish": After he ___ his homework, he played cricket.', ['had finished'], 'had + V3', 'had finished.'],
          ['Fill in the past perfect of "forget": I realised that I ___ my umbrella.', ['had forgotten', 'had forgot'], 'V3 of forget = forgotten.', 'had forgotten.'],
          ['Fill in the past perfect of "leave": The bus ___ before we got to the stop.', ['had left'], 'V3 of leave = left.', 'had left.'],
          ['Fill in the past perfect of "eat": They ___ dinner before the guests arrived.', ['had eaten'], 'V3 of eat = eaten.', 'had eaten.', [['had ate', 'Use the past participle: eaten.']]],
        ]),
        orderT('timeline', ['The earliest action goes first.', 'Look for "had" — it marks the earlier action.'], [
          ['"When Jill came home, the nurse had already fed the baby." Put the actions in time order.', ['The nurse fed the baby', 'Jill came home'], 'The past perfect (had fed) shows the earlier action.'],
          ['"Ravi realised he had lost his ticket after he had boarded the bus." Put the actions in time order.', ['Ravi lost his ticket', 'Ravi boarded the bus', 'Ravi realised the loss'], 'He lost it, then boarded, then realised.'],
          ['"By the time the firemen came, the villagers had put out the fire." Put the actions in time order.', ['The villagers put out the fire', 'The firemen came'], '"had put out" is the earlier action.'],
        ], 2),
      ],
    },
    {
      id: 'ts10.en.letter.write', title: 'Letter writing: informal and formal', prereqs: [],
      intro: [
        h('Letters with a purpose'),
        p('A letter is a conversation on paper. An informal (personal) letter goes to family and friends; a formal letter goes to an officer, editor, principal or company. Each has a fixed format.'),
        h('Informal letter — steps'),
        stepsB(
          'Sender\'s address (short) and date, at the top right (or left).',
          'Salutation: Dear Ammamma, / Dear Kiran,',
          'Opening: greet and refer to their last letter or news.',
          'Body: your main message in 2–3 paragraphs.',
          'Closing: good wishes, regards to family.',
          'Complimentary close and name: Yours lovingly / With love, Priya',
        ),
        h('Formal letter — steps'),
        stepsB(
          'Sender\'s address and date.',
          'Receiver\'s designation and address: The Commissioner, GHMC, Hyderabad.',
          'Salutation: Sir / Madam, or Respected Sir,',
          'Subject line: Sub: Request for …',
          'Body: purpose → details → request/suggestion.',
          'Closing: Yours faithfully / Yours sincerely, name and signature.',
        ),
        h('Model informal letter (written for WonderLab)'),
        p('Karimnagar, 12 August. Dear Teja, Thank you for your letter and the photos of your new house — it looks lovely! You asked whether you should buy the new phone on monthly instalments. Last week we read a play called The Never-Never Nest, about a couple who bought everything on credit until nothing really belonged to them. It made me think. If you save for four months, you can buy the phone outright and enjoy it without worrying about the next payment. Convey my regards to uncle and aunty. Write soon. With love, Priya.'),
        keys('Informal: friendly tone, contractions allowed, personal news.', 'Formal: polite, clear, to the point, no slang, a subject line.', 'Both: date, salutation, paragraphs, proper closing.'),
        remember('"Yours faithfully" when the receiver is addressed as Sir/Madam (name unknown); "Yours sincerely" when you address them by name. Never use "Yours lovingly" in a formal letter.'),
        tip('Checklist: address ✓ date ✓ salutation ✓ (subject — formal) ✓ paragraphs ✓ closing ✓ name ✓.'),
      ],
      examples: [
        ex('Choose the salutation and closing for a letter to your Municipal Commissioner about a broken streetlight.', ['It is a formal letter to an officer.', 'Name unknown → Sir/Madam → Yours faithfully.'], 'Salutation: "Sir," (or "Respected Sir,"); closing: "Yours faithfully,".'),
        ex('Write a subject line for a letter to your principal asking for a library period on Saturdays.', ['A subject line is short and states the purpose.'], 'Sub: Request for a library period on Saturdays.'),
      ],
      practice: [
        orderT('formal', ['Addresses and date come first; the signature comes last.', 'The subject line comes after the salutation in many formats; follow the order shown here.'], [
          ['Arrange the parts of a formal letter in order.', ['Sender\'s address and date', 'Receiver\'s designation and address', 'Salutation (Sir/Madam)', 'Subject line', 'Body of the letter', 'Yours faithfully, with name and signature'], 'Addresses → salutation → subject → body → closing.'],
          ['Arrange the parts of an informal letter in order.', ['Sender\'s address and date', 'Dear Kiran,', 'Opening greeting and thanks for the last letter', 'Main news and message', 'Regards to family', 'With love, and your name'], 'Address/date → salutation → opening → body → closing.'],
        ]),
        mcq('format', 'Formal = official, polite, with subject. Informal = friendly.', [
          ['Which closing suits a letter to a newspaper editor?', 'Yours faithfully', ['With love', 'Yours lovingly', 'Your dear friend'], 'Editor = formal; name usually not used.', 'Formal letter to "Sir/Madam" closes with "Yours faithfully".'],
          ['Which part appears ONLY in a formal letter?', 'Subject line', ['Date', 'Salutation', 'Body'], 'Which part states the purpose in one line?', 'A subject line is a feature of formal letters.'],
          ['Which salutation is suitable for a letter to your grandmother?', 'Dear Ammamma,', ['Respected Madam,', 'To whom it may concern,', 'Sir,'], 'It is a personal letter.', 'Informal letters use "Dear + name/relation".'],
          ['Which sentence suits a formal letter?', 'I request you to repair the streetlight at the earliest.', ['Hey! Fix the light fast, ok?', 'Love you lots, see you soon!', 'Guess what happened yesterday?'], 'Polite and clear.', 'Formal letters are polite, clear and free of slang.'],
          ['Which is the most suitable purpose for an informal letter?', 'Sharing holiday news with a cousin', ['Complaining to the police about theft', 'Applying for a job', 'Requesting the electricity board for a new connection'], 'Informal = family/friends.', 'Personal news to family is informal; the others are official.'],
        ]),
        matchT('purpose', 'letter situation with the right type and closing', [
          ['To a friend about your birthday party', 'Informal — With love'], ['To the Principal for leave', 'Formal — Yours obediently / faithfully'], ['To the Editor about pollution', 'Formal — Yours faithfully'], ['To your father about hostel life', 'Informal — Your loving son/daughter'], ['To a company about a faulty fan', 'Formal complaint — Yours faithfully'],
        ], ['Who is receiving the letter?', 'Officials → formal closings; family → warm closings.'], 4),
      ],
    },
  ],
};

// =====================================================================================
// Unit 4 — Films and Theatre
// =====================================================================================
const u4: USpec = {
  id: 'ts10.en.u4', subject: 'english', title: 'Unit 4 — Films and Theatre', source: src(4),
  note: 'Reading C (A Tribute) is treated through the features of the tribute genre; teachers should add details of the artist honoured in the textbook. Past perfect is practised in Unit 3 (sequence of tenses).',
  objectives: [
    {
      id: 'ts10.en.ray.read', title: 'Rendezvous with Ray: the life of Satyajit Ray', prereqs: [],
      intro: [
        h('India\'s great film-maker'),
        photo('🎨', 'Before he made films, Satyajit Ray was a graphic designer and illustrator.'),
        p('Reading A, Rendezvous with Ray, introduces Satyajit Ray (1921–1992), one of the greatest film directors of the world. "Rendezvous" means a meeting — the piece is a meeting with Ray\'s life and work. Reading C, A Tribute, honours a great artist of the stage. Together they show how cinema and theatre shape a culture.'),
        h('Ray\'s life in brief (our summary)'),
        p('Ray was born in Calcutta (now Kolkata) in 1921 into a family of writers and artists. He studied at Presidency College and later at Santiniketan, where he learnt painting and grew to love Indian art. He worked as a designer in an advertising agency and illustrated books, including an edition of the novel Pather Panchali by Bibhutibhushan Bandyopadhyay.'),
        p('Inspired by realistic films he saw in Europe, he decided to film that very novel. With little money, a mostly new cast and great patience, he made Pather Panchali (1955). It won international praise. With Aparajito and Apur Sansar it forms the famous Apu Trilogy. Ray also wrote music for his films, created the detective Feluda, and wrote stories for children. In 1992 he received an Honorary Academy Award (Oscar) for lifetime achievement and the Bharat Ratna.'),
        def('Rendezvous', 'A meeting at an agreed time and place (a French word).'),
        def('Tribute', 'Something said, written or done to show respect and admiration for a person, often after their death.'),
        keys('Ray\'s qualities: patience, perfectionism, love of simple human stories, versatility (director, writer, composer, designer).', 'His films showed ordinary Indian life with honesty.', 'A tribute: recalls the person\'s life, highlights their contribution, shares memories, and ends with what they leave behind.'),
        remember('Ray was "versatile": he did many different things well. Don\'t describe him only as a director.'),
      ],
      examples: [
        ex('How did Ray\'s work as an illustrator lead to his first film?', ['He illustrated an edition of the novel Pather Panchali.', 'He came to love the story and decided to film it.'], 'While illustrating Pather Panchali he was drawn to the story, which became his first film.'),
        ex('Give two words that describe Ray, with reasons.', ['Versatile — director, writer, composer, designer.', 'Persistent — he completed his first film despite having little money.'], 'Versatile and persistent.'),
      ],
      practice: [
        mcq('understand', 'Use the summary of Ray\'s life.', [
          ['What was Satyajit Ray\'s first feature film?', 'Pather Panchali', ['Maya Bazaar', 'Mughal-e-Azam', 'Sholay'], 'It was based on a novel he had illustrated.', 'Ray\'s first film was Pather Panchali (1955).'],
          ['Before becoming a film-maker, Ray worked as…', 'a designer in an advertising agency', ['a cricket player', 'a bank manager', 'a ship\'s captain'], 'He was also an illustrator.', 'He worked in advertising as a graphic designer.'],
          ['Which award did Ray receive in 1992?', 'An Honorary Academy Award (Oscar)', ['The Nobel Prize', 'An Olympic medal', 'The Booker Prize'], 'It is the most famous film award.', 'He received an Honorary Oscar for lifetime achievement in 1992.'],
          ['Which word best describes Ray\'s talents?', 'Versatile', ['Narrow', 'Lazy', 'Careless'], 'He did many different things.', 'Someone skilled in many fields is versatile.'],
          ['Which is a detective character created by Ray?', 'Feluda', ['Sherlock Holmes', 'Byomkesh Bakshi', 'Hercule Poirot'], 'He wrote detective stories in Bengali.', 'Feluda is Ray\'s detective.', [['Byomkesh Bakshi', 'Byomkesh Bakshi is another Bengali detective, created by Sharadindu Bandyopadhyay — not Ray.']]],
          ['What is a "tribute"?', 'A piece that honours a person\'s life and work', ['A complaint letter', 'A type of film camera', 'A tax on theatres'], 'Reading C has this title.', 'A tribute shows respect and admiration.'],
        ]),
        orderT('life', ['Birth first; awards last.'], [
          ['Put these events of Ray\'s life in order.', ['Born in Calcutta in 1921', 'Studied art at Santiniketan', 'Worked in an advertising agency', 'Made Pather Panchali (1955)', 'Received the Honorary Oscar (1992)'], 'Follow the years.'],
          ['Arrange the parts of a tribute in a sensible order.', ['Introduce the artist and why we honour them', 'Recall their early life and training', 'Describe their greatest work and contribution', 'Share a memory or quality that made them special', 'Conclude with what they leave behind'], 'Introduce → life → work → personal touch → legacy.'],
        ]),
        matchT('terms', 'film word with its meaning', [
          ['director', 'person who guides the actors and decides how the film is made'], ['script', 'the written text of a film or play'], ['trilogy', 'a set of three related works'], ['cast', 'all the actors in a film or play'], ['premiere', 'the first public showing of a film'], ['documentary', 'a factual film about real events or people'],
        ], ['Think of a film credit list.', 'Tri- means three.']),
      ],
    },
    {
      id: 'ts10.en.mayabazaar.read', title: 'Maya Bazaar: a Telugu classic', prereqs: [],
      intro: [
        h('Magic on screen, 1957'),
        photo('✨', 'Maya Bazaar is remembered for its "magic" — trick photography that amazed audiences long before computer graphics.'),
        p('Reading B is about Maya Bazaar (1957), a Telugu film made by Vijaya Productions (producers B. Nagi Reddy and Aluri Chakrapani) and directed by K. V. Reddy. It was made at the same time in Telugu and Tamil. It is still loved by audiences of all ages and is often called one of the greatest Indian films.'),
        h('The story (our summary)'),
        p('The story is a folk retelling from the Mahabharata world. Abhimanyu (Arjuna\'s son) and Sasirekha (Balarama\'s daughter) are meant to marry. But after the Pandavas lose their kingdom, Balarama is persuaded to give Sasirekha to Lakshmana Kumara, Duryodhana\'s son. With the help and guidance of Krishna, the mighty and good-hearted Ghatotkacha (Bhima\'s son) uses his magic: he takes Sasirekha\'s form, creates an illusory "Maya Bazaar" (magic market), and turns the Kaurava wedding into comic chaos, so that the true lovers can marry.'),
        h('Why it is a classic'),
        keys(
          'Performances: N. T. Rama Rao as Krishna, Akkineni Nageswara Rao as Abhimanyu, Savitri as Sasirekha, S. V. Ranga Rao as Ghatotkacha.',
          'Music by Ghantasala; songs still sung today.',
          'Special effects by cinematographer Marcus Bartley — trick shots done in-camera, without computers.',
          'Humour, fantasy and values (truth wins over pride and greed) in one film.',
          'A colourised version was released in 2010.',
        ),
        def('Special effects', 'Techniques used in films to create things that are impossible or difficult to film normally.'),
        def('Classic', 'A work of very high quality that remains popular and important over a long time.'),
        remember('Maya Bazaar is a film, not a historical event. Write about it as a work of art: story, actors, music, effects and message.'),
        tip('Writing a film review? Mention: title, year, director, story in brief (no spoilers!), acting, music, technical work, your opinion and a recommendation.'),
      ],
      examples: [
        ex('Why is the film titled "Maya Bazaar"?', ['"Maya" = illusion/magic; "Bazaar" = market.', 'Ghatotkacha creates a magical market as part of his plan.'], 'Because of the magical, illusory market that Ghatotkacha creates in the story.'),
        ex('Give two reasons why Maya Bazaar is called a classic.', ['Its special effects were far ahead of their time.', 'Its music, acting and humour still appeal to audiences.'], 'Pioneering special effects; timeless music and performances that still appeal today.'),
      ],
      practice: [
        mcq('understand', 'Recall the summary and the "why it is a classic" points.', [
          ['Who directed Maya Bazaar (1957)?', 'K. V. Reddy', ['Satyajit Ray', 'Raj Kapoor', 'S. S. Rajamouli'], 'A director of Vijaya Productions.', 'Kadiri Venkata Reddy (K. V. Reddy) directed it.'],
          ['Who helps Abhimanyu and Sasirekha to marry?', 'Ghatotkacha, guided by Krishna', ['Duryodhana', 'Lakshmana Kumara', 'Balarama alone'], 'A mighty son of Bhima.', 'Ghatotkacha\'s magic, with Krishna\'s guidance, unites the lovers.'],
          ['Who played Krishna in Maya Bazaar?', 'N. T. Rama Rao', ['Akkineni Nageswara Rao', 'S. V. Ranga Rao', 'Ghantasala'], 'He became famous for playing Krishna.', 'NTR played Krishna.', [['S. V. Ranga Rao', 'S. V. Ranga Rao played Ghatotkacha.']]],
          ['Who composed the music for Maya Bazaar?', 'Ghantasala', ['A. R. Rahman', 'Ilaiyaraaja', 'M. M. Keeravani'], 'A legendary Telugu singer-composer of that era.', 'Ghantasala composed the music.'],
          ['What made the film\'s special effects remarkable?', 'They were created in-camera without computers', ['They used modern computer graphics', 'They were drawn as cartoons', 'There were no special effects'], 'It was made in 1957.', 'Marcus Bartley\'s camera tricks were achieved without computers.'],
          ['What is the meaning of "maya"?', 'Illusion or magic', ['Market', 'Marriage', 'Music'], 'The bazaar is not real.', 'Maya means illusion; bazaar means market.'],
        ]),
        matchT('people', 'person with their contribution to Maya Bazaar', [
          ['K. V. Reddy', 'Director'], ['Ghantasala', 'Music composer'], ['Marcus Bartley', 'Cinematographer (special effects)'], ['Savitri', 'Played Sasirekha'], ['S. V. Ranga Rao', 'Played Ghatotkacha'], ['Akkineni Nageswara Rao', 'Played Abhimanyu'],
        ], ['Some are behind the camera, some in front of it.', 'The cinematographer handles the camera work.']),
        orderT('review', ['Readers first need to know which film it is.', 'Your verdict comes at the end.'], [
          ['Arrange the parts of a film review in order.', ['Title, year and director', 'Brief story without revealing the ending', 'Acting and characters', 'Music, camera and special effects', 'Your opinion and recommendation'], 'Facts → story → performance → technical work → verdict.'],
        ]),
      ],
    },
    {
      id: 'ts10.en.affixes.form', title: 'Prefixes and suffixes', prereqs: [],
      intro: [
        h('Building new words'),
        p('A prefix is added at the beginning of a word and usually changes its MEANING. A suffix is added at the end and usually changes its WORD CLASS (noun, verb, adjective, adverb).'),
        def('Prefix', 'Letters added before a root: un-happy, re-write, pre-view, mis-understand.'),
        def('Suffix', 'Letters added after a root: act-or, direct-ion, enjoy-ment, beauti-ful, quick-ly.'),
        keys(
          'Negative prefixes: un- (unknown), in- (incomplete), im- before p/m/b (impossible, immature, imbalance), il- before l (illegal), ir- before r (irregular), dis- (dishonest), non- (non-violent)',
          'Other prefixes: re- again (replay), pre- before (preview), mis- wrongly (misuse), over- too much (overact), co- together (co-star), inter- between (international)',
          'Noun suffixes: -er/-or (actor), -ion (direction), -ment (entertainment), -ness (kindness), -ity (popularity), -ist (artist)',
          'Adjective suffixes: -ful, -less, -ous (famous), -al (musical), -able (enjoyable), -ive (creative)',
          'Adverb suffix: -ly (beautifully); verb suffixes: -ise/-ize (popularise), -en (brighten)',
        ),
        stepsB('Find the root word.', 'Decide what you need: an opposite (prefix) or a different word class (suffix).', 'Choose the affix; for negative prefixes look at the first letter of the root (l → il-, r → ir-, p/m/b → im-).', 'Check spelling changes: happy → happiness (y → i), create → creative (drop e).'),
        remember('✗ unpossible ✓ impossible; ✗ unlegal ✓ illegal; ✗ dishonestly-ness. When in doubt, say the word aloud — the correct form usually sounds familiar.'),
      ],
      examples: [
        ex('Make the opposite of "regular".', ['The root starts with r.', 'Before r, the negative prefix is usually ir-.'], 'irregular'),
        ex('Make a noun from "direct" that means the work of a film director.', ['Noun suffix for actions/processes: -ion.'], 'direction'),
      ],
      practice: [
        typed('prefix', 'Look at the first letter of the root word.', [
          ['Add a prefix to make the opposite of "possible".', ['impossible'], 'Root starts with p.', 'p → im-: impossible.', [['unpossible', 'Before p, the prefix is im-.']]],
          ['Add a prefix to make the opposite of "legal".', ['illegal'], 'Root starts with l.', 'l → il-: illegal.', [['unlegal', 'Before l, the prefix is il-.']]],
          ['Add a prefix to make the opposite of "responsible".', ['irresponsible'], 'Root starts with r.', 'r → ir-: irresponsible.'],
          ['Add a prefix to make the opposite of "honest".', ['dishonest'], 'This one takes dis-.', 'dis + honest = dishonest.'],
          ['Add a prefix to make the opposite of "complete".', ['incomplete'], 'This one takes in-.', 'in + complete = incomplete.'],
          ['Add a prefix meaning "again" to "release".', ['re-release', 'rerelease'], 're- means again.', 're + release; usually written with a hyphen (re-release) to avoid "ee".'],
          ['Add a prefix to make the opposite of "violent".', ['non-violent', 'nonviolent'], 'Gandhiji\'s method was ___ .', 'non- + violent = non-violent.'],
        ]),
        typed('suffix', 'Which word class is needed?', [
          ['Make a noun from "entertain".', ['entertainment'], 'Add -ment.', 'entertain + ment = entertainment.'],
          ['Make an adjective from "fame".', ['famous'], 'Drop the e, add -ous.', 'fame → famous.'],
          ['Make a noun from "popular".', ['popularity'], 'Add -ity.', 'popular + ity = popularity.'],
          ['Make an adjective from "create".', ['creative'], 'Drop the e, add -ive.', 'create → creative.'],
          ['Make a noun from "kind".', ['kindness'], 'Add -ness.', 'kind + ness = kindness.'],
          ['Make a noun for a person who acts.', ['actor'], 'Add -or.', 'act + or = actor.'],
        ]),
        mcq('meaning', 'Use the meaning of the prefix.', [
          ['"Mis-" in "misunderstand" means…', 'wrongly', ['again', 'before', 'between'], 'To understand ___ .', 'mis- means wrongly or badly.'],
          ['"Pre-" in "preview" means…', 'before', ['after', 'against', 'again'], 'A preview is seen ___ the release.', 'pre- means before.'],
          ['"Over-" in "overact" means…', 'too much', ['under', 'not', 'together'], 'Acting ___ .', 'over- means too much.'],
          ['"Inter-" in "international" means…', 'between', ['inside', 'without', 'before'], 'Matches ___ nations.', 'inter- means between.'],
          ['"Co-" in "co-star" means…', 'together with', ['against', 'former', 'not'], 'Two actors starring ___ .', 'co- means together.'],
        ]),
      ],
    },
    {
      id: 'ts10.en.prep-collocation.use', title: 'Prepositions after adjectives and verbs', prereqs: [],
      intro: [
        h('Words that travel with partners'),
        p('Many adjectives and verbs are followed by a fixed preposition. These pairings (collocations) are not decided by a rule; they must be learnt by use. Learn them as chunks: "interested in", "depend on".'),
        h('Adjective + preposition'),
        keys('afraid of, proud of, fond of, full of, aware of, jealous of', 'interested in, good at, bad at, famous for, responsible for, ready for', 'angry with (a person), angry about (a thing), similar to, married to, kind to, polite to'),
        h('Verb + preposition'),
        keys('depend on, insist on, rely on, congratulate (someone) on', 'believe in, succeed in, participate in', 'apologise for, wait for, look for', 'listen to, belong to, object to, agree with (a person), agree to (a proposal)', 'prevent (someone) from, suffer from, consist of'),
        stepsB('Find the adjective or verb just before the blank.', 'Recall the chunk you have learnt ("famous ___" → famous for).', 'Check meaning: is the object a person or a thing? (angry with Ravi / angry about the delay).', 'If a verb follows the preposition, use the -ing form: "interested in acting".'),
        remember('✗ "She is good in drawing." ✓ "She is good at drawing." ✗ "He succeeded to win." ✓ "He succeeded in winning."'),
      ],
      examples: [
        ex('Fill in: "Ray was famous ___ his realistic films."', ['Chunk: famous for (the reason someone is known).'], 'Ray was famous for his realistic films.'),
        ex('Fill in: "The film\'s success depends ___ the script."', ['Chunk: depend on.'], 'The film\'s success depends on the script.'),
      ],
      practice: [
        mcq('choose', 'Say the chunk aloud: "interested in", "afraid of"…', [
          ['Kiran is interested ___ film-making.', 'in', ['on', 'at', 'for'], 'interested ___ something', 'interested in.'],
          ['The children were afraid ___ the dark.', 'of', ['from', 'with', 'by'], 'afraid ___ something', 'afraid of.', [['from', '"afraid from" is wrong; we say "afraid of".']]],
          ['Sana is very good ___ mimicry.', 'at', ['in', 'on', 'for'], 'good ___ an activity', 'good at.', [['in', 'We say "good at" a skill, not "good in".']]],
          ['My father was angry ___ me for coming late.', 'with', ['on', 'about', 'at for'], 'Angry with a person, about a thing.', 'The object is a person → angry with.'],
          ['We must not depend ___ others for everything.', 'on', ['in', 'of', 'at'], 'depend ___ someone', 'depend on.'],
          ['She succeeded ___ getting a role in the play.', 'in', ['to', 'at', 'for'], 'succeed ___ doing', 'succeed in + -ing.'],
          ['The play consists ___ three scenes.', 'of', ['in', 'with', 'from'], 'consist ___ parts', 'consist of.'],
          ['The guard prevented the boys ___ entering the theatre.', 'from', ['of', 'to', 'with'], 'prevent someone ___ doing', 'prevent from + -ing.'],
        ]),
        typed('fill', 'Type one preposition.', [
          ['Fill in one preposition: Ray was proud ___ Bengali culture.', ['of'], 'proud ___', 'proud of.'],
          ['Fill in one preposition: Who is responsible ___ the stage lights?', ['for'], 'responsible ___', 'responsible for.'],
          ['Fill in one preposition: I apologise ___ the delay.', ['for'], 'apologise ___ something', 'apologise for.'],
          ['Fill in one preposition: Please listen ___ the director carefully.', ['to'], 'listen ___', 'listen to.'],
          ['Fill in one preposition: This bag belongs ___ Imran.', ['to'], 'belong ___', 'belong to.'],
          ['Fill in one preposition: Many people believe ___ hard work.', ['in'], 'believe ___', 'believe in.'],
        ]),
        matchT('pairs', 'word with the preposition that follows it', [
          ['famous', 'for'], ['similar', 'to'], ['insist', 'on'], ['aware', 'of'], ['participate', 'in'], ['agree (with a person)', 'with'],
        ], ['Make a short phrase with each.', 'For example: famous ___ his songs.']),
      ],
    },
    {
      id: 'ts10.en.modals.use', title: 'Modals: can, may, must, should and more', prereqs: [],
      intro: [
        h('Helping verbs that add meaning'),
        p('Modal verbs (can, could, may, might, must, should, ought to, will, would, shall, need) are placed before a main verb to show ability, permission, possibility, necessity, advice and so on.'),
        keys(
          'can / could — ability: "Ghatotkacha could change his form." Permission (informal): "Can I go?"',
          'may / might — possibility: "It may rain." Formal permission: "May I come in, sir?"',
          'must — strong necessity or duty: "You must wear a helmet." Strong deduction: "He must be tired."',
          'should / ought to — advice, moral duty: "You should respect elders."',
          'need not / don\'t have to — no necessity: "You need not bring lunch tomorrow."',
          'mustn\'t — prohibition: "You mustn\'t use phones in the exam hall."',
          'will / shall — future, promise; would — polite request or past habit.',
        ),
        stepsB('Read the sentence and decide the FUNCTION: ability, permission, possibility, necessity, advice, prohibition?', 'Match the function to the modal.', 'Use the BASE form of the verb after the modal: can sing (not can sings / can to sing).', 'For the past: could (ability), had to (necessity), might have / must have + V3 (past deduction).'),
        remember('"mustn\'t" = it is not allowed; "needn\'t" = it is not necessary. They are NOT the same.'),
        remember('✗ "She can sings." ✗ "You must to go." ✓ "She can sing." ✓ "You must go." (Exception: ought TO.)'),
      ],
      examples: [
        ex('Choose: "You ___ smoke inside a cinema hall. It is against the law." (mustn\'t / needn\'t)', ['Against the law → not allowed → prohibition.', 'Prohibition = mustn\'t.'], 'You mustn\'t smoke inside a cinema hall.'),
        ex('Rewrite as advice: "Watching films for six hours a day is not good for you."', ['Advice → should / shouldn\'t.'], 'You shouldn\'t watch films for six hours a day.'),
      ],
      practice: [
        mcq('function', 'Decide the function first.', [
          ['___ I borrow your pen, madam? (polite, formal permission)', 'May', ['Must', 'Would to', 'Need'], 'Formal permission.', '"May I…?" is the formal way to ask permission.'],
          ['You ___ wear a helmet while riding; it is the law.', 'must', ['might', 'could', 'needn\'t'], 'A legal requirement.', 'Strong necessity / legal duty → must.', [['needn\'t', '"needn\'t" means it is not necessary — the opposite of a legal requirement.']]],
          ['Take an umbrella. It ___ rain this evening.', 'may', ['must', 'can\'t', 'should not'], 'Possibility, not certainty.', 'Possibility → may (or might).'],
          ['You ___ come early tomorrow; the show starts at noon.', 'needn\'t', ['mustn\'t', 'can\'t', 'ought'], 'It is not necessary.', '"needn\'t" = no necessity.', [['mustn\'t', '"mustn\'t" would forbid coming early; the meaning here is only "not necessary".']]],
          ['When she was five, Lakshmi ___ recite long poems.', 'could', ['can', 'must', 'may'], 'Past ability.', 'Ability in the past → could.'],
          ['You look pale. You ___ see a doctor.', 'should', ['can', 'might not', 'needn\'t'], 'This is advice.', 'Advice → should.'],
          ['He has been working all day. He ___ be very tired.', 'must', ['can\'t', 'needn\'t', 'shall'], 'A confident guess (deduction).', 'Strong logical deduction → must.'],
        ]),
        mcq('form', 'After a modal, use the base verb (no -s, no "to").', [
          ['Choose the correct sentence.', 'She can sing classical songs.', ['She can sings classical songs.', 'She can to sing classical songs.', 'She cans sing classical songs.'], 'Modal + base verb.', 'Modals take the base form: can sing.'],
          ['Choose the correct sentence.', 'You must finish the project today.', ['You must to finish the project today.', 'You must finishes the project today.', 'You musts finish the project today.'], 'No "to" after must.', 'must + base verb.'],
          ['Choose the correct sentence.', 'We ought to help our neighbours.', ['We ought help our neighbours.', 'We ought helping our neighbours.', 'We oughts to help our neighbours.'], '"ought" is the exception.', '"ought" is always followed by "to".'],
          ['Choose the correct sentence.', 'He might have missed the bus.', ['He might has missed the bus.', 'He might have miss the bus.', 'He might had missed the bus.'], 'Past possibility: might have + V3.', 'might + have + missed.'],
        ], 2),
        matchT('meaning', 'sentence with the meaning of its modal', [
          ['You mustn\'t cheat.', 'prohibition'], ['You needn\'t pay.', 'no necessity'], ['She can swim.', 'ability'], ['It might snow in Kashmir.', 'possibility'], ['You should eat fruit.', 'advice'], ['May I come in?', 'permission'],
        ], ['Think about what the speaker wants to express.', 'mustn\'t and needn\'t are different!']),
      ],
    },
    {
      id: 'ts10.en.concord.edit', title: 'Editing for concord (subject–verb agreement)', prereqs: [],
      intro: [
        h('Making the verb agree'),
        def('Concord', 'Agreement between the subject and the verb: a singular subject takes a singular verb, a plural subject takes a plural verb.'),
        p('Basic: "The actor is ready." / "The actors are ready." In the present simple, a singular third-person subject takes -s: "Ravi watches films."'),
        h('Tricky cases'),
        keys(
          'each, every, either, neither, everyone, somebody + singular verb: "Every student has a ticket."',
          'One of + plural noun + SINGULAR verb: "One of the songs is very popular."',
          'Words like "along with, as well as, with, together with" do not change the subject: "The director, along with his actors, is here."',
          'Either…or / neither…nor: the verb agrees with the NEARER subject: "Neither the actors nor the director was late." / "Neither the director nor the actors were late."',
          '"A number of" + plural verb; "the number of" + singular verb.',
          'Words ending in -s that are singular: news, mathematics, physics: "The news is good."',
          'Amounts as a single unit: "Ten kilometres is a long walk."',
          'Collective nouns (team, family, audience) usually take a singular verb when seen as one unit: "The audience was thrilled."',
        ),
        stepsB('Find the true subject (ignore phrases like "of the songs", "along with…").', 'Decide: singular or plural?', 'For either/or, neither/nor, look at the subject NEAREST the verb.', 'Choose the matching verb form.'),
        remember('✗ "One of my friends are an actor." ✓ "One of my friends is an actor."'),
      ],
      examples: [
        ex('Correct: "The quality of the songs are excellent."', ['True subject: quality (singular). "of the songs" is just a phrase.', 'Singular subject → is.'], 'The quality of the songs is excellent.'),
        ex('Choose: "Either my parents or my sister (is / are) coming to the play."', ['Either…or → agree with the nearer subject.', 'Nearer subject: my sister (singular).'], 'Either my parents or my sister is coming to the play.'),
      ],
      practice: [
        mcq('choose', 'Find the TRUE subject first.', [
          ['One of the actors ___ from Warangal.', 'is', ['are', 'were', 'have been'], 'The subject is "one".', '"One of + plural" takes a singular verb.', [['are', 'The subject is "one", not "actors".']]],
          ['Every student ___ to bring a notebook.', 'has', ['have', 'are', 'were'], '"every" is singular.', 'every + singular verb → has.'],
          ['The director, along with his assistants, ___ arrived.', 'has', ['have', 'are', 'were'], 'Ignore "along with his assistants".', 'True subject: the director (singular).'],
          ['Neither the teacher nor the students ___ aware of the change.', 'were', ['was', 'is', 'has'], 'Agree with the nearer subject.', 'Nearer subject: students (plural) → were.'],
          ['The news about the film festival ___ exciting.', 'is', ['are', 'were', 'have'], '"news" looks plural but is not.', '"news" is singular.'],
          ['A number of students ___ joined the drama club.', 'have', ['has', 'is', 'was'], '"A number of" means many.', '"A number of" + plural verb.'],
          ['The number of cinema halls ___ decreasing.', 'is', ['are', 'have', 'were'], '"The number" is one figure.', '"The number of" + singular verb.'],
        ]),
        typed('word', 'Type only the correct verb.', [
          ['Type the correct verb: "Mathematics (is / are) my favourite subject."', ['is'], '-ics subjects are singular.', 'Mathematics is…'],
          ['Type the correct verb: "Each of the girls (has / have) a costume."', ['has'], 'The subject is "each".', 'Each … has.'],
          ['Type the correct verb: "The children, as well as their teacher, (was / were) late." ', ['were'], 'Ignore "as well as their teacher".', 'True subject: the children (plural) → were.'],
          ['Type the correct verb: "Neither the hero nor the heroine (was / were) present."', ['was'], 'Nearer subject: the heroine.', 'Singular nearer subject → was.'],
          ['Type the correct verb: "Fifty rupees (is / are) the ticket price."', ['is'], 'An amount seen as one unit.', 'Sums of money as a unit take a singular verb.'],
        ]),
        tapT('spot', 'Tap ALL the sentences that are CORRECT.', [
          ['Everyone in the theatre was clapping.', true], ['The audience was spellbound.', true], ['Neither of the films is in English.', true], ['One of my friends are a dancer.', false], ['The list of winners have been announced.', false], ['Each of the songs are beautiful.', false],
        ], ['Find the true subject of each sentence.', '"of + plural noun" does not change the subject.'], 'Everyone/audience/neither take singular verbs; "one of", "the list of", "each of" also need singular verbs.', 5, 2),
      ],
    },
  ],
};

// =====================================================================================
// Unit 5 — Social Issues
// =====================================================================================
const u5: USpec = {
  id: 'ts10.en.u5', subject: 'english', title: 'Unit 5 — Social Issues', source: src(5),
  note: 'Summaries of The Storeyed House and Abandoned are kept at theme level; teachers should add plot details and author names from the textbook. Compound adjectives are practised in Unit 2.',
  objectives: [
    {
      id: 'ts10.en.storeyed-house.read', title: 'The Storeyed House: dignity against caste prejudice', prereqs: [],
      intro: [
        h('A house that becomes a question of dignity'),
        photo('🏘️', 'In many villages of the past, caste rules decided who could live where — and even what kind of house a family could build.'),
        p('The Storeyed House (Parts I and II) is a short story translated from Marathi. It comes from a strong tradition of writing by and about communities that suffered "untouchability" for centuries. The story asks: who has the right to dignity, comfort and a good home?'),
        h('The story in brief (theme-level summary)'),
        p('The story is set in a village where old caste customs still ruled daily life. A man from a community that was treated as "untouchable" works very hard and saves money to build a house with an upper storey — something only privileged families in the village had. For him the house stands for self-respect and equality. For some powerful villagers, it is a challenge to the old order, and they react with anger and hostility. The story follows his pride, the opposition he faces and the struggle that follows, and leaves readers thinking about the injustice of caste prejudice.'),
        def('Caste discrimination', 'Treating people unequally because of the caste they are born into. In India it is illegal.'),
        def('Untouchability', 'An old, cruel practice of keeping some communities away from others. Article 17 of the Constitution abolished it and made its practice an offence.'),
        def('Dignity', 'The right of every person to be respected and treated as valuable.'),
        keys(
          'Theme: the struggle for dignity and equality; the cruelty of prejudice.',
          'The storeyed house is a symbol — it stands for rising up and equal status.',
          'Constitutional values: equality before law (Article 14), no discrimination (Article 15), abolition of untouchability (Article 17). Dr B. R. Ambedkar chaired the committee that drafted the Constitution.',
        ),
        def('Symbol', 'An object that stands for a bigger idea. A storeyed house = progress, self-respect, equality.'),
        remember('Discuss this story with sensitivity. The aim is to understand injustice and to support equality — never to make fun of or blame any group of people today.'),
      ],
      examples: [
        ex('What does the storeyed house symbolise in the story?', ['A symbol is an object that stands for an idea.', 'For the man, building it means rising up through his own effort.', 'It shows he is equal to anyone in the village.'], 'It symbolises dignity, self-respect and the claim to equality.'),
        ex('Why do some villagers oppose the house?', ['They are used to old caste customs that gave them higher status.', 'They see his house as a challenge to that order.'], 'Because of caste prejudice — they feel the old hierarchy is being challenged.'),
      ],
      practice: [
        mcq('understand', 'Think about what the house means to different people.', [
          ['What is the main theme of The Storeyed House?', 'The struggle for dignity and equality against caste prejudice', ['How to design a two-storey building', 'The benefits of city life', 'A comic quarrel between neighbours'], 'Why is the house such a big issue?', 'The story is about prejudice and the right to equal dignity.'],
          ['The storeyed house is best described as a…', 'symbol of self-respect and equality', ['comic object', 'ancient temple', 'government office'], 'It stands for something bigger.', 'The house represents rising up and equal status.'],
          ['Which article of the Indian Constitution abolishes untouchability?', 'Article 17', ['Article 1', 'Article 21A', 'Article 370'], 'It is in the Fundamental Rights section on equality.', 'Article 17 abolishes untouchability and forbids its practice.'],
          ['The man builds the house with…', 'money he saved through his own hard work', ['money stolen from the village', 'a gift from the king', 'a lottery prize'], 'Think of his character.', 'His hard work and savings make the house possible — a source of pride.'],
          ['Which value does the story most strongly support?', 'Every person deserves equal respect', ['Old customs must never change', 'Big houses make people better', 'People should not save money'], 'Think about the injustice shown.', 'By exposing prejudice, the story supports equal dignity for all.'],
        ]),
        matchT('terms', 'word with its meaning', [
          ['dignity', 'the right to be respected'], ['prejudice', 'an unfair opinion formed without reason'], ['discrimination', 'unequal treatment of people'], ['hierarchy', 'a system of higher and lower ranks'], ['symbol', 'an object that stands for an idea'], ['hostility', 'unfriendly, angry behaviour'],
        ], ['These words help you write about social issues.', 'Prejudice is an attitude; discrimination is an action.']),
        tapT('values', 'Tap ALL the actions that uphold constitutional values of equality.', [
          ['Sharing a meal with classmates of every community', true], ['Speaking up when someone is insulted because of caste', true], ['Choosing team members by skill, not by caste', true], ['Refusing to sit next to a classmate because of caste', false], ['Making jokes about a community', false], ['Keeping a common well for only some families', false],
        ], ['Ask: does this action treat everyone as equal?', 'Article 15 forbids discrimination; Article 17 abolishes untouchability.'], 'Equal treatment, speaking up against insults and fair selection uphold equality.'),
      ],
    },
    {
      id: 'ts10.en.abandoned.read', title: 'Abandoned: caring for the aged', prereqs: [],
      intro: [
        h('Who looks after those who looked after us?'),
        photo('👵', 'Grandparents carry a family\'s memories. In old age they need care, company and respect.'),
        p('Reading C, Abandoned, is a poem about an old parent left alone in old age. Our summary: the poem lets us feel the loneliness and hurt of an elderly person whose grown-up children have moved on with their own busy lives and no longer care for them. It quietly asks the reader to remember the love and sacrifices of parents.'),
        def('Abandon', 'To leave someone or something completely, without returning or caring for them.'),
        def('Tone', 'The feeling or attitude in a piece of writing — e.g. sad, angry, hopeful. The tone of this poem is sad and reflective.'),
        def('Empathy', 'The ability to understand and share another person\'s feelings.'),
        keys(
          'Theme: neglect of the elderly; the duty of children to care for parents.',
          'Feelings: loneliness, hurt, longing, quiet dignity.',
          'Contrast: what parents gave in the past vs what they receive now.',
          'Law: India\'s Maintenance and Welfare of Parents and Senior Citizens Act, 2007 makes it a legal duty for children to maintain their parents.',
        ),
        remember('When writing about the poem, describe the feelings and the message. Do not copy lines — explain them in your own words.'),
        tip('Link with Unit 2: in The Dear Departed, too, children neglect an old parent — but there the treatment is comic. Here it is sad and serious.'),
      ],
      examples: [
        ex('What is the tone of the poem, and why?', ['Tone = the feeling in the writing.', 'An old parent is alone and hurt.'], 'Sad and reflective, because it shows the loneliness of a neglected old parent.'),
        ex('Compare The Dear Departed and Abandoned.', ['Both show children neglecting an elderly parent.', 'The play uses humour and satire; the poem uses sadness and reflection.'], 'Same theme (neglect of the aged), different treatment: comic satire vs a sad, serious poem.'),
      ],
      practice: [
        mcq('understand', 'Focus on feelings and message.', [
          ['What is the poem Abandoned mainly about?', 'An elderly parent left alone and uncared for', ['A lost pet dog', 'An abandoned factory', 'A deserted island holiday'], 'The unit topic is care of the aged.', 'It is about the loneliness of a neglected old parent.'],
          ['Which word best describes the tone of the poem?', 'Sad', ['Humorous', 'Excited', 'Boastful'], 'How does a lonely old person feel?', 'The tone is sad and reflective.', [['Humorous', 'Humour is how The Dear Departed treats the theme, not this poem.']]],
          ['What does the poem urge readers to do?', 'Remember parents\' sacrifices and care for them in old age', ['Move to a big city', 'Sell the family house', 'Stop writing letters'], 'What is the message?', 'It urges children to care for and respect their aged parents.'],
          ['Which law in India makes maintaining parents a legal duty?', 'Maintenance and Welfare of Parents and Senior Citizens Act, 2007', ['Right to Education Act, 2009', 'Motor Vehicles Act', 'Dowry Prohibition Act, 1961'], 'It mentions parents and senior citizens.', 'The 2007 Act requires children to maintain their parents.'],
          ['"Empathy" means…', 'understanding and sharing another person\'s feelings', ['feeling empty', 'being angry', 'forgetting the past'], 'The poem tries to create this in readers.', 'Empathy is feeling with another person.'],
        ]),
        tapT('care', 'Tap ALL the ways young people can care for elders at home.', [
          ['Spending time talking and listening to them', true], ['Helping them with medicines and doctor visits', true], ['Teaching them to use a phone for video calls', true], ['Including them in family decisions', true], ['Leaving them alone for days without any contact', false], ['Mocking them for being slow', false],
        ], ['Think of company, health and respect.', 'Which actions show love and respect?'], 'Time, help with health, new skills and inclusion are ways of caring; neglect and mockery hurt.'),
        matchT('feelings', 'word with its meaning', [
          ['loneliness', 'sadness of being alone'], ['neglect', 'failure to give needed care'], ['longing', 'a strong wish for something or someone'], ['gratitude', 'thankfulness'], ['sacrifice', 'giving up something for others'], ['reflective', 'thoughtful, looking back'],
        ], ['These words describe emotions in the poem.', 'Say each word in a sentence about grandparents.']),
      ],
    },
    {
      id: 'ts10.en.phrasal-verbs.use', title: 'Phrasal verbs (separable and inseparable) and idioms', prereqs: [],
      intro: [
        h('Verb + particle = new meaning'),
        def('Phrasal verb', 'A verb + a particle (up, off, on, out, after, into…) that together have a new meaning: "look after" = take care of; "put off" = postpone.'),
        def('Separable phrasal verb', 'The object can go between the verb and the particle: "Switch off the fan." / "Switch the fan off." With a PRONOUN object it MUST go in the middle: "Switch it off."'),
        def('Inseparable phrasal verb', 'The verb and particle always stay together; the object comes after: "Look after your grandmother." / "Look after her."'),
        keys(
          'Separable: turn on/off, switch on/off, put on, take off, pick up, give back, fill in, look up (a word), call off (cancel), put off (postpone), bring up (raise a child)',
          'Inseparable: look after, look into (investigate), come across (find by chance), run into (meet by chance), get over (recover from), take after (resemble an elder), call on (visit), go through',
          'Three-word (always inseparable): put up with (tolerate), look forward to, run out of, get on with',
        ),
        stepsB('Identify the phrasal verb and its object.', 'Is the object a pronoun (it, them, her)?', 'If the verb is separable and the object is a pronoun, put the pronoun in the middle: "pick it up".', 'If the verb is inseparable, keep the verb and particle together: "look after them".'),
        remember('✗ "Switch off it." ✓ "Switch it off." ✗ "Look her after." ✓ "Look after her."'),
        h('Idioms about society and relationships'),
        keys('turn a blind eye — pretend not to notice something wrong', 'stand on one\'s own feet — be independent', 'see eye to eye — agree', 'break the ice — start a friendly conversation', 'a drop in the ocean — a very small amount compared with what is needed', 'the apple of one\'s eye — a person someone loves most'),
      ],
      examples: [
        ex('Replace the noun with a pronoun: "Please turn off the lights."', ['"turn off" is separable.', 'Pronoun for "the lights": them.', 'Pronoun goes in the middle.'], 'Please turn them off.'),
        ex('Replace the noun with a pronoun: "She looks after her grandmother."', ['"look after" is inseparable.', 'Pronoun: her.', 'Keep "look after" together.'], 'She looks after her.'),
      ],
      practice: [
        mcq('position', 'Separable + pronoun → middle. Inseparable → together.', [
          ['Choose the correct sentence.', 'Please switch it off.', ['Please switch off it.', 'Please it switch off.', 'Please switch it of.'], '"switch off" is separable; "it" is a pronoun.', 'Pronoun objects go between verb and particle.', [['Please switch off it.', 'With a pronoun, the object must go in the middle: switch it off.']]],
          ['Choose the correct sentence.', 'Who will look after them?', ['Who will look them after?', 'Who will after look them?', 'Who will look after of them?'], '"look after" is inseparable.', 'Keep "look after" together; the object follows.'],
          ['Choose the correct sentence.', 'Fill in this form, please.', ['Fill this form in in, please.', 'In fill this form, please.', 'Fill please this form in.'], 'With a noun object, either position works.', '"Fill in this form" (or "Fill this form in") is correct.'],
          ['Choose the correct sentence.', 'I came across an old photo of my grandfather.', ['I came an old photo across of my grandfather.', 'I came an old photo of my grandfather across.', 'I across came an old photo.'], '"come across" is inseparable.', 'Inseparable: came across + object.'],
          ['Choose the correct sentence.', 'She gave the books back yesterday.', ['She gave back them yesterday.', 'She back gave the books yesterday.', 'She gave the books yesterday back them.'], '"give back" is separable.', 'With a noun object, "gave the books back" or "gave back the books" are both fine.'],
        ]),
        matchT('meaning', 'phrasal verb with its meaning', [
          ['put off', 'postpone'], ['look into', 'investigate'], ['take after', 'resemble an older family member'], ['get over', 'recover from'], ['put up with', 'tolerate'], ['run into', 'meet by chance'], ['call off', 'cancel'], ['bring up', 'raise a child'],
        ], ['Try each in a sentence.', 'Some have nothing to do with the literal meaning of the words.']),
        mcq('idiom', 'Choose the idiom that fits the meaning in brackets.', [
          ['We must not ___ to injustice. (pretend not to notice)', 'turn a blind eye', ['break the ice', 'see eye to eye', 'stand on our own feet'], 'Ignoring something wrong.', '"Turn a blind eye" = deliberately ignore.'],
          ['After getting a job, Sita could finally ___ . (be independent)', 'stand on her own feet', ['turn a blind eye', 'break the ice', 'be a drop in the ocean'], 'Independent.', '"Stand on one\'s own feet" = be independent.'],
          ['The two brothers rarely ___ on politics. (agree)', 'see eye to eye', ['break the ice', 'turn a blind eye', 'stand on their feet'], 'Agree.', '"See eye to eye" = agree.'],
          ['Our small donation was ___ compared with the flood damage. (a tiny amount)', 'a drop in the ocean', ['the apple of their eye', 'a blind eye', 'eye to eye'], 'Very small compared with what is needed.', '"A drop in the ocean" = a tiny amount.'],
          ['The new student told a joke to ___ . (start a friendly conversation)', 'break the ice', ['see eye to eye', 'turn a blind eye', 'stand on his own feet'], 'Starting to talk with strangers.', '"Break the ice" = start a friendly conversation.'],
          ['Little Teja is ___ . (the person his grandmother loves most)', 'the apple of his grandmother\'s eye', ['a drop in his grandmother\'s ocean', 'a blind eye to his grandmother', 'eye to eye with his grandmother'], 'Most loved.', '"The apple of one\'s eye" = someone loved dearly.'],
        ]),
      ],
    },
    {
      id: 'ts10.en.adverbial.clauses', title: 'Adverbial clauses: time, reason, condition, contrast and more', prereqs: [],
      intro: [
        h('Clauses that work like adverbs'),
        def('Adverbial clause', 'A dependent clause that tells us when, why, how, where, under what condition or in spite of what the main action happens. It starts with a subordinating conjunction.'),
        keys(
          'Time: when, while, before, after, as soon as, until, since — "Wait until the bus stops."',
          'Reason: because, since, as — "He stayed home because he was ill."',
          'Condition: if, unless (= if not), provided that — "Unless you save, you can\'t build a house."',
          'Concession / contrast: although, though, even though, even if — "Although he was poor, he was generous."',
          'Purpose: so that, in order that — "She saved money so that she could build a house."',
          'Result: so … that, such … that — "He was so tired that he fell asleep at once."',
          'Place: where, wherever; Manner: as, as if — "He spoke as if he owned the village."',
        ),
        stepsB('Find the two ideas you want to join.', 'Decide the relationship: time, reason, condition, contrast, purpose, result, place or manner.', 'Choose a conjunction that expresses it.', 'If the adverbial clause comes FIRST, put a comma after it: "Although it rained, we played."'),
        remember('Don\'t double up: ✗ "Although he was poor, but he was honest." ✓ "Although he was poor, he was honest."'),
        remember('"Unless" already means "if not": ✗ "Unless you don\'t study, you will fail." ✓ "Unless you study, you will fail."'),
      ],
      examples: [
        ex('Join with a contrast clause: "He worked hard. He did not get rich."', ['Relationship: contrast.', 'Conjunction: although.', 'Clause first → comma.'], 'Although he worked hard, he did not get rich.'),
        ex('Rewrite with "unless": "If you don\'t water the plants, they will die."', ['"Unless" = "if … not".', 'Remove "don\'t".'], 'Unless you water the plants, they will die.'),
      ],
      practice: [
        mcq('type', 'Look at the conjunction and the meaning.', [
          ['Identify the type: "Although the road was muddy, the children walked to school."', 'Concession (contrast)', ['Reason', 'Purpose', 'Place'], '"Although" shows contrast.', 'An although-clause is a clause of concession.'],
          ['Identify the type: "We stayed indoors because it was raining."', 'Reason', ['Time', 'Condition', 'Result'], 'Why did we stay indoors?', 'A because-clause gives the reason.'],
          ['Identify the type: "She spoke slowly so that everyone could understand."', 'Purpose', ['Result', 'Reason', 'Place'], 'What was her aim?', '"so that" expresses purpose.', [['Result', 'Result uses "so … that" with an adjective/adverb between; "so that" (together) shows purpose.']]],
          ['Identify the type: "He was so tired that he fell asleep at once."', 'Result', ['Purpose', 'Concession', 'Time'], 'What happened because he was so tired?', '"so + adjective + that" shows result.'],
          ['Identify the type: "If you save regularly, you will build your dream house."', 'Condition', ['Time', 'Manner', 'Reason'], 'Under what condition?', 'An if-clause is conditional.'],
          ['Identify the type: "Put the lamp where everyone can see it."', 'Place', ['Time', 'Purpose', 'Manner'], 'Where?', 'A where-clause here tells the place.'],
          ['Identify the type: "He behaved as if nothing had happened."', 'Manner', ['Place', 'Reason', 'Condition'], 'How did he behave?', '"as if" describes manner.'],
        ]),
        mcq('join', 'Choose the conjunction that shows the right relationship.', [
          ['___ he was poor, he never begged.', 'Although', ['Because', 'Unless', 'So that'], 'Poor but not begging — contrast.', 'Contrast → although.'],
          ['You will miss the bus ___ you hurry.', 'unless', ['although', 'because', 'so that'], '= if you don\'t hurry.', '"unless" = if not.'],
          ['Wait here ___ I come back.', 'until', ['although', 'unless', 'so that'], 'Up to the time…', 'Time up to a point → until.'],
          ['She saved every rupee ___ she could buy books.', 'so that', ['although', 'unless', 'until'], 'Her purpose.', 'Purpose → so that.'],
          ['___ the bell rang, the students rushed out.', 'As soon as', ['Although', 'Unless', 'So that'], 'Immediately when…', 'Time (immediately) → as soon as.'],
        ]),
        mcq('correct', 'Watch for doubled conjunctions and "unless … not".', [
          ['Which sentence is correct?', 'Although it was late, she continued working.', ['Although it was late, but she continued working.', 'Although it was late, so she continued working.', 'Although, it was late she continued working.'], 'One conjunction is enough.', 'Don\'t add "but" after an although-clause.'],
          ['Which sentence is correct?', 'Unless you practise, you will not improve.', ['Unless you don\'t practise, you will not improve.', 'Unless you practise, you will improve not.', 'Unless if you practise, you will not improve.'], '"Unless" already contains "not".', 'Unless + positive verb.'],
          ['Which sentence is correct?', 'Because it was raining, the match was cancelled.', ['Because it was raining, so the match was cancelled.', 'Because it was raining, therefore the match was cancelled.', 'Because, it was raining the match was cancelled.'], 'One linker only.', '"Because … , so …" doubles the linker.'],
          ['Which sentence is correct?', 'If it rains, we will stay at home.', ['If it will rain, we will stay at home.', 'If it rained, we will stay at home.', 'If it rains, we stayed at home.'], 'First conditional.', 'If + present, will + base verb.'],
        ], 2),
      ],
    },
    {
      id: 'ts10.en.speech.write', title: 'Writing a speech', prereqs: [],
      intro: [
        h('Words meant to be heard'),
        p('A speech is written to be spoken to an audience — at a school assembly, a function or a meeting. It must hold attention, be easy to follow by ear and leave a clear message.'),
        h('Steps'),
        stepsB(
          'Address the audience: "Respected Headmaster, teachers and my dear friends,"',
          'Greet and introduce yourself and the topic: "Good morning. I am … of Class X. Today I want to speak about …"',
          'Body: 2–3 main points, each with an example or a fact.',
          'Use speech devices: questions to the audience, "we/us", repetition of a key phrase.',
          'Call to action: tell the audience what to do.',
          'Conclude and thank: "Thank you."',
        ),
        h('Model speech (written for WonderLab)'),
        p('Respected Headmaster, teachers and my dear friends, good morning. I am Kavya of Class X, and today I want to speak about our grandparents. Who told us our first stories? Who held our hands at the village fair? Our grandparents did. Yet many elders today live lonely lives because their children and grandchildren are too busy for them. Friends, caring for elders is not a favour; it is our duty. Let us spend at least half an hour every day with our grandparents. Let us listen to their stories, help them with their medicines and teach them to make video calls. If we give them our time, we give them back their happiness. Thank you.'),
        keys('Speech: spoken style, direct address, questions, short sentences, a call to action.', 'Begin with the audience address; end with "Thank you".', 'Use "we" and "us" to include listeners.'),
        remember('A speech is not an essay. Speak TO the audience: "Friends, imagine…", "Let us…".'),
        tip('Checklist: address ✓ greeting & self-introduction ✓ topic ✓ 2–3 points ✓ question/repetition ✓ call to action ✓ thanks ✓.'),
      ],
      examples: [
        ex('Write an opening for a speech on "Say No to Caste Discrimination".', ['Address the audience, greet, introduce yourself and the topic.'], 'Respected Principal, teachers and dear friends, good morning. I am Arjun of Class X, and today I want to speak about why there is no place for caste discrimination in our school or our society.'),
        ex('Which line is a call to action: (a) "Discrimination began long ago." (b) "Let us treat every classmate as an equal from today."', ['A call to action asks the audience to do something.'], '(b) "Let us treat every classmate as an equal from today."'),
      ],
      practice: [
        orderT('parts', ['Speeches open by addressing the audience.', '"Thank you" is the last thing you say.'], [
          ['Arrange the parts of a speech in order.', ['Address the audience', 'Greet and introduce yourself', 'State the topic', 'Give main points with examples', 'Call the audience to action', 'Thank the audience'], 'Address → greeting → topic → points → action → thanks.'],
          ['Arrange these sentences from a speech on saving water.', ['Respected Principal, teachers and dear friends,', 'Good morning. I am Imran of Class X.', 'Today I will speak about saving water.', 'A dripping tap wastes many litres of water in a single day.', 'Let us fix leaking taps at home and in school.', 'Thank you.'], 'Address, greet, topic, fact, call to action, thanks.'],
        ]),
        mcq('features', 'A speech is spoken to listeners.', [
          ['Which is the best opening for a school-assembly speech?', 'Respected Headmaster, teachers and my dear friends,', ['Dear Diary,', 'Sub: Request for leave', 'Once upon a time,'], 'Who is listening?', 'A speech begins by addressing the audience.'],
          ['Which feature is MOST typical of a speech?', 'Direct questions to the audience', ['A subject line', 'A headline and byline', 'The date at the top right'], 'Speeches involve listeners.', 'Questions to the audience keep them involved.'],
          ['Which sentence is a call to action?', 'Let us visit the old-age home this Sunday.', ['Old-age homes started many years ago.', 'My grandmother is seventy.', 'Many people live in cities.'], 'It asks the audience to act.', '"Let us…" invites the audience to do something.'],
          ['How should a speech end?', 'By thanking the audience', ['With "Yours faithfully"', 'With a signature and seal', 'With "Dear Diary"'], 'Courtesy to listeners.', 'Speeches traditionally end with "Thank you".'],
          ['Which pronoun helps include the audience in a speech?', 'we', ['they', 'he', 'it'], 'Make the listeners feel part of the message.', '"We" and "us" include the listeners.'],
        ]),
        matchT('discourse', 'text type with a typical opening', [
          ['Speech', 'Respected Principal, teachers and dear friends,'], ['Informal letter', 'Dear Ravi,'], ['Formal letter', 'Sir,'], ['Diary entry', 'Monday, 14 July, 9 p.m.'], ['News report', 'HYDERABAD, Aug 5:'], ['Notice', 'NOTICE — Annual Sports Day'],
        ], ['Each text type has its own opening convention.', 'Speeches address the audience.']),
      ],
    },
  ],
};

// =====================================================================================
// Unit 6 — Bio-Diversity
// =====================================================================================
const u6: USpec = {
  id: 'ts10.en.u6', subject: 'english', title: 'Unit 6 — Bio-Diversity', source: src(6),
  note: 'The three readings are summarised at theme level; teachers should add specific details and author names from the textbook.',
  objectives: [
    {
      id: 'ts10.en.environment.read', title: 'Environment and toxic waste: reading the unit', prereqs: [],
      intro: [
        h('One planet, many lives'),
        photo('🌍', 'Every species — from soil bacteria to tigers — is part of a web of life. Damage one thread and the whole web weakens.'),
        def('Biodiversity', 'The variety of all living things — plants, animals and micro-organisms — and the ecosystems they form.'),
        p('Unit 6 has three readings. A. Environment is an essay on how human activity — cutting forests, polluting air and water, over-using resources — is upsetting the balance of nature. B. Or Will the Dreamer Wake? is a poem whose title is a question: will humankind, lost in dreams of endless progress, wake up before it is too late? C. A Tale of Three Villages shows how dumping toxic (poisonous) waste near villages can poison water, land and people\'s health.'),
        keys(
          'India is one of the world\'s 17 megadiverse countries.',
          'Telangana has the Kawal and Amrabad Tiger Reserves and many wetlands that host migratory birds.',
          'Threats: deforestation, pollution, hazardous waste, plastic, over-exploitation, climate change.',
          'Responses: laws, waste treatment, the 3 Rs (reduce, reuse, recycle), alert citizens and responsible industry.',
          'The Basel Convention (1989) is an international treaty that controls the movement of hazardous waste between countries.',
        ),
        def('Toxic waste', 'Waste that is poisonous or harmful to living things, e.g. chemical effluents, heavy metals, some e-waste.'),
        def('Effluent', 'Liquid waste flowing out from a factory or sewage system.'),
        remember('Do not just list problems in an answer — mention causes, effects AND solutions.'),
        tip('Discuss: Is there a lake or stream near your town that has changed colour or smell? What might be the cause, and whom could citizens approach?'),
      ],
      examples: [
        ex('Why is the poem\'s title a question?', ['The poem asks whether humans ("the dreamer") will realise the damage.', 'A question invites readers to think and answer for themselves.'], 'Because it challenges readers to ask whether humanity will wake up to environmental danger in time.'),
        ex('Give one cause, one effect and one solution for toxic waste in villages.', ['Cause: factories dump untreated waste.', 'Effect: poisoned water and illness.', 'Solution: treat waste before release; enforce laws.'], 'Cause: untreated factory waste; Effect: polluted water and disease; Solution: waste treatment and strict enforcement.'),
      ],
      practice: [
        mcq('understand', 'Think about causes, effects and solutions.', [
          ['What is "biodiversity"?', 'The variety of living things and their ecosystems', ['The study of rocks', 'A kind of fertiliser', 'Only the number of trees in a forest'], 'Bio = life; diversity = variety.', 'Biodiversity = variety of life.'],
          ['Which is the most direct effect of dumping toxic waste near a village?', 'Poisoned water and illness among people and animals', ['More rainfall', 'Higher school results', 'Cooler summers'], 'Toxic means poisonous.', 'Toxic waste contaminates water and soil, causing disease.'],
          ['Who is "the dreamer" in the poem\'s title most likely to be?', 'Humankind, lost in dreams of endless progress', ['A sleeping child', 'A tiger in the forest', 'A film director'], 'Who needs to wake up to the danger?', 'The dreamer is humanity, which must "wake up" to environmental damage.'],
          ['Which is NOT a solution to environmental damage?', 'Burning plastic waste in the open', ['Treating factory effluents before release', 'Planting native trees', 'Reducing single-use plastic'], 'Which option adds pollution?', 'Open burning of plastic releases toxic gases.'],
          ['India is one of how many megadiverse countries in the world?', '17', ['3', '50', '100'], 'A small group of countries hold most of Earth\'s species.', 'There are 17 recognised megadiverse countries, including India.'],
          ['What does the Basel Convention control?', 'The movement of hazardous waste between countries', ['International cricket matches', 'Prices of medicines', 'Air travel'], 'It is an environmental treaty.', 'The 1989 Basel Convention controls cross-border movement of hazardous waste.'],
        ]),
        matchT('words', 'environment word with its meaning', [
          ['toxic', 'poisonous'], ['effluent', 'liquid waste from a factory'], ['deforestation', 'large-scale cutting down of forests'], ['ecosystem', 'living things and their environment working together'], ['habitat', 'natural home of an animal or plant'], ['endangered', 'at risk of dying out'], ['sustainable', 'able to continue without harming the future'],
        ], ['These words often appear in reports on the environment.', 'Habitat is a home; ecosystem is the whole system.']),
        tapT('cause', 'Tap ALL the human activities that harm biodiversity.', [
          ['Clearing forests for new roads without planning', true], ['Releasing untreated factory waste into rivers', true], ['Hunting endangered animals', true], ['Filling up lakes to build houses', true], ['Protecting wetlands as bird sanctuaries', false], ['Planting native trees', false], ['Composting kitchen waste', false],
        ], ['Ask: does this destroy a habitat or poison living things?', 'Protecting, planting and composting help.'], 'Deforestation, pollution, hunting and destroying lakes harm biodiversity.'),
      ],
    },
    {
      id: 'ts10.en.multimeaning.words', title: 'Words with multiple meanings', prereqs: [],
      intro: [
        h('Same word, different meanings'),
        p('Many English words have more than one meaning. The surrounding words — the context — tell you which meaning is intended. In this unit, "plant" can mean a living thing or a factory!'),
        keys(
          'plant — a living thing that grows in soil / a factory: "a chemical plant"',
          'bank — a place that keeps money / the side of a river',
          'bark — the outer covering of a tree / the sound a dog makes',
          'waste — rubbish / to use carelessly',
          'current — flow of water or electricity / happening now',
          'spring — the season after winter / a natural source of water / a coiled metal wire',
          'fine — good, well / thin / money paid as a penalty',
          'light — not heavy / brightness that lets us see',
        ),
        stepsB('Read the whole sentence, not just the word.', 'Find clue words around it (river, money, dog, tree…).', 'Decide the word class (noun, verb, adjective) — it often changes the meaning.', 'Choose the meaning that makes the sentence sensible.'),
        remember('Don\'t pick the first meaning you know. "The factory was fined" has nothing to do with "fine weather".'),
      ],
      examples: [
        ex('What does "plant" mean in "The chemical plant released effluents into the stream"?', ['Clue words: chemical, released effluents.', 'Living plants don\'t release effluents; factories do.'], 'A factory.'),
        ex('What does "current" mean in "The current of the river was strong"?', ['Clue: river.', 'A river has a flow of water.'], 'The flow of water.'),
      ],
      practice: [
        mcq('context', 'Use the clue words around the word.', [
          ['"The fishermen sat on the bank of the Godavari." Here "bank" means…', 'the side of a river', ['a place that keeps money', 'a row of seats', 'a store of blood'], 'Clue: Godavari.', 'A river bank is the land beside a river.'],
          ['"The factory was asked to pay a fine for polluting the lake." "Fine" means…', 'money paid as a penalty', ['very thin', 'pleasant', 'good health'], 'Clue: pay, polluting.', 'A fine is a penalty paid for breaking a rule.'],
          ['"The bark of the neem tree has medicinal uses." "Bark" means…', 'the outer covering of a tree', ['the sound a dog makes', 'a small boat', 'a shout'], 'Clue: tree.', 'Tree bark is its outer covering.'],
          ['"Don\'t waste water while brushing." "Waste" here is a…', 'verb meaning "use carelessly"', ['noun meaning "rubbish"', 'adjective meaning "empty"', 'noun meaning "a desert"'], 'It comes after "Don\'t".', 'After "Don\'t" we need a verb: waste = use carelessly.'],
          ['"Current affairs is my favourite quiz round." "Current" means…', 'happening now', ['flow of electricity', 'flow of water', 'a dried fruit'], 'Clue: affairs, quiz.', 'Current affairs = events happening now.'],
          ['"Villagers collect drinking water from a spring." "Spring" means…', 'a natural source of water', ['the season after winter', 'a coiled wire', 'a jump'], 'Clue: drinking water.', 'A spring is water flowing naturally from the ground.'],
        ]),
        mcq('same', 'Which sentence uses the word with the given meaning?', [
          ['In which sentence does "plant" mean a factory?', 'The power plant supplies electricity to three districts.', ['Let us plant a sapling.', 'The tulsi plant needs sunlight.', 'She watered every plant in the garden.'], 'Factories produce things.', 'A power plant is an industrial facility.'],
          ['In which sentence does "light" mean "not heavy"?', 'This school bag is very light.', ['Switch on the light.', 'The light from the moon was soft.', 'Please light the lamp.'], 'Opposite of heavy.', '"light bag" = not heavy.'],
          ['In which sentence does "bank" mean a place for money?', 'My mother opened an account in the bank.', ['Lotuses grow near the bank of the pond.', 'The river burst its banks.', 'We sat on the grassy bank.'], 'Account → money.', 'Accounts are opened in a bank (financial).'],
          ['In which sentence is "spring" the season?', 'Trees get new leaves in spring.', ['The spring in the clock is broken.', 'Water bubbled from the spring.', 'The cat is ready to spring.'], 'Season of new leaves.', 'Spring is the season after winter.'],
          ['In which sentence is "fine" an adjective meaning "very thin"?', 'Sieve the flour through a fine cloth.', ['The driver paid a fine.', 'I am fine, thank you.', 'The court will fine the factory.'], 'Thin cloth.', 'Fine cloth = thin, delicate.'],
        ], 2),
        matchT('meanings', 'sentence with the meaning of the word in CAPITALS', [
          ['The dog began to BARK.', 'make a sharp sound'], ['The tree\'s BARK was peeling.', 'outer covering of a tree'], ['The PLANT shut down after the protest.', 'factory'], ['A strong CURRENT swept the boat away.', 'flow of water'], ['She paid a FINE for littering.', 'money penalty'], ['Don\'t WASTE paper.', 'use carelessly'],
        ], ['Read each sentence for clues.', 'The same word can appear twice with different meanings.']),
      ],
    },
    {
      id: 'ts10.en.nonfinite.clauses', title: 'Non-finite clauses: infinitives, gerunds and participles', prereqs: [],
      intro: [
        h('Verbs without a tense'),
        def('Finite verb', 'A verb that shows tense and agrees with a subject: she plants, they planted.'),
        def('Non-finite verb', 'A verb form with no tense of its own: to plant (infinitive), planting (gerund / present participle), planted (past participle).'),
        def('Non-finite clause', 'A clause built around a non-finite verb. It helps you join ideas compactly: "To save the lake, the villagers formed a committee."'),
        keys(
          'Infinitive clause (to + verb): purpose or subject — "We went to the wetland to count birds." / "To pollute a river is a crime."',
          'Gerund (-ing as a noun): "Burning plastic releases toxic gases."',
          'Present participle clause (-ing, active): "Walking along the river, we saw dead fish."',
          'Past participle clause (-ed/V3, passive meaning): "Shocked by the pollution, the students wrote to the Collector."',
          'Perfect participle (having + V3): earlier action — "Having finished the survey, they wrote a report."',
        ),
        stepsB('Take two sentences with the SAME subject.', 'Decide the relationship: same time, earlier action, purpose, passive?', 'Change one verb: same time → -ing; earlier → having + V3; passive → V3; purpose → to + verb.', 'Drop the repeated subject from that clause and put a comma after it when it comes first.'),
        remember('Dangling participle: the subject of the main clause must be the one doing the -ing action. ✗ "Walking to school, a tree fell on the road." ✓ "Walking to school, I saw that a tree had fallen on the road."'),
      ],
      examples: [
        ex('Combine using a participle: "She finished the survey. She wrote the report."', ['Same subject: she.', 'First action finished before the second → having + V3.'], 'Having finished the survey, she wrote the report.'),
        ex('Combine using an infinitive: "The villagers formed a committee. They wanted to save the lake."', ['The second sentence gives the purpose.', 'Purpose → to + verb.'], 'The villagers formed a committee to save the lake.'),
      ],
      practice: [
        mcq('type', 'Look at the form of the verb and its job in the sentence.', [
          ['Identify the non-finite form in CAPITALS: "RECYCLING paper saves trees."', 'Gerund', ['Infinitive', 'Past participle', 'Finite verb'], 'It is the subject of "saves".', 'An -ing form working as a noun (subject) is a gerund.'],
          ['Identify: "We visited the lake TO WATCH the flamingos."', 'Infinitive (purpose)', ['Gerund', 'Past participle', 'Finite verb'], 'Why did we visit?', 'to + verb showing purpose = infinitive.'],
          ['Identify: "POLLUTED by chemicals, the stream turned black."', 'Past participle', ['Gerund', 'Infinitive', 'Present participle'], 'The stream was polluted (passive meaning).', 'A V3 form with passive meaning is a past participle.'],
          ['Identify: "SEEING the dead fish, the children called the officials."', 'Present participle', ['Gerund', 'Infinitive', 'Past participle'], 'It describes the children\'s action, not a thing.', 'An -ing clause describing the subject\'s action is a present participle clause.'],
          ['Identify: "HAVING COLLECTED the samples, the team returned to the lab."', 'Perfect participle', ['Infinitive', 'Gerund', 'Finite verb'], 'having + V3', 'having + V3 shows an earlier completed action.'],
        ]),
        mcq('combine', 'Same subject? Same time, earlier action, purpose or passive?', [
          ['Combine: "He saw the smoke. He called the fire brigade."', 'Seeing the smoke, he called the fire brigade.', ['Seen the smoke, he called the fire brigade.', 'To see the smoke, he called the fire brigade.', 'Seeing the smoke, the fire brigade was called.'], 'Same subject; actions close in time; active.', 'Present participle (seeing) joins two actions by the same subject.'],
          ['Combine: "The students finished planting. They washed their hands."', 'Having finished planting, the students washed their hands.', ['Finished planting, the students washed their hands.', 'To finish planting, the students washed their hands.', 'Having finish planting, the students washed their hands.'], 'One action was completed first.', 'Earlier completed action → having + V3.'],
          ['Combine: "The report was written by the students. It was sent to the Collector."', 'Written by the students, the report was sent to the Collector.', ['Writing by the students, the report was sent to the Collector.', 'To write by the students, the report was sent to the Collector.', 'Having writing by the students, the report was sent to the Collector.'], 'Passive meaning.', 'Passive meaning → past participle (written).'],
          ['Combine: "We need volunteers. They will clean the beach."', 'We need volunteers to clean the beach.', ['We need volunteers cleaned the beach.', 'We need volunteers having cleaned the beach.', 'We need volunteers clean to the beach.'], 'What will the volunteers do?', 'Purpose → to + verb.'],
        ], 2),
        typed('fill', 'Decide: gerund (-ing) or infinitive (to + verb)?', [
          ['Write the correct form of "swim" (one word): "___ in polluted water can cause skin diseases."', ['swimming'], 'It is the subject of the sentence.', 'A gerund can be the subject: swimming.', [['swim', 'The subject needs a noun form: swimming.']]],
          ['Write the correct form of "protect" (two words): "We must act now ___ our forests."', ['to protect'], 'Purpose.', 'Purpose → to protect.'],
          ['Write the correct form of "plant" (one word): "She enjoys ___ trees."', ['planting'], '"enjoy" is followed by -ing.', 'enjoy + gerund: planting.', [['to plant', '"enjoy" takes a gerund, not an infinitive.']]],
          ['Write the correct form of "use" (two words): "The villagers decided ___ cloth bags."', ['to use'], '"decide" is followed by to + verb.', 'decide + infinitive: to use.', [['using', '"decide" takes an infinitive: decided to use.']]],
          ['Write the correct form of "burn" (one word): "Avoid ___ dry leaves."', ['burning'], '"avoid" takes -ing.', 'avoid + gerund: burning.'],
        ]),
      ],
    },
    {
      id: 'ts10.en.reported.speech', title: 'Reported speech', prereqs: [],
      intro: [
        h('Telling what someone said'),
        def('Direct speech', 'The exact words of the speaker inside quotation marks: Ravi said, "I am tired."'),
        def('Reported (indirect) speech', 'The speaker\'s message reported in our own sentence, without quotation marks: Ravi said that he was tired.'),
        h('The changes'),
        keys(
          'Tense moves one step back when the reporting verb is past: is → was; am going → was going; went → had gone; will → would; can → could; has done → had done.',
          'Pronouns change to suit the reporter: I → he/she; we → they; my → his/her.',
          'Time and place words: now → then; today → that day; tomorrow → the next day; yesterday → the day before; here → there; this → that; ago → before.',
          'Statements: said that / told + person + that.',
          'Yes/no questions: asked + if/whether + statement order — "Are you ready?" → She asked if I was ready.',
          'Wh- questions: asked + wh-word + statement order — "Where do you live?" → He asked where I lived.',
          'Commands and requests: told/asked/ordered + person + (not) to + verb — "Don\'t litter." → She told us not to litter.',
          'No tense change for universal truths: He said that the sun rises in the east.',
        ),
        stepsB('Choose the reporting verb: said / told + person / asked / ordered / requested.', 'Add the link: that (statements), if/whether (yes-no questions), wh-word, or to (commands).', 'Change pronouns to suit the reporter.', 'Move the tense one step back (unless it is a universal truth).', 'Change time and place words; remove the quotation marks and the question mark.'),
        remember('"said to" → "told": ✗ "He said me that…" ✓ "He told me that…"'),
        remember('Questions become statements: ✗ "She asked where did I live." ✓ "She asked where I lived."'),
      ],
      examples: [
        ex('Report: The officer said, "I will inspect the factory tomorrow."', ['Statement → said that.', 'I → he (or she).', 'will → would.', 'tomorrow → the next day.'], 'The officer said that he would inspect the factory the next day.'),
        ex('Report: Meena asked Ravi, "Did you see the flamingos?"', ['Yes/no question → asked … if.', 'you → he.', 'did see → had seen.', 'Statement word order; no question mark.'], 'Meena asked Ravi if he had seen the flamingos.'),
      ],
      practice: [
        mcq('statement', 'Tense back one step; change pronouns and time words.', [
          ['Report: He said, "I am tired."', 'He said that he was tired.', ['He said that I am tired.', 'He said that he is being tired.', 'He told that he was tired.'], 'am → was; I → he.', 'Past reporting verb → was; pronoun → he.', [['He told that he was tired.', '"told" needs a person after it: told me that…']]],
          ['Report: She said, "I will plant a tree tomorrow."', 'She said that she would plant a tree the next day.', ['She said that she will plant a tree tomorrow.', 'She said that I would plant a tree the next day.', 'She said that she would plant a tree yesterday.'], 'will → would; tomorrow → the next day.', 'Back-shift and change the time word.'],
          ['Report: The teacher said, "The Earth revolves around the Sun."', 'The teacher said that the Earth revolves around the Sun.', ['The teacher said that the Earth revolved around the Sun.', 'The teacher said that the Earth had revolved around the Sun.', 'The teacher told that the Earth revolves around the Sun.'], 'Is this a universal truth?', 'Universal truths keep the present tense.', [['The teacher said that the Earth revolved around the Sun.', 'Universal truths are not back-shifted.']]],
          ['Report: Kiran said, "I saw a peacock here yesterday."', 'Kiran said that he had seen a peacock there the day before.', ['Kiran said that he saw a peacock here yesterday.', 'Kiran said that I had seen a peacock there the day before.', 'Kiran said that he has seen a peacock there yesterday.'], 'saw → had seen; here → there; yesterday → the day before.', 'All three changes are needed.'],
          ['Report: Mother said to me, "You must drink boiled water."', 'Mother told me that I had to drink boiled water.', ['Mother said me that I had to drink boiled water.', 'Mother told me that you must drink boiled water.', 'Mother told to me that I had to drink boiled water.'], 'said to → told; you → I; must → had to.', '"said to me" → "told me"; you → I; must (necessity) → had to (keeping "must" is also accepted).'],
        ]),
        mcq('question', 'Questions → asked + if/wh-word + statement order.', [
          ['Report: Ravi asked me, "Where do you live?"', 'Ravi asked me where I lived.', ['Ravi asked me where did I live.', 'Ravi asked me where do you live.', 'Ravi asked me that where I lived.'], 'Statement order after the wh-word.', 'No "did"; subject before verb; tense back-shifted.', [['Ravi asked me where did I live.', 'In reported questions use statement order: where I lived.']]],
          ['Report: Mother asked, "Have you finished your homework?"', 'Mother asked if I had finished my homework.', ['Mother asked have I finished my homework.', 'Mother asked if I have finished your homework.', 'Mother asked that I had finished my homework.'], 'Yes/no question → if.', 'if + statement order; have finished → had finished; your → my.'],
          ['Report: The officer asked the villagers, "Why is the water black?"', 'The officer asked the villagers why the water was black.', ['The officer asked the villagers why was the water black.', 'The officer asked the villagers why is the water black.', 'The officer told the villagers why the water was black.'], 'Statement order: the water was.', 'wh-word + subject + verb; is → was.'],
          ['Report: She asked him, "Can you help me?"', 'She asked him if he could help her.', ['She asked him can he help her.', 'She asked him if he can help me.', 'She asked him that he could help her.'], 'can → could; pronouns change.', 'Yes/no question → if; can → could; you → he; me → her.'],
        ]),
        mcq('command', 'Commands → told/asked/ordered + person + (not) to + verb.', [
          ['Report: The teacher said to us, "Plant more trees."', 'The teacher told us to plant more trees.', ['The teacher told us that plant more trees.', 'The teacher said us to plant more trees.', 'The teacher told us planting more trees.'], 'Command → told + person + to.', 'told us to plant.'],
          ['Report: The officer said to the boys, "Don\'t throw plastic into the lake."', 'The officer told the boys not to throw plastic into the lake.', ['The officer told the boys don\'t throw plastic into the lake.', 'The officer told the boys to not throwing plastic into the lake.', 'The officer said the boys not throw plastic into the lake.'], 'Negative command → not to.', 'told + person + not to + verb.'],
          ['Report: She said to her brother, "Please close the window."', 'She requested her brother to close the window.', ['She requested her brother that close the window.', 'She said her brother please close the window.', 'She requested to her brother closing the window.'], '"Please" → request.', 'requested + person + to + verb.'],
          ['Report: The captain said to the players, "Stand in a line."', 'The captain ordered the players to stand in a line.', ['The captain ordered the players that stand in a line.', 'The captain ordered to the players stand in a line.', 'The captain said the players to stand in a line.'], 'An order.', 'ordered + person + to + verb.'],
        ], 2),
      ],
    },
    {
      id: 'ts10.en.quantifiers.use', title: 'Quantifiers: much, many, few, little, some, any', prereqs: [],
      intro: [
        h('How much? How many?'),
        def('Quantifier', 'A word that tells the amount or number of a noun: many trees, much water, a few birds, a little hope.'),
        def('Countable / uncountable', 'Countable nouns can be counted (one tree, two trees). Uncountable nouns cannot (water, air, information, advice).'),
        keys(
          'many / a few / few / several / a number of → COUNTABLE plurals: many species, a few birds',
          'much / a little / little / a great deal of → UNCOUNTABLE: much water, a little time',
          'some / any / a lot of / lots of / plenty of / enough → both',
          'some → positive sentences and offers: "Would you like some tea?"; any → negatives and questions: "Are there any frogs in the pond?"',
          'a few / a little = some (positive); few / little = hardly any (negative): "Few people care" = almost nobody cares.',
          'each / every + singular noun: every village, each student',
        ),
        stepsB('Find the noun.', 'Is it countable or uncountable?', 'Is the sentence positive, negative, a question or an offer?', 'Is the meaning positive (some) or negative (hardly any)?', 'Choose the quantifier.'),
        remember('✗ "much trees" ✓ "many trees"; ✗ "many water" ✓ "much water"; ✗ "a few information" ✓ "a little information".'),
      ],
      examples: [
        ex('Choose: "There isn\'t (much / many) water left in the tank."', ['water = uncountable.', 'Negative sentence → much is natural.'], 'There isn\'t much water left in the tank.'),
        ex('Choose: "(Few / A few) people came, so the meeting was cancelled."', ['The meeting was cancelled → the meaning is negative (hardly anyone).', 'Negative meaning → few.'], 'Few people came, so the meeting was cancelled.'),
      ],
      practice: [
        mcq('choose', 'Countable or uncountable? Positive or negative meaning?', [
          ['How ___ trees did your class plant?', 'many', ['much', 'little', 'a little'], 'Trees can be counted.', 'Countable plural → many.'],
          ['There isn\'t ___ water in the lake this summer.', 'much', ['many', 'few', 'a few'], 'Water is uncountable.', 'Uncountable, negative → much.', [['many', '"Many" is for countable nouns; water is uncountable.']]],
          ['I have ___ friends in Warangal, so I am never lonely there.', 'a few', ['few', 'little', 'much'], 'Positive meaning: some friends.', 'a few = some (positive); friends are countable.', [['few', '"few" would mean hardly any friends — that contradicts "never lonely".']]],
          ['He had ___ money, so he could not buy food.', 'little', ['a little', 'few', 'many'], 'Negative meaning; money is uncountable.', 'little = hardly any (negative), uncountable.'],
          ['Are there ___ frogs in the pond?', 'any', ['much', 'a little', 'little'], 'A question with a countable plural.', 'Questions usually take "any".'],
          ['Would you like ___ buttermilk?', 'some', ['any', 'many', 'few'], 'This is an offer.', 'Offers use "some" even though they are questions.'],
          ['___ student must carry a water bottle on the trip.', 'Every', ['All', 'Many', 'Much'], 'The noun "student" is singular.', 'every + singular noun.'],
        ]),
        typed('fill', 'Type one quantifier: much, many, few, little, some or any.', [
          ['Fill in much or many: "We saw ___ migratory birds at the lake."', ['many'], 'Birds can be counted.', 'Countable → many.'],
          ['Fill in much or many: "How ___ time do we have?"', ['much'], 'Time (as duration) is uncountable.', 'Uncountable → much.'],
          ['Fill in some or any: "There aren\'t ___ fish left in the polluted stream."', ['any'], 'Negative sentence.', 'Negatives take any.'],
          ['Fill in some or any: "Please give me ___ advice."', ['some'], 'A positive request.', 'Positive request → some.'],
          ['Fill in few or little: "There is ___ hope of rain this week, so farmers are worried."', ['little'], 'Hope is uncountable; meaning is negative.', 'little (negative, uncountable).'],
          ['Fill in few or little: "___ species can survive in such toxic water."', ['few'], 'Species are countable; meaning is negative.', 'few (negative, countable).'],
        ], 1),
        tapT('uncount', 'Tap ALL the UNCOUNTABLE nouns.', [
          ['water', true], ['information', true], ['advice', true], ['pollution', true], ['tree', false], ['village', false], ['bird', false], ['species', false],
        ], ['Can you say "one ___, two ___s"?', 'Uncountable nouns have no plural in normal use.'], 'Water, information, advice and pollution are uncountable.'),
      ],
    },
    {
      id: 'ts10.en.report.write', title: 'Writing a news report', prereqs: [],
      intro: [
        h('Facts for readers'),
        p('A news report tells readers about a recent event: what happened, where, when, who was involved, why and how. It is factual, objective and written in the third person.'),
        h('Steps'),
        stepsB(
          'Headline: short and catchy, present tense, articles often dropped — "Students Clean Up Village Lake".',
          'Byline: who wrote it — "By a Staff Reporter".',
          'Dateline: place and date — "NALGONDA, March 3:".',
          'Lead paragraph: the most important facts (the 5 Ws and H).',
          'Body: details in order of importance; quotes from people involved.',
          'Conclusion: result, action taken or what will happen next.',
        ),
        h('Model report (written for WonderLab, a sample event)'),
        p('Students Clean Up Village Lake — By a Staff Reporter — NALGONDA, March 3: About eighty students of a Zilla Parishad High School removed nearly two tonnes of plastic and waste from their village lake on Saturday. The drive was organised by the school\'s eco-club with the help of the gram panchayat. "We used to see dead fish every summer. We want the birds to come back," said a Class X student. The waste was handed over to the municipal recycling unit. The panchayat has promised to put up warning boards against dumping, and the eco-club plans a monthly check of the water quality.'),
        keys('Past tense for events; present tense in the headline.', 'Third person; no personal opinions (use quotes instead).', 'Passive voice is common: "The waste was handed over…"', 'Most important information first.'),
        remember('A report is not a story or an essay: avoid "I think" and emotional exaggeration. Let facts and quotes speak.'),
        tip('Checklist: headline ✓ byline ✓ dateline ✓ lead with 5 Ws ✓ details & quotes ✓ conclusion ✓ past tense ✓ third person ✓.'),
      ],
      examples: [
        ex('Write a headline for: "Yesterday, 500 saplings were planted by students along the highway near Siddipet."', ['Short, present tense, key facts, no articles.'], 'Students Plant 500 Saplings Along Siddipet Highway'),
        ex('Which W is missing from this lead? "On Monday, the eco-club tested the water of the Musi river."', ['When: Monday. Who: the eco-club. What: tested water. Where: Musi river.', 'Missing: why.'], 'Why — the reason for testing the water.'),
      ],
      practice: [
        orderT('parts', ['The headline comes first.', 'The lead paragraph comes right after the byline and dateline.'], [
          ['Arrange the parts of a news report in order.', ['Headline', 'Byline', 'Dateline (place and date)', 'Lead paragraph with the 5 Ws', 'Details and quotes', 'Conclusion: action taken or next steps'], 'Headline → byline → dateline → lead → body → conclusion.'],
          ['Arrange these lines from a report.', ['Toxic Foam Found in Local Stream', 'By a Staff Reporter', 'SANGAREDDY, July 9:', 'Villagers noticed white foam and dead fish in the stream on Tuesday morning.', '"The water smells of chemicals," said a farmer.', 'Officials have collected samples for testing.'], 'Headline, byline, dateline, lead, quote, next step.'],
        ]),
        mcq('features', 'Reports are factual and objective.', [
          ['Which is the best headline?', 'Eco-Club Removes Two Tonnes of Plastic from Lake', ['I Felt Very Happy at the Lake Yesterday', 'Dear Readers, Please Read This', 'Once Upon a Time There Was a Lake'], 'Short, factual, present tense.', 'Headlines state the key fact briefly.'],
          ['Which sentence is NOT suitable in a news report?', 'I think the panchayat is very lazy and useless.', ['The panchayat has promised to install warning boards.', 'About eighty students took part.', 'The waste was sent for recycling.'], 'Reports avoid personal opinion.', 'Personal opinions and insults do not belong in a report.'],
          ['The lead paragraph should contain…', 'the most important facts: who, what, when, where, why, how', ['only a quotation', 'the reporter\'s feelings', 'a list of all participants\' names'], 'Readers may read only the first paragraph.', 'The lead gives the key facts (5 Ws and H).'],
          ['Which tense is used for the events in the body of a report?', 'Simple past', ['Simple future', 'Present continuous', 'Imperative'], 'The event has already happened.', 'Completed events → simple past.'],
          ['What is a "dateline" in a report?', 'The place and date at the start of the report', ['The last line of the report', 'The reporter\'s signature', 'The deadline for submission'], 'NALGONDA, March 3:', 'A dateline gives where and when the report was filed.'],
        ]),
        matchT('5w', 'question word with the fact it asks for', [
          ['Who?', 'the people involved'], ['What?', 'the event that happened'], ['When?', 'the day or time'], ['Where?', 'the place'], ['Why?', 'the reason or cause'], ['How?', 'the way it happened'],
        ], ['These are the 5 Ws and H of reporting.', 'Each question word asks for one kind of fact.']),
      ],
    },
  ],
};

// =====================================================================================
// Unit 7 — Nation and Diversity
// =====================================================================================
const u7: USpec = {
  id: 'ts10.en.u7', subject: 'english', title: 'Unit 7 — Nation and Diversity', source: src(7),
  note: 'Readings B (A Plea for India) and C (Unity in Diversity in India) are treated at theme level; teachers should add details and author names from the textbook.',
  objectives: [
    {
      id: 'ts10.en.my-childhood.read', title: 'My Childhood: A. P. J. Abdul Kalam', prereqs: [],
      intro: [
        h('Growing up in Rameswaram'),
        photo('⛵', 'Kalam grew up in the island town of Rameswaram, where his father owned boats.'),
        p('Reading A, My Childhood, is taken from Wings of Fire, the autobiography of Dr A. P. J. Abdul Kalam (1931–2015), written with Arun Tiwari. Kalam was a great scientist — called the "Missile Man of India" — and the 11th President of India (2002–2007). He received the Bharat Ratna in 1997.'),
        h('The chapter in brief (our summary)'),
        p('Kalam was born in 1931 into a middle-class Tamil Muslim family in Rameswaram. His father Jainulabdeen was not highly educated or rich, but was wise, generous and simple; his mother Ashiamma was kind and hospitable. Kalam\'s closest childhood friends — Ramanadha Sastry, Aravindan and Sivaprakasan — came from orthodox Hindu families, yet the boys never felt any difference.'),
        p('When the Second World War began, the young Kalam earned his first money by collecting tamarind seeds and by helping his cousin Samsuddin distribute newspapers. At school, a new teacher once made Kalam move to the back bench because he did not want a Muslim boy sitting beside the priest\'s son, Ramanadha Sastry. Lakshmana Sastry, the high priest of the Rameswaram temple and Ramanadha\'s father, firmly told the teacher not to spread such social inequality, and the teacher changed his behaviour. Kalam\'s science teacher, Sivasubramania Iyer, invited Kalam home for a meal; when his wife was at first unwilling, he served Kalam himself, and later she too welcomed him. When Kalam wished to study in Ramanathapuram, his parents let him go, accepting that he had to leave home to grow.'),
        keys(
          'Theme: communal harmony; good people break barriers of religion and caste.',
          'Characters who help change society: Lakshmana Sastry, Sivasubramania Iyer.',
          'Values from Kalam\'s parents: honesty, self-discipline, generosity, faith.',
          'Message: prejudice can be overcome through courage and friendship.',
        ),
        def('Autobiography', 'The story of a person\'s life written by that person (first person, "I").'),
        remember('Kalam\'s teacher was not "punished" by the priest — he was corrected and he reformed. Note how the story shows change through understanding.'),
      ],
      examples: [
        ex('How did Sivasubramania Iyer show that he was a reformer?', ['His wife was unwilling to serve a Muslim boy in her kitchen.', 'Iyer served Kalam with his own hands and sat with him to eat.', 'He invited Kalam again, and his wife changed.'], 'He broke social barriers by serving Kalam himself, helping even his wife to change.'),
        ex('Why did Lakshmana Sastry call the new teacher?', ['The teacher had moved Kalam to the back bench because of his religion.', 'Sastry told him not to spread social inequality.'], 'To correct him for spreading social inequality among innocent children.'),
      ],
      practice: [
        mcq('understand', 'Recall the people and events in our summary.', [
          ['My Childhood is taken from which book?', 'Wings of Fire', ['Ignited Minds', 'Discovery of India', 'Pather Panchali'], 'Kalam\'s autobiography.', 'It is from Wings of Fire, Kalam\'s autobiography written with Arun Tiwari.'],
          ['How did young Kalam earn his first wages?', 'By helping his cousin distribute newspapers', ['By selling fish in the market', 'By teaching tuition', 'By working in a factory'], 'Think of Samsuddin.', 'He helped his cousin Samsuddin distribute newspapers (and also sold tamarind seeds).'],
          ['Why did the new teacher move Kalam to the back bench?', 'He did not want a Muslim boy sitting next to the priest\'s son', ['Kalam was talking in class', 'Kalam was too tall', 'Kalam asked to sit at the back'], 'Prejudice.', 'The teacher acted out of religious prejudice.'],
          ['Who was Lakshmana Sastry?', 'The high priest of the Rameswaram temple and father of Kalam\'s friend', ['Kalam\'s science teacher', 'Kalam\'s cousin', 'A newspaper agent'], 'Ramanadha Sastry\'s father.', 'He was the head priest and Ramanadha\'s father.'],
          ['Which value does the chapter most strongly promote?', 'Communal harmony', ['Competition between religions', 'Blind obedience', 'Wealth above everything'], 'Think of Kalam\'s friendships.', 'Friendships across religions and the reformers\' actions promote communal harmony.'],
          ['Which word best describes Sivasubramania Iyer?', 'Reformer', ['Coward', 'Miser', 'Bully'], 'He broke old social barriers.', 'He worked to break barriers, like a reformer.'],
        ]),
        matchT('people', 'person with their role in Kalam\'s childhood', [
          ['Jainulabdeen', 'Kalam\'s father, a wise and simple boat owner'], ['Ashiamma', 'Kalam\'s mother, kind and hospitable'], ['Samsuddin', 'Cousin who distributed newspapers'], ['Ramanadha Sastry', 'Close friend, son of the temple priest'], ['Lakshmana Sastry', 'High priest who corrected the prejudiced teacher'], ['Sivasubramania Iyer', 'Science teacher who served Kalam a meal himself'],
        ], ['Family members, friends and teachers.', 'The two Sastrys are father and son.']),
        orderT('events', ['Start with his birth.', 'Leaving home for studies comes last.'], [
          ['Put these events from My Childhood in order.', ['Kalam is born in Rameswaram', 'The Second World War begins and Kalam earns his first wages', 'A teacher moves Kalam to the back bench', 'Lakshmana Sastry corrects the teacher', 'Kalam leaves home to study at Ramanathapuram'], 'Follow the order of his childhood.'],
        ]),
      ],
    },
    {
      id: 'ts10.en.diversity.read', title: 'Unity in diversity: reading the unit\'s ideas', prereqs: [],
      intro: [
        h('Many colours, one nation'),
        photo('🕊️', 'Peace and harmony grow when we respect each other\'s differences.'),
        p('Reading B, A Plea for India, is a poem that appeals to Indians to rise above divisions of religion, region and language and to stand together for their motherland. Reading C, Unity in Diversity in India, is an essay that explains how a nation of many languages, faiths, foods, festivals and traditions remains united.'),
        keys(
          'India\'s Constitution lists 22 languages in its Eighth Schedule; hundreds more are spoken.',
          'All major world religions are practised in India.',
          'Telangana examples: Bathukamma and Bonalu, Ramzan and Christmas celebrated by neighbours of all faiths; the Medaram Sammakka-Saralamma Jatara, one of the largest tribal festivals; Hyderabad\'s shared "Ganga-Jamuni" culture.',
          'Unifying bonds: the Constitution, democracy, national symbols, shared history of the freedom struggle, sport, cinema and food.',
          'The Preamble promises Justice, Liberty, Equality and Fraternity.',
        ),
        def('Diversity', 'Variety; the presence of many different kinds of people, cultures and ideas.'),
        def('Communal harmony', 'Peace and goodwill among people of different religious communities.'),
        def('Fraternity', 'A feeling of brotherhood and sisterhood among all citizens.'),
        def('Plea', 'An earnest, emotional request.'),
        remember('Unity does not mean everyone is the same. It means people who are different live together with respect.'),
      ],
      examples: [
        ex('What is meant by "unity in diversity"?', ['Diversity = many differences.', 'Unity = being together as one.'], 'People of many languages, religions and cultures living together as one nation with mutual respect.'),
        ex('Why is the poem called a "plea"?', ['A plea is an earnest request.', 'The poem appeals to people to stay united.'], 'Because it earnestly appeals to Indians to rise above divisions and stand united.'),
      ],
      practice: [
        mcq('understand', 'Use the key ideas from the unit.', [
          ['How many languages are listed in the Eighth Schedule of the Constitution?', '22', ['14', '29', '100'], 'It is more than twenty.', 'There are 22 scheduled languages.'],
          ['What does "fraternity" in the Preamble mean?', 'A feeling of brotherhood among all citizens', ['A type of government', 'The right to vote', 'A national festival'], 'Think of "brother".', 'Fraternity means brotherhood/sisterhood among citizens.'],
          ['What is a "plea"?', 'An earnest request', ['A loud quarrel', 'A funny story', 'A government order'], 'Reading B is called "A Plea for India".', 'A plea is a sincere, emotional request.'],
          ['Which of these is a tribal festival of Telangana?', 'Medaram Sammakka-Saralamma Jatara', ['Onam', 'Bihu', 'Pongal'], 'Held in Mulugu district.', 'Medaram Jatara is one of the largest tribal festivals.'],
          ['"Unity in diversity" means…', 'different people living together as one with respect', ['everyone must follow the same customs', 'states should become separate nations', 'only one language should be spoken'], 'Unity ≠ sameness.', 'It means harmony among differences.'],
        ]),
        tapT('unite', 'Tap ALL the things that help unite Indians.', [
          ['The Constitution and equal rights', true], ['Celebrating each other\'s festivals', true], ['Cheering for the national team', true], ['The shared history of the freedom struggle', true], ['Spreading rumours about other communities', false], ['Refusing to learn about other cultures', false],
        ], ['Ask: does this bring people closer?', 'Rumours and prejudice divide.'], 'Shared rights, festivals, sport and history unite; rumours and prejudice divide.'),
        matchT('words', 'word with its meaning', [
          ['diversity', 'variety of different kinds'], ['harmony', 'peaceful agreement'], ['tolerance', 'accepting views different from one\'s own'], ['secular', 'treating all religions equally'], ['heritage', 'traditions and culture handed down from the past'], ['integration', 'bringing different groups together as a whole'],
        ], ['These words appear in essays on national unity.', 'Secular is about religion; heritage is about the past.']),
      ],
    },
    {
      id: 'ts10.en.linkers.use', title: 'Linkers: connecting ideas', prereqs: [],
      intro: [
        h('Glue words'),
        def('Linker (connector)', 'A word or phrase that joins ideas and shows how they are related: and, but, because, however, therefore, for example.'),
        keys(
          'Addition: and, also, moreover, furthermore, besides, in addition, as well as',
          'Contrast: but, yet, however, although, though, whereas, on the other hand, nevertheless',
          'Cause / reason: because, since, as, because of, due to',
          'Result: so, therefore, hence, as a result, consequently',
          'Example: for example, for instance, such as',
          'Sequence / time: first, then, next, after that, finally, meanwhile',
          'Summing up: in short, to sum up, in conclusion',
        ),
        stepsB('Read both ideas.', 'Decide the relationship: adding, contrasting, giving a reason, a result, an example or an order.', 'Choose a linker from that group.', 'Punctuate: "However," and "Therefore," at the start of a sentence take a comma; "but" and "so" join two clauses with a comma before them.'),
        remember('"However" and "therefore" do not join two sentences with just a comma. ✗ "It rained, however we played." ✓ "It rained. However, we played." / "It rained; however, we played."'),
        remember('"Although" and "but" are not used together: ✗ "Although he was tired, but he worked."'),
      ],
      examples: [
        ex('Join with a contrast linker: "Kalam\'s family was not rich. They were generous."', ['Relationship: contrast.', 'Use "but" (or "although").'], 'Kalam\'s family was not rich, but they were generous.'),
        ex('Join with a result linker: "The teacher realised his mistake. He changed his behaviour."', ['Relationship: result.', 'Use "therefore" / "so".'], 'The teacher realised his mistake; therefore, he changed his behaviour.'),
      ],
      practice: [
        mcq('choose', 'First decide the relationship between the ideas.', [
          ['India has many languages; ___, it remains one nation.', 'however', ['therefore', 'for example', 'moreover'], 'Many languages vs one nation — contrast.', 'Contrast → however.'],
          ['Kalam studied hard; ___, he became a great scientist.', 'as a result', ['however', 'for example', 'although'], 'Hard work led to success.', 'Result → as a result.'],
          ['Telangana has many festivals, ___ Bathukamma and Bonalu.', 'such as', ['however', 'therefore', 'although'], 'Examples follow.', 'Examples → such as.'],
          ['The poem is short; ___, its message is powerful.', 'nevertheless', ['moreover', 'because', 'for instance'], 'Short but powerful — contrast.', 'Contrast → nevertheless.'],
          ['Kalam sold tamarind seeds. ___, he helped distribute newspapers.', 'In addition', ['However', 'Therefore', 'Although'], 'Two things he did — adding.', 'Addition → in addition.'],
          ['The match was cancelled ___ heavy rain.', 'due to', ['although', 'however', 'moreover'], 'Reason followed by a noun.', 'Reason + noun phrase → due to (or because of).', [['although', '"although" needs a full clause (although it rained heavily).']]],
        ]),
        matchT('function', 'linker with its function', [
          ['moreover', 'adds information'], ['however', 'shows contrast'], ['therefore', 'shows result'], ['because', 'gives a reason'], ['for instance', 'gives an example'], ['finally', 'shows the last step'], ['in conclusion', 'sums up'],
        ], ['Put each linker into a sentence.', 'Think of what kind of idea comes after it.']),
        mcq('punctuate', 'Check the use and punctuation of each linker.', [
          ['Which sentence is correct?', 'It rained heavily. However, the Bonalu procession continued.', ['It rained heavily, however the Bonalu procession continued.', 'Although it rained heavily, but the Bonalu procession continued.', 'It rained heavily however, the Bonalu procession continued.'], '"However" starts a new sentence (or follows a semicolon).', 'However at the start of a sentence, followed by a comma.'],
          ['Which sentence is correct?', 'Although they spoke different languages, they were close friends.', ['Although they spoke different languages, but they were close friends.', 'Although, they spoke different languages they were close friends.', 'They spoke different languages although, they were close friends.'], 'Don\'t pair although with but.', 'One conjunction; comma after the although-clause.'],
          ['Which sentence is correct?', 'She missed the bus, so she walked to school.', ['She missed the bus, therefore she walked to school.', 'Because she missed the bus, so she walked to school.', 'She missed the bus so, she walked to school.'], '"so" joins two clauses with a comma before it.', '", so" is correct; "therefore" needs a semicolon or new sentence.'],
        ], 2),
      ],
    },
    {
      id: 'ts10.en.u7edit.errors', title: 'Editing a passage: mixed errors', prereqs: [],
      intro: [
        h('Editing like an examiner'),
        p('In this unit, editing tasks give a short passage with errors in different areas. Use a checklist on every sentence — the errors could be anywhere.'),
        h('The editing checklist'),
        stepsB(
          'Verb: does it agree with its subject? Is the tense right for the time?',
          'Article: a / an / the — missing, extra or wrong?',
          'Preposition: right preposition after the verb or adjective? Any unwanted preposition?',
          'Word form: noun, verb, adjective or adverb as needed?',
          'Pronoun: does it match the noun it stands for?',
          'Spelling and punctuation: capital letters, full stops, apostrophes.',
        ),
        keys('"Kalam were born" → "was born" (agreement)', '"He go to school yesterday" → "went" (tense)', '"He is a honest man" → "an honest man" (article)', '"He discussed about it" → "discussed it" (preposition)', '"She is a well-known scientific" → "scientist" (word form)', '"Kalam and his friend was close" → "were close" (two subjects joined by "and")'),
        remember('Its vs it\'s: "it\'s" = it is; "its" = belonging to it. "The temple and its tank" (no apostrophe).'),
      ],
      examples: [
        ex('Correct: "Kalam were born at Rameswaram in 1931."', ['Subject: Kalam (singular) → was.', 'Use "in" for a town: born in Rameswaram.'], 'Kalam was born in Rameswaram in 1931.'),
        ex('Correct: "His father were a honest man who help everyone."', ['father (singular) → was.', '"honest" starts with a vowel sound → an.', '"help" must agree with "who" (= the father) and be past → helped.'], 'His father was an honest man who helped everyone.'),
      ],
      practice: [
        mcq('fix', 'Go through the checklist: verb, article, preposition, word form, pronoun, punctuation.', [
          ['Choose the correct version: "Kalam and his friends was very close."', 'Kalam and his friends were very close.', ['Kalam and his friends is very close.', 'Kalam and his friends was very closely.', 'Kalam and his friend was very close.'], 'Two subjects joined by "and".', 'A compound subject is plural → were.'],
          ['Choose the correct version: "The teacher asked Kalam to sit in back bench."', 'The teacher asked Kalam to sit on the back bench.', ['The teacher asked Kalam to sit in a back bench.', 'The teacher asked Kalam sit on back bench.', 'The teacher asked Kalam to sitting on the back bench.'], 'Preposition and article.', 'We sit ON a bench; "the back bench" needs "the".'],
          ['Choose the correct version: "India is famous for it\'s diversity."', 'India is famous for its diversity.', ['India is famous for its\' diversity.', 'India is famous of its diversity.', 'India are famous for its diversity.'], 'Possessive "its" has no apostrophe.', '"its" = belonging to it.'],
          ['Choose the correct version: "The festival brings people together and spread happiness."', 'The festival brings people together and spreads happiness.', ['The festival bring people together and spreads happiness.', 'The festival brings people together and spreading happiness.', 'The festival brought people together and spread happily.'], 'Both verbs share the subject "the festival".', 'Singular subject → brings … spreads.'],
          ['Choose the correct version: "He was a great scientific and a humble person."', 'He was a great scientist and a humble person.', ['He was a great science and a humble person.', 'He was a great scientifically and a humble person.', 'He were a great scientist and a humble person.'], 'After "a great" we need a noun for a person.', 'scientific (adjective) → scientist (noun).'],
        ]),
        typed('word', 'Type only the corrected word.', [
          ['Replace the wrong word: "Kalam\'s mother FEEDED many guests every day."', ['fed'], 'Irregular verb.', 'feed → fed.'],
          ['Replace the wrong word: "When he was a boy, Kalam GO to school every day."', ['went'], 'The time is the past.', 'Past habit → went.', [['goes', 'The sentence is about the past: went.']]],
          ['Replace the wrong word: "The temple and IT\'S tank are very old."', ['its'], 'Possession, not "it is".', '"its" shows possession.'],
          ['Replace the wrong word: "Neither of the boys WERE afraid."', ['was'], '"Neither" is singular.', 'Neither … was.'],
          ['Replace the wrong word: "He has been living here SINCE ten years."', ['for'], 'Ten years is a length of time.', 'Length of time → for.'],
        ]),
        tapT('spot', 'Tap ALL the sentences that are CORRECT.', [
          ['Each of the friends belongs to a different faith.', true], ['India celebrates its festivals with joy.', true], ['Kalam was born in 1931.', true], ['The news are very encouraging.', false], ['She discussed about the problem.', false], ['He is a honest man.', false],
        ], ['Check verbs, articles and prepositions in each.', '"news" is singular; "discuss" needs no "about".'], 'News is singular; "discuss" takes no preposition; "an honest man".', 5, 2),
      ],
    },
    {
      id: 'ts10.en.diary.write', title: 'Writing a diary entry', prereqs: [],
      intro: [
        h('A conversation with yourself'),
        p('A diary entry records your own experiences, thoughts and feelings about a day or an event. It is personal and informal, written in the first person.'),
        h('Steps'),
        stepsB(
          'Write the date, day and (optionally) the time at the top: "Friday, 14 November 2026, 9:30 p.m."',
          'Optional greeting: "Dear Diary,"',
          'Describe the event: what happened, with whom, where (past tense).',
          'Express your feelings and reactions honestly.',
          'Reflect: what did you learn? What will you do next? (present/future tense)',
          'Sign off with your name or initial.',
        ),
        h('Model diary entry (written for WonderLab)'),
        p('Saturday, 22 March, 9 p.m. Dear Diary, Today was one of the happiest days of my life! Our school celebrated "Unity Day". Sana brought sheer khurma, Joseph brought plum cake and I took sakinalu that Ammamma made. We sang songs in Telugu, Urdu, Hindi and English, and nobody cared who belonged to which religion. When Sana\'s little brother lost his slipper, five of us searched the whole ground together. I realised that our differences only make our friendship more colourful. I wish every day could be like this. — Kiran'),
        keys('First person (I, we); informal, personal tone.', 'Past tense for events; present tense for feelings now; future for plans.', 'Feelings and reflection are essential — a diary is not a report.'),
        remember('Don\'t write a diary like a news report. Include how YOU felt and what YOU learned.'),
        tip('Checklist: date/day/time ✓ "Dear Diary" (optional) ✓ event ✓ feelings ✓ reflection ✓ name ✓.'),
      ],
      examples: [
        ex('Turn this report line into a diary line: "Students planted 200 saplings at the school on Monday."', ['Diary = first person + feelings.'], 'Today we planted 200 saplings in our school. My hands were muddy, but I felt so proud!'),
        ex('Which part is missing from this entry? "Dear Diary, We visited the Golconda Fort. The echo at the gate amazed me. I want to learn more about its history. — Priya"', ['It has greeting, event, feelings, reflection and name.', 'Missing: the date/day at the top.'], 'The date and day.'),
      ],
      practice: [
        orderT('parts', ['The date comes first; the name comes last.', 'Feelings follow the description of the event.'], [
          ['Arrange the parts of a diary entry in order.', ['Date, day and time', 'Dear Diary,', 'What happened today', 'How I felt about it', 'What I learnt and what I will do', 'My name'], 'Date → greeting → event → feelings → reflection → name.'],
          ['Arrange these lines of a diary entry.', ['Monday, 2 June, 8 p.m.', 'Dear Diary,', 'Today we celebrated Telangana Formation Day at school.', 'I felt proud when I sang the state song on stage.', 'I will read more about our state\'s history this week.', '— Teja'], 'Date, greeting, event, feeling, plan, name.'],
        ]),
        mcq('features', 'A diary is personal: first person, feelings, reflection.', [
          ['A diary entry is written in…', 'the first person (I/we)', ['the third person only', 'the passive voice only', 'the form of a notice'], 'It is about your own day.', 'Diaries use "I" and "we".'],
          ['Which sentence suits a diary entry best?', 'I felt nervous before my speech, but my friends cheered for me.', ['The function was held at 10 a.m. in the school hall.', 'All students are hereby informed to attend.', 'Sir, I request you to grant me leave.'], 'Look for personal feelings.', 'Diaries express personal feelings and experiences.'],
          ['What is placed at the top of a diary entry?', 'Date, day and time', ['A headline and byline', 'The receiver\'s address', 'A subject line'], 'When did you write it?', 'Diaries begin with date, day (and time).'],
          ['Which element makes a diary entry different from a report?', 'Personal feelings and reflection', ['Facts about the event', 'Use of the past tense', 'Mention of a place'], 'Reports also have facts and past tense.', 'Feelings and reflection are what make it a diary.'],
          ['Which is a suitable reflection line to end a diary entry?', 'Today taught me that kindness has no religion.', ['The program will start at 9 a.m. sharp.', 'Yours faithfully,', 'By a Staff Reporter'], 'A lesson learnt.', 'A reflection states what you learned.'],
        ]),
        matchT('tone', 'text type with its typical tone and person', [
          ['Diary entry', 'personal, first person, emotional'], ['News report', 'objective, third person, factual'], ['Formal letter', 'polite, official'], ['Speech', 'addresses an audience directly'], ['Notice', 'brief, formal announcement'], ['Biographical sketch', 'third person account of someone\'s life'],
        ], ['Who writes it, and for whom?', 'Only a diary is written for oneself.']),
      ],
    },
  ],
};

// =====================================================================================
// Unit 8 — Human Rights
// =====================================================================================
const u8: USpec = {
  id: 'ts10.en.u8', subject: 'english', title: 'Unit 8 — Human Rights', source: src(8),
  note: 'Authors given: A. L. Hendriks (Jamaican Fragment), Gabriel Okara (Once Upon a Time), P. Sathyavathi (What is My Name?) — teachers should confirm these against the textbook. Summaries are kept brief.',
  objectives: [
    {
      id: 'ts10.en.jamaican.read', title: 'Jamaican Fragment: don\'t judge by appearances', prereqs: [],
      intro: [
        h('What we see vs what is true'),
        photo('⚖', 'Human rights begin with seeing every person as equal — and not judging by skin colour.'),
        p('Jamaican Fragment is a short story by the Jamaican writer A. L. Hendriks (1922–1992). It is set in Jamaica, an island country in the Caribbean with a history of colonial rule and racial division.'),
        h('The story in brief (our summary)'),
        p('On his daily walk to work, the narrator sees two small boys playing in a garden — one fair-skinned and one dark-skinned. He notices that the fair boy keeps hitting the dark boy, who never hits back. The narrator becomes angry, assuming that the dark boy is afraid to fight back because of colour and social status. One day he decides to step in. He then learns that the situation is nothing like what he imagined: the two boys are brothers in the same family, and the older one simply does not hit his little brother. The narrator realises with embarrassment how his own prejudices had made him jump to a wrong conclusion.'),
        def('Prejudice', 'An unfair opinion formed before knowing the facts, often about a group of people.'),
        def('Fragment', 'A small piece of something. The title suggests that the story is a small "slice" of Jamaican life.'),
        keys('Theme: appearances can deceive; do not judge people by skin colour.', 'Twist ending: the narrator, not the boys, held the prejudice.', 'Human-rights link: Article 2 of the Universal Declaration of Human Rights (1948) says rights belong to everyone without distinction of race or colour.'),
        remember('The lesson is about the narrator\'s mistake, not about the boys. Notice how the writer makes US share his first assumption — and then corrects it.'),
      ],
      examples: [
        ex('What is the twist at the end of Jamaican Fragment?', ['The narrator assumed the scene showed racial domination.', 'He learns the boys are brothers and the older one simply won\'t hit his little brother.'], 'The boys are brothers; the narrator\'s assumption was his own prejudice.'),
        ex('What lesson does the narrator learn?', ['He judged by appearance (skin colour).', 'The truth was different.'], 'Never judge people or situations by appearances; check the facts first.'),
      ],
      practice: [
        mcq('understand', 'Focus on the narrator\'s assumption and the twist.', [
          ['Who wrote Jamaican Fragment?', 'A. L. Hendriks', ['Gabriel Okara', 'Imtiaz Dharker', 'Stanley Houghton'], 'A Jamaican writer.', 'A. L. Hendriks wrote Jamaican Fragment.'],
          ['What did the narrator wrongly assume?', 'That the dark boy did not hit back because of his colour and status', ['That the boys were professional boxers', 'That the garden belonged to him', 'That the boys were strangers to each other\'s language'], 'Think about prejudice.', 'He assumed racial or social inequality was behind it.'],
          ['What did the narrator discover?', 'The two boys were brothers', ['The boys were actors', 'The fair boy was the gardener', 'The dark boy was a stranger'], 'The twist.', 'They were brothers in the same family.'],
          ['What is the central message of the story?', 'Do not judge by appearances', ['Always fight back', 'Never walk to work', 'Children should not play in gardens'], 'What did the narrator learn?', 'Appearances can mislead; prejudice leads to wrong conclusions.'],
          ['"Prejudice" means…', 'an unfair opinion formed before knowing the facts', ['a legal judgement in court', 'a kind of medicine', 'a garden plant'], 'Pre = before; judice ≈ judge.', 'Prejudice = pre-judging without facts.'],
        ]),
        orderT('plot', ['The narrator first only watches.', 'Realisation comes at the very end.'], [
          ['Put the events of Jamaican Fragment in order.', ['The narrator walks to work every day', 'He sees a fair boy hitting a dark boy', 'He grows angry and makes an assumption', 'He decides to step in', 'He learns that the boys are brothers', 'He realises his own prejudice'], 'Observation → assumption → action → discovery → realisation.'],
        ]),
        tapT('rights', 'Tap ALL the statements that match the idea of human rights.', [
          ['Every person has equal dignity regardless of colour', true], ['Rights belong to all people without discrimination', true], ['We should check facts before judging others', true], ['Some races deserve more rights than others', false], ['Skin colour shows a person\'s worth', false],
        ], ['Think of the Universal Declaration of Human Rights.', 'Rights are equal for all.'], 'Human rights are universal and equal; colour has nothing to do with worth.', 4),
      ],
    },
    {
      id: 'ts10.en.once-upon.read', title: 'Once Upon a Time: a father learns from his son', prereqs: [],
      intro: [
        h('Masks we wear'),
        photo('🧒', 'A child\'s honest smile — the thing the poem\'s speaker wants to learn again.'),
        p('Once Upon a Time is a poem by the Nigerian poet Gabriel Okara (1921–2019). The speaker is a father talking to his young son.'),
        h('The poem in brief (our summary)'),
        p('The father remembers a time when people were sincere — they laughed with their hearts and welcomed guests warmly. Now, he says, people smile only with their teeth while their eyes stay cold, and they welcome you only for their own benefit. He admits that he too has learnt to put on different "faces" for home, office, street and parties, like changing clothes, and to say polite things he does not mean. Finally he asks his son to teach him how to laugh honestly again, as he did when he was a child like his son.'),
        def('Hypocrisy / insincerity', 'Pretending to have feelings or beliefs that one does not really have.'),
        def('Contrast', 'Placing two opposite things side by side: past sincerity vs present falseness; the honest child vs the masked adult.'),
        keys(
          'Theme: loss of innocence and sincerity in adult (and modern urban) life.',
          'Devices: contrast, repetition, metaphor (faces worn like dresses), irony (the father learns from the child).',
          'Title: "Once upon a time" is how fairy tales begin — sincerity now seems like something from a story.',
          'Child-rights link: childhood honesty and innocence deserve protection.',
        ),
        remember('Explain the images in your own words — e.g. "wearing faces" means putting on false expressions to suit different situations.'),
      ],
      examples: [
        ex('Why is the title "Once Upon a Time" suitable?', ['Fairy tales begin with these words.', 'The father speaks of a past when people were sincere — something that now feels like a story.'], 'It suggests sincere human relations belong to a lost past, like a fairy tale.'),
        ex('What is ironic in the poem?', ['Usually parents teach children.', 'Here the father asks the son to teach him.'], 'The father wants to learn sincerity from his child — a reversal of the usual roles.'),
      ],
      practice: [
        mcq('understand', 'Think of the father\'s regret and his request.', [
          ['Who is the speaker of the poem?', 'A father talking to his son', ['A teacher talking to a class', 'A child talking to a doll', 'A king talking to soldiers'], 'He addresses his son.', 'The speaker is a father.'],
          ['What does the father regret?', 'That people, including himself, have become insincere', ['That he did not become rich', 'That his son is lazy', 'That the weather has changed'], 'Think of the false smiles.', 'He regrets the loss of sincerity in himself and others.'],
          ['What does the father want his son to teach him?', 'How to laugh sincerely again', ['How to play football', 'How to earn money', 'How to wear new dresses'], 'His last request.', 'He wants to relearn honest laughter.'],
          ['"Wearing many faces" means…', 'putting on false expressions for different situations', ['wearing make-up', 'having plastic surgery', 'drawing pictures of faces'], 'It is a metaphor.', 'It refers to pretending, adjusting expressions falsely.'],
          ['Who wrote Once Upon a Time?', 'Gabriel Okara', ['A. L. Hendriks', 'Imtiaz Dharker', 'P. Sathyavathi'], 'A Nigerian poet.', 'Gabriel Okara wrote the poem.'],
          ['What is the main device in the poem?', 'Contrast between past sincerity and present falseness', ['Rhyming couplets about animals', 'Dialogue between two kings', 'A list of scientific facts'], 'Then vs now.', 'The poem contrasts past and present, child and adult.'],
        ]),
        matchT('devices', 'idea from the poem with the device it shows', [
          ['Past sincerity vs present falseness', 'contrast'], ['Faces changed like clothes', 'metaphor / simile'], ['The father learns from the child', 'irony'], ['A fairy-tale opening as the title', 'allusion to fairy tales'], ['Lines repeated for emphasis', 'repetition'],
        ], ['Recall the devices from Unit 3.', 'Irony = the opposite of what is expected.'], 4),
        tapT('themes', 'Tap ALL the themes of the poem.', [
          ['Loss of innocence', true], ['Insincerity in social life', true], ['Value of a child\'s honesty', true], ['A longing to return to genuine feelings', true], ['Wildlife conservation', false], ['Space travel', false],
        ], ['What does the father miss?', 'Which ideas are about sincerity and childhood?'], 'The poem is about lost innocence, insincerity and longing for genuine feeling.'),
      ],
    },
    {
      id: 'ts10.en.my-name.read', title: 'What is My Name?: a woman\'s search for identity', prereqs: [],
      intro: [
        h('Who am I, beyond my roles?'),
        photo('👩', 'Daughter, wife, mother, daughter-in-law… but what is HER name?'),
        p('What is My Name? is a short story by the Telugu writer P. Sathyavathi, translated into English. It explores the identity of women.'),
        h('The story in brief (our summary)'),
        p('A middle-aged housewife has spent years looking after her family. One day she realises she cannot remember her own name. Everyone around her calls her by her relationships — someone\'s wife, someone\'s mother, "Ammagaru" to the help. She begins searching for her name in her memory and among old things, and in the process she discovers how much of her own self she has lost while serving others. The story ends on a note of awakening: she resolves to recover her identity.'),
        def('Identity', 'Who a person is — their name, personality, interests and individuality.'),
        def('Patriarchy', 'A social system in which men hold more power and women\'s roles are limited.'),
        keys(
          'Theme: the loss of women\'s individual identity in household roles.',
          'The name is a symbol of self-identity.',
          'Message: every woman is a person with her own dreams and rights, not only a role.',
          'Constitutional values: equality (Article 14) and no discrimination on grounds of sex (Article 15).',
        ),
        remember('The story does not say that caring for a family is wrong. It says that a woman should not lose her own self while doing it.'),
      ],
      examples: [
        ex('What does "the name" symbolise in the story?', ['She forgets her name after years in roles.', 'Finding it means finding herself.'], 'Her individual identity and self-worth.'),
        ex('Why does the woman forget her name?', ['Everyone addresses her only by relationships.', 'She has spent years serving others and forgotten herself.'], 'Because for years she has been known only by her family roles, never as herself.'),
      ],
      practice: [
        mcq('understand', 'Think about identity and roles.', [
          ['What problem does the woman face in the story?', 'She cannot remember her own name', ['She has lost her house keys', 'She cannot find a job', 'She has forgotten how to cook'], 'The title gives it away.', 'She has forgotten her own name.'],
          ['Why has she forgotten her name?', 'She has been known only by her family roles for years', ['She had an accident', 'She changed her name legally', 'She was living abroad'], 'How do people address her?', 'Being called only "wife", "mother" etc. erased her name.'],
          ['What does her name symbolise?', 'Her own identity and self-worth', ['Her husband\'s job', 'Her house', 'Her village'], 'A symbol stands for a bigger idea.', 'The name stands for her individual self.'],
          ['Who wrote What is My Name?', 'P. Sathyavathi', ['Gabriel Okara', 'A. L. Hendriks', 'Stanley Houghton'], 'A Telugu writer.', 'P. Sathyavathi wrote the story in Telugu.'],
          ['Which message fits the story best?', 'Women have the right to their own identity, beyond family roles', ['Women should not look after families', 'Names are unimportant', 'Only men need identity'], 'Not anti-family; pro-identity.', 'The story affirms every woman\'s right to her own self.'],
        ]),
        matchT('words', 'word with its meaning', [
          ['identity', 'who a person is'], ['individuality', 'qualities that make a person different from others'], ['self-respect', 'proper regard for oneself'], ['awakening', 'sudden realisation'], ['patriarchy', 'system where men hold more power'], ['equality', 'same rights and status for all'],
        ], ['These words help you write about women\'s rights.', 'Awakening = waking up to a truth.']),
        tapT('respect', 'Tap ALL the habits that respect a woman\'s identity at home.', [
          ['Calling her by her name', true], ['Asking for her opinion on family decisions', true], ['Encouraging her hobbies and studies', true], ['Sharing household work', true], ['Treating her only as a servant of the family', false], ['Ignoring her dreams', false],
        ], ['Ask: does this treat her as a person with her own self?', 'Sharing work and listening show respect.'], 'Names, opinions, interests and shared work respect her identity.'),
      ],
    },
    {
      id: 'ts10.en.describe.people', title: 'Describing people: adjectives and vocabulary in context', prereqs: [],
      intro: [
        h('Words for character'),
        p('When you write about characters (or people in a profile or sketch), precise adjectives make your writing clear and vivid. Choose adjectives that match the person\'s ACTIONS.'),
        keys(
          'Positive: generous, compassionate, courageous, honest, humble, patient, determined, sincere, broad-minded',
          'Negative: selfish, arrogant, cunning, greedy, timid, stubborn, hypocritical, narrow-minded, prejudiced',
          'Neutral/physical: tall, slim, dark-haired, elderly, middle-aged, soft-spoken',
        ),
        h('Order of adjectives (before a noun)'),
        p('Opinion → size → age → shape → colour → origin → material → purpose: "a kind old Telugu teacher", "a beautiful small red silk sari".'),
        stepsB('Note what the person DOES or SAYS.', 'Ask what quality that shows (gives freely → generous).', 'Choose a precise adjective, not just "good" or "bad".', 'Support it with evidence: "Iyer was broad-minded — he served Kalam himself."'),
        def('Vocabulary in context', 'Working out a word\'s meaning from the words and ideas around it.'),
        remember('Avoid vague words like "nice" and "good". Say "compassionate", "honest", "courageous" — and give a reason.'),
      ],
      examples: [
        ex('Describe Lakshmana Sastry with one adjective and a reason.', ['Action: he corrected the teacher for spreading inequality.', 'Quality: fairness, standing up for what is right.'], 'Just (or broad-minded): he stood up against inequality.'),
        ex('Put in order: "a / silk / red / beautiful / sari".', ['Opinion (beautiful) → colour (red) → material (silk).'], 'a beautiful red silk sari'),
      ],
      practice: [
        mcq('fit', 'Match the action to the quality.', [
          ['Ravi gave half his lunch to a hungry classmate. He is…', 'generous', ['selfish', 'arrogant', 'timid'], 'He shares freely.', 'Giving freely to others is generous.'],
          ['Meena admitted her mistake although no one saw her. She is…', 'honest', ['cunning', 'greedy', 'stubborn'], 'She tells the truth.', 'Admitting a mistake when unseen shows honesty.'],
          ['He refuses to change his opinion even when he is clearly wrong. He is…', 'stubborn', ['flexible', 'humble', 'generous'], 'Unwilling to change.', 'Refusing to change even when wrong is stubbornness.'],
          ['She looks down on others and boasts about her marks. She is…', 'arrogant', ['humble', 'shy', 'patient'], 'Thinks she is better than others.', 'Boasting and looking down on others = arrogant.', [['humble', 'Humble is the opposite of arrogant.']]],
          ['He smiles at you but criticises you behind your back. He is…', 'hypocritical', ['sincere', 'courageous', 'compassionate'], 'Says one thing, does another.', 'Pretending to be friendly while acting otherwise is hypocrisy.'],
          ['She stood up for a classmate who was being bullied. She is…', 'courageous', ['timid', 'selfish', 'lazy'], 'It needs bravery.', 'Standing up against bullies is courageous.'],
        ]),
        matchT('opposites', 'adjective with its opposite', [
          ['generous', 'selfish'], ['humble', 'arrogant'], ['courageous', 'timid'], ['sincere', 'hypocritical'], ['broad-minded', 'narrow-minded'], ['patient', 'impatient'],
        ], ['Opposites describe opposite behaviour.', 'Some opposites are made with prefixes (im-, narrow-).']),
        orderT('order', ['Opinion first, then size, age, colour, origin, material.'], [
          ['Put the words in order before the noun "teacher".', ['a', 'kind', 'old', 'Telugu', 'teacher'], 'Opinion → age → origin.'],
          ['Put the words in order before the noun "sari".', ['a', 'beautiful', 'red', 'silk', 'sari'], 'Opinion → colour → material.'],
          ['Put the words in order before the noun "boat".', ['a', 'large', 'old', 'wooden', 'fishing', 'boat'], 'Size → age → material → purpose.'],
          ['Put the words in order before the noun "box".', ['a', 'small', 'round', 'brass', 'box'], 'Size → shape → material.'],
        ], 2),
      ],
    },
    {
      id: 'ts10.en.notice.write', title: 'Writing a notice', prereqs: [],
      intro: [
        h('Short, clear, public'),
        p('A notice is a short, formal announcement put up on a notice board (or shared online) to inform a group of people about an event, a rule or a change. It must be brief (usually about 50 words) and easy to read at a glance.'),
        h('Steps'),
        stepsB(
          'Name of the institution at the top: "Zilla Parishad High School, Ghanpur".',
          'The word NOTICE, in capitals.',
          'Date of issue.',
          'Heading: what the notice is about.',
          'Body: what, when, where, who can take part, how to register, whom to contact.',
          'Name, signature and designation of the writer (e.g. Secretary, Eco-Club).',
        ),
        h('Model notice (written for WonderLab)'),
        p('Zilla Parishad High School, Ghanpur — NOTICE — 1 December 2026 — Human Rights Day Essay Competition. On the occasion of Human Rights Day (10 December), an essay competition on "Every Child Has the Right to Learn" will be held in the school library on 10 December 2026 from 10 a.m. to 11 a.m. Students of Classes VIII to X may give their names to the undersigned by 6 December. Prizes will be given to the best three essays. — Kavya R., Secretary, Literary Club'),
        keys('Formal and impersonal; third person or passive ("will be held").', 'All key details: what, when, where, who, how.', 'Put it in a box; keep it short.', 'Useful facts for rights-themed notices: Human Rights Day is 10 December; the child helpline number in India is 1098; the Right to Education Act (2009) gives free and compulsory education to children aged 6–14.'),
        remember('A notice is not a letter: no "Dear students", no "Yours faithfully". It ends with the writer\'s name and designation.'),
        tip('Checklist: institution ✓ NOTICE ✓ date ✓ heading ✓ what/when/where/who/how ✓ name & designation ✓ ≈50 words ✓.'),
      ],
      examples: [
        ex('Write a heading for a notice about a child-rights awareness rally.', ['A heading is short and tells the topic.'], 'Child Rights Awareness Rally'),
        ex('Which detail is missing? "NOTICE — A blood donation camp will be held in the school hall. All are welcome. — Secretary, NSS"', ['What: blood donation camp ✓; Where: school hall ✓; Who: all ✓.', 'When? Not given.', 'Also missing: institution name and date of issue.'], 'The date and time of the camp (and the institution name and date of issue).'),
      ],
      practice: [
        orderT('parts', ['The institution name is at the very top.', 'The writer\'s name and designation come last.'], [
          ['Arrange the parts of a notice in order.', ['Name of the institution', 'NOTICE', 'Date of issue', 'Heading', 'Body: what, when, where, who, how', 'Name and designation of the writer'], 'Institution → NOTICE → date → heading → body → writer.'],
          ['Arrange the lines of this notice.', ['Government High School, Bodhan', 'NOTICE', '20 November 2026', 'Poster-Making on Child Rights', 'A poster-making contest will be held in the art room on 25 November at 2 p.m.; Classes VI–X may register with the class teacher.', 'Sana M., Cultural Secretary'], 'Institution, NOTICE, date, heading, body, writer.'],
        ]),
        mcq('features', 'A notice is short, formal and complete.', [
          ['A notice should usually be about…', '50 words', ['500 words', '5 words', '2 pages'], 'It is read at a glance.', 'Notices are brief — around 50 words.'],
          ['Which closing is right for a notice?', 'Name and designation of the writer', ['Yours lovingly', 'Dear Diary', 'Thank you, friends'], 'It ends formally.', 'A notice ends with the writer\'s name and designation.'],
          ['Which sentence suits a notice?', 'The competition will be held in the school hall on 10 December.', ['Hey guys, come to the hall!!', 'I felt very happy about the competition.', 'Dear friends, how are you?'], 'Formal, informative.', 'Notices are formal and impersonal.'],
          ['When is Human Rights Day observed?', '10 December', ['15 August', '14 November', '5 September'], 'The UDHR was adopted on this day in 1948.', 'Human Rights Day is 10 December.'],
          ['What is the child helpline number in India?', '1098', ['100', '108', '1912'], 'A four-digit number.', '1098 is the child helpline number.'],
          ['Which detail is ESSENTIAL in a notice about an event?', 'Date, time and venue', ['The writer\'s favourite food', 'A long story about the event\'s history', 'The receiver\'s address'], 'Readers must know when and where.', 'Event notices must give date, time and venue.'],
        ]),
        matchT('purpose', 'situation with the best text type', [
          ['Inform all students about a change in exam dates', 'Notice'], ['Tell a friend about your holiday', 'Informal letter'], ['Record your feelings after a hard day', 'Diary entry'], ['Inform newspaper readers about a flood', 'News report'], ['Address the school assembly on Children\'s Day', 'Speech'], ['Complain to the Municipal Commissioner about garbage', 'Formal letter'],
        ], ['Who is the audience and what is the purpose?', 'Public + brief information = notice.']),
      ],
    },
  ],
};

export const units: USpec[] = [u1, u2, u3, u4, u5, u6, u7, u8];
