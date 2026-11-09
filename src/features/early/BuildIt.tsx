// Build It: assemble vehicles and machines from parts (drag, or tap a part then its place, or keyboard).
// When the model is complete it comes alive with an animation in sync with its sound.
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import { useApp } from '../../lib/app';
import { sfx, type SfxHandle, type SfxName } from '../../lib/sfx';
import { celebrate, Page } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import {
  ALIVE_MS, BUILD_INIT, FREE_BODIES, FREE_INIT, FREE_WHEELS, LEVEL_NAMES, MODELS, PALETTE, badgesFor, canFlip, canTurn, dropPart, flip, levelParts, magnet,
  partName, placeSfx, prebuilt, recordBuild, rotate, startOrient, tapPlace, type Alive, type BuildState, type DropResult, type FreeDesign, type Level, type Model, type Orient, type Part,
} from './data/builds';
import { L } from './data/pictures';
import { EASE } from './data/motion';
import { FreeVehicle, PartAt, PartIcon, Scenery } from './buildArt';
import { BackRow, Prompt, useActivity, useBadge, useLastActivity, useNarrate, useRecord, useTx } from './common';
import { newSeed, rng, shuffle } from './logic';

const T = {
  title: L('Build It', 'తయారు చేద్దాం'),
  pick: L('What shall we build?', 'ఏమి తయారు చేద్దాం?'),
  free: L('Make your own', 'నీదే తయారు చెయ్యి'),
  level: L('How many parts?', 'ఎన్ని భాగాలు?'),
  howTo: L('Drag each part to its place. Or tap a part, then tap its place.', 'ప్రతి భాగాన్ని దాని చోటుకు లాగు. లేదా భాగాన్ని తాకి, తర్వాత దాని చోటును తాకు.'),
  turnIt: L('Right place! Turn or flip it to fit.', 'సరైన చోటు! సరిపోయేలా తిప్పు.'),
  elsewhere: L('That part goes somewhere else.', 'ఆ భాగం వేరే చోట పెట్టాలి.'),
  pickFirst: L('First pick a part.', 'ముందు ఒక భాగం ఎంచుకో.'),
  rotate: L('Turn', 'తిప్పు'), flip: L('Flip', 'అటు తిప్పు'),
  again: L('Make it go again', 'మళ్ళీ నడిపించు'), nextLevel: L('More parts', 'ఇంకా భాగాలు'), another: L('Build another', 'ఇంకొకటి తయారు చెయ్యి'),
  ready: L('Ready!', 'సిద్ధం!'), go: L('Go!', 'పద!'), parts: L('Parts', 'భాగాలు'),
};
const reduceMotion = () => document.documentElement.classList.contains('reduce-motion');

/** Plays timed sound cues; returns a stop function. */
function playCues(cues: [number, SfxName][]) {
  const handles: SfxHandle[] = [];
  const timers = cues.map(([t, n]) => window.setTimeout(() => { const h = sfx(n); if (h) handles.push(h); }, t));
  return () => { timers.forEach((t) => window.clearTimeout(t)); handles.forEach((h) => h.stop()); };
}

/** Bring a finished model to life (Web Animations; transform/opacity only). */
function animateAlive(root: Element, kind: Alive | 'drive', dir: 1 | -1 = 1): Animation[] {
  const out: Animation[] = [];
  const A = (el: Element | null, kf: Keyframe[], opts: KeyframeAnimationOptions = {}) => {
    if (el && typeof (el as SVGGElement).animate === 'function') out.push((el as SVGGElement).animate(kf, { duration: ALIVE_MS, easing: EASE, ...opts }));
  };
  const model = root.querySelector('[data-model]');
  const all = (role: string) => Array.from(root.querySelectorAll(`[data-role="${role}"]`));
  const tf = (x: number, y = 0, r = 0) => `translate(${x}px, ${y}px) rotate(${r}deg)`;
  const away = (x: number, y: number, r: number): Keyframe[] => [
    { transform: tf(0), opacity: 1, offset: 0 }, { transform: tf(x, y, r), opacity: 1, offset: 0.45, easing: 'ease-in' },
    { transform: tf(x, y, r), opacity: 0, offset: 0.47 }, { transform: tf(-x, y * -0.3, 0), opacity: 0, offset: 0.5 },
    { transform: tf(-x, y * -0.3, 0), opacity: 1, offset: 0.52, easing: 'ease-out' }, { transform: tf(0), opacity: 1, offset: 1 },
  ];
  if (kind === 'drive' || kind === 'slow') {
    A(model, away(360 * dir, 0, 0));
    all('wheel').forEach((w) => A(w, [{ transform: 'rotate(0deg)' }, { transform: `rotate(${(kind === 'slow' ? 540 : 900) * dir}deg)` }]));
  } else if (kind === 'fly') {
    A(model, away(330 * dir, -150, -12 * dir));
  } else if (kind === 'hover') {
    A(model, [{ transform: tf(0) }, { transform: tf(0, -40), offset: 0.35 }, { transform: tf(10, -46), offset: 0.65 }, { transform: tf(0) }]);
    all('rotor').forEach((r) => A(r, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0.15)' }, { transform: 'scaleX(1)' }], { duration: 400, iterations: 10, easing: 'ease-in-out' }));
    all('spin').forEach((r) => A(r, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(1080deg)' }]));
  } else if (kind === 'sail') {
    A(model, [{ transform: tf(0) }, { transform: tf(30 * dir, -4, 3), offset: 0.25 }, { transform: tf(60 * dir, 0, -3), offset: 0.5 }, { transform: tf(30 * dir, -4, 3), offset: 0.75 }, { transform: tf(0) }]);
  } else if (kind === 'launch') {
    A(model, [{ transform: tf(0) }, { transform: tf(-2), offset: 0.06 }, { transform: tf(2), offset: 0.12 }, { transform: tf(0), offset: 0.18, easing: 'ease-in' }, { transform: tf(0, -340), offset: 0.55, easing: 'ease-out' }, { transform: tf(0) }]);
    all('flame').forEach((f) => A(f, [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 600, iterations: 6, easing: 'ease-in-out' }));
  } else if (kind === 'lift') {
    all('arm').forEach((a) => A(a, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-14deg)', offset: 0.4 }, { transform: 'rotate(-14deg)', offset: 0.6 }, { transform: 'rotate(0deg)' }]));
    all('bucket').forEach((b) => A(b, [{ transform: tf(0) }, { transform: tf(-22, -48), offset: 0.4 }, { transform: tf(-22, -48), offset: 0.6 }, { transform: tf(0) }]));
  } else if (kind === 'turn') {
    all('spin').forEach((b) => A(b, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(540deg)' }]));
    all('gear').forEach((g, i) => { const r = Number((g as SVGGElement).dataset.r) || 40; const deg = (360 * 40) / r * (i % 2 ? -1 : 1); A(g, [{ transform: 'rotate(0deg)' }, { transform: `rotate(${Math.round(deg)}deg)` }]); });
  }
  return out;
}

export default function BuildIt() {
  const { tx } = useTx();
  useLastActivity('/play/build', T.title);
  const [st, save] = useActivity<BuildState>('build', BUILD_INIT);
  const [model, setModel] = useState<Model | null>(null);
  const [free, setFree] = useState(false);
  const [run, setRun] = useState(0);
  const level = (st.level ?? 1) as Level;

  return (
    <Page title={tx(T.title)} back="/play" fullscreen>
      {(model || free) && <BackRow onBack={() => { setModel(null); setFree(false); }} />}
      {!model && !free && (
        <>
          <Prompt l={T.pick} />
          <div className="el-levels" role="group" aria-label={tx(T.level)}>
            {([1, 2, 3] as Level[]).map((lv) => (
              <button key={lv} type="button" className={`btn el-ctl ${lv === level ? 'is-on' : ''}`} aria-pressed={lv === level} onClick={() => save({ level: lv })}>
                {lv === level && <Icon name="check" />}{tx(LEVEL_NAMES[lv])}
              </button>
            ))}
          </div>
          <div className="el-grid">
            {MODELS.map((m) => (
              <button key={m.id} type="button" className="el-tile" onClick={() => { setModel(m); setRun((x) => x + 1); }}>
                <span className="el-tile-art wide"><ModelPreview m={m} /></span>
                <span className="el-tile-label">{tx(m.name)}</span>
                {st.done[m.id] ? <span className="el-tile-sub">{'✓'.repeat(st.done[m.id])}</span> : null}
              </button>
            ))}
            <button type="button" className="el-tile" style={{ background: 'var(--c-art)' }} onClick={() => setFree(true)}>
              <span className="el-tile-art wide"><svg viewBox="0 0 400 260" aria-hidden="true"><Scenery scene="road" /><FreeVehicle d={st.free || FREE_INIT} /></svg></span>
              <span className="el-tile-label">{tx(T.free)}</span>
            </button>
          </div>
        </>
      )}
      {model && (
        <Builder key={`${model.id}-${level}-${run}`} model={model} level={level}
          onDone={(lv) => save((s) => recordBuild(s, model.id, lv))} getState={() => st}
          onNextLevel={level < 3 ? () => { save({ level: (level + 1) as Level }); setRun((x) => x + 1); } : undefined}
          onAnother={() => setModel(null)} />
      )}
      {free && <FreeBuild design={st.free || FREE_INIT} onChange={(d) => save({ free: d })} />}
    </Page>
  );
}

function ModelPreview({ m }: { m: Model }) {
  return <svg viewBox="0 0 400 260" aria-hidden="true"><Scenery scene={m.scene} />{m.parts.map((p) => <PartAt key={p.id} p={p} />)}</svg>;
}

interface Drag { id: string; sx: number; sy: number; moved: boolean; x: number; y: number; near?: string }

function Builder({ model, level, onDone, getState, onNextLevel, onAnother }: {
  model: Model; level: Level; onDone: (lv: Level) => void; getState: () => BuildState; onNextLevel?: () => void; onAnother: () => void;
}) {
  const { tx, say } = useTx();
  const { prefs } = useApp();
  const record = useRecord('build');
  const badge = useBadge();
  const [seed] = useState(newSeed);
  const toPlace = useMemo(() => levelParts(model, level), [model, level]);
  const trayOrder = useMemo(() => shuffle(rng(seed), toPlace), [seed, toPlace]);
  const [filled, setFilled] = useState<Record<string, string>>({});
  const [orients, setOrients] = useState<Record<string, Orient>>(() => Object.fromEntries(toPlace.map((p) => [p.id, startOrient(p, level)])));
  const [sel, setSel] = useState<string | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const [misses, setMisses] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<string>('');
  const [alive, setAlive] = useState(0);
  const boardRef = useRef<SVGSVGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = prefs.reduceMotion || reduceMotion();
  const complete = Object.keys(filled).length === toPlace.length;
  const used = new Set(Object.values(filled));
  const tray = trayOrder.filter((p) => !used.has(p.id));
  const partById = (id: string) => model.parts.find((p) => p.id === id)!;
  const selPart = sel ? partById(sel) : null;
  useNarrate(L(`Let’s build a ${model.name.en.toLowerCase()}! ${T.howTo.en}`, `${model.name.te} తయారు చేద్దాం! ${T.howTo.te}`), model.id);

  // come alive: animation + its sound, in sync; replayable
  useEffect(() => {
    if (!alive) return;
    const stop = playCues(model.cues);
    const anims = reduced || !stageRef.current ? [] : animateAlive(stageRef.current, model.alive, model.dir ?? 1);
    return () => { stop(); anims.forEach((a) => a.cancel()); };
  }, [alive]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = () => {
    celebrate();
    sfx('success');
    say(L(`You built a ${model.name.en.toLowerCase()}!`, `నువ్వు ${model.name.te} తయారు చేశావు!`));
    const hints = Object.values(misses).some((n) => n >= 2) ? 1 : 0;
    record(`${model.id}:L${level}`, true, hints);
    onDone(level);
    const next = recordBuild(getState(), model.id, level);
    void (async () => { for (const b of badgesFor(next)) await badge(b); })();
    window.setTimeout(() => setAlive((n) => n + 1), 900);
  };

  const handle = (res: DropResult, part: Part) => {
    if (res && 'slot' in res) {
      const slot = partById(res.slot);
      const f = { ...filled, [res.slot]: part.id };
      setFilled(f); setSel(null); setMsg('');
      sfx('snap');
      const ps = placeSfx(slot);
      if (ps !== 'snap') window.setTimeout(() => sfx(ps), 160);
      if (Object.keys(f).length === toPlace.length) finish();
      else say(partName(slot));
      return;
    }
    sfx('pop');
    if (res && 'turn' in res) { setSel(part.id); setMsg(tx(T.turnIt)); say(T.turnIt); return; }
    setMisses((m) => ({ ...m, [part.id]: (m[part.id] ?? 0) + 1 }));
    setMsg(tx(T.elsewhere)); say(T.elsewhere);
  };

  // ---- pointer drag (finger / mouse / pen) ----
  const boardPoint = (cx: number, cy: number) => {
    const r = boardRef.current!.getBoundingClientRect();
    return { x: ((cx - r.left) / r.width) * 400, y: ((cy - r.top) / r.height) * 260 };
  };
  const onDown = (e: RPointerEvent<HTMLButtonElement>, p: Part) => {
    if (complete || e.button > 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id: p.id, sx: e.clientX, sy: e.clientY, moved: false, x: e.clientX, y: e.clientY };
  };
  const onMove = (e: RPointerEvent<HTMLButtonElement>, p: Part) => {
    const d = dragRef.current;
    if (!d || d.id !== p.id) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 8) return;
    const b = boardPoint(e.clientX, e.clientY);
    const m = magnet(model, level, filled, p, b.x, b.y);
    const r = boardRef.current!.getBoundingClientRect();
    const next = { ...d, moved: true, x: r.left + (m.x / 400) * r.width, y: r.top + (m.y / 260) * r.height, near: m.near };
    dragRef.current = next;
    setDrag(next);
  };
  const onUp = (p: Part) => {
    const d = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!d || d.id !== p.id) return;
    if (!d.moved) { choose(p); return; }
    const b = boardPoint(d.x, d.y);
    handle(dropPart(model, level, filled, p, orients[p.id], b.x, b.y), p);
  };
  const choose = (p: Part) => {
    sfx('click');
    setSel((s) => (s === p.id ? null : p.id));
    say(partName(p));
  };
  const tapSlot = (slot: Part) => {
    if (complete || filled[slot.id]) return;
    if (!selPart) { setMsg(tx(T.pickFirst)); say(T.pickFirst); return; }
    handle(tapPlace(model, level, filled, selPart, orients[selPart.id], slot.id), selPart);
  };
  const slotKey = (e: KeyboardEvent, slot: Part) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapSlot(slot); } };
  const hintFor = (slot: Part) => !!selPart && (misses[selPart.id] ?? 0) >= 2 && tapPlace(model, level, filled, selPart, { rot: 0, flip: !!slot.mirror }, slot.id) !== null;

  const pre = new Set(prebuilt(model, level).map((p) => p.id));
  const dragPart = drag ? partById(drag.id) : null;
  const scale = boardRef.current ? boardRef.current.getBoundingClientRect().width / 400 : 1;

  return (
    <div className="el-play el-build">
      <Prompt l={complete ? L(`You built a ${model.name.en.toLowerCase()}!`, `నువ్వు ${model.name.te} తయారు చేశావు!`) : T.howTo} />
      <div className="el-stage" ref={stageRef}>
        <svg ref={boardRef} viewBox="0 0 400 260" role="img" aria-label={`${tx(model.name)}: ${Object.keys(filled).length} / ${toPlace.length}`}>
          <Scenery scene={model.scene} />
          <g data-model="">
            {model.parts.map((p) => (pre.has(p.id) || filled[p.id]
              ? <PartAt key={p.id} p={p} className={filled[p.id] && !reduced ? 'el-pop' : ''} />
              : (
                <g key={`s-${p.id}`} role="button" tabIndex={0} className={`el-slot ${drag?.near === p.id ? 'is-near' : ''} ${hintFor(p) ? 'is-hint' : ''}`}
                  aria-label={`${tx(L('Place for', 'దీని చోటు:'))} ${tx(partName(p))}`} onClick={() => tapSlot(p)} onKeyDown={(e) => slotKey(e, p)}>
                  <PartAt p={p} slot />
                </g>
              )))}
          </g>
        </svg>
        {complete && reduced && <div className="el-bubble" role="status">{tx(T.ready)}</div>}
      </div>
      {!complete && (
        <>
          <div className="el-tray el-parts" role="group" aria-label={tx(T.parts)}>
            {tray.map((p) => (
              <button key={p.id} type="button" className={`el-pick el-part ${sel === p.id ? 'is-sel' : ''} ${drag?.id === p.id ? 'is-dragging' : ''}`} aria-pressed={sel === p.id}
                aria-label={`${tx(partName(p))}${canTurn(p, level) || canFlip(p, level) ? ` (${tx(L('can turn or flip', 'తిప్పవచ్చు'))})` : ''}`}
                onPointerDown={(e) => onDown(e, p)} onPointerMove={(e) => onMove(e, p)} onPointerUp={() => onUp(p)} onPointerCancel={() => { dragRef.current = null; setDrag(null); }}
                onClick={(e) => { if (e.detail === 0) choose(p); }}>
                <span className="el-pick-art"><PartIcon p={p} orient={orients[p.id]} /></span>
              </button>
            ))}
          </div>
          {selPart && (canTurn(selPart, level) || canFlip(selPart, level)) && (
            <div className="el-row">
              {canTurn(selPart, level) && <button type="button" className="btn el-big" onClick={() => { sfx('click'); setOrients((o) => ({ ...o, [selPart.id]: rotate(o[selPart.id]) })); }}><Icon name="redo" />{tx(T.rotate)}</button>}
              {canFlip(selPart, level) && <button type="button" className="btn el-big" onClick={() => { sfx('click'); setOrients((o) => ({ ...o, [selPart.id]: flip(o[selPart.id]) })); }}><Icon name="undo" />{tx(T.flip)}</button>}
            </div>
          )}
          {msg && <p className="el-hint" role="status"><Icon name="hand" />{msg}</p>}
        </>
      )}
      {complete && (
        <div className="el-row">
          <button type="button" className="btn primary el-big" onClick={() => setAlive((n) => n + 1)}><Icon name="play" />{tx(T.again)}</button>
          {onNextLevel && <button type="button" className="btn el-big" onClick={onNextLevel}><Icon name="plus" />{tx(T.nextLevel)}</button>}
          <button type="button" className="btn el-big" onClick={onAnother}><Icon name="grid" />{tx(T.another)}</button>
        </div>
      )}
      {drag && dragPart && (
        <div className="el-ghost" aria-hidden="true" style={{ left: drag.x, top: drag.y, width: (Math.max(dragPart.w, dragPart.h) * 1.15 + 6) * scale }}>
          <PartIcon p={dragPart} orient={orients[dragPart.id]} />
        </div>
      )}
    </div>
  );
}

function FreeBuild({ design, onChange }: { design: FreeDesign; onChange: (d: FreeDesign) => void }) {
  const { tx, say } = useTx();
  const { prefs } = useApp();
  const [d, setD] = useState<FreeDesign>(design);
  const [go, setGo] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = prefs.reduceMotion || reduceMotion();
  useNarrate(L('Make your own vehicle! Pick a body, wheels and a colour.', 'నీ సొంత వాహనం తయారు చెయ్యి! బాడీ, చక్రాలు, రంగు ఎంచుకో.'), 'free');
  const set = (p: Partial<FreeDesign>) => { const n = { ...d, ...p }; setD(n); onChange(n); sfx('snap'); };
  useEffect(() => {
    if (!go) return;
    const body = FREE_BODIES.find((b) => b.id === d.body)!;
    const stop = playCues([[0, body.sfx], [2400, 'horn']]);
    const anims = reduced || !stageRef.current ? [] : animateAlive(stageRef.current, 'drive');
    return () => { stop(); anims.forEach((a) => a.cancel()); };
  }, [go]); // eslint-disable-line react-hooks/exhaustive-deps
  const opt = (on: boolean, label: string, onClick: () => void, swatch?: string) => (
    <button key={label} type="button" className={`btn el-ctl ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={onClick}>
      {swatch && <span className="el-swatch small" style={{ background: swatch }} aria-hidden="true" />}{on && <Icon name="check" />}{label}
    </button>
  );
  const colourNames = [L('Red', 'ఎరుపు'), L('Blue', 'నీలం'), L('Green', 'ఆకుపచ్చ'), L('Yellow', 'పసుపు'), L('Orange', 'నారింజ'), L('Purple', 'ఊదా')];
  return (
    <div className="el-play el-build">
      <div className="el-stage" ref={stageRef}>
        <svg viewBox="0 0 400 260" role="img" aria-label={tx(T.free)}><Scenery scene="road" /><g data-model=""><FreeVehicle d={d} /></g></svg>
      </div>
      <div className="el-options" role="group" aria-label={tx(L('Body', 'బాడీ'))}>{FREE_BODIES.map((b) => opt(d.body === b.id, tx(b.name), () => set({ body: b.id })))}</div>
      <div className="el-options" role="group" aria-label={tx(L('Wheels', 'చక్రాలు'))}>{FREE_WHEELS.map((w) => opt(d.wheel === w.id, tx(w.name), () => set({ wheel: w.id })))}</div>
      <div className="el-options" role="group" aria-label={tx(L('Colour', 'రంగు'))}>{PALETTE.map((c, i) => opt(d.colour === c, tx(colourNames[i]), () => set({ colour: c }), c))}</div>
      <div className="el-row">
        <button type="button" className="btn primary el-big" onClick={() => { setGo((n) => n + 1); say(L('Off we go!', 'పదండి!')); }}><Icon name="play" />{tx(T.go)}</button>
      </div>
    </div>
  );
}
