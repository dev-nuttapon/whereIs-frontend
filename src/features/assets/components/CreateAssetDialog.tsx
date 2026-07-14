import { useI18n } from '@/hooks/useI18n';
import { useCreateAsset } from '@/features/assets/hooks/useAssets';
import { AssetFormDialog } from '@/features/assets/components/AssetFormDialog';
import type { AssetFormValues } from '@/features/assets/components/AssetFormDialog';

interface CreateAssetDialogProps {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAssetDialog({ wsId, open, onOpenChange }: CreateAssetDialogProps) {
  const { t } = useI18n();
  const createAsset = useCreateAsset(wsId);

  return (
    <AssetFormDialog
      wsId={wsId}
      open={open}
      onOpenChange={onOpenChange}
      title={t('assets.create.title', 'Create asset')}
      description={t('assets.create.description', 'Create a new asset and attach photos, location, and storage information.')}
      submitLabel={t('assets.create.action', 'Create asset')}
      mode="create"
      onSubmit={async (values: AssetFormValues) => {
        await createAsset.mutateAsync({
          productId: values.productId,
          locationId: values.locationId,
          containerId: values.containerId || null,
          serialNumber: values.serialNumber || null,
          barcode: values.barcode || null,
          condition: values.condition || 'Good',
          notes: values.notes || null,
          acquiredDate: values.acquiredDate ? new Date(values.acquiredDate).toISOString() : null,
        });
        onOpenChange(false);
      }}
      isSubmitting={createAsset.isPending}
    />
  );
}
