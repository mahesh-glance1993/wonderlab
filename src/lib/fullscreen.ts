import { useCallback, useEffect, useState } from 'react';

const doc = () => document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => Promise<void> };
export const fullscreenSupported = () => typeof document !== 'undefined' && !!(document.fullscreenEnabled || (document as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled);

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
