export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  workspaces: ['workspaces'] as const,
  workspace: (wsId: string) => ['workspace', wsId] as const,
  dashboard: (wsId: string) => ['ws', wsId, 'dashboard'] as const,
  activity: (wsId: string) => ['ws', wsId, 'activity'] as const,
  items: {
    all: (wsId: string) => ['ws', wsId, 'items'] as const,
    list: (
      wsId: string,
      params: Record<string, string | number | undefined>,
    ) => ['ws', wsId, 'items', 'list', params] as const,
    detail: (wsId: string, id: string) => ['ws', wsId, 'items', 'detail', id] as const,
  },
} as const;

