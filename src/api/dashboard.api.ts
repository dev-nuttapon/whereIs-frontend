import { client } from '@/api/client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface DashboardSummary {
  totalItems: number;
  stored: number;
  borrowed: number;
  reserved: number;
  missing: number;
  repair: number;
  lowStock: number;
  outOfStock: number;
  overdueReturn: number;
  reservationWaiting: number;
  reminderCount: number;
}

export async function getDashboardSummary(wsId: string): Promise<DashboardSummary> {
  const response = await client.get<ApiResponse<DashboardSummary>>(`/workspaces/${encodeURIComponent(wsId)}/dashboard`);
  return response.data.data;
}
