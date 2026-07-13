import { useQuery } from '@tanstack/react-query';
import { listDemoUsers } from '@/api/auth.api';

export function useDemoUsers() {
  return useQuery({
    queryKey: ['auth', 'demo-users'] as const,
    queryFn: () => listDemoUsers(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}
