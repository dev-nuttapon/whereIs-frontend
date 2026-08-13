import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { authStore } from '@/stores/auth.store';
import { workspaceStore } from '@/stores/workspace.store';
import { queryClient } from '@/lib/queryClient';
import { getCurrentUser, refreshAuthSession } from '@/api/auth.api';

export function AuthBootstrap() {
  const [hasHydrated, setHasHydrated] = useState(() => authStore.persist.hasHydrated());
  const query = useCurrentUser();
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const refreshToken = authStore((state) => state.refreshToken);
  const setAuth = authStore((state) => state.setAuth);
  const updateUser = authStore((state) => state.updateUser);
  const startBootstrap = authStore((state) => state.startBootstrap);
  const markUnauthenticated = authStore((state) => state.markUnauthenticated);

  useEffect(() => {
    if (hasHydrated) {
      return;
    }

    return authStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
  }, [hasHydrated]);

  useEffect(() => {
    if (!hasHydrated || isAuthenticated) {
      return;
    }

    let active = true;
    startBootstrap();
    workspaceStore.getState().clear();
    void refreshAuthSession(refreshToken ?? undefined)
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
  }, [hasHydrated, isAuthenticated, markUnauthenticated, refreshToken, setAuth, startBootstrap]);

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
