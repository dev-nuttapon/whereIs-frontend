import { useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useMember } from '@/features/members/hooks/useMembers';
import { PermissionMatrix } from '@/features/permissions/components/PermissionMatrix';
import { useI18n } from '@/hooks/useI18n';
import { MOCK_WORKSPACES } from '@/mocks/mock-data';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/common/StatCard';
import { useMemberPermissions } from '@/features/permissions/hooks/usePermissions';

export function MemberDetailPage() {
  const { wsId = 'ws-warehouse', memberId = '' } = useParams();
  const memberQuery = useMember(wsId, memberId);
  const permissionsQuery = useMemberPermissions(wsId, memberId);
  const { t } = useI18n();
  const workspace = MOCK_WORKSPACES.find((entry) => entry.id === wsId);
  const effectiveCount = permissionsQuery.data?.effective.length ?? 0;
  const overrideCount = Object.values(permissionsQuery.data?.overrides ?? {}).filter(Boolean).length;
  const highlightedPermissions = permissionsQuery.data?.effective.slice(0, 4) ?? [];

  return (
    <PageShell title={t('members.detail.title')} description={t('members.detail.description')}>
      {memberQuery.isLoading ? <LoadingState label={t('members.detail.loading')} /> : null}
      {memberQuery.isError ? <ErrorState message={t('members.detail.error')} onRetry={() => memberQuery.refetch()} /> : null}
      {memberQuery.data ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-1">
                <CardTitle className="text-base">{memberQuery.data.user.name}</CardTitle>
                <CardDescription>{memberQuery.data.user.email}</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {t('members.detail.role')}: {t(`members.role.${memberQuery.data.role}`)}
                </Badge>
                <Badge variant="outline">
                  {t('members.detail.workspace')}: {workspace?.name ?? wsId}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label={t('members.detail.permissions')} value={effectiveCount} />
            <StatCard label={t('members.detail.overrides')} value={overrideCount} description={t('permissions.title')} />
            <StatCard label={t('members.detail.samplePermissions')} value={memberQuery.data.permissions.length} description={t('permissions.enabled')} />
          </div>

          {highlightedPermissions.length > 0 ? (
            <Card>
              <CardContent className="space-y-3 p-6">
                <CardTitle className="text-base">{t('members.detail.samplePermissions')}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {highlightedPermissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="rounded-full">
                      {t(`permissions.label.${permission}`, permission)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
      <PermissionMatrix wsId={wsId} memberId={memberId} />
    </PageShell>
  );
}
