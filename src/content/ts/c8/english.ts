// Telangana SCERT Class 8 — English (8 thematic units). Original teaching ABOUT each lesson — summaries, themes,
// characters, devices and vocabulary written in our own words. The textbook's passages, poems and plays are
// copyrighted and are never reproduced here. All grammar examples and exercises are original sentences.
import {
  tp, ex, p, h, tip, def, keys, remember, photo, stepsB, choose, matching, ordering, tapAll, text,
  type USpec, type TSpec,
} from '../../lib/kit';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(8, 'english', n);

// ---------- compact practice factories (same shapes as the Class 10 file) ----------
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
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair is mismatched. Take the left items one at a time and test each against every option on the right.' }],
    solution: pairs.map(([a, b]) => `${a} → ${b}`),
  };
}, d);

/** [prompt, items in the correct order, why] — for sequencing events, format parts, or words into a sentence. */
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
// Unit 1 — Family
// =====================================================================================
const u1: USpec = {
  id: 'ts8.en.u1', subject: 'english', title: 'Unit 1 — Family', source: src(1),
  note: 'The Tattered Blanket and A Letter to a Friend are taught at theme level; teachers should add plot and character details from the textbook.',
  objectives: [
    {
      id: 'ts8.en.family.read', title: 'Family bonds: The Tattered Blanket and My Mother', prereqs: [],
      intro: [
        h('What this unit is about'),
        photo('🏠', 'A family is held together by care that flows both ways — from parents to children, and later from children back to ageing parents.'),
        p('Unit 1 looks at love inside the family, and at what happens when that love is forgotten. A. The Tattered Blanket is a short story by the Indian writer Kamala Das. B. My Mother is a poem by the English poet Ann Taylor. C. A Letter to a Friend is a letter in which the writer shares thoughts about family life with a friend.'),
        h('Reading A in brief (our summary)'),
        p('An old mother lives quietly in her family home in a village, wrapped in an old, torn blanket. Her son, who now lives a busy life far away, comes to visit her after a long time. As they talk, she remembers his childhood with great tenderness, but he is distracted and has forgotten much of what she treasures. The visit shows how wide the distance between them has grown.'),
        def('Symbol', 'An object that stands for an idea. The tattered (badly torn) blanket stands for the mother\'s worn-out, neglected life — and for a love that has grown thin from the son\'s side but is still warm from hers.'),
        h('Reading B in brief'),
        p('In My Mother, the speaker looks back on babyhood and childhood and asks who watched over the cradle, who soothed the pain of illness, who taught the first prayers and lessons. Each time the answer is the same: the mother. At the end the speaker promises to repay that love by caring for the mother when she is old and weak.'),
        def('Refrain', 'A word or line repeated at the end of each stanza. In this poem the stanzas close with the words of the title, which makes the answer ring out again and again.'),
        def('Rhetorical question', 'A question asked for effect, not to get information. The poem\'s "Who…?" questions all point to one answer.'),
        keys(
          'Story: an ageing mother\'s love versus a busy son\'s neglect.',
          'Poem: gratitude for a mother\'s care, and a promise to return it.',
          'Shared theme: love in the family must be returned, especially to the old.',
          'Devices: symbol (the blanket), refrain and rhetorical questions (the poem), rhyming couplets.',
        ),
        remember('When answering about the story, do not call the son a villain. The writer shows ordinary carelessness — a busy life that slowly pushes an old parent aside. That is what makes it painful.'),
        tip('Discuss: Who looks after the elders in your home or colony? What small things show them they are loved?'),
      ],
      examples: [
        ex('Why is the blanket in the story "tattered"?', ['Tattered means old and badly torn.', 'The mother is old and lonely; nobody has replaced or cared for her things.', 'So the blanket mirrors her own life.'], 'It shows the mother\'s neglected, worn-out condition — it is a symbol of how little care she receives.'),
        ex('What is the effect of repeating the title at the end of each stanza of My Mother?', ['Each stanza asks "who" did something kind.', 'The repeated answer is always the same.', 'Repetition builds a feeling of gratitude and emphasis.'], 'The refrain stresses that every act of care came from the mother, deepening the poem\'s gratitude.'),
      ],
      practice: [
        mcq('theme', 'Think about what the whole unit is saying, not one detail.', [
          ['What is the common theme of the story and the poem in Unit 1?', 'A mother\'s love, and the duty of children to return it', ['How to earn money in a city', 'The beauty of village festivals', 'The history of blankets'], 'Both texts are about a mother and her child.', 'The story shows a love that is not returned; the poem promises to return it.'],
          ['What does the tattered blanket stand for?', 'The mother\'s neglected, worn-out life', ['The family\'s great wealth', 'The son\'s new job', 'A gift from the government'], 'An old torn object can be a symbol.', 'A torn, old blanket mirrors the mother\'s lonely, uncared-for state.'],
          ['How does the son behave during the visit (in our summary)?', 'He is distracted and has forgotten much of the past', ['He stays for many months and nurses her', 'He refuses to speak to her at all', 'He brings the whole village to meet her'], 'Contrast him with the mother.', 'She remembers his childhood lovingly; he is busy-minded and distant.'],
          ['In My Mother, what does the speaker promise at the end?', 'To care for the mother when she is old and weak', ['To leave home and never return', 'To become a famous poet', 'To buy her a new house'], 'The poem turns from the past to the future.', 'The speaker wants to repay the mother\'s care in her old age.'],
          ['The "Who…?" questions in My Mother are…', 'rhetorical questions', ['questions to a teacher', 'riddles with many answers', 'interview questions'], 'Does the speaker need an answer?', 'They are asked for effect; the answer is obvious — the mother.'],
          ['Which feeling is strongest in My Mother?', 'Gratitude', ['Anger', 'Jealousy', 'Boredom'], 'The speaker remembers kindness.', 'Remembering every act of care fills the speaker with gratitude.', [['Anger', 'Nothing in the poem blames the mother — it thanks her.']]],
        ]),
        matchT('terms', 'term with its meaning in this unit', [
          ['Symbol', 'An object that stands for an idea'],
          ['Refrain', 'Words repeated at the end of each stanza'],
          ['Rhetorical question', 'A question asked for effect, not for an answer'],
          ['Tattered', 'Old and badly torn'],
          ['Neglect', 'Failure to give proper care'],
          ['Rhyming couplet', 'Two lines in a row that rhyme'],
        ], ['Say each term in a sentence about the story or poem.', 'Two of these are words from the story; the rest are poetry terms.']),
        orderT('poem-flow', ['The poem moves through time.', 'The promise is about the future, so it comes last.'], [
          ['Put the ideas of My Mother in the order the poem moves through them.', ['Care for the baby in the cradle', 'Comfort during childhood illness', 'Teaching the child to pray and learn', 'Promise to care for her in old age'], 'Babyhood → childhood → learning → the future promise.'],
          ['Arrange the stages of the story\'s visit (from our summary).', ['The old mother sits alone in her village home', 'Her son arrives after a long time', 'She lovingly recalls his childhood', 'His distracted replies show the distance between them'], 'Setting → arrival → her memories → the painful contrast.'],
        ]),
      ],
    },
    {
      id: 'ts8.en.u1vocab.words', title: 'Word power: family and caring words', prereqs: [],
      intro: [
        h('Words for talking about families'),
        p('To write about families you need words for the people in them, the kinds of families, and the feelings and duties that bind them.'),
        def('Nuclear family', 'Parents and their children living together.'),
        def('Joint family', 'Several generations — grandparents, parents, uncles, aunts, cousins — sharing one home.'),
        def('Sibling (noun)', 'A brother or sister.'),
        def('Cherish (verb)', 'To love and protect something or someone dearly. "She cherished her grandmother\'s letters."'),
        def('Nurture (verb)', 'To care for and help someone grow. Noun: nurture.'),
        def('Frail (adjective)', 'Weak and thin, often because of old age. Noun: frailty.'),
        def('Neglect (verb / noun)', 'To fail to look after. Adjective: neglected.'),
        h('Making word families'),
        stepsB(
          'Find the root: care, love, depend, affection.',
          'Add a suffix to change the word class: care + ful → careful (adjective); care + less → careless; depend + ent → dependent; affection + ate → affectionate.',
          'Add a prefix for the opposite: un + caring → uncaring; in + dependent → independent.',
          'Use the new word in a sentence and check it sounds right.',
        ),
        keys('-ful = full of; -less = without.', 'Relations by marriage take "-in-law": mother-in-law, brothers-in-law (plural goes on the main word).', 'Collocations: take care of, look after, bring up a child, grow old.'),
        remember('The plural of brother-in-law is brothers-in-law, not brother-in-laws.'),
      ],
      examples: [
        ex('Give the opposite of "dependent" using a prefix.', ['Root word: dependent.', 'The prefix in- means "not".'], 'independent'),
        ex('Complete: "My grandparents, uncles and cousins all live with us — we are a ___ family."', ['Many generations under one roof.', 'That is a joint family.'], 'joint'),
      ],
      practice: [
        mcq('meaning', 'Use the clue words in the sentence.', [
          ['"The old man was too frail to walk to the market." Frail means…', 'weak and thin', ['strong and healthy', 'rich and proud', 'angry and loud'], 'He could not walk far.', 'Frail describes someone physically weak, often from age.'],
          ['Which word means "a brother or sister"?', 'Sibling', ['Spouse', 'Cousin', 'Ancestor'], 'Children of the same parents.', 'A sibling is a brother or sister.', [['Cousin', 'A cousin is the child of an uncle or aunt.']]],
          ['"Parents nurture their children." Nurture means…', 'care for and help to grow', ['punish', 'ignore', 'sell'], 'Think of a gardener and a plant.', 'To nurture is to care for and encourage growth.'],
          ['Which is the opposite of "cherish"?', 'Neglect', ['Treasure', 'Adore', 'Protect'], 'Find the word that means NOT caring.', 'To cherish is to care dearly; to neglect is to fail to care.'],
          ['A family of parents and their children only is called…', 'a nuclear family', ['a joint family', 'an extended family', 'a single-parent family'], 'The smallest family unit.', 'Parents + children only = nuclear family.'],
          ['"She is very ___ towards her little brother; she hugs and helps him." Choose the word.', 'affectionate', ['careless', 'independent', 'frail'], 'Which word shows love?', 'Affectionate means showing love and care.'],
        ]),
        typed('affix', 'Look at the root word and the clue.', [
          ['Add a suffix to "care" to mean "not paying attention; without care".', ['careless'], '-less means without.', 'care + less = careless.', [['careful', 'Careful means full of care — the opposite.']]],
          ['Add a prefix to "dependent" to make its opposite.', ['independent'], 'Which prefix means "not" here: un-, in- or dis-?', 'in + dependent = independent.', [['undependent', 'The correct prefix is in-: independent.']]],
          ['Write the adjective form of "affection" (ends in -ate).', ['affectionate'], 'affection + ate.', 'affection → affectionate.'],
          ['Write the plural of "sister-in-law".', ['sisters-in-law'], 'The plural goes on the main word.', 'The main word is sister, so: sisters-in-law.', [['sister-in-laws', 'Add the s to the main word, sister: sisters-in-law.']]],
          ['Write the noun form of "frail".', ['frailty'], 'It ends in -ty.', 'frail → frailty.'],
          ['Add a suffix to "hope" to make an adjective meaning "full of hope".', ['hopeful'], '-ful means full of.', 'hope + ful = hopeful.'],
        ]),
        matchT('collocate', 'phrase with its meaning', [
          ['look after', 'take care of'], ['bring up', 'raise a child'], ['grow old', 'become aged'], ['take after', 'look or behave like an older relative'], ['get along with', 'have a friendly relationship with'], ['fall out with', 'quarrel with'],
        ], ['Use each phrase in a sentence about your family.', 'The small word (after, up, along) changes the meaning.']),
      ],
    },
    {
      id: 'ts8.en.phrase.noun', title: 'Phrases and noun phrases', prereqs: [],
      intro: [
        h('What is a phrase?'),
        p('A phrase is a group of words that works together as one unit but does NOT have its own subject and finite verb. A clause has a subject and a verb; a phrase does not.'),
        def('Phrase', 'A group of words without a subject–verb pair. "in the old house", "a very kind grandmother", "quite slowly".'),
        def('Clause', 'A group of words WITH a subject and a verb. "when my uncle arrived" (subject: my uncle, verb: arrived).'),
        h('Noun phrases'),
        p('A noun phrase is built around one main noun called the head. Words before it (determiners and adjectives) and words after it (often a prepositional phrase) tell us more about the head.'),
        keys(
          'Determiner + adjective(s) + HEAD NOUN + extra phrase: "my | old | blanket | with blue stripes".',
          'The head noun is the word the whole phrase is about; the verb agrees with it.',
          'Other phrases: adjective phrase (very proud of her son), adverb phrase (quite slowly), prepositional phrase (under the mango tree), verb phrase (has been waiting).',
        ),
        h('Method: finding the head of a noun phrase'),
        stepsB(
          'Underline the whole noun phrase (it can be the subject or the object).',
          'Remove the determiner (a, the, my, those) and the adjectives in front.',
          'Remove any phrase that follows starting with a preposition (of, with, in, from…).',
          'The noun that is left is the head. Test: the verb must agree with it.',
        ),
        remember('"The box of toys IS heavy" — the head is box (singular), not toys. Agreement follows the head noun.'),
        tip('Order of adjectives before a noun: opinion → size → age → shape → colour → origin → material: "a lovely small old round red Indian clay pot".'),
      ],
      examples: [
        ex('Find the head noun: "The letters from my cousin in Nizamabad arrived today."', ['Remove the determiner "The".', 'Remove the prepositional phrase "from my cousin in Nizamabad".', 'What is left is "letters".'], 'letters (so the verb is plural: "arrived" / "have arrived")'),
        ex('Is "after the long journey" a phrase or a clause?', ['Look for a subject and a finite verb.', '"journey" is a noun; there is no verb.', 'It begins with a preposition.'], 'A (prepositional) phrase — it has no subject and verb.'),
        ex('Expand "a blanket" into a noun phrase with an opinion adjective, an age adjective and a prepositional phrase.', ['Opinion: warm. Age: old.', 'Order: opinion before age.', 'Add a phrase after the noun: with red borders.'], 'a warm old blanket with red borders'),
      ],
      practice: [
        typed('head', 'Strip away the determiner, adjectives and the phrase after the noun.', [
          ['Type the head noun: "The tall girl with the red bag is my sister."', ['girl'], 'The red bag comes after "with" — it only describes.', 'Remove "The tall" and "with the red bag" → girl.', [['bag', '"bag" is inside the prepositional phrase "with the red bag"; it only describes the girl.']]],
          ['Type the head noun: "A basket of ripe mangoes was on the table."', ['basket'], 'What was on the table — the basket or the mangoes?', '"of ripe mangoes" describes the basket; the verb "was" agrees with basket.', [['mangoes', '"of ripe mangoes" only describes. The singular verb "was" shows the head is basket.']]],
          ['Type the head noun: "My grandfather\'s old wooden chair creaks."', ['chair'], 'Grandfather\'s works like a determiner here.', 'Remove "My grandfather\'s old wooden" → chair.'],
          ['Type the head noun: "The children in the joint family play together."', ['children'], 'Remove "in the joint family".', 'The children play — the phrase only tells us which children.', [['family', '"family" is inside the phrase "in the joint family".']]],
          ['Type the head noun: "Those beautiful photos of our wedding are in the album."', ['photos'], 'The verb "are" is plural.', 'Remove "Those beautiful" and "of our wedding" → photos.', [['wedding', '"of our wedding" only describes which photos.']]],
          ['Type the head noun: "A bowl of hot rice and dal is ready."', ['bowl'], 'One thing is ready.', '"of hot rice and dal" describes the bowl; "is" agrees with bowl.'],
        ]),
        mcq('phrase-clause', 'A clause has a subject AND a finite verb; a phrase does not.', [
          ['Which of these is a phrase?', 'under the neem tree', ['when grandmother sang', 'because the bus was late', 'if you call me'], 'Look for a group with no verb.', '"under the neem tree" has no subject or verb; the others do.'],
          ['Which of these is a clause?', 'after my father returned', ['after a long day', 'with great care', 'very slowly indeed'], 'Find a subject + verb.', '"my father" is the subject and "returned" the verb.'],
          ['"very proud of her son" is…', 'an adjective phrase', ['a noun phrase', 'a clause', 'a verb phrase'], 'The head word is "proud".', 'The main word "proud" is an adjective, so it is an adjective phrase.'],
          ['"has been waiting" is…', 'a verb phrase', ['a noun phrase', 'a prepositional phrase', 'a clause'], 'Helping verbs + main verb.', 'Auxiliaries + main verb make a verb phrase.'],
          ['"quite slowly" is…', 'an adverb phrase', ['an adjective phrase', 'a noun phrase', 'a clause'], 'The head word "slowly" tells how.', 'The head is the adverb "slowly".'],
          ['Choose the correct verb: "The box of old letters ___ in the cupboard."', 'is', ['are', 'were', 'have'], 'Find the head noun first.', 'The head is "box" (singular), so the verb is "is".', [['are', '"letters" is inside "of old letters"; the head "box" is singular.']]],
        ], 2),
        orderT('build', ['Determiner first, then adjectives, then the noun, then the phrase.', 'Opinion comes before age and colour.'], [
          ['Arrange to make a correct noun phrase.', ['a', 'beautiful', 'old', 'red', 'saree', 'from Pochampally'], 'Determiner → opinion → age → colour → noun → prepositional phrase.'],
          ['Arrange to make a correct noun phrase.', ['my', 'kind', 'elderly', 'neighbour', 'with a walking stick'], 'Determiner → opinion → age → noun → phrase.'],
          ['Arrange to make a correct noun phrase.', ['those', 'two', 'small', 'brown', 'puppies', 'in the yard'], 'Determiner → number → size → colour → noun → phrase.'],
          ['Arrange to make a correct noun phrase.', ['the', 'lovely', 'little', 'wooden', 'cradle', 'of my baby brother'], 'Determiner → opinion → size → material → noun → phrase.'],
        ], 2),
      ],
    },
    {
      id: 'ts8.en.essay.write', title: 'Writing a paragraph and short essay on types of families', prereqs: [],
      intro: [
        h('One idea, well developed'),
        p('A good paragraph develops ONE main idea. A short essay links three to five such paragraphs: an introduction, a body and a conclusion. In this unit you write about families — nuclear, joint, extended or single-parent.'),
        def('Topic sentence', 'The first sentence of a paragraph that states its main idea.'),
        def('Supporting sentences', 'Sentences that explain the topic sentence with reasons, details and examples.'),
        def('Concluding sentence', 'A last sentence that sums up or gives a final thought.'),
        h('Steps to write'),
        stepsB(
          'Brainstorm: list ideas — kinds of families, benefits, difficulties, an example.',
          'Group the ideas: one group per paragraph.',
          'Write a clear topic sentence for each paragraph.',
          'Add supporting sentences with linkers: firstly, moreover, for example, however, on the other hand.',
          'Conclude: sum up and give your own opinion.',
          'Edit: check spelling, tenses, subject–verb agreement and punctuation.',
        ),
        h('Model paragraph (written for WonderLab)'),
        p('A joint family has many advantages. Firstly, children grow up surrounded by the love of grandparents, uncles and aunts. Moreover, household work and expenses are shared, so no one person carries the whole load. For example, when a parent falls ill, other adults can look after the children. However, living together also needs patience and a spirit of adjustment. On the whole, a joint family teaches us to care for one another.'),
        keys('One paragraph = one idea.', 'Use linkers to move smoothly.', 'Give at least one example.', 'Use the present tense for general truths.'),
        remember('Do not begin a new idea in the middle of a paragraph. Start a new paragraph instead.'),
      ],
      examples: [
        ex('Write a topic sentence for a paragraph about nuclear families.', ['The topic sentence states the main idea.', 'Keep it general — details come later.'], 'Nuclear families have become common in towns and cities.'),
        ex('Which linker fits? "Joint families share expenses. ___, they offer company to the elderly."', ['The second sentence adds another advantage.', 'An adding linker is needed.'], 'Moreover (also accepted: In addition, Besides)'),
      ],
      practice: [
        orderT('para', ['Topic sentence first.', 'Example after the reason; conclusion last.'], [
          ['Arrange the sentences into a paragraph.', ['Nuclear families are common in cities today.', 'Many parents move to towns for work.', 'For example, my uncle moved from his village to Hyderabad for a job.', 'Such families enjoy privacy but may miss the company of elders.', 'Each kind of family has its own strengths.'], 'Topic → reason → example → evaluation → conclusion.'],
          ['Arrange the parts of a short essay.', ['Title', 'Introduction stating the topic', 'Body paragraph on benefits', 'Body paragraph on difficulties', 'Conclusion with your opinion'], 'Title → introduction → body → conclusion.'],
        ]),
        mcq('features', 'Think of how paragraphs are built.', [
          ['The sentence that states the main idea of a paragraph is the…', 'topic sentence', ['concluding sentence', 'supporting sentence', 'title'], 'It usually comes first.', 'The topic sentence announces what the paragraph is about.'],
          ['Which linker shows a contrast?', 'However', ['Moreover', 'Firstly', 'For example'], 'Contrast = the opposite side.', '"However" introduces an opposite point.'],
          ['Which linker introduces an example?', 'For instance', ['On the other hand', 'In conclusion', 'Nevertheless'], 'An example is an instance.', '"For instance" means "for example".'],
          ['Which sentence is best as a conclusion?', 'On the whole, every family grows stronger when its members care for one another.', ['My grandmother is seventy years old.', 'Firstly, joint families share expenses.', 'For example, my cousin lives with us.'], 'A conclusion sums up.', 'It gives a final, general thought rather than a new detail.'],
          ['A paragraph should develop…', 'one main idea', ['as many ideas as possible', 'only examples', 'only dialogue'], 'Unity is the key.', 'A paragraph has unity — one main idea.'],
          ['Which tense suits general statements about families?', 'Simple present', ['Past perfect', 'Future continuous', 'Past continuous'], 'General truths.', 'General truths are written in the simple present.'],
        ]),
        matchT('types', 'type of family with its description', [
          ['Nuclear family', 'Parents and their children only'], ['Joint family', 'Several generations sharing one home'], ['Single-parent family', 'Children brought up by one parent'], ['Extended family', 'Relatives beyond parents and children, like aunts and cousins'], ['Childless couple', 'A married couple without children'],
        ], ['Think of who lives in the home.', 'Joint = generations together.']),
      ],
    },
  ],
};

// =====================================================================================
// Unit 2 — Social Issues
// =====================================================================================
const u2: USpec = {
  id: 'ts8.en.u2', subject: 'english', title: 'Unit 2 — Social Issues', source: src(2),
  note: 'Reading C (Reaching the Unreached) is treated at theme level only; teachers should add its specific details from the textbook.',
  objectives: [
    {
      id: 'ts8.en.oliver.read', title: 'Oliver Asks for More and The Cry of Children', prereqs: [],
      intro: [
        h('Childhood without care'),
        photo('🥣', 'A single bowl of thin porridge — the daily meal of hungry orphans in a nineteenth-century English workhouse.'),
        p('Unit 2 is about children who suffer because society neglects them. A. Oliver Asks for More is an episode from Oliver Twist (1838), a novel by Charles Dickens. B. The Cry of Children is based on a poem by Elizabeth Barrett Browning about child labour. C. Reaching the Unreached is about efforts to bring help and education to people who are left out.'),
        h('Reading A in brief (our summary)'),
        p('Oliver is an orphan brought up in a workhouse — a harsh institution for the poor. The boys there are given only a small bowl of watery gruel at each meal and are always starving. After months of hunger, the boys draw lots to decide who will ask the master for a second helping, and the lot falls on Oliver. After supper he walks up, bowl in hand, and asks for more. The master is shocked and strikes him; Mr Bumble, the beadle, rushes to tell the board of gentlemen who run the workhouse. They are outraged, lock Oliver up alone, and put up a notice offering money to anyone who will take the boy away.'),
        def('Workhouse', 'A place in old England where very poor people lived and worked in exchange for food and shelter, often in cruel conditions.'),
        def('Irony', 'Saying or showing the opposite of what is meant. Dickens calls the board "wise" and "kind" while showing their cruelty — this is irony that criticises them.'),
        h('Reading B in brief'),
        p('Browning\'s poem contrasts happy young creatures in nature — lambs, birds, flowers — with children who weep while everyone else is joyful. These children work long hours in mines and factories and are too tired even to play. The poem is a protest that asks the nation to hear their cry.'),
        keys('Theme: cruelty to and exploitation of children.', 'Dickens uses irony and humour to attack the system.', 'Browning uses contrast and emotional appeal.', 'Link to today: the Right to Education Act and laws against child labour.'),
        remember('Oliver does not ask for more out of greed. He is driven by hunger and pushed forward by the other boys. That is why the adults\' anger seems so unjust.'),
      ],
      examples: [
        ex('Why did Oliver ask for more?', ['The boys were starving on tiny meals.', 'They drew lots, and Oliver was chosen.'], 'Because he and the other boys were desperately hungry, and the lot to ask fell on him.'),
        ex('How does Browning make the readers feel the children\'s misery?', ['She shows happy lambs, birds and flowers.', 'Against them she places weeping, tired children.', 'The contrast makes their sorrow stand out.'], 'By contrasting the joy of young things in nature with the tears of working children.'),
      ],
      practice: [
        mcq('understand', 'Go back to the summaries.', [
          ['Where did Oliver live?', 'In a workhouse', ['In a palace', 'In a boarding school', 'On a farm with his parents'], 'He was a poor orphan.', 'Oliver was raised in a workhouse for the poor.'],
          ['How was Oliver chosen to ask for more?', 'The boys drew lots', ['The master picked him', 'He was the eldest', 'He volunteered to be brave'], 'It was decided by chance.', 'Drawing lots is choosing by chance; it fell on Oliver.'],
          ['How did the board react to Oliver\'s request?', 'They were outraged and punished him', ['They gave all boys more food', 'They praised his courage', 'They sent him to school'], 'Their reaction was cruel.', 'They locked him up and offered money to anyone who would take him.'],
          ['What social issue does The Cry of Children protest against?', 'Child labour', ['Pollution', 'Traffic accidents', 'Bad roads'], 'Where do these children spend their days?', 'The children are made to work in mines and factories.'],
          ['What device does Browning mainly use?', 'Contrast between happy nature and suffering children', ['A detective plot', 'Comic dialogue', 'Scientific data'], 'Lambs and birds versus weeping children.', 'The contrast heightens the children\'s misery.'],
          ['When Dickens calls the cruel board "wise", he is using…', 'irony', ['a simile', 'alliteration', 'onomatopoeia'], 'He says the opposite of what he means.', 'Praising the cruel as wise is irony.'],
        ]),
        orderT('plot', ['Hunger comes first.', 'The punishment comes last.'], [
          ['Put the events of Oliver Asks for More in order.', ['The boys suffer months of hunger', 'They draw lots, and Oliver is chosen', 'Oliver asks the master for more', 'Mr Bumble reports to the board', 'Oliver is locked up and a notice is put up about him'], 'Cause → decision → action → report → punishment.'],
        ]),
        matchT('who', 'person or thing with its role', [
          ['Oliver', 'The hungry orphan who asks for more'], ['The master', 'Serves the gruel and strikes Oliver'], ['Mr Bumble', 'The beadle who reports to the board'], ['The board', 'Gentlemen who run the workhouse'], ['Gruel', 'Thin, watery porridge'], ['Workhouse', 'Harsh institution for the poor'],
        ], ['Recall each one\'s role in the episode.', 'Two items are things, not people.']),
      ],
    },
    {
      id: 'ts8.en.compound.adj', title: 'Compound adjectives', prereqs: [],
      intro: [
        h('Two words, one adjective'),
        p('A compound adjective is made of two or more words joined, usually by a hyphen, to describe a noun: a half-starved boy, a heart-breaking cry, a ten-year-old child.'),
        keys(
          'number + noun: a five-rupee coin, a two-day trip',
          'adjective + noun + -ed: a kind-hearted woman, a blue-eyed baby',
          'adverb/adjective + past participle: a well-known writer, a badly-paid worker',
          'noun + present participle: a heart-breaking story, a time-consuming job',
          'adjective + present participle: a good-looking boy, a long-lasting effect',
        ),
        h('Method: forming a compound adjective'),
        stepsB(
          'Turn the description into a short phrase: "a boy who is ten years old".',
          'Pick the key words: ten + year + old.',
          'Join them with hyphens and put them BEFORE the noun: a ten-year-old boy.',
          'Make the noun part singular: ten-year-old (not ten-years-old).',
        ),
        remember('No plural inside a compound adjective: a three-hour exam, not a three-hours exam.'),
        tip('After the noun, hyphens are usually dropped: "The boy is ten years old." but "a ten-year-old boy".'),
      ],
      examples: [
        ex('Make a compound adjective: "a journey that takes two days"', ['Key words: two + day.', 'Singular noun inside the compound.', 'Hyphen and place before the noun.'], 'a two-day journey'),
        ex('Make a compound adjective: "a man who has a kind heart"', ['adjective + noun + -ed', 'kind + heart + ed'], 'a kind-hearted man'),
      ],
      practice: [
        typed('form', 'Join the key words with hyphens; keep any noun singular.', [
          ['Make a compound adjective: "a girl who is twelve years old" → a ___ girl', ['twelve-year-old'], 'number + year + old', 'twelve-year-old — no s on year.', [['twelve-years-old', 'No plural inside a compound adjective: twelve-year-old.'], ['twelve year old', 'Join the words with hyphens: twelve-year-old.']]],
          ['Make a compound adjective: "a note worth fifty rupees" → a ___ note', ['fifty-rupee'], 'number + noun, singular', 'fifty-rupee — the noun stays singular.', [['fifty-rupees', 'Singular inside the compound: fifty-rupee.']]],
          ['Make a compound adjective: "a story that breaks your heart" → a ___ story', ['heart-breaking'], 'noun + -ing', 'heart + breaking = heart-breaking.'],
          ['Make a compound adjective: "a writer who is known well" → a ___ writer', ['well-known'], 'adverb + past participle', 'well + known = well-known.'],
          ['Make a compound adjective: "a man with a kind heart" → a ___ man', ['kind-hearted'], 'adjective + noun + -ed', 'kind + heart + ed = kind-hearted.'],
          ['Make a compound adjective: "a task that consumes much time" → a ___ task', ['time-consuming'], 'noun + -ing', 'time + consuming = time-consuming.'],
          ['Make a compound adjective: "a child who is half starved" → a ___ child', ['half-starved'], 'half + past participle', 'half + starved = half-starved.'],
        ]),
        mcq('correct', 'Check hyphens and singular nouns.', [
          ['Choose the correct phrase.', 'a three-hour exam', ['a three-hours exam', 'a three hours exam', 'a three-hours\' exam'], 'No plural inside the compound.', 'Number + singular noun: three-hour.'],
          ['Choose the correct phrase.', 'a well-dressed man', ['a well-dress man', 'a dressed-well man', 'a well-dressing man'], 'adverb + past participle', 'well + dressed (past participle) = well-dressed.'],
          ['Which sentence uses a compound adjective correctly?', 'She is a hard-working farmer.', ['She is a hard-worked farmer.', 'She is a working-hard farmer.', 'She is a hardly-working farmer.'], 'Adjective + present participle.', 'hard + working = hard-working.'],
          ['Which sentence is correct?', 'My brother is ten years old.', ['My brother is ten-years-old.', 'My brother is a ten-years-old.', 'My brother is ten year old boy.'], 'After the verb, the phrase is not a compound adjective.', 'Before a noun: a ten-year-old boy; after "is": ten years old.'],
          ['"A ___ cry" (one that breaks the heart) — choose the word.', 'heart-rending', ['heart-rent', 'hearted-rending', 'rending-heart'], 'noun + present participle', 'heart + rending = heart-rending.'],
        ], 2),
        matchT('meaning', 'compound adjective with its meaning', [
          ['open-minded', 'willing to consider new ideas'], ['short-tempered', 'easily angered'], ['broken-hearted', 'very sad'], ['far-reaching', 'having wide effects'], ['old-fashioned', 'no longer in style'], ['self-confident', 'sure of one\'s own abilities'],
        ], ['Break each into its two parts.', 'Short temper = quick anger.']),
      ],
    },
    {
      id: 'ts8.en.qtag.grammar', title: 'Yes/No questions and question tags', prereqs: [],
      intro: [
        h('Asking questions that need yes or no'),
        p('A yes/no question begins with an auxiliary (helping) verb: is, are, was, were, has, have, can, will, should, do, does, did… The auxiliary comes BEFORE the subject.'),
        stepsB(
          'Find the auxiliary in the statement: "Oliver is hungry." → is.',
          'Move it before the subject: "Is Oliver hungry?"',
          'If there is no auxiliary, use do / does / did and put the main verb in its base form: "The boys ate gruel." → "Did the boys eat gruel?"',
          'End with a question mark.',
        ),
        h('Question tags'),
        p('A question tag is a short question added to the end of a statement to check or confirm: "You are coming, aren\'t you?"'),
        stepsB(
          'Find the auxiliary in the statement (or use do/does/did).',
          'Positive statement → negative tag; negative statement → positive tag.',
          'Use the same auxiliary and the matching pronoun for the subject.',
          'Put a comma before the tag and a question mark after it.',
        ),
        keys(
          '"I am late, aren\'t I?" (special form)',
          '"Let\'s go, shall we?"',
          'Imperative: "Close the door, will you?"',
          'Words like never, hardly, nobody, no make the statement negative → positive tag: "He never complains, does he?"',
          '"There is a park, isn\'t there?"; "Everyone came, didn\'t they?"',
        ),
        remember('Match the auxiliary: "She can swim, can\'t she?" — not "isn\'t she?"'),
      ],
      examples: [
        ex('Add a question tag: "The boys were hungry"', ['Auxiliary: were. Statement is positive.', 'So the tag is negative: weren\'t.', 'Pronoun for "the boys": they.'], 'The boys were hungry, weren\'t they?'),
        ex('Add a question tag: "Oliver asked for more"', ['No auxiliary: past simple → did.', 'Positive statement → negative tag.'], 'Oliver asked for more, didn\'t he?'),
        ex('Make a yes/no question: "She plays kho-kho."', ['No auxiliary; present simple with "she" → does.', 'Base form of the verb: play.'], 'Does she play kho-kho?'),
      ],
      practice: [
        typed('tag', 'Positive → negative tag; negative → positive tag. Same auxiliary, matching pronoun.', [
          ['Add the tag: "You are from Khammam, ___?"', ['aren\'t you', 'arent you'], 'Auxiliary: are (positive).', 'Positive with "are" → aren\'t you.'],
          ['Add the tag: "She can speak Urdu, ___?"', ['can\'t she', 'cant she'], 'Auxiliary: can.', 'can → can\'t she.', [['isn\'t she', 'Use the same auxiliary, can: can\'t she.']]],
          ['Add the tag: "They didn\'t come, ___?"', ['did they'], 'The statement is negative.', 'Negative with did → positive tag: did they.'],
          ['Add the tag: "Ravi plays the flute, ___?"', ['doesn\'t he', 'doesnt he'], 'No auxiliary; present simple with he.', 'plays → does → doesn\'t he.', [['isn\'t he', 'There is no "is" in the statement; use does: doesn\'t he.']]],
          ['Add the tag: "I am your friend, ___?"', ['aren\'t i', 'arent i'], 'Special form for "I am".', '"I am…" takes "aren\'t I?"', [['amn\'t i', '"amn\'t" is not used in standard English; say aren\'t I.']]],
          ['Add the tag: "Let\'s start the game, ___?"', ['shall we'], 'Let\'s = let us.', 'Suggestions with Let\'s take "shall we?"'],
          ['Add the tag: "He never tells lies, ___?"', ['does he'], '"never" makes the statement negative.', 'Negative meaning → positive tag: does he.', [['doesn\'t he', '"never" already makes it negative, so the tag must be positive.']]],
          ['Add the tag: "There is a library in your school, ___?"', ['isn\'t there', 'isnt there'], 'Repeat "there" in the tag.', '"There is…" → isn\'t there.'],
        ]),
        mcq('yesno', 'Auxiliary first; use do/does/did if there is none.', [
          ['Choose the correct yes/no question for "The workers are tired."', 'Are the workers tired?', ['Do the workers are tired?', 'The workers are tired?', 'Is the workers tired?'], 'Move the auxiliary to the front.', '"are" moves before the subject.'],
          ['Choose the correct question for "Meena went to Warangal."', 'Did Meena go to Warangal?', ['Did Meena went to Warangal?', 'Does Meena went to Warangal?', 'Went Meena to Warangal?'], 'Use did + base form.', 'After "did", the verb goes back to its base form: go.', [['Did Meena went to Warangal?', 'After "did" use the base form "go", not "went".']]],
          ['Choose the correct question for "He has finished his homework."', 'Has he finished his homework?', ['Does he has finished his homework?', 'Did he finished his homework?', 'Is he finished his homework?'], 'The auxiliary is "has".', 'Move "has" to the front.'],
          ['Choose the correct question for "Children like stories."', 'Do children like stories?', ['Does children like stories?', 'Are children like stories?', 'Children do like stories?'], 'Plural subject, present simple.', 'Plural subject → do + base verb.'],
          ['Choose the correct tag: "Close the window, ___?"', 'will you', ['don\'t you', 'shall we', 'isn\'t it'], 'It is a request (imperative).', 'Imperatives take "will you?"'],
          ['Choose the correct tag: "Nobody came to the meeting, ___?"', 'did they', ['didn\'t they', 'did he', 'didn\'t he'], '"Nobody" is negative; it takes "they".', 'Negative statement → positive tag; nobody/everyone → they.'],
        ], 2),
        tapT('spot', 'Tap every sentence with a CORRECT question tag.', [
          ['It is hot today, isn\'t it?', true], ['You haven\'t eaten, have you?', true], ['She will help us, won\'t she?', true], ['We should leave now, shouldn\'t we?', true],
          ['He likes mangoes, isn\'t it?', false], ['They were late, wasn\'t they?', false], ['You can swim, don\'t you?', false], ['She doesn\'t sing, doesn\'t she?', false],
        ], ['Check the auxiliary and the pronoun.', 'Check that positive and negative are opposite.'], 'A correct tag uses the same auxiliary, a matching pronoun, and the opposite polarity.'),
      ],
    },
    {
      id: 'ts8.en.diary.write', title: 'Writing a diary entry', prereqs: [],
      intro: [
        h('Talking to yourself on paper'),
        p('A diary is a personal record of the day\'s events and, even more, of your feelings and thoughts about them. In the exam you may be asked to write a diary entry as yourself or as a character — for example, as Oliver on the night he was locked up.'),
        h('Format'),
        stepsB(
          'Date (and day) at the top left; time is optional.',
          'Optional greeting: "Dear Diary,"',
          'Body: what happened (past tense), how you felt and why, what you learnt or hope for.',
          'Close with your name or initials.',
        ),
        keys('First person: I, me, my.', 'Past tense for the day\'s events; present tense for present feelings.', 'Informal, honest and reflective; show emotions.', 'Usually 100–150 words.'),
        h('Model entry (written for WonderLab)'),
        p('Monday, 10 November 2026, 9 p.m. Dear Diary, Today at the bus stop I saw a boy of about my age selling tea instead of going to school. He was laughing with the customers, but his eyes looked tired. I gave him my old storybook and he smiled. I feel sad that he has to work, and grateful that I can study. Tomorrow I will ask our teacher how we can help such children. — Kavya'),
        remember('A diary entry is not a story for others. Write about your own feelings — "I felt…", "I wondered…", "I wish…".'),
        tip('Note-making (study skills): when you read a passage, write the title, then main points as short numbered headings with sub-points, using abbreviations like govt. or approx.'),
      ],
      examples: [
        ex('Write the opening line of a diary entry as Oliver on the night he was locked up.', ['Start with date/day and "Dear Diary".', 'First person, past tense, show feeling.'], 'Dear Diary, Tonight I sit alone in a dark room, and my stomach still aches with hunger — all because I asked for a little more.'),
        ex('Which of these is NOT part of a diary entry: date, feelings, receiver\'s address, writer\'s name?', ['A diary is written to oneself.', 'There is no receiver.'], 'The receiver\'s address.'),
      ],
      practice: [
        mcq('features', 'A diary is personal and written to yourself.', [
          ['A diary entry is written in…', 'the first person', ['the third person', 'the second person only', 'the passive voice only'], 'It is about you.', 'Diaries use I / me / my.'],
          ['What comes at the top of a diary entry?', 'The date (and day)', ['The receiver\'s address', 'A headline', 'Yours faithfully'], 'Diaries are organised by days.', 'Each entry is dated.'],
          ['Which sentence best suits a diary entry?', 'I felt proud when my speech made everyone clap.', ['The committee will meet at 10 a.m.', 'Students are hereby informed that…', 'Sir, I beg to state that…'], 'Look for personal feeling.', 'Diary entries are personal and emotional; the others are formal.'],
          ['Which tense is used for the events of the day?', 'Simple past', ['Future perfect', 'Future simple', 'Present perfect continuous'], 'The events have already happened.', 'Today\'s events are narrated in the past tense.'],
          ['The tone of a diary is usually…', 'informal and reflective', ['formal and official', 'commanding', 'advertising'], 'You write to yourself.', 'A diary is personal, so the tone is informal and thoughtful.'],
        ]),
        orderT('parts', ['Date first.', 'Your name comes last.'], [
          ['Arrange the parts of a diary entry.', ['Date and day', 'Dear Diary,', 'What happened today', 'How I felt about it', 'What I plan or hope for', 'Name / initials'], 'Date → greeting → events → feelings → plans → name.'],
          ['Arrange these lines of a diary entry.', ['Saturday, 15 November 2026', 'Dear Diary,', 'This morning our class visited an old-age home in Siddipet.', 'I was moved when an old man held my hand and would not let go.', 'I want to visit again next month with my guitar.', '— Arjun'], 'Date, greeting, event, feeling, plan, name.'],
        ]),
        matchT('notes', 'note-making term with its meaning', [
          ['Heading', 'The title that tells what the notes are about'], ['Sub-heading', 'A main point numbered under the heading'], ['Sub-point', 'A detail written under a main point'], ['Abbreviation', 'A short form such as govt. or approx.'], ['Key', 'A list explaining the abbreviations used'],
        ], ['Notes go from general to specific.', 'A key explains short forms.']),
      ],
    },
  ],
};

// =====================================================================================
// Unit 3 — Humanity
// =====================================================================================
const u3: USpec = {
  id: 'ts8.en.u3', subject: 'english', title: 'Unit 3 — Humanity', source: src(3),
  note: 'Reading C (The Garden Within) is treated at theme level only; teachers should add its details from the textbook.',
  objectives: [
    {
      id: 'ts8.en.giant.read', title: 'The Selfish Giant: a heart that learns to share', prereqs: [],
      intro: [
        h('A fairy tale turned into a play'),
        photo('🌸', 'A walled garden stuck in winter — until children creep back in and spring follows them.'),
        p('Readings A and B present Oscar Wilde\'s fairy tale The Selfish Giant (1888) as a one-act play in two parts. Reading C, The Garden Within, is a poem that turns the idea of a garden inward — towards the kindness we grow in our own hearts.'),
        h('The story in brief (our summary)'),
        p('Every afternoon, children play in the Giant\'s large, lovely garden full of flowers, peach trees and singing birds. One day the Giant returns from a long visit to a friend, the Cornish ogre. Angry to find children there, he drives them out, builds a high wall and puts up a notice warning trespassers away. Spring comes to the whole country, but not to his garden: Snow, Frost, the North Wind and Hail stay there all year.'),
        p('One morning the Giant hears a bird singing. The children have crept in through a hole in the wall and are sitting in the trees, which have burst into blossom. Only in one corner is it still winter, where a tiny boy cannot reach the branches. The Giant\'s heart melts. He lifts the boy into the tree, which blossoms at once, and he knocks down the wall. The garden becomes the children\'s playground. Years later, when the Giant is old, the little boy returns, bearing wounds on his hands and feet. He says they are the wounds of love and invites the Giant to his own garden, Paradise. That afternoon the children find the Giant lying dead under the tree, covered with white blossoms.'),
        def('Allegory', 'A story in which characters and events stand for moral or spiritual ideas. Winter stands for selfishness; spring for love and sharing.'),
        def('Personification', 'Giving human qualities to non-human things. In the play, Snow, Frost, the North Wind and Hail act and speak like people.'),
        keys('Theme: selfishness shuts out joy; sharing and love bring it back.', 'Turning point: the Giant sees the little boy who cannot climb and feels pity.', 'The little boy is a Christ-like figure — the wounds and Paradise give the story a spiritual ending.', 'Message of the unit: humanity means caring for others, especially the small and helpless.'),
        remember('The Giant is not simply wicked. He is selfish, then sorry, then loving. Describe his CHANGE when you write about his character.'),
      ],
      examples: [
        ex('Why did spring not come to the Giant\'s garden?', ['Spring followed the children.', 'The Giant had shut the children out.', 'In the allegory, selfishness keeps out joy.'], 'Because the selfish Giant had driven the children away; without them there was no joy, so winter stayed.'),
        ex('What made the Giant change his heart?', ['He saw the trees blossom with children in them.', 'One tiny boy in the corner could not climb and was crying.', 'He felt pity and realised his selfishness.'], 'The sight of the little boy who could not climb the tree melted his heart.'),
      ],
      practice: [
        mcq('understand', 'Go back to the summary.', [
          ['Why did the Giant build a high wall?', 'To keep the children out of his garden', ['To protect the garden from floods', 'To keep his animals in', 'To hide treasure'], 'He was angry at the children.', 'The selfish Giant wanted the garden only for himself.'],
          ['Which visitors stayed in the garden all year?', 'Snow, Frost, the North Wind and Hail', ['Spring and Summer', 'The birds and flowers', 'The children and their parents'], 'All of them are wintry.', 'Winter visitors stayed because spring would not come.'],
          ['What did the Giant do after his heart melted?', 'He lifted the little boy into the tree and knocked down the wall', ['He built the wall higher', 'He left the country', 'He sold the garden'], 'He put things right.', 'He helped the boy and opened the garden to all children.'],
          ['What do winter and spring stand for in the story?', 'Selfishness and love', ['Poverty and wealth', 'Night and day', 'Youth and age'], 'It is an allegory.', 'Winter reflects the Giant\'s cold, selfish heart; spring the warmth of love and sharing.'],
          ['Snow and Frost speaking like people is an example of…', 'personification', ['simile', 'rhyme', 'irony'], 'Non-human things given human qualities.', 'This is personification.'],
          ['How does the story end?', 'The Giant dies peacefully under the blossoming tree', ['The Giant builds a new wall', 'The children leave forever', 'The little boy becomes a giant'], 'The boy invites him to Paradise.', 'He is found dead under the tree, covered in white blossoms — a peaceful, happy end.'],
        ]),
        orderT('plot', ['The children play before the Giant returns.', 'The Giant dies at the very end.'], [
          ['Put the events of The Selfish Giant in order.', ['Children play in the Giant\'s garden', 'The Giant returns and builds a wall', 'Winter stays in the garden all year', 'The Giant lifts the little boy into a tree', 'The old Giant is invited to Paradise'], 'Joy → selfishness → punishment → change → reward.'],
          ['Arrange the stages of the Giant\'s character.', ['Selfish and angry', 'Puzzled and lonely in the long winter', 'Moved to pity by the little boy', 'Generous and loving', 'At peace in old age'], 'His heart changes step by step.'],
        ]),
        matchT('symbols', 'thing in the story with what it stands for', [
          ['The high wall', 'Selfishness that shuts others out'], ['Winter', 'A cold, unloving heart'], ['Spring and blossoms', 'Love and joy'], ['The little boy', 'Divine love'], ['The wounds', 'The price of love'], ['Paradise', 'The reward of a loving heart'],
        ], ['Think of the story as an allegory.', 'The ending is spiritual.']),
      ],
    },
    {
      id: 'ts8.en.u3vocab.phrasal', title: 'Phrasal verbs', prereqs: [],
      intro: [
        h('A verb plus a small word'),
        p('A phrasal verb is a verb followed by an adverb or preposition (a particle) that together have a special meaning. The meaning often cannot be guessed from the two words separately: "give up" means stop, not "give" + "up".'),
        keys('knock down — destroy (a wall, a building)', 'drive away — force to leave', 'creep in — enter quietly', 'look after — take care of', 'turn away — refuse to help or let in', 'make up for — compensate for', 'put up — fix or display (a notice)', 'come back — return'),
        h('Method: learning a phrasal verb'),
        stepsB(
          'Read the sentence and find the verb + particle.',
          'Guess the meaning from context, not from the separate words.',
          'Check whether an object can go in the middle: "knock the wall down" ✓; "look the baby after" ✗.',
          'Use it in a sentence of your own.',
        ),
        remember('Some phrasal verbs can be separated (put the notice up), others cannot (look after the child). If the object is a pronoun, separable verbs MUST be split: "knock it down", not "knock down it".'),
      ],
      examples: [
        ex('Replace with a phrasal verb: "The Giant destroyed the wall."', ['destroy (a wall) = knock down', 'Keep the past tense.'], 'The Giant knocked down the wall.'),
        ex('Correct the sentence: "The notice was there, so he took down it."', ['take down is separable.', 'With a pronoun object, split it.'], 'He took it down.'),
      ],
      practice: [
        mcq('meaning', 'Read the whole sentence for clues.', [
          ['"The children crept in through a hole." Crept in means…', 'entered quietly', ['ran out loudly', 'climbed up', 'fell asleep'], 'They did not want to be seen.', 'To creep in is to enter quietly and slowly.'],
          ['"Please look after my plants while I am away." Look after means…', 'take care of', ['search for', 'look behind', 'admire'], 'You water them for me.', 'Look after = take care of.', [['search for', 'That is "look for", a different phrasal verb.']]],
          ['"The Giant drove the children away." Drove away means…', 'forced them to leave', ['gave them a lift', 'welcomed them', 'taught them'], 'He was angry.', 'Drive away = force to go.'],
          ['"She gave up junk food." Gave up means…', 'stopped', ['gave away', 'bought more', 'cooked'], 'She no longer eats it.', 'Give up = stop doing something.'],
          ['"He put up a notice on the gate." Put up means…', 'displayed', ['removed', 'tore', 'read aloud'], 'Notices are fixed on boards.', 'Put up = fix in place for people to see.'],
          ['"No hungry person was turned away from the temple." Turned away means…', 'refused entry or help', ['welcomed warmly', 'turned around', 'fed twice'], 'The sentence praises kindness.', 'Turn away = refuse to admit or help.'],
        ]),
        typed('fill', 'Type only the particle (the small word) that completes the phrasal verb.', [
          ['Complete: "The old wall was knocked ___ by the workers." (destroyed)', ['down'], 'Opposite of up.', 'knock down = destroy.'],
          ['Complete: "When will your father come ___ from Delhi?" (return)', ['back'], 'Return = come ___.', 'come back = return.'],
          ['Complete: "The kind woman looks ___ stray dogs." (takes care of)', ['after'], 'take care of = look ___.', 'look after = take care of.', [['for', '"look for" means search.']]],
          ['Complete: "Never give ___ your dreams." (stop trying for)', ['up'], 'Stop = give ___.', 'give up = stop trying.'],
          ['Complete: "He tried to make ___ for his rude words by apologising." (compensate)', ['up'], 'make ___ for = compensate.', 'make up for = compensate.'],
          ['Complete: "The firemen put ___ the fire quickly." (extinguished)', ['out'], 'A fire goes ___.', 'put out = extinguish.'],
        ]),
        tapT('sep', 'Tap every sentence where the phrasal verb is used CORRECTLY.', [
          ['He knocked it down.', true], ['She looked after the baby.', true], ['Please put your bags down.', true], ['They gave it up.', true],
          ['He knocked down it.', false], ['She looked the baby after.', false], ['Please turn off it.', false],
        ], ['A pronoun object goes in the middle of a separable phrasal verb.', '"look after" cannot be split.'], 'Separable verbs must split around a pronoun; inseparable verbs like look after never split.'),
      ],
    },
    {
      id: 'ts8.en.gerund.grammar', title: 'Gerunds', prereqs: [],
      intro: [
        h('An -ing word doing a noun\'s job'),
        p('A gerund is the -ing form of a verb used as a noun. It can be the subject, the object, the complement, or come after a preposition.'),
        keys(
          'Subject: "Sharing makes us happy."',
          'Object: "The children love playing."',
          'After a preposition: "He is fond of gardening." / "Thank you for helping."',
          'Complement: "Her hobby is painting."',
        ),
        def('Present participle', 'The same -ing form used as part of a verb or as an adjective: "The children are playing." "a playing child". This is NOT a gerund.'),
        h('Method: is it a gerund?'),
        stepsB(
          'Find the -ing word.',
          'Ask: is it the name of an activity (a "thing")? Can you replace it with a noun like "it" or "this"?',
          'If yes (subject, object, after a preposition, complement) → gerund.',
          'If it follows am/is/are/was/were to show continuous action, or describes a noun → participle, not gerund.',
        ),
        keys('Verbs followed by a gerund: enjoy, avoid, finish, mind, keep, stop, practise, suggest, deny.', 'After a preposition always use a gerund: "before leaving", "interested in reading".'),
        remember('"I look forward to meeting you" — here "to" is a preposition, so the gerund follows. Not "to meet you".'),
      ],
      examples: [
        ex('Is "swimming" a gerund? "Swimming keeps me fit."', ['Swimming is the subject of "keeps".', 'Replace with "it": It keeps me fit — works.'], 'Yes — a gerund used as the subject.'),
        ex('Is "singing" a gerund? "The girls are singing."', ['"are singing" is a continuous verb.', 'It shows action in progress, not a thing.'], 'No — it is a present participle (part of the verb).'),
        ex('Correct: "She avoided to talk to strangers."', ['avoid is followed by a gerund.'], 'She avoided talking to strangers.'),
      ],
      practice: [
        mcq('identify', 'Ask: is the -ing word the NAME of an activity?', [
          ['In which sentence is the -ing word a gerund?', 'Reading improves your vocabulary.', ['She is reading a novel.', 'The children were reading quietly.', 'He was reading when I called.'], 'Look for -ing used as a subject.', '"Reading" is the subject of "improves" — a gerund.'],
          ['In which sentence is the -ing word a gerund?', 'My grandmother enjoys gardening.', ['My grandmother is gardening now.', 'The smiling grandmother waved at us.', 'Grandmother was gardening all day.'], 'Find -ing as an object.', '"gardening" is the object of "enjoys".'],
          ['"He is good at drawing." The -ing word is a gerund because…', 'it comes after a preposition', ['it shows continuous action', 'it describes a noun', 'it is a main verb'], 'Look at the word before it.', 'After a preposition ("at") the -ing form is a gerund.'],
          ['In "The crying baby slept at last", "crying" is…', 'a participle used as an adjective', ['a gerund used as subject', 'a gerund after a preposition', 'a noun object'], 'It describes the baby.', 'It describes a noun, so it is a participle adjective.'],
          ['Choose the correct sentence.', 'They finished painting the wall.', ['They finished to paint the wall.', 'They finished paint the wall.', 'They finished painted the wall.'], '"finish" takes a gerund.', 'finish + gerund: finished painting.', [['They finished to paint the wall.', '"finish" is followed by a gerund, not "to" + verb.']]],
          ['Choose the correct sentence.', 'I look forward to meeting you.', ['I look forward to meet you.', 'I look forward meeting you.', 'I look forward to met you.'], '"to" here is a preposition.', 'After the preposition "to" in "look forward to", use a gerund.'],
        ], 2),
        typed('form', 'Use the -ing form of the verb in brackets.', [
          ['Fill in: "Thank you for ___ me." (help)', ['helping'], 'After a preposition use a gerund.', 'for + helping.'],
          ['Fill in: "___ is good exercise." (swim)', ['swimming', 'Swimming'], 'Double the m.', 'swim → swimming (subject).', [['swiming', 'Short vowel + one consonant: double it — swimming.']]],
          ['Fill in: "Do you mind ___ the window?" (open)', ['opening'], '"mind" takes a gerund.', 'mind + opening.'],
          ['Fill in: "She is interested in ___ stamps." (collect)', ['collecting'], 'After "in" use a gerund.', 'in + collecting.'],
          ['Fill in: "Please stop ___ noise." (make)', ['making'], 'Drop the e.', 'make → making.', [['makeing', 'Drop the final e: making.']]],
          ['Fill in: "He denied ___ the glass." (break)', ['breaking'], '"deny" takes a gerund.', 'denied breaking.'],
        ]),
        tapT('spot', 'Tap every sentence in which the -ing word is a GERUND.', [
          ['Sharing is caring.', true], ['She practises dancing every day.', true], ['He left without saying goodbye.', true], ['My dream is flying a plane.', true],
          ['The children are laughing.', false], ['Look at that running boy.', false], ['We were waiting for the bus.', false],
        ], ['A gerund names an activity.', 'is/are/were + -ing is a continuous verb, not a gerund.'], 'Gerunds act as subject, object, complement or after a preposition.'),
      ],
    },
    {
      id: 'ts8.en.notice.write', title: 'Writing a notice (and summarising)', prereqs: [],
      intro: [
        h('Short, formal, complete'),
        p('A notice gives brief public information about an event, a rule, a lost item or a change. It is put up on a notice board, so it must be clear at a glance — about 50 words, inside a box.'),
        h('Format'),
        stepsB(
          'Name of the institution (school, colony, club).',
          'The word NOTICE.',
          'Date of issue.',
          'Heading: what the notice is about.',
          'Body: what, when, where, who, how (and whom to contact).',
          'Name and designation of the writer.',
        ),
        h('Model (written for WonderLab)'),
        p('ZPHS Kodad | NOTICE | 18 November 2026 | Food Drive for Flood-Hit Families | The Social Service Club is collecting rice, dal and clothes for families affected by the recent floods. Please bring your donations to Room 5 between 9 a.m. and 12 noon from 20 to 25 November. Every bit helps! | Teja R., Secretary, Social Service Club'),
        keys('Formal, impersonal language; no greetings like "Dear friends".', 'Use the passive or future: "will be held", "are requested".', 'Never forget the date, time and venue of an event.'),
        h('Summarising (study skills)'),
        stepsB('Read the passage and find its main idea.', 'Note the key points; leave out examples, repetitions and details.', 'Write in your own words, in about one-third of the length.', 'Give it a title.'),
        remember('A notice is not a letter: there is no salutation and no "Yours faithfully".'),
      ],
      examples: [
        ex('Write a heading for a notice about a tree-planting drive.', ['A heading is short and tells the topic.'], 'Tree Plantation Drive (also good: Van Mahotsav Celebrations)'),
        ex('Which detail is missing? "A quiz will be held in the school hall. Interested students may give their names to the class teacher."', ['Readers need when.'], 'The date and time of the quiz.'),
      ],
      practice: [
        orderT('parts', ['Institution name first.', 'The writer signs at the end.'], [
          ['Arrange the parts of a notice in order.', ['Name of the institution', 'NOTICE', 'Date of issue', 'Heading', 'Body: what, when, where, who', 'Name and designation of the writer'], 'Institution → NOTICE → date → heading → body → writer.'],
          ['Arrange the lines of this notice.', ['Government High School, Jangaon', 'NOTICE', '3 December 2026', 'Lost: Blue Water Bottle', 'A blue steel water bottle was lost near the playground on 2 December; the finder may return it to the school office.', 'Imran S., Class Monitor, 8-B'], 'Institution, NOTICE, date, heading, body, writer.'],
        ]),
        mcq('features', 'A notice is short, formal and complete.', [
          ['A notice should usually be about…', '50 words', ['500 words', '5 words', '3 pages'], 'It is read at a glance.', 'Notices are brief — about 50 words.'],
          ['Which closing is correct for a notice?', 'Name and designation of the writer', ['Yours lovingly', 'Dear Diary', 'With best wishes, your friend'], 'It ends formally.', 'A notice ends with the writer\'s name and designation.'],
          ['Which sentence suits a notice?', 'All students are requested to assemble in the playground at 8 a.m.', ['Hey friends, come fast!!', 'I was very happy yesterday.', 'Dear Sir, I beg to state that…'], 'Formal and impersonal.', 'Notices use formal, impersonal language.'],
          ['Which detail is ESSENTIAL in an event notice?', 'Date, time and venue', ['The writer\'s favourite colour', 'A long history of the event', 'The receiver\'s address'], 'Readers must know when and where.', 'Event notices must give date, time and venue.'],
          ['A good summary is about…', 'one-third of the original length', ['twice the original length', 'the same length', 'one word'], 'It keeps only key points.', 'A summary shortens the text to about one-third.'],
          ['When summarising, you should leave out…', 'examples and repeated details', ['the main idea', 'the key points', 'the conclusion'], 'Keep the essentials.', 'Summaries drop examples and repetitions.'],
        ]),
        matchT('purpose', 'situation with the best text type', [
          ['Inform all students about a sports meet', 'Notice'], ['Record your feelings after a hard day', 'Diary entry'], ['Tell a friend about your holiday', 'Informal letter'], ['Shorten a long passage to its main points', 'Summary'], ['Explain why joint families are useful', 'Paragraph / essay'],
        ], ['Who is the audience and what is the purpose?', 'Public + brief information = notice.']),
      ],
    },
  ],
};

// =====================================================================================
// Unit 4 — Science and Technology
// =====================================================================================
const u4: USpec = {
  id: 'ts8.en.u4', subject: 'english', title: 'Unit 4 — Science and Technology', source: src(4),
  note: 'Readings B (Preteen Pretext) and C (The Computer Game) are treated at theme level only; teachers should add their details from the textbook.',
  objectives: [
    {
      id: 'ts8.en.funtheyhad.read', title: 'The Fun They Had: school in the future', prereqs: [],
      intro: [
        h('What will school be like in 2157?'),
        photo('🤖', 'A mechanical teacher in a child\'s bedroom — Isaac Asimov\'s picture of school in the far future.'),
        p('A. The Fun They Had is a science-fiction story by Isaac Asimov, first published in 1951. B. Preteen Pretext is a poem and C. The Computer Game is a short play; both look at children\'s lives in a world full of gadgets and screens.'),
        h('Reading A in brief (our summary)'),
        p('The story is set in the year 2157. Eleven-year-old Margie and thirteen-year-old Tommy have never seen a printed book. Tommy finds a very old one in his attic, and the children are amazed that its words stay still instead of moving on a screen. The book is about school long ago, when children went to a special building and were taught by a human teacher, together with other children of their age.'),
        p('Margie studies alone at home with a mechanical teacher — a screen with a slot where she must put her homework and tests. She dislikes it, especially geography. When the machine was giving her poor marks, the County Inspector came and slowed it down. As she sits down for her lesson, she thinks wistfully about the old schools: children laughing, playing and learning together, going home together. She thinks about the fun they had.'),
        def('Science fiction', 'Stories based on imagined scientific or technological developments, often set in the future.'),
        def('Irony', 'Margie thinks old schools were fun — but the readers of 1951 (and today) often grumble about school. What we take for granted, she longs for.'),
        keys('Theme: technology cannot replace human teachers and friendship in learning.', 'Contrast: lonely, mechanical learning vs. shared, human learning.', 'Asimov predicted home screens and personalised learning long before computers were common.', 'Readings B and C: balance between screens and real life.'),
        remember('The story is not against technology; it reminds us that learning is also social and emotional.'),
      ],
      examples: [
        ex('Why was Margie surprised by the book?', ['In her world all reading was on screens.', 'In the book the words did not move and stayed on the page.'], 'Because she had never seen a printed book whose words stayed still on paper.'),
        ex('Explain the title "The Fun They Had".', ['Margie imagines old-time children learning and playing together.', '"They" are the schoolchildren of the past.'], 'It refers to the fun Margie imagines children of the past had by learning together in a real school.'),
      ],
      practice: [
        mcq('understand', 'Go back to the summary.', [
          ['In which year is the story set?', '2157', ['1951', '2057', '2517'], 'More than two centuries after Asimov wrote it.', 'The story is set in 2157.'],
          ['What did Tommy find?', 'A real printed book', ['A mechanical teacher', 'A computer game', 'An old school building'], 'Something Margie\'s grandfather had heard of.', 'He found an old printed book in the attic.'],
          ['Who taught Margie?', 'A mechanical teacher at home', ['Her mother', 'Tommy', 'A human teacher at a school building'], 'It had a slot for homework.', 'Margie learned from a machine in her house.'],
          ['Which subject was Margie doing badly in?', 'Geography', ['Arithmetic only', 'Music', 'Science'], 'The County Inspector adjusted the machine for it.', 'Her geography marks were poor.'],
          ['What does Margie long for at the end?', 'The old schools where children learned together', ['A faster mechanical teacher', 'More homework', 'A holiday from all learning'], 'Read the title.', 'She thinks of the fun children had in old schools.'],
          ['What is the central message of the story?', 'Human company and teachers matter in learning', ['Machines should replace all teachers', 'Books are useless', 'Children should not study geography'], 'What does Margie miss?', 'She misses the shared, human side of school.'],
        ]),
        matchT('who', 'character or thing with its description', [
          ['Margie', 'Eleven-year-old girl who dislikes her mechanical teacher'], ['Tommy', 'Thirteen-year-old boy who finds the old book'], ['The County Inspector', 'Man who adjusts the mechanical teacher'], ['Mechanical teacher', 'Screen with a slot for homework'], ['The old book', 'Printed pages whose words stay still'],
        ], ['Recall each detail from the summary.', 'The book and the machine are things.']),
        orderT('plot', ['The story begins with the discovery.', 'It ends with Margie\'s daydream.'], [
          ['Put the events of The Fun They Had in order.', ['Tommy finds a real book', 'The children read about old schools', 'Margie\'s mother calls her to school', 'Margie sits before the mechanical teacher', 'Margie thinks about the fun old-time children had'], 'Discovery → reading → call to lessons → lesson begins → daydream.'],
        ]),
      ],
    },
    {
      id: 'ts8.en.verbadverb.words', title: 'Verbs with adverbs (collocations)', prereqs: [],
      intro: [
        h('Words that go together'),
        p('Some adverbs naturally go with certain verbs. These pairs are called collocations. Native speakers say "rain heavily", not "rain strongly"; "listen carefully", not "listen hardly".'),
        keys('rain heavily · sleep soundly · whisper softly · shout loudly', 'listen carefully · work hard · smile brightly · sigh deeply', 'apologise sincerely · disagree strongly · drive carefully · run fast', 'Most adverbs of manner = adjective + -ly (careful → carefully).', 'Irregular: good → well, fast → fast, hard → hard.'),
        h('Method'),
        stepsB('Find the verb.', 'Ask "how?" — the adverb answers it.', 'Choose the adverb that collocates naturally with that verb.', 'Place it after the verb (or after the object): "She read the letter slowly."'),
        remember('"hardly" is NOT the adverb of hard. "He works hard" = with effort. "He hardly works" = he almost does not work.'),
      ],
      examples: [
        ex('Choose: "The baby slept ___ (soundly / loudly)."', ['Sleep collocates with deeply or soundly.'], 'soundly'),
        ex('Make the adverb from "happy" and use it: "The children played ___."', ['happy → y changes to i + ly.'], 'happily'),
      ],
      practice: [
        mcq('collocate', 'Which adverb naturally goes with this verb?', [
          ['It rained ___ all night.', 'heavily', ['strongly', 'loudly', 'hardly'], 'Heavy rain.', 'We say "rain heavily".'],
          ['The tired boy slept ___.', 'soundly', ['loudly', 'brightly', 'sharply'], 'A deep sleep.', 'sleep soundly = sleep deeply.'],
          ['"Please listen ___ to the instructions."', 'carefully', ['hardly', 'heavily', 'brightly'], 'With attention.', 'listen carefully.'],
          ['She ___ apologised for her mistake.', 'sincerely', ['heavily', 'loudly', 'fastly'], 'An honest apology.', 'apologise sincerely.', [['fastly', '"fastly" is not a word; the adverb of fast is fast.']]],
          ['The farmers work ___ in the fields.', 'hard', ['hardly', 'heavy', 'hardily'], 'With effort.', '"work hard" = with effort; "hardly" means almost not.', [['hardly', '"hardly" means almost not — the opposite meaning.']]],
          ['The children ___ whispered so as not to wake the baby.', 'softly', ['loudly', 'roughly', 'heavily'], 'A whisper is quiet.', 'whisper softly.'],
        ]),
        typed('form', 'Turn the adjective into an adverb.', [
          ['Adverb of "careful":', ['carefully'], 'Add -ly.', 'careful + ly.'],
          ['Adverb of "happy":', ['happily'], 'y → i, then -ly.', 'happy → happily.', [['happyly', 'Change y to i: happily.']]],
          ['Adverb of "good":', ['well'], 'It is irregular.', 'good → well.', [['goodly', 'The adverb of good is well.']]],
          ['Adverb of "gentle":', ['gently'], 'Drop the e and add -y.', 'gentle → gently.'],
          ['Adverb of "fast":', ['fast'], 'It does not change.', 'fast → fast.', [['fastly', '"fastly" is not a word.']]],
          ['Adverb of "deep" (as in "sigh ___"):', ['deeply'], 'Add -ly.', 'deep → deeply.'],
        ]),
        matchT('pairs', 'verb with the adverb that collocates with it', [
          ['shout', 'loudly'], ['smile', 'brightly'], ['disagree', 'strongly'], ['drive', 'carefully'], ['sigh', 'deeply'], ['sleep', 'soundly'],
        ], ['Say the pair aloud — does it sound natural?', 'A sigh is deep.']),
      ],
    },
    {
      id: 'ts8.en.relative.grammar', title: 'Relative pronouns and relative clauses', prereqs: [],
      intro: [
        h('Joining ideas with who, which, whose, that'),
        p('A relative clause gives more information about a noun. It starts with a relative pronoun: who, whom, whose, which, that — or with where/when.'),
        keys('who — people (subject): the girl who found the book', 'whom — people (object), formal: the teacher whom we admired', 'which — things and animals: the machine which marks tests', 'that — people or things (defining clauses only)', 'whose — possession: the boy whose tablet broke', 'where — places; when — times'),
        h('Method: combining two sentences'),
        stepsB(
          'Find the noun repeated in both sentences (or a pronoun that refers to it).',
          'Choose the relative word: person → who/whom, thing → which/that, possession → whose, place → where.',
          'Delete the repeated noun/pronoun from the second sentence.',
          'Place the clause directly after the noun it describes. Use commas if it only adds extra information about a noun already clear (e.g., a name).',
        ),
        remember('Do not repeat the pronoun: ✗ "The robot which I built it can dance." ✓ "The robot which I built can dance."'),
      ],
      examples: [
        ex('Combine: "I met a scientist. She designs satellites."', ['Common: scientist / she.', 'Person, subject → who.', 'Delete "She".'], 'I met a scientist who designs satellites.'),
        ex('Combine: "This is the boy. His phone was stolen."', ['"His" shows possession.', 'Use whose.'], 'This is the boy whose phone was stolen.'),
      ],
      practice: [
        mcq('choose', 'Person, thing, place or possession?', [
          ['The girl ___ won the science fair is my classmate.', 'who', ['which', 'whose', 'where'], 'A girl is a person.', 'Person as subject → who.'],
          ['This is the laptop ___ my uncle gave me.', 'which', ['who', 'whose', 'whom'], 'A laptop is a thing.', 'Thing → which (or that).'],
          ['The student ___ project broke down cried.', 'whose', ['who', 'which', 'whom'], 'The project belongs to the student.', 'Possession → whose.'],
          ['The lab ___ we do experiments is on the first floor.', 'where', ['which', 'who', 'whose'], 'A lab is a place where something happens.', 'Place → where.'],
          ['Margie, ___ disliked geography, wanted a human teacher.', 'who', ['that', 'which', 'whose'], 'Commas → non-defining.', 'With commas, use who for a person — not that.', [['that', '"That" cannot be used between commas.']]],
          ['The year ___ the story is set is 2157.', 'when', ['where', 'which', 'who'], 'A year is a time.', 'Time → when.'],
        ], 2),
        typed('fill', 'Type one relative word.', [
          ['Fill in: "The robot ___ cleans our floor is noisy."', ['which', 'that'], 'A robot is a thing.', 'Thing → which/that.', [['who', '"who" is for people.']]],
          ['Fill in: "I know a programmer ___ builds apps for farmers."', ['who', 'that'], 'A programmer is a person.', 'Person → who/that.'],
          ['Fill in: "The boy ___ bicycle was stolen went to the police."', ['whose'], 'Possession.', 'whose bicycle.'],
          ['Fill in: "Hyderabad is the city ___ many IT companies have offices."', ['where'], 'A place.', 'Place → where.'],
          ['Fill in: "Tommy, ___ was thirteen, found the book."', ['who'], 'Commas: non-defining.', 'who (that is not allowed with commas).', [['that', 'With commas, use who.']]],
        ]),
        orderT('build', ['Subject first.', 'The relative clause sits right after the noun it describes.'], [
          ['Arrange to make a correct sentence.', ['The app', 'which I downloaded', 'teaches', 'Telugu songs.'], 'Subject + relative clause + verb + object.'],
          ['Arrange to make a correct sentence.', ['The engineer', 'who designed the bridge', 'won', 'an award.'], 'Subject + who-clause + verb + object.'],
          ['Arrange to make a correct sentence.', ['This is', 'the room', 'where Margie', 'had her lessons.'], 'where-clause after "the room".'],
        ], 2),
      ],
    },
    {
      id: 'ts8.en.reply.write', title: 'Writing a reply letter', prereqs: [],
      intro: [
        h('Answering a friend\'s letter'),
        p('A reply letter is an informal letter that responds to a letter you received. It thanks the writer, answers their questions and shares your own news.'),
        h('Format'),
        stepsB(
          'Sender\'s address (top right or left) and date.',
          'Salutation: Dear Kiran,',
          'Opening: thank them for their letter and mention its content.',
          'Body: answer their questions one by one; add your news.',
          'Closing: send greetings to family, ask them to write back.',
          'Subscription: Yours lovingly / Your loving friend, then your name.',
        ),
        h('Model opening (written for WonderLab)'),
        p('Dear Sana, Thank you for your letter. I was thrilled to read that your school now has a robotics lab! You asked whether we use computers in our class. Yes — we have a smart board, and last week we made a short film about water saving…'),
        keys('Informal, friendly tone; contractions are fine.', 'Refer to the friend\'s letter ("You asked…", "I was glad to know…").', 'Paragraph for each idea.'),
        remember('In an informal letter do NOT use "Yours faithfully" — that is for formal letters to people you do not know.'),
        tip('Comparing posters (study skills): look at heading, picture, slogan, information and the target audience. Ask which poster gives the message more clearly.'),
      ],
      examples: [
        ex('Write a suitable opening sentence for a reply to a cousin who wrote about her new tablet.', ['Thank her.', 'Mention the content of her letter.'], 'Thank you for your letter — I was so happy to hear about your new tablet!'),
        ex('Which subscription suits a letter to your friend: "Yours faithfully" or "Your loving friend"?', ['Informal letter → warm subscription.'], 'Your loving friend'),
      ],
      practice: [
        orderT('parts', ['Address and date come first.', 'Your name comes last.'], [
          ['Arrange the parts of a reply letter.', ['Sender\'s address and date', 'Dear Sana,', 'Thanks for her letter', 'Answers to her questions and my news', 'Greetings to her family and a request to write', 'Your loving friend, Diya'], 'Address/date → salutation → thanks → body → closing → subscription.'],
          ['Arrange the paragraphs of a reply letter.', ['Thank you for your letter about your science exhibition.', 'You asked about our school trip — we visited the Birla Planetarium.', 'I also joined the coding club this month.', 'Please convey my regards to uncle and aunty. Write soon!'], 'Thanks → answer → own news → closing.'],
        ]),
        mcq('features', 'Informal letter to a friend.', [
          ['Which salutation suits a reply to a friend?', 'Dear Arjun,', ['Sir,', 'To whom it may concern,', 'Respected Madam,'], 'Friendly letter.', 'Use "Dear" + first name.'],
          ['What should the first paragraph of a reply letter do?', 'Thank the friend and refer to their letter', ['Give your full address again', 'Ask for a job', 'List rules'], 'It is a reply.', 'A reply opens by acknowledging the letter received.'],
          ['Which subscription is right for a reply to your friend?', 'Your loving friend', ['Yours faithfully', 'Yours obediently', 'Thanking you, Sir'], 'Informal letter.', 'Warm subscriptions suit informal letters.', [['Yours faithfully', 'That is for formal letters.']]],
          ['The tone of a reply letter to a friend is…', 'friendly and informal', ['strictly official', 'angry', 'like a notice'], 'You are writing to a friend.', 'Informal letters are warm and friendly.'],
          ['Where is the date written in an informal letter?', 'Below the sender\'s address', ['At the very end', 'In the subject line', 'Nowhere'], 'Top of the letter.', 'The date goes below the sender\'s address.'],
        ]),
        matchT('formats', 'letter part with its example', [
          ['Salutation', 'Dear Priya,'], ['Subscription', 'Yours lovingly,'], ['Opening line', 'Thank you for your letter of 2 November.'], ['Closing line', 'Do write back soon.'], ['Date', '20 November 2026'],
        ], ['Salutation greets; subscription signs off.', 'The closing line comes just before the subscription.']),
      ],
    },
  ],
};

// =====================================================================================
// Unit 5 — Education and Career
// =====================================================================================
const u5: USpec = {
  id: 'ts8.en.u5', subject: 'english', title: 'Unit 5 — Education and Career', source: src(5),
  note: 'The Treasure Within is summarised at the level of its main ideas; Reading C (They Literally Build the Nation) is treated at theme level. Teachers should add specific details from the textbook.',
  objectives: [
    {
      id: 'ts8.en.treasure.read', title: 'The Treasure Within: every child has a hidden talent', prereqs: [],
      intro: [
        h('Finding what you are good at'),
        photo('🏛️', 'Buildings begin as drawings. An architect turns a talent for sketching into a career.'),
        p('Readings A and B, The Treasure Within (Parts I and II), are an interview with Hafeez Contractor, one of India\'s best-known architects. Reading C, They Literally Build the Nation, turns to the workers whose hands actually raise our buildings, roads and dams.'),
        h('The interview in brief (our summary)'),
        p('In the interview the architect looks back on his school days. He was not a model student and did not enjoy learning by rote; marks did not come easily to him. What he loved was drawing, imagining and making things. With the encouragement of people who noticed this talent, he chose architecture and found that it suited him perfectly. Today he designs huge buildings across India.'),
        p('His message for parents and teachers is that every child has a "treasure within" — a special ability. Children should be given freedom to explore, and should not be judged only by examination marks. Hard work and passion for one\'s chosen field matter more than early grades.'),
        def('Interview', 'A conversation in which one person asks questions and another answers, written down in question–answer form.'),
        def('Dignity of labour', 'The idea that all honest work deserves respect. Reading C asks us to honour construction workers — masons, carpenters, labourers — who literally build the nation.'),
        keys('Theme: talents differ; education should help each child discover theirs.', 'Marks are not the only measure of ability.', 'Reading C: respect for workers who build our infrastructure.', 'Career choice should combine interest, ability and hard work.'),
        remember('The architect does not say that studies are unimportant. He says that a child\'s real interests deserve to be noticed and encouraged.'),
      ],
      examples: [
        ex('Explain the title "The Treasure Within".', ['A treasure is something precious and often hidden.', '"Within" means inside a person.', 'The interview is about discovering one\'s hidden talent.'], 'It means the precious talent hidden inside every child, waiting to be discovered.'),
        ex('What advice would the architect give a student who is weak in exams but loves drawing?', ['He himself was such a student.', 'He values interest and passion.'], 'Do not lose heart — develop your love of drawing; it can lead to a fine career such as architecture or design.'),
      ],
      practice: [
        mcq('understand', 'Go back to the summary.', [
          ['What is the profession of the person interviewed?', 'Architect', ['Doctor', 'Cricketer', 'Singer'], 'He designs buildings.', 'Hafeez Contractor is an architect.'],
          ['What did he love doing as a child?', 'Drawing and making things', ['Memorising tables', 'Writing poems', 'Playing chess only'], 'It connects to his career.', 'His love of drawing led him to architecture.'],
          ['What is the "treasure within"?', 'A hidden talent inside every person', ['Gold buried in a building', 'A good examination rank', 'A family inheritance'], 'It is a metaphor.', 'The treasure is each child\'s special ability.'],
          ['What does he suggest about examination marks?', 'They are not the only measure of a child\'s ability', ['They are all that matter', 'They should be abolished at once', 'Only the top rank is worth anything'], 'Think of his own school days.', 'He was not a top scorer but became very successful.'],
          ['The text of Readings A and B is written as…', 'an interview', ['a poem', 'a diary entry', 'a one-act play'], 'Questions and answers.', 'It is in question–answer form.'],
          ['Reading C, They Literally Build the Nation, asks us to respect…', 'construction workers', ['film stars', 'shopkeepers only', 'tourists'], 'Who literally builds?', 'It honours the workers who build roads, homes and dams.'],
        ]),
        matchT('terms', 'term with its meaning', [
          ['Interview', 'A question–answer conversation'], ['Architect', 'Person who designs buildings'], ['Mason', 'Worker who builds with bricks and stone'], ['Rote learning', 'Memorising without understanding'], ['Talent', 'A natural ability'], ['Dignity of labour', 'Respect for all honest work'],
        ], ['Think of the people in this unit.', 'Rote = by repetition.']),
        tapT('values', 'Tap every idea that matches the message of The Treasure Within.', [
          ['Each child has a special ability.', true], ['Children should be allowed to explore their interests.', true], ['Passion and hard work lead to success.', true],
          ['Only students with top marks can succeed.', false], ['Drawing is a waste of time.', false], ['Children should never be encouraged.', false],
        ], ['Remember his own childhood.', 'Encouragement is key.'], 'The interview celebrates individual talent, freedom and passion.'),
      ],
    },
    {
      id: 'ts8.en.shades.words', title: 'Shades of meaning', prereqs: [],
      intro: [
        h('Similar words, different strength'),
        p('Many words have nearly the same meaning but differ in strength or manner. Choosing the right "shade" makes writing exact. "Look", "glance", "stare" and "gaze" all mean seeing — but in very different ways.'),
        keys(
          'glance (quick) → look → stare (long, fixed, often rude) → gaze (long, with wonder or love)',
          'warm → hot → scorching',
          'good → great → excellent → outstanding',
          'tired → exhausted',
          'walk → stroll (relaxed) · march (in step) · stride (long steps) · tiptoe (quietly)',
          'happy → delighted → overjoyed (ecstatic)',
        ),
        h('Method: choosing the right shade'),
        stepsB('Find the basic meaning: all the words mean "to see", "to be glad", etc.', 'Decide the strength: mild, medium or strong.', 'Decide the manner: quick or slow, quiet or loud, pleasant or rude.', 'Pick the word that matches the situation.'),
        remember('Stronger is not always better. "I am ecstatic that it stopped raining" sounds odd; "glad" fits better.'),
      ],
      examples: [
        ex('Arrange by strength: hot, warm, scorching.', ['Mildest: warm.', 'Middle: hot.', 'Strongest: scorching.'], 'warm → hot → scorching'),
        ex('Choose: "The boy ___ at the clock to check the time and kept writing." (glanced / gazed)', ['A quick look while busy.'], 'glanced'),
      ],
      practice: [
        mcq('choose', 'Decide the strength and manner the sentence needs.', [
          ['"She ___ lovingly at her newborn baby for a long time."', 'gazed', ['glanced', 'peeped', 'blinked'], 'Long, with love.', 'gaze = look long with wonder or love.'],
          ['"The soldiers ___ in step during the parade."', 'marched', ['strolled', 'tiptoed', 'wandered'], 'In step, in rhythm.', 'Soldiers march.'],
          ['"After a 20 km walk, we were completely ___."', 'exhausted', ['tired', 'sleepy', 'bored'], 'Completely = very strong.', 'exhausted = extremely tired.'],
          ['"It is rude to ___ at strangers."', 'stare', ['glance', 'gaze lovingly', 'wink'], 'Long and fixed.', 'Staring is a long fixed look, often rude.'],
          ['"We ___ along the beach, enjoying the breeze."', 'strolled', ['marched', 'raced', 'stamped'], 'Relaxed walking.', 'stroll = walk slowly for pleasure.'],
          ['"She ___ past the sleeping baby."', 'tiptoed', ['stamped', 'marched', 'stomped'], 'Quietly.', 'tiptoe = walk quietly on your toes.'],
        ]),
        orderT('scale', ['Start with the mildest word.', 'End with the strongest.'], [
          ['Arrange from mildest to strongest.', ['warm', 'hot', 'scorching'], 'Heat increases.'],
          ['Arrange from mildest to strongest.', ['good', 'great', 'outstanding'], 'Praise increases.'],
          ['Arrange from mildest to strongest.', ['glad', 'delighted', 'overjoyed'], 'Happiness increases.'],
          ['Arrange from mildest to strongest.', ['cool', 'cold', 'freezing'], 'Coldness increases.'],
          ['Arrange from mildest to strongest.', ['small', 'tiny', 'microscopic'], 'Smallness increases.'],
        ]),
        matchT('manner', 'word with the manner it describes', [
          ['glance', 'look quickly'], ['stare', 'look long and fixedly'], ['stroll', 'walk slowly for pleasure'], ['stride', 'walk with long steps'], ['whisper', 'speak very softly'], ['yell', 'shout very loudly'],
        ], ['Act out each word.', 'Quick versus slow, soft versus loud.']),
      ],
    },
    {
      id: 'ts8.en.usedto.grammar', title: '"used to" and "would" for past habits', prereqs: [],
      intro: [
        h('Talking about how things were'),
        p('We use "used to" and "would" to talk about habits and situations in the past that are no longer true.'),
        keys(
          'used to + base verb: past habits AND past states. "I used to walk to school." "He used to be shy."',
          'would + base verb: ONLY past repeated actions, not states. "Every evening, Grandpa would tell us stories."',
          'Negative: didn\'t use to (no d). Question: Did you use to…?',
          'Do not confuse with "be used to + -ing" = be accustomed to: "I am used to waking up early."',
        ),
        h('Method: used to or would?'),
        stepsB(
          'Is it about the past and no longer true? If not, use another tense.',
          'Is it a repeated action (walk, play, tell)? → used to OR would.',
          'Is it a state (be, have, like, know, live)? → used to only.',
          'In negatives and questions with did, drop the d: didn\'t use to, did … use to.',
        ),
        remember('✗ "I would have long hair." (state) ✓ "I used to have long hair."'),
      ],
      examples: [
        ex('Rewrite with "used to": "When he was young, he lived in Nalgonda." (no longer)', ['"live" is a state.', 'Use used to + base verb.'], 'He used to live in Nalgonda.'),
        ex('Make negative: "She used to like tea."', ['Use did not + use to.', 'Drop the d after didn\'t.'], 'She didn\'t use to like tea.'),
      ],
      practice: [
        mcq('choose', 'States take only "used to"; repeated actions take both.', [
          ['"I ___ be afraid of the dark."', 'used to', ['would', 'am used to', 'use to'], '"be afraid" is a state.', 'States take "used to", not "would".', [['would', '"would" cannot be used for past states.']]],
          ['"Every summer we ___ visit our grandparents in the village."', 'would', ['are used to', 'use', 'will'], 'A repeated past action.', '"would" (or "used to") works for repeated past actions.'],
          ['"Did you ___ play cricket?"', 'use to', ['used to', 'using to', 'uses to'], 'After did, drop the d.', 'Did + use to.', [['used to', 'After "did", write "use to" without d.']]],
          ['"My father ___ have a scooter, but he sold it."', 'used to', ['would', 'is used to', 'uses to'], '"have" (own) is a state.', 'States take "used to".'],
          ['"She is used to ___ early." (accustomed)', 'getting up', ['get up', 'got up', 'gets up'], '"be used to" + -ing.', 'be used to + gerund.'],
          ['Which sentence is correct?', 'We didn\'t use to have a computer.', ['We didn\'t used to have a computer.', 'We wouldn\'t have a computer then (state).', 'We use to not have a computer.'], 'Negative: didn\'t use to.', 'didn\'t + use to + base verb.'],
        ], 2),
        typed('rewrite', 'Type the missing words.', [
          ['Fill in the three missing words: "When I was little, I ___ cartoons every morning." (watch, past habit — use "used to")', ['used to watch'], 'used to + base verb.', 'used to + watch = used to watch.', [['used to watched', 'After "used to" use the base form: watch.']]],
          ['Fill in: "He ___ to be very thin, but now he is strong."', ['used'], 'used to + be.', 'He used to be thin.'],
          ['Fill in: "Grandma ___ sing us lullabies every night." (one word, repeated action)', ['would'], 'One word for repeated past actions.', 'would + sing.'],
          ['Fill in: "Did your school ___ to have a library?"', ['use'], 'After did, no d.', 'Did … use to.', [['used', 'After "did", use "use" without d.']]],
          ['Fill in: "I am not used to ___ spicy food." (eat)', ['eating'], '"be used to" + -ing.', 'used to eating.', [['eat', '"be used to" takes the -ing form: eating.']]],
        ]),
        tapT('spot', 'Tap every CORRECT sentence.', [
          ['I used to live in Adilabad.', true], ['On Sundays we would go fishing.', true], ['She didn\'t use to like maths.', true], ['He is used to working late.', true],
          ['I would live in Adilabad.', false], ['She didn\'t used to like maths.', false], ['He is used to work late.', false],
        ], ['"would" is not for states.', 'didn\'t use to; be used to + -ing.'], 'Apply the three rules: states → used to; did → use to; be used to → -ing.'),
      ],
    },
    {
      id: 'ts8.en.piechart.write', title: 'Describing a pie chart and compering an event', prereqs: [],
      intro: [
        h('Turning a chart into words'),
        p('A pie chart shows how a whole (100%) is divided into parts. When you describe one, you report the biggest and smallest parts, compare them, and draw a conclusion.'),
        stepsB(
          'Introduce: what the chart shows, about whom, and when ("The pie chart shows the career choices of 200 Class 8 students.").',
          'State the largest share and the smallest share with figures.',
          'Compare the other parts using: twice as many, equal to, slightly more than, nearly half.',
          'Conclude with what the data suggests.',
        ),
        keys('Percent of a total: 25% of 200 = 200 × 25 ÷ 100 = 50.', 'Use the present tense: "The chart shows…".', 'Do not list every number in a long string — group and compare.'),
        h('Compering (anchoring)'),
        p('A compere (anchor) guides the audience through an event. The script follows a fixed order: greeting, welcome to guests, purpose of the event, introducing each item and performer, linking remarks, vote of thanks, closing.'),
        remember('A compere introduces performers briefly and politely — the spotlight belongs to them, not to the anchor.'),
      ],
      examples: [
        ex('In a chart of 200 students, 30% want to be teachers. How many students is that?', ['30% of 200 = 200 × 30 ÷ 100.', '= 60.'], '60 students'),
        ex('Write a comparison: Engineering 40%, Medicine 20%.', ['40 is two times 20.'], 'Twice as many students prefer engineering as medicine.'),
      ],
      practice: [
        mcq('read', 'Use the figures given; % of a total = total × % ÷ 100.', [
          ['A pie chart of 200 students\' favourite careers: Teaching 30%, Engineering 25%, Medicine 20%, Arts 15%, Sports 10%. Which career is most popular?', 'Teaching', ['Engineering', 'Medicine', 'Sports'], 'Find the biggest percentage.', 'Teaching has the largest share, 30%.'],
          ['Same chart (200 students: Teaching 30%, Engineering 25%, Medicine 20%, Arts 15%, Sports 10%). How many students chose Sports?', '20', ['10', '30', '40'], '10% of 200.', '200 × 10 ÷ 100 = 20.', [['10', '10 is the percentage, not the number of students.']]],
          ['A chart of how a student spends a day: Sleep 37.5%, School 25%, Play 12.5%, Homework 12.5%, Other 12.5%. Which TWO activities take equal time — choose the best description.', 'Play and homework take equal time', ['Sleep and school take equal time', 'School takes the least time', 'Play takes the most time'], 'Look for matching percentages.', 'Play and homework are both 12.5%.'],
          ['A chart of 400 villagers\' transport: Bus 50%, Bicycle 25%, Auto 15%, Walk 10%. How many travel by bicycle?', '100', ['25', '50', '200'], '25% is one quarter.', '400 × 25 ÷ 100 = 100.'],
          ['Engineering 40%, Arts 20%. Which comparison is correct?', 'Engineering is twice as popular as Arts.', ['Arts is twice as popular as Engineering.', 'They are equally popular.', 'Engineering is three times as popular as Arts.'], '40 ÷ 20 = ?', '40 is twice 20.'],
          ['Which sentence is the best introduction to a pie-chart paragraph?', 'The pie chart shows how 200 students of our school travel to school.', ['Bus 50%, cycle 25%, walk 25%.', 'In conclusion, buses are useful.', 'I like pie charts.'], 'Say what, who and how many.', 'An introduction states what the chart shows.'],
        ]),
        orderT('compere', ['Greeting and welcome come first.', 'The closing comes last.'], [
          ['Arrange the parts of a compering script.', ['Greeting the audience', 'Welcoming the chief guest', 'Stating the purpose of the event', 'Introducing each programme item', 'Inviting someone for the vote of thanks', 'Closing the event'], 'Greet → welcome → purpose → items → thanks → close.'],
          ['Arrange the parts of a pie-chart description.', ['Say what the chart shows', 'Give the largest share', 'Give the smallest share', 'Compare the remaining parts', 'Conclude with what the data suggests'], 'Introduce → highest → lowest → compare → conclude.'],
        ]),
        typed('percent', 'Percent of a total = total × percent ÷ 100.', [
          ['A chart shows 300 students; 20% walk to school. How many walk?', ['60'], '300 × 20 ÷ 100.', '= 60.'],
          ['A chart shows 500 readers; 40% prefer Telugu newspapers. How many is that?', ['200'], '500 × 40 ÷ 100.', '= 200.'],
          ['A chart shows 80 teachers; 25% teach English. How many?', ['20'], 'A quarter of 80.', '80 × 25 ÷ 100 = 20.'],
          ['A pie chart has parts 35%, 25%, 20% and one missing part. What is the missing percentage?', ['20', '20%'], 'All parts add up to 100%.', '100 − (35 + 25 + 20) = 20.'],
          ['A chart shows 600 farmers; 10% grow cotton. How many?', ['60'], '10% = one tenth.', '600 ÷ 10 = 60.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Unit 6 — Art and Culture
// =====================================================================================
const u6: USpec = {
  id: 'ts8.en.u6', subject: 'english', title: 'Unit 6 — Art and Culture', source: src(6),
  note: 'Reading C (Maestro with a Mission) is treated at theme level only; teachers should add the details of its subject from the textbook.',
  objectives: [
    {
      id: 'ts8.en.ikat.read', title: 'The Story of Ikat and The Earthen Goblet', prereqs: [],
      intro: [
        h('Art made by hand'),
        photo('🧵', 'Threads tied and dyed BEFORE weaving — the secret of ikat, Telangana\'s famous craft.'),
        p('A. The Story of Ikat describes the ikat weaving of Pochampally in Telangana. B. The Earthen Goblet is a poem by Harindranath Chattopadhyaya. C. Maestro with a Mission is about an artist who uses his art for a larger purpose.'),
        h('Reading A in brief (our summary)'),
        p('Ikat is a method of making patterns in cloth by tying and dyeing the threads before they are woven. Bundles of yarn are tightly tied at marked places so that dye cannot reach those parts; the yarn is dyed, untied, and tied and dyed again for each colour. When the coloured threads are finally set on the loom and woven, the pattern appears — with its typical slightly blurred, feathery edges. Pochampally, in Yadadri Bhuvanagiri district, is famous for its ikat silk and cotton sarees. Its ikat has a Geographical Indication (GI) tag, and the village was honoured by the UN World Tourism Organization as one of the best tourism villages in 2021.'),
        def('Geographical Indication (GI)', 'A label showing that a product comes from a particular place and has qualities linked to it.'),
        h('Reading B in brief'),
        p('The poet speaks to an earthen goblet (a clay cup) and asks it about its past. Before the potter shaped it, the clay lay freely in the earth near flowers and roots. The potter\'s wheel turned it into a useful cup, but it lost the natural joy and beauty of the free earth. The poem questions whether human art, however skilful, can match the beauty of nature.'),
        keys('Ikat: tie → dye → untie → repeat → weave.', 'Theme of A: pride in traditional crafts and the skill of weavers.', 'Theme of B: nature\'s freedom versus human shaping.', 'Device in B: apostrophe — speaking directly to a thing (the goblet).'),
        remember('In ikat the YARN is dyed before weaving; in block printing the finished CLOTH is printed. Do not mix them up.'),
      ],
      examples: [
        ex('Why do ikat patterns have blurred edges?', ['The threads are dyed before weaving.', 'When woven, the threads shift slightly against each other.'], 'Because the dyed threads never line up perfectly on the loom, giving soft, feathery edges.'),
        ex('What did the clay lose when it became a goblet?', ['It once lay freely in the earth near flowers.', 'Now it is shaped and fixed by the potter.'], 'Its natural freedom and the joy of being part of living nature.'),
      ],
      practice: [
        mcq('understand', 'Go back to the summaries.', [
          ['In ikat, what is dyed before weaving?', 'The yarn (threads)', ['The finished saree', 'The loom', 'The weaver\'s hands'], 'Think of the order: dye then weave.', 'Ikat yarn is tie-dyed before it goes on the loom.'],
          ['Why are parts of the yarn tied tightly?', 'To stop the dye from reaching those parts', ['To make the yarn stronger', 'To sell it in bundles', 'To dry it faster'], 'This is a resist method.', 'Tied parts resist the dye and keep their colour.'],
          ['Pochampally is in which state?', 'Telangana', ['Kerala', 'Gujarat', 'Odisha'], 'It is near Hyderabad.', 'Pochampally is in Yadadri Bhuvanagiri district, Telangana.'],
          ['What does a GI tag show?', 'That a product comes from a particular place with special qualities', ['That a product is imported', 'That it is the cheapest', 'That it was made by a machine'], 'G = geographical.', 'GI links a product to its place of origin.'],
          ['Whom does the poet speak to in The Earthen Goblet?', 'A clay cup', ['A potter\'s wife', 'A river', 'A king'], 'The title tells you.', 'The poet addresses the earthen goblet.'],
          ['What is the main idea of The Earthen Goblet?', 'Nature\'s freedom is more beautiful than human shaping', ['Clay cups are better than steel cups', 'Potters are lazy', 'Goblets should be painted'], 'What did the clay lose?', 'The clay lost its natural joy when shaped by the potter.'],
        ]),
        orderT('process', ['Design and tying come before dyeing.', 'Weaving is last.'], [
          ['Arrange the steps of ikat weaving.', ['Mark the design on bundles of yarn', 'Tie the marked parts tightly', 'Dip the yarn in dye', 'Untie, and repeat for other colours', 'Weave the dyed yarn on the loom'], 'Mark → tie → dye → untie/repeat → weave.'],
          ['Arrange the "life" of the goblet as the poem imagines it.', ['Clay lies free in the earth near flowers', 'The potter digs out the clay', 'The wheel shapes it into a goblet', 'The goblet remembers its lost freedom'], 'Free earth → taken → shaped → memory.'],
        ]),
        matchT('terms', 'term with its meaning', [
          ['Ikat', 'Tie-dyeing yarn before weaving'], ['Loom', 'Frame on which cloth is woven'], ['Goblet', 'A drinking cup'], ['Apostrophe (poetry)', 'Speaking directly to an object or absent person'], ['GI tag', 'Label linking a product to its place'], ['Potter', 'Person who shapes clay into pots'],
        ], ['Two are from the poem; others from the craft.', 'Apostrophe here is a poetic device, not punctuation.']),
      ],
    },
    {
      id: 'ts8.en.homophone.words', title: 'Homonyms and homophones', prereqs: [],
      intro: [
        h('Same sound, different meaning'),
        def('Homophones', 'Words that sound the same but have different spellings and meanings: dye / die, weave / we\'ve, sale / sail, piece / peace, right / write.'),
        def('Homonyms', 'Words with the same spelling AND sound but different meanings: bank (of a river / for money), bat (animal / cricket bat), fair (just / a festival / light in colour).'),
        h('Method: choosing the right word'),
        stepsB('Read the whole sentence.', 'Decide what meaning is needed.', 'For homophones, choose the spelling that matches that meaning.', 'For homonyms, the spelling stays the same — use context to decide which meaning is intended.'),
        keys('dye (colour) / die (stop living)', 'there (place) / their (belonging to them) / they\'re (they are)', 'flour (atta) / flower', 'weak (not strong) / week (seven days)', 'hear (with ears) / here (this place)'),
        remember('Spell-check will not catch homophone errors — "The weaver used read die" has real words but is wrong. Read for meaning.'),
      ],
      examples: [
        ex('Choose: "The weavers ___ the yarn red." (dye / die)', ['The meaning needed: colour.'], 'dye'),
        ex('What are the two meanings of "bank" in: "We sat on the bank" and "I saved money in the bank"?', ['Same spelling and sound — a homonym.'], 'The side of a river; a place that keeps money.'),
      ],
      practice: [
        mcq('choose', 'Decide the meaning first, then the spelling.', [
          ['"Mix the ___ with water to make chapati dough."', 'flour', ['flower', 'floor', 'flow'], 'Chapatis are made of atta.', 'flour = ground wheat.'],
          ['"The shop has a big ___ on sarees this week."', 'sale', ['sail', 'sell', 'seal'], 'Low prices.', 'sale = selling at reduced prices.'],
          ['"They left ___ bags in the bus."', 'their', ['there', 'they\'re', 'thier'], 'Belonging to them.', 'their = belonging to them.'],
          ['"After the fever she felt very ___."', 'weak', ['week', 'wick', 'wake'], 'Not strong.', 'weak = not strong.'],
          ['"Please give me a ___ of cake."', 'piece', ['peace', 'peas', 'pace'], 'A portion.', 'piece = a part.'],
          ['"Can you ___ the music?"', 'hear', ['here', 'hair', 'heir'], 'With your ears.', 'hear = perceive sound.'],
        ]),
        typed('homo', 'Type the homophone with the meaning given.', [
          ['Homophone of "die" meaning "to colour cloth":', ['dye'], 'Starts with d, ends in ye.', 'dye = colour.'],
          ['Homophone of "sail" meaning "selling at low prices":', ['sale'], 'Ends in -ale.', 'sale.'],
          ['Homophone of "right" meaning "to put words on paper":', ['write'], 'It has a silent w.', 'write.'],
          ['Homophone of "peace" meaning "a part of something":', ['piece'], 'i before e.', 'piece.'],
          ['Homophone of "week" meaning "not strong":', ['weak'], 'Has "ea".', 'weak.'],
          ['Homophone of "knight" meaning "the time when it is dark":', ['night'], 'No k.', 'night.'],
        ]),
        mcq('homonym', 'Same spelling — use the context.', [
          ['"The bat flew out of the cave." Here "bat" means…', 'a flying animal', ['a cricket bat', 'to hit', 'a club'], 'It flew from a cave.', 'Context shows the animal.'],
          ['"The judge was fair to both sides." Here "fair" means…', 'just', ['light-coloured', 'a festival', 'pretty'], 'Judges should be…', 'fair = just and impartial.'],
          ['"The boys rowed to the bank." Here "bank" means…', 'the side of a river', ['a place for money', 'a heap of snow', 'to rely on'], 'They rowed a boat.', 'They reached the riverside.'],
          ['"Please light the lamp." Here "light" means…', 'to set burning', ['not heavy', 'pale in colour', 'easy'], 'Lamps are lit.', 'To light = to make it burn.'],
          ['"The kids went to the village fair." Here "fair" means…', 'a festival with stalls and rides', ['just', 'light-coloured', 'fine weather'], 'Where did they go?', 'A fair is an event with stalls.'],
        ], 2),
      ],
    },
    {
      id: 'ts8.en.reported.grammar', title: 'Reported speech', prereqs: [],
      intro: [
        h('Telling what someone said'),
        p('Direct speech gives the exact words in quotation marks: Asha said, "I am weaving a saree." Reported (indirect) speech tells it in our own sentence without quotation marks: Asha said that she was weaving a saree.'),
        h('Method: statements'),
        stepsB(
          'Use a reporting verb: said / told + person.',
          'Remove the quotation marks; add "that" (optional).',
          'Change pronouns to suit the speaker: I → he/she, my → his/her, we → they.',
          'If the reporting verb is past, move the tense one step back: is → was, am/are → was/were, do → did, did → had done, will → would, can → could, has → had.',
          'Change time and place words: now → then, today → that day, tomorrow → the next day, yesterday → the day before, here → there, this → that.',
        ),
        h('Questions and commands'),
        keys('Yes/no question → asked if/whether + statement order: He asked, "Are you ready?" → He asked if I was ready.', 'Wh- question → asked + wh-word + statement order: She asked, "Where do you live?" → She asked where I lived.', 'Command → told/asked + person + to + verb: "Sit down," said the teacher → The teacher told us to sit down.', 'Negative command → not to: "Don\'t run" → told us not to run.'),
        remember('In reported questions there is no question mark and no do/does/did: ✗ "She asked where did I live?" ✓ "She asked where I lived."'),
      ],
      examples: [
        ex('Report: Ravi said, "I am learning the tabla."', ['said → said (that).', 'I → he.', 'am learning → was learning.'], 'Ravi said that he was learning the tabla.'),
        ex('Report: The guide asked us, "Have you seen a handloom before?"', ['Yes/no question → asked if.', 'you → we; have seen → had seen.', 'Statement order, no question mark.'], 'The guide asked us if we had seen a handloom before.'),
        ex('Report: Mother said to me, "Don\'t touch the hot pot."', ['Negative command → told + me + not to.'], 'Mother told me not to touch the hot pot.'),
      ],
      practice: [
        mcq('report', 'Change pronoun, tense, time words; use if / wh- / to.', [
          ['Meena said, "I like ikat sarees." → Meena said that she ___ ikat sarees.', 'liked', ['likes', 'like', 'had like'], 'Present simple moves back one step.', 'like → liked.'],
          ['He said, "I will come tomorrow." → He said that he would come ___.', 'the next day', ['tomorrow', 'yesterday', 'today'], 'Time words change too.', 'tomorrow → the next day.'],
          ['She asked me, "Are you tired?" → She asked me ___.', 'if I was tired', ['if was I tired', 'are you tired', 'that I am tired?'], 'Yes/no question → if + statement order.', 'if + I + was tired.'],
          ['The teacher said, "Open your books." → The teacher told us ___.', 'to open our books', ['open your books', 'that open our books', 'opened our books'], 'Commands → to + verb.', 'told us to open our books.'],
          ['He asked, "Where do you live?" → He asked ___.', 'where I lived', ['where did I live', 'where do you live', 'where I live?'], 'Wh-question → statement order, no do.', 'where I lived.', [['where did I live', 'Drop "did" and use statement order: where I lived.']]],
          ['Kiran said, "I can play the veena." → Kiran said that he ___ play the veena.', 'could', ['can', 'will', 'may'], 'can moves back.', 'can → could.'],
          ['She said, "Don\'t make noise." → She told us ___ noise.', 'not to make', ['to not making', 'don\'t make', 'not make'], 'Negative command.', 'not to + verb.'],
        ], 2),
        typed('tense', 'Type the backshifted verb form.', [
          ['Report: She said, "I am happy." → She said that she ___ happy.', ['was'], 'am → ?', 'am → was.'],
          ['Report: They said, "We are weavers." → They said that they ___ weavers.', ['were'], 'are → ?', 'are → were.'],
          ['Report: He said, "I have finished." → He said that he ___ finished.', ['had'], 'has/have → ?', 'have → had.'],
          ['Report: She said, "I will help." → She said that she ___ help.', ['would'], 'will → ?', 'will → would.'],
          ['Report: Raju said, "I write poems." → Raju said that he ___ poems.', ['wrote'], 'Present simple → past simple.', 'write → wrote.'],
          ['Report: He said, "I saw the potter." → He said that he ___ seen the potter.', ['had'], 'Past simple → past perfect.', 'saw → had seen.'],
        ]),
        matchT('words', 'direct-speech word with its reported form', [
          ['now', 'then'], ['today', 'that day'], ['tomorrow', 'the next day'], ['yesterday', 'the day before'], ['here', 'there'], ['this', 'that'],
        ], ['Time and place move away from the speaker.', 'tomorrow → the next day.']),
      ],
    },
    {
      id: 'ts8.en.email.write', title: 'Writing an e-mail (and tree diagrams)', prereqs: [],
      intro: [
        h('Letters that travel instantly'),
        p('An e-mail follows a simple format. It can be formal (to an office or teacher) or informal (to a friend), but it is always short and clear.'),
        h('Format'),
        stepsB(
          'To: the receiver\'s e-mail address (Cc: others who should get a copy).',
          'Subject: a short line telling what the mail is about.',
          'Salutation: Dear Sir/Madam, or Dear Ravi,',
          'Body: short paragraphs — purpose first, then details, then what you want.',
          'Closing: Regards / Best wishes / Yours sincerely.',
          'Signature: your name (and class/school or designation).',
        ),
        h('Model (written for WonderLab)'),
        p('To: artclub.zphs@example.com | Subject: Request for an ikat demonstration | Dear Madam, Our Class 8 students would like to learn how ikat sarees are woven. Could a weaver from Pochampally visit our school on 5 December to give a short demonstration? We will arrange the hall and a projector. Regards, Lakshmi N., Class Leader, 8-A'),
        keys('The subject line must be specific.', 'No address or date in the body — the e-mail system adds them.', 'Avoid SMS spellings in formal mails.'),
        h('Tree diagrams (study skills)'),
        p('A tree diagram shows information branching from a main idea into categories and sub-categories, like a family tree — e.g. Indian Art → Crafts / Music / Dance → Crafts: ikat weaving, pottery, Nirmal toys.'),
        remember('Never leave the subject line empty; many readers decide from it whether to open the mail.'),
      ],
      examples: [
        ex('Write a subject line for an e-mail asking your teacher for a leave of two days.', ['Short, specific.'], 'Leave application for 12–13 November'),
        ex('Formal or informal closing for an e-mail to the Headmaster?', ['Headmaster → formal.'], 'Formal: "Yours sincerely" or "Regards".'),
      ],
      practice: [
        orderT('parts', ['Address fields come first.', 'Signature last.'], [
          ['Arrange the parts of an e-mail.', ['To:', 'Subject:', 'Salutation', 'Body', 'Closing', 'Signature'], 'Fields → salutation → body → closing → signature.'],
          ['Arrange the lines of a short e-mail.', ['Subject: Thanks for the pottery workshop', 'Dear Mr Rao,', 'Thank you for teaching us pottery last Saturday.', 'Our class has already made twenty small diyas!', 'Regards,', 'Priya, Class 8-B'], 'Subject → greeting → thanks → detail → closing → name.'],
        ]),
        mcq('features', 'Think of a clear, short e-mail.', [
          ['What tells the reader what an e-mail is about?', 'The subject line', ['The signature', 'The Cc field', 'The closing'], 'It appears in the inbox.', 'The subject line summarises the mail.'],
          ['What is "Cc" used for?', 'Sending a copy to another person', ['Correcting spelling', 'Closing the mail', 'Cancelling the mail'], 'Carbon copy.', 'Cc sends a copy to others.'],
          ['Which subject line is best?', 'Request for library books on Telangana crafts', ['Hi', 'Important!!!', 'No subject'], 'Specific is best.', 'A good subject line is specific.'],
          ['Which closing suits a formal e-mail?', 'Yours sincerely', ['Love you lots', 'Bye!!', 'Cheers, buddy'], 'Formal tone.', '"Yours sincerely" or "Regards" suits formal mails.'],
          ['In a tree diagram, the main idea is placed…', 'at the top (the root)', ['at the very bottom only', 'in a footnote', 'nowhere'], 'Branches come from it.', 'Categories branch out from the main idea.'],
        ]),
        matchT('fields', 'e-mail part with an example', [
          ['To', 'principal.zphs@example.com'], ['Subject', 'Request for a field trip'], ['Salutation', 'Dear Madam,'], ['Closing', 'Regards,'], ['Signature', 'Aarav K., Class 8-C'],
        ], ['Each field has a typical form.', 'The address has an @ sign.']),
      ],
    },
  ],
};

// =====================================================================================
// Unit 7 — Women Empowerment
// =====================================================================================
const u7: USpec = {
  id: 'ts8.en.u7', subject: 'english', title: 'Unit 7 — Women Empowerment', source: src(7),
  note: 'Bonsai Life (Parts I and II) and Reading C (I Can Take Care of Myself) are taught at theme level; teachers should add plot and character details from the textbook.',
  objectives: [
    {
      id: 'ts8.en.bonsai.read', title: 'Bonsai Life: a life trimmed to fit', prereqs: [],
      intro: [
        h('Why a bonsai?'),
        photo('🌳', 'A bonsai is a real tree kept tiny by constant cutting of its roots and branches — beautiful, but never allowed to grow to its full size.'),
        p('Readings A and B, Bonsai Life (Parts I and II), are an English translation of a Telugu story by the writer Abburi Chaya Devi. Reading C, I Can Take Care of Myself, is about a woman\'s confidence and self-reliance.'),
        h('The story in brief (our summary of its theme)'),
        p('The story follows an educated young woman whose hopes of developing her own abilities and career are slowly cut back after marriage, by the expectations of her husband and family. She is admired and kept "beautiful", yet she is never allowed to grow fully — just like a bonsai plant, whose roots and branches are trimmed so that it stays small in a pot. The story makes readers ask whether women are given the space to grow as freely as men.'),
        def('Metaphor', 'Describing one thing as if it were another. The title calls a woman\'s restricted life a "bonsai life".'),
        def('Empowerment', 'Giving people the freedom, confidence, education and rights to make their own choices.'),
        keys('Central symbol: the bonsai — beautiful but stunted.', 'Theme: women need room to grow — education, work and choice.', 'Reading C: self-reliance and confidence.', 'Link to today: equal rights in the Constitution; schemes for girls\' education; women leaders in every field.'),
        remember('The story does not say families are evil; it shows how everyday expectations can quietly limit a woman\'s growth.'),
        tip('Discuss: Which women in your village or town have grown "like a banyan tree" rather than a bonsai? What helped them?'),
      ],
      examples: [
        ex('Explain why the title "Bonsai Life" suits the story.', ['A bonsai is cut back to stay small.', 'The woman\'s ambitions are also cut back.', 'Both look fine outside but cannot grow fully.'], 'Her life, like a bonsai, is kept attractive but small by constant trimming of her dreams.'),
        ex('What is the opposite of a "bonsai life", in the spirit of this unit?', ['Think of a tree free to grow.'], 'A life with freedom to study, work and make one\'s own choices — growing to full height like a tree in open ground.'),
      ],
      practice: [
        mcq('understand', 'Think about the symbol and the theme.', [
          ['What does the bonsai stand for in the story?', 'A woman\'s life whose growth is restricted', ['A rich family\'s garden', 'A love of gardening', 'A new kind of tree'], 'A bonsai is trimmed to stay small.', 'The bonsai symbolises a life kept small by others.'],
          ['The title "Bonsai Life" is an example of…', 'a metaphor', ['onomatopoeia', 'a pun', 'alliteration'], 'One thing described as another.', 'A life is described as a bonsai — a metaphor.'],
          ['What is the main theme of Unit 7?', 'Women\'s right to grow, choose and be independent', ['How to grow bonsai plants', 'The history of Japan', 'Cooking skills'], 'Look at the unit title.', 'The unit is about women\'s empowerment.'],
          ['In which language was Bonsai Life originally written?', 'Telugu', ['Hindi', 'Japanese', 'Tamil'], 'The writer is from Andhra Pradesh/Telangana region.', 'Abburi Chaya Devi wrote in Telugu.'],
          ['What does "empowerment" mean?', 'Giving people the freedom and confidence to make their own choices', ['Giving people electricity', 'Taking away rights', 'Becoming a ruler'], 'Em-power = give power.', 'Empowerment means enabling people to decide for themselves.'],
          ['Reading C, I Can Take Care of Myself, celebrates…', 'self-reliance and confidence', ['laziness', 'dependence on others', 'fear'], 'Read the title.', 'The title itself states self-reliance.'],
        ]),
        matchT('symbols', 'word with its meaning in this unit', [
          ['Bonsai', 'A tree kept tiny by trimming'], ['Stunted', 'Prevented from growing fully'], ['Empowerment', 'Gaining freedom and confidence to choose'], ['Self-reliance', 'Depending on oneself'], ['Metaphor', 'Describing one thing as another'], ['Aspiration', 'A strong hope or ambition'],
        ], ['Link each word to the bonsai image.', 'Self- words refer to oneself.']),
        tapT('values', 'Tap every action that EMPOWERS girls and women.', [
          ['Sending daughters to college', true], ['Letting women choose their careers', true], ['Sharing housework equally', true], ['Encouraging girls in sports', true],
          ['Stopping a girl\'s studies after Class 8', false], ['Deciding everything for her without asking', false], ['Laughing at her ambitions', false],
        ], ['Empowerment = more choice and growth.', 'Ask: does this help her grow, or trim her?'], 'Empowering actions widen a woman\'s choices; the others trim them like a bonsai.'),
      ],
    },
    {
      id: 'ts8.en.idiom.words', title: 'Phrasal verbs and idioms', prereqs: [],
      intro: [
        h('Expressions that mean more than their words'),
        def('Idiom', 'A group of words whose meaning is different from the meanings of the separate words: "a piece of cake" = very easy.'),
        def('Phrasal verb', 'Verb + particle with a special meaning: "stand up for" = defend.'),
        keys(
          'stand on one\'s own feet — be independent',
          'break the glass ceiling — overcome an unseen barrier to success',
          'hold one\'s head high — be proud and confident',
          'a piece of cake — very easy',
          'break the ice — start a conversation in a shy situation',
          'stand up for — defend; look down on — think someone is less important; bring up — raise a child; put up with — tolerate; speak up — say clearly what you think',
        ),
        h('Method'),
        stepsB('Do not translate word by word.', 'Read the whole sentence and the situation.', 'Guess the meaning; then check with a list or dictionary.', 'Use it in your own sentence — idioms suit speech and informal writing more than formal letters.'),
        remember('Do not change the words of an idiom: "a piece of cake", not "a slice of cake".'),
      ],
      examples: [
        ex('Meaning of: "After getting a job, Sita could stand on her own feet."', ['She earns her own money now.', 'She does not depend on others.'], 'Be independent.'),
        ex('Choose the phrasal verb: "We must ___ girls\' right to education." (stand up for / look down on)', ['We want to defend the right.'], 'stand up for'),
      ],
      practice: [
        mcq('idiom', 'Think of the situation, not the separate words.', [
          ['"The test was a piece of cake." It means the test was…', 'very easy', ['tasty', 'very hard', 'about baking'], 'Idiom, not food.', 'a piece of cake = very easy.'],
          ['"She broke the glass ceiling by becoming the first woman pilot from her district." This means she…', 'overcame an unseen barrier to success', ['broke a window', 'repaired a roof', 'became a glass maker'], 'An invisible barrier.', 'The glass ceiling is an invisible barrier, often for women.'],
          ['"At the party Teja told a joke to break the ice." Break the ice means…', 'start a conversation and make people relax', ['crack frozen water', 'stop the party', 'make people angry'], 'People were shy.', 'break the ice = ease the first awkwardness.'],
          ['"Despite her poverty, she held her head high." This means she was…', 'proud and confident', ['looking at the sky', 'sad and ashamed', 'very tall'], 'An attitude.', 'hold one\'s head high = remain proud.'],
          ['"Never look down on anyone." Look down on means…', 'think someone is less important', ['look at the floor', 'admire', 'take care of'], 'An unkind attitude.', 'look down on = consider inferior.'],
          ['"We cannot put up with unfair treatment." Put up with means…', 'tolerate', ['build', 'raise', 'hang'], 'Accept something unpleasant.', 'put up with = tolerate.'],
        ]),
        typed('particle', 'Type the missing particle(s).', [
          ['Complete: "Girls must speak ___ when they see injustice." (say clearly what they think)', ['up'], 'speak ___.', 'speak up.'],
          ['Complete: "My grandmother brought ___ six children alone." (raised)', ['up'], 'bring ___ = raise.', 'brought up.'],
          ['Complete: "Always stand up ___ your friends when they are bullied." (defend)', ['for'], 'stand up ___.', 'stand up for.'],
          ['Complete: "Some people look down ___ manual work." (consider inferior)', ['on', 'upon'], 'look down ___.', 'look down on.'],
          ['Complete: "We cannot put up ___ this noise any longer." (tolerate)', ['with'], 'put up ___.', 'put up with.'],
        ]),
        matchT('idioms', 'idiom with its meaning', [
          ['stand on one\'s own feet', 'be independent'], ['a piece of cake', 'very easy'], ['break the ice', 'start a friendly conversation'], ['hold one\'s head high', 'be proud and confident'], ['break the glass ceiling', 'overcome an unseen barrier'], ['once in a blue moon', 'very rarely'],
        ], ['Imagine the picture, then the meaning.', 'Blue moons are rare.']),
      ],
    },
    {
      id: 'ts8.en.subjpred.grammar', title: 'Subject and predicate', prereqs: [],
      intro: [
        h('The two parts of every sentence'),
        p('Every complete sentence has two parts. The subject tells WHO or WHAT the sentence is about. The predicate tells what the subject DOES or IS — it contains the verb and everything after it.'),
        keys('"The young engineer | designed a bridge." Subject | Predicate.', 'Simple subject: the main noun/pronoun (engineer). Complete subject: with all its describing words (The young engineer).', 'Simple predicate: the verb (designed). Complete predicate: verb + the rest (designed a bridge).'),
        h('Method: finding the subject and predicate'),
        stepsB('Find the main verb.', 'Ask "Who or what + verb?" — the answer is the subject.', 'Everything that is not the subject is the predicate.', 'Watch for inversions and commands.'),
        keys('Imperatives: the subject "you" is understood: "(You) Close the door."', 'Inverted: "Across the field ran the girls." Subject: the girls; predicate: ran across the field.', 'Questions: "Did Sita win?" Subject: Sita.', '"There is/are": the real subject comes after the verb: "There are three women officers." Subject: three women officers.'),
        remember('The subject is not always the first word: in "In the morning, my aunt drives to work", the subject is "my aunt".'),
      ],
      examples: [
        ex('Find the subject: "My brave cousin from Adilabad joined the police."', ['Verb: joined.', 'Who joined? My brave cousin from Adilabad.'], 'Subject: My brave cousin from Adilabad; predicate: joined the police.'),
        ex('Find the subject: "Stand straight."', ['It is a command.', 'The subject is understood.'], 'Subject: (you) — understood.'),
      ],
      practice: [
        mcq('subject', 'Find the verb, then ask "who or what?"', [
          ['Choose the complete subject: "The women of the village started a dairy."', 'The women of the village', ['started a dairy', 'a dairy', 'village'], 'Who started?', 'The women of the village started.'],
          ['Choose the predicate: "Sana plays cricket every evening."', 'plays cricket every evening', ['Sana', 'Sana plays', 'every evening'], 'Everything except the subject.', 'The predicate is the verb and the rest.'],
          ['What is the subject of "Open the window"?', '(you) — understood', ['the window', 'open', 'there is no subject'], 'It is a command.', 'Commands have an understood subject "you".'],
          ['Choose the subject: "Under the tree sat an old woman."', 'an old woman', ['the tree', 'Under the tree', 'sat'], 'Inverted order.', 'Who sat? An old woman.'],
          ['Choose the subject: "There are many women scientists at ISRO."', 'many women scientists', ['There', 'ISRO', 'are'], '"There" is not the real subject.', 'The real subject follows "are".'],
          ['Choose the simple subject: "The tall, confident girl won the debate."', 'girl', ['tall', 'debate', 'won'], 'The main noun.', 'The head noun of the subject is "girl".'],
        ], 2),
        typed('simple', 'Type ONE word: the simple subject (the main noun or pronoun).', [
          ['Simple subject: "My elder sister became a doctor."', ['sister'], 'Remove "My elder".', 'sister.'],
          ['Simple subject: "Every morning, the busy farmers go to their fields."', ['farmers'], 'Who go?', 'farmers.'],
          ['Simple subject: "She teaches mathematics."', ['she'], 'A pronoun can be a subject.', 'She.'],
          ['Simple subject: "Three brave girls climbed the hill."', ['girls'], 'Who climbed?', 'girls.'],
          ['Simple subject: "Into the room walked the principal."', ['principal'], 'Inverted order.', 'Who walked? the principal.'],
          ['Simple verb (simple predicate): "The athletes ran quickly."', ['ran'], 'The verb only.', 'ran.'],
        ]),
        orderT('build', ['Subject first, then predicate.', 'Keep describing words with their noun.'], [
          ['Arrange to make a sentence.', ['The brave', 'young pilot', 'flew', 'the plane safely.'], 'Complete subject → verb → rest.'],
          ['Arrange to make a sentence.', ['Women in our colony', 'have started', 'a savings group.'], 'Subject → verb → object.'],
          ['Arrange to make a sentence.', ['My grandmother', 'taught', 'me', 'to read Telugu.'], 'Subject → verb → objects.'],
        ]),
      ],
    },
    {
      id: 'ts8.en.poster.write', title: 'Designing a poster (and debating)', prereqs: [],
      intro: [
        h('A message at a glance'),
        p('A poster spreads a message to many people quickly — for awareness, an event or a campaign. It uses few words, a strong slogan and a picture.'),
        h('Elements of a poster'),
        stepsB(
          'Heading / slogan: short, catchy, large letters ("Educate a Girl, Empower a Nation").',
          'Visual: a drawing or symbol that supports the message.',
          'Key information: 3–4 short points, or event details (date, time, venue).',
          'Call to action: what readers should do ("Join us!", "Call 181").',
          'Issued by: the organisation that made the poster.',
        ),
        keys('Few words, big impact.', 'Use slogans with rhyme or repetition.', 'Make important words stand out.', '181 is the Women Helpline number in India; 1098 is the Child Helpline.'),
        h('Debate (oral)'),
        p('In a debate, speakers argue FOR or AGAINST a motion. Order: greet the chair and audience → state your side → give 2–3 arguments with examples → rebut the other side → conclude strongly. Polite language: "I beg to differ", "My worthy opponent said…, but…".'),
        remember('A poster is not a paragraph. If it takes more than a few seconds to read, it is too long.'),
      ],
      examples: [
        ex('Write a slogan for a poster on girls\' education.', ['Short, catchy, maybe with rhyme or repetition.'], '"Teach a Girl, Light a World."'),
        ex('Which is missing from this poster: Slogan ✓, picture ✓, points ✓, "Issued by" ✗?', ['Readers should know who made it.'], 'The name of the organisation that issued it.'),
      ],
      practice: [
        mcq('features', 'A poster is short, visual and catchy.', [
          ['Which is the best poster slogan?', 'Educate Her, Empower Us All!', ['Girls should be educated because education is very important for the progress of the country in many ways.', 'Dear Sir, I want to say something.', 'Once upon a time there was a girl.'], 'Short and catchy.', 'Slogans are short and memorable.'],
          ['What does a call to action tell readers?', 'What they should do', ['The history of the poster', 'The printer\'s address', 'The writer\'s feelings'], 'Action = do.', 'It asks readers to act.'],
          ['Which detail is essential on an event poster?', 'Date, time and venue', ['The artist\'s age', 'A long essay', 'A greeting'], 'People must know where and when.', 'Event posters must give these.'],
          ['In a debate, rebuttal means…', 'answering the arguments of the other side', ['greeting the judges', 'reading a poem', 'agreeing with everyone'], 'Re-but = argue back.', 'A rebuttal counters the opponent\'s points.'],
          ['Which phrase is polite in a debate?', 'I beg to differ with my friend.', ['You are totally stupid.', 'Shut up and listen.', 'Whatever you say is rubbish.'], 'Debates are respectful.', 'Disagree politely.'],
        ]),
        orderT('parts', ['The slogan goes at the top.', '"Issued by" is at the bottom.'], [
          ['Arrange the parts of a poster from top to bottom.', ['Slogan / heading', 'Picture or symbol', 'Key points or event details', 'Call to action', 'Issued by'], 'Catch the eye → show → inform → urge → sign.'],
          ['Arrange the parts of a debate speech.', ['Greet the chair, judges and audience', 'State the motion and your side', 'Give arguments with examples', 'Rebut the other side', 'Conclude strongly'], 'Greet → stand → argue → rebut → conclude.'],
        ]),
        matchT('helplines', 'poster element with its example', [
          ['Slogan', 'Save Water, Save Life'], ['Call to action', 'Join the rally on Sunday!'], ['Issued by', 'Eco Club, ZPHS Medak'], ['Event detail', 'Venue: Town Hall, 10 a.m.'], ['Women Helpline', '181'], ['Child Helpline', '1098'],
        ], ['Slogans are catchy phrases.', '181 is for women; 1098 for children.']),
      ],
    },
  ],
};

// =====================================================================================
// Unit 8 — Gratitude
// =====================================================================================
const u8: USpec = {
  id: 'ts8.en.u8', subject: 'english', title: 'Unit 8 — Gratitude', source: src(8),
  note: 'Reading C (The Dead Rat) is described here as the traditional tale of the merchant\'s apprentice from the Kathasaritsagara; teachers should confirm against the textbook version.',
  objectives: [
    {
      id: 'ts8.en.kotnis.read', title: 'Dr. Kotnis, Be Thankful and The Dead Rat', prereqs: [],
      intro: [
        h('Remembering those who helped us'),
        photo('🩺', 'An Indian doctor who served wounded soldiers and villagers in wartime China — and is still remembered there with gratitude.'),
        p('A. Dr. Dwarakanath Kotnis is about an Indian doctor who served in China. B. Be Thankful is a poem that asks us to be grateful even for difficulties. C. The Dead Rat is a traditional Indian tale about a young man who grows rich from almost nothing — and never forgets who helped him.'),
        h('Reading A in brief (our summary)'),
        p('Dwarakanath Kotnis (1910–1942) was born in Sholapur, Maharashtra. In 1938, during the war between China and Japan, he was one of five Indian doctors sent to China as a medical mission. While the others returned, he stayed on, treating wounded soldiers and villagers in very hard conditions, sometimes operating for days with little rest. He married a Chinese nurse, Guo Qinglan, and they had a son. He died in 1942, aged only 32, from illness and exhaustion. China still honours him with memorials, and the Indian film "Dr. Kotnis Ki Amar Kahani" tells his story.'),
        h('Reading B in brief'),
        p('Be Thankful is a short poem that turns gratitude upside down: it asks us to be thankful for what we do NOT yet have, for difficulties, for limitations and for mistakes — because each of these gives us a chance to learn and grow.'),
        h('Reading C in brief'),
        p('A poor young man hears a rich merchant say that a clever person could start a fortune even with a dead rat. He picks up the rat, sells it as cat food, buys a little gram, and offers water and gram to tired flower-gatherers in exchange for flowers. Step by step, through honest work and good sense, he becomes rich. In gratitude he presents the merchant with a golden rat.'),
        keys('Theme: gratitude — to people, to difficulties, to those who gave us a start.', 'Kotnis: selfless service beyond one\'s own country.', 'The Dead Rat: small beginnings + effort + gratitude.', 'Be Thankful: difficulties are teachers.'),
        remember('Gratitude in this unit is not only saying "thank you"; it is remembering and repaying kindness through action.'),
      ],
      examples: [
        ex('Why is Dr. Kotnis remembered in China?', ['He served there during a war.', 'He stayed when others left and gave his life.'], 'Because he selflessly treated wounded Chinese soldiers and villagers during the war and died in their service.'),
        ex('How did the young man in The Dead Rat show gratitude?', ['The merchant\'s remark gave him his start.', 'He returned to the merchant later.'], 'He gave the merchant a golden rat, acknowledging that the merchant\'s words had started his fortune.'),
      ],
      practice: [
        mcq('understand', 'Go back to the summaries.', [
          ['Where did Dr. Kotnis serve as a doctor?', 'China', ['Japan', 'England', 'Sri Lanka'], 'He married a nurse from there.', 'He was part of the Indian medical mission to China.'],
          ['When was the Indian medical mission sent to China?', '1938', ['1910', '1947', '1962'], 'During the war with Japan.', 'The mission left India in 1938.'],
          ['How old was Dr. Kotnis when he died?', '32', ['52', '72', '22'], 'He lived from 1910 to 1942.', '1942 − 1910 = 32.'],
          ['The poem Be Thankful asks us to be thankful even for…', 'difficulties and mistakes', ['only gifts', 'only good weather', 'nothing'], 'It turns gratitude upside down.', 'Difficulties teach us and help us grow.'],
          ['How did the young man begin his fortune in The Dead Rat?', 'By selling a dead rat as cat food', ['By winning a lottery', 'By finding gold', 'By borrowing money'], 'Read the title.', 'The dead rat was his first "capital".'],
          ['What gift did the young man give the merchant?', 'A golden rat', ['A dead rat', 'A house', 'A bag of gram'], 'It echoes how he began.', 'A golden rat — a thank-you for the idea.'],
        ]),
        orderT('rat', ['The merchant\'s remark comes first.', 'The gift is last.'], [
          ['Put the events of The Dead Rat in order.', ['The merchant says even a dead rat can start a fortune', 'The young man sells the dead rat as cat food', 'He buys gram and gives it to flower-gatherers with water', 'His small business grows step by step', 'He presents the merchant with a golden rat'], 'Remark → first sale → trade → growth → gratitude.'],
          ['Put the events of Dr. Kotnis\'s life in order.', ['Born in Sholapur', 'Studied medicine', 'Went to China with the medical mission', 'Married Guo Qinglan', 'Died in China in 1942'], 'Birth → study → mission → marriage → death.'],
        ]),
        matchT('who', 'person or text with its description', [
          ['Dr. Kotnis', 'Indian doctor who served in wartime China'], ['Guo Qinglan', 'Chinese nurse who married Dr. Kotnis'], ['The merchant', 'Said a fortune could start with a dead rat'], ['The young man', 'Grew rich and gave a golden rat'], ['Be Thankful', 'Poem about gratitude for difficulties'],
        ], ['Recall each summary.', 'One item is a poem.']),
      ],
    },
    {
      id: 'ts8.en.phrase.words', title: 'Useful phrases', prereqs: [],
      intro: [
        h('Ready-made groups of words'),
        p('Some phrases are used again and again in English, especially in formal writing and speeches. Learning them as whole units makes your writing smoother.'),
        keys(
          'in spite of / despite — even though there is (a problem): "In spite of the rain, the match went on."',
          'on behalf of — representing someone: "On behalf of our class, I thank you."',
          'in honour of — to show respect to: "a statue in honour of Dr. Kotnis"',
          'for the sake of — for the good of: "He stayed for the sake of the patients."',
          'at the cost of — losing something to gain something: "He served at the cost of his health."',
          'by means of — using: "by means of a small boat"',
          'in addition to — as well as',
          'as a token of — as a symbol of: "as a token of gratitude"',
        ),
        h('Method'),
        stepsB('Read the sentence and find the relationship needed: contrast, representing, respect, purpose, cost, method.', 'Choose the phrase that expresses it.', 'After these phrases use a noun or -ing form: in spite of being tired (not "in spite of he was tired").'),
        remember('"In spite of" is three words; "despite" is one word with no "of": ✗ despite of.'),
      ],
      examples: [
        ex('Complete: "___ his illness, Kotnis kept operating." (contrast)', ['Contrast with a noun → in spite of / despite.'], 'In spite of (also: Despite)'),
        ex('Complete: "___ the school, I welcome our guests." (representing)', ['Speaking for a group → on behalf of.'], 'On behalf of'),
      ],
      practice: [
        mcq('choose', 'What relationship does the sentence need?', [
          ['"___ the heavy rain, the children reached school on time."', 'In spite of', ['On behalf of', 'In honour of', 'By means of'], 'Contrast.', 'Contrast with a noun → in spite of.'],
          ['"I thank the chief guest ___ all the students."', 'on behalf of', ['in spite of', 'at the cost of', 'by means of'], 'Representing others.', 'on behalf of = representing.'],
          ['"A hospital was named ___ Dr. Kotnis."', 'in honour of', ['in spite of', 'by means of', 'at the cost of'], 'To show respect.', 'in honour of = to show respect.'],
          ['"He worked day and night ___ his own health."', 'at the cost of', ['in honour of', 'on behalf of', 'in addition to'], 'He lost something.', 'at the cost of = losing it.'],
          ['"Please accept this gift ___ our gratitude."', 'as a token of', ['in spite of', 'by means of', 'at the cost of'], 'A symbol.', 'as a token of = as a symbol of.'],
          ['"The message was sent ___ a pigeon."', 'by means of', ['in honour of', 'on behalf of', 'in spite of'], 'The method used.', 'by means of = using.'],
        ]),
        typed('word', 'Type the missing word.', [
          ['Complete: "In ___ of the heat, the farmers worked." (contrast)', ['spite'], 'in ___ of.', 'in spite of.'],
          ['Complete: "On ___ of my parents, I thank you." (representing)', ['behalf'], 'on ___ of.', 'on behalf of.'],
          ['Complete: "She gave up her holiday for the ___ of her sick brother." (for the good of)', ['sake'], 'for the ___ of.', 'for the sake of.'],
          ['Complete: "A function was held in ___ of the retiring teacher." (respect)', ['honour', 'honor'], 'in ___ of.', 'in honour of.'],
          ['Complete: "In ___ to books, the library lends DVDs." (as well as)', ['addition'], 'in ___ to.', 'in addition to.'],
        ]),
        tapT('spot', 'Tap every CORRECT sentence.', [
          ['Despite the rain, we played.', true], ['In spite of the rain, we played.', true], ['On behalf of the club, I welcome you.', true], ['In spite of being tired, she finished.', true],
          ['Despite of the rain, we played.', false], ['In spite of he was tired, he finished.', false], ['On behalf to the club, I welcome you.', false],
        ], ['"despite" has no "of".', 'After "in spite of", use a noun or -ing form.'], 'Check each phrase\'s exact wording and what follows it.'),
      ],
    },
    {
      id: 'ts8.en.complex.grammar', title: 'Compound and complex sentences', prereqs: [],
      intro: [
        h('Joining clauses'),
        def('Simple sentence', 'One main clause: "Kotnis went to China."'),
        def('Compound sentence', 'Two or more MAIN clauses joined by a coordinating conjunction (FANBOYS: for, and, nor, but, or, yet, so): "He was tired, but he kept working."'),
        def('Complex sentence', 'One main clause + one or more SUBORDINATE clauses joined by a subordinating conjunction (because, although, when, if, since, while, until, after, before, unless): "He kept working although he was tired."'),
        h('Method: identifying the type'),
        stepsB(
          'Count the clauses (each has a subject and a verb).',
          'One clause → simple.',
          'Find the joining word. FANBOYS → compound.',
          'because, although, when, if, since, while, until, after, before, unless, that, who, which → complex.',
          'Test: can each part stand alone as a sentence? Both can → compound. One cannot → complex.',
        ),
        keys('Comma before the coordinating conjunction in a compound sentence (usually).', 'If the subordinate clause comes first, put a comma after it: "Although he was tired, he kept working."', 'Do not use two conjunctions for one link: ✗ "Although it rained, but we played."'),
        remember('"Although … but" is a common error. Use one: "Although it rained, we played" OR "It rained, but we played."'),
      ],
      examples: [
        ex('Combine into a compound sentence: "The doctor was exhausted. He continued to operate."', ['Contrast → but.', 'Both stay main clauses.'], 'The doctor was exhausted, but he continued to operate.'),
        ex('Combine into a complex sentence: "The boy was poor. He became rich through hard work."', ['Contrast with subordination → although.', 'The although-clause cannot stand alone.'], 'Although the boy was poor, he became rich through hard work.'),
      ],
      practice: [
        mcq('type', 'Find the joining word and test whether both parts can stand alone.', [
          ['"She studied hard, so she passed." This sentence is…', 'compound', ['simple', 'complex', 'not a sentence'], '"so" is a FANBOYS word.', 'Two main clauses with "so" → compound.'],
          ['"When the guests arrived, the children sang." This sentence is…', 'complex', ['compound', 'simple', 'a phrase'], '"When…" cannot stand alone.', 'Subordinate when-clause + main clause → complex.'],
          ['"Dr. Kotnis served in China." This sentence is…', 'simple', ['compound', 'complex', 'a question'], 'Count the clauses.', 'One clause → simple.'],
          ['"I will help you if you ask me." This sentence is…', 'complex', ['compound', 'simple', 'imperative'], '"if" is subordinating.', 'Main clause + if-clause → complex.'],
          ['Which sentence is correct?', 'Although it was late, we went on working.', ['Although it was late, but we went on working.', 'Although it was late but we went on working.', 'But although it was late, we went on working.'], 'Only one conjunction.', 'Do not use although and but together.', [['Although it was late, but we went on working.', 'Use only one conjunction: drop "but".']]],
          ['"He was poor ___ he was honest." Choose the coordinating conjunction.', 'but', ['because', 'although', 'when'], 'FANBOYS, showing contrast.', '"but" is a coordinating conjunction of contrast.'],
        ], 2),
        typed('join', 'Type ONE conjunction that joins the clauses correctly.', [
          ['Fill in: "We stayed indoors ___ it was raining." (reason)', ['because', 'as', 'since'], 'Reason → subordinating.', 'because (as/since).'],
          ['Fill in: "___ she was tired, she helped her mother." (contrast, at the start)', ['although', 'though', 'even though'], 'Contrast, subordinating.', 'Although she was tired, …'],
          ['Fill in: "Hurry up, ___ you will miss the bus." (otherwise)', ['or'], 'FANBOYS word meaning otherwise.', 'or = otherwise.'],
          ['Fill in: "Wait here ___ I come back." (up to the time)', ['until', 'till'], 'Time limit.', 'until.'],
          ['Fill in: "She was hungry, ___ she ate two chapatis." (result)', ['so'], 'FANBOYS word for result.', 'so.'],
          ['Fill in: "You will not pass ___ you work hard." (if not)', ['unless'], 'unless = if not.', 'unless.'],
        ]),
        tapT('sub', 'Tap every SUBORDINATING conjunction.', [
          ['because', true], ['although', true], ['unless', true], ['when', true], ['since', true],
          ['and', false], ['but', false], ['or', false], ['so', false],
        ], ['FANBOYS are coordinating.', 'Subordinating conjunctions start a clause that cannot stand alone.'], 'because, although, unless, when, since are subordinating; and, but, or, so are coordinating (FANBOYS).', 6),
      ],
    },
    {
      id: 'ts8.en.headline.write', title: 'News headlines, articles and a vote of thanks', prereqs: [],
      intro: [
        h('Writing for readers and listeners'),
        h('News headlines'),
        keys(
          'Use the simple present for past events: "Village School Wins State Prize".',
          'Use "to" + verb for the future: "CM to Open New Hospital".',
          'Passive without "is/was": "Doctor Honoured in Beijing".',
          'Drop articles (a, an, the) and most helping verbs.',
          'Capitalise main words; keep it short.',
        ),
        h('Article'),
        stepsB('Title (catchy).', 'By-line: "by [name], Class 8".', 'Introduction: hook the reader and state the topic.', 'Body: 2–3 paragraphs with facts, examples, causes and effects.', 'Conclusion: a suggestion or message.'),
        h('Vote of thanks (oral)'),
        stepsB('Address the gathering: "Respected chief guest, Headmaster, teachers and friends…"', 'Thank the chief guest first.', 'Thank the Headmaster / organisers.', 'Thank teachers, performers, helpers and the audience.', 'End warmly: "Thank you all."'),
        remember('A vote of thanks is short (2–3 minutes). Name people in order of importance and do not forget the helpers behind the scenes.'),
      ],
      examples: [
        ex('Write a headline for: "The students of ZPHS Bhongir won the state science fair yesterday."', ['Simple present for a past event.', 'Drop articles.'], 'Bhongir Students Win State Science Fair'),
        ex('Write a headline for: "The Collector will inaugurate the new library tomorrow."', ['Future → "to" + verb.'], 'Collector to Inaugurate New Library'),
      ],
      practice: [
        mcq('headline', 'Short, simple present, no articles.', [
          ['Choose the best headline: "A girl from Mulugu won a gold medal in archery."', 'Mulugu Girl Wins Archery Gold', ['A Girl From Mulugu Has Won A Gold Medal In Archery Yesterday', 'The girl won', 'Archery is good'], 'Short and present tense.', 'Headlines are short and use the simple present.'],
          ['Choose the best headline for a future event: "The Minister will open a bridge."', 'Minister to Open Bridge', ['Minister Opened Bridge', 'The Minister Is Opening The Bridge Tomorrow Morning Hopefully', 'Bridge'], 'Future → to + verb.', '"to" + verb shows a future event.'],
          ['Choose the best headline: "The doctor was honoured by the villagers."', 'Doctor Honoured by Villagers', ['The Doctor Was Being Honoured', 'Villagers', 'Honour Doctor Was'], 'Passive without "was".', 'Drop "was" in passive headlines.'],
          ['Which is NOT a feature of headlines?', 'Long sentences with many articles', ['Simple present for past events', 'Dropping "a" and "the"', 'Capitalised main words'], 'Headlines are brief.', 'Headlines avoid long sentences.'],
          ['Whom should a vote of thanks thank first?', 'The chief guest', ['The sound technician', 'The audience', 'The writer\'s best friend'], 'Most important person first.', 'The chief guest is thanked first.'],
        ]),
        orderT('vote', ['Address the gathering first.', '"Thank you all" ends it.'], [
          ['Arrange the parts of a vote of thanks.', ['Address the gathering', 'Thank the chief guest', 'Thank the Headmaster and organisers', 'Thank teachers, performers and helpers', 'Thank the audience and close'], 'Order of importance, ending with everyone.'],
          ['Arrange the parts of an article.', ['Title', 'By-line', 'Introduction with a hook', 'Body paragraphs with facts and examples', 'Conclusion with a message'], 'Title → by-line → intro → body → conclusion.'],
        ]),
        typed('verb', 'Type the verb form used in a headline.', [
          ['Headline verb: "The team won the cup." → "Team ___ Cup"', ['wins'], 'Simple present for past events.', 'won → Wins.', [['won', 'Headlines use the simple present: Wins.']]],
          ['Headline verb: "The PM will visit Hyderabad." → "PM ___ Visit Hyderabad"', ['to'], 'Future → to + verb.', 'PM to Visit Hyderabad.'],
          ['Headline verb: "Floods hit Bhadrachalam yesterday." → "Floods ___ Bhadrachalam"', ['hit'], 'hit stays hit in the present.', 'Floods Hit Bhadrachalam.'],
          ['Headline verb: "A thief was caught by the police." → "Thief ___ by Police"', ['caught'], 'Passive without "was".', 'Thief Caught by Police.'],
          ['Headline verb: "Farmers protested against low prices." → "Farmers ___ Low Prices"', ['protest'], 'Plural subject, simple present.', 'Farmers Protest Low Prices.'],
        ]),
      ],
    },
  ],
};

export const units: USpec[] = [u1, u2, u3, u4, u5, u6, u7, u8];
