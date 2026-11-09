import { Link } from 'react-router-dom';
import { useApp, useL } from '../../lib/app';
import { Page, Meter } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { useClassContent } from '../home/useClassContent';
import { statusOf } from '../home/Curriculum';

const BADGE_NAMES: Record<string, string> = { play: 'Play & Learn', lang: 'Language', mastered: 'Skill mastered', game: 'Game badge', lab: 'Lab challenge', art: 'Art milestone', daily: 'Daily puzzle' };

export default function Progress() {
  const { profile, learner, t } = useApp();
  const L = useL();
  const { content } = useClassContent(profile!.classLevel);
  const objectives = (content?.units || []).flatMap((u) => u.objectives.map((o) => ({ u, o, st: statusOf(learner.mastery[o.id]) })));
  const mastered = objectives.filter((x) => x.st.key === 'mastered');
  const practice = objectives.filter((x) => x.st.key === 'practice');
  const rewards = Object.entries(learner.rewards).sort((a, b) => b[1] - a[1]);
  const correct = Object.values(learner.mastery).reduce((s, m) => s + m.correct, 0);
  return (
    <Page title={t('myProgress')}>
      <div className="grid">
        <div className="card center"><Icon name="star" size="lg" /><h2 style={{ margin: 0 }}>{correct + rewards.length}</h2><p className="muted" style={{ margin: 0 }}>{t('stars')}</p></div>
        <div className="card center"><Icon name="check" size="lg" /><h2 style={{ margin: 0 }}>{mastered.length} / {objectives.length || '…'}</h2><p className="muted" style={{ margin: 0 }}>skills mastered</p><Meter value={objectives.length ? mastered.length / objectives.length : 0} label="Skills mastered" /></div>
        <div className="card center"><Icon name="trophy" size="lg" /><h2 style={{ margin: 0 }}>{rewards.length}</h2><p className="muted" style={{ margin: 0 }}>badges</p></div>
      </div>
      {mastered.length > 0 && (
        <section className="card" style={{ marginTop: 16 }}>
          <h2>{t('canNowDo')}</h2>
          <ul>{mastered.map(({ o }) => <li key={o.id}>{L(o.title)}</li>)}</ul>
        </section>
      )}
      {practice.length > 0 && (
        <section className="card" style={{ marginTop: 16 }}>
          <h2>{t('needsPractice')}</h2>
          <ul>{practice.map(({ u, o }) => <li key={o.id}><Link to={`/lesson/${encodeURIComponent(u.id)}/${encodeURIComponent(o.id)}?mode=practice`}>{L(o.title)}</Link></li>)}</ul>
        </section>
      )}
      {rewards.length > 0 && (
        <section className="card" style={{ marginTop: 16 }}>
          <h2>Badges</h2>
          <ul className="row" style={{ listStyle: 'none', padding: 0 }}>
            {rewards.map(([id, at]) => <li key={id} className="pill" title={new Date(at * 1000).toLocaleDateString()}><Icon name="trophy" />{BADGE_NAMES[id.split(':')[0]] || 'Badge'}: {id.split(':').slice(1).join(' ') || id}</li>)}
          </ul>
        </section>
      )}
      {!mastered.length && !rewards.length && <p className="muted" style={{ marginTop: 16 }}>Complete lessons, games and art to collect stars and badges. <Link to="/next">{t('whatNext')}</Link></p>}
    </Page>
  );
}
