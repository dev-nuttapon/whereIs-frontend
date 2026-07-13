import { useEffect, useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { useI18n } from '@/hooks/useI18n';
import type { Category } from '@/types/domain.types';

export interface CategoryFormValues {
  name: string;
  description: string;
  color: string;
  isActive: 'true' | 'false';
}

export interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: Partial<Category>;
  onSubmit: (values: CategoryFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

const EMPTY_VALUES: CategoryFormValues = {
  name: '',
  description: '',
  color: '',
  isActive: 'true',
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  isSubmitting = false,
  mode = 'create',
}: CategoryFormDialogProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<CategoryFormValues>(EMPTY_VALUES);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues({
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
      color: initialValues?.color ?? '',
      isActive: initialValues?.isActive === false ? 'false' : 'true',
    });
  }, [initialValues, open]);

  const resetAndClose = () => {
    setValues(EMPTY_VALUES);
    onOpenChange(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description.trim(),
      color: values.color.trim(),
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
            <FormField label={t('categories.form.name', 'ชื่อหมวดหมู่')} htmlFor="category-name">
              <Input
                id="category-name"
                value={values.name}
                onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                placeholder={t('categories.form.namePlaceholder', 'เช่น เครื่องใช้ไฟฟ้า')}
                autoComplete="off"
              />
            </FormField>

            <FormField label={t('categories.form.color', 'สี')} htmlFor="category-color">
              <Input
                id="category-color"
                value={values.color}
                onChange={(event) => setValues((current) => ({ ...current, color: event.target.value }))}
                placeholder={t('categories.form.colorPlaceholder', 'เช่น #4f46e5')}
                autoComplete="off"
              />
            </FormField>

            <FormField label={t('categories.form.description', 'รายละเอียด')} htmlFor="category-description">
              <Textarea
                id="category-description"
                value={values.description}
                onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                placeholder={t('categories.form.descriptionPlaceholder', 'รายละเอียดเพิ่มเติม')}
              />
            </FormField>

            {mode === 'edit' ? (
              <FormField label={t('categories.form.active', 'สถานะ')} htmlFor="category-active">
                <Select
                  id="category-active"
                  value={values.isActive}
                  onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.value as 'true' | 'false' }))}
                  className="w-full"
                >
                  <option value="true">{t('common.active', 'Active')}</option>
                  <option value="false">{t('common.inactive', 'Inactive')}</option>
                </Select>
              </FormField>
            ) : null}
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
