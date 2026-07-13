import { useQuery } from '@tanstack/react-query';
import { listDemoUsers } from '@/api/auth.api';
import { isDemoModeEnabled } from '@/lib/demo-session';

export function useDemoUsers() {
  return useQuery({
    queryKey: ['auth', 'demo-users'] as const,
    queryFn: () => listDemoUsers(),
    enabled: isDemoModeEnabled(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}
