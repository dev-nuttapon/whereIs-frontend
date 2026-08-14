import { client } from '@/api/client';
import type { StockEntry, StockStatus } from '@/types/domain.types';

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
  siteId: string | null;
  siteName: string | null;
  locationId: string | null;
  locationName: string | null;
  containerId: string | null;
  containerName: string | null;
  quantity: number;
  reservedQuantity?: number | null;
  availableQuantity?: number | null;
  lotCode: string | null;
  expiryDate: string | null;
  alertLeadDays: number | null;
  minStockAlert: number | null;
  stockStatus: StockStatus;
  createdAt: string;
}

export interface AdjustStockInput {
  productId: string;
  locationId?: string | null;
  containerId?: string | null;
  delta: number;
  reason?: string | null;
  lotCode?: string | null;
  expiryDate?: string | null;
  alertLeadDays?: number | null;
}

function toStockEntry(dto: StockEntryDto): StockEntry {
  return {
    id: dto.id,
    workspaceId: dto.workspaceId,
    productId: dto.productId,
    productName: dto.productName,
    unitCode: dto.unitCode ?? undefined,
    siteId: dto.siteId ?? undefined,
    siteName: dto.siteName ?? undefined,
    locationId: dto.locationId ?? undefined,
    locationName: dto.locationName ?? undefined,
    containerId: dto.containerId ?? undefined,
    containerName: dto.containerName ?? undefined,
    quantity: dto.quantity,
    reservedQuantity: dto.reservedQuantity ?? undefined,
    availableQuantity: dto.availableQuantity ?? undefined,
    lotCode: dto.lotCode ?? undefined,
    expiryDate: dto.expiryDate ?? undefined,
    alertLeadDays: dto.alertLeadDays ?? undefined,
    minStockAlert: dto.minStockAlert ?? undefined,
    stockStatus: dto.stockStatus,
    createdAt: dto.createdAt,
  };
}

export interface ListStockEntriesParams {
  productId?: string | null;
  siteId?: string | null;
  locationId?: string | null;
  containerId?: string | null;
  lotCode?: string | null;
  search?: string | null;
  stockStatus?: StockStatus | '' | null;
  expiryFrom?: string | null;
  expiryTo?: string | null;
  page?: number;
  pageSize?: number;
}

export async function listStockEntries(
  wsId: string,
  params: ListStockEntriesParams = {},
): Promise<PagedResult<StockEntry>> {
  const response = await client.get<ApiResponse<PagedResult<StockEntryDto>>>(`/workspaces/${encodeURIComponent(wsId)}/stock`, {
    params: {
      productId: params.productId ?? undefined,
      siteId: params.siteId ?? undefined,
      locationId: params.locationId ?? undefined,
      containerId: params.containerId ?? undefined,
      lotCode: params.lotCode ?? undefined,
      search: params.search?.trim() || undefined,
      stockStatus: params.stockStatus || undefined,
      expiryFrom: params.expiryFrom ?? undefined,
      expiryTo: params.expiryTo ?? undefined,
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
    lotCode: input.lotCode ?? null,
    expiryDate: input.expiryDate ?? null,
    alertLeadDays: input.alertLeadDays ?? null,
  });
  return toStockEntry(response.data.data);
}
