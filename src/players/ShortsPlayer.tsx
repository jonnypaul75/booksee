import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CURRENT_USER_ID,
  ContentDetailDto,
  ContentSummaryDto,
  EpisodeDto,
  createWatchEvent,
  getContent,
  listContent,
  upsertProgress,
} from '../api';
import { useMediaSession } from '../pwa/useMediaSession';
import { useWakeLock } from '../pwa/useWakeLock';
import { usePlayer } from '../contexts/PlayerContext';
import { shareContent } from '../utils/sharing';
import VideoPlayer, { VideoPlayerHandle } from '../components/VideoPlayer';
import {
  BookmarkIcon,
  CloseIcon,
  CommentIcon,
  HeartIcon,
  ShareIcon,
} from '../components/Icons';

const FALLBACK_DURATION_MS = 5000;
const PEER_STORY_LIMIT = 20;

/**
 * WhatsApp-status / YouTube-shorts style player. Sources the active
 * content from PlayerContext so deep links can open it.
 *
 * Shorts intentionally don't support minimize — they're brief and
 * auto-advancing. The mini player only ever renders for long format.
 */
const ShortsPlayer: React.FC = () => {
  const { content, close } = usePlayer();
  const initial = content && content.format === 'short' ? content : null;

  const [peerStories, setPeerStories] = useState<ContentSummaryDto[]>([]);
  const [activeDetail, setActiveDetail] = useState<ContentDetailDto | null>(null);

  const [storyIdx, setStoryIdx] = useState(0);
  const [episodeIdx, setEpisodeIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const videoRef = useRef<VideoPlayerHandle | null>(null);
  const sessionStartRef = useRef<Date>(new Date());
  const sessionStartPosRef = useRef<number>(0);

  const stories: ContentSummaryDto[] = useMemo(
    () => (initial ? [initial, ...peerStories] : peerStories),
    [initial, peerStories]
  );

  useWakeLock(!paused && initial !== null);

  // Reset to first story when active content changes.
  useEffect(() => {
    setStoryIdx(0);
    setEpisodeIdx(0);
    setProgress(0);
  }, [initial?.id]);

  useEffect(() => {
    if (!initial) return;
    let cancelled = false;
    listContent({ format: 'short', pageSize: PEER_STORY_LIMIT })
      .then((res) => {
        if (cancelled) return;
        setPeerStories(res.items.filter((c) => c.id !== initial.id));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [initial?.id]);

  useEffect(() => {
    const active = stories[storyIdx];
    if (!active) return;
    let cancelled = false;
    setActiveDetail(null);
    setEpisodeIdx(0);
    setProgress(0);

    getContent(active.id)
      .then((d) => {
        if (cancelled) return;
        setActiveDetail(d);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [storyIdx, stories]);

  const episodes: EpisodeDto[] = activeDetail?.episodes ?? [];
  const totalEpisodes = Math.max(episodes.length, 1);
  const activeEpisode: EpisodeDto | undefined = episodes[episodeIdx];
  const hasVideo = !!activeEpisode?.videoUrl;

  useEffect(() => {
    if (!activeDetail || !activeEpisode) return;
    upsertProgress(CURRENT_USER_ID, {
      contentId: activeDetail.id,
      episodeId: activeEpisode.id,
      positionSeconds: 0,
      durationSeconds: activeEpisode.durationSeconds || 60,
      lastPlayedLanguage: activeDetail.language?.toLowerCase().slice(0, 2),
    }).catch(() => undefined);
    sessionStartRef.current = new Date();
    sessionStartPosRef.current = 0;
  }, [activeDetail, activeEpisode]);

  const advanceEpisode = useCallback(() => {
    setEpisodeIdx((i) => {
      if (i + 1 < totalEpisodes) return i + 1;
      setStoryIdx((s) => (s + 1 < stories.length ? s + 1 : 0));
      return 0;
    });
  }, [totalEpisodes, stories.length]);

  const rewindEpisode = useCallback(() => {
    setEpisodeIdx((i) => {
      if (i > 0) return i - 1;
      setStoryIdx((s) => Math.max(0, s - 1));
      return 0;
    });
  }, []);

  const goNextStory = useCallback(() => {
    setStoryIdx((i) => (i + 1 < stories.length ? i + 1 : 0));
    setEpisodeIdx(0);
  }, [stories.length]);

  const goPrevStory = useCallback(() => {
    setStoryIdx((i) => Math.max(0, i - 1));
    setEpisodeIdx(0);
  }, []);

  useEffect(() => {
    setProgress(0);
    if (paused || hasVideo) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / FALLBACK_DURATION_MS);
      setProgress(p);
      if (p >= 1) {
        advanceEpisode();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [storyIdx, episodeIdx, paused, hasVideo, advanceEpisode]);

  useEffect(() => {
    if (!hasVideo) return;
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else void v.play();
  }, [paused, hasVideo]);

  useMediaSession(
    activeDetail
      ? {
          title: activeDetail.title,
          artist: activeDetail.author,
          album: `Episode ${episodeIdx + 1}`,
          artwork: activeEpisode?.posterUrl ?? activeDetail.posterUrl,
        }
      : null,
    {
      onPlay: () => setPaused(false),
      onPause: () => setPaused(true),
      onPrevious: rewindEpisode,
      onNext: advanceEpisode,
    },
    activeDetail ? (paused ? 'paused' : 'playing') : 'none'
  );

  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    setPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    setPaused(false);
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    const end = e.changedTouches[0];
    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    const dt = Date.now() - start.t;
    if (ady > 50 && ady > adx && dt < 600) {
      if (dy < 0) goNextStory();
      else goPrevStory();
    }
  };

  const handleShare = async () => {
    const current = stories[storyIdx];
    if (!current) return;
    const result = await shareContent(current);
    if (result === 'copied') setShareToast('Link copied');
    else if (result === 'shared') setShareToast('Shared');
    if (result !== 'failed') window.setTimeout(() => setShareToast(null), 2000);
  };

  const handleClose = () => {
    if (activeDetail && activeEpisode) {
      const startedAt = sessionStartRef.current.toISOString();
      const endedAt = new Date().toISOString();
      const secondsWatched = Math.max(
        1,
        Math.round((Date.now() - sessionStartRef.current.getTime()) / 1000)
      );
      createWatchEvent(CURRENT_USER_ID, {
        contentId: activeDetail.id,
        episodeId: activeEpisode.id,
        startedAt,
        endedAt,
        secondsWatched,
        startPosition: sessionStartPosRef.current,
        endPosition: Math.round(progress * (activeEpisode.durationSeconds || 60)),
        languageCode: activeDetail.language?.toLowerCase().slice(0, 2),
        completed: progress >= 0.95,
        exitReason: 'user_quit',
        networkType: navigator.onLine ? 'wifi' : 'unknown',
      }).catch(() => undefined);
    }
    close();
  };

  if (!initial) return null;

  return (
    <div className="bs-shorts-player" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div
        className="bs-shorts-stage"
        style={{
          transform: `translateY(-${storyIdx * 100}%)`,
          height: `${stories.length * 100}%`,
        }}
      >
        {stories.map((s, i) => {
          const isActive = i === storyIdx;
          const eps = isActive ? episodes : [];
          const curEp = isActive ? episodeIdx : 0;

          return (
            <section className="bs-shorts-story" key={s.id} aria-hidden={!isActive}>
              <div
                className="bs-shorts-episode-track"
                style={{
                  width: `${Math.max(eps.length, 1) * 100}%`,
                  transform: `translateX(-${(curEp * 100) / Math.max(eps.length, 1)}%)`,
                }}
              >
                {(eps.length
                  ? eps
                  : [
                      {
                        id: -1 * s.id,
                        episodeNumber: 1,
                        durationSeconds: 0,
                        posterUrl: s.posterUrl,
                      } as EpisodeDto,
                    ]
                ).map((ep, epIdx) => {
                  const isActiveEp = isActive && epIdx === episodeIdx;
                  if (isActiveEp && ep.videoUrl) {
                    return (
                      <div className="bs-shorts-episode" key={ep.id}>
                        <VideoPlayer
                          ref={videoRef}
                          src={ep.videoUrl}
                          poster={ep.posterUrl ?? s.posterUrl}
                          autoPlay
                          playsInline
                          muted={false}
                          preload="auto"
                          ariaLabel={`${s.title} — Episode ${ep.episodeNumber}`}
                          onTimeUpdate={(t, d) => {
                            if (d > 0) setProgress(Math.min(1, t / d));
                          }}
                          onEnded={() => advanceEpisode()}
                        />
                      </div>
                    );
                  }
                  return (
                    <div className="bs-shorts-episode" key={ep.id}>
                      <img src={ep.posterUrl ?? s.posterUrl} alt={s.title} />
                    </div>
                  );
                })}
              </div>

              {isActive && (
                <div className="bs-shorts-progress">
                  {Array.from({ length: Math.max(eps.length, 1) }).map((_, k) => (
                    <div className="bs-shorts-progress__bar" key={k}>
                      <div
                        className={
                          'bs-shorts-progress__fill' +
                          (k < episodeIdx ? ' bs-shorts-progress__fill--full' : '')
                        }
                        style={{
                          width:
                            k < episodeIdx
                              ? '100%'
                              : k === episodeIdx
                              ? `${progress * 100}%`
                              : '0%',
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {isActive && (
                <div className="bs-shorts-tap-zones">
                  <div className="bs-shorts-tap-zone" onClick={rewindEpisode} aria-label="Previous episode" />
                  <div className="bs-shorts-tap-zone" onClick={() => setPaused((p) => !p)} aria-label="Toggle pause" />
                  <div className="bs-shorts-tap-zone" onClick={advanceEpisode} aria-label="Next episode" />
                </div>
              )}

              {isActive && (
                <div className="bs-shorts-actions">
                  <button className="bs-shorts-action" aria-label="Like">
                    <HeartIcon size={20} />
                  </button>
                  <button className="bs-shorts-action" aria-label="Comment">
                    <CommentIcon size={20} />
                  </button>
                  <button className="bs-shorts-action" aria-label="Save">
                    <BookmarkIcon size={20} />
                  </button>
                  <button className="bs-shorts-action" aria-label="Share" onClick={handleShare}>
                    <ShareIcon size={20} />
                  </button>
                </div>
              )}

              {isActive && (
                <div className="bs-shorts-overlay">
                  <h2 className="bs-shorts-title">{s.title}</h2>
                  <div className="bs-shorts-meta">
                    {s.author} · {s.genre} · Episode {episodeIdx + 1} of {totalEpisodes}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <button className="bs-shorts-close" onClick={handleClose} aria-label="Close player">
        <CloseIcon size={20} />
      </button>

      {shareToast && <div className="bs-toast">{shareToast}</div>}
    </div>
  );
};

export default ShortsPlayer;
