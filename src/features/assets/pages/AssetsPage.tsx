import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Tag } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { DatabaseIcon, EditIcon, FilterIcon, OpenIcon, PlusIcon } from '@/components/ui/icons';
import { useAssets } from '@/features/assets/hooks/useAssets';
import { CreateAssetDialog } from '@/features/assets/components/CreateAssetDialog';
import { UpdateAssetDialog } from '@/features/assets/components/UpdateAssetDialog';
import { useDeleteAsset } from '@/features/assets/hooks/useAssets';
import { Popconfirm } from 'antd';
import type { Asset } from '@/types/domain.types';
import { useSites } from '@/features/sites/hooks/useSites';
import { useLocations } from '@/features/locations/hooks/useLocations';
import { useContainers } from '@/features/containers/hooks/useContainers';

function statusColor(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'available') return 'green';
  if (normalized === 'borrowed') return 'blue';
  if (normalized === 'missing') return 'red';
  if (normalized === 'maintenance') return 'orange';
  if (normalized === 'disposed') return 'default';
  return 'geekblue';
}

interface AssetCardActionsProps {
  wsId: string;
  asset: Asset;
  onEdit: (asset: Asset) => void;
}

interface AssetFilters {
  search: string;
  status: string;
  siteId: string;
  locationId: string;
  containerId: string;
}

const DEFAULT_FILTERS: AssetFilters = {
  search: '',
  status: '',
  siteId: '',
  locationId: '',
  containerId: '',
};

function AssetCardActions({ wsId, asset, onEdit }: AssetCardActionsProps) {
  const { t } = useI18n();
  const deleteAsset = useDeleteAsset(wsId, asset.id);

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(asset)} className="rounded-full">
        <EditIcon className="h-4 w-4" />
        {t('common.edit', 'แก้ไข')}
      </Button>
      <Popconfirm
        title={t('assets.deleteConfirmTitle', 'Delete this asset?')}
        description={t('assets.deleteConfirmDescription', 'This will remove the asset from the workspace.')}
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

export function AssetsPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t } = useI18n();
  const [filters, setFilters] = useState<AssetFilters>(DEFAULT_FILTERS);
  const assetsQuery = useAssets(wsId, {
    search: filters.search.trim() || undefined,
    status: filters.status || undefined,
    locationId: filters.locationId || undefined,
    containerId: filters.containerId || undefined,
    pageSize: 100,
  });
  const sitesQuery = useSites(wsId);
  const locationsQuery = useLocations(wsId);
  const containersQuery = useContainers(wsId);
  const assets = assetsQuery.data ?? [];
  const sites = sitesQuery.data ?? [];
  const locations = locationsQuery.data ?? [];
  const containers = containersQuery.data ?? [];
  const [createOpen, setCreateOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const hasActiveFilters = Boolean(
    filters.search.trim() || filters.status || filters.siteId || filters.locationId || filters.containerId,
  );

  const filteredLocations = filters.siteId
    ? locations.filter((location) => location.siteId === filters.siteId)
    : locations;
  const displayAssets = assets.filter((asset) => {
    const matchesSite = !filters.siteId || (asset.locationId ? filteredLocations.some((location) => location.id === asset.locationId) : false);
    return matchesSite;
  });

  const stats = [
    { label: t('assets.stats.total', 'Assets'), value: displayAssets.length },
    { label: t('assets.stats.available', 'Available'), value: displayAssets.filter((asset) => asset.status.toLowerCase() === 'available').length },
    { label: t('assets.stats.borrowed', 'Borrowed'), value: displayAssets.filter((asset) => asset.status.toLowerCase() === 'borrowed').length },
  ];

  return (
    <PageShell
      title={t('assets.title', 'Assets')}
      description={t('assets.description', 'Track individual assets, their location, status, and photos.')}
      actions={(
        <Button className="w-full sm:w-auto" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          {t('assets.create.action', 'Create asset')}
        </Button>
      )}
    >
      {assetsQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {assetsQuery.isError ? <ErrorState message={t('assets.error', 'Unable to load assets.')} onRetry={() => assetsQuery.refetch()} /> : null}

      <Card className="shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('assets.filters.title', 'Search and filter')}</p>
                <p className="text-xs text-muted-foreground">{t('assets.filters.description', 'Search by product, serial number, barcode, or filter by storage location.')}</p>
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
              {t('assets.filters.clear', 'Clear filters')}
            </Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-5">
            <Input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder={t('assets.filters.searchPlaceholder', 'Search asset')}
              className="rounded-full"
            />

            <Select
              className="w-full"
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              placeholder={t('assets.filters.allStatus', 'All status')}
            >
              <option value="">{t('assets.filters.allStatus', 'All status')}</option>
              <option value="Available">{t('assets.status.available', 'Available')}</option>
              <option value="Borrowed">{t('assets.status.borrowed', 'Borrowed')}</option>
              <option value="Missing">{t('assets.status.missing', 'Missing')}</option>
              <option value="Maintenance">{t('assets.status.maintenance', 'Maintenance')}</option>
              <option value="Disposed">{t('assets.status.disposed', 'Disposed')}</option>
            </Select>

            <Select
              className="w-full"
              value={filters.siteId}
              onChange={(event) => setFilters((current) => ({ ...current, siteId: event.target.value, locationId: '' }))}
              placeholder={t('assets.filters.allSites', 'All sites')}
            >
              <option value="">{t('assets.filters.allSites', 'All sites')}</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </Select>

            <Select
              className="w-full"
              value={filters.locationId}
              onChange={(event) => setFilters((current) => ({ ...current, locationId: event.target.value }))}
              placeholder={t('assets.filters.allLocations', 'All locations')}
            >
              <option value="">{t('assets.filters.allLocations', 'All locations')}</option>
              {filteredLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </Select>

            <Select
              className="w-full"
              value={filters.containerId}
              onChange={(event) => setFilters((current) => ({ ...current, containerId: event.target.value }))}
              placeholder={t('assets.filters.allContainers', 'All containers')}
            >
              <option value="">{t('assets.filters.allContainers', 'All containers')}</option>
              {containers.map((container) => (
                <option key={container.id} value={container.id}>
                  {container.name}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-[18px] md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      {displayAssets.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? t('assets.filteredEmptyTitle', 'No matching assets') : t('assets.emptyTitle', 'No assets yet')}
          description={hasActiveFilters ? t('assets.filteredEmptyDescription', 'Try clearing the filters or search with another term.') : t('assets.emptyDescription', 'Create the first asset after your products and locations are ready.')}
          icon={<DatabaseIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {displayAssets.map((asset) => (
            <Card key={asset.id} className="hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{asset.productName}</CardTitle>
                  <CardDescription>{asset.serialNumber ?? asset.barcode ?? asset.id}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Tag color={statusColor(asset.status)}>{asset.status}</Tag>
                  <Tag color="blue">{asset.condition}</Tag>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>{t('assets.location', 'Location')}: {asset.locationName ?? '-'}</div>
                  <div>{t('assets.container', 'Container')}: {asset.containerName ?? '-'}</div>
                  <div>{t('assets.photos', 'Photos')}: {asset.photos?.length ?? 0}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link to={ROUTES.workspaceAssetDetail(wsId, asset.id)}>
                      <OpenIcon className="h-4 w-4" />
                      {t('common.open', 'Open')}
                    </Link>
                  </Button>
                  <AssetCardActions wsId={wsId} asset={asset} onEdit={setEditAsset} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateAssetDialog wsId={wsId} open={createOpen} onOpenChange={setCreateOpen} />
      {editAsset ? (
        <UpdateAssetDialog
          wsId={wsId}
          asset={editAsset}
          open
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
