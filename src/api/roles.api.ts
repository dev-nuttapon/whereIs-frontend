import { client } from '@/api/client';
import type { WorkspaceRole } from '@/types/domain.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

interface RoleDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
}

export interface CreateRoleInput {
  code: string;
  name: string;
  description?: string | null;
}

export interface UpdateRoleInput {
  name?: string | null;
  description?: string | null;
}

export interface SetRolePermissionsInput {
  permissionIds: string[];
}

function toRole(dto: RoleDto): WorkspaceRole {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    description: dto.description ?? undefined,
    isSystem: dto.isSystem,
    permissions: dto.permissions,
  };
}

export async function listRoles(wsId: string, page = 1, pageSize = 100): Promise<PagedResult<WorkspaceRole>> {
  const response = await client.get<ApiResponse<PagedResult<RoleDto>>>(`/workspaces/${encodeURIComponent(wsId)}/roles`, {
    params: { page, pageSize },
  });
  return {
    ...response.data.data,
    items: response.data.data.items.map(toRole),
  };
}

export async function getRole(wsId: string, roleId: string): Promise<WorkspaceRole> {
  const response = await client.get<ApiResponse<RoleDto>>(`/workspaces/${encodeURIComponent(wsId)}/roles/${encodeURIComponent(roleId)}`);
  return toRole(response.data.data);
}

export async function createRole(wsId: string, input: CreateRoleInput): Promise<WorkspaceRole> {
  const response = await client.post<ApiResponse<RoleDto>>(`/workspaces/${encodeURIComponent(wsId)}/roles`, {
    code: input.code,
    name: input.name,
    description: input.description ?? null,
  });
  return toRole(response.data.data);
}

export async function updateRole(wsId: string, roleId: string, input: UpdateRoleInput): Promise<WorkspaceRole> {
  const response = await client.put<ApiResponse<RoleDto>>(`/workspaces/${encodeURIComponent(wsId)}/roles/${encodeURIComponent(roleId)}`, {
    name: input.name ?? null,
    description: input.description ?? null,
  });
  return toRole(response.data.data);
}

export async function setRolePermissions(
  wsId: string,
  roleId: string,
  input: SetRolePermissionsInput,
): Promise<WorkspaceRole> {
  const response = await client.put<ApiResponse<RoleDto>>(`/workspaces/${encodeURIComponent(wsId)}/roles/${encodeURIComponent(roleId)}/permissions`, {
    permissionIds: input.permissionIds,
  });
  return toRole(response.data.data);
}

export async function deleteRole(wsId: string, roleId: string): Promise<{ success: true }> {
  await client.delete(`/workspaces/${encodeURIComponent(wsId)}/roles/${encodeURIComponent(roleId)}`);
  return { success: true };
}
