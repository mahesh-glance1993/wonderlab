// Simple on-screen Telugu letter keyboard: అచ్చులు, హల్లులు, గుణింతం signs, పొల్లు.
import { Icon } from '../../ui/Icon';
import { KEYBOARD_ROWS, showSign } from './telugu/script';

const ROW_NAMES = ['అచ్చులు (vowels)', 'హల్లులు (consonants) 1', 'హల్లులు (consonants) 2', 'గుణింతం గుర్తులు (vowel signs)'];

export function TeluguKeyboard({ onKey, onBackspace, onSpace }: { onKey: (k: string) => void; onBackspace: () => void; onSpace: () => void }) {
  return (
    <div className="lang-kbd" role="group" aria-label="Telugu keyboard">
      {KEYBOARD_ROWS.map((row, i) => (
        <div key={i} className="lang-kbd-row" role="group" aria-label={ROW_NAMES[i]}>
          {row.map((k) => (
            <button key={k} type="button" className="lang-key" lang="te" onClick={() => onKey(k)} aria-label={k}>{showSign(k)}</button>
          ))}
        </div>
      ))}
      <div className="lang-kbd-row">
        <button type="button" className="lang-key wide" onClick={onSpace}>Space</button>
        <button type="button" className="lang-key wide" onClick={onBackspace} aria-label="Delete last character"><Icon name="back" /></button>
      </div>
    </div>
  );
}
