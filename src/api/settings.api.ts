import { client } from '@/api/client';
import type { WorkspaceSettings } from '@/types/domain.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface UpdateWorkspaceSettingsInput {
  timezone: string;
  defaultUnit?: string | null;
  borrowRequiresApproval?: boolean;
}

export async function getWorkspaceSettings(wsId: string): Promise<WorkspaceSettings> {
  const response = await client.get<ApiResponse<WorkspaceSettings>>(`/workspaces/${encodeURIComponent(wsId)}/settings`);
  return response.data.data;
}

export async function updateWorkspaceSettings(
  wsId: string,
  input: UpdateWorkspaceSettingsInput,
): Promise<WorkspaceSettings> {
  const response = await client.put<ApiResponse<WorkspaceSettings>>(`/workspaces/${encodeURIComponent(wsId)}/settings`, {
    timezone: input.timezone,
    defaultUnit: input.defaultUnit ?? null,
    borrowRequiresApproval: input.borrowRequiresApproval ?? true,
  });
  return response.data.data;
}
