import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import type { PermissionKey } from '@/types/permission.types';
import { PermissionGuard } from '@/components/common/PermissionGuard';

export interface PermissionRouteProps {
  permission: PermissionKey | PermissionKey[];
  fallback?: ReactNode;
}

export function PermissionRoute({ permission, fallback = null }: PermissionRouteProps) {
  return (
    <PermissionGuard perm={permission} fallback={fallback}>
      <Outlet />
    </PermissionGuard>
  );
}

