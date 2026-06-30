import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from '@/api/auth.api';
import { queryKeys } from '@/lib/queryKeys';
import { authStore } from '@/stores/auth.store';
import { ROUTES } from '@/constants/routes';
import type { LoginInput } from '@/api/auth.api';

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setAuth = authStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: async (session) => {
      setAuth(session.token, session.user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
      navigate(ROUTES.workspaces);
    },
  });
}
