// Play & Learn (Nursery / LKG / UKG): mounted at /play/*.
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { Page } from '../../ui/kit';
import { BigTile, Prompt, UI, useLastActivity, useTx } from './common';
import PictureFun from './PictureFun';
import { StoryList, StoryReader } from './StoryTime';
import ShapePlay from './ShapePlay';
import SortMatch from './SortMatch';
import BuildIt from './BuildIt';
import MemoryMatch from './MemoryMatch';
import ColourMix from './ColourMix';
import Rhymes from './Rhymes';
import Opposites from './Opposites';
import Patterns from './Patterns';
import SoundSafari from './SoundSafari';
import DailySurprise from './DailySurprise';
import StickerBook from './StickerBook';
import { L } from './data/pictures';
import './early.css';

const TILES = [
  { to: '/play/pictures', title: UI.pictures, art: 'mango', tint: 'var(--c-art)' },
  { to: '/play/stories', title: UI.stories, art: 'crow', tint: 'var(--c-math)' },
  { to: '/play/shapes', title: UI.shapes, art: 'shape-star', tint: 'var(--c-lab)' },
  { to: '/play/sort', title: UI.sort, art: 'box', tint: 'var(--c-next)' },
  { to: '/play/build', title: UI.build, art: 'tractor', tint: 'var(--c-art)' },
  { to: '/play/daily', title: L('Daily Surprise', 'రోజూ ఆశ్చర్యం'), art: 'rainbow', tint: 'var(--c-math)' },
  { to: '/play/memory', title: L('Memory Match', 'జ్ఞాపకాల ఆట'), art: 'parrot', tint: 'var(--c-lab)' },
  { to: '/play/colours', title: L('Colour Mixing', 'రంగులు కలుపుదాం'), art: 'c-purple', tint: 'var(--c-next)' },
  { to: '/play/rhymes', title: L('Rhymes & Songs', 'పాటలు, గేయాలు'), art: 'star', tint: 'var(--c-art)' },
  { to: '/play/opposites', title: L('Opposites', 'వ్యతిరేక పదాలు'), art: 'umbrella', tint: 'var(--c-math)' },
  { to: '/play/patterns', title: L('Patterns', 'నమూనాలు'), art: 'shape-heart', tint: 'var(--c-lab)' },
  { to: '/play/safari', title: L('Sound Safari', 'శబ్దాల సఫారీ'), art: 'lion', tint: 'var(--c-next)' },
  { to: '/play/stickers', title: L('Sticker Book', 'స్టిక్కర్ పుస్తకం'), art: 'flower', tint: 'var(--c-art)' },
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
      <Route path="memory" element={<MemoryMatch />} />
      <Route path="colours" element={<ColourMix />} />
      <Route path="rhymes" element={<Rhymes />} />
      <Route path="opposites" element={<Opposites />} />
      <Route path="patterns" element={<Patterns />} />
      <Route path="safari" element={<SoundSafari />} />
      <Route path="daily" element={<DailySurprise />} />
      <Route path="stickers" element={<StickerBook />} />
      <Route path="*" element={<Navigate to="/play" replace />} />
    </Routes>
  );
}
