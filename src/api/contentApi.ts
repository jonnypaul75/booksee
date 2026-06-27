import { api } from './client';
import {
  ContentDetailDto,
  ContentSummaryDto,
  EpisodeDto,
  PagedResult,
  ContentFormat,
} from './types';

export interface ListContentParams {
  format?: ContentFormat;
  genre?: string;        // genre slug (e.g. 'thriller')
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}

/** GET /api/content?format=&genre=&page=&pageSize= */
export async function listContent(
  params: ListContentParams = {}
): Promise<PagedResult<ContentSummaryDto>> {
  const { signal, ...query } = params;
  const res = await api.get<PagedResult<ContentSummaryDto>>('/api/content', {
    params: query,
    signal,
  });
  return res.data;
}

/** GET /api/content/{id} */
export async function getContent(id: number, signal?: AbortSignal): Promise<ContentDetailDto> {
  const res = await api.get<ContentDetailDto>(`/api/content/${id}`, { signal });
  return res.data;
}

/** GET /api/content/{id}/episodes */
export async function getEpisodes(id: number, signal?: AbortSignal): Promise<EpisodeDto[]> {
  const res = await api.get<EpisodeDto[]>(`/api/content/${id}/episodes`, { signal });
  return res.data;
}
