import { z } from 'zod';

type TFn = (key: string, fallback?: string, params?: Record<string, string | number>) => string;

export function createSiteSchema(t: TFn) {
  return z.object({
    name: z.string().trim().min(2, t('sites.validation.nameMin')).max(80, t('sites.validation.nameMax')),
    description: z.string().trim().max(500, t('sites.validation.descriptionMax')).optional(),
  });
}

export type SiteValues = z.infer<ReturnType<typeof createSiteSchema>>;
