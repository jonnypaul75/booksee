import React, { useEffect } from 'react';
import { getLanguages, LanguageDto } from '../api';
import { useAsync } from '../hooks/useAsync';
import { CheckIcon, CloseIcon } from '../components/Icons';

interface LanguagePopupProps {
  open: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (code: string) => void;
}

const LanguagePopup: React.FC<LanguagePopupProps> = ({ open, selected, onClose, onSelect }) => {
  // Fetch languages on first open. Cached across opens because deps=[].
  const { data: languages, loading, error } = useAsync<LanguageDto[]>(
    (signal) => getLanguages(signal),
    []
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="bs-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Choose language"
    >
      <div className="bs-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bs-modal__handle" />
        <div className="bs-row" style={{ marginBottom: 8 }}>
          <h2 className="bs-modal__title" style={{ flex: 1, textAlign: 'left' }}>
            Choose Language
          </h2>
          <button onClick={onClose} aria-label="Close" style={{ color: 'var(--bs-text-dim)' }}>
            <CloseIcon size={20} />
          </button>
        </div>
        <p
          style={{
            margin: '0 0 14px',
            fontSize: 12,
            color: 'var(--bs-text-dim)',
            letterSpacing: 0.3,
          }}
        >
          Choose your audio &amp; subtitle language. You can change this later from Profile → Preferences.
        </p>

        {error ? (
          <div className="bs-no-results">Couldn't load languages. {error.message}</div>
        ) : loading || !languages ? (
          <div className="bs-loader">Loading…</div>
        ) : (
          <ul className="bs-lang-list">
            {languages.map((lang) => {
              const active = lang.code === selected;
              return (
                <li key={lang.code}>
                  <button
                    className={`bs-lang-item ${active ? 'bs-lang-item--active' : ''}`}
                    onClick={() => {
                      onSelect(lang.code);
                      onClose();
                    }}
                    style={{ width: '100%' }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{lang.nativeName}</div>
                      <div style={{ fontSize: 11, color: 'var(--bs-text-dim)' }}>{lang.name}</div>
                    </div>
                    {active && <CheckIcon size={18} style={{ color: 'var(--bs-orange)' }} />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LanguagePopup;
