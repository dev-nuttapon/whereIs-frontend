import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select as AntSelect } from 'antd';
import { workspaceStore } from '@/stores/workspace.store';
import { ROUTES } from '@/constants/routes';
import { useWorkspaces } from '@/features/workspaces/hooks/useWorkspaces';
import { MOCK_WORKSPACES } from '@/mocks/mock-data';
import { WorkspaceIcon } from '@/components/ui/icons';

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const currentWorkspace = workspaceStore((state) => state.currentWorkspace);
  const setWorkspace = workspaceStore((state) => state.setWorkspace);
  const workspacesQuery = useWorkspaces();
  const workspaces = useMemo(() => workspacesQuery.data ?? MOCK_WORKSPACES, [workspacesQuery.data]);

  return (
    <AntSelect
      className="w-full"
      size="large"
      value={currentWorkspace?.id ?? workspaces[0]?.id ?? MOCK_WORKSPACES[0].id}
      onChange={(value) => {
        const workspace = workspaces.find((item) => item.id === value);
        if (!workspace) {
          return;
        }
        setWorkspace(workspace);
        navigate(ROUTES.workspaceDashboard(workspace.id));
      }}
      options={workspaces.map((workspace) => ({
        value: workspace.id,
        label: (
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <WorkspaceIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{workspace.name}</div>
              <div className="truncate text-xs text-muted-foreground">{workspace.myRole}</div>
            </div>
          </div>
        ),
      }))}
    />
  );
}
