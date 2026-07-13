import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContainer,
  deleteContainer,
  getContainer,
  listContainers,
  updateContainer,
  type CreateContainerInput,
} from '@/api/container.api';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useContainers(wsId: string) {
  return useQuery({
    queryKey: queryKeys.containers.all(wsId),
    queryFn: () => listContainers(wsId),
    enabled: Boolean(wsId),
  });
}

export function useContainer(wsId: string, containerId: string) {
  return useQuery({
    queryKey: queryKeys.containers.detail(wsId, containerId),
    queryFn: () => getContainer(wsId, containerId),
    enabled: Boolean(wsId && containerId),
  });
}

export function useCreateContainer(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: CreateContainerInput) => createContainer(wsId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.containers.all(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.containerCreated', 'สร้าง container แล้ว'),
      });
    },
  });
}

export function useUpdateContainer(wsId: string, containerId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: Pick<CreateContainerInput, 'name' | 'type' | 'code' | 'qrCode'>) => updateContainer(wsId, containerId, input),
    onSuccess: async (container) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.containers.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.containers.detail(wsId, containerId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.containerUpdated', 'อัปเดต container แล้ว'),
        description: container.name,
      });
    },
  });
}

export function useDeleteContainer(wsId: string, containerId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: () => deleteContainer(wsId, containerId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.containers.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.containers.detail(wsId, containerId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.containerDeleted', 'ลบ container แล้ว'),
      });
    },
  });
}
