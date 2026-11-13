// App-wide state: account, learner profiles, active learner, preferences, language,
// and learner helpers (attempts, lesson/activity state, rewards) that work offline.
// Offline start uses a local, time-limited offline entitlement (lib/offline.ts) — never a server
// credential. Uploads wait until GET /auth/me confirms a session for the same account (lib/sync.ts).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, ApiError } from './api';
import { idb } from './idb';
import { setAudioPrefs, speak as speakRaw, type Lang } from './audio';
import { refreshSfxVolume } from './sfx';
import {
  setSyncScope, queueAttempt, queueLessonState, queueActivityState, queueReward, saveSnapshot, loadSnapshot, clearAccountData, clearAllPrivateData,
  countPending, flush, setRevalidator, onAuthLost, snapKey, type QueuedAttempt,
} from './sync';
import {
  authorizedProfiles, createEntitlement, entitlementState, getDeviceId, getLastAccount, loadEntitlement, removeEntitlement, renewEntitlement,
  saveEntitlement, setLastAccount, OFFLINE_DEFAULT_DAYS, type EntitlementState, type OfflineEntitlement,
} from './offline';
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
  /** syllabus (set by a parent): Telangana SCERT (default), Andhra Pradesh, or CBSE (NCERT) */
  board?: 'ts' | 'ap' | 'cbse';
}
export interface Profile { id: string; nickname: string; avatar: Avatar; classLevel: ClassLevel; ageBand: AgeBand; prefs: Partial<Prefs> }
export interface LearnerState {
  mastery: Record<string, MasteryState>;
  lessons: Record<string, { state: unknown; updatedAt: number }>;
  activities: Record<string, { state: unknown; updatedAt: number }>;
  rewards: Record<string, number>;
  downloads: Record<string, { version: string; downloadedAt: number }>;
}
/** Snapshot = learner state + ids of queued attempts already folded into its mastery (no double count). */
type LearnerSnapshot = LearnerState & { appliedAttempts?: string[] };
const DEFAULT_PREFS: Prefs = { language: 'en', theme: 'system', textSize: 1, reduceMotion: false, mute: false, volume: 0.8, narration: true, breakEnabled: true, breakMinutes: 20, pressureMode: 'auto', manualIntensity: 0.6, timers: false, keepFullscreen: true };
const emptyState = (): LearnerState => ({ mastery: {}, lessons: {}, activities: {}, rewards: {}, downloads: {} });

type MeResponse = { account: AccountInfo | null; profiles?: Profile[]; session?: { persistent: boolean; verifiedUntil: number } };

/** Learner state from the server (used at load and to save offline snapshots of every profile). */
export async function loadServerLearnerState(pid: string): Promise<LearnerState> {
  const r = await api<{ mastery: MasteryState[]; lessons: { lessonId: string; state: unknown; updatedAt: number }[]; activities: { activityId: string; state: unknown; updatedAt: number }[]; rewards: { rewardId: string; earnedAt: number }[]; downloads: { packId: string; version: string; downloadedAt: number }[] }>(`/p/${pid}/state`);
  return {
    mastery: Object.fromEntries(r.mastery.map((m) => [m.objectiveId, m])),
    lessons: Object.fromEntries(r.lessons.map((l) => [l.lessonId, { state: l.state, updatedAt: l.updatedAt }])),
    activities: Object.fromEntries(r.activities.map((l) => [l.activityId, { state: l.state, updatedAt: l.updatedAt }])),
    rewards: Object.fromEntries(r.rewards.map((x) => [x.rewardId, x.earnedAt])),
    downloads: Object.fromEntries(r.downloads.map((x) => [x.packId, { version: x.version, downloadedAt: x.downloadedAt }])),
  };
}
/** Which profiles have their data saved on this device for offline use. */
export async function offlineDataStatus(accountId: string, pids: string[]): Promise<Record<string, boolean>> {
  const me = await idb.get(snapKey(accountId, 'me')).catch(() => undefined);
  const out: Record<string, boolean> = {};
  for (const pid of pids) out[pid] = !!me && !!(await idb.get(snapKey(accountId, `${pid}:state`)).catch(() => undefined));
  return out;
}

export interface OfflineInfo {
  entitlement: OfflineEntitlement | null;
  entState: EntitlementState;
  /** uploads are paused: the server session for this account ended; a parent must sign in again */
  reauth: { accountId: string; username: string; pending: number } | null;
  /** offline start refused (no/expired entitlement) — pending work is kept, never shown to others */
  blocked: { reason: 'expired' | 'not-enabled'; username?: string; pending: number } | null;
}

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
  // offline
  offline: OfflineInfo;
  /** parent turns on offline use for this device (requires a fresh parent check) */
  enableOffline: (days?: number) => Promise<void>;
  disableOffline: () => Promise<void>;
  /** saves account + every authorised learner's data on this device (online, entitlement on) */
  saveOfflineData: () => Promise<void>;
  /** "Remove this device's data": every account's private data here, then sign out */
  removeDeviceData: (opts?: { force?: boolean }) => Promise<'ok' | 'unsynced'>;
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
  const [ent, setEnt] = useState<OfflineEntitlement | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [reauth, setReauth] = useState<OfflineInfo['reauth']>(null);
  const [blocked, setBlocked] = useState<OfflineInfo['blocked']>(null);
  const learnerRef = useRef(learner);
  learnerRef.current = learner;
  // mastery is also tracked in a ref updated synchronously, so rapid answers never lose an update
  const masteryRef = useRef<Record<string, MasteryState>>({});
  // queued attempt ids already applied to masteryRef (stored with snapshots → never applied twice)
  const appliedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    const i = setInterval(() => setTick((x) => x + 1), 30_000); // re-evaluate parent verification + offline window
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); clearInterval(i); };
  }, []);

  /** Offline start (no network / server unreachable): only with a valid entitlement for this device. */
  const startOffline = useCallback(async () => {
    const last = await getLastAccount();
    if (!last) { setAccount(null); setProfiles([]); setSession(null); return; }
    const [e, dev] = await Promise.all([loadEntitlement(last), getDeviceId()]);
    setDeviceId(dev);
    const st = entitlementState(e, { deviceId: dev, accountId: last });
    const snap = st === 'valid' ? await loadSnapshot<MeResponse>(last, 'me') : null;
    if (e && st === 'valid' && snap?.account) {
      setAccount(snap.account); setProfiles(authorizedProfiles(e, snap.profiles || []));
      setSession({ persistent: !e.sharedSession, verifiedUntil: 0 });
      setEnt(e); setBlocked(null); setOfflineMode(true);
      setSyncScope(last, { verified: false }); // saved locally; uploaded only after the server confirms
      return;
    }
    // no (valid) offline permission: keep the work, show nothing private
    setAccount(null); setProfiles([]); setSession(null); setSyncScope(null); setOfflineMode(false);
    setBlocked({ reason: st === 'expired' ? 'expired' : 'not-enabled', username: st === 'expired' ? e?.username : undefined, pending: await countPending(last) });
  }, []);

  const refresh = useCallback(async () => {
    try {
      const me = await api<MeResponse>('/auth/me');
      const last = await getLastAccount();
      const dev = await getDeviceId();
      setDeviceId(dev);
      if (!me.account) {
        // Not signed in on the server (session expired / revoked / signed out elsewhere).
        const e = last ? await loadEntitlement(last) : null;
        const pending = last ? await countPending(last) : 0;
        const st = entitlementState(e, { deviceId: dev, accountId: last });
        const snap = last && st === 'valid' ? await loadSnapshot<MeResponse>(last, 'me') : null;
        if (last && e && st === 'valid' && snap?.account) {
          // keep learning on this device; uploads pause until a parent signs in to THIS account again
          setAccount(snap.account); setProfiles(authorizedProfiles(e, snap.profiles || []));
          setSession({ persistent: !e.sharedSession, verifiedUntil: 0 });
          setEnt(e); setOfflineMode(true); setBlocked(null);
          setSyncScope(last, { verified: false });
          setReauth({ accountId: last, username: e.username, pending });
          return;
        }
        setOfflineMode(false); setAccount(null); setProfiles([]); setSession(null); setSyncScope(null); setEnt(null); setBlocked(null);
        setReauth(last && pending > 0 ? { accountId: last, username: e?.username || snap?.account?.username || 'the same account', pending } : null);
        return;
      }
      // Signed in. If a different account was last used here, its local data stays scoped to it
      // (never shown or uploaded under this account).
      await setLastAccount(me.account.id);
      setOfflineMode(false); setBlocked(null); setReauth(null);
      setAccount(me.account); setProfiles(me.profiles || []); setSession(me.session || null);
      let e = await loadEntitlement(me.account.id);
      if (e && e.deviceId !== dev) { await removeEntitlement(me.account.id); e = null; }
      if (e) { e = renewEntitlement(e, { profileIds: (me.profiles || []).map((p) => p.id) }); await saveEntitlement(e); }
      setEnt(e);
      if (e) await saveSnapshot(me.account.id, 'me', me);
      setSyncScope(me.account.id, { verified: true });
    } catch (e) {
      if (e instanceof ApiError && (e.status === 0 || e.status >= 500)) await startOffline();
      else throw e;
    } finally { setReady(true); }
  }, [startOffline]);
  useEffect(() => { void refresh(); }, [refresh]);
  // sync asks for a fresh /auth/me before uploading (reconnect, reopen, Retry); a refused upload re-checks
  useEffect(() => {
    setRevalidator(refresh);
    onAuthLost(() => { void refresh(); });
    return () => { setRevalidator(null); onAuthLost(null); };
  }, [refresh]);

  // offline window ends while the app is open offline → lock (pending work stays on the device)
  useEffect(() => {
    if (!offlineMode || !ent || !deviceId) return;
    if (entitlementState(ent, { deviceId, accountId: ent.accountId }) !== 'valid') {
      void countPending(ent.accountId).then((pending) => {
        setAccount(null); setProfiles([]); setSession(null); setSyncScope(null); setOfflineMode(false);
        setBlocked({ reason: 'expired', username: ent.username, pending });
      });
    }
  }, [tick, offlineMode, ent, deviceId]);

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
    refreshSfxVolume();
  }, [prefs, lang, presentation]);

  // load learner state (server, else offline snapshot) and merge local queue
  useEffect(() => {
    if (!accountId || !profileId) { setLearner(emptyState()); masteryRef.current = {}; appliedRef.current = new Set(); setLearnerReady(false); return; }
    let cancelled = false;
    setLearnerReady(false);
    (async () => {
      let s: LearnerState = emptyState();
      let alreadyApplied = new Set<string>();
      try {
        if (offlineMode) throw new Error('offline');
        s = await loadServerLearnerState(profileId);
      } catch {
        const snap = await loadSnapshot<LearnerSnapshot>(accountId, `${profileId}:state`);
        if (snap) { const { appliedAttempts, ...rest } = snap; s = { ...emptyState(), ...rest }; alreadyApplied = new Set(appliedAttempts || []); }
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
      const applied = new Set<string>();
      for (const a of queued.sort((x, y) => x.at - y.at)) {
        applied.add(a.id);
        if (alreadyApplied.has(a.id)) continue; // already part of the offline snapshot's mastery
        const cur = s.mastery[a.objectiveId] || emptyMastery(a.objectiveId, a.at);
        s.mastery[a.objectiveId] = applyAttempt(cur, { questionId: a.questionId, correct: a.correct, hintsUsed: a.hintsUsed, mode: a.mode, at: a.at });
      }
      if (!cancelled) { masteryRef.current = s.mastery; appliedRef.current = applied; setLearner(s); setLearnerReady(true); }
    })();
    return () => { cancelled = true; };
    // keyed by ids only: preference updates (e.g. setLastActivity) must not reload learner data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, profileId]);
  // offline snapshots are kept only while a parent has turned offline use on for this device
  const entOn = !!ent && ent.accountId === accountId;
  useEffect(() => {
    if (!entOn || !accountId || !profileId || !learnerReady) return;
    const snap: LearnerSnapshot = { ...learner, appliedAttempts: [...appliedRef.current].slice(-5000) };
    void saveSnapshot(accountId, `${profileId}:state`, snap).catch(() => undefined);
  }, [learner, accountId, profileId, entOn, learnerReady]);

  const selectProfile = useCallback((id: string | null) => {
    if (id) localStorage.setItem(ACTIVE_KEY, id); else localStorage.removeItem(ACTIVE_KEY);
    setActiveId(id);
  }, []);

  const updatePrefs = useCallback(async (p: Partial<Prefs>) => {
    if (!profile) return;
    const next = { ...profile, prefs: { ...profile.prefs, ...p } };
    setProfiles((ps) => ps.map((x) => (x.id === profile.id ? next : x)));
    if (!offlineMode) { try { await api(`/p/${profile.id}/profile`, { method: 'PATCH', body: { prefs: p } }); } catch { /* kept locally; snapshot below */ } }
    if (account) { const snap = await loadSnapshot<MeResponse>(account.id, 'me'); if (snap?.profiles) await saveSnapshot(account.id, 'me', { ...snap, profiles: snap.profiles.map((x) => (x.id === profile.id ? next : x)) }); }
  }, [profile, account, offlineMode]);

  const parentVerified = !!session && session.verifiedUntil > Date.now() / 1000;
  void tick;
  const verifyParent = useCallback(async (password: string) => {
    const r = await api<{ verifiedUntil: number }>('/auth/verify-parent', { body: { password } });
    setSession((s) => (s ? { ...s, verifiedUntil: r.verifiedUntil } : s));
  }, []);

  const resetToSignedOut = useCallback(async () => {
    localStorage.removeItem(ACTIVE_KEY);
    await setLastAccount(null);
    setSyncScope(null); setAccount(null); setProfiles([]); setSession(null); setActiveId(null); setEnt(null); setReauth(null); setBlocked(null); setOfflineMode(false);
  }, []);

  const signOut = useCallback(async (opts?: { force?: boolean }) => {
    if (account) {
      await flush().catch(() => undefined);
      // purges this account's queue, drafts, snapshots, download choices and offline entitlement
      const ok = await clearAccountData(account.id, !!opts?.force);
      if (!ok) return 'unsynced' as const;
    }
    await api('/auth/logout', { body: {} }).catch(() => undefined);
    if ('caches' in window) { const ks = await caches.keys(); await Promise.all(ks.filter((k) => k.startsWith('wl-private') || k.startsWith('wl-packs-')).map((k) => caches.delete(k))); }
    await resetToSignedOut();
    return 'ok' as const;
  }, [account, resetToSignedOut]);

  const saveOfflineData = useCallback(async () => {
    if (!account || offlineMode) return;
    const e = await loadEntitlement(account.id);
    if (!e) return;
    const me = await api<MeResponse>('/auth/me');
    if (me.account?.id !== account.id) return;
    await saveSnapshot(account.id, 'me', me);
    for (const p of authorizedProfiles(e, me.profiles || [])) {
      if (p.id === profileId) continue; // the active learner's snapshot is kept up to date continuously
      const s = await loadServerLearnerState(p.id).catch(() => null);
      if (s) await saveSnapshot(account.id, `${p.id}:state`, { ...s, appliedAttempts: [] } satisfies LearnerSnapshot);
    }
  }, [account, offlineMode, profileId]);

  const enableOffline = useCallback(async (days = OFFLINE_DEFAULT_DAYS) => {
    if (!account || !session) throw new Error('Sign in first.');
    if (session.verifiedUntil <= Date.now() / 1000) throw new Error('A parent needs to confirm their password first.');
    const dev = await getDeviceId();
    const cur = await loadEntitlement(account.id);
    const e = cur && cur.deviceId === dev
      ? renewEntitlement(cur, { days, profileIds: profiles.map((p) => p.id) })
      : createEntitlement({ accountId: account.id, username: account.username, deviceId: dev, profileIds: profiles.map((p) => p.id), days, sharedSession: !session.persistent });
    await saveEntitlement(e);
    setEnt(e);
    await setLastAccount(account.id);
    await saveOfflineData().catch(() => undefined);
  }, [account, session, profiles, saveOfflineData]);

  const disableOffline = useCallback(async () => {
    if (!account) return;
    await removeEntitlement(account.id);
    await idb.clearPrefixes([`snap:${account.id}:`]); // snapshots exist only for offline start
    setEnt(null);
  }, [account]);

  const removeDeviceData = useCallback(async (opts?: { force?: boolean }) => {
    if (account) await flush().catch(() => undefined);
    const ok = await clearAllPrivateData(!!opts?.force);
    if (!ok) return 'unsynced' as const;
    try { for (const k of Object.keys(localStorage)) if (k.startsWith('wl.art.deleted.')) localStorage.removeItem(k); } catch { /* blocked */ }
    await api('/auth/logout', { body: {} }).catch(() => undefined);
    await resetToSignedOut();
    return 'ok' as const;
  }, [account, resetToSignedOut]);

  const recordAttempt = useCallback(async (a: Omit<QueuedAttempt, 'id' | 'at'>) => {
    if (!profile) throw new Error('no profile');
    const full: QueuedAttempt = { ...a, id: crypto.randomUUID(), at: Math.floor(Date.now() / 1000) };
    await queueAttempt(profile.id, full);
    const cur = masteryRef.current[a.objectiveId] || emptyMastery(a.objectiveId, full.at);
    const next = applyAttempt(cur, { questionId: a.questionId, correct: a.correct, hintsUsed: a.hintsUsed, mode: a.mode, at: full.at });
    masteryRef.current = { ...masteryRef.current, [a.objectiveId]: next };
    appliedRef.current.add(full.id);
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

  const entState: EntitlementState = deviceId ? entitlementState(ent, { deviceId, accountId }) : 'none';
  const offline: OfflineInfo = { entitlement: ent && ent.accountId === accountId ? ent : null, entState, reauth, blocked };
  const value: Ctx = {
    ready, online, offlineMode, account, profiles, profile, session, prefs, lang, t, presentation, learner, learnerReady,
    refresh, selectProfile, updatePrefs, parentVerified, verifyParent, signOut,
    offline, enableOffline, disableOffline, saveOfflineData, removeDeviceData,
    recordAttempt, saveLessonState, saveActivityState, award, setLastActivity, speak,
  };
  return (
    <AppCtx.Provider value={value}>
      {ready && !account && blocked ? <OfflineBlocked info={blocked} online={online} retry={refresh} /> : children}
    </AppCtx.Provider>
  );
}

/** Shown when the app is opened without internet and offline use is not (or no longer) allowed. */
function OfflineBlocked({ info, online, retry }: { info: NonNullable<OfflineInfo['blocked']>; online: boolean; retry: () => Promise<void> }) {
  return (
    <main id="main" className="main" tabIndex={-1}>
      <div className="card stack" role="alert" style={{ maxWidth: 520, margin: '48px auto' }}>
        <h1 style={{ margin: 0 }}>{info.reason === 'expired' ? 'Please connect to the internet' : 'WonderLab needs the internet here'}</h1>
        {info.reason === 'expired'
          ? <p style={{ margin: 0 }}>Offline use on this device has ended. A parent needs to connect and sign in{info.username ? <> as <b>{info.username}</b></> : null} to check the account again. Then WonderLab works offline again.</p>
          : <p style={{ margin: 0 }}>Offline use has not been turned on for this device. Connect to the internet and sign in. A parent can turn on offline use in Downloads.</p>}
        {info.pending > 0 && <p className="muted" style={{ margin: 0 }}>{info.pending} saved item{info.pending === 1 ? ' is' : 's are'} kept safely on this device and will upload after that parent signs in.</p>}
        <p className="muted small" style={{ margin: 0 }}>{online ? 'Checking the connection…' : 'You are offline.'}</p>
        <div className="row"><button className="btn primary" onClick={() => void retry()}>Try again</button></div>
      </div>
    </main>
  );
}

/** Localised text helper for content objects. */
export function useL() {
  const { lang } = useApp();
  return useCallback((l: { en: string; te?: string } | undefined) => (l ? (lang === 'te' && l.te ? l.te : l.en) : ''), [lang]);
}
