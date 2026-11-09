import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from './kit';
import { Icon } from './Icon';
import { reportClientError } from '../lib/errorReport';

/**
 * Catches render errors in a screen so a child never sees a blank page.
 * `resetKey` (the current path) clears the error when the user navigates elsewhere.
 */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    reportClientError(error, 'boundary', info.componentStack || undefined);
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main id="main" className="main" tabIndex={-1}>
        <div className="card center stack" role="alert" style={{ maxWidth: 460, margin: '48px auto', alignItems: 'center' }}>
          <Icon name="sparkle" size="lg" />
          <h1 style={{ margin: 0 }}>Oops! Something got mixed up.</h1>
          <p className="muted" style={{ margin: 0 }}>Don't worry — your work is safe. Let's go back home and try again.</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Button variant="primary" icon="home" onClick={() => window.location.assign('/')}>Go home</Button>
            <Button icon="reset" onClick={() => window.location.reload()}>Try again</Button>
          </div>
        </div>
      </main>
    );
  }
}

/** Error boundary that resets itself when the route changes (use inside the router). */
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>;
}
