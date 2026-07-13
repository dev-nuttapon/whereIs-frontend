import { getDashboardSummary as getDashboardSummaryRecord, getRecentActivity as getRecentActivityRecord } from '@/mocks/demo-db';
import { delay } from '@/utils/mock-api';
import type { ItemEvent } from '@/types/domain.types';

export interface DashboardSummary {
  totalItems: number;
  stored: number;
  borrowed: number;
  reserved: number;
  missing: number;
  repair: number;
  lowStock: number;
  outOfStock: number;
  overdueReturn: number;
  reservationWaiting: number;
  reminderCount: number;
}

export async function getDashboardSummary(wsId: string): Promise<DashboardSummary> {
  return delay(getDashboardSummaryRecord(wsId));
}

export async function getRecentActivity(wsId: string): Promise<ItemEvent[]> {
  return delay(getRecentActivityRecord(wsId));
}
