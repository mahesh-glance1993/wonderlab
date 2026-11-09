// Declarative VisualSpec renderer: accessible inline SVG/HTML, brief meaningful animation that is
// skipped when the learner (or OS) asks for reduced motion.
import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import type { VisualSpec } from '../../shared/content';
import { describeVisual, lineLabel } from './logic';
import { useS } from './strings';

export const motionOK = () => typeof document !== 'undefined' && !document.documentElement.classList.contains('reduce-motion');

type Size = 'sm' | 'md' | 'lg';
const W = { sm: 180, md: 300, lg: 380 };

export function Visual({ spec, alt, size = 'md', animate = true }: { spec: VisualSpec; alt?: string; size?: Size; animate?: boolean }) {
  const label = alt || describeVisual(spec);
  const anim = animate && motionOK();
  const cls = `lv lv-${spec.kind} lv-${size} ${anim ? 'lv-anim' : ''}`;
  switch (spec.kind) {
    case 'objects': return <Objects spec={spec} label={label} cls={cls} />;
    case 'fraction-bar': return <FractionBar spec={spec} label={label} cls={cls} w={W[size]} />;
    case 'fraction-circle': return <FractionCircle spec={spec} label={label} cls={cls} w={Math.min(W[size], 220)} />;
    case 'number-line': return <NumberLineVis spec={spec} label={label} cls={cls} w={W[size] + 60} />;
    case 'shape': return <ShapeVis spec={spec} label={label} cls={cls} w={Math.min(W[size], 160)} />;
    case 'clock': return <ClockVis spec={spec} label={label} cls={cls} w={Math.min(W[size], 200)} />;
    case 'coins': return <Coins spec={spec} label={label} cls={cls} />;
    case 'bar-graph': return <BarGraph spec={spec} label={label} cls={cls} />;
    case 'line-graph': return <LineGraph spec={spec} label={label} cls={cls} />;
    case 'grid-shape': return <GridShape spec={spec} label={label} cls={cls} w={W[size]} />;
    case 'triangle': return <TriangleVis spec={spec} label={label} cls={cls} w={W[size]} />;
    case 'emoji': return <div className={cls} role="img" aria-label={label}><span aria-hidden="true">{spec.text}</span></div>;
  }
}

type P<K extends VisualSpec['kind']> = { spec: Extract<VisualSpec, { kind: K }>; label: string; cls: string };

// ---------- objects (with grouping animation) ----------
function Objects({ spec, label, cls }: P<'objects'>) {
  const n = Math.max(0, Math.min(100, spec.count));
  const g = spec.groupsOf && spec.groupsOf > 0 ? spec.groupsOf : 0;
  const groups: number[][] = [];
  for (let i = 0; i < n; i++) { const gi = g ? Math.floor(i / g) : 0; (groups[gi] ??= []).push(i); }
  return (
    <div className={cls} role="img" aria-label={label}>
      {groups.map((grp, gi) => (
        <span key={gi} className={g ? 'lv-group' : 'lv-loose'} aria-hidden="true" style={{ '--gi': gi } as CSSProperties}>
          {grp.map((i) => <span key={i} className="lv-obj" style={{ '--i': i, '--dx': `${((i * 37) % 60) - 30}px`, '--dy': `${((i * 53) % 40) - 20}px` } as CSSProperties}>{spec.emoji}</span>)}
        </span>
      ))}
    </div>
  );
}

// ---------- fraction bar / circle (pieces join) ----------
function FractionBar({ spec, label, cls, w }: P<'fraction-bar'> & { w: number }) {
  const parts = Math.max(1, Math.min(48, spec.parts));
  const h = 56, pw = w / parts;
  return (
    <figure className={cls}>
      <svg viewBox={`-2 -2 ${w + 4} ${h + 4}`} width={w} role="img" aria-label={label}>
        {Array.from({ length: parts }, (_, i) => (
          <rect key={i} className="lv-piece" x={i * pw} y={0} width={pw} height={h} rx={3}
            fill={i < spec.shaded ? 'var(--lv-fill)' : 'var(--paper)'} stroke="var(--ink)" strokeWidth={2}
            style={{ '--off': `${(i - (parts - 1) / 2) * 6}px`, '--i': i } as CSSProperties} />
        ))}
      </svg>
      {spec.label && <figcaption className="lv-cap">{spec.label}</figcaption>}
    </figure>
  );
}

function FractionCircle({ spec, label, cls, w }: P<'fraction-circle'> & { w: number }) {
  const parts = Math.max(1, Math.min(36, spec.parts));
  const r = w / 2 - 4, c = w / 2;
  const pt = (a: number) => [c + r * Math.sin(a), c - r * Math.cos(a)];
  return (
    <svg className={cls} viewBox={`0 0 ${w} ${w}`} width={w} role="img" aria-label={label}>
      {parts === 1
        ? <circle cx={c} cy={c} r={r} fill={spec.shaded ? 'var(--lv-fill)' : 'var(--paper)'} stroke="var(--ink)" strokeWidth={2} />
        : Array.from({ length: parts }, (_, i) => {
          const a0 = (i / parts) * 2 * Math.PI, a1 = ((i + 1) / parts) * 2 * Math.PI, mid = (a0 + a1) / 2;
          const [x0, y0] = pt(a0), [x1, y1] = pt(a1);
          return (
            <path key={i} className="lv-wedge" d={`M${c},${c} L${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1} Z`}
              fill={i < spec.shaded ? 'var(--lv-fill)' : 'var(--paper)'} stroke="var(--ink)" strokeWidth={2}
              style={{ '--ox': `${Math.sin(mid) * 10}px`, '--oy': `${-Math.cos(mid) * 10}px`, '--i': i } as CSSProperties} />
          );
        })}
    </svg>
  );
}

// ---------- number line with jumps ----------
function NumberLineVis({ spec, label, cls, w }: P<'number-line'> & { w: number }) {
  const pad = 20, h = 90, y = 60;
  const span = spec.to - spec.from || 1;
  const X = (v: number) => pad + ((v - spec.from) / span) * (w - 2 * pad);
  const n = Math.max(1, Math.min(200, Math.round((spec.to - spec.from) / spec.step)));
  const every = Math.ceil((n + 1) / 12);
  const mid = useId().replace(/:/g, '');
  return (
    <svg className={cls} viewBox={`0 0 ${w} ${h}`} width={w} role="img" aria-label={label}>
      <defs><marker id={`ah${mid}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs>
      <line x1={pad - 10} x2={w - pad + 10} y1={y} y2={y} stroke="var(--text)" strokeWidth={2} />
      {Array.from({ length: n + 1 }, (_, k) => {
        const t = spec.from + k * spec.step;
        return (
          <g key={k}>
            <line x1={X(t)} x2={X(t)} y1={y - 6} y2={y + 6} stroke="var(--text)" strokeWidth={2} />
            {k % every === 0 || k === n ? <text x={X(t)} y={y + 22} textAnchor="middle" className="lv-txt">{lineLabel(k, spec)}</text> : null}
          </g>
        );
      })}
      {(spec.marks ?? []).map((m, i) => <circle key={`m${i}`} cx={X(m)} cy={y} r={6} fill="var(--primary)" />)}
      {(spec.jumps ?? []).map(([a, b], i) => {
        const x1 = X(a), x2 = X(b), top = y - 10 - Math.min(40, Math.abs(x2 - x1) / 2);
        return <path key={`j${i}`} className="lv-jump" d={`M${x1},${y - 8} Q${(x1 + x2) / 2},${top} ${x2},${y - 8}`} fill="none" stroke="var(--accent)" strokeWidth={2.5} markerEnd={`url(#ah${mid})`} pathLength={1} style={{ '--i': i } as CSSProperties} />;
      })}
    </svg>
  );
}

// ---------- shapes ----------
const poly = (n: number, r: number, c: number, rot = -Math.PI / 2) => Array.from({ length: n }, (_, i) => { const a = rot + (i * 2 * Math.PI) / n; return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`; }).join(' ');
function ShapeVis({ spec, label, cls, w }: P<'shape'> & { w: number }) {
  const c = 50, fill = spec.color || 'var(--lv-fill)';
  const common = { fill, stroke: 'var(--ink)', strokeWidth: 2.5 };
  let el;
  switch (spec.shape) {
    case 'circle': el = <circle cx={c} cy={c} r={40} {...common} />; break;
    case 'oval': el = <ellipse cx={c} cy={c} rx={44} ry={30} {...common} />; break;
    case 'square': el = <rect x={12} y={12} width={76} height={76} rx={2} {...common} />; break;
    case 'rectangle': el = <rect x={6} y={24} width={88} height={52} rx={2} {...common} />; break;
    case 'triangle': el = <polygon points={poly(3, 44, c)} transform="translate(0,6)" {...common} />; break;
    case 'pentagon': el = <polygon points={poly(5, 42, c)} {...common} />; break;
    case 'hexagon': el = <polygon points={poly(6, 42, c, 0)} {...common} />; break;
    case 'diamond': el = <polygon points="50,6 86,50 50,94 14,50" {...common} />; break;
    case 'star': el = <polygon points={Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 18 : 44; return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`; }).join(' ')} {...common} />; break;
  }
  return <svg className={cls} viewBox="0 0 100 100" width={w} role="img" aria-label={label}>{el}</svg>;
}

// ---------- clock ----------
function ClockVis({ spec, label, cls, w }: P<'clock'> & { w: number }) {
  const c = 100, hA = (((spec.h % 12) + spec.m / 60) * 30 * Math.PI) / 180, mA = (spec.m * 6 * Math.PI) / 180;
  const hand = (a: number, len: number) => ({ x2: c + len * Math.sin(a), y2: c - len * Math.cos(a) });
  return (
    <svg className={cls} viewBox="0 0 200 200" width={w} role="img" aria-label={label}>
      <circle cx={c} cy={c} r={92} fill="var(--paper)" stroke="var(--ink)" strokeWidth={4} />
      {Array.from({ length: 60 }, (_, i) => { const a = (i * 6 * Math.PI) / 180, r1 = i % 5 ? 84 : 78; return <line key={i} x1={c + r1 * Math.sin(a)} y1={c - r1 * Math.cos(a)} x2={c + 88 * Math.sin(a)} y2={c - 88 * Math.cos(a)} stroke="var(--ink)" strokeWidth={i % 5 ? 1 : 3} />; })}
      {Array.from({ length: 12 }, (_, i) => { const n = i + 1, a = (n * 30 * Math.PI) / 180; return <text key={n} x={c + 64 * Math.sin(a)} y={c - 64 * Math.cos(a) + 7} textAnchor="middle" className="lv-clocknum">{n}</text>; })}
      <line x1={c} y1={c} {...hand(hA, 48)} stroke="var(--ink)" strokeWidth={7} strokeLinecap="round" />
      <line x1={c} y1={c} {...hand(mA, 74)} stroke="var(--accent)" strokeWidth={4} strokeLinecap="round" />
      <circle cx={c} cy={c} r={6} fill="var(--ink)" />
    </svg>
  );
}

// ---------- coins & notes (₹) ----------
function Coins({ spec, label, cls }: P<'coins'>) {
  return (
    <div className={cls} role="img" aria-label={label}>
      {spec.rupees.map((r, i) => r >= 20
        ? <span key={i} className="lv-note" aria-hidden="true">₹{r}</span>
        : <span key={i} className={`lv-coin lv-coin-${Math.min(r, 10)}`} aria-hidden="true">₹{r}</span>)}
    </div>
  );
}

// ---------- graphs (+ data table toggle) ----------
function niceMax(v: number) { if (v <= 0) return 1; const p = 10 ** Math.floor(Math.log10(v)); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
function GraphFrame({ cls, label, children, table }: { cls: string; label: string; children: ReactNode; table: ReactNode }) {
  const s = useS();
  const [show, setShow] = useState(false);
  return (
    <figure className={`${cls} lv-graph`}>
      <svg viewBox="0 0 340 230" role="img" aria-label={label} width="100%" style={{ maxWidth: 420 }}>{children}</svg>
      <button type="button" className="btn small" aria-expanded={show} onClick={() => setShow(!show)}>{show ? s('hideTable') : s('showTable')}</button>
      {show && table}
    </figure>
  );
}
function BarGraph({ spec, label, cls }: P<'bar-graph'>) {
  const max = niceMax(Math.max(...spec.values, 0));
  const x0 = 44, y0 = 190, gw = 280, gh = 170, bw = gw / Math.max(1, spec.values.length);
  return (
    <GraphFrame cls={cls} label={label} table={
      <table className="data"><thead><tr><th scope="col">Item</th><th scope="col">Value{spec.unit ? ` (${spec.unit})` : ''}</th></tr></thead>
        <tbody>{spec.labels.map((l, i) => <tr key={i}><th scope="row">{l}</th><td>{spec.values[i]}</td></tr>)}</tbody></table>}>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => <g key={f}><line x1={x0} x2={x0 + gw} y1={y0 - f * gh} y2={y0 - f * gh} stroke="var(--line)" /><text x={x0 - 6} y={y0 - f * gh + 4} textAnchor="end" className="lv-txt sm">{+(f * max).toPrecision(4)}</text></g>)}
      {spec.values.map((v, i) => {
        const h = (Math.max(0, v) / max) * gh;
        return (
          <g key={i}>
            <rect className="lv-bar" x={x0 + i * bw + bw * 0.15} y={y0 - h} width={bw * 0.7} height={h} rx={4} fill="var(--lv-fill)" stroke="var(--ink)" style={{ '--i': i } as CSSProperties} />
            <text x={x0 + i * bw + bw / 2} y={y0 - h - 4} textAnchor="middle" className="lv-txt sm">{v}</text>
            <text x={x0 + i * bw + bw / 2} y={y0 + 16} textAnchor="middle" className="lv-txt sm">{spec.labels[i]}</text>
          </g>
        );
      })}
      <line x1={x0} x2={x0} y1={y0 - gh} y2={y0} stroke="var(--text)" strokeWidth={2} />
      <line x1={x0} x2={x0 + gw} y1={y0} y2={y0} stroke="var(--text)" strokeWidth={2} />
      {spec.unit && <text x={8} y={14} className="lv-txt sm">{spec.unit}</text>}
    </GraphFrame>
  );
}
function LineGraph({ spec, label, cls }: P<'line-graph'>) {
  const xs = spec.points.map((p) => p[0]), ys = spec.points.map((p) => p[1]);
  const xmin = Math.min(0, ...xs), xmax = niceMax(Math.max(...xs, 0)), ymin = Math.min(0, ...ys), ymax = niceMax(Math.max(...ys, 0));
  const x0 = 50, y0 = 186, gw = 270, gh = 160;
  const X = (v: number) => x0 + ((v - xmin) / (xmax - xmin || 1)) * gw, Y = (v: number) => y0 - ((v - ymin) / (ymax - ymin || 1)) * gh;
  return (
    <GraphFrame cls={cls} label={label} table={
      <table className="data"><thead><tr><th scope="col">{spec.xLabel}</th><th scope="col">{spec.yLabel}</th></tr></thead>
        <tbody>{spec.points.map(([x, y], i) => <tr key={i}><td>{x}</td><td>{y}</td></tr>)}</tbody></table>}>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => <g key={f}>
        <line x1={x0} x2={x0 + gw} y1={y0 - f * gh} y2={y0 - f * gh} stroke="var(--line)" />
        <text x={x0 - 6} y={y0 - f * gh + 4} textAnchor="end" className="lv-txt sm">{+(ymin + f * (ymax - ymin)).toPrecision(4)}</text>
        <text x={x0 + f * gw} y={y0 + 16} textAnchor="middle" className="lv-txt sm">{+(xmin + f * (xmax - xmin)).toPrecision(4)}</text>
      </g>)}
      <line x1={x0} x2={x0} y1={y0 - gh} y2={y0} stroke="var(--text)" strokeWidth={2} />
      <line x1={x0} x2={x0 + gw} y1={y0} y2={y0} stroke="var(--text)" strokeWidth={2} />
      <polyline className="lv-jump" pathLength={1} points={spec.points.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth={3} />
      {spec.points.map(([x, y], i) => <circle key={i} cx={X(x)} cy={Y(y)} r={4.5} fill="var(--primary)" />)}
      <text x={x0 + gw / 2} y={222} textAnchor="middle" className="lv-txt sm b">{spec.xLabel}</text>
      <text x={14} y={y0 - gh / 2} textAnchor="middle" className="lv-txt sm b" transform={`rotate(-90 14 ${y0 - gh / 2})`}>{spec.yLabel}</text>
    </GraphFrame>
  );
}

// ---------- grid shape ----------
function GridShape({ spec, label, cls, w }: P<'grid-shape'> & { w: number }) {
  const cs = Math.min(36, w / Math.max(1, spec.cols));
  const on = new Set(spec.cells.map(([x, y]) => `${x},${y}`));
  return (
    <svg className={cls} viewBox={`-1 -1 ${spec.cols * cs + 2} ${spec.rows * cs + 2}`} width={spec.cols * cs + 2} role="img" aria-label={label}>
      {Array.from({ length: spec.rows }, (_, y) => Array.from({ length: spec.cols }, (_, x) => (
        <rect key={`${x},${y}`} x={x * cs} y={y * cs} width={cs} height={cs} fill={on.has(`${x},${y}`) ? 'var(--lv-fill)' : 'var(--paper)'} stroke="var(--line)" />
      )))}
    </svg>
  );
}

// ---------- triangle ----------
export function trianglePoints(a: number, b: number, c?: number): [number, number][] | null {
  if (!(a > 0 && b > 0)) return null;
  if (c === undefined) return [[0, 0], [a, 0], [0, b]]; // right angle at the origin
  if (!(c > 0) || a + b <= c || a + c <= b || b + c <= a) return null;
  const x = (a * a + c * c - b * b) / (2 * a);
  return [[0, 0], [a, 0], [x, Math.sqrt(Math.max(0, c * c - x * x))]];
}
function TriangleVis({ spec, label, cls, w }: P<'triangle'> & { w: number }) {
  const pts = trianglePoints(spec.a, spec.b, spec.c) ?? [[0, 0], [1, 0], [0.5, 0.8]];
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs), spanX = Math.max(...xs) - minX || 1, spanY = Math.max(...ys) || 1;
  const pad = 30, h = Math.min(220, w * 0.7);
  const k = Math.min((w - 2 * pad) / spanX, (h - 2 * pad) / spanY);
  const P2 = pts.map(([x, y]) => [pad + (x - minX) * k, h - pad - y * k] as [number, number]);
  const sides: [number, number, string][] = spec.c === undefined
    ? [[0, 1, String(spec.a)], [0, 2, String(spec.b)]]
    : [[0, 1, String(spec.a)], [1, 2, String(spec.b)], [2, 0, String(spec.c)]];
  const cx = (P2[0][0] + P2[1][0] + P2[2][0]) / 3, cy = (P2[0][1] + P2[1][1] + P2[2][1]) / 3;
  return (
    <svg className={cls} viewBox={`0 0 ${w} ${h}`} width={w} role="img" aria-label={label}>
      <polygon points={P2.map((p) => p.join(',')).join(' ')} fill="var(--lv-fill-soft)" stroke="var(--ink)" strokeWidth={2.5} />
      {spec.c === undefined && <path d={`M${P2[0][0] + 14},${P2[0][1]} v-14 h-14`} fill="none" stroke="var(--ink)" strokeWidth={1.5} />}
      {sides.map(([i, j, t], n) => {
        const mx = (P2[i][0] + P2[j][0]) / 2, my = (P2[i][1] + P2[j][1]) / 2;
        const dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1;
        return <text key={n} x={mx + (dx / d) * 16} y={my + (dy / d) * 16 + 5} textAnchor="middle" className="lv-txt b">{t}</text>;
      })}
      {(spec.angleLabels ?? []).slice(0, 3).map((t, i) => {
        const dx = cx - P2[i][0], dy = cy - P2[i][1], d = Math.hypot(dx, dy) || 1;
        return <text key={`a${i}`} x={P2[i][0] + (dx / d) * 24} y={P2[i][1] + (dy / d) * 24 + 5} textAnchor="middle" className="lv-txt sm">{t}</text>;
      })}
    </svg>
  );
}
