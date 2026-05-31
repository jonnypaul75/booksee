import React from 'react';
import Logo from './Logo';
import { NotificationIcon } from './Icons';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  rightSlot?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, showLogo = true, rightSlot }) => {
  return (
    <header className="bs-header">
      {showLogo ? <Logo /> : <span className="bs-header__title">{title}</span>}
      {title && showLogo && (
        <span className="bs-header__title" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {title}
        </span>
      )}
      {rightSlot ?? (
        <button className="bs-header__action" aria-label="Notifications">
          <NotificationIcon size={20} />
        </button>
      )}
    </header>
  );
};

export default Header;
