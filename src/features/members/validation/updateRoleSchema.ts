import { z } from 'zod';

export function createUpdateRoleSchema() {
  return z.object({
    role: z.enum(['admin', 'member', 'viewer']),
  });
}

export type UpdateRoleValues = z.infer<ReturnType<typeof createUpdateRoleSchema>>;
