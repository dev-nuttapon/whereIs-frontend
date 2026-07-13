import { client } from '@/api/client';
import type { Location } from '@/types/domain.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

interface LocationDto {
  id: string;
  workspaceId: string;
  siteId: string;
  parentLocationId: string | null;
  name: string;
  type: string | null;
  code: string | null;
  sortOrder: number;
  description: string | null;
  childCount: number;
  createdAt: string;
}

function toLocation(dto: LocationDto): Location {
  return {
    id: dto.id,
    workspaceId: dto.workspaceId,
    siteId: dto.siteId,
    parentLocationId: dto.parentLocationId ?? null,
    name: dto.name,
    type: dto.type ?? undefined,
    code: dto.code ?? undefined,
    sortOrder: dto.sortOrder,
    description: dto.description ?? undefined,
    childCount: dto.childCount,
    createdAt: dto.createdAt,
  };
}

export async function listLocations(wsId: string, siteId: string): Promise<Location[]> {
  const response = await client.get<ApiResponse<PagedResult<LocationDto>>>(`/workspaces/${encodeURIComponent(wsId)}/locations`, {
    params: { siteId, page: 1, pageSize: 100 },
  });
  return response.data.data.items.map(toLocation);
}
