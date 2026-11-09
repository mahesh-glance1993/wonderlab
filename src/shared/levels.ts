// Class levels, age bands and presentation tiers shared by app and API.

export type ClassLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ClassInfo {
  level: ClassLevel;
  key: string;
  label: string;
  labelTe: string;
  /** Typical age for this class (used only to suggest an age band). */
  typicalAge: number;
}

export const CLASSES: ClassInfo[] = [
  { level: 0, key: 'nursery', label: 'Nursery', labelTe: 'నర్సరీ', typicalAge: 3 },
  { level: 1, key: 'lkg', label: 'LKG', labelTe: 'ఎల్‌కేజీ', typicalAge: 4 },
  { level: 2, key: 'ukg', label: 'UKG', labelTe: 'యూకేజీ', typicalAge: 5 },
  { level: 3, key: 'c1', label: 'Class 1', labelTe: '1వ తరగతి', typicalAge: 6 },
  { level: 4, key: 'c2', label: 'Class 2', labelTe: '2వ తరగతి', typicalAge: 7 },
  { level: 5, key: 'c3', label: 'Class 3', labelTe: '3వ తరగతి', typicalAge: 8 },
  { level: 6, key: 'c4', label: 'Class 4', labelTe: '4వ తరగతి', typicalAge: 9 },
  { level: 7, key: 'c5', label: 'Class 5', labelTe: '5వ తరగతి', typicalAge: 10 },
  { level: 8, key: 'c6', label: 'Class 6', labelTe: '6వ తరగతి', typicalAge: 11 },
  { level: 9, key: 'c7', label: 'Class 7', labelTe: '7వ తరగతి', typicalAge: 12 },
  { level: 10, key: 'c8', label: 'Class 8', labelTe: '8వ తరగతి', typicalAge: 13 },
  { level: 11, key: 'c9', label: 'Class 9', labelTe: '9వ తరగతి', typicalAge: 14 },
  { level: 12, key: 'c10', label: 'Class 10', labelTe: '10వ తరగతి', typicalAge: 15 },
];

/** Numeric school class (1..10) for a level, or 0 for pre-primary. */
export const schoolClass = (l: ClassLevel): number => (l <= 2 ? 0 : l - 2);
export const levelForSchoolClass = (c: number): ClassLevel => (c + 2) as ClassLevel;

/** Age bands chosen by the parent — no birth date is collected. */
export type AgeBand = '3-4' | '5-6' | '7-8' | '9-10' | '11-12' | '13-14' | '15-16';
export const AGE_BANDS: { id: AgeBand; label: string; labelTe: string }[] = [
  { id: '3-4', label: '3–4 years', labelTe: '3–4 సంవత్సరాలు' },
  { id: '5-6', label: '5–6 years', labelTe: '5–6 సంవత్సరాలు' },
  { id: '7-8', label: '7–8 years', labelTe: '7–8 సంవత్సరాలు' },
  { id: '9-10', label: '9–10 years', labelTe: '9–10 సంవత్సరాలు' },
  { id: '11-12', label: '11–12 years', labelTe: '11–12 సంవత్సరాలు' },
  { id: '13-14', label: '13–14 years', labelTe: '13–14 సంవత్సరాలు' },
  { id: '15-16', label: '15–16 years', labelTe: '15–16 సంవత్సరాలు' },
];
export const suggestAgeBand = (l: ClassLevel): AgeBand => {
  const a = CLASSES[l].typicalAge;
  return a <= 4 ? '3-4' : a <= 6 ? '5-6' : a <= 8 ? '7-8' : a <= 10 ? '9-10' : a <= 12 ? '11-12' : a <= 14 ? '13-14' : '15-16';
};

/**
 * Presentation tier.
 *  early   — Nursery–UKG: icon-led, read-aloud, big targets, no typing
 *  primary — Classes 1–3: more reading, independent practice
 *  middle  — Classes 4–6: structured explanations, interactive models
 *  senior  — Classes 7–10: focused workspace, formulas, units, graphs
 * Class sets the tier; a younger age band can soften it (bigger controls, read-aloud on).
 */
export type Tier = 'early' | 'primary' | 'middle' | 'senior';
export const tierForClass = (l: ClassLevel): Tier => (l <= 2 ? 'early' : l <= 5 ? 'primary' : l <= 8 ? 'middle' : 'senior');

export interface Presentation {
  tier: Tier;
  readAloud: boolean; // narrate instructions automatically
  bigTargets: boolean; // >= 64px controls
  allowTyping: boolean;
  teluguAvailable: boolean; // Telugu UI + narration offered (Nursery–Class 3)
}
export function presentationFor(l: ClassLevel, band: AgeBand): Presentation {
  const tier = tierForClass(l);
  const young = band === '3-4' || band === '5-6';
  return {
    tier,
    readAloud: tier === 'early' || young,
    bigTargets: tier === 'early' || young,
    allowTyping: tier !== 'early',
    teluguAvailable: l <= 5,
  };
}

export const AVATARS = ['owl', 'lion', 'panda', 'rabbit', 'fox', 'frog', 'monkey', 'tiger', 'koala', 'turtle', 'penguin', 'octopus'] as const;
export type Avatar = (typeof AVATARS)[number];
export const AVATAR_EMOJI: Record<Avatar, string> = {
  owl: '🦉', lion: '🦁', panda: '🐼', rabbit: '🐰', fox: '🦊', frog: '🐸', monkey: '🐵', tiger: '🐯', koala: '🐨', turtle: '🐢', penguin: '🐧', octopus: '🐙',
};

/** Security questions deliberately avoid a child's school, address, birthday and similar personal facts. */
export const SECURITY_QUESTIONS = [
  'What was the name of your first pet?',
  'What is your favourite book from your own childhood?',
  'What was your first phone model?',
  'What is the name of a teacher you liked (parent\'s own schooling)?',
  'What is your favourite fruit?',
  'What was your childhood nickname?',
];
