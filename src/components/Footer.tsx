import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TabId } from '../types';
import {
  ShortsIcon,
  LongFormatIcon,
  SearchIcon,
  LanguageIcon,
  ProfileIcon,
} from './Icons';

interface FooterProps {
  /** Opens the language modal — handled by App, not a real route. */
  onOpenLanguage: () => void;
  /** True while the language modal is open (highlights the chip). */
  languageOpen: boolean;
}

interface TabDef {
  id: TabId;
  label: string;
  path: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>;
}

const TABS: TabDef[] = [
  { id: 'shorts',   label: 'Shorts',   path: '/shorts',  Icon: ShortsIcon },
  { id: 'long',     label: 'Long',     path: '/long',    Icon: LongFormatIcon },
  { id: 'search',   label: 'Search',   path: '/search',  Icon: SearchIcon },
  { id: 'language', label: 'Language', path: '',         Icon: LanguageIcon },
  { id: 'profile',  label: 'Profile',  path: '/profile', Icon: ProfileIcon },
];

const Footer: React.FC<FooterProps> = ({ onOpenLanguage, languageOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeId: TabId | null = languageOpen
    ? 'language'
    : location.pathname.startsWith('/shorts')
      ? 'shorts'
      : location.pathname.startsWith('/long')
        ? 'long'
        : location.pathname.startsWith('/search')
          ? 'search'
          : location.pathname.startsWith('/profile')
            ? 'profile'
            : null;

  return (
    <nav className="bs-footer" aria-label="Bottom navigation">
      {TABS.map(({ id, label, path, Icon }) => {
        const isActive = activeId === id;
        return (
          <button
            key={id}
            className={`bs-footer__btn ${isActive ? 'bs-footer__btn--active' : ''}`}
            onClick={() => {
              if (id === 'language') onOpenLanguage();
              else navigate(path);
            }}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={22} className="bs-footer__icon" />
            <span className="bs-footer__label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Footer;
