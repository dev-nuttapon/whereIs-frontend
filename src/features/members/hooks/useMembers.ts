import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptInvitation,
  getInvitationByToken,
  getMember,
  inviteMember,
  listInvitations,
  listMembers,
  lookupUserByEmail,
  removeMember,
  revokeInvitation,
  updateMemberRole,
  type InviteMemberInput,
} from '@/api/member.api';
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
    queryFn: () => getMember(wsId, memberId),
    enabled: Boolean(wsId && memberId),
  });
}

export function useInviteMember(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (input: InviteMemberInput) => inviteMember(input.workspaceId ?? wsId, input),
    onSuccess: async (invitation) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.members.all(invitation.workspaceId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all(invitation.workspaceId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.memberInvited'),
        description: invitation.email,
      });
    },
  });
}

export function useInvitations(wsId: string) {
  return useQuery({
    queryKey: queryKeys.invitations.all(wsId),
    queryFn: () => listInvitations(wsId),
    enabled: Boolean(wsId),
  });
}

export function useInvitation(token: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invitations.detail(token ?? ''),
    queryFn: () => getInvitationByToken(token!),
    enabled: Boolean(token),
  });
}

export function useLookupUserByEmail() {
  return useMutation({
    mutationFn: (email: string) => lookupUserByEmail(email),
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (token: string) => acceptInvitation(token),
    onSuccess: async (invitation) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
      await queryClient.invalidateQueries({ queryKey: queryKeys.invitations.detail(invitation.token ?? '') });
      pushNotification({
        variant: 'success',
        title: t('notifications.invitationAccepted', 'ตอบรับคำเชิญแล้ว'),
        description: invitation.email,
      });
    },
  });
}

export function useRevokeInvitation(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (invitationId: string) => revokeInvitation(wsId, invitationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all(wsId) });
      pushNotification({
        variant: 'success',
        title: t('notifications.invitationRevoked', 'ยกเลิกคำเชิญแล้ว'),
      });
    },
  });
}

export function useUpdateMemberRole(wsId: string, memberId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (role: 'admin' | 'member' | 'viewer') => updateMemberRole(wsId, memberId, role),
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
    mutationFn: () => removeMember(wsId, memberId),
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
