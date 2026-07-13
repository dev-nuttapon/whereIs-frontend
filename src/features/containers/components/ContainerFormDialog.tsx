import { useEffect, useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';
import { useI18n } from '@/hooks/useI18n';

export interface ContainerFormValues {
  name: string;
  type: string;
  code: string;
  qrCode: string;
}

export interface ContainerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: Partial<ContainerFormValues>;
  onSubmit: (values: ContainerFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

const EMPTY_VALUES: ContainerFormValues = {
  name: '',
  type: '',
  code: '',
  qrCode: '',
};

export function ContainerFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  isSubmitting = false,
}: ContainerFormDialogProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<ContainerFormValues>(EMPTY_VALUES);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues({
      name: initialValues?.name ?? '',
      type: initialValues?.type ?? '',
      code: initialValues?.code ?? '',
      qrCode: initialValues?.qrCode ?? '',
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
      code: values.code.trim(),
      qrCode: values.qrCode.trim(),
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
            <FormField label={t('containers.create.name', 'ชื่อ container')} htmlFor="container-name">
              <Input
                id="container-name"
                value={values.name}
                onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                placeholder={t('containers.create.namePlaceholder', 'เช่น Shelf A1')}
                autoComplete="off"
              />
            </FormField>
            <FormField label={t('containers.create.type', 'ประเภท')} htmlFor="container-type">
              <Input
                id="container-type"
                value={values.type}
                onChange={(event) => setValues((current) => ({ ...current, type: event.target.value }))}
                placeholder={t('containers.create.typePlaceholder', 'เช่น shelf, box, drawer')}
                autoComplete="off"
              />
            </FormField>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label={t('containers.create.code', 'รหัส')} htmlFor="container-code">
                <Input
                  id="container-code"
                  value={values.code}
                  onChange={(event) => setValues((current) => ({ ...current, code: event.target.value }))}
                  placeholder={t('containers.create.codePlaceholder', 'เช่น A1-01')}
                  autoComplete="off"
                />
              </FormField>
              <FormField label={t('containers.create.qrCode', 'QR code')} htmlFor="container-qr">
                <Input
                  id="container-qr"
                  value={values.qrCode}
                  onChange={(event) => setValues((current) => ({ ...current, qrCode: event.target.value }))}
                  placeholder={t('containers.create.qrPlaceholder', 'วางค่า QR ถ้ามี')}
                  autoComplete="off"
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
