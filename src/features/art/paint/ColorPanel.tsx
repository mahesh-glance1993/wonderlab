import { useEffect, useRef, useState } from 'react';
import { Button, IconButton } from '../../../ui/kit';
import { Icon } from '../../../ui/Icon';
import { colorName, hsvToRgb, normalizeHex, parseHex, rgbToHsv, toHex } from '../engine/color';
import type { Palette } from '../engine/project';
import { shortId } from '../engine/rng';
import { ColorWheel } from './ColorWheel';

/** Built-in colour sets (always available alongside the colour wheel). */
export const PRESETS: { id: string; en: string; te: string; colors: string[] }[] = [
  { id: 'crayons', en: 'Classic Crayons', te: 'క్రేయాన్ రంగులు', colors: ['#D64545', '#F28C28', '#F2C94C', '#34A853', '#3675D3', '#8054C7', '#8B5A3C', '#20242E', '#FFFFFF'] },
  { id: 'watercolors', en: 'Soft Watercolours', te: 'మెత్తని వాటర్ కలర్స్', colors: ['#E8A5B7', '#F6BC9B', '#F4D889', '#A9C5A0', '#A5CCE8', '#B8ACE0'] },
];
export const KID_SWATCHES = ['#e53935', '#fb8c00', '#fdd835', '#9ccc65', '#43a047', '#26a69a', '#81d4fa', '#1e88e5', '#8e24aa', '#ec407a', '#6d4c41', '#ffccbc'];

function Swatch({ hex, selected, onPick, big, lang }: { hex: string; selected: boolean; onPick: (h: string) => void; big?: boolean; lang: 'en' | 'te' }) {
  const name = colorName(hex, lang);
  return (
    <button type="button" className={`art-swatch ${big ? 'big' : ''}`} style={{ background: hex }} aria-pressed={selected} aria-label={`${name} (${hex})`} title={name} onClick={() => onPick(hex)}>
      {selected && <Icon name="check" />}
    </button>
  );
}

export function ColorPanel({ color, onChange, recent, palettes, onPalettes, early, allowTyping, lang }: {
  color: string; onChange: (hex: string) => void; recent: string[]; palettes: Palette[]; onPalettes: (p: Palette[]) => void;
  early: boolean; allowTyping: boolean; lang: 'en' | 'te';
}) {
  const [hsv, setHsv] = useState(() => rgbToHsv(parseHex(color) || [0, 0, 0]));
  const [hex, setHex] = useState(color);
  const lastOut = useRef(color);
  // follow outside changes (eyedropper, swatches) without losing hue when saturation is 0
  useEffect(() => {
    if (color !== lastOut.current) { setHsv(rgbToHsv(parseHex(color) || [0, 0, 0])); lastOut.current = color; }
    setHex(color);
  }, [color]);
  const setFromHsv = (h: number, s: number, v: number) => {
    setHsv([h, s, v]);
    const out = toHex(hsvToRgb(h, s, v));
    lastOut.current = out;
    onChange(out);
  };
  const name = colorName(color, lang);
  const pick = (h: string) => { lastOut.current = ''; onChange(h); };

  if (early) {
    return (
      <div className="stack" style={{ gap: 8 }}>
        <div className="art-current"><span className="art-chip" style={{ background: color }} aria-hidden="true" /><b>{name}</b></div>
        <div className="art-sub">{lang === 'te' ? 'ఏ రంగైనా ఎంచుకో' : 'Pick any colour'}</div>
        <ColorWheel hsv={hsv} onChange={setFromHsv} size={230} lang={lang} />
        <div className="art-swatches early" role="group" aria-label="Colours">
          {['#000000', '#ffffff', ...KID_SWATCHES].map((h) => <Swatch key={h} hex={h} big selected={h === color} onPick={pick} lang={lang} />)}
        </div>
        {PRESETS.map((ps) => (
          <div key={ps.id}>
            <div className="art-sub">{lang === 'te' ? ps.te : ps.en}</div>
            <div className="art-swatches early" role="group" aria-label={lang === 'te' ? ps.te : ps.en}>{ps.colors.map((h) => <Swatch key={h} hex={h} big selected={h.toLowerCase() === color.toLowerCase()} onPick={pick} lang={lang} />)}</div>
          </div>
        ))}
      </div>
    );
  }
  const addToPalette = (pid?: string) => {
    if (!palettes.length || !pid) { onPalettes([...palettes, { id: shortId(), name: `Palette ${palettes.length + 1}`, colors: [color] }]); return; }
    onPalettes(palettes.map((p) => (p.id === pid && !p.colors.includes(color) ? { ...p, colors: [...p.colors, color].slice(-24) } : p)));
  };
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="art-current"><span className="art-chip" style={{ background: color }} aria-hidden="true" /><b>{name}</b><span className="muted">{color}</span></div>
      <ColorWheel hsv={hsv} onChange={setFromHsv} size={240} lang={lang} />
      <div className="art-swatches" role="group" aria-label="Quick colours">
        {['#000000', '#ffffff', ...KID_SWATCHES].map((h) => <Swatch key={h} hex={h} selected={h === color} onPick={pick} lang={lang} />)}
      </div>
      {PRESETS.map((ps) => (
        <div key={ps.id}>
          <div className="art-sub">{lang === 'te' ? ps.te : ps.en}</div>
          <div className="art-swatches" role="group" aria-label={ps.en}>{ps.colors.map((h) => <Swatch key={h} hex={h} selected={h.toLowerCase() === color.toLowerCase()} onPick={pick} lang={lang} />)}</div>
        </div>
      ))}
      {allowTyping && (
        <form className="row" style={{ gap: 6, flexWrap: 'nowrap' }} onSubmit={(e) => { e.preventDefault(); const n = normalizeHex(hex); if (n) pick(n); else setHex(color); }}>
          <label htmlFor="art-hex" className="muted" style={{ fontWeight: 800 }}>HEX</label>
          <input id="art-hex" className="input" style={{ minHeight: 40, padding: '4px 10px' }} value={hex} maxLength={7} spellCheck={false} onChange={(e) => setHex(e.target.value)} onBlur={() => { const n = normalizeHex(hex); if (n && n !== color) pick(n); else setHex(color); }} aria-describedby="art-hex-hint" />
          <span id="art-hex-hint" className="sr-only">Type a colour like #3366ff and press Enter</span>
        </form>
      )}
      {recent.length > 0 && (
        <div>
          <div className="art-sub">Recent colours</div>
          <div className="art-swatches" role="group" aria-label="Recent colours">{recent.map((h) => <Swatch key={h} hex={h} selected={h === color} onPick={pick} lang={lang} />)}</div>
        </div>
      )}
      <div>
        <div className="art-sub">My palettes</div>
        {palettes.map((p) => (
          <div key={p.id} className="art-palette">
            <div className="row" style={{ gap: 4 }}>
              <span className="muted" style={{ fontWeight: 800, fontSize: '.85rem' }}>{p.name}</span>
              <span className="spacer" />
              <IconButton className="small ghost" icon="plus" label={`Add current colour to ${p.name}`} onClick={() => addToPalette(p.id)} />
              <IconButton className="small ghost" icon="trash" label={`Delete ${p.name}`} onClick={() => onPalettes(palettes.filter((x) => x.id !== p.id))} />
            </div>
            <div className="art-swatches" role="group" aria-label={p.name}>{p.colors.map((h) => <Swatch key={h} hex={h} selected={h === color} onPick={pick} lang={lang} />)}</div>
          </div>
        ))}
        <Button small icon="plus" onClick={() => addToPalette()}>{palettes.length ? 'New palette' : 'Save colour to a palette'}</Button>
      </div>
    </div>
  );
}
