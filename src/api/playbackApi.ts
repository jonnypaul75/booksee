import { api } from './client';
import {
  CreateWatchEventDto,
  PlaybackProgressDto,
  UpsertPlaybackProgressDto,
} from './types';

// ---------- Playback progress (RESUME) ----------

/** GET /api/users/{userId}/playback-progress */
export async function listContinueWatching(
  userId: number,
  limit = 20,
  includeCompleted = false,
  signal?: AbortSignal
): Promise<PlaybackProgressDto[]> {
  const res = await api.get<PlaybackProgressDto[]>(
    `/api/users/${userId}/playback-progress`,
    { params: { limit, includeCompleted }, signal }
  );
  return res.data;
}

/** GET /api/users/{userId}/playback-progress/{contentId}?episodeId= */
export async function getProgress(
  userId: number,
  contentId: number,
  episodeId?: number | null,
  signal?: AbortSignal
): Promise<PlaybackProgressDto | null> {
  try {
    const res = await api.get<PlaybackProgressDto>(
      `/api/users/${userId}/playback-progress/${contentId}`,
      { params: episodeId != null ? { episodeId } : undefined, signal }
    );
    return res.data;
  } catch (e: any) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

/** PUT /api/users/{userId}/playback-progress — upsert (call every few seconds while playing) */
export async function upsertProgress(
  userId: number,
  body: UpsertPlaybackProgressDto
): Promise<PlaybackProgressDto> {
  const res = await api.put<PlaybackProgressDto>(
    `/api/users/${userId}/playback-progress`,
    body
  );
  return res.data;
}

/** DELETE /api/users/{userId}/playback-progress/{contentId}?episodeId= */
export async function deleteProgress(
  userId: number,
  contentId: number,
  episodeId?: number | null
): Promise<void> {
  await api.delete(`/api/users/${userId}/playback-progress/${contentId}`, {
    params: episodeId != null ? { episodeId } : undefined,
  });
}

// ---------- Watch events ----------

/** POST /api/users/{userId}/watch-events */
export async function createWatchEvent(
  userId: number,
  body: CreateWatchEventDto
): Promise<number> {
  const res = await api.post<number>(`/api/users/${userId}/watch-events`, body);
  return res.data;
}
