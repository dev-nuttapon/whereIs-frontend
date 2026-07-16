import type { Role } from '@/types/domain.types';

export interface NavItem {
  labelKey: string;
  labelFallback?: string;
  to: (wsId: string) => string;
  iconKey: 'dashboard' | 'search' | 'items' | 'stock' | 'containers' | 'master' | 'members' | 'settings' | 'borrow' | 'activity' | 'reports' | 'notifications';
  roles?: Role[];
}

export const WORKSPACE_NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard', labelFallback: 'Dashboard', iconKey: 'dashboard', to: (wsId) => `/w/${wsId}` },
  { labelKey: 'nav.search', labelFallback: 'Search', iconKey: 'search', to: (wsId) => `/w/${wsId}/search`, roles: ['viewer', 'member', 'admin', 'owner'] },
  { labelKey: 'nav.activity', labelFallback: 'Activity', iconKey: 'activity', to: (wsId) => `/w/${wsId}/activity`, roles: ['viewer', 'member', 'admin', 'owner'] },
  { labelKey: 'nav.products', labelFallback: 'Products', iconKey: 'items', to: (wsId) => `/w/${wsId}/products`, roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.assets', labelFallback: 'Assets', iconKey: 'items', to: (wsId) => `/w/${wsId}/assets`, roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.stock', labelFallback: 'Stock', iconKey: 'stock', to: (wsId) => `/w/${wsId}/stock`, roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.containers', labelFallback: 'Containers', iconKey: 'containers', to: (wsId) => `/w/${wsId}/containers`, roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.borrowOrders', labelFallback: 'Borrow orders', iconKey: 'borrow', to: (wsId) => `/w/${wsId}/borrow-orders`, roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.masterData', labelFallback: 'Master data', iconKey: 'master', to: (wsId) => `/w/${wsId}/master-data`, roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.reports', labelFallback: 'Reports', iconKey: 'reports', to: (wsId) => `/w/${wsId}/reports`, roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.notifications', labelFallback: 'Notifications', iconKey: 'notifications', to: (wsId) => `/w/${wsId}/notifications`, roles: ['viewer', 'member', 'admin', 'owner'] },
  { labelKey: 'nav.members', labelFallback: 'Members', iconKey: 'members', to: (wsId) => `/w/${wsId}/members`, roles: ['admin', 'owner'] },
  { labelKey: 'nav.settings', labelFallback: 'Settings', iconKey: 'settings', to: (wsId) => `/w/${wsId}/settings`, roles: ['admin', 'owner', 'member', 'viewer'] },
];
