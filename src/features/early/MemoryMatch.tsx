// Memory Match: turn over two cards at a time and find the pairs. Animal and vehicle cards play their
// sound when turned over; other cards say their name. Tap, click, or use arrow keys + Enter.
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useApp } from '../../lib/app';
import { sfx } from '../../lib/sfx';
import { celebrate, Page } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { Art } from './art';
import { PIC, L } from './data/pictures';
import { BackRow, BigTile, DonePanel, Prompt, useActivity, useBadge, useLastActivity, useNarrate, useRecord, useTx, itemSfx, playItemSfx } from './common';
import { LevelPicker, StickerReveal, useStickers } from './actCommon';
import {
  MEMORY_SIZES, MEMORY_SIZE_IDS, MEMORY_THEMES, gridMove, isFaceUp, memoryDeck, memoryDone, memoryFlip, memoryHide, memoryStart, memoryStars,
  type MemorySize, type MemoryTheme, type MemState, type Sticker,
} from './activities';
import { newSeed, rng } from './logicCore';

const T = {
  title: L('Memory Match', 'జ్ఞాపకాల ఆట'),
  pick: L('Find the pairs! Pick some cards.', 'జతలు కనిపెట్టు! కార్డులు ఎంచుకో.'),
  how: L('Turn over two cards. Can you find two the same?', 'రెండు కార్డులు తిప్పు. ఒకేలాంటి రెండు కనిపెట్టగలవా?'),
  size: L('How many cards?', 'ఎన్ని కార్డులు?'),
  notSame: L('Not the same. Try to remember them!', 'ఒకటి కాదు. గుర్తు పెట్టుకో!'),
  card: L('Card', 'కార్డు'), faceDown: L('face down', 'బోర్లా ఉంది'), found: L('found', 'దొరికింది'),
  moves: L('Turns', 'ప్రయత్నాలు'), pairs: L('Pairs', 'జతలు'),
};
interface MemSave { size: MemorySize; best: Partial<Record<MemorySize, number>>; games: number }
const INIT: MemSave = { size: 'small', best: {}, games: 0 };

export default function MemoryMatch() {
  const { tx } = useTx();
  const { lang } = useApp();
  useLastActivity('/play/memory', T.title);
  const [st, save] = useActivity<MemSave>('memory', INIT);
  const [theme, setTheme] = useState<MemoryTheme | null>(null);
  const [run, setRun] = useState(0);
  const size: MemorySize = MEMORY_SIZES[st.size] ? st.size : 'small';
  return (
    <Page title={tx(T.title)} back="/play" fullscreen>
      {theme && <BackRow onBack={() => setTheme(null)} />}
      {!theme && (
        <>
          <Prompt l={T.pick} />
          <LevelPicker label={T.size} options={MEMORY_SIZE_IDS.map((id) => ({ id, name: MEMORY_SIZES[id].name }))} value={size} onChange={(v) => save({ size: v })} />
          <div className="el-grid el-grid-4">
            {MEMORY_THEMES.map((t) => <BigTile key={t.id} art={t.cover} title={t.title} onGo={() => { setTheme(t.id); setRun((x) => x + 1); }} />)}
          </div>
        </>
      )}
      {theme && <Board key={`${theme}-${size}-${run}-${lang}`} theme={theme} size={size} best={st.best[size]} onAgain={() => setRun((x) => x + 1)}
        onFinish={(moves) => save((s) => ({ games: s.games + 1, best: { ...s.best, [size]: Math.min(moves, s.best[size] ?? Infinity) } }))} />}
    </Page>
  );
}

function Board({ theme, size, best, onAgain, onFinish }: { theme: MemoryTheme; size: MemorySize; best?: number; onAgain: () => void; onFinish: (moves: number) => void }) {
  const { tx, say } = useTx();
  const record = useRecord('memory');
  const badge = useBadge();
  const { give } = useStickers();
  const [seed] = useState(newSeed);
  const [s, setS] = useState<MemState>(() => memoryStart(memoryDeck(rng(seed), size, theme)));
  const [focus, setFocus] = useState(0);
  const [live, setLive] = useState('');
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [finished, setFinished] = useState(false);
  const hideTimer = useRef<number | undefined>(undefined);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const { cols, pairs } = MEMORY_SIZES[size];
  useNarrate(T.how, 'start');
  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  const flip = (i: number) => {
    const { s: next, event } = memoryFlip(s, i);
    if (event === 'ignored') return;
    const card = s.cards[i];
    const name = PIC[card.pair] ? L(PIC[card.pair].en, PIC[card.pair].te) : L(card.pair, card.pair);
    setS(next);
    setFocus(i);
    // the card's own sound for animals/vehicles; otherwise its name
    if (itemSfx(card.pair)) playItemSfx(card.pair); else { sfx('whoosh'); say(name); }
    if (event === 'first') { setLive(tx(name)); return; }
    if (event === 'match') {
      window.setTimeout(() => sfx('sparkle'), 350);
      const msg = L(`Two of the same: ${name.en.toLowerCase()}!`, `రెండూ ఒకటే: ${name.te}!`);
      setLive(tx(msg));
      window.setTimeout(() => say(msg), itemSfx(card.pair) ? 900 : 700);
      if (memoryDone(next)) {
        hideTimer.current = window.setTimeout(() => {
          setFinished(true); celebrate(); sfx('success');
          say(L(`You found all the pairs in ${next.moves} turns!`, `${next.moves} ప్రయత్నాల్లో అన్ని జతలు కనిపెట్టావు!`));
          record(`${theme}:${size}`, true, memoryStars(next.moves, pairs) === 1 ? 1 : 0);
          onFinish(next.moves);
          setSticker(give('memory'));
          if (size === 'large') void badge('play:memory-large', L('Super memory', 'అద్భుత జ్ఞాపకశక్తి'));
        }, 1400);
      }
      return;
    }
    setLive(`${tx(name)}. ${tx(T.notSame)}`);
    hideTimer.current = window.setTimeout(() => { setS((x) => memoryHide(x)); }, 1300);
    window.setTimeout(() => say(T.notSame), 800);
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = gridMove(i, e.key, cols, s.cards.length);
    if (n !== i || ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      setFocus(n);
      btns.current[n]?.focus();
    }
  };

  if (finished) {
    const stars = memoryStars(s.moves, pairs);
    return (
      <DonePanel onAgain={onAgain} backTo="/play/memory">
        <p className="el-stars" role="img" aria-label={`${stars} / 3`}>{[1, 2, 3].map((k) => <span key={k} className={k <= stars ? 'on' : ''}><Icon name="star" /></span>)}</p>
        <p>{tx(T.moves)}: {s.moves}{best ? ` · ${tx(L('Best', 'ఉత్తమం'))}: ${Math.min(best, s.moves)}` : ''}</p>
        <StickerReveal s={sticker} />
      </DonePanel>
    );
  }
  return (
    <div className="el-play">
      <Prompt l={T.how} />
      <div className="el-memo-stats" aria-hidden="true">
        <span>{tx(T.pairs)}: {s.matched.length} / {pairs}</span><span>{tx(T.moves)}: {s.moves}</span>
      </div>
      <div className={`el-memo c${cols}`} role="group" aria-label={`${tx(T.title)}: ${s.matched.length} / ${pairs} ${tx(T.pairs)}`}>
        {s.cards.map((c, i) => {
          const up = isFaceUp(s, i);
          const done = s.matched.includes(c.pair);
          const name = PIC[c.pair] ? tx(L(PIC[c.pair].en, PIC[c.pair].te)) : c.pair;
          return (
            <button key={c.idx} ref={(el) => { btns.current[i] = el; }} type="button" tabIndex={i === focus ? 0 : -1}
              className={`el-memo-card ${up ? 'is-up' : ''} ${done ? 'is-done' : ''}`} onClick={() => flip(i)} onKeyDown={(e) => onKey(e, i)} onFocus={() => setFocus(i)}
              aria-label={`${tx(T.card)} ${i + 1}: ${up ? `${name}${done ? `, ${tx(T.found)}` : ''}` : tx(T.faceDown)}`} aria-disabled={done || undefined}>
              <span className="el-memo-inner" aria-hidden="true">
                <span className="el-memo-back"><Icon name="star" /></span>
                <span className="el-memo-front"><Art id={c.art} />{done && <span className="el-badge good"><Icon name="check" /></span>}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" role="status" aria-live="polite">{live}</p>
    </div>
  );
}
