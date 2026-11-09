// Parent sign-up, sign-in, recovery (email link or recovery code — each plus the security answer),
// forgot username, email verification.
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../../lib/api';
import { useApp } from '../../lib/app';
import { Button, Field, PasswordInput, TextInput, toast } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { SECURITY_QUESTIONS } from '../../shared/levels';
import './auth.css';

function Shell({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  useEffect(() => { document.title = `${title} · WonderLab`; }, [title]);
  return (
    <main id="main" className="auth-wrap" tabIndex={-1}>
      <div className="card auth-card">
        <div className="auth-brand"><img src="/icon.svg" alt="" width={48} height={48} /><span>WonderLab</span></div>
        <h1>{title}</h1>
        {sub && <p className="muted">{sub}</p>}
        {children}
      </div>
    </main>
  );
}
const deviceLabel = () => {
  const ua = navigator.userAgent;
  const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'Mac' : 'Device';
  const br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : 'Browser';
  return `${br} on ${os}`;
};

function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setError(''); setFields({});
    try { await fn(); } catch (e) {
      if (e instanceof ApiError) { setError(e.message); setFields(e.fields || {}); if (e.status === 0) setError('You are offline. Signing in and recovery need an internet connection.'); }
      else setError('Something went wrong. Please try again.');
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    } finally { setBusy(false); }
  };
  return { busy, error, fields, run, setError };
}

function SignIn() {
  const { refresh } = useApp();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [u, setU] = useState(''), [p, setP] = useState(''), [keep, setKeep] = useState(true);
  const s = useSubmit();
  const submit = (e: FormEvent) => { e.preventDefault(); void s.run(async () => {
    await api('/auth/login', { body: { username: u, password: p, keepSignedIn: keep, deviceLabel: deviceLabel() } });
    await refresh();
    nav(sp.get('next') || '/who', { replace: true });
  }); };
  return (
    <Shell title="Parent sign in" sub="Sign in once on this device, then each child picks their profile.">
      <form className="stack" onSubmit={submit} noValidate>
        <Field label="Username">{(f) => <TextInput {...f} autoComplete="username" value={u} onChange={(e) => setU(e.target.value)} required />}</Field>
        <Field label="Password">{(f) => <PasswordInput {...f} autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} required />}</Field>
        <label className="check"><input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} /><span>Keep me signed in on this device<br /><small className="muted">Use on your family's own device. On a shared or school device, untick this — you'll be signed out after a period of inactivity.</small></span></label>
        {s.error && <div className="alert error" role="alert"><Icon name="alert" />{s.error}</div>}
        <Button variant="primary" type="submit" disabled={s.busy} aria-busy={s.busy}>{s.busy ? 'Signing in…' : 'Sign in'}</Button>
        <div className="row auth-links"><Link to="/forgot">Forgot password?</Link><Link to="/forgot/username">Forgot username?</Link></div>
        <p className="center">New here? <Link to="/signup">Create a parent account</Link></p>
        <p className="muted small">You stay signed in until you sign out, the session expires, you reset your password, or this browser's data is cleared.</p>
      </form>
    </Shell>
  );
}

function SignUp() {
  const { refresh } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({ username: '', password: '', confirm: '', email: '', securityQuestion: 0, securityAnswer: '', keep: true });
  const [codes, setCodes] = useState<string[] | null>(null);
  const [saved, setSaved] = useState(false);
  const s = useSubmit();
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: k === 'securityQuestion' ? +e.target.value : e.target.value });
  const submit = (e: FormEvent) => { e.preventDefault(); void s.run(async () => {
    if (f.password !== f.confirm) throw new ApiError(422, 'invalid', 'Passwords do not match.', { confirm: 'Passwords do not match.' });
    const r = await api<{ recoveryCodes: string[] }>('/auth/register', { body: { username: f.username, password: f.password, email: f.email || undefined, securityQuestion: f.securityQuestion, securityAnswer: f.securityAnswer, keepSignedIn: f.keep, deviceLabel: deviceLabel() } });
    setCodes(r.recoveryCodes);
  }); };
  if (codes) {
    return (
      <Shell title="Save your recovery codes" sub="These codes let you reset your password if you forget it — even without email. Each code works once. We will not show them again.">
        <ol className="codes" aria-label="Recovery codes">{codes.map((c) => <li key={c}><code>{c}</code></li>)}</ol>
        <div className="row">
          <Button icon="copy" onClick={() => { void navigator.clipboard?.writeText(codes.join('\n')); toast('Copied'); }}>Copy</Button>
          <Button icon="download" onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([`WonderLab recovery codes for ${f.username}\n\n${codes.join('\n')}\n`], { type: 'text/plain' })); a.download = 'wonderlab-recovery-codes.txt'; a.click(); }}>Download</Button>
          <Button icon="print" onClick={() => window.print()}>Print</Button>
        </div>
        <label className="check"><input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />I have saved these codes somewhere safe.</label>
        {f.email && <div className="alert info"><Icon name="info" />We sent a confirmation link to {f.email}. Confirm it to use email recovery.</div>}
        <Button variant="primary" disabled={!saved} onClick={async () => { await refresh(); nav('/setup', { replace: true }); }}>Continue to set up learners</Button>
      </Shell>
    );
  }
  return (
    <Shell title="Create a parent account" sub="Parents create the account; children get their own profiles with just a nickname, avatar, class and age band.">
      <form className="stack" onSubmit={submit} noValidate>
        <Field label="Username" hint="3–32 letters, numbers, dots, dashes or underscores. Avoid your child's real name." error={s.fields.username}>{(p) => <TextInput {...p} autoComplete="username" value={f.username} onChange={set('username')} />}</Field>
        <Field label="Password" hint="At least 8 characters, with letters and a number." error={s.fields.password}>{(p) => <PasswordInput {...p} autoComplete="new-password" value={f.password} onChange={set('password')} />}</Field>
        <Field label="Confirm password" error={s.fields.confirm}>{(p) => <PasswordInput {...p} autoComplete="new-password" value={f.confirm} onChange={set('confirm')} />}</Field>
        <Field label="Parent email (optional, recommended)" hint="Used only to recover your account. Without email, you'll use recovery codes." error={s.fields.email}>{(p) => <TextInput {...p} type="email" inputMode="email" autoComplete="email" value={f.email} onChange={set('email')} />}</Field>
        <fieldset className="card flat stack"><legend className="legend">Security question</legend>
          <p className="muted small" style={{ margin: 0 }}>Asked as an extra check during password recovery. It never resets your password on its own.</p>
          <Field label="Question" error={s.fields.securityQuestion}>{(p) => <select {...p} className="input" value={f.securityQuestion} onChange={set('securityQuestion')}>{SECURITY_QUESTIONS.map((q, i) => <option key={q} value={i}>{q}</option>)}</select>}</Field>
          <Field label="Answer" error={s.fields.securityAnswer}>{(p) => <TextInput {...p} autoComplete="off" value={f.securityAnswer} onChange={set('securityAnswer')} />}</Field>
        </fieldset>
        <label className="check"><input type="checkbox" checked={f.keep} onChange={(e) => setF({ ...f, keep: e.target.checked })} />Keep me signed in on this device</label>
        {s.error && <div className="alert error" role="alert"><Icon name="alert" />{s.error}</div>}
        <Button variant="primary" type="submit" disabled={s.busy}>{s.busy ? 'Creating…' : 'Create account'}</Button>
        <p className="center">Already have an account? <Link to="/signin">Sign in</Link></p>
        <p className="muted small">WonderLab has no ads, no tracking, no public profiles, no chat. We store only what's needed to run your family's account.</p>
      </form>
    </Shell>
  );
}

/** Choose recovery method. */
function Forgot() {
  const [mode, setMode] = useState<'email' | 'code'>('email');
  return (
    <Shell title="Reset your password" sub="Use your verified email or one of your recovery codes. Either way you'll also answer your security question.">
      <div className="row" role="tablist" aria-label="Recovery method">
        <button role="tab" className="btn small" aria-selected={mode === 'email'} aria-pressed={mode === 'email'} onClick={() => setMode('email')}>Email me a link</button>
        <button role="tab" className="btn small" aria-selected={mode === 'code'} aria-pressed={mode === 'code'} onClick={() => setMode('code')}>Use a recovery code</button>
      </div>
      {mode === 'email' ? <ForgotEmail /> : <ForgotCode />}
      <p className="center"><Link to="/signin">Back to sign in</Link></p>
    </Shell>
  );
}
function ForgotEmail() {
  const [id, setId] = useState('');
  const [msg, setMsg] = useState('');
  const s = useSubmit();
  return msg ? <div className="alert good" role="status"><Icon name="check" />{msg}</div> : (
    <form className="stack" noValidate onSubmit={(e) => { e.preventDefault(); void s.run(async () => { const r = await api<{ message: string }>('/auth/forgot-password', { body: { identifier: id } }); setMsg(r.message); }); }}>
      <Field label="Username or email">{(p) => <TextInput {...p} autoComplete="username" value={id} onChange={(e) => setId(e.target.value)} />}</Field>
      {s.error && <div className="alert error" role="alert">{s.error}</div>}
      <Button variant="primary" type="submit" disabled={s.busy}>Send reset link</Button>
    </form>
  );
}
function ForgotCode() {
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [f, setF] = useState({ username: '', code: '', answer: '', pw: '', pw2: '' });
  const [question, setQuestion] = useState('');
  const s = useSubmit();
  if (step === 1) return (
    <form className="stack" noValidate onSubmit={(e) => { e.preventDefault(); void s.run(async () => { const r = await api<{ securityQuestion: string }>('/auth/recovery-code/check', { body: { username: f.username, code: f.code } }); setQuestion(r.securityQuestion); setStep(2); }); }}>
      <Field label="Username">{(p) => <TextInput {...p} autoComplete="username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} />}</Field>
      <Field label="Recovery code" hint="Like ABCDE-FGHJK">{(p) => <TextInput {...p} autoComplete="one-time-code" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />}</Field>
      {s.error && <div className="alert error" role="alert">{s.error}</div>}
      <Button variant="primary" type="submit" disabled={s.busy}>Next</Button>
    </form>
  );
  return (
    <form className="stack" noValidate onSubmit={(e) => { e.preventDefault(); void s.run(async () => {
      if (f.pw !== f.pw2) throw new ApiError(422, 'invalid', 'Passwords do not match.');
      const r = await api<{ codesLeft: number }>('/auth/reset-with-code', { body: { username: f.username, code: f.code, securityAnswer: f.answer, newPassword: f.pw } });
      toast(`Password changed. ${r.codesLeft} recovery codes left. Please sign in.`); nav('/signin', { replace: true });
    }); }}>
      <Field label={question}>{(p) => <TextInput {...p} autoComplete="off" value={f.answer} onChange={(e) => setF({ ...f, answer: e.target.value })} />}</Field>
      <Field label="New password" hint="At least 8 characters, with letters and a number." error={s.fields.newPassword}>{(p) => <PasswordInput {...p} autoComplete="new-password" value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} />}</Field>
      <Field label="Confirm new password">{(p) => <PasswordInput {...p} autoComplete="new-password" value={f.pw2} onChange={(e) => setF({ ...f, pw2: e.target.value })} />}</Field>
      {s.error && <div className="alert error" role="alert">{s.error}</div>}
      <Button variant="primary" type="submit" disabled={s.busy}>Reset password</Button>
      <p className="muted small">All devices will be signed out after the reset.</p>
    </form>
  );
}
function ResetWithToken() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const token = sp.get('token') || '';
  const [question, setQuestion] = useState<string | null>(null);
  const [bad, setBad] = useState('');
  const [f, setF] = useState({ answer: '', pw: '', pw2: '' });
  const s = useSubmit();
  useEffect(() => { api<{ securityQuestion: string }>('/auth/reset-token-info', { body: { token } }).then((r) => setQuestion(r.securityQuestion)).catch((e) => setBad(e.message)); }, [token]);
  return (
    <Shell title="Choose a new password">
      {bad ? <><div className="alert error" role="alert">{bad}</div><Link to="/forgot">Request a new link</Link></> : !question ? <p role="status">Checking link…</p> : (
        <form className="stack" noValidate onSubmit={(e) => { e.preventDefault(); void s.run(async () => {
          if (f.pw !== f.pw2) throw new ApiError(422, 'invalid', 'Passwords do not match.');
          await api('/auth/reset-with-token', { body: { token, securityAnswer: f.answer, newPassword: f.pw } });
          toast('Password changed. Please sign in.'); nav('/signin', { replace: true });
        }); }}>
          <Field label={question}>{(p) => <TextInput {...p} autoComplete="off" value={f.answer} onChange={(e) => setF({ ...f, answer: e.target.value })} />}</Field>
          <Field label="New password" hint="At least 8 characters, with letters and a number." error={s.fields.newPassword}>{(p) => <PasswordInput {...p} autoComplete="new-password" value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} />}</Field>
          <Field label="Confirm new password">{(p) => <PasswordInput {...p} autoComplete="new-password" value={f.pw2} onChange={(e) => setF({ ...f, pw2: e.target.value })} />}</Field>
          {s.error && <div className="alert error" role="alert">{s.error}</div>}
          <Button variant="primary" type="submit" disabled={s.busy}>Reset password</Button>
          <p className="muted small">All devices will be signed out after the reset.</p>
        </form>
      )}
    </Shell>
  );
}
function ForgotUsername() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const s = useSubmit();
  return (
    <Shell title="Forgot username" sub="We'll email the username to a verified parent email.">
      {msg ? <div className="alert good" role="status"><Icon name="check" />{msg}</div> : (
        <form className="stack" noValidate onSubmit={(e) => { e.preventDefault(); void s.run(async () => { const r = await api<{ message: string }>('/auth/forgot-username', { body: { email } }); setMsg(r.message); }); }}>
          <Field label="Parent email">{(p) => <TextInput {...p} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
          <Button variant="primary" type="submit" disabled={s.busy}>Send username</Button>
        </form>
      )}
      <p className="center"><Link to="/signin">Back to sign in</Link></p>
    </Shell>
  );
}
function VerifyEmail() {
  const [sp] = useSearchParams();
  const [state, setState] = useState<'checking' | 'ok' | string>('checking');
  useEffect(() => { api('/auth/verify-email', { body: { token: sp.get('token') || '' } }).then(() => setState('ok')).catch((e) => setState(e.message)); }, [sp]);
  return (
    <Shell title="Confirm email">
      {state === 'checking' ? <p role="status">Checking…</p> : state === 'ok' ? <div className="alert good" role="status"><Icon name="check" />Email confirmed. You can now use it to recover your account.</div> : <div className="alert error" role="alert">{state}</div>}
      <p className="center"><Link to="/">Continue</Link></p>
    </Shell>
  );
}

export default function AuthRoutes() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/signup')) return <SignUp />;
  if (pathname === '/forgot/username') return <ForgotUsername />;
  if (pathname.startsWith('/forgot')) return <Forgot />;
  if (pathname.startsWith('/reset')) return <ResetWithToken />;
  if (pathname.startsWith('/verify-email')) return <VerifyEmail />;
  return <SignIn />;
}
