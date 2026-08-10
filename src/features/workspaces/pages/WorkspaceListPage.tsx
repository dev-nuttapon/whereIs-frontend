import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { WorkspaceCard } from '@/components/common/WorkspaceCard';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useWorkspaces } from '@/features/workspaces/hooks/useWorkspaces';
import { useMyInvitations } from '@/features/members/hooks/useMembers';
import { useI18n } from '@/hooks/useI18n';
import { DashboardIcon, MailIcon, OpenIcon, PlusIcon } from '@/components/ui/icons';
import { WorkspaceSelectPageShell } from '@/components/common/WorkspaceSelectPageShell';

export function WorkspaceListPage() {
  const workspacesQuery = useWorkspaces();
  const invitationsQuery = useMyInvitations();
  const navigate = useNavigate();
  const { t } = useI18n();
  const workspaces = workspacesQuery.data ?? [];
  const pendingInvitations = (invitationsQuery.data ?? []).filter((invitation) => invitation.status.toLowerCase() === 'pending');

  return (
    <WorkspaceSelectPageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{t('workspace.list.title')}</p>
          <p className="text-sm text-muted-foreground">{t('workspace.list.description')}</p>
        </div>
        <Button className="w-full shrink-0 sm:w-auto" onClick={() => navigate(ROUTES.workspaceNew)}>
          <PlusIcon className="h-4 w-4" />
          {t('workspace.list.create')}
        </Button>
      </div>

      {workspacesQuery.isLoading ? <LoadingState label={t('common.loadingWorkspaces')} /> : null}
      {workspacesQuery.isError ? (
        <ErrorState message={t('workspace.list.error')} onRetry={() => workspacesQuery.refetch()} />
      ) : null}

      {pendingInvitations.length > 0 ? (
        <Card className="border-teal-100 bg-teal-50/40">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700 ring-1 ring-teal-100">
                  <MailIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">{t('members.pendingInvitations', 'คำเชิญที่รอตอบรับ')}</p>
                  <p className="text-sm text-muted-foreground">{t('members.myInvitationsDescription', 'ดูคำเชิญที่ถูกส่งมาถึงอีเมลของคุณและตอบรับได้จากหน้านี้')}</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link to={ROUTES.invitationsInbox}>
                  <OpenIcon className="h-4 w-4" />
                  {t('members.myInvitations', 'คำเชิญของฉัน')}
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {pendingInvitations.slice(0, 4).map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-white/80 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{invitation.workspaceName ?? invitation.workspaceId}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('members.invitationRole', 'บทบาท')}: {t(`members.role.${invitation.roleCode}`, invitation.roleCode)}
                    </p>
                  </div>
                  <MailIcon className="h-4 w-4 shrink-0 text-teal-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
        <section aria-labelledby="workspace-list-heading" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="workspace-list-heading" className="text-base font-semibold text-foreground">
                {t('workspace.list.summaryLabel')}
              </h2>
              <p className="text-sm text-muted-foreground">{t('workspace.list.tapToOpen')}</p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
              {t('workspace.list.count', '{count} workspaces', { count: workspaces.length })}
            </span>
          </div>
          <div className={workspaces.length === 1 ? 'max-w-xl' : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'}>
            {workspaces.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </div>
        </section>
      ) : null}
    </WorkspaceSelectPageShell>
  );
}
