import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { ContainerIcon, OpenIcon, PlusIcon } from '@/components/ui/icons';
import { CreateContainerDialog } from '@/features/containers/components/CreateContainerDialog';

export function ContainersPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t } = useI18n();
  const containersQuery = useContainers(wsId);
  const containers = containersQuery.data ?? [];
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <PageShell
      title={t('containers.list.title')}
      description={t('containers.list.description')}
      actions={(
        <Button className="w-full sm:w-auto" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          {t('containers.list.create', 'สร้าง container')}
        </Button>
      )}
    >
      {containersQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {containersQuery.isError ? <ErrorState message={t('containers.list.error', 'Unable to load containers.')} onRetry={() => containersQuery.refetch()} /> : null}
      <div className="grid gap-[18px] md:grid-cols-3">
        <StatCard label={t('containers.list.itemCount')} value={containers.reduce((sum, container) => sum + (container.itemCount ?? 0), 0)} />
        <StatCard label={t('containers.list.total')} value={containers.length} />
        <StatCard label={t('containers.list.childCount')} value={containers.reduce((sum, container) => sum + (container.childContainerCount ?? 0), 0)} />
      </div>

      {containers.length === 0 ? (
        <EmptyState
          title={t('containers.list.emptyTitle')}
          description={t('containers.list.emptyDescription')}
          icon={<ContainerIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {containers.map((container) => {
            return (
              <Card key={container.id} className="hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="space-y-4 p-5 sm:p-6">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{container.name}</CardTitle>
                    <CardDescription>{container.typeLabel}</CardDescription>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>
                      {t('containers.list.itemCount')}: {container.itemCount ?? 0}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full rounded-full sm:w-auto">
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

      <CreateContainerDialog wsId={wsId} open={createOpen} onOpenChange={setCreateOpen} />
    </PageShell>
  );
}
