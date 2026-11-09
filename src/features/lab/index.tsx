// Physics Lab: index of simulations + one route per simulation. Mounted at /lab/*.
import { lazy, Suspense } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { Page } from '../../ui/kit';
import { Icon, type IconName } from '../../ui/Icon';
import { useApp } from '../../lib/app';
import { useTier } from './hooks';
import './lab.css';

const MotionLab = lazy(() => import('./MotionLab'));
const ForcesLab = lazy(() => import('./ForcesLab'));
const CircuitLab = lazy(() => import('./CircuitLab'));
const LightLab = lazy(() => import('./LightLab'));

const LABS: { id: 'motion' | 'forces' | 'circuit' | 'light'; title: string; icon: IconName; desc: string; descSimple: string; classes: string }[] = [
  { id: 'motion', title: 'Motion Lab', icon: 'clock', desc: 'Speed, acceleration and braking, with live position–time and velocity–time graphs.', descSimple: 'Make a car speed up, slow down and stop at a flag.', classes: 'Classes 5–10 (graphs and equations for 7–10)' },
  { id: 'forces', title: 'Forces Lab', icon: 'scale', desc: 'Push a box against friction and discover F = ma.', descSimple: 'Push a box on ice, wood and carpet — will it move?', classes: 'Classes 4–10 (F = ma for 8–10)' },
  { id: 'circuit', title: 'Circuit Lab', icon: 'bulb', desc: 'Build series circuits from cells, a switch and bulbs; measure V, I and R.', descSimple: 'Light up bulbs and find out why a circuit stops working.', classes: 'Classes 3–10 (Ohm’s law for 7–10)' },
  { id: 'light', title: 'Light Lab', icon: 'sun', desc: 'Reflect a ray off a plane mirror and measure the angles from the normal.', descSimple: 'Bounce torchlight off a mirror to hit a star.', classes: 'Classes 3–10 (angle measurement for 6–10)' },
];

function LabIndex() {
  const { learner } = useApp();
  const { simple } = useTier();
  return (
    <Page title="Physics Lab" back="/" wide>
      <div className="page-head"><h1>Physics Lab</h1></div>
      <p className="muted" style={{ marginTop: 0 }}>{simple ? 'Pick an experiment. Guess what will happen, then try it!' : 'Choose a simulation. Predict, run the experiment, then explain what you saw.'}</p>
      <div className="grid lab-index">
        {LABS.map((l) => {
          const done = !!learner.rewards[`lab:${l.id}:challenge`];
          return (
            <Link key={l.id} to={`/lab/${l.id}`} className="tile lab-tile">
              <span className="tile-icon"><Icon name={l.icon} size="lg" /></span>
              <b>{l.title}</b>
              <span>{simple ? l.descSimple : l.desc}</span>
              <small>Suits {l.classes}</small>
              {done && <span className="pill"><Icon name="trophy" />Challenge done</span>}
            </Link>
          );
        })}
      </div>
    </Page>
  );
}

function Loading() {
  return <div className="center muted" style={{ padding: 40 }} role="status">Loading the lab…</div>;
}

export default function Lab() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route index element={<LabIndex />} />
        <Route path="motion" element={<MotionLab />} />
        <Route path="forces" element={<ForcesLab />} />
        <Route path="circuit" element={<CircuitLab />} />
        <Route path="light" element={<LightLab />} />
        <Route path="*" element={<Navigate to="/lab" replace />} />
      </Routes>
    </Suspense>
  );
}
