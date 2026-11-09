// Class 6 — NCERT Ganita Prakash (Mathematics) and physics chapters of NCERT Curiosity (Science).
import {
  buildClass, src, tp, ex, L, p, tip, f, vis, act, stepsB, num, frac, choose, matching, ordering, tapAll,
  gcd, lcm, fr, isPrime, NAMES, THINGS, CITIES, type USpec,
} from '../lib/kit';

const sq = (n: number) => n * n;
const tri = (n: number) => (n * (n + 1)) / 2;

// ------------------------------------------------------------------ MATHS
const S = (s: string) => L(s, s); // symbolic text identical in both languages

const SEQ_NAMES: [string, string][] = [['Square numbers', 'వర్గ సంఖ్యలు'], ['Triangular numbers', 'త్రిభుజాకార సంఖ్యలు'], ['Odd numbers', 'బేసి సంఖ్యలు'], ['Powers of 2', '2 యొక్క ఘాతాలు'], ['Cube numbers', 'ఘన సంఖ్యలు'], ['Even numbers', 'సరి సంఖ్యలు']];

const patterns: USpec = {
  id: 'c6.u.patterns', subject: 'math', title: L('Patterns in Mathematics', 'గణితంలో అమరికలు'), source: src('gp6', 1, 'Patterns in Mathematics'),
  objectives: [{
    id: 'c6.pat.sequences', title: L('Number sequences and their rules', 'సంఖ్యా శ్రేణులు మరియు వాటి నియమాలు'), prereqs: [],
    activities: ['game:patterns'],
    intro: [
      p('Mathematics is the search for patterns. A number sequence follows a rule — find the rule and you can predict any term.', 'గణితం అంటే అమరికల అన్వేషణ. సంఖ్యా శ్రేణి ఒక నియమాన్ని పాటిస్తుంది — నియమం కనుగొంటే ఏ పదాన్నైనా ఊహించవచ్చు.'),
      p('Famous sequences: counting numbers 1, 2, 3…; odd numbers 1, 3, 5…; square numbers 1, 4, 9, 16…; triangular numbers 1, 3, 6, 10…; powers of 2: 1, 2, 4, 8…', 'ప్రసిద్ధ శ్రేణులు: లెక్కింపు సంఖ్యలు 1, 2, 3…; బేసి సంఖ్యలు 1, 3, 5…; వర్గ సంఖ్యలు 1, 4, 9, 16…; త్రిభుజాకార సంఖ్యలు 1, 3, 6, 10…; 2 యొక్క ఘాతాలు 1, 2, 4, 8…'),
      vis({ kind: 'objects', emoji: '🔵', count: 10, groupsOf: 4 }, 'Dots arranged to show a triangular number pattern', 'త్రిభుజాకార సంఖ్య అమరికను చూపే చుక్కలు'),
      tip('Adding consecutive odd numbers starting from 1 always gives a square number: 1 + 3 + 5 = 9 = 3².', '1 నుండి వరుస బేసి సంఖ్యలను కలిపితే ఎప్పుడూ వర్గ సంఖ్య వస్తుంది: 1 + 3 + 5 = 9 = 3².'),
    ],
    examples: [
      ex(L('What comes next: 1, 4, 9, 16, 25, …?', 'తరువాత ఏది: 1, 4, 9, 16, 25, …?'), [L('These are 1², 2², 3², 4², 5²', 'ఇవి 1², 2², 3², 4², 5²'), L('Next is 6² = 36', 'తరువాతది 6² = 36')], S('36')),
      ex(L('Sum of the first 6 odd numbers?', 'మొదటి 6 బేసి సంఖ్యల మొత్తం?'), [S('1 + 3 + 5 + 7 + 9 + 11'), L('The sum of the first n odd numbers is n²', 'మొదటి n బేసి సంఖ్యల మొత్తం n²'), S('6² = 36')], S('36')),
    ],
    practice: [
      tp('next', (r) => {
        const kind = r.pick(['add', 'square', 'tri', 'double', 'odd'] as const);
        const s = r.int(1, 6);
        let seq: number[]; let rule: [string, string];
        if (kind === 'add') { const d = r.int(2, 9), a = r.int(1, 20); seq = [0, 1, 2, 3, 4, 5].map((i) => a + i * d); rule = [`add ${d} each time`, `ప్రతిసారి ${d} కలపాలి`]; }
        else if (kind === 'square') { seq = [0, 1, 2, 3, 4, 5].map((i) => sq(s + i)); rule = ['square numbers', 'వర్గ సంఖ్యలు']; }
        else if (kind === 'tri') { seq = [0, 1, 2, 3, 4, 5].map((i) => tri(s + i)); rule = ['triangular numbers (add 1 more each time)', 'త్రిభుజాకార సంఖ్యలు (ప్రతిసారి ఒకటి ఎక్కువ కలపాలి)']; }
        else if (kind === 'double') { const a = r.int(1, 5); seq = [0, 1, 2, 3, 4, 5].map((i) => a * 2 ** i); rule = ['double each time', 'ప్రతిసారి రెట్టింపు']; }
        else { seq = [0, 1, 2, 3, 4, 5].map((i) => 2 * (s + i) - 1); rule = ['odd numbers', 'బేసి సంఖ్యలు']; }
        const ans = seq[5];
        const shown = seq.slice(0, 5).join(', ');
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`What number comes next? ${shown}, …`, `తరువాత వచ్చే సంఖ్య ఏది? ${shown}, …`), answer: num(ans),
          hints: [L('Look at the differences between neighbouring terms.', 'పక్కపక్క పదాల మధ్య భేదాలను చూడండి.'), L('Are the differences constant, growing by 1, growing by 2, or is each term doubling?', 'భేదాలు స్థిరంగా ఉన్నాయా, 1 చొప్పున పెరుగుతున్నాయా, 2 చొప్పున పెరుగుతున్నాయా, లేదా ప్రతి పదం రెట్టింపు అవుతోందా?')],
          mistakes: [{ when: String(seq[4] + (seq[4] - seq[3])), explain: L('The difference is not the same every time here — check how the differences themselves change.', 'ఇక్కడ భేదం ప్రతిసారి ఒకటే కాదు — భేదాలు ఎలా మారుతున్నాయో చూడండి.') }],
          solution: [L(`Rule: ${rule[0]}`, `నియమం: ${rule[1]}`), L(`Next term = ${ans}`, `తరువాతి పదం = ${ans}`)],
        };
      }),
      tp('odd-sum', (r) => {
        const n = r.int(3, 15);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`What is the sum of the first ${n} odd numbers (1 + 3 + 5 + …)?`, `మొదటి ${n} బేసి సంఖ్యల (1 + 3 + 5 + …) మొత్తం ఎంత?`), answer: num(n * n),
          hints: [L('Try small cases: 1 = 1, 1 + 3 = 4, 1 + 3 + 5 = 9.', 'చిన్న ఉదాహరణలు ప్రయత్నించండి: 1 = 1, 1 + 3 = 4, 1 + 3 + 5 = 9.'), L('These are square numbers.', 'ఇవి వర్గ సంఖ్యలు.')],
          mistakes: [{ when: String(2 * n - 1), explain: L(`${2 * n - 1} is the ${n}th odd number itself, not the sum.`, `${2 * n - 1} అనేది ${n}వ బేసి సంఖ్య మాత్రమే, మొత్తం కాదు.`) }],
          solution: [L('Sum of the first n odd numbers = n²', 'మొదటి n బేసి సంఖ్యల మొత్తం = n²'), S(`${n}² = ${n * n}`)],
        };
      }),
      tp('name', (r) => {
        const opts: [number, number[]][] = [[0, [1, 4, 9, 16, 25]], [1, [1, 3, 6, 10, 15]], [2, [1, 3, 5, 7, 9]], [3, [1, 2, 4, 8, 16]], [4, [1, 8, 27, 64, 125]], [5, [2, 4, 6, 8, 10]]];
        const [k, seq] = r.pick(opts);
        const nm = SEQ_NAMES[k];
        const c = choose(r, L(nm[0], nm[1]), r.shuffle(SEQ_NAMES.filter((_, i) => i !== k)).map(([e, t]) => L(e, t)));
        return {
          type: 'mcq', prompt: L(`Which sequence is this? ${seq.join(', ')}, …`, `ఇది ఏ శ్రేణి? ${seq.join(', ')}, …`), ...c,
          hints: [L('Check whether each term is n × n, n × n × n, or found by adding.', 'ప్రతి పదం n × n నా, n × n × n నా, లేక కలపడం ద్వారా వస్తుందా చూడండి.')],
          solution: [L(`${seq.join(', ')} are the ${nm[0].toLowerCase()}.`, `${seq.join(', ')} — ఇవి ${nm[1]}.`)],
        };
      }),
    ],
  }],
};

const ANG_TYPES: [string, string][] = [['Acute', 'లఘు కోణం'], ['Right', 'లంబ కోణం'], ['Obtuse', 'అధిక కోణం'], ['Straight', 'సరళ కోణం'], ['Reflex', 'పరావర్తన కోణం']];
const lines: USpec = {
  id: 'c6.u.lines', subject: 'math', title: L('Lines and Angles', 'రేఖలు మరియు కోణాలు'), source: src('gp6', 2, 'Lines and Angles'),
  objectives: [{
    id: 'c6.ang.measure', title: L('Types of angles and angles on a line', 'కోణాల రకాలు మరియు రేఖపై కోణాలు'), prereqs: [],
    activities: ['game:shapes', 'art:trace'],
    intro: [
      p('An angle is formed by two rays from a common point (the vertex). We measure it in degrees with a protractor.', 'ఒకే బిందువు (శీర్షం) నుండి వచ్చే రెండు కిరణాలు కోణాన్ని ఏర్పరుస్తాయి. దానిని కోణమానినితో డిగ్రీలలో కొలుస్తాం.'),
      stepsB(L('Acute: less than 90°', 'లఘు కోణం: 90° కంటే తక్కువ'), L('Right: exactly 90°', 'లంబ కోణం: సరిగ్గా 90°'), L('Obtuse: between 90° and 180°', 'అధిక కోణం: 90° మరియు 180° మధ్య'), L('Straight: exactly 180°', 'సరళ కోణం: సరిగ్గా 180°'), L('Reflex: between 180° and 360°', 'పరావర్తన కోణం: 180° మరియు 360° మధ్య')),
      f('Angles on a straight line add up to 180°; a full turn is 360°.'),
    ],
    examples: [
      ex(L('Classify an angle of 135°.', '135° కోణాన్ని వర్గీకరించండి.'), [L('135° is more than 90° but less than 180°', '135° అనేది 90° కంటే ఎక్కువ, 180° కంటే తక్కువ')], L('Obtuse', 'అధిక కోణం')),
      ex(L('Two angles on a straight line; one is 65°. The other?', 'సరళ రేఖపై రెండు కోణాలు; ఒకటి 65°. రెండవది?'), [L('They add to 180°', 'వాటి మొత్తం 180°'), S('180° − 65° = 115°')], S('115°')),
    ],
    practice: [
      tp('classify', (r) => {
        const a = r.pick([15, 30, 45, 60, 75, 89, 90, 100, 120, 135, 150, 170, 180, 200, 270, 300]);
        const k = a < 90 ? 0 : a === 90 ? 1 : a < 180 ? 2 : a === 180 ? 3 : 4;
        const c = choose(r, L(...ANG_TYPES[k]), ANG_TYPES.filter((_, i) => i !== k).map(([e, t]) => L(e, t)), 4);
        return {
          type: 'mcq', prompt: L(`What type of angle measures ${a}°?`, `${a}° కోణం ఏ రకం?`), ...c,
          hints: [L('Compare with 90° and 180°.', '90° మరియు 180° తో పోల్చండి.'), L('Reflex angles are more than 180°.', 'పరావర్తన కోణాలు 180° కంటే ఎక్కువ.')],
          solution: [L(`${a}° is ${ANG_TYPES[k][0].toLowerCase()}.`, `${a}° — ${ANG_TYPES[k][1]}.`)],
        };
      }),
      tp('linear', (r) => {
        const a = r.int(10, 170);
        const full = r.next() < 0.3;
        const ans = full ? 360 - a - 90 : 180 - a;
        return {
          type: 'typed', keypad: 'units', unitHint: '°',
          prompt: full ? L(`Three angles meet at a point and make a full turn. One is ${a}°, another is a right angle. Find the third.`, `ఒక బిందువు వద్ద మూడు కోణాలు కలిసి పూర్తి భ్రమణం చేస్తాయి. ఒకటి ${a}°, మరొకటి లంబ కోణం. మూడవది కనుగొనండి.`)
            : L(`Two angles together form a straight line. One is ${a}°. Find the other.`, `రెండు కోణాలు కలిసి సరళ రేఖ ఏర్పరుస్తాయి. ఒకటి ${a}°. రెండవది కనుగొనండి.`),
          answer: num(ans, '°'),
          hints: [full ? L('Angles around a point add to 360°.', 'ఒక బిందువు చుట్టూ కోణాల మొత్తం 360°.') : L('Angles on a straight line add to 180°.', 'సరళ రేఖపై కోణాల మొత్తం 180°.')],
          mistakes: [{ when: String(90 - a), explain: L('That uses 90°. Angles on a straight line add to 180°, not 90°.', 'మీరు 90° వాడారు. సరళ రేఖపై కోణాల మొత్తం 180°, 90° కాదు.') }],
          solution: [S(full ? `360° − ${a}° − 90° = ${ans}°` : `180° − ${a}° = ${ans}°`)],
        };
      }),
      tp('clock', (r) => {
        const h = r.int(1, 11);
        const g = Math.min(h, 12 - h);
        return {
          type: 'typed', keypad: 'units', unitHint: '°', prompt: L(`What is the smaller angle between the hands of a clock at ${h} o'clock?`, `${h} గంటలకు గడియారం ముళ్ళ మధ్య చిన్న కోణం ఎంత?`),
          visual: { kind: 'clock', h, m: 0 }, answer: num(g * 30, '°'),
          hints: [L('A full turn of 360° is split into 12 hour-gaps.', '360° పూర్తి భ్రమణం 12 గంట-ఖాళీలుగా విభజించబడింది.'), L('Each hour-gap is 30°.', 'ప్రతి గంట-ఖాళీ 30°.')],
          solution: [L(`Gaps between hands: ${g}`, `ముళ్ళ మధ్య ఖాళీలు: ${g}`), S(`${g} × 30° = ${g * 30}°`)],
        };
      }, 2),
    ],
  }],
};

const numberPlay: USpec = {
  id: 'c6.u.numplay', subject: 'math', title: L('Number Play', 'సంఖ్యలతో ఆట'), source: src('gp6', 3, 'Number Play'),
  objectives: [{
    id: 'c6.num.play', title: L('Place value, estimation and number puzzles', 'స్థాన విలువ, అంచనా మరియు సంఖ్యా పజిల్స్'), prereqs: [],
    activities: ['game:logic', 'game:numberline'],
    intro: [
      p('Numbers can tell stories. Palindromes read the same forwards and backwards (e.g. 12321).', 'సంఖ్యలు కథలు చెప్పగలవు. ముందు నుండి, వెనుక నుండి ఒకేలా చదివే సంఖ్యలు పాలిండ్రోమ్‌లు (ఉదా. 12321).'),
      p('The Kaprekar routine: take a 4-digit number, arrange its digits largest-to-smallest and smallest-to-largest, subtract. Repeat — you always reach 6174!', 'కాప్రేకర్ పద్ధతి: 4-అంకెల సంఖ్యను తీసుకొని, అంకెలను పెద్ద నుండి చిన్నకు, చిన్న నుండి పెద్దకు అమర్చి తీసివేయండి. మళ్ళీ చేస్తే ఎప్పుడూ 6174 వస్తుంది!'),
      tip('Estimation: round numbers to the nearest 10, 100 or 1000 to check whether an answer is sensible.', 'అంచనా: జవాబు సరైనదో కాదో చూడటానికి సంఖ్యలను సమీప 10, 100 లేదా 1000 కు సవరించండి.'),
    ],
    examples: [
      ex(L('Round 4,738 to the nearest hundred.', '4,738 ని సమీప వందకు సవరించండి.'), [L('The tens digit is 3, which is less than 5', 'పదుల స్థానంలో అంకె 3, ఇది 5 కంటే తక్కువ'), L('Round down', 'కిందికి సవరించండి')], S('4,700')),
      ex(L('Apply one Kaprekar step to 3524.', '3524 పై ఒక కాప్రేకర్ దశను చేయండి.'), [L('Largest arrangement: 5432', 'అతి పెద్ద అమరిక: 5432'), L('Smallest: 2345', 'అతి చిన్నది: 2345'), S('5432 − 2345 = 3087')], S('3087')),
    ],
    practice: [
      tp('round', (r) => {
        const n = r.int(1001, 98999);
        const to = r.pick([10, 100, 1000]);
        const ans = Math.round(n / to) * to;
        const lo = Math.floor(n / to) * to, hi = Math.ceil(n / to) * to;
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`Round ${n.toLocaleString('en-IN')} to the nearest ${to}.`, `${n.toLocaleString('en-IN')} ని సమీప ${to} కు సవరించండి.`), answer: num(ans),
          hints: [L(`Look at the digit just to the right of the ${to}s place.`, `${to} ల స్థానానికి కుడివైపు ఉన్న అంకెను చూడండి.`), L('5 or more → round up; less than 5 → round down.', '5 లేదా ఎక్కువ → పైకి; 5 కంటే తక్కువ → కిందికి.')],
          mistakes: [{ when: String(lo === ans ? hi : lo), explain: L('Check the deciding digit again — that rounds the wrong way.', 'నిర్ణయించే అంకెను మళ్ళీ చూడండి — అది తప్పు వైపుకు సవరించింది.') }],
          solution: [L(`${n} lies between ${lo} and ${hi}`, `${n}, ${lo} మరియు ${hi} మధ్య ఉంది`), L(`Nearest is ${ans}`, `సమీపమైనది ${ans}`)],
        };
      }),
      tp('kaprekar', (r) => {
        let d = [r.int(1, 9), r.int(0, 9), r.int(0, 9), r.int(0, 9)];
        if (new Set(d).size < 2) d = [d[0], (d[0] + 3) % 10, d[2], d[3]];
        const n = +d.join('');
        const big = +[...d].sort((a, b) => b - a).join(''), small = +[...d].sort((a, b) => a - b).join('');
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`Do one Kaprekar step on ${n}: (largest arrangement of its digits) − (smallest arrangement).`, `${n} పై ఒక కాప్రేకర్ దశ చేయండి: (అంకెల అతి పెద్ద అమరిక) − (అతి చిన్న అమరిక).`), answer: num(big - small),
          steps: [{ prompt: L('Largest arrangement', 'అతి పెద్ద అమరిక'), answer: num(big) }, { prompt: L('Smallest arrangement (leading zeros allowed)', 'అతి చిన్న అమరిక (ముందు సున్నాలు ఉండవచ్చు)'), answer: num(small) }, { prompt: L('Difference', 'భేదం'), answer: num(big - small) }],
          hints: [L('Sort the digits from largest to smallest.', 'అంకెలను పెద్ద నుండి చిన్నకు అమర్చండి.'), L('Then smallest to largest, and subtract.', 'తరువాత చిన్న నుండి పెద్దకు అమర్చి తీసివేయండి.')],
          solution: [S(`${String(big).padStart(4, '0')} − ${String(small).padStart(4, '0')} = ${big - small}`)],
        };
      }, 2),
      tp('palindrome', (r) => {
        const make = (pal: boolean) => { const a = r.int(1, 9), b = r.int(0, 9), c = r.int(0, 9); return pal ? `${a}${b}${c}${b}${a}` : `${a}${b}${c}${(b + 1) % 10}${a}`; };
        const items = [true, false, true, false, r.next() < 0.5].map((ok) => ({ label: make(ok), ok }));
        const uniq = items.filter((x, i) => items.findIndex((y) => y.label === x.label) === i);
        const pals = uniq.filter((x) => x.ok).map((x) => x.label).join(', ');
        return {
          type: 'tap', prompt: L('Tap every palindrome (reads the same forwards and backwards).', 'ప్రతి పాలిండ్రోమ్‌ను (ముందు నుండి, వెనుక నుండి ఒకేలా చదివేది) నొక్కండి.'), ...tapAll(r, uniq),
          hints: [L('Compare the first and last digits, then the second and second-last.', 'మొదటి, చివరి అంకెలను, తరువాత రెండవ, చివరి నుండి రెండవ అంకెలను పోల్చండి.')],
          solution: [L(`Palindromes: ${pals}`, `పాలిండ్రోమ్‌లు: ${pals}`)],
        };
      }),
    ],
  }],
};

const FOODS: [string, string][] = [['Idli', 'ఇడ్లీ'], ['Dosa', 'దోశ'], ['Poha', 'అటుకులు'], ['Upma', 'ఉప్మా'], ['Paratha', 'పరాఠా'], ['Pongal', 'పొంగల్']];
const data: USpec = {
  id: 'c6.u.data', subject: 'math', title: L('Data Handling and Presentation', 'దత్తాంశ నిర్వహణ మరియు ప్రదర్శన'), source: src('gp6', 4, 'Data Handling and Presentation'),
  objectives: [{
    id: 'c6.data.read', title: L('Tally marks, pictographs and bar graphs', 'గణన చిహ్నాలు, చిత్రరేఖాచిత్రాలు మరియు కమ్మీ రేఖాచిత్రాలు'), prereqs: [],
    intro: [
      p('Data is information collected to answer a question. We organise it with tally marks (a bundle of 5) and present it as pictographs or bar graphs.', 'ఒక ప్రశ్నకు జవాబు కోసం సేకరించిన సమాచారమే దత్తాంశం. దానిని గణన చిహ్నాలతో (5 కట్ట) వ్యవస్థీకరించి, చిత్రరేఖాచిత్రం లేదా కమ్మీ రేఖాచిత్రంగా చూపిస్తాం.'),
      p('In a bar graph, each bar\'s height shows the value. Always read the scale on the axis.', 'కమ్మీ రేఖాచిత్రంలో ప్రతి కమ్మీ ఎత్తు విలువను చూపుతుంది. అక్షంపై స్కేలును ఎప్పుడూ చదవండి.'),
      vis({ kind: 'bar-graph', labels: ['Idli', 'Dosa', 'Poha', 'Upma'], values: [12, 9, 5, 4], unit: 'students' }, 'Bar graph of favourite breakfasts', 'ఇష్టమైన అల్పాహారాల కమ్మీ రేఖాచిత్రం'),
    ],
    examples: [
      ex(L('In the breakfast graph, how many more students chose idli than upma?', 'అల్పాహార రేఖాచిత్రంలో ఉప్మా కంటే ఇడ్లీని ఎంత మంది ఎక్కువ ఎంచుకున్నారు?'), [L('Idli = 12, Upma = 4', 'ఇడ్లీ = 12, ఉప్మా = 4'), S('12 − 4 = 8')], L('8 more', '8 మంది ఎక్కువ')),
      ex(L('A pictograph uses 🍎 = 5 apples. A row has 6 symbols. How many apples?', 'చిత్రరేఖాచిత్రంలో 🍎 = 5 ఆపిల్స్. ఒక వరుసలో 6 చిహ్నాలు. ఎన్ని ఆపిల్స్?'), [L('Each symbol = 5 apples', 'ప్రతి చిహ్నం = 5 ఆపిల్స్'), S('6 × 5 = 30')], L('30 apples', '30 ఆపిల్స్'), { kind: 'objects', emoji: '🍎', count: 6 }),
    ],
    practice: [
      tp('bar', (r) => {
        const fs = r.shuffle(FOODS).slice(0, 4);
        const vals = fs.map(() => r.int(2, 15));
        const i = r.int(0, 3); let j = r.int(0, 3); if (j === i) j = (i + 1) % 4;
        const ask = r.pick(['diff', 'total', 'value'] as const);
        const ans = ask === 'diff' ? Math.abs(vals[i] - vals[j]) : ask === 'total' ? vals.reduce((a, b) => a + b, 0) : vals[i];
        const q: [string, string] = ask === 'diff' ? [`What is the difference between the number of students choosing ${fs[i][0]} and ${fs[j][0]}?`, `${fs[i][1]} మరియు ${fs[j][1]} ఎంచుకున్న విద్యార్థుల సంఖ్యల భేదం ఎంత?`]
          : ask === 'total' ? ['How many students were surveyed in total?', 'మొత్తం ఎంత మంది విద్యార్థులను సర్వే చేశారు?'] : [`How many students chose ${fs[i][0]}?`, `${fs[i][1]} ని ఎంత మంది ఎంచుకున్నారు?`];
        return {
          type: 'graph', keypad: 'numeric', prompt: L(`The bar graph shows favourite breakfasts in a class. ${q[0]}`, `కమ్మీ రేఖాచిత్రం ఒక తరగతిలో ఇష్టమైన అల్పాహారాలను చూపుతుంది. ${q[1]}`), visual: { kind: 'bar-graph', labels: fs.map((x) => x[0]), values: vals, unit: 'students' }, answer: num(ans),
          hints: [L('Read the height of each bar against the scale.', 'స్కేలుతో ప్రతి కమ్మీ ఎత్తును చదవండి.'), ask === 'total' ? L('Add all the bars.', 'అన్ని కమ్మీలను కలపండి.') : L('Subtract the smaller from the larger.', 'పెద్ద దాని నుండి చిన్నదాన్ని తీసివేయండి.')],
          solution: [L(fs.map((fd, k) => `${fd[0]}: ${vals[k]}`).join(', '), fs.map((fd, k) => `${fd[1]}: ${vals[k]}`).join(', ')), L(`Answer: ${ans}`, `జవాబు: ${ans}`)],
        };
      }),
      tp('tally', (r) => {
        const n = r.int(3, 23);
        const tally = ('𝍸 '.repeat(Math.floor(n / 5)) + '|'.repeat(n % 5)).trim();
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`How many does this tally show?  ${tally}   (𝍸 = a bundle of 5)`, `ఈ గణన చిహ్నాలు ఎంత చూపుతున్నాయి?  ${tally}   (𝍸 = 5 కట్ట)`), answer: num(n),
          hints: [L('Each bundle counts 5.', 'ప్రతి కట్ట 5.'), L('Count the bundles, multiply by 5, then add the single strokes.', 'కట్టలను లెక్కించి 5 తో గుణించి, ఒంటరి గీతలను కలపండి.')],
          solution: [L(`${Math.floor(n / 5)} bundles × 5 = ${Math.floor(n / 5) * 5}`, `${Math.floor(n / 5)} కట్టలు × 5 = ${Math.floor(n / 5) * 5}`), S(`+ ${n % 5} = ${n}`)],
        };
      }),
      tp('picto', (r) => {
        const scale = r.pick([2, 5, 10]), k = r.int(2, 8);
        const t = r.pick(THINGS);
        return {
          type: 'count', keypad: 'numeric', prompt: L(`In a pictograph each ${t.emoji} stands for ${scale} ${t.en}. How many ${t.en} do these symbols show?`, `చిత్రరేఖాచిత్రంలో ప్రతి ${t.emoji} ${scale} ${t.te} ను సూచిస్తుంది. ఈ చిహ్నాలు ఎన్ని ${t.te} ను చూపుతున్నాయి?`), visual: { kind: 'objects', emoji: t.emoji, count: k }, answer: num(k * scale),
          hints: [L('Count the symbols.', 'చిహ్నాలను లెక్కించండి.'), L(`Multiply by ${scale}.`, `${scale} తో గుణించండి.`)],
          mistakes: [{ when: String(k), explain: L(`You counted the symbols. Each symbol stands for ${scale}, so multiply.`, `మీరు చిహ్నాలను లెక్కించారు. ప్రతి చిహ్నం ${scale} కాబట్టి గుణించండి.`) }],
          solution: [L(`${k} symbols × ${scale} = ${k * scale}`, `${k} చిహ్నాలు × ${scale} = ${k * scale}`)],
        };
      }),
    ],
  }],
};

const PRIME = L('Prime', 'ప్రధాన సంఖ్య'), COMPOSITE = L('Composite', 'సంయుక్త సంఖ్య');
const primeTime: USpec = {
  id: 'c6.u.prime', subject: 'math', title: L('Prime Time', 'ప్రధాన సంఖ్యల సమయం'), source: src('gp6', 5, 'Prime Time'),
  objectives: [{
    id: 'c6.prime.factors', title: L('Primes, factors, multiples and co-primes', 'ప్రధాన సంఖ్యలు, కారణాంకాలు, గుణిజాలు మరియు పరస్పర ప్రధానాలు'), prereqs: [],
    activities: ['game:logic'],
    intro: [
      p('A prime number has exactly two factors: 1 and itself (2, 3, 5, 7, 11, …). A composite number has more than two factors. 1 is neither.', 'ప్రధాన సంఖ్యకు సరిగ్గా రెండు కారణాంకాలు: 1 మరియు అదే సంఖ్య (2, 3, 5, 7, 11, …). సంయుక్త సంఖ్యకు రెండు కంటే ఎక్కువ కారణాంకాలు. 1 ఏదీ కాదు.'),
      p('Two numbers are co-prime if their only common factor is 1.', 'రెండు సంఖ్యల ఉమ్మడి కారణాంకం 1 మాత్రమే అయితే అవి పరస్పర ప్రధాన సంఖ్యలు.'),
      tip('Divisibility tests: by 2 (last digit even), by 3 (digit sum divisible by 3), by 5 (ends in 0 or 5), by 10 (ends in 0).', 'భాజ్యతా సూత్రాలు: 2 (చివరి అంకె సరి), 3 (అంకెల మొత్తం 3 తో భాగించబడుతుంది), 5 (0 లేదా 5 తో ముగుస్తుంది), 10 (0 తో ముగుస్తుంది).'),
    ],
    examples: [
      ex(L('Prime factorise 84.', '84 ను ప్రధాన కారణాంకాలుగా విభజించండి.'), [S('84 = 2 × 42 = 2 × 2 × 21'), S('= 2 × 2 × 3 × 7')], S('2 × 2 × 3 × 7')),
      ex(L('Two frogs jump 3 and 4 steps at a time from 0. Where do they first land together?', 'రెండు కప్పలు 0 నుండి 3 మరియు 4 అడుగుల చొప్పున దూకుతాయి. మొదటిసారి ఎక్కడ కలుస్తాయి?'), [L('Multiples of 3: 3, 6, 9, 12…', '3 గుణిజాలు: 3, 6, 9, 12…'), L('Multiples of 4: 4, 8, 12…', '4 గుణిజాలు: 4, 8, 12…'), L('First common multiple: 12', 'మొదటి ఉమ్మడి గుణిజం: 12')], L('Step 12', '12వ అడుగు')),
    ],
    practice: [
      tp('isprime', (r) => {
        const n = r.int(11, 99);
        const ok = isPrime(n);
        const c = choose(r, ok ? PRIME : COMPOSITE, [ok ? COMPOSITE : PRIME]);
        let fac = 2; while (!ok && n % fac !== 0) fac++;
        return {
          type: 'mcq', prompt: L(`Is ${n} prime or composite?`, `${n} ప్రధాన సంఖ్యా లేక సంయుక్త సంఖ్యా?`), ...c,
          hints: [L('Try dividing by 2, 3, 5 and 7.', '2, 3, 5, 7 తో భాగించి చూడండి.'), L('If none divides it exactly (and n < 121), it is prime.', 'ఏదీ సరిగ్గా భాగించకపోతే (n < 121), అది ప్రధాన సంఖ్య.')],
          solution: [ok ? L(`${n} has only the factors 1 and ${n}: prime.`, `${n} కి 1, ${n} మాత్రమే కారణాంకాలు: ప్రధాన సంఖ్య.`) : L(`${n} = ${fac} × ${n / fac}: composite.`, `${n} = ${fac} × ${n / fac}: సంయుక్త సంఖ్య.`)],
        };
      }),
      tp('common', (r) => {
        const a = r.pick([2, 3, 4, 5, 6, 8]), b = r.pick([3, 4, 5, 6, 7, 9, 10]);
        const A = a === b ? a + 1 : a;
        const Lc = lcm(A, b);
        const nm = r.pick(NAMES);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`${nm.en}'s two frogs start at 0 and jump ${A} and ${b} steps at a time. At which step do they first land on the same number?`, `${nm.te} యొక్క రెండు కప్పలు 0 నుండి ${A} మరియు ${b} అడుగుల చొప్పున దూకుతాయి. మొదటిసారి ఏ అడుగు వద్ద కలుస్తాయి?`), answer: num(Lc),
          hints: [L(`List multiples of ${A} and of ${b}.`, `${A} మరియు ${b} గుణిజాలను రాయండి.`), L('Find the first one in both lists.', 'రెండు జాబితాలలో ఉన్న మొదటిదాన్ని కనుగొనండి (క.సా.గు).')],
          mistakes: [{ when: String(A * b), explain: L(`${A * b} is a common multiple, but is there a smaller one?`, `${A * b} ఉమ్మడి గుణిజమే, కానీ ఇంకా చిన్నది ఉందా?`) }],
          solution: [L(`Multiples of ${A}: ${[1, 2, 3, 4, 5].map((k) => k * A).join(', ')}…`, `${A} గుణిజాలు: ${[1, 2, 3, 4, 5].map((k) => k * A).join(', ')}…`), L(`Multiples of ${b}: ${[1, 2, 3, 4].map((k) => k * b).join(', ')}…`, `${b} గుణిజాలు: ${[1, 2, 3, 4].map((k) => k * b).join(', ')}…`), L(`First common: ${Lc}`, `మొదటి ఉమ్మడి గుణిజం: ${Lc}`)],
        };
      }, 2),
      tp('coprime', (r) => {
        const pairs: [number, number][] = [[8, 15], [9, 16], [12, 18], [14, 21], [25, 36], [10, 21], [6, 35], [15, 20], [7, 49], [11, 22], [13, 27], [16, 24]];
        const [a, b] = r.pick(pairs);
        const ok = gcd(a, b) === 1;
        const Y = L('Yes, co-prime', 'అవును, పరస్పర ప్రధానాలు'), N = L('No, not co-prime', 'కాదు, పరస్పర ప్రధానాలు కావు');
        return {
          type: 'mcq', prompt: L(`Are ${a} and ${b} co-prime?`, `${a} మరియు ${b} పరస్పర ప్రధాన సంఖ్యలా?`), ...choose(r, ok ? Y : N, [ok ? N : Y]),
          hints: [L('List the factors of each number.', 'ప్రతి సంఖ్య కారణాంకాలను రాయండి.'), L('Co-prime means the only common factor is 1.', 'పరస్పర ప్రధానం అంటే ఉమ్మడి కారణాంకం 1 మాత్రమే.')],
          solution: [ok ? L(`${a} and ${b} share only the factor 1.`, `${a}, ${b} లకు ఉమ్మడి కారణాంకం 1 మాత్రమే.`) : L(`${a} and ${b} share the factor ${gcd(a, b)}.`, `${a}, ${b} లకు ఉమ్మడి కారణాంకం ${gcd(a, b)}.`)],
        };
      }),
    ],
  }],
};

const perim: USpec = {
  id: 'c6.u.perimeter', subject: 'math', title: L('Perimeter and Area', 'చుట్టుకొలత మరియు వైశాల్యం'), source: src('gp6', 6, 'Perimeter and Area'),
  objectives: [{
    id: 'c6.mens.rect', title: L('Perimeter and area of rectangles and squares', 'దీర్ఘచతురస్రాలు మరియు చతురస్రాల చుట్టుకొలత, వైశాల్యం'), prereqs: [],
    activities: ['game:shapes'],
    intro: [
      p('Perimeter is the distance around a shape (a length: cm, m). Area is the amount of surface it covers (square units: cm², m²).', 'చుట్టుకొలత అంటే ఆకారం చుట్టూ దూరం (పొడవు: cm, m). వైశాల్యం అంటే అది ఆక్రమించే ఉపరితలం (చదరపు ప్రమాణాలు: cm², m²).'),
      f('Rectangle: P = 2(l + b), A = l × b'),
      f('Square: P = 4s, A = s × s'),
      vis({ kind: 'grid-shape', cols: 6, rows: 4, cells: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2]] }, 'A 4 by 3 rectangle on a grid covers 12 squares', 'గ్రిడ్‌పై 4 × 3 దీర్ఘచతురస్రం 12 చతురస్రాలను ఆక్రమిస్తుంది'),
    ],
    examples: [
      ex(L('A rectangular park is 40 m long and 25 m wide. How much fencing?', 'దీర్ఘచతురస్రాకార పార్కు పొడవు 40 m, వెడల్పు 25 m. ఎంత కంచె కావాలి?'), [S('P = 2(40 + 25)'), S('= 130 m')], S('130 m')),
      ex(L('Tiles of 1 m² cover a 6 m × 4 m floor. How many tiles?', '6 m × 4 m నేలపై 1 m² టైల్స్ పరిస్తే ఎన్ని టైల్స్?'), [S('A = 6 × 4 = 24 m²'), L('24 tiles', '24 టైల్స్')], L('24 tiles', '24 టైల్స్')),
    ],
    practice: [
      tp('rect', (r) => {
        const l = r.int(4, 30), b = r.int(2, 20);
        const area = r.next() < 0.5;
        const ans = area ? l * b : 2 * (l + b);
        const city = r.pick(CITIES);
        return {
          type: 'typed', keypad: 'units', unitHint: area ? 'm²' : 'm',
          prompt: L(`A rectangular garden in ${city} is ${l} m long and ${b} m wide. Find its ${area ? 'area' : 'perimeter'}.`, `${city} లో ఒక దీర్ఘచతురస్రాకార తోట పొడవు ${l} m, వెడల్పు ${b} m. దాని ${area ? 'వైశాల్యం' : 'చుట్టుకొలత'} కనుగొనండి.`),
          answer: num(ans, area ? 'm^2' : 'm', true),
          hints: [area ? L('Area = length × breadth', 'వైశాల్యం = పొడవు × వెడల్పు') : L('Perimeter = 2 × (length + breadth)', 'చుట్టుకొలత = 2 × (పొడవు + వెడల్పు)'), area ? L('Area is in square metres (m²).', 'వైశాల్యం చదరపు మీటర్లలో (m²).') : L('Perimeter is a length, in m.', 'చుట్టుకొలత ఒక పొడవు, m లో.')],
          mistakes: [
            { when: String(area ? 2 * (l + b) : l * b), explain: area ? L('That is the perimeter (distance around). Area = l × b.', 'అది చుట్టుకొలత. వైశాల్యం = l × b.') : L('That is the area. Perimeter adds all four sides.', 'అది వైశాల్యం. చుట్టుకొలత నాలుగు భుజాల మొత్తం.') },
            { when: 'missing-unit', explain: L('Add the unit — m for perimeter, m² for area.', 'ప్రమాణం రాయండి — చుట్టుకొలతకు m, వైశాల్యానికి m².') },
            { when: 'wrong-unit', explain: area ? L('Area is measured in square units such as m².', 'వైశాల్యాన్ని m² వంటి చదరపు ప్రమాణాలలో కొలుస్తాం.') : L('Perimeter is a length — use m.', 'చుట్టుకొలత ఒక పొడవు — m వాడండి.') },
          ],
          solution: [S(area ? `A = ${l} × ${b} = ${ans} m²` : `P = 2 × (${l} + ${b}) = ${ans} m`)],
        };
      }),
      tp('missing', (r) => {
        const l = r.int(5, 25), b = r.int(2, 15);
        const P = 2 * (l + b);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`A rectangle has perimeter ${P} cm and length ${l} cm. Find its breadth (in cm).`, `ఒక దీర్ఘచతురస్రం చుట్టుకొలత ${P} cm, పొడవు ${l} cm. దాని వెడల్పు (cm లో) కనుగొనండి.`), answer: num(b),
          steps: [{ prompt: L('Half the perimeter (l + b)', 'చుట్టుకొలతలో సగం (l + b)'), answer: num(l + b) }, { prompt: L('Breadth', 'వెడల్పు'), answer: num(b) }],
          hints: [L('Half the perimeter is length + breadth.', 'చుట్టుకొలతలో సగం = పొడవు + వెడల్పు.'), S(`${P} ÷ 2 = ${l + b}`)],
          mistakes: [{ when: String(P - l), explain: L('The perimeter has TWO lengths. Halve it first, then subtract the length.', 'చుట్టుకొలతలో రెండు పొడవులు ఉంటాయి. ముందు సగం చేసి, తరువాత పొడవు తీసివేయండి.') }],
          solution: [S(`l + b = ${P} ÷ 2 = ${l + b}`), S(`b = ${l + b} − ${l} = ${b} cm`)],
        };
      }, 2),
      tp('grid', (r) => {
        const cols = r.int(2, 6), rows = r.int(2, 5);
        const cells: [number, number][] = [];
        for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) cells.push([x, y]);
        return {
          type: 'count', keypad: 'numeric', prompt: L(`Each small square is 1 cm². What is the area of the shaded rectangle (${cols} squares by ${rows} squares)?`, `ప్రతి చిన్న చతురస్రం 1 cm². నీడ ఉన్న దీర్ఘచతురస్రం (${cols} × ${rows} చతురస్రాలు) వైశాల్యం ఎంత?`),
          visual: { kind: 'grid-shape', cells, cols: 7, rows: 6 }, answer: num(cols * rows),
          hints: [L('Count the squares in one row.', 'ఒక వరుసలోని చతురస్రాలను లెక్కించండి.'), L('Multiply by the number of rows.', 'వరుసల సంఖ్యతో గుణించండి.')],
          solution: [S(`${cols} × ${rows} = ${cols * rows} cm²`)],
        };
      }),
    ],
  }],
};

const fractions: USpec = {
  id: 'c6.u.fractions', subject: 'math', title: L('Fractions', 'భిన్నాలు'), source: src('gp6', 7, 'Fractions'),
  objectives: [{
    id: 'c6.frac.equiv-add', title: L('Equivalent fractions, comparing and adding', 'సమాన భిన్నాలు, పోల్చడం మరియు కూడటం'), prereqs: [],
    activities: ['game:fractions'],
    intro: [
      p('A fraction shows equal parts of a whole. Equivalent fractions name the same amount: 1/2 = 2/4 = 3/6.', 'భిన్నం ఒక పూర్ణంలోని సమాన భాగాలను చూపుతుంది. సమాన భిన్నాలు ఒకే పరిమాణాన్ని సూచిస్తాయి: 1/2 = 2/4 = 3/6.'),
      p('To add or compare fractions with different denominators, first rewrite them with a common denominator (use the LCM).', 'వేర్వేరు హారాలు ఉన్న భిన్నాలను కూడటానికి లేదా పోల్చడానికి, ముందు ఉమ్మడి హారంతో (క.సా.గు వాడి) రాయండి.'),
      vis({ kind: 'fraction-bar', parts: 6, shaded: 3, label: '3/6 = 1/2' }, 'A bar with 3 of 6 parts shaded equals one half', '6 భాగాలలో 3 నీడ ఉన్న పట్టీ సగానికి సమానం'),
      tip('Never add denominators! 1/2 + 1/3 is not 2/5 — the pieces are different sizes.', 'హారాలను ఎప్పుడూ కలపవద్దు! 1/2 + 1/3 అంటే 2/5 కాదు — ముక్కల పరిమాణాలు వేరు.'),
    ],
    examples: [
      ex(S('1/4 + 2/3 = ?'), [L('LCM of 4 and 3 is 12', '4 మరియు 3 ల క.సా.గు 12'), S('1/4 = 3/12, 2/3 = 8/12'), S('3/12 + 8/12 = 11/12')], S('11/12')),
      ex(L('Which is bigger, 3/5 or 4/7?', '3/5, 4/7 లలో ఏది పెద్దది?'), [S('3/5 = 21/35, 4/7 = 20/35'), S('21/35 > 20/35')], S('3/5')),
    ],
    practice: [
      tp('add', (r) => {
        const b = r.pick([2, 3, 4, 5, 6, 8]), d = r.pick([3, 4, 5, 6, 10, 12]);
        const a = r.int(1, b - 1), c = r.int(1, d - 1);
        const [n, m] = [a * d + c * b, b * d];
        const Lm = lcm(b, d);
        return {
          type: 'typed', keypad: 'fraction', prompt: L(`Add: ${a}/${b} + ${c}/${d}`, `కూడండి: ${a}/${b} + ${c}/${d}`), answer: frac(n, m),
          hints: [L(`Find a common denominator — the LCM of ${b} and ${d} is ${Lm}.`, `ఉమ్మడి హారం కనుగొనండి — ${b}, ${d} ల క.సా.గు ${Lm}.`), L('Rewrite each fraction, then add the numerators.', 'ప్రతి భిన్నాన్ని మళ్ళీ రాసి, లవాలను కలపండి.')],
          mistakes: [{ when: `${a + c}/${b + d}`, explain: L('Adding the denominators changes the size of the pieces. Make the pieces the same size first (common denominator), then add the numerators.', 'హారాలను కలిపితే ముక్కల పరిమాణం మారుతుంది. ముందు ముక్కలను ఒకే పరిమాణం (ఉమ్మడి హారం) చేసి, లవాలను కలపండి.') }],
          solution: [S(`${a}/${b} = ${(a * Lm) / b}/${Lm}, ${c}/${d} = ${(c * Lm) / d}/${Lm}`), L(`Sum = ${fr(n, m)}`, `మొత్తం = ${fr(n, m)}`)],
        };
      }, 2),
      tp('equiv', (r) => {
        const d = r.pick([2, 3, 4, 5, 6]), n = r.int(1, d - 1), k = r.int(2, 6);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`Fill in the missing number: ${n}/${d} = ?/${d * k}`, `ఖాళీ సంఖ్యను పూరించండి: ${n}/${d} = ?/${d * k}`), visual: { kind: 'fraction-bar', parts: d, shaded: n }, answer: num(n * k),
          hints: [L(`${d} was multiplied by ${k} to get ${d * k}.`, `${d * k} రావడానికి ${d} ని ${k} తో గుణించారు.`), L('Do the same to the numerator.', 'లవానికి కూడా అలాగే చేయండి.')],
          mistakes: [{ when: String(n + d * k - d), explain: L('Equivalent fractions multiply (not add) the top and bottom by the same number.', 'సమాన భిన్నాలలో లవం, హారం రెండింటినీ ఒకే సంఖ్యతో గుణిస్తాం (కలపం).') }],
          solution: [S(`${n} × ${k} = ${n * k}`), S(`${n}/${d} = ${n * k}/${d * k}`)],
        };
      }),
      tp('compare', (r) => {
        const pairs: [number, number, number, number][] = [[3, 5, 4, 7], [2, 3, 3, 4], [5, 8, 3, 5], [1, 2, 3, 7], [4, 9, 1, 2], [5, 6, 7, 9], [2, 5, 3, 8], [7, 10, 2, 3]];
        const [a, b, c, d] = r.pick(pairs);
        const big = a * d > c * b ? `${a}/${b}` : `${c}/${d}`;
        const ch = choose(r, big, [`${a}/${b}`, `${c}/${d}`].filter((x) => x !== big).map((x) => L(x, x)).concat([L('They are equal', 'రెండూ సమానం')]));
        return {
          type: 'mcq', prompt: L(`Which is greater: ${a}/${b} or ${c}/${d}?`, `ఏది పెద్దది: ${a}/${b} లేదా ${c}/${d}?`), ...ch,
          hints: [L('Cross-multiply or use a common denominator.', 'అడ్డంగా గుణించండి లేదా ఉమ్మడి హారం వాడండి.'), S(`${a} × ${d} vs ${c} × ${b}`)],
          solution: [S(`${a}/${b} = ${a * d}/${b * d}, ${c}/${d} = ${c * b}/${b * d}`), L(`${big} is greater`, `${big} పెద్దది`)],
        };
      }),
      tp('line', (r) => {
        const d = r.pick([2, 4, 5, 8, 10]), n = r.int(1, d - 1);
        return {
          type: 'number-line', prompt: L(`Place ${n}/${d} on the number line from 0 to 1. (Enter its value.)`, `0 నుండి 1 వరకు సంఖ్యారేఖపై ${n}/${d} ను గుర్తించండి. (దాని విలువ రాయండి.)`), line: { from: 0, to: 1, step: 1 / d }, answer: frac(n, d),
          hints: [L(`The line is split into ${d} equal parts.`, `రేఖ ${d} సమాన భాగాలుగా విభజించబడింది.`), L(`Count ${n} parts from 0.`, `0 నుండి ${n} భాగాలు లెక్కించండి.`)],
          solution: [L(`${n}/${d} is ${n} steps of 1/${d} from 0.`, `${n}/${d} అంటే 0 నుండి 1/${d} చొప్పున ${n} అడుగులు.`)],
        };
      }),
    ],
  }],
};

const constructions: USpec = {
  id: 'c6.u.constructions', subject: 'math', title: L('Playing with Constructions', 'నిర్మాణాలతో ఆట'), source: src('gp6', 8, 'Playing with Constructions'),
  objectives: [{
    id: 'c6.cons.compass', title: L('Constructing with ruler and compass', 'స్కేలు మరియు వృత్తలేఖినితో నిర్మాణాలు'), prereqs: ['c6.ang.measure'],
    activities: ['art:trace'],
    intro: [
      p('A compass draws circles and arcs: every point on a circle is the same distance (the radius) from the centre.', 'వృత్తలేఖిని వృత్తాలు, చాపాలు గీస్తుంది: వృత్తంపై ప్రతి బిందువు కేంద్రం నుండి ఒకే దూరంలో (వ్యాసార్ధం) ఉంటుంది.'),
      p('Rectangles and squares can be built with a ruler and a set-square: opposite sides equal, all angles 90°. In a square, the diagonals are equal and cut each other at 90°.', 'స్కేలు, సెట్-స్క్వేర్‌తో దీర్ఘచతురస్రాలు, చతురస్రాలు నిర్మించవచ్చు: ఎదురెదురు భుజాలు సమానం, అన్ని కోణాలు 90°. చతురస్రంలో కర్ణాలు సమానం, 90° వద్ద ఖండించుకుంటాయి.'),
      stepsB(L('Draw side AB with a ruler.', 'స్కేలుతో AB భుజం గీయండి.'), L('At A and B draw perpendiculars.', 'A, B ల వద్ద లంబాలు గీయండి.'), L('Mark the breadth on both perpendiculars.', 'రెండు లంబాలపై వెడల్పును గుర్తించండి.'), L('Join the top points.', 'పై బిందువులను కలపండి.')),
    ],
    examples: [
      ex(L('A circle has radius 4 cm. How far apart should the compass points be? How wide is the circle?', 'వృత్త వ్యాసార్ధం 4 cm. వృత్తలేఖిని ఎంత తెరవాలి? వృత్తం వెడల్పు ఎంత?'), [L('Compass opening = radius = 4 cm', 'వృత్తలేఖిని తెరవడం = వ్యాసార్ధం = 4 cm'), L('Diameter = 2 × 4 = 8 cm', 'వ్యాసం = 2 × 4 = 8 cm')], L('4 cm; 8 cm across', '4 cm; వ్యాసం 8 cm')),
      ex(L('Order the steps to draw a rectangle 6 cm × 4 cm.', '6 cm × 4 cm దీర్ఘచతురస్రం గీయడానికి దశలను క్రమంలో పెట్టండి.'), [L('Draw AB = 6 cm', 'AB = 6 cm గీయండి'), L('Draw 90° at A and B', 'A, B వద్ద 90° గీయండి'), L('Mark 4 cm on each', 'ప్రతిదానిపై 4 cm గుర్తించండి'), L('Join C and D', 'C, D లను కలపండి')], L('Rectangle ABCD', 'దీర్ఘచతురస్రం ABCD')),
    ],
    practice: [
      tp('diameter', (r) => {
        const rad = r.pick([2, 2.5, 3, 3.5, 4, 5, 6, 7]);
        const dia = r.next() < 0.5;
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm',
          prompt: dia ? L(`A circle is drawn with a compass opened to ${rad} cm. What is its diameter?`, `వృత్తలేఖినిని ${rad} cm తెరిచి వృత్తం గీశారు. దాని వ్యాసం ఎంత?`) : L(`A circle has diameter ${rad * 2} cm. How wide should the compass be opened?`, `వృత్త వ్యాసం ${rad * 2} cm. వృత్తలేఖినిని ఎంత తెరవాలి?`),
          answer: num(dia ? rad * 2 : rad, 'cm'),
          hints: [L('The compass opening is the radius.', 'వృత్తలేఖిని తెరవడమే వ్యాసార్ధం.'), L('Diameter = 2 × radius.', 'వ్యాసం = 2 × వ్యాసార్ధం.')],
          solution: [S(dia ? `d = 2 × ${rad} = ${rad * 2} cm` : `r = ${rad * 2} ÷ 2 = ${rad} cm`)],
        };
      }),
      tp('order', (r) => {
        const [l, b] = [r.int(4, 9), r.int(2, 6)];
        const s = [L(`Draw AB = ${l} cm with a ruler`, `స్కేలుతో AB = ${l} cm గీయండి`), L('Draw a 90° angle at A and at B', 'A మరియు B వద్ద 90° కోణం గీయండి'), L(`Mark D and C ${b} cm up each perpendicular`, `ప్రతి లంబంపై ${b} cm వద్ద D, C గుర్తించండి`), L('Join D to C', 'D ని C కి కలపండి')];
        return {
          type: 'order', prompt: L(`Put the steps in order to construct a ${l} cm × ${b} cm rectangle ABCD.`, `${l} cm × ${b} cm దీర్ఘచతురస్రం ABCD నిర్మించడానికి దశలను క్రమంలో పెట్టండి.`), ...ordering(r, s),
          hints: [L('Start with the base.', 'భూమితో ప్రారంభించండి.')], solution: s,
        };
      }),
      tp('props', (r) => {
        const all = [
          { label: L('All four sides are equal', 'నాలుగు భుజాలు సమానం'), ok: true }, { label: L('All angles are 90°', 'అన్ని కోణాలు 90°'), ok: true }, { label: L('Diagonals are equal', 'కర్ణాలు సమానం'), ok: true },
          { label: L('Diagonals cross at 90°', 'కర్ణాలు 90° వద్ద ఖండించుకుంటాయి'), ok: true }, { label: L('Only one pair of sides is parallel', 'ఒక జత భుజాలు మాత్రమే సమాంతరం'), ok: false }, { label: L('It has three sides', 'దానికి మూడు భుజాలు'), ok: false }, { label: L('Diagonals are of different lengths', 'కర్ణాల పొడవులు వేరు'), ok: false },
        ];
        const pick = r.shuffle(all).slice(0, 5);
        if (!pick.some((x) => x.ok)) pick[0] = all[0];
        const t = pick.filter((x) => x.ok);
        return {
          type: 'tap', prompt: L('Tap every property of a square.', 'చతురస్రం యొక్క ప్రతి లక్షణాన్ని నొక్కండి.'), ...tapAll(r, pick),
          hints: [L('A square is a rectangle with all sides equal.', 'అన్ని భుజాలు సమానమైన దీర్ఘచతురస్రమే చతురస్రం.')],
          solution: [L(`True: ${t.map((x) => x.label.en).join('; ')}`, `సత్యం: ${t.map((x) => x.label.te).join('; ')}`)],
        };
      }),
    ],
  }],
};

const SHAPES: [string, string, number, 'square' | 'rectangle' | 'triangle' | 'hexagon' | 'pentagon' | 'star' | 'diamond'][] = [
  ['square', 'చతురస్రం', 4, 'square'], ['rectangle (not a square)', 'దీర్ఘచతురస్రం (చతురస్రం కాదు)', 2, 'rectangle'], ['equilateral triangle', 'సమబాహు త్రిభుజం', 3, 'triangle'],
  ['regular hexagon', 'క్రమ షడ్భుజి', 6, 'hexagon'], ['regular pentagon', 'క్రమ పంచభుజి', 5, 'pentagon'], ['rhombus (not a square)', 'సమచతుర్భుజం (చతురస్రం కాదు)', 2, 'diamond'], ['five-pointed star', 'ఐదు కొనల నక్షత్రం', 5, 'star'],
];
const symmetry: USpec = {
  id: 'c6.u.symmetry', subject: 'math', title: L('Symmetry', 'సౌష్ఠవం'), source: src('gp6', 9, 'Symmetry'),
  objectives: [{
    id: 'c6.sym.lines', title: L('Lines of symmetry and rotational symmetry', 'సౌష్ఠవ రేఖలు మరియు భ్రమణ సౌష్ఠవం'), prereqs: [],
    activities: ['game:shapes', 'art:color'],
    intro: [
      p('A figure has line symmetry if folding along a line makes the two halves match exactly. Rangoli and kolam designs often have many lines of symmetry.', 'ఒక రేఖ వెంట మడిస్తే రెండు సగాలు సరిగ్గా సరిపోతే ఆ పటానికి రేఖా సౌష్ఠవం ఉంటుంది. ముగ్గులకు తరచుగా చాలా సౌష్ఠవ రేఖలు ఉంటాయి.'),
      p('A figure has rotational symmetry if it looks the same after a turn of less than 360°. The number of times it matches in one full turn is its order.', '360° కంటే తక్కువ తిప్పినా ఒకేలా కనిపిస్తే భ్రమణ సౌష్ఠవం ఉంటుంది. ఒక పూర్తి భ్రమణంలో ఎన్నిసార్లు సరిపోతుందో అదే దాని క్రమం.'),
      vis({ kind: 'shape', shape: 'hexagon' }, 'A regular hexagon has 6 lines of symmetry and rotational symmetry of order 6', 'క్రమ షడ్భుజికి 6 సౌష్ఠవ రేఖలు, 6వ క్రమ భ్రమణ సౌష్ఠవం'),
    ],
    examples: [
      ex(L('How many lines of symmetry does a square have?', 'చతురస్రానికి ఎన్ని సౌష్ఠవ రేఖలు?'), [L('2 through midpoints of opposite sides', 'ఎదురెదురు భుజాల మధ్య బిందువుల గుండా 2'), L('2 along the diagonals', 'కర్ణాల వెంట 2')], S('4')),
      ex(L('Angle of rotational symmetry of an equilateral triangle?', 'సమబాహు త్రిభుజం భ్రమణ సౌష్ఠవ కోణం?'), [L('It matches 3 times in 360°', '360° లో 3 సార్లు సరిపోతుంది'), S('360° ÷ 3 = 120°')], S('120°')),
    ],
    practice: [
      tp('lines', (r) => {
        const [en, te, n, sh] = r.pick(SHAPES);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`How many lines of symmetry does a ${en} have?`, `${te} కు ఎన్ని సౌష్ఠవ రేఖలు ఉన్నాయి?`), visual: { kind: 'shape', shape: sh }, answer: num(n),
          hints: [L('Imagine folding the shape so the halves match.', 'సగాలు సరిపోయేలా ఆకారాన్ని మడిచినట్లు ఊహించండి.'), L('For regular polygons, the number of lines equals the number of sides.', 'క్రమ బహుభుజులకు సౌష్ఠవ రేఖల సంఖ్య = భుజాల సంఖ్య.')],
          mistakes: [{ when: '4', explain: L('Diagonals are not always lines of symmetry — try folding along one.', 'కర్ణాలు ఎప్పుడూ సౌష్ఠవ రేఖలు కావు — ఒకదాని వెంట మడిచి చూడండి.') }],
          solution: [L(`A ${en} has ${n} line${n > 1 ? 's' : ''} of symmetry.`, `${te} కు ${n} సౌష్ఠవ రేఖలు.`)],
        };
      }),
      tp('rot', (r) => {
        const n = r.pick([2, 3, 4, 5, 6, 8]);
        const nm: Record<number, [string, string]> = { 2: ['a rectangle', 'దీర్ఘచతురస్రం'], 3: ['an equilateral triangle', 'సమబాహు త్రిభుజం'], 4: ['a square', 'చతురస్రం'], 5: ['a regular pentagon', 'క్రమ పంచభుజి'], 6: ['a regular hexagon', 'క్రమ షడ్భుజి'], 8: ['a regular octagon (8-petal kolam)', 'క్రమ అష్టభుజి (8 రేకుల ముగ్గు)'] };
        return {
          type: 'typed', keypad: 'units', unitHint: '°', prompt: L(`What is the smallest angle of rotational symmetry of ${nm[n][0]}?`, `${nm[n][1]} యొక్క అతి చిన్న భ్రమణ సౌష్ఠవ కోణం ఎంత?`), answer: num(360 / n, '°'),
          hints: [L('How many times does it look the same in one full turn?', 'ఒక పూర్తి భ్రమణంలో ఎన్నిసార్లు ఒకేలా కనిపిస్తుంది?'), L('Divide 360° by that number.', '360° ని ఆ సంఖ్యతో భాగించండి.')],
          solution: [L(`Order ${n}`, `క్రమం ${n}`), S(`360° ÷ ${n} = ${360 / n}°`)],
        };
      }),
      tp('letters', (r) => {
        const all = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'Y', 'Z'];
        const sym = new Set(['A', 'B', 'C', 'D', 'E', 'H', 'K', 'M', 'T', 'U', 'V', 'W', 'Y']);
        const pick = r.shuffle(all).slice(0, 5).map((x) => ({ label: x, ok: sym.has(x) }));
        if (!pick.some((x) => x.ok)) pick[0] = { label: 'A', ok: true };
        const s = pick.filter((x) => x.ok).map((x) => x.label).join(', ');
        return {
          type: 'tap', prompt: L('Tap every capital letter that has at least one line of symmetry.', 'కనీసం ఒక సౌష్ఠవ రేఖ ఉన్న ప్రతి ఆంగ్ల పెద్ద అక్షరాన్ని నొక్కండి.'), ...tapAll(r, pick),
          hints: [L('Try a vertical fold, then a horizontal fold.', 'నిలువు మడత, తరువాత అడ్డ మడత ప్రయత్నించండి.')],
          solution: [L(`Symmetric: ${s}`, `సౌష్ఠవం ఉన్నవి: ${s}`)],
        };
      }),
    ],
  }],
};

const integers: USpec = {
  id: 'c6.u.integers', subject: 'math', title: L('The Other Side of Zero', 'సున్నాకు అవతలి వైపు'), source: src('gp6', 10, 'The Other Side of Zero'),
  objectives: [{
    id: 'c6.int.add', title: L('Negative numbers: ordering, adding and subtracting', 'రుణ సంఖ్యలు: క్రమం, కూడిక మరియు తీసివేత'), prereqs: [],
    activities: ['game:numberline'],
    intro: [
      p('Integers include positive numbers, zero and negative numbers: …, −3, −2, −1, 0, 1, 2, 3, … Think of lift floors below ground, temperatures below 0 °C, or money owed.', 'పూర్ణసంఖ్యలలో ధన సంఖ్యలు, సున్నా, రుణ సంఖ్యలు ఉంటాయి: …, −3, −2, −1, 0, 1, 2, 3, … భూమి కింది లిఫ్ట్ అంతస్తులు, 0 °C కంటే తక్కువ ఉష్ణోగ్రత, అప్పు గురించి ఆలోచించండి.'),
      p('On a number line, numbers increase to the right. Adding a positive number moves right; adding a negative number moves left.', 'సంఖ్యారేఖపై కుడివైపుకు సంఖ్యలు పెరుగుతాయి. ధన సంఖ్య కలిపితే కుడికి, రుణ సంఖ్య కలిపితే ఎడమకు కదులుతాం.'),
      vis({ kind: 'number-line', from: -5, to: 5, step: 1, jumps: [[-2, 3]] }, 'Number line from −5 to 5 showing a jump from −2 to 3', '−2 నుండి 3 కు దూకడం చూపే −5 నుండి 5 సంఖ్యారేఖ'),
      f('Subtracting a number = adding its opposite: 3 − (−2) = 3 + 2 = 5'),
    ],
    examples: [
      ex(L('A lift is at floor −2 and goes up 5 floors. Which floor now?', 'లిఫ్ట్ −2 అంతస్తులో ఉంది, 5 అంతస్తులు పైకి వెళ్ళింది. ఇప్పుడు ఏ అంతస్తు?'), [S('−2 + 5'), L('Move 5 right from −2', '−2 నుండి 5 కుడికి కదలండి')], L('Floor 3', '3వ అంతస్తు')),
      ex(L('Leh is at −4 °C at night and 9 °C in the day. Rise?', 'లేహ్‌లో రాత్రి −4 °C, పగలు 9 °C. ఎంత పెరిగింది?'), [S('9 − (−4) = 9 + 4')], S('13 °C')),
    ],
    practice: [
      tp('add', (r) => {
        const a = r.int(-9, 9), b = r.int(-9, 9) || 4;
        const op = r.pick(['+', '−'] as const);
        const ans = op === '+' ? a + b : a - b;
        const bs = b < 0 ? `(${b})` : `${b}`;
        return {
          type: 'number-line', prompt: L(`Use the number line: ${a} ${op} ${bs} = ?`, `సంఖ్యారేఖను వాడండి: ${a} ${op} ${bs} = ?`), line: { from: -20, to: 20, step: 1 }, answer: num(ans),
          hints: [L(`Start at ${a}.`, `${a} వద్ద ప్రారంభించండి.`), op === '−' ? L('Subtracting is adding the opposite.', 'తీసివేయడం అంటే వ్యతిరేక సంఖ్యను కలపడం.') : L('Positive → move right; negative → move left.', 'ధన → కుడికి; రుణ → ఎడమకు.')],
          mistakes: [{ when: String(op === '+' ? a - b : a + b), explain: L('Check the direction: subtracting a negative moves RIGHT.', 'దిశను చూడండి: రుణ సంఖ్యను తీసివేస్తే కుడికి కదులుతాం.') }],
          solution: [S(op === '−' ? `${a} − ${bs} = ${a} + (${-b})` : `${a} + ${bs}`), S(`= ${ans}`)],
        };
      }),
      tp('temp', (r) => {
        const lo = -r.int(1, 12), hi = r.int(2, 18);
        const place = r.pick([['Leh', 'లేహ్'], ['Shimla', 'సిమ్లా'], ['Gulmarg', 'గుల్మార్గ్'], ['Tawang', 'తవాంగ్']] as [string, string][]);
        return {
          type: 'typed', keypad: 'units', unitHint: '°C', prompt: L(`In ${place[0]} the temperature was ${lo} °C at night and ${hi} °C at noon. By how much did it rise?`, `${place[1]} లో రాత్రి ఉష్ణోగ్రత ${lo} °C, మధ్యాహ్నం ${hi} °C. ఎంత పెరిగింది?`), answer: num(hi - lo, '°C'),
          hints: [L('Rise = noon temperature − night temperature.', 'పెరుగుదల = మధ్యాహ్న ఉష్ణోగ్రత − రాత్రి ఉష్ణోగ్రత.'), S(`${hi} − (${lo}) = ${hi} + ${-lo}`)],
          mistakes: [{ when: String(hi + lo), explain: L('Subtracting a negative number means adding: the gap crosses zero.', 'రుణ సంఖ్యను తీసివేయడం అంటే కలపడం: అంతరం సున్నాను దాటుతుంది.') }],
          solution: [S(`${hi} − (${lo}) = ${hi - lo} °C`)],
        };
      }),
      tp('order', (r) => {
        const set = new Set<number>(); while (set.size < 5) set.add(r.int(-15, 15));
        const s = [...set].sort((a, b) => a - b);
        const shown = r.shuffle(s).join(', ');
        return {
          type: 'order', prompt: L(`Arrange from smallest to largest: ${shown}`, `చిన్న నుండి పెద్దకు అమర్చండి: ${shown}`), ...ordering(r, s.map(String)),
          hints: [L('Negative numbers further from 0 are smaller.', '0 నుండి దూరంగా ఉన్న రుణ సంఖ్యలు చిన్నవి.'), S('−10 < −2')], solution: [S(s.join(' < '))],
        };
      }),
      tp('compare', (r) => {
        const a = r.int(-12, 12), b = r.int(-12, 12);
        const B = a === b ? b - 1 : b;
        const sym = a > B ? '>' : '<';
        return {
          type: 'mcq', prompt: L(`Choose the sign: ${a} ? ${B}`, `గుర్తును ఎంచుకోండి: ${a} ? ${B}`), ...choose(r, sym, sym === '>' ? ['<', '='] : ['>', '=']),
          hints: [L('The number further right on the number line is greater.', 'సంఖ్యారేఖపై కుడివైపు ఉన్న సంఖ్య పెద్దది.')], solution: [S(`${a} ${sym} ${B}`)],
        };
      }),
    ],
  }],
};

// ------------------------------------------------------------------ PHYSICS
const magnets: USpec = {
  id: 'c6.u.magnets', subject: 'physics', title: 'Exploring Magnets', source: src('cu6', 4, 'Exploring Magnets'),
  objectives: [{
    id: 'c6.phy.magnets', title: 'Magnetic materials, poles and the compass', prereqs: [],
    activities: ['lab:forces'],
    intro: [
      p('A magnet attracts materials such as iron, nickel and cobalt. Wood, plastic, glass, copper and aluminium are non-magnetic.'),
      p('Every magnet has a north pole and a south pole. Like poles repel; unlike poles attract. A freely hanging magnet always comes to rest pointing north–south — that is how a compass works.'),
      tip('Magnetic attraction is strongest at the poles. Breaking a magnet in two gives two smaller magnets, each with N and S.'),
    ],
    examples: [
      ex('Which will a magnet pick up: iron nail, rubber, steel spoon, copper coin?', ['Iron and steel (mostly iron) are magnetic', 'Rubber and copper are not'], 'Iron nail and steel spoon'),
      ex('The N pole of one magnet is brought near the N pole of another. What happens?', ['Like poles'], 'They repel'),
    ],
    practice: [
      tp('materials', (r) => {
        const all = [
          { label: 'Iron nail', ok: true }, { label: 'Steel safety pin', ok: true }, { label: 'Nickel coin', ok: true }, { label: 'Iron filings', ok: true },
          { label: 'Plastic scale', ok: false }, { label: 'Wooden pencil', ok: false }, { label: 'Copper wire', ok: false }, { label: 'Aluminium foil', ok: false }, { label: 'Glass bangle', ok: false }, { label: 'Rubber eraser', ok: false },
        ];
        const pick = r.shuffle(all).slice(0, 5);
        if (!pick.some((x) => x.ok)) pick[0] = all[0];
        if (pick.every((x) => x.ok)) pick[4] = all[5];
        return { type: 'tap', prompt: 'Tap every object a magnet will attract.', ...tapAll(r, pick), hints: ['Magnets attract iron, nickel and cobalt.', 'Most other metals (copper, aluminium) are not attracted.'], mistakes: [{ when: 'wrong', explain: 'Not every metal is magnetic — copper and aluminium are not.' }], solution: [`Magnetic: ${pick.filter((x) => x.ok).map((x) => x.label).join(', ')}`] };
      }),
      tp('poles', (r) => {
        const a = r.pick(['N', 'S']), b = r.pick(['N', 'S']);
        const ans = a === b ? 'They repel (push apart)' : 'They attract (pull together)';
        const c = choose(r, ans, ['They repel (push apart)', 'They attract (pull together)', 'Nothing happens'].filter((x) => x !== ans));
        const ctx = r.pick(['two bar magnets on a table', 'two magnets floating on toy boats in a bucket', 'two ring magnets on a pencil']);
        return { type: 'mcq', prompt: `With ${ctx}, the ${a} pole of one is brought near the ${b} pole of the other. What happens?`, ...c, hints: ['Like poles repel; unlike poles attract.'], solution: [`${a} and ${b} are ${a === b ? 'like' : 'unlike'} poles → ${ans.toLowerCase()}.`] };
      }),
      tp('facts', (r) => {
        const qs: [string, string, string[]][] = [
          ['A freely suspended bar magnet comes to rest pointing…', 'North–south', ['East–west', 'Any direction', 'Up–down']],
          ['Where is a bar magnet\'s attraction strongest?', 'At its poles', ['At its middle', 'Equally everywhere', 'Only at the north pole']],
          ['A bar magnet is broken into two pieces. Each piece has…', 'Both a north and a south pole', ['Only one pole', 'No poles', 'Two north poles']],
          ['Which is the surest test that an object is a magnet?', 'Repulsion with a known magnet', ['Attraction to iron', 'It is shiny', 'It is heavy']],
          ['Which of these can weaken a magnet?', 'Heating or dropping it repeatedly', ['Keeping it with a keeper', 'Storing pairs N to S', 'Wrapping it in cloth']],
          ['A compass needle is a…', 'Small magnet', ['Piece of copper', 'Piece of plastic', 'Battery']],
        ];
        const [q, a, w] = r.pick(qs);
        return { type: 'mcq', prompt: q, ...choose(r, a, w), hints: ['Remember: like poles repel, unlike poles attract; poles point N–S.'], solution: [a] };
      }),
    ],
  }],
};

const measure: USpec = {
  id: 'c6.u.measure', subject: 'physics', title: 'Measurement of Length and Motion', source: src('cu6', 5, 'Measurement of Length and Motion'),
  objectives: [
    {
      id: 'c6.phy.length', title: 'SI units of length and conversions', prereqs: [],
      intro: [
        p('Measuring means comparing with a standard unit. Hand-spans and foot-lengths vary from person to person, so scientists use the SI unit of length: the metre (m).'),
        f('10 mm = 1 cm, 100 cm = 1 m, 1000 m = 1 km'),
        stepsB('Place the scale along the object with the zero mark (or any clear mark) at one end.', 'Keep your eye directly above the reading to avoid parallax error.', 'Subtract the starting reading if you did not start at zero.'),
      ],
      examples: [
        ex('Convert 2.5 m to centimetres.', ['1 m = 100 cm', '2.5 × 100 = 250'], '250 cm'),
        ex('A pencil lies from the 2.0 cm mark to the 15.5 cm mark. Length?', ['15.5 − 2.0'], '13.5 cm'),
      ],
      practice: [
        tp('convert', (r) => {
          const cases: [number, string, string, number][] = [
            [r.int(2, 95) / 10, 'm', 'cm', 100], [r.int(120, 9800), 'm', 'km', 0.001], [r.int(15, 480), 'mm', 'cm', 0.1], [r.int(2, 40) / 2, 'km', 'm', 1000], [r.int(150, 990), 'cm', 'm', 0.01],
          ];
          const [v, from, to, k] = r.pick(cases);
          const ans = +(v * k).toFixed(4);
          return {
            type: 'typed', keypad: 'units', unitHint: to, prompt: `Convert ${v} ${from} into ${to}.`, answer: num(ans, to, true),
            hints: ['Recall: 10 mm = 1 cm, 100 cm = 1 m, 1000 m = 1 km.', k > 1 ? 'Bigger unit → smaller unit: multiply.' : 'Smaller unit → bigger unit: divide.'],
            mistakes: [{ when: 'missing-unit', explain: `Write the unit (${to}) with your answer.` }, { when: String(+(v / k).toFixed(4)), explain: 'You converted the wrong way — check whether to multiply or divide.' }],
            solution: [`${v} ${from} = ${ans} ${to}`],
          };
        }),
        tp('scale', (r) => {
          const start = r.int(0, 6), len = r.int(25, 140) / 10;
          const end = +(start + len).toFixed(1);
          return {
            type: 'typed', keypad: 'units', unitHint: 'cm', prompt: `A ${r.pick(['pencil', 'leaf', 'crayon', 'key', 'twig'])} lies along a scale from the ${start} cm mark to the ${end} cm mark. How long is it?`,
            visual: { kind: 'number-line', from: 0, to: Math.ceil(end) + 1, step: 1, marks: [start, end] },
            answer: num(len, 'cm'),
            hints: ['Length = end reading − start reading.'],
            mistakes: [{ when: String(end), explain: 'The object did not start at 0. Subtract the starting mark.' }],
            solution: [`${end} − ${start} = ${len} cm`],
          };
        }),
      ],
    },
    {
      id: 'c6.phy.motion-types', title: 'Types of motion', prereqs: [],
      activities: ['lab:motion'],
      intro: [
        p('An object is in motion if its position changes with time compared to a reference point.'),
        stepsB('Linear (rectilinear): along a straight line — a train on a straight track.', 'Circular: along a circle — tip of a fan blade.', 'Periodic (oscillatory): repeats after a fixed time — a swing, a pendulum.'),
        act('lab:motion?u=2&a=0&t=10', 'Watch straight-line motion in the Motion Lab'),
      ],
      examples: [
        ex('What type of motion is a child on a swing?', ['It moves back and forth, repeating'], 'Periodic (oscillatory)'),
        ex('What type of motion is a ball dropped from a roof?', ['It moves along a straight line downward'], 'Linear'),
      ],
      practice: [
        tp('classify', (r) => {
          const items: [string, string][] = [
            ['a car on a straight highway', 'Linear'], ['a soldier marching straight', 'Linear'], ['a stone falling from a cliff', 'Linear'],
            ['the blade of a ceiling fan', 'Circular'], ['a merry-go-round horse', 'Circular'], ['the hands of a clock', 'Circular'],
            ['a pendulum in a wall clock', 'Periodic'], ['a child on a swing', 'Periodic'], ['the plucked string of a veena', 'Periodic'],
          ];
          const [obj, t] = r.pick(items);
          return { type: 'mcq', prompt: `What type of motion is shown by ${obj}?`, ...choose(r, t, ['Linear', 'Circular', 'Periodic'].filter((x) => x !== t)), hints: ['Does it go straight, go round, or repeat back-and-forth?'], solution: [`${obj[0].toUpperCase() + obj.slice(1)}: ${t.toLowerCase()} motion.`] };
        }),
        tp('match', (r) => {
          const lin = r.pick(['Train on a straight track', 'Falling coconut', 'Sprinter on a 100 m track', 'Lift going up']);
          const cir = r.pick(['Spinning top', 'Giant wheel at a fair', 'Point on a bicycle wheel', 'Ceiling fan blade']);
          const per = r.pick(['Swing', 'Pendulum', 'Heartbeat', 'Plucked guitar string']);
          const s: [string, string][] = r.shuffle([[lin, 'Linear'], [cir, 'Circular'], [per, 'Periodic']] as [string, string][]);
          return { type: 'match', prompt: `Match each motion to its type (${s.map((x) => x[0]).join(' / ')}).`, ...matching(r, s), hints: ['Straight → linear; round → circular; repeating → periodic.'], solution: s.map(([a, b]) => `${a} → ${b}`) };
        }),
      ],
    },
  ],
};

const temp: USpec = {
  id: 'c6.u.temperature', subject: 'physics', title: 'Temperature and its Measurement', source: src('cu6', 7, 'Temperature and its Measurement'),
  objectives: [{
    id: 'c6.phy.temp', title: 'Reading thermometers in °C', prereqs: [],
    intro: [
      p('Temperature tells how hot or cold something is. Touch can mislead us, so we use thermometers. In daily life we use degrees Celsius (°C).'),
      p('A clinical thermometer reads 35 °C to 42 °C; normal body temperature is about 37 °C. A laboratory thermometer reads about −10 °C to 110 °C.'),
      stepsB('Find the value of one small division: (difference between two marked readings) ÷ (number of divisions between them).', 'Count divisions from the last marked value.', 'Read at eye level with the top of the liquid.'),
    ],
    examples: [
      ex('Between 30 °C and 40 °C there are 10 divisions. The mercury is 4 divisions above 30. Reading?', ['Each division = 10 ÷ 10 = 1 °C', '30 + 4 = 34'], '34 °C'),
      ex('Between 36 °C and 37 °C there are 10 divisions. Mercury is 6 divisions above 37. Reading?', ['Each division = 0.1 °C', '37 + 0.6'], '37.6 °C'),
    ],
    practice: [
      tp('read', (r) => {
        const [base, span, divs] = r.pick([[20, 10, 10], [30, 10, 5], [36, 1, 10], [50, 10, 5], [0, 10, 10], [37, 1, 10]] as [number, number, number][]);
        const k = r.int(1, divs - 1);
        const each = span / divs;
        const ans = +(base + k * each).toFixed(1);
        return {
          type: 'typed', keypad: 'units', unitHint: '°C', prompt: `On a thermometer, there are ${divs} small divisions between ${base} °C and ${base + span} °C. The liquid is ${k} divisions above ${base} °C. What is the reading?`,
          visual: { kind: 'number-line', from: base, to: base + span, step: each, marks: [ans] },
          answer: num(ans, '°C'),
          steps: [{ prompt: 'Value of one division (°C)', answer: num(each) }, { prompt: 'Reading', answer: num(ans, '°C') }],
          hints: [`One division = ${span} ÷ ${divs}.`, `Then add ${k} divisions to ${base}.`],
          mistakes: [{ when: String(base + k), explain: `Each division is ${each} °C, not 1 °C here.` }],
          solution: [`One division = ${each} °C`, `${base} + ${k} × ${each} = ${ans} °C`],
        };
      }),
      tp('choose', (r) => {
        const qs: [string, string, string[]][] = [
          ['Which thermometer should a doctor use to check a fever?', 'Clinical thermometer', ['Laboratory thermometer', 'Weighing scale', 'Barometer']],
          ['What is the normal human body temperature?', 'About 37 °C', ['About 27 °C', 'About 47 °C', 'About 100 °C']],
          ['At what temperature does pure water boil at sea level?', '100 °C', ['37 °C', '0 °C', '50 °C']],
          ['At what temperature does ice melt?', '0 °C', ['100 °C', '10 °C', '−10 °C']],
          ['Why should you not use a clinical thermometer to measure boiling water?', 'It only reads up to about 42 °C and may break', ['It is too long', 'It reads in Fahrenheit only', 'It has no mercury']],
          ['Why does a clinical thermometer have a kink near the bulb?', 'To stop the liquid falling back before you read it', ['To make it look nice', 'To heat the liquid', 'To measure faster']],
        ];
        const [q, a, w] = r.pick(qs);
        return { type: 'mcq', prompt: q, ...choose(r, a, w), hints: ['Think about the range each thermometer can measure.'], solution: [a] };
      }),
      tp('compare', (r) => {
        const t = r.shuffle([r.int(-5, 5), r.int(12, 22), r.int(25, 33), r.int(36, 39), r.int(60, 99)].map((x, i) => x + i * 0));
        const sorted = [...new Set(t)].sort((a, b) => a - b);
        return { type: 'order', prompt: `Order these temperatures from coldest to hottest: ${r.shuffle(sorted).map((x) => `${x} °C`).join(', ')}`, ...ordering(r, sorted.map((x) => `${x} °C`)), hints: ['Below-zero temperatures are the coldest.'], solution: [sorted.map((x) => `${x} °C`).join(' < ')] };
      }),
    ],
  }],
};

const water: USpec = {
  id: 'c6.u.water', subject: 'physics', title: 'A Journey through States of Water', source: src('cu6', 8, 'A Journey through States of Water'),
  note: 'Physical-science portion only (changes of state, evaporation).',
  objectives: [{
    id: 'c6.phy.states', title: 'Melting, boiling, evaporation and condensation', prereqs: ['c6.phy.temp'],
    intro: [
      p('Water exists as solid (ice), liquid (water) and gas (water vapour). Heating or cooling changes its state.'),
      stepsB('Melting: solid → liquid (ice melts at 0 °C).', 'Freezing: liquid → solid.', 'Boiling: liquid → gas throughout the liquid (100 °C at sea level).', 'Evaporation: liquid → gas at the surface, at any temperature.', 'Condensation: gas → liquid (water droplets on a cold glass).'),
      tip('Evaporation is faster when it is hotter, windier, less humid, or when the water is spread over a larger area — that is why clothes dry fast on a sunny, breezy day.'),
    ],
    examples: [
      ex('Droplets form outside a glass of cold nimbu-pani. Why?', ['Water vapour in the air touches the cold glass', 'It cools and changes to liquid'], 'Condensation'),
      ex('Where will a wet saree dry faster — folded in a room, or spread out in the sun?', ['Larger area, more heat and wind → faster evaporation'], 'Spread out in the sun'),
    ],
    practice: [
      tp('name', (r) => {
        const cases: [string, string][] = [
          ['Ice cream left out turns into liquid.', 'Melting'], ['Water in a freezer tray turns into ice cubes.', 'Freezing'], ['Puddles on the road disappear after the rain stops.', 'Evaporation'],
          ['Drops form on the outside of a cold water bottle.', 'Condensation'], ['Water bubbles vigorously in a kettle at 100 °C.', 'Boiling'], ['Wet clothes dry on a clothesline.', 'Evaporation'], ['Mirror fogs up after a hot bath.', 'Condensation'],
        ];
        const [q, a] = r.pick(cases);
        return { type: 'mcq', prompt: `${q} Which change is this?`, ...choose(r, a, ['Melting', 'Freezing', 'Evaporation', 'Condensation', 'Boiling'].filter((x) => x !== a)), hints: ['Which state does it start in, and which does it end in?'], solution: [a] };
      }),
      tp('match', (r) => {
        const pairs: [string, string][] = r.shuffle([['Solid → liquid', 'Melting'], ['Liquid → solid', 'Freezing'], ['Liquid → gas at the surface', 'Evaporation'], ['Gas → liquid', 'Condensation'], ['Liquid → gas throughout, at a fixed temperature', 'Boiling']] as [string, string][]).slice(0, 4);
        return { type: 'match', prompt: `Match each change of state to its name (${pairs.map((x) => x[1]).join(', ')}).`, ...matching(r, pairs), hints: ['Melting and freezing are opposites; so are evaporation and condensation.'], solution: pairs.map(([a, b]) => `${a}: ${b}`) };
      }),
      tp('faster', (r) => {
        const all = [
          { label: 'A hot sunny day', ok: true }, { label: 'A windy day', ok: true }, { label: 'Spreading the water out', ok: true }, { label: 'Dry (low humidity) air', ok: true },
          { label: 'A cold, still room', ok: false }, { label: 'Very humid air', ok: false }, { label: 'Keeping water in a narrow bottle', ok: false },
        ];
        const pick = r.shuffle(all).slice(0, 5);
        if (!pick.some((x) => x.ok)) pick[0] = all[0];
        if (pick.every((x) => x.ok)) pick[4] = all[4];
        return { type: 'tap', prompt: 'Tap every condition that makes water evaporate FASTER.', ...tapAll(r, pick), hints: ['Think about drying clothes.'], solution: [`Faster: ${pick.filter((x) => x.ok).map((x) => x.label).join(', ')}`] };
      }),
    ],
  }],
};

export default buildClass(8, [patterns, lines, numberPlay, data, primeTime, perim, fractions, constructions, symmetry, integers, magnets, measure, temp, water]);
