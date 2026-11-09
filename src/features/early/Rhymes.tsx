// Rhymes & Songs: sing-along with each word lit up as it is sung, and a clap-along rhythm game.
// Rhymes are original WonderLab rhymes or traditional public-domain ones (see activities.ts).
import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../lib/app';
import { clearRepeat, getAudioPrefs, onSpeaking, stopSpeaking } from '../../lib/audio';
import { sfx, type SfxHandle } from '../../lib/sfx';
import { celebrate, Page } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { Art } from './art';
import { L } from './data/pictures';
import { BackRow, BigTile, Prompt, useActivity, useLastActivity, useNarrate, useRecord, useTx } from './common';
import { LevelPicker, StickerReveal, useReduced, useStickers } from './actCommon';
import { CLAP_WINDOW, RHYMES, beatFor, beatTimes, judgeClaps, wordTimings, wordsOf, type Rhyme, type Sticker } from './activities';

const T = {
  title: L('Rhymes & Songs', 'పాటలు, గేయాలు'),
  pick: L('Pick a rhyme to sing!', 'పాడటానికి ఒక పాట ఎంచుకో!'),
  sing: L('Sing along', 'కలిసి పాడు'), stop: L('Stop', 'ఆపు'),
  clap: L('Clap along', 'చప్పట్లు కొట్టు'), clapBtn: L('Clap!', 'చప్పట్లు!'),
  lineHint: L('Tap a line to hear it again.', 'మళ్ళీ వినడానికి ఒక వరుసను తాకు.'),
  clapHow: L('Listen to the drum. Clap on every beat! Tap the big button or press the space bar.', 'డప్పు విను. ప్రతి దెబ్బకు చప్పట్లు కొట్టు! పెద్ద బటన్ తాకు లేదా స్పేస్ బార్ నొక్కు.'),
  ready: L('Get ready…', 'సిద్ధంగా ఉండు…'), go: L('Clap!', 'చప్పట్లు!'),
  start: L('Start', 'మొదలు'), again: L('Clap again', 'మళ్ళీ కొట్టు'),
  speed: L('How fast?', 'ఎంత వేగం?'),
  sungAll: L('You sang the whole rhyme!', 'పాట మొత్తం పాడావు!'),
};
const CLAP_LEVELS = [L('Easy', 'సులువు'), L('Medium', 'మధ్యస్థం'), L('Tricky', 'కష్టం')];
const BEATS = 8, COUNT_IN = 4;
interface RhymeSave { sung: string[]; clapLevel: number; bestClap: Record<string, number> }
const INIT: RhymeSave = { sung: [], clapLevel: 0, bestClap: {} };

export default function Rhymes() {
  const { tx } = useTx();
  const { lang } = useApp();
  useLastActivity('/play/rhymes', T.title);
  const [st, save] = useActivity<RhymeSave>('rhymes', INIT);
  const [rhyme, setRhyme] = useState<Rhyme | null>(null);
  const [clap, setClap] = useState(false);
  useEffect(() => () => { stopSpeaking(); clearRepeat(); }, []);
  return (
    <Page title={tx(T.title)} back="/play" fullscreen>
      {rhyme && <BackRow onBack={() => { stopSpeaking(); clearRepeat(); if (clap) setClap(false); else setRhyme(null); }} />}
      {!rhyme && (
        <>
          <Prompt l={T.pick} />
          <div className="el-grid">
            {RHYMES.map((r) => <BigTile key={r.id} art={r.art} title={r.title} sub={st.sung.includes(r.id) ? '✓' : undefined} onGo={() => { setRhyme(r); setClap(false); }} />)}
          </div>
        </>
      )}
      {rhyme && !clap && <SingAlong key={`${rhyme.id}-${lang}`} rhyme={rhyme} onClap={() => { stopSpeaking(); setClap(true); }}
        onSung={() => save((s) => ({ sung: s.sung.includes(rhyme.id) ? s.sung : [...s.sung, rhyme.id] }))} />}
      {rhyme && clap && <ClapAlong key={`${rhyme.id}-${st.clapLevel}`} rhyme={rhyme} level={st.clapLevel || 0} onLevel={(v) => save({ clapLevel: v })}
        best={st.bestClap[rhyme.id] ?? 0} onScore={(n) => save((s) => ({ bestClap: { ...s.bestClap, [rhyme.id]: Math.max(n, s.bestClap[rhyme.id] ?? 0) } }))} />}
    </Page>
  );
}

function SingAlong({ rhyme, onClap, onSung }: { rhyme: Rhyme; onClap: () => void; onSung: () => void }) {
  const { tx, say } = useTx();
  const { prefs } = useApp();
  const reduced = useReduced();
  const record = useRecord('rhymes');
  const { give } = useStickers();
  const [cur, setCur] = useState(-1);
  const [word, setWord] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const timers = useRef<number[]>([]);
  const offRef = useRef<(() => void) | null>(null);
  const playingRef = useRef(false);
  const clear = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; offRef.current?.(); offRef.current = null; };
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => () => clear(), []);

  const finishSong = () => {
    playingRef.current = false; setPlaying(false); setCur(-1); setWord(-1); clearRepeat();
    sfx('success'); celebrate(); say(T.sungAll);
    record(rhyme.id, true);
    onSung();
    setSticker(give('rhymes'));
  };
  const singLine = (i: number, single: boolean) => {
    clear();
    setCur(i); setWord(-1);
    const line = rhyme.lines[i];
    const timings = wordTimings(tx(line), getAudioPrefs().rate || 0.9);
    let started = false, ended = false;
    const runWords = () => { let at = 0; timings.forEach((ms, w) => { later(() => setWord(w), at); at += ms; }); return at; };
    const done = () => {
      if (ended) return;
      ended = true; offRef.current?.(); offRef.current = null;
      later(() => {
        if (single || !playingRef.current) { setCur(-1); setWord(-1); clearRepeat(); return; }
        if (i + 1 < rhyme.lines.length) singLine(i + 1, false); else finishSong();
      }, 380);
    };
    const selfTimed = () => { if (started) return; started = true; later(done, runWords() + 300); };
    offRef.current = onSpeaking((on) => {
      if (on && !started) { started = true; runWords(); } else if (!on && started) done();
    });
    if (prefs.mute || !prefs.narration) { selfTimed(); return; }
    say(line);
    later(selfTimed, 2500); // no voice on this device / speech didn't start: keep our own time
  };
  const toggle = () => {
    if (playingRef.current) { playingRef.current = false; setPlaying(false); clear(); stopSpeaking(); clearRepeat(); setCur(-1); setWord(-1); return; }
    playingRef.current = true; setPlaying(true); setSticker(null);
    singLine(0, false);
  };

  return (
    <div className="el-play el-rhyme">
      <div className="el-rhyme-head">
        <span className={`el-rhyme-art ${playing && !reduced ? 'is-bouncing' : ''}`}><Art id={rhyme.art} /></span>
        <div>
          <h2>{tx(rhyme.title)}</h2>
          <p className="el-credit">{tx(rhyme.credit)}</p>
        </div>
      </div>
      <div className="el-row">
        <button type="button" className="btn primary el-big" onClick={toggle} aria-pressed={playing}><Icon name={playing ? 'stop' : 'play'} />{tx(playing ? T.stop : T.sing)}</button>
        <button type="button" className="btn el-big" onClick={() => { clear(); playingRef.current = false; setPlaying(false); onClap(); }}><Icon name="hand" />{tx(T.clap)}</button>
      </div>
      <ol className="el-lyrics" aria-label={tx(rhyme.title)}>
        {rhyme.lines.map((ln, i) => (
          <li key={i} className={i === cur ? 'is-cur' : ''}>
            <button type="button" className="el-lyric" onClick={() => { playingRef.current = false; setPlaying(false); singLine(i, true); }} aria-current={i === cur ? 'true' : undefined}>
              {wordsOf(tx(ln)).map((w, k) => <span key={k} className={i === cur && k === word ? 'el-word-on' : undefined}>{w}{' '}</span>)}
            </button>
          </li>
        ))}
      </ol>
      <p className="el-hint"><Icon name="speaker" />{tx(T.lineHint)}</p>
      {sticker && <StickerReveal s={sticker} />}
    </div>
  );
}

function ClapAlong({ rhyme, level, onLevel, best, onScore }: { rhyme: Rhyme; level: number; onLevel: (v: number) => void; best: number; onScore: (n: number) => void }) {
  const { tx, say } = useTx();
  const reduced = useReduced();
  const record = useRecord('rhymes');
  const { give } = useStickers();
  const [phase, setPhase] = useState<'idle' | 'count' | 'play' | 'done'>('idle');
  const [count, setCount] = useState(0);
  const [beat, setBeat] = useState(-1);
  const [hits, setHits] = useState<boolean[]>([]);
  const [result, setResult] = useState<{ n: number; extra: number } | null>(null);
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const timers = useRef<number[]>([]);
  const handles = useRef<SfxHandle[]>([]);
  const t0 = useRef(0);
  const keyClapAt = useRef(0);
  const taps = useRef<number[]>([]);
  const beats = useRef<number[]>([]);
  const lv = Math.max(0, Math.min(2, level));
  const bpm = Math.round(rhyme.bpm * [0.85, 1, 1.15][lv]);
  const win = CLAP_WINDOW[lv];
  useNarrate(T.clapHow, 'clap');
  const stopAll = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; handles.current.forEach((h) => h.stop()); handles.current = []; };
  useEffect(() => () => stopAll(), []);

  const start = () => {
    stopAll(); stopSpeaking(); clearRepeat();
    const gap = 60000 / bpm;
    taps.current = []; setHits(Array(BEATS).fill(false)); setResult(null); setSticker(null); setBeat(-1);
    setPhase('count'); setCount(0);
    t0.current = performance.now() + 400 + COUNT_IN * gap; // first clap beat
    beats.current = beatTimes(bpm, BEATS, 0);
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, Math.max(0, ms)));
    for (let i = 0; i < COUNT_IN; i++) at(400 + i * gap, () => { setCount(i + 1); const h = sfx('tick'); if (h) handles.current.push(h); });
    beats.current.forEach((b, i) => at(400 + COUNT_IN * gap + b, () => { if (i === 0) setPhase('play'); setBeat(i); const h = sfx('drum'); if (h) handles.current.push(h); }));
    at(400 + COUNT_IN * gap + beats.current[BEATS - 1] + win + 120, () => {
      const j = judgeClaps(taps.current, beats.current, win);
      setHits(j.hits); setResult({ n: j.count, extra: j.extra }); setPhase('done'); setBeat(-1);
      const good = j.count >= Math.ceil(BEATS * 0.6);
      record(`clap:${rhyme.id}:L${lv}`, good);
      onScore(j.count);
      if (good) { sfx('success'); celebrate(); setSticker(give('rhymes')); }
      say(good ? L(`Great clapping! ${j.count} out of ${BEATS} beats.`, `భలే చప్పట్లు! ${BEATS}లో ${j.count}.`) : L(`${j.count} out of ${BEATS}. Let’s try again!`, `${BEATS}లో ${j.count}. మళ్ళీ ప్రయత్నిద్దాం!`));
    });
  };
  const clapNow = () => {
    if (phase !== 'play' && phase !== 'count') return;
    const h = sfx('snap'); if (h) handles.current.push(h);
    const t = performance.now() - t0.current;
    taps.current.push(t);
    const i = beatFor(t, beats.current, win);
    if (i >= 0) setHits((hs) => hs.map((x, k) => (k === i ? true : x)));
  };
  useEffect(() => {
    if (phase !== 'play' && phase !== 'count') return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'BUTTON' && (e.target as HTMLElement).dataset.clap === undefined) return; // let other buttons work
        e.preventDefault(); keyClapAt.current = performance.now(); clapNow();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // re-bind each render so it sees the latest phase

  const running = phase === 'count' || phase === 'play';
  return (
    <div className="el-play el-clap">
      <div className="el-rhyme-head">
        <span className="el-rhyme-art"><Art id={rhyme.art} /></span>
        <div><h2>{tx(rhyme.title)}</h2><p className="el-credit">{tx(T.clapHow)}</p></div>
      </div>
      {!running && <LevelPicker label={T.speed} options={CLAP_LEVELS.map((n, i) => ({ id: i, name: n }))} value={lv} onChange={onLevel} />}
      <div className="el-beats" role="img" aria-label={`${hits.filter(Boolean).length} / ${BEATS}`}>
        {Array.from({ length: BEATS }, (_, i) => (
          <span key={i} className={`${i === beat ? 'is-now' : ''} ${hits[i] ? 'is-hit' : ''} ${reduced ? '' : 'anim'}`}>{hits[i] ? <Icon name="check" /> : i + 1}</span>
        ))}
      </div>
      <p className="el-clap-status" role="status" aria-live="polite">
        {phase === 'count' ? `${tx(T.ready)} ${count}` : phase === 'play' ? tx(T.go) : result ? `${result.n} / ${BEATS}` : ''}
      </p>
      {running
        ? <button type="button" data-clap="" className={`el-clap-btn ${beat >= 0 && !reduced ? 'pulse' : ''}`} onPointerDown={(e) => { if (e.button <= 0) clapNow(); }} onClick={(e) => { if (e.detail === 0 && performance.now() - keyClapAt.current > 400) clapNow(); }}>
            <Icon name="hand" size="lg" /><span>{tx(T.clapBtn)}</span>
          </button>
        : <div className="el-row"><button type="button" className="btn primary el-big" onClick={start} autoFocus><Icon name="play" />{tx(phase === 'done' ? T.again : T.start)}</button></div>}
      {best > 0 && !running && <p className="el-credit">{tx(L('Best', 'ఉత్తమం'))}: {best} / {BEATS}</p>}
      {sticker && phase === 'done' && <StickerReveal s={sticker} />}
    </div>
  );
}
