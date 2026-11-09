// Small SVG drawings shared by the games. Colours always come with a texture and a text label,
// so nothing relies on colour alone.
import { useId } from 'react';
import type { ShapeKind, ShapeColor } from '../gen/shapes';
import type { CountObject } from '../gen/counting';

export const FILL: Record<ShapeColor, string> = { red: '#D9695C', blue: '#5C8FC9', yellow: '#E8C14E', green: '#6BAF7B' };

function polygon(n: number, r = 40, rot = -90): string {
  return Array.from({ length: n }, (_, i) => {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(' ');
}
function shapeEl(shape: ShapeKind, props: Record<string, string>) {
  switch (shape) {
    case 'circle': return <circle cx="50" cy="50" r="40" {...props} />;
    case 'square': return <rect x="14" y="14" width="72" height="72" rx="4" {...props} />;
    case 'rectangle': return <rect x="6" y="26" width="88" height="48" rx="4" {...props} />;
    case 'triangle': return <polygon points="50,8 92,88 8,88" {...props} />;
    case 'rhombus': return <polygon points="50,6 86,50 50,94 14,50" {...props} />;
    case 'trapezium': return <polygon points="28,22 72,22 94,80 6,80" {...props} />;
    case 'pentagon': return <polygon points={polygon(5, 44)} {...props} />;
    case 'hexagon': return <polygon points={polygon(6, 44, 0)} {...props} />;
    case 'octagon': return <polygon points={polygon(8, 44, 22.5)} {...props} />;
  }
}

/** A shape with colour fill and a colour-specific texture (solid / stripes / dots / checks). */
export function ShapeSvg({ shape, color, size = 64, rot = 0, label }: { shape: ShapeKind; color: ShapeColor; size?: number; rot?: number; label?: string }) {
  const id = useId().replace(/:/g, '');
  const tex = color === 'blue' ? `url(#st${id})` : color === 'yellow' ? `url(#dt${id})` : color === 'green' ? `url(#ck${id})` : 'none';
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} className="gm-shape">
      <defs>
        <pattern id={`st${id}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="10" fill="rgba(255,255,255,.55)" /></pattern>
        <pattern id={`dt${id}`} width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="2.4" fill="rgba(60,40,0,.45)" /></pattern>
        <pattern id={`ck${id}`} width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 0h6v6H0zM6 6h6v6H6z" fill="rgba(255,255,255,.35)" /></pattern>
      </defs>
      <g transform={`rotate(${rot} 50 50)`}>
        {shapeEl(shape, { fill: FILL[color], stroke: '#2F3A35', strokeWidth: '3', strokeLinejoin: 'round' })}
        {tex !== 'none' && shapeEl(shape, { fill: tex, stroke: 'none' })}
      </g>
    </svg>
  );
}

const OBJ_COLOR: Record<CountObject, string> = { apple: '#D9695C', ball: '#5C8FC9', fish: '#E39B4E', flower: '#C77DB5', star: '#E8C14E', leaf: '#6BAF7B' };
/** Friendly countable objects. */
export function CountSvg({ object, size = 48 }: { object: CountObject; size?: number }) {
  const c = OBJ_COLOR[object];
  const stroke = { stroke: '#2F3A35', strokeWidth: 3, strokeLinejoin: 'round' as const };
  let body;
  switch (object) {
    case 'apple': body = <><path d="M50 30c-10-8-34-6-34 20 0 22 16 38 26 38 4 0 6-2 8-2s4 2 8 2c10 0 26-16 26-38 0-26-24-28-34-20z" fill={c} {...stroke} /><path d="M50 30c0-8 4-14 10-18" fill="none" {...stroke} /><path d="M54 20c6-6 16-6 18-2-6 6-14 6-18 2z" fill="#6BAF7B" {...stroke} /></>; break;
    case 'ball': body = <><circle cx="50" cy="50" r="38" fill={c} {...stroke} /><path d="M14 44c24 10 48 10 72 0M20 70c20-10 40-10 60 0" fill="none" stroke="#fff" strokeWidth="5" /></>; break;
    case 'fish': body = <><path d="M14 50c14-22 44-26 62 0-18 26-48 22-62 0z" fill={c} {...stroke} /><path d="M76 50l16-14v28z" fill={c} {...stroke} /><circle cx="32" cy="46" r="4" fill="#2F3A35" /></>; break;
    case 'flower': body = <>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="50" cy="26" rx="13" ry="20" fill={c} {...stroke} transform={`rotate(${a} 50 50)`} />)}<circle cx="50" cy="50" r="12" fill="#E8C14E" {...stroke} /></>; break;
    case 'star': body = <path d="M50 8l12 26 28 3-21 19 6 28-25-15-25 15 6-28-21-19 28-3z" fill={c} {...stroke} />; break;
    case 'leaf': body = <><path d="M16 84C16 40 44 16 88 14 86 58 62 84 16 84z" fill={c} {...stroke} /><path d="M16 84 70 30" fill="none" {...stroke} /></>; break;
  }
  return <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" className="gm-obj">{body}</svg>;
}

/** Fraction bar or circle: `num` of `den` equal parts shaded (with hatching, not colour alone). */
export function FracPicture({ kind, num, den, size = 120 }: { kind: 'bar' | 'circle'; num: number; den: number; size?: number }) {
  const id = useId().replace(/:/g, '');
  const shade = `url(#h${id})`;
  const defs = (
    <defs>
      <pattern id={`h${id}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill="#8ECAE6" /><rect width="3" height="8" fill="#3E7CA6" />
      </pattern>
    </defs>
  );
  const label = `${num} of ${den} equal parts shaded`;
  if (kind === 'bar') {
    // values above 1 draw as several whole bars
    const bars = Math.max(1, Math.ceil(num / den));
    const w = 100 / den;
    return (
      <svg viewBox={`0 0 100 ${bars * 26}`} width={size} height={(size * bars * 26) / 100} role="img" aria-label={label} className="gm-frac-pic">
        {defs}
        {Array.from({ length: bars }, (_, b) => Array.from({ length: den }, (_, i) => (
          <rect key={`${b}-${i}`} x={i * w + 1} y={b * 26 + 2} width={w - 2} height={22} rx="2" fill={b * den + i < num ? shade : '#FBF8F1'} stroke="#2F3A35" strokeWidth="1.5" />
        )))}
      </svg>
    );
  }
  const circles = Math.max(1, Math.ceil(num / den));
  return (
    <span className="gm-pies" role="img" aria-label={label}>
      {Array.from({ length: circles }, (_, c) => (
        <svg key={c} viewBox="0 0 100 100" width={size * 0.6} height={size * 0.6} aria-hidden="true">
          {defs}
          {Array.from({ length: den }, (_, i) => {
            const a0 = (i / den) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / den) * 2 * Math.PI - Math.PI / 2;
            const p = den === 1
              ? 'M50 4a46 46 0 1 1 0 92a46 46 0 1 1 0-92z'
              : `M50 50L${50 + 46 * Math.cos(a0)} ${50 + 46 * Math.sin(a0)}A46 46 0 ${1 / den > 0.5 ? 1 : 0} 1 ${50 + 46 * Math.cos(a1)} ${50 + 46 * Math.sin(a1)}Z`;
            return <path key={i} d={p} fill={c * den + i < num ? shade : '#FBF8F1'} stroke="#2F3A35" strokeWidth="2" />;
          })}
        </svg>
      ))}
    </span>
  );
}
