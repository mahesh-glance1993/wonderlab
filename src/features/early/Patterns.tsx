// Patterns: what comes next? Colour, shape and picture sequences in 3 levels
// (AB → AAB/ABB/ABC → AABB with a gap that can be in the middle).
import { useState } from 'react';
import { useApp } from '../../lib/app';
import { sfx } from '../../lib/sfx';
import { celebrate, Page } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { Art } from './art';
import { L } from './data/pictures';
import { BackRow, BigTile, DonePanel, EarlyFeedback, PicButton, Prompt, RoundDots, UI, useActivity, useBadge, useLastActivity, useNarrate, useRecord, useTx, type PickState } from './common';
import { LevelPicker, StickerReveal, useStickers } from './actCommon';
import { PAT_LEVELS, patRight, patRound, tokenName, type PatKind, type PatRound, type Sticker } from './activities';
import { newSeed, rng } from './logicCore';

const T = {
  title: L('Patterns', 'నమూనాలు'),
  pick: L('What comes next? Pick a pattern game!', 'తర్వాత ఏది వస్తుంది? ఒక ఆట ఎంచుకో!'),
  level: L('How hard?', 'ఎంత కష్టం?'),
  next: L('What comes next?', 'తర్వాత ఏది వస్తుంది?'),
  missing: L('Which one is missing?', 'ఏది తప్పిపోయింది?'),
  gap: L('missing', 'ఖాళీ'),
};
const KINDS: { id: PatKind; title: L; art: string; tint: string }[] = [
  { id: 'colour', title: L('Colours', 'రంగులు'), art: 'c-blue', tint: 'var(--c-art)' },
  { id: 'shape', title: L('Shapes', 'ఆకారాలు'), art: 'shape-star', tint: 'var(--c-lab)' },
  { id: 'picture', title: L('Pictures', 'బొమ్మలు'), art: 'apple', tint: 'var(--c-next)' },
];
const ROUNDS = 6;
interface PatSave { level: number; sets: number; kinds: PatKind[] }
const INIT: PatSave = { level: 0, sets: 0, kinds: [] };

export default function Patterns() {
  const { tx } = useTx();
  const { lang } = useApp();
  useLastActivity('/play/patterns', T.title);
  const [st, save] = useActivity<PatSave>('patterns', INIT);
  const [kind, setKind] = useState<PatKind | null>(null);
  const [run, setRun] = useState(0);
  const level = Math.max(0, Math.min(2, st.level || 0));
  return (
    <Page title={tx(T.title)} back="/play" fullscreen>
      {kind && <BackRow onBack={() => setKind(null)} />}
      {!kind && (
        <>
          <Prompt l={T.pick} />
          <LevelPicker label={T.level} options={PAT_LEVELS.map((n, i) => ({ id: i, name: n }))} value={level} onChange={(v) => save({ level: v })} />
          <div className="el-grid el-grid-4">
            {KINDS.map((k) => <BigTile key={k.id} art={k.art} title={k.title} tint={k.tint} sub={st.kinds.includes(k.id) ? '✓' : undefined} onGo={() => { setKind(k.id); setRun((x) => x + 1); }} />)}
          </div>
        </>
      )}
      {kind && <Session key={`${kind}-${level}-${run}-${lang}`} kind={kind} level={level} onAgain={() => setRun((x) => x + 1)}
        onDone={(perfect) => save((s) => ({ sets: s.sets + 1, kinds: s.kinds.includes(kind) ? s.kinds : [...s.kinds, kind], level: perfect && s.level < 2 ? s.level + 1 : s.level }))} />}
    </Page>
  );
}

/** The row of pattern pictures with one gap (shared with the Daily Surprise). */
export function PatternRow({ round, solved }: { round: PatRound; solved: boolean }) {
  const { tx } = useTx();
  const label = round.seq.map((t, i) => (i === round.blank && !solved ? `(${tx(T.gap)})` : tx(tokenName(t)))).join(', ');
  return (
    <ol className="el-pattern" aria-label={label}>
      {round.seq.map((t, i) => (i === round.blank
        ? <li key={i} className={`q ${solved ? 'is-right' : ''}`} aria-hidden="true">{solved ? <Art id={t} /> : '?'}</li>
        : <li key={i} aria-hidden="true"><Art id={t} /></li>))}
    </ol>
  );
}
export const patPrompt = (r: PatRound) => (r.blank === r.seq.length - 1 ? T.next : T.missing);
export function patPraise(r: PatRound): L {
  const names = r.unit.map(tokenName);
  return L(`${names.map((n) => n.en).join(', ')}!`, `${names.map((n) => n.te).join(', ')}!`);
}

function Session({ kind, level, onAgain, onDone }: { kind: PatKind; level: number; onAgain: () => void; onDone: (perfect: boolean) => void }) {
  const { tx, say } = useTx();
  const record = useRecord('patterns');
  const badge = useBadge();
  const { give } = useStickers();
  const [seed] = useState(newSeed);
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState<PatRound>(() => patRound(rng(seed), kind, level, 3));
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [first, setFirst] = useState(0);
  const [finished, setFinished] = useState(false);
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const prompt = patPrompt(round);
  useNarrate(finished ? null : prompt, idx);

  const pick = (t: string) => {
    if (solved) return;
    const ok = patRight(round, t);
    record(`${kind}:${round.unit.length}:L${level}`, ok, wrong.length >= 2 ? 1 : 0);
    if (ok) {
      setSolved(true); sfx('sparkle'); if (!wrong.length) setFirst((n) => n + 1);
      say(patPraise(round));
    } else {
      sfx('pop'); setWrong((w) => [...w, t]);
      say(L(`Not ${tokenName(t).en.toLowerCase()}. Look at the pattern again.`, `${tokenName(t).te} కాదు. నమూనాను మళ్ళీ చూడు.`));
    }
  };
  const next = () => {
    if (idx + 1 >= ROUNDS) {
      const perfect = first >= ROUNDS;
      setFinished(true); celebrate(); sfx('success'); say(UI.allDone);
      onDone(perfect);
      setSticker(give('patterns'));
      if (level === 2 && perfect) void badge('play:patterns-pro', L('Pattern pro', 'నమూనాల నిపుణుడు'));
      return;
    }
    setRound(patRound(rng(seed + (idx + 1) * 7919), kind, level, idx >= 2 ? 4 : 3));
    setIdx(idx + 1); setWrong([]); setSolved(false);
  };
  const stateOf = (t: string): PickState => (solved && t === round.answer ? 'right' : wrong.includes(t) ? 'wrong' : !solved && wrong.length >= 2 && t === round.answer ? 'hint' : undefined);

  if (finished) return <DonePanel onAgain={onAgain} backTo="/play/patterns"><StickerReveal s={sticker} /></DonePanel>;
  return (
    <div className="el-play">
      <RoundDots done={idx} total={ROUNDS} />
      <Prompt l={prompt} />
      <PatternRow round={round} solved={solved} />
      <div className={`el-choices n${round.choices.length}`}>
        {round.choices.map((t) => <PicButton key={t} art={t} label={tx(tokenName(t))} onPick={() => pick(t)} state={stateOf(t)} disabled={solved || stateOf(t) === 'wrong'} showLabel />)}
      </div>
      {(solved || wrong.length > 0) && <EarlyFeedback ok={solved} tries={wrong.length} extra={solved ? tx(patPraise(round)) : undefined} />}
      {solved && <div className="el-row center"><button type="button" className="btn primary el-big" onClick={next} autoFocus>{tx(UI.next)}<Icon name="next" /></button></div>}
    </div>
  );
}
