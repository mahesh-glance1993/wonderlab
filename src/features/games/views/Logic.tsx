import { useRef, type KeyboardEvent } from 'react';
import { generateLogic, isSudokuSolved, isMagicSolved, sudokuConflicts, MAGIC_LINES, type LogicRound } from '../gen/logic';
import { L } from '../gen/common';
import type { GameModule, ViewProps } from '../Shell';
import { Button } from '../../../ui/kit';
import { Icon } from '../../../ui/Icon';

interface LP { grid: number[]; sel: number; shown: number[] }

function candidates(grid: number[], i: number, n: number, br: number, bc: number): number[] {
  const r = Math.floor(i / n), c = i % n;
  const used = new Set<number>();
  for (let k = 0; k < n; k++) { used.add(grid[r * n + k]); used.add(grid[k * n + c]); }
  const r0 = Math.floor(r / br) * br, c0 = Math.floor(c / bc) * bc;
  for (let a = 0; a < br; a++) for (let b = 0; b < bc; b++) used.add(grid[(r0 + a) * n + c0 + b]);
  return Array.from({ length: n }, (_, k) => k + 1).filter((v) => !used.has(v));
}

function View({ round, progress, setProgress, solved, mistake, complete, notice, tx, say }: ViewProps<LogicRound, LP>) {
  const n = round.kind === 'sudoku' ? round.n : 3;
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const isGiven = (i: number) => !!round.givens[i];
  const conflicts = round.kind === 'sudoku' && progress.shown.length ? new Set(sudokuConflicts(progress.grid, n, round.br, round.bc)) : new Set<number>();
  const palette = round.kind === 'sudoku' ? Array.from({ length: n }, (_, k) => k + 1) : round.numbers;

  const setCell = (i: number, v: number) => {
    if (solved || isGiven(i)) return;
    const grid = progress.grid.slice();
    if (round.kind === 'magic' && v) { const j = grid.indexOf(v); if (j >= 0 && !isGiven(j)) grid[j] = 0; } // each number once
    grid[i] = v;
    setProgress({ ...progress, grid, shown: [] });
  };
  const focusCell = (i: number) => { setProgress({ ...progress, sel: i }); cells.current[i]?.focus(); };
  const onKey = (e: KeyboardEvent, i: number) => {
    const r = Math.floor(i / n), c = i % n;
    const mv: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (e.key in mv) {
      e.preventDefault();
      const [dr, dc] = mv[e.key];
      focusCell(((r + dr + n) % n) * n + ((c + dc + n) % n));
    } else if (/^\d$/.test(e.key) && round.kind === 'sudoku') {
      const v = +e.key;
      if (v >= 1 && v <= n) { e.preventDefault(); setCell(i, v); }
      if (v === 0) setCell(i, 0);
    } else if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); setCell(i, 0); }
  };
  const check = () => {
    if (progress.grid.some((v) => !v)) { notice(L('Fill every empty square first.', 'ముందు అన్ని ఖాళీ గడులను నింపండి.')); return; }
    if (round.kind === 'sudoku') {
      if (isSudokuSolved(progress.grid, round)) complete(L('Solved! Every row, column and box has each number once.', 'పూర్తయింది! ప్రతి వరుస, నిలువు, పెట్టెలో ప్రతి సంఖ్య ఒక్కసారే.'));
      else { setProgress({ ...progress, shown: sudokuConflicts(progress.grid, n, round.br, round.bc) }); mistake(L('Some numbers repeat in a row, column or box — they are marked with !', 'కొన్ని సంఖ్యలు మళ్ళీ వచ్చాయి — ! తో గుర్తించాము.')); }
    } else {
      if (isMagicSolved(progress.grid, round)) complete(L(`Magic! Every line adds up to ${round.total}.`, `మాయ! ప్రతి వరుస మొత్తం ${round.total}.`));
      else { setProgress({ ...progress, shown: [1] }); mistake(L(`Not every line adds up to ${round.total} yet — check the sums at the edges.`, `అన్ని వరుసల మొత్తం ఇంకా ${round.total} కాలేదు.`)); }
    }
  };

  const lineSum = (l: number[]) => l.reduce((s, i) => s + progress.grid[i], 0);
  const lineFull = (l: number[]) => l.every((i) => progress.grid[i]);
  const sumBadge = (l: number[], key: string) => {
    if (round.kind !== 'magic') return null;
    const full = lineFull(l), ok = full && lineSum(l) === round.total;
    return <span key={key} className={`gm-sum ${full ? (ok ? 'ok' : 'bad') : ''}`}>{lineSum(l)}{full && <Icon name={ok ? 'check' : 'x'} />}</span>;
  };
  const sel = progress.sel;

  return (
    <div className="gm-logic">
      <div className={`gm-gridwrap ${round.kind}`}>
        <div className={`gm-grid n${n}`} role="grid" aria-label={tx(round.kind === 'sudoku' ? L(`${n} by ${n} sudoku`, `${n}×${n} సుడోకు`) : L('Magic square', 'మాయా చతురస్రం'))} style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
          {Array.from({ length: n }, (_, r) => (
            <div role="row" key={r} className="gm-grid-row">
              {Array.from({ length: n }, (_, c) => {
                const i = r * n + c;
                const v = progress.grid[i];
                const bad = conflicts.has(i);
                const boxEdgeR = round.kind === 'sudoku' && (c + 1) % round.bc === 0 && c < n - 1;
                const boxEdgeB = round.kind === 'sudoku' && (r + 1) % round.br === 0 && r < n - 1;
                return (
                  <button
                    key={c} role="gridcell" type="button" ref={(el) => { cells.current[i] = el; }}
                    tabIndex={i === sel ? 0 : -1}
                    className={`gm-cell ${isGiven(i) ? 'given' : ''} ${i === sel ? 'sel' : ''} ${bad ? 'bad' : ''} ${boxEdgeR ? 'edge-r' : ''} ${boxEdgeB ? 'edge-b' : ''}`}
                    aria-label={`${tx(L('Row', 'వరుస'))} ${r + 1}, ${tx(L('column', 'నిలువు'))} ${c + 1}: ${v || tx(L('empty', 'ఖాళీ'))}${isGiven(i) ? ` (${tx(L('given', 'ఇచ్చినది'))})` : ''}${bad ? ` — ${tx(L('repeats', 'మళ్ళీ వచ్చింది'))}` : ''}`}
                    aria-selected={i === sel}
                    onClick={() => setProgress({ ...progress, sel: i })} onKeyDown={(e) => onKey(e, i)}
                  >
                    {v || ''}
                    {bad && <span className="gm-bad-mark" aria-hidden="true">!</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        {round.kind === 'magic' && (
          <div className="gm-sums" aria-label={tx(L('Line sums', 'వరుసల మొత్తాలు'))}>
            <div className="gm-sums-rows">{MAGIC_LINES.slice(0, 3).map((l, i) => sumBadge(l, `r${i}`))}</div>
            <div className="gm-sums-cols">{MAGIC_LINES.slice(3, 6).map((l, i) => sumBadge(l, `c${i}`))}</div>
            <div className="gm-sums-diag">↘ {sumBadge(MAGIC_LINES[6], 'd0')} ↙ {sumBadge(MAGIC_LINES[7], 'd1')}</div>
          </div>
        )}
      </div>
      <div className="gm-palette" role="group" aria-label={tx(L('Numbers', 'సంఖ్యలు'))}>
        {palette.map((v) => {
          const usedUp = round.kind === 'magic' && progress.grid.includes(v);
          return <button key={v} type="button" className={`btn gm-pal ${usedUp ? 'used' : ''}`} disabled={solved || isGiven(sel)} onClick={() => { setCell(sel, v); say(L(String(v))); cells.current[sel]?.focus(); }}>{v}{usedUp && <span className="sr-only"> (used)</span>}</button>;
        })}
        <Button icon="x" disabled={solved || isGiven(sel)} onClick={() => setCell(sel, 0)}>{tx(L('Erase', 'తుడిచివేయి'))}</Button>
        <Button icon="check" variant="primary" disabled={solved} onClick={check}>{tx(L('Check', 'సరిచూడు'))}</Button>
      </div>
    </div>
  );
}

export const logicModule: GameModule<LogicRound, LP> = {
  id: 'logic',
  generate: generateLogic,
  init: (r) => ({ grid: r.givens.slice(), sel: Math.max(0, r.givens.findIndex((v) => !v)), shown: [] }),
  instructions: (r) => r.kind === 'sudoku'
    ? L(`Fill the grid so every row, column and box has the numbers 1 to ${r.n} exactly once. Pick a square, then a number (or type it).`, `ప్రతి వరుస, నిలువు వరుస, పెట్టెలో 1 నుండి ${r.n} వరకు సంఖ్యలు ఒక్కసారే వచ్చేలా నింపండి.`)
    : L(`Place the numbers ${r.numbers[0]}–${r.numbers[8]} so every row, column and diagonal adds up to ${r.total}.`, `ప్రతి వరుస, నిలువు, కర్ణం మొత్తం ${r.total} అయ్యేలా సంఖ్యలను ఉంచండి.`),
  hints: (r, p) => {
    if (r.kind === 'magic') {
      const center = r.solution[4];
      return [
        L(`Each line must add up to ${r.total}. Look for a line with only one empty square.`, `ఒకే ఖాళీ ఉన్న వరుస కోసం చూడండి.`),
        L(`The middle square is always the middle number: ${center}.`, `మధ్య గడిలో ఎప్పుడూ మధ్య సంఖ్య: ${center}.`),
      ];
    }
    const hs: L[] = [L('Look for a row, column or box that is missing only one number.', 'ఒకే సంఖ్య లేని వరుస లేదా పెట్టె కోసం చూడండి.')];
    const empties = p.grid.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    const single = empties.find((i) => candidates(p.grid, i, r.n, r.br, r.bc).length === 1);
    const i = single ?? empties[0];
    if (i !== undefined) {
      const rr = Math.floor(i / r.n) + 1, cc = (i % r.n) + 1;
      hs.push(single !== undefined
        ? L(`Row ${rr}, column ${cc} can only be ${r.solution[i]} — every other number is already used nearby.`, `వరుస ${rr}, నిలువు ${cc}లో ${r.solution[i]} మాత్రమే రాగలదు.`)
        : L(`Row ${rr}, column ${cc} is ${r.solution[i]}.`, `వరుస ${rr}, నిలువు ${cc} = ${r.solution[i]}.`));
    }
    return hs;
  },
  View,
};
