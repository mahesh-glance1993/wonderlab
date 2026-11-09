import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useApp } from '../../../lib/app';
import { Button, Page, Segmented } from '../../../ui/kit';
import { Icon } from '../../../ui/Icon';
import { CATEGORIES, PAGES, pageById, pageUrl, type PageCategory } from './pages';

/** Colouring page picker. */
export default function ColorHome() {
  const { presentation, lang } = useApp();
  const early = presentation?.tier === 'early';
  const [cat, setCat] = useState<PageCategory | 'all'>('all');
  const [showAll, setShowAll] = useState(!early);
  const pages = useMemo(() => PAGES
    .filter((p) => cat === 'all' || p.category === cat)
    .filter((p) => showAll || p.level === 'easy')
    .sort((a, b) => (a.level === b.level ? 0 : a.level === 'easy' ? -1 : 1)), [cat, showAll]);
  return (
    <Page title={lang === 'te' ? 'రంగులు వేయి' : 'Colouring'} back="/art">
      <div className="page-head"><h1>Pick a picture to colour</h1></div>
      <div className="row" style={{ marginBottom: 14 }}>
        <Segmented label="Category" value={cat} onChange={setCat} options={[{ value: 'all' as const, label: 'All' }, ...CATEGORIES.map((c) => ({ value: c.id, label: lang === 'te' ? c.labelTe : c.label }))]} />
        {early && <Button small variant="ghost" aria-pressed={showAll} onClick={() => setShowAll(!showAll)}>{showAll ? 'Only easy pictures' : 'Show detailed pictures too'}</Button>}
      </div>
      <div className="grid art-pages">
        {pages.map((p) => (
          <div key={p.id} className="card art-page-card">
            <Link to={`/art/color/${p.id}`} className="art-page-link" aria-label={`Colour ${p.title}`}>
              <img src={pageUrl(p)} alt="" loading="lazy" />
              <b>{lang === 'te' ? p.titleTe : p.title}</b>
            </Link>
            <div className="row" style={{ gap: 6 }}>
              <span className="pill">{p.level === 'easy' ? 'Easy' : 'Detailed'}</span>
              <span className="spacer" />
              <Link className="btn small ghost" to={`/art/print/color/${p.id}`} aria-label={`Print ${p.title}`}><Icon name="print" /></Link>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

/** /art/color/:pageId → a new colouring project with that page as its locked outline layer. */
export function StartColoring() {
  const { pageId } = useParams();
  const [id] = useState(() => crypto.randomUUID());
  if (!pageId || !pageById(pageId)) return <Navigate to="/art/color" replace />;
  return <Navigate to={`/art/paint/${id}?page=${encodeURIComponent(pageId)}&size=large`} replace />;
}
