// Teachers and tuition centres: class overview, CSV export, print report and adding several learners at once.
// One account holds one learner profile per student; nothing is shared with any other account.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../../lib/api';
import { useApp, useL, type Profile } from '../../lib/app';
import { applyOverrides, loadClass, type ClassContent } from '../../content';
import { Button, Field, Modal, Segmented } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { AVATAR_EMOJI, CLASSES, MAX_PROFILES, type Avatar, type ClassLevel } from '../../shared/levels';
import { getOverrides } from '../home/useClassContent';
import { classOverview, overviewCsv, overviewFilters, overviewRows, parseLearnerNames, MAX_BULK, type LearnerSummary, type OverviewResponse, type SortKey } from './classroom';
import './classroom.css';

/** Local "YYYY-MM-DD" for an epoch-seconds time. */
function localDate(sec: number) {
  const d = new Date(sec * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
/** "Today", "Yesterday", "5 days ago" or a date. */
function lastActiveText(sec: number | null, nowSec = Date.now() / 1000) {
  if (!sec) return 'Never';
  const days = Math.floor((new Date(nowSec * 1000).setHours(0, 0, 0, 0) - new Date(sec * 1000).setHours(0, 0, 0, 0)) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 14) return `${days} days ago`;
  return new Date(sec * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Loads the overview from the server and the curriculum for every class in it. */
function useOverview() {
  const [list, setList] = useState<LearnerSummary[] | null>(null);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let off = false;
    setError('');
    (async () => {
      const r = await api<OverviewResponse>('/profiles/overview', { signal: typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(20000) : undefined });
      const overrides = await getOverrides();
      const levels = [...new Set(r.profiles.map((p) => p.classLevel))];
      const loaded = new Map<number, ClassContent>();
      await Promise.all(levels.map(async (l) => { try { loaded.set(l, applyOverrides(await loadClass(l as ClassLevel), overrides)); } catch { /* class not available offline */ } }));
      if (!off) setList(classOverview(r, (l) => loaded.get(l) ?? null));
    })().catch((e) => { if (!off) setError(e instanceof ApiError && e.status === 0 ? 'The class overview needs an internet connection.' : e instanceof ApiError ? e.message : 'Could not load the class overview.'); });
    return () => { off = true; };
  }, [tick]);
  return { list, error, reload: useCallback(() => setTick((t) => t + 1), []) };
}

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name' }, { value: 'mastery', label: 'Lowest mastery' }, { value: 'needsHelp', label: 'Needs help' },
  { value: 'lastActive', label: 'Least active' }, { value: 'class', label: 'Class' },
];

/** Filter state kept in the URL so the print report shows the same rows. */
function useFilters() {
  const [sp, setSp] = useSearchParams();
  const level = sp.get('level') ? Number(sp.get('level')) : null;
  const subject = sp.get('subject') || null;
  const sort = (SORTS.find((s) => s.value === sp.get('sort'))?.value ?? 'name') as SortKey;
  const set = (k: string, v: string | null) => { const n = new URLSearchParams(sp); if (v === null || v === '') n.delete(k); else n.set(k, v); setSp(n, { replace: true }); };
  return { level, subject, sort, set, query: (() => { const n = new URLSearchParams(); if (level !== null) n.set('level', String(level)); if (subject) n.set('subject', subject); n.set('sort', sort); return n.toString(); })() };
}

function downloadCsv(list: LearnerSummary[], f: { level: number | null; subject: string | null; sort: SortKey }) {
  const rows = overviewRows(list, f);
  const dates = Object.fromEntries(list.filter((l) => l.lastActive).map((l) => [l.id, localDate(l.lastActive!)]));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([overviewCsv(rows, dates)], { type: 'text/csv;charset=utf-8' }));
  a.download = `wonderlab-class-${localDate(Date.now() / 1000)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export function ClassOverviewTab() {
  const { list, error, reload } = useOverview();
  const f = useFilters();
  const nav = useNavigate();
  const [open, setOpen] = useState<LearnerSummary | null>(null);
  const filters = useMemo(() => overviewFilters(list ?? []), [list]);
  const rows = useMemo(() => overviewRows(list ?? [], f), [list, f.level, f.subject, f.sort]); // eslint-disable-line react-hooks/exhaustive-deps
  if (error) return <div className="stack"><div className="alert error" role="alert"><Icon name="alert" />{error}</div><Button icon="reset" onClick={reload}>Try again</Button></div>;
  if (!list) return <p role="status">Loading class overview…</p>;
  if (!list.length) return <p>No learners yet. Add one profile per student in <b>Learners</b> (you can add several at once).</p>;
  const helpCount = list.filter((l) => (f.level === null || l.classLevel === f.level) && l.subjects.some((s) => (!f.subject || s.subject === f.subject) && s.needsHelp > 0)).length;
  return (
    <div className="stack class-ov">
      <p className="muted" style={{ margin: 0 }}>
        Every learner on this account, by subject. <b>Mastery</b> is the average progress toward mastering each skill (100% = all mastered).
        A chapter is done when all its skills are mastered. <b>Needs help</b> counts skills tried 3 or more times with under 60% correct.
      </p>
      <div className="class-ov-filters">
        <Field label="Class">{(p) => (
          <select {...p} className="input" value={f.level ?? ''} onChange={(e) => f.set('level', e.target.value)}>
            <option value="">All classes</option>
            {filters.levels.map((l) => <option key={l.level} value={l.level}>{l.label}</option>)}
          </select>
        )}</Field>
        <Field label="Subject">{(p) => (
          <select {...p} className="input" value={f.subject ?? ''} onChange={(e) => f.set('subject', e.target.value)}>
            <option value="">All subjects</option>
            {filters.subjects.map((s) => <option key={s.subject} value={s.subject}>{s.name}</option>)}
          </select>
        )}</Field>
        <Field label="Sort by">{(p) => (
          <select {...p} className="input" value={f.sort} onChange={(e) => f.set('sort', e.target.value)}>
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        )}</Field>
      </div>
      <div className="row">
        <Button icon="download" onClick={() => downloadCsv(list, f)} disabled={!rows.length}>Download CSV</Button>
        <Button icon="print" onClick={() => nav(`/parent/report?${f.query}`)} disabled={!rows.length}>Print report</Button>
        <Button icon="reset" variant="ghost" onClick={reload}>Refresh</Button>
        <span className="spacer" />
        <span className="muted small">{list.length} learner{list.length === 1 ? '' : 's'}{helpCount ? ` · ${helpCount} need help` : ''}</span>
      </div>
      {!rows.length ? <p className="muted">No learners match these filters.</p> : (
        <div className="card class-ov-table">
          <table className="data">
            <caption className="sr-only">Class overview by learner and subject</caption>
            <thead><tr><th scope="col">Learner</th><th scope="col">Class</th><th scope="col">Subject</th><th scope="col">Chapters done</th><th scope="col">Mastery</th><th scope="col">Last active</th><th scope="col">Needs help</th></tr></thead>
            <tbody>
              {rows.map(({ learner: l, subject: s }) => (
                <tr key={`${l.id}:${s.subject}`}>
                  <th scope="row"><button type="button" className="linklike" onClick={() => setOpen(l)} aria-label={`${l.nickname}: weakest skills`}><span aria-hidden="true">{AVATAR_EMOJI[l.avatar as Avatar] ?? ''} </span>{l.nickname}</button></th>
                  <td>{l.classLabel}</td>
                  <td>{s.name}</td>
                  <td>{s.chaptersDone} / {s.chapters}</td>
                  <td><span className="class-ov-pct"><span className="meter" aria-hidden="true"><i style={{ width: `${s.masteryPct}%` }} /></span>{s.masteryPct}%</span></td>
                  <td>{lastActiveText(l.lastActive)}</td>
                  <td>{s.needsHelp ? <span className="status practice"><Icon name="alert" />{s.needsHelp} skill{s.needsHelp === 1 ? '' : 's'}</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && <LearnerDetail l={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function LearnerDetail({ l, onClose }: { l: LearnerSummary; onClose: () => void }) {
  const L = useL();
  return (
    <Modal title={`${l.nickname} · ${l.classLabel}`} onClose={onClose}>
      <p className="muted" style={{ marginTop: 0 }}>Mastery {l.masteryPct}% · {l.chaptersDone} of {l.chapters} chapters done · last active {lastActiveText(l.lastActive).toLowerCase()}</p>
      <h3>Weakest skills</h3>
      {l.weakest.length ? (
        <ol className="stack-sm">
          {l.weakest.map((w) => (
            <li key={w.objectiveId}>
              <b>{L(w.title)}</b> {w.needsHelp && <span className="status practice"><Icon name="alert" />Needs help</span>}
              <div className="muted small">{w.subject} · {L(w.chapter)} · {w.attempts} tries, {w.accuracyPct}% correct</div>
            </li>
          ))}
        </ol>
      ) : <p className="muted">No skills to work on yet — either nothing has been practised or everything tried is mastered.</p>}
      <h3>By subject</h3>
      <ul className="stack-sm">{l.subjects.map((s) => <li key={s.subject}>{s.name}: {s.masteryPct}% · {s.chaptersDone}/{s.chapters} chapters{s.needsHelp ? ` · ${s.needsHelp} need help` : ''}</li>)}</ul>
      <div className="row"><Button onClick={onClose}>Close</Button></div>
    </Modal>
  );
}

/** Print-friendly report (`/parent/report?level=&subject=&sort=`), same rows as the overview. */
export function ClassReport() {
  const { list, error } = useOverview();
  const { account } = useApp();
  const L = useL();
  const f = useFilters();
  const nav = useNavigate();
  const rows = useMemo(() => overviewRows(list ?? [], f), [list, f.level, f.subject, f.sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const learners = useMemo(() => [...new Map(rows.map((r) => [r.learner.id, r.learner])).values()], [rows]);
  const scope = [f.level !== null ? CLASSES[f.level as ClassLevel]?.label : 'All classes', f.subject ? rows[0]?.subject.name ?? f.subject : 'All subjects'].join(' · ');
  return (
    <div className="class-report">
      <div className="row no-print">
        <Button icon="back" onClick={() => nav(`/parent?tab=class&${f.query}`)}>Back to class overview</Button>
        <Button icon="print" variant="primary" onClick={() => window.print()} disabled={!list}>Print</Button>
        {list && <Button icon="download" onClick={() => downloadCsv(list, f)}>Download CSV</Button>}
      </div>
      <h1>Class report</h1>
      <p className="muted">{account?.username} · {scope} · {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      {error && <div className="alert error" role="alert">{error}</div>}
      {!list && !error && <p role="status">Loading…</p>}
      {list && (
        <>
          <table className="data">
            <thead><tr><th scope="col">Learner</th><th scope="col">Class</th><th scope="col">Subject</th><th scope="col">Chapters done</th><th scope="col">Mastery</th><th scope="col">Needs help</th><th scope="col">Last active</th></tr></thead>
            <tbody>{rows.map(({ learner: l, subject: s }) => (
              <tr key={`${l.id}:${s.subject}`}><th scope="row">{l.nickname}</th><td>{l.classLabel}</td><td>{s.name}</td><td>{s.chaptersDone} / {s.chapters}</td><td>{s.masteryPct}%</td><td>{s.needsHelp || '—'}</td><td>{l.lastActive ? localDate(l.lastActive) : 'Never'}</td></tr>
            ))}</tbody>
          </table>
          {learners.some((l) => l.weakest.some((w) => w.needsHelp)) && (
            <section className="class-report-help">
              <h2>Skills to revisit</h2>
              {learners.filter((l) => l.weakest.some((w) => w.needsHelp)).map((l) => (
                <p key={l.id}><b>{l.nickname}:</b> {l.weakest.filter((w) => w.needsHelp).map((w) => `${L(w.title)} (${w.subject})`).join('; ')}</p>
              ))}
            </section>
          )}
          <p className="muted small">Mastery = average progress toward mastering each skill. Needs help = tried 3+ times with under 60% correct. Made with WonderLab; learner names are first names or nicknames only.</p>
        </>
      )}
    </div>
  );
}

/** Add several learners at once: paste first names, choose one class. */
export function BulkAddLearners({ profiles, onClose, onAdded }: { profiles: Profile[]; onClose: () => void; onAdded: (n: number) => void }) {
  const [text, setText] = useState('');
  const [level, setLevel] = useState<number | ''>('');
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const check = useMemo(() => parseLearnerNames(text, profiles.map((p) => p.nickname)), [text, profiles]);
  const left = MAX_PROFILES - profiles.length;
  const over = check.names.length > left;
  const canSave = !busy && level !== '' && check.names.length > 0 && !check.problems.length && !over;
  return (
    <Modal title="Add several learners" onClose={onClose}>
      <form className="stack" onSubmit={async (e) => {
        e.preventDefault(); if (!canSave) return;
        setBusy(true); setErr('');
        try {
          const r = await api<{ profiles: unknown[] }>('/profiles/bulk', { body: { nicknames: check.names, classLevel: level, language } });
          onAdded(r.profiles.length);
        } catch (x) { setErr(x instanceof ApiError ? (x.status === 0 ? 'You are offline. Adding learners needs internet.' : x.message) : 'Could not add learners.'); }
        finally { setBusy(false); }
      }}>
        <div className="alert info"><Icon name="shield" />Use first names or nicknames only — no surnames, roll numbers, phone numbers or emails. Add an initial if two students share a name.</div>
        <Field label="First names" hint={`One per line, or separated by commas. Up to ${Math.min(MAX_BULK, Math.max(0, left))} more (${MAX_PROFILES} per account).`}>{(p) => (
          <textarea {...p} className="input" rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Ravi\nSita\nAnil K'} autoComplete="off" spellCheck={false} />
        )}</Field>
        <Field label="Class">{(p) => (
          <select {...p} className="input" value={level} onChange={(e) => setLevel(e.target.value === '' ? '' : +e.target.value)}>
            <option value="">Choose a class…</option>
            {CLASSES.map((c) => <option key={c.level} value={c.level}>{c.label}</option>)}
          </select>
        )}</Field>
        {level !== '' && level <= 5 && (
          <div className="stack-sm"><span style={{ fontWeight: 800 }} aria-hidden="true">Language</span>
            <Segmented label="Language" value={language} onChange={setLanguage} options={[{ value: 'en', label: 'English' }, { value: 'te', label: 'తెలుగు (Telugu)' }]} /></div>
        )}
        {check.names.length > 0 && <p className="muted" style={{ margin: 0 }} role="status">{check.names.length} learner{check.names.length === 1 ? '' : 's'} to add: {check.names.join(', ')}. Avatars are given automatically; each learner can change theirs.</p>}
        {check.problems.map((x, i) => <div key={`p${i}`} className="alert error"><Icon name="alert" />{x.name ? `“${x.name}”: ` : ''}{x.problem}</div>)}
        {check.warnings.map((x, i) => <div key={`w${i}`} className="alert warn"><Icon name="info" />“{x.name}”: {x.warning}</div>)}
        {over && <div className="alert error"><Icon name="alert" />{left <= 0 ? `This account already has ${MAX_PROFILES} learners, the most one account can hold. Remove a learner who has left first.` : `Only ${left} more learner${left === 1 ? '' : 's'} can be added (${MAX_PROFILES} per account).`}</div>}
        {err && <div className="alert error" role="alert"><Icon name="alert" />{err}</div>}
        <div className="row"><Button type="button" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" icon="plus" disabled={!canSave}>{busy ? 'Adding…' : `Add ${check.names.length || ''} learner${check.names.length === 1 ? '' : 's'}`}</Button></div>
        <p className="muted small" style={{ margin: 0 }}>Each student gets their own private profile on this account. Progress is never shared with other accounts. See <Link to="/parent?tab=class">Class overview</Link> for everyone's progress.</p>
      </form>
    </Modal>
  );
}

