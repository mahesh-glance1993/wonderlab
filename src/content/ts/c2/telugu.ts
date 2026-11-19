// Telangana SCERT Class 2 — Telugu (First Language). Original teaching aligned to the official chapter list
// (src/content/ts/books.ts, syllabus.json). Textbook songs and stories are never reproduced: each lesson gets our own
// tiny rhyme or story (or a short public-domain traditional refrain), letter work (varnamala, guninthalu, ottulu)
// and one short sentence to read. Class 2 is a young level, so every learner-facing line is bilingual:
// Telugu (`te`, primary) with a simple English gloss (`en`). Strings are authored as 'తెలుగు | English'.
import { tp, ex, p, tip, keys, photo, h, choose, pictures, matching, ordering, tapAll, type USpec, type OSpec, type ExSpec, type TSpec } from '../../lib/kit';
import type { Block, Localized, VisualSpec } from '../../../shared/content';
import type { Rng } from '../../../shared/grading';
import { tsSrc } from '../books';

// ============================================================ bilingual helpers
const SEP = ' | ';
/** 'తెలుగు | English' → { te, en }. Throws when the English gloss is missing, so no line ships without it. */
const t = (s: string): Localized => {
  const i = s.indexOf(SEP);
  if (i < 0) throw new Error(`Class 2 Telugu: missing English gloss in "${s}"`);
  return { te: s.slice(0, i).trim(), en: s.slice(i + SEP.length).trim() };
};
/** Answer label: 'పిల్లి | cat' → te 'పిల్లి', en 'పిల్లి (cat)'; a bare Telugu token stays the same in both. */
const w = (s: string): Localized => {
  const i = s.indexOf(SEP);
  if (i < 0) return { te: s, en: s };
  const te = s.slice(0, i).trim();
  return { te, en: `${te} (${s.slice(i + SEP.length).trim()})` };
};
const L2 = (te: string, en: string): Localized => ({ te, en });
const J = (...xs: Localized[]): Localized => ({ te: xs.map((x) => x.te).join(' '), en: xs.map((x) => x.en).join(' ') });
const emo = (e: string): VisualSpec => ({ kind: 'emoji', text: e });

const P = (s: string): Block => { const x = t(s); return p(x.en, x.te); };
const TIP = (s: string): Block => { const x = t(s); return tip(x.en, x.te); };
const PH = (e: string, s: string): Block => photo(e, t(s));
const KEYS = (...s: string[]): Block => keys(...s.map(t));
const H = (s: string): Block => { const x = t(s); return h(x.en, x.te); };
/** A rhyme or tiny story shown line by line. */
const RHYME = (title: string, lines: string[]): Block[] => [H(title), KEYS(...lines)];
const EX = (q: string, steps: string[], a: string): ExSpec => ex(t(q), steps.map(t), w(a));

const NOT = 'అయ్యో, ఇంకొక్కసారి చూద్దాం! | Oops, let us look once more!';
const LAST = 'ప్రతి జవాబును నెమ్మదిగా చదివి చూడు. | Read each option slowly, one by one.';
const SAYIT = 'గట్టిగా పలికి చూడు — చెవి సాయం చేస్తుంది. | Say it aloud; your ears will help you.';
const ANS = L2('సరైన జవాబు:', 'Answer:');
const GOOD = 'భలే! | Well done!';

// ============================================================ practice factories
/** [question, answer, wrong answers, hint, why] */
type MQ = [string, string, string[], string, string];
/** [question, [emoji, label], wrong [emoji, label][], hint, why] */
type PQ = [string, [string, string], [string, string][], string, string];
type D = 1 | 2 | 3;

const mcq = (key: string, hint0: string, bank: MQ[], d: D = 1): TSpec => tp(key, (r) => {
  const [q, a, wr, h1, why] = r.pick(bank);
  return {
    type: 'mcq', prompt: t(q), ...choose(r, w(a), wr.map(w)), hints: [t(hint0), t(h1), t(LAST)],
    mistakes: [{ when: 'wrong', explain: J(t(NOT), t(why)) }], solution: [J(ANS, w(a)), t(why)],
  };
}, d);

const pic = (key: string, hint0: string, bank: PQ[], d: D = 1): TSpec => tp(key, (r) => {
  const [q, [ae, al], wr, h1, why] = r.pick(bank);
  return {
    type: 'mcq', prompt: t(q),
    ...pictures(r, { label: w(al), visual: emo(ae) }, wr.map(([e, l]) => ({ label: w(l), visual: emo(e) })), 3),
    hints: [t(hint0), t(h1), t('ప్రతి బొమ్మ పేరు గట్టిగా చెప్పు. | Say the name of each picture aloud.')],
    mistakes: [{ when: 'wrong', explain: J(t(NOT), t(why)) }], solution: [J(ANS, J(L2(ae, ae), w(al))), t(why)],
  };
}, d);

const matchT = (key: string, prompt: string, pool: [string, string][], hint: string, d: D = 2): TSpec => tp(key, (r) => {
  const pairs = r.shuffle(pool).slice(0, 4);
  const m = matching(r, pairs.map(([a, b]) => [w(a), w(b)]));
  const lefts = pairs.map(([a]) => w(a));
  return {
    type: 'match', prompt: J(t(prompt), L2(`— ${lefts.map((x) => x.te).join(' · ')}`, `— ${lefts.map((x) => x.en).join(' · ')}`)),
    left: m.left, right: m.right, answer: m.answer,
    hints: [t(hint), t('నీకు బాగా తెలిసిన జతను ముందు కలుపు. | Join the pair you are surest of first.')],
    mistakes: [{ when: 'wrong', explain: J(t(NOT), t('ఒక జత తప్పుగా కలిసింది — ఒక్కొక్కటి మళ్ళీ చూడు. | One pair is mixed up; check each one again.')) }],
    solution: pairs.map(([a, b]) => J(w(a), L2('→', '→'), w(b))),
  };
}, d);

/** Put tokens in order. Each sequence must have distinct tokens. */
const orderT = (key: string, prompt: string, seqs: string[][], hint: string, d: D = 2): TSpec => {
  seqs.forEach((q) => { if (new Set(q.map((x) => w(x).en)).size !== q.length) throw new Error(`${key}: repeated token in ${q.join(' ')}`); });
  return tp(key, (r) => {
    const seq = r.pick(seqs);
    const ws = seq.map(w);
    return {
      type: 'order', prompt: t(prompt), ...ordering(r, ws),
      hints: [t(hint), L2(`మొదట వచ్చేది: "${ws[0].te}".`, `It starts with "${ws[0].en}".`), L2(`చివర వచ్చేది: "${ws[ws.length - 1].te}".`, `It ends with "${ws[ws.length - 1].en}".`)],
      mistakes: [{ when: 'wrong', explain: J(t(NOT), t('మొదటిదాన్ని పట్టుకొని, తర్వాత ఏది వస్తుందో ఆలోచించు. | Hold the first one and think what comes next.')) }],
      solution: [L2(ws.map((x) => x.te).join(' → '), ws.map((x) => x.en).join(' → '))],
    };
  }, d);
};

const tapT = (key: string, prompt: string, pool: [string, boolean][], why: string, d: D = 2): TSpec => {
  const yes = pool.find((x) => x[1])!, no = pool.find((x) => !x[1])!;
  return tp(key, (r) => {
    const pick = r.shuffle(pool).slice(0, 5);
    if (!pick.some((x) => x[1])) pick[0] = yes;
    if (!pick.some((x) => !x[1])) pick[4] = no;
    const k = pick.filter((x) => x[1]).length;
    return {
      type: 'tap', prompt: t(prompt), ...tapAll(r, pick.map(([label, ok]) => ({ label: w(label), ok }))),
      hints: [t(why), L2(`సరైనవి ${k} ఉన్నాయి.`, `There ${k === 1 ? 'is 1 right answer' : `are ${k} right answers`}.`)],
      mistakes: [{ when: 'wrong', explain: J(t(NOT), t('ఒక్కొక్కదాన్ని విడిగా చూడు. | Check each one by itself.')) }],
      solution: [J(ANS, L2(pick.filter((x) => x[1]).map((x) => w(x[0]).te).join(', '), pick.filter((x) => x[1]).map((x) => w(x[0]).en).join(', '))), t(why)],
    };
  }, d);
};

// ============================================================ letters: guninthalu
/** [sign, full vowel, roman, Telugu name] */
const SIGNS: [string, string, string, string][] = [
  ['ా', 'ఆ', 'aa', 'దీర్ఘం'], ['ి', 'ఇ', 'i', 'గుడి'], ['ీ', 'ఈ', 'ii', 'గుడి దీర్ఘం'], ['ు', 'ఉ', 'u', 'కొమ్ము'], ['ూ', 'ఊ', 'uu', 'కొమ్ము దీర్ఘం'],
  ['ృ', 'ఋ', 'ru', 'ఋత్వం'], ['ె', 'ఎ', 'e', 'ఎత్వం'], ['ే', 'ఏ', 'ee', 'ఏత్వం'], ['ై', 'ఐ', 'ai', 'ఐత్వం'],
  ['ొ', 'ఒ', 'o', 'ఒత్వం'], ['ో', 'ఓ', 'oo', 'ఓత్వం'], ['ౌ', 'ఔ', 'au', 'ఔత్వం'], ['ం', 'అం', 'am', 'సున్న (పూర్ణానుస్వారం)'], ['ః', 'అః', 'ah', 'విసర్గ'],
];
const ROM: Record<string, string> = {
  క: 'k', ఖ: 'kh', గ: 'g', ఘ: 'gh', చ: 'ch', ఛ: 'chh', జ: 'j', ఝ: 'jh', ట: 'T', ఠ: 'Th', డ: 'D', ఢ: 'Dh', ణ: 'N', త: 't', థ: 'th', ద: 'd', ధ: 'dh', న: 'n',
  ప: 'p', ఫ: 'ph', బ: 'b', భ: 'bh', మ: 'm', య: 'y', ర: 'r', ల: 'l', వ: 'v', శ: 'sh', ష: 'Sh', స: 's', హ: 'h', ళ: 'L',
};
const rom = (c: string, si?: number) => (ROM[c] ?? c) + (si === undefined ? 'a' : SIGNS[si][2]);
const sylL = (c: string, si: number) => w(`${c}${SIGNS[si][0]} | ${rom(c, si)}`);
const signL = (si: number) => w(`${SIGNS[si][3]} ◌${SIGNS[si][0]} | "${SIGNS[si][2]}" sign`);
const pick3 = <X>(r: Rng, xs: X[], n = 3): X[] => r.shuffle(xs).slice(0, n);
/** Vowel-sign sets used by the three gunintham lessons. */
const SET1 = [0, 1, 2, 3, 4], SET2 = [5, 6, 7, 8], SET3 = [9, 10, 11, 12, 13];
const near = (set: number[]) => [...set, ...SIGNS.map((_, i) => i).filter((i) => !set.includes(i))];

/** "క + ఇ = ?" — join a consonant and a vowel sign. */
const gunJoin = (key: string, cons: string[], set: number[], d: D = 1): TSpec => tp(key, (r) => {
  const c = r.pick(cons), si = r.pick(set);
  const others = near(set).filter((i) => i !== si);
  const wrong = [...pick3(r, others.filter((i) => set.includes(i))), ...others.filter((i) => !set.includes(i))].slice(0, 3);
  const [s, v, ro, name] = SIGNS[si];
  return {
    type: 'mcq', prompt: L2(`${c} + ${v} = ? ఏ అక్షరం వస్తుంది?`, `${c} (${rom(c)}) + ${v} (${ro}) = ? Which letter do we get?`),
    ...choose(r, sylL(c, si), wrong.map((i) => sylL(c, i))),
    hints: [L2(`${v} కి గుర్తు "${name}" — ◌${s}.`, `The sign for ${v} is called "${name}": ◌${s}.`), L2(`${c} కు ◌${s} చేర్చు.`, `Add ◌${s} to ${c}.`), t(SAYIT)],
    mistakes: [{ when: 'wrong', explain: J(t(NOT), L2(`ఆ అక్షరానికి వేరే గుర్తు ఉంది. మనకు ${name} (◌${s}) కావాలి.`, `That letter has a different sign. We need ${name} (◌${s}).`)) }],
    solution: [L2(`${c} + ${v} = ${c}${s}`, `${c} + ${v} = ${c}${s} (${rom(c, si)})`), t(GOOD)],
  };
}, d);

/** "కీ — ఏ గుర్తు ఉంది?" — name the vowel sign in a letter. */
const gunSign = (key: string, cons: string[], set: number[], d: D = 2): TSpec => tp(key, (r) => {
  const c = r.pick(cons), si = r.pick(set);
  const others = near(set).filter((i) => i !== si);
  const wrong = [...pick3(r, others.filter((i) => set.includes(i))), ...others.filter((i) => !set.includes(i))].slice(0, 3);
  const [s, v, , name] = SIGNS[si];
  return {
    type: 'mcq', prompt: L2(`"${c}${s}" — ఈ అక్షరంలో ఏ గుణింతం గుర్తు ఉంది?`, `"${c}${s}" (${rom(c, si)}) — which vowel sign is on this letter?`),
    ...choose(r, signL(si), wrong.map(signL)),
    hints: [L2(`అక్షరాన్ని ${c} నుండి వేరు చేసి చూడు: ${c} + ◌${s}.`, `Take away ${c} and look at what is left: ◌${s}.`), L2(`పలికితే చివర "${v}" వినిపిస్తుంది.`, `When you say it, you hear "${v}" at the end.`), t(LAST)],
    mistakes: [{ when: 'wrong', explain: J(t(NOT), L2(`◌${s} గుర్తు పేరు "${name}".`, `The sign ◌${s} is called "${name}".`)) }],
    solution: [L2(`${c}${s} = ${c} + ${v} → గుర్తు: ${name} (◌${s})`, `${c}${s} = ${c} + ${v} → sign: ${name} (◌${s})`)],
  };
}, d);

/** Say the gunintham row of a consonant in order. */
const gunRow = (key: string, cons: string[], set: number[], d: D = 2): TSpec => tp(key, (r) => {
  const c = r.pick(cons);
  const seq = [c, ...set.map((i) => c + SIGNS[i][0])];
  const ws = seq.map((x, i) => w(`${x} | ${i === 0 ? rom(c) : rom(c, set[i - 1])}`));
  return {
    type: 'order', prompt: L2(`"${c}" గుణింతాన్ని వరుసలో పెట్టు.`, `Put the "${c}" vowel-sign row in order.`), ...ordering(r, ws),
    hints: [L2(`అచ్చుల వరుస గుర్తు చేసుకో: అ, ${set.map((i) => SIGNS[i][1]).join(', ')}.`, `Remember the vowel order: a, ${set.map((i) => SIGNS[i][2]).join(', ')}.`), L2(`మొదట వచ్చేది "${c}".`, `It starts with "${c}".`)],
    mistakes: [{ when: 'wrong', explain: J(t(NOT), t('అచ్చులు ఏ వరుసలో వస్తాయో, గుణింతం కూడా అదే వరుసలో వస్తుంది. | The signs follow the same order as the vowels.')) }],
    solution: [L2(seq.join(', '), ws.map((x) => x.en).join(', '))],
  };
}, d);

// ============================================================ words with a missing piece
/** 'మా-[మి]-డి|mango|🥭' : syllables split by '-', the [bracketed] one is blanked. */
interface FW { syl: string[]; i: number; gloss: string; emoji: string }
const fw = (s: string): FW => {
  const [word, gloss, emoji] = s.split('|');
  const parts = word.split('-');
  const i = parts.findIndex((x) => x.startsWith('['));
  if (i < 0 || !gloss || !emoji) throw new Error(`bad word spec ${s}`);
  return { syl: parts.map((x) => x.replace(/[[\]]/g, '')), i, gloss, emoji };
};
const VIR = '్';
const isConj = (x: string) => x.length >= 3 && x[1] === VIR;
/** Wrong answers for a blanked syllable: same consonant with another vowel sign. */
const signAlts = (set: number[]) => (s: string, r: Rng): string[] => {
  const base = s[0];
  const cands = [base, ...near(set).map((i) => base + SIGNS[i][0])].filter((x) => x !== s);
  return [...r.shuffle(cands.slice(0, set.length + 1)), ...cands.slice(set.length + 1)].slice(0, 3);
};
/** Wrong answers for a blanked conjunct syllable: another ottu, or the ottu forgotten. */
const ottuAlts = (conjs: string[]) => (s: string, r: Rng): string[] => {
  const rest = s.slice(3);
  const others = r.shuffle(conjs.filter((c) => c !== s.slice(0, 3))).slice(0, 2).map((c) => c + rest);
  return [s[0] + rest, ...others];
};
const blankT = (key: string, words: string[], alts: (s: string, r: Rng) => string[], hint: string, d: D = 2): TSpec => {
  const bank = words.map(fw);
  return tp(key, (r) => {
    const x = r.pick(bank);
    const gap = x.syl.map((s, k) => (k === x.i ? '__' : s)).join(' ');
    const ans = x.syl[x.i];
    return {
      type: 'mcq', prompt: L2(`${x.emoji} ${gap} — ఖాళీలో ఏ అక్షరం సరిపోతుంది?`, `${x.emoji} ${x.gloss}: ${gap} — which letter fills the gap?`), visual: emo(x.emoji),
      ...choose(r, w(ans), alts(ans, r).map(w)),
      hints: [t(hint), L2(`బొమ్మ పేరు చెప్పు: "${x.syl.join('')}".`, `Say the picture's name: "${x.syl.join('')}" (${x.gloss}).`), t(SAYIT)],
      mistakes: [{ when: 'wrong', explain: J(t(NOT), L2(`ఆ అక్షరం పెడితే "${x.syl.join('')}" రాదు.`, `With that letter we do not get "${x.syl.join('')}".`)) }],
      solution: [L2(`${x.syl.join(' + ')} = ${x.syl.join('')}`, `${x.syl.join(' + ')} = ${x.syl.join('')} (${x.gloss})`), t(GOOD)],
    };
  }, d);
};

// ============================================================ letters: ottulu
const split = (c: string) => [c[0], c[2]];
/** "పిల్లి — ఏ ఒత్తు అక్షరం ఉంది?" */
const ottuFind = (key: string, words: string[], conjs: string[], d: D = 1): TSpec => {
  const bank = words.map(fw);
  bank.forEach((x) => { if (!isConj(x.syl[x.i])) throw new Error(`${key}: [${x.syl[x.i]}] is not an ottu letter`); });
  return tp(key, (r) => {
    const x = r.pick(bank);
    const c = x.syl[x.i].slice(0, 3), word = x.syl.join('');
    return {
      type: 'mcq', prompt: L2(`${x.emoji} "${word}" — ఈ పదంలో ఒత్తు ఉన్న అక్షరం ఏది?`, `${x.emoji} "${word}" (${x.gloss}) — which joined (ottu) letter is in this word?`), visual: emo(x.emoji),
      ...choose(r, w(c), r.shuffle(conjs.filter((k) => k !== c)).map(w)),
      hints: [t('ఒక అక్షరం కింద చిన్న గుర్తు (ఒత్తు) ఉంటుంది. | One letter has a small sign (ottu) under it.'), L2(`పదాన్ని విడదీసి పలుకు: ${x.syl.join(' - ')}.`, `Break the word as you say it: ${x.syl.join(' - ')}.`), t(LAST)],
      mistakes: [{ when: 'wrong', explain: J(t(NOT), L2(`"${word}" లో "${c}" ఉంది — ${split(c)[0]} కింద ${split(c)[1]} ఒత్తు.`, `"${word}" has "${c}": ${split(c)[0]} with the ottu of ${split(c)[1]} under it.`)) }],
      solution: [L2(`${word} = ${x.syl.join(' + ')} → ఒత్తు అక్షరం: ${c}`, `${word} = ${x.syl.join(' + ')} → joined letter: ${c}`), t(GOOD)],
    };
  }, d);
};
/** "క్క = క + క" — break an ottu letter into its two consonants. */
const ottuSplit = (key: string, conjs: string[], d: D = 2): TSpec => tp(key, (r) => {
  const c = r.pick(conjs);
  const [a, b] = split(c);
  const wrongs = r.shuffle(conjs.filter((k) => k !== c)).map((k) => `${split(k)[0]} + ${split(k)[1]}`);
  if (a !== b) wrongs.unshift(`${b} + ${a}`);
  return {
    type: 'mcq', prompt: L2(`"${c}" — ఏ రెండు అక్షరాలు కలిస్తే వస్తుంది?`, `"${c}" — which two letters join to make it?`),
    ...choose(r, w(`${a} + ${b}`), wrongs.map(w)),
    hints: [L2(`పైన ఉన్న పెద్ద అక్షరం "${a}".`, `The big letter on top is "${a}".`), t('కింద ఉన్న చిన్న గుర్తు ఏ అక్షరపు ఒత్తో చూడు. | See whose ottu the small sign underneath is.'), t(LAST)],
    mistakes: [{ when: 'wrong', explain: J(t(NOT), L2(`ముందు పలికేది పైన ఉన్న "${a}", తర్వాత కింద ఒత్తుగా "${b}".`, `First comes "${a}" on top, then "${b}" as the ottu below.`)) }],
    solution: [L2(`${a} + ్ + ${b} = ${c}`, `${a} + (halant) + ${b} = ${c}`), t(a === b ? 'ఒకే అక్షరం రెండుసార్లు — ఇది ద్విత్వాక్షరం. | The same letter twice: a doubled letter (dvitva).' : 'రెండు వేర్వేరు అక్షరాలు — ఇది సంయుక్తాక్షరం. | Two different letters: a joined letter (samyukta).')],
  };
}, d);

/** Build a whole-lesson ottu objective (find + fill + split) from a word bank and its ottu letters. */
const ottuPractice = (words: string[], conjs: string[]): TSpec[] => [
  ottuFind('find', words, conjs),
  blankT('fill', words, ottuAlts(conjs), 'ఒత్తు లేకపోతే పదం మారిపోతుంది. | Without the ottu the word changes.'),
  ottuSplit('split', conjs),
];

// ============================================================ unit builder
const unit = (n: number | string, id: string, title: string, objectives: OSpec[], note?: string): USpec => ({
  id: `ts2.te.${id}`, subject: 'telugu', title: t(title), source: tsSrc(2, 'telugu', n), objectives, ...(note ? { note } : {}),
});
const o = (id: string, title: string, intro: Block[], examples: ExSpec[], practice: TSpec[]): OSpec => ({
  id: `ts2.te.${id}`, title: t(title), prereqs: [], intro, examples, practice,
});
const REVIEW = 'Taught from the lesson theme only; the textbook song/story is not reproduced — teacher should connect it to the book text.';
const OTTU_NOTE = 'Exact ottu letters for each lesson were not transcribed from the book; this lesson uses an age-appropriate set — teacher should align it with the book page.';

// ============================================================ 0. చిత్రకథలు, వర్ణమాల (Readiness)
const ch0 = unit(0, 'ch0', 'చిత్రకథలు, వర్ణమాల | Picture stories and the alphabet', [
  o('ready.vowels', 'అచ్చులు | Vowels (achchulu)', [
    P('తెలుగు అక్షరాలలో మొదట వచ్చేవి అచ్చులు. వీటిని పలకడానికి వేరే అక్షరం సాయం అక్కర్లేదు. | The first Telugu letters are the vowels (achchulu). They can be said on their own.'),
    KEYS('అ ఆ ఇ ఈ ఉ ఊ ఋ ౠ | a aa i ii u uu ru ruu', 'ఎ ఏ ఐ ఒ ఓ ఔ | e ee ai o oo au', 'అం అః | am ah'),
    ...RHYME('అచ్చుల పాట — చప్పట్లు కొడుతూ పాడు! | Vowel song — clap and sing!', [
      'అ అ అమ్మ, ఆ ఆ ఆవు | a for amma (mother), aa for aavu (cow)',
      'ఇ ఇ ఇల్లు, ఈ ఈ ఈక | i for illu (house), ii for iika (feather)',
      'ఉ ఉ ఉడుత, ఊ ఊ ఊయల | u for udutha (squirrel), uu for uuyala (swing)',
      'ఎ ఎ ఎలుక, ఏ ఏ ఏనుగు | e for eluka (rat), ee for eenugu (elephant)',
      'ఒ ఒ ఒంటె, ఓ ఓ ఓడ | o for onte (camel), oo for ooda (ship)',
    ]),
    PH('🐄', 'ఆవు — "ఆ" తో మొదలవుతుంది. | Cow (aavu) starts with ఆ.'),
    TIP('"అ" చిన్నగా, "ఆ" పొడవుగా పలుకుతాం. | We say అ short and ఆ long.'),
  ], [
    EX('"ఉడుత" ఏ అచ్చుతో మొదలవుతుంది? | Which vowel does "udutha" (squirrel) start with?', ['ఉ-డు-త అని విడదీసి పలుకు. | Say it in parts: u-du-tha.', 'మొదటి ధ్వని "ఉ". | The first sound is u.'], 'ఉ'),
    EX('"అ" తర్వాత వచ్చే అచ్చు ఏది? | Which vowel comes after అ?', ['అచ్చుల వరుస: అ, ఆ, ఇ… | Vowel order: a, aa, i…'], 'ఆ'),
  ], [
    pic('first', 'పేరులో మొదటి ధ్వని విను. | Listen for the first sound of the name.', [
      ['"ఉ" తో మొదలయ్యే బొమ్మ ఏది? | Which picture starts with ఉ?', ['🐿️', 'ఉడుత | squirrel'], [['🐘', 'ఏనుగు | elephant'], ['🐄', 'ఆవు | cow']], 'చెట్టు మీద చకచకా పరుగెత్తే చిన్న జంతువు. | A small animal that runs up trees.', 'ఉడుత "ఉ" తో మొదలవుతుంది. | udutha starts with u.'],
      ['"ఏ" తో మొదలయ్యే బొమ్మ ఏది? | Which picture starts with ఏ?', ['🐘', 'ఏనుగు | elephant'], [['🐫', 'ఒంటె | camel'], ['🐭', 'ఎలుక | rat']], 'పొడవైన తొండం ఉన్న జంతువు. | The animal with a long trunk.', 'ఏనుగు "ఏ" తో మొదలవుతుంది. | eenugu starts with ee.'],
      ['"ఆ" తో మొదలయ్యే బొమ్మ ఏది? | Which picture starts with ఆ?', ['🐄', 'ఆవు | cow'], [['🏠', 'ఇల్లు | house'], ['🐿️', 'ఉడుత | squirrel']], 'మనకు పాలు ఇచ్చే జంతువు. | The animal that gives us milk.', 'ఆవు "ఆ" తో మొదలవుతుంది. | aavu starts with aa.'],
      ['"ఇ" తో మొదలయ్యే బొమ్మ ఏది? | Which picture starts with ఇ?', ['🏠', 'ఇల్లు | house'], [['🐄', 'ఆవు | cow'], ['🐘', 'ఏనుగు | elephant']], 'మనం ఉండే చోటు. | The place where we live.', 'ఇల్లు "ఇ" తో మొదలవుతుంది. | illu starts with i.'],
      ['"ఒ" తో మొదలయ్యే బొమ్మ ఏది? | Which picture starts with ఒ?', ['🐫', 'ఒంటె | camel'], [['🐭', 'ఎలుక | rat'], ['🏠', 'ఇల్లు | house']], 'ఎడారిలో నడిచే మూపురం ఉన్న జంతువు. | The desert animal with a hump.', 'ఒంటె "ఒ" తో మొదలవుతుంది. | onte starts with o.'],
      ['"ఎ" తో మొదలయ్యే బొమ్మ ఏది? | Which picture starts with ఎ?', ['🐭', 'ఎలుక | rat'], [['🐘', 'ఏనుగు | elephant'], ['🐫', 'ఒంటె | camel']], 'చిన్నగా "కీచ్ కీచ్" అనే జంతువు. | The small animal that squeaks.', 'ఎలుక "ఎ" తో మొదలవుతుంది (చిన్న ఎ). | eluka starts with the short e.'],
    ]),
    orderT('row', 'అచ్చులను వరుసలో పెట్టు. | Put the vowels in order.', [
      ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ'], ['ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ'], ['ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ'], ['ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ'], ['ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ'],
    ], 'అచ్చుల పాట పాడుతూ వరుస చెప్పు. | Sing the vowel song to find the order.'),
    tapT('tap', 'అచ్చులను మాత్రమే ఎంచుకో. | Tap only the vowels.', [
      ['అ', true], ['ఈ', true], ['ఉ', true], ['ఏ', true], ['ఓ', true], ['ఐ', true], ['క', false], ['మ', false], ['ర', false], ['త', false], ['ప', false],
    ], 'అ నుండి అః వరకు అచ్చులు; క, మ, ర, త, ప హల్లులు. | అ to అః are vowels; క, మ, ర, త, ప are consonants.'),
  ]),
  o('ready.consonants', 'హల్లులు | Consonants (hallulu)', [
    P('అచ్చుల తర్వాత హల్లులు వస్తాయి: క నుండి ఱ వరకు. ఇవి ఐదేసి గుంపులుగా (వర్గాలుగా) వస్తాయి. | After the vowels come the consonants (hallulu), from క to ఱ, in groups of five.'),
    KEYS('క ఖ గ ఘ ఙ | ka kha ga gha nga', 'చ ఛ జ ఝ ఞ | cha chha ja jha nya', 'ట ఠ డ ఢ ణ | Ta Tha Da Dha Na', 'త థ ద ధ న | ta tha da dha na', 'ప ఫ బ భ మ | pa pha ba bha ma', 'య ర ల వ శ ష స హ ళ క్ష ఱ | ya ra la va sha Sha sa ha La ksha rra'),
    PH('🐒', 'కోతి — "క" కుటుంబం అక్షరంతో మొదలవుతుంది. | Monkey (kothi) starts with a letter of the క family.'),
    TIP('ప్రతి గుంపులో పెదవులు, నాలుక ఒకే చోట ఉంటాయి — అద్దంలో చూసి పలుకు! | In each group your lips and tongue stay in the same place; try it in a mirror!'),
  ], [
    EX('"మల్లె" ఏ హల్లుతో మొదలవుతుంది? | Which consonant does "malle" (jasmine) start with?', ['మ-ల్లె అని పలుకు. | Say ma-lle.', 'మొదటి అక్షరం "మ". | The first letter is మ.'], 'మ'),
    EX('"క ఖ గ ఘ" — తర్వాత ఏది? | క ఖ గ ఘ — what comes next?', ['ఇది "క" గుంపు. | This is the క group.', 'ఐదవ అక్షరం "ఙ". | The fifth letter is ఙ.'], 'ఙ'),
  ], [
    mcq('first', 'పదాన్ని నెమ్మదిగా పలికి మొదటి అక్షరం విను. | Say the word slowly and listen to the first letter.', [
      ['"పడవ" మొదటి అక్షరం ఏది? | First letter of "padava" (boat)?', 'ప', ['బ', 'మ', 'వ'], 'పెదవులు మూసి తెరిచి పలికే అక్షరం. | Close and open your lips.', 'ప-డ-వ: మొదటిది ప. | pa-da-va starts with pa.'],
      ['"గడియారం" మొదటి అక్షరం ఏది? | First letter of "gadiyaaram" (clock)?', 'గ', ['క', 'ఘ', 'డ'], 'గొంతు దగ్గర పలికే "గ". | ga, said in the throat.', 'గ-డి-యా-రం: మొదటిది గ. | It starts with ga.'],
      ['"చేప" మొదటి అక్షరం ఏది? | First letter of "chepa" (fish)?', 'చ', ['జ', 'ప', 'త'], 'చే = చ + ఏ. | che = cha + ee.', 'చేప "చ" తో మొదలవుతుంది. | chepa starts with cha.'],
      ['"తాబేలు" మొదటి అక్షరం ఏది? | First letter of "thaabelu" (tortoise)?', 'త', ['ద', 'ట', 'న'], 'తా = త + ఆ. | thaa = tha + aa.', 'తాబేలు "త" తో మొదలవుతుంది. | It starts with tha.'],
      ['"నెమలి" మొదటి అక్షరం ఏది? | First letter of "nemali" (peacock)?', 'న', ['మ', 'ల', 'ణ'], 'నె = న + ఎ. | ne = na + e.', 'నెమలి "న" తో మొదలవుతుంది. | It starts with na.'],
      ['"బంతి" మొదటి అక్షరం ఏది? | First letter of "banthi" (ball)?', 'బ', ['ప', 'భ', 'వ'], 'బం = బ + సున్న. | bam = ba + am.', 'బంతి "బ" తో మొదలవుతుంది. | It starts with ba.'],
    ]),
    orderT('row', 'హల్లుల గుంపును వరుసలో పెట్టు. | Put the consonant group in order.', [
      ['క', 'ఖ', 'గ', 'ఘ', 'ఙ'], ['చ', 'ఛ', 'జ', 'ఝ', 'ఞ'], ['ట', 'ఠ', 'డ', 'ఢ', 'ణ'], ['త', 'థ', 'ద', 'ధ', 'న'], ['ప', 'ఫ', 'బ', 'భ', 'మ'], ['య', 'ర', 'ల', 'వ', 'శ'],
    ], 'ప్రతి గుంపు ఒక చిన్న పాటలా పాడు. | Sing each group like a little song.'),
    tapT('tap', 'హల్లులను మాత్రమే ఎంచుకో. | Tap only the consonants.', [
      ['క', true], ['చ', true], ['డ', true], ['న', true], ['మ', true], ['స', true], ['అ', false], ['ఈ', false], ['ఊ', false], ['ఐ', false], ['ఔ', false],
    ], 'క నుండి ఱ వరకు హల్లులు; అ, ఈ, ఊ, ఐ, ఔ అచ్చులు. | క to ఱ are consonants; అ, ఈ, ఊ, ఐ, ఔ are vowels.'),
  ]),
  o('ready.story', 'బొమ్మల కథ చెప్పడం | Telling a picture story', [
    P('బొమ్మల కథలో ప్రతి బొమ్మ ఒక సంఘటన చెబుతుంది. బొమ్మలను వరుసగా చూస్తే కథ అర్థమవుతుంది. | In a picture story each picture shows one event. Look at them in order to understand the story.'),
    ...RHYME('చిన్ని విత్తనం (మా కథ) | The tiny seed (our story)', [
      '🌱 మీనా ఒక విత్తనం నాటింది. | Meena planted a seed.',
      '💧 రోజూ నీళ్ళు పోసింది. | She watered it every day.',
      '🌳 మొక్క పెద్దదైంది. | The plant grew big.',
      '🌼 ఒక రోజు అందమైన పూవు పూసింది! | One day a pretty flower bloomed!',
    ]),
    PH('🌼', 'చివరి బొమ్మ: పూవు పూసింది — కథ సంతోషంగా ముగిసింది. | Last picture: the flower bloomed; a happy ending.'),
    TIP('"మొదట… తర్వాత… చివరకు…" అనే పదాలతో కథ చెప్పు. | Use "first… then… at last…" to tell the story.'),
  ], [
    EX('విత్తనం నాటిన తర్వాత మీనా ఏం చేసింది? | What did Meena do after planting the seed?', ['రెండవ బొమ్మ 💧 చూడు. | Look at the second picture 💧.'], 'నీళ్ళు పోసింది | she watered it'),
    EX('కథ చివర ఏమైంది? | What happened at the end?', ['చివరి బొమ్మ 🌼. | The last picture is 🌼.', 'పూవు పూసింది. | A flower bloomed.'], 'పూవు పూసింది | a flower bloomed'),
  ], [
    orderT('seq', 'కథ బొమ్మలను సరైన వరుసలో పెట్టు. | Put the story pictures in order.', [
      ['🌱 విత్తనం | seed', '💧 నీళ్ళు | water', '🌳 మొక్క | plant', '🌼 పూవు | flower'],
      ['🥚 గుడ్డు | egg', '🐔 కోడిపిల్ల | chick', '🐓 కోడి | hen'],
      ['☁️ మబ్బులు | clouds', '🌧️ వాన | rain', '🌈 ఇంద్రధనుస్సు | rainbow'],
      ['🌅 తెల్లవారింది | morning', '🎒 బడికి వెళ్ళాడు | went to school', '📖 చదివాడు | read', '🏠 ఇంటికి వచ్చాడు | came home'],
      ['🍌 అరటిపండు | banana', '🐒 కోతి తిన్నది | monkey ate it', '😢 తొక్క పారేసింది | dropped the peel'],
    ], 'ముందు ఏది జరగాలో ఆలోచించు. | Think: what must happen first?'),
    mcq('next', 'కథలో తర్వాత ఏమి జరుగుతుందో ఊహించు. | Guess what happens next.', [
      ['మబ్బులు కమ్మాయి. తర్వాత ఏమి వస్తుంది? | Clouds gathered. What comes next?', 'వాన | rain', ['ఎండ | sunshine', 'మంచు | snow', 'గాలిపటం | kite'], 'నల్లని మబ్బులు నీటిని తెస్తాయి. | Dark clouds bring water.', 'మబ్బుల తర్వాత వాన పడుతుంది. | Rain falls after the clouds.'],
      ['రవి గుడ్డు చూశాడు. తర్వాత ఏమి వచ్చింది? | Ravi saw an egg. What came out next?', 'కోడిపిల్ల | a chick', ['చేప | a fish', 'పిల్లి | a cat', 'పువ్వు | a flower'], 'కోడిగుడ్డు నుండి వచ్చేది. | It comes out of a hen\'s egg.', 'గుడ్డు నుండి కోడిపిల్ల వస్తుంది. | A chick hatches from the egg.'],
      ['సీత విత్తనం నాటి నీళ్ళు పోసింది. తర్వాత? | Sita planted a seed and watered it. Next?', 'మొక్క మొలిచింది | a plant came up', ['విత్తనం ఎగిరిపోయింది | the seed flew away', 'వాన ఆగింది | the rain stopped', 'పిల్లి వచ్చింది | a cat came'], 'నీళ్ళు తాగి విత్తనం పెరుగుతుంది. | With water the seed grows.', 'విత్తనం నుండి మొక్క మొలుస్తుంది. | A plant grows from the seed.'],
      ['తెల్లవారింది, సూర్యుడు వచ్చాడు. పిల్లలు ఏమి చేస్తారు? | Morning came. What do the children do?', 'లేచి బడికి వెళ్తారు | get up and go to school', ['నిద్రపోతారు | go to sleep', 'చీకట్లో దాక్కుంటారు | hide in the dark', 'చంద్రుణ్ణి చూస్తారు | look at the moon'], 'ఉదయం మనం ఏం చేస్తాం? | What do we do in the morning?', 'ఉదయం లేచి బడికి వెళ్తాం. | In the morning we get up and go to school.'],
      ['గాలిపటం దారం తెగింది. తర్వాత? | The kite string snapped. Next?', 'గాలిపటం ఎగిరిపోయింది | the kite flew away', ['గాలిపటం పాట పాడింది | the kite sang', 'గాలిపటం తిన్నది | the kite ate', 'గాలిపటం పెరిగింది | the kite grew'], 'దారం లేకపోతే గాలిపటాన్ని ఎవరు పట్టుకుంటారు? | Without the string, who holds the kite?', 'దారం తెగితే గాలిపటం గాలిలో ఎగిరిపోతుంది. | Without its string the kite drifts away.'],
    ]),
  ]),
], REVIEW);

// ============================================================ 1. రంగు రంగుల పూలు
const ch1 = unit(1, 'ch1', 'రంగు రంగుల పూలు | Colourful flowers', [
  o('poolu.colours', 'పూలు, రంగులు | Flowers and colours', [
    P('మన చుట్టూ ఎన్నో రంగుల పూలు ఉన్నాయి. ఒక్కో పూవుకు ఒక్కో రంగు, ఒక్కో వాసన. | Around us are flowers of many colours; each has its own colour and smell.'),
    ...RHYME('పూల పాట (మా పాట) | Flower song (our rhyme)', [
      'ఎర్రని మందారం, ఎంతో అందం! | Red hibiscus, so pretty!',
      'పసుపు బంతిపూవు, పండుగ సందడి! | Yellow marigold, festival fun!',
      'తెల్లని మల్లెపూవు, తీయని వాసన! | White jasmine, sweet smell!',
      'రంగుల తోటలో రాజు నేనే! | In the colourful garden, I am the king!',
    ]),
    PH('🌼', 'బంతిపూవు — పసుపు రంగు. పండుగలకు దండలు కడతాం. | Marigold is yellow; we make garlands for festivals.'),
    KEYS('ఎరుపు | red', 'పసుపు | yellow', 'తెలుపు | white', 'నీలం | blue', 'ఆకుపచ్చ | green', 'ఊదా | purple'),
    TIP('పాటలో ప్రతి రంగు పేరు వచ్చినప్పుడు ఆ రంగు వస్తువును చూపించు! | Point to something of that colour each time you sing its name!'),
  ], [
    EX('మల్లెపూవు ఏ రంగులో ఉంటుంది? | What colour is jasmine?', ['పాటలో "తెల్లని మల్లెపూవు" అన్నాం. | The song says "white jasmine".'], 'తెలుపు | white'),
    EX('ఆకులు ఏ రంగు? | What colour are leaves?', ['చెట్టు ఆకులు చూడు 🍃. | Look at the leaves 🍃.'], 'ఆకుపచ్చ | green'),
  ], [
    pic('colour', 'రంగు పేరు గుర్తు చేసుకో. | Remember the colour name.', [
      ['"ఎరుపు" రంగు ఏది? | Which one is red (erupu)?', ['🔴', 'ఎరుపు | red'], [['🟡', 'పసుపు | yellow'], ['🔵', 'నీలం | blue']], 'మందారం పూవు రంగు. | The colour of hibiscus.', '🔴 ఎరుపు. | 🔴 is red.'],
      ['"పసుపు" రంగు ఏది? | Which one is yellow (pasupu)?', ['🟡', 'పసుపు | yellow'], [['🟢', 'ఆకుపచ్చ | green'], ['🟣', 'ఊదా | purple']], 'బంతిపూవు, అరటిపండు రంగు. | The colour of marigold and banana.', '🟡 పసుపు. | 🟡 is yellow.'],
      ['"నీలం" రంగు ఏది? | Which one is blue (neelam)?', ['🔵', 'నీలం | blue'], [['🔴', 'ఎరుపు | red'], ['🟠', 'నారింజ | orange']], 'ఎండ రోజు ఆకాశం రంగు. | The colour of the sky on a sunny day.', '🔵 నీలం. | 🔵 is blue.'],
      ['"ఆకుపచ్చ" రంగు ఏది? | Which one is green (aakupachcha)?', ['🟢', 'ఆకుపచ్చ | green'], [['🟡', 'పసుపు | yellow'], ['⬛', 'నలుపు | black']], 'చెట్ల ఆకుల రంగు. | The colour of leaves.', '🟢 ఆకుపచ్చ. | 🟢 is green.'],
      ['"తెలుపు" రంగు ఏది? | Which one is white (thelupu)?', ['⬜', 'తెలుపు | white'], [['⬛', 'నలుపు | black'], ['🟣', 'ఊదా | purple']], 'పాలు, మల్లెపూల రంగు. | The colour of milk and jasmine.', '⬜ తెలుపు. | ⬜ is white.'],
      ['"ఊదా" రంగు ఏది? | Which one is purple (uudaa)?', ['🟣', 'ఊదా | purple'], [['🔵', 'నీలం | blue'], ['🔴', 'ఎరుపు | red']], 'వంకాయ రంగు 🍆. | The colour of a brinjal 🍆.', '🟣 ఊదా. | 🟣 is purple.'],
    ]),
    matchT('match', 'వస్తువును దాని రంగుతో కలుపు | Match each thing to its colour', [
      ['మందారం | hibiscus', 'ఎరుపు | red'], ['మల్లె | jasmine', 'తెలుపు | white'], ['బంతిపూవు | marigold', 'పసుపు | yellow'],
      ['ఆకు | leaf', 'ఆకుపచ్చ | green'], ['ఆకాశం | sky', 'నీలం | blue'], ['వంకాయ | brinjal', 'ఊదా | purple'],
    ], 'ప్రతి వస్తువును మనసులో చూసి రంగు చెప్పు. | Picture each thing in your mind and say its colour.'),
  ]),
  o('poolu.letters', 'అక్షరాల పునశ్చరణ | Revising the letters', [
    P('పూల పేర్లలో అచ్చులు, హల్లులు రెండూ ఉంటాయి. పేరు మొదట వచ్చే అక్షరం కనుక్కుందాం. | Flower names use vowels and consonants. Let us find the first letter of each name.'),
    KEYS('మందారం → మ | mandaaram → ma', 'బంతి → బ | banthi → ba', 'గులాబీ → గ | gulaabi → ga', 'తామర → త | thaamara → tha', 'అరటి → అ | arati → a'),
    PH('🌸', 'తామర పూవు చెరువులో పూస్తుంది. "త" తో మొదలవుతుంది. | The lotus (thaamara) blooms in ponds; it starts with త.'),
    TIP('వర్ణమాల పాడుతూ ఆ అక్షరం ఎక్కడ వస్తుందో చూడు. | Sing the alphabet and see where the letter comes.'),
  ], [
    EX('"గులాబీ" మొదటి అక్షరం? | First letter of "gulaabi" (rose)?', ['గు = గ + ఉ. | gu = ga + u.', 'కాబట్టి మొదటి హల్లు "గ". | So the first consonant is ga.'], 'గ'),
    EX('"క, ఖ, __, ఘ" ఖాళీలో ఏ అక్షరం? | క, ఖ, __, ఘ — which letter is missing?', ['క గుంపు: క ఖ గ ఘ ఙ. | The క group: క ఖ గ ఘ ఙ.'], 'గ'),
  ], [
    mcq('missing', 'వర్ణమాల వరుస గుర్తు చేసుకో. | Remember the alphabet order.', [
      ['అ, ఆ, __, ఈ — ఖాళీలో ఏది? | అ, ఆ, __, ఈ — what is missing?', 'ఇ', ['ఉ', 'ఎ', 'ఒ'], 'ఆ తర్వాత చిన్న "ఇ". | After ఆ comes short ఇ.', 'అ ఆ ఇ ఈ. | a aa i ii.'],
      ['చ, ఛ, __, ఝ — ఖాళీలో ఏది? | చ, ఛ, __, ఝ — what is missing?', 'జ', ['గ', 'డ', 'ద'], 'చ గుంపులో మూడవది. | The third letter of the చ group.', 'చ ఛ జ ఝ ఞ. | cha chha ja jha nya.'],
      ['త, థ, ద, __ — ఖాళీలో ఏది? | త, థ, ద, __ — what is missing?', 'ధ', ['డ', 'న', 'బ'], 'ద కు వత్తి పలికే అక్షరం. | The strong (breathy) form of ద.', 'త థ ద ధ న. | tha thha da dha na.'],
      ['ప, __, బ, భ — ఖాళీలో ఏది? | ప, __, బ, భ — what is missing?', 'ఫ', ['మ', 'వ', 'భ'], 'ప కు గాలి ఎక్కువ ఊదితే… | ప with more breath…', 'ప ఫ బ భ మ. | pa pha ba bha ma.'],
      ['ఎ, ఏ, __, ఒ — ఖాళీలో ఏది? | ఎ, ఏ, __, ఒ — what is missing?', 'ఐ', ['ఔ', 'ఓ', 'ఊ'], '"ఐదు" మొదటి అక్షరం. | The first letter of "aidu" (five).', 'ఎ ఏ ఐ ఒ ఓ ఔ. | e ee ai o oo au.'],
      ['య, ర, __, వ — ఖాళీలో ఏది? | య, ర, __, వ — what is missing?', 'ల', ['శ', 'స', 'హ'], '"లడ్డు" మొదటి అక్షరం. | The first letter of "laddu".', 'య ర ల వ శ ష స హ. | ya ra la va sha Sha sa ha.'],
    ]),
    tapT('tap', '"మ" తో మొదలయ్యే పదాలను ఎంచుకో. | Tap the words that start with మ.', [
      ['మందారం | hibiscus', true], ['మల్లె | jasmine', true], ['మామిడి | mango', true], ['మేక | goat', true], ['మబ్బు | cloud', true],
      ['బంతి | marigold', false], ['గులాబీ | rose', false], ['తామర | lotus', false], ['పసుపు | yellow', false], ['నీలం | blue', false],
    ], 'పదం పలకగానే పెదవులు మూసుకుంటే "మ" కావచ్చు. | If your lips close as you start, it may be మ.'),
  ]),
  o('poolu.read', 'చిన్న వాక్యం చదవడం | Reading a short sentence', [
    P('పదాలు కలిస్తే వాక్యం అవుతుంది. వాక్యం చివర చుక్క (.) పెడతాం. | Words join to make a sentence. A sentence ends with a full stop (.)'),
    ...RHYME('చదువుదాం | Let us read', ['మల్లె తెల్లగా ఉంది. | The jasmine is white.', 'మందారం ఎర్రగా ఉంది. | The hibiscus is red.', 'తోట అందంగా ఉంది. | The garden is beautiful.']),
    PH('🌳', 'తోట — చెట్లు, పూలు ఉండే చోటు. | A garden: a place with trees and flowers.'),
    TIP('ఒక్కో పదం మీద వేలు పెట్టి చదువు. | Put your finger under each word as you read.'),
  ], [
    EX('"మల్లె తెల్లగా ఉంది." — ఇందులో ఎన్ని పదాలు? | How many words in "malle thellagaa undi."?', ['మల్లె / తెల్లగా / ఉంది | malle / thellagaa / undi'], '3'),
    EX('"మందారం ఎర్రగా ఉంది." — పూవు రంగు ఏది? | What colour is the flower?', ['"ఎర్రగా" అంటే ఎరుపు రంగులో. | "erragaa" means red.'], 'ఎరుపు | red'),
  ], [
    orderT('sent', 'పదాలను సరైన వరుసలో పెట్టి వాక్యం చేయి. | Put the words in order to make the sentence.', [
      ['మల్లె | jasmine', 'తెల్లగా | white', 'ఉంది. | is.'], ['మందారం | hibiscus', 'ఎర్రగా | red', 'ఉంది. | is.'],
      ['తోట | garden', 'అందంగా | beautiful', 'ఉంది. | is.'], ['నేను | I', 'పూలు | flowers', 'కోశాను. | picked.'],
      ['అమ్మ | mother', 'దండ | garland', 'కట్టింది. | tied.'],
    ], 'ఎవరు / ఏది ముందు, ఏం చేశారో చివర. | Who or what comes first; the action word comes last.'),
    mcq('read', 'వాక్యం మళ్ళీ చదువు. | Read the sentence again.', [
      ['"బంతిపూవు పసుపుగా ఉంది." పూవు రంగు? | "The marigold is yellow." Its colour?', 'పసుపు | yellow', ['ఎరుపు | red', 'నీలం | blue', 'తెలుపు | white'], '"పసుపుగా" పదం చూడు. | Look at "pasupugaa".', 'బంతిపూవు పసుపు రంగు. | The marigold is yellow.'],
      ['"అమ్మ మల్లెల దండ కట్టింది." ఎవరు కట్టారు? | "Mother tied a jasmine garland." Who tied it?', 'అమ్మ | mother', ['నాన్న | father', 'అక్క | sister', 'తాత | grandpa'], 'వాక్యంలో మొదటి పదం. | The first word.', 'అమ్మ దండ కట్టింది. | Mother tied it.'],
      ['"తామర చెరువులో పూసింది." తామర ఎక్కడ పూసింది? | "The lotus bloomed in the pond." Where?', 'చెరువులో | in the pond', ['చెట్టు మీద | on a tree', 'ఇంట్లో | in the house', 'బడిలో | at school'], '"చెరువులో" పదం చూడు. | Look at "cheruvulo".', 'తామర చెరువులో పూస్తుంది. | Lotus blooms in a pond.'],
      ['"సీత గులాబీ కోసింది." సీత ఏం కోసింది? | "Sita picked a rose." What did she pick?', 'గులాబీ | rose', ['మల్లె | jasmine', 'బంతి | marigold', 'మామిడి | mango'], 'రెండవ పదం చూడు. | Look at the second word.', 'సీత గులాబీ కోసింది. | Sita picked a rose.'],
      ['"తోటలో ఆరు పూలు ఉన్నాయి." ఎన్ని పూలు? | "There are six flowers in the garden." How many?', 'ఆరు | six', ['రెండు | two', 'పది | ten', 'ఒకటి | one'], '"ఆరు" అంటే 6. | "aaru" means 6.', 'ఆరు పూలు ఉన్నాయి. | Six flowers.'],
    ]),
  ]),
], REVIEW);

// ============================================================ 2. బతుకమ్మ పేరుద్దాం!
const ch2 = unit(2, 'ch2', 'బతుకమ్మ పేరుద్దాం! | Let us arrange the Bathukamma!', [
  o('perchu.theme', 'బతుకమ్మ పూల పండుగ | Bathukamma, the flower festival', [
    P('బతుకమ్మ తెలంగాణ పూల పండుగ. పెద్ద పళ్ళెంలో (తాంబాళంలో) పూలను గుండ్రంగా, పై పైకి వరుసలుగా పేర్చి గోపురంలా చేస్తారు. | Bathukamma is Telangana\'s flower festival. Flowers are stacked in round layers on a big plate, rising like a temple tower.'),
    KEYS('తంగేడు పూలు — పసుపు | tangedu flowers: yellow', 'గునుగు పూలు — రంగులు అద్దుతారు | gunugu flowers: dyed in colours', 'బంతి, చామంతి | marigold, chrysanthemum', 'గుమ్మడి పూవు — పైన పెడతారు | pumpkin flower: placed on top'),
    ...RHYME('పేర్చే పాట (మా పాట) | Stacking song (our rhyme)', [
      'ఒక వరుస తంగేడు, పసుపు పసుపు! | One row of tangedu, yellow, yellow!',
      'రెండో వరుస గునుగు, రంగు రంగు! | Second row of gunugu, colour, colour!',
      'పైన గుమ్మడి పూవు, గౌరమ్మ నవ్వు! | Pumpkin flower on top, Gowramma smiles!',
    ]),
    PH('🌼', 'తంగేడు పూలు బతుకమ్మకు ముఖ్యమైనవి. | Tangedu flowers are special for Bathukamma.'),
    TIP('పాట పాడుతూ ఒక్కో వరుసకు ఒక్కో చప్పట్లు కొట్టు. | Clap once for each row as you sing.'),
  ], [
    EX('బతుకమ్మను దేనిలో పేరుస్తారు? | What is the Bathukamma stacked on?', ['పెద్ద పళ్ళెం — తాంబాళం. | A big plate called thaambaalam.'], 'తాంబాళం | big plate'),
    EX('బతుకమ్మ పైన ఏమి పెడతారు? | What is placed on top?', ['పాటలో: "పైన గుమ్మడి పూవు". | The song says pumpkin flower on top.'], 'గుమ్మడి పూవు | pumpkin flower'),
  ], [
    mcq('theme', 'బతుకమ్మ పండుగ గురించి ఆలోచించు. | Think about the Bathukamma festival.', [
      ['బతుకమ్మ ఏ పండుగ? | What kind of festival is Bathukamma?', 'పూల పండుగ | flower festival', ['గాలిపటాల పండుగ | kite festival', 'దీపాల పండుగ | lamp festival', 'రంగుల పండుగ | festival of colour powder'], 'దాన్ని పూలతో పేరుస్తారు. | It is made of flowers.', 'బతుకమ్మ పూల పండుగ. | Bathukamma is a flower festival.'],
      ['బతుకమ్మ ఏ రాష్ట్రపు పండుగ? | Bathukamma belongs to which state?', 'తెలంగాణ | Telangana', ['కేరళ | Kerala', 'పంజాబ్ | Punjab', 'అస్సాం | Assam'], 'మన రాష్ట్రమే! | It is our own state!', 'బతుకమ్మ తెలంగాణ పండుగ. | It is a Telangana festival.'],
      ['తంగేడు పూలు ఏ రంగు? | What colour are tangedu flowers?', 'పసుపు | yellow', ['నీలం | blue', 'నలుపు | black', 'ఊదా | purple'], 'పాటలో "పసుపు పసుపు" అన్నాం. | The song said yellow, yellow.', 'తంగేడు పూలు పసుపు. | Tangedu flowers are yellow.'],
      ['బతుకమ్మ ఆకారం ఎలా ఉంటుంది? | What shape is a Bathukamma?', 'గోపురంలా | like a tower', ['చతురస్రంలా | like a square', 'చదునుగా | flat', 'గాలిపటంలా | like a kite'], 'కింద వెడల్పు, పైన సన్నగా. | Wide at the bottom, narrow at the top.', 'బతుకమ్మ గుడి గోపురంలా ఉంటుంది. | It looks like a temple tower.'],
      ['బతుకమ్మను పేర్చేది ఎవరు? | Who usually stacks the Bathukamma?', 'అమ్మలు, అక్కలు | mothers and sisters', ['పోస్ట్‌మ్యాన్ | the postman', 'ఏనుగు | an elephant', 'పక్షులు | birds'], 'ఇంట్లో అందరూ సాయం చేస్తారు. | Everyone at home helps.', 'అమ్మలు, అక్కలు ప్రేమతో పేరుస్తారు. | Mothers and sisters stack it with love.'],
    ]),
    orderT('stack', 'బతుకమ్మను కింద నుండి పైకి పేర్చు. | Stack the Bathukamma from bottom to top.', [
      ['తాంబాళం | plate', 'తంగేడు | tangedu', 'గునుగు | gunugu', 'గుమ్మడి పూవు | pumpkin flower'],
      ['ఆకులు | leaves', 'బంతి | marigold', 'చామంతి | chrysanthemum', 'గౌరమ్మ | Gowramma'],
      ['తాంబాళం | plate', 'ఆకులు | leaves', 'పూలు | flowers', 'గౌరమ్మ | Gowramma'],
    ], 'పళ్ళెం ఎప్పుడూ అడుగున; గౌరమ్మ / గుమ్మడి పూవు పైన. | The plate is always at the bottom; Gowramma or the pumpkin flower is on top.'),
  ]),
  o('perchu.letters', 'హల్లుల పునశ్చరణ: పదాలలో అక్షరాలు | Revising consonants in words', [
    P('బతుకమ్మ పదాలలో హల్లులు ఎన్నో ఉన్నాయి: బ-తు-క-మ్మ. ఒక్కో ముక్కను అక్షరం అంటాం. | Bathukamma words are full of consonants: ba-thu-ka-mma. Each part is a letter (akshara).'),
    KEYS('బతుకమ్మ = బ + తు + క + మ్మ | 4 parts', 'పూలు = పూ + లు | 2 parts', 'తంగేడు = తం + గే + డు | 3 parts'),
    PH('🧺', 'బుట్టలో పూలు — బు + ట్ట. | Flowers in a basket (butta).'),
    TIP('ప్రతి ముక్కకు ఒక చప్పట్లు కొట్టు; చప్పట్లు లెక్కపెడితే ఎన్ని అక్షరాలో తెలుస్తుంది. | Clap once per part; count the claps to know how many letters.'),
  ], [
    EX('"పూలు" లో ఎన్ని అక్షరాలు? | How many letters (parts) in "poolu"?', ['పూ / లు — రెండు చప్పట్లు. | poo / lu: two claps.'], '2'),
    EX('పా, ట — ఈ ముక్కలు కలిపితే? | Join పా and ట.', ['పా + ట = పాట. | paa + ta = paata.', 'పాట అంటే పాడేది. | paata means song.'], 'పాట | song'),
  ], [
    mcq('claps', 'ప్రతి ముక్కకు ఒక చప్పట్లు. | One clap for each part.', [
      ['"బతుకమ్మ" లో ఎన్ని ముక్కలు? | How many parts in "bathukamma"?', '4', ['2', '3', '5'], 'బ-తు-క-మ్మ. | ba-thu-ka-mma.', 'బ + తు + క + మ్మ = 4. | four parts.'],
      ['"పూలు" లో ఎన్ని ముక్కలు? | How many parts in "poolu"?', '2', ['1', '3', '4'], 'పూ-లు. | poo-lu.', 'పూ + లు = 2. | two parts.'],
      ['"తంగేడు" లో ఎన్ని ముక్కలు? | How many parts in "tangedu"?', '3', ['2', '4', '5'], 'తం-గే-డు. | tam-ge-du.', 'తం + గే + డు = 3. | three parts.'],
      ['"పండుగ" లో ఎన్ని ముక్కలు? | How many parts in "panduga"?', '3', ['2', '4', '1'], 'పం-డు-గ. | pam-du-ga.', 'పం + డు + గ = 3. | three parts.'],
      ['"తాంబాళం" లో ఎన్ని ముక్కలు? | How many parts in "thaambaalam"?', '3', ['2', '4', '5'], 'తాం-బా-ళం. | thaam-baa-Lam.', 'తాం + బా + ళం = 3. | three parts.'],
      ['"గౌరమ్మ" లో ఎన్ని ముక్కలు? | How many parts in "gowramma"?', '3', ['2', '4', '5'], 'గౌ-ర-మ్మ. | gow-ra-mma.', 'గౌ + ర + మ్మ = 3. | three parts.'],
    ]),
    orderT('build', 'ముక్కలను కలిపి పదం చేయి. | Join the parts to make the word.', [
      ['బ', 'తు', 'క', 'మ్మ'], ['తం', 'గే', 'డు'], ['పం', 'డు', 'గ'], ['తాం', 'బా', 'ళం'], ['గు', 'ను', 'గు | gunugu'], ['చా', 'మం', 'తి'],
    ], 'పదాన్ని పలికి మొదటి ముక్క ఏదో విను. | Say the word and listen for the first part.'),
  ]),
  o('perchu.read', 'చదువుదాం: బతుకమ్మ వాక్యాలు | Reading Bathukamma sentences', [
    P('ఈ చిన్న కథ చదువు. | Read this tiny story.'),
    ...RHYME('కావ్య బతుకమ్మ (మా కథ) | Kavya\'s Bathukamma (our story)', [
      'కావ్య తోటకు వెళ్ళింది. | Kavya went to the garden.',
      'తంగేడు పూలు కోసింది. | She picked tangedu flowers.',
      'అమ్మతో బతుకమ్మ పేర్చింది. | She stacked the Bathukamma with mother.',
      'బతుకమ్మ బంగారంలా మెరిసింది! | The Bathukamma shone like gold!',
    ]),
    PH('👧', 'కావ్య సంతోషంగా ఉంది. | Kavya is happy.'),
    TIP('"ఎవరు? ఏమి? ఎక్కడ?" అని అడుగుతూ చదువు. | Ask "who? what? where?" while you read.'),
  ], [
    EX('కావ్య ఏ పూలు కోసింది? | Which flowers did Kavya pick?', ['రెండవ వాక్యం చూడు. | See the second sentence.'], 'తంగేడు పూలు | tangedu flowers'),
    EX('కావ్య ఎవరితో బతుకమ్మ పేర్చింది? | With whom did Kavya stack it?', ['మూడవ వాక్యం: "అమ్మతో". | Third sentence: "with mother".'], 'అమ్మతో | with mother'),
  ], [
    mcq('story', 'కథను మళ్ళీ చదువు. | Read the story again.', [
      ['కావ్య ఎక్కడికి వెళ్ళింది? | Where did Kavya go?', 'తోటకు | to the garden', ['బడికి | to school', 'బజారుకు | to the market', 'నదికి | to the river'], 'మొదటి వాక్యం. | The first sentence.', 'కావ్య తోటకు వెళ్ళింది. | Kavya went to the garden.'],
      ['కావ్య ఏమి కోసింది? | What did Kavya pick?', 'తంగేడు పూలు | tangedu flowers', ['మామిడి పండ్లు | mangoes', 'ఆకులు | leaves', 'కూరగాయలు | vegetables'], 'రెండవ వాక్యం. | The second sentence.', 'ఆమె తంగేడు పూలు కోసింది. | She picked tangedu flowers.'],
      ['బతుకమ్మ దేనిలా మెరిసింది? | The Bathukamma shone like what?', 'బంగారంలా | like gold', ['నీళ్ళలా | like water', 'మబ్బులా | like a cloud', 'చీకటిలా | like the dark'], 'చివరి వాక్యం. | The last sentence.', 'పసుపు పూలు బంగారంలా మెరుస్తాయి. | Yellow flowers shine like gold.'],
      ['కావ్యకు సాయం చేసింది ఎవరు? | Who helped Kavya?', 'అమ్మ | mother', ['తాత | grandfather', 'టీచర్ | teacher', 'కుక్క | dog'], '"అమ్మతో" అనే పదం. | The word "ammatho".', 'అమ్మ సాయం చేసింది. | Mother helped.'],
      ['ఈ కథ ఏ పండుగ గురించి? | Which festival is this story about?', 'బతుకమ్మ | Bathukamma', ['దీపావళి | Deepavali', 'సంక్రాంతి | Sankranti', 'ఉగాది | Ugadi'], 'పూలతో పేర్చే పండుగ. | The festival of stacked flowers.', 'కథ బతుకమ్మ గురించి. | It is about Bathukamma.'],
    ]),
    orderT('sent', 'పదాలను వరుసలో పెట్టి వాక్యం చేయి. | Put the words in order to make the sentence.', [
      ['కావ్య | Kavya', 'తోటకు | to the garden', 'వెళ్ళింది. | went.'], ['అమ్మ | mother', 'పూలు | flowers', 'పేర్చింది. | stacked.'],
      ['బతుకమ్మ | Bathukamma', 'బంగారంలా | like gold', 'మెరిసింది. | shone.'], ['మేము | we', 'పండుగ | festival', 'చేశాము. | celebrated.'],
    ], 'ఎవరు ముందు, చేసిన పని చివర. | Who comes first; what they did comes last.'),
  ]),
], REVIEW);

// ============================================================ 3. బతుకమ్మ ఆడుదాం! — guninthalu set 1
const G1 = ['క', 'గ', 'చ', 'జ', 'ట', 'డ', 'త', 'ద', 'న', 'ప', 'బ', 'మ', 'ర', 'ల', 'వ', 'స'];
const ch3 = unit(3, 'ch3', 'బతుకమ్మ ఆడుదాం! | Let us play Bathukamma!', [
  o('aadu.theme', 'ఆటా పాటా: బతుకమ్మ చుట్టూ | Song and dance around the Bathukamma', [
    P('సాయంత్రం అందరూ బతుకమ్మను మధ్యలో పెట్టి, చుట్టూ గుండ్రంగా తిరుగుతూ, చప్పట్లు కొడుతూ పాడతారు. | In the evening everyone places the Bathukamma in the middle, walks round it in a circle, claps and sings.'),
    ...RHYME('చప్పట్ల పాట — "ఉయ్యాలో" తో పాడు! | Clapping song — sing it with "uyyaalo"!', [
      'చుట్టూ చుట్టూ తిరుగుదాం ఉయ్యాలో | Round and round we go, uyyaalo',
      'చప్పట్లు కొట్టి పాడుదాం ఉయ్యాలో | Clap and sing, uyyaalo',
      'వంగి లేచి ఆడుదాం ఉయ్యాలో | Bend and rise and dance, uyyaalo',
    ]),
    PH('👐', 'చప్పట్లు — ఒకటి వంగి, ఒకటి లేచి! | Claps: one bending down, one standing up!'),
    TIP('"ఉయ్యాలో" అనే మాట పాత జానపద బతుకమ్మ పాటల్లో వచ్చే పల్లవి. | "Uyyaalo" is a refrain from old folk Bathukamma songs.'),
  ], [
    EX('బతుకమ్మ ఆటలో అందరూ ఎలా తిరుగుతారు? | How do people move in the Bathukamma dance?', ['బతుకమ్మ మధ్యలో ఉంటుంది. | The Bathukamma is in the middle.', 'అందరూ దాని చుట్టూ గుండ్రంగా. | Everyone goes round it in a circle.'], 'గుండ్రంగా | in a circle'),
    EX('పాటలో పదే పదే వచ్చే మాట ఏది? | Which word repeats in the song?', ['ప్రతి వరుస చివర "ఉయ్యాలో". | Each line ends with "uyyaalo".'], 'ఉయ్యాలో'),
  ], [
    mcq('theme', 'ఆట ఎలా ఆడతారో ఊహించు. | Picture how the game is played.', [
      ['బతుకమ్మ ఆట ఎప్పుడు ఆడతారు? | When is the Bathukamma dance played?', 'సాయంత్రం | in the evening', ['అర్ధరాత్రి | at midnight', 'బడి సమయంలో | in school hours', 'వానలో మాత్రమే | only in rain'], 'పని అయిపోయాక, చల్లని వేళ. | After work, in the cool hours.', 'సాయంత్రం అందరూ కలిసి ఆడతారు. | Everyone plays together in the evening.'],
      ['ఆటలో చేతులతో ఏం చేస్తారు? | What do they do with their hands?', 'చప్పట్లు కొడతారు | clap', ['బంతి విసురుతారు | throw a ball', 'రాస్తారు | write', 'వంట చేస్తారు | cook'], 'పాటలో చెప్పాం. | The song says it.', 'చప్పట్లు కొడుతూ పాడతారు. | They clap and sing.'],
      ['బతుకమ్మను ఎక్కడ పెడతారు? | Where is the Bathukamma placed?', 'మధ్యలో | in the middle', ['చెట్టు మీద | on a tree', 'బస్సులో | in a bus', 'బీరువాలో | in a cupboard'], 'అందరూ దాని చుట్టూ తిరుగుతారు. | Everyone circles it.', 'బతుకమ్మ మధ్యలో, మనం చుట్టూ. | It is in the middle; we go round it.'],
      ['ఈ ఆట ఎలాంటిది? | What kind of game is this?', 'అందరూ కలిసి ఆడే ఆట | a game everyone plays together', ['ఒంటరిగా ఆడే ఆట | a game played alone', 'కంప్యూటర్ ఆట | a computer game', 'నీటి ఆట | a water game'], 'చాలా మంది గుండ్రంగా నిలబడతారు. | Many people stand in a circle.', 'బతుకమ్మ అందరూ కలిసి ఆడే ఆట. | It is played together.'],
      ['పాటలో "వంగి లేచి" అంటే ఏం చేస్తాం? | In the song, what does "vangi lechi" ask us to do?', 'వంగి, మళ్ళీ నిలబడటం | bend down, then stand up', ['పరుగెత్తడం | run', 'కూర్చోవడం | sit', 'నిద్రపోవడం | sleep'], 'వంగు = bend, లే = rise. | vangu = bend, le = rise.', 'వంగి లేచి చప్పట్లు కొడతాం. | We bend and rise while clapping.'],
    ]),
    orderT('song', 'పాట వరుసలను సరైన క్రమంలో పెట్టు. | Put the song lines in order.', [
      ['చుట్టూ తిరుగుదాం | go round', 'చప్పట్లు కొడదాం | clap', 'వంగి లేచి ఆడుదాం | bend, rise, dance'],
      ['పూలు కోద్దాం | pick flowers', 'బతుకమ్మ పేర్చుదాం | stack Bathukamma', 'చుట్టూ ఆడుదాం | dance around'],
      ['సాయంత్రం అయింది | evening came', 'అందరూ వచ్చారు | everyone came', 'ఆట మొదలైంది | the dance began'],
    ], 'ముందు జరిగేది ఏది? | What happens first?'),
  ]),
  o('aadu.gunintham', 'గుణింతాలు-1: ా ి ీ ు ూ | Vowel signs 1: aa, i, ii, u, uu', [
    P('హల్లుకు అచ్చు చేరితే దాని గుర్తు (గుణింతం) హల్లుకు అతుక్కుంటుంది. | When a vowel joins a consonant, its sign (gunintham) sticks to the consonant.'),
    KEYS('ఆ → ◌ా దీర్ఘం: క → కా | aa sign: ka → kaa', 'ఇ → ◌ి గుడి: క → కి | i sign: ka → ki', 'ఈ → ◌ీ గుడి దీర్ఘం: క → కీ | ii sign: ka → kii', 'ఉ → ◌ు కొమ్ము: క → కు | u sign: ka → ku', 'ఊ → ◌ూ కొమ్ము దీర్ఘం: క → కూ | uu sign: ka → kuu'),
    ...RHYME('గుణింతం పాట | Gunintham chant', ['క కా కి కీ కు కూ — కప్ప దూకింది! | ka kaa ki kii ku kuu, the frog jumped!', 'మ మా మి మీ ము మూ — మామిడి తిందాం! | ma maa mi mii mu muu, let us eat mango!']),
    PH('🐸', 'కప్ప — "క" తో మొదలవుతుంది. | Frog (kappa) begins with ka.'),
    TIP('చిన్న ధ్వనికి చిన్న గుర్తు, పొడవైన ధ్వనికి "దీర్ఘం" జత. | A short sound has a small sign; a long sound adds the "long" part.'),
  ], [
    EX('మ + ఆ = ? | ma + aa = ?', ['ఆ గుర్తు దీర్ఘం ◌ా. | The aa sign is ◌ా.', 'మ + ◌ా = మా. | ma + ◌ా = maa.'], 'మా | maa'),
    EX('"పీ" లో ఏ గుర్తు? | Which sign is in "pii"?', ['పీ = ప + ఈ. | pii = pa + ii.', 'ఈ గుర్తు గుడి దీర్ఘం ◌ీ. | The ii sign is ◌ీ.'], 'గుడి దీర్ఘం | ii sign'),
  ], [
    gunJoin('join', G1, SET1),
    gunSign('sign', G1, SET1),
    gunRow('row', G1, SET1),
    blankT('fill', ['మా-[మి]-డి|mango|🥭', '[కు]-క్క|dog|🐶', '[పూ]-వు|flower|🌼', 'అ-ర-[టి]|banana|🍌', '[చీ]-మ|ant|🐜', 'కో-[తి]|monkey|🐒', '[గా]-లి-ప-టం|kite|🪁', '[మీ]-సం|moustache|👨', 'ఉ-[డు]-త|squirrel|🐿️'], signAlts(SET1), 'బొమ్మ పేరు పలికి ఖాళీలో ఏ ధ్వని ఉందో విను. | Say the picture name and listen for the missing sound.'),
  ]),
  o('aadu.read', 'చదువుదాం: గుణింతాల పదాలు | Reading words with vowel signs', [
    P('ఇప్పుడు గుణింతాలున్న పదాలతో వాక్యాలు చదువుదాం. | Now let us read sentences with vowel-sign words.'),
    ...RHYME('చదువుదాం | Let us read', ['పాప పాట పాడింది. | The little girl sang a song.', 'కుక్క కూత వినింది. | The dog heard a call.', 'మీనా మామిడి తినింది. | Meena ate a mango.']),
    PH('🥭', 'మామిడి = మా + మి + డి. | maamidi = maa + mi + di.'),
    TIP('గుర్తు చూసి ధ్వని పొడవుగానా, పొట్టిగానా అని నిర్ణయించు. | Look at the sign to decide: long sound or short?'),
  ], [
    EX('"పాట" లో ఎన్ని అక్షరాలు? | How many letters in "paata"?', ['పా + ట. | paa + ta.'], '2'),
    EX('"మీనా మామిడి తినింది." — మీనా ఏం తినింది? | What did Meena eat?', ['"మామిడి" పదం చూడు. | Look at "maamidi".'], 'మామిడి | mango'),
  ], [
    mcq('read', 'పదాన్ని గుర్తుల సాయంతో చదువు. | Read the word using the signs.', [
      ['"పాప పాట పాడింది." పాప ఏం పాడింది? | What did the little girl sing?', 'పాట | a song', ['బంతి | a ball', 'పూవు | a flower', 'కప్ప | a frog'], '"పాట" అంటే song. | "paata" means song.', 'పాప పాట పాడింది. | She sang a song.'],
      ['ఏ పదం మొదటి అక్షరంలో "ఈ" గుర్తు (◌ీ) ఉంది? | Which word has the ii sign (◌ీ) in its first letter?', 'చీమ | ant', ['చిలుక | parrot', 'చేప | fish', 'చాప | mat'], 'పొడవైన "ఈ" ధ్వని వెతుకు. | Look for the long ii sound.', 'చీ = చ + ఈ. | chii = cha + ii.'],
      ['ఏ పదం మొదటి అక్షరంలో "ఉ" గుర్తు (◌ు) ఉంది? | Which word has the u sign (◌ు) in its first letter?', 'పులి | tiger', ['పాము | snake', 'పీట | stool', 'పడవ | boat'], 'మొదటి అక్షరం చూడు. | Look at the first letter.', 'పు = ప + ఉ. | pu = pa + u.'],
      ['ఏ పదం మొదటి అక్షరంలో "ఆ" గుర్తు (◌ా) ఉంది? | Which word has the aa sign (◌ా) in its first letter?', 'కాకి | crow', ['కిటికీ | window', 'కుండ | pot', 'కలం | pen'], 'పొడవైన "ఆ" ధ్వని. | The long aa sound.', 'కా = క + ఆ. | kaa = ka + aa.'],
      ['ఏ పదం మొదటి అక్షరంలో "ఊ" గుర్తు (◌ూ) ఉంది? | Which word has the uu sign (◌ూ) in its first letter?', 'పూవు | flower', ['పెట్టె | box', 'పిల్లి | cat', 'పాము | snake'], 'పొడవైన "ఊ". | The long uu.', 'పూ = ప + ఊ. | puu = pa + uu.'],
    ]),
    orderT('sent', 'పదాలను వరుసలో పెట్టి వాక్యం చేయి. | Put the words in order to make the sentence.', [
      ['పాప | little girl', 'పాట | song', 'పాడింది. | sang.'], ['మీనా | Meena', 'మామిడి | mango', 'తినింది. | ate.'],
      ['కోతి | monkey', 'చెట్టు | tree', 'ఎక్కింది. | climbed.'], ['చీమ | ant', 'బియ్యం | rice', 'మోసింది. | carried.'],
    ], 'ఎవరు ముందు, పని చివర. | Who first, action last.'),
  ]),
], REVIEW);

// ============================================================ 4. బతుకమ్మలెత్తుదాం! — guninthalu set 2
const G2 = ['క', 'గ', 'చ', 'జ', 'త', 'ద', 'న', 'ప', 'బ', 'మ', 'వ', 'స', 'హ'];
const ch4 = unit(4, 'ch4', 'బతుకమ్మలెత్తుదాం! | Let us lift the Bathukammas!', [
  o('ettu.theme', 'బతుకమ్మను చెరువుకు తీసుకెళ్ళడం | Carrying the Bathukamma to the pond', [
    P('ఆట అయ్యాక అమ్మలు బతుకమ్మలను తల మీద ఎత్తుకొని, పాటలు పాడుతూ ఊరి చెరువు దగ్గరకు నడుస్తారు. | After the dance, mothers lift the Bathukammas onto their heads and walk singing to the village pond.'),
    ...RHYME('ఎత్తుదాం పాట (మా పాట) | Lifting song (our rhyme)', [
      'ఎత్తుదాం ఎత్తుదాం బతుకమ్మను | Lift it up, lift the Bathukamma',
      'నడుద్దాం నడుద్దాం చెరువు దాకా | Walk, walk, all the way to the pond',
      'నీళ్ళ మీద తేలింది పూల పడవ! | It floats on the water like a flower boat!',
    ]),
    PH('🏞️', 'చెరువు — ఊరిలో నీళ్ళు నిలిచే చోటు. | A village pond (cheruvu).'),
    TIP('"ఎత్తు" అంటే పైకి లేపడం. ఒక పుస్తకం తల మీద ఎత్తుకొని నడిచి చూడు! | "Ettu" means lift up. Try walking with a book on your head!'),
  ], [
    EX('బతుకమ్మలను ఎక్కడికి తీసుకెళ్తారు? | Where are the Bathukammas taken?', ['పాటలో "చెరువు దాకా" అన్నాం. | The song says "to the pond".'], 'చెరువుకు | to the pond'),
    EX('బతుకమ్మను ఎలా తీసుకెళ్తారు? | How do they carry it?', ['తల మీద ఎత్తుకొని. | Lifted on the head.'], 'తల మీద | on the head'),
  ], [
    mcq('theme', 'పాట, బొమ్మ గుర్తు చేసుకో. | Remember the song and picture.', [
      ['బతుకమ్మలను ఎక్కడ వదులుతారు? | Where are the Bathukammas let go?', 'చెరువులో | in the pond', ['చెట్టు మీద | on a tree', 'బడిలో | at school', 'రోడ్డు మీద | on the road'], 'నీళ్ళ మీద తేలుతుంది. | It floats on water.', 'బతుకమ్మను చెరువు నీళ్ళలో వదులుతారు. | It is set on the pond water.'],
      ['నీటి మీద బతుకమ్మ దేనిలా కనిపిస్తుంది? | On the water the Bathukamma looks like what?', 'పూల పడవ | a flower boat', ['రైలు | a train', 'కొండ | a hill', 'గాలిపటం | a kite'], 'పాటలోని చివరి వరుస. | The last line of the song.', 'అది పూల పడవలా తేలుతుంది. | It floats like a flower boat.'],
      ['"ఎత్తు" అంటే ఏమిటి? | What does "ettu" mean?', 'పైకి లేపు | lift up', ['కింద పెట్టు | put down', 'పరుగెత్తు | run', 'తిను | eat'], 'బతుకమ్మను తల మీదకు ఏం చేస్తారు? | What do they do to put it on the head?', 'ఎత్తు = పైకి లేపడం. | ettu = to lift.'],
      ['చెరువుకు వెళ్ళేటప్పుడు ఏం చేస్తారు? | What do they do on the way to the pond?', 'పాటలు పాడతారు | sing songs', ['నిద్రపోతారు | sleep', 'ఏడుస్తారు | cry', 'చదువుతారు | study'], 'పండుగ సంబరం! | It is a festive time!', 'పాటలు పాడుతూ నడుస్తారు. | They sing as they walk.'],
      ['బతుకమ్మ నీటిలో ఎందుకు తేలుతుంది? | Why does the Bathukamma float?', 'పూలు, ఆకులు తేలికగా ఉంటాయి | flowers and leaves are light', ['అది రాయి | it is a stone', 'అది ఇనుము | it is iron', 'దానికి రెక్కలు ఉన్నాయి | it has wings'], 'తేలికైనవి నీటి మీద తేలుతాయి. | Light things float.', 'పూలు తేలిక, అందుకే తేలుతుంది. | Flowers are light, so it floats.'],
    ]),
    orderT('walk', 'జరిగిన క్రమంలో పెట్టు. | Put them in the order they happen.', [
      ['పూలు పేర్చారు | stacked flowers', 'చుట్టూ ఆడారు | danced around', 'తల మీద ఎత్తారు | lifted it', 'చెరువులో వదిలారు | set it on the pond'],
      ['ఎత్తుకున్నారు | lifted', 'నడిచారు | walked', 'చెరువు చేరారు | reached the pond', 'నీటిలో వదిలారు | let it float'],
      ['సాయంత్రం అయింది | evening came', 'ఆట ఆడారు | played', 'చెరువుకు వెళ్ళారు | went to the pond'],
    ], 'ముందు బతుకమ్మ తయారవ్వాలి, తర్వాతే చెరువు. | First the Bathukamma is made; the pond comes last.'),
  ]),
  o('ettu.gunintham', 'గుణింతాలు-2: ృ ె ే ై | Vowel signs 2: ru, e, ee, ai', [
    P('ఈ పాఠంలో మరో నాలుగు గుర్తులు నేర్చుకుందాం. "ఎ" గుర్తు అక్షరం పైన తలకట్టు దగ్గర వంకర; "ఏ" కి దానికి ఒక తోక. | Four more signs today. The e sign is a curl on top; ee adds a little tail to it.'),
    KEYS('ఋ → ◌ృ ఋత్వం: క → కృ | ru sign: ka → kru', 'ఎ → ◌ె ఎత్వం: క → కె | e sign: ka → ke', 'ఏ → ◌ే ఏత్వం: క → కే | ee sign: ka → kee', 'ఐ → ◌ై ఐత్వం: క → కై | ai sign: ka → kai'),
    ...RHYME('గుణింతం పాట | Gunintham chant', ['మె మే మై — మేక మేసింది! | me mee mai, the goat grazed!', 'తె తే తై — తేనె తీపి! | the thee thai, honey is sweet!']),
    PH('🐐', 'మేక = మే + క — "ఏ" గుర్తు. | Goat (meeka) = mee + ka: the ee sign.'),
    TIP('"ఎ" పొట్టిగా, "ఏ" పొడవుగా — చేతులు చిన్నగా, పెద్దగా చాపి పలుకు! | Short e, long ee: stretch your arms short, then long, as you say them!'),
  ], [
    EX('త + ఏ = ? | tha + ee = ?', ['ఏ గుర్తు ◌ే. | The ee sign is ◌ే.', 'త + ◌ే = తే. | tha + ◌ే = thee.'], 'తే | thee'),
    EX('"వై" లో ఏ గుర్తు? | Which sign is in "vai"?', ['వై = వ + ఐ. | vai = va + ai.'], 'ఐత్వం | ai sign'),
  ], [
    gunJoin('join', G2, SET2),
    gunSign('sign', G2, SET2),
    gunRow('row', G2, SET2),
    blankT('fill', ['[మే]-క|goat|🐐', '[చె]-ట్టు|tree|🌳', '[పె]-ట్టె|box|📦', '[తే]-నె|honey|🍯', '[నె]-మ-లి|peacock|🦚', '[గే]-దె|buffalo|🐃', '[దే]-వా-ల-యం|temple|🛕', '[వై]-ద్యు-డు|doctor|🧑‍⚕️', '[గృ]-హం|house|🏠'], signAlts(SET2), 'పొట్టి ధ్వనా, పొడవు ధ్వనా — జాగ్రత్తగా విను. | Short sound or long sound? Listen carefully.'),
  ]),
  o('ettu.read', 'చదువుదాం: ఎ, ఏ, ఐ పదాలు | Reading e, ee, ai words', [
    ...RHYME('చదువుదాం | Let us read', ['మేక చెట్టు కింద మేసింది. | The goat grazed under the tree.', 'నెమలి పెద్ద పురి విప్పింది. | The peacock spread its big tail.', 'వైద్యుడు మందు ఇచ్చాడు. | The doctor gave medicine.']),
    PH('🦚', 'నెమలి = నె + మ + లి. | nemali = ne + ma + li.'),
    TIP('పదంలో ఏ గుర్తు ఉందో వేలితో చూపించి చదువు. | Point to the sign in each word as you read.'),
  ], [
    EX('"మేక చెట్టు కింద మేసింది." మేక ఎక్కడ మేసింది? | Where did the goat graze?', ['"చెట్టు కింద". | "under the tree".'], 'చెట్టు కింద | under the tree'),
    EX('"నెమలి" మొదటి అక్షరంలో ఏ గుర్తు? | Which sign is in the first letter of "nemali"?', ['నె = న + ఎ. | ne = na + e.'], 'ఎత్వం | e sign'),
  ], [
    mcq('read', 'వాక్యం మళ్ళీ చదువు. | Read the sentence again.', [
      ['"నెమలి పెద్ద పురి విప్పింది." ఏ పక్షి? | Which bird?', 'నెమలి | peacock', ['కాకి | crow', 'చిలుక | parrot', 'కోడి | hen'], 'మొదటి పదం. | The first word.', 'నెమలి పురి విప్పింది. | The peacock spread its tail.'],
      ['"వైద్యుడు మందు ఇచ్చాడు." ఎవరు ఇచ్చారు? | Who gave it?', 'వైద్యుడు | the doctor', ['రైతు | the farmer', 'టీచర్ | the teacher', 'అమ్మ | mother'], '"వై" తో మొదలయ్యే పదం. | The word starting with vai.', 'వైద్యుడు మందు ఇచ్చాడు. | The doctor gave medicine.'],
      ['ఏ పదం మొదటి అక్షరంలో "ఏ" గుర్తు (◌ే) ఉంది? | Which word has the ee sign (◌ే) in its first letter?', 'తేనె | honey', ['తెలుపు | white', 'తైలం | oil', 'తాత | grandpa'], 'పొడవైన "ఏ". | The long ee.', 'తే = త + ఏ. | thee = tha + ee.'],
      ['ఏ పదం మొదటి అక్షరంలో "ఐ" గుర్తు (◌ై) ఉంది? | Which word has the ai sign (◌ై) in its first letter?', 'పైన | above', ['పెన్ను | pen', 'పేరు | name', 'పాట | song'], '"ఐ" ధ్వని: పై. | The ai sound: pai.', 'పై = ప + ఐ. | pai = pa + ai.'],
      ['ఏ పదం మొదటి అక్షరంలో "ఎ" గుర్తు (◌ె) ఉంది? | Which word has the e sign (◌ె) in its first letter?', 'చెట్టు | tree', ['చేప | fish', 'చైనా | China', 'చాప | mat'], 'పొట్టి "ఎ". | The short e.', 'చె = చ + ఎ. | che = cha + e.'],
    ]),
    orderT('sent', 'పదాలను వరుసలో పెట్టి వాక్యం చేయి. | Put the words in order to make the sentence.', [
      ['మేక | goat', 'ఆకులు | leaves', 'మేసింది. | grazed.'], ['నెమలి | peacock', 'పురి | tail', 'విప్పింది. | spread.'],
      ['తేనె | honey', 'చాలా | very', 'తీపి. | sweet.'], ['వైద్యుడు | doctor', 'మందు | medicine', 'ఇచ్చాడు. | gave.'],
    ], 'ఎవరు ముందు, పని చివర. | Who first, action last.'),
  ]),
], REVIEW);

// ============================================================ 5. పోయిరా గౌరమ్మ! — guninthalu set 3
const G3 = ['క', 'గ', 'చ', 'జ', 'త', 'ద', 'న', 'ప', 'బ', 'మ', 'ర', 'ల', 'వ', 'స'];
const ch5 = unit(5, 'ch5', 'పోయిరా గౌరమ్మ! | Go and come back, Gowramma!', [
  o('gowramma.theme', 'గౌరమ్మకు వీడ్కోలు | Saying goodbye to Gowramma', [
    P('బతుకమ్మ పండుగ చివరి రోజున పసుపుతో చేసిన గౌరమ్మను బతుకమ్మ పైన పెట్టి, చెరువులో సాగనంపుతారు. "మళ్ళీ వచ్చే ఏడాది రా" అని ప్రేమగా వీడ్కోలు చెబుతారు. అందరూ తీపి పిండి వంటలు పంచుకుంటారు. | On the last day, Gowramma (made of turmeric) sits on top of the Bathukamma and is sent off on the pond: "Come again next year!" Everyone shares sweet snacks.'),
    ...RHYME('వీడ్కోలు పాట (మా పాట) | Goodbye song (our rhyme)', [
      'పోయి రావమ్మా గౌరమ్మా | Go and come back, Gowramma',
      'పూల పడవ ఎక్కి పోవమ్మా | Ride away on the flower boat',
      'వచ్చే ఏడు మళ్ళీ రావమ్మా! | Come again next year!',
    ]),
    PH('🌼', 'పసుపు గౌరమ్మ — బతుకమ్మ పైన. | Turmeric Gowramma sits on top.'),
    TIP('"పోయి రా" అంటే "వెళ్ళి మళ్ళీ రా" — ఇంటికి వచ్చిన వారిని ఇలాగే సాగనంపుతాం. | "Poyi raa" means "go and come again"; that is how we see off guests.'),
  ], [
    EX('గౌరమ్మను దేనితో చేస్తారు? | What is Gowramma made of?', ['పసుపు ముద్దతో. | A lump of turmeric.'], 'పసుపు | turmeric'),
    EX('"పోయి రా" అంటే ఏమిటి? | What does "poyi raa" mean?', ['పోయి = వెళ్ళి; రా = రా. | poyi = go; raa = come.'], 'వెళ్ళి మళ్ళీ రా | go and come back'),
  ], [
    mcq('theme', 'పండుగ చివరి రోజు గుర్తు చేసుకో. | Think about the last day of the festival.', [
      ['గౌరమ్మను ఎక్కడ పెడతారు? | Where is Gowramma placed?', 'బతుకమ్మ పైన | on top of the Bathukamma', ['బావిలో | in a well', 'బడిలో | at school', 'చెట్టు కింద | under a tree'], 'అందరికీ కనిపించే చోటు. | Where everyone can see her.', 'గౌరమ్మ బతుకమ్మ పైన ఉంటుంది. | She sits on top.'],
      ['వీడ్కోలు చెప్పేటప్పుడు ఏమంటారు? | What do they say when seeing her off?', 'మళ్ళీ రా | come again', ['పో, రాకు | go, never come', 'నిద్రపో | sleep', 'పరుగెత్తు | run'], 'ప్రేమతో పిలుస్తారు. | They call her lovingly.', '"వచ్చే ఏడు మళ్ళీ రా" అంటారు. | "Come again next year."'],
      ['చివరి రోజు అందరూ ఏం పంచుకుంటారు? | What do people share on the last day?', 'తీపి పిండి వంటలు | sweet snacks', ['పుస్తకాలు | books', 'బొమ్మలు | toys', 'బట్టలు | clothes'], 'పండుగ రుచి! | The taste of the festival!', 'తీపి వంటలు పంచుకుంటారు. | They share sweets.'],
      ['గౌరమ్మ ఏ రంగులో ఉంటుంది? | What colour is Gowramma?', 'పసుపు | yellow', ['నీలం | blue', 'నలుపు | black', 'ఆకుపచ్చ | green'], 'పసుపుతో చేస్తారు. | Made of turmeric.', 'పసుపు గౌరమ్మ పసుపు రంగు. | Yellow, like turmeric.'],
      ['వీడ్కోలు చెప్పేటప్పుడు మనసు ఎలా ఉంటుంది? | How do people feel when saying goodbye?', 'కొంచెం బాధ, మళ్ళీ వస్తుందనే ఆశ | a little sad, hoping she returns', ['కోపం | angry', 'భయం | scared', 'నిద్ర | sleepy'], '"మళ్ళీ రా" అని ఎందుకు అంటారు? | Why do they say "come again"?', 'మళ్ళీ కలవాలనే ఆశతో సాగనంపుతారు. | They send her off hoping to meet again.'],
    ]),
    matchT('match', 'పదాన్ని అర్థంతో కలుపు | Match each word to its meaning', [
      ['పోయి రా | go and come back', 'వీడ్కోలు మాట | a goodbye word'], ['గౌరమ్మ | Gowramma', 'పసుపు దేవత | turmeric goddess'], ['చెరువు | pond', 'నీళ్ళు నిలిచే చోటు | place where water stays'],
      ['తాంబాళం | big plate', 'పెద్ద పళ్ళెం | a big plate'], ['తంగేడు | tangedu', 'పసుపు పూవు | a yellow flower'],
    ], 'బతుకమ్మ పాఠాలు గుర్తు చేసుకో. | Remember the Bathukamma lessons.'),
  ]),
  o('gowramma.gunintham', 'గుణింతాలు-3: ొ ో ౌ ం ః | Vowel signs 3: o, oo, au, am, ah', [
    P('చివరి గుర్తులు: ఒ, ఓ, ఔ గుర్తులు, సున్న (ం), విసర్గ (ః). సున్న, విసర్గ అక్షరం పక్కన కూర్చుంటాయి. | The last signs: o, oo, au, and the circle (am) and two dots (ah), which sit beside the letter.'),
    KEYS('ఒ → ◌ొ ఒత్వం: క → కొ | o sign: ka → ko', 'ఓ → ◌ో ఓత్వం: క → కో | oo sign: ka → koo', 'ఔ → ◌ౌ ఔత్వం: క → కౌ | au sign: ka → kau', 'అం → ◌ం సున్న: క → కం | am: ka → kam', 'అః → ◌ః విసర్గ: క → కః | ah: ka → kah'),
    ...RHYME('గుణింతం పాట | Gunintham chant', ['కొ కో కౌ కం కః — కోతి కొమ్మ ఎక్కింది! | ko koo kau kam kah, the monkey climbed a branch!', 'బొ బో బౌ బం బః — బంతి ఎగిరింది! | bo boo bau bam bah, the ball flew up!']),
    PH('🐒', 'కోతి = కో + తి — "ఓ" గుర్తు. | Monkey (koothi) = koo + thi: the oo sign.'),
    TIP('సున్న (ం) ఉంటే నోరు మూసుకుని "మ్" లా ముగుస్తుంది: బం-తి. | With the circle (ం), close your mouth at the end, like "m": bam-thi.'),
  ], [
    EX('గ + ఔ = ? | ga + au = ?', ['ఔ గుర్తు ◌ౌ. | The au sign is ◌ౌ.', 'గ + ◌ౌ = గౌ (గౌరమ్మలో లాగా). | ga + ◌ౌ = gau, as in Gowramma.'], 'గౌ | gau'),
    EX('"బం" లో ఏ గుర్తు? | Which sign is in "bam"?', ['బ పక్కన చిన్న సున్న. | A small circle beside బ.'], 'సున్న | am sign (circle)'),
  ], [
    gunJoin('join', G3, SET3),
    gunSign('sign', G3, SET3),
    gunRow('row', G3, SET3),
    blankT('fill', ['[కో]-తి|monkey|🐒', '[గొ]-ర్రె|sheep|🐑', '[బొ]-మ్మ|doll|🧸', '[తో]-ట|garden|🌳', '[గౌ]-ర-మ్మ|Gowramma|🌼', '[మౌ]-నం|silence|🤫', '[బం]-తి|ball|⚽', '[చం]-ద్రు-డు|moon|🌙', '[పొ]-లం|field|🌾'], signAlts(SET3), 'ఒ/ఓ/ఔ — సున్నా? బొమ్మ పేరు గట్టిగా చెప్పి చూడు. | o, oo, au or the circle? Say the name aloud.'),
  ]),
  o('gowramma.read', 'చదువుదాం: ఒ, ఓ, సున్న పదాలు | Reading o, oo and circle words', [
    ...RHYME('చదువుదాం | Let us read', ['కోతి కొమ్మ ఎక్కింది. | The monkey climbed a branch.', 'బొమ్మ బంతి ఆడింది. | The doll played ball.', 'చందమామ నవ్వాడు. | The moon smiled.']),
    PH('🌙', 'చందమామ = చం + ద + మా + మ. | chandamaama = cham + da + maa + ma.'),
    TIP('సున్న ఉన్న అక్షరం దగ్గర కొంచెం "మ్" లేదా "న్" ధ్వని వస్తుంది. | The circle adds a little "m" or "n" sound.'),
  ], [
    EX('"కోతి కొమ్మ ఎక్కింది." కోతి ఏం ఎక్కింది? | What did the monkey climb?', ['"కొమ్మ" పదం. | The word "komma".'], 'కొమ్మ | branch'),
    EX('"చందమామ" లో సున్న ఎక్కడ? | Where is the circle in "chandamaama"?', ['చం-ద-మా-మ. | cham-da-maa-ma.', 'మొదటి అక్షరం "చం" లో. | In the first letter, cham.'], 'చం'),
  ], [
    mcq('read', 'పదాన్ని గుర్తుల సాయంతో చదువు. | Read the word with help from the signs.', [
      ['ఏ పదం మొదటి అక్షరంలో "ఓ" గుర్తు (◌ో) ఉంది? | Which word has the oo sign (◌ో) in its first letter?', 'తోట | garden', ['తొండ | lizard', 'తాత | grandpa', 'తంతి | wire'], 'పొడవైన "ఓ". | The long oo.', 'తో = త + ఓ. | thoo = tha + oo.'],
      ['ఏ పదం మొదటి అక్షరంలో "ఒ" గుర్తు (◌ొ) ఉంది? | Which word has the o sign (◌ొ) in its first letter?', 'బొమ్మ | doll', ['బోను | cage', 'బంతి | ball', 'బాతు | duck'], 'పొట్టి "ఒ". | The short o.', 'బొ = బ + ఒ. | bo = ba + o.'],
      ['ఏ పదం మొదటి అక్షరంలో సున్న (ం) ఉంది? | Which word has the circle (ం) in its first letter?', 'బంతి | ball', ['బాతు | duck', 'బొమ్మ | doll', 'బస్సు | bus'], 'మొదట "మ్" ధ్వని వినిపిస్తుంది. | You hear "m" in the first part.', 'బం = బ + ం. | bam = ba + am.'],
      ['"బొమ్మ బంతి ఆడింది." బొమ్మ ఏం ఆడింది? | What did the doll play?', 'బంతి | ball', ['పాట | song', 'కర్ర | stick', 'పడవ | boat'], 'రెండవ పదం. | The second word.', 'బొమ్మ బంతి ఆడింది. | The doll played ball.'],
      ['ఏ పదం మొదటి అక్షరంలో "ఔ" గుర్తు (◌ౌ) ఉంది? | Which word has the au sign (◌ౌ) in its first letter?', 'గౌను | frock', ['గోడ | wall', 'గొడుగు | umbrella', 'గంట | bell'], '"అవ్" లాంటి ధ్వని. | A sound like "au".', 'గౌ = గ + ఔ. | gau = ga + au.'],
    ]),
    orderT('sent', 'పదాలను వరుసలో పెట్టి వాక్యం చేయి. | Put the words in order to make the sentence.', [
      ['కోతి | monkey', 'కొమ్మ | branch', 'ఎక్కింది. | climbed.'], ['బొమ్మ | doll', 'బంతి | ball', 'ఆడింది. | played.'],
      ['చందమామ | moon', 'తెల్లగా | white', 'మెరిశాడు. | shone.'], ['గొర్రె | sheep', 'తోటలో | in the garden', 'మేసింది. | grazed.'],
    ], 'ఎవరు ముందు, పని చివర. | Who first, action last.'),
  ]),
], REVIEW);

// ============================================================ ottulu sets
const OT1 = ['క్క', 'గ్గ', 'చ్చ', 'ట్ట', 'డ్డ'];
const OT2 = ['త్త', 'ద్ద', 'న్న', 'ప్ప', 'బ్బ'];
const OT3 = ['మ్మ', 'య్య', 'ల్ల', 'వ్వ', 'ళ్ళ'];
const ottuIntro = (conjs: string[], example: string, emoji: string, pic: string): Block[] => [
  P('ఒక హల్లు కింద మరో హల్లు చిన్న గుర్తుగా అతుక్కుంటే దాన్ని "ఒత్తు" అంటాం. ఒకే అక్షరం రెండుసార్లు వస్తే అది ద్విత్వాక్షరం (డబుల్ అక్షరం). | When a consonant sits under another as a small sign, we call it an ottu. When the same letter is doubled, it is a dvitva (double) letter.'),
  KEYS(...conjs.map((c) => `${c} = ${c[0]} + ${c[2]} | ${rom(c[0])} + ${rom(c[2])}`)),
  PH(emoji, pic),
  ...RHYME('ఒత్తుల ఆట | Ottu game', [example, 'ఒత్తు ఉన్న చోట ఒక్క క్షణం ఆగి, గట్టిగా పలుకు! | Pause a moment at the ottu and say it firmly!']),
  TIP('ఒత్తు ఉంటే ముందు అక్షరం దగ్గర గొంతు కొంచెం ఆగుతుంది: అక్-క. | With an ottu your voice stops briefly: ak-ka.'),
];

// ============================================================ 6. అల్లో నేరెడల్లో
const W1 = ['అ-[క్క]|elder sister|👧', 'కు-[క్క]|dog|🐶', 'చు-[క్క]|star|⭐', 'మొ-[గ్గ]|bud|🌱', 'ప-[చ్చ]-ని|green|🟢', 'పి-[చ్చు]-క|sparrow|🐦', 'బు-[ట్ట]|basket|🧺', 'చె-[ట్టు]|tree|🌳', 'గ-[డ్డి]|grass|🌿', 'ల-[డ్డు]|laddu|🟠'];
const ch6 = unit(6, 'ch6', 'అల్లో నేరెడల్లో | Allo neredallo (a jamun folk song)', [
  o('neredu.theme', 'నేరేడు చెట్టు, నేరేడు పండ్లు | The jamun tree and its fruit', [
    P('"అల్లో నేరెడల్లో" ఒక పాత జానపద పాట పల్లవి. నేరేడు పండ్లు వేసవి చివరలో వస్తాయి. అవి ముదురు ఊదా రంగులో, పుల్లగా తియ్యగా ఉంటాయి. తింటే నాలుక ఊదా రంగు అవుతుంది! | "Allo neredallo" is the refrain of an old folk song. Jamun (neredu) fruits come at the end of summer; they are dark purple, sweet and sour, and turn your tongue purple!'),
    ...RHYME('నేరేడు పాట (మా పాట) | Jamun song (our rhyme)', [
      'నేరేడు చెట్టు ఎక్కుదామా? | Shall we climb the jamun tree?',
      'నల్ల నల్ల పండ్లు కోద్దామా? | Shall we pick the dark, dark fruit?',
      'బుట్ట నిండా పెట్టుదామా? | Shall we fill the basket full?',
      'అందరితో పంచుదామా! | Let us share with everyone!',
    ]),
    PH('🟣', 'నేరేడు పండు రంగు — ముదురు ఊదా. | The colour of a jamun: dark purple.'),
    TIP('ప్రతి వరుస చివర "ఆ?" అని అడిగినట్టు పాడు, చివరిది "ఆ!" అని సంతోషంగా. | Sing each line like a question, and the last one happily!'),
  ], [
    EX('నేరేడు పండు ఏ రంగు? | What colour is a jamun?', ['ముదురు ఊదా, దాదాపు నలుపు. | Dark purple, almost black.'], 'ఊదా | purple'),
    EX('పాటలో పండ్లను దేనిలో పెట్టారు? | In the song, where did they put the fruit?', ['"బుట్ట నిండా". | "basket full".'], 'బుట్టలో | in a basket'),
  ], [
    mcq('theme', 'నేరేడు పాట గుర్తు చేసుకో. | Remember the jamun song.', [
      ['నేరేడు పండ్లు తింటే నాలుక ఏ రంగు అవుతుంది? | Eating jamun turns your tongue what colour?', 'ఊదా | purple', ['పసుపు | yellow', 'తెలుపు | white', 'ఆకుపచ్చ | green'], 'పండు రంగే నాలుకకు. | The fruit\'s colour comes on the tongue.', 'నాలుక ఊదా అవుతుంది. | The tongue turns purple.'],
      ['నేరేడు పండు రుచి ఎలా ఉంటుంది? | How does a jamun taste?', 'పుల్లగా తియ్యగా | sweet and sour', ['ఉప్పగా | salty', 'కారంగా | spicy', 'చేదుగా | bitter'], 'కొంచెం పులుపు, కొంచెం తీపి. | A little sour, a little sweet.', 'నేరేడు పుల్లగా తియ్యగా ఉంటుంది. | It is sweet and sour.'],
      ['పాట చివర్లో పండ్లను ఏం చేద్దామన్నారు? | At the end of the song, what do they do with the fruit?', 'అందరితో పంచుదాం | share with everyone', ['దాచుకుందాం | hide them', 'పారేద్దాం | throw them', 'అమ్ముదాం | sell them'], 'చివరి వరుస. | The last line.', 'అందరితో పంచుకోవడం మంచిది. | Sharing is good.'],
      ['నేరేడు పండ్లు ఎక్కడ కాస్తాయి? | Where do jamuns grow?', 'చెట్టుకు | on a tree', ['నేలలో | under the ground', 'నీటిలో | in water', 'తీగకు | on a creeper'], 'పాటలో చెట్టు ఎక్కుతాం. | In the song we climb a tree.', 'నేరేడు పెద్ద చెట్టుకు కాస్తుంది. | Jamun grows on a big tree.'],
      ['"అల్లో నేరెడల్లో" ఏ రకం పాట? | What kind of song is "Allo neredallo"?', 'జానపద పాట | folk song', ['సినిమా పాట | film song', 'జాతీయ గీతం | national anthem', 'ఆంగ్ల పాట | English song'], 'ఊరి ప్రజలు తరతరాలుగా పాడుకునే పాట. | Village people have sung it for generations.', 'ఇది జానపద పాట. | It is a folk song.'],
    ]),
    orderT('song', 'పాట వరుసలను క్రమంలో పెట్టు. | Put the song lines in order.', [
      ['చెట్టు ఎక్కుదాం | climb the tree', 'పండ్లు కోద్దాం | pick the fruit', 'బుట్టలో పెడదాం | put in the basket', 'అందరికీ పంచుదాం | share with all'],
      ['పండ్లు కోశాం | picked fruit', 'కడిగాం | washed them', 'తిన్నాం | ate them'],
      ['చెట్టు | tree', 'కొమ్మ | branch', 'పండు | fruit'],
    ], 'ముందు చెట్టు దగ్గరకు వెళ్ళాలి! | First you must go to the tree!'),
  ]),
  o('neredu.ottu', 'ఒత్తులు-1: క్క గ్గ చ్చ ట్ట డ్డ | Ottulu 1: kka, gga, chcha, TTa, DDa', ottuIntro(OT1, 'అక్క బుట్టలో లడ్డు, చెట్టు కింద కుక్క! | Sister\'s basket has a laddu; a dog under the tree!', '🐶', 'కుక్క = కు + క్క. | Dog (kukka) = ku + kka.'), [
    EX('"బుట్ట" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "butta"?', ['బు-ట్ట అని విడదీయి. | Split: bu-TTa.', 'ట కింద ట ఒత్తు. | ట with ట below.'], 'ట్ట'),
    EX('గ + గ = ? | ga + ga = ?', ['గ కింద గ ఒత్తు. | ga with the ga ottu below.'], 'గ్గ'),
  ], ottuPractice(W1, OT1)),
  o('neredu.read', 'చదువుదాం: ఒత్తు పదాల వాక్యాలు | Reading sentences with ottu words', [
    ...RHYME('చదువుదాం | Let us read', ['అక్క చెట్టు ఎక్కింది. | Sister climbed the tree.', 'పిచ్చుక గడ్డి తెచ్చింది. | The sparrow brought grass.', 'బుట్ట నిండా పండ్లు. | A basket full of fruit.']),
    PH('🐦', 'పిచ్చుక గూడు కట్టడానికి గడ్డి తెస్తుంది. | A sparrow brings grass to build its nest.'),
    TIP('ఒత్తు పదం దగ్గర ఆగకుండా, కలిపి చదువు: "చెట్టు" — "చె-ట్టు". | Read ottu words smoothly: che-TTu.'),
  ], [
    EX('"పిచ్చుక గడ్డి తెచ్చింది." పిచ్చుక ఏం తెచ్చింది? | What did the sparrow bring?', ['"గడ్డి". | "gaddi" (grass).'], 'గడ్డి | grass'),
    EX('"అక్క చెట్టు ఎక్కింది." ఇందులో ఎన్ని ఒత్తు పదాలు? | How many ottu words in this sentence?', ['అక్క, చెట్టు, ఎక్కింది — మూడు. | akka, chettu, ekkindi: three.'], '3'),
  ], [
    mcq('read', 'వాక్యాన్ని నెమ్మదిగా చదువు. | Read the sentence slowly.', [
      ['"అక్క చెట్టు ఎక్కింది." ఎవరు ఎక్కారు? | Who climbed?', 'అక్క | sister', ['కుక్క | dog', 'పిచ్చుక | sparrow', 'తాత | grandpa'], 'మొదటి పదం. | The first word.', 'అక్క చెట్టు ఎక్కింది. | Sister climbed.'],
      ['"బుట్ట నిండా పండ్లు." బుట్టలో ఏమున్నాయి? | What is in the basket?', 'పండ్లు | fruits', ['రాళ్ళు | stones', 'పుస్తకాలు | books', 'నీళ్ళు | water'], 'చివరి పదం. | The last word.', 'బుట్ట నిండా పండ్లు. | Full of fruit.'],
      ['"కుక్క గడ్డిలో పడుకుంది." కుక్క ఎక్కడ పడుకుంది? | Where did the dog lie down?', 'గడ్డిలో | in the grass', ['చెట్టు మీద | on the tree', 'బుట్టలో | in the basket', 'నీటిలో | in water'], '"గడ్డిలో" పదం. | The word "gaddilo".', 'కుక్క గడ్డిలో పడుకుంది. | In the grass.'],
      ['"ఆకాశంలో చుక్కలు మెరిశాయి." ఏవి మెరిశాయి? | What shone in the sky?', 'చుక్కలు | stars', ['లడ్డూలు | laddus', 'మొగ్గలు | buds', 'బుట్టలు | baskets'], 'రాత్రి ఆకాశంలో మెరిసేవి. | Things that shine in the night sky.', 'చుక్కలు = నక్షత్రాలు. | chukkalu = stars.'],
      ['"మొగ్గ పూవు అయింది." మొగ్గ ఏమైంది? | What did the bud become?', 'పూవు | a flower', ['పండు | a fruit', 'చెట్టు | a tree', 'ఆకు | a leaf'], 'మొగ్గ విచ్చుకుంటే… | When a bud opens…', 'మొగ్గ విచ్చుకొని పూవు అవుతుంది. | A bud opens into a flower.'],
    ]),
    orderT('sent', 'పదాలను వరుసలో పెట్టి వాక్యం చేయి. | Put the words in order to make the sentence.', [
      ['అక్క | sister', 'చెట్టు | tree', 'ఎక్కింది. | climbed.'], ['పిచ్చుక | sparrow', 'గడ్డి | grass', 'తెచ్చింది. | brought.'],
      ['కుక్క | dog', 'లడ్డు | laddu', 'తిన్నది. | ate.'], ['బుట్టలో | in the basket', 'పచ్చని | green', 'ఆకులు. | leaves.'],
    ], 'ఎవరు ముందు, పని చివర. | Who first, action last.'),
  ]),
], `${REVIEW} ${OTTU_NOTE}`);

// ============================================================ 7. పొట్టేలు కన్నతల్లి
const W2 = ['అ-[త్త]|aunt|👩', 'గు-[త్తి]|bunch|🍇', 'పె-[ద్ద]|big|🐘', 'అ-[న్న]|elder brother|👦', 'వె-[న్న]|butter|🥛', 'క-[ప్ప]|frog|🐸', 'చె-[ప్పు]|tell|🗣️', 'డ-[బ్బు]|money|🪙', 'మ-[బ్బు]|cloud|☁️', 'ని-[ప్పు]|fire|🔥'];
const ch7 = unit(7, 'ch7', 'పొట్టేలు కన్నతల్లి | The ram\'s mother', [
  o('pottelu.theme', 'అమ్మ ప్రేమ: జంతువులు, వాటి పిల్లలు | A mother\'s love: animals and their young', [
    P('పొట్టేలు అంటే మగ గొర్రె. ప్రతి జంతువుకు తన పిల్లల మీద ఎంతో ప్రేమ. అమ్మ గొర్రె తన పిల్లను కాపాడుతుంది, పాలు ఇస్తుంది, తప్పిపోతే వెతుకుతుంది. | A pottelu is a ram (male sheep). Every animal mother loves her young: she protects it, feeds it, and searches when it is lost.'),
    ...RHYME('అమ్మ ఎక్కడ? (మా పాట) | Where is mummy? (our rhyme)', [
      'మే మే అంటుంది గొర్రెపిల్ల, అమ్మ ఎక్కడ? | "Me me," cries the lamb, where is mummy?',
      'అంబా అంటుంది లేగదూడ, అమ్మ ఎక్కడ? | "Ambaa," calls the calf, where is mummy?',
      'అదిగో వచ్చింది అమ్మ, ఇదిగో ముద్దు! | Here comes mummy, here is a kiss!',
    ]),
    PH('🐑', 'గొర్రె, గొర్రెపిల్ల — అమ్మ, బిడ్డ. | A sheep and its lamb: mother and baby.'),
    TIP('పాట పాడేటప్పుడు ఒక్కో జంతువు అరుపు అనుకరించు! | Copy each animal\'s call as you sing!'),
  ], [
    EX('ఆవు పిల్లను ఏమంటారు? | What is a cow\'s baby called?', ['పాటలో "లేగదూడ". | The song says "lega dooda".'], 'దూడ | calf'),
    EX('"పొట్టేలు" అంటే ఏమిటి? | What is a "pottelu"?', ['గొర్రెల్లో మగది. | The male of the sheep.'], 'మగ గొర్రె | ram'),
  ], [
    matchT('young', 'జంతువును దాని పిల్లతో కలుపు | Match each animal to its baby', [
      ['ఆవు | cow', 'దూడ | calf'], ['గొర్రె | sheep', 'గొర్రెపిల్ల | lamb'], ['మేక | goat', 'మేకపిల్ల | kid'], ['కోడి | hen', 'కోడిపిల్ల | chick'],
      ['కుక్క | dog', 'కుక్కపిల్ల | puppy'], ['పిల్లి | cat', 'పిల్లికూన | kitten'],
    ], 'పిల్ల పేరులో అమ్మ పేరే ఉంటుంది కదా! | The baby\'s name often has the mother\'s name in it!'),
    pic('call', 'జంతువు అరుపు ఏదో ఆలోచించు. | Think of the animal\'s sound.', [
      ['"మే మే" అని అరిచేది ఏది? | Which one says "me me"?', ['🐑', 'గొర్రె | sheep'], [['🐄', 'ఆవు | cow'], ['🐶', 'కుక్క | dog']], 'దాని ఉన్ని మెత్తగా ఉంటుంది. | It has soft wool.', 'గొర్రె "మే మే" అంటుంది. | A sheep says "me me".'],
      ['"అంబా" అని అరిచేది ఏది? | Which one says "ambaa"?', ['🐄', 'ఆవు | cow'], [['🐐', 'మేక | goat'], ['🐱', 'పిల్లి | cat']], 'మనకు పాలు ఇస్తుంది. | It gives us milk.', 'ఆవు "అంబా" అంటుంది. | A cow says "ambaa".'],
      ['"భౌ భౌ" అని అరిచేది ఏది? | Which one says "bhow bhow"?', ['🐶', 'కుక్క | dog'], [['🐑', 'గొర్రె | sheep'], ['🐔', 'కోడి | hen']], 'ఇంటికి కాపలా కాస్తుంది. | It guards the house.', 'కుక్క "భౌ భౌ" అంటుంది. | A dog says "bhow bhow".'],
      ['"మ్యావ్" అని అరిచేది ఏది? | Which one says "myaav"?', ['🐱', 'పిల్లి | cat'], [['🐶', 'కుక్క | dog'], ['🐄', 'ఆవు | cow']], 'ఎలుకలను పట్టుకుంటుంది. | It catches rats.', 'పిల్లి "మ్యావ్" అంటుంది. | A cat says "myaav".'],
      ['"కొక్కొరొకో" అని అరిచేది ఏది? | Which one says "kokkoroko"?', ['🐓', 'కోడిపుంజు | rooster'], [['🐐', 'మేక | goat'], ['🐱', 'పిల్లి | cat']], 'తెల్లవారగానే అందరినీ లేపుతుంది. | It wakes everyone at dawn.', 'కోడిపుంజు "కొక్కొరొకో" అంటుంది. | A rooster crows.'],
    ]),
  ]),
  o('pottelu.ottu', 'ఒత్తులు-2: త్త ద్ద న్న ప్ప బ్బ | Ottulu 2: ththa, dda, nna, ppa, bba', ottuIntro(OT2, 'అన్న డబ్బుతో అత్తకు వెన్న తెచ్చాడు! | Brother bought butter for aunt with his money!', '🐸', 'కప్ప = క + ప్ప. | Frog (kappa) = ka + ppa.'), [
    EX('"పెద్ద" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "pedda"?', ['పె-ద్ద. | pe-dda.', 'ద కింద ద ఒత్తు. | ద with ద below.'], 'ద్ద'),
    EX('న + న = ? | na + na = ?', ['న కింద న ఒత్తు. | na with the na ottu below.', 'అన్న, వెన్న లో వస్తుంది. | As in anna, venna.'], 'న్న'),
  ], ottuPractice(W2, OT2)),
  o('pottelu.read', 'చదువుదాం: అమ్మ గొర్రె కథ | Reading: the mother sheep story', [
    ...RHYME('తప్పిపోయిన పొట్టేలు (మా కథ) | The lost little ram (our story)', [
      'చిన్న పొట్టేలు మబ్బులు చూస్తూ తప్పిపోయింది. | The little ram got lost watching the clouds.',
      'అమ్మ గొర్రె "మే మే" అని పిలిచింది. | Mother sheep called "me me".',
      'కప్ప దారి చెప్పింది. | A frog showed the way.',
      'పొట్టేలు అమ్మ దగ్గరకు పరుగెత్తింది! | The little ram ran to its mother!',
    ]),
    PH('🐑', 'అమ్మ దగ్గర పొట్టేలు సంతోషం. | The little ram is happy with its mother.'),
    TIP('కథలో "ఎవరు సాయం చేశారు?" అని వెతుకు. | Look for "who helped?" in the story.'),
  ], [
    EX('పొట్టేలు ఎందుకు తప్పిపోయింది? | Why did the little ram get lost?', ['మొదటి వాక్యం: "మబ్బులు చూస్తూ". | First sentence: "watching the clouds".'], 'మబ్బులు చూస్తూ | watching clouds'),
    EX('దారి చెప్పింది ఎవరు? | Who showed the way?', ['మూడవ వాక్యం. | The third sentence.'], 'కప్ప | the frog'),
  ], [
    mcq('story', 'కథను మళ్ళీ చదువు. | Read the story again.', [
      ['అమ్మ గొర్రె ఎలా పిలిచింది? | How did mother sheep call?', '"మే మే" | "me me"', ['"అంబా" | "ambaa"', '"భౌ భౌ" | "bhow bhow"', '"మ్యావ్" | "myaav"'], 'గొర్రె అరుపు. | The sheep\'s call.', 'అమ్మ గొర్రె "మే మే" అంది. | She called "me me".'],
      ['కప్ప ఏం చేసింది? | What did the frog do?', 'దారి చెప్పింది | showed the way', ['పాట పాడింది | sang', 'నిద్రపోయింది | slept', 'దాక్కుంది | hid'], 'మూడవ వాక్యం. | The third sentence.', 'కప్ప దారి చెప్పి సాయం చేసింది. | The frog helped by showing the way.'],
      ['కథ చివర పొట్టేలు ఏం చేసింది? | What did the little ram do at the end?', 'అమ్మ దగ్గరకు పరుగెత్తింది | ran to its mother', ['మళ్ళీ తప్పిపోయింది | got lost again', 'చెట్టు ఎక్కింది | climbed a tree', 'ఏడ్చింది | cried'], 'చివరి వాక్యం. | The last sentence.', 'పొట్టేలు అమ్మను చేరింది. | The ram reached its mother.'],
      ['ఈ కథ మనకు ఏం నేర్పుతుంది? | What does this story teach us?', 'అమ్మ ప్రేమ, సాయం చేయడం | a mother\'s love and helping', ['తప్పిపోవడం మంచిది | getting lost is good', 'కప్పలు చెడ్డవి | frogs are bad', 'మబ్బులు చూడకూడదు | never look at clouds'], 'అమ్మ పిలిచింది, కప్ప సాయం చేసింది. | Mother called, the frog helped.', 'అమ్మ ప్రేమ గొప్పది; ఇతరులకు సాయం చేయాలి. | A mother\'s love is great; we should help others.'],
      ['"పొట్టేలు" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "pottelu"?', 'ట్టే', ['టే', 'త్తే', 'ప్పే'], 'పొ-ట్టే-లు. | po-TTe-lu.', 'ట కింద ట ఒత్తు, ఏ గుర్తుతో: ట్టే. | ట with ట below and the ee sign.'],
    ]),
    orderT('seq', 'కథను క్రమంలో పెట్టు. | Put the story in order.', [
      ['తప్పిపోయింది | got lost', 'అమ్మ పిలిచింది | mother called', 'కప్ప దారి చెప్పింది | frog showed the way', 'అమ్మను చేరింది | reached mother'],
      ['మబ్బులు చూసింది | watched clouds', 'దారి మరిచింది | forgot the way', 'పరుగెత్తి వచ్చింది | came running'],
    ], 'కథ మొదట పొట్టేలు తప్పిపోయింది. | At the start the ram got lost.'),
  ]),
], `${REVIEW} ${OTTU_NOTE}`);

// ============================================================ 7*. పిట్ట - పతంగి (picture story)
const ch7s = unit('7*', 'ch7s', 'పిట్ట - పతంగి | The bird and the kite', [
  o('pitta.story', 'బొమ్మల కథ: పిట్ట, పతంగి | Picture story: the bird and the kite', [
    P('తెలంగాణలో గాలిపటాన్ని "పతంగి" అనీ, పక్షిని "పిట్ట" అనీ అంటారు. ఈ బొమ్మల కథ చూసి చెప్పు. | In Telangana a kite is often called "pathangi" and a bird "pitta". Look at this picture story and tell it.'),
    ...RHYME('పిట్ట, పతంగి (మా కథ) | The bird and the kite (our story)', [
      '🪁 రవి సంక్రాంతికి పతంగి ఎగరేశాడు. | Ravi flew a kite for Sankranti.',
      '🌳 పతంగి దారం చెట్టుకు చిక్కుకుంది. | The kite string got stuck in a tree.',
      '🐦 ఒక పిట్ట కాలు దారంలో చిక్కుకుంది! | A bird\'s leg got caught in the string!',
      '✋ రవి నెమ్మదిగా దారం విప్పి పిట్టను వదిలాడు. | Ravi gently untangled the string and freed the bird.',
      '🌳 "ఇకపై చెట్లు లేని మైదానంలోనే ఎగరేస్తా" అన్నాడు. | "From now on I will fly kites only in open ground," he said.',
    ]),
    PH('🪁', 'పతంగి = గాలిపటం. | pathangi = kite.'),
    TIP('పతంగి దారం పక్షులకు గాయం చేయగలదు — మిగిలిన దారాన్ని పారేయకుండా చుట్టి దాచు. | Kite string can hurt birds; roll up leftover string, never leave it lying around.'),
  ], [
    EX('పతంగి దారం ఎక్కడ చిక్కుకుంది? | Where did the kite string get stuck?', ['రెండవ బొమ్మ 🌳. | The second picture 🌳.'], 'చెట్టుకు | in a tree'),
    EX('రవి పిట్టకు ఎలా సాయం చేశాడు? | How did Ravi help the bird?', ['నాలుగవ బొమ్మ ✋. | The fourth picture ✋.', 'నెమ్మదిగా దారం విప్పాడు. | He gently untangled the string.'], 'దారం విప్పి వదిలాడు | untangled and freed it'),
  ], [
    orderT('seq', 'కథను క్రమంలో పెట్టు. | Put the story in order.', [
      ['🪁 పతంగి ఎగరేశాడు | flew the kite', '🌳 దారం చిక్కుకుంది | string got stuck', '🐦 పిట్ట చిక్కుకుంది | bird got caught', '✋ పిట్టను వదిలాడు | freed the bird'],
      ['🐦 పిట్ట చిక్కుకుంది | bird got caught', '✋ దారం విప్పాడు | untangled the string', '🕊️ పిట్ట ఎగిరిపోయింది | the bird flew away'],
      ['దారం చుట్టాడు | rolled the string', 'మైదానానికి వెళ్ళాడు | went to the ground', '🪁 పతంగి ఎగరేశాడు | flew the kite'],
    ], 'కథ పతంగితో మొదలవుతుంది. | The story starts with the kite.'),
    mcq('story', 'బొమ్మల కథ మళ్ళీ చూడు. | Look at the picture story again.', [
      ['"పతంగి" అంటే ఏమిటి? | What is a "pathangi"?', 'గాలిపటం | kite', ['పక్షి | bird', 'చెట్టు | tree', 'పండుగ | festival'], 'ఆకాశంలో దారంతో ఎగిరేది. | It flies on a string.', 'పతంగి = గాలిపటం. | pathangi = kite.'],
      ['"పిట్ట" అంటే ఏమిటి? | What is a "pitta"?', 'పక్షి | bird', ['పాము | snake', 'పువ్వు | flower', 'పడవ | boat'], 'రెక్కలతో ఎగిరేది. | It flies with wings.', 'పిట్ట = పక్షి. | pitta = bird.'],
      ['రవి ఏ పండుగకు పతంగి ఎగరేశాడు? | For which festival did Ravi fly a kite?', 'సంక్రాంతి | Sankranti', ['దీపావళి | Deepavali', 'బతుకమ్మ | Bathukamma', 'ఉగాది | Ugadi'], 'జనవరిలో వచ్చే గాలిపటాల పండుగ. | The January kite festival.', 'సంక్రాంతికి పతంగులు ఎగరేస్తారు. | Kites fly at Sankranti.'],
      ['రవి మంచి పని ఏమిటి? | What good thing did Ravi do?', 'పిట్టను కాపాడాడు | saved the bird', ['దారం తెంపాడు | snapped the string', 'చెట్టు నరికాడు | cut the tree', 'పారిపోయాడు | ran away'], 'చిక్కుకున్న పిట్టకు ఏమైంది? | What happened to the trapped bird?', 'రవి పిట్టను నెమ్మదిగా విడిపించాడు. | He gently freed the bird.'],
      ['పతంగి ఎక్కడ ఎగరేయడం మంచిది? | Where is it best to fly a kite?', 'చెట్లు లేని మైదానంలో | in an open ground', ['రోడ్డు మీద | on the road', 'చెట్ల మధ్య | among trees', 'కరెంటు తీగల దగ్గర | near power lines'], 'దారం దేనికీ చిక్కుకోకూడదు. | The string must not catch on anything.', 'ఖాళీ మైదానం సురక్షితం. | An open ground is safe.'],
    ]),
  ]),
  o('pitta.words', 'మన మాటలు: తెలంగాణ పదాలు | Our words: Telangana words', [
    P('ఒకే వస్తువుకు రెండు పేర్లు ఉండొచ్చు. మన ఊరి మాట, పుస్తకపు మాట రెండూ మంచివే. | One thing can have two names: our village word and the book word are both good.'),
    KEYS('పతంగి = గాలిపటం | kite', 'పిట్ట = పక్షి | bird', 'సోపతి = స్నేహం | friendship', 'బువ్వ = అన్నం | rice/food', 'సద్ది = చద్ది అన్నం, కట్టుకెళ్ళే భోజనం | packed food'),
    PH('🐦', 'పిట్ట = పక్షి. | pitta = bird.'),
    TIP('ఇంట్లో పెద్దవాళ్ళను అడుగు: ఈ వస్తువును మన ఊళ్ళో ఏమంటారు? | Ask elders at home: what do we call this in our village?'),
  ], [
    EX('"పతంగి" కి పుస్తకపు మాట ఏది? | What is the book word for "pathangi"?', ['ఆకాశంలో ఎగిరేది, దారంతో. | It flies on a string.'], 'గాలిపటం | kite'),
    EX('"బువ్వ" అంటే? | What is "buvva"?', ['అమ్మ పెట్టే అన్నం. | The rice mother serves.'], 'అన్నం | rice'),
  ], [
    matchT('match', 'ఊరి మాటను పుస్తకపు మాటతో కలుపు | Match the village word to the book word', [
      ['పతంగి | kite', 'గాలిపటం | kite'], ['పిట్ట | bird', 'పక్షి | bird'], ['సోపతి | friendship', 'స్నేహం | friendship'], ['బువ్వ | food', 'అన్నం | rice'], ['దోస్తు | friend', 'మిత్రుడు | friend'],
    ], 'రెండూ ఒకే అర్థం ఇవ్వాలి. | Both must mean the same thing.'),
    mcq('same', 'ఒకే అర్థం వచ్చే పదం వెతుకు. | Find the word with the same meaning.', [
      ['"పిట్ట" లాంటి మరో పదం? | Another word for "pitta"?', 'పక్షి | bird', ['పాము | snake', 'చేప | fish', 'కప్ప | frog'], 'రెక్కలు ఉంటాయి. | It has wings.', 'పిట్ట = పక్షి. | Same meaning.'],
      ['"పతంగి" లాంటి మరో పదం? | Another word for "pathangi"?', 'గాలిపటం | kite', ['బంతి | ball', 'బొంగరం | top', 'పడవ | boat'], 'దారంతో ఎగురుతుంది. | It flies on a string.', 'పతంగి = గాలిపటం. | Same meaning.'],
      ['"బువ్వ" లాంటి మరో పదం? | Another word for "buvva"?', 'అన్నం | rice', ['నీళ్ళు | water', 'పాలు | milk', 'పండు | fruit'], 'రోజూ తినేది. | We eat it every day.', 'బువ్వ = అన్నం. | Same meaning.'],
      ['"దోస్తు" లాంటి మరో పదం? | Another word for "dosthu"?', 'మిత్రుడు | friend', ['శత్రువు | enemy', 'టీచర్ | teacher', 'దొంగ | thief'], 'నీతో కలిసి ఆడేవాడు. | Someone who plays with you.', 'దోస్తు = మిత్రుడు. | Same meaning.'],
      ['"సోపతి" లాంటి మరో పదం? | Another word for "sopathi"?', 'స్నేహం | friendship', ['గొడవ | quarrel', 'నిద్ర | sleep', 'ఆకలి | hunger'], 'మిత్రుల మధ్య ఉండేది. | What friends share.', 'సోపతి = స్నేహం. | Same meaning.'],
    ]),
  ]),
], REVIEW);

// ============================================================ 8. తానె తందాన
const W3 = ['అ-[మ్మ]|mother|👩', 'బొ-[మ్మ]|doll|🧸', 'తా-త-[య్య]|grandfather|👴', 'పి-[ల్లి]|cat|🐱', 'ఇ-[ల్లు]|house|🏠', 'గు-[వ్వ]|dove|🕊️', 'పు-[వ్వు]|flower|🌸', 'క-[ళ్ళు]|eyes|👁️', 'కా-[ళ్ళు]|legs|🦶', 'కొ-[మ్మ]|branch|🌳'];
const ch8 = unit(8, 'ch8', 'తానె తందాన | Thane thandaana (a folk rhythm)', [
  o('thandana.theme', 'జానపద లయ: తానె తందాన | Folk rhythm: thane thandaana', [
    P('"తానె తందాన" అనేది జానపద పాటల్లో వచ్చే లయ మాట. పొలంలో పని చేసేటప్పుడు, ఆడేటప్పుడు ఈ లయతో పాడితే అలసట తెలియదు. | "Thane thandaana" is a rhythm phrase in folk songs. Singing it while working in the fields or playing makes tiredness disappear.'),
    ...RHYME('పొలం పాట (మా పాట) | Field song (our rhyme)', [
      'నాట్లు వేద్దాం రారండి — తానె తందానా! | Come, let us plant the paddy, thane thandaanaa!',
      'నీళ్ళు పెడదాం రారండి — తానె తందానా! | Come, let us water it, thane thandaanaa!',
      'పంట కోద్దాం రారండి — తానె తందానా! | Come, let us harvest, thane thandaanaa!',
    ]),
    PH('🌾', 'వరి పంట — రైతులు పాటలు పాడుతూ పండిస్తారు. | Paddy: farmers grow it while singing.'),
    TIP('"తానె తందానా" దగ్గర కాలితో తాళం వేయి: తా-నె తం-దా-నా! | Tap your foot to the beat: thaa-ne tham-daa-naa!'),
  ], [
    EX('పాటలో మొదట ఏం చేశారు? | What did they do first in the song?', ['మొదటి వరుస: "నాట్లు వేద్దాం". | First line: "plant the paddy".'], 'నాట్లు వేశారు | planted paddy'),
    EX('"తానె తందాన" కు అర్థం ఉందా? | Does "thane thandaana" have a meaning?', ['అది లయ కోసం పాడే మాట. | It is sung for the rhythm.'], 'లయ మాట | a rhythm phrase'),
  ], [
    mcq('theme', 'పొలం పాట గుర్తు చేసుకో. | Remember the field song.', [
      ['జానపద పాటలు ఎక్కువగా ఎవరు పాడతారు? | Who often sings folk songs?', 'పల్లె ప్రజలు | village people', ['రోబోలు | robots', 'చేపలు | fish', 'విమానాలు | aeroplanes'], 'పొలాల్లో, ఊరిలో వినిపిస్తాయి. | Heard in fields and villages.', 'జానపద పాటలు పల్లె ప్రజల పాటలు. | Folk songs are village people\'s songs.'],
      ['పని చేస్తూ పాడితే ఏమవుతుంది? | What happens when you sing while working?', 'అలసట తెలియదు | you do not feel tired', ['పని ఆగిపోతుంది | work stops', 'వాన పడుతుంది | it rains', 'నిద్ర వస్తుంది | you sleep'], 'పాట మనసుకు సంతోషం. | A song makes the mind happy.', 'పాటతో పని తేలికగా అనిపిస్తుంది. | Work feels lighter.'],
      ['పాటలో ఏ పంట గురించి చెప్పారు? | Which crop is the song about?', 'వరి | paddy', ['మామిడి | mango', 'పత్తి | cotton', 'చెరకు | sugarcane'], 'నాట్లు వేసేది, మన అన్నం ఇచ్చేది. | It is transplanted and gives us rice.', 'నాట్లు వరి పొలంలో వేస్తారు. | Paddy is transplanted.'],
      ['పంట కోసే ముందు ఏం చేయాలి? | What comes before the harvest?', 'నాట్లు వేసి నీళ్ళు పెట్టాలి | plant and water', ['అమ్మాలి | sell', 'తినాలి | eat', 'వండాలి | cook'], 'పాట వరుసల క్రమం చూడు. | Look at the order of the lines.', 'నాటు → నీరు → కోత. | Plant, water, harvest.'],
      ['"రారండి" అంటే? | What does "raarandi" mean?', 'రండి | come (everyone)', ['వెళ్ళండి | go', 'కూర్చోండి | sit', 'పడుకోండి | sleep'], 'అందరినీ పిలిచే మాట. | A word to call everyone.', 'రారండి = రండి, అందరినీ పిలవడం. | It invites everyone.'],
    ]),
    orderT('song', 'పాట క్రమంలో పెట్టు. | Put the song in order.', [
      ['నాట్లు | planting', 'నీళ్ళు | watering', 'కోత | harvest'],
      ['నాట్లు వేద్దాం | let us plant', 'నీళ్ళు పెడదాం | let us water', 'పంట కోద్దాం | let us harvest', 'బువ్వ తిందాం | let us eat'],
      ['విత్తనం | seed', 'మొలక | sprout', 'పంట | crop'],
    ], 'ముందు విత్తనం, చివర పంట. | Seed first, crop last.'),
  ]),
  o('thandana.ottu', 'ఒత్తులు-3: మ్మ య్య ల్ల వ్వ ళ్ళ | Ottulu 3: mma, yya, lla, vva, LLa', ottuIntro(OT3, 'అమ్మ, తాతయ్య, పిల్లి — మా ఇల్లు నవ్వుల ఇల్లు! | Mother, grandpa, the cat: our house is a house of smiles!', '👩', 'అమ్మ = అ + మ్మ. | Mother (amma) = a + mma.'), [
    EX('"పిల్లి" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "pilli"?', ['పి-ల్లి. | pi-lli.', 'ల కింద ల ఒత్తు. | ల with ల below.'], 'ల్ల'),
    EX('వ + వ = ? | va + va = ?', ['వ కింద వ ఒత్తు. | va with the va ottu below.', 'పువ్వు, గువ్వ లో ఉంది. | As in puvvu, guvva.'], 'వ్వ'),
  ], ottuPractice(W3, OT3)),
  o('thandana.read', 'చదువుదాం: మా ఇల్లు | Reading: our house', [
    ...RHYME('మా ఇల్లు (మా పాట) | Our house (our rhyme)', ['అమ్మ వంట చేసింది. | Mother cooked.', 'తాతయ్య కథ చెప్పాడు. | Grandpa told a story.', 'పిల్లి పాలు తాగింది. | The cat drank milk.', 'గువ్వ కొమ్మ మీద కూర్చుంది. | The dove sat on a branch.']),
    PH('🏠', 'ఇల్లు = ఇ + ల్లు. | House (illu) = i + llu.'),
    TIP('ఒత్తు పదాల కింద గీత గీసి చదువు. | Underline the ottu words as you read.'),
  ], [
    EX('తాతయ్య ఏం చేశాడు? | What did grandpa do?', ['రెండవ వాక్యం. | The second sentence.'], 'కథ చెప్పాడు | told a story'),
    EX('"పిల్లి పాలు తాగింది." ఒత్తు పదం ఏది? | Which is the ottu word?', ['పి-ల్లి — ల్ల ఒత్తు. | pi-lli has lla.'], 'పిల్లి | cat'),
  ], [
    mcq('read', 'వాక్యాలను మళ్ళీ చదువు. | Read the sentences again.', [
      ['వంట ఎవరు చేశారు? | Who cooked?', 'అమ్మ | mother', ['తాతయ్య | grandpa', 'పిల్లి | cat', 'గువ్వ | dove'], 'మొదటి వాక్యం. | The first sentence.', 'అమ్మ వంట చేసింది. | Mother cooked.'],
      ['పిల్లి ఏం తాగింది? | What did the cat drink?', 'పాలు | milk', ['నీళ్ళు | water', 'టీ | tea', 'రసం | juice'], 'మూడవ వాక్యం. | The third sentence.', 'పిల్లి పాలు తాగింది. | The cat drank milk.'],
      ['గువ్వ ఎక్కడ కూర్చుంది? | Where did the dove sit?', 'కొమ్మ మీద | on a branch', ['ఇంటి మీద | on the house', 'నేల మీద | on the ground', 'బుట్టలో | in a basket'], 'చివరి వాక్యం. | The last sentence.', 'గువ్వ కొమ్మ మీద కూర్చుంది. | On a branch.'],
      ['ఈ పదాల్లో "మ్మ" ఒత్తు ఉన్నది ఏది? | Which word has the mma ottu?', 'బొమ్మ | doll', ['బోను | cage', 'బల్ల | bench', 'బువ్వ | food'], 'మ కింద మ. | ma under ma.', 'బొ-మ్మ. | bo-mma.'],
      ['ఈ పదాల్లో "ళ్ళ" ఒత్తు ఉన్నది ఏది? | Which word has the LLa ottu?', 'కళ్ళు | eyes', ['కలలు | dreams', 'కాలు | leg', 'కలం | pen'], 'ళ కింద ళ. | La under La.', 'క-ళ్ళు. | ka-LLu.'],
    ]),
    orderT('sent', 'పదాలను వరుసలో పెట్టి వాక్యం చేయి. | Put the words in order to make the sentence.', [
      ['అమ్మ | mother', 'వంట | cooking', 'చేసింది. | did.'], ['తాతయ్య | grandpa', 'కథ | story', 'చెప్పాడు. | told.'],
      ['పిల్లి | cat', 'పాలు | milk', 'తాగింది. | drank.'], ['గువ్వ | dove', 'కొమ్మ మీద | on the branch', 'కూర్చుంది. | sat.'],
    ], 'ఎవరు ముందు, పని చివర. | Who first, action last.'),
  ]),
], `${REVIEW} ${OTTU_NOTE}`);

// ============================================================ 8*. సోపతి (picture story)
const ch8s = unit('8*', 'ch8s', 'సోపతి | Friendship', [
  o('sopathi.story', 'బొమ్మల కథ: గొడుగు సోపతి | Picture story: friends under one umbrella', [
    P('సోపతి అంటే స్నేహం. నిజమైన దోస్తు కష్టంలో తోడు ఉంటాడు. ఈ బొమ్మల కథ చదువు. | Sopathi means friendship. A true friend stays with you in hard times. Read this picture story.'),
    ...RHYME('ఒకే గొడుగు (మా కథ) | One umbrella (our story)', [
      '🏫 బడి అయిపోయింది. బయట వాన! | School is over. It is raining outside!',
      '☂️ తేజ దగ్గర గొడుగు ఉంది; సనా దగ్గర లేదు. | Teja has an umbrella; Sana does not.',
      '👧 "రా సనా, ఇద్దరం కలిసి వెళ్దాం" అంది తేజ. | "Come Sana, let us go together," said Teja.',
      '🏠 ఇద్దరూ ఒకే గొడుగులో నవ్వుతూ ఇంటికి చేరారు! | Both reached home laughing under one umbrella!',
    ]),
    PH('☂️', 'గొడుగు పంచుకుంటే ఇద్దరూ తడవరు. | Share an umbrella and nobody gets wet.'),
    TIP('నువ్వు నీ దోస్తుకు ఎప్పుడు సాయం చేశావు? ఇంట్లో చెప్పు. | When did you help a friend? Tell someone at home.'),
  ], [
    EX('సనాకు ఏమి లేదు? | What did Sana not have?', ['రెండవ బొమ్మ ☂️. | The second picture ☂️.'], 'గొడుగు | an umbrella'),
    EX('తేజ ఏం చేసింది? | What did Teja do?', ['మూడవ బొమ్మ: "కలిసి వెళ్దాం". | Third picture: "let us go together".'], 'గొడుగు పంచుకుంది | shared her umbrella'),
  ], [
    orderT('seq', 'కథను క్రమంలో పెట్టు. | Put the story in order.', [
      ['🏫 బడి అయింది | school ended', '🌧️ వాన పడింది | it rained', '☂️ గొడుగు పంచుకుంది | shared the umbrella', '🏠 ఇంటికి చేరారు | reached home'],
      ['🌧️ వాన | rain', '👧 పిలిచింది | called her', '🏠 ఇల్లు | home'],
      ['🍎 డబ్బా తెరిచింది | opened her box', '✋ సగం ఇచ్చింది | gave half', '🎉 ఇద్దరూ నవ్వారు | both laughed'],
    ], 'ముందు బడి, తర్వాత వాన. | School first, then rain.'),
    mcq('story', 'కథను మళ్ళీ చూడు. | Look at the story again.', [
      ['"సోపతి" అంటే? | What is "sopathi"?', 'స్నేహం | friendship', ['గొడవ | quarrel', 'వాన | rain', 'బడి | school'], 'దోస్తుల మధ్య ఉండేది. | Between friends.', 'సోపతి = స్నేహం. | sopathi = friendship.'],
      ['బయట ఏం పడుతోంది? | What was falling outside?', 'వాన | rain', ['మంచు | snow', 'ఆకులు | leaves', 'రాళ్ళు | stones'], 'అందుకే గొడుగు కావాలి. | That is why we need an umbrella.', 'బయట వాన పడుతోంది. | It was raining.'],
      ['తేజ మంచి గుణం ఏది? | What was good about Teja?', 'పంచుకోవడం | sharing', ['కోపం | anger', 'అబద్ధం | lying', 'సోమరితనం | laziness'], 'తన గొడుగు ఏం చేసింది? | What did she do with her umbrella?', 'తేజ గొడుగు పంచుకుంది. | Teja shared.'],
      ['ఇద్దరూ ఇంటికి ఎలా చేరారు? | How did they reach home?', 'నవ్వుతూ | laughing', ['ఏడుస్తూ | crying', 'తడిసిపోయి | soaking wet', 'గొడవపడుతూ | quarrelling'], 'చివరి బొమ్మ. | The last picture.', 'ఇద్దరూ నవ్వుతూ చేరారు. | Laughing together.'],
      ['నీ దోస్తు పెన్సిల్ మర్చిపోతే ఏం చేస్తావు? | Your friend forgot a pencil. What will you do?', 'నా పెన్సిల్ పంచుకుంటా | share mine', ['నవ్వుతా | laugh at them', 'టీచర్‌కు చెప్తా | complain', 'పట్టించుకోను | ignore them'], 'తేజ ఏం చేసిందో గుర్తు చేసుకో. | Remember what Teja did.', 'దోస్తుకు సాయం చేయాలి. | Help your friend.'],
    ]),
  ]),
  o('sopathi.talk', 'మాట్లాడదాం: స్నేహ మాటలు | Let us talk: friendly words', [
    P('స్నేహంలో మంచి మాటలు ముఖ్యం: "దయచేసి", "ధన్యవాదాలు", "క్షమించు", "రా, కలిసి ఆడుదాం". | Kind words matter in friendship: please, thank you, sorry, come play with us.'),
    KEYS('సాయం తీసుకున్నప్పుడు: ధన్యవాదాలు | when helped: thank you', 'తప్పు చేసినప్పుడు: క్షమించు | when you make a mistake: sorry', 'అడిగేటప్పుడు: దయచేసి | when asking: please', 'ఒంటరిగా ఉన్నవారిని: రా, కలిసి ఆడుదాం | to someone alone: come, let us play'),
    PH('🙋', 'చేయి ఎత్తి "నేను సాయం చేస్తా!" | Raise your hand: "I will help!"'),
    TIP('రోజుకు ఒక మంచి మాట కొత్తగా వాడు. | Use one kind word in a new way every day.'),
  ], [
    EX('సనా తేజకు ఏమి చెప్పాలి? | What should Sana say to Teja?', ['తేజ సాయం చేసింది. | Teja helped her.'], 'ధన్యవాదాలు | thank you'),
    EX('పొరపాటున దోస్తు పుస్తకం చించితే? | You tore a friend\'s book by mistake. Say?', ['తప్పు ఒప్పుకోవాలి. | Own up to the mistake.'], 'క్షమించు | sorry'),
  ], [
    mcq('words', 'ఆ సమయంలో ఏ మాట సరిపోతుందో ఆలోచించు. | Think which word fits the moment.', [
      ['దోస్తు నీకు చాక్లెట్ ఇచ్చాడు. ఏమంటావు? | A friend gave you a chocolate. You say?', 'ధన్యవాదాలు | thank you', ['క్షమించు | sorry', 'వెళ్ళిపో | go away', 'ఏమీ అనను | nothing'], 'ఎవరైనా ఇచ్చినప్పుడు… | When someone gives you something…', 'ఇచ్చినవారికి ధన్యవాదాలు చెప్పాలి. | Thank the giver.'],
      ['నువ్వు దోస్తు కాలు తొక్కావు. ఏమంటావు? | You stepped on a friend\'s foot. You say?', 'క్షమించు | sorry', ['ధన్యవాదాలు | thank you', 'భలే | great', 'రా | come'], 'పొరపాటు జరిగింది. | A mistake happened.', 'పొరపాటుకు "క్షమించు" అనాలి. | Say sorry.'],
      ['దోస్తు రంగు పెన్సిల్ కావాలి. ఎలా అడుగుతావు? | You want a friend\'s crayon. How do you ask?', 'దయచేసి ఇస్తావా? | please, may I?', ['ఇవ్వు! | give it!', 'లాక్కుంటా | I will grab it', 'దాచేస్తా | I will hide it'], 'మర్యాదగా అడగాలి. | Ask politely.', '"దయచేసి" అని అడగాలి. | Use please.'],
      ['కొత్త పిల్లవాడు ఒంటరిగా ఉన్నాడు. ఏమంటావు? | A new child is alone. You say?', 'రా, కలిసి ఆడుదాం | come, let us play', ['దూరంగా ఉండు | stay away', 'నువ్వు వద్దు | not you', 'ఏమీ అనను | nothing'], 'అతనికి సోపతి కావాలి. | He needs a friend.', 'కొత్తవారిని ఆటకు పిలవాలి. | Invite them to play.'],
      ['దోస్తు ఆటలో ఓడిపోయి బాధపడుతున్నాడు. ఏమంటావు? | A friend lost a game and is sad. You say?', 'పర్వాలేదు, మళ్ళీ ఆడుదాం | it is okay, let us play again', ['నువ్వు ఓడిపోయావు! | you lost!', 'హహ్హా | haha', 'వెళ్ళిపో | go away'], 'దోస్తుకు ధైర్యం చెప్పు. | Cheer your friend up.', 'ఓదార్చే మాటలు స్నేహం పెంచుతాయి. | Comforting words grow friendship.'],
    ]),
    matchT('match', 'సందర్భాన్ని మాటతో కలుపు | Match the moment to the word', [
      ['సాయం పొందాను | I was helped', 'ధన్యవాదాలు | thank you'], ['తప్పు చేశాను | I made a mistake', 'క్షమించు | sorry'], ['ఏదైనా అడగాలి | I want to ask', 'దయచేసి | please'],
      ['కొత్త దోస్తు | a new friend', 'రా, ఆడుదాం | come, play'], ['దోస్తు బాధలో | a sad friend', 'పర్వాలేదు | it is okay'],
    ], 'నువ్వే ఆ సమయంలో ఉన్నట్టు ఊహించు. | Imagine you are in that moment.'),
  ]),
], REVIEW);

/** Intro for joined letters made of two DIFFERENT consonants (samyuktaksharalu). */
const samIntro = (what: string, conjs: string[], example: string, emoji: string, pic: string): Block[] => [
  P(`రెండు వేర్వేరు హల్లులు కలిస్తే అది సంయుక్తాక్షరం. ఈ పాఠంలో ${t(what).te}. | When two different consonants join, we get a samyukta (joined) letter. In this lesson: ${t(what).en}.`),
  KEYS(...conjs.map((c) => `${c} = ${c[0]} + ${c[2]} | ${rom(c[0])} + ${rom(c[2])}`)),
  PH(emoji, pic),
  ...RHYME('ఒత్తుల ఆట | Ottu game', [example, 'ముందు పైన ఉన్న అక్షరం, తర్వాత కింద ఒత్తు — రెండూ కలిపి ఒకే దెబ్బకు పలుకు! | Top letter first, then the ottu below; say both together in one go!']),
  TIP('ఒత్తు ఏ అక్షరానిదో తెలియాలంటే, అదే అక్షరం పూర్తిగా ఎలా ఉంటుందో గుర్తు చేసుకో. | To know whose ottu it is, recall what that full letter looks like.'),
];

// ============================================================ 9. మా బుజ్జీ
const OT4 = ['జ్జ', 'ర్ర', 'స్స', 'ట్ట'];
const W4 = ['బు-[జ్జి]|little one|👶', 'మ-[జ్జి]-గ|buttermilk|🥛', 'గ-[జ్జె]-లు|anklet bells|🔔', 'క-[ర్ర]|stick|🪵', 'బు-[ర్ర]|head|🧒', 'ఎ-[ర్ర]-ని|red|🔴', 'బ-[స్సు]|bus|🚌', 'మ-న-[స్సు]|mind|💭', 'వ-య-[స్సు]|age|👴', 'పొ-[ట్టే]-లు|ram|🐑'];
const ch9 = unit(9, 'ch9', 'మా బుజ్జీ | Our little one', [
  o('bujji.theme', 'ఇంట్లో చిన్నారి | The baby at home', [
    P('ఇంట్లో చిన్న పాపను / బాబును ముద్దుగా "బుజ్జీ" అని పిలుస్తారు. బుజ్జికి స్నానం, పాలు, నిద్ర, ఆట — అన్నీ మనం ప్రేమగా చూసుకుంటాం. | At home we lovingly call a baby "bujji". We care for the baby\'s bath, milk, sleep and play.'),
    ...RHYME('జోల పాట — పాత పల్లవి | Lullaby: a traditional refrain', [
      'చందమామ రావే, జాబిల్లి రావే | Come, dear moon; come, lovely moon (a traditional lullaby line)',
      'బుజ్జి కళ్ళు మూసింది, గువ్వ గూటికి చేరింది | Baby closed her eyes; the dove went to its nest (our line)',
      'జో జో జో — నిద్రపో బుజ్జీ! | Jo jo jo, sleep, little one! (our line)',
    ]),
    PH('👶', 'బుజ్జి — ఇంట్లో అందరి ముద్దుల చిన్నారి. | Bujji, the darling of the house.'),
    TIP('జోల పాట నెమ్మదిగా, మెత్తగా పాడాలి — బొమ్మను ఊపుతూ పాడి చూడు. | Sing a lullaby slowly and softly; rock a doll while you sing.'),
  ], [
    EX('బుజ్జిని నిద్రపుచ్చడానికి ఏం పాడతారు? | What do we sing to put the baby to sleep?', ['నెమ్మదిగా పాడే పాట. | A slow, soft song.'], 'జోల పాట | lullaby'),
    EX('"చందమామ రావే" లో ఎవరిని పిలుస్తున్నారు? | Who is called in "chandamaama raave"?', ['చందమామ = చంద్రుడు. | chandamaama = the moon.'], 'చందమామను | the moon'),
  ], [
    mcq('theme', 'చిన్నారిని ఎలా చూసుకుంటామో ఆలోచించు. | Think about how we care for a baby.', [
      ['బుజ్జి ఏడిస్తే ఏం చేస్తాం? | What do we do when the baby cries?', 'ఎత్తుకొని ఊరడిస్తాం | pick her up and comfort her', ['గట్టిగా అరుస్తాం | shout', 'వదిలేస్తాం | leave her', 'నవ్వుతాం | laugh at her'], 'బుజ్జికి ప్రేమ కావాలి. | The baby needs love.', 'ఎత్తుకొని ప్రేమగా ఊరడిస్తాం. | We hold and comfort her.'],
      ['బుజ్జి పడుకున్నప్పుడు మనం ఎలా ఉండాలి? | How should we be when the baby sleeps?', 'నిశ్శబ్దంగా | quiet', ['గోలగా | noisy', 'డప్పు కొడుతూ | drumming', 'పరుగెత్తుతూ | running'], 'శబ్దం వస్తే బుజ్జి లేస్తుంది. | Noise wakes the baby.', 'నిశ్శబ్దంగా ఉండాలి. | Stay quiet.'],
      ['బుజ్జి ఏం తాగుతుంది? | What does the baby drink?', 'పాలు | milk', ['కాఫీ | coffee', 'టీ | tea', 'సోడా | soda'], 'పళ్ళు రాని చిన్నారికి… | For a baby without teeth…', 'చిన్నారికి పాలు. | Babies drink milk.'],
      ['జోల పాట ఎలా పాడాలి? | How do we sing a lullaby?', 'నెమ్మదిగా, మెత్తగా | slowly and softly', ['గట్టిగా అరుస్తూ | loudly', 'వేగంగా | very fast', 'ఏడుస్తూ | crying'], 'నిద్రపుచ్చే పాట. | It is a song for sleep.', 'జోల పాట నెమ్మదిగా పాడతారు. | Lullabies are slow and soft.'],
      ['బుజ్జితో ఆడేటప్పుడు ఏది ఇవ్వకూడదు? | What must we NOT give the baby to play with?', 'చిన్న గోళీలు | tiny marbles', ['మెత్తని బొమ్మ | a soft toy', 'గిలక్కాయ | a rattle', 'పెద్ద బంతి | a big ball'], 'చిన్నవి నోట్లో పెట్టుకుంటే ప్రమాదం. | Small things in the mouth are dangerous.', 'చిన్న వస్తువులు బుజ్జికి ప్రమాదం. | Tiny things are unsafe for babies.'],
    ]),
    tapT('tap', 'బుజ్జి కోసం ఉపయోగపడేవి ఎంచుకో. | Tap the things useful for the baby.', [
      ['పాల సీసా | milk bottle', true], ['మెత్తని బొమ్మ | soft toy', true], ['ఊయల | cradle', true], ['గిలక్కాయ | rattle', true], ['చిన్న దుప్పటి | small blanket', true],
      ['కత్తి | knife', false], ['అగ్గిపెట్టె | matchbox', false], ['సూది | needle', false], ['గోళీలు | marbles', false],
    ], 'బుజ్జికి సురక్షితమైనవే ఇవ్వాలి. | Only safe things for the baby.'),
  ]),
  o('bujji.ottu', 'ఒత్తులు-4: జ్జ ర్ర స్స (ట్ట) | Ottulu 4: jja, rra, ssa (and TTa)', ottuIntro(OT4, 'బుజ్జి ఎర్రని బస్సు ఎక్కి, గజ్జెలు ఘల్లుమనిపించింది! | Bujji rode the red bus and jingled her anklets!', '👶', 'బుజ్జి = బు + జ్జి. | bujji = bu + jji.'), [
    EX('"కర్ర" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "karra"?', ['క-ర్ర. | ka-rra.', 'ర కింద ర ఒత్తు. | ra with ra below.'], 'ర్ర'),
    EX('"బస్సు" ను విడదీయి. | Break "bassu" into parts.', ['బ + స్సు. | ba + ssu.', 'స కింద స ఒత్తు, ఉ గుర్తు. | sa with sa below and the u sign.'], 'బ + స్సు'),
  ], ottuPractice(W4, OT4)),
  o('bujji.read', 'చదువుదాం: బుజ్జి రోజు | Reading: Bujji\'s day', [
    ...RHYME('బుజ్జి రోజు (మా కథ) | Bujji\'s day (our story)', ['బుజ్జి పొద్దున్నే నవ్వింది. | Bujji laughed in the morning.', 'అక్క బుజ్జికి స్నానం చేయించింది. | Sister gave Bujji a bath.', 'బుజ్జి గజ్జెలతో పాకింది. | Bujji crawled with her anklets jingling.', 'రాత్రి జోల పాటకు నిద్రపోయింది. | At night she slept to a lullaby.']),
    PH('🔔', 'గజ్జెలు — ఘల్లు ఘల్లు! | Anklet bells: ghallu ghallu!'),
    TIP('కథ చదివాక "పొద్దున్న, రాత్రి" ఏం జరిగిందో వేళ్ళ మీద లెక్కపెట్టు. | After reading, count on your fingers what happened from morning to night.'),
  ], [
    EX('బుజ్జికి స్నానం ఎవరు చేయించారు? | Who bathed Bujji?', ['రెండవ వాక్యం. | The second sentence.'], 'అక్క | sister'),
    EX('బుజ్జి ఎప్పుడు నిద్రపోయింది? | When did Bujji sleep?', ['చివరి వాక్యం: "రాత్రి". | The last sentence: "at night".'], 'రాత్రి | at night'),
  ], [
    mcq('story', 'కథను మళ్ళీ చదువు. | Read the story again.', [
      ['బుజ్జి పొద్దున్నే ఏం చేసింది? | What did Bujji do in the morning?', 'నవ్వింది | laughed', ['ఏడ్చింది | cried', 'పాడింది | sang', 'చదివింది | read'], 'మొదటి వాక్యం. | The first sentence.', 'బుజ్జి పొద్దున్నే నవ్వింది. | She laughed.'],
      ['బుజ్జి దేనితో పాకింది? | Bujji crawled wearing what?', 'గజ్జెలతో | anklet bells', ['బూట్లతో | shoes', 'టోపీతో | a cap', 'సంచితో | a bag'], 'ఘల్లు ఘల్లు శబ్దం. | The jingling sound.', 'బుజ్జి గజ్జెలతో పాకింది. | With anklet bells.'],
      ['బుజ్జి దేనికి నిద్రపోయింది? | Bujji slept to what?', 'జోల పాటకు | a lullaby', ['డప్పుకు | a drum', 'టీవీకి | the TV', 'హారన్‌కు | a horn'], 'చివరి వాక్యం. | The last sentence.', 'జోల పాటకు నిద్రపోయింది. | To a lullaby.'],
      ['"గజ్జెలు" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "gajjelu"?', 'జ్జె', ['జె', 'జ్జు', 'ర్రె'], 'గ-జ్జె-లు. | ga-jje-lu.', 'జ కింద జ ఒత్తు, ఎ గుర్తు: జ్జె. | ja with ja below and the e sign.'],
      ['ఈ కథలో మొదట జరిగింది ఏది? | What happened first in the story?', 'బుజ్జి నవ్వింది | Bujji laughed', ['నిద్రపోయింది | she slept', 'పాకింది | she crawled', 'స్నానం | the bath'], '"పొద్దున్నే" అనే పదం. | The word "early morning".', 'పొద్దున్నే నవ్వింది — అదే మొదట. | Laughing came first.'],
    ]),
    orderT('seq', 'బుజ్జి రోజును క్రమంలో పెట్టు. | Put Bujji\'s day in order.', [
      ['నవ్వింది | laughed', 'స్నానం | bath', 'పాకింది | crawled', 'నిద్రపోయింది | slept'],
      ['పొద్దున్న | morning', 'మధ్యాహ్నం | afternoon', 'సాయంత్రం | evening', 'రాత్రి | night'],
    ], 'రోజు పొద్దున్నతో మొదలవుతుంది. | The day starts in the morning.'),
  ]),
], `${REVIEW} ${OTTU_NOTE}`);

// ============================================================ 10. బుక్కెడంత బువ్వ — ra-ottu
const OT5 = ['క్ర', 'గ్ర', 'త్ర', 'ద్ర', 'ప్ర', 'శ్ర'];
const W5 = ['చ-[క్రం]|wheel|🛞', '[గ్రా]-మం|village|🏘️', 'రా-[త్రి]|night|🌙', 'చి-[త్రం]|picture|🎨', 'స-ము-[ద్రం]|sea|⛵', 'చం-[ద్రు]-డు|moon|🌙', '[ప్రే]-మ|love|🙏', '[శ్ర]-మ|hard work|💪', 'మి-[త్రు]-డు|friend|👦', '[ప్ర]-తి-రో-జు|every day|🌅'];
const ch10 = unit(10, 'ch10', 'బుక్కెడంత బువ్వ | A mouthful of food', [
  o('buvva.theme', 'అన్నం విలువ, పంచుకోవడం | The value of food and sharing', [
    P('"బుక్కెడు" అంటే ఒక ముద్ద, "బువ్వ" అంటే అన్నం. రైతు ఎంతో శ్రమతో పండించిన అన్నాన్ని వృథా చేయకూడదు. ఆకలితో ఉన్నవారికి ఒక ముద్ద పెడితే పెద్ద మేలు. | "Bukkedu" is a mouthful, "buvva" is rice. Farmers work hard to grow it, so we must not waste food. Sharing even a mouthful with a hungry one is a big kindness.'),
    ...RHYME('ముద్ద ముద్ద (మా పాట) | Mouthful by mouthful (our rhyme)', [
      'ఒక ముద్ద అమ్మకు, ఒక ముద్ద నాన్నకు | One mouthful for mother, one for father',
      'ఒక ముద్ద పిచ్చుకకు, ఒక ముద్ద నాకు | One for the sparrow, one for me',
      'పళ్ళెంలో ఒక్క మెతుకు మిగలదు చూడు! | Look, not a single grain is left on the plate!',
    ]),
    PH('🌾', 'వరి పంట నుండే మన బువ్వ. | Our rice comes from the paddy crop.'),
    TIP('భోజనం అయ్యాక పళ్ళెం చూడు — మెతుకులు మిగిలాయా? | After eating, check your plate: any grains left?'),
  ], [
    EX('"బువ్వ" అంటే ఏమిటి? | What is "buvva"?', ['అమ్మ ప్రేమగా పెట్టే అన్నం. | The rice mother serves with love.'], 'అన్నం | rice'),
    EX('అన్నం ఎందుకు వృథా చేయకూడదు? | Why should we not waste food?', ['రైతు ఎంతో కష్టపడి పండిస్తాడు. | The farmer works very hard to grow it.'], 'రైతు శ్రమ | the farmer\'s hard work'),
  ], [
    mcq('theme', 'బువ్వ పాట, పాఠం గుర్తు చేసుకో. | Remember the food song and lesson.', [
      ['"బుక్కెడు" అంటే? | What is "bukkedu"?', 'ఒక ముద్ద | one mouthful', ['ఒక బుట్ట | one basket', 'ఒక పుస్తకం | one book', 'ఒక చెట్టు | one tree'], 'చేత్తో నోట్లో పెట్టుకునేంత. | As much as fits in the mouth.', 'బుక్కెడు = ఒక ముద్ద. | bukkedu = a mouthful.'],
      ['పాటలో పిచ్చుకకు ఏం పెట్టారు? | What was given to the sparrow?', 'ఒక ముద్ద | a mouthful', ['ఒక బొమ్మ | a toy', 'ఒక పువ్వు | a flower', 'ఏమీ లేదు | nothing'], 'మూడవ వరుస. | The third line.', 'పిచ్చుకకూ ఒక ముద్ద. | A mouthful for the sparrow too.'],
      ['అన్నం పండించేది ఎవరు? | Who grows rice?', 'రైతు | farmer', ['డ్రైవర్ | driver', 'టైలర్ | tailor', 'పోలీస్ | police'], 'పొలంలో పని చేసేవారు. | One who works in the fields.', 'రైతు వరి పండిస్తాడు. | The farmer grows paddy.'],
      ['పళ్ళెంలో అన్నం మిగిల్చితే? | If we leave rice on the plate?', 'వృథా అవుతుంది | it is wasted', ['పెరుగుతుంది | it grows', 'పువ్వు అవుతుంది | it becomes a flower', 'ఎగిరిపోతుంది | it flies away'], 'ఎవరూ తినలేరు. | No one can eat it.', 'మిగిల్చిన అన్నం వృథా. | Leftover food is wasted.'],
      ['ఆకలితో ఉన్న దోస్తును చూస్తే? | You see a hungry friend. You…', 'నా బువ్వ పంచుకుంటా | share my food', ['దాచుకుంటా | hide my food', 'నవ్వుతా | laugh', 'వెళ్ళిపోతా | walk away'], 'పాట చెప్పిన మంచి పని. | The good deed in the song.', 'పంచుకోవడం మంచి గుణం. | Sharing is a good habit.'],
    ]),
    orderT('seq', 'బువ్వ ఎలా వస్తుందో క్రమంలో పెట్టు. | Put the journey of rice in order.', [
      ['విత్తనం | seed', 'వరి మొక్క | paddy plant', 'బియ్యం | rice grains', 'బువ్వ | cooked rice'],
      ['పొలం | field', 'కోత | harvest', 'బియ్యం | rice', 'వంట | cooking'],
      ['అమ్మ వండింది | mother cooked', 'పళ్ళెంలో పెట్టింది | served', 'అందరం తిన్నాం | we all ate'],
    ], 'ముందు పొలం / విత్తనం. | The field or the seed comes first.'),
  ]),
  o('buvva.ottu', 'ర ఒత్తు: క్ర గ్ర త్ర ద్ర ప్ర శ్ర | The ra-ottu: kra, gra, thra, dra, pra, shra', samIntro('ర ఒత్తు (్ర) నేర్చుకుందాం | the ra-ottu (్ర)', OT5, 'రాత్రి చంద్రుడు గ్రామం మీద ప్రేమగా నవ్వాడు! | At night the moon smiled lovingly over the village!', '🛞', 'చక్రం = చ + క్రం. ర ఒత్తు వంకరగా కింద. | wheel (chakram) = cha + kram; the ra-ottu curls below.'), [
    EX('"రాత్రి" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "raathri"?', ['రా-త్రి. | raa-thri.', 'త కింద ర ఒత్తు, ఇ గుర్తు. | tha with the ra-ottu below and the i sign.'], 'త్రి'),
    EX('ప + ర = ? | pa + ra = ?', ['ప కింద ర ఒత్తు ్ర. | pa with the ra-ottu below.', 'ప్రేమ లో వస్తుంది. | As in prema (love).'], 'ప్ర'),
  ], ottuPractice(W5, OT5)),
  o('buvva.read', 'చదువుదాం: మిత్రుని బువ్వ | Reading: sharing with a friend', [
    ...RHYME('మిత్రుని బువ్వ (మా కథ) | A friend\'s lunch (our story)', ['కిరణ్ బువ్వ డబ్బా తెరిచాడు. | Kiran opened his lunch box.', 'మిత్రుడు అనిల్ డబ్బా తేలేదు. | His friend Anil had not brought one.', 'కిరణ్ సగం బువ్వ అనిల్‌కు పెట్టాడు. | Kiran gave Anil half his food.', 'ఇద్దరూ ప్రేమగా తిన్నారు. | Both ate happily together.']),
    PH('👦', 'కిరణ్ మంచి మిత్రుడు. | Kiran is a good friend.'),
    TIP('ప్రతి వాక్యంలో "ఎవరు?" అనేది వేలితో చూపించు. | Point to "who" in each sentence.'),
  ], [
    EX('డబ్బా తేనిది ఎవరు? | Who did not bring a lunch box?', ['రెండవ వాక్యం. | The second sentence.'], 'అనిల్ | Anil'),
    EX('కిరణ్ ఎంత బువ్వ ఇచ్చాడు? | How much food did Kiran give?', ['మూడవ వాక్యం: "సగం". | Third sentence: "half".'], 'సగం | half'),
  ], [
    mcq('story', 'కథను మళ్ళీ చదువు. | Read the story again.', [
      ['కిరణ్ ఏం తెరిచాడు? | What did Kiran open?', 'బువ్వ డబ్బా | lunch box', ['తలుపు | door', 'పుస్తకం | book', 'కిటికీ | window'], 'మొదటి వాక్యం. | The first sentence.', 'కిరణ్ బువ్వ డబ్బా తెరిచాడు. | His lunch box.'],
      ['అనిల్ కిరణ్‌కు ఏమవుతాడు? | Who is Anil to Kiran?', 'మిత్రుడు | friend', ['తాత | grandpa', 'టీచర్ | teacher', 'తమ్ముడు | younger brother'], '"మిత్రుడు అనిల్". | "his friend Anil".', 'అనిల్ కిరణ్ మిత్రుడు. | Anil is his friend.'],
      ['ఇద్దరూ ఎలా తిన్నారు? | How did they eat?', 'ప్రేమగా కలిసి | happily together', ['గొడవపడుతూ | quarrelling', 'ఏడుస్తూ | crying', 'ఒంటరిగా | alone'], 'చివరి వాక్యం. | The last sentence.', 'ఇద్దరూ ప్రేమగా తిన్నారు. | Happily together.'],
      ['"మిత్రుడు" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "mithrudu"?', 'త్రు', ['తు', 'ద్రు', 'క్రు'], 'మి-త్రు-డు. | mi-thru-du.', 'త కింద ర ఒత్తు, ఉ గుర్తు: త్రు. | tha + ra-ottu + u sign.'],
      ['"ప్రేమగా" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "premagaa"?', 'ప్రే', ['పే', 'క్రే', 'త్రే'], 'ప్రే-మ-గా. | pre-ma-gaa.', 'ప కింద ర ఒత్తు, ఏ గుర్తు: ప్రే. | pa + ra-ottu + ee sign.'],
    ]),
    orderT('sent', 'పదాలను వరుసలో పెట్టి వాక్యం చేయి. | Put the words in order to make the sentence.', [
      ['కిరణ్ | Kiran', 'డబ్బా | box', 'తెరిచాడు. | opened.'], ['మిత్రుడు | friend', 'బువ్వ | food', 'తిన్నాడు. | ate.'],
      ['రాత్రి | night', 'చంద్రుడు | moon', 'వచ్చాడు. | came.'], ['గ్రామంలో | in the village', 'చక్రాల | wheeled', 'బండి. | cart.'],
    ], 'వాక్యం ఎలా వినిపిస్తే సహజంగా ఉందో పలికి చూడు. | Say it aloud and hear what sounds natural.'),
  ]),
], `${REVIEW} ${OTTU_NOTE}`);

// ============================================================ 11. ముత్యాల చెమ్మచెక్క — ya-ottu
const OT6 = ['త్య', 'ద్య', 'వ్య', 'క్య', 'ధ్య'];
const W6 = ['ము-[త్యా]-లు|pearls|✨', 'వి-[ద్య]|learning|📚', 'స-[త్యం]|truth|✅', '[వ్యా]-యా-మం|exercise|💪', 'మా-ణి-[క్యం]|ruby|🔴', 'మ-[ధ్య]|middle|🎯', 'ని-[త్యం]|daily|🌅', 'ప-[ద్యం]|poem|📜', 'వై-[ద్యు]-డు|doctor|🧑‍⚕️', '[ధ్యా]-నం|meditation|🧘'];
const ch11 = unit(11, 'ch11', 'ముత్యాల చెమ్మచెక్క | Pearl clapping game', [
  o('chemma.theme', 'చెమ్మచెక్క: చప్పట్ల ఆట | Chemmachekka: a clapping game', [
    P('చెమ్మచెక్క ఇద్దరు ఎదురెదురుగా కూర్చుని, పాట పాడుతూ ఒకరి చేతులు ఒకరు తట్టుకునే పాత ఆట. పాటలో ముత్యాలు, రత్నాలు, పగడాలు వంటి అందమైన మాటలు వస్తాయి. | Chemmachekka is an old game: two children sit face to face, sing and clap each other\'s hands. The songs are full of pretty words like pearls, gems and corals.'),
    ...RHYME('మా చప్పట్ల పాట (చెమ్మచెక్క లయలో) | Our clapping song (in chemmachekka rhythm)', [
      'చప్పట్లు చప్పట్లు, చిన్నారి చప్పట్లు | Claps, claps, little claps',
      'ముత్యాల ముగ్గులు, ముంగిట్లో ముగ్గులు | Pearl-white rangoli at the doorstep',
      'రత్నాల రంగులు, రంగవల్లి రంగులు | Jewel colours, rangoli colours',
      'అందరం కలిసి ఆడుదాం చప్పట్లు! | Let us all clap together!',
    ]),
    PH('👐', 'చెయ్యి-చెయ్యి తట్టు, ఒడి తట్టు! | Clap hand to hand, then pat your lap!'),
    TIP('ఒక దోస్తుతో ఎదురెదురుగా కూర్చుని: సొంత చప్పట్లు, కుడి చెయ్యి, సొంత చప్పట్లు, ఎడమ చెయ్యి! | Sit facing a friend: clap, right hands, clap, left hands!'),
  ], [
    EX('చెమ్మచెక్క ఎంతమంది ఆడతారు? | How many play chemmachekka?', ['ఎదురెదురుగా కూర్చుంటారు. | They sit facing each other.'], 'ఇద్దరు | two'),
    EX('ముగ్గు ఎక్కడ వేస్తారు? | Where is rangoli drawn?', ['పాటలో: "ముంగిట్లో". | The song says "at the doorstep".'], 'ముంగిట్లో | at the doorstep'),
  ], [
    mcq('theme', 'ఆట, పాట గుర్తు చేసుకో. | Remember the game and the song.', [
      ['చెమ్మచెక్కలో చేతులతో ఏం చేస్తారు? | What do hands do in chemmachekka?', 'చప్పట్లు తట్టుకుంటారు | clap each other\'s hands', ['రాస్తారు | write', 'బంతి విసురుతారు | throw a ball', 'వంట చేస్తారు | cook'], 'ఇది చప్పట్ల ఆట. | It is a clapping game.', 'చేతులు తట్టుకుంటూ పాడతారు. | They clap hands and sing.'],
      ['"ముత్యాలు" అంటే? | What are "muthyaalu"?', 'తెల్లని మెరిసే రత్నాలు | shiny white pearls', ['పూలు | flowers', 'రాళ్ళు | stones', 'పండ్లు | fruits'], 'సముద్రంలో ఆల్చిప్పల్లో దొరుకుతాయి. | Found inside oyster shells in the sea.', 'ముత్యాలు = pearls. | muthyaalu = pearls.'],
      ['ముగ్గు దేనితో వేస్తారు? | What is rangoli drawn with?', 'ముగ్గు పిండితో | rangoli powder', ['ఇంకుతో | ink', 'నీళ్ళతో మాత్రమే | only water', 'మట్టితో | mud'], 'తెల్లని పొడి. | A white powder.', 'ముగ్గు పిండితో ముగ్గు వేస్తారు. | With rangoli powder.'],
      ['ఈ ఆట ఎక్కడ ఆడొచ్చు? | Where can this game be played?', 'ఎక్కడైనా, కూర్చొని | anywhere, sitting down', ['నీటిలో మాత్రమే | only in water', 'చెట్టు పైన | on top of a tree', 'బస్సు నడుపుతూ | while driving a bus'], 'ఏ వస్తువూ అక్కర్లేదు. | You need nothing but hands.', 'చేతులు ఉంటే చాలు! | Hands are enough!'],
      ['ఈ ఆట ఆడితే ఏది పెరుగుతుంది? | What grows when we play this game?', 'స్నేహం, ఏకాగ్రత | friendship and focus', ['కోపం | anger', 'ఆకలి మాత్రమే | only hunger', 'నిద్ర | sleep'], 'దోస్తుతో కలిసి, లయ తప్పకుండా ఆడాలి. | You play together and keep the beat.', 'స్నేహం, ధ్యాస రెండూ పెరుగుతాయి. | Friendship and focus grow.'],
    ]),
    orderT('clap', 'చప్పట్ల క్రమం చెప్పు. | Put the clap steps in order.', [
      ['సొంత చప్పట్లు | own clap', 'కుడి చెయ్యి | right hands', 'ఒడి తట్టు | pat lap', 'ఎడమ చెయ్యి | left hands'],
      ['ఎదురుగా కూర్చో | sit facing', 'పాట మొదలుపెట్టు | start the song', 'చప్పట్లు కొట్టు | clap'],
      ['ముత్యాలు | pearls', 'రత్నాలు | gems', 'పగడాలు | corals'],
    ], 'ముందు సిద్ధంగా కూర్చోవాలి. | First sit ready.'),
  ]),
  o('chemma.ottu', 'య ఒత్తు: త్య ద్య వ్య క్య ధ్య | The ya-ottu: thya, dya, vya, kya, dhya', samIntro('య ఒత్తు (్య) నేర్చుకుందాం | the ya-ottu (్య)', OT6, 'ముత్యాల విద్య, సత్యం నిత్యం! | Pearl-bright learning, truth every day!', '📚', 'విద్య = వి + ద్య. య ఒత్తు అక్షరం పక్కన కింద. | learning (vidya) = vi + dya; the ya-ottu sits low beside it.'), [
    EX('"ముత్యాలు" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "muthyaalu"?', ['ము-త్యా-లు. | mu-thyaa-lu.', 'త కింద య ఒత్తు, ఆ గుర్తు. | tha + ya-ottu + aa sign.'], 'త్యా'),
    EX('ద + య = ? | da + ya = ?', ['ద కింద య ఒత్తు. | da with the ya-ottu.', 'విద్య, పద్యం లో వస్తుంది. | As in vidya, padyam.'], 'ద్య'),
  ], ottuPractice(W6, OT6)),
  o('chemma.read', 'చదువుదాం: ముగ్గుల పోటీ | Reading: the rangoli contest', [
    ...RHYME('ముగ్గుల పోటీ (మా కథ) | The rangoli contest (our story)', ['సంక్రాంతికి ముగ్గుల పోటీ జరిగింది. | There was a rangoli contest for Sankranti.', 'దియా ముత్యాల ముగ్గు వేసింది. | Diya drew a pearl-dot rangoli.', 'మధ్యలో ఎర్రని రంగు నింపింది. | She filled red colour in the middle.', 'అందరూ "భలే!" అని చప్పట్లు కొట్టారు. | Everyone clapped and said "Wonderful!"']),
    PH('🎨', 'రంగుల ముగ్గు. | A colourful rangoli.'),
    TIP('కొత్త పదం ఎదురైతే అక్షరం అక్షరం విడదీసి చదువు. | Break a new word letter by letter.'),
  ], [
    EX('ముగ్గుల పోటీ ఏ పండుగకు? | For which festival was the contest?', ['మొదటి వాక్యం. | The first sentence.'], 'సంక్రాంతి | Sankranti'),
    EX('దియా మధ్యలో ఏ రంగు నింపింది? | Which colour did Diya fill in the middle?', ['మూడవ వాక్యం. | The third sentence.'], 'ఎరుపు | red'),
  ], [
    mcq('story', 'కథను మళ్ళీ చదువు. | Read the story again.', [
      ['దియా ఏ ముగ్గు వేసింది? | What rangoli did Diya draw?', 'ముత్యాల ముగ్గు | pearl-dot rangoli', ['పూల ముగ్గు | flower rangoli', 'చేప ముగ్గు | fish rangoli', 'రథం ముగ్గు | chariot rangoli'], 'రెండవ వాక్యం. | The second sentence.', 'దియా ముత్యాల ముగ్గు వేసింది. | A pearl-dot rangoli.'],
      ['అందరూ ఏమన్నారు? | What did everyone say?', '"భలే!" | "Wonderful!"', ['"అయ్యో!" | "Oh no!"', '"వద్దు!" | "Don\'t!"', '"ఆపు!" | "Stop!"'], 'చివరి వాక్యం. | The last sentence.', 'అందరూ "భలే!" అన్నారు. | They said "Wonderful!"'],
      ['"మధ్యలో" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "madhyalo"?', 'ధ్య', ['ద్య', 'ధ', 'త్య'], 'మ-ధ్య-లో. | ma-dhya-lo.', 'ధ కింద య ఒత్తు: ధ్య. | dha with the ya-ottu.'],
      ['ముగ్గుల పోటీ ఏ నెలలో వచ్చే పండుగకు? | The contest was for a festival in which month?', 'జనవరి | January', ['మే | May', 'ఆగస్టు | August', 'అక్టోబరు | October'], 'సంక్రాంతి, గాలిపటాల పండుగ. | Sankranti, the kite festival.', 'సంక్రాంతి జనవరిలో వస్తుంది. | Sankranti is in January.'],
      ['"ముత్యాల" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "muthyaala"?', 'త్యా', ['తా', 'ద్యా', 'త్తా'], 'ము-త్యా-ల. | mu-thyaa-la.', 'త కింద య ఒత్తు, ఆ గుర్తు. | tha + ya-ottu + aa sign.'],
    ]),
    orderT('sent', 'పదాలను వరుసలో పెట్టి వాక్యం చేయి. | Put the words in order to make the sentence.', [
      ['దియా | Diya', 'ముగ్గు | rangoli', 'వేసింది. | drew.'], ['అందరూ | everyone', 'చప్పట్లు | claps', 'కొట్టారు. | gave.'],
      ['వైద్యుడు | doctor', 'నిత్యం | daily', 'వ్యాయామం | exercise', 'చేస్తాడు. | does.'], ['మేము | we', 'పద్యం | poem', 'చదివాము. | read.'],
    ], 'ఎవరు ముందు, పని చివర. | Who first, action last.'),
  ]),
], `${REVIEW} ${OTTU_NOTE}`);

// ============================================================ 11*. ఆలోచన (picture story)
const ch11s = unit('11*', 'ch11s', 'ఆలోచన | A clever idea', [
  o('alochana.story', 'బొమ్మల కథ: దాహం వేసిన కాకి | Picture story: the thirsty crow', [
    P('ఇది అందరికీ తెలిసిన పాత నీతి కథ — మన మాటల్లో. ఆలోచిస్తే ఏ కష్టానికైనా దారి దొరుకుతుంది. | This is a well-known old fable, told in our own words. If you think, you can find a way out of any trouble.'),
    ...RHYME('దాహం వేసిన కాకి | The thirsty crow', [
      '☀️ ఎండ బాగా కాస్తోంది. కాకికి దాహం వేసింది. | The sun was hot. The crow was thirsty.',
      '🪣 ఒక కుండలో కొంచెం నీళ్ళు కనిపించాయి — కానీ అడుగున! | It found a pot with a little water, but only at the bottom!',
      '🪨 కాకి ఆలోచించింది. గులకరాళ్ళు ఒక్కొక్కటిగా వేసింది. | The crow thought, and dropped pebbles in one by one.',
      '💧 నీళ్ళు పైకి వచ్చాయి! కాకి తాగి ఎగిరిపోయింది. | The water rose! The crow drank and flew away.',
    ]),
    PH('🐦‍⬛', 'తెలివైన కాకి. | The clever crow.'),
    TIP('ఇంట్లో గ్లాసులో నీళ్ళు పోసి, చిన్న రాళ్ళు వేసి చూడు — నీళ్ళు పైకి వస్తాయి! (పెద్దవాళ్ళతో) | Try it with an adult: drop small stones in a glass of water and watch the water rise!'),
  ], [
    EX('కాకికి ఏమి సమస్య? | What was the crow\'s problem?', ['నీళ్ళు కుండ అడుగున ఉన్నాయి. | The water was at the bottom.'], 'నీళ్ళు అందలేదు | it could not reach the water'),
    EX('కాకి ఏం చేసింది? | What did the crow do?', ['మూడవ బొమ్మ 🪨. | The third picture 🪨.'], 'రాళ్ళు వేసింది | dropped pebbles'),
  ], [
    orderT('seq', 'కథను క్రమంలో పెట్టు. | Put the story in order.', [
      ['☀️ దాహం వేసింది | felt thirsty', '🪣 కుండ చూసింది | saw a pot', '🪨 రాళ్ళు వేసింది | dropped pebbles', '💧 నీళ్ళు తాగింది | drank water'],
      ['🐦‍⬛ ఎగురుతూ వెతికింది | searched while flying', '🤔 ఆలోచించింది | thought', '💧 నీళ్ళు పైకి వచ్చాయి | water rose'],
      ['సమస్య | problem', 'ఆలోచన | idea', 'పరిష్కారం | solution'],
    ], 'ముందు దాహం, చివర నీళ్ళు. | Thirst first, water last.'),
    mcq('story', 'కథ గురించి ఆలోచించు. | Think about the story.', [
      ['కుండలో నీళ్ళు ఎక్కడ ఉన్నాయి? | Where was the water in the pot?', 'అడుగున | at the bottom', ['పైన పొంగుతూ | overflowing at the top', 'బయట | outside', 'అసలే లేవు | none at all'], 'కాకి ముక్కుకు అందలేదు. | The beak could not reach.', 'నీళ్ళు అడుగున ఉన్నాయి. | At the bottom.'],
      ['రాళ్ళు వేస్తే నీళ్ళు ఎందుకు పైకి వచ్చాయి? | Why did the water rise?', 'రాళ్ళు నీటి చోటు తీసుకున్నాయి | stones took up the water\'s space', ['రాళ్ళు నీళ్ళు తాగాయి | stones drank water', 'వాన పడింది | it rained', 'కుండ పెరిగింది | the pot grew'], 'అడుగున రాళ్ళు నిండితే… | When stones fill the bottom…', 'రాళ్ళు చోటు ఆక్రమిస్తే నీళ్ళు పైకి లేస్తాయి. | Stones push the water up.'],
      ['ఈ కథ నీతి ఏమిటి? | What is the lesson of this story?', 'ఆలోచిస్తే దారి దొరుకుతుంది | thinking finds a way', ['ఏడిస్తే నీళ్ళు వస్తాయి | crying brings water', 'కాకులు చెడ్డవి | crows are bad', 'రాళ్ళు తినాలి | eat stones'], 'పాఠం పేరే "ఆలోచన". | The lesson is called "idea".', 'ఓపికగా ఆలోచిస్తే సమస్య తీరుతుంది. | Patient thinking solves problems.'],
      ['కాకి రాళ్ళు ఎలా వేసింది? | How did the crow drop the pebbles?', 'ఒక్కొక్కటిగా | one by one', ['అన్నీ ఒకేసారి | all at once', 'వేయలేదు | it did not', 'కుండ పగలగొట్టి | by breaking the pot'], 'ఓపికగా. | Patiently.', 'ఒక్కొక్క రాయి, ఓపికగా. | One pebble at a time.'],
      ['నీ బంతి మంచం కింద దూరంగా పోయింది. ఏం చేస్తావు? | Your ball rolled far under the bed. What will you do?', 'కర్రతో బయటకు లాగుతా | pull it out with a stick', ['ఏడుస్తా | cry', 'మర్చిపోతా | forget it', 'మంచం పగలగొడతా | break the bed'], 'కాకిలా ఆలోచించు! | Think like the crow!', 'ఒక చిన్న ఉపాయం సరిపోతుంది. | A small clever idea is enough.'],
    ]),
  ]),
  o('alochana.words', 'కథ పదాలు | Story words', [
    P('కథలో వచ్చిన కొత్త పదాలు నేర్చుకుందాం. | Let us learn the new words from the story.'),
    KEYS('దాహం = నీళ్ళు తాగాలనిపించడం | thirst', 'కుండ = మట్టి పాత్ర | clay pot', 'గులకరాళ్ళు = చిన్న రాళ్ళు | pebbles', 'ఉపాయం = తెలివైన దారి | clever plan', 'ఆలోచన = మనసులో వచ్చే దారి | idea'),
    PH('🪨', 'గులకరాళ్ళు — చిన్న, గుండ్రని రాళ్ళు. | Pebbles: small round stones.'),
    TIP('కొత్త పదంతో నీ సొంత వాక్యం చెప్పు. | Say your own sentence with each new word.'),
  ], [
    EX('"దాహం" అంటే? | What is "daaham"?', ['ఎండలో ఆడితే నీళ్ళు కావాలనిపిస్తుంది. | After playing in the sun you want water.'], 'నీళ్ళు తాగాలనిపించడం | thirst'),
    EX('"ఉపాయం" కి ఈ కథలో ఉదాహరణ? | An example of "upaayam" in this story?', ['కాకి రాళ్ళు వేసింది. | The crow dropped pebbles.'], 'రాళ్ళు వేయడం | dropping pebbles'),
  ], [
    matchT('match', 'పదాన్ని అర్థంతో కలుపు | Match each word to its meaning', [
      ['దాహం | thirst', 'నీళ్ళు కావాలనిపించడం | wanting water'], ['కుండ | pot', 'మట్టి పాత్ర | clay vessel'], ['గులకరాళ్ళు | pebbles', 'చిన్న రాళ్ళు | small stones'],
      ['ఉపాయం | clever plan', 'తెలివైన దారి | clever way'], ['కాకి | crow', 'నల్లని పక్షి | black bird'],
    ], 'కథలో ఆ పదం ఎక్కడ వచ్చిందో గుర్తు చేసుకో. | Recall where the word came in the story.'),
    mcq('words', 'అర్థం ఆలోచించు. | Think about the meaning.', [
      ['ఎండలో ఆడాక నీకు ఏమి వేస్తుంది? | After playing in the sun, you feel…', 'దాహం | thirsty', ['చలి | cold', 'నిద్ర | sleepy', 'భయం | scared'], 'నీళ్ళు తాగాలనిపిస్తుంది. | You want water.', 'ఎండలో దాహం వేస్తుంది. | The sun makes us thirsty.'],
      ['కుండ దేనితో చేస్తారు? | What is a pot (kunda) made of?', 'మట్టి | clay', ['గాజు | glass', 'కాగితం | paper', 'బట్ట | cloth'], 'కుమ్మరి చేస్తాడు. | The potter makes it.', 'కుండ మట్టితో చేస్తారు. | Made of clay.'],
      ['"ఆలోచన" ఎక్కడ పుడుతుంది? | Where is an idea born?', 'మనసులో, మెదడులో | in the mind', ['కాలిలో | in the leg', 'చెట్టులో | in a tree', 'కుండలో | in a pot'], 'మనం ఆలోచించేది… | Where we think…', 'ఆలోచన మనసులో పుడుతుంది. | In the mind.'],
      ['"గులకరాళ్ళు" ఎలా ఉంటాయి? | What are pebbles like?', 'చిన్నగా, గుండ్రంగా | small and round', ['పెద్ద కొండల్లా | big as hills', 'మెత్తగా దూదిలా | soft like cotton', 'నీళ్ళలా | like water'], 'కాకి ముక్కుతో ఎత్తగలిగేవి. | A crow can lift them.', 'గులకరాళ్ళు చిన్న గుండ్రని రాళ్ళు. | Small round stones.'],
      ['కాకి రంగు ఏది? | What colour is a crow?', 'నలుపు | black', ['తెలుపు | white', 'ఆకుపచ్చ | green', 'పసుపు | yellow'], 'బొమ్మ చూడు 🐦‍⬛. | See the picture 🐦‍⬛.', 'కాకి నల్లగా ఉంటుంది. | A crow is black.'],
    ]),
  ]),
], 'Retells a public-domain fable (the thirsty crow) in original words; teacher should connect it to the book picture story.');

// ============================================================ 12. ఎర్రా డబ్బల బండి — va/na-ottu
const OT7 = ['స్వ', 'ద్వ', 'జ్వ', 'శ్వ', 'స్న', 'త్న', 'ష్ణ'];
const W7 = ['[స్వ]-రం|voice|🎵', '[ద్వా]-రం|doorway|🚪', '[జ్వ]-రం|fever|💊', 'వి-[శ్వం]|world|🌍', '[స్నా]-నం|bath|💧', 'ర-[త్నం]|gem|👑', 'కృ-[ష్ణ]|Krishna|🦚', '[స్వా]-మి|lord|🛕', 'వి-[ష్ణు]-వు|Vishnu|🛕', '[స్నే]-హం|friendship|👐'];
const ch12 = unit(12, 'ch12', 'ఎర్రా డబ్బల బండి | The red-box cart (the train)', [
  o('bandi.theme', 'రైలు బండి ప్రయాణం | A train journey', [
    P('ఎర్రని డబ్బాలు (పెట్టెలు) వరుసగా కట్టిన పొడవాటి బండి — రైలు! రైలు పట్టాల మీద "కూ… చుక్ చుక్" అంటూ ఊరి నుండి ఊరికి వెళ్తుంది. | A long cart of red boxes joined in a row: a train! It runs on rails, "koo… chuk chuk", from town to town.'),
    ...RHYME('రైలు పాట (మా పాట) | Train song (our rhyme)', [
      'కూ కూ కూ, చుక్ చుక్ చుక్ | Koo koo koo, chuk chuk chuk',
      'ఎర్రని పెట్టెల రైలు బండి | The red-boxed railway cart',
      'పట్టాల మీద పరుగులు తీసి | Racing along the rails',
      'అమ్మమ్మ ఊరికి తీసుకుపో! | Take me to grandma\'s village!',
    ]),
    PH('🚆', 'రైలు బండి. | A train.'),
    TIP('దోస్తులతో ఒకరి భుజాలు ఒకరు పట్టుకొని రైలులా నడుస్తూ పాడండి! | Hold each other\'s shoulders and walk like a train while you sing!'),
  ], [
    EX('రైలు దేని మీద నడుస్తుంది? | What does a train run on?', ['పాటలో "పట్టాల మీద". | The song says "on the rails".'], 'పట్టాలు | rails'),
    EX('పాటలో ఎవరి ఊరికి వెళ్తున్నారు? | Whose village are they going to?', ['చివరి వరుస. | The last line.'], 'అమ్మమ్మ | grandma'),
  ], [
    pic('vehicle', 'వాహనం దేని మీద / ఎక్కడ వెళ్తుందో ఆలోచించు. | Think where the vehicle travels.', [
      ['పట్టాల మీద నడిచేది ఏది? | Which one runs on rails?', ['🚆', 'రైలు | train'], [['🚌', 'బస్సు | bus'], ['✈️', 'విమానం | aeroplane']], 'పొడవాటి పెట్టెల బండి. | The long cart of boxes.', 'రైలు పట్టాల మీద నడుస్తుంది. | A train runs on rails.'],
      ['ఆకాశంలో ఎగిరేది ఏది? | Which one flies in the sky?', ['✈️', 'విమానం | aeroplane'], [['🚲', 'సైకిల్ | bicycle'], ['🚆', 'రైలు | train']], 'దానికి రెక్కలు ఉంటాయి. | It has wings.', 'విమానం ఆకాశంలో ఎగురుతుంది. | An aeroplane flies.'],
      ['నీటి మీద వెళ్ళేది ఏది? | Which one goes on water?', ['⛵', 'పడవ | boat'], [['🚗', 'కారు | car'], ['🛺', 'ఆటో | auto']], 'చెరువులో, నదిలో. | In ponds and rivers.', 'పడవ నీటి మీద వెళ్తుంది. | A boat goes on water.'],
      ['కాళ్ళతో తొక్కేది ఏది? | Which one do we pedal?', ['🚲', 'సైకిల్ | bicycle'], [['🚌', 'బస్సు | bus'], ['🚜', 'ట్రాక్టరు | tractor']], 'దానికి రెండు చక్రాలు. | It has two wheels.', 'సైకిల్ కాళ్ళతో తొక్కుతాం. | We pedal a bicycle.'],
      ['పొలం దున్నేది ఏది? | Which one ploughs the field?', ['🚜', 'ట్రాక్టరు | tractor'], [['✈️', 'విమానం | aeroplane'], ['🚆', 'రైలు | train']], 'రైతు వాహనం. | The farmer\'s vehicle.', 'ట్రాక్టరు పొలం దున్నుతుంది. | A tractor ploughs.'],
    ]),
    mcq('theme', 'రైలు పాట గుర్తు చేసుకో. | Remember the train song.', [
      ['రైలు ఏ శబ్దం చేస్తుంది? | What sound does the train make?', 'కూ… చుక్ చుక్ | koo… chuk chuk', ['మ్యావ్ | myaav', 'భౌ భౌ | bhow bhow', 'టింగ్ టింగ్ | ting ting'], 'పాట మొదటి వరుస. | The first line.', 'రైలు "కూ చుక్ చుక్" అంటుంది. | The train goes koo chuk chuk.'],
      ['పాటలో రైలు పెట్టెలు ఏ రంగు? | What colour are the train boxes in the song?', 'ఎరుపు | red', ['నీలం | blue', 'పసుపు | yellow', 'తెలుపు | white'], 'పాఠం పేరులోనే ఉంది. | It is in the lesson title.', 'ఎర్రని పెట్టెలు. | Red boxes.'],
      ['రైలు ఎక్కేది ఎక్కడ? | Where do we board a train?', 'రైల్వే స్టేషను | railway station', ['బస్ స్టాండ్ | bus stand', 'విమానాశ్రయం | airport', 'చెరువు | pond'], 'రైళ్ళు ఆగే చోటు. | Where trains stop.', 'రైల్వే స్టేషనులో రైలు ఎక్కుతాం. | At the railway station.'],
      ['రైలులో ఎలా ఉండాలి? | How should we behave in a train?', 'తలుపు దగ్గర నిలబడకుండా కూర్చోవాలి | sit, not stand at the door', ['తలుపులో వేలాడాలి | hang from the door', 'కిటికీ నుండి చెయ్యి బయట పెట్టాలి | put hands out of the window', 'పట్టాల మీద ఆడాలి | play on the rails'], 'భద్రత ముఖ్యం. | Safety first.', 'లోపల కూర్చోవడం సురక్షితం. | Sitting inside is safe.'],
      ['రైలులో చాలా పెట్టెలు ఎందుకు? | Why does a train have many boxes?', 'చాలా మంది ఎక్కడానికి | so many people can travel', ['అందం కోసం మాత్రమే | only for beauty', 'పాటల కోసం | for songs', 'ఆట కోసం | for a game'], 'ఒక్క బస్సుకంటే ఎక్కువ మంది. | More people than one bus.', 'చాలా పెట్టెలు, చాలా మంది ప్రయాణికులు. | Many boxes carry many people.'],
    ]),
  ]),
  o('bandi.ottu', 'వ, న ఒత్తులు: స్వ ద్వ జ్వ శ్వ స్న త్న ష్ణ | The va- and na-ottu', samIntro('వ ఒత్తు (్వ), న/ణ ఒత్తులు నేర్చుకుందాం | the va-ottu (్వ) and the na/Na-ottu', OT7, 'స్నానం చేసి, స్వరం పెంచి, విశ్వమంతా పాడు! | Have a bath, raise your voice and sing to the whole world!', '💧', 'స్నానం = స్నా + నం. స కింద న ఒత్తు. | bath (snaanam) = snaa + nam; sa with the na-ottu below.'), [
    EX('"ద్వారం" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "dvaaram"?', ['ద్వా-రం. | dvaa-ram.', 'ద కింద వ ఒత్తు, ఆ గుర్తు. | da + va-ottu + aa sign.'], 'ద్వా'),
    EX('"కృష్ణ" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "krishna"?', ['కృ-ష్ణ. | kri-shNa.', 'ష కింద ణ ఒత్తు. | Sha with the Na-ottu below.'], 'ష్ణ'),
  ], ottuPractice(W7, OT7)),
  o('bandi.read', 'చదువుదాం: అమ్మమ్మ ఊరికి రైలు | Reading: by train to grandma\'s', [
    ...RHYME('రైలు ప్రయాణం (మా కథ) | The train trip (our story)', ['ఆదివారం మేము రైలు ఎక్కాము. | On Sunday we boarded the train.', 'కిటికీ పక్కన కూర్చుని పొలాలు చూశాను. | I sat by the window and watched the fields.', 'రైలు వంతెన మీద నది దాటింది. | The train crossed a river on a bridge.', 'అమ్మమ్మ స్టేషనులో నవ్వుతూ ఎదురొచ్చింది! | Grandma met us at the station with a smile!']),
    PH('🚆', 'కిటికీ నుండి పొలాలు, నది. | Fields and a river from the window.'),
    TIP('ప్రయాణం కథలో "ఎక్కడ?" అనే ప్రశ్నకు జవాబులు వెతుకు. | Look for the answers to "where?" in a journey story.'),
  ], [
    EX('వాళ్ళు ఏ రోజు రైలు ఎక్కారు? | On which day did they board the train?', ['మొదటి వాక్యం. | The first sentence.'], 'ఆదివారం | Sunday'),
    EX('రైలు ఏం దాటింది? | What did the train cross?', ['మూడవ వాక్యం. | The third sentence.'], 'నది | a river'),
  ], [
    mcq('story', 'కథను మళ్ళీ చదువు. | Read the story again.', [
      ['కిటికీ నుండి ఏం చూశారు? | What was seen from the window?', 'పొలాలు | fields', ['సినిమా | a film', 'సముద్రం | the sea', 'మంచు | snow'], 'రెండవ వాక్యం. | The second sentence.', 'కిటికీ నుండి పొలాలు చూశారు. | Fields.'],
      ['రైలు నదిని ఎలా దాటింది? | How did the train cross the river?', 'వంతెన మీద | on a bridge', ['ఈదుతూ | swimming', 'ఎగురుతూ | flying', 'పడవలో | in a boat'], 'మూడవ వాక్యం. | The third sentence.', 'వంతెన మీద దాటింది. | On a bridge.'],
      ['స్టేషనులో ఎవరు ఎదురొచ్చారు? | Who met them at the station?', 'అమ్మమ్మ | grandma', ['టీచర్ | teacher', 'పోలీసు | police', 'డ్రైవర్ | driver'], 'చివరి వాక్యం. | The last sentence.', 'అమ్మమ్మ ఎదురొచ్చింది. | Grandma.'],
      ['"స్టేషను" అంటే? | What is a "station"?', 'రైలు ఆగే చోటు | where the train stops', ['వంట గది | kitchen', 'బడి | school', 'తోట | garden'], 'ప్రయాణికులు ఎక్కే, దిగే చోటు. | Where passengers get on and off.', 'స్టేషనులో రైలు ఆగుతుంది. | Trains stop at stations.'],
      ['"స్నానం" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "snaanam"?', 'స్నా', ['సా', 'స్వా', 'న్నా'], 'స్నా-నం. | snaa-nam.', 'స కింద న ఒత్తు, ఆ గుర్తు. | sa + na-ottu + aa sign.'],
    ]),
    orderT('seq', 'ప్రయాణాన్ని క్రమంలో పెట్టు. | Put the journey in order.', [
      ['రైలు ఎక్కాము | boarded', 'పొలాలు చూశాము | saw fields', 'నది దాటాము | crossed the river', 'అమ్మమ్మను కలిశాము | met grandma'],
      ['టికెట్ కొన్నాము | bought tickets', 'రైలు ఎక్కాము | boarded', 'రైలు దిగాము | got off'],
    ], 'ముందు రైలు ఎక్కాలి. | First get on the train.'),
  ]),
], `${REVIEW} ${OTTU_NOTE}`);

// ============================================================ 13. ఓ లచ్చా గుమ్మడి — special ottu letters
const OT8 = ['క్ష', 'జ్ఞ', 'స్త', 'ష్ట', 'ర్వ', 'ర్య'];
const W8 = ['ప-[క్షి]|bird|🐦', '[క్ష]-మ|forgiveness|🙏', '[జ్ఞా]-నం|knowledge|📚', 'పు-[స్త]-కం|book|📕', 'హ-[స్తం]|hand|✋', 'క-[ష్టం]|difficulty|😢', 'ప-[ర్వ]-తం|mountain|⛰️', 'సూ-[ర్యు]-డు|sun|☀️', 'ర-[క్ష]-ణ|protection|🔒', 'అ-[ష్ట]-మి|eighth day|🌙'];
const ch13 = unit(13, 'ch13', 'ఓ లచ్చా గుమ్మడి | O Lachha Gummadi (a folk song)', [
  o('gummadi.theme', 'గుమ్మడి పాదు, పంట పాట | The pumpkin vine and harvest song', [
    P('"ఓ లచ్చా గుమ్మడి" బతుకమ్మ రోజుల్లో పాడే పాత జానపద పాట పల్లవి. గుమ్మడి తీగ ఇంటి పెరట్లో పాకుతూ పెద్ద పెద్ద కాయలు కాస్తుంది. దాని పసుపు పూవు బతుకమ్మ పైన పెడతారు. | "O lachha gummadi" is the refrain of an old folk song from Bathukamma days. A pumpkin vine creeps across the backyard and gives big pumpkins; its yellow flower crowns the Bathukamma.'),
    ...RHYME('గుమ్మడి పాట (మా పాట) | Pumpkin song (our rhyme)', [
      'పెరట్లో పాకింది గుమ్మడి తీగ | The pumpkin vine crept across the yard',
      'పసుపు పూలు పూసింది ఓ గుమ్మడి | It bloomed yellow flowers, O pumpkin',
      'పెద్ద కాయ కాసింది, పండుగ వచ్చింది! | It gave a big pumpkin; the festival is here!',
    ]),
    PH('🟠', 'గుమ్మడి కాయ — గుండ్రంగా, పెద్దగా. | A pumpkin: round and big.'),
    TIP('"తీగ పాకింది" అని పాడేటప్పుడు చేతిని పాములా కదిలించు! | Wiggle your hand like a creeping vine as you sing!'),
  ], [
    EX('గుమ్మడి పూవు ఏ రంగు? | What colour is the pumpkin flower?', ['పాటలో "పసుపు పూలు". | The song says yellow flowers.'], 'పసుపు | yellow'),
    EX('గుమ్మడి తీగ ఎక్కడ పాకింది? | Where did the vine creep?', ['మొదటి వరుస: "పెరట్లో". | First line: "in the yard".'], 'పెరట్లో | in the backyard'),
  ], [
    mcq('theme', 'గుమ్మడి పాట గుర్తు చేసుకో. | Remember the pumpkin song.', [
      ['గుమ్మడి ఎలా పెరుగుతుంది? | How does a pumpkin plant grow?', 'తీగలా పాకుతూ | as a creeping vine', ['పెద్ద చెట్టులా | as a big tree', 'నీటిలో | in water', 'రాళ్ళ మీద మాత్రమే | only on rocks'], 'పాటలో "తీగ పాకింది". | The song says the vine crept.', 'గుమ్మడి తీగ నేల మీద పాకుతుంది. | It creeps along the ground.'],
      ['గుమ్మడి పూవును ఎక్కడ పెడతారు? | Where is the pumpkin flower placed?', 'బతుకమ్మ పైన | on top of the Bathukamma', ['బస్సులో | in a bus', 'పుస్తకంలో | in a book', 'బావిలో | in a well'], 'బతుకమ్మ పాఠాలు గుర్తు చేసుకో. | Remember the Bathukamma lessons.', 'గుమ్మడి పూవు బతుకమ్మకు కిరీటం. | It crowns the Bathukamma.'],
      ['గుమ్మడి కాయ ఆకారం? | What shape is a pumpkin?', 'గుండ్రం | round', ['చతురస్రం | square', 'త్రికోణం | triangle', 'పొడవాటి కర్ర | a long stick'], 'బంతిలా, కానీ చాలా పెద్దగా. | Like a ball, but much bigger.', 'గుమ్మడి గుండ్రంగా ఉంటుంది. | A pumpkin is round.'],
      ['"పెరడు" అంటే? | What is "peradu"?', 'ఇంటి వెనుక ఖాళీ స్థలం | the backyard', ['వంట గది | kitchen', 'బడి | school', 'రోడ్డు | road'], 'మొక్కలు పెంచే చోటు. | Where plants are grown.', 'పెరడు = ఇంటి వెనుక స్థలం. | peradu = backyard.'],
      ['"ఓ లచ్చా గుమ్మడి" ఏ రకం పాట? | What kind of song is "O lachha gummadi"?', 'జానపద పాట | folk song', ['జాతీయ గీతం | national anthem', 'ప్రకటన పాట | advertisement jingle', 'ఆంగ్ల పాట | English song'], 'పల్లెల్లో తరతరాలుగా పాడేది. | Sung in villages for generations.', 'ఇది జానపద పాట. | It is a folk song.'],
    ]),
    pic('veg', 'కూరగాయ పేరు ఆలోచించు. | Think of the vegetable\'s name.', [
      ['వంకాయ ఏది? | Which is the brinjal?', ['🍆', 'వంకాయ | brinjal'], [['🥕', 'క్యారెట్ | carrot'], ['🍅', 'టమాటా | tomato']], 'ఊదా రంగు కూరగాయ. | The purple vegetable.', '🍆 వంకాయ. | 🍆 is brinjal.'],
      ['టమాటా ఏది? | Which is the tomato?', ['🍅', 'టమాటా | tomato'], [['🥔', 'బంగాళదుంప | potato'], ['🌽', 'మొక్కజొన్న | corn']], 'ఎర్రగా, గుండ్రంగా. | Red and round.', '🍅 టమాటా. | 🍅 is tomato.'],
      ['మొక్కజొన్న ఏది? | Which is the corn?', ['🌽', 'మొక్కజొన్న | corn'], [['🥒', 'దోసకాయ | cucumber'], ['🧅', 'ఉల్లిపాయ | onion']], 'పసుపు గింజల కంకి. | A cob of yellow kernels.', '🌽 మొక్కజొన్న. | 🌽 is corn.'],
      ['ఉల్లిపాయ ఏది? | Which is the onion?', ['🧅', 'ఉల్లిపాయ | onion'], [['🍆', 'వంకాయ | brinjal'], ['🥕', 'క్యారెట్ | carrot']], 'కోస్తే కళ్ళలో నీళ్ళు వస్తాయి! | Cutting it makes your eyes water!', '🧅 ఉల్లిపాయ. | 🧅 is onion.'],
      ['మిరపకాయ ఏది? | Which is the chilli?', ['🌶️', 'మిరపకాయ | chilli'], [['🍅', 'టమాటా | tomato'], ['🥔', 'బంగాళదుంప | potato']], 'చాలా కారంగా ఉంటుంది. | It is very spicy.', '🌶️ మిరపకాయ. | 🌶️ is chilli.'],
    ]),
  ]),
  o('gummadi.ottu', 'ప్రత్యేక ఒత్తులు: క్ష జ్ఞ స్త ష్ట ర్వ ర్య | Special joined letters', [
    P('కొన్ని ఒత్తు అక్షరాలు కొత్త రూపంలో కనిపిస్తాయి: క + ష = క్ష, జ + ఞ = జ్ఞ. ర ముందు వచ్చి ఒత్తుగా పలికితే (ర్వ, ర్య) దాన్ని రేఫ అంటారు. | Some joined letters take a new shape: క + ష = క్ష, జ + ఞ = జ్ఞ. When ర comes first (ర్వ, ర్య) it is called repha.'),
    KEYS(...OT8.map((c) => `${c} = ${c[0]} + ${c[2]} | ${rom(c[0])} + ${rom(c[2])}`)),
    PH('🐦', 'పక్షి = ప + క్షి. | bird (pakshi) = pa + kshi.'),
    ...RHYME('ఒత్తుల ఆట | Ottu game', ['సూర్యుడు పర్వతం మీద, పక్షి పుస్తకం దగ్గర! | The sun on the mountain, a bird by the book!']),
    TIP('"క్ష" ను ఒకే అక్షరంలా గుర్తు పెట్టుకో — వర్ణమాలలో చివర్లో కూడా వస్తుంది. | Remember క్ష as one letter; it even appears at the end of the alphabet.'),
  ], [
    EX('"పుస్తకం" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "pusthakam"?', ['పు-స్త-కం. | pu-stha-kam.', 'స కింద త ఒత్తు. | sa with the tha-ottu.'], 'స్త'),
    EX('క్ష = ? + ? | ksha = ? + ?', ['క్ష లో క, ష కలిశాయి. | క and ష join in క్ష.'], 'క + ష'),
  ], ottuPractice(W8, OT8)),
  o('gummadi.read', 'చదువుదాం: పెరటి తోట | Reading: the backyard garden', [
    ...RHYME('పెరటి తోట (మా కథ) | The backyard garden (our story)', ['తాతయ్య పెరట్లో గుమ్మడి విత్తనం నాటాడు. | Grandpa planted a pumpkin seed in the yard.', 'సూర్యుడి వెలుగులో తీగ పెరిగింది. | In the sunlight the vine grew.', 'ఒక పక్షి పూల దగ్గర పాట పాడింది. | A bird sang near the flowers.', 'పండుగకు పెద్ద గుమ్మడి కాయ వచ్చింది! | A big pumpkin came in time for the festival!']),
    PH('☀️', 'సూర్యుడు = సూ + ర్యు + డు. | sun (sooryudu) = soo + ryu + du.'),
    TIP('ఒత్తు అక్షరాలను గుర్తించి వాటి కింద చుక్క పెట్టు. | Spot the ottu letters and put a dot under them.'),
  ], [
    EX('విత్తనం ఎవరు నాటారు? | Who planted the seed?', ['మొదటి వాక్యం. | The first sentence.'], 'తాతయ్య | grandpa'),
    EX('"సూర్యుడి" లో ఒత్తు అక్షరం? | The ottu letter in "sooryudi"?', ['సూ-ర్యు-డి. | soo-ryu-di.'], 'ర్యు'),
  ], [
    mcq('story', 'కథను మళ్ళీ చదువు. | Read the story again.', [
      ['తీగ దేని వెలుగులో పెరిగింది? | In whose light did the vine grow?', 'సూర్యుడి | the sun\'s', ['చంద్రుడి | the moon\'s', 'దీపం | a lamp\'s', 'టార్చ్ | a torch\'s'], 'రెండవ వాక్యం. | The second sentence.', 'సూర్యుడి వెలుగులో. | In the sunlight.'],
      ['పూల దగ్గర పాడింది ఎవరు? | Who sang near the flowers?', 'పక్షి | a bird', ['కుక్క | a dog', 'తాతయ్య | grandpa', 'కప్ప | a frog'], 'మూడవ వాక్యం. | The third sentence.', 'పక్షి పాట పాడింది. | A bird sang.'],
      ['పండుగకు ఏమి వచ్చింది? | What came in time for the festival?', 'పెద్ద గుమ్మడి కాయ | a big pumpkin', ['కొత్త బట్టలు | new clothes', 'వాన | rain', 'రైలు | a train'], 'చివరి వాక్యం. | The last sentence.', 'పెద్ద గుమ్మడి కాయ వచ్చింది. | A big pumpkin.'],
      ['"పక్షి" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "pakshi"?', 'క్షి', ['కి', 'షి', 'స్తి'], 'ప-క్షి. | pa-kshi.', 'క + ష కలిసి క్ష, ఇ గుర్తుతో క్షి. | క + ష make క్ష; with the i sign, క్షి.'],
      ['విత్తనం నుండి కాయ వరకు ఏది ముందు? | From seed to pumpkin, what comes first?', 'విత్తనం | the seed', ['కాయ | the pumpkin', 'పూవు | the flower', 'తీగ | the vine'], 'తాతయ్య మొదట ఏం చేశాడు? | What did grandpa do first?', 'విత్తనం → తీగ → పూవు → కాయ. | seed → vine → flower → pumpkin.'],
    ]),
    orderT('seq', 'గుమ్మడి పెరుగుదలను క్రమంలో పెట్టు. | Put the pumpkin\'s growth in order.', [
      ['విత్తనం | seed', 'తీగ | vine', 'పూవు | flower', 'కాయ | pumpkin'],
      ['నాటాడు | planted', 'నీళ్ళు పోశాడు | watered', 'కాయ కోశాడు | picked the pumpkin'],
    ], 'అంతా విత్తనంతో మొదలు. | It all begins with a seed.'),
  ]),
], `${REVIEW} ${OTTU_NOTE}`);

// ============================================================ 14. కాళ్ళా గజ్జా — ottu revision
const ALL_DV = [...OT1, ...OT2, ...OT3, 'జ్జ', 'ర్ర', 'స్స'];
const ALL_SAM = [...OT5, ...OT6, ...OT7, ...OT8];
const WALL = ['కా-[ళ్ళా]|legs|🦶', 'గ-[జ్జా]|anklet bell|🔔', 'కు-[క్క]|dog|🐶', 'క-[ప్ప]|frog|🐸', 'పి-[ల్లి]|cat|🐱', 'చ-[క్రం]|wheel|🛞', 'వి-[ద్య]|learning|📚', '[స్నా]-నం|bath|💧', 'పు-[స్త]-కం|book|📕', 'సూ-[ర్యు]-డు|sun|☀️', 'అ-[మ్మ]|mother|👩', 'రా-[త్రి]|night|🌙'];
const ch14 = unit(14, 'ch14', 'కాళ్ళా గజ్జా | Kaallaa gajjaa (a counting-out game)', [
  o('gajja.theme', 'కాళ్ళా గజ్జా ఆట | The kaallaa gajjaa game', [
    P('"కాళ్ళా గజ్జా కంకాళమ్మ" పిల్లలు తరతరాలుగా ఆడే లెక్కింపు ఆట పాట. అందరూ కాళ్ళు చాపి కూర్చుంటారు; ఒకరు పాట పాడుతూ ఒక్కో కాలు తడుతారు. పాట ఆగిన కాలు ముడుచుకోవాలి! | "Kaallaa gajjaa kankaalamma" is a counting-out rhyme children have played for generations. Everyone sits with legs stretched out; one child sings and taps each leg in turn. The leg where the song stops is folded in!'),
    ...RHYME('ఆట పాట | Game rhyme', [
      'కాళ్ళా గజ్జా కంకాళమ్మ (పాత పల్లవి) | Kaallaa gajjaa kankaalamma (traditional refrain)',
      'ఒక్కో కాలు తట్టు, ఒక్కో మాట చెప్పు (మా వరుస) | Tap one leg for each word (our line)',
      'పాట ఆగిన కాలు, ముడుచుకో మెల్లగా! (మా వరుస) | Where the song stops, fold that leg in gently! (our line)',
    ]),
    PH('🦶', 'కాళ్ళు చాపి కూర్చో — ఆట మొదలు! | Sit with legs stretched; the game begins!'),
    TIP('ఒక్కో మాటకు ఒక్కో కాలు — లయ తప్పకూడదు. | One leg for each word; keep the beat.'),
  ], [
    EX('ఈ ఆటలో ఒక్కో మాటకు ఏం తడతారు? | What is tapped for each word?', ['ఒక్కో కాలు. | One leg.'], 'కాలు | a leg'),
    EX('పాట ఆగిన కాలు ఏం చేయాలి? | What happens to the leg where the song stops?', ['మూడవ వరుస. | The third line.'], 'ముడుచుకోవాలి | fold it in'),
  ], [
    mcq('theme', 'ఆట నియమాలు గుర్తు చేసుకో. | Remember the game rules.', [
      ['ఆటకు ముందు ఎలా కూర్చోవాలి? | How do we sit before the game?', 'కాళ్ళు చాపి | legs stretched out', ['నిలబడి | standing', 'పడుకుని | lying down', 'చెట్టు మీద | on a tree'], 'కాళ్ళు తట్టాలి కదా! | We need to tap legs!', 'కాళ్ళు చాపి కూర్చుంటాం. | We sit with legs out.'],
      ['ఈ ఆట పాట ఎలాంటిది? | What kind of rhyme is this?', 'లెక్కింపు ఆట పాట | a counting-out rhyme', ['జోల పాట | a lullaby', 'దేశభక్తి గీతం | a patriotic song', 'వార్తలు | news'], 'ఎవరి వంతో లెక్కిస్తుంది. | It counts whose turn it is.', 'ఇది లెక్కింపు ఆట పాట. | A counting-out rhyme.'],
      ['"గజ్జె" అంటే? | What is a "gajje"?', 'కాలి మువ్వ | an anklet bell', ['టోపీ | a cap', 'కళ్ళజోడు | glasses', 'చెప్పు | a slipper'], 'ఘల్లు ఘల్లు మంటుంది. | It jingles.', 'గజ్జె = కాలి గంట. | gajje = anklet bell.'],
      ['ఆటలో ఒక్కో మాటకు ఎన్ని కాళ్ళు తడతారు? | How many legs per word?', 'ఒకటి | one', ['రెండు | two', 'మూడు | three', 'అన్నీ | all'], '"ఒక్కో కాలు". | "one leg each".', 'ఒక్క మాటకు ఒక్క కాలు. | One leg per word.'],
      ['ఆట బాగా సాగాలంటే? | For the game to go well…', 'అందరూ నియమం పాటించాలి | everyone follows the rule', ['గొడవపడాలి | quarrel', 'పారిపోవాలి | run away', 'ఏడవాలి | cry'], 'ఆట అందరిదీ. | The game belongs to everyone.', 'నియమాలు పాటిస్తే ఆట సరదా. | Following rules keeps it fun.'],
    ]),
    orderT('seq', 'ఆటను క్రమంలో పెట్టు. | Put the game steps in order.', [
      ['కాళ్ళు చాపి కూర్చో | sit, legs out', 'పాట పాడు | sing', 'కాళ్ళు తట్టు | tap legs', 'ఆగిన కాలు ముడుచు | fold the stopped leg'],
      ['దోస్తులను పిలువు | call friends', 'గుండ్రంగా కూర్చో | sit in a circle', 'ఆట మొదలు | start the game'],
    ], 'ముందు అందరూ కూర్చోవాలి. | Everyone sits first.'),
  ]),
  o('gajja.ottu', 'ఒత్తుల పునశ్చరణ: ద్విత్వం, సంయుక్తం | Revising ottulu: double and joined letters', [
    P('ఇప్పటి వరకు నేర్చుకున్న ఒత్తులు రెండు రకాలు: ఒకే అక్షరం రెండుసార్లు (ద్విత్వం: క్క, ల్ల) లేదా రెండు వేర్వేరు అక్షరాలు (సంయుక్తం: క్ర, ద్య). | The ottulu we learnt are of two kinds: the same letter twice (dvitva: kka, lla) or two different letters (samyukta: kra, dya).'),
    KEYS('ద్విత్వం: క్క ట్ట ల్ల మ్మ జ్జ | double: kka TTa lla mma jja', 'సంయుక్తం: క్ర త్ర ద్య స్న స్త క్ష | joined: kra thra dya sna stha ksha'),
    PH('🔔', 'గజ్జా = గ + జ్జా — ద్విత్వం. | gajjaa = ga + jjaa: a double letter.'),
    TIP('పైన, కింద ఒకే అక్షరమా? అయితే ద్విత్వం! | Same letter on top and below? Then it is double!'),
  ], [
    EX('"అమ్మ" లో ఒత్తు ఏ రకం? | What kind of ottu is in "amma"?', ['మ్మ = మ + మ. | mma = ma + ma.', 'ఒకే అక్షరం రెండుసార్లు. | The same letter twice.'], 'ద్విత్వం | double'),
    EX('"చక్రం" లో ఒత్తు ఏ రకం? | What kind of ottu is in "chakram"?', ['క్ర = క + ర. | kra = ka + ra.', 'రెండు వేర్వేరు అక్షరాలు. | Two different letters.'], 'సంయుక్తం | joined'),
  ], [
    tapT('dvitva', 'ద్విత్వాక్షరాలను (ఒకే అక్షరం రెండుసార్లు) మాత్రమే ఎంచుకో. | Tap only the double letters (same letter twice).', [
      ...ALL_DV.map((c): [string, boolean] => [c, true]), ...ALL_SAM.map((c): [string, boolean] => [c, false]),
    ], 'పైన, కింద ఒకే అక్షరం ఉంటే ద్విత్వం. | Same letter above and below = double.'),
    ottuFind('find', WALL, [...new Set([...ALL_DV, ...ALL_SAM])].filter((c) => !['ష్ణ', 'ర్వ'].includes(c))),
    ottuSplit('split', [...ALL_DV.slice(0, 6), ...ALL_SAM.slice(0, 8)]),
  ]),
  o('gajja.read', 'చదువుదాం: ఆటల రోజు | Reading: games day', [
    ...RHYME('ఆటల రోజు (మా కథ) | Games day (our story)', ['బడిలో ఆటల రోజు వచ్చింది. | Games day came at school.', 'అక్క కాళ్ళా గజ్జా ఆట నేర్పింది. | Elder sister taught kaallaa gajjaa.', 'తమ్ముడు పుస్తకం పక్కన పెట్టి వచ్చాడు. | Little brother put his book aside and came.', 'అందరం నవ్వుతూ ఆడుకున్నాం! | We all played, laughing!']),
    PH('🏫', 'బడిలో ఆటల రోజు. | Games day at school.'),
    TIP('ఒత్తు పదాలు ఎన్ని ఉన్నాయో లెక్కపెట్టు! | Count how many ottu words there are!'),
  ], [
    EX('ఆట ఎవరు నేర్పారు? | Who taught the game?', ['రెండవ వాక్యం. | The second sentence.'], 'అక్క | elder sister'),
    EX('తమ్ముడు ఏం పక్కన పెట్టాడు? | What did little brother put aside?', ['మూడవ వాక్యం. | The third sentence.'], 'పుస్తకం | his book'),
  ], [
    mcq('story', 'కథను మళ్ళీ చదువు. | Read the story again.', [
      ['బడిలో ఏ రోజు వచ్చింది? | What day came at school?', 'ఆటల రోజు | games day', ['పరీక్షల రోజు | exam day', 'సెలవు | holiday', 'వాన రోజు | rainy day'], 'మొదటి వాక్యం. | The first sentence.', 'ఆటల రోజు వచ్చింది. | Games day.'],
      ['అందరూ ఎలా ఆడుకున్నారు? | How did everyone play?', 'నవ్వుతూ | laughing', ['ఏడుస్తూ | crying', 'గొడవపడుతూ | quarrelling', 'నిద్రపోతూ | sleeping'], 'చివరి వాక్యం. | The last sentence.', 'అందరూ నవ్వుతూ ఆడారు. | Laughing.'],
      ['"అక్క" లో ఒత్తు ఏ రకం? | What kind of ottu is in "akka"?', 'ద్విత్వం | double', ['సంయుక్తం | joined', 'ఒత్తే లేదు | no ottu', 'సున్న | circle'], 'క్క = క + క. | kka = ka + ka.', 'ఒకే అక్షరం రెండుసార్లు: ద్విత్వం. | Same letter twice: double.'],
      ['"పుస్తకం" లో ఒత్తు ఏ రకం? | What kind of ottu is in "pusthakam"?', 'సంయుక్తం | joined', ['ద్విత్వం | double', 'ఒత్తే లేదు | no ottu', 'విసర్గ | visarga'], 'స్త = స + త. | stha = sa + tha.', 'వేర్వేరు అక్షరాలు: సంయుక్తం. | Different letters: joined.'],
      ['"తమ్ముడు" లో ఒత్తు అక్షరం ఏది? | Which ottu letter is in "thammudu"?', 'మ్ము', ['ము', 'మ్మా', 'న్ను'], 'త-మ్ము-డు. | tha-mmu-du.', 'మ కింద మ, ఉ గుర్తు: మ్ము. | ma under ma with the u sign.'],
    ]),
    orderT('sent', 'పదాలను వరుసలో పెట్టి వాక్యం చేయి. | Put the words in order to make the sentence.', [
      ['అక్క | sister', 'ఆట | game', 'నేర్పింది. | taught.'], ['తమ్ముడు | brother', 'పుస్తకం | book', 'చదివాడు. | read.'],
      ['మేము | we', 'నవ్వుతూ | laughing', 'ఆడాము. | played.'], ['పిల్లి | cat', 'గజ్జెలు | bells', 'విన్నది. | heard.'],
    ], 'ఎవరు ముందు, పని చివర. | Who first, action last.'),
  ]),
], REVIEW);

// ============================================================ 15. తెలంగాణ రాష్ట్రం — dvitva / samyukta / samslesha
const ch15 = unit(15, 'ch15', 'తెలంగాణ రాష్ట్రం | Telangana State', [
  o('rashtram.theme', 'మన రాష్ట్రం తెలంగాణ | Our state, Telangana', [
    P('మన రాష్ట్రం తెలంగాణ 2014 జూన్ 2న ఏర్పడింది. రాజధాని హైదరాబాద్. గోదావరి, కృష్ణ మన పెద్ద నదులు. బతుకమ్మ, బోనాలు మన పండుగలు. | Our state Telangana was formed on 2 June 2014. Its capital is Hyderabad. The Godavari and Krishna are our big rivers. Bathukamma and Bonalu are our festivals.'),
    KEYS('రాష్ట్ర పక్షి: పాలపిట్ట | state bird: Indian roller (paalapitta)', 'రాష్ట్ర జంతువు: జింక | state animal: spotted deer', 'రాష్ట్ర చెట్టు: జమ్మి | state tree: jammi (Prosopis)', 'రాష్ట్ర పూవు: తంగేడు | state flower: tangedu'),
    ...RHYME('మా రాష్ట్రం (మా పాట) | Our state (our rhyme)', [
      'పాలపిట్ట ఎగిరే నేల, తంగేడు పూసే నేల | Land where the roller flies, land where tangedu blooms',
      'గోదావరి పారే నేల, మన తెలంగాణ నేల! | Land where the Godavari flows: our Telangana!',
    ]),
    PH('🐦', 'పాలపిట్ట — నీలి రెక్కల మన రాష్ట్ర పక్షి. | The Indian roller with blue wings: our state bird.'),
    TIP('దసరా రోజు పాలపిట్టను చూడటం శుభం అని పెద్దలు చెబుతారు. | Elders say seeing a paalapitta on Dasara is lucky.'),
  ], [
    EX('తెలంగాణ రాజధాని ఏది? | What is the capital of Telangana?', ['చార్మినార్ ఉన్న నగరం. | The city with the Charminar.'], 'హైదరాబాద్ | Hyderabad'),
    EX('తెలంగాణ రాష్ట్ర పూవు ఏది? | What is the state flower?', ['బతుకమ్మకు ముఖ్యమైన పసుపు పూవు. | The yellow Bathukamma flower.'], 'తంగేడు | tangedu'),
  ], [
    mcq('facts', 'మన రాష్ట్రం గురించి గుర్తు చేసుకో. | Remember facts about our state.', [
      ['తెలంగాణ రాజధాని? | Capital of Telangana?', 'హైదరాబాద్ | Hyderabad', ['వరంగల్ | Warangal', 'చెన్నై | Chennai', 'ముంబై | Mumbai'], 'చార్మినార్ ఉన్న నగరం. | The city of the Charminar.', 'హైదరాబాద్ మన రాజధాని. | Hyderabad.'],
      ['తెలంగాణ రాష్ట్ర పక్షి? | State bird?', 'పాలపిట్ట | Indian roller', ['నెమలి | peacock', 'కాకి | crow', 'చిలుక | parrot'], 'నీలి రెక్కలు. | Blue wings.', 'పాలపిట్ట రాష్ట్ర పక్షి. | The Indian roller.'],
      ['తెలంగాణ రాష్ట్ర జంతువు? | State animal?', 'జింక | spotted deer', ['పులి | tiger', 'ఏనుగు | elephant', 'సింహం | lion'], 'ఒంటి మీద తెల్లని మచ్చలు. | White spots on its body.', 'జింక రాష్ట్ర జంతువు. | The spotted deer.'],
      ['తెలంగాణ ఎప్పుడు ఏర్పడింది? | When was Telangana formed?', '2014 జూన్ 2 | 2 June 2014', ['1947 ఆగస్టు 15 | 15 August 1947', '1950 జనవరి 26 | 26 January 1950', '2000 జనవరి 1 | 1 January 2000'], 'ప్రతి ఏడాది జూన్ 2న రాష్ట్ర అవతరణ దినం. | Every 2 June is Formation Day.', '2014 జూన్ 2న. | On 2 June 2014.'],
      ['తెలంగాణలో ప్రవహించే పెద్ద నది? | A big river of Telangana?', 'గోదావరి | Godavari', ['గంగ | Ganga', 'నైలు | Nile', 'యమున | Yamuna'], 'భద్రాచలం దగ్గర ప్రవహిస్తుంది. | It flows past Bhadrachalam.', 'గోదావరి, కృష్ణ మన నదులు. | Godavari and Krishna.'],
      ['తెలంగాణ రాష్ట్ర పూవు? | State flower?', 'తంగేడు | tangedu', ['తామర | lotus', 'గులాబీ | rose', 'మల్లె | jasmine'], 'బతుకమ్మ పసుపు పూవు. | The yellow Bathukamma flower.', 'తంగేడు రాష్ట్ర పూవు. | Tangedu.'],
    ]),
    matchT('match', 'చిహ్నాన్ని దాని పేరుతో కలుపు | Match each state symbol to its name', [
      ['రాష్ట్ర పక్షి | state bird', 'పాలపిట్ట | Indian roller'], ['రాష్ట్ర జంతువు | state animal', 'జింక | deer'], ['రాష్ట్ర చెట్టు | state tree', 'జమ్మి | jammi'],
      ['రాష్ట్ర పూవు | state flower', 'తంగేడు | tangedu'], ['రాజధాని | capital', 'హైదరాబాద్ | Hyderabad'],
    ], 'పాఠం పెట్టెలోని నాలుగు చిహ్నాలు గుర్తు చేసుకో. | Recall the four symbols from the lesson box.'),
  ]),
  o('rashtram.letters', 'ద్విత్వ, సంయుక్త, సంశ్లేష అక్షరాలు | Double, joined and triple-joined letters', [
    P('"రాష్ట్రం" లో ష్ట్ర = ష + ట + ర — మూడు హల్లులు కలిశాయి! మూడు (లేదా ఎక్కువ) హల్లులు కలిసిన అక్షరాన్ని సంశ్లేషాక్షరం అంటారు. | In "raashtram", ష్ట్ర = Sha + Ta + ra: three consonants join! A letter with three or more joined consonants is a samslesha letter.'),
    KEYS('ద్విత్వం: ఒకే హల్లు రెండుసార్లు — అక్క, అమ్మ | double: same consonant twice', 'సంయుక్తం: రెండు వేర్వేరు హల్లులు — చక్రం, విద్య | joined: two different consonants', 'సంశ్లేషం: మూడు హల్లులు — రాష్ట్రం, స్త్రీ, శాస్త్రం | triple: three consonants'),
    PH('🗺️', 'రాష్ట్రం = రా + ష్ట్రం. | state (raashtram) = raa + shTram.'),
    TIP('అక్షరం కింద ఎన్ని ఒత్తులు ఉన్నాయో లెక్కపెట్టు: ఒకటి (ద్విత్వం/సంయుక్తం), రెండు (సంశ్లేషం). | Count the ottus under the letter: one (double/joined) or two (triple).'),
  ], [
    EX('"స్త్రీ" లో ఎన్ని హల్లులు కలిశాయి? | How many consonants join in "sthrii"?', ['స + త + ర. | sa + tha + ra.'], '3 — సంశ్లేషం | 3: samslesha'),
    EX('"కుక్క" ఏ రకం? | What kind is "kukka"?', ['క్క = క + క — ఒకే హల్లు రెండుసార్లు. | kka = ka + ka: same consonant twice.'], 'ద్విత్వం | double'),
  ], [
    mcq('kind', 'హల్లులను లెక్కపెట్టు: ఒకటే రెండుసార్లా, వేర్వేరా, మూడా? | Count the consonants: same twice, two different, or three?', [
      ['"రాష్ట్రం" లోని ష్ట్ర ఏ రకం? | What kind is ష్ట్ర in "raashtram"?', 'సంశ్లేషం | triple-joined', ['ద్విత్వం | double', 'సంయుక్తం | joined', 'ఒత్తే లేదు | no ottu'], 'ష + ట + ర. | Sha + Ta + ra.', 'మూడు హల్లులు: సంశ్లేషం. | Three consonants.'],
      ['"అమ్మ" లోని మ్మ ఏ రకం? | What kind is మ్మ in "amma"?', 'ద్విత్వం | double', ['సంయుక్తం | joined', 'సంశ్లేషం | triple-joined', 'ఒత్తే లేదు | no ottu'], 'మ + మ. | ma + ma.', 'ఒకే హల్లు రెండుసార్లు. | Same consonant twice.'],
      ['"విద్య" లోని ద్య ఏ రకం? | What kind is ద్య in "vidya"?', 'సంయుక్తం | joined', ['ద్విత్వం | double', 'సంశ్లేషం | triple-joined', 'ఒత్తే లేదు | no ottu'], 'ద + య. | da + ya.', 'రెండు వేర్వేరు హల్లులు. | Two different consonants.'],
      ['"శాస్త్రం" లోని స్త్ర ఏ రకం? | What kind is స్త్ర in "shaastram"?', 'సంశ్లేషం | triple-joined', ['ద్విత్వం | double', 'సంయుక్తం | joined', 'ఒత్తే లేదు | no ottu'], 'స + త + ర. | sa + tha + ra.', 'మూడు హల్లులు: సంశ్లేషం. | Three consonants.'],
      ['"పిల్లి" లోని ల్ల ఏ రకం? | What kind is ల్ల in "pilli"?', 'ద్విత్వం | double', ['సంయుక్తం | joined', 'సంశ్లేషం | triple-joined', 'ఒత్తే లేదు | no ottu'], 'ల + ల. | la + la.', 'ఒకే హల్లు రెండుసార్లు. | Same consonant twice.'],
      ['"చంద్రుడు" లోని ద్రు ఏ రకం? | What kind is ద్రు in "chandrudu"?', 'సంయుక్తం | joined', ['ద్విత్వం | double', 'సంశ్లేషం | triple-joined', 'ఒత్తే లేదు | no ottu'], 'ద + ర (ఉ గుర్తుతో). | da + ra, with the u sign.', 'రెండు వేర్వేరు హల్లులు. | Two different consonants.'],
      ['"అస్త్రం" లోని స్త్ర ఏ రకం? | What kind is స్త్ర in "asthram"?', 'సంశ్లేషం | triple-joined', ['ద్విత్వం | double', 'సంయుక్తం | joined', 'ఒత్తే లేదు | no ottu'], 'స + త + ర. | sa + tha + ra.', 'మూడు హల్లులు. | Three consonants.'],
    ]),
    tapT('triple', 'సంశ్లేషాక్షరం (మూడు హల్లులు) ఉన్న పదాలను ఎంచుకో. | Tap the words with a triple-joined letter.', [
      ['రాష్ట్రం | state', true], ['స్త్రీ | woman', true], ['శాస్త్రం | science', true], ['అస్త్రం | weapon', true], ['ఉష్ట్రం | camel', true],
      ['అక్క | sister', false], ['చక్రం | wheel', false], ['విద్య | learning', false], ['పుస్తకం | book', false], ['అమ్మ | mother', false], ['పక్షి | bird', false],
    ], 'కింద రెండు ఒత్తులు (మూడు హల్లులు) ఉంటేనే సంశ్లేషం. | Only two ottus below (three consonants) make a triple.'),
  ]),
  o('rashtram.read', 'చదువుదాం: మా రాష్ట్ర దినోత్సవం | Reading: our State Formation Day', [
    ...RHYME('రాష్ట్ర దినోత్సవం (మా కథ) | Formation Day (our story)', ['జూన్ 2న బడిలో రాష్ట్ర దినోత్సవం జరిగింది. | On 2 June our school celebrated State Formation Day.', 'పిల్లలు తంగేడు పూలతో ముగ్గు వేశారు. | Children made rangoli with tangedu flowers.', 'టీచర్ పాలపిట్ట బొమ్మ చూపించారు. | The teacher showed a picture of the paalapitta.', 'అందరం "జై తెలంగాణ!" అని పాడాము. | We all sang "Jai Telangana!"']),
    PH('🏫', 'బడిలో పండుగ. | A celebration at school.'),
    TIP('తేదీలు, పేర్లు కనిపిస్తే వాటి కింద గీత గీయి. | Underline dates and names when you see them.'),
  ], [
    EX('రాష్ట్ర దినోత్సవం ఏ తేదీ? | What date is Formation Day?', ['మొదటి వాక్యం. | The first sentence.'], 'జూన్ 2 | 2 June'),
    EX('ముగ్గు దేనితో వేశారు? | What was the rangoli made with?', ['రెండవ వాక్యం. | The second sentence.'], 'తంగేడు పూలు | tangedu flowers'),
  ], [
    mcq('story', 'కథను మళ్ళీ చదువు. | Read the story again.', [
      ['టీచర్ ఏ బొమ్మ చూపించారు? | What picture did the teacher show?', 'పాలపిట్ట | Indian roller', ['పులి | tiger', 'రైలు | train', 'గుమ్మడి | pumpkin'], 'మూడవ వాక్యం. | The third sentence.', 'పాలపిట్ట బొమ్మ. | The Indian roller.'],
      ['ఉత్సవం ఎక్కడ జరిగింది? | Where was the celebration?', 'బడిలో | at school', ['గుడిలో | at a temple', 'రైల్వే స్టేషనులో | at the station', 'పొలంలో | in a field'], 'మొదటి వాక్యం. | The first sentence.', 'బడిలో జరిగింది. | At school.'],
      ['"రాష్ట్ర" లో ఎన్ని హల్లులు కలిసిన అక్షరం ఉంది? | "raashtra" has a letter of how many joined consonants?', '3', ['1', '2', '4'], 'ష్ట్ర = ష + ట + ర. | shTra = Sha + Ta + ra.', 'మూడు హల్లులు కలిశాయి. | Three consonants.'],
      ['అందరూ ఏమని పాడారు? | What did everyone sing?', '"జై తెలంగాణ!" | "Jai Telangana!"', ['"హ్యాపీ బర్త్‌డే" | "Happy birthday"', '"జో జో" | "jo jo"', '"కూ చుక్ చుక్" | "koo chuk chuk"'], 'చివరి వాక్యం. | The last sentence.', '"జై తెలంగాణ!" అని పాడారు. | "Jai Telangana!"'],
      ['ముగ్గుకు వాడిన పూవు ఏ రంగు? | What colour was the rangoli flower?', 'పసుపు | yellow', ['నీలం | blue', 'నలుపు | black', 'ఊదా | purple'], 'తంగేడు రంగు గుర్తు చేసుకో. | Remember tangedu\'s colour.', 'తంగేడు పసుపు పూవు. | Tangedu is yellow.'],
    ]),
    orderT('sent', 'పదాలను వరుసలో పెట్టి వాక్యం చేయి. | Put the words in order to make the sentence.', [
      ['హైదరాబాద్ | Hyderabad', 'మన | our', 'రాజధాని. | capital.'], ['పాలపిట్ట | Indian roller', 'మన | our', 'రాష్ట్ర పక్షి. | state bird.'],
      ['పిల్లలు | children', 'ముగ్గు | rangoli', 'వేశారు. | made.'], ['గోదావరి | Godavari', 'పెద్ద | big', 'నది. | river.'],
    ], 'ఎవరు / ఏది ముందు. | Who or what first.'),
  ]),
], 'Taught from the lesson theme only (state facts verified against public Government of Telangana symbols); the textbook text is not reproduced.');

/** Choose the sentence that correctly finishes a story line (story writing practice). */
const RETELL = 'కథలో జరిగిన దానితో సరిపోయేది ఎంచుకో. | Pick what matches what happened in the story.';

// ============================================================ 16. తెలివైన రాణి
const ch16 = unit(16, 'ch16', 'తెలివైన రాణి | Clever Rani', [
  o('rani.story', 'కథ వినడం, చెప్పడం: తెలివైన రాణి | Listening and telling: Clever Rani', [
    P('ఈ కథ మనం రాసినది. బాగా గమనించే పిల్లలు ఎలాంటి సమస్యనైనా తీర్చగలరు! | This is our own story. Children who observe carefully can solve any problem!'),
    ...RHYME('తప్పిపోయిన మేక (మా కథ) | The missing goat (our story)', [
      'రాణి వాళ్ళ మేక "చిన్ని" కనిపించలేదు. | Rani\'s goat "Chinni" was missing.',
      'అందరూ కంగారు పడ్డారు. రాణి మాత్రం నేల చూసింది. | Everyone panicked, but Rani looked at the ground.',
      'బురదలో చిన్న చిన్న గిట్టల గుర్తులు! | Tiny hoof marks in the mud!',
      'గుర్తుల వెంట వెళ్తే, చిన్ని తోటలో ఆకులు మేస్తోంది. | Following the marks, she found Chinni munching leaves in the garden.',
      '"రాణి ఎంత తెలివైనది!" అని అందరూ మెచ్చుకున్నారు. | "How clever Rani is!" everyone praised.',
    ]),
    PH('🐐', 'చిన్ని మేక. | Chinni the goat.'),
    TIP('కథ చెప్పేటప్పుడు: ఎవరు? ఏమైంది? ఏం చేశారు? చివరకు? — నాలుగు ప్రశ్నలు గుర్తుంచుకో. | To tell a story, remember four questions: who? what happened? what did they do? how did it end?'),
  ], [
    EX('రాణి మేకను ఎలా కనుక్కుంది? | How did Rani find the goat?', ['మూడవ వాక్యం: గిట్టల గుర్తులు. | Third sentence: hoof marks.', 'గుర్తుల వెంట వెళ్ళింది. | She followed them.'], 'గిట్టల గుర్తుల వెంట | by following hoof marks'),
    EX('మేక ఎక్కడ దొరికింది? | Where was the goat found?', ['నాలుగవ వాక్యం. | The fourth sentence.'], 'తోటలో | in the garden'),
  ], [
    orderT('seq', 'కథను క్రమంలో పెట్టు. | Put the story in order.', [
      ['మేక తప్పిపోయింది | goat went missing', 'రాణి నేల చూసింది | Rani looked at the ground', 'గుర్తుల వెంట వెళ్ళింది | followed the marks', 'మేక దొరికింది | goat was found'],
      ['అందరూ కంగారు | everyone panicked', 'రాణి ఆలోచన | Rani\'s idea', 'అందరి మెప్పు | everyone\'s praise'],
      ['సమస్య | problem', 'గమనించడం | observing', 'పరిష్కారం | solution'],
    ], 'కథ "మేక తప్పిపోవడం" తో మొదలవుతుంది. | The story starts with the missing goat.'),
    mcq('story', 'కథను మళ్ళీ చదువు. | Read the story again.', [
      ['మేక పేరు ఏమిటి? | What was the goat\'s name?', 'చిన్ని | Chinni', ['బుజ్జి | Bujji', 'రాణి | Rani', 'లచ్చి | Lachhi'], 'మొదటి వాక్యం. | The first sentence.', 'మేక పేరు చిన్ని. | Chinni.'],
      ['అందరూ కంగారు పడితే రాణి ఏం చేసింది? | When everyone panicked, what did Rani do?', 'నేల జాగ్రత్తగా చూసింది | looked carefully at the ground', ['ఏడ్చింది | cried', 'నిద్రపోయింది | slept', 'పారిపోయింది | ran away'], 'రెండవ వాక్యం. | The second sentence.', 'రాణి ప్రశాంతంగా గమనించింది. | She calmly observed.'],
      ['గిట్టల గుర్తులు ఎక్కడ కనిపించాయి? | Where were the hoof marks?', 'బురదలో | in the mud', ['గోడ మీద | on the wall', 'ఆకాశంలో | in the sky', 'పుస్తకంలో | in a book'], 'మూడవ వాక్యం. | The third sentence.', 'బురదలో గుర్తులు పడతాయి. | Marks show in mud.'],
      ['మేక తోటలో ఏం చేస్తోంది? | What was the goat doing in the garden?', 'ఆకులు మేస్తోంది | munching leaves', ['పాట పాడుతోంది | singing', 'ఈదుతోంది | swimming', 'చదువుతోంది | reading'], 'మేకలకు ఆకులు ఇష్టం. | Goats love leaves.', 'చిన్ని ఆకులు మేస్తోంది. | Munching leaves.'],
      ['రాణి గొప్ప గుణం ఏమిటి? | What was Rani\'s best quality?', 'జాగ్రత్తగా గమనించడం | observing carefully', ['గట్టిగా అరవడం | shouting', 'భయపడటం | being scared', 'సోమరితనం | laziness'], 'కంగారు పడకుండా ఏం చేసింది? | What did she do instead of panicking?', 'గమనించడమే రాణి తెలివి. | Observing was her cleverness.'],
    ]),
  ]),
  o('rani.write', 'కథ రాయడం: వాక్యం పూర్తి చేయి | Writing the story: finish the sentence', [
    P('కథ రాయాలంటే ప్రతి వాక్యం స్పష్టంగా ఉండాలి: ఎవరు + ఏం చేశారు. | To write a story, each sentence should be clear: who + what they did.'),
    KEYS('రాణి + నేల చూసింది. | Rani + looked at the ground.', 'మేక + ఆకులు మేసింది. | The goat + munched leaves.', 'అందరూ + మెచ్చుకున్నారు. | Everyone + praised.'),
    PH('✏️', 'నీ సొంత మాటల్లో కథ రాయి. | Write the story in your own words.'),
    TIP('వాక్యం చివర చుక్క (.) మరచిపోకు! | Do not forget the full stop (.) at the end!'),
  ], [
    EX('"రాణి వాళ్ళ మేక ___" పూర్తి చేయి. | Finish: "Rani\'s goat ___"', ['కథ మొదలు గుర్తు చేసుకో. | Recall how the story began.'], 'కనిపించలేదు | was missing'),
    EX('"గుర్తుల వెంట వెళ్తే ___" పూర్తి చేయి. | Finish: "Following the marks ___"', ['మేక ఎక్కడ దొరికింది? | Where was the goat?'], 'మేక తోటలో దొరికింది | the goat was in the garden'),
  ], [
    mcq('finish', RETELL, [
      ['"రాణి వాళ్ళ మేక ___." | "Rani\'s goat ___."', 'కనిపించలేదు | was missing', ['ఎగిరింది | flew', 'పాట పాడింది | sang', 'బడికి వెళ్ళింది | went to school'], 'కథ సమస్యతో మొదలవుతుంది. | The story starts with a problem.', 'మేక కనిపించలేదు — అదే సమస్య. | The goat was missing.'],
      ['"బురదలో ___ కనిపించాయి." | "In the mud ___ appeared."', 'గిట్టల గుర్తులు | hoof marks', ['చేపలు | fish', 'నక్షత్రాలు | stars', 'పుస్తకాలు | books'], 'మేక నడిచిన గుర్తులు. | Marks the goat left while walking.', 'గిట్టల గుర్తులు కనిపించాయి. | Hoof marks.'],
      ['"అందరూ రాణిని ___." | "Everyone ___ Rani."', 'మెచ్చుకున్నారు | praised', ['తిట్టారు | scolded', 'మరిచారు | forgot', 'దాచారు | hid'], 'కథ సంతోషంగా ముగిసింది. | The story ended happily.', 'అందరూ మెచ్చుకున్నారు. | They praised her.'],
      ['"మేక తోటలో ___ మేస్తోంది." | "The goat was munching ___ in the garden."', 'ఆకులు | leaves', ['రాళ్ళు | stones', 'బట్టలు | clothes', 'కాగితాలు | papers'], 'మేక ఆహారం. | The goat\'s food.', 'మేక ఆకులు మేస్తుంది. | Goats eat leaves.'],
      ['"రాణి ___ నేల చూసింది." | "Rani looked at the ground ___."', 'జాగ్రత్తగా | carefully', ['కోపంగా | angrily', 'ఏడుస్తూ | crying', 'నిద్రలో | in her sleep'], 'ఆమె బాగా గమనించింది. | She observed well.', 'రాణి జాగ్రత్తగా చూసింది. | Carefully.'],
    ]),
    orderT('sent', 'పదాలను వరుసలో పెట్టి కథ వాక్యం రాయి. | Put the words in order to write a story sentence.', [
      ['రాణి | Rani', 'నేల | ground', 'చూసింది. | looked at.'], ['మేక | goat', 'ఆకులు | leaves', 'మేసింది. | munched.'],
      ['అందరూ | everyone', 'రాణిని | Rani', 'మెచ్చుకున్నారు. | praised.'], ['చిన్ని | Chinni', 'తోటలో | in the garden', 'దొరికింది. | was found.'],
    ], 'ఎవరు ముందు, పని చివర. | Who first, action last.'),
  ]),
], 'Original WonderLab story on the lesson theme (a clever girl solves a problem); the textbook story is not reproduced — teacher should connect it to the book.');

// ============================================================ 17. కోడిపిల్ల
const ch17 = unit(17, 'ch17', 'కోడిపిల్ల | The little chick', [
  o('kodi.story', 'బొమ్మల కథ: అమ్మ రెక్కల కింద | Picture story: under mother\'s wings', [
    P('ఈ బొమ్మల కథ చూసి, ప్రతి బొమ్మకు ఒక వాక్యం చెప్పు. | Look at this picture story and say one sentence for each picture.'),
    ...RHYME('కోడిపిల్ల సాహసం (మా కథ) | The chick\'s adventure (our story)', [
      '🐔 కోడిపిల్ల అమ్మ మాట వినకుండా దూరంగా వెళ్ళింది. | The chick wandered far, not listening to mother.',
      '🐜 పురుగుల వెంట పరుగెత్తింది. | It ran after insects.',
      '🐦 ఆకాశంలో పెద్ద గద్ద తిరుగుతోంది! | A big kite (bird) was circling in the sky!',
      '🐓 అమ్మ కోడి "కొక్ కొక్" అని పిలిచింది. | Mother hen called "kok kok".',
      '🐔 కోడిపిల్ల పరుగెత్తి అమ్మ రెక్కల కింద దాక్కుంది. | The chick ran and hid under mother\'s wings.',
    ]),
    PH('🐔', 'అమ్మ రెక్కల కింద కోడిపిల్ల సురక్షితం. | The chick is safe under mother\'s wings.'),
    TIP('బయటకు వెళ్ళేటప్పుడు అమ్మ, నాన్నకు చెప్పి వెళ్ళాలి — కోడిపిల్ల నేర్చుకుంది! | Always tell your parents before going out; the chick learnt that!'),
  ], [
    EX('కోడిపిల్ల దేని వెంట పరుగెత్తింది? | What did the chick run after?', ['రెండవ బొమ్మ 🐜. | The second picture 🐜.'], 'పురుగులు | insects'),
    EX('కోడిపిల్ల ఎక్కడ దాక్కుంది? | Where did the chick hide?', ['చివరి బొమ్మ. | The last picture.'], 'అమ్మ రెక్కల కింద | under mother\'s wings'),
  ], [
    orderT('seq', 'బొమ్మల కథను క్రమంలో పెట్టు. | Put the picture story in order.', [
      ['🐔 దూరంగా వెళ్ళింది | wandered far', '🐦 గద్ద వచ్చింది | the kite bird came', '🐓 అమ్మ పిలిచింది | mother called', '🐔 దాక్కుంది | hid'],
      ['🥚 గుడ్డు | egg', '🐔 కోడిపిల్ల | chick', '🐓 కోడి | hen'],
      ['🐜 పురుగులు చూసింది | saw insects', '🐔 పరుగెత్తింది | ran', '🐓 అమ్మ దగ్గర చేరింది | reached mother'],
    ], 'ముందు కోడిపిల్ల దూరంగా వెళ్ళింది. | First the chick wandered away.'),
    mcq('story', 'బొమ్మల కథ మళ్ళీ చూడు. | Look at the picture story again.', [
      ['ఆకాశంలో ఏం తిరుగుతోంది? | What was circling in the sky?', 'గద్ద | a kite bird', ['విమానం | an aeroplane', 'గాలిపటం | a paper kite', 'మబ్బు | a cloud'], 'మూడవ బొమ్మ. | The third picture.', 'పెద్ద గద్ద తిరుగుతోంది. | A big kite bird.'],
      ['అమ్మ కోడి ఎలా పిలిచింది? | How did mother hen call?', '"కొక్ కొక్" | "kok kok"', ['"మే మే" | "me me"', '"భౌ భౌ" | "bhow bhow"', '"కూ కూ" | "koo koo"'], 'కోడి అరుపు. | The hen\'s call.', 'అమ్మ "కొక్ కొక్" అంది. | "kok kok".'],
      ['కోడిపిల్ల తప్పు ఏమిటి? | What was the chick\'s mistake?', 'అమ్మ మాట వినలేదు | did not listen to mother', ['గింజలు తిన్నది | ate grains', 'నిద్రపోయింది | slept', 'పాట పాడింది | sang'], 'మొదటి బొమ్మ. | The first picture.', 'అమ్మ మాట వినకుండా దూరంగా వెళ్ళింది. | It wandered off without listening.'],
      ['ఈ కథ నీతి? | The lesson of this story?', 'పెద్దల మాట వినాలి | listen to elders', ['ఒంటరిగా దూరం వెళ్ళాలి | wander far alone', 'గద్దతో ఆడాలి | play with the kite bird', 'దాక్కోకూడదు | never hide'], 'అమ్మ దగ్గరే సురక్షితం. | Safe with mother.', 'పెద్దల మాట మనల్ని కాపాడుతుంది. | Elders\' words keep us safe.'],
      ['కోడిపిల్ల ఎక్కడ సురక్షితంగా ఉంది? | Where was the chick safe?', 'అమ్మ రెక్కల కింద | under mother\'s wings', ['రోడ్డు మీద | on the road', 'చెట్టు పైన | on a tree top', 'గద్ద దగ్గర | near the kite bird'], 'చివరి బొమ్మ. | The last picture.', 'అమ్మ రెక్కలు కోడిపిల్లను కాపాడాయి. | Mother\'s wings protected it.'],
    ]),
  ]),
  o('kodi.write', 'బొమ్మకు వాక్యం రాయడం | Writing a sentence for a picture', [
    P('బొమ్మ చూసి "ఎవరు ఏం చేస్తున్నారు" అని ఒక వాక్యం రాయి. | Look at a picture and write one sentence: who is doing what.'),
    KEYS('🐔 కోడిపిల్ల గింజలు తింటోంది. | The chick is eating grains.', '🐓 కోడి పిలుస్తోంది. | The hen is calling.', '🐦 గద్ద ఎగురుతోంది. | The kite bird is flying.'),
    PH('🐓', 'అమ్మ కోడి — కొక్ కొక్! | Mother hen: kok kok!'),
    TIP('బొమ్మలో ముందు "ఎవరు" ఉన్నారో చూడు, తర్వాత "ఏం చేస్తున్నారు" చూడు. | First see who is in the picture, then what they are doing.'),
  ], [
    EX('🐟 బొమ్మకు వాక్యం: | A sentence for 🐟:', ['ఎవరు? చేప. ఏం చేస్తోంది? ఈదుతోంది. | Who? A fish. Doing what? Swimming.'], 'చేప ఈదుతోంది. | The fish is swimming.'),
    EX('🐦 బొమ్మకు వాక్యం: | A sentence for 🐦:', ['పక్షి — ఎగురుతోంది. | A bird: flying.'], 'పక్షి ఎగురుతోంది. | The bird is flying.'),
  ], [
    pic('sent', 'బొమ్మ ఏం చేస్తోందో ఆలోచించు. | Think about what the picture is doing.', [
      ['"చేప ఈదుతోంది." — ఏ బొమ్మ? | "The fish is swimming." Which picture?', ['🐟', 'చేప | fish'], [['🐦', 'పక్షి | bird'], ['🐄', 'ఆవు | cow']], 'నీటిలో ఉండేది. | It lives in water.', '🐟 చేప ఈదుతుంది. | The fish swims.'],
      ['"పక్షి ఎగురుతోంది." — ఏ బొమ్మ? | "The bird is flying." Which picture?', ['🐦', 'పక్షి | bird'], [['🐟', 'చేప | fish'], ['🐢', 'తాబేలు | tortoise']], 'రెక్కలు ఉన్నది. | It has wings.', '🐦 పక్షి ఎగురుతుంది. | The bird flies.'],
      ['"కోడి గింజలు తింటోంది." — ఏ బొమ్మ? | "The hen is eating grains." Which picture?', ['🐔', 'కోడి | hen'], [['🐶', 'కుక్క | dog'], ['🐟', 'చేప | fish']], 'కొక్ కొక్ అనేది. | It says kok kok.', '🐔 కోడి గింజలు తింటుంది. | The hen eats grains.'],
      ['"ఆవు పాలు ఇస్తుంది." — ఏ బొమ్మ? | "The cow gives milk." Which picture?', ['🐄', 'ఆవు | cow'], [['🐐', 'మేక | goat'], ['🐱', 'పిల్లి | cat']], 'అంబా అనేది. | It says ambaa.', '🐄 ఆవు పాలు ఇస్తుంది. | The cow gives milk.'],
      ['"కుక్క ఇంటికి కాపలా కాస్తోంది." — ఏ బొమ్మ? | "The dog is guarding the house." Which picture?', ['🐶', 'కుక్క | dog'], [['🐱', 'పిల్లి | cat'], ['🐰', 'కుందేలు | rabbit']], 'భౌ భౌ అనేది. | It says bhow bhow.', '🐶 కుక్క కాపలా కాస్తుంది. | The dog guards.'],
    ]),
    orderT('words', 'పదాలను వరుసలో పెట్టి బొమ్మకు వాక్యం రాయి. | Put the words in order to write the picture sentence.', [
      ['కోడిపిల్ల | chick', 'గింజలు | grains', 'తింటోంది. | is eating.'], ['అమ్మ | mother', 'కోడి | hen', 'పిలుస్తోంది. | is calling.'],
      ['గద్ద | kite bird', 'ఆకాశంలో | in the sky', 'తిరుగుతోంది. | is circling.'], ['కోడిపిల్ల | chick', 'రెక్కల కింద | under the wings', 'దాక్కుంది. | hid.'],
    ], 'ఎవరు ముందు, పని చివర. | Who first, action last.'),
  ]),
], 'Original WonderLab picture story on the lesson theme; the textbook picture story is not reproduced — teacher should connect it to the book.');

// ============================================================ 17*. ఉపాయం (picture story)
const ch17s = unit('17*', 'ch17s', 'ఉపాయం | A clever plan', [
  o('upayam.story', 'బొమ్మల కథ: టోపీల వ్యాపారి, కోతులు | Picture story: the cap seller and the monkeys', [
    P('ఇది అందరికీ తెలిసిన పాత జానపద కథ — మన మాటల్లో. | A well-known old folk tale, told in our own words.'),
    ...RHYME('టోపీలు, కోతులు | Caps and monkeys', [
      '🎩 ఒక వ్యాపారి టోపీలు అమ్ముతూ చెట్టు కింద నిద్రపోయాడు. | A cap seller fell asleep under a tree.',
      '🐒 కోతులు టోపీలన్నీ ఎత్తుకొని చెట్టు ఎక్కాయి! | Monkeys took all the caps up the tree!',
      '🤔 వ్యాపారి ఆలోచించాడు: "కోతులు నేను చేసినట్టే చేస్తాయి." | He thought: "Monkeys copy what I do."',
      '🎩 తన టోపీ నేలకు విసిరాడు — కోతులూ విసిరాయి! | He threw his cap down, and so did the monkeys!',
      '🧺 టోపీలన్నీ ఏరుకొని నవ్వుతూ వెళ్ళాడు. | He gathered all the caps and left smiling.',
    ]),
    PH('🐒', 'కోతులు అనుకరిస్తాయి — మనం చేసింది చేస్తాయి. | Monkeys copy what we do.'),
    TIP('కోపం కంటే ఉపాయం గొప్పది. | A clever plan beats anger.'),
  ], [
    EX('కోతులు ఏం ఎత్తుకెళ్ళాయి? | What did the monkeys take?', ['రెండవ బొమ్మ. | The second picture.'], 'టోపీలు | the caps'),
    EX('వ్యాపారి ఉపాయం ఏమిటి? | What was the seller\'s plan?', ['కోతులు అనుకరిస్తాయి. | Monkeys copy.', 'తన టోపీ విసిరాడు. | He threw his own cap.'], 'తన టోపీ విసరడం | throwing his own cap'),
  ], [
    orderT('seq', 'కథను క్రమంలో పెట్టు. | Put the story in order.', [
      ['🎩 వ్యాపారి నిద్రపోయాడు | the seller slept', '🐒 కోతులు టోపీలు తీసుకున్నాయి | monkeys took caps', '🤔 ఆలోచించాడు | he thought', '🧺 టోపీలు ఏరుకున్నాడు | he gathered the caps'],
      ['🤔 ఉపాయం | plan', '🎩 టోపీ విసిరాడు | threw his cap', '🐒 కోతులూ విసిరాయి | monkeys threw too'],
      ['సమస్య | problem', 'ఉపాయం | plan', 'సంతోషం | happy end'],
    ], 'ముందు వ్యాపారి నిద్రపోయాడు. | First the seller fell asleep.'),
    mcq('story', 'కథను మళ్ళీ చూడు. | Look at the story again.', [
      ['వ్యాపారి ఏం అమ్ముతాడు? | What did the man sell?', 'టోపీలు | caps', ['పండ్లు | fruits', 'పూలు | flowers', 'బొమ్మలు | toys'], 'మొదటి బొమ్మ 🎩. | The first picture 🎩.', 'అతను టోపీల వ్యాపారి. | He sold caps.'],
      ['కోతులు ఎందుకు టోపీలు విసిరాయి? | Why did the monkeys throw the caps?', 'వ్యాపారిని అనుకరించాయి | they copied the seller', ['బరువుగా ఉన్నాయి | caps were heavy', 'వాన వచ్చింది | it rained', 'నిద్ర వచ్చింది | they were sleepy'], 'కోతుల అలవాటు. | A monkey habit.', 'కోతులు మనం చేసింది చేస్తాయి. | Monkeys copy us.'],
      ['వ్యాపారి కోపంతో అరిస్తే? | If the seller had shouted angrily?', 'కోతులు కూడా అరిచేవి, టోపీలు రావు | monkeys would shout back; no caps', ['టోపీలు వెంటనే వచ్చేవి | caps would come at once', 'కోతులు నిద్రపోయేవి | monkeys would sleep', 'చెట్టు పడేది | the tree would fall'], 'కోతులు అనుకరిస్తాయి — అరుపును కూడా! | Monkeys copy, even shouting!', 'కోపం పనిచేయదు; ఉపాయం పనిచేసింది. | Anger fails; the plan worked.'],
      ['ఈ కథ పేరు "ఉపాయం" ఎందుకు? | Why is the story called "a clever plan"?', 'వ్యాపారి తెలివిగా ఆలోచించాడు | the seller thought cleverly', ['కోతులు గెలిచాయి | the monkeys won', 'అందరూ నిద్రపోయారు | everyone slept', 'చెట్టు మాట్లాడింది | the tree spoke'], 'సమస్యను ఎలా తీర్చాడు? | How did he solve it?', 'తెలివైన ఆలోచనతో టోపీలు దక్కాయి. | A clever idea got the caps back.'],
      ['కథ చివర వ్యాపారి ఎలా ఉన్నాడు? | How was the seller at the end?', 'సంతోషంగా | happy', ['ఏడుస్తూ | crying', 'కోపంగా | angry', 'భయంగా | scared'], 'చివరి బొమ్మ: "నవ్వుతూ". | Last picture: "smiling".', 'టోపీలు దొరికి సంతోషించాడు. | Happy to have his caps.'],
    ]),
  ]),
  o('upayam.think', 'ఆలోచిద్దాం: నీ ఉపాయం | Let us think: your clever plan', [
    P('ప్రతి సమస్యకు ఒక ఉపాయం ఉంటుంది. ప్రశాంతంగా ఆలోచిస్తే దొరుకుతుంది. | Every problem has a clever way out. Think calmly and you will find it.'),
    KEYS('1. సమస్య ఏమిటో చూడు | 1. See what the problem is', '2. ప్రశాంతంగా ఆలోచించు | 2. Think calmly', '3. ఒక దారి ప్రయత్నించు | 3. Try one way', '4. పనిచేయకపోతే మరో దారి | 4. If it fails, try another'),
    PH('💡', 'ఉపాయం = మనసులో వెలిగే దీపం! | A clever plan is a light switching on in your mind!'),
    TIP('పెద్ద సమస్య అయితే పెద్దవాళ్ళ సాయం అడగడం కూడా మంచి ఉపాయమే. | For a big problem, asking an adult for help is a clever plan too.'),
  ], [
    EX('పెన్సిల్ మొన విరిగింది. ఉపాయం? | Your pencil tip broke. A plan?', ['చెక్కే పరికరంతో చెక్కు. | Use a sharpener.'], 'చెక్కుకోవడం | sharpen it'),
    EX('బంతి చెట్టు మీద ఇరుక్కుంది. ఉపాయం? | The ball is stuck in a tree. A plan?', ['ఎక్కడం ప్రమాదం. | Climbing is risky.', 'పెద్దవాళ్ళను పొడవాటి కర్రతో సాయం అడుగు. | Ask an adult with a long stick.'], 'పెద్దవాళ్ళ సాయం | ask an adult to help'),
  ], [
    mcq('plan', 'ప్రశాంతంగా, సురక్షితంగా ఆలోచించు. | Think calmly and safely.', [
      ['వానలో గొడుగు లేదు. ఉపాయం? | Rain, and no umbrella. A plan?', 'దోస్తు గొడుగులో కలిసి వెళ్ళడం | share a friend\'s umbrella', ['వానలో గంతులు వేయడం | jump in the rain', 'ఏడవడం | cry', 'బడిలోనే పడుకోవడం | sleep at school'], 'సోపతి పాఠం గుర్తుందా? | Remember the friendship lesson?', 'పంచుకుంటే ఇద్దరూ తడవరు. | Sharing keeps both dry.'],
      ['బడి సంచి బరువుగా ఉంది. ఉపాయం? | Your school bag is too heavy. A plan?', 'ఆ రోజు అక్కర్లేని పుస్తకాలు తీసేయడం | remove books not needed that day', ['సంచి పారేయడం | throw the bag', 'బడికి వెళ్ళకపోవడం | skip school', 'దోస్తుకు ఇచ్చేయడం | make a friend carry it'], 'టైంటేబుల్ చూడు. | Check the timetable.', 'అవసరమైనవే పెట్టుకుంటే బరువు తగ్గుతుంది. | Pack only what you need.'],
      ['దోస్తులిద్దరికీ ఒకే ఊయల కావాలి. ఉపాయం? | Two friends want the same swing. A plan?', 'వంతులు వేసుకోవడం | take turns', ['గొడవపడటం | fight', 'ఊయల విరగ్గొట్టడం | break the swing', 'ఏడవడం | cry'], 'ఇద్దరూ ఆడాలి. | Both should get to play.', 'వంతుల వారీగా ఆడితే అందరికీ సంతోషం. | Taking turns keeps everyone happy.'],
      ['నీళ్ళ బాటిల్ మూత గట్టిగా ఉంది. ఉపాయం? | The water bottle lid is too tight. A plan?', 'గుడ్డతో పట్టుకొని తిప్పడం / పెద్దవాళ్ళను అడగడం | grip with a cloth or ask an adult', ['పళ్ళతో కొరకడం | bite it', 'బాటిల్ పగలగొట్టడం | smash the bottle', 'నీళ్ళు తాగకపోవడం | never drink'], 'సురక్షితమైన దారి. | A safe way.', 'గుడ్డ పట్టు ఇస్తుంది; లేకపోతే సాయం అడుగు. | A cloth gives grip, or ask for help.'],
      ['కోతులు టోపీలు ఎత్తుకెళ్తే వ్యాపారి ఏం చేశాడు? | What did the seller do when monkeys took the caps?', 'తన టోపీ విసిరాడు | threw his own cap', ['చెట్టు నరికాడు | cut the tree', 'ఏడ్చాడు | cried', 'ఇంటికి వెళ్ళిపోయాడు | went home'], 'కథ గుర్తు చేసుకో. | Recall the story.', 'కోతులు అనుకరించాయి, టోపీలు కింద పడ్డాయి. | The monkeys copied and the caps fell.'],
    ]),
    matchT('match', 'సమస్యను ఉపాయంతో కలుపు | Match each problem to a clever plan', [
      ['పెన్సిల్ విరిగింది | pencil broke', 'చెక్కుకో | sharpen it'], ['దాహం వేసింది | thirsty', 'నీళ్ళు తాగు | drink water'], ['ఒకే ఊయల | one swing', 'వంతులు | take turns'],
      ['చీకటి గది | dark room', 'లైటు వేయి | switch on the light'], ['దారి తెలియదు | lost the way', 'పెద్దవాళ్ళను అడుగు | ask an adult'],
    ], 'ప్రతి సమస్యకు సురక్షితమైన దారి వెతుకు. | Find a safe way for each problem.'),
  ]),
], 'Retells a public-domain folk tale (the cap seller and the monkeys) in original words; teacher should connect it to the book picture story.');

// ============================================================ 18. నాయనా... పులి
const ch18 = unit(18, 'ch18', 'నాయనా... పులి | Father... a tiger!', [
  o('puli.story', 'కథ: అబద్ధం చెప్పిన గొర్రెల కాపరి | Story: the shepherd boy who lied', [
    P('ఇది ప్రపంచమంతా తెలిసిన పాత నీతి కథ — మన మాటల్లో, మన పల్లెలో. | A fable known all over the world, told in our own words and set in our village.'),
    ...RHYME('పులి వచ్చింది! (పాత కథ, మన మాటల్లో) | The tiger came! (old fable, our words)', [
      '🐑 సోము కొండ దగ్గర గొర్రెలు కాస్తున్నాడు. | Somu was grazing sheep near the hill.',
      '🗣️ సరదాకి "నాయనా… పులి! పులి!" అని అరిచాడు. | For fun he shouted, "Father… a tiger! A tiger!"',
      '🧑‍🌾 ఊరి వాళ్ళు కర్రలతో పరుగెత్తి వచ్చారు — పులి లేదు! | Villagers ran up with sticks; no tiger!',
      '🐅 ఒక రోజు నిజంగా పులి వచ్చింది. సోము అరిచాడు, కానీ ఎవరూ నమ్మలేదు. | One day a tiger really came. Somu shouted, but no one believed him.',
      '😢 సోము నేర్చుకున్నాడు: ఎప్పుడూ నిజమే చెప్పాలి. | Somu learnt: always tell the truth.',
    ]),
    PH('🐅', 'పులి — అడవి జంతువు. | The tiger, a wild animal.'),
    TIP('"నాయనా" అంటే తండ్రిని పిలిచే మాట; తెలంగాణ పల్లెల్లో పెద్దలను కూడా ఇలా పిలుస్తారు. | "Naayanaa" calls a father; in Telangana villages elders are also called this way.'),
  ], [
    EX('సోము మొదట ఎందుకు అరిచాడు? | Why did Somu shout the first time?', ['రెండవ వాక్యం: "సరదాకి". | Second sentence: "for fun".'], 'సరదాకి, అబద్ధంగా | for fun, a lie'),
    EX('పులి నిజంగా వచ్చినప్పుడు ఎవరూ ఎందుకు రాలేదు? | Why did no one come when the tiger really came?', ['ముందు అబద్ధం చెప్పాడు. | He had lied before.', 'అందుకే నమ్మలేదు. | So no one believed him.'], 'అతన్ని నమ్మలేదు | they did not believe him'),
  ], [
    orderT('seq', 'కథను క్రమంలో పెట్టు. | Put the story in order.', [
      ['🐑 గొర్రెలు కాశాడు | grazed sheep', '🗣️ అబద్ధంగా అరిచాడు | shouted a lie', '🐅 నిజంగా పులి వచ్చింది | the tiger really came', '😢 ఎవరూ నమ్మలేదు | no one believed'],
      ['అబద్ధం | lie', 'నమ్మకం పోయింది | trust was lost', 'పాఠం నేర్చుకున్నాడు | learnt a lesson'],
      ['🗣️ "పులి!" | "Tiger!"', '🧑‍🌾 ఊరి వాళ్ళు వచ్చారు | villagers came', '🙅 పులి లేదు | no tiger'],
    ], 'కథ గొర్రెలు కాయడంతో మొదలు. | It starts with grazing sheep.'),
    mcq('story', 'కథను మళ్ళీ చదువు. | Read the story again.', [
      ['సోము ఏ పని చేస్తాడు? | What was Somu\'s work?', 'గొర్రెలు కాయడం | grazing sheep', ['చేపలు పట్టడం | fishing', 'బడి పాఠాలు | teaching', 'వంట | cooking'], 'మొదటి వాక్యం. | The first sentence.', 'సోము గొర్రెల కాపరి. | He was a shepherd boy.'],
      ['ఊరి వాళ్ళు దేనితో వచ్చారు? | What did villagers come with?', 'కర్రలతో | sticks', ['పూలతో | flowers', 'పుస్తకాలతో | books', 'బంతులతో | balls'], 'మూడవ వాక్యం. | The third sentence.', 'పులిని తరమడానికి కర్రలు. | Sticks to chase the tiger.'],
      ['ఈ కథ నీతి? | The lesson?', 'ఎప్పుడూ నిజమే చెప్పాలి | always tell the truth', ['సరదాకి అబద్ధం పర్వాలేదు | lying for fun is fine', 'పులులు మంచివి | tigers are nice', 'గొర్రెలు కాయకూడదు | never graze sheep'], 'చివరి వాక్యం. | The last sentence.', 'అబద్ధం చెబితే నమ్మకం పోతుంది. | Lies destroy trust.'],
      ['మొదటిసారి ఊరి వాళ్ళు వచ్చినప్పుడు ఏమైంది? | What happened the first time villagers came?', 'పులి లేదు | there was no tiger', ['పులిని పట్టుకున్నారు | caught the tiger', 'గొర్రెలు పోయాయి | sheep were lost', 'వాన పడింది | it rained'], 'సోము అబద్ధం చెప్పాడు. | Somu had lied.', 'పులి లేదు — అది అబద్ధం. | No tiger: it was a lie.'],
      ['సోము స్థానంలో నువ్వు ఉంటే? | If you were Somu?', 'నిజమే చెబుతా | I would tell the truth', ['అబద్ధం చెబుతా | I would lie', 'అందరినీ ఆటపట్టిస్తా | I would tease everyone', 'దాక్కుంటా | I would hide'], 'నమ్మకం గొప్పది. | Trust is precious.', 'నిజం చెప్పేవారిని అందరూ నమ్ముతారు. | People trust truth-tellers.'],
    ]),
  ]),
  o('puli.write', 'కథ రాయడం: నిజం, అబద్ధం | Writing: truth and lies', [
    P('కథలో ఉన్న వాక్యం నిజమా (✅) అబద్ధమా (❌) తెలుసుకొని, సరైన వాక్యం రాయగలగాలి. | Decide if a sentence matches the story (✅) or not (❌), and write the right sentence.'),
    KEYS('✅ సోము గొర్రెలు కాశాడు. | Somu grazed sheep.', '❌ సోము ఏనుగులు కాశాడు. | Somu grazed elephants.', '✅ చివరకు సోము నిజం విలువ తెలుసుకున్నాడు. | At last Somu learnt the value of truth.'),
    PH('✅', 'కథలో జరిగింది = నిజం. | What happened in the story = true.'),
    TIP('ప్రతి వాక్యాన్ని కథతో పోల్చి చూడు. | Compare each sentence with the story.'),
  ], [
    EX('"సోము ఏనుగులు కాశాడు." నిజమా? | "Somu grazed elephants." True?', ['కథలో గొర్రెలు. | The story says sheep.'], 'కాదు ❌ — గొర్రెలు | no: sheep'),
    EX('"పులి నిజంగా వచ్చింది." నిజమా? | "A tiger really came." True?', ['నాలుగవ వాక్యం. | The fourth sentence.'], 'అవును ✅ | yes'),
  ], [
    tapT('true', 'కథలో జరిగిన వాక్యాలను మాత్రమే ఎంచుకో. | Tap only the sentences that happened in the story.', [
      ['సోము గొర్రెలు కాశాడు. | Somu grazed sheep.', true], ['సోము సరదాకి అరిచాడు. | Somu shouted for fun.', true], ['ఊరి వాళ్ళు కర్రలతో వచ్చారు. | Villagers came with sticks.', true],
      ['ఒక రోజు నిజంగా పులి వచ్చింది. | One day a tiger really came.', true], ['సోము నిజం విలువ నేర్చుకున్నాడు. | Somu learnt the value of truth.', true],
      ['సోము ఏనుగులు కాశాడు. | Somu grazed elephants.', false], ['పులి పాట పాడింది. | The tiger sang.', false], ['ఊరి వాళ్ళు పడవలో వచ్చారు. | Villagers came by boat.', false], ['సోము రైలు నడిపాడు. | Somu drove a train.', false],
    ], 'కథలో ఉన్నదే నిజం. | Only what is in the story is true.'),
    mcq('finish', RETELL, [
      ['"సోము ___ గొర్రెలు కాస్తున్నాడు." | "Somu was grazing sheep ___."', 'కొండ దగ్గర | near the hill', ['సముద్రంలో | in the sea', 'బడిలో | in school', 'రైలులో | in a train'], 'మొదటి వాక్యం. | The first sentence.', 'కొండ దగ్గర కాస్తున్నాడు. | Near the hill.'],
      ['"సరదాకి ___ అని అరిచాడు." | "For fun he shouted ___."', '"పులి! పులి!" | "Tiger! Tiger!"', ['"వాన! వాన!" | "Rain! Rain!"', '"బడి! బడి!" | "School! School!"', '"పాట! పాట!" | "Song! Song!"'], 'పాఠం పేరు చూడు. | Look at the lesson title.', '"పులి! పులి!" అని అరిచాడు. | "Tiger! Tiger!"'],
      ['"నిజంగా పులి వచ్చినప్పుడు ___." | "When the tiger really came ___."', 'ఎవరూ నమ్మలేదు | no one believed', ['అందరూ నవ్వారు | everyone laughed', 'వాన పడింది | it rained', 'పులి నిద్రపోయింది | the tiger slept'], 'నాలుగవ వాక్యం. | The fourth sentence.', 'ఎవరూ నమ్మలేదు. | No one believed.'],
      ['"ఎప్పుడూ ___ చెప్పాలి." | "Always tell ___."', 'నిజమే | the truth', ['అబద్ధమే | lies', 'కథలే | only stories', 'జోకులే | only jokes'], 'కథ నీతి. | The moral.', 'ఎప్పుడూ నిజమే చెప్పాలి. | Always the truth.'],
      ['"ఊరి వాళ్ళు ___ పరుగెత్తి వచ్చారు." | "Villagers ran up ___."', 'కర్రలతో | with sticks', ['పాటలతో | with songs', 'పూలతో | with flowers', 'బొమ్మలతో | with toys'], 'పులిని తరమాలి. | To chase a tiger away.', 'కర్రలతో వచ్చారు. | With sticks.'],
    ]),
  ]),
], 'Retells a public-domain fable (the boy who cried wolf, set with a tiger) in original words; teacher should connect it to the book story.');

// ============================================================ 19. తెలుగు నెలలు
const MONTHS: [string, string][] = [
  ['చైత్రం', 'Chaitram'], ['వైశాఖం', 'Vaishaakham'], ['జ్యేష్ఠం', 'Jyeshtham'], ['ఆషాఢం', 'Aashaadham'], ['శ్రావణం', 'Shraavanam'], ['భాద్రపదం', 'Bhaadrapadam'],
  ['ఆశ్వయుజం', 'Aashvayujam'], ['కార్తీకం', 'Kaartheekam'], ['మార్గశిరం', 'Maargashiram'], ['పుష్యం', 'Pushyam'], ['మాఘం', 'Maagham'], ['ఫాల్గుణం', 'Phaalgunam'],
];
const mL = (i: number) => w(`${MONTHS[(i + 12) % 12][0]} | ${MONTHS[(i + 12) % 12][1]}`);
const monthNext = tp('next', (r) => {
  const i = r.int(0, 11), back = r.pick([false, true]);
  const ans = back ? i - 1 : i + 1;
  const wrong = [back ? i + 1 : i - 1, i + 2, i - 2, i + 6].map(mL);
  const m = mL(i);
  return {
    type: 'mcq', prompt: back ? L2(`"${m.te}" కు ముందు వచ్చే నెల ఏది?`, `Which month comes just before ${m.en}?`) : L2(`"${m.te}" తర్వాత వచ్చే నెల ఏది?`, `Which month comes just after ${m.en}?`),
    ...choose(r, mL(ans), wrong),
    hints: [t('నెలల వరుస పాడు: చైత్రం, వైశాఖం, జ్యేష్ఠం… | Sing the month order: Chaitram, Vaishaakham, Jyeshtham…'), L2(`${m.te} వరుసలో ${(i % 12) + 1}వ నెల.`, `${m.en} is month number ${(i % 12) + 1}.`), t('ఫాల్గుణం తర్వాత మళ్ళీ చైత్రం వస్తుంది. | After Phaalgunam comes Chaitram again.')],
    mistakes: [{ when: 'wrong', explain: J(t(NOT), t('ముందు/తర్వాత జాగ్రత్తగా చూడు. | Check carefully: before or after?')) }],
    solution: [J(ANS, mL(ans)), back ? L2(`${mL(ans).te} → ${m.te}`, `${mL(ans).en} → ${m.en}`) : L2(`${m.te} → ${mL(ans).te}`, `${m.en} → ${mL(ans).en}`)],
  };
});
const monthRow = tp('row', (r) => {
  const i = r.int(0, 11);
  const ws = [0, 1, 2, 3].map((k) => mL(i + k));
  return {
    type: 'order', prompt: t('ఈ నెలలను సరైన వరుసలో పెట్టు. | Put these months in order.'), ...ordering(r, ws),
    hints: [t('చైత్రం మొదటి నెల; ఫాల్గుణం చివరిది. | Chaitram is first; Phaalgunam is last.'), L2(`మొదట వచ్చేది: ${ws[0].te}.`, `It starts with ${ws[0].en}.`)],
    mistakes: [{ when: 'wrong', explain: J(t(NOT), t('నెలల పాట మళ్ళీ పాడి చూడు. | Sing the month song again.')) }],
    solution: [L2(ws.map((x) => x.te).join(' → '), ws.map((x) => x.en).join(' → '))],
  };
}, 2);
const ch19 = unit(19, 'ch19', 'తెలుగు నెలలు | The Telugu months', [
  o('nelalu.names', 'పన్నెండు తెలుగు నెలలు | The twelve Telugu months', [
    P('తెలుగు సంవత్సరం ఉగాదితో మొదలవుతుంది. మొదటి నెల చైత్రం. మొత్తం పన్నెండు నెలలు; ప్రతి రెండు నెలలు ఒక ఋతువు. | The Telugu year begins with Ugadi. The first month is Chaitram. There are twelve months; every two months make a season.'),
    KEYS('1 చైత్రం 2 వైశాఖం — వసంత ఋతువు | spring', '3 జ్యేష్ఠం 4 ఆషాఢం — గ్రీష్మ ఋతువు | summer', '5 శ్రావణం 6 భాద్రపదం — వర్ష ఋతువు | rains', '7 ఆశ్వయుజం 8 కార్తీకం — శరదృతువు | autumn', '9 మార్గశిరం 10 పుష్యం — హేమంత ఋతువు | early winter', '11 మాఘం 12 ఫాల్గుణం — శిశిర ఋతువు | late winter'),
    ...RHYME('నెలల పాట (మా పాట) | Month song (our rhyme)', [
      'చైత్రం వైశాఖం, ఉగాది పచ్చడి | Chaitram, Vaishaakham: Ugadi chutney',
      'జ్యేష్ఠం ఆషాఢం, ఎండా వానా | Jyeshtham, Aashaadham: sun and rain',
      'శ్రావణం భాద్రపదం, ముసురు వానలు | Shraavanam, Bhaadrapadam: steady rains',
      'ఆశ్వయుజం కార్తీకం, బతుకమ్మ దీపాలు | Aashvayujam, Kaartheekam: Bathukamma and lamps',
      'మార్గశిరం పుష్యం, ముగ్గులు గాలిపటాలు | Maargashiram, Pushyam: rangoli and kites',
      'మాఘం ఫాల్గుణం, మళ్ళీ ఉగాది రాదా! | Maagham, Phaalgunam: and Ugadi comes again!',
    ]),
    PH('🌅', 'ఉగాది — తెలుగు కొత్త సంవత్సరం, చైత్ర మాసంలో. | Ugadi, the Telugu New Year, in Chaitram.'),
    TIP('నెలల పాట రోజుకు ఒకసారి పాడు — వారంలో వరుస గుర్తుండిపోతుంది! | Sing the month song once a day; in a week you will know the order!'),
  ], [
    EX('తెలుగు సంవత్సరంలో మొదటి నెల ఏది? | Which is the first Telugu month?', ['ఉగాది ఏ నెలలో వస్తుంది? | In which month is Ugadi?', 'చైత్రం. | Chaitram.'], 'చైత్రం | Chaitram'),
    EX('శ్రావణం తర్వాత ఏ నెల? | Which month comes after Shraavanam?', ['5 శ్రావణం, 6 …? | 5 Shraavanam, 6 …?'], 'భాద్రపదం | Bhaadrapadam'),
  ], [monthNext, monthRow]),
  o('nelalu.festivals', 'నెలలు, పండుగలు, ఋతువులు | Months, festivals and seasons', [
    P('ప్రతి నెలకు ఒక ప్రత్యేకత. పండుగలు కూడా నెలలతో వస్తాయి. | Every month is special, and festivals come with the months.'),
    KEYS('ఉగాది, శ్రీరామనవమి — చైత్రం | Ugadi, Sri Rama Navami: Chaitram', 'వినాయక చవితి — భాద్రపదం | Vinayaka Chavithi: Bhaadrapadam', 'బతుకమ్మ, దసరా, దీపావళి — ఆశ్వయుజం | Bathukamma, Dasara, Deepavali: Aashvayujam', 'కార్తీక దీపాలు — కార్తీకం | Karthika lamps: Kaartheekam', 'సంక్రాంతి — పుష్యం | Sankranti: Pushyam', 'మహాశివరాత్రి — మాఘం | Maha Shivaratri: Maagham', 'హోలీ — ఫాల్గుణం | Holi: Phaalgunam'),
    PH('🪔', 'కార్తీక మాసంలో దీపాలు వెలిగిస్తారు. | Lamps are lit in Kaartheekam.'),
    TIP('ఇంట్లో క్యాలెండరు చూసి ఈ నెల తెలుగు పేరు ఏమిటో పెద్దలను అడుగు. | Look at the calendar at home and ask elders this month\'s Telugu name.'),
  ], [
    EX('ఉగాది ఏ నెలలో? | In which month is Ugadi?', ['తెలుగు కొత్త సంవత్సరం. | The Telugu New Year.', 'మొదటి నెల. | The first month.'], 'చైత్రం | Chaitram'),
    EX('సంక్రాంతి ఏ నెలలో? | In which month is Sankranti?', ['గాలిపటాల పండుగ, చలికాలం. | The kite festival in winter.'], 'పుష్యం | Pushyam'),
  ], [
    mcq('fest', 'పండుగ ఏ కాలంలో వస్తుందో ఆలోచించు. | Think when the festival comes.', [
      ['ఉగాది ఏ నెలలో వస్తుంది? | In which month is Ugadi?', 'చైత్రం | Chaitram', ['మాఘం | Maagham', 'కార్తీకం | Kaartheekam', 'ఆషాఢం | Aashaadham'], 'కొత్త సంవత్సరం మొదటి రోజు. | New Year\'s Day.', 'ఉగాది చైత్ర మాసం మొదటి రోజు. | Ugadi is on the first day of Chaitram.'],
      ['వినాయక చవితి ఏ నెలలో? | In which month is Vinayaka Chavithi?', 'భాద్రపదం | Bhaadrapadam', ['చైత్రం | Chaitram', 'పుష్యం | Pushyam', 'ఫాల్గుణం | Phaalgunam'], 'వర్షాకాలం చివర. | Late in the rainy season.', 'వినాయక చవితి భాద్రపదంలో. | In Bhaadrapadam.'],
      ['సంక్రాంతి ఏ నెలలో? | In which month is Sankranti?', 'పుష్యం | Pushyam', ['శ్రావణం | Shraavanam', 'వైశాఖం | Vaishaakham', 'జ్యేష్ఠం | Jyeshtham'], 'చలికాలంలో గాలిపటాల పండుగ. | The winter kite festival.', 'సంక్రాంతి పుష్య మాసంలో. | In Pushyam.'],
      ['కార్తీక దీపాలు ఏ నెలలో? | In which month are the Karthika lamps lit?', 'కార్తీకం | Kaartheekam', ['మాఘం | Maagham', 'చైత్రం | Chaitram', 'ఆషాఢం | Aashaadham'], 'పేరులోనే ఉంది! | It is in the name!', 'కార్తీక మాసంలో దీపాలు. | In Kaartheekam.'],
      ['బతుకమ్మ, దసరా ఏ నెలలో? | In which month are Bathukamma and Dasara?', 'ఆశ్వయుజం | Aashvayujam', ['చైత్రం | Chaitram', 'మాఘం | Maagham', 'జ్యేష్ఠం | Jyeshtham'], 'వానల తర్వాత, పూల కాలం. | After the rains, in flower season.', 'బతుకమ్మ, దసరా ఆశ్వయుజంలో. | In Aashvayujam.'],
      ['వర్ష ఋతువులో ఉండే నెలలు? | Which months make the rainy season?', 'శ్రావణం, భాద్రపదం | Shraavanam, Bhaadrapadam', ['చైత్రం, వైశాఖం | Chaitram, Vaishaakham', 'మాఘం, ఫాల్గుణం | Maagham, Phaalgunam', 'మార్గశిరం, పుష్యం | Maargashiram, Pushyam'], '5వ, 6వ నెలలు. | Months 5 and 6.', 'శ్రావణ, భాద్రపదాలు వర్ష ఋతువు. | Shraavanam and Bhaadrapadam.'],
    ]),
    matchT('match', 'పండుగను నెలతో కలుపు | Match each festival to its month', [
      ['ఉగాది | Ugadi', 'చైత్రం | Chaitram'], ['వినాయక చవితి | Vinayaka Chavithi', 'భాద్రపదం | Bhaadrapadam'], ['దసరా | Dasara', 'ఆశ్వయుజం | Aashvayujam'],
      ['సంక్రాంతి | Sankranti', 'పుష్యం | Pushyam'], ['శివరాత్రి | Shivaratri', 'మాఘం | Maagham'], ['హోలీ | Holi', 'ఫాల్గుణం | Phaalgunam'],
    ], 'పెట్టెలోని పండుగ పట్టిక గుర్తు చేసుకో. | Recall the festival list in the box.'),
  ]),
  o('nelalu.talk', 'సంభాషణ చదవడం | Reading a conversation', [
    P('ఇద్దరు మాట్లాడుకునేది సంభాషణ. ఎవరు మాట్లాడుతున్నారో పేరు ముందు ఉంటుంది. | A conversation is two people talking. The speaker\'s name comes first.'),
    ...RHYME('తాతయ్య, తేజ (మా సంభాషణ) | Grandpa and Teja (our conversation)', [
      'తేజ: తాతయ్యా, ఈ నెల తెలుగు పేరు ఏమిటి? | Teja: Grandpa, what is this month\'s Telugu name?',
      'తాతయ్య: ఇది కార్తీకం, తేజా. | Grandpa: It is Kaartheekam, Teja.',
      'తేజ: కార్తీకంలో ఏం చేస్తారు? | Teja: What do people do in Kaartheekam?',
      'తాతయ్య: సాయంత్రం దీపాలు వెలిగిస్తారు. | Grandpa: They light lamps in the evening.',
      'తేజ: అయితే ఈ రోజు నేనూ దీపం పెడతా! | Teja: Then I will light a lamp today too!',
    ]),
    PH('👴', 'తాతయ్య కథలు, కబుర్లు చెబుతాడు. | Grandpa shares stories and chats.'),
    TIP('ఒకరు తేజగా, ఒకరు తాతయ్యగా చదవండి — నాటకంలా! | One reads as Teja, one as Grandpa, like a play!'),
  ], [
    EX('తేజ మొదట ఏమి అడిగింది? | What did Teja ask first?', ['మొదటి మాట. | The first line.'], 'ఈ నెల తెలుగు పేరు | this month\'s Telugu name'),
    EX('"దీపాలు వెలిగిస్తారు" అన్నది ఎవరు? | Who said "they light lamps"?', ['నాలుగవ మాట ముందు పేరు చూడు. | Look at the name before the fourth line.'], 'తాతయ్య | Grandpa'),
  ], [
    mcq('talk', 'సంభాషణను మళ్ళీ చదువు. | Read the conversation again.', [
      ['ఈ సంభాషణలో ఎవరు ఉన్నారు? | Who is in this conversation?', 'తేజ, తాతయ్య | Teja and Grandpa', ['అమ్మ, నాన్న | mother and father', 'టీచర్, రవి | teacher and Ravi', 'రాణి, మేక | Rani and the goat'], 'పేర్లు చూడు. | Look at the names.', 'తేజ, తాతయ్య మాట్లాడుకున్నారు. | Teja and Grandpa.'],
      ['తాతయ్య చెప్పిన నెల ఏది? | Which month did Grandpa name?', 'కార్తీకం | Kaartheekam', ['చైత్రం | Chaitram', 'మాఘం | Maagham', 'శ్రావణం | Shraavanam'], 'రెండవ మాట. | The second line.', 'ఇది కార్తీకం. | Kaartheekam.'],
      ['కార్తీకంలో ఏం చేస్తారు? | What do people do in Kaartheekam?', 'దీపాలు వెలిగిస్తారు | light lamps', ['గాలిపటాలు ఎగరేస్తారు | fly kites', 'రంగులు చల్లుతారు | throw colours', 'పచ్చడి చేస్తారు | make chutney'], 'నాలుగవ మాట. | The fourth line.', 'సాయంత్రం దీపాలు వెలిగిస్తారు. | They light lamps.'],
      ['చివరికి తేజ ఏమంది? | What did Teja say at the end?', 'నేనూ దీపం పెడతా | I will light a lamp too', ['నాకు నిద్ర వస్తోంది | I am sleepy', 'నాకు భయం | I am scared', 'నేను వెళ్తా | I am leaving'], 'చివరి మాట. | The last line.', 'తేజ దీపం పెడతానంది. | She will light a lamp.'],
      ['"తాతయ్యా" అని ఎవరు పిలిచారు? | Who called "Grandpa"?', 'తేజ | Teja', ['తాతయ్య | Grandpa', 'అమ్మ | mother', 'ఎవరూ కాదు | nobody'], 'మొదటి మాట ఎవరిది? | Whose is the first line?', 'తేజ తాతయ్యను పిలిచింది. | Teja called Grandpa.'],
    ]),
    orderT('seq', 'సంభాషణను క్రమంలో పెట్టు. | Put the conversation in order.', [
      ['తేజ: ఈ నెల ఏది? | Teja: which month?', 'తాతయ్య: కార్తీకం | Grandpa: Kaartheekam', 'తేజ: ఏం చేస్తారు? | Teja: what do people do?', 'తాతయ్య: దీపాలు | Grandpa: lamps'],
      ['ప్రశ్న | question', 'జవాబు | answer', 'ధన్యవాదాలు | thank you'],
      ['నమస్తే తాతయ్యా | hello Grandpa', 'కథ చెప్పు | tell a story', 'భలే కథ! | great story!'],
    ], 'సంభాషణ ప్రశ్నతో మొదలవుతుంది. | A conversation starts with a question.'),
  ]),
], 'Month names, seasons and festival months are standard facts; the conversation is original. Teacher should connect it to the book dialogue.');

// ============================================================ 19*. పరమానందయ్య శిష్యులు
const ch19s = unit('19*', 'ch19s', 'పరమానందయ్య శిష్యులు | Paramanandayya\'s disciples', [
  o('shishyulu.story', 'నవ్వుల కథ: ఎవరు తప్పిపోయారు? | A funny story: who is missing?', [
    P('పరమానందయ్య గారి శిష్యుల కథలు తెలుగు నాట తరతరాలుగా చెప్పుకునే నవ్వుల కథలు. ఇక్కడ వాటి లాంటి ఒక కథ, మన మాటల్లో. | Stories of Paramanandayya\'s silly disciples are funny folk tales told for generations. Here is one like them, in our own words.'),
    ...RHYME('పది మంది శిష్యులు (మన మాటల్లో) | Ten disciples (in our words)', [
      'పది మంది శిష్యులు ఏరు దాటారు. | Ten disciples crossed a stream.',
      'ఒకడు లెక్కపెట్టాడు: "1, 2, … 9! ఒకడు మునిగిపోయాడు!" | One counted: "1, 2, … 9! Someone drowned!"',
      'ప్రతి ఒక్కడూ లెక్కపెట్టాడు — అందరికీ 9 మందే! | Each one counted, and each got 9!',
      'ఒక బాటసారి నవ్వి, లెక్కపెట్టేవాణ్ణి కూడా కలిపి లెక్కించాడు: 10! | A traveller laughed and counted the counter too: 10!',
      'శిష్యులు సిగ్గుపడి నవ్వుకున్నారు. | The disciples laughed, a little embarrassed.',
    ]),
    PH('🧑‍🏫', 'పరమానందయ్య గురువు గారు. | Paramanandayya, the teacher.'),
    TIP('నువ్వు లెక్కపెట్టేటప్పుడు నిన్ను నువ్వు మరచిపోకు! | When you count people, do not forget yourself!'),
  ], [
    EX('శిష్యులు ఎంతమంది? | How many disciples were there?', ['మొదటి వాక్యం. | The first sentence.'], '10'),
    EX('వాళ్ళకు 9 మందే ఎందుకు వచ్చారు? | Why did they count only 9?', ['లెక్కపెట్టేవాడు తనను తాను లెక్కించలేదు. | The counter did not count himself.'], 'తనను లెక్కించలేదు | forgot to count himself'),
  ], [
    mcq('story', 'కథను మళ్ళీ చదువు. | Read the story again.', [
      ['శిష్యులు ఏమి దాటారు? | What did the disciples cross?', 'ఏరు | a stream', ['కొండ | a hill', 'రోడ్డు | a road', 'వంతెన | a bridge'], 'మొదటి వాక్యం. | The first sentence.', 'వాళ్ళు ఏరు దాటారు. | A stream.'],
      ['నిజంగా ఎవరైనా మునిగిపోయారా? | Did anyone really drown?', 'లేదు, పది మందీ ఉన్నారు | no, all ten were there', ['అవును, ఒకరు | yes, one', 'అవును, ఇద్దరు | yes, two', 'అందరూ | all of them'], 'బాటసారి లెక్క చూడు. | See the traveller\'s count.', 'అందరూ క్షేమం — 10 మంది. | All ten were safe.'],
      ['బాటసారి ఏం చేశాడు? | What did the traveller do?', 'అందరినీ సరిగ్గా లెక్కించాడు | counted everyone correctly', ['ఏరులో దూకాడు | jumped in the stream', 'పారిపోయాడు | ran away', 'ఏడ్చాడు | cried'], 'నాలుగవ వాక్యం. | The fourth sentence.', 'లెక్కపెట్టేవాణ్ణి కూడా కలిపి 10. | He included the counter: 10.'],
      ['ఈ కథ ఎలాంటిది? | What kind of story is this?', 'నవ్వుల కథ | a funny story', ['భయం కథ | a scary story', 'వార్త | news', 'పాఠం లెక్క | a maths sum only'], 'శిష్యుల పొరపాటు నవ్వు తెప్పిస్తుంది. | The disciples\' mistake makes us laugh.', 'ఇది హాస్య కథ. | It is a funny tale.'],
      ['శిష్యుల పొరపాటు ఏమిటి? | What was the disciples\' mistake?', 'తమను తాము లెక్కించలేదు | they did not count themselves', ['ఈత రాలేదు | could not swim', 'దారి తప్పారు | got lost', 'నిద్రపోయారు | fell asleep'], 'ప్రతి ఒక్కడికీ 9 ఎందుకు? | Why 9 for each?', 'లెక్కించేవాడు తనను మరిచాడు. | The counter forgot himself.'],
    ]),
    orderT('seq', 'కథను క్రమంలో పెట్టు. | Put the story in order.', [
      ['ఏరు దాటారు | crossed the stream', 'లెక్కపెట్టారు: 9 | counted: 9', 'బాటసారి లెక్కించాడు: 10 | traveller counted: 10', 'నవ్వుకున్నారు | they laughed'],
      ['కంగారు | worry', 'సరైన లెక్క | correct count', 'నవ్వు | laughter'],
    ], 'ముందు ఏరు దాటారు. | First they crossed the stream.'),
  ]),
  o('shishyulu.count', 'లెక్కపెడదాం — నిన్నూ కలిపి! | Let us count, yourself included!', [
    P('గుంపులో ఎంతమంది ఉన్నారో లెక్కించేటప్పుడు నిన్ను కూడా కలపాలి. | When counting a group, include yourself.'),
    KEYS('నేను + నా ముగ్గురు దోస్తులు = 4 | me + my 3 friends = 4', 'అమ్మ, నాన్న, అక్క, నేను = 4 | mother, father, sister, me = 4'),
    PH('🧒', 'నేను కూడా ఒకటి! | I count too!'),
    TIP('లెక్క మొదలుపెట్టే ముందు నీ గుండె మీద చెయ్యి పెట్టుకొని "ఒకటి" అను! | Before counting, put a hand on your heart and say "one"!'),
  ], [
    EX('నువ్వు, నీ ఇద్దరు దోస్తులు — మొత్తం ఎంతమంది? | You and your 2 friends: how many in all?', ['ఇద్దరు దోస్తులు + నువ్వు. | 2 friends + you.', '2 + 1 = 3. | 2 + 1 = 3.'], '3'),
    EX('ఐదుగురు శిష్యుల్లో ఒకడు 4 అని లెక్కపెట్టాడు. తప్పు ఏమిటి? | One of 5 disciples counted 4. The mistake?', ['తనను లెక్కించలేదు. | He left himself out.'], 'తనను మరిచాడు | forgot himself'),
  ], [
    tp('self', (r) => {
      const n = r.int(2, 9);
      const who = r.pick([['దోస్తులు', 'friends'], ['శిష్యులు', 'disciples'], ['అక్కాచెల్లెళ్ళు', 'sisters'], ['ఆటగాళ్ళు', 'players']] as const);
      return {
        type: 'mcq', prompt: L2(`నువ్వు, నీతో ${n} మంది ${who[0]} ఉన్నారు. మొత్తం ఎంతమంది?`, `You and ${n} ${who[1]} are together. How many in all?`),
        ...choose(r, w(`${n + 1} | ${n + 1}`), [`${n} | ${n}`, `${n + 2} | ${n + 2}`, `${Math.max(1, n - 1)} | ${Math.max(1, n - 1)}`].map(w)),
        hints: [t('నిన్ను నువ్వు కూడా లెక్కించు! | Count yourself too!'), L2(`${n} + నువ్వు = ?`, `${n} + you = ?`)],
        mistakes: [{ when: 'wrong', explain: J(t(NOT), L2(`శిష్యుల్లా నిన్ను మరవకు: ${n} + 1.`, `Do not forget yourself like the disciples: ${n} + 1.`)) }],
        solution: [L2(`${n} + 1 = ${n + 1}`, `${n} + 1 = ${n + 1}`), t(GOOD)],
      };
    }),
    mcq('funny', 'కథలోని నవ్వు గుర్తు చేసుకో. | Remember the joke in the story.', [
      ['10 మంది ఉండగా 9 అని ఎందుకు వచ్చింది? | Why did 10 become 9?', 'లెక్కించేవాడు తనను కలపలేదు | the counter left himself out', ['ఒకడు ఎగిరిపోయాడు | one flew away', 'ఏరు తిన్నది | the stream ate one', 'లెక్క తప్పు పుస్తకం | wrong maths book'], 'కథలో పొరపాటు. | The mistake in the story.', 'తనను కలిపితే 10. | Including himself makes 10.'],
      ['నువ్వు 4 మంది దోస్తులతో ఉన్నావు. మొత్తం? | You are with 4 friends. Total?', '5', ['4', '3', '6'], 'నువ్వు + 4. | You + 4.', '4 + 1 = 5. | 4 + 1 = 5.'],
      ['ముగ్గురు అన్నదమ్ములు; ఒకడు "2" అన్నాడు. సరైన లెక్క? | Three brothers; one said "2". Correct count?', '3', ['2', '1', '4'], 'అతను తనను మరిచాడు. | He forgot himself.', '2 + 1 = 3. | 2 + 1 = 3.'],
      ['శిష్యులు లెక్కలో ఏం నేర్చుకోవాలి? | What should the disciples learn about counting?', 'తనను కూడా లెక్కించాలి | count yourself too', ['ఎప్పుడూ 9 అనాలి | always say 9', 'లెక్కించకూడదు | never count', 'ఏరు దాటకూడదు | never cross streams'], 'కథ నీతి. | The moral.', 'తనను మరవకుండా లెక్కించాలి. | Count yourself too.'],
      ['ఆరుగురు ఆటగాళ్ళలో ఒకడు 5 అని లెక్కపెట్టాడు. ఎవరిని మరిచాడు? | One of 6 players counted 5. Who was forgotten?', 'తనను | himself', ['కెప్టెన్‌ను | the captain', 'బంతిని | the ball', 'టీచర్‌ను | the teacher'], 'శిష్యుల కథలాగే. | Just like the disciples.', 'తనను మరిచాడు. | He forgot himself.'],
    ]),
  ]),
], 'Retells a traditional Paramanandayya-style folk tale in original words; teacher should connect it to the book story.');

// ============================================================ 20. శ్రీకృష్ణ శతకం
const ch20 = unit(20, 'ch20', 'శ్రీకృష్ణ శతకం | Sri Krishna Shatakam (verses)', [
  o('shatakam.about', 'శతకం అంటే ఏమిటి? | What is a shatakam?', [
    P('శతకం అంటే సుమారు వంద పద్యాల పుస్తకం. ప్రతి పద్యం చివర ఒకే మాట వస్తుంది — దాన్ని "మకుటం" అంటారు. శ్రీకృష్ణ శతకంలో పద్యాలు కృష్ణుణ్ణి పిలుస్తూ ముగుస్తాయి. | A shatakam is a book of about a hundred verses. Every verse ends with the same word, called the makutam. In the Sri Krishna Shatakam the verses end by calling Krishna.'),
    KEYS('శతం = వంద | shatam = hundred', 'పద్యం = ఛందస్సుతో రాసిన కవిత | padyam = a metrical verse', 'మకుటం = ప్రతి పద్యం చివరి ఒకే మాట | makutam = the same closing word of every verse', 'సుమతీ శతకం, వేమన శతకం — మరికొన్ని శతకాలు | Sumathi and Vemana shatakams are other examples'),
    ...RHYME('మకుటం ఆట (మా చిన్న పద్యం) | Makutam game (our tiny verse)', [
      'చిన్ని చేతుల పూలు తెచ్చితి, కృష్ణా! | With tiny hands I bring flowers, Krishna!',
      'మంచి మాటలే నేర్పవయ్యా, కృష్ణా! | Teach me only kind words, Krishna!',
      '(రెండు వరుసలూ "కృష్ణా!" తో ముగిశాయి — అదే మకుటం.) | (Both lines end with "Krishna!": that is the makutam.)',
    ]),
    PH('🦚', 'నెమలి పింఛం — కృష్ణుడి గుర్తు. | A peacock feather, Krishna\'s symbol.'),
    TIP('పద్యాన్ని రాగంతో, నెమ్మదిగా, స్పష్టంగా పలకాలి. | Recite a verse slowly and clearly, with a tune.'),
  ], [
    EX('"శతం" అంటే ఎంత? | How many is "shatam"?', ['శతకం = వంద పద్యాలు. | shatakam = a hundred verses.'], '100'),
    EX('మా చిన్న పద్యం మకుటం ఏది? | What is the makutam of our tiny verse?', ['రెండు వరుసల చివర ఒకే మాట. | The same word ends both lines.'], 'కృష్ణా! | Krishna!'),
  ], [
    mcq('about', 'శతకం గురించి గుర్తు చేసుకో. | Remember what a shatakam is.', [
      ['"శతకం" లో సుమారు ఎన్ని పద్యాలు? | About how many verses in a shatakam?', 'వంద | a hundred', ['పది | ten', 'రెండు | two', 'వెయ్యి | a thousand'], 'శతం = ? | shatam = ?', 'శతకం = సుమారు వంద పద్యాలు. | About a hundred verses.'],
      ['"మకుటం" అంటే? | What is a "makutam"?', 'ప్రతి పద్యం చివర వచ్చే ఒకే మాట | the same word that ends every verse', ['పద్యం మొదటి అక్షరం | the first letter', 'పుస్తకం బొమ్మ | the book\'s picture', 'కవి ఇల్లు | the poet\'s house'], 'మా చిన్న పద్యంలో "కృష్ణా!". | "Krishna!" in our tiny verse.', 'మకుటం = చివరి స్థిర పదం. | The fixed closing word.'],
      ['శ్రీకృష్ణ శతకం పద్యాలు ఎవరిని పిలుస్తాయి? | Whom do the Sri Krishna Shatakam verses call?', 'కృష్ణుడిని | Krishna', ['రాముడిని | Rama', 'వేమనను | Vemana', 'సుమతిని | Sumathi'], 'పుస్తకం పేరులోనే ఉంది. | It is in the title.', 'పద్యాలు "కృష్ణా!" అని ముగుస్తాయి. | They end calling Krishna.'],
      ['పద్యం ఎలా చదవాలి? | How should a verse be recited?', 'నెమ్మదిగా, స్పష్టంగా, రాగంతో | slowly, clearly, with a tune', ['చాలా వేగంగా | very fast', 'గొణుగుతూ | mumbling', 'అరుస్తూ | shouting'], 'ప్రతి మాట వినిపించాలి. | Every word should be heard.', 'పద్యాన్ని స్పష్టంగా, రాగంతో పలకాలి. | Clearly, with a tune.'],
      ['ఇది కూడా ఒక శతకం: | This is also a shatakam:', 'సుమతీ శతకం | Sumathi Shatakam', ['రామాయణం | Ramayanam', 'పంచతంత్రం | Panchatantram', 'బాలమిత్ర | Balamitra'], 'పేరు చివర "శతకం". | "Shatakam" at the end of the name.', 'సుమతీ శతకం, వేమన శతకం కూడా శతకాలు. | Sumathi and Vemana shatakams too.'],
    ]),
    tapT('makutam', '"కృష్ణా!" మకుటంతో ముగిసే వరుసలను ఎంచుకో. | Tap the lines that end with the makutam "Krishna!"', [
      ['పూలు తెచ్చితి, కృష్ణా! | I brought flowers, Krishna!', true], ['మంచి మాట నేర్పు, కృష్ణా! | Teach me kind words, Krishna!', true], ['అందరినీ కాపాడు, కృష్ణా! | Protect everyone, Krishna!', true],
      ['నిజమే పలికింతు, కృష్ణా! | I will speak only truth, Krishna!', true], ['అమ్మ వంట చేసింది. | Mother cooked.', false], ['రైలు కూ అంది. | The train went koo.', false], ['మేక ఆకులు మేసింది. | The goat ate leaves.', false],
    ], 'వరుస చివరి మాట చూడు. | Look at the last word of each line.'),
  ]),
  o('shatakam.values', 'పద్యాలు చెప్పే మంచి మాటలు | Good values the verses teach', [
    P('శతక పద్యాలు భక్తితో పాటు మంచి నడవడిక నేర్పుతాయి: నిజం చెప్పడం, పెద్దలను గౌరవించడం, ఇతరులకు సాయం చేయడం, గర్వం లేకుండా ఉండడం. | Shatakam verses teach devotion and good conduct: telling the truth, respecting elders, helping others, staying humble.'),
    KEYS('నిజం చెప్పు | tell the truth', 'పెద్దలను గౌరవించు | respect elders', 'సాయం చెయ్యి | help others', 'గర్వపడకు | do not be proud', 'పంచుకో | share'),
    PH('🙏', 'నమస్కారం — గౌరవానికి గుర్తు. | Namaskaram, a sign of respect.'),
    TIP('ఈ వారం ఒక మంచి మాట ఎంచుకొని రోజూ పాటించు. | Pick one good value this week and practise it daily.'),
  ], [
    EX('తాతయ్య వచ్చినప్పుడు ఏం చేయాలి? | What should you do when grandpa comes?', ['పెద్దలను గౌరవించాలి. | Respect elders.'], 'నమస్కారం చేయాలి | greet with a namaskaram'),
    EX('పరీక్షలో మొదటి మార్కు వస్తే? | You came first in a test. Then?', ['గర్వం వద్దు. | No pride.', 'ఇతరులకు నేర్పవచ్చు. | You can help others learn.'], 'వినయంగా ఉండాలి | stay humble'),
  ], [
    matchT('match', 'మంచి పనిని దాని పేరుతో కలుపు | Match each good deed to its value', [
      ['తాతయ్యకు నమస్కారం | greeting grandpa', 'గౌరవం | respect'], ['తప్పు ఒప్పుకోవడం | owning a mistake', 'నిజాయితీ | honesty'], ['దోస్తుకు పెన్సిల్ | pencil for a friend', 'పంచుకోవడం | sharing'],
      ['ముసలమ్మకు సంచి మోయడం | carrying a granny\'s bag', 'సాయం | helping'], ['గెలిచినా ఒదిగి ఉండడం | humble after winning', 'వినయం | humility'],
    ], 'ఆ పనిలో ఏ మంచి గుణం ఉంది? | Which good quality is in that deed?'),
    mcq('values', 'పద్యాలు నేర్పే మంచి నడవడిక ఆలోచించు. | Think of the good conduct the verses teach.', [
      ['ఏది మంచి అలవాటు? | Which is a good habit?', 'నిజం చెప్పడం | telling the truth', ['అబద్ధం చెప్పడం | lying', 'గొడవపడటం | fighting', 'ఎగతాళి చేయడం | teasing'], 'నాయనా పులి కథ గుర్తుందా? | Remember the tiger story?', 'నిజం చెప్పడం మంచి అలవాటు. | Truth-telling is good.'],
      ['పెద్దలతో ఎలా మాట్లాడాలి? | How should we speak to elders?', 'గౌరవంగా | respectfully', ['అరుస్తూ | shouting', 'ఎగతాళిగా | mockingly', 'పట్టించుకోకుండా | ignoring them'], 'మర్యాద. | Good manners.', 'పెద్దలతో గౌరవంగా మాట్లాడాలి. | Speak respectfully.'],
      ['ఎవరైనా కింద పడితే? | If someone falls down?', 'లేపి సాయం చేయాలి | help them up', ['నవ్వాలి | laugh', 'వెళ్ళిపోవాలి | walk away', 'ఫోటో తీయాలి | take a photo'], 'సాయం చేయడం మంచి గుణం. | Helping is a good quality.', 'సాయం చేయాలి. | Help them.'],
      ['"గర్వం" మంచిదా? | Is pride (garvam) good?', 'కాదు, వినయం మంచిది | no, humility is good', ['అవును, ఎప్పుడూ | yes, always', 'ఆటల్లో మాత్రమే | only in games', 'బడిలో మాత్రమే | only at school'], 'గొప్పవాళ్ళు ఒదిగి ఉంటారు. | Great people stay humble.', 'గర్వం వద్దు; వినయం ముద్దు. | No pride; humility is lovely.'],
      ['భక్తి అంటే? | What is devotion (bhakthi)?', 'దేవుడిపై ప్రేమ, నమ్మకం | love and faith in God', ['కోపం | anger', 'ఆట | a game', 'భయం | fear'], 'పద్యాలు కృష్ణుణ్ణి ప్రేమగా పిలుస్తాయి. | Verses call Krishna lovingly.', 'భక్తి = దేవుని మీద ప్రేమ. | Devotion = love for God.'],
    ]),
  ]),
], 'The classical Sri Krishna Shatakam verses are not reproduced; we teach what a shatakam/makutam is with an original two-line demo. Teacher should recite the book verses.');

export const units: USpec[] = [ch0, ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch7s, ch8, ch8s, ch9, ch10, ch11, ch11s, ch12, ch13, ch14, ch15, ch16, ch17, ch17s, ch18, ch19, ch19s, ch20];
