// /get-app — free ways to install WonderLab: Android APK download (sideload) or Chrome install,
// and iPhone/iPad "Add to Home Screen" from Safari (PWA). The visitor's own platform is shown first.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Icon } from '../../ui/Icon';
import { Button, toast } from '../../ui/kit';
import { inAndroidApp } from '../../lib/fullscreen';
import { canPromptInstall, isStandalone, onInstallChange, promptInstall, wasInstalled } from '../../lib/installPrompt';
import { C, useWelcomeLang, type WLang } from './copy';
import { detectPlatform, formatSize, groupHex, isIosSafari, parseApkInfo, SITE_URL, type ApkInfo, type Platform } from './platform';
import { WelcomeFooter, WelcomeHeader, WhatsAppShare } from './Shared';
import './welcome.css';

type Tr = (s: { en: string; te: string }) => string;

function useApkInfo(): ApkInfo | null | 'loading' {
  const [info, setInfo] = useState<ApkInfo | null | 'loading'>('loading');
  useEffect(() => {
    let live = true;
    fetch('/download/version.json', { cache: 'no-store' })
      .then(async (r) => (r.ok && (r.headers.get('Content-Type') || '').includes('json') ? parseApkInfo(await r.json()) : null))
      .catch(() => null)
      .then((v) => { if (live) setInfo(v); });
    return () => { live = false; };
  }, []);
  return info;
}

function useInstallState() {
  const [, bump] = useState(0);
  useEffect(() => onInstallChange(() => bump((n) => n + 1)), []);
  return { canPrompt: canPromptInstall(), installed: wasInstalled() || isStandalone() };
}

function Section({ id, title, icon, mine, tr, children }: { id: string; title: string; icon: string; mine: boolean; tr: Tr; children: ReactNode }) {
  return (
    <section className={`card wl-platform ${mine ? 'mine' : ''}`} aria-labelledby={id}>
      <div className="wl-platform-head">
        <h2 id={id}><Icon name={icon} /> {title}</h2>
        {mine && <span className="pill wl-badge-free">{tr(C.yourDevice)}</span>}
      </div>
      {children}
    </section>
  );
}

function AndroidSection({ mine, tr }: { mine: boolean; tr: Tr }) {
  const apk = useApkInfo();
  const { canPrompt, installed } = useInstallState();
  const inApp = inAndroidApp();
  const date = apk && apk !== 'loading' ? new Date(apk.date) : null;
  return (
    <Section id="wl-android" title={tr(C.androidTitle)} icon="download" mine={mine} tr={tr}>
      {inApp && <div className="alert good" role="status"><Icon name="check" />{tr(C.inAndroidApp)}</div>}
      {apk === 'loading' && <p className="muted" role="status">{tr(C.checking)}</p>}
      {apk === null && <div className="alert info"><Icon name="info" />{tr(C.apkNotReady)}</div>}
      {apk && apk !== 'loading' && (
        <div className="stack">
          <p>{tr(C.androidWhy)}</p>
          <a className="btn primary wl-big" href={apk.file} download="wonderlab.apk" type="application/vnd.android.package-archive">
            <Icon name="download" />{tr(C.downloadApk)}
          </a>
          <dl className="wl-meta">
            <div><dt>{tr(C.version)}</dt><dd>{apk.versionName}</dd></div>
            <div><dt>{tr(C.size)}</dt><dd>{formatSize(apk.size)}</dd></div>
            {date && !Number.isNaN(date.getTime()) && <div><dt>{tr(C.updated)}</dt><dd>{date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</dd></div>}
            <div className="wl-sha"><dt>{tr(C.sha)}</dt><dd><code>{groupHex(apk.sha256)}</code></dd></div>
            {apk.signerSha256 && <div className="wl-sha"><dt>{tr(C.signer)}</dt><dd><code>{groupHex(apk.signerSha256)}</code></dd></div>}
          </dl>
          <h3>{tr(C.androidStepsTitle)}</h3>
          <ol className="wl-steps">{C.androidSteps.map((s) => <li key={s.en}>{tr(s)}</li>)}</ol>
          <p className="alert warn"><Icon name="shield" /><span>{tr(C.androidSafety)}</span></p>
        </div>
      )}
      <div className="stack wl-pwa">
        <h3>{tr(C.pwaTitle)}</h3>
        {installed ? <div className="alert good" role="status"><Icon name="check" />{tr(C.installed)}</div>
          : canPrompt ? <Button icon="plus" onClick={() => { void promptInstall(); }}>{tr(C.pwaInstall)}</Button>
          : <p className="muted">{tr(C.pwaManual)}</p>}
      </div>
    </Section>
  );
}

/* ---- iOS step pictures: simple shapes drawn here (no Apple artwork) ---- */
const Phone = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 120 200" className="wl-step-pic" aria-hidden="true" focusable="false">
    <rect x="4" y="4" width="112" height="192" rx="18" className="wl-ph-body" />
    <rect x="12" y="20" width="96" height="164" rx="6" className="wl-ph-screen" />
    {children}
  </svg>
);
const Hi = ({ cx, cy, r = 13 }: { cx: number; cy: number; r?: number }) => <circle cx={cx} cy={cy} r={r} className="wl-ph-hi" />;

function IosPic({ step }: { step: number }) {
  if (step === 0) return (
    <Phone>
      <rect x="18" y="26" width="84" height="14" rx="7" className="wl-ph-ui" />
      <circle cx="26" cy="33" r="3" className="wl-ph-ink" />
      <rect x="33" y="31" width="50" height="4" rx="2" className="wl-ph-ink" />
      <image href="/icon.svg" x="42" y="62" width="36" height="36" />
      <rect x="30" y="106" width="60" height="6" rx="3" className="wl-ph-ui" />
      <rect x="36" y="118" width="48" height="5" rx="2.5" className="wl-ph-ui" />
    </Phone>
  );
  if (step === 1) return (
    <Phone>
      <image href="/icon.svg" x="42" y="54" width="36" height="36" opacity=".5" />
      <rect x="12" y="160" width="96" height="24" className="wl-ph-ui" />
      <Hi cx={60} cy={172} />
      <path d="M54 170v8h12v-8M60 175v-13M55.5 166.5 60 162l4.5 4.5" className="wl-ph-stroke" />
    </Phone>
  );
  if (step === 2) return (
    <Phone>
      <rect x="12" y="78" width="96" height="106" rx="10" className="wl-ph-ui" />
      <rect x="20" y="90" width="80" height="16" rx="5" className="wl-ph-row" />
      <rect x="18" y="112" width="84" height="22" rx="6" className="wl-ph-hi-row" />
      <rect x="25" y="117" width="12" height="12" rx="3" className="wl-ph-stroke" />
      <path d="M31 120v6M28 123h6" className="wl-ph-stroke" />
      <text x="42" y="127" className="wl-ph-text">Add to Home Screen</text>
      <rect x="20" y="140" width="80" height="16" rx="5" className="wl-ph-row" />
      <rect x="20" y="162" width="80" height="16" rx="5" className="wl-ph-row" />
    </Phone>
  );
  return (
    <Phone>
      {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => (r === 1 && c === 1 ? null
        : <rect key={`${r}${c}`} x={22 + c * 28} y={34 + r * 34} width="20" height="20" rx="5" className="wl-ph-ui" />)))}
      <Hi cx={60} cy={78} r={17} />
      <image href="/icon.svg" x="50" y="68" width="20" height="20" />
      <text x="60" y="100" textAnchor="middle" className="wl-ph-text">WonderLab</text>
    </Phone>
  );
}

function IosSection({ mine, tr }: { mine: boolean; tr: Tr }) {
  const otherBrowser = mine && !isIosSafari(navigator.userAgent);
  const installed = mine && isStandalone();
  const copy = async () => {
    try { await navigator.clipboard.writeText(`${SITE_URL}/get-app`); toast(tr(C.copied)); } catch { toast(`${SITE_URL}/get-app`); }
  };
  return (
    <Section id="wl-ios" title={tr(C.iosTitle)} icon="plus" mine={mine} tr={tr}>
      {installed && <div className="alert good" role="status"><Icon name="check" />{tr(C.installed)}</div>}
      <p>{tr(C.iosIntro)}</p>
      {otherBrowser && (
        <div className="alert warn"><Icon name="info" /><div className="stack-sm"><span>{tr(C.iosOtherBrowser)}</span>
          <Button small icon="copy" onClick={() => { void copy(); }}>{tr(C.copyLink)}</Button></div></div>
      )}
      <ol className="wl-ios-steps">
        {C.iosSteps.map((s, i) => (
          <li key={s.en}><IosPic step={i} /><span><b className="wl-num" aria-hidden="true">{i + 1}</b>{tr(s)}</span></li>
        ))}
      </ol>
    </Section>
  );
}

function DesktopSection({ mine, tr }: { mine: boolean; tr: Tr }) {
  return (
    <Section id="wl-desktop" title={tr(C.desktopTitle)} icon="globe" mine={mine} tr={tr}>
      <p>{tr(C.desktopBody)}</p>
    </Section>
  );
}

export default function GetApp() {
  const [lang, setLang, tr] = useWelcomeLang();
  const platform: Platform = useMemo(() => detectPlatform(navigator.userAgent, navigator.maxTouchPoints || 0), []);
  useEffect(() => { document.title = `${tr(C.getApp)} · WonderLab`; }, [tr]);

  const sections: Record<Platform, ReactNode> = {
    android: <AndroidSection key="a" mine={platform === 'android'} tr={tr} />,
    ios: <IosSection key="i" mine={platform === 'ios'} tr={tr} />,
    desktop: <DesktopSection key="d" mine={platform === 'desktop'} tr={tr} />,
  };
  const order: Platform[] = platform === 'ios' ? ['ios', 'android', 'desktop'] : platform === 'android' ? ['android', 'ios', 'desktop'] : ['android', 'ios', 'desktop'];

  return (
    <div className="wl-page" lang={lang}>
      <WelcomeHeader lang={lang} setLang={setLang} tr={tr} />
      <main id="main" tabIndex={-1} className="wl-main">
        <div className="wl-section">
          <h1>{tr(C.getApp)}</h1>
          <p className="wl-lead">{tr(C.getAppIntro)}</p>
        </div>
        <div className="wl-platforms">{order.map((p) => sections[p])}</div>
        <ShareBlock lang={lang} tr={tr} />
      </main>
      <WelcomeFooter tr={tr} />
    </div>
  );
}

function ShareBlock({ lang, tr }: { lang: WLang; tr: Tr }) {
  return (
    <section className="wl-section card wl-band" aria-labelledby="wl-share">
      <div>
        <h2 id="wl-share">{tr(C.shareTitle)}</h2>
        <p>{tr(C.shareBody)}</p>
      </div>
      <div className="wl-ctas"><WhatsAppShare lang={lang} tr={tr} /></div>
    </section>
  );
}
