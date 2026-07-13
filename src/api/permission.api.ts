import { delay } from '@/utils/mock-api';
import type { PermissionKey } from '@/types/permission.types';
import type { ContainerAccessScope, Role } from '@/types/domain.types';
import { getMemberPermissions as getMemberPermissionsRecord, updateMemberPermissions as updateMemberPermissionsRecord } from '@/mocks/demo-db';

export interface MemberPermissionsResponse {
  primaryRole: Role;
  effective: PermissionKey[];
  overrides: Record<string, boolean>;
  containerAccessScope: ContainerAccessScope | null;
}

export async function getMemberPermissions(memberId: string): Promise<MemberPermissionsResponse> {
  const member = getMemberPermissionsRecord(memberId);
  return delay(member as MemberPermissionsResponse);
}

export async function updateMemberPermissions(
  memberId: string,
  overrides: Record<string, boolean>,
  containerAccessScope?: ContainerAccessScope | null,
): Promise<MemberPermissionsResponse> {
  return delay(updateMemberPermissionsRecord(memberId, overrides, containerAccessScope) as MemberPermissionsResponse);
}
