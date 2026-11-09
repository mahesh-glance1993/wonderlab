// Small shared components for the language courses.
import type { ReactNode } from 'react';
import { Icon } from '../../ui/Icon';
import { IconButton } from '../../ui/kit';
import type { CourseId, Script } from './types';

export function GlossToggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button type="button" className="btn small" aria-pressed={on} onClick={() => set(!on)}>
      <Icon name="globe" />{on ? 'Hide English' : 'Show in English'}
    </button>
  );
}

export function VoiceNote({ course, teVoice }: { course: CourseId; teVoice: boolean }) {
  if (course !== 'telugu' || teVoice) return null;
  return <div className="alert info small lang-voice-note"><Icon name="info" />Telugu voice not available on this device — read along with the text.</div>;
}

/** Text in the course script, with the right font and lang attribute. */
export function T({ script, children, className = '' }: { script: Script; children: ReactNode; className?: string }) {
  return <span lang={script === 'te' ? 'te' : 'en'} className={`lang-${script} ${className}`}>{children}</span>;
}

/** English gloss shown under Telugu text when the toggle is on. */
export function Gloss({ show, children }: { show: boolean; children?: ReactNode }) {
  if (!show || !children) return null;
  return <span className="lang-gloss" lang="en">{children}</span>;
}

/** Picture word (emoji in an accessible frame — content picture, not a UI icon). */
export function Pic({ emoji, label, big }: { emoji: string; label: string; big?: boolean }) {
  return <span className={`lang-pic ${big ? 'big' : ''}`} role="img" aria-label={label}>{emoji}</span>;
}

export function SayButton({ text, script, label = 'Listen', say }: { text: string; script: Script; label?: string; say: (t: string, s: Script) => Promise<boolean> }) {
  return <IconButton icon="speaker" label={label} onClick={() => void say(text, script)} />;
}

