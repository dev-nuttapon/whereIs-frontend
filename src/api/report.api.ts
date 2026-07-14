import { client } from '@/api/client';
import type { ReportSummary } from '@/types/domain.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ReportParams {
  containerId?: string | null;
  kind?: string | null;
  status?: string | null;
}

export async function listReports(wsId: string, params: ReportParams = {}): Promise<ReportSummary[]> {
  const response = await client.get<ApiResponse<ReportSummary[]>>(`/workspaces/${encodeURIComponent(wsId)}/reports`, {
    params: {
      containerId: params.containerId ?? undefined,
      kind: params.kind ?? undefined,
      status: params.status ?? undefined,
    },
  });
  return response.data.data;
}

export async function downloadReports(wsId: string, params: ReportParams = {}): Promise<void> {
  await client.get(`/workspaces/${encodeURIComponent(wsId)}/reports/export`, {
    params: {
      containerId: params.containerId ?? undefined,
      kind: params.kind ?? undefined,
      status: params.status ?? undefined,
    },
    responseType: 'blob',
  });
}
