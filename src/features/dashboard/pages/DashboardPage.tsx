import { useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { useMembers } from '@/features/members/hooks/useMembers';
import { useWorkspace } from '@/features/workspaces/hooks/useWorkspace';
import { useI18n } from '@/hooks/useI18n';
import { workspaceStore } from '@/stores/workspace.store';

export function DashboardPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t, locale } = useI18n();
  const workspaceQuery = useWorkspace(wsId);
  const containersQuery = useContainers(wsId);
  const membersQuery = useMembers(wsId);
  const currentWorkspace = workspaceStore((state) => state.currentWorkspace);

  const workspace = workspaceQuery.data ?? currentWorkspace;
  const containers = containersQuery.data ?? [];
  const members = membersQuery.data ?? [];

  const summaryCards = [
    { label: t('dashboard.workspace', 'Workspace'), value: workspace ? 1 : 0 },
    { label: t('dashboard.members', 'Members'), value: members.length },
    { label: t('dashboard.containers', 'Containers'), value: containers.length },
    { label: t('dashboard.active', 'Active'), value: workspace?.myRole ? 1 : 0 },
  ];

  return (
    <PageShell
      title={t('dashboard.title')}
      description={t('dashboard.description')}
    >
      {workspaceQuery.isLoading || containersQuery.isLoading || membersQuery.isLoading ? (
        <LoadingState label={t('common.loading')} />
      ) : null}
      {workspaceQuery.isError || containersQuery.isError || membersQuery.isError ? (
        <ErrorState
          message={t('dashboard.summaryError', 'Unable to load workspace overview.')}
          onRetry={() => {
            void workspaceQuery.refetch();
            void containersQuery.refetch();
            void membersQuery.refetch();
          }}
        />
      ) : null}

      {workspace ? (
        <div className="component-stack">
          <Card>
            <CardContent className="space-y-2 p-5 sm:p-6">
              <CardTitle className="text-lg">{workspace.name}</CardTitle>
              <CardDescription>
                {workspace.slug ?? workspace.id}
                {' · '}
                {workspace.myRole}
                {' · '}
                {new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
                  dateStyle: 'medium',
                }).format(new Date(workspace.createdAt))}
              </CardDescription>
            </CardContent>
          </Card>

          <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <StatCard key={card.label} label={card.label} value={card.value} />
            ))}
          </div>

          <Card>
            <CardContent className="space-y-2 p-5 sm:p-6">
              <CardTitle className="text-base">{t('workspace.list.summaryLabel', 'Workspace status')}</CardTitle>
              <CardDescription>
                {t('workspace.card.role')}: {workspace.myRole}
              </CardDescription>
              <CardDescription>
                {t('containers.list.total')}: {containers.length}
              </CardDescription>
              <CardDescription>
                {t('members.title')}: {members.length}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </PageShell>
  );
}
