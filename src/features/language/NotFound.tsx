import { Link } from 'react-router-dom';
import { Page } from '../../ui/kit';

export function NotFound() {
  return (
    <Page title="Not found" back="/lang">
      <div className="card stack">
        <p>We could not find that lesson.</p>
        <Link className="btn primary" to="/lang">Back to Languages</Link>
      </div>
    </Page>
  );
}
