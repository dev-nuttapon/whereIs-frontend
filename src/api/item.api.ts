import { client } from '@/api/client';
import type { Item, ItemEvent } from '@/types/domain.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface ListItemsParams {
  q?: string | null;
  kind?: string | null;
  usageType?: string | null;
  status?: string | null;
  containerId?: string | null;
  page?: number;
  limit?: number;
  sort?: string | null;
  holderId?: string | null;
  location?: string | null;
  expiry?: string | null;
  warranty?: string | null;
  maintenance?: string | null;
  reservationWaiting?: string | null;
  overdueReturn?: string | null;
}

export interface CreateItemInput {
  kind: 'single' | 'stock';
  usageType: 'consumable' | 'returnable';
  name: string;
  code?: string;
  photoUrl?: string | null;
  description?: string;
  containerId: string;
  quantity?: number;
  unit?: string;
  baseUnit?: string;
  lotCode?: string;
  receivedDate?: string | null;
  expiryDate?: string | null;
  warrantyEndDate?: string | null;
  maintenanceNextDueDate?: string | null;
  reorderPoint?: number;
}

export interface UpdateItemInput {
  name?: string;
  code?: string;
  photoUrl?: string | null;
  description?: string;
  containerId?: string | null;
  quantity?: number;
  unit?: string;
  baseUnit?: string;
  lotCode?: string;
  receivedDate?: string | null;
  expiryDate?: string | null;
  warrantyEndDate?: string | null;
  maintenanceNextDueDate?: string | null;
  reorderPoint?: number;
}

function toParams(params: ListItemsParams) {
  return {
    q: params.q ?? undefined,
    kind: params.kind ?? undefined,
    usageType: params.usageType ?? undefined,
    status: params.status ?? undefined,
    containerId: params.containerId ?? undefined,
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    sort: params.sort ?? undefined,
    holderId: params.holderId ?? undefined,
    location: params.location ?? undefined,
    expiry: params.expiry ?? undefined,
    warranty: params.warranty ?? undefined,
    maintenance: params.maintenance ?? undefined,
    reservationWaiting: params.reservationWaiting ?? undefined,
    overdueReturn: params.overdueReturn ?? undefined,
  };
}

export async function listItems(wsId: string, params: ListItemsParams = {}): Promise<PagedResult<Item>> {
  const response = await client.get<ApiResponse<PagedResult<Item>>>(`/workspaces/${encodeURIComponent(wsId)}/items`, {
    params: toParams(params),
  });
  return response.data.data;
}

export async function getItem(wsId: string, itemId: string): Promise<Item> {
  const response = await client.get<ApiResponse<Item>>(`/workspaces/${encodeURIComponent(wsId)}/items/${encodeURIComponent(itemId)}`);
  return response.data.data;
}

export async function createItem(wsId: string, input: CreateItemInput): Promise<Item> {
  const response = await client.post<ApiResponse<Item>>(`/workspaces/${encodeURIComponent(wsId)}/items`, {
    ...input,
    photoUrl: input.photoUrl ?? null,
    receivedDate: input.receivedDate ?? null,
    expiryDate: input.expiryDate ?? null,
    warrantyEndDate: input.warrantyEndDate ?? null,
    maintenanceNextDueDate: input.maintenanceNextDueDate ?? null,
  });
  return response.data.data;
}

export async function updateItem(wsId: string, itemId: string, input: UpdateItemInput): Promise<Item> {
  const response = await client.put<ApiResponse<Item>>(`/workspaces/${encodeURIComponent(wsId)}/items/${encodeURIComponent(itemId)}`, {
    ...input,
    photoUrl: input.photoUrl ?? null,
    receivedDate: input.receivedDate ?? null,
    expiryDate: input.expiryDate ?? null,
    warrantyEndDate: input.warrantyEndDate ?? null,
    maintenanceNextDueDate: input.maintenanceNextDueDate ?? null,
  });
  return response.data.data;
}

export async function deleteItem(wsId: string, itemId: string): Promise<{ success: true }> {
  await client.delete(`/workspaces/${encodeURIComponent(wsId)}/items/${encodeURIComponent(itemId)}`);
  return { success: true };
}

export async function listItemEvents(wsId: string, itemId: string): Promise<ItemEvent[]> {
  const response = await client.get<ApiResponse<ItemEvent[]>>(`/workspaces/${encodeURIComponent(wsId)}/items/${encodeURIComponent(itemId)}/events`);
  return response.data.data;
}
