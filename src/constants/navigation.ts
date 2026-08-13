import type { Role } from '@/types/domain.types';
import type { PermissionKey } from '@/types/permission.types';

export interface NavItem {
  labelKey: string;
  labelFallback?: string;
  to: (wsId: string) => string;
  iconKey: 'dashboard' | 'search' | 'items' | 'stock' | 'containers' | 'master' | 'members' | 'settings' | 'borrow' | 'activity' | 'reports' | 'notifications' | 'receive';
  roles?: Role[];
  permissions?: PermissionKey[];
}

export const WORKSPACE_NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard', labelFallback: 'Dashboard', iconKey: 'dashboard', to: (wsId) => `/w/${wsId}` },
  { labelKey: 'nav.search', labelFallback: 'Search', iconKey: 'search', to: (wsId) => `/w/${wsId}/search`, roles: ['viewer', 'member', 'admin', 'owner'] },
  { labelKey: 'nav.activity', labelFallback: 'Activity', iconKey: 'activity', to: (wsId) => `/w/${wsId}/activity`, roles: ['viewer', 'member', 'admin', 'owner'], permissions: ['activity.view'] },
  { labelKey: 'nav.receive', labelFallback: 'Add to inventory', iconKey: 'receive', to: (wsId) => `/w/${wsId}/receive`, roles: ['member', 'admin', 'owner'], permissions: ['stock.manage', 'asset.manage'] },
  { labelKey: 'nav.inventory', labelFallback: 'All inventory', iconKey: 'items', to: (wsId) => `/w/${wsId}/search`, roles: ['viewer', 'member', 'admin', 'owner'] },
  { labelKey: 'nav.assets', labelFallback: 'Assets', iconKey: 'items', to: (wsId) => `/w/${wsId}/assets`, roles: ['member', 'admin', 'owner'], permissions: ['asset.view'] },
  { labelKey: 'nav.stock', labelFallback: 'Stock', iconKey: 'stock', to: (wsId) => `/w/${wsId}/stock`, roles: ['member', 'admin', 'owner'], permissions: ['stock.view'] },
  { labelKey: 'nav.borrowOrders', labelFallback: 'Borrow orders', iconKey: 'borrow', to: (wsId) => `/w/${wsId}/borrow-orders`, roles: ['member', 'admin', 'owner'], permissions: ['borrow.view'] },
  { labelKey: 'nav.masterData', labelFallback: 'Master data', iconKey: 'master', to: (wsId) => `/w/${wsId}/master-data`, roles: ['member', 'admin', 'owner'], permissions: ['product.view', 'category.manage'] },
  { labelKey: 'nav.reports', labelFallback: 'Reports', iconKey: 'reports', to: (wsId) => `/w/${wsId}/reports`, roles: ['member', 'admin', 'owner'], permissions: ['report.view'] },
  { labelKey: 'nav.notifications', labelFallback: 'Notifications', iconKey: 'notifications', to: (wsId) => `/w/${wsId}/notifications`, roles: ['viewer', 'member', 'admin', 'owner'], permissions: ['notification.view'] },
  { labelKey: 'nav.members', labelFallback: 'Members', iconKey: 'members', to: (wsId) => `/w/${wsId}/members`, roles: ['admin', 'owner'], permissions: ['member.view'] },
];
