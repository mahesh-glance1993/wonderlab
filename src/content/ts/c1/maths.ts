// Telangana SCERT Class 1 — maths. Original teaching aligned to the official chapter list (src/content/ts/books.ts).
// One unit per textbook chapter (ids ts1.ma.ch<n>); objectives ts1.ma.<topic>.<skill>.
// Written for a 6-year-old: tiny sentences, real pictured objects to count, gentle praise. Every learner-facing
// string is bilingual ('English|Telugu' via T()). Templates use only the Rng they are given.
import {
  tp, ex, p, h, tip, vis, stepsB, keys, remember, photo, L, num, choose, chooseNum, matching, ordering, tapAll,
  NAMES, range, type USpec, type QSpec, type TSpec,
} from '../../lib/kit';
import type { Rng } from '../../../shared/grading';
import type { Choice, Localized, VisualSpec } from '../../../shared/content';
import { tsSrc } from '../books';

// ------------------------------------------------------------------ helpers
type Lc = Localized;
const src = (ch: number) => tsSrc(1, 'maths', ch);
/** 'English|Telugu' → Localized. Throws when the Telugu half is missing, so no string slips through untranslated. */
const T = (s: string): Lc => {
  const i = s.indexOf('|');
  if (i < 0) throw new Error(`missing Telugu: ${s}`);
  return L(s.slice(0, i).trim(), s.slice(i + 1).trim());
};
const same = (x: string | number): Lc => L(String(x), String(x));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const P = (s: string) => { const x = T(s); return p(x.en, x.te); };
const H = (s: string) => { const x = T(s); return h(x.en, x.te); };
const TIP = (s: string) => { const x = T(s); return tip(x.en, x.te); };
const REM = (s: string) => { const x = T(s); return remember(x.en, x.te); };
const PH = (e: string, s: string) => photo(e, T(s));
const V = (v: VisualSpec, s: string) => { const x = T(s); return vis(v, x.en, x.te); };
const ST = (...s: string[]) => stepsB(...s.map(T));
const KP = (...s: string[]) => keys(...s.map(T));
const EX = (q: string, steps: string[], a: string, v?: VisualSpec) => ex(T(q), steps.map(T), T(a), v);

const obj = (emoji: string, count: number, groupsOf?: number): VisualSpec => (groupsOf ? { kind: 'objects', emoji, count, groupsOf } : { kind: 'objects', emoji, count });
const emo = (text: string): VisualSpec => ({ kind: 'emoji', text });
const line = (from: number, to: number, marks?: number[], jumps?: [number, number][], step = 1): VisualSpec => {
  const v: VisualSpec = { kind: 'number-line', from, to, step };
  if (marks) v.marks = marks;
  if (jumps) v.jumps = jumps;
  return v;
};
const shape = (s: 'circle' | 'square' | 'triangle' | 'rectangle', color?: string): VisualSpec => (color ? { kind: 'shape', shape: s, color } : { kind: 'shape', shape: s });

type Mk = [when: string, explain: string][];
const mk = (m: Mk) => (m.length ? { mistakes: m.map(([when, e]) => ({ when, explain: T(e) })) } : {});
const GENERIC: [string, string] = ['wrong-value', 'Not yet! Count again slowly. You can do it.|ఇంకా కాలేదు! మెల్లగా మళ్ళీ లెక్కించు. నువ్వు చేయగలవు.'];
/** typed numeric answer; a gentle generic mistake note is always added */
const typed = (prompt: string, value: number, hints: string[], sol: string[], m: Mk = [], extra: Partial<QSpec> = {}): QSpec => ({
  type: 'typed', keypad: 'numeric', prompt: T(prompt), answer: num(value), hints: hints.map(T), solution: sol.map(T), ...mk([...m.filter(([w]) => w !== String(value)), GENERIC]), ...extra,
});
const countQ = (prompt: string, value: number, visual: VisualSpec, hints: string[], sol: string[], m: Mk = []): QSpec => ({
  ...typed(prompt, value, hints, sol, m), type: 'count', visual,
});
const mcq = (r: Rng, prompt: string, correct: string, wrong: string[], hints: string[], sol: string[], m: Mk = [], extra: Partial<QSpec> = {}): QSpec => ({
  type: 'mcq', prompt: T(prompt), ...choose(r, T(correct), wrong.map(T)), hints: hints.map(T), solution: sol.map(T), ...mk(m), ...extra,
});
const mcqN = (r: Rng, prompt: string, correct: number, wrong: number[], hints: string[], sol: string[], m: Mk = [], extra: Partial<QSpec> = {}): QSpec => ({
  type: 'mcq', prompt: T(prompt), ...chooseNum(r, correct, wrong.filter((w) => w >= 0)), hints: hints.map(T), solution: sol.map(T), ...mk(m), ...extra,
});
/** picture choices labelled A, B, C… in the order shown (labels never give the answer away) */
const picChoices = (items: { v: VisualSpec; ok: boolean }[]): { choices: Choice[]; answer: { kind: 'choice'; correct: string } } => {
  const choices: Choice[] = items.map((it, i) => ({ id: 'abcd'[i], label: same('ABCD'[i]), visual: it.v }));
  return { choices, answer: { kind: 'choice', correct: choices[items.findIndex((it) => it.ok)].id } };
};

/** concept bank entry: question, answer, wrong options, hint, solution, why-wrong, optional picture */
type B = [q: string, a: string, w: string[], hint: string, sol: string, why: string, v?: VisualSpec];
const bank = (key: string, list: B[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, a, w, hint, sol, why, v] = r.pick(list);
  return mcq(r, q, a, w, [hint], [sol], [['wrong', why]], v ? { visual: v } : {});
}, d);
/** tap-all template: picks 2–3 correct and 2–3 wrong items from the pools */
const tapT = (key: string, prompt: string, yes: string[], no: string[], hints: string[], why: string): TSpec => tp(key, (r) => {
  const y = r.shuffle(yes).slice(0, r.int(2, 3)).map(T), n = r.shuffle(no).slice(0, r.int(2, 3)).map(T);
  return {
    type: 'tap', prompt: T(prompt), ...tapAll(r, [...y.map((label) => ({ label, ok: true })), ...n.map((label) => ({ label, ok: false }))]),
    hints: hints.map(T),
    solution: [L(`Yes: ${y.map((x) => x.en).join(', ')}. No: ${n.map((x) => x.en).join(', ')}.`, `అవును: ${y.map((x) => x.te).join(', ')}. కాదు: ${n.map((x) => x.te).join(', ')}.`)],
    mistakes: [{ when: 'wrong', explain: T(why) }],
  };
});
/** compare two pictured things; `a` is the one that is "more" (bigger, taller, heavier…) */
type Pair = [a: string, b: string, ea: string, eb: string];
const pairT = (key: string, pairs: Pair[], more: string, less: string, hint: string, why: string): TSpec => tp(key, (r) => {
  const [a, b, ea, eb] = r.pick(pairs);
  const A = T(a), Bq = T(b), M = T(more), Ls = T(less);
  const askMore = r.int(0, 1) === 0;
  const word = askMore ? M : Ls, ans = askMore ? A : Bq;
  const flip = r.int(0, 1) === 0;
  const first = flip ? Bq : A, second = flip ? A : Bq;
  const items = flip ? [{ label: Bq, v: obj(eb, 1), ok: !askMore }, { label: A, v: obj(ea, 1), ok: askMore }] : [{ label: A, v: obj(ea, 1), ok: askMore }, { label: Bq, v: obj(eb, 1), ok: !askMore }];
  const choices: Choice[] = items.map((it, i) => ({ id: 'ab'[i], label: it.label, visual: it.v }));
  return {
    type: 'spoken', prompt: L(`Which is ${word.en}: ${first.en} or ${second.en}?`, `${first.te}, ${second.te} — వీటిలో ఏది ${word.te}?`),
    choices, answer: { kind: 'choice', correct: choices[items.findIndex((it) => it.ok)].id },
    hints: [T(hint)], mistakes: [{ when: 'wrong', explain: T(why) }],
    solution: [L(`${cap(ans.en)} is ${word.en}.`, `${ans.te} ${word.te}.`)],
  };
});

// things to count — every emoji here has a real photograph in the picture library
type Thing = { en: string; te: string; e: string };
const OBJ: Thing[] = [
  { en: 'mangoes', te: 'మామిడి పండ్లు', e: '🥭' }, { en: 'bananas', te: 'అరటి పండ్లు', e: '🍌' }, { en: 'apples', te: 'ఆపిల్ పండ్లు', e: '🍎' },
  { en: 'balloons', te: 'బెలూన్లు', e: '🎈' }, { en: 'flowers', te: 'పువ్వులు', e: '🌼' }, { en: 'kites', te: 'గాలిపటాలు', e: '🪁' },
  { en: 'fish', te: 'చేపలు', e: '🐟' }, { en: 'birds', te: 'పక్షులు', e: '🐦' }, { en: 'tomatoes', te: 'టమాటాలు', e: '🍅' },
  { en: 'carrots', te: 'క్యారెట్లు', e: '🥕' }, { en: 'eggs', te: 'గుడ్లు', e: '🥚' }, { en: 'pencils', te: 'పెన్సిళ్ళు', e: '✏️' },
  { en: 'oranges', te: 'నారింజ పండ్లు', e: '🍊' }, { en: 'butterflies', te: 'సీతాకోకచిలుకలు', e: '🦋' }, { en: 'shells', te: 'గవ్వలు', e: '🐚' },
  { en: 'lamps', te: 'దీపాలు', e: '🪔' }, { en: 'coconuts', te: 'కొబ్బరికాయలు', e: '🥥' }, { en: 'hens', te: 'కోళ్ళు', e: '🐔' },
];
const nm = (r: Rng) => r.pick(NAMES);

// number names
const EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_T = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const TE = ['సున్నా', 'ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది', 'పది', 'పదకొండు', 'పన్నెండు', 'పదమూడు', 'పద్నాలుగు', 'పదిహేను', 'పదహారు', 'పదిహేడు', 'పద్దెనిమిది', 'పందొమ్మిది'];
const TE_T = ['', 'పది', 'ఇరవై', 'ముప్పై', 'నలభై', 'యాభై', 'అరవై', 'డెబ్బై', 'ఎనభై', 'తొంభై'];
const enW = (n: number) => (n === 100 ? 'one hundred' : n < 20 ? EN[n] : EN_T[Math.floor(n / 10)] + (n % 10 ? '-' + EN[n % 10] : ''));
const teW = (n: number) => (n === 100 ? 'వంద' : n < 20 ? TE[n] : TE_T[Math.floor(n / 10)] + (n % 10 ? ' ' + TE[n % 10] : ''));
const word = (n: number) => `${enW(n)}|${teW(n)}`;
const nn = (n: number) => `${n}|${n}`;
const upTo = (a: number, b: number) => range(a, b).join(', ');

// ================================================================== CH 1 Pre-Mathematical Concepts
const BIG: Pair[] = [
  ['an elephant|ఏనుగు', 'a mouse|ఎలుక', '🐘', '🐭'], ['a cow|ఆవు', 'a hen|కోడి', '🐄', '🐔'], ['a watermelon|పుచ్చకాయ', 'a grape|ద్రాక్ష పండు', '🍉', '🍇'],
  ['a bus|బస్సు', 'a bicycle|సైకిల్', '🚌', '🚲'], ['a house|ఇల్లు', 'a chair|కుర్చీ', '🏠', '🪑'], ['a coconut|కొబ్బరికాయ', 'an egg|గుడ్డు', '🥥', '🥚'],
  ['a lion|సింహం', 'a cat|పిల్లి', '🦁', '🐱'], ['a camel|ఒంటె', 'a goat|మేక', '🐪', '🐐'],
];
const TALL: Pair[] = [
  ['a giraffe|జిరాఫీ', 'a goat|మేక', '🦒', '🐐'], ['a coconut tree|కొబ్బరి చెట్టు', 'a small plant|చిన్న మొక్క', '🌴', '🌱'], ['a tall building|ఎత్తైన భవనం', 'a hut-like house|చిన్న ఇల్లు', '🏢', '🏠'],
  ['a father|నాన్న', 'a baby|పాపాయి', '👨', '👶'], ['a tree|చెట్టు', 'a flower|పువ్వు', '🌳', '🌼'], ['a camel|ఒంటె', 'a dog|కుక్క', '🐪', '🐕'], ['a mountain|కొండ', 'a house|ఇల్లు', '⛰️', '🏠'],
];
const HEAVY: Pair[] = [
  ['an elephant|ఏనుగు', 'an ant|చీమ', '🐘', '🐜'], ['a watermelon|పుచ్చకాయ', 'a grape|ద్రాక్ష పండు', '🍉', '🍇'], ['a big stone|పెద్ద రాయి', 'a leaf|ఆకు', '🪨', '🍃'],
  ['a school bag full of books|పుస్తకాల బడి సంచి', 'a pencil|పెన్సిల్', '🎒', '✏️'], ['a coconut|కొబ్బరికాయ', 'a flower|పువ్వు', '🥥', '🌼'], ['a bucket of water|నీళ్ళ బకెట్', 'a balloon|బెలూన్', '🪣', '🎈'],
  ['a brick|ఇటుక', 'a feather|ఈక', '🧱', '🪶'], ['a cow|ఆవు', 'a hen|కోడి', '🐄', '🐔'],
];
const OPP: [string, string][] = [
  ['big|పెద్ద', 'small|చిన్న'], ['tall|ఎత్తు', 'short|పొట్టి'], ['near|దగ్గర', 'far|దూరం'], ['inside|లోపల', 'outside|బయట'],
  ['heavy|బరువు', 'light|తేలిక'], ['more|ఎక్కువ', 'less|తక్కువ'], ['above|పైన', 'below|కింద'], ['first|మొదట', 'last|చివర'],
];
const ch1: USpec = {
  id: 'ts1.ma.ch1', subject: 'math', title: T('Pre-Mathematical Concepts|గణిత పూర్వ భావనలు'), source: src(1),
  objectives: [
    {
      id: 'ts1.ma.pre.size', title: T('Big and small, tall and short|పెద్దది-చిన్నది, ఎత్తు-పొట్టి'),
      activities: ['game:logic'],
      intro: [
        H('Look and compare|చూసి పోల్చు'),
        P('Look at an elephant and a mouse.|ఏనుగును, ఎలుకను చూడు.'),
        PH('🐘', 'An elephant is very big.|ఏనుగు చాలా పెద్దది.'),
        PH('🐭', 'A mouse is very small.|ఎలుక చాలా చిన్నది.'),
        P('The elephant is big. The mouse is small.|ఏనుగు పెద్దది. ఎలుక చిన్నది.'),
        PH('🦒', 'A giraffe is tall. Its neck is long!|జిరాఫీ ఎత్తుగా ఉంటుంది. దాని మెడ పొడవు!'),
        P('A giraffe is tall. A goat is short.|జిరాఫీ ఎత్తు. మేక పొట్టి.'),
        V(emo('🚆🚆🚆🚆  🚲'), 'A long train and a short bicycle|పొడవైన రైలు, పొట్టి సైకిల్'),
        KP('Big — small|పెద్ద — చిన్న', 'Tall — short|ఎత్తు — పొట్టి', 'Long — short|పొడవు — పొట్టి'),
        TIP('Stand next to a friend. Who is taller? Who is shorter?|నీ స్నేహితుడి పక్కన నిలబడు. ఎవరు ఎత్తు? ఎవరు పొట్టి?'),
      ],
      examples: [
        EX('Which is bigger: a cow or a hen?|ఆవు, కోడి — ఏది పెద్దది?', ['Think of them side by side.|రెండింటినీ పక్కపక్కన ఊహించు.', 'The cow is much bigger than the hen.|ఆవు కోడి కంటే చాలా పెద్దది.'], 'The cow|ఆవు', emo('🐄 🐔')),
        EX('Which is taller: a coconut tree or a small plant?|కొబ్బరి చెట్టు, చిన్న మొక్క — ఏది ఎత్తు?', ['A coconut tree grows higher than a house.|కొబ్బరి చెట్టు ఇంటి కంటే ఎత్తుగా పెరుగుతుంది.', 'A small plant is near the ground.|చిన్న మొక్క నేలకు దగ్గరగా ఉంటుంది.'], 'The coconut tree|కొబ్బరి చెట్టు', emo('🌴 🌱')),
      ],
      practice: [
        pairT('big', BIG, 'bigger|పెద్దది', 'smaller|చిన్నది', 'Think of both things side by side.|రెండింటినీ పక్కపక్కన ఊహించు.', 'Listen again: is the question asking for the bigger one or the smaller one?|మళ్ళీ విను: ప్రశ్న పెద్దదాన్ని అడుగుతోందా, చిన్నదాన్నా?'),
        pairT('tall', TALL, 'taller|ఎత్తైనది', 'shorter|పొట్టిది', 'Which one reaches higher up?|ఏది ఎక్కువ పైకి ఉంటుంది?', 'Look at the top of each one. The taller one goes higher.|ప్రతి దాని పై భాగాన్ని చూడు. ఎత్తైనది ఎక్కువ పైకి ఉంటుంది.'),
      ],
    },
    {
      id: 'ts1.ma.pre.more', title: T('More and less, heavy and light|ఎక్కువ-తక్కువ, బరువు-తేలిక'), prereqs: ['ts1.ma.pre.size'],
      activities: ['game:balance'],
      intro: [
        H('Which has more?|దేనిలో ఎక్కువ?'),
        P('Meena has 5 mangoes. Ravi has 2 mangoes.|మీనా దగ్గర 5 మామిడి పండ్లు ఉన్నాయి. రవి దగ్గర 2 ఉన్నాయి.'),
        V(obj('🥭', 5), 'Meena: five mangoes|మీనా: ఐదు మామిడి పండ్లు'),
        V(obj('🥭', 2), 'Ravi: two mangoes|రవి: రెండు మామిడి పండ్లు'),
        P('Meena has more. Ravi has less.|మీనా దగ్గర ఎక్కువ. రవి దగ్గర తక్కువ.'),
        TIP('Match one with one. The group with some left over has more.|ఒకదానికి ఒకటి జత చేయి. మిగిలినవి ఉన్న గుంపులో ఎక్కువ.'),
        H('Heavy or light?|బరువా తేలికా?'),
        PH('🪨', 'A big stone is heavy. It is hard to lift.|పెద్ద రాయి బరువు. దాన్ని ఎత్తడం కష్టం.'),
        PH('🪶', 'A feather is light. It floats in the air.|ఈక తేలిక. అది గాలిలో తేలుతుంది.'),
        REM('Big things are often heavy, but not always! A big balloon is light.|పెద్దవి చాలాసార్లు బరువుగా ఉంటాయి, కానీ ఎప్పుడూ కాదు! పెద్ద బెలూన్ తేలిక.'),
      ],
      examples: [
        EX('Plate A has 3 bananas. Plate B has 6 bananas. Which plate has more?|పళ్ళెం A లో 3 అరటి పండ్లు, పళ్ళెం B లో 6 ఉన్నాయి. ఏ పళ్ళెంలో ఎక్కువ?', ['Count A: 1, 2, 3.|A ను లెక్కించు: 1, 2, 3.', 'Count B: 1, 2, 3, 4, 5, 6.|B ను లెక్కించు: 1, 2, 3, 4, 5, 6.', '6 is more than 3.|3 కంటే 6 ఎక్కువ.'], 'Plate B|పళ్ళెం B', emo('🍌🍌🍌   |   🍌🍌🍌🍌🍌🍌')),
        EX('Which is heavier: a bag full of books or a feather?|పుస్తకాల సంచి, ఈక — ఏది బరువు?', ['Lift the bag: your arm feels a pull.|సంచి ఎత్తితే చేయి కిందికి లాగుతుంది.', 'A feather feels like nothing.|ఈక ఏమీ లేనట్లు అనిపిస్తుంది.'], 'The bag of books|పుస్తకాల సంచి', emo('🎒 🪶')),
      ],
      practice: [
        tp('group', (r) => {
          const t = r.pick(OBJ);
          const a = r.int(1, 9);
          let b = r.int(1, 9);
          if (b === a) b = a === 9 ? 4 : a + r.int(1, 9 - a);
          const askMore = r.int(0, 1) === 0;
          const ok = askMore ? (a > b ? 0 : 1) : (a < b ? 0 : 1);
          const w = askMore ? 'more|ఎక్కువ' : 'fewer|తక్కువ';
          const W = T(w);
          return {
            type: 'mcq', prompt: L(`Which group has ${W.en} ${t.en}?`, `ఏ గుంపులో ${t.te} ${W.te} ఉన్నాయి?`),
            ...picChoices([{ v: obj(t.e, a), ok: ok === 0 }, { v: obj(t.e, b), ok: ok === 1 }]),
            hints: [T('Count group A. Then count group B.|గుంపు A ను లెక్కించు. తర్వాత గుంపు B ను లెక్కించు.'), T('The bigger number means more.|పెద్ద సంఖ్య అంటే ఎక్కువ.')],
            mistakes: [{ when: 'wrong', explain: T('Count again slowly, touching each one.|మెల్లగా ఒక్కొక్కటి తాకుతూ మళ్ళీ లెక్కించు.') }],
            solution: [L(`Group A has ${a}. Group B has ${b}. Group ${'AB'[ok]} has ${W.en}.`, `గుంపు A లో ${a}. గుంపు B లో ${b}. గుంపు ${'AB'[ok]} లో ${W.te}.`)],
          };
        }),
        pairT('heavy', HEAVY, 'heavier|బరువైనది', 'lighter|తేలికైనది', 'Imagine lifting each one.|ఒక్కొక్కటి ఎత్తుతున్నట్టు ఊహించు.', 'Heavy things are hard to lift. Light things are easy to lift.|బరువైనవి ఎత్తడం కష్టం. తేలికైనవి ఎత్తడం సులువు.'),
      ],
    },
    {
      id: 'ts1.ma.pre.where', title: T('Where is it? Near, far, inside, outside|ఎక్కడ ఉంది? దగ్గర, దూరం, లోపల, బయట'), prereqs: ['ts1.ma.pre.size'],
      intro: [
        H('Where words|ఎక్కడ అని చెప్పే మాటలు'),
        P('Some words tell us where things are.|కొన్ని మాటలు వస్తువులు ఎక్కడ ఉన్నాయో చెబుతాయి.'),
        KP('Above — below|పైన — కింద', 'Inside — outside|లోపల — బయట', 'Near — far|దగ్గర — దూరం', 'First — last|మొదట — చివర'),
        V(emo('☁️\n🐦\n🌳'), 'A cloud above a bird, a bird above a tree|పక్షి పైన మేఘం, చెట్టు పైన పక్షి'),
        PH('🧺', 'Put a ball inside this basket. Now take it outside.|ఈ బుట్ట లోపల బంతి పెట్టు. ఇప్పుడు బయటకు తీయి.'),
        PH('🌙', 'The moon is far, far away from us.|చందమామ మనకు చాలా చాలా దూరం.'),
        TIP('Play a game: put your pencil on, under, inside and near your box.|ఆట ఆడు: నీ పెన్సిల్‌ను డబ్బా మీద, కింద, లోపల, దగ్గర పెట్టు.'),
      ],
      examples: [
        EX('The fish swims in the bowl of water. Is it inside or outside the bowl?|చేప గిన్నెలోని నీటిలో ఈదుతోంది. అది గిన్నె లోపలా, బయటా?', ['"In the bowl" means inside it.|"గిన్నెలో" అంటే గిన్నె లోపల.'], 'Inside|లోపల', obj('🐟', 1)),
        EX('Your bag is right beside you. The school is across the town. Which is near?|నీ సంచి నీ పక్కనే ఉంది. బడి ఊరి అవతల ఉంది. ఏది దగ్గర?', ['Beside you means you can touch it.|పక్కనే అంటే తాకగలవు.', 'To reach the school, you walk a long way.|బడికి చాలా దూరం నడవాలి.'], 'The bag|సంచి'),
      ],
      practice: [
        bank('where', [
          ['The bird sits on top of the tree. Where is the bird?|పక్షి చెట్టు మీద కూర్చుంది. పక్షి ఎక్కడ ఉంది?', 'Above the tree|చెట్టు పైన', ['Below the tree|చెట్టు కింద', 'Inside the tree|చెట్టు లోపల'], 'On top means higher up.|మీద అంటే పైన.', 'The bird is above the tree.|పక్షి చెట్టు పైన ఉంది.', 'On top of something means above it.|దేని మీదైనా ఉంటే దాని పైన ఉన్నట్టు.', emo('🐦\n🌳')],
          ['The cat sleeps under the bed. Where is the cat?|పిల్లి మంచం కింద నిద్రపోతోంది. పిల్లి ఎక్కడ?', 'Below the bed|మంచం కింద', ['Above the bed|మంచం పైన', 'Far from the bed|మంచానికి దూరంగా'], 'Under means lower down.|"అడుగున" అంటే కింద.', 'The cat is below the bed.|పిల్లి మంచం కింద ఉంది.', 'Under and below mean the same.|"అడుగున", "కింద" ఒకటే అర్థం.', emo('🛏️\n🐱')],
          ['The pencils are in a closed box. Where are the pencils?|పెన్సిళ్ళు మూసిన డబ్బాలో ఉన్నాయి. అవి ఎక్కడ?', 'Inside the box|డబ్బా లోపల', ['Outside the box|డబ్బా బయట', 'On the box|డబ్బా మీద'], 'The box is closed. We cannot see them.|డబ్బా మూసి ఉంది. అవి కనిపించవు.', 'The pencils are inside the box.|పెన్సిళ్ళు డబ్బా లోపల ఉన్నాయి.', '"In the box" means inside.|"డబ్బాలో" అంటే లోపల.', emo('📦')],
          ['The cow is eating grass in the field, not in the shed. Where is the cow?|ఆవు పాకలో కాదు, పొలంలో గడ్డి మేస్తోంది. ఆవు ఎక్కడ?', 'Outside the shed|పాక బయట', ['Inside the shed|పాక లోపల', 'On the shed|పాక మీద'], 'It is not in the shed.|అది పాకలో లేదు.', 'The cow is outside the shed.|ఆవు పాక బయట ఉంది.', 'Not in means outside.|లోపల లేకపోతే బయట ఉన్నట్టు.', obj('🐄', 1)],
          ['Kiran holds his mother\'s hand. Is he near her or far from her?|కిరణ్ అమ్మ చేయి పట్టుకున్నాడు. అతను అమ్మకు దగ్గరా, దూరమా?', 'Near|దగ్గర', ['Far|దూరం'], 'Can he touch her?|అతను అమ్మను తాకగలడా?', 'Kiran is near his mother.|కిరణ్ అమ్మకు దగ్గరగా ఉన్నాడు.', 'If you can touch it, it is near.|తాకగలిగితే దగ్గర.'],
          ['The sun is high in the sky. Is it near us or far from us?|సూర్యుడు ఆకాశంలో ఎత్తులో ఉన్నాడు. మనకు దగ్గరా, దూరమా?', 'Far|దూరం', ['Near|దగ్గర'], 'Can you ever reach the sun?|సూర్యుడిని ఎప్పుడైనా అందుకోగలమా?', 'The sun is very far from us.|సూర్యుడు మనకు చాలా దూరం.', 'Things in the sky are far away.|ఆకాశంలోనివి చాలా దూరంగా ఉంటాయి.', emo('☀️')],
          ['Ravi, Sita and Arjun stand in a line, in that order. Who is first?|రవి, సీత, అర్జున్ ఇదే వరుసలో నిలబడ్డారు. మొదట ఎవరు?', 'Ravi|రవి', ['Sita|సీత', 'Arjun|అర్జున్'], 'First is at the front of the line.|మొదట అంటే వరుసలో ముందు.', 'Ravi is first.|రవి మొదట ఉన్నాడు.', 'The first one comes before all the others.|మొదటివారు అందరి కంటే ముందు ఉంటారు.'],
          ['Ravi, Sita and Arjun stand in a line, in that order. Who is last?|రవి, సీత, అర్జున్ ఇదే వరుసలో నిలబడ్డారు. చివర ఎవరు?', 'Arjun|అర్జున్', ['Ravi|రవి', 'Sita|సీత'], 'Last is at the end of the line.|చివర అంటే వరుసలో ఆఖరు.', 'Arjun is last.|అర్జున్ చివర ఉన్నాడు.', 'The last one has nobody after them.|చివరివారి తర్వాత ఎవరూ ఉండరు.'],
        ]),
        tp('opp', (r) => {
          const set = r.shuffle(OPP).slice(0, 3).map(([a, b]) => [T(a), T(b)] as [Lc, Lc]);
          return {
            type: 'match', prompt: L(`Match each word to its opposite: ${set.map((s) => s[0].en).join(', ')}.`, `ప్రతి మాటను దాని వ్యతిరేక పదంతో జత చేయి: ${set.map((s) => s[0].te).join(', ')}.`),
            ...matching(r, set),
            hints: [T('Opposite means the other way.|వ్యతిరేకం అంటే మరో వైపు.'), T('Big goes with small.|పెద్దకు వ్యతిరేకం చిన్న.')],
            mistakes: [{ when: 'wrong', explain: T('Say the two words with actions: up and down, in and out.|చేతులతో చూపిస్తూ చెప్పు: పైకి-కిందికి, లోపలికి-బయటికి.') }],
            solution: set.map(([a, b]) => L(`${a.en} ↔ ${b.en}`, `${a.te} ↔ ${b.te}`)),
          };
        }),
      ],
    },
  ],
};

// ================================================================== CH 2 Shapes
type Sh = 'circle' | 'square' | 'triangle' | 'rectangle';
const SH: Record<Sh, { w: string; sides: number }> = {
  circle: { w: 'circle|వృత్తం', sides: 0 }, square: { w: 'square|చతురస్రం', sides: 4 }, triangle: { w: 'triangle|త్రిభుజం', sides: 3 }, rectangle: { w: 'rectangle|దీర్ఘచతురస్రం', sides: 4 },
};
const SHAPES: Sh[] = ['circle', 'square', 'triangle', 'rectangle'];
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
const SH_WHY: Record<Sh, string> = {
  circle: 'A circle is round all the way. It has no corners.|వృత్తం పూర్తిగా గుండ్రం. దానికి మూలలు లేవు.',
  square: 'Count the sides: 4, and all are the same length. That is a square.|భుజాలు లెక్కించు: 4, అన్నీ సమానం. అది చతురస్రం.',
  triangle: 'Count the corners: 1, 2, 3. Three corners make a triangle.|మూలలు లెక్కించు: 1, 2, 3. మూడు మూలలు ఉంటే త్రిభుజం.',
  rectangle: 'It has 4 sides: 2 long and 2 short. That is a rectangle.|దీనికి 4 భుజాలు: 2 పొడవు, 2 పొట్టి. అది దీర్ఘచతురస్రం.',
};
const ch2: USpec = {
  id: 'ts1.ma.ch2', subject: 'math', title: T('Shapes|ఆకారాలు'), source: src(2),
  objectives: [
    {
      id: 'ts1.ma.shape.name', title: T('Circle, square, triangle, rectangle|వృత్తం, చతురస్రం, త్రిభుజం, దీర్ఘచతురస్రం'),
      activities: ['game:shapes', 'art:trace'],
      intro: [
        H('Meet four shapes|నాలుగు ఆకారాలను చూద్దాం'),
        V(shape('circle', '#f59e0b'), 'A circle is round. It has no corners.|వృత్తం గుండ్రంగా ఉంటుంది. దానికి మూలలు లేవు.'),
        V(shape('square', '#22c55e'), 'A square has 4 sides, all the same. It has 4 corners.|చతురస్రానికి 4 సమాన భుజాలు, 4 మూలలు.'),
        V(shape('triangle', '#ef4444'), 'A triangle has 3 sides and 3 corners.|త్రిభుజానికి 3 భుజాలు, 3 మూలలు.'),
        V(shape('rectangle', '#3b82f6'), 'A rectangle has 4 sides: 2 long and 2 short.|దీర్ఘచతురస్రానికి 4 భుజాలు: 2 పొడవు, 2 పొట్టి.'),
        PH('🪙', 'A coin is a circle.|నాణెం వృత్తాకారం.'),
        TIP('Run your finger along the edge. Count the corners as you go!|అంచు వెంట వేలితో తిరుగు. మూలలు లెక్కపెట్టు!'),
      ],
      examples: [
        EX('How many corners does a triangle have?|త్రిభుజానికి ఎన్ని మూలలు?', ['Touch each corner: 1, 2, 3.|ప్రతి మూలను తాకు: 1, 2, 3.'], '3 corners|3 మూలలు', shape('triangle')),
        EX('This shape has 2 long sides and 2 short sides. Square or rectangle?|ఈ ఆకారానికి 2 పొడవు, 2 పొట్టి భుజాలు ఉన్నాయి. చతురస్రమా, దీర్ఘచతురస్రమా?', ['In a square all sides are the same.|చతురస్రంలో అన్ని భుజాలు సమానం.', 'Here 2 sides are longer.|ఇక్కడ 2 భుజాలు పొడవు.'], 'A rectangle|దీర్ఘచతురస్రం', shape('rectangle')),
      ],
      practice: [
        tp('name', (r) => {
          const s = r.pick(SHAPES), c = r.pick(COLORS);
          return mcq(r, 'What is the name of this shape?|ఈ ఆకారం పేరు ఏమిటి?', SH[s].w, SHAPES.filter((x) => x !== s).map((x) => SH[x].w),
            ['Count its corners.|దాని మూలలు లెక్కించు.', 'Are the sides the same length?|భుజాలు సమానంగా ఉన్నాయా?'],
            [`${cap(T(SH[s].w).en)}. ${T(SH_WHY[s]).en}|${T(SH[s].w).te}. ${T(SH_WHY[s]).te}`], [['wrong', SH_WHY[s]]], { visual: shape(s, c) });
        }),
        tp('find', (r) => {
          const s = r.pick(SHAPES);
          const k = r.int(3, 4);
          const others = r.shuffle(SHAPES.filter((x) => x !== s)).slice(0, k - 1);
          const list = r.shuffle([s, ...others]);
          const W = T(SH[s].w);
          return {
            type: 'spoken', prompt: L(`Here are ${k} shapes. Tap the ${W.en}.`, `ఇక్కడ ${k} ఆకారాలు ఉన్నాయి. ${W.te} ను నొక్కు.`), ...picChoices(list.map((x) => ({ v: shape(x, r.pick(COLORS)), ok: x === s }))),
            hints: [T(SH_WHY[s])], mistakes: [{ when: 'wrong', explain: T(SH_WHY[s]) }],
            solution: [L(`Picture ${'ABCD'[list.indexOf(s)]} is the ${W.en}.`, `బొమ్మ ${'ABCD'[list.indexOf(s)]} ${W.te}.`)],
          };
        }),
      ],
    },
    {
      id: 'ts1.ma.shape.around', title: T('Shapes all around us|మన చుట్టూ ఆకారాలు'), prereqs: ['ts1.ma.shape.name'],
      activities: ['game:shapes'],
      intro: [
        P('Look around your home. Shapes are everywhere!|నీ ఇంట్లో చుట్టూ చూడు. ఆకారాలు ప్రతిచోటా ఉన్నాయి!'),
        PH('🛞', 'A wheel is a circle. It rolls!|చక్రం వృత్తం. అది దొర్లుతుంది!'),
        PH('🚪', 'A door is a rectangle.|తలుపు దీర్ఘచతురస్రం.'),
        PH('🎲', 'Each face of a dice is a square.|పాచికలోని ప్రతి ముఖం చతురస్రం.'),
        PH('🍕', 'A slice of pizza looks like a triangle.|పిజ్జా ముక్క త్రిభుజంలా ఉంటుంది.'),
        TIP('Find one thing of each shape in your classroom.|నీ తరగతి గదిలో ప్రతి ఆకారానికి ఒక వస్తువును వెతుకు.'),
      ],
      examples: [
        EX('What shape is a roti?|రొట్టె ఏ ఆకారంలో ఉంటుంది?', ['A roti is round.|రొట్టె గుండ్రంగా ఉంటుంది.', 'It has no corners.|దానికి మూలలు లేవు.'], 'A circle|వృత్తం'),
        EX('Count the triangles.|త్రిభుజాలను లెక్కించు.', ['Look only for the red triangles.|ఎరుపు త్రిభుజాలను మాత్రమే చూడు.', '1, 2, 3.|1, 2, 3.'], '3 triangles|3 త్రిభుజాలు', emo('🔺🔴🔺🟦🔺')),
      ],
      practice: [
        bank('thing', [
          ['What shape is a coin?|నాణెం ఏ ఆకారం?', 'Circle|వృత్తం', ['Square|చతురస్రం', 'Triangle|త్రిభుజం'], 'Is it round?|అది గుండ్రంగా ఉందా?', 'A coin is a circle.|నాణెం వృత్తం.', 'A coin is round with no corners.|నాణెం గుండ్రం, మూలలు లేవు.', obj('🪙', 1)],
          ['What shape is a door?|తలుపు ఏ ఆకారం?', 'Rectangle|దీర్ఘచతురస్రం', ['Circle|వృత్తం', 'Triangle|త్రిభుజం'], 'It has 2 long sides and 2 short sides.|దానికి 2 పొడవు, 2 పొట్టి భుజాలు.', 'A door is a rectangle.|తలుపు దీర్ఘచతురస్రం.', 'Look: the door is taller than it is wide.|చూడు: తలుపు వెడల్పు కంటే ఎత్తు ఎక్కువ.', obj('🚪', 1)],
          ['What shape is one face of a dice?|పాచికలోని ఒక ముఖం ఏ ఆకారం?', 'Square|చతురస్రం', ['Circle|వృత్తం', 'Triangle|త్రిభుజం'], 'All 4 sides are the same.|4 భుజాలూ సమానం.', 'A dice face is a square.|పాచిక ముఖం చతురస్రం.', 'Its 4 sides are all equal, so it is a square.|4 భుజాలు సమానం, కాబట్టి చతురస్రం.', obj('🎲', 1)],
          ['What shape is a slice of pizza?|పిజ్జా ముక్క ఏ ఆకారం?', 'Triangle|త్రిభుజం', ['Square|చతురస్రం', 'Circle|వృత్తం'], 'Count its corners.|దాని మూలలు లెక్కించు.', 'A pizza slice looks like a triangle.|పిజ్జా ముక్క త్రిభుజంలా ఉంటుంది.', 'It has 3 corners, so it is a triangle.|దానికి 3 మూలలు, కాబట్టి త్రిభుజం.', obj('🍕', 1)],
          ['What shape is a wheel?|చక్రం ఏ ఆకారం?', 'Circle|వృత్తం', ['Rectangle|దీర్ఘచతురస్రం', 'Triangle|త్రిభుజం'], 'Can it roll?|అది దొర్లుతుందా?', 'A wheel is a circle.|చక్రం వృత్తం.', 'Wheels are round so they can roll.|చక్రాలు గుండ్రం కాబట్టి దొర్లుతాయి.', obj('🛞', 1)],
          ['What shape is the cover of a book?|పుస్తకం అట్ట ఏ ఆకారం?', 'Rectangle|దీర్ఘచతురస్రం', ['Circle|వృత్తం', 'Triangle|త్రిభుజం'], '2 long sides, 2 short sides.|2 పొడవు, 2 పొట్టి భుజాలు.', 'A book cover is a rectangle.|పుస్తకం అట్ట దీర్ఘచతురస్రం.', 'It has 4 corners and 2 longer sides.|దానికి 4 మూలలు, 2 పొడవు భుజాలు.', obj('📕', 1)],
          ['What shape is a bangle?|గాజు ఏ ఆకారం?', 'Circle|వృత్తం', ['Square|చతురస్రం', 'Rectangle|దీర్ఘచతురస్రం'], 'Trace it with your finger.|వేలితో దాని చుట్టూ తిరుగు.', 'A bangle is a circle.|గాజు వృత్తం.', 'A bangle is round with no corners.|గాజు గుండ్రం, మూలలు లేవు.'],
          ['What shape is a window pane with 4 equal sides?|4 సమాన భుజాల కిటికీ అద్దం ఏ ఆకారం?', 'Square|చతురస్రం', ['Triangle|త్రిభుజం', 'Circle|వృత్తం'], '4 equal sides…|4 సమాన భుజాలు…', 'It is a square.|అది చతురస్రం.', 'Four equal sides make a square.|నాలుగు సమాన భుజాలు ఉంటే చతురస్రం.', obj('🪟', 1)],
        ]),
        tp('sides', (r) => {
          const s = r.pick(SHAPES), c = r.pick(COLORS);
          const what = r.pick(['sides|భుజాలు', 'corners|మూలలు']);
          const W = T(what), S = T(SH[s].w), n = SH[s].sides;
          return {
            ...typed(`How many ${W.en} does this ${S.en} have?|ఈ ${S.te}కు ఎన్ని ${W.te}?`, n, ['Touch each one and count.|ఒక్కొక్కటి తాకి లెక్కించు.', s === 'circle' ? 'Is there any corner at all?|ఒక్క మూలైనా ఉందా?' : 'Start at one corner and go round.|ఒక మూల నుండి మొదలుపెట్టి చుట్టూ తిరుగు.'],
              [`A ${S.en} has ${n} ${W.en}.|${S.te}కు ${n} ${W.te}.`], s === 'triangle' ? [['4', 'A triangle has only 3. Count again: 1, 2, 3.|త్రిభుజానికి 3 మాత్రమే. మళ్ళీ లెక్కించు: 1, 2, 3.']] : s === 'circle' ? [['1', 'A circle is round. It has no straight sides and no corners: 0.|వృత్తం గుండ్రం. నేరు భుజాలు, మూలలు లేవు: 0.']] : []),
            visual: shape(s, c),
          };
        }),
        tp('countshape', (r) => {
          const pool = ['🔺', '🔴', '🟦'];
          const names = ['triangles|త్రిభుజాలు', 'circles|వృత్తాలు', 'squares|చతురస్రాలు'];
          const row = Array.from({ length: r.int(5, 8) }, () => r.pick(pool));
          const k = r.int(0, 2), n = row.filter((x) => x === pool[k]).length;
          const W = T(names[k]);
          return countQ(`How many ${W.en} can you see?|ఎన్ని ${W.te} కనిపిస్తున్నాయి?`, n, emo(row.join(' ')), [`Look only for ${pool[k]}.|${pool[k]} ను మాత్రమే చూడు.`, 'Touch each one as you count.|లెక్కిస్తూ ఒక్కొక్కటి తాకు.'],
            [`There are ${n} ${W.en}.|${n} ${W.te} ఉన్నాయి.`], [[String(row.length), 'That is all the shapes. Count only one kind.|అది అన్ని ఆకారాల లెక్క. ఒక రకాన్నే లెక్కించు.']]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 3–4 counting helpers
/** count pictured things, n in [lo, hi] */
const countT = (key: string, lo: number, hi: number, groupsOf?: number) => tp(key, (r) => {
  const n = r.int(lo, hi), t = r.pick(OBJ);
  return countQ(`How many ${t.en}?|ఎన్ని ${t.te}?`, n, obj(t.e, n, groupsOf),
    ['Touch each one as you count.|లెక్కిస్తూ ఒక్కొక్కటి తాకు.', 'The last number you say is the answer.|చివరగా చెప్పిన సంఖ్యే జవాబు.'],
    [`Count: ${upTo(1, n)}. There are ${n} ${t.en}.|లెక్క: ${upTo(1, n)}. మొత్తం ${n} ${t.te}.`],
    [[String(n + 1), 'You counted one twice. Count again slowly.|ఒకదాన్ని రెండుసార్లు లెక్కించావు. మెల్లగా మళ్ళీ లెక్కించు.'], [String(n - 1), 'You missed one. Count again slowly.|ఒకటి వదిలేశావు. మెల్లగా మళ్ళీ లెక్కించు.']]);
});
/** tap the picture that shows n things */
const showT = (key: string, lo: number, hi: number, groupsOf?: number) => tp(key, (r) => {
  const n = r.int(lo, hi), t = r.pick(OBJ);
  const others = r.shuffle(range(Math.max(1, lo - 1), hi + 1).filter((x) => x !== n)).slice(0, 2);
  const list = r.shuffle([n, ...others]);
  return {
    type: 'spoken', prompt: L(`Tap the picture with ${n} ${t.en}.`, `${n} ${t.te} ఉన్న బొమ్మను నొక్కు.`),
    ...picChoices(list.map((x) => ({ v: obj(t.e, x, groupsOf), ok: x === n }))),
    hints: [T('Count the things in each picture.|ప్రతి బొమ్మలో వస్తువులను లెక్కించు.')],
    mistakes: [{ when: 'wrong', explain: T('Count that picture again. Does it match the number?|ఆ బొమ్మను మళ్ళీ లెక్కించు. సంఖ్యతో సరిపోతుందా?') }],
    solution: [L(`Picture ${'ABC'[list.indexOf(n)]} has ${n} ${t.en}.`, `బొమ్మ ${'ABC'[list.indexOf(n)]} లో ${n} ${t.te} ఉన్నాయి.`)],
  };
});
/** number ↔ name, both directions */
const nameT = (key: string, lo: number, hi: number) => tp(key, (r) => {
  const n = r.int(lo, hi);
  const pool = range(Math.max(1, lo - 2), Math.min(20, hi + 2)).filter((x) => x !== n);
  const wrong = r.shuffle(pool).slice(0, 3);
  if (r.int(0, 1) === 0) {
    const W = T(word(n));
    return mcqN(r, `Which number is "${W.en}"?|"${W.te}" అనే సంఖ్య ఏది?`, n, wrong, ['Count on your fingers while you say the names.|పేర్లు చెబుతూ వేళ్ళ మీద లెక్కించు.'],
      [`"${W.en}" is ${n}.|"${W.te}" అంటే ${n}.`], [['wrong', `Say the names in order: ${range(1, n).map(enW).join(', ')}.|పేర్లను వరుసగా చెప్పు: ${range(1, n).map(teW).join(', ')}.`]]);
  }
  return mcq(r, `What is the name of the number ${n}?|${n} సంఖ్య పేరు ఏమిటి?`, word(n), wrong.map(word), ['Count up from one, saying the names.|ఒకటి నుండి పేర్లు చెబుతూ లెక్కించు.'],
    [`${n} is "${enW(n)}".|${n} అంటే "${teW(n)}".`], [['wrong', `Count: ${range(1, n).map(enW).join(', ')}.|లెక్కించు: ${range(1, n).map(teW).join(', ')}.`]]);
});
/** match numerals to names */
const matchNameT = (key: string, lo: number, hi: number) => tp(key, (r) => {
  const set = r.shuffle(range(lo, hi)).slice(0, 3);
  return {
    type: 'match', prompt: L(`Match each number to its name: ${set.join(', ')}.`, `ప్రతి సంఖ్యను దాని పేరుతో జత చేయి: ${set.join(', ')}.`),
    ...matching(r, set.map((n) => [same(n), T(word(n))] as [Lc, Lc])),
    hints: [T('Say each number aloud first.|ముందు ప్రతి సంఖ్యను గట్టిగా చెప్పు.')],
    mistakes: [{ when: 'wrong', explain: T('Count on your fingers to check each name.|ప్రతి పేరును వేళ్ళ మీద లెక్కించి సరిచూడు.') }],
    solution: set.map((n) => L(`${n} — ${enW(n)}`, `${n} — ${teW(n)}`)),
  };
});
/** put numbers in counting order */
const orderT = (key: string, lo: number, hi: number, size: number) => tp(key, (r) => {
  const start = r.int(lo, hi - size + 1);
  const seq = range(start, start + size - 1);
  return {
    type: 'order', prompt: T('Put the numbers in counting order, smallest first.|సంఖ్యలను లెక్కించే వరుసలో పెట్టు, చిన్నది ముందు.'), ...ordering(r, seq.map(same)),
    hints: [T('Which number do you say first when you count?|లెక్కించేటప్పుడు ముందు ఏ సంఖ్య చెబుతావు?')],
    mistakes: [{ when: 'wrong', explain: T('Count aloud and put each number in its place.|గట్టిగా లెక్కిస్తూ ప్రతి సంఖ్యను దాని స్థానంలో పెట్టు.') }],
    solution: [L(seq.join(', '), seq.join(', '))],
  };
});

// ================================================================== CH 3 Numbers from 1 to 5
const ch3: USpec = {
  id: 'ts1.ma.ch3', subject: 'math', title: T('Numbers from 1 to 5|1 నుండి 5 వరకు సంఖ్యలు'), source: src(3),
  objectives: [
    {
      id: 'ts1.ma.n15.count', title: T('Count up to 5|5 వరకు లెక్కించు'), prereqs: ['ts1.ma.pre.more'],
      activities: ['game:counting'],
      intro: [
        H('Touch and count|తాకి లెక్కించు'),
        P('Touch each thing once. Say one number for each touch.|ప్రతి వస్తువును ఒకసారి తాకు. ఒక్కో తాకుకు ఒక సంఖ్య చెప్పు.'),
        V(obj('🍎', 3), 'One, two, three: three apples|ఒకటి, రెండు, మూడు: మూడు ఆపిల్ పండ్లు'),
        P('The last number you say tells how many.|చివరగా చెప్పిన సంఖ్యే ఎన్ని ఉన్నాయో చెబుతుంది.'),
        PH('🖐️', 'One hand has 5 fingers. Count them: 1, 2, 3, 4, 5.|ఒక చేతికి 5 వేళ్ళు. లెక్కించు: 1, 2, 3, 4, 5.'),
        TIP('Do not count the same apple twice!|ఒకే పండును రెండుసార్లు లెక్కించకు!'),
      ],
      examples: [
        EX('How many balloons?|ఎన్ని బెలూన్లు?', ['Touch and say: 1, 2, 3, 4.|తాకి చెప్పు: 1, 2, 3, 4.', 'The last number is 4.|చివరి సంఖ్య 4.'], '4 balloons|4 బెలూన్లు', obj('🎈', 4)),
        EX('Show 5 with your fingers.|వేళ్ళతో 5 చూపించు.', ['Open one whole hand.|ఒక చేయి మొత్తం తెరువు.', 'All 5 fingers stand up.|5 వేళ్ళూ నిలబడతాయి.'], '5|5', obj('🖐️', 1)),
      ],
      practice: [countT('count', 1, 5), showT('show', 1, 5)],
    },
    {
      id: 'ts1.ma.n15.read', title: T('Read and write 1 to 5|1 నుండి 5 వరకు చదువు, రాయి'), prereqs: ['ts1.ma.n15.count'],
      activities: ['art:trace'],
      intro: [
        P('Every number has a name.|ప్రతి సంఖ్యకు ఒక పేరు ఉంటుంది.'),
        stepsB(...range(1, 5).map((n) => L(`${n} — ${enW(n)}`, `${n} — ${teW(n)}`))),
        V(obj('🌼', 2), '2 — two flowers|2 — రెండు పువ్వులు'),
        TIP('Write 1 with one straight line down. Trace each number with your finger.|1 ను ఒక నిలువు గీతతో రాయి. ప్రతి సంఖ్యను వేలితో దిద్దు.'),
      ],
      examples: [
        EX('Which number is "three"?|"మూడు" అనే సంఖ్య ఏది?', ['Count: one, two, three.|లెక్కించు: ఒకటి, రెండు, మూడు.', 'We stopped at 3.|3 దగ్గర ఆగాం.'], '3|3', obj('🍊', 3)),
        EX('A cow has how many legs? Write the number.|ఆవుకు ఎన్ని కాళ్ళు? సంఖ్య రాయి.', ['Count the legs: 1, 2, 3, 4.|కాళ్ళు లెక్కించు: 1, 2, 3, 4.'], '4|4', obj('🐄', 1)),
      ],
      practice: [nameT('name', 1, 5), matchNameT('match', 1, 5), orderT('order', 1, 5, 4)],
    },
  ],
};

// ================================================================== CH 4 Numbers from 6 to 9
const ch4: USpec = {
  id: 'ts1.ma.ch4', subject: 'math', title: T('Numbers from 6 to 9|6 నుండి 9 వరకు సంఖ్యలు'), source: src(4),
  objectives: [
    {
      id: 'ts1.ma.n69.count', title: T('Count 6, 7, 8, 9|6, 7, 8, 9 లెక్కించు'), prereqs: ['ts1.ma.n15.count'],
      activities: ['game:counting'],
      intro: [
        H('Five and some more|ఐదు, ఇంకా కొన్ని'),
        P('One hand shows 5. Open more fingers on the other hand.|ఒక చేయి 5 చూపిస్తుంది. రెండో చేతి వేళ్ళు ఇంకా తెరువు.'),
        V(obj('🥚', 7, 5), 'Seven eggs: 5 and 2 more|ఏడు గుడ్లు: 5, ఇంకా 2'),
        KP('5 and 1 more is 6.|5, ఇంకా 1 అంటే 6.', '5 and 2 more is 7.|5, ఇంకా 2 అంటే 7.', '5 and 3 more is 8.|5, ఇంకా 3 అంటే 8.', '5 and 4 more is 9.|5, ఇంకా 4 అంటే 9.'),
        PH('🐞', 'Count the spots on a ladybird. Some have 7!|అక్షింతల పురుగుపై మచ్చలు లెక్కించు. కొన్నిటికి 7 ఉంటాయి!'),
        TIP('See a group of 5 at once, then count on: 6, 7, 8…|5 గుంపును ఒక్కసారి చూడు, తర్వాత ముందుకు లెక్కించు: 6, 7, 8…'),
      ],
      examples: [
        EX('How many eggs?|ఎన్ని గుడ్లు?', ['The first row has 5.|మొదటి వరుసలో 5.', 'Count on: 6, 7, 8.|ముందుకు లెక్కించు: 6, 7, 8.'], '8 eggs|8 గుడ్లు', obj('🥚', 8, 5)),
        EX('Show 9 with your fingers.|వేళ్ళతో 9 చూపించు.', ['One full hand is 5.|ఒక చేయి మొత్తం 5.', 'Add 4 fingers: 6, 7, 8, 9.|ఇంకా 4 వేళ్ళు: 6, 7, 8, 9.'], '9|9'),
      ],
      practice: [countT('count', 6, 9, 5), showT('show', 6, 9, 5)],
    },
    {
      id: 'ts1.ma.n69.read', title: T('Names and order of 1 to 9|1 నుండి 9 పేర్లు, వరుస'), prereqs: ['ts1.ma.n69.count', 'ts1.ma.n15.read'],
      activities: ['art:trace'],
      intro: [
        stepsB(...range(6, 9).map((n) => L(`${n} — ${enW(n)}`, `${n} — ${teW(n)}`))),
        P('Counting always goes in the same order: 1, 2, 3, 4, 5, 6, 7, 8, 9.|లెక్క ఎప్పుడూ ఒకే వరుసలో: 1, 2, 3, 4, 5, 6, 7, 8, 9.'),
        V(line(1, 9), 'Numbers 1 to 9 in a line|వరుసలో 1 నుండి 9'),
        TIP('6 and 9 look alike. 6 has its round part at the bottom; 9 has it at the top.|6, 9 ఒకేలా కనిపిస్తాయి. 6 కి గుండ్రం కింద; 9 కి పైన.'),
      ],
      examples: [
        EX('What is the name of 8?|8 పేరు ఏమిటి?', ['Count: six, seven, eight.|లెక్కించు: ఆరు, ఏడు, ఎనిమిది.'], '"eight"|"ఎనిమిది"'),
        EX('5 and 1 more make which number?|5, ఇంకా 1 కలిపితే ఏ సంఖ్య?', ['After 5 comes 6.|5 తర్వాత 6.'], '6|6', obj('🍌', 6, 5)),
      ],
      practice: [
        nameT('name', 6, 9), matchNameT('match', 4, 9), orderT('order', 1, 9, 5),
        tp('fiveplus', (r) => {
          const k = r.int(1, 4), t = r.pick(OBJ);
          return typed(`5 ${t.en} and ${k} more ${t.en}. How many ${t.en} in all?|5 ${t.te}, ఇంకా ${k} ${t.te}. మొత్తం ఎన్ని ${t.te}?`, 5 + k,
            ['Hold 5 in your head. Count on.|5 ను మనసులో ఉంచు. ముందుకు లెక్కించు.'], [`Start at 5 and count on ${k}: ${upTo(6, 5 + k)}.|5 నుండి ${k} ముందుకు: ${upTo(6, 5 + k)}.`],
            [[String(k), `That is only the extra part. Add it to the 5.|అది ఇంకా వచ్చిన భాగమే. దాన్ని 5 కు కలుపు.`]], { visual: obj(t.e, 5 + k, 5) });
        }),
      ],
    },
  ],
};

// ================================================================== CH 5 Before – After – Between – More – Less
const babT = (key: string, lo: number, hi: number) => tp(key, (r) => {
  const kind = r.pick(['after', 'before', 'between'] as const);
  const n = kind === 'after' ? r.int(lo, hi - 1) : kind === 'before' ? r.int(lo + 1, hi) : r.int(lo + 1, hi - 1);
  const from = Math.max(lo, Math.min(n - 5, hi - 10)), v = line(from, Math.min(hi, from + 10));
  if (kind === 'after') return typed(`Which number comes just after ${n}?|${n} తర్వాత వెంటనే వచ్చే సంఖ్య ఏది?`, n + 1, ['Count forward one step.|ఒక అడుగు ముందుకు లెక్కించు.', `Say ${n}, then the next number.|${n} అని చెప్పి, తర్వాతి సంఖ్య చెప్పు.`],
    [`${n}, ${n + 1}. Just after ${n} is ${n + 1}.|${n}, ${n + 1}. ${n} తర్వాత ${n + 1}.`], [[String(n - 1), 'That number comes before. "After" means the next one.|అది ముందు వచ్చే సంఖ్య. "తర్వాత" అంటే తర్వాతి సంఖ్య.']], { visual: v });
  if (kind === 'before') return typed(`Which number comes just before ${n}?|${n} కి ముందు వెంటనే వచ్చే సంఖ్య ఏది?`, n - 1, ['Count back one step.|ఒక అడుగు వెనక్కి లెక్కించు.', `Which number do you say just before ${n}?|${n} చెప్పే ముందు ఏ సంఖ్య చెబుతావు?`],
    [`${n - 1}, ${n}. Just before ${n} is ${n - 1}.|${n - 1}, ${n}. ${n} ముందు ${n - 1}.`], [[String(n + 1), 'That number comes after. "Before" means one step back.|అది తర్వాత వచ్చే సంఖ్య. "ముందు" అంటే ఒక అడుగు వెనక్కి.']], { visual: v });
  return typed(`Which number comes between ${n - 1} and ${n + 1}?|${n - 1}, ${n + 1} మధ్య వచ్చే సంఖ్య ఏది?`, n, ['Count from the first number.|మొదటి సంఖ్య నుండి లెక్కించు.'],
    [`${n - 1}, ${n}, ${n + 1}. The middle one is ${n}.|${n - 1}, ${n}, ${n + 1}. మధ్యలోది ${n}.`], [], { visual: v });
});
const missT = (key: string, lo: number, hi: number) => tp(key, (r) => {
  const start = r.int(lo, hi - 3), gap = r.int(1, 2);
  const seq = range(start, start + 3);
  const shown = seq.map((x, i) => (i === gap ? '__' : String(x))).join(', ');
  return typed(`Fill in the missing number: ${shown}|తప్పిపోయిన సంఖ్య నింపు: ${shown}`, seq[gap], ['Count along the row.|వరుస వెంట లెక్కించు.', 'Each number is 1 more than the one before.|ప్రతి సంఖ్య ముందుదాని కంటే 1 ఎక్కువ.'],
    [`${seq.join(', ')}. The missing number is ${seq[gap]}.|${seq.join(', ')}. తప్పిపోయిన సంఖ్య ${seq[gap]}.`]);
});
const moreLessT = (key: string, lo: number, hi: number, pics: boolean) => tp(key, (r) => {
  const a = r.int(lo, hi);
  let b = r.int(lo, hi);
  if (b === a) b = a === hi ? a - r.int(1, 3) : a + 1;
  const askMore = r.int(0, 1) === 0;
  const ans = askMore ? Math.max(a, b) : Math.min(a, b), other = ans === a ? b : a;
  const t = r.pick(OBJ);
  const W = T(askMore ? 'more|ఎక్కువ' : 'less|తక్కువ');
  const extra: Partial<QSpec> = pics && hi <= 9 ? { visual: emo(`${t.e.repeat(a)}\n${t.e.repeat(b)}`) } : {};
  return mcq(r, `Which number is ${W.en}: ${a} or ${b}?|${a}, ${b} — వీటిలో ఏ సంఖ్య ${W.te}?`, nn(ans), [nn(other)],
    [askMore ? 'On the number line, the bigger number is further along.|సంఖ్యారేఖపై పెద్ద సంఖ్య ఇంకా ముందు ఉంటుంది.' : 'The smaller number comes first when you count.|లెక్కించేటప్పుడు చిన్న సంఖ్య ముందు వస్తుంది.'],
    [`${Math.min(a, b)} comes before ${Math.max(a, b)}, so ${Math.max(a, b)} is more and ${Math.min(a, b)} is less. Answer: ${ans}.|${Math.min(a, b)}, ${Math.max(a, b)} కంటే ముందు వస్తుంది. కాబట్టి ${Math.max(a, b)} ఎక్కువ, ${Math.min(a, b)} తక్కువ. జవాబు: ${ans}.`],
    [['wrong', `Listen again: the question asks for the ${W.en} one.|మళ్ళీ విను: ప్రశ్న ${W.te} సంఖ్యను అడుగుతోంది.`]], extra);
});
const sortT = (key: string, lo: number, hi: number) => tp(key, (r) => {
  const set = r.shuffle(range(lo, hi)).slice(0, 4);
  const up = r.int(0, 1) === 0;
  const sorted = [...set].sort((x, y) => (up ? x - y : y - x));
  return {
    type: 'order', prompt: up ? T('Put these numbers in order, smallest first.|ఈ సంఖ్యలను చిన్నది ముందు వచ్చేలా వరుసలో పెట్టు.') : T('Put these numbers in order, biggest first.|ఈ సంఖ్యలను పెద్దది ముందు వచ్చేలా వరుసలో పెట్టు.'),
    ...ordering(r, sorted.map(same)),
    hints: [T(up ? 'Find the smallest number first.|ముందు అతి చిన్న సంఖ్యను వెతుకు.' : 'Find the biggest number first.|ముందు అతి పెద్ద సంఖ్యను వెతుకు.')],
    mistakes: [{ when: 'wrong', explain: T('Say the numbers in counting order and check again.|సంఖ్యలను లెక్కించే వరుసలో చెప్పి మళ్ళీ చూడు.') }],
    solution: [L(sorted.join(', '), sorted.join(', '))],
  };
});
const ch5: USpec = {
  id: 'ts1.ma.ch5', subject: 'math', title: T('Before - After - Between - More - Less|ముందు - తర్వాత - మధ్య - ఎక్కువ - తక్కువ'), source: src(5),
  objectives: [
    {
      id: 'ts1.ma.ord9.bab', title: T('Just before, just after, between|ముందు, తర్వాత, మధ్య'), prereqs: ['ts1.ma.n69.read'],
      activities: ['game:numberline'],
      intro: [
        H('Numbers stand in a line|సంఖ్యలు వరుసలో నిలబడతాయి'),
        V(line(1, 9, [4]), 'Number line from 1 to 9 with 4 marked|1 నుండి 9 సంఖ్యారేఖ, 4 గుర్తు'),
        P('Each step forward adds one.|ప్రతి అడుగు ముందుకు ఒకటి కలుపుతుంది.'),
        KP('Just after 4 is 5.|4 తర్వాత వెంటనే 5.', 'Just before 4 is 3.|4 ముందు వెంటనే 3.', 'Between 3 and 5 is 4.|3, 5 మధ్య 4.'),
        PH('🚆', 'Train coaches stand in order, one after another.|రైలు పెట్టెలు ఒకదాని తర్వాత ఒకటి వరుసగా ఉంటాయి.'),
        TIP('Hop along the number line with your finger: forward for after, back for before.|వేలితో సంఖ్యారేఖ మీద గెంతు: తర్వాత అంటే ముందుకు, ముందు అంటే వెనక్కి.'),
      ],
      examples: [
        EX('What comes just after 6?|6 తర్వాత వెంటనే ఏది?', ['Say 6, then hop one forward.|6 చెప్పి ఒక అడుగు ముందుకు గెంతు.'], '7|7', line(1, 9, [6, 7], [[6, 7]])),
        EX('What comes between 7 and 9?|7, 9 మధ్య ఏది?', ['Count: 7, 8, 9.|లెక్కించు: 7, 8, 9.', '8 is in the middle.|8 మధ్యలో ఉంది.'], '8|8', line(1, 9, [7, 8, 9])),
      ],
      practice: [babT('bab', 1, 9), missT('missing', 1, 9)],
    },
    {
      id: 'ts1.ma.ord9.compare', title: T('More or less: compare numbers|ఎక్కువా తక్కువా: సంఖ్యల పోలిక'), prereqs: ['ts1.ma.ord9.bab'],
      activities: ['game:numberline', 'game:balance'],
      intro: [
        P('Arjun has 8 kites. Sana has 5 kites. 8 is more than 5.|అర్జున్ దగ్గర 8 గాలిపటాలు, సనా దగ్గర 5. 5 కంటే 8 ఎక్కువ.'),
        V(emo('🪁🪁🪁🪁🪁🪁🪁🪁\n🪁🪁🪁🪁🪁'), 'Eight kites and five kites|ఎనిమిది గాలిపటాలు, ఐదు గాలిపటాలు'),
        P('5 is less than 8.|8 కంటే 5 తక్కువ.'),
        TIP('The number you say later when counting is more.|లెక్కించేటప్పుడు తర్వాత చెప్పే సంఖ్య ఎక్కువ.'),
      ],
      examples: [
        EX('Which is more: 4 or 7?|4, 7 — ఏది ఎక్కువ?', ['Count: 1, 2, 3, 4 … 5, 6, 7.|లెక్కించు: 1, 2, 3, 4 … 5, 6, 7.', '7 comes later.|7 తర్వాత వస్తుంది.'], '7|7'),
        EX('Put 6, 2, 9 in order, smallest first.|6, 2, 9 ని చిన్నది ముందు వచ్చేలా పెట్టు.', ['The smallest is 2.|అతి చిన్నది 2.', 'Then 6, then 9.|తర్వాత 6, తర్వాత 9.'], '2, 6, 9|2, 6, 9'),
      ],
      practice: [moreLessT('more', 1, 9, true), sortT('sort', 1, 9)],
    },
  ],
};

// ================================================================== CH 6 Zero
const NONE_B: B[] = [
  ['How many legs does a fish have?|చేపకు ఎన్ని కాళ్ళు?', '0|0', ['2|2', '4|4'], 'A fish swims with fins.|చేప రెక్కలతో ఈదుతుంది.', 'A fish has 0 legs.|చేపకు 0 కాళ్ళు.', 'A fish has no legs at all, so the answer is zero.|చేపకు కాళ్ళే లేవు, కాబట్టి జవాబు సున్నా.', obj('🐟', 1)],
  ['How many legs does a snake have?|పాముకు ఎన్ని కాళ్ళు?', '0|0', ['2|2', '4|4'], 'A snake slides on its body.|పాము శరీరంతో పాకుతుంది.', 'A snake has 0 legs.|పాముకు 0 కాళ్ళు.', 'A snake has no legs, so the answer is zero.|పాముకు కాళ్ళు లేవు, కాబట్టి సున్నా.'],
  ['How many legs does a hen have?|కోడికి ఎన్ని కాళ్ళు?', '2|2', ['0|0', '4|4'], 'Look at how a hen walks.|కోడి ఎలా నడుస్తుందో చూడు.', 'A hen has 2 legs.|కోడికి 2 కాళ్ళు.', 'Count the legs in the picture.|బొమ్మలో కాళ్ళు లెక్కించు.', obj('🐔', 1)],
  ['How many legs does a cow have?|ఆవుకు ఎన్ని కాళ్ళు?', '4|4', ['0|0', '2|2'], 'Two in front, two at the back.|ముందు రెండు, వెనుక రెండు.', 'A cow has 4 legs.|ఆవుకు 4 కాళ్ళు.', 'Count the front legs and the back legs.|ముందు కాళ్ళు, వెనుక కాళ్ళు లెక్కించు.', obj('🐄', 1)],
  ['How many wheels does a boat have?|పడవకు ఎన్ని చక్రాలు?', '0|0', ['2|2', '3|3'], 'A boat moves on water.|పడవ నీటి మీద వెళ్తుంది.', 'A boat has 0 wheels.|పడవకు 0 చక్రాలు.', 'Boats float. They have no wheels: zero.|పడవలు తేలుతాయి. చక్రాలు లేవు: సున్నా.', obj('⛵', 1)],
  ['How many wheels does an auto have?|ఆటోకు ఎన్ని చక్రాలు?', '3|3', ['0|0', '2|2'], 'One wheel in front, two at the back.|ముందు ఒక చక్రం, వెనుక రెండు.', 'An auto has 3 wheels.|ఆటోకు 3 చక్రాలు.', 'Count: 1 in front and 2 at the back makes 3.|లెక్కించు: ముందు 1, వెనుక 2, మొత్తం 3.', obj('🛺', 1)],
  ['How many wheels does a bicycle have?|సైకిల్‌కు ఎన్ని చక్రాలు?', '2|2', ['0|0', '3|3'], 'Bi means two.|"బై" అంటే రెండు.', 'A bicycle has 2 wheels.|సైకిల్‌కు 2 చక్రాలు.', 'One wheel in front, one at the back.|ముందు ఒకటి, వెనుక ఒకటి.', obj('🚲', 1)],
  ['How many horns does a hen have?|కోడికి ఎన్ని కొమ్ములు?', '0|0', ['1|1', '2|2'], 'Look at a hen\'s head.|కోడి తలను చూడు.', 'A hen has 0 horns.|కోడికి 0 కొమ్ములు.', 'Hens have no horns: zero.|కోళ్ళకు కొమ్ములు లేవు: సున్నా.', obj('🐔', 1)],
];
const ch6: USpec = {
  id: 'ts1.ma.ch6', subject: 'math', title: T('Zero (0)|సున్నా (0)'), source: src(6),
  objectives: [
    {
      id: 'ts1.ma.zero.idea', title: T('Zero means none|సున్నా అంటే ఏమీ లేదు'), prereqs: ['ts1.ma.n69.count'],
      intro: [
        H('Nothing left!|ఏమీ మిగల్లేదు!'),
        P('Meena had 3 bananas. She ate all 3.|మీనా దగ్గర 3 అరటి పండ్లు ఉండేవి. మూడూ తినేసింది.'),
        P('Now she has none. None is called zero. We write it 0.|ఇప్పుడు ఒక్కటీ లేదు. ఏమీ లేకపోవడాన్ని సున్నా అంటాం. 0 అని రాస్తాం.'),
        PH('🧺', 'An empty basket has 0 mangoes.|ఖాళీ బుట్టలో 0 మామిడి పండ్లు.'),
        REM('0 is a number too. It tells us there is nothing.|0 కూడా ఒక సంఖ్యే. ఏమీ లేదని అది చెబుతుంది.'),
        TIP('Write 0 like a round egg shape. Start at the top.|0 ని గుడ్డు ఆకారంలో రాయి. పై నుండి మొదలుపెట్టు.'),
      ],
      examples: [
        EX('4 birds sat on a wire. All 4 flew away. How many are left?|తీగ మీద 4 పక్షులు కూర్చున్నాయి. నాలుగూ ఎగిరిపోయాయి. ఎన్ని మిగిలాయి?', ['All of them flew away.|అన్నీ ఎగిరిపోయాయి.', 'No bird is left.|ఒక్క పక్షీ లేదు.'], '0|0', obj('🐦', 4)),
        EX('How many legs does a fish have?|చేపకు ఎన్ని కాళ్ళు?', ['A fish swims with fins.|చేప రెక్కలతో ఈదుతుంది.', 'It has no legs.|దానికి కాళ్ళు లేవు.'], '0|0', obj('🐟', 1)),
      ],
      practice: [
        tp('allgone', (r) => {
          const n = r.int(2, 9), t = r.pick(OBJ), who = nm(r);
          const verb = r.pick([['gave away all', 'అన్నీ ఇచ్చేశారు'], ['shared all', 'అన్నీ పంచేశారు'], ['put away all', 'అన్నీ దాచేశారు']]);
          return typed(`${who.en} had ${n} ${t.en} and ${verb[0]} ${n}. How many ${t.en} are left with ${who.en}?|${who.te} దగ్గర ${n} ${t.te} ఉండేవి. ${verb[1]}. ${who.te} దగ్గర ఎన్ని మిగిలాయి?`, 0,
            ['All of them are gone.|అన్నీ వెళ్ళిపోయాయి.', 'What number means none?|ఏమీ లేకపోతే ఏ సంఖ్య?'], [`${n} − ${n} = 0. Nothing is left.|${n} − ${n} = 0. ఏమీ మిగల్లేదు.`],
            [[String(n), `${who.en} does not have them any more. None are left.|అవి ఇప్పుడు ${who.te} దగ్గర లేవు. ఏమీ మిగల్లేదు.`], ['1', 'Not even one is left. The answer is 0.|ఒక్కటి కూడా మిగల్లేదు. జవాబు 0.']]);
        }),
        bank('none', NONE_B),
      ],
    },
    {
      id: 'ts1.ma.zero.line', title: T('Zero on the number line|సంఖ్యారేఖపై సున్నా'), prereqs: ['ts1.ma.zero.idea'],
      activities: ['game:numberline'],
      intro: [
        V(line(0, 9, [0]), 'Number line from 0 to 9. Zero is at the start.|0 నుండి 9 సంఖ్యారేఖ. సున్నా మొదట్లో ఉంది.'),
        P('0 comes just before 1.|1 కి ముందు 0 వస్తుంది.'),
        P('0 is the smallest of these numbers.|ఈ సంఖ్యలన్నిటిలో 0 అతి చిన్నది.'),
        KP('Add 0: nothing changes. 4 + 0 = 4.|0 కలిపితే ఏమీ మారదు. 4 + 0 = 4.', 'Take away 0: nothing changes. 6 − 0 = 6.|0 తీసేస్తే ఏమీ మారదు. 6 − 0 = 6.', 'Take away all: 0 is left. 5 − 5 = 0.|అన్నీ తీసేస్తే 0 మిగులుతుంది. 5 − 5 = 0.'),
        TIP('Count backwards to blast off: 5, 4, 3, 2, 1, 0!|రాకెట్ లాగా వెనక్కి లెక్కించు: 5, 4, 3, 2, 1, 0!'),
      ],
      examples: [
        EX('7 + 0 = ?|7 + 0 = ?', ['Adding zero adds nothing.|సున్నా కలిపితే ఏమీ కలవదు.'], '7|7'),
        EX('Which is the smallest: 3, 0, 5?|3, 0, 5 — అతి చిన్నది ఏది?', ['0 means nothing.|0 అంటే ఏమీ లేదు.', 'Nothing is less than 3 or 5.|ఏమీ లేనిది 3, 5 కంటే తక్కువ.'], '0|0', line(0, 5, [0, 3, 5])),
      ],
      practice: [
        tp('zeroadd', (r) => {
          const n = r.int(1, 9), k = r.int(0, 3);
          const [e, a] = k === 0 ? [`${n} + 0`, n] : k === 1 ? [`0 + ${n}`, n] : k === 2 ? [`${n} − 0`, n] : [`${n} − ${n}`, 0];
          return typed(`${e} = ?|${e} = ?`, a, [k === 3 ? 'Take away all of them.|అన్నీ తీసేయి.' : 'Zero is nothing. Does anything change?|సున్నా అంటే ఏమీ లేదు. ఏదైనా మారుతుందా?'],
            [`${e} = ${a}.|${e} = ${a}.`], k === 3 ? [[String(n), 'You took all of them away, so none are left.|అన్నీ తీసేశావు, కాబట్టి ఏమీ మిగల్లేదు.']] : [['0', `Adding or taking away 0 changes nothing. The answer stays ${n}.|0 కలిపినా తీసినా ఏమీ మారదు. జవాబు ${n} గానే ఉంటుంది.`]]);
        }),
        tp('smallest', (r) => {
          const two = r.shuffle(range(1, 9)).slice(0, 2);
          const k = r.int(0, 1);
          if (k === 0) {
            const list = r.shuffle([0, ...two]).join(', ');
            return mcqN(r, `Which is the smallest: ${list}?|ఏది అతి చిన్నది: ${list}?`, 0, two, ['Which one means nothing at all?|ఏది ఏమీ లేదని అర్థం?'],
              ['0 is the smallest.|0 అతి చిన్నది.'], [['wrong', 'Zero is less than every other counting number.|సున్నా మిగతా లెక్కింపు సంఖ్యలన్నిటి కంటే తక్కువ.']]);
          }
          const n = two[0];
          return typed(`Count back: ${upTo(0, n).split(', ').reverse().slice(0, -1).join(', ')}, __|వెనక్కి లెక్కించు: ${upTo(0, n).split(', ').reverse().slice(0, -1).join(', ')}, __`, 0,
            ['What comes just before 1?|1 కి ముందు ఏది వస్తుంది?'], [`${upTo(0, n).split(', ').reverse().join(', ')}. The last number is 0.|${upTo(0, n).split(', ').reverse().join(', ')}. చివరి సంఖ్య 0.`], [['2', 'You need one more step back after 1.|1 తర్వాత ఇంకో అడుగు వెనక్కి వెళ్ళాలి.']]);
        }),
      ],
    },
  ],
};

// ================================================================== addition / subtraction helpers
const ITEMS = OBJ.filter((t) => !['🐟', '🐦', '🦋', '🐔'].includes(t.e));
const ANIMALS: Thing[] = OBJ.filter((t) => ['🐦', '🦋', '🐔'].includes(t.e));
const fwd = (a: number, b: number): [number, number][] => range(a, a + b - 1).map((x) => [x, x + 1] as [number, number]);
const back = (a: number, b: number): [number, number][] => range(a - b + 1, a).reverse().map((x) => [x, x - 1] as [number, number]);
/** two addends with lo <= a + b <= hi, both >= 1 */
const addends = (r: Rng, lo: number, hi: number) => {
  const tot = r.int(lo, hi), a = r.int(1, tot - 1);
  return [a, tot - a];
};
const sumT = (key: string, lo: number, hi: number) => tp(key, (r) => {
  const [a, b] = addends(r, lo, hi);
  const big = Math.max(a, b), small = Math.min(a, b);
  return typed(`${a} + ${b} = ?|${a} + ${b} = ?`, a + b,
    [`Start at ${big}. Count on ${small} more.|${big} దగ్గర మొదలుపెట్టు. ఇంకా ${small} ముందుకు లెక్కించు.`, 'Use your fingers or the number line.|వేళ్ళను లేదా సంఖ్యారేఖను వాడు.'],
    [`Start at ${big}: ${upTo(big + 1, a + b)}.|${big} నుండి: ${upTo(big + 1, a + b)}.`, `${a} + ${b} = ${a + b}|${a} + ${b} = ${a + b}`],
    [[String(a + b - 1), `Do not count ${big} again. Start counting from the next number.|${big} ను మళ్ళీ లెక్కించకు. తర్వాతి సంఖ్య నుండి లెక్కించు.`], [String(Math.abs(a - b)), 'You took away. "+" means put together.|నువ్వు తీసేశావు. "+" అంటే కలపడం.']],
    { visual: line(0, hi <= 10 ? 10 : 20, [big, a + b], fwd(big, small)) });
});
const missAddT = (key: string, lo: number, hi: number) => tp(key, (r) => {
  const [a, b] = addends(r, lo, hi), c = a + b;
  return typed(`${a} + __ = ${c}|${a} + __ = ${c}`, b, [`Start at ${a}. Count on until you reach ${c}.|${a} నుండి ${c} వచ్చేదాకా ముందుకు లెక్కించు.`, 'Count how many steps you took.|ఎన్ని అడుగులు వేశావో లెక్కించు.'],
    [`${a} → ${c} is ${b} steps.|${a} నుండి ${c} కి ${b} అడుగులు.`, `${a} + ${b} = ${c}|${a} + ${b} = ${c}`], [[String(c), `${c} is the total. Find the number you add to ${a} to get it.|${c} మొత్తం. ${a} కు ఏది కలిపితే అది వస్తుందో కనుక్కో.`]],
    { visual: line(0, hi <= 10 ? 10 : 20, [a, c]) });
});
const addStoryT = (key: string, lo: number, hi: number) => tp(key, (r) => {
  const [a, b] = addends(r, lo, hi), t = r.pick(ITEMS), who = nm(r), k = r.int(0, 2);
  const s = k === 0
    ? `${who.en} has ${a} ${t.en}. Grandma gives ${b} more. How many ${t.en} does ${who.en} have now?|${who.te} దగ్గర ${a} ${t.te} ఉన్నాయి. అమ్మమ్మ ఇంకా ${b} ఇచ్చింది. ఇప్పుడు ${who.te} దగ్గర ఎన్ని ${t.te}?`
    : k === 1
      ? `There are ${a} ${t.en} in one basket and ${b} ${t.en} in another. How many ${t.en} in all?|ఒక బుట్టలో ${a} ${t.te}, ఇంకో బుట్టలో ${b} ${t.te} ఉన్నాయి. మొత్తం ఎన్ని ${t.te}?`
      : `${who.en} buys ${a} ${t.en} in the morning and ${b} ${t.en} in the evening. How many ${t.en} in all?|${who.te} ఉదయం ${a} ${t.te}, సాయంత్రం ${b} ${t.te} కొన్నారు. మొత్తం ఎన్ని ${t.te}?`;
  return typed(s, a + b, ['"More" and "in all" tell us to add.|"ఇంకా", "మొత్తం" అంటే కూడాలి.', `Find ${a} + ${b}.|${a} + ${b} కనుక్కో.`],
    [`${a} + ${b} = ${a + b}|${a} + ${b} = ${a + b}`, `Answer: ${a + b} ${t.en}. Well done!|జవాబు: ${a + b} ${t.te}. శభాష్!`],
    [[String(Math.abs(a - b)), 'Things are being put together, so add.|వస్తువులు కలుస్తున్నాయి, కాబట్టి కూడాలి.']],
    hi <= 9 ? { visual: emo(`${t.e.repeat(a)} ➕ ${t.e.repeat(b)}`) } : {});
});
/** a − b with a in [aLo, aHi], 1 <= b <= min(a, bHi) */
const diffPair = (r: Rng, aLo: number, aHi: number, bHi: number) => {
  const a = r.int(aLo, aHi), b = r.int(1, Math.min(a, bHi));
  return [a, b];
};
const diffT = (key: string, aLo: number, aHi: number, bHi: number) => tp(key, (r) => {
  const [a, b] = diffPair(r, aLo, aHi, bHi);
  return typed(`${a} − ${b} = ?|${a} − ${b} = ?`, a - b,
    [`Start at ${a}. Count back ${b} steps.|${a} దగ్గర మొదలుపెట్టు. ${b} అడుగులు వెనక్కి లెక్కించు.`, 'Fold one finger for each step back.|వెనక్కి వేసే ప్రతి అడుగుకు ఒక వేలు మడువు.'],
    [`Count back from ${a}: ${range(a - b, a - 1).reverse().join(', ')}.|${a} నుండి వెనక్కి: ${range(a - b, a - 1).reverse().join(', ')}.`, `${a} − ${b} = ${a - b}|${a} − ${b} = ${a - b}`],
    [[String(a + b), 'You added. "−" means take away.|నువ్వు కూడావు. "−" అంటే తీసివేయడం.'], [String(a - b + 1), `Do not count ${a} itself. Start from the number just before it.|${a} ను లెక్కించకు. దాని ముందు సంఖ్య నుండి మొదలుపెట్టు.`]],
    { visual: line(0, aHi <= 10 ? 10 : 20, [a, a - b], back(a, b)) });
});
const subStoryT = (key: string, aLo: number, aHi: number, bHi: number) => tp(key, (r) => {
  const [a, b] = diffPair(r, aLo, aHi, bHi), who = nm(r), k = r.int(0, 2);
  const an = r.pick(ANIMALS), t = r.pick(ITEMS);
  const s = k === 0
    ? `${a} ${an.en} are in the garden. ${b} go away. How many ${an.en} are still there?|తోటలో ${a} ${an.te} ఉన్నాయి. ${b} వెళ్ళిపోయాయి. ఇంకా ఎన్ని ${an.te} ఉన్నాయి?`
    : k === 1
      ? `${who.en} has ${a} ${t.en} and gives ${b} to a friend. How many ${t.en} are left?|${who.te} దగ్గర ${a} ${t.te} ఉన్నాయి. స్నేహితుడికి ${b} ఇచ్చారు. ఎన్ని మిగిలాయి?`
      : `There were ${a} ${t.en} on a plate. The family used ${b}. How many ${t.en} are left?|పళ్ళెంలో ${a} ${t.te} ఉండేవి. ఇంట్లోవాళ్ళు ${b} వాడారు. ఎన్ని మిగిలాయి?`;
  const th = k === 0 ? an : t;
  return typed(s, a - b, ['"Go away", "gives", "used" and "left" tell us to take away.|"వెళ్ళిపోయాయి", "ఇచ్చారు", "వాడారు", "మిగిలాయి" అంటే తీసివేయాలి.', `Find ${a} − ${b}.|${a} − ${b} కనుక్కో.`],
    [`${a} − ${b} = ${a - b}|${a} − ${b} = ${a - b}`, `${a - b} ${th.en} are left. Great job!|${a - b} ${th.te} మిగిలాయి. చాలా బాగుంది!`],
    [[String(a + b), 'Some went away, so there are fewer now. Take away.|కొన్ని వెళ్ళిపోయాయి, కాబట్టి ఇప్పుడు తక్కువ ఉంటాయి. తీసివేయి.']],
    aHi <= 9 ? { visual: obj(th.e, a) } : {});
});

// ================================================================== CH 7 Addition, total not exceeding 9
const ch7: USpec = {
  id: 'ts1.ma.ch7', subject: 'math', title: T('Addition of Numbers, Total Not Exceeding 9|సంఖ్యల కూడిక (మొత్తం 9 మించకుండా)'), source: src(7),
  objectives: [
    {
      id: 'ts1.ma.add9.join', title: T('Put together and count|కలిపి లెక్కించు'), prereqs: ['ts1.ma.n69.count'],
      activities: ['game:counting'],
      intro: [
        H('Adding means putting together|కూడటం అంటే ఒక చోట చేర్చడం'),
        P('Ravi has 3 kites. Diya has 2 kites.|రవి దగ్గర 3 గాలిపటాలు, దియా దగ్గర 2 ఉన్నాయి.'),
        V(emo('🪁🪁🪁 ➕ 🪁🪁'), 'Three kites and two kites|మూడు గాలిపటాలు, రెండు గాలిపటాలు'),
        P('Put them together and count all: 1, 2, 3, 4, 5.|అన్నీ కలిపి లెక్కించు: 1, 2, 3, 4, 5.'),
        P('We write 3 + 2 = 5. We say "three plus two is five".|3 + 2 = 5 అని రాస్తాం. "మూడు కూడిక రెండు సమానం ఐదు" అని చదువుతాం.'),
        PH('🥭', 'Two mangoes in your hand and one more from the tree make three.|చేతిలో రెండు మామిడి పండ్లు, చెట్టు నుండి ఇంకొకటి — మొత్తం మూడు.'),
        TIP('Use real things: beads, stones or seeds. Make two heaps, then push them together.|నిజమైన వస్తువులు వాడు: పూసలు, రాళ్ళు, గింజలు. రెండు కుప్పలు చేసి, ఒకటిగా కలుపు.'),
      ],
      examples: [
        EX('4 flowers and 3 flowers. How many in all?|4 పువ్వులు, 3 పువ్వులు. మొత్తం ఎన్ని?', ['Count all: 1, 2, 3, 4, 5, 6, 7.|అన్నీ లెక్కించు: 1, 2, 3, 4, 5, 6, 7.', '4 + 3 = 7|4 + 3 = 7'], '7 flowers|7 పువ్వులు', emo('🌼🌼🌼🌼 ➕ 🌼🌼🌼')),
        EX('1 egg and 5 eggs. How many in all?|1 గుడ్డు, 5 గుడ్లు. మొత్తం ఎన్ని?', ['Start at 5. Count on 1: 6.|5 నుండి మొదలుపెట్టు. ఇంకొకటి: 6.', '1 + 5 = 6|1 + 5 = 6'], '6 eggs|6 గుడ్లు', emo('🥚 ➕ 🥚🥚🥚🥚🥚')),
      ],
      practice: [
        tp('pics', (r) => {
          const [a, b] = addends(r, 2, 9), t = r.pick(OBJ);
          return countQ(`${a} ${t.en} and ${b} ${t.en}. How many ${t.en} in all?|${a} ${t.te}, ${b} ${t.te}. మొత్తం ఎన్ని ${t.te}?`, a + b, emo(`${t.e.repeat(a)} ➕ ${t.e.repeat(b)}`),
            ['Count every picture, both sides.|రెండు వైపులా ప్రతి బొమ్మను లెక్కించు.'], [`${a} + ${b} = ${a + b}. There are ${a + b} ${t.en} in all.|${a} + ${b} = ${a + b}. మొత్తం ${a + b} ${t.te}.`],
            [[String(a), 'That is only the first group. Count the second group too.|అది మొదటి గుంపు మాత్రమే. రెండో గుంపునూ లెక్కించు.'], [String(b), 'That is only the second group. Count both groups.|అది రెండో గుంపు మాత్రమే. రెండు గుంపులూ లెక్కించు.']]);
        }),
        tp('sentence', (r) => {
          const [a, b] = addends(r, 3, 9), t = r.pick(OBJ);
          const right = `${a} + ${b} = ${a + b}`;
          const wrong = [`${a} + ${b + 1} = ${a + b + 1}`, `${a + 1} + ${b} = ${a + b + 1}`, `${a} + ${b} = ${a + b + 1}`, b > 1 ? `${a} + ${b - 1} = ${a + b - 1}` : `${a + 2} + ${b} = ${a + b + 2}`];
          return mcq(r, 'Which number sentence matches the picture?|బొమ్మకు సరిపోయే సంఖ్యా వాక్యం ఏది?', `${right}|${right}`, wrong.map((w) => `${w}|${w}`),
            ['Count the first group, then the second group, then all.|మొదటి గుంపు, రెండో గుంపు, తర్వాత అన్నీ లెక్కించు.'], [`First group ${a}, second group ${b}, all together ${a + b}: ${right}.|మొదటి గుంపు ${a}, రెండో గుంపు ${b}, మొత్తం ${a + b}: ${right}.`],
            [['wrong', 'Check each number in the sentence against the picture.|వాక్యంలోని ప్రతి సంఖ్యను బొమ్మతో సరిచూడు.']], { visual: emo(`${t.e.repeat(a)} ➕ ${t.e.repeat(b)}`) });
        }),
      ],
    },
    {
      id: 'ts1.ma.add9.sum', title: T('Add numbers up to 9|9 వరకు సంఖ్యలు కూడు'), prereqs: ['ts1.ma.add9.join'],
      activities: ['game:numberline'],
      intro: [
        H('Count on|ముందుకు లెక్కించు'),
        P('To find 5 + 3, keep 5 in your head. Then count 3 more: 6, 7, 8.|5 + 3 కోసం 5 ను మనసులో ఉంచు. తర్వాత ఇంకా 3: 6, 7, 8.'),
        V(line(0, 10, [5, 8], [[5, 6], [6, 7], [7, 8]]), 'Start at 5 and hop 3 times to reach 8|5 నుండి 3 గెంతులు వేస్తే 8'),
        KP('Start from the bigger number. It is quicker!|పెద్ద సంఖ్య నుండి మొదలుపెట్టు. తొందరగా అవుతుంది!', '2 + 6 and 6 + 2 give the same answer: 8.|2 + 6, 6 + 2 రెండింటికీ ఒకటే జవాబు: 8.'),
        PH('🧮', 'Slide beads on an abacus to add: 5 beads, then 3 more.|పూసల చట్రంపై పూసలు జరిపి కూడు: 5 పూసలు, ఇంకా 3.'),
        TIP('Hop on the number line with your finger. Count the hops, not the start.|సంఖ్యారేఖపై వేలితో గెంతు. మొదలైన చోటు కాదు, గెంతులు లెక్కించు.'),
      ],
      examples: [
        EX('6 + 2 = ?|6 + 2 = ?', ['Start at 6.|6 దగ్గర మొదలుపెట్టు.', 'Hop 2: 7, 8.|2 గెంతులు: 7, 8.'], '8|8', line(0, 10, [6, 8], [[6, 7], [7, 8]])),
        EX('3 + __ = 7|3 + __ = 7', ['Start at 3. Count on to 7: 4, 5, 6, 7.|3 నుండి 7 దాకా: 4, 5, 6, 7.', 'That is 4 hops.|అవి 4 గెంతులు.'], '4|4', line(0, 10, [3, 7], [[3, 4], [4, 5], [5, 6], [6, 7]])),
      ],
      practice: [sumT('sum', 2, 9), missAddT('missing', 3, 9)],
    },
    {
      id: 'ts1.ma.add9.story', title: T('Addition stories|కూడిక కథలు'), prereqs: ['ts1.ma.add9.sum'],
      intro: [
        P('Maths stories happen every day!|గణిత కథలు రోజూ జరుగుతాయి!'),
        PH('🐔', 'Lakshmi\'s hens laid 4 eggs today and 3 eggs yesterday. That is 4 + 3 = 7 eggs.|లక్ష్మి కోళ్ళు ఈరోజు 4, నిన్న 3 గుడ్లు పెట్టాయి. 4 + 3 = 7 గుడ్లు.'),
        KP('"More", "in all", "altogether" mean add.|"ఇంకా", "మొత్తం", "అన్నీ కలిపి" అంటే కూడాలి.'),
        TIP('Act out the story with real things, then write the number sentence.|కథను నిజమైన వస్తువులతో చేసి చూపించు, తర్వాత సంఖ్యా వాక్యం రాయి.'),
      ],
      examples: [
        EX('Teja has 2 balloons. Mother brings 4 more. How many balloons now?|తేజ దగ్గర 2 బెలూన్లు ఉన్నాయి. అమ్మ ఇంకా 4 తెచ్చింది. ఇప్పుడు ఎన్ని?', ['"More" means add.|"ఇంకా" అంటే కూడాలి.', '2 + 4 = 6|2 + 4 = 6'], '6 balloons|6 బెలూన్లు', emo('🎈🎈 ➕ 🎈🎈🎈🎈')),
        EX('5 children play. 3 more come. How many children play now?|5 మంది పిల్లలు ఆడుతున్నారు. ఇంకా 3 మంది వచ్చారు. ఇప్పుడు ఎంతమంది?', ['Start at 5. Count on 3: 6, 7, 8.|5 నుండి 3 ముందుకు: 6, 7, 8.'], '8 children|8 మంది పిల్లలు'),
      ],
      practice: [
        addStoryT('story', 3, 9),
        tp('pair', (r) => {
          const n = r.int(4, 9), a = r.int(1, n - 1);
          const ok = `${a} + ${n - a}`;
          const wr = [`${a} + ${n - a + 1}`, `${a + 1} + ${n - a + 1}`, n - a > 1 ? `${a} + ${n - a - 1}` : `${a + 2} + ${n - a}`];
          return mcq(r, `Which two numbers make ${n}?|ఏ రెండు సంఖ్యలు కలిపితే ${n}?`, `${ok}|${ok}`, wr.map((w) => `${w}|${w}`), ['Add each pair. Which one gives the total?|ప్రతి జతను కూడు. ఏది మొత్తం ఇస్తుంది?'],
            [`${ok} = ${n}|${ok} = ${n}`], [['wrong', 'Add that pair on your fingers. It does not make the number.|ఆ జతను వేళ్ళ మీద కూడు. అది ఆ సంఖ్య రాదు.']]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 8 Subtraction up to 9
const ch8: USpec = {
  id: 'ts1.ma.ch8', subject: 'math', title: T('Subtraction of Numbers up to 9|9 వరకు సంఖ్యల తీసివేత'), source: src(8),
  objectives: [
    {
      id: 'ts1.ma.sub9.take', title: T('Take away and count what is left|తీసేసి మిగిలినవి లెక్కించు'), prereqs: ['ts1.ma.add9.join'],
      activities: ['game:counting'],
      intro: [
        H('Taking away|తీసివేయడం'),
        P('5 birds sit on a tree. 2 birds fly away.|చెట్టు మీద 5 పక్షులు ఉన్నాయి. 2 ఎగిరిపోయాయి.'),
        V(emo('🐦🐦🐦❌❌'), 'Three birds stay. The crosses show the ones that flew away.|మూడు పక్షులు ఉన్నాయి. అడ్డ గుర్తులు ఎగిరిపోయినవాటిని చూపిస్తాయి.'),
        P('3 birds are left. We write 5 − 2 = 3. We say "five minus two is three".|3 పక్షులు మిగిలాయి. 5 − 2 = 3 అని రాస్తాం. "ఐదు తీసివేత రెండు సమానం మూడు" అంటాం.'),
        PH('🍌', 'You had 4 bananas and ate 1. Now 3 are left.|నీ దగ్గర 4 అరటి పండ్లు ఉన్నాయి, 1 తిన్నావు. ఇప్పుడు 3 మిగిలాయి.'),
        TIP('Cover the ones taken away with your hand. Count the ones you still see.|తీసేసినవాటిని చేతితో కప్పు. ఇంకా కనిపించేవాటిని లెక్కించు.'),
      ],
      examples: [
        EX('7 apples. 3 are eaten. How many are left?|7 ఆపిల్ పండ్లు. 3 తినేశారు. ఎన్ని మిగిలాయి?', ['Cross out 3.|3 అడ్డంగా కొట్టు.', 'Count the rest: 1, 2, 3, 4.|మిగిలినవి లెక్కించు: 1, 2, 3, 4.', '7 − 3 = 4|7 − 3 = 4'], '4 apples|4 ఆపిల్ పండ్లు', emo('🍎🍎🍎🍎❌❌❌')),
        EX('6 balloons. 1 bursts. How many are left?|6 బెలూన్లు. 1 పగిలిపోయింది. ఎన్ని మిగిలాయి?', ['One less than 6 is 5.|6 కంటే ఒకటి తక్కువ 5.', '6 − 1 = 5|6 − 1 = 5'], '5 balloons|5 బెలూన్లు', emo('🎈🎈🎈🎈🎈❌')),
      ],
      practice: [
        tp('cross', (r) => {
          const [a, b] = diffPair(r, 3, 9, 8), t = r.pick(OBJ);
          return countQ(`There were ${a} ${t.en}. The crossed ones are gone. How many ${t.en} are left?|${a} ${t.te} ఉండేవి. అడ్డ గుర్తు ఉన్నవి పోయాయి. ఎన్ని ${t.te} మిగిలాయి?`, a - b, emo(`${t.e.repeat(a - b)}${'❌'.repeat(b)}`),
            ['Count only the pictures, not the crosses.|అడ్డ గుర్తులు కాదు, బొమ్మలను మాత్రమే లెక్కించు.'], [`${a} − ${b} = ${a - b}. ${a - b} ${t.en} are left.|${a} − ${b} = ${a - b}. ${a - b} ${t.te} మిగిలాయి.`],
            [[String(a), 'That counts the crosses too. Count only what is left.|అడ్డ గుర్తులనూ లెక్కించావు. మిగిలినవి మాత్రమే లెక్కించు.'], [String(b), 'That is how many went away. Count the ones that stay.|అవి పోయినవి. ఉన్నవాటిని లెక్కించు.']]);
        }),
        subStoryT('story', 3, 9, 8),
      ],
    },
    {
      id: 'ts1.ma.sub9.sent', title: T('Subtract numbers up to 9|9 వరకు సంఖ్యలు తీసివేయి'), prereqs: ['ts1.ma.sub9.take'],
      activities: ['game:numberline'],
      intro: [
        H('Count back|వెనక్కి లెక్కించు'),
        P('To find 8 − 3, start at 8 and hop back 3: 7, 6, 5.|8 − 3 కోసం 8 దగ్గర మొదలుపెట్టి 3 వెనక్కి గెంతు: 7, 6, 5.'),
        V(line(0, 10, [8, 5], [[8, 7], [7, 6], [6, 5]]), 'Start at 8 and hop back 3 times to reach 5|8 నుండి 3 గెంతులు వెనక్కి వేస్తే 5'),
        KP('Take away 0: the number stays the same.|0 తీసేస్తే సంఖ్య మారదు.', 'Take away all: 0 is left.|అన్నీ తీసేస్తే 0 మిగులుతుంది.'),
        TIP('Adding goes forward on the line. Taking away goes back.|కూడితే సంఖ్యారేఖపై ముందుకు. తీసేస్తే వెనక్కి.'),
      ],
      examples: [
        EX('9 − 2 = ?|9 − 2 = ?', ['Start at 9.|9 దగ్గర మొదలుపెట్టు.', 'Hop back 2: 8, 7.|2 వెనక్కి: 8, 7.'], '7|7', line(0, 10, [9, 7], [[9, 8], [8, 7]])),
        EX('5 − 5 = ?|5 − 5 = ?', ['Take away all 5.|ఐదూ తీసేయి.', 'Nothing is left.|ఏమీ మిగల్లేదు.'], '0|0'),
      ],
      practice: [
        diffT('diff', 2, 9, 9),
        tp('fact', (r) => {
          const [a, b] = addends(r, 3, 9), c = a + b;
          const [x, y] = r.int(0, 1) === 0 ? [a, b] : [b, a];
          return typed(`${a} + ${b} = ${c}. So ${c} − ${x} = ?|${a} + ${b} = ${c}. కాబట్టి ${c} − ${x} = ?`, y, ['Adding and taking away are a family.|కూడిక, తీసివేత ఒక కుటుంబం.', `Take ${x} away from ${c}; the other part is left.|${c} నుండి ${x} తీసేస్తే రెండో భాగం మిగులుతుంది.`],
            [`${c} is ${x} and ${y}. Take away ${x}, and ${y} is left.|${c} అంటే ${x}, ${y}. ${x} తీసేస్తే ${y} మిగులుతుంది.`, `${c} − ${x} = ${y}|${c} − ${x} = ${y}`], [[String(c + x), 'You added. Take away instead.|నువ్వు కూడావు. తీసివేయాలి.']]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 9 Numbers from 10 to 20
const ch9: USpec = {
  id: 'ts1.ma.ch9', subject: 'math', title: T('Numbers from 10 to 20|10 నుండి 20 వరకు సంఖ్యలు'), source: src(9),
  objectives: [
    {
      id: 'ts1.ma.n20.count', title: T('Count from 10 to 20|10 నుండి 20 వరకు లెక్కించు'), prereqs: ['ts1.ma.n69.count', 'ts1.ma.zero.line'],
      activities: ['game:counting'],
      intro: [
        H('Ten is special|పది ప్రత్యేకమైనది'),
        P('Count 10 things. Put them in one group. A group of 10 is called one ten.|10 వస్తువులు లెక్కించు. వాటిని ఒక గుంపుగా పెట్టు. 10 ఉన్న గుంపును ఒక పది అంటాం.'),
        V(obj('✏️', 10, 10), 'Ten pencils make one ten|పది పెన్సిళ్ళు కలిపి ఒక పది'),
        P('10 and 3 more make 13. 10 and 7 more make 17.|10, ఇంకా 3 కలిపి 13. 10, ఇంకా 7 కలిపి 17.'),
        V(obj('🥚', 13, 10), 'Thirteen eggs: one ten and 3 ones|పదమూడు గుడ్లు: ఒక పది, 3 ఒకట్లు'),
        PH('👐', 'Two hands have 10 fingers: one ten!|రెండు చేతులకు 10 వేళ్ళు: ఒక పది!'),
        TIP('Do not count the first row again. It has 10. Count on from 10.|మొదటి వరుసను మళ్ళీ లెక్కించకు. అందులో 10. 10 నుండి ముందుకు లెక్కించు.'),
      ],
      examples: [
        EX('How many eggs?|ఎన్ని గుడ్లు?', ['The first row has 10.|మొదటి వరుసలో 10.', 'Count on: 11, 12, 13, 14, 15.|ముందుకు: 11, 12, 13, 14, 15.'], '15 eggs|15 గుడ్లు', obj('🥚', 15, 10)),
        EX('1 ten and 8 ones make which number?|1 పది, 8 ఒకట్లు కలిపి ఏ సంఖ్య?', ['10 and 8 more.|10, ఇంకా 8.', 'Write 1 for the ten and 8 for the ones.|పదికి 1, ఒకట్లకు 8 రాయి.'], '18|18'),
      ],
      practice: [
        countT('count', 10, 20, 10),
        tp('tenones', (r) => {
          const o = r.int(0, 9), t = r.pick(OBJ);
          return typed(`1 ten and ${o} ones. What is the number?|1 పది, ${o} ఒకట్లు. ఆ సంఖ్య ఏది?`, 10 + o, ['Start at 10. Count on the ones.|10 దగ్గర మొదలుపెట్టు. ఒకట్లను ముందుకు లెక్కించు.'],
            [`10 and ${o} more is ${10 + o}.|10, ఇంకా ${o} అంటే ${10 + o}.`], [[String(o), 'Do not forget the ten!|పదిని మరచిపోకు!'], [String(o + 1), 'One ten is 10, not 1. Start at 10.|ఒక పది అంటే 10, 1 కాదు. 10 నుండి మొదలుపెట్టు.']], { visual: obj(t.e, 10 + o, 10) });
        }),
      ],
    },
    {
      id: 'ts1.ma.n20.read', title: T('Names and order of 10 to 20|10 నుండి 20 పేర్లు, వరుస'), prereqs: ['ts1.ma.n20.count'],
      activities: ['game:numberline', 'art:trace'],
      intro: [
        stepsB(...range(10, 20).map((n) => L(`${n} — ${enW(n)}`, `${n} — ${teW(n)}`))),
        V(line(10, 20), 'Number line from 10 to 20|10 నుండి 20 సంఖ్యారేఖ'),
        P('After 19 comes 20. 20 is two tens.|19 తర్వాత 20. 20 అంటే రెండు పదులు.'),
        TIP('12 and 21 are different! 12 is one ten and 2 ones.|12, 21 వేరు! 12 అంటే ఒక పది, 2 ఒకట్లు.'),
      ],
      examples: [
        EX('Which comes just after 16?|16 తర్వాత వెంటనే ఏది?', ['Count: 16, 17.|లెక్కించు: 16, 17.'], '17|17', line(10, 20, [16, 17], [[16, 17]])),
        EX('Which is more: 14 or 19?|14, 19 — ఏది ఎక్కువ?', ['Both have one ten.|రెండిట్లో ఒక పది.', '9 ones is more than 4 ones.|4 ఒకట్ల కంటే 9 ఒకట్లు ఎక్కువ.'], '19|19'),
      ],
      practice: [nameT('name', 11, 20), babT('bab', 10, 20), moreLessT('more', 10, 20, false), sortT('sort', 10, 20)],
    },
  ],
};

// ================================================================== CH 10 Addition, total not exceeding 20
const ch10: USpec = {
  id: 'ts1.ma.ch10', subject: 'math', title: T('Addition of Numbers, the Total Not Exceeding 20|సంఖ్యల కూడిక (మొత్తం 20 మించకుండా)'), source: src(10),
  objectives: [
    {
      id: 'ts1.ma.add20.on', title: T('Count on to add up to 20|20 వరకు ముందుకు లెక్కించి కూడు'), prereqs: ['ts1.ma.add9.sum', 'ts1.ma.n20.read'],
      activities: ['game:numberline'],
      intro: [
        P('To add 12 + 5, start at 12. Count on 5: 13, 14, 15, 16, 17.|12 + 5 కోసం 12 దగ్గర మొదలుపెట్టు. 5 ముందుకు: 13, 14, 15, 16, 17.'),
        V(line(10, 20, [12, 17], [[12, 13], [13, 14], [14, 15], [15, 16], [16, 17]]), '12 and 5 hops make 17|12 నుండి 5 గెంతులు = 17'),
        KP('Start with the bigger number.|పెద్ద సంఖ్యతో మొదలుపెట్టు.', '3 + 14 is the same as 14 + 3.|3 + 14, 14 + 3 ఒకటే.'),
        PH('🪔', 'Sita lit 12 lamps. Kiran lit 5 more. Count on from 12 to find all the lamps.|సీత 12 దీపాలు వెలిగించింది. కిరణ్ ఇంకా 5 వెలిగించాడు. 12 నుండి ముందుకు లెక్కించి మొత్తం కనుక్కో.'),
        TIP('Say the big number aloud, then count on with fingers.|పెద్ద సంఖ్యను గట్టిగా చెప్పి, వేళ్ళతో ముందుకు లెక్కించు.'),
      ],
      examples: [
        EX('3 + 14 = ?|3 + 14 = ?', ['Start at the bigger number, 14.|పెద్ద సంఖ్య 14 నుండి మొదలుపెట్టు.', 'Count on 3: 15, 16, 17.|3 ముందుకు: 15, 16, 17.'], '17|17', line(10, 20, [14, 17], [[14, 15], [15, 16], [16, 17]])),
        EX('8 + 6 = ?|8 + 6 = ?', ['Start at 8.|8 దగ్గర మొదలుపెట్టు.', 'Count on 6: 9, 10, 11, 12, 13, 14.|6 ముందుకు: 9, 10, 11, 12, 13, 14.'], '14|14'),
      ],
      practice: [
        sumT('sum', 10, 20),
        tp('start', (r) => {
          const big = r.int(10, 17), small = r.int(1, Math.min(9, 20 - big)), first = r.int(0, 1) === 0;
          const e = first ? `${big} + ${small}` : `${small} + ${big}`;
          return mcqN(r, `To add ${e} quickly, which number do you start from?|${e} ను తొందరగా కూడటానికి ఏ సంఖ్య నుండి మొదలుపెడతావు?`, big, [small, big + small],
            ['Counting on a few is quicker than counting on many.|ఎక్కువ కాకుండా కొన్నే ముందుకు లెక్కించడం తొందర.'], [`Start at ${big} and count on ${small}: ${big + small}.|${big} నుండి ${small} ముందుకు: ${big + small}.`],
            [['wrong', 'Start from the bigger number, then count on the smaller one.|పెద్ద సంఖ్య నుండి మొదలుపెట్టి, చిన్న సంఖ్యను ముందుకు లెక్కించు.']]);
        }),
      ],
    },
    {
      id: 'ts1.ma.add20.ten', title: T('Ten and more, doubles|పది ఇంకా కొన్ని, రెట్టింపులు'), prereqs: ['ts1.ma.add20.on'],
      intro: [
        H('Adding to 10 is easy|10 కి కూడటం సులభం'),
        P('10 + 4 = 14. The 1 ten stays; the ones become 4.|10 + 4 = 14. ఒక పది అలాగే ఉంటుంది; ఒకట్లు 4 అవుతాయి.'),
        V(obj('🍊', 14, 10), '10 oranges and 4 more|10 నారింజ పండ్లు, ఇంకా 4'),
        H('Doubles|రెట్టింపులు'),
        P('A double adds a number to itself: 6 + 6 = 12.|రెట్టింపు అంటే ఒక సంఖ్యను అదే సంఖ్యతో కూడటం: 6 + 6 = 12.'),
        PH('👐', 'Two hands, 5 fingers each: 5 + 5 = 10.|రెండు చేతులు, ఒక్కోదానికి 5 వేళ్ళు: 5 + 5 = 10.'),
        TIP('Learn doubles by heart: 1+1, 2+2 … up to 10+10.|రెట్టింపులు నోటికి నేర్చుకో: 1+1, 2+2 … 10+10 దాకా.'),
      ],
      examples: [
        EX('10 + 7 = ?|10 + 7 = ?', ['1 ten and 7 ones.|1 పది, 7 ఒకట్లు.'], '17|17', obj('🍎', 17, 10)),
        EX('7 + 7 = ?|7 + 7 = ?', ['Count on 7 from 7: 8, 9, 10, 11, 12, 13, 14.|7 నుండి 7 ముందుకు: 8, 9, 10, 11, 12, 13, 14.'], '14|14'),
      ],
      practice: [
        tp('tenplus', (r) => {
          const o = r.int(1, 10), first = r.int(0, 1) === 0;
          const e = first ? `10 + ${o}` : `${o} + 10`;
          return typed(`${e} = ?|${e} = ?`, 10 + o, ['Think: 1 ten and some ones.|ఆలోచించు: 1 పది, కొన్ని ఒకట్లు.'], [`10 and ${o} more is ${10 + o}.|10, ఇంకా ${o} అంటే ${10 + o}.`],
            [[String(o + 1), 'The 10 is a whole ten, not 1.|10 అంటే ఒక మొత్తం పది, 1 కాదు.']], { visual: obj('🍎', 10 + o, 10) });
        }),
        tp('double', (r) => {
          const n = r.int(1, 10), t = r.pick(OBJ);
          return typed(`${n} + ${n} = ?|${n} + ${n} = ?`, 2 * n, [`Count on ${n} from ${n}.|${n} నుండి ${n} ముందుకు లెక్కించు.`], [`Double ${n} is ${2 * n}.|${n} రెట్టింపు ${2 * n}.`],
            [[String(n), 'You need both groups, not just one.|ఒక గుంపు కాదు, రెండూ కావాలి.']], { visual: emo(`${t.e.repeat(n)}\n${t.e.repeat(n)}`) });
        }),
      ],
    },
    {
      id: 'ts1.ma.add20.story', title: T('Addition stories up to 20|20 వరకు కూడిక కథలు'), prereqs: ['ts1.ma.add20.on'],
      intro: [
        P('Read the story. Find the two numbers. Add them.|కథ చదువు. రెండు సంఖ్యలు కనుక్కో. వాటిని కూడు.'),
        PH('🪔', 'At Deepavali, Sita lit 10 lamps. Kiran lit 6 more. 10 + 6 = 16 lamps glowed!|దీపావళికి సీత 10 దీపాలు వెలిగించింది. కిరణ్ ఇంకా 6 వెలిగించాడు. 10 + 6 = 16 దీపాలు వెలిగాయి!'),
        TIP('Underline the numbers in the story. Circle the word that says add.|కథలోని సంఖ్యల కింద గీత గీయి. కూడమని చెప్పే మాటకు సున్నా చుట్టు.'),
      ],
      examples: [
        EX('A box has 9 laddoos. Grandpa puts 5 more. How many laddoos?|డబ్బాలో 9 లడ్డూలు ఉన్నాయి. తాతయ్య ఇంకా 5 పెట్టారు. ఎన్ని లడ్డూలు?', ['Start at 9. Count on 5: 10, 11, 12, 13, 14.|9 నుండి 5 ముందుకు: 10, 11, 12, 13, 14.'], '14 laddoos|14 లడ్డూలు'),
        EX('12 boys and 7 girls are in class. How many children?|తరగతిలో 12 మంది అబ్బాయిలు, 7 మంది అమ్మాయిలు ఉన్నారు. మొత్తం ఎంతమంది?', ['12 + 7: start at 12, count on 7.|12 + 7: 12 నుండి 7 ముందుకు.'], '19 children|19 మంది పిల్లలు'),
      ],
      practice: [addStoryT('story', 10, 20), missAddT('missing', 11, 20)],
    },
  ],
};

// ================================================================== CH 11 Digital Literacy
const KEYPAD = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [-1, 0, -1]];
const KEYPAD_V = emo('1 2 3\n4 5 6\n7 8 9\n   0');
const ch11: USpec = {
  id: 'ts1.ma.ch11', subject: 'math', title: T('Digital Literacy|డిజిటల్ అక్షరాస్యత'), source: src(11),
  objectives: [
    {
      id: 'ts1.ma.digital.devices', title: T('Digital devices around us|మన చుట్టూ డిజిటల్ పరికరాలు'),
      intro: [
        H('Smart helpers|తెలివైన సహాయకులు'),
        P('A mobile phone, a computer, a TV and a calculator are digital devices.|మొబైల్ ఫోన్, కంప్యూటర్, టీవీ, కాలిక్యులేటర్ — ఇవి డిజిటల్ పరికరాలు.'),
        P('They work with electricity or a battery. Many have a screen and buttons.|అవి కరెంటుతో లేదా బ్యాటరీతో పనిచేస్తాయి. చాలావాటికి తెర, బటన్లు ఉంటాయి.'),
        PH('⏰', 'An alarm clock wakes us up on time.|అలారం గడియారం మనల్ని సమయానికి లేపుతుంది.'),
        PH('⌚', 'A watch on the wrist tells us the time.|మణికట్టు గడియారం సమయం చెబుతుంది.'),
        KP('Phone: talk to people far away.|ఫోన్: దూరంగా ఉన్నవాళ్ళతో మాట్లాడటం.', 'Calculator: do sums quickly.|కాలిక్యులేటర్: లెక్కలు తొందరగా చేయడం.', 'TV: watch news and stories.|టీవీ: వార్తలు, కథలు చూడటం.', 'Computer: type, draw and learn.|కంప్యూటర్: టైప్ చేయడం, బొమ్మలు గీయడం, నేర్చుకోవడం.'),
        TIP('Ask an elder to show you the buttons on a calculator.|కాలిక్యులేటర్ బటన్లు చూపించమని పెద్దవాళ్ళను అడుగు.'),
      ],
      examples: [
        EX('Grandma lives in another town. Which device helps you talk to her?|అమ్మమ్మ వేరే ఊళ్ళో ఉంటుంది. ఆమెతో మాట్లాడటానికి ఏ పరికరం సహాయపడుతుంది?', ['We need to talk far away.|దూరంగా మాట్లాడాలి.', 'A phone carries our voice.|ఫోన్ మన గొంతును చేరుస్తుంది.'], 'A mobile phone|మొబైల్ ఫోన్'),
        EX('Is a pencil a digital device?|పెన్సిల్ డిజిటల్ పరికరమా?', ['A pencil has no battery and no screen.|పెన్సిల్‌కు బ్యాటరీ లేదు, తెర లేదు.'], 'No|కాదు', obj('✏️', 1)),
      ],
      practice: [
        bank('use', [
          ['Which device helps you talk to someone far away?|దూరంగా ఉన్నవాళ్ళతో మాట్లాడటానికి ఏ పరికరం?', 'Mobile phone|మొబైల్ ఫోన్', ['Calculator|కాలిక్యులేటర్', 'Television|టీవీ'], 'It carries your voice.|అది నీ గొంతును చేరుస్తుంది.', 'A mobile phone lets us talk far away.|మొబైల్ ఫోన్‌తో దూరంగా మాట్లాడవచ్చు.', 'A calculator and a TV cannot carry your voice to a friend.|కాలిక్యులేటర్, టీవీ నీ గొంతును స్నేహితుడికి చేర్చలేవు.'],
          ['Which device helps you add numbers quickly?|సంఖ్యలను తొందరగా కూడటానికి ఏ పరికరం?', 'Calculator|కాలిక్యులేటర్', ['Television|టీవీ', 'Alarm clock|అలారం గడియారం'], 'It has number buttons and a "+" button.|దానికి అంకెల బటన్లు, "+" బటన్ ఉంటాయి.', 'A calculator does sums.|కాలిక్యులేటర్ లెక్కలు చేస్తుంది.', 'Look for the device with number buttons.|అంకెల బటన్లు ఉన్న పరికరాన్ని చూడు.'],
          ['Which device shows news and cartoons on a big screen at home?|ఇంట్లో పెద్ద తెరపై వార్తలు, కార్టూన్లు చూపించేది ఏది?', 'Television|టీవీ', ['Calculator|కాలిక్యులేటర్', 'Watch|గడియారం'], 'The family watches it together.|కుటుంబం అంతా కలిసి చూస్తుంది.', 'A television shows news and cartoons.|టీవీ వార్తలు, కార్టూన్లు చూపిస్తుంది.', 'A calculator and a watch have very small screens.|కాలిక్యులేటర్, గడియారం తెరలు చాలా చిన్నవి.'],
          ['Which device wakes you up in the morning with a ring?|ఉదయం మోగి నిన్ను లేపేది ఏది?', 'Alarm clock|అలారం గడియారం', ['Calculator|కాలిక్యులేటర్', 'Television|టీవీ'], 'It rings at a set time.|అది పెట్టిన సమయానికి మోగుతుంది.', 'An alarm clock wakes us up.|అలారం గడియారం మనల్ని లేపుతుంది.', 'An alarm clock is the one that rings on time.|సమయానికి మోగేది అలారం గడియారం.', obj('⏰', 1)],
          ['Which device has a keyboard for typing letters?|అక్షరాలు టైప్ చేయడానికి కీబోర్డ్ ఉండేది ఏది?', 'Computer|కంప్యూటర్', ['Alarm clock|అలారం గడియారం', 'Watch|గడియారం'], 'It has many keys with letters.|దానికి అక్షరాల కీలు చాలా ఉంటాయి.', 'A computer has a keyboard.|కంప్యూటర్‌కు కీబోర్డ్ ఉంటుంది.', 'Clocks and watches have no letter keys.|గడియారాలకు అక్షరాల కీలు ఉండవు.'],
          ['Which device do you wear on your wrist to know the time?|సమయం తెలుసుకోవడానికి మణికట్టుకు పెట్టుకునేది ఏది?', 'Watch|గడియారం', ['Computer|కంప్యూటర్', 'Television|టీవీ'], 'It is small and goes on your hand.|అది చిన్నది, చేతికి పెట్టుకుంటాం.', 'A watch tells the time on your wrist.|గడియారం మణికట్టు మీద సమయం చెబుతుంది.', 'A computer and a TV are too big to wear.|కంప్యూటర్, టీవీ పెట్టుకోవడానికి చాలా పెద్దవి.', obj('⌚', 1)],
        ]),
        tapT('digital', 'Tap ALL the digital devices.|డిజిటల్ పరికరాలన్నీ నొక్కు.', ['mobile phone|మొబైల్ ఫోన్', 'computer|కంప్యూటర్', 'television|టీవీ', 'calculator|కాలిక్యులేటర్', 'tablet|ట్యాబ్లెట్'],
          ['pencil|పెన్సిల్', 'ball|బంతి', 'book|పుస్తకం', 'broom|చీపురు', 'spoon|చెంచా'], ['Does it have a screen or need a battery?|దానికి తెర ఉందా, బ్యాటరీ కావాలా?'], 'Digital devices use electricity or a battery. A pencil or a ball does not.|డిజిటల్ పరికరాలు కరెంటు లేదా బ్యాటరీతో పనిచేస్తాయి. పెన్సిల్, బంతి అలా కాదు.'),
      ],
    },
    {
      id: 'ts1.ma.digital.safe', title: T('Using devices safely|పరికరాలను జాగ్రత్తగా వాడటం'), prereqs: ['ts1.ma.digital.devices'],
      intro: [
        H('Be safe, be smart|జాగ్రత్తగా, తెలివిగా'),
        KP('Ask an elder before you use a phone.|ఫోన్ వాడే ముందు పెద్దవాళ్ళను అడుగు.', 'Use it for a short time. Rest your eyes.|కొద్దిసేపే వాడు. కళ్ళకు విశ్రాంతి ఇవ్వు.', 'Keep it away from water. Touch it with dry hands.|నీళ్ళకు దూరంగా ఉంచు. పొడి చేతులతో తాకు.', 'Never tell a stranger your name, address or a code.|తెలియనివాళ్ళకు నీ పేరు, చిరునామా, కోడ్ ఎప్పుడూ చెప్పకు.'),
        PH('💧', 'Water can spoil a phone. Keep devices dry.|నీళ్ళు ఫోన్‌ను పాడుచేస్తాయి. పరికరాలను పొడిగా ఉంచు.'),
        REM('If something on a screen makes you feel scared, tell your parents or teacher.|తెరపై ఏదైనా భయం కలిగిస్తే అమ్మానాన్నలకు లేదా టీచర్‌కు చెప్పు.'),
      ],
      examples: [
        EX('Should you play on the phone the whole day?|రోజంతా ఫోన్‌లో ఆడవచ్చా?', ['Too much screen time hurts the eyes.|ఎక్కువసేపు తెర చూస్తే కళ్ళు నొప్పెడతాయి.', 'Play outside too!|బయట కూడా ఆడు!'], 'No|కాదు'),
        EX('Your hands are wet. Should you touch the TV switch?|నీ చేతులు తడిగా ఉన్నాయి. టీవీ స్విచ్ తాకవచ్చా?', ['Water and electricity are dangerous together.|నీళ్ళు, కరెంటు కలిస్తే ప్రమాదం.', 'Dry your hands first.|ముందు చేతులు తుడుచుకో.'], 'No|కాదు'),
      ],
      practice: [
        bank('safe', [
          ['Should you ask an elder before using a phone?|ఫోన్ వాడే ముందు పెద్దవాళ్ళను అడగాలా?', 'Yes|అవును', ['No|కాదు'], 'Elders keep us safe.|పెద్దవాళ్ళు మనల్ని కాపాడుతారు.', 'Yes, always ask an elder first.|అవును, ఎప్పుడూ ముందు పెద్దవాళ్ళను అడుగు.', 'Asking first keeps you and the phone safe.|ముందు అడిగితే నువ్వు, ఫోన్ రెండూ క్షేమం.'],
          ['Should you touch a phone charger with wet hands?|తడి చేతులతో ఫోన్ చార్జర్ తాకవచ్చా?', 'No|కాదు', ['Yes|అవును'], 'Water and electricity do not mix.|నీళ్ళు, కరెంటు కలవకూడదు.', 'No. Dry your hands first.|కాదు. ముందు చేతులు తుడుచుకో.', 'Wet hands near electricity can hurt you.|కరెంటు దగ్గర తడి చేతులు ప్రమాదం.'],
          ['A stranger asks for your home address in a game. Should you tell?|ఆటలో తెలియని వ్యక్తి నీ ఇంటి చిరునామా అడిగారు. చెప్పాలా?', 'No|కాదు', ['Yes|అవును'], 'Strangers should not know where you live.|నువ్వు ఎక్కడ ఉంటావో తెలియనివాళ్ళకు తెలియకూడదు.', 'No. Tell your parents at once.|కాదు. వెంటనే అమ్మానాన్నలకు చెప్పు.', 'Keep your name and address private.|నీ పేరు, చిరునామా రహస్యంగా ఉంచు.'],
          ['Should you rest your eyes after using a screen for some time?|కొంతసేపు తెర చూశాక కళ్ళకు విశ్రాంతి ఇవ్వాలా?', 'Yes|అవును', ['No|కాదు'], 'Eyes get tired.|కళ్ళు అలసిపోతాయి.', 'Yes. Look far away and blink.|అవును. దూరంగా చూసి కళ్ళు ఆర్పు.', 'Resting your eyes keeps them healthy.|విశ్రాంతి ఇస్తే కళ్ళు ఆరోగ్యంగా ఉంటాయి.'],
          ['Should you play on a phone all day and all night?|పగలంతా రాత్రంతా ఫోన్‌లో ఆడవచ్చా?', 'No|కాదు', ['Yes|అవును'], 'Your body needs play and sleep.|నీ శరీరానికి ఆట, నిద్ర కావాలి.', 'No. Use it for a short time only.|కాదు. కొద్దిసేపే వాడు.', 'Too much screen time is bad for eyes and sleep.|ఎక్కువసేపు తెర చూడటం కళ్ళకు, నిద్రకు మంచిది కాదు.'],
          ['Something on the screen scares you. Should you tell an elder?|తెరపై ఏదో భయపెట్టింది. పెద్దవాళ్ళకు చెప్పాలా?', 'Yes|అవును', ['No|కాదు'], 'Elders can help you.|పెద్దవాళ్ళు సహాయం చేస్తారు.', 'Yes. Always tell a parent or teacher.|అవును. ఎప్పుడూ అమ్మానాన్నలకు లేదా టీచర్‌కు చెప్పు.', 'You never have to keep a scary thing secret.|భయపెట్టేదాన్ని రహస్యంగా ఉంచనక్కర్లేదు.'],
          ['Should you hold a tablet carefully with both hands?|ట్యాబ్లెట్‌ను రెండు చేతులతో జాగ్రత్తగా పట్టుకోవాలా?', 'Yes|అవును', ['No|కాదు'], 'It can break if it falls.|కింద పడితే పగిలిపోతుంది.', 'Yes. Hold it with both hands.|అవును. రెండు చేతులతో పట్టుకో.', 'Devices break easily when dropped.|పడితే పరికరాలు సులువుగా పగులుతాయి.'],
        ]),
      ],
    },
    {
      id: 'ts1.ma.digital.keypad', title: T('Numbers on a keypad|కీప్యాడ్‌పై అంకెలు'), prereqs: ['ts1.ma.digital.devices', 'ts1.ma.zero.line'],
      intro: [
        P('Phones and calculators have number keys. They sit in rows.|ఫోన్లకు, కాలిక్యులేటర్లకు అంకెల కీలు ఉంటాయి. అవి వరుసల్లో ఉంటాయి.'),
        V(KEYPAD_V, 'A phone keypad: 1 2 3 on top, then 4 5 6, then 7 8 9, and 0 at the bottom|ఫోన్ కీప్యాడ్: పైన 1 2 3, తర్వాత 4 5 6, 7 8 9, కింద 0'),
        P('To call 108 for an ambulance, press the keys one by one:|అంబులెన్స్ కోసం 108 కి ఫోన్ చేయాలంటే కీలు ఒక్కొక్కటిగా నొక్కు:'),
        ST('Press 1.|1 నొక్కు.', 'Press 0.|0 నొక్కు.', 'Press 8.|8 నొక్కు.'),
        TIP('Look at a real phone keypad with an elder. Find 0. Where is it?|పెద్దవాళ్ళతో నిజమైన ఫోన్ కీప్యాడ్ చూడు. 0 ఎక్కడ ఉంది?'),
      ],
      examples: [
        EX('On the keypad, which key is just below 2?|కీప్యాడ్‌పై 2 కి సరిగ్గా కింద ఉన్న కీ ఏది?', ['2 is in the top row, in the middle.|2 పై వరుసలో మధ్యలో ఉంది.', 'Go one row down: 5.|ఒక వరుస కిందికి: 5.'], '5|5', KEYPAD_V),
        EX('To type 47, which key do you press first?|47 టైప్ చేయడానికి ముందు ఏ కీ నొక్కుతావు?', ['We read 47 as four, seven.|47 ను నాలుగు, ఏడు అని చదువుతాం.', 'The first digit is 4.|మొదటి అంకె 4.'], '4|4'),
      ],
      practice: [
        tp('keys', (r) => {
          const dirs: [string, number, number][] = [['just right of|కి కుడి పక్కన', 0, 1], ['just left of|కి ఎడమ పక్కన', 0, -1], ['just below|కి సరిగ్గా కింద', 1, 0], ['just above|కి సరిగ్గా పైన', -1, 0]];
          const opts: [number, number, number][] = [];
          KEYPAD.forEach((row, i) => row.forEach((k, j) => {
            if (k < 0) return;
            dirs.forEach(([, di, dj], d) => { const v = KEYPAD[i + di]?.[j + dj]; if (v !== undefined && v >= 0) opts.push([k, d, v]); });
          }));
          const [k, d, v] = r.pick(opts);
          const D = T(dirs[d][0]);
          return typed(`On the keypad, which key is ${D.en} ${k}?|కీప్యాడ్‌పై ${k} ${D.te} ఉన్న కీ ఏది?`, v, [`Find ${k} first.|ముందు ${k} ను వెతుకు.`, 'Then move one step.|తర్వాత ఒక అడుగు జరుగు.'],
            [`The key ${D.en} ${k} is ${v}.|${k} ${D.te} ఉన్న కీ ${v}.`], [], { visual: KEYPAD_V });
        }),
        tp('press', (r) => {
          const n = r.int(10, 99), which = r.int(0, 1);
          const digit = which === 0 ? Math.floor(n / 10) : n % 10;
          const W = T(which === 0 ? 'first|మొదట' : 'second|రెండోసారి');
          return typed(`To type ${n} on a phone, which key do you press ${W.en}?|ఫోన్‌లో ${n} టైప్ చేయడానికి ${W.te} ఏ కీ నొక్కుతావు?`, digit, ['Read the number from left to right.|సంఖ్యను ఎడమ నుండి కుడికి చదువు.'],
            [`${n} is typed as ${Math.floor(n / 10)} then ${n % 10}. The ${W.en} key is ${digit}.|${n} ను ${Math.floor(n / 10)}, తర్వాత ${n % 10} గా టైప్ చేస్తాం. ${W.te} నొక్కే కీ ${digit}.`],
            [[String(which === 0 ? n % 10 : Math.floor(n / 10)), 'Check the order: we type from left to right.|వరుస చూడు: ఎడమ నుండి కుడికి టైప్ చేస్తాం.']], { visual: KEYPAD_V });
        }),
      ],
    },
  ],
};

// ================================================================== CH 12 Subtraction not exceeding 20
const ch12: USpec = {
  id: 'ts1.ma.ch12', subject: 'math', title: T('Subtraction of Numbers Not Exceeding 20|20 మించని సంఖ్యల తీసివేత'), source: src(12),
  objectives: [
    {
      id: 'ts1.ma.sub20.back', title: T('Count back to subtract within 20|20 లోపు వెనక్కి లెక్కించి తీసివేయి'), prereqs: ['ts1.ma.sub9.sent', 'ts1.ma.n20.read'],
      activities: ['game:numberline'],
      intro: [
        P('To find 15 − 4, start at 15. Hop back 4: 14, 13, 12, 11.|15 − 4 కోసం 15 దగ్గర మొదలుపెట్టు. 4 వెనక్కి: 14, 13, 12, 11.'),
        V(line(10, 20, [15, 11], [[15, 14], [14, 13], [13, 12], [12, 11]]), '15 hop back 4 times to 11|15 నుండి 4 గెంతులు వెనక్కి = 11'),
        KP('17 − 7 = 10: take away the ones, the ten is left.|17 − 7 = 10: ఒకట్లు తీసేస్తే పది మిగులుతుంది.', '17 − 10 = 7: take away the ten, the ones are left.|17 − 10 = 7: పది తీసేస్తే ఒకట్లు మిగులుతాయి.'),
        PH('🪙', 'You have ₹15 and spend ₹5. ₹10 is left.|నీ దగ్గర ₹15 ఉంది, ₹5 ఖర్చు చేశావు. ₹10 మిగిలింది.'),
        TIP('Fold one finger for each hop back.|వెనక్కి ప్రతి గెంతుకు ఒక వేలు మడువు.'),
      ],
      examples: [
        EX('18 − 5 = ?|18 − 5 = ?', ['Start at 18.|18 దగ్గర మొదలుపెట్టు.', 'Back 5: 17, 16, 15, 14, 13.|5 వెనక్కి: 17, 16, 15, 14, 13.'], '13|13', line(10, 20, [18, 13], back(18, 5))),
        EX('14 − 10 = ?|14 − 10 = ?', ['14 is 1 ten and 4 ones.|14 అంటే 1 పది, 4 ఒకట్లు.', 'Take away the ten. 4 ones are left.|పదిని తీసేయి. 4 ఒకట్లు మిగులుతాయి.'], '4|4'),
      ],
      practice: [
        diffT('diff', 11, 20, 9),
        tp('teen', (r) => {
          const o = r.int(1, 9), n = 10 + o, k = r.int(0, 1);
          const [b, a] = k === 0 ? [o, 10] : [10, o];
          return typed(`${n} − ${b} = ?|${n} − ${b} = ?`, a, [`${n} is 1 ten and ${o} ones.|${n} అంటే 1 పది, ${o} ఒకట్లు.`, k === 0 ? 'Take away all the ones.|ఒకట్లన్నీ తీసేయి.' : 'Take away the ten.|పదిని తీసేయి.'],
            [`${n} − ${b} = ${a}|${n} − ${b} = ${a}`], [[String(n + b), 'You added. Take away instead.|నువ్వు కూడావు. తీసివేయాలి.']], { visual: obj('🥚', n, 10) });
        }),
      ],
    },
    {
      id: 'ts1.ma.sub20.story', title: T('Take-away stories and how many more|తీసివేత కథలు, ఎన్ని ఎక్కువ'), prereqs: ['ts1.ma.sub20.back'],
      intro: [
        P('Some stories ask what is left. Some ask how many more. Both mean take away.|కొన్ని కథలు ఎన్ని మిగిలాయని అడుగుతాయి. కొన్ని ఎన్ని ఎక్కువ అని అడుగుతాయి. రెండింటికీ తీసివేయాలి.'),
        PH('🐟', 'Imran caught 13 fish. Joseph caught 9. Imran caught 13 − 9 = 4 more.|ఇమ్రాన్ 13 చేపలు, జోసెఫ్ 9 పట్టారు. ఇమ్రాన్ 13 − 9 = 4 ఎక్కువ పట్టాడు.'),
        TIP('For "how many more", count up from the smaller number to the bigger one.|"ఎన్ని ఎక్కువ" కి చిన్న సంఖ్య నుండి పెద్ద సంఖ్యదాకా ముందుకు లెక్కించు.'),
      ],
      examples: [
        EX('There are 16 mangoes. 6 are sold. How many are left?|16 మామిడి పండ్లు ఉన్నాయి. 6 అమ్మేశారు. ఎన్ని మిగిలాయి?', ['16 − 6: take away the ones.|16 − 6: ఒకట్లు తీసేయి.'], '10 mangoes|10 మామిడి పండ్లు'),
        EX('Priya has 12 bangles. Sana has 8. How many more does Priya have?|ప్రియ దగ్గర 12 గాజులు, సనా దగ్గర 8. ప్రియ దగ్గర ఎన్ని ఎక్కువ?', ['Count up from 8 to 12: 9, 10, 11, 12.|8 నుండి 12 దాకా: 9, 10, 11, 12.', 'That is 4 steps.|అవి 4 అడుగులు.'], '4 more|4 ఎక్కువ'),
      ],
      practice: [
        subStoryT('story', 11, 20, 9),
        tp('compare', (r) => {
          const a = r.int(10, 20), b = r.int(Math.max(1, a - 9), a - 1), w1 = nm(r), w2 = r.pick(NAMES.filter((x) => x.en !== w1.en)), t = r.pick(ITEMS);
          return typed(`${w1.en} has ${a} ${t.en}. ${w2.en} has ${b} ${t.en}. How many more ${t.en} does ${w1.en} have?|${w1.te} దగ్గర ${a} ${t.te}, ${w2.te} దగ్గర ${b} ${t.te} ఉన్నాయి. ${w1.te} దగ్గర ఎన్ని ఎక్కువ?`, a - b,
            [`Count up from ${b} to ${a}.|${b} నుండి ${a} దాకా ముందుకు లెక్కించు.`, `Or find ${a} − ${b}.|లేదా ${a} − ${b} కనుక్కో.`], [`${a} − ${b} = ${a - b}. ${w1.en} has ${a - b} more.|${a} − ${b} = ${a - b}. ${w1.te} దగ్గర ${a - b} ఎక్కువ.`],
            [[String(a + b), 'Do not add. Find the difference.|కూడకు. తేడా కనుక్కో.'], [String(a), `That is how many ${w1.en} has. Find how many MORE.|అది ${w1.te} దగ్గర ఉన్నవి. ఎన్ని ఎక్కువో కనుక్కో.`]], { visual: line(0, 20, [b, a], fwd(b, a - b)) });
        }),
      ],
    },
  ],
};

// ================================================================== CH 13 Introduction of Tens from 10 to 100
const BUNDLE = '🪵';
const STICK = '🥢';
const ch13: USpec = {
  id: 'ts1.ma.ch13', subject: 'math', title: T('Introduction of Tens from 10 to 100|10 నుండి 100 వరకు పదుల పరిచయం'), source: src(13),
  objectives: [
    {
      id: 'ts1.ma.tens.bundle', title: T('Bundles of ten|పదుల కట్టలు'), prereqs: ['ts1.ma.n20.count'],
      activities: ['game:counting'],
      intro: [
        H('Make a bundle|కట్ట కట్టు'),
        P('Count 10 sticks. Tie them with a rubber band. Now you have one bundle. One bundle is one ten.|10 పుల్లలు లెక్కించు. రబ్బరు బ్యాండుతో కట్టు. ఇప్పుడు ఒక కట్ట. ఒక కట్ట అంటే ఒక పది.'),
        PH('🪵', 'In our pictures, this log stands for one bundle of 10 sticks.|మన బొమ్మల్లో ఈ దుంగ 10 పుల్లల ఒక కట్టను సూచిస్తుంది.'),
        V(obj(BUNDLE, 3), 'Three bundles: 10, 20, 30|మూడు కట్టలు: 10, 20, 30'),
        P('Count bundles in tens: 10, 20, 30, 40 …|కట్టలను పదులలో లెక్కించు: 10, 20, 30, 40 …'),
        PH('🧮', 'One row of an abacus often has 10 beads: one ten.|పూసల చట్రంలో ఒక వరుసకు 10 పూసలు: ఒక పది.'),
        REM('10 tens make 100 (one hundred).|10 పదులు కలిపి 100 (వంద).'),
        TIP('Count bundles, not sticks. Bundles are quicker!|పుల్లలు కాదు, కట్టలు లెక్కించు. కట్టలు తొందర!'),
      ],
      examples: [
        EX('How many sticks in 4 bundles?|4 కట్టల్లో ఎన్ని పుల్లలు?', ['Count in tens: 10, 20, 30, 40.|పదులలో లెక్కించు: 10, 20, 30, 40.'], '40 sticks|40 పుల్లలు', obj(BUNDLE, 4)),
        EX('How many tens make 70?|ఎన్ని పదులు కలిపితే 70?', ['Count in tens until you say 70: 10, 20, 30, 40, 50, 60, 70.|70 వచ్చేదాకా పదులలో లెక్కించు: 10, 20, 30, 40, 50, 60, 70.', 'That is 7 counts.|అవి 7 లెక్కలు.'], '7 tens|7 పదులు'),
      ],
      practice: [
        tp('bundles', (r) => {
          const n = r.int(1, 10);
          const tens = range(1, n).map((x) => x * 10).join(', ');
          return countQ(`Each bundle has 10 sticks. How many sticks in all?|ప్రతి కట్టలో 10 పుల్లలు. మొత్తం ఎన్ని పుల్లలు?`, n * 10, obj(BUNDLE, n),
            ['Count in tens: 10, 20, 30 …|పదులలో లెక్కించు: 10, 20, 30 …'], [`${tens}. There are ${n * 10} sticks.|${tens}. మొత్తం ${n * 10} పుల్లలు.`],
            [[String(n), `There are ${n} bundles, but each bundle has 10 sticks. Count in tens.|${n} కట్టలు ఉన్నాయి, కానీ ప్రతి కట్టలో 10 పుల్లలు. పదులలో లెక్కించు.`]]);
        }),
        tp('howmany', (r) => {
          const n = r.int(1, 10);
          return typed(`How many tens make ${n * 10}?|ఎన్ని పదులు కలిపితే ${n * 10}?`, n, [`Count in tens until you reach ${n * 10}.|${n * 10} వచ్చేదాకా పదులలో లెక్కించు.`, 'Fold one finger for each ten.|ప్రతి పదికి ఒక వేలు మడువు.'],
            [`${range(1, n).map((x) => x * 10).join(', ')}: that is ${n} tens.|${range(1, n).map((x) => x * 10).join(', ')}: అవి ${n} పదులు.`], [[String(n * 10), 'That is the number of sticks. How many bundles of 10?|అది పుల్లల సంఖ్య. 10 పుల్లల కట్టలు ఎన్ని?']]);
        }),
      ],
    },
    {
      id: 'ts1.ma.tens.names', title: T('Count in tens: ten, twenty … hundred|పదులలో లెక్క: పది, ఇరవై … వంద'), prereqs: ['ts1.ma.tens.bundle'],
      activities: ['game:numberline'],
      intro: [
        stepsB(...range(1, 10).map((n) => L(`${n * 10} — ${enW(n * 10)}`, `${n * 10} — ${teW(n * 10)}`))),
        V(line(0, 100, range(1, 10).map((x) => x * 10), undefined, 10), 'Jumping in tens from 0 to 100|0 నుండి 100 వరకు పదుల గెంతులు'),
        TIP('Tens end in 0: 10, 20, 30 … The first digit says how many tens.|పదులు 0 తో ముగుస్తాయి: 10, 20, 30 … మొదటి అంకె ఎన్ని పదులో చెబుతుంది.'),
      ],
      examples: [
        EX('What comes after 50 when we count in tens?|పదులలో లెక్కిస్తే 50 తర్వాత ఏది?', ['50 is 5 tens. One more ten is 6 tens.|50 అంటే 5 పదులు. ఇంకో పది కలిపితే 6 పదులు.'], '60|60'),
        EX('Fill in: 20, 30, __, 50|నింపు: 20, 30, __, 50', ['Each jump is 10.|ప్రతి గెంతు 10.', 'After 30 comes 40.|30 తర్వాత 40.'], '40|40'),
      ],
      practice: [
        tp('skip', (r) => {
          const s = r.int(1, 7), gap = r.int(0, 3);
          const seq = range(s, s + 3).map((x) => x * 10);
          const shown = seq.map((x, i) => (i === gap ? '__' : String(x))).join(', ');
          return typed(`Count in tens. Fill in: ${shown}|పదులలో లెక్కించు. నింపు: ${shown}`, seq[gap], ['Each step adds 10.|ప్రతి అడుగుకు 10 కలుస్తుంది.'],
            [`${seq.join(', ')}|${seq.join(', ')}`], [[String(seq[gap] + 1), 'We are jumping in tens, not ones.|మనం ఒకట్లలో కాదు, పదులలో గెంతుతున్నాం.']]);
        }),
        tp('name', (r) => {
          const n = r.int(1, 10) * 10;
          const wrong = r.shuffle(range(1, 10).map((x) => x * 10).filter((x) => x !== n)).slice(0, 3);
          return mcq(r, `What is the name of ${n}?|${n} పేరు ఏమిటి?`, word(n), wrong.map(word), ['Count in tens and say the names.|పదులలో లెక్కిస్తూ పేర్లు చెప్పు.'],
            [`${n} is "${enW(n)}".|${n} అంటే "${teW(n)}".`], [['wrong', `Count: ${range(1, n / 10).map((x) => enW(x * 10)).join(', ')}.|లెక్కించు: ${range(1, n / 10).map((x) => teW(x * 10)).join(', ')}.`]]);
        }),
        tp('order', (r) => {
          const set = r.shuffle(range(1, 10).map((x) => x * 10)).slice(0, 4).sort((a, b) => a - b);
          return {
            type: 'order', prompt: T('Put these tens in order, smallest first.|ఈ పదులను చిన్నది ముందు వచ్చేలా వరుసలో పెట్టు.'), ...ordering(r, set.map(same)),
            hints: [T('Look at the first digit: it tells how many tens.|మొదటి అంకె చూడు: అది ఎన్ని పదులో చెబుతుంది.')],
            mistakes: [{ when: 'wrong', explain: T('Count in tens: 10, 20, 30 … and check the order.|పదులలో లెక్కించు: 10, 20, 30 … వరుస సరిచూడు.') }],
            solution: [L(set.join(', '), set.join(', '))],
          };
        }),
      ],
    },
  ],
};

// ================================================================== CH 14 Numbers from 20 to 100
const tensOnesV = (t: number, o: number) => emo(`${BUNDLE.repeat(t)}  ${STICK.repeat(o)}`);
const ch14: USpec = {
  id: 'ts1.ma.ch14', subject: 'math', title: T('Numbers from 20 to 100|20 నుండి 100 వరకు సంఖ్యలు'), source: src(14),
  objectives: [
    {
      id: 'ts1.ma.n100.place', title: T('Tens and ones make a number|పదులు, ఒకట్లు కలిసి సంఖ్య'), prereqs: ['ts1.ma.tens.names'],
      activities: ['game:counting'],
      intro: [
        H('Bundles and loose sticks|కట్టలు, విడి పుల్లలు'),
        P('3 bundles and 4 loose sticks. Count the bundles in tens: 10, 20, 30. Then count on the sticks: 31, 32, 33, 34.|3 కట్టలు, 4 విడి పుల్లలు. కట్టలను పదులలో: 10, 20, 30. తర్వాత పుల్లలు: 31, 32, 33, 34.'),
        V(tensOnesV(3, 4), '3 tens and 4 ones make 34|3 పదులు, 4 ఒకట్లు కలిపి 34'),
        PH('🥢', 'A loose stick is one. A bundle is ten.|ఒక విడి పుల్ల అంటే ఒకటి. ఒక కట్ట అంటే పది.'),
        KP('In 34, the 3 means 3 tens.|34 లో 3 అంటే 3 పదులు.', 'In 34, the 4 means 4 ones.|34 లో 4 అంటే 4 ఒకట్లు.'),
        TIP('Write the tens first, then the ones.|ముందు పదులు రాయి, తర్వాత ఒకట్లు.'),
      ],
      examples: [
        EX('5 tens and 2 ones = ?|5 పదులు, 2 ఒకట్లు = ?', ['5 tens is 50.|5 పదులు అంటే 50.', '50 and 2 more is 52.|50, ఇంకా 2 అంటే 52.'], '52|52', tensOnesV(5, 2)),
        EX('How many tens are in 67?|67 లో ఎన్ని పదులు?', ['The left digit tells the tens.|ఎడమ అంకె పదులను చెబుతుంది.'], '6 tens|6 పదులు'),
      ],
      practice: [
        tp('build', (r) => {
          const t = r.int(2, 9), o = r.int(0, 9);
          return typed(`${t} bundles of ten and ${o} loose sticks. How many sticks?|పది పుల్లల ${t} కట్టలు, ${o} విడి పుల్లలు. మొత్తం ఎన్ని పుల్లలు?`, t * 10 + o,
            ['Count the bundles in tens first.|ముందు కట్టలను పదులలో లెక్కించు.', 'Then count on the loose sticks.|తర్వాత విడి పుల్లలను ముందుకు లెక్కించు.'],
            [`${t} tens = ${t * 10}. ${t * 10} and ${o} more = ${t * 10 + o}.|${t} పదులు = ${t * 10}. ${t * 10}, ఇంకా ${o} = ${t * 10 + o}.`],
            [[String(t + o), 'Each bundle is 10, not 1.|ప్రతి కట్ట 10, 1 కాదు.'], [String(o * 10 + t), 'Tens come first, then ones.|ముందు పదులు, తర్వాత ఒకట్లు.']], { visual: tensOnesV(t, o) });
        }),
        tp('split', (r) => {
          const n = r.int(21, 99), askT = r.int(0, 1) === 0;
          const t = Math.floor(n / 10), o = n % 10;
          const W = T(askT ? 'tens|పదులు' : 'ones|ఒకట్లు');
          return typed(`How many ${W.en} are in ${n}?|${n} లో ఎన్ని ${W.te}?`, askT ? t : o, [askT ? 'The left digit tells the tens.|ఎడమ అంకె పదులను చెబుతుంది.' : 'The right digit tells the ones.|కుడి అంకె ఒకట్లను చెబుతుంది.'],
            [`${n} = ${t} tens and ${o} ones.|${n} = ${t} పదులు, ${o} ఒకట్లు.`], t !== o ? [[String(askT ? o : t), askT ? 'That digit is the ones. Tens are on the left.|అది ఒకట్ల అంకె. పదులు ఎడమవైపు.' : 'That digit is the tens. Ones are on the right.|అది పదుల అంకె. ఒకట్లు కుడివైపు.']] : []);
        }),
        countT('count', 20, 40, 10),
      ],
    },
    {
      id: 'ts1.ma.n100.read', title: T('Read and write numbers to 100|100 వరకు సంఖ్యలు చదువు, రాయి'), prereqs: ['ts1.ma.n100.place'],
      activities: ['art:trace'],
      intro: [
        P('Say the tens, then the ones: 45 is forty-five.|ముందు పదులు, తర్వాత ఒకట్లు చెప్పు: 45 అంటే నలభై ఐదు.'),
        stepsB(L('21 — twenty-one', '21 — ఇరవై ఒకటి'), L('38 — thirty-eight', '38 — ముప్పై ఎనిమిది'), L('54 — fifty-four', '54 — యాభై నాలుగు'), L('99 — ninety-nine', '99 — తొంభై తొమ్మిది'), L('100 — one hundred', '100 — వంద')),
        TIP('Be careful: 46 and 64 are different numbers!|జాగ్రత్త: 46, 64 వేరు వేరు సంఖ్యలు!'),
      ],
      examples: [
        EX('Write "seventy-three" as a number.|"డెబ్బై మూడు" ను అంకెల్లో రాయి.', ['Seventy is 7 tens: write 7.|డెబ్బై అంటే 7 పదులు: 7 రాయి.', 'Three ones: write 3 next.|మూడు ఒకట్లు: పక్కన 3 రాయి.'], '73|73'),
        EX('Read 86.|86 ను చదువు.', ['8 tens is eighty.|8 పదులు అంటే ఎనభై.', '6 ones is six.|6 ఒకట్లు అంటే ఆరు.'], 'eighty-six|ఎనభై ఆరు'),
      ],
      practice: [
        tp('name', (r) => {
          const n = r.int(21, 99);
          const t = Math.floor(n / 10), o = n % 10;
          const wrong = [o > 0 && o !== t ? o * 10 + t : n + 10 > 99 ? n - 20 : n + 10, n > 30 ? n - 10 : n + 20, n + 1 > 99 ? n - 1 : n + 1];
          if (r.int(0, 1) === 0) {
            const W = T(word(n));
            return mcqN(r, `Which number is "${W.en}"?|"${W.te}" అనే సంఖ్య ఏది?`, n, wrong, ['The first word tells the tens. The second word tells the ones.|మొదటి మాట పదులను, రెండో మాట ఒకట్లను చెబుతుంది.'],
              [`"${W.en}" is ${t} tens and ${o} ones: ${n}.|"${W.te}" అంటే ${t} పదులు, ${o} ఒకట్లు: ${n}.`], [['wrong', 'Write the tens digit first, then the ones digit.|ముందు పదుల అంకె, తర్వాత ఒకట్ల అంకె రాయి.']]);
          }
          return mcq(r, `How do we read ${n}?|${n} ను ఎలా చదువుతాం?`, word(n), wrong.map(word), ['Say the tens first, then the ones.|ముందు పదులు, తర్వాత ఒకట్లు చెప్పు.'],
            [`${n} is read "${enW(n)}".|${n} ను "${teW(n)}" అని చదువుతాం.`], [['wrong', `${n} has ${t} tens and ${o} ones.|${n} లో ${t} పదులు, ${o} ఒకట్లు.`]]);
        }),
        matchNameT('match', 21, 99),
      ],
    },
  ],
};

// ================================================================== CH 15 Numbers Before, Between, After
const ch15: USpec = {
  id: 'ts1.ma.ch15', subject: 'math', title: T('Numbers Before, Between, After|ముందు, మధ్య, తర్వాత సంఖ్యలు'), source: src(15),
  objectives: [
    {
      id: 'ts1.ma.seq.bab', title: T('Before, after and between up to 100|100 వరకు ముందు, తర్వాత, మధ్య'), prereqs: ['ts1.ma.n100.read', 'ts1.ma.ord9.bab'],
      activities: ['game:numberline'],
      intro: [
        P('The rule is the same for big numbers: after means one more, before means one less.|పెద్ద సంఖ్యలకూ ఇదే నియమం: తర్వాత అంటే ఒకటి ఎక్కువ, ముందు అంటే ఒకటి తక్కువ.'),
        V(line(35, 45, [39, 40]), 'After 39 comes 40|39 తర్వాత 40'),
        KP('After 39 comes 40: the ones are full, so we move to the next ten.|39 తర్వాత 40: ఒకట్లు నిండాయి, కాబట్టి తర్వాతి పదికి వెళ్తాం.', 'Before 60 comes 59.|60 ముందు 59.', 'After 99 comes 100.|99 తర్వాత 100.'),
        PH('🚌', 'Bus seats are numbered in order. Seat 23 is between seats 22 and 24.|బస్సు సీట్లకు వరుసగా నంబర్లు ఉంటాయి. 22, 24 మధ్య 23 వ సీటు.'),
        TIP('Use a 100 chart: after is one step right, before is one step left.|100 పట్టిక వాడు: తర్వాత అంటే కుడికి ఒక అడుగు, ముందు అంటే ఎడమకు ఒక అడుగు.'),
      ],
      examples: [
        EX('What comes just after 69?|69 తర్వాత వెంటనే ఏది?', ['69 has 9 ones. One more fills the ten.|69 లో 9 ఒకట్లు. ఇంకొకటి కలిపితే పది నిండుతుంది.', 'So 6 tens become 7 tens: 70.|6 పదులు 7 పదులు అవుతాయి: 70.'], '70|70', line(65, 75, [69, 70], [[69, 70]])),
        EX('What comes between 47 and 49?|47, 49 మధ్య ఏది?', ['Count: 47, 48, 49.|లెక్కించు: 47, 48, 49.'], '48|48'),
      ],
      practice: [babT('bab', 1, 100), missT('missing', 20, 100)],
    },
    {
      id: 'ts1.ma.seq.compare', title: T('Bigger and smaller numbers up to 100|100 వరకు పెద్ద, చిన్న సంఖ్యలు'), prereqs: ['ts1.ma.seq.bab'],
      activities: ['game:numberline'],
      intro: [
        P('To compare two numbers, look at the tens first.|రెండు సంఖ్యలను పోల్చాలంటే ముందు పదులు చూడు.'),
        KP('52 and 38: 5 tens is more than 3 tens, so 52 is bigger.|52, 38: 3 పదుల కంటే 5 పదులు ఎక్కువ, కాబట్టి 52 పెద్దది.', '74 and 79: tens are the same. 9 ones is more than 4 ones, so 79 is bigger.|74, 79: పదులు సమానం. 4 ఒకట్ల కంటే 9 ఒకట్లు ఎక్కువ, కాబట్టి 79 పెద్దది.'),
        V(emo(`${BUNDLE.repeat(5)} ${STICK.repeat(2)}\n${BUNDLE.repeat(3)} ${STICK.repeat(8)}`), '52 and 38 with bundles and sticks|కట్టలు, పుల్లలతో 52, 38'),
        TIP('More bundles always wins, even if the other has more loose sticks!|విడి పుల్లలు ఎక్కువ ఉన్నా, కట్టలు ఎక్కువ ఉన్నదే పెద్దది!'),
      ],
      examples: [
        EX('Which is bigger: 61 or 59?|61, 59 — ఏది పెద్దది?', ['Tens: 6 and 5.|పదులు: 6, 5.', '6 tens is more.|6 పదులు ఎక్కువ.'], '61|61'),
        EX('Put 45, 18, 72 in order, smallest first.|45, 18, 72 ను చిన్నది ముందు వచ్చేలా పెట్టు.', ['Tens: 4, 1, 7.|పదులు: 4, 1, 7.', 'Smallest tens first: 18, then 45, then 72.|తక్కువ పదులు ముందు: 18, తర్వాత 45, తర్వాత 72.'], '18, 45, 72|18, 45, 72'),
      ],
      practice: [moreLessT('more', 10, 99, false), sortT('sort', 10, 99)],
    },
  ],
};

// ================================================================== CH 16 Money
const COIN_VALUES = [1, 2, 5, 10, 20];
const SHOP: [string, number, string][] = [
  ['a pencil|ఒక పెన్సిల్', 5, '✏️'], ['a balloon|ఒక బెలూన్', 3, '🎈'], ['an egg|ఒక గుడ్డు', 6, '🥚'], ['a banana|ఒక అరటి పండు', 4, '🍌'],
  ['a kite|ఒక గాలిపటం', 8, '🪁'], ['an apple|ఒక ఆపిల్', 7, '🍎'], ['a mango|ఒక మామిడి పండు', 9, '🥭'], ['a tomato|ఒక టమాటా', 2, '🍅'],
];
const rs = (n: number) => `₹${n}`;
const ch16: USpec = {
  id: 'ts1.ma.ch16', subject: 'math', title: T('Money|డబ్బు'), source: src(16),
  objectives: [
    {
      id: 'ts1.ma.money.know', title: T('Coins and notes|నాణేలు, నోట్లు'), prereqs: ['ts1.ma.n20.read'],
      intro: [
        H('Our money|మన డబ్బు'),
        P('We use money to buy things at a shop. Indian money is counted in rupees (₹).|దుకాణంలో వస్తువులు కొనడానికి డబ్బు వాడతాం. మన డబ్బును రూపాయల్లో (₹) లెక్కిస్తాం.'),
        V({ kind: 'coins', rupees: [1, 2, 5, 10] }, 'Coins of ₹1, ₹2, ₹5 and ₹10|₹1, ₹2, ₹5, ₹10 నాణేలు'),
        PH('🪙', 'Coins are round and made of metal. Look at the number on each coin.|నాణేలు గుండ్రంగా, లోహంతో ఉంటాయి. ప్రతి నాణెంపై ఉన్న సంఖ్య చూడు.'),
        P('Notes are made of paper: ₹10, ₹20, ₹50, ₹100 and more.|నోట్లు కాగితంతో చేస్తారు: ₹10, ₹20, ₹50, ₹100 ఇంకా.'),
        TIP('A bigger coin is not always worth more. Read the number on it!|పెద్ద నాణెం ఎప్పుడూ ఎక్కువ విలువ కాదు. దానిపై ఉన్న సంఖ్య చదువు!'),
      ],
      examples: [
        EX('Which is worth more: a ₹5 coin or a ₹2 coin?|₹5 నాణెం, ₹2 నాణెం — దేని విలువ ఎక్కువ?', ['Compare 5 and 2.|5, 2 ను పోల్చు.', '5 is more than 2.|2 కంటే 5 ఎక్కువ.'], 'The ₹5 coin|₹5 నాణెం', { kind: 'coins', rupees: [5, 2] }),
        EX('How many ₹1 coins make ₹5?|ఎన్ని ₹1 నాణేలు కలిపితే ₹5?', ['Count rupees one by one: 1, 2, 3, 4, 5.|ఒక్కో రూపాయి లెక్కించు: 1, 2, 3, 4, 5.'], '5 coins|5 నాణేలు', { kind: 'coins', rupees: [1, 1, 1, 1, 1] }),
      ],
      practice: [
        tp('value', (r) => {
          const v = r.pick(COIN_VALUES);
          return {
            type: 'mcq', prompt: T('How many rupees is this coin worth?|ఈ నాణెం విలువ ఎన్ని రూపాయలు?'), visual: { kind: 'coins', rupees: [v] }, ...chooseNum(r, v, COIN_VALUES.filter((x) => x !== v), rs),
            hints: [T('Read the number on the coin.|నాణెంపై ఉన్న సంఖ్య చదువు.')], mistakes: [{ when: 'wrong', explain: T('Look carefully at the number printed on the coin.|నాణెంపై ముద్రించిన సంఖ్యను జాగ్రత్తగా చూడు.') }],
            solution: [L(`This is a ${rs(v)} coin.`, `ఇది ${rs(v)} నాణెం.`)],
          };
        }),
        tp('more', (r) => {
          const [a, b] = r.shuffle(COIN_VALUES).slice(0, 2);
          const askMore = r.int(0, 1) === 0, ans = askMore ? Math.max(a, b) : Math.min(a, b);
          const W = T(askMore ? 'more|ఎక్కువ' : 'less|తక్కువ');
          return mcq(r, `Which coin is worth ${W.en}: ${rs(a)} or ${rs(b)}?|${rs(a)}, ${rs(b)} — ఏ నాణెం విలువ ${W.te}?`, `${rs(ans)}|${rs(ans)}`, [`${rs(ans === a ? b : a)}|${rs(ans === a ? b : a)}`],
            ['Compare the numbers on the coins.|నాణేలపై సంఖ్యలను పోల్చు.'], [`${rs(ans)} is worth ${W.en}.|${rs(ans)} విలువ ${W.te}.`], [['wrong', `Listen again: the question asks which is worth ${W.en}.|మళ్ళీ విను: ఏది ${W.te} విలువో అడుగుతోంది.`]], { visual: { kind: 'coins', rupees: [a, b] } });
        }),
      ],
    },
    {
      id: 'ts1.ma.money.count', title: T('Count money up to ₹20|₹20 వరకు డబ్బు లెక్కించు'), prereqs: ['ts1.ma.money.know', 'ts1.ma.add20.on'],
      intro: [
        P('To count coins, start with the biggest coin. Then count on.|నాణేలు లెక్కించడానికి పెద్ద విలువ నాణెంతో మొదలుపెట్టు. తర్వాత ముందుకు లెక్కించు.'),
        V({ kind: 'coins', rupees: [10, 5, 2, 1] }, '₹10, ₹5, ₹2, ₹1: 10, 15, 17, 18. That is ₹18.|₹10, ₹5, ₹2, ₹1: 10, 15, 17, 18. మొత్తం ₹18.'),
        ST('Start with ₹10.|₹10 తో మొదలుపెట్టు.', 'Add ₹5: 15.|₹5 కలుపు: 15.', 'Add ₹2: 17.|₹2 కలుపు: 17.', 'Add ₹1: 18.|₹1 కలుపు: 18.'),
        TIP('Play shop at home with real coins and an elder.|పెద్దవాళ్ళతో నిజమైన నాణేలతో ఇంట్లో దుకాణం ఆట ఆడు.'),
      ],
      examples: [
        EX('₹5 + ₹2 + ₹2 = ?|₹5 + ₹2 + ₹2 = ?', ['Start at 5.|5 తో మొదలుపెట్టు.', '5, 7, 9.|5, 7, 9.'], '₹9|₹9', { kind: 'coins', rupees: [5, 2, 2] }),
        EX('₹10 + ₹5 = ?|₹10 + ₹5 = ?', ['10 and 5 more is 15.|10, ఇంకా 5 అంటే 15.'], '₹15|₹15', { kind: 'coins', rupees: [10, 5] }),
      ],
      practice: [
        tp('total', (r) => {
          const k = r.int(2, 4);
          let cs: number[] = [];
          do { cs = Array.from({ length: k }, () => r.pick([1, 2, 5, 10])).sort((a, b) => b - a); } while (cs.reduce((s, x) => s + x, 0) > 20);
          const tot = cs.reduce((s, x) => s + x, 0);
          const run = cs.map((_, i) => cs.slice(0, i + 1).reduce((s, x) => s + x, 0)).join(', ');
          return typed('How much money is shown?|ఇక్కడ ఎంత డబ్బు ఉంది?', tot, ['Start with the biggest coin.|పెద్ద విలువ నాణెంతో మొదలుపెట్టు.', 'Count on the value of each coin.|ప్రతి నాణెం విలువను ముందుకు లెక్కించు.'],
            [`${cs.map(rs).join(' + ')} = ${rs(tot)}|${cs.map(rs).join(' + ')} = ${rs(tot)}`, `Count: ${run}.|లెక్క: ${run}.`], [[String(k), 'You counted coins, not rupees. Add the numbers on the coins.|నువ్వు నాణేలను లెక్కించావు, రూపాయలను కాదు. నాణేలపై సంఖ్యలను కూడు.']],
            { visual: { kind: 'coins', rupees: cs }, unitHint: '₹' });
        }),
        tp('make', (r) => {
          const pairs: [number, number][] = [[5, 1], [5, 2], [2, 2], [10, 1], [10, 2], [10, 5], [5, 5], [10, 10], [2, 1]];
          const [a, b] = r.pick(pairs), n = a + b;
          const ok = `${rs(a)} + ${rs(b)}`;
          const wrong = pairs.filter(([x, y]) => x + y !== n).map(([x, y]) => `${rs(x)} + ${rs(y)}`);
          const w = r.shuffle(wrong).slice(0, 2);
          return mcq(r, `Which two coins make ${rs(n)}?|ఏ రెండు నాణేలు కలిపితే ${rs(n)}?`, `${ok}|${ok}`, w.map((x) => `${x}|${x}`), ['Add the two coins in each choice.|ప్రతి జవాబులో రెండు నాణేలను కూడు.'],
            [`${ok} = ${rs(n)}|${ok} = ${rs(n)}`], [['wrong', 'Add those two coins. Do they make the amount?|ఆ రెండు నాణేలను కూడు. ఆ మొత్తం వస్తుందా?']]);
        }),
      ],
    },
    {
      id: 'ts1.ma.money.buy', title: T('Buying at a shop|దుకాణంలో కొనడం'), prereqs: ['ts1.ma.money.count', 'ts1.ma.sub9.sent'],
      intro: [
        P('At the shop, each thing has a price. We pay that much money.|దుకాణంలో ప్రతి వస్తువుకు ఒక ధర ఉంటుంది. అంత డబ్బు ఇస్తాం.'),
        PH('🏪', 'A small shop near school sells pencils, balloons and fruit.|బడి దగ్గర చిన్న దుకాణంలో పెన్సిళ్ళు, బెలూన్లు, పండ్లు అమ్ముతారు.'),
        KP('Buy two things: add the prices.|రెండు వస్తువులు కొంటే: ధరలను కూడు.', 'Pay more than the price: you get change back. Take away.|ధర కంటే ఎక్కువ ఇస్తే చిల్లర తిరిగి వస్తుంది. తీసివేయి.'),
        TIP('Always count your change!|చిల్లరను ఎప్పుడూ లెక్కించుకో!'),
      ],
      examples: [
        EX('A pencil costs ₹5 and a balloon costs ₹3. How much for both?|పెన్సిల్ ₹5, బెలూన్ ₹3. రెండింటికీ ఎంత?', ['Add: 5 + 3.|కూడు: 5 + 3.'], '₹8|₹8', emo('✏️ ➕ 🎈')),
        EX('A kite costs ₹8. You pay ₹10. How much change?|గాలిపటం ₹8. నువ్వు ₹10 ఇచ్చావు. చిల్లర ఎంత?', ['Take away: 10 − 8.|తీసివేయి: 10 − 8.', 'Count up from 8 to 10: 9, 10. That is 2.|8 నుండి 10 దాకా: 9, 10. అంటే 2.'], '₹2|₹2', obj('🪁', 1)),
      ],
      practice: [
        tp('both', (r) => {
          const [x, y] = r.shuffle(SHOP).slice(0, 2);
          const X = T(x[0]), Y = T(y[0]), tot = x[1] + y[1];
          return typed(`${cap(X.en)} costs ${rs(x[1])}. ${cap(Y.en)} costs ${rs(y[1])}. How much do both cost?|${X.te} ధర ${rs(x[1])}. ${Y.te} ధర ${rs(y[1])}. రెండింటికీ ఎంత?`, tot,
            ['Buying both means add the prices.|రెండూ కొంటే ధరలను కూడాలి.'], [`${x[1]} + ${y[1]} = ${tot}. Both cost ${rs(tot)}.|${x[1]} + ${y[1]} = ${tot}. రెండింటికీ ${rs(tot)}.`],
            [[String(Math.abs(x[1] - y[1])), 'You need to pay for both. Add, do not take away.|రెండింటికీ డబ్బు ఇవ్వాలి. కూడు, తీసివేయకు.']], { visual: emo(`${x[2]} ➕ ${y[2]}`), unitHint: '₹' });
        }),
        tp('change', (r) => {
          const [nm2, price, e] = r.pick(SHOP), X = T(nm2);
          return typed(`${cap(X.en)} costs ${rs(price)}. You pay with a ${rs(10)} coin. How much change do you get?|${X.te} ధర ${rs(price)}. నువ్వు ${rs(10)} నాణెం ఇచ్చావు. చిల్లర ఎంత వస్తుంది?`, 10 - price,
            [`Count up from ${price} to 10.|${price} నుండి 10 దాకా ముందుకు లెక్కించు.`, `Or find 10 − ${price}.|లేదా 10 − ${price} కనుక్కో.`], [`10 − ${price} = ${10 - price}. Change: ${rs(10 - price)}.|10 − ${price} = ${10 - price}. చిల్లర: ${rs(10 - price)}.`],
            [[String(10 + price), 'You get money back, so take away.|డబ్బు తిరిగి వస్తుంది, కాబట్టి తీసివేయి.'], [String(price), 'That is the price. Change is what comes back.|అది ధర. తిరిగి వచ్చేది చిల్లర.']], { visual: obj(e, 1), unitHint: '₹' });
        }),
      ],
    },
  ],
};

// ================================================================== CH 17 Time
const DAYS: [string, string][] = [['Sunday', 'ఆదివారం'], ['Monday', 'సోమవారం'], ['Tuesday', 'మంగళవారం'], ['Wednesday', 'బుధవారం'], ['Thursday', 'గురువారం'], ['Friday', 'శుక్రవారం'], ['Saturday', 'శనివారం']];
const ROUTINE = ['Wake up|నిద్ర లేవడం', 'Go to school|బడికి వెళ్ళడం', 'Eat lunch|మధ్యాహ్న భోజనం', 'Play in the evening|సాయంత్రం ఆడుకోవడం', 'Sleep at night|రాత్రి నిద్రపోవడం'];
const ch17: USpec = {
  id: 'ts1.ma.ch17', subject: 'math', title: T('Time|సమయం'), source: src(17),
  objectives: [
    {
      id: 'ts1.ma.time.day', title: T('Morning, afternoon, evening, night|ఉదయం, మధ్యాహ్నం, సాయంత్రం, రాత్రి'),
      intro: [
        H('Parts of a day|రోజులోని భాగాలు'),
        PH('🌅', 'Morning: the sun comes up. We wake up and brush our teeth.|ఉదయం: సూర్యుడు ఉదయిస్తాడు. మనం లేచి పళ్ళు తోముకుంటాం.'),
        PH('☀️', 'Afternoon: the sun is high and hot. We eat lunch.|మధ్యాహ్నం: సూర్యుడు పైన, ఎండ ఎక్కువ. భోజనం చేస్తాం.'),
        P('Evening: the sun goes down. We play outside and birds fly home.|సాయంత్రం: సూర్యుడు అస్తమిస్తాడు. బయట ఆడుకుంటాం, పక్షులు గూటికి చేరుతాయి.'),
        PH('🌙', 'Night: it is dark. We see the moon and stars. We sleep.|రాత్రి: చీకటిగా ఉంటుంది. చందమామ, నక్షత్రాలు కనిపిస్తాయి. నిద్రపోతాం.'),
        TIP('Tell an elder what you did this morning and what you will do tonight.|ఈ ఉదయం ఏం చేశావో, ఈ రాత్రి ఏం చేస్తావో పెద్దవాళ్ళకు చెప్పు.'),
      ],
      examples: [
        EX('When do we see the moon and stars?|చందమామ, నక్షత్రాలు ఎప్పుడు కనిపిస్తాయి?', ['They shine when the sky is dark.|ఆకాశం చీకటిగా ఉన్నప్పుడు మెరుస్తాయి.'], 'At night|రాత్రి', obj('🌙', 1)),
        EX('What comes first: lunch or waking up?|ముందు ఏది: భోజనమా, నిద్ర లేవడమా?', ['We wake up in the morning.|ఉదయం లేస్తాం.', 'Lunch is in the afternoon.|భోజనం మధ్యాహ్నం.'], 'Waking up|నిద్ర లేవడం'),
      ],
      practice: [
        bank('when', [
          ['When does the sun rise?|సూర్యుడు ఎప్పుడు ఉదయిస్తాడు?', 'Morning|ఉదయం', ['Night|రాత్రి', 'Evening|సాయంత్రం'], 'It is the start of the day.|అది రోజు మొదలు.', 'The sun rises in the morning.|సూర్యుడు ఉదయం ఉదయిస్తాడు.', 'Sunrise starts the day: morning.|సూర్యోదయంతో రోజు మొదలవుతుంది: ఉదయం.', obj('🌅', 1)],
          ['When do we eat lunch at school?|బడిలో భోజనం ఎప్పుడు చేస్తాం?', 'Afternoon|మధ్యాహ్నం', ['Morning|ఉదయం', 'Night|రాత్రి'], 'The sun is high in the sky.|సూర్యుడు ఆకాశంలో పైన ఉంటాడు.', 'We eat lunch in the afternoon.|మధ్యాహ్నం భోజనం చేస్తాం.', 'Lunch is in the middle of the day.|భోజనం రోజు మధ్యలో.'],
          ['When do we see the moon and stars?|చందమామ, నక్షత్రాలు ఎప్పుడు కనిపిస్తాయి?', 'Night|రాత్రి', ['Afternoon|మధ్యాహ్నం', 'Morning|ఉదయం'], 'The sky is dark.|ఆకాశం చీకటిగా ఉంటుంది.', 'We see them at night.|అవి రాత్రి కనిపిస్తాయి.', 'Stars show only in the dark sky.|చీకటి ఆకాశంలోనే నక్షత్రాలు కనిపిస్తాయి.', obj('⭐', 3)],
          ['When does the sun set and birds fly home?|సూర్యుడు ఎప్పుడు అస్తమిస్తాడు, పక్షులు ఎప్పుడు గూటికి చేరుతాయి?', 'Evening|సాయంత్రం', ['Morning|ఉదయం', 'Afternoon|మధ్యాహ్నం'], 'The day is ending.|రోజు ముగుస్తోంది.', 'This happens in the evening.|ఇది సాయంత్రం జరుగుతుంది.', 'Sunset comes at the end of the day: evening.|రోజు చివర సూర్యాస్తమయం: సాయంత్రం.', obj('🐦', 2)],
          ['When do you go to sleep?|నువ్వు ఎప్పుడు నిద్రపోతావు?', 'Night|రాత్రి', ['Morning|ఉదయం', 'Afternoon|మధ్యాహ్నం'], 'It is dark outside.|బయట చీకటిగా ఉంటుంది.', 'We sleep at night.|రాత్రి నిద్రపోతాం.', 'Night is the time to rest.|రాత్రి విశ్రాంతి సమయం.', obj('🛏️', 1)],
          ['When do you brush your teeth after waking up?|నిద్ర లేచాక పళ్ళు ఎప్పుడు తోముకుంటావు?', 'Morning|ఉదయం', ['Evening|సాయంత్రం', 'Afternoon|మధ్యాహ్నం'], 'Right after you wake up.|లేచిన వెంటనే.', 'We brush our teeth in the morning.|ఉదయం పళ్ళు తోముకుంటాం.', 'We wake up in the morning.|మనం ఉదయం లేస్తాం.'],
        ]),
        tp('routine', (r) => {
          const drop = r.int(0, 4);
          const list = ROUTINE.filter((_, i) => i !== drop).map(T);
          return {
            type: 'order', prompt: T('Put these in the order they happen in a day.|రోజులో జరిగే వరుసలో వీటిని పెట్టు.'), ...ordering(r, list),
            hints: [T('What do you do first when the day begins?|రోజు మొదలవగానే ముందు ఏం చేస్తావు?')],
            mistakes: [{ when: 'wrong', explain: T('Think: morning, then afternoon, then evening, then night.|ఆలోచించు: ఉదయం, మధ్యాహ్నం, సాయంత్రం, రాత్రి.') }],
            solution: [L(list.map((x) => x.en).join(' → '), list.map((x) => x.te).join(' → '))],
          };
        }),
      ],
    },
    {
      id: 'ts1.ma.time.week', title: T('Days of the week|వారంలో రోజులు'), prereqs: ['ts1.ma.time.day'],
      intro: [
        P('A week has 7 days.|ఒక వారానికి 7 రోజులు.'),
        stepsB(...DAYS.map(([en, te]) => L(en, te))),
        KP('Yesterday is the day before today.|నిన్న అంటే ఈరోజుకు ముందు రోజు.', 'Tomorrow is the day after today.|రేపు అంటే ఈరోజు తర్వాతి రోజు.', 'After Saturday comes Sunday again.|శనివారం తర్వాత మళ్ళీ ఆదివారం.'),
        PH('🏫', 'We go to school from Monday to Saturday.|సోమవారం నుండి శనివారం వరకు బడికి వెళ్తాం.'),
        TIP('Sing the days every morning in class!|తరగతిలో రోజూ ఉదయం రోజుల పేర్లు పాడు!'),
      ],
      examples: [
        EX('Today is Tuesday. What day is tomorrow?|ఈరోజు మంగళవారం. రేపు ఏ రోజు?', ['Tomorrow is the next day.|రేపు అంటే తర్వాతి రోజు.', 'After Tuesday comes Wednesday.|మంగళవారం తర్వాత బుధవారం.'], 'Wednesday|బుధవారం'),
        EX('Which day comes just before Monday?|సోమవారానికి ముందు రోజు ఏది?', ['The week starts again after Saturday with Sunday.|శనివారం తర్వాత ఆదివారంతో వారం మళ్ళీ మొదలవుతుంది.'], 'Sunday|ఆదివారం'),
      ],
      practice: [
        tp('next', (r) => {
          const i = r.int(0, 6), k = r.int(0, 3);
          const fw = k % 2 === 0;
          const j = (i + (fw ? 1 : 6)) % 7;
          const [en, te] = DAYS[i];
          const q = k === 0 ? `Today is ${en}. What day is tomorrow?|ఈరోజు ${te}. రేపు ఏ రోజు?`
            : k === 1 ? `Today is ${en}. What day was yesterday?|ఈరోజు ${te}. నిన్న ఏ రోజు?`
              : k === 2 ? `Which day comes just after ${en}?|${te} తర్వాత వచ్చే రోజు ఏది?` : `Which day comes just before ${en}?|${te} కి ముందు వచ్చే రోజు ఏది?`;
          const wrongIdx = [(i + (fw ? 6 : 1)) % 7, (i + 2) % 7, i];
          return mcq(r, q, `${DAYS[j][0]}|${DAYS[j][1]}`, wrongIdx.map((x) => `${DAYS[x][0]}|${DAYS[x][1]}`),
            [fw ? 'Go one day forward.|ఒక రోజు ముందుకు వెళ్ళు.' : 'Go one day back.|ఒక రోజు వెనక్కి వెళ్ళు.', 'Say the days in order.|రోజులను వరుసగా చెప్పు.'],
            [`${DAYS[(i + 6) % 7][0]} → ${en} → ${DAYS[(i + 1) % 7][0]}. Answer: ${DAYS[j][0]}.|${DAYS[(i + 6) % 7][1]} → ${te} → ${DAYS[(i + 1) % 7][1]}. జవాబు: ${DAYS[j][1]}.`],
            [['wrong', fw ? 'Tomorrow and "after" mean the next day.|రేపు, "తర్వాత" అంటే తర్వాతి రోజు.' : 'Yesterday and "before" mean the day that has gone.|నిన్న, "ముందు" అంటే గడిచిపోయిన రోజు.']]);
        }),
        tp('order', (r) => {
          const s = r.int(0, 6);
          const seq = range(0, 3).map((x) => DAYS[(s + x) % 7]);
          return {
            type: 'order', prompt: T('Put these days in order.|ఈ రోజులను వరుసలో పెట్టు.'), ...ordering(r, seq.map(([en, te]) => L(en, te))),
            hints: [T('Sing the days of the week: Sunday, Monday, Tuesday …|వారం రోజులు పాడు: ఆదివారం, సోమవారం, మంగళవారం …')],
            mistakes: [{ when: 'wrong', explain: T('Start with the day that comes first in the song and keep going.|పాటలో ముందు వచ్చే రోజుతో మొదలుపెట్టి ముందుకు వెళ్ళు.') }],
            solution: [L(seq.map((d) => d[0]).join(' → '), seq.map((d) => d[1]).join(' → '))],
          };
        }),
      ],
    },
    {
      id: 'ts1.ma.time.longer', title: T('Which takes more time?|దేనికి ఎక్కువ సమయం పడుతుంది?'), prereqs: ['ts1.ma.time.day'],
      intro: [
        P('Some things are quick. Some take a long time.|కొన్ని పనులు తొందరగా అవుతాయి. కొన్నిటికి చాలా సమయం పడుతుంది.'),
        KP('Clapping once is quick.|ఒకసారి చప్పట్లు కొట్టడం తొందర.', 'Walking to school takes longer.|బడికి నడవడానికి ఎక్కువ సమయం.', 'A seed growing into a tree takes very, very long.|విత్తనం చెట్టుగా పెరగడానికి చాలా చాలా సమయం.'),
        PH('🌱', 'A tiny plant takes many days to grow tall.|చిన్న మొక్క పెద్దగా పెరగడానికి చాలా రోజులు పడుతుంది.'),
        TIP('Count while you do a job: 1, 2, 3 … The bigger the count, the longer it took.|పని చేస్తూ లెక్కించు: 1, 2, 3 … లెక్క పెద్దదైతే ఎక్కువ సమయం పట్టినట్టు.'),
      ],
      examples: [
        EX('Which takes more time: drinking a glass of water or sleeping at night?|ఏది ఎక్కువ సమయం: ఒక గ్లాసు నీళ్ళు తాగడమా, రాత్రి నిద్రపోవడమా?', ['Drinking water takes a few moments.|నీళ్ళు తాగడానికి కొన్ని క్షణాలు.', 'We sleep the whole night.|రాత్రంతా నిద్రపోతాం.'], 'Sleeping at night|రాత్రి నిద్ర'),
        EX('Which is quicker: blinking or taking a bath?|ఏది తొందర: కళ్ళు ఆర్పడమా, స్నానం చేయడమా?', ['Blink now! It is over at once.|ఇప్పుడే కళ్ళు ఆర్పు! వెంటనే అయిపోయింది.'], 'Blinking|కళ్ళు ఆర్పడం'),
      ],
      practice: [
        pairT('longer', [
          ['eating lunch|భోజనం చేయడం', 'eating one grape|ఒక ద్రాక్ష తినడం', '🍕', '🍇'], ['a day at school|బడిలో ఒక రోజు', 'washing your hands|చేతులు కడుక్కోవడం', '🏫', '💧'],
          ['a mango tree growing|మామిడి చెట్టు పెరగడం', 'picking a flower|ఒక పువ్వు కోయడం', '🌳', '🌼'], ['a train journey to another town|వేరే ఊరికి రైలు ప్రయాణం', 'climbing onto a chair|కుర్చీ ఎక్కడం', '🚆', '🪑'],
          ['sleeping at night|రాత్రి నిద్రపోవడం', 'blinking your eyes|కళ్ళు ఆర్పడం', '🛏️', '👁️'], ['an egg hatching into a chick|గుడ్డు నుండి పిల్ల రావడం', 'cracking an egg|గుడ్డు పగలగొట్టడం', '🐔', '🥚'],
        ], 'slower (takes more time)|ఎక్కువ సమయం పట్టేది', 'quicker (takes less time)|తక్కువ సమయం పట్టేది', 'Imagine doing both. Which one is over first?|రెండూ చేస్తున్నట్టు ఊహించు. ఏది ముందు అయిపోతుంది?', 'Think about how long each one lasts.|ఒక్కొక్కటి ఎంతసేపు జరుగుతుందో ఆలోచించు.'),
      ],
    },
  ],
};

// ================================================================== CH 18 Length - Weight - Size
/** things to measure, with a believable length range in paper clips */
const TOOLS: [string, string, number, number][] = [['pencil|పెన్సిల్', '✏️', 5, 8], ['crayon|క్రేయాన్', '🖍️', 2, 4], ['paint brush|రంగుల కుంచె', '🖌️', 6, 9], ['key|తాళంచెవి', '🔑', 2, 3], ['spoon|చెంచా', '🥄', 4, 6], ['pen|పెన్', '🖊️', 5, 7]];
const SIZE_RANK: [string, string][] = [['ant|చీమ', '🐜'], ['mouse|ఎలుక', '🐭'], ['cat|పిల్లి', '🐱'], ['goat|మేక', '🐐'], ['cow|ఆవు', '🐄'], ['elephant|ఏనుగు', '🐘']];
const ch18: USpec = {
  id: 'ts1.ma.ch18', subject: 'math', title: T('Length - Weight - Size|పొడవు - బరువు - పరిమాణం'), source: src(18),
  objectives: [
    {
      id: 'ts1.ma.meas.length', title: T('Longer and shorter: measure with clips|పొడవు, పొట్టి: క్లిప్పులతో కొలువు'), prereqs: ['ts1.ma.pre.size', 'ts1.ma.n69.count'],
      intro: [
        H('Measure with things you have|నీ దగ్గరున్న వాటితో కొలువు'),
        P('Line up paper clips next to a pencil, end to end. Count the clips.|పెన్సిల్ పక్కన కాగితం క్లిప్పులను ఒకదాని తర్వాత ఒకటి పెట్టు. క్లిప్పులు లెక్కించు.'),
        PH('📎', 'A paper clip is small. We can use it to measure.|కాగితం క్లిప్ చిన్నది. దాంతో కొలవచ్చు.'),
        V(emo('✏️ 📎📎📎📎📎\n🖍️ 📎📎📎'), 'The pencil is 5 clips long. The crayon is 3 clips long.|పెన్సిల్ 5 క్లిప్పుల పొడవు. క్రేయాన్ 3 క్లిప్పుల పొడవు.'),
        P('More clips means longer.|ఎక్కువ క్లిప్పులు అంటే ఎక్కువ పొడవు.'),
        TIP('Start at the very end. Leave no gaps between clips.|సరిగ్గా అంచు నుండి మొదలుపెట్టు. క్లిప్పుల మధ్య ఖాళీ వదలకు.'),
        PH('✋', 'You can also measure with hand spans.|జానలతో కూడా కొలవచ్చు.'),
      ],
      examples: [
        EX('A key is 2 clips long. A spoon is 6 clips long. Which is longer?|తాళంచెవి 2 క్లిప్పులు, చెంచా 6 క్లిప్పుల పొడవు. ఏది పొడవు?', ['6 clips is more than 2 clips.|2 క్లిప్పుల కంటే 6 ఎక్కువ.'], 'The spoon|చెంచా', emo('🔑 📎📎\n🥄 📎📎📎📎📎📎')),
        EX('How many clips longer is the spoon?|చెంచా ఎన్ని క్లిప్పులు ఎక్కువ పొడవు?', ['6 − 2 = 4|6 − 2 = 4'], '4 clips|4 క్లిప్పులు'),
      ],
      practice: [
        tp('clips', (r) => {
          const [x, y] = r.shuffle(TOOLS).slice(0, 2);
          const a = r.int(x[2], x[3]);
          let b = r.int(y[2], y[3]);
          if (b === a) b = b < y[3] ? b + 1 : b - 1;
          const X = T(x[0]), Y = T(y[0]);
          const v = emo(`${x[1]} ${'📎'.repeat(a)}\n${y[1]} ${'📎'.repeat(b)}`);
          if (r.int(0, 1) === 0) {
            const askLong = r.int(0, 1) === 0, W = T(askLong ? 'longer|పొడవైనది' : 'shorter|పొట్టిది');
            const ans = (askLong ? a > b : a < b) ? X : Y, oth = ans === X ? Y : X;
            return {
              type: 'mcq', prompt: L(`The ${X.en} is ${a} clips long. The ${Y.en} is ${b} clips long. Which is ${W.en}?`, `${X.te} ${a} క్లిప్పులు, ${Y.te} ${b} క్లిప్పుల పొడవు. ఏది ${W.te}?`), visual: v,
              ...choose(r, ans, [oth]), hints: [T('Compare the numbers of clips.|క్లిప్పుల సంఖ్యలను పోల్చు.')],
              mistakes: [{ when: 'wrong', explain: T('More clips means longer. Fewer clips means shorter.|ఎక్కువ క్లిప్పులు అంటే పొడవు. తక్కువ క్లిప్పులు అంటే పొట్టి.') }],
              solution: [L(`The ${ans.en} is ${W.en}.`, `${ans.te} ${W.te}.`)],
            };
          }
          const hi = Math.max(a, b), lo = Math.min(a, b), L1 = a > b ? X : Y;
          return typed(`The ${X.en} is ${a} clips long. The ${Y.en} is ${b} clips long. How many clips longer is the ${L1.en}?|${X.te} ${a} క్లిప్పులు, ${Y.te} ${b} క్లిప్పుల పొడవు. ${L1.te} ఎన్ని క్లిప్పులు ఎక్కువ పొడవు?`, hi - lo,
            [`Find ${hi} − ${lo}.|${hi} − ${lo} కనుక్కో.`, `Or count up from ${lo} to ${hi}.|లేదా ${lo} నుండి ${hi} దాకా లెక్కించు.`], [`${hi} − ${lo} = ${hi - lo} clips.|${hi} − ${lo} = ${hi - lo} క్లిప్పులు.`],
            [[String(hi), 'That is its whole length. Find how many MORE.|అది మొత్తం పొడవు. ఎన్ని ఎక్కువో కనుక్కో.'], [String(hi + lo), 'Do not add. Take away to find the difference.|కూడకు. తేడా కోసం తీసివేయి.']], { visual: v });
        }),
        tp('measure', (r) => {
          const [x, e, lo, hi] = r.pick(TOOLS), n = r.int(lo, hi), X = T(x);
          return countQ(`How many clips long is the ${X.en}?|${X.te} ఎన్ని క్లిప్పుల పొడవు?`, n, emo(`${e} ${'📎'.repeat(n)}`), ['Count the clips beside it.|పక్కన ఉన్న క్లిప్పులు లెక్కించు.'],
            [`The ${X.en} is ${n} clips long.|${X.te} ${n} క్లిప్పుల పొడవు.`], [[String(n + 1), 'Do not count the object itself, only the clips.|వస్తువును కాదు, క్లిప్పులను మాత్రమే లెక్కించు.']]);
        }),
      ],
    },
    {
      id: 'ts1.ma.meas.weight', title: T('Heavier and lighter|బరువైనది, తేలికైనది'), prereqs: ['ts1.ma.pre.more'],
      activities: ['game:balance'],
      intro: [
        P('Hold one thing in each hand. The heavier one pulls your hand down.|ఒక్కో చేతిలో ఒక్కో వస్తువు పట్టుకో. బరువైనది చేతిని కిందికి లాగుతుంది.'),
        PH('⚖', 'A balance has two pans. The heavier side goes down.|త్రాసుకు రెండు పళ్ళేలు. బరువైన వైపు కిందికి దిగుతుంది.'),
        V(emo('🍉 🔽   🔼 🍇'), 'Watermelon side down, grape side up|పుచ్చకాయ వైపు కిందికి, ద్రాక్ష వైపు పైకి'),
        KP('Down means heavier.|కిందికి అంటే బరువు.', 'Up means lighter.|పైకి అంటే తేలిక.', 'Level means the same weight.|సమానంగా ఉంటే ఒకే బరువు.'),
        TIP('Make a balance with a hanger, string and two cups!|హ్యాంగర్, దారం, రెండు కప్పులతో త్రాసు చేయి!'),
      ],
      examples: [
        EX('A coconut is on one side of a balance and a flower on the other. Which side goes down?|త్రాసులో ఒక వైపు కొబ్బరికాయ, మరో వైపు పువ్వు. ఏ వైపు కిందికి దిగుతుంది?', ['A coconut is much heavier than a flower.|పువ్వు కంటే కొబ్బరికాయ చాలా బరువు.'], 'The coconut side|కొబ్బరికాయ వైపు', emo('🥥 ⚖ 🌼')),
        EX('A brick and a feather: which is lighter?|ఇటుక, ఈక: ఏది తేలిక?', ['A feather floats in the air.|ఈక గాలిలో తేలుతుంది.'], 'The feather|ఈక', emo('🧱 🪶')),
      ],
      practice: [
        tp('balance', (r) => {
          const [a, b, ea, eb] = r.pick(HEAVY);
          const A = T(a), Bq = T(b), left = r.int(0, 1) === 0;
          const [lE, rE, lN, rN] = left ? [ea, eb, A, Bq] : [eb, ea, Bq, A];
          return mcq(r, `On a balance, ${lN.en} is on the left and ${rN.en} is on the right. Which side goes down?|త్రాసులో ఎడమ వైపు ${lN.te}, కుడి వైపు ${rN.te}. ఏ వైపు కిందికి దిగుతుంది?`, left ? 'Left|ఎడమ' : 'Right|కుడి', [left ? 'Right|కుడి' : 'Left|ఎడమ', 'Both stay level|రెండూ సమానంగా'],
            ['The heavier side goes down.|బరువైన వైపు కిందికి దిగుతుంది.'], [`${cap(A.en)} is heavier, so the ${left ? 'left' : 'right'} side goes down.|${A.te} బరువైనది, కాబట్టి ${left ? 'ఎడమ' : 'కుడి'} వైపు కిందికి దిగుతుంది.`],
            [['wrong', `Which is heavier: ${A.en} or ${Bq.en}? That side goes down.|${A.te}, ${Bq.te} — ఏది బరువు? ఆ వైపు కిందికి దిగుతుంది.`]], { visual: emo(`${lE} ⚖ ${rE}`) });
        }),
        pairT('heavy', [
          ['a pumpkin-sized watermelon|పెద్ద పుచ్చకాయ', 'a lemon-sized orange|చిన్న నారింజ', '🍉', '🍊'], ['a bag of rice|బియ్యం బస్తా', 'a pencil|పెన్సిల్', '🎒', '✏️'], ['a chair|కుర్చీ', 'a book|పుస్తకం', '🪑', '📕'],
          ['a bucket of water|నీళ్ళ బకెట్', 'an empty cup|ఖాళీ కప్పు', '🪣', '☕'], ['a goat|మేక', 'a hen|కోడి', '🐐', '🐔'], ['a coconut|కొబ్బరికాయ', 'a leaf|ఆకు', '🥥', '🍃'],
        ], 'heavier|బరువైనది', 'lighter|తేలికైనది', 'Imagine lifting each one.|ఒక్కొక్కటి ఎత్తుతున్నట్టు ఊహించు.', 'Heavy things are hard to lift. Light things are easy to lift.|బరువైనవి ఎత్తడం కష్టం. తేలికైనవి ఎత్తడం సులువు.'),
      ],
    },
    {
      id: 'ts1.ma.meas.size', title: T('Biggest and smallest|అతి పెద్దది, అతి చిన్నది'), prereqs: ['ts1.ma.pre.size'],
      intro: [
        P('When we compare three things, one is the biggest and one is the smallest.|మూడు వస్తువులను పోల్చితే ఒకటి అతి పెద్దది, ఒకటి అతి చిన్నది.'),
        V(emo('🐜  🐱  🐘'), 'An ant, a cat and an elephant|చీమ, పిల్లి, ఏనుగు'),
        P('The ant is the smallest. The elephant is the biggest. The cat is in between.|చీమ అతి చిన్నది. ఏనుగు అతి పెద్దది. పిల్లి మధ్యలో.'),
        PH('🐜', 'An ant is tiny. It can walk on your finger.|చీమ చాలా చిన్నది. నీ వేలి మీద నడవగలదు.'),
        TIP('Line things up from small to big, like children by height.|పిల్లలను ఎత్తు ప్రకారం నిలబెట్టినట్టు, వస్తువులను చిన్నది నుండి పెద్దది వరకు పెట్టు.'),
      ],
      examples: [
        EX('Which is the biggest: a mouse, a goat or a cow?|ఎలుక, మేక, ఆవు — అతి పెద్దది ఏది?', ['A mouse is small.|ఎలుక చిన్నది.', 'A cow is bigger than a goat.|మేక కంటే ఆవు పెద్దది.'], 'The cow|ఆవు', emo('🐭 🐐 🐄')),
        EX('Put in order, smallest first: elephant, ant, cat.|చిన్నది ముందు వచ్చేలా పెట్టు: ఏనుగు, చీమ, పిల్లి.', ['Smallest: ant.|అతి చిన్నది: చీమ.', 'Then cat, then elephant.|తర్వాత పిల్లి, తర్వాత ఏనుగు.'], 'ant, cat, elephant|చీమ, పిల్లి, ఏనుగు'),
      ],
      practice: [
        tp('order', (r) => {
          const idx = r.shuffle(range(0, SIZE_RANK.length - 1)).slice(0, 3).sort((a, b) => a - b);
          const list = idx.map((i) => T(SIZE_RANK[i][0]));
          return {
            type: 'order', prompt: T('Put these animals in order of size, smallest first.|ఈ జంతువులను పరిమాణం ప్రకారం, చిన్నది ముందు వచ్చేలా పెట్టు.'), ...ordering(r, list),
            hints: [T('Which one could sit on your hand?|ఏది నీ చేతి మీద కూర్చోగలదు?')],
            mistakes: [{ when: 'wrong', explain: T('Picture them standing side by side. Start with the tiniest.|వాటిని పక్కపక్కన ఊహించు. అతి చిన్నదానితో మొదలుపెట్టు.') }],
            solution: [L(list.map((x) => x.en).join(', '), list.map((x) => x.te).join(', '))],
          };
        }),
        tp('pick', (r) => {
          const idx = r.shuffle(range(0, SIZE_RANK.length - 1)).slice(0, 3);
          const big = r.int(0, 1) === 0;
          const target = big ? Math.max(...idx) : Math.min(...idx);
          const W = T(big ? 'biggest|అతి పెద్దది' : 'smallest|అతి చిన్నది');
          const names = idx.map((i) => T(SIZE_RANK[i][0]));
          const ans = T(SIZE_RANK[target][0]);
          return {
            type: 'spoken', prompt: L(`Which is the ${W.en}: ${names.map((x) => x.en).join(', ')}?`, `${names.map((x) => x.te).join(', ')} — ${W.te} ఏది?`),
            ...choose(r, ans, idx.filter((i) => i !== target).map((i) => T(SIZE_RANK[i][0])), 3, { correct: obj(SIZE_RANK[target][1], 1), wrong: idx.filter((i) => i !== target).map((i) => obj(SIZE_RANK[i][1], 1)) }),
            hints: [T('Picture all three side by side.|మూడింటినీ పక్కపక్కన ఊహించు.')],
            mistakes: [{ when: 'wrong', explain: T(`Listen again: find the ${W.en} one.|మళ్ళీ విను: ${W.te} కనుక్కో.`) }],
            solution: [L(`The ${ans.en} is the ${W.en}.`, `${ans.te} ${W.te}.`)],
          };
        }),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16, ch17, ch18];
