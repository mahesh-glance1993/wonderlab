// Telangana SCERT Class 2 — maths. Original teaching aligned to the official chapter list (src/content/ts/books.ts).
// One unit per textbook chapter (ids ts2.ma.ch<n>); objectives ts2.ma.<topic>.<skill>.
// Written for a 7-year-old: very short sentences, real things to count, ₹ coins, Telangana settings.
// Every learner-facing line is bilingual (English + Telugu) — Telugu needs native-speaker review.
// Templates use only the Rng they are given.
import {
  tp, ex, p, h, tip, vis, keys, remember, photo, stepsB, L, num, choose, chooseNum, ordering, tapAll, matching, range, NAMES,
  type USpec, type QSpec, type TSpec,
} from '../../lib/kit';
import type { Localized, VisualSpec } from '../../../shared/content';
import type { AnswerSpec, Rng } from '../../../shared/grading';
import { tsSrc } from '../books';

// ------------------------------------------------------------------ helpers
type Lc = Localized;
const src = (ch: number) => tsSrc(2, 'maths', ch);
const nm = (r: Rng) => r.pick(NAMES);
const te = (x: Lc) => x.te ?? x.en;
const obj = (emoji: string, count: number, groupsOf?: number): VisualSpec => (groupsOf ? { kind: 'objects', emoji, count, groupsOf } : { kind: 'objects', emoji, count });
const row = (text: string): VisualSpec => ({ kind: 'emoji', text });
const same = (s: string) => L(s, s);
type Mk = [when: string, explain: Lc][];
/** mistake feedback; drops entries that would match the correct answer (e.g. 2 + 2 = 2 × 2) and duplicate keys */
const mk = (m: Mk, answer?: AnswerSpec) => {
  const seen = new Set<string>();
  const ok = m.filter(([w]) => !(answer?.kind === 'number' && w === String(answer.value)) && !seen.has(w) && (seen.add(w), true));
  return ok.length ? { mistakes: ok.map(([when, explain]) => ({ when, explain })) } : {};
};
const typed = (prompt: Lc, answer: AnswerSpec, hints: Lc[], solution: Lc[], mistakes: Mk = [], extra: Partial<QSpec> = {}): QSpec => ({
  type: 'typed', keypad: 'numeric', prompt, answer, hints, solution, ...mk(mistakes, answer), ...extra,
});
const countQ = (prompt: Lc, n: number, visual: VisualSpec, hints: Lc[], solution: Lc[], mistakes: Mk = []): QSpec => ({
  type: 'count', keypad: 'numeric', prompt, visual, answer: num(n), hints, solution, ...mk(mistakes, num(n)),
});
const mcq = (r: Rng, prompt: Lc, correct: Lc, wrong: Lc[], hints: Lc[], solution: Lc[], mistakes: Mk = [], extra: Partial<QSpec> = {}): QSpec => ({
  type: 'mcq', prompt, ...choose(r, correct, wrong), hints, solution, ...mk(mistakes), ...extra,
});
const mcqN = (r: Rng, prompt: Lc, correct: number, wrong: number[], hints: Lc[], solution: Lc[], mistakes: Mk = [], extra: Partial<QSpec> = {}): QSpec => ({
  type: 'mcq', prompt, ...chooseNum(r, correct, wrong), hints, solution, ...mk(mistakes), ...extra,
});
/** concept bank entry: question, answer, wrong options, hint, solution, why-wrong, optional visual */
type BQ = [q: Lc, a: Lc, w: Lc[], hint: Lc, sol: Lc, why: Lc, v?: VisualSpec];
/** a template drawing one question from a bank (needs >= 5 entries) */
const bank = (key: string, list: BQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, a, w, hint, sol, why, v] = r.pick(list);
  return mcq(r, q, a, w, [hint], [sol], [['wrong', why]], v ? { visual: v } : {});
}, d);
/** tap-all template: picks 2–3 correct and 2–3 wrong items from the pools */
const tapT = (key: string, prompt: Lc, yes: Lc[], no: Lc[], hint: Lc, why: Lc): TSpec => tp(key, (r) => {
  const y = r.shuffle(yes).slice(0, r.int(2, 3)), n = r.shuffle(no).slice(0, r.int(2, 3));
  return {
    type: 'tap', prompt, ...tapAll(r, [...y.map((label) => ({ label, ok: true })), ...n.map((label) => ({ label, ok: false }))]),
    hints: [hint],
    solution: [L(`Yes: ${y.map((x) => x.en).join(', ')}.`, `అవును: ${y.map(te).join(', ')}.`), L(`No: ${n.map((x) => x.en).join(', ')}.`, `కాదు: ${n.map(te).join(', ')}.`)],
    mistakes: [{ when: 'wrong', explain: why }],
  };
});

// things to count (picture keys that have real photos)
interface Thing { en: string; te: string; e: string }
const ITEMS: Thing[] = [
  { en: 'mangoes', te: 'మామిడి పండ్లు', e: '🥭' }, { en: 'bananas', te: 'అరటి పండ్లు', e: '🍌' }, { en: 'balloons', te: 'బెలూన్లు', e: '🎈' },
  { en: 'flowers', te: 'పువ్వులు', e: '🌼' }, { en: 'kites', te: 'గాలిపటాలు', e: '🪁' }, { en: 'apples', te: 'ఆపిల్ పండ్లు', e: '🍎' },
  { en: 'fish', te: 'చేపలు', e: '🐟' }, { en: 'eggs', te: 'గుడ్లు', e: '🥚' }, { en: 'pencils', te: 'పెన్సిళ్లు', e: '✏️' },
  { en: 'diyas', te: 'ప్రమిదలు', e: '🪔' }, { en: 'coconuts', te: 'కొబ్బరికాయలు', e: '🥥' }, { en: 'tomatoes', te: 'టమాటాలు', e: '🍅' },
  { en: 'oranges', te: 'నారింజ పండ్లు', e: '🍊' }, { en: 'carrots', te: 'క్యారెట్లు', e: '🥕' },
];

// number names
const EN1 = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN10 = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const TE1 = ['సున్నా', 'ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది', 'పది', 'పదకొండు', 'పన్నెండు', 'పదమూడు', 'పద్నాలుగు', 'పదిహేను', 'పదహారు', 'పదిహేడు', 'పద్దెనిమిది', 'పందొమ్మిది'];
const TE10 = ['', '', 'ఇరవై', 'ముప్పై', 'నలభై', 'యాభై', 'అరవై', 'డెబ్బై', 'ఎనభై', 'తొంభై'];
const en99 = (n: number) => (n < 20 ? EN1[n] : EN10[Math.floor(n / 10)] + (n % 10 ? '-' + EN1[n % 10] : ''));
const te99 = (n: number) => (n < 20 ? TE1[n] : TE10[Math.floor(n / 10)] + (n % 10 ? ' ' + TE1[n % 10] : ''));
const enW = (n: number) => {
  const hu = Math.floor(n / 100), rest = n % 100;
  if (!hu) return en99(n);
  return `${EN1[hu]} hundred` + (rest ? ` ${en99(rest)}` : '');
};
const teW = (n: number) => {
  const hu = Math.floor(n / 100), rest = n % 100;
  if (!hu) return te99(n);
  if (!rest) return hu === 1 ? 'వంద' : `${TE1[hu]} వందలు`;
  return (hu === 1 ? 'నూట' : `${TE1[hu]} వందల`) + ' ' + te99(rest);
};
const word = (n: number) => L(enW(n), teW(n));
/** wrong answer from the "subtract smaller digit from larger" slip */
const smallFromLarge = (a: number, b: number) => {
  const A = String(a), Bs = String(b).padStart(A.length, '0');
  return +A.split('').map((d, i) => Math.abs(+d - +Bs[i])).join('');
};
/** wrong answer from forgetting the carry */
const noCarry = (a: number, b: number) => {
  const A = String(a), Bs = String(b).padStart(A.length, '0');
  return +A.split('').map((d, i) => (+d + +Bs[i]) % 10).join('');
};
const digitsOf = (n: number) => String(n).split('').map(Number);

// ================================================================== CH 1
const ch1: USpec = {
  id: 'ts2.ma.ch1', subject: 'math', title: L('Numbers from 1 to 20', '1 నుండి 20 వరకు సంఖ్యలు'), source: src(1),
  objectives: [
    {
      id: 'ts2.ma.n20.count', title: L('Counting things up to 20', '20 వరకు వస్తువులను లెక్కించడం'),
      activities: ['game:counting'],
      intro: [
        h('Let us count!', 'రండి, లెక్కిద్దాం!'),
        p('Touch each thing once. Say one number for each touch.', 'ప్రతి వస్తువును ఒక్కసారి తాకు. ఒక్కో తాకుకు ఒక సంఖ్య చెప్పు.'),
        photo('🥭', L('Mangoes at the Rythu Bazaar. Count them one by one: 1, 2, 3 …', 'రైతు బజారులో మామిడి పండ్లు. ఒక్కొక్కటిగా లెక్కించు: 1, 2, 3 …')),
        vis(obj('🥭', 14, 10), 'Ten mangoes and four more make fourteen', 'పది మామిడి పండ్లు, ఇంకా నాలుగు కలిపి పద్నాలుగు'),
        p('After 10, keep counting: 11, 12, 13 … up to 20.', '10 తర్వాత ముందుకు లెక్కించు: 11, 12, 13 … 20 వరకు.'),
        tip('Make a group of 10 first. Then count on: 10, 11, 12 …', 'ముందు 10 గుంపు చేయి. తర్వాత ముందుకు లెక్కించు: 10, 11, 12 …'),
      ],
      examples: [
        ex(L('Count the balloons.', 'బెలూన్లను లెక్కించు.'), [L('The first group has 10.', 'మొదటి గుంపులో 10 ఉన్నాయి.'), L('Count on: 11, 12, 13.', 'ముందుకు లెక్కించు: 11, 12, 13.')], L('13 balloons', '13 బెలూన్లు'), obj('🎈', 13, 10)),
        ex(L('Count the eggs in the basket.', 'బుట్టలోని గుడ్లను లెక్కించు.'), [L('Touch each egg once: 1, 2, 3, 4, 5, 6, 7.', 'ప్రతి గుడ్డును ఒక్కసారి తాకు: 1, 2, 3, 4, 5, 6, 7.')], L('7 eggs', '7 గుడ్లు'), obj('🥚', 7)),
      ],
      practice: [
        tp('count', (r) => {
          const n = r.int(4, 20), t = r.pick(ITEMS);
          return countQ(L(`How many ${t.en}? Count them.`, `ఎన్ని ${t.te}? లెక్కించు.`), n, obj(t.e, n, n > 10 ? 10 : undefined),
            [L('Touch each one once as you count.', 'లెక్కిస్తూ ప్రతి దాన్ని ఒక్కసారి తాకు.'), n > 10 ? L(`One group has 10. Count on from 10.`, 'ఒక గుంపులో 10 ఉన్నాయి. 10 నుండి ముందుకు లెక్కించు.') : L('Say the numbers slowly.', 'సంఖ్యలను నెమ్మదిగా చెప్పు.')],
            [L(`There are ${n} ${t.en}.`, `${n} ${t.te} ఉన్నాయి.`)],
            [[String(n - 1), L('So close! You missed one. Count again slowly.', 'దాదాపు సరైనదే! ఒకటి వదిలేశావు. మళ్ళీ నెమ్మదిగా లెక్కించు.')], [String(n + 1), L('You counted one thing two times. Touch each one only once.', 'ఒకదాన్ని రెండుసార్లు లెక్కించావు. ప్రతిదాన్ని ఒక్కసారే తాకు.')]]);
        }),
        tp('tenmore', (r) => {
          const o = r.int(1, 10), t = r.pick(ITEMS);
          return typed(L(`10 ${t.en} and ${o} more ${t.en}. How many in all?`, `10 ${t.te}, ఇంకా ${o} ${t.te}. మొత్తం ఎన్ని?`), num(10 + o),
            [L('Start at 10. Do not count the ten again.', '10 నుండి మొదలుపెట్టు. పదిని మళ్ళీ లెక్కించకు.'), L(`Count on ${o} more: ${range(11, 10 + Math.min(o, 3)).join(', ')} …`, `ఇంకా ${o} ముందుకు: ${range(11, 10 + Math.min(o, 3)).join(', ')} …`)],
            [L(`10 and ${o} more is ${10 + o}.`, `10, ఇంకా ${o} కలిపి ${10 + o}.`)],
            [[String(o), L('Do not forget the 10 that were already there.', 'ముందే ఉన్న 10 మర్చిపోకు.')], [`10${o}`, L(`Ten and ${o} more is a number in the teens, not ${'10' + o}.`, `పది, ఇంకా ${o} అంటే ${10 + o}.`)]],
            { visual: obj(t.e, 10 + o, 10) });
        }),
      ],
    },
    {
      id: 'ts2.ma.n20.names', title: L('Number names up to 20', '20 వరకు సంఖ్యల పేర్లు'),
      intro: [
        h('Every number has a name', 'ప్రతి సంఖ్యకు ఒక పేరు ఉంది'),
        p('We write 15. We say fifteen. In Telugu we say పదిహేను.', 'మనం 15 అని రాస్తాం. ఇంగ్లీషులో fifteen. తెలుగులో పదిహేను.'),
        photo('🪁', L('Sankranti kites! Twelve kites — 12 — పన్నెండు.', 'సంక్రాంతి గాలిపటాలు! పన్నెండు గాలిపటాలు — 12 — twelve.')),
        keys(L('11 eleven, 12 twelve, 13 thirteen', '11 పదకొండు, 12 పన్నెండు, 13 పదమూడు'), L('14 fourteen, 15 fifteen, 16 sixteen', '14 పద్నాలుగు, 15 పదిహేను, 16 పదహారు'), L('17 seventeen, 18 eighteen, 19 nineteen, 20 twenty', '17 పదిహేడు, 18 పద్దెనిమిది, 19 పందొమ్మిది, 20 ఇరవై')),
        tip('Thirteen to nineteen all end in "teen". Thirteen is 13, not 30!', 'thirteen నుండి nineteen వరకు చివర "teen" ఉంటుంది. thirteen అంటే 13, 30 కాదు!'),
      ],
      examples: [
        ex(L('Write the number for "seventeen".', '"పదిహేడు" సంఖ్య రాయి.'), [L('Seventeen is ten and seven.', 'పదిహేడు అంటే పది, ఏడు.'), L('10 + 7 = 17', '10 + 7 = 17')], same('17')),
        ex(L('Write the name of 20.', '20 పేరు రాయి.'), [L('20 is two tens.', '20 అంటే రెండు పదులు.')], L('twenty', 'ఇరవై')),
      ],
      practice: [
        tp('word', (r) => {
          const n = r.int(1, 20);
          return mcqN(r, L(`Which number is "${EN1[n] ?? 'twenty'}"?`, `"${TE1[n] ?? 'ఇరవై'}" ఏ సంఖ్య?`), n, [n + 1, n - 1, n >= 13 && n <= 19 ? (n - 10) * 10 : n + 10],
            [L('Say the numbers from 1 up to it.', '1 నుండి ఆ సంఖ్య వరకు చెప్పు.'), L('Teen numbers are ten and some more.', 'teen సంఖ్యలు అంటే పది, ఇంకా కొన్ని.')],
            [L(`"${EN1[n] ?? 'twenty'}" is ${n}.`, `"${TE1[n] ?? 'ఇరవై'}" అంటే ${n}.`)],
            [['wrong', L('Listen to the name again. Say it slowly and count to it.', 'పేరు మళ్ళీ విను. నెమ్మదిగా చెప్పి అంత వరకు లెక్కించు.')]]);
        }),
        tp('match', (r) => {
          const ns = r.shuffle(range(1, 20)).slice(0, 3);
          return {
            type: 'match', prompt: L(`Match each number to its name: ${ns.join(', ')}.`, `ప్రతి సంఖ్యను దాని పేరుతో జత చేయి: ${ns.join(', ')}.`),
            ...matching(r, ns.map((n) => [same(String(n)), word(n)])),
            hints: [L('Start with the number you know best.', 'నీకు బాగా తెలిసిన సంఖ్యతో మొదలుపెట్టు.')],
            mistakes: [{ when: 'wrong', explain: L('Read each name slowly and count up to it.', 'ప్రతి పేరును నెమ్మదిగా చదివి అంత వరకు లెక్కించు.') }],
            solution: ns.map((n) => L(`${n} → ${enW(n)}`, `${n} → ${teW(n)}`)),
          };
        }),
      ],
    },
    {
      id: 'ts2.ma.n20.order', title: L('Before, after and between', 'ముందు, తర్వాత, మధ్య'),
      activities: ['game:numberline'],
      intro: [
        h('Numbers stand in a line', 'సంఖ్యలు వరుసలో నిలబడతాయి'),
        p('Each number has a neighbour before it and after it.', 'ప్రతి సంఖ్యకు ముందు ఒకటి, తర్వాత ఒకటి పక్కన ఉంటాయి.'),
        vis({ kind: 'number-line', from: 0, to: 20, step: 1, marks: [11, 12, 13] }, '12 is between 11 and 13', '12 అనేది 11, 13 మధ్యలో ఉంది'),
        photo('🚌', L('Children line up for the school bus. Who is just before you? Who is just after?', 'పిల్లలు బడి బస్సు కోసం వరుసలో నిలబడ్డారు. నీకు ముందు ఎవరు? తర్వాత ఎవరు?')),
        p('After means one more. Before means one less.', 'తర్వాత అంటే ఒకటి ఎక్కువ. ముందు అంటే ఒకటి తక్కువ.'),
        tip('Put your finger on the number line and move one step.', 'సంఖ్యా రేఖ మీద వేలు పెట్టి ఒక అడుగు కదుపు.'),
      ],
      examples: [
        ex(L('What comes just after 15?', '15 తర్వాత వెంటనే ఏది వస్తుంది?'), [L('Move one step forward from 15.', '15 నుండి ఒక అడుగు ముందుకు.')], same('16')),
        ex(L('What number is between 18 and 20?', '18, 20 మధ్య ఏ సంఖ్య ఉంది?'), [L('Count: 18, 19, 20.', 'లెక్కించు: 18, 19, 20.'), L('19 is in the middle.', 'మధ్యలో 19 ఉంది.')], same('19')),
      ],
      practice: [
        tp('ab', (r) => {
          const kind = r.pick(['after', 'before', 'between'] as const), n = r.int(2, 19);
          const pr = kind === 'after' ? L(`What comes just after ${n}?`, `${n} తర్వాత వెంటనే ఏది?`) : kind === 'before' ? L(`What comes just before ${n}?`, `${n} కి ముందు వెంటనే ఏది?`) : L(`What number is between ${n - 1} and ${n + 1}?`, `${n - 1}, ${n + 1} మధ్య ఏ సంఖ్య?`);
          const ans = kind === 'after' ? n + 1 : kind === 'before' ? n - 1 : n;
          return typed(pr, num(ans), [kind === 'before' ? L('Before means one less.', 'ముందు అంటే ఒకటి తక్కువ.') : kind === 'after' ? L('After means one more.', 'తర్వాత అంటే ఒకటి ఎక్కువ.') : L('Count from the first number to the second.', 'మొదటి సంఖ్య నుండి రెండో సంఖ్య వరకు లెక్కించు.')],
            [L(`The answer is ${ans}.`, `జవాబు ${ans}.`)],
            kind === 'after' ? [[String(n - 1), L('That comes before. After is one more.', 'అది ముందు వస్తుంది. తర్వాత అంటే ఒకటి ఎక్కువ.')]] : kind === 'before' ? [[String(n + 1), L('That comes after. Before is one less.', 'అది తర్వాత వస్తుంది. ముందు అంటే ఒకటి తక్కువ.')]] : [],
            { visual: { kind: 'number-line', from: 0, to: 20, step: 1 } });
        }),
        tp('order', (r) => {
          const ns = r.shuffle(range(1, 20)).slice(0, 4), up = r.int(0, 1) === 1;
          const sorted = [...ns].sort((a, b) => (up ? a - b : b - a));
          return {
            type: 'order', prompt: up ? L(`Put in order, smallest first: ${ns.join(', ')}`, `చిన్నది ముందు వచ్చేలా అమర్చు: ${ns.join(', ')}`) : L(`Put in order, biggest first: ${ns.join(', ')}`, `పెద్దది ముందు వచ్చేలా అమర్చు: ${ns.join(', ')}`),
            ...ordering(r, sorted.map((n) => same(String(n)))),
            hints: [L('Find the smallest number first.', 'ముందు చిన్న సంఖ్యను వెతుకు.'), L('Use the number line: left is smaller.', 'సంఖ్యా రేఖ చూడు: ఎడమ వైపుది చిన్నది.')],
            mistakes: [{ when: 'wrong', explain: L('Check each pair: which comes first when you count?', 'ప్రతి జత చూడు: లెక్కించేటప్పుడు ఏది ముందు వస్తుంది?') }],
            solution: [same(sorted.join(up ? ' < ' : ' > '))],
          };
        }),
      ],
    },
  ],
};

// ================================================================== CH 2
const ch2: USpec = {
  id: 'ts2.ma.ch2', subject: 'math', title: L('Numbers from 10 to 99', '10 నుండి 99 వరకు సంఖ్యలు'), source: src(2),
  objectives: [
    {
      id: 'ts2.ma.n99.tens', title: L('Tens and ones', 'పదులు మరియు ఒకట్లు'), prereqs: ['ts2.ma.n20.count'],
      activities: ['game:counting'],
      intro: [
        h('Bundles of ten', 'పదేసి కట్టలు'),
        p('Tie 10 pencils together. That is 1 ten.', '10 పెన్సిళ్లను కలిపి కట్టు. అది 1 పది.'),
        photo('✏️', L('Pencils in bundles of 10 make counting quick.', 'పదేసి కట్టలుగా పెన్సిళ్లు ఉంటే లెక్కించడం సులభం.')),
        vis(obj('✏️', 34, 10), '3 bundles of ten and 4 loose pencils make 34', '3 పదుల కట్టలు, 4 విడి పెన్సిళ్లు కలిపి 34'),
        p('3 tens and 4 ones make 34. The tens digit comes first.', '3 పదులు, 4 ఒకట్లు కలిపి 34. పదుల అంకె ముందు వస్తుంది.'),
        tip('Count the bundles in tens: 10, 20, 30. Then count the loose ones.', 'కట్టలను పదేసి లెక్కించు: 10, 20, 30. తర్వాత విడివి లెక్కించు.'),
      ],
      examples: [
        ex(L('How many pencils? 2 bundles of ten and 5 loose.', 'ఎన్ని పెన్సిళ్లు? 2 పదుల కట్టలు, 5 విడివి.'), [L('2 tens = 20', '2 పదులు = 20'), L('20 and 5 more = 25', '20, ఇంకా 5 = 25')], L('25 pencils', '25 పెన్సిళ్లు'), obj('✏️', 25, 10)),
        ex(L('How many tens and ones in 52?', '52 లో ఎన్ని పదులు, ఎన్ని ఒకట్లు?'), [L('5 is in the tens place.', '5 పదుల స్థానంలో ఉంది.'), L('2 is in the ones place.', '2 ఒకట్ల స్థానంలో ఉంది.')], L('5 tens and 2 ones', '5 పదులు, 2 ఒకట్లు')),
      ],
      practice: [
        tp('count', (r) => {
          const t = r.int(2, 5), o = r.int(0, 9), n = t * 10 + o;
          return countQ(L('How many pencils? Count the bundles of ten first.', 'ఎన్ని పెన్సిళ్లు? ముందు పదుల కట్టలు లెక్కించు.'), n, obj('✏️', n, 10),
            [L(`There are ${t} full groups of ten.`, `${t} పూర్తి పదుల గుంపులు ఉన్నాయి.`), L(`Say ${range(1, t).map((i) => i * 10).join(', ')} then count on.`, `${range(1, t).map((i) => i * 10).join(', ')} అని చెప్పి ముందుకు లెక్కించు.`)],
            [L(`${t} tens and ${o} ones = ${n}`, `${t} పదులు, ${o} ఒకట్లు = ${n}`)],
            o && o !== t ? [[String(o * 10 + t), L('Tens and ones got swapped. The number of bundles is the first digit.', 'పదులు, ఒకట్లు తారుమారయ్యాయి. కట్టల సంఖ్య మొదటి అంకె.')]] : []);
        }),
        tp('build', (r) => {
          const t = r.int(1, 9), o = r.int(1, 9), n = t * 10 + o;
          return typed(L(`${t} tens and ${o} ones make which number?`, `${t} పదులు, ${o} ఒకట్లు కలిపి ఏ సంఖ్య?`), num(n),
            [L('Write the tens digit first, then the ones digit.', 'ముందు పదుల అంకె, తర్వాత ఒకట్ల అంకె రాయి.')],
            [L(`${t} tens = ${t * 10}. ${t * 10} + ${o} = ${n}.`, `${t} పదులు = ${t * 10}. ${t * 10} + ${o} = ${n}.`)],
            [...(t !== o ? [[String(o * 10 + t), L('Tens go on the left, ones on the right.', 'పదులు ఎడమ వైపు, ఒకట్లు కుడి వైపు.')] as [string, Lc]] : []), [`${t * 10}${o}`, L(`${t} tens is ${t * 10}. Put ${o} in the ones place: ${n}.`, `${t} పదులు అంటే ${t * 10}. ఒకట్ల స్థానంలో ${o}: ${n}.`)]]);
        }),
      ],
    },
    {
      id: 'ts2.ma.n99.place', title: L('Place value of digits', 'అంకెల స్థాన విలువ'), prereqs: ['ts2.ma.n99.tens'],
      intro: [
        h('Where a digit sits matters', 'అంకె ఎక్కడ ఉందో ముఖ్యం'),
        p('In 47, the 4 is in the tens place. Its value is 40.', '47 లో 4 పదుల స్థానంలో ఉంది. దాని విలువ 40.'),
        p('The 7 is in the ones place. Its value is 7.', '7 ఒకట్ల స్థానంలో ఉంది. దాని విలువ 7.'),
        photo('🧮', L('An abacus: beads on the tens rod are worth 10 each.', 'పూసల చట్రం: పదుల కడ్డీ మీద ప్రతి పూస విలువ 10.')),
        vis(row('47 = 40 + 7'), '47 is 40 and 7', '47 అంటే 40, 7'),
        tip('The tens digit tells how many bundles of ten.', 'పదుల అంకె ఎన్ని పదుల కట్టలో చెబుతుంది.'),
      ],
      examples: [
        ex(L('What is the value of 6 in 68?', '68 లో 6 విలువ ఎంత?'), [L('6 is in the tens place.', '6 పదుల స్థానంలో ఉంది.'), L('6 tens = 60', '6 పదులు = 60')], same('60')),
        ex(L('Write 83 as tens plus ones.', '83 ను పదులు + ఒకట్లుగా రాయి.'), [L('8 tens = 80, 3 ones = 3', '8 పదులు = 80, 3 ఒకట్లు = 3')], same('83 = 80 + 3')),
      ],
      practice: [
        tp('value', (r) => {
          const t = r.int(1, 9);
          let o = r.int(1, 9);
          if (t === o) o = o === 9 ? 1 : o + 1;
          const n = t * 10 + o, askT = r.int(0, 1) === 1, d = askT ? t : o, v = askT ? t * 10 : o;
          return mcqN(r, L(`What is the value of ${d} in ${n}?`, `${n} లో ${d} విలువ ఎంత?`), v, askT ? [t, o, o * 10] : [o * 10, t, t * 10],
            [L('Is the digit in the tens place or the ones place?', 'ఆ అంకె పదుల స్థానంలో ఉందా, ఒకట్ల స్థానంలో ఉందా?')],
            [L(`${d} is in the ${askT ? 'tens' : 'ones'} place, so its value is ${v}.`, `${d} ${askT ? 'పదుల' : 'ఒకట్ల'} స్థానంలో ఉంది, కాబట్టి విలువ ${v}.`)],
            [['wrong', L('Find the place first: tens digit means that many tens.', 'ముందు స్థానం చూడు: పదుల అంకె అంటే అన్ని పదులు.')]]);
        }),
        tp('expand', (r) => {
          const t = r.int(1, 9), o = r.int(1, 9), n = t * 10 + o, miss = r.int(0, 1);
          return typed(miss ? L(`${n} = ${t * 10} + ?`, `${n} = ${t * 10} + ?`) : L(`${n} = ? + ${o}`, `${n} = ? + ${o}`), num(miss ? o : t * 10),
            [L(`Split ${n} into tens and ones.`, `${n} ను పదులు, ఒకట్లుగా విడదీయి.`)],
            [L(`${n} = ${t * 10} + ${o}`, `${n} = ${t * 10} + ${o}`)],
            miss ? [] : [[String(t), L(`${t} tens is ${t * 10}, not ${t}.`, `${t} పదులు అంటే ${t * 10}, ${t} కాదు.`)]]);
        }),
      ],
    },
    {
      id: 'ts2.ma.n99.names', title: L('Number names and counting to 99', '99 వరకు సంఖ్యల పేర్లు, లెక్కింపు'), prereqs: ['ts2.ma.n99.tens'],
      activities: ['game:numberline'],
      intro: [
        h('Say and write big numbers', 'పెద్ద సంఖ్యలు చెప్పు, రాయి'),
        p('Say the tens name, then the ones name. 64 is sixty-four.', 'ముందు పదుల పేరు, తర్వాత ఒకట్ల పేరు. 64 అంటే అరవై నాలుగు.'),
        photo('🌼', L('Bathukamma flowers! Count them in tens: ten, twenty, thirty …', 'బతుకమ్మ పువ్వులు! పదేసి లెక్కించు: పది, ఇరవై, ముప్పై …')),
        keys(L('10 ten, 20 twenty, 30 thirty, 40 forty, 50 fifty', '10 పది, 20 ఇరవై, 30 ముప్పై, 40 నలభై, 50 యాభై'), L('60 sixty, 70 seventy, 80 eighty, 90 ninety', '60 అరవై, 70 డెబ్బై, 80 ఎనభై, 90 తొంభై')),
        p('After 39 comes 40. After 9 ones we make a new ten.', '39 తర్వాత 40. 9 ఒకట్ల తర్వాత కొత్త పది వస్తుంది.'),
        tip('Forty has no "u". Four has a "u". Look carefully!', 'forty లో "u" ఉండదు. four లో "u" ఉంటుంది. జాగ్రత్తగా చూడు!'),
      ],
      examples: [
        ex(L('Write the name of 75.', '75 పేరు రాయి.'), [L('7 tens: seventy. 5 ones: five.', '7 పదులు: డెబ్బై. 5 ఒకట్లు: ఐదు.')], L('seventy-five', 'డెబ్బై ఐదు')),
        ex(L('What comes after 59?', '59 తర్వాత ఏది?'), [L('59 has 9 ones. One more makes a new ten.', '59 లో 9 ఒకట్లు. ఒకటి కలిపితే కొత్త పది.'), L('5 tens + 1 ten = 6 tens', '5 పదులు + 1 పది = 6 పదులు')], same('60')),
      ],
      practice: [
        tp('name', (r) => {
          const t = r.int(2, 9);
          let o = r.int(1, 9);
          if (t === o) o = o === 9 ? 1 : o + 1;
          const n = t * 10 + o;
          return mcq(r, L(`Which is the name of ${n}?`, `${n} పేరు ఏది?`), word(n), [word(o * 10 + t), word(n + 1), word(t * 10)],
            [L('Say the tens first, then the ones.', 'ముందు పదులు, తర్వాత ఒకట్లు చెప్పు.')],
            [L(`${n} is ${en99(n)}.`, `${n} అంటే ${te99(n)}.`)],
            [['wrong', L(`${n} has ${t} tens and ${o} ones.`, `${n} లో ${t} పదులు, ${o} ఒకట్లు.`)]]);
        }),
        tp('next', (r) => {
          const t = r.int(1, 8), kind = r.pick(['after9', 'after', 'before0'] as const);
          const n = kind === 'after9' ? t * 10 + 9 : kind === 'before0' ? (t + 1) * 10 : t * 10 + r.int(1, 7);
          const ans = kind === 'before0' ? n - 1 : n + 1;
          return typed(kind === 'before0' ? L(`What comes just before ${n}?`, `${n} కి ముందు వెంటనే ఏది?`) : L(`What comes just after ${n}?`, `${n} తర్వాత వెంటనే ఏది?`), num(ans),
            [kind === 'after9' ? L('After 9 ones, we get a new ten.', '9 ఒకట్ల తర్వాత కొత్త పది వస్తుంది.') : kind === 'before0' ? L('One less than a full ten ends in 9.', 'పూర్తి పదికి ఒకటి తక్కువ అంటే చివర 9.') : L('Add one to the ones digit.', 'ఒకట్ల అంకెకు ఒకటి కలుపు.')],
            [L(`The answer is ${ans}.`, `జవాబు ${ans}.`)],
            kind === 'after9' ? [[`${t}10`, L(`There is no "${t}10". After ${n} comes ${ans}.`, `"${t}10" అనే సంఖ్య లేదు. ${n} తర్వాత ${ans}.`)], [String(t * 10), L('That goes back. After means one more.', 'అది వెనక్కి వెళ్ళింది. తర్వాత అంటే ఒకటి ఎక్కువ.')]] : []);
        }),
      ],
    },
  ],
};

// ================================================================== CH 3
const ch3: USpec = {
  id: 'ts2.ma.ch3', subject: 'math', title: L('Numbers with Three Digits', 'మూడు అంకెల సంఖ్యలు'), source: src(3),
  objectives: [
    {
      id: 'ts2.ma.n999.hto', title: L('Hundreds, tens and ones', 'వందలు, పదులు, ఒకట్లు'), prereqs: ['ts2.ma.n99.tens'],
      intro: [
        h('Ten tens make a hundred', 'పది పదులు కలిపితే వంద'),
        p('10 ones make 1 ten. 10 tens make 1 hundred.', '10 ఒకట్లు = 1 పది. 10 పదులు = 1 వంద.'),
        photo('🧮', L('An abacus with three rods: hundreds, tens and ones.', 'మూడు కడ్డీల పూసల చట్రం: వందలు, పదులు, ఒకట్లు.')),
        vis(row('100 + 100 + 10 + 10 + 10 + 1 + 1 = 232'), '2 hundreds, 3 tens and 2 ones make 232', '2 వందలు, 3 పదులు, 2 ఒకట్లు కలిపి 232'),
        p('A three-digit number has a hundreds digit, a tens digit and a ones digit.', 'మూడు అంకెల సంఖ్యలో వందల అంకె, పదుల అంకె, ఒకట్ల అంకె ఉంటాయి.'),
        tip('If there are no tens, write 0 in the tens place. 3 hundreds and 5 ones is 305.', 'పదులు లేకపోతే పదుల స్థానంలో 0 రాయి. 3 వందలు, 5 ఒకట్లు = 305.'),
      ],
      examples: [
        ex(L('2 hundreds, 4 tens and 6 ones. Which number?', '2 వందలు, 4 పదులు, 6 ఒకట్లు. ఏ సంఖ్య?'), [L('Hundreds digit: 2', 'వందల అంకె: 2'), L('Tens digit: 4', 'పదుల అంకె: 4'), L('Ones digit: 6', 'ఒకట్ల అంకె: 6')], same('246')),
        ex(L('4 hundreds and 7 ones. Which number?', '4 వందలు, 7 ఒకట్లు. ఏ సంఖ్య?'), [L('There are no tens, so the tens digit is 0.', 'పదులు లేవు, కాబట్టి పదుల అంకె 0.')], same('407')),
      ],
      practice: [
        tp('build', (r) => {
          const hu = r.int(1, 9), t = r.int(0, 9), o = r.int(0, 9), n = hu * 100 + t * 10 + o;
          const parts = [`${hu} hundreds`, t ? `${t} tens` : '', o ? `${o} ones` : ''].filter(Boolean).join(', ');
          const partsTe = [`${hu} వందలు`, t ? `${t} పదులు` : '', o ? `${o} ఒకట్లు` : ''].filter(Boolean).join(', ');
          const m: Mk = [];
          if (t === 0 && o) m.push([`${hu}${o}`, L('There are no tens. Write 0 in the tens place.', 'పదులు లేవు. పదుల స్థానంలో 0 రాయి.')]);
          if (o === 0 && t) m.push([`${hu}${t}`, L('There are no ones. Write 0 in the ones place.', 'ఒకట్లు లేవు. ఒకట్ల స్థానంలో 0 రాయి.')]);
          return typed(L(`${parts}. Which number is it?`, `${partsTe}. ఇది ఏ సంఖ్య?`), num(n),
            [L('Write hundreds, then tens, then ones.', 'వందలు, తర్వాత పదులు, తర్వాత ఒకట్లు రాయి.'), L('An empty place gets a 0.', 'ఖాళీ స్థానంలో 0 పెట్టు.')],
            [L(`Hundreds ${hu}, tens ${t}, ones ${o} → ${n}`, `వందలు ${hu}, పదులు ${t}, ఒకట్లు ${o} → ${n}`)], m);
        }),
        tp('read', (r) => {
          const n = r.int(101, 999), [hu, t, o] = digitsOf(n), ask = r.pick(['hundreds', 'tens', 'ones'] as const);
          const ans = ask === 'hundreds' ? hu : ask === 'tens' ? t : o;
          const teAsk = ask === 'hundreds' ? 'వందలు' : ask === 'tens' ? 'పదులు' : 'ఒకట్లు';
          return typed(L(`How many ${ask} are in ${n}? (Give the digit.)`, `${n} లో ఎన్ని ${teAsk}? (అంకె చెప్పు.)`), num(ans),
            [L('From the right: ones, tens, hundreds.', 'కుడి నుండి: ఒకట్లు, పదులు, వందలు.')],
            [L(`${n}: ${hu} hundreds, ${t} tens, ${o} ones.`, `${n}: ${hu} వందలు, ${t} పదులు, ${o} ఒకట్లు.`)],
            [['wrong-value', L('Count the places from the right: ones first.', 'కుడి నుండి స్థానాలు లెక్కించు: ముందు ఒకట్లు.')]]);
        }),
      ],
    },
    {
      id: 'ts2.ma.n999.place', title: L('Place value and expanded form', 'స్థాన విలువ, విస్తరణ రూపం'), prereqs: ['ts2.ma.n999.hto'],
      intro: [
        h('What is each digit worth?', 'ప్రతి అంకె విలువ ఎంత?'),
        p('In 358, the 3 is worth 300. The 5 is worth 50. The 8 is worth 8.', '358 లో 3 విలువ 300. 5 విలువ 50. 8 విలువ 8.'),
        vis(row('358 = 300 + 50 + 8'), '358 is 300 and 50 and 8', '358 అంటే 300, 50, 8'),
        photo('🪙', L('Like money: ₹300 and ₹50 and ₹8 make ₹358.', 'డబ్బు లాగా: ₹300, ₹50, ₹8 కలిపి ₹358.')),
        tip('Writing 300 + 50 + 8 is called the expanded form.', '300 + 50 + 8 అని రాయడాన్ని విస్తరణ రూపం అంటారు.'),
      ],
      examples: [
        ex(L('Write 627 in expanded form.', '627 ను విస్తరణ రూపంలో రాయి.'), [L('6 hundreds = 600', '6 వందలు = 600'), L('2 tens = 20', '2 పదులు = 20'), L('7 ones = 7', '7 ఒకట్లు = 7')], same('600 + 20 + 7')),
        ex(L('What is the value of 9 in 495?', '495 లో 9 విలువ ఎంత?'), [L('9 is in the tens place.', '9 పదుల స్థానంలో ఉంది.'), L('9 tens = 90', '9 పదులు = 90')], same('90')),
      ],
      practice: [
        tp('value', (r) => {
          const ds = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3), n = ds[0] * 100 + ds[1] * 10 + ds[2], i = r.int(0, 2);
          const v = ds[i] * [100, 10, 1][i];
          return mcqN(r, L(`What is the value of ${ds[i]} in ${n}?`, `${n} లో ${ds[i]} విలువ ఎంత?`), v, [ds[i], ds[i] * 10, ds[i] * 100].filter((x) => x !== v),
            [L('Which place is the digit in?', 'ఆ అంకె ఏ స్థానంలో ఉంది?')],
            [L(`${ds[i]} is in the ${['hundreds', 'tens', 'ones'][i]} place, so it is worth ${v}.`, `${ds[i]} ${['వందల', 'పదుల', 'ఒకట్ల'][i]} స్థానంలో ఉంది, విలువ ${v}.`)],
            [['wrong', L('The same digit is worth more when it is further to the left.', 'ఒకే అంకె ఎడమ వైపు ఉంటే విలువ ఎక్కువ.')]]);
        }),
        tp('join', (r) => {
          const hu = r.int(1, 9), t = r.int(0, 9), o = r.int(1, 9), n = hu * 100 + t * 10 + o;
          return typed(L(`${hu * 100} + ${t * 10} + ${o} = ?`, `${hu * 100} + ${t * 10} + ${o} = ?`), num(n),
            [L('Put each part in its place: hundreds, tens, ones.', 'ప్రతి భాగాన్ని దాని స్థానంలో పెట్టు: వందలు, పదులు, ఒకట్లు.')],
            [L(`${hu} hundreds, ${t} tens, ${o} ones = ${n}`, `${hu} వందలు, ${t} పదులు, ${o} ఒకట్లు = ${n}`)],
            [[`${hu * 100}${t * 10}${o}`, L('Do not write the parts side by side. Add them.', 'భాగాలను పక్కపక్కన రాయకు. కలుపు.')]]);
        }),
      ],
    },
    {
      id: 'ts2.ma.n999.names', title: L('Reading and writing three-digit numbers', 'మూడు అంకెల సంఖ్యలు చదవడం, రాయడం'), prereqs: ['ts2.ma.n999.hto'],
      intro: [
        h('Say the hundreds first', 'ముందు వందలు చెప్పు'),
        p('245 is two hundred forty-five.', '245 అంటే రెండు వందల నలభై ఐదు.'),
        p('After 199 comes 200. After 299 comes 300.', '199 తర్వాత 200. 299 తర్వాత 300.'),
        photo('🚌', L('Bus number 218 goes to Charminar. Read it: two hundred eighteen.', '218 నంబర్ బస్సు చార్మినార్ వెళ్తుంది. చదువు: రెండు వందల పద్దెనిమిది.')),
        tip('Read the number in parts: hundreds, then the rest.', 'సంఖ్యను భాగాలుగా చదువు: వందలు, తర్వాత మిగతాది.'),
      ],
      examples: [
        ex(L('Read 503.', '503 చదువు.'), [L('5 hundreds: five hundred.', '5 వందలు: ఐదు వందల.'), L('Then 3: three.', 'తర్వాత 3: మూడు.')], L('five hundred three', 'ఐదు వందల మూడు')),
        ex(L('What comes after 399?', '399 తర్వాత ఏది?'), [L('399 + 1: nine ones become a new ten, nine tens become a new hundred.', '399 + 1: తొమ్మిది ఒకట్లు కొత్త పది, తొమ్మిది పదులు కొత్త వంద.')], same('400')),
      ],
      practice: [
        tp('name', (r) => {
          const hu = r.int(1, 9), t = r.int(1, 9), o = r.int(0, 9), n = hu * 100 + t * 10 + o;
          return mcq(r, L(`Which is the name of ${n}?`, `${n} పేరు ఏది?`), word(n), [word(hu * 100 + o * 10 + t), word(t * 100 + hu * 10 + o), word(hu * 100 + o), word(n + 10)],
            [L('Say the hundreds digit first.', 'ముందు వందల అంకె చెప్పు.')],
            [L(`${n} is ${enW(n)}.`, `${n} అంటే ${teW(n)}.`)],
            [['wrong', L(`${n} has ${hu} hundreds, ${t} tens and ${o} ones.`, `${n} లో ${hu} వందలు, ${t} పదులు, ${o} ఒకట్లు.`)]]);
        }),
        tp('next', (r) => {
          const kind = r.pick(['after', 'before', 'after99'] as const), hu = r.int(1, 8);
          const n = kind === 'after99' ? hu * 100 + 99 : kind === 'after' ? hu * 100 + r.int(10, 88) : (hu + 1) * 100;
          const ans = kind === 'before' ? n - 1 : n + 1;
          return typed(kind === 'before' ? L(`What comes just before ${n}?`, `${n} కి ముందు వెంటనే ఏది?`) : L(`What comes just after ${n}?`, `${n} తర్వాత వెంటనే ఏది?`), num(ans),
            [kind === 'before' ? L('Before means one less.', 'ముందు అంటే ఒకటి తక్కువ.') : L('After means one more.', 'తర్వాత అంటే ఒకటి ఎక్కువ.')],
            [L(`The answer is ${ans}.`, `జవాబు ${ans}.`)],
            kind === 'after99' ? [[`${hu}100`, L(`After ${n} we get a new hundred: ${ans}.`, `${n} తర్వాత కొత్త వంద: ${ans}.`)]] : []);
        }),
      ],
    },
  ],
};

// ================================================================== CH 4
const SIGNS = [same('>'), same('<'), same('=')];
const ch4: USpec = {
  id: 'ts2.ma.ch4', subject: 'math', title: L('Comparing Three-Digit Numbers', 'మూడు అంకెల సంఖ్యల పోలిక'), source: src(4),
  objectives: [
    {
      id: 'ts2.ma.cmp.sign', title: L('Greater than, less than, equal to', 'పెద్దది, చిన్నది, సమానం'), prereqs: ['ts2.ma.n999.hto'],
      intro: [
        h('Which is more?', 'ఏది ఎక్కువ?'),
        p('Look at the hundreds first. More hundreds means a bigger number.', 'ముందు వందలు చూడు. వందలు ఎక్కువ ఉంటే సంఖ్య పెద్దది.'),
        p('If hundreds are the same, look at the tens. Then the ones.', 'వందలు సమానమైతే పదులు చూడు. తర్వాత ఒకట్లు.'),
        photo('🐘', L('An elephant is big. The open side of > or < faces the bigger number.', 'ఏనుగు పెద్దది. > లేదా < యొక్క తెరిచిన వైపు పెద్ద సంఖ్య వైపు ఉంటుంది.')),
        vis(row('425 > 398    213 < 231    506 = 506'), 'Examples of greater than, less than and equal', 'పెద్దది, చిన్నది, సమానం ఉదాహరణలు'),
        tip('> means "is greater than". < means "is less than".', '> అంటే "కంటే పెద్దది". < అంటే "కంటే చిన్నది".'),
      ],
      examples: [
        ex(L('Compare 452 and 425.', '452, 425 పోల్చు.'), [L('Hundreds: 4 and 4 — same.', 'వందలు: 4, 4 — సమానం.'), L('Tens: 5 is more than 2.', 'పదులు: 5, 2 కంటే ఎక్కువ.')], same('452 > 425')),
        ex(L('Compare 189 and 301.', '189, 301 పోల్చు.'), [L('Hundreds: 1 is less than 3.', 'వందలు: 1, 3 కంటే తక్కువ.'), L('No need to look further.', 'ఇంకా చూడనవసరం లేదు.')], same('189 < 301')),
      ],
      practice: [
        tp('sign', (r) => {
          const a = r.int(100, 999), kind = r.int(0, 4);
          const b = kind === 0 ? a : kind === 1 ? Math.floor(a / 100) * 100 + (a % 10) * 10 + Math.floor((a % 100) / 10) : kind === 2 ? Math.min(999, a + r.int(1, 9)) : r.int(100, 999);
          const s = a > b ? '>' : a < b ? '<' : '=';
          return {
            type: 'mcq', prompt: L(`Choose the sign: ${a} __ ${b}`, `గుర్తు ఎంచుకో: ${a} __ ${b}`), ...choose(r, same(s), SIGNS.filter((x) => x.en !== s)),
            hints: [L('Compare hundreds, then tens, then ones.', 'వందలు, తర్వాత పదులు, తర్వాత ఒకట్లు పోల్చు.'), L('The open mouth eats the bigger number.', 'తెరిచిన నోరు పెద్ద సంఖ్యను తింటుంది.')],
            solution: [L(`${a} ${s} ${b}`, `${a} ${s} ${b}`)],
            mistakes: [{ when: 'wrong', explain: L('Check the first place where the digits are different.', 'అంకెలు మొదట ఎక్కడ వేరుగా ఉన్నాయో చూడు.') }],
          };
        }),
        tp('bigger', (r) => {
          const hu = r.int(1, 9), a = hu * 100 + r.int(0, 99);
          let b = hu * 100 + r.int(0, 99);
          if (b === a) b = a === hu * 100 + 99 ? a - 1 : a + 1;
          const big = r.int(0, 1) === 1;
          const ans = big ? Math.max(a, b) : Math.min(a, b);
          return mcqN(r, big ? L(`Which is bigger: ${a} or ${b}?`, `ఏది పెద్దది: ${a} లేదా ${b}?`) : L(`Which is smaller: ${a} or ${b}?`, `ఏది చిన్నది: ${a} లేదా ${b}?`), ans, [ans === a ? b : a],
            [L('The hundreds are the same. Look at the tens.', 'వందలు సమానం. పదులు చూడు.')],
            [L(`${Math.max(a, b)} > ${Math.min(a, b)}, so the answer is ${ans}.`, `${Math.max(a, b)} > ${Math.min(a, b)}, కాబట్టి జవాబు ${ans}.`)],
            [['wrong', L('Both start with the same hundreds. The next digit decides.', 'రెండింటి వందలు ఒకటే. తర్వాతి అంకె నిర్ణయిస్తుంది.')]]);
        }),
      ],
    },
    {
      id: 'ts2.ma.cmp.order', title: L('Putting numbers in order', 'సంఖ్యలను క్రమంలో అమర్చడం'), prereqs: ['ts2.ma.cmp.sign'],
      intro: [
        h('Smallest to biggest', 'చిన్నది నుండి పెద్దది'),
        p('Ascending order: start with the smallest.', 'ఆరోహణ క్రమం: చిన్నదానితో మొదలు.'),
        p('Descending order: start with the biggest.', 'అవరోహణ క్రమం: పెద్దదానితో మొదలు.'),
        photo('🧒', L('Children stand from shortest to tallest — that is ascending order!', 'పిల్లలు పొట్టి నుండి పొడవు వరకు నిలబడ్డారు — అదే ఆరోహణ క్రమం!')),
        tip('Find the smallest. Cross it out. Find the next smallest.', 'చిన్నదాన్ని వెతుకు. దాన్ని కొట్టేయి. తర్వాతి చిన్నదాన్ని వెతుకు.'),
      ],
      examples: [
        ex(L('Order from smallest: 312, 231, 321', 'చిన్నది ముందు: 312, 231, 321'), [L('231 has 2 hundreds — smallest.', '231 లో 2 వందలు — చిన్నది.'), L('312 and 321: tens 1 < 2.', '312, 321: పదులు 1 < 2.')], same('231, 312, 321')),
        ex(L('Which is the biggest: 708, 780, 87?', 'ఏది పెద్దది: 708, 780, 87?'), [L('87 has only two digits — it is small.', '87 కి రెండు అంకెలే — చిన్నది.'), L('780 has 8 tens, 708 has 0 tens.', '780 లో 8 పదులు, 708 లో 0 పదులు.')], same('780')),
      ],
      practice: [
        tp('order', (r) => {
          const ns: number[] = [];
          while (ns.length < 4) { const n = r.int(100, 999); if (!ns.includes(n)) ns.push(n); }
          const up = r.int(0, 1) === 1, sorted = [...ns].sort((a, b) => (up ? a - b : b - a));
          return {
            type: 'order', prompt: up ? L(`Smallest first: ${ns.join(', ')}`, `చిన్నది ముందు: ${ns.join(', ')}`) : L(`Biggest first: ${ns.join(', ')}`, `పెద్దది ముందు: ${ns.join(', ')}`),
            ...ordering(r, sorted.map((n) => same(String(n)))),
            hints: [L('Look at the hundreds digits first.', 'ముందు వందల అంకెలు చూడు.')],
            mistakes: [{ when: 'wrong', explain: L('Compare two numbers at a time.', 'ఒకసారి రెండు సంఖ్యలు పోల్చు.') }],
            solution: [same(sorted.join(up ? ' < ' : ' > '))],
          };
        }),
        tp('most', (r) => {
          const hu = r.int(2, 8);
          const ns = r.shuffle([hu * 100 + r.int(10, 49), hu * 100 + r.int(50, 99), (hu - 1) * 100 + r.int(50, 99), r.int(20, 99)]);
          const big = r.int(0, 1) === 1, ans = big ? Math.max(...ns) : Math.min(...ns);
          return mcqN(r, big ? L(`Which is the greatest? ${ns.join(', ')}`, `ఏది అన్నిటికంటే పెద్దది? ${ns.join(', ')}`) : L(`Which is the smallest? ${ns.join(', ')}`, `ఏది అన్నిటికంటే చిన్నది? ${ns.join(', ')}`), ans, ns.filter((n) => n !== ans),
            [L('A 2-digit number is smaller than any 3-digit number.', '2 అంకెల సంఖ్య ఏ 3 అంకెల సంఖ్య కంటే చిన్నది.')],
            [L(`The ${big ? 'greatest' : 'smallest'} is ${ans}.`, `${big ? 'అన్నిటికంటే పెద్దది' : 'అన్నిటికంటే చిన్నది'} ${ans}.`)],
            [['wrong', L('Count the digits first, then compare hundreds and tens.', 'ముందు అంకెలు లెక్కించు, తర్వాత వందలు, పదులు పోల్చు.')]]);
        }),
      ],
    },
    {
      id: 'ts2.ma.cmp.make', title: L('Making the biggest and smallest number', 'అతి పెద్ద, అతి చిన్న సంఖ్య తయారు చేయడం'), prereqs: ['ts2.ma.cmp.sign'],
      intro: [
        h('Play with digit cards', 'అంకెల కార్డులతో ఆడు'),
        p('You have cards 4, 7 and 2. Put the biggest digit in the hundreds place.', 'నీ దగ్గర 4, 7, 2 కార్డులు ఉన్నాయి. పెద్ద అంకెను వందల స్థానంలో పెట్టు.'),
        vis(row('7 4 2 → biggest    2 4 7 → smallest'), 'Biggest is 742, smallest is 247', 'అతి పెద్దది 742, అతి చిన్నది 247'),
        photo('🧩', L('Move the cards like puzzle pieces until you get the biggest number.', 'పజిల్ ముక్కల్లాగా కార్డులు కదిపి అతి పెద్ద సంఖ్య చేయి.')),
        tip('Biggest: big digit first. Smallest: small digit first.', 'అతి పెద్దది: పెద్ద అంకె ముందు. అతి చిన్నది: చిన్న అంకె ముందు.'),
      ],
      examples: [
        ex(L('Make the biggest number with 5, 1, 8.', '5, 1, 8 తో అతి పెద్ద సంఖ్య చేయి.'), [L('Biggest digit 8 goes first.', 'పెద్ద అంకె 8 ముందు.'), L('Then 5, then 1.', 'తర్వాత 5, తర్వాత 1.')], same('851')),
        ex(L('Make the smallest number with 6, 3, 9.', '6, 3, 9 తో అతి చిన్న సంఖ్య చేయి.'), [L('Smallest digit 3 goes first.', 'చిన్న అంకె 3 ముందు.'), L('Then 6, then 9.', 'తర్వాత 6, తర్వాత 9.')], same('369')),
      ],
      practice: [
        tp('make', (r) => {
          const ds = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3), big = r.int(0, 1) === 1;
          const s = [...ds].sort((a, b) => (big ? b - a : a - b)), ans = +s.join(''), rev = +[...s].reverse().join('');
          return typed(big ? L(`Use the digits ${ds.join(', ')} once each. Make the biggest number.`, `${ds.join(', ')} అంకెలను ఒక్కోసారి వాడు. అతి పెద్ద సంఖ్య చేయి.`) : L(`Use the digits ${ds.join(', ')} once each. Make the smallest number.`, `${ds.join(', ')} అంకెలను ఒక్కోసారి వాడు. అతి చిన్న సంఖ్య చేయి.`), num(ans),
            [big ? L('Put the biggest digit in the hundreds place.', 'పెద్ద అంకెను వందల స్థానంలో పెట్టు.') : L('Put the smallest digit in the hundreds place.', 'చిన్న అంకెను వందల స్థానంలో పెట్టు.')],
            [L(`${s.join(', ')} → ${ans}`, `${s.join(', ')} → ${ans}`)],
            [[String(rev), big ? L('That is the smallest one! For the biggest, start with the biggest digit.', 'అది అతి చిన్నది! అతి పెద్దదానికి పెద్ద అంకెతో మొదలుపెట్టు.') : L('That is the biggest one! For the smallest, start with the smallest digit.', 'అది అతి పెద్దది! అతి చిన్నదానికి చిన్న అంకెతో మొదలుపెట్టు.')]]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 5
const ch5: USpec = {
  id: 'ts2.ma.ch5', subject: 'math', title: L('Addition of Numbers', 'సంఖ్యల కూడిక'), source: src(5),
  objectives: [
    {
      id: 'ts2.ma.add.small', title: L('Adding by putting together and counting on', 'కలిపి, ముందుకు లెక్కించి కూడటం'), prereqs: ['ts2.ma.n20.count'],
      activities: ['game:numberline'],
      intro: [
        h('Put them together', 'కలిపి పెట్టు'),
        p('Kavya has 5 bananas. Amma gives her 3 more. Now she has 8.', 'కావ్య దగ్గర 5 అరటి పండ్లు ఉన్నాయి. అమ్మ ఇంకా 3 ఇచ్చింది. ఇప్పుడు 8.'),
        photo('🍌', L('Bananas put together: 5 and 3 make 8.', 'అరటి పండ్లు కలిపితే: 5, 3 కలిపి 8.')),
        vis(row('🍌🍌🍌🍌🍌 + 🍌🍌🍌 = 8'), '5 bananas and 3 bananas make 8', '5 అరటి పండ్లు, 3 అరటి పండ్లు కలిపి 8'),
        p('Quick way: keep the big number in your head. Count on the small one: 6, 7, 8.', 'సులభ మార్గం: పెద్ద సంఖ్య మనసులో ఉంచు. చిన్నదాన్ని ముందుకు లెక్కించు: 6, 7, 8.'),
        tip('The sign + means add. The sign = means "is the same as".', '+ గుర్తు అంటే కలుపు. = గుర్తు అంటే "సమానం".'),
      ],
      examples: [
        ex(L('9 + 4 = ?', '9 + 4 = ?'), [L('Start at 9.', '9 దగ్గర మొదలు.'), L('Count on 4: 10, 11, 12, 13.', '4 ముందుకు: 10, 11, 12, 13.')], same('13'), { kind: 'number-line', from: 0, to: 20, step: 1, jumps: [[9, 13]] }),
        ex(L('3 + 8 = ?', '3 + 8 = ?'), [L('Start with the bigger number, 8.', 'పెద్ద సంఖ్య 8 తో మొదలు.'), L('Count on 3: 9, 10, 11.', '3 ముందుకు: 9, 10, 11.')], same('11')),
      ],
      practice: [
        tp('pic', (r) => {
          const t = r.pick(ITEMS), a = r.int(2, 7), b = r.int(1, 6);
          return typed(L(`${a} ${t.en} and ${b} ${t.en}. How many altogether?`, `${a} ${t.te}, ${b} ${t.te}. మొత్తం ఎన్ని?`), num(a + b),
            [L('Count all of them together.', 'అన్నిటినీ కలిపి లెక్కించు.'), L(`Start at ${a} and count on ${b}.`, `${a} నుండి ${b} ముందుకు లెక్కించు.`)],
            [L(`${a} + ${b} = ${a + b}`, `${a} + ${b} = ${a + b}`)],
            [[String(a + b - 1), L('You missed one. Count again.', 'ఒకటి వదిలేశావు. మళ్ళీ లెక్కించు.')]],
            { visual: row(`${t.e.repeat(a)} + ${t.e.repeat(b)}`) });
        }),
        tp('on', (r) => {
          const a = r.int(6, 14), b = r.int(2, 6);
          return typed(L(`${a} + ${b} = ?`, `${a} + ${b} = ?`), num(a + b),
            [L(`Start at ${a} on the number line.`, `సంఖ్యా రేఖపై ${a} దగ్గర మొదలుపెట్టు.`), L(`Jump ${b} steps forward.`, `${b} అడుగులు ముందుకు దూకు.`)],
            [L(`${range(a + 1, a + b).join(', ')} → ${a + b}`, `${range(a + 1, a + b).join(', ')} → ${a + b}`)],
            [[String(a + b - 1), L(`Do not count ${a} again. Start counting from ${a + 1}.`, `${a} ను మళ్ళీ లెక్కించకు. ${a + 1} నుండి లెక్కించు.`)]],
            { visual: { kind: 'number-line', from: 0, to: 20, step: 1 } });
        }),
      ],
    },
    {
      id: 'ts2.ma.add.col', title: L('Adding tens and ones (no carrying)', 'పదులు, ఒకట్లు కూడటం (తీసుకెళ్లడం లేకుండా)'), prereqs: ['ts2.ma.add.small', 'ts2.ma.n99.tens'],
      intro: [
        h('Ones with ones, tens with tens', 'ఒకట్లతో ఒకట్లు, పదులతో పదులు'),
        p('Write the numbers one under the other.', 'సంఖ్యలను ఒకదాని కింద ఒకటి రాయి.'),
        p('Add the ones first. Then add the tens.', 'ముందు ఒకట్లు కలుపు. తర్వాత పదులు కలుపు.'),
        vis(row('  34\n+ 25\n----\n  59'), '34 plus 25 is 59', '34 + 25 = 59'),
        photo('🪔', L('34 diyas and 25 diyas for Deepavali: 59 diyas in all.', 'దీపావళికి 34 ప్రమిదలు, 25 ప్రమిదలు: మొత్తం 59.')),
        stepsB(L('Ones: 4 + 5 = 9', 'ఒకట్లు: 4 + 5 = 9'), L('Tens: 3 + 2 = 5', 'పదులు: 3 + 2 = 5'), L('Answer: 59', 'జవాబు: 59')),
        tip('Keep the digits in straight columns.', 'అంకెలను నిలువు వరుసల్లో సరిగ్గా రాయి.'),
      ],
      examples: [
        ex(L('42 + 36 = ?', '42 + 36 = ?'), [L('Ones: 2 + 6 = 8', 'ఒకట్లు: 2 + 6 = 8'), L('Tens: 4 + 3 = 7', 'పదులు: 4 + 3 = 7')], same('78')),
        ex(L('213 + 145 = ?', '213 + 145 = ?'), [L('Ones: 3 + 5 = 8', 'ఒకట్లు: 3 + 5 = 8'), L('Tens: 1 + 4 = 5', 'పదులు: 1 + 4 = 5'), L('Hundreds: 2 + 1 = 3', 'వందలు: 2 + 1 = 3')], same('358')),
      ],
      practice: [
        tp('two', (r) => {
          const at = r.int(1, 7), ao = r.int(0, 8), bt = r.int(1, 9 - at - 0), bo = r.int(0, 9 - ao);
          const a = at * 10 + ao, b = bt * 10 + bo, s = a + b;
          return typed(L(`${a} + ${b} = ?`, `${a} + ${b} = ?`), num(s),
            [L(`Ones: ${ao} + ${bo}`, `ఒకట్లు: ${ao} + ${bo}`), L(`Tens: ${at} + ${bt}`, `పదులు: ${at} + ${bt}`)],
            [L(`Ones ${ao} + ${bo} = ${ao + bo}. Tens ${at} + ${bt} = ${at + bt}. Answer ${s}.`, `ఒకట్లు ${ao} + ${bo} = ${ao + bo}. పదులు ${at} + ${bt} = ${at + bt}. జవాబు ${s}.`)],
            [[String(at + bt + ao + bo), L('You added all the digits together. Keep tens and ones apart.', 'అన్ని అంకెలు కలిపేశావు. పదులు, ఒకట్లు విడిగా ఉంచు.')]],
            { visual: row(`  ${a}\n+ ${b}\n----`) });
        }, 1),
        tp('three', (r) => {
          const ad = [r.int(1, 6), r.int(0, 6), r.int(0, 6)], bd = [r.int(1, 8 - ad[0]), r.int(0, 9 - ad[1]), r.int(0, 9 - ad[2])];
          const a = +ad.join(''), b = +bd.join(''), s = a + b;
          return typed(L(`${a} + ${b} = ?`, `${a} + ${b} = ?`), num(s),
            [L('Add ones, then tens, then hundreds.', 'ఒకట్లు, తర్వాత పదులు, తర్వాత వందలు కలుపు.')],
            [L(`Ones ${ad[2] + bd[2]}, tens ${ad[1] + bd[1]}, hundreds ${ad[0] + bd[0]} → ${s}`, `ఒకట్లు ${ad[2] + bd[2]}, పదులు ${ad[1] + bd[1]}, వందలు ${ad[0] + bd[0]} → ${s}`)],
            [['wrong-value', L('Check each column again: ones, tens, hundreds.', 'ప్రతి నిలువు వరుస మళ్ళీ చూడు: ఒకట్లు, పదులు, వందలు.')]],
            { visual: row(`  ${a}\n+ ${b}\n-----`) });
        }, 2),
      ],
    },
    {
      id: 'ts2.ma.add.story', title: L('Addition stories', 'కూడిక కథలు'), prereqs: ['ts2.ma.add.col'],
      intro: [
        h('Stories that add', 'కలిపే కథలు'),
        p('Words like "in all", "altogether" and "more" often mean add.', '"మొత్తం", "కలిపి", "ఇంకా" వంటి మాటలు సాధారణంగా కూడిక.'),
        photo('🛒', L('At the Rythu Bazaar, Amma buys 12 tomatoes and 15 onions. How many vegetables in all?', 'రైతు బజారులో అమ్మ 12 టమాటాలు, 15 ఉల్లిపాయలు కొన్నది. మొత్తం ఎన్ని కూరగాయలు?')),
        stepsB(L('Read the story.', 'కథ చదువు.'), L('Find the two numbers.', 'రెండు సంఖ్యలు వెతుకు.'), L('Add them.', 'వాటిని కలుపు.'), L('Say the answer with its word: 27 vegetables.', 'జవాబును మాటతో చెప్పు: 27 కూరగాయలు.')),
        tip('Draw small dots if the numbers are small. It helps!', 'సంఖ్యలు చిన్నవైతే చిన్న చుక్కలు గీయి. సహాయపడుతుంది!'),
      ],
      examples: [
        ex(L('A bus has 23 people. 14 more get in. How many now?', 'బస్సులో 23 మంది ఉన్నారు. ఇంకా 14 మంది ఎక్కారు. ఇప్పుడు ఎంత మంది?'), [L('"More get in" means add.', '"ఇంకా ఎక్కారు" అంటే కూడిక.'), L('23 + 14 = 37', '23 + 14 = 37')], L('37 people', '37 మంది')),
        ex(L('Teja has 31 marbles. Sana has 26. How many altogether?', 'తేజ దగ్గర 31 గోళీలు. సనా దగ్గర 26. మొత్తం ఎన్ని?'), [L('Altogether means add.', 'మొత్తం అంటే కూడిక.'), L('31 + 26 = 57', '31 + 26 = 57')], L('57 marbles', '57 గోళీలు')),
      ],
      practice: [
        tp('story', (r) => {
          const n1 = nm(r), at = r.int(1, 6), ao = r.int(0, 5), bt = r.int(1, 8 - at), bo = r.int(0, 9 - ao), a = at * 10 + ao, b = bt * 10 + bo;
          const st = r.pick([
            [`${n1.en} picked ${a} flowers for Bathukamma. Her sister picked ${b}. How many flowers in all?`, `${te(n1)} బతుకమ్మ కోసం ${a} పువ్వులు కోసింది. అక్క ${b} కోసింది. మొత్తం ఎన్ని పువ్వులు?`, 'flowers', 'పువ్వులు'],
            [`A school has ${a} boys and ${b} girls in Class 2. How many children?`, `ఒక బడిలో 2వ తరగతిలో ${a} మంది అబ్బాయిలు, ${b} మంది అమ్మాయిలు. మొత్తం ఎంత మంది పిల్లలు?`, 'children', 'పిల్లలు'],
            [`${n1.en} has ₹${a}. Grandpa gives ₹${b} more. How much money now?`, `${te(n1)} దగ్గర ₹${a} ఉన్నాయి. తాతయ్య ఇంకా ₹${b} ఇచ్చారు. ఇప్పుడు ఎంత?`, 'rupees', 'రూపాయలు'],
            [`A farmer has ${a} hens and ${b} ducks. How many birds in all?`, `ఒక రైతు దగ్గర ${a} కోళ్లు, ${b} బాతులు ఉన్నాయి. మొత్తం ఎన్ని పక్షులు?`, 'birds', 'పక్షులు'],
            [`${a} kites flew in the morning and ${b} in the evening. How many kites flew?`, `ఉదయం ${a} గాలిపటాలు, సాయంత్రం ${b} గాలిపటాలు ఎగిరాయి. మొత్తం ఎన్ని?`, 'kites', 'గాలిపటాలు'],
          ] as const);
          return typed(L(st[0], st[1]), num(a + b),
            [L('"In all" and "more" mean add.', '"మొత్తం", "ఇంకా" అంటే కూడిక.'), L(`Add ${a} and ${b}.`, `${a}, ${b} కలుపు.`)],
            [L(`${a} + ${b} = ${a + b} ${st[2]}`, `${a} + ${b} = ${a + b} ${st[3]}`)],
            [[String(Math.abs(a - b)), L('This story puts things together. Add, do not take away.', 'ఈ కథలో వస్తువులు కలుస్తున్నాయి. కలుపు, తీసివేయకు.')]]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 6
const ch6: USpec = {
  id: 'ts2.ma.ch6', subject: 'math', title: L('Addition of Numbers (Carry Over)', 'సంఖ్యల కూడిక (తీసుకెళ్ళడం)'), source: src(6),
  objectives: [
    {
      id: 'ts2.ma.addc.ten', title: L('Ten ones make one ten', 'పది ఒకట్లు ఒక పది'), prereqs: ['ts2.ma.add.col'],
      intro: [
        h('Make a bundle!', 'కట్ట కట్టు!'),
        p('When you have 10 loose sticks, tie them. Now you have 1 ten.', '10 విడి పుల్లలు ఉంటే కట్టు. ఇప్పుడు 1 పది.'),
        photo('🪵', L('Ten sticks tied together make one bundle of ten.', 'పది పుల్లలు కలిపి కడితే ఒక పది కట్ట.')),
        vis(obj('✏️', 13, 10), '13 ones: one bundle of ten and 3 loose', '13 ఒకట్లు: ఒక పది కట్ట, 3 విడివి'),
        p('13 ones = 1 ten and 3 ones.', '13 ఒకట్లు = 1 పది, 3 ఒకట్లు.'),
        tip('To add 8 + 5, make a ten first: 8 + 2 = 10, then 3 more = 13.', '8 + 5 కలపడానికి ముందు పది చేయి: 8 + 2 = 10, ఇంకా 3 = 13.'),
      ],
      examples: [
        ex(L('2 tens and 15 ones. Which number?', '2 పదులు, 15 ఒకట్లు. ఏ సంఖ్య?'), [L('15 ones = 1 ten and 5 ones.', '15 ఒకట్లు = 1 పది, 5 ఒకట్లు.'), L('2 tens + 1 ten = 3 tens.', '2 పదులు + 1 పది = 3 పదులు.'), L('3 tens and 5 ones = 35', '3 పదులు, 5 ఒకట్లు = 35')], same('35')),
        ex(L('9 + 6 = ?', '9 + 6 = ?'), [L('9 + 1 = 10 (take 1 from 6).', '9 + 1 = 10 (6 నుండి 1 తీసుకో).'), L('10 + 5 = 15', '10 + 5 = 15')], same('15')),
      ],
      practice: [
        tp('regroup', (r) => {
          const t = r.int(1, 7), o = r.int(10, 19), n = t * 10 + o;
          return typed(L(`${t} tens and ${o} ones. Which number is it?`, `${t} పదులు, ${o} ఒకట్లు. ఇది ఏ సంఖ్య?`), num(n),
            [L(`${o} ones = 1 ten and ${o - 10} ones.`, `${o} ఒకట్లు = 1 పది, ${o - 10} ఒకట్లు.`), L(`Now there are ${t + 1} tens.`, `ఇప్పుడు ${t + 1} పదులు.`)],
            [L(`${t} tens + 1 ten = ${t + 1} tens. ${t + 1} tens and ${o - 10} ones = ${n}.`, `${t} పదులు + 1 పది = ${t + 1} పదులు. ${t + 1} పదులు, ${o - 10} ఒకట్లు = ${n}.`)],
            [[`${t}${o}`, L('You cannot keep 10 or more in the ones place. Make a ten!', 'ఒకట్ల స్థానంలో 10 లేదా ఎక్కువ ఉంచలేం. పది చేయి!')], [String(t * 10 + o - 10), L('You made a ten but did not add it to the tens.', 'పది చేశావు కానీ పదులలో కలపలేదు.')]]);
        }),
        tp('make10', (r) => {
          const a = r.int(6, 9), b = r.int(11 - a, 9), s = a + b;
          return typed(L(`${a} + ${b} = ? (Make a ten first.)`, `${a} + ${b} = ? (ముందు పది చేయి.)`), num(s),
            [L(`${a} needs ${10 - a} more to make 10.`, `${a} కి 10 అవ్వాలంటే ఇంకా ${10 - a} కావాలి.`), L(`${b} = ${10 - a} + ${b - (10 - a)}`, `${b} = ${10 - a} + ${b - (10 - a)}`)],
            [L(`${a} + ${10 - a} = 10. 10 + ${b - (10 - a)} = ${s}.`, `${a} + ${10 - a} = 10. 10 + ${b - (10 - a)} = ${s}.`)],
            [[String(s - 10), L('You forgot the ten you made.', 'చేసిన పదిని మర్చిపోయావు.')]],
            { visual: row(`${'🪙'.repeat(a)} + ${'🪙'.repeat(b)}`) });
        }),
      ],
    },
    {
      id: 'ts2.ma.addc.col', title: L('Adding with carrying', 'తీసుకెళ్ళి కూడటం'), prereqs: ['ts2.ma.addc.ten'],
      intro: [
        h('Carry the ten', 'పదిని తీసుకెళ్ళు'),
        p('Add the ones. If you get 10 or more, make a ten.', 'ఒకట్లు కలుపు. 10 లేదా ఎక్కువ వస్తే పది చేయి.'),
        p('Write the ones. Carry the ten to the tens column.', 'ఒకట్లు రాయి. పదిని పదుల వరుసకు తీసుకెళ్ళు.'),
        vis(row('   1\n  38\n+ 47\n----\n  85'), '38 plus 47 is 85 with a carry of 1', '38 + 47 = 85, 1 తీసుకెళ్ళాం'),
        photo('🥚', L('38 eggs and 47 eggs at the poultry farm make 85 eggs.', 'కోళ్ల ఫారంలో 38 గుడ్లు, 47 గుడ్లు కలిపి 85 గుడ్లు.')),
        stepsB(L('Ones: 8 + 7 = 15. Write 5, carry 1.', 'ఒకట్లు: 8 + 7 = 15. 5 రాయి, 1 తీసుకెళ్ళు.'), L('Tens: 1 + 3 + 4 = 8.', 'పదులు: 1 + 3 + 4 = 8.'), L('Answer: 85.', 'జవాబు: 85.')),
        tip('Write the small carry 1 on top of the tens column so you do not forget.', 'మర్చిపోకుండా చిన్న 1 ని పదుల వరుస పైన రాయి.'),
      ],
      examples: [
        ex(L('26 + 59 = ?', '26 + 59 = ?'), [L('Ones: 6 + 9 = 15. Write 5, carry 1.', 'ఒకట్లు: 6 + 9 = 15. 5 రాయి, 1 తీసుకెళ్ళు.'), L('Tens: 1 + 2 + 5 = 8.', 'పదులు: 1 + 2 + 5 = 8.')], same('85')),
        ex(L('145 + 38 = ?', '145 + 38 = ?'), [L('Ones: 5 + 8 = 13. Write 3, carry 1.', 'ఒకట్లు: 5 + 8 = 13. 3 రాయి, 1 తీసుకెళ్ళు.'), L('Tens: 1 + 4 + 3 = 8.', 'పదులు: 1 + 4 + 3 = 8.'), L('Hundreds: 1.', 'వందలు: 1.')], same('183')),
      ],
      practice: [
        tp('two', (r) => {
          const ao = r.int(3, 9), bo = r.int(10 - ao, 9), at = r.int(1, 6), bt = r.int(1, 8 - at);
          const a = at * 10 + ao, b = bt * 10 + bo, s = a + b;
          return typed(L(`${a} + ${b} = ?`, `${a} + ${b} = ?`), num(s),
            [L(`Ones: ${ao} + ${bo} = ${ao + bo}. That is 10 or more!`, `ఒకట్లు: ${ao} + ${bo} = ${ao + bo}. ఇది 10 లేదా ఎక్కువ!`), L('Write the ones digit and carry 1 ten.', 'ఒకట్ల అంకె రాసి 1 పదిని తీసుకెళ్ళు.')],
            [L(`Ones ${ao + bo}: write ${(ao + bo) % 10}, carry 1. Tens 1 + ${at} + ${bt} = ${at + bt + 1}. Answer ${s}.`, `ఒకట్లు ${ao + bo}: ${(ao + bo) % 10} రాయి, 1 తీసుకెళ్ళు. పదులు 1 + ${at} + ${bt} = ${at + bt + 1}. జవాబు ${s}.`)],
            [[String(noCarry(a, b)), L('You forgot to carry the 1 ten.', '1 పదిని తీసుకెళ్ళడం మర్చిపోయావు.')], [`${at + bt}${ao + bo}`, L('Do not write two digits in the ones place. Carry the ten.', 'ఒకట్ల స్థానంలో రెండు అంకెలు రాయకు. పదిని తీసుకెళ్ళు.')]],
            { visual: row(`  ${a}\n+ ${b}\n----`) });
        }, 2),
        tp('three', (r) => {
          const hu = r.int(1, 8), at = r.int(0, 7), ao = r.int(4, 9), bt = r.int(1, 8 - at), bo = r.int(10 - ao, 9);
          const a = hu * 100 + at * 10 + ao, b = bt * 10 + bo, s = a + b;
          return typed(L(`${a} + ${b} = ?`, `${a} + ${b} = ?`), num(s),
            [L('Line up the ones under the ones.', 'ఒకట్ల కింద ఒకట్లు వరుసగా రాయి.'), L('Ones first. Carry if needed.', 'ముందు ఒకట్లు. అవసరమైతే తీసుకెళ్ళు.')],
            [L(`Ones ${ao + bo}: write ${(ao + bo) % 10}, carry 1. Tens 1 + ${at} + ${bt} = ${at + bt + 1}. Hundreds ${hu}. Answer ${s}.`, `ఒకట్లు ${ao + bo}: ${(ao + bo) % 10} రాయి, 1 తీసుకెళ్ళు. పదులు 1 + ${at} + ${bt} = ${at + bt + 1}. వందలు ${hu}. జవాబు ${s}.`)],
            [[String(noCarry(a, b)), L('You forgot to carry the 1 ten.', '1 పదిని తీసుకెళ్ళడం మర్చిపోయావు.')]],
            { visual: row(`  ${a}\n+  ${b}\n-----`) });
        }, 3),
      ],
    },
    {
      id: 'ts2.ma.addc.story', title: L('Addition stories with carrying', 'తీసుకెళ్ళే కూడిక కథలు'), prereqs: ['ts2.ma.addc.col'],
      intro: [
        h('Stories with bigger numbers', 'పెద్ద సంఖ్యల కథలు'),
        p('Read slowly. Find the numbers. Add them in columns.', 'నెమ్మదిగా చదువు. సంఖ్యలు వెతుకు. నిలువు వరుసల్లో కలుపు.'),
        photo('🐄', L('A dairy farm near Karimnagar has 46 cows and 27 buffaloes. 73 animals in all!', 'కరీంనగర్ దగ్గర ఒక పాడి ఫారంలో 46 ఆవులు, 27 గేదెలు. మొత్తం 73 జంతువులు!')),
        p('You can add three numbers too. Add two first, then add the third.', 'మూడు సంఖ్యలూ కలపవచ్చు. ముందు రెండు కలిపి, తర్వాత మూడోది కలుపు.'),
        tip('Check: is the answer bigger than each number? It should be!', 'సరిచూడు: జవాబు ప్రతి సంఖ్య కంటే పెద్దదిగా ఉందా? ఉండాలి!'),
      ],
      examples: [
        ex(L('Ravi scored 28 runs. Imran scored 35. How many runs together?', 'రవి 28 పరుగులు చేశాడు. ఇమ్రాన్ 35. కలిపి ఎన్ని?'), [L('28 + 35', '28 + 35'), L('Ones 8 + 5 = 13: write 3, carry 1.', 'ఒకట్లు 8 + 5 = 13: 3 రాయి, 1 తీసుకెళ్ళు.'), L('Tens 1 + 2 + 3 = 6.', 'పదులు 1 + 2 + 3 = 6.')], L('63 runs', '63 పరుగులు')),
        ex(L('12 + 15 + 9 = ?', '12 + 15 + 9 = ?'), [L('12 + 15 = 27', '12 + 15 = 27'), L('27 + 9 = 36', '27 + 9 = 36')], same('36')),
      ],
      practice: [
        tp('story', (r) => {
          const n1 = nm(r), ao = r.int(4, 9), bo = r.int(10 - ao, 9), at = r.int(1, 5), bt = r.int(1, 8 - at), a = at * 10 + ao, b = bt * 10 + bo;
          const st = r.pick([
            [`A dairy farm has ${a} cows and ${b} buffaloes. How many animals?`, `ఒక పాడి ఫారంలో ${a} ఆవులు, ${b} గేదెలు ఉన్నాయి. మొత్తం ఎన్ని జంతువులు?`, 'animals', 'జంతువులు'],
            [`${n1.en} scored ${a} runs and then ${b} runs. How many runs in all?`, `${te(n1)} ${a} పరుగులు, తర్వాత ${b} పరుగులు చేశారు. మొత్తం ఎన్ని పరుగులు?`, 'runs', 'పరుగులు'],
            [`A shop sold ${a} samosas in the morning and ${b} in the evening. How many samosas?`, `ఒక దుకాణం ఉదయం ${a} సమోసాలు, సాయంత్రం ${b} అమ్మింది. మొత్తం ఎన్ని సమోసాలు?`, 'samosas', 'సమోసాలు'],
            [`${a} people visited the zoo on Saturday and ${b} on Sunday. How many visitors?`, `శనివారం ${a} మంది, ఆదివారం ${b} మంది జూకు వచ్చారు. మొత్తం ఎంత మంది?`, 'visitors', 'మంది'],
            [`${n1.en} saved ₹${a} in January and ₹${b} in February. How much in all?`, `${te(n1)} జనవరిలో ₹${a}, ఫిబ్రవరిలో ₹${b} దాచారు. మొత్తం ఎంత?`, 'rupees', 'రూపాయలు'],
          ] as const);
          return typed(L(st[0], st[1]), num(a + b),
            [L(`Add ${a} and ${b}.`, `${a}, ${b} కలుపు.`), L(`Ones: ${ao} + ${bo} = ${ao + bo}. Carry 1.`, `ఒకట్లు: ${ao} + ${bo} = ${ao + bo}. 1 తీసుకెళ్ళు.`)],
            [L(`${a} + ${b} = ${a + b} ${st[2]}`, `${a} + ${b} = ${a + b} ${st[3]}`)],
            [[String(noCarry(a, b)), L('Remember to carry the ten.', 'పదిని తీసుకెళ్ళడం గుర్తుంచుకో.')]]);
        }, 2),
        tp('three', (r) => {
          const a = r.int(11, 25), b = r.int(11, 25), c = r.int(3, 9), s = a + b + c;
          return typed(L(`${a} + ${b} + ${c} = ?`, `${a} + ${b} + ${c} = ?`), num(s),
            [L(`First: ${a} + ${b} = ?`, `ముందు: ${a} + ${b} = ?`), L(`Then add ${c}.`, `తర్వాత ${c} కలుపు.`)],
            [L(`${a} + ${b} = ${a + b}. ${a + b} + ${c} = ${s}.`, `${a} + ${b} = ${a + b}. ${a + b} + ${c} = ${s}.`)],
            [[String(a + b), L(`Do not forget the third number, ${c}.`, `మూడో సంఖ్య ${c} మర్చిపోకు.`)]]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 7
const ch7: USpec = {
  id: 'ts2.ma.ch7', subject: 'math', title: L('Subtraction', 'తీసివేత'), source: src(7),
  objectives: [
    {
      id: 'ts2.ma.sub.take', title: L('Taking away', 'తీసివేయడం'), prereqs: ['ts2.ma.n20.count'],
      activities: ['game:numberline'],
      intro: [
        h('How many are left?', 'ఎన్ని మిగిలాయి?'),
        p('Diya has 8 laddoos. She eats 3. Now 5 are left.', 'దియా దగ్గర 8 లడ్డూలు ఉన్నాయి. 3 తిన్నది. ఇప్పుడు 5 మిగిలాయి.'),
        photo('🍎', L('7 apples on a plate. Take away 2. How many stay on the plate?', 'పళ్ళెంలో 7 ఆపిల్ పండ్లు. 2 తీసేయి. పళ్ళెంలో ఎన్ని మిగిలాయి?')),
        vis(row('🍎🍎🍎🍎🍎 ❌❌'), '7 apples, 2 taken away, 5 left', '7 ఆపిల్ పండ్లు, 2 తీసేశాం, 5 మిగిలాయి'),
        p('The sign − means take away. 7 − 2 = 5.', '− గుర్తు అంటే తీసివేయి. 7 − 2 = 5.'),
        tip('Count back on the number line: start at 7, jump back 2.', 'సంఖ్యా రేఖపై వెనక్కి లెక్కించు: 7 దగ్గర మొదలు, 2 వెనక్కి దూకు.'),
      ],
      examples: [
        ex(L('10 birds sit on a tree. 4 fly away. How many are left?', 'చెట్టుపై 10 పక్షులు. 4 ఎగిరిపోయాయి. ఎన్ని మిగిలాయి?'), [L('Take away 4 from 10.', '10 నుండి 4 తీసివేయి.'), L('10 − 4 = 6', '10 − 4 = 6')], L('6 birds', '6 పక్షులు'), row('🐦🐦🐦🐦🐦🐦 ❌❌❌❌')),
        ex(L('15 − 3 = ?', '15 − 3 = ?'), [L('Start at 15.', '15 దగ్గర మొదలు.'), L('Count back 3: 14, 13, 12.', '3 వెనక్కి: 14, 13, 12.')], same('12'), { kind: 'number-line', from: 0, to: 20, step: 1, jumps: [[15, 12]] }),
      ],
      practice: [
        tp('pic', (r) => {
          const t = r.pick(ITEMS), a = r.int(5, 12), b = r.int(1, a - 1);
          return typed(L(`There are ${a} ${t.en}. ${b} are taken away. How many are left?`, `${a} ${t.te} ఉన్నాయి. ${b} తీసేశారు. ఎన్ని మిగిలాయి?`), num(a - b),
            [L('Cover the ones taken away. Count the rest.', 'తీసేసినవి మూసి, మిగిలినవి లెక్కించు.')],
            [L(`${a} − ${b} = ${a - b}`, `${a} − ${b} = ${a - b}`)],
            [[String(a + b), L('Taken away means fewer, so subtract.', 'తీసేస్తే తక్కువ అవుతాయి, కాబట్టి తీసివేయి.')]],
            { visual: row(`${t.e.repeat(a - b)} ${'❌'.repeat(b)}`) });
        }),
        tp('back', (r) => {
          const a = r.int(8, 20), b = r.int(2, 6);
          return typed(L(`${a} − ${b} = ?`, `${a} − ${b} = ?`), num(a - b),
            [L(`Start at ${a}. Jump back ${b}.`, `${a} దగ్గర మొదలు. ${b} వెనక్కి దూకు.`)],
            [L(`${range(a - b, a - 1).reverse().join(', ')} → ${a - b}`, `${range(a - b, a - 1).reverse().join(', ')} → ${a - b}`)],
            [[String(a - b + 1), L(`Do not count ${a} itself. Your first jump lands on ${a - 1}.`, `${a} ను లెక్కించకు. మొదటి దూకు ${a - 1} మీద పడుతుంది.`)], [String(a + b), L('Minus means go back, not forward.', 'మైనస్ అంటే వెనక్కి, ముందుకు కాదు.')]],
            { visual: { kind: 'number-line', from: 0, to: 20, step: 1 } });
        }),
      ],
    },
    {
      id: 'ts2.ma.sub.diff', title: L('How many more? How many fewer?', 'ఎన్ని ఎక్కువ? ఎన్ని తక్కువ?'), prereqs: ['ts2.ma.sub.take'],
      intro: [
        h('Compare by matching', 'జత చేసి పోల్చు'),
        p('Put the two rows side by side. Match one to one.', 'రెండు వరుసలను పక్కపక్కన పెట్టు. ఒకదానికి ఒకటి జత చేయి.'),
        p('The extra ones show how many more.', 'మిగిలినవి ఎన్ని ఎక్కువో చూపిస్తాయి.'),
        photo('🐐', L('Lakshmi has 9 goats. Anil has 6. Lakshmi has 3 more goats.', 'లక్ష్మి దగ్గర 9 మేకలు. అనిల్ దగ్గర 6. లక్ష్మి దగ్గర 3 మేకలు ఎక్కువ.')),
        vis(row('🐐🐐🐐🐐🐐🐐🐐🐐🐐\n🐐🐐🐐🐐🐐🐐'), '9 goats and 6 goats: 3 extra', '9 మేకలు, 6 మేకలు: 3 ఎక్కువ'),
        tip('How many more = big number − small number.', 'ఎన్ని ఎక్కువ = పెద్ద సంఖ్య − చిన్న సంఖ్య.'),
      ],
      examples: [
        ex(L('Sita has 12 bangles. Priya has 8. How many more does Sita have?', 'సీత దగ్గర 12 గాజులు. ప్రియ దగ్గర 8. సీతకు ఎన్ని ఎక్కువ?'), [L('12 − 8 = 4', '12 − 8 = 4')], L('4 more', '4 ఎక్కువ')),
        ex(L('A red bus has 15 seats. A blue van has 9. How many fewer seats in the van?', 'ఎర్ర బస్సులో 15 సీట్లు. నీలి వ్యానులో 9. వ్యానులో ఎన్ని తక్కువ?'), [L('15 − 9 = 6', '15 − 9 = 6')], L('6 fewer', '6 తక్కువ')),
      ],
      practice: [
        tp('more', (r) => {
          const t = r.pick(ITEMS), a = r.int(6, 12), b = r.int(2, a - 1), n1 = nm(r), n2 = r.pick(NAMES.filter((x) => x.en !== n1.en));
          return typed(L(`${n1.en} has ${a} ${t.en}. ${n2.en} has ${b}. How many more does ${n1.en} have?`, `${te(n1)} దగ్గర ${a} ${t.te}. ${te(n2)} దగ్గర ${b}. ${te(n1)} దగ్గర ఎన్ని ఎక్కువ?`), num(a - b),
            [L('Match them one to one. Count the extra ones.', 'ఒకదానికి ఒకటి జత చేసి మిగిలినవి లెక్కించు.'), L(`${a} − ${b}`, `${a} − ${b}`)],
            [L(`${a} − ${b} = ${a - b} more`, `${a} − ${b} = ${a - b} ఎక్కువ`)],
            [[String(a + b), L('"How many more" asks for the difference. Subtract.', '"ఎన్ని ఎక్కువ" అంటే తేడా. తీసివేయి.')], [String(a), L(`That is how many ${n1.en} has. Find the extra ones.`, `అది ${te(n1)} దగ్గర ఉన్నవి. ఎక్కువ ఉన్నవి వెతుకు.`)]],
            { visual: row(`${t.e.repeat(a)}\n${t.e.repeat(b)}`) });
        }),
        tp('fewer', (r) => {
          const a = r.int(11, 20), b = r.int(3, a - 2);
          return mcqN(r, L(`One class has ${a} children. Another has ${b}. How many fewer are in the second class?`, `ఒక తరగతిలో ${a} మంది పిల్లలు. మరో తరగతిలో ${b}. రెండో తరగతిలో ఎంత మంది తక్కువ?`), a - b, [a + b, a - b + 1, a - b - 1],
            [L('Fewer means find the difference.', 'తక్కువ అంటే తేడా కనుక్కో.')],
            [L(`${a} − ${b} = ${a - b}`, `${a} − ${b} = ${a - b}`)],
            [['wrong', L('Subtract the smaller number from the bigger number.', 'పెద్ద సంఖ్య నుండి చిన్న సంఖ్య తీసివేయి.')]]);
        }),
      ],
    },
    {
      id: 'ts2.ma.sub.link', title: L('Adding and subtracting are partners', 'కూడిక, తీసివేత జంట'), prereqs: ['ts2.ma.sub.take'],
      intro: [
        h('Number families', 'సంఖ్యల కుటుంబాలు'),
        p('7 + 5 = 12. So 12 − 5 = 7 and 12 − 7 = 5.', '7 + 5 = 12. కాబట్టి 12 − 5 = 7, 12 − 7 = 5.'),
        vis(row('7 + 5 = 12\n5 + 7 = 12\n12 − 5 = 7\n12 − 7 = 5'), 'One family of facts: 7, 5 and 12', 'ఒక సంఖ్యల కుటుంబం: 7, 5, 12'),
        photo('🏠', L('Three numbers live in one house: 7, 5 and 12.', 'ఒకే ఇంట్లో మూడు సంఖ్యలు: 7, 5, 12.')),
        tip('To check a subtraction, add back. 12 − 5 = 7 because 7 + 5 = 12.', 'తీసివేత సరిచూడటానికి తిరిగి కలుపు. 12 − 5 = 7, ఎందుకంటే 7 + 5 = 12.'),
      ],
      examples: [
        ex(L('8 + 6 = 14. So 14 − 6 = ?', '8 + 6 = 14. కాబట్టి 14 − 6 = ?'), [L('Same family: 8, 6, 14.', 'ఒకే కుటుంబం: 8, 6, 14.'), L('Take 6 from 14, 8 is left.', '14 నుండి 6 తీస్తే 8.')], same('8')),
        ex(L('9 + ? = 15', '9 + ? = 15'), [L('Think: 15 − 9 = ?', 'ఆలోచించు: 15 − 9 = ?'), L('Count on from 9 to 15: 6 steps.', '9 నుండి 15 వరకు ముందుకు: 6 అడుగులు.')], same('6')),
      ],
      practice: [
        tp('family', (r) => {
          const a = r.int(4, 9), b = r.int(3, 9), s = a + b;
          return typed(L(`${a} + ${b} = ${s}. So ${s} − ${b} = ?`, `${a} + ${b} = ${s}. కాబట్టి ${s} − ${b} = ?`), num(a),
            [L('Use the addition fact you already have.', 'నీకు ఇచ్చిన కూడిక వాస్తవం వాడు.')],
            [L(`${s} − ${b} = ${a}, because ${a} + ${b} = ${s}.`, `${s} − ${b} = ${a}, ఎందుకంటే ${a} + ${b} = ${s}.`)],
            a !== b ? [[String(b), L(`Take away ${b}. What is left is the other number.`, `${b} తీసేయి. మిగిలేది రెండో సంఖ్య.`)]] : []);
        }),
        tp('missing', (r) => {
          const a = r.int(5, 12), b = r.int(2, 8), s = a + b;
          return typed(L(`${a} + ? = ${s}`, `${a} + ? = ${s}`), num(b),
            [L(`Count on from ${a} to ${s}.`, `${a} నుండి ${s} వరకు ముందుకు లెక్కించు.`), L(`Or find ${s} − ${a}.`, `లేదా ${s} − ${a} కనుక్కో.`)],
            [L(`${s} − ${a} = ${b}. Check: ${a} + ${b} = ${s}.`, `${s} − ${a} = ${b}. సరిచూడు: ${a} + ${b} = ${s}.`)],
            [[String(s + a), L('The box is a missing part, so it is smaller than the total.', 'ఖాళీ ఒక భాగం, కాబట్టి మొత్తం కంటే చిన్నది.')]]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 8
const ch8: USpec = {
  id: 'ts2.ma.ch8', subject: 'math', title: L('Subtraction of Numbers', 'సంఖ్యల తీసివేత'), source: src(8),
  objectives: [
    {
      id: 'ts2.ma.subn.nob', title: L('Subtracting tens and ones', 'పదులు, ఒకట్లు తీసివేయడం'), prereqs: ['ts2.ma.sub.take', 'ts2.ma.n99.tens'],
      intro: [
        h('Ones from ones, tens from tens', 'ఒకట్ల నుండి ఒకట్లు, పదుల నుండి పదులు'),
        p('Write the big number on top. Subtract the ones first, then the tens.', 'పెద్ద సంఖ్య పైన రాయి. ముందు ఒకట్లు, తర్వాత పదులు తీసివేయి.'),
        vis(row('  58\n− 23\n----\n  35'), '58 minus 23 is 35', '58 − 23 = 35'),
        photo('🥥', L('58 coconuts at a stall. 23 are sold. 35 are left.', 'అంగడిలో 58 కొబ్బరికాయలు. 23 అమ్ముడయ్యాయి. 35 మిగిలాయి.')),
        stepsB(L('Ones: 8 − 3 = 5', 'ఒకట్లు: 8 − 3 = 5'), L('Tens: 5 − 2 = 3', 'పదులు: 5 − 2 = 3'), L('Answer: 35', 'జవాబు: 35')),
        tip('Check by adding: 35 + 23 = 58. Correct!', 'కలిపి సరిచూడు: 35 + 23 = 58. సరైనది!'),
      ],
      examples: [
        ex(L('76 − 41 = ?', '76 − 41 = ?'), [L('Ones: 6 − 1 = 5', 'ఒకట్లు: 6 − 1 = 5'), L('Tens: 7 − 4 = 3', 'పదులు: 7 − 4 = 3')], same('35')),
        ex(L('468 − 235 = ?', '468 − 235 = ?'), [L('Ones: 8 − 5 = 3', 'ఒకట్లు: 8 − 5 = 3'), L('Tens: 6 − 3 = 3', 'పదులు: 6 − 3 = 3'), L('Hundreds: 4 − 2 = 2', 'వందలు: 4 − 2 = 2')], same('233')),
      ],
      practice: [
        tp('two', (r) => {
          const at = r.int(2, 9), ao = r.int(1, 9), bt = r.int(1, at), bo = r.int(0, ao), a = at * 10 + ao, b = bt * 10 + bo;
          return typed(L(`${a} − ${b} = ?`, `${a} − ${b} = ?`), num(a - b),
            [L(`Ones: ${ao} − ${bo}`, `ఒకట్లు: ${ao} − ${bo}`), L(`Tens: ${at} − ${bt}`, `పదులు: ${at} − ${bt}`)],
            [L(`Ones ${ao - bo}, tens ${at - bt} → ${a - b}`, `ఒకట్లు ${ao - bo}, పదులు ${at - bt} → ${a - b}`)],
            [[String(a + b), L('This is a minus sign. Take away.', 'ఇది మైనస్ గుర్తు. తీసివేయి.')]],
            { visual: row(`  ${a}\n− ${b}\n----`) });
        }),
        tp('three', (r) => {
          const ad = [r.int(2, 9), r.int(1, 9), r.int(1, 9)], bd = [r.int(1, ad[0]), r.int(0, ad[1]), r.int(0, ad[2])];
          const a = +ad.join(''), b = +bd.join('');
          return typed(L(`${a} − ${b} = ?`, `${a} − ${b} = ?`), num(a - b),
            [L('Ones, then tens, then hundreds.', 'ఒకట్లు, తర్వాత పదులు, తర్వాత వందలు.')],
            [L(`${ad[2]} − ${bd[2]} = ${ad[2] - bd[2]}; ${ad[1]} − ${bd[1]} = ${ad[1] - bd[1]}; ${ad[0]} − ${bd[0]} = ${ad[0] - bd[0]} → ${a - b}`, `${ad[2]} − ${bd[2]} = ${ad[2] - bd[2]}; ${ad[1]} − ${bd[1]} = ${ad[1] - bd[1]}; ${ad[0]} − ${bd[0]} = ${ad[0] - bd[0]} → ${a - b}`)],
            [['wrong-value', L('Check each column: top digit minus bottom digit.', 'ప్రతి నిలువు వరుస చూడు: పై అంకె − కింది అంకె.')]],
            { visual: row(`  ${a}\n− ${b}\n-----`) });
        }, 2),
      ],
    },
    {
      id: 'ts2.ma.subn.borrow', title: L('Subtracting with borrowing', 'అప్పు తీసుకుని తీసివేయడం'), prereqs: ['ts2.ma.subn.nob', 'ts2.ma.addc.ten'],
      intro: [
        h('Open a bundle', 'ఒక కట్ట విప్పు'),
        p('52 − 17: you cannot take 7 from 2.', '52 − 17: 2 నుండి 7 తీయలేం.'),
        p('Open one ten. Now 2 ones become 12 ones. 4 tens are left.', 'ఒక పదిని విప్పు. ఇప్పుడు 2 ఒకట్లు 12 ఒకట్లు అవుతాయి. 4 పదులు మిగులుతాయి.'),
        vis(row('  4 12\n  5  2\n− 1  7\n------\n  3  5'), '52 minus 17 is 35 after borrowing a ten', 'ఒక పది అప్పు తీసుకుంటే 52 − 17 = 35'),
        photo('✏️', L('Untie one bundle of 10 pencils to get more loose pencils.', 'ఎక్కువ విడి పెన్సిళ్ల కోసం 10 పెన్సిళ్ల కట్ట ఒకటి విప్పు.')),
        stepsB(L('Ones: 12 − 7 = 5', 'ఒకట్లు: 12 − 7 = 5'), L('Tens: 4 − 1 = 3', 'పదులు: 4 − 1 = 3'), L('Answer: 35', 'జవాబు: 35')),
        tip('Never take the small digit from the big one just because it is easier. Borrow!', 'సులభమని కింది అంకె నుండి పై అంకె తీయకు. అప్పు తీసుకో!'),
      ],
      examples: [
        ex(L('43 − 18 = ?', '43 − 18 = ?'), [L('3 < 8, so borrow 1 ten. 13 − 8 = 5.', '3 < 8, కాబట్టి 1 పది అప్పు. 13 − 8 = 5.'), L('Tens: 3 − 1 = 2.', 'పదులు: 3 − 1 = 2.')], same('25')),
        ex(L('70 − 26 = ?', '70 − 26 = ?'), [L('0 < 6, borrow 1 ten. 10 − 6 = 4.', '0 < 6, 1 పది అప్పు. 10 − 6 = 4.'), L('Tens: 6 − 2 = 4.', 'పదులు: 6 − 2 = 4.')], same('44')),
      ],
      practice: [
        tp('two', (r) => {
          const at = r.int(3, 9), ao = r.int(0, 7), bo = r.int(ao + 1, 9), bt = r.int(1, at - 1), a = at * 10 + ao, b = bt * 10 + bo;
          return typed(L(`${a} − ${b} = ?`, `${a} − ${b} = ?`), num(a - b),
            [L(`${ao} is smaller than ${bo}. Borrow 1 ten.`, `${ao}, ${bo} కంటే చిన్నది. 1 పది అప్పు తీసుకో.`), L(`Ones: ${ao + 10} − ${bo}. Tens: ${at - 1} − ${bt}.`, `ఒకట్లు: ${ao + 10} − ${bo}. పదులు: ${at - 1} − ${bt}.`)],
            [L(`${ao + 10} − ${bo} = ${ao + 10 - bo}. ${at - 1} − ${bt} = ${at - 1 - bt}. Answer ${a - b}.`, `${ao + 10} − ${bo} = ${ao + 10 - bo}. ${at - 1} − ${bt} = ${at - 1 - bt}. జవాబు ${a - b}.`)],
            [[String(smallFromLarge(a, b)), L('You took the top digit from the bottom digit. Borrow a ten instead.', 'కింది అంకె నుండి పై అంకె తీశావు. బదులుగా పది అప్పు తీసుకో.')], [String(a - b + 10), L('You borrowed a ten but forgot to make the tens one less.', 'పది అప్పు తీసుకున్నావు కానీ పదులు ఒకటి తగ్గించలేదు.')]],
            { visual: row(`  ${a}\n− ${b}\n----`) });
        }, 2),
      ],
    },
    {
      id: 'ts2.ma.subn.story', title: L('Subtraction stories', 'తీసివేత కథలు'), prereqs: ['ts2.ma.subn.borrow'],
      intro: [
        h('Stories that take away', 'తీసివేసే కథలు'),
        p('Words like "left", "gave away", "spent", "how many more" mean subtract.', '"మిగిలాయి", "ఇచ్చేశారు", "ఖర్చు చేశారు", "ఎన్ని ఎక్కువ" అంటే తీసివేత.'),
        photo('🚌', L('A bus to Warangal has 45 people. 18 get off at Jangaon. How many are still on the bus?', 'వరంగల్ బస్సులో 45 మంది. జనగామలో 18 మంది దిగారు. బస్సులో ఇంకా ఎంత మంది?')),
        stepsB(L('Find the big number (the start).', 'పెద్ద సంఖ్య (మొదలు) వెతుకు.'), L('Find what was taken away.', 'ఎంత తీసేశారో వెతుకు.'), L('Subtract: 45 − 18 = 27.', 'తీసివేయి: 45 − 18 = 27.')),
        tip('Check: the answer + the part taken = the start.', 'సరిచూడు: జవాబు + తీసేసినది = మొదలు.'),
      ],
      examples: [
        ex(L('Amma had ₹50. She spent ₹23 on vegetables. How much is left?', 'అమ్మ దగ్గర ₹50. కూరగాయలకు ₹23 ఖర్చు చేసింది. ఎంత మిగిలింది?'), [L('Spent means take away.', 'ఖర్చు అంటే తీసివేత.'), L('50 − 23 = 27', '50 − 23 = 27')], same('₹27')),
        ex(L('A tree had 64 mangoes. 25 fell down. How many are on the tree?', 'చెట్టుకు 64 మామిడి పండ్లు. 25 రాలిపోయాయి. చెట్టుపై ఎన్ని ఉన్నాయి?'), [L('64 − 25: borrow a ten. 14 − 5 = 9, 5 − 2 = 3.', '64 − 25: పది అప్పు. 14 − 5 = 9, 5 − 2 = 3.')], L('39 mangoes', '39 మామిడి పండ్లు')),
      ],
      practice: [
        tp('story', (r) => {
          const n1 = nm(r), a = r.int(30, 95), b = r.int(11, a - 8);
          const st = r.pick([
            [`A bus has ${a} people. ${b} get off. How many are still on the bus?`, `బస్సులో ${a} మంది ఉన్నారు. ${b} మంది దిగారు. బస్సులో ఇంకా ఎంత మంది?`, 'people', 'మంది'],
            [`${n1.en} had ₹${a}. ${n1.en} spent ₹${b} on a book. How much is left?`, `${te(n1)} దగ్గర ₹${a} ఉన్నాయి. పుస్తకానికి ₹${b} ఖర్చు చేశారు. ఎంత మిగిలింది?`, 'rupees', 'రూపాయలు'],
            [`A tree had ${a} mangoes. ${b} were picked. How many are on the tree now?`, `చెట్టుకు ${a} మామిడి పండ్లు. ${b} కోశారు. ఇప్పుడు చెట్టుపై ఎన్ని?`, 'mangoes', 'మామిడి పండ్లు'],
            [`A school library has ${a} books. ${b} are given to children. How many are on the shelf?`, `బడి గ్రంథాలయంలో ${a} పుస్తకాలు. ${b} పిల్లలకు ఇచ్చారు. అరలో ఎన్ని ఉన్నాయి?`, 'books', 'పుస్తకాలు'],
            [`Ravi's school has ${a} students. Meena's has ${b}. How many more students in Ravi's school?`, `రవి బడిలో ${a} మంది విద్యార్థులు. మీనా బడిలో ${b}. రవి బడిలో ఎంత మంది ఎక్కువ?`, 'more students', 'మంది ఎక్కువ'],
          ] as const);
          return typed(L(st[0], st[1]), num(a - b),
            [L('Is something taken away or compared? Then subtract.', 'ఏదైనా తీసేశారా లేదా పోల్చారా? అయితే తీసివేయి.'), L(`${a} − ${b}`, `${a} − ${b}`)],
            [L(`${a} − ${b} = ${a - b} ${st[2]}`, `${a} − ${b} = ${a - b} ${st[3]}`)],
            [[String(a + b), L('Things went away, so the number gets smaller. Subtract.', 'కొన్ని వెళ్ళిపోయాయి, సంఖ్య తగ్గుతుంది. తీసివేయి.')], ...(smallFromLarge(a, b) !== a - b ? [[String(smallFromLarge(a, b)), L('Borrow a ten when the top ones digit is smaller.', 'పై ఒకట్ల అంకె చిన్నదైతే పది అప్పు తీసుకో.')] as [string, Lc]] : [])]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 9
const ch9: USpec = {
  id: 'ts2.ma.ch9', subject: 'math', title: L('Digital Literacy', 'డిజిటల్ అక్షరాస్యత'), source: src(9),
  note: 'New chapter (digital devices and AI); content written from the chapter title — teacher to align with the SCERT text.',
  objectives: [
    {
      id: 'ts2.ma.dig.devices', title: L('Digital devices around us', 'మన చుట్టూ డిజిటల్ పరికరాలు'),
      intro: [
        h('Machines with screens and buttons', 'తెరలు, బటన్లు ఉన్న యంత్రాలు'),
        p('A mobile phone, a computer, a tablet and a calculator are digital devices.', 'మొబైల్ ఫోన్, కంప్యూటర్, ట్యాబ్లెట్, కాలిక్యులేటర్ డిజిటల్ పరికరాలు.'),
        p('They work with electricity or a battery. They show numbers, words and pictures.', 'అవి కరెంటు లేదా బ్యాటరీతో పని చేస్తాయి. సంఖ్యలు, మాటలు, బొమ్మలు చూపిస్తాయి.'),
        photo('⌚', L('A digital watch shows the time in numbers, like 7:30.', 'డిజిటల్ వాచ్ సమయాన్ని సంఖ్యల్లో చూపిస్తుంది, 7:30 లాగా.')),
        keys(L('Calculator: does sums fast.', 'కాలిక్యులేటర్: లెక్కలు వేగంగా చేస్తుంది.'), L('Mobile phone: calls, messages, photos.', 'మొబైల్ ఫోన్: కాల్స్, సందేశాలు, ఫోటోలు.'), L('Computer: typing, drawing, learning.', 'కంప్యూటర్: టైపింగ్, బొమ్మలు, నేర్చుకోవడం.')),
        tip('A pencil and a book are not digital. They have no screen or battery.', 'పెన్సిల్, పుస్తకం డిజిటల్ కావు. వాటికి తెర, బ్యాటరీ ఉండవు.'),
      ],
      examples: [
        ex(L('Is a calculator a digital device?', 'కాలిక్యులేటర్ డిజిటల్ పరికరమా?'), [L('It has a screen and buttons.', 'దానికి తెర, బటన్లు ఉన్నాయి.'), L('It runs on a battery.', 'అది బ్యాటరీతో పని చేస్తుంది.')], L('Yes', 'అవును')),
        ex(L('Which device helps you talk to Nanamma in another town?', 'వేరే ఊళ్ళో ఉన్న నానమ్మతో మాట్లాడటానికి ఏ పరికరం?'), [L('We need to call her.', 'ఆమెకు కాల్ చేయాలి.')], L('A mobile phone', 'మొబైల్ ఫోన్')),
      ],
      practice: [
        tapT('dig', L('Tap ALL the digital devices.', 'డిజిటల్ పరికరాలు అన్నీ నొక్కు.'),
          [L('mobile phone', 'మొబైల్ ఫోన్'), L('computer', 'కంప్యూటర్'), L('tablet', 'ట్యాబ్లెట్'), L('calculator', 'కాలిక్యులేటర్'), L('digital watch', 'డిజిటల్ వాచ్'), L('smart TV', 'స్మార్ట్ టీవీ')],
          [L('pencil', 'పెన్సిల్'), L('broom', 'చీపురు'), L('notebook', 'నోటు పుస్తకం'), L('bicycle', 'సైకిల్'), L('steel plate', 'స్టీలు పళ్ళెం'), L('kite', 'గాలిపటం')],
          L('Does it have a screen and need a battery or electricity?', 'దానికి తెర ఉందా? బ్యాటరీ లేదా కరెంటు కావాలా?'),
          L('Digital devices have screens and run on electricity or a battery.', 'డిజిటల్ పరికరాలకు తెర ఉంటుంది, కరెంటు లేదా బ్యాటరీతో పని చేస్తాయి.')),
        bank('use', [
          [L('Which device helps you add big numbers very fast?', 'పెద్ద సంఖ్యలు వేగంగా కలపడానికి ఏ పరికరం?'), L('Calculator', 'కాలిక్యులేటర్'), [L('Television', 'టెలివిజన్'), L('Torch', 'టార్చ్')], L('Which one has number buttons for sums?', 'లెక్కల కోసం సంఖ్యల బటన్లు దేనికి ఉన్నాయి?'), L('A calculator does sums fast.', 'కాలిక్యులేటర్ లెక్కలు వేగంగా చేస్తుంది.'), L('That device is not made for sums.', 'ఆ పరికరం లెక్కల కోసం కాదు.')],
          [L('Which device lets you call your grandmother?', 'నానమ్మకు కాల్ చేయడానికి ఏ పరికరం?'), L('Mobile phone', 'మొబైల్ ఫోన్'), [L('Calculator', 'కాలిక్యులేటర్'), L('Digital watch', 'డిజిటల్ వాచ్')], L('Which one can make calls?', 'ఏది కాల్ చేయగలదు?'), L('A mobile phone makes calls.', 'మొబైల్ ఫోన్ కాల్స్ చేస్తుంది.'), L('That device cannot make calls.', 'ఆ పరికరం కాల్స్ చేయలేదు.')],
          [L('Which device shows the time in numbers on your wrist?', 'మణికట్టుపై సమయాన్ని సంఖ్యల్లో చూపించేది ఏది?'), L('Digital watch', 'డిజిటల్ వాచ్'), [L('Calculator', 'కాలిక్యులేటర్'), L('Computer', 'కంప్యూటర్')], L('You wear it on your hand.', 'దాన్ని చేతికి పెట్టుకుంటాం.'), L('A digital watch shows time with numbers.', 'డిజిటల్ వాచ్ సమయాన్ని సంఖ్యల్లో చూపిస్తుంది.'), L('You do not wear that on your wrist.', 'దాన్ని మణికట్టుకు పెట్టుకోము.')],
          [L('Which device has a keyboard and a mouse for typing?', 'టైప్ చేయడానికి కీబోర్డ్, మౌస్ దేనికి ఉంటాయి?'), L('Computer', 'కంప్యూటర్'), [L('Digital watch', 'డిజిటల్ వాచ్'), L('Radio', 'రేడియో')], L('Think of the computer lab at school.', 'బడిలో కంప్యూటర్ ల్యాబ్ గుర్తు చేసుకో.'), L('A computer has a keyboard and a mouse.', 'కంప్యూటర్‌కు కీబోర్డ్, మౌస్ ఉంటాయి.'), L('That device has no keyboard.', 'ఆ పరికరానికి కీబోర్డ్ లేదు.')],
          [L('Which device can take a photo of your Bathukamma?', 'నీ బతుకమ్మ ఫోటో తీయడానికి ఏ పరికరం?'), L('Mobile phone', 'మొబైల్ ఫోన్'), [L('Calculator', 'కాలిక్యులేటర్'), L('Radio', 'రేడియో')], L('Which one has a camera?', 'దేనికి కెమెరా ఉంది?'), L('A mobile phone has a camera.', 'మొబైల్ ఫోన్‌కు కెమెరా ఉంటుంది.'), L('That device has no camera.', 'ఆ పరికరానికి కెమెరా లేదు.')],
        ]),
      ],
    },
    {
      id: 'ts2.ma.dig.safe', title: L('Using devices safely and wisely (and AI helpers)', 'పరికరాలను సురక్షితంగా, తెలివిగా వాడటం (AI సహాయకులు)'), prereqs: ['ts2.ma.dig.devices'],
      intro: [
        h('Be a smart user', 'తెలివైన వినియోగదారుడిగా ఉండు'),
        p('Use a phone or tablet only with a grown-up nearby.', 'పెద్దవాళ్ళు దగ్గర ఉన్నప్పుడే ఫోన్ లేదా ట్యాబ్లెట్ వాడు.'),
        p('Never tell strangers your name, address or school.', 'తెలియని వాళ్ళకు నీ పేరు, చిరునామా, బడి చెప్పకు.'),
        p('Some apps have AI helpers that talk or answer questions. They are useful, but they can make mistakes. Always check!', 'కొన్ని యాప్‌లలో మాట్లాడే, ప్రశ్నలకు జవాబిచ్చే AI సహాయకులు ఉంటాయి. అవి ఉపయోగపడతాయి, కానీ తప్పులు చేయగలవు. ఎప్పుడూ సరిచూడు!'),
        photo('⏰', L('Watch the clock. Play on screens only for a short time, then go out and play.', 'గడియారం చూడు. తెరలపై కొద్దిసేపే ఆడు, తర్వాత బయటకు వెళ్ళి ఆడు.')),
        remember('Short screen time. Grown-up nearby. Keep secrets safe. Check answers.', 'తక్కువ స్క్రీన్ సమయం. పెద్దవాళ్ళు దగ్గర. రహస్యాలు భద్రం. జవాబులు సరిచూడు.'),
        tip('If something on a screen makes you scared or sad, tell a grown-up at once.', 'తెరపై ఏదైనా భయం లేదా బాధ కలిగిస్తే వెంటనే పెద్దవాళ్ళకు చెప్పు.'),
      ],
      examples: [
        ex(L('A game asks for your home address. What do you do?', 'ఒక ఆట నీ ఇంటి చిరునామా అడిగింది. ఏం చేస్తావు?'), [L('Your address is private.', 'నీ చిరునామా రహస్యం.'), L('Ask a grown-up.', 'పెద్దవాళ్ళను అడుగు.')], L('Do not type it. Tell a grown-up.', 'టైప్ చేయకు. పెద్దవాళ్ళకు చెప్పు.')),
        ex(L('An AI helper says 8 + 5 = 12. What do you do?', 'ఒక AI సహాయకుడు 8 + 5 = 12 అన్నాడు. ఏం చేస్తావు?'), [L('Check it yourself: 8 + 2 = 10, 10 + 3 = 13.', 'నువ్వే సరిచూడు: 8 + 2 = 10, 10 + 3 = 13.'), L('The helper made a mistake.', 'సహాయకుడు తప్పు చేశాడు.')], L('Check it. The right answer is 13.', 'సరిచూడు. సరైన జవాబు 13.')),
      ],
      practice: [
        bank('safe', [
          [L('A stranger online asks for your school name. Is it safe to tell?', 'ఆన్‌లైన్‌లో తెలియని వ్యక్తి నీ బడి పేరు అడిగాడు. చెప్పడం సురక్షితమా?'), L('No, tell a grown-up', 'కాదు, పెద్దవాళ్ళకు చెప్పు'), [L('Yes, tell them', 'అవును, చెప్పు')], L('Do you know this person?', 'ఈ వ్యక్తి నీకు తెలుసా?'), L('Never share private details with strangers.', 'తెలియని వాళ్ళకు రహస్య వివరాలు ఎప్పుడూ చెప్పకు.'), L('Strangers should not get your private details.', 'తెలియని వాళ్ళకు నీ వివరాలు ఇవ్వకూడదు.')],
          [L('You have played on the tablet for a long time. What should you do?', 'చాలాసేపు ట్యాబ్లెట్‌పై ఆడావు. ఏం చేయాలి?'), L('Stop and play outside', 'ఆపి బయట ఆడు'), [L('Play all night', 'రాత్రంతా ఆడు'), L('Hide the tablet', 'ట్యాబ్లెట్ దాచు')], L('Your eyes need rest.', 'నీ కళ్ళకు విశ్రాంతి కావాలి.'), L('Take a break and play outside.', 'విరామం తీసుకుని బయట ఆడు.'), L('Too much screen time is not good for your eyes.', 'ఎక్కువ స్క్రీన్ సమయం కళ్ళకు మంచిది కాదు.')],
          [L('An AI helper gives an answer that looks wrong. What should you do?', 'AI సహాయకుడు తప్పుగా అనిపించే జవాబు ఇచ్చాడు. ఏం చేయాలి?'), L('Check it and ask a teacher', 'సరిచూసి టీచరును అడుగు'), [L('Always believe it', 'ఎప్పుడూ నమ్ము'), L('Copy it quickly', 'త్వరగా రాసేయి')], L('Machines can make mistakes too.', 'యంత్రాలూ తప్పులు చేయగలవు.'), L('Check AI answers yourself and ask a teacher.', 'AI జవాబులు నువ్వే సరిచూసి టీచరును అడుగు.'), L('An AI helper can be wrong. Think and check.', 'AI సహాయకుడు తప్పు చేయవచ్చు. ఆలోచించి సరిచూడు.')],
          [L('Something on the screen scares you. What do you do?', 'తెరపై ఏదో భయపెట్టింది. ఏం చేస్తావు?'), L('Tell a grown-up', 'పెద్దవాళ్ళకు చెప్పు'), [L('Keep watching alone', 'ఒంటరిగా చూస్తూ ఉండు'), L('Keep it a secret', 'రహస్యంగా ఉంచు')], L('Who can help you?', 'నీకు ఎవరు సహాయం చేయగలరు?'), L('Always tell a grown-up you trust.', 'నమ్మకమైన పెద్దవాళ్ళకు ఎప్పుడూ చెప్పు.'), L('You should not handle it alone.', 'ఒంటరిగా ఎదుర్కోకూడదు.')],
          [L('A friend asks for your parent\'s phone password. What do you do?', 'స్నేహితుడు అమ్మానాన్నల ఫోన్ పాస్‌వర్డ్ అడిగాడు. ఏం చేస్తావు?'), L('Do not share it', 'చెప్పకు'), [L('Share it', 'చెప్పు'), L('Write it on the wall', 'గోడపై రాయి')], L('A password is a secret key.', 'పాస్‌వర్డ్ ఒక రహస్య తాళం.'), L('Passwords are never shared.', 'పాస్‌వర్డ్‌లు ఎవరికీ చెప్పకూడదు.'), L('A password must stay secret.', 'పాస్‌వర్డ్ రహస్యంగా ఉండాలి.')],
          [L('How should you hold a tablet?', 'ట్యాబ్లెట్‌ను ఎలా పట్టుకోవాలి?'), L('Sit straight, keep it an arm away', 'నిటారుగా కూర్చుని చేయి దూరంలో ఉంచు'), [L('Very close to your eyes', 'కళ్ళకు చాలా దగ్గరగా'), L('Lying in the dark', 'చీకట్లో పడుకుని')], L('Protect your eyes and back.', 'కళ్ళను, వీపును కాపాడుకో.'), L('Sit straight and keep the screen at arm\'s length.', 'నిటారుగా కూర్చుని తెరను చేయి దూరంలో ఉంచు.'), L('That hurts your eyes.', 'అది కళ్ళకు హాని.')],
        ]),
      ],
    },
    {
      id: 'ts2.ma.dig.steps', title: L('Step-by-step instructions', 'అడుగు అడుగుగా సూచనలు'),
      intro: [
        h('Computers follow steps in order', 'కంప్యూటర్లు క్రమంలో అడుగులు పాటిస్తాయి'),
        p('A computer does exactly what we tell it, one step at a time.', 'కంప్యూటర్ మనం చెప్పినట్లే, ఒక్కో అడుగు చేస్తుంది.'),
        p('If the steps are in the wrong order, the job goes wrong!', 'అడుగులు తప్పు క్రమంలో ఉంటే పని తప్పుతుంది!'),
        photo('🧩',L('Steps are like puzzle pieces. Each one must go in the right place.', 'అడుగులు పజిల్ ముక్కల లాంటివి. ప్రతిదీ సరైన చోట ఉండాలి.')),
        stepsB(L('Wet the brush.', 'బ్రష్ తడుపు.'), L('Put toothpaste on it.', 'దానిపై పేస్ట్ వేయి.'), L('Brush your teeth.', 'పళ్ళు తోముకో.'), L('Rinse your mouth.', 'నోరు పుక్కిలించు.')),
        tip('Ask: what must happen first? What comes last?', 'అడుగు: ముందు ఏది జరగాలి? చివర ఏది?'),
      ],
      examples: [
        ex(L('Order: open the app, switch on the tablet, start the lesson.', 'క్రమం: యాప్ తెరువు, ట్యాబ్లెట్ ఆన్ చేయి, పాఠం మొదలుపెట్టు.'), [L('The tablet must be on before opening an app.', 'యాప్ తెరిచే ముందు ట్యాబ్లెట్ ఆన్ అవ్వాలి.')], L('Switch on → open the app → start the lesson', 'ఆన్ చేయి → యాప్ తెరువు → పాఠం మొదలు')),
        ex(L('Order: plant the seed, dig a hole, water it.', 'క్రమం: విత్తనం నాటు, గుంత తవ్వు, నీళ్ళు పోయి.'), [L('We need a hole before we plant.', 'నాటే ముందు గుంత కావాలి.')], L('Dig → plant → water', 'తవ్వు → నాటు → నీళ్ళు పోయి')),
      ],
      practice: [
        tp('order', (r) => {
          const seqs: Lc[][] = [
            [L('Switch on the tablet', 'ట్యాబ్లెట్ ఆన్ చేయి'), L('Open the learning app', 'లెర్నింగ్ యాప్ తెరువు'), L('Do the lesson', 'పాఠం చేయి'), L('Switch it off', 'దాన్ని ఆఫ్ చేయి')],
            [L('Wet the brush', 'బ్రష్ తడుపు'), L('Put toothpaste on it', 'దానిపై పేస్ట్ వేయి'), L('Brush your teeth', 'పళ్ళు తోముకో'), L('Rinse your mouth', 'నోరు పుక్కిలించు')],
            [L('Dig a hole', 'గుంత తవ్వు'), L('Put the seed in', 'విత్తనం వేయి'), L('Cover it with soil', 'మట్టితో కప్పు'), L('Pour water', 'నీళ్ళు పోయి')],
            [L('Open the tap', 'కుళాయి తిప్పు'), L('Wet your hands', 'చేతులు తడుపు'), L('Rub with soap', 'సబ్బుతో రుద్దు'), L('Rinse and dry', 'కడిగి తుడుచుకో')],
            [L('Wear your uniform', 'యూనిఫాం వేసుకో'), L('Pack your school bag', 'బడి సంచి సర్దు'), L('Wear your shoes', 'బూట్లు వేసుకో'), L('Walk to school', 'బడికి నడువు')],
            [L('Press the camera button', 'కెమెరా బటన్ నొక్కు'), L('Point at the flower', 'పువ్వు వైపు చూపు'), L('Take the photo', 'ఫోటో తీయి'), L('Look at the photo', 'ఫోటో చూడు')],
          ];
          const s = r.pick(seqs);
          return {
            type: 'order', prompt: L('Put the steps in the right order.', 'అడుగులను సరైన క్రమంలో పెట్టు.'), ...ordering(r, s),
            hints: [L('What must happen first?', 'ముందు ఏది జరగాలి?'), L('What is the very last step?', 'చివరి అడుగు ఏది?')],
            mistakes: [{ when: 'wrong', explain: L('Act it out in your head, one step at a time.', 'మనసులో ఒక్కో అడుగు చేసి చూడు.') }],
            solution: [L(s.map((x) => x.en).join(' → '), s.map(te).join(' → '))],
          };
        }),
      ],
    },
  ],
};

// ================================================================== CH 10
const ch10: USpec = {
  id: 'ts2.ma.ch10', subject: 'math', title: L('Multiplication of Numbers (I)', 'సంఖ్యల గుణకారం (I)'), source: src(10),
  objectives: [
    {
      id: 'ts2.ma.mul.groups', title: L('Equal groups', 'సమాన గుంపులు'), prereqs: ['ts2.ma.add.small'],
      activities: ['game:counting'],
      intro: [
        h('Same number in every group', 'ప్రతి గుంపులో ఒకే సంఖ్య'),
        p('3 plates. Each plate has 4 laddoos. These are equal groups.', '3 పళ్ళేలు. ప్రతి పళ్ళెంలో 4 లడ్డూలు. ఇవి సమాన గుంపులు.'),
        photo('🍌', L('Bananas grow in bunches. Count bunches, then count in each bunch.', 'అరటి పండ్లు గెలలుగా పెరుగుతాయి. గెలలు లెక్కించి, ప్రతి గెలలో లెక్కించు.')),
        vis(obj('🍊', 12, 4), '3 groups of 4 oranges make 12', '4 చొప్పున 3 గుంపుల నారింజలు = 12'),
        p('Count in jumps: 4, 8, 12. So 3 groups of 4 is 12.', 'దూకుతూ లెక్కించు: 4, 8, 12. కాబట్టి 4 చొప్పున 3 గుంపులు = 12.'),
        tip('Ask two questions: how many groups? how many in each group?', 'రెండు ప్రశ్నలు అడుగు: ఎన్ని గుంపులు? ప్రతి గుంపులో ఎన్ని?'),
      ],
      examples: [
        ex(L('4 groups of 2 eggs. How many eggs?', '2 గుడ్ల చొప్పున 4 గుంపులు. ఎన్ని గుడ్లు?'), [L('Count in twos: 2, 4, 6, 8.', 'రెండేసి: 2, 4, 6, 8.')], L('8 eggs', '8 గుడ్లు'), obj('🥚', 8, 2)),
        ex(L('5 groups of 3 flowers. How many flowers?', '3 పువ్వుల చొప్పున 5 గుంపులు. ఎన్ని పువ్వులు?'), [L('Count in threes: 3, 6, 9, 12, 15.', 'మూడేసి: 3, 6, 9, 12, 15.')], L('15 flowers', '15 పువ్వులు'), obj('🌼', 15, 3)),
      ],
      practice: [
        tp('total', (r) => {
          const g = r.int(2, 5), k = r.int(2, 5), t = r.pick(ITEMS);
          return countQ(L(`There are ${k} groups of ${g} ${t.en}. How many ${t.en} in all?`, `${g} ${t.te} చొప్పున ${k} గుంపులు. మొత్తం ఎన్ని ${t.te}?`), g * k, obj(t.e, g * k, g),
            [L(`Count in ${g}s.`, `${g} చొప్పున లెక్కించు.`), L(`Say ${range(1, Math.min(k, 3)).map((i) => i * g).join(', ')} …`, `చెప్పు ${range(1, Math.min(k, 3)).map((i) => i * g).join(', ')} …`)],
            [L(range(1, k).map((i) => i * g).join(', ') + ` → ${g * k}`, range(1, k).map((i) => i * g).join(', ') + ` → ${g * k}`)],
            [...(k !== g ? [[String(k), L('That is the number of groups. Count everything inside the groups.', 'అది గుంపుల సంఖ్య. గుంపుల లోపల అన్నీ లెక్కించు.')] as [string, Lc]] : []), [String(g + k), L('Do not add the groups and the size. Count in jumps.', 'గుంపులు, సైజు కలపకు. దూకుతూ లెక్కించు.')]]);
        }),
        tp('each', (r) => {
          const g = r.int(2, 6), k = r.int(2, 5), t = r.pick(ITEMS);
          const askG = r.int(0, 1) === 1;
          return typed(askG ? L(`Look at the picture. How many ${t.en} are in each group?`, `బొమ్మ చూడు. ప్రతి గుంపులో ఎన్ని ${t.te}?`) : L(`Look at the picture. How many groups are there?`, 'బొమ్మ చూడు. ఎన్ని గుంపులు ఉన్నాయి?'), num(askG ? g : k),
            [askG ? L('Count inside one group only.', 'ఒక గుంపు లోపలే లెక్కించు.') : L('Count the groups, not the things.', 'వస్తువులు కాదు, గుంపులు లెక్కించు.')],
            [L(`${k} groups of ${g} ${t.en}.`, `${g} ${t.te} చొప్పున ${k} గుంపులు.`)],
            [[String(g * k), L('That is the total. The question asks about groups.', 'అది మొత్తం. ప్రశ్న గుంపుల గురించి.')]],
            { visual: obj(t.e, g * k, g) });
        }),
      ],
    },
    {
      id: 'ts2.ma.mul.rep', title: L('Repeated addition and the × sign', 'మళ్ళీ మళ్ళీ కూడిక, × గుర్తు'), prereqs: ['ts2.ma.mul.groups'],
      intro: [
        h('Adding the same number again and again', 'ఒకే సంఖ్యను మళ్ళీ మళ్ళీ కలపడం'),
        p('5 + 5 + 5 = 15. We added 5 three times.', '5 + 5 + 5 = 15. 5 ను మూడుసార్లు కలిపాం.'),
        p('We write it as 3 × 5 = 15. Say: three times five is fifteen.', 'దీన్ని 3 × 5 = 15 అని రాస్తాం. చెప్పు: ఐదు మూడుసార్లు పదిహేను.'),
        photo('🖐️', L('Each hand has 5 fingers. 2 hands: 5 + 5 = 2 × 5 = 10.', 'ఒక్కో చేతికి 5 వేళ్ళు. 2 చేతులు: 5 + 5 = 2 × 5 = 10.')),
        vis(obj('🪙', 15, 5), '3 groups of 5 coins: 3 × 5 = 15', '5 నాణేల చొప్పున 3 గుంపులు: 3 × 5 = 15'),
        tip('× is called "times". It is a short way to write repeated adding.', '× ను "సార్లు" అంటారు. మళ్ళీ మళ్ళీ కూడికకు చిన్న రూపం.'),
      ],
      examples: [
        ex(L('Write 4 + 4 + 4 using ×.', '4 + 4 + 4 ను × తో రాయి.'), [L('4 is added 3 times.', '4 ను 3 సార్లు కలిపాం.')], same('3 × 4 = 12')),
        ex(L('What is 2 × 6?', '2 × 6 ఎంత?'), [L('6 two times: 6 + 6.', '6 రెండుసార్లు: 6 + 6.'), L('6 + 6 = 12', '6 + 6 = 12')], same('12')),
      ],
      practice: [
        tp('write', (r) => {
          const g = r.int(2, 6), k = r.int(2, 5);
          const sum = Array(k).fill(g).join(' + ');
          return mcq(r, L(`${sum} is the same as:`, `${sum} దేనికి సమానం?`), same(`${k} × ${g}`), [same(`${k} + ${g}`), same(`${k * g} × ${g}`), same(`${g} − ${k}`)],
            [L(`How many times is ${g} added?`, `${g} ను ఎన్నిసార్లు కలిపారు?`)],
            [L(`${g} is added ${k} times, so it is ${k} × ${g} = ${k * g}.`, `${g} ను ${k} సార్లు కలిపారు, కాబట్టి ${k} × ${g} = ${k * g}.`)],
            [['wrong', L('Count how many times the same number appears.', 'ఒకే సంఖ్య ఎన్నిసార్లు వచ్చిందో లెక్కించు.')]]);
        }),
        tp('value', (r) => {
          const g = r.int(2, 6), k = r.int(2, 5);
          return typed(L(`${k} × ${g} = ? (Add ${g}, ${k} times.)`, `${k} × ${g} = ? (${g} ను ${k} సార్లు కలుపు.)`), num(k * g),
            [L(`${Array(k).fill(g).join(' + ')}`, `${Array(k).fill(g).join(' + ')}`)],
            [L(`${Array(k).fill(g).join(' + ')} = ${k * g}`, `${Array(k).fill(g).join(' + ')} = ${k * g}`)],
            [[String(k + g), L('× is not +. Add the number again and again.', '× అంటే + కాదు. సంఖ్యను మళ్ళీ మళ్ళీ కలుపు.')]],
            { visual: obj('🪙', k * g, g) });
        }),
      ],
    },
  ],
};

// ================================================================== CH 11
const ch11: USpec = {
  id: 'ts2.ma.ch11', subject: 'math', title: L('Multiplication Tables (1 to 10)', 'గుణకార పట్టికలు (ఎక్కాలు 1 నుండి 10)'), source: src(11),
  objectives: [
    {
      id: 'ts2.ma.tab.skip', title: L('Skip counting builds the tables', 'దాటుతూ లెక్కిస్తే ఎక్కాలు'), prereqs: ['ts2.ma.mul.rep'],
      activities: ['game:numberline'],
      intro: [
        h('Jump, jump, jump!', 'దూకు, దూకు, దూకు!'),
        p('Count in 2s: 2, 4, 6, 8, 10. That is the table of 2.', 'రెండేసి లెక్కించు: 2, 4, 6, 8, 10. అదే 2 ఎక్కం.'),
        vis({ kind: 'number-line', from: 0, to: 30, step: 1, jumps: [[0, 5], [5, 10], [10, 15], [15, 20]] }, 'Jumps of 5 on the number line', 'సంఖ్యా రేఖపై 5 చొప్పున దూకులు'),
        photo('🐸', L('A frog jumps 3 steps each time: 3, 6, 9, 12 … the table of 3.', 'కప్ప ప్రతిసారి 3 అడుగులు దూకుతుంది: 3, 6, 9, 12 … 3 ఎక్కం.')),
        keys(L('Table of 5 ends in 5 or 0.', '5 ఎక్కంలో చివర 5 లేదా 0.'), L('Table of 10 ends in 0.', '10 ఎక్కంలో చివర 0.'), L('Table of 2 has only even numbers.', '2 ఎక్కంలో సరి సంఖ్యలే.')),
        tip('Each step in a table adds the same number.', 'ఎక్కంలో ప్రతి అడుగు ఒకే సంఖ్యను కలుపుతుంది.'),
      ],
      examples: [
        ex(L('What comes next: 4, 8, 12, 16, ?', 'తర్వాత ఏది: 4, 8, 12, 16, ?'), [L('Each step adds 4.', 'ప్రతి అడుగు 4 కలుపుతుంది.'), L('16 + 4 = 20', '16 + 4 = 20')], same('20')),
        ex(L('Count in 10s up to 60.', '10 చొప్పున 60 వరకు లెక్కించు.'), [L('10, 20, 30, 40, 50, 60', '10, 20, 30, 40, 50, 60')], same('10, 20, 30, 40, 50, 60')),
      ],
      practice: [
        tp('next', (r) => {
          const n = r.int(2, 10), s = r.int(1, 5), seq = range(s, s + 3).map((i) => i * n), ans = (s + 4) * n;
          return mcqN(r, L(`What comes next? ${seq.join(', ')}, ?`, `తర్వాత ఏది? ${seq.join(', ')}, ?`), ans, [seq[3] + 1, ans + n, ans - 1],
            [L('How much is added each time?', 'ప్రతిసారి ఎంత కలుస్తోంది?')],
            [L(`The jump is ${n}. ${seq[3]} + ${n} = ${ans}.`, `దూకు ${n}. ${seq[3]} + ${n} = ${ans}.`)],
            [['wrong', L(`The numbers go up by ${n}, not by 1.`, `సంఖ్యలు 1 కాదు, ${n} చొప్పున పెరుగుతాయి.`)]]);
        }),
        tp('gap', (r) => {
          const n = r.int(2, 10), miss = r.int(2, 5), row1 = range(1, 6).map((i) => i * n);
          return typed(L(`Fill the gap in the table of ${n}: ${row1.map((x, i) => (i + 1 === miss ? '?' : x)).join(', ')}`, `${n} ఎక్కంలో ఖాళీ నింపు: ${row1.map((x, i) => (i + 1 === miss ? '?' : x)).join(', ')}`), num(miss * n),
            [L(`Add ${n} to the number before the gap.`, `ఖాళీ ముందు సంఖ్యకు ${n} కలుపు.`)],
            [L(`${(miss - 1) * n} + ${n} = ${miss * n}`, `${(miss - 1) * n} + ${n} = ${miss * n}`)],
            [[String((miss - 1) * n + 1), L(`Jump by ${n}, not by 1.`, `1 కాదు, ${n} దూకు.`)]]);
        }),
      ],
    },
    {
      id: 'ts2.ma.tab.facts', title: L('Table facts from 1 to 10', '1 నుండి 10 ఎక్కాలు'), prereqs: ['ts2.ma.tab.skip'],
      intro: [
        h('Say the tables like a song', 'ఎక్కాలను పాటలా చెప్పు'),
        p('3 ones are 3, 3 twos are 6, 3 threes are 9 …', 'మూడొకట్ల మూడు, మూడు రెళ్ళు ఆరు, మూడు మూళ్ళు తొమ్మిది …'),
        vis(row('6 × 1 = 6\n6 × 2 = 12\n6 × 3 = 18\n6 × 4 = 24\n6 × 5 = 30'), 'The table of 6 up to 6 × 5', '6 ఎక్కం 6 × 5 వరకు'),
        photo('🧑‍🏫', L('Our teacher says the table of 6. We say it back together.', 'మా టీచర్ 6 ఎక్కం చెబుతారు. మేమంతా కలిసి తిరిగి చెబుతాం.')),
        keys(L('Any number × 1 = the same number.', 'ఏ సంఖ్య × 1 = అదే సంఖ్య.'), L('Any number × 10 = put a 0 at the end.', 'ఏ సంఖ్య × 10 = చివర 0 పెట్టు.'), L('4 × 7 is the same as 7 × 4.', '4 × 7, 7 × 4 ఒకటే.')),
        tip('Forgot a fact? Start from one you know and jump. 6 × 5 = 30, so 6 × 6 = 36.', 'మర్చిపోయావా? తెలిసిన దాని నుండి దూకు. 6 × 5 = 30, కాబట్టి 6 × 6 = 36.'),
      ],
      examples: [
        ex(L('7 × 3 = ?', '7 × 3 = ?'), [L('Table of 7: 7, 14, 21.', '7 ఎక్కం: 7, 14, 21.')], same('21')),
        ex(L('9 × 10 = ?', '9 × 10 = ?'), [L('× 10: put a 0 after 9.', '× 10: 9 తర్వాత 0 పెట్టు.')], same('90')),
      ],
      practice: [
        tp('fact', (r) => {
          const a = r.int(2, 10), b = r.int(1, 10);
          return typed(L(`${a} × ${b} = ?`, `${a} × ${b} = ?`), num(a * b),
            [L(`Count in ${a}s, ${b} times.`, `${a} చొప్పున ${b} సార్లు లెక్కించు.`), b > 1 ? L(`${a} × ${b - 1} = ${a * (b - 1)}. Add ${a} more.`, `${a} × ${b - 1} = ${a * (b - 1)}. ఇంకా ${a} కలుపు.`) : L('Any number × 1 is itself.', 'ఏ సంఖ్య × 1 అదే సంఖ్య.')],
            [L(`${a} × ${b} = ${a * b}`, `${a} × ${b} = ${a * b}`)],
            a + b !== a * b ? [[String(a + b), L('× means groups, not adding the two numbers.', '× అంటే గుంపులు, రెండు సంఖ్యలు కలపడం కాదు.')]] : [], { visual: b <= 5 && a <= 6 ? obj('🪙', a * b, a) : undefined });
        }, 2),
      ],
    },
    {
      id: 'ts2.ma.tab.missing', title: L('Find the missing number', 'ఖాళీ సంఖ్య కనుక్కో'), prereqs: ['ts2.ma.tab.facts'],
      intro: [
        h('Table detective', 'ఎక్కాల డిటెక్టివ్'),
        p('4 × ? = 20. Say the table of 4 until you reach 20.', '4 × ? = 20. 20 వచ్చే వరకు 4 ఎక్కం చెప్పు.'),
        p('4, 8, 12, 16, 20 — that is 5 jumps. So ? = 5.', '4, 8, 12, 16, 20 — 5 దూకులు. కాబట్టి ? = 5.'),
        photo('🔦', L('Like a detective with a torch, look for the hidden number.', 'టార్చ్‌తో డిటెక్టివ్ లాగా దాగిన సంఖ్య వెతుకు.')),
        tip('Count on your fingers how many jumps you made.', 'ఎన్ని దూకులు దూకావో వేళ్ళపై లెక్కించు.'),
      ],
      examples: [
        ex(L('3 × ? = 18', '3 × ? = 18'), [L('3, 6, 9, 12, 15, 18', '3, 6, 9, 12, 15, 18'), L('That is 6 jumps.', 'అవి 6 దూకులు.')], same('6')),
        ex(L('? × 5 = 35', '? × 5 = 35'), [L('5, 10, 15, 20, 25, 30, 35', '5, 10, 15, 20, 25, 30, 35'), L('7 jumps of 5.', '5 చొప్పున 7 దూకులు.')], same('7')),
      ],
      practice: [
        tp('miss', (r) => {
          const a = r.int(2, 10), b = r.int(2, 10), p2 = a * b;
          return typed(L(`${a} × ? = ${p2}`, `${a} × ? = ${p2}`), num(b),
            [L(`Say the table of ${a} until you reach ${p2}.`, `${p2} వచ్చే వరకు ${a} ఎక్కం చెప్పు.`), L('Count your jumps.', 'నీ దూకులు లెక్కించు.')],
            [L(`${a} × ${b} = ${p2}, so the missing number is ${b}.`, `${a} × ${b} = ${p2}, కాబట్టి ఖాళీ సంఖ్య ${b}.`)],
            p2 - a !== b ? [[String(p2 - a), L('Do not subtract. Find how many times.', 'తీసివేయకు. ఎన్నిసార్లో కనుక్కో.')]] : []);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 12
const ch12: USpec = {
  id: 'ts2.ma.ch12', subject: 'math', title: L('Multiplication of Numbers (II)', 'సంఖ్యల గుణకారం (II)'), source: src(12),
  objectives: [
    {
      id: 'ts2.ma.mul2.story', title: L('Multiplication stories', 'గుణకారం కథలు'), prereqs: ['ts2.ma.tab.facts'],
      intro: [
        h('Groups in real life', 'నిజ జీవితంలో గుంపులు'),
        p('One auto has 3 wheels. 4 autos have 4 × 3 = 12 wheels.', 'ఒక ఆటోకు 3 చక్రాలు. 4 ఆటోలకు 4 × 3 = 12 చక్రాలు.'),
        photo('🛺', L('Autos at the stand. Count the wheels using the table of 3.', 'స్టాండ్‌లో ఆటోలు. 3 ఎక్కంతో చక్రాలు లెక్కించు.')),
        stepsB(L('How many groups? (4 autos)', 'ఎన్ని గుంపులు? (4 ఆటోలు)'), L('How many in each? (3 wheels)', 'ప్రతి దానిలో ఎన్ని? (3 చక్రాలు)'), L('Multiply: 4 × 3 = 12', 'గుణించు: 4 × 3 = 12')),
        tip('Look for the word "each". It tells you the group size.', '"ప్రతి", "ఒక్కో" మాట చూడు. అది గుంపు పరిమాణం చెబుతుంది.'),
      ],
      examples: [
        ex(L('A hen has 2 legs. How many legs do 6 hens have?', 'కోడికి 2 కాళ్ళు. 6 కోళ్ళకు ఎన్ని కాళ్ళు?'), [L('6 groups of 2', '2 చొప్పున 6 గుంపులు'), L('6 × 2 = 12', '6 × 2 = 12')], L('12 legs', '12 కాళ్ళు')),
        ex(L('One box has 5 pencils. How many pencils in 7 boxes?', 'ఒక డబ్బాలో 5 పెన్సిళ్లు. 7 డబ్బాల్లో ఎన్ని?'), [L('7 × 5 = 35', '7 × 5 = 35')], L('35 pencils', '35 పెన్సిళ్లు')),
      ],
      practice: [
        tp('story', (r) => {
          const k = r.int(2, 9);
          const st = r.pick([
            [2, 'A hen has 2 legs.', 'కోడికి 2 కాళ్ళు.', 'hens', 'కోళ్ళకు', 'legs', 'కాళ్ళు'],
            [3, 'An auto has 3 wheels.', 'ఆటోకు 3 చక్రాలు.', 'autos', 'ఆటోలకు', 'wheels', 'చక్రాలు'],
            [4, 'A cow has 4 legs.', 'ఆవుకు 4 కాళ్ళు.', 'cows', 'ఆవులకు', 'legs', 'కాళ్ళు'],
            [5, 'A hand has 5 fingers.', 'చేతికి 5 వేళ్ళు.', 'hands', 'చేతులకు', 'fingers', 'వేళ్ళు'],
            [6, 'A box has 6 laddoos.', 'ఒక డబ్బాలో 6 లడ్డూలు.', 'boxes', 'డబ్బాల్లో', 'laddoos', 'లడ్డూలు'],
            [10, 'A bundle has 10 sticks.', 'ఒక కట్టలో 10 పుల్లలు.', 'bundles', 'కట్టల్లో', 'sticks', 'పుల్లలు'],
            [7, 'A week has 7 days.', 'వారానికి 7 రోజులు.', 'weeks', 'వారాల్లో', 'days', 'రోజులు'],
          ] as const);
          const [g, e1, t1, grp, grpTe, thing, thingTe] = st;
          return typed(L(`${e1} How many ${thing} in ${k} ${grp}?`, `${t1} ${k} ${grpTe} ఎన్ని ${thingTe}?`), num(k * g),
            [L(`${k} groups of ${g}.`, `${g} చొప్పున ${k} గుంపులు.`), L(`Use the table of ${g}.`, `${g} ఎక్కం వాడు.`)],
            [L(`${k} × ${g} = ${k * g} ${thing}`, `${k} × ${g} = ${k * g} ${thingTe}`)],
            k + g !== k * g ? [[String(k + g), L('Each one has the same number, so multiply, do not add once.', 'ప్రతిదానికీ ఒకే సంఖ్య, కాబట్టి గుణించు.')]] : []);
        }, 2),
      ],
    },
    {
      id: 'ts2.ma.mul2.rules', title: L('Order, × 1 and × 0', 'క్రమం, × 1, × 0'), prereqs: ['ts2.ma.tab.facts'],
      intro: [
        h('Handy rules', 'ఉపయోగకర నియమాలు'),
        p('3 rows of 5 chairs = 5 rows of 3 chairs = 15 chairs.', '5 కుర్చీల 3 వరుసలు = 3 కుర్చీల 5 వరుసలు = 15 కుర్చీలు.'),
        vis(obj('🪑', 15, 5), '3 rows of 5 chairs', '5 కుర్చీల చొప్పున 3 వరుసలు'),
        photo('🪑', L('Chairs for a function. Turn the rows around — still 15 chairs!', 'వేడుక కోసం కుర్చీలు. వరుసలు తిప్పినా — 15 కుర్చీలే!')),
        keys(L('3 × 5 = 5 × 3', '3 × 5 = 5 × 3'), L('7 × 1 = 7 (one group of 7)', '7 × 1 = 7 (7 గల ఒక గుంపు)'), L('7 × 0 = 0 (no groups at all)', '7 × 0 = 0 (గుంపులే లేవు)')),
        tip('Use the easier order! 2 × 9 is the same as 9 × 2.', 'సులభమైన క్రమం వాడు! 2 × 9, 9 × 2 ఒకటే.'),
      ],
      examples: [
        ex(L('8 × 2 = 2 × ?', '8 × 2 = 2 × ?'), [L('Swapping does not change the answer.', 'మార్చినా జవాబు మారదు.')], same('8')),
        ex(L('6 × 0 = ?', '6 × 0 = ?'), [L('6 empty plates have no laddoos.', '6 ఖాళీ పళ్ళేలలో లడ్డూలు లేవు.')], same('0')),
      ],
      practice: [
        tp('swap', (r) => {
          const a = r.int(2, 10), b = r.int(2, 10);
          return typed(L(`${a} × ${b} = ${b} × ?`, `${a} × ${b} = ${b} × ?`), num(a),
            [L('Swapping the numbers does not change the answer.', 'సంఖ్యల స్థానం మార్చినా జవాబు మారదు.')],
            [L(`${a} × ${b} = ${b} × ${a} = ${a * b}`, `${a} × ${b} = ${b} × ${a} = ${a * b}`)],
            [[String(a * b), L('Not the answer — just the missing number in the box.', 'జవాబు కాదు — ఖాళీలోని సంఖ్య మాత్రమే.')]]);
        }),
        tp('zero', (r) => {
          const a = r.int(2, 10), kind = r.pick(['x0', 'x1', '0x', '1x'] as const);
          const pr = kind === 'x0' ? `${a} × 0` : kind === 'x1' ? `${a} × 1` : kind === '0x' ? `0 × ${a}` : `1 × ${a}`;
          const ans = kind.includes('0') ? 0 : a;
          return mcqN(r, L(`${pr} = ?`, `${pr} = ?`), ans, ans === 0 ? [a, a + 1, 1] : [1, 0, a + 1],
            [ans === 0 ? L('Zero groups, or groups with nothing, give nothing.', 'సున్నా గుంపులు లేదా ఖాళీ గుంపులు అంటే ఏమీ లేదు.') : L('One group of a number is just that number.', 'ఒక సంఖ్య గల ఒక గుంపు అంటే అదే సంఖ్య.')],
            [L(`${pr} = ${ans}`, `${pr} = ${ans}`)],
            [['wrong', ans === 0 ? L('Anything × 0 is 0.', 'ఏదైనా × 0 = 0.') : L('Anything × 1 stays the same.', 'ఏదైనా × 1 అదే.')]]);
        }),
      ],
    },
    {
      id: 'ts2.ma.mul2.big', title: L('Multiplying a 2-digit number', 'రెండు అంకెల సంఖ్యను గుణించడం'), prereqs: ['ts2.ma.tab.facts', 'ts2.ma.n99.place'],
      intro: [
        h('Split into tens and ones', 'పదులు, ఒకట్లుగా విడదీయి'),
        p('12 × 3: split 12 into 10 and 2.', '12 × 3: 12 ను 10, 2 గా విడదీయి.'),
        p('10 × 3 = 30. 2 × 3 = 6. 30 + 6 = 36.', '10 × 3 = 30. 2 × 3 = 6. 30 + 6 = 36.'),
        vis(row('  12\n×  3\n----\n  36'), '12 times 3 is 36', '12 × 3 = 36'),
        photo('🥚', L('A tray of 12 eggs. 3 trays: 12 × 3 = 36 eggs.', '12 గుడ్ల ట్రే. 3 ట్రేలు: 12 × 3 = 36 గుడ్లు.')),
        tip('Multiply the ones, then the tens. Do not forget either part!', 'ఒకట్లు, తర్వాత పదులు గుణించు. ఏ భాగమూ మర్చిపోకు!'),
      ],
      examples: [
        ex(L('21 × 4 = ?', '21 × 4 = ?'), [L('Ones: 1 × 4 = 4', 'ఒకట్లు: 1 × 4 = 4'), L('Tens: 2 × 4 = 8 tens = 80', 'పదులు: 2 × 4 = 8 పదులు = 80'), L('80 + 4 = 84', '80 + 4 = 84')], same('84')),
        ex(L('32 × 2 = ?', '32 × 2 = ?'), [L('2 × 2 = 4', '2 × 2 = 4'), L('3 tens × 2 = 6 tens = 60', '3 పదులు × 2 = 6 పదులు = 60')], same('64')),
      ],
      practice: [
        tp('mult', (r) => {
          const m = r.int(2, 4), t = r.int(1, Math.floor(9 / m)), o = r.int(1, Math.floor(9 / m)), n = t * 10 + o;
          return typed(L(`${n} × ${m} = ?`, `${n} × ${m} = ?`), num(n * m),
            [L(`Ones: ${o} × ${m} = ${o * m}`, `ఒకట్లు: ${o} × ${m} = ${o * m}`), L(`Tens: ${t} × ${m} = ${t * m} tens`, `పదులు: ${t} × ${m} = ${t * m} పదులు`)],
            [L(`${t * 10} × ${m} = ${t * 10 * m}. ${o} × ${m} = ${o * m}. ${t * 10 * m} + ${o * m} = ${n * m}.`, `${t * 10} × ${m} = ${t * 10 * m}. ${o} × ${m} = ${o * m}. ${t * 10 * m} + ${o * m} = ${n * m}.`)],
            [[String(t * 10 + o * m), L('You multiplied only the ones. Multiply the tens too.', 'ఒకట్లు మాత్రమే గుణించావు. పదులూ గుణించు.')], [String(t * m * 10 + o), L('You multiplied only the tens. Multiply the ones too.', 'పదులు మాత్రమే గుణించావు. ఒకట్లూ గుణించు.')]],
            { visual: row(`  ${n}\n×  ${m}\n----`) });
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 13
const ch13: USpec = {
  id: 'ts2.ma.ch13', subject: 'math', title: L('Division of One Number by Another Number', 'ఒక సంఖ్యను మరొక సంఖ్యతో భాగించడం'), source: src(13),
  objectives: [
    {
      id: 'ts2.ma.div.share', title: L('Sharing equally', 'సమానంగా పంచడం'), prereqs: ['ts2.ma.mul.groups'],
      intro: [
        h('Fair shares for everyone', 'అందరికీ సమాన భాగం'),
        p('12 laddoos for 3 friends. Give one to each friend, again and again.', '3 స్నేహితులకు 12 లడ్డూలు. ఒక్కొక్కరికి ఒక్కటి, మళ్ళీ మళ్ళీ ఇవ్వు.'),
        p('Each friend gets 4. Nobody gets more. That is sharing equally.', 'ప్రతి స్నేహితుడికి 4. ఎవరికీ ఎక్కువ కాదు. అదే సమానంగా పంచడం.'),
        photo('🍊', L('Share 8 oranges between 2 children: 4 each.', '8 నారింజలను 2 పిల్లలకు పంచు: ఒక్కొక్కరికి 4.')),
        vis(obj('🍊', 12, 4), '12 oranges shared into 3 equal groups of 4', '12 నారింజలు 4 చొప్పున 3 సమాన భాగాలు'),
        tip('Check: each share × number of friends = total.', 'సరిచూడు: ఒక్కో భాగం × స్నేహితుల సంఖ్య = మొత్తం.'),
      ],
      examples: [
        ex(L('10 bananas for 2 children equally. How many each?', '10 అరటి పండ్లు 2 పిల్లలకు సమానంగా. ఒక్కొక్కరికి ఎన్ని?'), [L('Give one each: 2, 4, 6, 8, 10.', 'ఒక్కొక్కటి ఇవ్వు: 2, 4, 6, 8, 10.'), L('That is 5 rounds.', 'అది 5 సార్లు.')], L('5 each', 'ఒక్కొక్కరికి 5')),
        ex(L('15 pencils for 5 children. How many each?', '15 పెన్సిళ్లు 5 పిల్లలకు. ఒక్కొక్కరికి ఎన్ని?'), [L('5 × ? = 15', '5 × ? = 15'), L('5 × 3 = 15', '5 × 3 = 15')], L('3 each', 'ఒక్కొక్కరికి 3')),
      ],
      practice: [
        tp('share', (r) => {
          const k = r.int(2, 5), e = r.int(2, 6), tot = k * e, t = r.pick(ITEMS);
          return typed(L(`${tot} ${t.en} are shared equally among ${k} children. How many does each child get?`, `${tot} ${t.te}ను ${k} పిల్లలకు సమానంగా పంచారు. ఒక్కొక్కరికి ఎన్ని?`), num(e),
            [L('Give one to each child, round after round.', 'ప్రతి బిడ్డకు ఒక్కొక్కటి, మళ్ళీ మళ్ళీ ఇవ్వు.'), L(`${k} × ? = ${tot}`, `${k} × ? = ${tot}`)],
            [L(`${k} × ${e} = ${tot}, so each child gets ${e}.`, `${k} × ${e} = ${tot}, కాబట్టి ఒక్కొక్కరికి ${e}.`)],
            [[String(tot - k), L('Sharing is not taking away once. Make equal groups.', 'పంచడం అంటే ఒకసారి తీసివేయడం కాదు. సమాన గుంపులు చేయి.')]],
            { visual: obj(t.e, tot) });
        }),
      ],
    },
    {
      id: 'ts2.ma.div.group', title: L('Making groups and the ÷ sign', 'గుంపులు చేయడం, ÷ గుర్తు'), prereqs: ['ts2.ma.div.share', 'ts2.ma.tab.facts'],
      intro: [
        h('How many groups can we make?', 'ఎన్ని గుంపులు చేయగలం?'),
        p('20 bananas. Put 4 in each bag. We can fill 5 bags.', '20 అరటి పండ్లు. ఒక్కో సంచిలో 4. 5 సంచులు నిండుతాయి.'),
        p('We write 20 ÷ 4 = 5. Say: twenty divided by four is five.', '20 ÷ 4 = 5 అని రాస్తాం. చెప్పు: ఇరవైని నాలుగుతో భాగిస్తే ఐదు.'),
        photo('🧺', L('Fill each basket with the same number of fruits.', 'ప్రతి బుట్టలో ఒకే సంఖ్యలో పండ్లు నింపు.')),
        vis(obj('🍌', 20, 4), '20 bananas in groups of 4 make 5 groups', '20 అరటి పండ్లు 4 చొప్పున 5 గుంపులు'),
        tip('Use your tables! 20 ÷ 4: which 4-fact gives 20? 4 × 5 = 20.', 'ఎక్కాలు వాడు! 20 ÷ 4: 4 ఎక్కంలో 20 ఎక్కడ? 4 × 5 = 20.'),
      ],
      examples: [
        ex(L('18 ÷ 3 = ?', '18 ÷ 3 = ?'), [L('3 × ? = 18', '3 × ? = 18'), L('3 × 6 = 18', '3 × 6 = 18')], same('6')),
        ex(L('24 children make teams of 6. How many teams?', '24 మంది పిల్లలు 6 చొప్పున జట్లు. ఎన్ని జట్లు?'), [L('24 ÷ 6', '24 ÷ 6'), L('6 × 4 = 24', '6 × 4 = 24')], L('4 teams', '4 జట్లు')),
      ],
      practice: [
        tp('bags', (r) => {
          const g = r.int(2, 6), k = r.int(2, 6), tot = g * k, t = r.pick(ITEMS);
          return typed(L(`There are ${tot} ${t.en}. Put ${g} in each bag. How many bags?`, `${tot} ${t.te} ఉన్నాయి. ఒక్కో సంచిలో ${g}. ఎన్ని సంచులు?`), num(k),
            [L(`Circle groups of ${g}.`, `${g} చొప్పున గుంపులు చుట్టు.`), L(`${g} × ? = ${tot}`, `${g} × ? = ${tot}`)],
            [L(`${tot} ÷ ${g} = ${k} bags`, `${tot} ÷ ${g} = ${k} సంచులు`)],
            [[String(tot - g), L('Keep making groups until nothing is left.', 'ఏమీ మిగలనంత వరకు గుంపులు చేయి.')]],
            { visual: obj(t.e, tot, g) });
        }),
        tp('fact', (r) => {
          const a = r.int(2, 10), b = r.int(2, 10);
          return typed(L(`${a * b} ÷ ${a} = ?`, `${a * b} ÷ ${a} = ?`), num(b),
            [L(`Think of the table of ${a}.`, `${a} ఎక్కం ఆలోచించు.`), L(`${a} × ? = ${a * b}`, `${a} × ? = ${a * b}`)],
            [L(`${a} × ${b} = ${a * b}, so ${a * b} ÷ ${a} = ${b}.`, `${a} × ${b} = ${a * b}, కాబట్టి ${a * b} ÷ ${a} = ${b}.`)],
            [[String(a * b - a), L('÷ is not −. Find how many groups.', '÷ అంటే − కాదు. ఎన్ని గుంపులో కనుక్కో.')]]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 14
const ch14: USpec = {
  id: 'ts2.ma.ch14', subject: 'math', title: L('Length of Things', 'వస్తువుల పొడవు'), source: src(14),
  objectives: [
    {
      id: 'ts2.ma.len.compare', title: L('Longer, shorter, taller', 'పొడవైనది, పొట్టిది, ఎత్తైనది'),
      intro: [
        h('Compare by looking', 'చూసి పోల్చు'),
        p('Put two things side by side. Start them at the same line.', 'రెండు వస్తువులను పక్కపక్కన పెట్టు. ఒకే గీత దగ్గర మొదలుపెట్టు.'),
        p('The one that goes further is longer.', 'ఎక్కువ దూరం వెళ్ళేది పొడవైనది.'),
        photo('🦒', L('A giraffe is taller than a goat. A goat is shorter than a giraffe.', 'జిరాఫీ మేక కంటే ఎత్తైనది. మేక జిరాఫీ కంటే పొట్టిది.')),
        keys(L('Long — short (for things lying down)', 'పొడవు — పొట్టి (పడుకున్న వస్తువులకు)'), L('Tall — short (for things standing up)', 'ఎత్తు — పొట్టి (నిలబడిన వస్తువులకు)')),
        tip('Line up the ends first, then compare.', 'ముందు చివరలు సమానంగా పెట్టి పోల్చు.'),
      ],
      examples: [
        ex(L('Which is longer: a pencil or a chalk piece?', 'ఏది పొడవు: పెన్సిలా, సుద్ద ముక్కా?'), [L('Put them side by side.', 'పక్కపక్కన పెట్టు.'), L('The pencil goes further.', 'పెన్సిల్ ఎక్కువ దూరం ఉంది.')], L('The pencil', 'పెన్సిల్')),
        ex(L('Who is taller: a coconut tree or a rose plant?', 'ఏది ఎత్తు: కొబ్బరి చెట్టా, గులాబీ మొక్కా?'), [L('A coconut tree is taller than a house.', 'కొబ్బరి చెట్టు ఇంటి కంటే ఎత్తు.')], L('The coconut tree', 'కొబ్బరి చెట్టు')),
      ],
      practice: [
        bank('cmp', [
          [L('Which is longer?', 'ఏది పొడవైనది?'), L('Train', 'రైలు'), [L('Bicycle', 'సైకిల్'), L('Auto', 'ఆటో')], L('Think of how many coaches a train has.', 'రైలుకు ఎన్ని బోగీలో ఆలోచించు.'), L('A train is much longer.', 'రైలు చాలా పొడవు.'), L('A train has many coaches. It is the longest.', 'రైలుకు చాలా బోగీలు. అదే పొడవైనది.')],
          [L('Which is taller?', 'ఏది ఎత్తైనది?'), L('Charminar', 'చార్మినార్'), [L('A bus', 'బస్సు'), L('A man', 'మనిషి')], L('Which one can you see from far away?', 'దూరం నుండి ఏది కనిపిస్తుంది?'), L('The Charminar is a very tall monument.', 'చార్మినార్ చాలా ఎత్తైన కట్టడం.'), L('The Charminar is taller than buses and people.', 'చార్మినార్ బస్సులు, మనుషుల కంటే ఎత్తు.')],
          [L('Which is shorter?', 'ఏది పొట్టిది?'), L('Eraser', 'రబ్బరు'), [L('Ruler', 'స్కేలు'), L('Broom', 'చీపురు')], L('Which one fits in your fist?', 'ఏది నీ పిడికిలిలో పడుతుంది?'), L('An eraser is the shortest.', 'రబ్బరు అన్నిటికంటే పొట్టిది.'), L('That one is longer than an eraser.', 'అది రబ్బరు కంటే పొడవు.')],
          [L('Which is taller?', 'ఏది ఎత్తైనది?'), L('Giraffe', 'జిరాఫీ'), [L('Dog', 'కుక్క'), L('Cat', 'పిల్లి')], L('Which one has a very long neck?', 'దేనికి పొడవాటి మెడ?'), L('A giraffe is the tallest animal.', 'జిరాఫీ అన్నిటికంటే ఎత్తైన జంతువు.'), L('A giraffe is much taller.', 'జిరాఫీ చాలా ఎత్తు.')],
          [L('Which is longer?', 'ఏది పొడవైనది?'), L('Saree', 'చీర'), [L('Handkerchief', 'చేతిరుమాలు'), L('Sock', 'మేజోడు')], L('Which one wraps around a person many times?', 'ఏది మనిషి చుట్టూ చాలాసార్లు చుట్టుకుంటుంది?'), L('A saree is very long.', 'చీర చాలా పొడవు.'), L('A saree is longer than that.', 'చీర దాని కంటే పొడవు.')],
          [L('Which is shorter?', 'ఏది పొట్టిది?'), L('Ant', 'చీమ'), [L('Elephant', 'ఏనుగు'), L('Cow', 'ఆవు')], L('Which one is tiny?', 'ఏది చాలా చిన్నది?'), L('An ant is the shortest.', 'చీమ అన్నిటికంటే పొట్టిది.'), L('That animal is big.', 'ఆ జంతువు పెద్దది.')],
        ]),
      ],
    },
    {
      id: 'ts2.ma.len.units', title: L('Measuring with hand spans, clips and steps', 'జానలు, క్లిప్పులు, అడుగులతో కొలవడం'), prereqs: ['ts2.ma.len.compare'],
      intro: [
        h('How long is it?', 'అది ఎంత పొడవు?'),
        p('Put paper clips end to end along a pencil. Count them.', 'పెన్సిల్ పక్కన పేపర్ క్లిప్పులు ఒకదాని తర్వాత ఒకటి పెట్టు. లెక్కించు.'),
        photo('📎', L('Paper clips in a line: the pencil is 6 clips long.', 'వరుసగా పేపర్ క్లిప్పులు: పెన్సిల్ 6 క్లిప్పుల పొడవు.')),
        vis(row('✏️\n📎📎📎📎📎📎'), 'A pencil as long as 6 clips', '6 క్లిప్పుల పొడవు గల పెన్సిల్'),
        p('We can measure a table with hand spans, and a room with steps.', 'బల్లను జానలతో, గదిని అడుగులతో కొలవవచ్చు.'),
        tip('No gaps and no overlaps between the clips!', 'క్లిప్పుల మధ్య ఖాళీ ఉండకూడదు, ఒకదానిపై ఒకటి ఉండకూడదు!'),
      ],
      examples: [
        ex(L('A crayon is 4 clips long. A pen is 7 clips long. How much longer is the pen?', 'క్రేయాన్ 4 క్లిప్పులు. పెన్ 7 క్లిప్పులు. పెన్ ఎంత పొడవు ఎక్కువ?'), [L('7 − 4 = 3', '7 − 4 = 3')], L('3 clips longer', '3 క్లిప్పులు ఎక్కువ')),
        ex(L('Ravi measures the bench: 8 hand spans. His father measures: 5 hand spans. Why different?', 'రవి బల్లను కొలిచాడు: 8 జానలు. నాన్న కొలిచారు: 5 జానలు. ఎందుకు వేరు?'), [L('Father\'s hand is bigger.', 'నాన్న చేయి పెద్దది.'), L('Bigger units mean a smaller count.', 'పెద్ద కొలమానం అంటే తక్కువ లెక్క.')], L('Their hand spans are different sizes.', 'వారి జానలు వేర్వేరు పరిమాణాలు.')),
      ],
      practice: [
        tp('clips', (r) => {
          const n = r.int(3, 10), thing = r.pick([L('pencil', 'పెన్సిల్'), L('ribbon', 'రిబ్బను'), L('stick', 'కర్ర'), L('spoon', 'చెంచా'), L('brush', 'బ్రష్')]);
          return countQ(L(`The ${thing.en} is as long as this line of clips. How many clips long is it?`, `${te(thing)} ఈ క్లిప్పుల వరుసంత పొడవు. ఎన్ని క్లిప్పుల పొడవు?`), n, obj('📎', n),
            [L('Count the clips one by one.', 'క్లిప్పులను ఒక్కొక్కటిగా లెక్కించు.')],
            [L(`It is ${n} clips long.`, `అది ${n} క్లిప్పుల పొడవు.`)],
            [[String(n - 1), L('You missed one clip.', 'ఒక క్లిప్పు వదిలేశావు.')]]);
        }),
        tp('more', (r) => {
          const a = r.int(5, 12), b = r.int(2, a - 1);
          const [x, y] = r.pick([[L('desk', 'బల్ల'), L('chair', 'కుర్చీ')], [L('door', 'తలుపు'), L('window', 'కిటికీ')], [L('mat', 'చాప'), L('pillow', 'దిండు')], [L('blackboard', 'నల్లబల్ల'), L('notebook', 'నోటు పుస్తకం')]] as const);
          return typed(L(`The ${x.en} is ${a} hand spans long. The ${y.en} is ${b} hand spans long. How many hand spans longer is the ${x.en}?`, `${te(x)} ${a} జానల పొడవు. ${te(y)} ${b} జానల పొడవు. ${te(x)} ఎన్ని జానలు ఎక్కువ?`), num(a - b),
            [L('Longer by how much: subtract.', 'ఎంత ఎక్కువ: తీసివేయి.')],
            [L(`${a} − ${b} = ${a - b} hand spans`, `${a} − ${b} = ${a - b} జానలు`)],
            [[String(a + b), L('We want the difference, not the total.', 'మనకు తేడా కావాలి, మొత్తం కాదు.')]]);
        }),
      ],
    },
    {
      id: 'ts2.ma.len.cm', title: L('Measuring with a ruler in centimetres', 'స్కేలుతో సెంటీమీటర్లలో కొలవడం'), prereqs: ['ts2.ma.len.units'],
      activities: ['game:numberline'],
      intro: [
        h('Everyone gets the same answer', 'అందరికీ ఒకే జవాబు'),
        p('Hand spans are different for everyone. A ruler is the same for everyone.', 'జానలు అందరికీ వేరు. స్కేలు అందరికీ ఒకటే.'),
        p('A ruler shows centimetres. We write cm.', 'స్కేలు సెంటీమీటర్లు చూపిస్తుంది. cm అని రాస్తాం.'),
        photo('📏', L('A 15 cm ruler from your geometry box.', 'నీ జామెట్రీ బాక్సులోని 15 cm స్కేలు.')),
        vis({ kind: 'number-line', from: 0, to: 15, step: 1, marks: [0, 7] }, 'An eraser from 0 to 7 on a ruler is 7 cm long', 'స్కేలుపై 0 నుండి 7 వరకు ఉన్న రబ్బరు 7 cm'),
        tip('Start at 0! If you start at another number, subtract.', '0 నుండి మొదలుపెట్టు! వేరే సంఖ్య నుండి మొదలైతే తీసివేయి.'),
      ],
      examples: [
        ex(L('A crayon starts at 0 and ends at 9. How long?', 'క్రేయాన్ 0 దగ్గర మొదలై 9 దగ్గర ముగుస్తుంది. ఎంత పొడవు?'), [L('Read the end: 9.', 'చివర చదువు: 9.')], same('9 cm')),
        ex(L('A leaf starts at 2 and ends at 8. How long?', 'ఆకు 2 దగ్గర మొదలై 8 దగ్గర ముగుస్తుంది. ఎంత పొడవు?'), [L('It did not start at 0.', 'అది 0 దగ్గర మొదలవలేదు.'), L('8 − 2 = 6', '8 − 2 = 6')], same('6 cm'), { kind: 'number-line', from: 0, to: 15, step: 1, marks: [2, 8] }),
      ],
      practice: [
        tp('ruler', (r) => {
          const s = r.pick([0, 0, 1, 2, 3]), e = r.int(s + 3, 15), thing = r.pick([L('leaf', 'ఆకు'), L('crayon', 'క్రేయాన్'), L('key', 'తాళం చెవి'), L('feather', 'ఈక'), L('chalk', 'సుద్ద')]);
          return typed(L(`A ${thing.en} lies on a ruler from ${s} to ${e}. How long is it in cm?`, `${te(thing)} స్కేలుపై ${s} నుండి ${e} వరకు ఉంది. ఎన్ని cm పొడవు?`), num(e - s, 'cm'),
            [s ? L(`It does not start at 0. Subtract ${s}.`, `అది 0 నుండి మొదలవలేదు. ${s} తీసివేయి.`) : L('It starts at 0, so read the end.', 'అది 0 నుండి మొదలైంది, చివర చదువు.')],
            [L(`${e} − ${s} = ${e - s} cm`, `${e} − ${s} = ${e - s} cm`)],
            s ? [[String(e), L(`That is where it ends. It started at ${s}, not 0.`, `అది ముగిసే చోటు. అది 0 కాదు, ${s} దగ్గర మొదలైంది.`)]] : [],
            { visual: { kind: 'number-line', from: 0, to: 15, step: 1, marks: [s, e] }, unitHint: 'cm' });
        }),
      ],
    },
  ],
};

// ================================================================== CH 15
const ch15: USpec = {
  id: 'ts2.ma.ch15', subject: 'math', title: L('Weight of Things', 'వస్తువుల బరువు'), source: src(15),
  objectives: [
    {
      id: 'ts2.ma.wt.heavy', title: L('Heavy and light', 'బరువు, తేలిక'),
      intro: [
        h('Lift and feel', 'ఎత్తి చూడు'),
        p('Hold a book in one hand and a feather in the other. The book pulls your hand down more.', 'ఒక చేతిలో పుస్తకం, మరో చేతిలో ఈక పట్టుకో. పుస్తకం చేతిని ఎక్కువ కిందకు లాగుతుంది.'),
        p('The book is heavier. The feather is lighter.', 'పుస్తకం బరువైనది. ఈక తేలికైనది.'),
        photo('⚖️', L('A balance: the heavier side goes down, the lighter side goes up.', 'త్రాసు: బరువైన వైపు కిందకు, తేలికైన వైపు పైకి.')),
        tip('Big does not always mean heavy! A big balloon is very light.', 'పెద్దది ఎప్పుడూ బరువు కాదు! పెద్ద బెలూన్ చాలా తేలిక.'),
      ],
      examples: [
        ex(L('Which is heavier: a pumpkin or a lemon?', 'ఏది బరువు: గుమ్మడికాయా, నిమ్మకాయా?'), [L('Lift both. The pumpkin pulls down more.', 'రెండూ ఎత్తు. గుమ్మడికాయ ఎక్కువ కిందకు లాగుతుంది.')], L('The pumpkin', 'గుమ్మడికాయ')),
        ex(L('On a balance, a brick side goes down and a ball side goes up. Which is lighter?', 'త్రాసులో ఇటుక వైపు కిందకు, బంతి వైపు పైకి. ఏది తేలిక?'), [L('The side that goes up is lighter.', 'పైకి వెళ్ళే వైపు తేలిక.')], L('The ball', 'బంతి')),
      ],
      practice: [
        bank('heavy', [
          [L('Which is heavier?', 'ఏది బరువైనది?'), L('Watermelon', 'పుచ్చకాయ'), [L('Grape', 'ద్రాక్ష'), L('Leaf', 'ఆకు')], L('Which is hard to lift?', 'ఏది ఎత్తడం కష్టం?'), L('A watermelon is heavy.', 'పుచ్చకాయ బరువైనది.'), L('That one is light.', 'అది తేలిక.'), row('🍉 🍇 🍃')],
          [L('Which is lighter?', 'ఏది తేలికైనది?'), L('Feather', 'ఈక'), [L('Brick', 'ఇటుక'), L('Stone', 'రాయి')], L('Which one floats in the air?', 'ఏది గాలిలో తేలుతుంది?'), L('A feather is very light.', 'ఈక చాలా తేలిక.'), L('That one is heavy.', 'అది బరువు.'), row('🪶 🧱 🪨')],
          [L('Which is heavier?', 'ఏది బరువైనది?'), L('Elephant', 'ఏనుగు'), [L('Cow', 'ఆవు'), L('Goat', 'మేక')], L('Which is the biggest animal?', 'ఏది అతి పెద్ద జంతువు?'), L('An elephant is the heaviest.', 'ఏనుగు అన్నిటికంటే బరువు.'), L('An elephant is much heavier.', 'ఏనుగు చాలా బరువు.'), row('🐘 🐄 🐐')],
          [L('Which is lighter?', 'ఏది తేలికైనది?'), L('Balloon', 'బెలూన్'), [L('Football', 'ఫుట్‌బాల్'), L('Coconut', 'కొబ్బరికాయ')], L('Which one flies away if you let go?', 'వదిలేస్తే ఏది ఎగిరిపోతుంది?'), L('A balloon is very light even though it is big.', 'బెలూన్ పెద్దదైనా చాలా తేలిక.'), L('That one is heavier than a balloon.', 'అది బెలూన్ కంటే బరువు.'), row('🎈 ⚽ 🥥')],
          [L('Which is heavier?', 'ఏది బరువైనది?'), L('School bag with books', 'పుస్తకాలతో బడి సంచి'), [L('Pencil', 'పెన్సిల్'), L('Eraser', 'రబ్బరు')], L('Which one makes your shoulders tired?', 'ఏది నీ భుజాలను అలసిపోయేలా చేస్తుంది?'), L('A full school bag is heavy.', 'నిండిన బడి సంచి బరువు.'), L('That is light.', 'అది తేలిక.'), row('🎒 ✏️')],
          [L('A balance has a mango on one side and a brick on the other. The brick side goes down. Which is heavier?', 'త్రాసులో ఒక వైపు మామిడి, మరో వైపు ఇటుక. ఇటుక వైపు కిందకు వెళ్ళింది. ఏది బరువు?'), L('Brick', 'ఇటుక'), [L('Mango', 'మామిడి'), L('Both the same', 'రెండూ సమానం')], L('The heavier side goes down.', 'బరువైన వైపు కిందకు వెళ్తుంది.'), L('The brick side went down, so the brick is heavier.', 'ఇటుక వైపు కిందకు వెళ్ళింది, ఇటుక బరువు.'), L('Look at which side went down.', 'ఏ వైపు కిందకు వెళ్ళిందో చూడు.'), row('🥭 ⚖️ 🧱')],
        ]),
      ],
    },
    {
      id: 'ts2.ma.wt.measure', title: L('Weighing with units and kilograms', 'కొలమానాలు, కిలోగ్రాములతో తూకం'), prereqs: ['ts2.ma.wt.heavy'],
      intro: [
        h('How heavy is it?', 'అది ఎంత బరువు?'),
        p('Put a mango on one side of a balance. Add marbles on the other side until it is level.', 'త్రాసులో ఒక వైపు మామిడి పెట్టు. మరో వైపు సమానమయ్యే వరకు గోళీలు వేయి.'),
        p('If 8 marbles balance the mango, the mango weighs 8 marbles.', '8 గోళీలు మామిడితో సమానమైతే, మామిడి బరువు 8 గోళీలు.'),
        photo('🛒', L('At the kirana shop, rice and dal are weighed in kilograms (kg).', 'కిరాణా దుకాణంలో బియ్యం, పప్పు కిలోగ్రాముల్లో (kg) తూకం వేస్తారు.')),
        tip('Shops use kilograms so everyone gets a fair amount.', 'అందరికీ న్యాయంగా అందాలని దుకాణాలు కిలోగ్రాములు వాడతాయి.'),
      ],
      examples: [
        ex(L('A guava balances 5 coins. An apple balances 7 coins. Which is heavier and by how much?', 'జామకాయ 5 నాణేలతో సమానం. ఆపిల్ 7 నాణేలతో సమానం. ఏది బరువు, ఎంత?'), [L('7 is more than 5.', '7, 5 కంటే ఎక్కువ.'), L('7 − 5 = 2', '7 − 5 = 2')], L('The apple, by 2 coins', 'ఆపిల్, 2 నాణేలు ఎక్కువ')),
        ex(L('Amma buys 5 kg rice and 2 kg sugar. How many kg in all?', 'అమ్మ 5 kg బియ్యం, 2 kg చక్కెర కొన్నది. మొత్తం ఎన్ని kg?'), [L('5 + 2 = 7', '5 + 2 = 7')], same('7 kg')),
      ],
      practice: [
        tp('balance', (r) => {
          const a = r.int(4, 12), b = r.int(2, a - 1);
          const [x, y] = r.pick([[L('mango', 'మామిడి'), L('lemon', 'నిమ్మకాయ')], [L('apple', 'ఆపిల్'), L('guava', 'జామకాయ')], [L('brinjal', 'వంకాయ'), L('chilli', 'మిరపకాయ')], [L('coconut', 'కొబ్బరికాయ'), L('potato', 'బంగాళదుంప')], [L('book', 'పుస్తకం'), L('notebook', 'నోటు పుస్తకం')]] as const);
          return typed(L(`A ${x.en} balances ${a} marbles. A ${y.en} balances ${b} marbles. How many marbles heavier is the ${x.en}?`, `${te(x)} ${a} గోళీలతో సమానం. ${te(y)} ${b} గోళీలతో సమానం. ${te(x)} ఎన్ని గోళీలు ఎక్కువ బరువు?`), num(a - b),
            [L('Find the difference.', 'తేడా కనుక్కో.'), L(`${a} − ${b}`, `${a} − ${b}`)],
            [L(`${a} − ${b} = ${a - b} marbles`, `${a} − ${b} = ${a - b} గోళీలు`)],
            [[String(a + b), L('"How many heavier" means the difference. Subtract.', '"ఎన్ని ఎక్కువ బరువు" అంటే తేడా. తీసివేయి.')]]);
        }),
        tp('kg', (r) => {
          const a = r.int(2, 25), b = r.int(1, 20), n1 = nm(r);
          const [x, y] = r.pick([[L('rice', 'బియ్యం'), L('dal', 'పప్పు')], [L('onions', 'ఉల్లిపాయలు'), L('potatoes', 'బంగాళదుంపలు')], [L('wheat flour', 'గోధుమ పిండి'), L('sugar', 'చక్కెర')], [L('jowar', 'జొన్నలు'), L('ragi', 'రాగులు')]] as const);
          return typed(L(`${n1.en}'s family buys ${a} kg of ${x.en} and ${b} kg of ${y.en}. How many kg in all?`, `${te(n1)} కుటుంబం ${a} kg ${te(x)}, ${b} kg ${te(y)} కొన్నారు. మొత్తం ఎన్ని kg?`), num(a + b, 'kg'),
            [L('In all means add.', 'మొత్తం అంటే కలుపు.')],
            [L(`${a} + ${b} = ${a + b} kg`, `${a} + ${b} = ${a + b} kg`)],
            [[String(Math.abs(a - b)), L('Both bags are bought, so add.', 'రెండు సంచులూ కొన్నారు, కలుపు.')]], { unitHint: 'kg' });
        }),
      ],
    },
  ],
};

// ================================================================== CH 16
const ch16: USpec = {
  id: 'ts2.ma.ch16', subject: 'math', title: L('Measure of Liquids', 'ద్రవాల కొలత'), source: src(16),
  objectives: [
    {
      id: 'ts2.ma.liq.more', title: L('Which holds more?', 'దేనిలో ఎక్కువ పడుతుంది?'),
      intro: [
        h('Fill it up!', 'నింపి చూడు!'),
        p('A bucket holds more water than a glass.', 'గ్లాసు కంటే బకెట్‌లో ఎక్కువ నీళ్ళు పడతాయి.'),
        p('To check, fill the small one and pour it into the big one again and again.', 'సరిచూడటానికి చిన్నదాన్ని నింపి పెద్దదానిలో మళ్ళీ మళ్ళీ పోయి.'),
        photo('🪣', L('A bucket of water for the plants. It holds many glasses of water.', 'మొక్కల కోసం బకెట్ నీళ్ళు. దానిలో చాలా గ్లాసుల నీళ్ళు పడతాయి.')),
        vis(row('🪣 > 🥛'), 'A bucket holds more than a glass', 'గ్లాసు కంటే బకెట్‌లో ఎక్కువ'),
        tip('A tall thin bottle may hold less than a short wide pot. Pour and check!', 'పొడవాటి సన్నని సీసాలో పొట్టి వెడల్పు కుండ కంటే తక్కువ పట్టవచ్చు. పోసి చూడు!'),
      ],
      examples: [
        ex(L('Which holds more: a spoon or a cup?', 'దేనిలో ఎక్కువ: చెంచాలోనా, కప్పులోనా?'), [L('Many spoons of water fill one cup.', 'చాలా చెంచాల నీళ్ళు ఒక కప్పు నింపుతాయి.')], L('The cup', 'కప్పు')),
        ex(L('A jug fills 6 glasses. A bottle fills 4 glasses. Which holds more?', 'జగ్గు 6 గ్లాసులు నింపుతుంది. సీసా 4 గ్లాసులు. దేనిలో ఎక్కువ?'), [L('6 glasses is more than 4 glasses.', '6 గ్లాసులు 4 కంటే ఎక్కువ.')], L('The jug', 'జగ్గు')),
      ],
      practice: [
        bank('more', [
          [L('Which holds more water?', 'దేనిలో ఎక్కువ నీళ్ళు పడతాయి?'), L('Bucket', 'బకెట్'), [L('Glass', 'గ్లాసు'), L('Spoon', 'చెంచా')], L('Which is the biggest container?', 'ఏ పాత్ర అతి పెద్దది?'), L('A bucket holds the most.', 'బకెట్‌లో అన్నిటికంటే ఎక్కువ.'), L('That holds less than a bucket.', 'దానిలో బకెట్ కంటే తక్కువ.'), row('🪣 🥛 🥄')],
          [L('Which holds less?', 'దేనిలో తక్కువ పడుతుంది?'), L('Spoon', 'చెంచా'), [L('Cup', 'కప్పు'), L('Bucket', 'బకెట్')], L('Which is the smallest?', 'ఏది అతి చిన్నది?'), L('A spoon holds very little.', 'చెంచాలో చాలా తక్కువ.'), L('That holds more than a spoon.', 'దానిలో చెంచా కంటే ఎక్కువ.'), row('🥄 ☕ 🪣')],
          [L('Which holds more milk?', 'దేనిలో ఎక్కువ పాలు పడతాయి?'), L('Milk can', 'పాల క్యాను'), [L('Cup', 'కప్పు'), L('Glass', 'గ్లాసు')], L('The milkman carries a big one on his cycle.', 'పాలవాడు సైకిల్‌పై పెద్దది తెస్తాడు.'), L('A milk can holds a lot.', 'పాల క్యానులో చాలా పడతాయి.'), L('That holds less than a milk can.', 'దానిలో పాల క్యాను కంటే తక్కువ.')],
          [L('Which holds more water?', 'దేనిలో ఎక్కువ నీళ్ళు పడతాయి?'), L('Water tank', 'నీళ్ళ ట్యాంకు'), [L('Bucket', 'బకెట్'), L('Pot', 'కుండ')], L('Which one is on the roof and fills the whole house?', 'ఇంటి పైకప్పుపై ఉండి ఇల్లంతటికీ నీళ్ళిచ్చేది ఏది?'), L('A water tank holds the most.', 'నీళ్ళ ట్యాంకులో అన్నిటికంటే ఎక్కువ.'), L('A tank is much bigger.', 'ట్యాంకు చాలా పెద్దది.')],
          [L('A pot fills 9 glasses. A bottle fills 5 glasses. Which holds more?', 'కుండ 9 గ్లాసులు నింపుతుంది. సీసా 5. దేనిలో ఎక్కువ?'), L('Pot', 'కుండ'), [L('Bottle', 'సీసా'), L('Both the same', 'రెండూ సమానం')], L('Compare 9 and 5.', '9, 5 పోల్చు.'), L('9 glasses is more than 5, so the pot holds more.', '9 గ్లాసులు 5 కంటే ఎక్కువ, కుండలో ఎక్కువ.'), L('More glasses means it holds more.', 'ఎక్కువ గ్లాసులు అంటే ఎక్కువ పడుతుంది.')],
          [L('A mug fills 3 glasses. A jug fills 7 glasses. Which holds less?', 'మగ్గు 3 గ్లాసులు నింపుతుంది. జగ్గు 7. దేనిలో తక్కువ?'), L('Mug', 'మగ్గు'), [L('Jug', 'జగ్గు'), L('Both the same', 'రెండూ సమానం')], L('Compare 3 and 7.', '3, 7 పోల్చు.'), L('3 is less than 7, so the mug holds less.', '3, 7 కంటే తక్కువ, మగ్గులో తక్కువ.'), L('Fewer glasses means it holds less.', 'తక్కువ గ్లాసులు అంటే తక్కువ పడుతుంది.')],
        ]),
      ],
    },
    {
      id: 'ts2.ma.liq.count', title: L('Measuring with glasses and litres', 'గ్లాసులు, లీటర్లతో కొలవడం'), prereqs: ['ts2.ma.liq.more'],
      intro: [
        h('Count the glasses', 'గ్లాసులు లెక్కించు'),
        p('A jug fills 5 glasses. Two jugs fill 5 + 5 = 10 glasses.', 'ఒక జగ్గు 5 గ్లాసులు నింపుతుంది. రెండు జగ్గులు 5 + 5 = 10 గ్లాసులు.'),
        photo('🥛', L('Milk is sold in litres. A packet may hold half a litre or one litre.', 'పాలు లీటర్లలో అమ్ముతారు. ఒక ప్యాకెట్‌లో అర లీటరు లేదా ఒక లీటరు ఉంటుంది.')),
        p('Shops use the litre (L) so that everyone gets the same amount.', 'అందరికీ ఒకే పరిమాణం అందేలా దుకాణాలు లీటరు (L) వాడతాయి.'),
        tip('Two half-litre packets make one litre.', 'రెండు అర లీటరు ప్యాకెట్లు ఒక లీటరు.'),
      ],
      examples: [
        ex(L('A bottle fills 4 glasses. How many glasses do 3 bottles fill?', 'ఒక సీసా 4 గ్లాసులు నింపుతుంది. 3 సీసాలు ఎన్ని?'), [L('4 + 4 + 4 = 12', '4 + 4 + 4 = 12')], L('12 glasses', '12 గ్లాసులు')),
        ex(L('We buy 2 L milk in the morning and 1 L in the evening. How much?', 'ఉదయం 2 L, సాయంత్రం 1 L పాలు కొన్నాం. మొత్తం ఎంత?'), [L('2 + 1 = 3', '2 + 1 = 3')], same('3 L')),
      ],
      practice: [
        tp('glasses', (r) => {
          const g = r.int(2, 6), k = r.int(2, 4);
          const [c, cTe, cs, csTe] = r.pick([['jug', 'జగ్గు', 'jugs', 'జగ్గులు'], ['bottle', 'సీసా', 'bottles', 'సీసాలు'], ['pot', 'కుండ', 'pots', 'కుండలు'], ['mug', 'మగ్గు', 'mugs', 'మగ్గులు']] as const);
          return typed(L(`One ${c} fills ${g} glasses. How many glasses do ${k} ${cs} fill?`, `ఒక ${cTe} ${g} గ్లాసులు నింపుతుంది. ${k} ${csTe} ఎన్ని గ్లాసులు నింపుతాయి?`), num(g * k),
            [L(`Add ${g}, ${k} times.`, `${g} ను ${k} సార్లు కలుపు.`)],
            [L(`${Array(k).fill(g).join(' + ')} = ${g * k} glasses`, `${Array(k).fill(g).join(' + ')} = ${g * k} గ్లాసులు`)],
            [[String(g + k), L(`Each ${c} fills ${g} glasses. Add ${g} again for every ${c}.`, `ప్రతి ${cTe} ${g} గ్లాసులు. ప్రతి దానికి ${g} కలుపు.`)]],
            { visual: obj('🥛', g * k, g) });
        }),
        tp('litre', (r) => {
          const a = r.int(2, 15), b = r.int(1, 10), add = r.int(0, 1) === 1;
          const big = Math.max(a, b + 1);
          return add
            ? typed(L(`A tank gets ${a} L of water in the morning and ${b} L in the evening. How many litres in all?`, `ట్యాంకులో ఉదయం ${a} L, సాయంత్రం ${b} L నీళ్ళు పడ్డాయి. మొత్తం ఎన్ని లీటర్లు?`), num(a + b, 'L'),
              [L('In all means add.', 'మొత్తం అంటే కలుపు.')], [L(`${a} + ${b} = ${a + b} L`, `${a} + ${b} = ${a + b} L`)], [[String(Math.abs(a - b)), L('Water was added both times. Add.', 'రెండుసార్లూ నీళ్ళు పడ్డాయి. కలుపు.')]], { unitHint: 'L' })
            : typed(L(`A drum has ${big} L of water. We use ${b} L for the plants. How many litres are left?`, `డ్రమ్ములో ${big} L నీళ్ళు ఉన్నాయి. మొక్కలకు ${b} L వాడాం. ఎన్ని లీటర్లు మిగిలాయి?`), num(big - b, 'L'),
              [L('Used means take away.', 'వాడాం అంటే తీసివేయి.')], [L(`${big} − ${b} = ${big - b} L`, `${big} − ${b} = ${big - b} L`)], [[String(big + b), L('Water was used up, so there is less now.', 'నీళ్ళు వాడేశాం, ఇప్పుడు తక్కువ.')]], { unitHint: 'L' });
        }),
      ],
    },
  ],
};

// ================================================================== CH 17
const DAYS = [L('Sunday', 'ఆదివారం'), L('Monday', 'సోమవారం'), L('Tuesday', 'మంగళవారం'), L('Wednesday', 'బుధవారం'), L('Thursday', 'గురువారం'), L('Friday', 'శుక్రవారం'), L('Saturday', 'శనివారం')];
const MONTHS = [L('January', 'జనవరి'), L('February', 'ఫిబ్రవరి'), L('March', 'మార్చి'), L('April', 'ఏప్రిల్'), L('May', 'మే'), L('June', 'జూన్'), L('July', 'జూలై'), L('August', 'ఆగస్టు'), L('September', 'సెప్టెంబరు'), L('October', 'అక్టోబరు'), L('November', 'నవంబరు'), L('December', 'డిసెంబరు')];
const tm = (hh: number, half: boolean) => (half ? L(`half past ${hh}`, `${hh} గంటల 30 నిమిషాలు`) : L(`${hh} o'clock`, `${hh} గంటలు`));
const ch17: USpec = {
  id: 'ts2.ma.ch17', subject: 'math', title: L('Time', 'సమయం'), source: src(17),
  objectives: [
    {
      id: 'ts2.ma.time.clock', title: L("Reading the clock: o'clock and half past", 'గడియారం చదవడం: గంటలు, అర గంట'),
      intro: [
        h('Two hands on the clock', 'గడియారానికి రెండు ముళ్ళు'),
        p('The short hand shows the hour. The long hand shows the minutes.', 'చిన్న ముల్లు గంట చూపిస్తుంది. పెద్ద ముల్లు నిమిషాలు చూపిస్తుంది.'),
        p("Long hand on 12: it is o'clock. Long hand on 6: it is half past.", 'పెద్ద ముల్లు 12 మీద: సరిగ్గా గంటలు. పెద్ద ముల్లు 6 మీద: అర గంట దాటింది.'),
        photo('⏰', L("The alarm clock rings at 6 o'clock. Time to wake up!", 'అలారం గడియారం 6 గంటలకు మోగుతుంది. లేచే సమయం!')),
        vis({ kind: 'clock', h: 8, m: 0 }, "8 o'clock: short hand on 8, long hand on 12", '8 గంటలు: చిన్న ముల్లు 8 మీద, పెద్ద ముల్లు 12 మీద'),
        vis({ kind: 'clock', h: 3, m: 30 }, 'Half past 3: long hand on 6', '3 గంటల 30 నిమిషాలు: పెద్ద ముల్లు 6 మీద'),
        tip('At half past, the short hand is halfway between two numbers.', 'అర గంట దాటినప్పుడు చిన్న ముల్లు రెండు సంఖ్యల మధ్యలో ఉంటుంది.'),
      ],
      examples: [
        ex(L('Short hand on 9, long hand on 12. What time?', 'చిన్న ముల్లు 9, పెద్ద ముల్లు 12. సమయం?'), [L('Long hand on 12 means o\'clock.', 'పెద్ద ముల్లు 12 అంటే సరిగ్గా గంటలు.')], L("9 o'clock", '9 గంటలు'), { kind: 'clock', h: 9, m: 0 }),
        ex(L('Short hand between 4 and 5, long hand on 6. What time?', 'చిన్న ముల్లు 4, 5 మధ్య, పెద్ద ముల్లు 6. సమయం?'), [L('Long hand on 6 means half past.', 'పెద్ద ముల్లు 6 అంటే అర గంట దాటింది.'), L('The hour that has passed is 4.', 'గడిచిన గంట 4.')], L('Half past 4', '4 గంటల 30 నిమిషాలు'), { kind: 'clock', h: 4, m: 30 }),
      ],
      practice: [
        tp('read', (r) => {
          const hh = r.int(1, 12), half = r.int(0, 1) === 1, nx = hh === 12 ? 1 : hh + 1;
          return mcq(r, L('What time does the clock show?', 'గడియారం ఏ సమయం చూపిస్తోంది?'), tm(hh, half), [tm(hh, !half), tm(nx, half), half ? tm(nx, false) : tm(hh === 1 ? 12 : hh - 1, true)],
            [L('Look at the long hand first: 12 or 6?', 'ముందు పెద్ద ముల్లు చూడు: 12 నా, 6 నా?'), L('The short hand tells the hour.', 'చిన్న ముల్లు గంట చెబుతుంది.')],
            [L(`Long hand on ${half ? 6 : 12}, short hand ${half ? `just past ${hh}` : `on ${hh}`}: ${tm(hh, half).en}.`, `పెద్ద ముల్లు ${half ? 6 : 12} మీద, చిన్న ముల్లు ${half ? `${hh} దాటి` : `${hh} మీద`}: ${te(tm(hh, half))}.`)],
            [['wrong', L('Do not mix up the hands. Short = hour, long = minutes.', 'ముళ్ళను కలపకు. చిన్నది = గంట, పెద్దది = నిమిషాలు.')]],
            { visual: { kind: 'clock', h: hh, m: half ? 30 : 0 } });
        }),
        tp('hour', (r) => {
          const hh = r.int(1, 12);
          return typed(L("The clock shows o'clock. Which number is the short hand on?", 'గడియారం సరిగ్గా గంటలు చూపిస్తోంది. చిన్న ముల్లు ఏ సంఖ్య మీద ఉంది?'), num(hh),
            [L('The short hand is the hour hand.', 'చిన్న ముల్లు గంటల ముల్లు.')],
            [L(`The short hand is on ${hh}. It is ${hh} o'clock.`, `చిన్న ముల్లు ${hh} మీద. ${hh} గంటలు.`)],
            hh !== 12 ? [['12', L('12 is where the long hand points. Look at the short hand.', '12 మీద పెద్ద ముల్లు ఉంది. చిన్న ముల్లు చూడు.')]] : [],
            { visual: { kind: 'clock', h: hh, m: 0 } });
        }),
      ],
    },
    {
      id: 'ts2.ma.time.days', title: L('Days of the week and months', 'వారంలో రోజులు, నెలలు'),
      intro: [
        h('Seven days, twelve months', 'ఏడు రోజులు, పన్నెండు నెలలు'),
        p('A week has 7 days. Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday.', 'వారానికి 7 రోజులు. ఆదివారం, సోమవారం, మంగళవారం, బుధవారం, గురువారం, శుక్రవారం, శనివారం.'),
        p('A year has 12 months, from January to December.', 'సంవత్సరానికి 12 నెలలు, జనవరి నుండి డిసెంబరు వరకు.'),
        photo('📖', L('A calendar on the wall shows days and months. Find your birthday!', 'గోడ క్యాలెండరు రోజులు, నెలలు చూపిస్తుంది. నీ పుట్టినరోజు వెతుకు!')),
        keys(L('After Saturday comes Sunday again.', 'శనివారం తర్వాత మళ్ళీ ఆదివారం.'), L('Telangana Formation Day is in June.', 'తెలంగాణ ఆవిర్భావ దినోత్సవం జూన్‌లో.'), L('Sankranti comes in January.', 'సంక్రాంతి జనవరిలో వస్తుంది.')),
        tip('The days go round and round like a wheel.', 'రోజులు చక్రంలా తిరుగుతూ ఉంటాయి.'),
      ],
      examples: [
        ex(L('Today is Thursday. What day is tomorrow?', 'ఈరోజు గురువారం. రేపు ఏ రోజు?'), [L('The day after Thursday is Friday.', 'గురువారం తర్వాత శుక్రవారం.')], L('Friday', 'శుక్రవారం')),
        ex(L('Which month comes after May?', 'మే తర్వాత ఏ నెల?'), [L('January, February, March, April, May, June.', 'జనవరి, ఫిబ్రవరి, మార్చి, ఏప్రిల్, మే, జూన్.')], L('June', 'జూన్')),
      ],
      practice: [
        tp('day', (r) => {
          const i = r.int(0, 6), after = r.int(0, 1) === 1, j = after ? (i + 1) % 7 : (i + 6) % 7;
          return mcq(r, after ? L(`Today is ${DAYS[i].en}. What day is tomorrow?`, `ఈరోజు ${te(DAYS[i])}. రేపు ఏ రోజు?`) : L(`Today is ${DAYS[i].en}. What day was yesterday?`, `ఈరోజు ${te(DAYS[i])}. నిన్న ఏ రోజు?`), DAYS[j], [DAYS[after ? (i + 6) % 7 : (i + 1) % 7], DAYS[(i + 2) % 7 === j ? (i + 3) % 7 : (i + 2) % 7], DAYS[i]],
            [after ? L('Tomorrow is the next day.', 'రేపు అంటే తర్వాతి రోజు.') : L('Yesterday is the day before.', 'నిన్న అంటే ముందు రోజు.'), L('Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday', 'ఆది, సోమ, మంగళ, బుధ, గురు, శుక్ర, శని')],
            [L(`${after ? 'Tomorrow' : 'Yesterday'} is ${DAYS[j].en}.`, `${after ? 'రేపు' : 'నిన్న'} ${te(DAYS[j])}.`)],
            [['wrong', after ? L('Tomorrow comes after today, not before.', 'రేపు ఈరోజు తర్వాత, ముందు కాదు.') : L('Yesterday came before today.', 'నిన్న ఈరోజు ముందు వచ్చింది.')]]);
        }),
        tp('month', (r) => {
          const i = r.int(0, 11), j = (i + 1) % 12;
          return mcq(r, L(`Which month comes after ${MONTHS[i].en}?`, `${te(MONTHS[i])} తర్వాత ఏ నెల?`), MONTHS[j], [MONTHS[(i + 11) % 12], MONTHS[(i + 2) % 12]],
            [L('Say the months in order from January.', 'జనవరి నుండి నెలలు క్రమంలో చెప్పు.')],
            [L(`After ${MONTHS[i].en} comes ${MONTHS[j].en}.`, `${te(MONTHS[i])} తర్వాత ${te(MONTHS[j])}.`)],
            [['wrong', L('That month comes earlier or too late. Say them in order.', 'ఆ నెల ముందు లేదా చాలా తర్వాత వస్తుంది. క్రమంలో చెప్పు.')]]);
        }),
      ],
    },
    {
      id: 'ts2.ma.time.parts', title: L('Parts of the day and how long things take', 'రోజులో భాగాలు, ఎంత సమయం పడుతుంది'),
      intro: [
        h('Morning to night', 'ఉదయం నుండి రాత్రి వరకు'),
        p('We wake up in the morning. We eat lunch in the afternoon. We play in the evening. We sleep at night.', 'ఉదయం లేస్తాం. మధ్యాహ్నం భోజనం చేస్తాం. సాయంత్రం ఆడుకుంటాం. రాత్రి నిద్రపోతాం.'),
        photo('🌅', L('The sun rises in the morning. A new day begins!', 'ఉదయం సూర్యుడు ఉదయిస్తాడు. కొత్త రోజు మొదలు!')),
        p('Some jobs take a short time, like drinking water. Some take long, like a bus trip to Hyderabad.', 'కొన్ని పనులకు కొంచెం సమయం, నీళ్ళు తాగడం లాగా. కొన్నిటికి ఎక్కువ, హైదరాబాదుకు బస్సు ప్రయాణం లాగా.'),
        tip('Think: could I do it while counting to 10? Then it is quick.', 'ఆలోచించు: 10 లెక్కించేలోపు చేయగలనా? అయితే అది త్వరగా అవుతుంది.'),
      ],
      examples: [
        ex(L('When do we see the moon and stars?', 'చంద్రుడు, నక్షత్రాలు ఎప్పుడు కనిపిస్తాయి?'), [L('The sky is dark.', 'ఆకాశం చీకటిగా ఉంటుంది.')], L('At night', 'రాత్రి')),
        ex(L('Which takes longer: eating a banana or a school day?', 'దేనికి ఎక్కువ సమయం: అరటి పండు తినడానికా, బడి రోజుకా?'), [L('A banana takes a few minutes.', 'అరటి పండుకు కొన్ని నిమిషాలు.'), L('School takes many hours.', 'బడికి చాలా గంటలు.')], L('A school day', 'బడి రోజు')),
      ],
      practice: [
        bank('when', [
          [L('When do you brush your teeth after waking up?', 'లేచిన తర్వాత పళ్ళు ఎప్పుడు తోముకుంటావు?'), L('Morning', 'ఉదయం'), [L('Afternoon', 'మధ్యాహ్నం'), L('Night', 'రాత్రి')], L('It is the first thing you do.', 'నువ్వు చేసే మొదటి పని.'), L('We brush our teeth in the morning.', 'ఉదయం పళ్ళు తోముకుంటాం.'), L('We wake up in the morning.', 'మనం ఉదయం లేస్తాం.')],
          [L('When do we see the moon?', 'చంద్రుడు ఎప్పుడు కనిపిస్తాడు?'), L('Night', 'రాత్రి'), [L('Morning', 'ఉదయం'), L('Afternoon', 'మధ్యాహ్నం')], L('The sky is dark.', 'ఆకాశం చీకటిగా ఉంటుంది.'), L('We see the moon at night.', 'రాత్రి చంద్రుడు కనిపిస్తాడు.'), L('The moon shines in the dark sky.', 'చంద్రుడు చీకటి ఆకాశంలో మెరుస్తాడు.')],
          [L('When do we eat lunch at school?', 'బడిలో మధ్యాహ్న భోజనం ఎప్పుడు?'), L('Afternoon', 'మధ్యాహ్నం'), [L('Morning', 'ఉదయం'), L('Night', 'రాత్రి')], L('Lunch is in the middle of the day.', 'భోజనం రోజు మధ్యలో.'), L('Lunch is in the afternoon.', 'భోజనం మధ్యాహ్నం.'), L('Lunch is in the middle of the school day.', 'బడి రోజు మధ్యలో భోజనం.')],
          [L('Which takes longer?', 'దేనికి ఎక్కువ సమయం పడుతుంది?'), L('Bus trip to Hyderabad', 'హైదరాబాదుకు బస్సు ప్రయాణం'), [L('Drinking water', 'నీళ్ళు తాగడం'), L('Clapping hands', 'చప్పట్లు కొట్టడం')], L('Which one takes hours?', 'దేనికి గంటలు పడుతుంది?'), L('A bus trip takes hours.', 'బస్సు ప్రయాణానికి గంటలు పడతాయి.'), L('That takes only a moment.', 'దానికి క్షణమే.')],
          [L('Which takes less time?', 'దేనికి తక్కువ సమయం పడుతుంది?'), L('Wearing slippers', 'చెప్పులు వేసుకోవడం'), [L('A cricket match', 'క్రికెట్ మ్యాచ్'), L('A school day', 'బడి రోజు')], L('Which one is done in a few seconds?', 'ఏది కొన్ని క్షణాల్లో అయిపోతుంది?'), L('Wearing slippers is very quick.', 'చెప్పులు వేసుకోవడం చాలా త్వరగా అవుతుంది.'), L('That takes hours.', 'దానికి గంటలు పడతాయి.')],
          [L('Which takes longer?', 'దేనికి ఎక్కువ సమయం పడుతుంది?'), L('A mango tree to grow', 'మామిడి చెట్టు పెరగడానికి'), [L('Cooking rice', 'అన్నం వండటానికి'), L('Reading a story', 'కథ చదవడానికి')], L('Which one takes years?', 'దేనికి సంవత్సరాలు పడుతుంది?'), L('A tree takes years to grow.', 'చెట్టు పెరగడానికి సంవత్సరాలు.'), L('That is done in a day.', 'అది ఒక రోజులో అవుతుంది.')],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 18
const rs = (n: number) => `₹${n}`;
const ch18: USpec = {
  id: 'ts2.ma.ch18', subject: 'math', title: L('Money', 'డబ్బు'), source: src(18),
  objectives: [
    {
      id: 'ts2.ma.money.coins', title: L('Counting coins', 'నాణేలు లెక్కించడం'),
      intro: [
        h('Our coins', 'మన నాణేలు'),
        p('We have coins of ₹1, ₹2, ₹5 and ₹10.', 'మన దగ్గర ₹1, ₹2, ₹5, ₹10 నాణేలు ఉన్నాయి.'),
        photo('🪙', L('Rupee coins. Read the number on each coin.', 'రూపాయి నాణేలు. ప్రతి నాణెంపై సంఖ్య చదువు.')),
        vis({ kind: 'coins', rupees: [10, 5, 2, 1] }, '₹10, ₹5, ₹2 and ₹1 make ₹18', '₹10, ₹5, ₹2, ₹1 కలిపి ₹18'),
        p('To find the total, start with the biggest coin and count on.', 'మొత్తం కనుక్కోవడానికి పెద్ద నాణెంతో మొదలుపెట్టి ముందుకు లెక్కించు.'),
        tip('Count the value, not the number of coins! Three coins can make ₹17.', 'నాణేల సంఖ్య కాదు, విలువ లెక్కించు! మూడు నాణేలు ₹17 కావచ్చు.'),
      ],
      examples: [
        ex(L('How much money? ₹10, ₹5, ₹2', 'ఎంత డబ్బు? ₹10, ₹5, ₹2'), [L('Start at 10.', '10 దగ్గర మొదలు.'), L('10 + 5 = 15, 15 + 2 = 17', '10 + 5 = 15, 15 + 2 = 17')], same('₹17'), { kind: 'coins', rupees: [10, 5, 2] }),
        ex(L('How many ₹2 coins make ₹10?', '₹10 కు ఎన్ని ₹2 నాణేలు?'), [L('Count in 2s: 2, 4, 6, 8, 10.', 'రెండేసి: 2, 4, 6, 8, 10.')], L('5 coins', '5 నాణేలు')),
      ],
      practice: [
        tp('total', (r) => {
          const k = r.int(2, 5), coins = Array.from({ length: k }, () => r.pick([1, 2, 5, 10])).sort((a, b) => b - a), s = coins.reduce((a, b) => a + b, 0);
          return typed(L('How much money is there in all? (in ₹)', 'మొత్తం ఎంత డబ్బు ఉంది? (₹ లో)'), num(s),
            [L('Start with the biggest coin.', 'పెద్ద నాణెంతో మొదలుపెట్టు.'), L(`${coins.map(rs).join(' + ')}`, `${coins.map(rs).join(' + ')}`)],
            [L(`${coins.map(rs).join(' + ')} = ₹${s}`, `${coins.map(rs).join(' + ')} = ₹${s}`)],
            s !== k ? [[String(k), L('That is the number of coins. Add their values.', 'అది నాణేల సంఖ్య. వాటి విలువలు కలుపు.')]] : [],
            { visual: { kind: 'coins', rupees: coins } });
        }),
        tp('howmany', (r) => {
          const c = r.pick([2, 5, 10]), k = r.int(2, 6), tot = c * k;
          return typed(L(`How many ₹${c} coins make ₹${tot}?`, `₹${tot} కు ఎన్ని ₹${c} నాణేలు?`), num(k),
            [L(`Count in ${c}s until you reach ${tot}.`, `${tot} వచ్చే వరకు ${c} చొప్పున లెక్కించు.`)],
            [L(`${range(1, k).map((i) => i * c).join(', ')} → ${k} coins`, `${range(1, k).map((i) => i * c).join(', ')} → ${k} నాణేలు`)],
            [[String(tot), L('That is the money. How many coins is it?', 'అది డబ్బు. ఎన్ని నాణేలో చెప్పు.')]]);
        }),
      ],
    },
    {
      id: 'ts2.ma.money.shop', title: L('Shopping: total and change', 'కొనుగోలు: మొత్తం, చిల్లర'), prereqs: ['ts2.ma.money.coins', 'ts2.ma.sub.take'],
      intro: [
        h('Let us go to the shop', 'దుకాణానికి వెళ్దాం'),
        p('A pencil costs ₹5. An eraser costs ₹3. Together they cost ₹8.', 'పెన్సిల్ ₹5. రబ్బరు ₹3. రెండూ కలిపి ₹8.'),
        p('You pay ₹10. The shopkeeper gives back ₹10 − ₹8 = ₹2. That is your change.', 'నువ్వు ₹10 ఇచ్చావు. దుకాణదారుడు ₹10 − ₹8 = ₹2 తిరిగి ఇస్తాడు. అదే చిల్లర.'),
        photo('🛒', L('Buying vegetables at the weekly santha (market).', 'వారపు సంతలో కూరగాయలు కొనడం.')),
        tip('Total: add the prices. Change: money given − total.', 'మొత్తం: ధరలు కలుపు. చిల్లర: ఇచ్చిన డబ్బు − మొత్తం.'),
      ],
      examples: [
        ex(L('A notebook costs ₹15 and a pen costs ₹10. What is the total?', 'నోటు పుస్తకం ₹15, పెన్ ₹10. మొత్తం ఎంత?'), [L('15 + 10 = 25', '15 + 10 = 25')], same('₹25')),
        ex(L('Teja buys a ball for ₹13. He gives ₹20. How much change?', 'తేజ ₹13 కు బంతి కొన్నాడు. ₹20 ఇచ్చాడు. చిల్లర ఎంత?'), [L('20 − 13 = 7', '20 − 13 = 7')], same('₹7')),
      ],
      practice: [
        tp('total', (r) => {
          const items: [Lc, number][] = [[L('a pencil', 'పెన్సిల్'), 5], [L('an eraser', 'రబ్బరు'), 3], [L('a notebook', 'నోటు పుస్తకం'), 15], [L('a pen', 'పెన్'), 10], [L('a ball', 'బంతి'), 20], [L('a kite', 'గాలిపటం'), 12], [L('a balloon', 'బెలూన్'), 4], [L('a packet of biscuits', 'బిస్కెట్ ప్యాకెట్'), 10], [L('a banana', 'అరటి పండు'), 6]];
          const [a, b] = r.shuffle(items).slice(0, 2), s = a[1] + b[1];
          return typed(L(`${a[0].en[0].toUpperCase() + a[0].en.slice(1)} costs ₹${a[1]}. ${b[0].en[0].toUpperCase() + b[0].en.slice(1)} costs ₹${b[1]}. What is the total cost?`, `${te(a[0])} ధర ₹${a[1]}. ${te(b[0])} ధర ₹${b[1]}. మొత్తం ధర ఎంత?`), num(s),
            [L('Total means add the prices.', 'మొత్తం అంటే ధరలు కలుపు.')],
            [L(`₹${a[1]} + ₹${b[1]} = ₹${s}`, `₹${a[1]} + ₹${b[1]} = ₹${s}`)],
            [[String(Math.abs(a[1] - b[1])), L('You are buying both, so add.', 'రెండూ కొంటున్నావు, కలుపు.')]]);
        }),
        tp('change', (r) => {
          const pay = r.pick([10, 20, 50]), cost = r.int(Math.max(2, pay / 2 - 3), pay - 1), n1 = nm(r);
          const thing = r.pick([L('a toy car', 'బొమ్మ కారు'), L('a box of crayons', 'క్రేయాన్ల డబ్బా'), L('a storybook', 'కథల పుస్తకం'), L('some flowers', 'కొన్ని పువ్వులు'), L('a water bottle', 'నీళ్ళ సీసా')]);
          return typed(L(`${n1.en} buys ${thing.en} for ₹${cost} and pays with ₹${pay}. How much change?`, `${te(n1)} ₹${cost} కు ${te(thing)} కొని ₹${pay} ఇచ్చారు. చిల్లర ఎంత?`), num(pay - cost),
            [L('Change = money given − cost.', 'చిల్లర = ఇచ్చిన డబ్బు − ధర.'), L(`Count up from ${cost} to ${pay}.`, `${cost} నుండి ${pay} వరకు ముందుకు లెక్కించు.`)],
            [L(`₹${pay} − ₹${cost} = ₹${pay - cost}`, `₹${pay} − ₹${cost} = ₹${pay - cost}`)],
            [[String(pay + cost), L('The shopkeeper gives back money, so subtract.', 'దుకాణదారుడు డబ్బు తిరిగి ఇస్తాడు, తీసివేయి.')]],
            { visual: { kind: 'coins', rupees: [pay] } });
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 19
const SH: { s: 'circle' | 'square' | 'triangle' | 'rectangle' | 'oval'; n: Lc; sides: number }[] = [
  { s: 'circle', n: L('Circle', 'వృత్తం'), sides: 0 }, { s: 'square', n: L('Square', 'చతురస్రం'), sides: 4 }, { s: 'triangle', n: L('Triangle', 'త్రిభుజం'), sides: 3 },
  { s: 'rectangle', n: L('Rectangle', 'దీర్ఘచతురస్రం'), sides: 4 }, { s: 'oval', n: L('Oval', 'అండాకారం'), sides: 0 },
];
const ch19: USpec = {
  id: 'ts2.ma.ch19', subject: 'math', title: L('Shapes', 'ఆకారాలు'), source: src(19),
  objectives: [
    {
      id: 'ts2.ma.shp.flat', title: L('Flat shapes: sides and corners', 'చదునైన ఆకారాలు: భుజాలు, మూలలు'),
      activities: ['game:shapes'],
      intro: [
        h('Shapes on paper', 'కాగితంపై ఆకారాలు'),
        p('A triangle has 3 sides and 3 corners. A square has 4 equal sides.', 'త్రిభుజానికి 3 భుజాలు, 3 మూలలు. చతురస్రానికి 4 సమాన భుజాలు.'),
        p('A rectangle has 4 sides: 2 long and 2 short. A circle is round. It has no corners.', 'దీర్ఘచతురస్రానికి 4 భుజాలు: 2 పొడవు, 2 పొట్టి. వృత్తం గుండ్రంగా ఉంటుంది. మూలలు లేవు.'),
        vis({ kind: 'shape', shape: 'triangle' }, 'A triangle', 'త్రిభుజం'),
        vis({ kind: 'shape', shape: 'rectangle' }, 'A rectangle', 'దీర్ఘచతురస్రం'),
        photo('🚪', L('A door is a rectangle. A bangle is a circle.', 'తలుపు దీర్ఘచతురస్రం. గాజు వృత్తం.')),
        tip('Run your finger along the edges and count the sides.', 'అంచుల వెంట వేలు జరుపుతూ భుజాలు లెక్కించు.'),
      ],
      examples: [
        ex(L('What shape is this?', 'ఇది ఏ ఆకారం?'), [L('3 sides and 3 corners.', '3 భుజాలు, 3 మూలలు.')], L('Triangle', 'త్రిభుజం'), { kind: 'shape', shape: 'triangle' }),
        ex(L('How many corners does a square have?', 'చతురస్రానికి ఎన్ని మూలలు?'), [L('Count each pointed corner: 1, 2, 3, 4.', 'ప్రతి మూల లెక్కించు: 1, 2, 3, 4.')], same('4'), { kind: 'shape', shape: 'square' }),
      ],
      practice: [
        tp('name', (r) => {
          const x = r.pick(SH);
          return mcq(r, L('What is the name of this shape?', 'ఈ ఆకారం పేరు ఏమిటి?'), x.n, SH.filter((y) => y.s !== x.s).map((y) => y.n),
            [x.sides ? L('Count its sides.', 'దాని భుజాలు లెక్కించు.') : L('Does it have any corners?', 'దానికి మూలలు ఉన్నాయా?')],
            [L(`This is a ${x.n.en.toLowerCase()}.`, `ఇది ${te(x.n)}.`)],
            [['wrong', x.s === 'rectangle' ? L('A square has 4 equal sides; this one has 2 long and 2 short sides.', 'చతురస్రానికి 4 సమాన భుజాలు; దీనికి 2 పొడవు, 2 పొట్టి.') : L('Count the sides and corners again.', 'భుజాలు, మూలలు మళ్ళీ లెక్కించు.')]],
            { visual: { kind: 'shape', shape: x.s } });
        }),
        tp('sides', (r) => {
          const x = r.pick(SH.concat([{ s: 'triangle', n: L('Triangle', 'త్రిభుజం'), sides: 3 }])), corners = r.int(0, 1) === 1;
          return typed(corners ? L(`How many corners does a ${x.n.en.toLowerCase()} have?`, `${te(x.n)}కు ఎన్ని మూలలు?`) : L(`How many sides does a ${x.n.en.toLowerCase()} have? (0 if it has no straight sides)`, `${te(x.n)}కు ఎన్ని భుజాలు? (నేరు భుజాలు లేకపోతే 0)`), num(x.sides),
            [L('Touch each one as you count.', 'లెక్కిస్తూ ప్రతి దాన్ని తాకు.'), L('Round shapes have no corners and no straight sides.', 'గుండ్రటి ఆకారాలకు మూలలు, నేరు భుజాలు ఉండవు.')],
            [L(`A ${x.n.en.toLowerCase()} has ${x.sides} ${corners ? 'corners' : 'sides'}.`, `${te(x.n)}కు ${x.sides} ${corners ? 'మూలలు' : 'భుజాలు'}.`)],
            [['wrong-value', L('Count slowly, one at a time.', 'నెమ్మదిగా ఒక్కొక్కటి లెక్కించు.')]],
            { visual: { kind: 'shape', shape: x.s } });
        }),
      ],
    },
    {
      id: 'ts2.ma.shp.solid', title: L('Solid shapes around us', 'మన చుట్టూ ఘన ఆకారాలు'),
      intro: [
        h('Shapes you can hold', 'పట్టుకోగల ఆకారాలు'),
        p('A ball is a sphere. A dice is a cube. A brick is a cuboid.', 'బంతి గోళం. పాచిక ఘనం. ఇటుక దీర్ఘఘనం.'),
        p('A tin is a cylinder. A birthday cap is a cone.', 'డబ్బా స్తూపం. పుట్టినరోజు టోపీ శంకువు.'),
        photo('🎲', L('A dice is a cube. All its faces are squares.', 'పాచిక ఘనం. దాని ముఖాలన్నీ చతురస్రాలు.')),
        vis(row('⚽ sphere · 🎲 cube · 🧱 cuboid · 🥫 cylinder'), 'Ball, dice, brick and tin', 'బంతి, పాచిక, ఇటుక, డబ్బా'),
        tip('A sphere rolls. A cube slides. A cylinder can do both!', 'గోళం దొర్లుతుంది. ఘనం జారుతుంది. స్తూపం రెండూ చేస్తుంది!'),
      ],
      examples: [
        ex(L('What shape is a laddoo?', 'లడ్డూ ఏ ఆకారం?'), [L('It is round all over like a ball.', 'బంతిలా అంతటా గుండ్రంగా ఉంటుంది.')], L('Sphere', 'గోళం')),
        ex(L('What shape is a matchbox?', 'అగ్గిపెట్టె ఏ ఆకారం?'), [L('It is like a small brick.', 'చిన్న ఇటుక లాంటిది.')], L('Cuboid', 'దీర్ఘఘనం')),
      ],
      practice: [
        bank('solid', [
          [L('What shape is a football?', 'ఫుట్‌బాల్ ఏ ఆకారం?'), L('Sphere', 'గోళం'), [L('Cube', 'ఘనం'), L('Cone', 'శంకువు')], L('It is round all over.', 'అంతటా గుండ్రం.'), L('A football is a sphere.', 'ఫుట్‌బాల్ గోళం.'), L('It has no flat faces.', 'దానికి చదునైన ముఖాలు లేవు.'), row('⚽')],
          [L('What shape is a dice?', 'పాచిక ఏ ఆకారం?'), L('Cube', 'ఘనం'), [L('Sphere', 'గోళం'), L('Cylinder', 'స్తూపం')], L('All faces are equal squares.', 'అన్ని ముఖాలు సమాన చతురస్రాలు.'), L('A dice is a cube.', 'పాచిక ఘనం.'), L('Equal square faces make a cube.', 'సమాన చతురస్ర ముఖాలు ఘనం.'), row('🎲')],
          [L('What shape is a brick?', 'ఇటుక ఏ ఆకారం?'), L('Cuboid', 'దీర్ఘఘనం'), [L('Cone', 'శంకువు'), L('Sphere', 'గోళం')], L('It has rectangle faces.', 'దానికి దీర్ఘచతురస్ర ముఖాలు.'), L('A brick is a cuboid.', 'ఇటుక దీర్ఘఘనం.'), L('A brick is long like a box.', 'ఇటుక పెట్టెలా పొడవు.'), row('🧱')],
          [L('What shape is a tin of oil?', 'నూనె డబ్బా ఏ ఆకారం?'), L('Cylinder', 'స్తూపం'), [L('Cube', 'ఘనం'), L('Cone', 'శంకువు')], L('Round on top, straight on the side.', 'పైన గుండ్రం, పక్కన నిటారు.'), L('A tin is a cylinder.', 'డబ్బా స్తూపం.'), L('It has two round flat ends.', 'దానికి రెండు గుండ్రటి చదునైన చివరలు.'), row('🥫')],
          [L('What shape is an ice-cream cone?', 'ఐస్‌క్రీమ్ కోన్ ఏ ఆకారం?'), L('Cone', 'శంకువు'), [L('Cylinder', 'స్తూపం'), L('Cuboid', 'దీర్ఘఘనం')], L('It has a pointed tip.', 'దానికి మొన ఉంది.'), L('It is a cone.', 'అది శంకువు.'), L('A cone comes to a point.', 'శంకువుకు మొన ఉంటుంది.')],
          [L('What shape is a gift box?', 'బహుమతి పెట్టె ఏ ఆకారం?'), L('Cuboid', 'దీర్ఘఘనం'), [L('Sphere', 'గోళం'), L('Cone', 'శంకువు')], L('It has flat rectangle faces.', 'దానికి చదునైన దీర్ఘచతురస్ర ముఖాలు.'), L('A gift box is a cuboid.', 'బహుమతి పెట్టె దీర్ఘఘనం.'), L('A box has flat faces and corners.', 'పెట్టెకు చదునైన ముఖాలు, మూలలు.'), row('🎁')],
        ]),
      ],
    },
    {
      id: 'ts2.ma.shp.pattern', title: L('Patterns', 'నమూనాలు'),
      activities: ['game:patterns'],
      intro: [
        h('What comes next?', 'తర్వాత ఏది?'),
        p('A pattern repeats again and again.', 'నమూనా మళ్ళీ మళ్ళీ వస్తుంది.'),
        photo('🌼', L('A Bathukamma is made with rows of flowers in a pattern.', 'బతుకమ్మను పువ్వుల వరుసలతో ఒక నమూనాలో పేరుస్తారు.')),
        vis(row('🌼🌸🌼🌸🌼🌸'), 'Yellow flower, pink flower, again and again', 'పసుపు పువ్వు, గులాబీ పువ్వు, మళ్ళీ మళ్ళీ'),
        p('Numbers can make patterns too: 5, 10, 15, 20 …', 'సంఖ్యలూ నమూనాలు చేస్తాయి: 5, 10, 15, 20 …'),
        tip('Find the part that repeats. Say it aloud!', 'మళ్ళీ వచ్చే భాగం వెతుకు. గట్టిగా చెప్పు!'),
      ],
      examples: [
        ex(L('🍎🍌🍎🍌🍎 ? What comes next?', '🍎🍌🍎🍌🍎 ? తర్వాత ఏది?'), [L('Apple, banana repeats.', 'ఆపిల్, అరటి మళ్ళీ వస్తాయి.')], same('🍌')),
        ex(L('2, 4, 6, 8, ? What comes next?', '2, 4, 6, 8, ? తర్వాత ఏది?'), [L('Add 2 each time.', 'ప్రతిసారి 2 కలుపు.')], same('10')),
      ],
      practice: [
        tp('next', (r) => {
          const pool = ['🌼', '🌸', '🍎', '🍌', '⭐', '🎈', '🪁', '🐟'];
          const [a, b, c] = r.shuffle(pool);
          const unit = r.pick([[a, b], [a, a, b], [a, b, c], [a, b, b]]);
          const len = r.int(unit.length + 2, unit.length * 2 + 1), seq = range(0, len - 1).map((i) => unit[i % unit.length]), ans = unit[len % unit.length];
          return mcq(r, L(`What comes next? ${seq.join(' ')} ?`, `తర్వాత ఏది? ${seq.join(' ')} ?`), same(ans), [a, b, c].filter((x) => x !== ans).map(same),
            [L('Find the part that repeats.', 'మళ్ళీ వచ్చే భాగం వెతుకు.')],
            [L(`The pattern is ${unit.join(' ')}. Next is ${ans}.`, `నమూనా ${unit.join(' ')}. తర్వాత ${ans}.`)],
            [['wrong', L('Say the pattern aloud from the start and continue it.', 'మొదటి నుండి నమూనా గట్టిగా చెప్పి కొనసాగించు.')]]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 20
const tally = (n: number) => [...Array(Math.floor(n / 5)).fill('卌'), n % 5 ? '|'.repeat(n % 5) : ''].filter(Boolean).join(' ');
const FRUITS: { e: string; n: Lc }[] = [{ e: '🥭', n: L('mango', 'మామిడి') }, { e: '🍌', n: L('banana', 'అరటి') }, { e: '🍎', n: L('apple', 'ఆపిల్') }, { e: '🍇', n: L('grapes', 'ద్రాక్ష') }, { e: '🍉', n: L('watermelon', 'పుచ్చకాయ') }, { e: '🍊', n: L('orange', 'నారింజ') }];
const ch20: USpec = {
  id: 'ts2.ma.ch20', subject: 'math', title: L('Let Us Record', 'నమోదు చేద్దాం'), source: src(20),
  objectives: [
    {
      id: 'ts2.ma.data.tally', title: L('Counting with tally marks', 'టాలీ గుర్తులతో లెక్కించడం'),
      intro: [
        h('Quick lines for counting', 'లెక్కకు త్వరిత గీతలు'),
        p('Draw one line | for each thing. The fifth line goes across the four: 卌.', 'ప్రతి వస్తువుకు ఒక గీత | గీయి. ఐదో గీత నాలుగింటి మీదుగా అడ్డంగా: 卌.'),
        p('So 卌 means 5. 卌 卌 means 10. 卌 || means 7.', 'కాబట్టి 卌 అంటే 5. 卌 卌 అంటే 10. 卌 || అంటే 7.'),
        photo('🐦', L('Count birds on a wire. Make a tally mark for each bird.', 'తీగపై పక్షులను లెక్కించు. ప్రతి పక్షికి ఒక టాలీ గుర్తు.')),
        vis(row('卌 卌 |||'), 'Tally marks for 13', '13 కి టాలీ గుర్తులు'),
        tip('Count the bundles of 5 first: 5, 10, 15 … then the single lines.', 'ముందు 5 కట్టలు: 5, 10, 15 … తర్వాత ఒంటి గీతలు.'),
      ],
      examples: [
        ex(L('What number is 卌 ||||?', '卌 |||| ఏ సంఖ్య?'), [L('卌 = 5', '卌 = 5'), L('5 + 4 = 9', '5 + 4 = 9')], same('9')),
        ex(L('Show 12 with tally marks.', '12 ను టాలీ గుర్తులతో చూపించు.'), [L('12 = 5 + 5 + 2', '12 = 5 + 5 + 2')], same('卌 卌 ||')),
      ],
      practice: [
        tp('read', (r) => {
          const n = r.int(3, 23);
          return typed(L(`How many do these tally marks show? ${tally(n)}`, `ఈ టాలీ గుర్తులు ఎంత చూపిస్తాయి? ${tally(n)}`), num(n),
            [L('Each 卌 is 5.', 'ప్రతి 卌 = 5.'), L('Count the 5s, then add the single lines.', '5 లు లెక్కించి, ఒంటి గీతలు కలుపు.')],
            [L(`${Math.floor(n / 5)} fives and ${n % 5} ones: ${n}`, `${Math.floor(n / 5)} ఐదులు, ${n % 5} ఒకట్లు: ${n}`)],
            n >= 5 ? [[String(Math.floor(n / 5) * 4 + n % 5), L('The crossed line is the fifth one. Each 卌 is 5, not 4.', 'అడ్డ గీత ఐదవది. ప్రతి 卌 = 5, 4 కాదు.')]] : []);
        }),
        tp('make', (r) => {
          const n = r.int(4, 18);
          return mcq(r, L(`Which tally shows ${n}?`, `${n} ని చూపించే టాలీ ఏది?`), same(tally(n)), [same(tally(n + 1)), same(tally(n - 1)), same(tally(n + 5))],
            [L(`${n} = ${Math.floor(n / 5)} fives and ${n % 5} more.`, `${n} = ${Math.floor(n / 5)} ఐదులు, ఇంకా ${n % 5}.`)],
            [L(`${n} is ${tally(n)}`, `${n} = ${tally(n)}`)],
            [['wrong', L('Count each tally: 卌 is 5, each | is 1.', 'ప్రతి టాలీ లెక్కించు: 卌 = 5, | = 1.')]]);
        }),
      ],
    },
    {
      id: 'ts2.ma.data.graph', title: L('Reading a picture graph', 'చిత్ర గ్రాఫ్ చదవడం'), prereqs: ['ts2.ma.data.tally'],
      intro: [
        h('Pictures that tell a story', 'కథ చెప్పే బొమ్మలు'),
        p('Class 2 children chose their favourite fruit. We drew one bar for each fruit.', '2వ తరగతి పిల్లలు ఇష్టమైన పండు ఎంచుకున్నారు. ప్రతి పండుకు ఒక పట్టీ గీశాం.'),
        vis({ kind: 'bar-graph', labels: ['🥭', '🍌', '🍎', '🍇'], values: [9, 5, 4, 6] }, 'Favourite fruits: mango 9, banana 5, apple 4, grapes 6', 'ఇష్టమైన పండ్లు: మామిడి 9, అరటి 5, ఆపిల్ 4, ద్రాక్ష 6'),
        photo('🥭', L('Mango is the favourite! The tallest bar shows the most.', 'మామిడి అందరికీ ఇష్టం! ఎత్తైన పట్టీ ఎక్కువను చూపిస్తుంది.')),
        tip('Tallest bar = most. Shortest bar = fewest.', 'ఎత్తైన పట్టీ = ఎక్కువ. పొట్టి పట్టీ = తక్కువ.'),
      ],
      examples: [
        ex(L('In the graph, how many children like grapes?', 'గ్రాఫ్‌లో ఎంత మంది పిల్లలకు ద్రాక్ష ఇష్టం?'), [L('Find the grapes bar.', 'ద్రాక్ష పట్టీ వెతుకు.'), L('It reaches 6.', 'అది 6 వరకు ఉంది.')], same('6'), { kind: 'bar-graph', labels: ['🥭', '🍌', '🍎', '🍇'], values: [9, 5, 4, 6] }),
        ex(L('How many more like mango than banana?', 'అరటి కంటే మామిడి ఎంత మందికి ఎక్కువ ఇష్టం?'), [L('Mango 9, banana 5.', 'మామిడి 9, అరటి 5.'), L('9 − 5 = 4', '9 − 5 = 4')], same('4')),
      ],
      practice: [
        tp('read', (r) => {
          const fs = r.shuffle(FRUITS).slice(0, 4), vals = r.shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
          const kind = r.pick(['count', 'most', 'least', 'diff'] as const), i = r.int(0, 3), j = (i + 1 + r.int(0, 2)) % 4;
          const visual: VisualSpec = { kind: 'bar-graph', labels: fs.map((f) => f.e), values: vals };
          if (kind === 'most' || kind === 'least') {
            const k = vals.indexOf(kind === 'most' ? Math.max(...vals) : Math.min(...vals));
            return mcq(r, kind === 'most' ? L('Which fruit do the most children like?', 'ఎక్కువ మంది పిల్లలకు ఇష్టమైన పండు ఏది?') : L('Which fruit do the fewest children like?', 'తక్కువ మంది పిల్లలకు ఇష్టమైన పండు ఏది?'), L(`${fs[k].e} ${fs[k].n.en}`, `${fs[k].e} ${te(fs[k].n)}`), fs.filter((_, x) => x !== k).map((f) => L(`${f.e} ${f.n.en}`, `${f.e} ${te(f.n)}`)),
              [kind === 'most' ? L('Find the tallest bar.', 'ఎత్తైన పట్టీ వెతుకు.') : L('Find the shortest bar.', 'పొట్టి పట్టీ వెతుకు.')],
              [L(`${fs[k].n.en}: ${vals[k]} children.`, `${te(fs[k].n)}: ${vals[k]} మంది.`)],
              [['wrong', L('Compare the heights of all the bars.', 'అన్ని పట్టీల ఎత్తులు పోల్చు.')]], { visual });
          }
          if (kind === 'count') {
            return typed(L(`How many children like ${fs[i].e} ${fs[i].n.en}?`, `ఎంత మంది పిల్లలకు ${fs[i].e} ${te(fs[i].n)} ఇష్టం?`), num(vals[i]),
              [L('Find that bar and read where it ends.', 'ఆ పట్టీ వెతికి ఎక్కడ ముగుస్తుందో చదువు.')],
              [L(`The bar reaches ${vals[i]}.`, `పట్టీ ${vals[i]} వరకు ఉంది.`)], [['wrong-value', L('Look at the correct fruit\'s bar.', 'సరైన పండు పట్టీ చూడు.')]], { visual });
          }
          const [a, b] = vals[i] >= vals[j] ? [i, j] : [j, i];
          return typed(L(`How many more children like ${fs[a].e} ${fs[a].n.en} than ${fs[b].e} ${fs[b].n.en}?`, `${fs[b].e} ${te(fs[b].n)} కంటే ${fs[a].e} ${te(fs[a].n)} ఎంత మందికి ఎక్కువ ఇష్టం?`), num(vals[a] - vals[b]),
            [L('Read both bars. Subtract.', 'రెండు పట్టీలు చదివి తీసివేయి.')],
            [L(`${vals[a]} − ${vals[b]} = ${vals[a] - vals[b]}`, `${vals[a]} − ${vals[b]} = ${vals[a] - vals[b]}`)],
            [[String(vals[a] + vals[b]), L('How many more means subtract.', 'ఎంత ఎక్కువ అంటే తీసివేయి.')]], { visual });
        }, 2),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16, ch17, ch18, ch19, ch20];
