import type { ApiMeta } from '@/types/api.types';
import type {
  Container,
  Item,
  ItemEvent,
  ItemEventType,
  Member,
  Role,
  Workspace,
} from '@/types/domain.types';
import {
  MOCK_ACTIVITY as SEED_ACTIVITY,
  MOCK_CONTAINERS as SEED_CONTAINERS,
  MOCK_ITEMS as SEED_ITEMS,
  MOCK_MEMBERS as SEED_MEMBERS,
  MOCK_WORKSPACES as SEED_WORKSPACES,
  MOCK_USER,
} from '@/mocks/mock-data';
import type { PermissionKey } from '@/types/permission.types';
import { getItemStockState } from '@/lib/item-stock';

type MutableRecord<T> = T[];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const ROLE_DEFAULT_PERMISSIONS: Record<Role, PermissionKey[]> = {
  owner: [
    'workspace.view',
    'workspace.update',
    'workspace.delete',
    'member.view',
    'member.invite',
    'member.update_role',
    'member.remove',
    'permission.override',
    'container.view',
    'container.create',
    'container.update',
    'container.delete',
    'item.view',
    'item.create',
    'item.update',
    'item.delete',
    'item.move',
    'item.takeout',
    'item.return',
    'item.mark_missing',
    'item.mark_found',
    'item.dispose',
    'activity.view',
  ],
  admin: [
    'workspace.view',
    'member.view',
    'member.invite',
    'member.update_role',
    'container.view',
    'container.create',
    'container.update',
    'item.view',
    'item.create',
    'item.update',
    'item.move',
    'item.takeout',
    'item.return',
    'activity.view',
  ],
  member: ['item.view', 'item.create', 'item.update', 'item.move', 'item.takeout', 'item.return', 'activity.view'],
  viewer: ['item.view', 'activity.view'],
};

let workspaces: MutableRecord<Workspace> = clone(SEED_WORKSPACES);
let containers: MutableRecord<Container> = clone(SEED_CONTAINERS);
let members: MutableRecord<Member> = clone(SEED_MEMBERS);
let items: MutableRecord<Item> = clone(SEED_ITEMS);
let activity: MutableRecord<ItemEvent> = clone(SEED_ACTIVITY);

function now() {
  return new Date().toISOString();
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function createId(prefix: string, value: string) {
  return `${prefix}-${slugify(value) || 'workspace'}`;
}

function getWorkspaceOrFallback(id: string) {
  return workspaces.find((item) => item.id === id) ?? workspaces[0];
}

function getMemberOrFallback(id: string) {
  return members.find((entry) => entry.id === id) ?? members[0];
}

function buildEffectivePermissions(role: Role, overrides?: Record<string, boolean>) {
  const permissions = new Set(ROLE_DEFAULT_PERMISSIONS[role]);
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

function updateItemState(itemId: string, updater: (item: Item) => Item, event?: { type: ItemEventType; actor: ItemEvent['actor']; payload?: ItemEvent['payload'] }) {
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
  return clone(getWorkspaceOrFallback(id));
}

export function createWorkspace(name: string) {
  const workspace: Workspace = {
    id: createId('ws', name),
    name,
    myRole: 'owner',
    permissions: [],
    createdAt: now(),
    updatedAt: now(),
    description: 'Workspace',
  };
  workspaces = [workspace, ...workspaces];
  return clone(workspace);
}

export function listContainers(wsId: string) {
  return clone(containers.filter((container) => container.workspaceId === wsId));
}

export function getContainer(id: string) {
  return clone(containers.find((container) => container.id === id) ?? containers[0]);
}

export function listMembers(wsId: string) {
  return clone(members.filter((member) => member.workspaceId === wsId));
}

export function getMember(id: string) {
  return clone(getMemberOrFallback(id));
}

export function inviteMember(wsId: string, email: string, role: Role) {
  const member: Member = {
    id: createId('member', email),
    workspaceId: wsId,
    user: {
      id: createId('user', email),
      email,
      name: email.split('@')[0],
    },
    role,
    permissions: buildEffectivePermissions(role),
    permissionOverrides: {},
    createdAt: now(),
  };
  members = [member, ...members];
  return clone(member);
}

export function updateMemberRole(id: string, role: Role) {
  const member = getMemberOrFallback(id);
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
  const member = getMemberOrFallback(memberId);
  return {
    role: member.role,
    effective: member.permissions,
    overrides: member.permissionOverrides ?? {},
  };
}

export function updateMemberPermissions(memberId: string, overrides: Record<string, boolean>) {
  const member = getMemberOrFallback(memberId);
  const updated: Member = {
    ...member,
    permissionOverrides: overrides,
    permissions: buildEffectivePermissions(member.role, overrides),
  };
  members = [updated, ...members.filter((entry) => entry.id !== memberId)];
  return {
    role: updated.role,
    effective: updated.permissions,
    overrides: updated.permissionOverrides ?? {},
  };
}

export interface SearchFilter {
  q?: string;
  kind?: string;
  usageType?: string;
  status?: string;
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

    if (!keyword) {
      return true;
    }

    const container = item.containerId ? containers.find((entry) => entry.id === item.containerId) : null;
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.code?.toLowerCase().includes(keyword) === true ||
      item.description?.toLowerCase().includes(keyword) === true ||
      container?.code.toLowerCase().includes(keyword) === true ||
      container?.name?.toLowerCase().includes(keyword) === true
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
    takenOut: workspaceItems.filter((item) => item.status === 'taken_out').length,
    missing: workspaceItems.filter((item) => item.status === 'missing').length,
    lowStock: workspaceItems.filter((item) => getItemStockState(item) === 'low_stock').length,
    outOfStock: workspaceItems.filter((item) => getItemStockState(item) === 'out_of_stock').length,
    returnableItems: workspaceItems.filter((item) => item.usageType === 'returnable').length,
  };
}

export function getRecentActivity(wsId: string) {
  return clone(activity.filter((event) => event.workspaceId === wsId));
}

export function createItem(input: {
  workspaceId: string;
  name: string;
  kind: 'single' | 'bulk';
  usageType: 'consumable' | 'returnable';
  quantity?: number;
  reorderPoint?: number;
  code?: string;
  description?: string;
  containerId: string;
}) {
  const item: Item = {
    id: createId('item', input.name),
    workspaceId: input.workspaceId,
    name: input.name,
    kind: input.kind,
    usageType: input.usageType,
    returnPolicy: 'indefinite',
    quantity: input.kind === 'bulk' ? input.quantity ?? 1 : undefined,
    reorderPoint: input.kind === 'bulk' && input.usageType === 'consumable' ? input.reorderPoint ?? 5 : undefined,
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

export function updateItem(id: string, input: { name?: string; code?: string; description?: string }) {
  return clone(
    updateItemState(
      id,
      (item) => {
        return {
          ...item,
          ...input,
          returnPolicy: 'indefinite',
          updatedAt: now(),
        };
      },
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
  if (item.kind !== 'bulk' || item.usageType !== 'consumable') {
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

export function takeOutItem(id: string, holderId: string, quantity: number, note?: string) {
  return clone(
    updateItemState(
      id,
      (item) => ({
        ...item,
        status: 'taken_out',
        currentHolderId: holderId,
        updatedAt: now(),
      }),
      {
        type: 'taken_out',
        actor: { id: MOCK_USER.id, name: MOCK_USER.name },
        payload: { holderId, quantity, note },
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

export function markMissingItem(id: string) {
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

export function resetDemoDb() {
  workspaces = clone(SEED_WORKSPACES);
  containers = clone(SEED_CONTAINERS);
  members = clone(SEED_MEMBERS);
  items = clone(SEED_ITEMS);
  activity = clone(SEED_ACTIVITY);
}
