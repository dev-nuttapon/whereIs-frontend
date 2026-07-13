import { useQuery } from '@tanstack/react-query';
import { getLocation, getLocationTree, listLocations } from '@/api/location.api';
import { queryKeys } from '@/lib/queryKeys';

export function useLocations(wsId: string, siteId: string) {
  return useQuery({
    queryKey: queryKeys.locations.bySite(wsId, siteId),
    queryFn: () => listLocations(wsId, siteId),
    enabled: Boolean(wsId && siteId),
  });
}

export function useLocation(wsId: string, locationId: string) {
  return useQuery({
    queryKey: queryKeys.locations.detail(wsId, locationId),
    queryFn: () => getLocation(wsId, locationId),
    enabled: Boolean(wsId && locationId),
  });
}

export function useLocationTree(wsId: string, siteId: string) {
  return useQuery({
    queryKey: queryKeys.locations.tree(wsId, siteId),
    queryFn: () => getLocationTree(wsId, siteId),
    enabled: Boolean(wsId && siteId),
  });
}
