import { client } from '@/api/client';
import type { StockEntry } from '@/types/domain.types';

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

interface StockEntryDto {
  id: string;
  workspaceId: string;
  productId: string;
  productName: string;
  unitCode: string | null;
  locationId: string | null;
  locationName: string | null;
  containerId: string | null;
  containerName: string | null;
  quantity: number;
  createdAt: string;
}

export interface AdjustStockInput {
  productId: string;
  locationId?: string | null;
  containerId?: string | null;
  delta: number;
  reason?: string | null;
}

function toStockEntry(dto: StockEntryDto): StockEntry {
  return {
    id: dto.id,
    workspaceId: dto.workspaceId,
    productId: dto.productId,
    productName: dto.productName,
    unitCode: dto.unitCode ?? undefined,
    locationId: dto.locationId ?? undefined,
    locationName: dto.locationName ?? undefined,
    containerId: dto.containerId ?? undefined,
    containerName: dto.containerName ?? undefined,
    quantity: dto.quantity,
    createdAt: dto.createdAt,
  };
}

export async function listStockEntries(
  wsId: string,
  params: { productId?: string | null; locationId?: string | null; page?: number; pageSize?: number } = {},
): Promise<PagedResult<StockEntry>> {
  const response = await client.get<ApiResponse<PagedResult<StockEntryDto>>>(`/workspaces/${encodeURIComponent(wsId)}/stock`, {
    params: {
      productId: params.productId ?? undefined,
      locationId: params.locationId ?? undefined,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 100,
    },
  });
  return {
    ...response.data.data,
    items: response.data.data.items.map(toStockEntry),
  };
}

export async function adjustStock(wsId: string, input: AdjustStockInput): Promise<StockEntry> {
  const response = await client.post<ApiResponse<StockEntryDto>>(`/workspaces/${encodeURIComponent(wsId)}/stock/adjust`, {
    productId: input.productId,
    locationId: input.locationId ?? null,
    containerId: input.containerId ?? null,
    delta: input.delta,
    reason: input.reason ?? null,
  });
  return toStockEntry(response.data.data);
}
