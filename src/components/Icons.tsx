import React from 'react';

/**
 * Outline-style icon set used across BookSee.App.
 * All icons share a consistent 24x24 viewBox with 1.6 stroke width
 * to keep the visual rhythm calm and the look "outline".
 */

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

const base = (size = 24): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

export const ShortsIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <rect x="6" y="3" width="12" height="18" rx="3" />
    <path d="M10.5 9.2v5.6l4.5-2.8-4.5-2.8Z" />
  </svg>
);

export const LongFormatIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="3" />
    <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m20 20-4.5-4.5" />
  </svg>
);

export const LanguageIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.6 3 3.8 6 3.8 9s-1.2 6-3.8 9c-2.6-3-3.8-6-3.8-9s1.2-6 3.8-9Z" />
  </svg>
);

export const ProfileIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <circle cx="12" cy="8.5" r="4" />
    <path d="M4.5 20c1.4-3.5 4.4-5.5 7.5-5.5s6.1 2 7.5 5.5" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="M7 5v14l12-7L7 5Z" />
  </svg>
);

export const PauseIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <rect x="7" y="5" width="4" height="14" rx="1" />
    <rect x="13" y="5" width="4" height="14" rx="1" />
  </svg>
);

export const HeartIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 20s-7-4.5-9-9.2C1.7 7 4 4 7 4c1.9 0 3.4 1.1 4.1 2.5h1.7C13.6 5.1 15.1 4 17 4c3 0 5.3 3 4 6.8-2 4.7-9 9.2-9 9.2Z" />
  </svg>
);

export const ShareIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="m8.2 11 7.6-4M8.2 13l7.6 4" />
  </svg>
);

export const CommentIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="M5 5h14v10H9l-4 4V5Z" />
  </svg>
);

export const BookmarkIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="M7 4h10v17l-5-3-5 3V4Z" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
);

export const NotificationIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="M6 17h12l-1.5-2v-4a4.5 4.5 0 0 0-9 0v4L6 17Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);

export const UserIcon = ProfileIcon;

export const CreditCardIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="M3 10h18M7 15h3" />
  </svg>
);

export const SlidersIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="M5 6h14M5 12h14M5 18h14" />
    <circle cx="9" cy="6" r="2" />
    <circle cx="15" cy="12" r="2" />
    <circle cx="8" cy="18" r="2" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6L12 3Z" />
  </svg>
);

export const FileTextIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="M7 3h7l4 4v14H7V3Z" />
    <path d="M14 3v4h4M9 12h7M9 16h7M9 8h3" />
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11" />
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6M12 7.5v.5" />
  </svg>
);

export const VolumeIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="M4 9.5h3.5L12 5v14L7.5 14.5H4v-5Z" />
    <path d="M15.5 9c1.5 1.5 1.5 4.5 0 6" />
  </svg>
);

export const FullscreenIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="m12 4 2.6 5.4 5.9.6-4.4 4.1 1.2 5.9L12 17l-5.3 3 1.2-5.9L3.5 10l5.9-.6L12 4Z" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...base(size)} {...rest}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
