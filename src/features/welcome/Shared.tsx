// Header, WhatsApp share button and footer shared by the landing and get-the-app pages.
import { Link } from 'react-router-dom';
import { Segmented } from '../../ui/kit';
import { C, type WLang } from './copy';
import { whatsappUrl } from './platform';

type Tr = (s: { en: string; te: string }) => string;

export function WelcomeHeader({ lang, setLang, tr, signIn = true }: { lang: WLang; setLang: (l: WLang) => void; tr: Tr; signIn?: boolean }) {
  return (
    <header className="wl-head">
      <Link to="/welcome" className="wl-brand" aria-label="WonderLab — home">
        <img src="/icon.svg" alt="" width={40} height={40} />
        <span>WonderLab</span>
      </Link>
      <span className="spacer" />
      <Segmented<WLang> label={tr(C.langLabel)} value={lang} onChange={setLang}
        options={[{ value: 'en', label: <span lang="en">English</span> }, { value: 'te', label: <span lang="te">తెలుగు</span> }]} />
      {signIn && <Link to="/signin" className="btn small ghost">{tr(C.signIn)}</Link>}
    </header>
  );
}

/** A plain speech-bubble glyph (not the WhatsApp logo). */
function ChatGlyph() {
  return (
    <svg className="icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false">
      <path d="M12 3.5c-4.7 0-8.5 3.4-8.5 7.6 0 2.2 1 4.1 2.7 5.5L5.5 20.5l4-2.1c.8.2 1.6.3 2.5.3 4.7 0 8.5-3.4 8.5-7.6S16.7 3.5 12 3.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function WhatsAppShare({ lang, tr }: { lang: WLang; tr: Tr }) {
  return (
    <a className="btn wl-wa" href={whatsappUrl(lang)} target="_blank" rel="noopener noreferrer">
      <ChatGlyph />{tr(C.shareWhatsApp)}<span className="sr-only"> {tr(C.opensWhatsApp)}</span>
    </a>
  );
}

export function WelcomeFooter({ tr }: { tr: Tr }) {
  return (
    <footer className="wl-foot">
      <nav aria-label={tr(C.footerNav)}>
        <ul>
          <li><Link to="/get-app">{tr(C.getApp)}</Link></li>
          <li><Link to="/schools">{tr(C.schools)}</Link></li>
          <li><Link to="/privacy">{tr(C.privacy)}</Link></li>
          <li><Link to="/terms">{tr(C.terms)}</Link></li>
          <li><a href="/third-party-notices.txt">{tr(C.notices)}</a></li>
          <li><Link to="/credits">{tr(C.credits)}</Link></li>
          <li><Link to="/signin">{tr(C.signIn)}</Link></li>
        </ul>
      </nav>
      <p className="muted small wl-indep">{tr(C.independent)}</p>
      <p className="muted small">© WonderLab · {tr(C.footerNote)}</p>
    </footer>
  );
}
