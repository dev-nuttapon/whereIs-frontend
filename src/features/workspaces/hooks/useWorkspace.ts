import { useQuery } from '@tanstack/react-query';
import { getWorkspace } from '@/api/workspace.api';
import { queryKeys } from '@/lib/queryKeys';

export function useWorkspace(wsId: string) {
  return useQuery({
    queryKey: queryKeys.workspace(wsId),
    queryFn: () => getWorkspace(wsId),
    enabled: Boolean(wsId),
    staleTime: 60_000,
  });
}

