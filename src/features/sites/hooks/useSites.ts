import { useQuery } from '@tanstack/react-query';
import { listSites } from '@/api/site.api';
import { queryKeys } from '@/lib/queryKeys';

export function useSites(wsId: string) {
  return useQuery({
    queryKey: queryKeys.sites(wsId),
    queryFn: () => listSites(wsId),
    enabled: Boolean(wsId),
  });
}
