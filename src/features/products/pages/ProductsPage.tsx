import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Tag } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { FilterIcon, OpenIcon, ItemIcon } from '@/components/ui/icons';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useProducts } from '@/features/products/hooks/useProducts';
import type { Product } from '@/types/domain.types';

interface ProductFilters {
  search: string;
  categoryId: string;
  trackingType: string;
  status: string;
}

const DEFAULT_FILTERS: ProductFilters = {
  search: '',
  categoryId: '',
  trackingType: '',
  status: '',
};

function trackingTypeColor(trackingType: string) {
  const normalized = trackingType.toLowerCase();
  if (normalized === 'stock') return 'blue';
  if (normalized === 'asset') return 'geekblue';
  return 'default';
}

export function ProductsPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t } = useI18n();
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);

  const productsQuery = useProducts(wsId);
  const categoriesQuery = useCategories(wsId);
  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const hasActiveFilters = Boolean(filters.search.trim() || filters.categoryId || filters.trackingType || filters.status);

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name] as const)),
    [categories],
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !filters.search.trim() ||
      product.name.toLowerCase().includes(filters.search.trim().toLowerCase()) ||
      (product.code ?? '').toLowerCase().includes(filters.search.trim().toLowerCase()) ||
      (product.sku ?? '').toLowerCase().includes(filters.search.trim().toLowerCase());
    const matchesCategory = !filters.categoryId || product.categoryId === filters.categoryId;
    const matchesTracking = !filters.trackingType || product.trackingType === filters.trackingType;
    const matchesStatus =
      !filters.status ||
      (filters.status === 'active' && product.isActive) ||
      (filters.status === 'inactive' && !product.isActive);
    return matchesSearch && matchesCategory && matchesTracking && matchesStatus;
  });

  const stats = [
    { label: t('products.stats.total', 'Products'), value: filteredProducts.length },
    { label: t('products.stats.asset', 'Asset products'), value: filteredProducts.filter((product) => product.trackingType === 'Asset').length },
    { label: t('products.stats.stock', 'Stock products'), value: filteredProducts.filter((product) => product.trackingType === 'Stock').length },
  ];

  return (
    <PageShell
      title={t('products.title', 'Products')}
      description={t('products.description', 'Browse the operational product catalog used by assets, stock, and borrow flows. Create and edit products in Master data.')}
    >
      {productsQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {productsQuery.isError ? <ErrorState message={t('products.error', 'Unable to load products.')} onRetry={() => productsQuery.refetch()} /> : null}
      {categoriesQuery.isError ? <ErrorState message={t('products.categoriesLoadError', 'Unable to load categories.')} onRetry={() => categoriesQuery.refetch()} /> : null}

      <Card className="shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('products.filters.title', 'Search and filter')}</p>
                <p className="text-xs text-muted-foreground">{t('products.filters.description', 'Search by name, code, SKU, category, tracking type, or status.')}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              disabled={!hasActiveFilters}
            >
              {t('products.filters.clear', 'Clear filters')}
            </Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
            <Input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder={t('products.filters.searchPlaceholder', 'Search product')}
              className="rounded-full"
            />
            <Select
              className="w-full"
              value={filters.categoryId}
              onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value }))}
              placeholder={t('products.filters.allCategories', 'All categories')}
            >
              <option value="">{t('products.filters.allCategories', 'All categories')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Select
              className="w-full"
              value={filters.trackingType}
              onChange={(event) => setFilters((current) => ({ ...current, trackingType: event.target.value }))}
              placeholder={t('products.filters.allTrackingTypes', 'All tracking types')}
            >
              <option value="">{t('products.filters.allTrackingTypes', 'All tracking types')}</option>
              <option value="Asset">{t('products.tracking.asset', 'Asset')}</option>
              <option value="Stock">{t('products.tracking.stock', 'Stock')}</option>
            </Select>
            <Select
              className="w-full"
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              placeholder={t('products.filters.allStatus', 'All status')}
            >
              <option value="">{t('products.filters.allStatus', 'All status')}</option>
              <option value="active">{t('common.active', 'Active')}</option>
              <option value="inactive">{t('common.inactive', 'Inactive')}</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-[18px] md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? t('products.filteredEmptyTitle', 'No matching products') : t('products.emptyTitle', 'No products yet')}
          description={hasActiveFilters ? t('products.filteredEmptyDescription', 'Try clearing filters or searching another term.') : t('products.emptyDescription', 'Create the first product to start tracking assets and stock.')}
          icon={<ItemIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="space-y-4 p-5 sm:p-6">
                {product.imageUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
                    <img src={product.imageUrl} alt={product.name} className="h-40 w-full object-cover" />
                  </div>
                ) : null}
                <div className="space-y-1">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.code ?? product.sku ?? product.id}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Tag color={trackingTypeColor(product.trackingType)}>{product.trackingType}</Tag>
                  <Tag color={product.isActive ? 'green' : 'default'}>{product.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}</Tag>
                  <Tag>{categoryNameById.get(product.categoryId ?? '') ?? t('products.noCategory', 'No category')}</Tag>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>{t('products.detail.unitCode', 'Unit')}: {product.unitCode ?? '-'}</div>
                  <div>{t('products.detail.assetCount', 'Assets')}: {product.assetCount}</div>
                  <div>{t('products.detail.totalStock', 'Stock')}: {product.totalStock}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="w-full rounded-full sm:w-auto">
                    <Link to={ROUTES.workspaceProductDetail(wsId, product.id)}>
                      <OpenIcon className="h-4 w-4" />
                      {t('products.open', 'Open')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
        ))}
        </div>
      )}
    </PageShell>
  );
}
