import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Card, Descriptions, Typography } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/button';
import { useAcceptInvitation, useInvitation } from '@/features/members/hooks/useMembers';
import { useI18n } from '@/hooks/useI18n';
import { ROUTES } from '@/constants/routes';

export function InvitationAcceptPage() {
  const { token } = useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const invitationQuery = useInvitation(token);
  const acceptInvitation = useAcceptInvitation();
  const invitation = invitationQuery.data;
  const isPending = invitation?.status.toLowerCase() === 'pending';

  const handleAccept = async () => {
    if (!token) {
      return;
    }

    const accepted = await acceptInvitation.mutateAsync(token);
    navigate(ROUTES.workspaceDashboard(accepted.workspaceId), { replace: true });
  };

  if (invitationQuery.isLoading) {
    return <LoadingState label={t('members.invitationLoading', 'กำลังโหลดคำเชิญ...')} />;
  }

  if (invitationQuery.isError || !invitation) {
    return (
      <ErrorState
        message={t('members.invitationError', 'โหลดคำเชิญไม่สำเร็จ')}
        onRetry={() => invitationQuery.refetch()}
      />
    );
  }

  return (
    <PageShell title={t('members.acceptInvitationTitle', 'ตอบรับคำเชิญ')} description={t('members.acceptInvitationDescription', 'ตรวจสอบรายละเอียดก่อนเข้าร่วม workspace')}>
      <Card className="overflow-hidden">
        <div className="component-stack p-5 sm:p-6">
          <div className="space-y-1">
            <Typography.Title level={4} className="!mb-0 !mt-0">
              {t('members.acceptInvitationTitle', 'ตอบรับคำเชิญ')}
            </Typography.Title>
            <Typography.Paragraph className="!mb-0 text-muted-foreground">
              {t('members.acceptInvitationDescription', 'ตรวจสอบรายละเอียดก่อนเข้าร่วม workspace')}
            </Typography.Paragraph>
          </div>

          {!isPending ? (
            <Alert
              type="warning"
              showIcon
              message={t('members.invitationNotPending', 'คำเชิญนี้ไม่อยู่ในสถานะรอตอบรับแล้ว')}
            />
          ) : null}

          <Descriptions bordered column={1} className="responsive-descriptions">
            <Descriptions.Item label={t('members.inviteEmail')}>{invitation.email}</Descriptions.Item>
            <Descriptions.Item label={t('members.inviteRole')}>{t(`members.role.${invitation.roleCode}`)}</Descriptions.Item>
            <Descriptions.Item label={t('members.invitationStatus', 'สถานะ')}>{invitation.status}</Descriptions.Item>
          </Descriptions>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link to={ROUTES.workspaces}>{t('notFound.back')}</Link>
            </Button>
            <Button
              type="button"
              disabled={!isPending || acceptInvitation.isPending}
              onClick={handleAccept}
            >
              {acceptInvitation.isPending ? t('members.acceptingInvitation', 'กำลังตอบรับ...') : t('members.acceptInvitationAction', 'ตอบรับคำเชิญ')}
            </Button>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
