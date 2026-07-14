import { useQuery } from '@tanstack/react-query';
import { listActivity, type ActivityParams } from '@/api/activity.api';
import { queryKeys } from '@/lib/queryKeys';

export function useActivity(wsId: string, params: ActivityParams = {}) {
  return useQuery({
    queryKey: queryKeys.activity(wsId),
    queryFn: () => listActivity(wsId, params),
    enabled: Boolean(wsId),
  });
}
