import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../../lib/api';
import { useApp, type Profile } from '../../lib/app';
import { Page, Button, Field, TextInput, toast } from '../../ui/kit';
import { AGE_BANDS, AVATARS, AVATAR_EMOJI, CLASSES, suggestAgeBand, type AgeBand, type Avatar, type ClassLevel } from '../../shared/levels';
import { ParentGate } from './ParentGate';

export function ProfileForm({ initial, onSaved, submitLabel }: { initial?: Profile; onSaved: (p: Profile) => void; submitLabel: string }) {
  const [nickname, setNickname] = useState(initial?.nickname || '');
  const [avatar, setAvatar] = useState<Avatar>(initial?.avatar || 'owl');
  const [classLevel, setClassLevel] = useState<ClassLevel | ''>(initial?.classLevel ?? '');
  const [ageBand, setAgeBand] = useState<AgeBand | ''>(initial?.ageBand || '');
  const [bandTouched, setBandTouched] = useState(!!initial);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  return (
    <form className="stack" noValidate onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); setFields({});
      try {
        const body = { nickname, avatar, classLevel, ageBand };
        const r = initial
          ? await api<{ profile: Profile }>(`/p/${initial.id}/profile`, { method: 'PATCH', body })
          : await api<{ profile: Profile }>('/profiles', { body });
        onSaved(r.profile);
      } catch (x) { if (x instanceof ApiError) setFields(x.fields || { form: x.message }); } finally { setBusy(false); }
    }}>
      <Field label="Nickname" hint="A first name or fun name. No surnames, emails or phone numbers." error={fields.nickname}>{(p) => <TextInput {...p} maxLength={20} value={nickname} onChange={(e) => setNickname(e.target.value)} />}</Field>
      <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 800, marginBottom: 6 }}>Avatar</legend>
        <div className="row" role="radiogroup" aria-label="Avatar">
          {AVATARS.map((a) => <button type="button" key={a} role="radio" aria-checked={a === avatar} aria-label={a} className="btn" style={{ fontSize: '1.8rem', width: 60, height: 60, outline: a === avatar ? '3px solid var(--primary)' : undefined }} onClick={() => setAvatar(a)}>{AVATAR_EMOJI[a]}</button>)}
        </div>
        {fields.avatar && <span className="error">{fields.avatar}</span>}
      </fieldset>
      <Field label="Class" hint="Sets which lessons appear. Learners can still revisit or explore other classes." error={fields.classLevel}>{(p) => (
        <select {...p} className="input" value={classLevel} onChange={(e) => { const v = +e.target.value as ClassLevel; setClassLevel(v); if (!bandTouched) setAgeBand(suggestAgeBand(v)); }}>
          <option value="">Choose…</option>
          {CLASSES.map((c) => <option key={c.level} value={c.level}>{c.label}</option>)}
        </select>
      )}</Field>
      <Field label="Age band" hint="Used for reading level, instructions and button size. We don't ask for a birth date." error={fields.ageBand}>{(p) => (
        <select {...p} className="input" value={ageBand} onChange={(e) => { setAgeBand(e.target.value as AgeBand); setBandTouched(true); }}>
          <option value="">Choose…</option>
          {AGE_BANDS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
      )}</Field>
      {fields.form && <div className="alert error" role="alert">{fields.form}</div>}
      <Button variant="primary" type="submit" disabled={busy}>{submitLabel}</Button>
    </form>
  );
}

/** First-run parent setup: add one or more learner profiles. */
export default function Setup() {
  const { profiles, refresh, selectProfile } = useApp();
  const nav = useNavigate();
  const [adding, setAdding] = useState(true);
  return (
    <Page title="Set up learners" back={profiles.length ? '/who' : false}>
      <ParentGate reason="Adding learners is a parent action.">
        <div style={{ maxWidth: 640, margin: '0 auto' }} className="stack">
          <h1>Who will learn with WonderLab?</h1>
          <p className="muted">Each learner gets separate progress, recommendations, downloads, artwork and settings.</p>
          {profiles.map((p) => <div key={p.id} className="card flat row"><span style={{ fontSize: '2rem' }}>{AVATAR_EMOJI[p.avatar]}</span><b>{p.nickname}</b><span className="muted">{CLASSES[p.classLevel].label}</span></div>)}
          {adding ? (
            <div className="card"><ProfileForm submitLabel="Add learner" onSaved={async (p) => { await refresh(); toast(`${p.nickname} added`); setAdding(false); }} /></div>
          ) : (
            <div className="row">
              <Button icon="plus" onClick={() => setAdding(true)}>Add another learner</Button>
              {profiles.length > 0 && <Button variant="primary" onClick={() => { if (profiles.length === 1) { selectProfile(profiles[0].id); nav('/'); } else nav('/who'); }}>Done</Button>}
            </div>
          )}
        </div>
      </ParentGate>
    </Page>
  );
}
