import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Popconfirm, Tag } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { StatCard } from '@/components/common/StatCard';
import { useI18n } from '@/hooks/useI18n';
import { EditIcon, ItemIcon } from '@/components/ui/icons';
import { ROUTES } from '@/constants/routes';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { useDeleteItem, useItem, useItemEvents } from '@/features/items/hooks/useItems';
import { UpdateItemDialog } from '@/features/items/components/UpdateItemDialog';
import { CreateBorrowOrderDialog } from '@/features/borrow-orders/components/CreateBorrowOrderDialog';
import { TakeOutIcon } from '@/components/ui/icons';
import { safeAssetUrl } from '@/lib/safe-url';

function statusColor(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'stored') return 'green';
  if (normalized === 'taken_out') return 'blue';
  if (normalized === 'reserved') return 'gold';
  if (normalized === 'missing') return 'red';
  if (normalized === 'repair') return 'orange';
  if (normalized === 'disposed') return 'default';
  return 'geekblue';
}

export function ItemDetailPage() {
  const { wsId = '', itemId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const itemQuery = useItem(wsId, itemId);
  const eventsQuery = useItemEvents(wsId, itemId);
  const containersQuery = useContainers(wsId);
  const item = itemQuery.data ?? null;
  const [editOpen, setEditOpen] = useState(false);
  const [borrowOpen, setBorrowOpen] = useState(false);
  const deleteItem = useDeleteItem(wsId, itemId);

  const containerNameById = useMemo(
    () => new Map((containersQuery.data ?? []).map((container) => [container.id, container.name])),
    [containersQuery.data],
  );
  const containerLabel = item?.containerId ? (containerNameById.get(item.containerId) ?? item.containerId) : t('items.detail.noContainer', 'ไม่มี container');

  return (
    <PageShell title={t('items.detail.title', 'รายละเอียดรายการ')} description={t('items.detail.pageDescription', 'ดูสถานะ ข้อมูลประกอบ และประวัติของรายการนี้')}>
      <div className="component-stack">
        {itemQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
        {itemQuery.isError ? <ErrorState message={t('items.detail.loadError', 'ไม่สามารถโหลดรายการได้')} onRetry={() => itemQuery.refetch()} /> : null}

        {item ? (
          <>
            <Card>
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.code ?? item.id}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.kind === 'stock' ? (
                      <Button variant="outline" size="sm" onClick={() => setBorrowOpen(true)} disabled={!item}>
                        <TakeOutIcon className="h-4 w-4" />
                        {t('items.detail.borrow', 'สร้างรายการยืม')}
                      </Button>
                    ) : null}
                    <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} disabled={!item}>
                      <EditIcon className="h-4 w-4" />
                      {t('items.detail.edit', 'แก้ไขรายการ')}
                    </Button>
                    <Popconfirm
                      title={t('items.detail.deleteConfirmTitle', 'ลบรายการนี้?')}
                      description={t('items.detail.deleteConfirmDescription', 'การลบจะนำของชิ้นนี้ออกจาก workspace')}
                      okText={t('common.delete', 'ลบ')}
                      cancelText={t('common.cancel', 'ยกเลิก')}
                      okButtonProps={{ danger: true }}
                      onConfirm={async () => {
                        await deleteItem.mutateAsync();
                        navigate(ROUTES.workspaceItems(wsId), { replace: true });
                      }}
                    >
                      <Button variant="destructive" size="sm" disabled={deleteItem.isPending}>
                        {deleteItem.isPending ? t('common.deleting', 'กำลังลบ...') : t('common.delete', 'ลบ')}
                      </Button>
                    </Popconfirm>
                  </div>
                </div>

                <div className="grid gap-[18px] md:grid-cols-3">
                  <StatCard label={t('items.detail.kind', 'ประเภท')} value={item.kind === 'stock' ? t('items.kind.stock', 'แบบจำนวน') : t('items.kind.single', 'แบบชิ้นเดียว')} />
                  <StatCard label={t('items.detail.status', 'สถานะ')} value={item.status} />
                  <StatCard label={t('items.detail.containerPrefix', 'คอนเทนเนอร์')} value={containerLabel} />
                </div>

                <div className="grid gap-[18px] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-3 p-4">
                      <CardTitle className="text-sm">{t('items.detail.photo', 'รูปภาพ')}</CardTitle>
                      {item.photoUrl ? (
                        <img
                          src={safeAssetUrl(item.photoUrl)}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          alt={item.name}
                          className="h-72 w-full rounded-2xl object-cover"
                        />
                      ) : (
                        <EmptyState
                          title={t('items.detail.noPhotoTitle', 'ยังไม่มีรูป')}
                          description={t('items.detail.noPhotoDescription', 'เพิ่ม URL รูปภาพจากหน้าต่างแก้ไขเพื่อแสดงรูปของรายการนี้')}
                          icon={<ItemIcon className="h-5 w-5" />}
                        />
                      )}
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('items.detail.storage', 'ที่จัดเก็บ')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('items.detail.container', 'คอนเทนเนอร์')}: {containerLabel}</p>
                      <p className="text-sm text-muted-foreground">{t('items.detail.holderPrefix', 'ผู้ถือครอง')}: {item.currentHolderId ?? '-'}</p>
                      <p className="text-sm text-muted-foreground">{t('items.detail.stockCount', 'จำนวน')}: {item.quantity ?? '-'}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('items.detail.currentState', 'สถานะปัจจุบัน')}</CardTitle>
                      <Tag color={statusColor(item.status)}>{item.status}</Tag>
                      <p className="text-sm text-muted-foreground">{item.usageType}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('items.detail.lifecycle', 'วงจรชีวิต')}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {item.kind === 'stock'
                          ? t('items.detail.stockLifecycle', 'ติดตามตามจำนวน')
                          : t('items.detail.singleLifecycle', 'ติดตามแบบชิ้นเดียว')}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.currentHolderId ? `${t('items.detail.holderPrefix', 'ผู้ถือครอง')}: ${item.currentHolderId}` : t('items.detail.noHolder', 'ไม่มีผู้ถือครอง')}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('items.detail.dates', 'วันที่')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('items.detail.receivedDate', 'รับเข้า')}: {item.receivedDate ? new Date(item.receivedDate).toLocaleDateString() : '-'}</p>
                      <p className="text-sm text-muted-foreground">{t('items.detail.expiryDate', 'หมดอายุ')}: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}</p>
                      <p className="text-sm text-muted-foreground">{t('items.detail.warrantyEndDate', 'ประกันสิ้นสุด')}: {item.warrantyEndDate ? new Date(item.warrantyEndDate).toLocaleDateString() : '-'}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-[18px] md:grid-cols-2">
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('items.detail.identification', 'ข้อมูลระบุ')}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t('items.detail.code', 'รหัส')}: {item.code ?? '-'}</p>
                      <p className="text-sm text-muted-foreground">{t('items.detail.lotCode', 'ล็อต')}: {item.lotCode ?? '-'}</p>
                      <p className="text-sm text-muted-foreground">{t('items.detail.reorderPoint', 'จุดสั่งเพิ่ม')}: {item.reorderPoint ?? '-'}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-background/70">
                    <CardContent className="space-y-2 p-4">
                      <CardTitle className="text-sm">{t('items.detail.description', 'คำอธิบาย')}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {item.description?.trim() ? item.description : t('items.detail.noDescription', 'ไม่มีคำอธิบาย')}
                      </p>
                      <p className="text-sm text-muted-foreground">{t('items.detail.container', 'คอนเทนเนอร์')}: {containerLabel}</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-5 sm:p-6">
                <CardTitle className="text-base">{t('items.detail.activity', 'กิจกรรม')}</CardTitle>
                {eventsQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
                {eventsQuery.isError ? <ErrorState message={t('items.detail.activityError', 'ไม่สามารถโหลดประวัติรายการได้')} onRetry={() => eventsQuery.refetch()} /> : null}
                {(eventsQuery.data ?? []).length === 0 ? (
                  <EmptyState
                    title={t('items.detail.noActivityTitle', 'ยังไม่มีกิจกรรม')}
                    description={t('items.detail.noActivityDescription', 'การกระทำกับของชิ้นนี้จะแสดงที่นี่')}
                    icon={<ItemIcon className="h-5 w-5" />}
                  />
                ) : (
                  <div className="component-stack">
                    {(eventsQuery.data ?? []).map((event) => (
                      <div key={event.id} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-medium">{event.type}</p>
                          <p className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{event.actor.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {item ? (
        <UpdateItemDialog
          wsId={wsId}
          item={item}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}

      <CreateBorrowOrderDialog
        wsId={wsId}
        open={borrowOpen}
        onOpenChange={setBorrowOpen}
        initialStockEntryId={item?.kind === 'stock' ? item.id : null}
      />
    </PageShell>
  );
}
