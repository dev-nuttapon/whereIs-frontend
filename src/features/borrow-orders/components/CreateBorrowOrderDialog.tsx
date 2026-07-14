import { useEffect, useMemo, useState } from 'react';
import { CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/ui/icons';
import { useI18n } from '@/hooks/useI18n';
import { useAssets } from '@/features/assets/hooks/useAssets';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useStockEntries } from '@/features/stock/hooks/useStock';
import { useCreateBorrowOrder } from '@/features/borrow-orders/hooks/useBorrowOrders';
import type { CreateBorrowOrderInput } from '@/api/borrow-order.api';

type BorrowLineDraft =
  | { id: string; kind: 'asset'; assetId: string }
  | { id: string; kind: 'stock'; stockEntryId: string; productId: string; quantity: string };

function createDraftFromDefaults(params: {
  initialAssetId?: string | null;
  initialProductId?: string | null;
  initialStockEntryId?: string | null;
}): BorrowLineDraft[] {
  if (params.initialAssetId) {
    return [{ id: crypto.randomUUID(), kind: 'asset', assetId: params.initialAssetId }];
  }

  if (params.initialStockEntryId) {
    return [{
      id: crypto.randomUUID(),
      kind: 'stock',
      stockEntryId: params.initialStockEntryId,
      productId: params.initialProductId ?? '',
      quantity: '1',
    }];
  }

  return [];
}

interface CreateBorrowOrderDialogProps {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAssetId?: string | null;
  initialProductId?: string | null;
  initialStockEntryId?: string | null;
}

export function CreateBorrowOrderDialog({
  wsId,
  open,
  onOpenChange,
  initialAssetId = null,
  initialProductId = null,
  initialStockEntryId = null,
}: CreateBorrowOrderDialogProps) {
  const { t } = useI18n();
  const createBorrow = useCreateBorrowOrder(wsId);
  const assetsQuery = useAssets(wsId, { pageSize: 1000 });
  const productsQuery = useProducts(wsId);
  const stockQuery = useStockEntries(wsId, { pageSize: 1000 });

  const assets = useMemo(
    () => (assetsQuery.data ?? []).filter((asset) => !['borrowed', 'disposed'].includes(asset.status.toLowerCase())),
    [assetsQuery.data],
  );
  const products = useMemo(
    () => (productsQuery.data ?? []).filter((product) => product.trackingType.toLowerCase() === 'stock'),
    [productsQuery.data],
  );
  const stockEntries = stockQuery.data?.items ?? [];
  const [purpose, setPurpose] = useState('');
  const [needByDate, setNeedByDate] = useState('');
  const [returnByDate, setReturnByDate] = useState('');
  const [lines, setLines] = useState<BorrowLineDraft[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setPurpose('');
    setNeedByDate('');
    setReturnByDate('');
    setLines(createDraftFromDefaults({ initialAssetId, initialProductId, initialStockEntryId }));
  }, [initialAssetId, initialProductId, initialStockEntryId, open]);

  const resetAndClose = () => {
    setPurpose('');
    setNeedByDate('');
    setReturnByDate('');
    setLines([]);
    onOpenChange(false);
  };

  const addAssetLine = () => {
    setLines((current) => [...current, { id: crypto.randomUUID(), kind: 'asset', assetId: '' }]);
  };

  const addStockLine = () => {
    setLines((current) => [...current, { id: crypto.randomUUID(), kind: 'stock', stockEntryId: '', productId: '', quantity: '1' }]);
  };

  const canSubmit = Boolean(
    needByDate
      && returnByDate
      && lines.length > 0
      && lines.every((line) => (line.kind === 'asset' ? Boolean(line.assetId) : Boolean(line.stockEntryId && Number(line.quantity) > 0))),
  );

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="max-w-[56rem]">
        <DialogHeader>
          <DialogTitle>{t('borrowOrders.createTitle', 'Create borrow order')}</DialogTitle>
          <DialogDescription>{t('borrowOrders.createDescription', 'Add one or more assets or stock lines to create a new borrow order.')}</DialogDescription>
        </DialogHeader>

        <div className="component-stack px-5 pb-5 sm:px-6">
          <FormField label={t('borrowOrders.purpose', 'Purpose')} htmlFor="borrow-purpose">
            <Textarea id="borrow-purpose" value={purpose} onChange={(event) => setPurpose(event.target.value)} rows={3} />
          </FormField>

          <div className="grid gap-[18px] sm:grid-cols-2">
            <FormField label={t('borrowOrders.needByDate', 'Need by')} htmlFor="borrow-need">
              <Input id="borrow-need" type="date" value={needByDate} onChange={(event) => setNeedByDate(event.target.value)} />
            </FormField>
            <FormField label={t('borrowOrders.returnByDate', 'Return by')} htmlFor="borrow-return">
              <Input id="borrow-return" type="date" value={returnByDate} onChange={(event) => setReturnByDate(event.target.value)} />
            </FormField>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={addAssetLine}>
              <PlusIcon className="h-4 w-4" />
              {t('borrowOrders.addAssetLine', 'Add asset')}
            </Button>
            <Button type="button" variant="outline" onClick={addStockLine}>
              <PlusIcon className="h-4 w-4" />
              {t('borrowOrders.addStockLine', 'Add stock')}
            </Button>
          </div>

          <div className="component-stack">
            {lines.map((line, index) => (
              <div key={line.id} className="space-y-3 rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">
                    {t('borrowOrders.lineLabel', 'Line {index}', { index: index + 1 })}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setLines((current) => current.filter((entry) => entry.id !== line.id))}
                  >
                    {t('common.delete', 'Delete')}
                  </Button>
                </div>

                <Select
                  value={line.kind}
                  onChange={(event) => {
                    const kind = event.target.value as 'asset' | 'stock';
                    setLines((current) =>
                      current.map((entry) => {
                        if (entry.id !== line.id) return entry;
                        return kind === 'asset'
                          ? { id: entry.id, kind: 'asset', assetId: '' }
                          : { id: entry.id, kind: 'stock', stockEntryId: '', productId: '', quantity: '1' };
                      }),
                    );
                  }}
                  className="w-full"
                >
                  <option value="asset">{t('borrowOrders.lineTypeAsset', 'Asset')}</option>
                  <option value="stock">{t('borrowOrders.lineTypeStock', 'Stock')}</option>
                </Select>

                {line.kind === 'asset' ? (
                  <FormField label={t('borrowOrders.asset', 'Asset')} htmlFor={`borrow-asset-${line.id}`}>
                    <Select
                      id={`borrow-asset-${line.id}`}
                      value={line.assetId}
                      onChange={(event) =>
                        setLines((current) =>
                          current.map((entry) => (entry.id === line.id ? { ...entry, assetId: event.target.value } : entry)),
                        )
                      }
                      className="w-full"
                    >
                      <option value="">{t('borrowOrders.assetPlaceholder', 'Select asset')}</option>
                      {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.productName} - {asset.serialNumber ?? asset.barcode ?? asset.id}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                ) : (
                  <div className="grid gap-[18px] sm:grid-cols-3">
                    <FormField label={t('borrowOrders.product', 'Product')} htmlFor={`borrow-product-${line.id}`}>
                      <Select
                        id={`borrow-product-${line.id}`}
                        value={line.productId}
                        onChange={(event) => {
                          const productId = event.target.value;
                          setLines((current) =>
                            current.map((entry) => {
                              if (entry.id !== line.id) return entry;
                              return { ...entry, productId, stockEntryId: '' };
                            }),
                          );
                        }}
                        className="w-full"
                      >
                        <option value="">{t('borrowOrders.productPlaceholder', 'Select product')}</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </Select>
                    </FormField>

                    <FormField label={t('borrowOrders.stockEntry', 'Stock entry')} htmlFor={`borrow-stock-${line.id}`}>
                      <Select
                        id={`borrow-stock-${line.id}`}
                        value={line.stockEntryId}
                        onChange={(event) =>
                          setLines((current) =>
                            current.map((entry) => (entry.id === line.id ? { ...entry, stockEntryId: event.target.value } : entry)),
                          )
                        }
                        className="w-full"
                      >
                        <option value="">{t('borrowOrders.stockPlaceholder', 'Select stock entry')}</option>
                        {stockEntries
                          .filter((entry) => !line.productId || entry.productId === line.productId)
                          .map((entry) => (
                            <option key={entry.id} value={entry.id}>
                              {entry.productName} - {entry.quantity} @ {entry.locationName ?? entry.containerName ?? '-'}
                            </option>
                          ))}
                      </Select>
                    </FormField>

                    <FormField label={t('borrowOrders.quantity', 'Quantity')} htmlFor={`borrow-quantity-${line.id}`}>
                      <Input
                        id={`borrow-quantity-${line.id}`}
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(event) =>
                          setLines((current) =>
                            current.map((entry) => (entry.id === line.id ? { ...entry, quantity: event.target.value } : entry)),
                          )
                        }
                      />
                    </FormField>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="border-t border-border/70 bg-muted/30 px-5 py-4 sm:px-6">
          <Button variant="outline" onClick={resetAndClose}>
            {t('common.cancel', 'ยกเลิก')}
          </Button>
          <Button
            disabled={!canSubmit || createBorrow.isPending}
            onClick={async () => {
              const payload: CreateBorrowOrderInput = {
                purpose: purpose.trim() || null,
                needByDate: new Date(needByDate),
                returnByDate: new Date(returnByDate),
                lines: lines.map((line) =>
                  line.kind === 'asset'
                    ? { assetId: line.assetId, productId: null, stockEntryId: null, quantity: null }
                    : {
                        assetId: null,
                        productId: line.productId || null,
                        stockEntryId: line.stockEntryId,
                        quantity: Number(line.quantity),
                      },
                ),
              };
              await createBorrow.mutateAsync(payload);
              resetAndClose();
            }}
          >
            {createBorrow.isPending ? t('common.saving', 'กำลังบันทึก...') : t('borrowOrders.create', 'Create borrow order')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
