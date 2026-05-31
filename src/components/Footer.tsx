import React from 'react';
import { TabId } from '../types';
import {
  ShortsIcon,
  LongFormatIcon,
  SearchIcon,
  LanguageIcon,
  ProfileIcon,
} from './Icons';

interface FooterProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

interface TabDef {
  id: TabId;
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>;
}

const TABS: TabDef[] = [
  { id: 'shorts', label: 'Shorts', Icon: ShortsIcon },
  { id: 'long', label: 'Long', Icon: LongFormatIcon },
  { id: 'search', label: 'Search', Icon: SearchIcon },
  { id: 'language', label: 'Language', Icon: LanguageIcon },
  { id: 'profile', label: 'Profile', Icon: ProfileIcon },
];

const Footer: React.FC<FooterProps> = ({ active, onChange }) => {
  return (
    <nav className="bs-footer" aria-label="Bottom navigation">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            className={`bs-footer__btn ${isActive ? 'bs-footer__btn--active' : ''}`}
            onClick={() => onChange(id)}
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
