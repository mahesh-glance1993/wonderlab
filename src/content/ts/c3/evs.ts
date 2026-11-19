// Telangana SCERT Class 3 — evs. Original teaching aligned to the official chapter list (src/content/ts/books.ts).
// One unit per textbook chapter (ids ts3.evs.ch<n>); objectives ts3.evs.<topic>.<skill>.
// Written for an 8-year-old: short sentences, everyday Telangana life, pictures first.
// Every learner-facing string is bilingual, written as 'English | తెలుగు' (Telugu needs native-speaker review).
// Templates use only the Rng they are given.
import {
  tp, ex, p, h, tip, keys, remember, photo, choose, matching, ordering, tapAll, L, type USpec, type TSpec, type ExSpec,
} from '../../lib/kit';
import type { Block, Localized } from '../../../shared/content';
import { tsSrc } from '../books';

// ------------------------------------------------------------------ bilingual helpers
const SEP = ' | ';
/** 'English | తెలుగు' → { en, te }. Throws when the Telugu half is missing (caught by the content tests). */
const T = (s: string): Localized => {
  const i = s.indexOf(SEP);
  if (i < 0) throw new Error(`Telugu missing: ${s}`);
  return L(s.slice(0, i).trim(), s.slice(i + SEP.length).trim());
};
const P = (s: string): Block => { const x = T(s); return p(x.en, x.te); };
const H = (s: string): Block => { const x = T(s); return h(x.en, x.te); };
const TIP = (s: string): Block => { const x = T(s); return tip(x.en, x.te); };
const REM = (s: string): Block => { const x = T(s); return remember(x.en, x.te); };
const KEYS = (...s: string[]): Block => keys(...s.map(T));
const PIC = (emoji: string, caption: string): Block => photo(emoji, T(caption));
const EX = (q: string, steps: string[], a: string, emoji?: string): ExSpec => ex(T(q), steps.map(T), T(a), emoji ? { kind: 'emoji', text: emoji } : undefined);
const list = (xs: Localized[], k: 'en' | 'te') => xs.map((x) => x[k] ?? x.en).join(', ');

const src = (ch: number) => tsSrc(3, 'evs', ch);

/** concept-bank entry: question, answer, wrong options, hints, solution, why-wrong, optional emoji picture */
type B = [q: string, a: string, w: string[], hints: string[], sol: string, why: string, v?: string];
/** a multiple-choice template drawing one question from a bank (>= 5 entries) */
const bank = (key: string, entries: B[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, a, w, hs, sol, why, v] = r.pick(entries);
  return {
    type: 'mcq', prompt: T(q), ...choose(r, T(a), w.map(T)), hints: hs.map(T), solution: [T(sol)],
    mistakes: [{ when: 'wrong', explain: T(why) }], ...(v ? { visual: { kind: 'emoji' as const, text: v } } : {}),
  };
}, d);
/** tap-all (sorting) template: picks 2–3 items that belong and 2–3 that do not */
const tapT = (key: string, prompt: string, yes: string[], no: string[], hints: string[], why: string, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const y = r.shuffle(yes).slice(0, r.int(2, 3)).map(T), n = r.shuffle(no).slice(0, r.int(2, 3)).map(T);
  return {
    type: 'tap', prompt: T(prompt), ...tapAll(r, [...y.map((label) => ({ label, ok: true })), ...n.map((label) => ({ label, ok: false }))]),
    hints: hints.map(T),
    solution: [L(`Yes: ${list(y, 'en')}.`, `అవును: ${list(y, 'te')}.`), L(`No: ${list(n, 'en')}.`, `కాదు: ${list(n, 'te')}.`)],
    mistakes: [{ when: 'wrong', explain: T(why) }],
  };
}, d);
/** matching template: picks 4 pairs; the picture strip shows which set was drawn */
const matchT = (key: string, prompt: string, pool: [left: string, right: string, emoji: string][], hints: string[], why: string, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pick = r.shuffle(pool).slice(0, 4);
  return {
    type: 'match', prompt: T(prompt), visual: { kind: 'emoji', text: pick.map((x) => x[2]).join(' ') },
    ...matching(r, pick.map(([a, b]) => [T(a), T(b)] as [Localized, Localized])), hints: hints.map(T),
    solution: pick.map(([a, b]) => { const x = T(a), y = T(b); return L(`${x.en} → ${y.en}`, `${x.te} → ${y.te}`); }),
    mistakes: [{ when: 'wrong', explain: T(why) }],
  };
}, d);
/** ordering template over a fixed sequence */
const orderT = (key: string, prompt: string, seq: string[], hints: string[], why: string, d: 1 | 2 | 3 = 2): TSpec => tp(key, (r) => {
  const s = seq.map(T);
  return {
    type: 'order', prompt: T(prompt), ...ordering(r, s), hints: hints.map(T),
    solution: [L(s.map((x) => x.en).join(' → '), s.map((x) => x.te ?? x.en).join(' → '))], mistakes: [{ when: 'wrong', explain: T(why) }],
  };
}, d);

// ================================================================== CH 1 Family
const ch1: USpec = {
  id: 'ts3.evs.ch1', subject: 'evs', title: T('Family | కుటుంబం'), source: src(1),
  objectives: [
    {
      id: 'ts3.evs.family.members', title: T('My family members | నా కుటుంబ సభ్యులు'),
      intro: [
        H('Who is in my family? | నా కుటుంబంలో ఎవరెవరు ఉన్నారు?'),
        P('Sravya lives with her amma, nanna, little brother and grandparents. They eat together and help each other. They are her family. | శ్రావ్య తన అమ్మ, నాన్న, తమ్ముడు, తాతయ్య, నానమ్మలతో ఉంటుంది. వాళ్లు కలిసి తింటారు, ఒకరికొకరు సాయం చేసుకుంటారు. వాళ్లే ఆమె కుటుంబం.'),
        PIC('👵', 'Grandmother tells lovely stories at night. | నానమ్మ రాత్రి మంచి కథలు చెబుతుంది.'),
        PIC('👶', 'A baby is the youngest member of the family. | పాపాయి కుటుంబంలో అందరికంటే చిన్నది.'),
        KEYS('Father\'s mother is nanamma; father\'s father is tatayya. | నాన్న అమ్మ నానమ్మ; నాన్న నాన్న తాతయ్య.',
          'Mother\'s mother is ammamma. | అమ్మ అమ్మ అమ్మమ్మ.',
          'Father\'s brother is babai or pedananna. | నాన్న తమ్ముడు బాబాయి, అన్న పెదనాన్న.',
          'Mother\'s brother is mavayya. | అమ్మ తమ్ముడు లేదా అన్న మావయ్య.'),
        REM('A family is people who love and care for each other. | ఒకరినొకరు ప్రేమించి, చూసుకునే వాళ్లే కుటుంబం.'),
        TIP('Draw your family. Write each person\'s name under the picture. | నీ కుటుంబం బొమ్మ గీయి. ఒక్కొక్కరి బొమ్మ కింద వారి పేరు రాయి.'),
      ],
      examples: [
        EX('Who is your mother\'s mother? | నీ అమ్మ వాళ్ల అమ్మ ఎవరు?', ['She is your mother\'s mother. | ఆమె అమ్మకు అమ్మ.', 'In Telugu we call her ammamma. | తెలుగులో ఆమెను అమ్మమ్మ అంటాం.'], 'Ammamma (grandmother) | అమ్మమ్మ', '👵'),
        EX('Ravi\'s father has a younger brother. What does Ravi call him? | రవి నాన్నకు ఒక తమ్ముడు ఉన్నాడు. రవి ఆయనను ఏమని పిలుస్తాడు?', ['Father\'s younger brother. | నాన్న తమ్ముడు.'], 'Babai (uncle) | బాబాయి', '👨'),
      ],
      practice: [
        bank('who', [
          ['Who is your father\'s mother? | నీ నాన్న వాళ్ల అమ్మ ఎవరు?', 'Nanamma | నానమ్మ', ['Ammamma | అమ్మమ్మ', 'Atta | అత్త', 'Akka | అక్క'], ['Think of father\'s side. | నాన్న వైపు ఆలోచించు.', 'Father calls her amma. | నాన్న ఆమెను అమ్మా అంటాడు.'], 'Father\'s mother is nanamma. | నాన్న అమ్మ నానమ్మ.', 'Ammamma is mother\'s mother. | అమ్మమ్మ అంటే అమ్మ వాళ్ల అమ్మ.', '👵'],
          ['Who is your mother\'s brother? | నీ అమ్మ వాళ్ల అన్న లేదా తమ్ముడు ఎవరు?', 'Mavayya | మావయ్య', ['Babai | బాబాయి', 'Tatayya | తాతయ్య', 'Anna | అన్న'], ['Think of mother\'s side. | అమ్మ వైపు ఆలోచించు.', 'He brings gifts at festivals! | పండుగలకు కానుకలు తెస్తాడు!'], 'Mother\'s brother is mavayya. | అమ్మ సోదరుడు మావయ్య.', 'Babai is father\'s younger brother. | బాబాయి అంటే నాన్న తమ్ముడు.', '👨'],
          ['Who is the youngest in this family: grandfather, father, baby? | ఈ కుటుంబంలో అందరికంటే చిన్న ఎవరు: తాతయ్య, నాన్న, పాపాయి?', 'Baby | పాపాయి', ['Grandfather | తాతయ్య', 'Father | నాన్న'], ['Who was born last? | చివరగా పుట్టినది ఎవరు?', 'Who cannot walk yet? | ఇంకా నడవలేనిది ఎవరు?'], 'The baby is the youngest. | పాపాయి అందరికంటే చిన్నది.', 'Grandfather is the oldest, not the youngest. | తాతయ్య పెద్దవారు, చిన్నవారు కాదు.', '👶'],
          ['Who is the oldest: grandmother, mother, sister? | అందరికంటే పెద్దవారు ఎవరు: నానమ్మ, అమ్మ, అక్క?', 'Grandmother | నానమ్మ', ['Mother | అమ్మ', 'Sister | అక్క'], ['Who is mother\'s or father\'s mother? | అమ్మ లేదా నాన్న వాళ్ల అమ్మ ఎవరు?', 'Grandparents are oldest. | తాతయ్య నానమ్మలు అందరికంటే పెద్దవారు.'], 'Grandmother is the oldest. | నానమ్మ అందరికంటే పెద్దవారు.', 'Mother is younger than grandmother. | అమ్మ నానమ్మ కంటే చిన్నది.', '👵'],
          ['Your father\'s sister is your… | నీ నాన్న వాళ్ల అక్క లేదా చెల్లెలు నీకు…', 'Atta (aunt) | అత్త', ['Pinni | పిన్ని', 'Ammamma | అమ్మమ్మ', 'Chelli | చెల్లి'], ['Think of father\'s side. | నాన్న వైపు ఆలోచించు.', 'She is a woman of father\'s family. | ఆమె నాన్న ఇంటి ఆడపడుచు.'], 'Father\'s sister is atta. | నాన్న సోదరి అత్త.', 'Pinni is mother\'s younger sister. | పిన్ని అంటే అమ్మ చెల్లెలు.', '👩'],
          ['What makes people a family? | మనుషులను కుటుంబంగా చేసేది ఏమిటి?', 'They love and care for each other | ఒకరినొకరు ప్రేమించి చూసుకోవడం', ['They wear the same clothes | ఒకే రకం బట్టలు వేసుకోవడం', 'They are all the same age | అందరూ ఒకే వయసు వాళ్లు కావడం'], ['Think about your home. | నీ ఇంటి గురించి ఆలోచించు.', 'Love and care. | ప్రేమ, శ్రద్ధ.'], 'A family loves and cares for each other. | కుటుంబం అంటే ఒకరినొకరు ప్రేమించి చూసుకోవడం.', 'Family members can be of any age and wear any clothes. | కుటుంబ సభ్యులు ఏ వయసు వారైనా కావచ్చు.', '🏠'],
        ]),
        matchT('rel', 'Match each relation to its Telugu name. | ప్రతి బంధువును వారి పేరుతో జత చేయి.', [
          ['Father\'s mother | నాన్న అమ్మ', 'Nanamma | నానమ్మ', '👵'], ['Mother\'s mother | అమ్మ అమ్మ', 'Ammamma | అమ్మమ్మ', '👵'],
          ['Mother\'s brother | అమ్మ సోదరుడు', 'Mavayya | మావయ్య', '👨'], ['Father\'s younger brother | నాన్న తమ్ముడు', 'Babai | బాబాయి', '👨'],
          ['Father\'s sister | నాన్న సోదరి', 'Atta | అత్త', '👩'], ['Mother\'s younger sister | అమ్మ చెల్లెలు', 'Pinni | పిన్ని', '👩'],
          ['Father\'s father | నాన్న నాన్న', 'Tatayya | తాతయ్య', '👴'],
        ], ['First decide: father\'s side or mother\'s side? | ముందు: నాన్న వైపా, అమ్మ వైపా?', 'Start with the one you know best. | బాగా తెలిసిన దానితో మొదలుపెట్టు.'], 'Check whose relative it is — father\'s or mother\'s. | వాళ్లు నాన్న బంధువా, అమ్మ బంధువా చూడు.'),
      ],
    },
    {
      id: 'ts3.evs.family.types', title: T('Family history and types of families | కుటుంబ చరిత్ర, కుటుంబ రకాలు'),
      intro: [
        H('Big families and small families | పెద్ద కుటుంబాలు, చిన్న కుటుంబాలు'),
        P('In Arjun\'s house in Siddipet live grandparents, parents, an uncle, an aunt and four children. This is a joint family. | సిద్దిపేటలో అర్జున్ ఇంట్లో తాతయ్య, నానమ్మ, అమ్మానాన్నలు, బాబాయి, పిన్ని, నలుగురు పిల్లలు ఉంటారు. ఇది ఉమ్మడి కుటుంబం.'),
        P('Diya lives in Hyderabad with only her mother, father and brother. This is a small, nuclear family. | దియా హైదరాబాద్‌లో అమ్మ, నాన్న, తమ్ముడితో మాత్రమే ఉంటుంది. ఇది చిన్న కుటుంబం (వ్యష్టి కుటుంబం).'),
        PIC('🏘️', 'Many relatives can live together in one big house. | చాలా మంది బంధువులు ఒకే పెద్ద ఇంట్లో కలిసి ఉండవచ్చు.'),
        KEYS('Joint family: grandparents, parents, uncles, aunts and children together. | ఉమ్మడి కుటుంబం: తాతయ్య నానమ్మలు, అమ్మానాన్నలు, బాబాయిలు, పిల్లలు కలిసి.',
          'Nuclear family: parents and their children. | చిన్న కుటుంబం: అమ్మానాన్నలు, వాళ్ల పిల్లలు.',
          'A family tree shows grandparents at the top and children at the bottom. | కుటుంబ వృక్షంలో పైన తాతయ్య నానమ్మలు, కింద పిల్లలు ఉంటారు.',
          'Old photos and elders tell us our family history. | పాత ఫోటోలు, పెద్దవాళ్లు మన కుటుంబ చరిత్ర చెబుతారు.'),
        REM('Every family is special — big or small. | పెద్దదైనా, చిన్నదైనా ప్రతి కుటుంబం ప్రత్యేకమే.'),
        TIP('Ask tatayya where he was born and what games he played. That is your family history! | తాతయ్య ఎక్కడ పుట్టారో, ఏ ఆటలు ఆడారో అడుగు. అదే మీ కుటుంబ చరిత్ర!'),
      ],
      examples: [
        EX('Kiran lives with his parents and sister only. What type of family is it? | కిరణ్ అమ్మానాన్నలు, అక్కతో మాత్రమే ఉంటాడు. ఇది ఏ రకం కుటుంబం?', ['Only parents and children live there. | అక్కడ అమ్మానాన్నలు, పిల్లలు మాత్రమే ఉన్నారు.'], 'A nuclear (small) family | చిన్న కుటుంబం', '👨 👩 👧 👦'),
        EX('In a family tree, who comes at the top? | కుటుంబ వృక్షంలో పైన ఎవరు ఉంటారు?', ['The oldest people come first. | అందరికంటే పెద్దవాళ్లు ముందు వస్తారు.', 'Then parents, then children. | తర్వాత అమ్మానాన్నలు, తర్వాత పిల్లలు.'], 'Grandparents | తాతయ్య, నానమ్మ', '👴 👵'),
      ],
      practice: [
        bank('type', [
          ['Grandparents, parents, uncles and cousins live together. Which family? | తాతయ్య నానమ్మలు, అమ్మానాన్నలు, బాబాయిలు, పిల్లలు కలిసి ఉంటారు. ఇది ఏ కుటుంబం?', 'Joint family | ఉమ్మడి కుటుంబం', ['Nuclear family | చిన్న కుటుంబం', 'School family | బడి కుటుంబం'], ['Count how many relatives. | ఎంత మంది బంధువులో లెక్కించు.', 'Many relatives in one house. | ఒకే ఇంట్లో చాలా మంది బంధువులు.'], 'Many relatives together make a joint family. | చాలా మంది బంధువులు కలిసి ఉంటే ఉమ్మడి కుటుంబం.', 'A nuclear family has only parents and children. | చిన్న కుటుంబంలో అమ్మానాన్నలు, పిల్లలే ఉంటారు.', '👴 👵 👨 👩 👧 👦'],
          ['Only a mother, father and two children live together. Which family? | అమ్మ, నాన్న, ఇద్దరు పిల్లలు మాత్రమే ఉంటారు. ఇది ఏ కుటుంబం?', 'Nuclear family | చిన్న కుటుంబం', ['Joint family | ఉమ్మడి కుటుంబం', 'Big joint family | పెద్ద ఉమ్మడి కుటుంబం'], ['Are grandparents there? | తాతయ్య నానమ్మలు ఉన్నారా?', 'Just parents and children. | అమ్మానాన్నలు, పిల్లలు మాత్రమే.'], 'Parents and children make a nuclear family. | అమ్మానాన్నలు, పిల్లలు ఉంటే చిన్న కుటుంబం.', 'No grandparents or uncles, so it is not joint. | తాతయ్యలు, బాబాయిలు లేరు, కాబట్టి ఉమ్మడి కాదు.', '👨 👩 👧 👦'],
          ['Who can tell you the most about your family long ago? | చాలా కాలం క్రితం మీ కుటుంబం గురించి ఎవరు బాగా చెప్పగలరు?', 'Grandparents | తాతయ్య, నానమ్మ', ['Your baby brother | నీ చిన్న తమ్ముడు', 'A shopkeeper | దుకాణదారు'], ['Who has lived the longest? | ఎక్కువ కాలం బతికినవాళ్లు ఎవరు?', 'They remember old days. | వాళ్లకు పాత రోజులు గుర్తుంటాయి.'], 'Grandparents remember the family\'s past. | తాతయ్య నానమ్మలకు కుటుంబ గతం గుర్తుంటుంది.', 'A baby does not know about long ago. | పాపాయికి పాత విషయాలు తెలియవు.', '👴'],
          ['In a family tree, where do the children come? | కుటుంబ వృక్షంలో పిల్లలు ఎక్కడ ఉంటారు?', 'At the bottom | కింద', ['At the top | పైన', 'Nowhere | ఎక్కడా ఉండరు'], ['Oldest at the top. | పెద్దవాళ్లు పైన.', 'Youngest at the…? | చిన్నవాళ్లు…?'], 'Children come at the bottom of the tree. | పిల్లలు వృక్షంలో కింద ఉంటారు.', 'Grandparents are at the top, not children. | పైన తాతయ్య నానమ్మలు ఉంటారు, పిల్లలు కాదు.', '🌳'],
          ['What helps us learn our family history? | మన కుటుంబ చరిత్ర తెలుసుకోవడానికి ఏది సాయం చేస్తుంది?', 'Old photos and stories of elders | పాత ఫోటోలు, పెద్దల కథలు', ['A new toy | కొత్త బొమ్మ', 'A cricket bat | క్రికెట్ బ్యాట్'], ['Think of old things at home. | ఇంట్లో పాత వస్తువులు గుర్తుచేసుకో.', 'Elders love to tell stories. | పెద్దలకు కథలు చెప్పడం ఇష్టం.'], 'Old photos and elders\' stories tell family history. | పాత ఫోటోలు, పెద్దల కథలు కుటుంబ చరిత్ర చెబుతాయి.', 'Toys and bats do not tell history. | బొమ్మలు, బ్యాట్లు చరిత్ర చెప్పవు.', '📖'],
          ['Is a small family less special than a big family? | చిన్న కుటుంబం పెద్ద కుటుంబం కంటే తక్కువ ప్రత్యేకమా?', 'No, every family is special | కాదు, ప్రతి కుటుంబం ప్రత్యేకమే', ['Yes, big is always better | అవును, పెద్దదే ఎప్పుడూ మంచిది'], ['What makes a family? | కుటుంబాన్ని ఏది తయారు చేస్తుంది?', 'Love, not size. | పరిమాణం కాదు, ప్రేమ.'], 'Every family is special. | ప్రతి కుటుంబం ప్రత్యేకమే.', 'Love matters, not the number of people. | ముఖ్యం ప్రేమ, మనుషుల సంఖ్య కాదు.', '🏠'],
        ]),
        tapT('joint', 'Tap ALL the people who may live in a JOINT family. | ఉమ్మడి కుటుంబంలో ఉండే వాళ్లందరినీ నొక్కు.',
          ['grandfather | తాతయ్య', 'grandmother | నానమ్మ', 'uncle | బాబాయి', 'aunt | పిన్ని', 'cousins | బాబాయి పిల్లలు'],
          ['the bus driver | బస్సు డ్రైవర్', 'the postman | పోస్ట్‌మ్యాన్', 'the shopkeeper | దుకాణదారు', 'a stranger | తెలియని వ్యక్తి'],
          ['Joint family members are relatives. | ఉమ్మడి కుటుంబ సభ్యులు బంధువులు.', 'Workers outside the house are not family. | బయట పనిచేసే వాళ్లు కుటుంబం కాదు.'],
          'Only relatives live in a joint family. | ఉమ్మడి కుటుంబంలో బంధువులే ఉంటారు.'),
      ],
    },
    {
      id: 'ts3.evs.family.care', title: T('Caring for elders and children with special needs | పెద్దలను, ప్రత్యేక అవసరాల పిల్లలను చూసుకోవడం'),
      intro: [
        H('We take care of each other | మనం ఒకరినొకరు చూసుకుంటాం'),
        P('Tatayya cannot see well now. Lakshmi reads the newspaper to him and gives him his medicine on time. | తాతయ్యకు ఇప్పుడు సరిగా కనిపించదు. లక్ష్మి ఆయనకు పేపర్ చదివి వినిపిస్తుంది, సమయానికి మందులు ఇస్తుంది.'),
        P('Teja uses a wheelchair. His friends push it to the playground, so he plays with them every day. | తేజ చక్రాల కుర్చీ వాడతాడు. స్నేహితులు దాన్ని ఆటస్థలానికి తోస్తారు, అందుకే అతను రోజూ వాళ్లతో ఆడతాడు.'),
        PIC('👴', 'Grandparents need our love, time and help. | తాతయ్య నానమ్మలకు మన ప్రేమ, సమయం, సాయం కావాలి.'),
        PIC('💊', 'Help elders take their medicine on time. | పెద్దలకు సమయానికి మందులు ఇవ్వడంలో సాయం చేయి.'),
        KEYS('Talk and listen to elders kindly. | పెద్దలతో ప్రేమగా మాట్లాడు, వారి మాట విను.',
          'Children with special needs can learn and play like everyone. | ప్రత్యేక అవసరాల పిల్లలు అందరిలాగే చదువుకోగలరు, ఆడగలరు.',
          'Never tease anyone. Include everyone in games. | ఎవరినీ ఎగతాళి చేయకు. ఆటల్లో అందరినీ చేర్చుకో.'),
        REM('Helping others makes everyone happy. | ఇతరులకు సాయం చేస్తే అందరూ సంతోషంగా ఉంటారు.'),
        TIP('Today, do one kind thing for an elder at home. | ఈ రోజు ఇంట్లో ఒక పెద్దవారికి ఒక మంచి పని చేయి.'),
      ],
      examples: [
        EX('Nanamma\'s knees hurt when she climbs stairs. How can you help? | మెట్లు ఎక్కేటప్పుడు నానమ్మ మోకాళ్లు నొప్పి పెడతాయి. నువ్వు ఎలా సాయం చేయగలవు?', ['Walk slowly with her. | ఆమెతో నెమ్మదిగా నడువు.', 'Let her hold your hand or the railing. | నీ చేయి లేదా పట్టీ పట్టుకోనివ్వు.'], 'Hold her hand and go slowly | చేయి పట్టుకొని నెమ్మదిగా తీసుకెళ్లు', '👵'),
        EX('A new classmate cannot hear well. How can you include her? | కొత్త స్నేహితురాలికి సరిగా వినిపించదు. ఆమెను ఎలా కలుపుకోవాలి?', ['Face her and speak clearly. | ఆమె వైపు తిరిగి స్పష్టంగా మాట్లాడు.', 'Use signs and smiles. | సైగలు, చిరునవ్వు వాడు.'], 'Speak facing her and invite her to play | ఆమె వైపు చూసి మాట్లాడి, ఆటకు పిలువు', '👧'),
      ],
      practice: [
        bank('help', [
          ['Tatayya cannot read small letters. What can you do? | తాతయ్య చిన్న అక్షరాలు చదవలేరు. నువ్వు ఏం చేయవచ్చు?', 'Read it aloud for him | ఆయనకు చదివి వినిపించు', ['Laugh at him | ఆయనను చూసి నవ్వు', 'Hide his glasses | ఆయన కళ్లద్దాలు దాచు'], ['How would you like to be helped? | నీకు ఎలా సాయం కావాలనుకుంటావు?', 'Use your voice. | నీ గొంతు వాడు.'], 'Read aloud for tatayya. | తాతయ్యకు చదివి వినిపించు.', 'Laughing and hiding things hurt elders. | నవ్వడం, వస్తువులు దాచడం పెద్దలను బాధపెడతాయి.', '👴'],
          ['A friend uses a wheelchair. How can he join your game? | స్నేహితుడు చక్రాల కుర్చీ వాడతాడు. అతను మీ ఆటలో ఎలా చేరగలడు?', 'Change the game a little so he can play | అతను ఆడగలిగేలా ఆటను కొంచెం మార్చండి', ['Tell him to go away | వెళ్లిపొమ్మని చెప్పు', 'Never call him | ఎప్పుడూ పిలవకు'], ['Games can be changed. | ఆటలను మార్చవచ్చు.', 'Everyone should play. | అందరూ ఆడాలి.'], 'Change the rules so everyone can play. | అందరూ ఆడేలా నియమాలు మార్చండి.', 'Leaving a friend out is unkind. | స్నేహితుడిని వదిలేయడం మంచిది కాదు.', '🧒'],
          ['Nanamma needs her medicine at 8 o\'clock. You can… | నానమ్మ 8 గంటలకు మందు వేసుకోవాలి. నువ్వు…', 'remind her and bring water | గుర్తుచేసి నీళ్లు తేవచ్చు', ['eat the medicine yourself | నువ్వే మందు తినవచ్చు', 'throw it away | పారేయవచ్చు'], ['Medicine is only for the person who is ill. | మందు జబ్బు ఉన్నవాళ్లకే.', 'Reminding is helping. | గుర్తుచేయడం కూడా సాయమే.'], 'Remind her and bring a glass of water. | గుర్తుచేసి, ఒక గ్లాసు నీళ్లు తీసుకురా.', 'Never eat someone else\'s medicine. | వేరేవాళ్ల మందు ఎప్పుడూ తినకూడదు.', '💊'],
          ['A child in class cannot see. How can she read? | తరగతిలో ఒక అమ్మాయికి కనిపించదు. ఆమె ఎలా చదువుతుంది?', 'With Braille, by touching raised dots | బ్రెయిలీతో, ఉబ్బిన చుక్కలను తాకి', ['She can never read | ఆమె ఎప్పుడూ చదవలేదు', 'By shouting | అరిచి'], ['Fingers can feel dots. | వేళ్లకు చుక్కలు తెలుస్తాయి.', 'Special books have raised dots. | ప్రత్యేక పుస్తకాల్లో ఉబ్బిన చుక్కలు ఉంటాయి.'], 'She reads Braille with her fingers. | ఆమె వేళ్లతో బ్రెయిలీ చదువుతుంది.', 'Children who cannot see can read and learn too. | కనిపించని పిల్లలు కూడా చదువుకోగలరు.', '✋'],
          ['Your grandmother is telling a story. You should… | నానమ్మ కథ చెబుతోంది. నువ్వు…', 'listen and ask questions | విని ప్రశ్నలు అడగాలి', ['play loud music | గట్టిగా పాటలు పెట్టాలి', 'walk away | వెళ్లిపోవాలి'], ['Elders love when we listen. | మనం వింటే పెద్దలు సంతోషిస్తారు.', 'Show you care. | శ్రద్ధ చూపించు.'], 'Listen to elders and ask questions. | పెద్దల మాట విని ప్రశ్నలు అడుగు.', 'Ignoring elders makes them sad. | పెద్దలను పట్టించుకోకపోతే బాధపడతారు.', '👵'],
          ['Some children laugh at a boy who walks with a crutch. What should you do? | కర్రతో నడిచే అబ్బాయిని కొందరు పిల్లలు ఎగతాళి చేస్తున్నారు. నువ్వు ఏం చేయాలి?', 'Tell them to stop and be his friend | ఆపమని చెప్పి అతనికి స్నేహితుడివి అవ్వు', ['Laugh with them | వాళ్లతో కలిసి నవ్వు', 'Walk away quietly | మౌనంగా వెళ్లిపో'], ['How does he feel? | అతనికి ఎలా అనిపిస్తుంది?', 'Be kind and brave. | దయగా, ధైర్యంగా ఉండు.'], 'Stop the teasing and be his friend. | ఎగతాళి ఆపించి అతనితో స్నేహం చేయి.', 'Teasing hurts. Never join it. | ఎగతాళి బాధపెడుతుంది. ఎప్పుడూ అందులో చేరకు.', '🙏'],
        ]),
        tapT('kind', 'Tap ALL the kind ways to care for elders. | పెద్దలను చూసుకునే మంచి పనులన్నీ నొక్కు.',
          ['giving medicine on time | సమయానికి మందు ఇవ్వడం', 'reading to them | చదివి వినిపించడం', 'holding their hand on stairs | మెట్ల దగ్గర చేయి పట్టుకోవడం', 'sitting and talking with them | వాళ్లతో కూర్చుని మాట్లాడటం', 'bringing them water | నీళ్లు తెచ్చి ఇవ్వడం'],
          ['shouting at them | వాళ్లపై అరవడం', 'making fun of them | వాళ్లను ఎగతాళి చేయడం', 'hiding their glasses | కళ్లద్దాలు దాచడం', 'ignoring them | పట్టించుకోకపోవడం'],
          ['Would you like this done to you? | నీకు ఇలా చేస్తే నచ్చుతుందా?', 'Kind actions help and show love. | మంచి పనులు సాయం చేస్తాయి, ప్రేమను చూపిస్తాయి.'],
          'Kind actions help elders; unkind ones hurt them. | మంచి పనులు పెద్దలకు సాయం; చెడ్డ పనులు బాధ.'),
      ],
    },
  ],
};

// ================================================================== CH 2 Division of Work
const ch2: USpec = {
  id: 'ts3.evs.ch2', subject: 'evs', title: T('Division of Work | పని విభజన'), source: src(2),
  objectives: [
    {
      id: 'ts3.evs.work.home', title: T('Sharing work at home | ఇంటి పనిలో భాగం పంచుకోవడం'),
      intro: [
        H('Many hands make work light | అందరూ చేస్తే పని తేలిక'),
        P('Every morning amma cooks, nanna fetches milk, akka sweeps the floor and Imran waters the plants. Work gets done quickly! | ప్రతి ఉదయం అమ్మ వంట చేస్తుంది, నాన్న పాలు తెస్తారు, అక్క ఇల్లు ఊడుస్తుంది, ఇమ్రాన్ మొక్కలకు నీళ్లు పోస్తాడు. పని త్వరగా అయిపోతుంది!'),
        PIC('🧺', 'Folding dry clothes is a job children can do. | ఆరిన బట్టలు మడతపెట్టడం పిల్లలు చేయగల పని.'),
        PIC('🪣', 'Carrying a small bucket of water for the plants. | మొక్కలకు చిన్న బకెట్‌తో నీళ్లు తీసుకెళ్లడం.'),
        KEYS('Boys and girls can both do every kind of housework. | అబ్బాయిలు, అమ్మాయిలు ఇద్దరూ అన్ని ఇంటి పనులు చేయవచ్చు.',
          'Children can do small jobs: set plates, fold clothes, water plants. | పిల్లలు చిన్న పనులు చేయవచ్చు: పళ్లేలు పెట్టడం, బట్టలు మడతపెట్టడం, మొక్కలకు నీళ్లు.',
          'When work is shared, everyone gets time to rest and play. | పని పంచుకుంటే అందరికీ విశ్రాంతి, ఆటకు సమయం దొరుకుతుంది.'),
        REM('Helping at home is a way of saying "I love you". | ఇంట్లో సాయం చేయడం అంటే "నిన్ను ప్రేమిస్తున్నా" అని చెప్పడమే.'),
        TIP('Make a helper chart: write one job for each family member this week. | సహాయ పట్టిక తయారు చేయి: ఈ వారం ఒక్కొక్కరికి ఒక పని రాయి.'),
      ],
      examples: [
        EX('Amma is tired after cooking. What can Meena do after lunch? | వంట చేసి అమ్మ అలసిపోయింది. మధ్యాహ్న భోజనం తర్వాత మీనా ఏం చేయవచ్చు?', ['Clear the plates. | పళ్లేలు తీయవచ్చు.', 'Wipe the floor where food fell. | అన్నం పడిన చోట తుడవవచ్చు.'], 'Clear the plates and clean up | పళ్లేలు తీసి శుభ్రం చేయవచ్చు', '🥄'),
        EX('Is sweeping the house only a girl\'s job? | ఇల్లు ఊడవడం అమ్మాయిల పని మాత్రమేనా?', ['Everyone at home makes the house dirty. | ఇంట్లో అందరూ ఇంటిని మురికి చేస్తారు.', 'So everyone can clean it. | కాబట్టి అందరూ శుభ్రం చేయవచ్చు.'], 'No, boys and girls both can sweep | కాదు, అబ్బాయిలు అమ్మాయిలు ఇద్దరూ ఊడవవచ్చు', '🏠'),
      ],
      practice: [
        bank('share', [
          ['Which job can an 8-year-old do safely at home? | 8 ఏళ్ల పిల్లలు ఇంట్లో సురక్షితంగా చేయగల పని ఏది?', 'Fold dry clothes | ఆరిన బట్టలు మడతపెట్టడం', ['Light the gas stove alone | ఒంటరిగా గ్యాస్ పొయ్యి వెలిగించడం', 'Climb on the roof | పైకప్పు ఎక్కడం'], ['Is it safe for a child? | అది పిల్లలకు సురక్షితమా?', 'No fire, no heights. | నిప్పు, ఎత్తు వద్దు.'], 'Folding clothes is safe and helpful. | బట్టలు మడతపెట్టడం సురక్షితమైన మంచి సాయం.', 'Fire and roofs are dangerous for children. | నిప్పు, పైకప్పు పిల్లలకు ప్రమాదం.', '🧺'],
          ['Why should family members share work? | కుటుంబ సభ్యులు పని ఎందుకు పంచుకోవాలి?', 'So work is done quickly and no one is too tired | పని త్వరగా అవుతుంది, ఎవరూ ఎక్కువ అలసిపోరు', ['So one person does everything | ఒక్కరే అన్నీ చేయడానికి', 'So the house stays dirty | ఇల్లు మురికిగా ఉండటానికి'], ['Think of many hands. | ఎన్నో చేతులు ఆలోచించు.', 'Who gets tired if one person works? | ఒక్కరే చేస్తే ఎవరు అలసిపోతారు?'], 'Sharing makes work quick and light. | పంచుకుంటే పని త్వరగా, తేలికగా అవుతుంది.', 'One person doing everything gets very tired. | ఒక్కరే అన్నీ చేస్తే బాగా అలసిపోతారు.', '🤝'],
          ['Who can water the plants? | మొక్కలకు నీళ్లు ఎవరు పోయవచ్చు?', 'Anyone in the family | కుటుంబంలో ఎవరైనా', ['Only grandfather | తాతయ్య మాత్రమే', 'Nobody | ఎవరూ కాదు'], ['Is it a hard job? | అది కష్టమైన పనా?', 'Even children can do it. | పిల్లలు కూడా చేయగలరు.'], 'Anyone, even a child, can water plants. | ఎవరైనా, పిల్లలు కూడా మొక్కలకు నీళ్లు పోయవచ్చు.', 'Any family member can do this easy job. | ఈ సులభమైన పని ఎవరైనా చేయవచ్చు.', '🌱'],
          ['Before dinner, Arjun can… | రాత్రి భోజనానికి ముందు అర్జున్…', 'set the plates and glasses | పళ్లేలు, గ్లాసులు పెట్టవచ్చు', ['watch TV and wait | టీవీ చూస్తూ ఎదురుచూడవచ్చు', 'hide the spoons | చెంచాలు దాచవచ్చు'], ['How can he help the cook? | వంట చేసేవాళ్లకు ఎలా సాయం?', 'Get the table ready. | భోజనానికి సిద్ధం చేయి.'], 'Arjun can set the plates. | అర్జున్ పళ్లేలు పెట్టవచ్చు.', 'Waiting or hiding things is not helping. | ఎదురుచూడటం, దాచడం సాయం కాదు.', '🥄'],
          ['Is cooking only a mother\'s job? | వంట చేయడం అమ్మ పని మాత్రమేనా?', 'No, anyone grown-up can cook | కాదు, పెద్దవాళ్లు ఎవరైనా వండవచ్చు', ['Yes, only mothers cook | అవును, అమ్మలు మాత్రమే వండుతారు'], ['Do fathers and cooks at hotels cook? | నాన్నలు, హోటల్ వంటవాళ్లు వండుతారా?', 'Work has no boy-girl rule. | పనికి అబ్బాయి-అమ్మాయి తేడా లేదు.'], 'Any grown-up can cook. | పెద్దవాళ్లు ఎవరైనా వండవచ్చు.', 'Fathers, uncles and chefs cook too. | నాన్నలు, బాబాయిలు, వంటవాళ్లూ వండుతారు.', '🍚'],
          ['After playing, where should your toys go? | ఆడుకున్న తర్వాత బొమ్మలు ఎక్కడ పెట్టాలి?', 'Back in their box | వాటి డబ్బాలో', ['All over the floor | నేల అంతా', 'Under the bed, hidden | మంచం కింద దాచి'], ['Who played with them? | వాటితో ఎవరు ఆడారు?', 'Your own job! | అది నీ పనే!'], 'Put toys back in their box. | బొమ్మలను మళ్లీ డబ్బాలో పెట్టు.', 'Toys on the floor make work for others and can trip someone. | నేలపై బొమ్మలు ఇతరులకు పని, ఎవరైనా జారిపడవచ్చు.', '🧸'],
        ]),
        tapT('kid', 'Tap ALL the jobs a child can do to help at home. | ఇంట్లో పిల్లలు చేయగల సహాయ పనులన్నీ నొక్కు.',
          ['watering plants | మొక్కలకు నీళ్లు పోయడం', 'folding clothes | బట్టలు మడతపెట్టడం', 'setting plates | పళ్లేలు పెట్టడం', 'putting toys away | బొమ్మలు సర్దడం', 'making the bed | పక్క సర్దడం'],
          ['lighting the stove alone | ఒంటరిగా పొయ్యి వెలిగించడం', 'fixing electric wires | కరెంటు తీగలు బాగుచేయడం', 'driving the scooter | స్కూటర్ నడపడం', 'climbing on the water tank | నీళ్ల ట్యాంక్ ఎక్కడం'],
          ['Is it safe for a child? | పిల్లలకు సురక్షితమా?', 'Fire, wires and driving are for grown-ups. | నిప్పు, తీగలు, బండి నడపడం పెద్దవాళ్ల పని.'],
          'Choose only safe, small jobs. | సురక్షితమైన చిన్న పనులే ఎంచుకో.'),
      ],
    },
    {
      id: 'ts3.evs.work.jobs', title: T('People and their work | వృత్తులు'),
      intro: [
        H('People who help us | మనకు సాయం చేసేవాళ్లు'),
        P('The farmer grows rice. The doctor treats us. The teacher teaches us. The potter makes pots. Each person does different work, and we need all of them. | రైతు వడ్లు పండిస్తాడు. డాక్టర్ వైద్యం చేస్తారు. టీచర్ పాఠం చెబుతారు. కుమ్మరి కుండలు చేస్తాడు. ఒక్కొక్కరు ఒక్కో పని చేస్తారు, మనకు అందరూ కావాలి.'),
        PIC('🧑‍🌾', 'A farmer grows the food we eat. | రైతు మనం తినే ఆహారం పండిస్తాడు.'),
        PIC('🧑‍⚕️', 'A doctor helps us get well. | డాక్టర్ మనకు జబ్బు తగ్గిస్తారు.'),
        PIC('🧑‍🏫', 'A teacher helps us learn. | టీచర్ మనకు నేర్పిస్తారు.'),
        KEYS('Weaver makes cloth on a loom — like in Pochampally. | నేత కార్మికుడు మగ్గం మీద బట్ట నేస్తాడు — పోచంపల్లిలో లాగా.',
          'Carpenter makes doors and chairs from wood. | వడ్రంగి చెక్కతో తలుపులు, కుర్చీలు చేస్తాడు.',
          'Tailor stitches clothes; cobbler mends chappals. | దర్జీ బట్టలు కుడతాడు; చెప్పులు కుట్టేవాడు చెప్పులు బాగుచేస్తాడు.',
          'Every honest work deserves respect. | ప్రతి నిజాయితీ పనికి గౌరవం ఇవ్వాలి.'),
        REM('Without each other\'s work, we cannot live. | ఒకరి పని లేకుండా మరొకరు బతకలేరు.'),
        TIP('Ask the people at home what work they do. Thank a worker you meet today. | ఇంట్లో వాళ్లు ఏ పని చేస్తారో అడుగు. ఈ రోజు కలిసిన ఒక కార్మికుడికి ధన్యవాదాలు చెప్పు.'),
      ],
      examples: [
        EX('Who makes the wooden door of your house? | మీ ఇంటి చెక్క తలుపు ఎవరు చేస్తారు?', ['Doors are made of wood. | తలుపులు చెక్కతో చేస్తారు.', 'The person who works with wood. | చెక్కతో పనిచేసేవాడు.'], 'A carpenter | వడ్రంగి', '🪚'),
        EX('Your chappal strap broke. Who will fix it? | నీ చెప్పు పట్టీ తెగిపోయింది. ఎవరు బాగుచేస్తారు?', ['Who mends shoes and chappals? | బూట్లు, చెప్పులు ఎవరు కుడతారు?'], 'A cobbler | చెప్పులు కుట్టేవాడు', '🦶'),
      ],
      practice: [
        matchT('who', 'Match each worker to their work. | ప్రతి కార్మికుడిని వారి పనితో జత చేయి.', [
          ['Farmer | రైతు', 'grows crops | పంటలు పండిస్తాడు', '🧑‍🌾'], ['Doctor | డాక్టర్', 'treats sick people | జబ్బు చేసినవాళ్లకు వైద్యం', '🧑‍⚕️'],
          ['Teacher | టీచర్', 'teaches children | పిల్లలకు పాఠాలు', '🧑‍🏫'], ['Potter | కుమ్మరి', 'makes clay pots | మట్టి కుండలు చేస్తాడు', '🏺'],
          ['Carpenter | వడ్రంగి', 'makes wooden things | చెక్క వస్తువులు చేస్తాడు', '🪚'], ['Tailor | దర్జీ', 'stitches clothes | బట్టలు కుడతాడు', '🧵'],
          ['Weaver | నేత కార్మికుడు', 'weaves cloth | బట్ట నేస్తాడు', '🧶'], ['Fisherman | జాలరి', 'catches fish | చేపలు పడతాడు', '🐟'],
        ], ['Think what each person makes or does. | ప్రతి ఒక్కరు ఏం చేస్తారో ఆలోచించు.', 'Start with the one you know best. | బాగా తెలిసిన దానితో మొదలుపెట్టు.'], 'Think again about what each worker does every day. | ప్రతి కార్మికుడు రోజూ ఏం చేస్తాడో మళ్లీ ఆలోచించు.'),
        bank('job', [
          ['Who grows paddy in the fields? | పొలాల్లో వరి ఎవరు పండిస్తారు?', 'Farmer | రైతు', ['Tailor | దర్జీ', 'Doctor | డాక్టర్'], ['Fields and crops. | పొలాలు, పంటలు.', 'He uses a plough. | నాగలి వాడతాడు.'], 'The farmer grows paddy. | రైతు వరి పండిస్తాడు.', 'Tailors stitch and doctors treat; they do not farm. | దర్జీ కుడతాడు, డాక్టర్ వైద్యం చేస్తారు; వాళ్లు వ్యవసాయం చేయరు.', '🌾'],
          ['Who makes pots from clay? | మట్టితో కుండలు ఎవరు చేస్తారు?', 'Potter | కుమ్మరి', ['Carpenter | వడ్రంగి', 'Barber | మంగలి'], ['He uses a spinning wheel. | తిరిగే చక్రం వాడతాడు.', 'Clay, not wood. | చెక్క కాదు, మట్టి.'], 'The potter makes clay pots. | కుమ్మరి మట్టి కుండలు చేస్తాడు.', 'A carpenter works with wood, not clay. | వడ్రంగి చెక్కతో పనిచేస్తాడు, మట్టితో కాదు.', '🏺'],
          ['Who makes Pochampally sarees on a loom? | మగ్గం మీద పోచంపల్లి చీరలు ఎవరు నేస్తారు?', 'Weaver | నేత కార్మికుడు', ['Potter | కుమ్మరి', 'Fisherman | జాలరి'], ['A loom is for making cloth. | మగ్గం బట్ట కోసం.', 'Threads go in and out. | దారాలు లోపలికి బయటికి.'], 'Weavers weave sarees on a loom. | నేత కార్మికులు మగ్గం మీద చీరలు నేస్తారు.', 'Potters and fishermen do not weave cloth. | కుమ్మరి, జాలరి బట్ట నేయరు.', '🧶'],
          ['You have a fever. Whom do you visit? | నీకు జ్వరం వచ్చింది. ఎవరి దగ్గరికి వెళ్తావు?', 'Doctor | డాక్టర్', ['Carpenter | వడ్రంగి', 'Postman | పోస్ట్‌మ్యాన్'], ['Who helps sick people? | జబ్బు వాళ్లకు ఎవరు సాయం?', 'At the hospital. | ఆసుపత్రిలో.'], 'Visit the doctor when sick. | జబ్బు చేస్తే డాక్టర్ దగ్గరికి వెళ్లాలి.', 'A carpenter cannot treat a fever. | వడ్రంగి జ్వరం తగ్గించలేడు.', '🧑‍⚕️'],
          ['Who brings letters to our house? | మన ఇంటికి ఉత్తరాలు ఎవరు తెస్తారు?', 'Postman | పోస్ట్‌మ్యాన్', ['Farmer | రైతు', 'Potter | కుమ్మరి'], ['He carries a bag of letters. | ఉత్తరాల సంచి మోస్తాడు.', 'He works for the post office. | పోస్టాఫీసులో పనిచేస్తాడు.'], 'The postman delivers letters. | పోస్ట్‌మ్యాన్ ఉత్తరాలు ఇస్తాడు.', 'Farmers and potters do not deliver letters. | రైతు, కుమ్మరి ఉత్తరాలు ఇవ్వరు.', '📄'],
          ['Should we laugh at a sweeper\'s work? | ఊడ్చే వాళ్ల పనిని చూసి నవ్వాలా?', 'No, every work deserves respect | కాదు, ప్రతి పనికి గౌరవం ఇవ్వాలి', ['Yes, it is a small job | అవును, అది చిన్న పని'], ['Who keeps our streets clean? | మన వీధులను శుభ్రంగా ఎవరు ఉంచుతారు?', 'What if no one cleaned? | ఎవరూ శుభ్రం చేయకపోతే?'], 'Every honest work is important. | ప్రతి నిజాయితీ పని ముఖ్యమే.', 'Clean streets keep us healthy — that is big work! | శుభ్రమైన వీధులు మనల్ని ఆరోగ్యంగా ఉంచుతాయి — అది గొప్ప పని!', '🙏'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.work.childlabour', title: T('Children should study and play, not work | పిల్లలు చదవాలి, ఆడాలి — పనికి కాదు'),
      intro: [
        H('Every child should go to school | ప్రతి బిడ్డ బడికి వెళ్లాలి'),
        P('Raju is 9 years old. He washes plates in a hotel all day and cannot go to school. This is child labour, and it is wrong. | రాజుకు 9 ఏళ్లు. రోజంతా హోటల్‌లో పళ్లేలు కడుగుతాడు, బడికి వెళ్లలేడు. ఇది బాల కార్మికత్వం, ఇది తప్పు.'),
        PIC('🏫', 'School is the right place for children. | పిల్లలకు సరైన చోటు బడి.'),
        PIC('🎒', 'Children should carry a school bag, not heavy loads. | పిల్లలు బడి సంచి మోయాలి, బరువులు కాదు.'),
        KEYS('Children under 14 must not be made to work for money. | 14 ఏళ్ల లోపు పిల్లలతో డబ్బు కోసం పని చేయించకూడదు.',
          'Helping a little at home is fine; working all day outside is not. | ఇంట్లో కొంచెం సాయం మంచిదే; బయట రోజంతా పని చేయడం కాదు.',
          'Every child has the right to study, play and rest. | ప్రతి బిడ్డకు చదువుకునే, ఆడుకునే, విశ్రాంతి తీసుకునే హక్కు ఉంది.',
          'If you see child labour, tell a teacher or call 1098. | బాల కార్మికులను చూస్తే టీచర్‌కు చెప్పు లేదా 1098కి ఫోన్ చేయి.'),
        REM('Childline phone number: 1098. | చైల్డ్‌లైన్ ఫోన్ నంబర్: 1098.'),
        TIP('Is a friend missing school to work? Talk to your teacher about it. | ఎవరైనా స్నేహితుడు పనికోసం బడి మానేస్తున్నాడా? టీచర్‌తో మాట్లాడు.'),
      ],
      examples: [
        EX('Watering plants at home for 10 minutes — is it child labour? | ఇంట్లో 10 నిమిషాలు మొక్కలకు నీళ్లు పోయడం — బాల కార్మికత్వమా?', ['It is a small, safe help at home. | ఇది ఇంట్లో చిన్న, సురక్షితమైన సాయం.', 'The child still goes to school and plays. | ఆ బిడ్డ బడికి వెళ్తుంది, ఆడుకుంటుంది.'], 'No, it is helping | కాదు, అది సాయం', '🌱'),
        EX('A 10-year-old girl works in a shop all day instead of school. What is this? | 10 ఏళ్ల అమ్మాయి బడికి బదులు రోజంతా దుకాణంలో పనిచేస్తోంది. ఇది ఏమిటి?', ['She works for money all day. | రోజంతా డబ్బు కోసం పని చేస్తోంది.', 'She misses school. | బడి మానేస్తోంది.'], 'Child labour — it is wrong | బాల కార్మికత్వం — ఇది తప్పు', '🏪'),
      ],
      practice: [
        bank('right', [
          ['Where should an 8-year-old be on a school day morning? | బడి రోజు ఉదయం 8 ఏళ్ల పిల్లలు ఎక్కడ ఉండాలి?', 'At school | బడిలో', ['In a factory | ఫ్యాక్టరీలో', 'At a brick kiln | ఇటుక బట్టీలో'], ['What is the right place for children? | పిల్లలకు సరైన చోటు ఏది?', 'Books and friends. | పుస్తకాలు, స్నేహితులు.'], 'Children belong at school. | పిల్లల చోటు బడి.', 'Factories and kilns are not places for children. | ఫ్యాక్టరీలు, బట్టీలు పిల్లల చోటు కాదు.', '🏫'],
          ['Which phone number helps children in trouble? | కష్టంలో ఉన్న పిల్లలకు సాయం చేసే ఫోన్ నంబర్ ఏది?', '1098 | 1098', ['100100 | 100100', '1234 | 1234'], ['It is called Childline. | దీన్ని చైల్డ్‌లైన్ అంటారు.', 'Ten-nine-eight. | పది-తొమ్మిది-ఎనిమిది.'], 'Childline is 1098. | చైల్డ్‌లైన్ 1098.', 'Remember: 1098 for children. | గుర్తుంచుకో: పిల్లల కోసం 1098.', '🔔'],
          ['Which of these is child labour? | వీటిలో బాల కార్మికత్వం ఏది?', 'A 9-year-old working all day in a hotel | 9 ఏళ్ల బాలుడు రోజంతా హోటల్‌లో పని చేయడం', ['Setting plates for dinner at home | ఇంట్లో భోజనానికి పళ్లేలు పెట్టడం', 'Watering plants on Sunday | ఆదివారం మొక్కలకు నీళ్లు పోయడం'], ['Is the child missing school? | ఆ బిడ్డ బడి మానేస్తోందా?', 'All day, for money. | రోజంతా, డబ్బు కోసం.'], 'Working all day outside instead of school is child labour. | బడికి బదులు రోజంతా బయట పని బాల కార్మికత్వం.', 'Small help at home is not child labour. | ఇంట్లో చిన్న సాయం బాల కార్మికత్వం కాదు.', '🍽️'],
          ['Every child has a right to… | ప్రతి బిడ్డకు హక్కు ఉంది…', 'study, play and rest | చదవడానికి, ఆడటానికి, విశ్రాంతికి', ['work in a factory | ఫ్యాక్టరీలో పని చేయడానికి', 'carry heavy loads | బరువులు మోయడానికి'], ['What makes childhood happy? | బాల్యాన్ని సంతోషంగా ఉంచేది ఏది?', 'School and games. | బడి, ఆటలు.'], 'Children have the right to study, play and rest. | పిల్లలకు చదువు, ఆట, విశ్రాంతి హక్కులు.', 'Factory work and heavy loads harm children. | ఫ్యాక్టరీ పని, బరువులు పిల్లలకు హాని.', '📚'],
          ['Your friend stopped coming to school to work in a shop. You should… | నీ స్నేహితుడు దుకాణంలో పని కోసం బడి మానేశాడు. నువ్వు…', 'tell your teacher | టీచర్‌కు చెప్పాలి', ['forget about him | అతన్ని మర్చిపోవాలి', 'also stop school | నువ్వు కూడా బడి మానేయాలి'], ['Who can help him? | అతనికి ఎవరు సాయం చేయగలరు?', 'A grown-up you trust. | నువ్వు నమ్మే పెద్దవాళ్లు.'], 'Tell your teacher so they can help. | సాయం కోసం టీచర్‌కు చెప్పు.', 'Forgetting him does not help him. | మర్చిపోతే అతనికి సాయం జరగదు.', '🧑‍🏫'],
          ['Children below what age must not work for money? | ఎన్ని ఏళ్ల లోపు పిల్లలు డబ్బు కోసం పని చేయకూడదు?', '14 years | 14 ఏళ్లు', ['4 years | 4 ఏళ్లు', '40 years | 40 ఏళ్లు'], ['Older than you, younger than a grown-up. | నీ కంటే పెద్ద, పెద్దవాళ్ల కంటే చిన్న.', 'Fourteen. | పద్నాలుగు.'], 'Children under 14 must not work for money. | 14 ఏళ్ల లోపు పిల్లలు డబ్బు కోసం పని చేయకూడదు.', '4 is too small and 40 is a grown-up. | 4 చాలా చిన్న, 40 పెద్దవాళ్లు.', '🧒'],
        ]),
        tapT('ok', 'Tap ALL that are RIGHT for children. | పిల్లలకు సరైనవన్నీ నొక్కు.',
          ['going to school | బడికి వెళ్లడం', 'playing with friends | స్నేహితులతో ఆడటం', 'helping a little at home | ఇంట్లో కొంచెం సాయం', 'reading story books | కథల పుస్తకాలు చదవడం', 'sleeping well at night | రాత్రి బాగా నిద్రపోవడం'],
          ['working in a brick kiln | ఇటుక బట్టీలో పని', 'washing plates in a hotel all day | రోజంతా హోటల్‌లో పళ్లేలు కడగడం', 'carrying heavy sacks | బరువైన బస్తాలు మోయడం', 'selling things on the road instead of school | బడికి బదులు రోడ్డుపై అమ్మడం'],
          ['Does it help the child grow and learn? | అది బిడ్డ ఎదగడానికి, నేర్చుకోవడానికి సాయం చేస్తుందా?', 'Work outside for money is not for children. | డబ్బు కోసం బయట పని పిల్లల కోసం కాదు.'],
          'Children should study, play and rest — not do hard work. | పిల్లలు చదవాలి, ఆడాలి, విశ్రాంతి తీసుకోవాలి — కష్టమైన పని కాదు.'),
      ],
    },
  ],
};

// ================================================================== CH 3 Let Us Play
const ch3: USpec = {
  id: 'ts3.evs.ch3', subject: 'evs', title: T('Let Us Play | ఆడుకుందాం'), source: src(3),
  objectives: [
    {
      id: 'ts3.evs.play.types', title: T('Indoor and outdoor games | ఇంటి లోపలి ఆటలు, బయటి ఆటలు'),
      intro: [
        H('So many games! | ఎన్నో ఆటలు!'),
        P('After school, children in our village play kabaddi, kho-kho, gilli-danda and tokkudu billa. When it rains, they play carrom, chess and ashta-chamma inside. | బడి తర్వాత మా ఊరి పిల్లలు కబడ్డీ, ఖో-ఖో, గిల్లీ-దండా, తొక్కుడు బిళ్ల ఆడతారు. వాన పడితే ఇంట్లో క్యారమ్, చదరంగం, అష్టా-చెమ్మా ఆడతారు.'),
        PIC('⚽', 'Football is an outdoor game played on a big ground. | ఫుట్‌బాల్ పెద్ద మైదానంలో ఆడే బయటి ఆట.'),
        PIC('🎲', 'Board games like ludo are played indoors. | లూడో లాంటి బోర్డు ఆటలు ఇంట్లో ఆడతారు.'),
        KEYS('Outdoor games need open space: kabaddi, kho-kho, cricket. | బయటి ఆటలకు ఖాళీ స్థలం కావాలి: కబడ్డీ, ఖో-ఖో, క్రికెట్.',
          'Indoor games can be played inside: carrom, chess, ludo. | ఇంటి లోపలి ఆటలు: క్యారమ్, చదరంగం, లూడో.',
          'Outdoor games make our body strong; indoor games make our mind sharp. | బయటి ఆటలు శరీరాన్ని బలంగా, లోపలి ఆటలు మెదడును చురుకుగా చేస్తాయి.'),
        REM('Play every day — it keeps you healthy and happy. | రోజూ ఆడు — అది నిన్ను ఆరోగ్యంగా, సంతోషంగా ఉంచుతుంది.'),
        TIP('Ask your grandparents which games they played as children. Try one! | తాతయ్య నానమ్మలు చిన్నప్పుడు ఏ ఆటలు ఆడారో అడిగి ఒకటి ఆడి చూడు!'),
      ],
      examples: [
        EX('Is kabaddi an indoor or outdoor game? | కబడ్డీ లోపలి ఆటా, బయటి ఆటా?', ['Kabaddi needs a big ground and two teams that run. | కబడ్డీకి పెద్ద మైదానం, పరిగెత్తే రెండు జట్లు కావాలి.'], 'Outdoor | బయటి ఆట', '🏃'),
        EX('It is raining. Which game can Sana play at home: carrom or cricket? | వాన పడుతోంది. సనా ఇంట్లో ఏ ఆట ఆడగలదు: క్యారమ్ లేదా క్రికెట్?', ['Cricket needs a ground. | క్రికెట్‌కు మైదానం కావాలి.', 'Carrom fits on a table. | క్యారమ్ బల్ల మీద సరిపోతుంది.'], 'Carrom | క్యారమ్', '🏠'),
      ],
      practice: [
        tapT('out', 'Tap ALL the OUTDOOR games. | బయటి ఆటలన్నీ నొక్కు.',
          ['kabaddi | కబడ్డీ', 'kho-kho | ఖో-ఖో', 'cricket | క్రికెట్', 'gilli-danda | గిల్లీ-దండా', 'football | ఫుట్‌బాల్', 'tokkudu billa | తొక్కుడు బిళ్ల'],
          ['chess | చదరంగం', 'carrom | క్యారమ్', 'ludo | లూడో', 'ashta-chamma | అష్టా-చెమ్మా', 'snakes and ladders | పాములు నిచ్చెనలు'],
          ['Which games need running on a ground? | ఏ ఆటలకు మైదానంలో పరిగెత్తాలి?', 'Board games are indoor. | బోర్డు ఆటలు లోపలివి.'],
          'Outdoor games need open space; board games are played inside. | బయటి ఆటలకు ఖాళీ స్థలం కావాలి; బోర్డు ఆటలు లోపల ఆడతారు.'),
        bank('kind', [
          ['Which is an indoor game? | వీటిలో ఇంటి లోపలి ఆట ఏది?', 'Chess | చదరంగం', ['Kabaddi | కబడ్డీ', 'Kho-kho | ఖో-ఖో'], ['Played sitting at a table. | బల్ల దగ్గర కూర్చుని ఆడతారు.', 'Has kings and queens. | రాజు, రాణి ఉంటాయి.'], 'Chess is played indoors. | చదరంగం లోపల ఆడతారు.', 'Kabaddi and kho-kho need a big ground. | కబడ్డీ, ఖో-ఖోకు పెద్ద మైదానం కావాలి.', '♟️'],
          ['Which game do we play with a flying kite at Sankranti? | సంక్రాంతికి ఆకాశంలో ఎగిరే దానితో ఆడే ఆట ఏది?', 'Kite flying | గాలిపటం ఎగరేయడం', ['Carrom | క్యారమ్', 'Ludo | లూడో'], ['Look at the sky in January. | జనవరిలో ఆకాశం చూడు.', 'It needs wind and string. | గాలి, దారం కావాలి.'], 'We fly kites at Sankranti. | సంక్రాంతికి గాలిపటాలు ఎగరేస్తాం.', 'Carrom and ludo are board games. | క్యారమ్, లూడో బోర్డు ఆటలు.', '🪁'],
          ['What do outdoor games mostly help? | బయటి ఆటలు ఎక్కువగా దేనికి సాయం చేస్తాయి?', 'A strong, healthy body | బలమైన, ఆరోగ్యమైన శరీరం', ['Sleeping all day | రోజంతా నిద్రకు', 'Eating more sweets | ఎక్కువ స్వీట్లు తినడానికి'], ['You run, jump and throw. | పరిగెత్తుతావు, దూకుతావు, విసురుతావు.', 'Muscles get exercise. | కండరాలకు వ్యాయామం.'], 'Outdoor games make the body strong. | బయటి ఆటలు శరీరాన్ని బలంగా చేస్తాయి.', 'Games do not make you sleep all day or eat sweets. | ఆటలు రోజంతా నిద్ర, స్వీట్లు కోసం కాదు.', '💪'],
          ['Which game uses a stick and a small wooden piece? | కర్ర, చిన్న చెక్క ముక్కతో ఆడే ఆట ఏది?', 'Gilli-danda | గిల్లీ-దండా', ['Chess | చదరంగం', 'Kho-kho | ఖో-ఖో'], ['The small piece is called gilli. | చిన్న ముక్కను గిల్లీ అంటారు.', 'The stick is danda. | కర్రను దండా అంటారు.'], 'Gilli-danda uses a stick and a gilli. | గిల్లీ-దండాలో కర్ర, గిల్లీ ఉంటాయి.', 'Chess uses pieces on a board; kho-kho needs no stick. | చదరంగంలో బోర్డు పావులు; ఖో-ఖోకు కర్ర అక్కర్లేదు.', '🪵'],
          ['Tokkudu billa is played by… | తొక్కుడు బిళ్ల ఎలా ఆడతారు…', 'hopping on boxes drawn on the ground | నేలపై గీసిన గడుల్లో కుంటుతూ', ['throwing a ball into a basket | బుట్టలోకి బంతి వేస్తూ', 'moving pieces on a board | బోర్డుపై పావులు జరుపుతూ'], ['Boxes are drawn with chalk. | సుద్దతో గడులు గీస్తారు.', 'You hop on one leg. | ఒక కాలిపై కుంటుతారు.'], 'We hop on boxes in tokkudu billa. | తొక్కుడు బిళ్లలో గడుల్లో కుంటుతాం.', 'Baskets are for basketball; boards are for chess. | బుట్ట బాస్కెట్‌బాల్‌కు; బోర్డు చదరంగానికి.', '🦶'],
          ['Which game sharpens the mind by thinking of the next move? | తర్వాతి ఎత్తు ఆలోచించి మెదడును చురుకుగా చేసే ఆట ఏది?', 'Chess | చదరంగం', ['Running race | పరుగు పందెం', 'Swimming | ఈత'], ['Think before you move. | కదిలే ముందు ఆలోచించు.', 'A board game. | బోర్డు ఆట.'], 'Chess makes us think carefully. | చదరంగం మనల్ని జాగ్రత్తగా ఆలోచించేలా చేస్తుంది.', 'Racing and swimming exercise the body more. | పరుగు, ఈత ఎక్కువగా శరీరానికి వ్యాయామం.', '🧩'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.play.equipment', title: T('Sports equipment | ఆట వస్తువులు'),
      intro: [
        H('What do we need to play? | ఆడటానికి ఏం కావాలి?'),
        P('Cricket needs a bat, a ball and stumps. Badminton needs rackets and a shuttle. Kabaddi needs nothing but a ground and friends! | క్రికెట్‌కు బ్యాట్, బంతి, వికెట్లు కావాలి. బ్యాడ్మింటన్‌కు రాకెట్లు, షటిల్ కావాలి. కబడ్డీకి మైదానం, స్నేహితులు చాలు!'),
        PIC('🏀', 'A basketball is bounced and thrown into a ring. | బాస్కెట్‌బాల్‌ను నేలకు కొట్టి రింగ్‌లోకి వేస్తారు.'),
        PIC('🪢', 'A skipping rope helps us jump. | తాడాట తాడుతో దూకుతాం.'),
        KEYS('Bat and ball → cricket. | బ్యాట్, బంతి → క్రికెట్.',
          'Racket and shuttle → badminton. | రాకెట్, షటిల్ → బ్యాడ్మింటన్.',
          'Board and coins with a striker → carrom. | బోర్డు, కాయిన్లు, స్ట్రైకర్ → క్యారమ్.',
          'Keep sports things safely after playing. | ఆడిన తర్వాత ఆట వస్తువులను జాగ్రత్తగా పెట్టు.'),
        REM('Some games need no equipment at all — just friends. | కొన్ని ఆటలకు ఏ వస్తువూ అక్కర్లేదు — స్నేహితులు చాలు.'),
        TIP('Look in your school sports room. Name five things you see. | బడి ఆట గదిలో చూడు. కనిపించే ఐదు వస్తువుల పేర్లు చెప్పు.'),
      ],
      examples: [
        EX('Which game uses a racket and a shuttle? | రాకెట్, షటిల్ వాడే ఆట ఏది?', ['The shuttle has feathers and flies over a net. | షటిల్‌కు ఈకలు ఉంటాయి, వల మీదుగా ఎగురుతుంది.'], 'Badminton | బ్యాడ్మింటన్', '🪶'),
        EX('What do you need to play kho-kho? | ఖో-ఖో ఆడటానికి ఏం కావాలి?', ['Players sit in a line and chase. | ఆటగాళ్లు వరుసలో కూర్చుని తరుముతారు.', 'Two poles at the ends can be used. | చివర్లలో రెండు స్తంభాలు వాడవచ్చు.'], 'Just a ground and two teams | మైదానం, రెండు జట్లు చాలు', '🏃'),
      ],
      practice: [
        matchT('gear', 'Match each game to the thing we play it with. | ప్రతి ఆటను దాని వస్తువుతో జత చేయి.', [
          ['Cricket | క్రికెట్', 'bat and ball | బ్యాట్, బంతి', '🏏'], ['Badminton | బ్యాడ్మింటన్', 'racket and shuttle | రాకెట్, షటిల్', '🏸'],
          ['Carrom | క్యారమ్', 'board and striker | బోర్డు, స్ట్రైకర్', '🟫'], ['Football | ఫుట్‌బాల్', 'big ball kicked by feet | కాలితో తన్నే పెద్ద బంతి', '⚽'],
          ['Skipping | తాడాట', 'rope | తాడు', '🪢'], ['Kite flying | గాలిపటం', 'kite and string (manja) | గాలిపటం, దారం', '🪁'],
          ['Ludo | లూడో', 'dice and counters | పాచిక, పావులు', '🎲'], ['Basketball | బాస్కెట్‌బాల్', 'ball and ring | బంతి, రింగ్', '🏀'],
        ], ['Picture the game being played. | ఆట ఆడుతున్నట్టు ఊహించు.', 'What is in the players\' hands? | ఆటగాళ్ల చేతుల్లో ఏముంది?'], 'Think of what players hold or use in that game. | ఆ ఆటలో ఆటగాళ్లు ఏం పట్టుకుంటారో ఆలోచించు.'),
        bank('need', [
          ['Which game needs NO equipment? | ఏ ఆటకు ఏ వస్తువూ అక్కర్లేదు?', 'Kabaddi | కబడ్డీ', ['Cricket | క్రికెట్', 'Badminton | బ్యాడ్మింటన్'], ['Only players and a ground. | ఆటగాళ్లు, మైదానం చాలు.', 'You touch and run. | తాకి పరిగెత్తుతారు.'], 'Kabaddi needs no equipment. | కబడ్డీకి వస్తువులు అక్కర్లేదు.', 'Cricket needs a bat; badminton needs rackets. | క్రికెట్‌కు బ్యాట్, బ్యాడ్మింటన్‌కు రాకెట్ కావాలి.', '🏃'],
          ['What do we roll in ludo and snakes and ladders? | లూడో, పాములు నిచ్చెనల్లో ఏది దొర్లిస్తాం?', 'A dice | పాచిక', ['A bat | బ్యాట్', 'A rope | తాడు'], ['It has dots from 1 to 6. | దానిపై 1 నుంచి 6 చుక్కలు.', 'It is a small cube. | చిన్న ఘనం.'], 'We roll a dice. | పాచిక దొర్లిస్తాం.', 'Bats and ropes are for outdoor games. | బ్యాట్, తాడు బయటి ఆటలకు.', '🎲'],
          ['What do we use to hit the shuttle? | షటిల్‌ను దేనితో కొడతాం?', 'A racket | రాకెట్', ['A dice | పాచిక', 'A stump | వికెట్'], ['It has strings in a frame. | చట్రంలో తీగలు ఉంటాయి.', 'Badminton. | బ్యాడ్మింటన్.'], 'A racket hits the shuttle. | రాకెట్‌తో షటిల్ కొడతాం.', 'A dice is rolled; a stump stands in cricket. | పాచిక దొర్లిస్తారు; వికెట్ క్రికెట్‌లో నిలబడుతుంది.', '🏸'],
          ['After playing, what should you do with the bat and ball? | ఆడిన తర్వాత బ్యాట్, బంతిని ఏం చేయాలి?', 'Keep them back safely | జాగ్రత్తగా తిరిగి పెట్టాలి', ['Leave them in the rain | వానలో వదిలేయాలి', 'Throw them on the road | రోడ్డుపై విసిరేయాలి'], ['You want to play again tomorrow. | రేపు మళ్లీ ఆడాలి కదా.', 'Rain spoils them. | వాన పాడు చేస్తుంది.'], 'Store sports things safely. | ఆట వస్తువులను జాగ్రత్తగా దాచు.', 'Things left outside get lost or spoiled. | బయట వదిలేస్తే పోతాయి లేదా పాడవుతాయి.', '📦'],
          ['Which is used in carrom? | క్యారమ్‌లో ఏది వాడతారు?', 'Striker | స్ట్రైకర్', ['Shuttle | షటిల్', 'Kite | గాలిపటం'], ['You flick it with a finger. | వేలితో కొడతారు.', 'It hits the coins. | కాయిన్లను కొడుతుంది.'], 'The striker is used in carrom. | క్యారమ్‌లో స్ట్రైకర్ వాడతారు.', 'Shuttles and kites fly in the air. | షటిల్, గాలిపటం గాలిలో ఎగురుతాయి.', '🟫'],
          ['What do we need to fly a kite? | గాలిపటం ఎగరేయడానికి ఏం కావాలి?', 'Kite, string and wind | గాలిపటం, దారం, గాలి', ['Bat and stumps | బ్యాట్, వికెట్లు', 'Board and dice | బోర్డు, పాచిక'], ['It goes up in the sky. | అది ఆకాశంలోకి వెళ్తుంది.', 'Hold it with a long thread. | పొడవైన దారంతో పట్టుకో.'], 'A kite, a string and wind. | గాలిపటం, దారం, గాలి.', 'Bats and boards are for other games. | బ్యాట్, బోర్డు వేరే ఆటలకు.', '🪁'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.play.rules', title: T('Rules of games and fair play | ఆట నియమాలు, న్యాయంగా ఆడటం'),
      intro: [
        H('Rules make games fair | నియమాలు ఆటను న్యాయంగా చేస్తాయి'),
        P('In kho-kho, a chaser touches a sitting friend\'s back and says "kho!" — then the friend runs. Everyone follows the same rules, so the game is fair. | ఖో-ఖోలో తరిమేవాడు కూర్చున్న స్నేహితుడి వీపు తాకి "ఖో!" అంటాడు — అప్పుడు ఆ స్నేహితుడు పరిగెత్తుతాడు. అందరూ ఒకే నియమాలు పాటిస్తారు, అందుకే ఆట న్యాయంగా ఉంటుంది.'),
        PIC('🏆', 'Winning is nice, but playing fairly is best. | గెలవడం బాగుంటుంది, కానీ న్యాయంగా ఆడటం ఇంకా గొప్ప.'),
        PIC('🏅', 'A medal for a race. Clap for the winners! | పరుగు పందెం పతకం. గెలిచినవాళ్లకు చప్పట్లు కొట్టు!'),
        KEYS('Rules tell us how to play, score and win. | నియమాలు ఎలా ఆడాలో, పాయింట్లు ఎలా వస్తాయో, ఎలా గెలవాలో చెబుతాయి.',
          'In kabaddi, the raider keeps saying "kabaddi, kabaddi" in one breath. | కబడ్డీలో రైడర్ ఒకే ఊపిరిలో "కబడ్డీ, కబడ్డీ" అంటూ ఉండాలి.',
          'An umpire or referee makes sure rules are followed. | అంపైర్ లేదా రిఫరీ నియమాలు పాటించేలా చూస్తారు.',
          'Wait for your turn. Never cheat. Shake hands after the game. | నీ వంతు కోసం ఎదురుచూడు. మోసం చేయకు. ఆట తర్వాత చేతులు కలుపు.'),
        REM('Losing is fine — practise and try again! | ఓడిపోవడం ఫరవాలేదు — సాధన చేసి మళ్లీ ప్రయత్నించు!'),
        TIP('Before a game, agree on the rules with all your friends. | ఆట ముందు స్నేహితులందరితో నియమాలు ఒప్పుకోండి.'),
      ],
      examples: [
        EX('In kabaddi, what must the raider keep saying? | కబడ్డీలో రైడర్ ఏం అంటూ ఉండాలి?', ['He goes to the other side in one breath. | అతను ఒకే ఊపిరిలో అవతలి వైపు వెళ్తాడు.', 'He keeps chanting to show he has not taken a new breath. | కొత్త ఊపిరి తీసుకోలేదని చూపించడానికి అంటూనే ఉంటాడు.'], '"Kabaddi, kabaddi…" | "కబడ్డీ, కబడ్డీ…"', '🗣️'),
        EX('Your team lost the match. What should you do? | మీ జట్టు ఓడిపోయింది. ఏం చేయాలి?', ['Clap for the winners. | గెలిచినవాళ్లకు చప్పట్లు కొట్టు.', 'Practise more. | ఇంకా సాధన చేయి.'], 'Shake hands and say "well played" | చేతులు కలిపి "బాగా ఆడారు" అను', '🤝'),
      ],
      practice: [
        bank('rule', [
          ['Why do games have rules? | ఆటలకు నియమాలు ఎందుకు?', 'So the game is fair for everyone | ఆట అందరికీ న్యాయంగా ఉండటానికి', ['So one person always wins | ఒక్కరే ఎప్పుడూ గెలవడానికి', 'To make games boring | ఆటలు విసుగ్గా చేయడానికి'], ['What if everyone made their own rules? | ఎవరి నియమాలు వాళ్లు పెట్టుకుంటే?', 'Same rules for all. | అందరికీ ఒకే నియమాలు.'], 'Rules keep games fair and safe. | నియమాలు ఆటను న్యాయంగా, సురక్షితంగా ఉంచుతాయి.', 'Rules are for fairness, not for one winner. | నియమాలు న్యాయం కోసం, ఒక్కరి గెలుపు కోసం కాదు.', '⚖'],
          ['In kho-kho, how does the chaser let a team-mate run? | ఖో-ఖోలో తరిమేవాడు తన జట్టు సభ్యుడిని ఎలా పరిగెత్తిస్తాడు?', 'Touches his back and says "kho" | వీపు తాకి "ఖో" అంటాడు', ['Throws a ball at him | అతనిపై బంతి విసురుతాడు', 'Blows a whistle | ఈల వేస్తాడు'], ['The game is named after the call. | ఆట పేరు ఆ పిలుపు నుంచే.', 'Kho! | ఖో!'], 'Touch the back and say "kho". | వీపు తాకి "ఖో" అను.', 'Kho-kho has no ball. | ఖో-ఖోలో బంతి లేదు.', '🏃'],
          ['Who decides "out" in a cricket match? | క్రికెట్‌లో "అవుట్" అని ఎవరు చెబుతారు?', 'The umpire | అంపైర్', ['The bowler | బౌలర్', 'The audience | ప్రేక్షకులు'], ['He raises one finger. | ఒక వేలు పైకి ఎత్తుతాడు.', 'He stands near the stumps. | వికెట్ల దగ్గర నిలబడతాడు.'], 'The umpire decides by the rules. | అంపైర్ నియమాల ప్రకారం నిర్ణయిస్తాడు.', 'Players play; the umpire judges. | ఆటగాళ్లు ఆడతారు; అంపైర్ తీర్పు చెబుతాడు.', '☝️'],
          ['A player hides the dice to win. Is it fair? | గెలవడానికి ఒకరు పాచిక దాచారు. అది న్యాయమా?', 'No, it is cheating | కాదు, అది మోసం', ['Yes, winning is all | అవును, గెలుపే ముఖ్యం'], ['Are rules the same for all? | అందరికీ నియమాలు ఒకటేనా?', 'Breaking them on purpose is…? | కావాలని ఉల్లంఘిస్తే…?'], 'Hiding the dice is cheating. | పాచిక దాచడం మోసం.', 'Fair play means following the rules. | న్యాయంగా ఆడటం అంటే నియమాలు పాటించడం.', '🎲'],
          ['You lost a race. What is the best thing to say? | పరుగు పందెంలో ఓడిపోయావు. ఏమనడం మంచిది?', '"I will practise and try again." | "సాధన చేసి మళ్లీ ప్రయత్నిస్తా."', ['"I will never play again." | "ఇంకెప్పుడూ ఆడను."', '"The winner is bad." | "గెలిచినవాడు చెడ్డవాడు."'], ['Losing helps us learn. | ఓటమి నేర్పిస్తుంది.', 'Be a good sport. | మంచి ఆటగాడిగా ఉండు.'], 'Practise and try again. | సాధన చేసి మళ్లీ ప్రయత్నించు.', 'Giving up or blaming others is not good sport. | వదిలేయడం, ఇతరులను నిందించడం మంచిది కాదు.', '🏅'],
          ['Everyone wants the first turn on the swing. What is fair? | అందరికీ ముందు ఉయ్యాల కావాలి. ఏది న్యాయం?', 'Stand in a line and take turns | వరుసలో నిలబడి వంతులు వేసుకోవడం', ['Push others away | ఇతరులను తోసేయడం', 'The biggest child always goes first | పెద్ద పిల్లాడే ఎప్పుడూ ముందు'], ['Everyone should get a chance. | అందరికీ అవకాశం రావాలి.', 'One by one. | ఒకరి తర్వాత ఒకరు.'], 'Take turns in a line. | వరుసలో వంతుల ప్రకారం.', 'Pushing is unsafe and unfair. | తోయడం ప్రమాదం, అన్యాయం.', '🛝'],
        ]),
        tapT('sport', 'Tap ALL the actions of a good sport. | మంచి ఆటగాడి పనులన్నీ నొక్కు.',
          ['saying "well played" | "బాగా ఆడావు" అనడం', 'helping a fallen player up | పడిపోయినవాళ్లను లేపడం', 'following the umpire | అంపైర్ మాట వినడం', 'waiting for your turn | నీ వంతు కోసం ఎదురుచూడటం', 'letting new children join | కొత్త పిల్లలను చేర్చుకోవడం'],
          ['pushing others | ఇతరులను తోయడం', 'hiding the ball | బంతి దాచడం', 'teasing the losing team | ఓడిన జట్టును ఎగతాళి చేయడం', 'changing rules only to win | గెలవడానికే నియమాలు మార్చడం'],
          ['Would you like it if someone did this to you? | ఎవరైనా నీకు ఇలా చేస్తే నచ్చుతుందా?', 'Good sports are kind and fair. | మంచి ఆటగాళ్లు దయగా, న్యాయంగా ఉంటారు.'],
          'A good sport is fair and kind to everyone. | మంచి ఆటగాడు అందరితో న్యాయంగా, దయగా ఉంటాడు.'),
      ],
    },
  ],
};

// ================================================================== CH 4 Shelters of Animals
const ch4: USpec = {
  id: 'ts3.evs.ch4', subject: 'evs', title: T('Shelters of Animals | జంతువుల నివాసాలు'), source: src(4),
  objectives: [
    {
      id: 'ts3.evs.shelter.homes', title: T('Where animals and birds live | జంతువులు, పక్షులు ఎక్కడ ఉంటాయి'),
      intro: [
        H('Every animal needs a home | ప్రతి జంతువుకు ఇల్లు కావాలి'),
        P('A sparrow builds a nest with grass and twigs. A rat lives in a hole. A cow lives in a cowshed. A lion lives in a den in the forest. | పిచ్చుక గడ్డి, పుల్లలతో గూడు కడుతుంది. ఎలుక కన్నంలో ఉంటుంది. ఆవు పశువుల పాకలో ఉంటుంది. సింహం అడవిలో గుహలో ఉంటుంది.'),
        PIC('🪺', 'A bird\'s nest keeps its eggs and babies safe. | పక్షి గూడు గుడ్లను, పిల్లలను కాపాడుతుంది.'),
        PIC('🐄', 'A cow rests in a cowshed. | ఆవు పాకలో విశ్రాంతి తీసుకుంటుంది.'),
        KEYS('Nest → birds. Hole → rat, rabbit, snake. | గూడు → పక్షులు. కన్నం → ఎలుక, కుందేలు, పాము.',
          'Den → lion, tiger. Kennel → dog. Stable → horse. | గుహ → సింహం, పులి. కుక్కల గూడు → కుక్క. గుర్రపు శాల → గుర్రం.',
          'Hive → bees. Anthill → ants. Web → spider. | తేనెపట్టు → తేనెటీగలు. పుట్ట → చీమలు. గూడు (సాలెగూడు) → సాలీడు.',
          'A shelter keeps animals safe from sun, rain, cold and enemies. | నివాసం జంతువులను ఎండ, వాన, చలి, శత్రువుల నుంచి కాపాడుతుంది.'),
        REM('Do not break nests or anthills — they are someone\'s home. | గూళ్లను, పుట్టలను పాడుచేయకు — అవి వేరే వాళ్ల ఇళ్లు.'),
        TIP('Look for a nest in a tree near your school. Watch quietly from far. | బడి దగ్గర చెట్టుపై గూడు వెతుకు. దూరం నుంచి నిశ్శబ్దంగా చూడు.'),
      ],
      examples: [
        EX('Where does a dog live? | కుక్క ఎక్కడ ఉంటుంది?', ['People build a small house for pet dogs. | పెంపుడు కుక్కల కోసం చిన్న ఇల్లు కడతారు.'], 'In a kennel | కుక్కల గూటిలో', '🐕'),
        EX('Why does a bird build a nest? | పక్షి గూడు ఎందుకు కడుతుంది?', ['To lay eggs. | గుడ్లు పెట్టడానికి.', 'To keep its babies safe. | పిల్లలను కాపాడటానికి.'], 'To keep eggs and babies safe | గుడ్లు, పిల్లలను కాపాడటానికి', '🪺'),
      ],
      practice: [
        matchT('home', 'Match each animal to its home. | ప్రతి జంతువును దాని ఇంటితో జత చేయి.', [
          ['Bird | పక్షి', 'nest | గూడు', '🐦'], ['Lion | సింహం', 'den | గుహ', '🦁'], ['Dog | కుక్క', 'kennel | కుక్కల గూడు', '🐕'],
          ['Horse | గుర్రం', 'stable | గుర్రపు శాల', '🐎'], ['Cow | ఆవు', 'cowshed | పశువుల పాక', '🐄'], ['Ant | చీమ', 'anthill | పుట్ట', '🐜'],
          ['Spider | సాలీడు', 'web | సాలెగూడు', '🕸️'], ['Rat | ఎలుక', 'hole | కన్నం', '🐀'], ['Hen | కోడి', 'coop | కోళ్ల గూడు', '🐓'],
        ], ['Picture where you see each animal. | ప్రతి జంతువును ఎక్కడ చూస్తావో ఊహించు.', 'Start with the bird. | పక్షితో మొదలుపెట్టు.'], 'Each animal has its own kind of home. Think again. | ప్రతి జంతువుకు సొంత రకం ఇల్లు ఉంటుంది. మళ్లీ ఆలోచించు.'),
        bank('where', [
          ['Where do bees live? | తేనెటీగలు ఎక్కడ ఉంటాయి?', 'In a hive | తేనెపట్టులో', ['In a stable | గుర్రపు శాలలో', 'In a kennel | కుక్కల గూటిలో'], ['They make honey there. | అక్కడ తేనె చేస్తాయి.', 'It hangs from a branch. | కొమ్మకు వేలాడుతుంది.'], 'Bees live in a hive. | తేనెటీగలు తేనెపట్టులో ఉంటాయి.', 'Stables are for horses; kennels for dogs. | శాల గుర్రాలకు; గూడు కుక్కలకు.', '🍯'],
          ['Which animal lives in a den? | గుహలో ఏ జంతువు ఉంటుంది?', 'Tiger | పులి', ['Hen | కోడి', 'Sparrow | పిచ్చుక'], ['A wild animal of the forest. | అడవిలోని క్రూర జంతువు.', 'It has stripes. | దానికి చారలు ఉంటాయి.'], 'Tigers and lions live in dens. | పులులు, సింహాలు గుహల్లో ఉంటాయి.', 'Hens live in coops; sparrows in nests. | కోళ్లు గూళ్లలో; పిచ్చుకలు గూడులో.', '🐅'],
          ['What does a bird use to build a nest? | గూడు కట్టడానికి పక్షి ఏం వాడుతుంది?', 'Twigs, grass and feathers | పుల్లలు, గడ్డి, ఈకలు', ['Bricks and cement | ఇటుకలు, సిమెంట్', 'Plastic chairs | ప్లాస్టిక్ కుర్చీలు'], ['Things it can carry in its beak. | ముక్కుతో మోయగలిగేవి.', 'Soft and light. | మెత్తగా, తేలికగా.'], 'Birds use twigs, grass and feathers. | పక్షులు పుల్లలు, గడ్డి, ఈకలు వాడతాయి.', 'Birds cannot carry bricks or chairs. | పక్షులు ఇటుకలు, కుర్చీలు మోయలేవు.', '🪶'],
          ['Why do animals need a shelter? | జంతువులకు నివాసం ఎందుకు కావాలి?', 'To be safe from rain, sun, cold and enemies | వాన, ఎండ, చలి, శత్రువుల నుంచి కాపాడుకోవడానికి', ['To watch TV | టీవీ చూడటానికి', 'To go to school | బడికి వెళ్లడానికి'], ['Why do we need a house? | మనకు ఇల్లు ఎందుకు?', 'Safety. | భద్రత.'], 'A shelter keeps animals safe. | నివాసం జంతువులను కాపాడుతుంది.', 'Animals do not watch TV or go to school! | జంతువులు టీవీ చూడవు, బడికి వెళ్లవు!', '🏠'],
          ['Where does a rabbit live in the wild? | అడవిలో కుందేలు ఎక్కడ ఉంటుంది?', 'In a burrow (hole in the ground) | బొరియలో (నేలలో కన్నం)', ['In a nest on a tree | చెట్టుపై గూడులో', 'In water | నీటిలో'], ['It digs with its paws. | కాళ్లతో తవ్వుతుంది.', 'Under the ground. | నేల కింద.'], 'Rabbits live in burrows. | కుందేళ్లు బొరియల్లో ఉంటాయి.', 'Rabbits cannot fly or live in water. | కుందేళ్లు ఎగరలేవు, నీటిలో ఉండలేవు.', '🐇'],
          ['Which animal makes its own home with silk threads? | సొంత దారాలతో ఇల్లు కట్టుకునే జంతువు ఏది?', 'Spider | సాలీడు', ['Cow | ఆవు', 'Horse | గుర్రం'], ['Look in corners of a room. | గది మూలల్లో చూడు.', 'It catches insects in it. | దానిలో పురుగులను పడుతుంది.'], 'The spider weaves a web. | సాలీడు సాలెగూడు అల్లుతుంది.', 'Cows and horses live in sheds people build. | ఆవులు, గుర్రాలు మనుషులు కట్టిన పాకల్లో ఉంటాయి.', '🕸️'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.shelter.migrate', title: T('Birds that travel far | వలస పక్షులు'),
      intro: [
        H('Visitors from far away | దూరం నుంచి వచ్చే అతిథులు'),
        P('Every winter, flamingos and other birds fly thousands of kilometres to lakes in India where it is warm and food is easy to find. In spring they fly back. These are migratory birds. | ప్రతి చలికాలం ఫ్లెమింగోలు, ఇంకా ఎన్నో పక్షులు వేల కిలోమీటర్లు ఎగిరి వెచ్చగా ఉండే, ఆహారం దొరికే భారత దేశపు చెరువులకు వస్తాయి. వసంతంలో తిరిగి వెళ్తాయి. ఇవే వలస పక్షులు.'),
        PIC('🦢', 'Some birds fly very far in winter. | కొన్ని పక్షులు చలికాలంలో చాలా దూరం ఎగురుతాయి.'),
        PIC('🦆', 'Ducks and many water birds visit our lakes. | బాతులు, చాలా నీటి పక్షులు మన చెరువులకు వస్తాయి.'),
        KEYS('Birds migrate to escape cold and find food. | చలి నుంచి తప్పించుకుని ఆహారం వెతుక్కోవడానికి పక్షులు వలస వస్తాయి.',
          'They come to lakes and tanks, for example near Hyderabad. | హైదరాబాద్ దగ్గరి లాంటి చెరువులకు, కుంటలకు వస్తాయి.',
          'They return home when the weather changes. | వాతావరణం మారినప్పుడు ఇంటికి తిరిగి వెళ్తాయి.'),
        REM('Keep lakes clean so visiting birds stay safe. | అతిథి పక్షులు సురక్షితంగా ఉండేలా చెరువులను శుభ్రంగా ఉంచాలి.'),
        TIP('On a winter morning, look at a lake. Do you see birds you never saw in summer? | చలికాలం ఉదయం చెరువు చూడు. వేసవిలో కనిపించని పక్షులు కనిపిస్తున్నాయా?'),
      ],
      examples: [
        EX('Why do some birds fly to India in winter? | కొన్ని పక్షులు చలికాలంలో భారతదేశానికి ఎందుకు వస్తాయి?', ['Their home becomes very cold and snowy. | వాటి సొంత ప్రదేశం బాగా చల్లగా, మంచుతో నిండుతుంది.', 'India is warmer with more food. | భారతదేశం వెచ్చగా, ఎక్కువ ఆహారంతో ఉంటుంది.'], 'To escape the cold and find food | చలి నుంచి తప్పించుకుని ఆహారం కోసం', '❄️'),
        EX('What do we call birds that travel far and come back every year? | ప్రతి ఏడాది దూరం ప్రయాణించి తిరిగి వచ్చే పక్షులను ఏమంటారు?', ['They move from place to place by season. | కాలాన్ని బట్టి ఒక చోటు నుంచి మరో చోటుకు వెళ్తాయి.'], 'Migratory birds | వలస పక్షులు', '🦢'),
      ],
      practice: [
        bank('mig', [
          ['What are birds that travel far every year called? | ప్రతి ఏడాది దూరం ప్రయాణించే పక్షులను ఏమంటారు?', 'Migratory birds | వలస పక్షులు', ['Pet birds | పెంపుడు పక్షులు', 'Toy birds | బొమ్మ పక్షులు'], ['They migrate. | అవి వలస వెళ్తాయి.', 'They come and go with seasons. | కాలాలతో వచ్చి వెళ్తాయి.'], 'They are migratory birds. | అవి వలస పక్షులు.', 'Pet birds stay with people at home. | పెంపుడు పక్షులు ఇంట్లోనే ఉంటాయి.', '🦢'],
          ['In which season do migratory birds come to our lakes? | వలస పక్షులు మన చెరువులకు ఏ కాలంలో వస్తాయి?', 'Winter | చలికాలం', ['Summer | వేసవి', 'Never | ఎప్పుడూ రావు'], ['Their homes become snowy. | వాటి ప్రదేశాల్లో మంచు కురుస్తుంది.', 'Cold season. | చల్లని కాలం.'], 'They come in winter. | అవి చలికాలంలో వస్తాయి.', 'In summer they fly back home. | వేసవిలో తిరిగి వెళ్లిపోతాయి.', '❄️'],
          ['Why do birds migrate? | పక్షులు ఎందుకు వలస వెళ్తాయి?', 'To escape cold and find food | చలి నుంచి తప్పించుకుని ఆహారం కోసం', ['To go shopping | షాపింగ్ కోసం', 'Because they are lost | దారి తప్పి'], ['Food is hard to find in snow. | మంచులో ఆహారం దొరకదు.', 'Warm places have food. | వెచ్చని చోట్ల ఆహారం ఉంటుంది.'], 'Birds migrate for warmth and food. | వెచ్చదనం, ఆహారం కోసం పక్షులు వలస వెళ్తాయి.', 'Birds know their way; they are not lost. | పక్షులకు దారి తెలుసు; దారి తప్పవు.', '🐟'],
          ['Where do many migratory birds stay in Telangana? | తెలంగాణలో వలస పక్షులు ఎక్కువగా ఎక్కడ ఉంటాయి?', 'Near lakes and tanks | చెరువులు, కుంటల దగ్గర', ['In shopping malls | షాపింగ్ మాల్స్‌లో', 'Inside buses | బస్సుల్లో'], ['They eat fish and water plants. | చేపలు, నీటి మొక్కలు తింటాయి.', 'Water places. | నీళ్లు ఉన్న చోట్లు.'], 'They stay near lakes and tanks. | చెరువులు, కుంటల దగ్గర ఉంటాయి.', 'Birds need water and food, not malls. | పక్షులకు నీళ్లు, ఆహారం కావాలి, మాల్స్ కాదు.', '🏞️'],
          ['How can we help visiting birds? | అతిథి పక్షులకు ఎలా సాయం చేయగలం?', 'Keep lakes clean and do not disturb them | చెరువులను శుభ్రంగా ఉంచి వాటిని ఇబ్బంది పెట్టకుండా', ['Throw stones at them | వాటిపై రాళ్లు విసిరి', 'Throw plastic in the lake | చెరువులో ప్లాస్టిక్ వేసి'], ['They need clean water. | వాటికి శుభ్రమైన నీళ్లు కావాలి.', 'Watch quietly. | నిశ్శబ్దంగా చూడు.'], 'Keep lakes clean and watch quietly. | చెరువులు శుభ్రంగా ఉంచి నిశ్శబ్దంగా చూడు.', 'Stones and plastic harm birds. | రాళ్లు, ప్లాస్టిక్ పక్షులకు హాని.', '🔭'],
          ['When winter ends, migratory birds… | చలికాలం ముగిశాక వలస పక్షులు…', 'fly back to their homes | తిరిగి సొంత ప్రదేశాలకు ఎగిరి వెళ్తాయి', ['stay in one place forever | ఎప్పటికీ ఒకే చోట ఉంటాయి', 'turn into fish | చేపలుగా మారతాయి'], ['The weather at home gets warm again. | సొంత చోట మళ్లీ వెచ్చగా అవుతుంది.', 'They return. | తిరిగి వెళ్తాయి.'], 'They fly back home. | అవి తిరిగి వెళ్తాయి.', 'Migratory birds return every year. | వలస పక్షులు ప్రతి ఏడాది తిరిగి వెళ్తాయి.', '🦆'],
        ]),
        orderT('trip', 'Put the bird\'s year in order. | పక్షి సంవత్సరాన్ని వరుసలో పెట్టు.', [
          'Its home becomes very cold | దాని ప్రదేశం బాగా చల్లబడుతుంది', 'It flies far to a warm lake | దూరంగా వెచ్చని చెరువుకు ఎగురుతుంది', 'It eats and rests there all winter | చలికాలమంతా అక్కడ తిని విశ్రాంతి తీసుకుంటుంది', 'It flies back home in spring | వసంతంలో తిరిగి వెళ్తుంది',
        ], ['What happens first — cold or flying? | ముందు ఏమవుతుంది — చలా, ఎగరడమా?', 'Going back comes last. | తిరిగి వెళ్లడం చివర.'], 'First the cold, then the trip, the stay, and the return. | ముందు చలి, తర్వాత ప్రయాణం, అక్కడ ఉండటం, తిరిగి రావడం.'),
      ],
    },
    {
      id: 'ts3.evs.shelter.insects', title: T('Insects and kindness to animals | కీటకాలు, జంతువులపై దయ'),
      intro: [
        H('Tiny creatures all around | చుట్టూ చిన్న జీవులు'),
        P('Ants walk in a line. A butterfly sits on a flower. A ladybird crawls on a leaf. These are insects. An insect has six legs. | చీమలు వరుసగా నడుస్తాయి. సీతాకోకచిలుక పువ్వుపై వాలుతుంది. పురుగు ఆకుపై పాకుతుంది. ఇవి కీటకాలు. కీటకానికి ఆరు కాళ్లు ఉంటాయి.'),
        PIC('🦋', 'A butterfly drinks nectar from flowers. | సీతాకోకచిలుక పువ్వుల్లోని మకరందం తాగుతుంది.'),
        PIC('🐜', 'Ants live together in an anthill and share food. | చీమలు పుట్టలో కలిసి ఉండి ఆహారం పంచుకుంటాయి.'),
        PIC('🐞', 'A ladybird eats tiny pests on plants. | పురుగు మొక్కలపై చిన్న పురుగులను తింటుంది.'),
        KEYS('Insects have six legs: ant, bee, butterfly, housefly, mosquito. | కీటకాలకు ఆరు కాళ్లు: చీమ, తేనెటీగ, సీతాకోకచిలుక, ఈగ, దోమ.',
          'A spider has eight legs, so it is NOT an insect. | సాలీడుకు ఎనిమిది కాళ్లు, కాబట్టి అది కీటకం కాదు.',
          'Bees and butterflies help flowers make fruits. | తేనెటీగలు, సీతాకోకచిలుకలు పువ్వులు పండ్లుగా మారడానికి సాయం చేస్తాయి.',
          'Be kind: give water to birds in summer, never hurt animals. | దయగా ఉండు: వేసవిలో పక్షులకు నీళ్లు పెట్టు, జంతువులను బాధపెట్టకు.'),
        REM('Animals feel pain just like us. | జంతువులకు మనలాగే నొప్పి తెలుస్తుంది.'),
        TIP('Keep a bowl of water on your roof or balcony for birds this summer. | ఈ వేసవిలో పక్షుల కోసం మేడ మీద లేదా బాల్కనీలో ఒక గిన్నె నీళ్లు పెట్టు.'),
      ],
      examples: [
        EX('Count the legs of an ant. Is it an insect? | చీమ కాళ్లు లెక్కించు. అది కీటకమా?', ['An ant has 6 legs. | చీమకు 6 కాళ్లు.', 'Six legs means insect. | ఆరు కాళ్లు అంటే కీటకం.'], 'Yes, an ant is an insect | అవును, చీమ కీటకం', '🐜'),
        EX('A puppy is hungry and shivering in the rain. What can you do? | వానలో ఒక కుక్కపిల్ల ఆకలితో వణుకుతోంది. నువ్వు ఏం చేయవచ్చు?', ['Ask an elder to help. | పెద్దవాళ్లను సాయం అడుగు.', 'Give it a dry place and some food. | పొడి చోటు, కొంచెం ఆహారం ఇవ్వు.'], 'Give it shelter and food with an elder\'s help | పెద్దల సాయంతో నీడ, ఆహారం ఇవ్వు', '🐶'),
      ],
      practice: [
        tapT('insect', 'Tap ALL the insects (six legs). | కీటకాలన్నీ నొక్కు (ఆరు కాళ్లు).',
          ['ant | చీమ', 'bee | తేనెటీగ', 'butterfly | సీతాకోకచిలుక', 'housefly | ఈగ', 'mosquito | దోమ', 'ladybird | ఎర్ర పురుగు'],
          ['spider | సాలీడు', 'cow | ఆవు', 'sparrow | పిచ్చుక', 'earthworm | వానపాము', 'cat | పిల్లి'],
          ['Count the legs. | కాళ్లు లెక్కించు.', 'A spider has eight legs. | సాలీడుకు ఎనిమిది కాళ్లు.'],
          'Insects have exactly six legs. Spiders have eight; worms have none. | కీటకాలకు సరిగ్గా ఆరు కాళ్లు. సాలీడుకు ఎనిమిది; వానపాముకు కాళ్లు లేవు.'),
        bank('kind', [
          ['How many legs does an insect have? | కీటకానికి ఎన్ని కాళ్లు ఉంటాయి?', 'Six | ఆరు', ['Eight | ఎనిమిది', 'Four | నాలుగు'], ['Count an ant\'s legs. | చీమ కాళ్లు లెక్కించు.', 'Three on each side. | ఒక్కో వైపు మూడు.'], 'Insects have six legs. | కీటకాలకు ఆరు కాళ్లు.', 'Eight legs is a spider; four legs is a dog. | ఎనిమిది కాళ్లు సాలీడుకు; నాలుగు కుక్కకు.', '🐜'],
          ['It is very hot. How can you help birds? | బాగా ఎండగా ఉంది. పక్షులకు ఎలా సాయం చేయగలవు?', 'Keep a bowl of water outside | బయట ఒక గిన్నె నీళ్లు పెట్టు', ['Close all windows and sleep | కిటికీలు మూసి నిద్రపో', 'Chase them away | వాటిని తరిమేయి'], ['Birds get thirsty too. | పక్షులకూ దాహం వేస్తుంది.', 'Water! | నీళ్లు!'], 'A bowl of water helps thirsty birds. | గిన్నెలో నీళ్లు దాహంతో ఉన్న పక్షులకు సాయం.', 'Chasing birds does not help them. | పక్షులను తరమడం సాయం కాదు.', '💧'],
          ['A boy throws stones at a dog. Is this right? | ఒక అబ్బాయి కుక్కపై రాళ్లు విసురుతున్నాడు. ఇది సరైనదా?', 'No, animals feel pain | కాదు, జంతువులకు నొప్పి తెలుస్తుంది', ['Yes, it is a game | అవును, అది ఆట'], ['Would you like stones thrown at you? | నీపై రాళ్లు విసిరితే నచ్చుతుందా?', 'Be kind. | దయగా ఉండు.'], 'Never hurt animals. | జంతువులను ఎప్పుడూ బాధపెట్టకు.', 'Hurting animals is never a game. | జంతువులను బాధపెట్టడం ఎప్పుడూ ఆట కాదు.', '🐕'],
          ['Which insect gives us honey? | మనకు తేనె ఇచ్చే కీటకం ఏది?', 'Honeybee | తేనెటీగ', ['Mosquito | దోమ', 'Housefly | ఈగ'], ['It lives in a hive. | తేనెపట్టులో ఉంటుంది.', 'It buzzes around flowers. | పువ్వుల చుట్టూ ఝుమ్మంటుంది.'], 'Honeybees make honey. | తేనెటీగలు తేనె తయారు చేస్తాయి.', 'Mosquitoes and flies do not make honey. | దోమలు, ఈగలు తేనె చేయవు.', '🍯'],
          ['Which creature is NOT an insect? | ఏ జీవి కీటకం కాదు?', 'Spider | సాలీడు', ['Ant | చీమ', 'Butterfly | సీతాకోకచిలుక'], ['Count the legs. | కాళ్లు లెక్కించు.', 'Eight legs is not an insect. | ఎనిమిది కాళ్లు కీటకం కాదు.'], 'A spider has 8 legs, so it is not an insect. | సాలీడుకు 8 కాళ్లు, కాబట్టి కీటకం కాదు.', 'Ants and butterflies have 6 legs — they are insects. | చీమలు, సీతాకోకచిలుకలకు 6 కాళ్లు — అవి కీటకాలు.', '🕸️'],
          ['How do butterflies and bees help plants? | సీతాకోకచిలుకలు, తేనెటీగలు మొక్కలకు ఎలా సాయం చేస్తాయి?', 'They help flowers become fruits | పువ్వులు పండ్లుగా మారడానికి సాయం చేస్తాయి', ['They water the plants | మొక్కలకు నీళ్లు పోస్తాయి', 'They cut the leaves | ఆకులు కోస్తాయి'], ['They go from flower to flower. | పువ్వు నుంచి పువ్వుకు వెళ్తాయి.', 'They carry pollen. | పుప్పొడి మోస్తాయి.'], 'They carry pollen and help fruits form. | పుప్పొడి మోసి పండ్లు రావడానికి సాయం చేస్తాయి.', 'Insects cannot water plants. | కీటకాలు నీళ్లు పోయలేవు.', '🦋'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 5 The Plants Around Us
const ch5: USpec = {
  id: 'ts3.evs.ch5', subject: 'evs', title: T('The Plants Around Us | మన చుట్టూ ఉన్న మొక్కలు'), source: src(5),
  objectives: [
    {
      id: 'ts3.evs.plants.variety', title: T('Many kinds of trees and plants | రకరకాల చెట్లు, మొక్కలు'),
      intro: [
        H('Big trees, small plants | పెద్ద చెట్లు, చిన్న మొక్కలు'),
        P('Near Kavya\'s school there is a huge banyan tree, a tall coconut tree, a mango tree and small tulasi plants. Plants come in many sizes! | కావ్య బడి దగ్గర పెద్ద మర్రి చెట్టు, ఎత్తైన కొబ్బరి చెట్టు, మామిడి చెట్టు, చిన్న తులసి మొక్కలు ఉన్నాయి. మొక్కలు ఎన్నో పరిమాణాల్లో ఉంటాయి!'),
        PIC('🌳', 'A big tree has a thick, hard trunk. | పెద్ద చెట్టుకు లావైన, గట్టి కాండం ఉంటుంది.'),
        PIC('🌴', 'A coconut tree is tall with no branches. | కొబ్బరి చెట్టు ఎత్తుగా, కొమ్మలు లేకుండా ఉంటుంది.'),
        PIC('🌱', 'A small plant has a soft, green stem. | చిన్న మొక్కకు మెత్తని, పచ్చని కాండం ఉంటుంది.'),
        KEYS('Trees are big with hard, thick trunks: neem, banyan, mango. | చెట్లు పెద్దవి, గట్టి లావైన కాండం: వేప, మర్రి, మామిడి.',
          'Herbs are small with soft stems: tulasi, coriander, grass. | చిన్న మొక్కలకు మెత్తని కాండం: తులసి, కొత్తిమీర, గడ్డి.',
          'Climbers need support to grow up: money plant, bottle gourd. | తీగలు పైకి ఎదగడానికి ఆధారం కావాలి: మనీ ప్లాంట్, సొరకాయ.',
          'Tangedu (Tanner\'s cassia) with yellow flowers is the state flower of Telangana; jammi is the state tree. | పసుపు పువ్వుల తంగేడు తెలంగాణ రాష్ట్ర పుష్పం; జమ్మి రాష్ట్ర వృక్షం.'),
        REM('Plants are living things — they grow, need water and air. | మొక్కలు జీవులు — అవి పెరుగుతాయి, వాటికి నీరు, గాలి కావాలి.'),
        TIP('Hug a tree near you. Can your arms go all around it? | దగ్గరలోని చెట్టును కౌగిలించుకో. నీ చేతులు దాని చుట్టూ వస్తాయా?'),
      ],
      examples: [
        EX('Tulasi has a soft green stem and is small. Is it a tree or a small plant (herb)? | తులసి చిన్నగా, మెత్తని పచ్చని కాండంతో ఉంటుంది. ఇది చెట్టా, చిన్న మొక్కా?', ['Trees have thick, hard trunks. | చెట్లకు లావైన గట్టి కాండం.', 'Tulasi\'s stem is soft. | తులసి కాండం మెత్తగా ఉంటుంది.'], 'A small plant (herb) | చిన్న మొక్క', '🌱'),
        EX('A money plant grows up a wall with support. What kind of plant is it? | మనీ ప్లాంట్ ఆధారంతో గోడ మీదికి ఎదుగుతుంది. ఇది ఏ రకం మొక్క?', ['Its stem is weak. | దాని కాండం బలహీనం.', 'It climbs with support. | ఆధారంతో పైకి పాకుతుంది.'], 'A climber | తీగ మొక్క', '🍃'),
      ],
      practice: [
        bank('kind', [
          ['Which is a big tree? | వీటిలో పెద్ద చెట్టు ఏది?', 'Banyan | మర్రి', ['Tulasi | తులసి', 'Coriander | కొత్తిమీర'], ['It has hanging roots. | వేలాడే వేర్లు ఉంటాయి.', 'Many people sit in its shade. | ఎంతోమంది దాని నీడలో కూర్చుంటారు.'], 'The banyan is a huge tree. | మర్రి చాలా పెద్ద చెట్టు.', 'Tulasi and coriander are small plants. | తులసి, కొత్తిమీర చిన్న మొక్కలు.', '🌳'],
          ['Which plant needs support to grow up? | పైకి ఎదగడానికి ఆధారం కావాల్సిన మొక్క ఏది?', 'Bottle gourd creeper | సొరకాయ తీగ', ['Neem tree | వేప చెట్టు', 'Coconut tree | కొబ్బరి చెట్టు'], ['Its stem is thin and weak. | దాని కాండం సన్నగా, బలహీనంగా ఉంటుంది.', 'It climbs a pandal. | పందిరి మీదికి పాకుతుంది.'], 'A gourd creeper needs support. | సొరకాయ తీగకు ఆధారం కావాలి.', 'Neem and coconut stand on their own strong trunks. | వేప, కొబ్బరి సొంత బలమైన కాండంపై నిలుస్తాయి.', '🍃'],
          ['What is the state flower of Telangana? | తెలంగాణ రాష్ట్ర పుష్పం ఏది?', 'Tangedu | తంగేడు', ['Rose | గులాబీ', 'Lotus | తామర'], ['It is yellow. | అది పసుపు రంగులో ఉంటుంది.', 'Used in Bathukamma. | బతుకమ్మలో వాడతారు.'], 'Tangedu is the state flower. | తంగేడు రాష్ట్ర పుష్పం.', 'Rose and lotus are not Telangana\'s state flower. | గులాబీ, తామర తెలంగాణ రాష్ట్ర పుష్పం కాదు.', '🌼'],
          ['A tree\'s trunk is… | చెట్టు కాండం…', 'thick and hard | లావుగా, గట్టిగా ఉంటుంది', ['soft and green | మెత్తగా, పచ్చగా ఉంటుంది', 'made of plastic | ప్లాస్టిక్‌తో ఉంటుంది'], ['Knock on a tree. | చెట్టును తట్టి చూడు.', 'It is woody. | అది చెక్కలా ఉంటుంది.'], 'Tree trunks are thick and hard. | చెట్ల కాండం లావుగా, గట్టిగా ఉంటుంది.', 'Soft green stems belong to small plants. | మెత్తని పచ్చ కాండం చిన్న మొక్కలది.', '🪵'],
          ['Which tree gives us coconuts? | కొబ్బరికాయలు ఇచ్చే చెట్టు ఏది?', 'Coconut palm | కొబ్బరి చెట్టు', ['Neem | వేప', 'Banyan | మర్రి'], ['Tall with leaves only at the top. | ఎత్తుగా, పైన మాత్రమే ఆకులు.', 'Name is in the question! | పేరు ప్రశ్నలోనే ఉంది!'], 'Coconut palms give coconuts. | కొబ్బరి చెట్లు కొబ్బరికాయలు ఇస్తాయి.', 'Neem and banyan do not give coconuts. | వేప, మర్రి కొబ్బరి ఇవ్వవు.', '🥥'],
          ['Are plants living things? | మొక్కలు జీవులా?', 'Yes, they grow and need water | అవును, అవి పెరుగుతాయి, నీళ్లు కావాలి', ['No, they are like stones | కాదు, అవి రాళ్లలాంటివి'], ['Does a seed grow? | విత్తనం పెరుగుతుందా?', 'Stones never grow. | రాళ్లు పెరగవు.'], 'Plants are living — they grow. | మొక్కలు జీవులు — అవి పెరుగుతాయి.', 'Stones do not grow; plants do. | రాళ్లు పెరగవు; మొక్కలు పెరుగుతాయి.', '🌱'],
        ]),
        tapT('tree', 'Tap ALL the big TREES. | పెద్ద చెట్లన్నీ నొక్కు.',
          ['neem | వేప', 'banyan | మర్రి', 'mango | మామిడి', 'tamarind | చింత', 'coconut | కొబ్బరి', 'jammi | జమ్మి'],
          ['tulasi | తులసి', 'grass | గడ్డి', 'coriander | కొత్తిమీర', 'money plant | మనీ ప్లాంట్', 'mint | పుదీనా'],
          ['Trees have thick, hard trunks. | చెట్లకు లావైన గట్టి కాండం.', 'Small plants have soft stems. | చిన్న మొక్కలకు మెత్తని కాండం.'],
          'Only plants with big, hard trunks are trees. | పెద్ద గట్టి కాండం ఉన్నవే చెట్లు.'),
      ],
    },
    {
      id: 'ts3.evs.plants.grow', title: T('Why and how we grow trees | చెట్లను ఎందుకు, ఎలా పెంచాలి'),
      intro: [
        H('Trees are our friends | చెట్లు మన స్నేహితులు'),
        P('Trees give us fresh air, shade, fruits, wood and homes for birds. That is why Telangana plants crores of saplings under Haritha Haram. | చెట్లు మనకు స్వచ్ఛమైన గాలి, నీడ, పండ్లు, కలప, పక్షులకు ఇళ్లు ఇస్తాయి. అందుకే హరితహారంలో తెలంగాణ కోట్ల మొక్కలు నాటింది.'),
        PIC('🥭', 'A mango tree gives sweet fruits every summer. | మామిడి చెట్టు ప్రతి వేసవి తీయని పండ్లు ఇస్తుంది.'),
        PIC('🌱', 'A sapling needs water every day. | మొక్కకు రోజూ నీళ్లు కావాలి.'),
        KEYS('Trees give oxygen (fresh air), shade, fruit, wood and medicine. | చెట్లు ఆక్సిజన్ (స్వచ్ఛమైన గాలి), నీడ, పండ్లు, కలప, మందులు ఇస్తాయి.',
          'Trees bring rain and stop soil from washing away. | చెట్లు వానకు సాయం చేస్తాయి, మట్టి కొట్టుకుపోకుండా ఆపుతాయి.',
          'To plant: dig a pit, put the sapling, cover with soil, water it, protect it. | నాటడం: గుంత తవ్వు, మొక్క పెట్టు, మట్టి కప్పు, నీళ్లు పోయి, కాపాడు.'),
        REM('Plant a tree, save a life. | ఒక చెట్టు నాటు, ఒక ప్రాణం కాపాడు.'),
        TIP('Plant a seed in a small pot. Water it daily and draw how it grows each week. | చిన్న కుండీలో విత్తనం నాటు. రోజూ నీళ్లు పోసి, ప్రతి వారం ఎలా పెరిగిందో బొమ్మ గీయి.'),
      ],
      examples: [
        EX('Why do people sit under a tree on a hot day? | ఎండ రోజున ప్రజలు చెట్టు కింద ఎందుకు కూర్చుంటారు?', ['Leaves block the sun. | ఆకులు ఎండను ఆపుతాయి.', 'It feels cool. | చల్లగా ఉంటుంది.'], 'For cool shade | చల్లని నీడ కోసం', '🌳'),
        EX('What do we do right after putting a sapling in the pit? | గుంతలో మొక్క పెట్టిన వెంటనే ఏం చేస్తాం?', ['Cover its roots with soil. | వేర్లను మట్టితో కప్పుతాం.', 'Then water it. | తర్వాత నీళ్లు పోస్తాం.'], 'Cover with soil, then water | మట్టి కప్పి, నీళ్లు పోస్తాం', '🪣'),
      ],
      practice: [
        orderT('plant', 'Put the steps of planting a tree in order. | మొక్క నాటే పనులను వరుసలో పెట్టు.', [
          'Dig a pit | గుంత తవ్వు', 'Place the sapling in it | మొక్కను అందులో పెట్టు', 'Cover the roots with soil | వేర్లను మట్టితో కప్పు', 'Water it | నీళ్లు పోయి', 'Put a fence around it | చుట్టూ కంచె వేయి',
        ], ['You need a hole first. | ముందు గుంత కావాలి.', 'Protecting it comes last. | కాపాడటం చివర.'], 'Dig, place, cover, water, then protect. | తవ్వు, పెట్టు, కప్పు, నీళ్లు, తర్వాత కాపాడు.'),
        bank('why', [
          ['What gas do trees give that we breathe? | మనం పీల్చే ఏ వాయువును చెట్లు ఇస్తాయి?', 'Oxygen | ఆక్సిజన్', ['Smoke | పొగ', 'Dust | దుమ్ము'], ['Fresh air. | స్వచ్ఛమైన గాలి.', 'We need it to live. | బతకడానికి కావాలి.'], 'Trees give oxygen. | చెట్లు ఆక్సిజన్ ఇస్తాయి.', 'Smoke and dust make air dirty. | పొగ, దుమ్ము గాలిని మురికి చేస్తాయి.', '🌬️'],
          ['What is Telangana\'s big tree-planting programme called? | తెలంగాణ పెద్ద మొక్కలు నాటే కార్యక్రమం పేరు?', 'Haritha Haram | హరితహారం', ['Bathukamma | బతుకమ్మ', 'Bonalu | బోనాలు'], ['Haritha means green. | హరిత అంటే పచ్చని.', 'A green garland for the state. | రాష్ట్రానికి పచ్చని హారం.'], 'Haritha Haram plants trees. | హరితహారం మొక్కలు నాటుతుంది.', 'Bathukamma and Bonalu are festivals. | బతుకమ్మ, బోనాలు పండుగలు.', '🌳'],
          ['How do tree roots help the soil? | చెట్ల వేర్లు మట్టికి ఎలా సాయం చేస్తాయి?', 'They hold soil so rain cannot wash it away | వాన కొట్టుకుపోకుండా మట్టిని పట్టుకుంటాయి', ['They make the soil fly | మట్టిని ఎగరగొడతాయి', 'They eat the soil | మట్టిని తింటాయి'], ['Roots spread like a net. | వేర్లు వలలా వ్యాపిస్తాయి.', 'They grip the earth. | నేలను గట్టిగా పట్టుకుంటాయి.'], 'Roots hold the soil together. | వేర్లు మట్టిని కలిపి పట్టుకుంటాయి.', 'Roots do not eat soil; they hold it. | వేర్లు మట్టిని తినవు; పట్టుకుంటాయి.', '🌱'],
          ['Which of these do we NOT get from trees? | వీటిలో చెట్ల నుంచి రానిది ఏది?', 'Plastic | ప్లాస్టిక్', ['Fruits | పండ్లు', 'Wood | కలప'], ['Think of a mango tree and a door. | మామిడి చెట్టు, తలుపు ఆలోచించు.', 'One is made in factories. | ఒకటి ఫ్యాక్టరీల్లో తయారవుతుంది.'], 'Plastic is not from trees. | ప్లాస్టిక్ చెట్ల నుంచి రాదు.', 'Fruits and wood both come from trees. | పండ్లు, కలప రెండూ చెట్ల నుంచే.', '🌳'],
          ['A new sapling was planted. What does it need every day? | కొత్త మొక్క నాటారు. దానికి రోజూ ఏం కావాలి?', 'Water | నీళ్లు', ['Ice cream | ఐస్‌క్రీమ్', 'Paint | రంగు'], ['Plants drink through roots. | మొక్కలు వేర్లతో తాగుతాయి.', 'It is clear and wet. | అది తడిగా ఉంటుంది.'], 'Saplings need water daily. | మొక్కలకు రోజూ నీళ్లు కావాలి.', 'Plants do not need ice cream or paint. | మొక్కలకు ఐస్‌క్రీమ్, రంగు అక్కర్లేదు.', '💧'],
          ['Why put a fence around a young plant? | చిన్న మొక్క చుట్టూ కంచె ఎందుకు?', 'So goats and cows do not eat it | మేకలు, ఆవులు తినకుండా', ['To make it sleep | నిద్రపుచ్చడానికి', 'So it gets no sun | ఎండ తగలకుండా'], ['Who loves to eat soft leaves? | మెత్తని ఆకులు ఎవరికి ఇష్టం?', 'Protect it. | కాపాడు.'], 'A fence keeps animals away. | కంచె జంతువులను దూరంగా ఉంచుతుంది.', 'Plants need sun; the fence is for animals. | మొక్కలకు ఎండ కావాలి; కంచె జంతువుల కోసం.', '🐐'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.plants.waterdesert', title: T('Water plants and desert plants | నీటి మొక్కలు, ఎడారి మొక్కలు'),
      intro: [
        H('Plants live in special places | మొక్కలు ప్రత్యేక చోట్లలో బతుకుతాయి'),
        P('In the village pond, a lotus floats with big round leaves. In the hot, dry desert, a cactus stores water in its thick stem and has spines instead of leaves. | ఊరి చెరువులో పెద్ద గుండ్రటి ఆకులతో తామర తేలుతుంది. వేడిగా, పొడిగా ఉండే ఎడారిలో బ్రహ్మజెముడు (కాక్టస్) లావైన కాండంలో నీళ్లు దాచుకుంటుంది, ఆకులకు బదులు ముళ్లు ఉంటాయి.'),
        PIC('🌸', 'A lotus grows in ponds. Its leaves float on water. | తామర చెరువుల్లో పెరుగుతుంది. ఆకులు నీటిపై తేలుతాయి.'),
        PIC('🏞️', 'Ponds and lakes are home to water plants. | చెరువులు, సరస్సులు నీటి మొక్కల నివాసం.'),
        KEYS('Water plants: lotus, water lily, hydrilla, water hyacinth. | నీటి మొక్కలు: తామర, కలువ, హైడ్రిల్లా, గుర్రపుడెక్క.',
          'Water plants have light, often waxy leaves that float. | నీటి మొక్కల ఆకులు తేలికగా, మైనంలా ఉండి తేలుతాయి.',
          'Desert plants: cactus, aloe vera. They store water in thick stems or leaves. | ఎడారి మొక్కలు: కాక్టస్, కలబంద. లావైన కాండం లేదా ఆకుల్లో నీళ్లు దాచుకుంటాయి.',
          'Spines on a cactus save water and protect it. | కాక్టస్ ముళ్లు నీటిని ఆదా చేసి, దాన్ని కాపాడుతాయి.'),
        REM('Each plant has a body that suits its home. | ప్రతి మొక్క శరీరం దాని నివాసానికి తగ్గట్టు ఉంటుంది.'),
        TIP('Touch an aloe vera leaf gently. Feel how thick and juicy it is! | కలబంద ఆకును మెల్లగా తాకు. అది ఎంత లావుగా, రసంతో ఉందో చూడు!'),
      ],
      examples: [
        EX('Where does a lotus grow? | తామర ఎక్కడ పెరుగుతుంది?', ['It needs lots of water. | దానికి చాలా నీళ్లు కావాలి.', 'Its leaves float. | ఆకులు తేలుతాయి.'], 'In ponds and lakes | చెరువులు, సరస్సుల్లో', '🌸'),
        EX('Why does a cactus have a thick stem? | కాక్టస్‌కు లావైన కాండం ఎందుకు?', ['Deserts get very little rain. | ఎడారిలో చాలా తక్కువ వాన.', 'The stem stores water for many days. | కాండం చాలా రోజులకు నీళ్లు దాచుకుంటుంది.'], 'To store water | నీళ్లు దాచుకోవడానికి', '☀️'),
      ],
      practice: [
        tapT('water', 'Tap ALL the plants that grow in WATER. | నీటిలో పెరిగే మొక్కలన్నీ నొక్కు.',
          ['lotus | తామర', 'water lily | కలువ', 'hydrilla | హైడ్రిల్లా', 'water hyacinth | గుర్రపుడెక్క'],
          ['cactus | కాక్టస్', 'aloe vera | కలబంద', 'neem | వేప', 'mango | మామిడి', 'tamarind | చింత'],
          ['Which plants float in ponds? | చెరువుల్లో తేలే మొక్కలు ఏవి?', 'Cactus and aloe like dry places. | కాక్టస్, కలబందకు పొడి చోట్లు ఇష్టం.'],
          'Water plants live in ponds; cactus and aloe live in dry places. | నీటి మొక్కలు చెరువుల్లో; కాక్టస్, కలబంద పొడి చోట్లలో.'),
        bank('where', [
          ['Which plant grows in the desert? | ఎడారిలో పెరిగే మొక్క ఏది?', 'Cactus | కాక్టస్', ['Lotus | తామర', 'Water lily | కలువ'], ['Very dry, hot place. | చాలా పొడి, వేడి చోటు.', 'It has spines. | దానికి ముళ్లు ఉంటాయి.'], 'Cactus grows in deserts. | కాక్టస్ ఎడారిలో పెరుగుతుంది.', 'Lotus and lily need ponds. | తామర, కలువకు చెరువులు కావాలి.', '☀️'],
          ['Why do lotus leaves float? | తామర ఆకులు ఎందుకు తేలుతాయి?', 'They are light and waxy | అవి తేలికగా, మైనంలా ఉంటాయి', ['They are made of stone | అవి రాతితో ఉంటాయి', 'They are very heavy | అవి చాలా బరువు'], ['Water rolls off them. | నీళ్లు వాటిపై నిలవవు.', 'Light things float. | తేలికైనవి తేలుతాయి.'], 'Light, waxy leaves float. | తేలికైన మైనపు ఆకులు తేలుతాయి.', 'Heavy things sink. | బరువైనవి మునుగుతాయి.', '🌸'],
          ['Where does a cactus store water? | కాక్టస్ నీళ్లు ఎక్కడ దాచుకుంటుంది?', 'In its thick stem | లావైన కాండంలో', ['In its flowers only | పువ్వుల్లో మాత్రమే', 'In a bottle | సీసాలో'], ['The green part is fat. | పచ్చని భాగం లావుగా ఉంటుంది.', 'Not in leaves — it has spines. | ఆకుల్లో కాదు — ముళ్లు ఉంటాయి.'], 'A cactus stores water in its stem. | కాక్టస్ కాండంలో నీళ్లు దాచుకుంటుంది.', 'Plants have no bottles! | మొక్కలకు సీసాలు ఉండవు!', '💧'],
          ['A cactus has ___ instead of leaves. | కాక్టస్‌కు ఆకులకు బదులు ___ ఉంటాయి.', 'spines | ముళ్లు', ['flowers | పువ్వులు', 'fruits | పండ్లు'], ['They are sharp. | అవి పదునుగా ఉంటాయి.', 'Do not touch! | తాకకు!'], 'Cactus has spines. | కాక్టస్‌కు ముళ్లు ఉంటాయి.', 'Flowers and fruits are not in place of leaves. | పువ్వులు, పండ్లు ఆకుల బదులు కాదు.', '⚠️'],
          ['Which plant has thick, juicy leaves and grows with little water? | తక్కువ నీటితో పెరిగి, లావైన రసమున్న ఆకులు ఉండే మొక్క ఏది?', 'Aloe vera | కలబంద', ['Lotus | తామర', 'Hydrilla | హైడ్రిల్లా'], ['Used on burns and skin. | కాలిన గాయాలపై, చర్మంపై వాడతారు.', 'Kalabanda. | కలబంద.'], 'Aloe vera stores water in its leaves. | కలబంద ఆకుల్లో నీళ్లు దాచుకుంటుంది.', 'Lotus and hydrilla live in water. | తామర, హైడ్రిల్లా నీటిలో ఉంటాయి.', '🌿'],
          ['Hydrilla grows… | హైడ్రిల్లా పెరిగేది…', 'fully under water | పూర్తిగా నీటి లోపల', ['on hot sand | వేడి ఇసుకపై', 'on rooftops | మేడల మీద'], ['Look into a fish tank. | చేపల తొట్టిలో చూడు.', 'It stays below the surface. | నీటి ఉపరితలం కింద ఉంటుంది.'], 'Hydrilla grows under water. | హైడ్రిల్లా నీటి లోపల పెరుగుతుంది.', 'Hydrilla cannot live on dry sand. | హైడ్రిల్లా పొడి ఇసుకపై బతకదు.', '🐟'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 6 Bonding with Leaves
const ch6: USpec = {
  id: 'ts3.evs.ch6', subject: 'evs', title: T('Bonding with Leaves | ఆకులతో అనుబంధం'), source: src(6),
  objectives: [
    {
      id: 'ts3.evs.leaves.shapes', title: T('Colours and shapes of leaves | ఆకుల రంగులు, ఆకారాలు'),
      intro: [
        H('No two leaves are the same | ఏ రెండు ఆకులూ ఒకేలా ఉండవు'),
        P('Collect leaves from your garden. The peepal leaf has a long pointed tip. The banana leaf is very big. The tamarind leaf is made of many tiny leaflets. | మీ తోటలో ఆకులు సేకరించు. రావి ఆకుకు పొడవైన మొన ఉంటుంది. అరటి ఆకు చాలా పెద్దది. చింత ఆకు ఎన్నో చిన్న చిన్న ఆకులతో ఉంటుంది.'),
        PIC('🍃', 'Most leaves are green, but they have many shapes. | చాలా ఆకులు పచ్చగా ఉంటాయి, కానీ ఆకారాలు ఎన్నో.'),
        PIC('🍌', 'Banana leaves are long and wide. | అరటి ఆకులు పొడవుగా, వెడల్పుగా ఉంటాయి.'),
        KEYS('Leaves can be big or small, round, long, heart-shaped or needle-like. | ఆకులు పెద్దవి, చిన్నవి, గుండ్రం, పొడవు, గుండె ఆకారం, సూదిలా ఉండవచ్చు.',
          'Most leaves are green; some are red, yellow or purple. | చాలా ఆకులు పచ్చగా; కొన్ని ఎరుపు, పసుపు, ఊదా రంగుల్లో.',
          'Edges can be smooth (mango) or toothed like a saw (neem). | అంచులు నునుపుగా (మామిడి) లేదా రంపంలా (వేప) ఉండవచ్చు.',
          'Lines on a leaf are called veins. | ఆకుపై గీతలను ఈనెలు అంటారు.'),
        REM('Leaves make food for the plant using sunlight. | ఎండ వెలుగుతో ఆకులు మొక్కకు ఆహారం తయారుచేస్తాయి.'),
        TIP('Place a leaf under paper and rub a crayon on top. Watch the veins appear! | కాగితం కింద ఆకు పెట్టి పైన క్రేయాన్‌తో రుద్దు. ఈనెలు కనిపిస్తాయి చూడు!'),
      ],
      examples: [
        EX('Which leaf is shaped like a heart with a long tail? | పొడవాటి తోకతో గుండె ఆకారంలో ఉండే ఆకు ఏది?', ['Think of the tree near temples. | గుడుల దగ్గరి చెట్టు ఆలోచించు.'], 'Peepal leaf | రావి ఆకు', '🍃'),
        EX('What are the thin lines on a leaf called? | ఆకుపై సన్నని గీతలను ఏమంటారు?', ['They carry water through the leaf. | అవి ఆకులో నీళ్లు తీసుకెళ్తాయి.'], 'Veins | ఈనెలు', '🍃'),
      ],
      practice: [
        bank('shape', [
          ['Which leaf is the biggest? | వీటిలో పెద్ద ఆకు ఏది?', 'Banana leaf | అరటి ఆకు', ['Tulasi leaf | తులసి ఆకు', 'Tamarind leaflet | చింత ఆకు'], ['We eat meals on it. | దానిపై భోజనం చేస్తాం.', 'It is long and wide. | పొడవుగా, వెడల్పుగా ఉంటుంది.'], 'The banana leaf is very big. | అరటి ఆకు చాలా పెద్దది.', 'Tulasi and tamarind leaves are tiny. | తులసి, చింత ఆకులు చిన్నవి.', '🍌'],
          ['What colour are most leaves? | చాలా ఆకులు ఏ రంగులో ఉంటాయి?', 'Green | పచ్చ', ['Blue | నీలం', 'Black | నలుపు'], ['Look at any tree. | ఏ చెట్టునైనా చూడు.', 'The colour of grass. | గడ్డి రంగు.'], 'Most leaves are green. | చాలా ఆకులు పచ్చగా ఉంటాయి.', 'Blue and black leaves are very rare. | నీలం, నలుపు ఆకులు చాలా అరుదు.', '🍃'],
          ['A neem leaf\'s edge is… | వేప ఆకు అంచు…', 'toothed like a saw | రంపంలా పళ్లతో', ['perfectly round | పూర్తిగా గుండ్రంగా', 'covered in spines | ముళ్లతో నిండి'], ['Run your finger along it. | వేలితో అంచు వెంట తడుము.', 'Small teeth. | చిన్న పళ్లు.'], 'Neem leaves have toothed edges. | వేప ఆకు అంచులకు పళ్లు ఉంటాయి.', 'Neem leaves are long, not round, and have no spines. | వేప ఆకులు పొడవు, గుండ్రం కాదు, ముళ్లు లేవు.', '🪚'],
          ['The tamarind leaf has… | చింత ఆకుకు…', 'many tiny leaflets | ఎన్నో చిన్న ఆకులు', ['one huge leaf | ఒకే పెద్ద ఆకు', 'no parts at all | భాగాలే లేవు'], ['Look closely at a tamarind twig. | చింత కొమ్మను దగ్గరగా చూడు.', 'Many small parts in rows. | వరుసల్లో ఎన్నో చిన్న భాగాలు.'], 'A tamarind leaf has many small leaflets. | చింత ఆకుకు ఎన్నో చిన్న ఆకులు.', 'Banana has one huge leaf, not tamarind. | ఒకే పెద్ద ఆకు అరటికి, చింతకు కాదు.', '🍃'],
          ['What do leaves make for the plant? | ఆకులు మొక్కకు ఏం తయారుచేస్తాయి?', 'Food | ఆహారం', ['Stones | రాళ్లు', 'Plastic | ప్లాస్టిక్'], ['They use sunlight. | ఎండ వెలుగు వాడతాయి.', 'The plant needs it to grow. | పెరగడానికి కావాలి.'], 'Leaves make food for the plant. | ఆకులు మొక్కకు ఆహారం చేస్తాయి.', 'Leaves cannot make stones or plastic. | ఆకులు రాళ్లు, ప్లాస్టిక్ చేయలేవు.', '☀️'],
          ['Which leaf is long and thin like a needle? | సూదిలా పొడవుగా, సన్నగా ఉండే ఆకు ఏది?', 'Pine leaf | పైన్ ఆకు', ['Lotus leaf | తామర ఆకు', 'Banana leaf | అరటి ఆకు'], ['It grows on cold hills. | చల్లని కొండల మీద పెరుగుతుంది.', 'Very narrow. | చాలా సన్నగా.'], 'Pine leaves are needle-like. | పైన్ ఆకులు సూదిలా ఉంటాయి.', 'Lotus and banana leaves are wide. | తామర, అరటి ఆకులు వెడల్పు.', '⛰️'],
        ]),
        matchT('leaf', 'Match each plant to its leaf. | ప్రతి మొక్కను దాని ఆకుతో జత చేయి.', [
          ['Banana | అరటి', 'very big and long | చాలా పెద్దగా, పొడవుగా', '🍌'], ['Peepal | రావి', 'heart-shaped with a tail | తోకతో గుండె ఆకారం', '🌳'],
          ['Tamarind | చింత', 'many tiny leaflets | ఎన్నో చిన్న ఆకులు', '🍃'], ['Lotus | తామర', 'round and floating | గుండ్రంగా, తేలుతూ', '🌸'],
          ['Neem | వేప', 'edges like saw teeth | రంపం పళ్ల అంచులు', '🪚'], ['Pine | పైన్', 'thin like needles | సూదుల్లా సన్నగా', '⛰️'],
        ], ['Picture each leaf. | ప్రతి ఆకును ఊహించు.', 'Start with the biggest one. | పెద్ద ఆకుతో మొదలుపెట్టు.'], 'Look again at the size and shape of each leaf. | ప్రతి ఆకు పరిమాణం, ఆకారం మళ్లీ చూడు.'),
      ],
    },
    {
      id: 'ts3.evs.leaves.compost', title: T('Falling leaves and the compost pit | రాలే ఆకులు, కంపోస్టు గుంత'),
      intro: [
        H('Old leaves become new food for soil | పాత ఆకులు మట్టికి కొత్త ఆహారం'),
        P('In summer, many trees shed their old leaves. The ground gets covered with dry, brown leaves. Instead of burning them, we can make compost! | వేసవిలో చాలా చెట్లు పాత ఆకులు రాలుస్తాయి. నేల అంతా ఎండిన గోధుమ ఆకులతో నిండుతుంది. వాటిని కాల్చడానికి బదులు కంపోస్టు చేయవచ్చు!'),
        PIC('🍃', 'Dry leaves fall from trees in summer. | వేసవిలో చెట్ల నుంచి ఎండు ఆకులు రాలుతాయి.'),
        PIC('🌱', 'Compost makes plants grow strong. | కంపోస్టు మొక్కలను బలంగా పెంచుతుంది.'),
        KEYS('Shedding: trees drop old leaves and grow new ones. | ఆకులు రాల్చడం: చెట్లు పాత ఆకులు రాల్చి కొత్తవి తెచ్చుకుంటాయి.',
          'Compost pit: dig a pit, add dry leaves and vegetable peels, cover with soil, sprinkle water. | కంపోస్టు గుంత: గుంత తవ్వి, ఎండు ఆకులు, కూరగాయల తొక్కలు వేసి, మట్టి కప్పి, నీళ్లు చల్లు.',
          'In a few weeks it turns into dark, rich compost (manure). | కొన్ని వారాల్లో అది నల్లని, బలమైన ఎరువుగా మారుతుంది.',
          'Burning leaves makes smoke and dirty air. | ఆకులు కాల్చితే పొగ, మురికి గాలి వస్తాయి.'),
        REM('Do not burn leaves — compost them! | ఆకులను కాల్చకు — కంపోస్టు చేయి!'),
        TIP('With your teacher, start a small compost pit in the school garden. | టీచర్‌తో కలిసి బడి తోటలో చిన్న కంపోస్టు గుంత మొదలుపెట్టు.'),
      ],
      examples: [
        EX('What should we do with dry fallen leaves? | రాలిన ఎండు ఆకులను ఏం చేయాలి?', ['Burning makes smoke. | కాల్చితే పొగ.', 'They can rot into manure. | కుళ్లి ఎరువుగా మారతాయి.'], 'Put them in a compost pit | కంపోస్టు గుంతలో వేయాలి', '🍃'),
        EX('Which can go into a compost pit: banana peel or plastic bag? | కంపోస్టు గుంతలో ఏది వేయవచ్చు: అరటి తొక్క లేదా ప్లాస్టిక్ సంచి?', ['Peels rot and mix with soil. | తొక్కలు కుళ్లి మట్టిలో కలుస్తాయి.', 'Plastic never rots. | ప్లాస్టిక్ ఎప్పుడూ కుళ్లదు.'], 'Banana peel | అరటి తొక్క', '🍌'),
      ],
      practice: [
        tapT('pit', 'Tap ALL the things that can go into a compost pit. | కంపోస్టు గుంతలో వేయగలిగేవన్నీ నొక్కు.',
          ['dry leaves | ఎండు ఆకులు', 'vegetable peels | కూరగాయల తొక్కలు', 'fruit peels | పండ్ల తొక్కలు', 'cow dung | పేడ', 'leftover rice | మిగిలిన అన్నం'],
          ['plastic bags | ప్లాస్టిక్ సంచులు', 'glass bottles | గాజు సీసాలు', 'tin cans | డబ్బాలు', 'batteries | బ్యాటరీలు'],
          ['Will it rot and become soil? | అది కుళ్లి మట్టిగా మారుతుందా?', 'Plastic, glass and metal never rot. | ప్లాస్టిక్, గాజు, లోహం కుళ్లవు.'],
          'Only things that rot can be composted. | కుళ్లేవి మాత్రమే కంపోస్టు అవుతాయి.'),
        orderT('make', 'Put the steps of making compost in order. | కంపోస్టు తయారీ పనులను వరుసలో పెట్టు.', [
          'Dig a pit | గుంత తవ్వు', 'Fill it with leaves and peels | ఆకులు, తొక్కలతో నింపు', 'Cover with a layer of soil | మట్టి పొరతో కప్పు', 'Sprinkle water and wait some weeks | నీళ్లు చల్లి కొన్ని వారాలు ఆగు', 'Use the compost in the garden | తోటలో కంపోస్టు వాడు',
        ], ['First make the pit. | ముందు గుంత తవ్వు.', 'Using it comes last. | వాడటం చివర.'], 'Dig, fill, cover, water and wait, then use. | తవ్వు, నింపు, కప్పు, నీళ్లు పోసి ఆగు, తర్వాత వాడు.'),
        bank('shed', [
          ['Why should we not burn dry leaves? | ఎండు ఆకులను ఎందుకు కాల్చకూడదు?', 'It makes smoke and dirty air | పొగ, మురికి గాలి వస్తాయి', ['It makes the leaves happy | ఆకులు సంతోషిస్తాయి', 'It makes rain | వాన వస్తుంది'], ['What comes from fire? | నిప్పు నుంచి ఏం వస్తుంది?', 'Smoke hurts our lungs. | పొగ ఊపిరితిత్తులకు హాని.'], 'Burning leaves pollutes the air. | ఆకులు కాల్చితే గాలి కలుషితం.', 'Burning never makes rain. | కాల్చితే వాన రాదు.', '🔥'],
          ['When do many trees shed their leaves? | చాలా చెట్లు ఆకులు ఎప్పుడు రాలుస్తాయి?', 'In the hot, dry season | వేడి, పొడి కాలంలో', ['Only at night | రాత్రి మాత్రమే', 'Never | ఎప్పుడూ కాదు'], ['When there is little water. | నీళ్లు తక్కువగా ఉన్నప్పుడు.', 'Before summer. | వేసవి ముందు.'], 'Many trees shed leaves in the dry season. | పొడి కాలంలో చాలా చెట్లు ఆకులు రాలుస్తాయి.', 'Leaves fall in a season, not only at night. | ఆకులు ఒక కాలంలో రాలుతాయి, రాత్రి మాత్రమే కాదు.', '☀️'],
          ['What does a compost pit make? | కంపోస్టు గుంత ఏం తయారుచేస్తుంది?', 'Manure for plants | మొక్కలకు ఎరువు', ['Plastic | ప్లాస్టిక్', 'Bricks | ఇటుకలు'], ['Plants love it. | మొక్కలకు ఇష్టం.', 'Dark, rich soil. | నల్లని, బలమైన మట్టి.'], 'Compost is manure for plants. | కంపోస్టు మొక్కలకు ఎరువు.', 'A pit of leaves cannot make plastic or bricks. | ఆకుల గుంత ప్లాస్టిక్, ఇటుకలు చేయదు.', '🌱'],
          ['Which should NOT go into compost? | కంపోస్టులో ఏది వేయకూడదు?', 'Plastic bag | ప్లాస్టిక్ సంచి', ['Dry leaves | ఎండు ఆకులు', 'Vegetable peels | కూరగాయల తొక్కలు'], ['Does it rot? | అది కుళ్లుతుందా?', 'It stays for hundreds of years. | వందల ఏళ్లు అలాగే ఉంటుంది.'], 'Plastic does not rot. | ప్లాస్టిక్ కుళ్లదు.', 'Leaves and peels rot well. | ఆకులు, తొక్కలు బాగా కుళ్లుతాయి.', '🚫'],
          ['After shedding, the tree… | ఆకులు రాల్చిన తర్వాత చెట్టు…', 'grows fresh new leaves | కొత్త చిగుళ్లు తొడుగుతుంది', ['dies forever | శాశ్వతంగా చనిపోతుంది', 'turns into stone | రాయిగా మారుతుంది'], ['Look at a neem tree in spring (Ugadi time). | వసంతంలో (ఉగాది సమయంలో) వేప చెట్టు చూడు.', 'Tender green leaves. | లేత పచ్చని ఆకులు.'], 'New leaves grow after shedding. | రాల్చిన తర్వాత కొత్త ఆకులు వస్తాయి.', 'Shedding is normal; the tree is alive. | ఆకులు రాల్చడం సహజం; చెట్టు బతికే ఉంటుంది.', '🌳'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.leaves.uses', title: T('Leaves as food and decoration | ఆహారంగా, అలంకరణగా ఆకులు'),
      intro: [
        H('Leaves we eat and use | మనం తినే, వాడే ఆకులు'),
        P('Amma makes gongura pachadi and palakura pappu. On festivals we tie mango leaves (toranam) on the door. At weddings we eat on banana leaves. | అమ్మ గోంగూర పచ్చడి, పాలకూర పప్పు చేస్తుంది. పండుగలకు గుమ్మానికి మామిడి తోరణం కడతాం. పెళ్లిళ్లలో అరటి ఆకుల్లో భోజనం చేస్తాం.'),
        PIC('🍃', 'Leafy vegetables like spinach make us strong. | పాలకూర లాంటి ఆకుకూరలు మనల్ని బలంగా చేస్తాయి.'),
        PIC('🥭', 'Mango leaves are tied as a toranam at festivals. | పండుగలకు మామిడి ఆకులు తోరణంగా కడతారు.'),
        KEYS('Leaves we eat: gongura, spinach (palakura), curry leaves, coriander, mint, methi. | తినే ఆకులు: గోంగూర, పాలకూర, కరివేపాకు, కొత్తిమీర, పుదీనా, మెంతికూర.',
          'Leaves as plates: banana leaf, leaf plates (vistari) made of moduga leaves. | పళ్లేలుగా ఆకులు: అరటి ఆకు, మోదుగ ఆకుల విస్తరి.',
          'Leaves for decoration: mango toranam, leaves in Bathukamma. | అలంకరణకు ఆకులు: మామిడి తోరణం, బతుకమ్మలో ఆకులు.',
          'Henna (gorintaku) leaves colour our hands. Neem and tulasi are used as medicine. | గోరింటాకు చేతులకు రంగు ఇస్తుంది. వేప, తులసి మందుగా వాడతారు.'),
        REM('Wash leafy vegetables well before cooking. | ఆకుకూరలను వండే ముందు బాగా కడగాలి.'),
        TIP('How many leafy vegetables can you find in the market? Make a list. | మార్కెట్‌లో ఎన్ని ఆకుకూరలు కనిపిస్తాయో జాబితా రాయి.'),
      ],
      examples: [
        EX('Which leaf do we use to make a famous sour Telangana pachadi? | ప్రసిద్ధ పుల్లని తెలంగాణ పచ్చడికి ఏ ఆకు వాడతాం?', ['It is sour and red-stemmed. | పుల్లగా, ఎర్రని కాడలతో ఉంటుంది.'], 'Gongura | గోంగూర', '🌿'),
        EX('What do we tie on the door on Ugadi and Sankranti? | ఉగాది, సంక్రాంతికి గుమ్మానికి ఏం కడతాం?', ['A string of green leaves. | పచ్చని ఆకుల దండ.', 'From the mango tree. | మామిడి చెట్టు నుంచి.'], 'Mango leaf toranam | మామిడి తోరణం', '🥭'),
      ],
      practice: [
        matchT('use', 'Match each leaf to how we use it. | ప్రతి ఆకును దాని ఉపయోగంతో జత చేయి.', [
          ['Banana leaf | అరటి ఆకు', 'plate for meals | భోజనానికి పళ్లెం', '🍌'], ['Mango leaves | మామిడి ఆకులు', 'toranam on doors | గుమ్మానికి తోరణం', '🥭'],
          ['Gongura | గోంగూర', 'sour pachadi | పుల్లని పచ్చడి', '🌿'], ['Henna (gorintaku) | గోరింటాకు', 'colours hands | చేతులకు రంగు', '✋'],
          ['Curry leaves | కరివేపాకు', 'tempering (popu) | పోపు', '🍃'], ['Tulasi | తులసి', 'medicine for cough | దగ్గుకు మందు', '🌱'],
          ['Palakura (spinach) | పాలకూర', 'dal (pappu) | పప్పు', '🥬'],
        ], ['Think of your kitchen and festivals. | మీ వంటగది, పండుగలు ఆలోచించు.', 'Start with the one you know best. | బాగా తెలిసిన దానితో మొదలుపెట్టు.'], 'Remember how your family uses each leaf. | మీ ఇంట్లో ప్రతి ఆకును ఎలా వాడతారో గుర్తుచేసుకో.'),
        bank('eat', [
          ['Which of these is a leafy vegetable? | వీటిలో ఆకుకూర ఏది?', 'Spinach (palakura) | పాలకూర', ['Potato | బంగాళాదుంప', 'Carrot | క్యారెట్'], ['We eat its leaves. | దాని ఆకులు తింటాం.', 'Green and flat. | పచ్చగా, చదునుగా.'], 'Spinach is a leafy vegetable. | పాలకూర ఆకుకూర.', 'We eat the roots of potato and carrot, not leaves. | బంగాళాదుంప, క్యారెట్ వేర్లు/దుంపలు తింటాం.', '🥬'],
          ['On which leaf do we eat meals at weddings? | పెళ్లిళ్లలో ఏ ఆకులో భోజనం చేస్తాం?', 'Banana leaf | అరటి ఆకు', ['Neem leaf | వేప ఆకు', 'Tulasi leaf | తులసి ఆకు'], ['It is very big. | అది చాలా పెద్దది.', 'Long and wide. | పొడవు, వెడల్పు.'], 'We eat on banana leaves. | అరటి ఆకుల్లో తింటాం.', 'Neem and tulasi leaves are too small. | వేప, తులసి ఆకులు చాలా చిన్నవి.', '🍌'],
          ['Which leaf colours our hands orange-red? | మన చేతులకు ఎరుపు రంగు ఇచ్చే ఆకు ఏది?', 'Gorintaku (henna) | గోరింటాకు', ['Coriander | కొత్తిమీర', 'Mint | పుదీనా'], ['It is ground into paste. | దాన్ని ముద్దగా నూరుతారు.', 'Girls apply it in Ashadam. | ఆషాఢంలో పెట్టుకుంటారు.'], 'Gorintaku colours hands. | గోరింటాకు చేతులకు రంగు ఇస్తుంది.', 'Coriander and mint are eaten, not used as colour. | కొత్తిమీర, పుదీనా తింటాం, రంగుకు కాదు.', '✋'],
          ['Why do we eat leafy vegetables? | ఆకుకూరలు ఎందుకు తింటాం?', 'They keep us healthy and strong | మనల్ని ఆరోగ్యంగా, బలంగా ఉంచుతాయి', ['They make us sick | జబ్బు చేస్తాయి', 'They are only for decoration | అలంకరణకు మాత్రమే'], ['Green is good! | పచ్చనిది మంచిది!', 'They have iron and vitamins. | ఇనుము, విటమిన్లు ఉంటాయి.'], 'Leafy vegetables keep us healthy. | ఆకుకూరలు ఆరోగ్యం ఇస్తాయి.', 'Washed leafy vegetables are good food, not just decoration. | కడిగిన ఆకుకూరలు మంచి ఆహారం.', '💪'],
          ['Which leaf is added to tempering (popu) for smell? | సువాసన కోసం పోపులో ఏ ఆకు వేస్తాం?', 'Curry leaves | కరివేపాకు', ['Banana leaf | అరటి ఆకు', 'Mango leaf | మామిడి ఆకు'], ['It crackles in hot oil. | వేడి నూనెలో చిటపటలాడుతుంది.', 'Small, shiny, fragrant. | చిన్నగా, మెరుస్తూ, సువాసనగా.'], 'Curry leaves go in popu. | కరివేపాకు పోపులో వేస్తాం.', 'Banana and mango leaves are not used in popu. | అరటి, మామిడి ఆకులు పోపులో వేయరు.', '🍃'],
          ['What must we do before cooking leafy vegetables? | ఆకుకూరలు వండే ముందు ఏం చేయాలి?', 'Wash them well | బాగా కడగాలి', ['Paint them | రంగు వేయాలి', 'Dry them in the sun for a month | నెలరోజులు ఎండబెట్టాలి'], ['They may have mud. | వాటికి మట్టి ఉండవచ్చు.', 'Clean water. | శుభ్రమైన నీళ్లు.'], 'Wash leafy vegetables well. | ఆకుకూరలు బాగా కడగాలి.', 'Paint is harmful and a month makes them useless. | రంగు హానికరం, నెల ఎండితే పనికిరావు.', '💧'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 7 The Food We Eat
const ch7: USpec = {
  id: 'ts3.evs.ch7', subject: 'evs', title: T('The Food We Eat | మనం తినే ఆహారం'), source: src(7),
  objectives: [
    {
      id: 'ts3.evs.food.sources', title: T('Where our food comes from | మన ఆహారం ఎక్కడి నుంచి వస్తుంది'),
      intro: [
        H('From plants and animals | మొక్కలు, జంతువుల నుంచి'),
        P('Diya\'s breakfast has idli (from rice and urad dal), coconut chutney and a glass of milk. Rice, dal and coconut come from plants. Milk comes from a cow or buffalo. | దియా అల్పాహారంలో ఇడ్లీ (బియ్యం, మినప్పప్పుతో), కొబ్బరి చట్నీ, ఒక గ్లాసు పాలు ఉన్నాయి. బియ్యం, పప్పు, కొబ్బరి మొక్కల నుంచి వస్తాయి. పాలు ఆవు లేదా గేదె నుంచి వస్తాయి.'),
        PIC('🌾', 'Rice grows in green paddy fields. | బియ్యం పచ్చని వరి పొలాల్లో పండుతుంది.'),
        PIC('🥛', 'Milk comes from cows and buffaloes. | పాలు ఆవులు, గేదెల నుంచి వస్తాయి.'),
        PIC('🥚', 'Eggs come from hens. | గుడ్లు కోళ్ల నుంచి వస్తాయి.'),
        KEYS('From plants: rice, wheat, jowar, dal, vegetables, fruits, oil, sugar. | మొక్కల నుంచి: బియ్యం, గోధుమ, జొన్న, పప్పులు, కూరగాయలు, పండ్లు, నూనె, చక్కెర.',
          'From animals: milk, curd, ghee, eggs, fish, meat, honey. | జంతువుల నుంచి: పాలు, పెరుగు, నెయ్యి, గుడ్లు, చేపలు, మాంసం, తేనె.',
          'We eat different parts of plants: roots, stems, leaves, flowers, fruits and seeds. | మొక్కల వేర్లు, కాండం, ఆకులు, పువ్వులు, పండ్లు, విత్తనాలు తింటాం.'),
        REM('All our food comes from plants or animals. | మన ఆహారమంతా మొక్కలు లేదా జంతువుల నుంచే.'),
        TIP('Look at your lunch box. Which items came from plants? Which from animals? | నీ టిఫిన్ డబ్బా చూడు. ఏవి మొక్కల నుంచి? ఏవి జంతువుల నుంచి?'),
      ],
      examples: [
        EX('Where does curd come from? | పెరుగు ఎక్కడి నుంచి వస్తుంది?', ['Curd is made from milk. | పెరుగు పాల నుంచి తయారవుతుంది.', 'Milk comes from cows and buffaloes. | పాలు ఆవులు, గేదెల నుంచి.'], 'From animals (cow or buffalo milk) | జంతువుల నుంచి (ఆవు/గేదె పాలు)', '🐄'),
        EX('Which part of the carrot plant do we eat? | క్యారెట్ మొక్కలో ఏ భాగం తింటాం?', ['It grows under the soil. | మట్టి కింద పెరుగుతుంది.'], 'The root | వేరు', '🥕'),
      ],
      practice: [
        tapT('animal', 'Tap ALL the foods that come from ANIMALS. | జంతువుల నుంచి వచ్చే ఆహారాలన్నీ నొక్కు.',
          ['milk | పాలు', 'egg | గుడ్డు', 'honey | తేనె', 'ghee | నెయ్యి', 'fish | చేప', 'curd | పెరుగు'],
          ['rice | బియ్యం', 'banana | అరటిపండు', 'tomato | టమాటా', 'jowar roti | జొన్న రొట్టె', 'groundnuts | పల్లీలు', 'spinach | పాలకూర'],
          ['Did a cow, hen, bee or fish give it? | ఆవు, కోడి, తేనెటీగ, చేప ఇచ్చిందా?', 'Grains, fruits and vegetables come from plants. | ధాన్యాలు, పండ్లు, కూరగాయలు మొక్కల నుంచి.'],
          'Milk, eggs, honey and fish come from animals; grains and vegetables from plants. | పాలు, గుడ్లు, తేనె, చేపలు జంతువుల నుంచి; ధాన్యాలు, కూరగాయలు మొక్కల నుంచి.'),
        bank('part', [
          ['Which part of a potato plant do we eat? | బంగాళాదుంప మొక్కలో ఏ భాగం తింటాం?', 'Stem (under the ground) | కాండం (నేల కింద)', ['Flower | పువ్వు', 'Leaf | ఆకు'], ['We dig it out of the soil. | మట్టి నుంచి తవ్వి తీస్తాం.', 'It is a swollen underground stem. | నేల కింద ఉబ్బిన కాండం.'], 'A potato is an underground stem. | బంగాళాదుంప నేల కింది కాండం.', 'We do not eat potato flowers or leaves. | బంగాళాదుంప పువ్వులు, ఆకులు తినం.', '🥔'],
          ['Which part of spinach do we eat? | పాలకూరలో ఏ భాగం తింటాం?', 'Leaves | ఆకులు', ['Roots | వేర్లు', 'Seeds | విత్తనాలు'], ['It is a leafy vegetable. | అది ఆకుకూర.', 'Green and flat. | పచ్చగా, చదునుగా.'], 'We eat spinach leaves. | పాలకూర ఆకులు తింటాం.', 'Spinach roots and seeds are not eaten. | పాలకూర వేర్లు, విత్తనాలు తినం.', '🥬'],
          ['Rice, wheat and jowar are which part of the plant? | బియ్యం, గోధుమ, జొన్న మొక్కలో ఏ భాగం?', 'Seeds (grains) | విత్తనాలు (ధాన్యాలు)', ['Leaves | ఆకులు', 'Roots | వేర్లు'], ['They grow at the top of the plant in bunches. | మొక్క పైన కంకుల్లో పెరుగుతాయి.', 'We sow them too. | వాటినే విత్తుతాం.'], 'Grains are seeds. | ధాన్యాలు విత్తనాలు.', 'Grains are not leaves or roots. | ధాన్యాలు ఆకులు, వేర్లు కావు.', '🌾'],
          ['Honey comes from… | తేనె దేని నుంచి వస్తుంది…', 'bees | తేనెటీగలు', ['cows | ఆవులు', 'trees directly | నేరుగా చెట్ల నుంచి'], ['They buzz. | ఝుమ్మంటాయి.', 'They make it in a hive. | తేనెపట్టులో చేస్తాయి.'], 'Bees make honey. | తేనెటీగలు తేనె చేస్తాయి.', 'Cows give milk, not honey. | ఆవులు పాలు ఇస్తాయి, తేనె కాదు.', '🍯'],
          ['Cauliflower is which part of the plant? | క్యాలీఫ్లవర్ మొక్కలో ఏ భాగం?', 'Flower | పువ్వు', ['Root | వేరు', 'Fruit | పండు'], ['The name has a clue. | పేరులోనే సూచన ఉంది.', 'Flower! | పువ్వు!'], 'We eat the flower of cauliflower. | క్యాలీఫ్లవర్ పువ్వు తింటాం.', 'It grows above ground and is not a fruit. | ఇది నేల పైన పెరుగుతుంది, పండు కాదు.', '🌼'],
          ['Cooking oil comes from… | వంట నూనె దేని నుంచి వస్తుంది…', 'seeds like groundnut and sunflower | పల్లీ, పొద్దుతిరుగుడు లాంటి విత్తనాల నుంచి', ['stones | రాళ్ల నుంచి', 'rain water | వాన నీటి నుంచి'], ['Seeds are crushed in a mill. | గానుగలో విత్తనాలను నలుపుతారు.', 'Groundnut oil. | పల్లీ నూనె.'], 'Oil comes from seeds of plants. | నూనె మొక్కల విత్తనాల నుంచి.', 'Stones and rain do not give oil. | రాళ్లు, వాన నూనె ఇవ్వవు.', '🥜'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.food.why', title: T('Why we eat; raw and cooked food | ఎందుకు తింటాం; పచ్చి, వండిన ఆహారం'),
      intro: [
        H('Food gives us energy | ఆహారం మనకు శక్తి ఇస్తుంది'),
        P('Arjun skipped breakfast and felt tired in class. After lunch he could run and play again. Food gives us energy to work, play and grow. | అర్జున్ అల్పాహారం మానేసి తరగతిలో అలసిపోయాడు. భోజనం తర్వాత మళ్లీ పరిగెత్తి ఆడగలిగాడు. ఆహారం మనకు పని, ఆట, ఎదుగుదలకు శక్తి ఇస్తుంది.'),
        PIC('🍎', 'Fruits can be eaten raw, after washing. | పండ్లను కడిగి పచ్చిగానే తినవచ్చు.'),
        PIC('🔥', 'Rice, dal and many vegetables are cooked on fire. | బియ్యం, పప్పు, చాలా కూరగాయలు నిప్పుపై వండుతాం.'),
        KEYS('We eat to get energy, to grow and to stay healthy. | శక్తి కోసం, ఎదగడానికి, ఆరోగ్యంగా ఉండటానికి తింటాం.',
          'Raw food: fruits, cucumber, carrot, tomato. | పచ్చి ఆహారం: పండ్లు, దోసకాయ, క్యారెట్, టమాటా.',
          'Cooked food: rice, dal, roti, chicken, potato. | వండిన ఆహారం: అన్నం, పప్పు, రొట్టె, కోడి కూర, బంగాళాదుంప.',
          'Ways to cook: boiling, frying, steaming (idli), roasting (corn), baking. | వండే పద్ధతులు: ఉడికించడం, వేయించడం, ఆవిరిపై (ఇడ్లీ), కాల్చడం (మొక్కజొన్న), బేకింగ్.'),
        REM('Cooking makes food soft, tasty and safe to eat. | వండటం ఆహారాన్ని మెత్తగా, రుచిగా, సురక్షితంగా చేస్తుంది.'),
        TIP('Watch at home: which foods are boiled, which are fried? | ఇంట్లో గమనించు: ఏవి ఉడికిస్తారు, ఏవి వేయిస్తారు?'),
      ],
      examples: [
        EX('How is idli cooked? | ఇడ్లీ ఎలా వండుతారు?', ['Batter is put in an idli plate. | పిండిని ఇడ్లీ పళ్లెంలో వేస్తారు.', 'It is cooked in steam from boiling water. | మరిగే నీటి ఆవిరిపై ఉడుకుతుంది.'], 'By steaming | ఆవిరిపై', '♨️'),
        EX('Can we eat a cucumber raw? | దోసకాయను పచ్చిగా తినవచ్చా?', ['Wash it well. | బాగా కడుగు.', 'It is soft and juicy. | మెత్తగా, రసంగా ఉంటుంది.'], 'Yes, after washing | అవును, కడిగిన తర్వాత', '🥒'),
      ],
      practice: [
        tapT('raw', 'Tap ALL the foods we can eat RAW (after washing). | (కడిగి) పచ్చిగా తినగలిగే ఆహారాలన్నీ నొక్కు.',
          ['banana | అరటిపండు', 'cucumber | దోసకాయ', 'carrot | క్యారెట్', 'guava | జామపండు', 'tomato | టమాటా', 'mango | మామిడిపండు'],
          ['rice grains | బియ్యం', 'raw chicken | పచ్చి కోడి మాంసం', 'dal (uncooked) | వండని పప్పు', 'wheat flour | గోధుమ పిండి', 'potato | బంగాళాదుంప'],
          ['Could you bite it straight away? | వెంటనే కొరికి తినగలవా?', 'Grains, flour and meat must be cooked. | ధాన్యాలు, పిండి, మాంసం వండాలి.'],
          'Fruits and some vegetables are eaten raw; grains, dal and meat must be cooked. | పండ్లు, కొన్ని కూరగాయలు పచ్చిగా; ధాన్యాలు, పప్పు, మాంసం వండాలి.'),
        bank('cook', [
          ['Why do we eat food? | మనం ఎందుకు తింటాం?', 'To get energy and grow | శక్తి కోసం, ఎదగడానికి', ['To feel sleepy all day | రోజంతా నిద్ర కోసం', 'Only because it is time | సమయం అయిందని మాత్రమే'], ['How did Arjun feel without breakfast? | అల్పాహారం లేకుండా అర్జున్ ఎలా ఉన్నాడు?', 'Food is fuel for the body. | ఆహారం శరీరానికి ఇంధనం.'], 'Food gives energy and helps us grow. | ఆహారం శక్తి ఇస్తుంది, ఎదుగుదలకు సాయం.', 'Food is not for sleeping; it gives energy. | ఆహారం నిద్ర కోసం కాదు; శక్తి కోసం.', '💪'],
          ['How is a dosa cooked? | దోశ ఎలా వండుతారు?', 'On a hot pan (tawa) with a little oil | కొంచెం నూనెతో వేడి పెనంపై', ['By steaming | ఆవిరిపై', 'It is eaten raw | పచ్చిగా తింటారు'], ['It is spread thin and flat. | సన్నగా, చదునుగా పరుస్తారు.', 'Crispy edges. | కరకరలాడే అంచులు.'], 'Dosa is cooked on a hot tawa. | దోశ వేడి పెనంపై వండుతారు.', 'Idli is steamed; dosa is made on a tawa. | ఇడ్లీ ఆవిరిపై; దోశ పెనంపై.', '🍳'],
          ['Corn (mokkajonna) on the roadside is cooked by… | రోడ్డు పక్కన మొక్కజొన్నను ఎలా వండుతారు…', 'roasting over coals | బొగ్గులపై కాల్చి', ['freezing | గడ్డకట్టించి', 'washing only | కడిగి మాత్రమే'], ['You see smoke and red coals. | పొగ, ఎర్రని బొగ్గులు కనిపిస్తాయి.', 'Turned over fire. | నిప్పుపై తిప్పుతారు.'], 'Corn is roasted over coals. | మొక్కజొన్నను బొగ్గులపై కాలుస్తారు.', 'Freezing and washing do not cook food. | గడ్డకట్టించడం, కడగడం వంట కాదు.', '🌽'],
          ['Why do we cook rice? | బియ్యం ఎందుకు వండుతాం?', 'Raw rice is hard; cooking makes it soft | పచ్చి బియ్యం గట్టిగా ఉంటుంది; వండితే మెత్తబడుతుంది', ['To make it a different colour | రంగు మార్చడానికి', 'To make it hard | గట్టిగా చేయడానికి'], ['Try biting a raw grain — ouch! | పచ్చి బియ్యం గింజ కొరికి చూడు — గట్టి!', 'Boiling makes it soft. | ఉడికిస్తే మెత్తబడుతుంది.'], 'Cooking makes rice soft and easy to digest. | వండితే అన్నం మెత్తగా, అరిగేలా అవుతుంది.', 'Cooking makes rice soft, not hard. | వండితే బియ్యం మెత్తబడుతుంది, గట్టిపడదు.', '🍚'],
          ['Which food is fried in oil? | నూనెలో వేయించే ఆహారం ఏది?', 'Puri | పూరీ', ['Idli | ఇడ్లీ', 'Cucumber salad | దోసకాయ సలాడ్'], ['It puffs up in hot oil. | వేడి నూనెలో ఉబ్బుతుంది.', 'Round and golden. | గుండ్రంగా, బంగారు రంగులో.'], 'Puri is deep fried. | పూరీని నూనెలో వేయిస్తారు.', 'Idli is steamed and salad is raw. | ఇడ్లీ ఆవిరిపై, సలాడ్ పచ్చిగా.', '🔥'],
          ['Which food is cooked by boiling? | ఉడికించి వండే ఆహారం ఏది?', 'Dal | పప్పు', ['Banana | అరటిపండు', 'Roasted corn | కాల్చిన మొక్కజొన్న'], ['It is cooked in water in a pressure cooker. | కుక్కర్‌లో నీటిలో ఉడుకుతుంది.', 'Water bubbles. | నీళ్లు మరుగుతాయి.'], 'Dal is boiled. | పప్పు ఉడికిస్తారు.', 'Bananas are raw and corn is roasted. | అరటిపండు పచ్చిగా, మొక్కజొన్న కాల్చి.', '💧'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.food.utensils', title: T('Cooking utensils | వంట పాత్రలు'),
      intro: [
        H('Tools in the kitchen | వంటగదిలోని సాధనాలు'),
        P('Ammamma cooks rice in a clay pot and makes rotis on an iron tawa. Amma uses a pressure cooker and a steel kadai. Each utensil has a job. | అమ్మమ్మ మట్టి కుండలో అన్నం వండుతుంది, ఇనుప పెనంపై రొట్టెలు చేస్తుంది. అమ్మ ప్రెషర్ కుక్కర్, స్టీలు బాణలి వాడుతుంది. ప్రతి పాత్రకు ఒక పని.'),
        PIC('🥄', 'A ladle (garite) is used to stir and serve. | గరిటె కలపడానికి, వడ్డించడానికి.'),
        PIC('🔥', 'Older homes used a wood stove (kattela poyyi). | పాత ఇళ్లలో కట్టెల పొయ్యి వాడేవారు.'),
        KEYS('Pressure cooker → rice, dal. Tawa (penam) → roti, dosa. Kadai (banali) → frying. | కుక్కర్ → అన్నం, పప్పు. పెనం → రొట్టె, దోశ. బాణలి → వేయించడానికి.',
          'Idli plates → idli. Mortar (rolu) → grinding chutney. | ఇడ్లీ పళ్లెం → ఇడ్లీ. రోలు → చట్నీ నూరడానికి.',
          'Utensils are made of clay, iron, steel, aluminium, brass, copper. | పాత్రలు మట్టి, ఇనుము, స్టీలు, అల్యూమినియం, ఇత్తడి, రాగితో చేస్తారు.',
          'Long ago: clay pots and stone grinders; today: steel and electric mixers. | పూర్వం: మట్టి కుండలు, రాతి రోళ్లు; ఇప్పుడు: స్టీలు, మిక్సీలు.'),
        REM('Hot utensils burn! Let grown-ups handle the stove. | వేడి పాత్రలు కాలుస్తాయి! పొయ్యి పని పెద్దవాళ్లకే.'),
        TIP('Name five utensils in your kitchen and what each is made of. | మీ వంటగదిలో ఐదు పాత్రల పేర్లు, అవి దేనితో చేశారో చెప్పు.'),
      ],
      examples: [
        EX('Which utensil is used to make rotis? | రొట్టెలు చేయడానికి ఏ పాత్ర వాడతారు?', ['Rotis are flat and cooked on a hot flat pan. | రొట్టెలు చదునుగా, వేడి చదునైన పెనంపై కాలుస్తారు.'], 'Tawa (penam) | పెనం', '🍳'),
        EX('What was used before mixers to grind chutney? | మిక్సీలకు ముందు చట్నీ నూరడానికి ఏం వాడేవారు?', ['A heavy stone and a stone pestle. | బరువైన రాయి, రాతి పొత్రం.'], 'Stone grinder (rolu) | రోలు', '🪨'),
      ],
      practice: [
        matchT('pot', 'Match each utensil to its use. | ప్రతి పాత్రను దాని ఉపయోగంతో జత చేయి.', [
          ['Pressure cooker | ప్రెషర్ కుక్కర్', 'cooks rice and dal | అన్నం, పప్పు వండుతుంది', '♨️'], ['Tawa | పెనం', 'makes rotis and dosas | రొట్టెలు, దోశలు', '🍳'],
          ['Kadai | బాణలి', 'fries puris | పూరీలు వేయిస్తుంది', '🔥'], ['Idli plate | ఇడ్లీ పళ్లెం', 'steams idlis | ఇడ్లీలు ఆవిరిపై', '⚪'],
          ['Ladle | గరిటె', 'stirs and serves | కలుపుతుంది, వడ్డిస్తుంది', '🥄'], ['Rolu | రోలు', 'grinds chutney | చట్నీ నూరుతుంది', '🪨'],
          ['Knife | కత్తి', 'cuts vegetables | కూరగాయలు కోస్తుంది', '🔪'],
        ], ['Picture your kitchen. | మీ వంటగది ఊహించు.', 'What does each one do? | ప్రతిదీ ఏం చేస్తుంది?'], 'Think of what amma does with each utensil. | అమ్మ ప్రతి పాత్రతో ఏం చేస్తుందో ఆలోచించు.'),
        bank('made', [
          ['Long ago, rice was often cooked in a… | పూర్వం అన్నం తరచుగా ఏ పాత్రలో వండేవారు…', 'clay pot | మట్టి కుండ', ['plastic box | ప్లాస్టిక్ డబ్బా', 'paper bag | కాగితం సంచి'], ['Made by the potter. | కుమ్మరి చేసింది.', 'It can sit on fire. | నిప్పుపై పెట్టవచ్చు.'], 'Rice was cooked in clay pots. | మట్టి కుండల్లో అన్నం వండేవారు.', 'Plastic and paper burn on fire. | ప్లాస్టిక్, కాగితం నిప్పుపై కాలిపోతాయి.', '🏺'],
          ['Which material is NOT used to make cooking pots? | వంట పాత్రలకు ఏ పదార్థం వాడరు?', 'Paper | కాగితం', ['Steel | స్టీలు', 'Clay | మట్టి'], ['Which one burns easily? | ఏది సులభంగా కాలుతుంది?', 'Pots go on fire. | పాత్రలు నిప్పుపై ఉంటాయి.'], 'Paper burns, so it is not used for pots. | కాగితం కాలుతుంది, పాత్రలకు వాడరు.', 'Steel and clay are both used for pots. | స్టీలు, మట్టి రెండూ పాత్రలకు వాడతారు.', '📄'],
          ['Who should light the stove at home? | ఇంట్లో పొయ్యి ఎవరు వెలిగించాలి?', 'A grown-up | పెద్దవాళ్లు', ['A small child alone | ఒంటరిగా చిన్న పిల్లలు', 'Nobody ever | ఎప్పుడూ ఎవరూ కాదు'], ['Fire can burn. | నిప్పు కాల్చగలదు.', 'Safety first. | భద్రత ముఖ్యం.'], 'Only grown-ups should light the stove. | పెద్దవాళ్లే పొయ్యి వెలిగించాలి.', 'Children must not play with fire. | పిల్లలు నిప్పుతో ఆడకూడదు.', '🔥'],
          ['What do we use today instead of the rolu to grind? | నూరడానికి ఇప్పుడు రోలుకు బదులు ఏం వాడతాం?', 'Mixer grinder | మిక్సీ', ['Fan | ఫ్యాన్', 'Fridge | ఫ్రిజ్'], ['It runs on electricity and whirrs. | కరెంటుతో తిరుగుతూ శబ్దం చేస్తుంది.', 'It has sharp blades. | పదునైన బ్లేడ్లు ఉంటాయి.'], 'A mixer grinds today. | ఇప్పుడు మిక్సీ నూరుతుంది.', 'Fans move air; fridges keep food cold. | ఫ్యాన్ గాలి, ఫ్రిజ్ చల్లదనం.', '⚙️'],
          ['Which utensil whistles when food is cooking? | వంట అవుతున్నప్పుడు ఈల వేసే పాత్ర ఏది?', 'Pressure cooker | ప్రెషర్ కుక్కర్', ['Tawa | పెనం', 'Ladle | గరిటె'], ['Count the whistles for dal! | పప్పుకు ఈలలు లెక్కించు!', 'It has a lid that locks. | మూత లాక్ అవుతుంది.'], 'The pressure cooker whistles. | ప్రెషర్ కుక్కర్ ఈల వేస్తుంది.', 'A tawa and a ladle cannot whistle. | పెనం, గరిటె ఈల వేయవు.', '♨️'],
          ['Why must we not touch a pan on the stove? | పొయ్యిపై ఉన్న పాత్రను ఎందుకు తాకకూడదు?', 'It is very hot and can burn us | చాలా వేడిగా ఉండి కాల్చగలదు', ['It is very cold | చాలా చల్లగా ఉంటుంది', 'It will run away | పారిపోతుంది'], ['Fire heats it. | నిప్పు దాన్ని వేడి చేస్తుంది.', 'Ouch! | అబ్బా!'], 'Hot pans burn. | వేడి పాత్రలు కాలుస్తాయి.', 'A pan on fire is hot, not cold. | నిప్పుపై పాత్ర వేడిగా ఉంటుంది.', '⚠️'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 8 Food Habits
const ch8: USpec = {
  id: 'ts3.evs.ch8', subject: 'evs', title: T('Food Habits | ఆహారపు అలవాట్లు'), source: src(8),
  objectives: [
    {
      id: 'ts3.evs.habits.people', title: T('What people eat in different places | వేర్వేరు ప్రాంతాల ప్రజల ఆహారం'),
      intro: [
        H('Every place has its own food | ప్రతి ప్రాంతానికి సొంత ఆహారం'),
        P('In Telangana villages people love jonna rotte (jowar roti) and rice with dal. In Punjab people eat wheat rotis. People near the sea eat lots of fish. We eat what grows near us. | తెలంగాణ పల్లెల్లో జొన్న రొట్టె, అన్నం-పప్పు ఇష్టం. పంజాబ్‌లో గోధుమ రొట్టెలు తింటారు. సముద్రం దగ్గరి ప్రజలు చేపలు ఎక్కువగా తింటారు. మన దగ్గర పండేదే తింటాం.'),
        PIC('🌾', 'Rice and jowar grow well in Telangana. | తెలంగాణలో వరి, జొన్న బాగా పండుతాయి.'),
        PIC('🐟', 'People near rivers and the sea eat fish. | నదులు, సముద్రం దగ్గరి వాళ్లు చేపలు తింటారు.'),
        KEYS('Food habits depend on what grows nearby and the weather. | ఆహారపు అలవాట్లు దగ్గర పండే పంటలు, వాతావరణంపై ఆధారపడతాయి.',
          'Telangana foods: jonna rotte, sarva pindi, sakinalu, pulihora, bonalu bellam. | తెలంగాణ వంటలు: జొన్న రొట్టె, సర్వపిండి, సకినాలు, పులిహోర.',
          'Some people eat only plant food (vegetarian); some also eat meat, fish and eggs. | కొందరు శాకాహారులు; కొందరు మాంసం, చేపలు, గుడ్లు కూడా తింటారు.',
          'A balanced meal has grains, dal, vegetables, and milk or curd. | సమతుల ఆహారంలో ధాన్యాలు, పప్పు, కూరగాయలు, పాలు లేదా పెరుగు ఉంటాయి.'),
        REM('Respect everyone\'s food. Do not waste food. | అందరి ఆహారాన్ని గౌరవించు. ఆహారం వృథా చేయకు.'),
        TIP('Ask a friend what they had for dinner. Is it like yours or different? | స్నేహితుడిని రాత్రి ఏం తిన్నాడో అడుగు. నీ ఆహారంలాగే ఉందా, వేరేగా ఉందా?'),
      ],
      examples: [
        EX('Which Telangana snack is made at Sankranti with rice flour in round spirals? | సంక్రాంతికి బియ్యప్పిండితో గుండ్రని చుట్లుగా చేసే తెలంగాణ పిండివంట ఏది?', ['It is crunchy and has sesame seeds. | కరకరలాడుతుంది, నువ్వులు ఉంటాయి.'], 'Sakinalu | సకినాలు', '🌀'),
        EX('Why do people near the sea eat more fish? | సముద్రం దగ్గరి వాళ్లు చేపలు ఎక్కువ ఎందుకు తింటారు?', ['Fish are easy to catch there. | అక్కడ చేపలు సులభంగా దొరుకుతాయి.', 'We eat what is found near us. | దగ్గర దొరికేదే తింటాం.'], 'Because fish are found nearby | చేపలు దగ్గరలో దొరుకుతాయి కాబట్టి', '🐟'),
      ],
      practice: [
        bank('place', [
          ['Which roti is a favourite in Telangana villages? | తెలంగాణ పల్లెల్లో ఇష్టమైన రొట్టె ఏది?', 'Jonna rotte (jowar roti) | జొన్న రొట్టె', ['Pizza | పిజ్జా', 'Burger | బర్గర్'], ['Made from a millet. | చిరుధాన్యంతో చేస్తారు.', 'Jonna = jowar. | జొన్న.'], 'Jonna rotte is a Telangana favourite. | జొన్న రొట్టె తెలంగాణకు ఇష్టం.', 'Pizza and burger are not traditional village food. | పిజ్జా, బర్గర్ పల్లె సంప్రదాయ వంటలు కావు.', '🌾'],
          ['People in coastal areas eat a lot of… | తీర ప్రాంత ప్రజలు ఎక్కువగా తినేది…', 'fish | చేపలు', ['snow | మంచు', 'sand | ఇసుక'], ['What lives in the sea? | సముద్రంలో ఏముంటుంది?', 'Fishermen catch it. | జాలర్లు పడతారు.'], 'Coastal people eat fish. | తీర ప్రాంతాల వాళ్లు చేపలు తింటారు.', 'Snow and sand are not food! | మంచు, ఇసుక ఆహారం కాదు!', '🐟'],
          ['A person who eats only plant food is called… | మొక్కల ఆహారం మాత్రమే తినేవాళ్లను ఏమంటారు…', 'vegetarian | శాకాహారి', ['non-vegetarian | మాంసాహారి', 'fruit seller | పండ్ల వ్యాపారి'], ['Vegetables! | కూరగాయలు!', 'No meat, no fish. | మాంసం, చేపలు లేవు.'], 'A vegetarian eats plant food. | శాకాహారి మొక్కల ఆహారం తింటారు.', 'Non-vegetarians also eat meat and fish. | మాంసాహారులు మాంసం, చేపలు కూడా తింటారు.', '🥕'],
          ['Why do food habits differ from place to place? | ప్రాంతాన్ని బట్టి ఆహారపు అలవాట్లు ఎందుకు మారతాయి?', 'Different crops grow in different places | వేర్వేరు చోట్ల వేర్వేరు పంటలు పండుతాయి', ['Because people dislike each other | ప్రజలకు ఒకరంటే ఒకరికి ఇష్టం లేక', 'Because shops are closed | దుకాణాలు మూసి ఉండటం వల్ల'], ['Wheat grows in Punjab, rice in Telangana. | పంజాబ్‌లో గోధుమ, తెలంగాణలో వరి.', 'Weather and soil. | వాతావరణం, నేల.'], 'Food depends on what grows nearby. | దగ్గర పండేదాన్ని బట్టి ఆహారం.', 'It is about crops and weather, not dislike. | ఇది పంటలు, వాతావరణం గురించి, ఇష్టాయిష్టాల గురించి కాదు.', '🌾'],
          ['Which meal is balanced? | ఏ భోజనం సమతులం?', 'Rice, dal, vegetable curry and curd | అన్నం, పప్పు, కూర, పెరుగు', ['Only chips | చిప్స్ మాత్రమే', 'Only sweets | స్వీట్లు మాత్రమే'], ['A bit of everything. | అన్నీ కొంచెం కొంచెం.', 'Grains, dal, veggies, milk. | ధాన్యం, పప్పు, కూర, పాలు.'], 'Rice, dal, curry and curd make a balanced meal. | అన్నం, పప్పు, కూర, పెరుగు సమతుల భోజనం.', 'Only chips or sweets is not healthy. | చిప్స్, స్వీట్లు మాత్రమే ఆరోగ్యం కాదు.', '🥗'],
          ['What should we do with food on our plate? | పళ్లెంలో ఆహారాన్ని ఏం చేయాలి?', 'Take only what we need and finish it | అవసరమైనంతే తీసుకుని పూర్తిగా తినాలి', ['Throw half of it away | సగం పారేయాలి', 'Feed it to the dustbin | చెత్తబుట్టలో వేయాలి'], ['A farmer worked hard for it. | రైతు కష్టపడి పండించాడు.', 'Do not waste. | వృథా చేయకు.'], 'Take what you need; do not waste. | అవసరమైనంతే తీసుకో; వృథా చేయకు.', 'Throwing food wastes the farmer\'s work. | ఆహారం పారేస్తే రైతు కష్టం వృథా.', '🍽️'],
        ]),
        tapT('ts', 'Tap ALL the Telangana dishes. | తెలంగాణ వంటలన్నీ నొక్కు.',
          ['jonna rotte | జొన్న రొట్టె', 'sarva pindi | సర్వపిండి', 'sakinalu | సకినాలు', 'pulihora | పులిహోర', 'gongura pachadi | గోంగూర పచ్చడి'],
          ['pizza | పిజ్జా', 'noodles | నూడుల్స్', 'burger | బర్గర్', 'pasta | పాస్తా'],
          ['Which ones does ammamma make? | ఏవి అమ్మమ్మ చేస్తుంది?', 'Pizza and pasta came from other countries. | పిజ్జా, పాస్తా వేరే దేశాల నుంచి వచ్చాయి.'],
          'Telangana dishes are made from local grains and leaves. | తెలంగాణ వంటలు స్థానిక ధాన్యాలు, ఆకులతో చేస్తారు.'),
      ],
    },
    {
      id: 'ts3.evs.habits.animals', title: T('What animals eat | జంతువులు ఏం తింటాయి'),
      intro: [
        H('Plant-eaters, meat-eaters and both | శాకాహారులు, మాంసాహారులు, రెండూ తినేవి'),
        P('A cow eats grass. A lion eats other animals. A crow eats grains, insects and leftovers. Animals have different food habits too! | ఆవు గడ్డి తింటుంది. సింహం ఇతర జంతువులను తింటుంది. కాకి గింజలు, పురుగులు, మిగిలిన ఆహారం తింటుంది. జంతువులకూ వేర్వేరు ఆహారపు అలవాట్లు!'),
        PIC('🐄', 'A cow eats grass and chews it again and again. | ఆవు గడ్డి తిని మళ్లీ మళ్లీ నెమరు వేస్తుంది.'),
        PIC('🦁', 'A lion hunts other animals for food. | సింహం ఆహారం కోసం ఇతర జంతువులను వేటాడుతుంది.'),
        PIC('🐦‍⬛', 'A crow eats almost anything. | కాకి దాదాపు ఏదైనా తింటుంది.'),
        KEYS('Plant-eaters (herbivores): cow, goat, rabbit, elephant, deer. | శాకాహారులు: ఆవు, మేక, కుందేలు, ఏనుగు, జింక.',
          'Meat-eaters (carnivores): lion, tiger, eagle. | మాంసాహారులు: సింహం, పులి, గద్ద.',
          'Eat both (omnivores): crow, bear, dog, hen, and people too. | రెండూ తినేవి (సర్వభక్షకాలు): కాకి, ఎలుగుబంటి, కుక్క, కోడి, మనుషులు కూడా.'),
        REM('Do not feed wild animals in zoos or forests. | జూ, అడవుల్లో జంతువులకు ఆహారం పెట్టకూడదు.'),
        TIP('Watch a crow, a cow or a dog near your house. Note what it eats. | మీ ఇంటి దగ్గర కాకి, ఆవు లేదా కుక్కను గమనించి అది ఏం తింటుందో రాయి.'),
      ],
      examples: [
        EX('A goat eats leaves and grass only. What kind of eater is it? | మేక ఆకులు, గడ్డి మాత్రమే తింటుంది. ఇది ఏ రకం?', ['It eats only plants. | మొక్కలే తింటుంది.'], 'A plant-eater (herbivore) | శాకాహారి', '🐐'),
        EX('A tiger hunts deer. What kind of eater is it? | పులి జింకలను వేటాడుతుంది. ఇది ఏ రకం?', ['It eats other animals. | ఇతర జంతువులను తింటుంది.'], 'A meat-eater (carnivore) | మాంసాహారి', '🐅'),
      ],
      practice: [
        tapT('plant', 'Tap ALL the PLANT-EATERS. | శాకాహార జంతువులన్నీ నొక్కు.',
          ['cow | ఆవు', 'goat | మేక', 'rabbit | కుందేలు', 'elephant | ఏనుగు', 'deer | జింక', 'buffalo | గేదె'],
          ['lion | సింహం', 'tiger | పులి', 'eagle | గద్ద', 'crocodile | మొసలి'],
          ['Does it eat grass and leaves only? | గడ్డి, ఆకులు మాత్రమే తింటుందా?', 'Hunters are meat-eaters. | వేటాడేవి మాంసాహారులు.'],
          'Plant-eaters eat grass and leaves; hunters eat meat. | శాకాహారులు గడ్డి, ఆకులు; వేటాడేవి మాంసం తింటాయి.'),
        bank('eat', [
          ['What does a cow eat? | ఆవు ఏం తింటుంది?', 'Grass | గడ్డి', ['Meat | మాంసం', 'Fish | చేపలు'], ['It grazes in fields. | పొలాల్లో మేస్తుంది.', 'Green and leafy. | పచ్చగా.'], 'Cows eat grass. | ఆవులు గడ్డి తింటాయి.', 'Cows never eat meat or fish. | ఆవులు మాంసం, చేపలు తినవు.', '🐄'],
          ['Which animal is a meat-eater? | ఏ జంతువు మాంసాహారి?', 'Lion | సింహం', ['Goat | మేక', 'Rabbit | కుందేలు'], ['It has sharp teeth and claws. | పదునైన పళ్లు, గోళ్లు ఉంటాయి.', 'King of the forest. | అడవికి రాజు.'], 'The lion eats meat. | సింహం మాంసం తింటుంది.', 'Goats and rabbits eat plants. | మేకలు, కుందేళ్లు మొక్కలు తింటాయి.', '🦁'],
          ['A crow eats grains, insects and leftover rice. It eats… | కాకి గింజలు, పురుగులు, మిగిలిన అన్నం తింటుంది. అది తినేది…', 'both plants and animals | మొక్కలు, జంతువులు రెండూ', ['only grass | గడ్డి మాత్రమే', 'only meat | మాంసం మాత్రమే'], ['Grains are plants; insects are animals. | గింజలు మొక్కలు; పురుగులు జంతువులు.', 'Both! | రెండూ!'], 'A crow eats both. | కాకి రెండూ తింటుంది.', 'It eats grains AND insects, so not only one kind. | గింజలు, పురుగులు రెండూ తింటుంది.', '🐦‍⬛'],
          ['What does a rabbit love to eat? | కుందేలుకు ఏం తినడం ఇష్టం?', 'Carrots and leaves | క్యారెట్లు, ఆకులు', ['Other rabbits | ఇతర కుందేళ్లు', 'Stones | రాళ్లు'], ['It is a plant-eater. | అది శాకాహారి.', 'Orange and crunchy. | నారింజ రంగు, కరకర.'], 'Rabbits eat carrots and leaves. | కుందేళ్లు క్యారెట్లు, ఆకులు తింటాయి.', 'Rabbits do not eat animals or stones. | కుందేళ్లు జంతువులను, రాళ్లను తినవు.', '🐇'],
          ['An eagle catches fish and small animals. It is a… | గద్ద చేపలు, చిన్న జంతువులను పడుతుంది. అది…', 'meat-eater | మాంసాహారి', ['plant-eater | శాకాహారి', 'grass-eater | గడ్డి తినేది'], ['It hunts. | అది వేటాడుతుంది.', 'Sharp, hooked beak. | పదునైన వంపు ముక్కు.'], 'An eagle is a meat-eater. | గద్ద మాంసాహారి.', 'It catches animals, so it is not a plant-eater. | జంతువులను పడుతుంది, కాబట్టి శాకాహారి కాదు.', '🦅'],
          ['Why should we not feed animals at the zoo? | జూలో జంతువులకు ఎందుకు ఆహారం పెట్టకూడదు?', 'Our food can make them sick | మన ఆహారం వాటికి జబ్బు చేయవచ్చు', ['They do not like eating | వాటికి తినడం ఇష్టం లేదు', 'They never eat | అవి ఎప్పుడూ తినవు'], ['Zoo keepers give the right food. | జూ సిబ్బంది సరైన ఆహారం ఇస్తారు.', 'Chips are not lion food! | చిప్స్ సింహం ఆహారం కాదు!'], 'Wrong food makes animals sick. | తప్పు ఆహారం జంతువులకు జబ్బు.', 'Animals eat — but only the right food. | జంతువులు తింటాయి — సరైన ఆహారం మాత్రమే.', '🐘'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.habits.hygiene', title: T('Washing hands and clean eating | చేతులు కడుక్కోవడం, శుభ్రంగా తినడం'),
      intro: [
        H('Clean hands, healthy me | శుభ్రమైన చేతులు, ఆరోగ్యమైన నేను'),
        P('Our hands touch many things — doors, toys, mud, money. Tiny germs we cannot see stick to them. If we eat with dirty hands, germs go into our tummy and make us ill. | మన చేతులు తలుపులు, బొమ్మలు, మట్టి, డబ్బులు ఎన్నో తాకుతాయి. కనిపించని చిన్న క్రిములు అంటుకుంటాయి. మురికి చేతులతో తింటే క్రిములు కడుపులోకి వెళ్లి జబ్బు చేస్తాయి.'),
        PIC('🧴', 'Use soap to wash away germs. | క్రిములను పోగొట్టడానికి సబ్బు వాడు.'),
        PIC('👐', 'Rub palms, backs, fingers and nails. | అరచేతులు, వెనుక భాగం, వేళ్లు, గోళ్లు రుద్దు.'),
        KEYS('Wash hands with soap before eating and after using the toilet. | తినే ముందు, మరుగుదొడ్డి వాడిన తర్వాత సబ్బుతో చేతులు కడుక్కో.',
          'Rub for as long as it takes to sing a short song (about 20 seconds). | చిన్న పాట పాడినంత సేపు (సుమారు 20 సెకన్లు) రుద్దు.',
          'Cut nails short. Cover food. Drink clean water. | గోళ్లు చిన్నగా కత్తిరించు. ఆహారంపై మూత పెట్టు. శుభ్రమైన నీళ్లు తాగు.',
          'Flies sit on dirt and then on open food — keep food covered. | ఈగలు మురికిపై వాలి తర్వాత ఆహారంపై వాలుతాయి — ఆహారం కప్పి ఉంచు.'),
        REM('Soap + water + 20 seconds = clean hands. | సబ్బు + నీళ్లు + 20 సెకన్లు = శుభ్రమైన చేతులు.'),
        TIP('Teach a younger child at home the hand-washing steps. | ఇంట్లో చిన్న పిల్లలకు చేతులు కడుక్కునే పద్ధతి నేర్పించు.'),
      ],
      examples: [
        EX('Sana played in the mud and now wants a snack. What first? | సనా మట్టిలో ఆడి ఇప్పుడు తినాలనుకుంటోంది. ముందు ఏం చేయాలి?', ['Mud has germs. | మట్టిలో క్రిములు ఉంటాయి.', 'Wash hands with soap and water. | సబ్బు, నీళ్లతో చేతులు కడగాలి.'], 'Wash hands with soap | సబ్బుతో చేతులు కడగాలి', '🧴'),
        EX('Why do we cover food? | ఆహారాన్ని ఎందుకు కప్పుతాం?', ['Flies carry germs from dirt. | ఈగలు మురికి నుంచి క్రిములు తెస్తాయి.', 'A lid keeps them away. | మూత వాటిని దూరంగా ఉంచుతుంది.'], 'To keep flies and dust away | ఈగలు, దుమ్ము పడకుండా', '🥫'),
      ],
      practice: [
        orderT('wash', 'Put the hand-washing steps in order. | చేతులు కడుక్కునే పనులను వరుసలో పెట్టు.', [
          'Wet your hands | చేతులు తడుపు', 'Put soap | సబ్బు రాయి', 'Rub palms, fingers and nails | అరచేతులు, వేళ్లు, గోళ్లు రుద్దు', 'Rinse with clean water | శుభ్రమైన నీటితో కడుగు', 'Dry with a clean towel | శుభ్రమైన తువ్వాలుతో తుడుచుకో',
        ], ['Water comes first. | ముందు నీళ్లు.', 'Drying comes last. | తుడుచుకోవడం చివర.'], 'Wet, soap, rub, rinse, dry. | తడుపు, సబ్బు, రుద్దు, కడుగు, తుడుచు.'),
        bank('when', [
          ['When must you wash your hands? | ఎప్పుడు తప్పకుండా చేతులు కడుక్కోవాలి?', 'Before eating | తినే ముందు', ['Before sleeping only on Sunday | ఆదివారం నిద్రకు ముందు మాత్రమే', 'Never | ఎప్పుడూ కాదు'], ['Hands put food in your mouth. | చేతులు ఆహారాన్ని నోటిలో పెడతాయి.', 'Germs go in too. | క్రిములు కూడా వెళ్తాయి.'], 'Always wash before eating. | తినే ముందు ఎప్పుడూ కడుక్కో.', 'Washing is needed every day, many times. | రోజూ చాలా సార్లు కడుక్కోవాలి.', '🖐️'],
          ['What helps remove germs best? | క్రిములను బాగా తొలగించేది ఏది?', 'Soap and water | సబ్బు, నీళ్లు', ['Only water for one second | ఒక్క సెకను నీళ్లు మాత్రమే', 'Wiping on your shirt | చొక్కాకు తుడుచుకోవడం'], ['Bubbles help. | నురుగు సాయం చేస్తుంది.', 'Rub for 20 seconds. | 20 సెకన్లు రుద్దు.'], 'Soap and water remove germs. | సబ్బు, నీళ్లు క్రిములను తొలగిస్తాయి.', 'A quick splash or a shirt does not clean hands. | కొంచెం నీళ్లు, చొక్కా చేతులను శుభ్రం చేయవు.', '🧴'],
          ['Why should nails be cut short? | గోళ్లు ఎందుకు చిన్నగా కత్తిరించాలి?', 'Dirt and germs hide under long nails | పొడవైన గోళ్ల కింద మురికి, క్రిములు దాక్కుంటాయి', ['To look scary | భయంకరంగా కనిపించడానికి', 'Long nails help us eat | పొడవైన గోళ్లు తినడానికి సాయం'], ['Look under a long nail. | పొడవైన గోరు కింద చూడు.', 'Dirt collects there. | మురికి చేరుతుంది.'], 'Short nails stay clean. | చిన్న గోళ్లు శుభ్రంగా ఉంటాయి.', 'Long nails trap dirt that goes into food. | పొడవైన గోళ్లలో మురికి ఆహారంలోకి వెళ్తుంది.', '✋'],
          ['Flies sit on open sweets in a shop. Should you buy them? | దుకాణంలో తెరిచి ఉన్న స్వీట్లపై ఈగలు వాలాయి. కొనాలా?', 'No, flies leave germs | వద్దు, ఈగలు క్రిములు వదులుతాయి', ['Yes, flies make them sweeter | అవును, ఈగలు మరింత తీపి చేస్తాయి'], ['Where were the flies before? | ఈగలు ముందు ఎక్కడ ఉన్నాయి?', 'On garbage! | చెత్తపై!'], 'Avoid uncovered food with flies. | ఈగలు వాలిన తెరిచిన ఆహారం వద్దు.', 'Flies carry germs, not sweetness. | ఈగలు క్రిములు తెస్తాయి, తీపి కాదు.', '🪰'],
          ['After using the toilet you should… | మరుగుదొడ్డి వాడిన తర్వాత…', 'wash hands with soap | సబ్బుతో చేతులు కడుక్కోవాలి', ['go and eat straight away | వెంటనే వెళ్లి తినాలి', 'touch your friends\' food | స్నేహితుల ఆహారం తాకాలి'], ['Toilets have many germs. | మరుగుదొడ్లలో చాలా క్రిములు.', 'Soap first! | ముందు సబ్బు!'], 'Always wash hands after the toilet. | మరుగుదొడ్డి తర్వాత ఎప్పుడూ చేతులు కడుక్కో.', 'Eating without washing spreads germs. | కడగకుండా తింటే క్రిములు వ్యాపిస్తాయి.', '🧴'],
          ['How long should you rub your hands with soap? | సబ్బుతో ఎంతసేపు చేతులు రుద్దాలి?', 'About 20 seconds | సుమారు 20 సెకన్లు', ['1 second | 1 సెకను', '1 hour | 1 గంట'], ['Sing a short song while rubbing. | రుద్దుతూ చిన్న పాట పాడు.', 'Not too short, not too long. | మరీ తక్కువ కాదు, మరీ ఎక్కువ కాదు.'], 'Rub for about 20 seconds. | సుమారు 20 సెకన్లు రుద్దు.', 'One second is too short; one hour is far too long. | ఒక సెకను చాలా తక్కువ; ఒక గంట చాలా ఎక్కువ.', '⏱'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 9 Our Village
const ch9: USpec = {
  id: 'ts3.evs.ch9', subject: 'evs', title: T('Our Village | మా ఊరు'), source: src(9),
  objectives: [
    {
      id: 'ts3.evs.village.places', title: T('Important places in a village | ఊరిలోని ముఖ్యమైన స్థలాలు'),
      intro: [
        H('A walk around the village | ఊరంతా ఒక నడక'),
        P('Kiran walks with tatayya through their village. They pass the school, the gram panchayat office, the bank, the health centre, the temple, the market and the big water tank. | కిరణ్ తాతయ్యతో ఊరంతా నడుస్తాడు. బడి, గ్రామ పంచాయతీ కార్యాలయం, బ్యాంకు, ఆరోగ్య కేంద్రం, గుడి, సంత, పెద్ద నీళ్ల ట్యాంకు దాటుతారు.'),
        PIC('🏫', 'The village school is where children learn. | ఊరి బడిలో పిల్లలు చదువుకుంటారు.'),
        PIC('🏘️', 'Houses, shops and offices together make a village. | ఇళ్లు, దుకాణాలు, కార్యాలయాలు కలిసి ఊరు.'),
        KEYS('Gram panchayat: the sarpanch and members look after roads, water and lights. | గ్రామ పంచాయతీ: సర్పంచ్, సభ్యులు రోడ్లు, నీళ్లు, వీధిదీపాలు చూసుకుంటారు.',
          'PHC (Primary Health Centre): doctors and nurses treat sick people. | ప్రాథమిక ఆరోగ్య కేంద్రం: డాక్టర్లు, నర్సులు వైద్యం చేస్తారు.',
          'Bank: people save money safely. Post office: letters and parcels. | బ్యాంకు: డబ్బు భద్రంగా దాచుకుంటారు. పోస్టాఫీసు: ఉత్తరాలు, పార్సిళ్లు.',
          'Overhead water tank: stores water for the whole village. | నీళ్ల ట్యాంకు: ఊరంతటికీ నీళ్లు నిల్వ చేస్తుంది.',
          'Ration shop: rice and other things at low prices. | రేషన్ షాపు: తక్కువ ధరకు బియ్యం, ఇతర వస్తువులు.'),
        REM('Public places belong to all of us — keep them clean. | ప్రజా స్థలాలు మనందరివీ — శుభ్రంగా ఉంచాలి.'),
        TIP('Draw your village or colony. Mark your house, school and the shop. | మీ ఊరు లేదా కాలనీ బొమ్మ గీయి. ఇల్లు, బడి, దుకాణం గుర్తు పెట్టు.'),
      ],
      examples: [
        EX('Lakshmi has a fever. Where in the village can she get medicine? | లక్ష్మికి జ్వరం. ఊరిలో ఎక్కడ మందులు దొరుకుతాయి?', ['Doctors and nurses work at the health centre. | ఆరోగ్య కేంద్రంలో డాక్టర్లు, నర్సులు ఉంటారు.'], 'At the PHC (health centre) | ప్రాథమిక ఆరోగ్య కేంద్రంలో', '🧑‍⚕️'),
        EX('The street light is broken. Whom should the people tell? | వీధిదీపం పాడైంది. ప్రజలు ఎవరికి చెప్పాలి?', ['The panchayat looks after lights and roads. | పంచాయతీ దీపాలు, రోడ్లు చూసుకుంటుంది.'], 'The gram panchayat | గ్రామ పంచాయతీ', '💡'),
      ],
      practice: [
        matchT('place', 'Match each place to what happens there. | ప్రతి స్థలాన్ని అక్కడ జరిగే పనితో జత చేయి.', [
          ['School | బడి', 'children learn | పిల్లలు చదువుకుంటారు', '🏫'], ['PHC | ఆరోగ్య కేంద్రం', 'sick people are treated | వైద్యం చేస్తారు', '🧑‍⚕️'],
          ['Bank | బ్యాంకు', 'money is kept safely | డబ్బు భద్రంగా', '🪙'], ['Post office | పోస్టాఫీసు', 'letters are sent | ఉత్తరాలు పంపుతారు', '📄'],
          ['Gram panchayat | గ్రామ పంచాయతీ', 'village roads and water are looked after | రోడ్లు, నీళ్లు చూసుకుంటారు', '🏢'], ['Water tank | నీళ్ల ట్యాంకు', 'water is stored | నీళ్లు నిల్వ', '💧'],
          ['Ration shop | రేషన్ షాపు', 'rice at low price | తక్కువ ధరకు బియ్యం', '🛒'], ['Temple | గుడి', 'people pray | ప్రజలు పూజిస్తారు', '🛕'],
        ], ['What do people go there for? | అక్కడికి ఎందుకు వెళ్తారు?', 'Start with the school. | బడితో మొదలుపెట్టు.'], 'Think of why people visit each place. | ప్రతి స్థలానికి ఎందుకు వెళ్తారో ఆలోచించు.'),
        bank('where', [
          ['Who is the head of the gram panchayat? | గ్రామ పంచాయతీకి అధిపతి ఎవరు?', 'Sarpanch | సర్పంచ్', ['Postman | పోస్ట్‌మ్యాన్', 'Shopkeeper | దుకాణదారు'], ['The village elects this person. | ఊరి ప్రజలు ఎన్నుకుంటారు.', 'Starts with S. | "స" తో మొదలవుతుంది.'], 'The sarpanch heads the panchayat. | సర్పంచ్ పంచాయతీ అధిపతి.', 'Postmen and shopkeepers do other work. | పోస్ట్‌మ్యాన్, దుకాణదారు వేరే పనులు చేస్తారు.', '🏢'],
          ['Where do villagers keep their savings safely? | ఊరి ప్రజలు డబ్బు ఎక్కడ భద్రంగా దాచుకుంటారు?', 'Bank | బ్యాంకు', ['Water tank | నీళ్ల ట్యాంకు', 'Playground | ఆటస్థలం'], ['It has a strong locker. | గట్టి లాకర్ ఉంటుంది.', 'You get a passbook. | పాస్‌బుక్ ఇస్తారు.'], 'Money is kept safe in a bank. | బ్యాంకులో డబ్బు భద్రం.', 'Tanks hold water; playgrounds are for games. | ట్యాంకులో నీళ్లు; ఆటస్థలం ఆటలకు.', '🪙'],
          ['What does the big water tank do? | పెద్ద నీళ్ల ట్యాంకు ఏం చేస్తుంది?', 'Stores water for the village | ఊరి కోసం నీళ్లు నిల్వ చేస్తుంది', ['Stores letters | ఉత్తరాలు దాచుతుంది', 'Treats sick people | వైద్యం చేస్తుంది'], ['It stands high on pillars. | ఎత్తైన స్తంభాలపై ఉంటుంది.', 'Pipes go from it to taps. | దాని నుంచి నల్లాలకు పైపులు.'], 'The tank stores water for everyone. | ట్యాంకు అందరికీ నీళ్లు నిల్వ చేస్తుంది.', 'Letters go to the post office; the PHC treats the sick. | ఉత్తరాలు పోస్టాఫీసుకు; వైద్యం ఆరోగ్య కేంద్రంలో.', '💧'],
          ['Where do we get rice at a low price with a ration card? | రేషన్ కార్డుతో తక్కువ ధరకు బియ్యం ఎక్కడ దొరుకుతాయి?', 'Ration shop | రేషన్ షాపు', ['Bank | బ్యాంకు', 'Temple | గుడి'], ['It is a government fair-price shop. | ఇది ప్రభుత్వ చౌక ధరల దుకాణం.', 'Bring the ration card. | రేషన్ కార్డు తీసుకెళ్లు.'], 'The ration shop gives rice at low cost. | రేషన్ షాపు తక్కువ ధరకు బియ్యం ఇస్తుంది.', 'Banks keep money; temples are for prayer. | బ్యాంకు డబ్బుకు; గుడి పూజకు.', '🛒'],
          ['A baby needs vaccines (injections to stay safe from illness). Where? | పాపాయికి టీకాలు కావాలి. ఎక్కడ?', 'PHC (health centre) | ఆరోగ్య కేంద్రం', ['Post office | పోస్టాఫీసు', 'Market | సంత'], ['Nurses give vaccines. | నర్సులు టీకాలు వేస్తారు.', 'It is a health place. | ఆరోగ్య స్థలం.'], 'Vaccines are given at the PHC. | ఆరోగ్య కేంద్రంలో టీకాలు వేస్తారు.', 'Post offices and markets do not give vaccines. | పోస్టాఫీసు, సంతలో టీకాలు వేయరు.', '💊'],
          ['How should we treat public places like the bus stop? | బస్టాప్ లాంటి ప్రజా స్థలాలను ఎలా చూసుకోవాలి?', 'Keep them clean and do not damage them | శుభ్రంగా ఉంచి పాడుచేయకూడదు', ['Write on the walls | గోడలపై రాయాలి', 'Throw garbage there | చెత్త వేయాలి'], ['They belong to everyone. | అవి అందరివీ.', 'Would you dirty your own house? | నీ ఇల్లు మురికి చేస్తావా?'], 'Keep public places clean. | ప్రజా స్థలాలను శుభ్రంగా ఉంచు.', 'Writing and garbage spoil places for all. | రాతలు, చెత్త అందరికీ ఇబ్బంది.', '🚌'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.village.life', title: T('Work and life in a village | ఊరిలో పనులు, జీవితం'),
      intro: [
        H('A busy day in the village | ఊరిలో హడావుడి రోజు'),
        P('At sunrise farmers go to the fields. Women and men work at the paddy harvest. On Wednesday there is the weekly market (santha), where people buy vegetables, pots and clothes. | తెల్లవారగానే రైతులు పొలాలకు వెళ్తారు. వరి కోతల్లో ఆడవాళ్లు, మగవాళ్లు పని చేస్తారు. బుధవారం వారపు సంత జరుగుతుంది, అక్కడ కూరగాయలు, కుండలు, బట్టలు కొంటారు.'),
        PIC('🧑‍🌾', 'Farming is the main work in many villages. | చాలా ఊళ్లలో వ్యవసాయమే ముఖ్యమైన పని.'),
        PIC('🐃', 'Buffaloes give milk and help on farms. | గేదెలు పాలు ఇస్తాయి, పొలం పనుల్లో సాయం.'),
        KEYS('Village work: farming, dairy (milk), weaving, pottery, fishing in tanks. | ఊరి పనులు: వ్యవసాయం, పాడి, నేత, కుండల తయారీ, చెరువుల్లో చేపలు పట్టడం.',
          'The weekly market (santha) brings sellers and buyers together. | వారపు సంత అమ్మేవాళ్లను, కొనేవాళ్లను కలుపుతుంది.',
          'Festivals like Bathukamma and Bonalu are celebrated by the whole village. | బతుకమ్మ, బోనాలు లాంటి పండుగలను ఊరంతా జరుపుకుంటుంది.'),
        REM('Villages grow the food that cities eat. | నగరాలు తినే ఆహారం ఊళ్లలో పండుతుంది.'),
        TIP('Ask an elder: what was your village like 30 years ago? | ఒక పెద్దవాళ్లను అడుగు: 30 ఏళ్ల క్రితం మీ ఊరు ఎలా ఉండేది?'),
      ],
      examples: [
        EX('What is a weekly market called in Telugu? | వారపు మార్కెట్‌ను తెలుగులో ఏమంటారు?', ['It happens on one fixed day each week. | వారానికి ఒక నిర్ణీత రోజు జరుగుతుంది.'], 'Santha | సంత', '🛒'),
        EX('Which festival of flowers is celebrated by women in every Telangana village? | ప్రతి తెలంగాణ ఊరిలో ఆడవాళ్లు జరుపుకునే పూల పండుగ ఏది?', ['Flowers like tangedu are stacked in layers. | తంగేడు లాంటి పువ్వులను వరుసలుగా పేర్చుతారు.'], 'Bathukamma | బతుకమ్మ', '🌼'),
      ],
      practice: [
        bank('life', [
          ['What is the main work in most villages? | చాలా ఊళ్లలో ముఖ్యమైన పని ఏది?', 'Farming | వ్యవసాయం', ['Building aeroplanes | విమానాలు తయారుచేయడం', 'Selling cars | కార్లు అమ్మడం'], ['Fields everywhere! | ఎటు చూసినా పొలాలు!', 'Paddy, cotton, maize. | వరి, పత్తి, మొక్కజొన్న.'], 'Farming is the main village work. | వ్యవసాయం ఊరి ముఖ్యమైన పని.', 'Aeroplanes and cars are made in big factories. | విమానాలు, కార్లు పెద్ద ఫ్యాక్టరీల్లో తయారవుతాయి.', '🧑‍🌾'],
          ['Where do villagers buy and sell once a week? | ఊరి ప్రజలు వారానికి ఒకసారి ఎక్కడ కొని అమ్ముతారు?', 'Santha (weekly market) | సంత', ['Airport | విమానాశ్రయం', 'Zoo | జూ'], ['It happens on one day each week. | వారానికి ఒక రోజు.', 'Vegetables, pots, clothes. | కూరగాయలు, కుండలు, బట్టలు.'], 'People trade at the santha. | సంతలో కొని అమ్ముతారు.', 'Airports and zoos are not markets. | విమానాశ్రయం, జూ సంతలు కావు.', '🛒'],
          ['Which animal gives milk in many village homes? | చాలా ఊరి ఇళ్లలో పాలు ఇచ్చే జంతువు ఏది?', 'Buffalo | గేదె', ['Tiger | పులి', 'Crow | కాకి'], ['It is black and loves water. | నల్లగా, నీళ్లంటే ఇష్టం.', 'A farm animal. | పశువు.'], 'Buffaloes give milk. | గేదెలు పాలు ఇస్తాయి.', 'Tigers are wild; crows are birds. | పులి అడవి జంతువు; కాకి పక్షి.', '🐃'],
          ['Which festival is celebrated with stacked flowers by Telangana women? | పేర్చిన పువ్వులతో తెలంగాణ ఆడవాళ్లు జరుపుకునే పండుగ?', 'Bathukamma | బతుకమ్మ', ['Christmas | క్రిస్మస్', 'Holi | హోళీ'], ['Tangedu and gunugu flowers. | తంగేడు, గునుగు పువ్వులు.', 'Songs and circles. | పాటలు, చుట్టూ తిరగడం.'], 'Bathukamma is the flower festival. | బతుకమ్మ పూల పండుగ.', 'Christmas and Holi are other festivals. | క్రిస్మస్, హోళీ వేరే పండుగలు.', '🌼'],
          ['Where do fishermen in a village catch fish? | ఊరిలో జాలర్లు చేపలు ఎక్కడ పడతారు?', 'In the village tank (cheruvu) | ఊరి చెరువులో', ['In the school | బడిలో', 'In the bank | బ్యాంకులో'], ['Fish live in water. | చేపలు నీటిలో ఉంటాయి.', 'Telangana has many tanks. | తెలంగాణలో చాలా చెరువులు.'], 'Fish are caught in village tanks. | చెరువుల్లో చేపలు పడతారు.', 'Schools and banks have no fish! | బడి, బ్యాంకులో చేపలు ఉండవు!', '🐟'],
        ]),
        tapT('jobs', 'Tap ALL the kinds of work often done in a village. | ఊరిలో సాధారణంగా చేసే పనులన్నీ నొక్కు.',
          ['farming | వ్యవసాయం', 'milking buffaloes | గేదెల పాలు పితకడం', 'weaving | నేత', 'making clay pots | కుండలు చేయడం', 'fishing in the tank | చెరువులో చేపలు పట్టడం'],
          ['flying aeroplanes | విమానాలు నడపడం', 'working on a ship | ఓడలో పని', 'driving the metro train | మెట్రో రైలు నడపడం'],
          ['What do you see in fields and village homes? | పొలాల్లో, ఊరి ఇళ్లలో ఏం చూస్తావు?', 'Ships and metros are not in villages. | ఓడలు, మెట్రోలు ఊళ్లలో ఉండవు.'],
          'Village work is close to land, animals and water. | ఊరి పనులు నేల, పశువులు, నీళ్లతో ముడిపడి ఉంటాయి.'),
      ],
    },
    {
      id: 'ts3.evs.village.transport', title: T('Transport in a village | ఊరిలో రవాణా'),
      intro: [
        H('How do people travel? | ప్రజలు ఎలా ప్రయాణిస్తారు?'),
        P('Long ago, people in villages walked or went by bullock cart. Today they use bicycles, motorbikes, auto-rickshaws, tractors and RTC buses to reach the town. | పూర్వం ఊళ్లలో నడిచి లేదా ఎడ్ల బండిపై వెళ్లేవారు. ఇప్పుడు పట్టణానికి సైకిళ్లు, బైకులు, ఆటోలు, ట్రాక్టర్లు, ఆర్టీసీ బస్సులు వాడుతున్నారు.'),
        PIC('🚌', 'The RTC bus connects the village to the town. | ఆర్టీసీ బస్సు ఊరిని పట్టణంతో కలుపుతుంది.'),
        PIC('🚜', 'A tractor carries crops and pulls the plough. | ట్రాక్టర్ పంటను మోస్తుంది, నాగలి లాగుతుంది.'),
        PIC('🛺', 'An auto-rickshaw carries a few people at a time. | ఆటో కొద్దిమందిని ఒకేసారి తీసుకెళ్తుంది.'),
        KEYS('Old ways: walking, bullock cart, horse cart. | పాత పద్ధతులు: నడక, ఎడ్ల బండి, గుర్రపు బండి.',
          'New ways: bicycle, motorbike, auto, bus, tractor. | కొత్త పద్ధతులు: సైకిల్, బైక్, ఆటో, బస్సు, ట్రాక్టర్.',
          'Buses carry many people and save fuel. | బస్సులు ఎక్కువ మందిని తీసుకెళ్లి ఇంధనం ఆదా చేస్తాయి.',
          'Safety: wait for the bus to stop; never hang on the door. | భద్రత: బస్సు ఆగాకే ఎక్కు; తలుపు దగ్గర వేలాడకు.'),
        REM('Walk or cycle for short distances — it is healthy and keeps air clean. | దగ్గరి దూరాలకు నడువు లేదా సైకిల్ తొక్కు — ఆరోగ్యం, శుభ్రమైన గాలి.'),
        TIP('How do you come to school? Make a class chart of everyone\'s way. | నువ్వు బడికి ఎలా వస్తావు? తరగతి అందరి పద్ధతుల పట్టిక తయారు చేయి.'),
      ],
      examples: [
        EX('What did villagers use long ago to carry crops? | పూర్వం ఊరి ప్రజలు పంట మోయడానికి ఏం వాడేవారు?', ['Two bullocks pulled a wooden cart. | రెండు ఎడ్లు చెక్క బండి లాగేవి.'], 'Bullock cart | ఎడ్ల బండి', '🐃'),
        EX('Which vehicle carries the most people from the village to town? | ఊరి నుంచి పట్టణానికి ఎక్కువ మందిని తీసుకెళ్లే వాహనం ఏది?', ['A bicycle carries one or two. | సైకిల్ ఒకరిద్దరిని.', 'A bus carries about fifty. | బస్సు దాదాపు యాభై మందిని.'], 'The bus | బస్సు', '🚌'),
      ],
      practice: [
        tapT('old', 'Tap ALL the OLD ways of travel in villages. | ఊళ్లలో పాత ప్రయాణ పద్ధతులన్నీ నొక్కు.',
          ['bullock cart | ఎడ్ల బండి', 'walking | నడక', 'horse cart | గుర్రపు బండి'],
          ['motorbike | బైక్', 'auto-rickshaw | ఆటో', 'RTC bus | ఆర్టీసీ బస్సు', 'tractor | ట్రాక్టర్'],
          ['Which ones need no petrol or diesel? | ఏవి పెట్రోల్, డీజిల్ లేకుండా నడుస్తాయి?', 'Animals and feet! | జంతువులు, కాళ్లు!'],
          'Old ways used feet or animals; new ways use engines. | పాత పద్ధతుల్లో కాళ్లు, జంతువులు; కొత్త వాటిలో ఇంజిన్లు.'),
        bank('ride', [
          ['Which vehicle pulls a plough and carries crops? | నాగలి లాగి, పంట మోసే వాహనం ఏది?', 'Tractor | ట్రాక్టర్', ['Aeroplane | విమానం', 'Boat | పడవ'], ['It has huge back wheels. | పెద్ద వెనుక చక్రాలు ఉంటాయి.', 'Used on farms. | పొలాల్లో వాడతారు.'], 'A tractor does farm work. | ట్రాక్టర్ పొలం పనులు చేస్తుంది.', 'Aeroplanes fly and boats float. | విమానాలు ఎగురుతాయి, పడవలు తేలుతాయి.', '🚜'],
          ['Which travel needs no fuel and keeps you healthy? | ఇంధనం లేకుండా, ఆరోగ్యం ఇచ్చే ప్రయాణం ఏది?', 'Cycling | సైకిల్ తొక్కడం', ['Car | కారు', 'Motorbike | బైక్'], ['You pedal with your legs. | కాళ్లతో పెడల్ తొక్కుతావు.', 'Two wheels, no engine. | రెండు చక్రాలు, ఇంజిన్ లేదు.'], 'Cycling needs no fuel. | సైకిల్‌కు ఇంధనం అక్కర్లేదు.', 'Cars and bikes burn petrol. | కార్లు, బైకులు పెట్రోల్ వాడతాయి.', '🚲'],
          ['When should you get on a bus? | బస్సు ఎప్పుడు ఎక్కాలి?', 'Only after it stops fully | పూర్తిగా ఆగిన తర్వాత మాత్రమే', ['While it is moving | కదులుతున్నప్పుడు', 'From the window | కిటికీ నుంచి'], ['Moving buses are dangerous. | కదిలే బస్సు ప్రమాదం.', 'Wait patiently. | ఓపికగా ఆగు.'], 'Board only when the bus has stopped. | బస్సు ఆగాకే ఎక్కు.', 'Jumping onto a moving bus can cause a fall. | కదిలే బస్సు ఎక్కితే పడిపోవచ్చు.', '🚌'],
          ['Why is a bus better than many cars for the same people? | అంతే మందికి చాలా కార్ల కంటే బస్సు ఎందుకు మంచిది?', 'It saves fuel and makes less smoke | ఇంధనం ఆదా, పొగ తక్కువ', ['It is slower than walking | నడక కంటే నెమ్మది', 'It flies | ఎగురుతుంది'], ['One bus or fifty cars? | ఒక బస్సా, యాభై కార్లా?', 'Less fuel overall. | మొత్తం తక్కువ ఇంధనం.'], 'One bus saves fuel and smoke. | ఒక బస్సు ఇంధనం, పొగ ఆదా.', 'Buses are faster than walking and do not fly. | బస్సు నడక కంటే వేగం, ఎగరదు.', '🌬️'],
          ['Which vehicle was pulled by animals? | జంతువులు లాగే వాహనం ఏది?', 'Bullock cart | ఎడ్ల బండి', ['Auto-rickshaw | ఆటో', 'Bus | బస్సు'], ['Two bullocks in front. | ముందు రెండు ఎడ్లు.', 'Wooden wheels. | చెక్క చక్రాలు.'], 'Bullocks pull the cart. | ఎడ్లు బండి లాగుతాయి.', 'Autos and buses have engines. | ఆటో, బస్సులకు ఇంజిన్లు ఉంటాయి.', '🛞'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 10 Different Types of Houses
const ch10: USpec = {
  id: 'ts3.evs.ch10', subject: 'evs', title: T('Different Types of Houses | వివిధ రకాల ఇళ్లు'), source: src(10),
  objectives: [
    {
      id: 'ts3.evs.houses.types', title: T('Kutcha and pucca houses | పూరి ఇళ్లు, పక్కా ఇళ్లు'),
      intro: [
        H('Houses of many kinds | ఎన్నో రకాల ఇళ్లు'),
        P('Ravi\'s grandparents live in a mud house with a thatched roof in the village. Ravi lives in a flat in a tall building in Hyderabad. Both are homes! | రవి తాతయ్య నానమ్మలు ఊరిలో గడ్డి కప్పు ఉన్న మట్టి ఇంట్లో ఉంటారు. రవి హైదరాబాద్‌లో ఎత్తైన భవనంలో ఫ్లాట్‌లో ఉంటాడు. రెండూ ఇళ్లే!'),
        PIC('🏠', 'A house protects us from sun, rain, cold and animals. | ఇల్లు ఎండ, వాన, చలి, జంతువుల నుంచి కాపాడుతుంది.'),
        PIC('🧱', 'Pucca houses are built with bricks and cement. | పక్కా ఇళ్లను ఇటుకలు, సిమెంట్‌తో కడతారు.'),
        PIC('🏢', 'Many families live in a block of flats. | ఒక అపార్ట్‌మెంట్‌లో చాలా కుటుంబాలు ఉంటాయి.'),
        KEYS('Kutcha house: mud, wood, bamboo, grass — needs repair after rains. | పూరి (కచ్చా) ఇల్లు: మట్టి, కర్ర, వెదురు, గడ్డి — వానల తర్వాత మరమ్మతు కావాలి.',
          'Pucca house: bricks, cement, stone, iron — strong and lasts long. | పక్కా ఇల్లు: ఇటుకలు, సిమెంట్, రాయి, ఇనుము — బలంగా, ఎక్కువ కాలం.',
          'Flats: many homes stacked in one tall building. | అపార్ట్‌మెంట్: ఒకే ఎత్తైన భవనంలో ఎన్నో ఇళ్లు.',
          'People build houses with materials found nearby. | దగ్గర దొరికే వస్తువులతో ఇళ్లు కడతారు.'),
        REM('Big or small, a home is where a family feels safe. | పెద్దదైనా చిన్నదైనా, కుటుంబం భద్రంగా ఉండే చోటే ఇల్లు.'),
        TIP('Look at houses on your street. What are their walls made of? | మీ వీధిలో ఇళ్లు చూడు. గోడలు దేనితో కట్టారు?'),
      ],
      examples: [
        EX('A house has mud walls and a grass roof. Kutcha or pucca? | ఒక ఇంటికి మట్టి గోడలు, గడ్డి కప్పు. పూరి ఇల్లా, పక్కా ఇల్లా?', ['Mud and grass are soft materials. | మట్టి, గడ్డి మెత్తటి పదార్థాలు.', 'Rain can damage them. | వాన పాడుచేయగలదు.'], 'Kutcha house | పూరి ఇల్లు', '🌾'),
        EX('What are pucca houses made of? | పక్కా ఇళ్లు దేనితో కడతారు?', ['Strong materials that last many years. | ఎన్నో ఏళ్లు నిలిచే బలమైన పదార్థాలు.'], 'Bricks, cement, stone and iron | ఇటుకలు, సిమెంట్, రాయి, ఇనుము', '🧱'),
      ],
      practice: [
        tapT('pucca', 'Tap ALL the materials used for a PUCCA house. | పక్కా ఇంటికి వాడే పదార్థాలన్నీ నొక్కు.',
          ['bricks | ఇటుకలు', 'cement | సిమెంట్', 'stone | రాయి', 'iron rods | ఇనుప కడ్డీలు', 'sand | ఇసుక'],
          ['dry grass | ఎండు గడ్డి', 'palm leaves | తాటాకులు', 'mud | మట్టి', 'bamboo mats | వెదురు తడికలు'],
          ['Which are strong and last long? | ఏవి బలంగా, ఎక్కువ కాలం ఉంటాయి?', 'Grass and leaves are for kutcha houses. | గడ్డి, ఆకులు పూరి ఇళ్లకు.'],
          'Pucca houses use strong materials; kutcha houses use mud and grass. | పక్కా ఇళ్లకు బలమైన పదార్థాలు; పూరి ఇళ్లకు మట్టి, గడ్డి.'),
        bank('kind', [
          ['Why do we need a house? | మనకు ఇల్లు ఎందుకు?', 'To be safe from sun, rain, cold and animals | ఎండ, వాన, చలి, జంతువుల నుంచి రక్షణకు', ['To keep the rain inside | వానను లోపల ఉంచడానికి', 'Only to keep a TV | టీవీ పెట్టడానికి మాత్రమే'], ['What happens in heavy rain outside? | బయట పెద్ద వానలో ఏమవుతుంది?', 'Shelter. | ఆశ్రయం.'], 'A house keeps us safe. | ఇల్లు మనల్ని కాపాడుతుంది.', 'A house keeps rain out, not in. | ఇల్లు వానను బయటే ఉంచుతుంది.', '🏠'],
          ['Which house needs repair after every rainy season? | ప్రతి వానాకాలం తర్వాత మరమ్మతు కావాల్సిన ఇల్లు ఏది?', 'Kutcha house | పూరి ఇల్లు', ['Pucca house | పక్కా ఇల్లు', 'Stone fort | రాతి కోట'], ['Mud walls get wet. | మట్టి గోడలు తడుస్తాయి.', 'Grass roofs leak. | గడ్డి కప్పు కారుతుంది.'], 'Kutcha houses need repair after rains. | పూరి ఇళ్లకు వానల తర్వాత మరమ్మతు.', 'Pucca houses and forts are strong. | పక్కా ఇళ్లు, కోటలు బలంగా ఉంటాయి.', '🌧️'],
          ['Many families live on different floors of one tall building. This is a… | ఒకే ఎత్తైన భవనంలో వేర్వేరు అంతస్తుల్లో చాలా కుటుంబాలు. ఇది…', 'block of flats (apartment) | అపార్ట్‌మెంట్', ['hut | గుడిసె', 'tent | గుడారం'], ['Lift and stairs. | లిఫ్ట్, మెట్లు.', 'Common in cities. | నగరాల్లో ఎక్కువ.'], 'That is an apartment building. | అది అపార్ట్‌మెంట్.', 'A hut or tent holds one family. | గుడిసె, గుడారంలో ఒక కుటుంబం.', '🏢'],
          ['Which material makes walls of a kutcha house? | పూరి ఇంటి గోడలు దేనితో?', 'Mud | మట్టి', ['Cement | సిమెంట్', 'Glass | గాజు'], ['Soft and brown. | మెత్తగా, గోధుమ రంగులో.', 'Found in the fields. | పొలాల్లో దొరుకుతుంది.'], 'Kutcha walls are of mud. | పూరి గోడలు మట్టితో.', 'Cement is for pucca houses. | సిమెంట్ పక్కా ఇళ్లకు.', '🟫'],
          ['Why are houses made of different materials in different places? | వేర్వేరు చోట్ల వేర్వేరు పదార్థాలతో ఇళ్లు ఎందుకు కడతారు?', 'People use what is found nearby | దగ్గర దొరికేది వాడతారు', ['Because of TV shows | టీవీ షోల వల్ల', 'Because houses can walk | ఇళ్లు నడవగలవు కాబట్టి'], ['Bamboo grows in forests. | అడవుల్లో వెదురు పెరుగుతుంది.', 'Stone near hills. | కొండల దగ్గర రాయి.'], 'Local materials are used. | స్థానిక పదార్థాలు వాడతారు.', 'Houses depend on nearby materials and weather. | ఇళ్లు దగ్గరి పదార్థాలు, వాతావరణంపై ఆధారపడతాయి.', '🪵'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.houses.temporary', title: T('Temporary homes | తాత్కాలిక నివాసాలు'),
      intro: [
        H('Homes that move | కదిలే ఇళ్లు'),
        P('Shepherds (gollalu) move from place to place with their sheep and live in small tents. Workers building a road live in tin sheds for some months. Farmers rest in a small hut (manchi) in the field to guard crops. | గొల్లలు గొర్రెలతో ఊరూరా తిరిగి చిన్న గుడారాల్లో ఉంటారు. రోడ్డు వేసే కూలీలు కొన్ని నెలలు రేకుల షెడ్లలో ఉంటారు. రైతులు పంట కాపలాకు పొలంలో మంచె మీద ఉంటారు.'),
        PIC('🐑', 'Shepherds move with their flocks and live in tents. | గొల్లలు మందలతో తిరుగుతూ గుడారాల్లో ఉంటారు.'),
        PIC('⛵', 'In Kerala some people live on houseboats. | కేరళలో కొందరు హౌస్‌బోట్లలో ఉంటారు.'),
        KEYS('Temporary homes are used for a short time and can be moved or taken down. | తాత్కాలిక ఇళ్లు కొద్ది కాలమే, తీసేయవచ్చు లేదా మార్చవచ్చు.',
          'Tent: cloth or plastic sheet on poles — shepherds, campers, soldiers. | గుడారం: కర్రలపై బట్ట లేదా ప్లాస్టిక్ — గొల్లలు, సైనికులు.',
          'Manche: a raised platform in the field to guard crops from birds and animals. | మంచె: పక్షులు, జంతువుల నుంచి పంట కాపాడటానికి పొలంలో ఎత్తైన వేదిక.',
          'Houseboat on water; igloo of snow blocks in very cold lands; caravan on wheels. | నీటిపై హౌస్‌బోట్; చల్లని దేశాల్లో మంచు ఇటుకల ఇగ్లూ; చక్రాలపై కారవాన్.'),
        REM('Some people move with their work, so their homes move too. | కొందరు పని కోసం తిరుగుతారు, వాళ్ల ఇళ్లూ తిరుగుతాయి.'),
        TIP('Make a tent with a bedsheet and two chairs. Who can fit inside? | బెడ్‌షీట్, రెండు కుర్చీలతో గుడారం కట్టు. లోపల ఎంత మంది పడతారు?'),
      ],
      examples: [
        EX('Why do shepherds live in tents? | గొల్లలు గుడారాల్లో ఎందుకు ఉంటారు?', ['They keep moving to find grass for sheep. | గొర్రెలకు గడ్డి కోసం తిరుగుతుంటారు.', 'Tents can be folded and carried. | గుడారాలను మడిచి మోయవచ్చు.'], 'They move often, and tents are easy to carry | తరచు తిరుగుతారు, గుడారం మోయడం సులభం', '🐑'),
        EX('What is a manche used for? | మంచె దేనికి వాడతారు?', ['It is a high platform in the field. | పొలంలో ఎత్తైన వేదిక.', 'The farmer can see far from it. | దాని మీది నుంచి రైతు దూరం చూడగలడు.'], 'To guard crops from birds and animals | పక్షులు, జంతువుల నుంచి పంట కాపాడటానికి', '🌾'),
      ],
      practice: [
        matchT('who', 'Match each temporary home to who uses it. | ప్రతి తాత్కాలిక ఇంటిని వాడేవాళ్లతో జత చేయి.', [
          ['Tent | గుడారం', 'shepherds on the move | తిరిగే గొల్లలు', '🐑'], ['Manche | మంచె', 'farmer guarding crops | పంట కాపాడే రైతు', '🌾'],
          ['Houseboat | హౌస్‌బోట్', 'people living on water | నీటిపై ఉండేవాళ్లు', '⛵'], ['Igloo | ఇగ్లూ', 'people in snowy lands | మంచు దేశాల ప్రజలు', '🧊'],
          ['Tin shed | రేకుల షెడ్', 'road and building workers | రోడ్డు, భవన కూలీలు', '🧱'], ['Caravan | కారవాన్', 'travellers on wheels | చక్రాల మీద ప్రయాణికులు', '🚐'],
        ], ['Where does each person live or work? | ప్రతి ఒక్కరు ఎక్కడ ఉంటారు, పనిచేస్తారు?', 'Snow → igloo; water → boat. | మంచు → ఇగ్లూ; నీళ్లు → పడవ.'], 'Think about where each home is used. | ప్రతి ఇల్లు ఎక్కడ వాడతారో ఆలోచించు.'),
        bank('temp', [
          ['Which home can be folded and carried? | మడిచి మోయగలిగే ఇల్లు ఏది?', 'Tent | గుడారం', ['Brick house | ఇటుక ఇల్లు', 'Apartment | అపార్ట్‌మెంట్'], ['Cloth on poles. | కర్రలపై బట్ట.', 'Light to carry. | మోయడానికి తేలిక.'], 'A tent can be folded and carried. | గుడారాన్ని మడిచి మోయవచ్చు.', 'Brick houses and flats cannot move. | ఇటుక ఇళ్లు, ఫ్లాట్లు కదలవు.', '⛺'],
          ['An igloo is made of… | ఇగ్లూ దేనితో కడతారు…', 'blocks of snow | మంచు ఇటుకలు', ['clay pots | మట్టి కుండలు', 'banana leaves | అరటి ఆకులు'], ['Found in very cold lands. | చాలా చల్లని దేశాల్లో.', 'White and icy. | తెల్లగా, మంచుగా.'], 'Igloos are built from snow blocks. | ఇగ్లూ మంచు ఇటుకలతో.', 'Pots and leaves are not used for igloos. | కుండలు, ఆకులతో ఇగ్లూ కట్టరు.', '🧊'],
          ['Why are temporary homes used? | తాత్కాలిక ఇళ్లు ఎందుకు వాడతారు?', 'People stay only a short time in one place | ఒక చోట కొద్ది కాలమే ఉంటారు కాబట్టి', ['They are made of gold | బంగారంతో చేస్తారు', 'They last for 500 years | 500 ఏళ్లు ఉంటాయి'], ['Temporary means for a short time. | తాత్కాలికం అంటే కొద్ది కాలం.', 'People move on. | ప్రజలు ముందుకు కదులుతారు.'], 'Temporary homes are for short stays. | తాత్కాలిక ఇళ్లు కొద్ది కాలానికి.', 'Temporary homes do not last very long. | తాత్కాలిక ఇళ్లు ఎక్కువ కాలం ఉండవు.', '⏳'],
          ['Where is a houseboat found? | హౌస్‌బోట్ ఎక్కడ ఉంటుంది?', 'On water | నీటిపై', ['On a mountain top | కొండ శిఖరంపై', 'In a desert | ఎడారిలో'], ['It is a boat! | అది పడవ!', 'Kerala backwaters. | కేరళ కాలువలు.'], 'Houseboats float on water. | హౌస్‌బోట్లు నీటిపై తేలుతాయి.', 'Boats need water, not mountains or deserts. | పడవలకు నీళ్లు కావాలి.', '⛵'],
          ['Who lives in tin sheds for a few months? | కొన్ని నెలలు రేకుల షెడ్లలో ఎవరు ఉంటారు?', 'Workers building a road | రోడ్డు వేసే కూలీలు', ['The village sarpanch | ఊరి సర్పంచ్', 'Fish | చేపలు'], ['They move when the work is done. | పని అయిపోగానే వెళ్లిపోతారు.', 'Near construction sites. | నిర్మాణ స్థలాల దగ్గర.'], 'Construction workers live in sheds for a while. | నిర్మాణ కూలీలు కొంతకాలం షెడ్లలో.', 'The sarpanch has a home in the village. | సర్పంచ్‌కు ఊరిలో ఇల్లు ఉంటుంది.', '🧱'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.houses.roofs', title: T('Roofs of houses | ఇళ్ల పైకప్పులు'),
      intro: [
        H('Look up! | పైకి చూడు!'),
        P('Some village houses have sloping roofs of red clay tiles (penkulu). Some have roofs of dry grass or palm leaves. City houses have flat concrete roofs where people dry clothes. | కొన్ని ఊరి ఇళ్లకు ఎర్రని పెంకుల వాలు కప్పు. కొన్నింటికి ఎండు గడ్డి లేదా తాటాకుల కప్పు. నగర ఇళ్లకు చదునైన కాంక్రీటు కప్పు, దానిపై బట్టలు ఆరేస్తారు.'),
        PIC('🏘️', 'Tiled roofs slope so rain water slides off. | పెంకుల కప్పు వాలుగా ఉండి వాన నీళ్లు జారిపోతాయి.'),
        PIC('🌧️', 'In places with heavy rain, roofs are steep. | ఎక్కువ వాన పడే చోట కప్పులు బాగా వాలుగా.'),
        KEYS('Thatched roof: dry grass or palm leaves — cool in summer. | గడ్డి కప్పు: ఎండు గడ్డి లేదా తాటాకులు — వేసవిలో చల్లగా.',
          'Tiled roof: baked clay tiles (penkulu) — sloping. | పెంకుటిల్లు: కాల్చిన మట్టి పెంకులు — వాలుగా.',
          'Sheet roof: tin or asbestos sheets — gets very hot. | రేకుల కప్పు: టిన్ లేదా ఆస్బెస్టాస్ రేకులు — బాగా వేడెక్కుతాయి.',
          'Flat concrete (slab) roof: strong; can collect rain water. | కాంక్రీటు స్లాబ్: బలంగా; వాన నీళ్లు సేకరించవచ్చు.'),
        REM('Sloping roofs let rain and snow slide down. | వాలు కప్పులపై వాన, మంచు జారిపోతాయి.'),
        TIP('Draw the roof of your house. Is it flat or sloping? | మీ ఇంటి కప్పు బొమ్మ గీయి. చదునుగా ఉందా, వాలుగా ఉందా?'),
      ],
      examples: [
        EX('Why do many roofs slope? | చాలా కప్పులు ఎందుకు వాలుగా ఉంటాయి?', ['Rain falls on the roof. | వాన కప్పుపై పడుతుంది.', 'On a slope water slides away. | వాలుపై నీళ్లు జారిపోతాయి.'], 'So rain water flows off | వాన నీళ్లు జారిపోవడానికి', '🌧️'),
        EX('What can we do on a flat concrete roof? | చదునైన కాంక్రీటు కప్పుపై ఏం చేయవచ్చు?', ['It is flat and strong. | చదునుగా, బలంగా ఉంటుంది.'], 'Dry clothes, collect rain water | బట్టలు ఆరేయవచ్చు, వాన నీళ్లు సేకరించవచ్చు', '☀️'),
      ],
      practice: [
        bank('roof', [
          ['Red baked clay pieces on a roof are called… | కప్పుపై ఎర్రని కాల్చిన మట్టి ముక్కలను ఏమంటారు…', 'Tiles (penkulu) | పెంకులు', ['Bricks for walls | గోడ ఇటుకలు', 'Leaves | ఆకులు'], ['They overlap in rows. | వరుసలుగా ఒకదానిపై ఒకటి.', 'Made by potters. | కుమ్మరులు చేస్తారు.'], 'They are clay tiles. | అవి మట్టి పెంకులు.', 'Bricks are for walls; leaves are for thatch. | ఇటుకలు గోడలకు; ఆకులు గడ్డి కప్పుకు.', '🧱'],
          ['Which roof gets very hot in summer? | వేసవిలో బాగా వేడెక్కే కప్పు ఏది?', 'Tin sheet roof | రేకుల కప్పు', ['Thatched roof | గడ్డి కప్పు', 'No roof under a tree | చెట్టు కింద కప్పు లేదు'], ['Metal heats up in the sun. | ఎండలో లోహం వేడెక్కుతుంది.', 'Touch a tin can in the sun. | ఎండలో డబ్బా తాకి చూడు.'], 'Tin sheets get very hot. | రేకులు బాగా వేడెక్కుతాయి.', 'Thatch stays cool. | గడ్డి కప్పు చల్లగా ఉంటుంది.', '☀️'],
          ['A thatched roof is made of… | గడ్డి కప్పు దేనితో…', 'dry grass or palm leaves | ఎండు గడ్డి లేదా తాటాకులు', ['concrete | కాంక్రీటు', 'glass | గాజు'], ['From the fields. | పొలాల నుంచి.', 'Light and brown. | తేలికగా, గోధుమ రంగు.'], 'Thatch is dry grass or leaves. | గడ్డి కప్పు ఎండు గడ్డి/ఆకులతో.', 'Concrete is for slab roofs. | కాంక్రీటు స్లాబ్ కప్పులకు.', '🌾'],
          ['Which roof can collect rain water for storage? | వాన నీళ్లు నిల్వకు సేకరించే కప్పు ఏది?', 'Flat concrete roof | చదునైన కాంక్రీటు కప్పు', ['Grass roof | గడ్డి కప్పు', 'Tent roof | గుడారం కప్పు'], ['Pipes take water to a tank. | పైపులు నీళ్లను ట్యాంకుకు.', 'Strong and flat. | బలంగా, చదునుగా.'], 'Flat roofs can harvest rain. | చదునైన కప్పులతో వాన నీళ్లు సేకరించవచ్చు.', 'Grass and tent roofs soak or leak. | గడ్డి, గుడారం నీళ్లు పీల్చుకుంటాయి/కారుతాయి.', '💧'],
          ['In places with lots of rain or snow, roofs are… | ఎక్కువ వాన, మంచు ఉన్న చోట కప్పులు…', 'steep and sloping | బాగా వాలుగా', ['flat and open | చదునుగా, తెరిచి', 'made of paper | కాగితంతో'], ['Water must not collect. | నీళ్లు నిలవకూడదు.', 'Slide it down! | జారనివ్వు!'], 'Steep roofs let rain and snow slide. | వాలు కప్పులపై వాన, మంచు జారతాయి.', 'Flat roofs hold water; paper melts in rain. | చదును కప్పుపై నీళ్లు నిలుస్తాయి; కాగితం తడిసిపోతుంది.', '⛰️'],
        ]),
        matchT('mat', 'Match each roof to what it is made of. | ప్రతి కప్పును దాని పదార్థంతో జత చేయి.', [
          ['Thatched roof | గడ్డి కప్పు', 'dry grass | ఎండు గడ్డి', '🌾'], ['Tiled roof | పెంకుటి కప్పు', 'baked clay tiles | కాల్చిన మట్టి పెంకులు', '🧱'],
          ['Slab roof | స్లాబ్ కప్పు', 'concrete and iron | కాంక్రీటు, ఇనుము', '🏢'], ['Sheet roof | రేకుల కప్పు', 'tin sheets | టిన్ రేకులు', '🔩'],
          ['Tent roof | గుడారం కప్పు', 'cloth or plastic | బట్ట లేదా ప్లాస్టిక్', '⛺'], ['Hut roof near the sea | సముద్రం దగ్గరి గుడిసె కప్పు', 'coconut leaves | కొబ్బరి ఆకులు', '🥥'],
        ], ['The name of the roof is a clue. | కప్పు పేరులోనే సూచన.', 'Start with thatch. | గడ్డి కప్పుతో మొదలుపెట్టు.'], 'Look at the roof\'s name and think of its material. | కప్పు పేరు చూసి పదార్థం ఆలోచించు.'),
      ],
    },
  ],
};

// ================================================================== CH 11 Clean House is the Beautiful House
const ch11: USpec = {
  id: 'ts3.evs.ch11', subject: 'evs', title: T('Clean House is the Beautiful House | శుభ్రమైన ఇల్లే అందమైన ఇల్లు'), source: src(11),
  objectives: [
    {
      id: 'ts3.evs.clean.daily', title: T('Keeping the house clean every day | రోజూ ఇంటిని శుభ్రంగా ఉంచడం'),
      intro: [
        H('Let us clean together | కలిసి శుభ్రం చేద్దాం'),
        P('Every morning in Meena\'s house the floor is swept and mopped. Beds are made. Dishes are washed after meals. On Saturdays they dust the shelves and fans. | ప్రతి ఉదయం మీనా ఇంట్లో నేల ఊడ్చి తుడుస్తారు. పక్కలు సర్దుతారు. భోజనం తర్వాత గిన్నెలు కడుగుతారు. శనివారం అరలు, ఫ్యాన్లపై దుమ్ము దులుపుతారు.'),
        PIC('🧽', 'A sponge and soap wash dishes clean. | స్పాంజ్, సబ్బుతో గిన్నెలు శుభ్రం.'),
        PIC('🛏️', 'Making the bed every morning keeps the room neat. | రోజూ ఉదయం పక్క సర్దితే గది నీట్‌గా ఉంటుంది.'),
        KEYS('Daily: sweep, mop, wash dishes, make beds. | రోజూ: ఊడ్చడం, తుడవడం, గిన్నెలు కడగడం, పక్క సర్దడం.',
          'Weekly: dust fans and shelves, wash bedsheets, clean windows. | వారానికి: ఫ్యాన్లు, అరలు దులపడం, దుప్పట్లు ఉతకడం, కిటికీలు తుడవడం.',
          'Keep things in their place — shoes on the rack, books on the shelf. | వస్తువులు వాటి చోట — చెప్పులు స్టాండ్‌పై, పుస్తకాలు అరలో.',
          'Open windows to let in sunlight and fresh air. | ఎండ, గాలి రావడానికి కిటికీలు తెరువు.'),
        REM('A clean house keeps germs and insects away. | శుభ్రమైన ఇల్లు క్రిములను, పురుగులను దూరంగా ఉంచుతుంది.'),
        TIP('Choose one corner of your house and keep it neat all week. | ఇంట్లో ఒక మూలను ఎంచుకుని వారమంతా నీట్‌గా ఉంచు.'),
      ],
      examples: [
        EX('Where should shoes be kept? | చెప్పులు ఎక్కడ పెట్టాలి?', ['Shoes bring mud from outside. | చెప్పులు బయటి మట్టి తెస్తాయి.', 'Keep them outside the room on a rack. | గది బయట స్టాండ్‌పై పెట్టు.'], 'On a shoe rack near the door | గుమ్మం దగ్గర చెప్పుల స్టాండ్‌పై', '🚪'),
        EX('Why do we open windows in the morning? | ఉదయం కిటికీలు ఎందుకు తెరుస్తాం?', ['Fresh air comes in. | స్వచ్ఛమైన గాలి వస్తుంది.', 'Sunlight kills some germs. | ఎండ కొన్ని క్రిములను చంపుతుంది.'], 'For fresh air and sunlight | స్వచ్ఛమైన గాలి, ఎండ కోసం', '🪟'),
      ],
      practice: [
        tapT('daily', 'Tap ALL the jobs done EVERY DAY to keep a house clean. | ఇంటిని శుభ్రంగా ఉంచడానికి రోజూ చేసే పనులన్నీ నొక్కు.',
          ['sweeping the floor | నేల ఊడ్చడం', 'washing dishes | గిన్నెలు కడగడం', 'making the bed | పక్క సర్దడం', 'mopping the floor | నేల తుడవడం'],
          ['painting the walls | గోడలకు రంగు వేయడం', 'changing the roof | కప్పు మార్చడం', 'buying new furniture | కొత్త ఫర్నిచర్ కొనడం', 'building a new room | కొత్త గది కట్టడం'],
          ['Which jobs happen every single morning? | ఏ పనులు ప్రతి ఉదయం జరుగుతాయి?', 'Painting happens once in years. | రంగు ఏళ్లకోసారి.'],
          'Sweeping, mopping, dishes and beds are daily; painting is rare. | ఊడ్చడం, తుడవడం, గిన్నెలు, పక్క రోజూ; రంగు అరుదుగా.'),
        bank('clean', [
          ['Dirty dishes left overnight attract… | రాత్రంతా వదిలిన మురికి గిన్నెలు ఆకర్షించేవి…', 'cockroaches and ants | బొద్దింకలు, చీమలు', ['butterflies only | సీతాకోకచిలుకలు మాత్రమే', 'rainbows | ఇంద్రధనుస్సులు'], ['Who loves leftover food? | మిగిలిన ఆహారం ఎవరికి ఇష్టం?', 'Creepy crawlies! | పాకే పురుగులు!'], 'Leftovers attract cockroaches and ants. | మిగిలిన ఆహారం బొద్దింకలను, చీమలను ఆకర్షిస్తుంది.', 'Butterflies visit flowers, not dirty dishes. | సీతాకోకచిలుకలు పువ్వులకే వెళ్తాయి.', '🐜'],
          ['What do we use to remove dust from the floor? | నేలపై దుమ్ము తీయడానికి ఏం వాడతాం?', 'A broom | చీపురు', ['A spoon | చెంచా', 'A pillow | దిండు'], ['It has many thin sticks. | చాలా సన్నని పుల్లలు ఉంటాయి.', 'Swish swish! | ఊడ్చు ఊడ్చు!'], 'A broom sweeps dust. | చీపురు దుమ్ము ఊడుస్తుంది.', 'Spoons and pillows are not for sweeping. | చెంచా, దిండు ఊడ్చడానికి కాదు.', '🧹'],
          ['After playing, your toys should go… | ఆడిన తర్వాత బొమ్మలు ఎక్కడ…', 'back into the toy box | తిరిగి బొమ్మల డబ్బాలో', ['all over the floor | నేల అంతా', 'into the kitchen sink | వంటగది సింక్‌లో'], ['Things have a place. | ప్రతి వస్తువుకు ఒక చోటు.', 'Someone may trip! | ఎవరైనా జారి పడవచ్చు!'], 'Put toys back in their box. | బొమ్మలను డబ్బాలో పెట్టు.', 'Toys on the floor can trip people. | నేలపై బొమ్మలతో జారిపడవచ్చు.', '🧸'],
          ['How often do we wash bedsheets? | దుప్పట్లు ఎంత తరచుగా ఉతకాలి?', 'Every week | ప్రతి వారం', ['Once in five years | ఐదేళ్లకోసారి', 'Never | ఎప్పుడూ కాదు'], ['They collect sweat and dust. | చెమట, దుమ్ము పడతాయి.', 'Not daily, not never. | రోజూ కాదు, ఎప్పుడూ-కాదు కాదు.'], 'Wash bedsheets every week. | ప్రతి వారం దుప్పట్లు ఉతకాలి.', 'Waiting years makes them dirty and smelly. | ఏళ్లు ఆగితే మురికి, వాసన.', '🛏️'],
          ['Why should a house get sunlight? | ఇంటికి ఎండ ఎందుకు రావాలి?', 'It keeps the house dry and kills some germs | ఇల్లు పొడిగా ఉంటుంది, కొన్ని క్రిములు చస్తాయి', ['It makes the house wet | ఇల్లు తడిగా అవుతుంది', 'It brings mosquitoes | దోమలు వస్తాయి'], ['Damp corners smell bad. | తడి మూలలు వాసన.', 'Sun dries things. | ఎండ ఆరబెడుతుంది.'], 'Sunlight dries and freshens the house. | ఎండ ఇంటిని పొడిగా, తాజాగా చేస్తుంది.', 'Sunlight dries; it does not wet. | ఎండ ఆరబెడుతుంది; తడపదు.', '☀️'],
          ['Who should help clean the house? | ఇల్లు శుభ్రం చేయడంలో ఎవరు సాయం చేయాలి?', 'Everyone in the family | కుటుంబంలో అందరూ', ['Only mother | అమ్మ మాత్రమే', 'Only guests | అతిథులు మాత్రమే'], ['Everyone lives there. | అందరూ అక్కడే ఉంటారు.', 'Share the work. | పని పంచుకో.'], 'Everyone helps keep home clean. | ఇల్లు శుభ్రంగా ఉంచడంలో అందరూ సాయం.', 'Cleaning is not one person\'s job. | శుభ్రం చేయడం ఒక్కరి పని కాదు.', '🤝'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.clean.waste', title: T('Garbage: wet and dry waste | చెత్త: తడి చెత్త, పొడి చెత్త'),
      intro: [
        H('Two dustbins at home | ఇంట్లో రెండు చెత్తబుట్టలు'),
        P('Kavya\'s family keeps a green bin for wet waste (peels, leftover food) and a blue bin for dry waste (paper, plastic, bottles). The municipal van collects them every morning. | కావ్య కుటుంబం తడి చెత్తకు (తొక్కలు, మిగిలిన అన్నం) పచ్చ బుట్ట, పొడి చెత్తకు (కాగితం, ప్లాస్టిక్, సీసాలు) నీలం బుట్ట వాడుతుంది. ప్రతి ఉదయం మున్సిపల్ వ్యాన్ తీసుకెళ్తుంది.'),
        PIC('🟢', 'Green bin: wet waste that rots. | పచ్చ బుట్ట: కుళ్లే తడి చెత్త.'),
        PIC('🔵', 'Blue bin: dry waste like paper and plastic. | నీలం బుట్ట: కాగితం, ప్లాస్టిక్ లాంటి పొడి చెత్త.'),
        KEYS('Wet waste: vegetable peels, leftover food, tea leaves, flowers. | తడి చెత్త: కూరగాయల తొక్కలు, మిగిలిన ఆహారం, టీ పొడి, పువ్వులు.',
          'Dry waste: paper, plastic, glass, tins, old clothes. | పొడి చెత్త: కాగితం, ప్లాస్టిక్, గాజు, డబ్బాలు, పాత బట్టలు.',
          'Wet waste can become compost. Dry waste can be recycled. | తడి చెత్త కంపోస్టు అవుతుంది. పొడి చెత్తను తిరిగి వాడవచ్చు.',
          'Never throw garbage on the road or in drains. | రోడ్డుపై, కాలువల్లో చెత్త వేయకు.'),
        REM('Separate at home: wet in green, dry in blue. | ఇంట్లోనే వేరు చేయి: తడి పచ్చ బుట్టలో, పొడి నీలం బుట్టలో.'),
        TIP('Check your dustbin tonight. Is the wet and dry waste mixed? | ఈ రాత్రి మీ చెత్తబుట్ట చూడు. తడి, పొడి చెత్త కలిసి ఉన్నాయా?'),
      ],
      examples: [
        EX('A banana peel: wet or dry waste? | అరటి తొక్క: తడి చెత్తా, పొడి చెత్తా?', ['It is from food. | ఆహారం నుంచి వచ్చింది.', 'It rots in a few days. | కొన్ని రోజుల్లో కుళ్లుతుంది.'], 'Wet waste — green bin | తడి చెత్త — పచ్చ బుట్ట', '🍌'),
        EX('An empty plastic bottle: wet or dry waste? | ఖాళీ ప్లాస్టిక్ సీసా: తడి చెత్తా, పొడి చెత్తా?', ['It does not rot. | అది కుళ్లదు.', 'It can be recycled. | మళ్లీ వాడవచ్చు.'], 'Dry waste — blue bin | పొడి చెత్త — నీలం బుట్ట', '🍾'),
      ],
      practice: [
        tapT('wet', 'Tap ALL the WET waste (green bin). | తడి చెత్తనంతా నొక్కు (పచ్చ బుట్ట).',
          ['banana peel | అరటి తొక్క', 'leftover rice | మిగిలిన అన్నం', 'used tea leaves | వాడిన టీ పొడి', 'old flowers | వాడిన పువ్వులు', 'vegetable peels | కూరగాయల తొక్కలు', 'egg shells | గుడ్డు పెంకులు'],
          ['plastic bottle | ప్లాస్టిక్ సీసా', 'newspaper | వార్తాపత్రిక', 'broken glass | పగిలిన గాజు', 'tin can | డబ్బా', 'old pen | పాత పెన్ను'],
          ['Does it come from food or plants? | ఆహారం లేదా మొక్కల నుంచి వచ్చిందా?', 'Will it rot? | కుళ్లుతుందా?'],
          'Wet waste comes from food and plants and rots. | తడి చెత్త ఆహారం, మొక్కల నుంచి వచ్చి కుళ్లుతుంది.'),
        bank('bin', [
          ['Which bin is for dry waste? | పొడి చెత్తకు ఏ బుట్ట?', 'Blue bin | నీలం బుట్ట', ['Green bin | పచ్చ బుట్ట', 'The road | రోడ్డు'], ['Paper and plastic. | కాగితం, ప్లాస్టిక్.', 'Blue like the sky. | ఆకాశంలా నీలం.'], 'Dry waste goes in the blue bin. | పొడి చెత్త నీలం బుట్టలో.', 'Green is for wet waste; never the road. | పచ్చ తడి చెత్తకు; రోడ్డుపై ఎప్పుడూ వద్దు.', '🔵'],
          ['What can wet waste be turned into? | తడి చెత్తను దేనిగా మార్చవచ్చు?', 'Compost (manure) | కంపోస్టు (ఎరువు)', ['Plastic toys | ప్లాస్టిక్ బొమ్మలు', 'Glass bottles | గాజు సీసాలు'], ['Remember the compost pit. | కంపోస్టు గుంత గుర్తుచేసుకో.', 'It rots into soil. | కుళ్లి మట్టిగా మారుతుంది.'], 'Wet waste becomes compost. | తడి చెత్త కంపోస్టు అవుతుంది.', 'Peels cannot become plastic or glass. | తొక్కలు ప్లాస్టిక్, గాజు కావు.', '🌱'],
          ['Where should you throw a chocolate wrapper on the road? | రోడ్డుపై చాక్లెట్ కాగితం ఎక్కడ వేయాలి?', 'In a dustbin, or keep it in your pocket till you find one | చెత్తబుట్టలో, లేదా దొరికే వరకు జేబులో', ['On the road | రోడ్డుపై', 'In the drain | కాలువలో'], ['Roads belong to all. | రోడ్లు అందరివీ.', 'Find a bin. | బుట్ట వెతుకు.'], 'Always use a dustbin. | ఎప్పుడూ చెత్తబుట్ట వాడు.', 'Litter in drains blocks them and causes floods. | కాలువల్లో చెత్త అడ్డుపడి వరదలు.', '🗑️'],
          ['Why should we separate wet and dry waste? | తడి, పొడి చెత్త ఎందుకు వేరు చేయాలి?', 'So wet waste becomes compost and dry waste is recycled | తడి చెత్త కంపోస్టు, పొడి చెత్త రీసైకిల్ అవ్వడానికి', ['So the bins look pretty | బుట్టలు అందంగా కనిపించడానికి', 'So garbage smells more | చెత్త ఎక్కువ వాసన రావడానికి'], ['Each kind is used differently. | ఒక్కో రకం ఒక్కోలా వాడతారు.', 'Mixing spoils both. | కలిపితే రెండూ పాడు.'], 'Separating helps compost and recycling. | వేరు చేస్తే కంపోస్టు, రీసైక్లింగ్ సులభం.', 'Separating is useful, not just for looks. | వేరు చేయడం ఉపయోగం కోసం, అందం కోసం కాదు.', '♻️'],
          ['Old newspaper is… | పాత వార్తాపత్రిక…', 'dry waste | పొడి చెత్త', ['wet waste | తడి చెత్త', 'food | ఆహారం'], ['Is it from the kitchen? | వంటగది నుంచా?', 'It can be sold to the raddi man. | పాత పేపర్ల వాడికి అమ్మవచ్చు.'], 'Newspaper is dry waste. | వార్తాపత్రిక పొడి చెత్త.', 'Paper is not wet waste or food. | కాగితం తడి చెత్త, ఆహారం కాదు.', '📄'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.clean.hygiene', title: T('Hygiene at home: mosquitoes, water and toilets | ఇంట్లో పరిశుభ్రత: దోమలు, నీళ్లు, మరుగుదొడ్లు'),
      intro: [
        H('Stop the germs at home | ఇంట్లో క్రిములను ఆపుదాం'),
        P('After the rains, water collected in old tyres and pots near Imran\'s house. Mosquitoes laid eggs there and many people got fever. His family emptied the water and the mosquitoes went away. | వానల తర్వాత ఇమ్రాన్ ఇంటి దగ్గర పాత టైర్లు, కుండల్లో నీళ్లు నిలిచాయి. దోమలు గుడ్లు పెట్టి చాలా మందికి జ్వరం వచ్చింది. వాళ్ల కుటుంబం నీళ్లు పారబోయగానే దోమలు పోయాయి.'),
        PIC('🪣', 'Cover water drums and buckets with a lid. | నీళ్ల డ్రమ్ములు, బకెట్లపై మూత పెట్టు.'),
        PIC('🛞', 'Old tyres collect rain water where mosquitoes breed. | పాత టైర్లలో వాన నీళ్లు నిలిచి దోమలు పెరుగుతాయి.'),
        KEYS('Mosquitoes breed in still water — empty coolers, pots and tyres. | నిలిచిన నీటిలో దోమలు పెరుగుతాయి — కూలర్లు, కుండలు, టైర్లు ఖాళీ చేయి.',
          'Drink boiled or filtered water; keep it covered. | కాచిన లేదా వడపోసిన నీళ్లు తాగు; మూత పెట్టు.',
          'Always use a toilet; keep it clean and flush with water. | ఎప్పుడూ మరుగుదొడ్డి వాడు; శుభ్రంగా ఉంచి నీళ్లు పోయి.',
          'Use a mosquito net at night. | రాత్రి దోమతెర వాడు.'),
        REM('No still water = no mosquitoes. | నిలిచిన నీళ్లు లేకుంటే దోమలు లేవు.'),
        TIP('Once a week, keep a "dry day": look around your house for still water and empty it. | వారానికి ఒకసారి "డ్రై డే" పాటించు: ఇంటి చుట్టూ నిలిచిన నీళ్లు వెతికి పారబోయి.'),
      ],
      examples: [
        EX('Where do mosquitoes lay eggs? | దోమలు గుడ్లు ఎక్కడ పెడతాయి?', ['In water that does not move. | కదలని నీటిలో.'], 'In still water | నిలిచిన నీటిలో', '💧'),
        EX('How can we make drinking water safe at home? | ఇంట్లో తాగే నీటిని సురక్షితంగా ఎలా చేయాలి?', ['Boil it or filter it. | కాచు లేదా వడపోయి.', 'Keep it covered. | మూత పెట్టు.'], 'Boil or filter it and keep it covered | కాచి లేదా వడపోసి మూత పెట్టాలి', '🔥'),
      ],
      practice: [
        bank('hyg', [
          ['Mosquitoes grow in… | దోమలు దేనిలో పెరుగుతాయి…', 'still, standing water | నిలిచిన నీళ్లలో', ['dry sand | పొడి ఇసుకలో', 'hot fire | వేడి నిప్పులో'], ['Old tyres after rain. | వాన తర్వాత పాత టైర్లు.', 'Water that does not move. | కదలని నీళ్లు.'], 'Mosquitoes breed in still water. | దోమలు నిలిచిన నీళ్లలో పెరుగుతాయి.', 'Mosquito eggs need water, not sand or fire. | దోమ గుడ్లకు నీళ్లు కావాలి.', '💧'],
          ['How can we keep mosquitoes away at night? | రాత్రి దోమలను ఎలా దూరంగా ఉంచాలి?', 'Sleep under a mosquito net | దోమతెర కింద నిద్రపో', ['Keep water in open pots | తెరిచిన కుండల్లో నీళ్లు ఉంచు', 'Leave garbage open | చెత్త తెరిచి ఉంచు'], ['A net is like a little tent. | దోమతెర చిన్న గుడారంలా.', 'They cannot get in. | అవి లోపలికి రాలేవు.'], 'A mosquito net protects us. | దోమతెర మనల్ని కాపాడుతుంది.', 'Open water and garbage bring more mosquitoes. | తెరిచిన నీళ్లు, చెత్త ఎక్కువ దోమలను తెస్తాయి.', '🛏️'],
          ['Which water is safe to drink? | ఏ నీళ్లు తాగడానికి సురక్షితం?', 'Boiled or filtered water | కాచిన లేదా వడపోసిన నీళ్లు', ['Muddy pond water | బురద చెరువు నీళ్లు', 'Water from an old tyre | పాత టైరు నీళ్లు'], ['Germs die when water boils. | మరిగితే క్రిములు చస్తాయి.', 'Clean and covered. | శుభ్రంగా, మూతతో.'], 'Drink boiled or filtered water. | కాచిన లేదా వడపోసిన నీళ్లు తాగు.', 'Muddy or stagnant water makes us sick. | బురద, నిలిచిన నీళ్లు జబ్బు చేస్తాయి.', '🔥'],
          ['Why must we always use a toilet? | ఎప్పుడూ మరుగుదొడ్డి ఎందుకు వాడాలి?', 'So germs do not spread around | క్రిములు చుట్టూ వ్యాపించకుండా', ['To play games there | అక్కడ ఆడుకోవడానికి', 'Because it is far | దూరంగా ఉందని'], ['Open places spread germs. | బహిరంగ చోట్లు క్రిములను వ్యాపింపజేస్తాయి.', 'Flies carry dirt to food. | ఈగలు మురికిని ఆహారానికి తెస్తాయి.'], 'Toilets stop germs from spreading. | మరుగుదొడ్లు క్రిముల వ్యాప్తిని ఆపుతాయి.', 'Toilets are for health, not for games. | మరుగుదొడ్లు ఆరోగ్యం కోసం, ఆటలకు కాదు.', '🚽'],
          ['What should we do with water in a cooler we are not using? | వాడని కూలర్‌లో నీళ్లు ఏం చేయాలి?', 'Empty it and dry the cooler | ఖాళీ చేసి కూలర్ ఆరబెట్టాలి', ['Leave it for months | నెలల తరబడి వదిలేయాలి', 'Add more water | ఇంకా నీళ్లు పోయాలి'], ['Still water = mosquitoes. | నిలిచిన నీళ్లు = దోమలు.', 'Make it dry. | పొడిగా చేయి.'], 'Empty unused coolers. | వాడని కూలర్లను ఖాళీ చేయి.', 'Old water in coolers breeds mosquitoes. | కూలర్లలో పాత నీళ్లలో దోమలు పెరుగుతాయి.', '🌀'],
          ['Why do we keep drinking water covered? | తాగే నీళ్లపై మూత ఎందుకు?', 'So dust and insects do not fall in | దుమ్ము, పురుగులు పడకుండా', ['So it becomes hot | వేడెక్కడానికి', 'So it changes colour | రంగు మారడానికి'], ['Things fall into open pots. | తెరిచిన కుండల్లో పడతాయి.', 'A lid protects it. | మూత కాపాడుతుంది.'], 'A lid keeps water clean. | మూత నీటిని శుభ్రంగా ఉంచుతుంది.', 'Covering is to keep it clean, not hot. | మూత శుభ్రత కోసం, వేడి కోసం కాదు.', '🥛'],
        ]),
        tapT('breed', 'Tap ALL the places where mosquitoes can breed. | దోమలు పెరిగే చోట్లన్నీ నొక్కు.',
          ['water in old tyres | పాత టైర్లలో నీళ్లు', 'an unused cooler with water | నీళ్లున్న వాడని కూలర్', 'broken pots with rain water | వాన నీళ్లున్న పగిలిన కుండలు', 'a blocked drain | మూసుకుపోయిన కాలువ', 'an open water drum | మూతలేని నీళ్ల డ్రమ్ము'],
          ['a covered water pot | మూత ఉన్న నీళ్ల కుండ', 'a dry, clean floor | పొడి, శుభ్రమైన నేల', 'a sunny terrace with no water | నీళ్లు లేని ఎండ మేడ', 'a closed bottle | మూత పెట్టిన సీసా'],
          ['Is there still, open water? | నిలిచిన, తెరిచిన నీళ్లు ఉన్నాయా?', 'Covered or dry places are safe. | మూత ఉన్నవి, పొడివి సురక్షితం.'],
          'Mosquitoes need still, open water. | దోమలకు నిలిచిన, తెరిచిన నీళ్లు కావాలి.'),
      ],
    },
  ],
};

// ================================================================== CH 12 Gems of Clay
const ch12: USpec = {
  id: 'ts3.evs.ch12', subject: 'evs', title: T('Gems of Clay | మట్టి రత్నాలు'), source: src(12),
  objectives: [
    {
      id: 'ts3.evs.clay.things', title: T('Things made of clay | మట్టితో చేసిన వస్తువులు'),
      intro: [
        H('Clay all around us | మన చుట్టూ మట్టి వస్తువులు'),
        P('Look around: the water pot (kunda) that keeps water cool, diyas at Deepavali, the Ganesha idol, roof tiles, bricks and toys. All are made from clay! | చుట్టూ చూడు: నీళ్లు చల్లగా ఉంచే కుండ, దీపావళి ప్రమిదలు, వినాయకుడి విగ్రహం, పెంకులు, ఇటుకలు, బొమ్మలు. అన్నీ మట్టితోనే!'),
        PIC('🪔', 'Clay diyas light up our homes at Deepavali. | దీపావళికి మట్టి ప్రమిదలు ఇంటిని వెలిగిస్తాయి.'),
        PIC('🧱', 'Bricks are clay baked hard in a kiln. | ఇటుకలు బట్టీలో గట్టిగా కాల్చిన మట్టి.'),
        KEYS('Clay things: pots, diyas, tiles, bricks, cups, idols, toys, piggy banks. | మట్టి వస్తువులు: కుండలు, ప్రమిదలు, పెంకులు, ఇటుకలు, కప్పులు, విగ్రహాలు, బొమ్మలు, కిడ్డీ బ్యాంకులు.',
          'A clay pot (kunda) keeps water cool in summer. | మట్టి కుండ వేసవిలో నీళ్లను చల్లగా ఉంచుతుంది.',
          'Clay Ganesha idols dissolve in water and do not harm lakes. | మట్టి వినాయకులు నీటిలో కరిగి చెరువులకు హాని చేయవు.'),
        REM('Clay comes from the earth and goes back to the earth. | మట్టి నేల నుంచి వచ్చి నేలలోనే కలుస్తుంది.'),
        TIP('Count the clay things in your house. Which is the oldest? | మీ ఇంట్లో మట్టి వస్తువులు లెక్కించు. అందులో పాతది ఏది?'),
      ],
      examples: [
        EX('Why is water from a clay pot cool? | మట్టి కుండ నీళ్లు ఎందుకు చల్లగా ఉంటాయి?', ['The pot has tiny holes. | కుండకు చిన్న రంధ్రాలు ఉంటాయి.', 'A little water seeps out and dries, cooling the pot. | కొంచెం నీళ్లు బయటికి వచ్చి ఆరి, కుండను చల్లబరుస్తాయి.'], 'Tiny holes let water seep and cool it | చిన్న రంధ్రాల నుంచి నీళ్లు ఆవిరై చల్లబడుతుంది', '🏺'),
        EX('Which Ganesha idol is better for our lakes: clay or plaster of Paris? | మన చెరువులకు ఏ వినాయకుడు మంచిది: మట్టిదా, ప్లాస్టర్ ఆఫ్ పారిస్‌దా?', ['Clay dissolves in water. | మట్టి నీటిలో కరుగుతుంది.', 'Plaster and paints harm fish. | ప్లాస్టర్, రంగులు చేపలకు హాని.'], 'Clay idol | మట్టి వినాయకుడు', '🐟'),
      ],
      practice: [
        tapT('clay', 'Tap ALL the things made of CLAY. | మట్టితో చేసినవన్నీ నొక్కు.',
          ['water pot (kunda) | కుండ', 'diya | ప్రమిద', 'brick | ఇటుక', 'roof tile | పెంకు', 'clay Ganesha | మట్టి వినాయకుడు', 'piggy bank (gullak) | కిడ్డీ బ్యాంకు'],
          ['steel plate | స్టీలు పళ్లెం', 'plastic bucket | ప్లాస్టిక్ బకెట్', 'glass bottle | గాజు సీసా', 'wooden chair | చెక్క కుర్చీ', 'cotton shirt | నూలు చొక్కా'],
          ['Is it made by a potter? | కుమ్మరి చేసిందా?', 'Steel, plastic, glass and wood are not clay. | స్టీలు, ప్లాస్టిక్, గాజు, చెక్క మట్టి కాదు.'],
          'Clay things are made by potters from wet earth. | మట్టి వస్తువులు కుమ్మరులు తడి మట్టితో చేస్తారు.'),
        bank('use', [
          ['Which clay thing do we light at Deepavali? | దీపావళికి ఏ మట్టి వస్తువు వెలిగిస్తాం?', 'Diya (pramida) | ప్రమిద', ['Brick | ఇటుక', 'Tile | పెంకు'], ['It holds oil and a wick. | నూనె, వత్తి ఉంటాయి.', 'Small and glowing. | చిన్నగా, వెలుగుతూ.'], 'We light clay diyas. | మట్టి ప్రమిదలు వెలిగిస్తాం.', 'Bricks and tiles build houses. | ఇటుకలు, పెంకులు ఇళ్లకు.', '🪔'],
          ['Which pot keeps water cool without a fridge? | ఫ్రిజ్ లేకుండా నీళ్లు చల్లగా ఉంచే పాత్ర ఏది?', 'Clay pot (kunda) | మట్టి కుండ', ['Steel pot | స్టీలు బిందె', 'Plastic bottle | ప్లాస్టిక్ సీసా'], ['It has tiny pores. | చిన్న రంధ్రాలు ఉంటాయి.', 'Made by a potter. | కుమ్మరి చేశాడు.'], 'A clay pot cools water. | మట్టి కుండ నీళ్లు చల్లబరుస్తుంది.', 'Steel and plastic do not let water seep and cool. | స్టీలు, ప్లాస్టిక్‌లో నీళ్లు చల్లబడవు.', '🏺'],
          ['Why choose a clay Ganesha idol? | మట్టి వినాయకుడినే ఎందుకు ఎంచుకోవాలి?', 'It dissolves and does not harm lakes | కరిగిపోయి చెరువులకు హాని చేయదు', ['It never dissolves | ఎప్పుడూ కరగదు', 'It is made of plastic | ప్లాస్టిక్‌తో చేశారు'], ['What happens after immersion? | నిమజ్జనం తర్వాత ఏమవుతుంది?', 'Fish live in lakes. | చెరువుల్లో చేపలు ఉంటాయి.'], 'Clay idols are eco-friendly. | మట్టి విగ్రహాలు పర్యావరణానికి మంచివి.', 'Idols that never dissolve pollute lakes. | కరగని విగ్రహాలు చెరువులను కలుషితం చేస్తాయి.', '🐟'],
          ['Bricks are made by… | ఇటుకలు ఎలా చేస్తారు…', 'baking clay in a kiln | బట్టీలో మట్టిని కాల్చి', ['freezing water | నీళ్లు గడ్డకట్టించి', 'cutting trees | చెట్లు నరికి'], ['A kiln is a big oven. | బట్టీ పెద్ద పొయ్యి.', 'Fire makes clay hard. | నిప్పు మట్టిని గట్టిపరుస్తుంది.'], 'Bricks are clay baked in a kiln. | ఇటుకలు బట్టీలో కాల్చిన మట్టి.', 'Bricks are not ice or wood. | ఇటుకలు మంచు, చెక్క కావు.', '🧱'],
          ['Which of these is NOT made of clay? | వీటిలో మట్టితో చేయనిది ఏది?', 'Steel tumbler | స్టీలు గ్లాసు', ['Diya | ప్రమిద', 'Roof tile | పెంకు'], ['Which one is shiny metal? | ఏది మెరిసే లోహం?', 'Clay is brown and earthy. | మట్టి గోధుమ రంగు.'], 'A steel tumbler is metal. | స్టీలు గ్లాసు లోహం.', 'Diyas and tiles are clay. | ప్రమిదలు, పెంకులు మట్టివే.', '🥛'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.clay.pottery', title: T('How a potter makes a pot | కుమ్మరి కుండ ఎలా చేస్తాడు'),
      intro: [
        H('At the potter\'s wheel | కుమ్మరి సారె దగ్గర'),
        P('Mallaiah is a potter. He brings clay from the tank bed, removes stones, mixes it with water and kneads it with his feet. He puts a lump on his spinning wheel and shapes it with wet hands. Then he dries it and bakes it in fire. | మల్లయ్య కుమ్మరి. చెరువు అడుగు నుంచి మట్టి తెచ్చి, రాళ్లు తీసి, నీళ్లతో కలిపి కాళ్లతో తొక్కుతాడు. ముద్దను తిరిగే సారెపై పెట్టి తడి చేతులతో ఆకారం ఇస్తాడు. తర్వాత ఆరబెట్టి నిప్పులో కాలుస్తాడు.'),
        PIC('🌀', 'The saare spins round and round while the potter shapes the clay. | కుమ్మరి ఆకారం ఇస్తున్నప్పుడు సారె గుండ్రంగా తిరుగుతూ ఉంటుంది.'),
        PIC('🔥', 'Pots are baked in a fire pit called a kiln (avamu). | కుండలను ఆవంలో కాలుస్తారు.'),
        KEYS('Clay comes from tank beds and river banks. | చెరువు అడుగు, నది ఒడ్డుల నుంచి మట్టి వస్తుంది.',
          'The potter\'s spinning wheel is called saare. | కుమ్మరి తిరిగే చక్రాన్ని సారె అంటారు.',
          'Steps: collect, clean, knead, shape on wheel, dry, bake, paint. | దశలు: సేకరించు, శుభ్రం చేయి, తొక్కు, సారెపై ఆకారం, ఆరబెట్టు, కాల్చు, రంగు వేయి.',
          'Baking makes the pot hard so it does not melt in water. | కాల్చితే కుండ గట్టిపడి నీటిలో కరగదు.'),
        REM('Pottery is one of the oldest crafts in the world. | కుండల తయారీ ప్రపంచంలోని పురాతన కళల్లో ఒకటి.'),
        TIP('Make a small cup from wet mud or play-dough. Let it dry in the sun. | తడి మట్టితో చిన్న కప్పు చేసి ఎండలో ఆరబెట్టు.'),
      ],
      examples: [
        EX('What is the potter\'s spinning wheel called in Telugu? | కుమ్మరి తిరిగే చక్రాన్ని తెలుగులో ఏమంటారు?', ['The clay lump turns round and round on it. | దానిపై మట్టి ముద్ద గుండ్రంగా తిరుగుతుంది.'], 'Saare | సారె', '🌀'),
        EX('Why does the potter bake the pot in fire? | కుమ్మరి కుండను నిప్పులో ఎందుకు కాలుస్తాడు?', ['Unbaked clay becomes soft in water. | కాల్చని మట్టి నీటిలో మెత్తబడుతుంది.', 'Fire makes it hard and strong. | నిప్పు గట్టిగా, బలంగా చేస్తుంది.'], 'To make it hard and strong | గట్టిగా, బలంగా చేయడానికి', '🔥'),
      ],
      practice: [
        orderT('steps', 'Put the potter\'s steps in order. | కుమ్మరి పనులను వరుసలో పెట్టు.', [
          'Bring clay from the tank | చెరువు నుంచి మట్టి తే', 'Mix with water and knead | నీళ్లతో కలిపి తొక్కు', 'Shape it on the spinning wheel | సారెపై ఆకారం ఇవ్వు', 'Dry it in the shade | నీడలో ఆరబెట్టు', 'Bake it in the fire | నిప్పులో కాల్చు',
        ], ['First you need clay. | ముందు మట్టి కావాలి.', 'Baking comes last. | కాల్చడం చివర.'], 'Collect, knead, shape, dry, bake. | తే, తొక్కు, ఆకారం, ఆరబెట్టు, కాల్చు.'),
        bank('pot', [
          ['Where does a potter get clay? | కుమ్మరికి మట్టి ఎక్కడ దొరుకుతుంది?', 'From tank beds and river banks | చెరువు అడుగు, నది ఒడ్డుల నుంచి', ['From the sky | ఆకాశం నుంచి', 'From a shop of toys | బొమ్మల దుకాణం నుంచి'], ['Wet, sticky earth. | తడి, జిగట మట్టి.', 'Near water. | నీటి దగ్గర.'], 'Clay is dug from tank beds. | మట్టిని చెరువు అడుగు నుంచి తవ్వుతారు.', 'Clay is in the ground, not the sky. | మట్టి నేలలో ఉంటుంది.', '🏞️'],
          ['Why does the potter knead the clay? | కుమ్మరి మట్టిని ఎందుకు తొక్కుతాడు?', 'To make it smooth and soft | నునుపుగా, మెత్తగా చేయడానికి', ['To make it dry and hard | పొడిగా, గట్టిగా చేయడానికి', 'To colour it | రంగు వేయడానికి'], ['Like making chapati dough. | చపాతీ పిండి కలిపినట్టు.', 'No lumps! | ముద్దలు ఉండకూడదు!'], 'Kneading makes clay smooth. | తొక్కితే మట్టి నునుపవుతుంది.', 'Kneading makes it soft, not hard; colour comes later. | తొక్కితే మెత్తబడుతుంది; రంగు తర్వాత.', '👐'],
          ['What gives the pot its round shape? | కుండకు గుండ్రని ఆకారం ఏది ఇస్తుంది?', 'The spinning wheel and the potter\'s hands | తిరిగే సారె, కుమ్మరి చేతులు', ['A hammer | సుత్తి', 'A pair of scissors | కత్తెర'], ['It turns round and round. | గుండ్రంగా తిరుగుతుంది.', 'Wet hands press gently. | తడి చేతులు మెల్లగా నొక్కుతాయి.'], 'The wheel and hands shape it. | సారె, చేతులు ఆకారం ఇస్తాయి.', 'Hammers and scissors would break the clay. | సుత్తి, కత్తెర మట్టిని పాడుచేస్తాయి.', '🌀'],
          ['What happens to an unbaked clay pot in water? | కాల్చని మట్టి కుండ నీటిలో ఏమవుతుంది?', 'It becomes soft and breaks | మెత్తబడి పగిలిపోతుంది', ['It becomes gold | బంగారం అవుతుంది', 'Nothing at all | ఏమీ కాదు'], ['Raw clay is just dried mud. | కాల్చని మట్టి ఎండిన బురదే.', 'Mud + water = ? | బురద + నీళ్లు = ?'], 'Unbaked clay softens in water. | కాల్చని మట్టి నీటిలో మెత్తబడుతుంది.', 'That is why pots must be baked. | అందుకే కుండలను కాల్చాలి.', '💧'],
          ['The potter\'s fire pit for baking is called… | కాల్చడానికి కుమ్మరి నిప్పు గుంతను ఏమంటారు…', 'Kiln (avamu) | ఆవం', ['Well | బావి', 'Pond | కుంట'], ['It is full of fire. | నిప్పుతో నిండి ఉంటుంది.', 'Wells and ponds have water. | బావి, కుంటలో నీళ్లు.'], 'Pots are baked in a kiln. | కుండలను ఆవంలో కాలుస్తారు.', 'Wells and ponds hold water, not fire. | బావి, కుంటలో నీళ్లు, నిప్పు కాదు.', '🔥'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.clay.uses', title: T('Why clay is useful | మట్టి ఉపయోగాలు'),
      intro: [
        H('Clay helps in many ways | మట్టి ఎన్నో విధాలుగా సాయం చేస్తుంది'),
        P('Clay is soft when wet and hard when baked. That is why we can shape it into anything. Clay pots are cheap, cool and good for the earth. Plants grow well in clay flowerpots too. | మట్టి తడిగా ఉంటే మెత్తగా, కాల్చితే గట్టిగా ఉంటుంది. అందుకే ఏ ఆకారమైనా చేయవచ్చు. మట్టి కుండలు చౌక, చల్లగా ఉంటాయి, భూమికి మంచివి. మట్టి కుండీల్లో మొక్కలు బాగా పెరుగుతాయి.'),
        PIC('🌱', 'Plants grow happily in clay flowerpots. | మట్టి కుండీల్లో మొక్కలు సంతోషంగా పెరుగుతాయి.'),
        PIC('🏘️', 'Mud walls keep village homes cool in summer. | మట్టి గోడలు ఊరి ఇళ్లను వేసవిలో చల్లగా ఉంచుతాయి.'),
        KEYS('Wet clay is soft and can be shaped. | తడి మట్టి మెత్తగా, ఆకారం ఇవ్వవచ్చు.',
          'Baked clay is hard and holds water. | కాల్చిన మట్టి గట్టిగా, నీళ్లు నిలుపుతుంది.',
          'Clay things break down into soil — no plastic waste. | మట్టి వస్తువులు మట్టిలో కలుస్తాయి — ప్లాస్టిక్ చెత్త లేదు.',
          'Clay cups (kulhads) can replace plastic cups. | మట్టి కప్పులు ప్లాస్టిక్ కప్పులకు బదులు వాడవచ్చు.'),
        REM('Choose clay over plastic whenever you can. | వీలైనప్పుడల్లా ప్లాస్టిక్ బదులు మట్టి ఎంచుకో.'),
        TIP('Buy clay diyas and a clay Ganesha this festival — it supports potters too! | ఈ పండుగకు మట్టి ప్రమిదలు, మట్టి వినాయకుడిని కొను — కుమ్మరులకూ సాయం!'),
      ],
      examples: [
        EX('Why are clay cups better than plastic cups? | ప్లాస్టిక్ కప్పుల కంటే మట్టి కప్పులు ఎందుకు మంచివి?', ['A broken clay cup mixes back into soil. | పగిలిన మట్టి కప్పు మట్టిలో కలుస్తుంది.', 'Plastic stays for hundreds of years. | ప్లాస్టిక్ వందల ఏళ్లు ఉంటుంది.'], 'Clay goes back to the earth; plastic pollutes | మట్టి నేలలో కలుస్తుంది; ప్లాస్టిక్ కలుషితం చేస్తుంది', '♻️'),
        EX('Is wet clay soft or hard? | తడి మట్టి మెత్తగా ఉంటుందా, గట్టిగా ఉంటుందా?', ['Press it with your finger. | వేలితో నొక్కి చూడు.', 'It takes the shape. | ఆకారం తీసుకుంటుంది.'], 'Soft | మెత్తగా', '👐'),
      ],
      practice: [
        bank('why', [
          ['Wet clay is… | తడి మట్టి…', 'soft and easy to shape | మెత్తగా, ఆకారం ఇవ్వడం సులభం', ['hard like stone | రాయిలా గట్టిగా', 'made of glass | గాజుతో'], ['Press it with a finger. | వేలితో నొక్కు.', 'Like dough. | పిండి ముద్దలా.'], 'Wet clay is soft. | తడి మట్టి మెత్తగా.', 'Only baked clay is hard. | కాల్చిన మట్టి మాత్రమే గట్టి.', '👐'],
          ['Why is a clay pot good for the earth? | మట్టి కుండ భూమికి ఎందుకు మంచిది?', 'When broken, it mixes back into soil | పగిలితే మట్టిలో కలిసిపోతుంది', ['It lasts forever as waste | శాశ్వతంగా చెత్తగా ఉంటుంది', 'It makes smoke | పొగ చేస్తుంది'], ['Clay came from the earth. | మట్టి నేల నుంచి వచ్చింది.', 'It goes back. | తిరిగి వెళ్తుంది.'], 'Clay returns to the soil. | మట్టి తిరిగి నేలలో కలుస్తుంది.', 'Plastic, not clay, lasts forever as waste. | శాశ్వత చెత్త ప్లాస్టిక్, మట్టి కాదు.', '🌍'],
          ['What can replace plastic tea cups? | ప్లాస్టిక్ టీ కప్పులకు బదులు ఏమి వాడవచ్చు?', 'Clay cups | మట్టి కప్పులు', ['More plastic cups | ఇంకా ప్లాస్టిక్ కప్పులు', 'Paper bags | కాగితం సంచులు'], ['Made by potters. | కుమ్మరులు చేస్తారు.', 'Earthy smell! | మట్టి వాసన!'], 'Clay cups replace plastic cups. | మట్టి కప్పులు ప్లాస్టిక్ కప్పుల బదులు.', 'Paper bags cannot hold hot tea. | కాగితం సంచులు వేడి టీ పట్టవు.', '☕'],
          ['Why do mud walls keep a house cool? | మట్టి గోడలు ఇంటిని ఎందుకు చల్లగా ఉంచుతాయి?', 'Thick mud does not let heat in quickly | లావైన మట్టి వేడిని త్వరగా లోపలికి రానివ్వదు', ['Mud is a fan | మట్టి ఫ్యాన్', 'Mud makes ice | మట్టి మంచు చేస్తుంది'], ['Heat moves slowly through mud. | మట్టి గుండా వేడి నెమ్మదిగా వెళ్తుంది.', 'Feel a mud wall at noon. | మధ్యాహ్నం మట్టి గోడ తాకి చూడు.'], 'Thick mud blocks heat. | లావైన మట్టి వేడిని అడ్డుకుంటుంది.', 'Mud is not a fan or ice maker. | మట్టి ఫ్యాన్, మంచు యంత్రం కాదు.', '🏘️'],
          ['Buying clay diyas helps… | మట్టి ప్రమిదలు కొంటే సాయం ఎవరికి…', 'potters and the earth | కుమ్మరులకు, భూమికి', ['plastic factories | ప్లాస్టిక్ ఫ్యాక్టరీలకు', 'nobody | ఎవరికీ కాదు'], ['Who made them? | వాటిని ఎవరు చేశారు?', 'No plastic waste. | ప్లాస్టిక్ చెత్త లేదు.'], 'It supports potters and the earth. | కుమ్మరులకు, భూమికి సాయం.', 'Clay diyas do not help plastic factories. | మట్టి ప్రమిదలు ప్లాస్టిక్ ఫ్యాక్టరీలకు సాయం కాదు.', '🪔'],
        ]),
        matchT('thing', 'Match each clay thing to its use. | ప్రతి మట్టి వస్తువును దాని ఉపయోగంతో జత చేయి.', [
          ['Kunda (pot) | కుండ', 'keeps water cool | నీళ్లు చల్లగా', '🏺'], ['Diya | ప్రమిద', 'gives light | వెలుగు ఇస్తుంది', '🪔'],
          ['Brick | ఇటుక', 'builds walls | గోడలు కడుతుంది', '🧱'], ['Roof tile | పెంకు', 'covers the roof | కప్పు కప్పుతుంది', '🏘️'],
          ['Flowerpot | పూలకుండీ', 'grows plants | మొక్కలు పెంచుతుంది', '🌱'], ['Piggy bank | కిడ్డీ బ్యాంకు', 'saves coins | నాణేలు దాస్తుంది', '🪙'],
          ['Clay cup | మట్టి కప్పు', 'holds tea | టీ పోస్తారు', '☕'],
        ], ['What is each thing used for at home? | ఇంట్లో ప్రతిదీ దేనికి?', 'Start with the diya. | ప్రమిదతో మొదలుపెట్టు.'], 'Think of where you see each clay thing used. | ప్రతి మట్టి వస్తువు ఎక్కడ వాడతారో ఆలోచించు.'),
      ],
    },
  ],
};

// ================================================================== CH 13 Colourful Dresses
const ch13: USpec = {
  id: 'ts3.evs.ch13', subject: 'evs', title: T('Colourful Dresses | రంగురంగుల దుస్తులు'), source: src(13),
  objectives: [
    {
      id: 'ts3.evs.dress.season', title: T('Clothes for different seasons | కాలాలకు తగ్గ దుస్తులు'),
      intro: [
        H('What shall I wear today? | ఈ రోజు ఏం వేసుకోవాలి?'),
        P('In hot May, Teja wears a light cotton shirt. In cold December he wears a woollen sweater and a cap. In the rainy season he takes a raincoat and an umbrella. | వేడి మే నెలలో తేజ తేలికపాటి నూలు చొక్కా వేసుకుంటాడు. చలి డిసెంబర్‌లో ఉన్ని స్వెటర్, టోపీ. వానాకాలంలో రెయిన్‌కోట్, గొడుగు తీసుకెళ్తాడు.'),
        PIC('☀️', 'In summer, wear light cotton clothes. | వేసవిలో తేలికపాటి నూలు బట్టలు వేసుకో.'),
        PIC('☂️', 'In the rain, use an umbrella or raincoat. | వానలో గొడుగు లేదా రెయిన్‌కోట్ వాడు.'),
        PIC('🧦', 'Woollen socks keep feet warm in winter. | చలికాలంలో ఉన్ని మేజోళ్లు కాళ్లను వెచ్చగా ఉంచుతాయి.'),
        KEYS('Summer: cotton clothes, light colours — they keep us cool. | వేసవి: నూలు బట్టలు, లేత రంగులు — చల్లగా ఉంచుతాయి.',
          'Winter: wool sweaters, shawls, caps — they keep us warm. | చలికాలం: ఉన్ని స్వెటర్లు, శాలువాలు, టోపీలు — వెచ్చగా ఉంచుతాయి.',
          'Rainy season: raincoat, umbrella, gumboots — keep us dry. | వానాకాలం: రెయిన్‌కోట్, గొడుగు, గమ్‌బూట్లు — పొడిగా ఉంచుతాయి.',
          'Cotton comes from the cotton plant; wool from sheep; silk from silkworms. | నూలు పత్తి మొక్క నుంచి; ఉన్ని గొర్రెల నుంచి; పట్టు పట్టుపురుగుల నుంచి.'),
        REM('Clothes protect our body from heat, cold, rain and dust. | బట్టలు ఎండ, చలి, వాన, దుమ్ము నుంచి శరీరాన్ని కాపాడుతాయి.'),
        TIP('Look in your cupboard. Sort your clothes into summer, winter and rainy-day clothes. | నీ అల్మారా చూడు. బట్టలను వేసవి, చలి, వాన బట్టలుగా విడదీయి.'),
      ],
      examples: [
        EX('It is a hot day. What should Sita wear: a cotton frock or a wool sweater? | ఎండ రోజు. సీత ఏం వేసుకోవాలి: నూలు గౌను లేదా ఉన్ని స్వెటర్?', ['Cotton is light and lets air pass. | నూలు తేలికగా, గాలి ఆడేలా ఉంటుంది.', 'Wool keeps heat in. | ఉన్ని వేడిని లోపల ఉంచుతుంది.'], 'A cotton frock | నూలు గౌను', '☀️'),
        EX('Where does wool come from? | ఉన్ని ఎక్కడి నుంచి వస్తుంది?', ['An animal\'s thick hair is cut and spun. | ఒక జంతువు దట్టమైన వెంట్రుకలు కత్తిరించి వడుకుతారు.'], 'From sheep | గొర్రెల నుంచి', '🐑'),
      ],
      practice: [
        matchT('season', 'Match each season to the right clothes. | ప్రతి కాలాన్ని సరైన బట్టలతో జత చేయి.', [
          ['Hot summer | వేడి వేసవి', 'cotton shirt | నూలు చొక్కా', '☀️'], ['Cold winter | చలికాలం', 'wool sweater | ఉన్ని స్వెటర్', '🧦'],
          ['Rainy day | వాన రోజు', 'raincoat | రెయిన్‌కోట్', '☂️'], ['Snowy hills | మంచు కొండలు', 'thick jacket and gloves | దట్టమైన జాకెట్, చేతి తొడుగులు', '⛰️'],
          ['Hot afternoon walk | ఎండ మధ్యాహ్నం నడక', 'cap to shade the head | తలకు నీడగా టోపీ', '🧢'],
        ], ['Hot → keep cool. Cold → keep warm. Rain → keep dry. | వేడి → చల్లగా. చలి → వెచ్చగా. వాన → పొడిగా.', 'Start with the rain. | వానతో మొదలుపెట్టు.'], 'Think: does this weather need cool, warm or dry clothes? | ఆలోచించు: ఈ వాతావరణానికి చల్లని, వెచ్చని, పొడి బట్టల్లో ఏవి కావాలి?'),
        bank('cloth', [
          ['Which cloth keeps us cool in summer? | వేసవిలో చల్లగా ఉంచే బట్ట ఏది?', 'Cotton | నూలు', ['Wool | ఉన్ని', 'Plastic | ప్లాస్టిక్'], ['It lets air pass and soaks sweat. | గాలి ఆడుతుంది, చెమట పీల్చుకుంటుంది.', 'Made from the cotton plant. | పత్తి మొక్క నుంచి.'], 'Cotton keeps us cool. | నూలు చల్లగా ఉంచుతుంది.', 'Wool keeps us warm; plastic makes us sweat. | ఉన్ని వెచ్చగా; ప్లాస్టిక్‌లో చెమట.', '☀️'],
          ['Silk comes from… | పట్టు దేని నుంచి వస్తుంది…', 'silkworms | పట్టుపురుగులు', ['sheep | గొర్రెలు', 'cotton plants | పత్తి మొక్కలు'], ['A tiny insect spins it. | చిన్న పురుగు అల్లుతుంది.', 'It makes a cocoon. | గూడు (కోశం) కడుతుంది.'], 'Silkworms make silk. | పట్టుపురుగులు పట్టు చేస్తాయి.', 'Sheep give wool; cotton plants give cotton. | గొర్రెలు ఉన్ని; పత్తి మొక్కలు నూలు.', '🐛'],
          ['What keeps us dry in the rain? | వానలో పొడిగా ఉంచేది ఏది?', 'Raincoat | రెయిన్‌కోట్', ['Cotton vest | నూలు బనియన్', 'Woollen cap | ఉన్ని టోపీ'], ['Water slides off it. | నీళ్లు దానిపై జారిపోతాయి.', 'Waterproof. | నీరు చొరదు.'], 'A raincoat keeps us dry. | రెయిన్‌కోట్ పొడిగా ఉంచుతుంది.', 'Cotton and wool soak up water. | నూలు, ఉన్ని నీళ్లు పీల్చుకుంటాయి.', '☂️'],
          ['Which crop grows a lot in Telangana and gives us cloth? | తెలంగాణలో ఎక్కువగా పండి మనకు బట్ట ఇచ్చే పంట ఏది?', 'Cotton | పత్తి', ['Mango | మామిడి', 'Paddy | వరి'], ['White fluffy balls. | తెల్లని మెత్తని ఉండలు.', 'Spun into thread. | దారంగా వడుకుతారు.'], 'Cotton is grown in Telangana for cloth. | బట్ట కోసం తెలంగాణలో పత్తి పండిస్తారు.', 'Mango and paddy are food crops. | మామిడి, వరి ఆహార పంటలు.', '☁️'],
          ['Why do we wear clothes? | మనం బట్టలు ఎందుకు వేసుకుంటాం?', 'To protect our body from heat, cold, rain and dust | ఎండ, చలి, వాన, దుమ్ము నుంచి శరీర రక్షణకు', ['To make us sick | జబ్బు చేయడానికి', 'Only for photos | ఫోటోల కోసం మాత్రమే'], ['Think about a cold night. | చల్లని రాత్రి ఆలోచించు.', 'Protection. | రక్షణ.'], 'Clothes protect our body. | బట్టలు శరీరాన్ని కాపాడుతాయి.', 'Clothes keep us safe and comfortable every day. | బట్టలు రోజూ మనల్ని సురక్షితంగా ఉంచుతాయి.', '🧒'],
          ['In winter, which is best to wear at night? | చలికాలం రాత్రి ఏం వేసుకోవడం మంచిది?', 'A woollen sweater | ఉన్ని స్వెటర్', ['A thin cotton vest only | సన్నని నూలు బనియన్ మాత్రమే', 'A raincoat | రెయిన్‌కోట్'], ['Cold nights need warmth. | చల్లని రాత్రికి వెచ్చదనం.', 'From sheep\'s hair. | గొర్రె వెంట్రుకల నుంచి.'], 'A woollen sweater keeps us warm. | ఉన్ని స్వెటర్ వెచ్చగా ఉంచుతుంది.', 'A vest is too thin; a raincoat is for rain. | బనియన్ చాలా సన్నం; రెయిన్‌కోట్ వానకు.', '🐑'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.dress.occasion', title: T('Clothes for work and special days | పనికి, ప్రత్యేక రోజులకు దుస్తులు'),
      intro: [
        H('Dresses tell us a lot | దుస్తులు చాలా చెబుతాయి'),
        P('At school we wear a uniform. A doctor wears a white coat, a police officer wears khaki, and a nurse wears a white or blue dress. On Bathukamma, girls wear colourful langa-oni and women wear bright sarees. | బడిలో యూనిఫాం వేసుకుంటాం. డాక్టర్ తెల్ల కోటు, పోలీసు ఖాకీ, నర్సు తెలుపు లేదా నీలం దుస్తులు ధరిస్తారు. బతుకమ్మ రోజు అమ్మాయిలు రంగురంగుల లంగా-ఓణీ, మహిళలు మెరిసే చీరలు కట్టుకుంటారు.'),
        PIC('🧑‍⚕️', 'Doctors wear a white coat at the hospital. | ఆసుపత్రిలో డాక్టర్లు తెల్ల కోటు వేసుకుంటారు.'),
        PIC('🎒', 'School children wear the same uniform. | బడి పిల్లలు ఒకే యూనిఫాం వేసుకుంటారు.'),
        KEYS('Uniforms show the work a person does and make everyone look equal at school. | యూనిఫాం వ్యక్తి పనిని చూపిస్తుంది, బడిలో అందరినీ సమానంగా చూపిస్తుంది.',
          'Festival clothes: sarees, langa-oni, dhoti, kurta-pyjama, sherwani. | పండుగ దుస్తులు: చీరలు, లంగా-ఓణీ, పంచె, కుర్తా-పైజామా, షేర్వాణి.',
          'Safety clothes: helmet for bikers, gloves and boots for workers, life jacket on boats. | భద్రత దుస్తులు: బైక్‌పై హెల్మెట్, కూలీలకు చేతి తొడుగులు, బూట్లు, పడవలో లైఫ్ జాకెట్.'),
        REM('Respect everyone\'s dress — people dress in many ways. | అందరి దుస్తులను గౌరవించు — ప్రజలు ఎన్నో రకాలుగా ధరిస్తారు.'),
        TIP('Ask your grandparents what they wore at their wedding. | తాతయ్య నానమ్మలను పెళ్లిలో ఏం వేసుకున్నారో అడుగు.'),
      ],
      examples: [
        EX('Why do children wear a uniform at school? | బడిలో పిల్లలు యూనిఫాం ఎందుకు వేసుకుంటారు?', ['Everyone looks the same and equal. | అందరూ ఒకేలా, సమానంగా కనిపిస్తారు.', 'People know you are from that school. | నువ్వు ఆ బడి వాడివని తెలుస్తుంది.'], 'So all look equal and belong to the school | అందరూ సమానంగా, ఆ బడికి చెందినవాళ్లుగా కనిపించడానికి', '🏫'),
        EX('What must a person on a motorbike wear on the head? | బైక్ నడిపేవాళ్లు తలకు ఏం పెట్టుకోవాలి?', ['The head must be protected in a fall. | పడితే తల కాపాడుకోవాలి.'], 'A helmet | హెల్మెట్', '🪖'),
      ],
      practice: [
        matchT('wear', 'Match each person to what they wear at work. | ప్రతి వ్యక్తిని పనిలో వేసుకునే దుస్తులతో జత చేయి.', [
          ['Doctor | డాక్టర్', 'white coat | తెల్ల కోటు', '🧑‍⚕️'], ['Police officer | పోలీసు', 'khaki uniform | ఖాకీ యూనిఫాం', '👮'],
          ['Biker | బైక్ నడిపేవారు', 'helmet | హెల్మెట్', '🪖'], ['Student | విద్యార్థి', 'school uniform | బడి యూనిఫాం', '🎒'],
          ['Cook in a hotel | హోటల్ వంటవాడు', 'apron and cap | ఆప్రాన్, టోపీ', '🍳'], ['Boat rider | పడవ ప్రయాణికుడు', 'life jacket | లైఫ్ జాకెట్', '⛵'],
          ['Firefighter | అగ్నిమాపక సిబ్బంది', 'fire-proof suit | నిప్పు అంటని దుస్తులు', '🔥'],
        ], ['What keeps each person safe or shows their job? | ఏది ప్రతి ఒక్కరిని కాపాడుతుంది లేదా పని చూపిస్తుంది?', 'Start with the doctor. | డాక్టర్‌తో మొదలుపెట్టు.'], 'Think about each person\'s job and safety. | ప్రతి ఒక్కరి పని, భద్రత ఆలోచించు.'),
        bank('occ', [
          ['What do Telangana girls often wear for Bathukamma? | బతుకమ్మకు తెలంగాణ అమ్మాయిలు తరచుగా ఏం వేసుకుంటారు?', 'Langa-oni (half saree) | లంగా-ఓణీ', ['Raincoat | రెయిన్‌కోట్', 'Swimming costume | ఈత దుస్తులు'], ['Colourful and traditional. | రంగురంగుల సంప్రదాయ దుస్తులు.', 'A long skirt with a half saree. | పొడవాటి లంగా, ఓణీ.'], 'Girls wear langa-oni for Bathukamma. | బతుకమ్మకు అమ్మాయిలు లంగా-ఓణీ.', 'Raincoats and swimwear are not festival dresses. | రెయిన్‌కోట్, ఈత దుస్తులు పండుగ దుస్తులు కావు.', '🌼'],
          ['Why should a boat rider wear a life jacket? | పడవ ప్రయాణికులు లైఫ్ జాకెట్ ఎందుకు వేసుకోవాలి?', 'It keeps them floating if they fall in water | నీటిలో పడితే తేలేలా చేస్తుంది', ['It looks like a crown | కిరీటంలా కనిపిస్తుంది', 'It makes the boat faster | పడవను వేగంగా నడుపుతుంది'], ['Water is deep. | నీళ్లు లోతుగా ఉంటాయి.', 'It is full of air. | అందులో గాలి ఉంటుంది.'], 'A life jacket keeps you afloat. | లైఫ్ జాకెట్ నీటిపై తేలేలా చేస్తుంది.', 'It is for safety, not speed or looks. | అది భద్రత కోసం, వేగం లేదా అందం కోసం కాదు.', '⛵'],
          ['A man wears a white dhoti and kurta at a festival. This is… | పండుగకు ఒకాయన తెల్ల పంచె, కుర్తా వేసుకున్నాడు. ఇది…', 'traditional clothing | సంప్రదాయ దుస్తులు', ['a hospital uniform | ఆసుపత్రి యూనిఫాం', 'a raincoat | రెయిన్‌కోట్'], ['Worn at festivals and weddings. | పండుగలు, పెళ్లిళ్లలో.', 'Old Indian dress. | పాత భారతీయ దుస్తులు.'], 'Dhoti-kurta is traditional dress. | పంచె-కుర్తా సంప్రదాయ దుస్తులు.', 'It is not a uniform or rain gear. | అది యూనిఫాం లేదా వాన దుస్తులు కాదు.', '🙏'],
          ['Who wears khaki at work? | పనిలో ఖాకీ ఎవరు వేసుకుంటారు?', 'Police officer | పోలీసు', ['Doctor | డాక్టర్', 'Bride | పెళ్లికూతురు'], ['They keep law and order. | శాంతిభద్రతలు కాపాడతారు.', 'Brownish uniform. | గోధుమ రంగు యూనిఫాం.'], 'Police wear khaki. | పోలీసులు ఖాకీ వేసుకుంటారు.', 'Doctors wear white coats; brides wear sarees. | డాక్టర్లు తెల్ల కోటు; పెళ్లికూతుళ్లు చీరలు.', '👮'],
          ['Should we laugh at someone who dresses differently? | వేరేలా దుస్తులు వేసుకున్నవాళ్లను చూసి నవ్వాలా?', 'No, respect everyone\'s dress | కాదు, అందరి దుస్తులను గౌరవించాలి', ['Yes, it is funny | అవును, సరదాగా ఉంటుంది'], ['India has many kinds of dresses. | భారతదేశంలో ఎన్నో రకాల దుస్తులు.', 'Be kind. | దయగా ఉండు.'], 'Respect all ways of dressing. | అన్ని రకాల దుస్తులను గౌరవించు.', 'Laughing at clothes hurts feelings. | దుస్తులను చూసి నవ్వితే బాధపడతారు.', '🤝'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.dress.designs', title: T('Designs on clothes and Telangana weaves | బట్టలపై డిజైన్లు, తెలంగాణ నేతలు'),
      intro: [
        H('Beautiful patterns | అందమైన నమూనాలు'),
        P('Pochampally sarees have bright ikat patterns. Gadwal and Narayanpet sarees are famous too. Some clothes are printed with wooden blocks, some have embroidery (stitched designs) and some have mirror work. | పోచంపల్లి చీరలకు మెరిసే ఇక్కత్ నమూనాలు. గద్వాల్, నారాయణపేట చీరలు కూడా ప్రసిద్ధి. కొన్ని బట్టలపై చెక్క అచ్చులతో ముద్రిస్తారు, కొన్నింటిపై ఎంబ్రాయిడరీ (కుట్టు డిజైన్లు), కొన్నింటికి అద్దాల పని.'),
        PIC('🎨', 'Colours and patterns make clothes beautiful. | రంగులు, నమూనాలు బట్టలను అందంగా చేస్తాయి.'),
        PIC('🎀', 'Ribbons and lace decorate dresses. | రిబ్బన్లు, లేసులు దుస్తులను అలంకరిస్తాయి.'),
        KEYS('Weaving: threads are crossed on a loom to make cloth. | నేత: మగ్గంపై దారాలను అడ్డంగా నిలువుగా కలిపి బట్ట నేస్తారు.',
          'Pochampally ikat: threads are tied and dyed before weaving. | పోచంపల్లి ఇక్కత్: నేయడానికి ముందే దారాలను కట్టి రంగు వేస్తారు.',
          'Block printing: a carved wooden block dipped in colour is pressed on cloth. | అచ్చు ముద్రణ: చెక్కిన చెక్క అచ్చును రంగులో ముంచి బట్టపై నొక్కుతారు.',
          'Embroidery: designs stitched with coloured thread and needle. | ఎంబ్రాయిడరీ: రంగు దారం, సూదితో కుట్టే డిజైన్లు.'),
        REM('Handloom clothes support our weavers. | చేనేత బట్టలు మన నేత కార్మికులకు సాయం.'),
        TIP('Cut a potato in half, carve a simple shape and print it on paper with paint. | బంగాళాదుంపను సగానికి కోసి ఒక ఆకారం చెక్కి, రంగుతో కాగితంపై అచ్చు వేయి.'),
      ],
      examples: [
        EX('Which Telangana village is famous for ikat sarees? | ఇక్కత్ చీరలకు ప్రసిద్ధి చెందిన తెలంగాణ ఊరు ఏది?', ['It is in Yadadri Bhuvanagiri district. | యాదాద్రి భువనగిరి జిల్లాలో ఉంది.'], 'Pochampally | పోచంపల్లి', '🧶'),
        EX('How is a block print made? | అచ్చు ముద్రణ ఎలా చేస్తారు?', ['Carve a design on wood. | చెక్కపై డిజైన్ చెక్కు.', 'Dip it in colour and press it on cloth. | రంగులో ముంచి బట్టపై నొక్కు.'], 'By pressing a coloured wooden block on cloth | రంగు అచ్చును బట్టపై నొక్కి', '🪵'),
      ],
      practice: [
        bank('design', [
          ['Pochampally is famous for… | పోచంపల్లి దేనికి ప్రసిద్ధి…', 'ikat sarees | ఇక్కత్ చీరలు', ['clay pots | మట్టి కుండలు', 'mangoes | మామిడి పండ్లు'], ['A Telangana weaving village. | తెలంగాణ నేత గ్రామం.', 'Tie-and-dye threads. | కట్టి రంగు వేసిన దారాలు.'], 'Pochampally makes ikat sarees. | పోచంపల్లిలో ఇక్కత్ చీరలు నేస్తారు.', 'It is famous for weaving, not pots or mangoes. | అది నేతకు ప్రసిద్ధి.', '🧶'],
          ['Designs stitched with needle and coloured thread are called… | సూది, రంగు దారంతో కుట్టిన డిజైన్లను ఏమంటారు…', 'embroidery | ఎంబ్రాయిడరీ', ['block printing | అచ్చు ముద్రణ', 'painting walls | గోడలకు రంగు'], ['You need a needle. | సూది కావాలి.', 'Stitch by stitch. | కుట్టు కుట్టుగా.'], 'That is embroidery. | అది ఎంబ్రాయిడరీ.', 'Block printing uses wooden blocks, not needles. | అచ్చు ముద్రణకు చెక్క అచ్చులు, సూది కాదు.', '🪡'],
          ['On what do weavers make cloth? | నేత కార్మికులు దేనిపై బట్ట నేస్తారు?', 'A loom (maggam) | మగ్గం', ['A potter\'s wheel | సారె', 'A tawa | పెనం'], ['Threads go across and down. | దారాలు అడ్డంగా, నిలువుగా.', 'Handloom. | చేనేత.'], 'Weavers use a loom. | నేత కార్మికులు మగ్గం వాడతారు.', 'A wheel is for pots; a tawa for rotis. | సారె కుండలకు; పెనం రొట్టెలకు.', '🧵'],
          ['Which is a famous saree from Telangana? | తెలంగాణ నుంచి ప్రసిద్ధ చీర ఏది?', 'Gadwal saree | గద్వాల్ చీర', ['Raincoat saree | రెయిన్‌కోట్ చీర', 'Plastic saree | ప్లాస్టిక్ చీర'], ['Named after a town. | ఒక పట్టణం పేరు.', 'Cotton body, silk border. | నూలు చీర, పట్టు అంచు.'], 'Gadwal sarees are from Telangana. | గద్వాల్ చీరలు తెలంగాణవి.', 'There are no raincoat or plastic sarees! | రెయిన్‌కోట్, ప్లాస్టిక్ చీరలు ఉండవు!', '🧶'],
          ['How do we help handloom weavers? | చేనేత కార్మికులకు ఎలా సాయం చేయవచ్చు?', 'Buy and wear handloom clothes | చేనేత బట్టలు కొని వేసుకోవాలి', ['Never buy their clothes | వాళ్ల బట్టలు ఎప్పుడూ కొనకూడదు', 'Throw away old clothes daily | రోజూ పాత బట్టలు పారేయాలి'], ['Who earns when we buy? | మనం కొంటే ఎవరికి ఆదాయం?', 'Handloom day is 7 August. | చేనేత దినోత్సవం ఆగస్టు 7.'], 'Buying handloom supports weavers. | చేనేత కొంటే నేత కార్మికులకు సాయం.', 'Not buying hurts weavers\' work. | కొనకపోతే నేత కార్మికుల పని తగ్గుతుంది.', '🙏'],
        ]),
        tapT('hand', 'Tap ALL the ways to put a design on cloth. | బట్టపై డిజైన్ వేసే పద్ధతులన్నీ నొక్కు.',
          ['block printing | అచ్చు ముద్రణ', 'embroidery | ఎంబ్రాయిడరీ', 'tie and dye | కట్టి రంగు వేయడం', 'mirror work | అద్దాల పని', 'weaving patterns | నేత నమూనాలు'],
          ['baking in a kiln | ఆవంలో కాల్చడం', 'boiling in a cooker | కుక్కర్‌లో ఉడికించడం', 'freezing in a fridge | ఫ్రిజ్‌లో గడ్డకట్టించడం'],
          ['Which use thread, colour or a loom? | ఏవి దారం, రంగు, మగ్గం వాడతాయి?', 'Kilns and cookers are not for cloth. | ఆవం, కుక్కర్ బట్టలకు కాదు.'],
          'Cloth designs are printed, dyed, stitched or woven. | బట్టపై డిజైన్లను ముద్రిస్తారు, రంగు వేస్తారు, కుడతారు లేదా నేస్తారు.'),
      ],
    },
  ],
};

// ================================================================== CH 14 Where are These Placed?
const ch14: USpec = {
  id: 'ts3.evs.ch14', subject: 'evs', title: T('Where are These Placed? | ఇవి ఎక్కడ ఉన్నాయి?'), source: src(14),
  objectives: [
    {
      id: 'ts3.evs.map.position', title: T('Left, right, near and far | ఎడమ, కుడి, దగ్గర, దూరం'),
      intro: [
        H('Where is it? | అది ఎక్కడ ఉంది?'),
        P('In the classroom, the blackboard is in front of Priya. The window is on her left. The door is on her right. Her bag is behind her chair. | తరగతిలో నల్లబల్ల ప్రియ ముందు ఉంది. కిటికీ ఆమె ఎడమ వైపు. తలుపు కుడి వైపు. ఆమె సంచి కుర్చీ వెనుక ఉంది.'),
        PIC('🪑', 'Your chair: what is in front, behind, left and right of it? | నీ కుర్చీ: దాని ముందు, వెనుక, ఎడమ, కుడి ఏమున్నాయి?'),
        PIC('✋', 'Raise the hand you write with — for most people, that is the right hand. | రాసే చేయి పైకెత్తు — చాలామందికి అది కుడి చేయి.'),
        KEYS('Front and behind; left and right; above and below; near and far. | ముందు, వెనుక; ఎడమ, కుడి; పైన, కింద; దగ్గర, దూరం.',
          'Left and right change when you turn around! | వెనక్కి తిరిగితే ఎడమ, కుడి మారిపోతాయి!',
          'We use these words to tell someone where things are. | వస్తువులు ఎక్కడ ఉన్నాయో చెప్పడానికి ఈ పదాలు వాడతాం.'),
        REM('Near means close; far means a long way off. | దగ్గర అంటే సమీపం; దూరం అంటే చాలా అవతల.'),
        TIP('Play a game: hide a pencil and guide a friend with "left, right, front, behind". | ఆట ఆడు: పెన్సిల్ దాచి "ఎడమ, కుడి, ముందు, వెనుక" అంటూ స్నేహితుడికి దారి చెప్పు.'),
      ],
      examples: [
        EX('Arjun faces the blackboard. The door is on his right. If he turns to face the back wall, where is the door? | అర్జున్ నల్లబల్ల వైపు చూస్తున్నాడు. తలుపు కుడి వైపు ఉంది. వెనక్కి తిరిగితే తలుపు ఎటు?', ['Turning around swaps left and right. | వెనక్కి తిరిగితే ఎడమ, కుడి మారుతాయి.'], 'On his left | ఎడమ వైపు', '🚪'),
        EX('The fan is on the ceiling and the mat is on the floor. Which is above? | ఫ్యాన్ పైకప్పుకు, చాప నేల మీద. ఏది పైన ఉంది?', ['The ceiling is up high. | పైకప్పు ఎత్తులో ఉంటుంది.'], 'The fan | ఫ్యాన్', '🌀'),
      ],
      practice: [
        tp('lr', (r) => {
          const sets: [string, string, string][] = [
            ['🍎', 'apple | ఆపిల్', 'ball | బంతి'], ['🐱', 'cat | పిల్లి', 'dog | కుక్క'], ['🌳', 'tree | చెట్టు', 'house | ఇల్లు'],
            ['✏️', 'pencil | పెన్సిల్', 'book | పుస్తకం'], ['🚲', 'cycle | సైకిల్', 'bus | బస్సు'], ['🥭', 'mango | మామిడి', 'banana | అరటి'],
          ];
          const pics: Record<string, string> = { 'ball | బంతి': '⚽', 'dog | కుక్క': '🐕', 'house | ఇల్లు': '🏠', 'book | పుస్తకం': '📕', 'bus | బస్సు': '🚌', 'banana | అరటి': '🍌' };
          const [e, a, b] = r.pick(sets);
          const leftFirst = r.int(0, 1) === 0;
          const askLeft = r.int(0, 1) === 0;
          const A = T(a), Bv = T(b);
          const strip = leftFirst ? `${e}  ${pics[b]}` : `${pics[b]}  ${e}`;
          // the thing on the asked side
          const onLeft = leftFirst ? A : Bv, onRight = leftFirst ? Bv : A;
          const correct = askLeft ? onLeft : onRight, wrong = askLeft ? onRight : onLeft;
          return {
            type: 'mcq', visual: { kind: 'emoji', text: strip },
            prompt: askLeft ? L('Look at the picture. Which thing is on the LEFT?', 'బొమ్మ చూడు. ఎడమ వైపు ఏముంది?') : L('Look at the picture. Which thing is on the RIGHT?', 'బొమ్మ చూడు. కుడి వైపు ఏముంది?'),
            ...choose(r, correct, [wrong]),
            hints: [L('Left is the side where you start reading a line.', 'వరుస చదవడం మొదలుపెట్టే వైపు ఎడమ.'), L('Right is the side where the line ends.', 'వరుస ముగిసే వైపు కుడి.')],
            solution: [L(`Left: ${onLeft.en}; right: ${onRight.en}.`, `ఎడమ: ${onLeft.te}; కుడి: ${onRight.te}.`)],
            mistakes: [{ when: 'wrong', explain: L('You picked the other side. We read from left to right.', 'నువ్వు అవతలి వైపు ఎంచుకున్నావు. మనం ఎడమ నుంచి కుడికి చదువుతాం.') }],
          };
        }),
        bank('pos', [
          ['You face the blackboard. What is behind you? | నువ్వు నల్లబల్ల వైపు చూస్తున్నావు. నీ వెనుక ఏముంది?', 'The back wall of the class | తరగతి వెనుక గోడ', ['The blackboard | నల్లబల్ల', 'The teacher\'s table in front | ముందున్న టీచర్ బల్ల'], ['Behind = at your back. | వెనుక = నీ వీపు వైపు.', 'You cannot see it without turning. | తిరగకుండా చూడలేవు.'], 'The back wall is behind you. | వెనుక గోడ నీ వెనుక ఉంది.', 'The blackboard is in front of you. | నల్లబల్ల నీ ముందు ఉంది.', '🏫'],
          ['The sky is ___ us. | ఆకాశం మనకు ___ ఉంది.', 'above | పైన', ['below | కింద', 'behind | వెనుక'], ['Look up! | పైకి చూడు!', 'Birds fly there. | పక్షులు అక్కడ ఎగురుతాయి.'], 'The sky is above us. | ఆకాశం మనకు పైన.', 'The ground is below, not the sky. | కింద నేల ఉంది, ఆకాశం కాదు.', '☁️'],
          ['Your school is 10 minutes away; your grandmother\'s village is 3 hours away. Which is far? | బడి 10 నిమిషాల దూరం; అమ్మమ్మ ఊరు 3 గంటల దూరం. ఏది దూరం?', 'Grandmother\'s village | అమ్మమ్మ ఊరు', ['School | బడి', 'Both are near | రెండూ దగ్గర'], ['Longer time = longer way. | ఎక్కువ సమయం = ఎక్కువ దూరం.', '3 hours is long. | 3 గంటలు ఎక్కువ.'], 'The village is far. | ఊరు దూరం.', 'School takes only 10 minutes, so it is near. | బడికి 10 నిమిషాలే, అది దగ్గర.', '🚌'],
          ['If you turn around, your left hand becomes… | వెనక్కి తిరిగితే నీ ఎడమ చేయి…', 'still your left hand, but pointing the other way | ఇంకా ఎడమ చేయే, కానీ అవతలి దిక్కు చూపుతుంది', ['your right hand | కుడి చేయి అవుతుంది', 'your foot | కాలు అవుతుంది'], ['Your body does not change. | నీ శరీరం మారదు.', 'The room side changes. | గది వైపు మారుతుంది.'], 'Your left hand stays left; it now points to the other side of the room. | ఎడమ చేయి ఎడమే; ఇప్పుడు గది అవతలి వైపు చూపుతుంది.', 'Hands do not swap — the direction they point does. | చేతులు మారవు — చూపే దిక్కు మారుతుంది.', '✋'],
          ['The mat is ___ the fan. | చాప ఫ్యాన్‌కు ___ ఉంది.', 'below | కింద', ['above | పైన', 'inside | లోపల'], ['The mat is on the floor. | చాప నేల మీద.', 'The fan is on the ceiling. | ఫ్యాన్ పైకప్పుకు.'], 'The mat is below the fan. | చాప ఫ్యాన్ కింద.', 'The fan is above, so the mat is below. | ఫ్యాన్ పైన, చాప కింద.', '🌀'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.map.directions', title: T('Four directions | నాలుగు దిక్కులు'),
      intro: [
        H('East, west, north, south | తూర్పు, పడమర, ఉత్తరం, దక్షిణం'),
        P('Every morning the Sun rises in the east. It sets in the west in the evening. Stand with your right hand towards the rising Sun: you face north; south is behind you. | ప్రతి ఉదయం సూర్యుడు తూర్పున ఉదయిస్తాడు. సాయంత్రం పడమర అస్తమిస్తాడు. ఉదయించే సూర్యుడి వైపు కుడి చేయి చాపి నిలబడితే నువ్వు ఉత్తరం వైపు చూస్తున్నావు; వెనుక దక్షిణం.'),
        PIC('🌅', 'The Sun rises in the east. | సూర్యుడు తూర్పున ఉదయిస్తాడు.'),
        PIC('🧭', 'A compass needle always points north. | దిక్సూచి ముల్లు ఎప్పుడూ ఉత్తరం చూపుతుంది.'),
        KEYS('Sunrise → east. Sunset → west. | సూర్యోదయం → తూర్పు. సూర్యాస్తమయం → పడమర.',
          'Right hand to the east, then you face north; left hand points west; south is behind you. | కుడి చేయి తూర్పుకు, అప్పుడు ముందు ఉత్తరం; ఎడమ చేయి పడమర; వెనుక దక్షిణం.',
          'On a map, north is usually at the top. | పటంలో సాధారణంగా ఉత్తరం పైన ఉంటుంది.',
          'Short forms: N, S, E, W. | సంక్షిప్తాలు: ఉ, ద, తూ, ప.'),
        REM('Never Eat Soggy Wheat: N, E, S, W going clockwise. | గడియారం దిశలో: ఉత్తరం, తూర్పు, దక్షిణం, పడమర.'),
        TIP('Tomorrow morning, find where the Sun rises from your house. That is east! | రేపు ఉదయం మీ ఇంటి నుంచి సూర్యుడు ఎక్కడ ఉదయిస్తాడో చూడు. అదే తూర్పు!'),
      ],
      examples: [
        EX('In which direction does the Sun set? | సూర్యుడు ఏ దిక్కున అస్తమిస్తాడు?', ['It rises in the east. | తూర్పున ఉదయిస్తాడు.', 'It sets on the opposite side. | ఎదురు వైపు అస్తమిస్తాడు.'], 'West | పడమర', '🌅'),
        EX('Kiran faces the rising Sun. What is behind him? | కిరణ్ ఉదయించే సూర్యుడి వైపు చూస్తున్నాడు. అతని వెనుక ఏ దిక్కు?', ['He faces east. | అతను తూర్పు వైపు.', 'Opposite of east is west. | తూర్పుకు ఎదురు పడమర.'], 'West | పడమర', '🧭'),
      ],
      practice: [
        bank('dir', [
          ['Where does the Sun rise? | సూర్యుడు ఎక్కడ ఉదయిస్తాడు?', 'East | తూర్పు', ['West | పడమర', 'North | ఉత్తరం', 'South | దక్షిణం'], ['Think of the morning. | ఉదయం ఆలోచించు.', 'Opposite of sunset. | అస్తమయానికి ఎదురు.'], 'The Sun rises in the east. | సూర్యుడు తూర్పున ఉదయిస్తాడు.', 'The Sun sets in the west, it does not rise there. | పడమర అస్తమిస్తాడు, ఉదయించడు.', '🌅'],
          ['Which direction is opposite to north? | ఉత్తరానికి ఎదురు దిక్కు ఏది?', 'South | దక్షిణం', ['East | తూర్పు', 'West | పడమర'], ['North is at the top of a map. | పటంలో ఉత్తరం పైన.', 'What is at the bottom? | కింద ఏది?'], 'South is opposite north. | ఉత్తరానికి ఎదురు దక్షిణం.', 'East and west are opposite each other. | తూర్పు, పడమర ఒకదానికొకటి ఎదురు.', '🧭'],
          ['On most maps, what is at the top? | చాలా పటాల్లో పైన ఏ దిక్కు?', 'North | ఉత్తరం', ['South | దక్షిణం', 'West | పడమర'], ['An arrow with N points up. | N గుర్తు బాణం పైకి చూపుతుంది.', 'Top of the map. | పటం పైభాగం.'], 'North is at the top of a map. | పటంలో ఉత్తరం పైన.', 'South is at the bottom of a map. | దక్షిణం పటం కింద.', '🗺️'],
          ['Stand with your right hand towards sunrise. You face… | సూర్యోదయం వైపు కుడి చేయి చాపు. నువ్వు చూస్తున్నది…', 'North | ఉత్తరం', ['South | దక్షిణం', 'East | తూర్పు'], ['Right hand = east. | కుడి చేయి = తూర్పు.', 'Turn a quarter from east. | తూర్పు నుంచి పావు తిరుగు.'], 'You face north. | నువ్వు ఉత్తరం చూస్తున్నావు.', 'East is at your right hand, not in front. | తూర్పు నీ కుడి వైపు, ముందు కాదు.', '🧭'],
          ['Which tool always points north? | ఎప్పుడూ ఉత్తరం చూపే సాధనం ఏది?', 'Compass | దిక్సూచి', ['Clock | గడియారం', 'Ruler | స్కేలు'], ['It has a magnetic needle. | అయస్కాంత ముల్లు ఉంటుంది.', 'Sailors use it. | నావికులు వాడతారు.'], 'A compass points north. | దిక్సూచి ఉత్తరం చూపుతుంది.', 'A clock tells time; a ruler measures. | గడియారం సమయం; స్కేలు కొలత.', '🧭'],
          ['How many main directions are there? | ముఖ్యమైన దిక్కులు ఎన్ని?', 'Four | నాలుగు', ['Two | రెండు', 'Ten | పది'], ['N, E, S, W. | ఉ, తూ, ద, ప.', 'Count them. | లెక్కించు.'], 'There are four main directions. | నాలుగు ముఖ్య దిక్కులు.', 'North, south, east, west = 4. | ఉత్తరం, దక్షిణం, తూర్పు, పడమర = 4.', '🧭'],
        ]),
        matchT('opp', 'Match each direction to its opposite. | ప్రతి దిక్కును దాని ఎదురు దిక్కుతో జత చేయి.', [
          ['North | ఉత్తరం', 'South | దక్షిణం', '⬆️'], ['East | తూర్పు', 'West | పడమర', '➡️'], ['Sunrise | సూర్యోదయం', 'Sunset | సూర్యాస్తమయం', '🌅'],
          ['Top of a map | పటం పైభాగం', 'Bottom of a map | పటం కిందిభాగం', '🗺️'], ['Left | ఎడమ', 'Right | కుడి', '⬅️'], ['Front | ముందు', 'Behind | వెనుక', '🔼'],
        ], ['Opposites face each other. | ఎదురు దిక్కులు ఒకదానినొకటి చూస్తాయి.', 'Start with sunrise and sunset. | సూర్యోదయం, అస్తమయంతో మొదలుపెట్టు.'], 'Opposite directions point away from each other. | ఎదురు దిక్కులు ఒకదానికొకటి వ్యతిరేకం.'),
      ],
    },
    {
      id: 'ts3.evs.map.reading', title: T('Reading a simple map | సులభమైన పటం చదవడం'),
      intro: [
        H('A map is a picture from above | పటం అంటే పై నుంచి చూసిన బొమ్మ'),
        P('Imagine a bird flying over your village. It sees the roads, the school, the temple and the tank from above. A map shows places the same way — with small symbols. | మీ ఊరి మీదుగా ఎగిరే పక్షిని ఊహించు. అది రోడ్లు, బడి, గుడి, చెరువును పై నుంచి చూస్తుంది. పటం కూడా అలాగే చిన్న గుర్తులతో స్థలాలను చూపుతుంది.'),
        PIC('🗺️', 'A map shows places from above using symbols. | పటం గుర్తులతో స్థలాలను పై నుంచి చూపుతుంది.'),
        PIC('🏞️', 'Blue on a map usually means water — a lake or river. | పటంలో నీలం సాధారణంగా నీళ్లు — చెరువు లేదా నది.'),
        KEYS('Maps use symbols: blue for water, green for trees/fields, lines for roads. | పటాల్లో గుర్తులు: నీళ్లకు నీలం, చెట్లు/పొలాలకు పచ్చ, రోడ్లకు గీతలు.',
          'A key (legend) tells what each symbol means. | ప్రతి గుర్తు అర్థం సూచిక (కీ) చెబుతుంది.',
          'A map helps us find the way and see what is near what. | దారి కనుక్కోవడానికి, ఏది దేనికి దగ్గరో చూడటానికి పటం సాయం.'),
        REM('A map is smaller than the real place, but shows it correctly. | పటం అసలు ప్రదేశం కంటే చిన్నది, కానీ సరిగ్గా చూపుతుంది.'),
        TIP('Draw a map of your way from home to school. Mark three things you pass. | ఇంటి నుంచి బడికి వెళ్లే దారి పటం గీయి. దారిలో దాటే మూడు వస్తువులు గుర్తు పెట్టు.'),
      ],
      examples: [
        EX('On a map, a blue shape is drawn near the village. What is it most likely? | పటంలో ఊరి దగ్గర నీలం రంగు ఆకారం ఉంది. అది బహుశా ఏమిటి?', ['Blue shows water on maps. | పటాల్లో నీలం నీళ్లను చూపుతుంది.'], 'A lake or tank | చెరువు', '💧'),
        EX('What tells us what each symbol on a map means? | పటంలో ప్రతి గుర్తు అర్థం ఏది చెబుతుంది?', ['A small box in the corner lists symbols. | మూలలో చిన్న పెట్టెలో గుర్తుల జాబితా.'], 'The key (legend) | సూచిక (కీ)', '🔑'),
      ],
      practice: [
        tp('grid', (r) => {
          // a 3-row picture map; ask what is next to / north of a place
          const places: [string, string][] = [['🏫', 'school | బడి'], ['🛕', 'temple | గుడి'], ['🏠', 'house | ఇల్లు'], ['🌳', 'tree | చెట్టు'], ['🏪', 'shop | దుకాణం'], ['💧', 'tank | చెరువు']];
          const p6 = r.shuffle(places);
          const grid = [p6.slice(0, 3), p6.slice(3, 6)];
          const row = r.int(0, 1), col = r.int(0, 2);
          const kind = r.int(0, 2);
          const me = T(grid[row][col][1]);
          let correct: Localized; let promptQ: Localized; let rule: Localized;
          if (kind === 0) {
            const other = grid[1 - row][col]; correct = T(other[1]);
            promptQ = row === 1 ? L(`On this map north is at the top. What is just NORTH of the ${me.en}?`, `ఈ పటంలో ఉత్తరం పైన. "${me.te}" నుంచి ఉత్తరం వైపు పక్కనే ఏముంది?`) : L(`On this map north is at the top. What is just SOUTH of the ${me.en}?`, `ఈ పటంలో ఉత్తరం పైన. "${me.te}" నుంచి దక్షిణం వైపు పక్కనే ఏముంది?`);
            rule = L('North is up, south is down.', 'ఉత్తరం పైన, దక్షిణం కింద.');
          } else if (kind === 1) {
            const c = col === 2 ? 1 : col + 1; correct = T(grid[row][c][1]);
            promptQ = col === 2 ? L(`What is just WEST of the ${me.en}? (East is on the right.)`, `"${me.te}" నుంచి పడమర వైపు పక్కనే ఏముంది? (తూర్పు కుడి వైపు.)`) : L(`What is just EAST of the ${me.en}? (East is on the right.)`, `"${me.te}" నుంచి తూర్పు వైపు పక్కనే ఏముంది? (తూర్పు కుడి వైపు.)`);
            rule = L('On a map, east is on the right and west is on the left.', 'పటంలో తూర్పు కుడి వైపు, పడమర ఎడమ వైపు.');
          } else {
            correct = me;
            const rowName = row === 0 ? L('top', 'పై') : L('bottom', 'కింది');
            const colName = [L('left', 'ఎడమ'), L('middle', 'మధ్య'), L('right', 'కుడి')][col];
            promptQ = L(`Which place is in the ${rowName.en} row, ${colName.en} side?`, `${rowName.te} వరుసలో ${colName.te} వైపు ఉన్న స్థలం ఏది?`);
            rule = L('Find the row first, then go left to right.', 'ముందు వరుస కనుక్కో, తర్వాత ఎడమ నుంచి కుడికి.');
          }
          const wrong = p6.map((x) => T(x[1])).filter((x) => x.en !== correct.en);
          return {
            type: 'mcq', prompt: promptQ,
            visual: { kind: 'emoji', text: grid.map((g) => g.map((x) => x[0]).join(' ')).join('\n') },
            ...choose(r, correct, r.shuffle(wrong)),
            hints: [rule, L('Put your finger on the place named, then move one step.', 'చెప్పిన స్థలంపై వేలు పెట్టి, ఒక అడుగు జరుపు.')],
            solution: [L(`The answer is the ${correct.en}.`, `జవాబు: ${correct.te}.`)],
            mistakes: [{ when: 'wrong', explain: rule }],
          };
        }, 2),
        bank('sym', [
          ['On a map, blue usually shows… | పటంలో నీలం సాధారణంగా చూపేది…', 'water (lake, river) | నీళ్లు (చెరువు, నది)', ['roads | రోడ్లు', 'houses | ఇళ్లు'], ['What colour is water in pictures? | బొమ్మల్లో నీళ్ల రంగు?', 'Like the sea. | సముద్రంలా.'], 'Blue shows water. | నీలం నీళ్లను చూపుతుంది.', 'Roads are lines; houses are small boxes. | రోడ్లు గీతలు; ఇళ్లు చిన్న డబ్బాలు.', '💧'],
          ['A map is like a picture seen from… | పటం అంటే ఎక్కడి నుంచి చూసిన బొమ్మ…', 'above, like a flying bird | పై నుంచి, ఎగిరే పక్షిలా', ['under the ground | నేల కింద నుంచి', 'inside a box | డబ్బా లోపల నుంచి'], ['Think of a bird\'s eye. | పక్షి కన్ను ఆలోచించు.', 'Looking down. | కిందికి చూస్తూ.'], 'A map is a view from above. | పటం పై నుంచి చూసిన దృశ్యం.', 'You cannot see a village from under the ground. | నేల కింద నుంచి ఊరు కనిపించదు.', '🐦'],
          ['What tells us the meaning of symbols on a map? | పటంలో గుర్తుల అర్థం ఏది చెబుతుంది?', 'The key (legend) | సూచిక (కీ)', ['The title only | శీర్షిక మాత్రమే', 'The paper colour | కాగితం రంగు'], ['It is a small box of symbols. | గుర్తుల చిన్న పెట్టె.', 'Like a dictionary for maps. | పటాలకు నిఘంటువులా.'], 'The key explains symbols. | సూచిక గుర్తులను వివరిస్తుంది.', 'The title only names the map. | శీర్షిక పటం పేరు మాత్రమే.', '🔑'],
          ['Green areas on a village map usually show… | ఊరి పటంలో పచ్చ ప్రాంతాలు సాధారణంగా చూపేవి…', 'fields and trees | పొలాలు, చెట్లు', ['the sea | సముద్రం', 'factories | ఫ్యాక్టరీలు'], ['Plants are green. | మొక్కలు పచ్చ.', 'Crops grow there. | అక్కడ పంటలు.'], 'Green shows fields and trees. | పచ్చ పొలాలు, చెట్లను చూపుతుంది.', 'Water is blue, not green. | నీళ్లు నీలం, పచ్చ కాదు.', '🌾'],
          ['Why do we use a map? | పటం ఎందుకు వాడతాం?', 'To find the way to a place | ఒక చోటికి దారి కనుక్కోవడానికి', ['To cook rice | అన్నం వండటానికి', 'To fly a kite | గాలిపటం ఎగరేయడానికి'], ['Lost in a new town? | కొత్త ఊరిలో దారి తప్పావా?', 'It shows roads. | రోడ్లు చూపుతుంది.'], 'Maps help us find our way. | పటాలు దారి చూపుతాయి.', 'Maps are for finding places, not cooking or kites. | పటాలు స్థలాల కోసం.', '🗺️'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 15 Water - Our Needs
const ch15: USpec = {
  id: 'ts3.evs.ch15', subject: 'evs', title: T('Water - Our Needs | నీరు - మన అవసరాలు'), source: src(15),
  objectives: [
    {
      id: 'ts3.evs.water.sources', title: T('Where we get water | నీరు ఎక్కడి నుంచి వస్తుంది'),
      intro: [
        H('Sources of water | నీటి వనరులు'),
        P('Rain fills our tanks (cheruvulu), lakes and rivers like the Godavari and Krishna. Some water soaks into the ground; we take it out with wells and borewells. Hyderabad gets water through big pipes from far-away reservoirs. | వాన మన చెరువులు, సరస్సులు, గోదావరి, కృష్ణ లాంటి నదులను నింపుతుంది. కొంత నీరు నేలలోకి ఇంకుతుంది; బావులు, బోర్ల ద్వారా బయటికి తీస్తాం. హైదరాబాద్‌కు దూరంలోని జలాశయాల నుంచి పెద్ద పైపుల ద్వారా నీళ్లు వస్తాయి.'),
        PIC('🌧️', 'Rain is the main source of all our water. | మన నీటికంతటికీ వానే ముఖ్య వనరు.'),
        PIC('🏞️', 'Rivers and lakes store rain water. | నదులు, సరస్సులు వాన నీటిని నిల్వ చేస్తాయి.'),
        KEYS('Rain → streams → rivers and lakes. | వాన → వాగులు → నదులు, చెరువులు.',
          'Ground water → wells, borewells, hand pumps. | భూగర్భ జలం → బావులు, బోర్లు, చేతి పంపులు.',
          'Tanks and reservoirs store water; taps bring it home through pipes. | చెరువులు, జలాశయాలు నీళ్లు నిల్వ; నల్లాలు పైపుల ద్వారా ఇంటికి.',
          'Mission Kakatiya repaired thousands of Telangana tanks to store more rain water. | మిషన్ కాకతీయ వేలాది తెలంగాణ చెరువులను బాగుచేసి ఎక్కువ వాన నీరు నిల్వ చేసింది.'),
        REM('All water first comes from rain. | నీరంతా మొదట వాన నుంచే వస్తుంది.'),
        TIP('Find out where the water in your tap comes from. Ask an elder. | మీ నల్లాలో నీళ్లు ఎక్కడి నుంచి వస్తాయో పెద్దవాళ్లను అడుగు.'),
      ],
      examples: [
        EX('Where does well water come from? | బావి నీళ్లు ఎక్కడి నుంచి వస్తాయి?', ['Rain soaks into the soil. | వాన మట్టిలోకి ఇంకుతుంది.', 'It collects under the ground. | నేల కింద చేరుతుంది.'], 'From water under the ground | భూగర్భ జలం నుంచి', '🪣'),
        EX('Name a big river of Telangana. | తెలంగాణలో ఒక పెద్ద నది పేరు చెప్పు.', ['It flows past Bhadrachalam. | భద్రాచలం దగ్గర ప్రవహిస్తుంది.'], 'Godavari | గోదావరి', '🏞️'),
      ],
      practice: [
        tapT('src', 'Tap ALL the sources of water. | నీటి వనరులన్నీ నొక్కు.',
          ['rain | వాన', 'river | నది', 'well | బావి', 'lake (cheruvu) | చెరువు', 'borewell | బోరు బావి', 'stream (vaagu) | వాగు'],
          ['sand dune | ఇసుక దిబ్బ', 'brick wall | ఇటుక గోడ', 'rock | రాయి', 'school bag | బడి సంచి'],
          ['Where can you fill a pot? | ఎక్కడ కుండ నింపగలవు?', 'Walls and rocks give no water. | గోడలు, రాళ్లు నీళ్లు ఇవ్వవు.'],
          'Rain, rivers, lakes, streams and wells give water. | వాన, నదులు, చెరువులు, వాగులు, బావులు నీళ్లు ఇస్తాయి.'),
        bank('where', [
          ['What is the main source of all water? | నీటికంతటికీ ముఖ్య వనరు ఏది?', 'Rain | వాన', ['Taps | నల్లాలు', 'Bottles | సీసాలు'], ['It falls from clouds. | మేఘాల నుంచి పడుతుంది.', 'It fills rivers and wells. | నదులు, బావులు నింపుతుంది.'], 'Rain is the main source. | వానే ముఖ్య వనరు.', 'Taps and bottles only carry water that came from rain. | నల్లాలు, సీసాలు వాన నీటినే తెస్తాయి.', '🌧️'],
          ['Which river flows past Bhadrachalam? | భద్రాచలం దగ్గర ప్రవహించే నది ఏది?', 'Godavari | గోదావరి', ['Ganga | గంగ', 'Yamuna | యమున'], ['A big river of Telangana. | తెలంగాణ పెద్ద నది.', 'Starts with G. | "గో" తో మొదలవుతుంది.'], 'The Godavari flows past Bhadrachalam. | భద్రాచలం దగ్గర గోదావరి.', 'Ganga and Yamuna flow in north India. | గంగ, యమున ఉత్తర భారతంలో.', '🏞️'],
          ['How do we get ground water out? | భూగర్భ జలాన్ని ఎలా బయటికి తీస్తాం?', 'With wells, borewells and hand pumps | బావులు, బోర్లు, చేతి పంపులతో', ['With umbrellas | గొడుగులతో', 'With kites | గాలిపటాలతో'], ['Dig deep into the earth. | నేలలో లోతుగా తవ్వు.', 'Pump it up. | పంపు చేయి.'], 'Wells and pumps bring up ground water. | బావులు, పంపులు భూగర్భ జలం తెస్తాయి.', 'Umbrellas and kites do not get water. | గొడుగులు, గాలిపటాలు నీళ్లు తేవు.', '🪣'],
          ['What did Mission Kakatiya do? | మిషన్ కాకతీయ ఏం చేసింది?', 'Repaired village tanks to store rain water | వాన నీరు నిల్వకు ఊరి చెరువులను బాగుచేసింది', ['Built airports | విమానాశ్రయాలు కట్టింది', 'Planted only flowers | పువ్వులు మాత్రమే నాటింది'], ['Kakatiya kings built many tanks. | కాకతీయ రాజులు ఎన్నో చెరువులు కట్టారు.', 'Tanks hold water. | చెరువులు నీళ్లు నిలుపుతాయి.'], 'It restored tanks. | చెరువులను పునరుద్ధరించింది.', 'It was about tanks and water. | అది చెరువులు, నీళ్ల గురించి.', '💧'],
          ['A small stream that flows in the rainy season is called… | వానాకాలంలో పారే చిన్న నీటి ప్రవాహాన్ని ఏమంటారు…', 'vaagu (stream) | వాగు', ['ocean | మహాసముద్రం', 'desert | ఎడారి'], ['Smaller than a river. | నది కంటే చిన్నది.', 'It may dry in summer. | వేసవిలో ఎండిపోవచ్చు.'], 'A small stream is a vaagu. | చిన్న ప్రవాహం వాగు.', 'An ocean is huge; a desert is dry. | మహాసముద్రం చాలా పెద్దది; ఎడారి పొడి.', '🌧️'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.water.uses', title: T('Why we need water | మనకు నీరు ఎందుకు కావాలి'),
      intro: [
        H('Water every day | రోజూ నీరు'),
        P('From morning to night, Meena uses water to brush her teeth, bathe, drink, cook, wash clothes and clean the house. Farmers need water for crops, and factories need it too. | ఉదయం నుంచి రాత్రి వరకు మీనా పళ్లు తోముకోవడానికి, స్నానానికి, తాగడానికి, వంటకు, బట్టలు ఉతకడానికి, ఇల్లు కడగడానికి నీళ్లు వాడుతుంది. రైతులకు పంటలకు, ఫ్యాక్టరీలకు కూడా నీళ్లు కావాలి.'),
        PIC('💧', 'We cannot live without water. | నీరు లేకుండా మనం బతకలేం.'),
        PIC('🪣', 'Bathing with a bucket saves water. | బకెట్‌తో స్నానం చేస్తే నీళ్లు ఆదా.'),
        KEYS('Uses: drinking, cooking, bathing, washing, cleaning, farming. | ఉపయోగాలు: తాగడం, వంట, స్నానం, ఉతకడం, శుభ్రం, వ్యవసాయం.',
          'Drink 6–8 glasses of clean water a day. | రోజుకు 6–8 గ్లాసుల శుభ్రమైన నీళ్లు తాగు.',
          'Save water: close the tap while brushing, fix leaking taps, use a bucket, not a shower. | నీటిని ఆదా చేయి: తోముకునేటప్పుడు నల్లా కట్టేయి, కారే నల్లాలు బాగుచేయి, షవర్ బదులు బకెట్.',
          'Reuse: water used to wash vegetables can water plants. | మళ్లీ వాడు: కూరగాయలు కడిగిన నీళ్లు మొక్కలకు పోయవచ్చు.'),
        REM('Every drop counts — save water! | ప్రతి చుక్క విలువైనది — నీటిని ఆదా చేయి!'),
        TIP('Count how many buckets of water your family uses in one day. | మీ కుటుంబం ఒక రోజులో ఎన్ని బకెట్ల నీళ్లు వాడుతుందో లెక్కించు.'),
      ],
      examples: [
        EX('Ravi leaves the tap running while brushing. What should he do? | రవి పళ్లు తోముకునేటప్పుడు నల్లా తెరిచే ఉంచుతాడు. ఏం చేయాలి?', ['Water is wasted while it runs. | పారుతుంటే నీళ్లు వృథా.', 'Use a mug instead. | మగ్గు వాడు.'], 'Close the tap and use a mug | నల్లా కట్టేసి మగ్గు వాడాలి', '🚰'),
        EX('What can we do with water used to wash rice? | బియ్యం కడిగిన నీళ్లను ఏం చేయవచ్చు?', ['It is still clean enough for plants. | మొక్కలకు సరిపడా శుభ్రంగా ఉంటుంది.'], 'Pour it on plants | మొక్కలకు పోయవచ్చు', '🌱'),
      ],
      practice: [
        tapT('save', 'Tap ALL the ways to SAVE water. | నీటిని ఆదా చేసే పద్ధతులన్నీ నొక్కు.',
          ['closing the tap while brushing | తోముకునేటప్పుడు నల్లా కట్టేయడం', 'bathing with a bucket | బకెట్‌తో స్నానం', 'fixing a leaking tap | కారే నల్లా బాగుచేయడం', 'watering plants with vegetable-wash water | కూరగాయల నీళ్లతో మొక్కలకు పోయడం', 'collecting rain water | వాన నీళ్లు సేకరించడం'],
          ['leaving the tap running | నల్లా తెరిచి వదిలేయడం', 'washing the scooter with a running pipe | పైపుతో స్కూటర్ కడగడం', 'letting the tank overflow | ట్యాంకు పొంగిపొర్లనివ్వడం', 'playing with the hose for fun | సరదాకు పైపుతో ఆడటం'],
          ['Does it use less water? | తక్కువ నీళ్లు వాడుతుందా?', 'Running water wastes a lot. | పారే నీళ్లు చాలా వృథా.'],
          'Saving water means using only what you need. | నీటిని ఆదా చేయడం అంటే అవసరమైనంతే వాడటం.'),
        bank('use', [
          ['Which needs the most water in a village? | ఊరిలో ఎక్కువ నీళ్లు దేనికి కావాలి?', 'Growing crops (farming) | పంటలు పండించడం', ['Brushing teeth | పళ్లు తోమడం', 'Drinking one glass | ఒక గ్లాసు తాగడం'], ['Think of a paddy field full of water. | నీళ్లతో నిండిన వరి పొలం ఆలోచించు.', 'Fields are huge. | పొలాలు చాలా పెద్దవి.'], 'Farming needs the most water. | వ్యవసాయానికి ఎక్కువ నీళ్లు కావాలి.', 'Brushing and one glass need very little water. | తోముకోవడం, ఒక గ్లాసుకు చాలా తక్కువ.', '🌾'],
          ['A tap keeps dripping. What should you do? | నల్లా కారుతూనే ఉంది. ఏం చేయాలి?', 'Tell an elder to fix it | బాగుచేయమని పెద్దవాళ్లకు చెప్పాలి', ['Ignore it | పట్టించుకోకూడదు', 'Open it fully | పూర్తిగా తెరవాలి'], ['Drops add up to buckets! | చుక్కలు కలిసి బకెట్లు!', 'Fix leaks. | కారడం ఆపు.'], 'Get a leaking tap fixed. | కారే నల్లా బాగుచేయించు.', 'Ignoring it wastes many litres. | పట్టించుకోకపోతే చాలా లీటర్లు వృథా.', '💧'],
          ['How many glasses of water should a child drink a day? | పిల్లలు రోజుకు ఎన్ని గ్లాసుల నీళ్లు తాగాలి?', 'About 6 to 8 | సుమారు 6 నుంచి 8', ['None | ఒక్కటీ వద్దు', '50 | 50'], ['Our body needs water to work. | శరీరం పనిచేయడానికి నీళ్లు కావాలి.', 'More on hot days. | ఎండ రోజుల్లో ఎక్కువ.'], 'Drink about 6–8 glasses. | సుమారు 6–8 గ్లాసులు తాగు.', 'No water makes us ill; 50 is far too many. | నీళ్లు లేకుంటే జబ్బు; 50 చాలా ఎక్కువ.', '🥛'],
          ['Which uses LESS water for a bath? | స్నానానికి తక్కువ నీళ్లు వాడేది ఏది?', 'A bucket and mug | బకెట్, మగ్గు', ['A long shower | ఎక్కువసేపు షవర్', 'Filling a big tub | పెద్ద తొట్టి నింపడం'], ['A bucket has a fixed amount. | బకెట్‌లో నిర్ణీత నీళ్లు.', 'Showers keep running. | షవర్ పారుతూనే ఉంటుంది.'], 'A bucket bath saves water. | బకెట్ స్నానంతో నీళ్లు ఆదా.', 'Showers and tubs use much more water. | షవర్, తొట్టికి చాలా ఎక్కువ నీళ్లు.', '🪣'],
          ['Which of these does NOT need water? | వీటిలో నీళ్లు అక్కర్లేనిది ఏది?', 'Reading a book | పుస్తకం చదవడం', ['Cooking rice | అన్నం వండటం', 'Washing clothes | బట్టలు ఉతకడం'], ['Which one can you do on a dry desk? | పొడి బల్ల మీద ఏది చేయగలవు?', 'Cooking and washing need water. | వంట, ఉతకడానికి నీళ్లు కావాలి.'], 'Reading needs no water. | చదవడానికి నీళ్లు అక్కర్లేదు.', 'Rice and clothes both need water. | అన్నం, బట్టలు రెండింటికీ నీళ్లు.', '📖'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.water.life', title: T('Water for plants and animals | మొక్కలకు, జంతువులకు నీరు'),
      intro: [
        H('Every living thing needs water | ప్రతి జీవికి నీరు కావాలి'),
        P('When Kavya forgot to water her tulasi plant for a week, its leaves drooped. Buffaloes cool off in the tank on hot days. Fish, frogs and ducks live in water. | కావ్య వారం పాటు తులసికి నీళ్లు పోయడం మర్చిపోయింది, ఆకులు వాడిపోయాయి. ఎండ రోజుల్లో గేదెలు చెరువులో చల్లబడతాయి. చేపలు, కప్పలు, బాతులు నీటిలో ఉంటాయి.'),
        PIC('🐃', 'Buffaloes love to sit in water on hot days. | ఎండ రోజుల్లో గేదెలకు నీటిలో కూర్చోవడం ఇష్టం.'),
        PIC('🐸', 'Frogs live in and near water. | కప్పలు నీటిలో, దగ్గరలో ఉంటాయి.'),
        KEYS('Plants take in water through their roots. | మొక్కలు వేర్ల ద్వారా నీళ్లు తీసుకుంటాయి.',
          'Without water, plants wilt (droop) and dry up. | నీళ్లు లేకుంటే మొక్కలు వాడిపోయి ఎండిపోతాయి.',
          'Animals drink water and some live in it: fish, frog, duck, crocodile. | జంతువులు నీళ్లు తాగుతాయి, కొన్ని నీటిలోనే ఉంటాయి: చేప, కప్ప, బాతు, మొసలి.',
          'In summer, keep water bowls for birds, dogs and cattle. | వేసవిలో పక్షులు, కుక్కలు, పశువులకు నీళ్ల గిన్నెలు పెట్టు.'),
        REM('No water, no life. | నీరు లేనిదే జీవం లేదు.'),
        TIP('Put a white flower in coloured water. Watch the petals change colour in a day! | తెల్లని పువ్వును రంగు నీటిలో పెట్టు. ఒక రోజులో రేకుల రంగు మారడం చూడు!'),
      ],
      examples: [
        EX('A plant\'s leaves are drooping. What does it need? | మొక్క ఆకులు వాడిపోతున్నాయి. దానికి ఏం కావాలి?', ['Drooping means it is thirsty. | వాడిపోవడం అంటే దాహం.'], 'Water | నీళ్లు', '🌱'),
        EX('Which part of the plant drinks water from the soil? | మట్టి నుంచి నీళ్లు తాగే మొక్క భాగం ఏది?', ['It is hidden under the ground. | నేల కింద దాగి ఉంటుంది.'], 'The roots | వేర్లు', '🌱'),
      ],
      practice: [
        tapT('live', 'Tap ALL the animals that LIVE in water. | నీటిలో నివసించే జంతువులన్నీ నొక్కు.',
          ['fish | చేప', 'crocodile | మొసలి', 'octopus | ఆక్టోపస్', 'tortoise | తాబేలు', 'crab | పీత'],
          ['cow | ఆవు', 'sparrow | పిచ్చుక', 'cat | పిల్లి', 'monkey | కోతి', 'horse | గుర్రం'],
          ['Does it swim and spend most of its life in water? | అది ఈదుతూ ఎక్కువ కాలం నీటిలో ఉంటుందా?', 'Cows and cats only drink water. | ఆవులు, పిల్లులు నీళ్లు తాగుతాయి మాత్రమే.'],
          'Water animals live in water; land animals only drink it. | నీటి జంతువులు నీటిలో ఉంటాయి; భూ జంతువులు తాగుతాయి మాత్రమే.'),
        bank('need', [
          ['How do plants take in water? | మొక్కలు నీళ్లు ఎలా తీసుకుంటాయి?', 'Through their roots | వేర్ల ద్వారా', ['Through their flowers only | పువ్వుల ద్వారా మాత్రమే', 'They never need water | వాటికి నీళ్లు అక్కర్లేదు'], ['We pour water at the base. | మొదట్లో నీళ్లు పోస్తాం.', 'Roots are in the soil. | వేర్లు మట్టిలో.'], 'Roots soak up water. | వేర్లు నీళ్లు పీల్చుకుంటాయి.', 'Plants do need water — through roots. | మొక్కలకు నీళ్లు కావాలి — వేర్ల ద్వారా.', '🌱'],
          ['What happens to a plant without water? | నీళ్లు లేకపోతే మొక్కకు ఏమవుతుంది?', 'It wilts and dries up | వాడిపోయి ఎండిపోతుంది', ['It grows faster | వేగంగా పెరుగుతుంది', 'It gives more fruits | ఎక్కువ పండ్లు ఇస్తుంది'], ['Remember Kavya\'s tulasi. | కావ్య తులసి గుర్తుచేసుకో.', 'Leaves droop. | ఆకులు వాలిపోతాయి.'], 'Without water a plant wilts. | నీళ్లు లేకుంటే మొక్క వాడిపోతుంది.', 'No plant grows better without water. | నీళ్లు లేకుండా ఏ మొక్కా బాగా పెరగదు.', '🍃'],
          ['On a hot day, how can we help street dogs and birds? | ఎండ రోజు వీధి కుక్కలు, పక్షులకు ఎలా సాయం?', 'Keep bowls of water outside | బయట నీళ్ల గిన్నెలు పెట్టాలి', ['Chase them away | తరిమేయాలి', 'Give them cold drinks with sugar | చక్కెర శీతల పానీయాలు ఇవ్వాలి'], ['They get thirsty too. | వాటికీ దాహం.', 'Plain clean water. | శుభ్రమైన మామూలు నీళ్లు.'], 'Keep clean water bowls. | శుభ్రమైన నీళ్ల గిన్నెలు పెట్టు.', 'Sugary drinks are bad for animals. | చక్కెర పానీయాలు జంతువులకు హాని.', '🐕'],
          ['Why do buffaloes sit in tanks on hot days? | ఎండ రోజుల్లో గేదెలు చెరువుల్లో ఎందుకు కూర్చుంటాయి?', 'To keep their bodies cool | శరీరం చల్లగా ఉంచుకోవడానికి', ['To catch fish | చేపలు పట్టడానికి', 'To learn swimming for a race | పందెం కోసం ఈత నేర్చుకోవడానికి'], ['Their skin is dark and gets hot. | వాటి చర్మం నల్లగా, వేడెక్కుతుంది.', 'Water cools. | నీళ్లు చల్లబరుస్తాయి.'], 'Water keeps buffaloes cool. | నీళ్లు గేదెలను చల్లగా ఉంచుతాయి.', 'Buffaloes eat grass, not fish. | గేదెలు గడ్డి తింటాయి, చేపలు కాదు.', '🐃'],
          ['Which animal can live on land AND in water? | నేలపై, నీటిలో రెండు చోట్లా బతికే జంతువు ఏది?', 'Frog | కప్ప', ['Fish | చేప', 'Camel | ఒంటె'], ['It hops and swims. | గెంతుతుంది, ఈదుతుంది.', 'Croak, croak! | బెక బెక!'], 'Frogs live on land and in water. | కప్పలు నేలపై, నీటిలో ఉంటాయి.', 'Fish need water always; camels live in deserts. | చేపకు ఎప్పుడూ నీళ్లు; ఒంటె ఎడారిలో.', '🐸'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 16 Let's Go to Countryside
const ch16: USpec = {
  id: 'ts3.evs.ch16', subject: 'evs', title: T('Let\'s Go to Countryside | పల్లెకు వెళ్దాం'), source: src(16),
  objectives: [
    {
      id: 'ts3.evs.trip.safety', title: T('Travelling safely | సురక్షితంగా ప్రయాణం'),
      intro: [
        H('Ready for a trip! | ప్రయాణానికి సిద్ధం!'),
        P('Class 3 is going on a trip to a village farm. The teacher says: "Walk on the footpath, cross only at the zebra crossing, hold hands, and never put your head or hands out of the bus window." | మూడో తరగతి పిల్లలు ఊరి పొలానికి విహారయాత్ర వెళ్తున్నారు. టీచర్ చెప్పారు: "ఫుట్‌పాత్‌పై నడవండి, జీబ్రా క్రాసింగ్ దగ్గరే రోడ్డు దాటండి, చేతులు పట్టుకోండి, బస్సు కిటికీ నుంచి తల, చేతులు బయట పెట్టకండి."'),
        PIC('🚌', 'Sit properly in the bus; keep hands inside. | బస్సులో సరిగ్గా కూర్చో; చేతులు లోపలే.'),
        PIC('🔴', 'At a red traffic light, stop. At green, go. | ఎరుపు ట్రాఫిక్ లైట్ దగ్గర ఆగు. పచ్చ వస్తే వెళ్లు.'),
        KEYS('Traffic light: red – stop, yellow – get ready, green – go. | ట్రాఫిక్ లైట్: ఎరుపు – ఆగు, పసుపు – సిద్ధం, పచ్చ – వెళ్లు.',
          'Look right, look left, look right again before crossing. | దాటే ముందు కుడి, ఎడమ, మళ్లీ కుడి చూడు.',
          'Use the zebra crossing and footpath. | జీబ్రా క్రాసింగ్, ఫుట్‌పాత్ వాడు.',
          'Wear a seat belt in a car and a helmet on a bike. | కారులో సీట్ బెల్ట్, బైక్‌పై హెల్మెట్.'),
        REM('Stop, look, listen — then cross. | ఆగు, చూడు, విను — తర్వాత దాటు.'),
        TIP('With an elder, practise crossing a quiet road the safe way. | పెద్దవాళ్లతో కలిసి నిశ్శబ్ద రోడ్డును సురక్షితంగా దాటడం సాధన చేయి.'),
      ],
      examples: [
        EX('The traffic light turns red. What should vehicles do? | ట్రాఫిక్ లైట్ ఎరుపు అయింది. వాహనాలు ఏం చేయాలి?', ['Red is the danger colour. | ఎరుపు ప్రమాద రంగు.'], 'Stop | ఆగాలి', '🚦'),
        EX('Where should we cross the road? | రోడ్డు ఎక్కడ దాటాలి?', ['Look for black and white stripes on the road. | రోడ్డుపై నలుపు-తెలుపు చారలు చూడు.'], 'At the zebra crossing | జీబ్రా క్రాసింగ్ దగ్గర', '🦓'),
      ],
      practice: [
        matchT('light', 'Match each signal or sign to its meaning. | ప్రతి సిగ్నల్, గుర్తును దాని అర్థంతో జత చేయి.', [
          ['Red light | ఎరుపు లైట్', 'stop | ఆగు', '🔴'], ['Yellow light | పసుపు లైట్', 'get ready | సిద్ధంగా ఉండు', '🟡'], ['Green light | పచ్చ లైట్', 'go | వెళ్లు', '🟢'],
          ['Zebra crossing | జీబ్రా క్రాసింగ్', 'safe place to cross | దాటడానికి సురక్షిత చోటు', '🦓'], ['Footpath | ఫుట్‌పాత్', 'path for people walking | నడిచేవాళ్ల దారి', '🚶'],
          ['Helmet | హెల్మెట్', 'protects the head on a bike | బైక్‌పై తలను కాపాడుతుంది', '🪖'], ['Seat belt | సీట్ బెల్ట్', 'holds you safe in a car | కారులో సురక్షితంగా పట్టుకుంటుంది', '🚗'],
        ], ['Red stop, green go. | ఎరుపు ఆగు, పచ్చ వెళ్లు.', 'Think about road safety. | రోడ్డు భద్రత ఆలోచించు.'], 'Remember: red stop, yellow ready, green go. | గుర్తుంచుకో: ఎరుపు ఆగు, పసుపు సిద్ధం, పచ్చ వెళ్లు.'),
        bank('safe', [
          ['Before crossing a road we should look… | రోడ్డు దాటే ముందు చూడాల్సింది…', 'right, left and right again | కుడి, ఎడమ, మళ్లీ కుడి', ['only at our phone | ఫోన్ మాత్రమే', 'up at the sky | పైకి ఆకాశం'], ['Vehicles come from both sides. | వాహనాలు రెండు వైపుల నుంచి వస్తాయి.', 'Check twice. | రెండుసార్లు చూడు.'], 'Look right, left, right. | కుడి, ఎడమ, కుడి చూడు.', 'Phones and the sky do not show traffic. | ఫోన్, ఆకాశం ట్రాఫిక్ చూపవు.', '👁️'],
          ['In a moving bus, where should your hands be? | కదిలే బస్సులో చేతులు ఎక్కడ ఉండాలి?', 'Inside the window | కిటికీ లోపల', ['Outside the window | కిటికీ బయట', 'On the driver\'s steering | డ్రైవర్ స్టీరింగ్‌పై'], ['Vehicles pass very close. | వాహనాలు చాలా దగ్గరగా వెళ్తాయి.', 'Keep safe. | సురక్షితంగా ఉండు.'], 'Keep hands inside. | చేతులు లోపలే ఉంచు.', 'Hands outside can be hurt. | బయట చేతులకు దెబ్బ తగలవచ్చు.', '🚌'],
          ['What does the yellow light mean? | పసుపు లైట్ అర్థం ఏమిటి?', 'Get ready | సిద్ధంగా ఉండు', ['Go fast | వేగంగా వెళ్లు', 'Sleep | నిద్రపో'], ['Between red and green. | ఎరుపు, పచ్చ మధ్య.', 'Be careful. | జాగ్రత్త.'], 'Yellow means get ready. | పసుపు అంటే సిద్ధంగా ఉండు.', 'Green means go; yellow means be ready. | పచ్చ వెళ్లు; పసుపు సిద్ధం.', '🟡'],
          ['Where should people walk on a busy road? | రద్దీ రోడ్డుపై ప్రజలు ఎక్కడ నడవాలి?', 'On the footpath | ఫుట్‌పాత్‌పై', ['In the middle of the road | రోడ్డు మధ్యలో', 'Between buses | బస్సుల మధ్య'], ['It is raised at the side. | పక్కన ఎత్తుగా ఉంటుంది.', 'Away from vehicles. | వాహనాలకు దూరంగా.'], 'Walk on the footpath. | ఫుట్‌పాత్‌పై నడువు.', 'The middle of the road is for vehicles. | రోడ్డు మధ్య వాహనాలకు.', '🚶'],
          ['What must you wear in a car? | కారులో ఏం పెట్టుకోవాలి?', 'Seat belt | సీట్ బెల్ట్', ['Raincoat | రెయిన్‌కోట్', 'Swimming cap | ఈత టోపీ'], ['It goes across your body. | శరీరం మీదుగా ఉంటుంది.', 'Click! | క్లిక్!'], 'Always wear a seat belt. | ఎప్పుడూ సీట్ బెల్ట్ పెట్టుకో.', 'Raincoats and caps do not keep you safe in a crash. | రెయిన్‌కోట్, టోపీ ప్రమాదంలో కాపాడవు.', '🚗'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.trip.observe', title: T('What we see in the countryside | పల్లెలో ఏం చూస్తాం'),
      intro: [
        H('Eyes open in the countryside | పల్లెలో కళ్లు తెరిచి చూద్దాం'),
        P('On the farm the children see green paddy fields, cotton plants, a mango orchard, a well with a motor, cattle in a shed, haystacks and a bullock cart. They hear birds and smell fresh earth. | పొలంలో పిల్లలు పచ్చని వరి పొలాలు, పత్తి మొక్కలు, మామిడి తోట, మోటారు ఉన్న బావి, పాకలో పశువులు, గడ్డివాములు, ఎడ్ల బండి చూశారు. పక్షుల కూతలు విన్నారు, తడి మట్టి వాసన పీల్చారు.'),
        PIC('🌾', 'Paddy fields look like a green carpet. | వరి పొలాలు పచ్చని తివాచీలా ఉంటాయి.'),
        PIC('🚜', 'Tractors help farmers plough and carry crops. | ట్రాక్టర్లు దున్నడంలో, పంట మోయడంలో రైతులకు సాయం.'),
        PIC('🐓', 'Hens and roosters roam in village yards. | కోళ్లు, పుంజులు ఊరి పెరట్లో తిరుగుతాయి.'),
        KEYS('Crops: paddy, cotton, maize, jowar, chilli, turmeric. | పంటలు: వరి, పత్తి, మొక్కజొన్న, జొన్న, మిరప, పసుపు.',
          'Farm animals: cows, buffaloes, goats, sheep, hens. | పశువులు: ఆవులు, గేదెలు, మేకలు, గొర్రెలు, కోళ్లు.',
          'Countryside has more trees, fresh air and open space than cities. | నగరాల కంటే పల్లెలో ఎక్కువ చెట్లు, స్వచ్ఛమైన గాలి, ఖాళీ స్థలం.',
          'Use your senses: see, hear, smell, touch (gently!). | ఇంద్రియాలు వాడు: చూడు, విను, వాసన చూడు, (మెల్లగా!) తాకు.'),
        REM('Write or draw what you observe — that is how scientists learn! | గమనించినది రాయి లేదా గీయి — శాస్త్రవేత్తలు అలాగే నేర్చుకుంటారు!'),
        TIP('On your next trip, make a list of 5 plants and 5 animals you see. | తర్వాతి ప్రయాణంలో కనిపించే 5 మొక్కలు, 5 జంతువుల జాబితా రాయి.'),
      ],
      examples: [
        EX('Children see white fluffy balls on plants in a field. What crop is it? | పిల్లలు పొలంలో మొక్కలపై తెల్లని మెత్తని ఉండలు చూశారు. ఏ పంట?', ['The fluffy balls are spun into thread. | ఆ ఉండలను దారంగా వడుకుతారు.'], 'Cotton | పత్తి', '☁️'),
        EX('Which is more common in the countryside than in a city: haystacks or tall flats? | నగరంలో కంటే పల్లెలో ఎక్కువగా కనిపించేది: గడ్డివాములా, ఎత్తైన ఫ్లాట్లా?', ['Farmers store dry grass for cattle. | రైతులు పశువులకు ఎండు గడ్డి నిల్వ చేస్తారు.'], 'Haystacks | గడ్డివాములు', '🌾'),
      ],
      practice: [
        tapT('see', 'Tap ALL the things you are likely to see in the countryside. | పల్లెలో కనిపించే అవకాశం ఉన్నవన్నీ నొక్కు.',
          ['paddy fields | వరి పొలాలు', 'haystacks | గడ్డివాములు', 'bullock cart | ఎడ్ల బండి', 'cattle shed | పశువుల పాక', 'well with a motor | మోటారు బావి', 'mango orchard | మామిడి తోట'],
          ['metro train | మెట్రో రైలు', 'shopping mall | షాపింగ్ మాల్', 'flyover | ఫ్లైఓవర్', 'airport | విమానాశ్రయం'],
          ['Think of farms and villages. | పొలాలు, ఊళ్లు ఆలోచించు.', 'Malls and metros are in big cities. | మాల్స్, మెట్రో పెద్ద నగరాల్లో.'],
          'Countryside has fields, farm animals and wells; cities have malls and metros. | పల్లెలో పొలాలు, పశువులు, బావులు; నగరాల్లో మాల్స్, మెట్రో.'),
        bank('obs', [
          ['Which crop makes fields look like a green carpet with water? | నీళ్లతో పచ్చని తివాచీలా కనిపించే పంట ఏది?', 'Paddy | వరి', ['Cotton | పత్తి', 'Chilli | మిరప'], ['It grows in standing water. | నిలిచిన నీటిలో పెరుగుతుంది.', 'Gives rice. | బియ్యం ఇస్తుంది.'], 'Paddy fields are green and watery. | వరి పొలాలు పచ్చగా, నీళ్లతో.', 'Cotton and chilli do not grow in water. | పత్తి, మిరప నీటిలో పెరగవు.', '🌾'],
          ['Which sense do we use to hear birds? | పక్షుల కూతలు వినడానికి ఏ ఇంద్రియం?', 'Ears (hearing) | చెవులు (వినికిడి)', ['Nose (smell) | ముక్కు (వాసన)', 'Tongue (taste) | నాలుక (రుచి)'], ['Listen! | విను!', 'Chirp chirp. | కిచ కిచ.'], 'We hear with our ears. | చెవులతో వింటాం.', 'Nose smells and tongue tastes. | ముక్కు వాసన, నాలుక రుచి.', '👂'],
          ['Why is the air fresher in the countryside? | పల్లెలో గాలి ఎందుకు స్వచ్ఛంగా ఉంటుంది?', 'More trees and fewer vehicles | ఎక్కువ చెట్లు, తక్కువ వాహనాలు', ['More factories | ఎక్కువ ఫ్యాక్టరీలు', 'More traffic jams | ఎక్కువ ట్రాఫిక్'], ['Trees clean the air. | చెట్లు గాలిని శుభ్రం చేస్తాయి.', 'Less smoke. | తక్కువ పొగ.'], 'Trees and less traffic keep air fresh. | చెట్లు, తక్కువ ట్రాఫిక్ గాలిని స్వచ్ఛంగా ఉంచుతాయి.', 'Factories and traffic make air dirty. | ఫ్యాక్టరీలు, ట్రాఫిక్ గాలిని మురికి చేస్తాయి.', '🌳'],
          ['What is a haystack used for? | గడ్డివాము దేనికి?', 'Storing dry grass to feed cattle | పశువుల మేతకు ఎండు గడ్డి నిల్వ', ['Storing water | నీళ్లు నిల్వ', 'Playing cricket | క్రికెట్ ఆడటం'], ['Cows eat it in summer. | వేసవిలో ఆవులు తింటాయి.', 'It is golden and dry. | బంగారు రంగులో, పొడిగా.'], 'Haystacks store cattle feed. | గడ్డివాము పశువుల మేత నిల్వ.', 'Water is stored in tanks, not haystacks. | నీళ్లు ట్యాంకుల్లో, గడ్డివాముల్లో కాదు.', '🐄'],
          ['Which spice crop grows in Telangana with red pods? | ఎర్రని కాయలతో తెలంగాణలో పండే మసాలా పంట ఏది?', 'Chilli | మిరప', ['Apple | ఆపిల్', 'Grapes | ద్రాక్ష'], ['It is hot to eat! | తింటే కారం!', 'Dried in the sun in heaps. | కుప్పలుగా ఎండబెడతారు.'], 'Chilli has red pods. | మిరపకు ఎర్రని కాయలు.', 'Apples and grapes are fruits, not spices. | ఆపిల్, ద్రాక్ష పండ్లు, మసాలాలు కావు.', '🌶️'],
        ]),
      ],
    },
    {
      id: 'ts3.evs.trip.plan', title: T('Planning a trip and being a good visitor | ప్రయాణ ప్రణాళిక, మంచి అతిథిగా ఉండటం'),
      intro: [
        H('Pack smart, travel kind | తెలివిగా సర్దుకో, దయగా ప్రయాణించు'),
        P('Before the trip, Joseph packs a water bottle, a cap, a tiffin, a small towel and a notebook. At the farm, he does not pluck flowers, does not throw wrappers, and thanks the farmer before leaving. | ప్రయాణానికి ముందు జోసెఫ్ నీళ్ల సీసా, టోపీ, టిఫిన్, చిన్న తువ్వాలు, నోట్‌బుక్ సర్దుకున్నాడు. పొలంలో పువ్వులు కోయలేదు, కాగితాలు పారేయలేదు, వెళ్లేముందు రైతుకు ధన్యవాదాలు చెప్పాడు.'),
        PIC('🎒', 'Pack only what you need in your bag. | సంచిలో అవసరమైనవే సర్దుకో.'),
        PIC('🧴', 'Carry your own water bottle. | నీ నీళ్ల సీసా నువ్వే తీసుకెళ్లు.'),
        KEYS('Carry: water bottle, cap, food, towel, notebook and pencil. | తీసుకెళ్లు: నీళ్ల సీసా, టోపీ, ఆహారం, తువ్వాలు, నోట్‌బుక్, పెన్సిల్.',
          'Stay with your group and teacher. | నీ జట్టు, టీచర్‌తోనే ఉండు.',
          'Do not litter; bring your waste back. | చెత్త వేయకు; నీ చెత్త తిరిగి తెచ్చుకో.',
          'Do not disturb animals or pluck plants; thank your hosts. | జంతువులను ఇబ్బంది పెట్టకు, మొక్కలు పీకకు; ఆతిథ్యం ఇచ్చిన వాళ్లకు ధన్యవాదాలు చెప్పు.'),
        REM('Take only pictures, leave only footprints. | ఫోటోలే తీసుకో, అడుగుజాడలే వదులు.'),
        TIP('Make a checklist before any trip and tick each item as you pack. | ప్రయాణానికి ముందు జాబితా తయారు చేసి, సర్దుకుంటూ టిక్ పెట్టు.'),
      ],
      examples: [
        EX('Sana finished her chips at the farm. Where should the wrapper go? | సనా పొలంలో చిప్స్ తిన్నది. కవర్ ఎక్కడ వేయాలి?', ['There is no dustbin in the field. | పొలంలో చెత్తబుట్ట లేదు.', 'Keep it in the bag and throw it in a bin later. | సంచిలో పెట్టి తర్వాత బుట్టలో వేయి.'], 'Back in her bag, then a dustbin | తన సంచిలో, తర్వాత చెత్తబుట్టలో', '🎒'),
        EX('Why should we stay with the group on a trip? | ప్రయాణంలో జట్టుతో ఎందుకు ఉండాలి?', ['A new place is unknown to us. | కొత్త చోటు మనకు తెలియదు.', 'We may get lost. | దారి తప్పవచ్చు.'], 'So we do not get lost and stay safe | దారి తప్పకుండా, సురక్షితంగా ఉండటానికి', '🧑‍🏫'),
      ],
      practice: [
        tapT('pack', 'Tap ALL the things to pack for a day trip to a farm. | పొలానికి ఒక రోజు ప్రయాణానికి సర్దుకోవాల్సినవన్నీ నొక్కు.',
          ['water bottle | నీళ్ల సీసా', 'cap | టోపీ', 'tiffin box | టిఫిన్ డబ్బా', 'small towel | చిన్న తువ్వాలు', 'notebook and pencil | నోట్‌బుక్, పెన్సిల్'],
          ['television | టెలివిజన్', 'heavy pillow | బరువైన దిండు', 'glass flower vase | గాజు పూలకుండీ', 'the house key of a neighbour | పక్కింటి తాళం'],
          ['What will you need on a sunny day outdoors? | ఎండ రోజు బయట ఏం కావాలి?', 'Leave heavy and breakable things at home. | బరువైనవి, పగిలేవి ఇంట్లోనే.'],
          'Pack light, useful things: water, cap, food, towel, notebook. | తేలికైన, ఉపయోగపడేవి: నీళ్లు, టోపీ, ఆహారం, తువ్వాలు, నోట్‌బుక్.'),
        bank('good', [
          ['You see pretty flowers at the farm. What should you do? | పొలంలో అందమైన పువ్వులు కనిపించాయి. ఏం చేయాలి?', 'Look and enjoy, but do not pluck them | చూసి ఆనందించు, కోయకు', ['Pluck all of them | అన్నీ కోసేయి', 'Step on them | వాటిపై అడుగు పెట్టు'], ['They belong to the farmer and the bees. | అవి రైతువి, తేనెటీగలవి.', 'Leave them for others. | ఇతరుల కోసం వదులు.'], 'Enjoy flowers without plucking. | కోయకుండా పువ్వులను ఆనందించు.', 'Plucking or stepping on plants harms them. | కోయడం, తొక్కడం మొక్కలకు హాని.', '🌼'],
          ['Before leaving the farm, you should… | పొలం నుంచి వెళ్లేముందు…', 'thank the farmer | రైతుకు ధన్యవాదాలు చెప్పాలి', ['run away without a word | మాట లేకుండా పారిపోవాలి', 'take his tools home | ఆయన పనిముట్లు ఇంటికి తీసుకెళ్లాలి'], ['Good manners. | మంచి మర్యాద.', 'He showed you his farm. | ఆయన పొలం చూపించారు.'], 'Always thank your hosts. | ఆతిథ్యం ఇచ్చిన వాళ్లకు ఎప్పుడూ ధన్యవాదాలు చెప్పు.', 'Taking things that are not yours is wrong. | నీవి కానివి తీసుకోవడం తప్పు.', '🙏'],
          ['Why carry your own water bottle? | నీ నీళ్ల సీసా ఎందుకు తీసుకెళ్లాలి?', 'To drink clean, safe water | శుభ్రమైన, సురక్షితమైన నీళ్లు తాగడానికి', ['To throw it in a canal | కాలువలో పారేయడానికి', 'To use as a ball | బంతిలా ఆడటానికి'], ['Unknown water may be unsafe. | తెలియని నీళ్లు సురక్షితం కాకపోవచ్చు.', 'Stay healthy. | ఆరోగ్యంగా ఉండు.'], 'Your own bottle gives safe water. | నీ సీసా సురక్షితమైన నీళ్లు ఇస్తుంది.', 'Bottles are for drinking, not throwing. | సీసా తాగడానికి, పారేయడానికి కాదు.', '🧴'],
          ['A calf is sleeping in the shed. What should you do? | పాకలో దూడ నిద్రపోతోంది. ఏం చేయాలి?', 'Watch quietly without disturbing it | ఇబ్బంది పెట్టకుండా నిశ్శబ్దంగా చూడు', ['Shout to wake it | అరిచి లేపు', 'Throw stones | రాళ్లు విసురు'], ['Animals get scared. | జంతువులు భయపడతాయి.', 'Be gentle. | మెల్లగా.'], 'Watch animals quietly. | జంతువులను నిశ్శబ్దంగా చూడు.', 'Shouting and stones scare and hurt animals. | అరుపులు, రాళ్లు జంతువులను భయపెడతాయి, గాయపరుస్తాయి.', '🐄'],
          ['What should you wear on a sunny trip? | ఎండ ప్రయాణంలో ఏం వేసుకోవాలి?', 'A cap and cotton clothes | టోపీ, నూలు బట్టలు', ['A woollen sweater | ఉన్ని స్వెటర్', 'A raincoat | రెయిన్‌కోట్'], ['Keep cool and shaded. | చల్లగా, నీడగా ఉండు.', 'Remember the dresses chapter. | దుస్తుల పాఠం గుర్తుచేసుకో.'], 'Wear a cap and light cotton. | టోపీ, తేలికపాటి నూలు బట్టలు.', 'Wool is for cold; raincoats for rain. | ఉన్ని చలికి; రెయిన్‌కోట్ వానకు.', '☀️'],
        ]),
        orderT('plan', 'Put the trip in order. | ప్రయాణాన్ని వరుసలో పెట్టు.', [
          'Make a checklist | జాబితా తయారు చేయి', 'Pack your bag | సంచి సర్దుకో', 'Travel safely by bus | బస్సులో సురక్షితంగా ప్రయాణించు', 'Observe and take notes at the farm | పొలంలో గమనించి రాసుకో', 'Thank the farmer and return | రైతుకు ధన్యవాదాలు చెప్పి తిరిగి రా',
        ], ['Planning comes first. | ముందు ప్రణాళిక.', 'Saying thank you comes at the end. | ధన్యవాదాలు చివర.'], 'Plan, pack, travel, observe, then thank and return. | ప్రణాళిక, సర్దడం, ప్రయాణం, గమనించడం, తర్వాత ధన్యవాదాలు, తిరుగు ప్రయాణం.'),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16];
