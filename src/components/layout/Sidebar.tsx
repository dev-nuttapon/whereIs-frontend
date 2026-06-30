import { NavLink, useParams } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { WORKSPACE_NAV_ITEMS, type NavItem } from '@/constants/navigation';
import { usePermission } from '@/hooks/usePermission';
import { useI18n } from '@/hooks/useI18n';
import { workspaceStore } from '@/stores/workspace.store';
import { uiStore } from '@/stores/ui.store';
import {
  ActivityIcon,
  DashboardIcon,
  ContainerIcon,
  ItemIcon,
  LocationIcon,
  MemberIcon,
  SearchIcon,
  SettingsIcon,
  SiteIcon,
} from '@/components/ui/icons';

const ICONS = {
  dashboard: DashboardIcon,
  search: SearchIcon,
  items: ItemIcon,
  containers: ContainerIcon,
  locations: LocationIcon,
  sites: SiteIcon,
  members: MemberIcon,
  activity: ActivityIcon,
  settings: SettingsIcon,
} as const;

const SECTIONS: Array<{ titleKey: string; items: Array<NavItem['labelKey']> }> = [
  {
    titleKey: 'nav.group.main',
    items: ['nav.dashboard', 'nav.search'],
  },
  {
    titleKey: 'nav.group.inventory',
    items: ['nav.items', 'nav.containers', 'nav.locations', 'nav.sites'],
  },
  {
    titleKey: 'nav.group.management',
    items: ['nav.members', 'nav.activity', 'nav.settings'],
  },
] as const;

export function Sidebar() {
  const { wsId = workspaceStore.getState().currentWorkspaceId ?? 'ws-warehouse' } = useParams();
  const { can } = usePermission();
  const { t } = useI18n();
  const sidebarOpen = uiStore((state) => state.sidebarOpen);
  const currentWorkspace = workspaceStore((state) => state.currentWorkspace);
  const items = WORKSPACE_NAV_ITEMS.filter((item) => {
    const role = currentWorkspace?.myRole ?? 'viewer';
    const roleAllowed = item.roles ? item.roles.includes(role) : true;
    return roleAllowed && (!item.permission || can(item.permission));
  });

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-border bg-card p-3 transition-transform lg:sticky lg:top-0 lg:block lg:h-screen lg:w-60',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      <div className="mb-4 rounded-lg border border-border bg-background px-3 py-3">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">WhereIs</p>
        <p className="mt-1 truncate text-sm font-semibold leading-tight">{currentWorkspace?.name ?? 'Workspace'}</p>
      </div>
      <nav className="space-y-4">
        {SECTIONS.map((section) => {
          const sectionItems = items.filter((item) => section.items.includes(item.labelKey));
          if (sectionItems.length === 0) {
            return null;
          }

          return (
            <div key={section.titleKey} className="space-y-2">
              <p className="px-2 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{t(section.titleKey)}</p>
              <div className="space-y-1">
                {sectionItems.map((item) => {
                  const to = item.to(wsId);
                  const Icon = ICONS[item.iconKey];
                  return (
                    <NavLink
                      key={item.labelKey}
                      to={to}
                      end={item.labelKey === 'nav.dashboard'}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-2 rounded-lg border px-2.5 py-2 text-sm transition-colors',
                          isActive
                            ? 'border-border bg-muted text-foreground'
                            : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground',
                        )
                      }
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate">{t(item.labelKey)}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
