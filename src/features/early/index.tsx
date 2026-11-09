// Play & Learn (Nursery / LKG / UKG): mounted at /play/*.
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { Page } from '../../ui/kit';
import { BigTile, Prompt, UI, useLastActivity, useTx } from './common';
import PictureFun from './PictureFun';
import { StoryList, StoryReader } from './StoryTime';
import ShapePlay from './ShapePlay';
import SortMatch from './SortMatch';
import BuildIt from './BuildIt';
import { L } from './data/pictures';
import './early.css';

const TILES = [
  { to: '/play/pictures', title: UI.pictures, art: 'mango', tint: 'var(--c-art)' },
  { to: '/play/stories', title: UI.stories, art: 'crow', tint: 'var(--c-math)' },
  { to: '/play/shapes', title: UI.shapes, art: 'shape-star', tint: 'var(--c-lab)' },
  { to: '/play/sort', title: UI.sort, art: 'box', tint: 'var(--c-next)' },
  { to: '/play/build', title: UI.build, art: 'tractor', tint: 'var(--c-art)' },
];

function Menu() {
  const { tx } = useTx();
  const nav = useNavigate();
  useLastActivity('/play', UI.playLearn);
  return (
    <Page title={tx(UI.playLearn)} back="/" fullscreen>
      <Prompt l={L('What shall we play?', 'ఏ ఆట ఆడదాం?')} />
      <div className="el-grid el-grid-4 el-menu">
        {TILES.map((t) => <BigTile key={t.to} art={t.art} title={t.title} tint={t.tint} onGo={() => nav(t.to)} />)}
      </div>
    </Page>
  );
}

export default function Early() {
  return (
    <Routes>
      <Route index element={<Menu />} />
      <Route path="pictures" element={<PictureFun />} />
      <Route path="stories" element={<StoryList />} />
      <Route path="stories/:storyId" element={<StoryReader />} />
      <Route path="shapes" element={<ShapePlay />} />
      <Route path="sort" element={<SortMatch />} />
      <Route path="build" element={<BuildIt />} />
      <Route path="*" element={<Navigate to="/play" replace />} />
    </Routes>
  );
}
