import { generateFractions, checkMatch, decText, type FractionsRound, type FracCard } from '../gen/fractions';
import { L } from '../gen/common';
import type { GameModule, ViewProps } from '../Shell';
import { FracPicture } from './art';
import { Icon } from '../../../ui/Icon';

interface FP { matched: [string, string][]; selL: string | null; selR: string | null; wrong: [string, string] | null }

const spoken = (c: FracCard) => (c.kind === 'bar' || c.kind === 'circle' ? `picture: ${c.num} of ${c.den} parts` : c.kind === 'frac' ? `${c.num} over ${c.den}` : c.text);

function CardFace({ c }: { c: FracCard }) {
  if (c.kind === 'bar' || c.kind === 'circle') return <FracPicture kind={c.kind} num={c.num} den={c.den} size={c.den > 8 ? 200 : 170} />;
  if (c.kind === 'frac') return <span className="gm-frac" aria-hidden="true"><span>{c.num}</span><span>{c.den}</span></span>;
  return <span className="gm-frac-text" aria-hidden="true">{c.text}</span>;
}

function View({ round, progress, setProgress, solved, mistake, complete, tx }: ViewProps<FractionsRound, FP>) {
  const isMatched = (id: string) => progress.matched.some(([a, b]) => a === id || b === id);
  const tryPair = (l: string, r: string) => {
    const a = round.left.find((c) => c.id === l)!, b = round.right.find((c) => c.id === r)!;
    if (checkMatch(round, l, r)) {
      const matched: [string, string][] = [...progress.matched, [l, r]];
      setProgress({ matched, selL: null, selR: null, wrong: null });
      if (matched.length === round.left.length) complete(L('All matched! Every pair shows the same amount.', 'అన్నీ జత అయ్యాయి!'));
    } else {
      setProgress({ ...progress, selL: null, selR: null, wrong: [l, r] });
      const va = `${a.num}/${a.den} = ${decText(a.num, a.den).length <= 6 ? decText(a.num, a.den) : (a.num / a.den).toFixed(3)}`;
      const vb = `${b.num}/${b.den} = ${decText(b.num, b.den).length <= 6 ? decText(b.num, b.den) : (b.num / b.den).toFixed(3)}`;
      mistake(L(`Those are not equal: ${va}, but ${vb}.`, `అవి సమానం కావు: ${va}, ${vb}.`));
    }
  };
  const pick = (side: 'L' | 'R', id: string) => {
    if (solved || isMatched(id)) return;
    if (side === 'L') {
      const selL = progress.selL === id ? null : id;
      if (selL && progress.selR) tryPair(selL, progress.selR); else setProgress({ ...progress, selL, wrong: null });
    } else {
      const selR = progress.selR === id ? null : id;
      if (selR && progress.selL) tryPair(progress.selL, selR); else setProgress({ ...progress, selR, wrong: null });
    }
  };
  const col = (cards: FracCard[], side: 'L' | 'R') => (
    <div className="gm-fcol" role="group" aria-label={tx(side === 'L' ? L('Left cards', 'ఎడమ కార్డులు') : L('Right cards', 'కుడి కార్డులు'))}>
      {cards.filter((c) => !isMatched(c.id)).map((c) => {
        const sel = (side === 'L' ? progress.selL : progress.selR) === c.id;
        const wrong = progress.wrong?.includes(c.id);
        return (
          <button key={c.id} type="button" className={`choice gm-fcard ${wrong ? 'is-wrong gm-shake' : ''}`} aria-pressed={sel} aria-label={spoken(c)} onClick={() => pick(side, c.id)}>
            <CardFace c={c} />
            {sel && <Icon name="hand" />}
            {wrong && <Icon name="x" />}
          </button>
        );
      })}
    </div>
  );
  return (
    <div className="stack">
      <div className="gm-fboard">
        {col(round.left, 'L')}
        {col(round.right, 'R')}
      </div>
      {progress.matched.length > 0 && (
        <ul className="gm-matched" aria-label={tx(L('Matched pairs', 'జత అయినవి'))}>
          {progress.matched.map(([l, r], i) => {
            const a = round.left.find((c) => c.id === l)!, b = round.right.find((c) => c.id === r)!;
            return (
              <li key={l} className={i === progress.matched.length - 1 ? 'gm-join' : ''}>
                <span className="gm-mcard"><CardFace c={a} /></span>
                <span className="gm-eq" aria-label="equals">=</span>
                <span className="gm-mcard"><CardFace c={b} /></span>
                <Icon name="check" label={tx(L(`${spoken(a)} equals ${spoken(b)}`, 'సమానం'))} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export const fractionsModule: GameModule<FractionsRound, FP> = {
  id: 'fractions',
  generate: generateFractions,
  init: () => ({ matched: [], selL: null, selR: null, wrong: null }),
  instructions: (r) => r.level === 0
    ? L('Match each picture to its fraction. Tap a card on the left, then its partner on the right.', 'ప్రతి చిత్రాన్ని దాని భిన్నంతో జత చేయండి. ఎడమ కార్డు తాకి, తర్వాత కుడి వైపు జత తాకండి.')
    : L('Match cards that show the same amount (fractions, decimals, percentages or pictures). Tap one on the left, then its partner on the right.', 'ఒకే విలువ చూపే కార్డులను జత చేయండి. ఎడమది తాకి, తర్వాత కుడి వైపు జత తాకండి.'),
  hints: (r) => [
    r.level <= 1
      ? L('Equivalent fractions: multiply the top and bottom by the same number. 1/2 = 2/4 = 3/6.', 'పైన, కింద ఒకే సంఖ్యతో గుణిస్తే సమాన భిన్నం వస్తుంది: 1/2 = 2/4.')
      : L('Turn everything into a decimal: divide the top by the bottom. 50% = 0.5, 25% = 0.25.', 'అన్నింటినీ దశాంశంగా మార్చండి: పైది కిందితో భాగించండి.'),
    L('Start with the easy ones: one half is 0.5 or 50%; one quarter is 0.25 or 25%.', 'సులభమైనవి ముందు: సగం = 0.5 = 50%.'),
  ],
  View,
};
