// Sound Safari: listen to a sound and pick what made it — animals, vehicles, or nature
// (rain, thunder, wind, stream, sea, fire, birds, crickets, splash). Sounds missing from the
// library are skipped; when sound is muted a written clue is shown instead.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../lib/app';
import { getAudioPrefs, onSpeaking } from '../../lib/audio';
import { sfx, type SfxHandle } from '../../lib/sfx';
import { celebrate, Page } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { L } from './data/pictures';
import { BackRow, BigTile, DonePanel, EarlyFeedback, Prompt, RoundDots, UI, useActivity, useBadge, useLastActivity, useNarrate, useRecord, useTx, type PickState } from './common';
import { SFX_SET, StickerReveal, playSfx, useStickers } from './actCommon';
import { ActArt } from './activityArt';
import { SAFARI_BY_ID, SAFARI_GROUPS, availableSafari, safariRight, safariRound, type SafariGroup, type SafariRound, type SafariSource, type Sticker } from './activities';
import { ADAPT0, adapt, newSeed, rng, type Adapt } from './logicCore';

const T = {
  title: L('Sound Safari', 'శబ్దాల సఫారీ'),
  pick: L('Let’s go on a sound safari! What shall we listen to?', 'శబ్దాల సఫారీకి వెళ్దాం! ఏమి విందాం?'),
  ask: L('Listen! What makes this sound?', 'విను! ఈ శబ్దం దేనిది?'),
  hear: L('Hear it again', 'మళ్ళీ విను'),
  muted: L('Sound is off. Here is a clue:', 'శబ్దం ఆపివేయబడింది. ఇదిగో ఒక సూచన:'),
};
const ROUNDS = 6;
interface SafariSave { adapt: Adapt; heard: string[]; sets: number }
const INIT: SafariSave = { adapt: ADAPT0, heard: [], sets: 0 };

export default function SoundSafari() {
  const { tx } = useTx();
  const { lang } = useApp();
  useLastActivity('/play/safari', T.title);
  const [st, save] = useActivity<SafariSave>('safari', INIT);
  const [group, setGroup] = useState<SafariGroup | 'mix' | null>(null);
  const [run, setRun] = useState(0);
  const available = useMemo(() => availableSafari([...SFX_SET]), []);
  const groups = SAFARI_GROUPS.filter((g) => available.filter((s) => g.id === 'mix' || s.group === g.id).length >= 3);
  return (
    <Page title={tx(T.title)} back="/play" fullscreen>
      {group && <BackRow onBack={() => setGroup(null)} />}
      {!group && (
        <>
          <Prompt l={T.pick} />
          <div className="el-grid el-grid-4">
            {groups.map((g) => <BigTile key={g.id} art={g.cover} title={g.title} onGo={() => { setGroup(g.id); setRun((x) => x + 1); }} />)}
          </div>
          <p className="el-credit">{tx(L('Sounds heard', 'విన్న శబ్దాలు'))}: {st.heard.filter((id) => SAFARI_BY_ID[id]).length} / {available.length}</p>
        </>
      )}
      {group && <Session key={`${group}-${run}-${lang}`} group={group} available={available} st={st} save={save} onAgain={() => setRun((x) => x + 1)} />}
    </Page>
  );
}

/** Play `name` once the prompt has been read (or soon if nothing is spoken). */
function useSoundAfterPrompt(name: string | null, dep: unknown, play: (n: string) => void) {
  useEffect(() => {
    if (!name) return;
    let started = false, fired = false;
    const fire = () => { if (!fired) { fired = true; play(name); } };
    const off = onSpeaking((on) => { if (on) started = true; else if (started) window.setTimeout(fire, 250); });
    const t = window.setTimeout(() => { if (!started) fire(); }, 1600);
    return () => { off(); window.clearTimeout(t); };
  }, [dep]); // eslint-disable-line react-hooks/exhaustive-deps
}

function Session({ group, available, st, save, onAgain }: {
  group: SafariGroup | 'mix'; available: SafariSource[]; st: SafariSave; save: (p: Partial<SafariSave> | ((s: SafariSave) => Partial<SafariSave>)) => void; onAgain: () => void;
}) {
  const { tx, say } = useTx();
  const record = useRecord('safari');
  const badge = useBadge();
  const { give } = useStickers();
  const [seed] = useState(newSeed);
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState<SafariRound | null>(() => safariRound(rng(seed), group, st.adapt.choices, available));
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const handle = useRef<SfxHandle | null>(null);
  const muted = getAudioPrefs().mute;
  const play = (id: string) => {
    const src = SAFARI_BY_ID[id];
    if (!src) return;
    handle.current?.stop();
    const h = playSfx(src.sfx);
    handle.current = h;
    if (h) { setPlayingId(id); void h.done.then(() => setPlayingId((p) => (p === id ? null : p))); }
  };
  useEffect(() => () => handle.current?.stop(), []);
  useNarrate(finished || !round ? null : T.ask, idx);
  useSoundAfterPrompt(finished || !round ? null : round.target, `${idx}-${round?.target}`, play);
  if (!round) return <p className="el-hint">{tx(L('These sounds are not ready yet.', 'ఈ శబ్దాలు ఇంకా సిద్ధంగా లేవు.'))}</p>;
  const target = SAFARI_BY_ID[round.target];

  const pick = (id: string) => {
    if (solved) return;
    const ok = safariRight(round, id);
    const src = SAFARI_BY_ID[id];
    record(`${group}:${round.target}`, ok, wrong.length >= 2 ? 1 : 0);
    save((s) => ({ adapt: adapt(s.adapt, ok, ok && wrong.length === 0) }));
    if (ok) {
      setSolved(true); sfx('sparkle');
      save((s) => ({ heard: s.heard.includes(id) ? s.heard : [...s.heard, id] }));
      say(L(`Yes! That was the sound of the ${src.name.en.toLowerCase()}.`, `అవును! అది ${src.name.te} శబ్దం.`));
    } else {
      setWrong((w) => [...w, id]);
      // let them hear the difference
      window.setTimeout(() => play(id), 900);
      say(L(`No, that is the ${src.name.en.toLowerCase()}. Listen to its sound.`, `కాదు, అది ${src.name.te}. దాని శబ్దం విను.`));
    }
  };
  const next = () => {
    handle.current?.stop();
    if (idx + 1 >= ROUNDS) {
      setFinished(true); celebrate(); sfx('success'); say(UI.allDone);
      save((s) => ({ sets: s.sets + 1 }));
      setSticker(give('safari'));
      if (group === 'nature') void badge('play:safari-nature', L('Nature listener', 'ప్రకృతి శ్రోత'));
      return;
    }
    setRound(safariRound(rng(seed + (idx + 1) * 7919), group, st.adapt.choices, available, round.target));
    setIdx(idx + 1); setWrong([]); setSolved(false);
  };
  const stateOf = (id: string): PickState => (solved && id === round.target ? 'right' : wrong.includes(id) ? 'wrong' : !solved && wrong.length >= 2 && id === round.target ? 'hint' : undefined);

  if (finished) return <DonePanel onAgain={onAgain} backTo="/play/safari"><StickerReveal s={sticker} /></DonePanel>;
  return (
    <div className="el-play">
      <RoundDots done={idx} total={ROUNDS} />
      <Prompt l={T.ask} />
      <div className="el-row center">
        <button type="button" className={`btn primary el-big el-listen ${playingId === round.target ? 'is-playing' : ''}`} onClick={() => play(round.target)}>
          <Icon name="speaker" />{tx(T.hear)}
        </button>
      </div>
      {muted && target.clue && <p className="el-hint" role="note"><Icon name="mute" />{tx(T.muted)} “{tx(target.clue)}”</p>}
      <div className={`el-choices n${round.choices.length}`}>
        {round.choices.map((id) => {
          const s = SAFARI_BY_ID[id];
          const state = stateOf(id);
          return (
            <button key={id} type="button" className={`el-pick ${state ? `is-${state}` : ''} ${playingId === id && id !== round.target ? 'is-playing' : ''}`} onClick={() => pick(id)}
              disabled={solved || state === 'wrong'} aria-label={tx(s.name)}>
              <span className="el-pick-art"><ActArt id={s.art} /></span>
              <span className="el-pick-label" aria-hidden="true">{tx(s.name)}</span>
              {state === 'right' && <span className="el-badge good" aria-hidden="true"><Icon name="check" /></span>}
              {state === 'hint' && <span className="el-badge hint" aria-hidden="true"><Icon name="hand" /></span>}
            </button>
          );
        })}
      </div>
      {(solved || wrong.length > 0) && <EarlyFeedback ok={solved} tries={wrong.length} extra={solved ? tx(target.name) : undefined} />}
      {solved && (
        <div className="el-row center">
          <button type="button" className="btn el-big" onClick={() => play(round.target)}><Icon name="speaker" />{tx(target.name)}</button>
          <button type="button" className="btn primary el-big" onClick={next} autoFocus>{tx(UI.next)}<Icon name="next" /></button>
        </div>
      )}
    </div>
  );
}
