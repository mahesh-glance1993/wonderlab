// Encouragement like a warm teacher (same wording as the apps — android/.../core/design/Cheer.kt): varied praise
// for correct answers, streak shout-outs (3 / 5 / 10 in a row), wins, and kind "let's look again" messages.
import type { Tier } from '../shared/levels';

let streak = 0;
/** Correct answers in a row in this session (reset on a miss). */
export const cheerStreak = () => streak;

const early = ['Yay! Well done!', 'Super! You got it!', 'Wow, clever you!', "Hooray! That's right!", 'Great job, superstar!', 'Yes! Clap clap!'];
const primary = ['Well done!', 'Excellent!', 'Brilliant work!', 'You got it!', 'Keep it up!', 'Spot on!', 'Fantastic thinking!', "That's exactly right!"];
const senior = ['Well done!', 'Excellent work!', 'Spot on!', 'Nailed it!', 'Keep it up!', 'Sharp thinking!', 'Exactly right — great reasoning!', 'Perfect!'];
const withHint = ['Well done — the hint helped and you got there!', 'Nice! Next time try it without a hint.', 'You figured it out — keep going!'];
const tryEarly = ["Oops! Let's try again together.", 'Almost! You can do it!', 'Good try! Look again.'];
const tryPrimary = ["Not quite — good try! Let's see why.", 'Almost there! Check the steps below.', "Mistakes help us learn. Let's look again."];
const trySenior = ["Not quite — let's see where it went wrong.", 'Close! Check the solution and spot the difference.', 'Every mistake is practice. Look at the worked steps.'];

const pick = (l: string[]) => l[Math.floor(Math.random() * l.length)];
const byTier = (tier: Tier | string | undefined, e: string[], p: string[], s: string[]) => (tier === 'early' ? e : tier === 'senior' ? s : p);

/** Message for a correct answer (also counts the streak). */
export function cheerCorrect(tier: Tier | string | undefined, usedHints: boolean): string {
  streak++;
  const base = usedHints ? pick(withHint) : pick(byTier(tier, early, primary, senior));
  const bonus = streak === 3 ? ' 3 in a row! 🔥'
    : streak === 5 ? " 5 in a row — you're on fire! 🔥"
      : streak === 10 ? " 10 in a row! You're a champion! 🏆"
        : streak > 10 && streak % 5 === 0 ? ` ${streak} in a row — unstoppable! 🏆` : '';
  return base + bonus;
}

/** Message for a wrong answer (resets the streak). */
export function cheerTryAgain(tier: Tier | string | undefined): string {
  streak = 0;
  return pick(byTier(tier, tryEarly, tryPrimary, trySenior));
}

export const cheerWon = (tier: Tier | string | undefined) => (tier === 'early' ? 'You won! Hooray! 🎉' : pick(['You won! 🏆', 'Victory! Well played! 🏆', 'You won — brilliant game! 🏆']));
export const cheerLessonDone = () => pick(['Lesson complete — well done! Keep it up!', 'You finished the lesson! Brilliant!', 'All done! Your hard work is paying off.']);
/** The words without the emoji, for reading aloud. */
export const cheerSpeech = (s: string) => s.replace(/[\u{1F525}\u{1F3C6}\u{1F389}]/gu, '').replace(/\s+/g, ' ').trim();
