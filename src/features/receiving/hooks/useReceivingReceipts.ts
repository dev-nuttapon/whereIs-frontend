import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReceivingReceipt, listReceivingReceipts, type CreateReceivingReceiptInput } from '@/api/receiving.api';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useCreateReceivingReceipt(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: CreateReceivingReceiptInput) => createReceivingReceipt(wsId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.receivingReceipts(wsId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products(wsId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.stock.all(wsId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.assets.all(wsId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.activity(wsId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications(wsId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(wsId) }),
      ]);
      pushNotification({
        variant: 'success',
        title: t('notifications.receivingCreated', 'เพิ่มของเข้าคลังสำเร็จ'),
      });
    },
  });
}

export function useReceivingReceipts(wsId: string, pageSize = 5) {
  return useQuery({
    queryKey: [...queryKeys.receivingReceipts(wsId), 'list', pageSize] as const,
    queryFn: () => listReceivingReceipts(wsId, 1, pageSize),
    enabled: Boolean(wsId),
  });
}
