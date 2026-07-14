import { useQuery } from '@tanstack/react-query';
import { createSite, deleteSite, getSite, listSites, updateSite, type CreateSiteInput, type UpdateSiteInput } from '@/api/site.api';
import { queryKeys } from '@/lib/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useSites(wsId: string) {
  return useQuery({
    queryKey: queryKeys.sites(wsId),
    queryFn: () => listSites(wsId),
    enabled: Boolean(wsId),
  });
}

export function useSite(wsId: string, siteId: string) {
  return useQuery({
    queryKey: ['ws', wsId, 'sites', 'detail', siteId] as const,
    queryFn: () => getSite(wsId, siteId),
    enabled: Boolean(wsId && siteId),
  });
}

export function useCreateSite(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: CreateSiteInput) => createSite(wsId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.sites(wsId) });
      pushNotification({ variant: 'success', title: t('notifications.siteCreated', 'สร้าง site แล้ว') });
    },
  });
}

export function useUpdateSite(wsId: string, siteId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: UpdateSiteInput) => updateSite(wsId, siteId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.sites(wsId) });
      await queryClient.invalidateQueries({ queryKey: ['ws', wsId, 'sites', 'detail', siteId] });
      pushNotification({ variant: 'success', title: t('notifications.siteUpdated', 'อัปเดต site แล้ว') });
    },
  });
}

export function useDeleteSite(wsId: string, siteId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: () => deleteSite(wsId, siteId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.sites(wsId) });
      pushNotification({ variant: 'success', title: t('notifications.siteDeleted', 'ลบ site แล้ว') });
    },
  });
}
