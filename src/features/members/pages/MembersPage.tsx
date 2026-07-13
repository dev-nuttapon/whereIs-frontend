import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Avatar, Popconfirm, Space, Tag, Typography } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useInvitations, useMembers, useRevokeInvitation, useUpdateMemberRole } from '@/features/members/hooks/useMembers';
import { authStore } from '@/stores/auth.store';
import { InviteMemberDialog } from '@/features/members/components/InviteMemberDialog';
import { useI18n } from '@/hooks/useI18n';
import { MailIcon, MemberIcon, OpenIcon, PlusIcon } from '@/components/ui/icons';
import { ROUTES } from '@/constants/routes';
import type { Member, Role } from '@/types/domain.types';

const editableRoles: Array<Exclude<Role, 'owner'>> = ['admin', 'member', 'viewer'];

interface MemberRowProps {
  wsId: string;
  member: Member;
  isCurrentUser: boolean;
}

function MemberRow({ wsId, member, isCurrentUser }: MemberRowProps) {
  const { t } = useI18n();
  const updateRole = useUpdateMemberRole(wsId, member.id);
  const canEditRole = member.role !== 'owner';

  return (
    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar>{member.user.name.slice(0, 1).toUpperCase()}</Avatar>
        <div className="min-w-0">
          <Space size={8} wrap>
            <Typography.Text strong>
              <MemberIcon className="mr-2 inline-block h-4 w-4" />
              {member.user.name}
            </Typography.Text>
            {isCurrentUser ? <Tag className="w-fit" color="blue">{t('members.you')}</Tag> : null}
          </Space>
          <p className="truncate text-sm text-muted-foreground">{member.user.email}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Select
          className="w-full sm:w-48"
          value={member.role}
          disabled={!canEditRole || updateRole.isPending}
          onChange={(event) => updateRole.mutate(event.target.value as Exclude<Role, 'owner'>)}
          aria-label={t('members.detail.role')}
        >
          {member.role === 'owner' ? <option value="owner">{t('members.role.owner', 'Owner')}</option> : null}
          {editableRoles.map((role) => (
            <option key={role} value={role}>{t(`members.role.${role}`)}</option>
          ))}
        </Select>
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
          <Link to={ROUTES.workspaceMemberDetail(wsId, member.id)}>
            <OpenIcon className="h-4 w-4" />
            {t('members.manageAccess', 'Manage access')}
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function MembersPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const membersQuery = useMembers(wsId);
  const invitationsQuery = useInvitations(wsId);
  const currentUser = authStore((state) => state.user);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [revokingInvitationId, setRevokingInvitationId] = useState<string | null>(null);
  const revokeInvitation = useRevokeInvitation(wsId);
  const { t } = useI18n();
  const pendingInvitations = (invitationsQuery.data ?? []).filter((invitation) => invitation.status.toLowerCase() === 'pending');

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
          <MemberRow key={member.id} wsId={wsId} member={member} isCurrentUser={currentUser?.id === member.user.id} />
        ))}
      </div>
      {pendingInvitations.length > 0 ? (
        <section className="rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
          <div className="mb-4 space-y-1">
            <Typography.Title level={5} className="!mb-0 !mt-0">
              {t('members.pendingInvitations', 'คำเชิญที่รอตอบรับ')}
            </Typography.Title>
            <Typography.Paragraph className="!mb-0 text-muted-foreground">
              {t('members.pendingInvitationsDescription', 'ส่งลิงก์ตอบรับให้ผู้ถูกเชิญเพื่อเข้าร่วม workspace')}
            </Typography.Paragraph>
          </div>
          <div className="component-stack">
            {pendingInvitations.map((invitation) => (
              <div key={invitation.id} className="flex flex-col gap-3 rounded-xl border border-border/70 bg-background/70 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Typography.Text strong className="flex items-center gap-2">
                    <MailIcon className="h-4 w-4" />
                    {invitation.email}
                  </Typography.Text>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('members.invitationRole', 'บทบาท')}: {t(`members.role.${invitation.roleCode}`)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  {invitation.token ? (
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                      <Link to={ROUTES.invitationAccept(invitation.token)}>
                        <OpenIcon className="h-4 w-4" />
                        {t('members.openInvitation', 'เปิดหน้าตอบรับ')}
                      </Link>
                    </Button>
                  ) : null}
                  <Popconfirm
                    title={t('members.revokeInvitationConfirmTitle', 'ยกเลิกคำเชิญนี้?')}
                    description={t('members.revokeInvitationConfirmDescription', 'ผู้รับจะไม่สามารถใช้ลิงก์นี้ตอบรับคำเชิญได้อีก')}
                    okText={t('members.revokeInvitation', 'ยกเลิกคำเชิญ')}
                    cancelText={t('members.inviteCancel', 'ยกเลิก')}
                    okButtonProps={{ danger: true }}
                    onConfirm={() => {
                      setRevokingInvitationId(invitation.id);
                      revokeInvitation.mutate(invitation.id, {
                        onSettled: () => setRevokingInvitationId(null),
                      });
                    }}
                  >
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto"
                      disabled={revokingInvitationId === invitation.id}
                    >
                      {revokingInvitationId === invitation.id
                        ? t('members.revokingInvitation', 'กำลังยกเลิก...')
                        : t('members.revokeInvitation', 'ยกเลิกคำเชิญ')}
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <InviteMemberDialog wsId={wsId} open={inviteOpen} onOpenChange={setInviteOpen} />
    </PageShell>
  );
}
