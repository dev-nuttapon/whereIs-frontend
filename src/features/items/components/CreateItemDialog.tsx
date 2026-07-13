import { useMemo } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { useCreateAsset } from '@/features/assets/hooks/useAssets';
import { ItemFormDialog } from '@/features/items/components/ItemFormDialog';
import type { CreateItemValues } from '@/features/items/validation/createItemSchema';

interface CreateItemDialogProps {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<CreateItemValues>;
}

export function CreateItemDialog({ wsId, open, onOpenChange, initialValues }: CreateItemDialogProps) {
  const { t } = useI18n();
  const createAsset = useCreateAsset(wsId);
  const defaults = useMemo(() => initialValues, [initialValues]);

  return (
    <ItemFormDialog
      wsId={wsId}
      open={open}
      onOpenChange={onOpenChange}
      title={t('items.form.title', 'เพิ่มของ')}
      description={t('items.form.description', 'เพิ่มของใหม่และกำหนด location/container ภายใน workspace นี้')}
      submitLabel={t('items.form.save', 'บันทึก')}
      initialValues={defaults}
      onSubmit={async (values) => {
        await createAsset.mutateAsync({
          productId: values.productId,
          locationId: values.locationId,
          containerId: values.containerId ?? null,
          serialNumber: values.serialNumber ?? null,
          barcode: values.barcode ?? null,
          condition: values.condition ?? 'Good',
          notes: values.notes ?? null,
          acquiredDate: values.acquiredDate ? new Date(values.acquiredDate).toISOString() : null,
        });
        onOpenChange(false);
      }}
      isSubmitting={createAsset.isPending}
    />
  );
}
