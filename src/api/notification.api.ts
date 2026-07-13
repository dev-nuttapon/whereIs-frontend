import type { Notification } from '@/types/domain.types';
import { listNotifications as listNotificationsRecord, markAllNotificationsRead as markAllNotificationsReadRecord, markNotificationRead as markNotificationReadRecord } from '@/mocks/demo-db';
import { delay } from '@/utils/mock-api';

export async function getNotifications(wsId: string): Promise<Notification[]> {
  return delay(listNotificationsRecord(wsId));
}

export async function markNotificationRead(id: string): Promise<Notification> {
  return delay(markNotificationReadRecord(id));
}

export async function markAllNotificationsRead(wsId: string): Promise<{ success: true }> {
  return delay(markAllNotificationsReadRecord(wsId));
}
