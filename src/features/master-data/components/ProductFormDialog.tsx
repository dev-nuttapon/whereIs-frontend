import { useEffect, useState, type DragEvent, type FormEvent } from 'react';
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
  expiryLeadDaysDefault: string;
  image: File | null;
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
  expiryLeadDaysDefault: '',
  image: null,
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
  const [imageError, setImageError] = useState('');
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const setImageFile = (file: File | null) => {
    setImageError('');
    if (!file) {
      setValues((current) => ({ ...current, image: null }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setImageError(t('products.form.imageTypeError', 'กรุณาเลือกไฟล์รูปภาพเท่านั้น'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError(t('products.form.imageSizeError', 'รูปภาพต้องมีขนาดไม่เกิน 5 MB'));
      return;
    }
    setValues((current) => ({ ...current, image: file }));
  };

  const handleImageDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingImage(false);
    setImageFile(event.dataTransfer.files[0] ?? null);
  };

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
      expiryLeadDaysDefault: initialValues?.expiryLeadDaysDefault?.toString() ?? '',
      image: null,
      description: initialValues?.description ?? '',
      isActive: initialValues?.isActive === false ? 'false' : 'true',
    });
    setImageError('');
    setIsDraggingImage(false);
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
      minStockAlert: values.minStockAlert.trim(),
      expiryLeadDaysDefault: values.expiryLeadDaysDefault.trim(),
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
          <div className="component-stack dialog-form-body">
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
            <FormField label={t('products.form.expiryLeadDaysDefault', 'แจ้งเตือนก่อนหมดอายุ (วัน)')} htmlFor="product-expiry-lead-days">
              <Input id="product-expiry-lead-days" type="number" min="0" value={values.expiryLeadDaysDefault} onChange={(event) => setValues((current) => ({ ...current, expiryLeadDaysDefault: event.target.value }))} placeholder={t('products.form.expiryLeadDaysDefaultPlaceholder', 'ไม่บังคับ')} />
            </FormField>

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

            <FormField label={t('products.form.imageUpload', 'รูปหลักสินค้า')} htmlFor="product-image">
              <label
                htmlFor="product-image"
                onDragOver={(event) => { event.preventDefault(); setIsDraggingImage(true); }}
                onDragLeave={() => setIsDraggingImage(false)}
                onDrop={handleImageDrop}
                className={`relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${isDraggingImage ? 'border-primary bg-primary/10' : 'border-border/80 bg-muted/20 hover:border-primary/60 hover:bg-muted/40'}`}
              >
                {values.image ? (
                  <div className="flex w-full items-center gap-4 text-left">
                    <img src={URL.createObjectURL(values.image)} alt="" className="h-20 w-20 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{values.image.name}</p>
                      <p className="text-xs text-muted-foreground">{(values.image.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p className="mt-1 text-xs text-primary">{t('products.form.imageReplace', 'คลิกเพื่อเปลี่ยนรูป')}</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setImageFile(null); }}>
                      {t('common.remove', 'ลบ')}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-2 rounded-full bg-primary/10 px-3 py-2 text-primary">↑</div>
                    <p className="text-sm font-medium">{t('products.form.imageDropTitle', 'ลากรูปมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์')}</p>
                    <p className="mt-1 text-xs text-muted-foreground">JPG, PNG หรือ WebP · สูงสุด 5 MB</p>
                  </>
                )}
                <Input id="product-image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
              </label>
              {imageError ? <p className="mt-1 text-sm text-destructive">{imageError}</p> : null}
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
