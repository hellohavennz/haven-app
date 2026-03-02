const DISMISSED_KEY = 'haven_install_dismissed';
const DISMISSED_TS_KEY = 'haven_install_dismissed_ts';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type InstallPlatform = 'ios' | 'android' | 'desktop';

export function detectPlatform(): InstallPlatform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

export function hasDismissedInstall(): boolean {
  try {
    if (!localStorage.getItem(DISMISSED_KEY)) return false;
    const ts = parseInt(localStorage.getItem(DISMISSED_TS_KEY) ?? '0', 10);
    return Date.now() - ts < THIRTY_DAYS_MS;
  } catch {
    return false;
  }
}

export function recordInstallDismissal(): void {
  try {
    localStorage.setItem(DISMISSED_KEY, '1');
    localStorage.setItem(DISMISSED_TS_KEY, String(Date.now()));
  } catch { /* ignore */ }
}
