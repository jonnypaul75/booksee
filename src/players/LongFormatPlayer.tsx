import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CURRENT_USER_ID,
  ContentDetailDto,
  ContentSummaryDto,
  createWatchEvent,
  getContent,
  getProgress,
  listContent,
  upsertProgress,
} from '../api';
import { useMediaSession } from '../pwa/useMediaSession';
import { useWakeLock } from '../pwa/useWakeLock';
import { useOfflineDownloads } from '../pwa/useOfflineDownloads';
import { usePlayer } from '../contexts/PlayerContext';
import { shareContent } from '../utils/sharing';
import VideoPlayer, { VideoPlayerHandle } from '../components/VideoPlayer';
import {
  BookmarkIcon,
  CheckIcon,
  CloseIcon,
  FullscreenIcon,
  HeartIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  ShareIcon,
  StarIcon,
  VolumeIcon,
} from '../components/Icons';

const PROGRESS_SAVE_INTERVAL_MS = 5000;
const SEEK_OFFSET_SECONDS = 15;

/**
 * YouTube-style long-format player.
 *
 * Reads the active content + mini/full state from PlayerContext. The DOM
 * stays mounted across minimize/maximize transitions so the underlying
 * <video> element keeps playing audio when minimized.
 *
 * Rendered at the App root by <ActivePlayer /> whenever there's active
 * long-format content.
 */
const LongFormatPlayer: React.FC = () => {
  const {
    content,
    minimized,
    minimize,
    maximize,
    close,
    setPosition,
    setDuration,
    setPlaying: setCtxPlaying,
  } = usePlayer();

  const [activeId, setActiveId] = useState<number | null>(content?.id ?? null);
  const [detail, setDetail] = useState<ContentDetailDto | null>(null);
  const [related, setRelated] = useState<ContentSummaryDto[]>([]);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [positionSeconds, setPositionSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [bufferedSeconds, setBufferedSeconds] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [showCenterPlay, setShowCenterPlay] = useState(true);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const videoRef = useRef<VideoPlayerHandle | null>(null);
  const sessionStartRef = useRef<Date>(new Date());
  const sessionStartPosRef = useRef<number>(0);
  const pendingSeekRef = useRef<number>(0);

  const downloads = useOfflineDownloads();

  useWakeLock(playing && detail !== null && !minimized);

  // Sync activeId with context content.
  useEffect(() => {
    if (content && content.format === 'long' && content.id !== activeId) {
      setActiveId(content.id);
    }
  }, [content, activeId]);

  useEffect(() => {
    if (activeId == null) return;
    let cancelled = false;
    setDetail(null);
    setPositionSeconds(0);
    setDurationSeconds(0);
    setBufferedSeconds(0);
    setPlaying(false);
    sessionStartRef.current = new Date();
    sessionStartPosRef.current = 0;
    pendingSeekRef.current = 0;

    getContent(activeId)
      .then(async (d) => {
        if (cancelled) return;
        setDetail(d);
        const existing = await getProgress(CURRENT_USER_ID, d.id, null).catch(() => null);
        if (!cancelled && existing && !existing.isCompleted) {
          pendingSeekRef.current = existing.positionSeconds;
          sessionStartPosRef.current = existing.positionSeconds;
          setPositionSeconds(existing.positionSeconds);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [activeId]);

  useEffect(() => {
    if (activeId == null) return;
    let cancelled = false;
    listContent({ format: 'long', pageSize: 20 })
      .then((res) => {
        if (cancelled) return;
        setRelated(res.items.filter((c) => c.id !== activeId));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  // Periodic resume save while playing.
  useEffect(() => {
    if (!detail || !playing) return;
    const id = window.setInterval(() => {
      if (positionSeconds <= 0) return;
      upsertProgress(CURRENT_USER_ID, {
        contentId: detail.id,
        episodeId: null,
        positionSeconds: Math.round(positionSeconds),
        durationSeconds: Math.round(durationSeconds || detail.durationSeconds),
        lastPlayedLanguage: detail.language?.toLowerCase().slice(0, 2),
      }).catch(() => undefined);
    }, PROGRESS_SAVE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [detail, playing, positionSeconds, durationSeconds]);

  // Bridge video state into PlayerContext so MiniPlayer + footer can read it.
  useEffect(() => setPosition(positionSeconds), [positionSeconds, setPosition]);
  useEffect(() => setDuration(durationSeconds), [durationSeconds, setDuration]);
  useEffect(() => setCtxPlaying(playing), [playing, setCtxPlaying]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.pause();
    else void v.play();
  }, [playing]);

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.seek(v.getCurrentTime() + delta);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    videoRef.current?.seek(seconds);
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!durationSeconds) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seekTo(durationSeconds * ratio);
    },
    [durationSeconds, seekTo]
  );

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      const el = videoRef.current?.videoElement;
      if (el) el.muted = next;
      return next;
    });
  }, []);

  const enterFullscreen = useCallback(() => {
    const el = videoRef.current?.videoElement;
    if (!el) return;
    type IosVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    const v = el as IosVideo;
    if (v.requestFullscreen) v.requestFullscreen().catch(() => undefined);
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
  }, []);

  const handleShare = useCallback(async () => {
    if (!content) return;
    const result = await shareContent(content);
    if (result === 'copied') setShareToast('Link copied to clipboard');
    else if (result === 'shared') setShareToast('Shared');
    if (result !== 'failed') window.setTimeout(() => setShareToast(null), 2400);
  }, [content]);

  useMediaSession(
    detail
      ? {
          title: detail.title,
          artist: detail.author,
          album: detail.genre,
          artwork: detail.posterUrl,
        }
      : null,
    {
      onPlay: () => void videoRef.current?.play(),
      onPause: () => videoRef.current?.pause(),
      onSeekBackward: (s) => seekBy(-s || -SEEK_OFFSET_SECONDS),
      onSeekForward: (s) => seekBy(s || SEEK_OFFSET_SECONDS),
      onSeekTo: seekTo,
      onStop: () => videoRef.current?.pause(),
    },
    detail ? (playing ? 'playing' : 'paused') : 'none',
    detail
      ? {
          duration: durationSeconds || detail.durationSeconds,
          position: positionSeconds,
          playbackRate: 1,
        }
      : undefined
  );

  const handleClose = () => {
    if (detail) {
      upsertProgress(CURRENT_USER_ID, {
        contentId: detail.id,
        episodeId: null,
        positionSeconds: Math.round(positionSeconds),
        durationSeconds: Math.round(durationSeconds || detail.durationSeconds),
        lastPlayedLanguage: detail.language?.toLowerCase().slice(0, 2),
      }).catch(() => undefined);

      createWatchEvent(CURRENT_USER_ID, {
        contentId: detail.id,
        episodeId: null,
        startedAt: sessionStartRef.current.toISOString(),
        endedAt: new Date().toISOString(),
        secondsWatched: Math.max(0, Math.round(positionSeconds - sessionStartPosRef.current)),
        startPosition: Math.round(sessionStartPosRef.current),
        endPosition: Math.round(positionSeconds),
        languageCode: detail.language?.toLowerCase().slice(0, 2),
        completed: positionSeconds / Math.max(durationSeconds || detail.durationSeconds, 1) >= 0.95,
        exitReason: 'user_quit',
        networkType: navigator.onLine ? 'wifi' : 'unknown',
      }).catch(() => undefined);
    }
    close();
  };

  const percent =
    durationSeconds > 0 ? Math.min(100, (positionSeconds / durationSeconds) * 100) : 0;
  const bufferPercent =
    durationSeconds > 0 ? Math.min(100, (bufferedSeconds / durationSeconds) * 100) : 0;

  if (!content || content.format !== 'long' || activeId == null) return null;

  if (!detail) {
    return (
      <div className={`bs-long-player ${minimized ? 'bs-long-player--minimized' : ''}`}>
        <div className="bs-long-player__top bs-skeleton" />
        {!minimized && (
          <div className="bs-long-player__body">
            <div className="bs-loader">Loading…</div>
          </div>
        )}
      </div>
    );
  }

  const isDownloaded = downloads.isDownloaded(detail.id);
  const isDownloading = downloads.downloadingIds.has(detail.id);

  return (
    <div
      className={`bs-long-player ${minimized ? 'bs-long-player--minimized' : ''}`}
      role="region"
      aria-label={`Player: ${detail.title}`}
    >
      {/* Top: real video. Tap-to-maximize when minimized. */}
      <div
        className="bs-long-player__top"
        onClick={minimized ? maximize : undefined}
        style={minimized ? { cursor: 'pointer' } : undefined}
      >
        <VideoPlayer
          ref={videoRef}
          src={detail.trailerUrl ?? null}
          poster={detail.posterUrl}
          autoPlay
          muted={muted}
          playsInline
          preload="metadata"
          ariaLabel={detail.title}
          onLoadedMetadata={(d) => {
            setDurationSeconds(d || detail.durationSeconds);
            if (pendingSeekRef.current > 0) {
              videoRef.current?.seek(pendingSeekRef.current);
              pendingSeekRef.current = 0;
            }
          }}
          onTimeUpdate={(t) => setPositionSeconds(t)}
          onPlay={() => {
            setPlaying(true);
            setShowCenterPlay(false);
            setWaiting(false);
          }}
          onPause={() => {
            setPlaying(false);
            setShowCenterPlay(true);
          }}
          onWaiting={() => setWaiting(true)}
          onPlaying={() => setWaiting(false)}
          onEnded={() => {
            setPlaying(false);
            setShowCenterPlay(true);
          }}
          onBuffered={(b) => setBufferedSeconds(b)}
        />

        {/* Top-right buttons */}
        <div className="bs-long-player__topactions">
          {!minimized && (
            <button
              className="bs-long-player__topbtn"
              onClick={(e) => {
                e.stopPropagation();
                minimize();
              }}
              aria-label="Minimize"
              title="Minimize"
            >
              {/* chevron-down */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          )}
          <button
            className="bs-long-player__topbtn"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            aria-label="Close"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Center play overlay — hidden when minimized */}
        {!minimized && (
          <button
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              background: 'transparent',
              color: '#fff',
              zIndex: 3,
              pointerEvents: showCenterPlay ? 'auto' : 'none',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.25)',
                display: 'grid',
                placeItems: 'center',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                opacity: showCenterPlay ? 1 : 0,
                transition: 'opacity 0.2s ease',
              }}
            >
              {waiting ? <div className="bs-spinner" /> : playing ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
            </div>
          </button>
        )}

        {/* Bottom controls — hidden when minimized; mini controls render in the strip */}
        {!minimized && (
          <div className="bs-long-player__controls" onClick={(e) => e.stopPropagation()}>
            <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} style={{ color: '#fff' }}>
              {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
            </button>
            <span className="bs-long-player__time">{formatTime(positionSeconds)}</span>
            <div
              className="bs-long-player__progress"
              onClick={handleProgressClick}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(durationSeconds)}
              aria-valuenow={Math.round(positionSeconds)}
            >
              <div className="bs-long-player__progress-buffer" style={{ width: `${bufferPercent}%` }} />
              <div className="bs-long-player__progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <span className="bs-long-player__time">
              {formatTime(durationSeconds || detail.durationSeconds)}
            </span>
            <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} style={{ color: '#fff' }}>
              <VolumeIcon size={18} style={{ opacity: muted ? 0.4 : 1 }} />
            </button>
            <button onClick={enterFullscreen} aria-label="Fullscreen" style={{ color: '#fff' }}>
              <FullscreenIcon size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Body — hidden when minimized via CSS */}
      <div className="bs-long-player__body">
        <h2 className="bs-long-player__title">{detail.title}</h2>
        <div className="bs-long-player__meta">
          <StarIcon size={12} style={{ verticalAlign: 'middle', color: 'var(--bs-orange)' }} />{' '}
          {detail.avgRating.toFixed(1)} · {detail.author} · {detail.genre} ·{' '}
          {formatViews(detail.viewCount)} views
        </div>

        <div className="bs-long-player__actions">
          <button className="bs-action-pill">
            <HeartIcon size={14} /> Like
          </button>
          <button className="bs-action-pill" onClick={handleShare}>
            <ShareIcon size={14} /> Share
          </button>
          <button className="bs-action-pill">
            <BookmarkIcon size={14} /> Save
          </button>
          <button className="bs-action-pill">
            <PlusIcon size={14} /> Add to List
          </button>

          {downloads.supported && (
            <button
              className="bs-action-pill"
              disabled={isDownloading}
              onClick={() => {
                if (isDownloaded) downloads.remove(detail.id).catch(() => undefined);
                else downloads.download(detail).catch(() => undefined);
              }}
              style={
                isDownloaded
                  ? {
                      background: 'linear-gradient(145deg, rgba(255,46,63,0.25), rgba(255,138,31,0.18))',
                      border: '1px solid rgba(255,138,31,0.4)',
                    }
                  : undefined
              }
            >
              {isDownloading ? <>Downloading…</> : isDownloaded ? <><CheckIcon size={14} /> Downloaded</> : <><PlusIcon size={14} /> Download</>}
            </button>
          )}
        </div>

        {detail.description && (
          <p style={{ fontSize: 13, color: 'var(--bs-text-dim)', lineHeight: 1.5, margin: '0 0 18px' }}>
            {detail.description}
          </p>
        )}

        <h3 className="bs-related-title">Up Next</h3>
        <ul className="bs-related-list">
          {related.map((rel) => (
            <li
              key={rel.id}
              className="bs-related-item"
              onClick={() => {
                if (detail) {
                  upsertProgress(CURRENT_USER_ID, {
                    contentId: detail.id,
                    episodeId: null,
                    positionSeconds: Math.round(positionSeconds),
                    durationSeconds: Math.round(durationSeconds || detail.durationSeconds),
                  }).catch(() => undefined);
                }
                setActiveId(rel.id);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="bs-related-thumb">
                <img src={rel.posterUrl} alt={rel.title} loading="lazy" />
              </div>
              <div className="bs-related-info">
                <h4>
                  {rel.title}{' '}
                  {downloads.isDownloaded(rel.id) && (
                    <span style={{ fontSize: 9, color: 'var(--bs-orange)', marginLeft: 6, letterSpacing: 0.5 }}>
                      ● OFFLINE
                    </span>
                  )}
                </h4>
                <p>{rel.author} · {rel.genre}</p>
                <p>{rel.durationLabel} · {formatViews(rel.views)} views</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {shareToast && <div className="bs-toast">{shareToast}</div>}
    </div>
  );
};

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default LongFormatPlayer;
