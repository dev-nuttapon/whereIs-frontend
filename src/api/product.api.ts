import { client } from '@/api/client';
import type { Product } from '@/types/domain.types';

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

interface ProductDto {
  id: string;
  workspaceId: string;
  categoryId: string | null;
  categoryName: string | null;
  unitCode: string | null;
  name: string;
  description: string | null;
  code: string | null;
  sku: string | null;
  trackingType: string;
  minStockAlert: number | null;
  imageUrl: string | null;
  isActive: boolean;
  assetCount: number;
  totalStock: number;
  createdAt: string;
}

export interface CreateProductInput {
  name: string;
  description?: string | null;
  categoryId?: string | null;
  unitCode?: string | null;
  code?: string | null;
  sku?: string | null;
  trackingType: 'Asset' | 'Stock' | string;
  minStockAlert?: number | null;
  imageUrl?: string | null;
}

export interface UpdateProductInput {
  name?: string | null;
  description?: string | null;
  categoryId?: string | null;
  unitCode?: string | null;
  code?: string | null;
  sku?: string | null;
  minStockAlert?: number | null;
  imageUrl?: string | null;
  isActive?: boolean | null;
}

function toProduct(dto: ProductDto): Product {
  return {
    id: dto.id,
    workspaceId: dto.workspaceId,
    categoryId: dto.categoryId,
    categoryName: dto.categoryName,
    unitCode: dto.unitCode,
    name: dto.name,
    description: dto.description,
    code: dto.code,
    sku: dto.sku,
    trackingType: dto.trackingType,
    minStockAlert: dto.minStockAlert,
    imageUrl: dto.imageUrl,
    isActive: dto.isActive,
    assetCount: dto.assetCount,
    totalStock: dto.totalStock,
    createdAt: dto.createdAt,
  };
}

export async function listProducts(wsId: string): Promise<Product[]> {
  const response = await client.get<ApiResponse<PagedResult<ProductDto>>>(`/workspaces/${encodeURIComponent(wsId)}/products`, {
    params: { page: 1, pageSize: 100 },
  });
  return response.data.data.items.map(toProduct);
}

export async function getProduct(wsId: string, id: string): Promise<Product> {
  const response = await client.get<ApiResponse<ProductDto>>(`/workspaces/${encodeURIComponent(wsId)}/products/${encodeURIComponent(id)}`);
  return toProduct(response.data.data);
}

export async function createProduct(wsId: string, input: CreateProductInput): Promise<Product> {
  const response = await client.post<ApiResponse<ProductDto>>(`/workspaces/${encodeURIComponent(wsId)}/products`, {
    name: input.name,
    description: input.description ?? null,
    categoryId: input.categoryId ?? null,
    unitCode: input.unitCode ?? null,
    code: input.code ?? null,
    sku: input.sku ?? null,
    trackingType: input.trackingType,
    minStockAlert: input.minStockAlert ?? null,
    imageUrl: input.imageUrl ?? null,
  });
  return toProduct(response.data.data);
}

export async function updateProduct(wsId: string, id: string, input: UpdateProductInput): Promise<Product> {
  const response = await client.put<ApiResponse<ProductDto>>(`/workspaces/${encodeURIComponent(wsId)}/products/${encodeURIComponent(id)}`, {
    name: input.name ?? null,
    description: input.description ?? null,
    categoryId: input.categoryId ?? null,
    unitCode: input.unitCode ?? null,
    code: input.code ?? null,
    sku: input.sku ?? null,
    minStockAlert: input.minStockAlert ?? null,
    imageUrl: input.imageUrl ?? null,
    isActive: input.isActive ?? null,
  });
  return toProduct(response.data.data);
}

export async function deleteProduct(wsId: string, id: string): Promise<{ success: true }> {
  await client.delete(`/workspaces/${encodeURIComponent(wsId)}/products/${encodeURIComponent(id)}`);
  return { success: true };
}
