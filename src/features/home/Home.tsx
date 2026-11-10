import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { Page, IconButton, NarrationControls } from '../../ui/kit';
import { ComfortSettings } from './ComfortSettings';
import { Icon, type IconName } from '../../ui/Icon';
import { AVATAR_EMOJI, CLASSES } from '../../shared/levels';
import type { StringKey } from '../../i18n/en';
import './home.css';

interface TileDef { key: string; to: string; icon: IconName; label: StringKey; earlyLabel?: StringKey; desc: string; color: string; show?: (level: number) => boolean }
const TILES: TileDef[] = [
  { key: 'play', to: '/play', icon: 'sparkle', label: 'e_play', earlyLabel: 'e_play', desc: 'Pictures, stories and shapes', color: 'art', show: (l) => l <= 2 },
  { key: 'next', to: '/next', icon: 'compass', label: 'whatNext', earlyLabel: 'e_next', desc: 'A suggestion picked for you', color: 'next' },
  { key: 'telugu', to: '/lang/telugu', icon: 'book', label: 'telugu', earlyLabel: 'telugu', desc: 'అక్షరాలు, పదాలు, చదవడం, వ్యాకరణం', color: 'games' },
  { key: 'english', to: '/lang/english', icon: 'book', label: 'englishCourse', earlyLabel: 'englishCourse', desc: 'Letters, phonics, reading and grammar', color: 'math' },
  { key: 'math', to: '/learn?subject=math', icon: 'grid', label: 'math', earlyLabel: 'e_math', desc: 'Lessons, practice and tests', color: 'math' },
  { key: 'lab', to: '/lab', icon: 'atom', label: 'physicsLab', earlyLabel: 'e_world', desc: 'Experiments with motion, forces, circuits and light', color: 'lab' },
  { key: 'art', to: '/art', icon: 'palette', label: 'artStudio', earlyLabel: 'e_art', desc: 'Trace, colour and paint', color: 'art' },
  { key: 'games', to: '/games', icon: 'puzzle', label: 'games', earlyLabel: 'e_games', desc: 'Puzzles that build skills', color: 'games' },
  { key: 'progress', to: '/progress', icon: 'trophy', label: 'myProgress', earlyLabel: 'e_progress', desc: 'Stars, badges and skills', color: 'prog' },
  { key: 'downloads', to: '/downloads', icon: 'download', label: 'downloads', desc: 'Use lessons without internet', color: 'dl' },
];

export default function Home() {
  const { profile, presentation, prefs, t, lang, learner, updatePrefs } = useApp();
  const nav = useNavigate();
  if (!profile || !presentation) return null;
  const early = presentation.tier === 'early';
  const stars = Object.keys(learner.rewards).length + Object.values(learner.mastery).reduce((s, m) => s + m.correct, 0);
  const last = prefs.lastActivity;
  const cls = CLASSES[profile.classLevel];
  // the Physics Lab tile becomes "My world" (exploration lessons) for pre-primary learners
  const tiles = TILES.map((x) => (early && x.key === 'lab' ? { ...x, to: '/learn?subject=early', icon: 'globe' as IconName } : x));
  const greeting = lang === 'te' ? `నమస్తే ${profile.nickname}!` : `Hi ${profile.nickname}!`;
  return (
    <Page title={t('appName')} back={false} actions={
      <>
        {presentation.teluguAvailable && (
          <button className="btn small" onClick={() => void updatePrefs({ language: lang === 'te' ? 'en' : 'te' })} aria-label={`${t('language')}: ${lang === 'te' ? 'తెలుగు' : 'English'}. Switch`}>
            <Icon name="globe" /><span className="hide-narrow">{lang === 'te' ? 'English' : 'తెలుగు'}</span>
          </button>
        )}
        <ComfortSettings />
        <IconButton icon="user" label={t('switchLearner')} onClick={() => nav('/who')} />
        <IconButton icon="gear" label={t('settings')} onClick={() => nav('/parent')} />
      </>
    }>
      <section className="card hello" aria-label="Welcome">
        <span className="hello-av" aria-hidden="true">{AVATAR_EMOJI[profile.avatar]}</span>
        <div>
          <h1>{greeting}</h1>
          <p className="muted">{lang === 'te' ? cls.labelTe : cls.label} · <Icon name="star" /> {stars} {t('stars')}</p>
        </div>
        {early && <NarrationControls text={`Hi ${profile.nickname}! What would you like to do?`} te={`నమస్తే ${profile.nickname}! ఏం చేద్దాం?`} />}
      </section>

      {last && (
        <Link to={last.path} className="tile continue" style={{ background: 'var(--c-next)' }}>
          <span className="tile-icon" style={{ color: 'var(--c-next-ink)' }}><Icon name="play" size="lg" /></span>
          <b>{early ? t('e_continue') : t('continueLearning')}</b>
          <small>{last.label}</small>
        </Link>
      )}

      <nav className={`grid home-grid ${early ? 'early' : ''}`} aria-label="Main sections">
        {tiles.filter((x) => !(early && x.key === 'downloads') && (!x.show || x.show(profile.classLevel))).map((x) => (
          <Link key={x.key} to={x.to} className="tile" style={{ background: `var(--c-${x.color})` }}>
            <span className="tile-icon" style={{ color: `var(--c-${x.color}-ink)` }}><Icon name={x.icon} size="lg" /></span>
            <b>{early && x.earlyLabel ? t(x.earlyLabel) : t(x.label)}</b>
            {!early && <small>{x.desc}</small>}
          </Link>
        ))}
      </nav>
    </Page>
  );
}
