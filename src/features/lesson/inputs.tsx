// Answer inputs for every item type. All controlled: value is a grading Response (or null).
import { useEffect, useId, useRef, useState, type KeyboardEvent as RKE, type PointerEvent as RPE } from 'react';
import type { Question, VisualSpec } from '../../shared/content';
import { grade, type Response } from '../../shared/grading';
import type { Tier } from '../../shared/levels';
import { useApp, useL } from '../../lib/app';
import { Icon } from '../../ui/Icon';
import { IconButton } from '../../ui/kit';
import {
  KEY_LABEL, KEY_NAME, applyKey, choiceIdOf, initialOrder, inputKindFor, keypadRows, lineIndex, lineLabel, lineResponseValue, responseForChoice, unitChips,
} from './logic';
import { Visual } from './Visual';
import { useS } from './strings';

export interface InputProps {
  q: Question;
  value: Response | null;
  onChange: (r: Response) => void;
  /** answer can no longer change (checked / review) */
  locked?: boolean;
  /** show right/wrong marks against the correct answer */
  reveal?: boolean;
  tier: Tier;
  onSubmit?: () => void;
}

/** The response that will be graded: an untouched 'order' item counts as its starting order. */
export function effectiveResponse(q: Question, r: Response | null): Response | null {
  if (!r && inputKindFor(q) === 'order') return { kind: 'order', value: initialOrder(q) };
  return r;
}

const Mark = ({ ok, label }: { ok: boolean; label: string }) => (
  <span className={`lq-mark ${ok ? 'ok' : 'no'}`}><Icon name={ok ? 'check' : 'x'} /><span className="sr-only">{label}</span></span>
);

export function AnswerInput(p: InputProps) {
  const kind = inputKindFor(p.q);
  switch (kind) {
    case 'choice': return <ChoiceInput {...p} />;
    case 'multi': return <MultiInput {...p} />;
    case 'match': return <MatchInput {...p} />;
    case 'order': return <OrderInput {...p} />;
    case 'numberline': return <NumberLineInput {...p} />;
    case 'count': return p.q.visual?.kind === 'objects'
      ? <CountObjects spec={p.q.visual} locked={p.locked} count={p.value?.kind === 'text' ? Number(p.value.value) || 0 : 0} onCount={(n) => p.onChange({ kind: 'text', value: String(n) })} />
      : <Stepper {...p} />;
    case 'typed': return (
      <TypedInput value={p.value?.kind === 'text' ? p.value.value : ''} onChange={(v) => p.onChange({ kind: 'text', value: v })}
        locked={p.locked} tier={p.tier} keypad={p.q.keypad} units={unitChips(p.q)} onSubmit={p.onSubmit} qid={p.q.id} />
    );
  }
}

// ---------------------------------------------------------------- choices

function ChoiceInput({ q, value, onChange, locked, reveal, tier }: InputProps) {
  const L = useL();
  const s = useS();
  const { speak } = useApp();
  const sel = choiceIdOf(q, value);
  const pictures = q.type === 'spoken' || (q.choices ?? []).some((c) => c.visual);
  return (
    <div className={`lq-choices ${pictures ? 'pictures' : ''}`} role="group" aria-label={s('typeAnswer')}>
      {(q.choices ?? []).map((c) => {
        const right = !!reveal && grade(q.answer, responseForChoice(q, c.id)).correct;
        const wrong = !!reveal && sel === c.id && !right;
        return (
          <button key={c.id} type="button" className={`choice ${right ? 'is-right' : ''} ${wrong ? 'is-wrong' : ''}`} aria-pressed={sel === c.id} aria-disabled={locked || undefined}
            onClick={() => {
              if (locked) return;
              onChange(responseForChoice(q, c.id));
              if (tier === 'early' || q.type === 'spoken') speak(c.label.en, { te: c.label.te });
            }}>
            {c.visual && <Visual spec={c.visual} size="sm" animate={false} alt={L(c.label)} />}
            <span className={c.visual && pictures ? 'lq-piclabel' : ''}>{L(c.label)}</span>
            {right && <Mark ok label={s('correctAnswer')} />}
            {wrong && <Mark ok={false} label={`${s('yourAnswer')}: ${s('wrong')}`} />}
          </button>
        );
      })}
    </div>
  );
}

function MultiInput({ q, value, onChange, locked, reveal }: InputProps) {
  const L = useL();
  const s = useS();
  const sel = value?.kind === 'multi' ? value.value : [];
  const correct = q.answer.kind === 'multi' ? q.answer.correct : [];
  return (
    <div className="stack">
      <p className="muted lq-help">{s('tapAll')}</p>
      <div className="lq-choices" role="group" aria-label={s('tapAll')}>
        {(q.choices ?? []).map((c) => {
          const on = sel.includes(c.id), isC = correct.includes(c.id);
          const right = !!reveal && isC, wrong = !!reveal && on && !isC;
          return (
            <button key={c.id} type="button" role="checkbox" aria-checked={on} aria-disabled={locked || undefined}
              className={`choice ${on ? 'is-on' : ''} ${right ? 'is-right' : ''} ${wrong ? 'is-wrong' : ''}`}
              onClick={() => { if (!locked) onChange({ kind: 'multi', value: on ? sel.filter((x) => x !== c.id) : [...sel, c.id] }); }}>
              <span className="lq-box" aria-hidden="true">{on ? <Icon name="check" /> : null}</span>
              {c.visual && <Visual spec={c.visual} size="sm" animate={false} alt={L(c.label)} />}
              <span>{L(c.label)}</span>
              {right && <Mark ok label={s('correctAnswer')} />}
              {wrong && <Mark ok={false} label={s('wrong')} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- match (tap left → right; drag optional)

function MatchInput({ q, value, onChange, locked, reveal }: InputProps) {
  const L = useL();
  const s = useS();
  const pairs = value?.kind === 'match' ? value.value : {};
  const [sel, setSel] = useState<string | null>(null);
  const left = q.left ?? [], right = q.right ?? [];
  const target = q.answer.kind === 'match' ? q.answer.pairs : {};
  const label = (id: string) => L(right.find((r) => r.id === id)?.label);
  const assign = (l: string, r: string) => { if (locked) return; onChange({ kind: 'match', value: { ...pairs, [l]: r } }); setSel(null); };
  const unassign = (l: string) => { if (locked) return; const n = { ...pairs }; delete n[l]; onChange({ kind: 'match', value: n }); };
  return (
    <div className="stack">
      <p className="muted lq-help">{q.type === 'drag' ? s('dragHelp') : s('matchHelp')}</p>
      <div className="lq-match">
        <div className="stack" role="group" aria-label="Items">
          {left.map((l) => {
            const ok = reveal ? pairs[l.id] === target[l.id] : null;
            return (
              <div key={l.id} className="lq-pair">
                <button type="button" className={`choice ${ok === true ? 'is-right' : ok === false ? 'is-wrong' : ''}`} aria-pressed={sel === l.id} aria-disabled={locked || undefined}
                  draggable={!locked} onDragStart={(e) => { e.dataTransfer.setData('text/plain', l.id); setSel(l.id); }}
                  onClick={() => { if (!locked) setSel(sel === l.id ? null : l.id); }}>
                  {l.visual && <Visual spec={l.visual} size="sm" animate={false} alt={L(l.label)} />}
                  <span>{L(l.label)}</span>
                  {pairs[l.id] && <span className="lq-paired">→ {label(pairs[l.id])}</span>}
                  {ok !== null && <Mark ok={ok} label={ok ? s('right') : s('wrong')} />}
                </button>
                {pairs[l.id] && !locked && <IconButton icon="x" className="small ghost" label={s('unmatch', { x: L(l.label) })} onClick={() => unassign(l.id)} />}
                {reveal && ok === false && <span className="lq-correction">{s('correctAnswer')}: {label(target[l.id])}</span>}
              </div>
            );
          })}
        </div>
        <div className="stack" role="group" aria-label="Partners">
          {right.map((r) => {
            const used = left.filter((l) => pairs[l.id] === r.id);
            return (
              <button key={r.id} type="button" className={`choice lq-target ${sel ? 'is-armed' : ''}`} aria-disabled={locked || !sel || undefined}
                onClick={() => { if (sel) assign(sel, r.id); }}
                onDragOver={(e) => { if (!locked) e.preventDefault(); }}
                onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) assign(id, r.id); }}>
                {r.visual && <Visual spec={r.visual} size="sm" animate={false} alt={L(r.label)} />}
                <span>{L(r.label)}</span>
                {used.length > 0 && <span className="lq-paired">← {used.map((l) => L(l.label)).join(', ')}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- order (buttons; drag optional)

function OrderInput({ q, value, onChange, locked, reveal }: InputProps) {
  const L = useL();
  const s = useS();
  const ids = value?.kind === 'order' && value.value.length ? value.value : initialOrder(q);
  const correct = q.answer.kind === 'order' ? q.answer.correct : [];
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const focusNext = useRef<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  useEffect(() => { if (focusNext.current) { refs.current[focusNext.current]?.focus(); focusNext.current = null; } });
  const move = (i: number, d: -1 | 1, key: string) => {
    const j = i + d;
    if (locked || j < 0 || j >= ids.length) return;
    const n = [...ids];
    [n[i], n[j]] = [n[j], n[i]];
    focusNext.current = key;
    onChange({ kind: 'order', value: n });
  };
  const lab = (id: string) => L(q.choices?.find((c) => c.id === id)?.label);
  return (
    <div className="stack">
      <p className="muted lq-help">{s('orderHelp')}</p>
      <ol className="lq-order">
        {ids.map((id, i) => {
          const ok = reveal ? correct[i] === id : null;
          const c = q.choices?.find((x) => x.id === id);
          return (
            <li key={id} className={`lq-orow ${ok === true ? 'is-right' : ok === false ? 'is-wrong' : ''} ${dragging === id ? 'is-drag' : ''}`}
              draggable={!locked} onDragStart={(e) => { e.dataTransfer.setData('text/plain', id); setDragging(id); }} onDragEnd={() => setDragging(null)}
              onDragOver={(e) => { if (!locked) e.preventDefault(); }}
              onDrop={(e) => {
                e.preventDefault(); setDragging(null);
                const from = ids.indexOf(e.dataTransfer.getData('text/plain'));
                if (from < 0 || from === i || locked) return;
                const n = [...ids]; const [m] = n.splice(from, 1); n.splice(i, 0, m);
                onChange({ kind: 'order', value: n });
              }}>
              <span className="lq-onum" aria-hidden="true">{i + 1}</span>
              {c?.visual && <Visual spec={c.visual} size="sm" animate={false} alt={lab(id)} />}
              <span className="lq-olabel">{lab(id)}</span>
              {ok !== null && <Mark ok={ok} label={ok ? s('right') : s('wrong')} />}
              {!locked && <>
                <button type="button" className="btn small" ref={(el) => { if (i > 0) refs.current[`${id}:up`] = el; }} aria-label={s('moveUp', { x: lab(id) })} disabled={i === 0} onClick={() => move(i, -1, `${id}:up`)}><Icon name="up" /></button>
                <button type="button" className="btn small" ref={(el) => { if (i < ids.length - 1) refs.current[`${id}:down`] = el; }} aria-label={s('moveDown', { x: lab(id) })} disabled={i === ids.length - 1} onClick={() => move(i, 1, `${id}:down`)}><Icon name="down" /></button>
              </>}
            </li>
          );
        })}
      </ol>
      {reveal && correct.join('|') !== ids.join('|') && <p className="lq-correction">{s('correctAnswer')}: {correct.map(lab).join(' → ')}</p>}
    </div>
  );
}

// ---------------------------------------------------------------- number line (tap / arrow keys)

function NumberLineInput({ q, value, onChange, locked, reveal }: InputProps) {
  const s = useS();
  const line = q.line!;
  const W = 520, pad = 28, y = 56, H = 100;
  const n = Math.max(1, Math.min(200, Math.round((line.to - line.from) / line.step)));
  const asFrac = q.answer.kind === 'fraction';
  const X = (k: number) => pad + (k / n) * (W - 2 * pad);
  const v = lineResponseValue(value);
  const cur = v === null ? null : lineIndex(v, line);
  const label = (k: number) => lineLabel(k, line, asFrac);
  const set = (k: number) => { if (!locked) onChange({ kind: 'text', value: label(Math.max(0, Math.min(n, k))) }); };
  const every = Math.ceil((n + 1) / 12);
  const cv = q.answer.kind === 'number' ? q.answer.value : q.answer.kind === 'fraction' ? q.answer.num / q.answer.den : null;
  const correct = cv === null ? null : lineIndex(cv, line);
  const onPointer = (e: RPE<SVGSVGElement>) => {
    if (locked) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    set(Math.round(((x - pad) / (W - 2 * pad)) * n));
  };
  const onKey = (e: RKE) => {
    if (locked) return;
    const base = cur ?? 0;
    const big = Math.max(1, Math.round(n / 10));
    const map: Record<string, number> = { ArrowRight: base + 1, ArrowUp: base + 1, ArrowLeft: base - 1, ArrowDown: base - 1, PageUp: base + big, PageDown: base - big, Home: 0, End: n };
    if (e.key in map) { e.preventDefault(); set(cur === null && e.key.startsWith('Arrow') ? 0 : map[e.key]); }
  };
  return (
    <div className="stack">
      <p className="muted lq-help">{s('lineHelp')}</p>
      <div className="lq-line">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" onPointerDown={onPointer} aria-hidden="true" style={{ touchAction: 'manipulation' }}>
          <rect x={0} y={0} width={W} height={H} fill="transparent" />
          <line x1={pad - 14} x2={W - pad + 14} y1={y} y2={y} stroke="var(--text)" strokeWidth={3} />
          {Array.from({ length: n + 1 }, (_, k) => (
            <g key={k}>
              <line x1={X(k)} x2={X(k)} y1={y - 8} y2={y + 8} stroke="var(--text)" strokeWidth={2} />
              {(k % every === 0 || k === n) && <text x={X(k)} y={y + 30} textAnchor="middle" className="lv-txt">{label(k)}</text>}
            </g>
          ))}
          {reveal && correct !== null && <g><circle cx={X(correct)} cy={y} r={11} fill="none" stroke="var(--good)" strokeWidth={4} /><text x={X(correct)} y={y - 18} textAnchor="middle" className="lv-txt b" style={{ fill: 'var(--good)' }}>✓ {label(correct)}</text></g>}
          {cur !== null && <g><circle cx={X(cur)} cy={y} r={9} fill="var(--primary)" stroke="var(--surface)" strokeWidth={3} />{!(reveal && correct === cur) && <text x={X(cur)} y={y - 18} textAnchor="middle" className="lv-txt b">{label(cur)}</text>}</g>}
        </svg>
        <div className="lq-slider" role="slider" tabIndex={locked ? -1 : 0} aria-label={s('lineHelp')} aria-valuemin={0} aria-valuemax={n}
          aria-valuenow={cur ?? undefined} aria-valuetext={cur === null ? s('noAnswer') : label(cur)} aria-readonly={locked || undefined} onKeyDown={onKey}>
          <span aria-live="polite">{cur === null ? '' : s('lineValue', { v: label(cur) })}</span>
        </div>
      </div>
      {!locked && (
        <div className="row">
          <IconButton icon="minus" label={s('lineLeft')} onClick={() => set((cur ?? 1) - 1)} />
          <IconButton icon="plus" label={s('lineRight')} onClick={() => set(cur === null ? 0 : cur + 1)} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- counting

export function CountObjects({ spec, count = 0, onCount, locked }: { spec: Extract<VisualSpec, { kind: 'objects' }>; count?: number; onCount?: (n: number) => void; locked?: boolean }) {
  const s = useS();
  const { speak } = useApp();
  const n = Math.max(0, Math.min(60, spec.count));
  const [tapped, setTapped] = useState<number[]>(() => Array.from({ length: Math.min(count, n) }, (_, i) => i));
  const toggle = (i: number) => {
    if (locked) return;
    const next = tapped.includes(i) ? tapped.filter((x) => x !== i) : [...tapped, i];
    setTapped(next);
    onCount?.(next.length);
    if (!tapped.includes(i)) speak(String(next.length));
  };
  return (
    <div className="lq-count">
      <p className="muted lq-help">{s('tapToCount')}</p>
      <div className="lq-count-grid" role="group" aria-label={s('tapToCount')}>
        {Array.from({ length: n }, (_, i) => {
          const order = tapped.indexOf(i);
          return (
            <button key={i} type="button" className={`lq-countobj ${order >= 0 ? 'is-on' : ''}`} aria-pressed={order >= 0} aria-label={`${spec.emoji} ${i + 1}`} aria-disabled={locked || undefined} onClick={() => toggle(i)}>
              <span aria-hidden="true">{spec.emoji}</span>
              {order >= 0 && <span className="lq-countbadge" aria-hidden="true">{order + 1}</span>}
            </button>
          );
        })}
      </div>
      <div className="row">
        <output className="lq-counter" aria-live="polite">{s('counted', { n: tapped.length })}</output>
        {!locked && tapped.length > 0 && <button type="button" className="btn small" onClick={() => { setTapped([]); onCount?.(0); }}><Icon name="reset" />{s('countAgain')}</button>}
      </div>
    </div>
  );
}

function Stepper({ value, onChange, locked }: InputProps) {
  const s = useS();
  const n = value?.kind === 'text' ? Number(value.value) || 0 : 0;
  return (
    <div className="row lq-stepper">
      <IconButton icon="minus" label="-1" disabled={locked || n <= 0} onClick={() => onChange({ kind: 'text', value: String(Math.max(0, n - 1)) })} />
      <output className="lq-counter" aria-live="polite">{s('counted', { n })}</output>
      <IconButton icon="plus" label="+1" disabled={locked} onClick={() => onChange({ kind: 'text', value: String(n + 1) })} />
    </div>
  );
}

// ---------------------------------------------------------------- typed answer + math keypad

const coarsePointer = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

export function TypedInput({ value, onChange, locked, tier, keypad, units, onSubmit, label, qid, compact }: {
  value: string; onChange: (v: string) => void; locked?: boolean; tier: Tier; keypad?: Question['keypad']; units: string[];
  onSubmit?: () => void; label?: string; qid?: string; compact?: boolean;
}) {
  const s = useS();
  const { t } = useApp();
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const caret = useRef(value.length);
  const older = tier === 'middle' || tier === 'senior';
  const [pad, setPad] = useState(() => !compact && older && (!!keypad || tier === 'senior'));
  const [deviceKb, setDeviceKb] = useState(false);
  useEffect(() => { caret.current = Math.min(caret.current, value.length); }, [value]);
  useEffect(() => { caret.current = value.length; }, [qid]); // eslint-disable-line react-hooks/exhaustive-deps
  const press = (key: string) => {
    if (locked) return;
    const el = ref.current;
    const at = el && document.activeElement === el ? el.selectionStart ?? value.length : caret.current;
    const st = applyKey({ value, caret: at }, key);
    caret.current = st.caret;
    onChange(st.value);
    requestAnimationFrame(() => { if (el && document.activeElement === el) el.setSelectionRange(st.caret, st.caret); });
  };
  const noNative = pad && coarsePointer() && !deviceKb;
  const inputMode = noNative ? 'none' : keypad === 'numeric' ? 'decimal' : 'text';
  const rows = keypadRows(keypad, tier);
  return (
    <div className={`lq-typed ${compact ? 'compact' : ''}`}>
      <div className="row lq-typed-row">
        <label htmlFor={id} className="sr-only">{label || s('typeAnswer')}</label>
        <input id={id} ref={ref} className="input lq-input" value={value} readOnly={locked} inputMode={inputMode} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          placeholder={label || s('typeAnswer')}
          onChange={(e) => { caret.current = e.target.selectionStart ?? e.target.value.length; onChange(e.target.value); }}
          onSelect={(e) => { caret.current = (e.target as HTMLInputElement).selectionStart ?? value.length; }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSubmit?.(); } }} />
        {!locked && !compact && <IconButton icon="keyboard" label={s('keypad')} aria-pressed={pad} aria-expanded={pad} onClick={() => setPad(!pad)} />}
      </div>
      {!locked && units.length > 0 && (
        <div className="lq-units" role="group" aria-label={s('units')}>
          {units.map((u) => <button key={u} type="button" className="btn small lq-unit" aria-pressed={new RegExp(`\\s${u.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}$`).test(value)} onMouseDown={(e) => e.preventDefault()} onClick={() => press(`unit:${u}`)}>{u}</button>)}
        </div>
      )}
      {!locked && pad && (
        <div className="lq-keypad" role="group" aria-label={s('keypad')}>
          {rows.map((row, i) => (
            <div key={i} className="lq-krow">
              {row.map((k) => (
                <button key={k} type="button" className={`btn lq-key ${k === 'back' || k === 'clear' ? 'fn' : ''}`} aria-label={KEY_NAME[k] ?? k} onMouseDown={(e) => e.preventDefault()} onClick={() => press(k)}>
                  {KEY_LABEL[k] ?? k}
                </button>
              ))}
            </div>
          ))}
          {onSubmit && <button type="button" className="btn primary lq-key-enter" onMouseDown={(e) => e.preventDefault()} onClick={() => onSubmit()}><Icon name="check" />{t('check')}</button>}
          {coarsePointer() && <button type="button" className="btn small ghost" aria-pressed={deviceKb} onClick={() => { setDeviceKb(!deviceKb); setTimeout(() => ref.current?.focus(), 0); }}>{s('deviceKeyboard')}</button>}
        </div>
      )}
    </div>
  );
}
