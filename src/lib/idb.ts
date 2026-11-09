// Minimal IndexedDB key-value store. Every private key is scoped to account (and usually profile)
// by the callers, so one family member's drafts are never visible to another:
//   q:<account>:<profile>:…      unsynced attempts / lesson + activity state / rewards
//   art:<account>:<profile>:<id> artwork drafts (artr:… = conflicted draft → preserved copy)
//   snap:<account>:…             offline snapshots (account + profiles, learner state per profile)
//   dl:<account>:<profile>:…     per-learner download choices
//   ent:<account>                offline entitlement (see lib/offline.ts)
//   meta:… / pk:…                device-level, not private (device id, installed static packs)
// The schema (one 'kv' store, version 1) is deliberately never changed destructively, so pending
// work survives app and service-worker updates.

const DB_NAME = 'wonderlab';
const STORE = 'kv';
let dbp: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}
function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  return open().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const s = t.objectStore(STORE);
        const r = fn(s);
        t.oncomplete = () => resolve(r ? (r as IDBRequest<T>).result : undefined);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      }),
  );
}

export const idb = {
  get: <T>(key: string) => tx<T>('readonly', (s) => s.get(key) as IDBRequest<T>),
  set: (key: string, value: unknown) => tx('readwrite', (s) => s.put(value, key)).then(() => undefined),
  del: (key: string) => tx('readwrite', (s) => s.delete(key)).then(() => undefined),
  keys: async (prefix: string) => {
    const all = (await tx<IDBValidKey[]>('readonly', (s) => s.getAllKeys())) || [];
    return all.map(String).filter((k) => k.startsWith(prefix));
  },
  /** Removes everything under several prefixes in one transaction. */
  clearPrefixes: async (prefixes: string[]) => {
    const all = ((await tx<IDBValidKey[]>('readonly', (s) => s.getAllKeys())) || []).map(String);
    const ks = all.filter((k) => prefixes.some((p) => k.startsWith(p)));
    if (ks.length) await tx('readwrite', (s) => { ks.forEach((k) => s.delete(k)); });
    return ks.length;
  },
  /** Removes everything under a prefix (used on sign-out / profile removal). */
  clearPrefix: async (prefix: string) => {
    const ks = await idb.keys(prefix);
    await tx('readwrite', (s) => {
      ks.forEach((k) => s.delete(k));
    });
  },
  /** Storage estimate for the downloads screen. */
  estimate: async () => (navigator.storage?.estimate ? navigator.storage.estimate() : { usage: 0, quota: 0 }),
};
