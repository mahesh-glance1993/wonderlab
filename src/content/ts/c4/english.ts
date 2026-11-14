// Telangana SCERT Class 4 — English Reader. Original teaching aligned to the official chapter list
// (src/content/ts/books.ts, syllabus.json). We teach ABOUT each reading in our own words; textbook stories
// and poems are never reproduced.
import { tp, ex, p, tip, keys, photo, choose, pictures, matching, ordering, tapAll, type USpec, type OSpec, type ExSpec, type TSpec } from '../../lib/kit';
import type { Block } from '../../../shared/content';
import { tsSrc } from '../books';

// ---------- compact practice factories ----------
/** [question, correct, wrong options, gentle hint, why it is right] */
type MQ = [string, string, string[], string, string];
/** [question, [emoji, label] correct, [emoji, label] wrong, gentle hint, why] */
type PQ = [string, [string, string], [string, string][], string, string];
interface Spec {
  id: string; title: string; intro: Block[]; ex: ExSpec[];
  hint: string;
  mcq?: MQ[]; pic?: PQ[];
  match?: [prompt: string, pool: [string, string][]];
  order?: [prompt: string, seqs: string[][]];
  tap?: [prompt: string, pool: [string, boolean][], why: string];
}
const LAST = 'Read every option slowly and cross out the ones that clearly do not fit.';

function obj(s: Spec): OSpec {
  const practice: TSpec[] = [];
  if (s.mcq) {
    const bank = s.mcq;
    practice.push(tp('mcq', (r) => {
      const [q, a, w, h1, why] = r.pick(bank);
      return {
        type: 'mcq', prompt: q, ...choose(r, a, w), hints: [s.hint, h1, LAST],
        mistakes: [{ when: 'wrong', explain: `Not quite — that's okay! ${why}` }], solution: [`Answer: ${a}.`, why],
      };
    }));
  }
  if (s.pic) {
    const bank = s.pic;
    practice.push(tp('pic', (r) => {
      const [q, [ce, cl], w, h1, why] = r.pick(bank);
      return {
        type: 'mcq', prompt: q,
        ...pictures(r, { label: cl, visual: { kind: 'emoji', text: ce } }, w.map(([e, l]) => ({ label: l, visual: { kind: 'emoji' as const, text: e } })), 3),
        hints: [s.hint, h1, 'Look at each picture and say its name aloud.'],
        mistakes: [{ when: 'wrong', explain: `Not quite — look again. ${why}` }], solution: [`Answer: ${cl}.`, why],
      };
    }));
  }
  if (s.match) {
    const [prompt, pool] = s.match;
    practice.push(tp('match', (r) => {
      const pairs = r.shuffle(pool).slice(0, 4);
      const m = matching(r, pairs);
      return {
        type: 'match', prompt: `${prompt}: ${pairs.map((x) => x[0]).join(' · ')}`, left: m.left, right: m.right, answer: m.answer,
        hints: [s.hint, 'Join the pair you are surest of first — the rest get easier.'],
        mistakes: [{ when: 'wrong', explain: 'One pair is mixed up. Check each pair again, one at a time.' }],
        solution: pairs.map(([a, b]) => `${a} → ${b}`),
      };
    }, 2));
  }
  if (s.order) {
    const [prompt, seqs] = s.order;
    seqs.forEach((q) => { if (new Set(q).size !== q.length) throw new Error(`${s.id}: repeated word in ${q.join(' ')}`); });
    practice.push(tp('order', (r) => {
      const seq = r.pick(seqs);
      return {
        type: 'order', prompt, ...ordering(r, seq),
        hints: [s.hint, `It begins with "${seq[0]}".`, `It ends with "${seq[seq.length - 1]}".`],
        mistakes: [{ when: 'wrong', explain: 'The order is not right yet. Start with the first one and ask, "What comes next?"' }],
        solution: [seq.join(' ')],
      };
    }, 2));
  }
  if (s.tap) {
    const [prompt, pool, why] = s.tap;
    const yes = pool.find((x) => x[1])!, no = pool.find((x) => !x[1])!;
    practice.push(tp('tap', (r) => {
      const pick = r.shuffle(pool).slice(0, 5);
      if (!pick.some((x) => x[1])) pick[0] = yes;
      if (!pick.some((x) => !x[1])) pick[4] = no;
      const k = pick.filter((x) => x[1]).length;
      return {
        type: 'tap', prompt, ...tapAll(r, pick.map(([label, ok]) => ({ label, ok }))),
        hints: [s.hint, `There ${k === 1 ? 'is 1 correct answer' : `are ${k} correct answers`}.`],
        mistakes: [{ when: 'wrong', explain: `Check each option on its own. ${why}` }],
        solution: [`Correct: ${pick.filter((x) => x[1]).map((x) => x[0]).join(', ')}.`, why],
      };
    }, 2));
  }
  return { id: s.id, title: s.title, prereqs: [], intro: s.intro, examples: s.ex, practice };
}

const unit = (n: number, title: string, objectives: OSpec[], note?: string): USpec => ({
  id: `ts4.en.u${n}`, subject: 'english', title, source: tsSrc(4, 'english', n), objectives, ...(note ? { note } : {}),
});

// ============================================================ 0. Bridging
const u0 = unit(0, 'Getting Ready: Picture Talk', [
  obj({
    id: 'ts4.en.ready.words', title: 'Naming things in pictures', hint: 'Say the name of each picture aloud first.',
    intro: [
      p('Before the reader begins, we warm up by looking at pictures and naming what we see. Every thing has a name: a cow, a tree, a bus, a book.'),
      photo('🏫', 'A school — what can you see in and around your school?'),
      tip('Speak in a full sentence: "I can see a red bus."'),
      keys('Look carefully', 'Name the thing', 'Say a full sentence about it'),
    ],
    ex: [
      ex('Look at 🐄. Say a sentence.', ['Name it: cow.', 'Add something you see or know.'], 'I can see a cow. It gives us milk.'),
      ex('Look at 🚌. Say a sentence.', ['Name it: bus.', 'Where does it go?'], 'This is a bus. It takes us to town.'),
    ],
    pic: [
      ['Which one is a "tree"?', ['🌳', 'tree'], [['🏠', 'house'], ['🚌', 'bus']], 'It has leaves and branches.', 'A tree 🌳 has a trunk, branches and leaves.'],
      ['Which one is a "bus"?', ['🚌', 'bus'], [['🚲', 'bicycle'], ['✈️', 'aeroplane']], 'Many people ride in it on the road.', 'A bus 🚌 carries many people.'],
      ['Which one is a "book"?', ['📖', 'book'], [['✏️', 'pencil'], ['🎒', 'bag']], 'We read it.', 'We read a book 📖.'],
      ['Which one is a "cow"?', ['🐄', 'cow'], [['🐐', 'goat'], ['🐃', 'buffalo']], 'It is white or brown and gives milk.', 'A cow 🐄 gives us milk.'],
      ['Which one is an "umbrella"?', ['☂️', 'umbrella'], [['🎈', 'balloon'], ['🪁', 'kite']], 'We hold it in the rain.', 'An umbrella ☂️ keeps us dry.'],
      ['Which one is a "clock"?', ['⏰', 'clock'], [['🔔', 'bell'], ['🥁', 'drum']], 'It tells the time.', 'A clock ⏰ tells the time.'],
    ],
    tap: ['Tap the things you can find in a classroom', [
      ['blackboard', true], ['books', true], ['desk', true], ['chalk', true], ['bench', true], ['cow', false], ['boat', false], ['tiger', false],
    ], 'A classroom has a blackboard, books, desks, chalk and benches.'],
  }),
  obj({
    id: 'ts4.en.ready.polite', title: 'Greetings and polite words', hint: 'Think: what would a kind, polite child say here?',
    intro: [
      p('We use polite words every day: "Good morning", "Please", "Thank you", "Sorry", "Excuse me". They make people feel respected.'),
      photo('🙋', 'Raise your hand and say "Excuse me, may I ask a question?"'),
      keys('Asking → Please', 'Getting help → Thank you', 'A mistake → Sorry', 'Morning → Good morning'),
      tip('A sentence starts with a capital letter and ends with a full stop (.) or question mark (?).'),
    ],
    ex: [
      ex('Your teacher enters at 9 a.m. What do you say?', ['It is morning.'], 'Good morning, teacher.'),
      ex('Your friend lends you a pencil. What do you say?', ['Someone helped you.'], 'Thank you.'),
    ],
    mcq: [
      ['You want water. What should you say?', 'May I have some water, please?', ['Give water!', 'Water now.', 'I don\'t want water.'], 'Polite asking uses "please".', '"Please" makes a request polite.'],
      ['You bumped into someone by mistake. You say:', 'Sorry!', ['Thank you!', 'Good night!', 'Hurry up!'], 'You made a small mistake.', 'We say "Sorry" for a mistake.'],
      ['You meet your friend in the evening. You say:', 'Good evening!', ['Good morning!', 'Good night!', 'Goodbye!'], 'It is evening.', '"Good evening" is the evening greeting.'],
      ['Someone gives you a gift. You say:', 'Thank you!', ['Sorry!', 'Excuse me!', 'Please!'], 'They were kind to you.', 'We say "Thank you" for kindness.'],
      ['You need to pass someone in a crowd. You say:', 'Excuse me.', ['Thank you.', 'Good morning.', 'Well done.'], 'You need them to make way.', '"Excuse me" asks politely to pass.'],
    ],
    order: ['Put the words in order to make a sentence', [
      ['Good', 'morning,', 'teacher.'], ['May', 'I', 'come', 'in?'], ['Thank', 'you', 'very', 'much.'],
      ['Please', 'open', 'the', 'door.'], ['I', 'am', 'sorry.'], ['My', 'name', 'is', 'Ravi.'],
    ]],
  }),
]);

// ============================================================ 1. Ekalavya; School is Fun
const u1 = unit(1, 'Unit 1: Ekalavya · School is Fun', [
  obj({
    id: 'ts4.en.ekalavya.story', title: 'Ekalavya: a learner who never gave up', hint: 'Remember: Ekalavya practised alone, every day, with great respect for his teacher.',
    intro: [
      p('Ekalavya is a story from the Mahabharata. Ekalavya was a boy from a forest tribe who dreamed of learning archery (shooting with a bow and arrow) from the great teacher Dronacharya. When he could not study with Drona, he did not give up.'),
      photo('🏹', 'A bow and arrow — Ekalavya practised archery every single day.'),
      p('He made a clay statue of Drona, treated it as his teacher, and practised alone in the forest. With hard work he became an amazing archer. The story teaches us about determination (never giving up), practice and respect for teachers. Read the full story in your Reader.'),
      tip('Retell the story in 4 parts: the dream → the problem → his hard work → the ending.'),
      keys('Ekalavya: a tribal boy who wanted to learn archery', 'Dronacharya: the great teacher (guru)', 'Values: hard work, practice, respect'),
    ],
    ex: [
      ex('What did Ekalavya want to learn?', ['He wanted to use a bow and arrow well.'], 'Archery'),
      ex('How did Ekalavya learn without a teacher beside him?', ['He made a clay statue of Drona.', 'He practised in front of it every day.'], 'He practised daily before a statue of his guru.'),
    ],
    mcq: [
      ['What did Ekalavya want to learn?', 'archery', ['dancing', 'cooking', 'swimming'], 'Think of the bow and arrow.', 'Ekalavya wanted to learn archery.'],
      ['Who did Ekalavya think of as his teacher?', 'Dronacharya', ['Krishna', 'Birbal', 'the miller'], 'He made a clay statue of him.', 'Dronacharya was his guru in his heart.'],
      ['Where did Ekalavya practise?', 'in the forest', ['in a palace', 'in a market', 'on a ship'], 'He lived among trees.', 'He practised alone in the forest.'],
      ['What did Ekalavya make to help him learn?', 'a clay statue of his teacher', ['a kite', 'a boat', 'a drum'], 'He made it from mud/clay.', 'He made a clay statue of Drona.'],
      ['Which word best describes Ekalavya?', 'determined', ['lazy', 'rude', 'careless'], 'He never gave up.', 'Determined means never giving up.'],
    ],
    order: ['Put the story events in order', [
      ['Ekalavya wanted to learn archery.', 'He could not study with Drona.', 'He made a clay statue.', 'He practised every day.'],
      ['He made a clay statue.', 'He practised every day.', 'He became a great archer.'],
      ['Ekalavya had a dream.', 'He faced a problem.', 'He worked very hard.', 'He became skilled.'],
      ['Ekalavya wanted to learn archery.', 'He made a clay statue.', 'He became a great archer.'],
      ['He could not study with Drona.', 'He did not give up.', 'He practised alone.', 'He became skilled.'],
    ]],
  }),
  obj({
    id: 'ts4.en.school.poem', title: '"School is Fun": things we enjoy at school', hint: 'Think about your own school day.',
    intro: [
      p('"School is Fun" is a cheerful poem about the happy things children do at school — learning, reading, playing with friends, singing and drawing.'),
      photo('🎒', 'Ready for school! Books, pencils and a smile.'),
      p('Poems have rhyming words at the ends of lines, like "play" and "day", or "school" and "cool". Read the poem aloud and clap the rhythm.'),
      tip('Find the rhyming pairs in the poem and underline them.'),
      keys('A poem has lines and often rhymes', 'Rhyming words end with the same sound: fun – sun, play – day'),
    ],
    ex: [
      ex('Find a word that rhymes with "fun".', ['f-UN … what else ends in "un"?'], 'sun (or run)'),
      ex('Name two fun things to do at school.', ['Think of the playground and the classroom.'], 'Playing games and reading stories'),
    ],
    match: ['Match the rhyming words', [
      ['fun', 'sun'], ['play', 'day'], ['school', 'pool'], ['book', 'look'], ['friend', 'end'], ['sing', 'ring'],
    ]],
    tap: ['Tap the things we do at school', [
      ['read books', true], ['play games', true], ['sing songs', true], ['draw pictures', true], ['learn sums', true],
      ['sleep all day', false], ['milk the cows', false], ['drive a bus', false],
    ], 'At school we read, play, sing, draw and learn.'],
  }),
  obj({
    id: 'ts4.en.nouns.proper', title: 'Common and proper nouns', hint: 'Is it a special name of ONE person or place? Then it is proper and starts with a capital letter.',
    intro: [
      p('A noun is a naming word. A common noun names any person, place or thing: boy, city, river. A proper noun is the special name of one person, place or thing: Ekalavya, Hyderabad, Godavari. Proper nouns always begin with a capital letter.'),
      photo('🏞️', 'river = common noun · Godavari = proper noun'),
      keys('boy → Ravi', 'city → Hyderabad', 'river → Godavari', 'teacher → Dronacharya', 'Proper nouns start with a CAPITAL letter'),
      tip('Days and months are proper nouns too: Monday, June.'),
    ],
    ex: [
      ex('In "Ekalavya lived in the forest", which is the proper noun?', ['Ekalavya is a special name.', 'forest is any forest.'], 'Ekalavya'),
      ex('Give a proper noun for "city".', ['Our state capital.'], 'Hyderabad'),
    ],
    mcq: [
      ['Which is a proper noun?', 'Hyderabad', ['city', 'school', 'river'], 'Look for a special name with a capital letter.', 'Hyderabad is the name of one city.'],
      ['Which is a common noun?', 'teacher', ['Drona', 'Meena', 'Warangal'], 'It can mean any person of that kind.', '"teacher" can mean any teacher.'],
      ['"Meena reads a book." The proper noun is:', 'Meena', ['reads', 'book', 'a'], 'Whose special name is it?', 'Meena is a person\'s name.'],
      ['Which word needs a capital letter?', 'monday', ['bench', 'apple', 'river'], 'Days of the week are special names.', 'Monday is a proper noun.'],
      ['"The Godavari is a long river." The common noun is:', 'river', ['Godavari', 'long', 'is'], 'Which one names any river?', '"river" is a common noun.'],
    ],
    match: ['Match the common noun with a proper noun', [
      ['city', 'Hyderabad'], ['river', 'Krishna'], ['boy', 'Arjun'], ['day', 'Sunday'], ['month', 'June'], ['country', 'India'],
    ]],
  }),
]);

// ============================================================ 2. The Pancake; The Monkeys Go Fasting
const u2 = unit(2, 'Unit 2: The Pancake · The Monkeys Go Fasting', [
  obj({
    id: 'ts4.en.pancake.story', title: 'The runaway pancake: a repeating tale', hint: 'This kind of tale repeats a pattern again and again.',
    intro: [
      p('"The Pancake" is an old folk tale. A pancake is cooking in a pan — and suddenly it jumps out and rolls away! One after another, many people and animals try to catch it, and each time it rolls on. In the end, a clever animal tricks it.'),
      photo('🥚', 'A pancake is a flat, round cake made from flour, milk and eggs, cooked in a pan. (Think of a dosa!)'),
      p('Tales like this are called cumulative tales: the same thing happens again and again with a new character each time. The pattern helps us guess what comes next. Read how your Reader tells it.'),
      tip('Make a list of everyone who chased the pancake, in order.'),
      keys('Folk tale = an old story passed down by people', 'Pattern: the pancake meets someone → they chase → it rolls away', 'Lesson: being too proud or careless can get you into trouble'),
    ],
    ex: [
      ex('What did the pancake do when it was nearly cooked?', ['It did not want to be eaten.'], 'It jumped out of the pan and rolled away.'),
      ex('Why is the story easy to remember?', ['The same thing happens again and again.'], 'Because it repeats a pattern.'),
    ],
    mcq: [
      ['What is a pancake?', 'a flat, round cake cooked in a pan', ['a kind of bird', 'a cooking pot', 'a toy'], 'It is food.', 'A pancake is flat food cooked in a pan.'],
      ['What did the pancake do?', 'rolled away', ['flew into the sky', 'fell asleep', 'sang a song'], 'It was round, like a wheel.', 'The pancake rolled away.'],
      ['Why did everyone chase the pancake?', 'They wanted to eat it.', ['They wanted to play cricket.', 'It was raining.', 'It had stolen something.'], 'A pancake is food.', 'Everyone was hungry for it.'],
      ['What kind of story is "The Pancake"?', 'a folk tale', ['a news report', 'a letter', 'a science lesson'], 'An old story told by people for years.', 'It is a folk tale.'],
      ['What happens again and again in the story?', 'Someone chases the pancake and it rolls on.', ['The pancake grows bigger.', 'It snows.', 'A king gives a prize.'], 'Look for the pattern.', 'The chase repeats with new characters.'],
    ],
    order: ['Put the story pattern in order', [
      ['The pancake was cooking.', 'It jumped out of the pan.', 'It rolled away.', 'Someone chased it.'],
      ['The pancake met someone.', 'They asked it to stop.', 'It rolled on.'],
      ['It jumped out of the pan.', 'Many chased it.', 'A clever animal tricked it.'],
      ['Mother made a pancake.', 'The pancake jumped out.', 'Everyone ran after it.'],
      ['The pancake was cooking.', 'It rolled away.', 'A clever animal tricked it.'],
    ]],
  }),
  obj({
    id: 'ts4.en.monkeys.story', title: 'The Monkeys Go Fasting: promises and excuses', hint: 'The monkeys kept finding small excuses to get closer to the food.',
    intro: [
      p('In this funny folk tale, a group of monkeys decides to fast (not eat) for a whole day. But they keep thinking about food! Step by step, they make little excuses — "let\'s just keep the fruit ready" — until the fast is broken.'),
      photo('🐒', 'The monkeys meant well, but they could not keep their promise.'),
      p('The story laughs at how easy it is to break a promise to ourselves. It teaches: keep your word, and don\'t fool yourself with excuses.'),
      tip('As you read, list each excuse the monkeys make.'),
      keys('fast = to stay without food for some time', 'excuse = a reason we give to do what we want', 'Lesson: keep your promises'),
    ],
    ex: [
      ex('What does "fasting" mean?', ['To fast = to not eat for a time.'], 'Staying without food'),
      ex('Why is the story funny?', ['The monkeys promised not to eat.', 'But they kept getting closer to the food.'], 'They break their own promise step by step.'),
    ],
    mcq: [
      ['What did the monkeys decide to do?', 'fast for a day', ['build a house', 'go to school', 'climb a mountain'], 'Read the title.', 'They decided to fast.'],
      ['"Fast" in this story means:', 'not eating', ['running quickly', 'sleeping', 'singing'], 'It is about food.', 'Here "fast" means staying without food.'],
      ['Did the monkeys keep their promise?', 'No, they broke it.', ['Yes, easily.', 'They forgot about it.', 'They fasted for a month.'], 'Think of the ending.', 'The monkeys broke their fast.'],
      ['What lesson does the story teach?', 'Keep your promises.', ['Always eat fast.', 'Never share fruit.', 'Monkeys can fly.'], 'What did the monkeys fail to do?', 'Keep your word; don\'t make excuses.'],
      ['What kept making the monkeys break their plan?', 'thinking about food', ['the rain', 'a lion', 'a teacher'], 'They were hungry.', 'Their hunger made them find excuses.'],
    ],
  }),
  obj({
    id: 'ts4.en.feelings.words', title: 'Words for pleasant and unpleasant feelings', hint: 'Would you like to feel this way? If yes, it is pleasant.',
    intro: [
      p('Feeling words tell us how someone feels. Pleasant feelings are nice: happy, proud, excited, calm. Unpleasant feelings are not nice: sad, angry, scared, hungry, tired.'),
      photo('😢', 'Sad is an unpleasant feeling. A kind word can help.'),
      keys('Pleasant: happy, glad, excited, proud, calm', 'Unpleasant: sad, angry, scared, worried, hungry'),
      tip('Use "feel": "I feel happy." "The monkeys felt hungry."'),
    ],
    ex: [
      ex('The monkeys had no food all morning. How did they feel?', ['No food for a long time…'], 'hungry (unpleasant)'),
      ex('Ravi won a prize. How did he feel?', ['Winning is nice.'], 'happy / proud (pleasant)'),
    ],
    tap: ['Tap the pleasant feelings', [
      ['happy', true], ['excited', true], ['proud', true], ['calm', true], ['glad', true],
      ['sad', false], ['angry', false], ['scared', false], ['worried', false],
    ], 'Happy, excited, proud, calm and glad are pleasant.'],
    mcq: [
      ['Meena lost her pencil. She feels:', 'sad', ['happy', 'proud', 'excited'], 'Losing something is not nice.', 'She feels sad.'],
      ['It is your birthday tomorrow! You feel:', 'excited', ['angry', 'bored', 'scared'], 'You can\'t wait!', 'You feel excited.'],
      ['A big dog barks at Kiran. He feels:', 'scared', ['glad', 'proud', 'calm'], 'A sudden loud bark…', 'He feels scared.'],
      ['Which is an unpleasant feeling?', 'angry', ['happy', 'calm', 'proud'], 'Which one is not nice to feel?', 'Angry is unpleasant.'],
      ['Diya drew a beautiful picture. She feels:', 'proud', ['sad', 'scared', 'tired'], 'She did something well.', 'She feels proud.'],
    ],
  }),
], 'The Pancake: ending details vary between versions — teacher should confirm against the Reader.');

// ============================================================ 3. What is a Tree?; The Lion King
const u3 = unit(3, 'Unit 3: What is a Tree? · The Lion King', [
  obj({
    id: 'ts4.en.tree.gifts', title: 'What trees give us', hint: 'Think of the shade, fruit, birds and air around a tree.',
    intro: [
      p('"What is a Tree?" is a poem that helps us see a tree in many ways — as a home for birds, a shady umbrella, a giver of fruit and a friend to the earth.'),
      photo('🌳', 'A tree gives shade, fruit, wood, a home for birds and fresh air.'),
      p('The other reading, "The Lion King", is a story set in the forest, the home of many animals and trees. Read both in your Reader and talk about why forests matter.'),
      tip('Finish the sentence in many ways: "A tree is …" (a home, an umbrella, a friend).'),
      keys('Parts: roots, trunk, branches, leaves', 'Gifts: shade, fruit, flowers, wood, oxygen', 'Trees are homes for birds and animals'),
    ],
    ex: [
      ex('Why do people sit under a tree on a hot day?', ['The leaves block the sun.'], 'For shade'),
      ex('Name two animals that live in trees.', ['Think of nests and branches.'], 'Birds and monkeys (also squirrels)'),
    ],
    pic: [
      ['Which part of a tree holds it in the soil?', ['🌱', 'roots'], [['🍃', 'leaves'], ['🌸', 'flowers']], 'It is under the ground.', 'The roots 🌱 hold the tree in the soil.'],
      ['Which animal often lives in a tree?', ['🐿️', 'squirrel'], [['🐟', 'fish'], ['🐄', 'cow']], 'It runs up the trunk.', 'Squirrels 🐿️ live in trees.'],
      ['What do birds build in trees?', ['🪺', 'nests'], [['🏠', 'houses'], ['🚗', 'cars']], 'Where they lay eggs.', 'Birds build nests 🪺.'],
      ['What fruit grows on a tree?', ['🥭', 'mango'], [['🥕', 'carrot'], ['🥔', 'potato']], 'It hangs from branches.', 'Mangoes 🥭 grow on trees; carrots and potatoes grow under the soil.'],
      ['What do we get from tree trunks?', ['🪵', 'wood'], [['🧊', 'ice'], ['🥛', 'milk']], 'Used to make tables and doors.', 'We get wood 🪵 from trees.'],
    ],
    tap: ['Tap the things trees give us', [
      ['shade', true], ['fruit', true], ['wood', true], ['fresh air', true], ['homes for birds', true],
      ['plastic', false], ['petrol', false], ['noise', false],
    ], 'Trees give shade, fruit, wood, fresh air and homes for birds.'],
  }),
  obj({
    id: 'ts4.en.plants.products', title: 'Plant products: fruits, vegetables and flowers', hint: 'Fruits are usually sweet; vegetables go into curry; flowers are colourful and smell nice.',
    intro: [
      p('Plants give us many products. Fruits: mango, banana, apple, grapes. Vegetables: brinjal, tomato, carrot, potato. Flowers: jasmine, rose, marigold, lotus. We also get grains (rice, wheat), cotton and spices.'),
      photo('🍆', 'Brinjal is a vegetable. We cook it in curry.'),
      keys('Fruits: mango, banana, grapes', 'Vegetables: brinjal, carrot, potato', 'Flowers: rose, jasmine, marigold', 'Others: rice, cotton, coconut'),
      tip('Some foods like tomato are fruits to scientists but we cook them as vegetables — in this lesson we follow the kitchen way.'),
    ],
    ex: [
      ex('Is a carrot a fruit or a vegetable?', ['We cook it or eat it in salad.', 'It grows under the soil.'], 'vegetable'),
      ex('Name a flower used to make garlands.', ['White, sweet-smelling.'], 'jasmine (or marigold)'),
    ],
    match: ['Match each item to its group', [
      ['mango', 'fruit'], ['brinjal', 'vegetable'], ['jasmine', 'flower'], ['rice', 'grain'], ['cotton', 'used for cloth'], ['banana', 'fruit'],
    ]],
    pic: [
      ['Which one is a fruit?', ['🍇', 'grapes'], [['🥕', 'carrot'], ['🧅', 'onion']], 'Sweet and eaten raw.', 'Grapes 🍇 are fruits.'],
      ['Which one is a vegetable?', ['🍆', 'brinjal'], [['🍌', 'banana'], ['🍎', 'apple']], 'We cook it in curry.', 'Brinjal 🍆 is a vegetable.'],
      ['Which one is a flower?', ['🌼', 'marigold'], [['🥒', 'cucumber'], ['🍍', 'pineapple']], 'Colourful, used in garlands.', 'Marigold 🌼 is a flower.'],
      ['Which one is a grain?', ['🌾', 'rice'], [['🍊', 'orange'], ['🥔', 'potato']], 'We cook it to make annam.', 'Rice 🌾 is a grain.'],
      ['Which one grows under the soil?', ['🥔', 'potato'], [['🍎', 'apple'], ['🥭', 'mango']], 'We dig it out.', 'Potatoes 🥔 grow under the soil.'],
    ],
  }),
], 'The Lion King: plot not summarised here (not confirmed from the Reader) — teacher should add story questions.');

// ============================================================ 4. The Miller, His Son and His Donkey; Be Happy
const u4 = unit(4, 'Unit 4: The Miller, His Son and His Donkey · Be Happy', [
  obj({
    id: 'ts4.en.miller.story', title: 'You cannot please everyone', hint: 'Each time someone spoke, the miller changed his plan.',
    intro: [
      p('This is an old fable (Aesop). A miller and his son take their donkey to the market. People on the road keep criticising them. Each time, the miller changes what they do — the son rides, then the father rides, then both ride, and at last they try to carry the donkey! Everything goes wrong.'),
      photo('🌾', 'A miller grinds grain like wheat into flour; his donkey carries the heavy sacks.'),
      p('The lesson: if you try to please everyone, you may please no one. Listen to advice, but think for yourself.'),
      tip('Retell: who said what, and what did the miller change each time?'),
      keys('A miller grinds grain into flour at a mill', 'Fable = a short story with a lesson', 'Lesson: you cannot please everyone; think for yourself'),
      p('"Be Happy" is a cheerful poem in the same unit. Read it and share what makes you happy.'),
    ],
    ex: [
      ex('What is a miller?', ['A mill turns grain into flour.'], 'A person who grinds grain into flour'),
      ex('Why did the miller keep changing his plan?', ['Each person on the road said something different.', 'He wanted to please them all.'], 'He tried to please everyone he met.'),
    ],
    mcq: [
      ['Where were the miller and his son going?', 'to the market', ['to school', 'to the sea', 'to a wedding'], 'They wanted to sell the donkey.', 'They were going to the market.'],
      ['Why did the miller keep changing things?', 'People kept criticising him.', ['The donkey spoke.', 'It started to rain.', 'He lost his way.'], 'Listen to what the people on the road said.', 'He tried to please every critic.'],
      ['What is the lesson of the story?', 'You cannot please everyone.', ['Donkeys are lazy.', 'Always walk fast.', 'Never go to the market.'], 'What went wrong in the end?', 'Trying to please everyone pleases no one.'],
      ['What kind of story is it?', 'a fable', ['a poem', 'a news report', 'a recipe'], 'A short story with a lesson.', 'It is a fable.'],
      ['What should the miller have done?', 'think for himself', ['listen to everyone', 'sell his son', 'run away'], 'Advice is fine, but…', 'He should have used his own good sense.'],
    ],
    order: ['Put the events in order', [
      ['They set off to the market.', 'People laughed at them.', 'The miller changed his plan.', 'Everything went wrong.'],
      ['The son rode the donkey.', 'The father rode the donkey.', 'Both rode the donkey.', 'They carried the donkey.'],
      ['The father walked.', 'People spoke.', 'The father rode.'],
      ['The son rode the donkey.', 'People spoke.', 'The father rode the donkey.'],
      ['They set off to the market.', 'Both rode the donkey.', 'They carried the donkey.'],
    ]],
  }),
  obj({
    id: 'ts4.en.verbs.past', title: 'Verbs in the past tense', hint: 'Most past verbs end in -ed; a few change their whole spelling.',
    intro: [
      p('Stories usually happen in the past, so they use past tense verbs. Most verbs add -ed: walk → walked, laugh → laughed, carry → carried. Some are irregular and change: go → went, see → saw, ride → rode, sell → sold, say → said.'),
      photo('📖', 'Stories are told in the past: "Once upon a time, a miller walked to the market…"'),
      keys('walk → walked', 'carry → carried (y → ied)', 'go → went', 'ride → rode', 'say → said', 'see → saw'),
      tip('Words like "yesterday", "last week" and "once upon a time" tell you to use the past tense.'),
    ],
    ex: [
      ex('Past tense of "ride"?', ['"ride" is irregular.', 'The son ___ the donkey.'], 'rode'),
      ex('Past tense of "carry"?', ['Ends in consonant + y → change y to i, add -ed.'], 'carried'),
    ],
    mcq: [
      ['Past tense of "walk":', 'walked', ['walkd', 'walking', 'walks'], 'Add -ed.', 'walk → walked.'],
      ['Past tense of "go":', 'went', ['goed', 'gone', 'goes'], 'It is irregular.', 'go → went.'],
      ['"Yesterday the son ___ the donkey."', 'rode', ['ride', 'rides', 'riding'], '"Yesterday" means past.', 'ride → rode.'],
      ['Past tense of "carry":', 'carried', ['carryed', 'carries', 'carring'], 'y → ied.', 'carry → carried.'],
      ['"The people ___ at them."', 'laughed', ['laugh', 'laughs', 'laughing'], 'The story is in the past.', 'laugh → laughed.'],
      ['Past tense of "see":', 'saw', ['seed', 'seen', 'sees'], 'Irregular verb.', 'see → saw.'],
    ],
    match: ['Match each verb with its past tense', [
      ['go', 'went'], ['see', 'saw'], ['ride', 'rode'], ['sell', 'sold'], ['say', 'said'], ['eat', 'ate'],
    ]],
  }),
]);

// ============================================================ 5. Fudi's Desert Journey; Travelling, Travelling
const u5 = unit(5, 'Unit 5: Fudi\'s Desert Journey · Travelling, Travelling', [
  obj({
    id: 'ts4.en.desert.journey', title: 'Journeys and the desert', hint: 'Remember: deserts are dry and sandy; camels can go long without water.',
    intro: [
      p('This unit is about journeys. "Fudi\'s Desert Journey" takes us through a desert, and the poem "Travelling, Travelling" is about the joy of going places. Read both in your Reader.'),
      photo('🐪', 'The camel is called the "ship of the desert" — it can walk for days with little water.'),
      p('A desert is a very dry place with very little rain. It has sand dunes, hot days and cold nights. Cactus plants store water. An oasis is a green spot in the desert with water and palm trees. In India, the Thar Desert is in Rajasthan.'),
      tip('Make a "packing list" for a desert trip: water, a hat, loose cotton clothes.'),
      keys('desert = very dry, sandy land', 'oasis = water and trees in the desert', 'camel = ship of the desert', 'Thar Desert — Rajasthan'),
    ],
    ex: [
      ex('Why is the camel called the "ship of the desert"?', ['A ship carries people across the sea.', 'A camel carries people across the sand.'], 'It carries people and goods across the desert.'),
      ex('What is an oasis?', ['A green place in the desert.'], 'A place with water and trees in a desert'),
    ],
    pic: [
      ['Which animal is the "ship of the desert"?', ['🐪', 'camel'], [['🐘', 'elephant'], ['🐎', 'horse']], 'It has a hump.', 'The camel 🐪 is the ship of the desert.'],
      ['Which tree grows at an oasis in the desert?', ['🌴', 'date palm'], [['🌸', 'lotus'], ['🌾', 'rice plant']], 'It is tall with leaves only at the top.', 'Date palms 🌴 grow at desert oases; lotus and rice need lots of water.'],
      ['What should you carry in the desert?', ['💧', 'water'], [['☂️', 'umbrella'], ['🧊', 'ice skates']], 'It is very hot and dry.', 'Carry water 💧.'],
      ['How is the desert in the daytime?', ['☀️', 'very hot'], [['🌧️', 'rainy'], ['⛈️', 'stormy']], 'The sun shines all day.', 'Desert days are very hot ☀️.'],
      ['Which do we use to travel on a long road?', ['🚌', 'bus'], [['🪑', 'chair'], ['🛏️', 'bed']], 'It has wheels and carries people.', 'A bus 🚌 is used for travel.'],
    ],
    mcq: [
      ['A desert has very little:', 'rain', ['sand', 'sun', 'heat'], 'It is very dry.', 'Deserts get very little rain.'],
      ['The Thar Desert is in:', 'Rajasthan', ['Kerala', 'Telangana', 'Assam'], 'A state in the north-west of India.', 'The Thar Desert is in Rajasthan.'],
      ['An oasis has:', 'water and trees', ['snow and ice', 'big factories', 'tall buildings'], 'A green place in the desert.', 'An oasis has water and palm trees.'],
      ['Desert nights are often:', 'cold', ['very hot', 'rainy', 'snowy'], 'Sand loses heat fast.', 'Desert nights get cold.'],
      ['The poem "Travelling, Travelling" is about:', 'the joy of going places', ['cooking food', 'a game of cricket', 'doing homework'], 'Look at the title.', 'It is about travelling.'],
    ],
  }),
  obj({
    id: 'ts4.en.adj.compare', title: 'Comparing: bigger, hotter, better', hint: 'Comparing TWO things? Use -er or the special word (better, worse).',
    intro: [
      p('When we compare two things, we use the comparative form of a describing word (adjective). Most add -er: tall → taller, old → older. Short words ending in one vowel + consonant double the last letter: big → bigger, hot → hotter. Words ending in -y change to -ier: dry → drier, happy → happier. Some are special: good → better, bad → worse.'),
      photo('🐘', 'An elephant is bigger than a camel.'),
      keys('tall → taller', 'big → bigger', 'hot → hotter', 'dry → drier', 'good → better', 'bad → worse', 'Use "than": A is taller than B.'),
      tip('Say "than", not "then": "The desert is hotter than the hills."'),
    ],
    ex: [
      ex('Compare: The desert is ___ (hot) than the hills.', ['hot: one vowel + one consonant → double the t.', 'hot + t + er'], 'hotter'),
      ex('Compare: My mango is ___ (good) than yours.', ['"good" is special.'], 'better'),
    ],
    mcq: [
      ['An elephant is ___ than a dog.', 'bigger', ['biger', 'big', 'more big'], 'Double the g.', 'big → bigger.'],
      ['The sun is ___ than the moon.', 'hotter', ['hoter', 'hot', 'hottest'], 'Double the t, comparing two.', 'hot → hotter.'],
      ['My grandfather is ___ than my father.', 'older', ['oldder', 'old', 'more old'], 'Just add -er.', 'old → older.'],
      ['This mango is ___ than that one.', 'better', ['gooder', 'good', 'more good'], '"good" is a special word.', 'good → better.'],
      ['The desert is ___ than the forest.', 'drier', ['dryer than', 'dry', 'more dry'], 'y → ier.', 'dry → drier.'],
      ['A giraffe is ___ than a goat.', 'taller', ['tallest', 'tall', 'more tall'], 'Comparing two animals.', 'tall → taller.'],
    ],
    match: ['Match each word with its comparing form', [
      ['big', 'bigger'], ['hot', 'hotter'], ['good', 'better'], ['bad', 'worse'], ['happy', 'happier'], ['small', 'smaller'],
    ]],
  }),
], 'Fudi\'s Desert Journey: plot not summarised (not confirmed from the Reader) — teacher should add story questions.');

// ============================================================ 6. Honesty; The Blind Boy
const u6 = unit(6, 'Unit 6: Honesty · The Blind Boy', [
  obj({
    id: 'ts4.en.honesty.value', title: 'Honesty and courage', hint: 'An honest person tells the truth and returns what is not theirs.',
    intro: [
      p('"Honesty" is a story about telling the truth even when it is hard. "The Blind Boy" is an old poem by Colley Cibber about a boy who cannot see, yet stays cheerful and does not feel sorry for himself.'),
      photo('✅', 'Honest = truthful. An honest person can be trusted.'),
      p('Being honest means: telling the truth, returning things you find, owning up to mistakes, and not copying. The blind boy shows a different courage: being happy with what you have.'),
      tip('Ask yourself: "Would I be happy if everyone knew what I did?" If yes, it is honest.'),
      keys('honest = truthful', 'Return what you find', 'Own up to mistakes', 'The Blind Boy: courage and cheerfulness'),
    ],
    ex: [
      ex('Sana finds a purse on the road. What is the honest thing to do?', ['It is not hers.', 'She should give it to the owner or a teacher/police.'], 'Return it to the owner or hand it to an adult.'),
      ex('Imran broke a glass by mistake. What should he do?', ['Hiding it is not honest.'], 'Tell his mother the truth and say sorry.'),
    ],
    tap: ['Tap the honest actions', [
      ['returning a lost purse', true], ['telling the truth', true], ['owning up to a mistake', true], ['doing your own homework', true], ['giving back extra change', true],
      ['copying in a test', false], ['hiding a broken toy', false], ['keeping a friend\'s pen', false],
    ], 'Honest people tell the truth, return things and do their own work.'],
    mcq: [
      ['"Honest" means:', 'truthful', ['lazy', 'angry', 'tired'], 'An honest person does not lie.', 'Honest = truthful.'],
      ['A shopkeeper gives you ₹10 too much. You should:', 'give it back', ['keep it quietly', 'buy sweets with it', 'run away'], 'It is not your money.', 'The honest thing is to return it.'],
      ['The boy in "The Blind Boy" is:', 'cheerful', ['always angry', 'very rich', 'a king'], 'He does not feel sorry for himself.', 'He stays cheerful.'],
      ['Which is NOT honest?', 'copying a friend\'s answers', ['telling the truth', 'returning a lost book', 'saying sorry'], 'Which one is cheating?', 'Copying is not honest.'],
      ['Why do people trust an honest person?', 'because they tell the truth', ['because they are tall', 'because they are rich', 'because they run fast'], 'Trust comes from truth.', 'Honesty builds trust.'],
    ],
  }),
  obj({
    id: 'ts4.en.nouns.plural', title: 'Singular and plural nouns', hint: 'One = singular. More than one = plural. Check how the word ends.',
    intro: [
      p('Singular means one; plural means more than one. Most nouns add -s: boy → boys. Nouns ending in s, sh, ch, x add -es: bus → buses, box → boxes. Consonant + y → -ies: baby → babies. Some are special: child → children, man → men, foot → feet, mouse → mice.'),
      photo('🍎', 'one apple → many apples'),
      keys('boy → boys', 'box → boxes, bus → buses', 'baby → babies', 'child → children', 'man → men', 'mouse → mice'),
      tip('If the word ends in a vowel + y (boy, day), just add -s.'),
    ],
    ex: [
      ex('Plural of "box"?', ['Ends in x → add -es.'], 'boxes'),
      ex('Plural of "child"?', ['Special word.'], 'children'),
    ],
    mcq: [
      ['Plural of "bus":', 'buses', ['buss', 'busies', 'bus'], 'Ends in s → -es.', 'bus → buses.'],
      ['Plural of "baby":', 'babies', ['babys', 'babyes', 'baby'], 'Consonant + y → ies.', 'baby → babies.'],
      ['Plural of "man":', 'men', ['mans', 'mens', 'manes'], 'Special word.', 'man → men.'],
      ['Plural of "mouse":', 'mice', ['mouses', 'mices', 'mouse'], 'Special word.', 'mouse → mice.'],
      ['Plural of "boy":', 'boys', ['boies', 'boyes', 'boy'], 'Vowel + y → just add s.', 'boy → boys.'],
      ['Plural of "foot":', 'feet', ['foots', 'feets', 'footes'], 'Special word.', 'foot → feet.'],
    ],
    match: ['Match singular to plural', [
      ['child', 'children'], ['box', 'boxes'], ['baby', 'babies'], ['tooth', 'teeth'], ['leaf', 'leaves'], ['woman', 'women'],
    ]],
  }),
], 'Honesty: story details not summarised (not confirmed from the Reader).');

// ============================================================ 7. The Boy and the Catapult; Bird Talk
const u7 = unit(7, 'Unit 7: The Boy and the Catapult · Bird Talk', [
  obj({
    id: 'ts4.en.birds.kindness', title: 'Being kind to birds', hint: 'Would the bird be safe and happy? Then it is kind.',
    intro: [
      p('"The Boy and the Catapult" is about a boy, a catapult (a Y-shaped stick with a rubber band used to shoot stones) and birds — and about learning to be gentle with living things. "Bird Talk" is a playful poem that imagines what birds might say to each other.'),
      photo('🐦', 'Birds sing, build nests and help plants by spreading seeds.'),
      p('Birds are our friends. We can help them by keeping a bowl of water in summer, not disturbing nests, and never hurting them.'),
      tip('Watch birds quietly for five minutes and write what you notice.'),
      keys('catapult = a toy for shooting stones', 'Never hurt birds or animals', 'Help birds: water bowl, safe nests, trees'),
    ],
    ex: [
      ex('Why should we never shoot stones at birds?', ['Stones can hurt or kill them.', 'Birds feel pain like us.'], 'Because it hurts them; we must be kind.'),
      ex('How can you help birds in summer?', ['Summer is very hot and dry.'], 'Keep a bowl of water for them.'),
    ],
    tap: ['Tap the kind actions', [
      ['keeping water for birds', true], ['planting trees', true], ['watching birds quietly', true], ['leaving nests alone', true],
      ['shooting stones at birds', false], ['breaking nests', false], ['keeping birds in tiny cages', false],
    ], 'Kind actions keep birds safe.'],
    mcq: [
      ['A catapult is used to:', 'shoot small stones', ['cook food', 'write letters', 'carry water'], 'A Y-shaped stick with rubber.', 'A catapult shoots small stones.'],
      ['"Bird Talk" is a:', 'poem', ['recipe', 'map', 'letter'], 'It has lines that rhyme.', '"Bird Talk" is a poem.'],
      ['What is the kind thing to do with a bird\'s nest?', 'leave it alone', ['break it', 'take the eggs', 'throw stones at it'], 'It is the bird\'s home.', 'Leave nests alone.'],
      ['How do birds help plants?', 'by spreading seeds', ['by cutting trees', 'by eating leaves only', 'by digging wells'], 'They eat fruit and drop seeds.', 'Birds spread seeds.'],
      ['Which word describes a person who never hurts animals?', 'kind', ['cruel', 'rude', 'lazy'], 'The opposite of cruel.', 'Such a person is kind.'],
    ],
  }),
  obj({
    id: 'ts4.en.animals.words', title: 'Birds and animals: homes, young ones and sounds', hint: 'Think about where the animal lives, its baby and the sound it makes.',
    intro: [
      p('Let\'s build a word map of birds and animals. Homes: a bird lives in a nest, a lion in a den, a dog in a kennel, a bee in a hive. Young ones: cat → kitten, dog → puppy, hen → chick, cow → calf. Sounds: crows caw, parrots talk, lions roar, cows moo.'),
      photo('🪺', 'A nest is a bird\'s home.'),
      keys('Homes: nest, den, kennel, hive, stable', 'Young: kitten, puppy, chick, calf', 'Sounds: caw, roar, moo, bark, chirp'),
      tip('Draw a concept map: put "Animals" in the middle and add homes, babies and sounds around it.'),
    ],
    ex: [
      ex('Where does a bee live?', ['Bees live together and make honey there.'], 'in a hive'),
      ex('What is the young one of a hen?', ['It is small and yellow.'], 'a chick'),
    ],
    match: ['Match the animal with its home', [
      ['bird', 'nest'], ['lion', 'den'], ['dog', 'kennel'], ['bee', 'hive'], ['horse', 'stable'], ['spider', 'web'],
    ]],
    pic: [
      ['Which animal roars?', ['🦁', 'lion'], [['🐄', 'cow'], ['🐇', 'rabbit']], 'The king of the jungle.', 'The lion 🦁 roars.'],
      ['Which bird can copy our words?', ['🦜', 'parrot'], [['🦆', 'duck'], ['🐓', 'rooster']], 'It is green with a red beak.', 'A parrot 🦜 can copy words.'],
      ['Which animal says "moo"?', ['🐮', 'cow'], [['🐶', 'dog'], ['🐱', 'cat']], 'It gives milk.', 'The cow 🐮 moos.'],
      ['Which bird says "caw caw"?', ['🐦‍⬛', 'crow'], [['🦚', 'peacock'], ['🦉', 'owl']], 'It is black.', 'The crow 🐦‍⬛ caws.'],
      ['Which bird hoots at night?', ['🦉', 'owl'], [['🐔', 'hen'], ['🦢', 'swan']], 'It has big round eyes.', 'The owl 🦉 hoots at night.'],
      ['Whose young one is a chick?', ['🐔', 'hen'], [['🐐', 'goat'], ['🐈', 'cat']], 'It lays eggs.', 'A hen\'s 🐔 young one is a chick.'],
    ],
    mcq: [
      ['The young one of a cat is a:', 'kitten', ['puppy', 'calf', 'cub'], 'It says "mew".', 'cat → kitten.'],
      ['The young one of a dog is a:', 'puppy', ['kitten', 'chick', 'lamb'], 'It wags its tail.', 'dog → puppy.'],
      ['The young one of a cow is a:', 'calf', ['cub', 'kid', 'foal'], 'It drinks its mother\'s milk.', 'cow → calf.'],
      ['The young one of a lion is a:', 'cub', ['calf', 'kitten', 'chick'], 'Baby bears are called this too.', 'lion → cub.'],
      ['The young one of a sheep is a:', 'lamb', ['puppy', 'cub', 'foal'], 'It is woolly.', 'sheep → lamb.'],
    ],
  }),
], 'The Boy and the Catapult: plot not summarised (not confirmed from the Reader) — teacher should add story questions.');

// ============================================================ 8. The Unlucky Face; Superstitions Around the World
const u8 = unit(8, 'Unit 8: The Unlucky Face · Superstitions Around the World', [
  obj({
    id: 'ts4.en.unlucky.story', title: 'The Unlucky Face: Birbal\'s clever lesson', hint: 'Birbal showed that "bad luck" was just a coincidence.',
    intro: [
      p('"The Unlucky Face" is one of the much-loved tales of Emperor Akbar and his wise minister Birbal. Some people believed that seeing a certain man\'s face in the morning brought bad luck. When something went wrong for the Emperor, the poor man was blamed.'),
      photo('👑', 'Emperor Akbar — and his wise friend Birbal.'),
      p('Birbal cleverly showed the Emperor that the idea was unfair and silly: things go right or wrong for many reasons, not because of someone\'s face. The Emperor understood and the man was saved. Read how Birbal does it in your Reader!'),
      tip('Ask: "Was it really his face, or just chance?"'),
      keys('Akbar: the Emperor', 'Birbal: the wise, witty minister', 'Lesson: do not blame people for bad luck; think logically'),
    ],
    ex: [
      ex('Who solved the problem in the story?', ['He was known for clever answers.'], 'Birbal'),
      ex('Why was blaming the man unfair?', ['A face cannot cause bad things to happen.', 'It was only chance.'], 'Because bad things happened by chance, not because of his face.'),
    ],
    mcq: [
      ['Who was the wise minister?', 'Birbal', ['Ekalavya', 'the miller', 'Fudi'], 'Akbar\'s clever friend.', 'Birbal was Akbar\'s wise minister.'],
      ['Who was the Emperor?', 'Akbar', ['Birbal', 'Drona', 'Krishna'], 'He ruled a big empire.', 'Akbar was the Emperor.'],
      ['People thought the man\'s face brought:', 'bad luck', ['rain', 'money', 'good marks'], 'Look at the title.', 'They believed it was unlucky.'],
      ['How did Birbal help?', 'He showed the belief was silly and unfair.', ['He ran away.', 'He hid the man.', 'He agreed with everyone.'], 'He used his clever thinking.', 'Birbal proved the belief was wrong.'],
      ['What does the story teach?', 'Think clearly; don\'t blame others for bad luck.', ['Never look at faces.', 'Kings are always right.', 'Stay at home in the morning.'], 'What did Akbar learn?', 'It teaches clear thinking and fairness.'],
    ],
  }),
  obj({
    id: 'ts4.en.superstition.facts', title: 'Superstition or fact?', hint: 'Can it be tested and explained? Then it is a fact.',
    intro: [
      p('A superstition is a belief that something brings good or bad luck without any real reason — like "a black cat crossing your path is unlucky". "Superstitions Around the World" shows that people in many countries have such beliefs. A fact is something true that can be checked.'),
      photo('🐈', 'A cat crossing the road is just a cat crossing the road!'),
      keys('superstition = a belief with no proof', 'fact = true and can be checked', 'Ask: "How do we know?"'),
      tip('Be respectful when others believe something — ask questions politely and think for yourself.'),
    ],
    ex: [
      ex('"Water boils when heated enough." Fact or superstition?', ['We can test it in the kitchen.'], 'fact'),
      ex('"Sneezing before you leave means bad luck." Fact or superstition?', ['A sneeze cannot change what happens on a journey.'], 'superstition'),
    ],
    tap: ['Tap the FACTS (things that are true and can be checked)', [
      ['The sun rises in the east.', true], ['Plants need water to grow.', true], ['Ice melts when it gets warm.', true], ['Washing hands removes germs.', true],
      ['A black cat brings bad luck.', false], ['Breaking a mirror gives 7 years of bad luck.', false], ['Seeing someone\'s face can make your day bad.', false],
    ], 'Facts can be tested; superstitions have no proof.'],
    mcq: [
      ['A superstition is:', 'a belief without proof', ['a proven fact', 'a type of food', 'a game'], 'It has no real reason behind it.', 'Superstitions have no proof.'],
      ['Which is a fact?', 'Plants need sunlight.', ['A crow cawing means guests will come.', 'Black cats are unlucky.', 'Number 13 is unlucky.'], 'Which can be tested?', 'Plants need sunlight — we can test it.'],
      ['Which is a superstition?', 'Number 13 is unlucky.', ['Fire is hot.', 'Fish live in water.', 'The earth goes round the sun.'], 'Which has no proof?', '"13 is unlucky" has no proof.'],
      ['To find out if something is true, we should:', 'ask "How do we know?" and check', ['just believe it', 'be afraid', 'tell everyone quickly'], 'Think like Birbal.', 'Check with evidence.'],
      ['Superstitions are found in:', 'many countries', ['only one village', 'only in books', 'only in animals'], 'Look at the title of the reading.', 'They are found around the world.'],
    ],
  }),
  obj({
    id: 'ts4.en.pastperfect', title: 'The past perfect: what had happened first', hint: 'The action that happened FIRST takes "had" + the past participle.',
    intro: [
      p('When two things happened in the past, we use the past perfect for the one that happened first: had + past participle. Example: "The Emperor had seen the man\'s face before he fell." First: he had seen. Later: he fell.'),
      photo('⏳', 'First action → had + verb. Second action → simple past.'),
      keys('had + past participle: had gone, had eaten, had seen, had finished', 'The bus had left when we reached the stop. (First: left.)', 'Use "before", "after", "when", "already"'),
      tip('Draw a timeline: put a dot for each action. The dot on the left gets "had".'),
    ],
    ex: [
      ex('The train ___ (leave) when we reached the station.', ['Which happened first? The train left.', 'had + left'], 'had left'),
      ex('After Ravi ___ (finish) his homework, he went out to play.', ['First: finishing homework.'], 'had finished'),
    ],
    mcq: [
      ['When we reached the cinema, the film ___ already ___.', 'had … started', ['has … start', 'is … starting', 'will … start'], 'It started before we arrived.', 'had started — the earlier action.'],
      ['She ___ her lunch before the bell rang.', 'had eaten', ['has eat', 'eats', 'eating'], 'Eating came first.', 'had eaten = earlier past action.'],
      ['The Emperor ___ the man\'s face before he fell.', 'had seen', ['has see', 'sees', 'seeing'], 'Seeing came first.', 'had seen.'],
      ['Which sentence uses the past perfect?', 'I had finished my work.', ['I finish my work.', 'I am finishing my work.', 'I will finish my work.'], 'Look for "had" + past participle.', '"had finished" is past perfect.'],
      ['By the time Mother came home, we ___ the house.', 'had cleaned', ['cleans', 'has clean', 'cleaning'], 'Cleaning happened first.', 'had cleaned.'],
    ],
    order: ['Put the words in order to make a past perfect sentence', [
      ['The', 'bus', 'had', 'left.'], ['She', 'had', 'eaten', 'lunch.'], ['We', 'had', 'finished', 'our', 'work.'],
      ['Ravi', 'had', 'gone', 'home.'], ['They', 'had', 'seen', 'the', 'film.'],
    ]],
  }),
]);

export const units: USpec[] = [u0, u1, u2, u3, u4, u5, u6, u7, u8];
