import { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { useApp } from '../../lib/app';
import './lab.css';

interface Material {
  id: string;
  name: string;
  n: number;
  badge: string;
  description: string;
}

const MATERIALS: Material[] = [
  { id: 'crown', name: 'Crown Glass', n: 1.52, badge: 'Standard Optics', description: 'Clear optical glass with balanced refraction.' },
  { id: 'flint', name: 'Flint Glass', n: 1.66, badge: 'High Dispersion', description: 'Dense glass that spreads colors out wide.' },
  { id: 'water', name: 'Water Chamber', n: 1.33, badge: 'Soft Dispersion', description: 'Liquid prism with gentle bending.' },
  { id: 'diamond', name: 'Cut Diamond', n: 2.42, badge: 'Sparkle & TIR', description: 'Extremely dense crystal that can trap light!' },
];

export default function PrismLab() {
  const { lang, speak } = useApp();
  const [angle, setAngle] = useState(45);
  const [selectedMat, setSelectedMat] = useState<Material>(MATERIALS[0]);
  const [monochromatic, setMonochromatic] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const sliderId = useId();

  // Optical physics calculations (Snell's Law & Cauchy dispersion approximation)
  const rad = angle * (Math.PI / 180);
  const refractiveIndex = selectedMat.n;

  // Entry face Snell's law: sin(r1) = sin(i) / n
  const sinR1 = Math.sin(rad) / refractiveIndex;
  const r1 = Math.asin(Math.min(1, Math.max(-1, sinR1)));
  const prismAngleA = 60 * (Math.PI / 180); // 60° equilateral prism
  const r2 = prismAngleA - r1;

  // Check Total Internal Reflection (TIR) on exit surface: sin(crit) = 1 / n
  const sinCrit = 1 / refractiveIndex;
  const isTIR = Math.sin(r2) > sinCrit;

  // Exit angle
  const sinE = refractiveIndex * Math.sin(r2);
  const e = isTIR ? 0 : Math.asin(Math.min(1, Math.max(-1, sinE)));
  const devAngleDeg = isTIR ? 90 : Math.max(10, Math.min(85, angle + (e * 180 / Math.PI) - 60));
  const clampedDev = devAngleDeg.toFixed(1);

  // Cauchy dispersion spread: Red ~ n - 0.02, Violet ~ n + 0.035
  const nRed = refractiveIndex - 0.02;
  const nViolet = refractiveIndex + 0.035;
  const spreadVal = ((nViolet - nRed) * 35).toFixed(1);

  // Speed of light in medium: v = c / n
  const speedInMedium = (3.0 / refractiveIndex).toFixed(2);

  // Geometry calculations for SVG
  const entryX = 345;
  const entryY = 242;
  const emitterDist = 220;
  const rayAngleRad = (angle - 45) * 0.02;
  const startX = entryX - Math.cos(rayAngleRad) * emitterDist;
  const startY = entryY - Math.sin((angle - 45) * (Math.PI / 180) * 0.8) * 140;

  // Exit ray coordinates
  const devFactor = (Number(clampedDev) - 38) * 1.8;
  const rY = Math.max(150, 185 + devFactor);
  const vY = Math.min(320, 288 + devFactor + parseFloat(spreadVal) * 4);
  const midY = (rY + vY) / 2;

  const handleReset = () => {
    setAngle(45);
    setSelectedMat(MATERIALS[0]);
    setMonochromatic(false);
  };

  const handleTIRChallenge = () => {
    setSelectedMat(MATERIALS[3]); // Diamond
    setAngle(65);
  };

  const whyExplanation = lang === 'te'
    ? 'తెల్లని కాంతి గాజు ప్రిజమ్‌లోకి ప్రవేశించినప్పుడు, దానిలోని ఏడు రంగుల వేగాలు తగ్గుతాయి. ఊదా (వయోలెట్) రంగు ఎక్కువ వంగిపోతుంది, ఎరుపు రంగు తక్కువ వంగుతుంది. అందువల్ల ఇంద్రధనుస్సు రంగులు విడిపోతాయి!'
    : 'Inside empty space, all light travels at 300,000 km/s. But entering glass, light slows down! Shorter wavelengths (Violet) interact strongly with glass atoms and bend steeply, while longer wavelengths (Red) bend gently, spreading into VIBGYOR colors!';

  return (
    <Page title="Ray of Light & Glass Prism" hideTopBar wide>
      <div className="prism-workspace">
        {/* Navigation Breadcrumb */}
        <div className="next-nav-bar">
          <Link to="/lab" className="next-breadcrumb-btn" aria-label="Back to Physics Lab">
            <Icon name="back" />
            <span>Physics Lab</span>
          </Link>
          <span className="next-nav-divider">/</span>
          <span className="next-nav-current">Ray of Light &amp; Glass Prism</span>
        </div>

        {/* Experiment Context Header Bar */}
        <section className="prism-context-bar" aria-label="Experiment Context">
          <div className="prism-context-left">
            <div className="prism-badge-icon" aria-hidden="true">
              <Icon name="sparkle" />
            </div>
            <div className="prism-context-info">
              <div className="prism-tags">
                <span className="prism-tag-primary">Optics & Wave Lab</span>
                <span className="prism-tag-sub">Class 5–7 NCERT / Telangana Module</span>
              </div>
              <h1 className="prism-context-title">Ray of Light &amp; Glass Prism</h1>
            </div>
          </div>

          <div className="prism-context-actions">
            <button
              type="button"
              className="btn small"
              onClick={() => speak(whyExplanation)}
              title="Listen to narration"
            >
              <Icon name="speaker" />
              <span>Audio: "Why?"</span>
            </button>
            <button
              type="button"
              className="btn small"
              onClick={handleReset}
              title="Reset parameters"
            >
              <Icon name="reset" />
              <span>Reset</span>
            </button>
          </div>
        </section>

        {/* Main Grid: Simulation Stage (Left) & Controls (Right) */}
        <div className="prism-grid">
          {/* Simulation Stage Card */}
          <div className="prism-stage-col">
            <div className="prism-stage-card">
              {/* Stage Top HUD */}
              <div className="prism-stage-hud">
                <div className="prism-hud-left">
                  <span className="prism-chamber-indicator">
                    <span className="prism-dot" aria-hidden="true" />
                    <span>Optical Chamber</span>
                  </span>
                  <span className="prism-hud-divider">|</span>
                  <span className={`prism-mode-badge ${monochromatic ? 'mono' : 'poly'}`}>
                    {monochromatic ? 'Monochromatic (532nm Green)' : 'Polychromatic (White VIBGYOR)'}
                  </span>
                </div>
                <div className="prism-hud-right">
                  <span>Medium:</span>
                  <b>{selectedMat.name}</b>
                  <span className="prism-index-val">(n = {selectedMat.n})</span>
                </div>
              </div>

              {/* Dynamic SVG Optical Simulation Stage */}
              <div className="prism-svg-wrapper">
                <svg
                  className="prism-svg"
                  viewBox="0 0 800 480"
                  preserveAspectRatio="xMidYMid meet"
                  role="img"
                  aria-label={`Optical prism simulation showing light beam at ${angle} degrees entering ${selectedMat.name}`}
                >
                  <defs>
                    <filter id="prism-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="prism-glass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                      <stop offset="40%" stopColor="#86f2e4" stopOpacity="0.10" />
                      <stop offset="100%" stopColor="#3e35b5" stopOpacity="0.25" />
                    </linearGradient>
                  </defs>

                  {/* Alignment Grid Overlay */}
                  <g opacity="0.08" stroke="#b6b3ff" strokeWidth="0.8">
                    {[...Array(13)].map((_, i) => (
                      <line key={`gx-${i}`} x1={i * 65} y1="0" x2={i * 65} y2="480" />
                    ))}
                    {[...Array(8)].map((_, i) => (
                      <line key={`gy-${i}`} x1="0" y1={i * 65} x2="800" y2={i * 65} />
                    ))}
                  </g>

                  {/* Central Triangular Glass Prism */}
                  <polygon
                    points="410,130 280,355 540,355"
                    fill="url(#prism-glass-grad)"
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth="2.5"
                  />
                  <line x1="410" y1="130" x2="410" y2="355" stroke="rgba(255,255,255,0.08)" strokeDasharray="4,4" />

                  {/* Entry Face Normal (N1) */}
                  {showLabels && (
                    <>
                      <line x1="260" y1="193" x2="430" y2="291" stroke="#ffb77d" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.75" />
                      <text x="250" y="190" fill="#ffdcc3" fontSize="11" fontWeight="600">Normal (N₁)</text>
                    </>
                  )}

                  {/* Incident Ray */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={entryX}
                    y2={entryY}
                    stroke="#ffffff"
                    strokeWidth="6"
                    opacity="0.3"
                    filter="url(#prism-glow)"
                  />
                  <line
                    x1={startX}
                    y1={startY}
                    x2={entryX}
                    y2={entryY}
                    stroke={monochromatic ? '#2ed573' : '#ffffff'}
                    strokeWidth="3"
                    filter="url(#prism-glow)"
                  />

                  {/* Incidence Angle Arc & Label */}
                  {showLabels && (
                    <>
                      <text x="270" y="235" fill="#ffdcc3" fontSize="13" fontWeight="700">θᵢ = {angle}°</text>
                    </>
                  )}

                  {/* Refracted Light Paths Inside Prism */}
                  {isTIR ? (
                    // Total internal reflection (reflected downwards)
                    <g opacity="0.9">
                      <line x1={entryX} y1={entryY} x2="420" y2="340" stroke="#ffb77d" strokeWidth="2.5" />
                      <line x1="420" y1="340" x2="435" y2="440" stroke="#ff7675" strokeWidth="2" strokeDasharray="4,4" />
                    </g>
                  ) : monochromatic ? (
                    <line x1={entryX} y1={entryY} x2="472" y2="241" stroke="#2ed573" strokeWidth="2.5" />
                  ) : (
                    <g id="refracted-bundle-inside">
                      <line x1={entryX} y1={entryY} x2="470" y2="235" stroke="#ff5555" strokeWidth="2.2" opacity="0.95" />
                      <line x1={entryX} y1={entryY} x2="472" y2="241" stroke="#55ff99" strokeWidth="2.0" opacity="0.85" />
                      <line x1={entryX} y1={entryY} x2="475" y2="249" stroke="#b677ff" strokeWidth="2.2" opacity="0.95" />
                    </g>
                  )}

                  {/* Exit Face Normal (N2) */}
                  {showLabels && !isTIR && (
                    <>
                      <line x1="390" y1="195" x2="555" y2="295" stroke="#ffb77d" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
                      <text x="560" y="305" fill="#ffdcc3" fontSize="11" fontWeight="600">Normal (N₂)</text>
                    </>
                  )}

                  {/* Emerging Dispersed Spectrum Rays */}
                  {!isTIR && (
                    monochromatic ? (
                      <line x1="472" y1="241" x2="740" y2={midY} stroke="#2ed573" strokeWidth="3" filter="url(#prism-glow)" />
                    ) : (
                      <g id="spectrum-rays">
                        <line x1="470" y1="235" x2="740" y2={rY} stroke="#ff4757" strokeWidth="3" filter="url(#prism-glow)" />
                        <line x1="471" y1="237" x2="740" y2={rY + (vY - rY) * 0.16} stroke="#ffa502" strokeWidth="2.5" opacity="0.95" />
                        <line x1="472" y1="239" x2="740" y2={rY + (vY - rY) * 0.33} stroke="#eccc68" strokeWidth="2.5" opacity="0.95" />
                        <line x1="473" y1="241" x2="740" y2={midY} stroke="#2ed573" strokeWidth="2.5" opacity="0.95" />
                        <line x1="474" y1="244" x2="740" y2={rY + (vY - rY) * 0.66} stroke="#1e90ff" strokeWidth="2.5" opacity="0.95" />
                        <line x1="474" y1="246" x2="740" y2={rY + (vY - rY) * 0.83} stroke="#5352ed" strokeWidth="2.5" opacity="0.95" />
                        <line x1="475" y1="249" x2="740" y2={vY} stroke="#9b59b6" strokeWidth="3" filter="url(#prism-glow)" />
                      </g>
                    )
                  )}

                  {/* Projection Screen */}
                  <rect x="740" y="145" width="12" height="180" rx="3" fill="#ffffff" stroke="#a0aec0" strokeWidth="1.5" />
                  {showLabels && <text x="710" y="135" fill="#ffffff" fontSize="11" fontWeight="600">Projection Screen</text>}

                  {/* Spectrum Nanometer Labels */}
                  {showLabels && !isTIR && !monochromatic && (
                    <g fontSize="11" fontWeight="700">
                      <text x="758" y={rY + 4} fill="#ff7675">R (700nm)</text>
                      <text x="758" y={midY + 4} fill="#55efc4">G (530nm)</text>
                      <text x="758" y={vY + 4} fill="#a29bfe">V (400nm)</text>
                    </g>
                  )}

                  {/* Undeviated Reference Path & Deviation Arc */}
                  {!isTIR && (
                    <>
                      <line x1={entryX} y1={entryY} x2="720" y2={entryY} stroke="rgba(255,255,255,0.22)" strokeDasharray="4,4" strokeWidth="1.5" />
                      {showLabels && <text x="610" y="235" fill="rgba(255,255,255,0.4)" fontSize="10">Original Path</text>}
                      <text x="625" y={Math.round(230 - devFactor)} fill="#89f5e7" fontSize="13" fontWeight="700">
                        δ = {clampedDev}°
                      </text>
                    </>
                  )}

                  {/* TIR Notification Banner */}
                  {isTIR && (
                    <g id="tir-notice">
                      <rect x="230" y="45" width="340" height="42" rx="8" fill="#733c00" opacity="0.92" />
                      <text x="400" y="71" fill="#ffdcc3" fontSize="13" fontWeight="700" textAnchor="middle">
                        ⚡ Total Internal Reflection Occurred!
                      </text>
                    </g>
                  )}

                  {/* Emitter Light Box */}
                  <g transform={`translate(${startX - 23}, ${startY - 24})`}>
                    <rect x="0" y="0" width="46" height="48" rx="8" fill="#25149f" stroke="#89f5e7" strokeWidth="2" filter="url(#prism-glow)" />
                    <path d="M 16 16 L 30 24 L 16 32 Z" fill="#ffffff" />
                    <text x="23" y="60" fill="#c3c0ff" fontSize="10" fontWeight="700" textAnchor="middle">RAY</text>
                  </g>
                </svg>

                {/* Bottom Floating Quick HUD */}
                <div className="prism-floating-hud">
                  <div className="prism-hud-pill">
                    <span>Incident Angle: <b className="text-primary">{angle}°</b></span>
                    <span>•</span>
                    <span>Deviation (δ): <b className="text-secondary">{isTIR ? 'TIR (Trapped)' : `${clampedDev}°`}</b></span>
                  </div>
                  <div className="prism-hud-pill">
                    <button
                      type="button"
                      className="btn tiny ghost"
                      onClick={() => setShowLabels(!showLabels)}
                    >
                      {showLabels ? 'Hide Labels' : 'Show Labels'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Stage Strip */}
              <div className="prism-stage-strip">
                <div className="prism-gradient-row">
                  <span className="prism-strip-label">Wavelength Spectrum:</span>
                  <div className="prism-spectrum-bar" />
                  <span className="prism-strip-mono">380nm – 750nm (Visible)</span>
                </div>
                <div className="prism-speed-stat">
                  <span>Speed in Medium:</span>
                  <b>~{speedInMedium} × 10⁸ m/s</b>
                </div>
              </div>
            </div>

            {/* Curated Discovery Insight Card */}
            <article className="prism-insight-card">
              <div className="prism-insight-icon" aria-hidden="true">
                <Icon name="bulb" />
              </div>
              <div className="prism-insight-content">
                <div className="prism-insight-header">
                  <h3 className="prism-insight-title">Curiosity Check: "Why does Violet bend more than Red?"</h3>
                  <span className="prism-law-badge">OPTICAL LAW</span>
                </div>
                <p className="prism-insight-text">
                  Inside empty vacuum, all wavelengths travel at exactly 300,000 km/s. But entering glass, light slows down! Shorter wavelengths (Violet) interact stronger with the electron clouds of glass atoms and crawl slower, bending steeply. Longer wavelengths (Red) rush through with fewer interactions, bending gently!
                </p>
              </div>
            </article>
          </div>

          {/* Right Control & Learning Panel */}
          <aside className="prism-control-col">
            {/* Controls Tile */}
            <div className="prism-controls-card">
              <div className="prism-controls-head">
                <div className="prism-controls-title">
                  <Icon name="gear" />
                  <h2>Lab Controls</h2>
                </div>
                <span className="pill small">Interactive</span>
              </div>

              {/* Parameter 1: Angle of Incidence */}
              <div className="prism-control-group">
                <div className="prism-control-label-row">
                  <label htmlFor={sliderId}>Angle of Incidence (θᵢ)</label>
                  <span className="prism-val-display">{angle}°</span>
                </div>
                <input
                  id={sliderId}
                  type="range"
                  min="15"
                  max="75"
                  step="1"
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="prism-slider"
                  aria-label="Angle of Incidence in degrees"
                />
                <div className="prism-slider-ticks">
                  <span>15° (Shallow)</span>
                  <span>45° (Standard)</span>
                  <span>75° (Steep)</span>
                </div>
              </div>

              {/* Parameter 2: Medium Selection */}
              <div className="prism-control-group">
                <div className="prism-control-label-row">
                  <span>Prism Medium &amp; Refractive Index</span>
                  <span className="prism-snell-hint">Snell's Law: n</span>
                </div>
                <div className="prism-materials-grid">
                  {MATERIALS.map((mat) => (
                    <button
                      key={mat.id}
                      type="button"
                      className={`prism-mat-btn ${selectedMat.id === mat.id ? 'active' : ''}`}
                      onClick={() => setSelectedMat(mat)}
                    >
                      <span className="prism-mat-name">{mat.name}</span>
                      <span className="prism-mat-n">n = {mat.n}</span>
                      <span className="prism-mat-badge">{mat.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Parameter 3: Light Source Mode Toggle */}
              <div className="prism-toggle-box">
                <div className="prism-toggle-info">
                  <span className="prism-toggle-title">Light Source Mode</span>
                  <span className="prism-toggle-sub">
                    {monochromatic ? '532nm Green Laser Ray' : 'Full VIBGYOR White Light'}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={monochromatic}
                  aria-label="Toggle light source mode"
                  className={`prism-switch ${monochromatic ? 'on' : 'off'}`}
                  onClick={() => setMonochromatic(!monochromatic)}
                >
                  <span className="prism-switch-thumb" />
                </button>
              </div>

              {/* Real-time Measurements */}
              <div className="prism-metrics-box">
                <span className="prism-metrics-header">Live Measurements</span>
                <div className="prism-metrics-grid">
                  <div className="prism-metric-cell">
                    <span className="prism-metric-label">Deviation (δ)</span>
                    <span className="prism-metric-num">{isTIR ? 'T.I.R.' : `${clampedDev}°`}</span>
                    <span className="prism-metric-sub">Total ray bend</span>
                  </div>
                  <div className="prism-metric-cell">
                    <span className="prism-metric-label">Spectrum Spread (Δ)</span>
                    <span className="prism-metric-num">{isTIR ? '0.0°' : `${spreadVal}°`}</span>
                    <span className="prism-metric-sub">Violet to Red arc</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Physics Quest Challenge */}
            <div className="prism-challenge-card">
              <div className="prism-challenge-badge">
                <Icon name="sparkle" />
                <span>PHYSICS QUEST</span>
              </div>
              <h3 className="prism-challenge-title">Can you trap light with Total Internal Reflection?</h3>
              <p className="prism-challenge-desc">
                Select <b>Cut Diamond</b> (high index <span className="mono">n = 2.42</span>) and raise the angle above <b>60°</b>. Watch the rays reflect backward inside the glass!
              </p>
              <button
                type="button"
                className="btn primary full"
                onClick={handleTIRChallenge}
              >
                <span>Set Diamond Challenge Setup</span>
                <Icon name="play" />
              </button>
            </div>

            {/* Child-Friendly Pedagogical Accordion */}
            <div className="prism-accordion-card">
              <button
                type="button"
                className="prism-accordion-toggle"
                onClick={() => setAccordionOpen(!accordionOpen)}
                aria-expanded={accordionOpen}
              >
                <div className="prism-accordion-title">
                  <Icon name="bulb" />
                  <span>Why Does This Happen?</span>
                </div>
                <Icon name={accordionOpen ? 'up' : 'down'} />
              </button>

              {accordionOpen && (
                <div className="prism-accordion-body">
                  <div className="prism-point">
                    <b>🎨 White light is a secret crowd!</b>
                    <p>Sunlight looks plain white, but it actually carries seven color wavelengths bundled together: Violet, Indigo, Blue, Green, Yellow, Orange, and Red (VIBGYOR).</p>
                  </div>
                  <div className="prism-point">
                    <b>🏃 Running into deep water</b>
                    <p>Imagine sprinting on pavement, then into knee-deep water. You naturally slow down and your stride pivots! That pivot is refraction.</p>
                  </div>
                  <div className="prism-point">
                    <b>📐 The Triangular Shape</b>
                    <p>Because a prism's sides aren't parallel (unlike window panes), light bends once on entry and bends again on exit, spreading like an unfolded peacock fan!</p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </Page>
  );
}
