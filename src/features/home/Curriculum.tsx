import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp, useL } from '../../lib/app';
import { Page, Segmented } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { CLASSES, type ClassLevel } from '../../shared/levels';
import type { MasteryState } from '../../shared/mastery';
import { useClassContent } from './useClassContent';
import { DEFAULT_BOARD, boardName, groupEmoji, groupName, subjectGroup, syllabusView, type LearnerBoard } from './subjects';
import './home.css';

export function statusOf(m: MasteryState | undefined): { key: 'mastered' | 'practice' | 'progress' | 'new'; label: string; icon: 'check' | 'alert' | 'clock' | 'sparkle' } {
  if (!m || !m.attempts) return { key: 'new', label: 'Not started', icon: 'sparkle' };
  if (m.masteredAt) return { key: 'mastered', label: 'Mastered', icon: 'check' };
  if (m.attempts >= 3 && m.correct / m.attempts < 0.6) return { key: 'practice', label: 'Needs practice', icon: 'alert' };
  return { key: 'progress', label: 'In progress', icon: 'clock' };
}

/**
 * Curriculum browser for the learner's syllabus (board), one subject tab at a time (same as the apps' Learn screen).
 * Learners can revisit earlier classes or explore harder ones without changing their class.
 */
export default function Curriculum() {
  const { profile, learner, t, presentation, prefs } = useApp();
  const L = useL();
  const [sp, setSp] = useSearchParams();
  const subject = sp.get('subject');
  const [level, setLevel] = useState<ClassLevel>(profile!.classLevel);
  const { content, error } = useClassContent(level);
  const board: LearnerBoard = prefs.board ?? DEFAULT_BOARD;
  const { pool, groups, fallback } = useMemo(() => syllabusView(content?.units || [], board, level), [content, board, level]);
  const wanted = subject ? subjectGroup(subject, board, level) : null;
  // ?subject= may name a subject (math, physics…) or a tab (physical-science); the fallback pool groups by plain subject
  const group = [wanted, subject].find((g) => g && groups.includes(g)) ?? groups[0] ?? null;
  const units = pool.filter((u) => !group || subjectGroup(u.subject, u.board, level) === group);
  const own = profile!.classLevel;
  const opts = [own - 1, own, own + 1].filter((l) => l >= 0 && l <= 12) as ClassLevel[];
  const pick = (g: string) => setSp((p) => { const n = new URLSearchParams(p); n.set('subject', g); return n; }, { replace: true });
  return (
    <Page title={group ? groupName(group) : t('learn')}>
      <div className="page-head">
        <h1>{CLASSES[level].label}</h1>
        <Segmented label="Choose class to browse" value={level} onChange={(v) => setLevel(v)} options={opts.map((l) => ({ value: l, label: l === own ? `${CLASSES[l].label} (mine)` : l < own ? `Revisit ${CLASSES[l].label}` : `Explore ${CLASSES[l].label}` }))} />
        <span className="spacer" />
        {level === own && presentation?.tier !== 'early' && <Link className="btn small" to="/lesson/diagnostic"><Icon name="compass" />Starting check</Link>}
      </div>
      {groups.length > 1 && (
        <div className="subject-tabs" role="group" aria-label="Subjects">
          {groups.map((g) => (
            <button key={g} type="button" className="subject-tab" aria-pressed={g === group} onClick={() => pick(g)}>
              <span aria-hidden="true">{groupEmoji(g)}</span>{groupName(g)}
            </button>
          ))}
        </div>
      )}
      {error && <div className="alert warn" role="alert">{error}</div>}
      {!content && !error && <p role="status">Loading lessons…</p>}
      {content && fallback && <p className="muted small" role="note">{boardName(board)} lessons for {CLASSES[level].label} are being written. Until then you can learn with the NCERT lessons below.</p>}
      {content && !units.length && <p className="muted">No lessons for this subject in {CLASSES[level].label} yet.</p>}
      {units.map((u) => (
        <section className="card unit" key={u.id} aria-labelledby={`u-${u.id}`}>
          <h2 id={`u-${u.id}`}>{L(u.title)}{u.source && <small className="muted" style={{ fontSize: '.8rem' }}>{u.source.book}{u.source.chapterNo ? ` · Ch ${u.source.chapterNo}` : ''}</small>}{!u.source && <span className="pill">Enrichment</span>}</h2>
          {u.objectives.map((o) => {
            const st = statusOf(learner.mastery[o.id]);
            const base = `/lesson/${encodeURIComponent(u.id)}/${encodeURIComponent(o.id)}`;
            return (
              <div className="obj" key={o.id}>
                <span className="name">{L(o.title)}</span>
                <span className={`status ${st.key}`}><Icon name={st.icon} />{st.label}</span>
                <span className="row" style={{ gap: 6 }}>
                  <Link className="btn small" to={`${base}?mode=learn`}>{t('learn')}</Link>
                  <Link className="btn small" to={`${base}?mode=practice`}>{t('practice')}</Link>
                  {presentation?.tier !== 'early' && <Link className="btn small" to={`${base}?mode=test`}>{t('test')}</Link>}
                </span>
              </div>
            );
          })}
        </section>
      ))}
    </Page>
  );
}
