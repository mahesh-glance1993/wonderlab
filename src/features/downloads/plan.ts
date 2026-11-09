// Pure planning helpers for offline packs (no DOM; unit-tested in tests/offline.test.ts).
import { PACKS } from '../../shared/packs';

export interface BuiltPack { id: string; files: string[]; bytes: number; version: string }
export interface PackManifest { v: 2; build: string; builtAt?: string; entry: string; shell: { files: string[]; bytes: number }; fonts: string[]; packs: BuiltPack[] }
export interface InstalledPack { version: string; verifiedAt: number; bytes: number }
export interface Installed { build: string | null; shell: boolean; fonts: boolean; packs: Record<string, InstalledPack> }
export const emptyInstalled = (): Installed => ({ build: null, shell: false, fonts: false, packs: {} });

/** The page itself is stored under this key in each build cache (see public/sw.js). */
export const INDEX_KEY = '/__wl/index.html';
const LESSON_KEYS = ['nursery', 'lkg', 'ukg', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'];

export function isManifest(x: unknown): x is PackManifest {
  const m = x as PackManifest;
  return !!m && m.v === 2 && typeof m.build === 'string' && Array.isArray(m.shell?.files) && Array.isArray(m.packs);
}

/** Everything a learner of this class needs offline: lessons, practice/grading code, games, sims, art, narration. */
export function packsForClass(level: number): string[] {
  return PACKS.filter((p) => p.classLevels.includes(level as never)).map((p) => p.id);
}

/** Packs needed by a route (null = part of the app shell, always available once the shell is cached). */
export function packsForPath(path: string, level: number): string[] | null {
  const p = path.split('?')[0];
  if (p.startsWith('/lesson') || p === '/learn') return [`lessons-${LESSON_KEYS[level] ?? 'c1'}`];
  if (p.startsWith('/lab')) return ['physics-lab'];
  if (p.startsWith('/art')) return ['art-studio'];
  if (p.startsWith('/games')) return ['games'];
  if (p.startsWith('/play')) return ['play-learn'];
  if (p.startsWith('/lang')) return ['lang-telugu-english'];
  return null;
}

/** Unique file list for the shell (+ page) and the given packs. */
export function filesFor(man: PackManifest, packIds: string[], withShell = true): string[] {
  const set = new Set<string>();
  if (withShell) { man.shell.files.forEach((f) => set.add(f)); set.add(INDEX_KEY); }
  for (const id of packIds) man.packs.find((p) => p.id === id)?.files.forEach((f) => set.add(f));
  return [...set];
}

export function bytesFor(man: PackManifest, packIds: string[], withShell: boolean) {
  return (withShell ? man.shell.bytes : 0) + packIds.reduce((s, id) => s + (man.packs.find((p) => p.id === id)?.bytes || 0), 0);
}

export type PackState = 'none' | 'ready' | 'update' | 'unknown';
export function packState(man: PackManifest | null, inst: Installed, id: string): PackState {
  const have = inst.packs[id];
  if (!have) return 'none';
  if (!man) return 'ready';
  const cur = man.packs.find((p) => p.id === id);
  if (!cur) return 'unknown';
  return inst.build === man.build && have.version === cur.version ? 'ready' : 'update';
}

/** Installed packs that the current build changed (or a new build arrived) → need staging. */
export function needsUpdate(man: PackManifest | null, inst: Installed): boolean {
  if (!man || !inst.build) return false;
  return inst.build !== man.build;
}

export interface NetInfo { saveData?: boolean; type?: string; effectiveType?: string }
export interface StorageInfo { usage?: number; quota?: number }
/** Ask before downloading on metered connections or when the device is short of space. */
export function downloadPrecheck(net: NetInfo | undefined, st: StorageInfo | undefined, needBytes: number) {
  const metered = !!net && (net.saveData === true || net.type === 'cellular');
  const free = st?.quota ? Math.max(0, st.quota - (st.usage || 0)) : Infinity;
  const lowStorage = free < needBytes * 1.5 + 20e6;
  return { metered, lowStorage, free };
}

/** "Ready offline" requires: verified shell for the ready build, every required pack verified,
 *  a valid offline entitlement and the learner's data saved in IndexedDB. */
export function readiness(o: { inst: Installed; required: string[]; entitlement: boolean; data: boolean }) {
  const missing: string[] = [];
  if (!o.inst.shell || !o.inst.build) missing.push('app');
  for (const id of o.required) if (!o.inst.packs[id]) missing.push(id);
  const downloaded = !missing.length;
  if (!o.entitlement) missing.push('entitlement');
  if (!o.data) missing.push('data');
  return { ready: !missing.length, downloaded, missing };
}

export const fmtBytes = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

/** Font files referenced by a Google Fonts stylesheet, limited to the subsets the app uses. */
export function fontUrls(css: string, subsets = ['latin', 'latin-ext', 'telugu']): string[] {
  const out: string[] = [];
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*{([^}]*)}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    if (!subsets.includes(m[1])) continue;
    const u = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/.exec(m[2]);
    if (u && !out.includes(u[1])) out.push(u[1]);
  }
  // stylesheets without subset comments: take every font file
  if (!out.length && !/\/\*\s*[\w-]+\s*\*\//.test(css)) for (const u of css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)) if (!out.includes(u[1])) out.push(u[1]);
  return out;
}
