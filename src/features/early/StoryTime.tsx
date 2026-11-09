// Story Time: interactive picture stories with read-aloud, karaoke highlight, tap moments and picture questions.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { onSpeaking, tone } from '../../lib/audio';
import { celebrate, Page } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { ART, Art, Backdrop } from './art';
import { PIC, L } from './data/pictures';
import { PROP_NAMES, STORIES, STORY, wordsOf, wordTimings, type Actor, type Story, type StoryPage } from './data/stories';
import { BigTile, EarlyFeedback, PicButton, Prompt, RoundDots, SayButton, UI, useActivity, useBadge, useLastActivity, useNarrate, useRecord, useTx, type PickState } from './common';

interface StoriesState { pages: Record<string, number>; done: string[] }
const INIT: StoriesState = { pages: {}, done: [] };
const NUM_WORDS: L[] = [L('zero', 'సున్నా'), L('one', 'ఒకటి'), L('two', 'రెండు'), L('three', 'మూడు'), L('four', 'నాలుగు'), L('five', 'ఐదు'), L('six', 'ఆరు')];
const reduceMotion = () => document.documentElement.classList.contains('reduce-motion');

export function StoryList() {
  const { tx } = useTx();
  const nav = useNavigate();
  const [st] = useActivity<StoriesState>('stories', INIT);
  useLastActivity('/play/stories', UI.stories);
  return (
    <Page title={tx(UI.stories)} back="/play" fullscreen>
      <Prompt l={L('Pick a story!', 'ఒక కథ ఎంచుకో!')} />
      <div className="el-grid">
        {STORIES.map((s) => {
          const p = st.pages[s.id];
          const sub = st.done.includes(s.id) ? '✓' : p ? `${Math.min(p + 1, s.pages.length)} / ${s.pages.length}` : undefined;
          return <BigTile key={s.id} art={s.cover} title={s.title} sub={sub} onGo={() => nav(`/play/stories/${s.id}`)} />;
        })}
      </div>
    </Page>
  );
}

export function StoryReader() {
  const { storyId = '' } = useParams();
  const story = STORY[storyId];
  const nav = useNavigate();
  useEffect(() => { if (!story) nav('/play/stories', { replace: true }); }, [story, nav]);
  if (!story) return null;
  return <Reader key={story.id} story={story} />;
}

function Reader({ story }: { story: Story }) {
  const { tx, say, lang } = useTx();
  const nav = useNavigate();
  const badge = useBadge();
  const [st, save] = useActivity<StoriesState>('stories', INIT);
  useLastActivity(`/play/stories/${story.id}`, story.title);
  const n = story.pages.length;
  const [page, setPage] = useState(() => { const p = st.pages[story.id] ?? 0; return p >= n + story.questions.length || p < 0 ? 0 : Math.min(p, n); });
  const [finished, setFinished] = useState(false);

  const go = (p: number) => {
    tone('tap');
    setPage(p);
    save((s) => ({ pages: { ...s.pages, [story.id]: p } }));
  };
  const finish = async () => {
    setFinished(true);
    celebrate();
    say(L(`The end! You finished “${story.title.en}”.`, `కథ అయిపోయింది! “${story.title.te}” పూర్తి చేశావు.`));
    const done = [...new Set([...st.done, story.id])];
    save((s) => ({ done, pages: { ...s.pages, [story.id]: 0 } }));
    await badge(`play:story:${story.id}`, story.title);
    if (done.length >= 1) await badge('play:first-story');
    if (done.length >= 5) await badge('play:5-stories');
  };

  return (
    <Page title={tx(story.title)} back="/play/stories" fullscreen>
      {finished ? (
        <div className="el-done" role="status">
          <div className="el-done-star" aria-hidden="true"><Icon name="trophy" size="lg" /></div>
          <h2>{tx(L('The end!', 'కథ అయిపోయింది!'))}</h2>
          <div className="el-hero small"><Art id={story.cover} label={tx(story.title)} /></div>
          <div className="el-row">
            <button type="button" className="btn primary el-big" onClick={() => { setFinished(false); go(0); }}><Icon name="reset" />{tx(L('Read again', 'మళ్ళీ చదువు'))}</button>
            <button type="button" className="btn el-big" onClick={() => nav('/play/stories')}><Icon name="book" />{tx(L('More stories', 'ఇంకా కథలు'))}</button>
          </div>
        </div>
      ) : page < n ? (
        <StoryPageView key={`${page}-${lang}`} page={story.pages[page]} index={page} total={n}
          onBack={page > 0 ? () => go(page - 1) : undefined} onNext={() => go(page + 1)} />
      ) : (
        <Questions story={story} onBack={() => go(n - 1)} onDone={() => void finish()} />
      )}
    </Page>
  );
}

/** Karaoke: highlight the word being read while narration of `text` plays (off in reduced motion). */
function useKaraoke(text: string) {
  const [word, setWord] = useState(-1);
  const expect = useRef(false);
  const timers = useRef<number[]>([]);
  const clear = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; };
  useEffect(() => onSpeaking((on) => {
    clear();
    if (on && expect.current && !reduceMotion()) {
      expect.current = false;
      let at = 0;
      wordTimings(text).forEach((ms, i) => { timers.current.push(window.setTimeout(() => setWord(i), at)); at += ms; });
      timers.current.push(window.setTimeout(() => setWord(-1), at + 200));
    } else { expect.current = false; setWord(-1); }
  }), [text]);
  useEffect(() => () => clear(), []);
  return { word, arm: () => { expect.current = true; } };
}

interface PlayState { shown: string[]; hidden: string[]; v: Record<string, string>; moved: Record<string, { dx: number; dy: number }>; counted: string[]; done: boolean; react?: { id: string; n: number } }

function StoryPageView({ page, index, total, onBack, onNext }: { page: StoryPage; index: number; total: number; onBack?: () => void; onNext: () => void }) {
  const { tx, say } = useTx();
  const text = tx(page.text);
  const { word, arm } = useKaraoke(text);
  const [ps, setPs] = useState<PlayState>({ shown: [], hidden: [], v: {}, moved: {}, counted: [], done: false });
  const [bubble, setBubble] = useState<string | null>(null);
  const read = () => { arm(); say(page.text); };
  useEffect(() => { const id = window.setTimeout(read, 300); return () => window.clearTimeout(id); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const act = page.act;
  const visible = (a: Actor) => (a.hidden ? ps.shown.includes(a.id) : !ps.hidden.includes(a.id));
  const tappable = useMemo(() => new Set(act ? (act.kind === 'tap' ? [act.actor] : act.actors) : []), [act]);
  const nameOf = (a: Actor) => tx(PROP_NAMES[a.id] || PIC[a.art] || PROP_NAMES[a.art] || L(a.art, a.art));

  const tapActor = (a: Actor) => {
    if (!act) return;
    tone('tap');
    if (act.kind === 'tap') {
      setPs((s) => ({
        ...s, done: true, react: act.react ? { id: a.id, n: (s.react?.n ?? 0) + 1 } : undefined,
        shown: [...new Set([...s.shown, ...(act.show || [])])], hidden: [...new Set([...s.hidden, ...(act.hide || [])])],
        v: { ...s.v, ...(act.set || {}) }, moved: act.move ? { ...s.moved, [act.move.actor]: { dx: act.move.dx, dy: act.move.dy } } : s.moved,
      }));
      say(act.say); setBubble(tx(act.say));
      return;
    }
    if (ps.counted.includes(a.id)) { say(NUM_WORDS[ps.counted.indexOf(a.id) + 1] || L(String(ps.counted.indexOf(a.id) + 1), '')); return; }
    const counted = [...ps.counted, a.id];
    const all = counted.length === act.actors.length;
    setPs((s) => ({
      ...s, counted, done: all,
      hidden: act.each === 'hide' ? [...s.hidden, a.id] : s.hidden,
      v: { ...s.v, ...(act.each === 'set' && act.eachV ? { [a.id]: act.eachV } : {}), ...(act.level ? { [act.level]: String(counted.length + 1) } : {}) },
      shown: all && act.show ? [...s.shown, ...act.show] : s.shown,
    }));
    if (all) { say(act.say); setBubble(tx(act.say)); }
    else say(NUM_WORDS[counted.length] || L(String(counted.length), String(counted.length)));
  };

  return (
    <div className="el-story">
      <RoundDots done={index} total={total} />
      <div className="el-stage">
        <svg viewBox="0 0 400 260" role="img" aria-label={text}>
          <Backdrop bg={page.bg} />
          {page.actors.map((a) => {
            const m = ps.moved[a.id] || { dx: 0, dy: 0 };
            const show = visible(a);
            const reacting = ps.react?.id === a.id ? `el-react-${act && act.kind === 'tap' ? act.react : ''} k${ps.react.n % 2}` : '';
            return (
              <g key={a.id} className="el-actor" style={{ transform: `translate(${a.x + m.dx}px, ${a.y + m.dy}px)`, opacity: show ? 1 : 0 }}>
                <g className={`el-react ${reacting}`}>
                  <g transform={`scale(${(a.s ?? 1) * 0.8 * (a.flip ? -1 : 1)} ${(a.s ?? 1) * 0.8})`}>{(ART[a.art] ?? ART.star)(ps.v[a.id] ?? a.v)}</g>
                </g>
              </g>
            );
          })}
        </svg>
        {page.actors.filter((a) => tappable.has(a.id) && visible(a)).map((a) => {
          const m = ps.moved[a.id] || { dx: 0, dy: 0 };
          const size = 80 * (a.s ?? 1) * 0.9;
          const ci = ps.counted.indexOf(a.id);
          return (
            <button key={a.id} type="button" className={`el-hot ${ci >= 0 ? 'is-counted' : ''}`} onClick={() => tapActor(a)}
              style={{ left: `${((a.x + m.dx) / 400) * 100}%`, top: `${((a.y + m.dy) / 260) * 100}%`, width: `max(64px, ${(size / 400) * 100}%)`, aspectRatio: '1' }}
              aria-label={`${nameOf(a)}${ci >= 0 ? ` ${ci + 1}` : ''}`}>
              {ci >= 0 && act?.kind === 'count' && act.each !== 'hide' && <span className="el-count" aria-hidden="true">{ci + 1}</span>}
            </button>
          );
        })}
        {bubble && <div className="el-bubble" role="status" aria-live="polite">{bubble}</div>}
      </div>
      <div className="el-text">
        <SayButton l={page.text} />
        <p lang={tx(L('en', 'te'))}>
          {wordsOf(text).map((w, i) => <span key={i} className={i === word ? 'el-word-on' : undefined}>{w}{' '}</span>)}
        </p>
        <button type="button" className="btn el-say" onClick={read} aria-label={tx(L('Read to me', 'చదివి వినిపించు'))}><Icon name="book" /></button>
      </div>
      {act && !ps.done && (
        <p className="el-hint"><Icon name="hand" />{tx(act.prompt)}{act.kind === 'count' && ps.counted.length > 0 ? ` (${ps.counted.length})` : ''}</p>
      )}
      <div className="el-nav">
        <button type="button" className="btn el-big" onClick={onBack} disabled={!onBack} aria-label={tx(UI.back)}><Icon name="prev" />{tx(UI.back)}</button>
        <button type="button" className={`btn el-big ${!act || ps.done ? 'primary' : ''}`} onClick={onNext} aria-label={tx(UI.next)}>{tx(UI.next)}<Icon name="next" /></button>
      </div>
    </div>
  );
}

function choiceLabel(c: string, labels?: Record<string, L>): L {
  if (labels?.[c]) return labels[c];
  if (c.startsWith('num:')) { const k = Number(c.slice(4)); return L(`${k} (${NUM_WORDS[k]?.en ?? k})`, `${k} (${NUM_WORDS[k]?.te ?? k})`); }
  return PIC[c] || PROP_NAMES[c] || L(c, c);
}

function Questions({ story, onBack, onDone }: { story: Story; onBack: () => void; onDone: () => void }) {
  const { tx, say } = useTx();
  const record = useRecord('stories');
  const [qi, setQi] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const q = story.questions[qi];
  useNarrate(q.q, qi);
  const pick = (c: string) => {
    if (solved) return;
    const ok = c === q.answer;
    record(`${story.id}:q${qi}`, ok, wrong.length >= 2 ? 1 : 0);
    if (ok) { setSolved(true); say(L(`${UI.wellDone.en} ${choiceLabel(c, q.labels).en}!`, `${UI.wellDone.te} ${choiceLabel(c, q.labels).te}!`)); }
    else { setWrong((w) => [...w, c]); say(UI.tryAgain); }
  };
  const stateOf = (c: string): PickState => (solved && c === q.answer ? 'right' : wrong.includes(c) ? 'wrong' : wrong.length >= 2 && c === q.answer ? 'hint' : undefined);
  const next = () => { if (qi + 1 >= story.questions.length) onDone(); else { setQi(qi + 1); setWrong([]); setSolved(false); } };
  return (
    <div className="el-play">
      <RoundDots done={qi} total={story.questions.length} />
      <Prompt l={q.q} />
      <div className={`el-choices n${q.choices.length}`}>
        {q.choices.map((c) => {
          const lab = choiceLabel(c, q.labels);
          return (
            <div key={c} className="el-choice-wrap">
              <PicButton art={c} label={tx(lab)} onPick={() => pick(c)} state={stateOf(c)} disabled={solved || stateOf(c) === 'wrong'} showLabel />
              <SayButton l={lab} />
            </div>
          );
        })}
      </div>
      {(solved || wrong.length > 0) && <EarlyFeedback ok={solved} tries={wrong.length} />}
      <div className="el-nav">
        <button type="button" className="btn el-big" onClick={qi === 0 ? onBack : () => { setQi(qi - 1); setWrong([]); setSolved(false); }}><Icon name="prev" />{tx(UI.back)}</button>
        <button type="button" className={`btn el-big ${solved ? 'primary' : ''}`} onClick={next} disabled={!solved}>{tx(UI.next)}<Icon name="next" /></button>
      </div>
    </div>
  );
}
