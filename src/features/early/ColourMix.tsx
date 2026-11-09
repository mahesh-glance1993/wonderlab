// Colour Mixing: pour paints into the bowl (tap a pot, drag it to the bowl, or use the keyboard)
// and see what colour they make. "Mix & play" is free; "Make a colour" asks for a colour in 3 levels.
import { useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { useApp } from '../../lib/app';
import { sfx } from '../../lib/sfx';
import { celebrate, Page } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { L } from './data/pictures';
import { BackRow, BigTile, DonePanel, EarlyFeedback, Prompt, RoundDots, UI, useActivity, useBadge, useLastActivity, useNarrate, useRecord, useTx } from './common';
import { LevelPicker, StickerReveal, useReduced, useStickers } from './actCommon';
import {
  MAX_BOWL, MIX_COLOURS, MIX_PAINTS, RECIPES, isMixRight, mixHex, mixPaints, mixRound, recipeFor,
  type MixColour, type MixRound, type Paint, type Sticker,
} from './activities';
import { newSeed, rng } from './logicCore';

const T = {
  title: L('Colour Mixing', 'రంగులు కలుపుదాం'),
  pick: L('Let’s mix paints!', 'రంగులు కలుపుదాం!'),
  free: L('Mix & play', 'కలిపి ఆడు'),
  make: L('Make a colour', 'రంగు తయారు చెయ్యి'),
  how: L('Tap a paint pot, or drag it into the bowl.', 'రంగు డబ్బాను తాకు, లేదా గిన్నెలోకి లాగు.'),
  empty: L('Empty the bowl', 'గిన్నె ఖాళీ చెయ్యి'),
  full: L('The bowl is full. Empty it to mix again.', 'గిన్నె నిండింది. మళ్ళీ కలపడానికి ఖాళీ చెయ్యి.'),
  bowl: L('Mixing bowl', 'కలిపే గిన్నె'),
  emptyBowl: L('The bowl is empty.', 'గిన్నె ఖాళీగా ఉంది.'),
  newColour: L('A new colour!', 'కొత్త రంగు!'),
  made: L('Colours you made', 'నువ్వు చేసిన రంగులు'),
  level: L('How hard?', 'ఎంత కష్టం?'),
  paints: L('Paints', 'రంగులు'),
};
const LEVELS = [L('3 paints', '3 రంగులు'), L('+ white', '+ తెలుపు'), L('+ black', '+ నలుపు')];
const ROUNDS = 5;
interface MixSave { level: number; made: MixColour[]; sets: number }
const INIT: MixSave = { level: 0, made: [], sets: 0 };
const name = (c: MixColour) => MIX_COLOURS[c];
const lc = (s: string) => s.toLowerCase();

/** "red and yellow" / "ఎరుపు, పసుపు" */
function listOf(paints: readonly Paint[]): L {
  const u = [...new Set(paints)];
  const en = u.map((p) => lc(name(p).en));
  return L(en.length > 1 ? `${en.slice(0, -1).join(', ')} and ${en[en.length - 1]}` : en[0] ?? '', u.map((p) => name(p).te).join(', '));
}
function resultSay(paints: readonly Paint[]): L {
  const c = mixPaints(paints);
  const u = [...new Set(paints)];
  if (!c) return L(`${cap(listOf(paints).en)} make a new colour!`, `${listOf(paints).te} కలిపితే కొత్త రంగు!`);
  if (u.length === 1) return L(`${name(c).en}!`, `${name(c).te}!`);
  return L(`${cap(listOf(paints).en)} make ${lc(name(c).en)}!`, `${listOf(paints).te} కలిపితే ${name(c).te}!`);
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ColourMix() {
  const { tx } = useTx();
  const { lang } = useApp();
  useLastActivity('/play/colours', T.title);
  const [st, save] = useActivity<MixSave>('colours', INIT);
  const [mode, setMode] = useState<'free' | 'make' | null>(null);
  const [run, setRun] = useState(0);
  const level = Math.max(0, Math.min(2, st.level || 0));
  return (
    <Page title={tx(T.title)} back="/play" fullscreen>
      {mode && <BackRow onBack={() => setMode(null)} />}
      {!mode && (
        <>
          <Prompt l={T.pick} />
          <LevelPicker label={T.level} options={LEVELS.map((n, i) => ({ id: i, name: n }))} value={level} onChange={(v) => save({ level: v })} />
          <div className="el-grid el-grid-4">
            <BigTile art="c-green" title={T.free} tint="var(--c-art)" onGo={() => { setMode('free'); setRun((x) => x + 1); }} />
            <BigTile art="c-purple" title={T.make} tint="var(--c-lab)" onGo={() => { setMode('make'); setRun((x) => x + 1); }} />
          </div>
          {st.made.length > 0 && <MadeList made={st.made} />}
        </>
      )}
      {mode === 'free' && <FreeMix key={`${run}-${lang}`} level={level} made={st.made} onMade={(c) => save((s) => ({ made: s.made.includes(c) ? s.made : [...s.made, c] }))} />}
      {mode === 'make' && <MakeColour key={`${run}-${level}-${lang}`} level={level} onAgain={() => setRun((x) => x + 1)}
        onDone={(perfect) => save((s) => ({ sets: s.sets + 1, level: perfect && s.level < 2 ? s.level + 1 : s.level }))} />}
    </Page>
  );
}

function MadeList({ made }: { made: MixColour[] }) {
  const { tx } = useTx();
  return (
    <div className="el-made">
      <h2>{tx(T.made)}</h2>
      <ul>{made.filter((c) => MIX_COLOURS[c]).map((c) => <li key={c}><span className="el-swatch" style={{ background: MIX_COLOURS[c].hex }} aria-hidden="true" />{tx(MIX_COLOURS[c])}</li>)}</ul>
    </div>
  );
}

/** The bowl + pots, shared by both modes. `onAdd` gets the new bowl contents. */
function Mixer({ paints, bowl, onAdd, onEmpty, hint, disabled }: { paints: Paint[]; bowl: Paint[]; onAdd: (p: Paint) => void; onEmpty: () => void; hint?: Paint[]; disabled?: boolean }) {
  const { tx } = useTx();
  const reduced = useReduced();
  const bowlRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ p: Paint; sx: number; sy: number; moved: boolean } | null>(null);
  const [ghost, setGhost] = useState<{ p: Paint; x: number; y: number; over: boolean } | null>(null);
  const hex = mixHex(bowl);
  const res = mixPaints(bowl);
  const overBowl = (x: number, y: number) => { const r = bowlRef.current?.getBoundingClientRect(); return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
  const down = (e: RPointerEvent<HTMLButtonElement>, p: Paint) => {
    if (disabled || e.button > 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { p, sx: e.clientX, sy: e.clientY, moved: false };
  };
  const move = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 8) return;
    d.moved = true;
    setGhost({ p: d.p, x: e.clientX, y: e.clientY, over: overBowl(e.clientX, e.clientY) });
  };
  const up = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    setGhost(null);
    if (!d) return;
    if (!d.moved || overBowl(e.clientX, e.clientY)) onAdd(d.p);
  };
  const bowlLabel = bowl.length
    ? `${tx(T.bowl)}: ${tx(listOf(bowl))} → ${res ? tx(name(res)) : tx(T.newColour)}`
    : `${tx(T.bowl)}: ${tx(T.emptyBowl)}`;
  return (
    <>
      <div ref={bowlRef} className={`el-bowl ${ghost?.over ? 'is-near' : ''}`} role="img" aria-label={bowlLabel}>
        <svg viewBox="0 0 200 130" aria-hidden="true">
          <ellipse cx={100} cy={122} rx={70} ry={6} fill="rgba(0,0,0,.12)" />
          <path d="M14 40 Q20 118 100 118 Q180 118 186 40Z" fill="#F7F4EC" stroke="#3A3530" strokeWidth={3} strokeLinejoin="round" />
          {hex && <path key={bowl.length} className={reduced ? '' : 'el-pour'} d="M24 48 Q34 110 100 110 Q166 110 176 48Z" fill={hex} />}
          <ellipse cx={100} cy={40} rx={86} ry={14} fill={hex ?? '#E9E3D6'} stroke="#3A3530" strokeWidth={3} />
          {bowl.map((p, i) => <circle key={i} cx={70 + i * 30} cy={40} r={6} fill={MIX_COLOURS[p].hex} stroke="#3A3530" strokeWidth={1.5} />)}
        </svg>
        <span className="el-bowl-name" aria-hidden="true">{bowl.length ? (res ? tx(name(res)) : tx(T.newColour)) : tx(T.emptyBowl)}</span>
      </div>
      <div className="el-pots" role="group" aria-label={tx(T.paints)}>
        {paints.map((p) => (
          <button key={p} type="button" className={`el-pick el-pot ${hint?.includes(p) ? 'is-hint' : ''} ${ghost?.p === p ? 'is-dragging' : ''}`} disabled={disabled}
            aria-label={`${tx(name(p))}${hint?.includes(p) ? ` (${tx(L('try this', 'ఇది ప్రయత్నించు'))})` : ''}`}
            onPointerDown={(e) => down(e, p)} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { drag.current = null; setGhost(null); }}
            onClick={(e) => { if (e.detail === 0) onAdd(p); }}>
            <PaintPot hex={MIX_COLOURS[p].hex} />
            <span className="el-pick-label">{tx(name(p))}</span>
            {hint?.includes(p) && <span className="el-badge hint" aria-hidden="true"><Icon name="hand" /></span>}
          </button>
        ))}
      </div>
      <div className="el-row">
        <button type="button" className="btn el-big" onClick={onEmpty} disabled={!bowl.length || disabled}><Icon name="reset" />{tx(T.empty)}</button>
      </div>
      {ghost && <div className="el-ghost el-pot-ghost" aria-hidden="true" style={{ left: ghost.x, top: ghost.y }}><PaintPot hex={MIX_COLOURS[ghost.p].hex} /></div>}
    </>
  );
}

function PaintPot({ hex }: { hex: string }) {
  return (
    <svg viewBox="-50 -50 100 100" className="el-art" aria-hidden="true">
      <path d="M-30 -18 H30 L26 40 Q25 46 18 46 H-18 Q-25 46 -26 40Z" fill="#DCD6CB" stroke="#3A3530" strokeWidth={2.4} strokeLinejoin="round" />
      <ellipse cy={-18} rx={30} ry={9} fill={hex} stroke="#3A3530" strokeWidth={2.4} />
      <path d="M-26 -12 Q-24 6 -18 4 Q-14 -2 -12 10 Q-8 18 -4 4 Q0 -8 -26 -12Z" fill={hex} stroke="#3A3530" strokeWidth={1.6} />
      <path d="M8 -26 L30 -48" stroke="#8A5A36" strokeWidth={5} strokeLinecap="round" />
    </svg>
  );
}

function FreeMix({ level, made, onMade }: { level: number; made: MixColour[]; onMade: (c: MixColour) => void }) {
  const { tx, say } = useTx();
  const badge = useBadge();
  const record = useRecord('colours');
  const [bowl, setBowl] = useState<Paint[]>([]);
  const [msg, setMsg] = useState<L | null>(null);
  const knownRef = useRef(new Set(made));
  useNarrate(T.how, 'free');
  const add = (p: Paint) => {
    if (bowl.length >= MAX_BOWL) { sfx('pop'); setMsg(T.full); say(T.full); return; }
    const next = [...bowl, p];
    setBowl(next);
    sfx('splash');
    const c = mixPaints(next);
    const line = resultSay(next);
    setMsg(line);
    window.setTimeout(() => say(line), 250);
    if (c && new Set(next).size > 1 && !knownRef.current.has(c)) {
      knownRef.current.add(c);
      onMade(c);
      record(`free:${c}`, true);
      window.setTimeout(() => sfx('sparkle'), 300);
      if (RECIPES.every((rc) => knownRef.current.has(rc.makes))) void badge('play:mix-all', L('Colour wizard', 'రంగుల మాంత్రికుడు'));
    }
  };
  return (
    <div className="el-play el-mix">
      <Prompt l={T.how} />
      <Mixer paints={MIX_PAINTS[level]} bowl={bowl} onAdd={add} onEmpty={() => { sfx('whoosh'); setBowl([]); setMsg(null); }} />
      {msg && <p className="el-hint" role="status"><Icon name="palette" />{tx(msg)}</p>}
      {made.length > 0 && <MadeList made={made} />}
    </div>
  );
}

function MakeColour({ level, onAgain, onDone }: { level: number; onAgain: () => void; onDone: (perfect: boolean) => void }) {
  const { tx, say } = useTx();
  const record = useRecord('colours');
  const { give } = useStickers();
  const [seed] = useState(newSeed);
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState<MixRound>(() => mixRound(rng(seed), level));
  const [bowl, setBowl] = useState<Paint[]>([]);
  const [misses, setMisses] = useState(0);
  const [allFirst, setAllFirst] = useState(true);
  const [solved, setSolved] = useState(false);
  const [msg, setMsg] = useState<L | null>(null);
  const [finished, setFinished] = useState(false);
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const t = name(round.target);
  const prompt = L(`Can you make ${lc(t.en)}?`, `${t.te} తయారు చెయ్యగలవా?`);
  useNarrate(finished ? null : prompt, idx);
  const need = recipeFor(round.target);

  const add = (p: Paint) => {
    if (solved) return;
    if (bowl.length >= MAX_BOWL) { sfx('pop'); setMsg(T.full); say(T.full); return; }
    const next = [...bowl, p];
    setBowl(next);
    sfx('splash');
    if (isMixRight(round.target, next)) {
      setSolved(true);
      const line = L(`Yes! ${resultSay(next).en}`, `అవును! ${resultSay(next).te}`);
      setMsg(line);
      window.setTimeout(() => { sfx('sparkle'); say(line); }, 250);
      record(round.target, true, misses >= 2 ? 1 : 0);
      return;
    }
    // wrong once the bowl holds as many paints as the recipe (or any paint that isn't needed)
    const wrongPaint = !need.includes(p);
    if (wrongPaint || new Set(next).size >= need.length) {
      const c = mixPaints(next);
      const line = c && new Set(next).size > 1
        ? L(`That makes ${lc(name(c).en)}. We need ${lc(t.en)}. Empty the bowl and try again.`, `అది ${name(c).te}. మనకు ${t.te} కావాలి. గిన్నె ఖాళీ చేసి మళ్ళీ ప్రయత్నించు.`)
        : L(`Not quite. We need ${lc(t.en)}. Empty the bowl and try again.`, `సరిగ్గా కాదు. మనకు ${t.te} కావాలి. గిన్నె ఖాళీ చేసి మళ్ళీ ప్రయత్నించు.`);
      setMsg(line); say(line);
      setMisses((m) => m + 1); setAllFirst(false);
      record(round.target, false);
    } else {
      setMsg(resultSay(next));
    }
  };
  const next = () => {
    if (idx + 1 >= ROUNDS) {
      setFinished(true); celebrate(); sfx('success'); say(UI.allDone);
      onDone(allFirst);
      setSticker(give('mix'));
      return;
    }
    setRound(mixRound(rng(seed + (idx + 1) * 7919), level, round.target));
    setIdx(idx + 1); setBowl([]); setMisses(0); setSolved(false); setMsg(null);
  };
  if (finished) return <DonePanel onAgain={onAgain} backTo="/play/colours"><StickerReveal s={sticker} /></DonePanel>;
  return (
    <div className="el-play el-mix">
      <RoundDots done={idx} total={ROUNDS} />
      <Prompt l={prompt}><span className="el-swatch" style={{ background: t.hex }} aria-hidden="true" />{tx(prompt)}</Prompt>
      <Mixer paints={round.paints} bowl={bowl} onAdd={add} onEmpty={() => { sfx('whoosh'); setBowl([]); setMsg(null); }} hint={misses >= 2 && !solved ? need : undefined} disabled={solved} />
      {msg && !solved && <p className="el-hint" role="status"><Icon name="palette" />{tx(msg)}</p>}
      {solved && <EarlyFeedback ok tries={misses} extra={tx(resultSay(bowl))} />}
      {solved && <div className="el-row center"><button type="button" className="btn primary el-big" onClick={next} autoFocus>{tx(UI.next)}<Icon name="next" /></button></div>}
    </div>
  );
}
