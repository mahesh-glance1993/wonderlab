import { useEffect, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { Button, Page } from '../../ui/kit';
import { sheetById, guidePolys } from './tracing/guides';
import { GuideSvg } from './tracing/GuideSvg';
import { pageById, pageUrl } from './coloring/pages';
import { renderArtwork } from './paint/artFile';

/** Printable sheets: /art/print/trace/:sheetId[?i=n], /art/print/color/:pageId, /art/print/art/:artworkId */
export default function Print() {
  const { kind, id } = useParams();
  const [sp] = useSearchParams();
  const { profile } = useApp();
  const [ready, setReady] = useState(false);
  const [art, setArt] = useState<{ url: string; title: string } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let off = false;
    if (kind === 'art' && id && profile) {
      renderArtwork(profile.id, id)
        .then((r) => { if (off) return; if (r) { setArt({ url: r.canvas.toDataURL('image/png'), title: r.title }); setReady(true); } else setFailed(true); })
        .catch(() => { if (!off) setFailed(true); });
    } else setReady(true);
    return () => { off = true; };
  }, [kind, id, profile]);
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => window.print(), 500);
    return () => window.clearTimeout(t);
  }, [ready]);

  let body: React.ReactNode = null;
  let title = 'Print';
  if (kind === 'trace') {
    const sheet = id ? sheetById(id) : undefined;
    if (!sheet) return <Navigate to="/art/trace" replace />;
    const i = sp.get('i');
    const guides = i !== null && sheet.guides[Number(i)] ? [sheet.guides[Number(i)]] : sheet.guides;
    title = `${sheet.title} — tracing sheet`;
    const perPage = guides.length === 1 ? 1 : 4;
    const pages: (typeof guides)[] = [];
    for (let k = 0; k < guides.length; k += perPage) pages.push(guides.slice(k, k + perPage));
    body = pages.map((pg, pi) => (
      <section key={pi} className="print-sheet print-page">
        <div className="print-name">Name: ______________________ <span>{sheet.title}</span></div>
        {pg.map((g) => {
          const polys = guidePolys(g);
          const rows = guides.length === 1 ? 4 : 1;
          return (
            <div key={g.id} className="print-trace">
              {Array.from({ length: rows }, (_, r) => (
                <div key={r} className="print-trace-row">
                  <GuideSvg guide={g} polys={polys} tol={5} guidance={r === 0} mode={r === 0 ? 'print-model' : 'print-dotted'} />
                  <GuideSvg guide={g} polys={polys} tol={5} guidance={false} mode="print-dotted" />
                  <GuideSvg guide={g} polys={polys} tol={5} guidance={false} mode="print-dotted" />
                  <GuideSvg guide={g} polys={polys} tol={5} guidance={false} mode="print-dotted" />
                </div>
              ))}
            </div>
          );
        })}
      </section>
    ));
  } else if (kind === 'color') {
    const p = id ? pageById(id) : undefined;
    if (!p) return <Navigate to="/art/color" replace />;
    title = `${p.title} — colouring page`;
    body = (
      <section className="print-sheet print-page print-color">
        <div className="print-name">Name: ______________________ <span>{p.title}</span></div>
        <img src={pageUrl(p)} alt={`${p.title} outline to colour`} />
      </section>
    );
  } else if (kind === 'art') {
    title = art?.title || 'My picture';
    body = failed ? <div className="alert error">This picture could not be found.</div> : art ? (
      <section className="print-sheet print-page print-color"><img src={art.url} alt={art.title} /><p className="center">{art.title}</p></section>
    ) : <p className="muted" role="status">Getting your picture ready…</p>;
  } else return <Navigate to="/art" replace />;

  return (
    <Page title={title} back={kind === 'trace' ? `/art/trace/${id}` : kind === 'color' ? '/art/color' : '/art/gallery'}>
      <div className="no-print row" style={{ marginBottom: 12 }}>
        <Button variant="primary" icon="print" disabled={!ready} onClick={() => window.print()}>Print</Button>
        <span className="muted">Tip: choose “Fit to page” in the print settings.</span>
      </div>
      <div className="print-root">{body}</div>
    </Page>
  );
}
