// Shared UI components. Feature modules should build on these for a consistent look.
import { useEffect, useId, useRef, useState, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from './Icon';
import { useApp } from '../lib/app';
import { useFullscreen, fullscreenSupported } from '../lib/fullscreen';
import { onSync, retrySync, type SyncStatus } from '../lib/sync';
import { onSpeaking, replay, stopSpeaking, tone } from '../lib/audio';
import { api } from '../lib/api';

export function Button({ icon, children, variant, small, block, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: IconName; variant?: 'primary' | 'danger' | 'ghost'; small?: boolean; block?: boolean }) {
  return (
    <button {...rest} className={`btn ${variant || ''} ${small ? 'small' : ''} ${block ? 'block' : ''} ${rest.className || ''}`}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}
export function IconButton({ icon, label, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string }) {
  return <button {...rest} className={`btn ${rest.className || ''}`} aria-label={label} title={label}><Icon name={icon} /></button>;
}

export function Field({ label, hint, error, children, id }: { label: ReactNode; hint?: ReactNode; error?: string; children: (p: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => ReactNode; id?: string }) {
  const gen = useId();
  const fid = id || gen;
  const hid = `${fid}-h`, eid = `${fid}-e`;
  return (
    <div className="field">
      <label htmlFor={fid}>{label}</label>
      {children({ id: fid, 'aria-invalid': error ? true : undefined, 'aria-describedby': [hint ? hid : '', error ? eid : ''].join(' ').trim() || undefined })}
      {hint && <span className="hint" id={hid}>{hint}</span>}
      {error && <span className="error" id={eid} role="alert">{error}</span>}
    </div>
  );
}
export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={`input ${props.className || ''}`} />; }
export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="row" style={{ flexWrap: 'nowrap' }}>
      <input {...props} type={show ? 'text' : 'password'} className="input" />
      <button type="button" className="btn" aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} onClick={() => setShow(!show)}><Icon name={show ? 'eyeOff' : 'eye'} /></button>
    </div>
  );
}

export function Modal({ title, onClose, children, labelledBy }: { title: string; onClose: () => void; children: ReactNode; labelledBy?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const hid = useId();
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('button, input, select, textarea, [tabindex]')?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) { // focus trap
        const f = [...ref.current.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')].filter((x) => !x.hasAttribute('disabled'));
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); prev?.focus?.(); };
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy || hid} ref={ref}>
        <div className="modal-head"><h2 id={hid}>{title}</h2><IconButton icon="x" label="Close" onClick={onClose} /></div>
        {children}
      </div>
    </div>
  );
}

// ---------- toasts ----------
let pushToast: (m: string) => void = () => {};
export const toast = (m: string) => pushToast(m);
export function Toasts() {
  const [items, setItems] = useState<{ id: number; m: string }[]>([]);
  useEffect(() => {
    pushToast = (m) => { const id = Date.now() + Math.random(); setItems((x) => [...x, { id, m }]); setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 4000); };
  }, []);
  return <div className="toast-wrap" role="status" aria-live="polite">{items.map((i) => <div className="toast" key={i.id}>{i.m}</div>)}</div>;
}

/** Correct/incorrect feedback with an icon and words (never colour alone). */
export function Feedback({ ok, children }: { ok: boolean; children: ReactNode }) {
  useEffect(() => { tone(ok ? 'correct' : 'wrong'); }, [ok]);
  return <div className={`feedback ${ok ? 'good' : 'bad'}`} role="status" aria-live="polite"><Icon name={ok ? 'check' : 'info'} />{children}</div>;
}

export function celebrate() {
  if (document.documentElement.classList.contains('reduce-motion')) return;
  const c = document.createElement('div');
  c.className = 'celebrate';
  c.setAttribute('aria-hidden', 'true');
  const colors = ['#E8998D', '#F4D58D', '#B5D99C', '#8ECAE6', '#B39CD0', '#F2A7C3'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('i');
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = `${Math.random() * 0.4}s`;
    c.appendChild(p);
  }
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 2400);
  tone('complete');
}

export function SyncBadge() {
  const { t } = useApp();
  const [s, setS] = useState<{ status: SyncStatus; pending: number }>({ status: 'idle', pending: 0 });
  useEffect(() => onSync((status, info) => setS({ status, pending: info?.pending ?? 0 })), []);
  if (s.status === 'idle') return null;
  const label = s.status === 'saving' ? t('saving') : s.status === 'saved' ? t('saved') : s.status === 'offline' ? t('offline') : t('saveFailed');
  return (
    <span className={`sync ${s.status}`} role="status" aria-live="polite">
      <Icon name={s.status === 'offline' ? 'wifiOff' : s.status === 'error' ? 'alert' : s.status === 'saved' ? 'check' : 'cloud'} />
      {label}
      {s.status === 'error' && <button className="btn small ghost" onClick={() => void retrySync()}>{t('retry')}</button>}
    </span>
  );
}

/** Replay / stop narration. Always pair with visible text. */
export function NarrationControls({ text, te, clipId }: { text: string; te?: string; clipId?: string }) {
  const { speak, t, prefs, updatePrefs } = useApp();
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => onSpeaking(setSpeaking), []);
  return (
    <span className="row" style={{ gap: 6 }}>
      <IconButton icon="speaker" label={t('listen')} onClick={() => speak(text, { te, clipId })} />
      {speaking && <IconButton icon="stop" label={t('stop')} onClick={stopSpeaking} />}
      <IconButton icon={prefs.mute ? 'mute' : 'speaker'} label={prefs.mute ? t('unmute') : t('mute')} aria-pressed={prefs.mute} onClick={() => void updatePrefs({ mute: !prefs.mute })} className="ghost" />
    </span>
  );
}
export { replay };

export function FullscreenButton() {
  const fs = useFullscreen();
  const { t } = useApp();
  return (
    <Button icon={fs.active ? 'min' : 'max'} onClick={() => { if (fs.active) sessionStorage.setItem('wl.fsOff', '1'); else sessionStorage.removeItem('wl.fsOff'); void fs.toggle(); }} small aria-pressed={fs.active} title={fullscreenSupported() ? undefined : 'Immersive mode'}>
      {fs.active ? t('exitFullScreen') : t('enterFullScreen')}
    </Button>
  );
}

/** Private "Report a problem" — captures content ids; no personal details needed. */
export function ReportProblem({ lessonId, questionId, contentVersion }: { lessonId?: string; questionId?: string; contentVersion?: number }) {
  const { profile, t } = useApp();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  if (!profile) return null;
  return (
    <>
      <Button icon="flag" small variant="ghost" onClick={() => { setOpen(true); setSent(false); }}>{t('reportProblem')}</Button>
      {open && (
        <Modal title={t('reportProblem')} onClose={() => setOpen(false)}>
          {sent ? <div className="alert good"><Icon name="check" />Thank you! We will look at it.</div> : (
            <form className="stack" onSubmit={async (e) => { e.preventDefault(); await api(`/p/${profile.id}/reports`, { body: { classLevel: profile.classLevel, lessonId, questionId, contentVersion, description: text } }).catch(() => undefined); setSent(true); }}>
              <p className="muted">We will send the lesson and question number. You don't need to type your name.</p>
              <Field label="What looks wrong? (optional)">{(p) => <textarea {...p} className="input" rows={3} maxLength={500} value={text} onChange={(e) => setText(e.target.value)} />}</Field>
              <Button variant="primary" type="submit">Send</Button>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}

/** Page frame used by learner screens: back, title, fullscreen, sync badge. */
export function Page({ title, back = '/', actions, wide, fullscreen, children }: { title: string; back?: string | false; actions?: ReactNode; wide?: boolean; fullscreen?: boolean; children: ReactNode }) {
  const nav = useNavigate();
  const fs = useFullscreen();
  useEffect(() => { document.title = `${title} · WonderLab`; }, [title]);
  return (
    <>
      <header className="topbar">
        {back !== false && <IconButton icon="back" label="Back" onClick={() => nav(back)} />}
        <span className="title">{title}</span>
        <span className="spacer" />
        <SyncBadge />
        {actions}
        {fullscreen && <FullscreenButton />}
      </header>
      {fs.active && fullscreen && (
        <button className="btn small" style={{ position: 'fixed', top: 8, right: 8, zIndex: 50 }} onClick={() => { sessionStorage.setItem('wl.fsOff', '1'); void fs.exit(); }} aria-label="Exit full screen"><Icon name="min" /></button>
      )}
      <main id="main" className={`main ${wide ? 'wide' : ''}`} tabIndex={-1}>{children}</main>
    </>
  );
}

export function Meter({ value, label }: { value: number; label: string }) {
  return <div className="meter" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}><i style={{ width: `${Math.round(value * 100)}%` }} /></div>;
}

export function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="row" role="group" aria-label={label} style={{ gap: 6 }}>
      {options.map((o) => <button key={String(o.value)} type="button" className="btn small" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>{o.label}</button>)}
    </div>
  );
}
