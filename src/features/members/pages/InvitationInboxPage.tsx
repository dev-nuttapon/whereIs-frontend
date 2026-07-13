import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Card, Tag, Typography } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { MailIcon, OpenIcon, MemberIcon } from '@/components/ui/icons';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { pushNotification } from '@/stores/notification.store';
import { useAcceptInvitation, useMyInvitations } from '@/features/members/hooks/useMembers';
import type { InvitationDto } from '@/api/member.api';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getScopeSummary(
  invitation: InvitationDto,
  t: ReturnType<typeof useI18n>['t'],
) {
  if (!invitation.containerAccessScope) {
    return t('members.visibilityAllContainers', 'เห็นทุก container');
  }

  const count = invitation.containerAccessScope.containerIds.length;
  const base = t('members.visibilitySelectedCount', 'เห็น {count} container', { count });
  return invitation.containerAccessScope.includeDescendants
    ? `${base}, ${t('permissions.scope.includeDescendants', 'รวม container ลูกทั้งหมด')}`
    : base;
}

export function InvitationInboxPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const invitationsQuery = useMyInvitations();
  const acceptInvitation = useAcceptInvitation();

  const invitations = useMemo(() => {
    return [...(invitationsQuery.data ?? [])].sort((left, right) => {
      const leftPending = left.status.toLowerCase() === 'pending' ? 0 : 1;
      const rightPending = right.status.toLowerCase() === 'pending' ? 0 : 1;
      if (leftPending !== rightPending) {
        return leftPending - rightPending;
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [invitationsQuery.data]);

  const handleAccept = async (token: string) => {
    try {
      const accepted = await acceptInvitation.mutateAsync(token);
      navigate(ROUTES.workspaceDashboard(accepted.workspaceId), { replace: true });
    } catch (error) {
      pushNotification({
        variant: 'error',
        title: t('members.acceptInvitationError', 'ตอบรับคำเชิญไม่สำเร็จ'),
        description: error instanceof Error ? error.message : t('common.errorUnexpected', 'เกิดข้อผิดพลาดที่ไม่คาดคิด'),
      });
    }
  };

  if (invitationsQuery.isLoading) {
    return <LoadingState label={t('members.invitationLoading', 'กำลังโหลดคำเชิญ...')} />;
  }

  if (invitationsQuery.isError) {
    return (
      <ErrorState
        message={t('members.invitationInboxError', 'โหลดกล่องคำเชิญไม่สำเร็จ')}
        onRetry={() => invitationsQuery.refetch()}
      />
    );
  }

  return (
    <PageShell
      title={t('members.myInvitations', 'คำเชิญของฉัน')}
      description={t('members.myInvitationsDescription', 'ดูคำเชิญที่ถูกส่งมาถึงอีเมลของคุณและตอบรับได้จากหน้านี้')}
    >
      {invitations.length === 0 ? (
        <EmptyState
          title={t('members.noInvitations', 'ยังไม่มีคำเชิญ')}
          description={t('members.noInvitationsDescription', 'ถ้ามีคนเชิญคุณเข้าร่วม workspace คำเชิญจะมาแสดงที่หน้านี้')}
          icon={<MailIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="component-stack">
          {invitations.map((invitation) => {
            const isPending = invitation.status.toLowerCase() === 'pending';
            return (
              <Card key={invitation.id} className="overflow-hidden">
                <div className="component-stack p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <Avatar className="bg-primary/10 text-primary">
                        {(invitation.workspaceName ?? invitation.workspaceId).slice(0, 1).toUpperCase()}
                      </Avatar>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Typography.Title level={5} className="!mb-0 !mt-0 truncate">
                            {invitation.workspaceName ?? invitation.workspaceId}
                          </Typography.Title>
                          <Tag color={isPending ? 'processing' : 'default'}>
                            {t(`members.invitationStatus.${invitation.status.toLowerCase()}`, invitation.status)}
                          </Tag>
                        </div>
                        <Typography.Paragraph className="!mb-0 text-sm text-muted-foreground">
                          <MailIcon className="mr-2 inline-block h-4 w-4" />
                          {invitation.email}
                        </Typography.Paragraph>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="rounded-full border border-border/70 bg-card px-2 py-1">
                            {t('members.invitationRole', 'บทบาท')}: {t(`members.role.${invitation.roleCode}`)}
                          </span>
                          <span className="rounded-full border border-border/70 bg-card px-2 py-1">
                            {getScopeSummary(invitation, t)}
                          </span>
                          <span className="rounded-full border border-border/70 bg-card px-2 py-1">
                            {t('members.invitationCreatedAt', 'ส่งเมื่อ')}: {formatDateTime(invitation.createdAt)}
                          </span>
                          <span className="rounded-full border border-border/70 bg-card px-2 py-1">
                            {t('members.invitationExpiresAt', 'หมดอายุ')}: {formatDateTime(invitation.expiresAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:items-end">
                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to={ROUTES.invitationAccept(invitation.token)}>
                            <OpenIcon className="h-4 w-4" />
                            {t('members.openInvitation', 'เปิดหน้าตอบรับ')}
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={!isPending || acceptInvitation.isPending}
                          onClick={() => handleAccept(invitation.token)}
                        >
                          <MemberIcon className="h-4 w-4" />
                          {acceptInvitation.isPending ? t('members.acceptingInvitation', 'กำลังตอบรับ...') : t('members.acceptInvitationAction', 'ตอบรับคำเชิญ')}
                        </Button>
                      </div>
                      <Typography.Text className="text-xs text-muted-foreground">
                        {t('members.invitationTokenHint', 'ต้องการรายละเอียดเพิ่มเติมสามารถเปิดหน้าตอบรับเฉพาะคำเชิญนี้ได้')}
                      </Typography.Text>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
