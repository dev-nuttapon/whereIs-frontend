import { Link, useLocation, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { workspaceStore } from '@/stores/workspace.store';
import { ROUTES } from '@/constants/routes';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { useMembers } from '@/features/members/hooks/useMembers';
import { ChevronRightIcon } from '@/components/ui/icons';

interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs() {
  const { wsId } = useParams();
  const location = useLocation();
  const currentWorkspace = workspaceStore((state) => state.currentWorkspace);
  const containersQuery = useContainers(wsId ?? '');
  const membersQuery = useMembers(wsId ?? '');
  const containers = containersQuery.data ?? [];
  const members = membersQuery.data ?? [];

  const crumbs = useMemo<Crumb[]>(() => {
    if (!wsId) {
      return [];
    }

    const containerPath = (containerId: string | null) => {
      const chain: Crumb[] = [];
      let current = containerId ? containers.find((entry) => entry.id === containerId) ?? null : null;
      while (current) {
        chain.unshift({
          label: current.name,
          to: ROUTES.workspaceContainerDetail(wsId, current.id),
        });
        current = current.parentId ? containers.find((entry) => entry.id === current?.parentId) ?? null : null;
      }
      return chain;
    };

    if (location.pathname.endsWith('/containers')) {
      return [{ label: 'Containers', to: ROUTES.workspaceContainers(wsId) }];
    }

    if (location.pathname.includes('/containers/')) {
      const containerId = location.pathname.split('/containers/')[1];
      const container = containers.find((entry) => entry.id === containerId);
      return [
        { label: 'Containers', to: ROUTES.workspaceContainers(wsId) },
        ...containerPath(container?.id ?? null),
      ];
    }

    if (location.pathname.endsWith('/members')) {
      return [{ label: 'Members', to: ROUTES.workspaceMembers(wsId) }];
    }

    if (location.pathname.includes('/members/')) {
      const memberId = location.pathname.split('/members/')[1];
      const member = members.find((entry) => entry.id === memberId);
      return [
        { label: 'Members', to: ROUTES.workspaceMembers(wsId) },
        { label: member?.user.name ?? 'Member' },
      ];
    }

    if (location.pathname.endsWith('/settings')) {
      return [{ label: 'Settings', to: ROUTES.workspaceSettings(wsId) }];
    }

    if (location.pathname.endsWith('/borrow-orders')) {
      return [{ label: 'Borrow orders', to: ROUTES.workspaceBorrowOrders(wsId) }];
    }

    return [{ label: currentWorkspace?.name ?? 'Workspace', to: ROUTES.workspaceDashboard(wsId) }];
  }, [containers, currentWorkspace?.name, location.pathname, members, wsId]);

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
