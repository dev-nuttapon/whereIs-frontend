import { useQuery } from '@tanstack/react-query';
import { createLocation, deleteLocation, getLocation, getLocationTree, listLocations, updateLocation, type CreateLocationInput, type UpdateLocationInput } from '@/api/location.api';
import { queryKeys } from '@/lib/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useLocations(wsId: string, siteId?: string | null) {
  return useQuery({
    queryKey: queryKeys.locations.bySite(wsId, siteId ?? ''),
    queryFn: () => listLocations(wsId, siteId),
    enabled: Boolean(wsId),
  });
}

export function useLocation(wsId: string, locationId: string) {
  return useQuery({
    queryKey: queryKeys.locations.detail(wsId, locationId),
    queryFn: () => getLocation(wsId, locationId),
    enabled: Boolean(wsId && locationId),
  });
}

export function useLocationTree(wsId: string, siteId: string) {
  return useQuery({
    queryKey: queryKeys.locations.tree(wsId, siteId),
    queryFn: () => getLocationTree(wsId, siteId),
    enabled: Boolean(wsId && siteId),
  });
}

export function useCreateLocation(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: CreateLocationInput) => createLocation(wsId, input),
    onSuccess: async (_location, input) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.locations.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.locations.bySite(wsId, input.siteId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.locations.tree(wsId, input.siteId) });
      pushNotification({ variant: 'success', title: t('notifications.locationCreated', 'สร้าง location แล้ว') });
    },
  });
}

export function useUpdateLocation(wsId: string, locationId: string, siteId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: UpdateLocationInput) => updateLocation(wsId, locationId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.locations.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.locations.bySite(wsId, siteId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.locations.tree(wsId, siteId) });
      pushNotification({ variant: 'success', title: t('notifications.locationUpdated', 'อัปเดต location แล้ว') });
    },
  });
}

export function useDeleteLocation(wsId: string, locationId: string, siteId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: () => deleteLocation(wsId, locationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.locations.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.locations.bySite(wsId, siteId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.locations.tree(wsId, siteId) });
      pushNotification({ variant: 'success', title: t('notifications.locationDeleted', 'ลบ location แล้ว') });
    },
  });
}
