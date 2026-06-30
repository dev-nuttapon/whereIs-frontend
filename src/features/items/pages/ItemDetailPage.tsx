import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useItem, useItemEvents } from '@/features/items/hooks/useItems';
import { StatusBadge } from '@/components/common/StatusBadge';
import { StatCard } from '@/components/common/StatCard';
import { ItemEditDialog } from '@/features/items/components/ItemEditDialog';
import { ItemActionDialogs } from '@/features/items/components/ItemActionDialogs';
import { usePermission } from '@/hooks/usePermission';
import { Separator } from '@/components/ui/separator';
import { useI18n } from '@/hooks/useI18n';
import { MOCK_CONTAINERS, MOCK_MEMBERS, MOCK_WORKSPACES } from '@/mocks/mock-data';
import { getItemStockState } from '@/lib/item-stock';

function formatDateTime(locale: 'en' | 'th', value: string) {
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDate(locale: 'en' | 'th', value: Date) {
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    dateStyle: 'medium',
  }).format(value);
}

export function ItemDetailPage() {
  const { wsId = 'ws-warehouse', itemId = '' } = useParams();
  const itemQuery = useItem(wsId, itemId);
  const eventsQuery = useItemEvents(wsId, itemId);
  const [editOpen, setEditOpen] = useState(false);
  const [openAction, setOpenAction] = useState<'move' | 'takeout' | 'return' | 'missing' | 'found' | 'dispose' | 'consume' | 'restock' | null>(null);
  const { can } = usePermission();
  const { t, locale } = useI18n();

  const item = itemQuery.data;
  const canMove = can('item.move') && item?.status !== 'disposed';
  const canTakeOut = can('item.takeout') && item?.status === 'stored' && item?.usageType === 'returnable';
  const canReturn = can('item.return') && item?.status === 'taken_out' && item?.usageType === 'returnable';
  const canConsumeStock = Boolean(item && item.kind === 'bulk' && item.usageType === 'consumable' && item.status !== 'disposed' && (item.quantity ?? 0) > 0);
  const canRestockStock = Boolean(item && item.kind === 'bulk' && item.usageType === 'consumable');
  const canMarkMissing = can('item.mark_missing') && item?.status !== 'disposed';
  const canMarkFound = can('item.mark_found') && item?.status === 'missing';
  const canDispose = can('item.dispose') && item?.status !== 'disposed';

  const eventLabels: Record<string, string> = {
    created: t('items.event.created'),
    updated: t('items.event.updated'),
    moved: t('items.event.moved'),
    taken_out: t('items.event.takenOut'),
    returned: t('items.event.returned'),
    stock_used: t('dashboard.event.stockUsed'),
    stock_restocked: t('dashboard.event.stockRestocked'),
    marked_missing: t('items.event.markedMissing'),
    marked_found: t('items.event.markedFound'),
    disposed: t('items.event.disposed'),
  };
  const container = item?.containerId ? MOCK_CONTAINERS.find((entry) => entry.id === item.containerId) : null;
  const holder = item?.currentHolderId ? MOCK_MEMBERS.find((entry) => entry.id === item.currentHolderId) : null;
  const workspace = item ? MOCK_WORKSPACES.find((entry) => entry.id === item.workspaceId) : null;
  const latestTakeOutEvent = eventsQuery.data?.find((event) => event.type === 'taken_out');
  const kindLabel = item?.kind === 'bulk' ? t('items.detail.kindBulk') : t('items.detail.kindSingle');
  const usageLabel = item?.usageType === 'consumable' ? t('items.detail.usageTypeConsumable') : t('items.detail.usageTypeReturnable');
  const returnPolicyLabel =
    item?.returnPolicy === 'due'
      ? t('items.detail.returnPolicyDue', undefined, { days: item.returnDays ?? 7 })
      : t('items.detail.returnPolicyIndefinite');
  const returnDueLabel =
    item?.usageType === 'returnable' && item.returnPolicy === 'due' && item.status === 'taken_out' && latestTakeOutEvent
      ? (() => {
          const dueAt = new Date(latestTakeOutEvent.createdAt);
          dueAt.setDate(dueAt.getDate() + (item.returnDays ?? 7));
          return new Date() > dueAt
            ? t('items.detail.returnOverdue', undefined, { date: formatDate(locale, dueAt) })
            : t('items.detail.returnDueOn', undefined, { date: formatDate(locale, dueAt) });
        })()
      : null;
  const stockState = item ? getItemStockState(item) : 'not_applicable';
  const stockStateLabel =
    stockState === 'low_stock'
      ? t('items.detail.stockStateLow')
      : stockState === 'out_of_stock'
        ? t('items.detail.stockStateOut')
        : stockState === 'in_stock'
          ? t('items.detail.stockStateIn')
          : null;

  return (
    <PageShell title={t('items.detail.title')} description={t('items.detail.pageDescription')}>
      {itemQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {itemQuery.isError ? <ErrorState message={t('items.detail.loadError')} onRetry={() => itemQuery.refetch()} /> : null}
      {item ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <CardDescription className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('items.detail.itemLabel')}</CardDescription>
                  <CardTitle className="text-2xl">{item.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{item.code ?? t('items.detail.noCode')}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{kindLabel}</Badge>
                    <Badge variant="outline">{usageLabel}</Badge>
                    {item.usageType === 'returnable' ? <Badge variant="secondary">{returnPolicyLabel}</Badge> : null}
                    {stockStateLabel ? <Badge variant={stockState === 'out_of_stock' ? 'destructive' : stockState === 'low_stock' ? 'outline' : 'secondary'}>{stockStateLabel}</Badge> : null}
                    {item.kind === 'bulk' ? <Badge variant="outline">{t('items.detail.quantity')}: {item.quantity ?? 1}</Badge> : null}
                    <StatusBadge status={item.status} />
                    {container ? (
                      <Badge variant="secondary">
                        {t('items.detail.containerPrefix')}: {container.code}
                        {container.name ? ` · ${container.name}` : ''}
                      </Badge>
                    ) : null}
                    {holder ? (
                      <Badge variant="outline">
                        {t('items.detail.holderPrefix')}: {holder.user.name}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                    {t('items.detail.edit')}
                  </Button>
                  {canMove ? (
                    <Button variant="outline" size="sm" onClick={() => setOpenAction('move')}>
                      {t('items.detail.move')}
                    </Button>
                  ) : null}
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-2">
                {canTakeOut ? (
                  <Button size="sm" onClick={() => setOpenAction('takeout')}>
                    {t('items.detail.takeOut')}
                  </Button>
                ) : null}
                {canReturn ? (
                  <Button size="sm" onClick={() => setOpenAction('return')}>
                    {t('items.detail.return')}
                  </Button>
                ) : null}
                {canConsumeStock ? (
                  <Button size="sm" onClick={() => setOpenAction('consume')}>
                    {t('items.stock.consumeSubmit')}
                  </Button>
                ) : null}
                {canRestockStock ? (
                  <Button variant="outline" size="sm" onClick={() => setOpenAction('restock')}>
                    {t('items.stock.restockSubmit')}
                  </Button>
                ) : null}
                {canMarkMissing ? (
                  <Button variant="outline" size="sm" onClick={() => setOpenAction('missing')}>
                    {t('items.detail.markMissing')}
                  </Button>
                ) : null}
                {canMarkFound ? (
                  <Button variant="outline" size="sm" onClick={() => setOpenAction('found')}>
                    {t('items.detail.markFound')}
                  </Button>
                ) : null}
                {canDispose ? (
                  <Button variant="destructive" size="sm" onClick={() => setOpenAction('dispose')}>
                    {t('items.detail.dispose')}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label={t('items.detail.status')} value={item.status} description={t('items.detail.statusDescription')} />
            {item.usageType === 'consumable' ? (
              <StatCard
                label={t('items.detail.stockState')}
                value={stockStateLabel ?? t('items.detail.stockStateIn')}
                description={
                  stockState === 'out_of_stock'
                    ? t('items.detail.stockStateOut')
                    : stockState === 'low_stock'
                      ? t('items.detail.stockStateLow')
                      : t('items.detail.stockStateIn')
                }
              />
            ) : (
              <StatCard
                label={t('items.detail.usageType')}
                value={usageLabel}
                description={t('items.detail.usageTypeReturnable')}
              />
            )}
            {item.usageType === 'returnable' ? (
              <StatCard
                label={t('items.detail.returnPolicy')}
                value={returnPolicyLabel}
                description={item.returnPolicy === 'due' ? t('items.detail.returnPolicyDueDescription') : t('items.detail.returnPolicyIndefiniteDescription')}
              />
            ) : null}
            {returnDueLabel ? <StatCard label={t('items.detail.returnDue')} value={returnDueLabel} description={t('items.detail.returnDueDescription')} /> : null}
            <StatCard
              label={t('items.detail.containerPrefix')}
              value={item.containerId ?? t('items.detail.noContainer')}
              description={item.containerId ? t('items.detail.containerStatusDescription') : t('items.detail.containerStatusEmpty')}
            />
            <StatCard
              label={t('items.detail.holderPrefix')}
              value={item.currentHolderId ?? t('items.detail.noHolder')}
              description={item.currentHolderId ? t('items.detail.holderStatusDescription') : t('items.detail.holderStatusEmpty')}
            />
          </div>

          <Card>
            <CardContent className="space-y-3 p-6">
              <CardTitle className="text-base">{t('items.detail.metadata')}</CardTitle>
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">{t('items.detail.kind')}</p>
                  <p className="font-medium">{kindLabel}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('items.detail.usageType')}</p>
                  <p className="font-medium">{usageLabel}</p>
                </div>
                {item.usageType === 'returnable' ? (
                  <div>
                    <p className="text-muted-foreground">{t('items.detail.returnPolicy')}</p>
                    <p className="font-medium">{returnPolicyLabel}</p>
                  </div>
                ) : null}
                {item.usageType === 'returnable' && item.returnPolicy === 'due' ? (
                  <div>
                    <p className="text-muted-foreground">{t('items.detail.returnDays')}</p>
                    <p className="font-medium">{t('items.detail.returnDaysValue', undefined, { days: item.returnDays ?? 7 })}</p>
                  </div>
                ) : null}
                {returnDueLabel ? (
                  <div>
                    <p className="text-muted-foreground">{t('items.detail.returnDue')}</p>
                    <p className="font-medium">{returnDueLabel}</p>
                  </div>
                ) : null}
                <div>
                  <p className="text-muted-foreground">{t('items.detail.quantity')}</p>
                  <p className="font-medium">{item.kind === 'bulk' ? item.quantity ?? 1 : 1}</p>
                </div>
                {item.kind === 'bulk' && item.usageType === 'consumable' ? (
                  <div>
                    <p className="text-muted-foreground">{t('items.detail.reorderPoint')}</p>
                    <p className="font-medium">{item.reorderPoint ?? 5}</p>
                  </div>
                ) : null}
                <div>
                  <p className="text-muted-foreground">{t('items.detail.workspace')}</p>
                  <p className="font-medium">{workspace?.name ?? item.workspaceId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('items.detail.updated')}</p>
                  <p className="font-medium">{formatDateTime(locale, item.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('items.detail.created')}</p>
                  <p className="font-medium">{formatDateTime(locale, item.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('items.detail.description')}</p>
                  <p className="font-medium">{item.description ?? t('items.detail.noDescription')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ItemEditDialog wsId={wsId} item={item} open={editOpen} onOpenChange={setEditOpen} />
          <ItemActionDialogs wsId={wsId} item={item} openAction={openAction} onOpenActionChange={setOpenAction} />
        </div>
      ) : null}
      {eventsQuery.data ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1">
              <CardTitle className="text-base">{t('items.detail.activity')}</CardTitle>
              <CardDescription>{t('items.detail.recentActions')}</CardDescription>
            </div>
            {eventsQuery.data.length > 0 ? (
              <div className="space-y-3">
                {eventsQuery.data.map((event) => (
                  <div key={event.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <p className="font-medium">{eventLabels[event.type] ?? event.type}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(locale, event.createdAt)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.actor.name}</p>
                    {event.payload ? (
                      <p className="mt-2 text-xs text-muted-foreground">{JSON.stringify(event.payload)}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title={t('items.detail.noActivityTitle')} description={t('items.detail.noActivityDescription')} />
            )}
          </CardContent>
        </Card>
      ) : null}
    </PageShell>
  );
}
