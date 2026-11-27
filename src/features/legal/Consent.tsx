// Parental consent (DPDP Act 2023): the checkbox shown at sign-up, the one-time prompt for existing accounts
// (POST /api/account/consent), and the Privacy / Terms links used in footers.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../../lib/api';
import { useApp } from '../../lib/app';
import { Button, Field, Modal, TextInput, toast } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import './legal.css';

/** Links open in a new tab so a half-filled form is not lost. */
export function ConsentCheckbox({ checked, onChange, error }: { checked: boolean; onChange: (v: boolean) => void; error?: string }) {
  return (
    <div className="stack-sm">
      <label className="check consent-check">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={error ? true : undefined} />
        <span>
          I am the parent/guardian (18+) and agree to the <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a> and <a href="/terms" target="_blank" rel="noopener">Terms</a>
          <small className="muted te" lang="te">నేను తల్లిదండ్రి/సంరక్షకుడిని (18+), <a href="/privacy?lang=te" target="_blank" rel="noopener">గోప్యతా విధానం</a> మరియు <a href="/terms?lang=te" target="_blank" rel="noopener">నిబంధనలకు</a> అంగీకరిస్తున్నాను</small>
        </span>
      </label>
      {error && <span className="error" role="alert">{error}</span>}
    </div>
  );
}

/** Asked once on the next parent-area visit when the account has not agreed to the current version. */
export function ConsentPrompt() {
  const { refresh } = useApp();
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(false);
  return (
    <div className="card stack" style={{ maxWidth: 560, margin: '24px auto' }}>
      <h1 style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Icon name="shield" size="lg" />Privacy and parental consent</h1>
      <p style={{ margin: 0 }}>Before you continue, please read our <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms</Link>. They explain what WonderLab stores about your family, that there are no ads or tracking, and how to download or delete your data.</p>
      <p className="muted small" lang="te" style={{ margin: 0 }}>కొనసాగే ముందు దయచేసి మా గోప్యతా విధానం మరియు నిబంధనలను చదవండి.</p>
      <ConsentCheckbox checked={ok} onChange={setOk} error={err} />
      <Button variant="primary" disabled={busy || !ok} onClick={async () => {
        setBusy(true); setErr('');
        try { await api('/account/consent', { body: { consent: true } }); await refresh(); }
        catch (x) { setErr(x instanceof ApiError ? x.message : 'Could not save. Please try again.'); }
        finally { setBusy(false); }
      }}>Agree and continue</Button>
      <p className="muted small" style={{ margin: 0 }}>Don't agree? WonderLab can't be used without it, but you can delete the account and all its data instead.</p>
      <Button variant="danger" icon="trash" onClick={() => setDel(true)}>Delete account and all data…</Button>
      {del && <DeleteAccountModal onClose={() => setDel(false)} />}
    </div>
  );
}

/**
 * Permanently deletes the account and every learner's data on the server (DELETE /api/account), which also
 * withdraws consent. Shared by Parent settings → Your data and the consent prompt.
 */
export function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const { account, signOut } = useApp();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  return (
    <Modal title="Delete account and all data?" onClose={onClose}>
      <form className="stack" onSubmit={async (e) => {
        e.preventDefault(); setErr('');
        try { await api('/account', { method: 'DELETE', body: { confirmUsername: confirm } }); await signOut({ force: true }); toast('Account and all data deleted'); nav('/signup'); }
        catch (x) { setErr((x as Error).message); }
      }}>
        <p style={{ margin: 0 }}>This permanently deletes your parent account, every learner profile, all progress, notes, artwork, settings and problem reports, on all devices. It also withdraws your consent. It cannot be undone — consider exporting your data first.</p>
        <Field label={`Type your username (${account?.username}) to confirm`} error={err}>{(f) => <TextInput {...f} value={confirm} onChange={(e) => setConfirm(e.target.value)} />}</Field>
        <div className="row"><Button type="button" onClick={onClose}>Cancel</Button><Button type="submit" variant="danger">Delete everything</Button></div>
      </form>
    </Modal>
  );
}

export function LegalLinks() {
  return (
    <p className="legal-footer small">
      <Link to="/privacy">Privacy Policy</Link>
      <Link to="/terms">Terms of Use</Link>
    </p>
  );
}
