import type { ReactNode } from 'react';
import { Tag, Typography } from 'antd';
import { useI18n } from '@/hooks/useI18n';
import { UserMenu } from '@/components/layout/UserMenu';
import { ThemeSelector } from '@/components/layout/ThemeSelector';

export interface WorkspaceSelectLayoutProps {
  children?: ReactNode;
}

export function WorkspaceSelectLayout({ children }: WorkspaceSelectLayoutProps) {
  const { t } = useI18n();

  return (
    <div className="app-background relative min-h-screen overflow-hidden px-3 py-4 sm:px-6 sm:py-8">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="flex items-center justify-between gap-3 rounded-full border border-border/70 bg-card/82 px-4 py-2.5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <svg
              className="h-7 w-7 shrink-0 text-teal-600"
              viewBox="0 0 48 48"
              fill="none"
              role="img"
              aria-label="WhereIs logo"
            >
              <path
                d="M24 42s13-12.1 13-23A13 13 0 1 0 11 19c0 10.9 13 23 13 23Z"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="24" cy="19" r="4" stroke="currentColor" strokeWidth="3" />
            </svg>
            <Typography.Text className="shrink-0 text-sm font-semibold tracking-tight">
              {t('app.name')}
            </Typography.Text>
            <Tag className="hidden border-border/70 bg-background/80 text-[0.65rem] uppercase tracking-[0.18em] sm:inline-flex">
              {t('app.workspaceSelect')}
            </Tag>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSelector compact />
            <UserMenu />
          </div>
        </header>
        <div className="workspace-select-frame">{children}</div>
      </div>
    </div>
  );
}
