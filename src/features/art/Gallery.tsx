import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { Button, IconButton, Modal, Page, toast } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { duplicateArtwork, fetchGallery, removeArtwork, renameArtwork, type GalleryItem } from './storage';
import { downloadCanvas, renderArtwork } from './paint/artFile';
import { RenameDialog } from './paint/RenameDialog';

/** Private gallery for the active learner profile. */
export default function Gallery() {
  const { profile, presentation } = useApp();
  const pid = profile!.id;
  const nav = useNavigate();
  const allowTyping = presentation?.allowTyping !== false;
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [offline, setOffline] = useState(false);
  const [confirm, setConfirm] = useState<GalleryItem | null>(null);
  const [rename, setRename] = useState<GalleryItem | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetchGallery(pid);
    setItems(r.items);
    setOffline(r.offline);
  }, [pid]);
  useEffect(() => { void load(); }, [load]);

  const act = async (id: string, fn: () => Promise<unknown>) => { setBusy(id); try { await fn(); } catch { toast('Sorry, that did not work. Try again.'); } finally { setBusy(null); } };

  return (
    <Page title="My Gallery" back="/art">
      <div className="page-head"><h1>My Gallery</h1><span className="spacer" /><Link className="btn primary" to="/art/paint"><Icon name="plus" />New painting</Link></div>
      <p className="muted"><Icon name="lock" /> Only you (and your grown-ups) can see these pictures.</p>
      {offline && <div className="alert warn" style={{ marginBottom: 12 }}><Icon name="wifiOff" />Offline — showing pictures saved on this device.</div>}
      {items === null && <p className="muted" role="status">Loading…</p>}
      {items && !items.length && (
        <div className="card center stack" style={{ alignItems: 'center' }}>
          <Icon name="image" size="lg" />
          <p>No pictures yet. Let's make one!</p>
          <div className="row"><Link className="btn" to="/art/paint"><Icon name="brush" />Paint</Link><Link className="btn" to="/art/color"><Icon name="palette" />Colour</Link></div>
        </div>
      )}
      <ul className="grid art-gallery" aria-label="Pictures">
        {items?.map((it) => (
          <li key={it.id} className="card art-gal-item" aria-busy={busy === it.id}>
            <Link to={`/art/paint/${it.id}`} className="art-gal-open" aria-label={`Open ${it.title}`}>
              {it.thumb ? <img src={it.thumb} alt="" /> : <span className="art-gal-empty"><Icon name="image" size="lg" /></span>}
            </Link>
            <div className="art-gal-meta">
              <b>{it.title}</b>
              <small className="muted">{new Date(it.updatedAt).toLocaleDateString()}</small>
              {it.unsynced && <span className="pill"><Icon name="cloud" />On this device — will upload</span>}
              {it.conflictOf && <span className="pill"><Icon name="copy" />Copy from another device</span>}
            </div>
            <div className="row art-gal-actions" style={{ gap: 4 }}>
              <IconButton className="small" icon="brush" label={`Open ${it.title}`} onClick={() => nav(`/art/paint/${it.id}`)} />
              <IconButton className="small" icon="copy" label={`Duplicate ${it.title}`} onClick={() => void act(it.id, async () => { const nid = await duplicateArtwork(pid, it.id); if (nid) { toast('Copy made'); await load(); } })} />
              {allowTyping && <IconButton className="small" icon="edit" label={`Rename ${it.title}`} onClick={() => setRename(it)} />}
              <IconButton className="small" icon="download" label={`Save ${it.title} as PNG`} onClick={() => void act(it.id, async () => { const r = await renderArtwork(pid, it.id); if (r) downloadCanvas(r.canvas, r.title); })} />
              <IconButton className="small" icon="print" label={`Print ${it.title}`} onClick={() => nav(`/art/print/art/${it.id}`)} />
              <IconButton className="small danger" icon="trash" label={`Delete ${it.title}`} onClick={() => setConfirm(it)} />
            </div>
          </li>
        ))}
      </ul>
      {confirm && (
        <Modal title="Delete this picture?" onClose={() => setConfirm(null)}>
          <p>“{confirm.title}” will be deleted from your gallery on all devices. This cannot be undone.</p>
          <div className="row">
            <Button variant="danger" icon="trash" onClick={() => { const it = confirm; setConfirm(null); void act(it.id, async () => { await removeArtwork(pid, it.id); setItems((x) => x?.filter((i) => i.id !== it.id) || null); toast('Picture deleted'); }); }}>Delete</Button>
            <Button onClick={() => setConfirm(null)}>Keep it</Button>
          </div>
        </Modal>
      )}
      {rename && <RenameDialog title={rename.title} onClose={() => setRename(null)} onSave={(t) => { const it = rename; setRename(null); void act(it.id, async () => { await renameArtwork(pid, it.id, t); await load(); }); }} />}
    </Page>
  );
}
