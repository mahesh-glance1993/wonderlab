import { Button } from '../../ui/kit';

/** English ⇄ Telugu switch for the public outreach pages. */
export function LangSwitch({ label, text, onClick }: { label: string; text: string; onClick: () => void }) {
  return <Button small type="button" icon="globe" onClick={onClick} aria-label={label} lang={text === 'English' ? 'en' : 'te'}>{text}</Button>;
}
