import type { ReactNode } from 'react';
import { Tag, Typography } from 'antd';
import { useI18n } from '@/hooks/useI18n';
import { workspaceStore } from '@/stores/workspace.store';
import { UserMenu } from '@/components/layout/UserMenu';

export interface WorkspaceSelectLayoutProps {
  children?: ReactNode;
}

export function WorkspaceSelectLayout({ children }: WorkspaceSelectLayoutProps) {
  const { t } = useI18n();
  const currentWorkspace = workspaceStore((state) => state.currentWorkspace);

  return (
    <div className="app-background relative min-h-screen overflow-hidden px-3 py-4 sm:px-6 sm:py-8">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="flex items-center justify-between gap-3 rounded-full border border-border/70 bg-card/82 px-4 py-2.5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Typography.Text className="shrink-0 text-sm font-semibold tracking-tight">
              {t('app.name')}
            </Typography.Text>
            <Tag className="hidden border-border/70 bg-background/80 text-[0.65rem] uppercase tracking-[0.18em] sm:inline-flex">
              {t('app.workspaceSelect')}
            </Tag>
            {currentWorkspace ? (
              <span className="hidden min-w-0 truncate text-xs text-muted-foreground md:inline">
                {currentWorkspace.name}
              </span>
            ) : null}
          </div>
          <UserMenu workspaceId={currentWorkspace?.id} />
        </header>
        {children}
      </div>
    </div>
  );
}
