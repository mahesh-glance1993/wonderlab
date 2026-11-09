// Artwork persistence for the private gallery: local drafts (IndexedDB, via lib/sync) merged with
// the server list. Saving always goes through saveArtDraft so work is kept offline and synced.
import { api, ApiError } from '../../lib/api';
import { deleteArtDraft, getArtDraft, listArtDrafts, saveArtDraft, type ArtDraft } from '../../lib/sync';
import type { Project } from './engine/project';

export interface ServerArt { id: string; title: string; thumb?: string; version: number; conflictOf?: string | null; createdAt?: number; updatedAt: number }
export interface GalleryItem { id: string; title: string; thumb?: string; updatedAt: number; unsynced: boolean; conflictOf?: string | null; kind?: string }

/**
 * Merge the server list with local drafts. A local draft wins when it has unsynced changes or is
 * newer. Clean local drafts missing from a fresh server list were deleted elsewhere → dropped.
 */
export function mergeGallery(server: ServerArt[] | null, local: ArtDraft[], hidden: string[] = []): { items: GalleryItem[]; staleLocal: string[] } {
  const map = new Map<string, GalleryItem>();
  const staleLocal: string[] = [];
  for (const s of server || []) map.set(s.id, { id: s.id, title: s.title, thumb: s.thumb, updatedAt: s.updatedAt * 1000, unsynced: false, conflictOf: s.conflictOf });
  for (const d of local) {
    const s = map.get(d.id);
    const kind = (d.data as Partial<Project> | undefined)?.meta?.kind;
    if (s) {
      if (d.dirty || d.updatedAt > s.updatedAt) map.set(d.id, { ...s, title: d.title, thumb: d.thumb || s.thumb, updatedAt: Math.max(d.updatedAt, s.updatedAt), unsynced: d.dirty, kind });
      else map.set(d.id, { ...s, kind });
    } else if (d.dirty || server === null) {
      map.set(d.id, { id: d.id, title: d.title, thumb: d.thumb, updatedAt: d.updatedAt, unsynced: d.dirty, conflictOf: d.conflictOf, kind });
    } else staleLocal.push(d.id);
  }
  const items = [...map.values()].filter((i) => !hidden.includes(i.id)).sort((a, b) => b.updatedAt - a.updatedAt);
  return { items, staleLocal };
}

// Deletions made offline: remember ids (only ids) and retry when online.
const hiddenKey = (pid: string) => `wl.art.deleted.${pid}`;
const getHidden = (pid: string): string[] => { try { return JSON.parse(localStorage.getItem(hiddenKey(pid)) || '[]'); } catch { return []; } };
const setHidden = (pid: string, ids: string[]) => { try { if (ids.length) localStorage.setItem(hiddenKey(pid), JSON.stringify(ids.slice(-200))); else localStorage.removeItem(hiddenKey(pid)); } catch { /* storage full/blocked */ } };

export async function fetchGallery(pid: string): Promise<{ items: GalleryItem[]; offline: boolean }> {
  let server: ServerArt[] | null = null;
  let offline = false;
  // retry pending deletions first
  const hidden = getHidden(pid);
  if (hidden.length) {
    const still: string[] = [];
    for (const id of hidden) { try { await api(`/p/${pid}/artworks/${id}`, { method: 'DELETE' }); } catch { still.push(id); } }
    setHidden(pid, still);
  }
  try { server = (await api<{ artworks: ServerArt[] }>(`/p/${pid}/artworks`)).artworks; }
  catch (e) { offline = e instanceof ApiError && e.status === 0; }
  const local = await listArtDrafts(pid).catch(() => [] as ArtDraft[]);
  const { items, staleLocal } = mergeGallery(server, local, getHidden(pid));
  for (const id of staleLocal) void deleteArtDraft(pid, id);
  return { items, offline };
}

export interface LoadedArt { id: string; title: string; data: unknown; baseVersion: number; thumb?: string }
/** Local unsynced draft first; otherwise the newest of server and local. */
export async function loadArtwork(pid: string, id: string): Promise<LoadedArt | null> {
  const local = await getArtDraft(pid, id).catch(() => undefined);
  if (local?.dirty) return { id, title: local.title, data: local.data, baseVersion: local.baseVersion, thumb: local.thumb };
  try {
    const r = await api<{ artwork: { id: string; title: string; data: unknown; thumb?: string; version: number } }>(`/p/${pid}/artworks/${id}`);
    if (!local || r.artwork.version >= local.baseVersion) return { id, title: r.artwork.title, data: r.artwork.data, baseVersion: r.artwork.version, thumb: r.artwork.thumb };
  } catch { /* offline or missing on server */ }
  return local ? { id, title: local.title, data: local.data, baseVersion: local.baseVersion, thumb: local.thumb } : null;
}

/** Save via the offline-first draft store. baseVersion comes from the stored draft when present
 *  (sync updates it after each upload), else from what we loaded. */
export async function storeArtwork(pid: string, a: { id: string; title: string; data: unknown; thumb?: string }, fallbackBase: number) {
  const cur = await getArtDraft(pid, a.id).catch(() => undefined);
  const d: ArtDraft = { id: a.id, title: a.title, data: a.data, thumb: a.thumb, baseVersion: cur?.baseVersion ?? fallbackBase, dirty: true, updatedAt: Date.now() };
  await saveArtDraft(pid, d);
}

export async function removeArtwork(pid: string, id: string) {
  await deleteArtDraft(pid, id).catch(() => undefined);
  try { await api(`/p/${pid}/artworks/${id}`, { method: 'DELETE' }); }
  catch (e) {
    if (e instanceof ApiError && e.status === 404) return;
    setHidden(pid, [...getHidden(pid), id]); // retried next time the gallery opens
  }
}

export async function duplicateArtwork(pid: string, id: string): Promise<string | null> {
  const a = await loadArtwork(pid, id);
  if (!a) return null;
  const nid = crypto.randomUUID();
  await storeArtwork(pid, { id: nid, title: `${a.title} (copy)`.slice(0, 60), data: a.data, thumb: a.thumb }, 0);
  return nid;
}
export async function renameArtwork(pid: string, id: string, title: string) {
  const a = await loadArtwork(pid, id);
  if (!a) return false;
  await storeArtwork(pid, { id, title: title.slice(0, 60), data: a.data, thumb: a.thumb }, a.baseVersion);
  return true;
}
