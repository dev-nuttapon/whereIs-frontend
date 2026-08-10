import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface WorkspaceSelectPageShellProps {
  children?: ReactNode;
  className?: string;
}

export function WorkspaceSelectPageShell({ children, className }: WorkspaceSelectPageShellProps) {
  return <main className={cn('workspace-select-content component-stack-lg', className)}>{children}</main>;
}
