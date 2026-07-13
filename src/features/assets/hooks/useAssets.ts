import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAsset, deleteAsset, getAsset, listAssets, updateAsset, type CreateAssetInput, type UpdateAssetInput } from '@/api/asset.api';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useAssets(wsId: string, params: Parameters<typeof listAssets>[1] = {}) {
  return useQuery({
    queryKey: queryKeys.assets.list(wsId, params as Record<string, string | number | undefined>),
    queryFn: () => listAssets(wsId, params),
    enabled: Boolean(wsId),
  });
}

export function useAsset(wsId: string, assetId: string) {
  return useQuery({
    queryKey: queryKeys.assets.detail(wsId, assetId),
    queryFn: () => getAsset(wsId, assetId),
    enabled: Boolean(wsId && assetId),
  });
}

export function useCreateAsset(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: CreateAssetInput) => createAsset(wsId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assets.all(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.itemCreated', 'Item created'),
      });
    },
  });
}

export function useUpdateAsset(wsId: string, assetId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: UpdateAssetInput) => updateAsset(wsId, assetId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assets.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.assets.detail(wsId, assetId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.itemUpdated', 'Item updated'),
      });
    },
  });
}

export function useDeleteAsset(wsId: string, assetId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: () => deleteAsset(wsId, assetId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assets.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.assets.detail(wsId, assetId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.itemDisposed', 'Item disposed'),
      });
    },
  });
}
