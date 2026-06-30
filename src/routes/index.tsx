import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AuthLayout } from '@/layouts/AuthLayout';
import { WorkspaceSelectLayout } from '@/layouts/WorkspaceSelectLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from '@/routes/protected-route';
import { WorkspaceRoute } from '@/routes/workspace-route';
import { PermissionRoute } from '@/routes/permission-route';
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
const SitesPage = lazy(() => import('@/features/sites/pages/SitesPage').then((module) => ({ default: module.SitesPage })));
const SiteDetailPage = lazy(() => import('@/features/sites/pages/SiteDetailPage').then((module) => ({ default: module.SiteDetailPage })));
const LocationExplorerPage = lazy(() => import('@/features/sites/pages/LocationExplorerPage').then((module) => ({ default: module.LocationExplorerPage })));
const LocationsPage = lazy(() => import('@/features/locations/pages/LocationsPage').then((module) => ({ default: module.LocationsPage })));
const ContainersPage = lazy(() => import('@/features/containers/pages/ContainersPage').then((module) => ({ default: module.ContainersPage })));
const MembersPage = lazy(() => import('@/features/members/pages/MembersPage').then((module) => ({ default: module.MembersPage })));
const MemberDetailPage = lazy(() => import('@/features/members/pages/MemberDetailPage').then((module) => ({ default: module.MemberDetailPage })));
const ActivityPage = lazy(() => import('@/features/activity/pages/ActivityPage').then((module) => ({ default: module.ActivityPage })));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const ContainerDetailPage = lazy(() => import('@/features/containers/pages/ContainerDetailPage').then((module) => ({ default: module.ContainerDetailPage })));
const ItemDetailPage = lazy(() => import('@/features/items/pages/ItemDetailPage').then((module) => ({ default: module.ItemDetailPage })));
const NotFoundPage = lazy(() => import('@/features/not-found/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));

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
          <Route path="/w/:wsId" element={<WorkspaceRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route element={<PermissionRoute permission="item.view" />}>
                <Route path="search" element={<SearchPage />} />
                <Route path="items" element={<ItemsPage />} />
                <Route path="items/:itemId" element={<ItemDetailPage />} />
              </Route>
              <Route element={<PermissionRoute permission="container.view" />}>
                <Route path="containers" element={<ContainersPage />} />
                <Route path="containers/:containerId" element={<ContainerDetailPage />} />
              </Route>
              <Route element={<PermissionRoute permission="location.view" />}>
                <Route path="locations" element={<LocationsPage />} />
              </Route>
              <Route element={<PermissionRoute permission="site.view" />}>
                <Route path="sites" element={<SitesPage />} />
                <Route path="sites/:siteId" element={<SiteDetailPage />} />
                <Route path="sites/:siteId/explorer" element={<LocationExplorerPage />} />
              </Route>
              <Route element={<PermissionRoute permission="member.view" />}>
                <Route path="members" element={<MembersPage />} />
                <Route path="members/:memberId" element={<MemberDetailPage />} />
              </Route>
              <Route element={<PermissionRoute permission="activity.view" />}>
                <Route path="activity" element={<ActivityPage />} />
              </Route>
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
