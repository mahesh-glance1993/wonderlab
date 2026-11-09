// UI strings for the games module (Telugu provided for content used by Nursery–Class 3).
import { useCallback } from 'react';
import { useApp } from '../../lib/app';
import { L } from './gen/common';

export const S = {
  library: L('Games and Puzzles', 'ఆటలు మరియు పజిల్స్'),
  greatForClass: L('Great for your class', 'మీ తరగతికి సరైనవి'),
  moreGames: L('More games', 'మరిన్ని ఆటలు'),
  play: L('Play', 'ఆడు'),
  dailyPuzzle: L('Daily puzzle', 'రోజువారీ పజిల్'),
  dailyBody: L('A new puzzle every day, just for you.', 'ప్రతి రోజు మీ కోసం ఒక కొత్త పజిల్.'),
  dailyDone: L('Solved today — come back tomorrow!', 'ఈ రోజు పూర్తయింది — రేపు మళ్ళీ రండి!'),
  dayStreak: L('day streak', 'రోజుల వరుస'),
  badges: L('My badges', 'నా బ్యాడ్జీలు'),
  noBadges: L('Play a game to earn your first badge.', 'మొదటి బ్యాడ్జీ కోసం ఒక ఆట ఆడండి.'),
  badgesPrivate: L('Badges are just for you — no leaderboards.', 'బ్యాడ్జీలు మీ కోసం మాత్రమే.'),
  locked: L('still to earn', 'ఇంకా సంపాదించాలి'),
  classes: L('Classes', 'తరగతులు'),
  roundsPlayed: L('rounds', 'ఆటలు'),
  guided: L('Guided', 'సహాయంతో'),
  regular: L('Regular', 'సాధారణ'),
  challenge: L('Challenge', 'సవాలు'),
  mode: L('Mode', 'విధానం'),
  level: L('Level', 'స్థాయి'),
  streak: L('streak', 'వరుస'),
  hint: L('Hint', 'సూచన'),
  noHintsChallenge: L('No hints in challenge mode', 'సవాలులో సూచనలు లేవు'),
  restart: L('Restart', 'మళ్ళీ మొదలు'),
  newRound: L('New puzzle', 'కొత్త పజిల్'),
  next: L('Next puzzle', 'తదుపరి పజిల్'),
  check: L('Check', 'సరిచూడు'),
  timer: L('Timer', 'టైమర్'),
  timerOff: L('Untimed', 'సమయం లేదు'),
  correct: L('Correct! Well done.', 'సరైనది! బాగా చేశారు.'),
  solvedFirstTry: L('Solved on the first try!', 'మొదటి ప్రయత్నంలోనే!'),
  tryAgain: L('Not quite — try again.', 'సరిగ్గా లేదు — మళ్ళీ ప్రయత్నించండి.'),
  newBadge: L('New badge', 'కొత్త బ్యాడ్జీ'),
  howToPlay: L('How to play', 'ఎలా ఆడాలి'),
  undo: L('Undo', 'వెనక్కి'),
  erase: L('Erase', 'తుడిచివేయి'),
  answer: L('Your answer', 'మీ జవాబు'),
  hintsLabel: L('Hints', 'సూచనలు'),
  dailyTag: L('Today’s puzzle', 'నేటి పజిల్'),
  notFound: L('That game was not found.', 'ఆ ఆట కనబడలేదు.'),
  backToGames: L('Back to games', 'ఆటలకు తిరిగి'),
};

export function useTx() {
  const { lang } = useApp();
  return useCallback((l: L | undefined) => (l ? (lang === 'te' && l.te ? l.te : l.en) : ''), [lang]);
}

export function formatTime(sec: number) {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
