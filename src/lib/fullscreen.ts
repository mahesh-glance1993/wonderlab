import { useCallback, useEffect, useState } from 'react';

const doc = () => document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => Promise<void> };
/**
 * True when WonderLab runs inside the Android app (Trusted Web Activity). The app opens
 * /?app=android; we remember it for this app session only (sessionStorage), because the app
 * shares Chrome's storage and the same site may also be used in a normal Chrome tab.
 * Inside the app the page already fits the phone like a normal app, so no full-screen requests.
 */
export function inAndroidApp(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const fromApp = new URLSearchParams(location.search).get('app') === 'android' || document.referrer.startsWith('android-app://com.maheshglance.wonderlab');
    if (fromApp) sessionStorage.setItem('wl.app', 'android');
    return sessionStorage.getItem('wl.app') === 'android';
  } catch { return false; }
}
export const fullscreenSupported = () => !inAndroidApp() && typeof document !== 'undefined' && !!(document.fullscreenEnabled || (document as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled);

/**
 * Full screen for lessons, games and the art studio.
 * Browser full screen where supported; otherwise an "immersive" in-page mode that hides app chrome.
 * State lives in the DOM, so work in the page is preserved when switching modes.
 */
export function useFullscreen() {
  const [native, setNative] = useState(() => !!(doc().fullscreenElement || doc().webkitFullscreenElement));
  const [immersive, setImmersive] = useState(false);
  useEffect(() => {
    const on = () => setNative(!!(doc().fullscreenElement || doc().webkitFullscreenElement));
    document.addEventListener('fullscreenchange', on);
    document.addEventListener('webkitfullscreenchange', on);
    return () => { document.removeEventListener('fullscreenchange', on); document.removeEventListener('webkitfullscreenchange', on); };
  }, []);
  useEffect(() => {
    // native full screen keeps the app's top bar (back, settings); only the no-API fallback hides it
    document.documentElement.classList.toggle('immersive', immersive && !native);
  }, [immersive, native]);
  useEffect(() => () => document.documentElement.classList.remove('immersive'), []);
  const enter = useCallback(async () => {
    if (inAndroidApp()) return; // the app window already fits the screen
    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
    try {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else setImmersive(true);
    } catch { setImmersive(true); }
  }, []);
  const exit = useCallback(async () => {
    setImmersive(false);
    try {
      if (doc().fullscreenElement) await document.exitFullscreen();
      else if (doc().webkitFullscreenElement) await doc().webkitExitFullscreen?.();
    } catch { /* already exited */ }
  }, []);
  return { active: native || immersive, native, immersive, enter, exit, toggle: () => (native || immersive ? exit() : enter()) };
}
