import { z } from 'zod';

type TFn = (key: string, fallback?: string, params?: Record<string, string | number>) => string;

export function createInviteMemberSchema(t: TFn) {
  return z.object({
    email: z.string().trim().min(1, t('members.validation.emailRequired')).email(t('members.validation.emailInvalid')),
    role: z.enum(['admin', 'member', 'viewer']),
  });
}

export type InviteMemberValues = z.infer<ReturnType<typeof createInviteMemberSchema>>;
