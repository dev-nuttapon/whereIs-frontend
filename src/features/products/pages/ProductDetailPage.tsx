import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Tag } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { ItemIcon, OpenIcon } from '@/components/ui/icons';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useProduct } from '@/features/products/hooks/useProducts';
import { useAssets } from '@/features/assets/hooks/useAssets';
import { useStockEntries } from '@/features/stock/hooks/useStock';
import { useBorrowOrders } from '@/features/borrow-orders/hooks/useBorrowOrders';

export function ProductDetailPage() {
  const { wsId = 'ws-warehouse', productId = '' } = useParams();
  const { t } = useI18n();
  const productQuery = useProduct(wsId, productId);
  const categoriesQuery = useCategories(wsId);
  const assetsQuery = useAssets(wsId, { productId, pageSize: 100 });
  const stockQuery = useStockEntries(wsId, { productId, pageSize: 100 });
  const borrowOrdersQuery = useBorrowOrders(wsId, { pageSize: 100 });
  const product = productQuery.data ?? null;
  const categories = categoriesQuery.data ?? [];

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name] as const)),
    [categories],
  );

  const assetCount = assetsQuery.data?.length ?? product?.assetCount ?? 0;
  const stockCount = stockQuery.data?.items.reduce((sum, entry) => sum + entry.quantity, 0) ?? product?.totalStock ?? 0;
  const linkedBorrowOrders = useMemo(
    () => (borrowOrdersQuery.data?.items ?? []).filter((order) => order.lines.some((line) => line.productId === productId)),
    [borrowOrdersQuery.data, productId],
  );

  return (
    <PageShell
      title={t('products.detail.title', 'Product detail')}
      description={t('products.detail.description', 'View the product master record and its downstream usage in assets, stock, and borrow flows.')}
    >
      <div className="component-stack">
        {productQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
        {productQuery.isError ? <ErrorState message={t('products.detail.error', 'Unable to load product.')} onRetry={() => productQuery.refetch()} /> : null}
        {categoriesQuery.isError ? <ErrorState message={t('products.categoriesLoadError', 'Unable to load categories.')} onRetry={() => categoriesQuery.refetch()} /> : null}

        {product ? (
          <>
            <Card>
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>{product.code ?? product.sku ?? product.id}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Tag color={product.trackingType.toLowerCase() === 'stock' ? 'blue' : 'geekblue'}>{product.trackingType}</Tag>
                    <Tag color={product.isActive ? 'green' : 'default'}>{product.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}</Tag>
                    <Tag>{categoryNameById.get(product.categoryId ?? '') ?? t('products.noCategory', 'No category')}</Tag>
                  </div>
                </div>

                {product.imageUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
                    <img src={product.imageUrl} alt={product.name} className="h-64 w-full object-cover" />
                  </div>
                ) : null}

                <div className="grid gap-[18px] md:grid-cols-3">
                  <StatCard label={t('products.stats.asset', 'Assets')} value={assetCount} />
                  <StatCard label={t('products.stats.stock', 'Stock')} value={stockCount} />
                  <StatCard label={t('products.detail.minStockAlert', 'Min alert')} value={product.minStockAlert ?? '-'} />
                </div>

                <div className="grid gap-[18px] md:grid-cols-2">
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('products.detail.metadata', 'Metadata')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('products.detail.unitCode', 'Unit')}: {product.unitCode ?? '-'}</p>
                      <p className="text-sm text-muted-foreground">{t('products.detail.code', 'Code')}: {product.code ?? '-'}</p>
                      <p className="text-sm text-muted-foreground">{t('products.detail.sku', 'SKU')}: {product.sku ?? '-'}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('products.detail.description', 'Description')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{product.description?.trim() ? product.description : t('products.detail.noDescription', 'No description')}</p>
                      <p className="text-sm text-muted-foreground">{t('products.detail.category', 'Category')}: {categoryNameById.get(product.categoryId ?? '') ?? t('products.noCategory', 'No category')}</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-5 sm:p-6">
                <CardTitle className="text-base">{t('products.detail.downstream', 'Downstream usage')}</CardTitle>
                <div className="grid gap-[18px] md:grid-cols-3">
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('products.detail.assetUsage', 'Assets')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('products.detail.assetUsageDescription', 'Assets linked to this product can be managed from the Assets page.')}</p>
                      <Button asChild variant="outline" size="sm" className="mt-2 rounded-full">
                        <Link to={ROUTES.workspaceAssets(wsId)}>
                          <OpenIcon className="h-4 w-4" />
                          {t('assets.title', 'Assets')}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('products.detail.stockUsage', 'Stock')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('products.detail.stockUsageDescription', 'Stock entries linked to this product can be adjusted from the Stock page.')}</p>
                      <Button asChild variant="outline" size="sm" className="mt-2 rounded-full">
                        <Link to={ROUTES.workspaceStock(wsId)}>
                          <OpenIcon className="h-4 w-4" />
                          {t('stock.title', 'Stock')}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('products.detail.borrowUsage', 'Borrow')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('products.detail.borrowUsageDescription', 'Borrow orders that reference this product appear in the borrow flow.')}</p>
                      <Button asChild variant="outline" size="sm" className="mt-2 rounded-full">
                        <Link to={ROUTES.workspaceBorrowOrders(wsId)}>
                          <OpenIcon className="h-4 w-4" />
                          {t('borrowOrders.title', 'Borrow orders')}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <CardTitle className="text-sm">{t('products.detail.borrowOrders', 'Borrow orders')}</CardTitle>
                  {linkedBorrowOrders.length === 0 ? (
                    <EmptyState
                      title={t('products.detail.noBorrowOrdersTitle', 'No borrow orders yet')}
                      description={t('products.detail.noBorrowOrdersDescription', 'Borrow orders that use this product will appear here after the first request.')}
                      icon={<ItemIcon className="h-5 w-5" />}
                    />
                  ) : (
                    <div className="component-stack">
                      {linkedBorrowOrders.map((order) => (
                        <div key={order.id} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-medium">{order.purpose ?? order.id}</p>
                              <p className="text-xs text-muted-foreground">{order.status}</p>
                            </div>
                            <Button asChild variant="outline" size="sm" className="rounded-full">
                              <Link to={ROUTES.workspaceBorrowOrderDetail(wsId, order.id)}>
                                <OpenIcon className="h-4 w-4" />
                                {t('common.open', 'Open')}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

    </PageShell>
  );
}
