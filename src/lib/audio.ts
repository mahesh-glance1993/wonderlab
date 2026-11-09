// Narration + feedback sounds. Audio only starts after a user gesture (browser policy and spec).
// Narration always has a written equivalent on screen; callers pass the same text they display.

export type Lang = 'en' | 'te';
interface AudioPrefs { mute: boolean; volume: number; rate: number; repeat: boolean; voiceEn?: string; voiceTe?: string; natural: boolean; speaker: string }
let prefs: AudioPrefs = { mute: false, volume: 0.8, rate: 0.8, repeat: false, natural: true, speaker: 'luna' };
let naturalBroken = 0; // timestamp of last natural-voice failure (back off for a minute)
let unlocked = false;
let actx: AudioContext | null = null;
let lastSaid: { text: string; lang: Lang; clipId?: string; fallbackEn?: string } | null = null;
const listeners = new Set<(speaking: boolean) => void>();

export const setAudioPrefs = (p: Partial<AudioPrefs>) => { prefs = { ...prefs, ...p }; if (prefs.mute) stopSpeaking(); };
export const onSpeaking = (fn: (s: boolean) => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
// Narration requested before the first tap/keypress (e.g. auto read-aloud right after a page
// refresh) can't play yet; remember it and play it on the first gesture instead of dropping it.
let pending: { text: string; lang: Lang; clipId?: string; fallbackEn?: string; at: number } | null = null;
if (typeof window !== 'undefined') {
  const unlock = () => {
    unlocked = true;
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('keydown', unlock, true);
    if (actx && actx.state === 'suspended') void actx.resume();
    const p = pending; pending = null;
    if (p && Date.now() - p.at < 15000) setTimeout(() => void speak(p.text, p.lang, p.clipId, p.fallbackEn), 50);
  };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
}

/** Recorded narration clips (listed in public/audio/te/manifest.json) are preferred when available. */
let manifest: Record<string, Record<string, string>> | null = null;
async function clipFor(id: string | undefined, lang: Lang) {
  if (!id) return null;
  if (!manifest) manifest = await fetch('/audio/te/manifest.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
  return manifest?.[lang]?.[id] ?? null;
}
let currentClip: HTMLAudioElement | null = null;

// Chrome loads voices asynchronously; wait for them (briefly) instead of concluding "no voice".
let voicesReady: Promise<void> | null = null;
function loadVoices(): Promise<void> {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  if (speechSynthesis.getVoices().length) return Promise.resolve();
  if (!voicesReady) {
    voicesReady = new Promise((resolve) => {
      const done = () => { speechSynthesis.removeEventListener('voiceschanged', done); resolve(); };
      speechSynthesis.addEventListener('voiceschanged', done);
      setTimeout(done, 1500);
    });
  }
  return voicesReady;
}
if (typeof window !== 'undefined') void loadVoices();

const LOCALE_RANK: Record<Lang, string[]> = { te: ['te-in', 'te'], en: ['en-in', 'en-gb', 'en-us', 'en-au', 'en'] };
const langOf = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase();
/**
 * Higher = more natural. Neural/"Natural" (Edge), Google (Chrome/Android) and Apple enhanced voices
 * sound far less robotic than the old desktop voices (Microsoft David/Zira/Mark, eSpeak).
 */
export function voiceQuality(v: SpeechSynthesisVoice, lang: Lang): number {
  const n = v.name.toLowerCase();
  let q = 0;
  if (/natural|neural/.test(n)) q += 100;
  if (/google/.test(n)) q += 60;
  if (/premium|enhanced|siri/.test(n)) q += 55;
  if (/online/.test(n)) q += 30;
  if (/david|zira|mark|hazel|george|ravi|heera|espeak|desktop|microsoft .* - english (united states)$/.test(n) && !/natural|online/.test(n)) q -= 40;
  const rank = LOCALE_RANK[lang].findIndex((p) => langOf(v).startsWith(p));
  q += rank < 0 ? -1000 : (LOCALE_RANK[lang].length - rank) * 8;
  return q;
}
/** Voices for a language, most natural first. */
export function listVoices(lang: Lang): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  return speechSynthesis.getVoices().filter((v) => voiceQuality(v, lang) > -500).sort((a, b) => voiceQuality(b, lang) - voiceQuality(a, lang));
}
export function voiceFor(lang: Lang): SpeechSynthesisVoice | null {
  const list = listVoices(lang);
  const chosen = lang === 'te' ? prefs.voiceTe : prefs.voiceEn;
  return (chosen && list.find((v) => v.voiceURI === chosen)) || list[0] || null;
}
export { loadVoices };
export const hasVoice = (lang: Lang) => !!voiceFor(lang);
const hasVoiceSync = (lang: Lang) => ('speechSynthesis' in window) && !!voiceFor(lang);

/** Plays server-generated natural speech. Resolves false (so the caller falls back) if it can't start. */
function playNatural(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    const url = `/api/tts?v=${encodeURIComponent(prefs.speaker)}&text=${encodeURIComponent(text.replace(/<[^>]+>/g, ' ').slice(0, 400))}`;
    const el = new Audio(url);
    el.preload = 'auto';
    el.volume = prefs.volume;
    // reading speed: the natural voice speaks at a calm pace already; slow it gently, keeping pitch
    el.playbackRate = Math.max(0.75, Math.min(1, prefs.rate / 0.92));
    (el as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
    let settled = false;
    const fail = () => { if (!settled) { settled = true; naturalBroken = Date.now(); if (currentClip === el) currentClip = null; resolve(false); } };
    const timer = setTimeout(fail, 6000); // too slow to start → use the device voice
    el.onerror = fail;
    el.onplaying = () => { if (!settled) { settled = true; clearTimeout(timer); resolve(true); } listeners.forEach((l) => l(true)); };
    el.onended = () => { if (currentClip === el) currentClip = null; listeners.forEach((l) => l(false)); };
    currentClip = el;
    el.play().catch(() => { clearTimeout(timer); fail(); });
  });
}

let current: SpeechSynthesisUtterance | null = null; // keep a reference: Chrome can garbage-collect and cut speech
let keepAlive: ReturnType<typeof setInterval> | null = null;

/**
 * Speaks text. For Telugu, if this device has no Telugu voice and an English equivalent is given,
 * the English is spoken instead (the Telugu text stays on screen). Returns whether audio started.
 */
export async function speak(text: string, lang: Lang = 'en', clipId?: string, fallbackEn?: string, isRepeat = false): Promise<boolean> {
  lastSaid = { text, lang, clipId, fallbackEn };
  if (!isRepeat) {
    if (NOT_REPEATED.test(text.trim()) || NOT_REPEATED.test((fallbackEn || '').trim())) { /* keep repeating the instruction, not the praise */ }
    else { repeatItem = { text, lang, clipId, fallbackEn }; repeatCount = 0; }
  }
  scheduleRepeat();
  if (prefs.mute || !text) return false;
  if (!unlocked) { pending = { text, lang, clipId, fallbackEn, at: Date.now() }; return false; }
  const wasBusy = ('speechSynthesis' in window && (speechSynthesis.speaking || speechSynthesis.pending)) || !!currentClip;
  stopSpeaking();
  const clip = await clipFor(clipId, lang);
  if (clip) {
    currentClip = new Audio(clip);
    currentClip.volume = prefs.volume;
    listeners.forEach((l) => l(true));
    currentClip.onended = () => { currentClip = null; listeners.forEach((l) => l(false)); };
    await currentClip.play().catch(() => listeners.forEach((l) => l(false)));
    return true;
  }
  // Natural (neural) English voice from the server, cached; device voice is the fallback.
  const enText = lang === 'en' ? text : (!hasVoiceSync('te') ? fallbackEn : undefined);
  if (enText && prefs.natural && navigator.onLine && Date.now() - naturalBroken > 60_000) {
    const ok = await playNatural(enText);
    if (ok) return true;
  }
  if (!('speechSynthesis' in window)) return false;
  await loadVoices();
  let useLang = lang, useText = text;
  let v = voiceFor(lang);
  if (lang === 'te' && !v) {
    if (!fallbackEn) return false; // no Telugu voice on this device — the written text remains
    useLang = 'en'; useText = fallbackEn; v = voiceFor('en');
  }
  const u = new SpeechSynthesisUtterance(useText.replace(/<[^>]+>/g, ' '));
  if (v) u.voice = v;
  u.lang = v?.lang || (useLang === 'te' ? 'te-IN' : 'en-IN');
  u.rate = prefs.rate;
  u.pitch = 1;
  u.volume = prefs.volume;
  u.onstart = () => listeners.forEach((l) => l(true));
  u.onend = () => { if (keepAlive) { clearInterval(keepAlive); keepAlive = null; } listeners.forEach((l) => l(false)); };
  u.onerror = (ev) => {
    if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }
    listeners.forEach((l) => l(false));
    // online (natural) voices can fail on a poor connection: retry once with the best on-device voice
    if (v && !v.localService && (ev.error === 'network' || ev.error === 'synthesis-failed' || ev.error === 'synthesis-unavailable')) {
      const local = listVoices(useLang).find((x) => x.localService);
      if (local) { const r = new SpeechSynthesisUtterance(u.text); r.voice = local; r.lang = local.lang; r.rate = u.rate; r.pitch = u.pitch; r.volume = u.volume; current = r; speechSynthesis.speak(r); }
    }
  };
  current = u;
  // Chrome drops an utterance queued in the same tick as cancel(); give it a moment.
  if (wasBusy) await new Promise((r) => setTimeout(r, 80));
  if (current !== u) return false; // a newer request replaced this one
  if (speechSynthesis.paused) speechSynthesis.resume();
  speechSynthesis.speak(u);
  // Chrome on desktop stops long utterances after ~15 s unless nudged.
  if (keepAlive) clearInterval(keepAlive);
  keepAlive = setInterval(() => { if (!speechSynthesis.speaking) { clearInterval(keepAlive!); keepAlive = null; } else { speechSynthesis.pause(); speechSynthesis.resume(); } }, 10000);
  return true;
}
// ---- repeat an unfinished instruction after the child has been idle ----
const REPEAT_AFTER_MS = 15000, MAX_REPEATS = 3;
const NOT_REPEATED = /^(well done|great|correct|super|awesome|brilliant|good job|you did it|try again|not quite|level up|చాలా బాగుంది|అద్భుతం|సరైనది|మళ్ళీ ప్రయత్నించు)/i;
let repeatTimer: ReturnType<typeof setTimeout> | null = null;
let repeatCount = 0;
let repeatItem: { text: string; lang: Lang; clipId?: string; fallbackEn?: string } | null = null;
function scheduleRepeat() {
  if (repeatTimer) clearTimeout(repeatTimer);
  repeatTimer = null;
  if (!prefs.repeat || !repeatItem || repeatCount >= MAX_REPEATS) return;
  repeatTimer = setTimeout(() => {
    if (!repeatItem || document.hidden || prefs.mute) return scheduleRepeat();
    if ('speechSynthesis' in window && speechSynthesis.speaking) return scheduleRepeat();
    repeatCount++;
    const r = repeatItem;
    void speak(r.text, r.lang, r.clipId, r.fallbackEn, true);
  }, REPEAT_AFTER_MS);
}
/** Stop repeating (e.g. the question was completed or the page changed). */
export function clearRepeat() { repeatItem = null; repeatCount = 0; if (repeatTimer) clearTimeout(repeatTimer); repeatTimer = null; }
if (typeof window !== 'undefined') {
  const activity = () => { if (repeatItem) scheduleRepeat(); }; // any tap/key restarts the idle wait
  window.addEventListener('pointerdown', activity, true);
  window.addEventListener('keydown', activity, true);
}

export const replay = () => (lastSaid ? speak(lastSaid.text, lastSaid.lang, lastSaid.clipId, lastSaid.fallbackEn) : Promise.resolve(false));
export function stopSpeaking() {
  try { speechSynthesis.cancel(); } catch { /* not supported */ }
  if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }
  if (currentClip) { currentClip.pause(); currentClip = null; }
  listeners.forEach((l) => l(false));
}

/** Short, soft confirmation tones (no harsh buzzers). */
export function tone(kind: 'correct' | 'wrong' | 'tap' | 'complete') {
  if (prefs.mute || !unlocked) return;
  try {
    actx = actx || new AudioContext();
    if (actx.state === 'suspended') void actx.resume();
    const seq = { correct: [523, 659, 784], wrong: [330, 262], tap: [660], complete: [523, 659, 784, 1047] }[kind];
    const dur = kind === 'tap' ? 0.06 : 0.12;
    const t0 = actx.currentTime;
    seq.forEach((f, i) => {
      const o = actx!.createOscillator(), g = actx!.createGain(), t = t0 + i * dur;
      o.type = kind === 'wrong' ? 'triangle' : 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06 * prefs.volume + 0.0001, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(actx!.destination);
      o.start(t);
      o.stop(t + dur + 0.05);
    });
  } catch { /* audio unavailable */ }
}

/** Current audio preferences (used by the sound-effects library). */
export const getAudioPrefs = () => prefs;
