// Read-along passages: original rhymes, stories and passages (one per class per course).
// Telugu passages need native-speaker review for naturalness and age-appropriate vocabulary.
import type { ClassLevel } from '../../shared/levels';
import type { Item, Passage } from './types';
import { mcq } from './build';

const q = (id: string, prompt: string, choices: string[], answer: string, en?: string): Item => mcq(id, prompt, choices, answer, en ? { en } : {});

const te = (id: string, level: ClassLevel, kind: Passage['kind'], title: string, titleEn: string, lines: [string, string][], questions: Item[]): Passage =>
  ({ id, course: 'telugu', level, kind, title, titleEn, lines: lines.map((l) => l[0]), linesEn: lines.map((l) => l[1]), questions });
const en = (id: string, level: ClassLevel, kind: Passage['kind'], title: string, lines: string[], questions: Item[]): Passage =>
  ({ id, course: 'english', level, kind, title, lines, questions });

export const PASSAGES: Passage[] = [
  // ---------------- Telugu ----------------
  te('te-rhyme-1', 0, 'rhyme', 'అమ్మా ఆవూ', 'Mother and the cow', [
    ['అమ్మా అమ్మా చూడమ్మా,', 'Mother, mother, come and see,'],
    ['ఆవు వచ్చెను ఇంటికి.', 'the cow has come home to me.'],
    ['ఇల్లు నిండా పాలమ్మా,', 'The house is full of milk, mother,'],
    ['ఉడుత చూసెను చెట్టుపై.', 'the squirrel watches from the tree.'],
  ], [
    q('q1', 'ఇంటికి ఎవరు వచ్చారు?', ['ఆవు', 'పులి', 'చేప'], 'ఆవు', 'Who came home?'),
    q('q2', 'చెట్టుపై ఎవరు ఉన్నారు?', ['ఉడుత', 'ఏనుగు', 'ఒంటె'], 'ఉడుత', 'Who is on the tree?'),
  ]),
  te('te-rhyme-2', 1, 'rhyme', 'ఏనుగు ఏనుగు', 'Elephant, elephant', [
    ['ఏనుగు ఏనుగు నల్లని ఏనుగు,', 'Elephant, elephant, big dark elephant,'],
    ['ఎలుకను చూసి ఎగిరెను ఏనుగు!', 'saw a little mouse and jumped, the elephant!'],
    ['ఒంటె నవ్వెను ఓడలో నుండి,', 'The camel laughed from inside the ship,'],
    ['ఔరా ఔరా అనెను అందరు.', 'and everyone said, “Oh my, oh my!”'],
  ], [
    q('q1', 'ఏనుగు దేన్ని చూసి ఎగిరింది?', ['ఎలుకను', 'ఆవును', 'చేపను'], 'ఎలుకను', 'What did the elephant see and jump?'),
    q('q2', 'ఒంటె ఎక్కడ నుండి నవ్వింది?', ['ఓడలో నుండి', 'ఇంట్లో నుండి', 'చెట్టు మీద నుండి'], 'ఓడలో నుండి', 'From where did the camel laugh?'),
  ]),
  te('te-rhyme-3', 2, 'rhyme', 'పడవ పాట', 'The boat song', [
    ['పడవ పడవ పచ్చని పడవ,', 'Boat, boat, a green little boat,'],
    ['పక్షులు పాడెను పైన పైన.', 'birds were singing up above.'],
    ['మామిడి చెట్టున మంచి పండు,', 'On the mango tree, a good ripe fruit,'],
    ['హంస ఈదెను నీటిలోన.', 'the swan was swimming in the water.'],
  ], [
    q('q1', 'పడవ ఏ రంగులో ఉంది?', ['పచ్చని', 'ఎర్రని', 'నల్లని'], 'పచ్చని', 'What colour is the boat?'),
    q('q2', 'నీటిలో ఎవరు ఈదారు?', ['హంస', 'సింహం', 'లేడి'], 'హంస', 'Who swam in the water?'),
  ]),
  te('te-story-1', 3, 'story', 'బడికి వెళ్దాం', 'Let us go to school', [
    ['రాణి ఉదయాన్నే లేచింది.', 'Rani got up early in the morning.'],
    ['అమ్మ పాలు ఇచ్చింది.', 'Mother gave her milk.'],
    ['రాణి సంచి తీసుకుంది.', 'Rani took her bag.'],
    ['నాన్నతో కలిసి బడికి వెళ్ళింది.', 'She went to school with her father.'],
  ], [
    q('q1', 'రాణికి అమ్మ ఏమి ఇచ్చింది?', ['పాలు', 'పండు', 'పుస్తకం'], 'పాలు', 'What did mother give Rani?'),
    q('q2', 'రాణి ఎవరితో బడికి వెళ్ళింది?', ['నాన్నతో', 'అక్కతో', 'ఒంటరిగా'], 'నాన్నతో', 'With whom did Rani go to school?'),
    q('q3', 'రాణి ఎప్పుడు లేచింది?', ['ఉదయాన్నే', 'రాత్రి', 'మధ్యాహ్నం'], 'ఉదయాన్నే', 'When did Rani get up?'),
  ]),
  te('te-story-2', 4, 'story', 'చిలుక – కాకి', 'The parrot and the crow', [
    ['ఒక చెట్టు మీద చిలుక, కాకి ఉండేవి.', 'A parrot and a crow lived on a tree.'],
    ['ఒక రోజు బాగా వర్షం వచ్చింది.', 'One day it rained heavily.'],
    ['కాకి గూడు తడిసిపోయింది.', 'The crow’s nest got wet.'],
    ['చిలుక తన గూటిలో కాకికి చోటు ఇచ్చింది.', 'The parrot gave the crow a place in its own nest.'],
    ['అప్పటి నుండి రెండూ మంచి స్నేహితులు అయ్యాయి.', 'From then on they became good friends.'],
  ], [
    q('q1', 'చెట్టు మీద ఎవరు ఉండేవారు?', ['చిలుక, కాకి', 'కోతి, కుక్క', 'ఆవు, మేక'], 'చిలుక, కాకి', 'Who lived on the tree?'),
    q('q2', 'ఎవరి గూడు తడిసిపోయింది?', ['కాకి గూడు', 'చిలుక గూడు', 'రెండూ కాదు'], 'కాకి గూడు', 'Whose nest got wet?'),
    q('q3', 'ఈ కథ మనకు ఏం నేర్పుతుంది?', ['కష్టంలో సహాయం చేయాలి', 'వర్షంలో ఆడాలి', 'గూడు కట్టకూడదు'], 'కష్టంలో సహాయం చేయాలి', 'What does this story teach us?'),
  ]),
  te('te-story-3', 5, 'story', 'తెలివైన కుందేలు', 'The clever rabbit', [
    ['ఒక అడవిలో ఒక కుందేలు ఉండేది.', 'In a forest there lived a rabbit.'],
    ['ఒక రోజు దాహంతో అది చెరువు దగ్గరికి వెళ్ళింది.', 'One day, thirsty, it went to the pond.'],
    ['అక్కడ ఒక నక్క దాన్ని పట్టుకోవాలని చూసింది.', 'There a fox tried to catch it.'],
    ['కుందేలు “వెనుక సింహం వస్తోంది!” అని అరిచింది.', 'The rabbit shouted, “A lion is coming behind you!”'],
    ['నక్క భయపడి పారిపోయింది.', 'The fox got scared and ran away.'],
    ['కుందేలు హాయిగా నీళ్ళు తాగి ఇంటికి వెళ్ళింది.', 'The rabbit drank water happily and went home.'],
  ], [
    q('q1', 'కుందేలు చెరువు దగ్గరికి ఎందుకు వెళ్ళింది?', ['దాహంతో', 'ఆడుకోవడానికి', 'చేపల కోసం'], 'దాహంతో', 'Why did the rabbit go to the pond?'),
    q('q2', 'నక్క ఎందుకు పారిపోయింది?', ['సింహం వస్తోందని భయపడి', 'వర్షం వచ్చిందని', 'ఆకలి లేక'], 'సింహం వస్తోందని భయపడి', 'Why did the fox run away?'),
    q('q3', 'కుందేలు ఎలాంటిది?', ['తెలివైనది', 'సోమరిది', 'కోపిష్టిది'], 'తెలివైనది', 'What kind of animal was the rabbit?'),
  ]),
  te('te-story-4', 6, 'story', 'మొక్క నాటిన మీనా', 'Meena plants a sapling', [
    ['మీనా పుట్టినరోజు నాడు తాత ఒక వేప మొక్క ఇచ్చారు.', 'On Meena’s birthday, grandfather gave her a neem sapling.'],
    ['మీనా దాన్ని పెరట్లో నాటి రోజూ నీళ్ళు పోసింది.', 'Meena planted it in the backyard and watered it every day.'],
    ['కొన్నేళ్ళకు అది పెద్ద చెట్టు అయింది.', 'In a few years it became a big tree.'],
    ['వేసవిలో అందరూ ఆ చెట్టు నీడలో కూర్చునేవారు.', 'In summer everyone sat in its shade.'],
    ['పక్షులు దాని కొమ్మల మీద గూళ్ళు కట్టుకున్నాయి.', 'Birds built nests on its branches.'],
    ['“ఒక మొక్క ఎంత మేలు చేస్తుందో!” అని మీనా సంతోషించింది.', '“How much good one sapling does!” Meena thought happily.'],
  ], [
    q('q1', 'తాత మీనాకు ఏం ఇచ్చారు?', ['వేప మొక్క', 'పుస్తకం', 'బొమ్మ'], 'వేప మొక్క', 'What did grandfather give Meena?'),
    q('q2', 'మీనా మొక్కను ఎలా పెంచింది?', ['రోజూ నీళ్ళు పోసి', 'ఎండలో పెట్టి మరిచిపోయి', 'కుండీలో దాచి'], 'రోజూ నీళ్ళు పోసి', 'How did Meena look after the sapling?'),
    q('q3', 'చెట్టు వల్ల పక్షులకు కలిగిన మేలు ఏమిటి?', ['గూళ్ళు కట్టుకున్నాయి', 'నీళ్ళు తాగాయి', 'పాటలు నేర్చుకున్నాయి'], 'గూళ్ళు కట్టుకున్నాయి', 'How did the tree help the birds?'),
  ]),
  te('te-story-5', 7, 'story', 'నిజాయితీ', 'Honesty', [
    ['రవి బడి నుండి వస్తుండగా దారిలో ఒక సంచి కనిపించింది.', 'On his way home from school, Ravi found a bag on the road.'],
    ['అందులో డబ్బు, ఒక వృద్ధుడి మందుల చీటీ ఉన్నాయి.', 'Inside were money and an old man’s medicine prescription.'],
    ['చీటీ మీద ఉన్న పేరు చూసి రవి ఆ ఇంటికి వెళ్ళాడు.', 'Seeing the name on the slip, Ravi went to that house.'],
    ['వృద్ధుడు సంచి చూసి కళ్ళనీళ్ళు పెట్టుకున్నాడు.', 'The old man saw the bag and had tears in his eyes.'],
    ['“ఈ డబ్బు నా మందుల కోసం దాచుకున్నది, బాబూ” అన్నాడు.', '“I had saved this money for my medicines, child,” he said.'],
    ['మరుసటి రోజు ప్రధానోపాధ్యాయులు సభలో రవిని మెచ్చుకున్నారు.', 'The next day the headmaster praised Ravi in the assembly.'],
  ], [
    q('q1', 'రవికి దారిలో ఏం దొరికింది?', ['ఒక సంచి', 'ఒక కుక్కపిల్ల', 'ఒక పుస్తకం'], 'ఒక సంచి', 'What did Ravi find on the way?'),
    q('q2', 'యజమాని ఎవరో రవి ఎలా తెలుసుకున్నాడు?', ['మందుల చీటీ మీద పేరు చూసి', 'పోలీసులను అడిగి', 'ఊహించి'], 'మందుల చీటీ మీద పేరు చూసి', 'How did Ravi find out who the owner was?'),
    q('q3', 'ఈ కథలో రవి చూపిన గుణం ఏది?', ['నిజాయితీ', 'సోమరితనం', 'గర్వం'], 'నిజాయితీ', 'Which quality did Ravi show?'),
    q('q4', '“మెచ్చుకున్నారు” అంటే అర్థం?', ['పొగిడారు', 'తిట్టారు', 'మరిచిపోయారు'], 'పొగిడారు', 'What does మెచ్చుకున్నారు mean?'),
  ]),
  te('te-passage-6', 8, 'passage', 'మన పండుగ – సంక్రాంతి', 'Our festival – Sankranti', [
    ['సంక్రాంతి తెలుగు ప్రజలకు పెద్ద పండుగ.', 'Sankranti is a big festival for Telugu people.'],
    ['ఇది పంట చేతికి వచ్చిన ఆనందాన్ని తెలిపే పండుగ.', 'It celebrates the joy of the harvest.'],
    ['భోగి నాడు ఉదయాన్నే భోగి మంటలు వేస్తారు.', 'On Bhogi, bonfires are lit early in the morning.'],
    ['సంక్రాంతి నాడు ఇళ్ళ ముందు రంగురంగుల ముగ్గులు వేసి గొబ్బెమ్మలు పెడతారు.', 'On Sankranti, colourful muggulu are drawn in front of homes and gobbemmalu are placed on them.'],
    ['కనుమ నాడు పశువులను అలంకరించి వాటికి కృతజ్ఞత తెలుపుతారు.', 'On Kanuma, cattle are decorated and thanked.'],
    ['గాలిపటాలు ఎగరేయడం, పిండివంటలు చేయడం ఈ పండుగ ప్రత్యేకత.', 'Flying kites and making sweets are special to this festival.'],
  ], [
    q('q1', 'సంక్రాంతి దేనికి సంబంధించిన పండుగ?', ['పంట', 'వర్షం', 'చదువు'], 'పంట', 'Sankranti is connected with what?'),
    q('q2', 'కనుమ నాడు ఎవరికి కృతజ్ఞత తెలుపుతారు?', ['పశువులకు', 'గురువులకు', 'పక్షులకు'], 'పశువులకు', 'Whom do people thank on Kanuma?'),
    q('q3', 'భోగి మంటలు ఎప్పుడు వేస్తారు?', ['భోగి నాడు ఉదయాన్నే', 'కనుమ నాడు రాత్రి', 'సంక్రాంతి మధ్యాహ్నం'], 'భోగి నాడు ఉదయాన్నే', 'When are the Bhogi bonfires lit?'),
  ]),
  te('te-passage-7', 9, 'passage', 'నీటి పొదుపు', 'Saving water', [
    ['నీరు లేనిదే జీవం లేదు.', 'Without water there is no life.'],
    ['భూమి మీద ఉన్న నీటిలో తాగడానికి పనికొచ్చేది చాలా కొద్ది భాగం మాత్రమే.', 'Only a very small part of the water on earth is fit to drink.'],
    ['కుళాయి కారుతుంటే వెంటనే బాగుచేయించాలి.', 'A leaking tap should be repaired at once.'],
    ['వర్షపు నీటిని ఇంకుడు గుంతల ద్వారా భూమిలోకి పంపవచ్చు.', 'Rainwater can be sent into the ground through soak pits.'],
    ['పళ్ళు తోముకునేటప్పుడు కుళాయి కట్టేయడం ఒక చిన్న మంచి అలవాటు.', 'Closing the tap while brushing teeth is a small good habit.'],
    ['ప్రతి చుక్కనూ కాపాడితే రేపటి తరానికి నీరు మిగులుతుంది.', 'If we save every drop, water will remain for the next generation.'],
  ], [
    q('q1', 'భూమి మీద తాగడానికి పనికొచ్చే నీరు ఎంత?', ['చాలా కొద్ది భాగం', 'సగం', 'మొత్తం'], 'చాలా కొద్ది భాగం', 'How much of the earth’s water is drinkable?'),
    q('q2', 'వర్షపు నీటిని భూమిలోకి ఎలా పంపవచ్చు?', ['ఇంకుడు గుంతల ద్వారా', 'కుళాయి ద్వారా', 'బకెట్లలో నింపి'], 'ఇంకుడు గుంతల ద్వారా', 'How can rainwater be sent into the ground?'),
    q('q3', 'ఈ పాఠం ముఖ్య ఉద్దేశం ఏమిటి?', ['నీటిని పొదుపు చేయాలి', 'వర్షం రాకూడదు', 'కుళాయిలు కొనాలి'], 'నీటిని పొదుపు చేయాలి', 'What is the main idea of this passage?'),
  ]),
  te('te-passage-8', 10, 'passage', 'గ్రంథాలయం – జ్ఞాన భాండాగారం', 'The library – a treasury of knowledge', [
    ['గ్రంథాలయం అనేది పుస్తకాల నిలయం మాత్రమే కాదు, జ్ఞానానికి నిలయం.', 'A library is not only a house of books but a house of knowledge.'],
    ['అక్కడ కథలు, చరిత్ర, విజ్ఞానం, కవిత్వం – అన్నీ మనకోసం ఎదురుచూస్తుంటాయి.', 'Stories, history, science and poetry all wait there for us.'],
    ['ధనవంతుడైనా, పేదవాడైనా గ్రంథాలయంలో అందరికీ సమాన అవకాశం.', 'Rich or poor, everyone gets an equal chance in a library.'],
    ['చాలా మంది గొప్ప వ్యక్తులు చిన్నప్పుడు గ్రంథాలయాల్లోనే చదువుకున్నారు.', 'Many great people studied in libraries when they were young.'],
    ['గ్రంథాలయంలో నిశ్శబ్దం పాటించడం, పుస్తకాలను జాగ్రత్తగా వాడటం మన బాధ్యత.', 'Keeping silence and handling books with care in a library is our duty.'],
    ['రోజుకు కొన్ని పేజీలు చదివే అలవాటు జీవితాంతం తోడుంటుంది.', 'The habit of reading a few pages a day stays with us for life.'],
  ], [
    q('q1', 'రచయిత గ్రంథాలయాన్ని దేనితో పోల్చారు?', ['జ్ఞాన నిలయం', 'ఆట స్థలం', 'బజారు'], 'జ్ఞాన నిలయం', 'What does the writer call the library?'),
    q('q2', 'గ్రంథాలయంలో మన బాధ్యత ఏమిటి?', ['నిశ్శబ్దం పాటించి పుస్తకాలను జాగ్రత్తగా వాడటం', 'పుస్తకాలు ఇంటికి తీసుకెళ్ళి ఉంచేసుకోవడం', 'గట్టిగా మాట్లాడటం'], 'నిశ్శబ్దం పాటించి పుస్తకాలను జాగ్రత్తగా వాడటం', 'What is our duty in a library?'),
    q('q3', '“సమాన అవకాశం” అంటే?', ['అందరికీ ఒకేలా అవకాశం', 'కొందరికి మాత్రమే అవకాశం', 'ఎవరికీ అవకాశం లేదు'], 'అందరికీ ఒకేలా అవకాశం', 'What does “equal chance” mean?'),
  ]),
  te('te-passage-9', 11, 'passage', 'రైతే దేశానికి వెన్నెముక', 'The farmer is the backbone of the nation', [
    ['మనం తినే ప్రతి గింజ వెనుక ఒక రైతు శ్రమ ఉంది.', 'Behind every grain we eat is a farmer’s hard work.'],
    ['ఎండైనా, వానైనా రైతు పొలాన్ని విడిచిపెట్టడు.', 'Sun or rain, the farmer does not leave the field.'],
    ['అకాల వర్షాలు, కరువులు అతని ఆశలను కొన్నిసార్లు చెదరగొడతాయి.', 'Untimely rains and droughts sometimes scatter his hopes.'],
    ['అయినా మళ్ళీ విత్తనం చల్లి, ఆశతో ఆకాశం వైపు చూస్తాడు.', 'Yet he sows seeds again and looks to the sky with hope.'],
    ['నేడు బిందు సేద్యం, సేంద్రియ ఎరువులు వంటి కొత్త పద్ధతులు రైతుకు సహాయపడుతున్నాయి.', 'Today new methods like drip irrigation and organic manure help the farmer.'],
    ['అందుకే రైతును దేశానికి వెన్నెముక అంటారు; అతన్ని గౌరవించడం మన కర్తవ్యం.', 'That is why the farmer is called the backbone of the nation; respecting him is our duty.'],
  ], [
    q('q1', '“వెన్నెముక” అనే పదాన్ని ఇక్కడ ఏ అర్థంలో వాడారు?', ['ముఖ్యమైన ఆధారం', 'ఒక ఎముక మాత్రమే', 'ఒక పంట'], 'ముఖ్యమైన ఆధారం', 'In what sense is “backbone” used here?'),
    q('q2', 'రైతుకు సహాయపడే కొత్త పద్ధతి ఏది?', ['బిందు సేద్యం', 'భోగి మంటలు', 'గాలిపటాలు'], 'బిందు సేద్యం', 'Which new method helps farmers?'),
    q('q3', '“ఆశలను చెదరగొడతాయి” – ఇది ఏ భావాన్ని తెలుపుతుంది?', ['నిరాశ', 'ఆనందం', 'కోపం'], 'నిరాశ', 'What feeling does “scatter his hopes” show?'),
    q('q4', 'ఈ పాఠ్యభాగానికి తగిన మరో శీర్షిక ఏది?', ['అన్నదాత', 'నగర జీవితం', 'ఆటల పోటీ'], 'అన్నదాత', 'Which is another suitable title?'),
  ]),
  te('te-passage-10', 12, 'passage', 'మాతృభాష గొప్పదనం', 'The greatness of the mother tongue', [
    ['అమ్మ ఒడిలో మనం నేర్చుకునే మొదటి భాష మాతృభాష.', 'The first language we learn in our mother’s lap is our mother tongue.'],
    ['మన ఆలోచనలు, కలలు, భావాలు ఎక్కువగా మాతృభాషలోనే రూపుదిద్దుకుంటాయి.', 'Our thoughts, dreams and feelings mostly take shape in the mother tongue.'],
    ['తెలుగును “దేశభాషలందు తెలుగు లెస్స” అని ప్రశంసించారు.', 'Telugu was praised as “the finest among the languages of the land”.'],
    ['నన్నయ, తిక్కన, పోతన, వేమన వంటి కవులు తెలుగు సాహిత్యాన్ని సుసంపన్నం చేశారు.', 'Poets like Nannaya, Tikkana, Potana and Vemana enriched Telugu literature.'],
    ['ఇతర భాషలు నేర్చుకోవడం మంచిదే, కానీ మాతృభాషను మరిచిపోకూడదు.', 'Learning other languages is good, but we must not forget our mother tongue.'],
    ['మాతృభాషను మాట్లాడటం, చదవటం, రాయటం ద్వారానే దాన్ని కాపాడుకోగలం.', 'Only by speaking, reading and writing it can we preserve our mother tongue.'],
  ], [
    q('q1', 'మాతృభాష అంటే ఏమిటి?', ['అమ్మ దగ్గర నేర్చుకునే మొదటి భాష', 'బడిలో నేర్చుకునే రెండో భాష', 'విదేశీ భాష'], 'అమ్మ దగ్గర నేర్చుకునే మొదటి భాష', 'What is a mother tongue?'),
    q('q2', 'పాఠంలో పేర్కొన్న కవి ఎవరు?', ['పోతన', 'కాళిదాసు', 'షేక్స్‌పియర్'], 'పోతన', 'Which poet is named in the passage?'),
    q('q3', 'మాతృభాషను ఎలా కాపాడుకోవాలి?', ['మాట్లాడటం, చదవటం, రాయటం ద్వారా', 'ఇతర భాషలు మానేయడం ద్వారా', 'పుస్తకాలు దాచడం ద్వారా'], 'మాట్లాడటం, చదవటం, రాయటం ద్వారా', 'How should we preserve the mother tongue?'),
    q('q4', '“సుసంపన్నం” అంటే?', ['బాగా సమృద్ధిగా చేయడం', 'పేదగా చేయడం', 'మరచిపోవడం'], 'బాగా సమృద్ధిగా చేయడం', 'What does సుసంపన్నం mean?'),
  ]),

  // ---------------- English ----------------
  en('en-rhyme-1', 0, 'rhyme', 'Apple Up High', [
    'Apple, apple, up so high,',
    'Ball goes bouncing to the sky.',
    'Cat is sleeping, dog says “Hi!”',
    'Moon comes out to say goodbye.',
  ], [
    q('q1', 'What goes bouncing to the sky?', ['the ball', 'the cat', 'the moon'], 'the ball'),
    q('q2', 'Who is sleeping?', ['the cat', 'the dog', 'the apple'], 'the cat'),
  ]),
  en('en-rhyme-2', 1, 'rhyme', 'Little Red Kite', [
    'Little red kite, flying so free,',
    'Over the nest and over the tree.',
    'Queen in her garden, rabbit at play,',
    'Zebra is waving: “Have a nice day!”',
  ], [
    q('q1', 'What colour is the kite?', ['red', 'blue', 'green'], 'red'),
    q('q2', 'Who is waving?', ['the zebra', 'the queen', 'the rabbit'], 'the zebra'),
  ]),
  en('en-rhyme-3', 2, 'rhyme', 'The Busy Hen', [
    'The busy hen sat in her pen,',
    'She counted chicks, from one to ten.',
    'A duck went by, a pig said “Oink”,',
    'The hen just smiled and gave a wink.',
  ], [
    q('q1', 'How many chicks did the hen count?', ['ten', 'two', 'five'], 'ten'),
    q('q2', 'Who said “Oink”?', ['the pig', 'the duck', 'the hen'], 'the pig'),
  ]),
  en('en-story-1', 3, 'story', 'Sam and the Sun', [
    'Sam has a red cap.',
    'The sun is hot.',
    'Sam sits in the shade of a big tree.',
    'A cat sits with him.',
    'Sam and the cat nap.',
  ], [
    q('q1', 'What colour is Sam’s cap?', ['red', 'blue', 'black'], 'red'),
    q('q2', 'Where does Sam sit?', ['in the shade of a tree', 'in the sun', 'on a bus'], 'in the shade of a tree'),
    q('q3', 'Who sits with Sam?', ['a cat', 'a dog', 'a hen'], 'a cat'),
  ]),
  en('en-story-2', 4, 'story', 'The Lost Ball', [
    'Anu and Bunty were playing in the park.',
    'Bunty kicked the ball very hard.',
    'It flew over the wall and was gone.',
    'An old gardener found it near the roses.',
    'He gave it back with a smile.',
    'The children said, “Thank you very much!”',
  ], [
    q('q1', 'Where were the children playing?', ['in the park', 'at school', 'on the beach'], 'in the park'),
    q('q2', 'Who found the ball?', ['an old gardener', 'a teacher', 'a dog'], 'an old gardener'),
    q('q3', 'What did the children say?', ['Thank you very much!', 'Go away!', 'Good night!'], 'Thank you very much!'),
  ]),
  en('en-story-3', 5, 'story', 'Priya’s Garden', [
    'Priya planted tomato seeds in a small pot.',
    'Every morning she watered them before school.',
    'After a week, tiny green leaves peeped out.',
    'Soon the plants grew tall, and yellow flowers appeared.',
    'One day Priya saw small green tomatoes.',
    'In a few weeks they turned red, and the family ate them in a salad.',
  ], [
    q('q1', 'What did Priya plant?', ['tomato seeds', 'mango seeds', 'rose plants'], 'tomato seeds'),
    q('q2', 'When did she water the seeds?', ['every morning before school', 'only on Sundays', 'at midnight'], 'every morning before school'),
    q('q3', 'What came just before the tomatoes?', ['yellow flowers', 'red leaves', 'seeds'], 'yellow flowers'),
  ]),
  en('en-story-4', 6, 'story', 'Kiran and the Wallet', [
    'Kiran found a wallet on the bus seat.',
    'Inside were some money and a photo of an old woman.',
    'His friend whispered, “Keep it. No one will know.”',
    'But Kiran remembered his grandfather’s words: “What is not yours is never yours.”',
    'He gave the wallet to the conductor, who returned it to its owner.',
    'The owner, a nurse, thanked Kiran and said the photo was of her mother.',
  ], [
    q('q1', 'Where did Kiran find the wallet?', ['on the bus seat', 'in the classroom', 'at the market'], 'on the bus seat'),
    q('q2', 'Whose words did Kiran remember?', ['his grandfather’s', 'his friend’s', 'the conductor’s'], 'his grandfather’s'),
    q('q3', 'What does this story show about Kiran?', ['He is honest.', 'He is careless.', 'He is lazy.'], 'He is honest.'),
  ]),
  en('en-story-5', 7, 'story', 'The Science Fair', [
    'For the science fair, Rehan built a small windmill from paper cups and a pencil.',
    'At first, the blades would not turn.',
    'His sister suggested making the blades lighter and tilting them a little.',
    'Rehan tried again, and this time the windmill spun quickly in front of a fan.',
    'He connected it to a tiny motor, and a small bulb glowed.',
    'The judges liked how he had learnt from his mistakes.',
  ], [
    q('q1', 'What did Rehan build?', ['a windmill', 'a robot', 'a boat'], 'a windmill'),
    q('q2', 'Why did the windmill work the second time?', ['The blades were lighter and tilted.', 'He used a bigger pencil.', 'He painted it red.'], 'The blades were lighter and tilted.'),
    q('q3', 'What did the judges like?', ['He learnt from his mistakes.', 'It was the biggest model.', 'It was very colourful.'], 'He learnt from his mistakes.'),
  ]),
  en('en-passage-6', 8, 'passage', 'The Monsoon', [
    'Every June, people across India look up at the sky and wait for the monsoon.',
    'These seasonal winds carry moisture from the sea and bring heavy rain to most of the country.',
    'Farmers depend on the monsoon to water their fields of rice, cotton and pulses.',
    'Reservoirs fill up, wells are recharged and dry riverbeds come alive again.',
    'However, too much rain can cause floods, while a weak monsoon can lead to drought.',
    'That is why scientists study the monsoon carefully and share forecasts with farmers.',
  ], [
    q('q1', 'What do monsoon winds carry from the sea?', ['moisture', 'sand', 'snow'], 'moisture'),
    q('q2', 'Which problem can a weak monsoon cause?', ['drought', 'floods', 'earthquakes'], 'drought'),
    q('q3', 'The word “recharged” in the passage means…', ['filled again', 'emptied', 'closed'], 'filled again'),
  ]),
  en('en-passage-7', 9, 'passage', 'Hampi', [
    'On the banks of the Tungabhadra river lie the ruins of Hampi, once the capital of the Vijayanagara empire.',
    'Travellers in the fifteenth and sixteenth centuries described busy markets where gems and spices were sold.',
    'Today, visitors walk among stone temples, giant boulders and elegant pillared halls.',
    'The stone chariot at the Vittala temple is one of the most famous sights.',
    'Some pillars there are said to produce musical notes when tapped gently.',
    'Hampi is a UNESCO World Heritage Site, and protecting it is a shared responsibility.',
  ], [
    q('q1', 'Hampi was the capital of which empire?', ['Vijayanagara', 'Maurya', 'Mughal'], 'Vijayanagara'),
    q('q2', 'Which famous structure is mentioned at the Vittala temple?', ['a stone chariot', 'a glass palace', 'a clock tower'], 'a stone chariot'),
    q('q3', 'What is the writer’s message in the last line?', ['We must all help protect Hampi.', 'Hampi should be rebuilt.', 'Only tourists should visit Hampi.'], 'We must all help protect Hampi.'),
  ]),
  en('en-passage-8', 10, 'passage', 'Plastic in Our Oceans', [
    'Each year, millions of tonnes of plastic waste end up in the world’s oceans.',
    'Much of it begins as litter on streets, which rainwater washes into drains and rivers.',
    'Sea turtles mistake floating bags for jellyfish, and seabirds feed bottle caps to their chicks.',
    'Over time, plastic breaks into tiny pieces called microplastics, which can enter the food chain.',
    'Some coastal towns now organise beach clean-ups and ban single-use plastic.',
    'Experts say the most powerful solution is simple: use less plastic in the first place.',
  ], [
    q('q1', 'Why do sea turtles eat plastic bags?', ['They mistake them for jellyfish.', 'They like the colour.', 'They use them as nests.'], 'They mistake them for jellyfish.'),
    q('q2', 'What are microplastics?', ['tiny pieces of broken-down plastic', 'small fish', 'a kind of seaweed'], 'tiny pieces of broken-down plastic'),
    q('q3', 'According to experts, what is the most powerful solution?', ['using less plastic', 'building bigger drains', 'feeding seabirds'], 'using less plastic'),
    q('q4', 'Which word in the passage means “rubbish dropped in public places”?', ['litter', 'chain', 'coastal'], 'litter'),
  ]),
  en('en-passage-9', 11, 'passage', 'The Scientist Who Measured Light', [
    'In 1928, C. V. Raman discovered that when light passes through a transparent substance, a small part of it changes colour.',
    'This change, now called the Raman effect, revealed new information about the structure of molecules.',
    'Raman carried out his experiments in Kolkata with simple, inexpensive instruments.',
    'In 1930 he received the Nobel Prize in Physics, the first Asian to win it in a science.',
    'India celebrates National Science Day on 28 February to mark his discovery.',
    'His story reminds us that curiosity and careful observation matter more than costly equipment.',
  ], [
    q('q1', 'What did Raman discover?', ['Light scattered by a substance can change colour.', 'Light travels faster in water.', 'Sound can bend.'], 'Light scattered by a substance can change colour.'),
    q('q2', 'When is National Science Day celebrated?', ['28 February', '5 September', '14 November'], '28 February'),
    q('q3', 'What lesson does the writer draw?', ['Curiosity and observation matter more than costly equipment.', 'Only expensive labs make discoveries.', 'Science is easy.'], 'Curiosity and observation matter more than costly equipment.'),
  ]),
  en('en-passage-10', 12, 'passage', 'Digital Footprints', [
    'Every time we post a photo, write a comment or search online, we leave a digital footprint.',
    'Unlike footprints in sand, these traces do not wash away easily.',
    'Colleges and employers sometimes look at what people have shared publicly.',
    'A thoughtful post can show kindness and creativity, while a careless one can cause embarrassment years later.',
    'Protecting personal details such as your address and phone number also keeps you safe from strangers.',
    'Before you share, pause and ask: is it true, is it kind, and would I be comfortable if everyone saw it?',
  ], [
    q('q1', 'How are digital footprints different from footprints in sand?', ['They do not wash away easily.', 'They are invisible to everyone.', 'They disappear overnight.'], 'They do not wash away easily.'),
    q('q2', 'Which detail does the passage advise you to protect?', ['your phone number', 'your favourite colour', 'your school subjects'], 'your phone number'),
    q('q3', 'What is the tone of the last line?', ['advisory', 'angry', 'humorous'], 'advisory'),
    q('q4', 'The word “careless” is the opposite of…', ['thoughtful', 'public', 'creative'], 'thoughtful'),
  ]),
];
