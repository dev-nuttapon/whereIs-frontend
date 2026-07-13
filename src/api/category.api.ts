import { client } from '@/api/client';
import type { Category } from '@/types/domain.types';

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

interface CategoryDto {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  color: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string | null;
  color?: string | null;
}

export interface UpdateCategoryInput {
  name?: string | null;
  description?: string | null;
  color?: string | null;
  isActive?: boolean | null;
}

function toCategory(dto: CategoryDto): Category {
  return {
    id: dto.id,
    workspaceId: dto.workspaceId,
    name: dto.name,
    description: dto.description ?? undefined,
    color: dto.color ?? undefined,
    isActive: dto.isActive,
    productCount: dto.productCount,
    createdAt: dto.createdAt,
  };
}

export async function listCategories(wsId: string): Promise<Category[]> {
  const response = await client.get<ApiResponse<PagedResult<CategoryDto>>>(`/workspaces/${encodeURIComponent(wsId)}/categories`, {
    params: { page: 1, pageSize: 100 },
  });
  return response.data.data.items.map(toCategory);
}

export async function getCategory(wsId: string, id: string): Promise<Category> {
  const response = await client.get<ApiResponse<CategoryDto>>(`/workspaces/${encodeURIComponent(wsId)}/categories/${encodeURIComponent(id)}`);
  return toCategory(response.data.data);
}

export async function createCategory(wsId: string, input: CreateCategoryInput): Promise<Category> {
  const response = await client.post<ApiResponse<CategoryDto>>(`/workspaces/${encodeURIComponent(wsId)}/categories`, {
    name: input.name,
    description: input.description ?? null,
    color: input.color ?? null,
  });
  return toCategory(response.data.data);
}

export async function updateCategory(wsId: string, id: string, input: UpdateCategoryInput): Promise<Category> {
  const response = await client.put<ApiResponse<CategoryDto>>(`/workspaces/${encodeURIComponent(wsId)}/categories/${encodeURIComponent(id)}`, {
    name: input.name ?? null,
    description: input.description ?? null,
    color: input.color ?? null,
    isActive: input.isActive ?? null,
  });
  return toCategory(response.data.data);
}

export async function deleteCategory(wsId: string, id: string): Promise<{ success: true }> {
  await client.delete(`/workspaces/${encodeURIComponent(wsId)}/categories/${encodeURIComponent(id)}`);
  return { success: true };
}
