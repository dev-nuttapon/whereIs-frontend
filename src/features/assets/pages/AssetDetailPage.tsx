import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Popconfirm, Tag } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { useAsset, useDeleteAsset } from '@/features/assets/hooks/useAssets';
import { AssetPhotoManager } from '@/features/assets/components/AssetPhotoManager';
import { UpdateAssetDialog } from '@/features/assets/components/UpdateAssetDialog';
import { CreateBorrowOrderDialog } from '@/features/borrow-orders/components/CreateBorrowOrderDialog';
import { BorrowOrderReturnDialog } from '@/features/borrow-orders/components/BorrowOrderReturnDialog';
import { useBorrowOrders } from '@/features/borrow-orders/hooks/useBorrowOrders';
import { EditIcon, OpenIcon, ReturnIcon, TakeOutIcon } from '@/components/ui/icons';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { safeAssetUrl } from '@/lib/safe-url';
import { formatDetailDate, statusLabel } from '@/components/common/detailPresentation';
import { useMembers } from '@/features/members/hooks/useMembers';
import { DetailTabs, type DetailTab } from '@/components/common/detailNavigation';

function statusColor(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'available') return 'green';
  if (normalized === 'borrowed') return 'blue';
  if (normalized === 'missing') return 'red';
  if (normalized === 'maintenance') return 'orange';
  if (normalized === 'disposed') return 'default';
  return 'geekblue';
}

export function AssetDetailPage() {
  const { wsId = '', assetId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const assetQuery = useAsset(wsId, assetId);
  const asset = assetQuery.data ?? null;
  const borrowOrdersQuery = useBorrowOrders(wsId, { pageSize: 1000 });
  const membersQuery = useMembers(wsId);
  const deleteAsset = useDeleteAsset(wsId, assetId);
  const [editOpen, setEditOpen] = useState(false);
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab['id']>('overview');

  const photoCount = asset?.photos?.length ?? 0;
  const mainPhoto = useMemo(
    () => asset?.photos?.find((photo) => photo.isMain) ?? asset?.photos?.[0] ?? null,
    [asset?.photos],
  );
  const relatedBorrowOrders = useMemo(
    () =>
      (borrowOrdersQuery.data?.items ?? []).filter((order) =>
        order.lines.some((line) => line.assetId === asset?.id),
      ),
    [asset?.id, borrowOrdersQuery.data?.items],
  );
  const activeBorrowOrder = relatedBorrowOrders.find((order) => order.status.toLowerCase().includes('active') || order.status.toLowerCase().includes('approved')) ?? null;
  const memberNameById = useMemo(() => new Map((membersQuery.data ?? []).map((member) => [member.id, member.user.name])), [membersQuery.data]);

  return (
    <PageShell
      title={t('assets.detail.title', 'รายละเอียดทรัพย์สิน')}
      description={t('assets.detail.description', 'ดูข้อมูลทรัพย์สิน อัปเดตการจัดเก็บ และจัดการรูปภาพ')}
      actions={(
        <Button variant="outline" onClick={() => navigate(ROUTES.workspaceAssets(wsId))}>
          <OpenIcon className="h-4 w-4" />
          {t('assets.detail.back', 'กลับไปที่รายการ')}
        </Button>
      )}
    >
      {assetQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {assetQuery.isError ? <ErrorState message={t('assets.detail.error', 'ไม่สามารถโหลดทรัพย์สินได้')} onRetry={() => assetQuery.refetch()} /> : null}

      {asset ? (
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
                  <CardTitle className="text-lg">{asset.productName}</CardTitle>
                  <CardDescription>{asset.serialNumber ?? asset.barcode ?? asset.productName}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Tag color={statusColor(asset.status)}>{statusLabel(asset.status)}</Tag>
                  <Tag color="blue">{asset.condition}</Tag>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label={t('assets.detail.photoCount', 'รูปภาพ')} value={photoCount} />
                <StatCard label={t('assets.detail.location', 'สถานที่')} value={asset.locationName ?? '-'} />
                <StatCard label={t('assets.detail.container', 'คอนเทนเนอร์')} value={asset.containerName ?? '-'} />
              </div>

              <div className="grid gap-[18px] md:grid-cols-2">
                <Card className="border-border/70 bg-background/70">
                  <CardContent className="space-y-2 p-4">
                    <CardTitle className="text-sm">{t('assets.detail.borrowState', 'สถานะการยืม')}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {asset.status.toLowerCase() === 'borrowed'
                        ? t('assets.detail.borrowedNow', 'กำลังถูกเบิกใช้งาน')
                        : t('assets.detail.availableNow', 'พร้อมให้ยืม')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeBorrowOrder ? (
                        <>
                          <Button asChild variant="outline" size="sm" className="rounded-full">
                            <Link to={ROUTES.workspaceBorrowOrderDetail(wsId, activeBorrowOrder.id)}>
                              <OpenIcon className="h-4 w-4" />
                              {t('assets.detail.openBorrowOrder', 'เปิดรายการยืม')}
                            </Link>
                          </Button>
                          {asset.status.toLowerCase() === 'borrowed' ? (
                            <Button size="sm" className="rounded-full" onClick={() => setReturnOpen(true)}>
                              <ReturnIcon className="h-4 w-4" />
                              {t('assets.detail.returnAsset', 'คืนทรัพย์สิน')}
                            </Button>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/70 bg-background/70">
                  <CardContent className="space-y-2 p-4">
                    <CardTitle className="text-sm">{t('assets.detail.borrowHistory', 'ประวัติการยืม')}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {relatedBorrowOrders.length > 0
                        ? t('assets.detail.borrowHistoryCount', 'มีรายการที่เกี่ยวข้อง {count} รายการ', { count: relatedBorrowOrders.length })
                        : t('assets.detail.noBorrowHistory', 'ยังไม่มีรายการยืม')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setBorrowOpen(true)} disabled={asset.status.toLowerCase() !== 'available'}>
                  <TakeOutIcon className="h-4 w-4" />
                  {t('assets.detail.borrow', 'สร้างรายการยืม')}
                </Button>
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  <EditIcon className="h-4 w-4" />
                  {t('common.edit', 'แก้ไข')}
                </Button>
                <Popconfirm
                  title={t('assets.deleteConfirmTitle', 'ลบทรัพย์สินนี้?')}
                  description={t('assets.deleteConfirmDescription', 'การดำเนินการนี้จะลบทรัพย์สินออกจาก workspace')}
                  okText={t('common.delete', 'ลบ')}
                  cancelText={t('common.cancel', 'ยกเลิก')}
                  okButtonProps={{ danger: true }}
                  onConfirm={async () => {
                    await deleteAsset.mutateAsync();
                    navigate(ROUTES.workspaceAssets(wsId), { replace: true });
                  }}
                >
                  <Button variant="destructive" disabled={deleteAsset.isPending}>
                    {deleteAsset.isPending ? t('common.deleting', 'กำลังลบ...') : t('common.delete', 'ลบ')}
                  </Button>
                </Popconfirm>
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
                <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
                  <Card className="overflow-hidden border-border/80 shadow-sm">
                    <CardContent className="space-y-3 p-5 sm:p-6">
                      <CardTitle className="text-base">{t('assets.detail.preview', 'ภาพตัวอย่าง')}</CardTitle>
                      {mainPhoto ? <img src={safeAssetUrl(mainPhoto.url)} referrerPolicy="no-referrer" loading="lazy" alt={t('assets.photo.alt', 'รูปทรัพย์สิน')} className="h-72 w-full rounded-2xl object-cover" /> : <EmptyState title={t('assets.detail.noPhotoTitle', 'ยังไม่มีรูป')} description={t('assets.detail.noPhotoDescription', 'อัปโหลดรูปแรกจากตัวจัดการรูปภาพด้านล่าง')} />}
                    </CardContent>
                  </Card>
                  <div className="component-stack">
                    <Card className="border-border/80 shadow-sm">
                      <CardContent className="space-y-3 p-5 sm:p-6">
                        <CardTitle className="text-base">{t('assets.detail.metadata', 'ข้อมูลทรัพย์สิน')}</CardTitle>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {[
                            ['สินค้า', asset.productName], ['สถานที่', asset.locationName ?? '-'], ['จุดจัดเก็บ', asset.containerName ?? '-'],
                            ['Serial number', asset.serialNumber ?? '-'], ['บาร์โค้ด', asset.barcode ?? '-'], ['วันที่ได้มา', formatDetailDate(asset.acquiredDate)],
                            ['วันหมดอายุ', formatDetailDate(asset.expiryDate)], ['แจ้งเตือนล่วงหน้า', `${asset.alertLeadDays ?? '-'} ${t('common.days', 'วัน')}`],
                          ].map(([label, value]) => <div key={label} className="rounded-xl border border-border/70 bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>)}
                        </div>
                        <p className="text-sm text-muted-foreground">{asset.notes?.trim() ? asset.notes : t('assets.detail.noNotes', 'ไม่มีหมายเหตุ')}</p>
                      </CardContent>
                    </Card>
                    <PermissionGuard perm="asset.manage"><AssetPhotoManager wsId={wsId} assetId={asset.id} photos={asset.photos ?? []} /></PermissionGuard>
                  </div>
                </div>
              ),
            },
            {
              id: 'activity',
              label: 'ประวัติการใช้งาน',
              content: (
                <Card className="border-border/80 shadow-sm">
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <CardTitle className="text-base">{t('assets.detail.relatedBorrowOrders', 'รายการยืมที่เกี่ยวข้อง')}</CardTitle>
                    {relatedBorrowOrders.length === 0 ? <EmptyState title={t('assets.detail.noBorrowHistory', 'ยังไม่มีรายการยืม')} description={t('assets.detail.noBorrowHistoryDescription', 'ประวัติการยืมของทรัพย์สินนี้จะแสดงที่นี่เมื่อมีการขอใช้งาน')} /> : <div className="component-stack">{relatedBorrowOrders.slice(0, 5).map((order) => <div key={order.id} className="rounded-2xl border border-border/70 bg-background/70 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div className="space-y-1"><p className="text-sm font-medium">{order.purpose ?? 'รายการยืม'}</p><p className="text-xs text-muted-foreground">{t('borrowOrders.requestedBy', 'ผู้ขอ')}: {memberNameById.get(order.requestedBy) ?? 'สมาชิกใน workspace'}</p></div><Tag color={statusColor(order.status)}>{statusLabel(order.status)}</Tag></div><div className="mt-3"><Button asChild variant="outline" size="sm" className="rounded-full"><Link to={ROUTES.workspaceBorrowOrderDetail(wsId, order.id)}><OpenIcon className="h-4 w-4" />{t('common.open', 'เปิด')}</Link></Button></div></div>)}</div>}
                  </CardContent>
                </Card>
              ),
            },
          ]}
        />
      ) : null}

      {asset ? (
        <UpdateAssetDialog
          wsId={wsId}
          asset={asset}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}

      <CreateBorrowOrderDialog
        wsId={wsId}
        open={borrowOpen}
        onOpenChange={setBorrowOpen}
        initialAssetId={asset?.status.toLowerCase() === 'available' ? asset.id : null}
      />

      <BorrowOrderReturnDialog
        order={activeBorrowOrder}
        open={returnOpen}
        onOpenChange={setReturnOpen}
      />
    </PageShell>
  );
}
