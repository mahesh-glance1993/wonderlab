// Public /schools page: pitch for schools and tuition centres plus an enquiry form (POST /api/leads).
// The form collects ADULT staff contact details only — never any child data.
import { useState, type FormEvent } from 'react';
import { useApp } from '../../lib/app';
import { api, ApiError } from '../../lib/api';
import { Button, Field, Page, TextInput } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { LEAD_CLASSES, LEAD_HONEYPOT, validateLead, type LeadErrors, type LeadField, type LeadKind } from '../../shared/leads';
import { useOutreachLang } from './strings';
import { LangSwitch } from './LangSwitch';
import './outreach.css';

type Form = { kind: LeadKind; contactName: string; role: string; orgName: string; town: string; phone: string; email: string; students: string; classes: string[]; message: string; confirmStaff: boolean; [LEAD_HONEYPOT]: string };
const EMPTY: Form = { kind: 'school', contactName: '', role: '', orgName: '', town: '', phone: '', email: '', students: '', classes: [], message: '', confirmStaff: false, [LEAD_HONEYPOT]: '' };

export default function Schools() {
  const { account } = useApp();
  const { lang, s, fe, toggle } = useOutreachLang();
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [failure, setFailure] = useState('');
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  const errOf = (k: LeadField) => (errors[k] ? fe[k] : undefined);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFailure('');
    const body = { ...f, lang };
    const v = validateLead(body);
    if (!v.ok) {
      setErrors(v.errors);
      setFailure(s.fixFields);
      requestAnimationFrame(() => document.querySelector<HTMLElement>('.outreach-form [aria-invalid="true"]')?.focus());
      return;
    }
    setErrors({});
    setStatus('sending');
    try {
      await api('/leads', { body });
      setStatus('sent');
      setF(EMPTY);
    } catch (x) {
      setStatus('idle');
      if (x instanceof ApiError && x.code === 'invalid' && x.body.error) {
        const fields = ((x.body.error as Record<string, unknown>).fields || {}) as LeadErrors;
        setErrors(fields);
        setFailure(s.fixFields);
      } else setFailure(x instanceof ApiError && x.status === 429 ? s.failRate : x instanceof ApiError && x.code === 'offline' ? s.failOffline : s.failGeneric);
    }
  }

  return (
    <Page title={s.sTitle} back={account ? '/parent' : '/signin'} actions={<LangSwitch label={s.langSwitchLabel} text={s.langSwitch} onClick={toggle} />}>
      <div className="outreach stack" lang={lang}>
        <section className="outreach-hero">
          <h1>{s.sH1}</h1>
          <p className="lead">{s.sIntro}</p>
          <a className="btn primary" href="#enquiry">{s.sFormH}</a>
        </section>

        <section aria-labelledby="get-h">
          <h2 id="get-h">{s.sGetH}</h2>
          <ul className="grid outreach-list">
            {s.sGet.map(([icon, h, p]) => (
              <li key={h} className="card flat">
                <Icon name={icon} size="lg" />
                <h3>{h}</h3>
                <p className="muted">{p}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card outreach-pilot" aria-labelledby="pilot-h">
          <h2 id="pilot-h"><Icon name="sparkle" /> {s.sPilotH}</h2>
          <p>{s.sPilot}</p>
        </section>

        <section id="enquiry" aria-labelledby="form-h" className="card">
          <h2 id="form-h">{s.sFormH}</h2>
          <p className="alert info"><Icon name="shield" /><span>{s.sFormFor}</span></p>
          {status === 'sent' ? (
            <div className="stack">
              <div className="alert good" role="status"><Icon name="check" /><span><b>{s.sentH}</b> {s.sent}</span></div>
              <div><Button onClick={() => setStatus('idle')}>{s.sendAnother}</Button></div>
            </div>
          ) : (
            <form className="stack outreach-form" onSubmit={submit} noValidate>
              <fieldset className="outreach-fieldset">
                <legend>{s.kind}</legend>
                <div className="row">
                  {([['school', s.kSchool], ['tuition', s.kTuition], ['other', s.kOther]] as [LeadKind, string][]).map(([k, label]) => (
                    <label key={k} className="outreach-choice">
                      <input type="radio" name="kind" value={k} checked={f.kind === k} onChange={() => set('kind', k)} /> {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="outreach-two">
                <Field label={s.contactName} error={errOf('contactName')}>{(p) => <TextInput {...p} autoComplete="name" maxLength={80} value={f.contactName} onChange={(e) => set('contactName', e.target.value)} required />}</Field>
                <Field label={s.role} hint={s.roleHint} error={errOf('role')}>{(p) => <TextInput {...p} autoComplete="organization-title" maxLength={60} value={f.role} onChange={(e) => set('role', e.target.value)} required />}</Field>
                <Field label={s.orgName} error={errOf('orgName')}>{(p) => <TextInput {...p} autoComplete="organization" maxLength={120} value={f.orgName} onChange={(e) => set('orgName', e.target.value)} required />}</Field>
                <Field label={s.town} error={errOf('town')}>{(p) => <TextInput {...p} autoComplete="address-level2" maxLength={80} value={f.town} onChange={(e) => set('town', e.target.value)} required />}</Field>
                <Field label={s.phone} hint={s.contactHint} error={errOf('phone') || errOf('contact')}>{(p) => <TextInput {...p} type="tel" inputMode="tel" autoComplete="tel" maxLength={20} value={f.phone} onChange={(e) => set('phone', e.target.value)} />}</Field>
                <Field label={s.email} error={errOf('email')}>{(p) => <TextInput {...p} type="email" autoComplete="email" maxLength={120} value={f.email} onChange={(e) => set('email', e.target.value)} />}</Field>
                <Field label={s.students} error={errOf('students')}>{(p) => <TextInput {...p} inputMode="numeric" pattern="[0-9]*" maxLength={6} value={f.students} onChange={(e) => set('students', e.target.value.replace(/\D/g, ''))} />}</Field>
              </div>
              <fieldset className="outreach-fieldset" aria-describedby={errors.classes ? 'cls-e' : undefined}>
                <legend>{s.classes}</legend>
                <div className="row outreach-classes">
                  {LEAD_CLASSES.map((c) => (
                    <label key={c} className="outreach-choice">
                      <input type="checkbox" checked={f.classes.includes(c)} onChange={(e) => set('classes', e.target.checked ? [...f.classes, c] : f.classes.filter((x) => x !== c))} />
                      {c === 'pre' ? s.classPre : `${s.classN} ${c}`}
                    </label>
                  ))}
                </div>
                {errors.classes && <span className="error" id="cls-e" role="alert">{fe.classes}</span>}
              </fieldset>
              <Field label={s.message} hint={s.messageHint} error={errOf('message')}>{(p) => <textarea {...p} className="input" rows={4} maxLength={1000} value={f.message} onChange={(e) => set('message', e.target.value)} />}</Field>
              {/* Honeypot: hidden from people and assistive tech; bots that fill it are silently ignored. */}
              <div className="outreach-hp" aria-hidden="true">
                <label>{s.honeypot}<input type="text" name={LEAD_HONEYPOT} tabIndex={-1} autoComplete="off" value={f[LEAD_HONEYPOT]} onChange={(e) => set(LEAD_HONEYPOT, e.target.value)} /></label>
              </div>
              <label className="outreach-choice outreach-confirm">
                <input type="checkbox" checked={f.confirmStaff} onChange={(e) => set('confirmStaff', e.target.checked)} aria-invalid={errors.confirmStaff ? true : undefined} aria-describedby={errors.confirmStaff ? 'conf-e' : undefined} />
                <span>{s.confirmStaff}</span>
              </label>
              {errors.confirmStaff && <span className="error" id="conf-e" role="alert">{fe.confirmStaff}</span>}
              {failure && <div className="alert error" role="alert"><Icon name="alert" /><span>{failure}</span></div>}
              <div><Button variant="primary" type="submit" icon="next" disabled={status === 'sending'}>{status === 'sending' ? s.sending : s.send}</Button></div>
              <p className="muted small">{s.sPrivacy}</p>
            </form>
          )}
        </section>
      </div>
    </Page>
  );
}
