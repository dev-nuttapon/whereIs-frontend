import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createItem,
  getActivity,
  getItem,
  getItemEvents,
  disposeItem,
  consumeItemStock,
  markFoundItem,
  markMissingItem,
  moveItem,
  returnItem,
  restockItemStock,
  searchItems,
  takeOutItem,
  updateItem,
  type CreateItemInput,
  type AdjustStockInput,
  type DisposeInput,
  type MarkFoundInput,
  type MoveItemInput,
  type ReturnInput,
  type TakeOutInput,
  type UpdateItemInput,
} from '@/api/item.api';
import { queryKeys } from '@/lib/queryKeys';
import type { SearchItemsParams } from '@/api/item.api';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useSearchItems(wsId: string, params: SearchItemsParams) {
  return useQuery({
    queryKey: queryKeys.items.list(wsId, params),
    queryFn: () => searchItems({ ...params, workspaceId: wsId }),
    enabled: Boolean(wsId),
  });
}

export function useItem(wsId: string, itemId: string) {
  return useQuery({
    queryKey: queryKeys.items.detail(wsId, itemId),
    queryFn: () => getItem(itemId),
    enabled: Boolean(wsId && itemId),
  });
}

export function useItemEvents(wsId: string, itemId: string) {
  return useQuery({
    queryKey: ['ws', wsId, 'items', itemId, 'events'] as const,
    queryFn: () => getItemEvents(itemId),
    enabled: Boolean(wsId && itemId),
  });
}

export function useActivity(wsId: string) {
  return useQuery({
    queryKey: queryKeys.activity(wsId),
    queryFn: () => getActivity(wsId),
    enabled: Boolean(wsId),
  });
}

export function useInvalidateItems(wsId: string) {
  const queryClient = useQueryClient();
  return {
    invalidateAll: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all(wsId) });
    },
  };
}

export function useCreateItem(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: CreateItemInput) => createItem(wsId, input),
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activity(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.itemCreated'),
        description: item.name,
      });
    },
  });
}

export function useUpdateItem(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: UpdateItemInput) => updateItem(itemId, input),
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(wsId, itemId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activity(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.itemUpdated'),
        description: item.name,
      });
    },
  });
}

export function useMoveItem(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (input: MoveItemInput) => moveItem(itemId, input),
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(wsId, itemId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activity(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.itemMoved'),
        description: item.name,
      });
    },
  });
}

export function useTakeOutItemMutation(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (input: TakeOutInput) => takeOutItem(itemId, input),
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(wsId, itemId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activity(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.itemTakenOut'),
        description: item.name,
      });
    },
  });
}

export function useReturnItemMutation(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (input: ReturnInput) => returnItem(itemId, input),
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(wsId, itemId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activity(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.itemReturned'),
        description: item.name,
      });
    },
  });
}

export function useMarkMissingItemMutation(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: () => markMissingItem(itemId),
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(wsId, itemId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activity(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.itemMarkedMissing'),
        description: item.name,
      });
    },
  });
}

export function useMarkFoundItemMutation(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (input: MarkFoundInput) => markFoundItem(itemId, input),
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(wsId, itemId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activity(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.itemMarkedFound'),
        description: item.name,
      });
    },
  });
}

export function useDisposeItemMutation(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (input: DisposeInput) => disposeItem(itemId, input),
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(wsId, itemId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activity(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.itemDisposed'),
        description: item.name,
      });
    },
  });
}

export function useConsumeStockMutation(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (input: AdjustStockInput) => consumeItemStock(itemId, input),
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(wsId, itemId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activity(wsId) });
      pushNotification({
        variant: item.quantity === 0 ? 'error' : 'success',
        title: item.quantity === 0 ? t('items.stock.outOfStock') : t('items.stock.used'),
        description: item.name,
      });
    },
  });
}

export function useRestockStockMutation(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (input: AdjustStockInput) => restockItemStock(itemId, input),
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(wsId, itemId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activity(wsId) });
      pushNotification({
        variant: 'info',
        title: t('items.stock.restocked'),
        description: item.name,
      });
    },
  });
}
