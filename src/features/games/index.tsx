// Games & Puzzles: library at /games, daily puzzle at /games/daily, each game at /games/:gameId.
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { Page } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { BADGES, classRangeLabel, gameById, gamesForClass, type GameId, type GameInfo } from './catalog';
import { MODULES } from './modules';
import { GameShell, readStats } from './Shell';
import { dailyPuzzle } from './gen';
import { L, dateKey, prevDateKey } from './gen/common';
import { S, useTx } from './ui';
import './games.css';

function GameCard({ g, fits }: { g: GameInfo; fits: boolean }) {
  const { learner, lang } = useApp();
  const tx = useTx();
  const st = readStats(learner.activities[`game:${g.id}`]?.state);
  const stars = BADGES.filter((b) => b.id.startsWith(`game:${g.id}:`) && learner.rewards[b.id]).length;
  return (
    <Link to={`/games/${g.id}`} className={`tile gm-tile ${fits ? 'fits' : ''}`}>
      <span className="row" style={{ justifyContent: 'space-between', width: '100%' }}>
        <span className="tile-icon"><Icon name={g.icon} size="lg" /></span>
        {stars > 0 && <span className="pill" aria-label={`${stars} badges`}>{Array.from({ length: stars }, (_, i) => <Icon key={i} name="star" />)}</span>}
      </span>
      <b>{tx(L(g.title, g.titleTe))}</b>
      <small><Icon name="user" /> {tx(S.classes)}: {classRangeLabel(g, lang === 'te')}</small>
      <span className="gm-obj-text">{tx(L(g.objectives, g.objectivesTe))}</span>
      {st && st.rounds > 0 && <small>{st.rounds} {tx(S.roundsPlayed)}</small>}
    </Link>
  );
}

function DailyCard() {
  const { profile, learner } = useApp();
  const tx = useTx();
  if (!profile) return null;
  const today = dateKey();
  const d = dailyPuzzle(today, profile.id, profile.classLevel);
  const g = gameById(d.gameId)!;
  const st = readStats(learner.activities['game:daily']?.state);
  const solvedToday = st?.daily?.lastSolved === today;
  const streak = st?.daily && (st.daily.lastSolved === today || st.daily.lastSolved === prevDateKey(today)) ? st.daily.streak : 0;
  return (
    <Link to="/games/daily" className="tile gm-daily">
      <span className="tile-icon"><Icon name="sun" size="lg" /></span>
      <b>{tx(S.dailyPuzzle)}</b>
      <span>{tx(L(g.title, g.titleTe))}</span>
      <small>{solvedToday ? <><Icon name="check" /> {tx(S.dailyDone)}</> : tx(S.dailyBody)}</small>
      {streak > 0 && <span className="pill"><Icon name="flag" />{streak} {tx(S.dayStreak)}</span>}
    </Link>
  );
}

function Badges() {
  const { learner } = useApp();
  const tx = useTx();
  const earned = BADGES.filter((b) => learner.rewards[b.id]).sort((a, b) => learner.rewards[b.id] - learner.rewards[a.id]);
  return (
    <section className="card flat gm-badges" aria-labelledby="gm-badges-h">
      <h2 id="gm-badges-h"><Icon name="trophy" /> {tx(S.badges)}</h2>
      <p className="muted">{tx(S.badgesPrivate)}</p>
      {earned.length ? (
        <ul className="gm-badge-list">
          {earned.map((b) => <li key={b.id}><Icon name={b.icon} />{tx(L(b.title, b.titleTe))}</li>)}
        </ul>
      ) : <p>{tx(S.noBadges)}</p>}
      <p className="muted">{BADGES.length - earned.length} {tx(S.locked)}</p>
    </section>
  );
}

function Library() {
  const { profile } = useApp();
  const tx = useTx();
  const list = gamesForClass(profile?.classLevel ?? 0);
  const fit = list.filter((x) => x.fits), rest = list.filter((x) => !x.fits);
  return (
    <Page title={tx(S.library)} back="/">
      <div className="stack gm-lib">
        <DailyCard />
        <section aria-labelledby="gm-fit-h">
          <h2 id="gm-fit-h"><Icon name="star" /> {tx(S.greatForClass)}</h2>
          <div className="grid">{fit.map(({ game }) => <GameCard key={game.id} g={game} fits />)}</div>
        </section>
        {rest.length > 0 && (
          <section aria-labelledby="gm-more-h">
            <h2 id="gm-more-h">{tx(S.moreGames)}</h2>
            <div className="grid">{rest.map(({ game }) => <GameCard key={game.id} g={game} fits={false} />)}</div>
          </section>
        )}
        <Badges />
      </div>
    </Page>
  );
}

function GameRoute() {
  const { gameId } = useParams();
  const tx = useTx();
  const g = gameId ? gameById(gameId) : undefined;
  if (!g) return <Page title={tx(S.library)} back="/games"><p>{tx(S.notFound)}</p><Link to="/games">{tx(S.backToGames)}</Link></Page>;
  return <GameShell key={g.id} module={MODULES[g.id as GameId]} storageKey={`game:${g.id}`} />;
}

function DailyRoute() {
  const { profile } = useApp();
  if (!profile) return null;
  const today = dateKey();
  const d = dailyPuzzle(today, profile.id, profile.classLevel);
  return <GameShell key={today} module={MODULES[d.gameId]} storageKey="game:daily" daily={{ date: today, seed: d.seed, level: d.level }} />;
}

export default function Games() {
  return (
    <Routes>
      <Route index element={<Library />} />
      <Route path="daily" element={<DailyRoute />} />
      <Route path=":gameId" element={<GameRoute />} />
    </Routes>
  );
}
