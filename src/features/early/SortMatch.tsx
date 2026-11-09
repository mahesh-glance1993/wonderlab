// Sort & Match: sort by colour / size / kind (tap a picture, then tap a basket), and match pairs (mother & baby, object & shadow).
import { useState } from 'react';
import { tone } from '../../lib/audio';
import { sfx } from '../../lib/sfx';
import { celebrate, Page } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { Art } from './art';
import { PIC, COLOUR_NAMES, L } from './data/pictures';
import { ADAPT0, adapt, matchRound, newSeed, rng, sortRound, type Adapt, type MatchKind, type MatchRound, type SortKind, type SortRound } from './logic';
import { BackRow, BigTile, DonePanel, EarlyFeedback, Prompt, UI, useActivity, useLastActivity, useNarrate, useRecord, useTx } from './common';

interface SortState { level: number; adapt: Adapt; played: string[] }
const INIT: SortState = { level: 0, adapt: ADAPT0, played: [] };
type Mode = SortKind | MatchKind;
const MODES: { id: Mode; title: L; art: string; tint: string }[] = [
  { id: 'colour', title: L('Sort by colour', 'రంగుల వారీగా'), art: 'c-red', tint: 'var(--c-art)' },
  { id: 'size', title: L('Big and small', 'పెద్దది, చిన్నది'), art: 'elephant', tint: 'var(--c-math)' },
  { id: 'category', title: L('Fruits or animals?', 'పండ్లా, జంతువులా?'), art: 'banana', tint: 'var(--c-lab)' },
  { id: 'baby', title: L('Mother and baby', 'అమ్మ, పిల్ల'), art: 'hen', tint: 'var(--c-next)' },
  { id: 'shadow', title: L('Find the shadow', 'నీడను కనిపెట్టు'), art: 'bicycle', tint: 'var(--c-games)' },
];
type Save = (p: Partial<SortState> | ((s: SortState) => Partial<SortState>)) => void;

export default function SortMatch() {
  const { tx } = useTx();
  useLastActivity('/play/sort', UI.sort);
  const [st, save] = useActivity<SortState>('sort', INIT);
  const [mode, setMode] = useState<Mode | null>(null);
  const [session, setSession] = useState(0);
  const again = () => setSession((x) => x + 1);
  return (
    <Page title={tx(UI.sort)} back="/play" fullscreen>
      {mode && <BackRow onBack={() => setMode(null)} />}
      {!mode && (
        <>
          <Prompt l={L('Pick a game!', 'ఒక ఆట ఎంచుకో!')} />
          <div className="el-grid">{MODES.map((m) => <BigTile key={m.id} art={m.art} title={m.title} tint={m.tint} sub={st.played.includes(m.id) ? '✓' : undefined} onGo={() => { setMode(m.id); again(); }} />)}</div>
        </>
      )}
      {(mode === 'colour' || mode === 'size' || mode === 'category') && <Sorter key={`${mode}-${session}`} kind={mode} st={st} save={save} onAgain={again} />}
      {(mode === 'baby' || mode === 'shadow') && <Matcher key={`${mode}-${session}`} kind={mode} st={st} save={save} onAgain={again} />}
    </Page>
  );
}

function Sorter({ kind, st, save, onAgain }: { kind: SortKind; st: SortState; save: Save; onAgain: () => void }) {
  const { tx, say } = useTx();
  const record = useRecord('sort');
  const [round] = useState<SortRound>(() => sortRound(rng(newSeed()), kind, st.level));
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [wrong, setWrong] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const prompt = kind === 'colour'
    ? L(`Put each picture in the right colour basket: ${round.baskets.map((b) => b.label.en).join(' or ')}.`, `ప్రతి బొమ్మను సరైన రంగు బుట్టలో పెట్టు: ${round.baskets.map((b) => b.label.te).join(' లేదా ')}.`)
    : kind === 'size' ? L('Is it big or small? Tap a picture, then a box.', 'పెద్దదా, చిన్నదా? బొమ్మను తాకి, తర్వాత పెట్టెను తాకు.')
    : L(`Tap a picture, then its basket: ${round.baskets.map((b) => b.label.en).join(' or ')}.`, `బొమ్మను తాకి, దాని బుట్టను తాకు: ${round.baskets.map((b) => b.label.te).join(' లేదా ')}.`);
  useNarrate(prompt, round);
  const left = round.items.filter((i) => !placed[i.key]);
  const done = left.length === 0;
  const nameOf = (art: string) => PIC[art] ? tx(PIC[art]) : art;
  const itemLabel = (i: SortRound['items'][number]) => kind === 'size' ? `${tx(i.big ? L('Big', 'పెద్ద') : L('Small', 'చిన్న'))} ${nameOf(i.art)}` : nameOf(i.art);

  const chooseItem = (key: string) => {
    tone('tap'); sfx('pop'); setSel(key);
    const it = round.items.find((i) => i.key === key)!;
    say(PIC[it.art] ? (kind === 'size' ? L(`${it.big ? 'Big' : 'Small'} ${PIC[it.art].en.toLowerCase()}`, `${it.big ? 'పెద్ద' : 'చిన్న'} ${PIC[it.art].te}`) : PIC[it.art]) : L(it.art, it.art));
  };
  const chooseBasket = (b: string) => {
    if (!sel) { say(L('First tap a picture.', 'ముందు ఒక బొమ్మను తాకు.')); setMsg({ ok: false, text: tx(L('First tap a picture.', 'ముందు ఒక బొమ్మను తాకు.')) }); return; }
    const it = round.items.find((i) => i.key === sel)!;
    const ok = it.basket === b;
    const basket = round.baskets.find((x) => x.id === b)!;
    record(`${kind}:${it.art}`, ok, (wrong[sel] ?? 0) >= 2 ? 1 : 0);
    if (ok) {
      const p = { ...placed, [sel]: b };
      setPlaced(p); setSel(null);
      const text = L(`Yes! ${PIC[it.art]?.en ?? it.art} goes in ${basket.label.en}.`, `అవును! ${PIC[it.art]?.te ?? it.art} — ${basket.label.te}.`);
      setMsg({ ok: true, text: tx(text) }); say(text); sfx('snap');
      if (Object.keys(p).length === round.items.length) {
        celebrate(); sfx('success');
        save((s) => ({ played: [...new Set([...s.played, kind])], level: mistakes <= 1 ? Math.min(2, s.level + 1) : mistakes >= 4 ? Math.max(0, s.level - 1) : s.level }));
      }
    } else {
      setWrong((w) => ({ ...w, [sel]: (w[sel] ?? 0) + 1 })); setMistakes((m) => m + 1);
      setMsg({ ok: false, text: '' }); say(UI.tryAgain);
    }
  };
  const hintBasket = sel && (wrong[sel] ?? 0) >= 2 ? round.items.find((i) => i.key === sel)!.basket : null;

  return (
    <div className="el-play">
      <Prompt l={prompt} />
      <div className="el-tray" role="group" aria-label={tx(L('Pictures to sort', 'వేరు చేయాల్సిన బొమ్మలు'))}>
        {left.map((i) => (
          <button key={i.key} type="button" className={`el-pick ${i.big === false ? 'is-small' : ''} ${i.big ? 'is-big' : ''}`} aria-pressed={sel === i.key} onClick={() => chooseItem(i.key)} aria-label={itemLabel(i)}>
            <span className="el-pick-art"><Art id={i.art} /></span>
            {sel === i.key && <span className="el-badge sel" aria-hidden="true"><Icon name="hand" /></span>}
          </button>
        ))}
        {done && <p className="el-hint"><Icon name="check" />{tx(UI.allDone)}</p>}
      </div>
      <div className="el-baskets">
        {round.baskets.map((b) => (
          <button key={b.id} type="button" className={`el-basket ${hintBasket === b.id ? 'is-hint' : ''}`} onClick={() => chooseBasket(b.id)}
            aria-label={`${tx(b.label)} (${round.items.filter((i) => placed[i.key] === b.id).length})`}>
            <span className="el-basket-head">
              {b.colour ? <span className="el-swatch" style={{ background: COLOUR_NAMES[b.colour].hex }} aria-hidden="true" /> : b.art && <span className={`el-basket-icon ${b.id === 'small' ? 'is-small' : ''}`}><Art id={b.art} /></span>}
              <b>{tx(b.label)}</b>
              {hintBasket === b.id && <Icon name="hand" />}
            </span>
            <span className="el-basket-in">{round.items.filter((i) => placed[i.key] === b.id).map((i) => <span key={i.key} className={i.big === false ? 'is-small' : ''}><Art id={i.art} /></span>)}</span>
          </button>
        ))}
      </div>
      {msg && !done && (msg.ok || msg.text === '') && <EarlyFeedback ok={msg.ok} tries={sel ? (wrong[sel] ?? 0) : 0} extra={msg.text || undefined} />}
      {msg && !msg.ok && msg.text && <p className="el-hint"><Icon name="info" />{msg.text}</p>}
      {done && <DonePanel onAgain={onAgain} backTo="/play/sort" />}
    </div>
  );
}

function Matcher({ kind, st, save, onAgain }: { kind: MatchKind; st: SortState; save: Save; onAgain: () => void }) {
  const { tx, say } = useTx();
  const record = useRecord('sort');
  const [round] = useState<MatchRound>(() => matchRound(rng(newSeed()), kind, st.adapt.choices));
  const [matched, setMatched] = useState<string[]>([]); // left keys
  const [sel, setSel] = useState<{ side: 'l' | 'r'; key: string } | null>(null);
  const [wrong, setWrong] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text?: string; n: number } | null>(null);
  const prompt = kind === 'baby' ? L('Match each mother with her baby!', 'ప్రతి అమ్మను తన పిల్లతో జత చేయి!') : L('Match each picture with its shadow!', 'ప్రతి బొమ్మను దాని నీడతో జత చేయి!');
  useNarrate(prompt, round);
  const leftOfRight = (rk: string) => Object.keys(round.pairs).find((l) => round.pairs[l] === rk)!;
  const done = matched.length === round.left.length;
  const order = (lk: string) => matched.indexOf(lk) + 1;

  const tap = (side: 'l' | 'r', key: string) => {
    const lk = side === 'l' ? key : leftOfRight(key);
    if (matched.includes(lk)) return;
    const card = (side === 'l' ? round.left : round.right).find((c) => c.key === key)!;
    if (!sel || sel.side === side) { tone('tap'); sfx('pop'); setSel({ side, key }); say(card.label); return; }
    const l = side === 'l' ? key : sel.key;
    const r = side === 'r' ? key : sel.key;
    const ok = round.pairs[l] === r;
    record(`${kind}:${l}`, ok, (wrong[l] ?? 0) >= 2 ? 1 : 0);
    if (ok) {
      const m = [...matched, l];
      setMatched(m); setSel(null);
      const lc = round.left.find((c) => c.key === l)!, rc = round.right.find((c) => c.key === r)!;
      const text = kind === 'baby' ? L(`${lc.label.en} and ${rc.label.en.toLowerCase()}!`, `${lc.label.te}, ${rc.label.te}!`) : L(`Yes! That is the ${lc.label.en.toLowerCase()}’s shadow.`, `అవును! అది ${lc.label.te} నీడ.`);
      setMsg({ ok: true, text: tx(text), n: m.length }); say(text); sfx('snap');
      save((s) => ({ adapt: adapt(s.adapt, true, (wrong[l] ?? 0) === 0) }));
      if (m.length === round.left.length) { celebrate(); sfx('success'); save((s) => ({ played: [...new Set([...s.played, kind])] })); }
    } else {
      setWrong((w) => ({ ...w, [l]: (w[l] ?? 0) + 1 }));
      save((s) => ({ adapt: adapt(s.adapt, false) }));
      setMsg({ ok: false, n: (msg?.n ?? 0) + 1 }); say(UI.tryAgain);
      setSel({ side: 'l', key: l });
    }
  };
  const selLeft = sel ? (sel.side === 'l' ? sel.key : null) : null;
  const hintRight = selLeft && (wrong[selLeft] ?? 0) >= 2 ? round.pairs[selLeft] : null;
  const card = (side: 'l' | 'r', c: MatchRound['left'][number]) => {
    const lk = side === 'l' ? c.key : leftOfRight(c.key);
    const isM = matched.includes(lk);
    const pressed = sel?.side === side && sel.key === c.key;
    const hint = side === 'r' && hintRight === c.key;
    return (
      <button key={c.key} type="button" className={`el-pick ${c.small ? 'is-small' : ''} ${isM ? 'is-right' : ''} ${hint ? 'is-hint' : ''}`} aria-pressed={pressed} disabled={isM}
        onClick={() => tap(side, c.key)} aria-label={`${tx(c.label)}${isM ? ` ✓ ${order(lk)}` : ''}`}>
        <span className="el-pick-art"><Art id={c.art} shadow={c.shadow} /></span>
        {kind === 'baby' && <span className="el-pick-label" aria-hidden="true">{tx(c.label)}</span>}
        {isM && <span className="el-badge good" aria-hidden="true">{order(lk)}</span>}
        {pressed && <span className="el-badge sel" aria-hidden="true"><Icon name="hand" /></span>}
        {hint && <span className="el-badge hint" aria-hidden="true"><Icon name="hand" /></span>}
      </button>
    );
  };
  return (
    <div className="el-play">
      <Prompt l={prompt} />
      <div className="el-match">
        <div className="el-col" role="group" aria-label={tx(kind === 'baby' ? L('Mothers', 'అమ్మలు') : L('Pictures', 'బొమ్మలు'))}>{round.left.map((c) => card('l', c))}</div>
        <div className="el-col" role="group" aria-label={tx(kind === 'baby' ? L('Babies', 'పిల్లలు') : L('Shadows', 'నీడలు'))}>{round.right.map((c) => card('r', c))}</div>
      </div>
      {msg && !done && <EarlyFeedback ok={msg.ok} tries={msg.ok ? 0 : (selLeft ? wrong[selLeft] ?? 0 : 0)} extra={msg.text} />}
      {done && <DonePanel onAgain={onAgain} backTo="/play/sort" />}
    </div>
  );
}
