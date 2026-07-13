import { useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useReports } from '@/features/reports/hooks/useReports';
import { useI18n } from '@/hooks/useI18n';
import { ClipboardCheckIcon } from '@/components/ui/icons';

export function ReportsPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t } = useI18n();
  const reportsQuery = useReports(wsId);

  return (
    <PageShell title={t('nav.reports')} description={t('reports.description', 'Workspace report summary.')}>
      {reportsQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {reportsQuery.isError ? <ErrorState message={t('reports.error', 'Unable to load reports.')} onRetry={() => reportsQuery.refetch()} /> : null}
      {reportsQuery.data?.length === 0 ? (
        <EmptyState
          title={t('reports.emptyTitle', 'No reports yet')}
          description={t('reports.emptyDescription', 'Report data will appear after items are added.')}
          icon={<ClipboardCheckIcon className="h-5 w-5" />}
        />
      ) : null}
      {reportsQuery.data && reportsQuery.data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reportsQuery.data.map((report) => (
            <StatCard key={report.key} label={report.label} value={report.value} />
          ))}
        </div>
      ) : null}
      <Card>
        <CardContent className="space-y-2 p-6">
          <CardTitle className="text-base">{t('reports.snapshotTitle', 'Current snapshot')}</CardTitle>
          <CardDescription>{t('reports.snapshotDescription', 'The demo report uses current mock inventory, stock, overdue, and access-scope data.')}</CardDescription>
        </CardContent>
      </Card>
    </PageShell>
  );
}
