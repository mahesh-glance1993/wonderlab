// Daily Surprise: one short challenge a day (a pattern, an opposite, a colour mix and a sound),
// the same for everyone on the same day. Finishing it unwraps the day's sticker for the Sticker Book.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { sfx, type SfxHandle } from '../../lib/sfx';
import { celebrate, Page } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { L } from './data/pictures';
import { EarlyFeedback, PicButton, Prompt, RoundDots, useLastActivity, useNarrate, useRecord, useTx, type PickState } from './common';
import { SFX_SET, StickerArt, playSfx, useReduced, useStickers } from './actCommon';
import { ActArt } from './activityArt';
import { PatternRow, patPraise, patPrompt } from './Patterns';
import {
  DAILY_STEPS, MIX_COLOURS, SAFARI_BY_ID, STICKER, availableSafari, dailyChallenge, dayKey, doneToday, oppRight, patRight, safariRight, streak, tokenName,
  type DailyStep, type Sticker,
} from './activities';

const T = {
  title: L('Daily Surprise', 'రోజూ ఆశ్చర్యం'),
  intro: L('A little surprise is waiting! Finish today’s 4 games to open it.', 'ఒక చిన్న ఆశ్చర్యం ఎదురుచూస్తోంది! ఈరోజు 4 ఆటలు పూర్తి చేసి దాన్ని తెరువు.'),
  start: L('Open today’s games', 'ఈరోజు ఆటలు మొదలుపెట్టు'),
  doneToday: L('You did today’s surprise! Come back tomorrow for a new one.', 'ఈరోజు ఆశ్చర్యం పూర్తి చేశావు! రేపు కొత్తది కోసం మళ్ళీ రా.'),
  again: L('Play today’s games again', 'ఈరోజు ఆటలు మళ్ళీ ఆడు'),
  book: L('Sticker book', 'స్టిక్కర్ పుస్తకం'),
  unwrap: L('You opened the surprise!', 'ఆశ్చర్యాన్ని తెరిచావు!'),
  streak: L('Days in a row', 'వరుసగా రోజులు'),
  hear: L('Hear it again', 'మళ్ళీ విను'),
  listen: L('Listen! What makes this sound?', 'విను! ఈ శబ్దం దేనిది?'),
  mixAsk: L('Which two paints make', 'ఏ రెండు రంగులు కలిపితే వస్తుంది'),
};

export default function DailySurprise() {
  const { tx } = useTx();
  const { lang } = useApp();
  const nav = useNavigate();
  useLastActivity('/play/daily', T.title);
  const { st, give } = useStickers();
  const today = dayKey(new Date());
  const steps = useMemo(() => dailyChallenge(today, availableSafari([...SFX_SET])), [today]);
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [run, setRun] = useState(0);
  const [got, setGot] = useState<Sticker | null>(null);
  const done = doneToday(st, today);
  const todays = Object.entries(st.earned).filter(([id, at]) => STICKER[id]?.source === 'daily' && dayKey(new Date(at)) === today).map(([id]) => STICKER[id]);
  const days = streak(st.days, today);
  useNarrate(phase === 'intro' ? (done ? T.doneToday : T.intro) : null, `${phase}-${done}`);

  const finish = () => {
    const wasDone = done;
    const s = wasDone ? null : give('daily', { day: true });
    setGot(s);
    setPhase('done');
  };
  return (
    <Page title={tx(T.title)} back="/play" fullscreen>
      {phase === 'intro' && (
        <div className="el-play el-daily">
          <Prompt l={done ? T.doneToday : T.intro} />
          <div className="el-gift-wrap">
            {done && todays[0] ? <StickerArt s={todays[0]} label={tx(todays[0].name)} /> : <Gift />}
          </div>
          {days > 0 && <p className="el-streak"><Icon name="star" />{tx(T.streak)}: <strong>{days}</strong></p>}
          <div className="el-row">
            <button type="button" className="btn primary el-big" onClick={() => { setPhase('play'); setRun((x) => x + 1); }} autoFocus><Icon name="play" />{tx(done ? T.again : T.start)}</button>
            <button type="button" className="btn el-big" onClick={() => nav('/play/stickers')}><Icon name="book" />{tx(T.book)}</button>
          </div>
        </div>
      )}
      {phase === 'play' && <Challenge key={`${run}-${lang}`} steps={steps} onDone={finish} />}
      {phase === 'done' && <Unwrapped s={got} days={streak([...st.days, today], today)} onBack={() => setPhase('intro')} />}
    </Page>
  );
}

function Gift() {
  const reduced = useReduced();
  return (
    <svg viewBox="-50 -50 100 100" className={`el-art el-gift ${reduced ? '' : 'wiggle'}`} aria-hidden="true">
      <rect x={-36} y={-10} width={72} height={52} rx={6} fill="#D9534F" stroke="#3A3530" strokeWidth={2.4} />
      <rect x={-42} y={-24} width={84} height={16} rx={4} fill="#E8665F" stroke="#3A3530" strokeWidth={2.4} />
      <rect x={-7} y={-24} width={14} height={66} fill="#F2C94C" stroke="#3A3530" strokeWidth={2} />
      <path d="M0 -24 C-10 -44 -34 -40 -26 -28 C-22 -22 -10 -24 0 -24 C10 -24 22 -22 26 -28 C34 -40 10 -44 0 -24Z" fill="#F2C94C" stroke="#3A3530" strokeWidth={2} />
      <text x={0} y={24} textAnchor="middle" fontSize={22} fontWeight={800} fill="#FFFFFF">?</text>
    </svg>
  );
}

function Unwrapped({ s, days, onBack }: { s: Sticker | null; days: number; onBack: () => void }) {
  const { tx, say } = useTx();
  const nav = useNavigate();
  const reduced = useReduced();
  useEffect(() => {
    celebrate(); sfx('success');
    say(s ? L(`${T.unwrap.en} You got a sticker: ${s.name.en}!`, `${T.unwrap.te} నీకు స్టిక్కర్ వచ్చింది: ${s.name.te}!`) : L('All done! Great job!', 'అయిపోయింది! చాలా బాగా చేశావు!'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="el-done" role="status">
      <h2>{tx(s ? T.unwrap : L('All done! Great job!', 'అయిపోయింది! చాలా బాగా చేశావు!'))}</h2>
      {s && <div className={`el-gift-wrap ${reduced ? '' : 'el-pop'}`}><StickerArt s={s} label={tx(s.name)} /></div>}
      {s && <p><strong>{tx(s.name)}</strong></p>}
      {days > 0 && <p className="el-streak"><Icon name="star" />{tx(T.streak)}: <strong>{days}</strong></p>}
      <div className="el-row">
        <button type="button" className="btn primary el-big" onClick={() => nav('/play/stickers')} autoFocus><Icon name="book" />{tx(T.book)}</button>
        <button type="button" className="btn el-big" onClick={onBack}><Icon name="back" />{tx(L('Back', 'వెనక్కి'))}</button>
      </div>
    </div>
  );
}

function stepPrompt(s: DailyStep): L {
  if (s.kind === 'pattern') return patPrompt(s.round);
  if (s.kind === 'opposite') return s.round.kind === 'pick'
    ? L(`Tap the ${s.round.ask.word.en} one.`, `${s.round.ask.word.te} ఏది? తాకు.`)
    : L(`This is ${s.round.shown.word.en}. Which picture is the opposite?`, `ఇది ${s.round.shown.word.te}. దీనికి వ్యతిరేకం ఏది?`);
  if (s.kind === 'mix') { const c = MIX_COLOURS[s.quiz.target]; return L(`${T.mixAsk.en} ${c.en.toLowerCase()}?`, `${T.mixAsk.te} ${c.te}?`); }
  return T.listen;
}

function Challenge({ steps, onDone }: { steps: DailyStep[]; onDone: () => void }) {
  const { tx, say } = useTx();
  const record = useRecord('daily');
  const [idx, setIdx] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const handle = useRef<SfxHandle | null>(null);
  const step = steps[idx];
  const prompt = stepPrompt(step);
  useNarrate(prompt, idx);
  const playSafari = (id: string) => { handle.current?.stop(); const src = SAFARI_BY_ID[id]; handle.current = src ? playSfx(src.sfx) : null; };
  useEffect(() => {
    if (step.kind !== 'safari') return;
    const t = window.setTimeout(() => playSafari(step.round.target), 2200);
    return () => window.clearTimeout(t);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => handle.current?.stop(), []);

  const answer = (key: string, ok: boolean, praise: L) => {
    if (solved) return;
    record(`${step.kind}`, ok, wrong.length >= 2 ? 1 : 0);
    if (ok) { setSolved(true); sfx('sparkle'); say(praise); }
    else { sfx('pop'); setWrong((w) => [...w, key]); say(L(`Try again! ${prompt.en}`, `మళ్ళీ ప్రయత్నించు! ${prompt.te}`)); }
  };
  const next = () => {
    handle.current?.stop();
    if (idx + 1 >= steps.length) { onDone(); return; }
    setIdx(idx + 1); setWrong([]); setSolved(false);
  };
  const st = (key: string, right: string): PickState => (solved && key === right ? 'right' : wrong.includes(key) ? 'wrong' : !solved && wrong.length >= 2 && key === right ? 'hint' : undefined);

  let body: ReactNode = null;
  let praise: L = L('Well done!', 'భలే!');
  if (step.kind === 'pattern') {
    const r = step.round;
    praise = patPraise(r);
    body = (
      <>
        <PatternRow round={r} solved={solved} />
        <div className={`el-choices n${r.choices.length}`}>
          {r.choices.map((t) => <PicButton key={t} art={t} label={tx(tokenName(t))} showLabel onPick={() => answer(t, patRight(r, t), patPraise(r))} state={st(t, r.answer)} disabled={solved || wrong.includes(t)} />)}
        </div>
      </>
    );
  } else if (step.kind === 'opposite') {
    const r = step.round;
    praise = L(`Yes, ${r.ask.word.en}!`, `అవును, ${r.ask.word.te}!`);
    body = (
      <>
        {r.kind === 'opposite' && <div className="el-hero el-opp-hero"><ActArt id={r.shown.art} v={r.shown.v} scale={r.shown.scale} label={tx(r.shown.word)} /><span className="el-opp-word">{tx(r.shown.word)}</span></div>}
        <div className={`el-choices n${r.choices.length}`}>
          {r.choices.map((s) => {
            const state = st(s.key, r.ask.key);
            return (
              <button key={s.key} type="button" className={`el-pick el-opp ${state ? `is-${state}` : ''}`} aria-label={tx(s.word)} disabled={solved || state === 'wrong'}
                onClick={() => answer(s.key, oppRight(r, s.key), L(`Yes, ${r.ask.word.en}!`, `అవును, ${r.ask.word.te}!`))}>
                <span className="el-pick-art el-opp-pic"><ActArt id={s.art} v={s.v} scale={s.scale} /></span>
                {(solved || state === 'wrong') && <span className="el-pick-label" aria-hidden="true">{tx(s.word)}</span>}
                {state === 'right' && <span className="el-badge good" aria-hidden="true"><Icon name="check" /></span>}
                {state === 'hint' && <span className="el-badge hint" aria-hidden="true"><Icon name="hand" /></span>}
              </button>
            );
          })}
        </div>
      </>
    );
  } else if (step.kind === 'mix') {
    const q = step.quiz;
    const c = MIX_COLOURS[q.target];
    const say2 = (ps: string[]) => ps.map((p) => MIX_COLOURS[p as keyof typeof MIX_COLOURS]);
    praise = L(`Yes! ${say2(q.options[q.answer]).map((x) => x.en).join(' and ')} make ${c.en.toLowerCase()}.`, `అవును! ${say2(q.options[q.answer]).map((x) => x.te).join(', ')} కలిపితే ${c.te}.`);
    body = (
      <>
        <div className="el-hero small el-mix-target" role="img" aria-label={tx(c)}><span className="el-blob" style={{ background: c.hex }} /><span>{tx(c)}</span></div>
        <div className="el-words">
          {q.options.map((opt, i) => {
            const key = String(i);
            const state = st(key, String(q.answer));
            const names = say2(opt);
            return (
              <button key={key} type="button" className={`el-pick el-mix-opt ${state ? `is-${state}` : ''}`} disabled={solved || state === 'wrong'} onClick={() => answer(key, i === q.answer, praise)}
                aria-label={names.map((n) => tx(n)).join(' + ')}>
                {names.map((n, k) => <span key={k} className="el-mix-paint">{k > 0 && <b aria-hidden="true">+</b>}<span className="el-swatch" style={{ background: n.hex }} aria-hidden="true" /><span aria-hidden="true">{tx(n)}</span></span>)}
                {state === 'right' && <span className="el-badge good" aria-hidden="true"><Icon name="check" /></span>}
                {state === 'hint' && <span className="el-badge hint" aria-hidden="true"><Icon name="hand" /></span>}
              </button>
            );
          })}
        </div>
      </>
    );
  } else {
    const r = step.round;
    const t = SAFARI_BY_ID[r.target];
    praise = L(`Yes! The ${t.name.en.toLowerCase()}.`, `అవును! ${t.name.te}.`);
    body = (
      <>
        <div className="el-row center"><button type="button" className="btn primary el-big" onClick={() => playSafari(r.target)}><Icon name="speaker" />{tx(T.hear)}</button></div>
        <div className={`el-choices n${r.choices.length}`}>
          {r.choices.map((id) => {
            const s = SAFARI_BY_ID[id];
            const state = st(id, r.target);
            return (
              <button key={id} type="button" className={`el-pick ${state ? `is-${state}` : ''}`} disabled={solved || state === 'wrong'} aria-label={tx(s.name)}
                onClick={() => { if (!safariRight(r, id)) window.setTimeout(() => playSafari(id), 700); answer(id, safariRight(r, id), praise); }}>
                <span className="el-pick-art"><ActArt id={s.art} /></span>
                <span className="el-pick-label" aria-hidden="true">{tx(s.name)}</span>
                {state === 'right' && <span className="el-badge good" aria-hidden="true"><Icon name="check" /></span>}
                {state === 'hint' && <span className="el-badge hint" aria-hidden="true"><Icon name="hand" /></span>}
              </button>
            );
          })}
        </div>
      </>
    );
  }
  return (
    <div className="el-play el-daily">
      <RoundDots done={idx} total={Math.max(steps.length, DAILY_STEPS)} />
      <Prompt l={prompt} />
      {body}
      {(solved || wrong.length > 0) && <EarlyFeedback ok={solved} tries={wrong.length} extra={solved ? tx(praise) : undefined} />}
      {solved && (
        <div className="el-row center">
          <button type="button" className="btn primary el-big" onClick={next} autoFocus>
            {idx + 1 >= steps.length ? <><Icon name="sparkle" />{tx(L('Open the surprise!', 'ఆశ్చర్యం తెరువు!'))}</> : <>{tx(L('Next', 'తర్వాత'))}<Icon name="next" /></>}
          </button>
        </div>
      )}
    </div>
  );
}
