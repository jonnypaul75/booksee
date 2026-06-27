import { api } from './client';
import {
  GenreDto,
  LanguageDto,
  SubscribeBody,
  SubscriptionDto,
  UpdateUserDto,
  UserDto,
  UserPreferenceDto,
} from './types';

// ---------- Reference data ----------

/** GET /api/languages */
export async function getLanguages(signal?: AbortSignal): Promise<LanguageDto[]> {
  const res = await api.get<LanguageDto[]>('/api/languages', { signal });
  return res.data;
}

/** GET /api/genres */
export async function getGenres(signal?: AbortSignal): Promise<GenreDto[]> {
  const res = await api.get<GenreDto[]>('/api/genres', { signal });
  return res.data;
}

// ---------- User ----------

/** GET /api/users/{id} */
export async function getUser(id: number, signal?: AbortSignal): Promise<UserDto> {
  const res = await api.get<UserDto>(`/api/users/${id}`, { signal });
  return res.data;
}

/** PUT /api/users/{id} */
export async function updateUser(id: number, body: UpdateUserDto): Promise<UserDto> {
  const res = await api.put<UserDto>(`/api/users/${id}`, body);
  return res.data;
}

/** GET /api/users/{id}/preferences */
export async function getPreferences(id: number, signal?: AbortSignal): Promise<UserPreferenceDto> {
  const res = await api.get<UserPreferenceDto>(`/api/users/${id}/preferences`, { signal });
  return res.data;
}

/** PUT /api/users/{id}/preferences */
export async function upsertPreferences(
  id: number,
  body: UserPreferenceDto
): Promise<UserPreferenceDto> {
  const res = await api.put<UserPreferenceDto>(`/api/users/${id}/preferences`, body);
  return res.data;
}

/** GET /api/users/{id}/subscription */
export async function getActiveSubscription(
  id: number,
  signal?: AbortSignal
): Promise<SubscriptionDto | null> {
  try {
    const res = await api.get<SubscriptionDto>(`/api/users/${id}/subscription`, { signal });
    return res.data;
  } catch (e: any) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

/** POST /api/users/{id}/subscribe — subscribe to a plan by code. */
export async function subscribe(id: number, body: SubscribeBody): Promise<SubscriptionDto> {
  const res = await api.post<SubscriptionDto>(`/api/users/${id}/subscribe`, body);
  return res.data;
}
