import { z } from 'zod';

type TranslationFunction = (key: string, fallback?: string, params?: Record<string, string | number>) => string;

export function createProfileSchema(t: TranslationFunction) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, t('auth.validation.nameMin'))
      .max(80, t('auth.validation.nameMax')),
    email: z
      .string()
      .trim()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
  });
}

export function createPasswordSchema(t: TranslationFunction) {
  return z
    .object({
      currentPassword: z.string().min(1, t('auth.validation.passwordRequired')),
      newPassword: z.string().min(8, t('auth.validation.passwordMin')),
      confirmPassword: z.string().min(1, t('auth.validation.confirmPasswordRequired')),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      message: t('auth.validation.passwordMismatch'),
      path: ['confirmPassword'],
    });
}

export type ProfileValues = z.infer<ReturnType<typeof createProfileSchema>>;
export type PasswordValues = z.infer<ReturnType<typeof createPasswordSchema>>;
