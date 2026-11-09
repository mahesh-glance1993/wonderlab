// A full colour circle: hue goes around the circle, colour strength grows from the white centre to the
// edge, and a Light ↔ Dark slider sets brightness. Any colour can be chosen by tapping or dragging
// (finger, mouse or pen), or with the keyboard (arrows = hue/strength, PageUp/PageDown = brightness).
import { useEffect, useRef } from 'react';
import { hsvToRgb, toHex } from '../engine/color';

export type HSV = [number, number, number];

/** Colour at a point of the wheel (x, y relative to centre, r = radius). Null outside the circle. */
export function wheelColor(x: number, y: number, r: number, v: number): HSV | null {
  const d = Math.hypot(x, y);
  if (d > r * 1.04) return null;
  const h = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return [h, Math.min(1, d / r), v];
}
/** Where a colour sits on the wheel (inverse of wheelColor). */
export function wheelPos(h: number, s: number, r: number): [number, number] {
  const a = (h * Math.PI) / 180;
  return [Math.cos(a) * s * r, Math.sin(a) * s * r];
}

export function ColorWheel({ hsv, onChange, size = 220, lang }: { hsv: HSV; onChange: (h: number, s: number, v: number) => void; size?: number; lang: 'en' | 'te' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [h, s, v] = hsv;
  const r = size / 2;

  // paint the disc for the current brightness
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), px = Math.round(size * dpr);
    cv.width = px; cv.height = px;
    const g = cv.getContext('2d');
    if (!g) return;
    const img = g.createImageData(px, px), R = px / 2;
    for (let y = 0; y < px; y++) {
      for (let x = 0; x < px; x++) {
        const dx = x + 0.5 - R, dy = y + 0.5 - R, d = Math.hypot(dx, dy);
        if (d > R) continue;
        const [cr, cg, cb] = hsvToRgb(((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360, d / R, v);
        const i = (y * px + x) * 4, edge = Math.min(1, R - d); // soft anti-aliased rim
        img.data[i] = cr; img.data[i + 1] = cg; img.data[i + 2] = cb; img.data[i + 3] = Math.round(255 * edge);
      }
    }
    g.putImageData(img, 0, 0);
  }, [size, v]);

  const pick = (e: React.PointerEvent) => {
    if (e.type === 'pointermove' && !e.buttons) return;
    const b = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - b.left) / b.width) * size - r, y = ((e.clientY - b.top) / b.height) * size - r;
    const c = wheelColor(x, y, r, v);
    if (!c) return;
    if (e.type === 'pointerdown') (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    onChange(c[0], c[1], c[2]);
  };
  const key = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 15 : 5;
    const m: Record<string, () => void> = {
      ArrowLeft: () => onChange((h - step + 360) % 360, s, v),
      ArrowRight: () => onChange((h + step) % 360, s, v),
      ArrowUp: () => onChange(h, Math.min(1, s + 0.05), v),
      ArrowDown: () => onChange(h, Math.max(0, s - 0.05), v),
      PageUp: () => onChange(h, s, Math.min(1, v + 0.05)),
      PageDown: () => onChange(h, s, Math.max(0, v - 0.05)),
    };
    if (m[e.key]) { e.preventDefault(); m[e.key](); }
  };
  const [mx, my] = wheelPos(h, s, r);
  const hex = toHex(hsvToRgb(h, s, v));
  const te = lang === 'te';

  return (
    <div className="art-wheel-wrap">
      <div
        className="art-wheel" style={{ width: size, height: size }}
        role="slider" tabIndex={0}
        aria-label={te ? 'రంగుల చక్రం' : 'Colour wheel'}
        aria-valuemin={0} aria-valuemax={359} aria-valuenow={Math.round(h)}
        aria-valuetext={`${te ? 'రంగు' : 'Hue'} ${Math.round(h)}°, ${te ? 'గాఢత' : 'strength'} ${Math.round(s * 100)}%, ${hex}`}
        onPointerDown={pick} onPointerMove={pick} onKeyDown={key}
      >
        <canvas ref={canvasRef} style={{ width: size, height: size }} aria-hidden="true" />
        <i style={{ left: r + mx, top: r + my, background: hex }} aria-hidden="true" />
      </div>
      <label className="art-range art-light">
        <span>{te ? 'వెలుగు ↔ చీకటి' : 'Light ↔ Dark'}</span>
        <input
          type="range" min={5} max={100} value={Math.round(v * 100)} className="art-bright"
          style={{ background: `linear-gradient(to left, #000, ${toHex(hsvToRgb(h, s, 1))})` }}
          aria-label={te ? 'వెలుగు' : 'Brightness'}
          onChange={(e) => onChange(h, s, Number(e.target.value) / 100)}
        />
      </label>
    </div>
  );
}
