import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import { usePermission } from '@/hooks/usePermission';
import { DataTableHead, DataTableRow, DataTableShell, dataTableCellClass } from '@/components/common/DataTableShell';
import { MasterStatusBadge } from '@/components/common/MasterStatusBadge';

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
  const { can } = usePermission();
  const deleteAsset = useDeleteAsset(wsId, asset.id);

  return (
    <div className="flex flex-wrap gap-2">
      {can('asset.manage') ? <Button variant="outline" size="sm" onClick={() => onEdit(asset)} className="rounded-full">
        <EditIcon className="h-4 w-4" />
        {t('common.edit', 'แก้ไข')}
      </Button> : null}
      {can('asset.manage') ? <Popconfirm
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
      </Popconfirm> : null}
    </div>
  );
}

export function AssetsPage() {
  const { wsId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { can } = usePermission();
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
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {can('asset.manage') ? <Button className="w-full sm:w-auto" onClick={() => navigate(`${ROUTES.workspaceReceive(wsId)}?from=assets`)}>
            <PlusIcon className="h-4 w-4" />
            เพิ่มทรัพย์สิน
          </Button> : null}
        </div>
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
                <p className="text-sm font-medium">{t('assets.filters.title', 'ค้นหาและกรอง')}</p>
                <p className="text-xs text-muted-foreground">{t('assets.filters.description', 'ค้นหาและกรองตามสินค้า Serial number Barcode หรือตำแหน่งจัดเก็บ')}</p>
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
              {t('assets.filters.clear', 'ล้างตัวกรอง')}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="min-w-0 space-y-1"><label className="block text-xs font-medium text-muted-foreground">ค้นหา (สินค้า/Serial/Barcode)</label><Input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder={t('assets.filters.searchPlaceholder', 'ค้นหาทรัพย์สิน')} className="w-full rounded-full" /></div>

            <div className="min-w-0 space-y-1"><label className="block text-xs font-medium text-muted-foreground">สถานะทรัพย์สิน</label><Select
              className="w-full"
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              placeholder={t('assets.filters.allStatus', 'ทุกสถานะ')}
            >
              <option value="">{t('assets.filters.allStatus', 'ทุกสถานะ')}</option>
              <option value="Available">{t('assets.status.available', 'พร้อมใช้งาน')}</option>
              <option value="Borrowed">{t('assets.status.borrowed', 'ถูกยืมอยู่')}</option>
              <option value="Missing">{t('assets.status.missing', 'สูญหาย')}</option>
              <option value="Maintenance">{t('assets.status.maintenance', 'อยู่ระหว่างซ่อม')}</option>
              <option value="Disposed">{t('assets.status.disposed', 'จำหน่ายแล้ว')}</option>
            </Select></div>

            <div className="min-w-0 space-y-1"><label className="block text-xs font-medium text-muted-foreground">สถานที่</label><Select
              className="w-full"
              value={filters.siteId}
              onChange={(event) => setFilters((current) => ({ ...current, siteId: event.target.value, locationId: '' }))}
              placeholder={t('assets.filters.allSites', 'ทุกสถานที่')}
            >
              <option value="">{t('assets.filters.allSites', 'ทุกสถานที่')}</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </Select></div>

            <div className="min-w-0 space-y-1"><label className="block text-xs font-medium text-muted-foreground">ตำแหน่งจัดเก็บ</label><Select
              className="w-full"
              value={filters.locationId}
              onChange={(event) => setFilters((current) => ({ ...current, locationId: event.target.value }))}
              placeholder={t('assets.filters.allLocations', 'ทุกตำแหน่งจัดเก็บ')}
            >
              <option value="">{t('assets.filters.allLocations', 'ทุกตำแหน่งจัดเก็บ')}</option>
              {filteredLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </Select></div>

            <div className="min-w-0 space-y-1"><label className="block text-xs font-medium text-muted-foreground">ภาชนะจัดเก็บ</label><Select
              className="w-full"
              value={filters.containerId}
              onChange={(event) => setFilters((current) => ({ ...current, containerId: event.target.value }))}
              placeholder={t('assets.filters.allContainers', 'ทุกภาชนะจัดเก็บ')}
            >
              <option value="">{t('assets.filters.allContainers', 'ทุกภาชนะจัดเก็บ')}</option>
              {containers.map((container) => (
                <option key={container.id} value={container.id}>
                  {container.name}
                </option>
              ))}
            </Select></div>
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
        <DataTableShell minWidth="min-w-[800px]"><DataTableHead><th className={dataTableCellClass}>สินค้า</th><th className={dataTableCellClass}>สถานะ</th><th className={dataTableCellClass}>สภาพ</th><th className={dataTableCellClass}>จุดจัดเก็บ</th><th className={`${dataTableCellClass} text-right`}>จัดการ</th></DataTableHead><tbody>{displayAssets.map((asset) => <DataTableRow key={asset.id}><td className={`${dataTableCellClass} font-medium`}>{asset.productName}</td><td className={dataTableCellClass}><MasterStatusBadge status={asset.status} kind="asset" /></td><td className={`${dataTableCellClass} text-muted-foreground`}>{asset.condition}</td><td className={`${dataTableCellClass} text-muted-foreground`}>{asset.containerName ?? asset.locationName ?? '-'}</td><td className={`${dataTableCellClass} text-right`}><Button asChild variant="outline" size="sm" className="rounded-full"><Link to={ROUTES.workspaceAssetDetail(wsId, asset.id)}><OpenIcon className="h-4 w-4" />ดูรายละเอียด</Link></Button></td></DataTableRow>)}</tbody></DataTableShell>
      )}

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
