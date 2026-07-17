import { Link, useLocation, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { workspaceStore } from '@/stores/workspace.store';
import { ROUTES } from '@/constants/routes';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { useProduct } from '@/features/products/hooks/useProducts';
import { useBorrowOrder } from '@/features/borrow-orders/hooks/useBorrowOrders';
import { useMembers } from '@/features/members/hooks/useMembers';
import { ChevronRightIcon } from '@/components/ui/icons';
import { useI18n } from '@/hooks/useI18n';

interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs() {
  const { wsId, productId } = useParams();
  const location = useLocation();
  const { t } = useI18n();
  const currentWorkspace = workspaceStore((state) => state.currentWorkspace);
  const containersQuery = useContainers(wsId ?? '');
  const membersQuery = useMembers(wsId ?? '');
  const borrowOrderPathSegment = location.pathname.includes('/borrow-orders/') ? location.pathname.split('/borrow-orders/')[1]?.split('/')[0] ?? '' : '';
  const isProductDetailRoute = Boolean(productId) && productId !== 'new' && productId !== 'edit';
  const isBorrowOrderDetailRoute = Boolean(borrowOrderPathSegment) && borrowOrderPathSegment !== 'new';
  const productQuery = useProduct(wsId ?? '', isProductDetailRoute ? (productId ?? '') : '');
  const borrowOrderQuery = useBorrowOrder(wsId ?? '', isBorrowOrderDetailRoute ? borrowOrderPathSegment : '');
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

    if (location.pathname.endsWith('/search')) {
      return [{ label: 'Search', to: ROUTES.workspaceSearch(wsId) }];
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

    if (location.pathname.endsWith('/stock')) {
      return [{ label: 'Stock', to: ROUTES.workspaceStock(wsId) }];
    }

    if (location.pathname.endsWith('/products')) {
      return [{ label: t('nav.products', 'Products'), to: ROUTES.workspaceProducts(wsId) }];
    }

    if (location.pathname.includes('/products/')) {
      return [
        { label: t('nav.products', 'Products'), to: ROUTES.workspaceProducts(wsId) },
        { label: productQuery.data?.name ?? t('products.detail.title', 'Product detail') },
      ];
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

    if (location.pathname.includes('/borrow-orders/')) {
      return [
        { label: 'Borrow orders', to: ROUTES.workspaceBorrowOrders(wsId) },
        { label: borrowOrderQuery.data?.purpose ?? borrowOrderQuery.data?.id ?? 'Borrow order' },
      ];
    }

    return [{ label: currentWorkspace?.name ?? 'Workspace', to: ROUTES.workspaceDashboard(wsId) }];
  }, [borrowOrderQuery.data?.id, borrowOrderQuery.data?.purpose, containers, currentWorkspace?.name, location.pathname, members, productQuery.data?.name, t, wsId]);

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
