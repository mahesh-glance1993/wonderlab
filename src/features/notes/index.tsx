// My Notes (same as the apps — android/.../feature/notes/Notes.kt). Mounted at /notes/*:
//   /notes                                   list: search, subject filter, New note
//   /notes/edit/:key?subject=&title=         editor: title, subject, typed text (autosave), handwriting, delete
// Notes are learner activity state "notes:<key>" (NoteDoc JSON), saved on this device first and synced to the
// account, so they follow the learner between the website and the apps.
import { useCallback, useEffect, useId, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { Button, Modal, Page, Segmented, TextInput, toast } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import {
  MAX_STATE, MAX_TEXT, NOTE_PREFIX, SUBJECT_INFO, allNotes, decodeStroke, encodeStroke, newNote, notePath, readNote, stamp, subjectEmoji, subjectName, wordCount,
  type NoteDoc, type Pt,
} from './model';
import './notes.css';

export default function NotesFeature() {
  return (
    <Routes>
      <Route index element={<NotesHome />} />
      <Route path="edit/:key" element={<EditorRoute />} />
      <Route path="*" element={<Navigate to="/notes" replace />} />
    </Routes>
  );
}

const fmtDate = (ms: number) => (ms ? new Date(ms).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '');

// ---------------------------------------------------------------- list

function NotesHome() {
  const { learner, learnerReady, t } = useApp();
  const nav = useNavigate();
  const notes = useMemo(() => allNotes(learner), [learner]);
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const shown = notes.filter((n) => (!subject || n.subject === subject) && (!q || n.title.toLowerCase().includes(q) || n.text.toLowerCase().includes(q)));
  const subjects = [...new Set(notes.map((n) => n.subject))].sort();
  const searchId = useId();
  return (
    <Page title={t('myNotes')}>
      <div className="page-head">
        <div>
          <h1>{t('myNotes')}</h1>
          <p className="muted small" style={{ margin: 0 }}>{notes.length} note{notes.length === 1 ? '' : 's'} · saved on this device and in your account</p>
        </div>
        <span className="spacer" />
        <Button variant="primary" icon="plus" onClick={() => nav(notePath(`free-${crypto.randomUUID()}`, subject ?? 'general', ''))}>New note</Button>
      </div>
      <div className="notes-tools">
        <label className="sr-only" htmlFor={searchId}>Search your notes</label>
        <div className="notes-search">
          <Icon name="search" />
          <TextInput id={searchId} type="search" placeholder="Search your notes" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {subjects.length > 0 && (
          <div className="note-chips" role="group" aria-label="Filter by subject">
            <button type="button" className="note-chip" aria-pressed={subject === null} onClick={() => setSubject(null)}>All</button>
            {subjects.map((s) => (
              <button key={s} type="button" className="note-chip" aria-pressed={subject === s} onClick={() => setSubject(s)}>
                <span aria-hidden="true">{subjectEmoji(s)}</span>{subjectName(s)}
              </button>
            ))}
          </div>
        )}
      </div>
      {!learnerReady && <p role="status" className="muted">Loading…</p>}
      {learnerReady && !shown.length && (
        <div className="notes-empty card flat">
          <span className="notes-empty-pic" aria-hidden="true">📝</span>
          <h2>{notes.length ? 'No notes match' : 'No notes yet'}</h2>
          <p className="muted">Open any lesson and choose <b>Notes</b> to write about that chapter, or start a new note here. Tip: choose <b>Save to notes</b> on key points while you learn.</p>
        </div>
      )}
      {learnerReady && shown.length > 0 && (
        <ul className="note-list">
          {shown.map((n) => (
            <li key={n.key}>
              <Link className="note-row card" to={notePath(n.key, n.subject, n.title)}>
                <span className="note-row-pic" aria-hidden="true">{subjectEmoji(n.subject)}</span>
                <span className="note-row-text">
                  <b>{n.title.trim() || 'Untitled note'}</b>
                  <span className="note-preview">{n.text.split('\n').find((l) => l.trim())?.slice(0, 120) ?? (n.ink.length ? 'Handwritten note' : 'Empty')}</span>
                  <small className="muted">{subjectName(n.subject)} · {fmtDate(n.updatedAt)}</small>
                </span>
                <Icon name="next" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}

// ---------------------------------------------------------------- editor

function EditorRoute() {
  const { key = '' } = useParams();
  const [sp] = useSearchParams();
  const { learnerReady } = useApp();
  if (!key || key.length > 110) return <Navigate to="/notes" replace />;
  if (!learnerReady) return <Page title="My Notes" back="/notes"><p role="status" className="muted">Loading…</p></Page>;
  return <NoteEditor key={key} noteKey={key} subject={sp.get('subject') || 'general'} title={sp.get('title') || ''} />;
}

function NoteEditor({ noteKey, subject, title }: { noteKey: string; subject: string; title: string }) {
  const { learner, saveActivityState } = useApp();
  const nav = useNavigate();
  const existing = useMemo(() => readNote(learner, noteKey), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [doc, setDoc] = useState<NoteDoc>(() => (existing && !existing.deleted ? existing : newNote(noteKey, subject, title)));
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState(existing && !existing.deleted ? existing.updatedAt : 0);
  const [mode, setMode] = useState<'type' | 'draw'>(() => (existing && !existing.text.trim() && existing.ink.length ? 'draw' : 'type'));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tooBig, setTooBig] = useState(false);
  const docRef = useRef(doc); docRef.current = doc;
  const dirtyRef = useRef(dirty); dirtyRef.current = dirty;
  const textRef = useRef<HTMLTextAreaElement>(null);
  const titleId = useId();
  const textId = useId();

  const save = useCallback((d: NoteDoc) => {
    const out = stamp(d);
    if (JSON.stringify(out).length > MAX_STATE) { setTooBig(true); return false; }
    setTooBig(false);
    void saveActivityState(NOTE_PREFIX + d.key, out);
    setSavedAt(out.updatedAt);
    return true;
  }, [saveActivityState]);
  const saveRef = useRef(save); saveRef.current = save;

  // autosave shortly after the learner stops typing / drawing, and when leaving
  useEffect(() => {
    if (!dirty) return;
    const h = setTimeout(() => { if (saveRef.current(docRef.current)) setDirty(false); }, 700);
    return () => clearTimeout(h);
  }, [doc, dirty]);
  useEffect(() => {
    const flush = () => { if (dirtyRef.current) saveRef.current(docRef.current); };
    window.addEventListener('pagehide', flush);
    return () => { window.removeEventListener('pagehide', flush); flush(); };
  }, []);

  const edit = (f: (n: NoteDoc) => NoteDoc) => { setDoc((d) => f(d)); setDirty(true); };
  const addText = (s: string) => {
    edit((n) => ({ ...n, text: (n.text.trimEnd() + s).slice(0, MAX_TEXT) }));
    requestAnimationFrame(() => { const el = textRef.current; if (el) { el.focus(); el.selectionStart = el.selectionEnd = el.value.length; } });
  };
  const status = tooBig ? 'Too big to save' : dirty ? 'Saving…' : savedAt ? 'Saved' : 'Not saved yet';
  const heading = doc.title.trim() || 'New note';

  return (
    <Page title={heading} back="/notes" actions={<Button small variant="danger" icon="trash" onClick={() => setConfirmDelete(true)}><span className="hide-narrow">Delete</span><span className="sr-only"> this note</span></Button>}>
      <div className="note-editor stack">
        <p className="muted small note-status" role="status" aria-live="polite">{subjectName(doc.subject)} · {status}</p>
        {tooBig && <div className="alert warn" role="alert"><Icon name="alert" />This note is full. Start a new note, or clear some handwriting, so it can be saved.</div>}
        <div className="field">
          <label htmlFor={titleId}>Title</label>
          <TextInput id={titleId} value={doc.title} maxLength={120} placeholder="What is this note about?" onChange={(e) => { const v = e.target.value.slice(0, 120); edit((n) => ({ ...n, title: v })); }} />
        </div>
        <div className="note-chips" role="group" aria-label="Subject">
          {Object.keys(SUBJECT_INFO).map((s) => (
            <button key={s} type="button" className="note-chip" aria-pressed={doc.subject === s} onClick={() => edit((n) => ({ ...n, subject: s }))}>
              <span aria-hidden="true">{subjectEmoji(s)}</span>{subjectName(s)}
            </button>
          ))}
        </div>
        <div className="row note-modebar">
          <Segmented label="How to write" value={mode} onChange={setMode} options={[
            { value: 'type', label: <><Icon name="keyboard" />Type</> },
            { value: 'draw', label: <><Icon name="pen" />Write by hand</> },
          ]} />
          {mode === 'type' ? (
            <>
              <Button small onClick={() => addText('\n• ')}>• Point</Button>
              <Button small onClick={() => addText('\n\n## ')}>Heading</Button>
            </>
          ) : (
            <>
              <Button small icon="undo" disabled={!doc.ink.length} onClick={() => edit((n) => ({ ...n, ink: n.ink.slice(0, -1) }))}>Undo stroke</Button>
              <Button small icon="trash" disabled={!doc.ink.length} onClick={() => edit((n) => ({ ...n, ink: [] }))}>Clear drawing</Button>
            </>
          )}
        </div>
        {mode === 'type' ? (
          <div className="field">
            <label htmlFor={textId} className="sr-only">Your notes</label>
            <textarea ref={textRef} id={textId} className="input note-text" value={doc.text} maxLength={MAX_TEXT}
              placeholder="Write your notes here — in your own words. What did you learn? What is the formula? What should you remember for the exam?"
              onChange={(e) => { const v = e.target.value.slice(0, MAX_TEXT); edit((n) => ({ ...n, text: v })); }} />
          </div>
        ) : (
          <InkPad ink={doc.ink} onStroke={(s) => edit((n) => ({ ...n, ink: [...n.ink, s] }))} />
        )}
        {mode === 'draw' && doc.text.trim() && <p className="muted small" style={{ margin: 0 }}>This note also has typed text — choose <b>Type</b> to see it.</p>}
        {mode === 'type' && doc.ink.length > 0 && <p className="muted small" style={{ margin: 0 }}>This note also has handwriting — choose <b>Write by hand</b> to see it.</p>}
        <p className="muted small" style={{ margin: 0 }}>{wordCount(doc.text)} words{doc.ink.length ? ` · ${doc.ink.length} pen strokes` : ''}</p>
      </div>
      {confirmDelete && (
        <Modal title="Delete this note?" onClose={() => setConfirmDelete(false)}>
          <p>“{doc.title.trim() || 'Untitled note'}” will be removed from this device and your account.</p>
          <div className="row">
            <Button onClick={() => setConfirmDelete(false)}>Keep</Button>
            <Button variant="danger" icon="trash" onClick={() => {
              dirtyRef.current = false; setDirty(false);
              save({ ...doc, deleted: true, text: '', ink: [] });
              toast('Note deleted');
              nav('/notes', { replace: true });
            }}>Delete</Button>
          </div>
        </Modal>
      )}
    </Page>
  );
}

// ---------------------------------------------------------------- handwriting pad

/** Finger, stylus or mouse; strokes stored in 0..1000 page units so they scale with the screen (as in the apps). */
function InkPad({ ink, onStroke }: { ink: string[]; onStroke: (stroke: string) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const live = useRef<Pt[] | null>(null);
  const strokes = useMemo(() => ink.map(decodeStroke), [ink]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { const r = el.getBoundingClientRect(); setSize({ w: Math.round(r.width), h: Math.round(r.height) }); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const colors = () => {
    const cs = getComputedStyle(wrap.current ?? document.documentElement);
    return { ink: cs.getPropertyValue('--ink').trim() || '#1D2540', line: cs.getPropertyValue('--line').trim() || '#D6DAE8' };
  };
  const drawStroke = (ctx: CanvasRenderingContext2D, pts: Pt[], w: number, h: number) => {
    if (pts.length < 2) return;
    ctx.beginPath();
    pts.forEach(([x, y], i) => { const px = (x / 1000) * w, py = (y / 1000) * h; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
    ctx.stroke();
  };
  const redraw = useCallback(() => {
    const c = canvas.current;
    const { w, h } = size;
    if (!c || !w || !h) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const col = colors();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    // ruled lines like an exercise book
    ctx.strokeStyle = col.line; ctx.lineWidth = 1;
    for (let y = 48; y < h; y += 48) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke(); }
    ctx.strokeStyle = col.ink; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const s of strokes) drawStroke(ctx, s, w, h);
    if (live.current) drawStroke(ctx, live.current, w, h);
  }, [size, strokes]);
  useEffect(redraw, [redraw]);

  const norm = (e: { clientX: number; clientY: number }): Pt => {
    const r = canvas.current!.getBoundingClientRect();
    const x = Math.min(1000, Math.max(0, ((e.clientX - r.left) / r.width) * 1000));
    const y = Math.min(1000, Math.max(0, ((e.clientY - r.top) / r.height) * 1000));
    return [x, y];
  };
  const down = (e: RPointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    live.current = [norm(e)];
  };
  const move = (e: RPointerEvent<HTMLCanvasElement>) => {
    const pts = live.current;
    if (!pts) return;
    const evs = typeof e.nativeEvent.getCoalescedEvents === 'function' ? e.nativeEvent.getCoalescedEvents() : [];
    const list = evs.length ? evs : [e.nativeEvent];
    const c = canvas.current, ctx = c?.getContext('2d');
    const { w, h } = size;
    for (const ev of list) {
      const p = norm(ev);
      const last = pts[pts.length - 1];
      if (Math.abs(p[0] - last[0]) + Math.abs(p[1] - last[1]) < 2) continue; // skip tiny moves (smaller notes)
      pts.push(p);
      if (ctx) { // draw the new segment only (fast)
        const col = colors();
        ctx.strokeStyle = col.ink; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        drawStroke(ctx, [last, p], w, h);
      }
    }
  };
  const up = () => {
    const pts = live.current;
    live.current = null;
    if (pts && pts.length > 1) onStroke(encodeStroke(pts));
    else redraw();
  };

  return (
    <div className="ink-pad" ref={wrap}>
      <canvas ref={canvas} role="img" aria-label={`Handwriting page. Draw with a finger, stylus or mouse. ${ink.length} pen strokes.`}
        style={{ width: '100%', height: '100%' }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={() => { if (live.current) up(); }} />
    </div>
  );
}
