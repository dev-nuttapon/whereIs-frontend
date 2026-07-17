import type { QueryClient } from '@tanstack/react-query';
import { getWorkspace } from '@/api/workspace.api';
import { queryKeys } from '@/lib/queryKeys';
import { workspaceStore } from '@/stores/workspace.store';

export async function refreshWorkspaceContext(queryClient: QueryClient, wsId: string) {
  const workspace = await queryClient.fetchQuery({
    queryKey: queryKeys.workspace(wsId),
    queryFn: () => getWorkspace(wsId),
    staleTime: 0,
    retry: false,
  });

  if (workspace) {
    workspaceStore.getState().setWorkspace(workspace);
  }

  return workspace;
}
