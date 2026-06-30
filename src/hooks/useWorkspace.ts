import { workspaceStore } from '@/stores/workspace.store';
import type { WorkspaceState } from '@/stores/workspace.store';

export function useWorkspace(): WorkspaceState {
  return workspaceStore();
}
