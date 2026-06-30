import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMemberPermissions, updateMemberPermissions, type MemberPermissionsResponse } from '@/api/permission.api';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useMemberPermissions(wsId: string, memberId: string) {
  return useQuery({
    queryKey: ['ws', wsId, 'member', memberId, 'permissions'] as const,
    queryFn: () => getMemberPermissions(memberId),
    enabled: Boolean(wsId && memberId),
  });
}

export function useUpdatePermissions(wsId: string, memberId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (overrides: Record<string, boolean>) => updateMemberPermissions(memberId, overrides),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ws', wsId, 'member', memberId, 'permissions'] });
      await queryClient.invalidateQueries({ queryKey: ['ws', wsId, 'member', memberId] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspace(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.permissionsUpdated'),
      });
    },
  });
}

export type { MemberPermissionsResponse };
