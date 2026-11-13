// Art Studio: tracing, colouring, painting and a private gallery. Mounted at /art/*.
import { lazy, Suspense, useEffect } from 'react';
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { Page } from '../../ui/kit';
import { Icon, type IconName } from '../../ui/Icon';
import './art.css';

const Studio = lazy(() => import('./paint/Studio'));
const NewCanvas = lazy(() => import('./paint/NewCanvas'));
const ColorHome = lazy(() => import('./coloring/ColorHome'));
const StartColoring = lazy(() => import('./coloring/ColorHome').then((m) => ({ default: m.StartColoring })));
const TraceHome = lazy(() => import('./tracing/TraceHome'));
const Trace = lazy(() => import('./tracing/Trace'));
const Gallery = lazy(() => import('./Gallery'));
const Print = lazy(() => import('./Print'));

function Loading() { return <div className="center muted" style={{ padding: 40 }} role="status">Loading…</div>; }

function StudioHome() {
  const { lang, presentation, speak, profile } = useApp();
  const te = lang === 'te';
  const level = profile?.classLevel ?? 3;
  // age-appropriate (same as the apps): Colour up to Class 5, Trace up to Class 3; older learners get a "Sketchbook"
  const all: { to: string; icon: IconName; label: string; desc: string; maxLevel?: number }[] = [
    level >= 8
      ? { to: '/art/paint', icon: 'brush', label: 'Sketchbook', desc: 'Draw diagrams, maps and ideas' }
      : { to: '/art/paint', icon: 'brush', label: te ? 'పెయింట్' : 'Paint', desc: te ? 'ఖాళీ కాగితంపై గీయి' : 'Pencils, crayons, watercolour and more' },
    { to: '/art/color', icon: 'bucket', label: te ? 'రంగులు వేయి' : 'Colour', desc: te ? 'బొమ్మలకు రంగులు' : 'Animals, vehicles, patterns, science', maxLevel: 7 },
    { to: '/art/trace', icon: 'edit', label: te ? 'దిద్దు' : 'Trace', desc: te ? 'గీతలు, అంకెలు, అక్షరాలు' : 'Lines, shapes, numbers and letters', maxLevel: 5 },
    { to: '/art/gallery', icon: 'image', label: te ? 'నా గ్యాలరీ' : 'My Gallery', desc: te ? 'నీ బొమ్మలు' : 'Your saved pictures' },
  ];
  const tiles = all.filter((x) => x.maxLevel === undefined || level <= x.maxLevel);
  useEffect(() => {
    if (presentation?.readAloud) speak(level <= 5 ? 'Art Studio. Paint, colour, trace, or see your gallery.' : 'Art Studio. Paint, colour, or see your gallery.', { te: 'ఆర్ట్ స్టూడియో. పెయింట్, రంగులు, దిద్దడం.' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Page title={te ? 'ఆర్ట్ స్టూడియో' : 'Art Studio'} back="/">
      <div className="page-head"><h1>{te ? 'ఆర్ట్ స్టూడియో' : 'Art Studio'}</h1></div>
      <div className="grid art-home">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="tile art-tile">
            <span className="tile-icon"><Icon name={t.icon} size="lg" /></span>
            <b>{t.label}</b>
            <small>{t.desc}</small>
          </Link>
        ))}
      </div>
    </Page>
  );
}

/** Remount the studio when the artwork id changes so each picture gets a fresh editor. */
function StudioRoute() {
  const { id } = useParams();
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return <Navigate to="/art/paint" replace />;
  return <Studio key={id} />;
}

export default function ArtStudio() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route index element={<StudioHome />} />
        <Route path="paint" element={<NewCanvas />} />
        <Route path="paint/:id" element={<StudioRoute />} />
        <Route path="color" element={<ColorHome />} />
        <Route path="color/:pageId" element={<StartColoring />} />
        <Route path="trace" element={<TraceHome />} />
        <Route path="trace/:sheetId" element={<Trace />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="print/:kind/:id" element={<Print />} />
        <Route path="*" element={<Navigate to="/art" replace />} />
      </Routes>
    </Suspense>
  );
}
