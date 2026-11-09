/*
 * Story Time — short original picture stories with an Indian setting.
 *
 * TELUGU REVIEW NEEDED: all `te` sentences, prompts and answers below are
 * first drafts and must be checked by a native Telugu speaker before release
 * (simple, spoken-style Telugu suitable for 3–6 year olds).
 *
 * Scenes are data: a background + actors (art keys drawn in ../art.tsx) on a
 * 400×260 stage. Interactions are taps on actors (no dragging needed).
 */
import { L } from './pictures';

export interface Actor { id: string; art: string; x: number; y: number; s?: number; v?: string; hidden?: boolean; flip?: boolean }
export type Interaction =
  | { kind: 'tap'; actor: string; prompt: L; say: L; show?: string[]; hide?: string[]; set?: Record<string, string>; move?: { actor: string; dx: number; dy: number }; react?: 'wiggle' | 'jump' }
  /** Tap each actor once; numbers appear (mark), they vanish (hide) or change (set → eachV). `level` actor's v becomes the count (+1). */
  | { kind: 'count'; actors: string[]; prompt: L; say: L; each: 'mark' | 'hide' | 'set'; eachV?: string; level?: string; show?: string[] };
export type Bg = 'day' | 'hot' | 'garden' | 'rain' | 'village' | 'festival' | 'night' | 'road' | 'river' | 'room' | 'bathroom';
export interface StoryPage { bg: Bg; text: L; actors: Actor[]; act?: Interaction }
export interface StoryQuestion { q: L; choices: string[]; answer: string; labels?: Record<string, L> }
export interface Story { id: string; title: L; cover: string; pages: StoryPage[]; questions: StoryQuestion[] }

const A = (id: string, art: string, x: number, y: number, s = 1, extra: Partial<Actor> = {}): Actor => ({ id, art, x, y, s, ...extra });

/** Names for story props that are not Picture Fun items (used as answer labels / accessible names). */
export const PROP_NAMES: Record<string, L> = {
  pebble: L('Pebbles', 'గులకరాళ్ళు'), pot: L('Pot', 'కుండ'), ladoo: L('Ladoo', 'లడ్డూ'), plate: L('Plate', 'పళ్ళెం'), toothbrush: L('Toothbrush', 'టూత్ బ్రష్'),
  house: L('House', 'ఇల్లు'), child: L('Child', 'పిల్లవాడు'), child2: L('Friend', 'స్నేహితురాలు'), seed: L('Seed', 'విత్తనం'), sprout: L('Sprout', 'మొలక'),
  mangotree: L('Mango tree', 'మామిడి చెట్టు'), drops: L('Raindrops', 'వాన చినుకులు'), puddle: L('Puddle', 'నీటి గుంట'), paperboat: L('Paper boat', 'కాగితం పడవ'),
  kitten: L('Kitten', 'పిల్లి పిల్ల'), germ: L('Dirt', 'మురికి'), sparkle: L('Sparkle', 'మెరుపు'), sign: L('Bus stop', 'బస్ స్టాప్'), bird: L('Bird', 'పక్షి'),
  adult: L('Amma', 'అమ్మ'), water: L('Water', 'నీళ్ళు'), chick: L('Chick', 'కోడిపిల్ల'), box: L('Box', 'పెట్టె'),
};

export const STORIES: Story[] = [
  {
    id: 'thirsty-crow', title: L('The Thirsty Crow', 'దాహం వేసిన కాకి'), cover: 'crow',
    pages: [
      { bg: 'hot', text: L('It is a hot, hot day. The crow is very thirsty.', 'ఎండ చాలా ఎక్కువగా ఉంది. కాకికి చాలా దాహం వేసింది.'),
        actors: [A('sun', 'sun', 330, 55, 1.3), A('tree', 'tree', 70, 150, 1.5), A('crow', 'crow', 200, 180, 1.2)],
        act: { kind: 'tap', actor: 'sun', prompt: L('Tap the hot sun!', 'వేడి సూర్యుడిని తాకు!'), say: L('Phew! It is so hot!', 'అబ్బా! ఎంత వేడి!'), react: 'wiggle' } },
      { bg: 'day', text: L('The crow finds a pot. The water is far down.', 'కాకికి ఒక కుండ కనిపించింది. నీళ్ళు బాగా అడుగున ఉన్నాయి.'),
        actors: [A('crow', 'crow', 110, 150, 1.1), A('pot', 'pot', 260, 180, 1.4, { v: '1' })],
        act: { kind: 'tap', actor: 'pot', prompt: L('Tap the pot!', 'కుండను తాకు!'), say: L('The water is too low to drink!', 'నీళ్ళు తాగలేనంత కిందకి ఉన్నాయి!'), react: 'wiggle' } },
      { bg: 'day', text: L('The crow has an idea! It drops pebbles into the pot.', 'కాకికి ఉపాయం తట్టింది! కుండలో గులకరాళ్ళు వేసింది.'),
        actors: [A('crow', 'crow', 110, 130, 1.1), A('pot', 'pot', 270, 175, 1.4, { v: '1' }), A('p1', 'pebble', 60, 232, 0.8), A('p2', 'pebble', 120, 238, 0.8), A('p3', 'pebble', 175, 232, 0.8)],
        act: { kind: 'count', actors: ['p1', 'p2', 'p3'], each: 'hide', level: 'pot', prompt: L('Tap each pebble to drop it in!', 'ప్రతి గులకరాయిని తాకి కుండలో వెయ్యి!'), say: L('One, two, three! The water came up!', 'ఒకటి, రెండు, మూడు! నీళ్ళు పైకి వచ్చాయి!') } },
      { bg: 'day', text: L('Now the crow can drink. Ah, cool water!', 'ఇప్పుడు కాకి నీళ్ళు తాగగలదు. ఆహా, చల్లని నీళ్ళు!'),
        actors: [A('pot', 'pot', 250, 180, 1.4, { v: '4' }), A('crow', 'crow', 215, 105, 1.1)],
        act: { kind: 'tap', actor: 'crow', prompt: L('Tap the crow!', 'కాకిని తాకు!'), say: L('Caw, caw! Thank you!', 'కావ్, కావ్! ధన్యవాదాలు!'), react: 'jump' } },
      { bg: 'day', text: L('Think and try. You can do it too!', 'ఆలోచించు, ప్రయత్నించు. నువ్వూ చేయగలవు!'),
        actors: [A('sun', 'sun', 60, 55, 1), A('tree', 'tree', 330, 150, 1.4), A('crow', 'crow', 200, 140, 1.5)] },
    ],
    questions: [
      { q: L('Who was thirsty?', 'ఎవరికి దాహం వేసింది?'), choices: ['crow', 'cat', 'cow'], answer: 'crow' },
      { q: L('What did the crow drop in the pot?', 'కాకి కుండలో ఏమి వేసింది?'), choices: ['pebble', 'mango', 'ball'], answer: 'pebble' },
      { q: L('How many pebbles?', 'ఎన్ని గులకరాళ్ళు?'), choices: ['num:2', 'num:3', 'num:4'], answer: 'num:3' },
    ],
  },
  {
    id: 'mango-tree', title: L('The Little Mango Tree', 'చిన్ని మామిడి చెట్టు'), cover: 'mango',
    pages: [
      { bg: 'garden', text: L('Meena plants a mango seed in the soil.', 'మీనా మట్టిలో మామిడి టెంక నాటింది.'),
        actors: [A('child', 'child', 110, 170, 1.2, { v: 'girl' }), A('seed', 'seed', 260, 228, 1), A('water', 'drops', 260, 180, 0.7, { hidden: true })],
        act: { kind: 'tap', actor: 'seed', prompt: L('Tap the seed to water it!', 'విత్తనాన్ని తాకి నీళ్ళు పొయ్యి!'), say: L('Splash! Drink up, little seed.', 'చల్లగా నీళ్ళు తాగు, చిన్ని విత్తనమా!'), show: ['water'] } },
      { bg: 'garden', text: L('The sun shines. A tiny green sprout comes up!', 'ఎండ వచ్చింది. చిన్న పచ్చని మొలక బయటకు వచ్చింది!'),
        actors: [A('sun', 'sun', 320, 60, 1.2), A('seed', 'seed', 220, 228, 1), A('sprout', 'sprout', 220, 205, 1, { hidden: true })],
        act: { kind: 'tap', actor: 'sun', prompt: L('Tap the sun!', 'సూర్యుడిని తాకు!'), say: L('Hello, little sprout!', 'హలో, చిన్ని మొలకా!'), show: ['sprout'], hide: ['seed'] } },
      { bg: 'rain', text: L('Rain falls. The plant grows and grows.', 'వాన పడింది. మొక్క పెరుగుతూనే ఉంది.'),
        actors: [A('cloud', 'cloud', 220, 55, 1.6, { v: 'grey' }), A('drops', 'drops', 220, 120, 1, { hidden: true }), A('tree', 'mangotree', 220, 175, 1, { v: 'small' })],
        act: { kind: 'tap', actor: 'cloud', prompt: L('Tap the cloud for rain!', 'వాన కోసం మేఘాన్ని తాకు!'), say: L('Pitter, patter! Grow, plant, grow!', 'టప టప! పెరుగు మొక్కా, పెరుగు!'), show: ['drops'], set: { tree: 'mid' } } },
      { bg: 'garden', text: L('Years later, it is a big mango tree!', 'కొన్నేళ్ళకు అది పెద్ద మామిడి చెట్టు అయ్యింది!'),
        actors: [A('tree', 'mangotree', 230, 150, 1.6, { v: 'big' }), A('child', 'child', 80, 190, 1.1, { v: 'girl' })],
        act: { kind: 'tap', actor: 'tree', prompt: L('Tap the tree!', 'చెట్టును తాకు!'), say: L('The leaves go swish, swish!', 'ఆకులు గలగల!'), react: 'wiggle' } },
      { bg: 'garden', text: L('Look! Sweet mangoes! Count them with Meena.', 'చూడు! తీయని మామిడి పండ్లు! మీనాతో లెక్కపెట్టు.'),
        actors: [A('tree', 'mangotree', 230, 150, 1.6, { v: 'leaves' }), A('m1', 'mango', 185, 100, 0.55), A('m2', 'mango', 235, 75, 0.55), A('m3', 'mango', 280, 105, 0.55), A('m4', 'mango', 225, 130, 0.55), A('child', 'child', 70, 190, 1.1, { v: 'girl' })],
        act: { kind: 'count', actors: ['m1', 'm2', 'm3', 'm4'], each: 'mark', prompt: L('Tap each mango to count!', 'ప్రతి పండును తాకి లెక్కపెట్టు!'), say: L('Four mangoes!', 'నాలుగు మామిడి పండ్లు!') } },
      { bg: 'garden', text: L('Meena shares the mangoes with her friend.', 'మీనా స్నేహితుడితో పండ్లు పంచుకుంది.'),
        actors: [A('child', 'child', 130, 180, 1.2, { v: 'girl' }), A('mango', 'mango', 200, 190, 0.6), A('child2', 'child', 270, 180, 1.2, { v: 'boy' })],
        act: { kind: 'tap', actor: 'child2', prompt: L('Tap Meena’s friend!', 'మీనా స్నేహితుడిని తాకు!'), say: L('Thank you, Meena!', 'ధన్యవాదాలు, మీనా!'), react: 'jump' } },
    ],
    questions: [
      { q: L('What tree did Meena plant?', 'మీనా ఏ చెట్టు నాటింది?'), choices: ['mango', 'banana', 'apple'], answer: 'mango' },
      { q: L('How many mangoes?', 'ఎన్ని మామిడి పండ్లు?'), choices: ['num:3', 'num:4', 'num:5'], answer: 'num:4' },
      { q: L('What helps a plant grow?', 'మొక్క పెరగడానికి ఏమి కావాలి?'), choices: ['rain', 'ball', 'bus'], answer: 'rain' },
    ],
  },
  {
    id: 'rainy-day', title: L('A Rainy Day', 'వాన రోజు'), cover: 'umbrella',
    pages: [
      { bg: 'day', text: L('Ravi looks up. Big grey clouds are coming.', 'రవి పైకి చూశాడు. పెద్ద నల్లని మేఘాలు వస్తున్నాయి.'),
        actors: [A('cloud', 'cloud', 150, 60, 1.4, { v: 'grey' }), A('cloud2', 'cloud', 280, 50, 1.1, { v: 'grey' }), A('child', 'child', 130, 185, 1.2, { v: 'boy' })],
        act: { kind: 'tap', actor: 'cloud', prompt: L('Tap the big cloud!', 'పెద్ద మేఘాన్ని తాకు!'), say: L('Rumble, rumble!', 'గుడ గుడ, గుడ గుడ!'), react: 'wiggle' } },
      { bg: 'rain', text: L('Rain is falling. Ravi opens his umbrella.', 'వాన పడుతోంది. రవి గొడుగు తెరిచాడు.'),
        actors: [A('child', 'child', 190, 190, 1.2, { v: 'boy' }), A('umbrella', 'umbrella', 215, 120, 1.2, { v: 'closed' })],
        act: { kind: 'tap', actor: 'umbrella', prompt: L('Tap to open the umbrella!', 'గొడుగు తెరవడానికి తాకు!'), say: L('Now Ravi stays dry!', 'ఇప్పుడు రవి తడవడు!'), set: { umbrella: 'open' } } },
      { bg: 'rain', text: L('Splash! A frog jumps in the puddle.', 'చప్! ఒక కప్ప నీటి గుంటలో దూకింది.'),
        actors: [A('puddle', 'puddle', 260, 228, 1.3), A('frog', 'frog', 260, 205, 0.9), A('child', 'child', 100, 190, 1.1, { v: 'boy' }), A('umbrella', 'umbrella', 120, 118, 1.1, { v: 'open' })],
        act: { kind: 'tap', actor: 'frog', prompt: L('Tap the frog!', 'కప్పను తాకు!'), say: L('Croak, croak!', 'బెక బెక!'), react: 'jump' } },
      { bg: 'rain', text: L('Ravi makes a paper boat. Off it goes!', 'రవి కాగితం పడవ చేశాడు. అది తేలుతూ వెళ్ళింది!'),
        actors: [A('puddle', 'puddle', 240, 226, 2.2), A('boat', 'paperboat', 160, 212, 1), A('child', 'child', 70, 190, 1.1, { v: 'boy' })],
        act: { kind: 'tap', actor: 'boat', prompt: L('Tap the boat to make it sail!', 'పడవను తాకితే అది సాగుతుంది!'), say: L('Sail away, little boat!', 'సాగిపో, చిన్ని పడవా!'), move: { actor: 'boat', dx: 150, dy: 0 } } },
      { bg: 'day', text: L('The rain stops. Where is the sun?', 'వాన ఆగింది. సూర్యుడు ఎక్కడ?'),
        actors: [A('rainbow', 'rainbow', 240, 150, 2.2, { hidden: true }), A('sun', 'sun', 90, 60, 1.1), A('cloud', 'cloud', 90, 64, 1.5), A('child', 'child', 300, 190, 1.1, { v: 'boy' })],
        act: { kind: 'tap', actor: 'cloud', prompt: L('Tap the cloud to find the sun!', 'మేఘాన్ని తాకి సూర్యుడిని కనిపెట్టు!'), say: L('A rainbow! So many colours!', 'ఇంద్రధనుస్సు! ఎన్నో రంగులు!'), show: ['rainbow'], move: { actor: 'cloud', dx: 120, dy: -20 } } },
    ],
    questions: [
      { q: L('What did Ravi open?', 'రవి ఏమి తెరిచాడు?'), choices: ['umbrella', 'spoon', 'ball'], answer: 'umbrella' },
      { q: L('Who said croak?', '"బెక బెక" అని ఎవరు అన్నారు?'), choices: ['frog', 'cat', 'dog'], answer: 'frog' },
      { q: L('What came after the rain?', 'వాన తర్వాత ఏమి వచ్చింది?'), choices: ['rainbow', 'moon', 'bus'], answer: 'rainbow' },
    ],
  },
  {
    id: 'lost-kitten', title: L('The Lost Kitten', 'దారి తప్పిన పిల్లి పిల్ల'), cover: 'cat',
    pages: [
      { bg: 'village', text: L('A little kitten is lost. Where is Mother Cat?', 'ఒక చిన్న పిల్లి పిల్ల దారి తప్పింది. అమ్మ పిల్లి ఎక్కడ?'),
        actors: [A('kitten', 'cat', 200, 205, 0.8)],
        act: { kind: 'tap', actor: 'kitten', prompt: L('Tap the kitten!', 'పిల్లి పిల్లను తాకు!'), say: L('Meow? Meow?', 'మియావ్? మియావ్?'), react: 'wiggle' } },
      { bg: 'village', text: L('The kitten asks the dog.', 'పిల్లి పిల్ల కుక్కను అడిగింది.'),
        actors: [A('kitten', 'cat', 110, 210, 0.8), A('dog', 'dog', 270, 195, 1.2)],
        act: { kind: 'tap', actor: 'dog', prompt: L('Tap the dog!', 'కుక్కను తాకు!'), say: L('Bow-wow! She is not here.', 'భౌ భౌ! ఇక్కడ లేదు.'), react: 'jump' } },
      { bg: 'village', text: L('The kitten asks the cow.', 'పిల్లి పిల్ల ఆవును అడిగింది.'),
        actors: [A('kitten', 'cat', 110, 210, 0.8), A('cow', 'cow', 270, 185, 1.4)],
        act: { kind: 'tap', actor: 'cow', prompt: L('Tap the cow!', 'ఆవును తాకు!'), say: L('Moo! Not here. Ask the hen.', 'అంబా! ఇక్కడ లేదు. కోడిని అడుగు.'), react: 'wiggle' } },
      { bg: 'village', text: L('The kitten asks the hen.', 'పిల్లి పిల్ల కోడిని అడిగింది.'),
        actors: [A('kitten', 'cat', 110, 210, 0.8), A('hen', 'hen', 270, 205, 1.1)],
        act: { kind: 'tap', actor: 'hen', prompt: L('Tap the hen!', 'కోడిని తాకు!'), say: L('Cluck! Look near the red house!', 'కొక్కొక్కో! ఎర్ర ఇంటి దగ్గర చూడు!'), react: 'jump' } },
      { bg: 'village', text: L('Here is the red house. Knock, knock!', 'ఇదిగో ఎర్ర ఇల్లు. టక్, టక్!'),
        actors: [A('house', 'house', 250, 150, 1.6, { v: 'red' }), A('mother', 'cat', 335, 210, 1.1, { hidden: true }), A('kitten', 'cat', 90, 212, 0.8)],
        act: { kind: 'tap', actor: 'house', prompt: L('Tap the door to knock!', 'తలుపు తట్టడానికి తాకు!'), say: L('Mother Cat is here!', 'అమ్మ పిల్లి ఇక్కడే ఉంది!'), show: ['mother'] } },
      { bg: 'village', text: L('The kitten is home. So happy!', 'పిల్లి పిల్ల ఇంటికి చేరింది. ఎంతో సంతోషం!'),
        actors: [A('house', 'house', 300, 150, 1.4, { v: 'red' }), A('mother', 'cat', 190, 200, 1.3), A('kitten', 'cat', 120, 214, 0.8)],
        act: { kind: 'tap', actor: 'kitten', prompt: L('Tap the kitten!', 'పిల్లి పిల్లను తాకు!'), say: L('Purr, purr!', 'గుర్, గుర్!'), react: 'jump' } },
    ],
    questions: [
      { q: L('Who was lost?', 'ఎవరు దారి తప్పారు?'), choices: ['cat', 'dog', 'cow'], answer: 'cat', labels: { cat: L('Kitten', 'పిల్లి పిల్ల') } },
      { q: L('Who said moo?', '"అంబా" అని ఎవరు అన్నారు?'), choices: ['cow', 'hen', 'dog'], answer: 'cow' },
      { q: L('Where was Mother Cat?', 'అమ్మ పిల్లి ఎక్కడ ఉంది?'), choices: ['house', 'tree', 'bus'], answer: 'house' },
    ],
  },
  {
    id: 'diwali-ladoos', title: L('Ladoos for Diwali', 'దీపావళి లడ్డూలు'), cover: 'ladoo',
    pages: [
      { bg: 'festival', text: L('Grandma makes sweet ladoos for Diwali.', 'నానమ్మ దీపావళికి తీయని లడ్డూలు చేసింది.'),
        actors: [A('grandma', 'grandmother', 110, 175, 1.3), A('plate', 'plate', 270, 218, 1.4), A('l1', 'ladoo', 250, 206, 0.6, { hidden: true }), A('l2', 'ladoo', 290, 206, 0.6, { hidden: true }), A('l3', 'ladoo', 270, 190, 0.6, { hidden: true })],
        act: { kind: 'tap', actor: 'plate', prompt: L('Tap the plate!', 'పళ్ళెం తాకు!'), say: L('Yum! Round, sweet ladoos!', 'అబ్బ! గుండ్రని తీయని లడ్డూలు!'), show: ['l1', 'l2', 'l3'] } },
      { bg: 'festival', text: L('Let us light the lamps. Count them!', 'దీపాలు వెలిగిద్దాం. లెక్కపెట్టు!'),
        actors: [A('d1', 'diya', 80, 215, 0.9, { v: 'off' }), A('d2', 'diya', 160, 215, 0.9, { v: 'off' }), A('d3', 'diya', 240, 215, 0.9, { v: 'off' }), A('d4', 'diya', 320, 215, 0.9, { v: 'off' })],
        act: { kind: 'count', actors: ['d1', 'd2', 'd3', 'd4'], each: 'set', eachV: 'on', prompt: L('Tap each lamp to light it!', 'ప్రతి దీపాన్ని తాకి వెలిగించు!'), say: L('Four lamps! So bright!', 'నాలుగు దీపాలు! ఎంత వెలుగు!') } },
      { bg: 'festival', text: L('Friends come to play. Happy Diwali!', 'స్నేహితులు ఆడుకోడానికి వచ్చారు. దీపావళి శుభాకాంక్షలు!'),
        actors: [A('child', 'child', 130, 185, 1.2, { v: 'girl' }), A('child2', 'child', 270, 185, 1.2, { v: 'boy' }), A('d1', 'diya', 200, 225, 0.7, { v: 'on' })],
        act: { kind: 'tap', actor: 'child2', prompt: L('Tap the friend to say hello!', 'స్నేహితుడిని తాకి పలకరించు!'), say: L('Happy Diwali!', 'దీపావళి శుభాకాంక్షలు!'), react: 'jump' } },
      { bg: 'festival', text: L('Grandma shares the ladoos. Count with me!', 'నానమ్మ లడ్డూలు పంచింది. నాతో లెక్కపెట్టు!'),
        actors: [A('plate', 'plate', 200, 215, 2.4), A('l1', 'ladoo', 130, 200, 0.7), A('l2', 'ladoo', 165, 188, 0.7), A('l3', 'ladoo', 200, 200, 0.7), A('l4', 'ladoo', 235, 188, 0.7), A('l5', 'ladoo', 270, 200, 0.7)],
        act: { kind: 'count', actors: ['l1', 'l2', 'l3', 'l4', 'l5'], each: 'mark', prompt: L('Tap each ladoo to count!', 'ప్రతి లడ్డూను తాకి లెక్కపెట్టు!'), say: L('Five ladoos for five friends!', 'ఐదుగురు స్నేహితులకు ఐదు లడ్డూలు!') } },
      { bg: 'night', text: L('At night, the sky is full of lights.', 'రాత్రి ఆకాశం వెలుగులతో నిండింది.'),
        actors: [A('moon', 'moon', 320, 60, 1.1), A('s1', 'star', 80, 50, 0.5, { hidden: true }), A('s2', 'star', 160, 80, 0.4, { hidden: true }), A('s3', 'star', 230, 40, 0.5, { hidden: true }), A('house', 'house', 150, 175, 1.3, { v: 'lit' }), A('d1', 'diya', 260, 222, 0.7, { v: 'on' })],
        act: { kind: 'tap', actor: 'moon', prompt: L('Tap the moon!', 'చంద్రుడిని తాకు!'), say: L('Twinkle, twinkle, little stars!', 'మిణుకు మిణుకు చుక్కలు!'), show: ['s1', 's2', 's3'] } },
    ],
    questions: [
      { q: L('What did Grandma make?', 'నానమ్మ ఏమి చేసింది?'), choices: ['ladoo', 'carrot', 'bus'], answer: 'ladoo' },
      { q: L('How many lamps?', 'ఎన్ని దీపాలు?'), choices: ['num:3', 'num:4', 'num:5'], answer: 'num:4' },
      { q: L('Who made the ladoos?', 'లడ్డూలు ఎవరు చేశారు?'), choices: ['grandmother', 'doctor', 'teacher'], answer: 'grandmother' },
    ],
  },
  {
    id: 'bus-ride', title: L('Bus Ride to Grandma’s Village', 'నానమ్మ ఊరికి బస్సు ప్రయాణం'), cover: 'bus',
    pages: [
      { bg: 'road', text: L('Anu and Amma wait at the bus stop.', 'అను, అమ్మ బస్సు కోసం ఎదురు చూస్తున్నారు.'),
        actors: [A('sign', 'sign', 60, 170, 1.2), A('adult', 'adult', 120, 172, 1.3), A('child', 'child', 165, 195, 1, { v: 'girl' }), A('bus', 'bus', 300, 185, 1.6, { hidden: true })],
        act: { kind: 'tap', actor: 'sign', prompt: L('Tap the bus stop sign!', 'బస్ స్టాప్ బోర్డును తాకు!'), say: L('Beep, beep! Here comes the bus!', 'పీ పీ! బస్సు వచ్చింది!'), show: ['bus'] } },
      { bg: 'garden', text: L('The bus goes past green fields. Count the cows!', 'బస్సు పచ్చని పొలాల మీదుగా వెళ్తోంది. ఆవులను లెక్కపెట్టు!'),
        actors: [A('bus', 'bus', 90, 205, 1.3), A('c1', 'cow', 210, 165, 0.8), A('c2', 'cow', 280, 180, 0.8), A('c3', 'cow', 345, 160, 0.8)],
        act: { kind: 'count', actors: ['c1', 'c2', 'c3'], each: 'mark', prompt: L('Tap each cow to count!', 'ప్రతి ఆవును తాకి లెక్కపెట్టు!'), say: L('Three cows!', 'మూడు ఆవులు!') } },
      { bg: 'village', text: L('A farmer drives a tractor in the field.', 'ఒక రైతు పొలంలో ట్రాక్టర్ నడుపుతున్నాడు.'),
        actors: [A('tractor', 'tractor', 280, 200, 1.4), A('bus', 'bus', 80, 210, 1)],
        act: { kind: 'tap', actor: 'tractor', prompt: L('Tap the tractor!', 'ట్రాక్టర్‌ను తాకు!'), say: L('Put, put, put!', 'టక టక టక!'), move: { actor: 'tractor', dx: -80, dy: 0 } } },
      { bg: 'river', text: L('The bus crosses a bridge. A boat sails on the river.', 'బస్సు వంతెన దాటింది. నదిలో ఒక పడవ వెళ్తోంది.'),
        actors: [A('bus', 'bus', 200, 112, 1.1), A('boat', 'boat', 110, 215, 1.2)],
        act: { kind: 'tap', actor: 'boat', prompt: L('Tap the boat!', 'పడవను తాకు!'), say: L('Swish, swish! The boat sails.', 'పడవ నీళ్ళలో సాగుతోంది!'), move: { actor: 'boat', dx: 170, dy: 0 } } },
      { bg: 'village', text: L('Grandma is waiting in the village!', 'ఊళ్ళో నానమ్మ ఎదురు చూస్తోంది!'),
        actors: [A('house', 'house', 320, 150, 1.3), A('grandma', 'grandmother', 240, 180, 1.3), A('child', 'child', 120, 195, 1.1, { v: 'girl' })],
        act: { kind: 'tap', actor: 'grandma', prompt: L('Tap Grandma!', 'నానమ్మను తాకు!'), say: L('Welcome, my dear Anu!', 'రా రా, నా బంగారు అను!'), react: 'wiggle' } },
    ],
    questions: [
      { q: L('How did Anu go to the village?', 'అను ఊరికి దేనిలో వెళ్ళింది?'), choices: ['bus', 'aeroplane', 'boat'], answer: 'bus' },
      { q: L('How many cows?', 'ఎన్ని ఆవులు?'), choices: ['num:2', 'num:3', 'num:4'], answer: 'num:3' },
      { q: L('Who was waiting?', 'ఎవరు ఎదురు చూస్తున్నారు?'), choices: ['grandmother', 'doctor', 'teacher'], answer: 'grandmother' },
    ],
  },
  {
    id: 'peacock-dance', title: L('The Peacock’s Dance', 'నెమలి నాట్యం'), cover: 'peacock',
    pages: [
      { bg: 'garden', text: L('A peacock walks in the forest.', 'ఒక నెమలి అడవిలో నడుస్తోంది.'),
        actors: [A('tree', 'tree', 60, 150, 1.5), A('peacock', 'peacock', 220, 180, 1.4, { v: 'closed' })],
        act: { kind: 'tap', actor: 'peacock', prompt: L('Tap the peacock!', 'నెమలిని తాకు!'), say: L('Mi-aaow! Mi-aaow!', 'మియావ్! మియావ్!'), react: 'jump' } },
      { bg: 'day', text: L('Dark clouds come. The peacock is happy!', 'నల్లని మేఘాలు వచ్చాయి. నెమలికి సంతోషం!'),
        actors: [A('cloud', 'cloud', 200, 60, 1.6, { v: 'grey' }), A('peacock', 'peacock', 220, 185, 1.3, { v: 'closed' })],
        act: { kind: 'tap', actor: 'cloud', prompt: L('Tap the dark cloud!', 'నల్ల మేఘాన్ని తాకు!'), say: L('Rumble! Rain is coming!', 'గుడ గుడ! వాన వస్తోంది!'), react: 'wiggle' } },
      { bg: 'rain', text: L('The peacock opens its feathers wide.', 'నెమలి తన పింఛం విప్పింది.'),
        actors: [A('peacock', 'peacock', 200, 175, 1.6, { v: 'closed' })],
        act: { kind: 'tap', actor: 'peacock', prompt: L('Tap the peacock to open its feathers!', 'నెమలిని తాకి పింఛం విప్పించు!'), say: L('Wow! Blue and green feathers!', 'వావ్! నీలం, ఆకుపచ్చ ఈకలు!'), set: { peacock: 'open' } } },
      { bg: 'rain', text: L('It dances in the rain. Birds come to watch.', 'వానలో నాట్యం చేసింది. పక్షులు చూడటానికి వచ్చాయి.'),
        actors: [A('peacock', 'peacock', 200, 175, 1.5, { v: 'open' }), A('b1', 'bird', 60, 90, 0.8), A('b2', 'bird', 340, 80, 0.8, { flip: true }), A('b3', 'bird', 320, 200, 0.8, { flip: true })],
        act: { kind: 'count', actors: ['b1', 'b2', 'b3'], each: 'mark', prompt: L('Count the birds watching!', 'చూస్తున్న పక్షులను లెక్కపెట్టు!'), say: L('Three birds are watching!', 'మూడు పక్షులు చూస్తున్నాయి!') } },
      { bg: 'garden', text: L('The children clap. What a lovely dance!', 'పిల్లలు చప్పట్లు కొట్టారు. ఎంత చక్కని నాట్యం!'),
        actors: [A('peacock', 'peacock', 200, 160, 1.3, { v: 'open' }), A('child', 'child', 70, 195, 1, { v: 'girl' }), A('child2', 'child', 330, 195, 1, { v: 'boy' })],
        act: { kind: 'tap', actor: 'child', prompt: L('Tap to clap!', 'చప్పట్లు కొట్టడానికి తాకు!'), say: L('Clap, clap! Beautiful!', 'చప్పట్లు! చాలా అందంగా ఉంది!'), react: 'jump' } },
    ],
    questions: [
      { q: L('Who danced?', 'ఎవరు నాట్యం చేశారు?'), choices: ['peacock', 'crow', 'duck'], answer: 'peacock' },
      { q: L('When did the peacock dance?', 'నెమలి ఎప్పుడు నాట్యం చేసింది?'), choices: ['rain', 'moon', 'star'], answer: 'rain', labels: { rain: L('In the rain', 'వానలో'), moon: L('At night', 'రాత్రి'), star: L('With the stars', 'చుక్కలతో') } },
      { q: L('How many birds watched?', 'ఎన్ని పక్షులు చూశాయి?'), choices: ['num:2', 'num:3', 'num:4'], answer: 'num:3' },
    ],
  },
  {
    id: 'shiny-teeth', title: L('Shiny Teeth', 'మెరిసే పళ్ళు'), cover: 'teeth',
    pages: [
      { bg: 'room', text: L('Good morning! Kiran wakes up.', 'శుభోదయం! కిరణ్ నిద్ర లేచాడు.'),
        actors: [A('sun', 'sun', 92, 72, 0.8), A('child', 'child', 250, 185, 1.3, { v: 'boy' })],
        act: { kind: 'tap', actor: 'sun', prompt: L('Tap the sun!', 'సూర్యుడిని తాకు!'), say: L('Good morning, sun!', 'శుభోదయం, సూర్యుడా!'), react: 'wiggle' } },
      { bg: 'bathroom', text: L('Kiran takes his toothbrush and paste.', 'కిరణ్ బ్రష్, పేస్టు తీసుకున్నాడు.'),
        actors: [A('child', 'child', 110, 185, 1.2, { v: 'boy' }), A('brush', 'toothbrush', 260, 160, 1.5, { v: 'dry' })],
        act: { kind: 'tap', actor: 'brush', prompt: L('Tap the brush to add paste!', 'బ్రష్‌ను తాకి పేస్టు పెట్టు!'), say: L('Just a little paste, like a pea.', 'కొంచెం పేస్టు చాలు, బఠాణీ అంత.'), set: { brush: 'paste' } } },
      { bg: 'bathroom', text: L('Brush up and down, round and round.', 'పైకీ కిందికీ, గుండ్రంగా తోముకో.'),
        actors: [A('teeth', 'teeth', 200, 140, 2.2), A('g1', 'germ', 150, 125, 0.7), A('g2', 'germ', 205, 160, 0.7), A('g3', 'germ', 250, 125, 0.7)],
        act: { kind: 'count', actors: ['g1', 'g2', 'g3'], each: 'hide', prompt: L('Tap to brush away the dirt!', 'మురికిని తోమడానికి తాకు!'), say: L('Brush, brush! All clean!', 'బ్రష్ బ్రష్! అంతా శుభ్రం!') } },
      { bg: 'bathroom', text: L('Now rinse with water. Swish and spit!', 'ఇప్పుడు నీళ్ళతో పుక్కిలించు!'),
        actors: [A('cup', 'cup', 210, 175, 1.4), A('child', 'child', 100, 185, 1.1, { v: 'boy' })],
        act: { kind: 'tap', actor: 'cup', prompt: L('Tap the cup!', 'కప్పును తాకు!'), say: L('Gargle, gargle!', 'గుల గుల!'), react: 'wiggle' } },
      { bg: 'room', text: L('Look at Kiran’s shiny smile!', 'కిరణ్ మెరిసే నవ్వు చూడు!'),
        actors: [A('child', 'child', 200, 175, 1.6, { v: 'boy' }), A('sp1', 'sparkle', 150, 100, 0.6, { hidden: true }), A('sp2', 'sparkle', 255, 95, 0.5, { hidden: true })],
        act: { kind: 'tap', actor: 'child', prompt: L('Tap Kiran!', 'కిరణ్‌ను తాకు!'), say: L('Ting! Shiny teeth!', 'మెరిసే పళ్ళు!'), show: ['sp1', 'sp2'] } },
    ],
    questions: [
      { q: L('What did Kiran brush?', 'కిరణ్ ఏమి తోముకున్నాడు?'), choices: ['teeth', 'ear', 'nose'], answer: 'teeth' },
      { q: L('What do we brush with?', 'దేనితో పళ్ళు తోముకుంటాం?'), choices: ['toothbrush', 'spoon', 'ball'], answer: 'toothbrush' },
      { q: L('When did Kiran brush?', 'కిరణ్ ఎప్పుడు పళ్ళు తోముకున్నాడు?'), choices: ['sun', 'moon', 'rain'], answer: 'sun', labels: { sun: L('Morning', 'ఉదయం'), moon: L('Night', 'రాత్రి'), rain: L('In the rain', 'వానలో') } },
    ],
  },
];

export const STORY: Record<string, Story> = Object.fromEntries(STORIES.map((s) => [s.id, s]));

/** Words of a sentence for karaoke highlighting (keeps punctuation attached). */
export const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean);
/** Rough per-word timing (ms) used to move the highlight while narration plays. */
export function wordTimings(text: string, rate = 0.9): number[] {
  return wordsOf(text).map((w) => Math.round((260 + w.replace(/[^\p{L}\p{N}]/gu, '').length * 62 + (/[.,!?]$/.test(w) ? 220 : 0)) / rate));
}
