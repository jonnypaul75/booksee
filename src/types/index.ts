export type ContentFormat = 'short' | 'long';

export type Genre =
  | 'All'
  | 'Thriller'
  | 'Romance'
  | 'Mystery'
  | 'Fantasy'
  | 'Self-Help'
  | 'Biography'
  | 'Sci-Fi'
  | 'Horror'
  | 'Comedy';

export interface Episode {
  id: string;
  title: string;
  duration: number; // seconds
  videoUrl?: string;
  posterUrl: string;
}

export interface ContentItem {
  id: string;
  title: string;
  author: string;
  genre: Genre;
  format: ContentFormat;
  posterUrl: string;
  videoUrl?: string;
  durationLabel: string;
  description?: string;
  rating?: number;
  views?: string;
  episodes?: Episode[];
}

export type TabId = 'shorts' | 'long' | 'search' | 'language' | 'profile';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarLetter: string;
  defaultLanguage: string;
  defaultGenre: Genre;
  subscription: {
    plan: string;
    renewsOn: string;
  };
}
