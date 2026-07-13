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
import { useAssets, useDeleteAsset } from '@/features/assets/hooks/useAssets';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { useProducts } from '@/features/products/hooks/useProducts';
import { CreateItemDialog } from '@/features/items/components/CreateItemDialog';
import { ROUTES } from '@/constants/routes';
import { UpdateItemDialog } from '@/features/items/components/UpdateItemDialog';
import type { Asset } from '@/types/domain.types';

interface ItemCardActionsProps {
  wsId: string;
  asset: Asset;
  onEdit: (asset: Asset) => void;
}

interface ItemFilters {
  search: string;
  status: string;
  productId: string;
  locationId: string;
  containerId: string;
}

const DEFAULT_FILTERS: ItemFilters = {
  search: '',
  status: '',
  productId: '',
  locationId: '',
  containerId: '',
};

function ItemCardActions({ wsId, asset, onEdit }: ItemCardActionsProps) {
  const { t } = useI18n();
  const deleteAsset = useDeleteAsset(wsId, asset.id);

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(asset)} className="rounded-full">
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
          await deleteAsset.mutateAsync();
        }}
      >
        <Button variant="destructive" size="sm" disabled={deleteAsset.isPending} className="rounded-full">
          {deleteAsset.isPending ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
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
  const [editAsset, setEditAsset] = useState<Asset | null>(null);

  const assetsParams = useMemo(() => ({
    search: filters.search.trim() || undefined,
    status: filters.status || undefined,
    productId: filters.productId || undefined,
    locationId: filters.locationId || undefined,
    containerId: filters.containerId || undefined,
  }), [filters.containerId, filters.locationId, filters.productId, filters.search, filters.status]);
  const catalogParams = useMemo(() => ({ pageSize: 1000 }), []);

  const assetsQuery = useAssets(wsId, assetsParams);
  const catalogAssetsQuery = useAssets(wsId, catalogParams);
  const productsQuery = useProducts(wsId);
  const containersQuery = useContainers(wsId);

  const assets = assetsQuery.data ?? [];
  const catalogAssets = catalogAssetsQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const containers = containersQuery.data ?? [];

  const hasActiveFilters = Object.values(filters).some((value) => value.trim().length > 0);

  const locationOptions = useMemo(() => {
    const map = new Map<string, string>();

    for (const asset of catalogAssets) {
      if (!asset.locationId) {
        continue;
      }
      map.set(asset.locationId, asset.locationName ?? asset.locationId);
    }

    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [catalogAssets]);

  const containerOptions = useMemo(
    () => containers.map((container) => ({ value: container.id, label: container.name })),
    [containers],
  );

  const productOptions = useMemo(
    () => products.map((product) => ({ value: product.id, label: product.name })),
    [products],
  );

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

      <Card className="shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('items.list.filters.title', 'ค้นหาและกรอง')}</p>
                <p className="text-xs text-muted-foreground">{t('items.list.filters.description', 'ค้นหา item และจำกัดผลลัพธ์ตามสถานะ ตำแหน่ง หรือ container')}</p>
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
              {t('items.list.clearFilters', 'ล้างตัวกรอง')}
            </Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-5">
            <Input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder={t('items.list.searchPlaceholder', 'ค้นหาชื่อสินค้า, serial, barcode')}
              allowClear
              className="rounded-full"
            />

            <Select
              className="w-full"
              value={filters.status || undefined}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              placeholder={t('items.list.allStatuses', 'ทุกสถานะ')}
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
              value={filters.productId || undefined}
              onChange={(event) => setFilters((current) => ({ ...current, productId: event.target.value }))}
              placeholder={t('items.list.allProducts', 'ทุกสินค้า')}
            >
              {productOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>

            <Select
              className="w-full"
              value={filters.locationId || undefined}
              onChange={(event) => setFilters((current) => ({ ...current, locationId: event.target.value }))}
              placeholder={t('items.list.allLocations', 'ทุก location')}
            >
              {locationOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>

            <Select
              className="w-full"
              value={filters.containerId || undefined}
              onChange={(event) => setFilters((current) => ({ ...current, containerId: event.target.value }))}
              placeholder={t('items.list.allContainers', 'ทุก container')}
            >
              {containerOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-[18px] md:grid-cols-3">
        <StatCard label={t('items.list.count')} value={assets.length} />
        <StatCard label={t('items.list.totalProducts', 'สินค้า')} value={new Set(assets.map((asset) => asset.productId)).size} />
        <StatCard label={t('items.list.withContainers', 'ใน container')} value={assets.filter((asset) => asset.containerId).length} />
      </div>

      {assets.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? t('items.list.filteredEmptyTitle', 'ไม่พบ item ที่ตรงกับตัวกรอง') : t('items.list.emptyTitle')}
          description={hasActiveFilters ? t('items.list.filteredEmptyDescription', 'ลองล้างตัวกรองหรือเปลี่ยนคำค้นหาเพื่อดูรายการอื่น') : t('items.list.emptyDescription')}
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
                <ItemCardActions wsId={wsId} asset={asset} onEdit={setEditAsset} />
                <Button asChild variant="outline" size="sm" className="w-full rounded-full sm:w-auto">
                  <Link to={ROUTES.workspaceItemDetail(wsId, asset.id)}>
                    <OpenIcon className="h-4 w-4" />
                    {t('items.list.open')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateItemDialog wsId={wsId} open={createOpen} onOpenChange={setCreateOpen} />
      {editAsset ? (
        <UpdateItemDialog
          wsId={wsId}
          asset={editAsset}
          open={Boolean(editAsset)}
          onOpenChange={(open) => {
            if (!open) {
              setEditAsset(null);
            }
          }}
        />
      ) : null}
    </PageShell>
  );
}
