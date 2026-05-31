import React, { useEffect, useRef, useState } from 'react';
import { ContentItem } from '../types';
import { LONG_CONTENT } from '../data/mockData';
import {
  BookmarkIcon,
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

interface LongFormatPlayerProps {
  initial: ContentItem;
  onClose: () => void;
  onSelect: (item: ContentItem) => void;
}

/**
 * YouTube-style long-format player.
 *  - Player on top (16:9), autoplays muted on open.
 *  - Below: title/meta, action pills (Like, Share, Save, Add to List),
 *    and the related-content list (1 per row).
 */
const LongFormatPlayer: React.FC<LongFormatPlayerProps> = ({ initial, onClose, onSelect }) => {
  const [item, setItem] = useState<ContentItem>(initial);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setItem(initial);
  }, [initial]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.play().catch(() => undefined);
    else v.pause();
  }, [playing, item.id]);

  const related = LONG_CONTENT.filter((c) => c.id !== item.id);

  return (
    <div className="bs-long-player">
      {/* Top: player */}
      <div className="bs-long-player__top">
        {item.videoUrl ? (
          <video
            ref={videoRef}
            src={item.videoUrl}
            poster={item.posterUrl}
            autoPlay
            playsInline
            muted
            controls={false}
          />
        ) : (
          <img src={item.posterUrl} alt={item.title} />
        )}

        <button className="bs-long-player__close" onClick={onClose} aria-label="Close">
          <CloseIcon size={20} />
        </button>

        {/* Center play/pause */}
        <button
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause' : 'Play'}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            background: 'transparent',
            color: '#fff',
            zIndex: 3,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'grid',
              placeItems: 'center',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              opacity: playing ? 0 : 1,
              transition: 'opacity 0.2s ease',
            }}
          >
            {playing ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
          </div>
        </button>

        {/* Bottom controls */}
        <div className="bs-long-player__controls" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause' : 'Play'}
            style={{ color: '#fff' }}
          >
            {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </button>
          <span className="bs-long-player__time">12:34</span>
          <div className="bs-long-player__progress">
            <div className="bs-long-player__progress-fill" />
          </div>
          <span className="bs-long-player__time">{item.durationLabel}</span>
          <button aria-label="Volume" style={{ color: '#fff' }}>
            <VolumeIcon size={18} />
          </button>
          <button aria-label="Fullscreen" style={{ color: '#fff' }}>
            <FullscreenIcon size={18} />
          </button>
        </div>
      </div>

      {/* Body: title, actions, related */}
      <div className="bs-long-player__body">
        <h2 className="bs-long-player__title">{item.title}</h2>
        <div className="bs-long-player__meta">
          <StarIcon size={12} style={{ verticalAlign: 'middle', color: 'var(--bs-orange)' }} />{' '}
          {item.rating?.toFixed(1)} · {item.author} · {item.genre} · {item.views} views
        </div>

        <div className="bs-long-player__actions">
          <button className="bs-action-pill">
            <HeartIcon size={14} /> Like
          </button>
          <button className="bs-action-pill">
            <ShareIcon size={14} /> Share
          </button>
          <button className="bs-action-pill">
            <BookmarkIcon size={14} /> Save
          </button>
          <button className="bs-action-pill">
            <PlusIcon size={14} /> Add to List
          </button>
        </div>

        {item.description && (
          <p
            style={{
              fontSize: 13,
              color: 'var(--bs-text-dim)',
              lineHeight: 1.5,
              margin: '0 0 18px',
            }}
          >
            {item.description}
          </p>
        )}

        <h3 className="bs-related-title">Up Next</h3>
        <ul className="bs-related-list">
          {related.map((rel) => (
            <li
              key={rel.id}
              className="bs-related-item"
              onClick={() => {
                setItem(rel);
                setPlaying(true);
                onSelect(rel);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="bs-related-thumb">
                <img src={rel.posterUrl} alt={rel.title} loading="lazy" />
              </div>
              <div className="bs-related-info">
                <h4>{rel.title}</h4>
                <p>
                  {rel.author} · {rel.genre}
                </p>
                <p>
                  {rel.durationLabel} · {rel.views} views
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LongFormatPlayer;
