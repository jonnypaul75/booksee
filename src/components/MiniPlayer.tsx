import React from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { CloseIcon, PauseIcon, PlayIcon } from './Icons';

/**
 * Floating mini player rendered above the footer. Visible only when:
 *  - A piece of content is active (a player is open)
 *  - The player is in minimized state
 *  - The active content is long format (shorts don't have a useful mini view)
 *
 * Tap anywhere except the buttons to maximize. Buttons stop propagation.
 */
const MiniPlayer: React.FC = () => {
  const { content, minimized, playing, durationSeconds, positionSeconds, togglePlay, maximize, close } =
    usePlayer();

  if (!content || !minimized || content.format !== 'long') return null;

  const percent = durationSeconds > 0 ? Math.min(100, (positionSeconds / durationSeconds) * 100) : 0;

  return (
    <div
      className="bs-mini-player"
      role="button"
      tabIndex={0}
      onClick={maximize}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && maximize()}
      aria-label={`Maximize ${content.title}`}
    >
      <img className="bs-mini-player__thumb" src={content.posterUrl} alt="" />

      <div className="bs-mini-player__info">
        <div className="bs-mini-player__title">{content.title}</div>
        <div className="bs-mini-player__meta">
          {content.author} · {content.genre}
        </div>
        <div className="bs-mini-player__progress">
          <div className="bs-mini-player__progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <button
        className="bs-mini-player__btn"
        aria-label={playing ? 'Pause' : 'Play'}
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
      >
        {playing ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
      </button>
      <button
        className="bs-mini-player__btn"
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
      >
        <CloseIcon size={20} />
      </button>
    </div>
  );
};

export default MiniPlayer;
