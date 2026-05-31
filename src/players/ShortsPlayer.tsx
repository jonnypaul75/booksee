import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ContentItem } from '../types';
import { SHORT_CONTENT } from '../data/mockData';
import {
  BookmarkIcon,
  CloseIcon,
  CommentIcon,
  HeartIcon,
  ShareIcon,
} from '../components/Icons';

interface ShortsPlayerProps {
  initial: ContentItem;
  onClose: () => void;
}

/**
 * WhatsApp-status-style shorts player.
 *
 * Navigation:
 *  - Tap left third of screen  → previous episode within the current story
 *  - Tap right third of screen → next episode within the current story
 *  - Swipe DOWN → previous story (different short)
 *  - Swipe UP   → next story
 *
 * Episodes auto-advance after a fixed timer (PROGRESS_DURATION_MS).
 * When the last episode of a story completes it falls forward to the next story.
 */

const PROGRESS_DURATION_MS = 5000;

const ShortsPlayer: React.FC<ShortsPlayerProps> = ({ initial, onClose }) => {
  // Build a story list seeded with the chosen item first so swipes feel natural.
  const stories = useMemo<ContentItem[]>(() => {
    const idx = SHORT_CONTENT.findIndex((c) => c.id === initial.id);
    if (idx < 0) return [initial, ...SHORT_CONTENT];
    return [...SHORT_CONTENT.slice(idx), ...SHORT_CONTENT.slice(0, idx)];
  }, [initial.id]);

  const [storyIdx, setStoryIdx] = useState(0);
  const [episodeIdx, setEpisodeIdx] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1
  const [paused, setPaused] = useState(false);

  const story = stories[storyIdx];
  const episodes = story.episodes ?? [];
  const totalEpisodes = Math.max(episodes.length, 1);

  /* ----------- Auto-progress timer ----------- */
  useEffect(() => {
    setProgress(0);
    if (paused) return;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / PROGRESS_DURATION_MS);
      setProgress(p);
      if (p >= 1) {
        advanceEpisode();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyIdx, episodeIdx, paused]);

  /* ----------- Navigation ----------- */

  const advanceEpisode = () => {
    if (episodeIdx + 1 < totalEpisodes) {
      setEpisodeIdx((i) => i + 1);
    } else {
      goNextStory();
    }
  };

  const rewindEpisode = () => {
    if (episodeIdx > 0) {
      setEpisodeIdx((i) => i - 1);
    } else {
      goPrevStory(true);
    }
  };

  const goNextStory = () => {
    if (storyIdx + 1 < stories.length) {
      setStoryIdx((i) => i + 1);
      setEpisodeIdx(0);
    } else {
      // Loop to the start
      setStoryIdx(0);
      setEpisodeIdx(0);
    }
  };

  const goPrevStory = (jumpToLastEpisode = false) => {
    if (storyIdx === 0) {
      setEpisodeIdx(0);
      setProgress(0);
      return;
    }
    setStoryIdx((i) => i - 1);
    setEpisodeIdx(jumpToLastEpisode ? Math.max(0, totalEpisodes - 1) : 0);
  };

  /* ----------- Touch handlers for vertical swipe between stories ----------- */
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

    // Vertical swipe wins when y movement is dominant
    if (ady > 50 && ady > adx && dt < 600) {
      if (dy < 0) goNextStory();
      else goPrevStory();
    }
  };

  /* ----------- Render ----------- */

  // Active episode poster (used as image since we don't have real videos)
  const activeEpisode = episodes[episodeIdx] ?? {
    id: story.id,
    title: story.title,
    duration: 5,
    posterUrl: story.posterUrl,
  };

  return (
    <div
      className="bs-shorts-player"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Stories are stacked vertically; translateY simulates the swipe transition */}
      <div
        className="bs-shorts-stage"
        style={{ transform: `translateY(-${storyIdx * 100}%)`, height: `${stories.length * 100}%` }}
      >
        {stories.map((s, i) => {
          const isActive = i === storyIdx;
          const eps = s.episodes ?? [];
          const curEp = isActive ? episodeIdx : 0;
          return (
            <section className="bs-shorts-story" key={s.id} aria-hidden={!isActive}>
              {/* Episode horizontal track */}
              <div
                className="bs-shorts-episode-track"
                style={{
                  width: `${Math.max(eps.length, 1) * 100}%`,
                  transform: `translateX(-${(curEp * 100) / Math.max(eps.length, 1)}%)`,
                }}
              >
                {(eps.length ? eps : [{ id: s.id, title: s.title, duration: 5, posterUrl: s.posterUrl }]).map(
                  (ep) => (
                    <div className="bs-shorts-episode" key={ep.id}>
                      {/* Replace <img> with <video autoPlay muted loop playsInline src={ep.videoUrl}/> when wiring real media */}
                        <video
  src={(ep as any).videoUrl || "https://files.catbox.moe/hbn2bk.mp4"}
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
  className="bs-shorts-video"
   style={{
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    objectFit: "cover",
    background: "#000",
  }}
/>
                    </div>
                  )
                )}
              </div>

              {/* Progress bars at top */}
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

              {/* Tap zones for episode prev/next */}
              {isActive && (
                <div className="bs-shorts-tap-zones">
                  <div
                    className="bs-shorts-tap-zone"
                    onClick={rewindEpisode}
                    aria-label="Previous episode"
                  />
                  <div
                    className="bs-shorts-tap-zone"
                    onClick={() => setPaused((p) => !p)}
                    aria-label="Toggle pause"
                  />
                  <div
                    className="bs-shorts-tap-zone"
                    onClick={advanceEpisode}
                    aria-label="Next episode"
                  />
                </div>
              )}

              {/* Side actions */}
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
                  <button className="bs-shorts-action" aria-label="Share">
                    <ShareIcon size={20} />
                  </button>
                </div>
              )}

              {/* Bottom overlay */}
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

      {/* Close */}
      <button className="bs-shorts-close" onClick={onClose} aria-label="Close player">
        <CloseIcon size={20} />
      </button>
    </div>
  );
};

export default ShortsPlayer;
