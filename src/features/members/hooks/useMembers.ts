import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMember, inviteMember, listMembers, removeMember, updateMemberRole, type InviteMemberInput } from '@/api/member.api';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useMembers(wsId: string) {
  return useQuery({
    queryKey: queryKeys.members.all(wsId),
    queryFn: () => listMembers(wsId),
    enabled: Boolean(wsId),
  });
}

export function useMember(wsId: string, memberId: string) {
  return useQuery({
    queryKey: queryKeys.members.detail(wsId, memberId),
    queryFn: () => getMember(memberId),
    enabled: Boolean(wsId && memberId),
  });
}

export function useInviteMember(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (input: InviteMemberInput) => inviteMember(wsId, input),
    onSuccess: async (member) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.members.all(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.memberInvited'),
        description: member.user.email,
      });
    },
  });
}

export function useUpdateMemberRole(wsId: string, memberId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (role: 'admin' | 'member' | 'viewer') => updateMemberRole(memberId, role),
    onSuccess: async (member) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.members.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.members.detail(wsId, memberId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspace(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.memberRoleUpdated'),
        description: member.user.name,
      });
    },
  });
}

export function useRemoveMember(wsId: string, memberId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: () => removeMember(memberId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.members.all(wsId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.members.detail(wsId, memberId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.memberRemoved'),
      });
    },
  });
}
