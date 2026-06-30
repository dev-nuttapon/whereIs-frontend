import { Navigate, Outlet, useParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { hasWorkspace } from '@/mocks/demo-db';

export function WorkspaceRoute() {
  const { wsId } = useParams();

  if (!wsId) {
    return <Navigate to={ROUTES.workspaces} replace />;
  }

  if (!hasWorkspace(wsId)) {
    return <Navigate to={ROUTES.workspaces} replace />;
  }

  return <Outlet />;
}
