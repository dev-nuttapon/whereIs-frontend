import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Space, Tag, Typography } from 'antd';
import { useI18n } from '@/hooks/useI18n';
import { workspaceStore } from '@/stores/workspace.store';
import { ROUTES } from '@/constants/routes';
import { UserMenu } from '@/components/layout/UserMenu';
import { PlusIcon, OpenIcon } from '@/components/ui/icons';

export interface WorkspaceSelectLayoutProps {
  children?: ReactNode;
}

export function WorkspaceSelectLayout({ children }: WorkspaceSelectLayoutProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const currentWorkspace = workspaceStore((state) => state.currentWorkspace);
  const isCreatePage = location.pathname === ROUTES.workspaceNew;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-3 py-4 sm:px-4 sm:py-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.12),_transparent_40%),radial-gradient(circle_at_top_right,_hsl(var(--foreground)/0.05),_transparent_30%)]" />
      <div className="pointer-events-none absolute left-1/2 top-20 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-6">
        <Card className="overflow-hidden border-border/70 bg-card/90 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.28)] backdrop-blur" styles={{ body: { padding: 20 } }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Typography.Text className="text-sm font-semibold tracking-tight">
                  {t('app.name')}
                </Typography.Text>
                <Tag className="border-border/70 bg-background/80 text-[0.65rem] uppercase tracking-[0.18em]">
                  {t('app.workspaceSelect')}
                </Tag>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('app.selectWorkspace')}</p>
                <p className="max-w-2xl text-xs leading-5 text-muted-foreground">
                  {isCreatePage
                    ? t('workspace.new.description')
                    : t('workspace.list.description')}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {currentWorkspace ? (
                <Button
                  size="small"
                  className="rounded-full border-border/70 bg-background/70"
                  onClick={() => navigate(ROUTES.workspaceDashboard(currentWorkspace.id))}
                >
                  <OpenIcon className="h-4 w-4" />
                  {currentWorkspace.name}
                </Button>
              ) : null}
              {isCreatePage ? (
                <Button size="small" className="rounded-full" onClick={() => navigate(ROUTES.workspaces)}>
                  <OpenIcon className="h-4 w-4" />
                  {t('common.workspaces')}
                </Button>
              ) : (
                <Button size="small" className="rounded-full" onClick={() => navigate(ROUTES.workspaceNew)}>
                  <PlusIcon className="h-4 w-4" />
                  {t('common.createWorkspace')}
                </Button>
              )}
              <UserMenu workspaceId={currentWorkspace?.id} />
            </div>
          </div>
        </Card>
        {children}
      </div>
    </div>
  );
}
