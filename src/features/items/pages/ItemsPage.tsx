import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Popconfirm } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { useI18n } from '@/hooks/useI18n';
import { EditIcon, FilterIcon, ItemIcon, OpenIcon, PlusIcon } from '@/components/ui/icons';
import { CreateItemDialog } from '@/features/items/components/CreateItemDialog';
import { UpdateItemDialog } from '@/features/items/components/UpdateItemDialog';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { ROUTES } from '@/constants/routes';
import type { Item } from '@/types/domain.types';
import { useDeleteItem, useItems } from '@/features/items/hooks/useItems';

interface ItemFilters {
  search: string;
  status: string;
  kind: string;
  containerId: string;
}

const DEFAULT_FILTERS: ItemFilters = {
  search: '',
  status: '',
  kind: '',
  containerId: '',
};

interface ItemCardActionsProps {
  wsId: string;
  item: Item;
  onEdit: (item: Item) => void;
}

function ItemCardActions({ wsId, item, onEdit }: ItemCardActionsProps) {
  const { t } = useI18n();
  const deleteItem = useDeleteItem(wsId, item.id);

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(item)} className="rounded-full">
        <EditIcon className="h-4 w-4" />
        {t('common.edit', 'แก้ไข')}
      </Button>
      <Popconfirm
        title={t('items.detail.deleteConfirmTitle', 'Delete this item?')}
        description={t('items.detail.deleteConfirmDescription', 'This will remove the item from the workspace.')}
        okText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        okButtonProps={{ danger: true }}
        onConfirm={async () => {
          await deleteItem.mutateAsync();
        }}
      >
        <Button variant="destructive" size="sm" disabled={deleteItem.isPending} className="rounded-full">
          {deleteItem.isPending ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
        </Button>
      </Popconfirm>
    </div>
  );
}

export function ItemsPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t } = useI18n();
  const [filters, setFilters] = useState<ItemFilters>(DEFAULT_FILTERS);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);

  const itemsQuery = useItems(wsId, {
    q: filters.search.trim() || undefined,
    status: filters.status || undefined,
    kind: filters.kind || undefined,
    containerId: filters.containerId || undefined,
    page: 1,
    limit: 100,
  });
  const containersQuery = useContainers(wsId);
  const items = itemsQuery.data?.items ?? [];
  const containers = containersQuery.data ?? [];
  const hasActiveFilters = Object.values(filters).some((value) => value.trim().length > 0);

  const containerNameById = useMemo(
    () => new Map(containers.map((container) => [container.id, container.name])),
    [containers],
  );
  const containerOptions = useMemo(
    () => containers.map((container) => ({ value: container.id, label: container.name })),
    [containers],
  );

  return (
    <PageShell
      title={t('items.list.title', 'Items')}
      description={t('items.list.description', 'Create and manage items inside the active workspace.')}
      actions={(
        <Button className="w-full sm:w-auto" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          {t('items.list.create', 'Create item')}
        </Button>
      )}
    >
      {itemsQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {itemsQuery.isError ? <ErrorState message={t('items.list.error', 'Unable to load items.')} onRetry={() => itemsQuery.refetch()} /> : null}

      <Card className="shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('items.list.filters.title', 'Search and filter')}</p>
                <p className="text-xs text-muted-foreground">{t('items.list.filters.description', 'Search by item name, code, kind, status, or container')}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              disabled={!hasActiveFilters}
            >
              {t('items.list.clearFilters', 'Clear filters')}
            </Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
            <Input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder={t('items.list.searchPlaceholder', 'Search item name or code')}
              allowClear
              className="rounded-full"
            />

            <Select
              className="w-full"
              value={filters.kind || undefined}
              onChange={(event) => setFilters((current) => ({ ...current, kind: event.target.value }))}
              placeholder={t('items.list.allKinds', 'All kinds')}
            >
              <option value="single">{t('items.kind.single', 'Individual Item')}</option>
              <option value="stock">{t('items.kind.stock', 'Quantity Item')}</option>
            </Select>

            <Select
              className="w-full"
              value={filters.status || undefined}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              placeholder={t('items.list.allStatuses', 'All statuses')}
            >
              <option value="stored">{t('items.status.stored', 'Stored')}</option>
              <option value="taken_out">{t('items.status.taken_out', 'Taken out')}</option>
              <option value="reserved">{t('items.status.reserved', 'Reserved')}</option>
              <option value="missing">{t('items.status.missing', 'Missing')}</option>
              <option value="repair">{t('items.status.repair', 'Repair')}</option>
              <option value="disposed">{t('items.status.disposed', 'Disposed')}</option>
            </Select>

            <Select
              className="w-full"
              value={filters.containerId || undefined}
              onChange={(event) => setFilters((current) => ({ ...current, containerId: event.target.value }))}
              placeholder={t('items.list.allContainers', 'All containers')}
            >
              <option value="">{t('items.list.allContainers', 'All containers')}</option>
              {containerOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-[18px] md:grid-cols-3">
        <StatCard label={t('items.list.count', 'Items')} value={items.length} />
        <StatCard label={t('items.list.stockCount', 'Stock items')} value={items.filter((item) => item.kind === 'stock').length} />
        <StatCard label={t('items.list.withContainers', 'In containers')} value={items.filter((item) => item.containerId).length} />
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? t('items.list.filteredEmptyTitle', 'No items match the current filters') : t('items.list.emptyTitle', 'No items yet')}
          description={hasActiveFilters ? t('items.list.filteredEmptyDescription', 'Try clearing filters or change the search term.') : t('items.list.emptyDescription', 'Create the first item to begin tracking.')}
          icon={<ItemIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription>{item.code ?? item.id}</CardDescription>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>{t('items.detail.kind', 'Type')}: {item.kind === 'stock' ? t('items.kind.stock', 'Quantity Item') : t('items.kind.single', 'Individual Item')}</div>
                  <div>{t('items.detail.status', 'Status')}: {item.status}</div>
                  <div>{t('items.detail.containerPrefix', 'Container')}: {item.containerId ? (containerNameById.get(item.containerId) ?? item.containerId) : '-'}</div>
                  <div>{t('items.detail.holderPrefix', 'Holder')}: {item.currentHolderId ?? '-'}</div>
                </div>
                <ItemCardActions wsId={wsId} item={item} onEdit={setEditItem} />
                <Button asChild variant="outline" size="sm" className="w-full rounded-full sm:w-auto">
                  <Link to={ROUTES.workspaceItemDetail(wsId, item.id)}>
                    <OpenIcon className="h-4 w-4" />
                    {t('items.list.open', 'Open')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateItemDialog wsId={wsId} open={createOpen} onOpenChange={setCreateOpen} />
      {editItem ? (
        <UpdateItemDialog
          wsId={wsId}
          item={editItem}
          open={Boolean(editItem)}
          onOpenChange={(open) => {
            if (!open) {
              setEditItem(null);
            }
          }}
        />
      ) : null}
    </PageShell>
  );
}
