import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../../../lib/app';
import { Button, Page } from '../../../ui/kit';
import { CANVAS_SIZES, PAPERS, type PaperId } from '../engine/project';
import { PAPER_COLORS } from '../engine/paper';

/** Choose canvas size and paper, then open the studio with a fresh artwork id. */
export default function NewCanvas() {
  const { presentation } = useApp();
  const nav = useNavigate();
  const [size, setSize] = useState<string>('standard');
  const [paper, setPaper] = useState<PaperId>('smooth');
  const [id] = useState(() => crypto.randomUUID());
  if (presentation?.tier === 'early') return <Navigate to={`/art/paint/${id}?size=standard&paper=smooth`} replace />;
  return (
    <Page title="New painting" back="/art">
      <div className="stack" style={{ maxWidth: 760 }}>
        <h1>New painting</h1>
        <fieldset className="art-choose">
          <legend>Canvas size</legend>
          <div className="art-choices">
            {CANVAS_SIZES.map((s) => (
              <button key={s.id} type="button" className="art-choice" aria-pressed={size === s.id} onClick={() => setSize(s.id)}>
                <span className="art-size-shape" style={{ aspectRatio: `${s.w} / ${s.h}` }} aria-hidden="true" />
                <b>{s.label}</b><small>{s.w} × {s.h}</small>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="art-choose">
          <legend>Paper</legend>
          <div className="art-choices">
            {PAPERS.map((x) => (
              <button key={x.id} type="button" className="art-choice" aria-pressed={paper === x.id} onClick={() => setPaper(x.id)}>
                <span className={`art-paper-swatch paper-${x.id}`} style={{ background: PAPER_COLORS[x.id] }} aria-hidden="true" />
                <b>{x.label}</b>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="row"><Button variant="primary" icon="brush" onClick={() => nav(`/art/paint/${id}?size=${size}&paper=${paper}`, { replace: true })}>Start painting</Button></div>
      </div>
    </Page>
  );
}
