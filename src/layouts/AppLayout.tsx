import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Drawer, Layout } from 'antd';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { workspaceStore } from '@/stores/workspace.store';
import { uiStore } from '@/stores/ui.store';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useWorkspace } from '@/features/workspaces/hooks/useWorkspace';
import { ROUTES } from '@/constants/routes';

export function AppLayout() {
  const { wsId } = useParams();
  const setWorkspace = workspaceStore((state) => state.setWorkspace);
  const sidebarOpen = uiStore((state) => state.sidebarOpen);
  const setSidebarOpen = uiStore((state) => state.setSidebarOpen);
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
      <div className="flex min-h-screen w-full bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.45)_100%)]">
        <div className="sticky top-0 hidden h-screen w-[280px] shrink-0 border-r border-border/70 bg-card/95 shadow-[18px_0_50px_-42px_rgba(15,23,42,0.55)] lg:block">
          <Sidebar />
        </div>
        <Drawer
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          placement="left"
          width={300}
          styles={{
            body: { padding: 0 },
            header: { display: 'none' },
          }}
          className="lg:hidden"
        >
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </Drawer>
        <Layout className="min-w-0 flex-1 bg-transparent">
          <Topbar />
          <Layout.Content className="flex-1 px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-screen-xl space-y-4 sm:space-y-5 lg:space-y-6">
              <Breadcrumbs />
              <Outlet />
            </div>
          </Layout.Content>
        </Layout>
      </div>
    </Layout>
  );
}
