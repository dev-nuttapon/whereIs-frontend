import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRole,
  deleteRole,
  getRole,
  listRoles,
  setRolePermissions,
  updateRole,
  type CreateRoleInput,
  type SetRolePermissionsInput,
  type UpdateRoleInput,
} from '@/api/roles.api';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useRoles(wsId: string) {
  return useQuery({
    queryKey: queryKeys.roles(wsId),
    queryFn: () => listRoles(wsId),
    enabled: Boolean(wsId),
  });
}

export function useRole(wsId: string, roleId: string) {
  return useQuery({
    queryKey: [...queryKeys.roles(wsId), roleId] as const,
    queryFn: () => getRole(wsId, roleId),
    enabled: Boolean(wsId && roleId),
  });
}

export function useCreateRole(wsId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: CreateRoleInput) => createRole(wsId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles(wsId) });
      pushNotification({ variant: 'success', title: t('notifications.roleCreated', 'สร้าง role แล้ว') });
    },
  });
}

export function useUpdateRole(wsId: string, roleId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: UpdateRoleInput) => updateRole(wsId, roleId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles(wsId) });
      await queryClient.invalidateQueries({ queryKey: [...queryKeys.roles(wsId), roleId] as const });
      pushNotification({ variant: 'success', title: t('notifications.roleUpdated', 'อัปเดต role แล้ว') });
    },
  });
}

export function useSetRolePermissions(wsId: string, roleId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: SetRolePermissionsInput) => setRolePermissions(wsId, roleId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles(wsId) });
      await queryClient.invalidateQueries({ queryKey: [...queryKeys.roles(wsId), roleId] as const });
      pushNotification({ variant: 'success', title: t('notifications.rolePermissionsUpdated', 'อัปเดตสิทธิ์ role แล้ว') });
    },
  });
}

export function useDeleteRole(wsId: string, roleId: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: () => deleteRole(wsId, roleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles(wsId) });
      pushNotification({ variant: 'success', title: t('notifications.roleDeleted', 'ลบ role แล้ว') });
    },
  });
}
