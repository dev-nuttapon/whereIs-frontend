import { client } from '@/api/client';
import type { Workspace } from '@/types/domain.types';

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

interface WorkspaceDto {
  id: string;
  name: string;
  slug: string;
  type: string;
  ownerUserId: string;
  isActive: boolean;
  myRoleCode: string;
  createdAt: string;
}

export interface CreateWorkspaceInput {
  name: string;
}

function toWorkspace(dto: WorkspaceDto): Workspace {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    type: dto.type,
    ownerUserId: dto.ownerUserId,
    isActive: dto.isActive,
    description: undefined,
    myRole: dto.myRoleCode as Workspace['myRole'],
    permissions: [],
    containerAccessScope: null,
    createdAt: dto.createdAt,
    updatedAt: dto.createdAt,
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'workspace';
}

export async function listWorkspaces(): Promise<Workspace[]> {
  const response = await client.get<ApiResponse<PagedResult<WorkspaceDto>>>('/workspaces', {
    params: { page: 1, pageSize: 100 },
  });
  return response.data.data.items.map(toWorkspace);
}

export async function getWorkspace(id: string): Promise<Workspace | undefined> {
  const response = await client.get<ApiResponse<WorkspaceDto>>(`/workspaces/${encodeURIComponent(id)}`);
  return response.data.data ? toWorkspace(response.data.data) : undefined;
}

export async function createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
  const response = await client.post<ApiResponse<WorkspaceDto>>('/workspaces', {
    name: input.name,
    slug: slugify(input.name),
    type: 'Warehouse',
  });
  return toWorkspace(response.data.data);
}
