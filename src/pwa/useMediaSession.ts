import { useEffect } from 'react';

/**
 * Wires the Media Session API so the OS lock-screen / Bluetooth headset /
 * notification shade controls the current playback. Without this, hitting
 * pause on AirPods or the lock screen does nothing while the audiobook is
 * playing in a browser tab.
 *
 * Pass null/undefined `metadata` when nothing is playing — the hook
 * clears the session.
 */
export interface MediaSessionMetadataInput {
  title: string;
  artist?: string;
  album?: string;
  artwork?: string; // single URL — hook expands to standard sizes
}

export interface MediaSessionHandlers {
  onPlay?: () => void;
  onPause?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onSeekBackward?: (seconds: number) => void;
  onSeekForward?: (seconds: number) => void;
  onSeekTo?: (seconds: number) => void;
  onStop?: () => void;
}

export interface MediaSessionPosition {
  duration: number;
  position: number;
  playbackRate?: number;
}

export function useMediaSession(
  metadata: MediaSessionMetadataInput | null,
  handlers: MediaSessionHandlers,
  state: 'playing' | 'paused' | 'none' = 'none',
  position?: MediaSessionPosition
): void {
  // ----- metadata -----
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    if (!metadata) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: metadata.title,
      artist: metadata.artist ?? '',
      album: metadata.album ?? '',
      artwork: metadata.artwork
        ? [
            { src: metadata.artwork, sizes: '96x96', type: 'image/jpeg' },
            { src: metadata.artwork, sizes: '192x192', type: 'image/jpeg' },
            { src: metadata.artwork, sizes: '512x512', type: 'image/jpeg' },
          ]
        : [],
    });
  }, [metadata?.title, metadata?.artist, metadata?.album, metadata?.artwork]);

  // ----- playback state -----
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = state;
  }, [state]);

  // ----- action handlers -----
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;

    const setIf = (action: MediaSessionAction, handler?: (d: MediaSessionActionDetails) => void) => {
      try {
        ms.setActionHandler(action, handler ?? null);
      } catch {
        // Some actions (e.g. seekto) aren't supported on every browser.
      }
    };

    setIf('play', handlers.onPlay && (() => handlers.onPlay!()));
    setIf('pause', handlers.onPause && (() => handlers.onPause!()));
    setIf('previoustrack', handlers.onPrevious && (() => handlers.onPrevious!()));
    setIf('nexttrack', handlers.onNext && (() => handlers.onNext!()));
    setIf(
      'seekbackward',
      handlers.onSeekBackward && ((d) => handlers.onSeekBackward!(d.seekOffset ?? 10))
    );
    setIf(
      'seekforward',
      handlers.onSeekForward && ((d) => handlers.onSeekForward!(d.seekOffset ?? 10))
    );
    setIf(
      'seekto',
      handlers.onSeekTo && ((d) => d.seekTime != null && handlers.onSeekTo!(d.seekTime))
    );
    setIf('stop', handlers.onStop && (() => handlers.onStop!()));

    return () => {
      setIf('play', undefined);
      setIf('pause', undefined);
      setIf('previoustrack', undefined);
      setIf('nexttrack', undefined);
      setIf('seekbackward', undefined);
      setIf('seekforward', undefined);
      setIf('seekto', undefined);
      setIf('stop', undefined);
    };
  }, [
    handlers.onPlay,
    handlers.onPause,
    handlers.onPrevious,
    handlers.onNext,
    handlers.onSeekBackward,
    handlers.onSeekForward,
    handlers.onSeekTo,
    handlers.onStop,
  ]);

  // ----- position state (lets the OS show a real scrubber) -----
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    if (!position) return;
    try {
      navigator.mediaSession.setPositionState({
        duration: Math.max(0, position.duration),
        position: Math.max(0, Math.min(position.position, position.duration)),
        playbackRate: position.playbackRate ?? 1,
      });
    } catch {
      // setPositionState throws on weird values — swallow.
    }
  }, [position?.duration, position?.position, position?.playbackRate]);
}
