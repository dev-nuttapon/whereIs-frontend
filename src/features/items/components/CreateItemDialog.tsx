import { useMemo } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { useCreateItem } from '@/features/items/hooks/useItems';
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
  const createItem = useCreateItem(wsId);
  const defaults = useMemo(() => initialValues, [initialValues]);

  return (
    <ItemFormDialog
      wsId={wsId}
      open={open}
      onOpenChange={onOpenChange}
      title={t('items.form.title', 'Create item')}
      description={t('items.form.description', 'Create a new item in this workspace and place it in the correct container.')}
      submitLabel={t('items.form.save', 'Save')}
      initialValues={defaults}
      onSubmit={async (values) => {
        await createItem.mutateAsync({
          name: values.name,
          kind: values.kind,
          usageType: values.usageType,
          code: values.code ?? undefined,
          photoUrl: values.photoUrl ?? undefined,
          description: values.description ?? undefined,
          containerId: values.containerId,
          quantity: values.kind === 'stock' ? values.quantity ?? undefined : undefined,
          unit: values.unit ?? undefined,
          baseUnit: values.baseUnit ?? undefined,
          lotCode: values.lotCode ?? undefined,
          receivedDate: values.receivedDate ? new Date(values.receivedDate).toISOString() : undefined,
          expiryDate: values.expiryDate ? new Date(values.expiryDate).toISOString() : undefined,
          warrantyEndDate: values.warrantyEndDate ? new Date(values.warrantyEndDate).toISOString() : undefined,
          maintenanceNextDueDate: values.maintenanceNextDueDate ? new Date(values.maintenanceNextDueDate).toISOString() : undefined,
          reorderPoint: values.kind === 'stock' ? values.reorderPoint ?? undefined : undefined,
        });
        onOpenChange(false);
      }}
      isSubmitting={createItem.isPending}
    />
  );
}
