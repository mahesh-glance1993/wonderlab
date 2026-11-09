import { useRef, useState } from 'react';
import { Button, Meter, Modal } from '../../../ui/kit';
import { computeCalibration, type Calibration } from '../engine/pressure';

/** Light-to-heavy pressure pad: records the learner's own pressure range. */
export function CalibrationPad({ current, onSave, onClose }: { current?: Calibration; onSave: (c: Calibration | undefined) => void; onClose: () => void }) {
  const [phase, setPhase] = useState<'light' | 'heavy' | 'result'>('light');
  const [live, setLive] = useState(0);
  const [count, setCount] = useState(0);
  const [sawMouse, setSawMouse] = useState(false);
  const light = useRef<number[]>([]), heavy = useRef<number[]>([]);
  const [result, setResult] = useState<Calibration | null>(null);
  const record = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') { setSawMouse(true); return; }
    if (e.type === 'pointermove' && !e.buttons) return;
    const evs = (e.nativeEvent.getCoalescedEvents?.() || []) as PointerEvent[];
    const list = evs.length ? evs : [e.nativeEvent];
    const bucket = phase === 'light' ? light.current : heavy.current;
    for (const ev of list) if (ev.pressure > 0) bucket.push(ev.pressure);
    setLive(e.pressure);
    setCount(bucket.length);
  };
  const next = () => {
    if (phase === 'light') { setPhase('heavy'); setCount(0); return; }
    setResult(computeCalibration(light.current, heavy.current));
    setPhase('result');
  };
  return (
    <Modal title="Pen pressure check" onClose={onClose}>
      {phase !== 'result' ? (
        <div className="stack">
          <p><b>{phase === 'light' ? 'Step 1: Scribble very lightly.' : 'Step 2: Now scribble pressing hard.'}</b> Use your pen or stylus inside the box.</p>
          <div className="art-calpad" onPointerDown={record} onPointerMove={record} aria-label={phase === 'light' ? 'Scribble lightly here' : 'Scribble hard here'} role="application">
            <span>{phase === 'light' ? 'Light' : 'Heavy'}</span>
          </div>
          <div className="row"><span className="muted">Pressure now</span><div style={{ flex: 1 }}><Meter value={live} label="Pen pressure now" /></div><span>{Math.round(live * 100)}%</span></div>
          {sawMouse && <div className="alert info">A mouse has no pressure. Use a pen, or choose Manual Intensity instead.</div>}
          <div className="row">
            <Button variant="primary" disabled={count < 10} onClick={next}>{phase === 'light' ? 'Next' : 'Finish'}</Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="stack">
          {result ? (
            <>
              <div className="alert good">Done! Light = {Math.round(result.min * 100)}%, heavy = {Math.round(result.max * 100)}%. Your strokes now use your whole range.</div>
              <div className="row"><Button variant="primary" onClick={() => onSave(result)}>Save</Button><Button onClick={() => { light.current = []; heavy.current = []; setPhase('light'); setCount(0); }}>Try again</Button></div>
            </>
          ) : (
            <>
              <div className="alert warn">We could not feel enough difference between light and heavy. This device may not report pen pressure — Manual Intensity will be used.</div>
              <div className="row"><Button onClick={() => { light.current = []; heavy.current = []; setPhase('light'); setCount(0); }}>Try again</Button><Button variant="ghost" onClick={onClose}>Close</Button></div>
            </>
          )}
          {current && <Button variant="ghost" small onClick={() => onSave(undefined)}>Reset to default</Button>}
        </div>
      )}
    </Modal>
  );
}
