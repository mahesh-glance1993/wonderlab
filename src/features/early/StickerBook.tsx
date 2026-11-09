// Sticker Book: every sticker earned in the Daily Surprise and the newer games, grouped by game.
// Stickers not yet earned show as grey shapes with a "play to earn" button for their game.
import { useNavigate } from 'react-router-dom';
import { sfx } from '../../lib/sfx';
import { Page } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { L } from './data/pictures';
import { Prompt, useLastActivity, useTx } from './common';
import { StickerArt, useStickers } from './actCommon';
import { STICKERS, STICKER_SOURCES, dayKey, stickerCount, streak, type StickerSource } from './activities';

const T = {
  title: L('Sticker Book', 'స్టిక్కర్ పుస్తకం'),
  intro: L('Your stickers! Play games to fill the book.', 'నీ స్టిక్కర్లు! ఆటలు ఆడి పుస్తకం నింపు.'),
  locked: L('Not yet earned', 'ఇంకా రాలేదు'),
  play: L('Play', 'ఆడు'),
  streak: L('Daily Surprise days in a row', 'వరుసగా రోజూ ఆశ్చర్యం'),
};
const ROUTES: Record<StickerSource, string> = {
  daily: '/play/daily', memory: '/play/memory', mix: '/play/colours', rhymes: '/play/rhymes', opposites: '/play/opposites', patterns: '/play/patterns', safari: '/play/safari',
};

export default function StickerBook() {
  const { tx, say } = useTx();
  const nav = useNavigate();
  useLastActivity('/play/stickers', T.title);
  const { st } = useStickers();
  const total = STICKERS.length;
  const have = stickerCount(st);
  const days = streak(st.days, dayKey(new Date()));
  const sources = Object.keys(STICKER_SOURCES) as StickerSource[];
  return (
    <Page title={tx(T.title)} back="/play" fullscreen>
      <Prompt l={T.intro} />
      <div className="el-book-stats">
        <p><Icon name="star" /><strong>{have}</strong> / {total}</p>
        {days > 0 && <p><Icon name="sun" />{tx(T.streak)}: <strong>{days}</strong></p>}
      </div>
      <div className="el-meter" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={have} aria-label={tx(T.title)}>
        <span style={{ width: `${Math.round((have / total) * 100)}%` }} />
      </div>
      {sources.map((src) => {
        const list = STICKERS.filter((s) => s.source === src);
        const got = list.filter((s) => st.earned[s.id]).length;
        return (
          <section key={src} className="el-book-page" aria-labelledby={`book-${src}`}>
            <div className="el-book-head">
              <h2 id={`book-${src}`}>{tx(STICKER_SOURCES[src])} <span className="el-book-count">{got} / {list.length}</span></h2>
              {got < list.length && <button type="button" className="btn el-ctl" onClick={() => nav(ROUTES[src])}><Icon name="play" />{tx(T.play)}</button>}
            </div>
            <ul className="el-book-grid">
              {list.map((s) => {
                const earned = !!st.earned[s.id];
                return (
                  <li key={s.id}>
                    <button type="button" className={`el-book-item ${earned ? '' : 'is-locked'}`}
                      aria-label={earned ? tx(s.name) : `${tx(T.locked)} (${tx(STICKER_SOURCES[src])})`}
                      onClick={() => { if (earned) { sfx('sparkle'); say(s.name); } else { sfx('pop'); say(L(`Play ${STICKER_SOURCES[src].en} to earn this sticker.`, `ఈ స్టిక్కర్ కోసం ${STICKER_SOURCES[src].te} ఆడు.`)); } }}>
                      <StickerArt s={s} locked={!earned} />
                      <span className="el-book-name" aria-hidden="true">{earned ? tx(s.name) : '?'}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </Page>
  );
}
