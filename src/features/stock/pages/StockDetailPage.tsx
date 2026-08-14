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
import { formatDetailDate, statusLabel } from '@/components/common/detailPresentation';
import { DetailTabs, type DetailTab } from '@/components/common/detailNavigation';
import { useMembers } from '@/features/members/hooks/useMembers';

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
  const membersQuery = useMembers(wsId);
  const entry = useMemo(
    () => (entriesQuery.data?.items ?? []).find((item) => item.id === stockEntryId) ?? null,
    [entriesQuery.data?.items, stockEntryId],
  );
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab['id']>('overview');

  if (entriesQuery.isLoading) {
    return <LoadingState label={t('common.loading')} />;
  }

  if (entriesQuery.isError) {
    return <ErrorState message={t('stock.detail.loadError', 'Unable to load stock entry.')} onRetry={() => entriesQuery.refetch()} />;
  }

  if (!entry) {
    return (
      <PageShell title={t('stock.detail.title', 'รายละเอียดสต็อก')} description={t('stock.detail.description', 'ดูจำนวน สถานที่จัดเก็บ และประวัติการใช้งานของสต็อก')}>
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
  const memberNameById = useMemo(() => new Map((membersQuery.data ?? []).map((member) => [member.id, member.user.name])), [membersQuery.data]);
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
      title: order.purpose ?? 'รายการยืม',
      description: `${t('borrowOrders.requestedBy', 'ผู้ขอ')}: ${memberNameById.get(order.requestedBy) ?? 'สมาชิกใน workspace'}`,
      date: order.createdAt,
    })),
  ].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

  return (
    <PageShell
      title={t('stock.detail.title', 'รายละเอียดสต็อก')}
      description={t('stock.detail.description', 'ดูจำนวน สถานที่จัดเก็บ และประวัติการใช้งานของสต็อก')}
      actions={(
        <Button variant="outline" onClick={() => navigate(ROUTES.workspaceStock(wsId))}>
          <OpenIcon className="h-4 w-4" />
          {t('stock.detail.back', 'กลับไปที่รายการ')}
        </Button>
      )}
    >
      <DetailTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'overview',
            label: 'ภาพรวม',
            content: (
              <div className="component-stack">
        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="-mx-5 -mt-5 flex flex-col gap-3 border-b border-border/70 bg-muted/30 p-5 sm:-mx-6 sm:-mt-6 sm:flex-row sm:items-start sm:justify-between sm:p-6">
              <div className="space-y-1">
                <CardTitle className="text-lg">{entry.productName}</CardTitle>
                <CardDescription>{entry.unitCode ?? entry.productName}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Tag color="blue">{t('stock.detail.stockEntry', 'สต็อก')}</Tag>
                {activeBorrowOrder ? <Tag color={statusColor(activeBorrowOrder.status)}>{statusLabel(activeBorrowOrder.status)}</Tag> : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label={t('stock.quantity', 'จำนวนคงเหลือ')} value={`${entry.quantity} ${entry.unitCode ?? ''}`.trim()} />
              <StatCard label={t('stock.location', 'จุดจัดเก็บ')} value={entry.locationName ?? entry.containerName ?? '-'} />
              <StatCard label={t('stock.detail.relatedOrders', 'รายการยืมที่เกี่ยวข้อง')} value={relatedOrders.length} />
              <StatCard label={t('stock.detail.lot', 'ล็อต / ชุด')} value={entry.lotCode ?? '-'} />
            </div>
            <div className="text-sm text-muted-foreground">
              {t('stock.detail.expiry', 'วันหมดอายุ')}: {formatDetailDate(entry.expiryDate)}
              {' · '}{t('stock.detail.alertLeadDays', 'แจ้งเตือนล่วงหน้า')}: {entry.alertLeadDays ?? '-'} {t('common.days', 'วัน')}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setBorrowOpen(true)}>
                <TakeOutIcon className="h-4 w-4" />
                {t('stock.borrow.fromEntry', 'เบิกจากสต็อกนี้')}
              </Button>
              <Button variant="outline" onClick={() => navigate(ROUTES.workspaceStock(wsId))}>
                <EditIcon className="h-4 w-4" />
                {t('stock.detail.adjustMore', 'ปรับยอดสต็อก')}
              </Button>
              {activeBorrowOrder ? (
                <Button variant="outline" onClick={() => setReturnOpen(true)}>
                  <ReturnIcon className="h-4 w-4" />
                  {t('stock.detail.returnStock', 'คืนสต็อก')}
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
              </div>
            ),
          },
          {
            id: 'details',
            label: 'ข้อมูลรายละเอียด',
            content: (
              <Card className="border-border/80 shadow-sm">
                <CardContent className="space-y-4 p-5 sm:p-6">
                  <CardTitle className="text-base">ข้อมูลสต็อก</CardTitle>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4"><p className="text-xs text-muted-foreground">สินค้า</p><p className="mt-1 font-medium">{entry.productName}</p></div>
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4"><p className="text-xs text-muted-foreground">หน่วย</p><p className="mt-1 font-medium">{entry.unitCode ?? '-'}</p></div>
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4"><p className="text-xs text-muted-foreground">ล็อต / ชุด</p><p className="mt-1 font-medium">{entry.lotCode ?? '-'}</p></div>
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4"><p className="text-xs text-muted-foreground">วันหมดอายุ</p><p className="mt-1 font-medium">{formatDetailDate(entry.expiryDate)}</p></div>
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4"><p className="text-xs text-muted-foreground">สถานที่</p><p className="mt-1 font-medium">{entry.locationName ?? '-'}</p></div>
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4"><p className="text-xs text-muted-foreground">ภาชนะจัดเก็บ</p><p className="mt-1 font-medium">{entry.containerName ?? '-'}</p></div>
                  </div>
                </CardContent>
              </Card>
            ),
          },
          {
            id: 'activity',
            label: 'ประวัติการใช้งาน',
            content: (
              <div className="component-stack">

        <Card className="border-border/80 shadow-sm">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <CardTitle className="text-base">{t('stock.detail.relatedBorrowOrders', 'รายการยืมที่เกี่ยวข้อง')}</CardTitle>
            {relatedOrders.length === 0 ? (
              <EmptyState
                title={t('stock.detail.noBorrowHistory', 'ยังไม่มีรายการยืม')}
                description={t('stock.detail.noBorrowHistoryDescription', 'ประวัติการยืมของสต็อกนี้จะแสดงที่นี่เมื่อมีการขอใช้งาน')}
              />
            ) : (
              <div className="component-stack">
                {relatedOrders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{order.purpose ?? 'รายการยืม'}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('borrowOrders.requestedBy', 'ผู้ขอ')}: {memberNameById.get(order.requestedBy) ?? 'สมาชิกใน workspace'}
                        </p>
                      </div>
                      <Tag color={statusColor(order.status)}>{statusLabel(order.status)}</Tag>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link to={ROUTES.workspaceBorrowOrderDetail(wsId, order.id)}>
                          <OpenIcon className="h-4 w-4" />
                          {t('common.open', 'เปิดรายการ')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <CardTitle className="text-base">{t('stock.detail.timelineTitle', 'ประวัติสต็อก')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('stock.detail.timelineDescription', 'การรับเข้าและกิจกรรมการยืมของสต็อกนี้')}</p>
            <div className="component-stack">
              {timeline.map((entryItem) => (
                <div key={entryItem.id} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium">{entryItem.title}</p>
                    <Tag color={entryItem.type === 'created' ? 'green' : statusColor(entryItem.type)}>{entryItem.type === 'created' ? 'สร้างรายการ' : statusLabel(entryItem.type)}</Tag>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{entryItem.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(entryItem.date).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
              </div>
            ),
          },
        ]}
      />

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
