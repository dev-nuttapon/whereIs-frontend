import { client } from '@/api/client';
import type { Container } from '@/types/domain.types';

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

interface ContainerDto {
  id: string;
  workspaceId: string;
  locationId: string | null;
  parentContainerId: string | null;
  name: string;
  type: string | null;
  code: string | null;
  qrCode: string | null;
  photoUrl: string | null;
  itemCount: number;
  childContainerCount: number;
  createdAt: string;
}

export interface CreateContainerInput {
  locationId?: string | null;
  parentContainerId?: string | null;
  name: string;
  type?: string | null;
  code?: string | null;
  qrCode?: string | null;
}

export interface MoveContainerInput {
  locationId?: string | null;
  parentContainerId?: string | null;
}

function toContainer(dto: ContainerDto): Container {
  return {
    id: dto.id,
    workspaceId: dto.workspaceId,
    locationId: dto.locationId,
    parentId: dto.parentContainerId,
    name: dto.name,
    typeLabel: dto.type ?? 'Container',
    note: undefined,
    code: dto.code ?? undefined,
    qrCode: dto.qrCode ?? undefined,
    photoUrl: dto.photoUrl ?? undefined,
    itemCount: dto.itemCount,
    childContainerCount: dto.childContainerCount,
    createdAt: dto.createdAt,
    updatedAt: dto.createdAt,
  };
}

export async function listContainers(
  wsId: string,
  params: { locationId?: string | null; parentId?: string | null; page?: number; pageSize?: number } = {},
): Promise<Container[]> {
  const response = await client.get<ApiResponse<PagedResult<ContainerDto>>>(`/workspaces/${encodeURIComponent(wsId)}/containers`, {
    params: {
      locationId: params.locationId ?? undefined,
      parentId: params.parentId ?? undefined,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 100,
    },
  });
  return response.data.data.items.map(toContainer);
}

export async function getContainer(wsId: string, id: string): Promise<Container> {
  const response = await client.get<ApiResponse<ContainerDto>>(
    `/workspaces/${encodeURIComponent(wsId)}/containers/${encodeURIComponent(id)}`,
  );
  return toContainer(response.data.data);
}

export async function createContainer(wsId: string, input: CreateContainerInput): Promise<Container> {
  const response = await client.post<ApiResponse<ContainerDto>>(`/workspaces/${encodeURIComponent(wsId)}/containers`, {
    locationId: input.locationId ?? null,
    parentContainerId: input.parentContainerId ?? null,
    name: input.name,
    type: input.type ?? null,
    code: input.code ?? null,
    qrCode: input.qrCode ?? null,
  });
  return toContainer(response.data.data);
}

export async function updateContainer(
  wsId: string,
  id: string,
  input: Pick<CreateContainerInput, 'name' | 'type' | 'code' | 'qrCode'>,
): Promise<Container> {
  const response = await client.put<ApiResponse<ContainerDto>>(`/workspaces/${encodeURIComponent(wsId)}/containers/${encodeURIComponent(id)}`, {
    name: input.name,
    type: input.type ?? null,
    code: input.code ?? null,
    qrCode: input.qrCode ?? null,
  });
  return toContainer(response.data.data);
}

export async function moveContainer(wsId: string, id: string, input: MoveContainerInput): Promise<Container> {
  const response = await client.put<ApiResponse<ContainerDto>>(`/workspaces/${encodeURIComponent(wsId)}/containers/${encodeURIComponent(id)}/move`, {
    locationId: input.locationId ?? null,
    parentContainerId: input.parentContainerId ?? null,
  });
  return toContainer(response.data.data);
}

export async function deleteContainer(wsId: string, id: string): Promise<{ success: true }> {
  await client.delete(`/workspaces/${encodeURIComponent(wsId)}/containers/${encodeURIComponent(id)}`);
  return { success: true };
}
