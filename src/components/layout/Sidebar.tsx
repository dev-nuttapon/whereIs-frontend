import { NavLink, useLocation, useParams } from 'react-router-dom';
import { Menu } from 'antd';
import { useMemo } from 'react';
import { WORKSPACE_NAV_ITEMS, type NavItem } from '@/constants/navigation';
import { useI18n } from '@/hooks/useI18n';
import { workspaceStore } from '@/stores/workspace.store';
import {
  DashboardIcon,
  SearchIcon,
  ItemIcon,
  StockIcon,
  ContainerIcon,
  BorrowIcon,
  DatabaseIcon,
  MemberIcon,
  SettingsIcon,
  ActivityIcon,
  ReportIcon,
  BellIcon,
} from '@/components/ui/icons';

const ICONS = {
  dashboard: DashboardIcon,
  search: SearchIcon,
  items: ItemIcon,
  stock: StockIcon,
  containers: ContainerIcon,
  borrow: BorrowIcon,
  master: DatabaseIcon,
  members: MemberIcon,
  settings: SettingsIcon,
  activity: ActivityIcon,
  reports: ReportIcon,
  notifications: BellIcon,
} as const;

export interface SidebarProps {
  onNavigate?: () => void;
}

const SECTIONS: Array<{ titleKey: string; titleFallback: string; items: Array<NavItem['labelKey']> }> = [
  { titleKey: 'nav.group.main', titleFallback: 'Main', items: ['nav.dashboard', 'nav.search', 'nav.activity'] },
  { titleKey: 'nav.group.inventory', titleFallback: 'Inventory', items: ['nav.items', 'nav.assets', 'nav.stock', 'nav.containers', 'nav.borrowOrders'] },
  { titleKey: 'nav.group.masterData', titleFallback: 'Master data', items: ['nav.masterData'] },
  { titleKey: 'nav.group.management', titleFallback: 'Management', items: ['nav.reports', 'nav.notifications', 'nav.members', 'nav.settings'] },
] as const;

export function Sidebar({ onNavigate }: SidebarProps) {
  const { wsId = workspaceStore.getState().currentWorkspaceId ?? 'ws-hq' } = useParams();
  const location = useLocation();
  const { t } = useI18n();
  const currentWorkspace = workspaceStore((state) => state.currentWorkspace);
  const items = WORKSPACE_NAV_ITEMS.filter((item) => {
    const role = currentWorkspace?.myRole ?? 'viewer';
    return item.roles ? item.roles.includes(role) : true;
  });
  const menuItems = useMemo(
    () =>
      SECTIONS.map((section) => {
        const sectionItems = items.filter((item) => section.items.includes(item.labelKey));
        return {
          type: 'group' as const,
        label: t(section.titleKey, section.titleFallback),
        key: section.titleKey,
        children: sectionItems.map((item) => {
          const to = item.to(wsId);
          const Icon = ICONS[item.iconKey];
          return {
            key: to,
            label: (
                <NavLink
                  to={to}
                  end={item.labelKey === 'nav.dashboard'}
                  onClick={onNavigate}
                  className="flex items-center gap-2"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{t(item.labelKey, item.labelFallback ?? item.labelKey)}</span>
                </NavLink>
              ),
            };
          }),
        };
      }).filter((section) => section.children.length > 0),
    [items, onNavigate, t, wsId],
  );

  const selectedKey = useMemo(() => {
    const directMatch = items.find((item) => location.pathname === item.to(wsId));
    if (directMatch) {
      return directMatch.to(wsId);
    }
    const nestedMatch = [...items]
      .sort((a, b) => b.to(wsId).length - a.to(wsId).length)
      .find((item) => location.pathname.startsWith(item.to(wsId) + '/'));
    return nestedMatch?.to(wsId) ?? location.pathname;
  }, [items, location.pathname, wsId]);

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-auto bg-card">
      <div className="border-b border-border/60 px-4 py-4">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">WhereIs</p>
        <p className="mt-1 truncate text-sm font-semibold leading-tight">{currentWorkspace?.name ?? 'Workspace'}</p>
        <p className="mt-1 text-xs text-muted-foreground">{currentWorkspace?.myRole ?? 'viewer'}</p>
      </div>
      <Menu mode="inline" selectable inlineIndent={16} selectedKeys={[selectedKey]} items={menuItems} />
    </aside>
  );
}
