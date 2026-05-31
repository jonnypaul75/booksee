import { ContentItem, Genre, Language, UserProfile } from '../types';

const GENRES: Genre[] = [
  'Thriller',
  'Romance',
  'Mystery',
  'Fantasy',
  'Self-Help',
  'Biography',
  'Sci-Fi',
  'Horror',
  'Comedy',
];

export const GENRE_FILTERS: Genre[] = ['All', ...GENRES];

const AUTHORS = [
  'Aarav Mehta',
  'Riya Kapoor',
  'Daniel Voss',
  'Naomi Chen',
  'Sahil Bose',
  'Eva Rinaldi',
  'Marcus Hale',
  'Priya Iyer',
  'Leo Kovacs',
  'Anaya Singh',
];

const SHORT_TITLES = [
  'Whisper of the Pines',
  'Midnight Pages',
  'Echoes Below',
  'Silver Tides',
  'Paper Lanterns',
  'The Glass Garden',
  'Last Train Home',
  'Sunset Letters',
  'The Quiet Hours',
  'Crimson Notes',
  'Velvet Code',
  'Moonlight Drift',
  'Inkfall',
  'A Borrowed Heart',
  'Salt and Storm',
  'The Eleventh Hour',
  'Wildflower Static',
  'Half a Sky',
  'Hush, Little Engine',
  'Two Streets Over',
  'Neon Monks',
  'The Sunday Spell',
  'After the Bell',
  'Postcards from Nowhere',
];

const LONG_TITLES = [
  'Atlas of Forgotten Cities',
  'The Architect of Echoes',
  'Quantum Bloom',
  'Letters to a Future Self',
  'The Long Year',
  'House of Hollow Lights',
  'Calmer Than the River',
  'Iron and Honey',
  'A Map for Wanderers',
  'The Cartographer’s Daughter',
  'Threads of the North Wind',
  'Of Silence and Salt',
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function buildShort(i: number): ContentItem {
  const id = `s-${i + 1}`;
  return {
    id,
    title: SHORT_TITLES[i % SHORT_TITLES.length] + (i >= SHORT_TITLES.length ? ` v${Math.floor(i / SHORT_TITLES.length) + 1}` : ''),
    author: pick(AUTHORS, i),
    genre: pick(GENRES, i),
    format: 'short',
    posterUrl: `https://picsum.photos/seed/${id}/450/800`,
    durationLabel: `${1 + (i % 6)}m`,
    rating: 3.5 + ((i * 7) % 16) / 10,
    views: `${10 + (i * 13) % 980}K`,
    episodes: Array.from({ length: 3 + (i % 4) }).map((_, k) => ({
      id: `${id}-e${k + 1}`,
      title: `Episode ${k + 1}`,
      duration: 45 + (k * 8) % 30,
      posterUrl: `https://picsum.photos/seed/${id}-e${k + 1}/450/800`,
    })),
  };
}

function buildLong(i: number): ContentItem {
  const id = `l-${i + 1}`;
  return {
    id,
    title: LONG_TITLES[i % LONG_TITLES.length] + (i >= LONG_TITLES.length ? ` Vol. ${Math.floor(i / LONG_TITLES.length) + 1}` : ''),
    author: pick(AUTHORS, i + 3),
    genre: pick(GENRES, i + 2),
    format: 'long',
    posterUrl: `https://picsum.photos/seed/${id}/640/360`,
    durationLabel: `${1 + (i % 6)}h ${10 + (i * 7) % 50}m`,
    description:
      'An immersive narrative produced by BookSee Originals. Settle in for a story that unfolds across worlds, told through layered voice performances and cinematic sound design.',
    rating: 4.0 + ((i * 5) % 10) / 10,
    views: `${100 + (i * 17) % 900}K`,
  };
}

export const SHORT_CONTENT: ContentItem[] = Array.from({ length: 48 }, (_, i) =>
  buildShort(i)
);

export const LONG_CONTENT: ContentItem[] = Array.from({ length: 18 }, (_, i) =>
  buildLong(i)
);

export const ALL_CONTENT: ContentItem[] = [...SHORT_CONTENT, ...LONG_CONTENT];

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
];

export const DEFAULT_USER: UserProfile = {
  name: 'Manoj Chatterjee',
  email: 'manoj.chatterjee@gmail.com',
  avatarLetter: 'M',
  defaultLanguage: 'en',
  defaultGenre: 'Thriller',
  subscription: {
    plan: 'Premium Annual',
    renewsOn: 'Mar 14, 2027',
  },
};

export const APP_VERSION = '1.0.0 (build 100)';
