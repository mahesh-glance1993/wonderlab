import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { generateShapes, checkDrop, binFor, pieceValue, SHAPE_NAMES, COLOR_NAMES, SIDES, type ShapesRound, type Piece } from '../gen/shapes';
import { L } from '../gen/common';
import type { GameModule, ViewProps } from '../Shell';
import { ShapeSvg } from './art';
import { Icon } from '../../../ui/Icon';

interface SP { placed: Record<string, string>; selected: string | null; last: string | null }

const pieceName = (p: Piece): L => L(`${COLOR_NAMES[p.color].en} ${SHAPE_NAMES[p.shape].en}`, `${COLOR_NAMES[p.color].te} ${SHAPE_NAMES[p.shape].te}`);

function View({ round, progress, setProgress, solved, mistake, complete, notice, tx, say }: ViewProps<ShapesRound, SP>) {
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const start = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);
  const loose = round.pieces.filter((p) => !progress.placed[p.id]);

  const drop = (pieceId: string, binId: string) => {
    if (solved) return;
    const p = round.pieces.find((x) => x.id === pieceId)!;
    const bin = round.bins.find((b) => b.id === binId)!;
    if (checkDrop(round, pieceId, binId)) {
      const placed = { ...progress.placed, [pieceId]: binId };
      setProgress({ placed, selected: null, last: pieceId });
      say(L(`${pieceName(p).en} in ${bin.label.en}`, `${pieceName(p).te} — ${bin.label.te}`));
      if (Object.keys(placed).length === round.pieces.length) complete(L('All sorted! Every shape is in the right bin.', 'అన్నీ సరిగ్గా వేరు చేశారు!'));
    } else {
      setProgress({ ...progress, selected: null });
      const why = round.attr === 'sides'
        ? L(`A ${SHAPE_NAMES[p.shape].en} has ${SIDES[p.shape]} sides, not ${bin.value}.`, `${SHAPE_NAMES[p.shape].te}కి ${SIDES[p.shape]} భుజాలు ఉంటాయి.`)
        : L(`That is a ${pieceName(p).en}. It does not go in "${bin.label.en}". Try another bin.`, `అది ${pieceName(p).te}. వేరే డబ్బా ప్రయత్నించండి.`);
      mistake(why);
    }
  };

  const select = (id: string) => {
    if (solved) return;
    const sel = progress.selected === id ? null : id;
    setProgress({ ...progress, selected: sel });
    if (sel) { const p = round.pieces.find((x) => x.id === id)!; say(pieceName(p)); }
  };

  // pointer drag with tap fallback
  const onDown = (e: PointerEvent<HTMLButtonElement>, id: string) => {
    if (solved || e.button !== 0) return;
    justDragged.current = false;
    start.current = { id, x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    if (!s) return;
    if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 8) s.moved = true;
    if (s.moved) setDrag({ id: s.id, x: e.clientX, y: e.clientY });
  };
  const onUp = (e: PointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    start.current = null;
    setDrag(null);
    if (!s || !s.moved) return; // a tap: handled by onClick
    justDragged.current = true;
    e.preventDefault();
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-bin]');
    if (el?.dataset.bin) drop(s.id, el.dataset.bin);
  };

  const onKey = (e: KeyboardEvent) => {
    const n = parseInt(e.key, 10);
    if (progress.selected && n >= 1 && n <= round.bins.length) { e.preventDefault(); drop(progress.selected, round.bins[n - 1].id); }
    if (e.key === 'Escape' && progress.selected) setProgress({ ...progress, selected: null });
  };
  const dragPiece = drag && round.pieces.find((p) => p.id === drag.id);

  return (
    <div className="gm-shapes" onKeyDown={onKey}>
      <p className="sr-only" id="gm-shapes-help">{tx(L('Select a shape, then choose a bin. With a keyboard: Enter selects a shape, then press the bin number.', 'ఆకారాన్ని ఎంచుకుని, తర్వాత డబ్బాను ఎంచుకోండి.'))}</p>
      <div className="gm-pieces" role="group" aria-label={tx(L('Shapes to sort', 'వేరు చేయాల్సిన ఆకారాలు'))} aria-describedby="gm-shapes-help">
        {loose.map((p) => (
          <button key={p.id} type="button" className={`gm-piece ${progress.selected === p.id ? 'selected' : ''} ${drag?.id === p.id ? 'dragging' : ''}`}
            aria-pressed={progress.selected === p.id} aria-label={tx(pieceName(p))}
            onPointerDown={(e) => onDown(e, p.id)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { start.current = null; setDrag(null); }}
            onClick={() => { if (justDragged.current) { justDragged.current = false; return; } select(p.id); }}>
            <ShapeSvg shape={p.shape} color={p.color} rot={p.rot} size={[0, 48, 60, 72][p.size]} />
            {progress.selected === p.id && <Icon name="hand" className="gm-sel-icon" />}
          </button>
        ))}
        {!loose.length && <span className="muted">{tx(L('All shapes sorted.', 'అన్ని ఆకారాలు వేరు చేశారు.'))}</span>}
      </div>
      <div className="gm-bins">
        {round.bins.map((b, i) => {
          const inBin = round.pieces.filter((p) => progress.placed[p.id] === b.id);
          return (
            <button key={b.id} type="button" data-bin={b.id} className={`gm-bin ${progress.selected ? 'ready' : ''}`}
              aria-label={`${tx(L('Bin', 'డబ్బా'))} ${i + 1}: ${tx(b.label)}. ${inBin.length} ${tx(L('inside', 'లోపల'))}`}
              onClick={() => (progress.selected ? drop(progress.selected, b.id) : notice(L('First choose a shape, then tap a bin.', 'ముందు ఒక ఆకారాన్ని ఎంచుకోండి.')))}>
              <span className="gm-bin-label">
                <kbd aria-hidden="true">{i + 1}</kbd>
                {round.attr === 'color' && <ShapeSvg shape="square" color={b.value as never} size={22} />}
                {round.attr === 'shape' && <ShapeSvg shape={b.value as never} color="blue" size={22} />}
                {tx(b.label)}
              </span>
              <span className="gm-bin-items">
                {inBin.map((p) => <span key={p.id} className={progress.last === p.id ? 'gm-snap' : ''}><ShapeSvg shape={p.shape} color={p.color} rot={p.rot} size={34} label={tx(pieceName(p))} /></span>)}
              </span>
            </button>
          );
        })}
      </div>
      {drag && dragPiece && (
        <div className="gm-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true"><ShapeSvg shape={dragPiece.shape} color={dragPiece.color} rot={dragPiece.rot} size={64} /></div>
      )}
    </div>
  );
}

const attrText: Record<ShapesRound['attr'], L> = {
  color: L('colour', 'రంగు'), shape: L('shape', 'ఆకారం'), sides: L('number of sides', 'భుజాల సంఖ్య'),
};

export const shapesModule: GameModule<ShapesRound, SP> = {
  id: 'shapes',
  generate: generateShapes,
  init: () => ({ placed: {}, selected: null, last: null }),
  instructions: (r) => L(
    `Sort the shapes by ${attrText[r.attr].en}. Drag a shape into a bin — or tap a shape, then tap its bin.`,
    `ఆకారాలను ${attrText[r.attr].te} ప్రకారం వేరు చేయండి. ఆకారాన్ని లాగి డబ్బాలో వేయండి — లేదా ఆకారాన్ని తాకి, తర్వాత డబ్బాను తాకండి.`,
  ),
  hints: (r, p) => {
    const next = r.pieces.find((x) => !p.placed[x.id]);
    const h = [
      r.attr === 'sides' ? L('Count the straight edges of each shape. A circle has no straight sides.', 'ప్రతి ఆకారం యొక్క సరళ అంచులను లెక్కించండి.')
        : r.attr === 'shape' ? L('Look at the corners and sides: triangles have 3 corners, squares have 4 equal sides.', 'మూలలు, భుజాలు చూడండి: త్రిభుజానికి 3 మూలలు.')
        : L('Look only at the colour and the pattern inside the shape.', 'ఆకారం లోపలి రంగు, నమూనా మాత్రమే చూడండి.'),
    ];
    if (next) {
      const b = binFor(r, next)!;
      h.push(L(`The ${pieceName(next).en} goes in "${b.label.en}" (${r.attr === 'sides' ? `${pieceValue(next, 'sides')} sides` : b.label.en}).`, `${pieceName(next).te} — "${b.label.te}" డబ్బాలోకి.`));
    }
    return h;
  },
  View,
};
