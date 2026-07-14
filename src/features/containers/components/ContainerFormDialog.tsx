import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/forms/FormField';
import { useI18n } from '@/hooks/useI18n';
import { useContainers } from '@/features/containers/hooks/useContainers';
import type { Container } from '@/types/domain.types';

export interface ContainerFormValues {
  name: string;
  type: string;
  code: string;
  qrCode: string;
  parentContainerId: string;
}

export interface ContainerFormDialogProps {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  showParentSelector?: boolean;
  initialValues?: Partial<ContainerFormValues>;
  onSubmit: (values: ContainerFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

const EMPTY_VALUES: ContainerFormValues = {
  name: '',
  type: '',
  code: '',
  qrCode: '',
  parentContainerId: '',
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

export function ContainerFormDialog({
  wsId,
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  showParentSelector = false,
  initialValues,
  onSubmit,
  isSubmitting = false,
}: ContainerFormDialogProps) {
  const { t } = useI18n();
  const containersQuery = useContainers(wsId);
  const containerOptions = useMemo(() => flattenContainerOptions(containersQuery.data ?? []), [containersQuery.data]);
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
      parentContainerId: initialValues?.parentContainerId ?? '',
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
      parentContainerId: values.parentContainerId.trim(),
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
            {showParentSelector ? (
              <FormField
                label={t('containers.create.parent', 'Parent container')}
                htmlFor="container-parent"
                description={t('containers.create.parentHelp', 'Leave blank to create a top-level container.')}
              >
                <Select
                  id="container-parent"
                  value={values.parentContainerId}
                  onChange={(event) => setValues((current) => ({ ...current, parentContainerId: event.target.value }))}
                  className="w-full"
                  placeholder={t('containers.create.parentPlaceholder', 'Select parent container (optional)')}
                >
                  <option value="">{t('containers.create.parentRoot', 'Top-level container')}</option>
                  {containerOptions.map((container) => (
                    <option key={container.value} value={container.value}>
                      {container.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            ) : null}
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
