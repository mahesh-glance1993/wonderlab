import { generatePatterns, checkPattern, patternAnswer, unitSeq, numberSeq, tokenKey, type PatternsRound, type Token } from '../gen/patterns';
import { SHAPE_NAMES, COLOR_NAMES } from '../gen/shapes';
import { L } from '../gen/common';
import type { GameModule, ViewProps } from '../Shell';
import { ShapeSvg } from './art';
import { Icon } from '../../../ui/Icon';

interface PP { choice: string | null }
const tokName = (t: Token): L => L(`${COLOR_NAMES[t.color].en} ${SHAPE_NAMES[t.shape].en}`, `${COLOR_NAMES[t.color].te} ${SHAPE_NAMES[t.shape].te}`);
const optKey = (o: Token | number) => (typeof o === 'number' ? String(o) : tokenKey(o));

function View({ round, progress, setProgress, solved, mistake, complete, tx, say, hints }: ViewProps<PatternsRound, PP>) {
  const seq: (Token | number)[] = round.kind === 'unit' ? unitSeq(round) : numberSeq(round);
  const ans = patternAnswer(round);
  const options: (Token | number)[] = round.options;
  const choose = (o: Token | number) => {
    if (solved) return;
    setProgress({ choice: optKey(o) });
    if (checkPattern(round, o)) complete(L('Yes! That keeps the pattern going.', 'అవును! నమూనా సరిగ్గా కొనసాగుతుంది.'));
    else mistake(typeof o === 'number'
      ? L(`${o} does not fit. Look at how each number changes.`, `${o} సరిపోదు. ప్రతి సంఖ్య ఎలా మారుతుందో చూడండి.`)
      : L(`The ${tokName(o).en} does not fit there. Say the pattern out loud.`, `${tokName(o).te} అక్కడ సరిపోదు. నమూనాను పైకి చెప్పండి.`));
  };
  const showUnits = round.kind === 'unit' && hints >= 2;
  return (
    <div className="stack">
      <ol className={`gm-seq ${round.kind}`} aria-label={tx(L('Pattern', 'నమూనా'))}>
        {seq.map((t, i) => {
          const blank = i === round.blank && !solved;
          const unitStart = showUnits && round.kind === 'unit' && i % round.unit.length === 0;
          return (
            <li key={i} className={`gm-seq-item ${blank ? 'blank' : ''} ${unitStart ? 'unit-start' : ''} ${i === round.blank && solved ? 'gm-pop' : ''}`}>
              {blank ? <span aria-label={tx(L('missing', 'ఖాళీ'))}>?</span>
                : typeof t === 'number' ? <span className="gm-seq-num">{t < 0 ? `−${-t}` : t}</span>
                : <ShapeSvg shape={t.shape} color={t.color} size={52} label={tx(tokName(t))} />}
            </li>
          );
        })}
      </ol>
      <p className="gm-q">{tx(L('What goes in the empty space?', 'ఖాళీలో ఏమి వస్తుంది?'))}</p>
      <div className="gm-options" role="group" aria-label={tx(L('Choices', 'ఎంపికలు'))}>
        {options.map((o) => {
          const k = optKey(o);
          const picked = progress.choice === k;
          const right = picked && optKey(ans) === k;
          return (
            <button key={k} type="button" className={`choice gm-num ${picked ? (right ? 'is-right' : 'is-wrong') : ''}`} aria-pressed={picked} disabled={solved && !picked}
              aria-label={typeof o === 'number' ? String(o) : tx(tokName(o))}
              onClick={() => { choose(o); if (typeof o !== 'number') say(tokName(o)); }}>
              {typeof o === 'number' ? (o < 0 ? `−${-o}` : o) : <ShapeSvg shape={o.shape} color={o.color} size={48} />}
              {picked && <Icon name={right ? 'check' : 'x'} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ruleText(r: Extract<PatternsRound, { kind: 'number' }>): L {
  const x = r.rule;
  switch (x.type) {
    case 'arith': return x.step > 0 ? L(`Add ${x.step} each time.`, `ప్రతిసారి ${x.step} కలపండి.`) : L(`Take away ${-x.step} each time.`, `ప్రతిసారి ${-x.step} తీసివేయండి.`);
    case 'geom': return L(`Multiply by ${x.ratio} each time.`, `ప్రతిసారి ${x.ratio}తో గుణించండి.`);
    case 'growing': return L(`The jumps grow by 1: +${x.firstStep}, +${x.firstStep + 1}, +${x.firstStep + 2}, …`, `దూకులు 1 చొప్పున పెరుగుతాయి.`);
    case 'squares': return L(`These are square numbers: ${x.offset}×${x.offset}, ${x.offset + 1}×${x.offset + 1}, …`, 'ఇవి వర్గ సంఖ్యలు.');
  }
}

export const patternsModule: GameModule<PatternsRound, PP> = {
  id: 'patterns',
  generate: generatePatterns,
  init: () => ({ choice: null }),
  instructions: (r) => r.kind === 'unit'
    ? L('Look at the pattern. Which shape comes in the empty space?', 'నమూనాను చూడండి. ఖాళీలో ఏ ఆకారం వస్తుంది?')
    : L('Find the rule of the number pattern. Which number goes in the empty space?', 'సంఖ్యల నమూనా నియమం కనుగొనండి. ఖాళీలో ఏ సంఖ్య వస్తుంది?'),
  hints: (r) => r.kind === 'unit'
    ? [
      L('Say the pattern out loud from the start: ' + r.unit.map((t) => tokName(t).en).join(', ') + ' …', 'మొదటి నుండి నమూనాను పైకి చెప్పండి.'),
      L(`The pattern repeats every ${r.unit.length} shapes (${r.unitName}). The repeats are marked.`, `నమూనా ప్రతి ${r.unit.length} ఆకారాలకు మళ్ళీ వస్తుంది.`),
    ]
    : [
      L('Find the difference between neighbouring numbers.', 'పక్క పక్క సంఖ్యల మధ్య తేడా కనుగొనండి.'),
      ruleText(r),
    ],
  View,
};
