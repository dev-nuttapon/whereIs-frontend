import { useEffect, useState } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@/constants/routes';
import { LoadingState } from '@/components/feedback/LoadingState';
import { refreshWorkspaceContext } from '@/features/workspaces/utils/refreshWorkspaceContext';

export function WorkspaceRoute() {
  const { wsId } = useParams();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'checking' | 'ready' | 'redirect'>('checking');

  useEffect(() => {
    let isActive = true;

    if (!wsId) {
      setStatus('redirect');
      return undefined;
    }

    setStatus('checking');

    void refreshWorkspaceContext(queryClient, wsId)
      .then((workspace) => {
        if (!isActive) {
          return;
        }
        if (!workspace) {
          setStatus('redirect');
          return;
        }
        setStatus('ready');
      })
      .catch(() => {
        if (isActive) {
          setStatus('redirect');
        }
      });

    return () => {
      isActive = false;
    };
  }, [queryClient, wsId]);

  if (!wsId || status === 'redirect') {
    return <Navigate to={ROUTES.workspaces} replace />;
  }

  if (status === 'checking') {
    return <LoadingState />;
  }

  return <Outlet />;
}
