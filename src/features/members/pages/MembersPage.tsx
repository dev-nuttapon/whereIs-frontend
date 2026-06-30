import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useMembers } from '@/features/members/hooks/useMembers';
import { authStore } from '@/stores/auth.store';
import { InviteMemberDialog } from '@/features/members/components/InviteMemberDialog';
import { useI18n } from '@/hooks/useI18n';
import { MemberIcon, PlusIcon } from '@/components/ui/icons';

export function MembersPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const membersQuery = useMembers(wsId);
  const currentUser = authStore((state) => state.user);
  const [inviteOpen, setInviteOpen] = useState(false);
  const { t } = useI18n();

  return (
    <PageShell title={t('members.title')} description={t('members.description')}>
      <div className="flex justify-end">
        <Button onClick={() => setInviteOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          {t('members.invite')}
        </Button>
      </div>
      {membersQuery.isLoading ? <LoadingState label={t('members.loading')} /> : null}
      {membersQuery.isError ? <ErrorState message={t('members.error')} onRetry={() => membersQuery.refetch()} /> : null}
      {membersQuery.data?.length === 0 ? (
        <EmptyState
          title={t('members.emptyTitle')}
          description={t('members.emptyDescription')}
          actionLabel={t('members.invite')}
          onAction={() => setInviteOpen(true)}
          icon={<MemberIcon className="h-5 w-5" />}
        />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {membersQuery.data?.map((member) => (
          <Card key={member.id}>
            <CardContent className="space-y-1 p-6">
              <CardTitle className="text-base">
                <MemberIcon className="mr-2 inline-block h-4 w-4" />
                {member.user.name}
                {currentUser?.id === member.user.id ? ` (${t('members.you')})` : ''}
              </CardTitle>
              <CardDescription>{member.user.email}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
      <InviteMemberDialog wsId={wsId} open={inviteOpen} onOpenChange={setInviteOpen} />
    </PageShell>
  );
}
