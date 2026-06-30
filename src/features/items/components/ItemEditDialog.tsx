import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Item } from '@/types/domain.types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/forms/FormField';
import { FormActions } from '@/components/forms/FormActions';
import { createUpdateItemSchema, type UpdateItemValues } from '@/features/items/validation/itemSchema';
import { useUpdateItem } from '@/features/items/hooks/useItems';
import { useI18n } from '@/hooks/useI18n';

export interface ItemEditDialogProps {
  wsId: string;
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemEditDialog({ wsId, item, open, onOpenChange }: ItemEditDialogProps) {
  const updateMutation = useUpdateItem(wsId, item.id);
  const { t } = useI18n();
  const updateItemSchema = createUpdateItemSchema(t);
  const isReturnable = item.usageType === 'returnable';
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateItemValues>({
    resolver: zodResolver(updateItemSchema) as never,
    defaultValues: {
      name: item.name,
      code: item.code ?? '',
      description: item.description ?? '',
      returnPolicy: item.returnPolicy,
      returnDays: item.returnDays,
    },
  });
  const returnPolicy = watch('returnPolicy');

  useEffect(() => {
    reset({
      name: item.name,
      code: item.code ?? '',
      description: item.description ?? '',
      returnPolicy: item.returnPolicy,
      returnDays: item.returnDays,
    });
  }, [item, open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await updateMutation.mutateAsync({
      ...values,
      returnPolicy: isReturnable ? values.returnPolicy : undefined,
      returnDays: isReturnable && values.returnPolicy === 'due' ? values.returnDays : undefined,
    });
    reset();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('items.edit.title')}</DialogTitle>
          <DialogDescription>{t('items.edit.description')}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField label={t('items.edit.name')} htmlFor="edit-item-name" error={errors.name?.message}>
            <Input id="edit-item-name" {...register('name')} />
          </FormField>
          <FormField label={t('items.edit.code')} htmlFor="edit-item-code" error={errors.code?.message}>
            <Input id="edit-item-code" {...register('code')} />
          </FormField>
          <FormField label={t('items.edit.descriptionLabel')} htmlFor="edit-item-description" error={errors.description?.message}>
            <Textarea id="edit-item-description" rows={4} {...register('description')} />
          </FormField>
          {isReturnable ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label={t('items.form.returnPolicy')} htmlFor="edit-item-return-policy" error={errors.returnPolicy?.message}>
                <Select id="edit-item-return-policy" {...register('returnPolicy')}>
                  <option value="due">{t('items.form.returnPolicyDue')}</option>
                  <option value="indefinite">{t('items.form.returnPolicyIndefinite')}</option>
                </Select>
              </FormField>
              {returnPolicy === 'due' ? (
                <FormField label={t('items.form.returnDays')} htmlFor="edit-item-return-days" error={errors.returnDays?.message}>
                  <Input id="edit-item-return-days" type="number" min={1} {...register('returnDays')} />
                </FormField>
              ) : null}
            </div>
          ) : null}
          <FormActions>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('items.edit.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
              {isSubmitting || updateMutation.isPending ? t('items.edit.saving') : t('items.edit.save')}
            </Button>
          </FormActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
