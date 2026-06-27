import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ContentSummaryDto } from '../api';

/**
 * Global "now playing" state. Held at the app root so:
 *  - The full player and the floating mini player share the same DOM
 *    (so audio doesn't restart when minimizing).
 *  - Deep-link routes can `openPlayer(content)` without prop drilling.
 */

interface PlayerState {
  content: ContentSummaryDto | null;
  minimized: boolean;
  positionSeconds: number;
  durationSeconds: number;
  playing: boolean;
}

export interface PlayerContextValue extends PlayerState {
  openPlayer: (content: ContentSummaryDto) => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  setPosition: (seconds: number) => void;
  setDuration: (seconds: number) => void;
  setPlaying: (playing: boolean) => void;
  togglePlay: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<ContentSummaryDto | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [positionSeconds, setPositionSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [playing, setPlayingState] = useState(false);

  const openPlayer = useCallback((c: ContentSummaryDto) => {
    setContent(c);
    setMinimized(false);
    setPositionSeconds(0);
    setDurationSeconds(0);
  }, []);

  const minimize = useCallback(() => setMinimized(true), []);
  const maximize = useCallback(() => setMinimized(false), []);

  const close = useCallback(() => {
    setContent(null);
    setMinimized(false);
    setPositionSeconds(0);
    setDurationSeconds(0);
    setPlayingState(false);
  }, []);

  const setPosition = useCallback((s: number) => setPositionSeconds(s), []);
  const setDuration = useCallback((s: number) => setDurationSeconds(s), []);
  const setPlaying = useCallback((p: boolean) => setPlayingState(p), []);
  const togglePlay = useCallback(() => setPlayingState((p) => !p), []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      content,
      minimized,
      positionSeconds,
      durationSeconds,
      playing,
      openPlayer,
      minimize,
      maximize,
      close,
      setPosition,
      setDuration,
      setPlaying,
      togglePlay,
    }),
    [
      content,
      minimized,
      positionSeconds,
      durationSeconds,
      playing,
      openPlayer,
      minimize,
      maximize,
      close,
      setPosition,
      setDuration,
      setPlaying,
      togglePlay,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider');
  return ctx;
}
