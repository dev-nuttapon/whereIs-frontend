import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Popconfirm, Tag } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { PlusIcon, EditIcon, DatabaseIcon } from '@/components/ui/icons';
import { useI18n } from '@/hooks/useI18n';
import type { Category, Product } from '@/types/domain.types';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/features/products/hooks/useProducts';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/features/categories/hooks/useCategories';
import { ProductFormDialog } from '@/features/master-data/components/ProductFormDialog';
import { CategoryFormDialog } from '@/features/master-data/components/CategoryFormDialog';

function trackingTypeColor(trackingType: string) {
  const normalized = trackingType.toLowerCase();
  if (normalized === 'stock') return 'blue';
  if (normalized === 'asset') return 'geekblue';
  return 'default';
}

function statusColor(isActive: boolean) {
  return isActive ? 'green' : 'default';
}

function CategoryDot({ color }: { color?: string | null }) {
  return (
    <span
      aria-hidden
      className="inline-block h-3 w-3 rounded-full border border-border/60"
      style={{ backgroundColor: color ?? '#cbd5e1' }}
    />
  );
}

interface ProductCardActionsProps {
  wsId: string;
  product: Product;
  onEdit: (product: Product) => void;
}

function ProductCardActions({ wsId, product, onEdit }: ProductCardActionsProps) {
  const { t } = useI18n();
  const deleteProduct = useDeleteProduct(wsId, product.id);

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(product)} className="rounded-full">
        <EditIcon className="h-4 w-4" />
        {t('common.edit', 'แก้ไข')}
      </Button>
      <Popconfirm
        title={t('masterData.products.deleteConfirmTitle', 'Delete this product?')}
        description={t('masterData.products.deleteConfirmDescription', 'This product will be removed from the workspace.')}
        okText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        okButtonProps={{ danger: true }}
        onConfirm={async () => {
          await deleteProduct.mutateAsync();
        }}
      >
        <Button variant="destructive" size="sm" disabled={deleteProduct.isPending} className="rounded-full">
          {deleteProduct.isPending ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
        </Button>
      </Popconfirm>
    </div>
  );
}

interface CategoryCardActionsProps {
  wsId: string;
  category: Category;
  onEdit: (category: Category) => void;
}

function CategoryCardActions({ wsId, category, onEdit }: CategoryCardActionsProps) {
  const { t } = useI18n();
  const deleteCategory = useDeleteCategory(wsId, category.id);

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(category)} className="rounded-full">
        <EditIcon className="h-4 w-4" />
        {t('common.edit', 'แก้ไข')}
      </Button>
      <Popconfirm
        title={t('masterData.categories.deleteConfirmTitle', 'Delete this category?')}
        description={t('masterData.categories.deleteConfirmDescription', 'Products can lose their category when you delete this.')}
        okText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        okButtonProps={{ danger: true }}
        onConfirm={async () => {
          await deleteCategory.mutateAsync();
        }}
      >
        <Button variant="destructive" size="sm" disabled={deleteCategory.isPending} className="rounded-full">
          {deleteCategory.isPending ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
        </Button>
      </Popconfirm>
    </div>
  );
}

interface EditProductDialogProps {
  wsId: string;
  product: Product;
  categories: Category[];
  onClose: () => void;
}

function EditProductDialog({ wsId, product, categories, onClose }: EditProductDialogProps) {
  const { t } = useI18n();
  const updateProduct = useUpdateProduct(wsId, product.id);

  return (
    <ProductFormDialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      title={t('masterData.products.editTitle', 'Edit product')}
      description={t('masterData.products.editDescription', 'Update product details.')}
      submitLabel={t('common.save', 'บันทึก')}
      categories={categories}
      mode="edit"
      initialValues={product}
      onSubmit={async (values) => {
        await updateProduct.mutateAsync({
          name: values.name,
          categoryId: values.categoryId || null,
          unitCode: values.unitCode || null,
          code: values.code || null,
          sku: values.sku || null,
          minStockAlert: values.minStockAlert ? Number(values.minStockAlert) : null,
          imageUrl: values.imageUrl || null,
          isActive: values.isActive === 'true',
        });
        onClose();
      }}
      isSubmitting={updateProduct.isPending}
    />
  );
}

interface EditCategoryDialogProps {
  wsId: string;
  category: Category;
  onClose: () => void;
}

function EditCategoryDialog({ wsId, category, onClose }: EditCategoryDialogProps) {
  const { t } = useI18n();
  const updateCategory = useUpdateCategory(wsId, category.id);

  return (
    <CategoryFormDialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      title={t('masterData.categories.editTitle', 'Edit category')}
      description={t('masterData.categories.editDescription', 'Update category details.')}
      submitLabel={t('common.save', 'บันทึก')}
      mode="edit"
      initialValues={category}
      onSubmit={async (values) => {
        await updateCategory.mutateAsync({
          name: values.name,
          description: values.description || null,
          color: values.color || null,
          isActive: values.isActive === 'true',
        });
        onClose();
      }}
      isSubmitting={updateCategory.isPending}
    />
  );
}

export function MasterDataPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t } = useI18n();
  const productsQuery = useProducts(wsId);
  const categoriesQuery = useCategories(wsId);
  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const createProduct = useCreateProduct(wsId);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [createProductOpen, setCreateProductOpen] = useState(false);

  const createCategory = useCreateCategory(wsId);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);

  const stats = useMemo(() => [
    { label: t('masterData.stats.products', 'Products'), value: products.length },
    { label: t('masterData.stats.stockProducts', 'Stock products'), value: products.filter((product) => product.trackingType === 'Stock').length },
    { label: t('masterData.stats.categories', 'Categories'), value: categories.length },
    { label: t('masterData.stats.activeProducts', 'Active products'), value: products.filter((product) => product.isActive).length },
  ], [categories.length, products, t]);

  const productTab = (
    <div className="component-stack">
      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div className="space-y-1">
            <CardTitle className="text-lg">{t('masterData.products.title', 'Products')}</CardTitle>
            <CardDescription>{t('masterData.products.description', 'Manage product master data used by items and stock')}</CardDescription>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => setCreateProductOpen(true)}>
            <PlusIcon className="h-4 w-4" />
            {t('masterData.products.create', 'Create product')}
          </Button>
        </CardContent>
      </Card>

      {productsQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {productsQuery.isError ? <ErrorState message={t('masterData.products.error', 'Unable to load products.')} onRetry={() => productsQuery.refetch()} /> : null}

      {products.length === 0 ? (
        <EmptyState
          title={t('masterData.products.emptyTitle', 'No products yet')}
          description={t('masterData.products.emptyDescription', 'Create the first product so items can use it.')}
          icon={<DatabaseIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.code ?? product.sku ?? product.id}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Tag color={trackingTypeColor(product.trackingType)}>{product.trackingType}</Tag>
                  <Tag color={statusColor(product.isActive)}>{product.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}</Tag>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>{t('masterData.products.category', 'Category')}: {product.categoryName ?? '-'}</div>
                  <div>{t('masterData.products.unit', 'Unit')}: {product.unitCode ?? '-'}</div>
                  <div>{t('masterData.products.assetCount', 'Items')}: {product.assetCount}</div>
                  <div>{t('masterData.products.totalStock', 'Stock')}: {product.totalStock}</div>
                  <div>{t('masterData.products.minStockAlert', 'Min stock alert')}: {product.minStockAlert ?? '-'}</div>
                </div>
                <ProductCardActions wsId={wsId} product={product} onEdit={setEditProduct} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const categoryTab = (
    <div className="component-stack">
      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div className="space-y-1">
            <CardTitle className="text-lg">{t('masterData.categories.title', 'Categories')}</CardTitle>
            <CardDescription>{t('masterData.categories.description', 'Group products by category and color')}</CardDescription>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => setCreateCategoryOpen(true)}>
            <PlusIcon className="h-4 w-4" />
            {t('masterData.categories.create', 'Create category')}
          </Button>
        </CardContent>
      </Card>

      {categoriesQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {categoriesQuery.isError ? <ErrorState message={t('masterData.categories.error', 'Unable to load categories.')} onRetry={() => categoriesQuery.refetch()} /> : null}

      {categories.length === 0 ? (
        <EmptyState
          title={t('masterData.categories.emptyTitle', 'No categories yet')}
          description={t('masterData.categories.emptyDescription', 'Create the first category to organize products.')}
          icon={<DatabaseIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>{category.description ?? category.id}</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryDot color={category.color} />
                  <span className="text-sm text-muted-foreground">{category.color ?? t('masterData.categories.noColor', 'No color')}</span>
                  <Tag color={statusColor(category.isActive)}>{category.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}</Tag>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>{t('masterData.categories.productCount', 'Products')}: {category.productCount}</div>
                </div>
                <CategoryCardActions wsId={wsId} category={category} onEdit={setEditCategory} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PageShell
      title={t('masterData.title', 'Master data')}
      description={t('masterData.description', 'Manage the base records used by items, containers, borrow flows, and stock.')}
    >
      <div className="grid gap-[18px] md:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <Tabs
        defaultActiveKey="products"
        items={[
          { key: 'products', label: t('masterData.products.tab', 'Products'), children: productTab },
          { key: 'categories', label: t('masterData.categories.tab', 'Categories'), children: categoryTab },
        ]}
      />

      <ProductFormDialog
        open={createProductOpen}
        onOpenChange={setCreateProductOpen}
        title={t('masterData.products.createTitle', 'Create product')}
        description={t('masterData.products.createDescription', 'Add a new product for items or stock.')}
        submitLabel={t('masterData.products.createSubmit', 'Create product')}
        categories={categories}
        onSubmit={async (values) => {
          await createProduct.mutateAsync({
            name: values.name,
            categoryId: values.categoryId || null,
            unitCode: values.unitCode || null,
            code: values.code || null,
            sku: values.sku || null,
            trackingType: values.trackingType,
            minStockAlert: values.minStockAlert ? Number(values.minStockAlert) : null,
            imageUrl: values.imageUrl || null,
            description: values.description || null,
          });
          setCreateProductOpen(false);
        }}
        isSubmitting={createProduct.isPending}
      />

      {editProduct ? (
        <EditProductDialog
          wsId={wsId}
          product={editProduct}
          categories={categories}
          onClose={() => setEditProduct(null)}
        />
      ) : null}

      <CategoryFormDialog
        open={createCategoryOpen}
        onOpenChange={setCreateCategoryOpen}
        title={t('masterData.categories.createTitle', 'Create category')}
        description={t('masterData.categories.createDescription', 'Add a new category for products.')}
        submitLabel={t('masterData.categories.createSubmit', 'Create category')}
        onSubmit={async (values) => {
          await createCategory.mutateAsync({
            name: values.name,
            description: values.description || null,
            color: values.color || null,
          });
          setCreateCategoryOpen(false);
        }}
        isSubmitting={createCategory.isPending}
      />

      {editCategory ? (
        <EditCategoryDialog
          wsId={wsId}
          category={editCategory}
          onClose={() => setEditCategory(null)}
        />
      ) : null}
    </PageShell>
  );
}
