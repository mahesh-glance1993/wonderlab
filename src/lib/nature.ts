// Procedural "field recordings" of nature, rendered sample by sample (no recorded or copyrighted audio).
// Physical models: raindrop impacts + air-bubble resonances (Minnaert bubbles), gusting band-passed
// wind, rustling leaf grains, swelling and washing surf, roaring + crackling fire, frequency-swept bird
// syllables sung as repeating songs, and pulsed cricket chirps. Pure functions of (sampleRate, seed),
// so they are deterministic and unit-testable without an AudioContext.

export type NatureName =
  | 'rain' | 'drizzle' | 'storm' | 'thunder' | 'wind' | 'breeze' | 'leaves' | 'stream' | 'water' | 'waterfall'
  | 'splash' | 'sea' | 'fire' | 'bird' | 'birds' | 'crickets' | 'night' | 'forest' | 'garden';
/** Sounds that can play as a quiet looping background bed under a story page. */
export type AmbienceName = 'rain' | 'drizzle' | 'storm' | 'wind' | 'breeze' | 'stream' | 'waterfall' | 'sea' | 'fire' | 'night' | 'forest' | 'garden';
export const AMBIENCES: AmbienceName[] = ['rain', 'drizzle', 'storm', 'wind', 'breeze', 'stream', 'waterfall', 'sea', 'fire', 'night', 'forest', 'garden'];

export type Stereo = [Float32Array, Float32Array];
type Rand = () => number;
export interface NatureSpec {
  /** seconds rendered (for loops: the loop length) */
  dur: number;
  /** true: seamless loop (one-shots play a faded `shot`-second slice of it) */
  loop: boolean;
  shot: number;
  /** reverb send 0..1 */
  reverb: number;
  render: (sr: number, R: Rand, dur: number) => Stereo;
}

/** Sample rate used for rendering (content stays below 16 kHz; rendering cost stays low). */
export const NATURE_SR = 32000;

export function mulberry32(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;
const rr = (R: Rand, lo: number, hi: number) => lo + (hi - lo) * R();
const logr = (R: Rand, lo: number, hi: number) => Math.exp(rr(R, Math.log(lo), Math.log(hi)));
const stereo = (n: number): Stereo => [new Float32Array(n), new Float32Array(n)];
/** equal-power pan, p in [-1, 1] */
const gains = (p: number): [number, number] => { const a = ((Math.max(-1, Math.min(1, p)) + 1) * Math.PI) / 4; return [Math.cos(a), Math.sin(a)]; };

// ---------------- noise + filters ----------------
function white(n: number, R: Rand) { const o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = R() * 2 - 1; return o; }
function pink(n: number, R: Rand) {
  const o = new Float32Array(n);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < n; i++) {
    const w = R() * 2 - 1;
    b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913;
    o[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2;
  }
  return o;
}
function brown(n: number, R: Rand) { const o = new Float32Array(n); let x = 0; for (let i = 0; i < n; i++) { x = (x + 0.02 * (R() * 2 - 1)) / 1.02; o[i] = x * 3.5; } return o; }
const k1 = (fc: number, sr: number) => 1 - Math.exp((-TAU * Math.max(5, fc)) / sr);
/** one-pole low-pass in place; fc may vary per sample */
function lowpass(x: Float32Array, fc: number | Float32Array, sr: number) {
  let y = 0;
  const fixed = typeof fc === 'number' ? k1(fc, sr) : 0;
  for (let i = 0; i < x.length; i++) { const k = typeof fc === 'number' ? fixed : k1(fc[i], sr); y += k * (x[i] - y); x[i] = y; }
  return x;
}
function highpass(x: Float32Array, fc: number, sr: number) { let y = 0; const k = k1(fc, sr); for (let i = 0; i < x.length; i++) { y += k * (x[i] - y); x[i] -= y; } return x; }
/** RBJ band-pass (0 dB peak) in place; centre may vary (coefficients refreshed every 32 samples) */
function bandpass(x: Float32Array, fc: number | Float32Array, q: number, sr: number) {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, b0 = 0, b2 = 0, a1 = 0, a2 = 0;
  for (let i = 0; i < x.length; i++) {
    if (i % 32 === 0) {
      const f = Math.min(sr * 0.45, typeof fc === 'number' ? fc : fc[i]);
      const w0 = (TAU * f) / sr, al = Math.sin(w0) / (2 * q), a0 = 1 + al;
      b0 = al / a0; b2 = -al / a0; a1 = (-2 * Math.cos(w0)) / a0; a2 = (1 - al) / a0;
    }
    const y = b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y; x[i] = y;
  }
  return x;
}
/** smooth random control curve: cosine-interpolated random points */
function curve(R: Rand, n: number, sr: number, perSec: number, lo: number, hi: number) {
  const step = Math.max(1, Math.round(sr / perSec));
  const pts = Array.from({ length: Math.ceil(n / step) + 2 }, () => rr(R, lo, hi));
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) { const p = i / step, j = Math.floor(p), w = (1 - Math.cos(Math.PI * (p - j))) / 2; o[i] = pts[j] * (1 - w) + pts[j + 1] * w; }
  return o;
}
function addInto(dst: Float32Array, src: Float32Array, g: number | Float32Array, at = 0) {
  for (let i = 0; i < src.length && i + at < dst.length; i++) dst[i + at] += src[i] * (typeof g === 'number' ? g : g[i]);
}

// ---------------- sound events ----------------
/** short noise impact (raindrop hit, crackle); bright 0..1 mixes in a differentiated (high-passed) tone */
function burst(S: Stereo, sr: number, R: Rand, t: number, amp: number, pan: number, tau: number, bright: number) {
  const i0 = Math.floor(t * sr), len = Math.min(Math.ceil(tau * sr * 7), S[0].length - i0);
  const [gl, gr] = gains(pan), d = Math.exp(-1 / (tau * sr));
  let e = amp, prev = 0;
  for (let j = 0; j < len; j++) {
    const w = R() * 2 - 1, v = (bright * (w - prev) * 0.7 + (1 - bright) * w) * e;
    prev = w; e *= d;
    S[0][i0 + j] += v * gl; S[1][i0 + j] += v * gr;
  }
}
/** Minnaert air bubble: decaying sine whose pitch rises as the bubble nears the surface */
function bubble(S: Stereo, sr: number, t: number, f0: number, amp: number, pan: number, rise = 0.5) {
  const tau = 1 / (0.043 * f0 + 0.0014 * Math.pow(f0, 1.5));
  const i0 = Math.floor(t * sr), len = Math.min(Math.ceil(tau * sr * 3.5), S[0].length - i0);
  const [gl, gr] = gains(pan), d = Math.exp(-1 / (tau * sr)), att = Math.max(1, 0.0006 * sr);
  let e = amp, ph = 0;
  for (let j = 0; j < len; j++) {
    const f = f0 * (1 + rise * Math.min(1, j / (tau * sr * 3)));
    ph += (TAU * f) / sr;
    const v = Math.sin(ph) * e * Math.min(1, j / att);
    e *= d;
    S[0][i0 + j] += v * gl; S[1][i0 + j] += v * gr;
  }
}
/** pitched syllable (bird note, cricket pulse); freq(x) for x in 0..1 */
function tone(S: Stereo, sr: number, t: number, dur: number, freq: (x: number) => number, amp: number, pan: number, h2 = 0.12, shape = 1.5) {
  const i0 = Math.floor(t * sr), len = Math.min(Math.ceil(dur * sr), S[0].length - i0);
  if (len <= 0) return;
  const [gl, gr] = gains(pan);
  let ph = 0;
  for (let j = 0; j < len; j++) {
    const x = j / len;
    ph += (TAU * freq(x)) / sr;
    const v = (Math.sin(ph) + h2 * Math.sin(2 * ph)) * Math.pow(Math.sin(Math.PI * x), shape) * amp;
    S[0][i0 + j] += v * gl; S[1][i0 + j] += v * gr;
  }
}

// ---------------- building blocks ----------------
function rainInto(S: Stereo, sr: number, R: Rand, dur: number, perSec: number, bed: number) {
  const n = S[0].length;
  for (const ch of [0, 1] as const) {
    const p = highpass(pink(n, R), 450, sr);
    lowpass(p, 7500, sr);
    addInto(S[ch], p, curve(R, n, sr, 0.6, bed * 0.75, bed));
  }
  const count = Math.round(perSec * dur);
  for (let k = 0; k < count; k++) {
    const u = R(), near = R();
    // most drops are tiny and distant; a few land close (louder, brighter)
    burst(S, sr, R, R() * (dur - 0.02), (0.03 + 0.5 * Math.pow(u, 4)) * (0.4 + 0.6 * near), rr(R, -1, 1), rr(R, 0.00035, 0.0016), 0.35 + 0.55 * near);
  }
  for (let k = 0; k < count * 0.03; k++) bubble(S, sr, R() * (dur - 0.05), rr(R, 1400, 4200), rr(R, 0.02, 0.09), rr(R, -0.9, 0.9), 0.7);
}
function windInto(S: Stereo, sr: number, R: Rand, strength: number, level: number) {
  const n = S[0].length, gust = curve(R, n, sr, 0.45, 0.2, 1), lag = Math.round(0.14 * sr);
  const whistleF = curve(R, n, sr, 0.3, 700, 1700);
  for (const ch of [0, 1] as const) {
    const base = pink(n, R), b = brown(n, R);
    for (let i = 0; i < n; i++) base[i] = base[i] * 0.6 + b[i] * 0.5;
    const g = (i: number) => gust[Math.max(0, i - (ch ? lag : 0))];
    const fc = new Float32Array(n), am = new Float32Array(n);
    for (let i = 0; i < n; i++) { const v = g(i); fc[i] = 180 + 750 * Math.pow(v, 1.4) * strength; am[i] = (0.12 + 0.88 * v * v) * level; }
    bandpass(base, fc, 0.8, sr);
    addInto(S[ch], base, am);
    const w = white(n, R);
    const wf = new Float32Array(n), wa = new Float32Array(n);
    for (let i = 0; i < n; i++) { const v = g(i); wf[i] = whistleF[i] * (0.8 + 0.5 * v); wa[i] = 0.5 * Math.pow(v, 3) * strength * level; }
    bandpass(w, wf, 10, sr);
    addInto(S[ch], w, wa);
  }
}
function leavesInto(S: Stereo, sr: number, R: Rand, dur: number, perSec: number, level: number) {
  const n = S[0].length, gust = curve(R, n, sr, 0.5, 0.15, 1);
  const am: Stereo = stereo(n);
  const count = Math.round(perSec * dur);
  for (let k = 0; k < count; k++) {
    const t = R() * dur, i0 = Math.floor(t * sr);
    if (R() > gust[Math.min(n - 1, i0)]) continue;
    const len = Math.floor(rr(R, 0.008, 0.07) * sr), a = (0.2 + 0.8 * R() * R()) * level, [gl, gr] = gains(rr(R, -0.9, 0.9));
    for (let j = 0; j < len && i0 + j < n; j++) { const w = Math.sin((Math.PI * j) / len); am[0][i0 + j] += w * a * gl; am[1][i0 + j] += w * a * gr; }
  }
  for (const ch of [0, 1] as const) {
    const band = highpass(white(n, R), 1600, sr);
    lowpass(band, 8000, sr);
    addInto(S[ch], band, am[ch]);
  }
}
function streamInto(S: Stereo, sr: number, R: Rand, dur: number, perSec: number, fLo: number, fHi: number, bed: number) {
  const n = S[0].length;
  for (const ch of [0, 1] as const) { const p = lowpass(highpass(pink(n, R), 150, sr), 1600, sr); addInto(S[ch], p, bed); }
  const count = Math.round(perSec * dur);
  for (let k = 0; k < count; k++) bubble(S, sr, R() * (dur - 0.05), logr(R, fLo, fHi), 0.04 + 0.32 * R() * R(), rr(R, -0.7, 0.7), rr(R, 0.15, 0.9));
}
interface Song { base: number; notes: { kind: number; dur: number; gap: number; a: number; b: number }[] }
function makeSong(R: Rand, base: number): Song {
  const notes = Array.from({ length: 2 + Math.floor(R() * 4) }, () => ({ kind: Math.floor(R() * 5), dur: rr(R, 0.04, 0.22), gap: rr(R, 0.03, 0.12), a: rr(R, 0.7, 1.5), b: rr(R, 0.7, 1.5) }));
  return { base, notes };
}
/** sings one rendition of a bird's song; returns its length in seconds */
function sing(S: Stereo, sr: number, R: Rand, t0: number, song: Song, amp: number, pan: number) {
  let t = t0;
  for (const nt of song.notes) {
    const f = song.base * rr(R, 0.97, 1.03);
    if (nt.kind === 0) { // trill: rapid falling chips
      const reps = 4 + Math.floor(nt.dur * 40);
      for (let i = 0; i < reps; i++) tone(S, sr, t + i * 0.045, 0.03, (x) => f * (1.35 - 0.5 * x), amp * 0.8, pan, 0.1, 1.2);
      t += reps * 0.045;
    } else if (nt.kind === 1) { // whistle with vibrato
      const d = nt.dur + 0.08;
      tone(S, sr, t, d, (x) => f * nt.a * (1 + 0.035 * Math.sin(TAU * 7 * x * d)), amp, pan, 0.08, 1.2);
      t += d;
    } else if (nt.kind === 2) { // warble (fast FM)
      const d = nt.dur + 0.1, rate = 30 + nt.b * 12;
      tone(S, sr, t, d, (x) => f * (1 + 0.18 * Math.sin(TAU * rate * x * d)), amp * 0.9, pan, 0.15);
      t += d;
    } else { // sweep up or down
      const d = Math.min(0.12, nt.dur), up = nt.kind === 3;
      tone(S, sr, t, d, (x) => f * (up ? 0.75 + 0.6 * x : 1.45 - 0.65 * Math.pow(x, 0.7)), amp, pan, 0.12, 1.3);
      t += d;
    }
    t += nt.gap;
  }
  return t - t0;
}
function birdsInto(S: Stereo, sr: number, R: Rand, dur: number, count: number, level: number, distant = 0.5) {
  for (let b = 0; b < count; b++) {
    const song = makeSong(R, logr(R, 2200, 5200)), far = R() < distant, amp = (far ? rr(R, 0.06, 0.14) : rr(R, 0.18, 0.32)) * level, pan = rr(R, -0.85, 0.85);
    let t = rr(R, 0, Math.min(2.5, dur * 0.4));
    while (t < dur - 0.6) { t += sing(S, sr, R, t, song, amp * rr(R, 0.8, 1.1), pan) + rr(R, 1.2, 3.5); }
  }
}
function cricketsInto(S: Stereo, sr: number, R: Rand, dur: number, count: number, level: number) {
  for (let c = 0; c < count; c++) {
    const f = rr(R, 4100, 5300), pl = rr(R, 0.011, 0.018), pg = rr(R, 0.007, 0.012), pulses = 2 + Math.floor(R() * 3), every = rr(R, 0.32, 0.65);
    const amp = rr(R, 0.05, 0.16) * level, pan = rr(R, -0.9, 0.9);
    for (let t = rr(R, 0, every); t < dur - 0.1; t += every * rr(R, 0.94, 1.06)) for (let p = 0; p < pulses; p++) tone(S, sr, t + p * (pl + pg), pl, () => f, amp, pan, 0.2, 1);
  }
}
function fireInto(S: Stereo, sr: number, R: Rand, dur: number, level: number) {
  const n = S[0].length, flick = curve(R, n, sr, 7, 0.45, 1), slow = curve(R, n, sr, 0.8, 0.6, 1);
  for (const ch of [0, 1] as const) {
    const roar = lowpass(lowpass(brown(n, R), 420, sr), 420, sr);
    const am = new Float32Array(n);
    for (let i = 0; i < n; i++) am[i] = flick[i] * slow[i] * 0.9 * level;
    addInto(S[ch], roar, am);
    const hiss = lowpass(highpass(white(n, R), 2500, sr), 9000, sr);
    for (let i = 0; i < n; i++) am[i] = 0.035 * flick[i] * level;
    addInto(S[ch], hiss, am);
  }
  const busy = curve(R, n, sr, 1.5, 0.1, 1);
  for (let t = 0; t < dur - 0.05; t += rr(R, 0.01, 0.12)) {
    if (R() > busy[Math.floor(t * sr)]) continue;
    const pan = rr(R, -0.35, 0.35), clicks = 1 + Math.floor(R() * 4), amp = (0.08 + 0.7 * Math.pow(R(), 3)) * level;
    for (let c = 0; c < clicks; c++) burst(S, sr, R, t + c * rr(R, 0.001, 0.006), amp * rr(R, 0.4, 1), pan, rr(R, 0.00015, 0.0009), 0.85);
    if (R() < 0.05) bubble(S, sr, t, rr(R, 180, 500), amp * 0.6, pan, -0.3); // a resin pop
  }
}
function waveEnv(t: number, t0: number, peak: number) {
  if (t < t0) return 0;
  if (t < peak) { const x = (t - t0) / (peak - t0); return Math.pow(Math.sin((Math.PI / 2) * x), 2); }
  return Math.exp(-(t - peak) / 1.3);
}
function washEnv(t: number, peak: number) { if (t < peak) return 0; const d = t - peak; return (1 - Math.exp(-d / 0.3)) * Math.exp(-d / 2.2); }
function seaInto(S: Stereo, sr: number, R: Rand, dur: number, level: number) {
  const n = S[0].length, period = dur / 2;
  const waves = [-period, 0, period, 2 * period].map((t0) => ({ t0: t0 + 0.4, peak: t0 + 0.4 + rr(R, 2.4, 3.0), a: rr(R, 0.75, 1) }));
  const w = new Float32Array(n), wash = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / sr; for (const v of waves) { w[i] += v.a * waveEnv(t, v.t0, v.peak); wash[i] += v.a * washEnv(t, v.peak); } }
  for (const ch of [0, 1] as const) {
    const rumble = lowpass(brown(n, R), 220, sr), body = pink(n, R), hiss = lowpass(highpass(white(n, R), 2800, sr), 10000, sr);
    const fc = new Float32Array(n), a = new Float32Array(n), b = new Float32Array(n), c = new Float32Array(n);
    for (let i = 0; i < n; i++) { fc[i] = 280 + 3600 * Math.pow(w[i], 1.6); a[i] = (0.25 + 0.6 * w[i]) * level * 0.6; b[i] = (0.08 + 0.9 * w[i]) * level; c[i] = 0.5 * wash[i] * level; }
    lowpass(body, fc, sr); lowpass(body, fc, sr);
    addInto(S[ch], rumble, a); addInto(S[ch], body, b); addInto(S[ch], hiss, c);
  }
  // fizzing foam as the water washes back
  for (let t = 0; t < dur - 0.02; t += 0.004) { const v = wash[Math.floor(t * sr)]; if (R() < v * 0.6) burst(S, sr, R, t, 0.06 * level * R(), rr(R, -1, 1), 0.0003, 0.9); }
}

// ---------------- finishing ----------------
/** scale to a target loudness, never clipping */
export function finish(S: Stereo, rms = 0.13): Stereo {
  let sum = 0, peak = 0;
  for (const ch of S) for (let i = 0; i < ch.length; i++) { sum += ch[i] * ch[i]; peak = Math.max(peak, Math.abs(ch[i])); }
  const cur = Math.sqrt(sum / (S[0].length * 2)) || 1;
  const g = Math.min(rms / cur, 0.97 / (peak || 1));
  for (const ch of S) for (let i = 0; i < ch.length; i++) ch[i] *= g;
  return S;
}
/** crossfade the extra tail into the head so the buffer loops without a seam */
function loopify(S: Stereo, sr: number, xf: number): Stereo {
  const x = Math.round(xf * sr), n = S[0].length - x;
  return S.map((ch) => {
    const o = ch.slice(0, n);
    for (let i = 0; i < x; i++) { const p = (Math.PI / 2) * (i / x); o[i] = ch[i] * Math.sin(p) + ch[n + i] * Math.cos(p); }
    return o;
  }) as Stereo;
}
function fadeEnds(S: Stereo, sr: number, fin: number, fout: number): Stereo {
  const n = S[0].length, a = Math.round(fin * sr), b = Math.round(fout * sr);
  for (const ch of S) {
    for (let i = 0; i < a && i < n; i++) ch[i] *= i / a;
    for (let i = 0; i < b && i < n; i++) ch[n - 1 - i] *= i / b;
  }
  return S;
}
const XF = 1.2; // loop crossfade seconds
const looped = (body: (S: Stereo, sr: number, R: Rand, d: number) => void, rms = 0.13) => (sr: number, R: Rand, dur: number) => {
  const d = dur + XF, S = stereo(Math.round(d * sr));
  body(S, sr, R, d);
  return finish(loopify(S, sr, XF), rms);
};
const once = (body: (S: Stereo, sr: number, R: Rand, d: number) => void, rms = 0.13, fout = 0.3) => (sr: number, R: Rand, dur: number) => {
  const S = stereo(Math.round(dur * sr));
  body(S, sr, R, dur);
  return finish(fadeEnds(S, sr, 0.003, fout), rms);
};

function thunder(S: Stereo, sr: number, R: Rand) {
  const n = S[0].length;
  // the crack: bright burst + a ripple of crackles
  burst(S, sr, R, 0.05, 0.9, rr(R, -0.4, 0.4), 0.06, 0.6);
  for (let i = 0; i < 40; i++) burst(S, sr, R, 0.05 + Math.pow(R(), 1.5) * 0.6, rr(R, 0.1, 0.6), rr(R, -0.8, 0.8), rr(R, 0.002, 0.01), 0.5);
  // rolling rumble: overlapping swells of deep noise
  const env = new Float32Array(n);
  const rolls = Array.from({ length: 7 }, (_, i) => ({ t: 0.08 + i * rr(R, 0.25, 0.6), a: Math.pow(0.82, i) * rr(R, 0.6, 1), att: rr(R, 0.08, 0.3), dec: rr(R, 0.7, 1.6) }));
  for (let i = 0; i < n; i++) { const t = i / sr; for (const r of rolls) if (t > r.t) env[i] += r.a * Math.min(1, (t - r.t) / r.att) * Math.exp(-Math.max(0, t - r.t - r.att) / r.dec); }
  for (const ch of [0, 1] as const) {
    const deep = lowpass(lowpass(brown(n, R), 140, sr), 140, sr), body = lowpass(pink(n, R), 500, sr);
    addInto(S[ch], deep, env); addInto(S[ch], body, env.map((v) => v * 0.25));
  }
}
function splash(S: Stereo, sr: number, R: Rand) {
  const n = Math.round(0.6 * sr);
  for (const ch of [0, 1] as const) {
    const w = white(n, R), fc = new Float32Array(n);
    for (let i = 0; i < n; i++) { fc[i] = 900 + 6000 * Math.exp(-i / (0.08 * sr)); w[i] *= Math.exp(-i / (0.12 * sr)) * Math.min(1, i / (0.004 * sr)); }
    lowpass(w, fc, sr);
    addInto(S[ch], w, 0.9);
  }
  tone(S, sr, 0.0, 0.12, (x) => 110 - 50 * x, 0.6, 0, 0, 0.6); // the body "plunk"
  for (let i = 0; i < 28; i++) bubble(S, sr, 0.04 + Math.pow(R(), 1.6) * 0.5, logr(R, 380, 2600), rr(R, 0.05, 0.3), rr(R, -0.6, 0.6), rr(R, 0.3, 1));
  for (let i = 0; i < 18; i++) bubble(S, sr, 0.15 + R() * 0.7, rr(R, 2200, 5200), rr(R, 0.03, 0.12), rr(R, -0.9, 0.9), 0.8); // falling droplets
}
function pour(S: Stereo, sr: number, R: Rand, d: number) {
  const n = S[0].length;
  for (const ch of [0, 1] as const) { const w = lowpass(highpass(white(n, R), 300, sr), 2400, sr); addInto(S[ch], w, 0.12); }
  for (let t = 0.02; t < d - 0.1; t += rr(R, 0.002, 0.009)) {
    const x = t / d; // the pot fills: bubbles get higher
    bubble(S, sr, t, logr(R, 350 + 500 * x, 1100 + 1500 * x), 0.05 + 0.3 * R() * R(), rr(R, -0.3, 0.3), rr(R, 0.3, 1));
  }
}

export const NATURE: Record<NatureName, NatureSpec> = {
  rain: { dur: 9, loop: true, shot: 4.5, reverb: 0.1, render: looped((S, sr, R, d) => rainInto(S, sr, R, d, 700, 0.3)) },
  drizzle: { dur: 9, loop: true, shot: 4, reverb: 0.1, render: looped((S, sr, R, d) => rainInto(S, sr, R, d, 160, 0.12), 0.08) },
  storm: { dur: 10, loop: true, shot: 5, reverb: 0.15, render: looped((S, sr, R, d) => { rainInto(S, sr, R, d, 1500, 0.5); windInto(S, sr, R, 1, 0.7); }, 0.16) },
  thunder: { dur: 6, loop: false, shot: 6, reverb: 0.5, render: once(thunder, 0.16, 1.2) },
  wind: { dur: 10, loop: true, shot: 4.5, reverb: 0.08, render: looped((S, sr, R) => windInto(S, sr, R, 1, 1), 0.12) },
  breeze: { dur: 10, loop: true, shot: 4, reverb: 0.08, render: looped((S, sr, R, d) => { windInto(S, sr, R, 0.45, 0.6); leavesInto(S, sr, R, d, 60, 0.25); }, 0.07) },
  leaves: { dur: 3, loop: false, shot: 3, reverb: 0.1, render: once((S, sr, R, d) => leavesInto(S, sr, R, d, 260, 1), 0.1, 0.6) },
  stream: { dur: 9, loop: true, shot: 4, reverb: 0.12, render: looped((S, sr, R, d) => streamInto(S, sr, R, d, 140, 300, 1900, 0.18), 0.11) },
  water: { dur: 3, loop: false, shot: 3, reverb: 0.12, render: once(pour, 0.11, 0.5) },
  waterfall: { dur: 9, loop: true, shot: 4.5, reverb: 0.15, render: looped((S, sr, R, d) => {
    streamInto(S, sr, R, d, 600, 250, 2200, 0.6);
    for (const ch of [0, 1] as const) addInto(S[ch], lowpass(brown(S[0].length, R), 300, sr), 0.5);
  }, 0.15) },
  splash: { dur: 1.2, loop: false, shot: 1.2, reverb: 0.12, render: once(splash, 0.14, 0.3) },
  sea: { dur: 12, loop: true, shot: 6, reverb: 0.1, render: looped((S, sr, R, d) => seaInto(S, sr, R, d, 1), 0.13) },
  fire: { dur: 9, loop: true, shot: 4, reverb: 0.08, render: looped((S, sr, R, d) => fireInto(S, sr, R, d, 1), 0.1) },
  bird: { dur: 1.8, loop: false, shot: 1.8, reverb: 0.2, render: once((S, sr, R) => { sing(S, sr, R, 0.05, makeSong(R, logr(R, 2600, 4200)), 0.5, rr(R, -0.3, 0.3)); }, 0.12, 0.2) },
  birds: { dur: 4.5, loop: false, shot: 4.5, reverb: 0.25, render: once((S, sr, R, d) => { windInto(S, sr, R, 0.3, 0.25); birdsInto(S, sr, R, d, 4, 1, 0.4); }, 0.1, 0.8) },
  crickets: { dur: 8, loop: true, shot: 4, reverb: 0.15, render: looped((S, sr, R, d) => cricketsInto(S, sr, R, d, 5, 1), 0.08) },
  night: { dur: 12, loop: true, shot: 5, reverb: 0.2, render: looped((S, sr, R, d) => { windInto(S, sr, R, 0.3, 0.35); cricketsInto(S, sr, R, d, 6, 1); }, 0.07) },
  forest: { dur: 14, loop: true, shot: 5, reverb: 0.25, render: looped((S, sr, R, d) => { windInto(S, sr, R, 0.45, 0.5); leavesInto(S, sr, R, d, 50, 0.25); birdsInto(S, sr, R, d, 5, 1, 0.6); }, 0.08) },
  garden: { dur: 12, loop: true, shot: 5, reverb: 0.2, render: looped((S, sr, R, d) => { windInto(S, sr, R, 0.3, 0.35); birdsInto(S, sr, R, d, 3, 1, 0.3); }, 0.07) },
};

/** Renders a nature sound (stereo float samples). Same name + seed → same audio. */
export function renderNature(name: NatureName, sr = NATURE_SR, seed = 0): Stereo {
  let h = 2166136261;
  for (const c of name) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const spec = NATURE[name];
  return spec.render(sr, mulberry32((h ^ seed) >>> 0), spec.dur);
}

/** A small outdoor-space reverb impulse (stereo, darkening as it decays). */
export function impulseResponse(sr = NATURE_SR, secs = 1.6, decay = 0.35): Stereo {
  const R = mulberry32(7), n = Math.round(secs * sr), pre = Math.round(0.012 * sr);
  return [0, 1].map(() => {
    const o = new Float32Array(n), fc = new Float32Array(n);
    for (let i = pre; i < n; i++) o[i] = (R() * 2 - 1) * Math.exp(-(i - pre) / (decay * sr));
    for (let i = 0; i < n; i++) fc[i] = 9000 * Math.exp(-i / (0.5 * sr)) + 900;
    return lowpass(o, fc, sr);
  }) as Stereo;
}
