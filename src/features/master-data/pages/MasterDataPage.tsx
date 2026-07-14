import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Popconfirm, Tag } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Tabs } from '@/components/ui/tabs';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { PlusIcon, EditIcon, DatabaseIcon, SiteIcon, LocationIcon } from '@/components/ui/icons';
import { useI18n } from '@/hooks/useI18n';
import type { Category, Location, Product, Site } from '@/types/domain.types';
import type { LocationTreeNode } from '@/api/location.api';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/features/products/hooks/useProducts';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/features/categories/hooks/useCategories';
import { useSites, useCreateSite, useUpdateSite, useDeleteSite } from '@/features/sites/hooks/useSites';
import { useLocations, useLocationTree, useCreateLocation, useUpdateLocation, useDeleteLocation } from '@/features/locations/hooks/useLocations';
import { ProductFormDialog } from '@/features/master-data/components/ProductFormDialog';
import { CategoryFormDialog } from '@/features/master-data/components/CategoryFormDialog';
import { SiteFormDialog } from '@/features/master-data/components/SiteFormDialog';
import { LocationFormDialog } from '@/features/master-data/components/LocationFormDialog';

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

function flattenLocationNodes(nodes: LocationTreeNode[], depth = 0): Array<{ value: string; label: string }> {
  return nodes.flatMap((node) => [
    {
      value: node.id,
      label: `${'— '.repeat(depth)}${node.name}${node.code ? ` (${node.code})` : ''}`,
    },
    ...flattenLocationNodes(node.children, depth + 1),
  ]);
}

function findLocationNode(nodes: LocationTreeNode[], id: string): LocationTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const found = findLocationNode(node.children, id);
    if (found) {
      return found;
    }
  }
  return undefined;
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

interface SiteCardActionsProps {
  wsId: string;
  site: Site;
  onEdit: (site: Site) => void;
}

function SiteCardActions({ wsId, site, onEdit }: SiteCardActionsProps) {
  const { t } = useI18n();
  const deleteSite = useDeleteSite(wsId, site.id);

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(site)} className="rounded-full">
        <EditIcon className="h-4 w-4" />
        {t('common.edit', 'แก้ไข')}
      </Button>
      <Popconfirm
        title={t('masterData.sites.deleteConfirmTitle', 'Delete this site?')}
        description={t('masterData.sites.deleteConfirmDescription', 'Locations in this site will also be affected.')}
        okText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        okButtonProps={{ danger: true }}
        onConfirm={async () => {
          await deleteSite.mutateAsync();
        }}
      >
        <Button variant="destructive" size="sm" disabled={deleteSite.isPending} className="rounded-full">
          {deleteSite.isPending ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
        </Button>
      </Popconfirm>
    </div>
  );
}

interface LocationNodeActionsProps {
  wsId: string;
  siteId: string;
  location: Location;
  onEdit: (location: Location) => void;
}

function LocationNodeActions({ wsId, siteId, location, onEdit }: LocationNodeActionsProps) {
  const { t } = useI18n();
  const deleteLocation = useDeleteLocation(wsId, location.id, siteId);

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(location)} className="rounded-full">
        <EditIcon className="h-4 w-4" />
        {t('common.edit', 'แก้ไข')}
      </Button>
      <Popconfirm
        title={t('masterData.locations.deleteConfirmTitle', 'Delete this location?')}
        description={t('masterData.locations.deleteConfirmDescription', 'Nested locations may prevent deletion.')}
        okText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        okButtonProps={{ danger: true }}
        onConfirm={async () => {
          await deleteLocation.mutateAsync();
        }}
      >
        <Button variant="destructive" size="sm" disabled={deleteLocation.isPending} className="rounded-full">
          {deleteLocation.isPending ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
        </Button>
      </Popconfirm>
    </div>
  );
}

function LocationTreeCard({
  node,
  lookup,
  wsId,
  siteId,
  onEdit,
}: {
  node: LocationTreeNode;
  lookup: Map<string, Location>;
  wsId: string;
  siteId: string;
  onEdit: (location: Location) => void;
}) {
  const location = lookup.get(node.id);

  return (
    <div className="space-y-3">
      <Card className="hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="space-y-1">
            <CardTitle className="text-lg">{node.name}</CardTitle>
            <CardDescription>{node.code ?? node.type ?? node.id}</CardDescription>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>{lookup.get(node.id)?.description ?? '-'}</div>
          </div>
          {location ? <LocationNodeActions wsId={wsId} siteId={siteId} location={location} onEdit={onEdit} /> : null}
        </CardContent>
      </Card>
      {node.children.length > 0 ? (
        <div className="ml-4 space-y-3 border-l border-border/60 pl-4">
          {node.children.map((child) => (
            <LocationTreeCard key={child.id} node={child} lookup={lookup} wsId={wsId} siteId={siteId} onEdit={onEdit} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function EditProductDialog({ wsId, product, categories, onClose }: { wsId: string; product: Product; categories: Category[]; onClose: () => void; }) {
  const { t } = useI18n();
  const updateProduct = useUpdateProduct(wsId, product.id);

  return (
    <ProductFormDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
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

function EditCategoryDialog({ wsId, category, onClose }: { wsId: string; category: Category; onClose: () => void; }) {
  const { t } = useI18n();
  const updateCategory = useUpdateCategory(wsId, category.id);

  return (
    <CategoryFormDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
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

function EditSiteDialog({ wsId, site, onClose }: { wsId: string; site: Site; onClose: () => void; }) {
  const { t } = useI18n();
  const updateSite = useUpdateSite(wsId, site.id);

  return (
    <SiteFormDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t('masterData.sites.editTitle', 'Edit site')}
      description={t('masterData.sites.editDescription', 'Update site details.')}
      submitLabel={t('common.save', 'บันทึก')}
      initialValues={site}
      onSubmit={async (values) => {
        await updateSite.mutateAsync({
          name: values.name,
          type: values.type || null,
          address: values.address || null,
          description: values.description || null,
        });
        onClose();
      }}
      isSubmitting={updateSite.isPending}
    />
  );
}

function EditLocationDialog({ wsId, location, sites, locationTree, onClose }: { wsId: string; location: Location; sites: Site[]; locationTree: LocationTreeNode[]; onClose: () => void; }) {
  const { t } = useI18n();
  const updateLocation = useUpdateLocation(wsId, location.id, location.siteId);

  return (
    <LocationFormDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t('masterData.locations.editTitle', 'Edit location')}
      description={t('masterData.locations.editDescription', 'Update location details.')}
      submitLabel={t('common.save', 'บันทึก')}
      sites={sites}
      locationTree={locationTree}
      initialValues={location}
      onSubmit={async (values) => {
        await updateLocation.mutateAsync({
          name: values.name,
          type: values.type || null,
          code: values.code || null,
          sortOrder: values.sortOrder ? Number(values.sortOrder) : null,
          description: values.description || null,
          parentLocationId: values.parentLocationId || null,
          clearParent: !values.parentLocationId,
        });
        onClose();
      }}
      isSubmitting={updateLocation.isPending}
    />
  );
}

export function MasterDataPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t } = useI18n();
  const productsQuery = useProducts(wsId);
  const categoriesQuery = useCategories(wsId);
  const sitesQuery = useSites(wsId);
  const createProduct = useCreateProduct(wsId);
  const createCategory = useCreateCategory(wsId);
  const createSite = useCreateSite(wsId);
  const createLocation = useCreateLocation(wsId);
  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const sites = sitesQuery.data ?? [];
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [createSiteOpen, setCreateSiteOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [createLocationOpen, setCreateLocationOpen] = useState(false);

  useEffect(() => {
    if (!selectedSiteId && sites.length > 0) {
      setSelectedSiteId(sites[0].id);
    }
  }, [selectedSiteId, sites]);

  useEffect(() => {
    if (selectedSiteId && !sites.some((site) => site.id === selectedSiteId) && sites.length > 0) {
      setSelectedSiteId(sites[0].id);
    }
  }, [selectedSiteId, sites]);

  const selectedSite = sites.find((site) => site.id === selectedSiteId) ?? null;
  const selectedSiteLocationsQuery = useLocations(wsId, selectedSiteId);
  const selectedSiteLocations = selectedSiteLocationsQuery.data ?? [];
  const selectedSiteLocationTreeQuery = useLocationTree(wsId, selectedSiteId);
  const selectedSiteLocationTree = selectedSiteLocationTreeQuery.data ?? [];
  const locationLookup = useMemo(() => new Map(selectedSiteLocations.map((location) => [location.id, location] as const)), [selectedSiteLocations]);

  const stats = useMemo(() => [
    { label: t('masterData.stats.products', 'Products'), value: products.length },
    { label: t('masterData.stats.stockProducts', 'Stock products'), value: products.filter((product) => product.trackingType === 'Stock').length },
    { label: t('masterData.stats.categories', 'Categories'), value: categories.length },
    { label: t('masterData.stats.sites', 'Sites'), value: sites.length },
  ], [categories.length, products, sites.length, t]);

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

  const siteTab = (
    <div className="component-stack">
      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div className="space-y-1">
            <CardTitle className="text-lg">{t('masterData.sites.title', 'Sites')}</CardTitle>
            <CardDescription>{t('masterData.sites.description', 'Manage physical sites that contain locations')}</CardDescription>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => setCreateSiteOpen(true)}>
            <PlusIcon className="h-4 w-4" />
            {t('masterData.sites.create', 'Create site')}
          </Button>
        </CardContent>
      </Card>

      {sitesQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {sitesQuery.isError ? <ErrorState message={t('masterData.sites.error', 'Unable to load sites.')} onRetry={() => sitesQuery.refetch()} /> : null}

      {sites.length === 0 ? (
        <EmptyState
          title={t('masterData.sites.emptyTitle', 'No sites yet')}
          description={t('masterData.sites.emptyDescription', 'Create the first site before adding locations.')}
          icon={<SiteIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {sites.map((site) => (
            <Card key={site.id} className="hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{site.name}</CardTitle>
                  <CardDescription>{site.type ?? site.id}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Tag color={statusColor(site.isActive)}>{site.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}</Tag>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>{t('masterData.sites.address', 'Address')}: {site.address ?? '-'}</div>
                  <div>{t('masterData.sites.locationCount', 'Locations')}: {site.locationCount}</div>
                </div>
                <SiteCardActions wsId={wsId} site={site} onEdit={setEditSite} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const locationTab = (
    <div className="component-stack">
      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div className="space-y-1">
            <CardTitle className="text-lg">{t('masterData.locations.title', 'Locations')}</CardTitle>
            <CardDescription>{t('masterData.locations.description', 'Manage hierarchical locations inside a selected site')}</CardDescription>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => setCreateLocationOpen(true)} disabled={!selectedSite}>
            <PlusIcon className="h-4 w-4" />
            {t('masterData.locations.create', 'Create location')}
          </Button>
        </CardContent>
      </Card>

      {sites.length === 0 ? (
        <EmptyState
          title={t('masterData.locations.noSitesTitle', 'Create a site first')}
          description={t('masterData.locations.noSitesDescription', 'Locations need a site before they can be created.')}
          icon={<LocationIcon className="h-5 w-5" />}
        />
      ) : (
        <Card className="shadow-sm">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="grid gap-3 md:grid-cols-[minmax(0,20rem)_1fr]">
              <div className="space-y-1">
                <p className="text-sm font-medium">{t('masterData.locations.siteSelector', 'Selected site')}</p>
                <Select
                  value={selectedSiteId}
                  onChange={(event) => setSelectedSiteId(event.target.value)}
                  className="w-full"
                >
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-[18px] sm:grid-cols-3">
                <StatCard label={t('masterData.locations.siteLocations', 'Locations')} value={selectedSiteLocations.length} />
                <StatCard label={t('masterData.locations.siteRoots', 'Roots')} value={selectedSiteLocationTree.length} />
                <StatCard label={t('masterData.locations.siteName', 'Site')} value={selectedSite?.name ?? '-'} />
              </div>
            </div>

            {selectedSiteLocationTreeQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
            {selectedSiteLocationTreeQuery.isError ? <ErrorState message={t('masterData.locations.error', 'Unable to load locations.')} onRetry={() => selectedSiteLocationTreeQuery.refetch()} /> : null}

            {selectedSiteLocationTree.length === 0 ? (
              <EmptyState
                title={t('masterData.locations.emptyTitle', 'No locations yet')}
                description={t('masterData.locations.emptyDescription', 'Create the first location under the selected site.')}
                icon={<LocationIcon className="h-5 w-5" />}
              />
            ) : (
              <div className="space-y-4">
                {selectedSiteLocationTree.map((node) => (
                  <LocationTreeCard
                    key={node.id}
                    node={node}
                    lookup={locationLookup}
                    wsId={wsId}
                    siteId={selectedSiteId}
                    onEdit={setEditLocation}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
          { key: 'sites', label: t('masterData.sites.tab', 'Sites'), children: siteTab },
          { key: 'locations', label: t('masterData.locations.tab', 'Locations'), children: locationTab },
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

      {editProduct ? <EditProductDialog wsId={wsId} product={editProduct} categories={categories} onClose={() => setEditProduct(null)} /> : null}

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

      {editCategory ? <EditCategoryDialog wsId={wsId} category={editCategory} onClose={() => setEditCategory(null)} /> : null}

      <SiteFormDialog
        open={createSiteOpen}
        onOpenChange={setCreateSiteOpen}
        title={t('masterData.sites.createTitle', 'Create site')}
        description={t('masterData.sites.createDescription', 'Add a new physical site.')}
        submitLabel={t('masterData.sites.createSubmit', 'Create site')}
        onSubmit={async (values) => {
          await createSite.mutateAsync({
            name: values.name,
            type: values.type || null,
            address: values.address || null,
            description: values.description || null,
          });
          setCreateSiteOpen(false);
        }}
        isSubmitting={createSite.isPending}
      />

      {editSite ? <EditSiteDialog wsId={wsId} site={editSite} onClose={() => setEditSite(null)} /> : null}

      <LocationFormDialog
        open={createLocationOpen}
        onOpenChange={setCreateLocationOpen}
        title={t('masterData.locations.createTitle', 'Create location')}
        description={t('masterData.locations.createDescription', 'Add a nested location inside the selected site.')}
        submitLabel={t('masterData.locations.createSubmit', 'Create location')}
        sites={sites}
        locationTree={selectedSiteLocationTree}
        onSubmit={async (values) => {
          await createLocation.mutateAsync({
            siteId: values.siteId,
            parentLocationId: values.parentLocationId || null,
            name: values.name,
            type: values.type || null,
            code: values.code || null,
            sortOrder: Number(values.sortOrder),
            description: values.description || null,
          });
          setCreateLocationOpen(false);
        }}
        isSubmitting={createLocation.isPending}
      />

      {editLocation ? (
        <EditLocationDialog
          wsId={wsId}
          location={editLocation}
          sites={sites}
          locationTree={selectedSiteLocationTree}
          onClose={() => setEditLocation(null)}
        />
      ) : null}
    </PageShell>
  );
}
