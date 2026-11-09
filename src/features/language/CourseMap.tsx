// Course chooser (/lang), course map per class (/lang/:course) and unit page (/lang/:course/:unitId).
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { Icon } from '../../ui/Icon';
import { Meter, Page } from '../../ui/kit';
import { COURSES, PASS, findPassage, findTraceSet, findUnit, isCourse, levelsWithContent, objectiveKey, objectiveState, passed, unitsFor, type ActivityMap } from './engine';
import type { CourseId, Unit } from './types';
import { Gloss, GlossToggle, T } from './common';
import { CLASS_NAMES, scriptOf, useGloss } from './util';
import { NotFound } from './NotFound';

export function LanguageHome() {
  const { profile } = useApp();
  const lvl = profile?.classLevel ?? 0;
  return (
    <Page title="Languages" back="/">
      <div className="lang-wrap stack">
        <div className="page-head"><h1>Languages</h1></div>
        <p className="muted">Learn to read, write and use Telugu and English — {CLASS_NAMES[lvl]} and beyond.</p>
        <div className="grid lang-course-tiles">
          <Link to="/lang/telugu" className="tile lang-tile-te">
            <span className="tile-icon lang-te" aria-hidden="true">అ</span>
            <b lang="te" className="lang-te">తెలుగు</b>
            <small>Telugu — letters, గుణింతాలు, reading, grammar</small>
          </Link>
          <Link to="/lang/english" className="tile lang-tile-en">
            <span className="tile-icon lang-en" aria-hidden="true">Aa</span>
            <b>English</b>
            <small>Phonics, reading, grammar, writing</small>
          </Link>
        </div>
      </div>
    </Page>
  );
}

function objStatus(acts: ActivityMap, course: CourseId, unitId: string, objId: string) {
  const st = objectiveState(acts, objectiveKey(course, unitId, objId));
  return { learned: !!st?.learned, practice: st?.practiceBest, test: st?.testBest, passed: passed(st) };
}

export function UnitCard({ course, unit, gloss, open }: { course: CourseId; unit: Unit; gloss: boolean; open?: boolean }) {
  const { learner } = useApp();
  const script = scriptOf(course);
  const done = unit.objectives.filter((o) => objStatus(learner.activities, course, unit.id, o.id).passed).length;
  return (
    <article className="card stack lang-unit" aria-labelledby={`u-${unit.id}`}>
      <div className="row">
        <h3 id={`u-${unit.id}`} className="lang-unit-title"><Link to={`/lang/${course}/${unit.id}`}><T script={script}>{unit.title}</T></Link></h3>
        <span className="spacer" />
        <span className="pill">{done === unit.objectives.length ? <><Icon name="check" />Complete</> : `${done} of ${unit.objectives.length} passed`}</span>
      </div>
      {script === 'te' && <Gloss show={gloss}>{unit.titleEn}</Gloss>}
      <Meter value={done / unit.objectives.length} label={`${unit.titleEn || unit.title} progress`} />
      <ul className="lang-objs">
        {unit.objectives.map((o) => {
          const st = objStatus(learner.activities, course, unit.id, o.id);
          const base = `/lang/${course}/${unit.id}/${o.id}`;
          return (
            <li key={o.id} className="lang-obj">
              <div className="stack" style={{ gap: 2 }}>
                <span><T script={script}>{o.title}</T>{st.passed && <span className="pill good"><Icon name="check" />Passed</span>}</span>
                {script === 'te' && <Gloss show={gloss}>{o.titleEn}</Gloss>}
                <span className="muted small">
                  {st.learned ? 'Learned · ' : ''}
                  {st.practice != null ? `Practice best ${Math.round(st.practice * 100)}% · ` : ''}
                  {st.test != null ? `Test best ${Math.round(st.test * 100)}%` : ''}
                  {!st.learned && st.practice == null && st.test == null ? 'Not started' : ''}
                </span>
              </div>
              {(open ?? true) && (
                <div className="row lang-obj-links">
                  <Link className="btn small" to={`${base}?mode=learn`}><Icon name="book" />Learn</Link>
                  <Link className="btn small" to={`${base}?mode=practice`}><Icon name="edit" />Practice</Link>
                  <Link className="btn small" to={`${base}?mode=test`}><Icon name="star" />Test</Link>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {(unit.trace?.length || unit.read?.length) ? (
        <div className="row lang-extras">
          {unit.trace?.map((t) => { const s = findTraceSet(t); return s && <Link key={t} className="btn small" to={`/lang/${course}/trace/${t}`}><Icon name="edit" />Trace: <T script={script}>{s.title}</T></Link>; })}
          {unit.read?.map((p) => { const ps = findPassage(p); return ps && <Link key={p} className="btn small" to={`/lang/${course}/read/${p}`}><Icon name="book" />Read along: <T script={script}>{ps.title}</T></Link>; })}
        </div>
      ) : null}
      {unit.badge && <p className="muted small"><Icon name="trophy" /> Badge: {unit.badge.title} — pass every objective ({Math.round(PASS * 100)}%+).</p>}
    </article>
  );
}

export function CourseMap() {
  const { course } = useParams();
  const { profile } = useApp();
  const [sp, setSp] = useSearchParams();
  const [gloss, setGloss] = useGloss();
  if (!isCourse(course)) return <NotFound />;
  const own = profile?.classLevel ?? 0;
  const levels = levelsWithContent(course);
  const q = Number(sp.get('class'));
  const level = Number.isInteger(q) && levels.includes(q as never) && sp.get('class') !== null ? q : own;
  const units = unitsFor(course, level);
  const C = COURSES[course];
  const script = scriptOf(course);
  const setLevel = (l: number) => setSp(l === own ? {} : { class: String(l) });
  return (
    <Page title={C.titleEn} back="/lang" fullscreen>
      <div className="lang-wrap stack">
        <div className="page-head">
          <h1><T script={script}>{C.title}</T>{script === 'te' && <span className="muted"> · Telugu</span>}</h1>
          <span className="spacer" />
          {script === 'te' && <GlossToggle on={gloss} set={setGloss} />}
        </div>
        <nav aria-label="Choose a class" className="lang-classes">
          {levels.map((l) => (
            <button key={l} type="button" className="btn small" aria-pressed={l === level} onClick={() => setLevel(l)}>
              {CLASS_NAMES[l]}{l === own ? ' (my class)' : ''}
            </button>
          ))}
        </nav>
        <div className="row">
          {level > 0 && <button type="button" className="btn small" onClick={() => setLevel(level - 1)}><Icon name="back" />Revisit {CLASS_NAMES[level - 1]}</button>}
          {level < 12 && <button type="button" className="btn small" onClick={() => setLevel(level + 1)}>Explore {CLASS_NAMES[level + 1]}<Icon name="next" /></button>}
        </div>
        <h2>{CLASS_NAMES[level]}{level === own ? ' — your class' : level < own ? ' — revision' : ' — explore ahead'}</h2>
        {units.length === 0 && <p className="muted">No units for this class yet.</p>}
        {units.map((u) => <UnitCard key={u.id} course={course} unit={u} gloss={gloss} />)}
      </div>
    </Page>
  );
}

export function UnitPage() {
  const { course, unitId = '' } = useParams();
  const [gloss, setGloss] = useGloss();
  if (!isCourse(course)) return <NotFound />;
  const unit = findUnit(course, unitId);
  if (!unit) return <NotFound />;
  return (
    <Page title={unit.titleEn || unit.title} back={`/lang/${course}${unit.level !== undefined ? `?class=${unit.level}` : ''}`} fullscreen>
      <div className="lang-wrap stack">
        <div className="page-head"><span className="pill">{CLASS_NAMES[unit.level]}</span><span className="spacer" />{course === 'telugu' && <GlossToggle on={gloss} set={setGloss} />}</div>
        <UnitCard course={course} unit={unit} gloss={gloss} />
      </div>
    </Page>
  );
}
