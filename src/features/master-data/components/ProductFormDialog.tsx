import { useEffect, useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { useI18n } from '@/hooks/useI18n';
import type { Category, Product } from '@/types/domain.types';

export interface ProductFormValues {
  name: string;
  categoryId: string;
  unitCode: string;
  code: string;
  sku: string;
  trackingType: 'Asset' | 'Stock';
  minStockAlert: string;
  imageUrl: string;
  description: string;
  isActive: 'true' | 'false';
}

export interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  categories: Category[];
  initialValues?: Partial<Product>;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

const EMPTY_VALUES: ProductFormValues = {
  name: '',
  categoryId: '',
  unitCode: '',
  code: '',
  sku: '',
  trackingType: 'Asset',
  minStockAlert: '',
  imageUrl: '',
  description: '',
  isActive: 'true',
};

export function ProductFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  categories,
  initialValues,
  onSubmit,
  isSubmitting = false,
  mode = 'create',
}: ProductFormDialogProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<ProductFormValues>(EMPTY_VALUES);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues({
      name: initialValues?.name ?? '',
      categoryId: initialValues?.categoryId ?? '',
      unitCode: initialValues?.unitCode ?? '',
      code: initialValues?.code ?? '',
      sku: initialValues?.sku ?? '',
      trackingType: (initialValues?.trackingType as ProductFormValues['trackingType']) ?? 'Asset',
      minStockAlert: initialValues?.minStockAlert?.toString() ?? '',
      imageUrl: initialValues?.imageUrl ?? '',
      description: initialValues?.description ?? '',
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
      categoryId: values.categoryId.trim(),
      unitCode: values.unitCode.trim(),
      code: values.code.trim(),
      sku: values.sku.trim(),
      description: values.description.trim(),
      imageUrl: values.imageUrl.trim(),
      minStockAlert: values.minStockAlert.trim(),
    });
  };

  const canSubmit = Boolean(values.name.trim()) && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="max-w-[46rem]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="component-stack px-5 pb-5 sm:px-6">
            <FormField label={t('products.form.name', 'ชื่อสินค้า')} htmlFor="product-name">
              <Input
                id="product-name"
                value={values.name}
                onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                placeholder={t('products.form.namePlaceholder', 'เช่น Notebook Dell')}
                autoComplete="off"
              />
            </FormField>

            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('products.form.category', 'หมวดหมู่')} htmlFor="product-category">
                <Select
                  id="product-category"
                  value={values.categoryId}
                  onChange={(event) => setValues((current) => ({ ...current, categoryId: event.target.value }))}
                  className="w-full"
                  placeholder={t('products.form.categoryPlaceholder', 'ไม่เลือกก็ได้')}
                >
                  <option value="">{t('products.form.categoryPlaceholder', 'ไม่เลือกก็ได้')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label={t('products.form.trackingType', 'Tracking type')} htmlFor="product-tracking">
                <Select
                  id="product-tracking"
                  value={values.trackingType}
                  onChange={(event) => setValues((current) => ({ ...current, trackingType: event.target.value as ProductFormValues['trackingType'] }))}
                  className="w-full"
                >
                  <option value="Asset">Asset</option>
                  <option value="Stock">Stock</option>
                </Select>
              </FormField>
            </div>

            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('products.form.code', 'รหัสสินค้า')} htmlFor="product-code">
                <Input
                  id="product-code"
                  value={values.code}
                  onChange={(event) => setValues((current) => ({ ...current, code: event.target.value }))}
                  placeholder={t('products.form.codePlaceholder', 'เช่น P-1001')}
                  autoComplete="off"
                />
              </FormField>
              <FormField label={t('products.form.sku', 'SKU')} htmlFor="product-sku">
                <Input
                  id="product-sku"
                  value={values.sku}
                  onChange={(event) => setValues((current) => ({ ...current, sku: event.target.value }))}
                  placeholder={t('products.form.skuPlaceholder', 'เช่น SKU-001')}
                  autoComplete="off"
                />
              </FormField>
            </div>

            <div className="grid gap-[18px] sm:grid-cols-2">
              <FormField label={t('products.form.unitCode', 'หน่วย')} htmlFor="product-unit">
                <Input
                  id="product-unit"
                  value={values.unitCode}
                  onChange={(event) => setValues((current) => ({ ...current, unitCode: event.target.value }))}
                  placeholder={t('products.form.unitPlaceholder', 'เช่น pcs')}
                  autoComplete="off"
                />
              </FormField>
              <FormField label={t('products.form.minStockAlert', 'เตือนสต็อกขั้นต่ำ')} htmlFor="product-min-stock">
                <Input
                  id="product-min-stock"
                  type="number"
                  value={values.minStockAlert}
                  onChange={(event) => setValues((current) => ({ ...current, minStockAlert: event.target.value }))}
                  placeholder={t('products.form.minStockPlaceholder', 'เช่น 10')}
                />
              </FormField>
            </div>

            <FormField label={t('products.form.imageUrl', 'รูปสินค้า')} htmlFor="product-image">
              <Input
                id="product-image"
                value={values.imageUrl}
                onChange={(event) => setValues((current) => ({ ...current, imageUrl: event.target.value }))}
                placeholder={t('products.form.imagePlaceholder', 'วาง URL รูปภาพ')}
                autoComplete="off"
              />
            </FormField>

            <FormField label={t('products.form.description', 'รายละเอียด')} htmlFor="product-description">
              <Textarea
                id="product-description"
                value={values.description}
                onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                placeholder={t('products.form.descriptionPlaceholder', 'รายละเอียดเพิ่มเติม')}
              />
            </FormField>

            {mode === 'edit' ? (
              <FormField label={t('products.form.active', 'สถานะ')} htmlFor="product-active">
                <Select
                  id="product-active"
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
