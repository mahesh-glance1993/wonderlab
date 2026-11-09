// Minimal IndexedDB key-value store. Every key is scoped to account (and usually profile)
// by the callers, so one family member's drafts are never visible to another.

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
