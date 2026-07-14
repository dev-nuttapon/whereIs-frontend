import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { useI18n } from '@/hooks/useI18n';
import type { Location, Site } from '@/types/domain.types';
import type { LocationTreeNode } from '@/api/location.api';

export interface LocationFormValues {
  siteId: string;
  parentLocationId: string;
  name: string;
  type: string;
  code: string;
  sortOrder: string;
  description: string;
}

export interface LocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  sites: Site[];
  locationTree: LocationTreeNode[];
  initialValues?: Partial<Location>;
  onSubmit: (values: LocationFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

const EMPTY_VALUES: LocationFormValues = {
  siteId: '',
  parentLocationId: '',
  name: '',
  type: '',
  code: '',
  sortOrder: '0',
  description: '',
};

function flattenTree(nodes: LocationTreeNode[], depth = 0): Array<{ value: string; label: string }> {
  return nodes.flatMap((node) => [
    {
      value: node.id,
      label: `${'— '.repeat(depth)}${node.name}${node.code ? ` (${node.code})` : ''}`,
    },
    ...flattenTree(node.children, depth + 1),
  ]);
}

export function LocationFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  sites,
  locationTree,
  initialValues,
  onSubmit,
  isSubmitting = false,
}: LocationFormDialogProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<LocationFormValues>(EMPTY_VALUES);

  const parentOptions = useMemo(() => flattenTree(locationTree), [locationTree]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues({
      siteId: initialValues?.siteId ?? sites[0]?.id ?? '',
      parentLocationId: initialValues?.parentLocationId ?? '',
      name: initialValues?.name ?? '',
      type: initialValues?.type ?? '',
      code: initialValues?.code ?? '',
      sortOrder: initialValues?.sortOrder?.toString() ?? '0',
      description: initialValues?.description ?? '',
    });
  }, [initialValues, open, sites]);

  const resetAndClose = () => {
    setValues(EMPTY_VALUES);
    onOpenChange(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      siteId: values.siteId,
      parentLocationId: values.parentLocationId,
      name: values.name.trim(),
      type: values.type.trim(),
      code: values.code.trim(),
      sortOrder: values.sortOrder,
      description: values.description.trim(),
    });
  };

  const canSubmit = Boolean(values.siteId && values.name.trim()) && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="max-w-[46rem]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="component-stack px-5 pb-5 sm:px-6">
            <FormField label={t('locations.form.site', 'Site')} htmlFor="location-site">
              <Select
                id="location-site"
                value={values.siteId}
                onChange={(event) => setValues((current) => ({ ...current, siteId: event.target.value, parentLocationId: '' }))}
                className="w-full"
              >
                <option value="">{t('locations.form.sitePlaceholder', 'เลือก site')}</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </Select>
            </FormField>

            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('locations.form.name', 'ชื่อ location')} htmlFor="location-name">
                <Input
                  id="location-name"
                  value={values.name}
                  onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                  placeholder={t('locations.form.namePlaceholder', 'เช่น ชั้นวาง A1')}
                  autoComplete="off"
                />
              </FormField>
              <FormField label={t('locations.form.type', 'ประเภท')} htmlFor="location-type">
                <Input
                  id="location-type"
                  value={values.type}
                  onChange={(event) => setValues((current) => ({ ...current, type: event.target.value }))}
                  placeholder={t('locations.form.typePlaceholder', 'เช่น shelf, bin')}
                  autoComplete="off"
                />
              </FormField>
            </div>

            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('locations.form.code', 'รหัส')} htmlFor="location-code">
                <Input
                  id="location-code"
                  value={values.code}
                  onChange={(event) => setValues((current) => ({ ...current, code: event.target.value }))}
                  placeholder={t('locations.form.codePlaceholder', 'เช่น A1-01')}
                  autoComplete="off"
                />
              </FormField>
              <FormField label={t('locations.form.sortOrder', 'ลำดับ')} htmlFor="location-sort">
                <Input
                  id="location-sort"
                  type="number"
                  value={values.sortOrder}
                  onChange={(event) => setValues((current) => ({ ...current, sortOrder: event.target.value }))}
                />
              </FormField>
            </div>

            <FormField label={t('locations.form.parent', 'Parent location')} htmlFor="location-parent">
              <Select
                id="location-parent"
                value={values.parentLocationId}
                onChange={(event) => setValues((current) => ({ ...current, parentLocationId: event.target.value }))}
                className="w-full"
                disabled={parentOptions.length === 0}
                placeholder={t('locations.form.parentPlaceholder', 'ไม่เลือกก็ได้')}
              >
                <option value="">{t('locations.form.parentPlaceholder', 'ไม่เลือกก็ได้')}</option>
                {parentOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </FormField>

            <FormField label={t('locations.form.description', 'รายละเอียด')} htmlFor="location-description">
              <Textarea
                id="location-description"
                value={values.description}
                onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                placeholder={t('locations.form.descriptionPlaceholder', 'รายละเอียดเพิ่มเติม')}
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
