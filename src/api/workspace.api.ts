import type { Workspace } from '@/types/domain.types';
import { createWorkspace as createWorkspaceRecord, findWorkspace as findWorkspaceRecord, listWorkspaces as listWorkspacesRecord } from '@/mocks/demo-db';
import { delay } from '@/utils/mock-api';

export interface CreateWorkspaceInput {
  name: string;
}

export async function listWorkspaces(): Promise<Workspace[]> {
  return delay(listWorkspacesRecord());
}

export async function getWorkspace(id: string): Promise<Workspace | undefined> {
  return delay(findWorkspaceRecord(id));
}

export async function createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
  return delay(createWorkspaceRecord(input.name));
}
