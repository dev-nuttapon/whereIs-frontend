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

export interface CreateSiteInput {
  name: string;
  type?: string | null;
  address?: string | null;
  description?: string | null;
}

export interface UpdateSiteInput {
  name?: string | null;
  type?: string | null;
  address?: string | null;
  description?: string | null;
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

export async function getSite(wsId: string, siteId: string): Promise<Site> {
  const response = await client.get<ApiResponse<SiteDto>>(`/workspaces/${encodeURIComponent(wsId)}/sites/${encodeURIComponent(siteId)}`);
  return toSite(response.data.data);
}

export async function createSite(wsId: string, input: CreateSiteInput): Promise<Site> {
  const response = await client.post<ApiResponse<SiteDto>>(`/workspaces/${encodeURIComponent(wsId)}/sites`, {
    name: input.name,
    type: input.type ?? null,
    address: input.address ?? null,
    description: input.description ?? null,
  });
  return toSite(response.data.data);
}

export async function updateSite(wsId: string, siteId: string, input: UpdateSiteInput): Promise<Site> {
  const response = await client.put<ApiResponse<SiteDto>>(`/workspaces/${encodeURIComponent(wsId)}/sites/${encodeURIComponent(siteId)}`, {
    name: input.name ?? null,
    type: input.type ?? null,
    address: input.address ?? null,
    description: input.description ?? null,
  });
  return toSite(response.data.data);
}

export async function deleteSite(wsId: string, siteId: string): Promise<{ success: true }> {
  await client.delete(`/workspaces/${encodeURIComponent(wsId)}/sites/${encodeURIComponent(siteId)}`);
  return { success: true };
}
