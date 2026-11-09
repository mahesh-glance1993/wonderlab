import { useEffect, useRef, useState } from 'react';
import { Button, IconButton } from '../../../ui/kit';
import { Icon } from '../../../ui/Icon';
import { colorName, hsvToRgb, normalizeHex, parseHex, rgbToHsv, toHex } from '../engine/color';
import type { Palette } from '../engine/project';
import { shortId } from '../engine/rng';

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
  const padRef = useRef<HTMLDivElement>(null);
  const padPointer = (e: React.PointerEvent) => {
    if (e.type === 'pointerdown') (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    if (e.type === 'pointermove' && !e.buttons) return;
    const r = padRef.current!.getBoundingClientRect();
    const s = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), v = Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height));
    setFromHsv(hsv[0], s, v);
  };
  const name = colorName(color, lang);
  const pick = (h: string) => { lastOut.current = ''; onChange(h); };

  if (early) {
    return (
      <div className="stack" style={{ gap: 8 }}>
        <div className="art-current"><span className="art-chip" style={{ background: color }} aria-hidden="true" /><b>{name}</b></div>
        <div className="art-swatches early" role="group" aria-label="Colours">
          {['#000000', '#ffffff', ...KID_SWATCHES].map((h) => <Swatch key={h} hex={h} big selected={h === color} onPick={pick} lang={lang} />)}
        </div>
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
      <div className="art-swatches" role="group" aria-label="Quick colours">
        {['#000000', '#ffffff', ...KID_SWATCHES].map((h) => <Swatch key={h} hex={h} selected={h === color} onPick={pick} lang={lang} />)}
      </div>
      <div
        ref={padRef} className="art-svpad" role="presentation"
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv[0]}, 100%, 50%))` }}
        onPointerDown={padPointer} onPointerMove={padPointer}
      >
        <i style={{ left: `${hsv[1] * 100}%`, top: `${(1 - hsv[2]) * 100}%` }} />
      </div>
      <label className="art-range">Hue <span>{Math.round(hsv[0])}°</span>
        <input type="range" min={0} max={359} value={Math.round(hsv[0])} className="hue" onChange={(e) => setFromHsv(Number(e.target.value), hsv[1], hsv[2])} />
      </label>
      <label className="art-range">Saturation <span>{Math.round(hsv[1] * 100)}%</span>
        <input type="range" min={0} max={100} value={Math.round(hsv[1] * 100)} onChange={(e) => setFromHsv(hsv[0], Number(e.target.value) / 100, hsv[2])} />
      </label>
      <label className="art-range">Brightness <span>{Math.round(hsv[2] * 100)}%</span>
        <input type="range" min={0} max={100} value={Math.round(hsv[2] * 100)} onChange={(e) => setFromHsv(hsv[0], hsv[1], Number(e.target.value) / 100)} />
      </label>
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
