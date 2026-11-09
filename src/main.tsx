import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// After a new version is deployed, an open tab may ask for screen files that no longer exist.
// Reload once to pick up the new version instead of showing a blank screen.
window.addEventListener('vite:preloadError', (e) => {
  const last = Number(sessionStorage.getItem('wl.reloadedAt') || 0);
  if (Date.now() - last > 30_000) {
    e.preventDefault();
    sessionStorage.setItem('wl.reloadedAt', String(Date.now()));
    location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Offline support: the service worker caches the app shell and downloaded packs.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => undefined); });
}
