// Small SVG helpers for labelled arrows and rays.

/** A straight arrow from (x1,y1) to (x2,y2) with a head and an optional text label. */
export function Arrow({ x1, y1, x2, y2, label, className, labelDx = 0, labelDy = -8, anchor = 'middle', head = 10 }: {
  x1: number; y1: number; x2: number; y2: number; label?: string; className: string; labelDx?: number; labelDy?: number; anchor?: 'start' | 'middle' | 'end'; head?: number;
}) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
  const lx = (x1 + x2) / 2 + labelDx, ly = (y1 + y2) / 2 + labelDy;
  if (L < 1) return label ? <text x={x1 + labelDx} y={y1 + labelDy} textAnchor={anchor} className={`lab-label ${className}`}>{label}</text> : null;
  const ux = dx / L, uy = dy / L, h = Math.min(head, L * 0.6);
  const bx = x2 - ux * h, by = y2 - uy * h;
  const pts = `${x2},${y2} ${bx - uy * h * 0.55},${by + ux * h * 0.55} ${bx + uy * h * 0.55},${by - ux * h * 0.55}`;
  return (
    <g className={`lab-arrow ${className}`}>
      <line x1={x1} y1={y1} x2={bx} y2={by} />
      <polygon points={pts} />
      {label && <text x={lx} y={ly} textAnchor={anchor} className="lab-label">{label}</text>}
    </g>
  );
}
