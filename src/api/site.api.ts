import type { Site } from '@/types/domain.types';
import { createSite as createSiteRecord, getSite as getSiteRecord, listSites as listSitesRecord, updateSite as updateSiteRecord } from '@/mocks/demo-db';
import { delay } from '@/utils/mock-api';

export async function listSites(wsId: string): Promise<Site[]> {
  return delay(listSitesRecord(wsId));
}

export async function getSite(id: string): Promise<Site> {
  return delay(getSiteRecord(id));
}

export interface UpsertSiteInput {
  name: string;
  description?: string;
}

export async function createSite(wsId: string, input: UpsertSiteInput): Promise<Site> {
  return delay(createSiteRecord(wsId, input.name, input.description));
}

export async function updateSite(wsId: string, id: string, input: UpsertSiteInput): Promise<Site> {
  return delay(updateSiteRecord(id, wsId, input.name, input.description));
}

export async function deleteSite(): Promise<{ success: true }> {
  return delay({ success: true });
}
