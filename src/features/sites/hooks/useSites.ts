import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSite, deleteSite, getSite, listSites, updateSite, type UpsertSiteInput } from '@/api/site.api';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useSites(wsId: string) {
  return useQuery({
    queryKey: ['ws', wsId, 'sites'] as const,
    queryFn: () => listSites(wsId),
    enabled: Boolean(wsId),
  });
}

export function useSite(wsId: string, siteId: string) {
  return useQuery({
    queryKey: ['ws', wsId, 'site', siteId] as const,
    queryFn: () => getSite(siteId),
    enabled: Boolean(wsId && siteId),
  });
}

export function useCreateSite(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (input: UpsertSiteInput) => createSite(wsId, input),
    onSuccess: async (site) => {
      await queryClient.invalidateQueries({ queryKey: ['ws', wsId, 'sites'] });
      pushNotification({
        variant: 'success',
        title: t('notifications.siteCreated'),
        description: site.name,
      });
    },
  });
}

export function useUpdateSite(wsId: string, siteId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (input: UpsertSiteInput) => updateSite(wsId, siteId, input),
    onSuccess: async (site) => {
      await queryClient.invalidateQueries({ queryKey: ['ws', wsId, 'sites'] });
      await queryClient.invalidateQueries({ queryKey: ['ws', wsId, 'site', siteId] });
      pushNotification({
        variant: 'success',
        title: t('notifications.siteUpdated'),
        description: site.name,
      });
    },
  });
}

export function useDeleteSite(wsId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteSite(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ws', wsId, 'sites'] });
    },
  });
}
