import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createItem,
  deleteItem,
  getItem,
  listItemEvents,
  listItems,
  updateItem,
  type CreateItemInput,
  type ListItemsParams,
  type UpdateItemInput,
} from '@/api/item.api';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

function invalidateItemWorkspaceQueries(queryClient: ReturnType<typeof useQueryClient>, wsId: string, itemId?: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.items.all(wsId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(wsId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.activity(wsId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.reports(wsId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications(wsId) });
  if (itemId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(wsId, itemId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.items.events(wsId, itemId) });
  }
}

export function useItems(wsId: string, params: ListItemsParams = {}) {
  return useQuery({
    queryKey: queryKeys.items.list(wsId, params as Record<string, string | number | undefined>),
    queryFn: () => listItems(wsId, params),
    enabled: Boolean(wsId),
  });
}

export function useItem(wsId: string, itemId: string) {
  return useQuery({
    queryKey: queryKeys.items.detail(wsId, itemId),
    queryFn: () => getItem(wsId, itemId),
    enabled: Boolean(wsId && itemId),
  });
}

export function useItemEvents(wsId: string, itemId: string) {
  return useQuery({
    queryKey: queryKeys.items.events(wsId, itemId),
    queryFn: () => listItemEvents(wsId, itemId),
    enabled: Boolean(wsId && itemId),
  });
}

export function useCreateItem(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: CreateItemInput) => createItem(wsId, input),
    onSuccess: async () => {
      invalidateItemWorkspaceQueries(queryClient, wsId);
      pushNotification({
        variant: 'success',
        title: t('notifications.itemCreated', 'สร้าง item แล้ว'),
      });
    },
  });
}

export function useUpdateItem(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: UpdateItemInput) => updateItem(wsId, itemId, input),
    onSuccess: async () => {
      invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
      pushNotification({
        variant: 'success',
        title: t('notifications.itemUpdated', 'อัปเดต item แล้ว'),
      });
    },
  });
}

export function useDeleteItem(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: () => deleteItem(wsId, itemId),
    onSuccess: async () => {
      invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
      pushNotification({
        variant: 'success',
        title: t('notifications.itemDisposed', 'จำหน่าย item แล้ว'),
      });
    },
  });
}
