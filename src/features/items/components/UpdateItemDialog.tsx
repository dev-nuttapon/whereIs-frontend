import { useMemo } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { useUpdateItem } from '@/features/items/hooks/useItems';
import { ItemFormDialog } from '@/features/items/components/ItemFormDialog';
import type { Item } from '@/types/domain.types';
import type { CreateItemValues } from '@/features/items/validation/createItemSchema';

interface UpdateItemDialogProps {
  wsId: string;
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toFormValues(item: Item): Partial<CreateItemValues> {
  return {
    name: item.name,
    kind: item.kind,
    usageType: item.usageType,
    code: item.code ?? null,
    photoUrl: item.photoUrl ?? null,
    description: item.description ?? null,
    containerId: item.containerId ?? '',
    quantity: item.quantity ?? null,
    unit: item.unit ?? null,
    baseUnit: item.baseUnit ?? null,
    lotCode: item.lotCode ?? null,
    receivedDate: item.receivedDate ? item.receivedDate.slice(0, 10) : null,
    expiryDate: item.expiryDate ? item.expiryDate.slice(0, 10) : null,
    warrantyEndDate: item.warrantyEndDate ? item.warrantyEndDate.slice(0, 10) : null,
    maintenanceNextDueDate: item.maintenanceNextDueDate ? item.maintenanceNextDueDate.slice(0, 10) : null,
    reorderPoint: item.reorderPoint ?? null,
  };
}

export function UpdateItemDialog({ wsId, item, open, onOpenChange }: UpdateItemDialogProps) {
  const { t } = useI18n();
  const updateItem = useUpdateItem(wsId, item.id);
  const initialValues = useMemo(() => toFormValues(item), [item]);

  return (
    <ItemFormDialog
      wsId={wsId}
      open={open}
      onOpenChange={onOpenChange}
      title={t('items.edit.title', 'Edit item')}
      description={t('items.edit.description', 'Update this item without changing the workspace structure.')}
      submitLabel={t('common.save', 'Save')}
      initialValues={initialValues}
      onSubmit={async (values) => {
        await updateItem.mutateAsync({
          name: values.name,
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
      isSubmitting={updateItem.isPending}
    />
  );
}
