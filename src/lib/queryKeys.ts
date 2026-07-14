export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  lookups: {
    all: ['lookups'] as const,
  },
  permissions: {
    all: ['permissions'] as const,
  },
  workspaces: ['workspaces'] as const,
  workspace: (wsId: string) => ['workspace', wsId] as const,
  sites: (wsId: string) => ['ws', wsId, 'sites'] as const,
  products: (wsId: string) => ['ws', wsId, 'products'] as const,
  categories: (wsId: string) => ['ws', wsId, 'categories'] as const,
  settings: (wsId: string) => ['ws', wsId, 'settings'] as const,
  roles: (wsId: string) => ['ws', wsId, 'roles'] as const,
  stock: {
    all: (wsId: string) => ['ws', wsId, 'stock'] as const,
    list: (
      wsId: string,
      params: Record<string, string | number | undefined>,
    ) => ['ws', wsId, 'stock', 'list', params] as const,
  },
  locations: {
    all: (wsId: string) => ['ws', wsId, 'locations'] as const,
    bySite: (wsId: string, siteId: string) => ['ws', wsId, 'locations', siteId] as const,
    detail: (wsId: string, id: string) => ['ws', wsId, 'locations', 'detail', id] as const,
    tree: (wsId: string, siteId: string) => ['ws', wsId, 'locations', 'tree', siteId] as const,
  },
  borrowOrders: {
    all: (wsId: string) => ['ws', wsId, 'borrow-orders'] as const,
    detail: (wsId: string, id: string) => ['ws', wsId, 'borrow-orders', 'detail', id] as const,
  },
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
  assets: {
    all: (wsId: string) => ['ws', wsId, 'assets'] as const,
    list: (
      wsId: string,
      params: Record<string, string | number | undefined>,
    ) => ['ws', wsId, 'assets', 'list', params] as const,
    detail: (wsId: string, id: string) => ['ws', wsId, 'assets', 'detail', id] as const,
  },
  members: {
    all: (wsId: string) => ['ws', wsId, 'members'] as const,
    detail: (wsId: string, id: string) => ['ws', wsId, 'members', id] as const,
    permissions: (wsId: string, id: string) => ['ws', wsId, 'members', id, 'permissions'] as const,
  },
  invitations: {
    all: (wsId: string) => ['ws', wsId, 'invitations'] as const,
    detail: (token: string) => ['invitations', token] as const,
    inbox: () => ['invitations', 'inbox'] as const,
  },
} as const;
