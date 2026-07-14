import type { Role } from '@/types/domain.types';

export interface NavItem {
  labelKey: string;
  labelFallback?: string;
  to: (wsId: string) => string;
  iconKey: 'dashboard' | 'items' | 'stock' | 'containers' | 'master' | 'members' | 'settings' | 'borrow';
  roles?: Role[];
}

export const WORKSPACE_NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard', labelFallback: 'Dashboard', iconKey: 'dashboard', to: (wsId) => `/w/${wsId}` },
  { labelKey: 'nav.items', labelFallback: 'Items', iconKey: 'items', to: (wsId) => `/w/${wsId}/items`, roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.stock', labelFallback: 'Stock', iconKey: 'stock', to: (wsId) => `/w/${wsId}/stock`, roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.containers', labelFallback: 'Containers', iconKey: 'containers', to: (wsId) => `/w/${wsId}/containers`, roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.borrowOrders', labelFallback: 'Borrow orders', iconKey: 'borrow', to: (wsId) => `/w/${wsId}/borrow-orders`, roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.masterData', labelFallback: 'Master data', iconKey: 'master', to: (wsId) => `/w/${wsId}/master-data`, roles: ['member', 'admin', 'owner'] },
  { labelKey: 'nav.members', labelFallback: 'Members', iconKey: 'members', to: (wsId) => `/w/${wsId}/members`, roles: ['admin', 'owner'] },
  { labelKey: 'nav.settings', labelFallback: 'Settings', iconKey: 'settings', to: (wsId) => `/w/${wsId}/settings`, roles: ['admin', 'owner', 'member', 'viewer'] },
];
