import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './lib/app';
import { Toasts } from './ui/kit';
import { BreakReminder } from './features/home/BreakReminder';
import { ArtConflictWatcher } from './features/home/ArtConflictWatcher';
import { FullscreenKeeper } from './features/home/FullscreenKeeper';
import { OfflineBar } from './features/downloads/OfflineBar';
import { clearRepeat } from './lib/audio';
import { RouteErrorBoundary } from './ui/ErrorBoundary';

const Auth = lazy(() => import('./features/auth'));
const Home = lazy(() => import('./features/home/Home'));
const Picker = lazy(() => import('./features/home/ProfilePicker'));
const Setup = lazy(() => import('./features/parent/Setup'));
const Parent = lazy(() => import('./features/parent'));
const Curriculum = lazy(() => import('./features/home/Curriculum'));
const Next = lazy(() => import('./features/home/Next'));
const Lesson = lazy(() => import('./features/lesson'));
const Lab = lazy(() => import('./features/lab'));
const Art = lazy(() => import('./features/art'));
const Games = lazy(() => import('./features/games'));
const Play = lazy(() => import('./features/early'));
const Language = lazy(() => import('./features/language'));
const Progress = lazy(() => import('./features/progress'));
const Downloads = lazy(() => import('./features/downloads'));
const Editor = lazy(() => import('./features/editor'));

function Loading() {
  return <div className="center muted" style={{ padding: 40 }} role="status">Loading…</div>;
}

/** Route guards: signed in → has profiles → learner chosen. */
function NeedAccount({ children }: { children: ReactNode }) {
  const { ready, account } = useApp();
  const loc = useLocation();
  if (!ready) return <Loading />;
  if (!account) return <Navigate to={`/signin?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return <>{children}</>;
}
function NeedLearner({ children }: { children: ReactNode }) {
  const { ready, account, profiles, profile } = useApp();
  const loc = useLocation();
  if (!ready) return <Loading />;
  if (!account) return <Navigate to={`/signin?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  if (!profiles.length) return <Navigate to="/setup" replace />;
  if (!profile) return <Navigate to={`/who?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return <>{children}</>;
}
function NeedEducator({ children }: { children: ReactNode }) {
  const { ready, account } = useApp();
  if (!ready) return <Loading />;
  if (!account) return <Navigate to="/signin?next=/editor" replace />;
  if (account.role !== 'educator' && account.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RouteFocus() {
  // Move focus to main content after navigation for screen-reader users.
  const loc = useLocation();
  useEffect(() => { clearRepeat(); requestAnimationFrame(() => document.getElementById('main')?.focus({ preventScroll: true })); }, [loc.pathname]);
  return null;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <a href="#main" className="skip-link">Skip to content</a>
        <RouteFocus />
        <div className="app">
          <RouteErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/signin" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/forgot/*" element={<Auth />} />
              <Route path="/reset" element={<Auth />} />
              <Route path="/verify-email" element={<Auth />} />
              <Route path="/setup" element={<NeedAccount><Setup /></NeedAccount>} />
              <Route path="/who" element={<NeedAccount><Picker /></NeedAccount>} />
              <Route path="/parent/*" element={<NeedAccount><Parent /></NeedAccount>} />
              <Route path="/editor/*" element={<NeedEducator><Editor /></NeedEducator>} />
              <Route path="/" element={<NeedLearner><Home /></NeedLearner>} />
              <Route path="/learn" element={<NeedLearner><Curriculum /></NeedLearner>} />
              <Route path="/next" element={<NeedLearner><Next /></NeedLearner>} />
              <Route path="/lesson/*" element={<NeedLearner><Lesson /></NeedLearner>} />
              <Route path="/lab/*" element={<NeedLearner><Lab /></NeedLearner>} />
              <Route path="/art/*" element={<NeedLearner><Art /></NeedLearner>} />
              <Route path="/games/*" element={<NeedLearner><Games /></NeedLearner>} />
              <Route path="/play/*" element={<NeedLearner><Play /></NeedLearner>} />
              <Route path="/lang/*" element={<NeedLearner><Language /></NeedLearner>} />
              <Route path="/progress" element={<NeedLearner><Progress /></NeedLearner>} />
              <Route path="/downloads" element={<NeedLearner><Downloads /></NeedLearner>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          </RouteErrorBoundary>
        </div>
        <BreakReminder />
        <ArtConflictWatcher />
        <FullscreenKeeper />
        <OfflineBar />
        <Toasts />
      </BrowserRouter>
    </AppProvider>
  );
}
