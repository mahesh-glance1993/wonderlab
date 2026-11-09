import { useState } from 'react';
import { generateBalance, applyOp, isSolvedEq, solvedValue, nextStep, formatEq, formatOp, formatSide, type BalanceRound, type Eq, type BalanceOp, type OpKind } from '../gen/balance';
import { L } from '../gen/common';
import type { GameModule, ViewProps } from '../Shell';
import { Button, Segmented } from '../../../ui/kit';
import { Icon } from '../../../ui/Icon';

interface BP { eq: Eq; history: { eq: Eq; op: BalanceOp }[] }

/** Pan contents: x-boxes and unit weights when small and positive; otherwise the expression. */
function Pan({ coef, k }: { coef: number; k: number }) {
  const simple = coef >= 0 && k >= 0 && coef <= 6 && k <= 12;
  if (!simple) return <span className="gm-pan-expr">{formatSide(coef, k)}</span>;
  return (
    <span className="gm-pan-items" aria-hidden="true">
      {Array.from({ length: coef }, (_, i) => <span key={`x${i}`} className="gm-xbox">x</span>)}
      {Array.from({ length: k }, (_, i) => <span key={`k${i}`} className="gm-unit">1</span>)}
      {coef === 0 && k === 0 && <span className="gm-pan-expr">0</span>}
    </span>
  );
}

function Scale({ eq }: { eq: Eq }) {
  return (
    <div className="gm-scale" role="img" aria-label={`Balanced scale: left ${formatSide(eq.a, eq.b)}, right ${formatSide(eq.c, eq.d)}`}>
      <div className="gm-beam"><span /><b className="gm-level"><Icon name="scale" />balanced</b><span /></div>
      <div className="gm-pans">
        <div className="gm-pan"><Pan coef={eq.a} k={eq.b} /></div>
        <div className="gm-pan"><Pan coef={eq.c} k={eq.d} /></div>
      </div>
      <div className="gm-post" />
    </div>
  );
}

const OPS: { value: OpKind; label: string }[] = [
  { value: 'sub', label: '− subtract' }, { value: 'add', label: '+ add' }, { value: 'div', label: '÷ divide' }, { value: 'mul', label: '× multiply' },
];

function View({ round, progress, setProgress, solved, complete, notice, variant, hints }: ViewProps<BalanceRound, BP>) {
  const [kind, setKind] = useState<OpKind>('sub');
  const [term, setTerm] = useState<'k' | 'x'>('k');
  const [value, setValue] = useState(1);
  const eq = progress.eq;
  const suggestion = nextStep(eq);

  const apply = (op: BalanceOp) => {
    if (solved) return;
    if (!Number.isInteger(op.value) || op.value <= 0) { notice(L('Choose a whole number greater than 0.')); return; }
    const res = applyOp(eq, op);
    if (!res.ok) {
      notice(res.reason === 'fraction' ? L(`Dividing by ${op.value} would make fractions here. Try a different step first.`)
        : res.reason === 'x-mul' ? L('Multiply or divide by a number, not by x.') : L('You cannot divide by 0.'));
      return;
    }
    const history = [...progress.history, { eq, op }];
    setProgress({ eq: res.eq, history });
    if (isSolvedEq(res.eq)) {
      const extra = history.length - round.optimal;
      complete(extra <= 1
        ? L(`Solved: x = ${solvedValue(res.eq)} in ${history.length} step${history.length === 1 ? '' : 's'}. Check: put ${solvedValue(res.eq)} back into ${formatEq(round.start)} — both sides match.`)
        : L(`x = ${solvedValue(res.eq)}. You got there! It can be done in ${round.optimal} steps — try a shorter path next time.`), extra <= 1);
    }
  };
  const undo = () => {
    if (solved || !progress.history.length) return;
    const h = progress.history.slice(0, -1);
    setProgress({ eq: progress.history[progress.history.length - 1].eq, history: h });
  };
  const op: BalanceOp = { kind, term: kind === 'mul' || kind === 'div' ? 'k' : term, value };

  return (
    <div className="stack">
      <div className="gm-expr" aria-live="polite">{formatEq(eq)}</div>
      <Scale eq={eq} />
      {(variant === 'guided' || hints >= 2) && suggestion && !solved && (
        <button type="button" className="btn small gm-suggest" onClick={() => apply(suggestion)}><Icon name="bulb" />Try: {formatOp(suggestion)} on both sides</button>
      )}
      <div className="card flat gm-opbuilder" role="group" aria-label="Do the same thing to both sides">
        <Segmented label="Operation" value={kind} options={OPS} onChange={(v) => setKind(v)} />
        {(kind === 'add' || kind === 'sub') && (
          <Segmented label="What to add or subtract" value={term} options={[{ value: 'k', label: 'a number' }, { value: 'x', label: 'some x' }]} onChange={(v) => setTerm(v)} />
        )}
        <div className="row">
          <Button icon="minus" small aria-label="Smaller" onClick={() => setValue((v) => Math.max(1, v - 1))} />
          <label className="gm-val">
            <span className="sr-only">Amount</span>
            <input className="input" type="number" inputMode="numeric" min={1} max={99} value={value} onChange={(e) => setValue(Math.max(1, Math.min(99, Math.round(+e.target.value || 1))))} />
            {op.term === 'x' && <b>x</b>}
          </label>
          <Button icon="plus" small aria-label="Bigger" onClick={() => setValue((v) => Math.min(99, v + 1))} />
          <Button icon="scale" variant="primary" disabled={solved} onClick={() => apply(op)}>{formatOp(op)} — both sides</Button>
          <Button icon="undo" small disabled={solved || !progress.history.length} onClick={undo}>Undo</Button>
        </div>
      </div>
      {progress.history.length > 0 && (
        <ol className="gm-steps" aria-label="Steps so far">
          <li><span>{formatEq(round.start)}</span></li>
          {progress.history.map((h, i) => (
            <li key={i}><small>{formatOp(h.op)} on both sides</small><span>{formatEq(i + 1 < progress.history.length ? progress.history[i + 1].eq : eq)}</span></li>
          ))}
        </ol>
      )}
    </div>
  );
}

export const balanceModule: GameModule<BalanceRound, BP> = {
  id: 'balance',
  generate: generateBalance,
  init: (r) => ({ eq: r.start, history: [] }),
  instructions: (r) => L(`Find x. The scale must stay balanced, so whatever you do to one side you must do to the other. Get x alone on one side of ${formatEq(r.start)}.`),
  hints: (r, p) => {
    const s = nextStep(p.eq);
    const h = [
      L(r.start.a !== 0 && r.start.c !== 0 ? 'First collect all the x terms on one side (subtract the smaller x term from both sides).' : 'Undo the + or − first, then the multiplying.'),
    ];
    if (s) h.push(L(`Next step: ${formatOp(s)} on both sides.`));
    return h;
  },
  View,
};
