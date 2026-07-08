import { getDashboardSummary as getDashboardSummaryRecord, getRecentActivity as getRecentActivityRecord } from '@/mocks/demo-db';
import { delay } from '@/utils/mock-api';
import type { ItemEvent } from '@/types/domain.types';

export interface DashboardSummary {
  totalItems: number;
  stored: number;
  takenOut: number;
  missing: number;
  lowStock: number;
  outOfStock: number;
  returnableItems: number;
}

export async function getDashboardSummary(wsId: string): Promise<DashboardSummary> {
  return delay(getDashboardSummaryRecord(wsId));
}

export async function getRecentActivity(wsId: string): Promise<ItemEvent[]> {
  return delay(getRecentActivityRecord(wsId));
}
