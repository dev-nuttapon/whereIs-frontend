import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
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
import { useUpdateAsset } from '@/features/assets/hooks/useAssets';
import type { Asset } from '@/types/domain.types';
import type { LocationTreeNode } from '@/api/location.api';
import type { Container } from '@/types/domain.types';

interface UpdateItemDialogProps {
  wsId: string;
  asset: Asset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type UpdateItemValues = {
  siteId: string;
  locationId: string;
  containerId: string | null;
  serialNumber: string | null;
  barcode: string | null;
  condition: string | null;
  notes: string | null;
  acquiredDate: string | null;
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

export function UpdateItemDialog({ wsId, asset, open, onOpenChange }: UpdateItemDialogProps) {
  const { t } = useI18n();
  const sitesQuery = useSites(wsId);
  const containersQuery = useContainers(wsId);
  const initialLocationQuery = useLocation(wsId, asset.locationId ?? '');
  const sites = sitesQuery.data ?? [];
  const firstSiteId = sites[0]?.id ?? '';
  const containers = containersQuery.data ?? [];
  const initialLocation = initialLocationQuery.data ?? null;
  const updateAsset = useUpdateAsset(wsId, asset.id);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UpdateItemValues>({
    defaultValues: {
      siteId: '',
      locationId: '',
      containerId: null,
      serialNumber: null,
      barcode: null,
      condition: null,
      notes: null,
      acquiredDate: null,
    },
  });

  const siteId = useWatch({ control, name: 'siteId' });
  const locationId = useWatch({ control, name: 'locationId' });
  const selectedSiteId = siteId || '';
  const locationTreeQuery = useLocationTree(wsId, selectedSiteId);
  const locationTree = locationTreeQuery.data ?? [];
  const containerOptions = useMemo(() => flattenContainerOptions(containers), [containers]);
  const locationOptions = useMemo(() => flattenLocationOptions(locationTree), [locationTree]);

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      siteId: initialLocation?.siteId ?? firstSiteId,
      locationId: asset.locationId ?? '',
      containerId: asset.containerId ?? null,
      serialNumber: asset.serialNumber ?? null,
      barcode: asset.barcode ?? null,
      condition: asset.condition ?? null,
      notes: asset.notes ?? null,
      acquiredDate: asset.acquiredDate ? asset.acquiredDate.slice(0, 10) : null,
    });
  }, [asset, firstSiteId, initialLocation?.siteId, open, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (!siteId && sites.length === 1) {
      setValue('siteId', firstSiteId, { shouldValidate: true });
    }
  }, [firstSiteId, open, setValue, siteId, sites.length]);

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
    onOpenChange(false);
  };

  const submit = handleSubmit(async (values) => {
    await updateAsset.mutateAsync({
      locationId: values.locationId || null,
      containerId: values.containerId || null,
      serialNumber: values.serialNumber?.trim() || null,
      barcode: values.barcode?.trim() || null,
      status: asset.status,
      condition: values.condition || null,
      notes: values.notes?.trim() || null,
      acquiredDate: values.acquiredDate || null,
    });
    onOpenChange(false);
  });

  const canSubmit = Boolean(siteId && !updateAsset.isPending);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="max-w-[48rem]">
        <DialogHeader>
          <DialogTitle>{t('items.edit.title', 'แก้ไขของ')}</DialogTitle>
          <DialogDescription>{t('items.edit.description', 'อัปเดตรายละเอียดของรายการนี้')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="component-stack px-5 pb-5 sm:px-6">
            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('items.form.site', 'Site')} htmlFor="item-edit-site" error={errors.siteId?.message}>
                <Controller
                  name="siteId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="item-edit-site"
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(event.target.value);
                        setValue('locationId', '', { shouldValidate: true });
                      }}
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

              <FormField label={t('items.form.location', 'Location')} htmlFor="item-edit-location" error={errors.locationId?.message}>
                <Controller
                  name="locationId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="item-edit-location"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      className="w-full"
                      disabled={!selectedSiteId || locationTreeQuery.isLoading}
                    >
                      <option value="">{t('items.form.locationPlaceholder', 'เลือก location')}</option>
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

            <FormField label={t('items.form.container', 'Container')} htmlFor="item-edit-container" description={t('items.form.containerHelp', 'เลือกได้ทั้ง container ปัจจุบันและ sub containers')}>
              <Controller
                name="containerId"
                control={control}
                render={({ field }) => (
                  <Select
                    id="item-edit-container"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value || null)}
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
              <FormField label={t('items.form.serialNumber', 'Serial number')} htmlFor="item-edit-serial">
                <Controller
                  name="serialNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="item-edit-serial"
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      placeholder={t('items.form.serialPlaceholder', 'เช่น SN-001')}
                    />
                  )}
                />
              </FormField>
              <FormField label={t('items.form.barcode', 'Barcode')} htmlFor="item-edit-barcode">
                <Controller
                  name="barcode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="item-edit-barcode"
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      placeholder={t('items.form.barcodePlaceholder', 'เช่น 0123456789')}
                    />
                  )}
                />
              </FormField>
            </div>

            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('items.form.condition', 'Condition')} htmlFor="item-edit-condition">
                <Controller
                  name="condition"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="item-edit-condition"
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
              <FormField label={t('items.form.acquiredDate', 'Acquired date')} htmlFor="item-edit-acquired">
                <Controller
                  name="acquiredDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="item-edit-acquired"
                      type="date"
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                  )}
                />
              </FormField>
            </div>

            <FormField label={t('items.form.notes', 'Notes')} htmlFor="item-edit-notes">
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="item-edit-notes"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    rows={4}
                    placeholder={t('items.form.notesPlaceholder', 'เพิ่มหมายเหตุสั้นๆ')}
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
              {updateAsset.isPending ? t('common.saving', 'กำลังบันทึก...') : t('common.save', 'บันทึก')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
