import { useQuery } from '@tanstack/react-query';
import { getContainer, listContainers } from '@/api/container.api';
import { queryKeys } from '@/lib/queryKeys';

export function useContainers(wsId: string) {
  return useQuery({
    queryKey: queryKeys.containers.all(wsId),
    queryFn: () => listContainers(wsId),
    enabled: Boolean(wsId),
  });
}

export function useContainer(wsId: string, containerId: string) {
  return useQuery({
    queryKey: queryKeys.containers.detail(wsId, containerId),
    queryFn: () => getContainer(wsId, containerId),
    enabled: Boolean(wsId && containerId),
  });
}
