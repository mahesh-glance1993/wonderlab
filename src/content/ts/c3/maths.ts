// Telangana SCERT Class 3 — maths. Original teaching aligned to the official chapter list (src/content/ts/books.ts).
// One unit per textbook chapter (ids ts3.ma.ch<n>); objectives ts3.ma.<topic>.<skill>.
// Written for an 8-year-old: short sentences, things from home and school in Telangana, pictures first.
// Every learner-facing string is bilingual {en, te} (Telugu needs native-speaker review).
// Templates use only the Rng they are given.
import {
  tp, ex, p, h, tip, vis, keys, remember, photo, explore, L, num, choose, chooseNum, ordering, tapAll, matching,
  NAMES, THINGS, type USpec, type QSpec, type TSpec,
} from '../../lib/kit';
import type { AnswerSpec, Rng } from '../../../shared/grading';
import type { Block, Localized, VisualSpec } from '../../../shared/content';
import { tsSrc } from '../books';

// ------------------------------------------------------------------ helpers
type S = Localized;
const src = (ch: number) => tsSrc(3, 'maths', ch);
const nm = (r: Rng) => r.pick(NAMES);
/** same text in both languages (sums, numbers) */
const same = (s: string) => L(s, s);
type Mk = [when: string, explain: S][];
const mk = (m: Mk) => (m.length ? { mistakes: m.map(([when, explain]) => ({ when, explain })) } : {});
/** typed numeric item; mistake keys that happen to equal the true answer (or repeat) are dropped */
const typed = (prompt: S, answer: AnswerSpec, hints: S[], solution: S[], mistakes: Mk = [], extra: Partial<QSpec> = {}): QSpec => {
  const seen = new Set<string>();
  const ok = mistakes.filter(([w]) => !(answer.kind === 'number' && +w === answer.value) && !seen.has(w) && !!seen.add(w));
  return { type: 'typed', keypad: 'numeric', prompt, answer, hints, solution, ...mk(ok), ...extra };
};
const mcq = (r: Rng, prompt: S, correct: S, wrong: S[], hints: S[], solution: S[], mistakes: Mk = [], extra: Partial<QSpec> = {}): QSpec => ({
  type: 'mcq', prompt, ...choose(r, correct, wrong), hints, solution, ...mk(mistakes), ...extra,
});
const mcqN = (r: Rng, prompt: S, correct: number, wrong: number[], hints: S[], solution: S[], mistakes: Mk = [], extra: Partial<QSpec> = {}): QSpec => ({
  type: 'mcq', prompt, ...chooseNum(r, correct, wrong), hints, solution, ...mk(mistakes), ...extra,
});
/** concept bank entry: question, answer, wrong options, hints, solution, why-wrong, optional visual */
type B = [q: S, a: S, w: S[], hints: S[], sol: S, why: S, v?: VisualSpec];
/** a template drawing one question from a bank (needs >= 5 entries) */
const bank = (key: string, list: B[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, a, w, hints, sol, why, v] = r.pick(list);
  return mcq(r, q, a, w, hints, [sol], [['wrong', why]], v ? { visual: v } : {});
}, d);
/** tap-all template: picks 2–3 correct and 2–3 wrong items from the pools */
const tapT = (key: string, prompt: S, yes: S[], no: S[], hints: S[], why: S): TSpec => tp(key, (r) => {
  const y = r.shuffle(yes).slice(0, r.int(2, 3)), n = r.shuffle(no).slice(0, r.int(2, 3));
  return {
    type: 'tap', prompt, ...tapAll(r, [...y.map((label) => ({ label, ok: true })), ...n.map((label) => ({ label, ok: false }))]),
    hints, solution: [L(`Yes: ${y.map((x) => x.en).join(', ')}.`, `అవును: ${y.map((x) => x.te).join(', ')}.`), L(`No: ${n.map((x) => x.en).join(', ')}.`, `కాదు: ${n.map((x) => x.te).join(', ')}.`)],
    mistakes: [{ when: 'wrong', explain: why }],
  };
});
type Var = [sym: string, name: S, min: number, max: number, step: number, value: number, unit?: string];
interface XS { title: S; formula: string; result: [sym: string, name: S, expr: string, unit?: string]; vars: Var[]; notes: [sym: string, up: S, down: S][]; mistakes: [wrong: S, why: S][]; real: S }
/** "What if?" explorer: the child moves sliders and sees what changes. */
const X = (s: XS): Block => {
  const [rs, rn, re, ru] = s.result;
  return explore({
    title: s.title, formula: s.formula,
    result: ru ? { sym: rs, name: rn, expr: re, unit: ru, decimals: 0 } : { sym: rs, name: rn, expr: re, decimals: 0 },
    vars: s.vars.map(([sym, name, min, max, step, value, unit]) => (unit ? { sym, name, min, max, step, value, unit } : { sym, name, min, max, step, value })),
    notes: s.notes.map(([sym, up, down]) => ({ sym, up, down })),
    mistakes: s.mistakes.map(([wrong, why]) => ({ wrong, why })),
    realWorld: s.real,
  });
};

// number names
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ONES_TE = ['', 'ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది'];
const TEENS_TE = ['పది', 'పదకొండు', 'పన్నెండు', 'పదమూడు', 'పద్నాలుగు', 'పదిహేను', 'పదహారు', 'పదిహేడు', 'పద్దెనిమిది', 'పందొమ్మిది'];
const TENS_TE = ['', '', 'ఇరవై', 'ముప్పై', 'నలభై', 'యాభై', 'అరవై', 'డెబ్బై', 'ఎనభై', 'తొంభై'];
const w99 = (n: number) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''));
const w99te = (n: number) => (n < 10 ? ONES_TE[n] : n < 20 ? TEENS_TE[n - 10] : TENS_TE[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES_TE[n % 10] : ''));
/** 426 → "four hundred twenty-six" / "నాలుగు వందల ఇరవై ఆరు" */
const words = (n: number): S => {
  const hu = Math.floor(n / 100), rest = n % 100;
  const en = [hu ? `${ONES[hu]} hundred` : '', rest ? w99(rest) : ''].filter(Boolean).join(' ') || 'zero';
  let te: string;
  if (!hu) te = rest ? w99te(rest) : 'సున్నా';
  else if (hu === 1) te = rest ? `నూట ${w99te(rest)}` : 'వంద';
  else te = rest ? `${ONES_TE[hu]} వందల ${w99te(rest)}` : `${ONES_TE[hu]} వందలు`;
  return L(en, te);
};
const dg = (n: number) => String(n).padStart(3, '0').split('').map(Number);
/** column addition ignoring carries — a common slip */
const noCarry = (a: number, b: number) => { const x = dg(a), y = dg(b); return +x.map((d, i) => (d + y[i]) % 10).join(''); };
/** "take the smaller digit from the bigger" slip */
const smallFromBig = (a: number, b: number) => { const x = dg(a), y = dg(b); return +x.map((d, i) => Math.abs(d - y[i])).join(''); };
const PLACE: S[] = [L('hundreds', 'వందలు'), L('tens', 'పదులు'), L('ones', 'ఒకట్లు')];

// ================================================================== CH 1 SHAPES AND SPATIAL UNDERSTANDING
const SH2: Record<string, S> = {
  circle: L('Circle', 'వృత్తం'), square: L('Square', 'చతురస్రం'), rectangle: L('Rectangle', 'దీర్ఘచతురస్రం'), triangle: L('Triangle', 'త్రిభుజం'),
};
const SH2W = (a: string) => Object.keys(SH2).filter((k) => k !== a).map((k) => SH2[k]);
const VIEWS: [obj: S, side: 'top' | 'front' | 'side', ans: keyof typeof SH2][] = [
  [L('a steel glass', 'స్టీలు గ్లాసు'), 'top', 'circle'], [L('a steel glass', 'స్టీలు గ్లాసు'), 'front', 'rectangle'],
  [L('a dice', 'పాచిక'), 'top', 'square'], [L('a matchbox lying flat', 'బల్లపై పడుకున్న అగ్గిపెట్టె'), 'top', 'rectangle'],
  [L('a ball', 'బంతి'), 'side', 'circle'], [L('a birthday cap', 'పుట్టినరోజు టోపీ'), 'side', 'triangle'],
  [L('a bucket', 'బకెట్'), 'top', 'circle'], [L('a brick', 'ఇటుక'), 'front', 'rectangle'], [L('a tent', 'గుడారం'), 'front', 'triangle'],
  [L('a gas cylinder', 'గ్యాస్ సిలిండర్'), 'top', 'circle'], [L('a carrom board', 'క్యారమ్ బోర్డు'), 'top', 'square'],
];
const SIDE_TE = { top: 'పై నుండి', front: 'ముందు నుండి', side: 'పక్క నుండి' };
const SOLIDS: { name: S; objs: S[]; faces: number; rolls: boolean }[] = [
  { name: L('Sphere', 'గోళం'), objs: [L('ball', 'బంతి'), L('laddoo', 'లడ్డూ'), L('orange', 'నారింజ'), L('marble', 'గోలీ')], faces: 0, rolls: true },
  { name: L('Cube', 'ఘనం'), objs: [L('dice', 'పాచిక'), L('sugar cube', 'చక్కెర ముక్క'), L('square gift box', 'చతురస్రపు బహుమతి పెట్టె')], faces: 6, rolls: false },
  { name: L('Cylinder', 'స్థూపం'), objs: [L('oil tin', 'నూనె డబ్బా'), L('candle', 'కొవ్వొత్తి'), L('water pipe', 'నీటి పైపు'), L('gas cylinder', 'గ్యాస్ సిలిండర్')], faces: 2, rolls: true },
  { name: L('Cone', 'శంఖువు'), objs: [L('birthday cap', 'పుట్టినరోజు టోపీ'), L('ice-cream cone', 'ఐస్‌క్రీమ్ కోన్'), L('funnel', 'గరాటు')], faces: 1, rolls: true },
  { name: L('Cuboid', 'దీర్ఘఘనం'), objs: [L('brick', 'ఇటుక'), L('matchbox', 'అగ్గిపెట్టె'), L('book', 'పుస్తకం'), L('lunch box', 'టిఫిన్ బాక్స్')], faces: 6, rolls: false },
];
const FLAT: { k: 'triangle' | 'square' | 'rectangle' | 'pentagon' | 'hexagon' | 'circle'; name: S; n: number }[] = [
  { k: 'triangle', name: L('triangle', 'త్రిభుజం'), n: 3 }, { k: 'square', name: L('square', 'చతురస్రం'), n: 4 },
  { k: 'rectangle', name: L('rectangle', 'దీర్ఘచతురస్రం'), n: 4 }, { k: 'pentagon', name: L('pentagon', 'పంచభుజి'), n: 5 },
  { k: 'hexagon', name: L('hexagon', 'షడ్భుజి'), n: 6 }, { k: 'circle', name: L('circle', 'వృత్తం'), n: 0 },
];
const ch1: USpec = {
  id: 'ts3.ma.ch1', subject: 'math', title: L('Shapes and Spatial Understanding', 'ఆకారాలు - ప్రాదేశిక అవగాహన'), source: src(1),
  objectives: [
    {
      id: 'ts3.ma.shape.views', title: L('Top, front and side views', 'పై, ముందు, పక్క దృశ్యాలు'),
      intro: [
        h('One thing, many looks!', 'ఒకే వస్తువు, ఎన్నో రూపాలు!'),
        p('Put a steel glass on the table. Stand up and look down at it. You see a circle!', 'ఒక స్టీలు గ్లాసును బల్ల మీద పెట్టు. నిలబడి పై నుండి చూడు. నీకు ఒక వృత్తం కనిపిస్తుంది!'),
        p('Now bend down and look at it from the front. Now it looks like a rectangle.', 'ఇప్పుడు వంగి ముందు నుండి చూడు. ఇప్పుడు అది దీర్ఘచతురస్రంలా కనిపిస్తుంది.'),
        photo('🥛', L('From the top a glass looks round. From the front it looks like a rectangle.', 'పై నుండి గ్లాసు గుండ్రంగా ఉంటుంది. ముందు నుండి దీర్ఘచతురస్రంలా ఉంటుంది.')),
        vis({ kind: 'shape', shape: 'circle' }, 'Top view of a glass: a circle', 'గ్లాసు పై దృశ్యం: వృత్తం'),
        vis({ kind: 'shape', shape: 'rectangle' }, 'Front view of a glass: a rectangle', 'గ్లాసు ముందు దృశ్యం: దీర్ఘచతురస్రం'),
        keys(L('Top view: what a bird flying above sees.', 'పై దృశ్యం: పైన ఎగిరే పక్షికి కనిపించేది.'), L('Front view: what you see standing in front.', 'ముందు దృశ్యం: ఎదురుగా నిలబడితే కనిపించేది.'), L('Side view: what you see from the left or right.', 'పక్క దృశ్యం: ఎడమ లేదా కుడి వైపు నుండి కనిపించేది.')),
        remember('The same object can show a different shape from each side.', 'ఒకే వస్తువు ఒక్కో వైపు నుండి ఒక్కో ఆకారంలో కనిపించవచ్చు.'),
        tip('Close one eye and put your eye exactly at the top, front or side. Then draw what you see.', 'ఒక కన్ను మూసి, నీ కన్ను సరిగ్గా పైన, ముందు లేదా పక్కన పెట్టు. కనిపించిన దాన్ని గీయి.'),
      ],
      examples: [
        ex(L('What is the top view of a dice?', 'పాచిక పై దృశ్యం ఏమిటి?'), [L('Look straight down at the top face.', 'పై ముఖాన్ని సరిగ్గా కిందికి చూడు.'), L('The top face is a square.', 'పై ముఖం ఒక చతురస్రం.')], L('A square', 'చతురస్రం'), { kind: 'shape', shape: 'square' }),
        ex(L('What is the front view of a tent?', 'గుడారం ముందు దృశ్యం ఏమిటి?'), [L('From the front you see two slanting sides and the ground.', 'ముందు నుండి రెండు వాలు భుజాలు, నేల కనిపిస్తాయి.'), L('Three sides make a triangle.', 'మూడు భుజాలు కలిసి త్రిభుజం.')], L('A triangle', 'త్రిభుజం'), { kind: 'shape', shape: 'triangle' }),
      ],
      practice: [
        tp('view', (r) => {
          const [o, s, a] = r.pick(VIEWS);
          return mcq(r, L(`What shape do you see when you look at ${o.en} from the ${s}?`, `${o.te}ను ${SIDE_TE[s]} చూస్తే ఏ ఆకారం కనిపిస్తుంది?`), SH2[a], SH2W(a),
            [L(`Imagine your eye at the ${s}.`, `నీ కన్ను ${SIDE_TE[s]} ఉన్నట్టు ఊహించు.`), L('Only the outline facing your eye matters.', 'నీ కంటికి ఎదురుగా ఉన్న అంచు మాత్రమే లెక్క.')],
            [L(`From the ${s}, ${o.en} looks like a ${SH2[a].en.toLowerCase()}.`, `${SIDE_TE[s]} ${o.te} ${SH2[a].te}లా కనిపిస్తుంది.`)],
            [['wrong', L('Picture only the face that points at your eye. Try it with a real object!', 'నీ కంటి వైపు ఉన్న ముఖాన్నే ఊహించు. నిజమైన వస్తువుతో ప్రయత్నించు!')]]);
        }),
        bank('who', [
          [L('A crow sits on a tree above a school bus. Which view of the bus does it see?', 'బడి బస్సు పైన చెట్టు మీద కాకి కూర్చుంది. అది బస్సు ఏ దృశ్యాన్ని చూస్తుంది?'), L('Top view', 'పై దృశ్యం'), [L('Front view', 'ముందు దృశ్యం'), L('Side view', 'పక్క దృశ్యం')],
            [L('Where is the crow?', 'కాకి ఎక్కడ ఉంది?'), L('Above means looking down.', 'పైన అంటే కిందికి చూడటం.')], L('Looking down from above gives the top view.', 'పై నుండి కిందికి చూస్తే పై దృశ్యం.'), L('The crow is above the bus, not in front.', 'కాకి బస్సు పైన ఉంది, ముందు కాదు.')],
          [L('An auto driver sees the bus coming straight at him. Which view?', 'బస్సు నేరుగా తన వైపు వస్తుంటే ఆటో డ్రైవర్ ఏ దృశ్యం చూస్తాడు?'), L('Front view', 'ముందు దృశ్యం'), [L('Top view', 'పై దృశ్యం'), L('Side view', 'పక్క దృశ్యం')],
            [L('The bus faces him.', 'బస్సు అతనికి ఎదురుగా ఉంది.'), L('Facing you means front.', 'ఎదురుగా అంటే ముందు.')], L('He sees the front of the bus.', 'అతను బస్సు ముందు భాగం చూస్తాడు.'), L('The bus is coming towards him, so he sees its front.', 'బస్సు అతని వైపు వస్తోంది, కాబట్టి ముందు భాగం కనిపిస్తుంది.')],
          [L('You stand on the footpath as a bus passes by. Which view do you see?', 'బస్సు పక్కగా వెళ్తుంటే నువ్వు ఫుట్‌పాత్ మీద ఉన్నావు. ఏ దృశ్యం కనిపిస్తుంది?'), L('Side view', 'పక్క దృశ్యం'), [L('Top view', 'పై దృశ్యం'), L('Front view', 'ముందు దృశ్యం')],
            [L('The bus goes past beside you.', 'బస్సు నీ పక్క నుండి వెళ్తోంది.'), L('Beside means side.', 'పక్కన అంటే పక్క దృశ్యం.')], L('You see the side of the bus.', 'నీకు బస్సు పక్క భాగం కనిపిస్తుంది.'), L('You are next to the bus, not in front of it or above it.', 'నువ్వు బస్సు పక్కన ఉన్నావు, ముందు కాదు, పైన కాదు.')],
          [L('You look down at a ₹5 coin on the table. What shape do you see?', 'బల్ల మీద ఉన్న ₹5 నాణేన్ని పై నుండి చూస్తే ఏ ఆకారం?'), L('Circle', 'వృత్తం'), [L('Rectangle', 'దీర్ఘచతురస్రం'), L('Triangle', 'త్రిభుజం')],
            [L('Looking down gives the top view.', 'పై నుండి చూస్తే పై దృశ్యం.'), L('A coin is round.', 'నాణెం గుండ్రంగా ఉంటుంది.')], L('The top view of a coin is a circle.', 'నాణెం పై దృశ్యం వృత్తం.'), L('From the top a coin is round.', 'పై నుండి నాణెం గుండ్రంగా ఉంటుంది.')],
          [L('A coin stands on its edge. You look at it from the side. What do you see?', 'నాణెం అంచు మీద నిలబడి ఉంది. పక్క నుండి చూస్తే ఏమి కనిపిస్తుంది?'), L('A thin rectangle', 'సన్నని దీర్ఘచతురస్రం'), [L('Circle', 'వృత్తం'), L('Triangle', 'త్రిభుజం')],
            [L('A coin is very thin.', 'నాణెం చాలా సన్నగా ఉంటుంది.'), L('From the side you see only its thickness.', 'పక్క నుండి దాని మందం మాత్రమే కనిపిస్తుంది.')], L('From the side a coin looks like a thin rectangle.', 'పక్క నుండి నాణెం సన్నని దీర్ఘచతురస్రంలా ఉంటుంది.'), L('You see the round face only from the front or top.', 'గుండ్రని ముఖం ముందు లేదా పై నుండే కనిపిస్తుంది.')],
          [L('Which view of a house shows its roof?', 'ఇంటి పైకప్పు ఏ దృశ్యంలో పూర్తిగా కనిపిస్తుంది?'), L('Top view', 'పై దృశ్యం'), [L('Front view', 'ముందు దృశ్యం'), L('Side view', 'పక్క దృశ్యం')],
            [L('Where is the roof?', 'పైకప్పు ఎక్కడ ఉంది?'), L('You must look from above.', 'పై నుండి చూడాలి.')], L('A bird above the house sees the whole roof: the top view.', 'ఇంటి పైన ఉన్న పక్షికి పైకప్పు మొత్తం కనిపిస్తుంది: పై దృశ్యం.'), L('From the front you see the door, not the whole roof.', 'ముందు నుండి తలుపు కనిపిస్తుంది, పైకప్పు మొత్తం కాదు.')],
        ]),
      ],
    },
    {
      id: 'ts3.ma.shape.solids', title: L('Shapes of everyday objects', 'రోజువారీ వస్తువుల ఆకారాలు'),
      intro: [
        h('Shapes you can hold', 'చేతిలో పట్టుకునే ఆకారాలు'),
        p('Look around your house. A ball, a dice, an oil tin, a birthday cap and a brick all have different solid shapes.', 'నీ ఇంట్లో చూడు. బంతి, పాచిక, నూనె డబ్బా, పుట్టినరోజు టోపీ, ఇటుక — అన్నిటికీ వేర్వేరు ఘన ఆకారాలు.'),
        photo('⚽', L('A ball is a sphere. It is round all over, so it rolls in every direction.', 'బంతి ఒక గోళం. అన్ని వైపులా గుండ్రంగా ఉంటుంది, అందుకే ఎటైనా దొర్లుతుంది.')),
        photo('🥫', L('A tin is a cylinder: two flat circles and a curved side.', 'డబ్బా ఒక స్థూపం: రెండు చదునైన వృత్తాలు, ఒక వంపు భాగం.')),
        vis({ kind: 'emoji', text: '⚽ 🎲 🥫 🍦 🧱' }, 'Sphere, cube, cylinder, cone and cuboid', 'గోళం, ఘనం, స్థూపం, శంఖువు, దీర్ఘఘనం'),
        keys(L('Sphere: ball, laddoo — round all over.', 'గోళం: బంతి, లడ్డూ — అంతా గుండ్రం.'), L('Cube: dice — 6 equal square faces.', 'ఘనం: పాచిక — 6 సమాన చతురస్ర ముఖాలు.'), L('Cuboid: brick, matchbox — 6 rectangle faces.', 'దీర్ఘఘనం: ఇటుక, అగ్గిపెట్టె — 6 దీర్ఘచతురస్ర ముఖాలు.'), L('Cylinder: tin, pipe. Cone: cap, funnel.', 'స్థూపం: డబ్బా, పైపు. శంఖువు: టోపీ, గరాటు.')),
        tip('Things with a curved part can roll. Things with only flat faces slide and can be stacked.', 'వంపు భాగం ఉన్నవి దొర్లుతాయి. చదునైన ముఖాలు మాత్రమే ఉన్నవి జారుతాయి, పేర్చవచ్చు.'),
      ],
      examples: [
        ex(L('What shape is a laddoo?', 'లడ్డూ ఏ ఆకారం?'), [L('It is round all over.', 'అది అంతా గుండ్రంగా ఉంటుంది.'), L('It has no flat face.', 'దానికి చదునైన ముఖం లేదు.')], L('Sphere', 'గోళం')),
        ex(L('How many flat faces does a matchbox have?', 'అగ్గిపెట్టెకు ఎన్ని చదునైన ముఖాలు?'), [L('Top and bottom: 2', 'పైన, కింద: 2'), L('Front and back: 2', 'ముందు, వెనుక: 2'), L('Left and right: 2', 'ఎడమ, కుడి: 2'), same('2 + 2 + 2 = 6')], L('6 faces', '6 ముఖాలు')),
      ],
      practice: [
        tp('name', (r) => {
          const s = r.pick(SOLIDS), o = r.pick(s.objs);
          return mcq(r, L(`What shape is a ${o.en}?`, `${o.te} ఏ ఆకారంలో ఉంటుంది?`), s.name, SOLIDS.filter((x) => x !== s).map((x) => x.name),
            [L('Does it have a pointed tip? Is it round all over?', 'దానికి మొన ఉందా? అంతా గుండ్రంగా ఉందా?'), L('Count its flat faces in your mind.', 'మనసులో దాని చదునైన ముఖాలు లెక్కించు.')],
            [L(`A ${o.en} is a ${s.name.en.toLowerCase()}.`, `${o.te} ఒక ${s.name.te}.`)], [['wrong', L('Hold a real one or picture it: check for flat faces, curved parts and a tip.', 'నిజమైన వస్తువును పట్టుకుని చూడు: చదునైన ముఖాలు, వంపు, మొన ఉన్నాయా?')]]);
        }),
        tp('faces', (r) => {
          const s = r.pick(SOLIDS), o = r.pick(s.objs);
          return mcqN(r, L(`A ${o.en} is shaped like a ${s.name.en.toLowerCase()}. How many flat faces does it have?`, `${o.te} ${s.name.te} ఆకారంలో ఉంటుంది. దానికి ఎన్ని చదునైన ముఖాలు?`), s.faces, [0, 1, 2, 6, 4],
            [L('Imagine putting it on a table. Which parts can sit flat?', 'దాన్ని బల్ల మీద పెట్టినట్టు ఊహించు. ఏ భాగాలు చదునుగా కూర్చుంటాయి?')],
            [L(`A ${s.name.en.toLowerCase()} has ${s.faces} flat face${s.faces === 1 ? '' : 's'}.`, `${s.name.te}కు ${s.faces} చదునైన ముఖాలు.`)]);
        }),
        tapT('roll', L('Tap ALL the things that can roll.', 'దొర్లగల అన్నిటినీ నొక్కు.'),
          [L('ball', 'బంతి'), L('marble', 'గోలీ'), L('orange', 'నారింజ'), L('bangle', 'గాజు'), L('oil tin', 'నూనె డబ్బా'), L('cycle wheel', 'సైకిల్ చక్రం')],
          [L('matchbox', 'అగ్గిపెట్టె'), L('dice', 'పాచిక'), L('brick', 'ఇటుక'), L('book', 'పుస్తకం'), L('eraser', 'రబ్బరు')],
          [L('Look for a curved part.', 'వంపు భాగం కోసం చూడు.'), L('Things with only flat faces cannot roll.', 'చదునైన ముఖాలు మాత్రమే ఉన్నవి దొర్లవు.')],
          L('Only things with a curved surface can roll.', 'వంపు ఉపరితలం ఉన్నవి మాత్రమే దొర్లుతాయి.')),
      ],
    },
    {
      id: 'ts3.ma.shape.flat', title: L('Flat shapes: sides and corners', 'సమతల ఆకారాలు: భుజాలు, మూలలు'),
      intro: [
        h('Trace a face, get a flat shape', 'ముఖాన్ని గీస్తే సమతల ఆకారం'),
        p('Put a matchbox on paper and draw around it. You get a rectangle. Draw around a coin and you get a circle.', 'అగ్గిపెట్టెను కాగితం మీద పెట్టి చుట్టూ గీయి. దీర్ఘచతురస్రం వస్తుంది. నాణెం చుట్టూ గీస్తే వృత్తం వస్తుంది.'),
        vis({ kind: 'shape', shape: 'triangle' }, 'A triangle: 3 sides, 3 corners', 'త్రిభుజం: 3 భుజాలు, 3 మూలలు'),
        vis({ kind: 'shape', shape: 'square' }, 'A square: 4 equal sides, 4 corners', 'చతురస్రం: 4 సమాన భుజాలు, 4 మూలలు'),
        photo('📏', L('Use a ruler to draw the straight sides of a shape.', 'ఆకారపు సరళ భుజాలు గీయడానికి స్కేలు వాడు.')),
        keys(L('Triangle: 3 sides, 3 corners.', 'త్రిభుజం: 3 భుజాలు, 3 మూలలు.'), L('Square and rectangle: 4 sides, 4 corners.', 'చతురస్రం, దీర్ఘచతురస్రం: 4 భుజాలు, 4 మూలలు.'), L('Circle: no straight side, no corner.', 'వృత్తం: సరళ భుజం లేదు, మూల లేదు.')),
        remember('A shape with straight sides has as many corners as sides.', 'సరళ భుజాలు ఉన్న ఆకారానికి ఎన్ని భుజాలో అన్ని మూలలు.'),
        tip('Put your finger on one corner and count the sides as you go round. Stop when you come back.', 'ఒక మూల మీద వేలు పెట్టి చుట్టూ వెళ్తూ భుజాలు లెక్కించు. తిరిగి వచ్చాక ఆపు.'),
      ],
      examples: [
        ex(L('How many sides does a hexagon have?', 'షడ్భుజికి ఎన్ని భుజాలు?'), [L('Go round and count: 1, 2, 3, 4, 5, 6.', 'చుట్టూ లెక్కించు: 1, 2, 3, 4, 5, 6.')], L('6 sides', '6 భుజాలు'), { kind: 'shape', shape: 'hexagon' }),
        ex(L('Draw around the bottom of an oil tin. What shape do you get?', 'నూనె డబ్బా అడుగు చుట్టూ గీస్తే ఏ ఆకారం వస్తుంది?'), [L('The bottom of a tin is round.', 'డబ్బా అడుగు గుండ్రంగా ఉంటుంది.')], L('A circle', 'వృత్తం'), { kind: 'shape', shape: 'circle' }),
      ],
      practice: [
        tp('count', (r) => {
          const s = r.pick(FLAT.filter((x) => x.n > 0));
          const corners = r.int(0, 1) === 1;
          const w = corners ? L('corners', 'మూలలు') : L('sides', 'భుజాలు');
          return typed(L(`How many ${w.en} does this shape have?`, `ఈ ఆకారానికి ఎన్ని ${w.te} ఉన్నాయి?`), num(s.n),
            [L(`Touch each ${corners ? 'corner' : 'side'} once as you count.`, `లెక్కిస్తూ ప్రతి ${corners ? 'మూలను' : 'భుజాన్ని'} ఒకసారి తాకు.`), L('A closed shape has as many corners as sides.', 'మూసిన ఆకారానికి భుజాలు ఎన్నో మూలలు అన్ని.')],
            [L(`This is a ${s.name.en}. It has ${s.n} ${w.en}.`, `ఇది ${s.name.te}. దానికి ${s.n} ${w.te}.`)], [], { visual: { kind: 'shape', shape: s.k } });
        }),
        tp('name', (r) => {
          const s = r.pick(FLAT);
          return mcq(r, L('What is the name of this shape?', 'ఈ ఆకారం పేరు ఏమిటి?'), s.name, FLAT.filter((x) => x !== s).map((x) => x.name),
            [L('Count the sides first.', 'ముందు భుజాలు లెక్కించు.'), L('3 sides: triangle. 4 sides: square or rectangle. 0: circle.', '3 భుజాలు: త్రిభుజం. 4: చతురస్రం లేదా దీర్ఘచతురస్రం. 0: వృత్తం.')],
            [L(`It has ${s.n} straight sides, so it is a ${s.name.en}.`, `దానికి ${s.n} సరళ భుజాలు, కాబట్టి అది ${s.name.te}.`)], [['wrong', L('Count the sides again. A square has all 4 sides equal; a rectangle has a long pair and a short pair.', 'భుజాలు మళ్ళీ లెక్కించు. చతురస్రంలో 4 భుజాలు సమానం; దీర్ఘచతురస్రంలో రెండు పొడవు, రెండు పొట్టి.')]], { visual: { kind: 'shape', shape: s.k } });
        }),
      ],
    },
  ],
};

// ================================================================== CH 2 NUMBERS
const three = (r: Rng) => r.int(1, 9) * 100 + r.int(0, 9) * 10 + r.int(0, 9);
const TEAMS: S[] = [L('Hyderabad', 'హైదరాబాద్'), L('Warangal', 'వరంగల్'), L('Karimnagar', 'కరీంనగర్'), L('Nizamabad', 'నిజామాబాద్'), L('Khammam', 'ఖమ్మం'), L('Nalgonda', 'నల్గొండ')];
const ch2: USpec = {
  id: 'ts3.ma.ch2', subject: 'math', title: L('Numbers', 'సంఖ్యలు'), source: src(2),
  objectives: [
    {
      id: 'ts3.ma.num.read', title: L('Reading and writing 3-digit numbers', '3 అంకెల సంఖ్యలు చదవడం, రాయడం'),
      intro: [
        h('Bundles of sticks', 'పుల్లల కట్టలు'),
        p('Tie 10 sticks together. That is one ten. Tie 10 such bundles together. That is one hundred!', '10 పుల్లలు కలిపి కట్టు. అది ఒక పది. అలాంటి 10 కట్టలు కలిపి కట్టు. అది ఒక వంద!'),
        photo('🪵', L('10 sticks make a ten. 10 tens make a hundred.', '10 పుల్లలు ఒక పది. 10 పదులు ఒక వంద.')),
        vis({ kind: 'objects', emoji: '🟦', count: 30, groupsOf: 10 }, 'Three tens are thirty', 'మూడు పదులు ముప్పై'),
        p('The number 426 has 4 hundreds, 2 tens and 6 ones. We read it as "four hundred twenty-six".', '426లో 4 వందలు, 2 పదులు, 6 ఒకట్లు ఉన్నాయి. దాన్ని "నాలుగు వందల ఇరవై ఆరు" అని చదువుతాం.'),
        keys(L('Read the hundreds first, then the tens and ones.', 'ముందు వందలు, తర్వాత పదులు, ఒకట్లు చదువు.'), L('A 0 in the tens place means no tens: 305 is three hundred five.', 'పదుల స్థానంలో 0 అంటే పదులు లేవు: 305 = మూడు వందల ఐదు.'), L('The biggest 3-digit number is 999. The smallest is 100.', 'అతి పెద్ద 3 అంకెల సంఖ్య 999. అతి చిన్నది 100.')),
        tip('Say the number aloud while pointing at each digit.', 'ఒక్కో అంకెను చూపిస్తూ సంఖ్యను గట్టిగా చదువు.'),
      ],
      examples: [
        ex(L('Write "three hundred seven" in numbers.', '"మూడు వందల ఏడు"ను అంకెల్లో రాయి.'), [L('3 hundreds, 0 tens, 7 ones.', '3 వందలు, 0 పదులు, 7 ఒకట్లు.'), L('Put 0 in the tens place.', 'పదుల స్థానంలో 0 పెట్టు.')], same('307')),
        ex(L('Read 640.', '640ని చదువు.'), [L('6 hundreds → six hundred', '6 వందలు → ఆరు వందల'), L('4 tens → forty, 0 ones', '4 పదులు → నలభై, 0 ఒకట్లు')], L('six hundred forty', 'ఆరు వందల నలభై')),
      ],
      practice: [
        tp('toNum', (r) => {
          const n = three(r), w = words(n);
          return typed(L(`Write in numbers: ${w.en}`, `అంకెల్లో రాయి: ${w.te}`), num(n),
            [L('How many hundreds? How many tens? How many ones?', 'ఎన్ని వందలు? ఎన్ని పదులు? ఎన్ని ఒకట్లు?'), L('If a place is missing, write 0 there.', 'ఏదైనా స్థానం లేకపోతే అక్కడ 0 రాయి.')],
            [L(`${dg(n)[0]} hundreds, ${dg(n)[1]} tens, ${dg(n)[2]} ones → ${n}`, `${dg(n)[0]} వందలు, ${dg(n)[1]} పదులు, ${dg(n)[2]} ఒకట్లు → ${n}`)],
            dg(n)[1] === 0 ? [[`${dg(n)[0]}${dg(n)[2]}`, L('Keep 3 places. Write 0 for an empty place.', '3 స్థానాలు ఉంచు. ఖాళీ స్థానంలో 0 రాయి.')]] : [['wrong-value', L('Say the hundreds, tens and ones again, then write each digit in its place.', 'వందలు, పదులు, ఒకట్లు మళ్ళీ చెప్పి, ప్రతి అంకెను దాని స్థానంలో రాయి.')]]);
        }),
        tp('toWord', (r) => {
          const n = three(r), d = dg(n);
          const swap = d[1] !== d[2] ? d[0] * 100 + d[2] * 10 + d[1] : n + 10 > 999 ? n - 10 : n + 10;
          const wrong = [words(swap), words(n + 100 > 999 ? n - 100 : n + 100), words(n % 10 === 9 ? n - 1 : n + 1)];
          return mcq(r, L(`How do we read ${n}?`, `${n}ని ఎలా చదువుతాం?`), words(n), wrong,
            [L('Start with the hundreds digit.', 'వందల అంకెతో మొదలుపెట్టు.'), L(`${n} = ${d[0]} hundreds, ${d[1]} tens, ${d[2]} ones.`, `${n} = ${d[0]} వందలు, ${d[1]} పదులు, ${d[2]} ఒకట్లు.`)],
            [L(`${n} is read as "${words(n).en}".`, `${n}ని "${words(n).te}" అని చదువుతాం.`)], [['wrong', L('Check each place: hundreds, then tens, then ones.', 'ప్రతి స్థానం చూడు: వందలు, పదులు, ఒకట్లు.')]]);
        }),
      ],
    },
    {
      id: 'ts3.ma.num.place', title: L('Place value: hundreds, tens and ones', 'స్థాన విలువ: వందలు, పదులు, ఒకట్లు'),
      intro: [
        h('Each digit has a home', 'ప్రతి అంకెకు ఒక ఇల్లు'),
        p('In 352, the 3 lives in the hundreds house, the 5 in the tens house and the 2 in the ones house.', '352లో 3 వందల ఇంట్లో, 5 పదుల ఇంట్లో, 2 ఒకట్ల ఇంట్లో ఉంటాయి.'),
        vis({ kind: 'emoji', text: 'H | T | O\n3 | 5 | 2' }, 'Place-value chart for 352', '352 కోసం స్థాన విలువ పట్టిక'),
        p('The 3 is worth 300, the 5 is worth 50 and the 2 is worth 2. So 352 = 300 + 50 + 2. This is the expanded form.', '3 విలువ 300, 5 విలువ 50, 2 విలువ 2. కాబట్టి 352 = 300 + 50 + 2. ఇదే విస్తరణ రూపం.'),
        photo('🧮', L('On an abacus, each rod is one place: hundreds, tens, ones.', 'అబాకస్‌లో ఒక్కో కడ్డీ ఒక స్థానం: వందలు, పదులు, ఒకట్లు.')),
        keys(L('Ones place: the digit is worth itself.', 'ఒకట్ల స్థానం: అంకె విలువ అదే.'), L('Tens place: the digit is worth that many tens.', 'పదుల స్థానం: అంకె అన్ని పదులు.'), L('Hundreds place: the digit is worth that many hundreds.', 'వందల స్థానం: అంకె అన్ని వందలు.')),
        remember('The same digit can have different values in different places: in 555, the 5s are worth 500, 50 and 5.', 'ఒకే అంకెకు వేర్వేరు స్థానాల్లో వేర్వేరు విలువ: 555లో 5ల విలువలు 500, 50, 5.'),
        tip('To find a value, keep the digit and put zeros for every place to its right.', 'విలువ కనుగొనడానికి అంకెను ఉంచి, దాని కుడి వైపు ప్రతి స్థానానికి సున్నా పెట్టు.'),
      ],
      examples: [
        ex(L('What is the value of 7 in 472?', '472లో 7 విలువ ఎంత?'), [L('7 is in the tens place.', '7 పదుల స్థానంలో ఉంది.'), L('7 tens = 70', '7 పదులు = 70')], same('70')),
        ex(L('Write 608 in expanded form.', '608ని విస్తరణ రూపంలో రాయి.'), [L('6 hundreds = 600, 0 tens = 0, 8 ones = 8', '6 వందలు = 600, 0 పదులు = 0, 8 ఒకట్లు = 8')], same('608 = 600 + 8')),
        ex(L('Which number is 5 hundreds + 3 tens + 9 ones?', '5 వందలు + 3 పదులు + 9 ఒకట్లు ఏ సంఖ్య?'), [same('500 + 30 + 9')], same('539')),
      ],
      practice: [
        tp('value', (r) => {
          let n = three(r); const d = dg(n);
          if (new Set(d).size < 3) n = d[0] * 100 + ((d[0] + 3) % 10) * 10 + ((d[0] + 6) % 10);
          const dd = dg(n), i = r.int(0, 2), v = dd[i] * [100, 10, 1][i];
          return mcqN(r, L(`What is the value of the digit ${dd[i]} in ${n}?`, `${n}లో ${dd[i]} అంకె విలువ ఎంత?`), v, [dd[i], dd[i] * 10, dd[i] * 100, dd[i] * 1000].filter((x) => x !== v),
            [L(`Which place is ${dd[i]} in?`, `${dd[i]} ఏ స్థానంలో ఉంది?`), L('Hundreds: ×100. Tens: ×10. Ones: itself.', 'వందలు: ×100. పదులు: ×10. ఒకట్లు: అదే.')],
            [L(`${dd[i]} is in the ${PLACE[i].en} place, so its value is ${v}.`, `${dd[i]} ${PLACE[i].te} స్థానంలో ఉంది, కాబట్టి విలువ ${v}.`)],
            [[String(dd[i]), L('That is the digit (face value). The place makes its value bigger.', 'అది అంకె మాత్రమే. స్థానం దాని విలువను పెంచుతుంది.')]]);
        }),
        tp('build', (r) => {
          const a = r.int(1, 9), b = r.int(0, 9), c = r.int(0, 9);
          const n = a * 100 + b * 10 + c;
          const mixed = r.int(0, 1) === 1;
          const pr = mixed ? L(`Which number is ${c} ones + ${a} hundreds + ${b} tens?`, `${c} ఒకట్లు + ${a} వందలు + ${b} పదులు ఏ సంఖ్య?`) : L(`Which number is ${a * 100} + ${b * 10} + ${c}?`, `${a * 100} + ${b * 10} + ${c} ఏ సంఖ్య?`);
          return typed(pr, num(n), [L('Put each digit in its own place: H, T, O.', 'ప్రతి అంకెను దాని స్థానంలో పెట్టు: వం, ప, ఒ.'), L('An empty place gets 0.', 'ఖాళీ స్థానానికి 0.')],
            [L(`${a} hundreds, ${b} tens, ${c} ones → ${n}`, `${a} వందలు, ${b} పదులు, ${c} ఒకట్లు → ${n}`)],
            mixed && c !== a ? [[`${c}${a}${b}`, L('Do not write the digits in the order given. Put each in its place: hundreds first.', 'ఇచ్చిన క్రమంలో రాయకు. ప్రతి అంకెను దాని స్థానంలో పెట్టు: ముందు వందలు.')]] : []);
        }),
      ],
    },
    {
      id: 'ts3.ma.num.compare', title: L('Comparing numbers and cricket scores', 'సంఖ్యల పోలిక - క్రికెట్ స్కోర్లు'),
      intro: [
        h('Who scored more?', 'ఎవరు ఎక్కువ స్కోర్ చేశారు?'),
        p('In a school cricket match, Warangal scored 186 runs and Khammam scored 168 runs. Who won?', 'బడి క్రికెట్ మ్యాచ్‌లో వరంగల్ 186 పరుగులు, ఖమ్మం 168 పరుగులు చేశాయి. ఎవరు గెలిచారు?'),
        p('Compare from the LEFT. Hundreds: 1 and 1, same. Tens: 8 and 6. 8 is bigger, so 186 > 168. Warangal won!', 'ఎడమ నుండి పోల్చు. వందలు: 1, 1 సమానం. పదులు: 8, 6. 8 పెద్దది, కాబట్టి 186 > 168. వరంగల్ గెలిచింది!'),
        photo('🏆', L('The team with the bigger score wins the cup.', 'ఎక్కువ స్కోర్ చేసిన జట్టుకు కప్పు.')),
        vis({ kind: 'number-line', from: 150, to: 200, step: 10, marks: [168, 186] }, '186 is to the right of 168, so it is bigger', '186, 168కి కుడి వైపు ఉంది, కాబట్టి పెద్దది'),
        keys(L('> means "is greater than". < means "is less than".', '> అంటే "కంటే పెద్దది". < అంటే "కంటే చిన్నది".'), L('Compare hundreds first. If equal, compare tens, then ones.', 'ముందు వందలు పోల్చు. సమానమైతే పదులు, తర్వాత ఒకట్లు.'), L('On a number line, bigger numbers are further right.', 'సంఖ్యా రేఖపై పెద్ద సంఖ్యలు కుడి వైపు ఉంటాయి.')),
        tip('The open mouth of > or < always faces the bigger number — it wants to eat more!', '> లేదా < నోరు ఎప్పుడూ పెద్ద సంఖ్య వైపే తెరుచుకుంటుంది — దానికి ఎక్కువ తినాలని!'),
      ],
      examples: [
        ex(L('Which is bigger: 509 or 590?', 'ఏది పెద్దది: 509 లేదా 590?'), [L('Hundreds: 5 and 5, same.', 'వందలు: 5, 5 సమానం.'), L('Tens: 0 and 9. 9 is bigger.', 'పదులు: 0, 9. 9 పెద్దది.')], same('590 > 509')),
        ex(L('Make the biggest number using 4, 9 and 2.', '4, 9, 2 తో అతి పెద్ద సంఖ్య తయారు చేయి.'), [L('Put the biggest digit in the hundreds place: 9.', 'అతి పెద్ద అంకె వందల స్థానంలో: 9.'), L('Next biggest in tens: 4. Then 2.', 'తర్వాత పెద్దది పదుల్లో: 4. తర్వాత 2.')], same('942')),
      ],
      practice: [
        tp('score', (r) => {
          const [t1, t2] = r.shuffle(TEAMS).slice(0, 2);
          const a = r.int(110, 280); let b = dg(a)[1] !== dg(a)[2] ? dg(a)[0] * 100 + dg(a)[2] * 10 + dg(a)[1] : a + r.int(3, 30);
          if (r.int(0, 2) === 0) b = a + r.pick([-40, -12, 9, 25]);
          const win = a > b ? t1 : t2;
          return mcq(r, L(`Cricket match: ${t1.en} scored ${a} runs and ${t2.en} scored ${b} runs. Which team won?`, `క్రికెట్ మ్యాచ్: ${t1.te} ${a} పరుగులు, ${t2.te} ${b} పరుగులు చేశాయి. ఏ జట్టు గెలిచింది?`), win, [win === t1 ? t2 : t1],
            [L('The bigger score wins.', 'ఎక్కువ స్కోర్ గెలుస్తుంది.'), L('Compare hundreds, then tens, then ones.', 'వందలు, తర్వాత పదులు, తర్వాత ఒకట్లు పోల్చు.')],
            [L(`${Math.max(a, b)} > ${Math.min(a, b)}, so ${win.en} won.`, `${Math.max(a, b)} > ${Math.min(a, b)}, కాబట్టి ${win.te} గెలిచింది.`)], [['wrong', L('Look at the first place where the digits are different.', 'అంకెలు మొదట ఎక్కడ వేరవుతాయో అక్కడ చూడు.')]]);
        }),
        tp('sign', (r) => {
          const a = three(r); const b = r.int(0, 3) === 0 ? a : Math.min(999, Math.max(100, a + r.pick([-90, -9, -100, 1, 10, 100, 45])));
          const s = a > b ? '>' : a < b ? '<' : '=';
          return mcq(r, L(`Choose the sign: ${a} ☐ ${b}`, `గుర్తును ఎంచుకో: ${a} ☐ ${b}`), same(s), ['>', '<', '='].filter((x) => x !== s).map(same),
            [L('Compare from the left.', 'ఎడమ నుండి పోల్చు.'), L('The open side faces the bigger number.', 'తెరిచిన వైపు పెద్ద సంఖ్య వైపు.')],
            [same(`${a} ${s} ${b}`)], [['wrong', L('Find the first place where the digits differ. The bigger digit there means the bigger number.', 'అంకెలు మొదట వేరైన స్థానం చూడు. అక్కడ పెద్ద అంకె ఉన్నదే పెద్ద సంఖ్య.')]]);
        }),
        tp('order', (r) => {
          const set = new Set<number>(); while (set.size < 4) set.add(three(r));
          const asc = r.int(0, 1) === 1; const sorted = [...set].sort((x, y) => (asc ? x - y : y - x));
          return { type: 'order', prompt: asc ? L('Put the numbers in order from smallest to biggest.', 'సంఖ్యలను చిన్న నుండి పెద్ద క్రమంలో అమర్చు.') : L('Put the numbers in order from biggest to smallest.', 'సంఖ్యలను పెద్ద నుండి చిన్న క్రమంలో అమర్చు.'),
            ...ordering(r, sorted.map(String)), hints: [L('Look at the hundreds digits first.', 'ముందు వందల అంకెలు చూడు.'), L('If two have the same hundreds, look at the tens.', 'వందలు సమానమైతే పదులు చూడు.')],
            solution: [same(sorted.join(asc ? ' < ' : ' > '))] };
        }, 2),
        tp('make', (r) => {
          const ds = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
          const big = r.int(0, 1) === 1; const s = [...ds].sort((x, y) => (big ? y - x : x - y)); const n = +s.join('');
          return typed(L(`Use the digits ${ds.join(', ')} once each. Make the ${big ? 'biggest' : 'smallest'} 3-digit number.`, `${ds.join(', ')} అంకెలను ఒక్కోసారి వాడి అతి ${big ? 'పెద్ద' : 'చిన్న'} 3 అంకెల సంఖ్య తయారు చేయి.`), num(n),
            [L(`Put the ${big ? 'biggest' : 'smallest'} digit in the hundreds place.`, `అతి ${big ? 'పెద్ద' : 'చిన్న'} అంకెను వందల స్థానంలో పెట్టు.`), L('Then the next one in the tens place.', 'తర్వాతి అంకె పదుల స్థానంలో.')],
            [L(`Order the digits: ${s.join(', ')} → ${n}`, `అంకెలను క్రమంలో: ${s.join(', ')} → ${n}`)], [[String(+[...s].reverse().join('')), L(`That is the ${big ? 'smallest' : 'biggest'}. Read the question again.`, `అది అతి ${big ? 'చిన్నది' : 'పెద్దది'}. ప్రశ్న మళ్ళీ చదువు.`)]]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 3 ADDITION
const ch3: USpec = {
  id: 'ts3.ma.ch3', subject: 'math', title: L('Addition', 'కూడిక'), source: src(3),
  objectives: [
    {
      id: 'ts3.ma.add.regroup', title: L('Adding with carrying', 'బదిలీతో కూడిక'),
      intro: [
        h('When ones become a ten', 'ఒకట్లు పదిగా మారినప్పుడు'),
        p('Add 268 + 157. Start with the ones: 8 + 7 = 15. 15 is 1 ten and 5 ones. Write 5 and carry the 1 ten to the tens column.', '268 + 157 కూడు. ఒకట్లతో మొదలు: 8 + 7 = 15. 15 అంటే 1 పది, 5 ఒకట్లు. 5 రాసి, 1 పదిని పదుల నిలువు వరుసకు తీసుకెళ్ళు.'),
        p('Tens: 6 + 5 + 1 = 12 tens. Write 2 and carry 1 hundred. Hundreds: 2 + 1 + 1 = 4. Answer: 425.', 'పదులు: 6 + 5 + 1 = 12 పదులు. 2 రాసి 1 వందను తీసుకెళ్ళు. వందలు: 2 + 1 + 1 = 4. జవాబు: 425.'),
        vis({ kind: 'emoji', text: '  ¹ ¹\n  2 6 8\n+ 1 5 7\n= 4 2 5' }, 'Column addition with two carries', 'రెండు బదిలీలతో నిలువు కూడిక'),
        photo('🧮', L('10 beads on a rod are swapped for 1 bead on the next rod. That is carrying.', 'ఒక కడ్డీపై 10 పూసలు ఉంటే, తర్వాతి కడ్డీపై 1 పూసగా మారుస్తాం. అదే బదిలీ.')),
        X({
          title: L('What if? Change one number', 'ఒక సంఖ్య మారిస్తే?'), formula: 'Sum = a + b',
          result: ['S', L('Sum', 'మొత్తం'), 'a + b'],
          vars: [['a', L('First number', 'మొదటి సంఖ్య'), 100, 500, 10, 260], ['b', L('Second number', 'రెండో సంఖ్య'), 10, 400, 10, 150]],
          notes: [['a', L('Add 10 more to the first number and the sum also grows by 10.', 'మొదటి సంఖ్యకు 10 కలిపితే మొత్తం కూడా 10 పెరుగుతుంది.'), L('Take 10 away from the first number and the sum drops by 10.', 'మొదటి సంఖ్య నుండి 10 తీస్తే మొత్తం 10 తగ్గుతుంది.')],
            ['b', L('A bigger second number makes a bigger sum.', 'రెండో సంఖ్య పెద్దదైతే మొత్తం పెద్దది.'), L('A smaller second number makes a smaller sum.', 'రెండో సంఖ్య చిన్నదైతే మొత్తం చిన్నది.')]],
          mistakes: [[L('Forgetting the carried 1', 'బదిలీ చేసిన 1 మర్చిపోవడం'), L('When a column adds to 10 or more, the extra ten must go to the next column.', 'ఒక నిలువు వరుస మొత్తం 10 లేదా ఎక్కువైతే ఆ పది తర్వాతి వరుసకు వెళ్ళాలి.')]],
          real: L('Shopkeepers add two bills to find how much money they got.', 'దుకాణదారులు రెండు బిల్లులు కలిపి ఎంత డబ్బు వచ్చిందో చూస్తారు.'),
        }),
        keys(L('Always start adding from the ones.', 'ఎప్పుడూ ఒకట్ల నుండి కూడటం మొదలుపెట్టు.'), L('10 ones = 1 ten. 10 tens = 1 hundred.', '10 ఒకట్లు = 1 పది. 10 పదులు = 1 వంద.'), L('Write the carried 1 small, on top of the next column.', 'బదిలీ 1ని తర్వాతి వరుస పైన చిన్నగా రాయి.')),
        tip('Swapping the numbers does not change the sum: 157 + 268 is also 425.', 'సంఖ్యలను మార్చి కూడినా మొత్తం మారదు: 157 + 268 కూడా 425.'),
      ],
      examples: [
        ex(same('345 + 238'), [L('Ones: 5 + 8 = 13 → write 3, carry 1', 'ఒకట్లు: 5 + 8 = 13 → 3 రాయి, 1 తీసుకెళ్ళు'), L('Tens: 4 + 3 + 1 = 8', 'పదులు: 4 + 3 + 1 = 8'), L('Hundreds: 3 + 2 = 5', 'వందలు: 3 + 2 = 5')], same('583')),
        ex(same('476 + 285'), [L('Ones: 6 + 5 = 11 → write 1, carry 1', 'ఒకట్లు: 6 + 5 = 11 → 1 రాయి, 1 తీసుకెళ్ళు'), L('Tens: 7 + 8 + 1 = 16 → write 6, carry 1', 'పదులు: 7 + 8 + 1 = 16 → 6 రాయి, 1 తీసుకెళ్ళు'), L('Hundreds: 4 + 2 + 1 = 7', 'వందలు: 4 + 2 + 1 = 7')], same('761')),
      ],
      practice: [
        tp('col', (r) => {
          let a = 0, b = 0;
          do { a = r.int(105, 589); b = r.int(105, 399); } while (a + b > 999 || (a % 10) + (b % 10) < 10);
          const s = a + b;
          return typed(L(`Add: ${a} + ${b}`, `కూడు: ${a} + ${b}`), num(s),
            [L('Start with the ones column.', 'ఒకట్ల వరుసతో మొదలుపెట్టు.'), L(`${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}. Write ${((a % 10) + (b % 10)) % 10} and carry 1.`, `${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}. ${((a % 10) + (b % 10)) % 10} రాసి 1 తీసుకెళ్ళు.`)],
            [L(`Ones: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}`, `ఒకట్లు: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}`), same(`${a} + ${b} = ${s}`)],
            [[String(noCarry(a, b)), L('You forgot to carry. When a column makes 10 or more, carry 1 to the next column.', 'బదిలీ మర్చిపోయావు. ఒక వరుస 10 లేదా ఎక్కువైతే 1ని తర్వాతి వరుసకు తీసుకెళ్ళు.')]], { visual: { kind: 'emoji', text: `  ${a}\n+ ${b}\n= ?` } });
        }),
        tp('missing', (r) => {
          const a = r.int(120, 480), b = r.int(110, 450), s = a + b;
          return typed(L(`${a} + ☐ = ${s}. What number goes in the box?`, `${a} + ☐ = ${s}. పెట్టెలో ఏ సంఖ్య?`), num(b),
            [L('What must be added to the first number to reach the total?', 'మొత్తం రావాలంటే మొదటి సంఖ్యకు ఎంత కలపాలి?'), L(`Find ${s} − ${a}.`, `${s} − ${a} కనుగొను.`)],
            [same(`${s} − ${a} = ${b}`), L(`Check: ${a} + ${b} = ${s} ✓`, `సరిచూడు: ${a} + ${b} = ${s} ✓`)], [[String(s + a), L('You added. The box is the missing part, so subtract.', 'నువ్వు కూడావు. పెట్టెలోది తప్పిపోయిన భాగం, కాబట్టి తీసివేయి.')]], {}) ;
        }, 2),
      ],
    },
    {
      id: 'ts3.ma.add.break', title: L('Breaking numbers to add', 'సంఖ్యలను విడదీసి కూడటం'),
      intro: [
        h('Break, add, join', 'విడదీయి, కూడు, కలుపు'),
        p('To add 234 + 152 in your head, break both numbers into hundreds, tens and ones.', '234 + 152ని మనసులో కూడటానికి, రెండు సంఖ్యలను వందలు, పదులు, ఒకట్లుగా విడదీయి.'),
        vis({ kind: 'emoji', text: '200 + 100 = 300\n 30 +  50 =  80\n  4 +   2 =   6\n→ 386' }, 'Add hundreds, tens and ones separately', 'వందలు, పదులు, ఒకట్లు విడిగా కూడు'),
        p('Another trick: make a ten. 48 + 27 → give 2 from 27 to 48. Now it is 50 + 25 = 75.', 'ఇంకో ఉపాయం: పదిని తయారు చేయి. 48 + 27 → 27 నుండి 2ని 48కి ఇవ్వు. ఇప్పుడు 50 + 25 = 75.'),
        photo('🪙', L('Adding ₹200 + ₹100 first is easy. Then add the small coins.', 'ముందు ₹200 + ₹100 కూడటం సులభం. తర్వాత చిన్న నాణేలు కలుపు.')),
        keys(L('Hundreds with hundreds, tens with tens, ones with ones.', 'వందలతో వందలు, పదులతో పదులు, ఒకట్లతో ఒకట్లు.'), L('Round one number to the next ten, then fix the rest.', 'ఒక సంఖ్యను తర్వాతి పదికి చేర్చి, మిగిలినది కలుపు.')),
        tip('Adding 99? Add 100 and take 1 away!', '99 కలపాలా? 100 కలిపి 1 తీసివేయి!'),
      ],
      examples: [
        ex(same('325 + 143'), [same('300 + 100 = 400'), same('20 + 40 = 60'), same('5 + 3 = 8'), same('400 + 60 + 8 = 468')], same('468')),
        ex(same('59 + 36'), [L('Give 1 from 36 to 59: 60 + 35', '36 నుండి 1ని 59కి ఇవ్వు: 60 + 35'), same('60 + 35 = 95')], same('95')),
      ],
      practice: [
        tp('parts', (r) => {
          const a = r.int(1, 5) * 100 + r.int(1, 4) * 10 + r.int(1, 4), b = r.int(1, 3) * 100 + r.int(1, 5) * 10 + r.int(1, 5);
          const [A, Bd] = [dg(a), dg(b)]; const which = r.int(0, 2); const part = (A[which] + Bd[which]) * [100, 10, 1][which];
          return mcqN(r, L(`Break ${a} + ${b} into parts. What do the ${PLACE[which].en} add up to?`, `${a} + ${b}ని భాగాలుగా విడదీయి. ${PLACE[which].te} కలిపితే ఎంత?`), part, [A[which] + Bd[which], part * 10, part + [100, 10, 1][which]],
            [L(`Take the ${PLACE[which].en} part of each number.`, `ప్రతి సంఖ్య నుండి ${PLACE[which].te} భాగం తీసుకో.`), L(`${A[which] * [100, 10, 1][which]} + ${Bd[which] * [100, 10, 1][which]}`, `${A[which] * [100, 10, 1][which]} + ${Bd[which] * [100, 10, 1][which]}`)],
            [same(`${A[which] * [100, 10, 1][which]} + ${Bd[which] * [100, 10, 1][which]} = ${part}`), L(`Whole sum: ${a} + ${b} = ${a + b}`, `మొత్తం: ${a} + ${b} = ${a + b}`)]);
        }),
        tp('ten', (r) => {
          const a = r.int(2, 8) * 10 + r.pick([7, 8, 9]), b = r.int(11, 49);
          const give = 10 - (a % 10);
          return typed(L(`Make a ten to add: ${a} + ${b} = ?`, `పది తయారు చేసి కూడు: ${a} + ${b} = ?`), num(a + b),
            [L(`${a} needs ${give} more to reach ${a + give}.`, `${a}కి ${a + give} చేరడానికి ఇంకా ${give} కావాలి.`), L(`Take ${give} from ${b}: ${b} − ${give} = ${b - give}.`, `${b} నుండి ${give} తీసుకో: ${b} − ${give} = ${b - give}.`)],
            [same(`${a} + ${b} = ${a + give} + ${b - give}`), same(`${a + give} + ${b - give} = ${a + b}`)], [[String(a + b - 10), L('Check the tens again. A ten was made from the ones.', 'పదులు మళ్ళీ చూడు. ఒకట్ల నుండి ఒక పది ఏర్పడింది.')]]);
        }),
      ],
    },
    {
      id: 'ts3.ma.add.word', title: L('Addition word problems', 'కూడిక కథా సమస్యలు'),
      intro: [
        h('Stories that need adding', 'కూడిక కావలసిన కథలు'),
        p('Words like "in all", "altogether", "total" and "how many now" tell us to add.', '"మొత్తం", "అన్నీ కలిపి", "ఇప్పుడు ఎన్ని" లాంటి మాటలు కూడమని చెబుతాయి.'),
        photo('🌾', L('A farmer in Siddipet picked 235 kg of paddy on Monday and 148 kg on Tuesday. How much in all?', 'సిద్దిపేటలో ఒక రైతు సోమవారం 235 కిలోలు, మంగళవారం 148 కిలోలు వడ్లు కోశాడు. మొత్తం ఎంత?')),
        p('Step 1: find the numbers. Step 2: decide — add. Step 3: 235 + 148 = 383. Step 4: answer with the unit: 383 kg.', 'మెట్టు 1: సంఖ్యలు కనుగొను. మెట్టు 2: కూడాలి అని నిర్ణయించు. మెట్టు 3: 235 + 148 = 383. మెట్టు 4: యూనిట్‌తో జవాబు: 383 కిలోలు.'),
        keys(L('Read the story twice.', 'కథను రెండు సార్లు చదువు.'), L('Put two parts together → add.', 'రెండు భాగాలు కలిపితే → కూడిక.'), L('Check: is the answer bigger than each part?', 'సరిచూడు: జవాబు ప్రతి భాగం కంటే పెద్దదా?')),
        tip('Draw a quick picture or a bar to see the parts and the whole.', 'భాగాలు, మొత్తం చూడటానికి చిన్న బొమ్మ లేదా పట్టీ గీయి.'),
      ],
      examples: [
        ex(L('A school has 256 girls and 238 boys. How many children in all?', 'ఒక బడిలో 256 బాలికలు, 238 బాలురు ఉన్నారు. మొత్తం ఎంత మంది పిల్లలు?'), [L('"In all" → add.', '"మొత్తం" → కూడిక.'), same('256 + 238 = 494')], L('494 children', '494 మంది పిల్లలు')),
        ex(L('Kavya had ₹125. Her grandmother gave her ₹75 more. How much does she have now?', 'కావ్య దగ్గర ₹125 ఉన్నాయి. నానమ్మ ఇంకా ₹75 ఇచ్చింది. ఇప్పుడు ఎంత ఉంది?'), [L('She got more → add.', 'ఇంకా వచ్చింది → కూడిక.'), same('125 + 75 = 200')], same('₹200')),
      ],
      practice: [
        tp('story', (r) => {
          const who = nm(r); const a = r.int(115, 480), b = r.int(105, 999 - a);
          const k = r.int(0, 3);
          const stories: [S, S][] = [
            [L(`${who.en}'s school library has ${a} Telugu books and ${b} English books. How many books in all?`, `${who.te} బడి గ్రంథాలయంలో ${a} తెలుగు పుస్తకాలు, ${b} ఇంగ్లీష్ పుస్తకాలు ఉన్నాయి. మొత్తం ఎన్ని పుస్తకాలు?`), L('books', 'పుస్తకాలు')],
            [L(`At the Bathukamma festival, ${a} flowers were yellow and ${b} were pink. How many flowers altogether?`, `బతుకమ్మ పండుగలో ${a} పసుపు పువ్వులు, ${b} గులాబీ రంగు పువ్వులు ఉన్నాయి. అన్నీ కలిపి ఎన్ని పువ్వులు?`), L('flowers', 'పువ్వులు')],
            [L(`A bus carried ${a} people in the morning and ${b} in the evening. How many people in all?`, `ఒక బస్సు ఉదయం ${a} మందిని, సాయంత్రం ${b} మందిని తీసుకెళ్ళింది. మొత్తం ఎంత మంది?`), L('people', 'మంది')],
            [L(`${who.en} saved ₹${a} and then got ₹${b} as a gift. How many rupees now?`, `${who.te} ₹${a} దాచుకుంది/దాచుకున్నాడు, తర్వాత బహుమతిగా ₹${b} వచ్చాయి. ఇప్పుడు ఎన్ని రూపాయలు?`), L('rupees', 'రూపాయలు')],
          ];
          const [q, unit] = stories[k];
          return typed(q, num(a + b), [L('Two amounts are put together. Add.', 'రెండు మొత్తాలు కలుస్తున్నాయి. కూడు.'), L('Line up the ones, tens and hundreds before adding.', 'కూడే ముందు ఒకట్లు, పదులు, వందలు సరిగ్గా వరుసలో పెట్టు.')],
            [same(`${a} + ${b} = ${a + b}`), L(`Answer: ${a + b} ${unit.en}`, `జవాబు: ${a + b} ${unit.te}`)],
            [[String(Math.abs(a - b)), L('You subtracted. "In all" means put together, so add.', 'నువ్వు తీసివేశావు. "మొత్తం" అంటే కలపడం, కూడాలి.')], [String(noCarry(a, b)), L('Remember to carry when a column makes 10 or more.', 'వరుస 10 లేదా ఎక్కువైతే బదిలీ మర్చిపోకు.')]]);
        }),
        tp('three', (r) => {
          const xs = [r.int(21, 99), r.int(21, 99), r.int(21, 99)]; const t = xs[0] + xs[1] + xs[2];
          const th = r.pick(THINGS);
          return typed(L(`Three baskets have ${xs.join(', ')} ${th.en}. How many ${th.en} in all?`, `మూడు బుట్టల్లో ${xs.join(', ')} ${th.te} ఉన్నాయి. మొత్తం ఎన్ని ${th.te}?`), num(t),
            [L('Add the first two, then add the third.', 'మొదటి రెండు కూడి, తర్వాత మూడోది కలుపు.'), same(`${xs[0]} + ${xs[1]} = ${xs[0] + xs[1]}`)],
            [same(`${xs[0]} + ${xs[1]} = ${xs[0] + xs[1]}`), same(`${xs[0] + xs[1]} + ${xs[2]} = ${t}`)], [[String(xs[0] + xs[1]), L('You added only two baskets. Add the third one too.', 'రెండు బుట్టలే కూడావు. మూడోది కూడా కలుపు.')]]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 4 SUBTRACTION
const ch4: USpec = {
  id: 'ts3.ma.ch4', subject: 'math', title: L('Subtraction', 'తీసివేత'), source: src(4),
  objectives: [
    {
      id: 'ts3.ma.sub.borrow', title: L('Subtracting with borrowing', 'అప్పు తీసుకుని తీసివేత'),
      intro: [
        h('Not enough ones? Open a ten!', 'ఒకట్లు చాలవా? ఒక పదిని విప్పు!'),
        p('Find 352 − 128. Ones: we cannot take 8 from 2. So we borrow: open 1 ten from the tens column. Now we have 12 ones and 4 tens.', '352 − 128 కనుగొను. ఒకట్లు: 2 నుండి 8 తీయలేం. కాబట్టి అప్పు: పదుల నుండి 1 పదిని విప్పు. ఇప్పుడు 12 ఒకట్లు, 4 పదులు.'),
        p('12 − 8 = 4. Tens: 4 − 2 = 2. Hundreds: 3 − 1 = 2. Answer: 224.', '12 − 8 = 4. పదులు: 4 − 2 = 2. వందలు: 3 − 1 = 2. జవాబు: 224.'),
        vis({ kind: 'emoji', text: '    4 ¹²\n  3 5 2\n− 1 2 8\n= 2 2 4' }, 'Borrowing one ten to make 12 ones', '12 ఒకట్ల కోసం ఒక పదిని అప్పు తీసుకోవడం'),
        photo('🪙', L('Like changing a ₹10 note into ten ₹1 coins when you need small change.', 'చిల్లర కావలసినప్పుడు ₹10 నోటును పది ₹1 నాణేలుగా మార్చినట్టే.')),
        X({
          title: L('What if? Change the numbers', 'సంఖ్యలు మారిస్తే?'), formula: 'Difference = a − b',
          result: ['D', L('Difference', 'భేదం'), 'a - b'],
          vars: [['a', L('Bigger number', 'పెద్ద సంఖ్య'), 300, 900, 10, 500], ['b', L('Number taken away', 'తీసివేసే సంఖ్య'), 10, 290, 10, 120]],
          notes: [['a', L('Start with more, and more is left.', 'ఎక్కువతో మొదలుపెడితే ఎక్కువ మిగులుతుంది.'), L('Start with less, and less is left.', 'తక్కువతో మొదలుపెడితే తక్కువ మిగులుతుంది.')],
            ['b', L('Take away more, and LESS is left. The difference goes down!', 'ఎక్కువ తీసేస్తే తక్కువ మిగులుతుంది. భేదం తగ్గుతుంది!'), L('Take away less, and more is left.', 'తక్కువ తీసేస్తే ఎక్కువ మిగులుతుంది.')]],
          mistakes: [[L('Taking the smaller digit from the bigger one in every column', 'ప్రతి వరుసలో పెద్ద అంకె నుండి చిన్న అంకె తీయడం'), L('Always take the BOTTOM digit from the TOP digit. If the top is smaller, borrow.', 'ఎప్పుడూ పై అంకె నుండి కింది అంకె తీయి. పైది చిన్నదైతే అప్పు తీసుకో.')]],
          real: L('When you buy something, the shopkeeper subtracts to find your change.', 'ఏదైనా కొన్నప్పుడు నీ చిల్లర ఎంతో దుకాణదారు తీసివేతతో కనుగొంటాడు.'),
        }),
        keys(L('Start from the ones.', 'ఒకట్ల నుండి మొదలుపెట్టు.'), L('Top digit too small? Borrow 1 from the next place: it becomes 10 more.', 'పై అంకె చిన్నదా? తర్వాతి స్థానం నుండి 1 అప్పు: 10 ఎక్కువ అవుతుంది.'), L('After borrowing, the next place has 1 less.', 'అప్పు తర్వాత ఆ స్థానంలో 1 తక్కువ.')),
        remember('To borrow from a 0, first borrow from the hundreds: 500 becomes 4 hundreds, 9 tens, 10 ones.', '0 నుండి అప్పు కావాలంటే ముందు వందల నుండి: 500 = 4 వందలు, 9 పదులు, 10 ఒకట్లు.'),
        tip('Check by adding: answer + number taken away = the first number.', 'కూడి సరిచూడు: జవాబు + తీసిన సంఖ్య = మొదటి సంఖ్య.'),
      ],
      examples: [
        ex(same('543 − 267'), [L('Ones: 3 < 7, borrow → 13 − 7 = 6', 'ఒకట్లు: 3 < 7, అప్పు → 13 − 7 = 6'), L('Tens: 3 < 6, borrow → 13 − 6 = 7', 'పదులు: 3 < 6, అప్పు → 13 − 6 = 7'), L('Hundreds: 4 − 2 = 2', 'వందలు: 4 − 2 = 2')], same('276')),
        ex(same('400 − 156'), [L('400 = 3 hundreds, 9 tens, 10 ones', '400 = 3 వందలు, 9 పదులు, 10 ఒకట్లు'), L('10 − 6 = 4, 9 − 5 = 4, 3 − 1 = 2', '10 − 6 = 4, 9 − 5 = 4, 3 − 1 = 2')], same('244')),
      ],
      practice: [
        tp('col', (r) => {
          let a = 0, b = 0;
          do { a = r.int(300, 950); b = r.int(105, a - 50); } while ((a % 10) >= (b % 10));
          return typed(L(`Subtract: ${a} − ${b}`, `తీసివేయి: ${a} − ${b}`), num(a - b),
            [L(`Ones: ${a % 10} is smaller than ${b % 10}. Borrow 1 ten.`, `ఒకట్లు: ${a % 10}, ${b % 10} కంటే చిన్నది. 1 పది అప్పు తీసుకో.`), L(`${(a % 10) + 10} − ${b % 10} = ${(a % 10) + 10 - (b % 10)}`, `${(a % 10) + 10} − ${b % 10} = ${(a % 10) + 10 - (b % 10)}`)],
            [L(`Ones: ${(a % 10) + 10} − ${b % 10} = ${(a % 10) + 10 - (b % 10)}`, `ఒకట్లు: ${(a % 10) + 10} − ${b % 10} = ${(a % 10) + 10 - (b % 10)}`), same(`${a} − ${b} = ${a - b}`), L(`Check: ${a - b} + ${b} = ${a}`, `సరిచూడు: ${a - b} + ${b} = ${a}`)],
            [[String(smallFromBig(a, b)), L('You took the smaller digit from the bigger one. Always take the bottom from the top, and borrow when needed.', 'చిన్న అంకెను పెద్దదాని నుండి తీశావు. ఎప్పుడూ పై నుండి కిందిది తీయి, అవసరమైతే అప్పు తీసుకో.')]], { visual: { kind: 'emoji', text: `  ${a}\n− ${b}\n= ?` } });
        }),
        tp('zero', (r) => {
          const a = r.pick([200, 300, 400, 500, 600, 700, 800, 900, 305, 402, 503, 601, 704]); const b = r.int(101, Math.min(a - 11, 389));
          return typed(L(`Subtract: ${a} − ${b}`, `తీసివేయి: ${a} − ${b}`), num(a - b),
            [L('There is a 0 at the top. Borrow from the hundreds first.', 'పైన 0 ఉంది. ముందు వందల నుండి అప్పు తీసుకో.'), L(`${Math.floor(a / 100) * 100} = ${Math.floor(a / 100) - 1} hundreds + 9 tens + 10 ones`, `${Math.floor(a / 100) * 100} = ${Math.floor(a / 100) - 1} వందలు + 9 పదులు + 10 ఒకట్లు`)],
            [same(`${a} − ${b} = ${a - b}`), L(`Check: ${a - b} + ${b} = ${a}`, `సరిచూడు: ${a - b} + ${b} = ${a}`)],
            [[String(smallFromBig(a, b)), L('0 minus a digit is not that digit. Borrow to make the 0 into 10.', '0 నుండి ఒక అంకె తీస్తే ఆ అంకె రాదు. అప్పు తీసుకుని 0ని 10 చేయి.')]], {}, );
        }, 2),
      ],
    },
    {
      id: 'ts3.ma.sub.check', title: L('Checking subtraction and missing numbers', 'తీసివేతను సరిచూడటం, తప్పిపోయిన సంఖ్యలు'),
      intro: [
        h('Adding undoes subtracting', 'కూడిక తీసివేతను తిప్పికొడుతుంది'),
        p('If 452 − 178 = 274, then 274 + 178 must give 452 again. That is how we check.', '452 − 178 = 274 అయితే, 274 + 178 మళ్ళీ 452 ఇవ్వాలి. ఇలా సరిచూస్తాం.'),
        vis({ kind: 'emoji', text: '452 − 178 = 274\n274 + 178 = 452 ✓' }, 'Subtraction checked by addition', 'కూడికతో తీసివేతను సరిచూడటం'),
        photo('✅', L('If the check gives back the first number, your answer is right!', 'సరిచూస్తే మొదటి సంఖ్య మళ్ళీ వస్తే, నీ జవాబు సరైనది!')),
        keys(L('Answer + number taken away = starting number.', 'జవాబు + తీసిన సంఖ్య = మొదటి సంఖ్య.'), L('Missing number in ☐ + 120 = 300? Find 300 − 120.', '☐ + 120 = 300లో తప్పిపోయిన సంఖ్య? 300 − 120 కనుగొను.')),
        tip('A part + a part = the whole. Whole − one part = the other part.', 'భాగం + భాగం = మొత్తం. మొత్తం − ఒక భాగం = మరో భాగం.'),
      ],
      examples: [
        ex(L('Check: is 615 − 248 = 367 right?', 'సరిచూడు: 615 − 248 = 367 సరైనదా?'), [same('367 + 248 = 615'), L('We got 615 back.', 'మళ్ళీ 615 వచ్చింది.')], L('Yes, it is right', 'అవును, సరైనది')),
        ex(L('☐ − 135 = 260. Find ☐.', '☐ − 135 = 260. ☐ కనుగొను.'), [L('The box is the whole.', 'పెట్టెలోది మొత్తం.'), same('260 + 135 = 395')], same('395')),
      ],
      practice: [
        tp('check', (r) => {
          const a = r.int(320, 950), b = r.int(110, a - 100), d = a - b;
          const ok = r.int(0, 1) === 1; const shown = ok ? d : d + r.pick([10, -10, 100, 1]);
          return mcq(r, L(`Is ${a} − ${b} = ${shown} right? Check by adding.`, `${a} − ${b} = ${shown} సరైనదా? కూడి సరిచూడు.`), ok ? L('Yes, it is right', 'అవును, సరైనది') : L('No, it is wrong', 'కాదు, తప్పు'), [ok ? L('No, it is wrong', 'కాదు, తప్పు') : L('Yes, it is right', 'అవును, సరైనది')],
            [L(`Add ${shown} + ${b}.`, `${shown} + ${b} కూడు.`), L(`Do you get ${a}?`, `${a} వచ్చిందా?`)],
            [same(`${shown} + ${b} = ${shown + b}`), ok ? L(`${shown + b} = ${a}, so it is right.`, `${shown + b} = ${a}, కాబట్టి సరైనది.`) : L(`${shown + b} is not ${a}. The right answer is ${d}.`, `${shown + b}, ${a} కాదు. సరైన జవాబు ${d}.`)],
            [['wrong', L('Add the answer and the number taken away. It must equal the first number.', 'జవాబు, తీసిన సంఖ్య కూడు. అది మొదటి సంఖ్యకు సమానం కావాలి.')]]);
        }),
        tp('box', (r) => {
          const b = r.int(105, 380), c = r.int(110, 500), a = b + c;
          const k = r.int(0, 2);
          const forms: [S, number, string][] = [
            [same(`☐ − ${b} = ${c}`), a, String(c - b)], [same(`${a} − ☐ = ${c}`), b, String(a + c)], [same(`☐ + ${b} = ${a}`), c, String(a + b)],
          ];
          const [eq, ans, slip] = forms[k];
          return typed(L(`Find the missing number: ${eq.en}`, `తప్పిపోయిన సంఖ్య కనుగొను: ${eq.te}`), num(ans),
            [L('Think: which number is the whole?', 'ఆలోచించు: ఏ సంఖ్య మొత్తం?'), k === 0 ? L('The box is the whole. Add the two parts.', 'పెట్టెలోది మొత్తం. రెండు భాగాలు కూడు.') : L('The box is a part. Whole − other part.', 'పెట్టెలోది ఒక భాగం. మొత్తం − మరో భాగం.')],
            [k === 0 ? same(`${b} + ${c} = ${a}`) : k === 1 ? same(`${a} − ${c} = ${b}`) : same(`${a} − ${b} = ${c}`)],
            [[slip, L('Find the whole first. Then decide: add the parts, or take a part from the whole.', 'ముందు మొత్తం ఏదో కనుగొను. తర్వాత: భాగాలు కూడాలా, మొత్తం నుండి భాగం తీయాలా.')]]);
        }, 2),
      ],
    },
    {
      id: 'ts3.ma.sub.money', title: L('Money problems with subtraction', 'డబ్బు తీసివేత సమస్యలు'),
      intro: [
        h('How much is left?', 'ఎంత మిగిలింది?'),
        p('Teja has ₹500. He buys a school bag for ₹365. How much money is left? We subtract: 500 − 365 = 135. ₹135 is left.', 'తేజ దగ్గర ₹500 ఉన్నాయి. ₹365కి బడి సంచి కొన్నాడు. ఎంత మిగిలింది? తీసివేయాలి: 500 − 365 = 135. ₹135 మిగిలాయి.'),
        photo('🎒', L('A school bag for ₹365 paid with a ₹500 note: the change is ₹135.', '₹365 సంచికి ₹500 నోటు ఇస్తే చిల్లర ₹135.')),
        vis({ kind: 'coins', rupees: [100, 20, 10, 5] }, 'Change of ₹135: ₹100 + ₹20 + ₹10 + ₹5', '₹135 చిల్లర: ₹100 + ₹20 + ₹10 + ₹5'),
        keys(L('"Left", "change", "spent", "remaining" → subtract.', '"మిగిలింది", "చిల్లర", "ఖర్చు", "మిగతా" → తీసివేత.'), L('Money given − price = change.', 'ఇచ్చిన డబ్బు − ధర = చిల్లర.')),
        tip('Count up to check the change: 365 + 35 = 400, + 100 = 500. Change = 35 + 100 = ₹135.', 'చిల్లర సరిచూడటానికి పైకి లెక్కించు: 365 + 35 = 400, + 100 = 500. చిల్లర = 35 + 100 = ₹135.'),
      ],
      examples: [
        ex(L('Meena had ₹250. She spent ₹175 at the fair. How much is left?', 'మీనా దగ్గర ₹250 ఉన్నాయి. జాతరలో ₹175 ఖర్చు చేసింది. ఎంత మిగిలింది?'), [L('"Left" → subtract.', '"మిగిలింది" → తీసివేత.'), same('250 − 175 = 75')], same('₹75')),
        ex(L('A pair of slippers costs ₹180. Anil pays with a ₹200 note. What change does he get?', 'చెప్పుల జత ₹180. అనిల్ ₹200 నోటు ఇచ్చాడు. ఎంత చిల్లర వస్తుంది?'), [same('200 − 180 = 20')], same('₹20')),
      ],
      practice: [
        tp('change', (r) => {
          const who = nm(r); const note = r.pick([100, 200, 500]);
          const item = r.pick<[S, number]>([[L('a geometry box', 'జామెట్రీ బాక్స్'), 0], [L('a water bottle', 'నీళ్ళ సీసా'), 0], [L('a storybook', 'కథల పుస్తకం'), 0], [L('a cricket ball', 'క్రికెట్ బంతి'), 0], [L('a pencil box', 'పెన్సిల్ డబ్బా'), 0], [L('a toy car', 'బొమ్మ కారు'), 0]])[0];
          const price = r.int(Math.floor(note * 0.3), note - 5);
          return typed(L(`${who.en} buys ${item.en} for ₹${price} and pays with a ₹${note} note. How much change?`, `${who.te} ₹${price}కి ${item.te} కొని ₹${note} నోటు ఇచ్చారు. ఎంత చిల్లర వస్తుంది?`), num(note - price),
            [L('Change = money given − price.', 'చిల్లర = ఇచ్చిన డబ్బు − ధర.'), same(`${note} − ${price}`)],
            [same(`${note} − ${price} = ${note - price}`), L(`Change: ₹${note - price}`, `చిల్లర: ₹${note - price}`)],
            [[String(note + price), L('You added. Change is what comes back, so subtract.', 'నువ్వు కూడావు. చిల్లర తిరిగి వచ్చేది, కాబట్టి తీసివేయి.')], [String(smallFromBig(note, price)), L('Borrow from the hundreds to subtract from 0.', '0 నుండి తీయడానికి వందల నుండి అప్పు తీసుకో.')]]);
        }),
        tp('left', (r) => {
          const who = nm(r); const had = r.int(25, 95) * 10, spent = r.int(11, Math.floor(had * 0.8));
          return typed(L(`${who.en} had ₹${had}. ${who.en} spent ₹${spent} on vegetables at the rythu bazaar. How much money is left?`, `${who.te} దగ్గర ₹${had} ఉన్నాయి. రైతు బజార్‌లో కూరగాయలకు ₹${spent} ఖర్చు చేశారు. ఎంత డబ్బు మిగిలింది?`), num(had - spent),
            [L('"Left" means subtract.', '"మిగిలింది" అంటే తీసివేయి.'), same(`${had} − ${spent}`)],
            [same(`${had} − ${spent} = ${had - spent}`), L(`₹${had - spent} is left.`, `₹${had - spent} మిగిలాయి.`)],
            [[String(had + spent), L('Spending makes your money less. Subtract.', 'ఖర్చు చేస్తే డబ్బు తగ్గుతుంది. తీసివేయి.')]]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 5 USING ADDITION AND SUBTRACTION
const SHOP: [S, number][] = [
  [L('school bag', 'బడి సంచి'), 0], [L('umbrella', 'గొడుగు'), 0], [L('water bottle', 'నీళ్ళ సీసా'), 0], [L('lunch box', 'టిఫిన్ బాక్స్'), 0],
  [L('pair of shoes', 'బూట్ల జత'), 0], [L('storybook', 'కథల పుస్తకం'), 0], [L('cricket bat', 'క్రికెట్ బ్యాట్'), 0], [L('frock', 'గౌను'), 0],
];
const ch5: USpec = {
  id: 'ts3.ma.ch5', subject: 'math', title: L('Using Addition and Subtraction', 'కూడిక, తీసివేతల వినియోగం'), source: src(5),
  objectives: [
    {
      id: 'ts3.ma.use.more', title: L('How many more? How many less?', 'ఎన్ని ఎక్కువ? ఎన్ని తక్కువ?'),
      intro: [
        h('Compare two amounts', 'రెండు మొత్తాలను పోల్చు'),
        p('Class 3 collected 145 empty bottles for recycling. Class 4 collected 182. How many more did Class 4 collect?', '3వ తరగతి రీసైక్లింగ్ కోసం 145 ఖాళీ సీసాలు సేకరించింది. 4వ తరగతి 182 సేకరించింది. 4వ తరగతి ఎన్ని ఎక్కువ సేకరించింది?'),
        vis({ kind: 'bar-graph', labels: ['Class 3', 'Class 4'], values: [145, 182], unit: 'bottles' }, 'Class 4 has the longer bar', '4వ తరగతి పట్టీ పొడవుగా ఉంది'),
        p('"How many more" asks for the difference: 182 − 145 = 37. Class 4 collected 37 more. Class 3 collected 37 less.', '"ఎన్ని ఎక్కువ" అంటే భేదం: 182 − 145 = 37. 4వ తరగతి 37 ఎక్కువ. 3వ తరగతి 37 తక్కువ.'),
        photo('🧴', L('Comparing two heaps of bottles: the extra part is the difference.', 'రెండు సీసాల కుప్పలను పోల్చడం: అదనపు భాగమే భేదం.')),
        keys(L('More / less / fewer / difference → bigger − smaller.', 'ఎక్కువ / తక్కువ / భేదం → పెద్దది − చిన్నది.'), L('"37 more than 145" → add: 145 + 37.', '"145 కంటే 37 ఎక్కువ" → కూడు: 145 + 37.'), L('"37 less than 182" → subtract: 182 − 37.', '"182 కంటే 37 తక్కువ" → తీసివేయి: 182 − 37.')),
        tip('Look at the question word carefully: "how many more" is a difference, "37 more than" is an addition.', 'ప్రశ్నను జాగ్రత్తగా చదువు: "ఎన్ని ఎక్కువ" అంటే భేదం, "37 ఎక్కువ" అంటే కూడిక.'),
      ],
      examples: [
        ex(L('Ravi has 64 marbles. Imran has 91. How many fewer does Ravi have?', 'రవి దగ్గర 64 గోలీలు, ఇమ్రాన్ దగ్గర 91. రవి దగ్గర ఎన్ని తక్కువ?'), [L('Difference: bigger − smaller', 'భేదం: పెద్దది − చిన్నది'), same('91 − 64 = 27')], L('27 fewer', '27 తక్కువ'), { kind: 'bar-graph', labels: ['Ravi', 'Imran'], values: [64, 91] }),
        ex(L('A neem tree is 125 cm taller than a 230 cm wall. How tall is the tree?', 'వేప చెట్టు 230 సెం.మీ. గోడ కంటే 125 సెం.మీ. ఎత్తు. చెట్టు ఎత్తు ఎంత?'), [L('"Taller than" → add.', '"కంటే ఎత్తు" → కూడు.'), same('230 + 125 = 355')], L('355 cm', '355 సెం.మీ.')),
      ],
      practice: [
        tp('diff', (r) => {
          const [p1, p2] = r.shuffle(NAMES).slice(0, 2); const th = r.pick(THINGS);
          const a = r.int(40, 400), b = a + r.int(12, 150); const askMore = r.int(0, 1) === 1;
          return typed(askMore ? L(`${p1.en} has ${a} ${th.en}. ${p2.en} has ${b} ${th.en}. How many more does ${p2.en} have?`, `${p1.te} దగ్గర ${a} ${th.te}, ${p2.te} దగ్గర ${b} ${th.te} ఉన్నాయి. ${p2.te} దగ్గర ఎన్ని ఎక్కువ?`)
            : L(`${p1.en} has ${a} ${th.en}. ${p2.en} has ${b} ${th.en}. How many fewer does ${p1.en} have?`, `${p1.te} దగ్గర ${a} ${th.te}, ${p2.te} దగ్గర ${b} ${th.te} ఉన్నాయి. ${p1.te} దగ్గర ఎన్ని తక్కువ?`), num(b - a),
            [L('Find the difference.', 'భేదం కనుగొను.'), same(`${b} − ${a}`)], [same(`${b} − ${a} = ${b - a}`)],
            [[String(a + b), L('You added. "How many more/fewer" asks for the difference: subtract.', 'నువ్వు కూడావు. "ఎన్ని ఎక్కువ/తక్కువ" అంటే భేదం: తీసివేయి.')]], { visual: { kind: 'bar-graph', labels: [p1.en, p2.en], values: [a, b] } });
        }),
        tp('than', (r) => {
          const a = r.int(120, 600), k = r.int(15, 250); const more = r.int(0, 1) === 1 || a - k < 10;
          const ans = more ? a + k : a - k;
          return typed(more ? L(`What number is ${k} more than ${a}?`, `${a} కంటే ${k} ఎక్కువ ఏ సంఖ్య?`) : L(`What number is ${k} less than ${a}?`, `${a} కంటే ${k} తక్కువ ఏ సంఖ్య?`), num(ans),
            [more ? L('"More than" → add.', '"కంటే ఎక్కువ" → కూడు.') : L('"Less than" → subtract.', '"కంటే తక్కువ" → తీసివేయి.')],
            [same(more ? `${a} + ${k} = ${ans}` : `${a} − ${k} = ${ans}`)],
            [[String(more ? a - k : a + k), more ? L('"More" makes the number bigger. Add.', '"ఎక్కువ" అంటే సంఖ్య పెరుగుతుంది. కూడు.') : L('"Less" makes the number smaller. Subtract.', '"తక్కువ" అంటే సంఖ్య తగ్గుతుంది. తీసివేయి.')]]);
        }),
      ],
    },
    {
      id: 'ts3.ma.use.price', title: L('Comparing prices', 'ధరల పోలిక'),
      intro: [
        h('Which is cheaper?', 'ఏది చౌక?'),
        p('At a shop in Karimnagar, a steel bottle costs ₹245 and a plastic bottle costs ₹120. The plastic one is cheaper by 245 − 120 = ₹125.', 'కరీంనగర్‌లో ఒక దుకాణంలో స్టీలు సీసా ₹245, ప్లాస్టిక్ సీసా ₹120. ప్లాస్టిక్ సీసా 245 − 120 = ₹125 చౌక.'),
        photo('🛒', L('Before buying, compare prices and add up what you need.', 'కొనే ముందు ధరలు పోల్చి, కావలసినవి కూడు.')),
        p('Buying both? Add the prices: 245 + 120 = ₹365.', 'రెండూ కొంటే? ధరలు కూడు: 245 + 120 = ₹365.'),
        keys(L('Cheaper = smaller price. Costlier = bigger price.', 'చౌక = తక్కువ ధర. ఖరీదు = ఎక్కువ ధర.'), L('"Costs more by how much?" → subtract.', '"ఎంత ఎక్కువ ధర?" → తీసివేయి.'), L('"Cost of both?" → add.', '"రెండింటి ధర?" → కూడు.')),
        tip('Can you buy both? Add the prices and compare with the money you have.', 'రెండూ కొనగలవా? ధరలు కూడి నీ దగ్గర ఉన్న డబ్బుతో పోల్చు.'),
      ],
      examples: [
        ex(L('A frock costs ₹350 and a shirt costs ₹275. Which costs more, and by how much?', 'గౌను ₹350, చొక్కా ₹275. ఏది ఎక్కువ ధర, ఎంత?'), [L('350 > 275, so the frock costs more.', '350 > 275, కాబట్టి గౌను ఎక్కువ.'), same('350 − 275 = 75')], L('The frock, by ₹75', 'గౌను, ₹75 ఎక్కువ')),
        ex(L('Sana has ₹400. Can she buy a bag for ₹260 and an umbrella for ₹180?', 'సనా దగ్గర ₹400 ఉన్నాయి. ₹260 సంచి, ₹180 గొడుగు కొనగలదా?'), [same('260 + 180 = 440'), L('440 > 400, not enough money.', '440 > 400, డబ్బు చాలదు.')], L('No, she needs ₹40 more', 'లేదు, ఇంకా ₹40 కావాలి')),
      ],
      practice: [
        tp('cheap', (r) => {
          const [i1, i2] = r.shuffle(SHOP).slice(0, 2).map((x) => x[0]);
          const a = r.int(110, 480), b = a + r.int(15, 300); const swap = r.int(0, 1) === 1;
          const [pa, pb] = swap ? [b, a] : [a, b];
          return typed(L(`A ${i1.en} costs ₹${pa}. A ${i2.en} costs ₹${pb}. How much cheaper is the cheaper one?`, `${i1.te} ధర ₹${pa}. ${i2.te} ధర ₹${pb}. చౌకైనది ఎంత తక్కువ?`), num(b - a),
            [L('Find the difference of the two prices.', 'రెండు ధరల భేదం కనుగొను.'), same(`${b} − ${a}`)], [same(`${b} − ${a} = ${b - a}`), L(`It is ₹${b - a} cheaper.`, `అది ₹${b - a} చౌక.`)],
            [[String(a + b), L('That is the cost of both. "How much cheaper" is a difference.', 'అది రెండింటి ధర. "ఎంత చౌక" అంటే భేదం.')]]);
        }),
        tp('afford', (r) => {
          const who = nm(r); const [i1, i2] = r.shuffle(SHOP).slice(0, 2).map((x) => x[0]);
          const a = r.int(12, 45) * 10, b = r.int(8, 40) * 10, have = r.pick([500, 600, 700, 800]);
          const total = a + b; const ok = total <= have;
          return mcq(r, L(`${who.en} has ₹${have}. A ${i1.en} costs ₹${a} and a ${i2.en} costs ₹${b}. Can ${who.en} buy both?`, `${who.te} దగ్గర ₹${have} ఉన్నాయి. ${i1.te} ₹${a}, ${i2.te} ₹${b}. రెండూ కొనగలరా?`),
            ok ? L(`Yes, ₹${have - total} will be left`, `అవును, ₹${have - total} మిగులుతాయి`) : L(`No, ₹${total - have} more is needed`, `లేదు, ఇంకా ₹${total - have} కావాలి`),
            ok ? [L(`No, ₹${Math.abs(total - have) + 10} more is needed`, `లేదు, ఇంకా ₹${Math.abs(total - have) + 10} కావాలి`), L(`Yes, ₹${have - total + 100} will be left`, `అవును, ₹${have - total + 100} మిగులుతాయి`)]
              : [L(`Yes, ₹${total - have} will be left`, `అవును, ₹${total - have} మిగులుతాయి`), L(`No, ₹${total - have + 100} more is needed`, `లేదు, ఇంకా ₹${total - have + 100} కావాలి`)],
            [L('Add the two prices first.', 'ముందు రెండు ధరలు కూడు.'), L(`Compare ${a} + ${b} with ₹${have}.`, `${a} + ${b}ను ₹${have}తో పోల్చు.`)],
            [same(`${a} + ${b} = ${total}`), ok ? L(`${total} ≤ ${have}. Left: ${have} − ${total} = ₹${have - total}`, `${total} ≤ ${have}. మిగిలేది: ${have} − ${total} = ₹${have - total}`) : L(`${total} > ${have}. Short by ${total} − ${have} = ₹${total - have}`, `${total} > ${have}. తక్కువ: ${total} − ${have} = ₹${total - have}`)],
            [['wrong', L('Find the total cost first, then compare it with the money in hand.', 'ముందు మొత్తం ధర కనుగొని, చేతిలో ఉన్న డబ్బుతో పోల్చు.')]], {});
        }, 2),
      ],
    },
    {
      id: 'ts3.ma.use.choose', title: L('Add or subtract? Two-step problems', 'కూడాలా, తీసివేయాలా? రెండు మెట్ల సమస్యలు'),
      intro: [
        h('Think before you calculate', 'లెక్కించే ముందు ఆలోచించు'),
        p('Putting together or getting more → add. Taking away, giving away, finding what is left or the difference → subtract.', 'కలపడం లేదా ఇంకా రావడం → కూడిక. తీసేయడం, ఇచ్చేయడం, మిగిలింది లేదా భేదం → తీసివేత.'),
        photo('🚌', L('A bus had 48 people. 15 got off and 22 got on. Two steps: 48 − 15 = 33, then 33 + 22 = 55.', 'బస్సులో 48 మంది. 15 మంది దిగారు, 22 మంది ఎక్కారు. రెండు మెట్లు: 48 − 15 = 33, తర్వాత 33 + 22 = 55.')),
        keys(L('Step 1: what happens first? Step 2: what happens next?', 'మెట్టు 1: ముందు ఏమి జరిగింది? మెట్టు 2: తర్వాత ఏమి?'), L('Got on / bought more / received → add.', 'ఎక్కారు / ఇంకా కొన్నారు / వచ్చింది → కూడు.'), L('Got off / sold / ate / gave → subtract.', 'దిగారు / అమ్మారు / తిన్నారు / ఇచ్చారు → తీసివేయి.')),
        tip('Act the story out with counters or beads. It makes the steps clear.', 'కథను గోలీలు లేదా పూసలతో నటించి చూపు. మెట్లు స్పష్టంగా తెలుస్తాయి.'),
      ],
      examples: [
        ex(L('A shop had 120 mangoes. It sold 45 and then got 60 more. How many now?', 'ఒక దుకాణంలో 120 మామిడి పండ్లు ఉన్నాయి. 45 అమ్మారు, తర్వాత 60 వచ్చాయి. ఇప్పుడు ఎన్ని?'), [L('Sold → subtract: 120 − 45 = 75', 'అమ్మారు → తీసివేయి: 120 − 45 = 75'), L('Got more → add: 75 + 60 = 135', 'ఇంకా వచ్చాయి → కూడు: 75 + 60 = 135')], L('135 mangoes', '135 మామిడి పండ్లు')),
        ex(L('Diya read 36 pages on Monday and 28 on Tuesday. The book has 100 pages. How many are left?', 'దియా సోమవారం 36 పేజీలు, మంగళవారం 28 పేజీలు చదివింది. పుస్తకంలో 100 పేజీలు. ఎన్ని మిగిలాయి?'), [same('36 + 28 = 64'), same('100 − 64 = 36')], L('36 pages', '36 పేజీలు')),
      ],
      practice: [
        bank('op', [
          [L('Ravi had 85 stickers. He gave 30 to his sister. Add or subtract to find how many he has now?', 'రవి దగ్గర 85 స్టిక్కర్లు. చెల్లికి 30 ఇచ్చాడు. ఇప్పుడు ఎన్ని ఉన్నాయో కనుగొనడానికి కూడాలా, తీసివేయాలా?'), L('Subtract', 'తీసివేయాలి'), [L('Add', 'కూడాలి')], [L('Did he get more or give away?', 'అతనికి ఇంకా వచ్చాయా, ఇచ్చేశాడా?')], L('He gave some away, so subtract: 85 − 30 = 55.', 'కొన్ని ఇచ్చేశాడు, కాబట్టి తీసివేయి: 85 − 30 = 55.'), L('Giving away makes it less.', 'ఇచ్చేస్తే తగ్గుతుంది.')],
          [L('A tank had 250 litres. 150 litres more were filled. Add or subtract to find the total?', 'ట్యాంకులో 250 లీటర్లు ఉన్నాయి. ఇంకా 150 లీటర్లు నింపారు. మొత్తం కనుగొనడానికి కూడాలా, తీసివేయాలా?'), L('Add', 'కూడాలి'), [L('Subtract', 'తీసివేయాలి')], [L('Is water being put in or taken out?', 'నీళ్ళు పోస్తున్నారా, తీస్తున్నారా?')], L('More water was put in, so add: 250 + 150 = 400.', 'ఇంకా నీళ్ళు పోశారు, కాబట్టి కూడు: 250 + 150 = 400.'), L('Filling makes it more.', 'నింపితే పెరుగుతుంది.')],
          [L('Priya scored 78 and Kiran scored 65 in a game. Add or subtract to find how many more Priya scored?', 'ఆటలో ప్రియ 78, కిరణ్ 65 పాయింట్లు సాధించారు. ప్రియ ఎన్ని ఎక్కువ సాధించిందో కనుగొనడానికి కూడాలా, తీసివేయాలా?'), L('Subtract', 'తీసివేయాలి'), [L('Add', 'కూడాలి')], [L('"How many more" asks for a difference.', '"ఎన్ని ఎక్కువ" అంటే భేదం.')], L('Difference → subtract: 78 − 65 = 13.', 'భేదం → తీసివేయి: 78 − 65 = 13.'), L('A difference is found by subtracting.', 'భేదం తీసివేతతో వస్తుంది.')],
          [L('A farmer has 136 hens and 89 ducks. Add or subtract to find the number of birds in all?', 'ఒక రైతు దగ్గర 136 కోళ్ళు, 89 బాతులు ఉన్నాయి. మొత్తం పక్షుల సంఖ్యకు కూడాలా, తీసివేయాలా?'), L('Add', 'కూడాలి'), [L('Subtract', 'తీసివేయాలి')], [L('"In all" means put together.', '"మొత్తం" అంటే కలపడం.')], L('Put together → add: 136 + 89 = 225.', 'కలపడం → కూడు: 136 + 89 = 225.'), L('"In all" asks for the total.', '"మొత్తం" అంటే మొత్తం సంఖ్య.')],
          [L('There were 64 laddoos. The children ate 27. Add or subtract to find how many are left?', '64 లడ్డూలు ఉన్నాయి. పిల్లలు 27 తిన్నారు. ఎన్ని మిగిలాయో కనుగొనడానికి కూడాలా, తీసివేయాలా?'), L('Subtract', 'తీసివేయాలి'), [L('Add', 'కూడాలి')], [L('Eating makes the laddoos fewer.', 'తింటే లడ్డూలు తగ్గుతాయి.')], L('"Left" → subtract: 64 − 27 = 37.', '"మిగిలింది" → తీసివేయి: 64 − 27 = 37.'), L('Eaten ones are gone, so subtract.', 'తిన్నవి పోయాయి, కాబట్టి తీసివేయి.')],
          [L('Sita had ₹150. Her father gave her ₹50. Add or subtract to find how much she has now?', 'సీత దగ్గర ₹150 ఉన్నాయి. నాన్న ₹50 ఇచ్చారు. ఇప్పుడు ఎంత ఉందో కనుగొనడానికి కూడాలా, తీసివేయాలా?'), L('Add', 'కూడాలి'), [L('Subtract', 'తీసివేయాలి')], [L('Did she get more money?', 'ఆమెకు ఇంకా డబ్బు వచ్చిందా?')], L('She received more, so add: 150 + 50 = 200.', 'ఇంకా వచ్చింది, కాబట్టి కూడు: 150 + 50 = 200.'), L('Receiving money makes it more.', 'డబ్బు వస్తే పెరుగుతుంది.')],
        ]),
        tp('bus', (r) => {
          const start = r.int(30, 70), off = r.int(8, start - 10), on = r.int(5, 40); const mid = start - off, end = mid + on;
          const stop = r.pick([L('Jangaon', 'జనగామ'), L('Bhongir', 'భువనగిరి'), L('Siddipet', 'సిద్దిపేట'), L('Medak', 'మెదక్'), L('Suryapet', 'సూర్యాపేట')]);
          return typed(L(`A bus had ${start} people. At ${stop.en}, ${off} got off and ${on} got on. How many people are on the bus now?`, `బస్సులో ${start} మంది ఉన్నారు. ${stop.te}లో ${off} మంది దిగారు, ${on} మంది ఎక్కారు. ఇప్పుడు బస్సులో ఎంత మంది?`), num(end),
            [L('Step 1: people got off → subtract.', 'మెట్టు 1: దిగారు → తీసివేయి.'), L('Step 2: people got on → add.', 'మెట్టు 2: ఎక్కారు → కూడు.')],
            [same(`${start} − ${off} = ${mid}`), same(`${mid} + ${on} = ${end}`)],
            [[String(mid), L('That is after step 1 only. Now add the people who got on.', 'అది మెట్టు 1 తర్వాత మాత్రమే. ఎక్కిన వారిని కూడా కలుపు.')], [String(start + off + on), L('People who got off must be subtracted, not added.', 'దిగిన వారిని తీసివేయాలి, కలపకూడదు.')]]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 6 MULTIPLICATION
const ch6: USpec = {
  id: 'ts3.ma.ch6', subject: 'math', title: L('Multiplication', 'గుణకారం'), source: src(6),
  objectives: [
    {
      id: 'ts3.ma.mul.groups', title: L('Equal groups and repeated addition', 'సమాన గుంపులు, పునరావృత కూడిక'),
      intro: [
        h('Same number again and again', 'ఒకే సంఖ్య మళ్ళీ మళ్ళీ'),
        p('Amma puts 4 laddoos on each plate. There are 3 plates. 4 + 4 + 4 = 12. We can say 3 groups of 4, or 3 × 4 = 12.', 'అమ్మ ఒక్కో పళ్ళెంలో 4 లడ్డూలు పెట్టింది. 3 పళ్ళేలు ఉన్నాయి. 4 + 4 + 4 = 12. దీన్ని 4ల 3 గుంపులు, లేదా 3 × 4 = 12 అంటాం.'),
        vis({ kind: 'objects', emoji: '🟠', count: 12, groupsOf: 4 }, '3 groups of 4 laddoos', '4 లడ్డూల 3 గుంపులు'),
        photo('🍌', L('A bunch has 6 bananas. 2 bunches have 6 + 6 = 2 × 6 = 12 bananas.', 'ఒక గెలలో 6 అరటి పండ్లు. 2 గెలలలో 6 + 6 = 2 × 6 = 12.')),
        p('Plants in a garden stand in rows. 3 rows with 5 plants each: 3 × 5 = 15 plants. Move the sliders and see!', 'తోటలో మొక్కలు వరుసల్లో ఉంటాయి. ఒక్కో వరుసలో 5 మొక్కలతో 3 వరుసలు: 3 × 5 = 15. స్లైడర్లు కదిలించి చూడు!'),
        X({
          title: L('What if? Rows of plants', 'మొక్కల వరుసలు మారిస్తే?'), formula: 'Total = rows × plants in each row',
          result: ['T', L('Total plants', 'మొత్తం మొక్కలు'), 'r * c'],
          vars: [['r', L('Rows', 'వరుసలు'), 1, 10, 1, 3], ['c', L('Plants in each row', 'ఒక్కో వరుసలో మొక్కలు'), 1, 10, 1, 5]],
          notes: [['r', L('One more row adds one more group of plants to the total.', 'ఒక వరుస పెరిగితే మొత్తానికి ఇంకో గుంపు మొక్కలు కలుస్తాయి.'), L('One row less takes away one whole group.', 'ఒక వరుస తగ్గితే ఒక గుంపు మొత్తం తగ్గుతుంది.')],
            ['c', L('One more plant in each row adds one plant to EVERY row.', 'ఒక్కో వరుసలో ఒక మొక్క పెరిగితే ప్రతి వరుసకు ఒకటి కలుస్తుంది.'), L('One less in each row takes one from every row.', 'ఒక్కో వరుసలో ఒకటి తగ్గితే ప్రతి వరుస నుండి ఒకటి తగ్గుతుంది.')]],
          mistakes: [[L('Adding rows and plants: 3 + 5', 'వరుసలు, మొక్కలు కూడటం: 3 + 5'), L('3 rows of 5 means 5 + 5 + 5. That is 3 × 5 = 15, not 8.', '5ల 3 వరుసలు అంటే 5 + 5 + 5. అంటే 3 × 5 = 15, 8 కాదు.')]],
          real: L('Farmers plant chilli and cotton in neat rows. Multiplying tells them how many plants they have.', 'రైతులు మిరప, పత్తిని వరుసల్లో నాటుతారు. గుణకారంతో ఎన్ని మొక్కలో తెలుస్తుంది.'),
        }),
        keys(L('× is read "times" or "groups of".', '× ను "సార్లు" లేదా "గుంపులు" అని చదువుతాం.'), L('3 × 4 means 4 added 3 times.', '3 × 4 అంటే 4ను 3 సార్లు కూడటం.'), L('3 × 4 and 4 × 3 give the same answer.', '3 × 4, 4 × 3 ఒకే జవాబు ఇస్తాయి.')),
        tip('Turn a tray of eggs around: 2 rows of 6 or 6 rows of 2 — still 12 eggs!', 'గుడ్ల ట్రేను తిప్పు: 6ల 2 వరుసలు లేదా 2ల 6 వరుసలు — ఇంకా 12 గుడ్లే!'),
      ],
      examples: [
        ex(L('Write 5 + 5 + 5 + 5 as multiplication.', '5 + 5 + 5 + 5ని గుణకారంగా రాయి.'), [L('5 is added 4 times.', '5ను 4 సార్లు కూడారు.')], same('4 × 5 = 20')),
        ex(L('An auto has 3 wheels. How many wheels do 6 autos have?', 'ఆటోకు 3 చక్రాలు. 6 ఆటోలకు ఎన్ని చక్రాలు?'), [L('6 groups of 3', '3ల 6 గుంపులు'), same('6 × 3 = 18')], L('18 wheels', '18 చక్రాలు')),
      ],
      practice: [
        tp('count', (r) => {
          const g = r.int(2, 6), n = r.int(2, 6), th = r.pick(THINGS);
          return typed(L(`There are ${g} groups of ${n} ${th.en}. How many ${th.en} in all?`, `${n} ${th.te} చొప్పున ${g} గుంపులు ఉన్నాయి. మొత్తం ఎన్ని?`), num(g * n),
            [L('Count one group.', 'ఒక గుంపు లెక్కించు.'), L(`Add ${n} again and again, ${g} times.`, `${n}ను ${g} సార్లు కూడు.`)],
            [same(Array(g).fill(n).join(' + ') + ` = ${g * n}`), same(`${g} × ${n} = ${g * n}`)],
            [[String(g + n), L('You added the number of groups and the number in a group. Add the group again and again instead.', 'గుంపుల సంఖ్య, గుంపులోని సంఖ్య కూడావు. బదులుగా గుంపును మళ్ళీ మళ్ళీ కూడు.')]], { visual: { kind: 'objects', emoji: th.emoji, count: g * n, groupsOf: n } });
        }),
        tp('repeat', (r) => {
          const g = r.int(2, 6), n = r.int(2, 9);
          return mcq(r, L(`Which multiplication is the same as ${Array(g).fill(n).join(' + ')}?`, `${Array(g).fill(n).join(' + ')}కు సమానమైన గుణకారం ఏది?`), same(`${g} × ${n}`),
            [same(`${g} + ${n}`), same(`${g} × ${n + 1}`), same(`${g + 1} × ${n}`)],
            [L(`Which number is repeated? ${n}.`, `ఏ సంఖ్య పునరావృతమైంది? ${n}.`), L('How many times? Count them.', 'ఎన్ని సార్లు? లెక్కించు.')],
            [L(`${n} is added ${g} times, so it is ${g} × ${n} = ${g * n}.`, `${n}ను ${g} సార్లు కూడారు, కాబట్టి ${g} × ${n} = ${g * n}.`)], [['wrong', L('Count how many times the number appears. That is the number of groups.', 'సంఖ్య ఎన్ని సార్లు వచ్చిందో లెక్కించు. అదే గుంపుల సంఖ్య.')]]);
        }),
      ],
    },
    {
      id: 'ts3.ma.mul.tables', title: L('Multiplication tables', 'ఎక్కాలు'),
      intro: [
        h('Tables are shortcuts', 'ఎక్కాలు దగ్గరి దారులు'),
        p('A table is skip counting. The 3 table: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30.', 'ఎక్కం అంటే దాటి లెక్కించడం. 3 ఎక్కం: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30.'),
        vis({ kind: 'number-line', from: 0, to: 30, step: 3, jumps: [[0, 3], [3, 6], [6, 9], [9, 12], [12, 15]] }, 'Jumps of 3: 5 jumps reach 15', '3ల దూకులు: 5 దూకుల్లో 15'),
        photo('🐸', L('A frog jumps 3 steps each time. After 5 jumps it is at 15: 5 × 3 = 15.', 'కప్ప ఒక్కోసారి 3 అడుగులు దూకుతుంది. 5 దూకుల తర్వాత 15 దగ్గర: 5 × 3 = 15.')),
        keys(L('Any number × 1 = the same number.', 'ఏ సంఖ్య × 1 = అదే సంఖ్య.'), L('Any number × 10: put a 0 at the end.', 'ఏ సంఖ్య × 10: చివర 0 పెట్టు.'), L('The 5 table always ends in 5 or 0.', '5 ఎక్కం ఎప్పుడూ 5 లేదా 0తో ముగుస్తుంది.'), L('The 2 table is doubling.', '2 ఎక్కం అంటే రెట్టింపు.')),
        remember('If you forget 7 × 6, use 6 × 7 or add 7 to 7 × 5 = 35: 35 + 7 = 42.', '7 × 6 మర్చిపోతే 6 × 7 వాడు, లేదా 7 × 5 = 35కు 7 కలుపు: 35 + 7 = 42.'),
        tip('Say one table aloud every day on the way to school.', 'రోజూ బడికి వెళ్ళేటప్పుడు ఒక ఎక్కం గట్టిగా చెప్పు.'),
      ],
      examples: [
        ex(same('6 × 4 = ?'), [L('Count in 4s six times: 4, 8, 12, 16, 20, 24', '4ల చొప్పున ఆరు సార్లు: 4, 8, 12, 16, 20, 24')], same('24')),
        ex(same('8 × ☐ = 40'), [L('In the 8 table, which step gives 40?', '8 ఎక్కంలో ఏ మెట్టు 40 ఇస్తుంది?'), same('8 × 5 = 40')], same('5')),
      ],
      practice: [
        tp('fact', (r) => {
          const a = r.int(2, 10), b = r.int(1, 10);
          return typed(same(`${a} × ${b} = ?`), num(a * b),
            [L(`Count in ${a}s, ${b} times.`, `${a}ల చొప్పున ${b} సార్లు లెక్కించు.`), b > 1 ? L(`${a} × ${b - 1} = ${a * (b - 1)}. Add one more ${a}.`, `${a} × ${b - 1} = ${a * (b - 1)}. ఇంకో ${a} కలుపు.`) : L('Any number × 1 is itself.', 'ఏ సంఖ్య × 1 అదే.')],
            [same(`${a} × ${b} = ${a * b}`)], [[String(a + b), L('× means groups, not adding the two numbers.', '× అంటే గుంపులు, రెండు సంఖ్యలు కూడటం కాదు.')]]);
        }),
        tp('miss', (r) => {
          const a = r.int(2, 10), b = r.int(2, 10);
          return typed(same(`${a} × ☐ = ${a * b}`), num(b),
            [L(`Say the ${a} table until you reach ${a * b}.`, `${a * b} వచ్చే వరకు ${a} ఎక్కం చెప్పు.`), L('Count how many steps you took.', 'ఎన్ని మెట్లు వేశావో లెక్కించు.')],
            [same(`${a} × ${b} = ${a * b}`), L(`So the box is ${b}.`, `కాబట్టి పెట్టెలో ${b}.`)], [[String(a * b - a), L('Do not subtract. Find how many groups of the number make the total.', 'తీసివేయకు. ఆ సంఖ్య ఎన్ని గుంపులైతే మొత్తం వస్తుందో కనుగొను.')]]);
        }, 2),
      ],
    },
    {
      id: 'ts3.ma.mul.word', title: L('Multiplication in daily life', 'రోజువారీ జీవితంలో గుణకారం'),
      intro: [
        h('Multiplying bigger numbers', 'పెద్ద సంఖ్యల గుణకారం'),
        p('A box has 24 crayons. How many in 3 boxes? Break 24 into 20 and 4. 3 × 20 = 60 and 3 × 4 = 12. 60 + 12 = 72.', 'ఒక పెట్టెలో 24 క్రేయాన్లు. 3 పెట్టెల్లో ఎన్ని? 24ను 20, 4గా విడదీయి. 3 × 20 = 60, 3 × 4 = 12. 60 + 12 = 72.'),
        vis({ kind: 'emoji', text: '3 × 24\n= 3 × 20 + 3 × 4\n= 60 + 12 = 72' }, 'Break the tens and ones, multiply, then add', 'పదులు, ఒకట్లు విడదీసి, గుణించి, కూడు'),
        photo('🖍️', L('3 boxes of 24 crayons: 72 crayons.', '24 క్రేయాన్ల 3 పెట్టెలు: 72 క్రేయాన్లు.')),
        keys(L('"Each", "every", "per" and equal groups → multiply.', '"ఒక్కో", "ప్రతి" మరియు సమాన గుంపులు → గుణించు.'), L('Multiply tens and ones separately, then add.', 'పదులు, ఒకట్లు విడిగా గుణించి, కూడు.')),
        tip('Check: 3 × 24 should be a bit more than 3 × 20 = 60.', 'సరిచూడు: 3 × 24, 3 × 20 = 60 కంటే కొంచెం ఎక్కువ ఉండాలి.'),
      ],
      examples: [
        ex(L('A cow has 4 legs. How many legs do 7 cows have?', 'ఆవుకు 4 కాళ్ళు. 7 ఆవులకు ఎన్ని కాళ్ళు?'), [same('7 × 4 = 28')], L('28 legs', '28 కాళ్ళు')),
        ex(L('One packet has 15 biscuits. How many in 4 packets?', 'ఒక ప్యాకెట్‌లో 15 బిస్కెట్లు. 4 ప్యాకెట్లలో ఎన్ని?'), [same('4 × 10 = 40'), same('4 × 5 = 20'), same('40 + 20 = 60')], L('60 biscuits', '60 బిస్కెట్లు')),
      ],
      practice: [
        tp('story', (r) => {
          const list: [S, S, number][] = [
            [L('A cow has 4 legs.', 'ఆవుకు 4 కాళ్ళు.'), L('legs', 'కాళ్ళు'), 4], [L('An auto has 3 wheels.', 'ఆటోకు 3 చక్రాలు.'), L('wheels', 'చక్రాలు'), 3],
            [L('A hand has 5 fingers.', 'చేతికి 5 వేళ్ళు.'), L('fingers', 'వేళ్ళు'), 5], [L('A spider has 8 legs.', 'సాలీడుకు 8 కాళ్ళు.'), L('legs', 'కాళ్ళు'), 8],
            [L('A week has 7 days.', 'వారానికి 7 రోజులు.'), L('days', 'రోజులు'), 7], [L('A pack has 6 pencils.', 'ఒక ప్యాక్‌లో 6 పెన్సిళ్ళు.'), L('pencils', 'పెన్సిళ్ళు'), 6],
          ];
          const [fact, unit, n] = r.pick(list); const k = r.int(3, 9);
          const what = [L(`cows`, 'ఆవులు'), L('autos', 'ఆటోలు'), L('hands', 'చేతులు'), L('spiders', 'సాలీళ్ళు'), L('weeks', 'వారాలు'), L('packs', 'ప్యాక్‌లు')][list.findIndex((x) => x[0] === fact)];
          return typed(L(`${fact.en} How many ${unit.en} do ${k} ${what.en} have?`, `${fact.te} ${k} ${what.te} ఉంటే మొత్తం ఎన్ని ${unit.te}?`), num(k * n),
            [L(`${k} groups of ${n}.`, `${n}ల ${k} గుంపులు.`), same(`${k} × ${n}`)], [same(`${k} × ${n} = ${k * n}`), L(`${k * n} ${unit.en}`, `${k * n} ${unit.te}`)],
            [[String(k + n), L('Each one has the same number, so multiply, do not add.', 'ప్రతిదానికి ఒకే సంఖ్య, కాబట్టి గుణించు, కూడకు.')]]);
        }),
        tp('big', (r) => {
          const n = r.int(12, 32), k = r.int(2, 4);
          const t = Math.floor(n / 10) * 10, o = n % 10;
          return typed(L(`One packet has ${n} biscuits. How many biscuits are in ${k} packets?`, `ఒక ప్యాకెట్‌లో ${n} బిస్కెట్లు. ${k} ప్యాకెట్లలో ఎన్ని బిస్కెట్లు?`), num(n * k),
            [L(`Break ${n} into ${t} and ${o}.`, `${n}ను ${t}, ${o}గా విడదీయి.`), L(`${k} × ${t} = ${k * t}. Now find ${k} × ${o}.`, `${k} × ${t} = ${k * t}. ఇప్పుడు ${k} × ${o} కనుగొను.`)],
            [same(`${k} × ${t} = ${k * t}`), same(`${k} × ${o} = ${k * o}`), same(`${k * t} + ${k * o} = ${n * k}`)],
            [[String(k * t + o), L('Multiply the ones part too, not only the tens.', 'పదులనే కాదు, ఒకట్లను కూడా గుణించు.')]]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 7 DIVISION
const ch7: USpec = {
  id: 'ts3.ma.ch7', subject: 'math', title: L('Division', 'భాగహారం'), source: src(7),
  objectives: [
    {
      id: 'ts3.ma.div.share', title: L('Sharing equally', 'సమానంగా పంచడం'),
      intro: [
        h('Fair shares for everyone', 'అందరికీ సమాన వాటా'),
        p('12 laddoos are shared equally among 3 friends. Give one to each, again and again, until none are left. Each friend gets 4.', '12 లడ్డూలను 3 స్నేహితులకు సమానంగా పంచాలి. ఒక్కొక్కరికి ఒకటి చొప్పున, మళ్ళీ మళ్ళీ, అయిపోయే వరకు ఇవ్వు. ఒక్కొక్కరికి 4.'),
        vis({ kind: 'objects', emoji: '🟠', count: 12, groupsOf: 4 }, '12 laddoos in 3 equal shares of 4', '12 లడ్డూలు, 4 చొప్పున 3 సమాన భాగాలు'),
        p('We write 12 ÷ 3 = 4. The sign ÷ means "shared equally into".', '12 ÷ 3 = 4 అని రాస్తాం. ÷ గుర్తు అంటే "సమానంగా పంచడం".'),
        photo('🍉', L('A watermelon cut for 4 people: each gets an equal piece.', '4 మందికి కోసిన పుచ్చకాయ: ఒక్కొక్కరికి సమాన ముక్క.')),
        keys(L('Equal sharing → divide.', 'సమానంగా పంచడం → భాగహారం.'), L('Every share must be the same size.', 'ప్రతి వాటా ఒకే పరిమాణం ఉండాలి.'), L('Check: shares × number of people = total.', 'సరిచూడు: వాటా × మనుషులు = మొత్తం.')),
        tip('Use buttons or beans to share. Deal them out one by one like playing cards.', 'బొత్తాలు లేదా గింజలతో పంచు. పేకముక్కల్లా ఒక్కొక్కటిగా ఇవ్వు.'),
      ],
      examples: [
        ex(L('15 pencils are shared equally among 5 children. How many does each get?', '15 పెన్సిళ్ళను 5 మంది పిల్లలకు సమానంగా పంచారు. ఒక్కొక్కరికి ఎన్ని?'), [same('15 ÷ 5 = 3'), L('Check: 5 × 3 = 15', 'సరిచూడు: 5 × 3 = 15')], L('3 pencils each', 'ఒక్కొక్కరికి 3 పెన్సిళ్ళు')),
        ex(L('20 mangoes are put equally into 4 baskets. How many in each?', '20 మామిడి పండ్లను 4 బుట్టల్లో సమానంగా పెట్టారు. ఒక్కో బుట్టలో ఎన్ని?'), [same('20 ÷ 4 = 5')], L('5 mangoes', '5 మామిడి పండ్లు'), { kind: 'objects', emoji: '🥭', count: 20, groupsOf: 5 }),
      ],
      practice: [
        tp('share', (r) => {
          const k = r.int(2, 6), each = r.int(2, 7), th = r.pick(THINGS), who = nm(r);
          const total = k * each;
          return typed(L(`${who.en} shares ${total} ${th.en} equally among ${k} friends. How many does each friend get?`, `${who.te} దగ్గర ${total} ${th.te} ఉన్నాయి. వాటిని ${k} మంది స్నేహితులకు సమానంగా పంచారు. ఒక్కొక్కరికి ఎన్ని?`), num(each),
            [L('Give one to each friend, again and again.', 'ప్రతి స్నేహితుడికి ఒకటి చొప్పున మళ్ళీ మళ్ళీ ఇవ్వు.'), L(`Which number × ${k} = ${total}?`, `ఏ సంఖ్య × ${k} = ${total}?`)],
            [same(`${total} ÷ ${k} = ${each}`), L(`Check: ${k} × ${each} = ${total}`, `సరిచూడు: ${k} × ${each} = ${total}`)],
            [[String(total - k), L('Sharing equally is dividing, not taking away once.', 'సమానంగా పంచడం భాగహారం, ఒకసారి తీసివేయడం కాదు.')]], { visual: { kind: 'objects', emoji: th.emoji, count: total } });
        }),
        tp('fair', (r) => {
          const k = r.int(2, 4), each = r.int(2, 5); const total = k * each;
          const fair = r.int(0, 1) === 1;
          const shares = fair ? Array(k).fill(each) : [each + 1, each - 1, ...Array(k - 2).fill(each)];
          return mcq(r, L(`${total} bangles were shared among ${k} girls like this: ${shares.join(', ')}. Is it an equal share?`, `${total} గాజులను ${k} మంది అమ్మాయిలకు ఇలా పంచారు: ${shares.join(', ')}. ఇది సమాన పంపకమా?`),
            fair ? L('Yes, all shares are equal', 'అవును, అన్ని వాటాలు సమానం') : L('No, the shares are not equal', 'కాదు, వాటాలు సమానం కావు'),
            [fair ? L('No, the shares are not equal', 'కాదు, వాటాలు సమానం కావు') : L('Yes, all shares are equal', 'అవును, అన్ని వాటాలు సమానం')],
            [L('Look at each share.', 'ప్రతి వాటా చూడు.'), L('Equal sharing means every share is the same number.', 'సమాన పంపకం అంటే ప్రతి వాటా ఒకే సంఖ్య.')],
            [fair ? L(`Each girl got ${each}. ${total} ÷ ${k} = ${each}.`, `ప్రతి అమ్మాయికి ${each}. ${total} ÷ ${k} = ${each}.`) : L(`The shares are different. Fair share: ${total} ÷ ${k} = ${each} each.`, `వాటాలు వేర్వేరు. సమాన వాటా: ${total} ÷ ${k} = ఒక్కొక్కరికి ${each}.`)],
            [['wrong', L('Compare all the shares. Even one different number means it is not equal.', 'అన్ని వాటాలు పోల్చు. ఒక్కటి వేరైనా సమానం కాదు.')]]);
        }),
      ],
    },
    {
      id: 'ts3.ma.div.group', title: L('Making equal groups', 'సమాన గుంపులు చేయడం'),
      intro: [
        h('How many groups can we make?', 'ఎన్ని గుంపులు చేయగలం?'),
        p('There are 18 eggs. Each tray holds 6. How many trays? Take away 6 again and again: 18 → 12 → 6 → 0. We took away 3 times, so 3 trays.', '18 గుడ్లు ఉన్నాయి. ఒక్కో ట్రేలో 6 పడతాయి. ఎన్ని ట్రేలు? 6 చొప్పున మళ్ళీ మళ్ళీ తీయి: 18 → 12 → 6 → 0. 3 సార్లు తీశాం, కాబట్టి 3 ట్రేలు.'),
        vis({ kind: 'number-line', from: 0, to: 18, step: 3, jumps: [[18, 12], [12, 6], [6, 0]] }, 'Jumping back from 18 in 6s: 3 jumps', '18 నుండి 6ల చొప్పున వెనక్కి: 3 దూకులు'),
        photo('🥚', L('18 eggs, 6 in each tray: 18 ÷ 6 = 3 trays.', '18 గుడ్లు, ఒక్కో ట్రేలో 6: 18 ÷ 6 = 3 ట్రేలు.')),
        keys(L('Division is repeated subtraction.', 'భాగహారం అంటే పునరావృత తీసివేత.'), L('Count how many times you can take away the group.', 'గుంపును ఎన్ని సార్లు తీయగలవో లెక్కించు.')),
        tip('Sometimes some are left over that cannot make a full group. That is the remainder.', 'కొన్నిసార్లు పూర్తి గుంపుకు చాలనివి మిగులుతాయి. అదే శేషం.'),
      ],
      examples: [
        ex(L('24 children make teams of 4 for kabaddi practice. How many teams?', 'కబడ్డీ అభ్యాసానికి 24 మంది పిల్లలు 4 మంది చొప్పున జట్లు చేశారు. ఎన్ని జట్లు?'), [same('24 − 4 − 4 − 4 − 4 − 4 − 4 = 0'), L('6 times', '6 సార్లు'), same('24 ÷ 4 = 6')], L('6 teams', '6 జట్లు')),
        ex(L('14 bananas are packed 4 in a bag. How many full bags, and how many left?', '14 అరటి పండ్లను 4 చొప్పున సంచుల్లో పెట్టారు. ఎన్ని నిండు సంచులు, ఎన్ని మిగిలాయి?'), [same('4 × 3 = 12'), same('14 − 12 = 2')], L('3 bags, 2 left over', '3 సంచులు, 2 మిగిలాయి'), { kind: 'objects', emoji: '🍌', count: 14, groupsOf: 4 }),
      ],
      practice: [
        tp('groups', (r) => {
          const g = r.int(2, 6), n = r.int(2, 6), th = r.pick(THINGS); const total = g * n;
          return typed(L(`There are ${total} ${th.en}. Put ${n} in each group. How many groups can you make?`, `${total} ${th.te} ఉన్నాయి. ఒక్కో గుంపులో ${n} పెట్టు. ఎన్ని గుంపులు చేయగలవు?`), num(g),
            [L(`Take away ${n} again and again.`, `${n} చొప్పున మళ్ళీ మళ్ళీ తీయి.`), L(`Count how many times until 0.`, '0 వచ్చే వరకు ఎన్ని సార్లో లెక్కించు.')],
            [same(`${total} ÷ ${n} = ${g}`), L(`Check: ${g} × ${n} = ${total}`, `సరిచూడు: ${g} × ${n} = ${total}`)],
            [[String(total - n), L('Keep taking away groups until nothing is left, and count the groups.', 'ఏమీ మిగలనంత వరకు గుంపులు తీసి, గుంపులు లెక్కించు.')]], { visual: { kind: 'objects', emoji: th.emoji, count: total, groupsOf: n } });
        }),
        tp('left', (r) => {
          const n = r.int(3, 5), g = r.int(2, 5), rem = r.int(1, n - 1); const total = g * n + rem;
          return typed(L(`${total} bananas are packed ${n} in a bag. How many bananas are left over after making full bags?`, `${total} అరటి పండ్లను ${n} చొప్పున సంచుల్లో పెట్టారు. నిండు సంచులు చేశాక ఎన్ని మిగులుతాయి?`), num(rem),
            [L(`How many full groups of ${n} fit in ${total}?`, `${total}లో ${n}ల నిండు గుంపులు ఎన్ని?`), same(`${n} × ${g} = ${g * n}`)],
            [same(`${n} × ${g} = ${g * n}`), same(`${total} − ${g * n} = ${rem}`), L(`${g} bags and ${rem} left over.`, `${g} సంచులు, ${rem} మిగిలాయి.`)],
            [[String(g), L('That is the number of bags. The question asks how many are left over.', 'అది సంచుల సంఖ్య. ప్రశ్న మిగిలినవి ఎన్ని అని అడుగుతోంది.')]], { visual: { kind: 'objects', emoji: '🍌', count: total, groupsOf: n } });
        }, 2),
      ],
    },
    {
      id: 'ts3.ma.div.facts', title: L('Division facts from tables', 'ఎక్కాల నుండి భాగహార వాస్తవాలు'),
      intro: [
        h('Multiplication and division are partners', 'గుణకారం, భాగహారం జంట'),
        p('From one fact we get a family: 4 × 5 = 20, 5 × 4 = 20, 20 ÷ 4 = 5 and 20 ÷ 5 = 4.', 'ఒక వాస్తవం నుండి కుటుంబం వస్తుంది: 4 × 5 = 20, 5 × 4 = 20, 20 ÷ 4 = 5, 20 ÷ 5 = 4.'),
        vis({ kind: 'emoji', text: '4 × 5 = 20\n5 × 4 = 20\n20 ÷ 4 = 5\n20 ÷ 5 = 4' }, 'A fact family made of 4, 5 and 20', '4, 5, 20 తో వాస్తవ కుటుంబం'),
        photo('🧑‍🏫', L('To find 35 ÷ 7, ask: 7 times what is 35? 7 × 5 = 35, so 35 ÷ 7 = 5.', '35 ÷ 7 కోసం అడుగు: 7 × ఎంత = 35? 7 × 5 = 35, కాబట్టి 35 ÷ 7 = 5.')),
        keys(L('To divide, think of the table.', 'భాగించడానికి ఎక్కం గుర్తుచేసుకో.'), L('Any number ÷ 1 = the same number.', 'ఏ సంఖ్య ÷ 1 = అదే సంఖ్య.'), L('A number ÷ itself = 1.', 'ఒక సంఖ్య ÷ అదే సంఖ్య = 1.')),
        tip('Division always gets checked by multiplication.', 'భాగహారాన్ని ఎప్పుడూ గుణకారంతో సరిచూడవచ్చు.'),
      ],
      examples: [
        ex(same('42 ÷ 6 = ?'), [L('6 × what = 42?', '6 × ఎంత = 42?'), same('6 × 7 = 42')], same('7')),
        ex(L('Write the family for 3 × 8 = 24.', '3 × 8 = 24 కుటుంబం రాయి.'), [same('8 × 3 = 24'), same('24 ÷ 3 = 8'), same('24 ÷ 8 = 3')], same('3 × 8, 8 × 3, 24 ÷ 3, 24 ÷ 8')),
      ],
      practice: [
        tp('fact', (r) => {
          const a = r.int(2, 10), b = r.int(2, 10);
          return typed(same(`${a * b} ÷ ${a} = ?`), num(b),
            [L(`${a} × what = ${a * b}?`, `${a} × ఎంత = ${a * b}?`), L(`Say the ${a} table.`, `${a} ఎక్కం చెప్పు.`)],
            [same(`${a} × ${b} = ${a * b}`), same(`${a * b} ÷ ${a} = ${b}`)], [[String(a * b - a), L('Division is not one subtraction. Find how many times the number fits.', 'భాగహారం ఒక్క తీసివేత కాదు. ఆ సంఖ్య ఎన్ని సార్లు సరిపోతుందో కనుగొను.')]]);
        }),
        tp('family', (r) => {
          const a = r.int(2, 9), b = r.int(2, 9); const p2 = a * b;
          const c = b === a ? a + 1 : b;
          return mcq(r, L(`${a} × ${b} = ${p2}. Which division fact belongs to the same family?`, `${a} × ${b} = ${p2}. ఏ భాగహార వాస్తవం అదే కుటుంబానికి చెందింది?`), same(`${p2} ÷ ${a} = ${b}`),
            [same(`${p2} ÷ ${a} = ${c + 1}`), same(`${a} ÷ ${b} = ${p2}`), same(`${p2} ÷ ${b} = ${a + 1}`)],
            [L('The biggest number is divided.', 'పెద్ద సంఖ్యను భాగిస్తారు.'), L(`${p2} ÷ ${a} should give ${b}.`, `${p2} ÷ ${a}, ${b} ఇవ్వాలి.`)],
            [same(`${p2} ÷ ${a} = ${b}`), same(`${p2} ÷ ${b} = ${a}`)], [['wrong', L('Check with multiplication: answer × divisor must equal the big number.', 'గుణకారంతో సరిచూడు: జవాబు × భాజకం = పెద్ద సంఖ్య.')]]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 8 MEASUREMENT
const BODY: [S, S][] = [[L('handspans', 'జానలు'), L('handspan', 'జాన')], [L('footsteps', 'అడుగులు'), L('footstep', 'అడుగు')], [L('cubits', 'మూరలు'), L('cubit', 'మూర')]];
const ch8: USpec = {
  id: 'ts3.ma.ch8', subject: 'math', title: L('Measurement', 'కొలతలు'), source: src(8),
  objectives: [
    {
      id: 'ts3.ma.len.nonstd', title: L('Measuring with our body', 'శరీరంతో కొలవడం'),
      intro: [
        h('Handspans, cubits and footsteps', 'జానలు, మూరలు, అడుగులు'),
        p('Long ago people measured with their body. A handspan is from the tip of the thumb to the tip of the little finger. A cubit is from the elbow to the tip of the middle finger.', 'పూర్వం ప్రజలు శరీరంతో కొలిచేవారు. బొటనవేలి కొన నుండి చిటికెనవేలి కొన వరకు జాన. మోచేతి నుండి మధ్యవేలి కొన వరకు మూర.'),
        photo('🖐️', L('Spread your hand wide: that is one handspan.', 'చేతిని వెడల్పుగా చాచు: అదే ఒక జాన.')),
        p('Flower sellers still sell a string of jasmine by the cubit (మూర)!', 'పూలమ్మేవాళ్ళు ఇప్పటికీ మల్లెపూల దండను మూరల లెక్కన అమ్ముతారు!'),
        p('Ravi measured his desk: 8 handspans. His teacher measured it: 6 handspans. The desk did not change! Her hand is bigger, so she needs fewer spans.', 'రవి తన బల్లను కొలిచాడు: 8 జానలు. టీచర్ కొలిచారు: 6 జానలు. బల్ల మారలేదు! ఆమె చేయి పెద్దది, కాబట్టి తక్కువ జానలు.'),
        X({
          title: L('What if? Bigger or smaller hand', 'చేయి పెద్దదైతే లేదా చిన్నదైతే?'), formula: 'Number of spans = length of desk ÷ size of one span',
          result: ['n', L('Number of handspans', 'జానల సంఖ్య'), 'd / s'],
          vars: [['d', L('Length of the desk', 'బల్ల పొడవు'), 60, 200, 10, 120, 'cm'], ['s', L('Size of one handspan', 'ఒక జాన పొడవు'), 10, 24, 1, 15, 'cm']],
          notes: [['s', L('A bigger hand covers more each time, so you count FEWER spans.', 'పెద్ద చేయి ఒక్కోసారి ఎక్కువ కవర్ చేస్తుంది, కాబట్టి జానలు తక్కువ.'), L('A smaller hand covers less each time, so you count MORE spans.', 'చిన్న చేయి ఒక్కోసారి తక్కువ కవర్ చేస్తుంది, కాబట్టి జానలు ఎక్కువ.')],
            ['d', L('A longer desk needs more spans.', 'పొడవైన బల్లకు ఎక్కువ జానలు.'), L('A shorter desk needs fewer spans.', 'పొట్టి బల్లకు తక్కువ జానలు.')]],
          mistakes: [[L('Thinking more spans means a longer desk, even with a smaller hand', 'చిన్న చేయితో ఎక్కువ జానలు వస్తే బల్ల పొడవు అనుకోవడం'), L('The count depends on the hand size too. That is why we need a standard unit like the centimetre.', 'లెక్క చేయి పరిమాణం మీద కూడా ఆధారపడుతుంది. అందుకే సెంటీమీటర్ లాంటి ప్రామాణిక కొలమానం కావాలి.')]],
          real: L('Everyone in the world agrees on what 1 cm is, so a tailor in Hyderabad and a tailor in Delhi get the same answer.', '1 సెం.మీ. అంటే ప్రపంచమంతా ఒకటే, కాబట్టి హైదరాబాద్ దర్జీకి, ఢిల్లీ దర్జీకి ఒకే జవాబు వస్తుంది.'),
        }),
        keys(L('Body measures are different for different people.', 'శరీర కొలతలు మనిషికి మనిషికి వేరు.'), L('A bigger unit gives a smaller count.', 'పెద్ద కొలమానం తక్కువ లెక్క ఇస్తుంది.'), L('Standard units (cm, m) are the same for everyone.', 'ప్రామాణిక కొలమానాలు (సెం.మీ., మీ.) అందరికీ ఒకటే.')),
        tip('Measure your classroom door in handspans, then ask a friend to do it. Compare!', 'తరగతి తలుపును జానలతో కొలువు, తర్వాత స్నేహితుడితో కొలిపించు. పోల్చు!'),
      ],
      examples: [
        ex(L('Kavya measured a rope as 5 cubits. Her father measured it as 3 cubits. Who has the longer arm?', 'కావ్య తాడును 5 మూరలుగా, నాన్న 3 మూరలుగా కొలిచారు. ఎవరి చేయి పొడవు?'), [L('Same rope, fewer cubits for the father.', 'అదే తాడు, నాన్నకు తక్కువ మూరలు.'), L('Fewer units means each unit is bigger.', 'తక్కువ లెక్క అంటే కొలమానం పెద్దది.')], L('The father', 'నాన్న')),
        ex(L('What would you use to measure the length of the classroom: handspans or footsteps?', 'తరగతి గది పొడవు కొలవడానికి జానలా, అడుగులా?'), [L('The room is long.', 'గది పొడవుగా ఉంది.'), L('Footsteps are bigger, so we count fewer.', 'అడుగులు పెద్దవి, కాబట్టి తక్కువ లెక్కిస్తాం.')], L('Footsteps', 'అడుగులు')),
      ],
      practice: [
        tp('who', (r) => {
          const [p1, p2] = r.shuffle(NAMES).slice(0, 2); const [u] = r.pick(BODY);
          const a = r.int(4, 12); let b = r.int(4, 12); if (b === a) b = a + 2;
          const thing = r.pick([L('the bench', 'బెంచీ'), L('the blackboard', 'నల్లబల్ల'), L('the verandah', 'వరండా'), L('a saree', 'చీర'), L('the school gate', 'బడి గేటు')]);
          const big = a < b ? p1 : p2;
          return mcq(r, L(`${p1.en} measured ${thing.en} as ${a} ${u.en}. ${p2.en} measured it as ${b} ${u.en}. Whose ${u.en.slice(0, -1)} is bigger?`, `${p1.te} ${thing.te}ను ${a} ${u.te}గా, ${p2.te} ${b} ${u.te}గా కొలిచారు. ఎవరి కొలమానం పెద్దది?`), big, [big === p1 ? p2 : p1],
            [L('The thing is the same length for both.', 'ఇద్దరికీ వస్తువు పొడవు ఒకటే.'), L('Fewer units means each unit is bigger.', 'తక్కువ లెక్క అంటే కొలమానం పెద్దది.')],
            [L(`${big.en} needed fewer ${u.en} (${Math.min(a, b)}), so ${big.en}'s unit is bigger.`, `${big.te}కు తక్కువ ${u.te} (${Math.min(a, b)}) పట్టాయి, కాబట్టి ${big.te} కొలమానం పెద్దది.`)],
            [['wrong', L('More units does not mean a bigger hand. A big unit fits fewer times.', 'ఎక్కువ లెక్క అంటే పెద్ద చేయి కాదు. పెద్ద కొలమానం తక్కువ సార్లు సరిపోతుంది.')]]);
        }),
        bank('unit', [
          [L('Which body measure is best for the length of your notebook?', 'నోట్‌బుక్ పొడవు కొలవడానికి ఏ శరీర కొలత సరైనది?'), L('Finger widths', 'వేలి వెడల్పులు'), [L('Footsteps', 'అడుగులు'), L('Cubits', 'మూరలు')], [L('A notebook is small.', 'నోట్‌బుక్ చిన్నది.'), L('Use a small unit for small things.', 'చిన్న వస్తువులకు చిన్న కొలమానం.')], L('Small thing → small unit: finger widths.', 'చిన్న వస్తువు → చిన్న కొలమానం: వేలి వెడల్పులు.'), L('Footsteps and cubits are too big for a notebook.', 'నోట్‌బుక్‌కు అడుగులు, మూరలు చాలా పెద్దవి.')],
          [L('Which body measure is best for the length of the playground?', 'ఆట స్థలం పొడవు కొలవడానికి ఏ శరీర కొలత సరైనది?'), L('Footsteps', 'అడుగులు'), [L('Finger widths', 'వేలి వెడల్పులు'), L('Handspans', 'జానలు')], [L('A playground is very long.', 'ఆట స్థలం చాలా పొడవు.'), L('Use a big unit.', 'పెద్ద కొలమానం వాడు.')], L('Long distance → walk it in footsteps.', 'దూరం ఎక్కువ → అడుగులతో నడిచి కొలువు.'), L('With finger widths you would count for hours!', 'వేలి వెడల్పులతో గంటలు లెక్కించాల్సి వస్తుంది!')],
          [L('How do flower sellers measure a string of jasmine?', 'పూలమ్మేవాళ్ళు మల్లెపూల దండను ఎలా కొలుస్తారు?'), L('In cubits', 'మూరలతో'), [L('In footsteps', 'అడుగులతో'), L('In finger widths', 'వేలి వెడల్పులతో')], [L('Think of the market.', 'మార్కెట్ గుర్తుచేసుకో.'), L('They wrap it from elbow to fingertip.', 'మోచేతి నుండి వేలి కొన వరకు చుడతారు.')], L('Flowers are sold by the cubit (మూర).', 'పూలను మూరల లెక్కన అమ్ముతారు.'), L('Footsteps are for the ground, not for flowers.', 'అడుగులు నేల కోసం, పూల కోసం కాదు.')],
          [L('Why do two children get different handspan counts for the same table?', 'ఒకే బల్లకు ఇద్దరు పిల్లలకు జానల లెక్క ఎందుకు వేరుగా వస్తుంది?'), L('Their hands are of different sizes', 'వారి చేతుల పరిమాణం వేరు'), [L('The table changed its length', 'బల్ల పొడవు మారింది'), L('One child cannot count', 'ఒకరికి లెక్కించడం రాదు')], [L('Did the table change?', 'బల్ల మారిందా?'), L('Compare their hands.', 'వారి చేతులు పోల్చు.')], L('Hand sizes differ, so the counts differ.', 'చేతుల పరిమాణం వేరు, కాబట్టి లెక్కలు వేరు.'), L('The table stays the same. The unit (hand) is different.', 'బల్ల అలాగే ఉంది. కొలమానం (చేయి) వేరు.')],
          [L('Why do we need standard units like the centimetre?', 'సెంటీమీటర్ లాంటి ప్రామాణిక కొలమానాలు ఎందుకు కావాలి?'), L('So everyone gets the same measure', 'అందరికీ ఒకే కొలత రావాలని'), [L('Because hands are not allowed', 'చేతులు వాడకూడదు కాబట్టి'), L('To make measuring slower', 'కొలవడం నెమ్మదిగా చేయడానికి')], [L('Body measures change from person to person.', 'శరీర కొలతలు మనిషికి మనిషికి మారతాయి.')], L('A standard unit is the same for everybody.', 'ప్రామాణిక కొలమానం అందరికీ ఒకటే.'), L('The real reason is fairness: everyone gets the same answer.', 'అసలు కారణం న్యాయం: అందరికీ ఒకే జవాబు.')],
        ]),
      ],
    },
    {
      id: 'ts3.ma.len.cm', title: L('Centimetres and metres', 'సెంటీమీటర్లు, మీటర్లు'),
      intro: [
        h('Using a ruler', 'స్కేలు వాడటం'),
        photo('📏', L('A 15 cm ruler. Each big mark is 1 centimetre (cm).', '15 సెం.మీ. స్కేలు. ప్రతి పెద్ద గీత 1 సెంటీమీటర్ (సెం.మీ.).')),
        p('Put one end of the pencil exactly at 0. Read the mark at the other end. That is its length.', 'పెన్సిల్ ఒక చివరను సరిగ్గా 0 దగ్గర పెట్టు. మరో చివర ఉన్న గీతను చదువు. అదే దాని పొడవు.'),
        vis({ kind: 'number-line', from: 0, to: 15, step: 1, marks: [0, 9] }, 'A pencil from 0 to 9: it is 9 cm long', '0 నుండి 9 వరకు పెన్సిల్: 9 సెం.మీ. పొడవు'),
        p('Longer things are measured in metres (m). 1 metre = 100 centimetres. A door is about 2 m tall.', 'పొడవైన వాటిని మీటర్లలో (మీ.) కొలుస్తాం. 1 మీటరు = 100 సెంటీమీటర్లు. తలుపు దాదాపు 2 మీ. ఎత్తు.'),
        keys(L('Start at 0, not at the edge of the ruler.', 'స్కేలు అంచు దగ్గర కాదు, 0 దగ్గర మొదలుపెట్టు.'), L('If it starts at another mark, subtract: end − start.', 'వేరే గీత దగ్గర మొదలైతే తీసివేయి: చివర − మొదలు.'), same('1 m = 100 cm')),
        remember('Small things → cm. Long things like rooms and ropes → m.', 'చిన్న వస్తువులు → సెం.మీ. గదులు, తాళ్ళ లాంటి పొడవైనవి → మీ.'),
        tip('Your thumb is about 1 cm wide. Your arm stretched out is close to 1 m for a grown-up.', 'నీ బొటనవేలు దాదాపు 1 సెం.మీ. వెడల్పు. పెద్దవాళ్ళ చాచిన చేయి దాదాపు 1 మీ.'),
      ],
      examples: [
        ex(L('An eraser starts at the 3 cm mark and ends at the 8 cm mark. How long is it?', 'రబ్బరు 3 సెం.మీ. గీత దగ్గర మొదలై 8 సెం.మీ. దగ్గర ముగుస్తుంది. పొడవు ఎంత?'), [L('End − start', 'చివర − మొదలు'), same('8 − 3 = 5')], L('5 cm', '5 సెం.మీ.'), { kind: 'number-line', from: 0, to: 10, step: 1, marks: [3, 8] }),
        ex(L('How many centimetres are in 3 metres?', '3 మీటర్లలో ఎన్ని సెంటీమీటర్లు?'), [same('1 m = 100 cm'), same('3 × 100 = 300')], L('300 cm', '300 సెం.మీ.')),
      ],
      practice: [
        tp('ruler', (r) => {
          const s = r.int(0, 5), l = r.int(3, 9);
          return typed(L(`A crayon starts at the ${s} cm mark and ends at the ${s + l} cm mark. How long is it?`, `క్రేయాన్ ${s} సెం.మీ. గీత దగ్గర మొదలై ${s + l} సెం.మీ. దగ్గర ముగుస్తుంది. దాని పొడవు ఎంత?`), num(l, 'cm'),
            [s ? L('It does not start at 0.', 'అది 0 దగ్గర మొదలవ్వలేదు.') : L('It starts at 0, so read the end mark.', 'అది 0 దగ్గర మొదలైంది, చివరి గీత చదువు.'), L('Length = end − start.', 'పొడవు = చివర − మొదలు.')],
            [same(`${s + l} − ${s} = ${l}`), L(`${l} cm`, `${l} సెం.మీ.`)], s ? [[String(s + l), L('It does not start at 0. Subtract the start mark.', 'అది 0 దగ్గర మొదలవ్వలేదు. మొదటి గీతను తీసివేయి.')]] : [],
            { visual: { kind: 'number-line', from: 0, to: 15, step: 1, marks: [s, s + l] }, unitHint: 'cm' });
        }),
        tp('m2cm', (r) => {
          const m = r.int(1, 9), c = r.pick([0, 0, 20, 35, 50, 75, 5]);
          const ans = m * 100 + c;
          return typed(c ? L(`A rope is ${m} m ${c} cm long. How many centimetres is that?`, `ఒక తాడు ${m} మీ. ${c} సెం.మీ. పొడవు. అది ఎన్ని సెంటీమీటర్లు?`) : L(`A rope is ${m} m long. How many centimetres is that?`, `ఒక తాడు ${m} మీ. పొడవు. అది ఎన్ని సెంటీమీటర్లు?`), num(ans, 'cm'),
            [same('1 m = 100 cm'), L(`${m} m = ${m} × 100 cm`, `${m} మీ. = ${m} × 100 సెం.మీ.`)],
            [L(`${m} m = ${m * 100} cm`, `${m} మీ. = ${m * 100} సెం.మీ.`), ...(c ? [same(`${m * 100} + ${c} = ${ans}`)] : [])],
            [[String(m * 10 + c), L('1 metre is 100 cm, not 10 cm.', '1 మీటరు 100 సెం.మీ., 10 కాదు.')], [String(m + c), L('Change the metres into centimetres first: × 100.', 'ముందు మీటర్లను సెంటీమీటర్లుగా మార్చు: × 100.')]], { unitHint: 'cm' });
        }),
      ],
    },
    {
      id: 'ts3.ma.len.tools', title: L('Measuring instruments', 'కొలత సాధనాలు'),
      intro: [
        h('The right tool for the job', 'పనికి తగిన సాధనం'),
        p('A ruler is good for a pencil. A tailor uses a soft measuring tape to go round your waist. A mason uses a long steel tape for walls.', 'పెన్సిల్‌కు స్కేలు సరిపోతుంది. దర్జీ నడుము చుట్టూ మెత్తని కొలత టేపు వాడతాడు. తాపీ మేస్త్రీ గోడలకు పొడవైన ఉక్కు టేపు వాడతాడు.'),
        photo('📏', L('Ruler: for short, straight things like a book.', 'స్కేలు: పుస్తకం లాంటి చిన్న, నిటారు వస్తువులకు.')),
        photo('⚖', L('A weighing balance tells how heavy something is, not how long.', 'తూకం త్రాసు బరువును చెబుతుంది, పొడవును కాదు.')),
        keys(L('Ruler / scale → short lengths in cm.', 'స్కేలు → చిన్న పొడవులు సెం.మీ.లో.'), L('Tailor\'s tape → round things like a waist or a pot.', 'దర్జీ టేపు → నడుము, కుండ లాంటి గుండ్రని వాటికి.'), L('Metre tape / metre rod → long lengths in m.', 'మీటర్ టేపు / మీటర్ కర్ర → పొడవైనవి మీ.లో.'), L('Weighing balance → weight. Clock → time. Measuring jar → water.', 'త్రాసు → బరువు. గడియారం → సమయం. కొలత జాడీ → నీళ్ళు.')),
        tip('Ask yourself: what am I measuring — length, weight, time or water? Then pick the tool.', 'నిన్ను నువ్వు అడుగు: పొడవా, బరువా, సమయమా, నీళ్ళా? తర్వాత సాధనం ఎంచుకో.'),
      ],
      examples: [
        ex(L('Which tool does a tailor use to measure your chest?', 'నీ ఛాతీ కొలవడానికి దర్జీ ఏ సాధనం వాడతాడు?'), [L('The chest is round.', 'ఛాతీ గుండ్రంగా ఉంటుంది.'), L('A soft tape can bend around it.', 'మెత్తని టేపు చుట్టూ వంగుతుంది.')], L('A measuring tape', 'కొలత టేపు')),
        ex(L('A 30 cm ribbon and a 45 cm ribbon are joined. How long is the joined ribbon?', '30 సెం.మీ., 45 సెం.మీ. రిబ్బన్లను కలిపారు. కలిపిన రిబ్బన్ పొడవు ఎంత?'), [same('30 + 45 = 75')], L('75 cm', '75 సెం.మీ.')),
      ],
      practice: [
        bank('tool', [
          [L('Which tool is best to measure the length of your pencil?', 'నీ పెన్సిల్ పొడవు కొలవడానికి ఏ సాధనం సరైనది?'), L('Ruler', 'స్కేలు'), [L('Weighing balance', 'త్రాసు'), L('Clock', 'గడియారం'), L('Measuring jar', 'కొలత జాడీ')], [L('A pencil is short and straight.', 'పెన్సిల్ చిన్నది, నిటారుగా ఉంటుంది.')], L('A ruler measures short lengths.', 'స్కేలు చిన్న పొడవులను కొలుస్తుంది.'), L('We are measuring length, so we need a ruler.', 'మనం పొడవు కొలుస్తున్నాం, కాబట్టి స్కేలు కావాలి.')],
          [L('Which tool does a tailor use to measure your waist?', 'నీ నడుము కొలవడానికి దర్జీ ఏ సాధనం వాడతాడు?'), L('Measuring tape', 'కొలత టేపు'), [L('Ruler', 'స్కేలు'), L('Weighing balance', 'త్రాసు'), L('Clock', 'గడియారం')], [L('A waist is round.', 'నడుము గుండ్రంగా ఉంటుంది.'), L('The tool must bend.', 'సాధనం వంగాలి.')], L('A soft tape bends around the waist.', 'మెత్తని టేపు నడుము చుట్టూ వంగుతుంది.'), L('A ruler cannot bend around your body.', 'స్కేలు శరీరం చుట్టూ వంగదు.')],
          [L('Which tool tells how heavy a bag of rice is?', 'బియ్యం సంచి బరువు ఏ సాధనం చెబుతుంది?'), L('Weighing balance', 'త్రాసు'), [L('Ruler', 'స్కేలు'), L('Measuring tape', 'కొలత టేపు'), L('Clock', 'గడియారం')], [L('Heavy means weight.', 'బరువు అంటే తూకం.')], L('A weighing balance measures weight.', 'త్రాసు బరువును కొలుస్తుంది.'), L('Rulers and tapes measure length, not weight.', 'స్కేలు, టేపు పొడవు కొలుస్తాయి, బరువు కాదు.')],
          [L('Which tool measures how much milk is in a jug?', 'జగ్గులో ఎంత పాలు ఉన్నాయో ఏ సాధనం కొలుస్తుంది?'), L('Measuring jar', 'కొలత జాడీ'), [L('Ruler', 'స్కేలు'), L('Weighing balance', 'త్రాసు'), L('Clock', 'గడియారం')], [L('Milk is a liquid.', 'పాలు ద్రవం.')], L('A measuring jar or can measures liquids.', 'కొలత జాడీ ద్రవాలను కొలుస్తుంది.'), L('Liquids are measured in a jar marked in litres.', 'ద్రవాలను లీటర్ గుర్తులున్న జాడీలో కొలుస్తాం.')],
          [L('Which tool is best to measure the length of the classroom?', 'తరగతి గది పొడవు కొలవడానికి ఏ సాధనం సరైనది?'), L('Metre tape', 'మీటర్ టేపు'), [L('15 cm ruler', '15 సెం.మీ. స్కేలు'), L('Weighing balance', 'త్రాసు'), L('Measuring jar', 'కొలత జాడీ')], [L('A classroom is long.', 'తరగతి గది పొడవుగా ఉంటుంది.'), L('Use a long tool.', 'పొడవైన సాధనం వాడు.')], L('A long metre tape measures rooms.', 'పొడవైన మీటర్ టేపు గదులను కొలుస్తుంది.'), L('A small ruler would take too long.', 'చిన్న స్కేలుతో చాలా సమయం పడుతుంది.')],
          [L('Which tool tells how long the lunch break is?', 'మధ్యాహ్న భోజన విరామం ఎంత సేపో ఏ సాధనం చెబుతుంది?'), L('Clock', 'గడియారం'), [L('Ruler', 'స్కేలు'), L('Measuring tape', 'కొలత టేపు'), L('Weighing balance', 'త్రాసు')], [L('How long in time, not in length.', 'సమయంలో ఎంత సేపు, పొడవులో కాదు.')], L('A clock measures time.', 'గడియారం సమయాన్ని కొలుస్తుంది.'), L('This "how long" is about time.', 'ఈ "ఎంత సేపు" సమయం గురించి.')],
        ]),
        tp('join', (r) => {
          const a = r.int(12, 60), b = r.int(12, 60); const join = r.int(0, 1) === 1;
          const [x, y] = [Math.max(a, b), Math.min(a, b)];
          return join
            ? typed(L(`A ${a} cm ribbon and a ${b} cm ribbon are joined end to end. How long is the joined ribbon?`, `${a} సెం.మీ., ${b} సెం.మీ. రిబ్బన్లను చివర చివర కలిపారు. కలిపిన రిబ్బన్ పొడవు ఎంత?`), num(a + b, 'cm'),
              [L('Joining → add the lengths.', 'కలపడం → పొడవులు కూడు.')], [L(`${a} + ${b} = ${a + b} cm`, `${a} + ${b} = ${a + b} సెం.మీ.`)], [[String(Math.abs(a - b)), L('Joining makes it longer. Add.', 'కలిపితే పొడవు పెరుగుతుంది. కూడు.')]], { unitHint: 'cm' })
            : typed(L(`A ${x} cm stick has a piece of ${y} cm cut off. How long is the stick now?`, `${x} సెం.మీ. కర్ర నుండి ${y} సెం.మీ. ముక్క కోశారు. ఇప్పుడు కర్ర పొడవు ఎంత?`), num(x - y, 'cm'),
              [L('Cutting off → subtract.', 'కోయడం → తీసివేయి.')], [L(`${x} − ${y} = ${x - y} cm`, `${x} − ${y} = ${x - y} సెం.మీ.`)], [[String(x + y), L('Cutting makes it shorter. Subtract.', 'కోస్తే పొడవు తగ్గుతుంది. తీసివేయి.')]], { unitHint: 'cm' });
        }),
      ],
    },
  ],
};

// ================================================================== CH 9 TIME
const pad2 = (n: number) => String(n).padStart(2, '0');
const hm = (hh: number, mm: number) => `${hh}:${pad2(mm)}`;
const DAYS: S[] = [L('Sunday', 'ఆదివారం'), L('Monday', 'సోమవారం'), L('Tuesday', 'మంగళవారం'), L('Wednesday', 'బుధవారం'), L('Thursday', 'గురువారం'), L('Friday', 'శుక్రవారం'), L('Saturday', 'శనివారం')];
const MONTHS: [S, number][] = [
  [L('January', 'జనవరి'), 31], [L('February', 'ఫిబ్రవరి'), 28], [L('March', 'మార్చి'), 31], [L('April', 'ఏప్రిల్'), 30], [L('May', 'మే'), 31], [L('June', 'జూన్'), 30],
  [L('July', 'జూలై'), 31], [L('August', 'ఆగస్టు'), 31], [L('September', 'సెప్టెంబర్'), 30], [L('October', 'అక్టోబర్'), 31], [L('November', 'నవంబర్'), 30], [L('December', 'డిసెంబర్'), 31],
];
const ch9: USpec = {
  id: 'ts3.ma.ch9', subject: 'math', title: L('Time', 'సమయం'), source: src(9),
  objectives: [
    {
      id: 'ts3.ma.time.clock', title: L('Reading the clock', 'గడియారం చదవడం'),
      intro: [
        h('Two hands, two jobs', 'రెండు ముళ్ళు, రెండు పనులు'),
        p('The short hand shows the hour. The long hand shows the minutes. When the long hand is on 12, it is "o\'clock".', 'పొట్టి ముల్లు గంటను చూపిస్తుంది. పొడవు ముల్లు నిమిషాలను చూపిస్తుంది. పొడవు ముల్లు 12 మీద ఉంటే "గంటలు" అవుతుంది.'),
        vis({ kind: 'clock', h: 3, m: 0 }, 'The clock shows 3 o\'clock', 'గడియారం 3 గంటలు చూపిస్తోంది'),
        p('The long hand moves from one number to the next in 5 minutes. So count in 5s: on 3 it is 15 minutes, on 6 it is 30 minutes (half past).', 'పొడవు ముల్లు ఒక సంఖ్య నుండి తర్వాతి దానికి 5 నిమిషాల్లో వెళ్తుంది. 5ల చొప్పున లెక్కించు: 3 మీద 15 నిమిషాలు, 6 మీద 30 నిమిషాలు (అర గంట).'),
        vis({ kind: 'clock', h: 7, m: 30 }, 'Half past seven: 7:30', 'ఏడున్నర: 7:30'),
        photo('⏰', L('An alarm clock wakes you up for school at 6:30.', 'అలారం గడియారం నిన్ను బడికి 6:30కి లేపుతుంది.')),
        keys(L('Short hand → hour. Long hand → minutes.', 'పొట్టి ముల్లు → గంట. పొడవు ముల్లు → నిమిషాలు.'), L('Long hand on 6 → half past (:30).', 'పొడవు ముల్లు 6 మీద → అర గంట (:30).'), L('Long hand on 3 → quarter past (:15). On 9 → :45.', 'పొడవు ముల్లు 3 మీద → పావు (:15). 9 మీద → :45.')),
        remember('1 hour = 60 minutes. The long hand goes round once in 1 hour.', '1 గంట = 60 నిమిషాలు. పొడవు ముల్లు 1 గంటలో ఒకసారి తిరుగుతుంది.'),
        tip('At half past, the short hand sits halfway between two numbers. Read the smaller number as the hour.', 'అర గంటకు పొట్టి ముల్లు రెండు సంఖ్యల మధ్యలో ఉంటుంది. చిన్న సంఖ్యను గంటగా చదువు.'),
      ],
      examples: [
        ex(L('The short hand is on 9 and the long hand is on 12. What time is it?', 'పొట్టి ముల్లు 9 మీద, పొడవు ముల్లు 12 మీద ఉన్నాయి. సమయం ఎంత?'), [L('Long hand on 12 → o\'clock.', 'పొడవు ముల్లు 12 మీద → గంటలు.'), L('Short hand on 9 → 9.', 'పొట్టి ముల్లు 9 మీద → 9.')], L('9 o\'clock (9:00)', '9 గంటలు (9:00)'), { kind: 'clock', h: 9, m: 0 }),
        ex(L('The short hand is just past 4 and the long hand is on 4. What time is it?', 'పొట్టి ముల్లు 4 దాటింది, పొడవు ముల్లు 4 మీద ఉంది. సమయం ఎంత?'), [L('Hour: 4', 'గంట: 4'), L('Long hand on 4 → 4 × 5 = 20 minutes', 'పొడవు ముల్లు 4 మీద → 4 × 5 = 20 నిమిషాలు')], same('4:20'), { kind: 'clock', h: 4, m: 20 }),
      ],
      practice: [
        tp('read', (r) => {
          const hh = r.int(1, 12), mm = r.pick([0, 0, 30, 15, 45, 5, 10, 20, 25, 35, 40, 50, 55]);
          const wrong = [hm(hh, (mm + 30) % 60), hm((hh % 12) + 1, mm), hm(mm === 0 ? 12 : Math.min(12, mm / 5), hh * 5 % 60)];
          return mcq(r, L('What time does this clock show?', 'ఈ గడియారం ఏ సమయం చూపిస్తోంది?'), same(hm(hh, mm)), wrong.map(same),
            [L('Short hand → hour. Long hand → minutes.', 'పొట్టి ముల్లు → గంట. పొడవు ముల్లు → నిమిషాలు.'), L('Count the long hand in 5s from 12.', 'పొడవు ముల్లును 12 నుండి 5ల చొప్పున లెక్కించు.')],
            [L(`Short hand → ${hh}. Long hand on ${mm / 5 || 12} → ${mm} minutes. Time: ${hm(hh, mm)}`, `పొట్టి ముల్లు → ${hh}. పొడవు ముల్లు ${mm / 5 || 12} మీద → ${mm} నిమిషాలు. సమయం: ${hm(hh, mm)}`)],
            [['wrong', L('Do not mix up the hands. The SHORT hand is the hour.', 'ముళ్ళను కలగాపులగం చేయకు. పొట్టి ముల్లే గంట.')]], { visual: { kind: 'clock', h: hh, m: mm } });
        }),
        tp('min', (r) => {
          const n = r.int(1, 11);
          return typed(L(`The long hand points to ${n}. How many minutes past the hour is it?`, `పొడవు ముల్లు ${n}ని చూపిస్తోంది. గంట దాటి ఎన్ని నిమిషాలు?`), num(n * 5),
            [L('Each number on the clock is 5 minutes for the long hand.', 'పొడవు ముల్లుకు ప్రతి సంఖ్య 5 నిమిషాలు.'), L(`Count in 5s, ${n} times.`, `5ల చొప్పున ${n} సార్లు లెక్కించు.`)],
            [same(`${n} × 5 = ${n * 5}`), L(`${n * 5} minutes past the hour`, `గంట దాటి ${n * 5} నిమిషాలు`)], [[String(n), L('The long hand counts in 5s. Multiply the number by 5.', 'పొడవు ముల్లు 5ల చొప్పున లెక్కిస్తుంది. సంఖ్యను 5తో గుణించు.')]], { visual: { kind: 'clock', h: 12, m: n * 5 } });
        }),
      ],
    },
    {
      id: 'ts3.ma.time.routine', title: L('Times of our day', 'మన రోజులో సమయాలు'),
      intro: [
        h('A day in Teja\'s life', 'తేజ రోజు'),
        p('Teja wakes up at 6 in the morning. School starts at 9. Lunch is at 1 in the afternoon. He plays at 5 in the evening and sleeps at 9 at night.', 'తేజ ఉదయం 6కి లేస్తాడు. బడి 9కి మొదలవుతుంది. మధ్యాహ్నం 1కి భోజనం. సాయంత్రం 5కి ఆడుకుంటాడు, రాత్రి 9కి నిద్రపోతాడు.'),
        photo('🌅', L('Morning: the sun rises and the day begins.', 'ఉదయం: సూర్యుడు ఉదయిస్తాడు, రోజు మొదలవుతుంది.')),
        vis({ kind: 'emoji', text: '🌅 morning → ☀️ afternoon → 🌇 evening → 🌙 night' }, 'Parts of the day', 'రోజులోని భాగాలు'),
        p('How long is school? From 9 to 4: count the hours on your fingers — 10, 11, 12, 1, 2, 3, 4. That is 7 hours.', 'బడి ఎంత సేపు? 9 నుండి 4 వరకు: వేళ్ళ మీద గంటలు లెక్కించు — 10, 11, 12, 1, 2, 3, 4. అంటే 7 గంటలు.'),
        keys(L('Morning: sunrise to about 12 noon.', 'ఉదయం: సూర్యోదయం నుండి దాదాపు మధ్యాహ్నం 12 వరకు.'), L('Afternoon: after 12 noon till about 4.', 'మధ్యాహ్నం: 12 తర్వాత దాదాపు 4 వరకు.'), L('Evening, then night when it gets dark.', 'సాయంత్రం, చీకటి పడ్డాక రాత్రి.')),
        tip('To find how many hours, count forward one hour at a time.', 'ఎన్ని గంటలో కనుగొనడానికి ఒక్కో గంట ముందుకు లెక్కించు.'),
      ],
      examples: [
        ex(L('A movie starts at 3:00 and lasts 2 hours. When does it end?', 'సినిమా 3:00కి మొదలై 2 గంటలు ఉంటుంది. ఎప్పుడు ముగుస్తుంది?'), [L('Count 2 hours forward: 4, 5.', '2 గంటలు ముందుకు: 4, 5.')], same('5:00')),
        ex(L('When do you eat dinner — morning or night?', 'రాత్రి భోజనం ఎప్పుడు — ఉదయమా, రాత్రా?'), [L('Dinner is the last meal of the day.', 'రాత్రి భోజనం రోజులో చివరి భోజనం.')], L('Night', 'రాత్రి')),
      ],
      practice: [
        bank('part', [
          [L('When does the sun rise?', 'సూర్యుడు ఎప్పుడు ఉదయిస్తాడు?'), L('Morning', 'ఉదయం'), [L('Afternoon', 'మధ్యాహ్నం'), L('Night', 'రాత్రి')], [L('Think of when the day begins.', 'రోజు ఎప్పుడు మొదలవుతుందో ఆలోచించు.')], L('The sun rises in the morning.', 'సూర్యుడు ఉదయం ఉదయిస్తాడు.'), L('Sunrise starts the morning.', 'సూర్యోదయంతో ఉదయం మొదలవుతుంది.')],
          [L('When do we see the moon and stars?', 'చంద్రుడు, నక్షత్రాలు ఎప్పుడు కనిపిస్తాయి?'), L('Night', 'రాత్రి'), [L('Morning', 'ఉదయం'), L('Afternoon', 'మధ్యాహ్నం')], [L('It must be dark.', 'చీకటిగా ఉండాలి.')], L('We see the moon and stars at night.', 'రాత్రి చంద్రుడు, నక్షత్రాలు కనిపిస్తాయి.'), L('In the day the sun is too bright to see stars.', 'పగలు సూర్యకాంతిలో నక్షత్రాలు కనిపించవు.')],
          [L('School lunch at 1 o\'clock is in the…', 'బడిలో 1 గంటకు భోజనం…'), L('Afternoon', 'మధ్యాహ్నం'), [L('Morning', 'ఉదయం'), L('Night', 'రాత్రి')], [L('1 o\'clock comes just after 12 noon.', '1 గంట మధ్యాహ్నం 12 తర్వాత వస్తుంది.')], L('After 12 noon is afternoon.', 'మధ్యాహ్నం 12 తర్వాత మధ్యాహ్నం.'), L('Morning ends at 12 noon.', 'ఉదయం మధ్యాహ్నం 12కి ముగుస్తుంది.')],
          [L('When do children usually play outside after school?', 'బడి తర్వాత పిల్లలు సాధారణంగా బయట ఎప్పుడు ఆడుకుంటారు?'), L('Evening', 'సాయంత్రం'), [L('Morning', 'ఉదయం'), L('Midnight', 'అర్ధరాత్రి')], [L('School ends around 4.', 'బడి దాదాపు 4కి ముగుస్తుంది.')], L('After school, in the evening.', 'బడి తర్వాత, సాయంత్రం.'), L('In the morning you go to school.', 'ఉదయం బడికి వెళ్తావు.')],
          [L('Which comes first in a day?', 'రోజులో ఏది ముందు వస్తుంది?'), L('Morning', 'ఉదయం'), [L('Evening', 'సాయంత్రం'), L('Afternoon', 'మధ్యాహ్నం')], [L('Order: morning, afternoon, evening, night.', 'క్రమం: ఉదయం, మధ్యాహ్నం, సాయంత్రం, రాత్రి.')], L('The day starts with morning.', 'రోజు ఉదయంతో మొదలవుతుంది.'), L('Morning comes before afternoon and evening.', 'మధ్యాహ్నం, సాయంత్రం కంటే ముందు ఉదయం.')],
        ]),
        tp('hours', (r) => {
          const s = r.int(6, 11), d = r.int(1, 6); const e = s + d > 12 ? s + d - 12 : s + d;
          const act = r.pick([L('A train journey from Kazipet', 'కాజీపేట నుండి రైలు ప్రయాణం'), L('A cricket match', 'క్రికెట్ మ్యాచ్'), L('The village fair', 'గ్రామ జాతర'), L('Cooking for the festival', 'పండుగ వంట'), L('A school trip to the zoo', 'జూకు బడి విహారయాత్ర')]);
          return typed(L(`${act.en} starts at ${s}:00 and ends at ${e}:00. How many hours does it last?`, `${act.te} ${s}:00కి మొదలై ${e}:00కి ముగిసింది. ఎన్ని గంటలు పట్టింది?`), num(d),
            [L(`Count forward from ${s} one hour at a time.`, `${s} నుండి ఒక్కో గంట ముందుకు లెక్కించు.`), L('After 12 comes 1.', '12 తర్వాత 1 వస్తుంది.')],
            [L(`${Array.from({ length: d }, (_, i) => ((s + i) % 12) + 1).join(', ')} → ${d} hours`, `${Array.from({ length: d }, (_, i) => ((s + i) % 12) + 1).join(', ')} → ${d} గంటలు`)],
            e < s ? [[String(s - e), L('The clock goes past 12 and starts again at 1. Count forward.', 'గడియారం 12 దాటి మళ్ళీ 1 నుండి మొదలవుతుంది. ముందుకు లెక్కించు.')]] : [], { unitHint: 'hours' });
        }),
      ],
    },
    {
      id: 'ts3.ma.time.calendar', title: L('Days, weeks and the calendar', 'రోజులు, వారాలు, క్యాలెండర్'),
      intro: [
        h('Reading a calendar', 'క్యాలెండర్ చదవడం'),
        p('A week has 7 days: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday. Then Sunday comes again.', 'వారానికి 7 రోజులు: ఆదివారం, సోమవారం, మంగళవారం, బుధవారం, గురువారం, శుక్రవారం, శనివారం. తర్వాత మళ్ళీ ఆదివారం.'),
        p('A year has 12 months. Some months have 30 days, some 31. February has 28 days (29 in a leap year).', 'సంవత్సరానికి 12 నెలలు. కొన్ని నెలలకు 30, కొన్నిటికి 31 రోజులు. ఫిబ్రవరికి 28 రోజులు (లీపు సంవత్సరంలో 29).'),
        photo('📝', L('Write down special days, like Bathukamma or your birthday, and find them on the calendar.', 'బతుకమ్మ, నీ పుట్టినరోజు లాంటి ప్రత్యేక రోజులు రాసుకుని క్యాలెండర్‌లో వెతుకు.')),
        vis({ kind: 'emoji', text: 'Sun Mon Tue Wed Thu Fri Sat\n            1   2   3   4\n  5   6   7   8   9  10  11' }, 'The first rows of a month on a calendar', 'క్యాలెండర్‌లో ఒక నెల మొదటి వరుసలు'),
        keys(L('7 days = 1 week.', '7 రోజులు = 1 వారం.'), L('12 months = 1 year.', '12 నెలలు = 1 సంవత్సరం.'), L('The same weekday comes back every 7 days.', 'అదే వారం రోజు ప్రతి 7 రోజులకు మళ్ళీ వస్తుంది.')),
        tip('Knuckle trick: on your fists, months on a knuckle have 31 days; months in a dip have 30 (or 28 for February).', 'పిడికిలి ఉపాయం: పిడికిలి ఎముకపై వచ్చే నెలలకు 31 రోజులు; గుంటలో వచ్చేవాటికి 30 (ఫిబ్రవరికి 28).'),
      ],
      examples: [
        ex(L('Today is Thursday. What day will it be after 3 days?', 'ఈ రోజు గురువారం. 3 రోజుల తర్వాత ఏ రోజు?'), [L('Friday (1), Saturday (2), Sunday (3)', 'శుక్రవారం (1), శనివారం (2), ఆదివారం (3)')], L('Sunday', 'ఆదివారం')),
        ex(L('Bathukamma starts on the 3rd of a month. A week later is which date?', 'బతుకమ్మ నెలలో 3వ తేదీన మొదలైంది. ఒక వారం తర్వాత ఏ తేదీ?'), [same('3 + 7 = 10')], L('The 10th', '10వ తేదీ')),
      ],
      practice: [
        tp('after', (r) => {
          const d = r.int(0, 6), k = r.int(1, 9); const back = r.int(0, 3) === 0 && k <= 6;
          const a = back ? (d - k + 7) % 7 : (d + k) % 7;
          return mcq(r, back ? L(`Today is ${DAYS[d].en}. What day was it ${k} day${k > 1 ? 's' : ''} ago?`, `ఈ రోజు ${DAYS[d].te}. ${k > 1 ? `${k} రోజుల` : 'ఒక రోజు'} క్రితం ఏ రోజు?`) : L(`Today is ${DAYS[d].en}. What day will it be after ${k} day${k > 1 ? 's' : ''}?`, `ఈ రోజు ${DAYS[d].te}. ${k > 1 ? `${k} రోజుల` : 'ఒక రోజు'} తర్వాత ఏ రోజు?`),
            DAYS[a], [DAYS[(a + 1) % 7], DAYS[(a + 6) % 7], DAYS[(a + 2) % 7]],
            [L(back ? 'Count backwards one day at a time.' : 'Count forward one day at a time.', back ? 'ఒక్కో రోజు వెనక్కి లెక్కించు.' : 'ఒక్కో రోజు ముందుకు లెక్కించు.'), L('After Saturday comes Sunday.', 'శనివారం తర్వాత ఆదివారం.')],
            [L(`Counting ${k} day${k > 1 ? 's' : ''} ${back ? 'back' : 'on'} from ${DAYS[d].en} gives ${DAYS[a].en}.`, `${DAYS[d].te} నుండి ${k} రోజులు ${back ? 'వెనక్కి' : 'ముందుకు'} లెక్కిస్తే ${DAYS[a].te}.`)],
            [['wrong', L('Do not count today. Start counting from the next day.', 'ఈ రోజును లెక్కించకు. తర్వాతి రోజు నుండి లెక్కించు.')]]);
        }),
        tp('month', (r) => {
          const i = r.int(0, 11); const k = r.int(0, 2);
          if (k === 0) {
            const [m, d] = MONTHS[i];
            return mcqN(r, L(`How many days are there in ${m.en}? (not a leap year)`, `${m.te} నెలలో ఎన్ని రోజులు? (లీపు సంవత్సరం కాదు)`), d, [30, 31, 28, 29].filter((x) => x !== d),
              [L('Use the knuckle trick.', 'పిడికిలి ఉపాయం వాడు.'), L('February is the shortest month.', 'ఫిబ్రవరి అతి చిన్న నెల.')], [L(`${m.en} has ${d} days.`, `${m.te}కి ${d} రోజులు.`)]);
          }
          const nx = MONTHS[(i + 1) % 12][0], pv = MONTHS[(i + 11) % 12][0];
          const after = k === 1;
          return mcq(r, after ? L(`Which month comes after ${MONTHS[i][0].en}?`, `${MONTHS[i][0].te} తర్వాత ఏ నెల?`) : L(`Which month comes before ${MONTHS[i][0].en}?`, `${MONTHS[i][0].te} ముందు ఏ నెల?`), after ? nx : pv,
            [after ? pv : nx, MONTHS[(i + 2) % 12][0], MONTHS[(i + 10) % 12][0]],
            [L('Say the months in order from January.', 'జనవరి నుండి నెలలను క్రమంలో చెప్పు.'), L('After December comes January again.', 'డిసెంబర్ తర్వాత మళ్ళీ జనవరి.')],
            [L(`${pv.en} → ${MONTHS[i][0].en} → ${nx.en}`, `${pv.te} → ${MONTHS[i][0].te} → ${nx.te}`)], [['wrong', L('"After" means the next one; "before" means the one just ahead of it in the list.', '"తర్వాత" అంటే తర్వాతిది; "ముందు" అంటే జాబితాలో దాని ముందుది.')]]);
        }),
        tp('weeks', (r) => {
          const w = r.int(2, 5); const extra = r.int(0, 1) === 1 ? r.int(1, 6) : 0;
          return typed(extra ? L(`How many days are there in ${w} weeks and ${extra} days?`, `${w} వారాలు ${extra} రోజుల్లో ఎన్ని రోజులు?`) : L(`How many days are there in ${w} weeks?`, `${w} వారాల్లో ఎన్ని రోజులు?`), num(w * 7 + extra),
            [L('1 week = 7 days.', '1 వారం = 7 రోజులు.'), same(`${w} × 7 = ${w * 7}`)], [same(`${w} × 7 = ${w * 7}`), ...(extra ? [same(`${w * 7} + ${extra} = ${w * 7 + extra}`)] : [])],
            [[String(w + extra), L('Each week has 7 days. Multiply the weeks by 7.', 'ప్రతి వారానికి 7 రోజులు. వారాలను 7తో గుణించు.')]]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 10 MATHS IN DAY-TO-DAY LIFE
const MONEY = [1, 2, 5, 10, 20, 50, 100];
const GOODS: [S, number, number][] = [
  [L('notebook', 'నోట్‌బుక్'), 25, 40], [L('pencil', 'పెన్సిల్'), 5, 10], [L('pen', 'పెన్ను'), 10, 20], [L('eraser', 'రబ్బరు'), 3, 6], [L('banana', 'అరటి పండు'), 5, 8],
  [L('mango', 'మామిడి పండు'), 15, 30], [L('samosa', 'సమోసా'), 10, 15], [L('kite', 'గాలిపటం'), 10, 25], [L('coconut', 'కొబ్బరికాయ'), 25, 40], [L('cup of tea', 'కప్పు టీ'), 10, 15],
];
const PLURALS: S[] = [L('pencils', 'పెన్సిళ్ళు'), L('erasers', 'రబ్బర్లు'), L('bananas', 'అరటి పండ్లు'), L('samosas', 'సమోసాలు'), L('kites', 'గాలిపటాలు'), L('pens', 'పెన్నులు'), L('balloons', 'బెలూన్లు')];
const ch10: USpec = {
  id: 'ts3.ma.ch10', subject: 'math', title: L('Maths in Day-to-Day Life', 'దైనందిన జీవితంలో గణితం'), source: src(10),
  objectives: [
    {
      id: 'ts3.ma.money.count', title: L('Counting coins and notes', 'నాణేలు, నోట్లు లెక్కించడం'),
      intro: [
        h('Our money', 'మన డబ్బు'),
        p('We use coins of ₹1, ₹2, ₹5, ₹10, ₹20 and notes of ₹10, ₹20, ₹50, ₹100, ₹200 and ₹500.', 'మనం ₹1, ₹2, ₹5, ₹10, ₹20 నాణేలు, ₹10, ₹20, ₹50, ₹100, ₹200, ₹500 నోట్లు వాడతాం.'),
        photo('🪙', L('Coins of different values. Count the biggest ones first.', 'వేర్వేరు విలువల నాణేలు. ముందు పెద్దవి లెక్కించు.')),
        vis({ kind: 'coins', rupees: [50, 20, 10, 5, 2] }, '₹50 + ₹20 + ₹10 + ₹5 + ₹2 = ₹87', '₹50 + ₹20 + ₹10 + ₹5 + ₹2 = ₹87'),
        p('To count money, start with the biggest note and keep adding: 50, 70, 80, 85, 87.', 'డబ్బు లెక్కించడానికి పెద్ద నోటుతో మొదలుపెట్టి కలుపుతూ వెళ్ళు: 50, 70, 80, 85, 87.'),
        keys(L('Count from the biggest to the smallest.', 'పెద్దది నుండి చిన్నదానికి లెక్కించు.'), L('₹100 = ten ₹10 notes = two ₹50 notes.', '₹100 = పది ₹10 నోట్లు = రెండు ₹50 నోట్లు.'), L('₹1 = 100 paise.', '₹1 = 100 పైసలు.')),
        tip('Play shop at home with paper notes. Be the shopkeeper and give change!', 'ఇంట్లో కాగితం నోట్లతో దుకాణం ఆట ఆడు. దుకాణదారుగా చిల్లర ఇవ్వు!'),
      ],
      examples: [
        ex(L('How much money: two ₹20 notes and three ₹5 coins?', 'రెండు ₹20 నోట్లు, మూడు ₹5 నాణేలు — ఎంత డబ్బు?'), [same('20 + 20 = 40'), same('5 + 5 + 5 = 15'), same('40 + 15 = 55')], same('₹55'), { kind: 'coins', rupees: [20, 20, 5, 5, 5] }),
        ex(L('How many ₹10 notes make ₹70?', '₹70కి ఎన్ని ₹10 నోట్లు?'), [L('Count in 10s: 10, 20, … 70', '10ల చొప్పున: 10, 20, … 70'), same('70 ÷ 10 = 7')], L('7 notes', '7 నోట్లు')),
      ],
      practice: [
        tp('count', (r) => {
          const k = r.int(3, 6); const cs = Array.from({ length: k }, () => r.pick(MONEY)).sort((a, b) => b - a); const t = cs.reduce((a, b) => a + b, 0);
          return typed(L('How much money is shown here?', 'ఇక్కడ ఎంత డబ్బు ఉంది?'), num(t),
            [L('Start with the biggest one.', 'అతి పెద్దదానితో మొదలుపెట్టు.'), L('Keep adding the next one.', 'తర్వాతిది కలుపుతూ వెళ్ళు.')],
            [same(cs.map((c) => `₹${c}`).join(' + ') + ` = ₹${t}`)], [[String(k), L('Do not count the number of coins. Add their values.', 'నాణేల సంఖ్య లెక్కించకు. వాటి విలువలు కూడు.')]], { visual: { kind: 'coins', rupees: cs } });
        }),
        tp('make', (r) => {
          const note = r.pick([2, 5, 10, 20, 50]); const k = r.int(2, 10); const total = note * k;
          return typed(L(`How many ₹${note} ${note >= 10 ? 'notes' : 'coins'} make ₹${total}?`, `₹${total}కి ఎన్ని ₹${note} ${note >= 10 ? 'నోట్లు' : 'నాణేలు'}?`), num(k),
            [L(`Count in ${note}s until you reach ${total}.`, `${total} వచ్చే వరకు ${note}ల చొప్పున లెక్కించు.`), L(`Or find ${total} ÷ ${note}.`, `లేదా ${total} ÷ ${note} కనుగొను.`)],
            [same(`${note} × ${k} = ${total}`), L(`${k} ${note >= 10 ? 'notes' : 'coins'}`, `${k} ${note >= 10 ? 'నోట్లు' : 'నాణేలు'}`)], [[String(total - note), L('Count how many of them, not how much is left.', 'ఎన్ని కావాలో లెక్కించు, ఎంత మిగిలిందో కాదు.')]]);
        }),
      ],
    },
    {
      id: 'ts3.ma.money.bill', title: L('Buying and selling: bills and change', 'కొనడం, అమ్మడం: బిల్లు, చిల్లర'),
      intro: [
        h('At the kirana shop', 'కిరాణా దుకాణంలో'),
        p('Lakshmi buys a notebook for ₹35 and a pen for ₹15. The bill is 35 + 15 = ₹50. She gives ₹100. The shopkeeper returns 100 − 50 = ₹50.', 'లక్ష్మి ₹35కి నోట్‌బుక్, ₹15కి పెన్ను కొంది. బిల్లు 35 + 15 = ₹50. ఆమె ₹100 ఇచ్చింది. దుకాణదారు 100 − 50 = ₹50 తిరిగి ఇచ్చాడు.'),
        photo('🏪', L('A small shop: add the prices to make the bill.', 'చిన్న దుకాణం: ధరలు కూడి బిల్లు తయారు చేయి.')),
        vis({ kind: 'emoji', text: 'Notebook  ₹35\nPen       ₹15\n──────────────\nTotal     ₹50' }, 'A simple bill', 'ఒక చిన్న బిల్లు'),
        keys(L('Bill = add all the prices.', 'బిల్లు = అన్ని ధరలు కూడు.'), L('Change = money given − bill.', 'చిల్లర = ఇచ్చిన డబ్బు − బిల్లు.'), L('The shopkeeper sells; you buy.', 'దుకాణదారు అమ్ముతాడు; నువ్వు కొంటావు.')),
        tip('Always check your change before you leave the shop.', 'దుకాణం నుండి వెళ్ళే ముందు చిల్లర సరిచూసుకో.'),
      ],
      examples: [
        ex(L('Rice ₹60, dal ₹85, salt ₹20. What is the bill?', 'బియ్యం ₹60, పప్పు ₹85, ఉప్పు ₹20. బిల్లు ఎంత?'), [same('60 + 85 = 145'), same('145 + 20 = 165')], same('₹165')),
        ex(L('The bill is ₹165. You pay ₹200. How much change?', 'బిల్లు ₹165. నువ్వు ₹200 ఇచ్చావు. చిల్లర ఎంత?'), [same('200 − 165 = 35')], same('₹35')),
      ],
      practice: [
        tp('bill', (r) => {
          const items = r.shuffle(GOODS).slice(0, r.int(2, 3)); const prices = items.map(([, lo, hi]) => r.int(lo, hi)); const t = prices.reduce((a, b) => a + b, 0);
          return typed(L(`Make the bill: ${items.map(([n], i) => `${n.en} ₹${prices[i]}`).join(', ')}. What is the total?`, `బిల్లు చేయి: ${items.map(([n], i) => `${n.te} ₹${prices[i]}`).join(', ')}. మొత్తం ఎంత?`), num(t),
            [L('Add all the prices.', 'అన్ని ధరలు కూడు.'), L('Add two first, then the next.', 'ముందు రెండు కూడి, తర్వాతిది కలుపు.')],
            [same(prices.join(' + ') + ` = ${t}`), L(`Total: ₹${t}`, `మొత్తం: ₹${t}`)], [[String(prices[0] + prices[1]), L('Add every item on the list.', 'జాబితాలోని ప్రతి వస్తువు కలుపు.')]]);
        }),
        tp('change', (r) => {
          const [a, b] = r.shuffle(GOODS).slice(0, 2); const pa = r.int(a[1], a[2]), pb = r.int(b[1], b[2]); const t = pa + pb; const note = t < 50 ? 50 : 100;
          return typed(L(`You buy a ${a[0].en} for ₹${pa} and a ${b[0].en} for ₹${pb}. You pay with ₹${note}. How much change do you get?`, `నువ్వు ₹${pa}కి ${a[0].te}, ₹${pb}కి ${b[0].te} కొన్నావు. ₹${note} ఇచ్చావు. ఎంత చిల్లర వస్తుంది?`), num(note - t),
            [L('First find the bill.', 'ముందు బిల్లు కనుగొను.'), L('Then subtract the bill from the money given.', 'తర్వాత ఇచ్చిన డబ్బు నుండి బిల్లు తీసివేయి.')],
            [same(`${pa} + ${pb} = ${t}`), same(`${note} − ${t} = ${note - t}`)],
            [[String(t), L('That is the bill. Change = money given − bill.', 'అది బిల్లు. చిల్లర = ఇచ్చిన డబ్బు − బిల్లు.')], [String(note - pa), L('Add both prices before subtracting.', 'తీసివేసే ముందు రెండు ధరలు కూడు.')]]);
        }, 2),
      ],
    },
    {
      id: 'ts3.ma.money.rate', title: L('Rate and cost', 'ధర, మొత్తం ఖర్చు'),
      intro: [
        h('Price of one, price of many', 'ఒకదాని ధర, చాలా వాటి ధర'),
        p('One samosa costs ₹10. That is its rate. 4 samosas cost 4 × 10 = ₹40.', 'ఒక సమోసా ధర ₹10. అదే దాని రేటు. 4 సమోసాలు 4 × 10 = ₹40.'),
        photo('🥭', L('Mangoes at ₹20 each: 5 mangoes cost 5 × ₹20 = ₹100.', 'ఒక్కోటి ₹20 చొప్పున మామిడి పండ్లు: 5 పండ్లు 5 × ₹20 = ₹100.')),
        X({
          title: L('What if? Buying mangoes', 'మామిడి పండ్లు కొంటే?'), formula: 'Cost = number of mangoes × price of one',
          result: ['C', L('Total cost', 'మొత్తం ఖర్చు'), 'n * p', '₹'],
          vars: [['n', L('Number of mangoes', 'మామిడి పండ్ల సంఖ్య'), 1, 10, 1, 5], ['p', L('Price of one mango', 'ఒక మామిడి ధర'), 5, 50, 5, 20, '₹']],
          notes: [['n', L('Each extra mango adds one more price to the cost.', 'ఒక్కో అదనపు పండు ఖర్చుకు ఇంకో ధర కలుపుతుంది.'), L('One mango less saves the price of one mango.', 'ఒక పండు తక్కువైతే ఒక పండు ధర మిగులుతుంది.')],
            ['p', L('If one mango costs more, every mango costs more, so the total jumps up.', 'ఒక పండు ధర పెరిగితే ప్రతి పండూ ఖరీదే, కాబట్టి మొత్తం బాగా పెరుగుతుంది.'), L('A cheaper price makes the total smaller.', 'ధర తగ్గితే మొత్తం తగ్గుతుంది.')]],
          mistakes: [[L('Adding the number and the price: 5 + 20', 'సంఖ్య, ధర కూడటం: 5 + 20'), L('Each mango costs ₹20, so 5 mangoes cost 20 + 20 + 20 + 20 + 20 = 5 × 20.', 'ప్రతి పండు ₹20, కాబట్టి 5 పండ్లు 20 + 20 + 20 + 20 + 20 = 5 × 20.')]],
          real: L('At the rythu bazaar, sellers multiply the rate by how many you buy.', 'రైతు బజార్‌లో అమ్మేవారు రేటును నువ్వు కొన్న సంఖ్యతో గుణిస్తారు.'),
        }),
        keys(L('Cost of many = number × rate.', 'చాలా వాటి ఖర్చు = సంఖ్య × రేటు.'), L('Rate (cost of one) = total cost ÷ number.', 'రేటు (ఒకదాని ధర) = మొత్తం ఖర్చు ÷ సంఖ్య.')),
        tip('Check: the cost of many must be more than the cost of one.', 'సరిచూడు: చాలా వాటి ఖర్చు ఒకదాని ధర కంటే ఎక్కువ ఉండాలి.'),
      ],
      examples: [
        ex(L('One kite costs ₹15. What do 3 kites cost?', 'ఒక గాలిపటం ₹15. 3 గాలిపటాలు ఎంత?'), [same('3 × 15 = 45')], same('₹45')),
        ex(L('6 pencils cost ₹30. What does 1 pencil cost?', '6 పెన్సిళ్ళు ₹30. 1 పెన్సిల్ ఎంత?'), [same('30 ÷ 6 = 5')], same('₹5')),
      ],
      practice: [
        tp('many', (r) => {
          const [g] = r.pick(GOODS); const rate = r.int(2, 10) * 5, n = r.int(2, 9);
          return typed(L(`One ${g.en} costs ₹${rate}. What do ${n} cost?`, `ఒక ${g.te} ధర ₹${rate}. ${n} ఎంత?`), num(n * rate),
            [L('Cost of many = number × rate.', 'చాలా వాటి ఖర్చు = సంఖ్య × రేటు.'), same(`${n} × ${rate}`)], [same(`${n} × ${rate} = ${n * rate}`), L(`₹${n * rate}`, `₹${n * rate}`)],
            [[String(n + rate), L('Multiply the number by the price of one, do not add.', 'సంఖ్యను ఒకదాని ధరతో గుణించు, కూడకు.')]]);
        }),
        tp('one', (r) => {
          const g = r.pick(PLURALS); const rate = r.int(2, 10), n = r.int(2, 9);
          return typed(L(`${n} ${g.en} cost ₹${n * rate}. What does one cost?`, `${n} ${g.te} కలిపి ₹${n * rate}. ఒకదాని ధర ఎంత?`), num(rate),
            [L('Share the total equally among the items.', 'మొత్తాన్ని వస్తువులకు సమానంగా పంచు.'), same(`${n * rate} ÷ ${n}`)], [same(`${n * rate} ÷ ${n} = ${rate}`), L(`Check: ${n} × ${rate} = ${n * rate}`, `సరిచూడు: ${n} × ${rate} = ${n * rate}`)],
            [[String(n * rate - n), L('Divide the total by the number of items.', 'మొత్తాన్ని వస్తువుల సంఖ్యతో భాగించు.')]], {});
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 11 DATA HANDLING
const tally = (n: number) => `${'卌 '.repeat(Math.floor(n / 5))}${'|'.repeat(n % 5)}`.trim();
const FRUITS: { name: S; e: string }[] = [
  { name: L('Mango', 'మామిడి'), e: '🥭' }, { name: L('Banana', 'అరటి'), e: '🍌' }, { name: L('Apple', 'ఆపిల్'), e: '🍎' },
  { name: L('Grapes', 'ద్రాక్ష'), e: '🍇' }, { name: L('Orange', 'నారింజ'), e: '🍊' }, { name: L('Watermelon', 'పుచ్చకాయ'), e: '🍉' },
];
/** 4 distinct fruit counts, deterministic from r */
const survey = (r: Rng, lo: number, hi: number) => {
  const fr = r.shuffle(FRUITS).slice(0, 4); const vals: number[] = [];
  while (vals.length < 4) { const v = r.int(lo, hi); if (!vals.includes(v)) vals.push(v); }
  return fr.map((f, i) => ({ ...f, v: vals[i] }));
};
const ch11: USpec = {
  id: 'ts3.ma.ch11', subject: 'math', title: L('Data Handling', 'దత్తాంశ నిర్వహణ'), source: src(11),
  objectives: [
    {
      id: 'ts3.ma.data.tally', title: L('Tally marks', 'టాలీ గుర్తులు'),
      intro: [
        h('Count fast with lines', 'గీతలతో వేగంగా లెక్కించు'),
        p('The class is voting for a favourite fruit. For each vote, draw one line |. The fifth line goes across the first four: 卌 means 5.', 'తరగతి ఇష్టమైన పండు కోసం ఓటు వేస్తోంది. ప్రతి ఓటుకు ఒక గీత | గీయి. ఐదో గీత మొదటి నాలుగింటిని అడ్డంగా దాటుతుంది: 卌 అంటే 5.'),
        vis({ kind: 'emoji', text: '🥭 Mango   卌 卌 ||   = 12\n🍌 Banana  卌 |||     = 8' }, 'Tally marks for fruit votes', 'పండ్ల ఓట్లకు టాలీ గుర్తులు'),
        photo('🙋', L('Hands up! Each raised hand gets one tally mark.', 'చేతులు పైకి! ఎత్తిన ప్రతి చేతికి ఒక టాలీ గుర్తు.')),
        keys(L('One line for each thing.', 'ఒక్కో వస్తువుకు ఒక గీత.'), L('Every 5th line crosses the bundle: 卌 = 5.', 'ప్రతి 5వ గీత కట్టను దాటుతుంది: 卌 = 5.'), L('To read: count bundles in 5s, then add the single lines.', 'చదవడానికి: కట్టలను 5ల చొప్పున లెక్కించి, ఒంటరి గీతలు కలుపు.')),
        tip('Bundles of 5 stop you from losing count.', '5ల కట్టలు లెక్క తప్పకుండా చూస్తాయి.'),
      ],
      examples: [
        ex(L('How many: 卌 卌 卌 |?', '卌 卌 卌 | — ఎన్ని?'), [L('3 bundles: 5, 10, 15', '3 కట్టలు: 5, 10, 15'), same('15 + 1 = 16')], same('16'), { kind: 'emoji', text: '卌 卌 卌 |' }),
        ex(L('Show 9 with tally marks.', '9ని టాలీ గుర్తులతో చూపు.'), [same('9 = 5 + 4'), L('One bundle and 4 lines', 'ఒక కట్ట, 4 గీతలు')], same('卌 ||||')),
      ],
      practice: [
        tp('read', (r) => {
          const n = r.int(6, 28);
          return { type: 'count', keypad: 'numeric', prompt: L('Count the tally marks. Each 卌 means 5. How many?', 'టాలీ గుర్తులు లెక్కించు. ప్రతి 卌 అంటే 5. మొత్తం ఎన్ని?'),
            visual: { kind: 'emoji', text: tally(n) }, answer: num(n),
            hints: [L('Count the bundles of 5 first.', 'ముందు 5ల కట్టలు లెక్కించు.'), L(`There are ${Math.floor(n / 5)} bundles.`, `${Math.floor(n / 5)} కట్టలు ఉన్నాయి.`)],
            mistakes: [{ when: String(Math.floor(n / 5) * 4 + (n % 5)), explain: L('Each bundle 卌 has 5 lines — the crossing line counts too.', 'ప్రతి 卌 కట్టలో 5 గీతలు — అడ్డ గీత కూడా లెక్కే.') }],
            solution: [same(`${Math.floor(n / 5)} × 5 = ${Math.floor(n / 5) * 5}`), same(`${Math.floor(n / 5) * 5} + ${n % 5} = ${n}`)] };
        }),
        tp('make', (r) => {
          const n = r.int(7, 23);
          return mcq(r, L(`Which tally shows ${n}?`, `${n}ని చూపే టాలీ ఏది?`), same(tally(n)), [same(tally(n + 1)), same(tally(n - 1)), same(tally(n + 5))],
            [L(`${n} = ${Math.floor(n / 5)} fives and ${n % 5} more.`, `${n} = ${Math.floor(n / 5)} ఐదులు, ఇంకా ${n % 5}.`), L('Count each choice in 5s.', 'ప్రతి ఎంపికను 5ల చొప్పున లెక్కించు.')],
            [same(`${tally(n)} = ${n}`)], [['wrong', L('Count the bundles and the single lines in your choice again.', 'నువ్వు ఎంచుకున్నదానిలో కట్టలు, ఒంటరి గీతలు మళ్ళీ లెక్కించు.')]]);
        }),
      ],
    },
    {
      id: 'ts3.ma.data.picto', title: L('Pictographs', 'బొమ్మల పటాలు (పిక్టోగ్రాఫ్)'),
      intro: [
        h('Data with pictures', 'బొమ్మలతో దత్తాంశం'),
        p('A pictograph uses pictures to show how many. Look at the key: it tells how much one picture is worth.', 'పిక్టోగ్రాఫ్ ఎన్నో బొమ్మలతో చూపిస్తుంది. సూచిక (కీ) చూడు: ఒక బొమ్మ విలువ ఎంతో అది చెబుతుంది.'),
        vis({ kind: 'emoji', text: 'Mon 🥛🥛🥛\nTue 🥛🥛🥛🥛🥛\nWed 🥛🥛\nKey: 🥛 = 2 litres' }, 'Milk sold each day. Each glass means 2 litres.', 'రోజూ అమ్మిన పాలు. ఒక్కో గ్లాసు 2 లీటర్లు.'),
        p('On Tuesday there are 5 glasses. Each glass is 2 litres, so 5 × 2 = 10 litres.', 'మంగళవారం 5 గ్లాసులు. ఒక్కో గ్లాసు 2 లీటర్లు, కాబట్టి 5 × 2 = 10 లీటర్లు.'),
        photo('🥛', L('One glass picture can stand for more than one litre. Always read the key!', 'ఒక గ్లాసు బొమ్మ ఒక లీటరు కంటే ఎక్కువను సూచించవచ్చు. ఎప్పుడూ సూచిక చదువు!')),
        keys(L('Count the pictures in a row.', 'ఒక వరుసలోని బొమ్మలు లెక్కించు.'), L('Multiply by the key value.', 'సూచిక విలువతో గుణించు.'), L('The longest row is the most.', 'పొడవైన వరుసే ఎక్కువ.')),
        tip('Before answering, put your finger on the key and read it aloud.', 'జవాబు చెప్పే ముందు సూచికపై వేలు పెట్టి గట్టిగా చదువు.'),
      ],
      examples: [
        ex(L('Key: ⭐ = 1 child. Mango row: ⭐⭐⭐⭐. How many children like mango?', 'సూచిక: ⭐ = 1 పిల్లవాడు. మామిడి వరుస: ⭐⭐⭐⭐. ఎంత మందికి మామిడి ఇష్టం?'), [L('4 stars × 1', '4 నక్షత్రాలు × 1')], L('4 children', '4 మంది పిల్లలు')),
        ex(L('Key: 🌳 = 2 trees. A village row shows 🌳🌳🌳. How many trees were planted?', 'సూచిక: 🌳 = 2 చెట్లు. ఒక గ్రామ వరుసలో 🌳🌳🌳. ఎన్ని చెట్లు నాటారు?'), [same('3 × 2 = 6')], L('6 trees', '6 చెట్లు')),
      ],
      practice: [
        tp('row', (r) => {
          const key = r.pick([1, 2, 5]); const s = survey(r, 1, 6); const pickI = r.int(0, 3); const f = s[pickI];
          const text = s.map((x) => `${x.name.en.padEnd(10)} ${x.e.repeat(x.v)}`).join('\n') + `\nKey: one picture = ${key} child${key > 1 ? 'ren' : ''}`;
          return typed(L(`The pictograph shows favourite fruits. How many children like ${f.name.en.toLowerCase()}?`, `పిక్టోగ్రాఫ్ ఇష్టమైన పండ్లను చూపిస్తోంది. ఎంత మందికి ${f.name.te} ఇష్టం?`), num(f.v * key),
            [L(`Count the pictures in the ${f.name.en} row: ${f.v}.`, `${f.name.te} వరుసలో బొమ్మలు లెక్కించు: ${f.v}.`), L(`Each picture means ${key}.`, `ఒక్కో బొమ్మ ${key}.`)],
            [same(`${f.v} × ${key} = ${f.v * key}`)], key > 1 ? [[String(f.v), L('You counted pictures. Now use the key: multiply by its value.', 'బొమ్మలు లెక్కించావు. ఇప్పుడు సూచిక వాడు: దాని విలువతో గుణించు.')]] : [], { visual: { kind: 'emoji', text } });
        }),
        tp('most', (r) => {
          const s = survey(r, 1, 7); const most = r.int(0, 1) === 1;
          const best = s.reduce((a, b) => (most ? (b.v > a.v ? b : a) : (b.v < a.v ? b : a)));
          const text = s.map((x) => `${x.name.en.padEnd(10)} ${x.e.repeat(x.v)}`).join('\n') + '\nKey: one picture = 1 child';
          return mcq(r, most ? L('Which fruit is liked by the MOST children?', 'ఏ పండును ఎక్కువ మంది ఇష్టపడతారు?') : L('Which fruit is liked by the FEWEST children?', 'ఏ పండును తక్కువ మంది ఇష్టపడతారు?'), best.name, s.filter((x) => x !== best).map((x) => x.name),
            [most ? L('Find the longest row.', 'పొడవైన వరుస కనుగొను.') : L('Find the shortest row.', 'పొట్టి వరుస కనుగొను.')],
            [L(`${best.name.en} has ${best.v} pictures, the ${most ? 'most' : 'fewest'}.`, `${best.name.te}కు ${best.v} బొమ్మలు, అన్నిటికంటే ${most ? 'ఎక్కువ' : 'తక్కువ'}.`)],
            [['wrong', L('Count every row and compare.', 'ప్రతి వరుస లెక్కించి పోల్చు.')]], { visual: { kind: 'emoji', text } });
        }),
      ],
    },
    {
      id: 'ts3.ma.data.table', title: L('Reading simple tables', 'సాధారణ పట్టికలు చదవడం'),
      intro: [
        h('Data in rows and columns', 'వరుసలు, నిలువు వరుసల్లో దత్తాంశం'),
        p('A table puts the data neatly. Here the school counted the saplings planted by each class for Haritha Haram.', 'పట్టిక దత్తాంశాన్ని చక్కగా అమర్చుతుంది. హరితహారం కోసం ప్రతి తరగతి నాటిన మొక్కలను బడి లెక్కించింది.'),
        vis({ kind: 'emoji', text: 'Class   | Saplings\nClass 1 | 12\nClass 2 | 18\nClass 3 | 25\nClass 4 | 21' }, 'Saplings planted by each class', 'ప్రతి తరగతి నాటిన మొక్కలు'),
        vis({ kind: 'bar-graph', labels: ['Class 1', 'Class 2', 'Class 3', 'Class 4'], values: [12, 18, 25, 21], unit: 'saplings' }, 'The same data as bars', 'అదే దత్తాంశం పట్టీలుగా'),
        photo('🌱', L('Every sapling counts! Class 3 planted the most: 25.', 'ప్రతి మొక్క ముఖ్యం! 3వ తరగతి ఎక్కువ నాటింది: 25.')),
        keys(L('Find the row, then read across.', 'వరుస కనుగొని, అడ్డంగా చదువు.'), L('Most = biggest number. Least = smallest.', 'ఎక్కువ = పెద్ద సంఖ్య. తక్కువ = చిన్న సంఖ్య.'), L('Total = add all. Difference = bigger − smaller.', 'మొత్తం = అన్నీ కూడు. భేదం = పెద్దది − చిన్నది.')),
        tip('Use a ruler under the row so your eyes do not slip to the next line.', 'కళ్ళు తర్వాతి వరుసకు జారకుండా వరుస కింద స్కేలు పెట్టు.'),
      ],
      examples: [
        ex(L('From the table, how many more saplings did Class 3 plant than Class 1?', 'పట్టిక ప్రకారం 3వ తరగతి 1వ తరగతి కంటే ఎన్ని ఎక్కువ మొక్కలు నాటింది?'), [same('25 − 12 = 13')], L('13 more', '13 ఎక్కువ')),
        ex(L('How many saplings did Classes 2 and 4 plant together?', '2వ, 4వ తరగతులు కలిసి ఎన్ని మొక్కలు నాటాయి?'), [same('18 + 21 = 39')], L('39 saplings', '39 మొక్కలు')),
      ],
      practice: [
        tp('ask', (r) => {
          const s = survey(r, 5, 40); const k = r.int(0, 2); const [a, b] = r.shuffle([0, 1, 2, 3]).slice(0, 2).map((i) => s[i]);
          const text = 'Fruit      | Children\n' + s.map((x) => `${x.name.en.padEnd(10)} | ${x.v}`).join('\n');
          const vis2: Partial<QSpec> = { visual: { kind: 'emoji', text } };
          if (k === 0) return typed(L(`The table shows children's favourite fruits. How many children like ${a.name.en} or ${b.name.en}?`, `పట్టిక పిల్లలకు ఇష్టమైన పండ్లను చూపిస్తోంది. ${a.name.te} లేదా ${b.name.te} ఎంత మందికి ఇష్టం?`), num(a.v + b.v),
            [L('Read both rows.', 'రెండు వరుసలు చదువు.'), L('Together → add.', 'కలిపి → కూడు.')], [same(`${a.v} + ${b.v} = ${a.v + b.v}`)], [[String(Math.abs(a.v - b.v)), L('"Or" here means both groups together. Add.', 'ఇక్కడ "లేదా" అంటే రెండు గుంపులు కలిపి. కూడు.')]], vis2);
          if (k === 1) { const [x, y] = a.v > b.v ? [a, b] : [b, a];
            return typed(L(`How many more children like ${x.name.en} than ${y.name.en}?`, `${y.name.te} కంటే ${x.name.te}ను ఎంత మంది ఎక్కువ ఇష్టపడతారు?`), num(x.v - y.v),
              [L('Find the difference.', 'భేదం కనుగొను.')], [same(`${x.v} − ${y.v} = ${x.v - y.v}`)], [[String(x.v + y.v), L('"How many more" is a difference. Subtract.', '"ఎంత ఎక్కువ" అంటే భేదం. తీసివేయి.')]], vis2); }
          const t = s.reduce((acc, x) => acc + x.v, 0);
          return typed(L('How many children answered the survey in all?', 'సర్వేలో మొత్తం ఎంత మంది పిల్లలు జవాబిచ్చారు?'), num(t),
            [L('Add every row.', 'ప్రతి వరుస కూడు.')], [same(s.map((x) => x.v).join(' + ') + ` = ${t}`)], [], vis2);
        }),
        tp('bar', (r) => {
          const s = survey(r, 3, 30); const most = r.int(0, 1) === 1;
          const best = s.reduce((a, b) => (most ? (b.v > a.v ? b : a) : (b.v < a.v ? b : a)));
          return mcq(r, most ? L('The bar graph shows votes for fruits. Which fruit got the most votes?', 'పట్టీ గ్రాఫ్ పండ్ల ఓట్లను చూపిస్తోంది. ఏ పండుకు ఎక్కువ ఓట్లు?') : L('The bar graph shows votes for fruits. Which fruit got the fewest votes?', 'పట్టీ గ్రాఫ్ పండ్ల ఓట్లను చూపిస్తోంది. ఏ పండుకు తక్కువ ఓట్లు?'), best.name, s.filter((x) => x !== best).map((x) => x.name),
            [most ? L('The tallest bar is the most.', 'ఎత్తైన పట్టీ ఎక్కువ.') : L('The shortest bar is the fewest.', 'పొట్టి పట్టీ తక్కువ.')],
            [L(`${best.name.en}: ${best.v} votes`, `${best.name.te}: ${best.v} ఓట్లు`)], [['wrong', L('Compare the heights of the bars.', 'పట్టీల ఎత్తులు పోల్చు.')]],
            { visual: { kind: 'bar-graph', labels: s.map((x) => x.name.en), values: s.map((x) => x.v), unit: 'votes' } });
        }),
      ],
    },
  ],
};

// ================================================================== CH 12 PATTERNS
const PAT_UNITS: string[][] = [['🔴', '🔵'], ['🔺', '🟦'], ['⭐', '🌙', '⭐'], ['🟡', '🟡', '🟣'], ['🌼', '🍃', '🍃'], ['🔴', '🟢', '🔵'], ['🪁', '🎈'], ['🟥', '🟨', '🟩', '🟨']];
const SYM_YES: S[] = ['A', 'H', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y'].map((x) => L(x, x));
const SYM_NO: S[] = ['F', 'G', 'J', 'L', 'N', 'P', 'R', 'S', 'Z'].map((x) => L(x, x));
const ch12: USpec = {
  id: 'ts3.ma.ch12', subject: 'math', title: L('Patterns', 'అమరికలు (నమూనాలు)'), source: src(12),
  objectives: [
    {
      id: 'ts3.ma.pat.shape', title: L('Shape and design patterns', 'ఆకార, డిజైన్ అమరికలు'),
      intro: [
        h('What comes next?', 'తర్వాత ఏమి వస్తుంది?'),
        p('A pattern is something that repeats in the same way. Look at a Bathukamma: rings of yellow, pink and green flowers repeat again and again.', 'అమరిక అంటే ఒకే విధంగా పునరావృతమయ్యేది. బతుకమ్మను చూడు: పసుపు, గులాబీ, ఆకుపచ్చ పూల వరుసలు మళ్ళీ మళ్ళీ వస్తాయి.'),
        vis({ kind: 'emoji', text: '🔴 🔵 🔴 🔵 🔴 🔵 ❓' }, 'Red, blue, red, blue … next is red', 'ఎరుపు, నీలం, ఎరుపు, నీలం … తర్వాత ఎరుపు'),
        photo('🌸', L('Rangoli at Sankranti uses shapes that repeat around the centre.', 'సంక్రాంతి ముగ్గులో ఆకారాలు మధ్య చుట్టూ పునరావృతమవుతాయి.')),
        keys(L('Find the part that repeats (the core).', 'పునరావృతమయ్యే భాగం (మూలం) కనుగొను.'), L('Say the pattern aloud: red, blue, red, blue…', 'అమరికను గట్టిగా చెప్పు: ఎరుపు, నీలం, ఎరుపు, నీలం…'), L('Patterns can repeat colours, shapes, sizes or turns.', 'అమరికల్లో రంగులు, ఆకారాలు, పరిమాణాలు, తిరగడాలు పునరావృతం కావచ్చు.')),
        tip('Draw a line after each repeat of the core. Then the next one is easy to see.', 'మూలం ప్రతిసారి అయిపోయాక ఒక గీత గీయి. తర్వాతది సులభంగా కనిపిస్తుంది.'),
      ],
      examples: [
        ex(L('What comes next? ⭐ 🌙 ⭐ ⭐ 🌙 ⭐ ⭐ 🌙 …', 'తర్వాత ఏమిటి? ⭐ 🌙 ⭐ ⭐ 🌙 ⭐ ⭐ 🌙 …'), [L('The core is ⭐ 🌙 ⭐.', 'మూలం ⭐ 🌙 ⭐.'), L('After 🌙 comes ⭐.', '🌙 తర్వాత ⭐.')], same('⭐')),
        ex(L('How many shapes are in the core of 🔺 🟦 🟦 🔺 🟦 🟦?', '🔺 🟦 🟦 🔺 🟦 🟦 మూలంలో ఎన్ని ఆకారాలు?'), [L('It repeats after 🔺 🟦 🟦.', '🔺 🟦 🟦 తర్వాత పునరావృతమవుతుంది.')], same('3')),
      ],
      practice: [
        tp('next', (r) => {
          const u = r.pick(PAT_UNITS); const len = u.length * 2 + r.int(0, u.length - 1); const seq = Array.from({ length: len }, (_, i) => u[i % u.length]);
          const ans = u[len % u.length]; const opts = [...new Set(['🔴', '🔵', '🔺', '🟦', '⭐', '🌙', '🟡', '🟣', '🌼', '🍃', '🟢', '🪁', '🎈', '🟥', '🟨', '🟩'].filter((x) => x !== ans))];
          const wrong = [...u.filter((x) => x !== ans), ...r.shuffle(opts)].slice(0, 3);
          return mcq(r, L(`What comes next? ${seq.join(' ')} …`, `తర్వాత ఏమి వస్తుంది? ${seq.join(' ')} …`), same(ans), wrong.map(same),
            [L('Find the part that repeats.', 'పునరావృతమయ్యే భాగం కనుగొను.'), L(`The core is ${u.join(' ')}.`, `మూలం ${u.join(' ')}.`)],
            [L(`The core ${u.join(' ')} repeats, so next is ${ans}.`, `మూలం ${u.join(' ')} పునరావృతమవుతుంది, కాబట్టి తర్వాత ${ans}.`)], [['wrong', L('Say the pattern aloud from the start and keep going one more step.', 'అమరికను మొదటి నుండి గట్టిగా చెప్పి ఇంకో అడుగు ముందుకు వెళ్ళు.')]]);
        }),
        tp('core', (r) => {
          const u = r.pick(PAT_UNITS); const seq = [...u, ...u, ...u];
          return mcqN(r, L(`How many items are in the repeating part? ${seq.join(' ')}`, `పునరావృత భాగంలో ఎన్ని ఉన్నాయి? ${seq.join(' ')}`), u.length, [u.length + 1, u.length * 2, u.length - 1].filter((x) => x > 0),
            [L('Where does the pattern start again?', 'అమరిక మళ్ళీ ఎక్కడ మొదలవుతుంది?')], [L(`The repeating part is ${u.join(' ')}: ${u.length} items.`, `పునరావృత భాగం ${u.join(' ')}: ${u.length}.`)]);
        }, 2),
      ],
    },
    {
      id: 'ts3.ma.pat.number', title: L('Number patterns', 'సంఖ్యా అమరికలు'),
      intro: [
        h('Numbers that grow by the same step', 'ఒకే అడుగుతో పెరిగే సంఖ్యలు'),
        p('5, 10, 15, 20, … Each number is 5 more than the one before. The rule is "add 5".', '5, 10, 15, 20, … ప్రతి సంఖ్య ముందుదానికంటే 5 ఎక్కువ. నియమం "5 కలుపు".'),
        vis({ kind: 'number-line', from: 0, to: 40, step: 5, jumps: [[0, 10], [10, 20], [20, 30], [30, 40]] }, 'Jumps of 10: 0, 10, 20, 30, 40', '10ల దూకులు: 0, 10, 20, 30, 40'),
        photo('🐇', L('A rabbit hopping 3 steps each time lands on 3, 6, 9, 12…', 'ఒక్కోసారి 3 అడుగులు దూకే కుందేలు 3, 6, 9, 12… మీద పడుతుంది.')),
        keys(L('Find the difference between two neighbours.', 'పక్కపక్కన ఉన్న రెండింటి భేదం కనుగొను.'), L('Check that it is the same all along.', 'అది అంతటా ఒకటేనా చూడు.'), L('Patterns can also go down: 50, 45, 40…', 'అమరికలు తగ్గవచ్చు కూడా: 50, 45, 40…')),
        tip('Write the jumps (+5, +5, +5) above the numbers.', 'సంఖ్యల పైన దూకులు (+5, +5, +5) రాయి.'),
      ],
      examples: [
        ex(L('Next number: 4, 8, 12, 16, ?', 'తర్వాతి సంఖ్య: 4, 8, 12, 16, ?'), [L('Rule: add 4.', 'నియమం: 4 కలుపు.'), same('16 + 4 = 20')], same('20')),
        ex(L('Next number: 90, 80, 70, ?', 'తర్వాతి సంఖ్య: 90, 80, 70, ?'), [L('Rule: take away 10.', 'నియమం: 10 తీసివేయి.'), same('70 − 10 = 60')], same('60')),
      ],
      practice: [
        tp('next', (r) => {
          const step = r.pick([2, 3, 4, 5, 10, 100, 50]); const down = r.int(0, 2) === 0; const start = down ? step * r.int(5, Math.min(12, Math.floor(999 / step))) : step * r.int(0, 5) + r.int(0, 3);
          const seq = Array.from({ length: 4 }, (_, i) => start + (down ? -1 : 1) * step * i); const ans = start + (down ? -1 : 1) * step * 4;
          return typed(L(`What comes next? ${seq.join(', ')}, ?`, `తర్వాత ఏమి? ${seq.join(', ')}, ?`), num(ans),
            [L('Find how much it changes each time.', 'ప్రతిసారి ఎంత మారుతుందో కనుగొను.'), L(`Rule: ${down ? 'take away' : 'add'} ${step}.`, `నియమం: ${step} ${down ? 'తీసివేయి' : 'కలుపు'}.`)],
            [same(`${seq[3]} ${down ? '−' : '+'} ${step} = ${ans}`)], [[String(seq[3] + (down ? step : -step)), L(down ? 'The numbers are going down. Subtract.' : 'The numbers are going up. Add.', down ? 'సంఖ్యలు తగ్గుతున్నాయి. తీసివేయి.' : 'సంఖ్యలు పెరుగుతున్నాయి. కూడు.')]]);
        }),
        tp('rule', (r) => {
          const step = r.pick([2, 3, 4, 5, 6, 10]); const start = r.int(1, 20); const seq = Array.from({ length: 5 }, (_, i) => start + step * i);
          return mcq(r, L(`What is the rule? ${seq.join(', ')}`, `నియమం ఏమిటి? ${seq.join(', ')}`), L(`Add ${step}`, `${step} కలుపు`), [L(`Add ${step + 1}`, `${step + 1} కలుపు`), L(`Take away ${step}`, `${step} తీసివేయి`), L(`Add ${step === 2 ? 4 : step - 1}`, `${step === 2 ? 4 : step - 1} కలుపు`)],
            [same(`${seq[1]} − ${seq[0]} = ${step}`), L('Check the next pair too.', 'తర్వాతి జతను కూడా చూడు.')], [L(`Each number is ${step} more than the one before.`, `ప్రతి సంఖ్య ముందుదానికంటే ${step} ఎక్కువ.`)],
            [['wrong', L('Subtract two neighbours to find the step.', 'అడుగు కనుగొనడానికి పక్క సంఖ్యలను తీసివేయి.')]]);
        }),
      ],
    },
    {
      id: 'ts3.ma.pat.sym', title: L('Symmetrical halves', 'సౌష్ఠవ సగాలు'),
      intro: [
        h('Two matching halves', 'సరిపోయే రెండు సగాలు'),
        p('Fold a paper with an ink blot in the middle and open it. Both sides look the same! This is symmetry. The fold line is the line of symmetry.', 'మధ్యలో సిరా చుక్క ఉన్న కాగితాన్ని మడిచి తెరువు. రెండు వైపులా ఒకేలా ఉంటాయి! ఇదే సౌష్ఠవం. మడత గీతే సౌష్ఠవ రేఖ.'),
        photo('🦋', L('A butterfly: the left wing matches the right wing.', 'సీతాకోకచిలుక: ఎడమ రెక్క కుడి రెక్కకు సరిపోతుంది.')),
        vis({ kind: 'emoji', text: 'A H M O T U  ✔ symmetrical\nF G J L N  ✘ not symmetrical' }, 'Letters with and without a line of symmetry', 'సౌష్ఠవ రేఖ ఉన్న, లేని అక్షరాలు'),
        keys(L('Symmetrical: fold it and the halves fit exactly.', 'సౌష్ఠవం: మడిస్తే సగాలు సరిగ్గా సరిపోతాయి.'), L('Many leaves, faces and flowers are symmetrical.', 'చాలా ఆకులు, ముఖాలు, పువ్వులు సౌష్ఠవంగా ఉంటాయి.'), L('Use a mirror on the fold line to check.', 'సరిచూడటానికి మడత గీతపై అద్దం పెట్టు.')),
        tip('Write a capital letter on paper, fold it down the middle and see if the halves match.', 'కాగితంపై పెద్ద అక్షరం రాసి, మధ్యలో మడిచి సగాలు సరిపోతాయా చూడు.'),
      ],
      examples: [
        ex(L('Is the letter T symmetrical?', 'T అక్షరానికి సౌష్ఠవం ఉందా?'), [L('Fold it down the middle (a standing line).', 'మధ్యలో (నిలువు గీత) మడువు.'), L('Both halves match.', 'రెండు సగాలు సరిపోతాయి.')], L('Yes', 'అవును')),
        ex(L('Is the letter F symmetrical?', 'F అక్షరానికి సౌష్ఠవం ఉందా?'), [L('Its arms point only to the right.', 'దాని చేతులు కుడి వైపే ఉన్నాయి.'), L('No fold makes the halves match.', 'ఏ మడతలోనూ సగాలు సరిపోవు.')], L('No', 'లేదు')),
      ],
      practice: [
        tapT('letters', L('Tap ALL the letters that have a line of symmetry.', 'సౌష్ఠవ రేఖ ఉన్న అన్ని అక్షరాలను నొక్కు.'), SYM_YES, SYM_NO,
          [L('Imagine folding each letter in the middle.', 'ప్రతి అక్షరాన్ని మధ్యలో మడిచినట్టు ఊహించు.'), L('Do both halves match?', 'రెండు సగాలు సరిపోతాయా?')], L('Letters like F, L and N do not match when folded.', 'F, L, N లాంటివి మడిస్తే సరిపోవు.')),
        bank('obj', [
          [L('Which of these is symmetrical?', 'వీటిలో ఏది సౌష్ఠవంగా ఉంటుంది?'), L('A butterfly', 'సీతాకోకచిలుక'), [L('A torn paper', 'చిరిగిన కాగితం'), L('A broken stick', 'విరిగిన కర్ర')], [L('Which one has two matching sides?', 'దేనికి సరిపోయే రెండు వైపులు ఉన్నాయి?')], L('A butterfly\'s wings match on both sides.', 'సీతాకోకచిలుక రెక్కలు రెండు వైపులా సరిపోతాయి.'), L('Torn and broken things are uneven.', 'చిరిగినవి, విరిగినవి అసమానంగా ఉంటాయి.')],
          [L('What is the fold line in a symmetrical shape called?', 'సౌష్ఠవ ఆకారంలో మడత గీతను ఏమంటారు?'), L('Line of symmetry', 'సౌష్ఠవ రేఖ'), [L('Number line', 'సంఖ్యా రేఖ'), L('Tally line', 'టాలీ గీత')], [L('It divides the shape into matching halves.', 'అది ఆకారాన్ని సరిపోయే సగాలుగా విభజిస్తుంది.')], L('It is called the line of symmetry.', 'దాన్ని సౌష్ఠవ రేఖ అంటారు.'), L('A number line is for counting, not folding.', 'సంఖ్యా రేఖ లెక్కించడానికి, మడవడానికి కాదు.')],
          [L('How many lines of symmetry does a square have?', 'చతురస్రానికి ఎన్ని సౌష్ఠవ రేఖలు?'), L('4', '4'), [L('1', '1'), L('2', '2'), L('0', '0')], [L('Fold it up-down, side-side and along both corners.', 'పై-కింద, పక్క-పక్క, రెండు మూలల వెంట మడువు.')], L('2 straight folds + 2 corner folds = 4.', '2 నేరు మడతలు + 2 మూల మడతలు = 4.'), L('Do not forget the folds from corner to corner.', 'మూల నుండి మూలకు మడతలు మర్చిపోకు.'), { kind: 'shape', shape: 'square' }],
          [L('A mango leaf folded along its middle vein: do the halves match?', 'మామిడి ఆకును మధ్య ఈనె వెంట మడిస్తే సగాలు సరిపోతాయా?'), L('Yes, nearly exactly', 'అవును, దాదాపు సరిగ్గా'), [L('No, never', 'లేదు, ఎప్పుడూ కాదు')], [L('Look at a leaf: the middle vein splits it.', 'ఆకును చూడు: మధ్య ఈనె దాన్ని విభజిస్తుంది.')], L('Most leaves are symmetrical about the middle vein.', 'చాలా ఆకులు మధ్య ఈనె వెంట సౌష్ఠవంగా ఉంటాయి.'), L('Try it with a real leaf!', 'నిజమైన ఆకుతో ప్రయత్నించు!')],
          [L('Which shape has NO straight line of symmetry?', 'ఏ ఆకారానికి సౌష్ఠవ రేఖ లేదు?'), L('The letter S', 'S అక్షరం'), [L('A circle', 'వృత్తం'), L('The letter A', 'A అక్షరం'), L('A heart', 'హృదయం గుర్తు')], [L('Try folding each one.', 'ప్రతిదాన్ని మడిచి చూడు.')], L('S does not match when folded any way.', 'S ఏ వైపు మడిచినా సరిపోదు.'), L('A circle, A and a heart all have matching halves.', 'వృత్తం, A, హృదయం — అన్నిటికీ సరిపోయే సగాలు ఉన్నాయి.')],
          [L('Your face has a line of symmetry. Where is it?', 'నీ ముఖానికి సౌష్ఠవ రేఖ ఉంది. అది ఎక్కడ?'), L('Down the middle, through the nose', 'మధ్యలో, ముక్కు మీదుగా నిలువుగా'), [L('Across the eyes', 'కళ్ళ మీదుగా అడ్డంగా'), L('Along one ear', 'ఒక చెవి వెంట')], [L('Which way gives two matching halves?', 'ఏ వైపు రెండు సరిపోయే సగాలు ఇస్తుంది?')], L('A line down the middle gives a left and a right half that match.', 'మధ్య నిలువు గీత సరిపోయే ఎడమ, కుడి సగాలు ఇస్తుంది.'), L('Top and bottom of the face are different.', 'ముఖం పై, కింది భాగాలు వేరు.')],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 13 AI AND DIGITAL LITERACY
const PARTS: [S, S][] = [
  [L('Monitor', 'మానిటర్'), L('shows pictures and words', 'బొమ్మలు, అక్షరాలు చూపిస్తుంది')],
  [L('Keyboard', 'కీబోర్డ్'), L('types letters and numbers', 'అక్షరాలు, అంకెలు టైప్ చేస్తుంది')],
  [L('Mouse', 'మౌస్'), L('points and clicks', 'చూపి, క్లిక్ చేస్తుంది')],
  [L('CPU', 'సీపీయూ'), L('does the work and thinks fast', 'పని చేస్తుంది, వేగంగా లెక్కిస్తుంది')],
  [L('Speaker', 'స్పీకర్'), L('plays sound', 'శబ్దం వినిపిస్తుంది')],
  [L('Printer', 'ప్రింటర్'), L('prints on paper', 'కాగితంపై ముద్రిస్తుంది')],
  [L('Microphone', 'మైక్రోఫోన్'), L('takes in your voice', 'నీ గొంతును తీసుకుంటుంది')],
];
const SEQS: [S, S[]][] = [
  [L('Switch on and use a computer', 'కంప్యూటర్ ఆన్ చేసి వాడటం'), [L('Press the power button', 'పవర్ బటన్ నొక్కు'), L('Wait for the screen to start', 'స్క్రీన్ మొదలయ్యే వరకు ఆగు'), L('Click the drawing app with the mouse', 'మౌస్‌తో డ్రాయింగ్ యాప్ క్లిక్ చేయి'), L('Shut down when finished', 'అయిపోయాక షట్ డౌన్ చేయి')]],
  [L('Ask a voice assistant a question', 'వాయిస్ అసిస్టెంట్‌ను ప్రశ్న అడగటం'), [L('Say the wake word', 'మేల్కొలుపు మాట చెప్పు'), L('Ask your question clearly', 'ప్రశ్నను స్పష్టంగా అడుగు'), L('Listen to the answer', 'జవాబు విను'), L('Check the answer with your teacher', 'జవాబును టీచర్‌తో సరిచూడు')]],
  [L('Brush your teeth', 'పళ్ళు తోముకోవడం'), [L('Wet the brush', 'బ్రష్ తడుపు'), L('Put toothpaste on it', 'దానిపై పేస్టు పెట్టు'), L('Brush all your teeth', 'అన్ని పళ్ళు తోము'), L('Rinse your mouth', 'నోరు పుక్కిలించు')]],
  [L('Type your name', 'నీ పేరు టైప్ చేయడం'), [L('Open the writing app', 'రాసే యాప్ తెరువు'), L('Click where you want to type', 'టైప్ చేయాల్సిన చోట క్లిక్ చేయి'), L('Press the letter keys one by one', 'అక్షర కీలను ఒక్కొక్కటిగా నొక్కు'), L('Save your work', 'నీ పని సేవ్ చేయి')]],
  [L('Draw a square with steps', 'మెట్లతో చతురస్రం గీయడం'), [L('Draw a line 3 cm long', '3 సెం.మీ. గీత గీయి'), L('Turn and draw 3 cm down', 'తిరిగి 3 సెం.మీ. కిందికి గీయి'), L('Turn and draw 3 cm back', 'తిరిగి 3 సెం.మీ. వెనక్కి గీయి'), L('Turn and join to the start', 'తిరిగి మొదటికి కలుపు')]],
  [L('Plant a seed', 'విత్తనం నాటడం'), [L('Fill a pot with soil', 'కుండీలో మట్టి నింపు'), L('Make a small hole', 'చిన్న గుంత చేయి'), L('Put the seed in and cover it', 'విత్తనం వేసి కప్పు'), L('Water it', 'నీళ్ళు పోయి')]],
];
const ch13: USpec = {
  id: 'ts3.ma.ch13', subject: 'math', title: L('Introduction of Artificial Intelligence and Digital Literacy', 'కృత్రిమ మేధ (AI) పరిచయం, డిజిటల్ అక్షరాస్యత'), source: src(13),
  objectives: [
    {
      id: 'ts3.ma.ai.computer', title: L('A computer and its parts', 'కంప్యూటర్, దాని భాగాలు'),
      intro: [
        h('Meet the computer', 'కంప్యూటర్‌ను కలుద్దాం'),
        p('A computer is a machine that follows our instructions very fast. It can do sums, show pictures, play songs and help us learn.', 'కంప్యూటర్ మన సూచనలను చాలా వేగంగా పాటించే యంత్రం. అది లెక్కలు చేస్తుంది, బొమ్మలు చూపిస్తుంది, పాటలు వినిపిస్తుంది, నేర్చుకోవడానికి సహాయపడుతుంది.'),
        photo('🔤', L('A keyboard has keys for letters and numbers. We type with it.', 'కీబోర్డ్‌లో అక్షరాలు, అంకెల కీలు ఉంటాయి. దానితో టైప్ చేస్తాం.')),
        p('We give the computer information with the keyboard, mouse and microphone (input). It gives us results on the monitor, speaker and printer (output).', 'కీబోర్డ్, మౌస్, మైక్రోఫోన్‌తో కంప్యూటర్‌కు సమాచారం ఇస్తాం (ఇన్‌పుట్). మానిటర్, స్పీకర్, ప్రింటర్ ద్వారా అది ఫలితాలు ఇస్తుంది (అవుట్‌పుట్).'),
        keys(L('Input: keyboard, mouse, microphone.', 'ఇన్‌పుట్: కీబోర్డ్, మౌస్, మైక్రోఫోన్.'), L('Output: monitor, speaker, printer.', 'అవుట్‌పుట్: మానిటర్, స్పీకర్, ప్రింటర్.'), L('The CPU is the brain-box that does the work.', 'సీపీయూ పని చేసే మెదడు పెట్టె.')),
        remember('A computer only does what it is told. It needs clear instructions.', 'కంప్యూటర్ చెప్పినదే చేస్తుంది. దానికి స్పష్టమైన సూచనలు కావాలి.'),
        tip('Handle a computer with clean, dry hands, and never pull the wires.', 'కంప్యూటర్‌ను శుభ్రమైన, పొడి చేతులతో వాడు, తీగలు ఎప్పుడూ లాగకు.'),
      ],
      examples: [
        ex(L('Which part shows the cartoon you are watching?', 'నువ్వు చూస్తున్న కార్టూన్‌ను ఏ భాగం చూపిస్తుంది?'), [L('Pictures appear on a screen.', 'బొమ్మలు తెరపై కనిపిస్తాయి.')], L('The monitor', 'మానిటర్')),
        ex(L('Is a mouse an input or an output device?', 'మౌస్ ఇన్‌పుట్ పరికరమా, అవుట్‌పుట్ పరికరమా?'), [L('With a mouse we tell the computer where to click.', 'మౌస్‌తో ఎక్కడ క్లిక్ చేయాలో కంప్యూటర్‌కు చెబుతాం.'), L('We give information → input.', 'సమాచారం ఇస్తాం → ఇన్‌పుట్.')], L('Input', 'ఇన్‌పుట్')),
      ],
      practice: [
        tp('match', (r) => {
          const set = r.shuffle(PARTS).slice(0, 4);
          return { type: 'match', prompt: L(`Match each part of the computer to its job: ${set.map((x) => x[0].en).join(', ')}.`, `కంప్యూటర్ ప్రతి భాగాన్ని దాని పనితో జత చేయి: ${set.map((x) => x[0].te).join(', ')}.`), ...matching(r, set),
            hints: [L('Think: what do you do with each part?', 'ఆలోచించు: ప్రతి భాగంతో నువ్వు ఏమి చేస్తావు?'), L('Screen → see. Keys → type.', 'తెర → చూడటం. కీలు → టైప్.')],
            solution: set.map(([a, b]) => L(`${a.en} → ${b.en}`, `${a.te} → ${b.te}`)) };
        }),
        tp('io', (r) => {
          const all: [S, boolean][] = [[L('Keyboard', 'కీబోర్డ్'), true], [L('Mouse', 'మౌస్'), true], [L('Microphone', 'మైక్రోఫోన్'), true], [L('Monitor', 'మానిటర్'), false], [L('Speaker', 'స్పీకర్'), false], [L('Printer', 'ప్రింటర్'), false]];
          const [d, isIn] = r.pick(all);
          return mcq(r, L(`Is the ${d.en.toLowerCase()} an input device or an output device?`, `${d.te} ఇన్‌పుట్ పరికరమా, అవుట్‌పుట్ పరికరమా?`), isIn ? L('Input', 'ఇన్‌పుట్') : L('Output', 'అవుట్‌పుట్'), [isIn ? L('Output', 'అవుట్‌పుట్') : L('Input', 'ఇన్‌పుట్')],
            [L('Input: we give something to the computer.', 'ఇన్‌పుట్: మనం కంప్యూటర్‌కు ఇస్తాం.'), L('Output: the computer gives something to us.', 'అవుట్‌పుట్: కంప్యూటర్ మనకు ఇస్తుంది.')],
            [isIn ? L(`We use the ${d.en.toLowerCase()} to give information, so it is input.`, `${d.te}తో సమాచారం ఇస్తాం, కాబట్టి ఇన్‌పుట్.`) : L(`The ${d.en.toLowerCase()} gives us the result, so it is output.`, `${d.te} మనకు ఫలితం ఇస్తుంది, కాబట్టి అవుట్‌పుట్.`)],
            [['wrong', L('Ask: does information go INTO the computer, or come OUT of it?', 'అడుగు: సమాచారం కంప్యూటర్ లోపలికి వెళ్తుందా, బయటికి వస్తుందా?')]]);
        }),
      ],
    },
    {
      id: 'ts3.ma.ai.tools', title: L('AI helpers for learning', 'నేర్చుకోవడానికి AI సహాయకులు'),
      intro: [
        h('What is AI?', 'AI అంటే ఏమిటి?'),
        p('AI (Artificial Intelligence) is a computer program that has learnt from lots of examples. It can understand your voice, read text aloud, translate English into Telugu and suggest practice questions.', 'AI (కృత్రిమ మేధ) చాలా ఉదాహరణల నుండి నేర్చుకున్న కంప్యూటర్ ప్రోగ్రామ్. అది నీ గొంతు అర్థం చేసుకుంటుంది, అక్షరాలు చదివి వినిపిస్తుంది, ఇంగ్లీష్‌ను తెలుగులోకి అనువదిస్తుంది, సాధన ప్రశ్నలు సూచిస్తుంది.'),
        photo('🗣️', L('A voice assistant listens to your question and speaks an answer.', 'వాయిస్ అసిస్టెంట్ నీ ప్రశ్న విని జవాబు చెబుతుంది.')),
        p('AI is a helper, not a teacher who knows everything. It can make mistakes, so always check with your teacher or parents.', 'AI సహాయకుడు మాత్రమే, అన్నీ తెలిసిన టీచర్ కాదు. అది తప్పులు చేయవచ్చు, కాబట్టి ఎప్పుడూ టీచర్ లేదా తల్లిదండ్రులతో సరిచూసుకో.'),
        photo('🔒', L('Keep your password, home address and phone number secret online.', 'ఆన్‌లైన్‌లో నీ పాస్‌వర్డ్, ఇంటి చిరునామా, ఫోన్ నంబర్ రహస్యంగా ఉంచు.')),
        keys(L('AI can: listen, read aloud, translate, suggest.', 'AI చేయగలదు: వినడం, చదివి వినిపించడం, అనువదించడం, సూచించడం.'), L('AI can be wrong. Think and check.', 'AI తప్పు కావచ్చు. ఆలోచించి సరిచూడు.'), L('Never share personal details with an app or a stranger.', 'వ్యక్తిగత వివరాలు ఏ యాప్‌తో లేదా అపరిచితులతో పంచుకోకు.')),
        tip('Use AI to practise and to ask "why?", but do your own thinking first.', 'సాధనకు, "ఎందుకు?" అని అడగడానికి AI వాడు, కానీ ముందు నువ్వే ఆలోచించు.'),
      ],
      examples: [
        ex(L('An AI app says 7 × 8 = 54. What should you do?', 'ఒక AI యాప్ 7 × 8 = 54 అని చెప్పింది. నువ్వు ఏమి చేయాలి?'), [L('Check with the table: 7 × 8 = 56.', 'ఎక్కంతో సరిచూడు: 7 × 8 = 56.'), L('The app made a mistake.', 'యాప్ తప్పు చేసింది.')], L('Check it yourself and tell a grown-up', 'నువ్వే సరిచూసి పెద్దవాళ్ళకు చెప్పు')),
        ex(L('A game asks for your home address. Should you type it?', 'ఒక ఆట నీ ఇంటి చిరునామా అడుగుతోంది. టైప్ చేయాలా?'), [L('An address is personal information.', 'చిరునామా వ్యక్తిగత సమాచారం.')], L('No — ask a parent first', 'వద్దు — ముందు తల్లిదండ్రులను అడుగు')),
      ],
      practice: [
        bank('ai', [
          [L('Which of these can an AI helper do?', 'వీటిలో AI సహాయకుడు ఏమి చేయగలడు?'), L('Read a story aloud to you', 'నీకు కథ చదివి వినిపించడం'), [L('Eat your lunch', 'నీ భోజనం తినడం'), L('Plant a tree for you', 'నీ కోసం చెట్టు నాటడం')], [L('AI lives inside a computer or phone.', 'AI కంప్యూటర్ లేదా ఫోన్‌లో ఉంటుంది.')], L('AI can read text aloud with a computer voice.', 'AI కంప్యూటర్ గొంతుతో అక్షరాలు చదివి వినిపించగలదు.'), L('AI has no body; it cannot eat or dig.', 'AIకి శరీరం లేదు; అది తినలేదు, తవ్వలేదు.')],
          [L('An AI tool gives you an answer. What is the best thing to do?', 'AI సాధనం ఒక జవాబు ఇచ్చింది. చేయాల్సిన మంచి పని ఏమిటి?'), L('Think and check if it is right', 'ఆలోచించి సరైనదేనా సరిచూడు'), [L('Copy it without reading', 'చదవకుండా కాపీ చేయి'), L('Believe it always', 'ఎప్పుడూ నమ్ము')], [L('Can a computer make mistakes?', 'కంప్యూటర్ తప్పులు చేయగలదా?')], L('AI can be wrong, so we always check.', 'AI తప్పు కావచ్చు, కాబట్టి ఎప్పుడూ సరిచూస్తాం.'), L('Copying without thinking means you do not learn.', 'ఆలోచించకుండా కాపీ చేస్తే నేర్చుకోవు.')],
          [L('Which of these should you NEVER share with an app?', 'వీటిలో ఏది యాప్‌తో ఎప్పుడూ పంచుకోకూడదు?'), L('Your password', 'నీ పాస్‌వర్డ్'), [L('Your favourite colour', 'నీకు ఇష్టమైన రంగు'), L('A drawing of a flower', 'పువ్వు బొమ్మ')], [L('Which one is a secret?', 'ఏది రహస్యం?')], L('A password is secret. Keep it to yourself and your parents.', 'పాస్‌వర్డ్ రహస్యం. నీకు, తల్లిదండ్రులకు మాత్రమే.'), L('Passwords protect your account. Never share them.', 'పాస్‌వర్డ్‌లు నీ ఖాతాను కాపాడతాయి. ఎప్పుడూ పంచుకోకు.')],
          [L('Teja does not know the Telugu word for "elephant". Which AI tool can help?', 'తేజకు "elephant"కి తెలుగు పదం తెలియదు. ఏ AI సాధనం సహాయపడుతుంది?'), L('A translation app', 'అనువాద యాప్'), [L('A calculator', 'కాలిక్యులేటర్'), L('A clock', 'గడియారం')], [L('He needs to change English into Telugu.', 'అతను ఇంగ్లీష్‌ను తెలుగులోకి మార్చాలి.')], L('A translation app turns "elephant" into "ఏనుగు".', 'అనువాద యాప్ "elephant"ను "ఏనుగు"గా మారుస్తుంది.'), L('A calculator does sums, not words.', 'కాలిక్యులేటర్ లెక్కలు చేస్తుంది, పదాలు కాదు.')],
          [L('How does an AI helper learn?', 'AI సహాయకుడు ఎలా నేర్చుకుంటుంది?'), L('From lots and lots of examples', 'చాలా చాలా ఉదాహరణల నుండి'), [L('By going to school', 'బడికి వెళ్ళి'), L('By eating vegetables', 'కూరగాయలు తిని')], [L('It is a computer program.', 'అది కంప్యూటర్ ప్రోగ్రామ్.')], L('AI learns patterns from many examples.', 'AI చాలా ఉదాహరణల నుండి అమరికలు నేర్చుకుంటుంది.'), L('A program learns from data, not from a classroom.', 'ప్రోగ్రామ్ దత్తాంశం నుండి నేర్చుకుంటుంది, తరగతి గది నుండి కాదు.')],
          [L('How long should a child of your age use a screen in one go?', 'నీ వయసు పిల్లలు ఒకసారి ఎంత సేపు తెర వాడాలి?'), L('A short time, then take a break', 'కొద్ది సేపు, తర్వాత విరామం'), [L('The whole day', 'రోజంతా'), L('All night', 'రాత్రంతా')], [L('Your eyes need rest.', 'నీ కళ్ళకు విశ్రాంతి కావాలి.')], L('Use screens for a short time and play outside too.', 'తెరను కొద్ది సేపే వాడి, బయట కూడా ఆడుకో.'), L('Too much screen time tires your eyes and body.', 'ఎక్కువ తెర సమయం కళ్ళను, శరీరాన్ని అలసిపోయేలా చేస్తుంది.')],
        ]),
        tapT('safe', L('Tap ALL the things that are SAFE to do online.', 'ఆన్‌లైన్‌లో సురక్షితంగా చేయగల అన్నిటినీ నొక్కు.'),
          [L('Ask a parent before downloading', 'డౌన్‌లోడ్ చేసే ముందు తల్లిదండ్రులను అడగడం'), L('Check AI answers with a teacher', 'AI జవాబులను టీచర్‌తో సరిచూడటం'), L('Take breaks from the screen', 'తెర నుండి విరామం తీసుకోవడం'), L('Tell a grown-up if something feels wrong', 'ఏదైనా తప్పుగా అనిపిస్తే పెద్దవాళ్ళకు చెప్పడం')],
          [L('Share your password with a new friend online', 'ఆన్‌లైన్ కొత్త స్నేహితుడితో పాస్‌వర్డ్ పంచుకోవడం'), L('Type your home address in a game', 'ఆటలో ఇంటి చిరునామా టైప్ చేయడం'), L('Copy AI answers without checking', 'సరిచూడకుండా AI జవాబులు కాపీ చేయడం'), L('Talk to strangers in a chat', 'చాట్‌లో అపరిచితులతో మాట్లాడటం')],
          [L('Would your parents and teacher be happy with it?', 'దానికి నీ తల్లిదండ్రులు, టీచర్ సంతోషిస్తారా?'), L('Personal details stay private.', 'వ్యక్తిగత వివరాలు రహస్యంగా ఉండాలి.')],
          L('Never share secrets or personal details online, and always check with a grown-up.', 'ఆన్‌లైన్‌లో రహస్యాలు, వ్యక్తిగత వివరాలు ఎప్పుడూ పంచుకోకు, పెద్దవాళ్ళతో సరిచూసుకో.')),
      ],
    },
    {
      id: 'ts3.ma.ai.steps', title: L('Giving clear step-by-step instructions', 'స్పష్టమైన మెట్ల వారీ సూచనలు'),
      intro: [
        h('Computers need steps in order', 'కంప్యూటర్లకు క్రమంలో మెట్లు కావాలి'),
        p('A computer cannot guess. We must tell it every step, in the right order. A list of steps like this is called an algorithm.', 'కంప్యూటర్ ఊహించలేదు. ప్రతి మెట్టును సరైన క్రమంలో చెప్పాలి. ఇలాంటి మెట్ల జాబితాను అల్గారిథమ్ అంటారు.'),
        photo('🧩', L('Steps fit together like puzzle pieces — the order matters.', 'మెట్లు పజిల్ ముక్కల్లా కలుస్తాయి — క్రమం ముఖ్యం.')),
        vis({ kind: 'emoji', text: '1️⃣ Wet the brush\n➡️ Put toothpaste\n➡️ Brush\n➡️ Rinse' }, 'Steps to brush your teeth, in order', 'పళ్ళు తోముకునే మెట్లు, క్రమంలో'),
        keys(L('Each step should be small and clear.', 'ప్రతి మెట్టు చిన్నగా, స్పష్టంగా ఉండాలి.'), L('Wrong order gives a wrong result.', 'తప్పు క్రమం తప్పు ఫలితం ఇస్తుంది.'), L('Test your steps: act them out exactly.', 'నీ మెట్లను పరీక్షించు: సరిగ్గా అలాగే నటించు.')),
        tip('Play "robot": a friend follows your instructions exactly as you say them.', '"రోబో" ఆట ఆడు: నువ్వు చెప్పినట్టే స్నేహితుడు పాటిస్తాడు.'),
      ],
      examples: [
        ex(L('Which step comes first when you switch on a computer?', 'కంప్యూటర్ ఆన్ చేసేటప్పుడు ముందు ఏ మెట్టు?'), [L('Nothing works until it has power.', 'పవర్ లేకుండా ఏదీ పనిచేయదు.')], L('Press the power button', 'పవర్ బటన్ నొక్కు')),
        ex(L('Robot steps: "Go 2 steps forward, turn right, go 1 step." Where does the robot end?', 'రోబో మెట్లు: "2 అడుగులు ముందుకు, కుడికి తిరుగు, 1 అడుగు." రోబో ఎక్కడ ఆగుతుంది?'), [L('Forward 2, then right 1.', 'ముందుకు 2, తర్వాత కుడికి 1.')], L('2 ahead and 1 to the right of the start', 'మొదటి చోటు నుండి 2 ముందుకు, 1 కుడికి')),
      ],
      practice: [
        tp('order', (r) => {
          const [task, steps] = r.pick(SEQS);
          return { type: 'order', prompt: L(`Put the steps in the right order: ${task.en}`, `మెట్లను సరైన క్రమంలో పెట్టు: ${task.te}`), ...ordering(r, steps),
            hints: [L('What must happen first?', 'ముందు ఏమి జరగాలి?'), L('What is the very last step?', 'చివరి మెట్టు ఏది?')],
            solution: steps.map((s, i) => L(`${i + 1}. ${s.en}`, `${i + 1}. ${s.te}`)) };
        }),
        tp('first', (r) => {
          const [task, steps] = r.pick(SEQS); const last = r.int(0, 1) === 1; const ans = last ? steps[steps.length - 1] : steps[0];
          return mcq(r, last ? L(`${task.en}: which step comes LAST?`, `${task.te}: చివరి మెట్టు ఏది?`) : L(`${task.en}: which step comes FIRST?`, `${task.te}: మొదటి మెట్టు ఏది?`), ans, steps.filter((s) => s !== ans),
            [L('Imagine doing it yourself, slowly.', 'నువ్వే నెమ్మదిగా చేస్తున్నట్టు ఊహించు.')], [L(`${last ? 'Last' : 'First'}: ${ans.en}`, `${last ? 'చివరి' : 'మొదటి'}: ${ans.te}`)],
            [['wrong', L('Act out the steps. Which one can only happen at that point?', 'మెట్లను నటించి చూడు. ఆ స్థానంలో ఏది మాత్రమే జరగగలదు?')]]);
        }),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13];
