import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listNotifications, markAllNotificationsRead, markNotificationRead, type NotificationParams } from '@/api/notification.api';
import { queryKeys } from '@/lib/queryKeys';

export function useNotifications(wsId: string, params: NotificationParams = {}) {
  return useQuery({
    queryKey: queryKeys.notifications(wsId),
    queryFn: () => listNotifications(wsId, params),
    enabled: Boolean(wsId),
  });
}

export function useMarkNotificationRead(wsId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(wsId, notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications(wsId) });
    },
  });
}

export function useMarkAllNotificationsRead(wsId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(wsId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications(wsId) });
    },
  });
}
