import type { ApiMeta } from '@/types/api.types';
import type { Item, ItemEvent } from '@/types/domain.types';
import {
  createItem as createItemRecord,
  disposeItem as disposeItemRecord,
  getItem as getItemRecord,
  listItemEvents as listItemEventsRecord,
  listItems as listItemsRecord,
  adjustItemStock as adjustItemStockRecord,
  markFoundItem as markFoundItemRecord,
  markMissingItem as markMissingItemRecord,
  moveItem as moveItemRecord,
  returnItem as returnItemRecord,
  takeOutItem as takeOutItemRecord,
  updateItem as updateItemRecord,
} from '@/mocks/demo-db';
import { delay } from '@/utils/mock-api';

export interface SearchItemsParams extends Record<string, string | number | undefined> {
  workspaceId?: string;
  q?: string;
  kind?: string;
  usageType?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateItemInput {
  name: string;
  kind: 'single' | 'bulk';
  usageType: 'consumable' | 'returnable';
  quantity?: number;
  reorderPoint?: number;
  code?: string;
  description?: string;
  containerId: string;
}

export interface AdjustStockInput {
  quantity: number;
  note?: string;
}

export interface UpdateItemInput {
  name?: string;
  code?: string;
  description?: string;
}

export interface TakeOutInput {
  holderId: string;
  quantity: number;
  note?: string;
}

export interface ReturnInput {
  note?: string;
}

export interface MoveItemInput {
  toContainerId: string;
}

export interface MarkFoundInput {
  containerId: string;
}

export interface DisposeInput {
  reason?: string;
}

export async function searchItems(params: SearchItemsParams): Promise<{ data: Item[]; meta: ApiMeta }> {
  const workspaceId = params.workspaceId ?? 'ws-warehouse';
  return delay(listItemsRecord(workspaceId, params));
}

export async function getItem(id: string): Promise<Item> {
  return delay(getItemRecord(id));
}

export async function getItemEvents(id: string): Promise<ItemEvent[]> {
  return delay(listItemEventsRecord(id));
}

export async function createItem(wsId: string, input: CreateItemInput): Promise<Item> {
  return delay(createItemRecord({ workspaceId: wsId, ...input }));
}

export async function updateItem(id: string, input: UpdateItemInput): Promise<Item> {
  return delay(updateItemRecord(id, input));
}

export async function moveItem(id: string, input: MoveItemInput): Promise<Item> {
  return delay(moveItemRecord(id, input.toContainerId));
}

export async function takeOutItem(id: string, input: TakeOutInput): Promise<Item> {
  return delay(takeOutItemRecord(id, input.holderId, input.quantity, input.note));
}

export async function returnItem(id: string, input: ReturnInput): Promise<Item> {
  return delay(returnItemRecord(id, input.note));
}

export async function markMissingItem(id: string): Promise<Item> {
  return delay(markMissingItemRecord(id));
}

export async function markFoundItem(id: string, input: MarkFoundInput): Promise<Item> {
  return delay(markFoundItemRecord(id, input.containerId));
}

export async function disposeItem(id: string, input: DisposeInput): Promise<Item> {
  return delay(disposeItemRecord(id, input.reason));
}

export async function consumeItemStock(id: string, input: AdjustStockInput): Promise<Item> {
  return delay(adjustItemStockRecord(id, -input.quantity, input.note));
}

export async function restockItemStock(id: string, input: AdjustStockInput): Promise<Item> {
  return delay(adjustItemStockRecord(id, input.quantity, input.note));
}

export async function getActivity(wsId: string): Promise<ItemEvent[]> {
  return delay(listItemEventsRecord().filter((event) => event.workspaceId === wsId));
}
