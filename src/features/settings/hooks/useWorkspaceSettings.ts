import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getWorkspaceSettings, updateWorkspaceSettings, type UpdateWorkspaceSettingsInput } from '@/api/settings.api';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useWorkspaceSettings(wsId: string) {
  return useQuery({
    queryKey: queryKeys.settings(wsId),
    queryFn: () => getWorkspaceSettings(wsId),
    enabled: Boolean(wsId),
  });
}

export function useUpdateWorkspaceSettings(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: UpdateWorkspaceSettingsInput) => updateWorkspaceSettings(wsId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.settingsUpdated', 'อัปเดต workspace settings แล้ว'),
      });
    },
  });
}
