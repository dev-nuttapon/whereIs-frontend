import { client } from '@/api/client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface CreateReceivingReceiptLineInput {
  productId: string;
  quantity: number;
  unitCode?: string | null;
  locationId?: string | null;
  containerId?: string | null;
  lotCode?: string | null;
  expiryDate?: string | null;
  alertLeadDays?: number | null;
  lowStockThreshold?: number | null;
  serialNumber?: string | null;
  barcode?: string | null;
  notes?: string | null;
}

export interface CreateReceivingReceiptInput {
  reference?: string | null;
  receivedAt?: string | null;
  notes?: string | null;
  lines: CreateReceivingReceiptLineInput[];
}

export interface ReceivingReceiptLine {
  id: string;
  productId: string;
  productName: string;
  trackingType: string;
  quantity: number;
  unitCode?: string | null;
  locationId?: string | null;
  containerId?: string | null;
  lotCode?: string | null;
  expiryDate?: string | null;
  alertLeadDays?: number | null;
  lowStockThreshold?: number | null;
  stockEntryId?: string | null;
  resultingQuantity?: number | null;
  createdAssetIds: string[];
}

export interface ReceivingReceipt {
  id: string;
  workspaceId: string;
  reference?: string | null;
  receivedAt: string;
  notes?: string | null;
  receivedByUserId: string;
  lines: ReceivingReceiptLine[];
  createdAt: string;
}

export interface ReceivingReceiptSummary {
  id: string;
  workspaceId: string;
  reference?: string | null;
  receivedAt: string;
  notes?: string | null;
  receivedByUserId: string;
  lineCount: number;
  createdAt: string;
}

export interface ReceivingReceiptListResult {
  items: ReceivingReceiptSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export async function createReceivingReceipt(wsId: string, input: CreateReceivingReceiptInput): Promise<ReceivingReceipt> {
  const response = await client.post<ApiResponse<ReceivingReceipt>>(
    `/workspaces/${encodeURIComponent(wsId)}/inventory/receipts`,
    input,
  );
  return response.data.data;
}

export async function listReceivingReceipts(wsId: string, page = 1, pageSize = 5): Promise<ReceivingReceiptListResult> {
  const response = await client.get<ApiResponse<ReceivingReceiptListResult>>(
    `/workspaces/${encodeURIComponent(wsId)}/inventory/receipts`,
    { params: { page, pageSize } },
  );
  return response.data.data;
}
