import { useState, type ReactNode } from 'react';
import { useApp } from '../../lib/app';
import { ApiError } from '../../lib/api';
import { Button, Field, PasswordInput } from '../../ui/kit';
import { Icon } from '../../ui/Icon';

/** Sensitive parent areas require re-entering the parent password (valid for 10 minutes). */
export function ParentGate({ children, reason = 'This area is for parents.' }: { children: ReactNode; reason?: string }) {
  const { parentVerified, verifyParent, account, online } = useApp();
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (parentVerified) return <>{children}</>;
  return (
    <div className="card stack" style={{ maxWidth: 460, margin: '24px auto' }}>
      <h1 style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Icon name="lock" size="lg" />Parent check</h1>
      <p className="muted" style={{ margin: 0 }}>{reason} Enter the password for <b>{account?.username}</b>.</p>
      {!online && <div className="alert warn"><Icon name="wifiOff" />Parent settings need an internet connection.</div>}
      <form className="stack" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setErr('');
        try { await verifyParent(pw); setPw(''); } catch (x) { setErr(x instanceof ApiError ? x.message : 'Could not verify.'); } finally { setBusy(false); }
      }}>
        <Field label="Parent password" error={err}>{(p) => <PasswordInput {...p} autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />}</Field>
        <Button variant="primary" type="submit" disabled={busy || !online}>Continue</Button>
      </form>
    </div>
  );
}
