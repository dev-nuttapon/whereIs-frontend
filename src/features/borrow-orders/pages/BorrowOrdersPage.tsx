import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Popconfirm, Tag } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useI18n } from '@/hooks/useI18n';
import { ClipboardCheckIcon, FilterIcon, PlusIcon, ReturnIcon, TakeOutIcon } from '@/components/ui/icons';
import { OpenIcon } from '@/components/ui/icons';
import { ROUTES } from '@/constants/routes';
import { useAssets } from '@/features/assets/hooks/useAssets';
import {
  useApproveBorrowOrder,
  useCreateBorrowOrder,
  useBorrowOrders,
  useCancelBorrowOrder,
  useCheckOutBorrowOrder,
  useRejectBorrowOrder,
  useReturnBorrowOrder,
} from '@/features/borrow-orders/hooks/useBorrowOrders';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useStockEntries } from '@/features/stock/hooks/useStock';
import type { BorrowOrder, BorrowOrderLine } from '@/types/domain.types';
import type { CreateBorrowOrderInput } from '@/api/borrow-order.api';
import { MasterStatusBadge } from '@/components/common/MasterStatusBadge';
import { pushNotification } from '@/stores/notification.store';

function statusColor(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('pending')) return 'gold';
  if (normalized.includes('approved')) return 'blue';
  if (normalized.includes('active')) return 'green';
  if (normalized.includes('completed')) return 'green';
  if (normalized.includes('cancel')) return 'red';
  if (normalized.includes('reject')) return 'default';
  return 'geekblue';
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function todayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function apiErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string; error?: string } } }).response;
    const message = response?.data?.message ?? response?.data?.error;
    if (message) return message;
  }
  return error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง';
}

function formatLineLabel(line: BorrowOrderLine) {
  if (line.assetId) {
    return `${line.assetSerialNumber ?? line.assetId}`;
  }
  return `${line.productName ?? line.productId ?? line.stockEntryId ?? '-'}${line.quantity ? ` x ${line.quantity}` : ''}`;
}

function ReturnDialog({
  order,
  open,
  onOpenChange,
}: {
  order: BorrowOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const orderId = order?.id ?? '';
  const mutation = useReturnBorrowOrder(order?.workspaceId ?? '', orderId);
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const lines = useMemo(
    () => order?.lines ?? [],
    [order?.lines],
  );

  const resetAndClose = () => {
    setQuantities({});
    onOpenChange(false);
  };

  return (
    <Dialog size="compact" open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="max-w-[42rem]">
        <DialogHeader>
          <DialogTitle>{t('borrowOrders.returnTitle', 'Return items')}</DialogTitle>
          <DialogDescription>{t('borrowOrders.returnDescription', 'Record quantities that are being returned for this borrow order.')}</DialogDescription>
        </DialogHeader>

        <div className="component-stack px-5 pb-5 sm:px-6">
          {lines.map((line) => {
            const remaining = Math.max(0, (line.quantity ?? 1) - (line.returnedQuantity ?? 0));
            return (
              <div key={line.id} className="space-y-2 rounded-2xl border border-border/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{formatLineLabel(line)}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('borrowOrders.remaining', 'Remaining')}: {remaining}
                    </p>
                  </div>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={remaining}
                  value={quantities[line.id] ?? String(remaining)}
                  onChange={(event) => setQuantities((current) => ({ ...current, [line.id]: event.target.value }))}
                />
              </div>
            );
          })}
        </div>

        <DialogFooter className="border-t border-border/70 bg-muted/30 px-5 py-4 sm:px-6">
          <Button variant="outline" onClick={resetAndClose}>
            {t('common.cancel', 'ยกเลิก')}
          </Button>
          <Button
            onClick={async () => {
              if (!order) return;
              await mutation.mutateAsync({
                lines: order.lines
                  .map((line) => ({
                    lineId: line.id,
                    returnedQuantity: Number(quantities[line.id] ?? (line.quantity ?? 1)),
                    condition: null,
                  }))
                  .filter((line) => line.returnedQuantity > 0),
              });
              resetAndClose();
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('common.saving', 'กำลังบันทึก...') : t('borrowOrders.confirmReturn', 'บันทึกการคืน')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type BorrowLineDraft =
  | { id: string; kind: 'asset'; assetId: string }
  | { id: string; kind: 'stock'; stockEntryId: string; productId: string; quantity: string };

function CreateBorrowDialog({
  wsId,
  open,
  onOpenChange,
}: {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const createBorrow = useCreateBorrowOrder(wsId);
  const assetsQuery = useAssets(wsId, { pageSize: 20 });
  const productsQuery = useProducts(wsId);
  const stockQuery = useStockEntries(wsId, { pageSize: 20 });

  const assets = (assetsQuery.data ?? []).filter((asset) => !['borrowed', 'disposed'].includes(asset.status.toLowerCase()));
  const products = (productsQuery.data ?? []).filter((product) => product.trackingType.toLowerCase() === 'stock');
  const stockEntries = stockQuery.data?.items ?? [];
  const [requestType, setRequestType] = useState<'borrow' | 'issue'>('borrow');
  const [purpose, setPurpose] = useState('');
  const [needByDate, setNeedByDate] = useState(todayInputValue);
  const [returnByDate, setReturnByDate] = useState('');
  const [lines, setLines] = useState<BorrowLineDraft[]>([]);
  const [formError, setFormError] = useState('');

  const resetAndClose = () => {
    setPurpose('');
    setRequestType('borrow');
    setNeedByDate(todayInputValue());
    setReturnByDate('');
    setLines([]);
    setFormError('');
    onOpenChange(false);
  };

  const addAssetLine = () => {
    setLines((current) => [...current, { id: crypto.randomUUID(), kind: 'asset', assetId: '' }]);
  };

  const addStockLine = () => {
    setLines((current) => [...current, { id: crypto.randomUUID(), kind: 'stock', stockEntryId: '', productId: '', quantity: '1' }]);
  };

  return (
    <Dialog size="wide" open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="max-w-[56rem]">
        <DialogHeader>
          <DialogTitle>{requestType === 'borrow' ? 'สร้างรายการยืม' : 'สร้างรายการเบิก'}</DialogTitle>
          <DialogDescription>เลือกประเภทคำขอครั้งเดียว แล้วเพิ่มรายการได้หลายรายการ</DialogDescription>
        </DialogHeader>

        <div className="component-stack px-5 pb-5 sm:px-6">
          <section className="space-y-5 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:p-5">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">รายละเอียดคำขอ</h3>
              <p className="text-xs leading-5 text-muted-foreground">ระบุประเภท วัตถุประสงค์ และวันที่ของคำขอ</p>
            </div>
            {formError ? <ErrorState message={formError} /> : null}
            <FormField label="ประเภทคำขอ" htmlFor="borrow-request-type">
              <Select id="borrow-request-type" value={requestType} onChange={(event) => { const nextType = event.target.value as 'borrow' | 'issue'; setRequestType(nextType); setLines([]); setReturnByDate(''); }} className="w-full sm:max-w-xs">
                <option value="borrow">ยืมทรัพย์สิน</option>
                <option value="issue">เบิกสินค้าในคลัง</option>
              </Select>
            </FormField>
            <FormField label={t('borrowOrders.purpose', 'วัตถุประสงค์')} htmlFor="borrow-purpose">
              <Textarea id="borrow-purpose" value={purpose} onChange={(event) => setPurpose(event.target.value)} rows={3} />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label={requestType === 'borrow' ? 'วันที่ต้องการยืม' : 'วันที่ต้องการเบิก'} htmlFor="borrow-need">
                <Input id="borrow-need" type="date" value={needByDate} onChange={(event) => setNeedByDate(event.target.value)} />
              </FormField>
              {requestType === 'borrow' ? <FormField label="กำหนดคืน" htmlFor="borrow-return">
                <Input id="borrow-return" type="date" value={returnByDate} onChange={(event) => setReturnByDate(event.target.value)} />
              </FormField> : <div className="hidden sm:block" />}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">{requestType === 'borrow' ? 'ทรัพย์สินที่ต้องการยืม' : 'สินค้าในคลังที่ต้องการเบิก'}</h3>
                <p className="text-xs leading-5 text-muted-foreground">เพิ่มรายการได้หลายรายการในคำขอเดียว</p>
              </div>
              <div className="flex flex-wrap gap-2">
            {requestType === 'borrow' ? <Button type="button" variant="outline" onClick={addAssetLine}>
              <PlusIcon className="h-4 w-4" />
              {t('borrowOrders.addAssetLine', 'เพิ่มทรัพย์สิน')}
            </Button> : <Button type="button" variant="outline" onClick={addStockLine}>
              <PlusIcon className="h-4 w-4" />
              เพิ่มสินค้าในคลัง
            </Button>}
              </div>
            </div>

            <div className="component-stack">
            {lines.map((line, index) => {
              const selectedStock = line.kind === 'stock' ? stockEntries.find((entry) => entry.id === line.stockEntryId) : undefined;
              const otherLinesQuantity = line.kind === 'stock' && line.stockEntryId
                ? lines.reduce((sum, otherLine) => sum + (otherLine.id !== line.id && otherLine.kind === 'stock' && otherLine.stockEntryId === line.stockEntryId ? Number(otherLine.quantity) || 0 : 0), 0)
                : 0;
              const availableQuantity = selectedStock ? Math.max(0, selectedStock.quantity - otherLinesQuantity) : undefined;
              return (
              <div key={line.id} className="space-y-5 rounded-2xl border border-border/70 bg-background p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {t('borrowOrders.lineLabel', 'Line {index}', { index: index + 1 })}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{t('borrowOrders.lineDescription', 'เลือกประเภทและระบุรายละเอียดของรายการนี้')}</p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="shrink-0 rounded-full"
                    onClick={() => setLines((current) => current.filter((entry) => entry.id !== line.id))}
                  >
                    {t('common.delete', 'Delete')}
                  </Button>
                </div>

                {line.kind === 'asset' ? (
                  <FormField label={t('borrowOrders.asset', 'ทรัพย์สิน')} htmlFor={`borrow-asset-${line.id}`}>
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
                      <option value="">{t('borrowOrders.assetPlaceholder', 'เลือกทรัพย์สิน')}</option>
                      {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.productName} - {asset.serialNumber ?? asset.barcode ?? asset.id}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField label={t('borrowOrders.product', 'สินค้า')} htmlFor={`borrow-product-${line.id}`}>
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
                        <option value="">{t('borrowOrders.productPlaceholder', 'เลือกสินค้า')}</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </Select>
                    </FormField>

                    <FormField label="จุดจัดเก็บ/ภาชนะจัดเก็บ" htmlFor={`borrow-stock-${line.id}`}>
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
                        <option value="">{t('borrowOrders.stockPlaceholder', 'เลือกของในคลัง')}</option>
                        {stockEntries
                          .filter((entry) => entry.quantity > 0 && (!line.productId || entry.productId === line.productId))
                          .map((entry) => (
                            <option key={entry.id} value={entry.id}>
                              {entry.productName} - คงเหลือ {entry.quantity} @ {entry.locationName ?? entry.containerName ?? '-'}
                            </option>
                          ))}
                      </Select>
                    </FormField>

                    <FormField label="จำนวน" htmlFor={`borrow-quantity-${line.id}`}>
                      <Input
                        id={`borrow-quantity-${line.id}`}
                        type="number"
                        min={1}
                        max={availableQuantity}
                        value={line.quantity}
                        onChange={(event) =>
                          setLines((current) =>
                            current.map((entry) => {
                              if (entry.id !== line.id) return entry;
                              const nextQuantity = Number(event.target.value);
                              return { ...entry, quantity: availableQuantity !== undefined && nextQuantity > availableQuantity ? String(availableQuantity) : event.target.value };
                            }),
                          )
                        }
                      />
                      {selectedStock ? <p className="text-xs text-muted-foreground">คงเหลือให้เบิก: {availableQuantity ?? 0}</p> : null}
                    </FormField>
                  </div>
                )}
              </div>
              );
            })}
            </div>
          </section>
        </div>

        <DialogFooter className="border-t border-border/70 bg-muted/30 px-5 py-4 sm:px-6">
          <Button variant="outline" onClick={resetAndClose}>
            {t('common.cancel', 'ยกเลิก')}
          </Button>
          <Button
            disabled={createBorrow.isPending}
            onClick={async () => {
              if (!needByDate) {
                const message = requestType === 'borrow' ? 'กรุณาระบุวันที่ต้องการยืม' : 'กรุณาระบุวันที่ต้องการเบิก';
                setFormError(message);
                pushNotification({ variant: 'warning', title: 'กรอกข้อมูลไม่ครบ', description: message });
                return;
              }
              if (requestType === 'borrow' && !returnByDate) {
                const message = 'กรุณาระบุกำหนดคืน';
                setFormError(message);
                pushNotification({ variant: 'warning', title: 'กรอกข้อมูลไม่ครบ', description: message });
                return;
              }
              if (!lines.length) {
                const message = requestType === 'borrow' ? 'กรุณาเพิ่มทรัพย์สินที่ต้องการยืม' : 'กรุณาเพิ่มสินค้าในคลังที่ต้องการเบิก';
                setFormError(message);
                pushNotification({ variant: 'warning', title: 'กรอกข้อมูลไม่ครบ', description: message });
                return;
              }
              const invalidLine = lines.find((line) => {
                if (line.kind === 'asset') return !line.assetId;
                const stockEntry = stockEntries.find((entry) => entry.id === line.stockEntryId);
                const otherQuantity = lines.reduce((sum, otherLine) => sum + (otherLine.id !== line.id && otherLine.kind === 'stock' && otherLine.stockEntryId === line.stockEntryId ? Number(otherLine.quantity) || 0 : 0), 0);
                return !line.productId || !line.stockEntryId || Number(line.quantity) <= 0 || !stockEntry || Number(line.quantity) + otherQuantity > stockEntry.quantity;
              });
              if (invalidLine) {
                const message = requestType === 'borrow' ? 'กรุณาเลือกทรัพย์สินให้ครบถ้วน' : 'กรุณาเลือกสินค้า จุดจัดเก็บ และระบุจำนวนไม่เกินยอดคงเหลือ';
                setFormError(message);
                pushNotification({ variant: 'warning', title: 'ข้อมูลไม่ถูกต้อง', description: message });
                return;
              }
              setFormError('');
              const payload: CreateBorrowOrderInput = {
                requestType,
                purpose: purpose.trim() || null,
                needByDate: new Date(needByDate),
                returnByDate: requestType === 'borrow' ? new Date(returnByDate) : null,
                lines: lines.map((line) =>
                  line.kind === 'asset'
                    ? { assetId: line.assetId, productId: null, stockEntryId: null, quantity: null }
                    : {
                        assetId: null,
                        productId: line.productId,
                        stockEntryId: line.stockEntryId,
                        quantity: Number(line.quantity),
                      },
                ),
              };
              try {
                await createBorrow.mutateAsync(payload);
                resetAndClose();
              } catch (error) {
                const message = apiErrorMessage(error);
                setFormError(message);
              }
            }}
          >
            {createBorrow.isPending ? t('common.saving', 'กำลังบันทึก...') : t('borrowOrders.create', 'สร้างรายการเบิก/ยืม')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BorrowOrderCard({
  order,
  onReturn,
}: {
  order: BorrowOrder;
  onReturn: (order: BorrowOrder) => void;
}) {
  const { t } = useI18n();
  const approve = useApproveBorrowOrder(order.workspaceId, order.id);
  const reject = useRejectBorrowOrder(order.workspaceId, order.id);
  const checkout = useCheckOutBorrowOrder(order.workspaceId, order.id);
  const cancel = useCancelBorrowOrder(order.workspaceId, order.id);

  const isPendingApproval = order.status.toLowerCase().includes('pending');
  const isApproved = order.status.toLowerCase().includes('approved');
  const isActive = order.status.toLowerCase().includes('active');

  return (
    <Card className="hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="component-stack p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{order.purpose ?? t('borrowOrders.untitled', 'Borrow order')}</CardTitle>
            <CardDescription>{order.requestType === 'issue' ? 'เบิกสินค้าในคลัง' : 'ยืมทรัพย์สิน'} · {order.id}</CardDescription>
          </div>
          <MasterStatusBadge status={order.status} kind="borrow" />
        </div>

        <div className="grid gap-[18px] md:grid-cols-2">
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>{t('borrowOrders.requestedBy', 'ผู้ขอรายการ')}: {order.requestedBy}</div>
            <div>{t('borrowOrders.needByDate', 'Need by')}: {formatDate(order.needByDate)}</div>
            {order.requestType === 'borrow' ? <div>{t('borrowOrders.returnByDate', 'กำหนดคืน')}: {formatDate(order.returnByDate)}</div> : null}
            <div>{t('borrowOrders.requiresApproval', 'Requires approval')}: {order.requiresApproval ? t('common.yes', 'Yes') : t('common.no', 'No')}</div>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>{t('borrowOrders.lineCount', 'Lines')}: {order.lines.length}</div>
            <div>{t('borrowOrders.approvedBy', 'Approved by')}: {order.approvedBy ?? '-'}</div>
            <div>{t('borrowOrders.approvedAt', 'Approved at')}: {order.approvedAt ? formatDate(order.approvedAt) : '-'}</div>
            <div>{t('borrowOrders.reviewNote', 'Review note')}: {order.reviewNote ?? '-'}</div>
          </div>
        </div>

        <div className="space-y-2">
          <CardTitle className="text-sm">{t('borrowOrders.linesTitle', 'Lines')}</CardTitle>
          <div className="space-y-2">
            {order.lines.map((line) => (
              <div key={line.id} className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{formatLineLabel(line)}</span>
                  <MasterStatusBadge status={line.status} kind="borrow" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {line.assetId ? t('borrowOrders.assetLine', 'รายการทรัพย์สิน') : t('borrowOrders.stockLine', 'รายการของในคลัง')}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button asChild variant="outline" className="rounded-full">
            <Link to={ROUTES.workspaceBorrowOrderDetail(order.workspaceId, order.id)}>
              <OpenIcon className="h-4 w-4" />
              {t('borrowOrders.openDetail', 'Open detail')}
            </Link>
          </Button>

          {isPendingApproval ? (
            <>
              <Popconfirm
                title={t('borrowOrders.approveConfirmTitle', 'Approve this borrow order?')}
                description={t('borrowOrders.approveConfirmDescription', 'Approved orders can be checked out next.')}
                okText={t('borrowOrders.approve', 'Approve')}
                cancelText={t('common.cancel', 'Cancel')}
                onConfirm={async () => {
                  await approve.mutateAsync({});
                }}
              >
                <Button className="rounded-full" disabled={approve.isPending}>
                  <TakeOutIcon className="h-4 w-4" />
                  {approve.isPending ? t('common.saving', 'กำลังบันทึก...') : t('borrowOrders.approve', 'Approve')}
                </Button>
              </Popconfirm>
              <Popconfirm
                title={t('borrowOrders.rejectConfirmTitle', 'Reject this borrow order?')}
                description={t('borrowOrders.rejectConfirmDescription', 'Rejected orders will not be checked out.')}
                okText={t('borrowOrders.reject', 'Reject')}
                cancelText={t('common.cancel', 'Cancel')}
                okButtonProps={{ danger: true }}
                onConfirm={async () => {
                  await reject.mutateAsync({});
                }}
              >
                <Button variant="outline" className="rounded-full" disabled={reject.isPending}>
                  {reject.isPending ? t('common.saving', 'กำลังบันทึก...') : t('borrowOrders.reject', 'Reject')}
                </Button>
              </Popconfirm>
            </>
          ) : null}

          {isApproved ? (
            <Popconfirm
              title={t('borrowOrders.checkoutConfirmTitle', 'Check out this borrow order?')}
              description={t('borrowOrders.checkoutConfirmDescription', 'Stock and asset status will be updated.')}
              okText={t('borrowOrders.checkout', 'Check out')}
              cancelText={t('common.cancel', 'Cancel')}
              onConfirm={async () => {
                await checkout.mutateAsync();
              }}
            >
              <Button className="rounded-full" disabled={checkout.isPending}>
                {checkout.isPending ? t('common.saving', 'กำลังบันทึก...') : t('borrowOrders.checkout', 'Check out')}
              </Button>
            </Popconfirm>
          ) : null}

          {isActive && order.requestType === 'borrow' ? (
            <Button variant="outline" className="rounded-full" onClick={() => onReturn(order)}>
              <ReturnIcon className="h-4 w-4" />
              {t('borrowOrders.return', 'Return')}
            </Button>
          ) : null}

          {isPendingApproval || isApproved || isActive ? (
            <Popconfirm
              title={t('borrowOrders.cancelConfirmTitle', 'Cancel this borrow order?')}
              description={t('borrowOrders.cancelConfirmDescription', 'This will stop the order and release any checked-out assets or stock.')}
              okText={t('borrowOrders.cancel', 'Cancel order')}
              cancelText={t('common.cancel', 'Cancel')}
              okButtonProps={{ danger: true }}
              onConfirm={async () => {
                await cancel.mutateAsync({});
              }}
            >
              <Button variant="destructive" className="rounded-full" disabled={cancel.isPending}>
                {cancel.isPending ? t('common.saving', 'กำลังบันทึก...') : t('borrowOrders.cancel', 'Cancel order')}
              </Button>
            </Popconfirm>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function BorrowOrdersPage() {
  const { wsId = '' } = useParams();
  const { t } = useI18n();
  const query = useBorrowOrders(wsId, { pageSize: 100 });
  const orders = query.data?.items ?? [];
  const [returnOrder, setReturnOrder] = useState<BorrowOrder | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const searchable = `${order.id} ${order.requestedBy} ${order.purpose ?? ''} ${order.lines.map((line) => `${line.productName ?? ''} ${line.assetSerialNumber ?? ''}`).join(' ')}`.toLowerCase();
      return (!term || searchable.includes(term)) && (!statusFilter || order.status.toLowerCase().includes(statusFilter)) && (!requestTypeFilter || order.requestType === requestTypeFilter);
    });
  }, [orders, search, statusFilter, requestTypeFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const visibleOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(
    () => [
      { label: t('borrowOrders.total', 'Total orders'), value: filteredOrders.length },
      { label: t('borrowOrders.pending', 'Pending'), value: filteredOrders.filter((order) => order.status.toLowerCase().includes('pending')).length },
      { label: t('borrowOrders.active', 'Active'), value: filteredOrders.filter((order) => order.status.toLowerCase().includes('active')).length },
    ],
    [filteredOrders, t],
  );

  return (
    <PageShell
      title={t('borrowOrders.title', 'รายการเบิก/ยืม')}
      description={t('borrowOrders.description', 'Review borrowing requests, approve them, and close them when items are returned.')}
      actions={(
        <Button className="w-full sm:w-auto" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          {t('borrowOrders.create', 'สร้างรายการเบิก/ยืม')}
        </Button>
      )}
    >
      <Card className="shadow-sm"><CardContent className="space-y-4 p-4 sm:p-6"><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><FilterIcon className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">ค้นหาและกรอง</p><p className="text-xs text-muted-foreground">ค้นหาเลขรายการ ผู้ยืม วัตถุประสงค์ หรือสินค้า</p></div></div><Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => { setSearch(''); setStatusFilter(''); setRequestTypeFilter(''); setPage(1); }} disabled={!search && !statusFilter && !requestTypeFilter}>ล้างตัวกรอง</Button></div><div className="grid grid-cols-1 gap-3 md:grid-cols-3"><div className="min-w-0 space-y-1"><label className="block text-xs font-medium text-muted-foreground">ค้นหา (เลขรายการ/ผู้ยืม/สินค้า)</label><Input className="w-full rounded-full" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="ค้นหารายการ" /></div><div className="min-w-0 space-y-1"><label className="block text-xs font-medium text-muted-foreground">ประเภทคำขอ</label><Select className="w-full" value={requestTypeFilter} onChange={(event) => { setRequestTypeFilter(event.target.value); setPage(1); }}><option value="">ทั้งหมด</option><option value="borrow">ยืมทรัพย์สิน</option><option value="issue">เบิกสินค้าในคลัง</option></Select></div><div className="min-w-0 space-y-1"><label className="block text-xs font-medium text-muted-foreground">สถานะคำขอ</label><Select className="w-full" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="">ทุกสถานะ</option><option value="pending">รออนุมัติ</option><option value="approved">อนุมัติแล้ว</option><option value="active">กำลังยืม</option><option value="completed">เสร็จสิ้น</option><option value="cancel">ยกเลิก</option></Select></div></div></CardContent></Card>

      <div className="grid gap-[18px] md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-3xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {query.isLoading ? <LoadingState label={t('common.loading', 'Loading...')} /> : null}
      {query.isError ? <ErrorState message={t('borrowOrders.loadError', 'Unable to load borrow orders.')} onRetry={() => query.refetch()} /> : null}

      {orders.length === 0 && !query.isLoading ? (
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-2 text-center">
              <ClipboardCheckIcon className="mx-auto h-10 w-10 text-muted-foreground" />
              <CardTitle className="text-lg">{t('borrowOrders.emptyTitle', 'No borrow orders yet')}</CardTitle>
              <CardDescription>{t('borrowOrders.emptyDescription', 'Borrow requests will appear here once users start creating them.')}</CardDescription>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="component-stack">
        {visibleOrders.map((order) => (
          <BorrowOrderCard key={order.id} order={order} onReturn={setReturnOrder} />
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-border/70 px-5 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>{filteredOrders.length === 0 ? '0 รายการ' : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filteredOrders.length)} จาก ${filteredOrders.length} รายการ`}</span><div className="flex items-center gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>ก่อนหน้า</Button><span className="min-w-16 text-center text-foreground">หน้า {page} / {pageCount}</span><Button type="button" variant="outline" size="sm" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page >= pageCount}>ถัดไป</Button><Select className="w-24" value={String(pageSize)} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value="10">10 / หน้า</option><option value="25">25 / หน้า</option><option value="50">50 / หน้า</option></Select></div></div>

      <CreateBorrowDialog wsId={wsId} open={createOpen} onOpenChange={setCreateOpen} />
      <ReturnDialog order={returnOrder} open={Boolean(returnOrder)} onOpenChange={(open) => !open && setReturnOrder(null)} />
    </PageShell>
  );
}
