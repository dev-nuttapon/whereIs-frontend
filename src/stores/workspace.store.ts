import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Workspace } from '@/types/domain.types';

interface WorkspaceState {
  currentWorkspaceId: string | null;
  currentWorkspace: Workspace | null;
  permissions: string[];
  setWorkspace: (workspace: Workspace) => void;
  clear: () => void;
}

export const workspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      currentWorkspaceId: null,
      currentWorkspace: null,
      permissions: [],
      setWorkspace: (workspace) =>
        set({
          currentWorkspaceId: workspace.id,
          currentWorkspace: workspace,
          permissions: [...workspace.permissions],
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
