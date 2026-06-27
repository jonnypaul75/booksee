import { useEffect, useRef } from 'react';

/**
 * Keeps the screen awake while `active` is true (e.g. during playback).
 *
 * Uses the Wake Lock API where available. Re-acquires the lock when the
 * tab becomes visible again (the browser auto-releases on tab switch).
 *
 * Safe no-op on browsers that don't support it (older iOS, Firefox before
 * 126, etc.).
 */
export function useWakeLock(active: boolean): void {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;

    let cancelled = false;

    const acquire = async () => {
      try {
        const sentinel = await (navigator as Navigator & {
          wakeLock: { request(type: 'screen'): Promise<WakeLockSentinel> };
        }).wakeLock.request('screen');
        if (cancelled) {
          sentinel.release().catch(() => undefined);
          return;
        }
        sentinelRef.current = sentinel;
        sentinel.addEventListener('release', () => {
          sentinelRef.current = null;
        });
      } catch {
        // Browser denied (e.g. battery saver). Silently no-op.
      }
    };

    const release = async () => {
      try {
        await sentinelRef.current?.release();
      } catch {
        // ignore
      }
      sentinelRef.current = null;
    };

    if (active) {
      acquire();
    } else {
      release();
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && active && !sentinelRef.current) {
        acquire();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      release();
    };
  }, [active]);
}
