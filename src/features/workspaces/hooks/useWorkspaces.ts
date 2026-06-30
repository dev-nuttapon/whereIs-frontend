import { useQuery } from '@tanstack/react-query';
import { listWorkspaces } from '@/api/workspace.api';
import { queryKeys } from '@/lib/queryKeys';

export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces,
    queryFn: () => listWorkspaces(),
    staleTime: 60_000,
  });
}

