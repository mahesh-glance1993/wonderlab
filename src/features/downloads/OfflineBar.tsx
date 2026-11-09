// Global offline status: first-run automatic download, progress, confirmations (metered/low
// storage), "Offline · saved on this device" with items awaiting sync, "Download required" for
// parts not on this device, and the "sign in again to upload" prompt. Mounted once in App.
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { retrySync } from '../../lib/sync';
import { Icon } from '../../ui/Icon';
import { dismissPrompt, ensurePacks, initDownloads, resumeDownloads, RUNNING_BUILD, useDownloads } from './manager';
import { fmtBytes, packsForClass, packsForPath } from './plan';
import { useSyncState } from './useOffline';
import './downloads.css';

export function OfflineBar() {
  const { account, profile, profiles, online, offlineMode, session, offline, saveOfflineData } = useApp();
  const dl = useDownloads();
  const sync = useSyncState();
  const loc = useLocation();
  const nav = useNavigate();
  const [chunkMissing, setChunkMissing] = useState<string | null>(null);
  const [shownDone, setShownDone] = useState(false);
  const savedData = useRef<string | null>(null);

  useEffect(() => { void initDownloads().then(() => resumeDownloads()); }, []);

  // A screen's code could not be loaded offline → it is not downloaded on this device.
  useEffect(() => {
    const h = () => { if (!navigator.onLine) setChunkMissing(location.pathname); };
    window.addEventListener('vite:preloadError', h);
    window.addEventListener('wl-download-required', h);
    return () => { window.removeEventListener('vite:preloadError', h); window.removeEventListener('wl-download-required', h); };
  }, []);
  useEffect(() => { if (chunkMissing && chunkMissing !== loc.pathname) setChunkMissing(null); }, [loc.pathname, chunkMissing]);

  // First online sign-in on a trusted (non-shared) device: download the app + the active learner's
  // class first, then the other learners' classes (each becomes available as it finishes).
  const ent = offline.entitlement;
  const trusted = !!session?.persistent;
  const classKey = [profile?.classLevel, ...profiles.map((p) => p.classLevel)].join(',');
  useEffect(() => {
    if (!account || !profile || !online || offlineMode || !dl.loaded) return;
    if (!trusted && !ent) return; // shared device: only what a parent chooses in Downloads
    const order = [...packsForClass(profile.classLevel), ...profiles.filter((p) => p.id !== profile.id && (!ent || ent.profileIds.includes(p.id))).flatMap((p) => packsForClass(p.classLevel))];
    void ensurePacks([...new Set(order)], { profileId: profile.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.id, profile?.id, classKey, online, offlineMode, dl.loaded, trusted, !!ent]);

  // keep every authorised learner's data on the device while offline use is on (once per session)
  useEffect(() => {
    if (!account || !ent || !online || offlineMode || savedData.current === account.id) return;
    savedData.current = account.id;
    void saveOfflineData().catch(() => { savedData.current = null; });
  }, [account, ent, online, offlineMode, saveOfflineData]);

  useEffect(() => {
    if (dl.progress.phase !== 'done') return;
    setShownDone(true);
    const t = setTimeout(() => setShownDone(false), 8000);
    return () => clearTimeout(t);
  }, [dl.progress.phase]);

  const onDownloads = loc.pathname.startsWith('/downloads');
  const signinNext = `/signin?next=${encodeURIComponent(loc.pathname + loc.search)}`;

  // 1. uploads paused: ask a parent to sign in to the SAME account
  if (offline.reauth && online && !loc.pathname.startsWith('/signin')) {
    return (
      <div className="offline-bar warn" role="status">
        <Icon name="lock" />
        <span><b>{offline.reauth.pending ? `${offline.reauth.pending} item${offline.reauth.pending === 1 ? '' : 's'} saved on this device.` : 'Saved on this device.'}</b> Sign in as <b>{offline.reauth.username}</b> to upload {offline.reauth.pending === 1 ? 'it' : 'them'}.</span>
        <button className="btn small primary" onClick={() => nav(signinNext)}>Parent sign in</button>
      </div>
    );
  }
  if (offline.reauth && loc.pathname.startsWith('/signin')) {
    return (
      <div className="offline-bar warn" role="status">
        <Icon name="info" />
        <span>Sign in as <b>{offline.reauth.username}</b> to upload the work saved on this device. Signing in with a different account will not upload or show it.</span>
      </div>
    );
  }
  if (!account) return null;

  const needPacks = profile ? packsForPath(loc.pathname, profile.classLevel) : null;
  const missingHere = !online && needPacks ? needPacks.filter((id) => !dl.installed.packs[id]) : [];
  // 2. offline
  if (!online || offlineMode) {
    const reloadable = !online && dl.readyBuild && dl.readyBuild !== RUNNING_BUILD;
    return (
      <div className={`offline-bar ${chunkMissing || missingHere.length ? 'warn' : ''}`} role="status" aria-live="polite">
        <Icon name="wifiOff" />
        <span>
          <b>Offline · saved on this device</b>
          {sync.pending > 0 && <> · {sync.pending} item{sync.pending === 1 ? '' : 's'} awaiting sync</>}
          {(chunkMissing || missingHere.length > 0) && <><br /><b>Download required:</b> this part is not downloaded on this device. Connect to the internet to use it{reloadable ? ', or reload to use the downloaded version' : ''}.</>}
        </span>
        {(chunkMissing && reloadable) ? <button className="btn small" onClick={() => location.reload()}>Reload</button> : null}
        {online && offlineMode && <button className="btn small" onClick={() => void retrySync()}>Retry</button>}
      </div>
    );
  }
  if (onDownloads) return null; // the Downloads screen shows full details
  // 3. confirmation before downloading on mobile data / low storage
  if (dl.prompt) {
    const p = dl.prompt;
    return (
      <div className="offline-bar" role="dialog" aria-label="Download for offline use">
        <Icon name="download" />
        <span>
          {p.kind === 'metered' ? <>You seem to be on mobile data. Download {fmtBytes(p.bytes)} for offline use now?</>
            : <>Only {fmtBytes(p.free)} of storage is free. The full download is {fmtBytes(p.bytes)}.</>}
        </span>
        <button className="btn small primary" onClick={() => void ensurePacks(p.packIds, { confirmed: true, profileId: p.profileId })}>Download {fmtBytes(p.bytes)}</button>
        {p.lessonsOnly.length > 0 && p.lessonsOnly.length < p.packIds.length && <button className="btn small" onClick={() => void ensurePacks(p.lessonsOnly, { confirmed: true, profileId: p.profileId })}>Lessons only ({fmtBytes(p.lessonsBytes)})</button>}
        <button className="btn small ghost" onClick={dismissPrompt}>Not now</button>
      </div>
    );
  }
  const pr = dl.progress;
  if (pr.phase === 'downloading') {
    return (
      <div className="offline-bar" role="status" aria-live="polite">
        <Icon name="download" />
        <span><b>Getting ready for offline use</b> · {pr.label === 'App' ? 'app' : pr.label} · {pr.done} of {pr.total} items · {fmtBytes(pr.bytesDone)} of {fmtBytes(pr.bytesTotal)}</span>
        <span className="offline-meter" aria-hidden="true"><i style={{ width: `${pr.total ? Math.round((pr.done / pr.total) * 100) : 0}%` }} /></span>
        <button className="btn small ghost" onClick={() => nav('/downloads')}>Details</button>
      </div>
    );
  }
  if (pr.phase === 'error' || pr.phase === 'paused') {
    return (
      <div className="offline-bar warn" role="alert">
        <Icon name="alert" />
        <span>{pr.message || 'Download problem.'}</span>
        <button className="btn small" onClick={() => void resumeDownloads().then(() => profile && ensurePacks(packsForClass(profile.classLevel), { confirmed: true, profileId: profile.id }))}>Retry</button>
        <button className="btn small ghost" onClick={() => nav('/downloads')}>Details</button>
      </div>
    );
  }
  if (sync.paused) {
    return (
      <div className="offline-bar warn" role="status">
        <Icon name="cloud" /><span>{sync.message || 'Saved on this device — not uploaded yet.'}</span>
        <button className="btn small" onClick={() => void retrySync()}>Retry</button>
      </div>
    );
  }
  if (shownDone && profile) {
    return (
      <div className="offline-bar good" role="status">
        <Icon name="check" />
        {ent ? <span><b>Ready offline</b> on this device.</span>
          : <span><b>Downloaded.</b> A parent can turn on offline use so WonderLab also opens without internet.</span>}
        {!ent && <button className="btn small" onClick={() => nav('/downloads')}>Set up</button>}
      </div>
    );
  }
  return null;
}
