import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { Page, Button } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { AVATAR_EMOJI, CLASSES } from '../../shared/levels';
import { speak } from '../../lib/audio';
import { useOfflineReadiness } from '../downloads/useOffline';
import './home.css';

/** Child-friendly profile picker for a shared family device. No password needed to switch learners. */
export default function ProfilePicker() {
  const { profiles, selectProfile, t, account, online, offlineMode } = useApp();
  const { byProfile } = useOfflineReadiness();
  const isOffline = !online || offlineMode;
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const next = sp.get('next');
  return (
    <Page title={t('whoIsLearning')} back={false} actions={<Button small icon="gear" onClick={() => nav('/parent')}>{t('parent')}</Button>}>
      <h1 className="center" style={{ fontSize: '2rem' }}>{t('whoIsLearning')}</h1>
      {isOffline && <p className="picker-offline muted" role="status"><Icon name="wifiOff" /> Offline · saved on this device. Learners downloaded here can keep learning; work uploads when you are back online.</p>}
      {!profiles.length && <p className="center">No learners yet. <Button variant="primary" onClick={() => nav('/setup')}>Add a learner</Button></p>}
      <div className="picker" role="list">
        {profiles.map((p) => (
          <div role="listitem" key={p.id}>
            <button className="who" onClick={() => { speak(`Hi ${p.nickname}!`); selectProfile(p.id); nav(next && next !== '/who' ? next : '/', { replace: true }); }} aria-label={`${p.nickname}, ${CLASSES[p.classLevel].label}`}>
              <span className="av" aria-hidden="true">{AVATAR_EMOJI[p.avatar]}</span>
              {p.nickname}
              <small>{CLASSES[p.classLevel].label}</small>
              {isOffline && !byProfile[p.id]?.downloaded && <span className="dl-need">Download required</span>}
            </button>
          </div>
        ))}
        <div role="listitem">
          <button className="who add-who" disabled={isOffline} title={isOffline ? 'Adding a learner needs internet' : undefined} onClick={() => nav('/setup')} aria-label="Add a learner (parent)">
            <span className="av" aria-hidden="true"><Icon name="plus" size="lg" /></span>
            Add learner
            <small>Parent</small>
          </button>
        </div>
      </div>
      {account?.role !== 'parent' && <p className="center" style={{ marginTop: 24 }}><Button icon="edit" onClick={() => nav('/editor')}>Content editor</Button></p>}
    </Page>
  );
}
