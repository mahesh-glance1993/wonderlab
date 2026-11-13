// "Picture credits" — every photograph shown to Class 1–10 learners with its title, author, licence and source
// (CC BY / CC BY-SA require this attribution), plus the Fluent Emoji 3D licence. Same list as the apps
// (android/.../core/design/PictureCredits.kt), read from public/pictures/photos/credits.json.
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../lib/app';
import { Page, TextInput } from '../../ui/kit';

interface Credit { key: string; title: string; author: string; licence: string; licenceUrl: string; source: string }

export default function Credits() {
  const { account, profile } = useApp();
  const [list, setList] = useState<Credit[] | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState('');
  useEffect(() => {
    let off = false;
    fetch('/pictures/photos/credits.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((o: Record<string, Partial<Credit>>) => {
        if (off) return;
        const s = (v: unknown) => (typeof v === 'string' ? v : '');
        setList(Object.entries(o).map(([key, v]) => ({ key, title: s(v.title), author: s(v.author), licence: s(v.licence), licenceUrl: s(v.licenceUrl), source: s(v.source) }))
          .sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase())));
      })
      .catch(() => { if (!off) setError(true); });
    return () => { off = true; };
  }, []);
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (list || []).filter((c) => !n || `${c.title} ${c.author} ${c.licence}`.toLowerCase().includes(n));
  }, [list, q]);
  return (
    <Page title="Picture credits" back={account ? '/parent' : profile ? '/' : '/signin'}>
      <div className="page-head"><h1>Picture credits</h1></div>
      <div className="stack credits" data-no-pictures>
        <p style={{ margin: 0 }}>
          Photographs (shown from Class 1 upwards) are freely licensed images from Wikimedia Commons, used under the licence named for each one.
          Photos may be cropped and resized. Follow a source link to see the original.
        </p>
        <p className="muted" style={{ margin: 0 }}>
          Pre-primary pictures and symbols: <a href="https://github.com/microsoft/fluentui-emoji" target="_blank" rel="noopener noreferrer">Microsoft Fluent Emoji 3D</a> (MIT licence).
        </p>
        {error && <div className="alert warn" role="alert">The list of picture credits could not be loaded. Check your internet connection and try again.</div>}
        {!list && !error && <p role="status" className="muted">Loading…</p>}
        {list && (
          <>
            <label className="field" style={{ maxWidth: 420 }}>
              <span>Search credits</span>
              <TextInput type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, author or licence" />
            </label>
            <p className="muted small" role="status" style={{ margin: 0 }}>{shown.length} of {list.length} photographs</p>
            <ul className="credit-list">
              {shown.map((c) => (
                <li key={c.key} className="credit card flat">
                  <img src={`/pictures/photos/${c.key}.webp`} alt="" loading="lazy" decoding="async" width={56} height={56} />
                  <div className="credit-text">
                    <b>{c.title || c.key}</b>
                    <span className="muted">by {c.author || 'Unknown'}</span>
                    <span className="row" style={{ gap: 14 }}>
                      {c.licenceUrl ? <a href={c.licenceUrl} target="_blank" rel="noopener noreferrer license">{c.licence}</a> : <span>{c.licence}</span>}
                      {c.source && <a href={c.source} target="_blank" rel="noopener noreferrer">Source<span className="sr-only"> for {c.title}</span></a>}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Page>
  );
}
