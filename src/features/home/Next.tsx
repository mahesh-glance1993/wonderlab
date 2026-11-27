import { Link } from 'react-router-dom';
import { useApp, useL } from '../../lib/app';
import { Page, NarrationControls, SyncBadge } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { recommend } from '../../shared/recommend';
import { useClassContent } from './useClassContent';
import './home.css';

export default function Next() {
  const { profile, learner, prefs, t, lang, presentation } = useApp();
  const L = useL();
  const { content, error } = useClassContent(profile!.classLevel);
  const lastObj = prefs.lastActivity?.path.match(/^\/lesson\/[^/]+\/([^?]+)/)?.[1];
  const rec = content ? recommend(content.units, learner.mastery, undefined, lastObj ? decodeURIComponent(lastObj) : undefined) : null;
  const unit = rec && content!.units.find((u) => u.id === rec.unitId);
  const obj = unit?.objectives.find((o) => o.id === rec!.objectiveId);
  const due = content ? content.units.flatMap((u) => u.objectives.map((o) => ({ u, o }))).filter(({ o }) => {
    const m = learner.mastery[o.id];
    return m?.nextReviewAt && m.nextReviewAt <= Date.now() / 1000;
  }) : [];

  const completedCount = Object.values(learner.mastery).filter((m) => m.masteredAt).length;

  return (
    <Page title={t('whatNext')} hideTopBar back={false}>
      <div className="next-workspace">
        {/* Unified Breadcrumb Navigation */}
        <div className="next-nav-bar">
          <Link to="/" className="next-breadcrumb-btn" aria-label="Back to Home">
            <Icon name="back" />
            <span>{t('home')}</span>
          </Link>
          <span className="next-nav-divider">/</span>
          <span className="next-nav-current">{t('whatNext')}</span>
          <span className="spacer" />
          <SyncBadge />
        </div>

        {/* Pedagogical Horizon Header */}
        <section className="next-horizon" aria-label="Learning Horizon">
          <div className="next-horizon-text">
            <div className="next-compass-badge">
              <span className="next-compass-pulse" aria-hidden="true" />
              <span>Pedagogical Compass · {lang === 'te' ? 'తదుపరి అన్వేషణ' : 'What Next'}</span>
            </div>
            <h1 className="next-horizon-title">Next Discovery Step</h1>
            <p className="next-horizon-desc">
              Connecting your recent explorations with today's inquiry. Untimed, reflective, and guided by your own natural curiosity.
            </p>
          </div>

          <div className="next-cadence-pill" aria-label="Learning Cadence">
            <div className="next-cadence-icon" aria-hidden="true">
              <Icon name="sparkle" />
            </div>
            <div className="next-cadence-meta">
              <span className="next-cadence-label">Self-Paced Rhythm</span>
              <span className="next-cadence-sub">
                {completedCount > 0 ? `${completedCount} skills mastered · Zero hurry` : 'Begin whenever you are ready'}
              </span>
            </div>
          </div>
        </section>

        {error && <div className="alert warn" role="alert">{error}</div>}
        {!content && !error && <p role="status" className="muted center">Thinking and exploring your path…</p>}

        {/* Hero Recommendation Card */}
        {rec && unit && obj && (
          <article className="next-hero-card" aria-label="Curated Recommendation">
            <div className="next-hero-source">
              <Icon name="compass" />
              <span>Curated Next Step · {rec.kind === 'review' ? 'Gentle Review' : rec.kind === 'continue' ? 'Continue Journey' : 'Fresh Inquiry'}</span>
              <span className="unit-badge">Class {profile?.classLevel || 5}</span>
            </div>

            <div className="next-hero-titles">
              <h2 className="next-hero-title">{L(obj.title)}</h2>
              <p className="next-hero-unit">{L(unit.title)}</p>
            </div>

            {/* Cognitive connection callout */}
            <div className="next-why-callout" role="note">
              <div className="next-why-icon" aria-hidden="true">
                <Icon name="bulb" />
              </div>
              <div className="next-why-content">
                <span className="next-why-heading">Why this specific step? / ఎందుకు ఈ అన్వేషణ?</span>
                <p className="next-why-text">{L(rec.reason)}</p>
              </div>
            </div>

            {presentation?.readAloud && (
              <NarrationControls
                text={`${obj.title.en}. ${rec.reason.en}`}
                te={obj.title.te ? `${obj.title.te}. ${rec.reason.te || ''}` : undefined}
              />
            )}

            <div className="next-hero-actions">
              <Link
                className="next-start-btn"
                to={`/lesson/${encodeURIComponent(unit.id)}/${encodeURIComponent(obj.id)}?mode=${rec.kind === 'review' || rec.kind === 'continue' ? 'practice' : 'learn'}`}
              >
                <Icon name="play" />
                <span>{rec.kind === 'review' ? 'Practice Skill' : 'Start Guided Exploration'}</span>
              </Link>
              <Link className="next-choose-btn" to="/learn">
                <Icon name="grid" />
                <span>Choose Something Else</span>
              </Link>
              <div className="next-hero-meta" aria-hidden="true">
                <Icon name="clock" />
                <span>~10 mins · Calm & Untimed</span>
              </div>
            </div>
          </article>
        )}

        {/* Practice Queue */}
        {due.length > 0 && (
          <section className="next-queue-card" aria-label="Practice Queue">
            <div className="next-queue-header">
              <div>
                <h3 className="next-queue-title">Practice Queue / సాధన వరుస</h3>
                <p className="muted small" style={{ margin: '4px 0 0' }}>
                  Skills to revisit at your own pace, chosen from earlier questions to help concepts settle gently.
                </p>
              </div>
            </div>
            <div className="next-queue-grid">
              {due.slice(0, 6).map(({ u, o }) => (
                <Link
                  key={o.id}
                  className="next-queue-item"
                  to={`/lesson/${encodeURIComponent(u.id)}/${encodeURIComponent(o.id)}?mode=practice`}
                >
                  <span className="next-queue-item-title">{L(o.title)}</span>
                  <span className="pill small"><Icon name="play" />Practice</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Alternative Discovery Hub */}
        <section className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 12px', fontFamily: 'var(--font-head)', fontSize: '1.15rem' }}>
            Explore Subjects / విభాగాలు
          </h3>
          <div className="row wrap" style={{ gap: '10px' }}>
            <Link className="btn" to="/learn?subject=math"><Icon name="grid" />Math</Link>
            <Link className="btn" to="/lang/telugu"><Icon name="book" />తెలుగు</Link>
            <Link className="btn" to="/lang/english"><Icon name="book" />English</Link>
            <Link className="btn" to="/lab"><Icon name="atom" />Physics Lab</Link>
            <Link className="btn" to="/games"><Icon name="puzzle" />Games</Link>
          </div>
        </section>
      </div>
    </Page>
  );
}
