import { useMemo } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { useUpdateAsset } from '@/features/assets/hooks/useAssets';
import { AssetFormDialog } from '@/features/assets/components/AssetFormDialog';
import type { Asset } from '@/types/domain.types';
import type { AssetFormValues } from '@/features/assets/components/AssetFormDialog';

interface UpdateAssetDialogProps {
  wsId: string;
  asset: Asset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toFormValues(asset: Asset): Partial<AssetFormValues> {
  return {
    productId: asset.productId,
    siteId: '',
    locationId: asset.locationId ?? '',
    containerId: asset.containerId ?? '',
    serialNumber: asset.serialNumber ?? '',
    barcode: asset.barcode ?? '',
    condition: asset.condition,
    notes: asset.notes ?? '',
    acquiredDate: asset.acquiredDate ? asset.acquiredDate.slice(0, 10) : '',
    status: asset.status,
  };
}

export function UpdateAssetDialog({ wsId, asset, open, onOpenChange }: UpdateAssetDialogProps) {
  const { t } = useI18n();
  const updateAsset = useUpdateAsset(wsId, asset.id);
  const initialValues = useMemo(() => toFormValues(asset), [asset]);

  return (
    <AssetFormDialog
      wsId={wsId}
      open={open}
      onOpenChange={onOpenChange}
      title={t('assets.edit.title', 'Edit asset')}
      description={t('assets.edit.description', 'Update this asset and keep its storage information in sync.')}
      submitLabel={t('common.save', 'Save')}
      mode="edit"
      initialValues={initialValues}
      onSubmit={async (values) => {
        await updateAsset.mutateAsync({
          locationId: values.locationId,
          containerId: values.containerId || null,
          serialNumber: values.serialNumber || null,
          barcode: values.barcode || null,
          status: values.status || null,
          condition: values.condition || null,
          notes: values.notes || null,
          acquiredDate: values.acquiredDate ? new Date(values.acquiredDate).toISOString() : null,
        });
        onOpenChange(false);
      }}
      isSubmitting={updateAsset.isPending}
    />
  );
}
