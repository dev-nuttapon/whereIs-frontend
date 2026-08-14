import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/api/dashboard.api';
import { queryKeys } from '@/lib/queryKeys';

export function useDashboardSummary(wsId: string) {
  return useQuery({
    queryKey: queryKeys.dashboard(wsId),
    queryFn: () => getDashboardSummary(wsId),
    enabled: Boolean(wsId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
