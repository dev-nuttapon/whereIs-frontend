import { client } from '@/api/client';
import type { ItemEvent } from '@/types/domain.types';

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

export async function listActivity(wsId: string, params: ActivityParams = {}): Promise<PagedResult<ItemEvent>> {
  const response = await client.get<ApiResponse<PagedResult<ItemEvent>>>(`/workspaces/${encodeURIComponent(wsId)}/activity`, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });
  return response.data.data;
}
