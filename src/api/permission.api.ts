import { client } from '@/api/client';
import type { PermissionKey } from '@/types/permission.types';
import type { ContainerAccessScope, Role } from '@/types/domain.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface MemberPermissionsResponse {
  primaryRole: Role;
  effective: PermissionKey[];
  overrides: Record<string, boolean>;
  containerAccessScope: ContainerAccessScope | null;
}

interface PermissionCatalogDto {
  id: string;
  code: string;
  name: string;
  category: string;
}

export interface PermissionCatalogItem {
  id: string;
  code: string;
  name: string;
  category: string;
}

interface MemberPermissionsDto {
  roleCode: string;
  effective: string[];
  overrides: Array<{ code: string; effect: string }>;
  containerAccessScope: ContainerAccessScope | null;
}

export async function getPermissionCatalog(): Promise<PermissionCatalogItem[]> {
  const response = await client.get<ApiResponse<{ items: PermissionCatalogDto[] }>>('/permissions', {
    params: { page: 1, pageSize: 200 },
  });
  return response.data.data.items;
}

export async function getMemberPermissions(wsId: string, memberId: string): Promise<MemberPermissionsResponse> {
  const response = await client.get<ApiResponse<MemberPermissionsDto>>(
    `/workspaces/${encodeURIComponent(wsId)}/members/${encodeURIComponent(memberId)}/permissions`,
  );
  const dto = response.data.data;
  const overrides = Object.fromEntries(
    dto.overrides.map((item) => [item.code, item.effect.toLowerCase() === 'allow']),
  ) as Record<string, boolean>;
  return {
    primaryRole: dto.roleCode as Role,
    effective: dto.effective as PermissionKey[],
    overrides,
    containerAccessScope: dto.containerAccessScope,
  };
}

export async function updateMemberPermissions(
  wsId: string,
  memberId: string,
  overrides: Record<string, boolean>,
  containerAccessScope?: ContainerAccessScope | null,
): Promise<MemberPermissionsResponse> {
  const permissions = await getPermissionCatalog();
  const payload = {
    overrides: Object.entries(overrides).flatMap(([code, enabled]) => {
      const permission = permissions.find((item) => item.code === code);
      if (!permission) {
        return [];
      }

      return [
        {
          permissionId: permission.id,
          effect: enabled ? 'Allow' : 'Deny',
        },
      ];
    }),
    containerAccessScope,
  };

  const response = await client.put<ApiResponse<MemberPermissionsDto>>(
    `/workspaces/${encodeURIComponent(wsId)}/members/${encodeURIComponent(memberId)}/permissions`,
    payload,
  );
  const dto = response.data.data;
  const nextOverrides = Object.fromEntries(
    dto.overrides.map((item) => [item.code, item.effect.toLowerCase() === 'allow']),
  ) as Record<string, boolean>;

  return {
    primaryRole: dto.roleCode as Role,
    effective: dto.effective as PermissionKey[],
    overrides: nextOverrides,
    containerAccessScope: dto.containerAccessScope,
  };
}
