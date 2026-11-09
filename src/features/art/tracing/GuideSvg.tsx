import type { ReactNode } from 'react';
import { pointAt, polyLength, toSvgPoints, type Pt } from './path';
import type { Guide } from './guides';

/** Arrow positions along a stroke: roughly every 30 units, at least one. */
function arrowsFor(pl: Pt[]) {
  const L = polyLength(pl);
  const n = Math.max(1, Math.round(L / 30));
  return Array.from({ length: n }, (_, k) => pointAt(pl, (k + 0.6) / (n + 0.2)));
}

export const isReducedMotion = () => typeof document !== 'undefined' && document.documentElement.classList.contains('reduce-motion');

/**
 * Guide drawing: tolerance band, centre line, numbered green start dots, direction arrows and a
 * replayable animated stroke preview (static numbered arrows when reduced motion is on).
 */
export function GuideSvg({ guide, polys, tol, guidance, current = -1, done = [], animKey = 0, animate = false, mode = 'screen', children, className, svgRef, onPointer }: {
  guide: Guide; polys: Pt[][]; tol: number; guidance: boolean; current?: number; done?: boolean[];
  animKey?: number; animate?: boolean; mode?: 'screen' | 'print-model' | 'print-dotted';
  children?: ReactNode; className?: string; svgRef?: React.Ref<SVGSVGElement>;
  onPointer?: { down: (e: React.PointerEvent<SVGSVGElement>) => void; move: (e: React.PointerEvent<SVGSVGElement>) => void; up: (e: React.PointerEvent<SVGSVGElement>) => void };
}) {
  const [bx, by, bw, bh] = guide.box;
  const reduced = isReducedMotion();
  const u = bh / 100; // unit scale for markers
  const lengths = polys.map(polyLength);
  const total = lengths.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  const timing = lengths.map((l) => { const dur = Math.max(0.5, (l / total) * Math.min(6, 1.2 + total / 60)); const delay = acc; acc += dur + 0.25; return { dur, delay }; });
  const print = mode !== 'screen';
  const focus = (i: number) => current < 0 || i === current;
  return (
    <svg
      ref={svgRef} viewBox={`${bx} ${by} ${bw} ${bh}`} className={`trace-guide ${className || ''}`} role="img"
      aria-label={`${guide.label}: ${polys.length} ${polys.length === 1 ? 'line' : 'lines'} to trace`}
      onPointerDown={onPointer?.down} onPointerMove={onPointer?.move} onPointerUp={onPointer?.up} onPointerCancel={onPointer?.up}
    >
      {guide.lines?.map((y, i) => <line key={i} x1={bx} x2={bx + bw} y1={y} y2={y} className={`trace-rule ${i === 1 && guide.lines!.length > 3 ? 'mid' : ''}`} />)}
      {mode === 'screen' && polys.map((pl, i) => (
        <polyline key={`b${i}`} points={toSvgPoints(pl)} className={`trace-band ${done[i] ? 'done' : ''}`} strokeWidth={tol * 2} opacity={focus(i) ? 1 : 0.45} />
      ))}
      {polys.map((pl, i) => (
        <polyline key={`c${i}`} points={toSvgPoints(pl)} className={mode === 'print-dotted' ? 'trace-dots' : mode === 'print-model' ? 'trace-model' : 'trace-center'} strokeWidth={mode === 'print-dotted' ? 2.6 * u : mode === 'print-model' ? 2 * u : 1.2 * u} />
      ))}
      {(guidance || print) && mode !== 'print-dotted' && polys.map((pl, i) => (
        <g key={`g${i}`} opacity={focus(i) || print ? 1 : 0.35}>
          {arrowsFor(pl).map(({ pt, angle }, k) => (
            <g key={k} transform={`translate(${pt[0]} ${pt[1]}) rotate(${(angle * 180) / Math.PI})`}>
              <path d={`M${-2.6 * u} ${-2.6 * u} L${1.8 * u} 0 L${-2.6 * u} ${2.6 * u}`} className="trace-arrow" strokeWidth={1.1 * u} />
              {reduced && animate && !print && <text x={0} y={-4.2 * u} className="trace-num" fontSize={4.5 * u}>{i + 1}</text>}
            </g>
          ))}
          <circle cx={pl[0][0]} cy={pl[0][1]} r={3.6 * u} className="trace-start" />
          <text x={pl[0][0]} y={pl[0][1] + 1.6 * u} className="trace-start-num" fontSize={4.4 * u}>{i + 1}</text>
        </g>
      ))}
      {animate && !reduced && mode === 'screen' && polys.map((pl, i) => (
        <polyline key={`a${animKey}-${i}`} points={toSvgPoints(pl)} pathLength={1} className="trace-anim" strokeWidth={3 * u}
          style={{ animationDuration: `${timing[i].dur}s`, animationDelay: `${timing[i].delay}s` }} />
      ))}
      {children}
    </svg>
  );
}
