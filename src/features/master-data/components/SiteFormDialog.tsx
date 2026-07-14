import { useEffect, useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { useI18n } from '@/hooks/useI18n';
import type { Site } from '@/types/domain.types';

export interface SiteFormValues {
  name: string;
  type: string;
  address: string;
  description: string;
}

export interface SiteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: Partial<Site>;
  onSubmit: (values: SiteFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

const EMPTY_VALUES: SiteFormValues = {
  name: '',
  type: '',
  address: '',
  description: '',
};

export function SiteFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  isSubmitting = false,
}: SiteFormDialogProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<SiteFormValues>(EMPTY_VALUES);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues({
      name: initialValues?.name ?? '',
      type: initialValues?.type ?? '',
      address: initialValues?.address ?? '',
      description: initialValues?.description ?? '',
    });
  }, [initialValues, open]);

  const resetAndClose = () => {
    setValues(EMPTY_VALUES);
    onOpenChange(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      name: values.name.trim(),
      type: values.type.trim(),
      address: values.address.trim(),
      description: values.description.trim(),
    });
  };

  const canSubmit = Boolean(values.name.trim()) && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="max-w-[40rem]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="component-stack px-5 pb-5 sm:px-6">
            <FormField label={t('sites.form.name', 'ชื่อ site')} htmlFor="site-name">
              <Input
                id="site-name"
                value={values.name}
                onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                placeholder={t('sites.form.namePlaceholder', 'เช่น Warehouse A')}
                autoComplete="off"
              />
            </FormField>
            <FormField label={t('sites.form.type', 'ประเภท')} htmlFor="site-type">
              <Input
                id="site-type"
                value={values.type}
                onChange={(event) => setValues((current) => ({ ...current, type: event.target.value }))}
                placeholder={t('sites.form.typePlaceholder', 'เช่น Warehouse, Office')}
                autoComplete="off"
              />
            </FormField>
            <FormField label={t('sites.form.address', 'ที่อยู่')} htmlFor="site-address">
              <Input
                id="site-address"
                value={values.address}
                onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))}
                placeholder={t('sites.form.addressPlaceholder', 'ที่ตั้งของ site')}
                autoComplete="off"
              />
            </FormField>
            <FormField label={t('sites.form.description', 'รายละเอียด')} htmlFor="site-description">
              <Textarea
                id="site-description"
                value={values.description}
                onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                placeholder={t('sites.form.descriptionPlaceholder', 'รายละเอียดเพิ่มเติม')}
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
