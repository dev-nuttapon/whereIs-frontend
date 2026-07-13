import type {
  Container,
  ContainerAccessScope,
  Item,
  ItemEvent,
  ItemEventType,
  Member,
  Notification,
  ReportSummary,
  Role,
  Workspace,
} from '@/types/domain.types';
import type { PermissionKey } from '@/types/permission.types';
import {
  MOCK_ACTIVITY as SEED_ACTIVITY,
  MOCK_CONTAINERS as SEED_CONTAINERS,
  MOCK_ITEMS as SEED_ITEMS,
  MOCK_MEMBERS as SEED_MEMBERS,
  MOCK_NOTIFICATIONS as SEED_NOTIFICATIONS,
  MOCK_REPORTS as SEED_REPORTS,
  MOCK_USERS,
  MOCK_WORKSPACES as SEED_WORKSPACES,
  MOCK_USER,
} from '@/mocks/mock-data';
import { getItemStockState } from '@/lib/item-stock';
import type { ApiMeta } from '@/types/api.types';

type MutableRecord<T> = T[];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const ROLE_DEFAULT_PERMISSIONS: Record<Role, PermissionKey[]> = {
  owner: [...new Set(SEED_WORKSPACES[0].permissions)] as PermissionKey[],
  admin: [
    'workspace.view',
    'member.view',
    'member.invite',
    'member.update_role',
    'member.remove',
    'permission.override',
    'container.view',
    'container.create',
    'container.update',
    'container.delete',
    'container.visibility.manage',
    'container.access.manage',
    'item.view',
    'item.create',
    'item.update',
    'item.delete',
    'item.move',
    'item.borrow',
    'item.return',
    'item.withdraw',
    'item.reserve',
    'item.mark_missing',
    'item.mark_found',
    'item.repair',
    'item.dispose',
    'stock.view',
    'stock.consume',
    'stock.restock',
    'stock.count',
    'stock.adjust',
    'report.view',
    'notification.view',
    'notification.manage',
    'activity.view',
  ],
  member: [
    'item.view',
    'item.create',
    'item.update',
    'item.move',
    'item.borrow',
    'item.return',
    'item.withdraw',
    'item.reserve',
    'item.mark_missing',
    'item.mark_found',
    'item.repair',
    'stock.view',
    'stock.consume',
    'stock.restock',
    'activity.view',
    'notification.view',
  ],
  viewer: ['item.view', 'stock.view', 'activity.view', 'notification.view'],
};

let workspaces: MutableRecord<Workspace> = clone(SEED_WORKSPACES);
let containers: MutableRecord<Container> = clone(SEED_CONTAINERS);
let members: MutableRecord<Member> = clone(SEED_MEMBERS);
let items: MutableRecord<Item> = clone(SEED_ITEMS);
let activity: MutableRecord<ItemEvent> = clone(SEED_ACTIVITY);
let notifications: MutableRecord<Notification> = clone(SEED_NOTIFICATIONS);
let reports: MutableRecord<ReportSummary> = clone(SEED_REPORTS);

function now() {
  return new Date().toISOString();
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function createId(prefix: string, value: string) {
  return `${prefix}-${slugify(value) || 'record'}`;
}

function pushEvent(event: Omit<ItemEvent, 'id' | 'createdAt'>) {
  activity = [
    {
      id: `evt-${activity.length + 1}-${event.itemId}`,
      createdAt: now(),
      ...event,
    },
    ...activity,
  ];
}

function updateItemState(
  itemId: string,
  updater: (item: Item) => Item,
  event?: { type: ItemEventType; actor: ItemEvent['actor']; payload?: ItemEvent['payload'] },
) {
  const index = items.findIndex((entry) => entry.id === itemId);
  if (index === -1) {
    throw new Error(`Item not found: ${itemId}`);
  }

  const updated = updater(items[index]);
  items = [updated, ...items.filter((entry, entryIndex) => entryIndex !== index)];

  if (event) {
    pushEvent({
      workspaceId: updated.workspaceId,
      itemId: updated.id,
      type: event.type,
      actor: event.actor,
      payload: event.payload,
    });
  }

  return updated;
}

function getMemberRecord(id: string) {
  return members.find((entry) => entry.id === id) ?? members[0];
}

function getWorkspaceRecord(id: string) {
  return workspaces.find((entry) => entry.id === id) ?? workspaces[0];
}

function getContainerRecord(id: string) {
  return containers.find((entry) => entry.id === id) ?? containers[0];
}

export function buildEffectivePermissions(role: Role, overrides?: Record<string, boolean>) {
  const permissions = new Set<PermissionKey>(ROLE_DEFAULT_PERMISSIONS[role]);
  if (overrides) {
    Object.entries(overrides).forEach(([permission, enabled]) => {
      if (enabled) {
        permissions.add(permission as PermissionKey);
      } else {
        permissions.delete(permission as PermissionKey);
      }
    });
  }
  return Array.from(permissions);
}

export function listWorkspaces() {
  return clone(workspaces);
}

export function findWorkspace(id: string) {
  const workspace = workspaces.find((item) => item.id === id);
  return workspace ? clone(workspace) : undefined;
}

export function hasWorkspace(id: string) {
  return workspaces.some((item) => item.id === id);
}

export function getWorkspace(id: string) {
  return clone(getWorkspaceRecord(id));
}

export function createWorkspace(name: string) {
  const workspace: Workspace = {
    id: createId('ws', name),
    name,
    myRole: 'owner',
    permissions: ROLE_DEFAULT_PERMISSIONS.owner,
    containerAccessScope: { containerIds: ['new-root'], includeDescendants: true },
    createdAt: now(),
    updatedAt: now(),
  };
  workspaces = [workspace, ...workspaces];
  return clone(workspace);
}

export function listContainers(wsId: string) {
  return clone(containers.filter((container) => container.workspaceId === wsId));
}

export function getContainer(id: string) {
  return clone(getContainerRecord(id));
}

export function listMembers(wsId: string) {
  return clone(members.filter((member) => member.workspaceId === wsId));
}

export function getMember(id: string) {
  return clone(getMemberRecord(id));
}

export function inviteMember(wsId: string, email: string, role: Role) {
  const user = MOCK_USERS.find((entry) => entry.email === email) ?? {
    id: createId('user', email),
    email,
    name: email.split('@')[0],
  };
  const member: Member = {
    id: createId('member', email),
    workspaceId: wsId,
    user,
    role,
    permissions: buildEffectivePermissions(role),
    permissionOverrides: {},
    containerAccessScope: { containerIds: [getWorkspaceRecord(wsId).containerAccessScope?.containerIds[0] ?? ''], includeDescendants: true },
    invitationStatus: 'pending',
    createdAt: now(),
  };
  members = [member, ...members];
  return clone(member);
}

export function updateMemberRole(id: string, role: Role) {
  const member = getMemberRecord(id);
  const updated: Member = {
    ...member,
    role,
    permissions: buildEffectivePermissions(role, member.permissionOverrides),
  };
  members = [updated, ...members.filter((entry) => entry.id !== id)];
  return clone(updated);
}

export function removeMember(id: string) {
  members = members.filter((entry) => entry.id !== id);
  return { success: true as const };
}

export function getMemberPermissions(memberId: string) {
  const member = getMemberRecord(memberId);
  return {
    primaryRole: member.role,
    effective: member.permissions,
    overrides: member.permissionOverrides ?? {},
    containerAccessScope: member.containerAccessScope ?? null,
  };
}

export function updateMemberPermissions(memberId: string, overrides: Record<string, boolean>, containerAccessScope?: ContainerAccessScope | null) {
  const member = getMemberRecord(memberId);
  const updated: Member = {
    ...member,
    permissionOverrides: overrides,
    permissions: buildEffectivePermissions(member.role, overrides),
    containerAccessScope: containerAccessScope ?? member.containerAccessScope ?? null,
  };
  members = [updated, ...members.filter((entry) => entry.id !== memberId)];
  return {
    primaryRole: updated.role,
    effective: updated.permissions,
    overrides: updated.permissionOverrides ?? {},
    containerAccessScope: updated.containerAccessScope ?? null,
  };
}

export interface SearchFilter {
  workspaceId?: string;
  q?: string;
  kind?: string;
  usageType?: string;
  status?: string;
  containerId?: string;
  page?: number;
  limit?: number;
}

export function listItems(wsId: string, filter: SearchFilter = {}) {
  const keyword = filter.q?.trim().toLowerCase() ?? '';
  const results = items.filter((item) => {
    if (item.workspaceId !== wsId) {
      return false;
    }
    if (filter.status && item.status !== filter.status) {
      return false;
    }
    if (filter.kind && item.kind !== filter.kind) {
      return false;
    }
    if (filter.usageType && item.usageType !== filter.usageType) {
      return false;
    }
    if (filter.containerId && item.containerId !== filter.containerId) {
      return false;
    }
    if (!keyword) {
      return true;
    }
    const container = item.containerId ? containers.find((entry) => entry.id === item.containerId) : null;
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.code?.toLowerCase().includes(keyword) === true ||
      item.description?.toLowerCase().includes(keyword) === true ||
      item.lotCode?.toLowerCase().includes(keyword) === true ||
      container?.name.toLowerCase().includes(keyword) === true ||
      container?.typeLabel.toLowerCase().includes(keyword) === true
    );
  });

  return {
    data: clone(results),
    meta: {
      page: filter.page ?? 1,
      limit: filter.limit ?? results.length,
      total: results.length,
    },
  } satisfies { data: Item[]; meta: ApiMeta };
}

export function getItem(identifier: string) {
  return clone(items.find((entry) => entry.id === identifier || entry.code === identifier) ?? items[0]);
}

export function listItemEvents(itemId?: string) {
  const filtered = itemId ? activity.filter((event) => event.itemId === itemId) : activity;
  return clone(filtered);
}

export function getDashboardSummary(wsId: string) {
  const workspaceItems = items.filter((item) => item.workspaceId === wsId);
  return {
    totalItems: workspaceItems.length,
    stored: workspaceItems.filter((item) => item.status === 'stored').length,
    borrowed: workspaceItems.filter((item) => item.status === 'taken_out').length,
    reserved: workspaceItems.filter((item) => item.status === 'reserved').length,
    missing: workspaceItems.filter((item) => item.status === 'missing').length,
    repair: workspaceItems.filter((item) => item.status === 'repair').length,
    lowStock: workspaceItems.filter((item) => getItemStockState(item) === 'low_stock').length,
    outOfStock: workspaceItems.filter((item) => getItemStockState(item) === 'out_of_stock').length,
    overdueReturn: workspaceItems.filter((item) => item.status === 'taken_out' && Boolean(item.dueDate)).length,
    reservationWaiting: workspaceItems.filter((item) => item.status === 'reserved').length,
    reminderCount: notifications.filter((notification) => notification.workspaceId === wsId && !notification.readAt).length,
  };
}

export function getRecentActivity(wsId: string) {
  return clone(activity.filter((event) => event.workspaceId === wsId));
}

export function listNotifications(wsId: string) {
  return clone(notifications.filter((notification) => notification.workspaceId === wsId));
}

export function markNotificationRead(id: string) {
  const index = notifications.findIndex((notification) => notification.id === id);
  if (index === -1) {
    throw new Error(`Notification not found: ${id}`);
  }
  notifications = [
    {
      ...notifications[index],
      readAt: now(),
    },
    ...notifications.filter((_, currentIndex) => currentIndex !== index),
  ];
  return clone(notifications[0]);
}

export function markAllNotificationsRead(wsId: string) {
  notifications = notifications.map((notification) =>
    notification.workspaceId === wsId ? { ...notification, readAt: notification.readAt ?? now() } : notification,
  );
  return { success: true as const };
}

export function listReports(wsId: string) {
  const accessibleContainers = containers.filter((container) => container.workspaceId === wsId).length;
  return clone(
    reports.map((report) => {
      if (report.key === 'items') {
        return { ...report, value: items.filter((item) => item.workspaceId === wsId).length };
      }
      if (report.key === 'stock') {
        return { ...report, value: items.filter((item) => item.workspaceId === wsId && item.kind === 'stock').length };
      }
      if (report.key === 'overdue') {
        return { ...report, value: items.filter((item) => item.workspaceId === wsId && item.status === 'taken_out' && Boolean(item.dueDate)).length };
      }
      if (report.key === 'scope') {
        return { ...report, value: accessibleContainers };
      }
      return report;
    }),
  );
}

export function createItem(input: {
  workspaceId: string;
  kind: 'single' | 'stock';
  usageType: 'consumable' | 'returnable';
  name: string;
  code?: string;
  description?: string;
  containerId: string;
  quantity?: number;
  baseUnit?: string;
  unit?: string;
  reorderPoint?: number;
  lotCode?: string;
  receivedDate?: string | null;
  expiryDate?: string | null;
  warrantyEndDate?: string | null;
  maintenanceNextDueDate?: string | null;
}) {
  const item: Item = {
    id: createId('item', input.name),
    workspaceId: input.workspaceId,
    name: input.name,
    kind: input.kind,
    usageType: input.usageType,
    returnPolicy: input.kind === 'single' ? 'due' : 'indefinite',
    quantity: input.kind === 'stock' ? input.quantity ?? 1 : undefined,
    baseUnit: input.baseUnit,
    unit: input.unit,
    reorderPoint: input.reorderPoint,
    lotCode: input.lotCode,
    receivedDate: input.receivedDate ?? null,
    expiryDate: input.expiryDate ?? null,
    warrantyEndDate: input.warrantyEndDate ?? null,
    maintenanceNextDueDate: input.maintenanceNextDueDate ?? null,
    code: input.code,
    description: input.description,
    status: 'stored',
    containerId: input.containerId,
    currentHolderId: null,
    createdAt: now(),
    updatedAt: now(),
  };
  items = [item, ...items];
  pushEvent({
    workspaceId: item.workspaceId,
    itemId: item.id,
    type: 'created',
    actor: { id: MOCK_USER.id, name: MOCK_USER.name },
  });
  return clone(item);
}

export function updateItem(id: string, input: { name?: string; code?: string; description?: string; containerId?: string | null }) {
  return clone(
    updateItemState(
      id,
      (item) => ({
        ...item,
        ...input,
        updatedAt: now(),
      }),
      {
        type: 'updated',
        actor: { id: MOCK_USER.id, name: MOCK_USER.name },
        payload: input,
      },
    ),
  );
}

export function adjustItemStock(id: string, delta: number, note?: string) {
  const item = items.find((entry) => entry.id === id);
  if (!item) {
    throw new Error(`Item not found: ${id}`);
  }
  if (item.kind !== 'stock') {
    throw new Error(`Stock flow not supported for item: ${id}`);
  }

  const nextQuantity = Math.max(0, (item.quantity ?? 0) + delta);
  const updated: Item = {
    ...item,
    quantity: nextQuantity,
    updatedAt: now(),
  };

  items = [updated, ...items.filter((entry) => entry.id !== id)];
  pushEvent({
    workspaceId: updated.workspaceId,
    itemId: updated.id,
    type: delta < 0 ? 'stock_used' : 'stock_restocked',
    actor: { id: MOCK_USER.id, name: MOCK_USER.name },
    payload: { quantity: Math.abs(delta), note, quantityAfter: nextQuantity },
  });
  return clone(updated);
}

export function countItemStock(id: string, countedQuantity: number, note?: string) {
  const item = items.find((entry) => entry.id === id);
  if (!item) {
    throw new Error(`Item not found: ${id}`);
  }
  if (item.kind !== 'stock') {
    throw new Error(`Count flow not supported for item: ${id}`);
  }
  const updated: Item = {
    ...item,
    quantity: countedQuantity,
    updatedAt: now(),
  };
  items = [updated, ...items.filter((entry) => entry.id !== id)];
  pushEvent({
    workspaceId: updated.workspaceId,
    itemId: updated.id,
    type: 'stock_counted',
    actor: { id: MOCK_USER.id, name: MOCK_USER.name },
    payload: { countedQuantity, note },
  });
  return clone(updated);
}

export function adjustStockVariance(id: string, variance: number, reason: string, approvalNote?: string) {
  const item = items.find((entry) => entry.id === id);
  if (!item) {
    throw new Error(`Item not found: ${id}`);
  }
  if (item.kind !== 'stock') {
    throw new Error(`Adjust flow not supported for item: ${id}`);
  }
  const nextQuantity = Math.max(0, (item.quantity ?? 0) + variance);
  const updated: Item = {
    ...item,
    quantity: nextQuantity,
    updatedAt: now(),
  };
  items = [updated, ...items.filter((entry) => entry.id !== id)];
  pushEvent({
    workspaceId: updated.workspaceId,
    itemId: updated.id,
    type: 'stock_adjusted',
    actor: { id: MOCK_USER.id, name: MOCK_USER.name },
    payload: { variance, reason, approvalNote, quantityAfter: nextQuantity },
  });
  return clone(updated);
}

export function moveItem(id: string, toContainerId: string) {
  return clone(
    updateItemState(
      id,
      (item) => ({
        ...item,
        containerId: toContainerId,
        updatedAt: now(),
      }),
      {
        type: 'moved',
        actor: { id: MOCK_USER.id, name: MOCK_USER.name },
        payload: { toContainerId },
      },
    ),
  );
}

export function borrowItem(id: string, holderId: string, dueDate?: string | null, note?: string) {
  return clone(
    updateItemState(
      id,
      (item) => ({
        ...item,
        status: 'taken_out',
        currentHolderId: holderId,
        dueDate: dueDate ?? item.dueDate ?? null,
        updatedAt: now(),
      }),
      {
        type: 'borrowed',
        actor: { id: MOCK_USER.id, name: MOCK_USER.name },
        payload: { holderId, dueDate, note },
      },
    ),
  );
}

export function withdrawItem(id: string, destinationId?: string, note?: string) {
  return clone(
    updateItemState(
      id,
      (item) => ({
        ...item,
        status: 'taken_out',
        currentHolderId: item.currentHolderId ?? MOCK_USERS[2].id,
        updatedAt: now(),
      }),
      {
        type: 'withdrawn',
        actor: { id: MOCK_USER.id, name: MOCK_USER.name },
        payload: { destinationId, note },
      },
    ),
  );
}

export function reserveItem(id: string, holderId: string, startDate?: string | null, endDate?: string | null, note?: string) {
  return clone(
    updateItemState(
      id,
      (item) => ({
        ...item,
        status: 'reserved',
        currentHolderId: holderId,
        updatedAt: now(),
      }),
      {
        type: 'reserved',
        actor: { id: MOCK_USER.id, name: MOCK_USER.name },
        payload: { holderId, startDate, endDate, note },
      },
    ),
  );
}

export function repairItem(id: string, reason: string, etaDate?: string | null, note?: string) {
  return clone(
    updateItemState(
      id,
      (item) => ({
        ...item,
        status: 'repair',
        updatedAt: now(),
      }),
      {
        type: 'marked_repairing',
        actor: { id: MOCK_USER.id, name: MOCK_USER.name },
        payload: { reason, etaDate, note },
      },
    ),
  );
}

export function returnItem(id: string, note?: string) {
  return clone(
    updateItemState(
      id,
      (item) => ({
        ...item,
        status: 'stored',
        currentHolderId: null,
        dueDate: null,
        updatedAt: now(),
      }),
      {
        type: 'returned',
        actor: { id: MOCK_USER.id, name: MOCK_USER.name },
        payload: { note },
      },
    ),
  );
}

export function markMissingItem(id: string, reason?: string) {
  return clone(
    updateItemState(
      id,
      (item) => ({
        ...item,
        status: 'missing',
        currentHolderId: null,
        containerId: null,
        updatedAt: now(),
      }),
      {
        type: 'marked_missing',
        actor: { id: MOCK_USER.id, name: MOCK_USER.name },
        payload: { reason },
      },
    ),
  );
}

export function markFoundItem(id: string, containerId: string) {
  return clone(
    updateItemState(
      id,
      (item) => ({
        ...item,
        status: 'stored',
        containerId,
        currentHolderId: null,
        updatedAt: now(),
      }),
      {
        type: 'marked_found',
        actor: { id: MOCK_USER.id, name: MOCK_USER.name },
        payload: { containerId },
      },
    ),
  );
}

export function disposeItem(id: string, reason?: string) {
  return clone(
    updateItemState(
      id,
      (item) => ({
        ...item,
        status: 'disposed',
        currentHolderId: null,
        containerId: null,
        updatedAt: now(),
      }),
      {
        type: 'disposed',
        actor: { id: MOCK_USER.id, name: MOCK_USER.name },
        payload: { reason },
      },
    ),
  );
}

export function getContainerChildren(wsId: string, parentId: string | null) {
  return clone(containers.filter((container) => container.workspaceId === wsId && container.parentId === parentId));
}

export function getContainerItems(wsId: string, containerId: string) {
  return clone(items.filter((item) => item.workspaceId === wsId && item.containerId === containerId));
}

export function resetDemoDb() {
  workspaces = clone(SEED_WORKSPACES);
  containers = clone(SEED_CONTAINERS);
  members = clone(SEED_MEMBERS);
  items = clone(SEED_ITEMS);
  activity = clone(SEED_ACTIVITY);
  notifications = clone(SEED_NOTIFICATIONS);
  reports = clone(SEED_REPORTS);
}
