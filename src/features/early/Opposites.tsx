// Opposites & Sizes: big/small, tall/short, full/empty, hot/cold, day/night and more — tap the right picture.
// Level 3 shows one picture and asks for its opposite.
import { useState } from 'react';
import { useApp } from '../../lib/app';
import { sfx } from '../../lib/sfx';
import { celebrate, Page } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { L } from './data/pictures';
import { BackRow, DonePanel, EarlyFeedback, Prompt, RoundDots, UI, useActivity, useBadge, useLastActivity, useNarrate, useRecord, useTx, type PickState } from './common';
import { LevelPicker, StickerReveal, useStickers } from './actCommon';
import { ActArt } from './activityArt';
import { OPPOSITES, OPP_LEVELS, oppRight, oppRound, type OppRound, type OppSide, type Sticker } from './activities';
import { newSeed, rng } from './logicCore';

const T = {
  title: L('Opposites', 'వ్యతిరేక పదాలు'),
  pick: L('Big or small? Hot or cold? Let’s find out!', 'పెద్దదా చిన్నదా? వేడిదా చల్లనిదా? చూద్దాం!'),
  level: L('Which game?', 'ఏ ఆట?'),
  start: L('Start', 'మొదలు'),
  learn: L('All the opposites', 'అన్ని వ్యతిరేక పదాలు'),
};
const ROUNDS = 6;
interface OppSave { level: number; sets: number; seen: string[] }
const INIT: OppSave = { level: 0, sets: 0, seen: [] };

function promptFor(r: OppRound): L {
  if (r.kind === 'pick') return L(`Tap the ${r.ask.word.en} one.`, `${r.ask.word.te} ఏది? తాకు.`);
  return L(`This is ${r.shown.word.en}. Which picture is the opposite?`, `ఇది ${r.shown.word.te}. దీనికి వ్యతిరేకం ఏది?`);
}
function praiseFor(r: OppRound): L {
  const p = OPPOSITES.find((x) => x.id === r.pair)!;
  return L(`Yes! ${cap(p.a.word.en)} and ${p.b.word.en} are opposites.`, `అవును! ${p.a.word.te}, ${p.b.word.te} — వ్యతిరేక పదాలు.`);
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Opposites() {
  const { tx } = useTx();
  const { lang } = useApp();
  useLastActivity('/play/opposites', T.title);
  const [st, save] = useActivity<OppSave>('opposites', INIT);
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(false);
  const level = Math.max(0, Math.min(2, st.level || 0));
  return (
    <Page title={tx(T.title)} back="/play" fullscreen>
      {playing && <BackRow onBack={() => setPlaying(false)} />}
      {!playing && (
        <>
          <Prompt l={T.pick} />
          <LevelPicker label={T.level} options={OPP_LEVELS.map((n, i) => ({ id: i, name: n }))} value={level} onChange={(v) => save({ level: v })} />
          <div className="el-row"><button type="button" className="btn primary el-big" onClick={() => { setPlaying(true); setRun((x) => x + 1); }} autoFocus><Icon name="play" />{tx(T.start)}</button></div>
          <OppGallery />
        </>
      )}
      {playing && <Session key={`${run}-${level}-${lang}`} level={level} onAgain={() => setRun((x) => x + 1)}
        onDone={(perfect, seen) => save((s) => ({ sets: s.sets + 1, seen: [...new Set([...s.seen, ...seen])], level: perfect && s.level < 2 ? s.level + 1 : s.level }))} />}
    </Page>
  );
}

/** A browsable list of every pair: tap a picture to hear its word. */
function OppGallery() {
  const { tx, say } = useTx();
  return (
    <section className="el-opp-gallery" aria-label={tx(T.learn)}>
      <h2>{tx(T.learn)}</h2>
      <ul>
        {OPPOSITES.map((p) => (
          <li key={p.id}>
            {[p.a, p.b].map((s) => (
              <button key={s.key} type="button" className="el-opp-mini" onClick={() => { sfx('pop'); say(L(cap(s.word.en), s.word.te)); }}>
                <span className="el-opp-pic"><ActArt id={s.art} v={s.v} scale={s.scale} /></span>
                <span>{tx(s.word)}</span>
              </button>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}

function OppPick({ s, onPick, state, disabled, showLabel }: { s: OppSide; onPick: () => void; state?: PickState; disabled?: boolean; showLabel?: boolean }) {
  const { tx } = useTx();
  return (
    <button type="button" className={`el-pick el-opp ${state ? `is-${state}` : ''}`} onClick={onPick} disabled={disabled} aria-label={tx(s.word)}>
      <span className="el-pick-art el-opp-pic"><ActArt id={s.art} v={s.v} scale={s.scale} /></span>
      {showLabel && <span className="el-pick-label" aria-hidden="true">{tx(s.word)}</span>}
      {state === 'right' && <span className="el-badge good" aria-hidden="true"><Icon name="check" /></span>}
      {state === 'hint' && <span className="el-badge hint" aria-hidden="true"><Icon name="hand" /></span>}
    </button>
  );
}

function Session({ level, onAgain, onDone }: { level: number; onAgain: () => void; onDone: (perfect: boolean, seen: string[]) => void }) {
  const { tx, say } = useTx();
  const record = useRecord('opposites');
  const badge = useBadge();
  const { give } = useStickers();
  const [seed] = useState(newSeed);
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState<OppRound>(() => oppRound(rng(seed), level));
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [firstTries, setFirstTries] = useState(0);
  const [seen, setSeen] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const prompt = promptFor(round);
  useNarrate(finished ? null : prompt, idx);

  const pick = (s: OppSide) => {
    if (solved) return;
    const ok = oppRight(round, s.key);
    record(`${round.kind}:${round.ask.key}`, ok, wrong.length >= 2 ? 1 : 0);
    if (ok) {
      setSolved(true); sfx('sparkle');
      if (!wrong.length) setFirstTries((n) => n + 1);
      setSeen((x) => [...x, round.pair]);
      say(praiseFor(round));
    } else {
      sfx('pop');
      setWrong((w) => [...w, s.key]);
      say(L(`That one is ${s.word.en}. ${prompt.en}`, `అది ${s.word.te}. ${prompt.te}`));
    }
  };
  const next = () => {
    if (idx + 1 >= ROUNDS) {
      const perfect = firstTries >= ROUNDS;
      setFinished(true); celebrate(); sfx('success'); say(UI.allDone);
      onDone(perfect, seen);
      setSticker(give('opposites'));
      if (level === 2 && perfect) void badge('play:opposites-pro', L('Opposites expert', 'వ్యతిరేక పదాల నిపుణుడు'));
      return;
    }
    setRound(oppRound(rng(seed + (idx + 1) * 7919), level, round.pair));
    setIdx(idx + 1); setWrong([]); setSolved(false);
  };
  const stateOf = (s: OppSide): PickState => (solved && s.key === round.ask.key ? 'right' : wrong.includes(s.key) ? 'wrong' : !solved && wrong.length >= 2 && s.key === round.ask.key ? 'hint' : undefined);

  if (finished) return <DonePanel onAgain={onAgain} backTo="/play/opposites"><StickerReveal s={sticker} /></DonePanel>;
  return (
    <div className="el-play">
      <RoundDots done={idx} total={ROUNDS} />
      <Prompt l={prompt} />
      {round.kind === 'opposite' && (
        <div className="el-hero el-opp-hero"><ActArt id={round.shown.art} v={round.shown.v} scale={round.shown.scale} label={tx(round.shown.word)} /><span className="el-opp-word">{tx(round.shown.word)}</span></div>
      )}
      <div className={`el-choices n${round.choices.length}`}>
        {round.choices.map((s) => <OppPick key={s.key} s={s} onPick={() => pick(s)} state={stateOf(s)} disabled={solved || stateOf(s) === 'wrong'} showLabel={solved || wrong.includes(s.key)} />)}
      </div>
      {(solved || wrong.length > 0) && <EarlyFeedback ok={solved} tries={wrong.length} extra={solved ? tx(praiseFor(round)) : undefined} />}
      {solved && <div className="el-row center"><button type="button" className="btn primary el-big" onClick={next} autoFocus>{tx(UI.next)}<Icon name="next" /></button></div>}
    </div>
  );
}
