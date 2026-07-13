import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { register } from '@/api/auth.api';
import { queryKeys } from '@/lib/queryKeys';
import { authStore } from '@/stores/auth.store';
import { ROUTES } from '@/constants/routes';
import type { RegisterInput } from '@/api/auth.api';

export function useRegister() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setAuth = authStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: async (session) => {
      setAuth(session);
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
      navigate(ROUTES.workspaces);
    },
  });
}
