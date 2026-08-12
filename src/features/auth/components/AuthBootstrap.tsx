import { useEffect } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { authStore } from '@/stores/auth.store';
import { workspaceStore } from '@/stores/workspace.store';
import { queryClient } from '@/lib/queryClient';
import { getCurrentUser, refreshAuthSession } from '@/api/auth.api';

export function AuthBootstrap() {
  const query = useCurrentUser();
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const setAuth = authStore((state) => state.setAuth);
  const updateUser = authStore((state) => state.updateUser);
  const markUnauthenticated = authStore((state) => state.markUnauthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    let active = true;
    void refreshAuthSession()
      .then(async (session) => {
        const user = await getCurrentUser();
        if (!active) {
          return;
        }
        setAuth({ ...session, user });
      })
      .catch(() => {
        if (!active) {
          return;
        }
        markUnauthenticated();
        workspaceStore.getState().clear();
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, markUnauthenticated, setAuth]);

  useEffect(() => {
    if (query.data) {
      updateUser(query.data);
    }
  }, [query.data, updateUser]);

  useEffect(() => {
    if (!query.isError) {
      return;
    }

    markUnauthenticated();
    workspaceStore.getState().clear();
    queryClient.removeQueries({ queryKey: ['auth'] });
  }, [markUnauthenticated, query.isError]);

  return null;
}
