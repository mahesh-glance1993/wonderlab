// Ungraded rough-work panel for senior learners: freehand canvas or typed notes.
import { useEffect, useRef, useState, type PointerEvent as RPE } from 'react';
import { Button, Segmented } from '../../ui/kit';
import { useS } from './strings';

export function Scratchpad({ id }: { id?: string }) {
  const s = useS();
  const [tab, setTab] = useState<'draw' | 'type'>('draw');
  const [notes, setNotes] = useState('');
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const snapshot = useRef<string | null>(null);

  useEffect(() => {
    const c = canvas.current;
    if (!c || tab !== 'draw') return;
    const fit = () => {
      const r = c.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const prev = c.width ? c.toDataURL() : snapshot.current;
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 2.5;
      ctx.strokeStyle = getComputedStyle(c).color || '#2F3A35';
      if (prev) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, r.width, r.height); img.src = prev; }
    };
    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(c);
    return () => { ro?.disconnect(); if (c.width > 1) snapshot.current = c.toDataURL(); };
  }, [tab]);

  const pos = (e: RPE<HTMLCanvasElement>) => { const r = e.currentTarget.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; };
  const clear = () => {
    if (tab === 'type') { setNotes(''); return; }
    const c = canvas.current; const ctx = c?.getContext('2d');
    if (c && ctx) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height); ctx.restore(); }
    snapshot.current = null;
  };

  return (
    <section className="card stack lq-scratch" id={id} aria-labelledby="scratch-h">
      <div className="row">
        <h2 id="scratch-h" className="lq-scratch-h">{s('scratch')}</h2>
        <span className="spacer" />
        <Segmented label={s('scratch')} value={tab} onChange={setTab} options={[{ value: 'draw', label: s('scratchDraw') }, { value: 'type', label: s('scratchType') }]} />
        <Button small icon="trash" onClick={clear}>{s('clear')}</Button>
      </div>
      <p className="muted lq-help">{s('scratchHint')}</p>
      {tab === 'draw'
        ? <canvas ref={canvas} className="lq-canvas" aria-label={`${s('scratch')} — ${s('scratchDraw')}`} role="img"
          onPointerDown={(e) => { const ctx = e.currentTarget.getContext('2d'); if (!ctx) return; e.currentTarget.setPointerCapture(e.pointerId); drawing.current = true; const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.01, y); ctx.stroke(); }}
          onPointerMove={(e) => { if (!drawing.current) return; const ctx = e.currentTarget.getContext('2d'); if (!ctx) return; const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke(); }}
          onPointerUp={() => { drawing.current = false; }} onPointerCancel={() => { drawing.current = false; }} />
        : <textarea className="input lq-notes" aria-label={`${s('scratch')} — ${s('scratchType')}`} value={notes} onChange={(e) => setNotes(e.target.value)} rows={10} spellCheck={false} />}
    </section>
  );
}
