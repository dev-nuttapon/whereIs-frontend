import { useParams } from 'react-router-dom';
import { Avatar, Descriptions, Space, Tag } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useMember, useUpdateMemberRole } from '@/features/members/hooks/useMembers';
import { useWorkspace } from '@/features/workspaces/hooks/useWorkspace';
import { PermissionMatrix } from '@/features/permissions/components/PermissionMatrix';
import { useI18n } from '@/hooks/useI18n';
import { StatCard } from '@/components/common/StatCard';
import { useMemberPermissions } from '@/features/permissions/hooks/usePermissions';
import type { Role } from '@/types/domain.types';

const editableRoles: Array<Exclude<Role, 'owner'>> = ['admin', 'member', 'viewer'];

export function MemberDetailPage() {
  const { wsId = 'ws-warehouse', memberId = '' } = useParams();
  const memberQuery = useMember(wsId, memberId);
  const workspaceQuery = useWorkspace(wsId);
  const permissionsQuery = useMemberPermissions(wsId, memberId);
  const updateRole = useUpdateMemberRole(wsId, memberId);
  const { t } = useI18n();
  const workspace = workspaceQuery.data;
  const effectiveCount = permissionsQuery.data?.effective.length ?? 0;
  const overrideCount = Object.values(permissionsQuery.data?.overrides ?? {}).filter(Boolean).length;
  const highlightedPermissions = permissionsQuery.data?.effective.slice(0, 4) ?? [];

  return (
    <PageShell title={t('members.detail.title')} description={t('members.detail.description')}>
      {memberQuery.isLoading ? <LoadingState label={t('members.detail.loading')} /> : null}
      {memberQuery.isError ? <ErrorState message={t('members.detail.error')} onRetry={() => memberQuery.refetch()} /> : null}
      {memberQuery.data ? (
        <div className="space-y-4 sm:space-y-5">
          <Card>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <Avatar size={48}>{memberQuery.data.user.name.slice(0, 1).toUpperCase()}</Avatar>
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-base">{memberQuery.data.user.name}</CardTitle>
                  <CardDescription className="truncate">{memberQuery.data.user.email}</CardDescription>
                </div>
              </div>
              <div className="responsive-descriptions">
                <Descriptions bordered column={{ xs: 1, md: 2 }} size="middle">
                  <Descriptions.Item label={t('members.detail.role')}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Tag className="w-fit" color="blue">{t(`members.role.${memberQuery.data.role}`)}</Tag>
                      <Select
                        className="w-full sm:w-40"
                        value={memberQuery.data.role}
                        disabled={memberQuery.data.role === 'owner' || updateRole.isPending}
                        onChange={(event) => updateRole.mutate(event.target.value as Exclude<Role, 'owner'>)}
                        aria-label={t('members.detail.role')}
                      >
                        {memberQuery.data.role === 'owner' ? <option value="owner">{t('members.role.owner', 'Owner')}</option> : null}
                        {editableRoles.map((role) => (
                          <option key={role} value={role}>{t(`members.role.${role}`)}</option>
                        ))}
                      </Select>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label={t('members.detail.workspace')}>{workspace?.name ?? wsId}</Descriptions.Item>
                </Descriptions>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            <StatCard label={t('members.detail.permissions')} value={effectiveCount} />
            <StatCard label={t('members.detail.overrides')} value={overrideCount} description={t('permissions.title')} />
            <StatCard label={t('members.detail.samplePermissions')} value={effectiveCount} description={t('permissions.enabled')} />
          </div>

          {highlightedPermissions.length > 0 ? (
            <Card>
              <CardContent className="space-y-3 p-5 sm:p-6">
                <CardTitle className="text-base">{t('members.detail.samplePermissions')}</CardTitle>
                <Space wrap>
                  {highlightedPermissions.map((permission) => (
                    <Tag key={permission} className="rounded-full">
                      {t(`permissions.label.${permission}`, permission)}
                    </Tag>
                  ))}
                </Space>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
      <PermissionMatrix wsId={wsId} memberId={memberId} />
    </PageShell>
  );
}
