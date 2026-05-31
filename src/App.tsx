import React, { useCallback, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ShortsPage from './pages/ShortsPage';
import LongFormatPage from './pages/LongFormatPage';
import SearchPage from './pages/SearchPage';
import LanguagePopup from './pages/LanguagePopup';
import ProfilePage from './pages/ProfilePage';
import ShortsPlayer from './players/ShortsPlayer';
import LongFormatPlayer from './players/LongFormatPlayer';
import { ContentItem, TabId, UserProfile } from './types';
import { DEFAULT_USER } from './data/mockData';

const TAB_TITLES: Record<TabId, string> = {
  shorts: 'Shorts',
  long: 'Long Format',
  search: 'Search',
  language: 'Language',
  profile: 'Profile',
};

const App: React.FC = () => {
  // Default selected tab = first footer item = Shorts
  const [tab, setTab] = useState<TabId>('shorts');
  const [languageOpen, setLanguageOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  const [activeShort, setActiveShort] = useState<ContentItem | null>(null);
  const [activeLong, setActiveLong] = useState<ContentItem | null>(null);

  const handleTabChange = useCallback((next: TabId) => {
    if (next === 'language') {
      // Language is a popup — keep current tab visible behind it
      setLanguageOpen(true);
      return;
    }
    setTab(next);
  }, []);

  const closeLanguage = () => setLanguageOpen(false);

  // Renders the body for whichever tab is active
  const renderTab = () => {
    switch (tab) {
      case 'shorts':
        return (
          <ShortsPage
            onOpenShort={setActiveShort}
            defaultGenre={user.defaultGenre}
          />
        );
      case 'long':
        return <LongFormatPage onOpenLong={setActiveLong} />;
      case 'search':
        return (
          <SearchPage
            onOpenShort={setActiveShort}
            onOpenLong={setActiveLong}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            user={user}
            onUpdateUser={setUser}
            onLogout={() => {
              // Logout placeholder — wire to real auth later
              setUser(DEFAULT_USER);
              setTab('shorts');
            }}
          />
        );
      default:
        return null;
    }
  };

  const headerTitle = TAB_TITLES[tab];

  return (
    <div className="bs-app">
      {/* Header is fixed */}
      <Header title={headerTitle} />

      {/* Tab content */}
      {renderTab()}

      {/* Footer is fixed */}
      <Footer
        active={languageOpen ? 'language' : tab}
        onChange={handleTabChange}
      />

      {/* Language popup */}
      <LanguagePopup
        open={languageOpen}
        selected={user.defaultLanguage}
        onClose={closeLanguage}
        onSelect={(code) => setUser((u) => ({ ...u, defaultLanguage: code }))}
      />

      {/* Full-screen players */}
      {activeShort && (
        <ShortsPlayer
          initial={activeShort}
          onClose={() => setActiveShort(null)}
        />
      )}
      {activeLong && (
        <LongFormatPlayer
          initial={activeLong}
          onClose={() => setActiveLong(null)}
          onSelect={(item) => setActiveLong(item)}
        />
      )}
    </div>
  );
};

export default App;
