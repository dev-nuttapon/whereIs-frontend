import { useI18n } from '@/hooks/useI18n';
import { useCreateProduct } from '@/features/products/hooks/useProducts';
import { ProductFormDialog } from '@/features/master-data/components/ProductFormDialog';
import type { Category, Product } from '@/types/domain.types';

interface CreateProductDialogProps {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onCreated?: (product: Product) => void;
  initialName?: string;
}

export function CreateProductDialog({ wsId, open, onOpenChange, categories, onCreated, initialName = '' }: CreateProductDialogProps) {
  const { t } = useI18n();
  const createProduct = useCreateProduct(wsId);

  return (
    <ProductFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('products.create.title', 'เพิ่มสินค้า')}
      description={t('products.create.description', 'Add a product that assets and stock entries can reference.')}
      submitLabel={t('products.create.action', 'Create product')}
      categories={categories}
      initialValues={{ name: initialName }}
      onSubmit={async (values) => {
        const product = await createProduct.mutateAsync({
          name: values.name,
          categoryId: values.categoryId || null,
          unitCode: values.unitCode || null,
          code: values.code || null,
          sku: values.sku || null,
          trackingType: values.trackingType,
          minStockAlert: values.minStockAlert ? Number(values.minStockAlert) : null,
          expiryLeadDaysDefault: values.expiryLeadDaysDefault ? Number(values.expiryLeadDaysDefault) : null,
          image: values.image,
          description: values.description || null,
        });
        onCreated?.(product);
        onOpenChange(false);
      }}
      isSubmitting={createProduct.isPending}
    />
  );
}
