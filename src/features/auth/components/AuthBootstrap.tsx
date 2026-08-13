import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { authStore } from '@/stores/auth.store';
import { workspaceStore } from '@/stores/workspace.store';
import { queryClient } from '@/lib/queryClient';
import { getCurrentUser } from '@/api/auth.api';
import { refreshTokenSessionSingleFlight } from '@/api/token.api';

let bootstrapSessionPromise: Promise<Awaited<ReturnType<typeof refreshTokenSessionSingleFlight>> & { user: Awaited<ReturnType<typeof getCurrentUser>> }> | null = null;

function bootstrapSession() {
  bootstrapSessionPromise ??= refreshTokenSessionSingleFlight()
    .then(async (session) => {
      // Install the new access token before loading /users/me. Otherwise the
      // request has no Authorization header and the 401 interceptor refreshes
      // the rotating cookie a second time during the same bootstrap.
      authStore.getState().updateTokens(session);
      return {
        ...session,
        user: await getCurrentUser(),
      };
    })
    .finally(() => {
      bootstrapSessionPromise = null;
    });

  return bootstrapSessionPromise;
}

export function AuthBootstrap() {
  const [hasHydrated, setHasHydrated] = useState(() => authStore.persist.hasHydrated());
  const query = useCurrentUser();
  const isAuthenticated = authStore((state) => state.isAuthenticated);
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
    // The backend keeps the refresh credential in an HttpOnly cookie. Do not
    // send a refresh token in the request body; withCredentials is configured
    // on the auth client so the browser supplies the cookie.
    void bootstrapSession()
      .then((session) => {
        if (!active) {
          return;
        }
        setAuth(session);
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
  }, [hasHydrated, isAuthenticated, markUnauthenticated, setAuth, startBootstrap]);

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
