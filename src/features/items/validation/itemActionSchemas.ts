import { z } from 'zod';

type TFn = (key: string, fallback?: string, params?: Record<string, string | number>) => string;

export function createTakeOutSchema(t: TFn) {
  return z.object({
    holderId: z.string().min(1, t('items.validation.holderRequired')),
    note: z.string().trim().optional(),
  });
}
export type TakeOutActionValues = z.infer<ReturnType<typeof createTakeOutSchema>>;

export function createReturnSchema() {
  return z.object({
    note: z.string().trim().optional(),
  });
}
export type ReturnActionValues = z.infer<ReturnType<typeof createReturnSchema>>;

export function createMoveItemSchema(t: TFn) {
  return z.object({
    toContainerId: z.string().min(1, t('items.validation.targetContainerRequired')),
  });
}
export type MoveItemActionValues = z.infer<ReturnType<typeof createMoveItemSchema>>;

export function createMarkFoundSchema(t: TFn) {
  return z.object({
    containerId: z.string().min(1, t('items.validation.containerRequired')),
  });
}
export type MarkFoundActionValues = z.infer<ReturnType<typeof createMarkFoundSchema>>;

export function createDisposeSchema(t: TFn) {
  return z.object({
    confirm: z.boolean().refine((value) => value, {
      message: t('items.validation.confirmDisposal'),
    }),
  });
}
export type DisposeActionValues = z.infer<ReturnType<typeof createDisposeSchema>>;

export function createConsumeStockSchema(t: TFn, maxQuantity: number) {
  return z.object({
    quantity: z.coerce.number().int().min(1, t('items.validation.quantityMin')).max(maxQuantity, t('items.validation.quantityMax')),
    note: z.string().trim().optional(),
  });
}

export type ConsumeStockActionValues = z.infer<ReturnType<typeof createConsumeStockSchema>>;

export function createRestockStockSchema(t: TFn) {
  return z.object({
    quantity: z.coerce.number().int().min(1, t('items.validation.quantityMin')),
    note: z.string().trim().optional(),
  });
}

export type RestockStockActionValues = z.infer<ReturnType<typeof createRestockStockSchema>>;
