import { Link, useLocation, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { workspaceStore } from '@/stores/workspace.store';
import { ROUTES } from '@/constants/routes';
import { MOCK_CONTAINERS, MOCK_ITEMS, MOCK_MEMBERS } from '@/mocks/mock-data';
import { ChevronRightIcon } from '@/components/ui/icons';

interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs() {
  const { wsId } = useParams();
  const location = useLocation();
  const currentWorkspace = workspaceStore((state) => state.currentWorkspace);

  const crumbs = useMemo<Crumb[]>(() => {
    if (!wsId) {
      return [];
    }

    const containerPath = (containerId: string | null) => {
      const chain: Crumb[] = [];
      let current = containerId ? MOCK_CONTAINERS.find((entry) => entry.id === containerId) ?? null : null;
      while (current) {
        chain.unshift({
          label: current.name,
          to: ROUTES.workspaceContainerDetail(wsId, current.id),
        });
        current = current.parentId ? MOCK_CONTAINERS.find((entry) => entry.id === current?.parentId) ?? null : null;
      }
      return chain;
    };

    if (location.pathname.endsWith('/search')) {
      return [{ label: 'Search', to: ROUTES.workspaceSearch(wsId) }];
    }

    if (location.pathname.endsWith('/containers')) {
      return [{ label: 'Containers', to: ROUTES.workspaceContainers(wsId) }];
    }

    if (location.pathname.includes('/containers/')) {
      const containerId = location.pathname.split('/containers/')[1];
      const container = MOCK_CONTAINERS.find((entry) => entry.id === containerId);
      return [
        { label: 'Containers', to: ROUTES.workspaceContainers(wsId) },
        ...containerPath(container?.id ?? null),
      ];
    }

    if (location.pathname.endsWith('/items')) {
      return [{ label: 'Items', to: ROUTES.workspaceItems(wsId) }];
    }

    if (location.pathname.includes('/items/')) {
      const itemId = location.pathname.split('/items/')[1]?.split('/')[0];
      const item = MOCK_ITEMS.find((entry) => entry.id === itemId || entry.code === itemId);
      const container = item?.containerId ? MOCK_CONTAINERS.find((entry) => entry.id === item.containerId) : null;
      return [
        { label: 'Items', to: ROUTES.workspaceItems(wsId) },
        ...containerPath(container?.id ?? null),
        { label: item?.name ?? itemId ?? 'Item' },
      ];
    }

    if (location.pathname.endsWith('/members')) {
      return [{ label: 'Members', to: ROUTES.workspaceMembers(wsId) }];
    }

    if (location.pathname.includes('/members/')) {
      const memberId = location.pathname.split('/members/')[1];
      const member = MOCK_MEMBERS.find((entry) => entry.id === memberId);
      return [
        { label: 'Members', to: ROUTES.workspaceMembers(wsId) },
        { label: member?.user.name ?? 'Member' },
      ];
    }

    if (location.pathname.endsWith('/activity')) {
      return [{ label: 'Activity', to: ROUTES.workspaceActivity(wsId) }];
    }

    if (location.pathname.endsWith('/reports')) {
      return [{ label: 'Reports', to: ROUTES.workspaceReports(wsId) }];
    }

    if (location.pathname.endsWith('/notifications')) {
      return [{ label: 'Notifications', to: ROUTES.workspaceNotifications(wsId) }];
    }

    if (location.pathname.endsWith('/settings')) {
      return [{ label: 'Settings', to: ROUTES.workspaceSettings(wsId) }];
    }

    return [{ label: currentWorkspace?.name ?? 'Workspace', to: ROUTES.workspaceDashboard(wsId) }];
  }, [currentWorkspace?.name, location.pathname, wsId]);

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      {crumbs.map((crumb, index) => (
        <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
          {index > 0 ? <ChevronRightIcon className="h-3.5 w-3.5" /> : null}
          {crumb.to ? (
            <Link to={crumb.to} className="font-medium text-foreground hover:underline">
              {crumb.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
