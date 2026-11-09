import { useEffect, useState } from 'react';
import { offlineDataStatus, useApp } from '../../lib/app';
import { onSync, type SyncInfo, type SyncStatus } from '../../lib/sync';
import { packsForClass, readiness } from './plan';
import { initDownloads, useDownloads } from './manager';

export function useSyncState() {
  const [s, setS] = useState<{ status: SyncStatus } & SyncInfo>({ status: 'idle', pending: 0 });
  useEffect(() => onSync((status, info) => setS({ status, pending: info?.pending ?? 0, paused: info?.paused, message: info?.message })), []);
  return s;
}

/** Offline readiness of every learner of the signed-in account on this device. */
export function useOfflineReadiness() {
  const { account, profiles, offline } = useApp();
  const dl = useDownloads();
  const [data, setData] = useState<Record<string, boolean>>({});
  const [tick, setTick] = useState(0);
  useEffect(() => {
    void initDownloads();
    const i = setInterval(() => setTick((x) => x + 1), 4000); // snapshots are written asynchronously
    return () => clearInterval(i);
  }, []);
  const ids = profiles.map((p) => p.id).join(',');
  const entOn = offline.entState === 'valid';
  useEffect(() => {
    if (!account) return;
    let off = false;
    void offlineDataStatus(account.id, ids ? ids.split(',') : []).then((d) => { if (!off) setData(d); });
    return () => { off = true; };
  }, [account, ids, entOn, tick, dl.installed]);
  const byProfile = Object.fromEntries(profiles.map((p) => {
    const authorised = !!offline.entitlement && offline.entitlement.profileIds.includes(p.id);
    return [p.id, readiness({ inst: dl.installed, required: packsForClass(p.classLevel), entitlement: entOn && authorised, data: !!data[p.id] })];
  }));
  return { byProfile, recheck: () => setTick((x) => x + 1), dl };
}
