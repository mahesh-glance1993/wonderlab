// Telangana SCERT Class 6 — Hindi (Second Language): the FIRST year of Hindi. 12 numbered lessons.
// Original WonderLab teaching aligned to the official contents (src/content/ts/syllabus.json, books.ts).
// Hindi is shown in Devanagari in the `en` field, with romanised reading and English glosses in brackets, because
// learners are beginners (their first language is mostly Telugu). No textbook text is reproduced: every summary and
// example sentence is WonderLab's own. Read-only picture pages (I-0, II-0, III-0, IV-0) are not given units.
//
// Language skills: the contents page does not list grammar. Each lesson's language objective is a beginner topic
// CHOSEN by WonderLab in a sensible first-year order (vowels → consonants → matras → numbers → … → simple sentences).
import {
  tp, ex, p, h, tip, def, keys, remember, choose, matching, ordering, tapAll,
  type USpec, type TSpec, type OSpec, type ExSpec,
} from '../../lib/kit';
import type { Block } from '../../../shared/content';
import { tsSrc } from '../books';

const src = (n: number | string) => tsSrc(6, 'hindi', n);
const ELIM = 'जो विकल्प साफ़ गलत हैं, उन्हें पहले हटाइए (remove the clearly wrong options first).';
const CHOSEN = 'Language topics are not itemised in the official contents; the language objective is a first-year Hindi topic chosen by WonderLab.';

// ---------- compact practice factories ----------
/** [प्रश्न, सही उत्तर, गलत विकल्प, संकेत, कारण] */
type MQ = [string, string, string[], string, string];
const mcq = (key: string, hint0: string, bank: MQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, a, w, h1, why] = r.pick(bank);
  return {
    type: 'mcq', prompt: q, ...choose(r, a, r.shuffle(w)), hints: [hint0, h1, ELIM],
    mistakes: [{ when: 'wrong', explain: `यह सही नहीं है (not correct). ${why}` }],
    solution: [`सही उत्तर (answer): ${a}`, why],
  };
}, d);

const tapT = (key: string, prompt: string, pool: [string, boolean][], hints: string[], why: string, n = 5, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pick = r.shuffle(pool).slice(0, n);
  const yes = pool.find((x) => x[1])!, no = pool.find((x) => !x[1])!;
  if (!pick.some((x) => x[1])) pick[0] = yes;
  if (!pick.some((x) => !x[1])) pick[n - 1] = no;
  return {
    type: 'tap', prompt, ...tapAll(r, pick.map(([label, ok]) => ({ label, ok }))), hints: [...hints, ELIM],
    mistakes: [{ when: 'wrong', explain: `हर विकल्प को अलग से जाँचिए (check each option). ${why}` }],
    solution: [`सही (correct): ${pick.filter((x) => x[1]).map((x) => x[0]).join(' / ')}`, why],
  };
}, d);

const orderT = (key: string, prompt: string, seqs: string[][], hints: string[], why: string, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const steps = r.pick(seqs);
  return {
    type: 'order', prompt, ...ordering(r, steps), hints: [...hints, 'पहला और आखिरी पहले पहचानिए (find the first and last first).'],
    mistakes: [{ when: 'wrong', explain: `क्रम अभी ठीक नहीं है (order not right yet). ${why}` }],
    solution: [steps.join(' → '), why],
  };
}, d);

// ---------- language notes ----------
const INFO: Record<string, string> = {
  'स्वर': 'जो अक्षर अपने-आप बोले जाते हैं (vowels — sound on their own). अ आ इ ई उ ऊ ऋ ए ऐ ओ औ।',
  'व्यंजन': 'जो अक्षर स्वर की मदद से बोले जाते हैं (consonants — need a vowel). क ख ग … ह।',
  'क-वर्ग': 'क ख ग घ ङ — गले से बोले जाते हैं (from the throat).',
  'च-वर्ग': 'च छ ज झ ञ — तालु से बोले जाते हैं (from the palate).',
  'ट-वर्ग': 'ट ठ ड ढ ण — जीभ ऊपर मोड़कर (tongue curled up).',
  'त-वर्ग': 'त थ द ध न — जीभ दाँतों को छूकर (tongue touches teeth).',
  'प-वर्ग': 'प फ ब भ म — होंठों से (with the lips).',
  'अंतःस्थ और ऊष्म': 'य र ल व (अंतःस्थ) और श ष स ह (ऊष्म) — वर्गों के बाहर के व्यंजन.',
  'ा (आ की मात्रा)': '"आ" की मात्रा ा — अक्षर के बाद लगती है। क + ा = का (kaa).',
  'ि (इ की मात्रा)': '"इ" की मात्रा ि — अक्षर से पहले लिखी जाती है, पर बाद में बोली जाती है। क + ि = कि (ki).',
  'ी (ई की मात्रा)': '"ई" की मात्रा ी — अक्षर के बाद लगती है। क + ी = की (kee).',
  'ु (उ की मात्रा)': '"उ" की मात्रा ु — अक्षर के नीचे लगती है। क + ु = कु (ku).',
  'ू (ऊ की मात्रा)': '"ऊ" की मात्रा ू — अक्षर के नीचे लगती है। क + ू = कू (koo).',
  'े (ए की मात्रा)': '"ए" की मात्रा े — अक्षर के ऊपर एक रेखा। क + े = के (ke).',
  'ै (ऐ की मात्रा)': '"ऐ" की मात्रा ै — अक्षर के ऊपर दो रेखाएँ। क + ै = कै (kai).',
  'ो (ओ की मात्रा)': '"ओ" की मात्रा ो — अक्षर के बाद, ऊपर एक रेखा। क + ो = को (ko).',
  'ौ (औ की मात्रा)': '"औ" की मात्रा ौ — अक्षर के बाद, ऊपर दो रेखाएँ। क + ौ = कौ (kau).',
  'ं (अनुस्वार)': 'अनुस्वार ं — अक्षर के ऊपर बिंदु; नाक से "न/म" जैसी ध्वनि। र + ं = रं (ran).',
  'एकवचन': 'एक चीज़ या एक प्राणी (singular — one). उदा: तोता, किताब।',
  'बहुवचन': 'एक से ज़्यादा (plural — many). उदा: तोते, किताबें।',
  'पुल्लिंग': 'नर / पुरुष जाति (masculine). पहचान: "अच्छा", "आता है"। उदा: लड़का, घोड़ा।',
  'स्त्रीलिंग': 'मादा / स्त्री जाति (feminine). पहचान: "अच्छी", "आती है"। उदा: लड़की, घोड़ी।',
  'उत्तम पुरुष': 'बोलने वाला खुद (first person — I, we): मैं, हम।',
  'मध्यम पुरुष': 'जिससे बात की जा रही है (second person — you): तू, तुम, आप।',
  'अन्य पुरुष': 'जिसके बारे में बात हो रही है (third person — he, she, it, they): वह, यह, वे, ये।',
  'हूँ': '"मैं" के साथ "हूँ" आता है। मैं खुश हूँ (I am happy).',
  'है': 'एक व्यक्ति/चीज़ (वह, यह, नाम) के साथ "है" आता है। वह खिलाड़ी है (he is a player).',
  'हैं': '"हम, आप, वे, ये" और बहुवचन के साथ "हैं" आता है। बच्चे खेलते हैं (children play).',
  'हो': '"तुम" के साथ "हो" आता है। तुम कहाँ हो? (where are you?)',
};
const info = (c: string) => INFO[c] ?? c;

// ---------- language objective builder: classify rows [item, category, detail?] ----------
type Row = [string, string, string?];
interface GSpec {
  id: string; title: string; intro: Block[]; examples: ExSpec[]; rows: Row[];
  ask: string; detAsk?: string; hints: [string, string]; noTap?: boolean; extra?: TSpec[];
}
function gram(g: GSpec): OSpec {
  const cats = [...new Set(g.rows.map((x) => x[1]))];
  const hasDet = g.rows.every((x) => x[2]);
  const practice: TSpec[] = [
    tp('cls', (r) => {
      const [item, cat, det] = r.pick(g.rows);
      return {
        type: 'mcq', prompt: `${item} — ${g.ask}`, ...choose(r, cat, r.shuffle(cats.filter((c) => c !== cat))),
        hints: [g.hints[0], g.hints[1], `नियम (rule): ${info(cat)}`],
        mistakes: [{ when: 'wrong', explain: `यह सही नहीं है। ${item} → ${cat}. ${info(cat)}` }],
        solution: [`${item} → ${cat}`, info(cat), ...(det ? [`(${det})`] : [])],
      };
    }),
  ];
  if (!g.noTap) {
    practice.push(tp('tap', (r) => {
      const c = r.pick(cats);
      const yes = r.shuffle(g.rows.filter((x) => x[1] === c)).slice(0, 3);
      const no = r.shuffle(g.rows.filter((x) => x[1] !== c)).slice(0, Math.max(2, 5 - yes.length));
      return {
        type: 'tap', prompt: `"${c}" वाले सभी चुनिए (tap all that are "${c}").`,
        ...tapAll(r, [...yes.map((x) => ({ label: x[0], ok: true })), ...no.map((x) => ({ label: x[0], ok: false }))]),
        hints: [g.hints[0], `नियम (rule): ${info(c)}`, ELIM],
        mistakes: [{ when: 'wrong', explain: `हर विकल्प को नियम से मिलाइए। ${info(c)}` }],
        solution: [`सही: ${yes.map((x) => x[0]).join(' / ')}`, ...no.map((x) => `${x[0]} → ${x[1]}`)],
      };
    }));
  }
  if (hasDet && g.detAsk) {
    practice.push(tp('det', (r) => {
      const [item, cat, det] = r.pick(g.rows);
      return {
        type: 'mcq', prompt: `${item} — ${g.detAsk}`, ...choose(r, det!, r.shuffle(g.rows.filter((x) => x[0] !== item && x[2] !== det).map((x) => x[2]!))),
        hints: [g.hints[1], `${item} → ${cat}`, ELIM],
        mistakes: [{ when: 'wrong', explain: `यह सही नहीं है। ${item} → ${det}` }],
        solution: [`${item} → ${det}`, info(cat)],
      };
    }));
  }
  if (cats.length >= 3) {
    practice.push(tp('match', (r) => {
      const cs = r.shuffle(cats).slice(0, 4);
      const pairs = cs.map((c) => [r.pick(g.rows.filter((x) => x[1] === c))[0], c] as [string, string]);
      const m = matching(r, pairs);
      return {
        type: 'match', prompt: `सही जोड़ी मिलाइए (match): ${pairs.map((x) => x[0]).join(' · ')}`, left: m.left, right: m.right, answer: m.answer,
        hints: [g.hints[0], g.hints[1], 'जो जोड़ी पक्की पता है, उसे पहले मिलाइए (start with the pair you know).'],
        mistakes: [{ when: 'wrong', explain: 'कम से कम एक जोड़ी गलत है (at least one pair is wrong).' }],
        solution: pairs.map(([a, b]) => `${a} → ${b}`),
      };
    }));
  }
  return { id: g.id, title: g.title, intro: g.intro, examples: g.examples, practice: [...practice, ...(g.extra ?? [])] };
}

// ---------- शब्द (vocabulary) builder ----------
/** [शब्द, roman, English meaning (Telugu where helpful)] */
type W = [string, string, string];
function vocab(topic: string, lesson: string, words: W[]): OSpec {
  const [w1, r1, g1] = words[0];
  const [w2, r2, g2] = words[1];
  return {
    id: `ts6.hi.${topic}.shabd`, title: `${lesson}: नए शब्द (new words)`,
    intro: [
      h(`नए शब्द: ${lesson} (new words)`),
      p('हर शब्द को ज़ोर से पढ़िए, उसका अर्थ समझिए और उससे एक छोटा वाक्य बोलिए (read aloud, learn the meaning, say a sentence).'),
      ...words.map(([w, rm, g]) => def(`${w} (${rm})`, g)),
      tip('शब्द को तेलुगु के समान शब्द से जोड़कर याद कीजिए (link each word to its Telugu word).'),
    ],
    examples: [
      ex(`"${w1}" का अर्थ क्या है? (What does "${w1}" mean?)`, [`पढ़िए: ${w1} = ${r1}`, `अर्थ (meaning): ${g1}`], `${w1} = ${g1}`),
      ex(`"${g2}" को हिंदी में क्या कहते हैं? (Say "${g2}" in Hindi.)`, [`अर्थ याद कीजिए: ${g2}`, `हिंदी शब्द: ${w2} (${r2})`], `${w2} (${r2})`),
    ],
    practice: [
      tp('arth', (r) => {
        const [w, , g] = r.pick(words);
        return {
          type: 'mcq', prompt: `"${w}" का अर्थ क्या है? (What does "${w}" mean?)`, ...choose(r, g, r.shuffle(words.filter((x) => x[2] !== g)).map((x) => x[2])),
          hints: ['शब्द को ज़ोर से पढ़िए (read it aloud).', `पाठ "${lesson}" में यह शब्द कहाँ आया था?`, ELIM],
          mistakes: [{ when: 'wrong', explain: `"${w}" = ${g}.` }],
          solution: [`${w} = ${g}`],
        };
      }),
      tp('hindi', (r) => {
        const [w, rm, g] = r.pick(words);
        return {
          type: 'mcq', prompt: `"${g}" के लिए सही हिंदी शब्द चुनिए (choose the Hindi word for "${g}").`, ...choose(r, w, r.shuffle(words.filter((x) => x[0] !== w)).map((x) => x[0])),
          hints: ['हर विकल्प को ध्यान से पढ़िए (read every option carefully).', `इसका उच्चारण "${rm}" जैसा है.`, ELIM],
          mistakes: [{ when: 'wrong', explain: `"${g}" = ${w} (${rm}).` }],
          solution: [`${g} → ${w} (${rm})`],
        };
      }),
      tp('padho', (r) => {
        const [w, rm] = r.pick(words);
        return {
          type: 'mcq', prompt: `"${w}" को कैसे पढ़ेंगे? (How do you read "${w}"?)`, ...choose(r, rm, r.shuffle(words.filter((x) => x[1] !== rm)).map((x) => x[1])),
          hints: ['पहला अक्षर पहचानिए (find the first letter).', 'मात्राएँ देखिए: ा = aa, ि = i, ी = ee, ु = u, ू = oo, े = e, ो = o.', ELIM],
          mistakes: [{ when: 'wrong', explain: `"${w}" पढ़ा जाता है: ${rm}.` }],
          solution: [`${w} = ${rm}`],
        };
      }),
      tp('milan', (r) => {
        const pairs = r.shuffle(words).slice(0, 4);
        const m = matching(r, pairs.map(([w, , g]) => [w, g] as [string, string]));
        return {
          type: 'match', prompt: `शब्द और अर्थ मिलाइए (match word and meaning): ${pairs.map((x) => x[0]).join(' · ')}`, left: m.left, right: m.right, answer: m.answer,
          hints: ['जो शब्द पक्का पता है, उससे शुरू कीजिए (start with the word you know).', `पढ़ने में मदद: ${pairs.map((x) => `${x[0]} = ${x[1]}`).join('; ')}`],
          mistakes: [{ when: 'wrong', explain: 'कम से कम एक जोड़ी गलत है (at least one pair is wrong).' }],
          solution: pairs.map(([w, rm, g]) => `${w} (${rm}) → ${g}`),
        };
      }),
    ],
  };
}

// ---------- पाठ परिचय (about the lesson) builder ----------
interface About {
  no: number; topic: string; hi: string; roman: string; gloss: string;
  vidha: string; vidhaInfo: string; theme: string; gist: string[]; message: string;
  facts: MQ[]; trueF: string[]; falseF: string[];
}
/** [lesson, vidha, group] — vidhas in one group are never distractors for each other */
const MAIN: [string, string, string][] = [
  ['आम ले लो आम!', 'बालगीत', 'verse'], ['हमारा गाँव', 'बालगीत', 'verse'], ['रेलवे स्टेशन', 'बालगीत', 'verse'], ['बाज़ार', 'बालगीत', 'verse'],
  ['मेरा परिवार', 'बालगीत', 'verse'], ['चिड़ियाघर', 'चित्रपठन', 'picture'], ['मैदान', 'चित्रपठन', 'picture'], ['बाल दिवस', 'वार्तालाप', 'talk'],
  ['खुशियों की दुनिया', 'कविता', 'verse'], ['चुक्की और जब्बार', 'कहानी', 'story'], ['उद्यान', 'निबंध', 'essay'], ['बच्चे चले क्रिकेट खेलने', 'कहानी', 'story'],
];
const VG = (v: string) => MAIN.find((x) => x[1] === v)?.[2] ?? v;
const THEMES = ['फल बेचने वाले की पुकार (a fruit-seller\'s call)', 'गाँव का जीवन (village life)', 'रेल यात्रा (train journey)', 'खरीदारी (shopping)',
  'परिवार (family)', 'जानवर (animals)', 'खेल-कूद (games)', 'बच्चों का दिन (children\'s day)', 'खुशी और मेल-जोल (happiness, togetherness)',
  'कहानी के पात्र और सीख (characters and lesson)', 'बगीचा और प्रकृति (garden, nature)', 'टीम भावना (team spirit)'];

function about(a: About): OSpec {
  const g = VG(a.vidha);
  const vidhas = [...new Set(MAIN.filter((x) => x[2] !== g).map((x) => x[1]))];
  const auto: MQ[] = [
    [`"${a.hi}" पाठ की विधा (type) क्या है?`, a.vidha, vidhas, 'पाठ का रूप देखिए: गीत, चित्र, बातचीत, कहानी, निबंध? (song, pictures, talk, story, essay?)', `${a.vidha}: ${a.vidhaInfo}`],
    [`"${a.hi}" पाठ किसके बारे में है? (What is it about?)`, a.theme, THEMES.filter((x) => x !== a.theme), 'पाठ का नाम ध्यान से पढ़िए (read the title).', `विषय (theme): ${a.theme}`],
    [`"${a.hi}" का अर्थ (meaning) क्या है?`, a.gloss, MAIN.filter((x) => x[0] !== a.hi).map((x) => GLOSS[x[0]]), `पढ़िए: ${a.roman}`, `${a.hi} (${a.roman}) = ${a.gloss}`],
    [`"${a.hi}" पाठ से हमें क्या सीख मिलती है? (What do we learn?)`, a.message, ['दूसरों की मदद नहीं करनी चाहिए (do not help others).', 'पढ़ाई ज़रूरी नहीं है (study is not needed).', 'झगड़ा करना अच्छा है (fighting is good).'], 'पाठ का अंत याद कीजिए (recall the ending).', a.message],
  ];
  const wrongV = vidhas[0];
  const pool: [string, boolean][] = [
    [`"${a.hi}" की विधा ${a.vidha} है।`, true], ...a.trueF.map((s) => [s, true] as [string, boolean]),
    [`"${a.hi}" की विधा ${wrongV} है।`, false], ...a.falseF.map((s) => [s, false] as [string, boolean]),
  ];
  return {
    id: `ts6.hi.${a.topic}.path`, title: `${a.hi} (${a.roman}): पाठ परिचय (about the lesson)`,
    intro: [
      h(`${a.hi} — ${a.roman} — "${a.gloss}"`),
      def(`विधा (type): ${a.vidha}`, a.vidhaInfo),
      def('विषय (theme)', a.theme),
      h('सार (summary — in our own words)'),
      ...a.gist.map((s) => p(s)),
      remember(`सीख (lesson): ${a.message}`),
      tip('पाठ्यपुस्तक का मूल पाठ ज़ोर से पढ़िए। यहाँ का सार केवल समझने में मदद के लिए है (read the textbook aloud; this summary only helps).'),
    ],
    examples: [
      ex(`"${a.hi}" पाठ का परिचय दीजिए (introduce the lesson).`, [`नाम: ${a.hi} (${a.roman}) = ${a.gloss}`, `विधा: ${a.vidha} — ${a.vidhaInfo}`, `विषय: ${a.theme}`], `${a.vidha}; ${a.theme}`),
      ex(`"${a.hi}" से हमें क्या सीख मिलती है?`, ['पाठ की मुख्य बात याद कीजिए (recall the main idea).', a.gist[0], 'सीख एक वाक्य में बोलिए (say the lesson in one sentence).'], a.message),
    ],
    practice: [
      mcq('tathya', 'पाठ का परिचय और सार फिर से पढ़िए (re-read the summary).', [...auto, ...a.facts]),
      tapT('sahi', `"${a.hi}" के बारे में सभी सही वाक्य चुनिए (tap all true sentences).`, pool, ['पहले विधा वाला वाक्य जाँचिए (check the type first).', 'हर वाक्य को सार से मिलाइए (compare with the summary).'], `विधा: ${a.vidha}; विषय: ${a.theme}`),
      tp('vidha', (r) => {
        const seen = new Set([a.vidha]);
        const rest = r.shuffle(MAIN.filter((x) => x[0] !== a.hi)).filter((x) => (seen.has(x[1]) ? false : (seen.add(x[1]), true))).slice(0, 3);
        const pairs = r.shuffle([[a.hi, a.vidha] as [string, string], ...rest.map((x) => [x[0], x[1]] as [string, string])]);
        const m = matching(r, pairs);
        return {
          type: 'match', prompt: `पाठों को उनकी विधा से मिलाइए (match lessons to their type): ${pairs.map((x) => x[0]).join(' · ')}`, left: m.left, right: m.right, answer: m.answer,
          hints: [`"${a.hi}" की विधा ${a.vidha} है — यहीं से शुरू कीजिए.`, 'बालगीत = गाना, चित्रपठन = चित्र देखकर बोलना, वार्तालाप = बातचीत, कहानी = story, निबंध = essay.'],
          mistakes: [{ when: 'wrong', explain: 'कम से कम एक जोड़ी गलत है। हर पाठ का रूप याद कीजिए.' }],
          solution: pairs.map(([x, y]) => `${x} → ${y}`),
        };
      }),
    ],
  };
}
const GLOSS: Record<string, string> = {
  'आम ले लो आम!': 'Buy mangoes!', 'हमारा गाँव': 'Our village', 'रेलवे स्टेशन': 'Railway station', 'बाज़ार': 'Market',
  'मेरा परिवार': 'My family', 'चिड़ियाघर': 'Zoo', 'मैदान': 'Playground', 'बाल दिवस': 'Children\'s Day',
  'खुशियों की दुनिया': 'World of happiness', 'चुक्की और जब्बार': 'Chukki and Jabbar (two names)', 'उद्यान': 'Garden', 'बच्चे चले क्रिकेट खेलने': 'Children go to play cricket',
};

const unit = (a: About, v: OSpec, g: OSpec, note?: string): USpec => ({
  id: `ts6.hi.ch${a.no}`, subject: 'hindi', title: `पाठ ${a.no} — ${a.hi} (${a.gloss})`, source: src(a.no),
  objectives: [about(a), v, g], note: note ? `${CHOSEN} ${note}` : CHOSEN,
});

const GEET = 'बच्चों के लिए छोटा, लय वाला गीत; इसे ताली बजाकर गाया जा सकता है (a short rhythmic children\'s song).';
const CHITRA = 'चित्र देखकर चीज़ों के नाम पहचानना और उनके बारे में बोलना (look at a picture, name things, talk about them).';

// =====================================================================================
// पाठ 1 — आम ले लो आम! (बालगीत) — language: स्वर (vowels)
// =====================================================================================
const ch1 = unit({
  no: 1, topic: 'aam', hi: 'आम ले लो आम!', roman: 'aam le lo aam!', gloss: GLOSS['आम ले लो आम!'],
  vidha: 'बालगीत', vidhaInfo: GEET, theme: THEMES[0],
  gist: [
    'इस गीत में एक फलवाला मीठे आम बेचने के लिए आवाज़ लगाता है: "आम ले लो आम!" (A fruit-seller calls out to sell sweet mangoes.)',
    'गीत में आम का रंग, स्वाद और खुशबू की बात है। बच्चे आम देखकर खुश होते हैं (children are happy to see mangoes).',
    'आम को "फलों का राजा" कहते हैं (the mango is called the king of fruits). यह गर्मी के मौसम में आता है (it comes in summer).',
  ],
  message: 'फल खाना सेहत के लिए अच्छा है; मीठी बोली से सबका मन जीतते हैं (fruits are healthy; sweet words win hearts).',
  facts: [
    ['आम को क्या कहते हैं? (The mango is called…)', 'फलों का राजा (king of fruits)', ['सब्ज़ियों की रानी', 'पेड़ों का पत्ता', 'फूलों का रंग'], 'आम सबसे प्रिय फल है.', 'आम को फलों का राजा कहते हैं.'],
    ['आम किस मौसम में आता है? (Which season?)', 'गर्मी (summer)', ['सर्दी (winter)', 'कोई नहीं', 'हर दिन बर्फ़ में'], 'तेलुगु: వేసవి.', 'आम गर्मी में आता है.'],
    ['"ले लो" का अर्थ क्या है?', 'take it / buy it (తీసుకోండి)', ['go away', 'eat it', 'sleep'], 'फलवाला क्या चाहता है?', '"ले लो" = take it (buy it).'],
  ],
  trueF: ['गीत में फलवाला आम बेचता है।', 'आम मीठा फल है।'],
  falseF: ['यह गीत एक बस के बारे में है।', 'आम सर्दी का फल है।'],
},
vocab('aam', 'आम ले लो आम!', [
  ['आम', 'aam', 'mango (మామిడి పండు)'], ['केला', 'kelaa', 'banana (అరటి పండు)'], ['फल', 'phal', 'fruit (పండు)'], ['मीठा', 'meethaa', 'sweet (తీపి)'],
  ['पीला', 'peelaa', 'yellow (పసుపు రంగు)'], ['टोकरी', 'tokaree', 'basket (బుట్ట)'], ['पेड़', 'ped', 'tree (చెట్టు)'], ['गर्मी', 'garmee', 'summer, heat (వేసవి)'],
]),
gram({
  id: 'ts6.hi.aam.swar', title: 'स्वर (vowels): अ आ इ ई उ ऊ ऋ ए ऐ ओ औ',
  intro: [
    def('वर्णमाला (alphabet)', 'हिंदी के सभी अक्षरों का क्रम। इसमें स्वर और व्यंजन होते हैं (vowels and consonants).'),
    def('स्वर', info('स्वर')),
    keys('अ (a) आ (aa) इ (i) ई (ee) उ (u) ऊ (oo) ऋ (ri)', 'ए (e) ऐ (ai) ओ (o) औ (au)', 'अं (an) अः (ah)'),
    tip('तेलुगु से मिलाइए: అ = अ, ఆ = आ, ఇ = इ, ఈ = ई, ఉ = उ, ఊ = ऊ, ఏ = ए, ఐ = ऐ, ఓ = ओ, ఔ = औ.'),
    remember('"आम" का पहला अक्षर "आ" एक स्वर है (the first letter of आम is the vowel आ).'),
  ],
  examples: [
    ex('"आम" का पहला अक्षर कौन-सा है? स्वर है या व्यंजन?', ['आम = आ + म.', '"आ" अपने-आप बोला जाता है → स्वर.'], 'आ — स्वर (vowel)'),
    ex('"ई" कैसे पढ़ेंगे?', ['ई = लंबी "ee" ध्वनि (long ee).', 'तेलुगु: ఈ.'], 'ee'),
  ],
  rows: [
    ['अ', 'स्वर', 'a'], ['आ', 'स्वर', 'aa'], ['इ', 'स्वर', 'i'], ['ई', 'स्वर', 'ee'], ['उ', 'स्वर', 'u'], ['ऊ', 'स्वर', 'oo'], ['ए', 'स्वर', 'e'], ['ऐ', 'स्वर', 'ai'], ['ओ', 'स्वर', 'o'], ['औ', 'स्वर', 'au'],
    ['क', 'व्यंजन', 'ka'], ['म', 'व्यंजन', 'ma'], ['ल', 'व्यंजन', 'la'], ['न', 'व्यंजन', 'na'], ['र', 'व्यंजन', 'ra'],
  ],
  ask: 'स्वर है या व्यंजन? (vowel or consonant?)', detAsk: 'इसे कैसे पढ़ेंगे? (how is it read?)',
  hints: ['क्या यह अक्षर अपने-आप बोला जाता है? (does it sound on its own?)', 'तेलुगु के समान अक्षर से मिलाइए (compare with Telugu).'],
  extra: [orderT('kram', 'स्वरों को सही क्रम में लगाइए (put the vowels in order).', [
    ['अ', 'आ', 'इ', 'ई'], ['इ', 'ई', 'उ', 'ऊ'], ['ए', 'ऐ', 'ओ', 'औ'], ['उ', 'ऊ', 'ए', 'ऐ'], ['आ', 'इ', 'उ', 'ए'],
  ], ['छोटा स्वर पहले, फिर लंबा (short before long): अ–आ, इ–ई, उ–ऊ.'], 'स्वरों का क्रम: अ आ इ ई उ ऊ ऋ ए ऐ ओ औ.')],
}), 'Song summarised only at theme level (a mango-seller\'s call); confirm against the printed song.');

// =====================================================================================
// पाठ 2 — हमारा गाँव (बालगीत) — language: व्यंजन (consonants)
// =====================================================================================
const ch2 = unit({
  no: 2, topic: 'gaon', hi: 'हमारा गाँव', roman: 'hamaaraa gaanv', gloss: GLOSS['हमारा गाँव'],
  vidha: 'बालगीत', vidhaInfo: GEET, theme: THEMES[1],
  gist: [
    'यह गीत हमारे सुंदर गाँव के बारे में है (a song about our lovely village).',
    'गाँव में हरे खेत, तालाब, पेड़, गाय-बैल और मेहनती किसान हैं (green fields, pond, trees, cows, hard-working farmers).',
    'गाँव के लोग मिल-जुलकर रहते हैं और त्योहार साथ मनाते हैं (people live together and celebrate festivals together).',
  ],
  message: 'हमें अपने गाँव से प्यार करना चाहिए और उसे साफ़ रखना चाहिए (love your village and keep it clean).',
  facts: [
    ['गाँव में खेती कौन करता है? (Who farms?)', 'किसान (farmer)', ['डाकिया', 'ड्राइवर', 'दर्ज़ी'], 'तेलुगु: రైతు.', 'किसान खेत में फ़सल उगाता है.'],
    ['"हमारा" का अर्थ क्या है?', 'our (మా / మన)', ['your', 'their', 'my'], 'हम = we.', 'हमारा = our.'],
    ['गाँव में पानी कहाँ से मिलता है?', 'तालाब और कुआँ (pond and well)', ['हवाई जहाज़', 'किताब', 'बाज़ार की दुकान'], 'गाँव का चित्र याद कीजिए.', 'गाँव में तालाब और कुएँ से पानी मिलता है.'],
  ],
  trueF: ['गीत में गाँव के खेतों की बात है।', 'गाँव के लोग मिल-जुलकर रहते हैं।'],
  falseF: ['गीत में गाँव को गंदा रखने को कहा है।', 'यह पाठ एक निबंध है।'],
},
vocab('gaon', 'हमारा गाँव', [
  ['गाँव', 'gaanv', 'village (గ్రామం / పల్లె)'], ['खेत', 'khet', 'field (పొలం)'], ['किसान', 'kisaan', 'farmer (రైతు)'], ['तालाब', 'taalaab', 'pond, tank (చెరువు)'],
  ['गाय', 'gaay', 'cow (ఆవు)'], ['पेड़', 'ped', 'tree (చెట్టు)'], ['घर', 'ghar', 'house (ఇల్లు)'], ['हरा', 'haraa', 'green (ఆకుపచ్చ)'],
]),
gram({
  id: 'ts6.hi.gaon.vyanjan', title: 'व्यंजन (consonants): क-वर्ग से प-वर्ग और य र ल व श ष स ह',
  intro: [
    def('व्यंजन', info('व्यंजन')),
    keys('क ख ग घ ङ (क-वर्ग)', 'च छ ज झ ञ (च-वर्ग)', 'ट ठ ड ढ ण (ट-वर्ग)', 'त थ द ध न (त-वर्ग)', 'प फ ब भ म (प-वर्ग)', 'य र ल व श ष स ह', 'क्ष त्र ज्ञ श्र (संयुक्त व्यंजन — joined)'),
    tip('हर व्यंजन में "अ" छिपा होता है: क = क् + अ (every consonant carries a hidden "a").'),
    remember('तेलुगु की तरह ही क्रम है: క ఖ గ ఘ ఙ = क ख ग घ ङ.'),
  ],
  examples: [
    ex('"गाँव" का पहला अक्षर किस वर्ग का है?', ['पहला अक्षर: ग.', 'ग → क ख ग घ ङ → क-वर्ग.'], 'क-वर्ग'),
    ex('"पेड़" का पहला अक्षर किस वर्ग का है?', ['पहला अक्षर: प.', 'प फ ब भ म → होंठों से → प-वर्ग.'], 'प-वर्ग'),
  ],
  rows: [
    ['क', 'क-वर्ग', 'ka'], ['ख', 'क-वर्ग', 'kha'], ['ग', 'क-वर्ग', 'ga'], ['घ', 'क-वर्ग', 'gha'],
    ['च', 'च-वर्ग', 'cha'], ['ज', 'च-वर्ग', 'ja'], ['छ', 'च-वर्ग', 'chha'], ['झ', 'च-वर्ग', 'jha'],
    ['ट', 'ट-वर्ग', 'Ta'], ['ड', 'ट-वर्ग', 'Da'], ['ठ', 'ट-वर्ग', 'Tha'], ['ण', 'ट-वर्ग', 'Na (retroflex)'],
    ['त', 'त-वर्ग', 'ta'], ['द', 'त-वर्ग', 'da'], ['न', 'त-वर्ग', 'na'], ['थ', 'त-वर्ग', 'tha'],
    ['प', 'प-वर्ग', 'pa'], ['ब', 'प-वर्ग', 'ba'], ['म', 'प-वर्ग', 'ma'], ['भ', 'प-वर्ग', 'bha'],
    ['य', 'अंतःस्थ और ऊष्म', 'ya'], ['र', 'अंतःस्थ और ऊष्म', 'ra'], ['ल', 'अंतःस्थ और ऊष्म', 'la'], ['स', 'अंतःस्थ और ऊष्म', 'sa'], ['ह', 'अंतःस्थ और ऊष्म', 'ha'],
  ],
  ask: 'यह किस वर्ग का व्यंजन है? (which group?)', detAsk: 'इसे कैसे पढ़ेंगे? (how is it read?)',
  hints: ['वर्ग का पहला अक्षर याद कीजिए: क, च, ट, त, प.', 'तेलुगु के समान अक्षर से मिलाइए (క చ ట త ప).'],
  extra: [orderT('kram', 'व्यंजनों को सही क्रम में लगाइए (put the consonants in order).', [
    ['क', 'ख', 'ग', 'घ', 'ङ'], ['च', 'छ', 'ज', 'झ', 'ञ'], ['ट', 'ठ', 'ड', 'ढ', 'ण'], ['त', 'थ', 'द', 'ध', 'न'], ['प', 'फ', 'ब', 'भ', 'म'], ['य', 'र', 'ल', 'व'],
  ], ['तेलुगु वर्णमाला का क्रम भी यही है (same order as Telugu).'], 'हर वर्ग में पाँच व्यंजन होते हैं।')],
}), 'Song summarised only at theme level (village life); confirm against the printed song.');

// =====================================================================================
// पाठ 3 — रेलवे स्टेशन (बालगीत) — language: मात्राएँ ा ि ी ु ू
// =====================================================================================
const ch3 = unit({
  no: 3, topic: 'station', hi: 'रेलवे स्टेशन', roman: 'relve steshan', gloss: GLOSS['रेलवे स्टेशन'],
  vidha: 'बालगीत', vidhaInfo: GEET, theme: THEMES[2],
  gist: [
    'यह गीत रेलवे स्टेशन की चहल-पहल के बारे में है (the bustle of a railway station).',
    'स्टेशन पर रेलगाड़ी आती है, सीटी बजती है, कुली सामान उठाते हैं, लोग टिकट लेकर डिब्बों में चढ़ते हैं (train arrives, whistle, porters, tickets, coaches).',
    'गाड़ी "छुक-छुक" करती हुई अगले शहर की ओर चल पड़ती है (the train chugs off to the next town).',
  ],
  message: 'यात्रा में नियम मानें, टिकट लें और लाइन में चलें (follow rules, buy a ticket, stand in line).',
  facts: [
    ['रेलगाड़ी में चढ़ने के लिए क्या लेना ज़रूरी है?', 'टिकट (ticket)', ['फूल', 'गेंद', 'छाता'], 'तेलुगु: టికెట్.', 'यात्रा के लिए टिकट ज़रूरी है.'],
    ['स्टेशन पर सामान कौन उठाता है?', 'कुली (porter)', ['किसान', 'डॉक्टर', 'माली'], 'लाल कपड़े पहनते हैं.', 'कुली यात्रियों का सामान उठाते हैं.'],
    ['रेलगाड़ी की आवाज़ को गीत में कैसे बोलते हैं?', 'छुक-छुक', ['म्याऊँ-म्याऊँ', 'भौं-भौं', 'टर्र-टर्र'], 'इंजन की आवाज़.', 'रेल की आवाज़: छुक-छुक.'],
  ],
  trueF: ['गीत में रेलगाड़ी और स्टेशन की बात है।', 'स्टेशन पर लोग टिकट लेते हैं।'],
  falseF: ['यह गीत चिड़ियाघर के बारे में है।', 'रेल में बिना टिकट जाना ठीक है।'],
},
vocab('station', 'रेलवे स्टेशन', [
  ['रेलगाड़ी', 'relgaadee', 'train (రైలు)'], ['डिब्बा', 'dibbaa', 'coach, box (పెట్టె)'], ['टिकट', 'tikat', 'ticket (టికెట్)'], ['कुली', 'kulee', 'porter (కూలీ)'],
  ['सीटी', 'seetee', 'whistle (ఈల)'], ['यात्री', 'yaatree', 'passenger (ప్రయాణికుడు)'], ['सामान', 'saamaan', 'luggage (సామాను)'], ['पटरी', 'patree', 'rail track (పట్టా)'],
]),
gram({
  id: 'ts6.hi.station.matra1', title: 'मात्राएँ (vowel signs) — 1: ा ि ी ु ू',
  intro: [
    def('मात्रा', 'स्वर जब व्यंजन के साथ जुड़ता है तो उसका छोटा चिह्न लगता है — उसे मात्रा कहते हैं (vowel sign). तेलुगु में इसे గుణింతం कहते हैं.'),
    keys('क + ा = का (kaa)', 'क + ि = कि (ki)', 'क + ी = की (kee)', 'क + ु = कु (ku)', 'क + ू = कू (koo)'),
    tip('ि की मात्रा अक्षर से पहले लिखी जाती है, पर बोली बाद में जाती है: कि = क् + इ.'),
  ],
  examples: [
    ex('"कुली" में कौन-कौन सी मात्राएँ हैं?', ['कु = क + ु (u).', 'ली = ल + ी (ee).'], 'ु और ी (ku-lee)'),
    ex('"दिन" कैसे पढ़ेंगे?', ['द + ि = दि (di).', 'न = na.'], 'din (day)'),
  ],
  rows: [
    ['दाल', 'ा (आ की मात्रा)', 'daal — lentils'], ['नाक', 'ा (आ की मात्रा)', 'naak — nose'], ['काम', 'ा (आ की मात्रा)', 'kaam — work'], ['पान', 'ा (आ की मात्रा)', 'paan — betel leaf'],
    ['दिन', 'ि (इ की मात्रा)', 'din — day'], ['सिर', 'ि (इ की मात्रा)', 'sir — head'], ['तिल', 'ि (इ की मात्रा)', 'til — sesame'], ['मिल', 'ि (इ की मात्रा)', 'mil — meet'],
    ['खीर', 'ी (ई की मात्रा)', 'kheer — sweet pudding'], ['तीर', 'ी (ई की मात्रा)', 'teer — arrow'], ['नीम', 'ी (ई की मात्रा)', 'neem — neem tree'], ['सीख', 'ी (ई की मात्रा)', 'seekh — learn'],
    ['पुल', 'ु (उ की मात्रा)', 'pul — bridge'], ['सुन', 'ु (उ की मात्रा)', 'sun — listen'], ['धुन', 'ु (उ की मात्रा)', 'dhun — tune'], ['गुण', 'ु (उ की मात्रा)', 'gun — quality'],
    ['फूल', 'ू (ऊ की मात्रा)', 'phool — flower'], ['धूप', 'ू (ऊ की मात्रा)', 'dhoop — sunshine'], ['दूध', 'ू (ऊ की मात्रा)', 'doodh — milk'], ['सूप', 'ू (ऊ की मात्रा)', 'soop — soup'],
  ],
  ask: 'इस शब्द में कौन-सी मात्रा है? (which vowel sign?)', detAsk: 'इसे कैसे पढ़ेंगे और अर्थ क्या है? (reading and meaning)',
  hints: ['पहले अक्षर के आगे, पीछे या नीचे देखिए (look around the first letter).', 'ा = aa, ि = i, ी = ee, ु = u, ू = oo.'],
}), 'Song summarised only at theme level (a railway station); confirm against the printed song.');

// =====================================================================================
// पाठ 4 — बाज़ार (बालगीत) — language: गिनती १–२० (numbers)
// =====================================================================================
const NUMS: Row[] = [
  ['एक', '1', 'ek'], ['दो', '2', 'do'], ['तीन', '3', 'teen'], ['चार', '4', 'chaar'], ['पाँच', '5', 'paanch'], ['छह', '6', 'chhah'], ['सात', '7', 'saat'],
  ['आठ', '8', 'aath'], ['नौ', '9', 'nau'], ['दस', '10', 'das'], ['ग्यारह', '11', 'gyaarah'], ['बारह', '12', 'baarah'], ['पंद्रह', '15', 'pandrah'], ['बीस', '20', 'bees'],
];
const ch4 = unit({
  no: 4, topic: 'bazaar', hi: 'बाज़ार', roman: 'baazaar', gloss: GLOSS['बाज़ार'],
  vidha: 'बालगीत', vidhaInfo: GEET, theme: THEMES[3],
  gist: [
    'यह गीत बाज़ार की रौनक के बारे में है (the lively market).',
    'बाज़ार में सब्ज़ी, फल, कपड़े, खिलौने और मिठाई की दुकानें हैं; दुकानदार ग्राहकों को बुलाते हैं (shops of vegetables, fruits, clothes, toys, sweets).',
    'बच्चे माँ-पिताजी के साथ ज़रूरी चीज़ें खरीदते हैं, पैसे गिनते हैं और थैला भरकर घर लौटते हैं (children buy things, count money, carry a bag home).',
  ],
  message: 'ज़रूरत की चीज़ें ही खरीदें, पैसे ठीक से गिनें और कपड़े का थैला साथ ले जाएँ (buy what you need, count money, carry a cloth bag).',
  facts: [
    ['सब्ज़ी लेने के लिए कौन-सा थैला अच्छा है?', 'कपड़े का थैला (cloth bag)', ['प्लास्टिक की थैली', 'कागज़ की नाव', 'टोपी'], 'पर्यावरण का ध्यान रखिए.', 'कपड़े का थैला बार-बार काम आता है.'],
    ['बाज़ार में सामान बेचने वाले को क्या कहते हैं?', 'दुकानदार (shopkeeper)', ['ग्राहक', 'किसान', 'यात्री'], 'दुकान + दार.', 'दुकान चलाने वाला दुकानदार.'],
    ['चीज़ खरीदने वाले को क्या कहते हैं?', 'ग्राहक (customer)', ['दुकानदार', 'कुली', 'माली'], 'जो पैसे देकर सामान ले.', 'खरीदने वाला ग्राहक.'],
  ],
  trueF: ['गीत में बाज़ार और दुकानों की बात है।', 'बाज़ार में पैसे देकर सामान खरीदते हैं।'],
  falseF: ['बाज़ार में कोई दुकान नहीं होती।', 'यह पाठ एक कहानी है।'],
},
vocab('bazaar', 'बाज़ार', [
  ['बाज़ार', 'baazaar', 'market (సంత / బజారు)'], ['दुकान', 'dukaan', 'shop (దుకాణం)'], ['सब्ज़ी', 'sabzee', 'vegetable (కూరగాయ)'], ['पैसा', 'paisaa', 'money (డబ్బు)'],
  ['थैला', 'thailaa', 'bag (సంచి)'], ['खिलौना', 'khilaunaa', 'toy (బొమ్మ)'], ['मिठाई', 'mithaaee', 'sweet (మిఠాయి)'], ['ग्राहक', 'graahak', 'customer (కొనుగోలుదారు)'],
]),
gram({
  id: 'ts6.hi.bazaar.ginti', title: 'गिनती (numbers) एक से बीस',
  intro: [
    def('गिनती (counting)', 'बाज़ार में चीज़ें और पैसे गिनने के लिए संख्याएँ ज़रूरी हैं (numbers to count things and money).'),
    keys(...NUMS.map(([w, n, rm]) => `${n} = ${w} (${rm})`)),
    tip('पहले 1 से 10 पक्का कीजिए, फिर 11–20 (learn 1–10 first, then 11–20).'),
  ],
  examples: [
    ex('"सात" कौन-सी संख्या है?', ['सात = saat.', 'तेलुगु: ఏడు.'], '7'),
    ex('मेरे पास 5 आम हैं। हिंदी में कैसे बोलेंगे?', ['5 = पाँच (paanch).', 'वाक्य: मेरे पास पाँच आम हैं।'], 'पाँच आम'),
  ],
  rows: NUMS,
  ask: 'यह कौन-सी संख्या है? (which number?)', detAsk: 'इसे कैसे पढ़ेंगे? (how is it read?)',
  hints: ['उँगलियों पर गिनिए (count on your fingers).', '1 एक, 2 दो, 3 तीन, 4 चार, 5 पाँच…'], noTap: true,
  extra: [
    mcq('hisab', 'उँगलियों पर जोड़िए/घटाइए (use your fingers).', [
      ['दो आम + तीन आम = कितने आम? (2 + 3)', 'पाँच', ['चार', 'छह', 'सात'], '2 + 3 = 5.', 'दो और तीन मिलकर पाँच.'],
      ['चार केले + चार केले = ? (4 + 4)', 'आठ', ['सात', 'नौ', 'छह'], '4 + 4 = 8.', 'चार और चार आठ.'],
      ['दस में से तीन गए, कितने बचे? (10 − 3)', 'सात', ['छह', 'आठ', 'तीन'], '10 − 3 = 7.', 'दस में से तीन घटाने पर सात.'],
      ['पाँच + पाँच = ? (5 + 5)', 'दस', ['नौ', 'ग्यारह', 'बीस'], '5 + 5 = 10.', 'पाँच और पाँच दस.'],
      ['एक दर्जन (dozen) में कितने केले होते हैं?', 'बारह', ['दस', 'ग्यारह', 'बीस'], 'dozen = 12.', 'एक दर्जन = बारह (12).'],
      ['छह + तीन = ? (6 + 3)', 'नौ', ['आठ', 'दस', 'सात'], '6 + 3 = 9.', 'छह और तीन नौ.'],
    ]),
    orderT('kram', 'संख्याओं को छोटी से बड़ी के क्रम में लगाइए (smallest to largest).', [
      ['एक', 'दो', 'तीन', 'चार'], ['पाँच', 'छह', 'सात', 'आठ'], ['तीन', 'पाँच', 'सात', 'नौ'], ['दो', 'चार', 'छह', 'आठ'], ['सात', 'नौ', 'ग्यारह', 'बीस'],
    ], ['हर शब्द को अंक में बदलिए (turn each word into a digit).'], 'छोटी संख्या पहले, बड़ी बाद में.'),
  ],
}), 'Song summarised only at theme level (a market); confirm against the printed song.');

// =====================================================================================
// पाठ 5 — मेरा परिवार (बालगीत) — language: मात्राएँ े ै ो ौ ं
// =====================================================================================
const ch5 = unit({
  no: 5, topic: 'parivar', hi: 'मेरा परिवार', roman: 'meraa parivaar', gloss: GLOSS['मेरा परिवार'],
  vidha: 'बालगीत', vidhaInfo: GEET, theme: THEMES[4],
  gist: [
    'इस गीत में एक बच्चा अपने परिवार के बारे में बताता है (a child talks about the family).',
    'माँ, पिताजी, दादा-दादी, भाई-बहन — सब एक-दूसरे से प्यार करते हैं और घर के काम में मदद करते हैं (everyone loves and helps each other).',
    'शाम को सब साथ बैठकर खाना खाते हैं और बातें करते हैं (in the evening they eat and talk together).',
  ],
  message: 'परिवार में सबका आदर करें और घर के काम में हाथ बँटाएँ (respect everyone in the family and share the housework).',
  facts: [
    ['पिताजी के पिता को क्या कहते हैं?', 'दादा (grandfather — తాత)', ['भाई', 'चाचा', 'बेटा'], 'तेलुगु: తాతయ్య.', 'पिता के पिता = दादा.'],
    ['"मेरा" का अर्थ क्या है?', 'my (నా)', ['our', 'your', 'his'], 'मैं = I.', 'मेरा = my.'],
    ['माँ को और किस शब्द से बुलाते हैं?', 'माता (mother)', ['पिता', 'दादी', 'बहन'], 'तेलुगु: అమ్మ.', 'माँ = माता = mother.'],
  ],
  trueF: ['गीत में परिवार के सदस्यों की बात है।', 'परिवार में सब एक-दूसरे की मदद करते हैं।'],
  falseF: ['परिवार के लोग आपस में बात नहीं करते।', 'यह गीत बाज़ार के बारे में है।'],
},
vocab('parivar', 'मेरा परिवार', [
  ['माँ', 'maan', 'mother (అమ్మ)'], ['पिताजी', 'pitaajee', 'father (నాన్న)'], ['भाई', 'bhaaee', 'brother (అన్న / తమ్ముడు)'], ['बहन', 'bahan', 'sister (అక్క / చెల్లి)'],
  ['दादा', 'daadaa', 'grandfather (తాత)'], ['दादी', 'daadee', 'grandmother (నానమ్మ)'], ['परिवार', 'parivaar', 'family (కుటుంబం)'], ['प्यार', 'pyaar', 'love (ప్రేమ)'],
]),
gram({
  id: 'ts6.hi.parivar.matra2', title: 'मात्राएँ (vowel signs) — 2: े ै ो ौ और अनुस्वार ं',
  intro: [
    keys('क + े = के (ke)', 'क + ै = कै (kai)', 'क + ो = को (ko)', 'क + ौ = कौ (kau)', 'क + ं = कं (kan)'),
    def('े और ै', 'े में ऊपर एक तिरछी रेखा (e); ै में दो रेखाएँ (ai).'),
    def('ो और ौ', 'ो में खड़ी पाई के ऊपर एक रेखा (o); ौ में दो रेखाएँ (au).'),
    def('ं (अनुस्वार)', info('ं (अनुस्वार)')),
    tip('रेखाएँ गिनिए: एक रेखा = e / o, दो रेखाएँ = ai / au (count the strokes).'),
  ],
  examples: [
    ex('"मेरा" में कौन-सी मात्राएँ हैं?', ['मे = म + े (e).', 'रा = र + ा (aa).'], 'े और ा (me-raa)'),
    ex('"मोर" कैसे पढ़ेंगे?', ['मो = म + ो (o).', 'र = ra.'], 'mor (peacock)'),
  ],
  rows: [
    ['खेल', 'े (ए की मात्रा)', 'khel — game'], ['सेब', 'े (ए की मात्रा)', 'seb — apple'], ['पेड़', 'े (ए की मात्रा)', 'ped — tree'], ['रेल', 'े (ए की मात्रा)', 'rel — train'],
    ['बैल', 'ै (ऐ की मात्रा)', 'bail — ox'], ['पैर', 'ै (ऐ की मात्रा)', 'pair — foot'], ['तैर', 'ै (ऐ की मात्रा)', 'tair — swim'], ['मैल', 'ै (ऐ की मात्रा)', 'mail — dirt'],
    ['मोर', 'ो (ओ की मात्रा)', 'mor — peacock'], ['चोर', 'ो (ओ की मात्रा)', 'chor — thief'], ['गोल', 'ो (ओ की मात्रा)', 'gol — round'], ['रोज़', 'ो (ओ की मात्रा)', 'roz — every day'],
    ['कौन', 'ौ (औ की मात्रा)', 'kaun — who'], ['चौक', 'ौ (औ की मात्रा)', 'chauk — square'], ['सौ', 'ौ (औ की मात्रा)', 'sau — hundred'], ['मौन', 'ौ (औ की मात्रा)', 'maun — silence'],
    ['रंग', 'ं (अनुस्वार)', 'rang — colour'], ['पंख', 'ं (अनुस्वार)', 'pankh — feather, wing'], ['संग', 'ं (अनुस्वार)', 'sang — with'], ['दंग', 'ं (अनुस्वार)', 'dang — amazed'],
  ],
  ask: 'इस शब्द में कौन-सी मात्रा है? (which vowel sign?)', detAsk: 'इसे कैसे पढ़ेंगे और अर्थ क्या है? (reading and meaning)',
  hints: ['पहले अक्षर के ऊपर देखिए: एक रेखा या दो? बिंदु? (look above the first letter).', 'े = e, ै = ai, ो = o, ौ = au, ं = n.'],
}), 'Song summarised only at theme level (my family); confirm against the printed song.');

// =====================================================================================
// पाठ 6 — चिड़ियाघर (चित्रपठन) — language: वचन (one / many)
// =====================================================================================
const ch6 = unit({
  no: 6, topic: 'chidiyaghar', hi: 'चिड़ियाघर', roman: 'chidiyaaghar', gloss: GLOSS['चिड़ियाघर'],
  vidha: 'चित्रपठन', vidhaInfo: CHITRA, theme: THEMES[5],
  gist: [
    'इस पाठ में चिड़ियाघर का बड़ा चित्र है (a big picture of a zoo).',
    'चित्र में शेर, हाथी, बंदर, भालू, ज़ेबरा, हिरण, तोते और मोर जैसे जानवर और पक्षी हैं; बच्चे उन्हें देखकर खुश हो रहे हैं (animals and birds; children enjoy).',
    'बच्चे चित्र देखकर जानवरों के नाम हिंदी में बोलते हैं और बताते हैं कि वे क्या कर रहे हैं (children name the animals and say what they do).',
  ],
  message: 'जानवरों को परेशान न करें, उन्हें खाना न फेंकें; चिड़ियाघर के नियम मानें (do not tease or feed animals; follow zoo rules).',
  facts: [
    ['जंगल का राजा किसे कहते हैं?', 'शेर (lion)', ['बंदर', 'तोता', 'खरगोश'], 'तेलुगु: సింహం.', 'शेर को जंगल का राजा कहते हैं.'],
    ['सबसे बड़ा जानवर कौन-सा है?', 'हाथी (elephant)', ['चूहा', 'बिल्ली', 'तोता'], 'लंबी सूँड़.', 'हाथी ज़मीन का सबसे बड़ा जानवर है.'],
    ['चिड़ियाघर में क्या नहीं करना चाहिए?', 'जानवरों को पत्थर मारना या खाना फेंकना', ['चुपचाप देखना', 'नियम पढ़ना', 'लाइन में चलना'], 'जानवरों की सुरक्षा.', 'जानवरों को परेशान करना या खाना फेंकना मना है.'],
  ],
  trueF: ['इस पाठ में चित्र देखकर बोलना है।', 'चिड़ियाघर में कई जानवर हैं।'],
  falseF: ['चिड़ियाघर में जानवरों को पत्थर मारना चाहिए।', 'यह पाठ एक बालगीत है।'],
},
vocab('chidiyaghar', 'चिड़ियाघर', [
  ['शेर', 'sher', 'lion (సింహం)'], ['हाथी', 'haathee', 'elephant (ఏనుగు)'], ['बंदर', 'bandar', 'monkey (కోతి)'], ['भालू', 'bhaaloo', 'bear (ఎలుగుబంటి)'],
  ['हिरण', 'hiran', 'deer (జింక)'], ['तोता', 'totaa', 'parrot (చిలుక)'], ['मोर', 'mor', 'peacock (నెమలి)'], ['पिंजरा', 'pinjaraa', 'cage (పంజరం)'],
]),
gram({
  id: 'ts6.hi.chidiyaghar.vachan', title: 'वचन: एकवचन और बहुवचन (one and many)',
  intro: [
    def('एकवचन', info('एकवचन')), def('बहुवचन', info('बहुवचन')),
    keys('तोता → तोते (-आ → -ए)', 'चिड़िया → चिड़ियाँ (-इया → -इयाँ)', 'बकरी → बकरियाँ (-ई → -इयाँ)', 'किताब → किताबें (-एँ)'),
    tip('कुछ शब्द नहीं बदलते: एक शेर — दो शेर, एक बंदर — दो बंदर.'),
  ],
  examples: [
    ex('"तोता" का बहुवचन क्या है?', ['तोता "-आ" पर खत्म होता है.', '-आ → -ए: तोते.'], 'तोते'),
    ex('"मछलियाँ" का एकवचन क्या है?', ['-इयाँ → -ई.'], 'मछली'),
  ],
  rows: [
    ['तोता', 'एकवचन', 'तोते'], ['घोड़ा', 'एकवचन', 'घोड़े'], ['चिड़िया', 'एकवचन', 'चिड़ियाँ'], ['बकरी', 'एकवचन', 'बकरियाँ'], ['बच्चा', 'एकवचन', 'बच्चे'], ['किताब', 'एकवचन', 'किताबें'],
    ['कुत्ते', 'बहुवचन', 'कुत्ता'], ['मछलियाँ', 'बहुवचन', 'मछली'], ['बिल्लियाँ', 'बहुवचन', 'बिल्ली'], ['केले', 'बहुवचन', 'केला'], ['गायें', 'बहुवचन', 'गाय'], ['लड़के', 'बहुवचन', 'लड़का'],
  ],
  ask: 'एकवचन है या बहुवचन? (one or many?)', detAsk: 'इसका दूसरा वचन रूप क्या है? (the other form?)',
  hints: ['शब्द के अंत को देखिए: -ए, -एँ, -इयाँ अक्सर बहुवचन (look at the ending).', '"एक ___" या "दो ___" लगाकर बोलिए.'],
}), 'Picture-reading lesson; the animals listed are typical of a zoo picture — teacher to match with the printed picture.');

// =====================================================================================
// पाठ 7 — मैदान (चित्रपठन) — language: लिंग
// =====================================================================================
const ch7 = unit({
  no: 7, topic: 'maidan', hi: 'मैदान', roman: 'maidaan', gloss: GLOSS['मैदान'],
  vidha: 'चित्रपठन', vidhaInfo: CHITRA, theme: THEMES[6],
  gist: [
    'इस पाठ में खेल के मैदान का चित्र है (a picture of a playground).',
    'बच्चे दौड़ रहे हैं, कबड्डी, खो-खो, फ़ुटबॉल खेल रहे हैं, कोई झूला झूल रहा है, कोई रस्सी कूद रहा है (children run, play kabaddi, kho-kho, football, swing, skip).',
    'बच्चे चित्र देखकर बताते हैं — कौन क्या कर रहा है (children say who is doing what).',
  ],
  message: 'खेल से शरीर मज़बूत और मन खुश रहता है; खेल में मिल-जुलकर और नियम से खेलें (play keeps us fit and happy; play fair and together).',
  facts: [
    ['मैदान में बच्चे क्या करते हैं?', 'खेलते हैं (they play)', ['सोते हैं', 'खाना पकाते हैं', 'परीक्षा लिखते हैं'], 'तेलुगु: ఆట స్థలం.', 'मैदान खेलने की जगह है.'],
    ['"खो-खो" और "कबड्डी" क्या हैं?', 'भारतीय खेल (Indian games)', ['फल', 'त्योहार', 'जानवर'], 'मैदान में खेले जाते हैं.', 'खो-खो और कबड्डी भारतीय खेल हैं.'],
    ['"दौड़ना" का अर्थ क्या है?', 'to run (పరుగెత్తు)', ['to sleep', 'to sing', 'to read'], 'तेज़ चलना.', 'दौड़ना = to run.'],
  ],
  trueF: ['इस पाठ में मैदान का चित्र है।', 'बच्चे मिल-जुलकर खेलते हैं।'],
  falseF: ['मैदान में बच्चे पढ़ाई की परीक्षा लिख रहे हैं।', 'यह पाठ एक वार्तालाप है।'],
},
vocab('maidan', 'मैदान', [
  ['मैदान', 'maidaan', 'playground, ground (మైదానం)'], ['खेल', 'khel', 'game (ఆట)'], ['गेंद', 'gend', 'ball (బంతి)'], ['दौड़', 'daud', 'race, run (పరుగు)'],
  ['झूला', 'jhoolaa', 'swing (ఉయ్యాల)'], ['रस्सी', 'rassee', 'rope (తాడు)'], ['खिलाड़ी', 'khilaadee', 'player (ఆటగాడు)'], ['जीत', 'jeet', 'win (గెలుపు)'],
]),
gram({
  id: 'ts6.hi.maidan.ling', title: 'लिंग: पुल्लिंग और स्त्रीलिंग (masculine and feminine)',
  intro: [
    def('पुल्लिंग', info('पुल्लिंग')), def('स्त्रीलिंग', info('स्त्रीलिंग')),
    keys('लड़का → लड़की', 'घोड़ा → घोड़ी', 'बेटा → बेटी', 'दादा → दादी', 'शेर → शेरनी', 'मोर → मोरनी', 'राजा → रानी'),
    tip('चीज़ों का भी लिंग होता है: "अच्छा खेल" (पुल्लिंग), "अच्छी गेंद" (स्त्रीलिंग). तेलुगु में ऐसा नहीं होता — इसलिए ध्यान से सीखें.'),
  ],
  examples: [
    ex('"लड़का" का स्त्रीलिंग क्या है?', ['-आ → -ई.'], 'लड़की'),
    ex('"गेंद" पुल्लिंग है या स्त्रीलिंग?', ['हम कहते हैं "अच्छी गेंद", "गेंद गिरी".', '"-ई" वाला रूप → स्त्रीलिंग.'], 'स्त्रीलिंग'),
  ],
  rows: [
    ['लड़का', 'पुल्लिंग', 'लड़की'], ['घोड़ा', 'पुल्लिंग', 'घोड़ी'], ['बेटा', 'पुल्लिंग', 'बेटी'], ['दादा', 'पुल्लिंग', 'दादी'], ['शेर', 'पुल्लिंग', 'शेरनी'], ['मोर', 'पुल्लिंग', 'मोरनी'],
    ['लड़की', 'स्त्रीलिंग', 'लड़का'], ['बकरी', 'स्त्रीलिंग', 'बकरा'], ['नानी', 'स्त्रीलिंग', 'नाना'], ['रानी', 'स्त्रीलिंग', 'राजा'], ['मुर्गी', 'स्त्रीलिंग', 'मुर्गा'], ['चाची', 'स्त्रीलिंग', 'चाचा'],
  ],
  ask: 'पुल्लिंग है या स्त्रीलिंग? (masculine or feminine?)', detAsk: 'इसका दूसरा लिंग रूप क्या है? (the other gender form?)',
  hints: ['शब्द के आगे "अच्छा" या "अच्छी" लगाकर बोलिए.', 'अंत देखिए: -आ अक्सर पुल्लिंग, -ई / -नी अक्सर स्त्रीलिंग.'],
}), 'Picture-reading lesson; activities listed are typical of a playground picture — teacher to match with the printed picture.');

// =====================================================================================
// पाठ 8 — बाल दिवस (वार्तालाप) — language: प्रश्नवाचक शब्द (question words)
// =====================================================================================
const ch8 = unit({
  no: 8, topic: 'baldivas', hi: 'बाल दिवस', roman: 'baal divas', gloss: GLOSS['बाल दिवस'],
  vidha: 'वार्तालाप', vidhaInfo: 'दो या अधिक लोगों की बातचीत (conversation / dialogue); हर बोलने वाले का नाम पहले लिखा जाता है.',
  theme: THEMES[7],
  gist: [
    'इस पाठ में बच्चे और अध्यापक बाल दिवस के बारे में बातचीत करते हैं (children and teacher talk about Children\'s Day).',
    'बाल दिवस हर साल 14 नवंबर को मनाया जाता है; यह भारत के पहले प्रधानमंत्री पंडित जवाहरलाल नेहरू का जन्मदिन है। बच्चे उन्हें प्यार से "चाचा नेहरू" कहते थे (14 November — Nehru\'s birthday).',
    'उस दिन स्कूल में खेल, गीत, नाटक और मिठाई बाँटने जैसे कार्यक्रम होते हैं (games, songs, plays, sweets at school).',
  ],
  message: 'बच्चे देश का भविष्य हैं; हमें खूब पढ़ना, खेलना और अच्छे इंसान बनना चाहिए (children are the future of the country).',
  facts: [
    ['बाल दिवस कब मनाया जाता है?', '14 नवंबर (14 November)', ['15 अगस्त', '26 जनवरी', '2 अक्टूबर'], 'नेहरूजी का जन्मदिन.', 'बाल दिवस 14 नवंबर को मनाया जाता है.'],
    ['बच्चे किसे "चाचा नेहरू" कहते थे?', 'पंडित जवाहरलाल नेहरू', ['महात्मा गांधी', 'सुभाषचंद्र बोस', 'भगत सिंह'], 'भारत के पहले प्रधानमंत्री.', 'जवाहरलाल नेहरू को बच्चे चाचा नेहरू कहते थे.'],
    ['"वार्तालाप" का अर्थ क्या है?', 'बातचीत (conversation)', ['गीत', 'चित्र', 'पत्र'], 'वार्ता = बात.', 'वार्तालाप = बातचीत.'],
  ],
  trueF: ['बाल दिवस 14 नवंबर को है।', 'यह पाठ बातचीत के रूप में है।'],
  falseF: ['बाल दिवस 15 अगस्त को है।', 'यह पाठ एक चित्रपठन है।'],
},
vocab('baldivas', 'बाल दिवस', [
  ['बाल', 'baal', 'child (here); బాలుడు'], ['दिवस', 'divas', 'day (దినం / రోజు)'], ['जन्मदिन', 'janmadin', 'birthday (పుట్టినరోజు)'], ['अध्यापक', 'adhyaapak', 'teacher (ఉపాధ్యాయుడు)'],
  ['छात्र', 'chhaatr', 'student (విద్యార్థి)'], ['उत्सव', 'utsav', 'celebration (ఉత్సవం)'], ['गुलाब', 'gulaab', 'rose (గులాబీ)'], ['भविष्य', 'bhavishya', 'future (భవిష్యత్తు)'],
]),
gram({
  id: 'ts6.hi.baldivas.prashn', title: 'प्रश्नवाचक शब्द (question words): क्या, कौन, कहाँ, कब, कैसे, कितना, क्यों',
  intro: [
    def('प्रश्नवाचक शब्द', 'प्रश्न पूछने वाले शब्द (question words). वाक्य के अंत में "?" लगता है.'),
    keys('क्या = what (ఏమిటి)', 'कौन = who (ఎవరు)', 'कहाँ = where (ఎక్కడ)', 'कब = when (ఎప్పుడు)', 'कैसे = how (ఎలా)', 'कितना = how much / many (ఎంత)', 'क्यों = why (ఎందుకు)'),
    tip('उत्तर क्या है, यह सोचिए: व्यक्ति → कौन, जगह → कहाँ, समय → कब, कारण → क्यों.'),
  ],
  examples: [
    ex('"बाल दिवस ___ है?" — सही प्रश्न शब्द चुनिए (When is Children\'s Day?).',['उत्तर एक समय/तारीख है (14 November).', 'समय के लिए → कब.'], 'कब'),
    ex('चाचा नेहरू ___ थे? (who)', ['उत्तर एक व्यक्ति है.', 'व्यक्ति के लिए → कौन.'], 'कौन'),
  ],
  rows: [
    ['क्या', 'what (ఏమిటి)'], ['कौन', 'who (ఎవరు)'], ['कहाँ', 'where (ఎక్కడ)'], ['कब', 'when (ఎప్పుడు)'], ['कैसे', 'how (ఎలా)'], ['कितना', 'how much (ఎంత)'], ['क्यों', 'why (ఎందుకు)'],
  ],
  ask: 'इस शब्द का अर्थ क्या है? (meaning?)', noTap: true,
  hints: ['तेलुगु के प्रश्न शब्द से मिलाइए (compare with Telugu question words).', 'क्या-what, कौन-who, कहाँ-where, कब-when.'],
  extra: [mcq('chuno', 'उत्तर किस बारे में है — व्यक्ति, जगह, समय, कारण, संख्या? (what kind of answer?)', [
    ['तुम्हारा नाम ___ है? (What is your name?)', 'क्या', ['कहाँ', 'कब', 'कितना'], 'नाम पूछ रहे हैं.', 'नाम के लिए: तुम्हारा नाम क्या है?'],
    ['तुम ___ रहते हो? (Where do you live?)', 'कहाँ', ['कौन', 'क्यों', 'कब'], 'जगह पूछ रहे हैं.', 'जगह के लिए: कहाँ.'],
    ['बाल दिवस ___ है? (When is Children\'s Day?)', 'कब', ['कहाँ', 'कौन', 'कैसे'], 'तारीख पूछ रहे हैं.', 'समय/तारीख के लिए: कब.'],
    ['तुम्हारे अध्यापक ___ हैं? (Who is your teacher?)', 'कौन', ['क्या', 'कब', 'कितना'], 'व्यक्ति पूछ रहे हैं.', 'व्यक्ति के लिए: कौन.'],
    ['तुम ___ हो? (How are you?)', 'कैसे', ['कहाँ', 'कब', 'कितने'], 'हाल पूछ रहे हैं.', 'हाल के लिए: तुम कैसे हो?'],
    ['तुम्हारी कक्षा में ___ बच्चे हैं? (How many children?)', 'कितने', ['कौन', 'कहाँ', 'क्यों'], 'संख्या पूछ रहे हैं.', 'संख्या के लिए: कितने.'],
    ['तुम आज स्कूल ___ नहीं आए? (Why didn\'t you come?)', 'क्यों', ['कहाँ', 'क्या', 'कौन'], 'कारण पूछ रहे हैं.', 'कारण के लिए: क्यों.'],
  ])],
}), 'Conversation summarised at theme level (Children\'s Day, 14 November); confirm speakers and details against the printed lesson.');

// =====================================================================================
// पाठ 9 — खुशियों की दुनिया (कविता) — language: विलोम शब्द (opposites)
// =====================================================================================
const ch9 = unit({
  no: 9, topic: 'khushiyan', hi: 'खुशियों की दुनिया', roman: 'khushiyon kee duniyaa', gloss: GLOSS['खुशियों की दुनिया'],
  vidha: 'कविता', vidhaInfo: 'भावों को लय और तुक (rhyme) के साथ पंक्तियों में कहना (a poem — lines with rhythm and rhyme).',
  theme: THEMES[8],
  gist: [
    'यह कविता एक ऐसी दुनिया की बात करती है जहाँ सब खुश हैं (a world where everyone is happy).',
    'फूल खिलते हैं, पक्षी गाते हैं, बच्चे हँसते-खेलते हैं, और कोई किसी से झगड़ा नहीं करता (flowers bloom, birds sing, children laugh, no one fights).',
    'कवि कहता है कि प्यार, दोस्ती और मदद से हम अपनी दुनिया को खुशियों से भर सकते हैं (love, friendship and help fill the world with joy).',
  ],
  message: 'प्यार और मदद बाँटने से खुशी बढ़ती है (sharing love and help increases happiness).',
  facts: [
    ['"खुशी" का अर्थ क्या है?', 'happiness (సంతోషం)', ['sadness', 'anger', 'fear'], 'हँसना-खेलना.', 'खुशी = happiness.'],
    ['"दुनिया" का अर्थ क्या है?', 'world (ప్రపంచం)', ['village', 'house', 'river'], 'पूरी धरती.', 'दुनिया = world.'],
    ['कविता के अनुसार खुशी कैसे बढ़ती है?', 'प्यार और मदद बाँटने से', ['झगड़ा करने से', 'अकेले रहने से', 'दूसरों को चिढ़ाने से'], 'कविता की सीख.', 'प्यार और मदद से खुशी बढ़ती है.'],
  ],
  trueF: ['यह पाठ एक कविता है।', 'कविता खुशी और प्यार की बात करती है।'],
  falseF: ['कविता झगड़ा करना सिखाती है।', 'यह पाठ एक निबंध है।'],
},
vocab('khushiyan', 'खुशियों की दुनिया', [
  ['खुशी', 'khushee', 'happiness (సంతోషం)'], ['दुनिया', 'duniyaa', 'world (ప్రపంచం)'], ['हँसना', 'hansanaa', 'to laugh (నవ్వు)'], ['फूल', 'phool', 'flower (పువ్వు)'],
  ['दोस्त', 'dost', 'friend (స్నేహితుడు)'], ['सपना', 'sapanaa', 'dream (కల)'], ['आसमान', 'aasmaan', 'sky (ఆకాశం)'], ['चिड़िया', 'chidiyaa', 'small bird (పిచ్చుక)'],
]),
gram({
  id: 'ts6.hi.khushiyan.vilom', title: 'विलोम शब्द (opposites)',
  intro: [
    def('विलोम शब्द', 'उल्टा अर्थ बताने वाला शब्द (a word with the opposite meaning). तेलुगु: వ్యతిరేక పదం.'),
    keys('खुश × दुखी', 'दिन × रात', 'बड़ा × छोटा', 'ऊपर × नीचे', 'आना × जाना', 'हँसना × रोना', 'अच्छा × बुरा', 'गरम × ठंडा', 'सच × झूठ', 'नया × पुराना'),
    tip('जोड़ी बनाकर बोलिए: दिन-रात, ऊपर-नीचे (say them as pairs).'),
  ],
  examples: [
    ex('"दिन" का विलोम क्या है?', ['दिन = day; उल्टा = night.', 'night = रात.'], 'रात'),
    ex('"हँसना" का विलोम क्या है?', ['हँसना = laugh; उल्टा = cry.', 'cry = रोना.'], 'रोना'),
  ],
  rows: [
    ['खुश', 'दुखी', 'happy × sad'], ['दिन', 'रात', 'day × night'], ['बड़ा', 'छोटा', 'big × small'], ['ऊपर', 'नीचे', 'up × down'], ['आना', 'जाना', 'come × go'],
    ['हँसना', 'रोना', 'laugh × cry'], ['अच्छा', 'बुरा', 'good × bad'], ['गरम', 'ठंडा', 'hot × cold'], ['सच', 'झूठ', 'truth × lie'], ['नया', 'पुराना', 'new × old'],
  ],
  ask: 'इसका विलोम शब्द क्या है? (opposite?)', noTap: true,
  hints: ['शब्द का अर्थ पहले सोचिए (think of the meaning first).', 'अब उसका उल्टा सोचिए (now think of the opposite).'],
}), 'Poem summarised only at theme level (a happy world); confirm against the printed poem.');

// =====================================================================================
// पाठ 10 — चुक्की और जब्बार (कहानी) — language: सर्वनाम (pronouns)
// =====================================================================================
const ch10 = unit({
  no: 10, topic: 'chukki', hi: 'चुक्की और जब्बार', roman: 'chukkee aur jabbaar', gloss: GLOSS['चुक्की और जब्बार'],
  vidha: 'कहानी', vidhaInfo: 'पात्रों और घटनाओं के साथ कही गई बात, जिसका शुरुआत, बीच और अंत होता है (a story — characters, events, beginning-middle-end).',
  theme: THEMES[9],
  gist: [
    'यह कहानी दो पात्रों — चुक्की और जब्बार — की है (a story about two characters, Chukki and Jabbar).',
    'कहानी में एक समस्या आती है और पात्र उसे अपने ढंग से सुलझाते हैं (a problem comes up and the characters solve it).',
    'कहानी पढ़कर हम पात्रों के व्यवहार से अच्छी बात सीखते हैं (we learn something good from how the characters behave).',
  ],
  message: 'कहानी पढ़ते समय सोचिए: कौन, कहाँ, क्या हुआ और हमने क्या सीखा (while reading, ask: who, where, what happened, what did we learn).',
  facts: [
    ['कहानी में "पात्र" किसे कहते हैं?', 'कहानी के लोग या जानवर (characters)', ['कहानी का कागज़', 'कहानी की किताब का रंग', 'कहानी का दाम'], 'तेलुगु: పాత్రలు.', 'कहानी में भाग लेने वाले पात्र होते हैं.'],
    ['इस कहानी के मुख्य पात्र कौन हैं?', 'चुक्की और जब्बार', ['राजा और रानी', 'शेर और चूहा', 'चाचा नेहरू'], 'पाठ का नाम पढ़िए.', 'पाठ के नाम में ही पात्रों के नाम हैं.'],
    ['कहानी के तीन भाग कौन-से हैं?', 'शुरुआत, बीच, अंत', ['सवाल, जवाब, चित्र', 'गीत, ताल, लय', 'नाम, पता, तारीख'], 'हर कहानी कहीं से शुरू होकर कहीं खत्म होती है.', 'कहानी: शुरुआत → बीच → अंत.'],
  ],
  trueF: ['यह पाठ एक कहानी है।', 'चुक्की और जब्बार कहानी के पात्र हैं।'],
  falseF: ['यह पाठ एक बालगीत है।', 'कहानी का कोई अंत नहीं होता।'],
},
vocab('chukki', 'चुक्की और जब्बार', [
  ['कहानी', 'kahaanee', 'story (కథ)'], ['पात्र', 'paatr', 'character (పాత్ర)'], ['दोस्त', 'dost', 'friend (స్నేహితుడు)'], ['मदद', 'madad', 'help (సహాయం)'],
  ['समस्या', 'samasyaa', 'problem (సమస్య)'], ['सीख', 'seekh', 'lesson, moral (నీతి)'], ['शुरुआत', 'shuruaat', 'beginning (ప్రారంభం)'], ['अंत', 'ant', 'end (ముగింపు)'],
]),
gram({
  id: 'ts6.hi.chukki.sarvanam', title: 'सर्वनाम (pronouns): मैं, हम, तुम, आप, वह, वे',
  intro: [
    def('सर्वनाम', 'नाम की जगह आने वाला शब्द (pronoun). "जब्बार खेलता है। वह खुश है।" — "वह" = जब्बार.'),
    def('उत्तम पुरुष', info('उत्तम पुरुष')), def('मध्यम पुरुष', info('मध्यम पुरुष')), def('अन्य पुरुष', info('अन्य पुरुष')),
    keys('मैं = I (నేను)', 'हम = we (మేము)', 'तुम = you (నువ్వు)', 'आप = you, respectful (మీరు)', 'वह = he/she/that (అతడు/ఆమె)', 'यह = this (ఇది)', 'वे = they (వారు)'),
    tip('बड़ों से बात करते समय "आप" बोलिए (use आप for elders and teachers).'),
  ],
  examples: [
    ex('"चुक्की स्कूल जाती है। ___ पढ़ती है।" — सही सर्वनाम?', ['"चुक्की" की जगह कौन-सा शब्द? किसी और के बारे में बात है.', 'अन्य पुरुष, एक व्यक्ति → वह.'], 'वह'),
    ex('"मैं" किस पुरुष का सर्वनाम है?', ['बोलने वाला खुद.'], 'उत्तम पुरुष'),
  ],
  rows: [
    ['मैं', 'उत्तम पुरुष', 'I'], ['हम', 'उत्तम पुरुष', 'we'], ['मुझे', 'उत्तम पुरुष', 'to me'], ['हमारा', 'उत्तम पुरुष', 'our'],
    ['तुम', 'मध्यम पुरुष', 'you'], ['आप', 'मध्यम पुरुष', 'you (respectful)'], ['तू', 'मध्यम पुरुष', 'you (very close)'], ['तुम्हारा', 'मध्यम पुरुष', 'your'],
    ['वह', 'अन्य पुरुष', 'he / she / that'], ['यह', 'अन्य पुरुष', 'this'], ['वे', 'अन्य पुरुष', 'they'], ['ये', 'अन्य पुरुष', 'these'],
  ],
  ask: 'यह किस पुरुष का सर्वनाम है? (which person?)', detAsk: 'इसका अंग्रेज़ी अर्थ क्या है? (English meaning?)',
  hints: ['बोलने वाला खुद? सुनने वाला? या कोई और? (speaker, listener, or someone else?)', 'मैं/हम → उत्तम; तुम/आप → मध्यम; वह/वे → अन्य.'],
}), 'The plot of "Chukki aur Jabbar" could not be confirmed (story text not extracted); the summary is deliberately generic and the lesson teaches story elements. TEACHER REVIEW: add the actual plot points and moral.');

// =====================================================================================
// पाठ 11 — उद्यान (निबंध) — language: रंग और विशेषण (colours, adjectives)
// =====================================================================================
const ch11 = unit({
  no: 11, topic: 'udyan', hi: 'उद्यान', roman: 'udyaan', gloss: GLOSS['उद्यान'],
  vidha: 'निबंध', vidhaInfo: 'किसी एक विषय पर क्रम से लिखे गए कुछ अनुच्छेद (an essay — a few paragraphs on one topic).',
  theme: THEMES[10],
  gist: [
    'यह निबंध एक उद्यान (बगीचे) के बारे में है (an essay about a garden / park).',
    'उद्यान में हरी घास, रंग-बिरंगे फूल, ऊँचे पेड़, फव्वारा, झूले और बैठने की बेंच होती हैं। सुबह-शाम लोग वहाँ टहलते हैं और बच्चे खेलते हैं (grass, flowers, trees, fountain, swings, benches).',
    'माली पौधों को पानी देता है और उद्यान की देखभाल करता है। हमें फूल नहीं तोड़ने चाहिए और कूड़ा कूड़ेदान में डालना चाहिए (the gardener cares for it; don\'t pluck flowers; use the dustbin).',
  ],
  message: 'उद्यान हमें ताज़ी हवा और खुशी देता है; उसे साफ़-सुथरा रखें और फूल न तोड़ें (keep the garden clean; do not pluck flowers).',
  facts: [
    ['उद्यान की देखभाल कौन करता है?', 'माली (gardener — తోటమాలి)', ['कुली', 'दुकानदार', 'ड्राइवर'], 'पौधों को पानी देता है.', 'माली उद्यान की देखभाल करता है.'],
    ['उद्यान में हमें क्या नहीं करना चाहिए?', 'फूल तोड़ना (plucking flowers)', ['टहलना', 'खेलना', 'बेंच पर बैठना'], 'फूल सबके लिए हैं.', 'फूल तोड़ना मना है.'],
    ['"निबंध" क्या है?', 'एक विषय पर लिखे अनुच्छेद (essay)', ['बातचीत', 'गीत', 'चित्र'], 'विधा की परिभाषा.', 'निबंध एक विषय पर क्रम से लिखा जाता है.'],
  ],
  trueF: ['यह पाठ एक निबंध है।', 'उद्यान में रंग-बिरंगे फूल होते हैं।'],
  falseF: ['उद्यान में कूड़ा फेंकना ठीक है।', 'यह पाठ एक बालगीत है।'],
},
vocab('udyan', 'उद्यान', [
  ['उद्यान', 'udyaan', 'garden, park (ఉద్యానవనం)'], ['माली', 'maalee', 'gardener (తోటమాలి)'], ['पौधा', 'paudhaa', 'plant (మొక్క)'], ['घास', 'ghaas', 'grass (గడ్డి)'],
  ['फव्वारा', 'favvaaraa', 'fountain (ఫౌంటెన్)'], ['तितली', 'titalee', 'butterfly (సీతాకోకచిలుక)'], ['पत्ता', 'pattaa', 'leaf (ఆకు)'], ['खुशबू', 'khushboo', 'fragrance (సువాసన)'],
]),
gram({
  id: 'ts6.hi.udyan.rang', title: 'रंग और विशेषण (colours and describing words)',
  intro: [
    def('विशेषण', 'संज्ञा की विशेषता (रंग, आकार, गुण) बताने वाला शब्द (adjective). उदा: लाल फूल, ऊँचा पेड़.'),
    keys('लाल = red (ఎరుపు)', 'हरा = green (ఆకుపచ్చ)', 'पीला = yellow (పసుపు)', 'नीला = blue (నీలం)', 'सफ़ेद = white (తెలుపు)', 'काला = black (నలుపు)', 'गुलाबी = pink (గులాబీ రంగు)', 'नारंगी = orange (నారింజ)'),
    tip('स्त्रीलिंग के साथ "-आ" → "-ई": हरा पत्ता, हरी घास; पीला फूल, पीली तितली.'),
  ],
  examples: [
    ex('घास किस रंग की होती है?', ['घास = grass → green.', 'घास स्त्रीलिंग है: हरा → हरी.'], 'हरी घास'),
    ex('"ऊँचा पेड़" में विशेषण कौन-सा है?', ['पेड़ कैसा है? ऊँचा.'], 'ऊँचा'),
  ],
  rows: [
    ['लाल', 'red', 'laal'], ['हरा', 'green', 'haraa'], ['पीला', 'yellow', 'peelaa'], ['नीला', 'blue', 'neelaa'], ['सफ़ेद', 'white', 'safed'], ['काला', 'black', 'kaalaa'], ['गुलाबी', 'pink', 'gulaabee'], ['नारंगी', 'orange', 'naarangee'],
  ],
  ask: 'यह कौन-सा रंग है? (which colour?)', detAsk: 'इसे कैसे पढ़ेंगे? (how is it read?)', noTap: true,
  hints: ['उद्यान की चीज़ें याद कीजिए: घास, आसमान, गुलाब…', 'तेलुगु रंग से मिलाइए.'],
  extra: [mcq('kaisa', 'चीज़ का असली रंग सोचिए (think of the real colour).', [
    ['तोता किस रंग का होता है?', 'हरा', ['काला', 'सफ़ेद', 'नीला'], 'parrot.', 'तोता हरा होता है.'],
    ['आसमान किस रंग का होता है?', 'नीला', ['लाल', 'हरा', 'काला'], 'दिन का आसमान.', 'आसमान नीला होता है.'],
    ['दूध किस रंग का होता है?', 'सफ़ेद', ['पीला', 'लाल', 'काला'], 'milk.', 'दूध सफ़ेद होता है.'],
    ['कौआ किस रंग का होता है?', 'काला', ['सफ़ेद', 'हरा', 'गुलाबी'], 'crow.', 'कौआ काला होता है.'],
    ['पका केला किस रंग का होता है?', 'पीला', ['नीला', 'काला', 'लाल'], 'ripe banana.', 'पका केला पीला होता है.'],
    ['टमाटर किस रंग का होता है?', 'लाल', ['नीला', 'सफ़ेद', 'काला'], 'tomato.', 'पका टमाटर लाल होता है.'],
  ])],
}), 'Essay summarised at theme level (a garden / park); confirm against the printed essay.');

// =====================================================================================
// पाठ 12 — बच्चे चले क्रिकेट खेलने (कहानी) — language: है / हैं / हूँ / हो
// =====================================================================================
const ch12 = unit({
  no: 12, topic: 'cricket', hi: 'बच्चे चले क्रिकेट खेलने', roman: 'bachche chale kriket khelne', gloss: GLOSS['बच्चे चले क्रिकेट खेलने'],
  vidha: 'कहानी', vidhaInfo: 'पात्रों और घटनाओं के साथ कही गई बात, जिसका शुरुआत, बीच और अंत होता है (a story — characters, events, beginning-middle-end).',
  theme: THEMES[11],
  gist: [
    'इस कहानी में कुछ बच्चे मिलकर क्रिकेट खेलने जाते हैं (some children set off to play cricket).',
    'वे टीम बनाते हैं, बल्ला-गेंद और विकेट जुटाते हैं; खेल में कुछ मुश्किलें भी आती हैं (they form teams, gather bat, ball, wickets; some difficulties come up).',
    'बच्चे मिल-जुलकर, नियम से खेलते हैं और सीखते हैं कि हार-जीत से ज़्यादा ज़रूरी है साथ खेलना (they play fair and learn that playing together matters more than winning).',
  ],
  message: 'खेल में टीम भावना, ईमानदारी और नियम ज़रूरी हैं; हार-जीत को खुशी से स्वीकार करें (team spirit, honesty and rules matter; accept win or loss happily).',
  facts: [
    ['क्रिकेट में गेंद को किससे मारते हैं?', 'बल्ला (bat)', ['जाल', 'रस्सी', 'छाता'], 'तेलुगु: బ్యాట్.', 'क्रिकेट में बल्ले से गेंद मारते हैं.'],
    ['क्रिकेट टीम में कितने खिलाड़ी होते हैं?', 'ग्यारह (11)', ['पाँच', 'सात', 'बीस'], 'एक टीम = 11.', 'क्रिकेट टीम में ग्यारह खिलाड़ी होते हैं.'],
    ['टीम के नेता को क्या कहते हैं?', 'कप्तान (captain)', ['माली', 'कुली', 'दुकानदार'], 'टीम को चलाता है.', 'टीम का नेता कप्तान होता है.'],
  ],
  trueF: ['बच्चे मिलकर क्रिकेट खेलते हैं।', 'यह पाठ एक कहानी है।'],
  falseF: ['कहानी सिखाती है कि हारने पर झगड़ा करना चाहिए।', 'यह पाठ एक निबंध है।'],
},
vocab('cricket', 'बच्चे चले क्रिकेट खेलने', [
  ['बल्ला', 'ballaa', 'bat (బ్యాట్)'], ['गेंद', 'gend', 'ball (బంతి)'], ['टीम', 'teem', 'team (జట్టు)'], ['कप्तान', 'kaptaan', 'captain (నాయకుడు)'],
  ['खिलाड़ी', 'khilaadee', 'player (ఆటగాడు)'], ['जीतना', 'jeetanaa', 'to win (గెలుచు)'], ['हारना', 'haaranaa', 'to lose (ఓడిపోవు)'], ['नियम', 'niyam', 'rule (నియమం)'],
]),
gram({
  id: 'ts6.hi.cricket.vakya', title: 'सरल वाक्य: है, हैं, हूँ, हो (simple sentences)',
  intro: [
    def('हूँ', info('हूँ')), def('है', info('है')), def('हैं', info('हैं')), def('हो', info('हो')),
    remember('मैं → हूँ | तुम → हो | वह / यह / एक नाम → है | हम / आप / वे / बहुवचन → हैं'),
    tip('वाक्य का पहला शब्द (कर्ता) देखिए, फिर सही शब्द चुनिए (look at the subject first).'),
  ],
  examples: [
    ex('"मैं कप्तान ___।" — सही शब्द?', ['कर्ता: मैं.', 'मैं → हूँ.'], 'मैं कप्तान हूँ। (I am the captain.)'),
    ex('"बच्चे मैदान में ___।" — सही शब्द?', ['कर्ता: बच्चे (बहुवचन).', 'बहुवचन → हैं.'], 'बच्चे मैदान में हैं। (The children are in the ground.)'),
  ],
  rows: [
    ['मैं खिलाड़ी ___।', 'हूँ', 'मैं खिलाड़ी हूँ — I am a player'], ['मैं तैयार ___।', 'हूँ', 'मैं तैयार हूँ — I am ready'], ['मैं कप्तान ___।', 'हूँ', 'मैं कप्तान हूँ — I am the captain'],
    ['वह गेंद फेंकता ___।', 'है', 'वह गेंद फेंकता है — he throws the ball'], ['यह मेरा बल्ला ___।', 'है', 'यह मेरा बल्ला है — this is my bat'], ['रवि मैदान में ___।', 'है', 'रवि मैदान में है — Ravi is in the ground'],
    ['बच्चे खेल रहे ___।', 'हैं', 'बच्चे खेल रहे हैं — children are playing'], ['हम एक टीम ___।', 'हैं', 'हम एक टीम हैं — we are a team'], ['आप हमारे अध्यापक ___।', 'हैं', 'आप हमारे अध्यापक हैं — you are our teacher'],
    ['तुम कहाँ ___?', 'हो', 'तुम कहाँ हो — where are you'], ['तुम अच्छे खिलाड़ी ___।', 'हो', 'तुम अच्छे खिलाड़ी हो — you are a good player'], ['तुम तैयार ___?', 'हो', 'तुम तैयार हो — are you ready'],
  ],
  ask: 'खाली जगह में सही शब्द चुनिए (fill the blank).', detAsk: 'पूरा वाक्य और उसका अर्थ कौन-सा है? (full sentence and meaning)',
  hints: ['वाक्य का पहला शब्द (कर्ता) पढ़िए.', 'मैं → हूँ, तुम → हो, वह/यह → है, हम/आप/बच्चे → हैं.'],
}), 'Story summarised at theme level (children going to play cricket, team spirit); confirm plot details against the printed story.');

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12];
