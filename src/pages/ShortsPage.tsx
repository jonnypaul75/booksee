import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ContentItem, Genre } from '../types';
import { GENRE_FILTERS, SHORT_CONTENT } from '../data/mockData';
import { PlayIcon } from '../components/Icons';

interface ShortsPageProps {
  onOpenShort: (item: ContentItem) => void;
  defaultGenre?: Genre;
}

const PAGE_SIZE = 8;

const ShortsPage: React.FC<ShortsPageProps> = ({ onOpenShort, defaultGenre = 'All' }) => {
  const [genre, setGenre] = useState<Genre>(defaultGenre);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo<ContentItem[]>(() => {
    if (genre === 'All') return SHORT_CONTENT;
    return SHORT_CONTENT.filter((c) => c.genre === genre);
  }, [genre]);

  // Reset paging when filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [genre]);

  // Lazy load with IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
          }
        }
      },
      { root, rootMargin: '300px 0px', threshold: 0 }
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, [filtered.length]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="bs-screen" ref={scrollRef}>
      <div className="bs-filter">
        <div className="bs-chips" role="tablist" aria-label="Genres">
          {GENRE_FILTERS.map((g) => (
            <button
              key={g}
              role="tab"
              aria-selected={g === genre}
              className={`bs-chip ${g === genre ? 'bs-chip--active' : ''}`}
              onClick={() => setGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="bs-no-results">No shorts found for “{genre}”.</div>
      ) : (
        <div className="bs-grid-shorts">
          {visible.map((item) => (
            <button
              key={item.id}
              className="bs-poster-9x16"
              onClick={() => onOpenShort(item)}
              aria-label={`Play ${item.title}`}
            >
              <img
                className="bs-poster__img"
                src={item.posterUrl}
                alt={item.title}
                loading="lazy"
              />
              <span className="bs-poster__badge">{item.durationLabel}</span>
              <div className="bs-poster__overlay">
                <h3 className="bs-poster__title">{item.title}</h3>
                <div className="bs-poster__meta">
                  {item.author} · {item.genre}
                </div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.45)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  pointerEvents: 'none',
                }}
              >
                <PlayIcon size={22} />
              </div>
            </button>
          ))}
        </div>
      )}

      {hasMore && (
        <>
          <div className="bs-loader">Loading more…</div>
          <div ref={sentinelRef} style={{ height: 1 }} />
        </>
      )}
    </div>
  );
};

export default ShortsPage;
