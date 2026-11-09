import { Link } from 'react-router-dom';
import { useApp, useL } from '../../lib/app';
import { Page, NarrationControls } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { recommend } from '../../shared/recommend';
import { useClassContent } from './useClassContent';

export default function Next() {
  const { profile, learner, prefs, t, presentation } = useApp();
  const L = useL();
  const { content, error } = useClassContent(profile!.classLevel);
  const lastObj = prefs.lastActivity?.path.match(/^\/lesson\/[^/]+\/([^?]+)/)?.[1];
  const rec = content ? recommend(content.units, learner.mastery, undefined, lastObj ? decodeURIComponent(lastObj) : undefined) : null;
  const unit = rec && content!.units.find((u) => u.id === rec.unitId);
  const obj = unit?.objectives.find((o) => o.id === rec!.objectiveId);
  const due = content ? content.units.flatMap((u) => u.objectives.map((o) => ({ u, o }))).filter(({ o }) => { const m = learner.mastery[o.id]; return m?.nextReviewAt && m.nextReviewAt <= Date.now() / 1000; }) : [];
  return (
    <Page title={t('whatNext')}>
      {error && <div className="alert warn">{error}</div>}
      {!content && !error && <p role="status">Thinking…</p>}
      {rec && unit && obj && (
        <section className="card stack" style={{ maxWidth: 720, margin: '0 auto', background: 'var(--c-next)' }}>
          <h1 style={{ margin: 0 }}>{L(obj.title)}</h1>
          <p className="muted" style={{ margin: 0 }}>{L(unit.title)}</p>
          <div className="alert info"><Icon name="info" /><span><b>{t('recommendedBecause')}</b> {L(rec.reason)}</span></div>
          {presentation?.readAloud && <NarrationControls text={`${obj.title.en}. ${rec.reason.en}`} te={obj.title.te ? `${obj.title.te}. ${rec.reason.te || ''}` : undefined} />}
          <div className="row">
            <Link className="btn primary" to={`/lesson/${encodeURIComponent(unit.id)}/${encodeURIComponent(obj.id)}?mode=${rec.kind === 'review' || rec.kind === 'continue' ? 'practice' : 'learn'}`}><Icon name="play" />{t('start')}</Link>
            <Link className="btn" to="/learn">Choose something else</Link>
          </div>
        </section>
      )}
      {due.length > 1 && (
        <section className="card" style={{ maxWidth: 720, margin: '16px auto 0' }}>
          <h2>Practice queue</h2>
          <p className="muted">Skills to revisit, picked from questions you missed earlier.</p>
          <ul>{due.slice(0, 6).map(({ u, o }) => <li key={o.id}><Link to={`/lesson/${encodeURIComponent(u.id)}/${encodeURIComponent(o.id)}?mode=practice`}>{L(o.title)}</Link></li>)}</ul>
        </section>
      )}
    </Page>
  );
}
