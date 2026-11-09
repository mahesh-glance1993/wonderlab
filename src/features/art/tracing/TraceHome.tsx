import { Link } from 'react-router-dom';
import { useApp } from '../../../lib/app';
import { Page } from '../../../ui/kit';
import { Icon } from '../../../ui/Icon';
import { SHEETS, guidePolys } from './guides';
import { GuideSvg } from './GuideSvg';

/** Tracing sheet picker. */
export default function TraceHome() {
  const { lang } = useApp();
  return (
    <Page title={lang === 'te' ? 'ట్రేసింగ్' : 'Tracing'} back="/art">
      <div className="page-head"><h1>{lang === 'te' ? 'ఏది దిద్దుదాం?' : 'What shall we trace?'}</h1></div>
      <div className="grid">
        {SHEETS.map((s) => {
          const g = s.guides[Math.min(s.guides.length - 1, s.id === 'capitals' || s.id === 'small' ? 0 : 1)];
          return (
            <div key={s.id} className="card art-page-card">
              <Link to={`/art/trace/${s.id}`} className="art-page-link" aria-label={`${s.title}: ${s.guides.length} to trace`}>
                <span className="trace-thumb" aria-hidden="true"><GuideSvg guide={g} polys={guidePolys(g)} tol={6} guidance mode="screen" /></span>
                <b>{lang === 'te' ? s.titleTe : s.title}</b>
                <small className="muted">{s.guides.length} to trace</small>
              </Link>
              <div className="row"><span className="spacer" /><Link className="btn small ghost" to={`/art/print/trace/${s.id}`} aria-label={`Print ${s.title} tracing sheet`}><Icon name="print" /></Link></div>
            </div>
          );
        })}
      </div>
    </Page>
  );
}
