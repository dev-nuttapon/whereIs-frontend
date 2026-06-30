import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { workspaceStore } from '@/stores/workspace.store';
import { Select } from '@/components/ui/select';
import { ROUTES } from '@/constants/routes';
import { ChevronDownIcon } from '@/components/ui/icons';
import { useWorkspaces } from '@/features/workspaces/hooks/useWorkspaces';
import { MOCK_WORKSPACES } from '@/mocks/mock-data';

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const currentWorkspace = workspaceStore((state) => state.currentWorkspace);
  const setWorkspace = workspaceStore((state) => state.setWorkspace);
  const workspacesQuery = useWorkspaces();
  const workspaces = useMemo(() => workspacesQuery.data ?? MOCK_WORKSPACES, [workspacesQuery.data]);

  return (
    <div className="relative">
      <Select
        className="h-14 w-full appearance-none rounded-full border-border/70 bg-card/80 pl-5 pr-12 text-[0.95rem] shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_1px_4px_rgba(15,23,42,0.08)] backdrop-blur"
        value={currentWorkspace?.id ?? workspaces[0]?.id ?? MOCK_WORKSPACES[0].id}
        onChange={(event) => {
          const workspace = workspaces.find((item) => item.id === event.target.value);
          if (!workspace) {
            return;
          }
          setWorkspace(workspace);
          navigate(ROUTES.workspaceDashboard(workspace.id));
        }}
      >
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name}
          </option>
        ))}
      </Select>
      <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/70" />
    </div>
  );
}
