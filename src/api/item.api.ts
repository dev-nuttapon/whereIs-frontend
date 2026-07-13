import type { ApiMeta } from '@/types/api.types';
import type { Item, ItemEvent } from '@/types/domain.types';
import {
  adjustStockVariance as adjustStockVarianceRecord,
  borrowItem as borrowItemRecord,
  countItemStock as countItemStockRecord,
  createItem as createItemRecord,
  disposeItem as disposeItemRecord,
  getItem as getItemRecord,
  listItemEvents as listItemEventsRecord,
  listItems as listItemsRecord,
  markFoundItem as markFoundItemRecord,
  markMissingItem as markMissingItemRecord,
  moveItem as moveItemRecord,
  repairItem as repairItemRecord,
  reserveItem as reserveItemRecord,
  returnItem as returnItemRecord,
  restockItemStock as restockItemStockRecord,
  adjustItemStock as adjustItemStockRecord,
  updateItem as updateItemRecord,
  withdrawItem as withdrawItemRecord,
} from '@/mocks/demo-db';
import { delay } from '@/utils/mock-api';

export interface SearchItemsParams extends Record<string, string | number | undefined> {
  workspaceId?: string;
  q?: string;
  kind?: string;
  usageType?: string;
  status?: string;
  containerId?: string;
  page?: number;
  limit?: number;
}

export interface CreateItemInput {
  name: string;
  kind: 'single' | 'stock';
  usageType: 'consumable' | 'returnable';
  quantity?: number;
  baseUnit?: string;
  unit?: string;
  reorderPoint?: number;
  code?: string;
  description?: string;
  containerId: string;
  lotCode?: string;
  receivedDate?: string | null;
  expiryDate?: string | null;
  warrantyEndDate?: string | null;
  maintenanceNextDueDate?: string | null;
}

export interface AdjustStockInput {
  quantity: number;
  note?: string;
}

export interface UpdateItemInput {
  name?: string;
  code?: string;
  description?: string;
  containerId?: string | null;
  quantity?: number;
  baseUnit?: string;
  unit?: string;
  lotCode?: string;
  receivedDate?: string | null;
  expiryDate?: string | null;
  warrantyEndDate?: string | null;
  maintenanceNextDueDate?: string | null;
  reorderPoint?: number;
}

export interface BorrowInput {
  holderId: string;
  dueDate?: string | null;
  note?: string;
}

export interface WithdrawInput {
  destinationId?: string;
  note?: string;
}

export interface ReserveInput {
  holderId: string;
  startDate?: string | null;
  endDate?: string | null;
  note?: string;
}

export interface RepairInput {
  reason: string;
  etaDate?: string | null;
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
  const workspaceId = params.workspaceId ?? 'ws-hq';
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

export async function borrowItem(id: string, input: BorrowInput): Promise<Item> {
  return delay(borrowItemRecord(id, input.holderId, input.dueDate, input.note));
}

export async function withdrawItem(id: string, input: WithdrawInput): Promise<Item> {
  return delay(withdrawItemRecord(id, input.destinationId, input.note));
}

export async function reserveItem(id: string, input: ReserveInput): Promise<Item> {
  return delay(reserveItemRecord(id, input.holderId, input.startDate, input.endDate, input.note));
}

export async function repairItem(id: string, input: RepairInput): Promise<Item> {
  return delay(repairItemRecord(id, input.reason, input.etaDate, input.note));
}

export async function returnItem(id: string, input: ReturnInput): Promise<Item> {
  return delay(returnItemRecord(id, input.note));
}

export async function markMissingItem(id: string, reason?: string): Promise<Item> {
  return delay(markMissingItemRecord(id, reason));
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
  return delay(restockItemStockRecord(id, input.quantity, input.note));
}

export async function countItemStock(id: string, input: { countedQuantity: number; note?: string }): Promise<Item> {
  return delay(countItemStockRecord(id, input.countedQuantity, input.note));
}

export async function adjustStockVariance(
  id: string,
  input: { variance: number; reason: string; approvalNote?: string },
): Promise<Item> {
  return delay(adjustStockVarianceRecord(id, input.variance, input.reason, input.approvalNote));
}

export async function getActivity(wsId: string): Promise<ItemEvent[]> {
  return delay(listItemEventsRecord().filter((event) => event.workspaceId === wsId));
}
