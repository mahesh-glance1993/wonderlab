// Parent settings — every action here sits behind the parent password check.
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../../lib/api';
import { useApp, useL, type Profile, type Prefs } from '../../lib/app';
import { clearProfileData, countPending } from '../../lib/sync';
import { Page, Button, Field, TextInput, PasswordInput, Modal, Segmented, toast } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { AVATAR_EMOJI, CLASSES, SECURITY_QUESTIONS } from '../../shared/levels';
import type { MasteryState } from '../../shared/mastery';
import { ParentGate } from './ParentGate';
import { ProfileForm } from './Setup';
import { useClassContent } from '../home/useClassContent';
import { statusOf } from '../home/Curriculum';
import { BOARDS, DEFAULT_BOARD } from '../home/subjects';

type Tab = 'learners' | 'progress' | 'account' | 'security' | 'data';

export default function ParentArea() {
  const { account, signOut, profile } = useApp();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('learners');
  const [confirmOut, setConfirmOut] = useState(false);
  return (
    <Page title="Parent settings" back={profile ? '/' : '/who'}>
      <ParentGate>
        <div className="page-head">
          <h1>Parent settings</h1>
          <span className="spacer" />
          <Button icon="logout" onClick={async () => { const r = await signOut(); if (r === 'unsynced') setConfirmOut(true); else nav('/signin'); }}>Sign out</Button>
        </div>
        <Segmented label="Section" value={tab} onChange={setTab} options={[
          { value: 'learners', label: 'Learners' }, { value: 'progress', label: 'Progress' }, { value: 'account', label: 'Account' },
          { value: 'security', label: 'Sign-in & security' }, { value: 'data', label: 'Your data' },
        ]} />
        <div style={{ marginTop: 16 }}>
          {tab === 'learners' && <Learners />}
          {tab === 'progress' && <ParentProgress />}
          {tab === 'account' && <AccountTab />}
          {tab === 'security' && <SecurityTab />}
          {tab === 'data' && <DataTab />}
        </div>
        {account?.role !== 'parent' && <p style={{ marginTop: 24 }}><Button icon="edit" onClick={() => nav('/editor')}>Open content editor</Button></p>}
        <p className="muted small" style={{ marginTop: 24 }}>
          <Icon name="image" /> Photos and pictures in WonderLab come from Wikimedia Commons and Microsoft Fluent Emoji. <Link to="/credits">Picture credits</Link>
        </p>
        {confirmOut && (
          <Modal title="Unsaved work on this device" onClose={() => setConfirmOut(false)}>
            <p>Some progress or artwork hasn't reached the server yet (this device may be offline). If you sign out now, that work will be deleted from this device.</p>
            <div className="row"><Button onClick={() => setConfirmOut(false)}>Stay signed in</Button><Button variant="danger" onClick={async () => { await signOut({ force: true }); nav('/signin'); }}>Sign out and delete unsynced work</Button></div>
          </Modal>
        )}
      </ParentGate>
    </Page>
  );
}

function Learners() {
  const { profiles, refresh, account, selectProfile, profile: active } = useApp();
  const [edit, setEdit] = useState<Profile | null>(null);
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState<Profile | null>(null);
  return (
    <div className="stack">
      {profiles.map((p) => (
        <div className="card flat stack" key={p.id}>
          <div className="row"><span style={{ fontSize: '2rem' }} aria-hidden="true">{AVATAR_EMOJI[p.avatar]}</span><b style={{ fontSize: '1.2rem' }}>{p.nickname}</b><span className="muted">{CLASSES[p.classLevel].label} · {p.ageBand} years</span><span className="spacer" />
            <Button small icon="edit" onClick={() => setEdit(p)}>Edit</Button><Button small variant="danger" icon="trash" onClick={() => setDel(p)}>Remove</Button></div>
          <LearnerPrefs p={p} />
        </div>
      ))}
      <Button icon="plus" onClick={() => setAdding(true)}>Add learner</Button>
      {(edit || adding) && (
        <Modal title={edit ? `Edit ${edit.nickname}` : 'Add learner'} onClose={() => { setEdit(null); setAdding(false); }}>
          <ProfileForm initial={edit || undefined} submitLabel="Save" onSaved={async () => { await refresh(); setEdit(null); setAdding(false); toast('Saved'); }} />
        </Modal>
      )}
      {del && (
        <Modal title={`Remove ${del.nickname}?`} onClose={() => setDel(null)}>
          <p>This permanently deletes {del.nickname}'s progress, artwork and downloads on all devices. It cannot be undone. Consider exporting your data first.</p>
          <div className="row"><Button onClick={() => setDel(null)}>Keep</Button><Button variant="danger" onClick={async () => {
            await api(`/p/${del.id}/profile`, { method: 'DELETE' });
            if (account) await clearProfileData(account.id, del.id);
            if (active?.id === del.id) selectProfile(null);
            await refresh(); setDel(null); toast('Learner removed');
          }}>Delete permanently</Button></div>
        </Modal>
      )}
    </div>
  );
}

/** Parent-only learner settings (break reminders etc.); child-level prefs are also editable here. */
function LearnerPrefs({ p }: { p: Profile }) {
  const { refresh } = useApp();
  const prefs = p.prefs as Partial<Prefs>;
  const save = async (x: Partial<Prefs>) => {
    try { await api(`/p/${p.id}/profile`, { method: 'PATCH', body: { prefs: x } }); await refresh(); toast('Saved'); }
    catch (e) { toast(e instanceof ApiError && e.status === 0 ? 'You are offline — this setting was not saved.' : 'This setting could not be saved.'); }
  };
  return (
    <details>
      <summary style={{ cursor: 'pointer', fontWeight: 800 }}>Comfort & accessibility settings</summary>
      <div className="stack" style={{ marginTop: 10 }}>
        {p.classLevel >= 3 && (
          <div className="stack-sm">
            <span style={{ fontWeight: 800 }} aria-hidden="true">Syllabus</span>
            <Segmented label={`Syllabus for ${p.nickname}`} value={prefs.board ?? DEFAULT_BOARD} onChange={(b) => void save({ board: b })} options={BOARDS.map((b) => ({ value: b.id, label: b.label }))} />
            <span className="muted small">Lessons follow this syllabus. Classes not yet written for it use the CBSE (NCERT) lessons.</span>
          </div>
        )}
        <label className="check"><input type="checkbox" checked={prefs.breakEnabled !== false} onChange={(e) => void save({ breakEnabled: e.target.checked })} />Break reminders</label>
        <Field label="Remind after (minutes of activity)">{(f) => <select {...f} className="input" value={prefs.breakMinutes ?? 20} onChange={(e) => void save({ breakMinutes: +e.target.value })}>{[10, 15, 20, 30, 45].map((m) => <option key={m} value={m}>{m}</option>)}</select>}</Field>
        <label className="check"><input type="checkbox" checked={!!prefs.reduceMotion} onChange={(e) => void save({ reduceMotion: e.target.checked })} />Reduce motion</label>
        <label className="check"><input type="checkbox" checked={!!prefs.mute} onChange={(e) => void save({ mute: e.target.checked })} />Mute sounds and narration</label>
        <label className="check"><input type="checkbox" checked={!!prefs.timers} onChange={(e) => void save({ timers: e.target.checked })} />Offer optional timers in games</label>
        <Field label="Text size">{(f) => <select {...f} className="input" value={prefs.textSize ?? 1} onChange={(e) => void save({ textSize: +e.target.value as Prefs['textSize'] })}><option value={1}>Normal</option><option value={1.15}>Large</option><option value={1.3}>Extra large</option></select>}</Field>
        <Field label="Theme">{(f) => <select {...f} className="input" value={prefs.theme ?? 'system'} onChange={(e) => void save({ theme: e.target.value as Prefs['theme'] })}><option value="system">Match device</option><option value="light">Light</option><option value="dark">Dark</option></select>}</Field>
        {p.classLevel <= 5 && <Field label="Language">{(f) => <select {...f} className="input" value={prefs.language ?? 'en'} onChange={(e) => void save({ language: e.target.value as Prefs['language'] })}><option value="en">English</option><option value="te">తెలుగు (Telugu)</option></select>}</Field>}
      </div>
    </details>
  );
}

/** Topic-level progress for any learner in the family. */
function ParentProgress() {
  const { profiles } = useApp();
  const L = useL();
  const [pid, setPid] = useState(profiles[0]?.id || '');
  const p = profiles.find((x) => x.id === pid);
  const { content } = useClassContent(p ? p.classLevel : null);
  const [mastery, setMastery] = useState<Record<string, MasteryState>>({});
  useEffect(() => { if (pid) api<{ mastery: MasteryState[] }>(`/p/${pid}/state`).then((r) => setMastery(Object.fromEntries(r.mastery.map((m) => [m.objectiveId, m])))).catch(() => setMastery({})); }, [pid]);
  if (!p) return <p>No learners yet.</p>;
  const rows = (content?.units || []).map((u) => {
    const st = u.objectives.map((o) => statusOf(mastery[o.id]).key);
    return { u, mastered: st.filter((s) => s === 'mastered').length, practice: st.filter((s) => s === 'practice').length, started: st.filter((s) => s !== 'new').length, total: st.length };
  });
  return (
    <div className="stack">
      <Segmented label="Learner" value={pid} onChange={setPid} options={profiles.map((x) => ({ value: x.id, label: `${AVATAR_EMOJI[x.avatar]} ${x.nickname}` }))} />
      {!content && <p role="status">Loading…</p>}
      {content && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="data">
            <caption className="sr-only">Progress by topic</caption>
            <thead><tr><th scope="col">Topic</th><th scope="col">Mastered</th><th scope="col">Started</th><th scope="col">Needs practice</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r.u.id}><th scope="row">{L(r.u.title)}</th><td>{r.mastered} / {r.total}</td><td>{r.started}</td><td>{r.practice ? <span className="status practice"><Icon name="alert" />{r.practice}</span> : '—'}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      {content && rows.some((r) => r.practice) && (
        <div className="alert warn"><Icon name="info" />Areas that need practice: {rows.filter((r) => r.practice).map((r) => L(r.u.title)).join(', ')}.</div>
      )}
    </div>
  );
}

function AccountTab() {
  const { account, refresh } = useApp();
  const [email, setEmail] = useState(account?.email || '');
  const [pw, setPw] = useState({ current: '', next: '' });
  const [sq, setSq] = useState({ q: 0, a: '' });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const run = async (body: unknown, ok: string) => {
    setMsg(null);
    try { await api('/account', { method: 'PATCH', body }); await refresh(); setMsg({ ok: true, text: ok }); } catch (e) { setMsg({ ok: false, text: e instanceof ApiError ? e.message : 'Could not save.' }); }
  };
  return (
    <div className="stack" style={{ maxWidth: 560 }}>
      {msg && <div className={`alert ${msg.ok ? 'good' : 'error'}`} role="status">{msg.text}</div>}
      <section className="card flat stack"><h2>Email</h2>
        <p className="muted" style={{ margin: 0 }}>{account?.email ? (account.emailVerified ? 'Verified — can be used for recovery.' : 'Not verified yet — check your inbox.') : 'No email. You recover your account with recovery codes.'}</p>
        <Field label="Parent email">{(f) => <TextInput {...f} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
        <div className="row"><Button onClick={() => void run({ email: email || null }, email ? 'Saved. We sent a confirmation link.' : 'Email removed.')}>Save email</Button>
          {account?.email && !account.emailVerified && <Button onClick={() => void api('/account/resend-verification', { body: {} }).then(() => setMsg({ ok: true, text: 'Link sent.' })).catch((e) => setMsg({ ok: false, text: e.message }))}>Resend link</Button>}</div>
      </section>
      <section className="card flat stack"><h2>Password</h2>
        <Field label="Current password">{(f) => <PasswordInput {...f} autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />}</Field>
        <Field label="New password" hint="At least 8 characters with letters and a number. Other devices will be signed out.">{(f) => <PasswordInput {...f} autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />}</Field>
        <Button onClick={() => void run({ currentPassword: pw.current, newPassword: pw.next }, 'Password changed. Other devices were signed out.')}>Change password</Button>
      </section>
      <section className="card flat stack"><h2>Security question</h2>
        <p className="muted" style={{ margin: 0 }}>Current: {account?.securityQuestion}</p>
        <Field label="New question">{(f) => <select {...f} className="input" value={sq.q} onChange={(e) => setSq({ ...sq, q: +e.target.value })}>{SECURITY_QUESTIONS.map((q, i) => <option key={q} value={i}>{q}</option>)}</select>}</Field>
        <Field label="Answer">{(f) => <TextInput {...f} autoComplete="off" value={sq.a} onChange={(e) => setSq({ ...sq, a: e.target.value })} />}</Field>
        <Button onClick={() => void run({ securityQuestion: sq.q, securityAnswer: sq.a }, 'Security question updated.')}>Save question</Button>
      </section>
    </div>
  );
}

function SecurityTab() {
  const [sessions, setSessions] = useState<{ id: string; persistent: boolean; lastSeen: number; device: string; current: boolean }[]>([]);
  const [codesLeft, setCodesLeft] = useState<number | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const load = () => {
    api<{ sessions: typeof sessions }>('/account/sessions').then((r) => setSessions(r.sessions)).catch(() => undefined);
    api<{ remaining: number }>('/account/recovery-codes').then((r) => setCodesLeft(r.remaining)).catch(() => undefined);
  };
  useEffect(load, []);
  return (
    <div className="stack" style={{ maxWidth: 680 }}>
      <section className="card flat stack"><h2>Signed-in devices</h2>
        <p className="muted" style={{ margin: 0 }}>Trusted devices stay signed in. Sign-out, inactivity, a password reset or clearing browser data means signing in again.</p>
        <ul className="stack" style={{ padding: 0, listStyle: 'none' }}>
          {sessions.map((s) => (
            <li key={s.id} className="row card flat">
              <Icon name={s.persistent ? 'shield' : 'clock'} /><b>{s.device || 'Device'}</b>
              <span className="muted">{s.persistent ? 'Kept signed in' : 'Shared device'} · last used {new Date(s.lastSeen * 1000).toLocaleString()}</span>
              <span className="spacer" />{s.current ? <span className="pill">This device</span> : <Button small variant="danger" onClick={async () => { await api(`/account/sessions/${s.id}`, { method: 'DELETE' }); load(); toast('Signed out that device'); }}>Sign out</Button>}
            </li>
          ))}
        </ul>
        <Button onClick={async () => { await api('/account/sessions/revoke-others', { body: {} }); load(); toast('Other devices signed out'); }}>Sign out all other devices</Button>
      </section>
      <section className="card flat stack"><h2>Recovery codes</h2>
        <p className="muted" style={{ margin: 0 }}>{codesLeft ?? '…'} unused codes left. Making new codes cancels the old ones.</p>
        {codes ? (<><ol className="codes">{codes.map((c) => <li key={c}><code>{c}</code></li>)}</ol><div className="row"><Button icon="copy" onClick={() => void navigator.clipboard?.writeText(codes.join('\n'))}>Copy</Button><Button icon="print" onClick={() => window.print()}>Print</Button></div><p className="alert warn">These are shown only once.</p></>)
          : <Button icon="key" onClick={async () => { const r = await api<{ recoveryCodes: string[] }>('/account/recovery-codes', { body: {} }); setCodes(r.recoveryCodes); setCodesLeft(10); }}>Make new recovery codes</Button>}
      </section>
    </div>
  );
}

function DataTab() {
  const { account, signOut } = useApp();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState('');
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(0);
  useEffect(() => { if (account) void countPending(account.id).then(setPending); }, [account]);
  return (
    <div className="stack" style={{ maxWidth: 600 }}>
      <section className="card flat stack"><h2>Export</h2>
        <p className="muted" style={{ margin: 0 }}>Download all learner progress, settings and artwork as a JSON file.</p>
        <Button icon="download" onClick={async () => { const r = await api('/account/export'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' })); a.download = 'wonderlab-export.json'; a.click(); }}>Export my family's data</Button>
      </section>
      <section className="card flat stack"><h2>Delete account</h2>
        <p className="muted" style={{ margin: 0 }}>Permanently deletes your account, all learner profiles, progress and artwork. This cannot be undone.</p>
        {pending > 0 && <div className="alert warn">{pending} change(s) on this device haven't synced yet.</div>}
        <Button variant="danger" icon="trash" onClick={() => setOpen(true)}>Delete account…</Button>
      </section>
      <p className="muted small">WonderLab collects only what it needs: a username, password and security answer (stored as secure hashes), an optional email, and each learner's nickname, avatar, class and age band. No ads, tracking, public profiles, public galleries, leaderboards or chat.</p>
      {open && (
        <Modal title="Delete account permanently?" onClose={() => setOpen(false)}>
          <form className="stack" onSubmit={async (e) => { e.preventDefault(); try { await api('/account', { method: 'DELETE', body: { confirmUsername: confirm } }); await signOut({ force: true }); nav('/signup'); } catch (x) { toast((x as Error).message); } }}>
            <Field label={`Type your username (${account?.username}) to confirm`}>{(f) => <TextInput {...f} value={confirm} onChange={(e) => setConfirm(e.target.value)} />}</Field>
            <div className="row"><Button type="button" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" variant="danger">Delete everything</Button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
