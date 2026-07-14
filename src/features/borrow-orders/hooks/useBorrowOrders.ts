import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveBorrowOrder,
  cancelBorrowOrder,
  checkOutBorrowOrder,
  createBorrowOrder,
  getBorrowOrder,
  listBorrowOrders,
  rejectBorrowOrder,
  returnBorrowOrder,
  type CancelBorrowOrderInput,
  type CreateBorrowOrderInput,
  type ReturnBorrowOrderInput,
  type ReviewBorrowOrderInput,
} from '@/api/borrow-order.api';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useBorrowOrders(
  wsId: string,
  params: { requestedBy?: string | null; status?: string | null; page?: number; pageSize?: number } = {},
) {
  return useQuery({
    queryKey: [...queryKeys.borrowOrders.all(wsId), params] as const,
    queryFn: () => listBorrowOrders(wsId, params),
    enabled: Boolean(wsId),
  });
}

export function useBorrowOrder(wsId: string, orderId: string) {
  return useQuery({
    queryKey: queryKeys.borrowOrders.detail(wsId, orderId),
    queryFn: () => getBorrowOrder(wsId, orderId),
    enabled: Boolean(wsId && orderId),
  });
}

export function useCreateBorrowOrder(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: CreateBorrowOrderInput) => createBorrowOrder(wsId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.borrowOrders.all(wsId) });
      pushNotification({ variant: 'success', title: t('notifications.borrowOrderCreated', 'สร้าง borrow order แล้ว') });
    },
  });
}

export function useApproveBorrowOrder(wsId: string, orderId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: ReviewBorrowOrderInput = {}) => approveBorrowOrder(wsId, orderId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.borrowOrders.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.borrowOrders.detail(wsId, orderId) });
      pushNotification({ variant: 'success', title: t('notifications.borrowOrderApproved', 'อนุมัติ borrow order แล้ว') });
    },
  });
}

export function useRejectBorrowOrder(wsId: string, orderId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: ReviewBorrowOrderInput = {}) => rejectBorrowOrder(wsId, orderId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.borrowOrders.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.borrowOrders.detail(wsId, orderId) });
      pushNotification({ variant: 'success', title: t('notifications.borrowOrderRejected', 'ปฏิเสธ borrow order แล้ว') });
    },
  });
}

export function useCheckOutBorrowOrder(wsId: string, orderId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: () => checkOutBorrowOrder(wsId, orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.borrowOrders.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.borrowOrders.detail(wsId, orderId) });
      pushNotification({ variant: 'success', title: t('notifications.borrowOrderCheckedOut', 'รับของออกแล้ว') });
    },
  });
}

export function useReturnBorrowOrder(wsId: string, orderId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: ReturnBorrowOrderInput) => returnBorrowOrder(wsId, orderId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.borrowOrders.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.borrowOrders.detail(wsId, orderId) });
      pushNotification({ variant: 'success', title: t('notifications.borrowOrderReturned', 'คืนของแล้ว') });
    },
  });
}

export function useCancelBorrowOrder(wsId: string, orderId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: CancelBorrowOrderInput = {}) => cancelBorrowOrder(wsId, orderId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.borrowOrders.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.borrowOrders.detail(wsId, orderId) });
      pushNotification({ variant: 'success', title: t('notifications.borrowOrderCancelled', 'ยกเลิก borrow order แล้ว') });
    },
  });
}
