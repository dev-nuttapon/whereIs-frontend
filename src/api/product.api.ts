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
