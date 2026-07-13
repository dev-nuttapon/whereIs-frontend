import type { Role } from '@/types/domain.types';

export interface NavItem {
  labelKey: string;
  to: (wsId: string) => string;
  iconKey: 'dashboard' | 'containers' | 'members' | 'settings';
  roles?: Role[];
}

export const WORKSPACE_NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard', iconKey: 'dashboard', to: (wsId) => `/w/${wsId}` },
  { labelKey: 'nav.containers', iconKey: 'containers', to: (wsId) => `/w/${wsId}/containers`, roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.members', iconKey: 'members', to: (wsId) => `/w/${wsId}/members`, roles: ['admin', 'owner'] },
  { labelKey: 'nav.settings', iconKey: 'settings', to: (wsId) => `/w/${wsId}/settings`, roles: ['admin', 'owner', 'member', 'viewer'] },
];
