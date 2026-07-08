import { z } from 'zod';

type TFn = (key: string, fallback?: string, params?: Record<string, string | number>) => string;

const itemKindSchema = z.enum(['single', 'bulk']);
const itemUsageTypeSchema = z.enum(['consumable', 'returnable']);

export function createItemSchema(t: TFn) {
  return z
    .object({
      kind: itemKindSchema,
      usageType: itemUsageTypeSchema,
      name: z.string().trim().min(2, t('items.validation.nameMin')).max(120, t('items.validation.nameMax')),
      code: z.string().trim().max(50, t('items.validation.codeMax')).optional(),
      description: z.string().trim().max(1000, t('items.validation.descriptionMax')).optional(),
      containerId: z.string().min(1, t('items.validation.containerRequired')),
      quantity: z.coerce.number().int().min(1, t('items.validation.quantityMin')).optional(),
      reorderPoint: z.coerce.number().int().min(1, t('items.validation.quantityMin')).optional(),
    })
    .superRefine((values, ctx) => {
      if (values.kind === 'bulk' && !values.quantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['quantity'],
          message: t('items.validation.quantityMin'),
        });
      }
      if (values.kind === 'bulk' && values.usageType === 'consumable' && !values.reorderPoint) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['reorderPoint'],
          message: t('items.validation.reorderPointRequired'),
        });
      }
    });
}

export type ItemValues = z.infer<ReturnType<typeof createItemSchema>>;

export function createUpdateItemSchema(t: TFn) {
  return z
    .object({
      name: z.string().trim().min(2, t('items.validation.nameMin')).max(120, t('items.validation.nameMax')).optional(),
      code: z.string().trim().max(50, t('items.validation.codeMax')).optional(),
      description: z.string().trim().max(1000, t('items.validation.descriptionMax')).optional(),
    });
}

export type UpdateItemValues = z.infer<ReturnType<typeof createUpdateItemSchema>>;
export type ItemKindValues = z.infer<typeof itemKindSchema>;
export type ItemUsageTypeValues = z.infer<typeof itemUsageTypeSchema>;
