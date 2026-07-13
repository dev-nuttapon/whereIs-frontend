import { NavLink, useLocation, useParams } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { useMemo } from 'react';
import { WORKSPACE_NAV_ITEMS, type NavItem } from '@/constants/navigation';
import { usePermission } from '@/hooks/usePermission';
import { useI18n } from '@/hooks/useI18n';
import { workspaceStore } from '@/stores/workspace.store';
import { uiStore } from '@/stores/ui.store';
import {
  ActivityIcon,
  BellIcon,
  ClipboardCheckIcon,
  DashboardIcon,
  ContainerIcon,
  ItemIcon,
  MemberIcon,
  ReportIcon,
  SearchIcon,
  SettingsIcon,
} from '@/components/ui/icons';

const ICONS = {
  dashboard: DashboardIcon,
  search: SearchIcon,
  items: ItemIcon,
  containers: ContainerIcon,
  members: MemberIcon,
  activity: ActivityIcon,
  reports: ReportIcon,
  notifications: BellIcon,
  settings: SettingsIcon,
} as const;

const SECTIONS: Array<{ titleKey: string; items: Array<NavItem['labelKey']> }> = [
  { titleKey: 'nav.group.main', items: ['nav.dashboard', 'nav.search'] },
  { titleKey: 'nav.group.inventory', items: ['nav.items', 'nav.containers'] },
  { titleKey: 'nav.group.management', items: ['nav.members', 'nav.activity', 'nav.reports', 'nav.notifications', 'nav.settings'] },
] as const;

export function Sidebar() {
  const { wsId = workspaceStore.getState().currentWorkspaceId ?? 'ws-hq' } = useParams();
  const location = useLocation();
  const { can } = usePermission();
  const { t } = useI18n();
  const sidebarOpen = uiStore((state) => state.sidebarOpen);
  const toggleSidebar = uiStore((state) => state.toggleSidebar);
  const currentWorkspace = workspaceStore((state) => state.currentWorkspace);
  const items = WORKSPACE_NAV_ITEMS.filter((item) => {
    const role = currentWorkspace?.myRole ?? 'viewer';
    const roleAllowed = item.roles ? item.roles.includes(role) : true;
    return roleAllowed && (!item.permission || can(item.permission));
  });
  const menuItems = useMemo(
    () =>
      SECTIONS.map((section) => {
        const sectionItems = items.filter((item) => section.items.includes(item.labelKey));
        return {
          type: 'group' as const,
          label: t(section.titleKey),
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
                  onClick={() => {
                    if (sidebarOpen) {
                      toggleSidebar();
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{t(item.labelKey)}</span>
                </NavLink>
              ),
            };
          }),
        };
      }).filter((section) => section.children.length > 0),
    [items, sidebarOpen, t, toggleSidebar, wsId],
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
    <Layout.Sider
      width={280}
      collapsedWidth={0}
      breakpoint="lg"
      collapsed={!sidebarOpen}
      onCollapse={(collapsed) => {
        if (collapsed !== sidebarOpen) {
          toggleSidebar();
        }
      }}
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'auto',
        borderRight: '1px solid rgba(5, 5, 5, 0.06)',
        background: 'var(--ant-color-bg-container)',
      }}
      className="z-50"
    >
      <div className="border-b border-border/60 px-4 py-4">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">WhereIs</p>
        <p className="mt-1 truncate text-sm font-semibold leading-tight">{currentWorkspace?.name ?? 'Workspace'}</p>
        <p className="mt-1 text-xs text-muted-foreground">{currentWorkspace?.myRole ?? 'viewer'}</p>
      </div>
      <Menu mode="inline" selectable inlineIndent={16} selectedKeys={[selectedKey]} items={menuItems} />
      <div className="border-t border-border/60 px-4 py-4">
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/40 px-3 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <ClipboardCheckIcon className="h-4 w-4" />
            Pending approvals
          </div>
          <p className="mt-1">Review invitations and permission changes from the member area.</p>
        </div>
      </div>
    </Layout.Sider>
  );
}
