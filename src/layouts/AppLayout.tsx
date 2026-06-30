import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
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
    <div className="min-h-screen bg-background">
      <div className="min-h-screen lg:flex">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-3 py-6 sm:px-4 lg:px-6 lg:py-6">
            <div className="mx-auto w-full max-w-screen-xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
