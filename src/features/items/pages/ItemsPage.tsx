import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Input, Segmented } from 'antd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ItemFormDialog } from '@/features/items/components/ItemFormDialog';
import { ItemActionDialogs, type ItemActionDialogsProps } from '@/features/items/components/ItemActionDialogs';
import { ItemEditDialog } from '@/features/items/components/ItemEditDialog';
import { useSearchItems } from '@/features/items/hooks/useItems';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { useMembers } from '@/features/members/hooks/useMembers';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { ContainerIcon, EditIcon, FilterIcon, ItemIcon, MemberIcon, OpenIcon, PlusIcon, ReturnIcon, SearchIcon, TakeOutIcon } from '@/components/ui/icons';
import type { Item } from '@/types/domain.types';
import { getItemStockState } from '@/lib/item-stock';

export function ItemsPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useI18n();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [actionItem, setActionItem] = useState<Item | null>(null);
  const [openAction, setOpenAction] = useState<ItemActionDialogsProps['openAction']>(null);

  const queryText = searchParams.get('q') ?? '';
  const filterStatus = searchParams.get('status');
  const filterStock = searchParams.get('stock');
  const filterUsageType = searchParams.get('usageType');
  const [draftQuery, setDraftQuery] = useState(queryText);
  const itemsQuery = useSearchItems(wsId, {
    q: queryText,
    status: filterStatus ?? undefined,
    usageType: filterUsageType ?? undefined,
    page: 1,
    limit: 200,
  });
  const containersQuery = useContainers(wsId);
  const membersQuery = useMembers(wsId);

  useEffect(() => {
    setDraftQuery(queryText);
  }, [queryText]);

  useEffect(() => {
    const normalizedQuery = draftQuery.trim();
    const timeoutId = window.setTimeout(() => {
      if (normalizedQuery === queryText) {
        return;
      }

      setSearchParams((previousParams) => {
        const nextParams = new URLSearchParams(previousParams);
        if (normalizedQuery) {
          nextParams.set('q', normalizedQuery);
        } else {
          nextParams.delete('q');
        }
        return nextParams;
      }, { replace: true });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [draftQuery, queryText, setSearchParams]);

  function updateItemParams(updates: Record<string, string | undefined>) {
    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
          nextParams.delete(key);
        } else {
          nextParams.set(key, value);
        }
      });
      return nextParams;
    }, { replace: true });
  }

  const filteredItems = useMemo(() => {
    return (itemsQuery.data?.data ?? []).filter((item) => {
      if (filterStock === 'low') {
        return getItemStockState(item) === 'low_stock';
      }

      if (filterStock === 'out') {
        return getItemStockState(item) === 'out_of_stock';
      }

      return true;
    });
  }, [filterStock, itemsQuery.data?.data]);
  const containerMap = useMemo(() => new Map((containersQuery.data ?? []).map((container) => [container.id, container])), [containersQuery.data]);
  const holderMap = useMemo(() => new Map((membersQuery.data ?? []).map((member) => [member.id, member])), [membersQuery.data]);
  const kindLabel = (kind: Item['kind']) => (kind === 'single' ? t('items.detail.kindSingle') : t('items.detail.kindBulk'));
  const usageLabel = (usageType: Item['usageType']) =>
    usageType === 'consumable' ? t('items.detail.usageTypeConsumable') : t('items.detail.usageTypeReturnable');
  const returnPolicyLabel = () => t('items.detail.noReturnRequired');
  const activeActionItem = actionItem && openAction ? actionItem : null;
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="border-border/70 bg-card/95 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl tracking-tight sm:text-2xl">{t('items.list.title')}</CardTitle>
              <CardDescription className="max-w-2xl">{t('items.list.description')}</CardDescription>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="rounded-full">
              <PlusIcon className="h-4 w-4" />
              {t('items.list.create')}
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <Input
              size="large"
              prefix={<SearchIcon className="h-4 w-4 text-muted-foreground" />}
              aria-label={t('search.placeholder')}
              placeholder={t('search.placeholder')}
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
            />
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <Badge variant="secondary">{t('items.list.count')}: {filteredItems.length}</Badge>
              {queryText ? <Badge variant="outline">{queryText}</Badge> : null}
              {queryText || filterStatus || filterStock || filterUsageType ? (
                <Button variant="outline" size="sm" onClick={() => setSearchParams({})}>
                  <FilterIcon className="h-4 w-4" />
                  {t('search.clear')}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('search.all')}</p>
              <Segmented
                className="w-full"
                value={filterStatus ?? 'all'}
                options={[
                  { label: t('search.all'), value: 'all' },
                  { label: t('dashboard.stored'), value: 'stored' },
                  { label: t('dashboard.takenOut'), value: 'taken_out' },
                  { label: t('dashboard.missing'), value: 'missing' },
                ]}
                onChange={(value) => updateItemParams({ status: value === 'all' ? undefined : String(value) })}
              />
            </div>
            <div className="min-w-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('items.list.status')}</p>
              <Segmented
                className="w-full"
                value={filterStock ?? 'all'}
                options={[
                  { label: t('search.all'), value: 'all' },
                  { label: t('dashboard.lowStock'), value: 'low' },
                  { label: t('dashboard.outOfStock'), value: 'out' },
                ]}
                onChange={(value) => updateItemParams({ stock: value === 'all' ? undefined : String(value) })}
              />
            </div>
            <div className="min-w-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('search.usageType')}</p>
              <Segmented
                className="w-full"
                value={filterUsageType ?? 'all'}
                options={[
                  { label: t('search.all'), value: 'all' },
                  { label: t('items.detail.usageTypeConsumable'), value: 'consumable' },
                  { label: t('items.detail.usageTypeReturnable'), value: 'returnable' },
                ]}
                onChange={(value) => updateItemParams({ usageType: value === 'all' ? undefined : String(value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {itemsQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {itemsQuery.isError ? <ErrorState message={t('items.detail.loadError')} onRetry={() => itemsQuery.refetch()} /> : null}

      {!itemsQuery.isLoading && filteredItems.length === 0 ? (
        <EmptyState
          title={t('items.list.emptyTitle')}
          description={t('items.list.emptyDescription')}
          actionLabel={t('items.list.create')}
          onAction={() => setCreateOpen(true)}
          icon={<ItemIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const container = item.containerId ? containerMap.get(item.containerId) : null;
            const holder = item.currentHolderId ? holderMap.get(item.currentHolderId) : null;
            const itemQuantity = item.kind === 'stock' ? item.quantity ?? 1 : 1;
            return (
              <Card key={item.id} className="border-border/70 bg-card/95 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg sm:text-xl">{item.name}</CardTitle>
                      <Badge variant="outline">{item.code ?? t('items.detail.noCode')}</Badge>
                      <Badge variant="secondary">
                        {t('items.detail.quantity')}: {itemQuantity}
                      </Badge>
                      <StatusBadge status={item.status} />
                    </div>

                    <CardDescription className="max-w-3xl leading-6">
                      {item.description ?? t('items.detail.noDescription')}
                    </CardDescription>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {kindLabel(item.kind)}
                        {item.kind === 'stock' && item.quantity ? ` · ${item.quantity}` : ''}
                      </Badge>
                      <Badge variant="secondary">{usageLabel(item.usageType)}</Badge>
                      {item.usageType === 'returnable' ? <Badge variant="outline">{returnPolicyLabel()}</Badge> : null}
                      {item.usageType === 'consumable' && item.kind === 'stock' ? (
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

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <ContainerIcon className="h-4 w-4 shrink-0" />
                        <span>
                          {t('items.list.container')}: {container?.name ?? t('items.detail.noContainer')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MemberIcon className="h-4 w-4 shrink-0" />
                        <span>
                          {t('items.list.holder')}: {holder?.user.name ?? t('items.detail.noHolder')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                    <Button asChild variant="outline" size="sm" className="h-10 rounded-full px-4">
                      <Link to={ROUTES.workspaceItemDetail(wsId, item.code ?? item.id)}>
                        <OpenIcon className="h-4 w-4" />
                        {t('items.list.open')}
                      </Link>
                    </Button>
                    {item.status === 'stored' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-full px-4"
                        onClick={() => {
                          setActionItem(item);
                          setOpenAction('takeout');
                        }}
                      >
                        <TakeOutIcon className="h-4 w-4" />
                        {t('items.detail.takeOut')}
                      </Button>
                    ) : item.usageType === 'returnable' && item.status === 'taken_out' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-full px-4"
                        onClick={() => {
                          setActionItem(item);
                          setOpenAction('return');
                        }}
                      >
                        <ReturnIcon className="h-4 w-4" />
                        {t('items.detail.return')}
                      </Button>
                    ) : null}
                    <Button variant="outline" size="sm" className="h-10 rounded-full px-4" onClick={() => setEditItem(item)}>
                      <EditIcon className="h-4 w-4" />
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
      {activeActionItem ? (
        <ItemActionDialogs
          wsId={wsId}
          item={activeActionItem}
          openAction={openAction}
          onOpenActionChange={(action) => {
            setOpenAction(action);
            if (!action) {
              setActionItem(null);
            }
          }}
        />
      ) : null}
      {editItem ? (
        <ItemEditDialog wsId={wsId} item={editItem} open={Boolean(editItem)} onOpenChange={(open) => !open && setEditItem(null)} />
      ) : null}
    </div>
  );
}
