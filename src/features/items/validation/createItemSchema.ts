import { z } from 'zod';

type TranslateFn = (key: string, fallback: string) => string;

export function createItemSchema(t: TranslateFn) {
  return z.object({
    productId: z.string().min(1, t('items.validation.productRequired', 'ต้องเลือกสินค้า')),
    siteId: z.string().min(1, t('items.validation.siteRequired', 'ต้องเลือก site')),
    locationId: z.string().min(1, t('items.validation.locationRequired', 'ต้องเลือก location')),
    containerId: z.string().optional().nullable(),
    serialNumber: z.string().max(128, t('items.validation.serialTooLong', 'Serial number ยาวเกินไป')).optional().nullable(),
    barcode: z.string().max(128, t('items.validation.barcodeTooLong', 'Barcode ยาวเกินไป')).optional().nullable(),
    condition: z.string().optional().nullable(),
    notes: z.string().max(512, t('items.validation.notesTooLong', 'หมายเหตุยาวเกินไป')).optional().nullable(),
    acquiredDate: z.string().optional().nullable(),
  });
}

export interface CreateItemValues {
  productId: string;
  siteId: string;
  locationId: string;
  containerId?: string | null;
  serialNumber?: string | null;
  barcode?: string | null;
  condition?: string | null;
  notes?: string | null;
  acquiredDate?: string | null;
}
