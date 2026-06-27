import { api } from './client';
import { RecommendationShelfDto } from './types';

/** GET /api/users/{userId}/recommendations */
export async function getRecommendations(
  userId: number,
  signal?: AbortSignal
): Promise<RecommendationShelfDto[]> {
  const res = await api.get<RecommendationShelfDto[]>(
    `/api/users/${userId}/recommendations`,
    { signal }
  );
  return res.data;
}
