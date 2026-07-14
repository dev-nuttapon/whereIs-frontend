import { client } from '@/api/client';
import type { Notification } from '@/types/domain.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface NotificationParams {
  page?: number;
  limit?: number;
}

export async function listNotifications(wsId: string, params: NotificationParams = {}): Promise<PagedResult<Notification>> {
  const response = await client.get<ApiResponse<PagedResult<Notification>>>(`/workspaces/${encodeURIComponent(wsId)}/notifications`, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });
  return response.data.data;
}

export async function markNotificationRead(wsId: string, notificationId: string): Promise<Notification> {
  const response = await client.post<ApiResponse<Notification>>(`/workspaces/${encodeURIComponent(wsId)}/notifications/${encodeURIComponent(notificationId)}/read`);
  return response.data.data;
}

export async function markAllNotificationsRead(wsId: string): Promise<{ success: true }> {
  await client.post(`/workspaces/${encodeURIComponent(wsId)}/notifications/read-all`);
  return { success: true };
}
