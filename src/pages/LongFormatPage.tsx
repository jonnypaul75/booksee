import React, { useEffect, useRef, useState } from 'react';
import { ContentItem } from '../types';
import { LONG_CONTENT } from '../data/mockData';
import { PlayIcon } from '../components/Icons';

interface LongFormatPageProps {
  onOpenLong: (item: ContentItem) => void;
}

/**
 * Long format listing. One 16:9 poster per row.
 * When the poster enters the viewport, a muted autoplay preview begins;
 * tapping commits to the full player via `onOpenLong`.
 */
const LongFormatPage: React.FC<LongFormatPageProps> = ({ onOpenLong }) => {
  return (
    <div className="bs-screen">
      <div className="bs-filter" style={{ paddingBottom: 4 }}>
        <div className="bs-row" style={{ padding: '0 4px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--bs-white)',
            }}
          >
            For You · Long Format
          </h2>
          <div className="bs-spacer" />
          <span
            style={{
              fontSize: 11,
              color: 'var(--bs-text-dim)',
              letterSpacing: 0.4,
            }}
          >
            {LONG_CONTENT.length} titles
          </span>
        </div>
      </div>

      <div className="bs-list-long">
        {LONG_CONTENT.map((item) => (
          <LongRow key={item.id} item={item} onOpen={() => onOpenLong(item)} />
        ))}
      </div>
    </div>
  );
};

/* ---------- Row with intersection-driven autoplay preview ---------- */

interface LongRowProps {
  item: ContentItem;
  onOpen: () => void;
}

const LongRow: React.FC<LongRowProps> = ({ item, onOpen }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setIsVisible(e.isIntersecting && e.intersectionRatio > 0.6);
      },
      { threshold: [0, 0.6, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article className="bs-poster-16x9" ref={ref}>
      <button
        className="bs-poster-16x9__media"
        onClick={onOpen}
        aria-label={`Play ${item.title}`}
        style={{ border: 0, padding: 0, background: 'transparent', cursor: 'pointer' }}
      >
        {/* When a real video URL is wired in, replace <img> with <video autoPlay muted loop playsInline> */}
        {item.videoUrl && isVisible ? (
          <video
            src={item.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            poster={item.posterUrl}
          />
        ) : (
          <img src={item.posterUrl} alt={item.title} loading="lazy" />
        )}
        <span className="bs-poster__badge" style={{ top: 10, right: 10, left: 'auto' }}>
          {item.durationLabel}
        </span>
        <div className="bs-poster-16x9__playicon">
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <PlayIcon size={28} />
          </div>
        </div>
      </button>
      <div className="bs-poster-16x9__info">
        <h3 className="bs-poster-16x9__title">{item.title}</h3>
        <div className="bs-poster-16x9__meta">
          {item.author} · {item.genre} · {item.views} views
        </div>
      </div>
    </article>
  );
};

export default LongFormatPage;
