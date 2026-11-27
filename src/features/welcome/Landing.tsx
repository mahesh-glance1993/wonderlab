// Public landing page for visitors who are not signed in (route "/" when signed out, and /welcome).
import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../ui/Icon';
import { C, useWelcomeLang, type WLang } from './copy';
import { WelcomeFooter, WelcomeHeader, WhatsAppShare } from './Shared';
import './welcome.css';

/** A tiny live "what if?" example, the same idea as the formula sliders inside lessons. */
function WhatIfDemo({ lang }: { lang: WLang }) {
  const id = useId();
  const [speed, setSpeed] = useState(40);
  const time = 2;
  const te = lang === 'te';
  return (
    <figure className="card wl-demo" aria-labelledby={`${id}-cap`}>
      <figcaption id={`${id}-cap`} className="wl-demo-cap">{te ? 'ఒకవేళ వేగం మారితే?' : 'What if the speed changes?'}</figcaption>
      <p className="wl-formula" aria-hidden="true">{te ? 'దూరం = వేగం × సమయం' : 'distance = speed × time'}</p>
      <label htmlFor={`${id}-s`} className="wl-demo-label">
        {te ? 'వేగం' : 'Speed'}: <strong>{speed} km/h</strong>
      </label>
      <input id={`${id}-s`} type="range" min={10} max={80} step={5} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="wl-range" />
      <div className="wl-bar" aria-hidden="true"><i style={{ width: `${(speed * time) / 160 * 100}%` }} /></div>
      <p className="wl-demo-out" aria-live="polite">
        {te ? `${time} గంటల్లో ${speed * time} కి.మీ. ప్రయాణం` : `In ${time} hours you travel ${speed * time} km`}
      </p>
    </figure>
  );
}

export default function Landing() {
  const [lang, setLang, tr] = useWelcomeLang();
  useEffect(() => { document.title = lang === 'te' ? 'WonderLab · ఉచితంగా నేర్చుకోండి' : 'WonderLab · Free learning for every child'; }, [lang]);

  return (
    <div className="wl-page" lang={lang}>
      <WelcomeHeader lang={lang} setLang={setLang} tr={tr} />
      <main id="main" tabIndex={-1} className="wl-main">
        <section className="wl-hero" aria-labelledby="wl-hero-title">
          <div className="wl-hero-text">
            <p className="wl-kicker">{tr(C.tagline)}</p>
            <h1 id="wl-hero-title">{tr(C.heroTitle)}</h1>
            <p className="wl-lead">{tr(C.heroSub)}</p>
            <ul className="wl-badges" aria-label={lang === 'te' ? 'ముఖ్యాంశాలు' : 'Highlights'}>
              <li className="pill wl-badge-free"><Icon name="sparkle" />{tr(C.badgeFree)}</li>
              <li className="pill"><Icon name="book" />{tr(C.badgeSyllabus)}</li>
              <li className="pill"><Icon name="shield" />{tr(C.badgeNoAds)}</li>
            </ul>
            <div className="wl-ctas">
              <Link to="/get-app" className="btn primary"><Icon name="download" />{tr(C.getApp)}</Link>
              <Link to="/signup" className="btn">{tr(C.startBrowser)}</Link>
              <WhatsAppShare lang={lang} tr={tr} />
            </div>
          </div>
          <WhatIfDemo lang={lang} />
        </section>

        <section className="wl-section" aria-labelledby="wl-features">
          <h2 id="wl-features">{tr(C.featuresTitle)}</h2>
          <ul className="wl-features">
            {C.features.map((f) => (
              <li key={f.icon} className="card wl-feature">
                <span className="wl-feature-icon" aria-hidden="true"><Icon name={f.icon} /></span>
                <h3>{tr(f.title)}</h3>
                <p className="muted">{tr(f.body)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="wl-section" aria-labelledby="wl-how">
          <h2 id="wl-how">{tr(C.howTitle)}</h2>
          <div className="wl-how">
            <article className="card wl-how-card" aria-labelledby="wl-how-parents">
              <h3 id="wl-how-parents"><Icon name="user" /> {tr(C.parentsTitle)}</h3>
              <ol className="wl-steps">{C.parentsSteps.map((s) => <li key={s.en}>{tr(s)}</li>)}</ol>
              <Link to="/signup" className="btn primary">{tr(C.createAccount)}</Link>
            </article>
            <article className="card wl-how-card" aria-labelledby="wl-how-schools">
              <h3 id="wl-how-schools"><Icon name="grid" /> {tr(C.schoolsTitle)}</h3>
              <ul className="wl-steps wl-bullets">{C.schoolsSteps.map((s) => <li key={s.en}>{tr(s)}</li>)}</ul>
              <Link to="/schools" className="btn">{tr(C.forSchools)}<Icon name="next" /></Link>
            </article>
          </div>
        </section>

        <section className="wl-section card wl-band" aria-labelledby="wl-app">
          <div>
            <h2 id="wl-app">{tr(C.appBandTitle)}</h2>
            <p>{tr(C.appBandBody)}</p>
          </div>
          <div className="wl-ctas">
            <Link to="/get-app" className="btn primary"><Icon name="download" />{tr(C.getApp)}</Link>
            <WhatsAppShare lang={lang} tr={tr} />
          </div>
        </section>
      </main>
      <WelcomeFooter tr={tr} />
    </div>
  );
}
