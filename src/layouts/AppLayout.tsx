import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from 'antd';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { workspaceStore } from '@/stores/workspace.store';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useWorkspace } from '@/features/workspaces/hooks/useWorkspace';
import { ROUTES } from '@/constants/routes';

export function AppLayout() {
  const { wsId } = useParams();
  const setWorkspace = workspaceStore((state) => state.setWorkspace);
  const workspaceQuery = useWorkspace(wsId ?? '');
  const workspace = workspaceQuery.data;

  useEffect(() => {
    if (!workspace) {
      return;
    }
    setWorkspace(workspace);
  }, [setWorkspace, workspace]);

  if (!wsId) {
    return <Navigate to={ROUTES.workspaces} replace />;
  }

  if (workspaceQuery.isLoading) {
    return <LoadingState />;
  }

  if (!workspace) {
    return <Navigate to={ROUTES.workspaces} replace />;
  }

  return (
    <Layout className="min-h-screen bg-background">
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <Layout className="min-w-0 flex-1 bg-transparent">
          <Topbar />
          <Layout.Content className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-screen-xl space-y-6">
              <Breadcrumbs />
              <Outlet />
            </div>
          </Layout.Content>
        </Layout>
      </div>
    </Layout>
  );
}
