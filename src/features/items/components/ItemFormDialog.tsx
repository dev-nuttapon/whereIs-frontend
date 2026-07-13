import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { useI18n } from '@/hooks/useI18n';
import { useSites } from '@/features/sites/hooks/useSites';
import { useLocation, useLocationTree } from '@/features/locations/hooks/useLocations';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { useProducts } from '@/features/products/hooks/useProducts';
import { createItemSchema, type CreateItemValues } from '@/features/items/validation/createItemSchema';
import type { LocationTreeNode } from '@/api/location.api';
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
  productId: '',
  siteId: '',
  locationId: '',
  containerId: null,
  serialNumber: null,
  barcode: null,
  condition: 'Good',
  notes: null,
  acquiredDate: null,
};

function flattenLocationOptions(nodes: LocationTreeNode[], depth = 0): Array<{ value: string; label: string }> {
  return nodes.flatMap((node) => [
    {
      value: node.id,
      label: `${'— '.repeat(depth)}${node.name}${node.code ? ` (${node.code})` : ''}`,
    },
    ...flattenLocationOptions(node.children, depth + 1),
  ]);
}

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
  const sitesQuery = useSites(wsId);
  const containersQuery = useContainers(wsId);
  const productsQuery = useProducts(wsId);
  const sites = sitesQuery.data ?? [];
  const firstSiteId = sites[0]?.id ?? '';
  const containers = containersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const itemSchema = useMemo(() => createItemSchema(t), [t]);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateItemValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: EMPTY_VALUES,
  });

  const siteId = useWatch({ control, name: 'siteId' });
  const productId = useWatch({ control, name: 'productId' });
  const locationId = useWatch({ control, name: 'locationId' });
  const selectedSiteId = siteId || '';
  const initialLocationId = initialValues?.locationId ?? '';
  const initialLocationQuery = useLocation(wsId, initialLocationId);
  const locationTreeQuery = useLocationTree(wsId, selectedSiteId);
  const initialLocation = initialLocationQuery.data ?? null;
  const locationTree = locationTreeQuery.data ?? [];
  const containerOptions = useMemo(() => flattenContainerOptions(containers), [containers]);
  const locationOptions = useMemo(() => flattenLocationOptions(locationTree), [locationTree]);

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      productId: initialValues?.productId ?? '',
      siteId: initialValues?.siteId ?? initialLocation?.siteId ?? firstSiteId,
      locationId: initialValues?.locationId ?? '',
      containerId: initialValues?.containerId ?? null,
      serialNumber: initialValues?.serialNumber ?? null,
      barcode: initialValues?.barcode ?? null,
      condition: initialValues?.condition ?? 'Good',
      notes: initialValues?.notes ?? null,
      acquiredDate: initialValues?.acquiredDate ?? null,
    });
  }, [firstSiteId, initialLocation?.siteId, initialValues, open, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (!siteId && sites.length === 1) {
      setValue('siteId', firstSiteId, { shouldValidate: true });
    }
  }, [firstSiteId, open, setValue, siteId, sites.length]);

  useEffect(() => {
    if (!open || !initialLocation?.siteId) {
      return;
    }
    if (!siteId) {
      setValue('siteId', initialLocation.siteId, { shouldValidate: true });
    }
  }, [initialLocation?.siteId, open, setValue, siteId]);

  useEffect(() => {
    if (!open || !selectedSiteId || !locationId) {
      return;
    }
    const locationIds = new Set(locationOptions.map((location) => location.value));
    if (!locationIds.has(locationId)) {
      setValue('locationId', '', { shouldValidate: true });
    }
  }, [locationId, locationOptions, open, selectedSiteId, setValue]);

  const resetAndClose = () => {
    reset(EMPTY_VALUES);
    onOpenChange(false);
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      containerId: values.containerId || null,
      serialNumber: values.serialNumber?.trim() || null,
      barcode: values.barcode?.trim() || null,
      notes: values.notes?.trim() || null,
      acquiredDate: values.acquiredDate || null,
    });
  });

  const canSubmit = Boolean(productId && siteId && locationId && !isSubmitting);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="max-w-[48rem]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="component-stack px-5 pb-5 sm:px-6">
            <FormField label={t('items.form.product', 'สินค้า')} htmlFor="item-product" error={errors.productId?.message}>
              <Controller
                name="productId"
                control={control}
                render={({ field }) => (
                  <Select
                    id="item-product"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    placeholder={t('items.form.productPlaceholder', 'เลือกสินค้า')}
                    className="w-full"
                  >
                    <option value="">{t('items.form.productPlaceholder', 'เลือกสินค้า')}</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </FormField>

            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('items.form.site', 'Site')} htmlFor="item-site" error={errors.siteId?.message}>
                <Controller
                  name="siteId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="item-site"
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(event.target.value);
                        setValue('locationId', '', { shouldValidate: true });
                      }}
                      placeholder={t('items.form.sitePlaceholder', 'เลือก site')}
                      className="w-full"
                    >
                      <option value="">{t('items.form.sitePlaceholder', 'เลือก site')}</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </FormField>

              <FormField label={t('items.form.location', 'Location')} htmlFor="item-location" error={errors.locationId?.message}>
                <Controller
                  name="locationId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="item-location"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      placeholder={selectedSiteId ? t('items.form.locationPlaceholder', 'เลือก location') : t('items.form.locationDisabled', 'เลือก site ก่อน')}
                      className="w-full"
                      disabled={!selectedSiteId || locationTreeQuery.isLoading}
                    >
                      <option value="">
                        {selectedSiteId ? t('items.form.locationPlaceholder', 'เลือก location') : t('items.form.locationDisabled', 'เลือก site ก่อน')}
                      </option>
                      {locationOptions.map((location) => (
                        <option key={location.value} value={location.value}>
                          {location.label}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </FormField>
            </div>

            <FormField label={t('items.form.container', 'Container')} htmlFor="item-container" description={t('items.form.containerHelp', 'เลือกได้ทั้ง container ปัจจุบันและ sub containers')}>
              <Controller
                name="containerId"
                control={control}
                render={({ field }) => (
                  <Select
                    id="item-container"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value || null)}
                    placeholder={t('items.form.containerPlaceholder', 'ไม่เลือกก็ได้')}
                    className="w-full"
                  >
                    <option value="">{t('items.form.containerPlaceholder', 'ไม่เลือกก็ได้')}</option>
                    {containerOptions.map((container) => (
                      <option key={container.value} value={container.value}>
                        {container.label}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </FormField>

            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('items.form.serialNumber', 'Serial number')} htmlFor="item-serial">
                <Controller
                  name="serialNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="item-serial"
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      placeholder={t('items.form.serialPlaceholder', 'เช่น SN-001')}
                    />
                  )}
                />
              </FormField>
              <FormField label={t('items.form.barcode', 'Barcode')} htmlFor="item-barcode">
                <Controller
                  name="barcode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="item-barcode"
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      placeholder={t('items.form.barcodePlaceholder', 'เช่น 0123456789')}
                    />
                  )}
                />
              </FormField>
            </div>

            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('items.form.condition', 'Condition')} htmlFor="item-condition">
                <Controller
                  name="condition"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="item-condition"
                      value={field.value ?? 'Good'}
                      onChange={(event) => field.onChange(event.target.value)}
                      className="w-full"
                    >
                      <option value="Good">{t('items.form.conditionGood', 'Good')}</option>
                      <option value="Fair">{t('items.form.conditionFair', 'Fair')}</option>
                      <option value="Poor">{t('items.form.conditionPoor', 'Poor')}</option>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={t('items.form.acquiredDate', 'Acquired date')} htmlFor="item-acquired">
                <Controller
                  name="acquiredDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="item-acquired"
                      type="date"
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                  )}
                />
              </FormField>
            </div>

            <FormField label={t('items.form.notes', 'Notes')} htmlFor="item-notes">
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="item-notes"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    rows={4}
                    placeholder={t('items.form.notesPlaceholder', 'รายละเอียดเพิ่มเติม')}
                  />
                )}
              />
            </FormField>
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
