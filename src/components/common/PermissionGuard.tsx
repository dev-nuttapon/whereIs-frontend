import type { ReactNode } from 'react';
import type { PermissionKey } from '@/types/permission.types';
import { usePermission } from '@/hooks/usePermission';
import { AccessDeniedState } from '@/components/common/AccessDeniedState';

export interface PermissionGuardProps {
  perm: PermissionKey | PermissionKey[];
  children: ReactNode;
  fallback?: ReactNode;
  mode?: 'all' | 'any';
}

export function PermissionGuard({ perm, children, fallback = <AccessDeniedState />, mode = 'all' }: PermissionGuardProps) {
  const { can, canAll, canAny } = usePermission();
  const allowed = Array.isArray(perm) ? (mode === 'any' ? canAny(...perm) : canAll(...perm)) : can(perm);
  return allowed ? children : fallback;
}
