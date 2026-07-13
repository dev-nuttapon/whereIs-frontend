import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Avatar, Space, Tag, Typography } from 'antd';
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
      <div className="flex justify-stretch sm:justify-end">
        <Button className="w-full sm:w-auto" onClick={() => setInviteOpen(true)}>
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
      <div className="divide-y divide-border rounded-2xl border border-border/70 bg-card/70">
        {(membersQuery.data ?? []).map((member) => (
          <div key={member.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar>{member.user.name.slice(0, 1).toUpperCase()}</Avatar>
              <div className="min-w-0">
                <Space size={8} wrap>
                  <Typography.Text strong>
                    <MemberIcon className="mr-2 inline-block h-4 w-4" />
                    {member.user.name}
                  </Typography.Text>
                </Space>
                <p className="truncate text-sm text-muted-foreground">{member.user.email}</p>
              </div>
            </div>
            {currentUser?.id === member.user.id ? <Tag className="w-fit" color="blue">{t('members.you')}</Tag> : null}
          </div>
        ))}
      </div>
      <InviteMemberDialog wsId={wsId} open={inviteOpen} onOpenChange={setInviteOpen} />
    </PageShell>
  );
}
