import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSearchItems } from '@/features/items/hooks/useItems';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { StatCard } from '@/components/common/StatCard';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { MOCK_CONTAINERS } from '@/mocks/mock-data';
import { ContainerIcon, OpenIcon } from '@/components/ui/icons';

export function ContainersPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t } = useI18n();
  const itemsQuery = useSearchItems(wsId, { page: 1, limit: 200 });

  const containers = useMemo(() => MOCK_CONTAINERS.filter((container) => container.workspaceId === wsId), [wsId]);
  const itemCounts = useMemo(() => {
    const counts = new Map<string, number>();
    (itemsQuery.data?.data ?? []).forEach((item) => {
      if (!item.containerId) {
        return;
      }
      counts.set(item.containerId, (counts.get(item.containerId) ?? 0) + 1);
    });
    return counts;
  }, [itemsQuery.data?.data]);

  return (
    <PageShell title={t('containers.list.title')} description={t('containers.list.description')}>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t('containers.list.itemCount')} value={Array.from(itemCounts.values()).reduce((sum, count) => sum + count, 0)} />
        <StatCard label={t('containers.list.total')} value={containers.length} />
        <StatCard label={t('containers.list.childCount')} value={containers.reduce((sum) => sum + 1, 0)} />
      </div>

      {containers.length === 0 ? (
        <EmptyState
          title={t('containers.list.emptyTitle')}
          description={t('containers.list.emptyDescription')}
          icon={<ContainerIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {containers.map((container) => {
            const itemCount = itemCounts.get(container.id) ?? 0;

            return (
              <Card key={container.id} className="hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{container.code}</CardTitle>
                    <CardDescription>{container.name ?? t('containers.list.title')}</CardDescription>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>
                      {t('containers.list.itemCount')}: {itemCount}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link to={ROUTES.workspaceContainerDetail(wsId, container.id)}>
                      <OpenIcon className="h-4 w-4" />
                      {t('containers.list.open')}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
