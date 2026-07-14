import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Popconfirm, Tag } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { useAsset, useDeleteAsset } from '@/features/assets/hooks/useAssets';
import { AssetPhotoManager } from '@/features/assets/components/AssetPhotoManager';
import { UpdateAssetDialog } from '@/features/assets/components/UpdateAssetDialog';
import { CreateBorrowOrderDialog } from '@/features/borrow-orders/components/CreateBorrowOrderDialog';
import { EditIcon, OpenIcon, TakeOutIcon } from '@/components/ui/icons';

function statusColor(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'available') return 'green';
  if (normalized === 'borrowed') return 'blue';
  if (normalized === 'missing') return 'red';
  if (normalized === 'maintenance') return 'orange';
  if (normalized === 'disposed') return 'default';
  return 'geekblue';
}

export function AssetDetailPage() {
  const { wsId = 'ws-warehouse', assetId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const assetQuery = useAsset(wsId, assetId);
  const asset = assetQuery.data ?? null;
  const deleteAsset = useDeleteAsset(wsId, assetId);
  const [editOpen, setEditOpen] = useState(false);
  const [borrowOpen, setBorrowOpen] = useState(false);

  const photoCount = asset?.photos?.length ?? 0;
  const mainPhoto = useMemo(
    () => asset?.photos?.find((photo) => photo.isMain) ?? asset?.photos?.[0] ?? null,
    [asset?.photos],
  );

  return (
    <PageShell
      title={t('assets.detail.title', 'Asset detail')}
      description={t('assets.detail.description', 'View the asset, update storage data, and manage photos.')}
      actions={(
        <Button variant="outline" onClick={() => navigate(ROUTES.workspaceAssets(wsId))}>
          <OpenIcon className="h-4 w-4" />
          {t('assets.detail.back', 'Back to list')}
        </Button>
      )}
    >
      {assetQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {assetQuery.isError ? <ErrorState message={t('assets.detail.error', 'Unable to load asset.')} onRetry={() => assetQuery.refetch()} /> : null}

      {asset ? (
        <div className="component-stack">
          <Card>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{asset.productName}</CardTitle>
                  <CardDescription>{asset.serialNumber ?? asset.barcode ?? asset.id}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Tag color={statusColor(asset.status)}>{asset.status}</Tag>
                  <Tag color="blue">{asset.condition}</Tag>
                </div>
              </div>

              <div className="grid gap-[18px] md:grid-cols-3">
                <StatCard label={t('assets.detail.photoCount', 'Photos')} value={photoCount} />
                <StatCard label={t('assets.detail.location', 'Location')} value={asset.locationName ?? '-'} />
                <StatCard label={t('assets.detail.container', 'Container')} value={asset.containerName ?? '-'} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setBorrowOpen(true)} disabled={asset.status.toLowerCase() !== 'available'}>
                  <TakeOutIcon className="h-4 w-4" />
                  {t('assets.detail.borrow', 'Create borrow order')}
                </Button>
                <Button variant="outline" onClick={() => setEditOpen(true)}>
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
                    navigate(ROUTES.workspaceAssets(wsId), { replace: true });
                  }}
                >
                  <Button variant="destructive" disabled={deleteAsset.isPending}>
                    {deleteAsset.isPending ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
                  </Button>
                </Popconfirm>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-[18px] lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
            <Card className="overflow-hidden">
              <CardContent className="space-y-3 p-5 sm:p-6">
                <CardTitle className="text-base">{t('assets.detail.preview', 'Preview')}</CardTitle>
                {mainPhoto ? (
                    <img
                      src={mainPhoto.url}
                    alt={t('assets.photo.alt', 'Asset photo')}
                      className="h-72 w-full rounded-2xl object-cover"
                    />
                ) : (
                  <EmptyState
                    title={t('assets.detail.noPhotoTitle', 'No photos yet')}
                    description={t('assets.detail.noPhotoDescription', 'Upload the first photo from the photo manager below.')}
                  />
                )}
              </CardContent>
            </Card>

            <div className="component-stack">
              <Card>
                <CardContent className="space-y-3 p-5 sm:p-6">
                  <CardTitle className="text-base">{t('assets.detail.metadata', 'Metadata')}</CardTitle>
                  <div className="grid gap-[18px] md:grid-cols-2">
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>{t('assets.detail.product', 'Product')}: {asset.productName}</div>
                      <div>{t('assets.detail.location', 'Location')}: {asset.locationName ?? '-'}</div>
                      <div>{t('assets.detail.container', 'Container')}: {asset.containerName ?? '-'}</div>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>{t('assets.detail.serialNumber', 'Serial number')}: {asset.serialNumber ?? '-'}</div>
                      <div>{t('assets.detail.barcode', 'Barcode')}: {asset.barcode ?? '-'}</div>
                      <div>{t('assets.detail.acquiredDate', 'Acquired date')}: {asset.acquiredDate ? new Date(asset.acquiredDate).toLocaleDateString() : '-'}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{asset.notes?.trim() ? asset.notes : t('assets.detail.noNotes', 'No notes')}</p>
                </CardContent>
              </Card>

              <AssetPhotoManager wsId={wsId} assetId={asset.id} photos={asset.photos ?? []} />
            </div>
          </div>
        </div>
      ) : null}

      {asset ? (
        <UpdateAssetDialog
          wsId={wsId}
          asset={asset}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}

      <CreateBorrowOrderDialog
        wsId={wsId}
        open={borrowOpen}
        onOpenChange={setBorrowOpen}
        initialAssetId={asset?.status.toLowerCase() === 'available' ? asset.id : null}
      />
    </PageShell>
  );
}
