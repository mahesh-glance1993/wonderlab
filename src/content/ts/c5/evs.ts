// Telangana SCERT Class 5 — evs. Original teaching aligned to the official chapter list (src/content/ts/books.ts).
// One unit per textbook chapter (ids ts5.evs.ch<n>); objectives ts5.evs.<topic>.<skill>.
// Written for a 10-year-old: short sentences, Telangana examples, pictures, gentle hints.
import { tp, ex, p, h, tip, keys, photo, def, choose, matching, tapAll, type USpec, type QSpec, type TSpec, type OSpec, type ExSpec } from '../../lib/kit';
import type { Block, VisualSpec } from '../../../shared/content';
import { tsSrc } from '../books';

// ------------------------------------------------------------------ helpers
const src = (ch: number) => tsSrc(5, 'evs', ch);
const em = (t: string): VisualSpec => ({ kind: 'emoji', text: t });

/** [question, answer, wrong answers, hint, why-wrong, picture?] */
type MC = [q: string, a: string, w: string[], hint: string, why: string, pic?: string];
/** MCQ bank template (>= 5 entries). Hints: the authored hint plus a general nudge. */
const bank = (key: string, list: MC[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, a, w, hint, why, pic] = r.pick(list);
  const out: QSpec = {
    type: 'mcq', prompt: q, ...choose(r, a, w), hints: [hint, 'Read every choice before you tap. Which one matches what we learnt?'],
    mistakes: [{ when: 'wrong', explain: why }], solution: [`${a}.`, why],
  };
  if (pic) out.visual = em(pic);
  return out;
}, d);
/** tap-all template from [label, correct] (>= 3 of each kind) */
const tapT = (key: string, prompt: string, items: [string, boolean][], hints: string[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const k = r.int(2, 3);
  const yes = r.shuffle(items.filter((i) => i[1])).slice(0, k);
  const no = r.shuffle(items.filter((i) => !i[1])).slice(0, 5 - k);
  return {
    type: 'tap', prompt, ...tapAll(r, [...yes, ...no].map(([label, ok]) => ({ label, ok }))), hints,
    solution: [`Yes: ${yes.map((y) => y[0]).join(', ')}.`, `No: ${no.map((n) => n[0]).join(', ')}.`],
  };
}, d);
/** matching template from pairs (right sides distinct); 4 pairs per item, listed in the prompt so items differ */
const matchT = (key: string, prompt: string, pairs: [string, string][], hints: string[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pick = r.shuffle(pairs).slice(0, 4);
  return { type: 'match', prompt: `${prompt}: ${pick.map((x) => x[0]).join(', ')}`, ...matching(r, pick), hints, solution: pick.map(([a, b]) => `${a} → ${b}`) };
}, d);
const O = (id: string, title: string, intro: Block[], examples: ExSpec[], practice: TSpec[], prereqs?: string[]): OSpec => (prereqs ? { id, title, intro, examples, practice, prereqs } : { id, title, intro, examples, practice });
const U = (n: number, title: string, objectives: OSpec[], note?: string): USpec => (note ? { id: `ts5.evs.ch${n}`, subject: 'evs', title, source: src(n), objectives, note } : { id: `ts5.evs.ch${n}`, subject: 'evs', title, source: src(n), objectives });

// ================================================================== CH 1 ANIMALS
const ch1 = U(1, 'Animals - The Base of Our Life', [
  O('ts5.evs.animals.uses', 'How animals help us', [
    h('Animals are our partners'),
    p('Long ago people learnt to tame animals. Today, cows and buffaloes give us milk. Oxen pull ploughs and carts. Hens give eggs. Sheep give wool and meat.'),
    photo('🐑', 'In Telangana many families of shepherds rear flocks of sheep and goats.'),
    p('Sheep rearing: shepherds take the flock to graze, give them clean water and get them vaccinated. Sheep droppings make good manure for fields.'),
    h('Friends of farmers'),
    p('Earthworms loosen the soil. Owls and snakes eat rats that spoil crops. Bees carry pollen from flower to flower, so plants make fruits and seeds.'),
    photo('🦉', 'An owl can catch many rats in one night — a true friend of the farmer.'),
    keys('Milk: cow, buffalo, goat.', 'Work: ox, buffalo, horse, camel.', 'Farmers\' friends: earthworm, owl, snake, frog, bee.'),
    tip('Animals that help us also need care: food, water, shelter and a doctor (veterinarian) when sick.'),
  ], [
    ex('Why is the owl called a friend of the farmer?', ['Rats eat grain in fields and stores.', 'Owls hunt rats at night.'], 'Because it eats rats that spoil crops'),
    ex('Name two things we get from sheep.', ['Sheep\'s thick hair is cut and spun.', 'Sheep are also reared for meat.'], 'Wool and meat'),
  ], [
    bank('uses', [
      ['Which animal pulls a plough in the field?', 'Ox', ['Hen', 'Cat', 'Parrot'], 'This strong animal works in fields.', 'Oxen are strong and are used to plough fields.', '🐃'],
      ['We get wool from…', 'Sheep', ['Hen', 'Fish', 'Dog'], 'Its thick, curly hair is cut every year.', 'Sheep wool is used to make blankets.', '🐑'],
      ['Which animal gives us eggs?', 'Hen', ['Cow', 'Ox', 'Dog'], 'It is a bird kept in many homes.', 'Hens lay eggs.', '🐔'],
      ['Which small animal makes the soil soft and good for crops?', 'Earthworm', ['Mosquito', 'Rat', 'Housefly'], 'It lives under the soil.', 'Earthworms loosen and enrich the soil.'],
      ['Which insect helps plants make fruits by carrying pollen?', 'Honeybee', ['Mosquito', 'Cockroach', 'Housefly'], 'It also gives us honey.', 'Bees pollinate flowers.', '🍯'],
      ['Which animal is used to carry loads in the desert?', 'Camel', ['Cow', 'Hen', 'Goat'], 'It can walk on hot sand for days.', 'Camels are called ships of the desert.', '🐪'],
      ['A doctor for animals is called a…', 'Veterinarian', ['Dentist', 'Pilot', 'Farmer'], 'Sick animals are taken to this doctor.', 'Veterinarians treat animals.'],
    ]),
    matchT('match', 'Match each animal to how it helps us', [['Cow', 'Milk'], ['Sheep', 'Wool'], ['Hen', 'Eggs'], ['Ox', 'Ploughing'], ['Honeybee', 'Honey'], ['Owl', 'Eats rats'], ['Dog', 'Guards the house']],
      ['Think about what each animal gives or does.', 'Each animal has one best match.']),
  ]),
  O('ts5.evs.animals.biodiv', 'Biodiversity and saving animals', [
    h('Many kinds of life'),
    p('Forests, ponds and fields have many kinds of plants and animals. This variety of life is called BIODIVERSITY.'),
    def('Biodiversity', 'The many different kinds of plants and animals living in a place.'),
    p('Some animals are becoming fewer: vultures, house sparrows and tigers. Reasons: cutting forests, hunting, poisons on crops and too much plastic.'),
    photo('🐅', 'Telangana has tiger reserves at Amrabad and Kawal to protect tigers and their forests.'),
    p('Telangana\'s state animal is the spotted deer (Jinka) and the state bird is the Indian roller (Palapitta).'),
    keys('Do not hunt or harm wild animals.', 'Save forests — they are animals\' homes.', 'Use less plastic and fewer poisons.'),
    tip('Keep a bowl of water for birds in summer — it helps sparrows!'),
  ], [
    ex('Why are house sparrows becoming fewer?', ['Old houses with nooks are replaced by closed buildings.', 'Fewer insects because of poisons.'], 'They lose nesting places and food'),
    ex('What is a tiger reserve?', ['A protected forest area.', 'Hunting and cutting trees are not allowed.'], 'A protected forest where tigers live safely'),
  ], [
    bank('save', [
      ['What is biodiversity?', 'Many kinds of living things in a place', ['Only one kind of tree', 'A type of machine', 'A big building'], 'Bio = life, diversity = variety.', 'Biodiversity means variety of life.'],
      ['Which is a reason animals are becoming fewer?', 'Cutting down forests', ['Planting trees', 'Keeping water for birds', 'Saving wetlands'], 'What destroys animals\' homes?', 'When forests are cut, animals lose their homes.'],
      ['What is the state animal of Telangana?', 'Spotted deer (Jinka)', ['Lion', 'Elephant', 'Camel'], 'It has white spots.', 'The spotted deer is Telangana\'s state animal.', '🦌'],
      ['What is the state bird of Telangana?', 'Indian roller (Palapitta)', ['Peacock', 'Crow', 'Parrot'], 'It is blue and seen at Dasara.', 'The Palapitta is the state bird of Telangana.'],
      ['Which Telangana place protects tigers?', 'Amrabad Tiger Reserve', ['Charminar', 'Hussain Sagar', 'Golkonda Fort'], 'It is in the Nallamala forest.', 'Amrabad (and Kawal) are tiger reserves in Telangana.', '🐅'],
      ['How can you help birds in summer?', 'Keep a bowl of water out', ['Throw stones', 'Burn plastic', 'Cut their tree'], 'Summer is very hot and dry.', 'Water bowls save thirsty birds.', '🐦'],
    ]),
    tapT('help', 'Tap the actions that HELP save animals.', [['Planting trees', true], ['Keeping water for birds', true], ['Using cloth bags, not plastic', true], ['Not hunting', true], ['Cutting forests', false], ['Throwing plastic in lakes', false], ['Using too many poisons on crops', false], ['Catching birds in cages', false]],
      ['Would the animal be safer or in danger?', 'Think about their home, food and water.']),
  ]),
]);

// ================================================================== CH 2 AGRICULTURE
const ch2 = U(2, 'Agriculture - Crops', [
  O('ts5.evs.agri.tools', 'Farm tools, seeds and safe farming', [
    h('From seed to harvest'),
    p('Farmers prepare the soil with a plough, sow good seeds, give water and manure, remove weeds and protect crops. Then they harvest with a sickle or a machine.'),
    photo('🚜', 'A tractor can plough a big field quickly.'),
    p('Old tools: plough, sickle, spade, hoe. New machines: tractor, harvester, seed drill, sprinkler and drip pipes.'),
    h('Pesticides — use with care'),
    p('Pesticides kill pests but also harm soil, water, birds and people. Neem leaf spray and cow-dung manure are natural and safer. Using natural methods again and again is called sustainable farming.'),
    keys('Plough → sow → water → weed → protect → harvest.', 'Good seeds give good crops.', 'Too many chemicals harm everyone.'),
    tip('Always wash fruits and vegetables before eating.'),
  ], [
    ex('Which tool is used to cut ripe crops by hand?', ['It has a curved blade.'], 'Sickle'),
    ex('Why should farmers use less pesticide?', ['It mixes into soil and water.', 'It harms birds, bees and people.'], 'To keep soil, water, animals and people healthy'),
  ], [
    bank('tools', [
      ['Which tool is used to dig and turn the soil before sowing?', 'Plough', ['Sickle', 'Bucket', 'Umbrella'], 'Oxen or a tractor pull it.', 'A plough turns and loosens the soil.', '🚜'],
      ['Which method saves water by dropping it near each plant\'s roots?', 'Drip irrigation', ['Flooding the field', 'Leaving the tap open', 'No water at all'], 'Water comes drop by drop.', 'Drip irrigation saves water.', '💧'],
      ['Which is a natural, safer pest control?', 'Neem leaf spray', ['Strong chemical poison', 'Burning the field', 'Plastic covers on soil'], 'It comes from a tree.', 'Neem spray is natural and less harmful.', '🌿'],
      ['Why do farmers choose good seeds?', 'To get a healthy, big crop', ['To make the field look pretty', 'To feed rats', 'To use more water'], 'Strong seeds grow strong plants.', 'Good seeds give better crops.', '🌱'],
      ['Removing unwanted plants from a field is called…', 'Weeding', ['Harvesting', 'Sowing', 'Ploughing'], 'Weeds steal water and food from crops.', 'Weeding removes unwanted plants.'],
      ['Cutting and collecting the ripe crop is called…', 'Harvesting', ['Sowing', 'Weeding', 'Ploughing'], 'It happens at the end.', 'Harvesting collects the ripe crop.', '🌾'],
    ]),
    tapT('order', 'Tap the things that are GOOD for the soil.', [['Cow-dung manure', true], ['Earthworms', true], ['Compost from leaves', true], ['Changing crops each season', true], ['Too much chemical fertiliser', false], ['Plastic waste', false], ['Burning crop stubble', false]],
      ['Does it make the soil richer or spoil it?', 'Natural things usually help the soil.']),
  ]),
  O('ts5.evs.agri.crops', 'Crops of Telangana', [
    h('What grows where?'),
    p('Telangana farmers grow paddy (rice), cotton, maize, red gram (kandi), jowar, groundnut, chillies and turmeric.'),
    photo('🌾', 'Paddy needs a lot of water. It grows well near rivers, tanks and canals.'),
    p('Crops sown in the rainy season (June–July) are KHARIF crops: paddy, cotton, maize. Crops sown in winter are RABI crops: wheat, Bengal gram (chickpea), groundnut in some areas.'),
    p('Nizamabad is famous for turmeric. Khammam and Warangal grow lots of chillies. Cotton grows in black soil.'),
    keys('Kharif: rainy season.', 'Rabi: winter season.', 'Paddy needs much water; jowar needs little.'),
    tip('Rice, dal and jowar roti on your plate all come from farmers\' hard work!'),
  ], [
    ex('Which crop needs a lot of water: paddy or jowar?', ['Paddy fields are kept full of water.'], 'Paddy'),
    ex('Is cotton a kharif or rabi crop?', ['It is sown when the rains begin.'], 'Kharif'),
  ], [
    bank('crops', [
      ['Which crop needs fields full of water?', 'Paddy', ['Jowar', 'Cotton', 'Chillies'], 'Rice comes from this crop.', 'Paddy grows in standing water.', '🌾'],
      ['Which district of Telangana is famous for turmeric?', 'Nizamabad', ['Hyderabad', 'Medchal', 'Mulugu'], 'It is in the north-west of Telangana.', 'Nizamabad is famous for turmeric.'],
      ['Crops sown in the rainy season are called…', 'Kharif crops', ['Rabi crops', 'Desert crops', 'Snow crops'], 'They need monsoon rain.', 'Rainy-season crops are kharif crops.', '🌧️'],
      ['Crops sown in winter are called…', 'Rabi crops', ['Kharif crops', 'Summer flowers', 'Weeds'], 'They grow in the cool season.', 'Winter crops are rabi crops.'],
      ['Which crop gives us fibre to make clothes?', 'Cotton', ['Paddy', 'Maize', 'Turmeric'], 'Its fluffy white balls are spun into thread.', 'Cotton fibre is used for cloth.'],
      ['Which crop gives us spicy red powder?', 'Chillies', ['Paddy', 'Cotton', 'Jowar'], 'It makes curry hot.', 'Dried chillies are ground into chilli powder.', '🌶️'],
      ['Corn is another name for…', 'Maize', ['Paddy', 'Cotton', 'Red gram'], 'You eat it roasted on the cob.', 'Maize is also called corn.', '🌽'],
    ]),
    matchT('use', 'Match the crop to what we get from it', [['Paddy', 'Rice'], ['Cotton', 'Cloth'], ['Red gram', 'Dal'], ['Turmeric', 'Yellow spice'], ['Groundnut', 'Oil'], ['Jowar', 'Roti'], ['Sugarcane', 'Jaggery']],
      ['Think of your kitchen.', 'What is made from each crop?']),
  ], ['ts5.evs.agri.tools']),
]);

// ================================================================== CH 3 TREES
const ch3 = U(3, "Let's Grow Trees", [
  O('ts5.evs.trees.needs', 'What plants need to grow', [
    h('A plant\'s needs'),
    p('Plants need sunlight, water, air and good soil. A plant kept in a dark cupboard turns pale and weak. A plant with no water wilts.'),
    photo('🌱', 'A sapling needs sunlight, water and soil to grow into a tree.'),
    p('Leaves use sunlight, air and water to make food for the plant. Roots hold the plant and drink water from the soil.'),
    keys('Sunlight, water, air, soil.', 'Leaves make food.', 'Roots take in water.'),
    tip('Do not over-water: too much water can rot the roots.'),
  ], [
    ex('Two plants: one near a window, one in a dark room. Which grows better?', ['Plants need sunlight to make food.'], 'The one near the window'),
    ex('Which part of a plant takes in water?', ['It is under the soil.'], 'The roots'),
  ], [
    bank('needs', [
      ['Which part of the plant makes food?', 'Leaves', ['Roots', 'Flowers', 'Bark'], 'This part is green and catches sunlight.', 'Green leaves make the plant\'s food.', '🍃'],
      ['Which part takes in water from the soil?', 'Roots', ['Leaves', 'Fruits', 'Flowers'], 'It is under the ground.', 'Roots take in water.'],
      ['A plant kept in the dark for many days will…', 'Become pale and weak', ['Grow faster', 'Make more fruits', 'Turn blue'], 'Plants need light to make food.', 'Without light the plant cannot make food.'],
      ['Which of these is NOT needed by a plant to grow?', 'Plastic', ['Sunlight', 'Water', 'Air'], 'Three of these are natural needs.', 'Plants do not need plastic.'],
      ['A plant without water for many days will…', 'Wilt and dry up', ['Grow taller', 'Make flowers', 'Turn into a tree'], 'Think of a dry pot in summer.', 'Without water, plants wilt.', '💧'],
    ]),
    tapT('need', 'Tap the things a plant needs to grow.', [['Sunlight', true], ['Water', true], ['Air', true], ['Soil', true], ['Plastic cover', false], ['Darkness all day', false], ['Salt water', false], ['Paint', false]],
      ['Think of what we give a sapling.', 'Natural things from the sun, sky and earth.']),
  ]),
  O('ts5.evs.trees.plant', 'Planting and protecting trees; Telangana green drive', [
    h('Let us plant a tree'),
    p('Dig a pit, put in soil and manure, place the sapling, press the soil and water it. Put a tree guard around it so goats do not eat it.'),
    p('Plant trees along roads, in school grounds, near tanks and in backyards. A backyard garden can grow tomatoes, brinjal, greens and curry leaves.'),
    photo('🌳', 'Trees give shade, fruit, wood and clean air, and are homes for birds.'),
    p('Telangana runs a big tree-planting drive called Telanganaku Haritha Haram (a green garland for Telangana). The state tree is the Jammi tree.'),
    keys('Pit → manure → sapling → water → tree guard.', 'Trees give shade, oxygen, fruit and homes for birds.', 'State tree: Jammi.'),
    tip('Plant a tree on your birthday and look after it!'),
  ], [
    ex('Why do we put a tree guard around a sapling?', ['Goats and cows may eat it.', 'Children may step on it.'], 'To protect it until it grows strong'),
    ex('Name two vegetables you can grow in a backyard.', ['They grow easily in small spaces.'], 'Tomato and brinjal (also greens, chillies)'),
  ], [
    bank('plant', [
      ['What is the name of Telangana\'s tree-planting programme?', 'Haritha Haram', ['Mission Bhagiratha', 'Swachh Bharat', 'Rythu Bazaar'], 'Haritha means green.', 'Telanganaku Haritha Haram is the green drive.', '🌳'],
      ['What is the state tree of Telangana?', 'Jammi tree', ['Banyan', 'Coconut', 'Mango'], 'Its leaves are exchanged at Dasara.', 'The Jammi tree is Telangana\'s state tree.'],
      ['Why do we put a tree guard?', 'To stop animals eating the sapling', ['To make it look tall', 'To stop rain', 'To hide the tree'], 'Goats love young leaves.', 'A tree guard protects young saplings.'],
      ['What should we do right after planting a sapling?', 'Water it', ['Pull it out', 'Cover it in plastic', 'Paint it'], 'The roots need to settle in.', 'Watering helps the sapling start growing.', '💧'],
      ['Which of these do trees give us?', 'Shade and fresh air', ['Plastic', 'Smoke', 'Noise'], 'Stand under a tree on a hot day.', 'Trees give shade and oxygen.'],
      ['Which is a good place to plant trees?', 'Along roads and in school grounds', ['In the middle of a road', 'Inside a classroom cupboard', 'On a railway track'], 'Where can trees grow safely?', 'Roadsides and school grounds are good places.'],
    ]),
    tapT('gifts', 'Tap the things trees give us.', [['Shade', true], ['Fruits', true], ['Oxygen', true], ['Homes for birds', true], ['Wood', true], ['Plastic', false], ['Smoke', false], ['Noise', false]],
      ['Think of a big neem or mango tree.', 'What do people and birds get from it?']),
  ], ['ts5.evs.trees.needs']),
]);

// ================================================================== CH 4 NUTRITIOUS FOOD
const ch4 = U(4, 'Nutritious Food', [
  O('ts5.evs.food.groups', 'Energy, body-building and protective foods', [
    h('Three jobs of food'),
    p('ENERGY-GIVING foods help us run and play: rice, jowar, ragi, wheat, potatoes, sugar, oil and ghee.'),
    p('BODY-BUILDING foods help us grow and repair the body: dal, eggs, milk, meat, fish and groundnuts. They are rich in proteins.'),
    p('PROTECTIVE foods keep us from falling sick: fruits and vegetables like guava, oranges, carrots, spinach and other greens. They have vitamins and minerals.'),
    photo('🥕', 'Carrots help our eyes. Green leafy vegetables give iron.'),
    keys('Energy: cereals, oil, sugar.', 'Body-building: dal, egg, milk, fish.', 'Protective: fruits and vegetables.'),
    tip('Drink plenty of clean water too — it is part of a healthy diet.'),
  ], [
    ex('Is dal an energy-giving or body-building food?', ['Dal is rich in protein.'], 'Body-building'),
    ex('Which food group does guava belong to?', ['Fruits have vitamins.'], 'Protective'),
  ], [
    bank('group', [
      ['Rice and jowar roti are mainly…', 'Energy-giving foods', ['Body-building foods', 'Protective foods'], 'They give us fuel to run and play.', 'Cereals give energy.', '🌾'],
      ['Dal, eggs and milk are mainly…', 'Body-building foods', ['Energy-giving foods', 'Junk foods'], 'They help us grow strong.', 'They are rich in proteins.', '🥚'],
      ['Fruits and green vegetables are…', 'Protective foods', ['Energy-giving foods', 'Junk foods'], 'They help us fight sickness.', 'They give vitamins and minerals.', '🍊'],
      ['Which food helps build muscles?', 'Groundnuts', ['Sugar', 'Chips', 'Soft drinks'], 'It is rich in protein.', 'Groundnuts give protein.', '🥜'],
      ['Which food gives quick energy?', 'Jaggery', ['Spinach', 'Water', 'Salt'], 'It is sweet.', 'Sweet foods give quick energy.'],
      ['Which vitamin-rich fruit grows in many Telangana backyards?', 'Guava', ['Chips', 'Biscuit', 'Cola'], 'It is green outside, white or pink inside.', 'Guava is full of vitamin C.'],
    ]),
    matchT('match', 'Match the food to its group', [['Rice', 'Energy-giving'], ['Egg', 'Body-building'], ['Spinach', 'Protective'], ['Ghee', 'Energy-giving (fat)'], ['Milk', 'Body-building (protein)'], ['Orange', 'Protective (vitamins)']],
      ['Energy = fuel, body-building = growth, protective = fight sickness.']),
  ]),
  O('ts5.evs.food.balanced', 'Balanced diet and junk food', [
    h('A balanced plate'),
    p('A BALANCED DIET has all three kinds of food in the right amounts, plus water. For example: rice, dal, a vegetable curry, curd and a fruit.'),
    photo('🍎', 'Add one fruit every day to your plate.'),
    h('Junk food'),
    p('Chips, cola, deep-fried snacks and too many sweets are JUNK FOOD. They have lots of salt, sugar or oil but very little goodness. Eating them often can make us unhealthy and cause tooth decay.'),
    keys('Balanced diet = all food groups + water.', 'Junk food: too much salt, sugar, oil.', 'Eat fresh home-cooked food.'),
    tip('Instead of chips, snack on roasted chana, peanuts or fruit.'),
  ], [
    ex('Is "rice, dal, carrot curry, curd and a banana" a balanced meal?', ['Energy: rice', 'Body-building: dal, curd', 'Protective: carrot, banana'], 'Yes, it is balanced'),
    ex('Why is cola bad if we drink it every day?', ['It has a lot of sugar.', 'It has no vitamins or protein.'], 'Too much sugar, harms teeth and health'),
  ], [
    bank('balance', [
      ['Which meal is most balanced?', 'Rice, dal, vegetables, curd and a fruit', ['Only chips', 'Only rice', 'Cola and biscuits'], 'It should have all food groups.', 'A balanced meal has all three food groups.'],
      ['Which of these is junk food?', 'Chips', ['Guava', 'Dal', 'Curd'], 'It is salty and oily from a packet.', 'Chips are junk food.'],
      ['Eating too many sweets can cause…', 'Tooth decay', ['Stronger teeth', 'Better eyesight', 'Taller height'], 'Sugar sticks to teeth.', 'Too much sugar damages teeth.', '🦷'],
      ['A healthy snack is…', 'Roasted peanuts', ['Cola', 'Deep-fried chips', 'Candy'], 'Which one has protein and is not oily?', 'Roasted peanuts are a healthy snack.', '🥜'],
      ['A balanced diet also needs plenty of…', 'Clean water', ['Soft drinks', 'Salt', 'Sugar'], 'Our body is mostly this.', 'Clean water is part of a healthy diet.', '💧'],
    ]),
    tapT('junk', 'Tap the JUNK foods.', [['Chips', true], ['Cola', true], ['Candy', true], ['Deep-fried snacks every day', true], ['Banana', false], ['Dal', false], ['Ragi java', false], ['Curd', false]],
      ['Too much salt, sugar or oil?', 'Fresh home food is healthy.']),
  ], ['ts5.evs.food.groups']),
]);

// ================================================================== CH 5 SENSE ORGANS
const ch5 = U(5, 'Our Body Parts - Sense Organs', [
  O('ts5.evs.senses.five', 'The five sense organs', [
    h('Five windows to the world'),
    p('We have five sense organs. EYES see. EARS hear. NOSE smells. TONGUE tastes. SKIN feels hot, cold, rough, smooth and pain.'),
    photo('👁️', 'Eyes help us see colours and shapes.'),
    photo('👂', 'Ears help us hear sounds — and also help us keep our balance.'),
    p('Care: wash your eyes with clean water, do not put sticks in your ears, do not read in dim light, and do not look straight at the sun.'),
    keys('Eyes – see. Ears – hear. Nose – smell. Tongue – taste. Skin – touch.', 'Protect them every day.'),
    tip('People who cannot see read with their fingers using Braille dots.'),
  ], [
    ex('Which sense organ tells you the jasmine flower smells nice?', ['Smells enter through the nose.'], 'Nose'),
    ex('Which sense organ tells you the tea is hot?', ['Heat is felt by touch.'], 'Skin'),
  ], [
    matchT('match', 'Match the sense organ to its job', [['Eyes', 'See'], ['Ears', 'Hear'], ['Nose', 'Smell'], ['Tongue', 'Taste'], ['Skin', 'Feel (touch)']],
      ['What does each organ help you do?', 'There are five senses.']),
    bank('senses', [
      ['Which sense organ helps you hear the school bell?', 'Ears', ['Eyes', 'Nose', 'Tongue'], 'Sound goes in here.', 'We hear with our ears.', '🔔'],
      ['Which sense organ tells you a mango is sweet?', 'Tongue', ['Ears', 'Eyes', 'Skin'], 'You find out by eating it.', 'We taste with our tongue.', '🥭'],
      ['Which sense organ tells you a rose smells nice?', 'Nose', ['Ears', 'Tongue', 'Eyes'], 'You sniff it.', 'We smell with our nose.', '👃'],
      ['Which sense organ helps you see a rainbow?', 'Eyes', ['Ears', 'Nose', 'Tongue'], 'Colours are seen.', 'We see with our eyes.', '🌈'],
      ['Which sense organ feels the softness of cotton?', 'Skin', ['Ears', 'Nose', 'Eyes'], 'You touch it.', 'Touch is felt by the skin.'],
      ['People who cannot see read using…', 'Braille dots felt by fingers', ['Very loud sounds', 'Smell', 'Coloured lights'], 'They use touch.', 'Braille is read by touch.'],
    ]),
  ]),
  O('ts5.evs.senses.teeth', 'Our teeth and keeping them healthy', [
    h('Teeth help us eat'),
    p('Children have 20 milk teeth. They fall out and grown-ups have 32 permanent teeth.'),
    p('Front teeth (incisors) CUT food. Pointed teeth (canines) TEAR food. Back teeth (molars) GRIND and chew food.'),
    photo('🦷', 'Brush twice a day to keep your teeth strong and white.'),
    keys('Milk teeth: 20. Permanent teeth: 32.', 'Incisors cut, canines tear, molars grind.', 'Brush twice, rinse after meals.'),
    tip('Rinse your mouth with water after eating sweets.'),
  ], [
    ex('Which teeth do you use to bite a guava?', ['Front teeth bite and cut.'], 'Incisors'),
    ex('How many permanent teeth does an adult have?', ['Count both jaws.'], '32'),
  ], [
    bank('teeth', [
      ['How many milk teeth does a child have?', '20', ['32', '10', '28'], 'Fewer than an adult.', 'Children have 20 milk teeth.', '🦷'],
      ['How many permanent teeth does an adult have?', '32', ['20', '12', '40'], '16 on top and 16 below.', 'Adults have 32 teeth.', '🦷'],
      ['Which teeth grind and chew food?', 'Molars', ['Incisors', 'Canines'], 'They are at the back and flat.', 'Molars grind food.'],
      ['Which teeth cut food?', 'Incisors', ['Molars', 'Canines'], 'They are at the front.', 'Incisors cut food.'],
      ['Which teeth tear food?', 'Canines', ['Incisors', 'Molars'], 'They are pointed, like a dog\'s.', 'Canines tear food.'],
      ['How often should we brush?', 'Twice a day', ['Once a week', 'Never', 'Once a month'], 'Morning and night.', 'Brush twice daily.'],
    ]),
    tapT('care', 'Tap the GOOD habits for healthy teeth.', [['Brush twice a day', true], ['Rinse after eating', true], ['Eat crunchy fruits and vegetables', true], ['Visit the dentist', true], ['Eat sweets all day', false], ['Open bottles with teeth', false], ['Never brush at night', false]],
      ['Would this keep teeth clean and strong?']),
  ]),
]);

// ================================================================== CH 6 INTERNAL ORGANS
const ch6 = U(6, 'Our Body - Its Internal Organ System', [
  O('ts5.evs.body.organs', 'Breathing, heart and blood', [
    h('Inside our body'),
    p('When we breathe in, air goes through the nose and windpipe into the LUNGS. Our body takes oxygen from it. When we breathe out, carbon dioxide goes out. This is the RESPIRATORY SYSTEM.'),
    p('The HEART is a pump about the size of your fist. It pushes blood through tubes called blood vessels to every part of the body. This is the CIRCULATORY SYSTEM.'),
    photo('💪', 'After running, you breathe faster and your heart beats faster to give your muscles more oxygen.'),
    keys('Lungs: breathing.', 'Heart: pumps blood.', 'Blood carries oxygen and food to all parts.'),
    tip('Put your hand on your chest after jumping 20 times — feel your heart beat faster!'),
  ], [
    ex('Which organ pumps blood?', ['It beats all the time, even when we sleep.'], 'Heart'),
    ex('Where does the air we breathe in go?', ['Nose → windpipe → …'], 'Into the lungs'),
  ], [
    bank('organs', [
      ['Which organ pumps blood around the body?', 'Heart', ['Lungs', 'Stomach', 'Brain'], 'It beats non-stop.', 'The heart pumps blood.'],
      ['Which organs help us breathe?', 'Lungs', ['Kidneys', 'Heart', 'Stomach'], 'They fill with air.', 'The lungs help us breathe.'],
      ['What gas does our body take from the air?', 'Oxygen', ['Smoke', 'Carbon dioxide', 'Steam'], 'We cannot live without it.', 'We need oxygen.'],
      ['What gas do we breathe out?', 'Carbon dioxide', ['Oxygen', 'Smoke', 'Perfume'], 'Plants use this gas.', 'We breathe out carbon dioxide.', '💨'],
      ['After running, our heart beats…', 'Faster', ['Slower', 'Stops', 'The same'], 'Muscles need more oxygen.', 'The heart beats faster to send more blood.'],
      ['Tubes that carry blood are called…', 'Blood vessels', ['Bones', 'Muscles', 'Nerves'], 'They are everywhere in the body.', 'Blood flows in blood vessels.'],
    ]),
    matchT('match', 'Match the organ to its job', [['Heart', 'Pumps blood'], ['Lungs', 'Breathing'], ['Stomach', 'Digests food'], ['Brain', 'Controls the body'], ['Kidneys', 'Clean the blood'], ['Bones', 'Give shape and support']],
      ['Think of what each organ does all day.']),
  ]),
  O('ts5.evs.body.systems', 'Bones, digestion, excretion and nerves', [
    h('Teams that work together'),
    p('SKELETAL SYSTEM: about 206 bones in an adult give our body shape and protect soft parts. The skull protects the brain; ribs protect the heart and lungs.'),
    p('DIGESTIVE SYSTEM: food goes from mouth → food pipe → stomach → small intestine → large intestine. Food is broken down so the body can use it.'),
    p('EXCRETORY SYSTEM: kidneys clean the blood and make urine. Skin removes some waste as sweat.'),
    p('NERVOUS SYSTEM: the brain, spinal cord and nerves carry messages. They tell your hand to move when you touch something hot.'),
    photo('🤔', 'The brain is the control room of the body.'),
    keys('Bones: shape and protection.', 'Digestion: mouth to intestines.', 'Kidneys: clean blood.', 'Brain: control.'),
    tip('Chew your food well — digestion starts in the mouth!'),
  ], [
    ex('Which bones protect the heart and lungs?', ['They form a cage in the chest.'], 'The ribs'),
    ex('Where does digestion start?', ['Teeth and saliva begin breaking food.'], 'In the mouth'),
  ], [
    bank('systems', [
      ['About how many bones are in an adult\'s body?', '206', ['20', '32', '1000'], 'More than 200.', 'An adult has about 206 bones.'],
      ['Which bone protects the brain?', 'Skull', ['Ribs', 'Backbone', 'Knee'], 'It is the bone of the head.', 'The skull protects the brain.'],
      ['Which organs clean the blood and make urine?', 'Kidneys', ['Lungs', 'Heart', 'Eyes'], 'They are bean-shaped.', 'Kidneys clean the blood.'],
      ['Where does digestion start?', 'Mouth', ['Stomach', 'Feet', 'Lungs'], 'Where you chew.', 'Digestion starts in the mouth.', '👄'],
      ['Which is the control room of the body?', 'Brain', ['Stomach', 'Heart', 'Hand'], 'It thinks and sends messages.', 'The brain controls the body.'],
      ['Sweat removes waste through the…', 'Skin', ['Teeth', 'Hair', 'Nails'], 'It happens on a hot day.', 'Skin removes some waste as sweat.'],
    ]),
    tapT('digest', 'Tap the parts that food passes through when we digest it.', [['Mouth', true], ['Food pipe', true], ['Stomach', true], ['Small intestine', true], ['Lungs', false], ['Heart', false], ['Skull', false], ['Kidneys', false]],
      ['Follow the path of a bite of food.', 'Breathing and blood organs are not on this path.']),
  ], ['ts5.evs.body.organs']),
]);

// ================================================================== CH 7 FORESTS AND TRIBALS
const ch7 = U(7, 'Forests - Tribals', [
  O('ts5.evs.tribal.life', 'Life of tribal people and their festivals', [
    h('People of the forest'),
    p('Tribal people like the Gonds, Koyas, Kolams, Lambadas and Chenchus have lived in and near forests for a very long time. They know the forest well — its plants, medicines and animals.'),
    p('Many collect forest produce like honey, tamarind, gum, tendu leaves and mahua flowers. They also farm small fields and keep cattle.'),
    photo('🥁', 'Tribal songs and dances with drums are part of every celebration.'),
    p('NAGOBA JATARA is a big festival of the Gonds (Mesram clan) at Keslapur in Adilabad district. They worship the serpent god Nagoba. SAMMAKKA–SARALAMMA JATARA at Medaram is one of the largest tribal fairs in the world.'),
    p('The CHENCHUS live in the Nallamala forests. They are expert honey collectors. The BONDA tribe lives in the hills of Odisha.'),
    keys('Tribals live close to nature.', 'Nagoba jatara: Gonds, Keslapur (Adilabad).', 'Chenchus: Nallamala forests, honey.', 'Medaram: Sammakka–Saralamma.'),
    tip('Respect every community\'s way of life and festivals.'),
  ], [
    ex('Which tribe celebrates the Nagoba jatara?', ['It is held at Keslapur in Adilabad district.'], 'The Gonds'),
    ex('Where do the Chenchus live?', ['A big forest in southern Telangana.'], 'In the Nallamala forests'),
  ], [
    bank('tribes', [
      ['The Nagoba jatara is celebrated by the…', 'Gonds', ['Chenchus', 'Bondas', 'Lambadas only'], 'It is in Adilabad district.', 'Nagoba is worshipped by the Gonds (Mesram clan).', '🥁'],
      ['Where is the Nagoba jatara held?', 'Keslapur, Adilabad', ['Charminar, Hyderabad', 'Basara, Nirmal', 'Bhadrachalam'], 'A village in the north of Telangana.', 'It is held at Keslapur in Adilabad district.'],
      ['The Chenchus are famous for collecting…', 'Honey', ['Coal', 'Gold', 'Salt'], 'Bees make it.', 'Chenchus are expert honey collectors.', '🍯'],
      ['The Chenchus live in the…', 'Nallamala forests', ['Thar desert', 'Himalayan snow', 'Sea coast'], 'A big forest in southern Telangana.', 'Chenchus live in Nallamala.', '🌳'],
      ['The Sammakka–Saralamma jatara is held at…', 'Medaram', ['Keslapur', 'Golkonda', 'Warangal Fort'], 'It is in Mulugu district.', 'The jatara is held at Medaram.'],
      ['The Bonda tribe lives in the hills of…', 'Odisha', ['Telangana\'s Hyderabad city', 'Goa', 'Kerala beaches'], 'A state to the north-east of Telangana.', 'The Bondas live in the hills of Odisha.'],
    ]),
    tapT('produce', 'Tap the things tribal people collect from forests.', [['Honey', true], ['Tamarind', true], ['Tendu leaves', true], ['Mahua flowers', true], ['Gum', true], ['Plastic bottles', false], ['Cement', false], ['Petrol', false]],
      ['What grows or is made naturally in a forest?']),
  ]),
  O('ts5.evs.tribal.forest', 'Forests are disappearing', [
    h('Why forests matter'),
    p('Forests give us wood, fruits, medicines, rain and clean air. They are homes for animals and for tribal people.'),
    p('Forests are shrinking because of cutting trees for wood and land, forest fires, mining and building roads and dams.'),
    photo('🌳', 'Kawal and Amrabad forests in Telangana are protected.'),
    p('When forests go, animals lose homes, rains become less, soil washes away and tribal people lose their livelihood.'),
    keys('Forests bring rain and clean air.', 'Causes of loss: cutting, fires, mining.', 'Save forests: plant trees, stop fires, use less paper.'),
    tip('Never light a fire in a forest; one spark can burn a whole hill.'),
  ], [
    ex('Name two reasons forests are disappearing.', ['People cut trees.', 'Fires spread in summer.'], 'Cutting trees and forest fires'),
    ex('What happens to soil when trees are cut on a hill?', ['Roots no longer hold the soil.', 'Rain washes it away.'], 'The soil gets washed away'),
  ], [
    bank('loss', [
      ['Which is a cause of forest loss?', 'Cutting trees', ['Planting saplings', 'Protecting animals', 'Saving water'], 'What takes trees away?', 'Cutting trees destroys forests.'],
      ['When forests are cut, wild animals…', 'Lose their homes', ['Get bigger homes', 'Become happier', 'Learn to fly'], 'Where do tigers live?', 'Animals lose their homes.', '🐅'],
      ['Tree roots on a hill help to…', 'Hold the soil', ['Make the soil fly away', 'Stop sunlight', 'Make noise'], 'Without roots, rain washes soil.', 'Roots hold soil in place.'],
      ['Which helps save forests?', 'Using less paper and planting trees', ['Starting fires', 'Cutting more trees', 'Throwing garbage'], 'Paper comes from trees.', 'Saving paper saves trees.'],
      ['Forests help bring…', 'Rain', ['Earthquakes', 'Traffic', 'Smoke'], 'Trees release water vapour.', 'Forests help bring rain.', '🌧️'],
    ]),
    tapT('harm', 'Tap the things that HARM forests.', [['Forest fires', true], ['Cutting trees', true], ['Mining', true], ['Throwing plastic', true], ['Planting trees', false], ['Protecting wildlife', false], ['Using less paper', false]],
      ['Does it destroy or protect trees and animals?']),
  ], ['ts5.evs.tribal.life']),
]);

// ================================================================== CH 8 RIVERS
const ch8 = U(8, 'Rivers - Means of Livelihood', [
  O('ts5.evs.river.godavari', 'River Godavari and life along rivers', [
    h('The Godavari'),
    p('The Godavari starts at Trimbakeshwar near Nashik in Maharashtra. It enters Telangana in Nizamabad district and flows past Basara, Kaleshwaram and Bhadrachalam. It is the second longest river in India.'),
    photo('🏞️', 'Rivers give water for drinking, farming and fishing.'),
    p('Fishermen catch fish in rivers and tanks. Boats carry people and goods across rivers. Temples, towns and farms grow along riverbanks.'),
    p('Dams store river water. Sriram Sagar project is on the Godavari. Nagarjuna Sagar is on the Krishna. Canals from dams take water to fields and also make electricity.'),
    p('Long ago, great civilisations grew beside rivers, like the Indus Valley civilisation.'),
    keys('Godavari: starts in Maharashtra, flows through Telangana.', 'Rivers give water, fish, transport and fertile soil.', 'Dams store water for farms and power.'),
    tip('Telangana\'s other big river is the Krishna.'),
  ], [
    ex('Name a dam built on the Godavari in Telangana.', ['It is in the north, near Nizamabad.'], 'Sriram Sagar'),
    ex('Why did people long ago live near rivers?', ['Water for drinking and farming.', 'Fertile soil.'], 'For water and good farmland'),
  ], [
    bank('river', [
      ['Where does the Godavari start?', 'Near Nashik, Maharashtra', ['In Hyderabad', 'In the Bay of Bengal', 'In Kerala'], 'It is to the west of Telangana.', 'The Godavari starts at Trimbakeshwar near Nashik.'],
      ['Which temple town on the Godavari is famous for Lord Rama?', 'Bhadrachalam', ['Keslapur', 'Medaram', 'Golkonda'], 'It is in Bhadradri Kothagudem district.', 'Bhadrachalam is on the Godavari.', '🛕'],
      ['Nagarjuna Sagar dam is built on the river…', 'Krishna', ['Godavari', 'Musi', 'Ganga'], 'It is in the south of Telangana.', 'Nagarjuna Sagar is on the Krishna.'],
      ['Which is NOT a use of a river?', 'Throwing factory waste', ['Drinking water', 'Fishing', 'Watering crops'], 'Which one harms the river?', 'Dumping waste is not a use — it is pollution.'],
      ['People who catch fish for a living are…', 'Fishermen', ['Potters', 'Weavers', 'Tailors'], 'They use nets and boats.', 'Fishermen catch fish.', '🐟'],
      ['Why are dams built?', 'To store water for farms and electricity', ['To stop all rain', 'To make rivers dry', 'To build roads'], 'Water is saved for later.', 'Dams store water and make electricity.'],
    ]),
    tapT('uses', 'Tap the ways rivers help people.', [['Drinking water', true], ['Fishing', true], ['Water for crops', true], ['Boats and transport', true], ['Electricity from dams', true], ['Dumping garbage', false], ['Washing chemicals into them', false], ['Filling them with plastic', false]],
      ['Does it help people or harm the river?']),
  ]),
  O('ts5.evs.river.problems', 'River pollution, floods and droughts', [
    h('When rivers are in trouble'),
    p('Factories sometimes pour dirty water and chemicals into rivers. Towns send sewage. Plastic is thrown in. This is WATER POLLUTION. Fish die and people fall sick.'),
    p('The Musi river in Hyderabad has become dirty because of sewage and waste.'),
    photo('🌧️', 'Very heavy rain can make rivers overflow.'),
    p('A FLOOD happens when too much rain makes rivers overflow and water enters homes and fields. A DROUGHT happens when there is no rain for a long time, and wells and tanks dry up.'),
    keys('Pollution: factory waste, sewage, plastic.', 'Flood: too much water.', 'Drought: too little rain.', 'Save water, keep rivers clean.'),
    tip('Immerse only clay idols during festivals to keep lakes clean.'),
  ], [
    ex('What is a drought?', ['No rain for many months.', 'Wells and tanks dry up.'], 'A long time without enough rain'),
    ex('How do factories pollute rivers?', ['They release dirty water and chemicals.'], 'By pouring waste water and chemicals'),
  ], [
    bank('prob', [
      ['When too much rain makes a river overflow, it is a…', 'Flood', ['Drought', 'Earthquake', 'Rainbow'], 'There is too much water.', 'Overflowing rivers cause floods.', '🌧️'],
      ['When there is no rain for a long time, it is a…', 'Drought', ['Flood', 'Storm', 'Tide'], 'Wells dry up.', 'A long dry spell is a drought.', '☀️'],
      ['Which causes river pollution?', 'Factory waste water', ['Planting trees on banks', 'Clean rain', 'Fish swimming'], 'Something dirty enters the river.', 'Factory waste pollutes rivers.'],
      ['Which idols are best for immersion in lakes?', 'Clay idols with natural colours', ['Plaster idols with chemical paint', 'Plastic idols', 'Metal idols'], 'It should melt back into the earth.', 'Clay idols do not pollute water.'],
      ['Polluted river water can make people…', 'Fall sick', ['Stronger', 'Taller', 'Faster'], 'Dirty water carries germs.', 'Dirty water spreads disease.'],
    ]),
    tapT('clean', 'Tap the actions that keep rivers clean.', [['Using clay idols', true], ['Not throwing plastic in water', true], ['Treating factory waste before release', true], ['Planting trees along the banks', true], ['Washing chemicals into the river', false], ['Dumping garbage on the bank', false], ['Sending sewage into the river', false]],
      ['Does it make the water cleaner or dirtier?']),
  ], ['ts5.evs.river.godavari']),
]);

// ================================================================== CH 9 ATMOSPHERE AND WIND
const ch9 = U(9, 'Atmosphere - Wind', [
  O('ts5.evs.air.wind', 'Air, wind and seasons', [
    h('Air is all around us'),
    p('We cannot see air, but we can feel it when it moves. Moving air is WIND. A gentle wind is a breeze; a very strong wind is a storm or cyclone.'),
    p('The blanket of air around the Earth is the ATMOSPHERE. It has layers: troposphere (where we live and weather happens), stratosphere (has the ozone layer that blocks harmful sun rays), mesosphere, thermosphere and exosphere.'),
    photo('🌬️', 'Wind moves clouds, dries clothes and turns windmills.'),
    p('Air presses on everything — this is AIR PRESSURE. A parachute opens wide so the air pushes up on it and slows the fall. A windmill uses wind to turn its blades and make electricity.'),
    p('Telangana has three seasons: summer (March–May), rainy season (June–September) and winter (November–February).'),
    keys('Moving air = wind.', 'Atmosphere has 5 layers; we live in the troposphere.', 'Ozone layer protects us.', 'Parachute: air slows it down.'),
    tip('Fly a kite at Sankranti — the wind lifts it!'),
  ], [
    ex('Why does a parachute fall slowly?', ['Its wide cloth catches a lot of air.', 'The air pushes up against it.'], 'Air pushes up on its wide surface'),
    ex('In which layer of the atmosphere do we live?', ['It is the lowest layer.'], 'Troposphere'),
  ], [
    bank('air', [
      ['Moving air is called…', 'Wind', ['Rain', 'Soil', 'Fire'], 'You feel it on your face.', 'Moving air is wind.', '🌬️'],
      ['The lowest layer of the atmosphere, where we live, is the…', 'Troposphere', ['Stratosphere', 'Exosphere', 'Mesosphere'], 'Weather happens here.', 'We live in the troposphere.'],
      ['The ozone layer protects us from…', 'Harmful rays of the sun', ['Rain', 'Wind', 'Moonlight'], 'It is in the stratosphere.', 'Ozone blocks harmful sun rays.', '☀️'],
      ['What machine uses wind to make electricity?', 'Windmill', ['Television', 'Refrigerator', 'Pressure cooker'], 'It has big turning blades.', 'Windmills turn wind into electricity.', '🌀'],
      ['A parachute falls slowly because…', 'Air pushes up on it', ['It is heavy', 'It has a motor', 'It is magnetic'], 'Its wide cloth catches air.', 'Air resistance slows the parachute.'],
      ['Which season in Telangana is from June to September?', 'Rainy season', ['Summer', 'Winter'], 'Monsoon clouds arrive.', 'June–September is the rainy season.', '🌧️'],
      ['What lifts a kite into the sky?', 'Wind', ['Sand', 'Water', 'A magnet'], 'We fly kites at Sankranti.', 'Wind lifts the kite.', '🪁'],
    ]),
    tapT('wind', 'Tap the things that need wind or moving air.', [['Flying a kite', true], ['Windmill', true], ['Sailing boat', true], ['Drying clothes', true], ['Reading a book', false], ['Drawing a picture', false], ['Sleeping', false]],
      ['Would it work without moving air?']),
  ]),
  O('ts5.evs.air.pollution', 'Air pollution', [
    h('Dirty air'),
    p('Smoke from vehicles, factories and burning garbage makes the air dirty. This is AIR POLLUTION. It causes coughing, breathing problems and eye irritation.'),
    photo('🚗', 'Vehicles give out smoke. Walking, cycling and buses reduce pollution.'),
    p('Air is mostly nitrogen (about 78 parts in 100) and oxygen (about 21 parts in 100), with small amounts of other gases.'),
    keys('Causes: vehicle smoke, factory smoke, burning garbage, crackers.', 'Effects: coughs, asthma, eye irritation.', 'Remedies: plant trees, cycle, use buses, do not burn garbage.'),
    tip('Switch off the vehicle engine at red lights.'),
  ], [
    ex('Name two causes of air pollution.', ['Smoke from vehicles.', 'Burning garbage.'], 'Vehicle smoke and burning garbage'),
    ex('How do trees help clean the air?', ['They take in carbon dioxide and give out oxygen.', 'Leaves trap dust.'], 'They give oxygen and trap dust'),
  ], [
    bank('poll', [
      ['Which causes air pollution?', 'Burning garbage', ['Planting trees', 'Cycling', 'Walking'], 'It makes smoke.', 'Burning garbage pollutes the air.', '🔥'],
      ['Which is a good way to reduce air pollution?', 'Cycling to school', ['Burning plastic', 'Bursting many crackers', 'Keeping engines running'], 'It makes no smoke.', 'Cycling causes no pollution.', '🚲'],
      ['Which gas is most of the air made of?', 'Nitrogen', ['Oxygen', 'Smoke', 'Steam'], 'About 78 parts in 100.', 'Air is mostly nitrogen.'],
      ['Dirty air can cause…', 'Coughing and breathing problems', ['Stronger lungs', 'Better eyesight', 'Longer hair'], 'Smoke enters our lungs.', 'Air pollution harms breathing.'],
      ['How do trees help the air?', 'They give out oxygen and trap dust', ['They make smoke', 'They make noise', 'They burn fuel'], 'Leaves are green helpers.', 'Trees clean the air.', '🌳'],
    ]),
    tapT('causes', 'Tap the causes of air pollution.', [['Vehicle smoke', true], ['Factory smoke', true], ['Burning garbage', true], ['Too many crackers', true], ['Planting trees', false], ['Walking', false], ['Solar lamps', false]],
      ['Does it make smoke or harmful gases?']),
  ], ['ts5.evs.air.wind']),
]);

// ================================================================== CH 10 SUN AND PLANETS
const PLANETS = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
const ch10 = U(10, 'The Sun and the Planets', [
  O('ts5.evs.space.solar', 'The solar system', [
    h('Our Sun and its family'),
    p('The Sun is a star — a huge ball of hot, glowing gas. It gives us light and heat. Eight planets go around (revolve around) the Sun. Together they make the SOLAR SYSTEM.'),
    photo('☀️', 'The Sun is so big that more than a million Earths could fit inside it.'),
    p('In order from the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. Jupiter is the biggest. Mercury is the closest to the Sun. Saturn has beautiful rings. Earth is the only planet known to have life.'),
    keys('Sun = a star.', '8 planets revolve around the Sun.', 'Biggest: Jupiter. Closest: Mercury.', 'Only Earth has life.'),
    tip('Remember the order: "My Very Easy Method Just Speeds Up Naming".'),
  ], [
    ex('Which planet is closest to the Sun?', ['It is the first in the order.'], 'Mercury'),
    ex('Which planet has life?', ['It has air and water.'], 'Earth'),
  ], [
    tp('order', (r) => {
      const start = r.int(0, 4), n = r.int(3, 4), seq = PLANETS.slice(start, start + n);
      let sh = r.shuffle(seq.map((x, i) => ({ id: `o${i + 1}`, label: { en: x } })));
      if (sh.every((x, i) => x.id === `o${i + 1}`)) sh = [...sh].reverse();
      return {
        type: 'order', prompt: 'Put these planets in order, starting with the one closest to the Sun.', choices: sh, answer: { kind: 'order', correct: seq.map((_, i) => `o${i + 1}`) },
        hints: ['Order: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.', '"My Very Easy Method Just Speeds Up Naming".'], solution: [seq.join(' → ')],
      };
    }),
    bank('facts', [
      ['The Sun is a…', 'Star', ['Planet', 'Moon', 'Comet'], 'It makes its own light.', 'The Sun is a star.', '☀️'],
      ['Which is the biggest planet?', 'Jupiter', ['Earth', 'Mars', 'Mercury'], 'It is a giant gas planet.', 'Jupiter is the biggest planet.'],
      ['Which planet is famous for its rings?', 'Saturn', ['Mars', 'Venus', 'Earth'], 'It is the sixth planet.', 'Saturn has bright rings.'],
      ['How many planets are in our solar system?', '8', ['9', '7', '12'], 'Count from Mercury to Neptune.', 'There are 8 planets.'],
      ['Which planet is called the red planet?', 'Mars', ['Jupiter', 'Venus', 'Neptune'], 'Its soil is reddish.', 'Mars is the red planet.'],
      ['Which planet is closest to the Sun?', 'Mercury', ['Neptune', 'Earth', 'Saturn'], 'First in the order.', 'Mercury is closest to the Sun.'],
    ]),
  ]),
  O('ts5.evs.space.moon', 'Day and night; the Moon and its phases', [
    h('Why do we have day and night?'),
    p('The Earth spins like a top. This is called ROTATION. One spin takes about 24 hours. The side facing the Sun has DAY; the other side has NIGHT.'),
    p('The Earth also goes around the Sun. This is REVOLUTION. One trip takes about 365 days — one year.'),
    h('The Moon'),
    p('The Moon goes around the Earth. It has no light of its own — it shines because sunlight falls on it. Its shape seems to change every night. These shapes are PHASES.'),
    photo('🌙', 'A crescent moon: only a thin lit part faces us.'),
    p('Full moon (Pournami): the whole round face is bright. New moon (Amavasya): we cannot see the Moon. From one full moon to the next is about 29½ days.'),
    keys('Rotation (24 hours) → day and night.', 'Revolution (365 days) → one year.', 'The Moon reflects sunlight.', 'Full moon = Pournami; new moon = Amavasya.'),
    tip('Look at the Moon for a week and draw its shape each night!'),
  ], [
    ex('Why is it night in some places when it is day in India?', ['The Earth rotates.', 'Only one half faces the Sun at a time.'], 'They are on the side facing away from the Sun'),
    ex('Does the Moon make its own light?', ['It reflects sunlight like a mirror.'], 'No'),
  ], [
    bank('moon', [
      ['Day and night happen because the Earth…', 'Rotates (spins)', ['Stops moving', 'Goes near the Moon', 'Gets colder'], 'Think of a spinning top.', 'Rotation gives day and night.', '🌍'],
      ['How long does the Earth take to spin once?', 'About 24 hours', ['About 1 hour', 'About 365 days', 'About 7 days'], 'One day and one night.', 'One rotation takes about 24 hours.'],
      ['How long does the Earth take to go around the Sun?', 'About 365 days', ['24 hours', '30 days', '7 days'], 'That is one year.', 'One revolution takes about 365 days.'],
      ['The Moon shines because…', 'Sunlight falls on it', ['It is on fire', 'It has bulbs', 'It is a star'], 'It has no light of its own.', 'The Moon reflects sunlight.', '🌙'],
      ['The night when the full round Moon is seen is called…', 'Pournami (full moon)', ['Amavasya (new moon)', 'Sankranti', 'Ugadi'], 'The whole face is bright.', 'Full moon = Pournami.'],
      ['The night when the Moon is not seen is called…', 'Amavasya (new moon)', ['Pournami (full moon)', 'Holi', 'Bonalu'], 'The sky is dark.', 'New moon = Amavasya.'],
    ]),
    matchT('match', 'Match the word to its meaning', [['Rotation', 'Earth spinning'], ['Revolution', 'Earth going around the Sun'], ['Pournami', 'Full moon'], ['Amavasya', 'New moon'], ['Sun', 'A star'], ['Moon', 'Goes around the Earth']],
      ['Rotation = spin, revolution = going around.']),
  ], ['ts5.evs.space.solar']),
]);

// ================================================================== CH 11 SAFETY AND FIRST AID
const ch11 = U(11, 'Safety and First Aid', [
  O('ts5.evs.safety.rules', 'Staying safe at home, on roads and in disasters', [
    h('Be alert, be safe'),
    p('At home: keep away from fire, gas stoves, electric switches with wet hands, and sharp knives. Keep medicines out of reach of small children.'),
    p('On the road: walk on the footpath, cross at the zebra crossing, and look right, left and right again. Red light = stop, yellow = wait, green = go. Wear a helmet on a two-wheeler.'),
    photo('🚗', 'Follow traffic lights: red stop, yellow wait, green go.'),
    p('In crowds (jataras, festivals): hold a grown-up\'s hand and remember a meeting point.'),
    p('Water: never swim alone in tanks, wells or rivers. Earthquake: DROP, COVER under a strong table and HOLD ON. Flood: move to higher ground.'),
    keys('Zebra crossing; look right–left–right.', 'Earthquake: drop, cover, hold.', 'Never swim alone.', 'Emergency number: 112. Ambulance: 108. Fire: 101.'),
    tip('Learn your parents\' phone number by heart.'),
  ], [
    ex('What should you do during an earthquake?', ['Drop to the floor.', 'Cover under a strong table.', 'Hold on.'], 'Drop, cover and hold on'),
    ex('Which number do you call for an ambulance in Telangana?', ['It is a three-digit free number.'], '108'),
  ], [
    bank('rules', [
      ['Where should you cross the road?', 'At the zebra crossing', ['Anywhere you like', 'Between parked buses', 'At a bend in the road'], 'It has black and white stripes.', 'Cross at the zebra crossing.'],
      ['A red traffic light means…', 'Stop', ['Go', 'Run fast', 'Turn around'], 'Red is for danger.', 'Red means stop.'],
      ['During an earthquake you should…', 'Drop, cover and hold on', ['Run into the lift', 'Stand near glass windows', 'Climb a tree'], 'Get under a strong table.', 'Drop, cover and hold on keeps you safe.'],
      ['The number for an ambulance is…', '108', ['100', '1098', '139'], 'It brings help for sick people.', '108 is the ambulance number.', '🧑‍⚕️'],
      ['The number for the fire service is…', '101', ['108', '1098', '123'], 'It brings the fire engine.', '101 is the fire service number.', '🔥'],
      ['In a flood you should move to…', 'Higher ground', ['The river bank', 'A low basement', 'The middle of the water'], 'Water flows downhill.', 'Higher ground is safer in a flood.', '🌧️'],
      ['On a two-wheeler you should always wear a…', 'Helmet', ['Cap', 'Garland', 'Scarf'], 'It protects your head.', 'A helmet protects the head.'],
    ]),
    tapT('safe', 'Tap the SAFE actions.', [['Walking on the footpath', true], ['Wearing a helmet', true], ['Swimming only with a grown-up', true], ['Holding a grown-up\'s hand in crowds', true], ['Touching switches with wet hands', false], ['Playing with matchsticks', false], ['Swimming alone in a well', false], ['Crossing on a red light', false]],
      ['Could anyone get hurt?']),
  ]),
  O('ts5.evs.safety.firstaid', 'First aid and our helpers', [
    h('First help before the doctor'),
    p('FIRST AID is the first help given to an injured person before a doctor comes.'),
    p('Small cut: wash with clean water, press with a clean cloth to stop bleeding, then put on a bandage.'),
    p('Burn: hold under cool running water for some minutes. Do not put ink, toothpaste or oil on it.'),
    p('Dog bite: wash with soap and running water for a long time and go to the doctor quickly for injections.'),
    p('Nose bleed: sit up, lean forward a little and pinch the soft part of the nose.'),
    photo('🧑‍⚕️', 'Doctors, nurses, police, firefighters and 108 staff are our helpers.'),
    keys('Cut: wash, press, bandage.', 'Burn: cool water — no toothpaste.', 'Dog bite: soap water, doctor.', 'Always tell a grown-up.'),
    tip('Every school should have a first-aid box with cotton, bandage, antiseptic and scissors.'),
  ], [
    ex('Ravi burnt his finger on a hot vessel. What first aid?', ['Hold the finger under cool running water for some minutes.', 'Do not apply toothpaste.'], 'Cool running water'),
    ex('What is first aid?', ['It is given right away.', 'Before the doctor comes.'], 'The first help given to an injured person'),
  ], [
    bank('aid', [
      ['For a small burn, first…', 'Hold it under cool running water', ['Put toothpaste on it', 'Rub oil on it', 'Put ink on it'], 'Cool the skin.', 'Cool running water is the right first aid for burns.'],
      ['For a small cut, first…', 'Wash it and press with a clean cloth', ['Put mud on it', 'Leave it dirty', 'Scratch it'], 'Keep it clean and stop the bleeding.', 'Wash, press and bandage.'],
      ['After a dog bite you should…', 'Wash with soap and water and see a doctor', ['Ignore it', 'Tie a thread around it', 'Put chilli powder on it'], 'Germs must be washed away.', 'Wash well and get injections from a doctor.', '🐶'],
      ['For a nose bleed you should…', 'Sit up, lean forward and pinch the nose', ['Lie flat on your back', 'Blow hard', 'Run around'], 'Lean forward, not back.', 'Pinch the soft part of the nose.'],
      ['Which is kept in a first-aid box?', 'Bandage and antiseptic', ['Chocolates', 'Toys', 'Crayons'], 'Things to clean and cover wounds.', 'Bandage and antiseptic are first-aid items.'],
      ['First aid means…', 'The first help before the doctor comes', ['A kind of game', 'A school subject', 'A medicine name'], 'It is given right away.', 'First aid is the first help to an injured person.'],
    ]),
    matchT('helpers', 'Match the helper to the number or job', [['Ambulance', '108'], ['Fire service', '101'], ['Police', '100'], ['Childline', '1098'], ['All emergencies', '112']],
      ['Ambulance 108, fire 101, police 100.', 'Childline helps children: 1098.']),
  ], ['ts5.evs.safety.rules']),
]);

// ================================================================== CH 12 WANAPARTHY FORT
const ch12 = U(12, 'Historical Sites - Wanaparthy Fort', [
  O('ts5.evs.fort.history', 'Wanaparthy Fort and its rulers', [
    h('A palace in southern Telangana'),
    p('Wanaparthy is a town in southern Telangana. Long ago it was the seat of a SAMSTHANAM — a small kingdom ruled by Rajas who served under bigger rulers.'),
    p('The Rajas of Wanaparthy built a fort and a palace. They looked after the land, collected taxes, built tanks for water and helped the people.'),
    photo('👑', 'Rajas of the samsthanams supported temples, music and poets.'),
    p('The rulers supported temples, music, dance and Telugu and Sanskrit literature. Poets and scholars were invited to the court. Today the old palace building is used for education.'),
    keys('Wanaparthy: a samsthanam (small kingdom).', 'Rulers built forts, palaces, tanks and temples.', 'They supported art and literature.'),
    tip('Historical sites are our heritage. Do not scribble on their walls!'),
  ], [
    ex('What is a samsthanam?', ['A small kingdom with its own Raja.'], 'A small kingdom ruled by a Raja'),
    ex('Name two things the Wanaparthy rulers supported.', ['They invited poets.', 'They built temples.'], 'Literature and temples (also music and dance)'),
  ], [
    bank('fort', [
      ['Wanaparthy was a…', 'Samsthanam (small kingdom)', ['Big seaport', 'Desert town', 'Island'], 'It had its own Raja.', 'Wanaparthy was a samsthanam.', '👑'],
      ['Why did rulers build tanks?', 'To store water for people and fields', ['To keep fish as pets only', 'To play cricket', 'To hide gold'], 'Telangana has many tanks (cheruvulu).', 'Tanks store water for drinking and farming.', '💧'],
      ['The Wanaparthy rulers supported…', 'Poets, music and temples', ['Only war', 'Only hunting', 'Nothing'], 'They invited scholars to court.', 'They supported arts and literature.'],
      ['How should we treat old forts and monuments?', 'Protect them and keep them clean', ['Scribble on the walls', 'Break stones to take home', 'Throw garbage there'], 'They are our heritage.', 'We must protect our heritage.'],
      ['A ruler of a samsthanam was called a…', 'Raja', ['Farmer', 'Potter', 'Fisherman'], 'He wore a crown.', 'The ruler was a Raja.', '👑'],
    ]),
    tapT('heritage', 'Tap the GOOD things to do when visiting a historical site.', [['Keep it clean', true], ['Read the information boards', true], ['Take only photos', true], ['Listen to the guide', true], ['Scribble names on walls', false], ['Break pieces of stone', false], ['Throw plastic around', false]],
      ['Would it protect the monument?']),
  ]),
  O('ts5.evs.fort.admin', 'How kingdoms were run', [
    h('Running a kingdom'),
    p('A Raja needed helpers. A DIWAN (chief minister) helped run the kingdom. Officers collected taxes from farmers. Soldiers protected the fort. Village heads looked after villages.'),
    p('Taxes paid for roads, tanks, temples, soldiers and the palace. Today our government is chosen by the people through elections — not by birth.'),
    photo('📜', 'Old records and land documents were written on paper or palm leaves.'),
    keys('Raja → Diwan → officers → village heads.', 'Taxes paid for public works.', 'Today: elected government.'),
    tip('Visit a nearby fort with your family: Golkonda, Warangal, Bhongir, Wanaparthy, Medak or Elgandal.'),
  ], [
    ex('Who helped the Raja run the kingdom?', ['The chief minister.'], 'The Diwan'),
    ex('How is our government chosen today?', ['People vote.'], 'Through elections'),
  ], [
    bank('admin', [
      ['The chief minister of a Raja was called the…', 'Diwan', ['Soldier', 'Farmer', 'Poet'], 'He helped run the kingdom.', 'The Diwan was the chief minister.'],
      ['What did taxes pay for?', 'Roads, tanks and soldiers', ['Nothing', 'Only toys', 'Only sweets'], 'Things that helped everyone.', 'Taxes paid for public works.'],
      ['Who protected the fort?', 'Soldiers', ['Poets', 'Dancers', 'Children'], 'They carried weapons.', 'Soldiers guarded the fort.'],
      ['Today, our leaders are chosen by…', 'Elections (voting)', ['Birth in a royal family', 'A coin toss', 'A race'], 'People vote.', 'Leaders are elected.'],
      ['Which of these is a fort in Telangana?', 'Bhongir Fort', ['Red Fort, Delhi', 'Amber Fort, Jaipur', 'Gateway of India'], 'It stands on a big rock in Yadadri Bhuvanagiri district.', 'Bhongir Fort is in Telangana.'],
    ]),
    matchT('match', 'Match the person to the job', [['Raja', 'Ruler of the kingdom'], ['Diwan', 'Chief minister'], ['Soldier', 'Protects the fort'], ['Poet', 'Writes verses'], ['Tax officer', 'Collects taxes']],
      ['Who rules, who advises, who guards?']),
  ], ['ts5.evs.fort.history']),
], 'Wanaparthy history is kept general; teachers should add local detail (ruler names, dates) from the SCERT textbook.');

// ================================================================== CH 13 ENERGY
const ch13 = U(13, 'Energy', [
  O('ts5.evs.energy.sources', 'Renewable and non-renewable energy', [
    h('Energy makes things work'),
    p('We need energy to cook, light bulbs, run fans, buses and factories. Where does it come from?'),
    p('NON-RENEWABLE sources will run out one day: coal, petrol, diesel and natural gas. They took millions of years to form. Coal is mined at Singareni in Telangana and burnt at power stations.'),
    p('RENEWABLE sources never run out: sunlight (solar), wind and flowing water (hydro power). Nagarjuna Sagar dam makes electricity from water.'),
    photo('☀️', 'Solar panels change sunlight into electricity.'),
    keys('Non-renewable: coal, petrol, diesel, gas.', 'Renewable: sun, wind, water.', 'Renewable energy is cleaner.'),
    tip('Burning coal and petrol makes smoke; solar and wind do not.'),
  ], [
    ex('Is coal renewable or non-renewable?', ['It took millions of years to form.', 'Once used, it is gone.'], 'Non-renewable'),
    ex('Name two renewable energy sources.', ['They never run out.'], 'Sunlight and wind (also flowing water)'),
  ], [
    bank('src', [
      ['Which is a renewable energy source?', 'Sunlight', ['Coal', 'Petrol', 'Diesel'], 'It will never run out.', 'Sunlight is renewable.', '☀️'],
      ['Which is a non-renewable energy source?', 'Coal', ['Wind', 'Sunlight', 'Flowing water'], 'It is dug from mines.', 'Coal will run out one day.', '🪨'],
      ['Where in Telangana is coal mined?', 'Singareni collieries', ['Hussain Sagar', 'Charminar', 'Medaram'], 'Around Kothagudem and Ramagundam.', 'Singareni mines coal.'],
      ['A solar panel changes sunlight into…', 'Electricity', ['Water', 'Coal', 'Smoke'], 'It lights lamps.', 'Solar panels make electricity.'],
      ['Electricity made from flowing water is called…', 'Hydro power', ['Solar power', 'Coal power', 'Wind power'], 'Dams like Nagarjuna Sagar make it.', 'Water power is hydro power.', '💧'],
      ['Which energy source makes the least smoke?', 'Wind', ['Coal', 'Diesel', 'Firewood'], 'Nothing is burnt.', 'Wind energy is clean.', '🌬️'],
    ]),
    tapT('renew', 'Tap the RENEWABLE energy sources.', [['Sunlight', true], ['Wind', true], ['Flowing water', true], ['Coal', false], ['Petrol', false], ['Diesel', false], ['Natural gas', false]],
      ['Will it ever run out?']),
  ]),
  O('ts5.evs.energy.save', 'Saving energy', [
    h('Every unit counts'),
    p('Making electricity uses coal and water. When we waste electricity, we waste these too.'),
    p('Switch off lights and fans when you leave a room. Use LED bulbs. Use buses, walk or cycle for short trips. Dry clothes in the sun instead of a machine.'),
    photo('💡', 'An LED bulb gives bright light using much less electricity.'),
    keys('Switch off when not in use.', 'Use LED bulbs and solar lamps.', 'Walk, cycle or take the bus.'),
    tip('Be an "energy monitor" for your class: switch off fans at break time!'),
  ], [
    ex('You leave your classroom for the playground. What should you do?', ['Nobody is using the fans and lights.'], 'Switch off the lights and fans'),
    ex('Why is cycling better than going by motorbike for a short trip?', ['Cycling uses no petrol.'], 'It saves fuel and causes no pollution'),
  ], [
    bank('save', [
      ['Which saves energy?', 'Switching off fans when leaving a room', ['Keeping the TV on all night', 'Leaving the fridge door open', 'Lights on in the daytime'], 'Nobody needs it then.', 'Switching off saves electricity.'],
      ['Which bulb saves the most electricity?', 'LED bulb', ['Old filament bulb', 'Five bulbs together', 'A candle and a bulb'], 'It is modern and cool.', 'LED bulbs use less electricity.', '💡'],
      ['For a short trip, the best way to save fuel is to…', 'Walk or cycle', ['Take a car alone', 'Ride a bike with the engine running all day', 'Take a taxi'], 'Use your legs!', 'Walking and cycling use no fuel.', '🚲'],
      ['Drying clothes in the sun…', 'Saves electricity', ['Wastes coal', 'Makes smoke', 'Needs petrol'], 'The sun is free.', 'Sun-drying uses free solar energy.', '☀️'],
      ['Wasting electricity also wastes…', 'Coal and water used to make it', ['Nothing', 'Only paper', 'Only time'], 'Power stations burn fuel.', 'Electricity is made using coal and water.'],
    ]),
    tapT('habits', 'Tap the energy-saving habits.', [['Switch off lights in empty rooms', true], ['Use LED bulbs', true], ['Cycle to school', true], ['Dry clothes in the sun', true], ['Keep the TV on with no one watching', false], ['Leave the fridge door open', false], ['Run the fan in an empty room', false]],
      ['Does it save or waste electricity or fuel?']),
  ], ['ts5.evs.energy.sources']),
]);

// ================================================================== CH 14 OUR COUNTRY - WORLD
const ch14 = U(14, 'Our Country - World', [
  O('ts5.evs.world.india', 'India and its regions', [
    h('Our country, India'),
    p('India is a large country in Asia. It has 28 states and 8 union territories. New Delhi is the capital. Telangana became a state on 2 June 2014; its capital is Hyderabad.'),
    p('India has many regions: the Himalaya mountains in the north, the great plains of the Ganga, the Thar desert in the west, the Deccan plateau in the south (Telangana is on it), coastal plains along the seas, and islands.'),
    photo('⛰️', 'The Himalayas are the highest mountains in the world.'),
    keys('India: 28 states, 8 union territories.', 'Capital: New Delhi.', 'Telangana: formed 2 June 2014, capital Hyderabad, on the Deccan plateau.'),
    tip('Telangana Formation Day is celebrated every year on 2 June.'),
  ], [
    ex('What is the capital of India?', ['The Parliament is there.'], 'New Delhi'),
    ex('On which landform is Telangana?', ['It is a high, flat land in the south.'], 'The Deccan plateau'),
  ], [
    bank('india', [
      ['What is the capital of India?', 'New Delhi', ['Hyderabad', 'Mumbai', 'Chennai'], 'The Parliament is there.', 'New Delhi is India\'s capital.'],
      ['What is the capital of Telangana?', 'Hyderabad', ['Warangal', 'New Delhi', 'Karimnagar'], 'Charminar is there.', 'Hyderabad is Telangana\'s capital.'],
      ['When was Telangana formed?', '2 June 2014', ['15 August 1947', '26 January 1950', '1 November 1956'], 'Formation Day is in June.', 'Telangana was formed on 2 June 2014.'],
      ['How many states does India have?', '28', ['8', '33', '50'], 'It is between 25 and 30.', 'India has 28 states (and 8 union territories).'],
      ['Which mountains are in the north of India?', 'The Himalayas', ['The Deccan', 'The Thar', 'The Nallamala'], 'They have snow-covered peaks.', 'The Himalayas are in the north.', '⛰️'],
      ['The Thar desert is in which part of India?', 'West', ['East', 'South', 'Middle of the sea'], 'Rajasthan is there.', 'The Thar desert is in the west.'],
    ]),
    matchT('regions', 'Match the region to what it is like', [['Himalayas', 'High snowy mountains'], ['Thar', 'Hot sandy desert'], ['Ganga plains', 'Flat fertile land'], ['Deccan plateau', 'High flat land in the south'], ['Coastal plains', 'Land along the sea'], ['Islands', 'Land surrounded by water']],
      ['Think of snow, sand, rivers and sea.']),
  ]),
  O('ts5.evs.world.continents', 'Continents and oceans', [
    h('The whole world'),
    p('The Earth has seven big land masses called CONTINENTS: Asia, Africa, North America, South America, Antarctica, Europe and Australia. Asia is the biggest; India is in Asia.'),
    p('There are five OCEANS: Pacific, Atlantic, Indian, Southern and Arctic. The Pacific is the biggest. The Indian Ocean is named after our country.'),
    photo('🌍', 'About three-quarters of the Earth is covered with water.'),
    keys('7 continents; biggest is Asia.', '5 oceans; biggest is the Pacific.', 'India is in Asia, next to the Indian Ocean.'),
    tip('Antarctica is covered in ice — penguins live there!'),
  ], [
    ex('Which continent is India in?', ['It is the biggest continent.'], 'Asia'),
    ex('Which is the biggest ocean?', ['It is between Asia and the Americas.'], 'Pacific Ocean'),
  ], [
    bank('world', [
      ['How many continents are there?', '7', ['5', '8', '28'], 'Count: Asia, Africa, Europe…', 'There are 7 continents.', '🌍'],
      ['How many oceans are there?', '5', ['7', '3', '10'], 'Pacific, Atlantic, Indian…', 'There are 5 oceans.'],
      ['Which is the biggest continent?', 'Asia', ['Australia', 'Europe', 'Antarctica'], 'India is in it.', 'Asia is the biggest continent.'],
      ['Which is the biggest ocean?', 'Pacific Ocean', ['Indian Ocean', 'Arctic Ocean', 'Atlantic Ocean'], 'It is very wide.', 'The Pacific is the biggest ocean.'],
      ['Which ocean is named after our country?', 'Indian Ocean', ['Pacific Ocean', 'Atlantic Ocean', 'Arctic Ocean'], 'It is south of India.', 'The Indian Ocean.'],
      ['Which continent is covered with ice and has penguins?', 'Antarctica', ['Africa', 'Asia', 'Australia'], 'It is at the South Pole.', 'Antarctica is icy.', '🐧'],
    ]),
    tapT('cont', 'Tap the names of CONTINENTS (not oceans).', [['Asia', true], ['Africa', true], ['Europe', true], ['Australia', true], ['Antarctica', true], ['Pacific', false], ['Atlantic', false], ['Indian Ocean', false], ['Arctic', false]],
      ['Continents are land; oceans are water.']),
  ], ['ts5.evs.world.india']),
]);

// ================================================================== CH 15 CONSTITUTION
const ch15 = U(15, 'Our Constitution', [
  O('ts5.evs.const.preamble', 'The Constitution and its Preamble', [
    h('The rule book of our country'),
    p('The CONSTITUTION is the most important book of rules for India. It tells how the government works and what our rights and duties are.'),
    p('It was adopted on 26 November 1949 and came into force on 26 January 1950. That is why we celebrate Republic Day on 26 January. Dr B. R. Ambedkar led the committee that drafted it.'),
    photo('📜', 'The Constitution begins with the Preamble — "We, the people of India…"'),
    p('The PREAMBLE is the introduction. It says India is a sovereign, socialist, secular, democratic republic. It promises JUSTICE, LIBERTY, EQUALITY and FRATERNITY to all.'),
    def('Justice', 'Being fair to everyone.'), def('Liberty', 'Freedom to think, speak and believe.'),
    def('Equality', 'Everyone is equal; no one is above or below.'), def('Fraternity', 'Brotherhood — living together like one family.'),
    keys('Constitution came into force on 26 January 1950.', 'Dr B. R. Ambedkar: chairman of the drafting committee.', 'Justice, liberty, equality, fraternity.'),
    tip('Read the Preamble aloud in your school assembly.'),
  ], [
    ex('Why do we celebrate Republic Day on 26 January?', ['The Constitution came into force on 26 January 1950.'], 'Because our Constitution came into force that day'),
    ex('What does "equality" mean?', ['No one is treated as higher or lower.'], 'Everyone is equal'),
  ], [
    bank('pre', [
      ['Our Constitution came into force on…', '26 January 1950', ['15 August 1947', '2 June 2014', '2 October 1869'], 'It is Republic Day.', 'The Constitution came into force on 26 January 1950.'],
      ['Who was the chairman of the committee that drafted the Constitution?', 'Dr B. R. Ambedkar', ['Mahatma Gandhi', 'Rabindranath Tagore', 'C. V. Raman'], 'He is called the architect of the Constitution.', 'Dr B. R. Ambedkar led the drafting committee.'],
      ['"Everyone is equal" is called…', 'Equality', ['Liberty', 'Justice', 'Fraternity'], 'Equal → ?', 'That is equality.'],
      ['"Freedom to think and speak" is called…', 'Liberty', ['Equality', 'Fraternity', 'Justice'], 'Liberty means freedom.', 'That is liberty.'],
      ['"Living together like brothers and sisters" is called…', 'Fraternity', ['Liberty', 'Justice', 'Equality'], 'Brotherhood.', 'That is fraternity.'],
      ['"Being fair to everyone" is called…', 'Justice', ['Fraternity', 'Liberty', 'Equality'], 'Courts give this.', 'That is justice.'],
      ['The introduction to the Constitution is called the…', 'Preamble', ['Index', 'Glossary', 'Chapter'], 'It starts "We, the people of India".', 'It is the Preamble.'],
    ]),
    matchT('words', 'Match the word to its meaning', [['Justice', 'Being fair'], ['Liberty', 'Freedom'], ['Equality', 'Everyone is equal'], ['Fraternity', 'Brotherhood'], ['Preamble', 'Introduction of the Constitution']],
      ['Liberty = freedom, fraternity = brotherhood.']),
  ]),
  O('ts5.evs.const.rights', 'Rights and duties', [
    h('Rights come with duties'),
    p('The Constitution gives us FUNDAMENTAL RIGHTS: the right to equality, the right to freedom, the right against exploitation (no child labour), the right to freedom of religion, cultural and educational rights, and the right to go to court if our rights are taken away.'),
    p('Children aged 6 to 14 have the right to free and compulsory education.'),
    p('We also have DUTIES: respect the national flag and anthem, protect public property, keep the environment clean, and respect everyone.'),
    photo('🏫', 'Every child has the right to go to school.'),
    keys('Rights: what we should get.', 'Duties: what we should do.', 'Education is a right for children aged 6–14.'),
    tip('Standing still for the national anthem is one of your duties.'),
  ], [
    ex('Is going to school a right or a duty?', ['The Constitution gives children free education.'], 'A right (and it is also good to attend!)'),
    ex('Is keeping the park clean a right or a duty?', ['It is something we should do for others.'], 'A duty'),
  ], [
    tapT('duty', 'Tap the DUTIES (things we should do).', [['Respect the national flag', true], ['Protect public property', true], ['Keep surroundings clean', true], ['Respect all people', true], ['Break bus seats', false], ['Throw garbage on roads', false], ['Make fun of others', false]],
      ['Is it something good citizens do?']),
    bank('rights', [
      ['Children aged 6 to 14 have the right to…', 'Free and compulsory education', ['Work in factories', 'Stay home always', 'Drive cars'], 'Every child should be in school.', 'Education is a right for ages 6–14.', '🏫'],
      ['Which is a duty?', 'Keeping public places clean', ['Breaking street lights', 'Writing on monuments', 'Wasting water'], 'Something good we should do.', 'Keeping places clean is a duty.'],
      ['Making children work in factories is…', 'Against the law', ['Allowed', 'A duty', 'A right'], 'Children should study and play.', 'Child labour is against our rights.'],
      ['When the national anthem is played, we should…', 'Stand still with respect', ['Keep talking', 'Run around', 'Sit and eat'], 'It is a duty.', 'We stand respectfully.'],
      ['The right to equality means…', 'No one is treated badly because of religion, caste or gender', ['Only rich people have rights', 'Only boys go to school', 'Only adults can speak'], 'Everyone is equal.', 'All citizens are equal before the law.'],
    ]),
  ], ['ts5.evs.const.preamble']),
], 'Constitution facts are standard; teachers may simplify the list of rights for the class.');

// ================================================================== CH 16 CHILD RIGHTS
const ch16 = U(16, 'Child Rights', [
  O('ts5.evs.child.rights', 'Rights of every child', [
    h('Every child matters'),
    p('Every child has the right to SURVIVAL (food, health, a safe home), DEVELOPMENT (education, play, rest), PROTECTION (safety from harm, abuse and child labour) and PARTICIPATION (to be heard and to share ideas).'),
    photo('👧', 'Children have the right to play, learn and be heard.'),
    p('At home: love, care and food. At school: learning without fear or punishment. In society: no child labour and no child marriage.'),
    p('A CHILDREN\'S PARLIAMENT (Bala Sabha) in school lets children discuss problems and suggest solutions — like clean toilets or safe drinking water.'),
    keys('Survival, development, protection, participation.', 'No child labour, no child marriage.', 'Children\'s parliament: children\'s voices matter.'),
    tip('If you have an idea to improve your school, share it in the Bala Sabha!'),
  ], [
    ex('A 12-year-old is made to work in a hotel instead of going to school. Which right is broken?', ['Children should be in school.', 'They should be protected from work.'], 'Right to education and protection from child labour'),
    ex('What does a children\'s parliament do?', ['Children meet, discuss and suggest ideas.'], 'Lets children share ideas and solve school problems'),
  ], [
    bank('rights', [
      ['Which is a right of every child?', 'To go to school and play', ['To work in a factory', 'To marry early', 'To be beaten'], 'Children should learn and grow.', 'Education and play are children\'s rights.', '🏫'],
      ['Child labour is…', 'Wrong and against the law', ['Allowed', 'A good habit', 'A school subject'], 'Children should not be made to work.', 'Child labour is illegal.'],
      ['A Bala Sabha (children\'s parliament) is where…', 'Children discuss and share ideas', ['Children are punished', 'Adults sell things', 'Only teachers talk'], 'Children\'s voices matter.', 'It is a forum for children.'],
      ['The right to be heard is called…', 'Participation', ['Survival', 'Labour', 'Silence'], 'Taking part.', 'That is the right to participation.'],
      ['Food, health and a safe home are part of the right to…', 'Survival', ['Participation', 'Voting', 'Driving'], 'What we need to live.', 'That is the right to survival.'],
      ['Punishing children with beating at school is…', 'Not allowed', ['Allowed', 'Good for learning', 'A right'], 'Learning should be without fear.', 'Children must learn without fear.'],
    ]),
    matchT('match', 'Match the right to its example', [['Survival', 'Food and health'], ['Development', 'Education and play'], ['Protection', 'Safety from harm'], ['Participation', 'Sharing your ideas']],
      ['Survival = live, development = grow, protection = safe, participation = take part.']),
  ]),
  O('ts5.evs.child.protect', 'Help for children: Childline and protection bodies', [
    h('Who protects children?'),
    p('If a child is in danger, lost, hurt, or forced to work or marry, call CHILDLINE: 1098. It is free and works day and night.'),
    p('Child Welfare Committees in every district and the State Commission for Protection of Child Rights help children in trouble. Police and teachers also help.'),
    photo('🙋', 'Speak up! Tell a trusted grown-up if something feels wrong.'),
    p('Good touch makes you feel safe and loved. Bad touch makes you feel scared or uncomfortable. Say NO, get away, and TELL a trusted adult.'),
    keys('Childline: 1098 (free, 24 hours).', 'Say NO, go away, tell someone.', 'Child Welfare Committees protect children.'),
    tip('Learn 1098 by heart and share it with friends.'),
  ], [
    ex('You see a small child crying alone at a bus stand. What can you do?', ['Tell a grown-up you trust.', 'They can call 1098.'], 'Tell a trusted adult or call Childline 1098'),
    ex('Someone touches you in a way that makes you uncomfortable. What do you do?', ['Say NO.', 'Go away.', 'Tell a trusted adult.'], 'Say no, get away, tell someone'),
  ], [
    bank('help', [
      ['The Childline number is…', '1098', ['108', '101', '100'], 'It reads like "ten-nine-eight".', 'Childline is 1098.'],
      ['Childline works…', 'Day and night, for free', ['Only on Sundays', 'Only for adults', 'Only if you pay'], 'Children can call any time.', 'Childline is free and 24 hours.'],
      ['If someone gives you a bad touch, you should…', 'Say no, get away and tell a trusted adult', ['Keep it a secret', 'Feel it is your fault', 'Do nothing'], 'It is never your fault.', 'Say no, go, tell.'],
      ['Which group protects children in each district?', 'Child Welfare Committee', ['Cricket club', 'Film club', 'Shop owners'], 'It has "child" and "welfare" in its name.', 'Child Welfare Committees protect children.'],
      ['A lost child at a jatara should go to…', 'A police help booth or a trusted adult', ['A stranger who offers sweets', 'Hide alone', 'Walk away from the crowd alone'], 'Look for uniformed helpers.', 'Police booths help lost children.'],
    ]),
    tapT('trusted', 'Tap the people you can go to for help.', [['Parents', true], ['Teacher', true], ['Police', true], ['Childline 1098', true], ['A stranger offering sweets', false], ['Someone who asks you to keep secrets from parents', false], ['An unknown person online', false]],
      ['Is this a trusted, safe person?']),
  ], ['ts5.evs.child.rights']),
]);




export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16];
