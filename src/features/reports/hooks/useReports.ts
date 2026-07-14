import { useQuery } from '@tanstack/react-query';
import { listReports, type ReportParams } from '@/api/report.api';
import { queryKeys } from '@/lib/queryKeys';

export function useReports(wsId: string, params: ReportParams = {}) {
  return useQuery({
    queryKey: queryKeys.reports(wsId),
    queryFn: () => listReports(wsId, params),
    enabled: Boolean(wsId),
  });
}
