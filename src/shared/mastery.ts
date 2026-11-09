// Mastery, adaptive difficulty and spaced review — identical logic on client (offline) and server.

export interface MasteryState {
  objectiveId: string;
  attempts: number;
  correct: number;
  distinctCorrect: string[]; // distinct question ids answered correctly
  streak: number;
  level: number; // adaptive difficulty 1..3 within the topic
  masteredAt: number | null; // epoch seconds
  nextReviewAt: number | null;
  updatedAt: number;
}

export interface AttemptInput {
  questionId: string;
  correct: boolean;
  hintsUsed: number;
  mode: 'learn' | 'practice' | 'test' | 'game' | 'diagnostic';
  at: number; // epoch seconds
}

export const MASTERY_DISTINCT = 5; // distinct correct questions
export const MASTERY_STREAK = 3; // ... and currently on a streak
const REVIEW_AFTER_MISS = 24 * 3600; // revisit a missed skill the next day
const REVIEW_AFTER_MASTERY = 7 * 24 * 3600;

export const emptyMastery = (objectiveId: string, t = 0): MasteryState => ({
  objectiveId, attempts: 0, correct: 0, distinctCorrect: [], streak: 0, level: 1, masteredAt: null, nextReviewAt: null, updatedAt: t,
});

/** Pure update. Hints reduce the credit for adaptive difficulty but still count as correct. */
export function applyAttempt(m: MasteryState, a: AttemptInput): MasteryState {
  if (a.mode === 'learn') return { ...m, updatedAt: a.at }; // worked examples don't count
  const n: MasteryState = { ...m, distinctCorrect: [...m.distinctCorrect], attempts: m.attempts + 1, updatedAt: a.at };
  if (a.correct) {
    n.correct++;
    n.streak++;
    // question ids are `${templateId}#${seed}` or a static item id, so each id is a distinct question
    if (!n.distinctCorrect.includes(a.questionId)) n.distinctCorrect = [...n.distinctCorrect, a.questionId].slice(-30);
    n.level = Math.min(3, n.level + (a.hintsUsed === 0 ? 0.34 : 0.1));
    if (!n.masteredAt && n.distinctCorrect.length >= MASTERY_DISTINCT && n.streak >= MASTERY_STREAK) {
      n.masteredAt = a.at;
      n.nextReviewAt = a.at + REVIEW_AFTER_MASTERY;
    } else if (n.nextReviewAt && n.nextReviewAt <= a.at && n.streak >= 2) {
      n.nextReviewAt = n.masteredAt ? a.at + REVIEW_AFTER_MASTERY : null; // review done
    }
  } else {
    n.streak = 0;
    n.level = Math.max(1, n.level - 0.34);
    n.nextReviewAt = a.at + REVIEW_AFTER_MISS;
  }
  return n;
}

export const difficultyFor = (m: MasteryState | undefined): 1 | 2 | 3 => (!m ? 1 : (Math.max(1, Math.min(3, Math.floor(m.level))) as 1 | 2 | 3));
export const isMastered = (m: MasteryState | undefined) => !!m?.masteredAt;
