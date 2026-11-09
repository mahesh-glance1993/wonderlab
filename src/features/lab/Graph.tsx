// Plain-SVG line graph against time, with a marker at the current time.
import { useId } from 'react';
import { fmt } from './common';

export interface GraphPoint { t: number; y: number }

const W = 320, H = 190, L = 44, R = 12, T = 14, B = 34;

function ticks(min: number, max: number, n = 4): number[] {
  const out: number[] = [];
  for (let i = 0; i <= n; i++) out.push(min + ((max - min) * i) / n);
  return out;
}

export function TimeGraph({ title, points, tMax, yMin, yMax, yLabel, unit, marker, tone }: {
  title: string; points: GraphPoint[]; tMax: number; yMin: number; yMax: number; yLabel: string; unit: string;
  marker?: GraphPoint; tone: 'x' | 'v';
}) {
  const id = useId();
  const span = yMax - yMin || 1;
  const sx = (t: number) => L + (t / (tMax || 1)) * (W - L - R);
  const sy = (y: number) => H - B - ((y - yMin) / span) * (H - T - B);
  const path = points.map((p) => `${sx(p.t).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
  const desc = marker ? `At t = ${fmt(marker.t)} s, ${yLabel} = ${fmt(marker.y)} ${unit}.` : '';
  return (
    <figure className="lab-graph">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${id}-t ${id}-d`}>
        <title id={`${id}-t`}>{title}</title>
        <desc id={`${id}-d`}>{desc} The table view lists every value.</desc>
        {ticks(yMin, yMax).map((y) => (
          <g key={`y${y}`}>
            <line x1={L} x2={W - R} y1={sy(y)} y2={sy(y)} className="lab-grid" />
            <text x={L - 6} y={sy(y) + 4} textAnchor="end" className="lab-tick">{fmt(y, 1)}</text>
          </g>
        ))}
        {ticks(0, tMax).map((t) => <text key={`t${t}`} x={sx(t)} y={H - B + 16} textAnchor="middle" className="lab-tick">{fmt(t, 1)}</text>)}
        {yMin < 0 && yMax > 0 && <line x1={L} x2={W - R} y1={sy(0)} y2={sy(0)} className="lab-axis" />}
        <line x1={L} x2={L} y1={T} y2={H - B} className="lab-axis" />
        <line x1={L} x2={W - R} y1={H - B} y2={H - B} className="lab-axis" />
        <text x={(L + W - R) / 2} y={H - 4} textAnchor="middle" className="lab-axis-label">time t (s)</text>
        <text x={12} y={(T + H - B) / 2} textAnchor="middle" className="lab-axis-label" transform={`rotate(-90 12 ${(T + H - B) / 2})`}>{yLabel} ({unit})</text>
        {points.length > 1 && <polyline points={path} className={`lab-line ${tone}`} />}
        {marker && (
          <g>
            <line x1={sx(marker.t)} x2={sx(marker.t)} y1={T} y2={H - B} className="lab-cursor" />
            <circle cx={sx(marker.t)} cy={sy(marker.y)} r={6} className={`lab-dot ${tone}`} />
            <text x={Math.min(sx(marker.t) + 8, W - R - 4)} y={Math.max(sy(marker.y) - 8, T + 10)} textAnchor={sx(marker.t) > W - 90 ? 'end' : 'start'} className="lab-dot-label">{fmt(marker.y, 1)} {unit}</text>
          </g>
        )}
      </svg>
      <figcaption className="muted">{title}</figcaption>
    </figure>
  );
}
