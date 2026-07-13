import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { Descriptions, Divider, Space, Tag, Typography } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useItem, useItemEvents } from '@/features/items/hooks/useItems';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { useMembers } from '@/features/members/hooks/useMembers';
import { useWorkspace } from '@/features/workspaces/hooks/useWorkspace';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ItemEditDialog } from '@/features/items/components/ItemEditDialog';
import { ItemActionDialogs } from '@/features/items/components/ItemActionDialogs';
import { usePermission } from '@/hooks/usePermission';
import { useI18n } from '@/hooks/useI18n';
import { getItemStockState } from '@/lib/item-stock';
import { ContainerIcon, EditIcon, MemberIcon } from '@/components/ui/icons';

function formatDateTime(locale: 'en' | 'th', value: string) {
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function ItemDetailPage() {
  const { wsId = 'ws-warehouse', itemCode = '' } = useParams();
  const itemQuery = useItem(wsId, itemCode);
  const [editOpen, setEditOpen] = useState(false);
  const [openAction, setOpenAction] = useState<'move' | 'takeout' | 'return' | 'missing' | 'found' | 'dispose' | 'consume' | 'restock' | null>(null);
  const { can } = usePermission();
  const { t, locale } = useI18n();

  const item = itemQuery.data;
  const eventsQuery = useItemEvents(wsId, item?.id ?? '');
  const containersQuery = useContainers(wsId);
  const membersQuery = useMembers(wsId);
  const workspaceQuery = useWorkspace(wsId);
  const canMove = can('item.move') && item?.status !== 'disposed';
  const canTakeOut = can('item.borrow') && item?.status === 'stored';
  const canReturn = can('item.return') && item?.status === 'taken_out' && item?.usageType === 'returnable';
  const canConsumeStock = Boolean(item && item.kind === 'stock' && item.usageType === 'consumable' && item.status !== 'disposed' && (item.quantity ?? 0) > 0);
  const canRestockStock = Boolean(item && item.kind === 'stock' && item.usageType === 'consumable');
  const canMarkMissing = can('item.mark_missing') && item?.status !== 'disposed';
  const canMarkFound = can('item.mark_found') && item?.status === 'missing';
  const canDispose = can('item.dispose') && item?.status !== 'disposed';

  const eventLabels: Record<string, string> = {
    created: t('items.event.created'),
    updated: t('items.event.updated'),
    moved: t('items.event.moved'),
    borrowed: t('items.event.takenOut'),
    withdrawn: t('dashboard.event.withdrawn'),
    returned: t('items.event.returned'),
    stock_used: t('dashboard.event.stockUsed'),
    stock_restocked: t('dashboard.event.stockRestocked'),
    marked_missing: t('items.event.markedMissing'),
    marked_found: t('items.event.markedFound'),
    disposed: t('items.event.disposed'),
  };
  const container = item?.containerId ? containersQuery.data?.find((entry) => entry.id === item.containerId) : null;
  const holder = item?.currentHolderId ? membersQuery.data?.find((entry) => entry.id === item.currentHolderId) : null;
  const workspace = workspaceQuery.data ?? null;
  const kindLabel = item?.kind === 'stock' ? t('items.detail.kindBulk') : t('items.detail.kindSingle');
  const usageLabel = item?.usageType === 'consumable' ? t('items.detail.usageTypeConsumable') : t('items.detail.usageTypeReturnable');
  const returnPolicyLabel = item?.usageType === 'returnable' ? t('items.detail.noReturnRequired') : undefined;
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
        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-6 p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <CardDescription className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t('items.detail.itemLabel')}</CardDescription>
                    <CardTitle className="text-2xl sm:text-3xl">{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.code ?? t('items.detail.noCode')}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag color="blue">{kindLabel}</Tag>
                    <Tag>{usageLabel}</Tag>
                    {returnPolicyLabel ? <Tag>{returnPolicyLabel}</Tag> : null}
                    {stockStateLabel ? <Tag color={stockState === 'out_of_stock' ? 'red' : stockState === 'low_stock' ? 'gold' : 'green'}>{stockStateLabel}</Tag> : null}
                    {item.kind === 'stock' ? <Tag>{t('items.detail.quantity')}: {item.quantity ?? 1}</Tag> : null}
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2 lg:justify-end">
                  <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                    <EditIcon className="h-4 w-4" />
                    {t('items.detail.edit')}
                  </Button>
                  {canMove ? (
                    <Button variant="outline" size="sm" onClick={() => setOpenAction('move')}>
                      {t('items.detail.move')}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end">
                <div className="flex flex-wrap justify-end gap-2">
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
              </div>

              <Descriptions bordered column={{ xs: 1, md: 2, xl: 3 }} size="middle">
                <Descriptions.Item label={t('items.detail.status')}>{t(`items.status.${item.status}`)}</Descriptions.Item>
                <Descriptions.Item label={t('items.detail.containerPrefix')} span={2}>
                  <Space size={8}>
                    <ContainerIcon className="h-4 w-4" />
                    <span>{container?.name ?? t('items.detail.noContainer')}</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={t('items.detail.holderPrefix')}>
                  <Space size={8}>
                    <MemberIcon className="h-4 w-4" />
                    <span>{holder?.user.name ?? t('items.detail.noHolder')}</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={t('items.detail.workspace')}>
                  {workspace?.name ?? item.workspaceId}
                </Descriptions.Item>
                <Descriptions.Item label={t('items.detail.updated')}>
                  {formatDateTime(locale, item.updatedAt)}
                </Descriptions.Item>
                <Descriptions.Item label={t('items.detail.created')}>
                  {formatDateTime(locale, item.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label={t('items.detail.quantity')}>
                  {item.kind === 'stock' ? String(item.quantity ?? 1) : '1'}
                </Descriptions.Item>
                {item.kind === 'stock' && item.usageType === 'consumable' ? (
                  <Descriptions.Item label={t('items.detail.reorderPoint')}>
                    {String(item.reorderPoint ?? 5)}
                  </Descriptions.Item>
                ) : null}
                {item.usageType === 'returnable' ? (
                  <Descriptions.Item label={t('items.detail.returnPolicy')}>
                    {returnPolicyLabel ?? t('items.detail.noReturnRequired')}
                  </Descriptions.Item>
                ) : null}
                <Descriptions.Item label={t('items.detail.description')} span={3}>
                  <Typography.Paragraph className="!mb-0 leading-6">
                    {item.description ?? t('items.detail.noDescription')}
                  </Typography.Paragraph>
                </Descriptions.Item>
              </Descriptions>
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
