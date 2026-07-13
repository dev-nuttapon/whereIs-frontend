import { Navigate, Outlet, useParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useWorkspace } from '@/features/workspaces/hooks/useWorkspace';

export function WorkspaceRoute() {
  const { wsId } = useParams();
  const workspaceQuery = useWorkspace(wsId ?? '');

  if (!wsId) {
    return <Navigate to={ROUTES.workspaces} replace />;
  }

  if (workspaceQuery.isLoading) {
    return <LoadingState />;
  }

  if (!workspaceQuery.data) {
    return <Navigate to={ROUTES.workspaces} replace />;
  }

  return <Outlet />;
}
