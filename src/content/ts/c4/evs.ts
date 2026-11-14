// Telangana SCERT Class 4 — evs. Original teaching aligned to the official chapter list (src/content/ts/books.ts).
// One unit per textbook chapter (ids ts4.evs.ch<n>); objectives ts4.evs.<topic>.<skill>.
// Written for a 9-year-old: short sentences, Telangana examples, pictures first. Templates use only the Rng given.
import {
  tp, ex, p, h, tip, vis, def, keys, photo, choose, matching, ordering, tapAll, type USpec, type QSpec, type TSpec,
} from '../../lib/kit';
import type { Rng } from '../../../shared/grading';
import type { VisualSpec } from '../../../shared/content';
import { tsSrc } from '../books';

// ------------------------------------------------------------------ helpers
const src = (ch: number) => tsSrc(4, 'evs', ch);
const mcq = (r: Rng, prompt: string, correct: string, wrong: string[], hints: string[], solution: string[], why: string, visual?: VisualSpec): QSpec => ({
  type: 'mcq', prompt, ...choose(r, correct, wrong), hints, solution, mistakes: [{ when: 'wrong', explain: why }], ...(visual ? { visual } : {}),
});
/** concept bank entry: question, answer, wrong options, hints, solution, why-wrong, optional visual */
type B = [q: string, a: string, w: string[], hints: string[], sol: string, why: string, v?: VisualSpec];
/** a template drawing one question from a bank (needs >= 5 entries) */
const bank = (key: string, list: B[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, a, w, hints, sol, why, v] = r.pick(list);
  return mcq(r, q, a, w, hints, [sol], why, v);
}, d);
/** tap-all template: picks 2–3 correct and 2–3 wrong items */
const tapT = (key: string, prompt: string, yes: string[], no: string[], hints: string[], why: string): TSpec => tp(key, (r) => {
  const y = r.shuffle(yes).slice(0, r.int(2, 3)), n = r.shuffle(no).slice(0, r.int(2, 3));
  return {
    type: 'tap', prompt, ...tapAll(r, [...y.map((label) => ({ label, ok: true })), ...n.map((label) => ({ label, ok: false }))]),
    hints, solution: [`Yes: ${y.join(', ')}.`, `No: ${n.join(', ')}.`], mistakes: [{ when: 'wrong', explain: why }],
  };
});
/** matching template: picks 4 pairs; the emoji strip shows which set was drawn */
const matchT = (key: string, prompt: string, pool: [left: string, right: string, emoji: string][], hints: string[], why: string): TSpec => tp(key, (r) => {
  const pick = r.shuffle(pool).slice(0, 4);
  return {
    type: 'match', prompt, visual: { kind: 'emoji', text: pick.map((x) => x[2]).join(' ') },
    ...matching(r, pick.map(([a, b]) => [a, b] as [string, string])), hints,
    solution: pick.map(([a, b]) => `${a} → ${b}`), mistakes: [{ when: 'wrong', explain: why }],
  };
});
/** ordering template over a fixed sequence */
const orderT = (key: string, prompt: string, seq: string[], hints: string[], why: string): TSpec => tp(key, (r) => ({
  type: 'order', prompt, ...ordering(r, seq), hints, solution: [seq.join(' → ')], mistakes: [{ when: 'wrong', explain: why }],
}));

// ================================================================== CH 1
const ch1: USpec = {
  id: 'ts4.evs.ch1', subject: 'evs', title: 'Changing Family Structure', source: src(1),
  objectives: [
    {
      id: 'ts4.evs.family.change', title: 'How families change',
      intro: [
        h('Families grow and change'),
        p('A baby is born. An aunt gets married and moves to a new home. A family moves from a village to Hyderabad for work. Families change all the time!'),
        photo('👶', 'A new baby is a happy new arrival in the family.'),
        vis({ kind: 'emoji', text: '👴 👵 👨 👩 👧 👦 👶' }, 'A joint family with grandparents, parents and children'),
        def('Joint family', 'Grandparents, parents, uncles, aunts and children living together.'),
        def('Nuclear family', 'Parents and their children living together.'),
        keys('A new arrival (birth) makes a family bigger.', 'Marriage brings a new member or a new home.', 'Moving for work or study changes where a family lives.', 'Long ago, more families were joint; today many are nuclear.'),
        tip('Ask your grandparents how many people lived in their house when they were young.'),
      ],
      examples: [
        ex('Ravi lives with his parents and sister. What kind of family is this?', ['Only parents and children.'], 'A nuclear family'),
        ex('Meena\'s uncle got a job in Hyderabad and moved there. Why did the family change?', ['A member moved to a new place for work.'], 'Moving for work'),
      ],
      practice: [
        bank('kind', [
          ['Grandparents, parents, uncles and cousins live together. What kind of family?', 'Joint family', ['Nuclear family', 'No family'], ['Count the generations.', 'Many relatives under one roof.'], 'Many relatives together make a joint family.', 'A nuclear family has only parents and children.'],
          ['Only a mother, father and two children live together. What kind of family?', 'Nuclear family', ['Joint family', 'Hostel'], ['Who lives in the house?', 'Just parents and children.'], 'That is a nuclear family.', 'There are no grandparents or uncles, so it is not joint.'],
          ['A baby is born in the family. What changes?', 'The family gets bigger', ['The family gets smaller', 'Nothing changes'], ['Is someone new joining?', 'A new member is added.'], 'A new arrival makes the family bigger.', 'A birth adds a member.'],
          ['Why might a family move from a village to a city?', 'For a job or studies', ['Because they dislike trees', 'To stop eating'], ['Think of reasons people travel far.', 'Work and school.'], 'Families often move for work or education.', 'People move for jobs and studies.'],
          ['After her marriage, Kavya\'s aunt lives in another town. Kavya\'s family now has…', 'One member fewer at home', ['Two members more', 'The same members at home'], ['The aunt left the house.', 'Count who lives at home now.'], 'One member moved out after marriage.', 'Someone left, so there are fewer people at home.'],
          ['Long ago, were joint families more common in villages?', 'Yes', ['No'], ['Ask grandparents.', 'Families farmed together.'], 'Yes, joint families were more common long ago.', 'Farming families often lived together.'],
        ]),
        tapT('helps', 'Tap ALL the ways family members can help each other.', ['caring for grandparents', 'helping with homework', 'sharing housework', 'looking after the baby', 'cooking together'], ['fighting over the TV', 'wasting water', 'leaving toys everywhere', 'shouting at elders'],
          ['Which actions make home happier?', 'Helping and sharing.'], 'Helpful actions make a family strong.'),
      ],
    },
    {
      id: 'ts4.evs.family.appliances', title: 'Home appliances then and now',
      intro: [
        h('Machines at home'),
        p('Long ago, grandmother ground rice on a grinding stone and fetched water from a well. Today many homes use a mixer, a fridge and a tap.'),
        photo('🪨', 'A grinding stone was used before mixers.'),
        photo('💡', 'Electric bulbs replaced oil lamps in most homes.'),
        vis({ kind: 'emoji', text: '🪔 → 💡 · 🪨 → mixer · 🪣 → tap' }, 'Old ways and new ways'),
        keys('Appliances save time and effort.', 'They use electricity — switch off when not needed.', 'Never touch switches with wet hands.'),
        tip('Make a list: which machines in your house use electricity?'),
      ],
      examples: [
        ex('What keeps milk and vegetables fresh at home?', ['It keeps food cold.'], 'A refrigerator (fridge)'),
        ex('What was used to light houses before electric bulbs?', ['People burned oil in small clay lamps.'], 'Oil lamps (diyas)'),
      ],
      practice: [
        matchT('use', 'Match each appliance to its use.', [
          ['Fridge', 'Keeps food cold', '🧊'], ['Mixer', 'Grinds chutney', '🌶️'], ['Fan', 'Moves air', '🌬️'], ['Bulb', 'Gives light', '💡'],
          ['Washing machine', 'Washes clothes', '🧦'], ['Pressure cooker', 'Cooks rice quickly', '🍚'], ['Iron box', 'Removes creases from clothes', '👕'],
        ], ['Think what each machine does at your home.', 'Start with the one you know best.'], 'Think about what each appliance is used for.'),
        bank('safe', [
          ['Which old tool did the job of a mixer?', 'Grinding stone', ['Fan', 'Bucket'], ['What was used to grind?', 'A heavy stone.'], 'A grinding stone ground rice and chutneys.', 'Fans and buckets do not grind.'],
          ['Is it safe to touch a switch with wet hands?', 'No', ['Yes'], ['Water and electricity are dangerous together.', 'Dry your hands first.'], 'No. Wet hands can give an electric shock.', 'Water carries electricity — always dry your hands.'],
          ['What should you do when you leave a room?', 'Switch off the fan and lights', ['Leave everything on', 'Open the fridge'], ['Save electricity.', 'No one is using them.'], 'Switch off to save electricity.', 'Leaving them on wastes electricity.'],
          ['Before electric bulbs, homes were lit by…', 'Oil lamps', ['Mobile phones', 'Televisions'], ['Think of Deepavali.', 'Clay lamps with oil.'], 'Oil lamps lit homes long ago.', 'Phones and TVs came much later.'],
          ['Before taps, where did many villages get water?', 'Wells and tanks', ['Fridges', 'Mixers'], ['People carried pots.', 'From where?'], 'Water came from wells and tanks.', 'Fridges and mixers do not supply water.'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 2
const ch2: USpec = {
  id: 'ts4.evs.ch2', subject: 'evs', title: 'Different Games and Rules', source: src(2),
  objectives: [
    {
      id: 'ts4.evs.games.rules', title: 'Games and their rules',
      intro: [
        h('Every game has rules'),
        p('Kabaddi, kho-kho, cricket, tokkudu billa (hopscotch), and gilli-danda are played in Telangana. Each game has rules so it is fair and fun.'),
        photo('⚽', 'Football: only the goalkeeper may touch the ball with hands.'),
        vis({ kind: 'emoji', text: '⚽ 🏀 🎲 🪁' }, 'Outdoor and indoor games'),
        keys('Rules tell us how to play, score and win.', 'Outdoor games: kabaddi, kho-kho, cricket.', 'Indoor games: chess, carrom, snakes and ladders.', 'A referee or umpire makes sure rules are followed.'),
        tip('Before a game starts, agree on the rules with everyone.'),
      ],
      examples: [
        ex('In kabaddi, what must the raider keep saying while in the other side?', ['The raider holds breath and chants.'], '"Kabaddi, kabaddi…"'),
        ex('Is carrom an indoor or outdoor game?', ['It is played on a board at home.'], 'Indoor'),
      ],
      practice: [
        bank('rule', [
          ['In kho-kho, how does a chaser let a team-mate run?', 'By touching their back and saying "kho"', ['By shouting "out"', 'By throwing a ball'], ['Think of the name of the game.', 'Kho!'], 'The chaser gives a "kho" by touching a sitting team-mate\'s back.', 'The game is named after the "kho" call.'],
          ['Who makes sure rules are followed in a cricket match?', 'The umpire', ['The bowler', 'The audience'], ['He raises a finger for "out".', 'He stands near the stumps.'], 'The umpire decides by the rules.', 'Players play; the umpire judges.'],
          ['Which is an indoor game?', 'Chess', ['Kabaddi', 'Kho-kho'], ['Needs a board and a table.', 'Played sitting down.'], 'Chess is an indoor game.', 'Kabaddi and kho-kho need a big ground.'],
          ['Why do games need rules?', 'So that the game is fair for everyone', ['So that one person always wins', 'To make it boring'], ['What if everyone made their own rules?', 'Fair play.'], 'Rules keep games fair and safe.', 'Rules are for fairness.'],
          ['In football, who may touch the ball with hands?', 'Only the goalkeeper', ['Every player', 'Nobody, not even the goalkeeper'], ['Think of who guards the goal.', 'Only one player.'], 'Only the goalkeeper may use hands (in the box).', 'Other players use feet and head.'],
          ['In snakes and ladders, what happens on a snake\'s head?', 'You slide down', ['You climb up', 'You win at once'], ['Snakes take you down.', 'Ladders take you up.'], 'Landing on a snake\'s head sends you down.', 'Ladders go up; snakes go down.'],
        ]),
        tapT('outdoor', 'Tap ALL the OUTDOOR games.', ['kabaddi', 'kho-kho', 'cricket', 'gilli-danda', 'football'], ['chess', 'carrom', 'snakes and ladders', 'ludo'],
          ['Which games need a big ground?', 'Board games are indoor.'], 'Outdoor games need open space; board games are indoor.'),
      ],
    },
    {
      id: 'ts4.evs.games.fair', title: 'Everyone can play: fair play, winning and losing',
      intro: [
        h('Let everyone play'),
        p('Imran uses a wheelchair. His friends changed the rules of catch so he can join. Games are best when everyone is included.'),
        photo('🏆', 'Winning is fun, but playing fairly matters most.'),
        vis({ kind: 'emoji', text: '🙋 🧒 👧 🤝' }, 'Friends playing together'),
        keys('Include everyone — girls and boys, younger children and children with disabilities.', 'Shake hands after the game.', 'Losing is part of learning; try again!', 'Never cheat or tease.'),
        tip('If a friend cannot play the usual way, change the rules a little so they can join.'),
      ],
      examples: [
        ex('Your team lost a match. What is a good thing to do?', ['Congratulate the winners.', 'Practise and try again.'], 'Shake hands and say "well played"'),
        ex('A new girl in class stands alone at playtime. What can you do?', ['Invite her to play.'], 'Ask her to join the game'),
      ],
      practice: [
        bank('fair', [
          ['Your team wins. What should you do?', 'Shake hands with the other team', ['Tease the other team', 'Run away'], ['How would you feel if you lost?', 'Be kind.'], 'Winners shake hands and say "well played".', 'Teasing hurts feelings.'],
          ['A friend uses a wheelchair. How can he join a ball game?', 'Change the rules a little so he can play', ['Tell him to go home', 'Let him only watch every time'], ['Games can be changed.', 'Everyone should play.'], 'Change the rules so everyone can play.', 'Leaving someone out is unfair.'],
          ['Should girls and boys play games together?', 'Yes, everyone can play', ['No, never'], ['Games are for everyone.', 'Think of kho-kho teams.'], 'Yes. Games are for everyone.', 'Any child can play any game.'],
          ['You lose a race. What is the best thing to say?', '"I will practise and try again."', ['"I will never play again."', '"The winner cheated." (when it is not true)'], ['Losing helps us learn.', 'Be a good sport.'], 'Practise and try again.', 'Blaming others is not fair.'],
          ['A player breaks a rule on purpose to win. Is that fair?', 'No, it is cheating', ['Yes, winning is all that matters'], ['Rules are the same for everyone.', 'Breaking them on purpose is…'], 'Breaking rules on purpose is cheating.', 'Fair play means following rules.'],
        ]),
        tapT('good', 'Tap ALL the actions of a good sport.', ['saying "well played"', 'helping a fallen player up', 'following the umpire', 'including new children', 'waiting for your turn'], ['pushing others', 'hiding the ball', 'shouting at the loser', 'changing rules only to win'],
          ['Would you like it if someone did this to you?', 'Good sports are kind and fair.'], 'Good sports are fair and kind.'),
      ],
    },
  ],
};

// ================================================================== CH 3
const ch3: USpec = {
  id: 'ts4.evs.ch3', subject: 'evs', title: 'Various Types of Animals', source: src(3),
  objectives: [
    {
      id: 'ts4.evs.animals.ears', title: 'Animals with and without external ears',
      intro: [
        h('Look at their ears!'),
        p('A cow, a dog and an elephant have ears you can see outside their heads. A crow, a snake and a fish have no outer ears — only small holes or hidden ears.'),
        photo('🐘', 'An elephant has very big outer ears. It flaps them to keep cool.'),
        photo('🐦', 'Birds have small ear holes hidden under their feathers.'),
        vis({ kind: 'emoji', text: '👂 🐄 🐕 🐘 🐒 · no outer ear: 🐦 🐍 🐟 🐸' }, 'Animals with and without outer ears'),
        keys('Animals with outer ears and hair/fur usually give birth to babies and feed them milk.', 'Birds, snakes, lizards, frogs and fish have no outer ears and most lay eggs.'),
        tip('See an outer ear? It is likely the animal feeds its babies milk.'),
      ],
      examples: [
        ex('Does a buffalo have outer ears?', ['Look at its head — two ears stick out.'], 'Yes'),
        ex('Does a hen have outer ears?', ['Look closely — only small holes near the eyes, covered by feathers.'], 'No, only ear holes'),
      ],
      practice: [
        tapT('ears', 'Tap ALL the animals that have ears you can see outside their head.', ['cow', 'dog', 'cat', 'elephant', 'goat', 'monkey', 'rabbit'], ['crow', 'snake', 'fish', 'frog', 'lizard', 'parrot'],
          ['Picture each animal\'s head.', 'Birds, snakes, frogs and fish have only holes.'], 'Birds, reptiles, frogs and fish have no outer ears.'),
        bank('which', [
          ['Which animal has NO outer ears?', 'Snake', ['Dog', 'Cow'], ['Picture a snake\'s head.', 'It is smooth.'], 'A snake has no outer ears.', 'Dogs and cows have outer ears.'],
          ['Which animal has big outer ears?', 'Elephant', ['Pigeon', 'Fish'], ['Which animal flaps its ears?', 'A very large animal.'], 'An elephant has huge outer ears.', 'Pigeons and fish have no outer ears.'],
          ['Animals with outer ears usually…', 'give birth to babies and feed them milk', ['lay eggs in water', 'have feathers'], ['Think of a cow and its calf.', 'Calves drink milk.'], 'They usually give birth and feed milk.', 'Egg-laying animals like birds have no outer ears.'],
          ['How does a crow hear without outer ears?', 'Through ear holes under its feathers', ['It cannot hear at all', 'Through its beak'], ['Birds can hear well.', 'Holes are hidden.'], 'Birds hear through ear holes covered by feathers.', 'Crows hear very well!'],
          ['Which of these lays eggs?', 'Lizard', ['Goat', 'Buffalo'], ['Does it have outer ears?', 'No outer ears → usually eggs.'], 'A lizard lays eggs.', 'Goats and buffaloes give birth to young ones.'],
          ['Which animal has outer ears and fur?', 'Rabbit', ['Frog', 'Fish'], ['Long ears!', 'Soft fur.'], 'A rabbit has long outer ears and fur.', 'Frogs and fish have no fur or outer ears.'],
        ]),
      ],
    },
    {
      id: 'ts4.evs.animals.classify', title: 'Grouping animals by their features',
      intro: [
        h('Sort them out'),
        p('We can group animals by how they move, what covers their body, and how many legs they have.'),
        photo('🦋', 'A butterfly is an insect: 6 legs and wings.'),
        vis({ kind: 'emoji', text: 'fur: 🐄 🐕 · feathers: 🦜 🐓 · scales: 🐟 🐍' }, 'Body coverings'),
        keys('Body covering: fur/hair, feathers, scales, or smooth wet skin.', 'Legs: 0 (snake), 2 (birds), 4 (cow), 6 (insects), 8 (spider).', 'Moving: walk, fly, swim, crawl, hop.'),
        tip('Ask three questions: What covers it? How many legs? How does it move?'),
      ],
      examples: [
        ex('How many legs does an ant have?', ['An ant is an insect.', 'Insects have 6 legs.'], '6 legs'),
        ex('What covers a parrot\'s body?', ['Birds have feathers.'], 'Feathers'),
      ],
      practice: [
        matchT('cover', 'Match each animal to what covers its body.', [
          ['Parrot', 'Feathers', '🦜'], ['Fish', 'Wet scales and fins', '🐟'], ['Dog', 'Fur', '🐕'], ['Frog', 'Smooth wet skin', '🐸'], ['Snake', 'Dry scales', '🐍'], ['Sheep', 'Wool', '🐑'],
        ], ['Think how it feels to touch.', 'Birds → feathers, fish → scales.'], 'Picture touching the animal: is it fluffy, feathery or scaly?'),
        bank('legs', [
          ['How many legs does a spider have?', '8', ['6', '4', '2'], ['A spider is NOT an insect.', 'Count: more than an ant.'], 'A spider has 8 legs.', 'Insects have 6; spiders have 8.'],
          ['How many legs does a hen have?', '2', ['4', '6', '0'], ['Hens are birds.', 'Birds walk on two legs.'], 'A hen has 2 legs.', 'All birds have 2 legs.'],
          ['How many legs does a butterfly have?', '6', ['8', '4', '2'], ['A butterfly is an insect.', 'Insects have 6.'], 'A butterfly has 6 legs.', 'All insects have 6 legs.'],
          ['Which animal has no legs?', 'Snake', ['Lizard', 'Frog'], ['It crawls on its belly.', 'Think long and smooth.'], 'A snake has no legs.', 'Lizards and frogs have 4 legs.'],
          ['How does a frog move?', 'It hops and swims', ['It flies', 'It only crawls'], ['Strong back legs.', 'It lives near water.'], 'A frog hops on land and swims in water.', 'Frogs have no wings.'],
          ['Which animal can fly?', 'Pigeon', ['Buffalo', 'Fish'], ['Look for wings.', 'Birds fly.'], 'A pigeon flies with its wings.', 'Buffaloes and fish have no wings.'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 4
const ch4: USpec = {
  id: 'ts4.evs.ch4', subject: 'evs', title: 'The Life Styles of Animals - Bio Diversity', source: src(4),
  objectives: [
    {
      id: 'ts4.evs.life.groups', title: 'Animals that live in groups',
      intro: [
        h('Safety in numbers'),
        p('Elephants walk in herds. Monkeys live in troops. Ants and honeybees live in huge colonies where everyone has a job.'),
        photo('🐜', 'Ants work together to carry food much bigger than themselves.'),
        vis({ kind: 'emoji', text: '🐘🐘🐘 herd · 🐜🐜🐜 colony · 🐝 hive' }, 'Animals in groups'),
        def('Herd', 'A big group of animals like elephants, deer or cattle.'),
        def('Colony', 'A large group of insects like ants or bees living together.'),
        keys('Groups protect the young from enemies.', 'In a beehive, the queen lays eggs and worker bees collect nectar.', 'The oldest female elephant often leads the herd.'),
        tip('Watch an ant line near your kitchen — they follow a scent trail!'),
      ],
      examples: [
        ex('Why do deer live in herds?', ['Many eyes and ears can spot a tiger.', 'They can warn each other.'], 'For safety from enemies'),
        ex('Who lays eggs in a beehive?', ['There is one special bee for this.'], 'The queen bee'),
      ],
      practice: [
        bank('grp', [
          ['A group of elephants is called a…', 'Herd', ['Colony', 'Nest'], ['Think of cattle grazing together.', 'Big animals → herd.'], 'Elephants live in herds.', 'Colony is used for ants and bees.'],
          ['Ants live together in a…', 'Colony', ['Herd', 'Stable'], ['Under the ground, many tunnels.', 'Insects → colony.'], 'Ants live in colonies.', 'Herds are for big animals.'],
          ['Who leads an elephant herd?', 'The oldest female elephant', ['The smallest baby', 'A tiger'], ['She knows the way to water.', 'The grandmother elephant.'], 'The oldest female usually leads the herd.', 'Babies follow the elders.'],
          ['What do worker bees do?', 'Collect nectar and build the hive', ['Lay all the eggs', 'Sleep all day'], ['They fly from flower to flower.', 'The queen lays eggs.'], 'Workers collect nectar and look after the hive.', 'Only the queen lays eggs.'],
          ['Why do animals live in groups?', 'To stay safe and find food together', ['To fight each other', 'Because they are lost'], ['Many eyes watch for danger.', 'They help each other.'], 'Groups give safety and help find food.', 'Groups cooperate, not fight.'],
          ['Honey is made by…', 'Honeybees', ['Ants', 'Butterflies'], ['Think of a hive on a tree.', 'They sting!'], 'Honeybees make honey.', 'Ants and butterflies do not make honey.'],
        ]),
        matchT('home', 'Match each animal to its home.', [
          ['Bird', 'Nest', '🐦'], ['Bee', 'Hive', '🐝'], ['Cow', 'Shed', '🐄'], ['Lion', 'Den', '🦁'], ['Spider', 'Web', '🕸️'], ['Horse', 'Stable', '🐎'], ['Rabbit', 'Burrow', '🐇'],
        ], ['Where does each one sleep?', 'Some homes are made by the animal itself.'], 'Think of where you see each animal resting.'),
      ],
    },
    {
      id: 'ts4.evs.life.nests', title: 'Birds, nests and eggs',
      intro: [
        h('Clever nest builders'),
        p('The weaver bird (gijigadu) weaves a hanging nest from grass. The crow makes a nest of twigs. The koel lays its eggs in a crow\'s nest!'),
        photo('🪺', 'Birds build nests to keep their eggs and chicks safe.'),
        photo('🥚', 'Birds lay eggs and sit on them to keep them warm.'),
        vis({ kind: 'emoji', text: '🥚 → 🐣 → 🐥 → 🐓' }, 'From egg to chick to hen'),
        keys('Nests are made of twigs, grass, feathers, mud or leaves.', 'Parents sit on eggs to keep them warm until they hatch.', 'Never touch or disturb a nest.'),
        tip('Look up in neem and palm trees to spot nests.'),
      ],
      examples: [
        ex('Which bird weaves a hanging nest of grass?', ['It is called gijigadu in Telugu.'], 'The weaver bird'),
        ex('Why does a hen sit on her eggs?', ['Eggs need warmth to hatch.'], 'To keep them warm'),
      ],
      practice: [
        bank('nest', [
          ['Which bird weaves a hanging nest from grass?', 'Weaver bird', ['Crow', 'Peacock'], ['Its name says what it does.', 'Weaves!'], 'The weaver bird weaves its nest.', 'Crows use twigs; peacocks nest on the ground.'],
          ['Which bird lays eggs in a crow\'s nest?', 'Koel', ['Sparrow', 'Pigeon'], ['It sings "koo-oo" in summer.', 'It does not build its own nest.'], 'The koel lays eggs in a crow\'s nest.', 'Sparrows and pigeons build their own.'],
          ['Why do birds build nests?', 'To keep eggs and chicks safe', ['To store grains for sale', 'To sleep only in winter'], ['What is inside a nest?', 'Eggs and babies.'], 'Nests protect eggs and chicks.', 'Nests are for the young.'],
          ['What should you do if you find a nest with eggs?', 'Leave it alone', ['Take the eggs home', 'Throw stones at it'], ['The mother bird may leave if disturbed.', 'Be kind.'], 'Leave nests alone.', 'Disturbing nests harms the chicks.'],
          ['What comes out of a bird\'s egg?', 'A chick', ['A calf', 'A tadpole'], ['Hen\'s egg → ?', 'Baby bird.'], 'A chick hatches from the egg.', 'Calves are born; tadpoles come from frog eggs.'],
          ['A woodpecker makes its nest…', 'In a hole in a tree trunk', ['Under water', 'In a beehive'], ['It pecks wood.', 'It makes a hole.'], 'Woodpeckers make holes in tree trunks.', 'Woodpeckers peck into trees.'],
        ]),
        orderT('hatch', 'Put these in order, from first to last.', ['Bird builds a nest', 'Bird lays eggs', 'Bird sits on the eggs', 'Chicks hatch', 'Chicks learn to fly'],
          ['What must be ready before the eggs?', 'Flying comes last.'], 'The nest comes first; flying comes last.'),
      ],
    },
    {
      id: 'ts4.evs.life.care', title: 'Kindness to animals and biodiversity',
      intro: [
        h('Many kinds of life'),
        p('Telangana has tigers in Kawal and Amrabad, blackbucks, peacocks, the Palapitta (Indian roller, our state bird) and many insects and plants. This variety of life is called biodiversity.'),
        photo('🦚', 'The peacock is India\'s national bird.'),
        vis({ kind: 'emoji', text: '🐅 🦚 🦌 🐦 🦋 🌳' }, 'Biodiversity: many living things together'),
        def('Biodiversity', 'The many different kinds of plants and animals in a place.'),
        keys('Every living thing has a role.', 'Keep water bowls for birds in summer.', 'Do not tease or hurt animals.', 'Cutting forests takes away animal homes.'),
        tip('Put a bowl of water on your terrace in summer for thirsty birds.'),
      ],
      examples: [
        ex('What is the state bird of Telangana?', ['It is blue and seen during Dasara.'], 'Palapitta (Indian roller)'),
        ex('A stray dog is hurt. What can you do?', ['Do not touch it alone.', 'Tell an elder or call an animal helper.'], 'Tell an elder to get help'),
      ],
      practice: [
        tapT('kind', 'Tap ALL the kind actions towards animals.', ['keeping water for birds', 'feeding stray animals safely', 'leaving nests alone', 'planting trees', 'telling an adult about a hurt animal'], ['throwing stones at dogs', 'catching butterflies for fun', 'cutting trees with nests', 'teasing animals at the zoo'],
          ['Would the animal feel safe?', 'Kindness helps animals live.'], 'Kind actions protect animals.'),
        bank('bio', [
          ['What is biodiversity?', 'Many different kinds of living things', ['Only one kind of tree', 'A type of machine'], ['"Bio" means life.', '"Diversity" means variety.'], 'Biodiversity means a variety of living things.', 'It is about many kinds, not one.'],
          ['What is the state bird of Telangana?', 'Palapitta (Indian roller)', ['Crow', 'Ostrich'], ['It is seen during Dasara.', 'Bright blue wings.'], 'Telangana\'s state bird is the Palapitta.', 'The crow and ostrich are not the state bird.'],
          ['Why should we not cut forests?', 'Animals lose their homes', ['Animals get more homes', 'It makes rain heavier'], ['Where do tigers and birds live?', 'Forests are homes.'], 'Forests are homes for many animals.', 'Cutting forests destroys homes.'],
          ['Which tiger reserve is in Telangana?', 'Amrabad', ['Sundarbans', 'Ranthambore'], ['It is in the Nallamala forest.', 'Near Nagarkurnool.'], 'Amrabad Tiger Reserve is in Telangana (Kawal too).', 'Sundarbans and Ranthambore are in other states.'],
          ['Is it kind to keep a parrot locked in a small cage?', 'No, birds should be free', ['Yes, always'], ['Birds love to fly.', 'How would you feel locked up?'], 'Birds should fly free.', 'Cages stop birds from flying.'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 5
const ch5: USpec = {
  id: 'ts4.evs.ch5', subject: 'evs', title: 'Plants Around Us', source: src(5),
  objectives: [
    {
      id: 'ts4.evs.plants.types', title: 'Creepers, climbers, shrubs and trees',
      intro: [
        h('Small, bushy and tall'),
        p('A pumpkin plant spreads on the ground — a creeper. A bean plant holds a stick and climbs — a climber. A rose plant is bushy — a shrub. A neem plant is tall with a thick trunk — a tree.'),
        photo('🌳', 'A tree has one thick, woody trunk.'),
        photo('🌱', 'Every plant starts small.'),
        vis({ kind: 'emoji', text: '🎃 creeper · 🫘 climber · 🌹 shrub · 🌳 tree' }, 'Four kinds of plants'),
        keys('Creeper: weak stem, spreads on the ground (pumpkin, watermelon).', 'Climber: weak stem, climbs a support (bean, money plant).', 'Shrub: many woody stems, medium height (rose, hibiscus).', 'Tree: one thick trunk, tall (neem, mango, banyan).'),
        tip('Check the stem: thick and hard means tree or shrub; thin and weak means creeper or climber.'),
      ],
      examples: [
        ex('Is a mango plant a shrub or a tree?', ['It is tall with one thick trunk.'], 'A tree'),
        ex('A watermelon plant spreads on the ground. What kind is it?', ['Weak stem along the ground.'], 'A creeper'),
      ],
      practice: [
        bank('type', [
          ['A pumpkin plant spreads on the ground. It is a…', 'Creeper', ['Tree', 'Shrub'], ['Its stem is weak.', 'It lies on the ground.'], 'A pumpkin plant is a creeper.', 'Trees and shrubs stand up on their own.'],
          ['A neem plant is tall with a thick trunk. It is a…', 'Tree', ['Creeper', 'Climber'], ['Look at the trunk.', 'Thick and woody.'], 'Neem is a tree.', 'Creepers and climbers have weak stems.'],
          ['A hibiscus (mandara) plant is bushy with many woody stems. It is a…', 'Shrub', ['Tree', 'Creeper'], ['Medium height, bushy.', 'Many stems.'], 'Hibiscus is a shrub.', 'A tree has one main trunk.'],
          ['A bean plant wraps around a stick and grows up. It is a…', 'Climber', ['Creeper', 'Tree'], ['It holds on to a support.', 'It climbs up.'], 'A bean plant is a climber.', 'Creepers stay on the ground.'],
          ['Which of these is a tree?', 'Banyan', ['Pumpkin', 'Rose'], ['Very big with hanging roots.', 'Huge trunk.'], 'The banyan is a tree.', 'Pumpkin is a creeper; rose is a shrub.'],
          ['Which of these is a creeper?', 'Watermelon plant', ['Mango', 'Coconut'], ['Which grows along the ground?', 'Big fruit on the ground.'], 'A watermelon plant is a creeper.', 'Mango and coconut are trees.'],
        ]),
        matchT('kind', 'Match each plant to its kind.', [
          ['Mango', 'Tree', '🥭'], ['Pumpkin', 'Creeper', '🎃'], ['Rose', 'Shrub', '🌹'], ['Bean', 'Climber', '🫘'],
        ], ['Is the stem thick or weak?', 'Does it climb, spread or stand?'], 'Look at the stem: thick trunk → tree; bushy → shrub; on the ground → creeper; climbing → climber.'),
      ],
    },
    {
      id: 'ts4.evs.plants.parts', title: 'Parts of a plant and their jobs',
      intro: [
        h('Each part has a job'),
        p('Roots hold the plant in the soil and drink water. The stem carries water up. Leaves make food using sunlight. Flowers turn into fruits with seeds.'),
        photo('🍃', 'Green leaves make food for the plant using sunlight.'),
        vis({ kind: 'emoji', text: '🌸 flower · 🍃 leaf · 🌿 stem · roots underground' }, 'Parts of a plant'),
        keys('Root: holds the plant and absorbs water.', 'Stem: holds the plant up and carries water.', 'Leaf: makes food.', 'Flower: becomes fruit and seed.'),
        tip('Put a white flower in coloured water — the colour travels up the stem!'),
      ],
      examples: [
        ex('Which part of the plant makes food?', ['It is green and gets sunlight.'], 'The leaf'),
        ex('A carrot is which part of the plant?', ['It grows under the ground and is thick.'], 'The root'),
      ],
      practice: [
        matchT('job', 'Match each part of the plant to its job.', [
          ['Root', 'Absorbs water from soil', '🥕'], ['Stem', 'Carries water up', '🌿'], ['Leaf', 'Makes food', '🍃'], ['Flower', 'Becomes a fruit', '🌸'], ['Seed', 'Grows into a new plant', '🌱'],
        ], ['Start with the part you know best.', 'Leaves are the food makers.'], 'Think from bottom to top: root, stem, leaf, flower, seed.'),
        bank('eat', [
          ['A carrot is which part of the plant?', 'Root', ['Stem', 'Leaf'], ['It grows under the soil.', 'It is long and pointed.'], 'Carrot is a root.', 'It grows under the ground as a root.'],
          ['Spinach (palakura) is which part of the plant?', 'Leaf', ['Root', 'Seed'], ['It is green and flat.', 'We eat it in dal.'], 'Spinach is leaves.', 'We eat its green leaves.'],
          ['Sugarcane is which part of the plant?', 'Stem', ['Leaf', 'Flower'], ['It is long and hard.', 'It stands up.'], 'Sugarcane is a stem.', 'We chew the juicy stem.'],
          ['Cauliflower is which part of the plant?', 'Flower', ['Root', 'Stem'], ['The name gives a clue.', '___flower.'], 'Cauliflower is a bunch of flowers.', 'Its name says flower.'],
          ['Which part holds the plant firmly in the soil?', 'Root', ['Leaf', 'Flower'], ['It is under the ground.', 'Like an anchor.'], 'Roots hold the plant in the soil.', 'Leaves and flowers are above ground.'],
          ['Rice is which part of the plant?', 'Seed', ['Leaf', 'Root'], ['Paddy grains.', 'They can grow into new plants.'], 'Rice grains are seeds.', 'We eat the seeds of paddy.'],
        ]),
      ],
    },
    {
      id: 'ts4.evs.plants.seeds', title: 'From flower to fruit to seed, and germination',
      intro: [
        h('A seed wakes up'),
        p('A flower becomes a fruit. The fruit has seeds. Put a seed in wet soil — it swells, a tiny root comes out, then a shoot with leaves. This is germination.'),
        photo('🌱', 'A seedling has just germinated.'),
        vis({ kind: 'emoji', text: '🌸 → 🥭 → seed → 🌱 → 🌳' }, 'Flower, fruit, seed, seedling, tree'),
        def('Germination', 'When a seed starts to grow into a new plant.'),
        keys('Seeds need water, air and warmth to germinate.', 'The root comes out first, then the shoot.', 'Seeds spread by wind, water, animals and bursting pods.'),
        tip('Try it: soak green gram (pesalu) overnight and keep it in a wet cloth for 2 days.'),
      ],
      examples: [
        ex('What three things does a seed need to germinate?', ['Think of soaking seeds in a wet cloth.'], 'Water, air and warmth'),
        ex('What comes out of a germinating seed first?', ['It grows downward.'], 'The root'),
      ],
      practice: [
        orderT('cycle', 'Put the life of a mango tree in order.', ['Flower', 'Fruit', 'Seed', 'Seedling', 'Tree'],
          ['Which comes on a big tree first, flower or fruit?', 'The seed grows into a seedling.'], 'Flowers become fruits; fruits hold seeds; seeds grow into seedlings.'),
        bank('germ', [
          ['What does a seed need to germinate?', 'Water, air and warmth', ['Only darkness', 'Salt and sugar'], ['What did you give green gram?', 'A wet cloth.'], 'Seeds need water, air and warmth.', 'Salt and sugar do not help seeds sprout.'],
          ['What comes out of a seed first when it germinates?', 'A tiny root', ['A flower', 'A fruit'], ['It grows down into the soil.', 'Flowers come much later.'], 'The root comes out first.', 'Flowers and fruits come much later.'],
          ['How do cotton seeds spread?', 'By wind', ['By swimming', 'By walking'], ['They are light and fluffy.', 'They float in the air.'], 'Light, fluffy seeds are carried by wind.', 'Seeds cannot swim or walk.'],
          ['How do many fruit seeds spread far away?', 'Animals and birds eat fruits and drop seeds', ['Seeds fly by themselves', 'Seeds dig tunnels'], ['Think of birds eating fruits.', 'They drop seeds elsewhere.'], 'Animals help spread seeds.', 'Seeds need help from wind, water or animals.'],
          ['A flower turns into a…', 'Fruit', ['Root', 'Stem'], ['What grows after the flower falls?', 'Mango flowers → mangoes.'], 'A flower becomes a fruit.', 'Roots and stems are already there.'],
          ['Seeds kept in a dry box for a week will…', 'Not germinate', ['Germinate quickly', 'Become fruits'], ['What is missing?', 'Water.'], 'Without water seeds do not germinate.', 'Seeds need water to start growing.'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 6
const DIRS = ['North', 'East', 'South', 'West'];
const ch6: USpec = {
  id: 'ts4.evs.ch6', subject: 'evs', title: 'Find the Way / Directions', source: src(6),
  objectives: [
    {
      id: 'ts4.evs.dir.four', title: 'The four directions',
      intro: [
        h('Where does the Sun rise?'),
        p('In the morning, stand facing the rising Sun. You are facing East. Behind you is West. Your left hand points North and your right hand points South.'),
        photo('🧭', 'A compass needle always points North.'),
        photo('🌅', 'The Sun rises in the East.'),
        vis({ kind: 'emoji', text: '⬆️ N · ➡️ E · ⬇️ S · ⬅️ W' }, 'Directions on a map: North is at the top'),
        keys('Sun rises in the East and sets in the West.', 'On a map, North is at the top.', 'Facing North: East is on your right, West on your left.', 'Corners: North-East, South-East, South-West, North-West.'),
        tip('Remember the order going clockwise: "Never Eat Sour Watermelons" — N, E, S, W.'),
      ],
      examples: [
        ex('You face the rising Sun. Which direction is behind you?', ['Rising Sun → East in front.', 'Opposite of East is West.'], 'West'),
        ex('On a map, the school is at the top and the temple at the bottom. Which direction is the temple from the school?', ['Top is North, bottom is South.'], 'South'),
      ],
      practice: [
        tp('turn', (r) => {
          const f = r.int(0, 3), side = r.pick(['right', 'left', 'back']);
          const a = DIRS[(f + (side === 'right' ? 1 : side === 'left' ? 3 : 2)) % 4];
          return mcq(r, `You are facing ${DIRS[f]}. Which direction is on your ${side === 'back' ? 'back (behind you)' : side}?`, a, DIRS.filter((x) => x !== a),
            ['Picture N at the top, E right, S bottom, W left.', 'Turning right goes N → E → S → W.'], [`Facing ${DIRS[f]}, your ${side} is ${a}.`], 'Use "Never Eat Sour Watermelons" in clockwise order: right is the next one.');
        }),
        bank('sun', [
          ['In which direction does the Sun rise?', 'East', ['West', 'North', 'South'], ['Look out in the morning.', 'Opposite of sunset.'], 'The Sun rises in the East.', 'The Sun sets in the West, it rises in the East.'],
          ['In which direction does the Sun set?', 'West', ['East', 'North', 'South'], ['Evening sky.', 'Opposite of sunrise.'], 'The Sun sets in the West.', 'Sunrise is East; sunset is West.'],
          ['Which direction does a compass needle point to?', 'North', ['South', 'East', 'West'], ['Sailors used it to find their way.', 'Top of a map.'], 'A compass needle points North.', 'The needle always points North.'],
          ['On a map, which direction is usually at the top?', 'North', ['South', 'East', 'West'], ['Look at any atlas page.', 'An arrow with N.'], 'North is at the top of a map.', 'Maps put North at the top.'],
          ['The corner between North and East is called…', 'North-East', ['South-West', 'North-West'], ['Join the two names.', 'North first.'], 'It is North-East.', 'North-West is between North and West.'],
        ]),
      ],
    },
    {
      id: 'ts4.evs.dir.maps', title: 'Maps of village, mandal, district and state',
      intro: [
        h('Pictures from above'),
        p('A map is a drawing of a place as seen from above. It uses symbols for roads, rivers, temples and schools.'),
        photo('🗺️', 'A map shows places, roads and rivers from above.'),
        vis({ kind: 'emoji', text: 'village 🏘️ < mandal < district < Telangana state < India' }, 'From small areas to big'),
        keys('Many villages make a mandal.', 'Many mandals make a district.', 'Many districts make our state, Telangana.', 'Hyderabad is the capital of Telangana.'),
        tip('Draw a map of your house to school with a few symbols.'),
      ],
      examples: [
        ex('Which is bigger: a mandal or a district?', ['A district has many mandals.'], 'A district'),
        ex('What is the capital of Telangana?', ['It has the Charminar.'], 'Hyderabad'),
      ],
      practice: [
        orderT('size', 'Arrange from smallest to biggest.', ['Village', 'Mandal', 'District', 'State', 'Country'],
          ['Many villages make one mandal.', 'The country is the biggest.'], 'Villages join to make mandals, mandals make districts, districts make a state.'),
        bank('map', [
          ['What does a map show?', 'A place drawn as seen from above', ['A person\'s photo', 'A story'], ['Imagine a bird\'s view.', 'Roads and rivers.'], 'A map is a drawing from above.', 'A map shows places, not people.'],
          ['What is the capital of Telangana?', 'Hyderabad', ['Warangal', 'Karimnagar'], ['The Charminar is there.', 'The biggest city.'], 'Hyderabad is the capital.', 'Warangal and Karimnagar are districts, not the capital.'],
          ['Many mandals together make a…', 'District', ['Village', 'Street'], ['Bigger than a mandal.', 'It has a Collector.'], 'Mandals together make a district.', 'A village is smaller than a mandal.'],
          ['On a map, a blue wavy line usually shows a…', 'River', ['Road', 'Railway line'], ['Water is shown in blue.', 'Like the Godavari.'], 'Blue lines show rivers.', 'Roads are usually red or black lines.'],
          ['Which big river flows through Telangana?', 'Godavari', ['Ganga', 'Yamuna'], ['It flows through Bhadrachalam.', 'Its name starts with G but not Ganga.'], 'The Godavari (and Krishna) flow through Telangana.', 'Ganga and Yamuna flow in north India.'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 7
const ch7: USpec = {
  id: 'ts4.evs.ch7', subject: 'evs', title: 'Public Institutions', source: src(7),
  objectives: [
    {
      id: 'ts4.evs.inst.panchayat', title: 'The gram panchayat',
      intro: [
        h('Who looks after our village?'),
        p('Every village has a gram panchayat. The villagers vote to choose a sarpanch and ward members. They look after roads, drinking water, streetlights and cleanliness.'),
        photo('🏢', 'The gram panchayat office is where villagers can bring their problems.'),
        vis({ kind: 'emoji', text: '🗳️ villagers vote → sarpanch + ward members' }, 'Villagers choose the panchayat'),
        def('Sarpanch', 'The head of the gram panchayat, chosen by the villagers.'),
        keys('Gram sabha: a meeting of all adult villagers.', 'The panchayat collects house tax and water tax.', 'It keeps records of births and deaths.'),
        tip('Ask an elder who your village sarpanch or town councillor is.'),
      ],
      examples: [
        ex('Who is the head of a gram panchayat?', ['Villagers elect this person.'], 'The sarpanch'),
        ex('The streetlight near your house does not work. Where can your family complain in a village?', ['Streetlights are a panchayat job.'], 'The gram panchayat office'),
      ],
      practice: [
        bank('gp', [
          ['Who chooses the sarpanch?', 'The villagers, by voting', ['The school teacher alone', 'The shopkeeper'], ['It is an election.', 'Adults vote.'], 'Villagers elect the sarpanch.', 'One person cannot choose; everyone votes.'],
          ['Which work does the gram panchayat do?', 'Provides drinking water and streetlights', ['Makes films', 'Builds aeroplanes'], ['Think of village needs.', 'Water, lights, roads.'], 'The panchayat provides water, lights, roads and cleanliness.', 'Those are not village services.'],
          ['A meeting of all adult villagers is called…', 'Gram sabha', ['Cricket match', 'Bus depot'], ['Gram = village, sabha = meeting.', 'Everyone can speak.'], 'It is the gram sabha.', 'A gram sabha is a village meeting.'],
          ['Where are births and deaths recorded in a village?', 'Gram panchayat office', ['Railway station', 'Cinema hall'], ['It keeps village records.', 'The panchayat secretary writes them.'], 'The panchayat keeps these records.', 'Records are kept at the panchayat office.'],
          ['What does the panchayat collect to pay for village work?', 'Taxes like house tax and water tax', ['Toys', 'Marks'], ['Money for services.', 'Every house pays a little.'], 'Villagers pay taxes to the panchayat.', 'Services are paid for by taxes.'],
        ]),
        tapT('job', 'Tap ALL the jobs of a gram panchayat.', ['cleaning drains', 'fixing streetlights', 'supplying drinking water', 'repairing village roads', 'recording births'], ['flying planes', 'making mobile phones', 'running the Indian army', 'printing money'],
          ['Think of what a village needs every day.', 'Big national jobs belong to other governments.'], 'The panchayat does local village work.'),
      ],
    },
    {
      id: 'ts4.evs.inst.offices', title: 'Mandal and district offices, public property and RTI',
      intro: [
        h('Offices that serve us'),
        p('The MRO (Tahsildar) office in the mandal gives caste, income and land certificates. The District Collector leads the district from the Collectorate. Schools, hospitals, parks and buses are public property — they belong to all of us.'),
        photo('🏫', 'A government school is public property built with everyone\'s tax money.'),
        vis({ kind: 'emoji', text: 'village → mandal (MRO) → district (Collector) → state' }, 'Levels of government offices'),
        def('Public property', 'Things built for everyone to use, like roads, parks, schools and buses.'),
        def('Right to Information (RTI)', 'A law that lets citizens ask government offices for information.'),
        keys('Never damage public property.', 'Adults can use RTI to ask how public money was spent.'),
        tip('Keep your school clean — it is your public property!'),
      ],
      examples: [
        ex('Who is the head of a district?', ['Works from the Collectorate.'], 'The District Collector'),
        ex('Someone writes on the walls of a bus. Is that right?', ['A bus is public property.', 'It belongs to everyone.'], 'No, it damages public property'),
      ],
      practice: [
        bank('off', [
          ['Who is the head of the district administration?', 'District Collector', ['Sarpanch', 'Bus conductor'], ['Works in the Collectorate.', 'Above the mandal officers.'], 'The District Collector heads the district.', 'The sarpanch heads a village.'],
          ['Where do people get income and caste certificates in a mandal?', 'MRO (Tahsildar) office', ['Post office', 'Bus stand'], ['Mandal Revenue Office.', 'The Tahsildar signs them.'], 'Certificates come from the MRO office.', 'Post offices handle letters.'],
          ['Which is public property?', 'Government hospital', ['Your pencil box', 'Your neighbour\'s bicycle'], ['Who owns it?', 'Everyone.'], 'A government hospital belongs to the public.', 'Pencil boxes and bicycles belong to people.'],
          ['What does RTI stand for?', 'Right to Information', ['Road to India', 'Rice and Tea Index'], ['It is a law.', 'Citizens can ask for information.'], 'RTI = Right to Information.', 'It is a law to get information.'],
          ['How should we treat public parks?', 'Keep them clean and do not break things', ['Throw garbage', 'Pluck all flowers'], ['Others use it too.', 'It is ours to care for.'], 'Look after public property.', 'Damaging it hurts everyone.'],
        ]),
        tapT('public', 'Tap ALL the public property.', ['government school', 'bus stand', 'public park', 'village road', 'streetlight', 'government hospital'], ['your schoolbag', 'a family car', 'grandmother\'s spectacles', 'your toys'],
          ['Who uses and owns it?', 'Public property is for everyone.'], 'Public property belongs to everyone; personal things belong to one person.'),
      ],
    },
  ],
};

// ================================================================== CH 8
const ch8: USpec = {
  id: 'ts4.evs.ch8', subject: 'evs', title: 'Houses - Construction - Sanitation', source: src(8),
  objectives: [
    {
      id: 'ts4.evs.house.types', title: 'Houses then and now, and how they are built',
      intro: [
        h('From huts to apartments'),
        p('Long ago, many houses were made of mud with thatched roofs (kutcha houses). Today many are built with bricks, cement and iron rods (pucca houses). In cities, many families live in tall apartments.'),
        photo('🧱', 'Bricks are made from clay, shaped and baked in a kiln.'),
        photo('🏢', 'Apartments let many families live on a small piece of land.'),
        vis({ kind: 'emoji', text: '🛖 kutcha · 🏠 pucca · 🏢 apartment' }, 'Kinds of houses'),
        keys('Kutcha: mud, thatch, bamboo.', 'Pucca: bricks, cement, steel, concrete.', 'Houses differ by region: sloping roofs where it rains or snows a lot, houses on stilts near water, igloos in snow.'),
        tip('Look at the roof of houses in your area — flat or sloping?'),
      ],
      examples: [
        ex('A house has mud walls and a palm-leaf roof. Kutcha or pucca?', ['Mud and leaves are not permanent materials.'], 'Kutcha'),
        ex('Why do houses in hilly, rainy places have sloping roofs?', ['Rain and snow slide off.'], 'So water and snow flow off'),
      ],
      practice: [
        orderT('brick', 'Put the steps of brick-making in order.', ['Dig and mix clay with water', 'Pour into moulds', 'Dry in the sun', 'Bake in a kiln'],
          ['First you need wet clay.', 'Baking makes bricks hard — the last step.'], 'Clay is mixed, moulded, dried and then baked.'),
        bank('house', [
          ['A house made of bricks and cement is called…', 'Pucca house', ['Kutcha house', 'Tent'], ['It is strong and lasts long.', 'Pucca = strong.'], 'Brick and cement houses are pucca.', 'Kutcha houses use mud and thatch.'],
          ['Why are houses in snowy places built with sloping roofs?', 'So snow slides off', ['To keep birds away', 'To look tall'], ['Heavy snow could break a flat roof.', 'Slopes let it slide.'], 'Sloping roofs let snow and rain slide off.', 'The slope is for weather, not birds.'],
          ['In which place are houses built on stilts (tall poles)?', 'Places that flood, near water', ['Deserts', 'Inside caves'], ['Water can rise.', 'Keep the floor high.'], 'Stilt houses stay above flood water.', 'Deserts do not flood often.'],
          ['What is an igloo made of?', 'Blocks of snow', ['Bricks', 'Bamboo'], ['It is very cold there.', 'White blocks.'], 'Igloos are made of snow blocks.', 'Igloos are built in snowy lands.'],
          ['Why are apartments built in big cities like Hyderabad?', 'Many families can live on little land', ['Land is free there', 'People dislike trees'], ['Cities are crowded.', 'Build upward.'], 'Apartments save land.', 'City land is costly and scarce.'],
          ['Where are bricks baked?', 'In a kiln', ['In a fridge', 'In a well'], ['Very hot fire.', 'Brick kilns have chimneys.'], 'Bricks are baked in a kiln.', 'Baking needs great heat.'],
        ]),
      ],
    },
    {
      id: 'ts4.evs.house.sanitation', title: 'Sanitation and toilets',
      intro: [
        h('Clean surroundings, healthy family'),
        p('Using a toilet keeps germs away from our food and water. Open defecation spreads diseases like diarrhoea and cholera. Every home should have a toilet.'),
        photo('🧽', 'Clean toilets and washed hands keep germs away.'),
        vis({ kind: 'emoji', text: '🚽 → 🧼 → ✋ clean' }, 'Use the toilet, then wash hands with soap'),
        keys('Always use a toilet.', 'Wash hands with soap after the toilet and before eating.', 'Cover dustbins; do not let water stagnate (mosquitoes breed there).', 'Swachh Bharat: a clean India campaign.'),
        tip('Sing "Happy Birthday" twice while washing hands — that is about 20 seconds.'),
      ],
      examples: [
        ex('Why is open defecation harmful?', ['Flies carry germs from it to food.', 'Rain washes germs into water.'], 'It spreads diseases'),
        ex('When should we wash our hands with soap?', ['Before eating', 'After using the toilet'], 'Before eating and after the toilet'),
      ],
      practice: [
        tapT('clean', 'Tap ALL the healthy habits.', ['using a toilet', 'washing hands with soap', 'covering the dustbin', 'keeping drains clean', 'drinking clean water'], ['open defecation', 'throwing garbage on the road', 'letting water stand in old tyres', 'eating with dirty hands'],
          ['Which habits stop germs?', 'Clean hands, clean places.'], 'Healthy habits keep germs away from food and water.'),
        bank('san', [
          ['What disease can spread because of open defecation?', 'Diarrhoea', ['Short sight', 'Broken bones'], ['Germs get into water and food.', 'A stomach illness.'], 'Diarrhoea and cholera spread this way.', 'Germs cause stomach diseases.'],
          ['Where do mosquitoes breed?', 'In stagnant (still) water', ['In running cold rivers only', 'In clean dry rooms'], ['Look at water in old tyres and pots.', 'Still water.'], 'Mosquitoes lay eggs in still water.', 'Remove standing water to stop mosquitoes.'],
          ['How long should you wash your hands with soap?', 'About 20 seconds', ['1 second', '1 hour'], ['Sing a short song twice.', 'Rub all parts.'], 'About 20 seconds removes germs.', 'One second is too short; an hour wastes water.'],
          ['Which carries germs from dirt to our food?', 'Flies', ['Butterflies', 'Fish'], ['They sit on garbage and then on food.', 'Buzzing insects.'], 'Houseflies carry germs.', 'Flies move between dirt and food.'],
          ['What is the Swachh Bharat campaign about?', 'Keeping India clean', ['Building planes', 'Playing cricket'], ['Swachh means clean.', 'Toilets and clean streets.'], 'Swachh Bharat means Clean India.', 'Swachh means clean.'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 9
const ch9: USpec = {
  id: 'ts4.evs.ch9', subject: 'evs', title: 'Our Village - Our Tanks', source: src(9),
  objectives: [
    {
      id: 'ts4.evs.tank.uses', title: 'Village tanks and why they matter',
      intro: [
        h('A tank is a village treasure'),
        p('Long ago, the Kakatiya kings built many tanks (cheruvulu) in Telangana to store rain water. Ramappa, Pakhal and Laknavaram lakes are famous. Farmers use tank water for paddy fields.'),
        photo('🏞️', 'A village tank stores rain water for the whole year.'),
        photo('🦆', 'Ducks, fish and birds live in and around tanks.'),
        vis({ kind: 'emoji', text: '🌧️ → 🏞️ tank → 🌾 fields · 🐄 cattle · 🐟 fish' }, 'Uses of a tank'),
        keys('Tanks store rain water.', 'Uses: irrigation, cattle drinking, fishing, groundwater in wells.', 'Mission Kakatiya restored thousands of old tanks.', 'The bund (katta) holds back the water; the sluice (thoomu) lets it out to fields.'),
        tip('Ask an elder the name of your village tank and who built it.'),
      ],
      examples: [
        ex('Which kings built many tanks in Telangana long ago?', ['They ruled from Warangal.'], 'The Kakatiya kings'),
        ex('Name two uses of a village tank.', ['Water for fields.', 'Drinking water for cattle.'], 'Irrigation and water for cattle'),
      ],
      practice: [
        bank('tank', [
          ['Which kings built many tanks in Telangana?', 'Kakatiyas', ['Mughals', 'British'], ['They built the Thousand Pillar Temple too.', 'Capital at Warangal.'], 'The Kakatiya kings built many tanks.', 'The Kakatiyas are famous for tanks.'],
          ['What is the main use of tank water for farmers?', 'Watering crops (irrigation)', ['Making bricks only', 'Washing buses'], ['Paddy needs lots of water.', 'Water goes to fields.'], 'Tank water irrigates crops.', 'Farmers use it for fields.'],
          ['Which of these is a famous lake in Telangana?', 'Ramappa lake', ['Dal lake', 'Chilika lake'], ['Near the Ramappa temple, Mulugu.', 'Built by Kakatiyas.'], 'Ramappa lake is in Telangana.', 'Dal is in Kashmir; Chilika is in Odisha.'],
          ['What was Mission Kakatiya?', 'A programme to restore old village tanks', ['A space mission', 'A cricket match'], ['Named after the tank-building kings.', 'Removing silt, fixing bunds.'], 'It restored village tanks.', 'It is about tanks, not space.'],
          ['How does a full tank help wells nearby?', 'It raises the groundwater', ['It dries the wells', 'It has no effect'], ['Water seeps into the ground.', 'Wells fill up.'], 'Tank water seeps down and fills wells.', 'Stored water recharges the ground.'],
          ['What is the wall of earth that holds back tank water called?', 'Bund (katta)', ['Roof', 'Chimney'], ['Farmers walk on it.', 'Katta in Telugu.'], 'It is the bund.', 'A bund holds water in the tank.'],
        ]),
        tapT('uses', 'Tap ALL the uses of a village tank.', ['irrigating fields', 'water for cattle', 'fish farming', 'filling wells with groundwater', 'home for birds'], ['charging mobile phones', 'making roads', 'storing grain', 'flying kites'],
          ['What can water do?', 'Think of farmers, animals and fish.'], 'Tanks give water for fields, animals and fish.'),
      ],
    },
    {
      id: 'ts4.evs.tank.care', title: 'Keeping tanks clean',
      intro: [
        h('Do not pollute our tank'),
        p('When people throw plastic and garbage, wash vehicles, or let drain water into a tank, the water becomes dirty. Fish die and the water is not safe.'),
        photo('💧', 'Clean water is precious — keep tanks clean.'),
        vis({ kind: 'emoji', text: '🚫 plastic · 🚫 garbage · ✅ trees on the bund' }, 'Do and don\'t for tanks'),
        keys('Do not throw plastic or garbage into tanks.', 'Remove silt so the tank holds more water.', 'Plant trees on the bund.', 'Immerse idols made of clay, not plaster.'),
        tip('Villagers working together (shramadaan) can clean a tank in a day.'),
      ],
      examples: [
        ex('Why do fish die in a polluted tank?', ['Dirty water has less clean air (oxygen) for fish.'], 'The water becomes dirty and harmful'),
        ex('What is silt?', ['Fine soil carried by rain water.', 'It settles at the bottom.'], 'Mud that collects at the bottom of the tank'),
      ],
      practice: [
        tapT('good', 'Tap ALL the actions that keep a tank clean.', ['removing silt', 'planting trees on the bund', 'using clay idols', 'putting garbage in dustbins', 'stopping drain water from entering'], ['throwing plastic bags in', 'washing lorries in the tank', 'dumping building waste', 'letting sewage flow in'],
          ['Does it make the water cleaner?', 'Anything thrown in makes it dirty.'], 'Keep waste out and care for the tank.'),
        bank('care', [
          ['What happens when silt fills a tank?', 'It holds less water', ['It holds more water', 'The water becomes sweeter'], ['Silt takes up space.', 'Less room for water.'], 'Silt reduces the space for water.', 'Mud takes the place of water.'],
          ['Which idols are better for immersion in tanks?', 'Clay idols', ['Plaster of Paris idols', 'Plastic idols'], ['Which dissolves naturally?', 'Clay goes back to soil.'], 'Clay idols do not pollute.', 'Plaster and plastic pollute the water.'],
          ['Why plant trees on the bund?', 'Roots hold the soil and stop it washing away', ['To hide the tank', 'To make the water salty'], ['Roots grip soil.', 'Stronger bund.'], 'Tree roots make the bund strong.', 'Trees protect the bund.'],
          ['Is it right to wash vehicles in the village tank?', 'No, oil and dirt pollute it', ['Yes, always'], ['Oil floats on water.', 'Fish need clean water.'], 'Washing vehicles pollutes the tank.', 'Oil and soap harm the water.'],
          ['What is shramadaan?', 'People working together for free for the village', ['A kind of fish', 'A type of tax'], ['Shramam means work.', 'Daanam means giving.'], 'Shramadaan is giving your work for the common good.', 'It means donating work.'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 10
const ch10: USpec = {
  id: 'ts4.evs.ch10', subject: 'evs', title: 'Our Food - Our Health', source: src(10),
  objectives: [
    {
      id: 'ts4.evs.food.groups', title: 'Food that keeps us healthy',
      intro: [
        h('A balanced plate'),
        p('Rice, rotis and jowar give energy. Dal, eggs, milk and fish help us grow. Fruits and vegetables protect us from illness.'),
        photo('🥕', 'Vegetables like carrots protect our eyes and body.'),
        photo('🥛', 'Milk helps build strong bones and teeth.'),
        vis({ kind: 'emoji', text: '🍚 energy · 🥚 growth · 🥕🍎 protection · 💧 water' }, 'Three kinds of food on a balanced plate'),
        keys('Energy-giving: rice, roti, jowar, ragi, potato, jaggery.', 'Body-building: dal, eggs, milk, fish, meat, groundnuts.', 'Protective: fruits and vegetables.', 'Drink plenty of clean water.'),
        tip('Try to have three colours on your plate every day.'),
      ],
      examples: [
        ex('Which food gives quick energy: rice or cucumber?', ['Rice is a grain full of starch.'], 'Rice'),
        ex('Why should we eat dal and eggs?', ['They help the body grow and repair.'], 'They are body-building foods'),
      ],
      practice: [
        matchT('grp', 'Match each food to what it does for us.', [
          ['Rice', 'Gives energy', '🍚'], ['Egg', 'Helps us grow', '🥚'], ['Carrot', 'Protects from illness', '🥕'],
          ['Milk', 'Builds bones and teeth', '🥛'], ['Orange', 'Protects from colds', '🍊'],
        ], ['Grains → energy.', 'Fruits and vegetables → protection.'], 'Grains give energy; dal, eggs and milk build the body; fruits and vegetables protect.'),
        bank('junk', [
          ['Which is a healthier snack?', 'Roasted groundnuts', ['A packet of chips every day', 'Cola'], ['Which is natural?', 'Less oil, salt and sugar.'], 'Roasted groundnuts are healthy.', 'Chips and cola have too much salt or sugar.'],
          ['What should you drink most in a hot summer?', 'Clean water and buttermilk', ['Fizzy drinks only', 'Nothing at all'], ['The body loses water in sweat.', 'Buttermilk cools us.'], 'Water and buttermilk keep us cool.', 'Fizzy drinks have too much sugar.'],
          ['Which food helps build strong bones?', 'Milk', ['Chips', 'Sweets'], ['It is white.', 'Calcium!'], 'Milk has calcium for bones.', 'Chips and sweets do not build bones.'],
          ['Why should we wash fruits before eating?', 'To remove dirt and germs', ['To make them sweeter', 'To make them bigger'], ['Fruits travel from farm to market.', 'Germs on the skin.'], 'Washing removes dirt and germs.', 'Washing is for cleanliness.'],
          ['Eating only sweets and fried food every day makes us…', 'Unhealthy', ['Strong and healthy', 'Taller at once'], ['Too much sugar and oil.', 'The body needs balance.'], 'Too much junk food is unhealthy.', 'We need a balanced plate.'],
        ]),
      ],
    },
    {
      id: 'ts4.evs.food.meals', title: 'Eating together: picnics and mid-day meals',
      intro: [
        h('Sharing food is fun'),
        p('At a picnic, friends bring different foods and share. At school, the mid-day meal gives every child a hot lunch of rice, dal, vegetables and sometimes an egg.'),
        photo('🧺', 'A picnic basket with food to share.'),
        vis({ kind: 'emoji', text: '🍚 + 🥣 dal + 🥗 + 🥚 = mid-day meal' }, 'A mid-day meal plate'),
        keys('The mid-day meal helps children stay healthy and come to school.', 'Wash hands before eating.', 'Eat together; do not waste food.', 'Help clean up after a picnic.'),
        tip('Take only as much as you can eat — you can always ask for more.'),
      ],
      examples: [
        ex('Why does the school give a mid-day meal?', ['A hungry child cannot learn well.', 'It gives nutrition to every child.'], 'So every child gets healthy food'),
        ex('What should you do with leftover wrappers at a picnic?', ['Do not litter the place.'], 'Put them in a dustbin or carry them back'),
      ],
      practice: [
        bank('meal', [
          ['What do we do before eating the mid-day meal?', 'Wash hands with soap', ['Play in the mud', 'Skip the meal'], ['Germs on hands go into food.', 'Clean hands.'], 'Wash hands with soap before eating.', 'Dirty hands bring germs.'],
          ['Why is the mid-day meal important?', 'It gives children healthy food at school', ['It replaces all lessons', 'It is only for teachers'], ['Who eats it?', 'All children.'], 'It gives every child a nutritious lunch.', 'It is for students\' health.'],
          ['What should you do with food you cannot finish?', 'Take less next time; do not waste', ['Throw it on the floor', 'Hide it in the desk'], ['Food is precious.', 'Farmers worked hard for it.'], 'Take only what you can eat.', 'Wasting food is not good.'],
          ['At a picnic, what is a good thing to do?', 'Share food and clean up afterwards', ['Leave plastic behind', 'Eat others\' food without asking'], ['Be a good friend.', 'Leave the place clean.'], 'Share and clean up.', 'Litter spoils picnic spots.'],
          ['Which is a typical mid-day meal in Telangana schools?', 'Rice, dal, vegetable curry and egg', ['Only chocolates', 'Only cold drinks'], ['A full plate.', 'Grains, dal and vegetables.'], 'Rice, dal, vegetables and egg.', 'A meal needs grains, dal and vegetables.'],
        ]),
        orderT('wash', 'Put the hand-washing steps in order.', ['Wet your hands', 'Rub with soap', 'Scrub between fingers and nails', 'Rinse with water', 'Dry with a clean cloth'],
          ['Soap goes on wet hands.', 'Drying is the last step.'], 'Wet, soap, scrub, rinse, dry.'),
      ],
    },
  ],
};

// ================================================================== CH 11
const ch11: USpec = {
  id: 'ts4.evs.ch11', subject: 'evs', title: 'From Village to Delhi', source: src(11),
  objectives: [
    {
      id: 'ts4.evs.travel.trip', title: 'Travelling by bus and train',
      intro: [
        h('A long journey'),
        p('Teja travels from his village to Hyderabad by bus, and then to Delhi by train. He buys tickets, keeps them safely, and follows the rules.'),
        photo('🚆', 'Trains carry people over long distances.'),
        photo('🚌', 'TSRTC buses connect villages to towns.'),
        vis({ kind: 'emoji', text: '🏘️ → 🚌 → Hyderabad → 🚆 → Delhi' }, 'Village to Delhi'),
        keys('Buy a ticket before or as you board.', 'Keep your ticket until the end of the journey.', 'Do not lean out of windows or doors.', 'Reserve train seats in advance for long journeys.', 'Delhi is the capital of India.'),
        tip('Keep your ticket in a safe pocket — a checker (TTE) may ask for it.'),
      ],
      examples: [
        ex('Who checks tickets on a train?', ['The travelling ticket examiner.'], 'The TTE'),
        ex('Which is faster for a long trip: a bullock cart or a train?', ['Trains run on rails at high speed.'], 'The train'),
      ],
      practice: [
        bank('trip', [
          ['What is the capital of India?', 'New Delhi', ['Hyderabad', 'Mumbai'], ['The Red Fort is there.', 'Parliament is there.'], 'New Delhi is the capital of India.', 'Hyderabad is Telangana\'s capital.'],
          ['Who checks tickets on a train?', 'The TTE (ticket examiner)', ['The engine driver', 'A passenger'], ['He walks through coaches.', 'Travelling Ticket Examiner.'], 'The TTE checks tickets.', 'The driver drives the train.'],
          ['Is it safe to stand at the door of a moving train?', 'No', ['Yes'], ['You could fall.', 'Stay inside.'], 'No. Always stay inside.', 'Standing at the door is dangerous.'],
          ['Why keep your ticket till the end of the journey?', 'It may be checked anytime', ['To throw it at the end', 'It is a toy'], ['A checker may come.', 'No ticket = fine.'], 'Tickets can be checked any time.', 'Without a ticket you may be fined.'],
          ['Which is the fastest way to travel from Hyderabad to Delhi?', 'Aeroplane', ['Bullock cart', 'Bicycle'], ['It flies.', 'About 2 hours.'], 'An aeroplane is the fastest.', 'Carts and bicycles are very slow for such distances.'],
          ['Where do you buy a train ticket?', 'At the railway booking counter or online', ['At a vegetable shop', 'From the engine'], ['Railway station.', 'Or on a phone app.'], 'At the booking counter or online.', 'Tickets come from the railways.'],
        ]),
        matchT('vehicle', 'Match each vehicle to where it travels.', [
          ['Train', 'On rails', '🚆'], ['Bus', 'On roads', '🚌'], ['Aeroplane', 'In the sky', '✈️'], ['Ship', 'On the sea', '🚢'], ['Boat', 'On rivers', '⛵'], ['Bicycle', 'On roads and paths', '🚲'],
        ], ['Think where you see each one.', 'Trains need rails.'], 'Each vehicle moves on rails, roads, water or in the air.'),
      ],
    },
    {
      id: 'ts4.evs.travel.signals', title: 'Traffic signals and road safety',
      intro: [
        h('Red, yellow, green'),
        p('A traffic signal keeps us safe. Red means stop. Yellow means get ready (slow down). Green means go — but look both ways first.'),
        photo('🚗', 'Cars stop at a red light so people can cross.'),
        vis({ kind: 'emoji', text: '🔴 stop · 🟡 get ready · 🟢 go' }, 'Traffic light colours'),
        keys('Cross at a zebra crossing.', 'Look right, left, then right again.', 'Walk on the footpath.', 'Wear a helmet on a two-wheeler; wear a seat belt in a car.'),
        tip('Never run across the road — walk quickly and keep looking.'),
      ],
      examples: [
        ex('The light is red. What should vehicles do?', ['Red means stop.'], 'Stop'),
        ex('Where should you cross the road?', ['There are white stripes on the road.'], 'At the zebra crossing'),
      ],
      practice: [
        bank('sig', [
          ['What does a RED traffic light mean?', 'Stop', ['Go', 'Get ready'], ['Think of danger.', 'Red = stop.'], 'Red means stop.', 'Green means go, not red.', { kind: 'shape', shape: 'circle', color: '#e53935' }],
          ['What does a GREEN traffic light mean?', 'Go (carefully)', ['Stop', 'Get ready'], ['The colour of leaves.', 'Green = go.'], 'Green means go, after looking.', 'Red is stop.', { kind: 'shape', shape: 'circle', color: '#43a047' }],
          ['What does a YELLOW traffic light mean?', 'Get ready / slow down', ['Go fast', 'Stop and sleep'], ['It comes between red and green.', 'Be ready.'], 'Yellow means get ready.', 'Yellow is a warning, not "go fast".', { kind: 'shape', shape: 'circle', color: '#fdd835' }],
          ['Where should people cross the road?', 'At the zebra crossing', ['Anywhere they like', 'Between parked buses'], ['White stripes on the road.', 'Like a zebra.'], 'Cross at the zebra crossing.', 'Crossing anywhere is dangerous.'],
          ['What should a person on a scooter wear?', 'A helmet', ['A party cap', 'Nothing special'], ['Protects the head.', 'It is the law.'], 'Always wear a helmet.', 'Only a helmet protects the head.'],
          ['Before crossing a road in India, you should look…', 'Right, left, then right again', ['Only up at the sky', 'Only behind you'], ['Vehicles come from both sides.', 'In India we drive on the left.'], 'Look right, left, then right again.', 'You must check both directions.'],
        ]),
        tapT('safe', 'Tap ALL the safe road habits.', ['walking on the footpath', 'crossing at a zebra crossing', 'wearing a seat belt', 'waiting for the green signal', 'wearing a helmet'], ['running across the road', 'playing on the road', 'crossing at a red signal for walkers', 'riding without a helmet'],
          ['Would this keep you safe from vehicles?', 'Follow signals and use footpaths.'], 'Safe habits protect you from accidents.'),
      ],
    },
  ],
};

// ================================================================== CH 12
const ch12: USpec = {
  id: 'ts4.evs.ch12', subject: 'evs', title: 'Indian History and Culture', source: src(12),
  objectives: [
    {
      id: 'ts4.evs.hist.sources', title: 'How we know about the past',
      intro: [
        h('Clues from long ago'),
        p('How do we know about kings who lived hundreds of years ago? From clues! Old buildings (monuments), writings on stone or copper (inscriptions), old coins, and things dug out of the ground (excavations).'),
        photo('📜', 'Old writings tell us about the past.'),
        photo('🪙', 'Old coins show the names and pictures of kings.'),
        vis({ kind: 'emoji', text: '🏛️ monuments · 📜 inscriptions · 🪙 coins · ⛏️ excavations' }, 'Sources of history'),
        def('Museum', 'A building where old and precious things are kept for people to see.'),
        keys('The Salar Jung Museum in Hyderabad has thousands of old treasures.', 'A tribal museum shows the life and art of tribal people.', 'Never scratch or write on monuments.'),
        tip('Visit a museum and pick one object — guess how old it is!'),
      ],
      examples: [
        ex('Writing carved on a stone pillar is called…', ['It is "inscribed" on stone.'], 'An inscription'),
        ex('Name a famous museum in Hyderabad.', ['It has a musical clock.'], 'Salar Jung Museum'),
      ],
      practice: [
        bank('src', [
          ['Writing carved on stone or copper plates is called…', 'Inscription', ['Newspaper', 'Notebook'], ['Kings ordered it.', 'Carved, not printed.'], 'It is an inscription.', 'Newspapers are modern.'],
          ['Digging the ground to find old things is called…', 'Excavation', ['Cooking', 'Painting'], ['Archaeologists dig carefully.', 'Uncover old pots and coins.'], 'It is excavation.', 'Excavation means careful digging.'],
          ['Where are old objects kept for people to see?', 'Museum', ['Bus stop', 'Market'], ['Glass cases with old things.', 'Salar Jung is one.'], 'A museum keeps old objects.', 'Markets sell things; museums display them.'],
          ['Which museum in Hyderabad has a famous musical clock?', 'Salar Jung Museum', ['Rail Museum Delhi', 'A shopping mall'], ['It is near the Musi river.', 'Named after a Nizam\'s prime minister.'], 'The Salar Jung Museum.', 'The musical clock is in Salar Jung Museum.'],
          ['What do old coins tell us?', 'Names of kings and what they used for money', ['Tomorrow\'s weather', 'Cricket scores'], ['They have pictures and writing.', 'Kings put their names.'], 'Coins show kings and trade.', 'Coins are clues about the past.'],
          ['What should we NOT do at monuments?', 'Write or scratch on walls', ['Take photographs', 'Read the information board'], ['Monuments are very old.', 'They are our heritage.'], 'Never write on monuments.', 'Scratching damages our heritage.'],
        ]),
        tapT('srcs', 'Tap ALL the things that are sources of history.', ['old coins', 'inscriptions', 'monuments', 'old pots from an excavation', 'palm-leaf manuscripts'], ['a new mobile phone', 'today\'s bus ticket', 'a plastic toy', 'this morning\'s newspaper'],
          ['Is it from long ago?', 'Sources of history are old clues.'], 'Old objects and writings tell us about the past.'),
      ],
    },
    {
      id: 'ts4.evs.hist.monuments', title: 'Famous monuments',
      intro: [
        h('Monuments of India and Telangana'),
        p('The Charminar in Hyderabad was built in 1591 by Muhammad Quli Qutb Shah. The Thousand Pillar Temple in Hanamkonda was built by the Kakatiya king Rudra Deva. The Red Fort in Delhi was built by Shah Jahan. At Sarnath, the Buddha gave his first teaching; Emperor Ashoka\'s lion pillar there gave India its national emblem.'),
        photo('🛕', 'Temples like the Thousand Pillar Temple show the art of the Kakatiyas.'),
        vis({ kind: 'emoji', text: 'Charminar · Thousand Pillar Temple · Red Fort · Sarnath' }, 'Four famous monuments'),
        keys('Charminar — Hyderabad, four minarets.', 'Thousand Pillar Temple — Hanamkonda, Kakatiyas.', 'Ramappa Temple — Mulugu, a UNESCO World Heritage Site.', 'Red Fort — Delhi; the Prime Minister hoists the flag there on Independence Day.', 'Sarnath — near Varanasi, Ashoka\'s lion capital.'),
        tip('"Char" means four and "minar" means tower — Charminar has four towers!'),
      ],
      examples: [
        ex('Where is the Charminar?', ['It is in the old city of the capital of Telangana.'], 'Hyderabad'),
        ex('Where does the Prime Minister hoist the flag on 15 August?', ['A red sandstone fort in Delhi.'], 'The Red Fort'),
      ],
      practice: [
        matchT('place', 'Match each monument to its place.', [
          ['Charminar', 'Hyderabad', '🕌'], ['Thousand Pillar Temple', 'Hanamkonda', '🛕'], ['Red Fort', 'Delhi', '🏰'], ['Sarnath', 'Near Varanasi', '🦁'],
          ['Ramappa Temple', 'Mulugu', '🌺'],
        ], ['Start with the one in your state capital.', 'Kakatiya temples are near Warangal.'], 'Recall where each monument stands.'),
        bank('mon', [
          ['Who built the Charminar?', 'Muhammad Quli Qutb Shah', ['Shah Jahan', 'Ashoka'], ['A Qutb Shahi king.', 'He also founded Hyderabad.'], 'Muhammad Quli Qutb Shah built it in 1591.', 'Shah Jahan built the Red Fort.'],
          ['The Thousand Pillar Temple was built by the…', 'Kakatiyas', ['Mughals', 'British'], ['The same kings who built tanks.', 'Capital at Warangal.'], 'The Kakatiya king Rudra Deva built it.', 'It is a Kakatiya temple.'],
          ['Who built the Red Fort in Delhi?', 'Shah Jahan', ['Muhammad Quli Qutb Shah', 'Rudra Deva'], ['He also built the Taj Mahal.', 'A Mughal emperor.'], 'Shah Jahan built the Red Fort.', 'The Qutb Shahis built the Charminar.'],
          ['What did the Buddha do at Sarnath?', 'Gave his first teaching', ['Built a fort', 'Played cricket'], ['After getting enlightenment.', 'His first sermon.'], 'The Buddha gave his first sermon at Sarnath.', 'Sarnath is linked to the Buddha\'s teaching.'],
          ['India\'s national emblem comes from the lion pillar at…', 'Sarnath', ['Charminar', 'Golconda'], ['Built by Emperor Ashoka.', 'Four lions.'], 'The Ashoka lion capital at Sarnath.', 'The lions are from Sarnath.'],
          ['How many towers (minars) does the Charminar have?', '4', ['2', '6', '1000'], ['"Char" means four.', 'Count the corners.'], 'Charminar has 4 minarets.', '"Char" means four.'],
        ]),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12];
