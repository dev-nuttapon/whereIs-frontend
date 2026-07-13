import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { useI18n } from '@/hooks/useI18n';
import { ItemIcon, PlusIcon } from '@/components/ui/icons';
import { useAssets } from '@/features/assets/hooks/useAssets';
import { CreateItemDialog } from '@/features/items/components/CreateItemDialog';

export function ItemsPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t } = useI18n();
  const assetsQuery = useAssets(wsId);
  const assets = assetsQuery.data ?? [];
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <PageShell
      title={t('items.list.title')}
      description={t('items.list.description')}
      actions={(
        <Button className="w-full sm:w-auto" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          {t('items.list.create')}
        </Button>
      )}
    >
      {assetsQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {assetsQuery.isError ? <ErrorState message={t('items.list.error', 'Unable to load items.')} onRetry={() => assetsQuery.refetch()} /> : null}

      <div className="grid gap-[18px] md:grid-cols-3">
        <StatCard label={t('items.list.count')} value={assets.length} />
        <StatCard label={t('items.list.totalProducts', 'สินค้า')} value={new Set(assets.map((asset) => asset.productId)).size} />
        <StatCard label={t('items.list.withContainers', 'ใน container')} value={assets.filter((asset) => asset.containerId).length} />
      </div>

      {assets.length === 0 ? (
        <EmptyState
          title={t('items.list.emptyTitle')}
          description={t('items.list.emptyDescription')}
          icon={<ItemIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset.id} className="hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{asset.productName}</CardTitle>
                  <CardDescription>{asset.serialNumber ?? asset.barcode ?? asset.id}</CardDescription>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>{t('items.list.location')}: {asset.locationName ?? asset.locationId ?? '-'}</div>
                  <div>{t('items.list.container')}: {asset.containerName ?? asset.containerId ?? '-'}</div>
                  <div>{t('items.list.status')}: {asset.status}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateItemDialog wsId={wsId} open={createOpen} onOpenChange={setCreateOpen} />
    </PageShell>
  );
}
