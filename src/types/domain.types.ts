export type Role = 'owner' | 'admin' | 'member' | 'viewer';

export type ItemStatus = 'stored' | 'taken_out' | 'reserved' | 'missing' | 'repair' | 'disposed';

export type ItemKind = 'single' | 'stock';

export type ItemUsageType = 'consumable' | 'returnable';

export type ItemReturnPolicy = 'due' | 'indefinite';

export type ItemEventType =
  | 'created'
  | 'updated'
  | 'moved'
  | 'borrow_requested'
  | 'borrow_approved'
  | 'borrowed'
  | 'returned'
  | 'withdrawn'
  | 'reserved'
  | 'reservation_released'
  | 'marked_repairing'
  | 'repaired'
  | 'stock_used'
  | 'stock_restocked'
  | 'stock_counted'
  | 'stock_adjusted'
  | 'received'
  | 'marked_missing'
  | 'marked_found'
  | 'disposed';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface ContainerAccessScope {
  containerIds: string[];
  includeDescendants: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
  type?: string;
  ownerUserId?: string;
  isActive?: boolean;
  description?: string;
  myRole: Role;
  permissions: string[];
  containerAccessScope?: ContainerAccessScope | null;
  createdAt: string;
  updatedAt: string;
}

export interface Site {
  id: string;
  workspaceId: string;
  name: string;
  type?: string;
  address?: string;
  description?: string;
  isActive: boolean;
  locationCount: number;
  createdAt: string;
}

export interface Product {
  id: string;
  workspaceId: string;
  categoryId?: string | null;
  categoryName?: string | null;
  unitCode?: string | null;
  name: string;
  description?: string | null;
  code?: string | null;
  sku?: string | null;
  trackingType: string;
  minStockAlert?: number | null;
  imageUrl?: string | null;
  isActive: boolean;
  assetCount: number;
  totalStock: number;
  createdAt: string;
}

export interface Category {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  color?: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

export interface Location {
  id: string;
  workspaceId: string;
  siteId: string;
  parentLocationId?: string | null;
  name: string;
  type?: string;
  code?: string | null;
  sortOrder: number;
  description?: string | null;
  childCount: number;
  createdAt: string;
}

export interface Container {
  id: string;
  workspaceId: string;
  locationId?: string | null;
  parentId: string | null;
  name: string;
  typeLabel: string;
  note?: string;
  code?: string | null;
  qrCode?: string | null;
  photoUrl?: string;
  itemCount?: number;
  childContainerCount?: number;
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
  baseUnit?: string;
  unit?: string;
  alternativeUnits?: Array<{ label: string; quantity: number }>;
  reorderPoint?: number;
  lotCode?: string;
  receivedDate?: string | null;
  expiryDate?: string | null;
  warrantyEndDate?: string | null;
  maintenanceNextDueDate?: string | null;
  dueDate?: string | null;
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

export interface Asset {
  id: string;
  workspaceId: string;
  productId: string;
  productName: string;
  locationId?: string | null;
  locationName?: string | null;
  containerId?: string | null;
  containerName?: string | null;
  serialNumber?: string | null;
  barcode?: string | null;
  status: string;
  condition: string;
  notes?: string | null;
  acquiredDate?: string | null;
  currentHolderUserId?: string | null;
  photoUrls?: string[];
  createdAt: string;
}

export interface Member {
  id: string;
  workspaceId: string;
  user: User;
  role: Role;
  permissions: string[];
  permissionOverrides?: Record<string, boolean>;
  containerAccessScope?: ContainerAccessScope | null;
  invitationStatus?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired' | 'revoked';
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

export interface Notification {
  id: string;
  workspaceId: string;
  type: string;
  title: string;
  message: string;
  itemId?: string;
  memberId?: string;
  readAt?: string | null;
  dueAt?: string | null;
  createdAt: string;
}

export interface ReportSummary {
  key: string;
  label: string;
  value: number;
  unit?: string;
  trend?: string;
}
