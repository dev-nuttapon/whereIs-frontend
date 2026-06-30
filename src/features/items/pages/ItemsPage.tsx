import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { StatCard } from '@/components/common/StatCard';
import { ItemFormDialog } from '@/features/items/components/ItemFormDialog';
import { ItemEditDialog } from '@/features/items/components/ItemEditDialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { MOCK_CONTAINERS, MOCK_ITEMS, MOCK_MEMBERS } from '@/mocks/mock-data';
import { ItemIcon, OpenIcon, PlusIcon } from '@/components/ui/icons';
import type { Item } from '@/types/domain.types';
import { getItemStockState } from '@/lib/item-stock';

export function ItemsPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useI18n();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);

  const filterStatus = searchParams.get('status');
  const filterStock = searchParams.get('stock');
  const filterUsageType = searchParams.get('usageType');
  const filterReturnPolicy = searchParams.get('returnPolicy');
  const filteredItems = useMemo(() => {
    const workspaceItems = MOCK_ITEMS.filter((item) => item.workspaceId === wsId);
    return workspaceItems.filter((item) => {
      if (filterStatus === 'stored' || filterStatus === 'taken_out' || filterStatus === 'missing') {
        return item.status === filterStatus;
      }

      if (filterStock === 'low') {
        return getItemStockState(item) === 'low_stock';
      }

      if (filterStock === 'out') {
        return getItemStockState(item) === 'out_of_stock';
      }

      if (filterUsageType === 'returnable' || filterUsageType === 'consumable') {
        if (item.usageType !== filterUsageType) {
          return false;
        }
      }

      if (filterReturnPolicy === 'due' || filterReturnPolicy === 'indefinite') {
        if (item.returnPolicy !== filterReturnPolicy) {
          return false;
        }
      }

      return true;
    });
  }, [filterReturnPolicy, filterStatus, filterStock, filterUsageType, wsId]);
  const containerMap = useMemo(() => new Map(MOCK_CONTAINERS.map((container) => [container.id, container])), []);
  const holderMap = useMemo(() => new Map(MOCK_MEMBERS.map((member) => [member.id, member])), []);
  const storedCount = filteredItems.filter((item) => item.status === 'stored').length;
  const takenOutCount = filteredItems.filter((item) => item.status === 'taken_out').length;
  const kindLabel = (kind: Item['kind']) => (kind === 'single' ? t('items.detail.kindSingle') : t('items.detail.kindBulk'));
  const usageLabel = (usageType: Item['usageType']) =>
    usageType === 'consumable' ? t('items.detail.usageTypeConsumable') : t('items.detail.usageTypeReturnable');
  const returnPolicyLabel = (item: Item) =>
    item.returnPolicy === 'due'
      ? t('items.detail.returnPolicyDue', undefined, { days: item.returnDays ?? 7 })
      : t('items.detail.returnPolicyIndefinite');
  const lowStockCount = filteredItems.filter((item) => getItemStockState(item) === 'low_stock').length;
  const outOfStockCount = filteredItems.filter((item) => getItemStockState(item) === 'out_of_stock').length;
  const activeFilterLabel =
    filterStatus === 'stored'
      ? t('dashboard.stored')
      : filterStatus === 'taken_out'
        ? t('dashboard.takenOut')
        : filterStatus === 'missing'
          ? t('dashboard.missing')
          : filterStock === 'low'
            ? t('dashboard.lowStock')
            : filterStock === 'out'
              ? t('dashboard.outOfStock')
              : filterReturnPolicy === 'due'
                ? t('dashboard.returnDue')
                : filterReturnPolicy === 'indefinite'
                  ? t('dashboard.returnIndefinite')
              : '';

  return (
    <PageShell
      title={t('items.list.title')}
      description={t('items.list.description')}
      actions={
        <Button onClick={() => setCreateOpen(true)} className="rounded-full">
          <PlusIcon className="h-4 w-4" />
          {t('items.list.create')}
        </Button>
      }
    >
      {activeFilterLabel ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{activeFilterLabel}</Badge>
          <Button variant="ghost" size="sm" onClick={() => setSearchParams({})}>
            {t('search.clear')}
          </Button>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t('items.list.count')} value={filteredItems.length} />
        <StatCard label={t('dashboard.stored')} value={storedCount} />
        <StatCard label={t('dashboard.takenOut')} value={takenOutCount} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard label={t('items.detail.stockStateLow')} value={lowStockCount} description={t('items.detail.reorderPoint')} />
        <StatCard label={t('items.detail.stockStateOut')} value={outOfStockCount} description={t('items.stock.restockSubmit')} />
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          title={t('items.list.emptyTitle')}
          description={t('items.list.emptyDescription')}
          actionLabel={t('items.list.create')}
          onAction={() => setCreateOpen(true)}
          icon={<ItemIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const container = item.containerId ? containerMap.get(item.containerId) : null;
            const holder = item.currentHolderId ? holderMap.get(item.currentHolderId) : null;

            return (
              <Card key={item.id} className="hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>{item.code ?? t('items.detail.noCode')}</CardDescription>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {kindLabel(item.kind)}
                          {item.kind === 'bulk' && item.quantity ? ` · ${item.quantity}` : ''}
                        </Badge>
                        <Badge variant="secondary">{usageLabel(item.usageType)}</Badge>
                        {item.usageType === 'returnable' ? <Badge variant="outline">{returnPolicyLabel(item)}</Badge> : null}
                        {item.usageType === 'consumable' && item.kind === 'bulk' ? (
                          <Badge
                            variant={getItemStockState(item) === 'out_of_stock' ? 'destructive' : getItemStockState(item) === 'low_stock' ? 'outline' : 'secondary'}
                          >
                            {getItemStockState(item) === 'out_of_stock'
                              ? t('items.detail.stockStateOut')
                              : getItemStockState(item) === 'low_stock'
                                ? t('items.detail.stockStateLow')
                                : t('items.detail.stockStateIn')}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="grid gap-2 text-sm text-muted-foreground">
                    <div>
                      {t('items.list.container')}: {container ? `${container.code}${container.name ? ` · ${container.name}` : ''}` : t('items.detail.noContainer')}
                    </div>
                    <div>
                      {t('items.list.holder')}: {holder?.user.name ?? t('items.detail.noHolder')}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link to={ROUTES.workspaceItemDetail(wsId, item.id)}>
                        <OpenIcon className="h-4 w-4" />
                        {t('items.list.open')}
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setEditItem(item)}>
                      {t('items.detail.edit')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ItemFormDialog wsId={wsId} open={createOpen} onOpenChange={setCreateOpen} />
      {editItem ? (
        <ItemEditDialog wsId={wsId} item={editItem} open={Boolean(editItem)} onOpenChange={(open) => !open && setEditItem(null)} />
      ) : null}
    </PageShell>
  );
}
