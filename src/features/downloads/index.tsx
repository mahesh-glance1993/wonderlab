// Downloads: offline status of this device, the parent-controlled offline window (entitlement),
// which learners/activities work offline, pack download/update/remove, storage and data removal.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { retrySync, pendingOnDevice } from '../../lib/sync';
import { daysLeft, OFFLINE_DAY_CHOICES, OFFLINE_DEFAULT_DAYS } from '../../lib/offline';
import { Page, Button, Meter, toast } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { PACKS, type PackDef } from '../../shared/packs';
import { CLASSES } from '../../shared/levels';
import { ParentGate } from '../parent/ParentGate';
import { ensurePacks, refreshStorage, removeAllPacks, removePack, requestPersistence, resumeDownloads } from './manager';
import { fmtBytes, packState, packsForClass } from './plan';
import { useOfflineReadiness, useSyncState } from './useOffline';
import './downloads.css';

const ACTIVITY_NAMES: Record<string, string> = { lessons: 'lessons, practice, tests & hints', games: 'games', lab: 'simulations', art: 'painting, tracing & colouring', tracing: 'tracing', coloring: 'colouring', narration: 'recorded narration' };
const classesLabel = (p: PackDef) => p.kind === 'lessons' && p.classLevels.length === 1 ? CLASSES[p.classLevels[0]].label : p.classLevels.length > 10 ? 'All classes' : `${CLASSES[p.classLevels[0]].label}–${CLASSES[p.classLevels[p.classLevels.length - 1]].label}`;

export default function Downloads() {
  const { profile, profiles, account, online, offlineMode, session, offline, parentVerified, enableOffline, disableOffline, removeDeviceData } = useApp();
  const nav = useNavigate();
  const { byProfile, recheck, dl } = useOfflineReadiness();
  const sync = useSyncState();
  const [days, setDays] = useState<number>(offline.entitlement?.days ?? OFFLINE_DEFAULT_DAYS);
  const [confirmRemove, setConfirmRemove] = useState<null | number>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { void refreshStorage(); }, []);
  useEffect(() => { if (offline.entitlement) setDays(offline.entitlement.days); }, [offline.entitlement]);
  if (!profile || !account) return null;
  const mine = byProfile[profile.id];
  const pr = dl.progress;
  const ent = offline.entitlement;
  const shared = !session?.persistent;
  const man = dl.manifest;
  const forClass = new Set(packsForClass(profile.classLevel));
  const packs = PACKS.filter((p) => forClass.has(p.id) || p.kind === 'lessons');
  const canChange = parentVerified && online && !offlineMode;

  const download = async (ids: string[]) => {
    const r = await ensurePacks(ids, { profileId: profile.id });
    if (r === 'nothing') toast('Already downloaded and checked.');
  };
  const turnOn = async () => {
    setBusy(true);
    try { await enableOffline(days); await ensurePacks(packsForClass(profile.classLevel), { confirmed: true, profileId: profile.id }); await requestPersistence(); recheck(); toast(`Offline use is on for ${days} days`); }
    catch (e) { toast((e as Error).message); } finally { setBusy(false); }
  };
  const removeAll = async (force: boolean) => {
    const r = await removeDeviceData({ force });
    if (r === 'unsynced') { setConfirmRemove(await pendingOnDevice()); return; }
    await removeAllPacks();
    nav('/signin', { replace: true });
  };

  return (
    <Page title="Downloads">
      <div className="page-head"><h1>Offline use on this device</h1></div>

      {/* ---------- status ---------- */}
      <section className="card stack" aria-label="Offline status">
        {mine?.ready
          ? <span className="dl-ready" style={{ color: 'var(--good)' }}><Icon name="check" />Ready offline</span>
          : <span className="dl-ready"><Icon name={online ? 'cloud' : 'wifiOff'} />{mine?.downloaded ? 'Downloaded — offline use is not turned on' : 'Not ready offline yet'}</span>}
        <p className="muted small" style={{ margin: 0 }}>
          {mine?.ready ? `${profile.nickname}'s class, games, simulations and art work without internet on this device.`
            : mine?.downloaded ? 'Everything is downloaded. A parent needs to turn on offline use below so WonderLab also opens without internet.'
            : `Downloading ${profile.nickname}'s class pack: the app, lessons with practice, tests and hints, games, simulations, tracing, colouring, painting, fonts and narration.`}
        </p>
        {pr.phase === 'downloading' && (
          <div className="stack" style={{ gap: 6 }}>
            <Meter value={pr.total ? pr.done / pr.total : 0} label="Download progress" />
            <small>{pr.label === 'App' ? 'App' : PACKS.find((p) => p.id === pr.label)?.title || pr.label} · {pr.done} of {pr.total} items ({pr.total - pr.done} remaining) · {fmtBytes(pr.bytesDone)} of {fmtBytes(pr.bytesTotal)}</small>
          </div>
        )}
        {(pr.phase === 'error' || pr.phase === 'paused') && (
          <div className="alert warn" role="alert"><Icon name="alert" /><span>{pr.message}
            {pr.errors.length > 0 && <ul className="dl-errors">{pr.errors.slice(0, 20).map((e) => <li key={e}>{e}</li>)}</ul>}</span>
            {online && <Button small onClick={() => void resumeDownloads().then(() => download(packsForClass(profile.classLevel)))}>Retry</Button>}
          </div>
        )}
        {dl.prompt && (
          <div className="alert warn" role="alert"><Icon name="download" /><span>
            {dl.prompt.kind === 'metered' ? `You seem to be on mobile data. The download is ${fmtBytes(dl.prompt.bytes)}.` : `Only ${fmtBytes(dl.prompt.free)} of storage is free; the download is ${fmtBytes(dl.prompt.bytes)}.`}</span>
            <Button small variant="primary" onClick={() => void ensurePacks(dl.prompt!.packIds, { confirmed: true, profileId: profile.id })}>Download all</Button>
            {dl.prompt.lessonsOnly.length > 0 && <Button small onClick={() => void ensurePacks(dl.prompt!.lessonsOnly, { confirmed: true, profileId: profile.id })}>Lessons only ({fmtBytes(dl.prompt.lessonsBytes)})</Button>}
          </div>
        )}
        <p style={{ margin: 0 }}>
          {!online || offlineMode ? <><Icon name="wifiOff" /> <b>Offline · saved on this device.</b> </> : null}
          {sync.pending > 0 ? <>{sync.pending} item{sync.pending === 1 ? '' : 's'} awaiting sync. </> : <>Everything is synced. </>}
          {sync.pending > 0 && online && <Button small onClick={() => void retrySync()}>Retry sync</Button>}
        </p>
        {offline.reauth && <div className="alert warn"><Icon name="lock" />Uploads are paused until a parent signs in again as {offline.reauth.username}.</div>}
      </section>

      {/* ---------- learners ---------- */}
      <section className="dl-section" aria-label="Learners available offline">
        <h2>Learners on this device</h2>
        <div className="stack">
          {profiles.map((p) => {
            const r = byProfile[p.id];
            return (
              <div key={p.id} className="card flat dl-profile">
                <b>{p.nickname}</b><small className="muted">{CLASSES[p.classLevel].label}</small>
                <span className="spacer" style={{ flex: 1 }} />
                {r?.ready ? <span className="status mastered"><Icon name="check" />Available offline</span>
                  : r?.downloaded ? <span className="pill">Downloaded · offline use off</span>
                  : <span className="pill">Download required</span>}
              </div>
            );
          })}
        </div>
        <p className="muted small">Offline, each learner can use: {packsForClass(profile.classLevel).filter((id) => dl.installed.packs[id]).map((id) => ACTIVITY_NAMES[PACKS.find((p) => p.id === id)!.kind]).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'nothing yet'}.
          Sign-in, password recovery, account and session settings, the content editor and publishing need internet.</p>
      </section>

      {/* ---------- offline window (entitlement) ---------- */}
      <section className="dl-section card stack" aria-label="Offline window">
        <h2><Icon name="shield" /> Open without internet</h2>
        <p style={{ margin: 0 }}>When this is on, WonderLab opens on <b>this device</b> without internet for up to <b>{ent ? ent.days : days} days</b> after the last time it was online with your account. It shows only the learners of <b>{account.username}</b> and their work saved here. It is not a password: nothing secret is stored, and uploading, settings and sign-in still need you to be online and signed in.</p>
        <p className="muted small" style={{ margin: 0 }}>When the window ends, a parent signs in again online; work saved meanwhile stays on this device and is uploaded only to this account.{shared ? ' This is a shared-device sign-in: offline use is off by default. Only turn it on if this device stays with your family.' : ''}</p>
        {ent && offline.entState === 'valid' && <div className="alert good"><Icon name="check" />On · {daysLeft(ent)} day{daysLeft(ent) === 1 ? '' : 's'} left (until {new Date(ent.expiresAt).toLocaleDateString()}), renewed each time this device is online.</div>}
        {ent && offline.entState === 'expired' && <div className="alert warn"><Icon name="clock" />The offline window has ended. Connect to renew it.</div>}
        {!ent && <div className="alert info"><Icon name="info" />Off on this device.</div>}
        {online && !offlineMode ? (
          <ParentGate reason="Turning offline use on or off is done by a parent.">
            <div className="row" style={{ alignItems: 'center' }}>
              <label className="row" style={{ gap: 6, alignItems: 'center' }}>Offline window
                <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Offline window in days">
                  {OFFLINE_DAY_CHOICES.map((d) => <option key={d} value={d}>{d} days</option>)}
                </select>
              </label>
              <Button variant="primary" icon="download" disabled={busy || !canChange} onClick={() => void turnOn()}>{ent ? 'Update offline use' : 'Turn on offline use'}</Button>
              {ent && <Button variant="danger" disabled={!canChange} onClick={() => void disableOffline().then(() => { recheck(); toast('Offline use turned off'); })}>Turn off</Button>}
            </div>
          </ParentGate>
        ) : <p className="muted small" style={{ margin: 0 }}>Changing this needs internet.</p>}
      </section>

      {/* ---------- packs ---------- */}
      <section className="dl-section" aria-label="Packs">
        <h2>Packs</h2>
        {!canChange && <p className="muted small">{online ? 'A parent check (above) is needed to download, update or remove packs.' : 'Downloading, updating and removing packs needs internet.'}</p>}
        <div className="stack">
          {packs.map((p) => {
            const st = packState(man, dl.installed, p.id);
            const built = man?.packs.find((x) => x.id === p.id);
            return (
              <div key={p.id} className="card flat row">
                <Icon name={p.kind === 'lessons' ? 'book' : p.kind === 'games' ? 'puzzle' : p.kind === 'lab' ? 'atom' : p.kind === 'narration' ? 'speaker' : 'palette'} />
                <span style={{ flex: 1, minWidth: 180 }}><b>{p.title}</b><br /><small className="muted">{classesLabel(p)} · {built ? fmtBytes(built.bytes) : 'size after build'}</small></span>
                {st === 'ready' ? <span className="status mastered"><Icon name="check" />Available offline</span>
                  : st === 'update' ? <span className="pill">Update available</span> : null}
                {canChange && (st === 'none' ? <Button small icon="download" onClick={() => void download([p.id])}>Download</Button>
                  : <>{st === 'update' && <Button small icon="download" onClick={() => void download([p.id])}>Update</Button>}
                    <Button small variant="danger" icon="trash" onClick={() => void removePack(p.id, profile.id).then(recheck)}>Remove</Button></>)}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- storage ---------- */}
      <section className="dl-section card stack" aria-label="Storage">
        <h2>Storage</h2>
        {dl.storage.quota ? <p style={{ margin: 0 }}>Used on this device: {fmtBytes(dl.storage.usage || 0)} of {fmtBytes(dl.storage.quota)}.</p> : null}
        <p style={{ margin: 0 }}>{dl.persisted ? 'The browser has agreed to keep this data (persistent storage).' : 'The browser may remove downloads when the device is short of space.'}
          {!dl.persisted && <> <Button small onClick={() => void requestPersistence()}>Ask to keep it</Button></>}</p>
        <p className="muted small" style={{ margin: 0 }}><b>Important:</b> clearing this browser's data (history/cookies/site data), uninstalling the browser or automatic storage clean-up removes downloaded packs <b>and any work not yet synced</b>. Connect regularly so work is uploaded.</p>
        {online && !offlineMode && (
          <ParentGate reason="Removing this device's data is done by a parent.">
            {confirmRemove !== null ? (
              <div className="alert error" role="alert"><Icon name="alert" /><span>{confirmRemove} item{confirmRemove === 1 ? ' has' : 's have'} not been uploaded yet and will be lost.</span>
                <Button small onClick={() => setConfirmRemove(null)}>Keep everything</Button>
                <Button small variant="danger" onClick={() => void removeAll(true)}>Delete anyway</Button>
              </div>
            ) : <Button variant="danger" icon="trash" onClick={() => void removeAll(false)}>Remove this device's data</Button>}
            <p className="muted small">Removes downloaded packs, saved learner data and offline access for every account on this device, and signs out. Generated narration audio is kept (it is not personal).</p>
          </ParentGate>
        )}
      </section>
    </Page>
  );
}
