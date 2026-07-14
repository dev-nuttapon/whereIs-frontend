import { useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { ReportIcon } from '@/components/ui/icons';
import { useI18n } from '@/hooks/useI18n';
import { useReports } from '@/features/reports/hooks/useReports';

export function ReportsPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t } = useI18n();
  const reportsQuery = useReports(wsId);
  const reports = reportsQuery.data ?? [];

  return (
    <PageShell title={t('reports.title', 'Reports')} description={t('reports.description', 'Workspace summaries and export-ready metrics.')}>
      {reportsQuery.isLoading ? <LoadingState label={t('reports.loading', 'Loading reports...')} /> : null}
      {reportsQuery.isError ? <ErrorState message={t('reports.error', 'Reports failed to load.')} onRetry={() => reportsQuery.refetch()} /> : null}

      <div className="grid gap-[18px] md:grid-cols-3">
        <StatCard label={t('reports.title', 'Reports')} value={reports.length} />
        <StatCard label={t('reports.total', 'Summaries')} value={reports.length} />
        <StatCard label={t('reports.scope', 'Workspace')} value={1} />
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title={t('reports.emptyTitle', 'ยังไม่มีรายงาน')}
          description={t('reports.emptyDescription', 'รายงานจะปรากฏเมื่อ backend ส่ง summary data กลับมา')}
          icon={<ReportIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.key}>
              <CardContent className="space-y-1 p-4 sm:p-5">
                <CardTitle className="text-base">{report.label}</CardTitle>
                <CardDescription>
                  {report.value}
                  {report.unit ? ` ${report.unit}` : ''}
                  {report.trend ? ` · ${report.trend}` : ''}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
