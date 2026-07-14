import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adjustStock, listStockEntries, type AdjustStockInput } from '@/api/stock.api';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useStockEntries(
  wsId: string,
  params: { productId?: string | null; locationId?: string | null; page?: number; pageSize?: number } = {},
) {
  return useQuery({
    queryKey: queryKeys.stock.list(wsId, params as Record<string, string | number | undefined>),
    queryFn: () => listStockEntries(wsId, params),
    enabled: Boolean(wsId),
  });
}

export function useAdjustStock(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: AdjustStockInput) => adjustStock(wsId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.stock.all(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.stockAdjusted', 'อัปเดต stock แล้ว'),
      });
    },
  });
}
