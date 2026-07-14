import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { useI18n } from '@/hooks/useI18n';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useSites } from '@/features/sites/hooks/useSites';
import { useLocations } from '@/features/locations/hooks/useLocations';
import type { Container, Location, Product, Site } from '@/types/domain.types';

export interface AssetFormValues {
  productId: string;
  siteId: string;
  locationId: string;
  containerId: string;
  serialNumber: string;
  barcode: string;
  condition: string;
  notes: string;
  acquiredDate: string;
  status: string;
}

const EMPTY_VALUES: AssetFormValues = {
  productId: '',
  siteId: '',
  locationId: '',
  containerId: '',
  serialNumber: '',
  barcode: '',
  condition: 'Good',
  notes: '',
  acquiredDate: '',
  status: 'Available',
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

function flattenLocationOptions(locations: Location[], siteId: string, depth = 0, parentLocationId: string | null = null): Array<{ value: string; label: string }> {
  return locations
    .filter((location) => location.siteId === siteId && (location.parentLocationId ?? null) === parentLocationId)
    .flatMap((location) => [
      {
        value: location.id,
        label: `${'— '.repeat(depth)}${location.name}${location.code ? ` (${location.code})` : ''}`,
      },
      ...flattenLocationOptions(locations, siteId, depth + 1, location.id),
    ]);
}

function inferSiteId(locations: Location[], locationId?: string | null) {
  if (!locationId) return '';
  return locations.find((location) => location.id === locationId)?.siteId ?? '';
}

export interface AssetFormDialogProps {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  mode: 'create' | 'edit';
  initialValues?: Partial<AssetFormValues>;
  onSubmit: (values: AssetFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function AssetFormDialog({
  wsId,
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  mode,
  initialValues,
  onSubmit,
  isSubmitting = false,
}: AssetFormDialogProps) {
  const { t } = useI18n();
  const productsQuery = useProducts(wsId);
  const sitesQuery = useSites(wsId);
  const locationsQuery = useLocations(wsId);
  const containersQuery = useContainers(wsId);
  const [values, setValues] = useState<AssetFormValues>(EMPTY_VALUES);
  const [selectedSiteId, setSelectedSiteId] = useState('');

  const products = productsQuery.data ?? [];
  const sites = sitesQuery.data ?? [];
  const locations = locationsQuery.data ?? [];
  const containers = containersQuery.data ?? [];

  const selectedSiteLocations = useMemo(
    () => flattenLocationOptions(locations, selectedSiteId),
    [locations, selectedSiteId],
  );
  const containerOptions = useMemo(() => flattenContainerOptions(containers), [containers]);

  useEffect(() => {
    if (!open) return;

    const nextSiteId = initialValues?.siteId ?? inferSiteId(locations, initialValues?.locationId) ?? sites[0]?.id ?? '';
    setSelectedSiteId(nextSiteId);
    setValues({
      productId: initialValues?.productId ?? '',
      siteId: nextSiteId,
      locationId: initialValues?.locationId ?? '',
      containerId: initialValues?.containerId ?? '',
      serialNumber: initialValues?.serialNumber ?? '',
      barcode: initialValues?.barcode ?? '',
      condition: initialValues?.condition ?? 'Good',
      notes: initialValues?.notes ?? '',
      acquiredDate: initialValues?.acquiredDate ?? '',
      status: initialValues?.status ?? 'Available',
    });
  }, [initialValues, locations, open, sites]);

  useEffect(() => {
    if (!selectedSiteId) return;
    if (values.locationId && !selectedSiteLocations.some((location) => location.value === values.locationId)) {
      setValues((current) => ({ ...current, locationId: '' }));
    }
  }, [selectedSiteId, selectedSiteLocations, values.locationId]);

  const resetAndClose = () => {
    setValues(EMPTY_VALUES);
    setSelectedSiteId('');
    onOpenChange(false);
  };

  const canSubmit = Boolean(values.productId && values.siteId && values.locationId && !isSubmitting);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      productId: values.productId.trim(),
      siteId: values.siteId.trim(),
      locationId: values.locationId.trim(),
      containerId: values.containerId.trim(),
      serialNumber: values.serialNumber.trim(),
      barcode: values.barcode.trim(),
      condition: values.condition,
      notes: values.notes.trim(),
      acquiredDate: values.acquiredDate.trim(),
      status: values.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="max-w-[56rem]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="component-stack px-5 pb-5 sm:px-6">
            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('assets.form.product', 'Product')} htmlFor="asset-product">
                <Select
                  id="asset-product"
                  value={values.productId}
                  onChange={(event) => setValues((current) => ({ ...current, productId: event.target.value }))}
                  className="w-full"
                  placeholder={t('assets.form.productPlaceholder', 'Select product')}
                >
                  <option value="">{t('assets.form.productPlaceholder', 'Select product')}</option>
                  {products.map((product: Product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label={t('assets.form.site', 'Site')} htmlFor="asset-site">
                <Select
                  id="asset-site"
                  value={values.siteId}
                  onChange={(event) => {
                    const siteId = event.target.value;
                    setSelectedSiteId(siteId);
                    setValues((current) => ({ ...current, siteId, locationId: '' }));
                  }}
                  className="w-full"
                  placeholder={t('assets.form.sitePlaceholder', 'Select site')}
                >
                  <option value="">{t('assets.form.sitePlaceholder', 'Select site')}</option>
                  {sites.map((site: Site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('assets.form.location', 'Location')} htmlFor="asset-location">
                <Select
                  id="asset-location"
                  value={values.locationId}
                  onChange={(event) => setValues((current) => ({ ...current, locationId: event.target.value }))}
                  className="w-full"
                  disabled={!selectedSiteId}
                  placeholder={t('assets.form.locationPlaceholder', 'Select location')}
                >
                  <option value="">{t('assets.form.locationPlaceholder', 'Select location')}</option>
                  {selectedSiteLocations.map((locationOption) => (
                    <option key={locationOption.value} value={locationOption.value}>
                      {locationOption.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label={t('assets.form.container', 'Container')} htmlFor="asset-container">
                <Select
                  id="asset-container"
                  value={values.containerId}
                  onChange={(event) => setValues((current) => ({ ...current, containerId: event.target.value }))}
                  className="w-full"
                  placeholder={t('assets.form.containerPlaceholder', 'Optional')}
                >
                  <option value="">{t('assets.form.containerPlaceholder', 'Optional')}</option>
                  {containerOptions.map((container) => (
                    <option key={container.value} value={container.value}>
                      {container.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('assets.form.serialNumber', 'Serial number')} htmlFor="asset-serial">
                <Input
                  id="asset-serial"
                  value={values.serialNumber}
                  onChange={(event) => setValues((current) => ({ ...current, serialNumber: event.target.value }))}
                  placeholder={t('assets.form.serialPlaceholder', 'Optional')}
                />
              </FormField>
              <FormField label={t('assets.form.barcode', 'Barcode')} htmlFor="asset-barcode">
                <Input
                  id="asset-barcode"
                  value={values.barcode}
                  onChange={(event) => setValues((current) => ({ ...current, barcode: event.target.value }))}
                  placeholder={t('assets.form.barcodePlaceholder', 'Optional')}
                />
              </FormField>
            </div>

            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('assets.form.condition', 'Condition')} htmlFor="asset-condition">
                <Select
                  id="asset-condition"
                  value={values.condition}
                  onChange={(event) => setValues((current) => ({ ...current, condition: event.target.value }))}
                  className="w-full"
                >
                  <option value="Good">{t('assets.condition.good', 'Good')}</option>
                  <option value="Fair">{t('assets.condition.fair', 'Fair')}</option>
                  <option value="Poor">{t('assets.condition.poor', 'Poor')}</option>
                </Select>
              </FormField>
              <FormField label={t('assets.form.acquiredDate', 'Acquired date')} htmlFor="asset-acquired">
                <Input
                  id="asset-acquired"
                  type="date"
                  value={values.acquiredDate}
                  onChange={(event) => setValues((current) => ({ ...current, acquiredDate: event.target.value }))}
                />
              </FormField>
            </div>

            {mode === 'edit' ? (
              <FormField label={t('assets.form.status', 'Status')} htmlFor="asset-status">
                <Select
                  id="asset-status"
                  value={values.status}
                  onChange={(event) => setValues((current) => ({ ...current, status: event.target.value }))}
                  className="w-full"
                >
                  <option value="Available">{t('assets.status.available', 'Available')}</option>
                  <option value="Borrowed">{t('assets.status.borrowed', 'Borrowed')}</option>
                  <option value="Missing">{t('assets.status.missing', 'Missing')}</option>
                  <option value="Maintenance">{t('assets.status.maintenance', 'Maintenance')}</option>
                  <option value="Disposed">{t('assets.status.disposed', 'Disposed')}</option>
                </Select>
              </FormField>
            ) : null}

            <FormField label={t('assets.form.notes', 'Notes')} htmlFor="asset-notes">
              <Textarea
                id="asset-notes"
                rows={4}
                value={values.notes}
                onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
                placeholder={t('assets.form.notesPlaceholder', 'Optional notes')}
              />
            </FormField>
          </div>

          <DialogFooter className="border-t border-border/70 bg-muted/30 px-5 py-4 sm:px-6">
            <Button type="button" variant="outline" onClick={resetAndClose}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? t('common.saving', 'Saving...') : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
