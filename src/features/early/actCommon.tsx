// Shared helpers for the newer Play & Learn activities: optional sound names, reduced motion,
// stickers (earned at the end of a game, kept in the Sticker Book), and a level picker.
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { sfx, SFX_NAMES, type SfxHandle, type SfxName } from '../../lib/sfx';
import { Icon } from '../../ui/Icon';
import { ActArt } from './activityArt';
import { L } from './data/pictures';
import { useActivity, useBadge, useTx } from './common';
import { STICKER_INIT, dayKey, earnSticker, nextSticker, recordDay, stickerCount, type Sticker, type StickerSource, type StickerState } from './activities';

/** Names the sound library knows right now (it may grow; unknown names are simply silent). */
export const SFX_SET: ReadonlySet<string> = new Set(SFX_NAMES as readonly string[]);
export const hasSfx = (name: string) => SFX_SET.has(name);
/** Play a sound by name; null when muted or the sound doesn't exist (treated as silent). */
export function playSfx(name: string): SfxHandle | null {
  if (!hasSfx(name)) return null;
  return sfx(name as SfxName);
}

/** True when motion should be removed (app setting or the OS preference, mirrored on <html>). */
export function useReduced() {
  const { prefs } = useApp();
  return prefs.reduceMotion || (typeof document !== 'undefined' && document.documentElement.classList.contains('reduce-motion'));
}

export const STICKER_BADGES: { id: string; at: number; name: L }[] = [
  { id: 'play:stickers-5', at: 5, name: L('Sticker starter', 'స్టిక్కర్ల మొదలు') },
  { id: 'play:stickers-15', at: 15, name: L('Sticker collector', 'స్టిక్కర్ల సేకర్త') },
  { id: 'play:stickers-all', at: 30, name: L('Sticker book full', 'స్టిక్కర్ పుస్తకం నిండింది') },
];

/** Sticker book state + `give(source)` which earns the next sticker for that game (null when all are collected). */
export function useStickers() {
  const [st, save] = useActivity<StickerState>('stickers', STICKER_INIT);
  const badge = useBadge();
  const give = useCallback((source: StickerSource, opts?: { day?: boolean }): Sticker | null => {
    const key = dayKey(new Date());
    const s = nextSticker(st, source, key);
    save((x) => {
      let n = s ? earnSticker(x, s.id, Date.now()) : x;
      if (opts?.day) n = recordDay(n, key);
      return n;
    });
    if (s) {
      const count = stickerCount(st) + 1;
      void (async () => { for (const b of STICKER_BADGES) if (count >= b.at) await badge(b.id, b.name); })();
    }
    return s;
  }, [st, save, badge]);
  return { st, give };
}

/** A round sticker: picture on a coloured disc with a white rim. Locked ones are a grey silhouette. */
export function StickerArt({ s, locked, label }: { s: Sticker; locked?: boolean; label?: string }) {
  return (
    <span className={`el-sticker ${locked ? 'is-locked' : ''}`} style={locked ? undefined : { background: s.bg }} role={label ? 'img' : undefined} aria-label={label}>
      <ActArt id={s.art} v={s.v} className={locked ? 'el-shadow' : ''} />
    </span>
  );
}

/** "You got a sticker!" panel shown inside DonePanel. */
export function StickerReveal({ s }: { s: Sticker | null }) {
  const { tx } = useTx();
  const nav = useNavigate();
  if (!s) return null;
  return (
    <div className="el-sticker-reveal">
      <StickerArt s={s} label={tx(s.name)} />
      <p><strong>{tx(L('New sticker!', 'కొత్త స్టిక్కర్!'))}</strong> {tx(s.name)}</p>
      <button type="button" className="btn el-big" onClick={() => nav('/play/stickers')}><Icon name="book" />{tx(L('Sticker book', 'స్టిక్కర్ పుస్తకం'))}</button>
    </div>
  );
}

/** Level / option buttons (pressed state shown with a tick and border, not colour alone). */
export function LevelPicker<T extends string | number>({ options, value, onChange, label }: { options: { id: T; name: L }[]; value: T; onChange: (v: T) => void; label: L }) {
  const { tx, say } = useTx();
  return (
    <div className="el-levels" role="group" aria-label={tx(label)}>
      {options.map((o) => (
        <button key={String(o.id)} type="button" className={`btn el-ctl ${o.id === value ? 'is-on' : ''}`} aria-pressed={o.id === value} onClick={() => { say(o.name); onChange(o.id); }}>
          {o.id === value && <Icon name="check" />}{tx(o.name)}
        </button>
      ))}
    </div>
  );
}
