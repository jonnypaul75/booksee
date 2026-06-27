// =====================================================================
// Service Worker registration
// ---------------------------------------------------------------------
// vite-plugin-pwa exposes a virtual module 'virtual:pwa-register' that
// returns a `registerSW` function. We wrap it here so the app gets a
// typed promise + an "update available" callback our React banner can
// hook into.
// =====================================================================
import { registerSW as registerSWInternal } from 'virtual:pwa-register';

export type UpdateAvailableCallback = (apply: () => Promise<void>) => void;

export interface RegisterOptions {
  onUpdateAvailable?: UpdateAvailableCallback;
  onOfflineReady?: () => void;
}

/**
 * Register the SW. Call once from src/main.tsx (or App.tsx).
 *
 * Pass an `onUpdateAvailable` callback to show your own "Update available"
 * UI. Call the provided `apply()` function to activate the new SW and
 * trigger a page reload.
 */
export function registerServiceWorker(opts: RegisterOptions = {}): void {
  // Only register in browsers that support SW. Vite handles the
  // build-time inclusion; this guard keeps it safe in tests/SSR.
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const updateSW = registerSWInternal({
    immediate: true,
    onNeedRefresh() {
      opts.onUpdateAvailable?.(async () => {
        // Activate the new SW; updateSW(true) calls skipWaiting and reloads.
        await updateSW(true);
      });
    },
    onOfflineReady() {
      // eslint-disable-next-line no-console
      console.log('[PWA] App is ready to work offline.');
      opts.onOfflineReady?.();
    },
    onRegisterError(error) {
      // eslint-disable-next-line no-console
      console.error('[PWA] Service worker registration failed:', error);
    },
  });
}
