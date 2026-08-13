export interface ProductFormDataInput {
  name: string;
  trackingType: string;
  description?: string | null;
  categoryId?: string | null;
  unitCode?: string | null;
  code?: string | null;
  sku?: string | null;
  minStockAlert?: number | null;
  expiryLeadDaysDefault?: number | null;
  image?: File | null;
}

export function buildProductFormData(input: ProductFormDataInput): FormData {
  const formData = new FormData();
  formData.append('name', input.name);
  formData.append('trackingType', input.trackingType);

  const optionalFields = {
    description: input.description,
    categoryId: input.categoryId,
    unitCode: input.unitCode,
    code: input.code,
    sku: input.sku,
    minStockAlert: input.minStockAlert,
    expiryLeadDaysDefault: input.expiryLeadDaysDefault,
  } as const;

  for (const [field, value] of Object.entries(optionalFields)) {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(field, String(value));
    }
  }

  if (input.image) {
    formData.append('image', input.image);
  }

  return formData;
}
