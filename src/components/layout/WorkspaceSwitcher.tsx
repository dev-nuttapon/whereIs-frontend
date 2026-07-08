import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select as AntSelect } from 'antd';
import { workspaceStore } from '@/stores/workspace.store';
import { ROUTES } from '@/constants/routes';
import { useWorkspaces } from '@/features/workspaces/hooks/useWorkspaces';
import { MOCK_WORKSPACES } from '@/mocks/mock-data';

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const currentWorkspace = workspaceStore((state) => state.currentWorkspace);
  const setWorkspace = workspaceStore((state) => state.setWorkspace);
  const workspacesQuery = useWorkspaces();
  const workspaces = useMemo(() => workspacesQuery.data ?? MOCK_WORKSPACES, [workspacesQuery.data]);
  const options = workspaces.map((workspace) => ({
    label: workspace.name,
    value: workspace.id,
  }));

  return (
    <AntSelect
      className="w-full"
      size="large"
      options={options}
      value={currentWorkspace?.id ?? workspaces[0]?.id ?? MOCK_WORKSPACES[0].id}
      onChange={(value) => {
        const workspace = workspaces.find((item) => item.id === value);
        if (!workspace) {
          return;
        }
        setWorkspace(workspace);
        navigate(ROUTES.workspaceDashboard(workspace.id));
      }}
    />
  );
}
