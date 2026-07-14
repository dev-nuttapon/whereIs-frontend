import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AuthLayout } from '@/layouts/AuthLayout';
import { WorkspaceSelectLayout } from '@/layouts/WorkspaceSelectLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from '@/routes/protected-route';
import { WorkspaceRoute } from '@/routes/workspace-route';
import { authStore } from '@/stores/auth.store';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useI18n } from '@/hooks/useI18n';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const WorkspaceListPage = lazy(() => import('@/features/workspaces/pages/WorkspaceListPage').then((module) => ({ default: module.WorkspaceListPage })));
const WorkspaceNewPage = lazy(() => import('@/features/workspaces/pages/WorkspaceNewPage').then((module) => ({ default: module.WorkspaceNewPage })));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const SearchPage = lazy(() => import('@/features/search/pages/SearchPage').then((module) => ({ default: module.SearchPage })));
const ItemsPage = lazy(() => import('@/features/items/pages/ItemsPage').then((module) => ({ default: module.ItemsPage })));
const ItemDetailPage = lazy(() => import('@/features/items/components/ItemDetailPage').then((module) => ({ default: module.ItemDetailPage })));
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
          <Route
            path="/invitations/:token"
            element={
              <WorkspaceSelectLayout>
                <InvitationAcceptPage />
              </WorkspaceSelectLayout>
            }
          />
          <Route
            path={ROUTES.settings}
            element={
              <WorkspaceSelectLayout>
                <SettingsPage />
              </WorkspaceSelectLayout>
            }
          />
          <Route path="/w/:wsId" element={<WorkspaceRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="items" element={<ItemsPage />} />
              <Route path="items/:itemId" element={<ItemDetailPage />} />
              <Route path="assets" element={<AssetsPage />} />
              <Route path="assets/:assetId" element={<AssetDetailPage />} />
              <Route path="stock" element={<StockPage />} />
              <Route path="stock/:stockEntryId" element={<StockDetailPage />} />
              <Route path="containers" element={<ContainersPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="borrow-orders" element={<BorrowOrdersPage />} />
              <Route path="borrow-orders/:orderId" element={<BorrowOrderDetailPage />} />
              <Route path="master-data" element={<MasterDataPage />} />
              <Route path="containers/:containerId" element={<ContainerDetailPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="members/:memberId" element={<MemberDetailPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>
        <Route path={ROUTES.notFound} element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
