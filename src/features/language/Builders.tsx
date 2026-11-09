// Interactive builders used in Learn mode: గుణింతం (consonant + vowel sign), ఒత్తు (conjunct), CVC blending.
import { useState } from 'react';
import { Icon } from '../../ui/Icon';
import { CONSONANTS, GUNINTHAM_VOWELS, SIGN_NAMES, VOWEL_SIGNS, compose, conjunct, guninthamRow, showSign } from './telugu/script';
import type { Script } from './types';

type Say = (t: string, s: Script) => Promise<boolean>;

function Picker({ label, options, value, onPick, script, render }: { label: string; options: readonly string[]; value: string; onPick: (v: string) => void; script: Script; render?: (o: string) => string }) {
  return (
    <fieldset className="lang-picker">
      <legend>{label}</legend>
      <div className="lang-picker-grid">
        {options.map((o) => (
          <button key={o} type="button" className="lang-key" lang={script} aria-pressed={o === value} onClick={() => onPick(o)}>{render ? render(o) : o}</button>
        ))}
      </div>
    </fieldset>
  );
}

export function GuninthamBuilder({ say }: { say: Say }) {
  const [c, setC] = useState('క');
  const [v, setV] = useState('ఆ');
  const out = compose(c, v);
  const pick = (nc: string, nv: string) => { setC(nc); setV(nv); void say(compose(nc, nv), 'te'); };
  return (
    <div className="card flat stack lang-builder">
      <h3>గుణింతం తయారీ <span className="muted small">(Syllable builder)</span></h3>
      <div className="lang-builder-out" aria-live="polite">
        <span lang="te">{c}</span><span aria-hidden="true">+</span><span lang="te">{v}{VOWEL_SIGNS[v] ? ` (${showSign(VOWEL_SIGNS[v])})` : ''}</span><span aria-hidden="true">=</span>
        <b lang="te" className="lang-big">{out}</b>
        <button type="button" className="btn small" aria-label={`Hear ${out}`} onClick={() => void say(out, 'te')}><Icon name="speaker" /></button>
      </div>
      {SIGN_NAMES[v] && <p className="muted small" lang="te">గుర్తు పేరు: {SIGN_NAMES[v]}</p>}
      <Picker label="హల్లు (consonant)" options={CONSONANTS} value={c} onPick={(x) => pick(x, v)} script="te" />
      <Picker label="అచ్చు (vowel sign)" options={GUNINTHAM_VOWELS} value={v} onPick={(x) => pick(c, x)} script="te" />
      <div className="lang-row-strip" lang="te" aria-label={`Full గుణింతం of ${c}`}>
        {guninthamRow(c).map((s, i) => <button key={s} type="button" className="lang-key" aria-pressed={GUNINTHAM_VOWELS[i] === v} onClick={() => pick(c, GUNINTHAM_VOWELS[i])}>{s}</button>)}
      </div>
    </div>
  );
}

export function OttuBuilder({ say }: { say: Say }) {
  const [a, setA] = useState('క');
  const [b, setB] = useState('క');
  const out = conjunct(a, b);
  const opts = CONSONANTS.filter((x) => x !== 'క్ష' && x !== 'ఱ' && x !== 'ఙ' && x !== 'ఞ');
  return (
    <div className="card flat stack lang-builder">
      <h3>ఒత్తు తయారీ <span className="muted small">(Conjunct builder)</span></h3>
      <div className="lang-builder-out" aria-live="polite">
        <span lang="te">{a}</span><span aria-hidden="true">+</span><span lang="te">{b} ఒత్తు</span><span aria-hidden="true">=</span>
        <b lang="te" className="lang-big">{out}</b>
        <span className="pill">{a === b ? 'ద్విత్వాక్షరం (double)' : 'సంయుక్తాక్షరం (mixed)'}</span>
        <button type="button" className="btn small" aria-label={`Hear ${out}`} onClick={() => void say(out, 'te')}><Icon name="speaker" /></button>
      </div>
      <Picker label="మొదటి హల్లు (first consonant)" options={opts} value={a} onPick={setA} script="te" />
      <Picker label="ఒత్తుగా వచ్చే హల్లు (consonant written below)" options={opts} value={b} onPick={setB} script="te" />
    </div>
  );
}

const ONSETS = ['b', 'c', 'd', 'f', 'h', 'm', 'p', 'r', 's', 't'];
const VOWELS_EN = ['a', 'e', 'i', 'o', 'u'];
const CODAS = ['t', 'n', 'g', 'p', 'd'];
const REAL = new Set('bat bad bag ban bet bed beg bid big bin bit bog bot bud bug bun but cat can cap cod cop cot cub cud cup cut dad den dig dim din dip dog dot dug fan fat fed fig fin fit fog fun hat had hen hid hip hit hog hop hot hug hut mad man map mat men met mid mop mud mug nap pan pat peg pen pet pig pin pit pod pop pot pun pup rag ran rap rat red rid rig rip rod rot rub rug run rut sad sag sat set sip sit sod sop sun sup tag tan tap ten tin tip top tot tub tug'.split(' '));

export function CvcBuilder({ say }: { say: Say }) {
  const [w, setW] = useState(['c', 'a', 't']);
  const word = w.join('');
  const set = (i: number, x: string) => { const n = [...w]; n[i] = x; setW(n); };
  return (
    <div className="card flat stack lang-builder">
      <h3>Word builder</h3>
      <div className="lang-builder-out" aria-live="polite">
        {w.map((x, i) => <span key={i} className="lang-big-letter">{x}</span>)}<span aria-hidden="true">→</span><b className="lang-big">{word}</b>
        <span className="pill">{REAL.has(word) ? <><Icon name="check" />a real word</> : 'a made-up word'}</span>
        <button type="button" className="btn small" aria-label={`Sound out ${word}`} onClick={() => void say(`${w.join(', ')}. ${word}`, 'en')}><Icon name="speaker" /></button>
      </div>
      <Picker label="First sound" options={ONSETS} value={w[0]} onPick={(x) => set(0, x)} script="en" />
      <Picker label="Middle vowel" options={VOWELS_EN} value={w[1]} onPick={(x) => set(1, x)} script="en" />
      <Picker label="Last sound" options={CODAS} value={w[2]} onPick={(x) => set(2, x)} script="en" />
    </div>
  );
}
