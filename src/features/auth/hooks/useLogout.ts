import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '@/api/auth.api';
import { authStore } from '@/stores/auth.store';
import { workspaceStore } from '@/stores/workspace.store';

export function useLogout() {
  const queryClient = useQueryClient();
  const clearAuth = authStore((state) => state.logout);

  return useMutation({
    mutationFn: () => logout(),
    onSettled: async () => {
      clearAuth();
      workspaceStore.getState().clear();
      await queryClient.clear();
    },
  });
}

