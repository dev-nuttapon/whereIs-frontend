import { workspaceStore } from '@/stores/workspace.store';
import type { PermissionKey } from '@/types/permission.types';

export function usePermission() {
  const permissions = workspaceStore((state) => state.permissions);

  const can = (permission: PermissionKey) => permissions.includes(permission);
  const canAny = (...items: PermissionKey[]) => items.some((item) => permissions.includes(item));
  const canAll = (...items: PermissionKey[]) => items.every((item) => permissions.includes(item));

  return { permissions, can, canAny, canAll };
}

