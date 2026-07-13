import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Descriptions, Popconfirm, Tag } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useI18n } from '@/hooks/useI18n';
import { EditIcon } from '@/components/ui/icons';
import { ROUTES } from '@/constants/routes';
import { useAsset, useDeleteAsset } from '@/features/assets/hooks/useAssets';
import { UpdateItemDialog } from '@/features/items/components/UpdateItemDialog';

function statusColor(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'available') return 'green';
  if (normalized === 'borrowed') return 'blue';
  if (normalized === 'maintenance') return 'gold';
  if (normalized === 'missing') return 'red';
  if (normalized === 'disposed') return 'default';
  return 'geekblue';
}

export function ItemDetailPage() {
  const { wsId = 'ws-warehouse', assetId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const resolvedAssetId = assetId ?? '';
  const assetQuery = useAsset(wsId, resolvedAssetId);
  const asset = assetQuery.data ?? null;
  const [editOpen, setEditOpen] = useState(false);
  const deleteAsset = useDeleteAsset(wsId, resolvedAssetId);

  return (
    <PageShell title={t('items.detail.title')} description={t('items.detail.pageDescription')}>
      <div className="component-stack">
        {assetQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
        {assetQuery.isError ? <ErrorState message={t('items.detail.loadError', 'Unable to load item.')} onRetry={() => assetQuery.refetch()} /> : null}

        <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{asset?.productName ?? resolvedAssetId}</CardTitle>
                <CardDescription>{asset?.serialNumber ?? asset?.barcode ?? t('items.detail.noCode')}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} disabled={!asset}>
                  <EditIcon className="h-4 w-4" />
                  {t('items.detail.edit', 'Edit Item')}
                </Button>
                <Popconfirm
                  title={t('items.detail.deleteConfirmTitle', 'Delete this item?')}
                  description={t('items.detail.deleteConfirmDescription', 'This will remove the item from the workspace.')}
                  okText={t('common.delete', 'Delete')}
                  cancelText={t('common.cancel', 'Cancel')}
                  okButtonProps={{ danger: true }}
                  onConfirm={async () => {
                    await deleteAsset.mutateAsync();
                    navigate(ROUTES.workspaceItems(wsId), { replace: true });
                  }}
                >
                  <Button variant="destructive" size="sm" disabled={!asset || deleteAsset.isPending}>
                    {deleteAsset.isPending ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
                  </Button>
                </Popconfirm>
              </div>
            </div>

            <Descriptions bordered column={{ xs: 1, md: 2, lg: 3 }} size="middle">
              <Descriptions.Item label={t('items.detail.product', 'Product')}>{asset?.productName ?? '-'}</Descriptions.Item>
              <Descriptions.Item label={t('items.detail.location', 'Location')}>{asset?.locationName ?? asset?.locationId ?? t('items.detail.noLocation', 'No location')}</Descriptions.Item>
              <Descriptions.Item label={t('items.detail.containerPrefix', 'Container')}>{asset?.containerName ?? asset?.containerId ?? t('items.detail.noContainer')}</Descriptions.Item>
              <Descriptions.Item label={t('items.detail.status')}>
                {asset ? <Tag color={statusColor(asset.status)}>{asset.status}</Tag> : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('items.detail.condition', 'Condition')}>{asset?.condition ?? '-'}</Descriptions.Item>
              <Descriptions.Item label={t('items.detail.holderPrefix', 'Holder')}>{asset?.currentHolderUserId ?? t('items.detail.noHolder')}</Descriptions.Item>
              <Descriptions.Item label={t('items.detail.serialNumber', 'Serial number')}>{asset?.serialNumber ?? '-'}</Descriptions.Item>
              <Descriptions.Item label={t('items.detail.barcode', 'Barcode')}>{asset?.barcode ?? '-'}</Descriptions.Item>
              <Descriptions.Item label={t('items.detail.acquiredDate', 'Acquired date')}>
                {asset?.acquiredDate ? new Date(asset.acquiredDate).toLocaleDateString() : '-'}
              </Descriptions.Item>
            </Descriptions>

            <div className="space-y-2">
              <CardTitle className="text-base">{t('items.detail.description')}</CardTitle>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                {asset?.notes?.trim() ? asset.notes : t('items.detail.noDescription')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {asset ? (
        <UpdateItemDialog
          wsId={wsId}
          asset={asset}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
    </PageShell>
  );
}
