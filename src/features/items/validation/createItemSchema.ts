import { z } from 'zod';

type TranslateFn = (key: string, fallback: string) => string;

export function createItemSchema(t: TranslateFn) {
  return z.object({
    name: z.string().min(1, t('items.validation.nameRequired', 'ต้องระบุชื่อ item')),
    kind: z.enum(['single', 'stock']),
    usageType: z.enum(['consumable', 'returnable']),
    code: z.string().max(64, t('items.validation.codeTooLong', 'รหัสยาวเกินไป')).optional().nullable(),
    photoUrl: z.string().max(2048, t('items.validation.photoUrlTooLong', 'URL รูปภาพยาวเกินไป')).optional().nullable(),
    description: z.string().max(1000, t('items.validation.descriptionTooLong', 'รายละเอียดยาวเกินไป')).optional().nullable(),
    containerId: z.string().min(1, t('items.validation.containerRequired', 'ต้องเลือก container')),
    quantity: z.coerce.number().int().positive(t('items.validation.quantityPositive', 'จำนวนต้องมากกว่า 0')).optional().nullable(),
    unit: z.string().max(32, t('items.validation.unitTooLong', 'หน่วยยาวเกินไป')).optional().nullable(),
    baseUnit: z.string().max(32, t('items.validation.baseUnitTooLong', 'หน่วยตั้งต้นยาวเกินไป')).optional().nullable(),
    lotCode: z.string().max(64, t('items.validation.lotTooLong', 'Lot code ยาวเกินไป')).optional().nullable(),
    receivedDate: z.string().optional().nullable(),
    expiryDate: z.string().optional().nullable(),
    warrantyEndDate: z.string().optional().nullable(),
    maintenanceNextDueDate: z.string().optional().nullable(),
    reorderPoint: z.coerce.number().int().min(0, t('items.validation.reorderPointNonNegative', 'จุดเตือนต้องไม่ติดลบ')).optional().nullable(),
  }).superRefine((values, ctx) => {
    if (values.kind === 'stock') {
      if (values.quantity == null || Number.isNaN(values.quantity)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['quantity'],
          message: t('items.validation.quantityRequired', 'ต้องระบุจำนวน'),
        });
      }

      if (!values.unit?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['unit'],
          message: t('items.validation.unitRequired', 'ต้องระบุหน่วย'),
        });
      }

      if (!values.baseUnit?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['baseUnit'],
          message: t('items.validation.baseUnitRequired', 'ต้องระบุ base unit'),
        });
      }
    }
  });
}

export interface CreateItemValues {
  name: string;
  kind: 'single' | 'stock';
  usageType: 'consumable' | 'returnable';
  code?: string | null;
  photoUrl?: string | null;
  description?: string | null;
  containerId: string;
  quantity?: number | null;
  unit?: string | null;
  baseUnit?: string | null;
  lotCode?: string | null;
  receivedDate?: string | null;
  expiryDate?: string | null;
  warrantyEndDate?: string | null;
  maintenanceNextDueDate?: string | null;
  reorderPoint?: number | null;
}
