import { client } from '@/api/client';
import type { Site } from '@/types/domain.types';

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

interface SiteDto {
  id: string;
  workspaceId: string;
  name: string;
  type: string | null;
  address: string | null;
  description: string | null;
  isActive: boolean;
  locationCount: number;
  createdAt: string;
}

function toSite(dto: SiteDto): Site {
  return {
    id: dto.id,
    workspaceId: dto.workspaceId,
    name: dto.name,
    type: dto.type ?? undefined,
    address: dto.address ?? undefined,
    description: dto.description ?? undefined,
    isActive: dto.isActive,
    locationCount: dto.locationCount,
    createdAt: dto.createdAt,
  };
}

export async function listSites(wsId: string): Promise<Site[]> {
  const response = await client.get<ApiResponse<PagedResult<SiteDto>>>(`/workspaces/${encodeURIComponent(wsId)}/sites`, {
    params: { page: 1, pageSize: 100 },
  });
  return response.data.data.items.map(toSite);
}
