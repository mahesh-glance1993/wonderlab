// Shape Play: meet the shapes, find shapes in a scene, build a picture from shapes, what comes next?
import { useState, type KeyboardEvent } from 'react';
import { tone } from '../../lib/audio';
import { celebrate, Page } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { L } from './data/pictures';
import { BUILDS, SHAPE, SHAPES, SHAPE_IDS, SHAPE_SCENES, buildChoices, patternRound, targetsIn, type BuildPuzzle, type Placed, type ShapeId, type ShapeScene } from './data/shapes';
import { ADAPT0, adapt, newSeed, rng, type Adapt } from './logic';
import { BackRow, BigTile, DonePanel, EarlyFeedback, PicButton, Prompt, RoundDots, SayButton, UI, useActivity, useBadge, useLastActivity, useNarrate, useRecord, useTx, type PickState } from './common';

interface ShapesState { seen: ShapeId[]; found: ShapeId[]; builds: string[]; adapt: Adapt; patternLevel: number; patternStreak: number }
const INIT: ShapesState = { seen: [], found: [], builds: [], adapt: ADAPT0, patternLevel: 0, patternStreak: 0 };
type Mode = 'learn' | 'find' | 'build' | 'pattern';
const MODES: { id: Mode; title: L; art: string; tint: string }[] = [
  { id: 'learn', title: L('Meet the shapes', 'ఆకారాలు తెలుసుకో'), art: 'shape-circle', tint: 'var(--c-math)' },
  { id: 'find', title: L('Find the shapes', 'ఆకారాలు వెతుకు'), art: 'shape-star', tint: 'var(--c-lab)' },
  { id: 'build', title: L('Build a picture', 'బొమ్మ కట్టు'), art: 'shape-triangle', tint: 'var(--c-next)' },
  { id: 'pattern', title: L('What comes next?', 'తర్వాత ఏది?'), art: 'shape-heart', tint: 'var(--c-art)' },
];
const plural = (s: ShapeId) => L(`${SHAPE[s].name.en.toLowerCase()}s`, SHAPE[s].name.te + 'లు');

/** One placed shape on a 400×260 stage. */
function ShapeEl({ p, className, outline }: { p: Placed; className?: string; outline?: 'next' | 'later' }) {
  const t = `translate(${p.x} ${p.y}) rotate(${p.rot || 0} ${p.w / 2} ${p.h / 2}) scale(${p.w / 100} ${p.h / 100})`;
  if (outline) return <path d={SHAPE[p.shape].path} transform={t} className={`el-outline ${outline}`} vectorEffect="non-scaling-stroke" />;
  return <path d={SHAPE[p.shape].path} transform={t} fill={p.fill} stroke="#3A3530" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" className={className} />;
}

export default function ShapePlay() {
  const { tx } = useTx();
  useLastActivity('/play/shapes', UI.shapes);
  const [st, save] = useActivity<ShapesState>('shapes', INIT);
  const [mode, setMode] = useState<Mode | null>(null);
  const [sub, setSub] = useState<string | null>(null);
  const [session, setSession] = useState(0);
  const back = () => { if (sub) setSub(null); else setMode(null); };
  return (
    <Page title={tx(UI.shapes)} back="/play" fullscreen>
      {mode && <BackRow onBack={back} />}
      {!mode && (
        <>
          <Prompt l={L('Let us play with shapes!', 'ఆకారాలతో ఆడుకుందాం!')} />
          <div className="el-grid el-grid-4">{MODES.map((m) => <BigTile key={m.id} art={m.art} title={m.title} tint={m.tint} onGo={() => { setMode(m.id); setSession((x) => x + 1); }} />)}</div>
        </>
      )}
      {mode === 'learn' && <Learn st={st} save={save} />}
      {mode === 'find' && !sub && (
        <>
          <Prompt l={L('Pick a picture!', 'ఒక బొమ్మ ఎంచుకో!')} />
          <div className="el-grid">{SHAPE_SCENES.map((s) => <BigTile key={s.id} art={`shape-${s.target}`} title={s.title} sub={st.found.includes(s.target) ? '✓' : undefined} onGo={() => setSub(s.id)} />)}</div>
        </>
      )}
      {mode === 'find' && sub && <FindScene key={`${sub}-${session}`} scene={SHAPE_SCENES.find((s) => s.id === sub)!} st={st} save={save} onAgain={() => setSession((x) => x + 1)} onMenu={() => setSub(null)} />}
      {mode === 'build' && !sub && (
        <>
          <Prompt l={L('What shall we build?', 'ఏమి కడదాం?')} />
          <div className="el-grid">
            {BUILDS.map((b) => (
              <button key={b.id} type="button" className="el-tile" onClick={() => setSub(b.id)} aria-label={tx(b.name)}>
                <span className="el-tile-art wide"><svg viewBox="0 0 400 260" aria-hidden="true">{b.slots.map((p, i) => <ShapeEl key={i} p={p} />)}</svg></span>
                <span className="el-tile-label">{tx(b.name)}</span>
                {st.builds.includes(b.id) && <span className="el-tile-sub">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
      {mode === 'build' && sub && <Build key={`${sub}-${session}`} puzzle={BUILDS.find((b) => b.id === sub)!} st={st} save={save} onAgain={() => setSession((x) => x + 1)} onMenu={() => setSub(null)} />}
      {mode === 'pattern' && <Patterns key={session} st={st} save={save} onAgain={() => setSession((x) => x + 1)} />}
    </Page>
  );
}

type Save = (p: Partial<ShapesState> | ((s: ShapesState) => Partial<ShapesState>)) => void;

function Learn({ st, save }: { st: ShapesState; save: Save }) {
  const { tx, say } = useTx();
  const [cur, setCur] = useState<ShapeId | null>(null);
  const [n, setN] = useState(0);
  const open = (id: ShapeId) => {
    tone('tap'); setCur(id); setN((x) => x + 1);
    const s = SHAPE[id];
    say(L(`${s.name.en}. ${s.hint.en}`, `${s.name.te}. ${s.hint.te}`));
    if (!st.seen.includes(id)) save((x) => ({ seen: [...new Set([...x.seen, id])] }));
  };
  const s = cur ? SHAPE[cur] : null;
  return (
    <div className="el-play">
      <Prompt l={L('Tap a shape to see it drawn!', 'ఆకారాన్ని తాకితే అది గీస్తాం!')} />
      {s && (
        <div className="el-shape-big" aria-live="polite">
          <svg viewBox="-10 -10 120 120" role="img" aria-label={tx(s.name)} key={n}>
            <path d={s.path} transform={`translate(${50 - 45 * Math.min(1, s.aspect)} ${50 - 45 / Math.max(1, s.aspect)}) scale(${0.9 * Math.min(1, s.aspect)} ${0.9 / Math.max(1, s.aspect)})`}
              className="el-draw" pathLength={1} fill={s.colour} stroke="#3A3530" strokeWidth={3} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="el-shape-name">{tx(s.name)}</p>
            <p className="el-shape-hint">{tx(s.hint)}</p>
            <SayButton l={L(`${s.name.en}. ${s.hint.en}`, `${s.name.te}. ${s.hint.te}`)} label={tx(s.name)} />
          </div>
        </div>
      )}
      <div className="el-choices n8">
        {SHAPES.map((x) => <PicButton key={x.id} art={`shape-${x.id}`} label={tx(x.name)} onPick={() => open(x.id)} showLabel state={st.seen.includes(x.id) && cur === x.id ? 'right' : undefined} />)}
      </div>
    </div>
  );
}

function FindScene({ scene, st, save, onAgain, onMenu }: { scene: ShapeScene; st: ShapesState; save: Save; onAgain: () => void; onMenu: () => void }) {
  const { tx, say } = useTx();
  const record = useRecord('shapes');
  const badge = useBadge();
  const targets = targetsIn(scene);
  const [found, setFound] = useState<number[]>([]);
  const [misses, setMisses] = useState(0);
  const [last, setLast] = useState<{ ok: boolean; text: string } | null>(null);
  const prompt = L(`Tap all the ${plural(scene.target).en}!`, `అన్ని ${plural(scene.target).te} తాకు!`);
  useNarrate(prompt, scene.id);
  const done = found.length === targets.length;

  const tap = (i: number) => {
    if (done || found.includes(i)) return;
    const it = scene.items[i];
    const label = it.label || SHAPE[it.shape].name;
    if (it.shape === scene.target) {
      tone('tap');
      const f = [...found, i];
      setFound(f);
      record(`find:${scene.id}:${i}`, true, misses >= 2 ? 1 : 0);
      if (f.length === targets.length) {
        const msg = L(`You found all ${targets.length} ${plural(scene.target).en}!`, `${targets.length} ${plural(scene.target).te} అన్నీ కనిపెట్టావు!`);
        setLast({ ok: true, text: tx(msg) }); say(msg); celebrate();
        const allFound = [...new Set([...st.found, scene.target])];
        save({ found: allFound });
        if (SHAPE_IDS.every((s) => allFound.includes(s))) void badge('play:all-shapes');
      } else {
        const msg = L(`${f.length}! A ${SHAPE[scene.target].name.en.toLowerCase()} — the ${label.en}.`, `${f.length}! ${label.te} — ${SHAPE[scene.target].name.te}.`);
        setLast({ ok: true, text: tx(msg) }); say(msg);
      }
    } else {
      setMisses((m) => m + 1);
      record(`find:${scene.id}:${i}`, false);
      const msg = L(`That ${label.en} is a ${SHAPE[it.shape].name.en.toLowerCase()}. Look for ${plural(scene.target).en}!`, `${label.te} ${SHAPE[it.shape].name.te}. ${plural(scene.target).te} కోసం చూడు!`);
      setLast({ ok: false, text: tx(msg) }); say(msg);
    }
  };
  const key = (e: KeyboardEvent, i: number) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(i); } };

  return (
    <div className="el-play">
      <Prompt l={prompt}><span className="el-inline-shape" aria-hidden="true"><svg viewBox="-50 -50 100 100"><path d={SHAPE[scene.target].path} transform="translate(-40 -40) scale(.8)" fill={SHAPE[scene.target].colour} /></svg></span>{tx(prompt)} <b>{found.length} / {targets.length}</b></Prompt>
      <div className="el-stage">
        <svg viewBox="0 0 400 260" aria-label={tx(scene.title)} role="group">
          <rect width={400} height={260} fill={scene.sky} aria-hidden="true" />
          <rect y={200} width={400} height={60} fill={scene.ground} aria-hidden="true" />
          {scene.decor?.map((p, i) => <g key={`d${i}`} aria-hidden="true"><ShapeEl p={p} /></g>)}
          {scene.items.map((p, i) => {
            const isFound = found.includes(i);
            const hint = !done && !isFound && misses >= 2 && p.shape === scene.target;
            const label = tx(p.label || SHAPE[p.shape].name);
            return (
              <g key={i} role="button" tabIndex={0} aria-label={isFound ? `${label}, ${tx(SHAPE[p.shape].name)} ✓` : label} aria-pressed={isFound}
                className={`el-scene-item ${isFound ? 'is-found' : ''} ${hint ? 'is-hint' : ''}`} onClick={() => tap(i)} onKeyDown={(e) => key(e, i)}>
                <rect x={p.x - 12} y={p.y - 12} width={p.w + 24} height={p.h + 24} fill="transparent" />
                <ShapeEl p={p} />
                {isFound && <g pointerEvents="none"><ShapeEl p={{ ...p, x: p.x - 4, y: p.y - 4, w: p.w + 8, h: p.h + 8 }} outline="next" /><circle cx={p.x + p.w} cy={p.y} r={11} fill="#2F6B4F" stroke="#fff" strokeWidth={2} /><path d={`M${p.x + p.w - 5} ${p.y} l3.5 3.5 l6 -7`} stroke="#fff" strokeWidth={2.6} fill="none" /></g>}
                {hint && <ShapeEl p={{ ...p, x: p.x - 5, y: p.y - 5, w: p.w + 10, h: p.h + 10 }} outline="later" />}
              </g>
            );
          })}
        </svg>
      </div>
      {last && <EarlyFeedback ok={last.ok} tries={misses} extra={last.text} />}
      {done && <DonePanel onAgain={onAgain} backTo="/play/shapes"><button type="button" className="btn el-big" onClick={onMenu}><Icon name="image" />{tx(L('Another picture', 'ఇంకో బొమ్మ'))}</button></DonePanel>}
    </div>
  );
}

function Build({ puzzle, st, save, onAgain, onMenu }: { puzzle: BuildPuzzle; st: ShapesState; save: Save; onAgain: () => void; onMenu: () => void }) {
  const { tx, say } = useTx();
  const record = useRecord('shapes');
  const [seed] = useState(newSeed);
  const [step, setStep] = useState(0);
  const [wrong, setWrong] = useState<ShapeId[]>([]);
  const done = step >= puzzle.slots.length;
  const slot = puzzle.slots[Math.min(step, puzzle.slots.length - 1)];
  const [choices, setChoices] = useState(() => buildChoices(rng(seed), slot.shape, st.adapt.choices));
  const prompt = done ? L(`You built a ${puzzle.name.en.toLowerCase()}!`, `${puzzle.name.te} కట్టావు!`) : L('Which shape fits the dotted line?', 'చుక్కల గీతలో ఏ ఆకారం సరిపోతుంది?');
  useNarrate(prompt, step);
  const pick = (s: ShapeId) => {
    if (done) return;
    const ok = s === slot.shape;
    record(`build:${puzzle.id}:${step}`, ok, wrong.length >= 2 ? 1 : 0);
    save((x) => ({ adapt: adapt(x.adapt, ok, ok && wrong.length === 0) }));
    if (!ok) { setWrong((w) => [...w, s]); say(L(`That is a ${SHAPE[s].name.en.toLowerCase()}. ${UI.tryAgain.en}`, `అది ${SHAPE[s].name.te}. ${UI.tryAgain.te}`)); return; }
    tone('correct');
    const ns = step + 1;
    setStep(ns); setWrong([]);
    if (ns >= puzzle.slots.length) { celebrate(); save((x) => ({ builds: [...new Set([...x.builds, puzzle.id])] })); }
    else { say(L(`${SHAPE[s].name.en}! ${UI.wellDone.en}`, `${SHAPE[s].name.te}! ${UI.wellDone.te}`)); setChoices(buildChoices(rng(seed + ns * 101), puzzle.slots[ns].shape, adapt(st.adapt, true).choices)); }
  };
  const stateOf = (s: ShapeId): PickState => (wrong.includes(s) ? 'wrong' : wrong.length >= 2 && s === slot.shape ? 'hint' : undefined);
  return (
    <div className="el-play">
      <RoundDots done={step} total={puzzle.slots.length} />
      <Prompt l={prompt} />
      <div className="el-stage build">
        <svg viewBox="0 0 400 260" role="img" aria-label={`${tx(puzzle.name)}: ${step} / ${puzzle.slots.length}`}>
          <rect width={400} height={260} fill="var(--paper)" />
          {puzzle.slots.map((p, i) => i < step ? <ShapeEl key={i} p={p} className="el-pop" /> : <ShapeEl key={i} p={p} outline={i === step ? 'next' : 'later'} />)}
        </svg>
      </div>
      {!done && (
        <div className={`el-choices n${choices.length}`}>
          {choices.map((s) => <PicButton key={s} art={`shape-${s}`} label={tx(SHAPE[s].name)} onPick={() => pick(s)} state={stateOf(s)} disabled={stateOf(s) === 'wrong'} showLabel />)}
        </div>
      )}
      {wrong.length > 0 && !done && <EarlyFeedback ok={false} tries={wrong.length} />}
      {done && <DonePanel onAgain={onAgain} backTo="/play/shapes"><button type="button" className="btn el-big" onClick={onMenu}><Icon name="puzzle" />{tx(L('Build another', 'ఇంకొకటి కట్టు'))}</button></DonePanel>}
    </div>
  );
}

const PATTERN_ROUNDS = 6;
function Patterns({ st, save, onAgain }: { st: ShapesState; save: Save; onAgain: () => void }) {
  const { tx, say } = useTx();
  const record = useRecord('shapes');
  const [seed] = useState(newSeed);
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState(() => patternRound(rng(seed), st.patternLevel, st.adapt.choices));
  const [wrong, setWrong] = useState<ShapeId[]>([]);
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const prompt = L('Which shape comes next?', 'తర్వాత ఏ ఆకారం వస్తుంది?');
  useNarrate(finished ? null : prompt, idx);
  const pick = (s: ShapeId) => {
    if (solved) return;
    const ok = s === round.answer;
    record(`pattern:${round.unit.join('-')}`, ok, wrong.length >= 2 ? 1 : 0);
    save((x) => {
      const first = ok && wrong.length === 0;
      const streak = first ? x.patternStreak + 1 : 0;
      const up = streak >= 3;
      return { adapt: adapt(x.adapt, ok, first), patternStreak: up ? 0 : streak, patternLevel: up ? Math.min(2, x.patternLevel + 1) : !ok && wrong.length >= 1 ? Math.max(0, x.patternLevel - 1) : x.patternLevel };
    });
    if (ok) { setSolved(true); say(L(`${SHAPE[s].name.en}! ${UI.wellDone.en}`, `${SHAPE[s].name.te}! ${UI.wellDone.te}`)); }
    else { setWrong((w) => [...w, s]); say(UI.tryAgain); }
  };
  const next = () => {
    if (idx + 1 >= PATTERN_ROUNDS) { setFinished(true); celebrate(); return; }
    setRound(patternRound(rng(seed + (idx + 1) * 31), st.patternLevel, st.adapt.choices));
    setIdx(idx + 1); setWrong([]); setSolved(false);
  };
  const stateOf = (s: ShapeId): PickState => (solved && s === round.answer ? 'right' : wrong.includes(s) ? 'wrong' : wrong.length >= 2 && s === round.answer ? 'hint' : undefined);
  if (finished) return <DonePanel onAgain={onAgain} backTo="/play/shapes" />;
  const seqText = round.seq.map((s) => tx(SHAPE[s].name)).join(', ');
  return (
    <div className="el-play">
      <RoundDots done={idx} total={PATTERN_ROUNDS} />
      <Prompt l={prompt} />
      <ol className="el-pattern" aria-label={`${seqText}, ?`}>
        {round.seq.map((s, i) => <li key={i} aria-hidden="true"><svg viewBox="-50 -50 100 100"><path d={SHAPE[s].path} transform="translate(-40 -40) scale(.8)" fill={SHAPE[s].colour} stroke="#3A3530" strokeWidth={2} vectorEffect="non-scaling-stroke" /></svg></li>)}
        <li className={`q ${solved ? 'is-right' : ''}`} aria-hidden="true">{solved ? <svg viewBox="-50 -50 100 100"><path d={SHAPE[round.answer].path} transform="translate(-40 -40) scale(.8)" fill={SHAPE[round.answer].colour} stroke="#3A3530" strokeWidth={2} vectorEffect="non-scaling-stroke" /></svg> : '?'}</li>
      </ol>
      <div className={`el-choices n${round.choices.length}`}>
        {round.choices.map((s) => <PicButton key={s} art={`shape-${s}`} label={tx(SHAPE[s].name)} onPick={() => pick(s)} state={stateOf(s)} disabled={solved || stateOf(s) === 'wrong'} showLabel />)}
      </div>
      {(solved || wrong.length > 0) && <EarlyFeedback ok={solved} tries={wrong.length} />}
      {solved && <div className="el-row center"><button type="button" className="btn primary el-big" onClick={next} autoFocus>{tx(UI.next)}<Icon name="next" /></button></div>}
    </div>
  );
}
