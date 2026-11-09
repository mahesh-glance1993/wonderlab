// Original SVG drawings for Build It parts. Each part is drawn centred on 0,0 at its own size (board units).
import type { ReactElement } from 'react';
import { FREE_WHEELS, type FreeDesign, type Orient, type Part } from './data/builds';

const K = '#3A3530';
const o = { stroke: K, strokeWidth: 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
type Shape = Pick<Part, 'kind' | 'w' | 'h' | 'c'>;

/** Which parts move when a model comes alive. */
export const roleOf = (p: Shape): string | undefined =>
  p.kind === 'wheel' ? 'wheel' : p.kind === 'rotor' ? 'rotor' : p.kind === 'prop' || p.kind === 'blades' ? 'spin' : p.kind === 'gear' ? 'gear' : p.kind === 'arm' ? 'arm' : p.kind === 'bucket' ? 'bucket' : p.kind === 'flame' ? 'flame' : undefined;

export function drawShape(p: Shape): ReactElement {
  const { w, h, c } = p, hw = w / 2, hh = h / 2;
  switch (p.kind) {
    case 'box': return <rect x={-hw} y={-hh} width={w} height={h} rx={Math.min(w, h) * 0.2} fill={c} {...o} />;
    case 'window': return <rect x={-hw} y={-hh} width={w} height={h} rx={4} fill={c} {...o} />;
    case 'wheel': return <g><circle r={hw} fill={c} {...o} /><circle r={hw * 0.45} fill="#BDBDBD" {...o} strokeWidth={1.5} /><path d={`M${-hw * 0.4} 0 H${hw * 0.4} M0 ${-hw * 0.4} V${hw * 0.4}`} stroke={K} strokeWidth={2} /></g>;
    case 'carbody': return <path d={`M${-hw} ${hh} V${-hh * 0.15} Q${-hw} ${-hh * 0.3} ${-hw * 0.7} ${-hh * 0.3} L${-hw * 0.5} ${-hh} H${hw * 0.4} L${hw * 0.65} ${-hh * 0.3} Q${hw} ${-hh * 0.3} ${hw} ${0} V${hh} Z`} fill={c} {...o} />;
    case 'frame': return <path d={`M${-hw} ${hh} L${-hw * 0.4} ${-hh} H${hw * 0.6} L${hw} ${hh} M${-hw * 0.4} ${-hh} L0 ${hh} L${hw * 0.6} ${-hh} M${-hw} ${hh} H0`} fill="none" stroke={c} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />;
    case 'seat': return <path d={`M${-hw} ${-hh} H${hw} Q${hw} ${hh} 0 ${hh} Q${-hw} ${hh} ${-hw} ${-hh}Z`} fill={c} {...o} />;
    case 'handle': return <path d={`M${-hw} ${hh} Q${-hw * 0.4} ${-hh} 0 0 Q${hw * 0.4} ${-hh} ${hw} ${hh}`} fill="none" stroke={c} strokeWidth={5} strokeLinecap="round" />;
    case 'light': return <circle r={hw} fill={c} {...o} strokeWidth={1.6} />;
    case 'wing': return <path d={`M${-hw} ${hh} H${hw - 14} L${hw} ${-hh} H${-hw + 18} Z`} fill={c} {...o} />;
    case 'fin': return <path d={`M${-hw} ${hh} H${hw} V${-hh} Z`} fill={c} {...o} />;
    case 'nose': return <path d={`M${hw} ${-hh} Q${-hw} ${-hh} ${-hw} 0 Q${-hw} ${hh} ${hw} ${hh} Z`} fill={c} {...o} />;
    case 'cone': return <path d={`M${-hw} ${hh} L0 ${-hh} L${hw} ${hh} Z`} fill={c} {...o} />;
    case 'bubble': return <ellipse rx={hw} ry={hh} fill={c} {...o} />;
    case 'tail': return <path d={`M${-hw} ${-hh} L${hw} ${-hh * 0.4} V${hh * 0.4} L${-hw} ${hh} Z`} fill={c} {...o} />;
    case 'rotor': return <g><rect x={-hw} y={-hh / 2} width={w} height={h / 2} rx={2} fill={c} {...o} strokeWidth={1.5} /><rect x={-4} y={-hh / 2} width={8} height={hh + 8} fill={c} /></g>;
    case 'prop': return <g><ellipse rx={hw} ry={hh} fill={c} {...o} strokeWidth={1.5} /><circle r={hw * 0.9} fill="#E8862E" /></g>;
    case 'skid': return <path d={`M${-hw} ${hh} H${hw} M${-hw * 0.5} ${hh} L${-hw * 0.4} ${-hh} M${hw * 0.5} ${hh} L${hw * 0.4} ${-hh}`} fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" />;
    case 'bullock': return (
      <g>
        <path d={`M${-hw * 0.6} ${hh * 0.3} v${hh * 0.7} M${-hw * 0.2} ${hh * 0.35} v${hh * 0.65} M${hw * 0.35} ${hh * 0.35} v${hh * 0.65} M${hw * 0.7} ${hh * 0.3} v${hh * 0.7}`} stroke={K} strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={hw * 0.05} cy={0} rx={hw * 0.75} ry={hh * 0.45} fill={c} {...o} />
        <path d={`M${hw * 0.1} ${-hh * 0.4} q${hw * 0.15} ${-hh * 0.35} ${hw * 0.35} 0`} fill="#C9A06A" {...o} strokeWidth={1.5} />
        <ellipse cx={-hw * 0.75} cy={-hh * 0.3} rx={hw * 0.22} ry={hh * 0.3} fill={c} {...o} />
        <path d={`M${-hw * 0.85} ${-hh * 0.55} q-6 -12 -2 -16 M${-hw * 0.62} ${-hh * 0.55} q6 -12 2 -16`} stroke="#8A6A3E" strokeWidth={3} fill="none" strokeLinecap="round" />
        <circle cx={-hw * 0.8} cy={-hh * 0.35} r={2} fill={K} />
        <path d={`M${hw * 0.8} ${-hh * 0.1} q${hw * 0.15} ${hh * 0.2} ${hw * 0.05} ${hh * 0.55}`} stroke={K} strokeWidth={2} fill="none" />
      </g>);
    case 'yoke': return <g><rect x={-hw} y={-hh} width={w} height={h} rx={hh} fill={c} {...o} /><path d={`M${-hw * 0.7} ${hh} v8 M${-hw * 0.3} ${hh} v8`} stroke={c} strokeWidth={3} /></g>;
    case 'canopy': return <path d={`M${-hw} ${hh} Q${-hw} ${-hh} 0 ${-hh} Q${hw} ${-hh} ${hw} ${hh} Z`} fill={c} {...o} />;
    case 'hull': return <path d={`M${-hw} ${-hh} H${hw} L${hw - 22} ${hh} H${-hw + 22} Z`} fill={c} {...o} />;
    case 'sail': return <path d={`M${-hw} ${-hh} V${hh} H${hw} Z`} fill={c} {...o} />;
    case 'chimney': return <g><rect x={-hw * 0.7} y={-hh + 6} width={w * 0.7} height={h - 6} fill={c} {...o} /><rect x={-hw} y={-hh} width={w} height={8} rx={2} fill={c} {...o} /></g>;
    case 'track': return <g><rect x={-hw} y={-hh} width={w} height={h} rx={hh} fill={c} {...o} />{[-0.7, -0.35, 0, 0.35, 0.7].map((f) => <circle key={f} cx={hw * f} cy={0} r={hh * 0.45} fill="#BDBDBD" {...o} strokeWidth={1.4} />)}</g>;
    case 'arm': return <rect x={-hw} y={-hh} width={w} height={h} rx={hh} fill={c} {...o} />;
    case 'bucket': return <path d={`M${-hw} ${-hh} H${hw} L${hw * 0.6} ${hh} H${-hw * 0.6} Z M${-hw * 0.6} ${hh} l4 6 l4 -6 l4 6 l4 -6`} fill={c} {...o} />;
    case 'tower': return <path d={`M${-hw * 0.65} ${-hh} H${hw * 0.65} L${hw} ${hh} H${-hw} Z`} fill={c} {...o} />;
    case 'blades': return <g>{[0, 90, 180, 270].map((a) => <path key={a} transform={`rotate(${a})`} d={`M-5 0 L-8 ${-hh} H8 L5 0 Z`} fill={c} {...o} />)}<circle r={7} fill={K} /></g>;
    case 'gear': {
      const r = hw, n = Math.max(8, Math.round(r / 3.5));
      const pts = Array.from({ length: n * 4 }, (_, i) => { const a = (i / (n * 4)) * Math.PI * 2; const rr = i % 4 < 2 ? r : r * 0.8; return `${(rr * Math.cos(a)).toFixed(1)},${(rr * Math.sin(a)).toFixed(1)}`; }).join(' ');
      return <g><polygon points={pts} fill={c} {...o} strokeWidth={1.6} /><circle r={r * 0.3} fill="#F7F4EC" {...o} strokeWidth={1.4} /><path d={`M0 ${-r * 0.3} V${-r * 0.65}`} stroke={K} strokeWidth={2} /></g>;
    }
    case 'flame': return <g><path d={`M0 ${hh} Q${-hw} 0 0 ${-hh} Q${hw} 0 0 ${hh}Z`} fill={c} {...o} /><path d={`M0 ${hh * 0.6} Q${-hw * 0.45} 0 0 ${-hh * 0.5} Q${hw * 0.45} 0 0 ${hh * 0.6}Z`} fill="#F2D16B" /></g>;
  }
}

const orientTf = (angle: number, o2?: Orient, mirror?: boolean) => `rotate(${angle + (o2?.rot ?? 0)}) scale(${(o2 ? o2.flip : mirror) ? -1 : 1} 1)`;

/** A part at its place on the board. `slot` draws the dashed outline instead. */
export function PartAt({ p, slot, orient, className = '' }: { p: Part; slot?: boolean; orient?: Orient; className?: string }) {
  const role = roleOf(p);
  return (
    <g transform={`translate(${p.x} ${p.y})`} className={className}>
      <g data-role={slot ? undefined : role} data-r={!slot && p.kind === 'gear' ? p.w / 2 : undefined} className={role ? `el-part-${role}` : undefined}>
        <g transform={orientTf(p.angle ?? 0, orient, p.mirror)} className={slot ? 'el-slot-shape' : undefined}>{drawShape(p)}</g>
      </g>
    </g>
  );
}

/** A part in the tray / being dragged, fitted into a square box. */
export function PartIcon({ p, orient }: { p: Part; orient: Orient }) {
  const size = Math.max(p.w, p.h) * 1.15 + 6;
  return (
    <svg viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} aria-hidden="true" className="el-part-icon">
      <g transform={orientTf(p.angle ?? 0, orient)}>{drawShape(p)}</g>
    </svg>
  );
}

/** Background scenery for a model board. */
export function Scenery({ scene }: { scene: string }) {
  const sky = { road: '#D3E7F0', sky: '#CFE6F2', water: '#D3E7F0', field: '#D9ECF3', space: '#2B3459', room: '#F1E4CF' }[scene] || '#D3E7F0';
  return (
    <g aria-hidden="true">
      <rect width={400} height={260} fill={sky} />
      {scene === 'road' && <g><rect y={218} width={400} height={42} fill="#8C8C8C" /><path d="M0 240 H400" stroke="#F2F2F2" strokeWidth={3} strokeDasharray="20 16" /></g>}
      {scene === 'field' && <g><path d="M0 190 Q100 170 200 190 T400 186 V260 H0Z" fill="#A9CF95" /><rect y={222} width={400} height={38} fill="#9CC98A" /></g>}
      {scene === 'water' && <g><rect y={200} width={400} height={60} fill="#7DB7D9" /><path d="M0 214 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#fff" strokeWidth={2} fill="none" opacity={0.6} /></g>}
      {scene === 'sky' && <g fill="#fff" opacity={0.9}><ellipse cx={60} cy={50} rx={34} ry={12} /><ellipse cx={340} cy={70} rx={40} ry={14} /><rect y={236} width={400} height={24} fill="#A9CF95" opacity={1} /></g>}
      {scene === 'space' && <g>{Array.from({ length: 18 }, (_, i) => <circle key={i} cx={(i * 83) % 400} cy={(i * 47) % 200 + 8} r={1.5} fill="#F4EBC2" />)}<rect y={246} width={400} height={14} fill="#6B6B78" /></g>}
      {scene === 'room' && <rect y={225} width={400} height={35} fill="#C9A87E" />}
    </g>
  );
}

/** A free-build vehicle (body + wheels + colour). */
export function FreeVehicle({ d }: { d: FreeDesign }) {
  const r = FREE_WHEELS.find((w) => w.id === d.wheel)?.r ?? 20;
  const wy = 222 - r;
  const wheel = (cx: number, key: string) => (
    <g key={key} transform={`translate(${cx} ${wy})`}><g data-role="wheel" className="el-part-wheel">
      {d.wheel === 'flower'
        ? <g>{Array.from({ length: 6 }, (_, i) => <ellipse key={i} transform={`rotate(${i * 60}) translate(0 ${-r * 0.55})`} rx={r * 0.35} ry={r * 0.5} fill="#E58FB0" {...o} strokeWidth={1.4} />)}<circle r={r * 0.35} fill="#F2C14E" {...o} /></g>
        : drawShape({ kind: 'wheel', w: r * 2, h: r * 2, c: K })}
    </g></g>
  );
  const top = wy - 6;
  const c = d.colour;
  return (
    <g>
      {d.body === 'car' && <g transform={`translate(200 ${top - 30})`}>{drawShape({ kind: 'carbody', w: 200, h: 70, c })}<rect x={-30} y={-28} width={36} height={18} rx={4} fill="#BFE3F2" {...o} /><rect x={12} y={-28} width={34} height={18} rx={4} fill="#BFE3F2" {...o} /></g>}
      {d.body === 'bus' && <g transform={`translate(200 ${top - 44})`}><rect x={-135} y={-46} width={270} height={92} rx={14} fill={c} {...o} />{[-100, -40, 20, 80].map((x) => <rect key={x} x={x} y={-34} width={40} height={28} rx={4} fill="#BFE3F2" {...o} />)}</g>}
      {d.body === 'auto' && <g transform={`translate(200 ${top - 28})`}><path d="M-80 -20 Q-80 -70 0 -70 Q80 -70 80 -20Z" fill="#3A3530" {...o} /><rect x={-80} y={-28} width={160} height={56} rx={12} fill={c} {...o} /><rect x={40} y={-60} width={30} height={30} rx={4} fill="#BFE3F2" {...o} /></g>}
      {d.body === 'tractor' && <g transform={`translate(200 ${top - 24})`}><rect x={-90} y={-24} width={130} height={48} rx={10} fill={c} {...o} /><rect x={30} y={-80} width={60} height={72} rx={10} fill={c} {...o} /><rect x={42} y={-70} width={36} height={26} rx={4} fill="#BFE3F2" {...o} /><rect x={-70} y={-64} width={12} height={40} fill="#3A3530" {...o} /></g>}
      {d.body === 'bus' ? [wheel(120, 'a'), wheel(280, 'b')] : d.body === 'tractor' ? [wheel(140, 'a'), wheel(265, 'b')] : [wheel(140, 'a'), wheel(262, 'b')]}
    </g>
  );
}
