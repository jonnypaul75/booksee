import React, { useMemo, useState } from 'react';
import { ContentItem } from '../types';
import { LONG_CONTENT, SHORT_CONTENT } from '../data/mockData';
import { SearchIcon, CloseIcon, PlayIcon } from '../components/Icons';

interface SearchPageProps {
  onOpenShort: (item: ContentItem) => void;
  onOpenLong: (item: ContentItem) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onOpenShort, onOpenLong }) => {
  const [q, setQ] = useState('');

  const { shorts, longs } = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) {
      return {
        shorts: SHORT_CONTENT.slice(0, 6),
        longs: LONG_CONTENT.slice(0, 4),
      };
    }
    const match = (c: ContentItem) =>
      c.title.toLowerCase().includes(needle) ||
      c.author.toLowerCase().includes(needle) ||
      c.genre.toLowerCase().includes(needle);
    return {
      shorts: SHORT_CONTENT.filter(match),
      longs: LONG_CONTENT.filter(match),
    };
  }, [q]);

  const total = shorts.length + longs.length;

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
        {!q && (
          <p
            style={{
              margin: '4px 4px 8px',
              fontSize: 12,
              color: 'var(--bs-text-dim)',
              letterSpacing: 0.3,
            }}
          >
            Suggested for you
          </p>
        )}

        {total === 0 ? (
          <div className="bs-no-results">No matches for “{q}”.</div>
        ) : (
          <>
            {shorts.length > 0 && (
              <>
                <h3 className="bs-section-title">Shorts · {shorts.length}</h3>
                <div className="bs-grid-shorts" style={{ padding: 0 }}>
                  {shorts.map((item) => (
                    <button
                      key={item.id}
                      className="bs-poster-9x16"
                      onClick={() => onOpenShort(item)}
                      aria-label={`Open ${item.title}`}
                    >
                      <img className="bs-poster__img" src={item.posterUrl} alt={item.title} />
                      <span className="bs-poster__badge">{item.durationLabel}</span>
                      <div className="bs-poster__overlay">
                        <h3 className="bs-poster__title">{item.title}</h3>
                        <div className="bs-poster__meta">{item.author}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {longs.length > 0 && (
              <>
                <h3 className="bs-section-title">Long Format · {longs.length}</h3>
                <div className="bs-list-long" style={{ padding: 0 }}>
                  {longs.map((item) => (
                    <article key={item.id} className="bs-poster-16x9">
                      <button
                        className="bs-poster-16x9__media"
                        onClick={() => onOpenLong(item)}
                        style={{
                          border: 0,
                          padding: 0,
                          background: 'transparent',
                          cursor: 'pointer',
                        }}
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
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
