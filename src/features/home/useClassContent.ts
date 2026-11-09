import { useEffect, useState } from 'react';
import { loadClass, applyOverrides, type ClassContent } from '../../content';
import { api } from '../../lib/api';
import type { ClassLevel } from '../../shared/levels';

let overridesCache: { id: string; kind: string; version: number; data: unknown }[] | null = null;
export async function getOverrides() {
  if (overridesCache) return overridesCache;
  try { overridesCache = (await api<{ overrides: typeof overridesCache }>('/content/overrides')).overrides || []; }
  catch { overridesCache = []; }
  return overridesCache!;
}
export const invalidateOverrides = () => { overridesCache = null; };

/** Loads a class's curriculum (lazy chunk) with any published educator corrections applied. */
export function useClassContent(level: ClassLevel | null) {
  const [content, setContent] = useState<ClassContent | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (level === null) return;
    let off = false;
    setContent(null);
    Promise.all([loadClass(level), getOverrides()])
      .then(([c, o]) => { if (!off) setContent(applyOverrides(c, o)); })
      .catch(() => { if (!off) setError('This class is not available offline yet. Connect to the internet or download it in Downloads.'); });
    return () => { off = true; };
  }, [level]);
  return { content, error };
}
