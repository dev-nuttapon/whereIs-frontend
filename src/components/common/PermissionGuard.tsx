import type { ReactNode } from 'react';
import type { PermissionKey } from '@/types/permission.types';
import { usePermission } from '@/hooks/usePermission';
import { AccessDeniedState } from '@/components/common/AccessDeniedState';

export interface PermissionGuardProps {
  perm: PermissionKey | PermissionKey[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ perm, children, fallback = <AccessDeniedState /> }: PermissionGuardProps) {
  const { can, canAll } = usePermission();
  const allowed = Array.isArray(perm) ? canAll(...perm) : can(perm);
  return allowed ? children : fallback;
}
