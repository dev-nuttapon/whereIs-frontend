import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/api/auth.api';
import { queryKeys } from '@/lib/queryKeys';
import { authStore } from '@/stores/auth.store';

export function useCurrentUser() {
  const isAuthenticated = authStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

