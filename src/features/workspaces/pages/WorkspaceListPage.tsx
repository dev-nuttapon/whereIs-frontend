import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { WorkspaceCard } from '@/components/common/WorkspaceCard';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useWorkspaces } from '@/features/workspaces/hooks/useWorkspaces';
import { useI18n } from '@/hooks/useI18n';
import { DashboardIcon, OpenIcon, PlusIcon } from '@/components/ui/icons';
import { workspaceStore } from '@/stores/workspace.store';

export function WorkspaceListPage() {
  const workspacesQuery = useWorkspaces();
  const navigate = useNavigate();
  const { t } = useI18n();
  const currentWorkspace = workspaceStore((state) => state.currentWorkspace);
  const workspaces = workspacesQuery.data ?? [];
  const workspaceCount = workspaces.length;

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button asChild size="lg" className="w-full rounded-full px-5 sm:w-auto">
          <Link to={ROUTES.workspaceNew}>
            <PlusIcon className="h-4 w-4" />
            {t('workspace.list.create')}
          </Link>
        </Button>
        {currentWorkspace ? (
          <Button asChild variant="outline" size="lg" className="w-full rounded-full border-border/70 bg-background/70 px-5 sm:w-auto">
            <Link to={ROUTES.workspaceDashboard(currentWorkspace.id)}>
              <OpenIcon className="h-4 w-4" />
              {t('workspace.list.continue')}
            </Link>
          </Button>
        ) : null}
      </div>

      <Card className="border-border/70 bg-background/70 backdrop-blur">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t('workspace.list.summaryLabel')}
            </p>
            <p className="text-sm text-muted-foreground">{t('workspace.list.description')}</p>
          </div>
          <div className="space-y-1 rounded-2xl border border-border/70 bg-card p-4">
            <p className="text-sm text-muted-foreground">{t('workspace.list.current')}</p>
            <p className="truncate text-lg font-semibold">{currentWorkspace?.name ?? t('workspace.list.emptyTitle')}</p>
            <p className="text-sm text-muted-foreground">
              {currentWorkspace ? `${t('workspace.card.role')}: ${currentWorkspace.myRole}` : t('workspace.list.emptyDescription')}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('workspace.list.live')}</p>
              <p className="mt-1 text-xl font-semibold">{workspaceCount}</p>
              <p className="text-sm text-muted-foreground">{t('workspace.list.summaryLabel')}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('workspace.list.next')}</p>
              <p className="mt-1 text-xl font-semibold">{currentWorkspace ? t('workspace.list.continue') : t('workspace.list.create')}</p>
              <p className="text-sm text-muted-foreground">{t('workspace.list.tapToOpen')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {workspacesQuery.isLoading ? <LoadingState label={t('common.loadingWorkspaces')} /> : null}
      {workspacesQuery.isError ? (
        <ErrorState message={t('workspace.list.error')} onRetry={() => workspacesQuery.refetch()} />
      ) : null}

      {workspacesQuery.data?.length === 0 ? (
        <EmptyState
          title={t('workspace.list.emptyTitle')}
          description={t('workspace.list.emptyDescription')}
          actionLabel={t('workspace.list.create')}
          onAction={() => navigate(ROUTES.workspaceNew)}
          icon={<DashboardIcon className="h-5 w-5" />}
        />
      ) : null}

      {workspaces.length > 0 ? (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
