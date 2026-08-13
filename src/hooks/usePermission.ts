import { workspaceStore } from '@/stores/workspace.store';
import type { PermissionKey } from '@/types/permission.types';

export function usePermission() {
  const permissions = workspaceStore((state) => state.permissions);
  const isOwner = workspaceStore((state) => state.currentWorkspace?.myRole === 'owner');

  const can = (permission: PermissionKey) => isOwner || permissions.includes(permission);
  const canAny = (...items: PermissionKey[]) => isOwner || items.some((item) => permissions.includes(item));
  const canAll = (...items: PermissionKey[]) => isOwner || items.every((item) => permissions.includes(item));

  return { permissions, can, canAny, canAll };
}
