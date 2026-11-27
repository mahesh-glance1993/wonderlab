// Public /support page: optional UPI support, configured at build time with VITE_SUPPORT_UPI_ID and
// VITE_SUPPORT_NAME. Never hard-code a UPI ID here. When unset, the page shows "coming soon" and
// other ways to help. The QR code is generated locally (src/lib/qr.ts).
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { Button, Page, toast } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { qrSvgPath } from '../../lib/qr';
import { useOutreachLang } from './strings';
import { LangSwitch } from './LangSwitch';
import { upiLink } from '../../lib/upi';
import './outreach.css';

async function copy(text: string, done: string) {
  try { await navigator.clipboard.writeText(text); toast(done); } catch { /* clipboard blocked: the text is visible to copy by hand */ }
}

export default function Support() {
  const { account, profile } = useApp();
  const { lang, s, toggle } = useOutreachLang();
  const upiId = (import.meta.env.VITE_SUPPORT_UPI_ID || '').trim();
  const link = upiLink(upiId, import.meta.env.VITE_SUPPORT_NAME);
  const qr = useMemo(() => (link ? qrSvgPath(link) : null), [link]);
  const share = async () => {
    const url = location.origin + '/';
    if (navigator.share) { try { await navigator.share({ title: 'WonderLab', text: s.shareText, url }); } catch { /* cancelled */ } return; }
    await copy(`${s.shareText} ${url}`, s.pShareCopied);
  };
  return (
    <Page title={s.pTitle} back={account ? '/parent' : profile ? '/' : '/signin'} actions={<LangSwitch label={s.langSwitchLabel} text={s.langSwitch} onClick={toggle} />}>
      <div className="outreach stack" lang={lang}>
        <section className="outreach-hero">
          <h1>{s.pH1}</h1>
          <p className="lead">{s.pIntro}</p>
          <p className="muted">{s.pFree}</p>
        </section>

        {link && qr ? (
          <section className="card outreach-upi" aria-labelledby="upi-h">
            <h2 id="upi-h">{s.pUpiH}</h2>
            <p className="muted small"><Icon name="user" /> {s.pAdult}</p>
            <div className="outreach-upi-body">
              <svg className="outreach-qr" viewBox={`0 0 ${qr.size} ${qr.size}`} role="img" aria-label={`UPI QR code: ${upiId}`} shapeRendering="crispEdges">
                <rect width={qr.size} height={qr.size} fill="#fff" />
                <path d={qr.path} fill="#000" />
              </svg>
              <div className="stack">
                <a className="btn primary" href={link}>{s.pUpiTap}</a>
                <p>{s.pUpiScan}</p>
                <p><span className="muted">{s.pUpiId}: </span><b className="outreach-upi-id">{upiId}</b></p>
                <div><Button small icon="copy" onClick={() => void copy(upiId, s.pCopied)}>{s.pCopy}</Button></div>
              </div>
            </div>
          </section>
        ) : (
          <div className="alert info" role="status"><Icon name="clock" /><span>{s.pSoon}</span></div>
        )}

        <section className="card flat" aria-labelledby="other-h">
          <h2 id="other-h">{s.pOtherH}</h2>
          <ul className="outreach-ways">
            <li><Icon name="globe" /><span>{s.pShare}</span> <Button small onClick={() => void share()}>{s.pShareBtn}</Button></li>
            <li><Icon name="book" /><Link to="/schools">{s.pSchool}</Link></li>
            <li><Icon name="flag" /><span>{s.pReport}</span></li>
          </ul>
        </section>

        <section className="card flat" aria-labelledby="sponsor-h">
          <h2 id="sponsor-h">{s.pSponsorH}</h2>
          <p>{s.pSponsor} <Link to="/schools">{s.pSponsorLink}</Link></p>
        </section>
      </div>
    </Page>
  );
}
