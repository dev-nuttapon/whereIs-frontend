import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyNotifications,
  listNotifications,
  markAllMyNotificationsRead,
  markAllNotificationsRead,
  markMyNotificationRead,
  markNotificationRead,
  type NotificationParams,
} from '@/api/notification.api';
import { queryKeys } from '@/lib/queryKeys';

export function useNotifications(wsId: string, params: NotificationParams = {}) {
  return useQuery({
    queryKey: queryKeys.notifications(wsId),
    queryFn: () => listNotifications(wsId, params),
    enabled: Boolean(wsId),
  });
}

export function useMyNotifications(params: NotificationParams = {}) {
  return useQuery({
    queryKey: queryKeys.myNotifications(),
    queryFn: () => getMyNotifications(params),
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

export function useMarkMyNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markMyNotificationRead(notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.myNotifications() });
    },
  });
}

export function useMarkAllMyNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllMyNotificationsRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.myNotifications() });
    },
  });
}
