// Sound effects synthesised in the browser with Web Audio — animals, vehicles, nature, machines, UI.
// No recorded/copyrighted audio. Respects mute + volume, and ducks under narration so speech stays clear.
import { getAudioPrefs, onSpeaking } from './audio';
import { NATURE, NATURE_SR, impulseResponse, renderNature, type AmbienceName, type NatureName } from './nature';

export type SfxName =
  // animals & birds
  | 'cow' | 'cat' | 'dog' | 'bird' | 'duck' | 'rooster' | 'hen' | 'sheep' | 'goat' | 'lion' | 'tiger' | 'elephant' | 'frog' | 'owl' | 'crow' | 'horse' | 'monkey' | 'peacock' | 'parrot' | 'bee' | 'snake'
  // vehicles
  | 'car' | 'horn' | 'bike' | 'bicycle' | 'bus' | 'train' | 'aeroplane' | 'helicopter' | 'boat' | 'siren' | 'tractor' | 'auto' | 'cart' | 'rocket' | 'truck'
  // nature
  | 'rain' | 'drizzle' | 'storm' | 'thunder' | 'wind' | 'breeze' | 'water' | 'stream' | 'waterfall' | 'splash' | 'birds' | 'fire' | 'leaves' | 'sea'
  | 'crickets' | 'night' | 'forest' | 'garden'
  // machines & making
  | 'motor' | 'gears' | 'drill' | 'hammer' | 'screw' | 'crane' | 'clock' | 'bell'
  // UI
  | 'pop' | 'snap' | 'whoosh' | 'sparkle' | 'click' | 'drum' | 'success' | 'tick';

export interface SfxHandle { stop: () => void; done: Promise<void> }

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let duck = 1;
const ac = () => {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
};
const setMaster = () => { if (master && ctx) master.gain.setTargetAtTime((getAudioPrefs().mute ? 0 : getAudioPrefs().volume) * 0.7 * duck, ctx.currentTime, 0.08); };
// duck effects to 35% while narration is speaking so words are always easy to hear
onSpeaking((s) => { duck = s ? 0.35 : 1; setMaster(); });

let noiseBuf: AudioBuffer | null = null;
function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  s.loop = true;
  return s;
}
type Pt = [number, number]; // [time offset s, value]
function ramp(p: AudioParam, t0: number, pts: Pt[], exp = false) {
  p.setValueAtTime(pts[0][1], t0 + pts[0][0]);
  for (const [t, v] of pts.slice(1)) {
    if (exp && v > 0) p.exponentialRampToValueAtTime(v, t0 + t);
    else p.linearRampToValueAtTime(v, t0 + t);
  }
}
interface Voice { type?: OscillatorType | 'noise'; f?: Pt[]; g: Pt[]; filter?: { type: BiquadFilterType; f: Pt[]; q?: number }; vib?: { rate: number; depth: number }; trem?: { rate: number; depth: number }; at?: number }

function play(voices: Voice[], length: number): SfxHandle {
  const c = ac();
  setMaster();
  const t0 = c.currentTime + 0.02;
  const nodes: AudioScheduledSourceNode[] = [];
  const bus = c.createGain();
  bus.connect(master!);
  for (const v of voices) {
    const st = t0 + (v.at || 0);
    let src: AudioScheduledSourceNode;
    if (v.type === 'noise') src = noise(c);
    else {
      const o = c.createOscillator();
      o.type = v.type || 'sine';
      if (v.f) ramp(o.frequency, st, v.f, true);
      if (v.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = v.vib.rate; lg.gain.value = v.vib.depth; l.connect(lg).connect(o.frequency); l.start(st); l.stop(st + length); nodes.push(l); }
      src = o;
    }
    const g = c.createGain();
    g.gain.value = 0;
    ramp(g.gain, st, v.g);
    let head: AudioNode = src;
    if (v.filter) { const fl = c.createBiquadFilter(); fl.type = v.filter.type; fl.Q.value = v.filter.q ?? 1; ramp(fl.frequency, st, v.filter.f, true); head.connect(fl); head = fl; }
    if (v.trem) { const tg = c.createGain(), l = c.createOscillator(), lg = c.createGain(); l.frequency.value = v.trem.rate; lg.gain.value = v.trem.depth; tg.gain.value = 1 - v.trem.depth; l.connect(lg).connect(tg.gain); l.start(st); l.stop(st + length); nodes.push(l); head.connect(tg); head = tg; }
    head.connect(g).connect(bus);
    src.start(st);
    src.stop(st + length + 0.05);
    nodes.push(src);
  }
  let resolve!: () => void;
  const done = new Promise<void>((r) => { resolve = r; });
  const timer = setTimeout(resolve, (length + 0.1) * 1000);
  return {
    done,
    stop: () => { clearTimeout(timer); bus.gain.setTargetAtTime(0, c.currentTime, 0.05); nodes.forEach((n) => { try { n.stop(c.currentTime + 0.2); } catch { /* already stopped */ } }); resolve(); },
  };
}
const env = (a: number, hold: number, rel: number, peak = 1): Pt[] => [[0, 0], [a, peak], [a + hold, peak * 0.8], [a + hold + rel, 0]];
const repeatAt = (v: Voice, times: number, gap: number): Voice[] => Array.from({ length: times }, (_, i) => ({ ...v, at: (v.at || 0) + i * gap }));


// ---------- rendered nature sounds (see nature.ts) ----------
const natBufs = new Map<NatureName, AudioBuffer>();
const natWaiting = new Map<NatureName, ((b: AudioBuffer | null) => void)[]>();
let natWorker: Worker | null | undefined;
/** keep at most 14 rendered sounds (about 2–4 MB each) */
function remember(name: NatureName, b: AudioBuffer) {
  natBufs.delete(name);
  natBufs.set(name, b);
  while (natBufs.size > 14) natBufs.delete(natBufs.keys().next().value!);
}
function toBuffer(c: AudioContext, l: Float32Array, r: Float32Array) {
  const b = c.createBuffer(2, l.length, NATURE_SR);
  b.copyToChannel(l as Float32Array<ArrayBuffer>, 0); b.copyToChannel(r as Float32Array<ArrayBuffer>, 1);
  return b;
}
function worker(c: AudioContext): Worker | null {
  if (natWorker === undefined) {
    try {
      natWorker = new Worker(new URL('./nature.worker.ts', import.meta.url), { type: 'module' });
      natWorker.onmessage = (e: MessageEvent<{ name: NatureName; l?: Float32Array; r?: Float32Array }>) => {
        const { name, l, r } = e.data;
        const b = l && r ? toBuffer(c, l, r) : null;
        if (b) remember(name, b);
        (natWaiting.get(name) || []).forEach((f) => f(b));
        natWaiting.delete(name);
      };
    } catch { natWorker = null; }
  }
  return natWorker;
}
/** Gets a rendered nature sound; renders in a background worker (or inline if workers are unavailable). */
function natureBuffer(c: AudioContext, name: NatureName, cb: (b: AudioBuffer | null) => void) {
  const have = natBufs.get(name);
  if (have) { remember(name, have); cb(have); return; }
  const list = natWaiting.get(name);
  if (list) { list.push(cb); return; }
  natWaiting.set(name, [cb]);
  const w = worker(c);
  if (w) { w.postMessage({ name, sr: NATURE_SR }); return; }
  try { const [l, r] = renderNature(name, NATURE_SR); remember(name, toBuffer(c, l, r)); } catch { /* unsupported */ }
  (natWaiting.get(name) || []).forEach((f) => f(natBufs.get(name) || null));
  natWaiting.delete(name);
}
/** Renders sounds ahead of time (after the first tap) so they start instantly later. */
export function prewarmSfx(names: (SfxName | undefined)[]) {
  const nat = [...new Set(names)].filter((n): n is NatureName => !!n && n in NATURE);
  if (!nat.length || getAudioPrefs().mute) return;
  const c = ac();
  nat.forEach((n) => natureBuffer(c, n, () => undefined));
}
let verbIn: GainNode | null = null;
function reverb(c: AudioContext) {
  if (!verbIn) {
    const conv = c.createConvolver(), [l, r] = impulseResponse(NATURE_SR), ib = c.createBuffer(2, l.length, NATURE_SR);
    ib.copyToChannel(l, 0); ib.copyToChannel(r, 1);
    conv.buffer = ib;
    verbIn = c.createGain();
    verbIn.connect(conv).connect(master!);
  }
  return verbIn;
}
/** One-shot (or, with forever, a looping bed that plays until stopped). */
function playNature(name: NatureName, opts: { forever?: boolean; level?: number } = {}): SfxHandle {
  const c = ac();
  setMaster();
  const spec = NATURE[name], level = opts.level ?? 1;
  const g = c.createGain();
  g.gain.value = 0;
  g.connect(master!);
  if (spec.reverb > 0) { const send = c.createGain(); send.gain.value = spec.reverb; g.connect(send).connect(reverb(c)); }
  let src: AudioBufferSourceNode | null = null, stopped = false, timer: ReturnType<typeof setTimeout> | undefined;
  let resolve!: () => void;
  const done = new Promise<void>((r) => { resolve = r; });
  const begin = (buf: AudioBuffer | null) => {
    if (stopped || !buf) { resolve(); return; }
    const s = c.createBufferSource(), t0 = c.currentTime + 0.02;
    src = s;
    s.buffer = buf;
    s.connect(g);
    let length = Infinity;
    if (spec.loop) {
      s.loop = true;
      s.start(t0, Math.random() * buf.duration); // a different slice each time
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(level, t0 + (opts.forever ? 1.5 : 0.35));
      if (!opts.forever) {
        length = spec.shot;
        g.gain.setValueAtTime(level, t0 + length - 0.9);
        g.gain.linearRampToValueAtTime(0, t0 + length);
        s.stop(t0 + length + 0.05);
      }
    } else {
      s.playbackRate.value = 1 + (Math.random() - 0.5) * 0.06; // natural variation
      g.gain.setValueAtTime(level, t0);
      length = buf.duration / s.playbackRate.value;
      s.start(t0);
    }
    if (Number.isFinite(length)) timer = setTimeout(resolve, (length + 0.1) * 1000);
  };
  natureBuffer(c, name, begin);
  return {
    done,
    stop: () => {
      if (stopped) return;
      stopped = true;
      clearTimeout(timer);
      const now = c.currentTime, fade = opts.forever ? 1 : 0.12;
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.linearRampToValueAtTime(0, now + fade);
      try { src?.stop(now + fade + 0.05); } catch { /* already stopped */ }
      resolve();
    },
  };
}

/** Quiet looping background (rain, forest, night...) until stop() is called. */
export function ambience(name: AmbienceName, level = 0.4): SfxHandle | null {
  if (getAudioPrefs().mute) return null;
  try { return playNature(name, { forever: true, level }); } catch { return null; }
}
/** Re-apply volume/mute (call after changing audio settings). */
export const refreshSfxVolume = () => setMaster();

const LIB: Record<SfxName, () => SfxHandle> = {
  // ---------- animals ----------
  cow: () => play([{ type: 'sawtooth', f: [[0, 120], [0.4, 128], [1.3, 95]], g: env(0.25, 0.8, 0.4, 0.5), filter: { type: 'bandpass', f: [[0, 400], [0.5, 700], [1.4, 450]], q: 2 }, vib: { rate: 5, depth: 2 } }], 1.6),
  cat: () => play([{ type: 'sawtooth', f: [[0, 480], [0.25, 820], [0.7, 560]], g: env(0.06, 0.45, 0.25, 0.35), filter: { type: 'bandpass', f: [[0, 900], [0.25, 2200], [0.7, 1200]], q: 4 } }], 0.8),
  dog: () => play(repeatAt({ type: 'square', f: [[0, 340], [0.1, 220]], g: env(0.01, 0.06, 0.08, 0.35), filter: { type: 'bandpass', f: [[0, 900], [0.15, 600]], q: 3 } }, 2, 0.32).concat(repeatAt({ type: 'noise', g: env(0.005, 0.04, 0.06, 0.2), filter: { type: 'bandpass', f: [[0, 1400]], q: 2 } }, 2, 0.32)), 0.8),
  bird: () => playNature('bird'),
  duck: () => play(repeatAt({ type: 'sawtooth', f: [[0, 260], [0.15, 230]], g: env(0.01, 0.12, 0.05, 0.35), filter: { type: 'bandpass', f: [[0, 1300]], q: 9 } }, 3, 0.24), 0.8),
  rooster: () => play([{ type: 'sawtooth', f: [[0, 420], [0.2, 760], [0.8, 700], [1.3, 480]], g: env(0.05, 1.1, 0.25, 0.35), filter: { type: 'bandpass', f: [[0, 1200], [0.4, 2000], [1.3, 1200]], q: 5 }, vib: { rate: 9, depth: 15 } }], 1.5),
  hen: () => play(repeatAt({ type: 'sawtooth', f: [[0, 600], [0.08, 900]], g: env(0.01, 0.06, 0.05, 0.3), filter: { type: 'bandpass', f: [[0, 1500]], q: 5 } }, 4, 0.15), 0.8),
  sheep: () => play([{ type: 'sawtooth', f: [[0, 310], [0.7, 280]], g: env(0.05, 0.55, 0.2, 0.35), filter: { type: 'bandpass', f: [[0, 900], [0.7, 800]], q: 4 }, vib: { rate: 7, depth: 22 } }], 0.9),
  goat: () => play([{ type: 'sawtooth', f: [[0, 380], [0.6, 340]], g: env(0.03, 0.5, 0.2, 0.35), filter: { type: 'bandpass', f: [[0, 1100]], q: 4 }, vib: { rate: 11, depth: 35 } }], 0.8),
  lion: () => play([{ type: 'noise', g: env(0.25, 0.9, 0.5, 0.6), filter: { type: 'lowpass', f: [[0, 300], [0.4, 700], [1.6, 250]], q: 3 }, trem: { rate: 14, depth: 0.4 } }, { type: 'sawtooth', f: [[0, 70], [0.4, 95], [1.6, 60]], g: env(0.25, 0.9, 0.5, 0.35), filter: { type: 'lowpass', f: [[0, 500]] } }], 1.8),
  tiger: () => LIB.lion(),
  elephant: () => play([{ type: 'sawtooth', f: [[0, 420], [0.25, 620], [1.0, 560]], g: env(0.08, 0.8, 0.3, 0.4), filter: { type: 'bandpass', f: [[0, 1100], [0.3, 1800]], q: 3 }, vib: { rate: 6, depth: 18 } }, { type: 'noise', g: env(0.08, 0.8, 0.3, 0.12), filter: { type: 'bandpass', f: [[0, 2500]], q: 2 } }], 1.3),
  frog: () => play(repeatAt({ type: 'square', f: [[0, 150], [0.25, 130]], g: env(0.01, 0.2, 0.08, 0.3), filter: { type: 'lowpass', f: [[0, 700]] }, trem: { rate: 22, depth: 0.8 } }, 2, 0.45), 0.95),
  owl: () => play(repeatAt({ type: 'sine', f: [[0, 390], [0.3, 360]], g: env(0.05, 0.22, 0.12, 0.4) }, 2, 0.6), 1.2),
  crow: () => play(repeatAt({ type: 'sawtooth', f: [[0, 620], [0.25, 480]], g: env(0.02, 0.18, 0.08, 0.35), filter: { type: 'bandpass', f: [[0, 1500]], q: 3 } }, 2, 0.42).concat(repeatAt({ type: 'noise', g: env(0.02, 0.18, 0.08, 0.12), filter: { type: 'bandpass', f: [[0, 1800]], q: 2 } }, 2, 0.42)), 0.9),
  horse: () => play([{ type: 'sawtooth', f: [[0, 950], [0.3, 1100], [1.0, 500]], g: env(0.05, 0.8, 0.25, 0.3), filter: { type: 'bandpass', f: [[0, 1800], [1.0, 1000]], q: 4 }, vib: { rate: 16, depth: 60 } }], 1.2),
  monkey: () => play([{ type: 'sine', f: [[0, 400], [0.15, 700]], g: env(0.02, 0.12, 0.06, 0.35) }, { type: 'sine', f: [[0, 420], [0.15, 760]], g: env(0.02, 0.12, 0.06, 0.35), at: 0.25 }, { type: 'sawtooth', f: [[0, 700], [0.3, 1000]], g: env(0.03, 0.25, 0.1, 0.25), filter: { type: 'bandpass', f: [[0, 1600]], q: 3 }, at: 0.55 }], 1.0),
  peacock: () => play([{ type: 'sawtooth', f: [[0, 700], [0.25, 1150]], g: env(0.03, 0.25, 0.08, 0.3), filter: { type: 'bandpass', f: [[0, 2000]], q: 4 } }, { type: 'sawtooth', f: [[0, 1100], [0.3, 800]], g: env(0.03, 0.28, 0.1, 0.3), filter: { type: 'bandpass', f: [[0, 1800]], q: 4 }, at: 0.38 }], 0.85),
  parrot: () => play(repeatAt({ type: 'square', f: [[0, 1400], [0.08, 2000], [0.16, 1500]], g: env(0.01, 0.12, 0.05, 0.2), filter: { type: 'bandpass', f: [[0, 2400]], q: 4 } }, 3, 0.22), 0.75),
  bee: () => play([{ type: 'sawtooth', f: [[0, 220], [1.5, 240]], g: env(0.2, 1.1, 0.3, 0.2), filter: { type: 'bandpass', f: [[0, 600]], q: 2 }, vib: { rate: 3, depth: 25 }, trem: { rate: 30, depth: 0.3 } }], 1.7),
  snake: () => play([{ type: 'noise', g: env(0.2, 1.0, 0.4, 0.3), filter: { type: 'highpass', f: [[0, 4500]] } }], 1.7),
  // ---------- vehicles ----------
  car: () => play([{ type: 'sawtooth', f: [[0, 45], [0.6, 85], [2.2, 70]], g: env(0.2, 1.7, 0.5, 0.4), filter: { type: 'lowpass', f: [[0, 300], [0.6, 600]] }, trem: { rate: 28, depth: 0.35 } }], 2.5),
  horn: () => play(repeatAt({ type: 'square', f: [[0, 420]], g: env(0.01, 0.18, 0.05, 0.22), filter: { type: 'lowpass', f: [[0, 1800]] } }, 2, 0.32).concat(repeatAt({ type: 'square', f: [[0, 520]], g: env(0.01, 0.18, 0.05, 0.18), filter: { type: 'lowpass', f: [[0, 1800]] } }, 2, 0.32)), 0.7),
  bike: () => play([{ type: 'sawtooth', f: [[0, 80], [0.5, 160], [1.2, 130], [1.8, 190]], g: env(0.1, 1.6, 0.3, 0.32), filter: { type: 'lowpass', f: [[0, 900]] }, trem: { rate: 40, depth: 0.5 } }], 2.1),
  bicycle: () => play(repeatAt({ type: 'sine', f: [[0, 3100]], g: [[0, 0], [0.005, 0.3], [0.5, 0]] }, 2, 0.28).concat(repeatAt({ type: 'sine', f: [[0, 4300]], g: [[0, 0], [0.005, 0.15], [0.35, 0]] }, 2, 0.28)), 0.9),
  bus: () => play([{ type: 'sawtooth', f: [[0, 38], [0.8, 60], [2.4, 52]], g: env(0.3, 1.8, 0.5, 0.45), filter: { type: 'lowpass', f: [[0, 250], [0.8, 450]] }, trem: { rate: 20, depth: 0.3 } }, { type: 'square', f: [[0, 300]], g: env(0.02, 0.5, 0.1, 0.18), filter: { type: 'lowpass', f: [[0, 1200]] }, at: 2.0 }], 2.8),
  train: () => play([...repeatAt({ type: 'noise', g: env(0.01, 0.05, 0.12, 0.35), filter: { type: 'bandpass', f: [[0, 700]], q: 1.5 } }, 10, 0.24), { type: 'sine', f: [[0, 880]], g: env(0.05, 0.7, 0.2, 0.22), at: 2.4 }, { type: 'sine', f: [[0, 1110]], g: env(0.05, 0.7, 0.2, 0.18), at: 2.4 }], 3.4),
  aeroplane: () => play([{ type: 'noise', g: env(0.8, 1.6, 0.8, 0.4), filter: { type: 'bandpass', f: [[0, 300], [1.8, 1400], [3.2, 500]], q: 1 } }, { type: 'sine', f: [[0, 1200], [1.8, 2100], [3.2, 1500]], g: env(0.8, 1.6, 0.8, 0.07) }], 3.3),
  helicopter: () => play([{ type: 'noise', g: env(0.3, 2.0, 0.4, 0.45), filter: { type: 'lowpass', f: [[0, 500]] }, trem: { rate: 13, depth: 0.9 } }], 2.8),
  boat: () => play([{ type: 'sawtooth', f: [[0, 145]], g: env(0.15, 1.0, 0.4, 0.35), filter: { type: 'lowpass', f: [[0, 700]] } }, { type: 'sawtooth', f: [[0, 218]], g: env(0.15, 1.0, 0.4, 0.2), filter: { type: 'lowpass', f: [[0, 800]] } }], 1.7),
  siren: () => play([{ type: 'sine', f: [[0, 650], [0.5, 1150], [1.0, 650], [1.5, 1150], [2.0, 650]], g: env(0.05, 1.8, 0.2, 0.2) }], 2.2),
  tractor: () => play([{ type: 'sawtooth', f: [[0, 40], [2.4, 46]], g: env(0.2, 2.0, 0.3, 0.45), filter: { type: 'lowpass', f: [[0, 400]] }, trem: { rate: 8, depth: 0.85 } }], 2.6),
  auto: () => play([{ type: 'sawtooth', f: [[0, 70], [1.8, 90]], g: env(0.1, 1.6, 0.3, 0.35), filter: { type: 'lowpass', f: [[0, 700]] }, trem: { rate: 16, depth: 0.7 } }, ...repeatAt({ type: 'square', f: [[0, 380]], g: env(0.01, 0.1, 0.05, 0.16), filter: { type: 'lowpass', f: [[0, 1400]] }, at: 1.6 }, 2, 0.22)], 2.2),
  cart: () => play([...repeatAt({ type: 'noise', g: env(0.003, 0.02, 0.05, 0.45), filter: { type: 'bandpass', f: [[0, 1300]], q: 6 } }, 8, 0.35), ...repeatAt({ type: 'sine', f: [[0, 2600]], g: [[0, 0], [0.005, 0.12], [0.25, 0]] }, 8, 0.35).map((v, i) => ({ ...v, at: (v.at || 0) + 0.17 + (i % 2) * 0.02 })), { type: 'sawtooth', f: [[0, 180], [2.8, 200]], g: env(0.3, 2.2, 0.3, 0.05), filter: { type: 'bandpass', f: [[0, 600]], q: 8 }, vib: { rate: 2, depth: 30 } }], 3.0),
  rocket: () => play([{ type: 'noise', g: env(0.4, 1.8, 0.6, 0.55), filter: { type: 'lowpass', f: [[0, 200], [0.6, 1600], [2.8, 400]] } }, { type: 'sawtooth', f: [[0, 40], [2.8, 30]], g: env(0.4, 1.8, 0.6, 0.3), filter: { type: 'lowpass', f: [[0, 200]] } }], 3.0),
  truck: () => LIB.bus(),
  // ---------- nature ----------
  rain: () => playNature('rain'),
  drizzle: () => playNature('drizzle'),
  storm: () => playNature('storm'),
  thunder: () => playNature('thunder'),
  wind: () => playNature('wind'),
  breeze: () => playNature('breeze'),
  water: () => playNature('water'),
  stream: () => playNature('stream'),
  waterfall: () => playNature('waterfall'),
  splash: () => playNature('splash'),
  birds: () => playNature('birds'),
  fire: () => playNature('fire'),
  leaves: () => playNature('leaves'),
  sea: () => playNature('sea'),
  crickets: () => playNature('crickets'),
  night: () => playNature('night'),
  forest: () => playNature('forest'),
  garden: () => playNature('garden'),
  // ---------- machines & making ----------
  motor: () => play([{ type: 'sawtooth', f: [[0, 60], [0.5, 120], [2.0, 120]], g: env(0.3, 1.5, 0.3, 0.2), filter: { type: 'lowpass', f: [[0, 600]] } }, { type: 'sine', f: [[0, 240], [0.5, 480]], g: env(0.3, 1.5, 0.3, 0.06) }], 2.2),
  gears: () => play(repeatAt({ type: 'noise', g: env(0.001, 0.01, 0.03, 0.35), filter: { type: 'bandpass', f: [[0, 2800]], q: 10 } }, 12, 0.12), 1.6),
  drill: () => play([{ type: 'sawtooth', f: [[0, 300], [0.3, 900], [1.2, 880], [1.5, 300]], g: env(0.1, 1.2, 0.2, 0.18), filter: { type: 'bandpass', f: [[0, 1800]], q: 2 }, vib: { rate: 30, depth: 40 } }], 1.6),
  hammer: () => play(repeatAt({ type: 'noise', g: env(0.001, 0.02, 0.12, 0.6), filter: { type: 'bandpass', f: [[0, 1600]], q: 2 } }, 3, 0.35).concat(repeatAt({ type: 'sine', f: [[0, 160], [0.1, 90]], g: env(0.001, 0.03, 0.1, 0.4) }, 3, 0.35)), 1.1),
  screw: () => play(repeatAt({ type: 'noise', g: env(0.001, 0.008, 0.02, 0.25), filter: { type: 'bandpass', f: [[0, 4000]], q: 12 } }, 8, 0.07), 0.7),
  crane: () => play([{ type: 'sawtooth', f: [[0, 90], [2.0, 110]], g: env(0.2, 1.6, 0.3, 0.2), filter: { type: 'lowpass', f: [[0, 500]] } }, ...repeatAt({ type: 'noise', g: env(0.001, 0.01, 0.04, 0.2), filter: { type: 'bandpass', f: [[0, 2200]], q: 8 } }, 10, 0.2)], 2.2),
  clock: () => play(repeatAt({ type: 'noise', g: env(0.001, 0.005, 0.02, 0.35), filter: { type: 'bandpass', f: [[0, 3500]], q: 10 } }, 6, 0.5).map((v, i) => ({ ...v, filter: { ...v.filter!, f: [[0, i % 2 ? 2800 : 3500]] as Pt[] } })), 3.0),
  bell: () => play([{ type: 'sine', f: [[0, 880]], g: [[0, 0], [0.005, 0.35], [1.6, 0]] }, { type: 'sine', f: [[0, 2210]], g: [[0, 0], [0.005, 0.15], [0.9, 0]] }, { type: 'sine', f: [[0, 1320]], g: [[0, 0], [0.005, 0.12], [1.2, 0]] }], 1.7),
  // ---------- UI ----------
  pop: () => play([{ type: 'sine', f: [[0, 700], [0.08, 220]], g: env(0.003, 0.03, 0.06, 0.35) }], 0.15),
  snap: () => play([{ type: 'noise', g: env(0.001, 0.01, 0.04, 0.4), filter: { type: 'bandpass', f: [[0, 2200]], q: 4 } }, { type: 'sine', f: [[0, 520], [0.06, 780]], g: env(0.002, 0.04, 0.05, 0.2) }], 0.15),
  whoosh: () => play([{ type: 'noise', g: [[0, 0], [0.15, 0.3], [0.45, 0]], filter: { type: 'bandpass', f: [[0, 400], [0.45, 2400]], q: 2 } }], 0.5),
  sparkle: () => play([523, 784, 1047, 1568].map((f, i): Voice => ({ type: 'sine', f: [[0, f]], g: [[0, 0], [0.005, 0.18], [0.35, 0]], at: i * 0.07 })), 0.7),
  click: () => play([{ type: 'noise', g: env(0.001, 0.004, 0.015, 0.3), filter: { type: 'bandpass', f: [[0, 3000]], q: 6 } }], 0.05),
  drum: () => play([{ type: 'sine', f: [[0, 140], [0.15, 60]], g: env(0.002, 0.05, 0.2, 0.6) }], 0.3),
  success: () => play([523, 659, 784, 1047].map((f, i): Voice => ({ type: 'triangle', f: [[0, f]], g: env(0.01, 0.1, 0.15, 0.22), at: i * 0.11 })), 0.8),
  tick: () => play([{ type: 'sine', f: [[0, 1200]], g: env(0.001, 0.01, 0.03, 0.15) }], 0.06),
};

/** Plays a sound effect (after the first user gesture). Returns a handle to stop it early. */
export function sfx(name: SfxName): SfxHandle | null {
  const p = getAudioPrefs();
  if (p.mute) return null;
  try { return LIB[name](); } catch { return null; }
}

// Words used in pictures, stories and builds → the matching sound.
const WORDS: Record<string, SfxName> = {
  cow: 'cow', calf: 'cow', buffalo: 'cow', ox: 'cow', bull: 'cow', cat: 'cat', kitten: 'cat', dog: 'dog', puppy: 'dog',
  bird: 'bird', sparrow: 'bird', pigeon: 'bird', duck: 'duck', rooster: 'rooster', hen: 'hen', chick: 'hen', sheep: 'sheep', lamb: 'sheep', goat: 'goat',
  lion: 'lion', tiger: 'tiger', elephant: 'elephant', frog: 'frog', owl: 'owl', crow: 'crow', horse: 'horse', donkey: 'horse', monkey: 'monkey',
  peacock: 'peacock', parrot: 'parrot', bee: 'bee', snake: 'snake',
  car: 'car', jeep: 'car', taxi: 'car', bike: 'bike', motorbike: 'bike', scooter: 'bike', bicycle: 'bicycle', cycle: 'bicycle', bus: 'bus', truck: 'truck', lorry: 'truck',
  train: 'train', aeroplane: 'aeroplane', airplane: 'aeroplane', plane: 'aeroplane', helicopter: 'helicopter', boat: 'boat', ship: 'boat', ambulance: 'siren', 'fire engine': 'siren',
  tractor: 'tractor', auto: 'auto', 'auto-rickshaw': 'auto', rickshaw: 'auto', cart: 'cart', 'bullock cart': 'cart', rocket: 'rocket',
  rain: 'rain', drizzle: 'drizzle', thunder: 'thunder', storm: 'storm', lightning: 'thunder', wind: 'wind', breeze: 'breeze', water: 'water', river: 'stream', stream: 'stream', pond: 'stream', waterfall: 'waterfall',
  splash: 'splash', sea: 'sea', ocean: 'sea', waves: 'sea', beach: 'sea', fire: 'fire', campfire: 'fire', leaves: 'leaves', tree: 'leaves', cricket: 'crickets', crickets: 'crickets',
  night: 'night', moon: 'night', forest: 'forest', jungle: 'forest', garden: 'garden', park: 'garden', birds: 'birds',
  clock: 'clock', bell: 'bell', hammer: 'hammer', drill: 'drill', gears: 'gears', crane: 'crane', machine: 'motor', fan: 'motor', motor: 'motor',
};
/** Finds a sound for a word or id (e.g. "cow", "bullock-cart", "Aeroplane"). */
export function sfxFor(word: string): SfxName | null {
  const k = word.toLowerCase().replace(/[-_]/g, ' ').trim();
  if (WORDS[k]) return WORDS[k];
  for (const part of k.split(/\s+/).reverse()) if (WORDS[part]) return WORDS[part];
  return null;
}
export const SFX_NAMES = Object.keys(LIB) as SfxName[];
