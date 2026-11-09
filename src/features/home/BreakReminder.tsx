import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../lib/app';
import { Button } from '../../ui/kit';

/**
 * Configurable break reminder (a visual-comfort feature). Pauses activity with an overlay;
 * nothing underneath is unmounted, so no work is lost. Counts only visible, active time.
 */
export function BreakReminder() {
  const { profile, prefs, t, speak } = useApp();
  const [open, setOpen] = useState(false);
  const active = useRef(0);
  const lastInput = useRef(Date.now());
  useEffect(() => {
    const mark = () => { lastInput.current = Date.now(); };
    window.addEventListener('pointerdown', mark);
    window.addEventListener('keydown', mark);
    const i = setInterval(() => {
      if (!profile || !prefs.breakEnabled || document.hidden || open) return;
      if (Date.now() - lastInput.current > 3 * 60_000) return; // idle doesn't count
      active.current += 15;
      if (active.current >= prefs.breakMinutes * 60) { active.current = 0; setOpen(true); }
    }, 15_000);
    return () => { clearInterval(i); window.removeEventListener('pointerdown', mark); window.removeEventListener('keydown', mark); };
  }, [profile, prefs.breakEnabled, prefs.breakMinutes, open]);
  useEffect(() => { if (open) speak(t('breakTime'), { te: 'కాసేపు విరామం తీసుకో' }); }, [open, speak, t]);
  if (!open) return null;
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="brk">
      <div className="modal center stack">
        <h2 id="brk">{t('breakTime')}</h2>
        <p>{t('breakBody')}</p>
        <Button variant="primary" onClick={() => setOpen(false)} autoFocus>{t('resume')}</Button>
      </div>
    </div>
  );
}
