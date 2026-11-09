// Offline packs: parents choose what to download per learner; size + progress shown; removable.
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { idb } from '../../lib/idb';
import { useApp } from '../../lib/app';
import { Page, Button, Meter, toast } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { PACKS, type PackDef } from '../../shared/packs';
import { CLASSES } from '../../shared/levels';
import { ParentGate } from '../parent/ParentGate';

interface Built { id: string; files: string[]; bytes: number }
const fmt = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
const CACHE = (acct: string) => `wl-packs-${acct}`;

export default function Downloads() {
  const { profile, account, learner, online } = useApp();
  const [built, setBuilt] = useState<Record<string, Built>>({});
  const [busy, setBusy] = useState<Record<string, number>>({});
  const [have, setHave] = useState<Record<string, boolean>>({});
  const [usage, setUsage] = useState<{ usage?: number; quota?: number }>({});
  useEffect(() => {
    fetch('/packs.json').then((r) => (r.ok ? r.json() : { packs: [] })).then((j: { packs: Built[] }) => setBuilt(Object.fromEntries(j.packs.map((p) => [p.id, p])))).catch(() => undefined);
    void idb.estimate().then(setUsage);
  }, []);
  useEffect(() => {
    (async () => {
      const ids = await idb.keys(`dl:${account!.id}:${profile!.id}:`);
      setHave(Object.fromEntries(ids.map((k) => [k.split(':').pop()!, true])));
    })();
  }, [account, profile, learner.downloads]);
  const packs = PACKS.filter((p) => p.classLevels.includes(profile!.classLevel) || p.kind === 'lessons');
  const download = async (p: PackDef) => {
    const b = built[p.id];
    if (!b) { toast('Download info is not available in development mode. Build the app to test downloads.'); return; }
    const cache = await caches.open(CACHE(account!.id));
    let done = 0;
    for (const f of b.files) {
      try { const r = await fetch(f, { cache: 'reload' }); if (r.ok) await cache.put(f, r); } catch { /* skip missing optional files */ }
      done++; setBusy((x) => ({ ...x, [p.id]: done / b.files.length }));
    }
    await idb.set(`dl:${account!.id}:${profile!.id}:${p.id}`, { version: b.files.join('|').length, at: Date.now() });
    await api(`/p/${profile!.id}/downloads/${p.id}`, { method: 'PUT', body: { version: String(b.bytes) } }).catch(() => undefined);
    setBusy((x) => { const y = { ...x }; delete y[p.id]; return y; });
    setHave((h) => ({ ...h, [p.id]: true }));
    void idb.estimate().then(setUsage);
    toast(`${p.title} is ready offline`);
  };
  const remove = async (p: PackDef) => {
    await idb.del(`dl:${account!.id}:${profile!.id}:${p.id}`);
    // remove cached files only if no other learner on this device still uses the pack
    const others = (await idb.keys(`dl:${account!.id}:`)).filter((k) => k.endsWith(`:${p.id}`));
    if (!others.length && built[p.id]) { const cache = await caches.open(CACHE(account!.id)); await Promise.all(built[p.id].files.map((f) => cache.delete(f))); }
    await api(`/p/${profile!.id}/downloads/${p.id}`, { method: 'DELETE' }).catch(() => undefined);
    setHave((h) => ({ ...h, [p.id]: false }));
    void idb.estimate().then(setUsage);
  };
  return (
    <Page title="Downloads">
      <ParentGate reason="Downloading and removing packs is done by a parent.">
        <div className="page-head"><h1>Offline packs for {profile!.nickname}</h1></div>
        <p className="muted">Downloaded packs work without internet on this device. Progress and artwork made offline are saved here and sync when you reconnect. First-time sign-in, recovery and account changes need internet.</p>
        {usage.quota ? <p className="muted small">Storage used on this device: {fmt(usage.usage || 0)} of {fmt(usage.quota)}</p> : null}
        {!online && <div className="alert warn"><Icon name="wifiOff" />You're offline. Already-downloaded packs still work.</div>}
        <div className="stack">
          {packs.map((p) => (
            <div key={p.id} className="card flat row">
              <Icon name={p.kind === 'lessons' ? 'book' : p.kind === 'games' ? 'puzzle' : p.kind === 'lab' ? 'atom' : p.kind === 'narration' ? 'speaker' : 'palette'} />
              <span style={{ flex: 1, minWidth: 180 }}><b>{p.title}</b><br /><small className="muted">{p.kind === 'lessons' ? CLASSES[p.classLevels[0]].label : p.classLevels.length > 10 ? 'All classes' : `${CLASSES[p.classLevels[0]].label}–${CLASSES[p.classLevels[p.classLevels.length - 1]].label}`} · {built[p.id] ? fmt(built[p.id].bytes) : 'size after build'}</small></span>
              {busy[p.id] !== undefined ? <span style={{ width: 160 }}><Meter value={busy[p.id]} label={`Downloading ${p.title}`} /></span>
                : have[p.id] ? <><span className="status mastered"><Icon name="check" />Available offline</span><Button small variant="danger" icon="trash" onClick={() => void remove(p)}>Remove</Button></>
                : <Button small icon="download" disabled={!online} onClick={() => void download(p)}>Download</Button>}
            </div>
          ))}
        </div>
      </ParentGate>
    </Page>
  );
}
