// Public Privacy Policy (/privacy) and Terms of Use (/terms), English and Telugu. The apps open these URLs.
// Text lives in ./content.ts (see the note there: a lawyer must review it before launch).
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { Page, Segmented } from '../../ui/kit';
import { PRIVACY, TERMS, type Block, type L } from './content';
import './legal.css';

type Lang = 'en' | 'te';
const LANG_KEY = 'wl-legal-lang';
const isList = (b: Block): b is { list: L[] } => 'list' in b;

export default function Legal() {
  const { pathname } = useLocation();
  const { account, profile, lang: appLang } = useApp();
  const doc = pathname.startsWith('/terms') ? TERMS : PRIVACY;
  const [lang, setLang] = useState<Lang>(() => {
    try { const v = new URLSearchParams(location.search).get('lang') || localStorage.getItem(LANG_KEY); if (v === 'te' || v === 'en') return v; } catch { /* storage blocked */ }
    return appLang;
  });
  useEffect(() => { try { localStorage.setItem(LANG_KEY, lang); } catch { /* storage blocked */ } }, [lang]);
  const tx = (l: L) => l[lang];
  return (
    <Page title={doc.title.en} back={account ? (profile ? '/' : '/parent') : '/signin'}>
      <article className="legal" lang={lang}>
        <div className="page-head">
          <h1>{tx(doc.title)}</h1>
          <span className="spacer" />
          <Segmented label="Language / భాష" value={lang} onChange={setLang} options={[{ value: 'en', label: 'English' }, { value: 'te', label: 'తెలుగు' }]} />
        </div>
        <p className="muted small">{tx(doc.updated)}</p>
        <p>{tx(doc.intro)}</p>
        <nav aria-label={lang === 'te' ? 'విషయ సూచిక' : 'Contents'} className="card flat legal-toc">
          <ol>{doc.sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{tx(s.title)}</a></li>)}</ol>
        </nav>
        {doc.sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
            <h2 id={`${s.id}-h`}>{tx(s.title)}</h2>
            {s.blocks.map((b, i) => isList(b)
              ? <ul key={i}>{b.list.map((x, j) => <li key={j}>{tx(x)}</li>)}</ul>
              : <p key={i}>{tx(b)}</p>)}
          </section>
        ))}
        <p className="legal-links">
          {doc === PRIVACY ? <Link to="/terms">{tx(TERMS.title)}</Link> : <Link to="/privacy">{tx(PRIVACY.title)}</Link>}
          <Link to="/credits">{lang === 'te' ? 'చిత్ర క్రెడిట్‌లు' : 'Picture credits'}</Link>
        </p>
      </article>
    </Page>
  );
}
