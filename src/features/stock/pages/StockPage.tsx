import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { PageShell } from '@/components/common/PageShell';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { useI18n } from '@/hooks/useI18n';
import { DatabaseIcon, PlusIcon } from '@/components/ui/icons';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useLocations } from '@/features/locations/hooks/useLocations';
import { useSites } from '@/features/sites/hooks/useSites';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { useStockEntries, useAdjustStock } from '@/features/stock/hooks/useStock';
import { CreateBorrowOrderDialog } from '@/features/borrow-orders/components/CreateBorrowOrderDialog';
import { OpenIcon, TakeOutIcon } from '@/components/ui/icons';
import { ROUTES } from '@/constants/routes';

function formatLocationLabel(locationName?: string | null, containerName?: string | null) {
  if (containerName) return containerName;
  if (locationName) return locationName;
  return '-';
}

function AdjustStockDialog({
  wsId,
  open,
  onOpenChange,
}: {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const productsQuery = useProducts(wsId);
  const sitesQuery = useSites(wsId);
  const containersQuery = useContainers(wsId);
  const [siteId, setSiteId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [containerId, setContainerId] = useState('');
  const [productId, setProductId] = useState('');
  const [delta, setDelta] = useState('1');
  const [reason, setReason] = useState('');
  const adjust = useAdjustStock(wsId);

  const locationQuery = useLocations(wsId, siteId);
  const locations = locationQuery.data ?? [];
  const products = (productsQuery.data ?? []).filter((product) => product.trackingType.toLowerCase() === 'stock');
  const sites = sitesQuery.data ?? [];
  const containers = containersQuery.data ?? [];

  const resetAndClose = () => {
    setSiteId('');
    setLocationId('');
    setContainerId('');
    setProductId('');
    setDelta('1');
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="max-w-[46rem]">
        <DialogHeader>
          <DialogTitle>{t('stock.adjust.title', 'Adjust stock')}</DialogTitle>
          <DialogDescription>{t('stock.adjust.description', 'Increase or decrease stock for a product at a specific location or container.')}</DialogDescription>
        </DialogHeader>

        <div className="component-stack px-5 pb-5 sm:px-6">
          <FormField label={t('stock.adjust.product', 'Product')} htmlFor="stock-product">
            <Select id="stock-product" value={productId} onChange={(event) => setProductId(event.target.value)} className="w-full">
              <option value="">{t('stock.adjust.productPlaceholder', 'Select product')}</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid gap-[18px] sm:grid-cols-2">
            <FormField label={t('stock.adjust.site', 'Site')} htmlFor="stock-site">
              <Select
                id="stock-site"
                value={siteId}
                onChange={(event) => {
                  setSiteId(event.target.value);
                  setLocationId('');
                }}
                className="w-full"
              >
                <option value="">{t('stock.adjust.sitePlaceholder', 'Select site')}</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label={t('stock.adjust.location', 'Location')} htmlFor="stock-location">
              <Select
                id="stock-location"
                value={locationId}
                onChange={(event) => setLocationId(event.target.value)}
                className="w-full"
                disabled={!siteId}
              >
                <option value="">{t('stock.adjust.locationPlaceholder', 'Optional')}</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label={t('stock.adjust.container', 'Container')} htmlFor="stock-container">
            <Select
              id="stock-container"
              value={containerId}
              onChange={(event) => setContainerId(event.target.value)}
              className="w-full"
            >
              <option value="">{t('stock.adjust.containerPlaceholder', 'Optional')}</option>
              {containers.map((container) => (
                <option key={container.id} value={container.id}>
                  {container.name}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid gap-[18px] sm:grid-cols-2">
            <FormField label={t('stock.adjust.delta', 'Quantity change')} htmlFor="stock-delta">
              <Input id="stock-delta" type="number" value={delta} onChange={(event) => setDelta(event.target.value)} />
            </FormField>
            <FormField label={t('stock.adjust.reason', 'Reason')} htmlFor="stock-reason">
              <Textarea id="stock-reason" value={reason} onChange={(event) => setReason(event.target.value)} rows={3} />
            </FormField>
          </div>
        </div>

        <DialogFooter className="border-t border-border/70 bg-muted/30 px-5 py-4 sm:px-6">
          <Button variant="outline" onClick={resetAndClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={async () => {
              if (!productId) return;
              await adjust.mutateAsync({
                productId,
                locationId: locationId || null,
                containerId: containerId || null,
                delta: Number(delta),
                reason: reason || null,
              });
              resetAndClose();
            }}
            disabled={adjust.isPending}
          >
            {adjust.isPending ? t('common.saving', 'Saving...') : t('stock.adjust.save', 'Save adjustment')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StockPage() {
  const { wsId = '' } = useParams();
  const { t } = useI18n();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [borrowDefaults, setBorrowDefaults] = useState<{ productId?: string | null; stockEntryId?: string | null } | null>(null);
  const productsQuery = useProducts(wsId);
  const entriesQuery = useStockEntries(wsId, { pageSize: 100 });
  const products = productsQuery.data ?? [];
  const entries = entriesQuery.data?.items ?? [];

  const stats = useMemo(
    () => [
      { label: t('stock.stats.entries', 'Stock entries'), value: entries.length },
      { label: t('stock.stats.products', 'Products with stock'), value: new Set(entries.map((entry) => entry.productId)).size },
      { label: t('stock.stats.quantity', 'Total quantity'), value: entries.reduce((sum, entry) => sum + entry.quantity, 0) },
    ],
    [entries, t],
  );

  return (
    <PageShell
      title={t('stock.title', 'Stock')}
      description={t('stock.description', 'Manage stock quantities before borrowing stock items.')}
      actions={(
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button className="w-full sm:w-auto" variant="outline" onClick={() => setBorrowOpen(true)}>
            <TakeOutIcon className="h-4 w-4" />
            {t('stock.borrow.action', 'Create borrow order')}
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => setAdjustOpen(true)}>
            <PlusIcon className="h-4 w-4" />
            {t('stock.adjust.action', 'Adjust stock')}
          </Button>
        </div>
      )}
    >
      <div className="grid gap-[18px] md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      {entriesQuery.isLoading ? <LoadingState label={t('common.loading', 'Loading...')} /> : null}
      {entriesQuery.isError ? <ErrorState message={t('stock.loadError', 'Unable to load stock.')} onRetry={() => entriesQuery.refetch()} /> : null}
      {productsQuery.isError ? <ErrorState message={t('stock.productsLoadError', 'Unable to load products.')} onRetry={() => productsQuery.refetch()} /> : null}

      {entries.length === 0 && !entriesQuery.isLoading ? (
        <EmptyState
          title={t('stock.emptyTitle', 'No stock entries yet')}
          description={t('stock.emptyDescription', 'Adjust stock for a stock-tracked product to create the first entry.')}
          icon={<DatabaseIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="space-y-3 p-5 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{entry.productName}</CardTitle>
                  <CardDescription>{entry.unitCode ?? entry.productId}</CardDescription>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>{t('stock.location', 'Location')}: {formatLocationLabel(entry.locationName, entry.containerName)}</div>
                  <div>{t('stock.quantity', 'Quantity')}: {entry.quantity}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      setBorrowDefaults({ productId: entry.productId, stockEntryId: entry.id });
                      setBorrowOpen(true);
                    }}
                  >
                    <TakeOutIcon className="h-4 w-4" />
                    {t('stock.borrow.fromEntry', 'Borrow from this entry')}
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link to={ROUTES.workspaceStockDetail(wsId, entry.id)}>
                      <OpenIcon className="h-4 w-4" />
                      {t('common.open', 'Open')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AdjustStockDialog wsId={wsId} open={adjustOpen} onOpenChange={setAdjustOpen} />
      <CreateBorrowOrderDialog
        wsId={wsId}
        open={borrowOpen}
        onOpenChange={setBorrowOpen}
        initialProductId={borrowDefaults?.productId ?? null}
        initialStockEntryId={borrowDefaults?.stockEntryId ?? null}
      />
    </PageShell>
  );
}
