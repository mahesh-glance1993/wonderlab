import { useEffect, useState } from 'react';
import { applyOverrides, loadClass, type ClassContent } from '../../content';
import { api, isOffline } from '../../lib/api';
import type { ClassLevel } from '../../shared/levels';

// Last published-overrides response, cached in memory for this session. Offline → skipped.
let overridesCache: unknown[] | null = null;
let overridesInflight: Promise<unknown[] | null> | null = null;

async function getOverrides(): Promise<unknown[] | null> {
  if (overridesCache) return overridesCache;
  if (isOffline()) return null;
  overridesInflight ??= api<{ overrides?: unknown[] }>('/content/overrides')
    .then((r) => (overridesCache = r.overrides ?? []))
    .catch(() => null)
    .finally(() => { overridesInflight = null; });
  return overridesInflight;
}

const classCache = new Map<number, Promise<ClassContent>>();
function getClass(level: ClassLevel) {
  let p = classCache.get(level);
  if (!p) { p = loadClass(level); classCache.set(level, p); p.catch(() => classCache.delete(level)); }
  return p;
}

export type ContentStatus = { status: 'loading' } | { status: 'error' } | { status: 'ready'; content: ClassContent };

export function useLessonContent(level: ClassLevel | null | undefined): ContentStatus {
  const [s, setS] = useState<ContentStatus>({ status: 'loading' });
  useEffect(() => {
    if (level === null || level === undefined) return;
    let off = false;
    setS({ status: 'loading' });
    Promise.all([getClass(level), getOverrides()])
      .then(([c, o]) => {
        let content = c;
        if (o && o.length) {
          try { content = applyOverrides(c, o as never); } catch { content = c; }
        }
        if (!off) setS({ status: 'ready', content });
      })
      .catch(() => { if (!off) setS({ status: 'error' }); });
    return () => { off = true; };
  }, [level]);
  return s;
}
