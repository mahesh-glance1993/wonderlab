// Original SVG drawings used by the newer Play & Learn activities (opposites, nature sounds).
// Each drawing lives in a -50..50 box, like ./art.tsx; ids start with "x-". Other ids fall back to <Art>.
import type { ReactElement } from 'react';
import { Art } from './art';

const K = '#3A3530';
const o = { stroke: K, strokeWidth: 2.2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
type Draw = (v?: string) => ReactElement;

const cloud = (fill: string, y = 0) => <path transform={`translate(0 ${y})`} d="M-36 10 C-50 10 -50 -12 -34 -12 C-34 -32 -10 -36 -4 -22 C2 -40 32 -36 30 -14 C48 -16 50 10 34 10Z" fill={fill} {...o} />;
const birdShape = (x: number, y: number, s = 1, fill = '#6B8FB8') => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse rx={10} ry={7} fill={fill} {...o} strokeWidth={1.6} /><circle cx={8} cy={-5} r={5} fill={fill} {...o} strokeWidth={1.6} />
    <path d="M12 -5 l6 2 -6 2z" fill="#E8A33A" /><circle cx={9} cy={-6} r={1.2} fill={K} /><path d="M-10 0 l-8 -4 2 6z" fill={fill} {...o} strokeWidth={1.4} />
  </g>
);

const X: Record<string, Draw> = {
  'x-hot': () => (
    <g>
      {[-14, 0, 14].map((x, i) => <path key={i} className="el-steam" d={`M${x} -18 q-6 -8 0 -16 q6 -8 0 -16`} stroke="#B9B2AA" strokeWidth={3} fill="none" strokeLinecap="round" />)}
      <path d="M-30 -14 H24 L18 34 Q16 40 10 40 H-16 Q-22 40 -24 34Z" fill="#D9534F" {...o} />
      <path d="M24 -2 Q42 -2 40 14 Q38 26 20 24" stroke={K} strokeWidth={5} fill="none" />
      <ellipse cx={-3} cy={-14} rx={27} ry={4} fill="#8A4A26" {...o} strokeWidth={1.6} />
    </g>
  ),
  'x-cold': () => (
    <g>
      <path d="M-14 6 L0 46 L14 6Z" fill="#D9A86A" {...o} /><path d="M-8 16 l14 8 M-10 24 l12 8 M8 14 l-12 12" stroke="#B5844C" strokeWidth={1.6} />
      <circle cx={-8} cy={-6} r={14} fill="#F2B8CC" {...o} /><circle cx={8} cy={-6} r={14} fill="#F7F4EC" {...o} /><circle cx={0} cy={-20} r={14} fill="#B8E0F2" {...o} />
      <g stroke="#5DA9DA" strokeWidth={2.4} strokeLinecap="round">{[0, 60, 120].map((a) => <path key={a} transform={`translate(32 -32) rotate(${a})`} d="M0 -10 V10 M-3 -7 L0 -4 L3 -7 M-3 7 L0 4 L3 7" />)}</g>
    </g>
  ),
  'x-sky': (v) => v === 'night'
    ? <g><rect x={-46} y={-46} width={92} height={92} rx={16} fill="#26304F" {...o} /><path d="M10 -30 A20 20 0 1 0 26 4 A16 16 0 1 1 10 -30Z" fill="#F2D16B" {...o} strokeWidth={1.6} />
      {[[-30, -26], [-20, 4], [-34, 22], [20, 26], [34, -36], [-6, -34]].map(([x, y], i) => <path key={i} transform={`translate(${x} ${y})`} d="M0 -4 L1.2 -1.2 4 0 1.2 1.2 0 4 -1.2 1.2 -4 0 -1.2 -1.2Z" fill="#FFF2B3" />)}</g>
    : <g><rect x={-46} y={-46} width={92} height={92} rx={16} fill="#BFE3F2" {...o} /><circle cx={-14} cy={-14} r={16} fill="#F2C94C" {...o} />
      {Array.from({ length: 8 }, (_, i) => <path key={i} transform={`translate(-14 -14) rotate(${i * 45})`} d="M0 -22 V-29" stroke="#E8A33A" strokeWidth={3} strokeLinecap="round" />)}
      <g transform="translate(18 18) scale(0.5)">{cloud('#FFFFFF')}</g></g>,
  'x-face': (v) => (
    <g>
      <circle r={40} fill="#F6CF5B" {...o} />
      <circle cx={-14} cy={-10} r={4.5} fill={K} /><circle cx={14} cy={-10} r={4.5} fill={K} />
      {v === 'sad'
        ? <><path d="M-18 22 Q0 6 18 22" stroke={K} strokeWidth={3.5} fill="none" strokeLinecap="round" /><path d="M-15 -1 q-3 7 0 10 q3 -3 0 -10z" fill="#5DA9DA" /><path d="M-22 -20 l10 4 M22 -20 l-10 4" stroke={K} strokeWidth={2.4} strokeLinecap="round" /></>
        : <><path d="M-20 8 Q0 32 20 8 Z" fill="#FFFFFF" stroke={K} strokeWidth={3} strokeLinejoin="round" /><circle cx={-24} cy={6} r={5} fill="#F2A38C" opacity={0.7} /><circle cx={24} cy={6} r={5} fill="#F2A38C" opacity={0.7} /></>}
    </g>
  ),
  'x-blocks': (v) => {
    const n = Math.max(1, Math.min(6, Number(v || 3)));
    const cols = ['#D9534F', '#E9B829', '#4E9A4B', '#3E78C2', '#7E4FA6', '#E8862E'];
    return <g>{Array.from({ length: n }, (_, i) => <rect key={i} x={-14} y={44 - (i + 1) * 15} width={28} height={15} rx={2} fill={cols[i]} {...o} />)}<path d="M-34 45 H34" stroke={K} strokeWidth={3} strokeLinecap="round" /></g>;
  },
  'x-pencil': (v) => {
    const len = v === 'short' ? 30 : 80;
    const x0 = -len / 2;
    return (
      <g transform="rotate(-20)">
        <rect x={x0} y={-7} width={len} height={14} fill="#E9B829" {...o} />
        <rect x={x0 - 8} y={-7} width={8} height={14} rx={3} fill="#F2A3B8" {...o} />
        <path d={`M${x0 + len} -7 L${x0 + len + 16} 0 L${x0 + len} 7Z`} fill="#F1D9B5" {...o} />
        <path d={`M${x0 + len + 11} -2.5 L${x0 + len + 16} 0 L${x0 + len + 11} 2.5Z`} fill={K} />
      </g>
    );
  },
  'x-balls': (v) => {
    const n = Math.max(1, Math.min(9, Number(v || 3)));
    const pos = [[-24, 24], [0, 24], [24, 24], [-12, 2], [12, 2], [0, -20], [-30, -4], [30, -4], [-22, -28]];
    const cols = ['#D9534F', '#3E78C2', '#E9B829', '#4E9A4B', '#E8862E', '#7E4FA6', '#E58FB0', '#5DA9DA', '#8A5A36'];
    return <g>{pos.slice(0, n).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill={cols[i]} {...o} />)}</g>;
  },
  'x-thunder': () => <g>{cloud('#8F99A3', -8)}<path d="M2 4 L-10 26 H2 L-6 46 L16 18 H4 L12 4Z" fill="#F2C94C" {...o} strokeWidth={1.8} /></g>,
  'x-wind': () => (
    <g fill="none" stroke="#5D8FB5" strokeWidth={4} strokeLinecap="round">
      <path d="M-44 -18 H14 A12 12 0 1 0 2 -30" /><path d="M-44 2 H30 A10 10 0 1 1 20 14" /><path d="M-36 22 H6 A9 9 0 1 1 -2 32" />
      <path transform="translate(34 -26) rotate(30)" d="M0 0 Q8 -10 18 -2 Q8 8 0 0Z" fill="#5E9E62" stroke={K} strokeWidth={1.6} />
    </g>
  ),
  'x-stream': () => (
    <g>
      <path d="M-46 -14 Q-20 -24 0 -12 T46 -14 V24 Q20 34 0 22 T-46 24Z" fill="#7FC0E6" {...o} />
      <path d="M-34 0 q8 -4 16 0 t16 0 M2 8 q8 -4 16 0 t16 0" stroke="#FFFFFF" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <ellipse cx={-24} cy={30} rx={12} ry={6} fill="#A9A49B" {...o} /><ellipse cx={26} cy={-22} rx={10} ry={5} fill="#A9A49B" {...o} /><ellipse cx={8} cy={34} rx={7} ry={4} fill="#BDB8AE" {...o} />
    </g>
  ),
  'x-sea': () => (
    <g>
      <rect x={-46} y={-46} width={92} height={92} rx={16} fill="#D3EAF5" {...o} />
      <path d="M-46 0 Q-34 -14 -22 0 T2 0 T26 0 T50 0 V30 Q50 46 34 46 H-30 Q-46 46 -46 30Z" fill="#3E8CC4" />
      <path d="M-46 16 Q-34 4 -22 16 T2 16 T26 16 T50 16" stroke="#FFFFFF" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M-46 0 Q-34 -14 -22 0 T2 0 T26 0 T46 0" stroke="#FFFFFF" strokeWidth={3} fill="none" strokeLinecap="round" />
      <rect x={-46} y={-46} width={92} height={92} rx={16} fill="none" {...o} />
    </g>
  ),
  'x-fire': () => (
    <g>
      <path className="el-flicker" d="M0 -40 C18 -18 26 -6 22 14 C18 30 -18 30 -22 14 C-26 -4 -12 -10 -8 -24 C-2 -14 2 -16 0 -40Z" fill="#F08A3C" {...o} />
      <path d="M0 -12 C10 0 12 8 8 18 C4 24 -4 24 -8 18 C-10 10 -4 4 0 -12Z" fill="#F7D46B" />
      <path d="M-34 38 L30 22 M-30 22 L34 38" stroke="#8A5A36" strokeWidth={9} strokeLinecap="round" />
    </g>
  ),
  'x-birds': () => (
    <g>
      <path d="M-4 46 L-2 6 H6 L8 46Z" fill="#8A5A36" {...o} />
      <path d="M-40 4 C-50 -12 -40 -36 -18 -34 C-12 -50 16 -50 20 -36 C40 -40 50 -20 40 -4 C46 10 30 18 18 12 C8 20 -12 20 -18 12 C-32 18 -46 12 -40 4Z" fill="#5E9E62" {...o} />
      {birdShape(-18, -14, 0.9, '#E07A5F')}{birdShape(18, -4, 0.8, '#6B8FB8')}
      <path d="M26 -30 q4 -4 8 0 M32 -38 q4 -4 8 0" stroke={K} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </g>
  ),
  'x-cricket': () => (
    <g>
      <path d="M-30 30 Q-10 -6 26 -40 M-24 32 Q2 0 34 -30" stroke="#4E9A4B" strokeWidth={3} fill="none" strokeLinecap="round" />
      <ellipse cx={-2} cy={6} rx={26} ry={11} fill="#6A8E3A" {...o} transform="rotate(-12)" />
      <circle cx={24} cy={-2} r={8} fill="#6A8E3A" {...o} /><circle cx={27} cy={-4} r={1.8} fill={K} />
      <path d="M28 -8 Q38 -30 46 -34 M24 -9 Q30 -32 36 -40" stroke={K} strokeWidth={1.4} fill="none" />
      <path d="M-8 14 L-22 32 M2 14 L-4 32 M-14 12 Q-30 4 -40 20" stroke={K} strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M-34 -8 q-4 -6 0 -12 M-42 -4 q-6 -9 0 -18" stroke="#9AA5AE" strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>
  ),
  'x-splash': () => (
    <g>
      <ellipse cy={30} rx={42} ry={10} fill="#7FC0E6" {...o} />
      <path d="M-26 28 Q-30 4 -20 -8 Q-14 10 -8 20 Q-4 -10 0 -22 Q4 -10 8 20 Q14 10 20 -8 Q30 4 26 28Z" fill="#A9D6F0" {...o} />
      {[[-30, -20, 5], [30, -24, 4], [-8, -38, 4], [14, -36, 3]].map(([x, y, r], i) => <path key={i} transform={`translate(${x} ${y})`} d={`M0 ${-r * 1.6} Q${r} 0 0 ${r} Q${-r} 0 0 ${-r * 1.6}Z`} fill="#5DA9DA" {...o} strokeWidth={1.4} />)}
    </g>
  ),
};
export const hasActArt = (id: string) => !!X[id];
export const ACT_ART_IDS = Object.keys(X);

/** Picture for the newer activities: "x-" drawings from this file, anything else via <Art>. `scale` shrinks it (opposites). */
export function ActArt({ id, v, label, scale = 1, className = '' }: { id: string; v?: string; label?: string; scale?: number; className?: string }) {
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const };
  const inner = X[id]
    ? <svg viewBox="-50 -50 100 100" className={`el-art ${className}`} {...a11y}>{X[id](v)}</svg>
    : <Art id={id} v={v} label={label} className={className} />;
  if (scale >= 1) return inner;
  return <span className="el-scaled" style={{ width: `${Math.round(scale * 100)}%` }}>{inner}</span>;
}
