import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MiniPlayer from './components/MiniPlayer';
import OfflineIndicator from './components/OfflineIndicator';
import PwaUpdatePrompt from './components/PwaUpdatePrompt';
import ShortsPage from './pages/ShortsPage';
import LongFormatPage from './pages/LongFormatPage';
import SearchPage from './pages/SearchPage';
import LanguagePopup from './pages/LanguagePopup';
import ProfilePage from './pages/ProfilePage';
import SubscriptionPage from './pages/SubscriptionPage';
import ShortsPlayer from './players/ShortsPlayer';
import LongFormatPlayer from './players/LongFormatPlayer';
import { CURRENT_USER_ID, getPreferences, upsertPreferences } from './api';
import { registerServiceWorker } from './pwa/registerSW';
import { useNetworkStatus } from './pwa/useNetworkStatus';
import { usePlayer } from './contexts/PlayerContext';

/**
 * Title that shows in the header per route. SubscriptionPage owns its
 * own header so it's omitted here.
 */
const TITLES: { match: (path: string) => boolean; title: string }[] = [
  { match: (p) => p.startsWith('/shorts'),                title: 'Shorts' },
  { match: (p) => p.startsWith('/long'),                  title: 'Long Format' },
  { match: (p) => p.startsWith('/search'),                title: 'Search' },
  { match: (p) => p === '/profile' || p === '/profile/', title: 'Profile' },
];

function titleFor(pathname: string): string {
  return TITLES.find((t) => t.match(pathname))?.title ?? 'BookSee';
}

const App: React.FC = () => {
  const [languageOpen, setLanguageOpen] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState<string>('en');
  const [defaultGenreId, setDefaultGenreId] = useState<number | null>(null);
  const { online } = useNetworkStatus();
  const [updateApply, setUpdateApply] = useState<null | (() => Promise<void>)>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);

  useEffect(() => {
    registerServiceWorker({
      onUpdateAvailable: (apply) => setUpdateApply(() => apply),
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    getPreferences(CURRENT_USER_ID)
      .then((p) => {
        if (cancelled) return;
        setDefaultLanguage(p.defaultLanguage);
        setDefaultGenreId(p.defaultGenreId ?? null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLanguageSelect = useCallback(
    async (code: string) => {
      setDefaultLanguage(code);
      try {
        await upsertPreferences(CURRENT_USER_ID, {
          defaultLanguage: code,
          defaultGenreId,
          subtitleLanguage: null,
          autoplayNext: true,
          dataSaver: false,
          downloadQuality: 'high',
          pushNotifications: true,
          emailNotifications: true,
          matureContent: false,
        });
      } catch {
        /* swallow */
      }
    },
    [defaultGenreId]
  );

  // useLocation re-renders App when the route changes so the header
  // title stays in sync with the active route.
  const location = useLocation();

  return (
    <div className="bs-app">
      <OfflineIndicator online={online} />
      <Header title={titleFor(location.pathname)} />

      <Routes>
        <Route path="/" element={<Navigate to="/shorts" replace />} />
        <Route path="/shorts" element={<ShortsPage defaultGenreId={defaultGenreId} />} />
        <Route path="/shorts/:id" element={<ShortsPage defaultGenreId={defaultGenreId} />} />
        <Route path="/long" element={<LongFormatPage />} />
        <Route path="/long/:id" element={<LongFormatPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<ProfilePage onLogout={() => undefined} />} />
        <Route path="/profile/subscription" element={<SubscriptionPage />} />
        <Route path="*" element={<Navigate to="/shorts" replace />} />
      </Routes>

      <Footer onOpenLanguage={() => setLanguageOpen(true)} languageOpen={languageOpen} />

      <LanguagePopup
        open={languageOpen}
        selected={defaultLanguage}
        onClose={() => setLanguageOpen(false)}
        onSelect={handleLanguageSelect}
      />

      {/* Active player (long format with minimize, or full-screen shorts) */}
      <ActivePlayer />
      <MiniPlayer />

      {updateApply && !updateDismissed && (
        <PwaUpdatePrompt apply={updateApply} onDismiss={() => setUpdateDismissed(true)} />
      )}
    </div>
  );
};

/**
 * Picks the right player based on the active content's format. Rendered
 * unconditionally so the DOM stays mounted across minimize.
 */
const ActivePlayer: React.FC = () => {
  const { content } = usePlayer();
  if (!content) return null;
  if (content.format === 'short') return <ShortsPlayer />;
  return <LongFormatPlayer />;
};

export default App;
