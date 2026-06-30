import { z } from 'zod';

type TFn = (key: string, fallback?: string, params?: Record<string, string | number>) => string;

export function createWorkspaceSchema(t: TFn) {
  return z.object({
    name: z.string().trim().min(2, t('workspace.validation.nameMin')).max(80, t('workspace.validation.nameMax')),
  });
}

export type CreateWorkspaceValues = z.infer<ReturnType<typeof createWorkspaceSchema>>;
