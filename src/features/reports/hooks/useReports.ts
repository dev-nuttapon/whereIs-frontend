import { useQuery } from '@tanstack/react-query';
import { getReports } from '@/api/report.api';
import { queryKeys } from '@/lib/queryKeys';

export function useReports(wsId: string) {
  return useQuery({
    queryKey: queryKeys.reports(wsId),
    queryFn: () => getReports(wsId),
    enabled: Boolean(wsId),
  });
}
