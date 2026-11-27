import { useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../lib/app';
import { Icon, type IconName } from './Icon';
import { AVATAR_EMOJI, CLASSES } from '../shared/levels';
import { ComfortSettings } from '../features/home/ComfortSettings';
import type { StringKey } from '../i18n/en';
import './AppShell.css';

interface NavItem {
  key: string;
  to: string;
  icon: IconName;
  labelKey: StringKey;
  earlyLabelKey?: StringKey;
  defaultLabel: string;
  earlyDefaultLabel?: string;
  show?: (level: number) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', to: '/', icon: 'home', labelKey: 'appName', defaultLabel: 'Home' },
  { key: 'learn', to: '/learn', icon: 'grid', labelKey: 'math', earlyLabelKey: 'e_math', defaultLabel: 'Learn', earlyDefaultLabel: 'Learn' },
  { key: 'next', to: '/next', icon: 'compass', labelKey: 'whatNext', earlyLabelKey: 'e_next', defaultLabel: 'What next?', earlyDefaultLabel: 'Next' },
  { key: 'play', to: '/play', icon: 'sparkle', labelKey: 'e_play', earlyLabelKey: 'e_play', defaultLabel: 'Play & Learn', show: (l) => l <= 2 },
  { key: 'games', to: '/games', icon: 'puzzle', labelKey: 'games', earlyLabelKey: 'e_games', defaultLabel: 'Games', show: (l) => l >= 3 },
  { key: 'lab', to: '/lab', icon: 'atom', labelKey: 'physicsLab', earlyLabelKey: 'e_world', defaultLabel: 'Physics Lab', show: (l) => l >= 3 },
  { key: 'art', to: '/art', icon: 'palette', labelKey: 'artStudio', earlyLabelKey: 'e_art', defaultLabel: 'Art Studio', show: (l) => l <= 7 },
  { key: 'notes', to: '/notes', icon: 'note', labelKey: 'myNotes', defaultLabel: 'My Notes', show: (l) => l >= 6 },
  { key: 'progress', to: '/progress', icon: 'trophy', labelKey: 'myProgress', earlyLabelKey: 'e_progress', defaultLabel: 'Progress', earlyDefaultLabel: 'Stars' },
  { key: 'downloads', to: '/downloads', icon: 'download', labelKey: 'downloads', defaultLabel: 'Downloads' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, presentation, lang, t, updatePrefs } = useApp();
  const location = useLocation();
  const nav = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  if (!profile || !presentation) {
    return <>{children}</>;
  }

  const early = presentation.tier === 'early';
  const cls = CLASSES[profile.classLevel];
  const items = NAV_ITEMS.filter((item) => !item.show || item.show(profile.classLevel));

  // Determine if current screen requires full immersive canvas (e.g. painting workspace)
  const isImmersive = location.pathname.includes('/art/paint') || location.pathname.includes('/art/trace');

  // Primary tabs for mobile bottom navigation (4 key destinations + More)
  const mobilePrimary = [
    { to: '/', icon: 'home' as IconName, label: early ? 'Home' : 'Home' },
    { to: '/learn', icon: 'grid' as IconName, label: early ? 'Learn' : 'Lessons' },
    { to: early ? '/play' : '/games', icon: (early ? 'sparkle' : 'puzzle') as IconName, label: early ? 'Play' : 'Games' },
    { to: '/progress', icon: 'trophy' as IconName, label: early ? 'Stars' : 'Progress' },
  ];

  return (
    <div className={`wl-shell ${isImmersive ? 'wl-shell-immersive' : ''}`}>
      {/* Desktop & Tablet Navigation Rail */}
      <aside className="wl-rail" aria-label="Main Navigation">
        <div className="wl-rail-brand">
          <div className="wl-brand-badge" aria-hidden="true">
            <Icon name="atom" size="lg" />
          </div>
          <span className="wl-brand-name">WonderLab</span>
        </div>

        {/* Active Learner Badge */}
        <button
          type="button"
          className="wl-learner-card"
          onClick={() => nav('/who')}
          title={`${t('switchLearner')}: ${profile.nickname}`}
          aria-label={`${profile.nickname}, ${lang === 'te' ? cls.labelTe : cls.label}. Switch learner`}
        >
          <span className="wl-learner-avatar" aria-hidden="true">
            {AVATAR_EMOJI[profile.avatar]}
          </span>
          <div className="wl-learner-meta">
            <span className="wl-learner-name">{profile.nickname}</span>
            <span className="wl-learner-class">{lang === 'te' ? cls.labelTe : cls.label}</span>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="wl-rail-nav">
          {items.map((item) => {
            const label = early && item.earlyLabelKey ? t(item.earlyLabelKey) : t(item.labelKey) || item.defaultLabel;
            return (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `wl-rail-item ${isActive ? 'active' : ''}`}
                title={label}
              >
                <span className="wl-rail-item-icon">
                  <Icon name={item.icon} />
                </span>
                <span className="wl-rail-item-label">{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Rail Footer Controls */}
        <div className="wl-rail-footer">
          {presentation.teluguAvailable && (
            <button
              type="button"
              className="wl-footer-btn"
              onClick={() => void updatePrefs({ language: lang === 'te' ? 'en' : 'te' })}
              aria-label={`${t('language')}: ${lang === 'te' ? 'తెలుగు' : 'English'}. Switch`}
              title={lang === 'te' ? 'Switch to English' : 'తెలుగులోకి మార్చు'}
            >
              <Icon name="globe" />
              <span className="wl-footer-btn-label">{lang === 'te' ? 'English' : 'తెలుగు'}</span>
            </button>
          )}

          <div className="wl-footer-comfort">
            <ComfortSettings />
            <span className="wl-footer-btn-label">Settings</span>
          </div>

          <button
            type="button"
            className="wl-footer-btn"
            onClick={() => nav('/parent')}
            aria-label={t('settings')}
            title="Parent Area"
          >
            <Icon name="gear" />
            <span className="wl-footer-btn-label">Parent</span>
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="wl-shell-main">
        {children}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {!isImmersive && (
        <nav className="wl-mobile-bar" aria-label="Mobile Navigation">
          {mobilePrimary.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) => `wl-mobile-item ${isActive ? 'active' : ''}`}
            >
              <Icon name={tab.icon} />
              <span>{tab.label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            className={`wl-mobile-item ${moreOpen ? 'active' : ''}`}
            onClick={() => setMoreOpen(!moreOpen)}
            aria-expanded={moreOpen}
            aria-label="More sections"
          >
            <Icon name={moreOpen ? 'x' : 'grid'} />
            <span>More</span>
          </button>
        </nav>
      )}

      {/* Mobile "More" Drawer Modal */}
      {moreOpen && (
        <div className="wl-more-overlay" onClick={() => setMoreOpen(false)} role="dialog" aria-modal="true" aria-label="More sections">
          <div className="wl-more-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="wl-more-header">
              <h3>More WonderLab</h3>
              <button type="button" className="btn small" onClick={() => setMoreOpen(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <div className="wl-more-grid">
              <NavLink to="/next" className="wl-more-tile" onClick={() => setMoreOpen(false)}>
                <Icon name="compass" size="lg" />
                <span>What next?</span>
              </NavLink>
              {profile.classLevel >= 3 && (
                <NavLink to="/lab" className="wl-more-tile" onClick={() => setMoreOpen(false)}>
                  <Icon name="atom" size="lg" />
                  <span>Physics Lab</span>
                </NavLink>
              )}
              {profile.classLevel <= 7 ? (
                <NavLink to="/art" className="wl-more-tile" onClick={() => setMoreOpen(false)}>
                  <Icon name="palette" size="lg" />
                  <span>Art Studio</span>
                </NavLink>
              ) : (
                <NavLink to="/notes" className="wl-more-tile" onClick={() => setMoreOpen(false)}>
                  <Icon name="note" size="lg" />
                  <span>My Notes</span>
                </NavLink>
              )}
              <NavLink to="/downloads" className="wl-more-tile" onClick={() => setMoreOpen(false)}>
                <Icon name="download" size="lg" />
                <span>Downloads</span>
              </NavLink>
              <button
                type="button"
                className="wl-more-tile"
                onClick={() => { setMoreOpen(false); nav('/who'); }}
              >
                <Icon name="user" size="lg" />
                <span>Switch Child</span>
              </button>
              <button
                type="button"
                className="wl-more-tile"
                onClick={() => { setMoreOpen(false); nav('/parent'); }}
              >
                <Icon name="gear" size="lg" />
                <span>Parent Area</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
