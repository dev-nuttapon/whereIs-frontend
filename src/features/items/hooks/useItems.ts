import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adjustStockVariance,
  borrowItem,
  countItemStock,
  createItem,
  disposeItem,
  getActivity,
  getItem,
  getItemEvents,
  markFoundItem,
  markMissingItem,
  moveItem,
  repairItem,
  reserveItem,
  returnItem,
  restockItemStock,
  searchItems,
  withdrawItem,
  consumeItemStock,
  updateItem,
  type CreateItemInput,
  type AdjustStockInput,
  type DisposeInput,
  type MarkFoundInput,
  type MoveItemInput,
  type ReturnInput,
  type UpdateItemInput,
  type BorrowInput,
  type WithdrawInput,
  type ReserveInput,
  type RepairInput,
} from '@/api/item.api';
import { queryKeys } from '@/lib/queryKeys';
import type { SearchItemsParams } from '@/api/item.api';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

function invalidateItemWorkspaceQueries(queryClient: ReturnType<typeof useQueryClient>, wsId: string, itemId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.items.all(wsId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(wsId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.activity(wsId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.reports(wsId) });
  if (itemId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(wsId, itemId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.items.events(wsId, itemId) });
  }
}

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
    queryKey: queryKeys.items.events(wsId, itemId),
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

export function useCreateItem(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: CreateItemInput) => createItem(wsId, input),
    onSuccess: async (item) => {
      await invalidateItemWorkspaceQueries(queryClient, wsId);
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
      await invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
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
      await invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
      pushNotification({
        variant: 'success',
        title: t('notifications.itemMoved'),
        description: item.name,
      });
    },
  });
}

export function useBorrowItemMutation(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (input: BorrowInput) => borrowItem(itemId, input),
    onSuccess: async (item) => {
      await invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
      pushNotification({
        variant: 'success',
        title: t('notifications.itemTakenOut'),
        description: item.name,
      });
    },
  });
}

export function useTakeOutItemMutation(wsId: string, itemId: string) {
  return useBorrowItemMutation(wsId, itemId);
}

export function useWithdrawItemMutation(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (input: WithdrawInput) => withdrawItem(itemId, input),
    onSuccess: async (item) => {
      await invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
      pushNotification({
        variant: 'success',
        title: t('notifications.itemMoved'),
        description: item.name,
      });
    },
  });
}

export function useReserveItemMutation(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (input: ReserveInput) => reserveItem(itemId, input),
    onSuccess: async (item) => {
      await invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
      pushNotification({
        variant: 'info',
        title: t('items.detail.reserve'),
        description: item.name,
      });
    },
  });
}

export function useRepairItemMutation(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (input: RepairInput) => repairItem(itemId, input),
    onSuccess: async (item) => {
      await invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
      pushNotification({
        variant: 'info',
        title: t('items.detail.repair'),
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
      await invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
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
    mutationFn: (reason?: string) => markMissingItem(itemId, reason),
    onSuccess: async (item) => {
      await invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
      pushNotification({
        variant: 'warning',
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
      await invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
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
      await invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
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
      await invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
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
      await invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
      pushNotification({
        variant: 'info',
        title: t('items.stock.restocked'),
        description: item.name,
      });
    },
  });
}

export function useCountStockMutation(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { countedQuantity: number; note?: string }) => countItemStock(itemId, input),
    onSuccess: async () => {
      await invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
    },
  });
}

export function useAdjustStockMutation(wsId: string, itemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { variance: number; reason: string; approvalNote?: string }) => adjustStockVariance(itemId, input),
    onSuccess: async () => {
      await invalidateItemWorkspaceQueries(queryClient, wsId, itemId);
    },
  });
}
