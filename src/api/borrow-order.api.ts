import { client } from '@/api/client';
import type { BorrowOrder } from '@/types/domain.types';

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

interface BorrowOrderDto {
  id: string;
  workspaceId: string;
  requestedBy: string;
  purpose: string | null;
  needByDate: string;
  returnByDate: string;
  requiresApproval: boolean;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  reviewNote: string | null;
  lines: BorrowOrderLineDto[];
  createdAt: string;
}

interface BorrowOrderLineDto {
  id: string;
  assetId: string | null;
  assetSerialNumber: string | null;
  productId: string | null;
  productName: string | null;
  stockEntryId: string | null;
  quantity: number | null;
  status: string;
  returnedAt: string | null;
  returnedQuantity: number | null;
}

export interface BorrowLineInput {
  assetId?: string | null;
  productId?: string | null;
  stockEntryId?: string | null;
  quantity?: number | null;
}

export interface CreateBorrowOrderInput {
  purpose?: string | null;
  needByDate: string | Date;
  returnByDate: string | Date;
  lines: BorrowLineInput[];
}

export interface ReviewBorrowOrderInput {
  note?: string | null;
}

export interface ReturnBorrowLineInput {
  lineId: string;
  returnedQuantity: number;
  condition?: string | null;
}

export interface ReturnBorrowOrderInput {
  lines: ReturnBorrowLineInput[];
}

export interface CancelBorrowOrderInput {
  reason?: string | null;
}

function toBorrowOrderLine(dto: BorrowOrderLineDto): BorrowOrder['lines'][number] {
  return {
    id: dto.id,
    assetId: dto.assetId ?? undefined,
    assetSerialNumber: dto.assetSerialNumber ?? undefined,
    productId: dto.productId ?? undefined,
    productName: dto.productName ?? undefined,
    stockEntryId: dto.stockEntryId ?? undefined,
    quantity: dto.quantity ?? undefined,
    status: dto.status,
    returnedAt: dto.returnedAt ?? undefined,
    returnedQuantity: dto.returnedQuantity ?? undefined,
  };
}

function toBorrowOrder(dto: BorrowOrderDto): BorrowOrder {
  return {
    id: dto.id,
    workspaceId: dto.workspaceId,
    requestedBy: dto.requestedBy,
    purpose: dto.purpose ?? undefined,
    needByDate: dto.needByDate,
    returnByDate: dto.returnByDate,
    requiresApproval: dto.requiresApproval,
    status: dto.status,
    approvedBy: dto.approvedBy ?? undefined,
    approvedAt: dto.approvedAt ?? undefined,
    reviewNote: dto.reviewNote ?? undefined,
    lines: dto.lines.map(toBorrowOrderLine),
    createdAt: dto.createdAt,
  };
}

export async function listBorrowOrders(
  wsId: string,
  params: { requestedBy?: string | null; status?: string | null; page?: number; pageSize?: number } = {},
): Promise<PagedResult<BorrowOrder>> {
  const response = await client.get<ApiResponse<PagedResult<BorrowOrderDto>>>(`/workspaces/${encodeURIComponent(wsId)}/borrow-orders`, {
    params: {
      requestedBy: params.requestedBy ?? undefined,
      status: params.status ?? undefined,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  });
  return {
    ...response.data.data,
    items: response.data.data.items.map(toBorrowOrder),
  };
}

export async function getBorrowOrder(wsId: string, orderId: string): Promise<BorrowOrder> {
  const response = await client.get<ApiResponse<BorrowOrderDto>>(`/workspaces/${encodeURIComponent(wsId)}/borrow-orders/${encodeURIComponent(orderId)}`);
  return toBorrowOrder(response.data.data);
}

export async function createBorrowOrder(wsId: string, input: CreateBorrowOrderInput): Promise<BorrowOrder> {
  const response = await client.post<ApiResponse<BorrowOrderDto>>(`/workspaces/${encodeURIComponent(wsId)}/borrow-orders`, {
    purpose: input.purpose ?? null,
    needByDate: input.needByDate instanceof Date ? input.needByDate.toISOString() : input.needByDate,
    returnByDate: input.returnByDate instanceof Date ? input.returnByDate.toISOString() : input.returnByDate,
    lines: input.lines.map((line) => ({
      assetId: line.assetId ?? null,
      productId: line.productId ?? null,
      stockEntryId: line.stockEntryId ?? null,
      quantity: line.quantity ?? null,
    })),
  });
  return toBorrowOrder(response.data.data);
}

export async function approveBorrowOrder(wsId: string, orderId: string, input: ReviewBorrowOrderInput = {}): Promise<BorrowOrder> {
  const response = await client.post<ApiResponse<BorrowOrderDto>>(`/workspaces/${encodeURIComponent(wsId)}/borrow-orders/${encodeURIComponent(orderId)}/approve`, {
    note: input.note ?? null,
  });
  return toBorrowOrder(response.data.data);
}

export async function rejectBorrowOrder(wsId: string, orderId: string, input: ReviewBorrowOrderInput = {}): Promise<BorrowOrder> {
  const response = await client.post<ApiResponse<BorrowOrderDto>>(`/workspaces/${encodeURIComponent(wsId)}/borrow-orders/${encodeURIComponent(orderId)}/reject`, {
    note: input.note ?? null,
  });
  return toBorrowOrder(response.data.data);
}

export async function checkOutBorrowOrder(wsId: string, orderId: string): Promise<BorrowOrder> {
  const response = await client.post<ApiResponse<BorrowOrderDto>>(`/workspaces/${encodeURIComponent(wsId)}/borrow-orders/${encodeURIComponent(orderId)}/checkout`);
  return toBorrowOrder(response.data.data);
}

export async function returnBorrowOrder(wsId: string, orderId: string, input: ReturnBorrowOrderInput): Promise<BorrowOrder> {
  const response = await client.post<ApiResponse<BorrowOrderDto>>(`/workspaces/${encodeURIComponent(wsId)}/borrow-orders/${encodeURIComponent(orderId)}/return`, {
    lines: input.lines.map((line) => ({
      lineId: line.lineId,
      returnedQuantity: line.returnedQuantity,
      condition: line.condition ?? null,
    })),
  });
  return toBorrowOrder(response.data.data);
}

export async function cancelBorrowOrder(wsId: string, orderId: string, input: CancelBorrowOrderInput = {}): Promise<BorrowOrder> {
  const response = await client.post<ApiResponse<BorrowOrderDto>>(`/workspaces/${encodeURIComponent(wsId)}/borrow-orders/${encodeURIComponent(orderId)}/cancel`, {
    reason: input.reason ?? null,
  });
  return toBorrowOrder(response.data.data);
}
