import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/forms/FormField';
import { FormActions } from '@/components/forms/FormActions';
import { createItemSchema, type ItemValues } from '@/features/items/validation/itemSchema';
import { useCreateItem } from '@/features/items/hooks/useItems';
import { MOCK_CONTAINERS } from '@/mocks/mock-data';
import { useI18n } from '@/hooks/useI18n';

export interface ItemFormDialogProps {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemFormDialog({ wsId, open, onOpenChange }: ItemFormDialogProps) {
  const createMutation = useCreateItem(wsId);
  const { t } = useI18n();
  const itemSchema = createItemSchema(t);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ItemValues>({
    resolver: zodResolver(itemSchema) as never,
    shouldUnregister: true,
    defaultValues: {
      kind: 'single',
      usageType: 'returnable',
      name: 'Sample Item',
      code: 'ITEM-001',
      description: 'Sample item used to show item create and search flow',
      containerId: MOCK_CONTAINERS[0]?.id ?? '',
      quantity: 1,
      reorderPoint: 5,
    },
  });
  const kind = watch('kind');
  const usageType = watch('usageType');

  useEffect(() => {
    reset({
      kind: 'single',
      usageType: 'returnable',
      name: 'Sample Item',
      code: 'ITEM-001',
      description: 'Sample item used to show item create and search flow',
      containerId: MOCK_CONTAINERS[0]?.id ?? '',
      quantity: 1,
      reorderPoint: 5,
    });
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await createMutation.mutateAsync({
      name: values.name,
      kind: values.kind,
      usageType: values.usageType,
      quantity: values.kind === 'stock' ? values.quantity : undefined,
      reorderPoint: values.kind === 'stock' && values.usageType === 'consumable' ? values.reorderPoint : undefined,
      code: values.code,
      description: values.description,
      containerId: values.containerId,
    });
    reset();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('items.form.title')}</DialogTitle>
          <DialogDescription>{t('items.form.description')}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField label={t('items.form.kind')} htmlFor="item-kind" error={errors.kind?.message}>
            <Select id="item-kind" {...register('kind')}>
              <option value="single">{t('items.form.kindSingle')}</option>
              <option value="stock">{t('items.form.kindBulk')}</option>
            </Select>
          </FormField>
          <FormField label={t('items.form.usageType')} htmlFor="item-usage-type" error={errors.usageType?.message}>
            <Select id="item-usage-type" {...register('usageType')}>
              <option value="returnable">{t('items.form.usageTypeReturnable')}</option>
              <option value="consumable">{t('items.form.usageTypeConsumable')}</option>
            </Select>
            <p className="text-xs text-muted-foreground">{t('items.form.usageTypeHelp')}</p>
          </FormField>
          <FormField label={t('items.form.name')} htmlFor="item-name" error={errors.name?.message}>
            <Input id="item-name" {...register('name')} />
          </FormField>
          <FormField label={t('items.form.code')} htmlFor="item-code" error={errors.code?.message}>
            <Input id="item-code" {...register('code')} />
          </FormField>
          <FormField label={t('items.form.descriptionLabel')} htmlFor="item-description" error={errors.description?.message}>
            <Textarea id="item-description" rows={4} {...register('description')} />
          </FormField>
          <FormField label={t('items.form.container')} htmlFor="item-container" error={errors.containerId?.message}>
            <Select id="item-container" {...register('containerId')}>
              {MOCK_CONTAINERS.map((container) => (
                <option key={container.id} value={container.id}>
                  {container.name}
                </option>
              ))}
            </Select>
          </FormField>
          {kind === 'stock' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label={t('items.form.quantity')} htmlFor="item-quantity" error={errors.quantity?.message}>
                <Input id="item-quantity" type="number" min={1} {...register('quantity')} />
                <p className="text-xs text-muted-foreground">{t('items.form.quantityHelp')}</p>
              </FormField>
              {usageType === 'consumable' ? (
                <FormField label={t('items.form.reorderPoint')} htmlFor="item-reorder-point" error={errors.reorderPoint?.message}>
                  <Input id="item-reorder-point" type="number" min={1} {...register('reorderPoint')} />
                  <p className="text-xs text-muted-foreground">{t('items.form.reorderPointHelp')}</p>
                </FormField>
              ) : null}
            </div>
          ) : null}
          <FormActions>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('items.form.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
              {isSubmitting || createMutation.isPending ? t('items.form.saving') : t('items.form.save')}
            </Button>
          </FormActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
