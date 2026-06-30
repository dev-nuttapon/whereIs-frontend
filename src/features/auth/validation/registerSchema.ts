import { z } from 'zod';

type TFn = (key: string, fallback?: string, params?: Record<string, string | number>) => string;

export function createRegisterSchema(t: TFn) {
  return z
    .object({
      name: z.string().trim().min(2, t('auth.validation.nameMin')).max(80, t('auth.validation.nameMax')),
      email: z.string().trim().min(1, t('auth.validation.emailRequired')).email(t('auth.validation.emailInvalid')),
      password: z.string().min(8, t('auth.validation.passwordMin')),
      confirmPassword: z.string().min(1, t('auth.validation.confirmPasswordRequired')),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: t('auth.validation.passwordMismatch'),
      path: ['confirmPassword'],
    });
}

export type RegisterValues = z.infer<ReturnType<typeof createRegisterSchema>>;
