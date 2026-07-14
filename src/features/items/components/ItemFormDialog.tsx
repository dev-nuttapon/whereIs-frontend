import { useEffect, useMemo } from 'react';
import { Controller, type Resolver, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { useI18n } from '@/hooks/useI18n';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { createItemSchema, type CreateItemValues } from '@/features/items/validation/createItemSchema';
import type { Container } from '@/types/domain.types';

interface ItemFormDialogProps {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: Partial<CreateItemValues>;
  onSubmit: (values: CreateItemValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

const EMPTY_VALUES: CreateItemValues = {
  name: '',
  kind: 'single',
  usageType: 'returnable',
  code: null,
  description: null,
  containerId: '',
  quantity: null,
  unit: null,
  baseUnit: null,
  lotCode: null,
  receivedDate: null,
  expiryDate: null,
  warrantyEndDate: null,
  maintenanceNextDueDate: null,
  reorderPoint: null,
};

function flattenContainerOptions(containers: Container[], depth = 0, parentId: string | null = null): Array<{ value: string; label: string }> {
  return containers
    .filter((container) => (container.parentId ?? null) === parentId)
    .flatMap((container) => [
      {
        value: container.id,
        label: `${'— '.repeat(depth)}${container.name}${container.code ? ` (${container.code})` : ''}`,
      },
      ...flattenContainerOptions(containers, depth + 1, container.id),
    ]);
}

export function ItemFormDialog({
  wsId,
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  isSubmitting = false,
}: ItemFormDialogProps) {
  const { t } = useI18n();
  const containersQuery = useContainers(wsId);
  const containers = containersQuery.data ?? [];
  const itemSchema = useMemo(() => createItemSchema(t), [t]);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateItemValues>({
    resolver: zodResolver(itemSchema) as Resolver<CreateItemValues>,
    defaultValues: EMPTY_VALUES,
  });

  const kind = useWatch({ control, name: 'kind' });
  const containerOptions = useMemo(() => flattenContainerOptions(containers), [containers]);
  const isStock = kind === 'stock';

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      ...EMPTY_VALUES,
      ...initialValues,
      kind: initialValues?.kind ?? 'single',
      usageType: initialValues?.usageType ?? 'returnable',
      containerId: initialValues?.containerId ?? '',
    });
  }, [initialValues, open, reset]);

  const resetAndClose = () => {
    reset(EMPTY_VALUES);
    onOpenChange(false);
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      code: values.code?.trim() || null,
      description: values.description?.trim() || null,
      containerId: values.containerId.trim(),
      unit: values.unit?.trim() || null,
      baseUnit: values.baseUnit?.trim() || null,
      lotCode: values.lotCode?.trim() || null,
      receivedDate: values.receivedDate || null,
      expiryDate: values.expiryDate || null,
      warrantyEndDate: values.warrantyEndDate || null,
      maintenanceNextDueDate: values.maintenanceNextDueDate || null,
      quantity: values.kind === 'stock' ? values.quantity ?? null : null,
      reorderPoint: values.kind === 'stock' ? values.reorderPoint ?? null : null,
    });
  });

  const canSubmit = Boolean(!isSubmitting && containerOptions.length >= 0);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="max-w-[52rem]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="component-stack px-5 pb-5 sm:px-6">
            <FormField label={t('items.form.name', 'Item name')} htmlFor="item-name" error={errors.name?.message}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    id="item-name"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    placeholder={t('items.form.namePlaceholder', 'เช่น Portable projector')}
                  />
                )}
              />
            </FormField>

            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('items.form.kind', 'Item type')} htmlFor="item-kind" error={errors.kind?.message}>
                <Controller
                  name="kind"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="item-kind"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      className="w-full"
                    >
                      <option value="single">{t('items.kind.single', 'Individual Item')}</option>
                      <option value="stock">{t('items.kind.stock', 'Quantity Item')}</option>
                    </Select>
                  )}
                />
              </FormField>

              <FormField label={t('items.form.usageType', 'Usage type')} htmlFor="item-usage-type" error={errors.usageType?.message}>
                <Controller
                  name="usageType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="item-usage-type"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      className="w-full"
                    >
                      <option value="returnable">{t('items.usage.returnable', 'Returnable')}</option>
                      <option value="consumable">{t('items.usage.consumable', 'Consumable')}</option>
                    </Select>
                  )}
                />
              </FormField>
            </div>

            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('items.form.code', 'Code')} htmlFor="item-code">
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="item-code"
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      placeholder={t('items.form.codePlaceholder', 'Optional code')}
                    />
                  )}
                />
              </FormField>

              <FormField label={t('items.form.container', 'Container')} htmlFor="item-container" error={errors.containerId?.message}>
                <Controller
                  name="containerId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="item-container"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      className="w-full"
                      placeholder={t('items.form.containerPlaceholder', 'Select container')}
                    >
                      <option value="">{t('items.form.containerPlaceholder', 'Select container')}</option>
                      {containerOptions.map((container) => (
                        <option key={container.value} value={container.value}>
                          {container.label}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </FormField>
            </div>

            <FormField label={t('items.form.description', 'Description')} htmlFor="item-description">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="item-description"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    rows={4}
                    placeholder={t('items.form.descriptionPlaceholder', 'Optional item notes or specification')}
                  />
                )}
              />
            </FormField>

            {isStock ? (
              <div className="grid gap-[18px] sm:grid-cols-2">
                <FormField label={t('items.form.quantity', 'Quantity')} htmlFor="item-quantity" error={errors.quantity?.message as string | undefined}>
                  <Controller
                    name="quantity"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="item-quantity"
                        type="number"
                        min={1}
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : null)}
                        placeholder={t('items.form.quantityPlaceholder', '1')}
                      />
                    )}
                  />
                </FormField>

                <FormField label={t('items.form.unit', 'Unit')} htmlFor="item-unit">
                  <Controller
                    name="unit"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="item-unit"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder={t('items.form.unitPlaceholder', 'pcs')}
                      />
                    )}
                  />
                </FormField>

                <FormField label={t('items.form.baseUnit', 'Base unit')} htmlFor="item-base-unit">
                  <Controller
                    name="baseUnit"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="item-base-unit"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder={t('items.form.baseUnitPlaceholder', 'pcs')}
                      />
                    )}
                  />
                </FormField>

                <FormField label={t('items.form.reorderPoint', 'Reorder point')} htmlFor="item-reorder-point">
                  <Controller
                    name="reorderPoint"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="item-reorder-point"
                        type="number"
                        min={0}
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : null)}
                        placeholder={t('items.form.reorderPointPlaceholder', 'Optional')}
                      />
                    )}
                  />
                </FormField>
              </div>
            ) : null}

            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('items.form.lotCode', 'Lot code')} htmlFor="item-lot-code">
                <Controller
                  name="lotCode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="item-lot-code"
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      placeholder={t('items.form.lotPlaceholder', 'Optional')}
                    />
                  )}
                />
              </FormField>

              <FormField label={t('items.form.receivedDate', 'Received date')} htmlFor="item-received">
                <Controller
                  name="receivedDate"
                  control={control}
                  render={({ field }) => (
                    <Input id="item-received" type="date" value={field.value ?? ''} onChange={(event) => field.onChange(event.target.value)} />
                  )}
                />
              </FormField>
            </div>

            <div className="grid gap-[18px] sm:grid-cols-3">
              <FormField label={t('items.form.expiryDate', 'Expiry date')} htmlFor="item-expiry">
                <Controller
                  name="expiryDate"
                  control={control}
                  render={({ field }) => (
                    <Input id="item-expiry" type="date" value={field.value ?? ''} onChange={(event) => field.onChange(event.target.value)} />
                  )}
                />
              </FormField>

              <FormField label={t('items.form.warrantyEndDate', 'Warranty end')} htmlFor="item-warranty">
                <Controller
                  name="warrantyEndDate"
                  control={control}
                  render={({ field }) => (
                    <Input id="item-warranty" type="date" value={field.value ?? ''} onChange={(event) => field.onChange(event.target.value)} />
                  )}
                />
              </FormField>

              <FormField label={t('items.form.maintenanceNextDueDate', 'Next maintenance')} htmlFor="item-maintenance">
                <Controller
                  name="maintenanceNextDueDate"
                  control={control}
                  render={({ field }) => (
                    <Input id="item-maintenance" type="date" value={field.value ?? ''} onChange={(event) => field.onChange(event.target.value)} />
                  )}
                />
              </FormField>
            </div>
          </div>

          <DialogFooter className="border-t border-border/70 bg-muted/30 px-5 py-4 sm:px-6">
            <Button type="button" variant="outline" onClick={resetAndClose}>
              {t('common.cancel', 'ยกเลิก')}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? t('common.saving', 'กำลังบันทึก...') : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
