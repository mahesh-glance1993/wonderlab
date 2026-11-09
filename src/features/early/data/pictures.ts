/*
 * Picture Fun vocabulary — Nursery / LKG / UKG.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  TELUGU REVIEW NEEDED: every `te` string in this file (names, sounds, set
 *  titles) was written without a native-speaker check. Before release, please
 *  have a native Telugu speaker (ideally a pre-primary teacher) review the
 *  words for naturalness and for the forms children actually hear at home
 *  (e.g. నానమ్మ vs అమ్మమ్మ, పాప vs పాపాయి, colour words with/without రంగు).
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Pure data — no React. Pictures are drawn in ../art.tsx (original SVG); items
 * listed in EMOJI_ONLY fall back to an emoji glyph inside an accessible frame.
 */

export interface L { en: string; te: string }
export const L = (en: string, te: string): L => ({ en, te });

export type Cat = 'fruit' | 'vegetable' | 'animal' | 'bird' | 'vehicle' | 'body' | 'home' | 'colour' | 'people' | 'nature';
export type ColourId = 'red' | 'yellow' | 'green' | 'orange' | 'blue' | 'purple' | 'brown' | 'white' | 'black' | 'pink';

export interface PicItem {
  id: string;
  en: string;
  te: string;
  cat: Cat;
  /** Animals only: where they live. */
  sub?: 'farm' | 'wild' | 'pet';
  /** The sound it makes, spoken by narration and always shown as text. */
  sound?: L;
  /** Main colour (used by Sort & Match colour rounds). */
  colour?: ColourId;
  /** Fallback glyph when no SVG drawing exists. */
  emoji: string;
}

const P = (id: string, en: string, te: string, cat: Cat, emoji: string, extra: Partial<PicItem> = {}): PicItem => ({ id, en, te, cat, emoji, ...extra });

export const PICTURES: PicItem[] = [
  // fruits
  P('mango', 'Mango', 'మామిడి పండు', 'fruit', '🥭', { colour: 'yellow' }),
  P('banana', 'Banana', 'అరటి పండు', 'fruit', '🍌', { colour: 'yellow' }),
  P('apple', 'Apple', 'ఆపిల్ పండు', 'fruit', '🍎', { colour: 'red' }),
  P('grapes', 'Grapes', 'ద్రాక్ష పండ్లు', 'fruit', '🍇', { colour: 'purple' }),
  P('orange', 'Orange', 'నారింజ పండు', 'fruit', '🍊', { colour: 'orange' }),
  P('watermelon', 'Watermelon', 'పుచ్చకాయ', 'fruit', '🍉', { colour: 'green' }),
  P('coconut', 'Coconut', 'కొబ్బరి కాయ', 'fruit', '🥥', { colour: 'brown' }),
  P('pineapple', 'Pineapple', 'అనాస పండు', 'fruit', '🍍', { colour: 'yellow' }),
  // vegetables
  P('tomato', 'Tomato', 'టమాటా', 'vegetable', '🍅', { colour: 'red' }),
  P('carrot', 'Carrot', 'క్యారెట్', 'vegetable', '🥕', { colour: 'orange' }),
  P('brinjal', 'Brinjal', 'వంకాయ', 'vegetable', '🍆', { colour: 'purple' }),
  P('potato', 'Potato', 'బంగాళదుంప', 'vegetable', '🥔', { colour: 'brown' }),
  P('onion', 'Onion', 'ఉల్లిపాయ', 'vegetable', '🧅', { colour: 'pink' }),
  P('chilli', 'Green chilli', 'పచ్చి మిరపకాయ', 'vegetable', '🌶️', { colour: 'green' }),
  P('corn', 'Corn', 'మొక్కజొన్న', 'vegetable', '🌽', { colour: 'yellow' }),
  P('ladyfinger', "Lady's finger", 'బెండకాయ', 'vegetable', '🥒', { colour: 'green' }),
  // animals — farm
  P('cow', 'Cow', 'ఆవు', 'animal', '🐄', { sub: 'farm', sound: L('Moo, moo!', 'అంబా, అంబా!'), colour: 'white' }),
  P('buffalo', 'Buffalo', 'గేదె', 'animal', '🐃', { sub: 'farm', colour: 'black' }),
  P('goat', 'Goat', 'మేక', 'animal', '🐐', { sub: 'farm', sound: L('Meh, meh!', 'మే, మే!'), colour: 'white' }),
  P('sheep', 'Sheep', 'గొర్రె', 'animal', '🐑', { sub: 'farm', sound: L('Baa, baa!', 'బే, బే!'), colour: 'white' }),
  P('horse', 'Horse', 'గుర్రం', 'animal', '🐎', { sub: 'farm', sound: L('Neigh!', 'హికీ హికీ!'), colour: 'brown' }),
  P('camel', 'Camel', 'ఒంటె', 'animal', '🐪', { sub: 'farm', colour: 'brown' }),
  // animals — pets
  P('dog', 'Dog', 'కుక్క', 'animal', '🐕', { sub: 'pet', sound: L('Bow-wow!', 'భౌ భౌ!'), colour: 'brown' }),
  P('cat', 'Cat', 'పిల్లి', 'animal', '🐈', { sub: 'pet', sound: L('Meow!', 'మియావ్!') }),
  P('rabbit', 'Rabbit', 'కుందేలు', 'animal', '🐇', { sub: 'pet', colour: 'white' }),
  // animals — wild
  P('elephant', 'Elephant', 'ఏనుగు', 'animal', '🐘', { sub: 'wild', sound: L('Pawoo! (trumpet)', 'ఘీంకారం!') }),
  P('lion', 'Lion', 'సింహం', 'animal', '🦁', { sub: 'wild', sound: L('Roar!', 'గర్ర్!') }),
  P('tiger', 'Tiger', 'పులి', 'animal', '🐅', { sub: 'wild', sound: L('Grrr!', 'గుర్ర్!'), colour: 'orange' }),
  P('monkey', 'Monkey', 'కోతి', 'animal', '🐒', { sub: 'wild', sound: L('Ooh-ooh, aah-aah!', 'ఊ ఊ, ఆ ఆ!'), colour: 'brown' }),
  P('bear', 'Bear', 'ఎలుగుబంటి', 'animal', '🐻', { sub: 'wild', colour: 'brown' }),
  P('deer', 'Deer', 'జింక', 'animal', '🦌', { sub: 'wild', colour: 'brown' }),
  P('frog', 'Frog', 'కప్ప', 'animal', '🐸', { sub: 'wild', sound: L('Croak, croak!', 'బెక బెక!'), colour: 'green' }),
  // birds
  P('crow', 'Crow', 'కాకి', 'bird', '🐦‍⬛', { sound: L('Caw, caw!', 'కావ్, కావ్!'), colour: 'black' }),
  P('parrot', 'Parrot', 'చిలుక', 'bird', '🦜', { colour: 'green' }),
  P('peacock', 'Peacock', 'నెమలి', 'bird', '🦚', { sound: L('Mi-aaow!', 'మియావ్ మియావ్!'), colour: 'blue' }),
  P('hen', 'Hen', 'కోడి', 'bird', '🐔', { sound: L('Cluck, cluck!', 'కొక్కొక్కో!'), colour: 'white' }),
  P('duck', 'Duck', 'బాతు', 'bird', '🦆', { sound: L('Quack, quack!', 'క్వాక్, క్వాక్!') }),
  P('owl', 'Owl', 'గుడ్లగూబ', 'bird', '🦉', { sound: L('Hoo, hoo!', 'ఊ, ఊ!'), colour: 'brown' }),
  P('sparrow', 'Sparrow', 'పిచ్చుక', 'bird', '🐦', { sound: L('Chirp, chirp!', 'కిచ కిచ!'), colour: 'brown' }),
  P('pigeon', 'Pigeon', 'పావురం', 'bird', '🕊️', { sound: L('Coo, coo!', 'గుటుర్ గుటుర్!') }),
  // vehicles
  P('bus', 'Bus', 'బస్సు', 'vehicle', '🚌', { sound: L('Beep, beep!', 'పీ పీ!'), colour: 'red' }),
  P('car', 'Car', 'కారు', 'vehicle', '🚗', { colour: 'blue' }),
  P('auto', 'Auto rickshaw', 'ఆటో', 'vehicle', '🛺', { sound: L('Put-put-put!', 'టుర్ర్ టుర్ర్!'), colour: 'yellow' }),
  P('bicycle', 'Bicycle', 'సైకిల్', 'vehicle', '🚲', { sound: L('Tring, tring!', 'ట్రింగ్ ట్రింగ్!') }),
  P('train', 'Train', 'రైలు', 'vehicle', '🚆', { sound: L('Choo-choo!', 'కూ చుక్ చుక్!') }),
  P('aeroplane', 'Aeroplane', 'విమానం', 'vehicle', '✈️', { sound: L('Zoom!', 'ఝుమ్!') }),
  P('boat', 'Boat', 'పడవ', 'vehicle', '⛵', {}),
  P('tractor', 'Tractor', 'ట్రాక్టర్', 'vehicle', '🚜', { colour: 'green' }),
  // body parts
  P('eye', 'Eye', 'కన్ను', 'body', '👁️'),
  P('ear', 'Ear', 'చెవి', 'body', '👂'),
  P('nose', 'Nose', 'ముక్కు', 'body', '👃'),
  P('mouth', 'Mouth', 'నోరు', 'body', '👄'),
  P('hand', 'Hand', 'చేయి', 'body', '✋'),
  P('foot', 'Foot', 'పాదం', 'body', '🦶'),
  P('teeth', 'Teeth', 'పళ్ళు', 'body', '🦷'),
  // things at home
  P('chair', 'Chair', 'కుర్చీ', 'home', '🪑', { colour: 'brown' }),
  P('bed', 'Bed', 'మంచం', 'home', '🛏️'),
  P('cup', 'Cup', 'కప్పు', 'home', '☕', { colour: 'white' }),
  P('spoon', 'Spoon', 'చెంచా', 'home', '🥄'),
  P('clock', 'Clock', 'గడియారం', 'home', '🕰️'),
  P('fan', 'Fan', 'ఫ్యాను', 'home', '🌀'),
  P('umbrella', 'Umbrella', 'గొడుగు', 'home', '☂️', { colour: 'blue' }),
  P('diya', 'Lamp', 'దీపం', 'home', '🪔', { colour: 'orange' }),
  P('ball', 'Ball', 'బంతి', 'home', '⚽', { colour: 'red' }),
  // colours
  P('c-red', 'Red', 'ఎరుపు', 'colour', '🟥', { colour: 'red' }),
  P('c-blue', 'Blue', 'నీలం', 'colour', '🟦', { colour: 'blue' }),
  P('c-green', 'Green', 'ఆకుపచ్చ', 'colour', '🟩', { colour: 'green' }),
  P('c-yellow', 'Yellow', 'పసుపు', 'colour', '🟨', { colour: 'yellow' }),
  P('c-orange', 'Orange colour', 'నారింజ రంగు', 'colour', '🟧', { colour: 'orange' }),
  P('c-purple', 'Purple', 'ఊదా రంగు', 'colour', '🟪', { colour: 'purple' }),
  P('c-pink', 'Pink', 'గులాబీ రంగు', 'colour', '🌸', { colour: 'pink' }),
  P('c-brown', 'Brown', 'గోధుమ రంగు', 'colour', '🟫', { colour: 'brown' }),
  P('c-black', 'Black', 'నలుపు', 'colour', '⬛', { colour: 'black' }),
  P('c-white', 'White', 'తెలుపు', 'colour', '⬜', { colour: 'white' }),
  // family and people
  P('mother', 'Mother', 'అమ్మ', 'people', '👩'),
  P('father', 'Father', 'నాన్న', 'people', '👨'),
  P('grandmother', 'Grandmother', 'నానమ్మ', 'people', '👵'),
  P('grandfather', 'Grandfather', 'తాతయ్య', 'people', '👴'),
  P('baby', 'Baby', 'పాపాయి', 'people', '👶'),
  P('teacher', 'Teacher', 'టీచర్', 'people', '🧑‍🏫'),
  P('doctor', 'Doctor', 'డాక్టర్', 'people', '🧑‍⚕️'),
  P('farmer', 'Farmer', 'రైతు', 'people', '🧑‍🌾'),
  // nature
  P('sun', 'Sun', 'సూర్యుడు', 'nature', '☀️', { colour: 'yellow' }),
  P('moon', 'Moon', 'చంద్రుడు', 'nature', '🌙', { colour: 'yellow' }),
  P('star', 'Star', 'నక్షత్రం', 'nature', '⭐', { colour: 'yellow' }),
  P('tree', 'Tree', 'చెట్టు', 'nature', '🌳', { colour: 'green' }),
  P('flower', 'Flower', 'పువ్వు', 'nature', '🌼', { colour: 'pink' }),
  P('rain', 'Rain', 'వాన', 'nature', '🌧️'),
  P('cloud', 'Cloud', 'మేఘం', 'nature', '☁️', { colour: 'white' }),
  P('rainbow', 'Rainbow', 'ఇంద్రధనుస్సు', 'nature', '🌈'),
  P('mountain', 'Hill', 'కొండ', 'nature', '⛰️'),
];

export const PIC: Record<string, PicItem> = Object.fromEntries(PICTURES.map((p) => [p.id, p]));

export interface PicSet { id: string; title: L; cats: Cat[]; cover: string }
/** Themed sets shown in Picture Fun. */
export const PIC_SETS: PicSet[] = [
  { id: 'fruits', title: L('Fruits', 'పండ్లు'), cats: ['fruit'], cover: 'mango' },
  { id: 'vegetables', title: L('Vegetables', 'కూరగాయలు'), cats: ['vegetable'], cover: 'carrot' },
  { id: 'animals', title: L('Animals', 'జంతువులు'), cats: ['animal'], cover: 'elephant' },
  { id: 'birds', title: L('Birds', 'పక్షులు'), cats: ['bird'], cover: 'parrot' },
  { id: 'vehicles', title: L('Vehicles', 'వాహనాలు'), cats: ['vehicle'], cover: 'bus' },
  { id: 'body', title: L('My body', 'నా శరీరం'), cats: ['body'], cover: 'eye' },
  { id: 'home', title: L('At home', 'ఇంట్లో'), cats: ['home'], cover: 'cup' },
  { id: 'colours', title: L('Colours', 'రంగులు'), cats: ['colour'], cover: 'c-red' },
  { id: 'people', title: L('Family & helpers', 'కుటుంబం, సహాయకులు'), cats: ['people'], cover: 'grandmother' },
  { id: 'nature', title: L('Nature', 'ప్రకృతి'), cats: ['nature'], cover: 'sun' },
];

export const CAT_NAMES: Record<Cat, L> = {
  fruit: L('fruits', 'పండ్లు'), vegetable: L('vegetables', 'కూరగాయలు'), animal: L('animals', 'జంతువులు'), bird: L('birds', 'పక్షులు'),
  vehicle: L('vehicles', 'వాహనాలు'), body: L('body parts', 'శరీర భాగాలు'), home: L('things at home', 'ఇంటి వస్తువులు'),
  colour: L('colours', 'రంగులు'), people: L('people', 'మనుషులు'), nature: L('nature', 'ప్రకృతి'),
};

export const COLOUR_NAMES: Record<ColourId, L & { hex: string }> = {
  red: { en: 'Red', te: 'ఎరుపు', hex: '#C8453B' },
  yellow: { en: 'Yellow', te: 'పసుపు', hex: '#E9B829' },
  green: { en: 'Green', te: 'ఆకుపచ్చ', hex: '#4E9A4B' },
  orange: { en: 'Orange', te: 'నారింజ రంగు', hex: '#E8862E' },
  blue: { en: 'Blue', te: 'నీలం', hex: '#3E78C2' },
  purple: { en: 'Purple', te: 'ఊదా రంగు', hex: '#7E4FA6' },
  brown: { en: 'Brown', te: 'గోధుమ రంగు', hex: '#8A5A36' },
  white: { en: 'White', te: 'తెలుపు', hex: '#F7F4EC' },
  black: { en: 'Black', te: 'నలుపు', hex: '#2C2C2C' },
  pink: { en: 'Pink', te: 'గులాబీ రంగు', hex: '#E58FB0' },
};

export const itemsIn = (set: PicSet) => PICTURES.filter((p) => set.cats.includes(p.cat));

/** Mother & baby pairs for Sort & Match (baby art = mother art drawn small, chick has its own glyph). */
export interface Pair { mother: string; baby: L & { id: string } }
export const MOTHER_BABY: Pair[] = [
  { mother: 'cow', baby: { id: 'calf', en: 'Calf', te: 'దూడ' } },
  { mother: 'hen', baby: { id: 'chick', en: 'Chick', te: 'కోడిపిల్ల' } },
  { mother: 'dog', baby: { id: 'puppy', en: 'Puppy', te: 'కుక్కపిల్ల' } },
  { mother: 'cat', baby: { id: 'kitten', en: 'Kitten', te: 'పిల్లి పిల్ల' } },
  { mother: 'goat', baby: { id: 'kid', en: 'Baby goat', te: 'మేకపిల్ల' } },
  { mother: 'duck', baby: { id: 'duckling', en: 'Duckling', te: 'బాతుపిల్ల' } },
  { mother: 'elephant', baby: { id: 'elephant-calf', en: 'Baby elephant', te: 'ఏనుగు పిల్ల' } },
  { mother: 'sheep', baby: { id: 'lamb', en: 'Lamb', te: 'గొర్రెపిల్ల' } },
];
