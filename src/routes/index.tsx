import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AuthLayout } from '@/layouts/AuthLayout';
import { WorkspaceSelectLayout } from '@/layouts/WorkspaceSelectLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from '@/routes/protected-route';
import { WorkspaceRoute } from '@/routes/workspace-route';
import { authStore } from '@/stores/auth.store';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useI18n } from '@/hooks/useI18n';
import { PermissionGuard } from '@/components/common/PermissionGuard';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const WorkspaceListPage = lazy(() => import('@/features/workspaces/pages/WorkspaceListPage').then((module) => ({ default: module.WorkspaceListPage })));
const WorkspaceNewPage = lazy(() => import('@/features/workspaces/pages/WorkspaceNewPage').then((module) => ({ default: module.WorkspaceNewPage })));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const ReceiveInventoryPage = lazy(() => import('@/features/receiving/pages/ReceiveInventoryPage').then((module) => ({ default: module.ReceiveInventoryPage })));
const SearchPage = lazy(() => import('@/features/search/pages/SearchPage').then((module) => ({ default: module.SearchPage })));
const ProductsPage = lazy(() => import('@/features/products/pages/ProductsPage').then((module) => ({ default: module.ProductsPage })));
const ProductDetailPage = lazy(() => import('@/features/products/pages/ProductDetailPage').then((module) => ({ default: module.ProductDetailPage })));
const AssetsPage = lazy(() => import('@/features/assets/pages/AssetsPage').then((module) => ({ default: module.AssetsPage })));
const AssetDetailPage = lazy(() => import('@/features/assets/pages/AssetDetailPage').then((module) => ({ default: module.AssetDetailPage })));
const StockPage = lazy(() => import('@/features/stock/pages/StockPage').then((module) => ({ default: module.StockPage })));
const StockDetailPage = lazy(() => import('@/features/stock/pages/StockDetailPage').then((module) => ({ default: module.StockDetailPage })));
const ContainersPage = lazy(() => import('@/features/containers/pages/ContainersPage').then((module) => ({ default: module.ContainersPage })));
const ActivityPage = lazy(() => import('@/features/activity/pages/ActivityPage').then((module) => ({ default: module.ActivityPage })));
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage').then((module) => ({ default: module.ReportsPage })));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage').then((module) => ({ default: module.NotificationsPage })));
const BorrowOrdersPage = lazy(() => import('@/features/borrow-orders/pages/BorrowOrdersPage').then((module) => ({ default: module.BorrowOrdersPage })));
const BorrowOrderDetailPage = lazy(() => import('@/features/borrow-orders/pages/BorrowOrderDetailPage').then((module) => ({ default: module.BorrowOrderDetailPage })));
const MasterDataPage = lazy(() => import('@/features/master-data/pages/MasterDataPage').then((module) => ({ default: module.MasterDataPage })));
const MembersPage = lazy(() => import('@/features/members/pages/MembersPage').then((module) => ({ default: module.MembersPage })));
const MemberDetailPage = lazy(() => import('@/features/members/pages/MemberDetailPage').then((module) => ({ default: module.MemberDetailPage })));
const InvitationAcceptPage = lazy(() => import('@/features/members/pages/InvitationAcceptPage').then((module) => ({ default: module.InvitationAcceptPage })));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const ContainerDetailPage = lazy(() => import('@/features/containers/pages/ContainerDetailPage').then((module) => ({ default: module.ContainerDetailPage })));
const NotFoundPage = lazy(() => import('@/features/not-found/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const InvitationInboxPage = lazy(() => import('@/features/members/pages/InvitationInboxPage').then((module) => ({ default: module.InvitationInboxPage })));

function LegacyItemsRedirect() {
  const { wsId = '', itemId } = useParams();
  const destination = itemId
    ? ROUTES.workspaceProductDetail(wsId, itemId)
    : ROUTES.workspaceProducts(wsId);

  return <Navigate to={destination} replace />;
}

export function AppRoutes() {
  const { t } = useI18n();

  return (
    <Suspense fallback={<LoadingState label={t('common.loading')} />}>
      <Routes>
        <Route
          path={ROUTES.home}
          element={<Navigate to={authStore.getState().isAuthenticated ? ROUTES.workspaces : ROUTES.login} replace />}
        />
        <Route
          path={ROUTES.login}
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path={ROUTES.register}
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route
            path={ROUTES.workspaces}
            element={
              <WorkspaceSelectLayout>
                <WorkspaceListPage />
              </WorkspaceSelectLayout>
            }
          />
          <Route
            path={ROUTES.workspaceNew}
            element={
              <WorkspaceSelectLayout>
                <WorkspaceNewPage />
              </WorkspaceSelectLayout>
            }
          />
          <Route
            path={ROUTES.invitationsInbox}
            element={
              <WorkspaceSelectLayout>
                <InvitationInboxPage />
              </WorkspaceSelectLayout>
            }
          />
          <Route path={ROUTES.notifications} element={<AppLayout />}>
            <Route index element={<NotificationsPage global />} />
          </Route>
          <Route
            path="/invitations/:token"
            element={
              <WorkspaceSelectLayout>
                <InvitationAcceptPage />
              </WorkspaceSelectLayout>
            }
          />
          <Route path="/w/:wsId" element={<WorkspaceRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="receive" element={<PermissionGuard perm={['stock.manage', 'asset.manage']} mode="any"><ReceiveInventoryPage /></PermissionGuard>} />
              <Route path="search" element={<SearchPage />} />
              <Route path="products" element={<PermissionGuard perm="product.view"><ProductsPage /></PermissionGuard>} />
              <Route path="products/:productId" element={<PermissionGuard perm="product.view"><ProductDetailPage /></PermissionGuard>} />
              <Route path="items" element={<LegacyItemsRedirect />} />
              <Route path="items/:itemId" element={<LegacyItemsRedirect />} />
              <Route path="assets" element={<PermissionGuard perm="asset.view"><AssetsPage /></PermissionGuard>} />
              <Route path="assets/:assetId" element={<PermissionGuard perm="asset.view"><AssetDetailPage /></PermissionGuard>} />
              <Route path="stock" element={<PermissionGuard perm="stock.view"><StockPage /></PermissionGuard>} />
              <Route path="stock/:stockEntryId" element={<PermissionGuard perm="stock.view"><StockDetailPage /></PermissionGuard>} />
              <Route path="containers" element={<PermissionGuard perm="container.view"><ContainersPage /></PermissionGuard>} />
              <Route path="activity" element={<PermissionGuard perm="activity.view"><ActivityPage /></PermissionGuard>} />
              <Route path="reports" element={<PermissionGuard perm="report.view"><ReportsPage /></PermissionGuard>} />
              <Route path="notifications" element={<PermissionGuard perm="notification.view"><NotificationsPage /></PermissionGuard>} />
              <Route path="borrow-orders" element={<PermissionGuard perm="borrow.view"><BorrowOrdersPage /></PermissionGuard>} />
              <Route path="borrow-orders/:orderId" element={<PermissionGuard perm="borrow.view"><BorrowOrderDetailPage /></PermissionGuard>} />
              <Route path="master-data" element={<PermissionGuard perm={['product.view', 'category.manage']} mode="any"><MasterDataPage /></PermissionGuard>} />
              <Route path="containers/:containerId" element={<PermissionGuard perm="container.view"><ContainerDetailPage /></PermissionGuard>} />
              <Route path="members" element={<PermissionGuard perm="member.view"><MembersPage /></PermissionGuard>} />
              <Route path="members/:memberId" element={<PermissionGuard perm="member.view"><MemberDetailPage /></PermissionGuard>} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>
          <Route
            path={ROUTES.settings}
            element={
              <WorkspaceSelectLayout>
                <SettingsPage />
              </WorkspaceSelectLayout>
            }
          />
        </Route>
        <Route path={ROUTES.notFound} element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
