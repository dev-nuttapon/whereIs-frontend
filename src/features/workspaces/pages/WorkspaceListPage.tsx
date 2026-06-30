import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/common/PageShell';
import { ROUTES } from '@/constants/routes';
import { WorkspaceCard } from '@/components/common/WorkspaceCard';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useWorkspaces } from '@/features/workspaces/hooks/useWorkspaces';
import { useI18n } from '@/hooks/useI18n';
import { DashboardIcon, PlusIcon } from '@/components/ui/icons';

export function WorkspaceListPage() {
  const workspacesQuery = useWorkspaces();
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <PageShell title={t('workspace.list.title')} description={t('workspace.list.description')}>
      <div className="flex justify-end">
        <Button asChild>
          <Link to={ROUTES.workspaceNew}>
            <PlusIcon className="h-4 w-4" />
            {t('workspace.list.create')}
          </Link>
        </Button>
      </div>

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workspacesQuery.data?.map((workspace) => (
          <WorkspaceCard key={workspace.id} workspace={workspace} />
        ))}
      </div>
    </PageShell>
  );
}
