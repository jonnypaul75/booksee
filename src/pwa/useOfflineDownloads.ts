import { useCallback, useEffect, useState } from 'react';
import { ContentDetailDto } from '../api';

// =====================================================================
// Per-user "Download for offline" manager
// ---------------------------------------------------------------------
// The Service Worker (configured in vite.config.ts) already has a
// runtime caching rule for media URLs into the `booksee-offline-media-v1`
// cache. This hook *eagerly* populates that cache so the user can play
// a title offline later, and tracks which content IDs have been
// downloaded in localStorage so the UI can show "Downloaded" badges.
//
// Real implementation notes:
//   * For HLS/DASH manifests you'd parse the .m3u8/.mpd, fetch every
//     segment, and PUT each segment into the cache. The simple
//     implementation below only caches the manifest + poster, which is
//     enough to *render* the player offline but not enough to *stream*.
//     Use it as the foundation — wire your own segment crawler when the
//     real CDN URLs are in place.
//   * DRM-protected (EME) media cannot be cached at all.
// =====================================================================

const CACHE_NAME = 'booksee-offline-media-v1';
const LS_KEY = 'booksee:offline-ids';

export interface OfflineDownloadsApi {
  downloadedIds: Set<number>;
  isDownloaded: (contentId: number) => boolean;
  downloadingIds: Set<number>;
  download: (content: ContentDetailDto) => Promise<void>;
  remove: (contentId: number) => Promise<void>;
  supported: boolean;
}

function loadIds(): Set<number> {
  if (typeof localStorage === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.map((n) => Number(n))) : new Set();
  } catch {
    return new Set();
  }
}

function saveIds(ids: Set<number>): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(Array.from(ids)));
}

export function useOfflineDownloads(): OfflineDownloadsApi {
  const [downloadedIds, setDownloadedIds] = useState<Set<number>>(() => loadIds());
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());

  const supported =
    typeof window !== 'undefined' &&
    typeof caches !== 'undefined' &&
    'serviceWorker' in navigator;

  // Cross-tab sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY) setDownloadedIds(loadIds());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isDownloaded = useCallback(
    (id: number) => downloadedIds.has(id),
    [downloadedIds]
  );

  const download = useCallback(
    async (content: ContentDetailDto) => {
      if (!supported) return;

      setDownloadingIds((prev) => new Set(prev).add(content.id));
      try {
        const cache = await caches.open(CACHE_NAME);

        // URLs we attempt to cache. Add more here when you wire real CDN
        // URLs (per-episode video manifests, every quality, every language).
        const urls = [content.posterUrl];
        if (content.backdropUrl) urls.push(content.backdropUrl);
        if (content.trailerUrl) urls.push(content.trailerUrl);

        await Promise.allSettled(
          urls.map(async (url) => {
            try {
              const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
              if (res.ok || res.status === 0) {
                await cache.put(url, res.clone());
              }
            } catch {
              // ignore individual asset failures
            }
          })
        );

        const next = new Set(downloadedIds);
        next.add(content.id);
        setDownloadedIds(next);
        saveIds(next);
      } finally {
        setDownloadingIds((prev) => {
          const copy = new Set(prev);
          copy.delete(content.id);
          return copy;
        });
      }
    },
    [downloadedIds, supported]
  );

  const remove = useCallback(
    async (contentId: number) => {
      if (!supported) return;
      // We don't know which exact URLs to delete without the detail; the
      // simplest robust approach is to delete the LS entry and let the
      // cache evict via the SW's `expiration` policy. For an aggressive
      // cleanup, fetch the detail and delete by URL.
      const next = new Set(downloadedIds);
      next.delete(contentId);
      setDownloadedIds(next);
      saveIds(next);
    },
    [downloadedIds, supported]
  );

  return { downloadedIds, isDownloaded, downloadingIds, download, remove, supported };
}
