import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Tag } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { useStockEntries } from '@/features/stock/hooks/useStock';
import { CreateBorrowOrderDialog } from '@/features/borrow-orders/components/CreateBorrowOrderDialog';
import { BorrowOrderReturnDialog } from '@/features/borrow-orders/components/BorrowOrderReturnDialog';
import { useBorrowOrders } from '@/features/borrow-orders/hooks/useBorrowOrders';
import { EditIcon, OpenIcon, ReturnIcon, TakeOutIcon } from '@/components/ui/icons';

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

export function StockDetailPage() {
  const { wsId = '', stockEntryId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const entriesQuery = useStockEntries(wsId, { pageSize: 1000 });
  const borrowOrdersQuery = useBorrowOrders(wsId, { pageSize: 1000 });
  const entry = useMemo(
    () => (entriesQuery.data?.items ?? []).find((item) => item.id === stockEntryId) ?? null,
    [entriesQuery.data?.items, stockEntryId],
  );
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  if (entriesQuery.isLoading) {
    return <LoadingState label={t('common.loading')} />;
  }

  if (entriesQuery.isError) {
    return <ErrorState message={t('stock.detail.loadError', 'Unable to load stock entry.')} onRetry={() => entriesQuery.refetch()} />;
  }

  if (!entry) {
    return (
      <PageShell title={t('stock.detail.title', 'Stock detail')} description={t('stock.detail.description', 'View stock status and related borrow flow.')}>
        <EmptyState
          title={t('stock.detail.emptyTitle', 'Stock entry not found')}
          description={t('stock.detail.emptyDescription', 'This stock entry does not exist or was removed.')}
        />
      </PageShell>
    );
  }

  const relatedOrders = (borrowOrdersQuery.data?.items ?? []).filter((order) =>
    order.lines.some((line) => line.stockEntryId === stockEntryId || line.productId === entry.productId),
  );
  const activeBorrowOrder = relatedOrders.find((order) => order.status.toLowerCase().includes('active') || order.status.toLowerCase().includes('approved')) ?? null;
  const timeline = [
    {
      id: `created-${entry.id}`,
      type: 'created',
      title: t('stock.detail.timeline.created', 'Stock entry created'),
      description: entry.locationName ?? entry.containerName ?? entry.productName,
      date: entry.createdAt,
    },
    ...relatedOrders.map((order) => ({
      id: order.id,
      type: order.status,
      title: order.purpose ?? order.id,
      description: `${t('borrowOrders.requestedBy', 'Requested by')}: ${order.requestedBy}`,
      date: order.createdAt,
    })),
  ].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

  return (
    <PageShell
      title={t('stock.detail.title', 'Stock detail')}
      description={t('stock.detail.description', 'View stock status and related borrow flow.')}
      actions={(
        <Button variant="outline" onClick={() => navigate(ROUTES.workspaceStock(wsId))}>
          <OpenIcon className="h-4 w-4" />
          {t('stock.detail.back', 'Back to list')}
        </Button>
      )}
    >
      <div className="component-stack">
        <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{entry.productName}</CardTitle>
                <CardDescription>{entry.unitCode ?? entry.productId}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Tag color="blue">{t('stock.detail.stockEntry', 'Stock entry')}</Tag>
                {activeBorrowOrder ? <Tag color={statusColor(activeBorrowOrder.status)}>{activeBorrowOrder.status}</Tag> : null}
              </div>
            </div>

            <div className="grid gap-[18px] md:grid-cols-3">
              <StatCard label={t('stock.quantity', 'Quantity')} value={entry.quantity} />
              <StatCard label={t('stock.location', 'Location')} value={entry.locationName ?? entry.containerName ?? '-'} />
              <StatCard label={t('stock.detail.relatedOrders', 'Related orders')} value={relatedOrders.length} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setBorrowOpen(true)}>
                <TakeOutIcon className="h-4 w-4" />
                {t('stock.borrow.fromEntry', 'Borrow from this entry')}
              </Button>
              <Button variant="outline" onClick={() => navigate(ROUTES.workspaceStock(wsId))}>
                <EditIcon className="h-4 w-4" />
                {t('stock.detail.adjustMore', 'Adjust stock')}
              </Button>
              {activeBorrowOrder ? (
                <Button variant="outline" onClick={() => setReturnOpen(true)}>
                  <ReturnIcon className="h-4 w-4" />
                  {t('stock.detail.returnStock', 'Return stock')}
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <CardTitle className="text-base">{t('stock.detail.relatedBorrowOrders', 'Related borrow orders')}</CardTitle>
            {relatedOrders.length === 0 ? (
              <EmptyState
                title={t('stock.detail.noBorrowHistory', 'No borrow orders yet')}
                description={t('stock.detail.noBorrowHistoryDescription', 'Borrow history for this stock entry will appear here once it is requested.')}
              />
            ) : (
              <div className="component-stack">
                {relatedOrders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{order.purpose ?? order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('borrowOrders.requestedBy', 'Requested by')}: {order.requestedBy}
                        </p>
                      </div>
                      <Tag color={statusColor(order.status)}>{order.status}</Tag>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <CardTitle className="text-base">{t('stock.detail.timelineTitle', 'Stock timeline')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('stock.detail.timelineDescription', 'Creation and borrow activity for this stock entry.')}</p>
            <div className="component-stack">
              {timeline.map((entryItem) => (
                <div key={entryItem.id} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium">{entryItem.title}</p>
                    <Tag color={entryItem.type === 'created' ? 'green' : statusColor(entryItem.type)}>{entryItem.type}</Tag>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{entryItem.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(entryItem.date).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateBorrowOrderDialog
        wsId={wsId}
        open={borrowOpen}
        onOpenChange={setBorrowOpen}
        initialProductId={entry.productId}
        initialStockEntryId={entry.id}
      />

      <BorrowOrderReturnDialog order={activeBorrowOrder} open={returnOpen} onOpenChange={setReturnOpen} />
    </PageShell>
  );
}
