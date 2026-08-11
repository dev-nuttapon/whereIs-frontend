import { useEffect } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { authStore } from '@/stores/auth.store';
import { workspaceStore } from '@/stores/workspace.store';
import { queryClient } from '@/lib/queryClient';

export function AuthBootstrap() {
  const query = useCurrentUser();
  const updateUser = authStore((state) => state.updateUser);
  const markUnauthenticated = authStore((state) => state.markUnauthenticated);

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
