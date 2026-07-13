import type { ReportSummary } from '@/types/domain.types';
import { listReports as listReportsRecord } from '@/mocks/demo-db';
import { delay } from '@/utils/mock-api';

export async function getReports(wsId: string): Promise<ReportSummary[]> {
  return delay(listReportsRecord(wsId));
}
