// =====================================================================
// API DTOs — TypeScript mirrors of the .NET records in
// api/BookSee.Api/DTOs/Dtos.cs. Keep in sync if you add fields.
// =====================================================================

export type ContentFormat = 'short' | 'long';

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LanguageDto {
  code: string;
  name: string;
  nativeName: string;
}

export interface GenreDto {
  id: number;
  slug: string;
  name: string;
  sortOrder: number;
}

export interface AuthorDto {
  id: number;
  name: string;
  slug: string;
  avatarUrl?: string;
}

export interface ContentSummaryDto {
  id: number;
  slug: string;
  title: string;
  format: ContentFormat;
  genre: string;
  author: string;
  posterUrl: string;
  durationLabel: string;
  rating: number;
  views: number;
  /** Optional trailer URL used for muted-preview autoplay on listings. */
  trailerUrl?: string | null;
}

export interface SubscribeBody {
  planCode: string;
}

export interface EpisodeDto {
  id: number;
  episodeNumber: number;
  title?: string;
  durationSeconds: number;
  posterUrl?: string;
  /** Optional direct media URL (MP4/HLS). Not yet returned by the API — wire it via content_assets when CDN URLs are ready. */
  videoUrl?: string;
}

export interface ContentDetailDto {
  id: number;
  slug: string;
  title: string;
  description?: string;
  format: ContentFormat;
  genre: string;
  language: string;
  author: string;
  posterUrl: string;
  backdropUrl?: string;
  trailerUrl?: string;
  durationSeconds: number;
  durationLabel: string;
  ageRating?: string;
  isMature: boolean;
  avgRating: number;
  ratingCount: number;
  viewCount: number;
  episodes: EpisodeDto[];
  tags: string[];
}

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  countryCode?: string;
  timezone?: string;
  status: string;
  lastLoginAt?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  avatarUrl?: string;
  countryCode?: string;
  timezone?: string;
}

export interface UserPreferenceDto {
  defaultLanguage: string;
  defaultGenreId?: number | null;
  subtitleLanguage?: string | null;
  autoplayNext: boolean;
  dataSaver: boolean;
  downloadQuality: 'low' | 'medium' | 'high';
  pushNotifications: boolean;
  emailNotifications: boolean;
  matureContent: boolean;
}

export interface SubscriptionDto {
  id: number;
  planCode: string;
  planName: string;
  priceCents: number;
  currency: string;
  billingPeriod: string;
  status: string;
  startedAt: string;
  expiresAt: string;
  autoRenew: boolean;
}

export interface PlaybackProgressDto {
  contentId: number;
  contentTitle: string;
  contentPosterUrl: string;
  format: ContentFormat;
  episodeId?: number | null;
  episodeNumber?: number | null;
  positionSeconds: number;
  durationSeconds: number;
  percentComplete: number;
  isCompleted: boolean;
  lastPlayedAt: string;
}

export interface UpsertPlaybackProgressDto {
  contentId: number;
  episodeId?: number | null;
  positionSeconds: number;
  durationSeconds: number;
  isCompleted?: boolean | null;
  lastPlayedLanguage?: string | null;
  deviceId?: number | null;
}

export interface CreateWatchEventDto {
  contentId: number;
  episodeId?: number | null;
  deviceId?: number | null;
  startedAt: string;
  endedAt?: string | null;
  secondsWatched: number;
  startPosition: number;
  endPosition?: number | null;
  languageCode?: string | null;
  completed: boolean;
  exitReason?: string | null;
  networkType?: string | null;
}

export interface SearchResultDto {
  shorts: ContentSummaryDto[];
  long: ContentSummaryDto[];
}

export interface RecommendationItemDto {
  contentId: number;
  title: string;
  posterUrl: string;
  format: ContentFormat;
  genre: string;
  rank: number;
  reason?: string;
}

export interface RecommendationShelfDto {
  shelf: string;
  items: RecommendationItemDto[];
}
