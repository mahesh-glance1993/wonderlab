import { describe, expect, it } from 'vitest';
import { hasPrivateWords, setPrivateWords } from '../src/lib/audio';
import { PRIVACY, TERMS } from '../src/features/legal/content';

describe('learner nicknames never go to the natural-voice service', () => {
  it('detects a nickname as a whole word, any case, in English or Telugu text', () => {
    setPrivateWords(['Chinni', 'Arjun Kumar', 'అను']);
    expect(hasPrivateWords('Hi Chinni!')).toBe(true);
    expect(hasPrivateWords('hi CHINNI, what next?')).toBe(true);
    expect(hasPrivateWords('Well done, Arjun Kumar.')).toBe(true);
    expect(hasPrivateWords('నమస్తే అను!')).toBe(true);
    expect(hasPrivateWords('Arjun ran fast.')).toBe(false); // only the full nickname
    expect(hasPrivateWords('Chinnipalli is a village.')).toBe(false); // not part of another word
    expect(hasPrivateWords('What would you like to do?')).toBe(false);
    setPrivateWords([]);
    expect(hasPrivateWords('Hi Chinni!')).toBe(false);
  });
});

describe('privacy policy and terms', () => {
  const all = [PRIVACY, TERMS].flatMap((d) => [d.title, d.intro, ...d.sections.flatMap((s) => [s.title, ...s.blocks.flatMap((b) => ('list' in b ? b.list : [b]))])]);
  it('has English and Telugu for every paragraph', () => {
    for (const l of all) { expect(l.en.trim()).not.toBe(''); expect(l.te.trim()).not.toBe(''); expect(/[ఀ-౿]/.test(l.te)).toBe(true); }
  });
  it('keeps contact placeholders identical in both languages', () => {
    for (const l of all) for (const ph of l.en.match(/\[[A-Z /]+\]/g) || []) expect(l.te).toContain(ph);
  });
});
