import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CURRENT_USER_ID, SearchResultDto, search } from '../api';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePlayer } from '../contexts/PlayerContext';
import { shareContent } from '../utils/sharing';
import { SearchIcon, CloseIcon, PlayIcon, ShareIcon } from '../components/Icons';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openPlayer } = usePlayer();

  const initialQ = searchParams.get('q') ?? '';
  const [q, setQ] = useState(initialQ);
  const debouncedQ = useDebouncedValue(q, 300);

  const [result, setResult] = useState<SearchResultDto>({ shorts: [], long: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Sync URL ?q= with the debounced query for shareable search URLs.
  useEffect(() => {
    const trimmed = debouncedQ.trim();
    if (trimmed) setSearchParams({ q: trimmed }, { replace: true });
    else setSearchParams({}, { replace: true });
  }, [debouncedQ, setSearchParams]);

  useEffect(() => {
    const needle = debouncedQ.trim();
    if (needle.length === 0) {
      setResult({ shorts: [], long: [] });
      setLoading(false);
      setError(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    search(needle, CURRENT_USER_ID, 24, controller.signal)
      .then((res) => setResult(res))
      .catch((e) => {
        if (e?.code !== 'ERR_CANCELED') setError(e);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedQ]);

  const total = result.shorts.length + result.long.length;
  const showingSuggestions = q.trim().length === 0;

  const handleShare = async (item: typeof result.shorts[number]) => {
    const r = await shareContent(item);
    if (r === 'copied') setShareToast('Link copied');
    else if (r === 'shared') setShareToast('Shared');
    if (r !== 'failed') window.setTimeout(() => setShareToast(null), 2000);
  };

  return (
    <div className="bs-screen">
      <div className="bs-search-bar">
        <div className="bs-search-input-wrap">
          <SearchIcon size={18} style={{ color: 'var(--bs-orange)' }} />
          <input
            className="bs-search-input"
            placeholder="Search titles, authors, genres…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoCorrect="off"
            autoCapitalize="off"
            inputMode="search"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Clear" style={{ color: 'var(--bs-text-dim)' }}>
              <CloseIcon size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="bs-search-section">
        {showingSuggestions ? (
          <p style={{ margin: '4px 4px 8px', fontSize: 12, color: 'var(--bs-text-dim)', letterSpacing: 0.3 }}>
            Try a title, an author, or a genre to get started.
          </p>
        ) : error ? (
          <div className="bs-no-results">Search failed. {error.message}</div>
        ) : loading ? (
          <div className="bs-loader">Searching…</div>
        ) : total === 0 ? (
          <div className="bs-no-results">No matches for "{q}".</div>
        ) : (
          <>
            {result.shorts.length > 0 && (
              <>
                <h3 className="bs-section-title">Shorts · {result.shorts.length}</h3>
                <div className="bs-grid-shorts" style={{ padding: 0 }}>
                  {result.shorts.map((item) => (
                    <div key={item.id} style={{ position: 'relative' }}>
                      <button
                        className="bs-poster-9x16"
                        onClick={() => openPlayer(item)}
                        aria-label={`Open ${item.title}`}
                      >
                        <img className="bs-poster__img" src={item.posterUrl} alt={item.title} />
                        <span className="bs-poster__badge">{item.durationLabel}</span>
                        <div className="bs-poster__overlay">
                          <h3 className="bs-poster__title">{item.title}</h3>
                          <div className="bs-poster__meta">{item.author}</div>
                        </div>
                      </button>
                      <button
                        className="bs-share-mini"
                        aria-label="Share"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(item);
                        }}
                      >
                        <ShareIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {result.long.length > 0 && (
              <>
                <h3 className="bs-section-title">Long Format · {result.long.length}</h3>
                <div className="bs-list-long" style={{ padding: 0 }}>
                  {result.long.map((item) => (
                    <article key={item.id} className="bs-poster-16x9" style={{ position: 'relative' }}>
                      <button
                        className="bs-poster-16x9__media"
                        onClick={() => openPlayer(item)}
                        style={{ border: 0, padding: 0, background: 'transparent', cursor: 'pointer' }}
                      >
                        <img src={item.posterUrl} alt={item.title} loading="lazy" />
                        <span className="bs-poster__badge" style={{ top: 10, right: 10, left: 'auto' }}>
                          {item.durationLabel}
                        </span>
                        <div className="bs-poster-16x9__playicon">
                          <div
                            style={{
                              width: 46,
                              height: 46,
                              borderRadius: '50%',
                              background: 'rgba(0,0,0,0.5)',
                              border: '1px solid rgba(255,255,255,0.25)',
                              display: 'grid',
                              placeItems: 'center',
                              color: '#fff',
                            }}
                          >
                            <PlayIcon size={22} />
                          </div>
                        </div>
                      </button>
                      <div className="bs-poster-16x9__info">
                        <h3 className="bs-poster-16x9__title">{item.title}</h3>
                        <div className="bs-poster-16x9__meta">
                          {item.author} · {item.genre}
                        </div>
                      </div>
                      <button
                        className="bs-share-mini"
                        aria-label="Share"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(item);
                        }}
                      >
                        <ShareIcon size={14} />
                      </button>
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {shareToast && <div className="bs-toast">{shareToast}</div>}
    </div>
  );
};

export default SearchPage;
