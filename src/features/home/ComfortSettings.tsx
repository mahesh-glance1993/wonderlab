import { useEffect, useState } from 'react';
import { listVoices, loadVoices, speak } from '../../lib/audio';
import { useApp, type Prefs } from '../../lib/app';
import { IconButton, Modal, Segmented, Field } from '../../ui/kit';

/** Learner-adjustable comfort settings; saved to the profile and kept across devices. */
export function ComfortSettings() {
  const { prefs, updatePrefs, t, presentation } = useApp();
  const [open, setOpen] = useState(false);
  const set = (p: Partial<Prefs>) => void updatePrefs(p);
  const [voices, setVoices] = useState<{ en: SpeechSynthesisVoice[]; te: SpeechSynthesisVoice[] }>({ en: [], te: [] });
  useEffect(() => { if (open) void loadVoices().then(() => setVoices({ en: listVoices('en'), te: listVoices('te') })); }, [open]);
  const voiceRow = (lang: 'en' | 'te') => {
    const list = voices[lang];
    const key = lang === 'en' ? 'voiceEn' : 'voiceTe';
    const sample = lang === 'en' ? 'Hello! Let us learn something new today.' : 'నమస్తే! ఈరోజు కొత్తది నేర్చుకుందాం.';
    if (!list.length) return <p className="muted small" style={{ margin: 0 }}>{lang === 'te' ? 'No Telugu voice on this device. On Windows, the Microsoft Edge browser has natural Telugu voices.' : 'No English voice found on this device.'}</p>;
    return (
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <select className="input" aria-label={lang === 'en' ? 'English voice' : 'Telugu voice'} value={(prefs[key] as string) || list[0].voiceURI} onChange={(e) => set({ [key]: e.target.value })}>
          {list.map((v, i) => <option key={v.voiceURI} value={v.voiceURI}>{i === 0 ? '★ ' : ''}{v.name}{v.localService ? '' : ' (online)'}</option>)}
        </select>
        <button type="button" className="btn" onClick={() => void speak(sample, lang)}>Try</button>
      </div>
    );
  };
  return (
    <>
      <IconButton icon="eye" label="Comfort settings" onClick={() => setOpen(true)} />
      {open && (
        <Modal title="Comfort settings" onClose={() => setOpen(false)}>
          <div className="stack">
            <Field label={t('theme')}>{() => <Segmented label={t('theme')} value={prefs.theme} onChange={(theme) => set({ theme })} options={[{ value: 'system', label: 'Auto' }, { value: 'light', label: t('light') }, { value: 'dark', label: t('dark') }]} />}</Field>
            <Field label={t('textSize')}>{() => <Segmented label={t('textSize')} value={prefs.textSize} onChange={(textSize) => set({ textSize })} options={[{ value: 1, label: 'A' }, { value: 1.15, label: <span style={{ fontSize: '1.15em' }}>A</span> }, { value: 1.3, label: <span style={{ fontSize: '1.3em' }}>A</span> }]} />}</Field>
            <label className="check"><input type="checkbox" checked={prefs.reduceMotion} onChange={(e) => set({ reduceMotion: e.target.checked })} />{t('reduceMotion')}</label>
            <label className="check"><input type="checkbox" checked={prefs.keepFullscreen !== false} onChange={(e) => { sessionStorage.removeItem('wl.fsOff'); set({ keepFullscreen: e.target.checked }); }} />Keep full screen</label>
            <label className="check"><input type="checkbox" checked={prefs.mute} onChange={(e) => set({ mute: e.target.checked })} />{t('mute')}</label>
            <label className="check"><input type="checkbox" checked={prefs.narration} onChange={(e) => set({ narration: e.target.checked })} />Read instructions aloud</label>
            <Field label="Reading speed">{() => <Segmented label="Reading speed" value={prefs.readingSpeed || (presentation?.tier === 'early' ? 'slower' : presentation?.tier === 'primary' ? 'slow' : 'normal')} onChange={(readingSpeed) => set({ readingSpeed })} options={[{ value: 'slower', label: 'Very slow' }, { value: 'slow', label: 'Slow' }, { value: 'normal', label: 'Normal' }]} />}</Field>
            <label className="check"><input type="checkbox" checked={prefs.naturalVoice !== false} onChange={(e) => set({ naturalVoice: e.target.checked })} />Natural voice (needs internet)</label>
            {prefs.naturalVoice !== false && <Field label="Natural voice">{(f) => (
              <div className="row" style={{ flexWrap: 'nowrap' }}>
                <select {...f} className="input" value={prefs.naturalSpeaker || 'luna'} onChange={(e) => set({ naturalSpeaker: e.target.value })}>
                  {[['luna', 'Luna (warm, female)'], ['asteria', 'Asteria (clear, female)'], ['athena', 'Athena (calm, female)'], ['hera', 'Hera (gentle, female)'], ['aurora', 'Aurora (bright, female)'], ['orion', 'Orion (friendly, male)'], ['apollo', 'Apollo (calm, male)'], ['arcas', 'Arcas (soft, male)']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <button type="button" className="btn" onClick={() => void speak('Hello! Let us learn something new today.', 'en')}>Try</button>
              </div>)}</Field>}
            <Field label={prefs.naturalVoice !== false ? 'Device voice (used offline)' : 'English voice'}>{() => voiceRow('en')}</Field>
            {presentation?.teluguAvailable && <Field label="Telugu voice">{() => voiceRow('te')}</Field>}
            <Field label={`${t('volume')}: ${Math.round(prefs.volume * 100)}%`}>{(f) => <input {...f} type="range" min={0} max={1} step={0.1} value={prefs.volume} onChange={(e) => set({ volume: +e.target.value })} />}</Field>
            {presentation?.teluguAvailable && <Field label={t('language')}>{() => <Segmented label={t('language')} value={prefs.language} onChange={(language) => set({ language })} options={[{ value: 'en', label: 'English' }, { value: 'te', label: 'తెలుగు' }]} />}</Field>}
            <p className="muted small" style={{ margin: 0 }}>These are visual-comfort and accessibility preferences. Break reminders are set by a parent.</p>
          </div>
        </Modal>
      )}
    </>
  );
}
