import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct, deleteProduct, listProducts, updateProduct, type CreateProductInput, type UpdateProductInput } from '@/api/product.api';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useProducts(wsId: string) {
  return useQuery({
    queryKey: queryKeys.products(wsId),
    queryFn: () => listProducts(wsId),
    enabled: Boolean(wsId),
  });
}

export function useCreateProduct(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(wsId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.products(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.productCreated', 'สร้าง product แล้ว'),
      });
    },
  });
}

export function useUpdateProduct(wsId: string, productId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: UpdateProductInput) => updateProduct(wsId, productId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.products(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.productUpdated', 'อัปเดต product แล้ว'),
      });
    },
  });
}

export function useDeleteProduct(wsId: string, productId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: () => deleteProduct(wsId, productId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.products(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.productDeleted', 'ลบ product แล้ว'),
      });
    },
  });
}
