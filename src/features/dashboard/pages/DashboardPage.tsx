import { Link, useParams } from 'react-router-dom';
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
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { ActivityIcon, ItemIcon, MemberIcon, SearchIcon } from '@/components/ui/icons';

export function DashboardPage() {
  const { wsId = '' } = useParams();
  const { t } = useI18n();
  const workspaceQuery = useWorkspace(wsId);
  const containersQuery = useContainers(wsId);
  const membersQuery = useMembers(wsId);
  const currentWorkspace = workspaceStore((state) => state.currentWorkspace);

  const workspace = workspaceQuery.data ?? currentWorkspace;
  const containers = containersQuery.data ?? [];
  const members = membersQuery.data ?? [];
  const isLoading = workspaceQuery.isLoading || containersQuery.isLoading || membersQuery.isLoading;
  const hasError = workspaceQuery.isError || containersQuery.isError || membersQuery.isError;
  const isReady = !isLoading && !hasError;

  const summaryCards = [
    {
      label: t('dashboard.members', 'Members'),
      value: members.length,
      description: t('dashboard.membersDescription', 'People with access to this workspace.'),
      to: ROUTES.workspaceMembers(wsId),
    },
    {
      label: t('dashboard.containers', 'Containers'),
      value: containers.length,
      description: t('dashboard.containersDescription', 'Places where inventory is organized.'),
      to: ROUTES.workspaceContainers(wsId),
    },
    {
      label: t('dashboard.role', 'Your role'),
      value: workspace?.myRole ?? '-',
      description: t('dashboard.roleDescription', 'Your access level in this workspace.'),
    },
  ];

  return (
    <PageShell
      title={t('dashboard.title')}
      description={t('dashboard.description')}
      compact
    >
      {isLoading ? (
        <LoadingState label={t('common.loading')} />
      ) : null}
      {hasError ? (
        <ErrorState
          message={t('dashboard.summaryErrorAction', 'We could not load the workspace overview. Try again.')}
          onRetry={() => {
            void workspaceQuery.refetch();
            void containersQuery.refetch();
            void membersQuery.refetch();
          }}
        />
      ) : null}

      {isReady && workspace ? (
        <div className="component-stack">
          <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <StatCard key={card.label} label={card.label} value={card.value} description={card.description} to={card.to} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
            <Card>
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-base">
                    {containers.length === 0 || members.length === 0
                      ? t('dashboard.getStartedTitle', 'Get started')
                      : t('dashboard.shortcutsTitle', 'Quick actions')}
                  </CardTitle>
                  <CardDescription>
                    {containers.length === 0 || members.length === 0
                      ? t('dashboard.getStartedDescription', 'Create your first product, add the first container, or invite the first member to get this workspace ready.')
                      : t('dashboard.shortcutsDescription', 'Jump to the areas you use most often.')}
                  </CardDescription>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Button asChild variant="outline" className="justify-start">
                    <Link to={ROUTES.workspaceSearch(wsId)}>
                      <SearchIcon className="h-4 w-4" />
                      {t('nav.search')}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-start">
                    <Link to={ROUTES.workspaceProducts(wsId)}>
                      <ItemIcon className="h-4 w-4" />
                      {t('nav.products')}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-start">
                    <Link to={ROUTES.workspaceActivity(wsId)}>
                      <ActivityIcon className="h-4 w-4" />
                      {t('nav.activity')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="space-y-1">
                  <CardTitle className="text-base">{t('dashboard.statusTitle', 'Workspace status')}</CardTitle>
                  <CardDescription>{t('dashboard.statusDescription', 'A quick summary of this workspace.')}</CardDescription>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
                    <span className="text-muted-foreground">{t('workspace.card.role')}</span>
                    <span className="font-medium text-foreground">{workspace.myRole}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
                    <span className="flex items-center gap-2 text-muted-foreground"><MemberIcon className="h-4 w-4" />{t('dashboard.members')}</span>
                    <span className="font-medium text-foreground">{members.length}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-muted-foreground"><ItemIcon className="h-4 w-4" />{t('dashboard.containers')}</span>
                    <span className="font-medium text-foreground">{containers.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
