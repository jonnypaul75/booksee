import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ContentSummaryDto, GenreDto, listContent, getGenres } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useActiveScrollItem } from '../hooks/useActiveScrollItem';
import { usePlayer } from '../contexts/PlayerContext';
import VideoPlayer from '../components/VideoPlayer';
import { PlayIcon } from '../components/Icons';

interface ShortsPageProps {
  defaultGenreId?: number | null;
}

const PAGE_SIZE = 20;

const ShortsPage: React.FC<ShortsPageProps> = ({ defaultGenreId }) => {
  const params = useParams<{ id?: string }>();
  const { openPlayer } = usePlayer();

  const { data: genres } = useAsync<GenreDto[]>((signal) => getGenres(signal), []);
  const [genreSlug, setGenreSlug] = useState<string>('all');

  useEffect(() => {
    if (!genres || defaultGenreId == null) return;
    const match = genres.find((g) => g.id === defaultGenreId);
    if (match) setGenreSlug(match.slug);
  }, [genres, defaultGenreId]);

  const [items, setItems] = useState<ContentSummaryDto[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Track which poster is most visible (drives autoplay).
  const { activeId, registerItem } = useActiveScrollItem<number>(scrollRef);

  // Deep link: /shorts/:id — when items are loaded and the URL has an id
  // that matches one of them, open the player.
  useEffect(() => {
    const idParam = params.id ? Number(params.id) : null;
    if (idParam == null || Number.isNaN(idParam)) return;
    const match = items.find((i) => i.id === idParam);
    if (match) openPlayer(match);
  }, [params.id, items, openPlayer]);

  useEffect(() => {
    const controller = new AbortController();
    setItems([]);
    setPage(1);
    setInitialLoading(true);
    setError(null);
    scrollRef.current?.scrollTo({ top: 0 });

    listContent({
      format: 'short',
      genre: genreSlug === 'all' ? undefined : genreSlug,
      page: 1,
      pageSize: PAGE_SIZE,
      signal: controller.signal,
    })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((e) => {
        if (e?.code !== 'ERR_CANCELED') setError(e);
      })
      .finally(() => setInitialLoading(false));

    return () => controller.abort();
  }, [genreSlug]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root) return;
    if (items.length >= total) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !loadingMore && items.length < total) {
            const next = page + 1;
            setLoadingMore(true);
            listContent({
              format: 'short',
              genre: genreSlug === 'all' ? undefined : genreSlug,
              page: next,
              pageSize: PAGE_SIZE,
            })
              .then((res) => {
                setItems((prev) => [...prev, ...res.items]);
                setPage(next);
              })
              .catch(() => {})
              .finally(() => setLoadingMore(false));
          }
        }
      },
      { root, rootMargin: '300px 0px', threshold: 0 }
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, [page, total, items.length, genreSlug, loadingMore]);

  const hasMore = items.length < total;

  return (
    <div className="bs-screen" ref={scrollRef}>
      <div className="bs-filter">
        <div className="bs-chips" role="tablist" aria-label="Genres">
          <button
            role="tab"
            aria-selected={genreSlug === 'all'}
            className={`bs-chip ${genreSlug === 'all' ? 'bs-chip--active' : ''}`}
            onClick={() => setGenreSlug('all')}
          >
            All
          </button>
          {genres?.map((g) => (
            <button
              key={g.id}
              role="tab"
              aria-selected={genreSlug === g.slug}
              className={`bs-chip ${genreSlug === g.slug ? 'bs-chip--active' : ''}`}
              onClick={() => setGenreSlug(g.slug)}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="bs-no-results">Couldn't load shorts. {error.message}</div>
      ) : initialLoading ? (
        <div className="bs-grid-shorts">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bs-poster-9x16 bs-skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bs-no-results">No shorts found.</div>
      ) : (
        <div className="bs-grid-shorts">
          {items.map((item) => (
            <ShortsTile
              key={item.id}
              item={item}
              isActive={activeId === item.id}
              registerItem={registerItem}
              onOpen={() => openPlayer(item)}
            />
          ))}
        </div>
      )}

      {hasMore && !initialLoading && (
        <>
          <div className="bs-loader">{loadingMore ? 'Loading more…' : ' '}</div>
          <div ref={sentinelRef} style={{ height: 1 }} />
        </>
      )}
    </div>
  );
};

/* ---------- Tile with autoplay preview when active ---------- */

interface ShortsTileProps {
  item: ContentSummaryDto;
  isActive: boolean;
  registerItem: (id: number, el: HTMLElement | null) => void;
  onOpen: () => void;
}

const ShortsTile: React.FC<ShortsTileProps> = ({ item, isActive, registerItem, onOpen }) => {
  return (
    <button
      ref={(el) => registerItem(item.id, el)}
      className="bs-poster-9x16"
      onClick={onOpen}
      aria-label={`Play ${item.title}`}
    >
      {isActive && item.trailerUrl ? (
        <VideoPlayer
          src={item.trailerUrl}
          poster={item.posterUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          ariaLabel={item.title}
        />
      ) : (
        <img className="bs-poster__img" src={item.posterUrl} alt={item.title} loading="lazy" />
      )}
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
          opacity: isActive && item.trailerUrl ? 0 : 1,
          transition: 'opacity 0.2s ease',
        }}
      >
        <PlayIcon size={22} />
      </div>
    </button>
  );
};

export default ShortsPage;
