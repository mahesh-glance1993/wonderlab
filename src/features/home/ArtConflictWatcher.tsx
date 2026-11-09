import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useApp } from '../../lib/app';
import { deleteArtDraft } from '../../lib/sync';
import { Button, Modal, toast } from '../../ui/kit';

/** When two devices changed the same artwork offline, both are kept; the learner picks one. */
export function ArtConflictWatcher() {
  const { profile } = useApp();
  const nav = useNavigate();
  const [c, setC] = useState<{ pid: string; originalId: string; copyId: string } | null>(null);
  useEffect(() => {
    const on = (e: Event) => setC((e as CustomEvent).detail);
    window.addEventListener('wl-art-conflict', on);
    return () => window.removeEventListener('wl-art-conflict', on);
  }, []);
  if (!c || !profile || profile.id !== c.pid) return null;
  const resolve = async (keep: 'original' | 'copy') => {
    await api(`/p/${c.pid}/artworks/${c.copyId}/resolve`, { body: { keep } });
    await deleteArtDraft(c.pid, c.copyId);
    await deleteArtDraft(c.pid, c.originalId);
    toast('Done — your gallery is up to date.');
    setC(null);
  };
  return (
    <Modal title="This picture changed on two devices" onClose={() => setC(null)}>
      <p>Both versions are safe in your gallery. Which one do you want to keep?</p>
      <div className="row">
        <Button onClick={() => nav(`/art/paint/${c.originalId}`)}>See the other device's version</Button>
        <Button onClick={() => nav(`/art/paint/${c.copyId}`)}>See this device's version</Button>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <Button variant="primary" onClick={() => void resolve('copy')}>Keep this device's</Button>
        <Button onClick={() => void resolve('original')}>Keep the other one</Button>
        <Button variant="ghost" onClick={() => setC(null)}>Keep both for now</Button>
      </div>
    </Modal>
  );
}
