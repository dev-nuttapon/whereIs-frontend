import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/api/notification.api';
import { queryKeys } from '@/lib/queryKeys';

export function useNotifications(wsId: string) {
  return useQuery({
    queryKey: queryKeys.notifications(wsId),
    queryFn: () => getNotifications(wsId),
    enabled: Boolean(wsId),
  });
}

export function useMarkNotificationRead(wsId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications(wsId) }),
  });
}

export function useMarkAllNotificationsRead(wsId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(wsId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications(wsId) }),
  });
}
