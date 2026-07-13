export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  workspaces: ['workspaces'] as const,
  workspace: (wsId: string) => ['workspace', wsId] as const,
  dashboard: (wsId: string) => ['ws', wsId, 'dashboard'] as const,
  activity: (wsId: string) => ['ws', wsId, 'activity'] as const,
  reports: (wsId: string) => ['ws', wsId, 'reports'] as const,
  notifications: (wsId: string) => ['ws', wsId, 'notifications'] as const,
  containers: {
    all: (wsId: string) => ['ws', wsId, 'containers'] as const,
    tree: (wsId: string) => ['ws', wsId, 'containers', 'tree'] as const,
    detail: (wsId: string, id: string) => ['ws', wsId, 'containers', 'detail', id] as const,
    children: (wsId: string, id: string) => ['ws', wsId, 'containers', 'children', id] as const,
    items: (wsId: string, id: string) => ['ws', wsId, 'containers', 'items', id] as const,
  },
  items: {
    all: (wsId: string) => ['ws', wsId, 'items'] as const,
    list: (
      wsId: string,
      params: Record<string, string | number | undefined>,
    ) => ['ws', wsId, 'items', 'list', params] as const,
    detail: (wsId: string, id: string) => ['ws', wsId, 'items', 'detail', id] as const,
    events: (wsId: string, id: string) => ['ws', wsId, 'items', 'detail', id, 'events'] as const,
  },
  members: {
    all: (wsId: string) => ['ws', wsId, 'members'] as const,
    detail: (wsId: string, id: string) => ['ws', wsId, 'members', id] as const,
    permissions: (wsId: string, id: string) => ['ws', wsId, 'members', id, 'permissions'] as const,
  },
  invitations: {
    all: (wsId: string) => ['ws', wsId, 'invitations'] as const,
    detail: (token: string) => ['invitations', token] as const,
  },
} as const;
