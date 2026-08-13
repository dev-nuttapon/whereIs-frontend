import type { Role } from '@/types/domain.types';

export function normalizeWorkspaceRole(value: string): Role {
  const role = value.trim().toLowerCase();
  return role === 'owner' || role === 'admin' || role === 'member' || role === 'viewer' ? role : 'viewer';
}
