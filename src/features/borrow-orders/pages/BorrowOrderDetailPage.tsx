import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Popconfirm, Tag } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useI18n } from '@/hooks/useI18n';
import { ROUTES } from '@/constants/routes';
import {
  useApproveBorrowOrder,
  useBorrowOrder,
  useCancelBorrowOrder,
  useCheckOutBorrowOrder,
  useRejectBorrowOrder,
} from '@/features/borrow-orders/hooks/useBorrowOrders';
import { BorrowOrderReturnDialog } from '@/features/borrow-orders/components/BorrowOrderReturnDialog';
import { OpenIcon, ReturnIcon, TakeOutIcon } from '@/components/ui/icons';
import type { BorrowOrderLine } from '@/types/domain.types';

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

export function BorrowOrderDetailPage() {
  const { wsId = '', orderId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const orderQuery = useBorrowOrder(wsId, orderId);
  const order = orderQuery.data ?? null;
  const approve = useApproveBorrowOrder(wsId, orderId);
  const reject = useRejectBorrowOrder(wsId, orderId);
  const checkout = useCheckOutBorrowOrder(wsId, orderId);
  const cancel = useCancelBorrowOrder(wsId, orderId);
  const [returnOpen, setReturnOpen] = useState(false);
  const [lineSearch, setLineSearch] = useState('');
  const [lineKind, setLineKind] = useState<'all' | 'asset' | 'stock'>('all');

  const lines = useMemo(() => order?.lines ?? [], [order?.lines]);
  const filteredLines = useMemo(() => {
    const search = lineSearch.trim().toLowerCase();
    return lines.filter((line) => {
      const matchesKind = lineKind === 'all' || (lineKind === 'asset' && Boolean(line.assetId)) || (lineKind === 'stock' && Boolean(line.stockEntryId));
      const label = formatLineLabel(line).toLowerCase();
      const matchesSearch = !search || label.includes(search) || (line.assetId ?? '').toLowerCase().includes(search) || (line.productId ?? '').toLowerCase().includes(search);
      return matchesKind && matchesSearch;
    });
  }, [lineKind, lineSearch, lines]);
  const isPendingApproval = Boolean(order?.status.toLowerCase().includes('pending'));
  const isApproved = Boolean(order?.status.toLowerCase().includes('approved'));
  const isActive = Boolean(order?.status.toLowerCase().includes('active'));

  return (
    <PageShell
      title={t('borrowOrders.detail.title', 'Borrow order detail')}
      description={t('borrowOrders.detail.description', 'View the order, review each line, and continue the workflow here.')}
      actions={order ? (
        <Button variant="outline" onClick={() => navigate(ROUTES.workspaceBorrowOrders(wsId))}>
          <OpenIcon className="h-4 w-4" />
          {t('borrowOrders.detail.back', 'Back to list')}
        </Button>
      ) : undefined}
    >
      {orderQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {orderQuery.isError ? <ErrorState message={t('borrowOrders.detail.loadError', 'Unable to load borrow order.')} onRetry={() => orderQuery.refetch()} /> : null}

      {order ? (
        <div className="component-stack">
          <Card>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{order.purpose ?? t('borrowOrders.untitled', 'Borrow order')}</CardTitle>
                  <CardDescription>{order.id}</CardDescription>
                </div>
                <Tag color={statusColor(order.status)}>{order.status}</Tag>
              </div>

              <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
                <Card className="border-border/70 bg-background/70">
                  <CardContent className="space-y-2 p-4">
                    <CardTitle className="text-sm">{t('borrowOrders.requestedBy', 'Requested by')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{order.requestedBy}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/70 bg-background/70">
                  <CardContent className="space-y-2 p-4">
                    <CardTitle className="text-sm">{t('borrowOrders.needByDate', 'Need by')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{formatDate(order.needByDate)}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/70 bg-background/70">
                  <CardContent className="space-y-2 p-4">
                    <CardTitle className="text-sm">{t('borrowOrders.returnByDate', 'Return by')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{formatDate(order.returnByDate)}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/70 bg-background/70">
                  <CardContent className="space-y-2 p-4">
                    <CardTitle className="text-sm">{t('borrowOrders.requiresApproval', 'Requires approval')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{order.requiresApproval ? t('common.yes', 'Yes') : t('common.no', 'No')}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/70 bg-background/70">
                  <CardContent className="space-y-2 p-4">
                    <CardTitle className="text-sm">{t('borrowOrders.approvedBy', 'Approved by')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{order.approvedBy ?? '-'}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/70 bg-background/70">
                  <CardContent className="space-y-2 p-4">
                    <CardTitle className="text-sm">{t('borrowOrders.reviewNote', 'Review note')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{order.reviewNote ?? '-'}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base">{t('borrowOrders.linesTitle', 'Lines')}</CardTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={lineSearch}
                    onChange={(event) => setLineSearch(event.target.value)}
                    placeholder={t('borrowOrders.detail.lineSearchPlaceholder', 'Search line')}
                    className="rounded-full"
                  />
                  <Select value={lineKind} onChange={(event) => setLineKind(event.target.value as 'all' | 'asset' | 'stock')} className="w-full">
                    <option value="all">{t('borrowOrders.detail.allLines', 'All lines')}</option>
                    <option value="asset">{t('borrowOrders.assetLine', 'Asset line')}</option>
                    <option value="stock">{t('borrowOrders.stockLine', 'Stock line')}</option>
                  </Select>
                </div>
              </div>

              {lines.length === 0 ? (
                <EmptyState
                  title={t('borrowOrders.emptyLinesTitle', 'No lines')}
                  description={t('borrowOrders.emptyLinesDescription', 'This order does not contain any borrow lines.')}
                />
              ) : filteredLines.length === 0 ? (
                <EmptyState
                  title={t('borrowOrders.detail.noFilteredLinesTitle', 'No matching lines')}
                  description={t('borrowOrders.detail.noFilteredLinesDescription', 'Try a different search term or line type filter.')}
                />
              ) : (
                <div className="component-stack">
                  {filteredLines.map((line) => (
                    <div key={line.id} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{formatLineLabel(line)}</p>
                          <p className="text-xs text-muted-foreground">
                            {line.assetId ? t('borrowOrders.assetLine', 'Asset line') : t('borrowOrders.stockLine', 'Stock line')}
                          </p>
                        </div>
                        <Tag color={statusColor(line.status)}>{line.status}</Tag>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
                        <p>{t('borrowOrders.line.assetId', 'Asset ID')}: {line.assetId ?? '-'}</p>
                        <p>{t('borrowOrders.line.productId', 'Product ID')}: {line.productId ?? '-'}</p>
                        <p>{t('borrowOrders.line.stockEntryId', 'Stock entry ID')}: {line.stockEntryId ?? '-'}</p>
                        <p>{t('borrowOrders.line.quantity', 'Quantity')}: {line.quantity ?? '-'}</p>
                        <p>{t('borrowOrders.line.returnedQuantity', 'Returned')}: {line.returnedQuantity ?? 0}</p>
                        <p>{t('borrowOrders.line.returnedAt', 'Returned at')}: {line.returnedAt ? formatDate(line.returnedAt) : '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <CardTitle className="text-base">{t('borrowOrders.actionsTitle', 'Actions')}</CardTitle>
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
                  <Button variant="outline" className="rounded-full" onClick={() => setReturnOpen(true)}>
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
        </div>
      ) : null}

      <BorrowOrderReturnDialog order={order} open={returnOpen} onOpenChange={setReturnOpen} />
    </PageShell>
  );
}
