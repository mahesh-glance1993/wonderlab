import { generateCounting, checkCounting, OBJECT_NAMES, type CountingRound, type CountObject } from '../gen/counting';
import { L } from '../gen/common';
import type { GameModule, ViewProps } from '../Shell';
import { CountSvg } from './art';
import { Icon } from '../../../ui/Icon';

interface CP { counted: number[]; choice: number | null }

function Groups({ object, n, groupSize, size = 34 }: { object: CountObject; n: number; groupSize: number; size?: number }) {
  const rows = Math.ceil(n / groupSize);
  return (
    <span className="gm-groups">
      {Array.from({ length: rows }, (_, r) => (
        <span className="gm-group-row" key={r}>
          {Array.from({ length: Math.min(groupSize, n - r * groupSize) }, (_, i) => <CountSvg key={i} object={object} size={size} />)}
        </span>
      ))}
    </span>
  );
}

function View({ round, progress, setProgress, solved, mistake, complete, tx, say, hints }: ViewProps<CountingRound, CP>) {
  if (round.kind === 'match') {
    const choose = (i: number) => {
      if (solved) return;
      setProgress({ ...progress, choice: i });
      if (checkCounting(round, i)) complete(L(`Yes! That group has ${round.target}.`, `అవును! ఆ గుంపులో ${round.target} ఉన్నాయి.`));
      else mistake(L(`That group has ${round.groups[i].n}. Count again to find ${round.target}.`, `ఆ గుంపులో ${round.groups[i].n} ఉన్నాయి. ${round.target} కోసం మళ్ళీ లెక్కించండి.`));
    };
    return (
      <div className="stack">
        <div className="gm-bignum" aria-label={`Find ${round.target}`}>{round.target}</div>
        <div className="gm-choice-grid">
          {round.groups.map((g, i) => {
            const state = progress.choice === i ? (checkCounting(round, i) ? 'is-right' : 'is-wrong') : '';
            return (
              <button key={i} type="button" className={`choice gm-group-card ${state}`} aria-pressed={progress.choice === i} disabled={solved && progress.choice !== i}
                aria-label={`${tx(L('Group', 'గుంపు'))} ${String.fromCharCode(65 + i)}: ${g.n} ${tx(OBJECT_NAMES[g.object])}`} onClick={() => choose(i)}>
                <Groups object={g.object} n={g.n} groupSize={round.groupSize} size={hints >= 3 ? 30 : 34} />
                {state === 'is-right' && <Icon name="check" />}
                {state === 'is-wrong' && <Icon name="x" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const name = OBJECT_NAMES[round.object];
  const count = progress.counted.length;
  const tap = (i: number) => {
    if (progress.counted.includes(i) || solved) return;
    const next = count + 1;
    setProgress({ ...progress, counted: [...progress.counted, i] });
    say(L(String(next)));
  };
  const choose = (v: number) => {
    if (solved) return;
    setProgress({ ...progress, choice: v });
    if (checkCounting(round, v)) complete(L(`Yes! There are ${round.n} ${name.en}.`, `అవును! ${round.n} ${name.te} ఉన్నాయి.`));
    else mistake(count < round.n
      ? L(`Not ${v}. Some ${name.en} are not counted yet — tap them all.`, `${v} కాదు. ఇంకా కొన్ని లెక్కించలేదు — అన్నింటినీ తాకండి.`)
      : L(`Not ${v}. Look at the tray and count again.`, `${v} కాదు. ట్రేలో చూసి మళ్ళీ లెక్కించండి.`));
  };
  return (
    <div className="gm-count">
      <div className="gm-count-field" role="group" aria-label={tx(L(`${name.en} to count`, `లెక్కించాల్సిన ${name.te}`))}>
        {Array.from({ length: round.n }, (_, i) => {
          const done = progress.counted.includes(i);
          return (
            <button key={i} type="button" className={`gm-obj-btn ${done ? 'counted' : ''}`} disabled={done || solved}
              style={{ transform: `translateY(${((i * 37) % 3) * 6 - 6}px) rotate(${((i * 53) % 5) * 6 - 12}deg)` }}
              aria-label={done ? tx(L(`${name.en} ${progress.counted.indexOf(i) + 1}, counted`, `${progress.counted.indexOf(i) + 1}, లెక్కించారు`)) : tx(L(`${name.en}, not counted yet`, `ఇంకా లెక్కించలేదు`))}
              onClick={() => tap(i)}>
              <CountSvg object={round.object} size={52} />
            </button>
          );
        })}
      </div>
      <div className="gm-tray" aria-label={tx(L('Counted', 'లెక్కించినవి'))}>
        <div className="gm-running" aria-live="polite"><span className="sr-only">{tx(L('Counted so far:', 'ఇప్పటివరకు:'))} </span>{count}</div>
        <div className="gm-tray-rows">
          {Array.from({ length: Math.ceil(count / round.groupSize) }, (_, r) => (
            <div className="gm-group-row gm-tray-row" key={r}>
              {progress.counted.slice(r * round.groupSize, (r + 1) * round.groupSize).map((idx, k) => (
                <span className="gm-pop" key={idx}><CountSvg object={round.object} size={34} /><small>{r * round.groupSize + k + 1}</small></span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="gm-q">{tx(L(`How many ${name.en}?`, `ఎన్ని ${name.te}?`))}</p>
      <div className="gm-options" role="group" aria-label={tx(L('Choose the number', 'సంఖ్యను ఎంచుకోండి'))}>
        {round.options.map((o) => {
          const picked = progress.choice === o;
          const state = picked ? (o === round.n ? 'is-right' : 'is-wrong') : '';
          return <button key={o} type="button" className={`choice gm-num ${state}`} aria-pressed={picked} disabled={solved && !picked} onClick={() => choose(o)}>{o}{state === 'is-right' && <Icon name="check" />}</button>;
        })}
      </div>
    </div>
  );
}

export const countingModule: GameModule<CountingRound, CP> = {
  id: 'counting',
  generate: generateCounting,
  init: () => ({ counted: [], choice: null }),
  instructions: (r) => r.kind === 'count'
    ? L(`Tap each ${OBJECT_NAMES[r.object].en.replace(/s$/, '')} to count it. Then choose how many there are.`, `ప్రతి దాన్ని తాకి లెక్కించండి. తర్వాత ఎన్ని ${OBJECT_NAMES[r.object].te} ఉన్నాయో ఎంచుకోండి.`)
    : L(`Find the group that has ${r.target}.`, `${r.target} ఉన్న గుంపును కనుగొనండి.`),
  hints: (r) => r.kind === 'count'
    ? [
      L('Touch each one only once. Say the number out loud as you touch it.', 'ప్రతి దాన్ని ఒక్కసారే తాకండి. తాకుతూ సంఖ్యను పైకి చెప్పండి.'),
      L(`Counted ones line up in rows of ${r.groupSize}. A full row is ${r.groupSize}.`, `లెక్కించినవి ${r.groupSize} చొప్పున వరుసల్లో ఉంటాయి.`),
      L(`The last number you say is how many there are.`, 'మీరు చెప్పే చివరి సంఖ్యే మొత్తం.'),
    ]
    : [
      L('Count each group carefully, one at a time.', 'ప్రతి గుంపును జాగ్రత్తగా లెక్కించండి.'),
      L(`Rows of ${r.groupSize} help: a full row is ${r.groupSize}.`, `${r.groupSize} వరుసలు సహాయపడతాయి.`),
      L(`${r.target} is ${Math.floor(r.target / r.groupSize)} full row(s) and ${r.target % r.groupSize} more.`, `${r.target} = ${Math.floor(r.target / r.groupSize)} పూర్తి వరుసలు + ${r.target % r.groupSize}.`),
    ],
  View,
};
