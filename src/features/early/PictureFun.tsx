// Picture Fun: find the picture, what is this?, odd one out, and who says ___?
import { useState } from 'react';
import { useApp } from '../../lib/app';
import { celebrate, Page } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { Art } from './art';
import { PIC, PIC_SETS, CAT_NAMES, L, type PicSet } from './data/pictures';
import { ADAPT0, adapt, newSeed, picRound, rng, type Adapt, type PicMode, type PicRound } from './logic';
import { BackRow, BigTile, DonePanel, EarlyFeedback, PicButton, Prompt, RoundDots, SayButton, UI, useActivity, useBadge, useLastActivity, useNarrate, useRecord, useTx, type PickState } from './common';

const ROUNDS = 6;
interface PicState { adapt: Adapt; recognised: number; played: string[]; lastSet?: string }

const MODES: { id: PicMode; title: L; art: string; tint: string }[] = [
  { id: 'find', title: L('Find it', 'కనిపెట్టు'), art: 'apple', tint: 'var(--c-math)' },
  { id: 'what', title: L('What is this?', 'ఇది ఏమిటి?'), art: 'parrot', tint: 'var(--c-next)' },
  { id: 'odd', title: L('Which is different?', 'ఏది వేరు?'), art: 'banana', tint: 'var(--c-lab)' },
  { id: 'sound', title: L('Who says it?', 'ఎవరు అంటారు?'), art: 'cow', tint: 'var(--c-art)' },
];

function promptFor(r: PicRound): L {
  const t = PIC[r.target];
  if (r.mode === 'find') return L(`Find the ${t.en.toLowerCase()}.`, `${t.te} ఎక్కడ?`);
  if (r.mode === 'what') return L('What is this?', 'ఇది ఏమిటి?');
  if (r.mode === 'odd') return L('Which one is different?', 'వీటిలో ఏది వేరు?');
  return L(`Who says “${t.sound!.en}”?`, `“${t.sound!.te}” అని ఎవరు అంటారు?`);
}
function praiseFor(r: PicRound): L {
  const t = PIC[r.target];
  if (r.mode === 'odd' && r.base) return L(`The ${t.en.toLowerCase()} is different. The others are ${CAT_NAMES[r.base].en}.`, `${t.te} వేరు. మిగతావి ${CAT_NAMES[r.base].te}.`);
  if (r.mode === 'sound') return L(`The ${t.en.toLowerCase()} says ${t.sound!.en}`, `${t.te}: ${t.sound!.te}`);
  return L(`${t.en}!`, `${t.te}!`);
}

export default function PictureFun() {
  const { tx, say } = useTx();
  const { lang } = useApp();
  useLastActivity('/play/pictures', UI.pictures);
  const [st, save] = useActivity<PicState>('pictures', { adapt: ADAPT0, recognised: 0, played: [] });
  const [mode, setMode] = useState<PicMode | null>(null);
  const [set, setSet] = useState<PicSet | null>(null);
  const [session, setSession] = useState(0);

  const needsSet = mode === 'find' || mode === 'what';
  const playing = mode && (!needsSet || set);
  const back = () => { if (playing && needsSet) setSet(null); else if (mode) setMode(null); };

  return (
    <Page title={tx(UI.pictures)} back="/play" fullscreen>
      {mode && <BackRow onBack={back} />}
      {!mode && (
        <>
          <Prompt l={L('Pick a game!', 'ఒక ఆట ఎంచుకో!')} />
          <div className="el-grid el-grid-4">
            {MODES.map((m) => <BigTile key={m.id} art={m.art} title={m.title} tint={m.tint} onGo={() => setMode(m.id)} />)}
          </div>
        </>
      )}
      {mode && needsSet && !set && (
        <>
          <Prompt l={L('Pick some pictures!', 'బొమ్మలు ఎంచుకో!')} />
          <div className="el-grid">
            {PIC_SETS.map((s) => (
              <BigTile key={s.id} art={s.cover} title={s.title} onGo={() => { setSet(s); setSession((x) => x + 1); save({ lastSet: s.id }); }}
                sub={st.played.includes(`${mode}:${s.id}`) ? '✓' : undefined} />
            ))}
          </div>
        </>
      )}
      {playing && (
        <Session key={`${mode}-${set?.id}-${session}-${lang}`} mode={mode} set={set} st={st} save={save}
          onAgain={() => setSession((x) => x + 1)} onDoneSay={() => say(UI.allDone)} />
      )}
    </Page>
  );
}

function Session({ mode, set, st, save, onAgain, onDoneSay }: { mode: PicMode; set: PicSet | null; st: PicState; save: (p: Partial<PicState> | ((s: PicState) => Partial<PicState>)) => void; onAgain: () => void; onDoneSay: () => void }) {
  const { tx, say } = useTx();
  const record = useRecord('pictures');
  const badge = useBadge();
  const [seed] = useState(newSeed);
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState<PicRound>(() => picRound(rng(seed), mode, set, st.adapt.choices));
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const prompt = promptFor(round);
  useNarrate(finished ? null : prompt, `${idx}`);

  const pick = (id: string) => {
    if (solved) return;
    const ok = id === round.target;
    record(`${mode}:${round.target}`, ok, wrong.length >= 2 ? 1 : 0);
    save((s) => ({ adapt: adapt(s.adapt, ok, ok && wrong.length === 0, mode === 'what' ? 3 : 4) }));
    if (ok) {
      setSolved(true);
      say(praiseFor(round));
      save((s) => ({ recognised: s.recognised + 1 }));
      if (st.recognised + 1 >= 50) void badge('play:50-pictures');
    } else {
      setWrong((w) => [...w, id]);
      say(wrong.length >= 1 ? L(`${UI.tryAgain.en} ${prompt.en}`, `${UI.tryAgain.te} ${prompt.te}`) : UI.tryAgain);
    }
  };
  const next = () => {
    if (idx + 1 >= ROUNDS) {
      setFinished(true); celebrate(); onDoneSay();
      save((s) => ({ played: [...new Set([...s.played, `${mode}:${set?.id ?? 'mix'}`])] }));
      return;
    }
    const r = rng(seed + (idx + 1) * 7919);
    setRound(picRound(r, mode, set, st.adapt.choices, round.target));
    setIdx(idx + 1); setWrong([]); setSolved(false);
  };
  const stateOf = (id: string): PickState => (solved && id === round.target ? 'right' : wrong.includes(id) ? 'wrong' : !solved && wrong.length >= 2 && id === round.target ? 'hint' : undefined);

  if (finished) return <DonePanel onAgain={onAgain} backTo="/play/pictures" />;
  const target = PIC[round.target];
  return (
    <div className="el-play">
      <RoundDots done={idx} total={ROUNDS} />
      <Prompt l={prompt} />
      {mode === 'what' ? (
        <>
          <div className="el-hero"><Art id={round.target} label={tx(L('A picture', 'ఒక బొమ్మ'))} /></div>
          <div className="el-words">
            {round.choices.map((id) => {
              const it = PIC[id];
              const s = stateOf(id);
              return (
                <div key={id} className={`el-word ${s ? `is-${s}` : ''}`}>
                  <SayButton l={it} />
                  <button type="button" className="btn el-word-btn" onClick={() => pick(id)} disabled={s === 'wrong' || solved}>
                    {s === 'right' && <Icon name="check" />}{s === 'hint' && <Icon name="hand" />}{tx(it)}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className={`el-choices n${round.choices.length}`}>
          {round.choices.map((id) => (
            <PicButton key={id} art={id} label={tx(PIC[id])} onPick={() => pick(id)} state={stateOf(id)} disabled={stateOf(id) === 'wrong' || solved} showLabel={solved || mode === 'odd'} />
          ))}
        </div>
      )}
      {(solved || wrong.length > 0) && <EarlyFeedback ok={solved} tries={wrong.length} extra={solved ? tx(praiseFor(round)) : undefined} />}
      {solved && (
        <div className="el-row center">
          {target.sound && <SayButton l={target.sound} label={tx(target.sound)} />}
          <button type="button" className="btn primary el-big" onClick={next} autoFocus>{tx(UI.next)}<Icon name="next" /></button>
        </div>
      )}
    </div>
  );
}
