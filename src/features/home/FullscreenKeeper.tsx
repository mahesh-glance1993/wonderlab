import { useEffect, useState } from 'react';
import { useApp } from '../../lib/app';
import { fullscreenSupported } from '../../lib/fullscreen';
import { Icon } from '../../ui/Icon';

export const FS_OFF_KEY = 'wl.fsOff'; // set when the learner presses "Exit Full Screen" (this visit only)
const isFS = () => !!(document.fullscreenElement || (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement);

/**
 * "Keep full screen": browsers leave full screen on Esc, printing, downloads or app switching, and
 * only allow re-entering after a tap. So when full screen is lost, show a small note and re-enter on
 * the next tap/keypress. Pressing our Exit button turns this off until the app is opened again.
 */
export function FullscreenKeeper() {
  const { profile, prefs } = useApp();
  const [fs, setFs] = useState(isFS);
  const wanted = !!profile && prefs.keepFullscreen !== false && fullscreenSupported();
  useEffect(() => {
    const on = () => setFs(isFS());
    document.addEventListener('fullscreenchange', on);
    document.addEventListener('webkitfullscreenchange', on);
    return () => { document.removeEventListener('fullscreenchange', on); document.removeEventListener('webkitfullscreenchange', on); };
  }, []);
  useEffect(() => {
    if (!wanted) return;
    const go = (e: Event) => {
      if (e instanceof KeyboardEvent && (e.key === 'Escape' || e.key === 'Tab')) return;
      if (isFS() || sessionStorage.getItem(FS_OFF_KEY)) return;
      const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
      try {
        if (el.requestFullscreen) el.requestFullscreen({ navigationUI: 'hide' }).catch(() => undefined);
        else el.webkitRequestFullscreen?.();
      } catch { /* not allowed right now */ }
    };
    window.addEventListener('pointerup', go, true);
    window.addEventListener('keydown', go, true);
    return () => { window.removeEventListener('pointerup', go, true); window.removeEventListener('keydown', go, true); };
  }, [wanted]);
  if (!wanted || fs || sessionStorage.getItem(FS_OFF_KEY)) return null;
  return (
    <div className="fs-hint no-print" role="status">
      <Icon name="max" />Tap anywhere to return to full screen
    </div>
  );
}
