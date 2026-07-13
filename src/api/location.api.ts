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

interface LocationTreeNodeDto {
  id: string;
  name: string;
  type: string | null;
  code: string | null;
  sortOrder: number;
  children: LocationTreeNodeDto[];
}

export interface LocationTreeNode {
  id: string;
  name: string;
  type?: string | null;
  code?: string | null;
  sortOrder: number;
  children: LocationTreeNode[];
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

function toLocationTreeNode(dto: LocationTreeNodeDto): LocationTreeNode {
  return {
    id: dto.id,
    name: dto.name,
    type: dto.type,
    code: dto.code,
    sortOrder: dto.sortOrder,
    children: dto.children.map((child) => toLocationTreeNode(child)),
  };
}

export async function listLocations(wsId: string, siteId: string): Promise<Location[]> {
  const response = await client.get<ApiResponse<PagedResult<LocationDto>>>(`/workspaces/${encodeURIComponent(wsId)}/locations`, {
    params: { siteId, page: 1, pageSize: 100 },
  });
  return response.data.data.items.map(toLocation);
}

export async function getLocation(wsId: string, locationId: string): Promise<Location> {
  const response = await client.get<ApiResponse<LocationDto>>(`/workspaces/${encodeURIComponent(wsId)}/locations/${encodeURIComponent(locationId)}`);
  return toLocation(response.data.data);
}

export async function getLocationTree(wsId: string, siteId: string): Promise<LocationTreeNode[]> {
  const response = await client.get<ApiResponse<LocationTreeNodeDto[]>>(
    `/workspaces/${encodeURIComponent(wsId)}/sites/${encodeURIComponent(siteId)}/locations/tree`,
  );
  return response.data.data.map((node) => toLocationTreeNode(node));
}
