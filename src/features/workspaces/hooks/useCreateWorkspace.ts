import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createWorkspace, type CreateWorkspaceInput } from '@/api/workspace.api';
import { queryKeys } from '@/lib/queryKeys';
import { workspaceStore } from '@/stores/workspace.store';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setWorkspace = workspaceStore((state) => state.setWorkspace);
  const { t } = useI18n();

  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => createWorkspace(input),
    onSuccess: async (workspace) => {
      setWorkspace(workspace);
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
      pushNotification({
        variant: 'success',
        title: t('notifications.workspaceCreated'),
        description: workspace.name,
      });
      navigate(ROUTES.workspaceDashboard(workspace.id));
    },
  });
}
