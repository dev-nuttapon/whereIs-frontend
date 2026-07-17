import { useMemo } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { useUpdateProduct } from '@/features/products/hooks/useProducts';
import { ProductFormDialog } from '@/features/master-data/components/ProductFormDialog';
import type { Category, Product } from '@/types/domain.types';

interface EditProductDialogProps {
  wsId: string;
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
}

export function EditProductDialog({ wsId, product, open, onOpenChange, categories }: EditProductDialogProps) {
  const { t } = useI18n();
  const updateProduct = useUpdateProduct(wsId, product.id);
  const initialValues = useMemo(() => product, [product]);

  return (
    <ProductFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('products.edit.title', 'Edit product')}
      description={t('products.edit.description', 'Update the product master record used across the workspace.')}
      submitLabel={t('common.save', 'Save')}
      categories={categories}
      initialValues={initialValues}
      mode="edit"
      onSubmit={async (values) => {
        await updateProduct.mutateAsync({
          name: values.name,
          categoryId: values.categoryId || null,
          unitCode: values.unitCode || null,
          code: values.code || null,
          sku: values.sku || null,
          minStockAlert: values.minStockAlert ? Number(values.minStockAlert) : null,
          imageUrl: values.imageUrl || null,
          description: values.description || null,
          isActive: values.isActive === 'true',
        });
        onOpenChange(false);
      }}
      isSubmitting={updateProduct.isPending}
    />
  );
}
