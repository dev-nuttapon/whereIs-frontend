import { client } from '@/api/client';
import type { Notification } from '@/types/domain.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface NotificationListResult {
  items: Notification[];
  page: number;
  limit: number;
  total: number;
  unreadCount: number;
}

export interface NotificationParams {
  page?: number;
  limit?: number;
}

export async function listNotifications(wsId: string, params: NotificationParams = {}): Promise<NotificationListResult> {
  const response = await client.get<ApiResponse<NotificationListResult>>(`/workspaces/${encodeURIComponent(wsId)}/notifications`, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });
  return response.data.data;
}

export async function getMyNotifications(params: NotificationParams = {}): Promise<NotificationListResult> {
  const response = await client.get<ApiResponse<NotificationListResult>>('/notifications/me', {
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

export async function markMyNotificationRead(notificationId: string): Promise<Notification> {
  const response = await client.post<ApiResponse<Notification>>(`/notifications/me/${encodeURIComponent(notificationId)}/read`);
  return response.data.data;
}

export async function markAllMyNotificationsRead(): Promise<{ success: true }> {
  await client.post('/notifications/me/read-all');
  return { success: true };
}
