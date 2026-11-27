// Captures Chrome/Edge's `beforeinstallprompt` as early as possible (imported from main.tsx), so the
// get-the-app page can offer "Install WonderLab" even if the event fired before that page loaded.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // show our own button instead of the mini-infobar
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => { deferred = null; installed = true; emit(); });
}

export const canPromptInstall = () => deferred !== null;
export const wasInstalled = () => installed;

/** Running as an installed app (home-screen PWA on Android/desktop, or iOS standalone). */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.matchMedia?.('(display-mode: standalone)').matches || window.matchMedia?.('(display-mode: fullscreen)').matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true);
}

export function onInstallChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** Shows the browser's install dialog. Returns true if the person accepted. */
export async function promptInstall(): Promise<boolean> {
  const e = deferred;
  if (!e) return false;
  deferred = null; // a prompt event can only be used once
  emit();
  await e.prompt();
  const { outcome } = await e.userChoice;
  return outcome === 'accepted';
}
