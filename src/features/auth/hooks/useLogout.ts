import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/api/auth.api';
import { authStore } from '@/stores/auth.store';
import { workspaceStore } from '@/stores/workspace.store';
import { ROUTES } from '@/constants/routes';

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearAuth = authStore((state) => state.logout);
  const idToken = authStore((state) => state.idToken);

  return useMutation({
    mutationFn: () => logout(idToken),
    onSuccess: async (result) => {
      clearAuth();
      workspaceStore.getState().clear();
      await queryClient.clear();
      if (result.redirectUrl) {
        window.location.assign(result.redirectUrl);
        return;
      }

      navigate(ROUTES.login, { replace: true });
    },
  });
}
