import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Popconfirm, Tag } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useI18n } from '@/hooks/useI18n';
import { ClipboardCheckIcon, ReturnIcon, TakeOutIcon } from '@/components/ui/icons';
import {
  useApproveBorrowOrder,
  useBorrowOrders,
  useCancelBorrowOrder,
  useCheckOutBorrowOrder,
  useRejectBorrowOrder,
  useReturnBorrowOrder,
} from '@/features/borrow-orders/hooks/useBorrowOrders';
import type { BorrowOrder, BorrowOrderLine } from '@/types/domain.types';

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
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
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : resetAndClose())}>
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
            <CardDescription>{order.id}</CardDescription>
          </div>
          <Tag color={statusColor(order.status)}>{order.status}</Tag>
        </div>

        <div className="grid gap-[18px] md:grid-cols-2">
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>{t('borrowOrders.requestedBy', 'Requested by')}: {order.requestedBy}</div>
            <div>{t('borrowOrders.needByDate', 'Need by')}: {formatDate(order.needByDate)}</div>
            <div>{t('borrowOrders.returnByDate', 'Return by')}: {formatDate(order.returnByDate)}</div>
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
                  <Tag color={statusColor(line.status)}>{line.status}</Tag>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {line.assetId ? t('borrowOrders.assetLine', 'Asset line') : t('borrowOrders.stockLine', 'Stock line')}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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

          {isActive ? (
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

  const stats = useMemo(
    () => [
      { label: t('borrowOrders.total', 'Total orders'), value: orders.length },
      { label: t('borrowOrders.pending', 'Pending'), value: orders.filter((order) => order.status.toLowerCase().includes('pending')).length },
      { label: t('borrowOrders.active', 'Active'), value: orders.filter((order) => order.status.toLowerCase().includes('active')).length },
    ],
    [orders, t],
  );

  return (
    <PageShell
      title={t('borrowOrders.title', 'Borrow orders')}
      description={t('borrowOrders.description', 'Review borrowing requests, approve them, and close them when items are returned.')}
    >
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
        {orders.map((order) => (
          <BorrowOrderCard key={order.id} order={order} onReturn={setReturnOrder} />
        ))}
      </div>

      <ReturnDialog order={returnOrder} open={Boolean(returnOrder)} onOpenChange={(open) => !open && setReturnOrder(null)} />
    </PageShell>
  );
}
