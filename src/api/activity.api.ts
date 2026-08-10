import { client } from '@/api/client';
export interface ActivityFeedItem {
  id: string;
  workspaceId: string;
  sourceType: string;
  sourceId: string;
  eventType: string;
  actor: { id: string; name: string };
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface ActivityParams {
  page?: number;
  limit?: number;
}

export async function listActivity(wsId: string, params: ActivityParams = {}): Promise<PagedResult<ActivityFeedItem>> {
  const response = await client.get<ApiResponse<PagedResult<ActivityFeedItem>>>(`/workspaces/${encodeURIComponent(wsId)}/activity`, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });
  return response.data.data;
}
