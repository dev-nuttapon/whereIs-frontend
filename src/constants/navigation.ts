import type { Role } from '@/types/domain.types';
import type { PermissionKey } from '@/types/permission.types';

export interface NavItem {
  labelKey: string;
  to: (wsId: string) => string;
  iconKey: 'dashboard' | 'search' | 'items' | 'containers' | 'members' | 'activity' | 'reports' | 'notifications' | 'settings';
  permission?: PermissionKey;
  roles?: Role[];
}

export const WORKSPACE_NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard', iconKey: 'dashboard', to: (wsId) => `/w/${wsId}` },
  { labelKey: 'nav.search', iconKey: 'search', to: (wsId) => `/w/${wsId}/search`, permission: 'item.view' },
  { labelKey: 'nav.items', iconKey: 'items', to: (wsId) => `/w/${wsId}/items`, permission: 'item.view', roles: ['viewer', 'member', 'admin', 'owner'] },
  { labelKey: 'nav.containers', iconKey: 'containers', to: (wsId) => `/w/${wsId}/containers`, permission: 'container.view', roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.members', iconKey: 'members', to: (wsId) => `/w/${wsId}/members`, permission: 'member.view', roles: ['admin', 'owner'] },
  { labelKey: 'nav.activity', iconKey: 'activity', to: (wsId) => `/w/${wsId}/activity`, permission: 'activity.view', roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.reports', iconKey: 'reports', to: (wsId) => `/w/${wsId}/reports`, permission: 'report.view', roles: ['admin', 'owner'] },
  { labelKey: 'nav.notifications', iconKey: 'notifications', to: (wsId) => `/w/${wsId}/notifications`, permission: 'notification.view', roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.settings', iconKey: 'settings', to: (wsId) => `/w/${wsId}/settings`, roles: ['admin', 'owner', 'member', 'viewer'] },
];
