import type { Container, Item } from '@/types/domain.types';
import { getContainer as getContainerRecord, getContainerChildren as getContainerChildrenRecord, getContainerItems as getContainerItemsRecord, listContainers as listContainersRecord } from '@/mocks/demo-db';
import { delay } from '@/utils/mock-api';

export async function listContainers(wsId: string): Promise<Container[]> {
  return delay(listContainersRecord(wsId));
}

export async function getContainer(wsId: string, id: string): Promise<Container> {
  void wsId;
  return delay(getContainerRecord(id));
}

export async function getContainerChildren(wsId: string, id: string): Promise<Container[]> {
  return delay(getContainerChildrenRecord(wsId, id));
}

export async function getContainerItems(wsId: string, id: string): Promise<Item[]> {
  return delay(getContainerItemsRecord(wsId, id));
}
