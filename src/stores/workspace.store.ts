import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Workspace } from '@/types/domain.types';
import { MOCK_PERMISSIONS, MOCK_WORKSPACES } from '@/mocks/mock-data';

interface WorkspaceState {
  currentWorkspaceId: string | null;
  currentWorkspace: Workspace | null;
  permissions: string[];
  setWorkspace: (workspace: Workspace) => void;
  clear: () => void;
}

const initialWorkspace = MOCK_WORKSPACES[0];

export const workspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      currentWorkspaceId: initialWorkspace.id,
      currentWorkspace: initialWorkspace,
      permissions: initialWorkspace.permissions.length > 0 ? initialWorkspace.permissions : MOCK_PERMISSIONS,
      setWorkspace: (workspace) =>
        set({
          currentWorkspaceId: workspace.id,
          currentWorkspace: workspace,
          permissions: workspace.permissions.length > 0 ? workspace.permissions : MOCK_PERMISSIONS,
        }),
      clear: () =>
        set({
          currentWorkspaceId: null,
          currentWorkspace: null,
          permissions: [],
        }),
    }),
    {
      name: 'whereis-workspace',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentWorkspaceId: state.currentWorkspaceId,
        currentWorkspace: state.currentWorkspace,
        permissions: state.permissions,
      }),
    },
  ),
);

export type { WorkspaceState };
