// Renders one practice/test item: prompt, picture, gloss, and the right input for its type.
import { useEffect, useId, useState } from 'react';
import { Icon } from '../../ui/Icon';
import { Button } from '../../ui/kit';
import type { Item, Script } from './types';
import { Gloss, Pic, T } from './common';
import { tileText } from './util';
import { TeluguKeyboard } from './TeluguKeyboard';

export type Value = string | string[] | undefined;

export interface ItemViewProps {
  item: Item;
  choices: string[];
  script: Script;
  value: Value;
  onChange: (v: Value) => void;
  /** Lock input (after a correct practice answer or after test submission). */
  locked?: boolean;
  /** Show right / wrong marks. */
  reveal?: boolean;
  eliminated?: string[];
  gloss: boolean;
  typing: boolean;
  teVoice: boolean;
  say: (text: string, s: Script) => Promise<boolean>;
  autoSay?: boolean;
}

export function ItemView(p: ItemViewProps) {
  const { item, script, gloss } = p;
  const [heard, setHeard] = useState(false);
  const promptId = useId();
  const spoken = item.say || (item.type === 'listen' ? item.answer[0] : '');
  const listenOnly = item.type === 'listen';
  const canHear = script === 'en' || p.teVoice;

  useEffect(() => {
    setHeard(false);
    if (p.autoSay) void p.say(listenOnly ? spoken : item.prompt, listenOnly ? script : script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  return (
    <div className="lang-item stack" role="group" aria-labelledby={promptId}>
      <div className="lang-prompt">
        <div className="row lang-prompt-row">
          <T script={script} className="lang-prompt-text"><span id={promptId}>{item.prompt}</span></T>
          <button type="button" className="btn small" onClick={() => void p.say(item.prompt, script)} aria-label="Read the question aloud"><Icon name="speaker" /></button>
        </div>
        <Gloss show={gloss}>{item.en}</Gloss>
      </div>
      {(item.pic || listenOnly || spoken) && (
        <div className="row lang-stimulus">
          {item.pic && <Pic emoji={item.pic} label={item.picLabel || 'picture'} big />}
          {spoken && (
            <Button icon="speaker" onClick={() => { void p.say(spoken, script); setHeard(true); }} className="lang-hear">
              {listenOnly ? 'Play the sound' : 'Hear the word'}
            </Button>
          )}
          {listenOnly && (!canHear || p.reveal) && <span className="pill" aria-live="polite">Read it: <T script={script}>{spoken}</T></span>}
          {listenOnly && canHear && !p.reveal && heard && <span className="muted small">Tap Play again to hear it once more.</span>}
        </div>
      )}
      <Input {...p} />
    </div>
  );
}

function Input(p: ItemViewProps) {
  const { item } = p;
  if (item.type === 'build' || item.type === 'order') return <Tiles {...p} />;
  if (item.type === 'type' && p.typing) return <Typed {...p} />;
  return <Choices {...p} />;
}

function Choices({ item, choices, script, value, onChange, locked, reveal, eliminated, gloss }: ItemViewProps) {
  const pics = item.picChoices ? item.pics || {} : null;
  return (
    <div className={`lang-choices ${pics ? 'pics' : ''}`} role="group" aria-label="Answer choices">
      {choices.map((c) => {
        const chosen = value === c;
        const right = item.answer.includes(c);
        const gone = eliminated?.includes(c);
        const cls = reveal ? (right ? 'is-right' : chosen ? 'is-wrong' : '') : '';
        const label = pics ? `${gloss || reveal ? c + (item.gloss?.[c] ? ` (${item.gloss[c]})` : '') : item.gloss?.[c] || 'picture'}` : undefined;
        return (
          <button key={c} type="button" className={`choice lang-choice ${cls} ${gone ? 'gone' : ''}`} aria-pressed={chosen} disabled={locked || gone}
            aria-label={label} onClick={() => onChange(c)}>
            {pics ? <span className="lang-pic big" aria-hidden="true">{pics[c]}</span> : <T script={script}>{c}</T>}
            {pics && (reveal || gloss) && <T script={script} className="lang-under">{c}</T>}
            {!pics && gloss && item.gloss?.[c] && <span className="lang-gloss inline">{item.gloss[c]}</span>}
            {reveal && right && <span className="lang-mark"><Icon name="check" />Correct</span>}
            {reveal && chosen && !right && <span className="lang-mark"><Icon name="x" />Your answer</span>}
            {gone && <span className="sr-only">(removed by hint)</span>}
          </button>
        );
      })}
    </div>
  );
}

function Tiles({ item, choices, script, value, onChange, locked, reveal }: ItemViewProps) {
  const seq = Array.isArray(value) ? value : [];
  // tiles may repeat ("the" twice): mark the first N identical tiles as used
  const usedCount: Record<string, number> = {};
  seq.forEach((t) => (usedCount[t] = (usedCount[t] || 0) + 1));
  const seen: Record<string, number> = {};
  const used = choices.map((t) => { seen[t] = (seen[t] || 0) + 1; return seen[t] <= (usedCount[t] || 0); });
  const joiner = item.type === 'build' ? '' : ' ';
  return (
    <div className="stack">
      <div className={`lang-slots ${reveal ? 'revealed' : ''}`} aria-live="polite" aria-label="Your answer">
        {seq.length === 0 && <span className="muted">{item.type === 'build' ? 'Tap the pieces in order.' : 'Tap the words in order.'}</span>}
        {seq.map((t, i) => (
          <button key={i} type="button" className="btn lang-tile placed" disabled={locked} aria-label={`Remove ${t}`} onClick={() => onChange(seq.filter((_, j) => j !== i))}>
            <T script={script}>{tileText(t, script)}</T>
          </button>
        ))}
        {item.type === 'build' && seq.length > 0 && <span className="lang-built" aria-label="Built so far"><T script={script}>= {seq.join(joiner)}</T></span>}
      </div>
      <div className="lang-tiles" role="group" aria-label="Pieces">
        {choices.map((t, i) => (
          <button key={i} type="button" className="btn lang-tile" disabled={locked || used[i]} aria-pressed={used[i]} onClick={() => onChange([...seq, t])}>
            <T script={script}>{tileText(t, script)}</T>
          </button>
        ))}
      </div>
      {!locked && seq.length > 0 && <div><Button small icon="undo" onClick={() => onChange(seq.slice(0, -1))}>Undo</Button> <Button small variant="ghost" icon="reset" onClick={() => onChange([])}>Clear</Button></div>}
      {reveal && <div className="pill">Answer: <T script={script}>{item.answer.join(joiner)}</T></div>}
    </div>
  );
}

function Typed({ item, script, value, onChange, locked, reveal }: ItemViewProps) {
  const v = typeof value === 'string' ? value : '';
  const id = useId();
  return (
    <div className="stack">
      <label htmlFor={id} className="muted small">Type your answer</label>
      <input id={id} className={`input lang-${script}`} lang={script} value={v} disabled={locked} autoComplete="off" spellCheck={false}
        onChange={(e) => onChange(e.target.value)} inputMode={script === 'te' ? 'none' : 'text'} />
      {script === 'te' && !locked && <TeluguKeyboard onKey={(k) => onChange(v + k)} onBackspace={() => onChange([...v].slice(0, -1).join(''))} onSpace={() => onChange(v + ' ')} />}
      {reveal && <div className="pill">Answer: <T script={script}>{item.answer[0]}</T></div>}
    </div>
  );
}
