import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ContentSummaryDto, listContent } from '../api';
import { useActiveScrollItem } from '../hooks/useActiveScrollItem';
import { usePlayer } from '../contexts/PlayerContext';
import VideoPlayer from '../components/VideoPlayer';
import { PlayIcon } from '../components/Icons';

const PAGE_SIZE = 20;

const LongFormatPage: React.FC = () => {
  const params = useParams<{ id?: string }>();
  const { openPlayer } = usePlayer();

  const [items, setItems] = useState<ContentSummaryDto[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { activeId, registerItem } = useActiveScrollItem<number>(scrollRef);

  useEffect(() => {
    const idParam = params.id ? Number(params.id) : null;
    if (idParam == null || Number.isNaN(idParam)) return;
    const match = items.find((i) => i.id === idParam);
    if (match) openPlayer(match);
  }, [params.id, items, openPlayer]);

  useEffect(() => {
    const controller = new AbortController();
    setInitialLoading(true);
    setError(null);

    listContent({
      format: 'long',
      page: 1,
      pageSize: PAGE_SIZE,
      signal: controller.signal,
    })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
        setPage(1);
      })
      .catch((e) => {
        if (e?.code !== 'ERR_CANCELED') setError(e);
      })
      .finally(() => setInitialLoading(false));

    return () => controller.abort();
  }, []);

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
            listContent({ format: 'long', page: next, pageSize: PAGE_SIZE })
              .then((res) => {
                setItems((prev) => [...prev, ...res.items]);
                setPage(next);
              })
              .catch(() => undefined)
              .finally(() => setLoadingMore(false));
          }
        }
      },
      { root, rootMargin: '300px 0px', threshold: 0 }
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, [page, total, items.length, loadingMore]);

  const hasMore = items.length < total;

  return (
    <div className="bs-screen" ref={scrollRef}>
      <div className="bs-filter" style={{ paddingBottom: 4 }}>
        <div className="bs-row" style={{ padding: '0 4px' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--bs-white)' }}>
            For You · Long Format
          </h2>
          <div className="bs-spacer" />
          <span style={{ fontSize: 11, color: 'var(--bs-text-dim)', letterSpacing: 0.4 }}>
            {initialLoading
              ? '…'
              : `${items.length}${total > items.length ? ` of ${total}` : ''} titles`}
          </span>
        </div>
      </div>

      {error ? (
        <div className="bs-no-results">Couldn't load long format content. {error.message}</div>
      ) : initialLoading ? (
        <div className="bs-list-long">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bs-poster-16x9 bs-skeleton" style={{ aspectRatio: '16 / 9' }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bs-no-results">No long format titles yet.</div>
      ) : (
        <div className="bs-list-long">
          {items.map((item) => (
            <LongRow
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

interface LongRowProps {
  item: ContentSummaryDto;
  isActive: boolean;
  registerItem: (id: number, el: HTMLElement | null) => void;
  onOpen: () => void;
}

const LongRow: React.FC<LongRowProps> = ({ item, isActive, registerItem, onOpen }) => {
  return (
    <article ref={(el) => registerItem(item.id, el)} className="bs-poster-16x9">
      <button
        className="bs-poster-16x9__media"
        onClick={onOpen}
        aria-label={`Play ${item.title}`}
        style={{ border: 0, padding: 0, background: 'transparent', cursor: 'pointer' }}
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
              opacity: isActive && item.trailerUrl ? 0 : 1,
              transition: 'opacity 0.2s ease',
            }}
          >
            <PlayIcon size={28} />
          </div>
        </div>
      </button>
      <div className="bs-poster-16x9__info">
        <h3 className="bs-poster-16x9__title">{item.title}</h3>
        <div className="bs-poster-16x9__meta">
          {item.author} · {item.genre} · {formatViews(item.views)} views
        </div>
      </div>
    </article>
  );
};

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default LongFormatPage;
