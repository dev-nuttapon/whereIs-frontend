import type { ReactNode } from 'react';
import type { PermissionKey } from '@/types/permission.types';
import { usePermission } from '@/hooks/usePermission';

export interface PermissionGuardProps {
  perm: PermissionKey | PermissionKey[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ perm, children, fallback = null }: PermissionGuardProps) {
  const { can, canAll } = usePermission();
  const allowed = Array.isArray(perm) ? canAll(...perm) : can(perm);
  return allowed ? children : fallback;
}

