// App-wide state: account, learner profiles, active learner, preferences, language,
// and learner helpers (attempts, lesson/activity state, rewards) that work offline.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, ApiError } from './api';
import { idb } from './idb';
import { setAudioPrefs, speak as speakRaw, type Lang } from './audio';
import {
  setSyncScope, queueAttempt, queueLessonState, queueActivityState, queueReward, saveSnapshot, loadSnapshot, clearAccountData, flush, type QueuedAttempt,
} from './sync';
import { en, type StringKey } from '../i18n/en';
import { te } from '../i18n/te';
import { presentationFor, type AgeBand, type Avatar, type ClassLevel, type Presentation } from '../shared/levels';
import { applyAttempt, emptyMastery, type MasteryState } from '../shared/mastery';

export interface AccountInfo { id: string; username: string; email: string | null; emailVerified: boolean; role: 'parent' | 'educator' | 'admin'; securityQuestion: string }
export interface Prefs {
  language: Lang; theme: 'light' | 'dark' | 'system'; textSize: 1 | 1.15 | 1.3; reduceMotion: boolean; mute: boolean; volume: number; narration: boolean;
  breakEnabled: boolean; breakMinutes: number; pressureMode: 'auto' | 'manual'; manualIntensity: number; calibration?: { min: number; max: number };
  lastActivity?: { path: string; label: string; at: number }; timers?: boolean;
  /** narration speed: 'slow' | 'normal' (default chosen by class) */
  readingSpeed?: 'slower' | 'slow' | 'normal';
  /** chosen speech voices (voiceURI) */
  voiceEn?: string; voiceTe?: string;
  /** natural (online, neural) English voice; device voice is used when off/offline */
  naturalVoice?: boolean; naturalSpeaker?: string;
  /** re-enter full screen on the next tap if the browser leaves it (default on) */
  keepFullscreen?: boolean;
  artPalettes?: unknown;
}
export interface Profile { id: string; nickname: string; avatar: Avatar; classLevel: ClassLevel; ageBand: AgeBand; prefs: Partial<Prefs> }
export interface LearnerState {
  mastery: Record<string, MasteryState>;
  lessons: Record<string, { state: unknown; updatedAt: number }>;
  activities: Record<string, { state: unknown; updatedAt: number }>;
  rewards: Record<string, number>;
  downloads: Record<string, { version: string; downloadedAt: number }>;
}
const DEFAULT_PREFS: Prefs = { language: 'en', theme: 'system', textSize: 1, reduceMotion: false, mute: false, volume: 0.8, narration: true, breakEnabled: true, breakMinutes: 20, pressureMode: 'auto', manualIntensity: 0.6, timers: false, keepFullscreen: true };
const emptyState = (): LearnerState => ({ mastery: {}, lessons: {}, activities: {}, rewards: {}, downloads: {} });

interface Ctx {
  ready: boolean; online: boolean; offlineMode: boolean;
  account: AccountInfo | null; profiles: Profile[]; profile: Profile | null; session: { persistent: boolean; verifiedUntil: number } | null;
  prefs: Prefs; lang: Lang; t: (k: StringKey) => string; presentation: Presentation | null;
  learner: LearnerState;
  /** true once the learner's saved state (server or offline snapshot + local queue) has loaded */
  learnerReady: boolean;
  refresh: () => Promise<void>;
  selectProfile: (id: string | null) => void;
  updatePrefs: (p: Partial<Prefs>) => Promise<void>;
  parentVerified: boolean;
  verifyParent: (password: string) => Promise<void>;
  signOut: (opts?: { force?: boolean }) => Promise<'ok' | 'unsynced'>;
  // learner helpers
  recordAttempt: (a: Omit<QueuedAttempt, 'id' | 'at'>) => Promise<MasteryState>;
  saveLessonState: (lessonId: string, state: unknown) => Promise<void>;
  saveActivityState: (activityId: string, state: unknown) => Promise<void>;
  award: (rewardId: string) => Promise<boolean>;
  setLastActivity: (path: string, label: string) => void;
  speak: (text: string, opts?: { te?: string; clipId?: string }) => void;
}
const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => { const c = useContext(AppCtx); if (!c) throw new Error('useApp outside provider'); return c; };

const ACTIVE_KEY = 'wl.activeProfile'; // only an id — no secrets in localStorage

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [offlineMode, setOfflineMode] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [session, setSession] = useState<Ctx['session']>(null);
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem(ACTIVE_KEY));
  const [learner, setLearner] = useState<LearnerState>(emptyState);
  const [tick, setTick] = useState(0);
  const [learnerReady, setLearnerReady] = useState(false);
  const learnerRef = useRef(learner);
  learnerRef.current = learner;
  // mastery is also tracked in a ref updated synchronously, so rapid answers never lose an update
  const masteryRef = useRef<Record<string, MasteryState>>({});

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    const i = setInterval(() => setTick((x) => x + 1), 30_000); // re-evaluate parent verification window
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); clearInterval(i); };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const me = await api<{ account: AccountInfo | null; profiles?: Profile[]; session?: Ctx['session'] }>('/auth/me');
      setOfflineMode(false);
      if (!me.account) { setAccount(null); setProfiles([]); setSession(null); setSyncScope(null); localStorage.removeItem('wl.lastAccount'); return; }
      setAccount(me.account); setProfiles(me.profiles || []); setSession(me.session || null);
      setSyncScope(me.account.id);
      localStorage.setItem('wl.lastAccount', me.account.id); // id only, to find the offline snapshot
      await saveSnapshot(me.account.id, 'me', me);
    } catch (e) {
      if (e instanceof ApiError && e.status === 0) {
        // Offline start on a previously authorised device
        const last = localStorage.getItem('wl.lastAccount');
        const snap = last ? await loadSnapshot<{ account: AccountInfo; profiles: Profile[]; session: Ctx['session'] }>(last, 'me') : null;
        if (snap) { setAccount(snap.account); setProfiles(snap.profiles); setSession({ ...(snap.session || { persistent: true }), verifiedUntil: 0 }); setSyncScope(snap.account.id); setOfflineMode(true); }
      } else throw e;
    } finally { setReady(true); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { if (online && offlineMode) void refresh(); }, [online, offlineMode, refresh]);

  const profile = useMemo(() => profiles.find((p) => p.id === activeId) || null, [profiles, activeId]);
  const accountId = account?.id ?? null;
  const profileId = profile?.id ?? null;
  const prefs: Prefs = useMemo(() => ({ ...DEFAULT_PREFS, ...(profile?.prefs || {}) }), [profile]);
  const presentation = useMemo(() => (profile ? presentationFor(profile.classLevel, profile.ageBand) : null), [profile]);
  const lang: Lang = presentation?.teluguAvailable && prefs.language === 'te' ? 'te' : 'en';
  const t = useCallback((k: StringKey) => (lang === 'te' ? te[k] ?? en[k] : en[k]), [lang]);

  // apply visual + audio prefs
  useEffect(() => {
    const root = document.documentElement;
    const dark = prefs.theme === 'dark' || (prefs.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    root.style.setProperty('--text-scale', String(prefs.textSize));
    const sysReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.classList.toggle('reduce-motion', prefs.reduceMotion || sysReduce);
    root.lang = lang === 'te' ? 'te' : 'en';
    root.dataset.tier = presentation?.tier || 'none';
    const tier = presentation?.tier;
    const speed = prefs.readingSpeed || (tier === 'early' ? 'slower' : tier === 'primary' ? 'slow' : 'normal');
    setAudioPrefs({ mute: prefs.mute, volume: prefs.volume, rate: speed === 'slower' ? 0.7 : speed === 'slow' ? 0.8 : 0.92, repeat: !!presentation?.readAloud || tier === 'early' || tier === 'primary', voiceEn: prefs.voiceEn, voiceTe: prefs.voiceTe, natural: prefs.naturalVoice !== false, speaker: prefs.naturalSpeaker || 'luna' });
  }, [prefs, lang, presentation]);

  // load learner state (server, else offline snapshot) and merge local queue
  useEffect(() => {
    if (!accountId || !profileId) { setLearner(emptyState()); masteryRef.current = {}; setLearnerReady(false); return; }
    let cancelled = false;
    setLearnerReady(false);
    (async () => {
      let s: LearnerState = emptyState();
      try {
        const r = await api<{ mastery: MasteryState[]; lessons: { lessonId: string; state: unknown; updatedAt: number }[]; activities: { activityId: string; state: unknown; updatedAt: number }[]; rewards: { rewardId: string; earnedAt: number }[]; downloads: { packId: string; version: string; downloadedAt: number }[] }>(`/p/${profileId}/state`);
        s = {
          mastery: Object.fromEntries(r.mastery.map((m) => [m.objectiveId, m])),
          lessons: Object.fromEntries(r.lessons.map((l) => [l.lessonId, { state: l.state, updatedAt: l.updatedAt }])),
          activities: Object.fromEntries(r.activities.map((l) => [l.activityId, { state: l.state, updatedAt: l.updatedAt }])),
          rewards: Object.fromEntries(r.rewards.map((x) => [x.rewardId, x.earnedAt])),
          downloads: Object.fromEntries(r.downloads.map((x) => [x.packId, { version: x.version, downloadedAt: x.downloadedAt }])),
        };
      } catch {
        s = (await loadSnapshot<LearnerState>(accountId, `${profileId}:state`)) || emptyState();
      }
      // overlay unsynced local changes so nothing is lost after a restart
      const prefix = `q:${accountId}:${profileId}:`;
      const queued: QueuedAttempt[] = [];
      for (const k of await idb.keys(prefix)) {
        const v = await idb.get<{ state?: unknown; updatedAt?: number } & QueuedAttempt>(k);
        if (!v) continue;
        if (k.includes(':lesson:')) { const id = k.split(':lesson:')[1]; if (!s.lessons[id] || s.lessons[id].updatedAt <= (v.updatedAt ?? 0)) s.lessons[id] = { state: v.state, updatedAt: v.updatedAt ?? 0 }; }
        else if (k.includes(':activity:')) { const id = k.split(':activity:')[1]; if (!s.activities[id] || s.activities[id].updatedAt <= (v.updatedAt ?? 0)) s.activities[id] = { state: v.state, updatedAt: v.updatedAt ?? 0 }; }
        else if (k.includes(':reward:')) s.rewards[k.split(':reward:')[1]] = Date.now() / 1000;
        else if (k.includes(':attempt:')) queued.push(v as QueuedAttempt);
      }
      // re-apply attempts that haven't reached the server yet (e.g. made offline before a restart)
      for (const a of queued.sort((x, y) => x.at - y.at)) {
        const cur = s.mastery[a.objectiveId] || emptyMastery(a.objectiveId, a.at);
        s.mastery[a.objectiveId] = applyAttempt(cur, { questionId: a.questionId, correct: a.correct, hintsUsed: a.hintsUsed, mode: a.mode, at: a.at });
      }
      if (!cancelled) { masteryRef.current = s.mastery; setLearner(s); setLearnerReady(true); }
    })();
    return () => { cancelled = true; };
    // keyed by ids only: preference updates (e.g. setLastActivity) must not reload learner data
  }, [accountId, profileId]);
  useEffect(() => { if (account && profile) void saveSnapshot(account.id, `${profile.id}:state`, learner); }, [learner, account, profile]);

  const selectProfile = useCallback((id: string | null) => {
    if (id) localStorage.setItem(ACTIVE_KEY, id); else localStorage.removeItem(ACTIVE_KEY);
    setActiveId(id);
  }, []);

  const updatePrefs = useCallback(async (p: Partial<Prefs>) => {
    if (!profile) return;
    const next = { ...profile, prefs: { ...profile.prefs, ...p } };
    setProfiles((ps) => ps.map((x) => (x.id === profile.id ? next : x)));
    try { await api(`/p/${profile.id}/profile`, { method: 'PATCH', body: { prefs: p } }); } catch { /* kept locally; snapshot below */ }
    if (account) { const snap = await loadSnapshot<{ profiles: Profile[] }>(account.id, 'me'); if (snap) await saveSnapshot(account.id, 'me', { ...snap, profiles: snap.profiles.map((x) => (x.id === profile.id ? next : x)) }); }
  }, [profile, account]);

  const parentVerified = !!session && session.verifiedUntil > Date.now() / 1000;
  void tick;
  const verifyParent = useCallback(async (password: string) => {
    const r = await api<{ verifiedUntil: number }>('/auth/verify-parent', { body: { password } });
    setSession((s) => (s ? { ...s, verifiedUntil: r.verifiedUntil } : s));
  }, []);

  const signOut = useCallback(async (opts?: { force?: boolean }) => {
    if (account) {
      await flush().catch(() => undefined);
      const ok = await clearAccountData(account.id, !!opts?.force);
      if (!ok) return 'unsynced' as const;
    }
    await api('/auth/logout', { body: {} }).catch(() => undefined);
    localStorage.removeItem(ACTIVE_KEY); localStorage.removeItem('wl.lastAccount');
    if ('caches' in window) { const ks = await caches.keys(); await Promise.all(ks.filter((k) => k.startsWith('wl-private') || (account && k === `wl-packs-${account.id}`)).map((k) => caches.delete(k))); }
    setSyncScope(null); setAccount(null); setProfiles([]); setSession(null); setActiveId(null);
    return 'ok' as const;
  }, [account]);

  const recordAttempt = useCallback(async (a: Omit<QueuedAttempt, 'id' | 'at'>) => {
    if (!profile) throw new Error('no profile');
    const full: QueuedAttempt = { ...a, id: crypto.randomUUID(), at: Math.floor(Date.now() / 1000) };
    await queueAttempt(profile.id, full);
    const cur = masteryRef.current[a.objectiveId] || emptyMastery(a.objectiveId, full.at);
    const next = applyAttempt(cur, { questionId: a.questionId, correct: a.correct, hintsUsed: a.hintsUsed, mode: a.mode, at: full.at });
    masteryRef.current = { ...masteryRef.current, [a.objectiveId]: next };
    setLearner((s) => ({ ...s, mastery: { ...s.mastery, [a.objectiveId]: next } }));
    return next;
  }, [profile]);
  const saveLessonState = useCallback(async (lessonId: string, state: unknown) => {
    if (!profile) return;
    setLearner((s) => ({ ...s, lessons: { ...s.lessons, [lessonId]: { state, updatedAt: Math.floor(Date.now() / 1000) } } }));
    await queueLessonState(profile.id, lessonId, state);
  }, [profile]);
  const saveActivityState = useCallback(async (activityId: string, state: unknown) => {
    if (!profile) return;
    setLearner((s) => ({ ...s, activities: { ...s.activities, [activityId]: { state, updatedAt: Math.floor(Date.now() / 1000) } } }));
    await queueActivityState(profile.id, activityId, state);
  }, [profile]);
  const award = useCallback(async (rewardId: string) => {
    if (!profile || learnerRef.current.rewards[rewardId]) return false;
    setLearner((s) => ({ ...s, rewards: { ...s.rewards, [rewardId]: Math.floor(Date.now() / 1000) } }));
    await queueReward(profile.id, rewardId);
    return true;
  }, [profile]);
  const setLastActivity = useCallback((path: string, label: string) => { void updatePrefs({ lastActivity: { path, label, at: Date.now() } }); }, [updatePrefs]);
  const speak = useCallback((text: string, opts?: { te?: string; clipId?: string }) => {
    if (!prefs.narration) return;
    if (lang === 'te' && opts?.te) void speakRaw(opts.te, 'te', opts.clipId, text);
    else void speakRaw(text, 'en', opts?.clipId);
  }, [lang, prefs.narration]);

  const value: Ctx = {
    ready, online, offlineMode, account, profiles, profile, session, prefs, lang, t, presentation, learner, learnerReady,
    refresh, selectProfile, updatePrefs, parentVerified, verifyParent, signOut, recordAttempt, saveLessonState, saveActivityState, award, setLastActivity, speak,
  };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

/** Localised text helper for content objects. */
export function useL() {
  const { lang } = useApp();
  return useCallback((l: { en: string; te?: string } | undefined) => (l ? (lang === 'te' && l.te ? l.te : l.en) : ''), [lang]);
}
