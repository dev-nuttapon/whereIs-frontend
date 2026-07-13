import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { Layout } from 'antd';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { workspaceStore } from '@/stores/workspace.store';
import { findWorkspace } from '@/mocks/demo-db';
import { ROUTES } from '@/constants/routes';

export function AppLayout() {
  const { wsId } = useParams();
  const setWorkspace = workspaceStore((state) => state.setWorkspace);
  const workspace = useMemo(() => (wsId ? findWorkspace(wsId) : undefined), [wsId]);

  useEffect(() => {
    if (!workspace) {
      return;
    }
    setWorkspace(workspace);
  }, [setWorkspace, workspace]);

  if (!wsId || !workspace) {
    return <Navigate to={ROUTES.workspaces} replace />;
  }

  return (
    <Layout className="min-h-screen bg-background">
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <Layout className="min-w-0 flex-1 bg-transparent">
          <Topbar />
          <Layout.Content className="flex-1 px-3 py-5 sm:px-4 lg:px-6 lg:py-6">
            <div className="mx-auto w-full max-w-screen-xl space-y-4">
              <Breadcrumbs />
              <Outlet />
            </div>
          </Layout.Content>
        </Layout>
      </div>
    </Layout>
  );
}
