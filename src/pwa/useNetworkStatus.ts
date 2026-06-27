import { useEffect, useState } from 'react';

/**
 * Tracks the browser's online/offline state. Updates on the
 * `online` / `offline` window events.
 */
export function useNetworkStatus(): { online: boolean } {
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return { online };
}
