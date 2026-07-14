import { client } from '@/api/client';
import type { Asset, AssetPhoto } from '@/types/domain.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

interface AssetDto {
  id: string;
  workspaceId: string;
  productId: string;
  productName: string;
  locationId: string | null;
  locationName: string | null;
  containerId: string | null;
  containerName: string | null;
  serialNumber: string | null;
  barcode: string | null;
  status: string;
  condition: string;
  notes: string | null;
  acquiredDate: string | null;
  currentHolderUserId: string | null;
  photos: Array<{ id: string; url: string; isMain: boolean; sortOrder: number }>;
  createdAt: string;
}

export interface CreateAssetInput {
  productId: string;
  locationId: string;
  containerId?: string | null;
  serialNumber?: string | null;
  barcode?: string | null;
  condition?: string | null;
  notes?: string | null;
  acquiredDate?: string | null;
}

export interface UpdateAssetInput {
  locationId?: string | null;
  containerId?: string | null;
  serialNumber?: string | null;
  barcode?: string | null;
  status?: string | null;
  condition?: string | null;
  notes?: string | null;
  acquiredDate?: string | null;
}

function toAsset(dto: AssetDto): Asset {
  const photos: AssetPhoto[] = dto.photos.map((photo) => ({
    id: photo.id,
    url: photo.url,
    isMain: photo.isMain,
    sortOrder: photo.sortOrder,
  }));

  return {
    id: dto.id,
    workspaceId: dto.workspaceId,
    productId: dto.productId,
    productName: dto.productName,
    locationId: dto.locationId,
    locationName: dto.locationName ?? undefined,
    containerId: dto.containerId,
    containerName: dto.containerName ?? undefined,
    serialNumber: dto.serialNumber ?? undefined,
    barcode: dto.barcode ?? undefined,
    status: dto.status,
    condition: dto.condition,
    notes: dto.notes ?? undefined,
    acquiredDate: dto.acquiredDate ?? undefined,
    currentHolderUserId: dto.currentHolderUserId ?? undefined,
    photos,
    photoUrls: photos.map((photo) => photo.url),
    createdAt: dto.createdAt,
  };
}

export async function listAssets(
  wsId: string,
  params: { productId?: string | null; locationId?: string | null; containerId?: string | null; status?: string | null; search?: string | null; page?: number; pageSize?: number } = {},
): Promise<Asset[]> {
  const response = await client.get<ApiResponse<PagedResult<AssetDto>>>(`/workspaces/${encodeURIComponent(wsId)}/assets`, {
    params: {
      productId: params.productId ?? undefined,
      locationId: params.locationId ?? undefined,
      containerId: params.containerId ?? undefined,
      status: params.status ?? undefined,
      search: params.search ?? undefined,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 100,
    },
  });
  return response.data.data.items.map(toAsset);
}

export async function getAsset(wsId: string, id: string): Promise<Asset> {
  const response = await client.get<ApiResponse<AssetDto>>(`/workspaces/${encodeURIComponent(wsId)}/assets/${encodeURIComponent(id)}`);
  return toAsset(response.data.data);
}

export async function createAsset(wsId: string, input: CreateAssetInput): Promise<Asset> {
  const response = await client.post<ApiResponse<AssetDto>>(`/workspaces/${encodeURIComponent(wsId)}/assets`, {
    productId: input.productId,
    locationId: input.locationId,
    containerId: input.containerId ?? null,
    serialNumber: input.serialNumber ?? null,
    barcode: input.barcode ?? null,
    condition: input.condition ?? 'Good',
    notes: input.notes ?? null,
    acquiredDate: input.acquiredDate ?? null,
  });
  return toAsset(response.data.data);
}

export async function updateAsset(wsId: string, id: string, input: UpdateAssetInput): Promise<Asset> {
  const response = await client.put<ApiResponse<AssetDto>>(`/workspaces/${encodeURIComponent(wsId)}/assets/${encodeURIComponent(id)}`, {
    locationId: input.locationId ?? null,
    containerId: input.containerId ?? null,
    serialNumber: input.serialNumber ?? null,
    barcode: input.barcode ?? null,
    status: input.status ?? null,
    condition: input.condition ?? null,
    notes: input.notes ?? null,
    acquiredDate: input.acquiredDate ?? null,
  });
  return toAsset(response.data.data);
}

export async function deleteAsset(wsId: string, id: string): Promise<{ success: true }> {
  await client.delete(`/workspaces/${encodeURIComponent(wsId)}/assets/${encodeURIComponent(id)}`);
  return { success: true };
}
