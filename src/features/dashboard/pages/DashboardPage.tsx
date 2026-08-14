import { Link, useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { useMembers } from '@/features/members/hooks/useMembers';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useWorkspace } from '@/features/workspaces/hooks/useWorkspace';
import { useI18n } from '@/hooks/useI18n';
import { workspaceStore } from '@/stores/workspace.store';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/usePermission';
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';
import { ActivityIcon, ItemIcon, MemberIcon, SearchIcon, PlusIcon, BorrowIcon, BellIcon } from '@/components/ui/icons';

export function DashboardPage() {
  const { wsId = '' } = useParams();
  const { t } = useI18n();
  const workspaceQuery = useWorkspace(wsId);
  const containersQuery = useContainers(wsId);
  const membersQuery = useMembers(wsId);
  const productsQuery = useProducts(wsId);
  const notificationsQuery = useNotifications(wsId);
  const dashboardQuery = useDashboardSummary(wsId);
  const { can } = usePermission();
  const currentWorkspace = workspaceStore((state) => state.currentWorkspace);

  const workspace = workspaceQuery.data ?? currentWorkspace;
  const containers = containersQuery.data ?? [];
  const members = membersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const notifications = notificationsQuery.data?.items ?? [];
  const summary = dashboardQuery.data;
  const isLoading = workspaceQuery.isLoading || containersQuery.isLoading || membersQuery.isLoading;
  const hasError = workspaceQuery.isError || containersQuery.isError || membersQuery.isError;
  const isReady = !isLoading && !hasError;

  return (
    <PageShell
      title={t('dashboard.title')}
      description={t('dashboard.description')}
      compact
    >
      {isLoading ? (
        <LoadingState label={t('common.loading')} />
      ) : null}
      {hasError ? (
        <ErrorState
          message={t('dashboard.summaryErrorAction', 'We could not load the workspace overview. Try again.')}
          onRetry={() => {
            void workspaceQuery.refetch();
            void containersQuery.refetch();
            void membersQuery.refetch();
          }}
        />
      ) : null}

      {isReady && workspace ? (
        <div className="component-stack">
          <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="ของทั้งหมด" value={summary?.totalItems ?? '-'} description="จำนวนรายการที่มองเห็นใน workspace" to={ROUTES.workspaceSearch(wsId)} />
            <StatCard label="จัดเก็บอยู่" value={summary?.stored ?? '-'} description="รายการที่อยู่ในจุดจัดเก็บ" to={ROUTES.workspaceSearch(wsId)} />
            <StatCard label="ถูกยืม/นำออก" value={summary?.borrowed ?? '-'} description="รายการที่อยู่กับผู้ยืมหรือถูกนำออก" to={ROUTES.workspaceBorrowOrders(wsId)} />
            <StatCard label="ต้องติดตาม" value={summary?.reminderCount ?? '-'} description="การแจ้งเตือนและงานที่รอดำเนินการ" to={ROUTES.workspaceNotifications(wsId)} />
          </div>

          {dashboardQuery.isError ? <ErrorState message="โหลดสรุปสถานะคลังไม่สำเร็จ" onRetry={() => dashboardQuery.refetch()} /> : null}

          {dashboardQuery.isSuccess ? (
            <Card className="border-amber-200 bg-amber-50/45">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-base">คำแนะนำที่ควรดำเนินการ</CardTitle>
                  <CardDescription>รายการที่มีความสำคัญต่อการดูแลคลังในขณะนี้</CardDescription>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'สต็อกต่ำ', value: dashboardQuery.data.lowStock, to: ROUTES.workspaceStock(wsId) },
                    { label: 'ของหมด', value: dashboardQuery.data.outOfStock, to: ROUTES.workspaceStock(wsId) },
                    { label: 'ยืมเกินกำหนด', value: dashboardQuery.data.overdueReturn, to: ROUTES.workspaceBorrowOrders(wsId) },
                    { label: 'รออนุมัติ/จอง', value: dashboardQuery.data.reservationWaiting, to: ROUTES.workspaceBorrowOrders(wsId) },
                  ].map((item) => (
                    <Link key={item.label} to={item.to} className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-background/70 p-3 transition-colors hover:bg-background">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-lg font-semibold">{item.value}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {(products.length === 0 || containers.length === 0) && (can('product.view') || can('container.view')) ? (
            <Card className="border-amber-200 bg-amber-50/45">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-base">ตั้งค่าพื้นที่ทำงานให้พร้อม</CardTitle>
                  <CardDescription>ทำสองขั้นตอนนี้ก่อน แล้วการเพิ่มของเข้าคลังจะทำได้รวดเร็วขึ้น</CardDescription>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {products.length === 0 && can('product.view') ? <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-background/70 p-3 text-sm">
                    <span><strong className="block">สร้างสินค้า</strong><span className="text-xs text-muted-foreground">เช่น สบู่ หรือไมโครเวฟ</span></span>
                    <Button asChild size="sm" variant="outline"><Link to={ROUTES.workspaceMasterData(wsId)}>ไปที่ Master Data</Link></Button>
                  </div> : null}
                  {containers.length === 0 && can('container.view') ? <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-background/70 p-3 text-sm">
                    <span><strong className="block">สร้างจุดจัดเก็บ</strong><span className="text-xs text-muted-foreground">เช่น ตู้เย็น หรือชั้นห้องน้ำ</span></span>
                    <Button asChild size="sm" variant="outline"><Link to={ROUTES.workspaceContainers(wsId)}>ไปที่จุดจัดเก็บ</Link></Button>
                  </div> : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
            <Card>
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-base">
                    {containers.length === 0 || members.length === 0
                      ? t('dashboard.getStartedTitle', 'Get started')
                      : t('dashboard.shortcutsTitle', 'Quick actions')}
                  </CardTitle>
                  <CardDescription>
                    {containers.length === 0 || members.length === 0
                      ? t('dashboard.getStartedDescription', 'Create your first product, add the first container, or invite the first member to get this workspace ready.')
                      : t('dashboard.shortcutsDescription', 'Jump to the areas you use most often.')}
                  </CardDescription>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Button asChild variant="outline" className="justify-start">
                    <Link to={ROUTES.workspaceSearch(wsId)}>
                      <SearchIcon className="h-4 w-4" />
                      {t('nav.inventory', 'ของทั้งหมด')}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-start">
                    <Link to={ROUTES.workspaceMasterData(wsId)}>
                      <ItemIcon className="h-4 w-4" />
                      Master Data
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-start">
                    <Link to={ROUTES.workspaceActivity(wsId)}>
                      <ActivityIcon className="h-4 w-4" />
                      {t('nav.activity')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-base">{t('dashboard.statusTitle', 'Workspace status')}</CardTitle>
                  <CardDescription>{t('dashboard.statusDescription', 'A quick summary of this workspace.')}</CardDescription>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
                    <span className="text-muted-foreground">{t('workspace.card.role')}</span>
                    <span className="font-medium text-foreground">{workspace.myRole}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
                    <span className="flex items-center gap-2 text-muted-foreground"><MemberIcon className="h-4 w-4" />{t('dashboard.members')}</span>
                    <span className="font-medium text-foreground">{members.length}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-muted-foreground"><ItemIcon className="h-4 w-4" />{t('dashboard.containers')}</span>
                    <span className="font-medium text-foreground">{containers.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-teal-100 bg-teal-50/35">
              <CardContent className="component-stack p-5 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-base">เริ่มทำงานจากตรงนี้</CardTitle>
                  <CardDescription>เลือกงานที่ต้องการทำ ระบบจะพาไปยังหน้าที่เหมาะสม</CardDescription>
                </div>
                <div className="grid gap-2">
                  <Button asChild className="justify-start">
                    <Link to={ROUTES.workspaceReceive(wsId)}><PlusIcon className="h-4 w-4" />เพิ่มของเข้าคลัง</Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-start bg-background/70">
                    <Link to={ROUTES.workspaceBorrowOrders(wsId)}><BorrowIcon className="h-4 w-4" />เบิก / ยืม / คืน</Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-start bg-background/70">
                    <Link to={ROUTES.workspaceNotifications(wsId)}><BellIcon className="h-4 w-4" />ดูสิ่งที่ต้องติดตาม</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="component-stack p-5 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-base">สิ่งที่ต้องติดตาม</CardTitle>
                  <CardDescription>รายการที่ต้องจัดการจากการแจ้งเตือนล่าสุด</CardDescription>
                </div>
                {notificationsQuery.isLoading ? <LoadingState label="กำลังโหลดรายการติดตาม..." /> : null}
                {notificationsQuery.isError ? <ErrorState message="โหลดรายการติดตามไม่สำเร็จ" onRetry={() => notificationsQuery.refetch()} /> : null}
                {notificationsQuery.isSuccess && notifications.length === 0 ? <p className="text-sm text-muted-foreground">ยังไม่มีรายการที่ต้องติดตาม</p> : null}
                {notificationsQuery.isSuccess && notifications.length > 0 ? <div className="space-y-2">
                  {notifications.slice(0, 3).map((notification) => <Link key={notification.id} to={ROUTES.workspaceNotifications(wsId)} className="block rounded-xl border border-border/70 p-3 transition-colors hover:bg-muted/60">
                    <p className="truncate text-sm font-medium">{notification.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
                  </Link>)}
                  <Button asChild variant="outline" size="sm"><Link to={ROUTES.workspaceNotifications(wsId)}>ดูทั้งหมด</Link></Button>
                </div> : null}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
