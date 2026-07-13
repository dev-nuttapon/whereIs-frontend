import { useQuery } from '@tanstack/react-query';
import { listLocations } from '@/api/location.api';
import { queryKeys } from '@/lib/queryKeys';

export function useLocations(wsId: string, siteId: string) {
  return useQuery({
    queryKey: queryKeys.locations.bySite(wsId, siteId),
    queryFn: () => listLocations(wsId, siteId),
    enabled: Boolean(wsId && siteId),
  });
}
