import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCategory, deleteCategory, listCategories, updateCategory, type CreateCategoryInput, type UpdateCategoryInput } from '@/api/category.api';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useCategories(wsId: string, page = 1, pageSize = 100) {
  return useQuery({
    queryKey: [...queryKeys.categories(wsId), page, pageSize],
    queryFn: () => listCategories(wsId, page, pageSize),
    enabled: Boolean(wsId),
  });
}

export function useCreateCategory(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(wsId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.categoryCreated', 'สร้าง category แล้ว'),
      });
    },
  });
}

export function useUpdateCategory(wsId: string, categoryId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => updateCategory(wsId, categoryId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.categoryUpdated', 'อัปเดต category แล้ว'),
      });
    },
  });
}

export function useDeleteCategory(wsId: string, categoryId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: () => deleteCategory(wsId, categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.categoryDeleted', 'ลบ category แล้ว'),
      });
    },
  });
}
