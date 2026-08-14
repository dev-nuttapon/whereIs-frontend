import { useMemo, useState } from 'react';
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
import { CreateAssetDialog } from '@/features/assets/components/CreateAssetDialog';
import { safeAssetUrl } from '@/lib/safe-url';

export function ProductDetailPage() {
  const { wsId = '', productId = '' } = useParams();
  const { t } = useI18n();
  const productQuery = useProduct(wsId, productId);
  const categoriesQuery = useCategories(wsId);
  const assetsQuery = useAssets(wsId, { productId, pageSize: 100 });
  const stockQuery = useStockEntries(wsId, { productId, pageSize: 100 });
  const borrowOrdersQuery = useBorrowOrders(wsId, { pageSize: 100 });
  const product = productQuery.data ?? null;
  const categories = categoriesQuery.data ?? [];
  const [createAssetOpen, setCreateAssetOpen] = useState(false);

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
      title={t('products.detail.title', 'รายละเอียดสินค้า')}
      description={t('products.detail.description', 'ดูข้อมูลสินค้าหลักและการใช้งานในทรัพย์สิน สต็อก และรายการยืม')}
    >
      <div className="component-stack">
        {productQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
        {productQuery.isError ? <ErrorState message={t('products.detail.error', 'ไม่สามารถโหลดสินค้าได้')} onRetry={() => productQuery.refetch()} /> : null}
        {categoriesQuery.isError ? <ErrorState message={t('products.categoriesLoadError', 'ไม่สามารถโหลดหมวดหมู่ได้')} onRetry={() => categoriesQuery.refetch()} /> : null}

        {product ? (
          <>
            <Card className="overflow-hidden border-border/80 shadow-sm">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="-mx-5 -mt-5 flex flex-col gap-3 border-b border-border/70 bg-muted/30 p-5 sm:-mx-6 sm:-mt-6 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>{product.code ?? product.sku ?? product.id}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Tag color={product.trackingType.toLowerCase() === 'stock' ? 'blue' : 'geekblue'}>{product.trackingType}</Tag>
                    <Tag color={product.isActive ? 'green' : 'default'}>{product.isActive ? t('common.active', 'ใช้งานอยู่') : t('common.inactive', 'ไม่ใช้งาน')}</Tag>
                    <Tag>{categoryNameById.get(product.categoryId ?? '') ?? t('products.noCategory', 'ไม่มีหมวดหมู่')}</Tag>
                    {product.trackingType.toLowerCase() === 'asset' ? (
                      <Button size="sm" onClick={() => setCreateAssetOpen(true)}>
                        {t('assets.create.action', 'เพิ่ม Asset')}
                      </Button>
                    ) : null}
                    {product.trackingType.toLowerCase() === 'stock' ? (
                      <Button asChild size="sm">
                        <Link to={`${ROUTES.workspaceStock(wsId)}?productId=${encodeURIComponent(product.id)}`}>
                          {t('stock.adjust.open', 'เพิ่ม Stock')}
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>

                {product.imageUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
                    <img src={safeAssetUrl(product.imageUrl)} alt={product.name} className="h-64 w-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard label={t('products.stats.asset', 'ทรัพย์สิน')} value={assetCount} />
                  <StatCard label={t('products.stats.stock', 'สต็อก')} value={stockCount} />
                  <StatCard label={t('products.detail.minStockAlert', 'แจ้งเตือนขั้นต่ำ')} value={product.minStockAlert ?? '-'} />
                </div>

                <div className="grid gap-[18px] md:grid-cols-2">
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('products.detail.metadata', 'ข้อมูลประกอบ')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('products.detail.unitCode', 'หน่วย')}: {product.unitCode ?? '-'}</p>
                      <p className="text-sm text-muted-foreground">{t('products.detail.code', 'รหัส')}: {product.code ?? '-'}</p>
                      <p className="text-sm text-muted-foreground">{t('products.detail.sku', 'SKU')}: {product.sku ?? '-'}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('products.detail.description', 'คำอธิบาย')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{product.description?.trim() ? product.description : t('products.detail.noDescription', 'ไม่มีคำอธิบาย')}</p>
                      <p className="text-sm text-muted-foreground">{t('products.detail.category', 'หมวดหมู่')}: {categoryNameById.get(product.categoryId ?? '') ?? t('products.noCategory', 'ไม่มีหมวดหมู่')}</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-5 sm:p-6">
                <CardTitle className="text-base">{t('products.detail.downstream', 'การใช้งานต่อเนื่อง')}</CardTitle>
                <div className="grid gap-[18px] md:grid-cols-3">
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('products.detail.assetUsage', 'ทรัพย์สิน')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('products.detail.assetUsageDescription', 'จัดการทรัพย์สินที่เชื่อมโยงกับสินค้านี้ได้จากหน้า Assets')}</p>
                      <Button asChild variant="outline" size="sm" className="mt-2 rounded-full">
                        <Link to={ROUTES.workspaceAssets(wsId)}>
                          <OpenIcon className="h-4 w-4" />
                          {t('assets.title', 'ทรัพย์สิน')}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('products.detail.stockUsage', 'สต็อก')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('products.detail.stockUsageDescription', 'ปรับรายการสต็อกที่เชื่อมโยงกับสินค้านี้ได้จากหน้า Stock')}</p>
                      <Button asChild variant="outline" size="sm" className="mt-2 rounded-full">
                        <Link to={ROUTES.workspaceStock(wsId)}>
                          <OpenIcon className="h-4 w-4" />
                          {t('stock.title', 'สต็อก')}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('products.detail.borrowUsage', 'การยืม')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('products.detail.borrowUsageDescription', 'รายการยืมที่อ้างอิงสินค้านี้จะแสดงในขั้นตอนการยืม')}</p>
                      <Button asChild variant="outline" size="sm" className="mt-2 rounded-full">
                        <Link to={ROUTES.workspaceBorrowOrders(wsId)}>
                          <OpenIcon className="h-4 w-4" />
                          {t('borrowOrders.title', 'รายการยืม')}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <CardTitle className="text-sm">{t('products.detail.borrowOrders', 'รายการยืม')}</CardTitle>
                  {linkedBorrowOrders.length === 0 ? (
                    <EmptyState
                      title={t('products.detail.noBorrowOrdersTitle', 'ยังไม่มีรายการยืม')}
                      description={t('products.detail.noBorrowOrdersDescription', 'รายการยืมที่ใช้สินค้านี้จะแสดงที่นี่หลังจากมีคำขอแรก')}
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
                                {t('common.open', 'เปิด')}
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

      <CreateAssetDialog
        wsId={wsId}
        open={createAssetOpen}
        onOpenChange={setCreateAssetOpen}
        initialValues={{ productId }}
      />

    </PageShell>
  );
}
