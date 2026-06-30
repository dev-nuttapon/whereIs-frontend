import { z } from 'zod';

type TFn = (key: string, fallback?: string, params?: Record<string, string | number>) => string;

export function createLoginSchema(t: TFn) {
  return z.object({
    email: z.string().trim().min(1, t('auth.validation.emailRequired')).email(t('auth.validation.emailInvalid')),
    password: z.string().min(1, t('auth.validation.passwordRequired')),
  });
}

export type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;
