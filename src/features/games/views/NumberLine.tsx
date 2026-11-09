import { useRef, type KeyboardEvent, type MouseEvent } from 'react';
import { generateNumberLine, answerK, formatK, expression, type NumberLineRound } from '../gen/numberline';
import { L, clamp } from '../gen/common';
import type { GameModule, ViewProps } from '../Shell';
import { Button } from '../../../ui/kit';

interface NP { pos: number; hops: number }

const W = 1000, PAD = 40;

function View({ round, progress, setProgress, solved, mistake, complete, notice, tx, say, hints, reduceMotion }: ViewProps<NumberLineRound, NP>) {
  const { minK, maxK, den, display } = round;
  const fmt = (k: number) => formatK(k, den, display);
  const xOf = (k: number) => PAD + ((k - minK) / (maxK - minK)) * (W - 2 * PAD);
  const target = answerK(round);
  const svgRef = useRef<SVGSVGElement>(null);

  const moveTo = (k: number) => {
    if (solved) return;
    const pos = clamp(k, minK, maxK);
    if (pos === progress.pos) return;
    setProgress({ pos, hops: progress.hops + 1 });
    say(L(fmt(pos).replace('−', 'minus ')));
  };
  const check = () => {
    if (progress.pos === round.startK) { notice(L('Hop first! Start at the frog and jump.', 'ముందు దూకండి!')); return; }
    if (progress.pos === target) complete(L(`Yes! ${expression(round)} = ${fmt(target)}.`, `అవును! ${expression(round)} = ${fmt(target)}.`));
    else {
      const dir = progress.pos < target ? L('right', 'కుడి') : L('left', 'ఎడమ');
      mistake(L(`You landed on ${fmt(progress.pos)}. That is not ${expression(round)} — hop further ${dir.en}.`, `మీరు ${fmt(progress.pos)} పై ఉన్నారు. ఇంకా ${dir.te} వైపు దూకండి.`));
    }
  };
  const onKey = (e: KeyboardEvent) => {
    const big = round.hops[round.hops.length - 1];
    const map: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: big, PageDown: -big };
    if (e.key in map) { e.preventDefault(); moveTo(progress.pos + map[e.key]); }
    else if (e.key === 'Home') { e.preventDefault(); moveTo(minK); }
    else if (e.key === 'End') { e.preventDefault(); moveTo(maxK); }
    else if (e.key === 'Enter') { e.preventDefault(); check(); }
  };
  const onClickLine = (e: MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const k = Math.round(minK + ((x - PAD) / (W - 2 * PAD)) * (maxK - minK));
    moveTo(k);
  };
  const ticks = Array.from({ length: maxK - minK + 1 }, (_, i) => minK + i);
  const guide = hints >= 2;
  const arcTo = (a: number, b: number, y: number) => {
    const xa = xOf(a), xb = xOf(b), mid = (xa + xb) / 2, h = Math.min(70, Math.abs(xb - xa) / 2 + 20);
    return `M${xa} ${y} Q${mid} ${y - h} ${xb} ${y}`;
  };

  return (
    <div className="stack">
      <div className="gm-expr" aria-label={tx(L('Problem', 'లెక్క'))}>{expression(round)} = <span className="gm-expr-q">{solved ? fmt(target) : '?'}</span></div>
      <div className="gm-nl-wrap">
        <svg ref={svgRef} viewBox={`0 0 ${W} 200`} className="gm-nl" onClick={onClickLine} aria-hidden="true">
          <line x1={PAD - 20} y1="130" x2={W - PAD + 20} y2="130" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          {ticks.map((k) => {
            const label = (k - minK) % round.labelEvery === 0 || k === 0 || (display === 'frac' && k % den === 0);
            const whole = k % den === 0;
            return (
              <g key={k}>
                <line x1={xOf(k)} x2={xOf(k)} y1={whole ? 112 : 118} y2={whole ? 148 : 142} stroke="currentColor" strokeWidth={whole ? 4 : 2} />
                {(label || ticks.length <= 21) && <text x={xOf(k)} y="178" textAnchor="middle" className={`gm-nl-label ${whole ? 'whole' : ''}`}>{fmt(k)}</text>}
              </g>
            );
          })}
          {guide && <path d={arcTo(round.startK, target, 108)} fill="none" stroke="var(--accent)" strokeWidth="4" strokeDasharray="10 8" />}
          {progress.pos !== round.startK && <path d={arcTo(round.startK, progress.pos, 112)} fill="none" stroke="var(--primary)" strokeWidth="4" />}
          <g className="gm-start" transform={`translate(${xOf(round.startK)} 130)`}><circle r="9" fill="var(--surface)" stroke="currentColor" strokeWidth="3" /></g>
          <g className="gm-frog" style={{ transform: `translate(${xOf(progress.pos)}px, 130px)`, transition: reduceMotion ? 'none' : 'transform .35s cubic-bezier(.2,.8,.2,1)' }}>
            <ellipse cx="0" cy="-34" rx="22" ry="17" fill="#6BAF7B" stroke="#2F3A35" strokeWidth="3" />
            <circle cx="-9" cy="-50" r="7" fill="#fff" stroke="#2F3A35" strokeWidth="3" /><circle cx="9" cy="-50" r="7" fill="#fff" stroke="#2F3A35" strokeWidth="3" />
            <circle cx="-9" cy="-50" r="2.5" fill="#2F3A35" /><circle cx="9" cy="-50" r="2.5" fill="#2F3A35" />
            <path d="M-8 -28q8 6 16 0" fill="none" stroke="#2F3A35" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
        <div
          className="gm-nl-slider" role="slider" tabIndex={0}
          aria-label={tx(L('Frog position on the number line. Use arrow keys to hop, Enter to check.', 'సంఖ్యా రేఖపై కప్ప స్థానం. బాణం కీలతో దూకండి.'))}
          aria-valuemin={minK} aria-valuemax={maxK} aria-valuenow={progress.pos} aria-valuetext={fmt(progress.pos)} onKeyDown={onKey}
        >
          <span className="pill">{tx(L('Frog is on', 'కప్ప ఉన్నది'))} <b>{fmt(progress.pos)}</b></span>
        </div>
      </div>
      <div className="gm-hops" role="group" aria-label={tx(L('Hop buttons', 'దూకు బటన్లు'))}>
        {round.hops.map((h) => (
          <Button key={`l${h}`} icon="prev" disabled={solved || progress.pos - h < minK} onClick={() => moveTo(progress.pos - h)} aria-label={tx(L(`Hop left ${fmt(h)}`, `ఎడమకు ${fmt(h)} దూకు`))}>{fmt(h)}</Button>
        ))}
        <Button icon="check" variant="primary" disabled={solved} onClick={check}>{tx(L('Check', 'సరిచూడు'))}</Button>
        {round.hops.map((h) => (
          <Button key={`r${h}`} disabled={solved || progress.pos + h > maxK} onClick={() => moveTo(progress.pos + h)} aria-label={tx(L(`Hop right ${fmt(h)}`, `కుడికి ${fmt(h)} దూకు`))}>{fmt(h)} <span aria-hidden="true">›</span></Button>
        ))}
        <Button icon="undo" small variant="ghost" disabled={solved || progress.pos === round.startK} onClick={() => setProgress({ pos: round.startK, hops: 0 })}>{tx(L('Back to start', 'మొదటికి'))}</Button>
      </div>
    </div>
  );
}

export const numberLineModule: GameModule<NumberLineRound, NP> = {
  id: 'numberline',
  generate: generateNumberLine,
  init: (r) => ({ pos: r.startK, hops: 0 }),
  instructions: (r) => L(
    `Solve ${expression(r)}. The frog starts at ${formatK(r.startK, r.den, r.display)}. Hop ${r.op === '+' ? 'right to add' : 'left to subtract'}, then press Check.`,
    `${expression(r)} చేయండి. కప్ప ${formatK(r.startK, r.den, r.display)} వద్ద మొదలవుతుంది. ${r.op === '+' ? 'కలపడానికి కుడికి' : 'తీసివేయడానికి ఎడమకు'} దూకి, సరిచూడు నొక్కండి.`,
  ),
  hints: (r) => [
    L(`Adding moves right; subtracting moves left. Here we ${r.op === '+' ? 'add, so hop right' : 'subtract, so hop left'}.`, r.op === '+' ? 'కలిపితే కుడికి, కాబట్టి కుడికి దూకండి.' : 'తీసివేస్తే ఎడమకు, కాబట్టి ఎడమకు దూకండి.'),
    L(`Make hops that add up to ${formatK(r.amountK, r.den, r.display)}. The dashed arc shows the whole jump.`, `మొత్తం ${formatK(r.amountK, r.den, r.display)} అయ్యేలా దూకండి. చుక్కల వంపు మొత్తం దూకును చూపుతుంది.`),
    ...(r.den > 1 ? [L(`Each small tick is 1/${r.den}${r.display === 'dec' ? ' = 0.1' : ''}.`, `ప్రతి చిన్న గీత 1/${r.den}.`)] : []),
  ],
  View,
};
