// Restricted educator/admin content editor: draft → validate → preview → publish → rollback.
// Server enforces the role; this UI is only reachable for educator/admin accounts.
import { useEffect, useState } from 'react';
import { api, ApiError } from '../../lib/api';
import { Page, Button, Field, TextInput, Segmented, toast } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { grade } from '../../shared/grading';
import { keyResponse } from '../../shared/validate';
import type { Question } from '../../shared/content';
import { invalidateOverrides } from '../home/useClassContent';

interface Item { id: string; kind: string; published_version: number | null; latest_version: number }
interface Version { version: number; status: string; data: Record<string, unknown>; validation: { ok: boolean; issues: { level: string; path: string; message: string }[] } | null; created_at: number; published_at: number | null; author: string | null; publisher: string | null }

export default function Editor() {
  const [tab, setTab] = useState<'content' | 'reports'>('content');
  return (
    <Page title="Content editor" back="/who">
      <div className="page-head"><h1>Content editor</h1><span className="spacer" /><Segmented label="Section" value={tab} onChange={setTab} options={[{ value: 'content', label: 'Content' }, { value: 'reports', label: 'Problem reports' }]} /></div>
      {tab === 'content' ? <ContentTab /> : <ReportsTab />}
    </Page>
  );
}

function ContentTab() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { const t = setTimeout(() => api<{ items: Item[] }>(`/admin/items?q=${encodeURIComponent(q)}`).then((r) => setItems(r.items)).catch(() => undefined), 250); return () => clearTimeout(t); }, [q]);
  return (
    <div className="editor-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) 1fr', gap: 16 }}>
      <aside className="card stack" style={{ maxHeight: '75dvh', overflow: 'auto' }}>
        <Field label="Search by id">{(f) => <TextInput {...f} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. m7.frac" />}</Field>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} className="stack">
          {items.map((i) => (
            <li key={i.id}><button className="btn small block" aria-pressed={sel === i.id} onClick={() => setSel(i.id)} style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
              <span className="pill">{i.kind}</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.id}</span><span className="muted">v{i.published_version}</span>
            </button></li>
          ))}
        </ul>
      </aside>
      <section>{sel ? <ItemEditor id={sel} key={sel} /> : <p className="muted">Choose an item to edit. Static questions, objectives and translations can be corrected here without rebuilding the app.</p>}</section>
    </div>
  );
}

function ItemEditor({ id }: { id: string }) {
  const [item, setItem] = useState<Item | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [draft, setDraft] = useState('');
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const load = async () => {
    const r = await api<{ item: Item; versions: Version[] }>(`/admin/items/${encodeURIComponent(id)}`);
    setItem(r.item); setVersions(r.versions);
    const pub = r.versions.find((v) => v.version === r.item.published_version) || r.versions[0];
    setDraft(JSON.stringify(pub?.data ?? {}, null, 2));
  };
  useEffect(() => { void load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setMsg(null);
    try { await fn(); setMsg({ ok: true, text: ok }); invalidateOverrides(); await load(); } catch (e) { setMsg({ ok: false, text: e instanceof ApiError ? e.message : (e as Error).message }); }
  };
  const parsed = (() => { try { return JSON.parse(draft) as Record<string, unknown>; } catch { return null; } })();
  return (
    <div className="stack">
      <div className="card stack">
        <h2 style={{ margin: 0 }}>{id}</h2>
        <p className="muted" style={{ margin: 0 }}>Kind: {item?.kind} · Published version: v{item?.published_version} · Latest: v{item?.latest_version}</p>
        {msg && <div className={`alert ${msg.ok ? 'good' : 'error'}`} role="status">{msg.text}</div>}
        <Field label="Edit (JSON)" hint="Change wording, answers, hints or Telugu text. Saving creates a new draft version; learners keep seeing the published version until you publish.">{(f) => (
          <textarea {...f} className="input" rows={16} spellCheck={false} style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '.85rem' }} value={draft} onChange={(e) => setDraft(e.target.value)} aria-invalid={!parsed} />
        )}</Field>
        <div className="row">
          <Button icon="eye" disabled={!parsed} onClick={() => setPreview(parsed)}>Preview</Button>
          <Button icon="plus" variant="primary" disabled={!parsed} onClick={() => void act(() => api(`/admin/items/${encodeURIComponent(id)}/drafts`, { body: { data: parsed } }), 'Draft saved.')}>Save as new draft</Button>
        </div>
      </div>
      {preview && <Preview data={preview} kind={item?.kind || ''} />}
      <div className="card">
        <h3>Version history</h3>
        <table className="data">
          <thead><tr><th>Version</th><th>Status</th><th>Author</th><th>Published by</th><th>Validation</th><th>Actions</th></tr></thead>
          <tbody>{versions.map((v) => (
            <tr key={v.version}>
              <td>v{v.version}</td><td><span className="pill">{v.status}</span></td><td>{v.author || 'bundled'}</td>
              <td>{v.publisher ? `${v.publisher} · ${new Date((v.published_at || 0) * 1000).toLocaleString()}` : v.status === 'published' ? 'bundled' : '—'}</td>
              <td>{v.validation ? (v.validation.ok ? <span className="status mastered"><Icon name="check" />OK</span> : <span title={v.validation.issues.map((i) => i.message).join('\n')} className="status practice"><Icon name="alert" />{v.validation.issues.filter((i) => i.level === 'error').length} errors</span>) : '—'}</td>
              <td className="row" style={{ gap: 6 }}>
                <Button small onClick={() => { setDraft(JSON.stringify(v.data, null, 2)); setPreview(v.data); }}>Open</Button>
                {v.status === 'draft' && <Button small onClick={() => void act(async () => { const r = await api<{ ok: boolean; issues: { message: string }[] }>(`/admin/items/${encodeURIComponent(id)}/versions/${v.version}/validate`, { body: {} }); if (!r.ok) throw new Error('Validation failed: ' + r.issues.map((i) => i.message).join('; ')); }, 'Validated.')}>Validate</Button>}
                {v.status === 'validated' && <Button small variant="primary" onClick={() => void act(() => api(`/admin/items/${encodeURIComponent(id)}/versions/${v.version}/publish`, { body: {} }), `v${v.version} published.`)}>Publish</Button>}
                {(v.status === 'archived') && <Button small onClick={() => void act(() => api(`/admin/items/${encodeURIComponent(id)}/rollback`, { body: { toVersion: v.version } }), `Rolled back to v${v.version}.`)}>Roll back to this</Button>}
              </td>
            </tr>
          ))}</tbody>
        </table>
        <p className="muted small">Earlier learner attempts keep the version they answered; reviews show that original wording.</p>
      </div>
    </div>
  );
}

function Preview({ data, kind }: { data: Record<string, unknown>; kind: string }) {
  if (kind !== 'question') return <div className="card"><h3>Preview</h3><pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre></div>;
  const q = data as unknown as Question;
  const kr = keyResponse(q);
  const ok = kr ? grade(q.answer, kr).correct : false;
  return (
    <div className="card stack" aria-label="Learner preview">
      <h3 style={{ margin: 0 }}>Learner preview</h3>
      <p style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{q.prompt?.en}</p>
      {q.prompt?.te && <p style={{ margin: 0 }} lang="te">{q.prompt.te}</p>}
      {q.choices && <div className="row">{q.choices.map((c) => <span key={c.id} className={`choice ${(q.answer as { correct?: string }).correct === c.id ? 'is-right' : ''}`}>{c.label.en}</span>)}</div>}
      <p className="muted" style={{ margin: 0 }}>Hints: {(q.hints || []).map((h) => h.en).join(' → ') || 'none'}</p>
      <div className={`alert ${ok ? 'good' : 'error'}`}>{ok ? 'Answer key grades as correct.' : 'Answer key does NOT grade as correct — fix before publishing.'}</div>
    </div>
  );
}

function ReportsTab() {
  const [reports, setReports] = useState<{ id: string; class_level: number; lesson_id: string; question_id: string; content_version: number; description: string; status: string; created_at: number }[]>([]);
  const load = () => api<{ reports: typeof reports }>('/admin/reports').then((r) => setReports(r.reports)).catch(() => undefined);
  useEffect(() => { void load(); }, []);
  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table className="data">
        <thead><tr><th>When</th><th>Class</th><th>Lesson</th><th>Question (version)</th><th>Description</th><th>Status</th></tr></thead>
        <tbody>{reports.map((r) => (
          <tr key={r.id}><td>{new Date(r.created_at * 1000).toLocaleDateString()}</td><td>{r.class_level}</td><td>{r.lesson_id}</td><td>{r.question_id} (v{r.content_version ?? '?'})</td><td>{r.description || '—'}</td>
            <td><select className="input" value={r.status} onChange={async (e) => { await api(`/admin/reports/${r.id}`, { method: 'PATCH', body: { status: e.target.value } }); toast('Updated'); void load(); }}><option value="open">Open</option><option value="fixed">Fixed</option><option value="wontfix">Won't fix</option></select></td></tr>
        ))}</tbody>
      </table>
      {!reports.length && <p className="muted">No reports yet.</p>}
    </div>
  );
}
