export type Role = 'owner' | 'admin' | 'member' | 'viewer';

export type ItemStatus = 'stored' | 'taken_out' | 'missing' | 'disposed';

export type ItemKind = 'single' | 'bulk';

export type ItemUsageType = 'consumable' | 'returnable';

export type ItemReturnPolicy = 'due' | 'indefinite';

export type ItemEventType =
  | 'created'
  | 'updated'
  | 'moved'
  | 'taken_out'
  | 'returned'
  | 'stock_used'
  | 'stock_restocked'
  | 'marked_missing'
  | 'marked_found'
  | 'disposed';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  myRole: Role;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface Container {
  id: string;
  workspaceId: string;
  code: string;
  name?: string;
  photoUrl?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  workspaceId: string;
  name: string;
  kind: ItemKind;
  usageType: ItemUsageType;
  returnPolicy: ItemReturnPolicy;
  quantity?: number;
  reorderPoint?: number;
  code?: string;
  description?: string;
  photoUrl?: string;
  status: ItemStatus;
  containerId: string | null;
  currentHolderId: string | null;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  workspaceId: string;
  user: User;
  role: Role;
  permissions: string[];
  permissionOverrides?: Record<string, boolean>;
  createdAt: string;
}

export interface ItemEvent {
  id: string;
  workspaceId: string;
  itemId: string;
  type: ItemEventType;
  actor: Pick<User, 'id' | 'name'>;
  payload?: Record<string, unknown>;
  createdAt: string;
}
