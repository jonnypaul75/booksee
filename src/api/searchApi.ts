import { api } from './client';
import { SearchResultDto } from './types';

/** GET /api/search?q=&userId=&limit= */
export async function search(
  q: string,
  userId?: number,
  limit = 12,
  signal?: AbortSignal
): Promise<SearchResultDto> {
  const res = await api.get<SearchResultDto>('/api/search', {
    params: { q, userId, limit },
    signal,
  });
  return res.data;
}
